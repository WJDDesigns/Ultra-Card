import type {
  PresetDefinition,
  SmartConnectorStatus,
  SmartGenerateRequest,
  SmartGenerateResponse,
} from '../types';
import {
  getRegistryAiInstructionLines,
  getRegistryCatalogLines,
  getRegistryKeywordLines,
} from './smart/uc-smart-module-registry';
import { correctSmartAiPlan } from './smart/uc-smart-plan-corrector';
import { promptWantsTextContent } from './uc-smart-module-capabilities';
import { getCompositionCatalogLines } from './uc-smart-composition-planner';
import {
  buildComposedEntityModules,
  buildStatusSummaryFallback,
  deriveTitleFromPrompt,
  entityName,
  sanitizeSmartLayout,
  sanitizeSmartModules,
  selectEntitiesForPrompt,
  type SmartSanitizeContext,
} from './uc-smart-module-sanitizer';

const HA_SMART_STATUS_PATH = 'ultra_card_pro_cloud/smart/connectors/status';
const HA_SMART_GENERATE_PATH = 'ultra_card_pro_cloud/smart/generate';

type HassApiClient = {
  callApi?: (
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: Record<string, unknown>
  ) => Promise<unknown>;
  callWS?: (msg: { type: string } & Record<string, unknown>) => Promise<unknown>;
  services?: Record<string, Record<string, unknown> | undefined>;
  states?: Record<string, unknown>;
};

type SmartAiPlan = {
  name?: unknown;
  description?: unknown;
  modules?: unknown;
  layout?: unknown;
  cardSettings?: unknown;
};

class UcSmartCardsService {
  async getConnectorStatus(hass: HassApiClient): Promise<SmartConnectorStatus> {
    if (hass?.callApi) {
      try {
        const result = await hass.callApi('GET', HA_SMART_STATUS_PATH);
        return this._normalizeConnectorStatus(result, hass);
      } catch (_err) {
        // Older integrations may not expose Smart yet; show the HA Assist setup state.
      }
    }

    return this._normalizeConnectorStatus({}, hass);
  }

  async generatePreset(
    hass: HassApiClient,
    request: SmartGenerateRequest
  ): Promise<SmartGenerateResponse> {
    if (hass?.callApi) {
      try {
        const result = await hass.callApi(
          'POST',
          HA_SMART_GENERATE_PATH,
          request as unknown as Record<string, unknown>
        );
        return this._normalizeGenerateResponse(result);
      } catch (err: unknown) {
        const errObj = err as {
          status?: number;
          status_code?: number;
          response?: { status?: number };
          body?: unknown;
          message?: string;
        };
        const status = errObj.status ?? errObj.status_code ?? errObj.response?.status;
        if (status && status !== 404) {
          const bodyError =
            errObj.body && typeof errObj.body === 'object' && 'error' in (errObj.body as Record<string, unknown>)
              ? String((errObj.body as Record<string, unknown>).error)
              : null;
          const error = new Error(
            bodyError && bodyError.length > 0
              ? bodyError
              : errObj.message || `Smart generation failed (${status})`
          );
          (error as Error & { cause?: unknown }).cause = err;
          throw error;
        }
        // 404 means the installed integration does not have the HA Assist Smart endpoint yet.
      }
    }

    return this._generateViaNativeAssist(hass, request);
  }

  getPresetCandidates(result: SmartGenerateResponse): PresetDefinition[] {
    const candidates: PresetDefinition[] = [];
    const addPreset = (value: unknown, index: number) => {
      const normalized = this._normalizePreset(value, index);
      if (normalized) candidates.push(normalized);
    };

    if (result.smart_preset) addPreset(result.smart_preset, 0);
    if (Array.isArray(result.presets)) {
      result.presets.forEach((preset, index) => addPreset(preset, index + 1));
    }
    return candidates;
  }

