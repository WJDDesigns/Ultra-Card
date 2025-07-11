import { HomeAssistant } from 'custom-card-helpers';

/**
 * Extended HomeAssistant interface to store dynamic icon template results
 */
declare module 'custom-card-helpers' {
  interface HomeAssistant {
    __uvc_dynamic_icons?: { [key: string]: string };
  }
}

/**
 * Cache entry for dynamic icon evaluation results
 */
interface IconCacheEntry {
  value: string;
  timestamp: number;
}

/**
 * Service class for handling dynamic icon template evaluation in Ultra Vehicle Card
 */
export class DynamicIconService {
  private _iconSubscriptions: Map<string, Promise<() => Promise<void>>> = new Map();
  private _iconResults: Map<string, string> = new Map();

  // Add cache for icon evaluation results
  private _iconEvaluationCache: Map<string, IconCacheEntry> = new Map();
  private readonly CACHE_TTL = 1000; // 1 second cache TTL

  constructor(private hass: HomeAssistant) {}

  /**
   * Get a specific icon template result
   */
  public getIconResult(templateKey: string): string | undefined {
    // Check cache first
    const cached = this._iconEvaluationCache.get(templateKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value;
    }

    return this._iconResults.get(templateKey);
  }

  /**
   * Check if an icon template subscription exists
   */
  public hasIconSubscription(templateKey: string): boolean {
    return this._iconSubscriptions.has(templateKey);
  }

  /**
   * Get all icon results as a map
   */
  public getAllIconResults(): Map<string, string> {
    return this._iconResults;
  }

  /**
   * Evaluates an icon template string and returns an icon name
   * @param template The template string to evaluate
   * @returns Promise resolving to a string representing the icon name
   */
  public async evaluateIconTemplate(template: string): Promise<string> {
    if (!template || !this.hass) {
      return 'mdi:help-circle-outline'; // Default fallback icon
    }

    const trimmedTemplate = template.trim();
    if (!trimmedTemplate) {
      return 'mdi:help-circle-outline';
    }

    // Check if we have a cached result
    const cacheKey = `icon_eval_${trimmedTemplate}`;
    const cached = this._iconEvaluationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value;
    }

