import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { CardModule, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalDesignTab } from '../tabs/global-design-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { UcFormUtils } from '../utils/uc-form-utils';

// Module metadata interface
export interface ModuleMetadata {
  type: string;
  title: string;
  description: string;
  author: string;
  version: string;
  icon: string;
  category: 'content' | 'layout' | 'media' | 'data' | 'interactive';
  tags: string[];
}

// Base module interface that all modules must implement
export interface UltraModule {
  // Module identification
  metadata: ModuleMetadata;

  // Create a default instance of this module
  createDefault(id?: string, hass?: HomeAssistant): CardModule;

  // Render the module's general settings tab
  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult;

  // Optional: Render the module's actions settings tab
  renderActionsTab?(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void,
    updateConfig?: (updates: Partial<UltraCardConfig>) => void
  ): TemplateResult;

  // Optional: Render the module's other settings tab
  renderOtherTab?(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult;

  // Optional: Render the module's design settings tab
  renderDesignTab?(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult;

  // Optional: Render the module's YAML settings tab (for external cards)
  renderYamlTab?(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult;

  // Render the module preview/content
  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    isEditorPreview?: boolean
  ): TemplateResult;

  // Validate module configuration
  validate(module: CardModule): { valid: boolean; errors: string[] };

  // Optional: Custom CSS for this module type
  getStyles?(): string;

  // Optional: Module-specific migrations for config updates
  migrate?(module: any, fromVersion: string, toVersion: string): CardModule;
}

// Base abstract class that provides common functionality
export abstract class BaseUltraModule implements UltraModule {
  abstract metadata: ModuleMetadata;

  abstract createDefault(id?: string, hass?: HomeAssistant): CardModule;
  abstract renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult;
  abstract renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    isEditorPreview?: boolean
  ): TemplateResult;

  // Default Actions tab implementation - can be overridden
  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void,
    updateConfig?: (updates: Partial<UltraCardConfig>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module, hass, updates => updateModule(updates));
  }

