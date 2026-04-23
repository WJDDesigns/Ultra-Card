import { HomeAssistant } from 'custom-card-helpers';
import { preprocessTemplateVariables } from '../utils/uc-template-processor';
import { UltraCardConfig } from '../types';

/**
 * Extended HomeAssistant interface to store template string results
 * This is declared in the main file as well for backwards compatibility
 */
declare module 'custom-card-helpers' {
  interface HomeAssistant {
    __uvc_template_strings?: { [key: string]: string };
  }
}

/**
 * Cache entry for template evaluation results
 */
interface CacheEntry {
  value: boolean;
  timestamp: number;
  stringValue?: string;
}

/**
 * Check if a template key is for a string-based template (unified, info_entity, state_text)
 * These templates return JSON/text that should be compared as strings, not booleans
 */
function isStringBasedTemplate(templateKey: string): boolean {
  return (
    templateKey.startsWith('unified_') ||
    templateKey.startsWith('info_entity_') ||
    templateKey.startsWith('state_text_') ||
    templateKey.startsWith('bar_left_') ||
    templateKey.startsWith('bar_right_') ||
    templateKey.startsWith('layout_cols_') ||
    templateKey.startsWith('layout_mods_')
  );
}

const STATIC_SIG = '__STATIC__';

/**
 * Service class for handling template evaluation and subscription in Ultra Card.
 *
 * Design note (v3.3.0-beta15+):
 * ----------------------------
 * Home Assistant's `render_template` websocket does **not** refresh the `variables`
 * object when entity state changes — and templates that only reference `{{ state }}`
 * from variables often register **no** entity listeners.  Ultra Card therefore
 * passes live entity context via `variables` (see `buildEntityContext`) and passes
 * an `entitySignature` string that changes whenever that snapshot changes.  When the
 * signature changes we unsubscribe and subscribe again so HA re-evaluates with fresh
 * variables.  A per-key monotonic generation counter drops late callbacks from dead
 * subscriptions (race safety).  The first websocket message after each subscribe
 * always persists to `hass.__uvc_template_strings` and fires `onResultChanged` so the
 * UI never "misses" an update waiting on string equality.
 */
export class TemplateService {
  private _templateSubscriptions: Map<string, Promise<() => Promise<void>>> = new Map();
  private _templateResults: Map<string, boolean> = new Map();
  private _previousStringResults: Map<string, string> = new Map();
  private _evaluationCache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 1000;

  /** Last entity snapshot signature passed per template key (for resubscribe decisions). */
  private _entitySignatures: Map<string, string> = new Map();
  /** Latest generation for a key; subscription callbacks with older gen are ignored. */
  private _liveGenByKey: Map<string, number> = new Map();
  /** Serialize subscribe/unsubscribe per key to avoid overlapping WS operations. */
  private _subscribeChains: Map<string, Promise<void>> = new Map();

  constructor(private hass: HomeAssistant) {}

  public getTemplateResult(templateKey: string): boolean | undefined {
    const cached = this._evaluationCache.get(templateKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value;
    }
    return this._templateResults.get(templateKey);
  }

  public hasTemplateSubscription(templateKey: string): boolean {
    return this._templateSubscriptions.has(templateKey);
  }

  public getAllTemplateResults(): Map<string, boolean> {
    return this._templateResults;
  }

  public getHass(): HomeAssistant {
    return this.hass;
  }

  /**
   * Subscribe to a template and store results for later use.
   *
   * @param entitySignature When provided, re-subscribes whenever this string changes
   *   (typically `computeEntitySignature(entityId, hass)`). When omitted, subscribes
   *   once and never refreshes the subscription (layout templates, logic conditions, etc.).
   */
  public subscribeToTemplate(
    template: string,
    templateKey: string,
    onResultChanged?: () => void,
    variables?: Record<string, any>,
    cardConfig?: UltraCardConfig,
    entitySignature?: string
  ): void {
    const key = templateKey;
    const prev = this._subscribeChains.get(key) ?? Promise.resolve();
    const next = prev
      .then(() =>
        this._subscribeToTemplateInner(
          template,
          templateKey,
          onResultChanged,
          variables,
          cardConfig,
          entitySignature
        )
      )
      .catch(err =>
        console.error(`[UltraCard] Template subscribe chain error [${templateKey}]:`, err)
      );
    this._subscribeChains.set(key, next);
  }

  private async _unsubscribeKey(templateKey: string): Promise<void> {
    const subPromise = this._templateSubscriptions.get(templateKey);
    if (subPromise) {
      try {
        const unsubFn = await Promise.resolve(subPromise).catch(() => null);
        if (unsubFn && typeof unsubFn === 'function') {
          try {
            await unsubFn();
          } catch {}
        }
      } catch {}
    }
    this._templateSubscriptions.delete(templateKey);
  }

