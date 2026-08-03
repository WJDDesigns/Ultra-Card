import { HomeAssistant } from 'custom-card-helpers';
import { UltraCardTodoService, TodoItem } from './uc-todo-service';
import type { DogDutyDetectRoi } from '../types';

/** Structured detection payload stored in a to-do item description. */
export interface DogDutyEventPayload {
  x: number;
  y: number;
  confidence?: number | undefined;
  snapshot?: string | undefined;
  detected_at?: string | undefined;
  camera?: string | undefined;
  description?: string | undefined;
  source?: 'automation' | 'scan_now' | 'manual' | undefined;
}

/** Parsed Dog Duty event with the backing to-do item. */
export interface DogDutyEvent {
  uid: string;
  summary: string;
  status: 'needs_action' | 'completed';
  cleaned: boolean;
  payload: DogDutyEventPayload;
  detectedAt: number;
}

export interface DogDutyScanResult {
  found: boolean;
  spots: Array<{ x: number; y: number; confidence?: number; description?: string }>;
  rawText?: string | undefined;
  error?: string | undefined;
}

export type DogDutySensitivity = 'strict' | 'balanced' | 'lenient';

export interface DogDutyDetectionOptions {
  sensitivity?: DogDutySensitivity | undefined;
  detectSquatting?: boolean | undefined;
  minConfidence?: number | undefined;
  extraTips?: string | undefined;
  exampleImages?: string[] | undefined;
  roi?: DogDutyDetectRoi | null | undefined;
}

export interface DogDutyAutomationParams extends DogDutyDetectionOptions {
  cameraEntity: string;
  todoEntity: string;
  providerId: string;
  triggerEntity?: string | undefined;
  cooldownMinutes?: number | undefined;
  automationId?: string | undefined;
  /** Scheduled-mode scan interval in minutes (used only when no triggerEntity). */
  intervalMinutes?: number | undefined;
  /** Scheduled-mode active window start, HH:MM (used only when no triggerEntity). */
  activeStart?: string | undefined;
  /** Scheduled-mode active window end, HH:MM (used only when no triggerEntity). */
  activeEnd?: string | undefined;
}

export interface DogDutyScanOptions extends DogDutyDetectionOptions {
  cameraEntity: string;
  todoEntity: string;
  providerId: string;
  writeEvents?: boolean | undefined;
}

export const MAX_DOG_DUTY_EXAMPLE_IMAGES = 3;
export const MAX_DOG_DUTY_EXTRA_TIPS = 400;
const ROI_MARGIN = 0.02;
const DEFAULT_MIN_CONFIDENCE = 0.45;

/** TodoListEntityFeature.SET_DESCRIPTION_ON_ITEM */
const TODO_FEATURE_SET_DESCRIPTION = 64;

/** Separator used when packing JSON into the item summary (lists without description support). */
export const DOG_DUTY_SUMMARY_JSON_SEP = ' ⌗';

/** JSON schema for llmvision response_format=json (v1.6+). */
export const DOG_DUTY_RESPONSE_STRUCTURE = {
  type: 'object',
  properties: {
    found: {
      type: 'boolean',
      description: 'True if dog droppings are visible in the image',
    },
    spots: {
      type: 'array',
      description: 'Detected droppings with normalized image coordinates',
      items: {
        type: 'object',
        properties: {
          x: {
            type: 'number',
            description: 'Horizontal position from 0 (left) to 1 (right)',
          },
          y: {
            type: 'number',
            description: 'Vertical position from 0 (top) to 1 (bottom)',
          },
          confidence: {
            type: 'number',
            description: 'Confidence from 0 to 1',
          },
          description: {
            type: 'string',
            description: 'Short description of the spot',
          },
        },
        required: ['x', 'y'],
        additionalProperties: false,
      },
    },
  },
  required: ['found', 'spots'],
  additionalProperties: false,
} as const;

/**
 * Compose the hidden detection message from user-facing settings.
 * Never expose this string in the editor UI.
 */
