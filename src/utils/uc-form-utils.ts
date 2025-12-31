import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { CardModule } from '../types';

// Module-level change guard to prevent infinite loops
let _formChangeGuard = false;

/**
 * Ultra Card form utilities
 * Clean form rendering without CSS label hiding hacks
 */
export class UcFormUtils {
  /**
   * Ultra Card form renderer with computeLabel control
   */
  static renderForm(
    hass: HomeAssistant,
    data: Record<string, any>,
    schema: any[],
    onChange: (e: CustomEvent) => void,
    showLabels: boolean = false
  ): TemplateResult {
    return html`
      <ha-form
        .hass=${hass}
        .data=${data}
        .schema=${schema}
        .computeLabel=${showLabels ? this._defaultComputeLabel : this._hideLabels}
        .computeDescription=${showLabels ? this._defaultComputeDescription : this._hideDescriptions}
        @value-changed=${(e: CustomEvent) => {
          // Prevent re-entrant calls that cause infinite loops
          if (_formChangeGuard) {
            return;
          }

          _formChangeGuard = true;
          // Use requestAnimationFrame for better performance than setTimeout
          requestAnimationFrame(() => {
            _formChangeGuard = false;
          });

          onChange(e);
        }}
      ></ha-form>
    `;
  }

  /**
   * Field section with custom title/description + clean form
   */
  static renderFieldSection(
    title: string,
    description: string,
    hass: HomeAssistant,
    data: Record<string, any>,
    schema: any[],
    onChange: (e: CustomEvent) => void
  ): TemplateResult {
    // Check if this is a boolean field (toggle)
    const isBooleanField = schema.length === 1 && schema[0].selector?.boolean !== undefined;

    if (isBooleanField) {
      // For boolean fields, put title and toggle on the same line
      return html`
        <div class="field-section boolean-field" style="margin-bottom: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 48px;">
            <div style="flex: 1;">
              ${title
                ? html`<div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: ${description
                      ? '4px'
                      : '0'};"
                  >
                    ${title}
                  </div>`
                : ''}
              ${description
                ? html`<div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 0; opacity: 0.8; line-height: 1.4;"
                  >
                    ${description}
                  </div>`
                : ''}
            </div>
            <div style="flex-shrink: 0;">
              ${UcFormUtils.renderForm(hass, data, schema, onChange, false)}
            </div>
          </div>
        </div>
      `;
    }

    // For non-boolean fields, use the original vertical layout
    return html`
      <div class="field-section" style="margin-bottom: 16px;">
        ${title
          ? html`<div
              class="field-title"
              style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
            >
              ${title}
            </div>`
          : ''}
        ${description
          ? html`<div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
            >
              ${description}
            </div>`
          : ''}
        ${UcFormUtils.renderForm(hass, data, schema, onChange, false)}
      </div>
    `;
  }