  // Default Other/Logic tab implementation - can be overridden
  renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module, hass, updates => updateModule(updates));
  }

  // Default Design tab implementation - can be overridden
  renderDesignTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalDesignTab.render(module, hass, updates => updateModule(updates));
  }

  // Default validation - can be overridden
  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!module.id) {
      errors.push('Module ID is required');
    }

    if (!module.type) {
      errors.push('Module type is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Helper method to generate unique IDs
  protected generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Helper method to render form fields
  protected renderFormField(
    label: string,
    input: TemplateResult,
    description?: string
  ): TemplateResult {
    return html`
      <div class="form-field">
        <label class="form-label">${label}</label>
        ${input} ${description ? html`<div class="form-description">${description}</div>` : ''}
      </div>
    `;
  }

  // Helper method to render color picker
  protected renderColorPicker(
    label: string,
    value: string,
    onChange: (color: string) => void,
    description?: string
  ): TemplateResult {
    return this.renderFormField(
      label,
      html`
        <input
          type="color"
          .value=${value || '#000000'}
          @change=${(e: Event) => onChange((e.target as HTMLInputElement).value)}
        />
      `,
      description
    );
  }

  // Helper method to render number input
  protected renderNumberInput(
    label: string,
    value: number,
    onChange: (value: number) => void,
    options: { min?: number; max?: number; step?: number; defaultValue?: number } = {},
    description?: string
  ): TemplateResult {
    const defaultVal = options.defaultValue ?? 0;
    return this.renderFormField(
      label,
      html`
        <input
          type="number"
          .value=${value ?? ''}
          placeholder=${defaultVal.toString()}
          min=${options.min || 0}
          max=${options.max || 1000}
          step=${options.step || 1}
          @input=${(e: Event) => {
            const target = e.target as HTMLInputElement;
            const inputValue = target.value.trim();
            onChange(inputValue === '' ? defaultVal : Number(inputValue));
          }}
        />
      `,
      description
    );
  }

  // Helper method to render text input
  protected renderTextInput(
    label: string,
    value: string,
    onChange: (value: string) => void,
    placeholder?: string,
    description?: string
  ): TemplateResult {
    return this.renderFormField(
      label,
      html`
        <input
          type="text"
          .value=${value || ''}
          placeholder=${placeholder || ''}
          @input=${(e: Event) => onChange((e.target as HTMLInputElement).value)}
        />
      `,
      description
    );
  }

  // Helper method to render entity picker
  protected renderEntityPicker(
    label: string,
    value: string,
    onChange: (value: string) => void,
    hass: HomeAssistant,
    placeholder?: string,
    description?: string,
    entityFilter?: (entityId: string) => boolean
  ): TemplateResult {
    return this.renderFormField(
      '',
      html`
        <ha-form
          .hass=${hass}
          .data=${{ entity: value || '' }}
          .schema=${[
            {
              name: 'entity',
              selector: { entity: {} },
              label: label,
              description: description || '',
            },
          ]}
          .computeLabel=${schema => schema.label || schema.name}
          .computeDescription=${schema => schema.description || ''}
          @value-changed=${(e: CustomEvent) => onChange(e.detail.value.entity)}
        ></ha-form>
      `,
      ''
    );
  }

  // Helper method to render textarea
  protected renderTextArea(
    label: string,
    value: string,
    onChange: (value: string) => void,
    placeholder?: string,
    description?: string
  ): TemplateResult {
    return this.renderFormField(
      label,
      html`
        <textarea
          .value=${value || ''}
          placeholder=${placeholder || ''}
          rows="3"
          @input=${(e: Event) => onChange((e.target as HTMLTextAreaElement).value)}
        ></textarea>
      `,
      description
    );
  }

  // Helper method to render select dropdown
  protected renderSelect(
    label: string,
    value: string,
    options: { value: string; label: string }[],
    onChange: (value: string) => void,
    description?: string
  ): TemplateResult {
    return this.renderFormField(
      label,
      html`
        <select
          .value=${value || ''}
          @change=${(e: Event) => onChange((e.target as HTMLSelectElement).value)}
        >
          ${options.map(option => html`<option value="${option.value}">${option.label}</option>`)}
        </select>
      `,
      description
    );
  }

  // Helper method to render checkbox
  protected renderCheckbox(
    label: string,
    checked: boolean,
    onChange: (checked: boolean) => void,
    description?: string
  ): TemplateResult {
    return this.renderFormField(
      '',
      html`
        <label class="checkbox-wrapper">
          <input
            type="checkbox"
            .checked=${checked || false}
            @change=${(e: Event) => onChange((e.target as HTMLInputElement).checked)}
          />
          ${label}
        </label>
      `,
      description
    );
  }

  /**
   * Helper method to wrap conditional fields in a visually grouped container
   * This creates a consistent UI pattern for fields that appear/disappear based on selections
   * Features a primary-color left border, header, and subtle background highlighting
   *
   * @param header - The header text for the conditional group
   * @param content - The content (fields) to display inside the group
   * @returns TemplateResult with the wrapped content
   *
   * Usage example:
   * ```
   * ${condition ? this.renderConditionalFieldsGroup('Template Configuration', html`
   *   <div class="field-title">Template</div>
   *   <ha-form ...></ha-form>
   * `) : ''}
   * ```
   *
   * Required CSS (add to your module's getStyles() method):
   * ```css
   * .conditional-fields-group {
   *   margin-top: 16px;
   *   border-left: 4px solid var(--primary-color);
   *   background: rgba(var(--rgb-primary-color), 0.08);
   *   border-radius: 0 8px 8px 0;
   *   overflow: hidden;
   *   transition: all 0.2s ease;
   * }
   *
   * .conditional-fields-group:hover {
   *   background: rgba(var(--rgb-primary-color), 0.12);
   * }
   *
   * .conditional-fields-header {
   *   background: rgba(var(--rgb-primary-color), 0.15);
   *   padding: 12px 16px;
   *   font-size: 14px;
   *   font-weight: 600;
   *   color: var(--primary-color);
   *   border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);
   *   text-transform: uppercase;
   *   letter-spacing: 0.5px;
   * }
   *
   * .conditional-fields-content {
   *   padding: 16px;
   * }
   *
   * .conditional-fields-content > .field-title:first-child {
   *   margin-top: 0 !important;
   * }
   *
   * .conditional-fields-group {
   *   animation: slideInFromLeft 0.3s ease-out;
   * }
   *
   * @keyframes slideInFromLeft {
   *   from { opacity: 0; transform: translateX(-10px); }
   *   to { opacity: 1; transform: translateX(0); }
   * }
   * ```
   */
  protected renderConditionalFieldsGroup(header: string, content: TemplateResult): TemplateResult {
    return html`
      <div class="conditional-fields-group">
        <div class="conditional-fields-header">${header}</div>
        <div class="conditional-fields-content">${content}</div>
      </div>
    `;
  }

  // ======== ULTRA CARD FORM UTILITIES ========
  // Clean form rendering without CSS label hiding

  /**
   * Ultra Card form renderer
   */
  protected renderUcForm = (
    hass: HomeAssistant,
    data: Record<string, any>,
    schema: any[],
    onChange: (e: CustomEvent) => void,
    hideLabels: boolean = true
  ) => UcFormUtils.renderForm(hass, data, schema, onChange, hideLabels);

  /**
   * Field section with custom title/description + clean form
   */
  protected renderFieldSection = (
    title: string,
    description: string,
    hass: HomeAssistant,
    data: Record<string, any>,
    schema: any[],
    onChange: (e: CustomEvent) => void
  ) => UcFormUtils.renderFieldSection(title, description, hass, data, schema, onChange);

  /**
   * Settings section with multiple fields
   */
  protected renderSettingsSection = (
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
  ) => UcFormUtils.renderSettingsSection(title, description, fields);

  /**
   * Inject clean form styles
   */
  protected injectUcFormStyles = () => UcFormUtils.injectCleanFormStyles();

  // Schema shortcuts for common field types
  protected entityField = UcFormUtils.entity;
  protected textField = UcFormUtils.text;
  protected selectField = UcFormUtils.select;
  protected iconField = UcFormUtils.icon;
  protected booleanField = UcFormUtils.boolean;
  protected numberField = UcFormUtils.number;
  protected colorField = UcFormUtils.color;
  protected gridField = UcFormUtils.grid;
  protected expandableField = UcFormUtils.expandable;

  /**
   * Trigger a preview update event
   *
   * Call this method after making changes that should update the Live Preview
   * (e.g., template evaluation, dynamic content updates)
   *
   * This dispatches a global event that both the editor popup preview
   * and the actual card listen for to trigger re-renders.
   */
  protected triggerPreviewUpdate(): void {
    // Global debouncing to prevent multiple modules from triggering rapid updates
    if (!window._ultraCardUpdateTimer) {
      window._ultraCardUpdateTimer = setTimeout(() => {
        const event = new CustomEvent('ultra-card-template-update', {
          bubbles: true,
          composed: true,
        });
        window.dispatchEvent(event);
        window._ultraCardUpdateTimer = null;
      }, 50); // Debounce to 50ms to allow multiple modules to batch their updates
    }
  }
}