  private _normalizeConnectorStatus(raw: unknown, hass?: HassApiClient): SmartConnectorStatus {
    const rawObj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
    const available =
      rawObj.available && typeof rawObj.available === 'object'
        ? (rawObj.available as Record<string, unknown>)
        : {};
    const frontendAssistAvailable = this._hasFrontendAssist(hass);
    return {
      available: {
        ha_assist: !!available.ha_assist || frontendAssistAvailable,
        user_provider: !!available.user_provider,
        cloud_default: !!available.cloud_default,
      },
      default_connector: this._normalizeConnector(rawObj.default_connector),
      ...(rawObj.ha && typeof rawObj.ha === 'object'
        ? { ha: rawObj.ha as SmartConnectorStatus['ha'] }
        : {}),
      ...((rawObj.limits && typeof rawObj.limits === 'object')
        ? { limits: rawObj.limits as SmartConnectorStatus['limits'] }
        : {}),
      ...((rawObj.tier_access && typeof rawObj.tier_access === 'object')
        ? {
            tier_access: {
              can_generate_free: !!(rawObj.tier_access as Record<string, unknown>).can_generate_free,
              can_generate_pro: !!(rawObj.tier_access as Record<string, unknown>).can_generate_pro,
              is_pro_user: !!(rawObj.tier_access as Record<string, unknown>).is_pro_user,
              free_daily_generations:
                typeof (rawObj.tier_access as Record<string, unknown>).free_daily_generations === 'number'
                  ? ((rawObj.tier_access as Record<string, unknown>)
                      .free_daily_generations as number)
                  : null,
              free_remaining:
                typeof (rawObj.tier_access as Record<string, unknown>).free_remaining === 'number'
                  ? ((rawObj.tier_access as Record<string, unknown>).free_remaining as number)
                  : null,
            } as SmartConnectorStatus['tier_access'],
          }
        : {}),
      ...(Array.isArray(rawObj.warnings)
        ? { warnings: rawObj.warnings.map((warning: unknown) => String(warning)) }
        : {}),
    } as SmartConnectorStatus;
  }

  private _hasFrontendAssist(hass?: HassApiClient): boolean {
    if (!hass) return false;
    if (hass.services?.conversation?.process) return true;
    return Object.keys(hass.states || {}).some(
      entityId => entityId.startsWith('conversation.') || entityId.startsWith('ai_task.')
    );
  }
  private async _generateViaNativeAssist(
    hass: HassApiClient,
    request: SmartGenerateRequest
  ): Promise<SmartGenerateResponse> {
    if (!hass?.callWS) {
      throw new Error('Home Assistant Assist is unavailable from this dashboard session.');
    }

    const aiPlan = await this._requestAiDesignPlan(hass, request);
    const structuredPreset = this._buildPresetFromAiPlan(hass, request, aiPlan);
    if (structuredPreset) return structuredPreset;

    const assistText = this._extractAssistText(aiPlan);
    return this._buildAssistPresetResponse(hass, request, assistText);
  }

  private async _requestAiDesignPlan(
    hass: HassApiClient,
    request: SmartGenerateRequest
  ): Promise<unknown> {
    const instructions = this._buildDesignInstructions(hass, request);
    if (this._hasAiTask(hass)) {
      const serviceData: Record<string, unknown> = {
        task_name: 'Ultra Card Smart preset design',
        instructions,
      };
      const aiTaskEntityId = this._getAiTaskEntityId(hass);
      if (aiTaskEntityId) serviceData.entity_id = aiTaskEntityId;

      const result = await hass.callWS?.({
        type: 'call_service',
        domain: 'ai_task',
        service: 'generate_data',
        service_data: serviceData,
        return_response: true,
      });
      return this._extractAiTaskData(result);
    }

    const serviceData: Record<string, unknown> = { text: instructions };
    const agentId = this._getConversationAgentId(hass);
    if (agentId) serviceData.agent_id = agentId;

    const result = await hass.callWS?.({
      type: 'call_service',
      domain: 'conversation',
      service: 'process',
      service_data: serviceData,
      return_response: true,
    });
    return this._extractAiTaskData(result);
  }