export function buildDetectionPrompt(opts: {
  mode: 'single' | 'compare';
  sensitivity?: DogDutySensitivity | undefined;
  detectSquatting?: boolean | undefined;
  extraTips?: string | undefined;
  roi?: DogDutyDetectRoi | null | undefined;
  hasExamples?: boolean | undefined;
}): string {
  const sensitivity = opts.sensitivity || 'balanced';
  const detectSquatting = opts.detectSquatting !== false;
  const parts: string[] = [];

  if (opts.mode === 'compare') {
    parts.push(
      'Compare these two images of the same yard (before then after).',
      'Identify any NEW dog droppings / feces that appear in the later image.'
    );
  } else {
    parts.push('Analyze this yard camera image for dog waste.');
    if (detectSquatting) {
      parts.push(
        'Mark a spot if you see dog droppings / feces on the ground, OR a dog currently squatting / defecating.'
      );
    } else {
      parts.push(
        'Mark a spot only if you see dog droppings / feces on the ground. Do not mark a dog that is only sitting or standing.'
      );
    }
  }

  if (opts.hasExamples) {
    parts.push(
      'The image file(s) provided are REFERENCE EXAMPLES of what dog waste looks like in this specific yard.',
      'Use them only as visual reference. Analyze ONLY the live camera image for new detections — do not mark the example photos themselves.'
    );
  }

  parts.push(
    'Return structured data only.',
    'Coordinates are normalized: x=0 left, x=1 right, y=0 top, y=1 bottom (center of the pile or the dog).'
  );

  if (sensitivity === 'strict') {
    parts.push(
      'Be strict: only report high-confidence clear detections. Prefer fewer spots. When unsure, set found=false.'
    );
  } else if (sensitivity === 'lenient') {
    parts.push(
      'Be attentive: report likely spots even at moderate confidence. Still do not invent spots with no visual evidence.'
    );
  } else {
    parts.push('Do not invent spots. Prefer fewer high-confidence detections.');
  }

  const roi = normalizeRoi(opts.roi);
  if (roi) {
    const left = roi.x;
    const top = roi.y;
    const right = roi.x + roi.width;
    const bottom = roi.y + roi.height;
    parts.push(
      `Only report detections inside this rectangle (full-image normalized coords): left=${left.toFixed(3)}, top=${top.toFixed(3)}, right=${right.toFixed(3)}, bottom=${bottom.toFixed(3)}. Ignore everything outside.`
    );
  }

  const tips = sanitizeExtraTips(opts.extraTips);
  if (tips) {
    parts.push(`Yard-specific notes from the owner: ${tips}`);
  }

  parts.push('If nothing is found, set found=false and spots=[].');
  return parts.join(' ');
}

/** Convert Ultra Card media paths into filesystem paths LLM Vision accepts. */
export function resolveLlmVisionImagePath(path: string): string | null {
  if (!path || typeof path !== 'string') return null;
  const trimmed = path.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('media-source://media_source/local/')) {
    return `/media/local/${trimmed.slice('media-source://media_source/local/'.length)}`;
  }
  if (trimmed.startsWith('/media/')) return trimmed;
  if (trimmed.startsWith('/config/')) return trimmed;
  if (trimmed.startsWith('/local/')) return `/config/www${trimmed.slice('/local'.length)}`;
  if (trimmed.startsWith('local/')) return `/config/www/${trimmed.slice('local/'.length)}`;
  // Absolute http(s) URLs are not usable as image_file for LLM Vision
  if (/^https?:\/\//i.test(trimmed)) return null;
  // Bare relative paths under www
  if (!trimmed.startsWith('/')) return `/config/www/${trimmed}`;
  return trimmed;
}

export function resolveExampleImagePaths(paths?: string[] | null): string[] {
  if (!Array.isArray(paths)) return [];
  const out: string[] = [];
  for (const p of paths.slice(0, MAX_DOG_DUTY_EXAMPLE_IMAGES)) {
    const resolved = resolveLlmVisionImagePath(p);
    if (resolved && !out.includes(resolved)) out.push(resolved);
  }
  return out;
}

export function normalizeRoi(roi?: DogDutyDetectRoi | null): DogDutyDetectRoi | null {
  if (!roi) return null;
  const x = clamp01(Number(roi.x));
  const y = clamp01(Number(roi.y));
  const width = Math.min(1 - x, Math.max(0, Number(roi.width)));
  const height = Math.min(1 - y, Math.max(0, Number(roi.height)));
  if (width < 0.05 || height < 0.05) return null;
  // Treat near-full-frame as "no ROI"
  if (x <= 0.01 && y <= 0.01 && width >= 0.98 && height >= 0.98) return null;
  return { x, y, width, height };
}

