import type {
  PresetDefinition,
  SmartAiProvider,
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
import { applySmartLayoutDesign } from './smart/uc-smart-layout-design';
import { hydrateSmartLayoutModules } from './smart/uc-smart-module-defaults';
import {
  buildSmartEntityContext,
  extractAreaHints,
  rankSmartEntities,
  type SmartEntityRecord,
} from './smart/uc-smart-entity-context';
import { inferEntityTargetsFromPrompt, promptWantsTextContent } from './uc-smart-module-capabilities';
import { getCompositionCatalogLines } from './uc-smart-composition-planner';
import {
  collectLayoutEntityIds,
  composeSmartCardModules,
  enhanceSmartPresetLayout,
  hasStructuredComposerPlan,
  sanitizeCloudSmartPreset,
} from './uc-smart-card-composer';
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
import { createOutdatedConnectError, getConnectInfo, hasCapability } from './uc-connect-compatibility';

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

  /** Whether Connect reports a paid cloud designer (per-user provider or Ultra Card's default). */
  private async _cloudDesignerAvailable(hass: HassApiClient): Promise<boolean> {
    if (!hass?.callApi) return false;
    const status = await this.getConnectorStatus(hass);
    return !!status.available.user_provider || !!status.available.cloud_default;
  }

  async generatePreset(
    hass: HassApiClient,
    request: SmartGenerateRequest
  ): Promise<SmartGenerateResponse> {
    const response = await this._generatePreset(hass, request);
    // Modules need their full default shape before the card can render them;
    // a missing nested settings block throws inside renderPreview and leaves
    // the preview stuck on the loading skeleton.
    const presets = [response.smart_preset, ...(response.presets || [])].filter(
      (preset): preset is PresetDefinition => !!preset
    );
    for (const preset of presets) applySmartLayoutDesign(preset.layout);
    await Promise.all(presets.map(preset => hydrateSmartLayoutModules(preset.layout, hass)));
    return response;
  }

  private async _generatePreset(
    hass: HassApiClient,
    request: SmartGenerateRequest
  ): Promise<SmartGenerateResponse> {
    // Generation on the user's own Home Assistant AI (or the local composer) costs nothing,
    // so it is unlimited and never touches Connect's quota. Only a cloud designer, which
    // does cost money per call, goes through Connect.
    if (this.hasAiProvider(hass) || !(await this._cloudDesignerAvailable(hass))) {
      return this._generateViaNativeAssist(hass, request);
    }

    if (hass?.callApi) {
      try {
        // Connect installed but too old / missing smart capability → do not silently
        // fall back to Assist; tell the user to update.
        const connect = getConnectInfo(hass);
        if (connect.installed && (connect.outdated || !hasCapability(hass, 'smart'))) {
          const outdatedErr = createOutdatedConnectError(hass, 'Smart Cards');
          if (outdatedErr) throw outdatedErr;
          throw new Error(
            'Smart Cards require an updated Ultra Card Connect integration. Please update Connect and try again.'
          );
        }

        const result = await hass.callApi(
          'POST',
          HA_SMART_GENERATE_PATH,
          request as unknown as Record<string, unknown>
        );
        const normalized = this._normalizeGenerateResponse(result, hass, request);
        if (!this._isConnectAssistStub(result)) {
          return normalized;
        }
        // Connect only ran the built-in Assist agent and wrapped its speech in a
        // text/markdown starter. That agent cannot design cards, so build the
        // layout here (AI provider if one is connected, otherwise the local
        // composer) and keep Connect's quota bookkeeping.
        const native = await this._generateViaNativeAssist(hass, request);
        return {
          ...native,
          ...(normalized.limits ? { limits: normalized.limits } : {}),
          ...(normalized.tier_access ? { tier_access: normalized.tier_access } : {}),
          generation: {
            ...(native.generation || {}),
            warnings: [
              ...(native.generation?.warnings || []),
              ...(normalized.generation?.warnings || []).filter(
                warning => !/now use Home Assistant Assist/i.test(warning)
              ),
            ],
          },
        };
      } catch (err: unknown) {
        const errObj = err as {
          status?: number;
          status_code?: number;
          response?: { status?: number };
          body?: unknown;
          message?: string;
          code?: string;
        };
        if (errObj.code === 'connect_outdated') {
          throw err;
        }
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

        // 404 with Connect installed (unexpected on current builds) → outdated messaging
        const connect = getConnectInfo(hass);
        if (connect.installed && status === 404) {
          const outdatedErr = createOutdatedConnectError(hass, 'Smart Cards');
          throw (
            outdatedErr ||
            new Error(
              'Smart Cards endpoint is missing. Please update Ultra Card Connect and try again.'
            )
          );
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
    // Connect reports `ha_assist` whenever `conversation.process` exists, which is
    // always true, but the built-in agent cannot design a card. When we can see
    // hass, decide from the actual AI providers instead.
    const aiAvailable = hass ? this.hasAiProvider(hass) : !!available.ha_assist;
    const statusWarnings = Array.isArray(rawObj.warnings)
      ? rawObj.warnings
          .map((warning: unknown) => String(warning))
          .filter(warning => !/Assist is not configured/i.test(warning))
      : [];
    const cloudDesigner = !!available.user_provider || !!available.cloud_default;
    // Quotas only exist for the paid cloud designer. A user's own HA AI and the local
    // composer are free to run, so no limit applies (or is shown) when they are in use.
    const quotaApplies = cloudDesigner && !aiAvailable;
    return {
      available: {
        ha_assist: aiAvailable,
        user_provider: !!available.user_provider,
        cloud_default: !!available.cloud_default,
      },
      default_connector: this._normalizeConnector(rawObj.default_connector),
      ...(rawObj.ha && typeof rawObj.ha === 'object'
        ? { ha: rawObj.ha as SmartConnectorStatus['ha'] }
        : {}),
      ...((quotaApplies && rawObj.limits && typeof rawObj.limits === 'object')
        ? { limits: rawObj.limits as SmartConnectorStatus['limits'] }
        : {}),
      ...((quotaApplies && rawObj.tier_access && typeof rawObj.tier_access === 'object')
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
      ...(statusWarnings.length ? { warnings: statusWarnings } : {}),
    } as SmartConnectorStatus;
  }

  /**
   * True when Home Assistant has an AI that can design a layout: an AI Task entity or an LLM
   * conversation agent. The built-in `conversation.home_assistant` agent only matches device
   * intents ("turn on the lights"), so it does not count.
   */
  hasAiProvider(hass?: HassApiClient): boolean {
    return this.listAiProviders(hass).length > 0;
  }

  /**
   * Every AI in this Home Assistant that can design a layout, AI Task entities first.
   * The built-in `conversation.home_assistant` agent is excluded: it only matches device
   * intents and cannot write JSON.
   */
  listAiProviders(hass?: HassApiClient): SmartAiProvider[] {
    const states = (hass?.states || {}) as Record<string, { attributes?: { friendly_name?: unknown } }>;
    const providers: SmartAiProvider[] = [];
    for (const kind of ['ai_task', 'conversation'] as const) {
      for (const entityId of Object.keys(states)) {
        if (!entityId.startsWith(`${kind}.`) || entityId === 'conversation.home_assistant') continue;
        const friendly = states[entityId]?.attributes?.friendly_name;
        providers.push({
          id: entityId,
          name: typeof friendly === 'string' && friendly.trim() ? friendly.trim() : entityName(hass as never, entityId),
          kind,
        });
      }
    }
    return providers;
  }

  /** The provider a request will use: the requested one when it exists, else the first available. */
  resolveAiProvider(hass?: HassApiClient, requestedId?: string | null): SmartAiProvider | null {
    const providers = this.listAiProviders(hass);
    if (!providers.length) return null;
    return providers.find(provider => provider.id === requestedId) || providers[0] || null;
  }

  /**
   * Ultra Card Connect's `smart/generate` endpoint (without a cloud designer)
   * runs the built-in Assist conversation agent and returns its speech wrapped
   * in a text + markdown starter preset authored "Home Assistant Assist".
   */
  private _isConnectAssistStub(raw: unknown): boolean {
    if (!raw || typeof raw !== 'object') return false;
    const preset = (raw as { smart_preset?: unknown }).smart_preset;
    if (!preset || typeof preset !== 'object') return false;
    const { author, id, tags } = preset as { author?: unknown; id?: unknown; tags?: unknown };
    if (author === 'Home Assistant Assist') return true;
    return (
      typeof id === 'string' &&
      id.startsWith('smart-local-') &&
      Array.isArray(tags) &&
      tags.includes('assist')
    );
  }

  private async _generateViaNativeAssist(
    hass: HassApiClient,
    request: SmartGenerateRequest
  ): Promise<SmartGenerateResponse> {
    if (!hass?.callWS || !this.hasAiProvider(hass)) {
      return this._buildAssistPresetResponse(hass, request, [
        'No AI is connected to Home Assistant (AI Task or an LLM conversation agent), so this card was built by the local composer from your entities.',
      ]);
    }

    const aiPlan = await this._requestAiDesignPlan(hass, request);
    const structuredPreset = this._buildPresetFromAiPlan(hass, request, aiPlan);
    if (structuredPreset) return structuredPreset;

    const assistText = this._extractAssistText(aiPlan);
    return this._buildAssistPresetResponse(hass, request, [
      assistText
        ? `The AI reply was not a usable layout plan ("${assistText.replace(/\s+/g, ' ').trim().slice(0, 80)}"), so this card was built by the local composer from your entities.`
        : 'The AI returned no layout plan, so this card was built by the local composer from your entities.',
    ]);
  }

  private async _requestAiDesignPlan(
    hass: HassApiClient,
    request: SmartGenerateRequest
  ): Promise<unknown> {
    const provider = this.resolveAiProvider(hass, request.ai_provider);
    if (!provider) return null;
    const instructions = this._buildDesignInstructions(hass, request);

    if (provider.kind === 'ai_task') {
      const result = await hass.callWS?.({
        type: 'call_service',
        domain: 'ai_task',
        service: 'generate_data',
        service_data: {
          task_name: 'Ultra Card Smart preset design',
          instructions,
          entity_id: provider.id,
        },
        return_response: true,
      });
      return this._extractAiTaskData(result);
    }

    const result = await hass.callWS?.({
      type: 'call_service',
      domain: 'conversation',
      service: 'process',
      service_data: { text: instructions, agent_id: provider.id },
      return_response: true,
    });
    return this._extractAiTaskData(result);
  }

  private _buildDesignInstructions(hass: HassApiClient, request: SmartGenerateRequest): string {
    const inventory = this._buildRankedInventory(hass, request.prompt);
    const entityLines = inventory.lines.join('\n');
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
      'Build ordered card sections from the prompt: top summary row, then controls/lists below. Do not add separator modules unless the user asks for dividers; sections are spaced automatically.',
      'For clock and weather together, use moduleRow with clock beside weather/animated_weather, then stack light or control sections below.',
      'Example: "clock and weather card with lights below" => horizontal(clock + weather) then vertical light status rows or light controls.',
      'Example: room dashboard => area_summary or grouped vertical sections.',
      'Example: media + lights => horizontal(media_player + light controls) or stacked sections.',
      'Layout words matter: grid, list, top, below that, beside, buttons, gauge, and large text change structure.',
      'For weather headers with large temperature text, use horizontal(icon + info) and set info.text_size to 32-40 with attribute temperature.',
      'For "show N lights", prefer a grid module with exactly N light entities instead of repeated icon/info rows.',
      'For fuel, tank, or car level prompts, prefer bar when the user says bar/progress bar and gauge when they say gauge.',
      'If the user names a module type explicitly, use that exact module type.',
      'Prefer domain-specific modules (light, lock, cover, fan, climate, media_player) over generic info rows when the user asks for controls.',
      'For status/detail prompts, use icon plus info rows for brightness, color, temperature, or state.',
      'Do not use markdown unless the user explicitly asks for notes, instructions, or formatted text.',
      'Never answer with a text or markdown module that repeats or replies to the request. The request is a card description, not a question: every module must show or control entities from the inventory.',
      'The "name" is a short card title (2-4 words, never the request itself) and "description" is one full sentence about what the card shows.',
      request.tier === 'free'
        ? 'Free tier: do not use Pro-only modules such as animated_clock, animated_weather, climate, calendar, or vacuum. Use free equivalents like clock and weather.'
        : 'Pro tier: prefer Pro modules (animated_clock, animated_weather, climate, calendar, vacuum) when they improve the requested design.',
      `User request: ${request.prompt}`,
      `Requested style: ${request.constraints?.style || 'clean'}`,
      `Tier: ${request.tier}`,
      'Ultra Card module capabilities:',
      catalog,
      'Complete registered module reference (fields, domains, examples):',
      moduleInstructionLines,
      'Module keyword intent map (includes library-only references; output only supported modules):',
      keywordCatalog,
      ...(inventory.areaLines.length ? ['Areas (rooms) in this home:', inventory.areaLines.join('\n')] : []),
      ...(inventory.mentionedAreas.length
        ? [
            `The request mentions the area(s): ${inventory.mentionedAreas.join(', ')}. Only use entities tagged with that area unless the request clearly asks for something else.`,
          ]
        : []),
      'Entity inventory grouped by domain. Entities are ranked by relevance to the request (best first) and tagged with [area], device_class, and unit when known.',
      'Prefer the first entities in each group. Diagnostic, hidden, and unavailable entities were removed.',
      entityLines || '(no entities available)',
    ].join('\n');
  }

  /**
   * Prompt-relevance-ranked entity inventory for the AI plan. Domains the prompt asks
   * for get a generous quota so the model can pick well; everything else is a short tail
   * for context. Keeps the prompt bounded on large homes.
   */
  private _buildRankedInventory(
    hass: HassApiClient,
    prompt: string
  ): { lines: string[]; areaLines: string[]; mentionedAreas: string[] } {
    const context = buildSmartEntityContext(hass);
    const targets = inferEntityTargetsFromPrompt(prompt);
    const targetDomains = new Set(targets.map(target => target.domain));
    const mentionedAreas = extractAreaHints(prompt, context.areas).map(area => area.name);

    const RELEVANT_DOMAIN_QUOTA = 25;
    const OTHER_DOMAIN_QUOTA = 6;
    const TOTAL_CAP = 160;

    const ranked = rankSmartEntities(context, prompt, { preferClean: true });
    const grouped = new Map<string, SmartEntityRecord[]>();
    for (const { entity } of ranked) {
      const quota = targetDomains.has(entity.domain) ? RELEVANT_DOMAIN_QUOTA : OTHER_DOMAIN_QUOTA;
      const bucket = grouped.get(entity.domain) || [];
      if (bucket.length >= quota) continue;
      bucket.push(entity);
      grouped.set(entity.domain, bucket);
    }

    // Requested domains first (in prompt order), then the rest alphabetically.
    const orderedDomains = [
      ...Array.from(targetDomains).filter(domain => grouped.has(domain)),
      ...Array.from(grouped.keys())
        .filter(domain => !targetDomains.has(domain))
        .sort(),
    ];

    const lines: string[] = [];
    let total = 0;
    for (const domain of orderedDomains) {
      const entities = grouped.get(domain) || [];
      if (!entities.length) continue;
      lines.push(`${domain}:`);
      for (const entity of entities) {
        if (total >= TOTAL_CAP) break;
        const tags: string[] = [];
        if (entity.areaName) tags.push(`area: ${entity.areaName}`);
        if (entity.deviceClass) tags.push(entity.deviceClass);
        if (entity.unit) tags.push(entity.unit);
        lines.push(`  - ${entity.entityId} (${entity.name})${tags.length ? ` [${tags.join(', ')}]` : ''}`);
        total += 1;
      }
      if (total >= TOTAL_CAP) break;
    }

    const areaLines = context.areas.slice(0, 40).map(area => `  - ${area.name}`);
    return { lines, areaLines, mentionedAreas };
  }

  private _sanitizeContext(request: SmartGenerateRequest): SmartSanitizeContext {
    return {
      tier: request.tier,
      prompt: request.prompt,
      allowProModules: request.constraints?.allow_pro_modules ?? request.tier === 'pro',
    };
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

  /**
   * Unwrap the service response. A frontend `call_service` with `return_response` resolves to
   * `{ context, response }`; `ai_task.generate_data` puts the model output in `response.data`
   * and `conversation.process` in `response.response.speech.plain.speech`.
   */
  private _extractAiTaskData(value: unknown): unknown {
    let current = value;
    for (let depth = 0; depth < 3 && current && typeof current === 'object'; depth += 1) {
      const record = current as Record<string, unknown>;
      if ('data' in record && record.data !== undefined && record.data !== null) return record.data;
      if ('response' in record && record.response && typeof record.response === 'object') {
        current = record.response;
        continue;
      }
      break;
    }
    if (current && typeof current === 'object') {
      const speech = (current as { speech?: { plain?: { speech?: unknown } } }).speech?.plain?.speech;
      if (typeof speech === 'string') return speech;
    }
    return current;
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

    const enhanced = enhanceSmartPresetLayout(hass, request, layout, id, warnings);
    layout = enhanced.layout;
    const allWarnings = enhanced.warnings;

    const entities = selectEntitiesForPrompt(hass, request.prompt);
    const promptTitle = deriveTitleFromPrompt(request.prompt, entities, hass);
    const aiName = this._usableAiText(correctedPlan.name, request.prompt, 1);
    const aiDescription = this._usableAiText(correctedPlan.description, request.prompt, 4);
    // Prefer our derived title when the AI just echoed the prompt or answered with a question.
    const name = (aiName && !/\?$/.test(aiName) ? aiName : promptTitle || aiName || 'Smart Card').slice(0, 80);
    const description = (
      aiDescription ||
      this._describeLayout(hass, layout) ||
      (entities.length ? this._deriveDescriptionFromPrompt(request.prompt, entities) : '') ||
      'Generated from Home Assistant AI using Ultra Card modules.'
    ).slice(0, 180);

    return {
      smart_preset: {
        id,
        name,
        description,
        category: 'layout',
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
        ...(allWarnings.length ? { warnings: allWarnings } : {}),
      },
    };
  }

  /**
   * AI-supplied name/description, or null when it is unusable: empty, too short to mean
   * anything ("Not any"), or just the prompt read back.
   */
  private _usableAiText(value: unknown, prompt: string, minWords: number): string | null {
    if (typeof value !== 'string') return null;
    const text = value.replace(/\s+/g, ' ').trim();
    if (!text) return null;
    const normalize = (input: string): string => input.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    if (normalize(text) === normalize(prompt)) return null;
    if (text.split(' ').length < minWords) return null;
    return text;
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
    notes: string[] = []
  ): SmartGenerateResponse {
    const now = new Date().toISOString();
    const context = this._sanitizeContext(request);
    const entities = selectEntitiesForPrompt(hass, request.prompt);
    const title = deriveTitleFromPrompt(request.prompt, entities, hass) || 'Smart Card';
    const id = `smart-assist-${Date.now()}`;
    const style = request.constraints?.style || 'clean';
    const useComposer = hasStructuredComposerPlan(request.prompt, hass, context.tier);
    const composed = useComposer ? composeSmartCardModules(id, hass, context, style) : { modules: [], warnings: [] };
    const modules =
      composed.modules.length > 0
        ? (composed.modules as unknown as PresetDefinition['layout']['rows'][number]['columns'][number]['modules'])
        : entities.length > 0
          ? (buildComposedEntityModules(id, entities, style, hass, context) as unknown as PresetDefinition['layout']['rows'][number]['columns'][number]['modules'])
          : this._buildFallbackModules(id, title, request, hass);

    const description =
      this._describeLayout(hass, modules) || this._deriveDescriptionFromPrompt(request.prompt, entities);

    const layoutEntityCount = collectLayoutEntityIds(modules as unknown[]).size;
    if (!layoutEntityCount) {
      notes = [
        ...notes,
        'No matching entities were found in this Home Assistant for the request, so the card is only a starting point.',
      ];
    }
    const warnings = [...notes, ...composed.warnings];
    const generationWarnings = warnings.length ? warnings : undefined;

    return {
      smart_preset: {
        id,
        name: title,
        description,
        category: 'layout',
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
        ...(generationWarnings ? { warnings: generationWarnings } : {}),
      },
    };
  }

  private _buildFallbackModules(
    id: string,
    title: string,
    request: SmartGenerateRequest,
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
          content: request.prompt,
        },
      ] as unknown as PresetDefinition['layout']['rows'][number]['columns'][number]['modules'];
    }

    // Generic prompt: a status summary of the most relevant, non-diagnostic entities,
    // favouring things people actually glance at (lights, doors, motion, climate, presence).
    const context = buildSmartEntityContext(hass);
    const ranked = rankSmartEntities(context, request.prompt, { preferClean: true });
    const glanceable = new Set([
      'light', 'switch', 'lock', 'cover', 'binary_sensor', 'climate', 'person', 'media_player', 'fan', 'alarm_control_panel',
    ]);
    const inventory = [
      ...ranked.filter(item => glanceable.has(item.entity.domain)),
      ...ranked.filter(item => !glanceable.has(item.entity.domain)),
    ]
      .slice(0, 8)
      .map(item => item.entity);
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

  /**
   * One sentence naming what the finished card actually shows, e.g. "Shows Wayne and Sam." or
   * "Shows Kitchen Light, Kettle, Front Door and 3 more." Empty when the layout has no entities.
   */
  private _describeLayout(
    hass: HassApiClient,
    layout: PresetDefinition['layout'] | unknown[] | null | undefined
  ): string {
    const modules = Array.isArray(layout)
      ? layout
      : layout?.rows?.flatMap(row => row.columns.flatMap(column => column.modules)) || [];
    const entityIds = Array.from(collectLayoutEntityIds(modules)).filter(entityId => hass.states?.[entityId]);
    if (!entityIds.length) return '';
    const names = Array.from(new Set(entityIds.map(entityId => entityName(hass, entityId)))).filter(Boolean);
    const shown = names.slice(0, 3);
    const rest = names.length - shown.length;
    const list =
      shown.length === 1
        ? shown[0]
        : rest > 0
          ? `${shown.join(', ')} and ${rest} more`
          : `${shown.slice(0, -1).join(', ')} and ${shown[shown.length - 1]}`;
    return `Shows ${list}.`;
  }

  private _deriveDescriptionFromPrompt(
    prompt: string,
    entities: Array<{ domain: string; entityId: string }>
  ): string {
    if (entities.length) {
      const domains = Array.from(new Set(entities.map(entity => entity.domain)));
      return `Shows ${entities.length} ${domains.join(', ')} ${entities.length === 1 ? 'entity' : 'entities'} from Home Assistant.`;
    }
    const cleaned = prompt.replace(/\s+/g, ' ').trim().slice(0, 120);
    return cleaned ? `Starter card for "${cleaned}".` : 'Starter card built from your entities.';
  }

  private _normalizeGenerateResponse(
    raw: unknown,
    hass?: HassApiClient,
    request?: SmartGenerateRequest
  ): SmartGenerateResponse {
    const normalized: SmartGenerateResponse = {};
    if (raw && typeof raw === 'object') {
      const rawObj = raw as Record<string, unknown>;
      if (rawObj.smart_preset) {
        const preset = rawObj.smart_preset as PresetDefinition;
        if (hass && request) {
          const sanitized = sanitizeCloudSmartPreset(hass, request, preset);
          normalized.smart_preset = sanitized.preset;
          if (sanitized.warnings.length) {
            normalized.generation = {
              ...(normalized.generation || {}),
              warnings: sanitized.warnings,
            };
          }
        } else {
          normalized.smart_preset = preset;
        }
      }
      if (Array.isArray(rawObj.presets)) normalized.presets = rawObj.presets as PresetDefinition[];
      if (rawObj.generation && typeof rawObj.generation === 'object') {
        const generation = rawObj.generation as Record<string, unknown>;
        const serverWarnings = Array.isArray(generation.warnings)
          ? generation.warnings.map((warning: unknown) => String(warning))
          : [];
        const warnings = [...(normalized.generation?.warnings || []), ...serverWarnings];
        normalized.generation = {
          connector_used:
            typeof generation.connector_used === 'string' ? generation.connector_used : undefined,
          tier_required:
            generation.tier_required === 'free' || generation.tier_required === 'pro'
              ? generation.tier_required
              : undefined,
          warnings: warnings.length ? warnings : undefined,
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
    const categoryRaw = String(candidate.category || 'layout').toLowerCase();
    const moduleCats: PresetDefinition['category'][] = [
      'layout',
      'content',
      'data',
      'interactive',
      'input',
      'media',
    ];
    const legacyMap: Record<string, PresetDefinition['category']> = {
      badges: 'content',
      badge: 'content',
      layouts: 'layout',
      widgets: 'content',
      widget: 'content',
      custom: 'content',
    };
    const category: PresetDefinition['category'] = (moduleCats as string[]).includes(categoryRaw)
      ? (categoryRaw as PresetDefinition['category'])
      : legacyMap[categoryRaw] || 'content';

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
