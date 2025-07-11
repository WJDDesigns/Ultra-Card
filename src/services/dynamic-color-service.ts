import { HomeAssistant } from 'custom-card-helpers';

/**
 * Extended HomeAssistant interface to store dynamic color template results
 */
declare module 'custom-card-helpers' {
  interface HomeAssistant {
    __uvc_dynamic_colors?: { [key: string]: string };
  }
}

/**
 * Cache entry for dynamic color evaluation results
 */
interface ColorCacheEntry {
  value: string;
  timestamp: number;
}

/**
 * Service class for handling dynamic color template evaluation in Ultra Vehicle Card
 */
export class DynamicColorService {
  private _colorSubscriptions: Map<string, Promise<() => Promise<void>>> = new Map();
  private _colorResults: Map<string, string> = new Map();

  // Add cache for color evaluation results
  private _colorEvaluationCache: Map<string, ColorCacheEntry> = new Map();
  private readonly CACHE_TTL = 1000; // 1 second cache TTL

  constructor(private hass: HomeAssistant) {}

  /**
   * Get a specific color template result
   */
  public getColorResult(templateKey: string): string | undefined {
    // Check cache first
    const cached = this._colorEvaluationCache.get(templateKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value;
    }

    return this._colorResults.get(templateKey);
  }

  /**
   * Check if a color template subscription exists
   */
  public hasColorSubscription(templateKey: string): boolean {
    return this._colorSubscriptions.has(templateKey);
  }

  /**
   * Get all color results as a map
   */
  public getAllColorResults(): Map<string, string> {
    return this._colorResults;
  }

  /**
   * Evaluates a color template string and returns a color value
   * @param template The template string to evaluate
   * @returns Promise resolving to a string representing the color value
   */
  public async evaluateColorTemplate(template: string): Promise<string> {
    if (!template || !this.hass) {
      return 'var(--primary-color)'; // Default fallback color
    }

    const trimmedTemplate = template.trim();
    if (!trimmedTemplate) {
      return 'var(--primary-color)';
    }

    // Check if we have a cached result
    const cacheKey = `color_eval_${trimmedTemplate}`;
    const cached = this._colorEvaluationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value;
    }

    try {
      // Call HA API to render the template
      const renderedResult = await this.hass.callApi<string>('POST', 'template', {
        template: trimmedTemplate,
      });

      // Process the rendered result as a color value
      const colorValue = this.parseColorResult(renderedResult);

      // Cache the result
      this._colorEvaluationCache.set(cacheKey, {
        value: colorValue,
        timestamp: Date.now(),
      });

      return colorValue;
    } catch (e: any) {
      // Log specific HA API error if available
      const errorMessage = e.error?.message || e.message || String(e);
      console.error(
        `[UltraVehicleCard] Error evaluating color template via API: ${trimmedTemplate}. Error: ${errorMessage}`
      );
      return 'var(--primary-color)'; // Return default color on error
    }
  }

  /**
   * Subscribe to a color template and store results for later use
   * @param template The template string to subscribe to
   * @param templateKey The unique key to identify this template subscription
   * @param onResultChanged Optional callback when result changes
   */
  public async subscribeToColorTemplate(
    template: string,
    templateKey: string,
    onResultChanged?: () => void
  ): Promise<void> {
    if (!template || !this.hass) {
      return;
    }

    // If we already have a subscription for this key, unsubscribe first
    if (this._colorSubscriptions.has(templateKey)) {
      try {
        const existingSubPromise = this._colorSubscriptions.get(templateKey);
        if (existingSubPromise) {
          const unsubFn = await existingSubPromise;
          if (unsubFn && typeof unsubFn === 'function') {
            await unsubFn();
          }
        }
      } catch (err) {
        // Silently handle unsubscribe errors
      }
      this._colorSubscriptions.delete(templateKey);
    }

    try {
      // Create a subscription to the template
      const subPromise: Promise<() => Promise<void>> = new Promise((resolve, reject) => {
        const unsubFunc = this.hass!.connection.subscribeMessage(
          (message: any) => {
            // Extract the rendered result from the message
            const renderedResult = message.result;

            // Store the original rendered string for use in dynamic colors
            if (!this.hass.__uvc_dynamic_colors) {
              this.hass.__uvc_dynamic_colors = {};
            }
            this.hass.__uvc_dynamic_colors[templateKey] = renderedResult;

            // Update the color result using the extracted string
            const newValue = this.parseColorResult(renderedResult);
            const oldValue = this._colorResults.get(templateKey);

            if (newValue !== oldValue) {
              // Only request a re-render if the value actually changed
              if (onResultChanged) {
                onResultChanged();
              }
            }

            this._colorResults.set(templateKey, newValue);

            // Also cache the result
            this._colorEvaluationCache.set(templateKey, {
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

      this._colorSubscriptions.set(templateKey, subPromise);
    } catch (err) {
      console.error(`[UltraVehicleCard] Failed to subscribe to color template: ${template}`, err);
    }
  }

  /**
   * Helper method to parse color template results
   * @param result The raw result from the template evaluation
   * @returns Processed color value
   */
  public parseColorResult(result: any): string {
    if (result === undefined || result === null) {
      return 'var(--primary-color)';
    }

    // String values (most common for colors)
    if (typeof result === 'string') {
      const trimmedResult = result.trim();

      // Check if it looks like a valid color value
      if (this.isValidColor(trimmedResult)) {
        return trimmedResult;
      }

      // If it doesn't look like a color, log a warning and return default
      console.warn(
        `[UltraVehicleCard] Color template evaluated to invalid color '${trimmedResult}', using default.`
      );
      return 'var(--primary-color)';
    }

    // If it's something else, log it and return default
    console.warn(
      `[UltraVehicleCard] Color template evaluated to non-string type '${typeof result}', using default.`
    );
    return 'var(--primary-color)';
  }

  /**
   * Basic validation to check if a string looks like a valid color
   * @param color The color string to validate
   * @returns True if it looks like a valid color
   */
  private isValidColor(color: string): boolean {
    // Check for common color formats
    const colorPatterns = [
      /^#[0-9A-Fa-f]{3,8}$/, // Hex colors (#fff, #ffffff, #ffffff00)
      /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i, // RGB
      /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/i, // RGBA
      /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/i, // HSL
      /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/i, // HSLA
      /^var\(--[\w-]+\)$/i, // CSS variables
      /^(red|green|blue|yellow|orange|purple|pink|brown|black|white|gray|grey|transparent)$/i, // Named colors
    ];

    return colorPatterns.some(pattern => pattern.test(color));
  }

  /**
   * Unsubscribe from all color template subscriptions
   */
  public async unsubscribeAllColorTemplates(): Promise<void> {
    for (const [key, subPromise] of this._colorSubscriptions.entries()) {
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
    this._colorSubscriptions.clear();
    this._colorResults.clear();
    this._colorEvaluationCache.clear();
  }

  /**
   * Update the Home Assistant reference
   */
  public updateHass(hass: HomeAssistant): void {
    this.hass = hass;
    // Clear cache when hass reference changes to ensure fresh data
    this._colorEvaluationCache.clear();
  }
}
