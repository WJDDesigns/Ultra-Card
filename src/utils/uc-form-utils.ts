import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';

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
        @value-changed=${onChange}
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
}