  /**
   * Multiple field sections in a settings group
   */
  static renderSettingsSection(
    title: string,
    description: string,
    fields: Array<{
      title: string;
      description: string;
      hass: HomeAssistant;
      data: Record<string, any>;
      schema: any[];
      onChange: (e: CustomEvent) => void;
    }>
  ): TemplateResult {
    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        ${title
          ? html`
              <div
                class="section-title"
                style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
              >
                ${title}
              </div>
            `
          : ''}
        ${description
          ? html`
              <div
                style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
              >
                ${description}
              </div>
            `
          : ''}
        ${fields.map(field =>
          UcFormUtils.renderFieldSection(
            field.title,
            field.description,
            field.hass,
            field.data,
            field.schema,
            field.onChange
          )
        )}
      </div>
    `;
  }

  /**
   * Schema builders for common field types
   */
  static entity(name: string, domain?: string[]): any {
    return {
      name,
      selector: {
        entity: domain ? { domain } : {},
      },
    };
  }

  static text(name: string, multiline: boolean = false): any {
    return {
      name,
      selector: {
        text: multiline ? { multiline: true } : {},
      },
    };
  }

  static select(name: string, options: Array<{ value: string; label: string }>): any {
    return {
      name,
      selector: {
        select: {
          options,
          mode: 'dropdown',
        },
      },
    };
  }

  static icon(name: string): any {
    return {
      name,
      selector: { icon: {} },
    };
  }

  static boolean(name: string): any {
    return {
      name,
      selector: { boolean: {} },
    };
  }

  static number(name: string, min?: number, max?: number, step?: number): any {
    const numberConfig: any = {};
    if (min !== undefined) numberConfig.min = min;
    if (max !== undefined) numberConfig.max = max;
    if (step !== undefined) numberConfig.step = step;

    return {
      name,
      selector: {
        number: Object.keys(numberConfig).length ? numberConfig : {},
      },
    };
  }

  static color(name: string): any {
    return {
      name,
      selector: { color_rgb: {} },
    };
  }

  static grid(schema: any[]): any {
    return {
      type: 'grid',
      name: '',
      schema,
    };
  }

  static expandable(name: string, title: string, schema: any[]): any {
    return {
      type: 'expandable',
      name,
      title,
      schema,
    };
  }

  // Label control functions
  private static _hideLabels = (): string => '';
  private static _defaultComputeLabel = (schema: any): string => schema.name;
  private static _hideDescriptions = (): string => '';
  private static _defaultComputeDescription = (schema: any): string => schema.description || '';

  /**
   * Get clean form styles
   */
  static getCleanFormStyles(): string {
    return `
      .field-section {
        margin-bottom: 16px;
      }

      .field-title {
        font-size: 16px !important;
        font-weight: 600 !important;
       
        margin-bottom: 4px !important;
        display: block !important;
      }

      .field-description {
        font-size: 13px !important;
        color: var(--secondary-text-color) !important;
        margin-bottom: 12px !important;
        display: block !important;
        opacity: 0.8 !important;
        line-height: 1.4 !important;
      }

      .section-title {
        font-size: 18px !important;
        font-weight: 700 !important;
        color: var(--primary-color) !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
      }

      .settings-section {
        margin-bottom: 16px;
        max-width: 100%;
        box-sizing: border-box;
      }

      /* Ensure form elements are properly sized */
      ha-form {
        display: block;
        width: 100%;
      }

      ha-form ha-select,
      ha-form ha-textfield,
      ha-form ha-entity-picker,
      ha-form ha-icon-picker {
        width: 100%;
        --mdc-theme-primary: var(--primary-color);
      }

      /* Boolean fields - inline layout with title and toggle on same line */
      .boolean-field ha-form {
        width: auto;
        display: inline-block;
      }

      .boolean-field ha-formfield {
        display: inline-flex !important;
        align-items: center !important;
      }

      .boolean-field ha-switch {
        --mdc-theme-secondary: var(--primary-color);
      }

      /* Gap control styles - Standardized Slider Pattern */
      .gap-control-container {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .gap-slider {
        flex: 1;
        height: 6px;
        background: var(--divider-color);
        border-radius: 3px;
        outline: none;
        appearance: none;
        -webkit-appearance: none;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .gap-slider::-webkit-slider-thumb {
        appearance: none;
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        background: var(--primary-color);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .gap-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        background: var(--primary-color);
        border-radius: 50%;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .gap-slider:hover {
        background: var(--primary-color);
        opacity: 0.7;
      }

      .gap-slider:hover::-webkit-slider-thumb {
        transform: scale(1.1);
      }

      .gap-slider:hover::-moz-range-thumb {
        transform: scale(1.1);
      }

      .gap-input {
        width: 48px !important;
        max-width: 48px !important;
        min-width: 48px !important;
        padding: 4px 6px !important;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 13px;
        text-align: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
        box-sizing: border-box;
      }

      .gap-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
      }

      .reset-btn {
        width: 36px;
        height: 36px;
        padding: 0;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .reset-btn:hover {
        background: var(--primary-color);
        color: var(--text-primary-color);
        border-color: var(--primary-color);
      }

      .reset-btn ha-icon {
        font-size: 16px;
      }
    `;
  }

  /**
   * Inject clean form styles
   */
  static injectCleanFormStyles(): TemplateResult {
    return html`
      <style>
        ${UcFormUtils.getCleanFormStyles()}
      </style>
    `;
  }

  /**
   * Calculate the nesting depth of layout modules
   * @param module The module to check
   * @param currentDepth The current depth (used internally for recursion)
   * @returns The maximum nesting depth found
   */
  static getLayoutNestingDepth(module: CardModule, currentDepth: number = 0): number {
    // Only layout modules contribute to nesting depth
    if (module.type !== 'horizontal' && module.type !== 'vertical') {
      return currentDepth;
    }

    let maxDepth = currentDepth + 1;
    const layoutModule = module as any;

    // Check children if they exist
    if (layoutModule.modules && layoutModule.modules.length > 0) {
      for (const childModule of layoutModule.modules) {
        const childDepth = UcFormUtils.getLayoutNestingDepth(childModule, currentDepth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    }

    return maxDepth;
  }

  /**
   * Check if adding a module would exceed the maximum nesting depth
   * @param parentModule The parent layout module
   * @param childModule The child module to add
   * @param maxDepth Maximum allowed nesting depth (default: 3, allowing 2 levels of layout modules)
   * @returns True if the nesting would be valid, false otherwise
   */
  static validateNestingDepth(
    parentModule: CardModule,
    childModule: CardModule,
    maxDepth: number = 3
  ): { valid: boolean; error?: string } {
    // If parent is not a layout module, no nesting restrictions
    if (parentModule.type !== 'horizontal' && parentModule.type !== 'vertical') {
      return { valid: true };
    }

    // If child is not a layout module, it's always valid
    if (childModule.type !== 'horizontal' && childModule.type !== 'vertical') {
      return { valid: true };
    }

    // Calculate what the depth would be if we added this child
    const parentDepth = UcFormUtils.getLayoutNestingDepth(parentModule);
    const childDepth = UcFormUtils.getLayoutNestingDepth(childModule);
    const combinedDepth = parentDepth + childDepth;

    if (combinedDepth > maxDepth) {
      return {
        valid: false,
        error: `Layout modules cannot be nested more than ${maxDepth - 1} levels deep. This would create ${combinedDepth - 1} levels of layout nesting.`,
      };
    }

    return { valid: true };
  }
}