    try {
      // Call HA API to render the template
      const renderedResult = await this.hass.callApi<string>('POST', 'template', {
        template: trimmedTemplate,
      });

      // Process the rendered result as an icon name
      const iconValue = this.parseIconResult(renderedResult);

      // Cache the result
      this._iconEvaluationCache.set(cacheKey, {
        value: iconValue,
        timestamp: Date.now(),
      });

      return iconValue;
    } catch (e: any) {
      // Log specific HA API error if available
      const errorMessage = e.error?.message || e.message || String(e);
      console.error(
        `[UltraVehicleCard] Error evaluating icon template via API: ${trimmedTemplate}. Error: ${errorMessage}`
      );
      return 'mdi:help-circle-outline'; // Return default icon on error
    }
  }

  /**
   * Subscribe to an icon template and store results for later use
   * @param template The template string to subscribe to
   * @param templateKey The unique key to identify this template subscription
   * @param onResultChanged Optional callback when result changes
   */
  public async subscribeToIconTemplate(
    template: string,
    templateKey: string,
    onResultChanged?: () => void
  ): Promise<void> {
    if (!template || !this.hass) {
      return;
    }

    // If we already have a subscription for this key, unsubscribe first
    if (this._iconSubscriptions.has(templateKey)) {
      try {
        const existingSubPromise = this._iconSubscriptions.get(templateKey);
        if (existingSubPromise) {
          const unsubFn = await existingSubPromise;
          if (unsubFn && typeof unsubFn === 'function') {
            await unsubFn();
          }
        }
      } catch (err) {
        // Silently handle unsubscribe errors
      }
      this._iconSubscriptions.delete(templateKey);
    }

    try {
      // Create a subscription to the template
      const subPromise: Promise<() => Promise<void>> = new Promise((resolve, reject) => {
        const unsubFunc = this.hass!.connection.subscribeMessage(
          (message: any) => {
            // Extract the rendered result from the message
            const renderedResult = message.result;

            // Store the original rendered string for use in dynamic icons
            if (!this.hass.__uvc_dynamic_icons) {
              this.hass.__uvc_dynamic_icons = {};
            }
            this.hass.__uvc_dynamic_icons[templateKey] = renderedResult;

            // Update the icon result using the extracted string
            const newValue = this.parseIconResult(renderedResult);
            const oldValue = this._iconResults.get(templateKey);

            if (newValue !== oldValue) {
              // Only request a re-render if the value actually changed
              if (onResultChanged) {
                onResultChanged();
              }
            }

            this._iconResults.set(templateKey, newValue);

            // Also cache the result
            this._iconEvaluationCache.set(templateKey, {
              value: newValue,
              timestamp: Date.now(),
            });
          },
          {
            type: 'render_template',
            template: template,
          }
        );
        resolve(unsubFunc);
      });

      this._iconSubscriptions.set(templateKey, subPromise);
    } catch (err) {
      console.error(`[UltraVehicleCard] Failed to subscribe to icon template: ${template}`, err);
    }
  }

  /**
   * Helper method to parse icon template results
   * @param result The raw result from the template evaluation
   * @returns Processed icon name
   */
  public parseIconResult(result: any): string {
    if (result === undefined || result === null) {
      return 'mdi:help-circle-outline';
    }

    // String values (most common for icons)
    if (typeof result === 'string') {
      const trimmedResult = result.trim();

      // Check if it looks like a valid icon name
      if (this.isValidIcon(trimmedResult)) {
        return trimmedResult;
      }

      // If it doesn't look like an icon, log a warning and return default
      console.warn(
        `[UltraVehicleCard] Icon template evaluated to invalid icon '${trimmedResult}', using default.`
      );
      return 'mdi:help-circle-outline';
    }

    // If it's something else, log it and return default
    console.warn(
      `[UltraVehicleCard] Icon template evaluated to non-string type '${typeof result}', using default.`
    );
    return 'mdi:help-circle-outline';
  }

  /**
   * Basic validation to check if a string looks like a valid icon name
   * @param icon The icon string to validate
   * @returns True if it looks like a valid icon
   */
  private isValidIcon(icon: string): boolean {
    // Check for common icon formats
    const iconPatterns = [
      /^mdi:[\w-]+$/i, // Material Design Icons (mdi:home, mdi:car, etc.)
      /^hass:[\w-]+$/i, // Home Assistant icons
      /^fas:[\w-]+$/i, // Font Awesome Solid
      /^far:[\w-]+$/i, // Font Awesome Regular
      /^fab:[\w-]+$/i, // Font Awesome Brands
      /^fal:[\w-]+$/i, // Font Awesome Light
      /^phu:[\w-]+$/i, // Phosphor Icons
      /^si:[\w-]+$/i, // Simple Icons
      /^tabler:[\w-]+$/i, // Tabler Icons
      /^[\w-]+:[\w-]+$/i, // Generic icon format (prefix:name)
    ];

    return iconPatterns.some(pattern => pattern.test(icon));
  }

  /**
   * Helper method to get icon based on entity state and attributes
   * This can be used within templates for dynamic icon selection
   * @param entityId The entity ID to get icon for
   * @returns Default icon based on entity domain and device class
   */
  public getEntityBasedIcon(entityId: string): string {
    if (!entityId || !this.hass?.states[entityId]) {
      return 'mdi:help-circle-outline';
    }

    const stateObj = this.hass.states[entityId];

    // If entity has a custom icon, use it
    if (stateObj.attributes.icon) {
      return stateObj.attributes.icon;
    }

    const domain = entityId.split('.')[0];
    const deviceClass = stateObj.attributes.device_class;

    // Domain-specific logic for default icons
    switch (domain) {
      case 'binary_sensor':
        switch (deviceClass) {
          case 'door':
            return 'mdi:door';
          case 'garage_door':
            return 'mdi:garage';
          case 'window':
            return 'mdi:window-closed';
          case 'motion':
            return 'mdi:motion-sensor';
          case 'battery':
            return 'mdi:battery';
          case 'lock':
            return 'mdi:lock';
          default:
            return 'mdi:checkbox-marked-circle';
        }
      case 'sensor':
        switch (deviceClass) {
          case 'temperature':
            return 'mdi:thermometer';
          case 'humidity':
            return 'mdi:water-percent';
          case 'battery':
            return 'mdi:battery';
          case 'power':
            return 'mdi:flash';
          case 'energy':
            return 'mdi:lightning-bolt';
          default:
            return 'mdi:gauge';
        }
      case 'light':
        return 'mdi:lightbulb';
      case 'switch':
        return 'mdi:toggle-switch-outline';
      case 'climate':
        return 'mdi:thermostat';
      case 'person':
        return 'mdi:account';
      case 'device_tracker':
        return 'mdi:radar';
      case 'cover':
        return 'mdi:window-shutter';
      case 'lock':
        return 'mdi:lock';
      case 'camera':
        return 'mdi:camera';
      case 'media_player':
        return 'mdi:cast';
      default:
        return 'mdi:help-circle-outline';
    }
  }

  /**
   * Unsubscribe from all icon template subscriptions
   */
  public async unsubscribeAllIconTemplates(): Promise<void> {
    for (const [key, subPromise] of this._iconSubscriptions.entries()) {
      try {
        if (subPromise) {
          const unsubFn = await Promise.resolve(subPromise).catch(err => {
            return null;
          });

          if (unsubFn && typeof unsubFn === 'function') {
            try {
              await unsubFn();
            } catch (unsubErr) {
              // Silently catch errors from calling unsubscribe function
            }
          }
        }
      } catch (err) {
        // Silently catch any remaining errors in the outer try/catch
      }
    }

    // Clear subscriptions and results regardless of any errors
    this._iconSubscriptions.clear();
    this._iconResults.clear();
    this._iconEvaluationCache.clear();
  }

  /**
   * Update the Home Assistant reference
   */
  public updateHass(hass: HomeAssistant): void {
    this.hass = hass;
    // Clear cache when hass reference changes to ensure fresh data
    this._iconEvaluationCache.clear();
  }
}