  private _buildDesignInstructions(hass: HassApiClient, request: SmartGenerateRequest): string {
    const entitiesByDomain = this._groupEntityInventory(hass);
    const entityLines = Object.entries(entitiesByDomain)
      .map(([domain, entities]) => {
        const lines = entities
          .slice(0, 20)
          .map(entity => `  - ${entity.entityId} (${entity.name})`)
          .join('\n');
        return `${domain}:\n${lines}`;
      })
      .join('\n');
    const catalog = getRegistryCatalogLines(request.tier).join('\n');
    const keywordCatalog = getRegistryKeywordLines(request.tier).join('\n');
    const moduleInstructionLines = getRegistryAiInstructionLines(request.tier).join('\n');
    const compositionCatalog = getCompositionCatalogLines().join('\n');

    return [
      'You are generating a Home Assistant Ultra Card preset plan.',
      'Do not control Home Assistant, do not resolve areas, and do not treat style words as area names.',
      'Use only Ultra Card module types listed below and only entity IDs from the inventory.',
      'Return ONLY valid JSON. No markdown fences, no prose, no commentary.',
      'Required JSON shape:',
      '{"name":"short title","description":"one sentence","layout":{"rows":[{"id":"row-1","column_layout":"1-col","columns":[{"id":"col-1","modules":[...]}]}]}}',
      'Each module must include a valid Ultra Card type and only supported fields for that type.',
      'Think in ordered sections from the user prompt, then map each section to a layout recipe:',
      compositionCatalog,
      'Use horizontal/vertical/grid containers to compose sections instead of one repeated flat list.',
      'Layout words matter: grid, list, top, below that, beside, buttons, gauge, and large text change structure.',
      'For weather headers with large temperature text, use horizontal(icon + info) and set info.text_size to 32-40 with attribute temperature.',
      'For "show N lights", prefer a grid module with exactly N light entities instead of repeated icon/info rows.',
      'For fuel, tank, or car level prompts, prefer bar when the user says bar/progress bar and gauge when they say gauge.',
      'If the user names a module type explicitly, use that exact module type.',
      'Prefer domain-specific modules (light, lock, cover, fan, climate, media_player) over generic info rows when the user asks for controls.',
      'For status/detail prompts, use icon plus info rows for brightness, color, temperature, or state.',
      'Do not use markdown unless the user explicitly asks for notes, instructions, or formatted text.',
      request.tier === 'free'
        ? 'Free tier: do not use Pro-only modules such as animated_weather, climate, calendar, or vacuum.'
        : 'Pro tier: Pro modules are allowed when they fit the request.',
      `User request: ${request.prompt}`,
      `Requested style: ${request.constraints?.style || 'clean'}`,
      `Tier: ${request.tier}`,
      'Ultra Card module capabilities:',
      catalog,
      'Complete registered module reference (fields, domains, examples):',
      moduleInstructionLines,
      'Module keyword intent map (includes library-only references; output only supported modules):',
      keywordCatalog,
      'Entity inventory grouped by domain:',
      entityLines || '(no entities available)',
    ].join('\n');
  }

  private _groupEntityInventory(hass: HassApiClient): Record<string, Array<{ entityId: string; name: string }>> {
    const grouped: Record<string, Array<{ entityId: string; name: string }>> = {};
    for (const entity of this._getEntityInventory(hass)) {
      if (!grouped[entity.domain]) grouped[entity.domain] = [];
      grouped[entity.domain].push({ entityId: entity.entityId, name: entity.name });
    }
    return grouped;
  }

  private _sanitizeContext(request: SmartGenerateRequest): SmartSanitizeContext {
    return {
      tier: request.tier,
      prompt: request.prompt,
      allowProModules: request.constraints?.allow_pro_modules ?? request.tier === 'pro',
    };
  }

  private _hasAiTask(hass?: HassApiClient): boolean {
    if (!hass) return false;
    if (hass.services?.ai_task?.generate_data) return true;
    return Object.keys(hass.states || {}).some(entityId => entityId.startsWith('ai_task.'));
  }

  private _getAiTaskEntityId(hass?: HassApiClient): string | null {
    const entityIds = Object.keys(hass?.states || {}).filter(entityId =>
      entityId.startsWith('ai_task.')
    );
    return entityIds[0] || null;
  }

  private _getConversationAgentId(hass?: HassApiClient): string | null {
    const entityIds = Object.keys(hass?.states || {}).filter(entityId =>
      entityId.startsWith('conversation.')
    );
    return entityIds[0] || null;
  }

