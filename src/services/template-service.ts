import { HomeAssistant } from 'custom-card-helpers';
import { preprocessTemplateVariables } from '../utils/uc-template-processor';

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
 * Service class for handling template evaluation and subscription in Ultra Vehicle Card
 */
export class TemplateService {
  private _templateSubscriptions: Map<string, Promise<() => Promise<void>>> = new Map();
  private _templateResults: Map<string, boolean> = new Map();

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
   * Check if a template subscription exists
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
   * REMOVED: evaluateTemplate method - use subscribeToTemplate instead
   * This method was causing API flooding and is no longer needed since we use WebSocket subscriptions
   */

  /**
   * Subscribe to a template and store results for later use
   * @param template The template string to subscribe to
   * @param templateKey The unique key to identify this template subscription
   * @param onResultChanged Optional callback when template result changes
   * @param variables Optional context variables to pass to the template (for entity context)
   */
  public async subscribeToTemplate(
    template: string,
    templateKey: string,
    onResultChanged?: () => void,
    variables?: Record<string, any>
  ): Promise<void> {
    if (!template || !this.hass) {
      return;
    }

    // If we already have a subscription for this key, DO NOT recreate it
    // Just return early - the existing subscription is still active
    if (this._templateSubscriptions.has(templateKey)) {
      return; // Subscription already exists, don't create a duplicate
    }

    // Preprocess custom variables ($variable_name) before sending to Home Assistant
    // This allows users to use {{ $my_variable }} syntax to reference entity states
    const processedTemplate = preprocessTemplateVariables(template, this.hass);

    try {
      // Create a subscription to the template
      const unsubFunc = this.hass.connection.subscribeMessage(
        (message: any) => {
          // Extract the rendered result from the message
          const renderedResult = message.result;

          // Store the original rendered string for use in state text templates
          if (!this.hass.__uvc_template_strings) {
            this.hass.__uvc_template_strings = {};
          }
          this.hass.__uvc_template_strings[templateKey] = renderedResult;

          // Update the template result using the extracted string
          const newValue = this.parseTemplateResult(renderedResult, templateKey);
          const oldValue = this._templateResults.get(templateKey);

          if (newValue !== oldValue) {
            // Only request a re-render if the value actually changed
            if (onResultChanged) {
              onResultChanged();
            }
          }

          this._templateResults.set(templateKey, newValue);

          // Also cache the result
          this._evaluationCache.set(templateKey, {
            value: newValue,
            timestamp: Date.now(),
            stringValue: renderedResult,
          });
        },
        {
          type: 'render_template',
          template: processedTemplate,
          variables: variables || {}, // Pass entity context variables to HA
        }
      );

      // Store the unsubscribe function directly instead of wrapping it in a Promise
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
      // Unified templates return JSON or strings that are parsed by the module
      // The original string value is stored in __uvc_template_strings
      // Return true to indicate the template was successfully processed
      return true;
    }

    // Check if this is an info entity template (which should not be interpreted as boolean)
    if (templateKey && templateKey.startsWith('info_entity_')) {
      // Info entity templates should preserve their actual values
      // The original string value is stored in __uvc_template_strings
      // Return true to indicate the template was successfully processed
      return true;
    }

    // Check if this is a state text template (which should not be interpreted as boolean)
    if (templateKey && templateKey.startsWith('state_text_')) {
      // For state
      // text templates, we don't parse the result as boolean
      // The original string value is stored separately in __uvc_template_strings
      // Return true to indicate the template was successfully processed
      return true;
    }

    // For active/inactive state templates, interpret the result as a boolean
    if (result === undefined || result === null) {
      return false;
    }

    // Direct boolean value
    if (typeof result === 'boolean') {
      return result;
    }

    // Number values
    if (typeof result === 'number') {
      return result !== 0;
    }

    // String values (case-insensitive)
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
        // Treat strings with content that aren't known false values as true
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

    // If it's something else (object, function, etc.), it's probably an error, so log it
    console.warn(
      `[UltraVehicleCard] Template evaluated to ambiguous type '${typeof result}', interpreting as false.`
    );
    return false;
  }

  /**
   * Unsubscribe from all template subscriptions
   */
  public async unsubscribeAllTemplates(): Promise<void> {
    for (const [key, subPromise] of this._templateSubscriptions.entries()) {
      try {
        // Check if promise exists and is not already settled with an error
        if (subPromise) {
          // Use Promise.resolve().catch to safely handle the promise without throwing
          const unsubFn = await Promise.resolve(subPromise).catch(err => {
            // Silently handle promise rejection and return null
            return null;
          });

          // Only try to call the unsubscribe function if it exists
          if (unsubFn && typeof unsubFn === 'function') {
            try {
              await unsubFn();
            } catch (unsubErr) {
              // Silently catch errors from calling unsubscribe function
              // Don't log to console to avoid cluttering the console
            }
          }
        }
      } catch (err) {
        // Silently catch any remaining errors in the outer try/catch
        // Don't log to console to avoid cluttering the console
      }
    }

    // Clear subscriptions and results regardless of any errors
    this._templateSubscriptions.clear();
    this._templateResults.clear();
    this._evaluationCache.clear(); // Also clear the cache
  }

  /**
   * Update the Home Assistant reference
   */
  public updateHass(hass: HomeAssistant): void {
    this.hass = hass;
    // Clear cache when hass reference changes to ensure fresh data
    this._evaluationCache.clear();
  }
}
