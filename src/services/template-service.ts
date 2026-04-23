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

/**
 * Service class for handling template evaluation and subscription in Ultra Card.
 *
 * Design note (v3.3.0-beta14+):
 * ----------------------------
 * Starting with beta14 we subscribe to a template exactly ONCE per unique key and
 * never refresh the subscription.  Home Assistant's `render_template` websocket
 * auto-tracks entities referenced via `states('...')`, `state_attr(...)`, etc.
 * To make this work with user templates that use `{{ state }}`, each call site
 * runs the template through `injectEntityContextIntoTemplate()` first, which
 * prepends `{% set state = states('<entity>').state %}` and friends.  HA then
 * sees live entity references and re-evaluates + re-pushes on every state change.
 *
 * This matches the 3.2.1 model (which was stable for users) and eliminates the
 * race conditions that made beta releases flaky.
 */
export class TemplateService {
  private _templateSubscriptions: Map<string, Promise<() => Promise<void>>> = new Map();
  private _templateResults: Map<string, boolean> = new Map();
  // Store previous string values for string-based templates (unified, info_entity, state_text)
  // These need string comparison for change detection, not boolean comparison
  private _previousStringResults: Map<string, string> = new Map();

  // Add cache for template evaluation results
  private _evaluationCache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 1000; // 1 second cache TTL

  constructor(private hass: HomeAssistant) {}

  /**
   * Get a specific template result
   */
  public getTemplateResult(templateKey: string): boolean | undefined {
    // Check cache first
    const cached = this._evaluationCache.get(templateKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value;
    }

    return this._templateResults.get(templateKey);
  }

  /**
   * Check if a template subscription already exists for the given key.
   */
  public hasTemplateSubscription(templateKey: string): boolean {
    return this._templateSubscriptions.has(templateKey);
  }

  /**
   * Get all template results as a map
   */
  public getAllTemplateResults(): Map<string, boolean> {
    return this._templateResults;
  }

  /**
   * Expose the current hass reference so modules can update their own cached
   * template result maps from subscription callbacks.
   */
  public getHass(): HomeAssistant {
    return this.hass;
  }

  /**
   * Subscribe to a template and store results for later use.
   *
   * Call sites should inject entity context into the template BEFORE calling this
   * (via `injectEntityContextIntoTemplate()`), so HA can auto-track the underlying
   * entities and re-push on every state change without us needing to resubscribe.
   *
   * @param template Fully-processed template string to subscribe to (after `$variable`
   *   and entity context injection — this is exactly what's sent to HA).
   * @param templateKey Unique key identifying this subscription.
   * @param onResultChanged Optional callback when the rendered result changes.
   * @param variables Optional static context variables (name, icon config, etc. — do
   *   NOT include state/attributes since those should be injected into the template).
   * @param cardConfig Optional card config for card-specific variable resolution.
   */
  public async subscribeToTemplate(
    template: string,
    templateKey: string,
    onResultChanged?: () => void,
    variables?: Record<string, any>,
    cardConfig?: UltraCardConfig
  ): Promise<void> {
    if (!template || !this.hass) {
      return;
    }

    // Subscribe-once model: if a subscription already exists for this key, keep it.
    if (this._templateSubscriptions.has(templateKey)) {
      return;
    }

    // Preprocess `$variable_name` references (card-local and global variables).
    // Entity context (state/attributes/etc.) should already be injected by the caller.
    const processedTemplate = preprocessTemplateVariables(template, this.hass, cardConfig);

    try {
      const unsubFunc = this.hass.connection.subscribeMessage(
        (message: any) => {
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
            const previousString = this._previousStringResults.get(templateKey);
            hasChanged = previousString !== renderedString;
            this._previousStringResults.set(templateKey, renderedString);
          } else {
            const newValue = this.parseTemplateResult(renderedResult, templateKey);
            const oldValue = this._templateResults.get(templateKey);
            hasChanged = newValue !== oldValue;
            this._templateResults.set(templateKey, newValue);
          }

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

  /**
   * Helper method to parse template results consistently
   * @param result The raw result from the template evaluation
   * @param templateKey Optional template key for context
   * @returns Boolean interpretation of the template result
   */
  public parseTemplateResult(result: any, templateKey?: string): boolean {
    // Check if this is a unified template (which should not be interpreted as boolean)
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

  /**
   * Unsubscribe from template subscriptions whose key starts with the given prefix.
   * Used to clear layout_* subscriptions when config.layout changes.
   */
  public async unsubscribeTemplatesByPrefix(prefix: string): Promise<void> {
    const toRemove: string[] = [];
    for (const key of this._templateSubscriptions.keys()) {
      if (key.startsWith(prefix)) toRemove.push(key);
    }
    for (const key of toRemove) {
      const subPromise = this._templateSubscriptions.get(key);
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
      this._templateSubscriptions.delete(key);
      this._templateResults.delete(key);
      this._previousStringResults.delete(key);
      this._evaluationCache.delete(key);
      if (this.hass?.__uvc_template_strings) {
        delete this.hass.__uvc_template_strings[key];
      }
    }
  }

  /**
   * Unsubscribe from all template subscriptions
   */
  public async unsubscribeAllTemplates(): Promise<void> {
    for (const [, subPromise] of this._templateSubscriptions.entries()) {
      try {
        if (subPromise) {
          const unsubFn = await Promise.resolve(subPromise).catch(() => null);
          if (unsubFn && typeof unsubFn === 'function') {
            try {
              await unsubFn();
            } catch {}
          }
        }
      } catch {}
    }

    this._templateSubscriptions.clear();
    this._templateResults.clear();
    this._evaluationCache.clear();
    this._previousStringResults.clear();
  }

  /**
   * Update the Home Assistant reference.
   *
   * HA replaces the hass object on every entity state change.  Subscription
   * callbacks write template results to `this.hass.__uvc_template_strings`, so
   * when the object changes the results are lost and the next synchronous
   * render reads `undefined`.  We carry over `__uvc_template_strings` from the
   * outgoing object to the incoming one so already-resolved values remain
   * available until new callbacks fire.
   */
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