/** Validate + normalize an HH:MM string (e.g. "7:5" → "07:05"); null if unusable. */
export function normalizeClockTime(value?: string | null): string | null {
  if (!value || typeof value !== 'string') return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function sanitizeExtraTips(tips?: string | null): string {
  if (!tips || typeof tips !== 'string') return '';
  return tips.replace(/\s+/g, ' ').trim().slice(0, MAX_DOG_DUTY_EXTRA_TIPS);
}

/** Filter spots by ROI + min confidence; updates found flag. */
export function filterDetectionSpots(
  result: DogDutyScanResult,
  opts?: {
    roi?: DogDutyDetectRoi | null | undefined;
    minConfidence?: number | undefined;
  }
): DogDutyScanResult {
  const minConf =
    typeof opts?.minConfidence === 'number' && Number.isFinite(opts.minConfidence)
      ? clamp01(opts.minConfidence)
      : DEFAULT_MIN_CONFIDENCE;
  const roi = normalizeRoi(opts?.roi);

  const spots = (result.spots || []).filter(spot => {
    if (typeof spot.confidence === 'number' && spot.confidence < minConf) return false;
    if (!roi) return true;
    const x = clamp01(spot.x);
    const y = clamp01(spot.y);
    return (
      x >= roi.x - ROI_MARGIN &&
      x <= roi.x + roi.width + ROI_MARGIN &&
      y >= roi.y - ROI_MARGIN &&
      y <= roi.y + roi.height + ROI_MARGIN
    );
  });

  return {
    ...result,
    spots,
    found: spots.length > 0,
  };
}

/**
 * Dog Duty helpers: parse to-do events, mark cleaned / false alarm,
 * on-demand LLM Vision scans, and automation config generation.
 */
export class UltraCardDogDutyService {
  private _todo = new UltraCardTodoService();

  async getEvents(
    hass: HomeAssistant,
    todoEntity: string,
    onUpdate?: () => void
  ): Promise<DogDutyEvent[]> {
    if (!hass || !todoEntity) return [];
    const items = await this._todo.getItems(hass, todoEntity, onUpdate);
    return items.map(item => this._itemToEvent(item)).filter((e): e is DogDutyEvent => !!e);
  }

  parseEvent(item: TodoItem): DogDutyEvent | null {
    return this._itemToEvent(item);
  }

  async markCleaned(hass: HomeAssistant, todoEntity: string, uid: string): Promise<void> {
    await hass.callService('todo', 'update_item', {
      entity_id: todoEntity,
      item: uid,
      status: 'completed',
    });
    this._todo.invalidateCache(hass, todoEntity);
  }

  async markNeedsAction(hass: HomeAssistant, todoEntity: string, uid: string): Promise<void> {
    await hass.callService('todo', 'update_item', {
      entity_id: todoEntity,
      item: uid,
      status: 'needs_action',
    });
    this._todo.invalidateCache(hass, todoEntity);
  }

  async removeEvent(hass: HomeAssistant, todoEntity: string, uid: string): Promise<void> {
    await hass.callService('todo', 'remove_item', {
      entity_id: todoEntity,
      item: uid,
    });
    this._todo.invalidateCache(hass, todoEntity);
  }

  async addEvent(
    hass: HomeAssistant,
    todoEntity: string,
    payload: DogDutyEventPayload,
    summary?: string
  ): Promise<void> {
    const pctX = Math.round(clamp01(payload.x) * 100);
    const pctY = Math.round(clamp01(payload.y) * 100);
    const label = summary || `Dog duty @ ${pctX}%, ${pctY}%`;
    const body = {
      ...payload,
      x: clamp01(payload.x),
      y: clamp01(payload.y),
      detected_at: payload.detected_at || new Date().toISOString(),
    };
    const json = JSON.stringify(body);

    // Shopping List (and some others) reject `description` — pack JSON into the summary.
    const data: Record<string, unknown> = {
      entity_id: todoEntity,
    };
    if (todoSupportsDescription(hass, todoEntity)) {
      data.item = label;
      data.description = json;
    } else {
      data.item = `${label}${DOG_DUTY_SUMMARY_JSON_SEP}${json}`;
    }

    await hass.callService('todo', 'add_item', data);
  }

  /**
   * On-demand scan via llmvision.image_analyzer (return_response).
   * Writes any found spots into the to-do list.
   */
  async scanNow(hass: HomeAssistant, opts: DogDutyScanOptions): Promise<DogDutyScanResult> {
    const { cameraEntity, todoEntity, providerId, writeEvents = true } = opts;
    if (!hass || !cameraEntity || !providerId) {
      return { found: false, spots: [], error: 'Missing camera or LLM Vision provider' };
    }

    const examplePaths = resolveExampleImagePaths(opts.exampleImages);
    const message = buildDetectionPrompt({
      mode: 'single',
      sensitivity: opts.sensitivity,
      detectSquatting: opts.detectSquatting,
      extraTips: opts.extraTips,
      roi: opts.roi,
      hasExamples: examplePaths.length > 0,
    });

    try {
      const serviceData: Record<string, unknown> = {
        provider: providerId,
        message,
        image_entity: [cameraEntity],
        max_tokens: 1500,
        target_width: 1280,
        include_filename: examplePaths.length > 0,
        remember: false,
        response_format: 'json',
        structure: DOG_DUTY_RESPONSE_STRUCTURE,
      };
      if (examplePaths.length > 0) {
        serviceData.image_file = examplePaths.join('\n');
      }

      const result = await (hass as any).callService(
        'llmvision',
        'image_analyzer',
        serviceData,
        undefined,
        true,
        true
      );

      const payload = result?.response ?? result;
      let parsed = parseAnalyzerPayload(payload);
      if (parsed.error && !parsed.found && parsed.spots.length === 0) {
        return polishScanError(parsed);
      }
      parsed = filterDetectionSpots(parsed, {
        roi: opts.roi,
        minConfidence: opts.minConfidence,
      });

      if (writeEvents && parsed.found && parsed.spots.length > 0 && todoEntity) {
        const now = new Date().toISOString();
        try {
          for (const spot of parsed.spots) {
            await this.addEvent(hass, todoEntity, {
              x: spot.x,
              y: spot.y,
              confidence: spot.confidence,
              description: spot.description,
              detected_at: now,
              camera: cameraEntity,
              source: 'scan_now',
            });
          }
        } catch (writeErr: any) {
          return polishScanError({
            found: true,
            spots: parsed.spots,
            error: writeErr?.message || String(writeErr),
            rawText: parsed.rawText,
          });
        }
      }

      return parsed;
    } catch (err: any) {
      const messageText = err?.message || String(err);
      const lower = messageText.toLowerCase();
      if (
        lower.includes('response_format') ||
        lower.includes('structure') ||
        lower.includes('extra keys') ||
        lower.includes('not a valid') ||
        lower.includes('unexpected')
      ) {
        try {
          return await this._scanNowTextFallback(hass, opts, message, examplePaths);
        } catch (fallbackErr: any) {
          return polishScanError({
            found: false,
            spots: [],
            error: fallbackErr?.message || messageText,
          });
        }
      }
      console.warn('[UltraCard] Dog Duty scan failed', err);
      return polishScanError({ found: false, spots: [], error: messageText });
    }
  }

  private async _scanNowTextFallback(
    hass: HomeAssistant,
    opts: DogDutyScanOptions,
    detectionMessage: string,
    examplePaths: string[]
  ): Promise<DogDutyScanResult> {
    const { cameraEntity, todoEntity, providerId, writeEvents = true } = opts;
    const serviceData: Record<string, unknown> = {
      provider: providerId,
      message: [
        detectionMessage,
        'Respond with ONLY a JSON object, no markdown:',
        '{"found":false,"spots":[{"x":0.5,"y":0.5,"confidence":0.8,"description":"short"}]}',
      ].join(' '),
      image_entity: [cameraEntity],
      max_tokens: 1500,
      target_width: 1280,
      include_filename: examplePaths.length > 0,
      remember: false,
    };
    if (examplePaths.length > 0) {
      serviceData.image_file = examplePaths.join('\n');
    }

    const result = await (hass as any).callService(
      'llmvision',
      'image_analyzer',
      serviceData,
      undefined,
      true,
      true
    );
    let parsed = parseAnalyzerPayload(result?.response ?? result);
    if (parsed.error && !parsed.found && parsed.spots.length === 0) {
      return polishScanError(parsed);
    }
    parsed = filterDetectionSpots(parsed, {
      roi: opts.roi,
      minConfidence: opts.minConfidence,
    });
    if (writeEvents && parsed.found && parsed.spots.length > 0 && todoEntity) {
      const now = new Date().toISOString();
      try {
        for (const spot of parsed.spots) {
          await this.addEvent(hass, todoEntity, {
            x: spot.x,
            y: spot.y,
            confidence: spot.confidence,
            description: spot.description,
            detected_at: now,
            camera: cameraEntity,
            source: 'scan_now',
          });
        }
      } catch (writeErr: any) {
        return polishScanError({
          found: true,
          spots: parsed.spots,
          error: writeErr?.message || String(writeErr),
          rawText: parsed.rawText,
        });
      }
    }
    return parsed;
  }

  /** Detect whether the LLM Vision integration is present. */
  async detectLlmVision(hass: HomeAssistant): Promise<{
    installed: boolean;
    providers: Array<{ id: string; title: string }>;
  }> {
    if (!hass) return { installed: false, providers: [] };

    const services = (hass as any).services || {};
    const installed = !!services.llmvision?.image_analyzer;

    let providers: Array<{ id: string; title: string }> = [];
    try {
      const entries = await (hass as any).callWS({
        type: 'config_entries/get',
      });
      if (Array.isArray(entries)) {
        providers = mapLlmVisionProviders(entries);
      }
    } catch {
      try {
        const entries = await hass.callApi('GET', 'config/config_entries/entry');
        if (Array.isArray(entries)) {
          providers = mapLlmVisionProviders(entries);
        }
      } catch {
        /* ignore */
      }
    }

    return { installed: installed || providers.length > 0, providers };
  }

  /** True if this entry id is a usable AI provider (not the Settings shell). */
  isUsableProviderId(providerId: string, providers: Array<{ id: string; title: string }>): boolean {
    if (!providerId) return false;
    return providers.some(p => p.id === providerId);
  }

  /** Find existing local_todo entities that look like Dog Duty lists. */
  findDogDutyTodoEntities(hass: HomeAssistant): string[] {
    if (!hass?.states) return [];
    return Object.keys(hass.states).filter(id => {
      if (!id.startsWith('todo.')) return false;
      const name = (hass.states[id]?.attributes?.friendly_name || id).toLowerCase();
      return (
        id.includes('dog_duty') ||
        id.includes('dogduty') ||
        name.includes('dog duty') ||
        name.includes('dogduty')
      );
    });
  }

  /** Generate the YAML-ready automation config for Dog Duty detection. */
  buildAutomationConfig(params: DogDutyAutomationParams): Record<string, unknown> {
    const id = params.automationId || `ultra_card_dog_duty_${Date.now().toString(36)}`;
    const cooldown = Math.max(1, params.cooldownMinutes ?? 10);
    const triggerEntity = params.triggerEntity;
    const examplePaths = resolveExampleImagePaths(params.exampleImages);
    const message = buildDetectionPrompt({
      mode: 'compare',
      sensitivity: params.sensitivity,
      detectSquatting: params.detectSquatting,
      extraTips: params.extraTips,
      roi: params.roi,
      hasExamples: examplePaths.length > 0,
    });

    const intervalMinutes = Math.max(5, Math.round(params.intervalMinutes ?? 30));
    const triggers: any[] = triggerEntity
      ? [
          {
            platform: 'state',
            entity_id: triggerEntity,
            to: 'on',
            id: 'dog_activity',
          },
        ]
      : [
          intervalMinutes >= 60
            ? {
                platform: 'time_pattern',
                hours: `/${Math.max(1, Math.round(intervalMinutes / 60))}`,
                minutes: '0',
                id: 'scheduled',
              }
            : {
                platform: 'time_pattern',
                minutes: `/${intervalMinutes}`,
                id: 'scheduled',
              },
        ];

    const actions: any[] = [
      {
        alias: 'Snapshot before',
        service: 'camera.snapshot',
        target: { entity_id: params.cameraEntity },
        data: {
          filename: '/config/www/ultra-card/dog-duty/before_{{ now().strftime("%Y%m%d_%H%M%S") }}.jpg',
        },
      },
    ];

    if (triggerEntity) {
      actions.push({
        alias: 'Wait for activity to clear',
        wait_for_trigger: [
          {
            platform: 'state',
            entity_id: triggerEntity,
            to: 'off',
          },
        ],
        timeout: { minutes: 5 },
        continue_on_timeout: true,
      });
      actions.push({ delay: { seconds: 30 } });
    } else {
      actions.push({ delay: { seconds: 5 } });
    }

    const analyzeData: Record<string, unknown> = {
      provider: params.providerId,
      message,
      image_entity: [params.cameraEntity],
      max_tokens: 1500,
      target_width: 1280,
      include_filename: examplePaths.length > 0,
      remember: false,
      response_format: 'json',
      structure: DOG_DUTY_RESPONSE_STRUCTURE,
    };
    if (examplePaths.length > 0) {
      analyzeData.image_file = examplePaths.join('\n');
    }

    actions.push(
      {
        alias: 'Snapshot after',
        service: 'camera.snapshot',
        target: { entity_id: params.cameraEntity },
        data: {
          filename: '/config/www/ultra-card/dog-duty/after_{{ now().strftime("%Y%m%d_%H%M%S") }}.jpg',
        },
      },
      {
        alias: 'Analyze with LLM Vision',
        service: 'llmvision.image_analyzer',
        data: analyzeData,
        response_variable: 'dog_duty_scan',
      },
      {
        alias: 'Add detections to to-do list',
        choose: [
          {
            conditions: [
              {
                condition: 'template',
                value_template:
                  "{{ dog_duty_scan is mapping and (dog_duty_scan.found | default(false) or (dog_duty_scan.spots | default([]) | length > 0) or (dog_duty_scan.response_text | default('') | regex_search('\"found\"\\\\s*:\\\\s*true'))) }}",
              },
            ],
            sequence: [
              {
                service: 'todo.add_item',
                target: { entity_id: params.todoEntity },
                data: {
                  item:
                    "{{ ('Dog duty @ ' ~ (((dog_duty_scan.spots[0].x | default(0.5)) * 100) | round) ~ '%, ' ~ (((dog_duty_scan.spots[0].y | default(0.5)) * 100) | round) ~ '% ⌗') ~ ({'x': (dog_duty_scan.spots[0].x | default(0.5)), 'y': (dog_duty_scan.spots[0].y | default(0.5)), 'confidence': (dog_duty_scan.spots[0].confidence | default(0.7)), 'detected_at': now().isoformat(), 'camera': '" +
                    params.cameraEntity +
                    "', 'source': 'automation', 'description': dog_duty_scan.spots[0].description | default('') } | to_json) }}",
                },
              },
            ],
          },
        ],
      }
    );

    const conditions: any[] = [
      {
        condition: 'template',
        value_template: `{{ (now() - states.automation['${id}'].attributes.last_triggered | default(as_datetime(0), true)).total_seconds() > ${cooldown * 60} }}`,
      },
    ];
    if (!triggerEntity) {
      const activeStart = normalizeClockTime(params.activeStart);
      const activeEnd = normalizeClockTime(params.activeEnd);
      if (activeStart && activeEnd && activeStart !== activeEnd) {
        conditions.push({
          condition: 'time',
          after: activeStart,
          before: activeEnd,
        });
      }
    }

    return {
      id,
      alias: 'Ultra Card — Dog Duty',
      description:
        'Created by Ultra Card Dog Duty module. Scans the yard camera after dog/motion activity and stores detections on a to-do list.',
      mode: 'single',
      max_exceeded: 'silent',
      triggers,
      conditions,
      actions,
    };
  }

  /** Create or update the Dog Duty automation via the HA config API. */
  async createOrUpdateAutomation(
    hass: HomeAssistant,
    params: DogDutyAutomationParams
  ): Promise<{ ok: boolean; automationId: string; error?: string }> {
    const config = this.buildAutomationConfig(params);
    const automationId = String(config.id);

    try {
      await hass.callApi('POST', `config/automation/config/${automationId}`, config);
      return { ok: true, automationId };
    } catch (err: any) {
      console.warn('[UltraCard] Failed to create Dog Duty automation', err);
      return {
        ok: false,
        automationId,
        error: err?.message || String(err),
      };
    }
  }

  unsubscribeTodo(entityId: string): void {
    this._todo.unsubscribeEntity(entityId);
  }

  invalidateTodoCache(hass: HomeAssistant, todoEntity: string): void {
    this._todo.invalidateCache(hass, todoEntity);
  }

  private _itemToEvent(item: TodoItem): DogDutyEvent | null {
    if (!item) return null;
    const payload =
      parsePayload(item.description) || parsePayloadFromSummary(item.summary);
    if (!payload) return null;

    const detectedAt = payload.detected_at
      ? Date.parse(payload.detected_at)
      : Date.now();

    const displaySummary = stripSummaryPayload(item.summary) || 'Dog duty';

    return {
      uid: item.uid || `${displaySummary}-${detectedAt}`,
      summary: displaySummary,
      status: item.status === 'completed' ? 'completed' : 'needs_action',
      cleaned: item.status === 'completed',
      payload: {
        ...payload,
        x: clamp01(payload.x),
        y: clamp01(payload.y),
      },
      detectedAt: Number.isFinite(detectedAt) ? detectedAt : Date.now(),
    };
  }
}

export const ucDogDutyService = new UltraCardDogDutyService();

/**
 * LLM Vision exposes two kinds of config entries under domain `llmvision`:
 * 1. "LLM Vision Settings" — integration shell / prompts / timeout (NOT a model provider)
 * 2. Real providers — "Anthropic Claude", "OpenAI", "Google", "Ollama", etc.
 *
 * Passing the Settings entry_id to llmvision.image_analyzer returns `invalid_model`
 * even when a valid Anthropic provider exists (see ha-llmvision#653).
 */
export function isLlmVisionSettingsEntry(title: string, uniqueId?: string): boolean {
  const t = (title || '').trim().toLowerCase();
  const u = (uniqueId || '').trim().toLowerCase();
  if (!t && !u) return false;
  if (t === 'llm vision' || t === 'llm vision settings' || t.endsWith(' settings')) return true;
  if (u === 'llmvision' || u === 'llm_vision' || u.includes('settings')) return true;
  return false;
}

export function mapLlmVisionProviders(
  entries: Array<{
    domain?: string;
    entry_id?: string;
    title?: string;
    unique_id?: string;
    pref_disable_new_entities?: boolean;
  }>
): Array<{ id: string; title: string }> {
  return entries
    .filter(e => e?.domain === 'llmvision' && e?.entry_id)
    .filter(e => !isLlmVisionSettingsEntry(String(e.title || ''), String(e.unique_id || '')))
    .map(e => ({
      id: String(e.entry_id),
      title: String(e.title || e.entry_id),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Turn opaque LLM Vision / Anthropic failures into actionable Dog Duty errors.
 * Known: ha-llmvision#660 — Anthropic thinking_budget sent as float → budget_tokens invalid.
 */
export function polishScanError(result: DogDutyScanResult): DogDutyScanResult {
  const blob = `${result.error || ''} ${result.rawText || ''}`.toLowerCase();
  if (!blob.trim()) return result;

  if (blob.includes('invalid_model')) {
    return {
      ...result,
      error:
        'invalid_model — pick your real AI provider (e.g. “Anthropic Claude”), not “LLM Vision Settings”.',
    };
  }

  if (
    blob.includes('budget_tokens') ||
    blob.includes('thinking.enabled') ||
    (blob.includes("couldn't generate content") && blob.includes('anthropic'))
  ) {
    return {
      ...result,
      error:
        'Anthropic thinking budget is misconfigured in LLM Vision (known bug: budget_tokens must be an integer). Fix: Anthropic Claude → ⋮ → Reconfigure → set Thinking / reasoning budget to 0 (off), then Submit. Or update LLM Vision past 1.7.0.',
    };
  }

  if (blob.includes("couldn't generate content")) {
    return {
      ...result,
      error:
        "LLM Vision couldn't generate content (provider error). Check Home Assistant logs for Anthropic/OpenAI details. For Anthropic: set Thinking budget to 0 in the provider Reconfigure screen.",
    };
  }

  if (blob.includes('does not support setting field: description') || blob.includes('description')) {
    if (blob.includes('does not support') || blob.includes('validation error')) {
      return {
        ...result,
        error:
          'This to-do list cannot store descriptions (e.g. Shopping List). Create a Local To-do named “Dog Duty” (Helpers → Local To-do) and select it in Entities — or update Ultra Card; newer builds store markers without description support.',
      };
    }
  }

  return result;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}

function parsePayload(description?: string): DogDutyEventPayload | null {
  if (!description || typeof description !== 'string') return null;
  const trimmed = description.trim();
  if (!trimmed.startsWith('{')) return null;
  try {
    const obj = JSON.parse(trimmed);
    if (typeof obj?.x !== 'number' || typeof obj?.y !== 'number') return null;
    return {
      x: obj.x,
      y: obj.y,
      confidence: typeof obj.confidence === 'number' ? obj.confidence : undefined,
      snapshot: typeof obj.snapshot === 'string' ? obj.snapshot : undefined,
      detected_at: typeof obj.detected_at === 'string' ? obj.detected_at : undefined,
      camera: typeof obj.camera === 'string' ? obj.camera : undefined,
      description: typeof obj.description === 'string' ? obj.description : undefined,
      source: obj.source,
    };
  } catch {
    return null;
  }
}

function parsePayloadFromSummary(summary?: string): DogDutyEventPayload | null {
  if (!summary) return null;
  const sepIdx = summary.indexOf(DOG_DUTY_SUMMARY_JSON_SEP);
  if (sepIdx >= 0) {
    return parsePayload(summary.slice(sepIdx + DOG_DUTY_SUMMARY_JSON_SEP.length).trim());
  }
  // Fallback: any trailing JSON object in the summary
  const start = summary.lastIndexOf('{');
  const end = summary.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return parsePayload(summary.slice(start, end + 1));
  }
  return null;
}

function stripSummaryPayload(summary?: string): string {
  if (!summary) return '';
  const sepIdx = summary.indexOf(DOG_DUTY_SUMMARY_JSON_SEP);
  if (sepIdx >= 0) return summary.slice(0, sepIdx).trim();
  const start = summary.lastIndexOf('{');
  if (start > 0 && summary.includes('"x"')) return summary.slice(0, start).trim();
  return summary.trim();
}

/** True when the to-do entity supports the description field (bit 64). */
export function todoSupportsDescription(hass: HomeAssistant, todoEntity: string): boolean {
  if (!hass?.states || !todoEntity) return false;
  const feats = Number(hass.states[todoEntity]?.attributes?.supported_features ?? 0);
  return (feats & TODO_FEATURE_SET_DESCRIPTION) === TODO_FEATURE_SET_DESCRIPTION;
}

function extractAnalyzerText(response: any): string {
  if (!response) return '';
  if (typeof response === 'string') return response;
  if (typeof response.response_text === 'string') return response.response_text;
  if (typeof response.response_txt === 'string') return response.response_txt;
  if (typeof response.text === 'string') return response.text;
  if (typeof response.response === 'string') return response.response;
  if (typeof response.message === 'string') return response.message;
  try {
    return JSON.stringify(response);
  } catch {
    return String(response);
  }
}

/** Normalize llmvision analyzer payload (structured json or free text). */
export function parseAnalyzerPayload(payload: any): DogDutyScanResult {
  if (payload == null) {
    return { found: false, spots: [], error: 'Empty analyzer response' };
  }

  // Already-structured object from response_format=json
  if (typeof payload === 'object' && !Array.isArray(payload)) {
    const direct = coerceScanObject(payload);
    if (direct) return { ...direct, rawText: extractAnalyzerText(payload) };

    // Nested under common keys
    for (const key of ['data', 'result', 'json', 'structured_response', 'response']) {
      const nested = (payload as any)[key];
      if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
        const fromNested = coerceScanObject(nested);
        if (fromNested) return { ...fromNested, rawText: extractAnalyzerText(payload) };
      }
    }
  }

  const text = extractAnalyzerText(payload);
  return parseScanJson(text);
}

function coerceScanObject(obj: any): DogDutyScanResult | null {
  if (!obj || typeof obj !== 'object') return null;

  // Direct schema match
  if ('found' in obj || Array.isArray(obj.spots)) {
    return normalizeScanObject(obj);
  }

  // Single spot at top level {x,y}
  if (typeof obj.x === 'number' && typeof obj.y === 'number') {
    return {
      found: true,
      spots: [
        {
          x: clamp01(obj.x),
          y: clamp01(obj.y),
          confidence: typeof obj.confidence === 'number' ? obj.confidence : undefined,
          description: typeof obj.description === 'string' ? obj.description : undefined,
        },
      ],
    };
  }

  return null;
}

function normalizeScanObject(obj: any): DogDutyScanResult {
  const spotsRaw = Array.isArray(obj.spots) ? obj.spots : [];
  const spots = spotsRaw
    .filter((s: any) => typeof s?.x === 'number' && typeof s?.y === 'number')
    .map((s: any) => ({
      x: clamp01(Number(s.x)),
      y: clamp01(Number(s.y)),
      confidence: typeof s.confidence === 'number' ? s.confidence : undefined,
      description: typeof s.description === 'string' ? s.description : undefined,
    }));
  const found = obj.found === true || obj.found === 'true' || spots.length > 0;
  return { found, spots };
}

export function parseScanJson(text: string): DogDutyScanResult {
  if (!text) return { found: false, spots: [], error: 'Empty analyzer response' };

  // Strip markdown fences if the model wrapped JSON
  let cleaned = text.trim();
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) cleaned = fence[1].trim();

  // Try whole-string JSON first (structured providers sometimes return pure JSON text)
  try {
    const whole = JSON.parse(cleaned);
    const coerced = coerceScanObject(whole);
    if (coerced) return { ...coerced, rawText: text };
  } catch {
    /* continue */
  }

  // Extract first JSON object by brace matching (handles prose + JSON)
  const start = cleaned.indexOf('{');
  if (start === -1) {
    // Natural-language negative answers
    if (/\b(no|none|nothing|not found|clear|absent)\b/i.test(cleaned)) {
      return { found: false, spots: [], rawText: text };
    }
    return {
      found: false,
      spots: [],
      error: `No JSON object in analyzer response: ${cleaned.slice(0, 160)}`,
      rawText: text,
    };
  }

  let depth = 0;
  let end = -1;
  let inString = false;
  let escape = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  if (end === -1) {
    return {
      found: false,
      spots: [],
      error: `No JSON object in analyzer response: ${cleaned.slice(0, 160)}`,
      rawText: text,
    };
  }

  try {
    const obj = JSON.parse(cleaned.slice(start, end + 1));
    const coerced = coerceScanObject(obj);
    if (coerced) return { ...coerced, rawText: text };
    return {
      found: false,
      spots: [],
      error: 'Analyzer JSON missing found/spots fields',
      rawText: text,
    };
  } catch (err: any) {
    return {
      found: false,
      spots: [],
      error: err?.message || 'Failed to parse analyzer JSON',
      rawText: text,
    };
  }
}