  private _extractAssistText(value: unknown): string | null {
    if (typeof value === 'string') {
      const text = value.trim();
      return text.length > 0 ? text : null;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        const text = this._extractAssistText(item);
        if (text) return text;
      }
      return null;
    }
    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const preferred = [obj.speech, obj.text, obj.response, obj.plain];
      for (const item of preferred) {
        const text = this._extractAssistText(item);
        if (text) return text;
      }
      for (const item of Object.values(obj)) {
        const text = this._extractAssistText(item);
        if (text) return text;
      }
    }
    return null;
  }

  private _extractAiTaskData(value: unknown): unknown {
    if (value && typeof value === 'object' && 'data' in value) {
      return (value as Record<string, unknown>).data;
    }
    return value;
  }

  private _buildPresetFromAiPlan(
    hass: HassApiClient,
    request: SmartGenerateRequest,
    rawPlan: unknown
  ): SmartGenerateResponse | null {
    const plan = this._coerceAiPlan(rawPlan);
    if (!plan) return null;

    const context = this._sanitizeContext(request);
    const { plan: correctedPlan, warnings } = correctSmartAiPlan(
      plan,
      request.prompt,
      request.tier,
      hass,
      context
    );

    const now = new Date().toISOString();
    const id = `smart-assist-${Date.now()}`;

    let layout: PresetDefinition['layout'] | null = null;
    if (correctedPlan.layout && typeof correctedPlan.layout === 'object') {
      layout = sanitizeSmartLayout(hass, correctedPlan.layout, context, id);
    }

    if (!layout && Array.isArray(correctedPlan.modules)) {
      const modules = sanitizeSmartModules(correctedPlan.modules, hass, context, `${id}-ai`);
      if (modules.length) {
        layout = {
          rows: [
            {
              id: `${id}-row`,
              column_layout: '1-col',
              columns: [{ id: `${id}-col`, modules }],
            },
          ],
        } as PresetDefinition['layout'];
      }
    }

    if (!layout?.rows?.length) return null;

    const entities = selectEntitiesForPrompt(hass, request.prompt);
    const promptTitle = deriveTitleFromPrompt(request.prompt, entities);
    const name =
      typeof correctedPlan.name === 'string' && correctedPlan.name.trim()
        ? correctedPlan.name.trim().slice(0, 80)
        : promptTitle || 'Smart Card';
    const description =
      typeof correctedPlan.description === 'string' && correctedPlan.description.trim()
        ? correctedPlan.description.trim().slice(0, 180)
        : 'Generated from Home Assistant AI using Ultra Card modules.';

    return {
      smart_preset: {
        id,
        name,
        description,
        category: 'layouts',
        icon: 'mdi:brain',
        author: 'Home Assistant Assist',
        version: '1.0.0',
        tags: ['smart', 'assist', request.tier],
        layout,
        ...(correctedPlan.cardSettings && typeof correctedPlan.cardSettings === 'object'
          ? { cardSettings: correctedPlan.cardSettings as PresetDefinition['cardSettings'] }
          : {}),
        metadata: {
          created: now,
          updated: now,
        },
      } as PresetDefinition,
      generation: {
        connector_used: 'ha_assist',
        tier_required: request.tier,
        fallback: false,
        ...(warnings.length ? { warnings } : {}),
      },
    };
  }

  private _coerceAiPlan(raw: unknown): SmartAiPlan | null {
    if (!raw) return null;
    if (typeof raw === 'object') return raw as SmartAiPlan;
    if (typeof raw !== 'string') return null;

    const trimmed = raw.trim();
    if (!trimmed) return null;
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed && typeof parsed === 'object' ? (parsed as SmartAiPlan) : null;
    } catch (_err) {
      return null;
    }
  }

  private _buildAssistPresetResponse(
    hass: HassApiClient,
    request: SmartGenerateRequest,
    assistText: string | null
  ): SmartGenerateResponse {
    const now = new Date().toISOString();
    const context = this._sanitizeContext(request);
    const entities = selectEntitiesForPrompt(hass, request.prompt);
    const title =
      deriveTitleFromPrompt(request.prompt, entities) ||
      assistText?.replace(/\s+/g, ' ').trim().split(/[.\n]/)[0]?.slice(0, 42) ||
      'Smart Card';
    const description = this._deriveDescriptionFromPrompt(request.prompt, entities, assistText);
    const id = `smart-assist-${Date.now()}`;
    const style = request.constraints?.style || 'clean';
    const modules =
      entities.length > 0
        ? (buildComposedEntityModules(id, entities, style, hass, context) as unknown as PresetDefinition['layout']['rows'][number]['columns'][number]['modules'])
        : this._buildFallbackModules(id, title, request, assistText, hass);

    return {
      smart_preset: {
        id,
        name: title,
        description,
        category: 'layouts',
        icon: 'mdi:brain',
        author: 'Home Assistant Assist',
        version: '1.0.0',
        tags: ['smart', 'assist', request.tier],
        layout: {
          rows: [
            {
              id: `${id}-row`,
              column_layout: '1-col',
              columns: [
                {
                  id: `${id}-col`,
                  modules,
                },
              ],
            },
          ],
        },
        metadata: {
          created: now,
          updated: now,
        },
      } as PresetDefinition,
      generation: {
        connector_used: 'ha_assist',
        tier_required: request.tier,
        fallback: true,
      },
    };
  }

  private _buildFallbackModules(
    id: string,
    title: string,
    request: SmartGenerateRequest,
    assistText: string | null,
    hass: HassApiClient
  ): PresetDefinition['layout']['rows'][number]['columns'][number]['modules'] {
    if (promptWantsTextContent(request.prompt)) {
      return [
        {
          id: `${id}-title`,
          type: 'text',
          text: title,
          font_size: 20,
          font_weight: '700',
          alignment: 'left',
        },
        {
          id: `${id}-body`,
          type: 'markdown',
          content: assistText || request.prompt,
        },
      ] as unknown as PresetDefinition['layout']['rows'][number]['columns'][number]['modules'];
    }

    const inventory = this._getEntityInventory(hass).slice(0, 8);
    if (inventory.length) {
      return [
        buildStatusSummaryFallback(
          `${id}-summary`,
          inventory.map(entity => entity.entityId),
          hass,
          title
        ),
      ] as unknown as PresetDefinition['layout']['rows'][number]['columns'][number]['modules'];
    }

    return [
      {
        id: `${id}-title`,
        type: 'text',
        text: title,
        font_size: 20,
        font_weight: '700',
        alignment: 'left',
      },
    ] as unknown as PresetDefinition['layout']['rows'][number]['columns'][number]['modules'];
  }

  private _deriveDescriptionFromPrompt(
    prompt: string,
    entities: Array<{ domain: string; entityId: string }>,
    assistText: string | null
  ): string {
    if (entities.length) {
      const domains = Array.from(new Set(entities.map(entity => entity.domain)));
      return `Shows ${entities.length} ${domains.join(', ')} ${entities.length === 1 ? 'entity' : 'entities'} from Home Assistant.`;
    }
    return (
      assistText?.replace(/\s+/g, ' ').trim().slice(0, 160) ||
      prompt.replace(/\s+/g, ' ').trim().slice(0, 160) ||
      'Assist generated starter preset'
    );
  }

  private _getEntityInventory(hass: HassApiClient): Array<{ entityId: string; name: string; domain: string }> {
    return Object.entries(hass.states || {})
      .filter(
        ([entityId]) =>
          entityId.includes('.') &&
          !entityId.startsWith('conversation.') &&
          !entityId.startsWith('ai_task.')
      )
      .map(([entityId, state]) => ({
        entityId,
        name: entityName(hass, entityId, state),
        domain: entityId.split('.')[0],
      }));
  }

  private _normalizeGenerateResponse(raw: unknown): SmartGenerateResponse {
    const normalized: SmartGenerateResponse = {};
    if (raw && typeof raw === 'object') {
      const rawObj = raw as Record<string, unknown>;
      if (rawObj.smart_preset) normalized.smart_preset = rawObj.smart_preset as PresetDefinition;
      if (Array.isArray(rawObj.presets)) normalized.presets = rawObj.presets as PresetDefinition[];
      if (rawObj.generation && typeof rawObj.generation === 'object') {
        const generation = rawObj.generation as Record<string, unknown>;
        normalized.generation = {
          connector_used:
            typeof generation.connector_used === 'string' ? generation.connector_used : undefined,
          tier_required:
            generation.tier_required === 'free' || generation.tier_required === 'pro'
              ? generation.tier_required
              : undefined,
          warnings: Array.isArray(generation.warnings)
            ? generation.warnings.map((warning: unknown) => String(warning))
            : undefined,
          fallback: !!generation.fallback,
        };
      }
      if (rawObj.tier_access && typeof rawObj.tier_access === 'object') {
        const tierAccess = rawObj.tier_access as Record<string, unknown>;
        normalized.tier_access = {
          can_generate_free: !!tierAccess.can_generate_free,
          can_generate_pro: !!tierAccess.can_generate_pro,
          is_pro_user: !!tierAccess.is_pro_user,
          free_daily_generations:
            typeof tierAccess.free_daily_generations === 'number'
              ? tierAccess.free_daily_generations
              : null,
          free_remaining:
            typeof tierAccess.free_remaining === 'number' ? tierAccess.free_remaining : null,
        };
      }
      if (rawObj.limits && typeof rawObj.limits === 'object') {
        const limits = rawObj.limits as Record<string, unknown>;
        normalized.limits = {
          free_daily_generations:
            typeof limits.free_daily_generations === 'number'
              ? limits.free_daily_generations
              : null,
          free_remaining:
            typeof limits.free_remaining === 'number' ? limits.free_remaining : null,
          pro_unlimited: !!limits.pro_unlimited,
        };
      }
      if (rawObj.error) normalized.error = String(rawObj.error);
    }
    return normalized;
  }

  private _normalizeConnector(value: unknown): SmartConnectorStatus['default_connector'] {
    const normalized = String(value || '').toLowerCase();
    if (
      normalized === 'ha_assist' ||
      normalized === 'user_provider' ||
      normalized === 'cloud_default'
    ) {
      return normalized;
    }
    return 'auto';
  }

  private _normalizePreset(raw: unknown, index: number): PresetDefinition | null {
    if (!raw || typeof raw !== 'object') return null;
    const candidate = raw as Record<string, unknown>;
    const layout = candidate.layout as { rows?: unknown[] } | undefined;
    if (!layout || typeof layout !== 'object' || !Array.isArray(layout.rows) || layout.rows.length === 0) {
      return null;
    }

    const now = new Date().toISOString();
    const categoryRaw = String(candidate.category || 'layouts').toLowerCase();
    const category: PresetDefinition['category'] =
      categoryRaw === 'badges' ||
      categoryRaw === 'layouts' ||
      categoryRaw === 'widgets' ||
      categoryRaw === 'custom'
        ? categoryRaw
        : 'custom';

    return {
      id: String(candidate.id || `smart-${Date.now()}-${index}`),
      name: String(candidate.name || `Smart Preset ${index + 1}`),
      description: String(candidate.description || 'AI generated preset'),
      category,
      icon: String(candidate.icon || 'mdi:brain'),
      author: String(candidate.author || 'Ultra Card AI'),
      version: String(candidate.version || '1.0.0'),
      tags: Array.isArray(candidate.tags)
        ? candidate.tags.map((tag: unknown) => String(tag))
        : ['smart', 'ai'],
      layout: layout as PresetDefinition['layout'],
      ...(Array.isArray(candidate.customVariables)
        ? { customVariables: candidate.customVariables as PresetDefinition['customVariables'] }
        : {}),
      ...(candidate.wizard && typeof candidate.wizard === 'object'
        ? { wizard: candidate.wizard as PresetDefinition['wizard'] }
        : {}),
      ...(candidate.cardSettings && typeof candidate.cardSettings === 'object'
        ? { cardSettings: candidate.cardSettings as PresetDefinition['cardSettings'] }
        : {}),
      metadata: {
        created:
          candidate.metadata && typeof candidate.metadata === 'object'
            ? String((candidate.metadata as Record<string, unknown>).created || now)
            : now,
        updated:
          candidate.metadata && typeof candidate.metadata === 'object'
            ? String((candidate.metadata as Record<string, unknown>).updated || now)
            : now,
        downloads:
          candidate.metadata &&
          typeof candidate.metadata === 'object' &&
          typeof (candidate.metadata as Record<string, unknown>).downloads === 'number'
            ? ((candidate.metadata as Record<string, unknown>).downloads as number)
            : undefined,
        rating:
          candidate.metadata &&
          typeof candidate.metadata === 'object' &&
          typeof (candidate.metadata as Record<string, unknown>).rating === 'number'
            ? ((candidate.metadata as Record<string, unknown>).rating as number)
            : undefined,
      },
    } as PresetDefinition;
  }
}

export const ucSmartCardsService = new UcSmartCardsService();