  private async _subscribeToTemplateInner(
    template: string,
    templateKey: string,
    onResultChanged?: () => void,
    variables?: Record<string, any>,
    cardConfig?: UltraCardConfig,
    entitySignature?: string
  ): Promise<void> {
    if (!template || !this.hass) {
      return;
    }

    const trackEntity = entitySignature !== undefined;
    const prevSig = this._entitySignatures.get(templateKey);
    const hadSub = this._templateSubscriptions.has(templateKey);

    if (hadSub) {
      if (!trackEntity) {
        return;
      }
      if (entitySignature === prevSig) {
        return;
      }
      const preserved = this.hass.__uvc_template_strings?.[templateKey];
      await this._unsubscribeKey(templateKey);
      if (!this.hass.__uvc_template_strings) {
        this.hass.__uvc_template_strings = {};
      }
      if (preserved !== undefined) {
        this.hass.__uvc_template_strings[templateKey] = preserved;
      }
    } else if (trackEntity) {
      // first subscription with tracking
    } else {
      // first static subscription
    }

    const processedTemplate = preprocessTemplateVariables(template, this.hass, cardConfig);

    const myGen = (this._liveGenByKey.get(templateKey) || 0) + 1;
    this._liveGenByKey.set(templateKey, myGen);

    if (trackEntity) {
      this._entitySignatures.set(templateKey, entitySignature!);
    } else {
      this._entitySignatures.set(templateKey, STATIC_SIG);
    }

    let isFirstMessage = true;

    try {
      const unsubFunc = this.hass.connection.subscribeMessage(
        (message: any) => {
          if (this._liveGenByKey.get(templateKey) !== myGen) {
            return;
          }

          const renderedResult = message.result;
          const renderedString =
            renderedResult !== null && typeof renderedResult === 'object'
              ? JSON.stringify(renderedResult)
              : String(renderedResult);

          if (!this.hass.__uvc_template_strings) {
            this.hass.__uvc_template_strings = {};
          }
          this.hass.__uvc_template_strings[templateKey] = renderedResult;

          let hasChanged = false;
          if (isStringBasedTemplate(templateKey)) {
            if (isFirstMessage) {
              hasChanged = true;
            } else {
              const previousString = this._previousStringResults.get(templateKey);
              hasChanged = previousString !== renderedString;
            }
            this._previousStringResults.set(templateKey, renderedString);
          } else {
            const newValue = this.parseTemplateResult(renderedResult, templateKey);
            if (isFirstMessage) {
              hasChanged = true;
            } else {
              const oldValue = this._templateResults.get(templateKey);
              hasChanged = newValue !== oldValue;
            }
            this._templateResults.set(templateKey, newValue);
          }

          isFirstMessage = false;

          if (hasChanged && onResultChanged) {
            onResultChanged();
          }

          const boolValue = this.parseTemplateResult(renderedResult, templateKey);
          this._templateResults.set(templateKey, boolValue);
          this._evaluationCache.set(templateKey, {
            value: boolValue,
            timestamp: Date.now(),
            stringValue: renderedString,
          });
        },
        {
          type: 'render_template',
          template: processedTemplate,
          variables: variables || {},
        }
      );

      this._templateSubscriptions.set(templateKey, Promise.resolve(unsubFunc));
    } catch (err) {
      console.error(`[UltraCard] Failed to subscribe to template: ${template}`, err);
    }
  }

  public parseTemplateResult(result: any, templateKey?: string): boolean {
    if (templateKey && templateKey.startsWith('unified_')) {
      return true;
    }
    if (templateKey && templateKey.startsWith('info_entity_')) {
      return true;
    }
    if (templateKey && templateKey.startsWith('state_text_')) {
      return true;
    }
    if (result === undefined || result === null) {
      return false;
    }
    if (typeof result === 'boolean') {
      return result;
    }
    if (typeof result === 'number') {
      return result !== 0;
    }
    if (typeof result === 'string') {
      const lowerResult = result.toLowerCase().trim();
      return (
        lowerResult === 'true' ||
        lowerResult === 'on' ||
        lowerResult === 'yes' ||
        lowerResult === 'active' ||
        lowerResult === 'home' ||
        lowerResult === '1' ||
        lowerResult === 'open' ||
        lowerResult === 'unlocked' ||
        (lowerResult !== 'false' &&
          lowerResult !== 'off' &&
          lowerResult !== 'no' &&
          lowerResult !== 'inactive' &&
          lowerResult !== 'not_home' &&
          lowerResult !== 'away' &&
          lowerResult !== '0' &&
          lowerResult !== 'closed' &&
          lowerResult !== 'locked' &&
          lowerResult !== 'unavailable' &&
          lowerResult !== 'unknown' &&
          lowerResult !== '')
      );
    }
    console.warn(
      `[UltraCard] Template evaluated to ambiguous type '${typeof result}', interpreting as false.`
    );
    return false;
  }

  public async unsubscribeTemplatesByPrefix(prefix: string): Promise<void> {
    const toRemove: string[] = [];
    for (const key of this._templateSubscriptions.keys()) {
      if (key.startsWith(prefix)) toRemove.push(key);
    }
    for (const key of toRemove) {
      await this._unsubscribeKey(key);
      this._templateResults.delete(key);
      this._previousStringResults.delete(key);
      this._evaluationCache.delete(key);
      this._entitySignatures.delete(key);
      this._liveGenByKey.delete(key);
      this._subscribeChains.delete(key);
      if (this.hass?.__uvc_template_strings) {
        delete this.hass.__uvc_template_strings[key];
      }
    }
  }

  public async unsubscribeAllTemplates(): Promise<void> {
    for (const key of [...this._templateSubscriptions.keys()]) {
      await this._unsubscribeKey(key);
    }
    this._templateSubscriptions.clear();
    this._templateResults.clear();
    this._evaluationCache.clear();
    this._previousStringResults.clear();
    this._entitySignatures.clear();
    this._liveGenByKey.clear();
    this._subscribeChains.clear();
  }

  public updateHass(hass: HomeAssistant): void {
    if (this.hass && hass !== this.hass) {
      if (this.hass.__uvc_template_strings) {
        if (!hass.__uvc_template_strings) {
          hass.__uvc_template_strings = {};
        }
        Object.assign(hass.__uvc_template_strings, this.hass.__uvc_template_strings);
      }
      if ((this.hass as any).__uvc_todo_cache) {
        if (!(hass as any).__uvc_todo_cache) {
          (hass as any).__uvc_todo_cache = Object.create(null);
        }
        Object.assign((hass as any).__uvc_todo_cache, (this.hass as any).__uvc_todo_cache);
      }
    }
    this.hass = hass;
    this._evaluationCache.clear();
  }
}
