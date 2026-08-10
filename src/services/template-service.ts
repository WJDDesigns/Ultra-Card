import { HomeAssistant } from 'custom-card-helpers';
import { preprocessTemplateVariables } from '../utils/uc-template-processor';
import { ucCustomVariablesService } from './uc-custom-variables-service';
import { UltraCardConfig } from '../types';

/**
 * Extended HomeAssistant interface to store template string results
 * This is declared in the main file as well for backwards compatibility
 */
declare module 'custom-card-helpers' {
  interface HomeAssistant {
    __uvc_template_strings?: { [key: string]: string } | undefined;
  }
}

/**
 * Cache entry for template evaluation results
 */
interface CacheEntry {
  value: boolean;
  timestamp: number;
  stringValue?: string | undefined;
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

/** Matches the `$variable` tokens preprocessTemplateVariables substitutes. */
const CUSTOM_VAR_PATTERN = /(?<!\$)\$([a-zA-Z][a-zA-Z0-9_]*)/g;

/** Bounded caches keyed by raw template text, which never changes for a given string. */
const MAX_TEMPLATE_ANALYSIS_ENTRIES = 2000;
const _referencedVarNames = new Map<string, string[]>();
const _usesSnapshotCache = new Map<string, boolean>();

function cacheSet<V>(cache: Map<string, V>, key: string, value: V): V {
  if (cache.size >= MAX_TEMPLATE_ANALYSIS_ENTRIES) cache.clear();
  cache.set(key, value);
  return value;
}

/** The `$var` names a template references, so their values can be checked for staleness. */
function customVarNames(template: string): string[] {
  const cached = _referencedVarNames.get(template);
  if (cached) return cached;
  const names = new Set<string>();
  for (const match of template.matchAll(CUSTOM_VAR_PATTERN)) {
    if (match[1]) names.add(match[1]);
  }
  return cacheSet(_referencedVarNames, template, Array.from(names).sort());
}

/**
 * Whether a template actually reads any of the entity-snapshot variables.
 *
 * The snapshot is passed as `render_template` `variables`, which HA binds once at
 * subscribe time and never refreshes, so keeping it current means tearing the
 * subscription down and building a new one on every state change. That is only
 * worth doing for templates that read the snapshot. Templates written with
 * `states(...)`, `state_attr(...)` and friends need none of it: HA derives their
 * dependencies itself and re-renders over the existing subscription.
 *
 * Errs toward true. A false positive costs a resubscribe we would have done
 * anyway; a false negative would leave a template showing stale values.
 */
function templateUsesVariableSnapshot(
  template: string,
  variables?: Record<string, unknown>
): boolean {
  if (!variables) return false;
  const names = Object.keys(variables);
  if (names.length === 0) return false;

  const cacheKey = `${names.join(',')}\u0000${template}`;
  const cached = _usesSnapshotCache.get(cacheKey);
  if (cached !== undefined) return cached;

  let uses = false;
  for (const name of names) {
    // A key we cannot safely turn into a word-boundary pattern is assumed used.
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
      uses = true;
      break;
    }
    if (new RegExp(`\\b${name}\\b`).test(template)) {
      uses = true;
      break;
    }
  }
  return cacheSet(_usesSnapshotCache, cacheKey, uses);
}

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
 *
 * That resubscribe is only necessary for templates that actually read the snapshot.
 * Callers pass an `entitySignature` whenever the module has an entity, but most
 * templates are written against HA's own globals (`states(...)`, `state_attr(...)`)
 * and never touch it — for those, HA tracks the dependencies itself and re-renders
 * over the existing subscription, so we subscribe once and leave it. Each
 * `render_template` subscription is a real backend task, so avoiding the churn is
 * the single biggest saving available here. See `templateUsesVariableSnapshot`.
 */
export class TemplateService {
  private _templateSubscriptions: Map<string, Promise<() => Promise<void>>> = new Map();
  private _templateResults: Map<string, boolean> = new Map();
  private _previousStringResults: Map<string, string> = new Map();
  private _evaluationCache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 1000;

  /** Last entity snapshot signature passed per template key (for resubscribe decisions). */
  private _entitySignatures: Map<string, string> = new Map();
  /** Last resolved `$var` values per template key; a change means the sent text changed. */
  private _customVarSignatures: Map<string, string> = new Map();
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

  /**
   * Signature of the custom variables this template substitutes. Empty for the
   * common case of a template with no `$var` tokens, so this costs nothing there.
   */
  private _customVarSignature(template: string, cardConfig?: UltraCardConfig): string {
    const names = customVarNames(template);
    if (names.length === 0) return '';
    return names
      .map(name => {
        let value: unknown = null;
        try {
          value = cardConfig
            ? ucCustomVariablesService.resolveVariableInContext(name, this.hass, cardConfig)
            : ucCustomVariablesService.resolveVariable(name, this.hass);
        } catch {
          // An unresolvable variable is left in the template untouched, so treat it
          // as a stable value rather than forcing endless resubscribes.
          value = null;
        }
        return `${name}=${value === null || value === undefined ? '' : String(value)}`;
      })
      .join('\u0001');
  }

  private async _unsubscribeKey(templateKey: string): Promise<void> {
    const subPromise = this._templateSubscriptions.get(templateKey);
    if (subPromise) {
      try {
        const unsubFn = await Promise.resolve(subPromise).catch((): null => null);
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

    // Only track the entity snapshot when the template actually reads it (P1).
    // Otherwise this subscription is created once and left alone, and HA pushes
    // fresh results over it as the entities the template names change.
    const trackEntity =
      entitySignature !== undefined && templateUsesVariableSnapshot(template, variables);

    // `$var` values are substituted into the template text before it is sent, so a
    // changed custom variable needs a new subscription even when the entity
    // snapshot is irrelevant. Previously this only happened by coincidence, when an
    // unrelated state change forced a resubscribe.
    const varSignature = this._customVarSignature(template, cardConfig);

    const prevSig = this._entitySignatures.get(templateKey);
    const prevVarSig = this._customVarSignatures.get(templateKey);
    const hadSub = this._templateSubscriptions.has(templateKey);
    const varsChanged = prevVarSig !== undefined && prevVarSig !== varSignature;

    if (hadSub) {
      if (!trackEntity && !varsChanged) {
        return;
      }
      if (trackEntity && entitySignature === prevSig && !varsChanged) {
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
    this._customVarSignatures.set(templateKey, varSignature);

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
      this._customVarSignatures.delete(key);
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
    this._customVarSignatures.clear();
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
