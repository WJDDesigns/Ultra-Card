import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { CardModule, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalDesignTab } from '../tabs/global-design-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { UcFormUtils } from '../utils/uc-form-utils';
import { UltraLinkComponent, TapActionConfig } from '../components/ultra-link';
import { ucGestureService, GestureConfig } from '../services/uc-gesture-service';
import { computeBackgroundStyles } from '../utils/uc-color-utils';
import { getImageUrl } from '../utils/image-upload';
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';

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
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
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
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
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

  /**
   * Resolve an entity field that may contain a variable reference
   * If the value starts with $, it resolves to the variable's entity
   * Otherwise returns the value as-is
   *
   * Use this in render methods to support variable indirection:
   * - User selects $myvar in the entity picker
   * - Config stores "$myvar"
   * - At render time, this resolves to the actual entity ID
   * - User can change $myvar's entity in settings, all uses update
   *
   * @param entityValue The entity field value (could be "$varname" or "sensor.temp")
   * @param config The card configuration
   * @returns The resolved entity ID
   */
  protected resolveEntity(
    entityValue: string | undefined,
    config?: UltraCardConfig
  ): string | undefined {
    if (!entityValue) {
      return entityValue;
    }

    // Import dynamically to avoid circular dependencies
    const { ucCustomVariablesService } = require('../services/uc-custom-variables-service');
    return ucCustomVariablesService.resolveEntityField(entityValue, config);
  }

  /**
   * Check if an entity field is using a variable reference
   */
  protected isVariableReference(entityValue: string | undefined): boolean {
    return !!entityValue && entityValue.startsWith('$');
  }

  /**
   * Centralized action handler for all modules
   * This ensures confirmation dialogs work consistently across all modules
   * Modules should use this method instead of calling UltraLinkComponent.handleAction directly
   *
   * @param action The action to execute
   * @param hass Home Assistant instance
   * @param element The element that triggered the action
   * @param config Ultra Card config
   * @param moduleEntity The module's entity (if any)
   * @param module The module instance (required for confirmation dialogs)
   */
  async handleModuleAction(
    action: TapActionConfig | undefined,
    hass: HomeAssistant,
    element?: HTMLElement,
    config?: UltraCardConfig,
    moduleEntity?: string,
    module?: CardModule
  ): Promise<void> {
    // Always pass the module to ensure confirmation dialogs work
    await UltraLinkComponent.handleAction(action, hass, element, config, moduleEntity, module);
  }

  /**
   * Create gesture handlers for module interactions
   *
   * This is a convenience wrapper around ucGestureService.createGestureHandlers
   * that all modules can use for consistent gesture handling.
   *
   * Prevents double-click bugs by properly handling event propagation and timing.
   *
   * @param elementId - Unique identifier for this element (use module.id or icon.id)
   * @param gestureConfig - Configuration including tap_action, hold_action, double_tap_action
   * @param hass - Home Assistant instance
   * @param cardConfig - Ultra Card configuration
   * @param excludeSelectors - Additional CSS selectors to exclude from gesture handling
   *
   * @returns Object with onPointerDown, onPointerUp, onPointerLeave, and onPointerCancel handlers
   *
   * @example
   * ```typescript
   * const handlers = this.createGestureHandlers(
   *   module.id,
   *   {
   *     tap_action: module.tap_action,
   *     hold_action: module.hold_action,
   *     double_tap_action: module.double_tap_action,
   *     entity: module.entity,
   *     module: module
   *   },
   *   hass,
   *   config
   * );
   *
   * return html`
   *   <div
   *     @pointerdown=${handlers.onPointerDown}
   *     @pointerup=${handlers.onPointerUp}
   *     @pointerleave=${handlers.onPointerLeave}
   *   >
   *     Content here
   *   </div>
   * `;
   * ```
   */
  protected createGestureHandlers(
    elementId: string,
    gestureConfig: GestureConfig,
    hass: HomeAssistant,
    cardConfig?: UltraCardConfig,
    excludeSelectors?: string[]
  ) {
    return ucGestureService.createGestureHandlers(
      elementId,
      gestureConfig,
      hass,
      cardConfig,
      excludeSelectors
    );
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
   * Render a consistent slider control with range slider + number input + reset button.
   * Use this instead of numberField/renderFieldSection for all numeric slider controls.
   *
   * @param title - Display title for the field
   * @param description - Description text below the title
   * @param value - Current value
   * @param defaultValue - Default value (used for reset)
   * @param min - Minimum slider/input value
   * @param max - Maximum slider/input value
   * @param step - Step increment
   * @param onChange - Callback when value changes (receives new numeric value)
   * @param unit - Optional unit label (default: 'px')
   */
  protected renderSliderField(
    title: string,
    description: string,
    value: number,
    defaultValue: number,
    min: number,
    max: number,
    step: number,
    onChange: (value: number) => void,
    unit: string = 'px'
  ): TemplateResult {
    return html`
      <div class="field-container" style="margin-bottom: 16px;">
        <div class="field-title">${title} (${value}${unit})</div>
        ${description
          ? html`<div class="field-description">${description}</div>`
          : ''}
        <div
          class="gap-control-container"
          style="display: flex; align-items: center; gap: 12px;"
        >
          <input
            type="range"
            class="gap-slider"
            min="${min}"
            max="${max}"
            step="${step}"
            .value="${String(value)}"
            @input=${(e: Event) => {
              const target = e.target as HTMLInputElement;
              onChange(Number(target.value));
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }}
          />
          <input
            type="number"
            class="gap-input"
            min="${min}"
            max="${max}"
            step="${step}"
            .value="${String(value)}"
            @input=${(e: Event) => {
              const target = e.target as HTMLInputElement;
              const val = Number(target.value);
              if (!isNaN(val)) {
                onChange(val);
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }
            }}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                const target = e.target as HTMLInputElement;
                const currentValue = Number(target.value) || defaultValue;
                const increment = e.key === 'ArrowUp' ? step : -step;
                const newValue = Math.max(min, Math.min(max, currentValue + increment));
                onChange(newValue);
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }
            }}
          />
          <button
            class="reset-btn"
            @click=${() => {
              onChange(defaultValue);
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }}
            title="Reset to default (${defaultValue})"
          >
            <ha-icon icon="mdi:refresh"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Returns the shared CSS for gap-slider controls.
   * Include in your module's getStyles() method:
   *   ${BaseUltraModule.getSliderStyles()}
   */
  static getSliderStyles(): string {
    return `
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
   * Render variable quick-select chips above entity pickers
   * Shows both global and card-specific custom variables as clickable chips
   * When a chip is clicked, the variable's entity is selected
   */
  protected renderVariableChips = (
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    currentValue: string,
    onSelect: (entityId: string) => void
  ) => UcFormUtils.renderVariableChips(hass, config, currentValue, onSelect);

  /**
   * Render entity picker with variable chips above it
   * Combines variable quick-select with the native ha-form entity picker
   */
  protected renderEntityPickerWithVariables = (
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    fieldName: string,
    currentValue: string,
    onChange: (value: string) => void,
    domain?: string[],
    label?: string
  ) =>
    UcFormUtils.renderEntityPickerWithVariables(
      hass,
      config,
      fieldName,
      currentValue,
      onChange,
      domain,
      label
    );

  /**
   * Trigger a preview update event
   *
   * Call this method after making changes that should update the Live Preview
   * (e.g., template evaluation, dynamic content updates)
   *
   * This dispatches a global event that both the editor popup preview
   * and the actual card listen for to trigger re-renders.
   *
   * @param immediate - If true, triggers update immediately without debouncing
   */
  protected triggerPreviewUpdate(immediate: boolean = false): void {
    // Clear any existing timer if immediate update requested
    if (immediate && window._ultraCardUpdateTimer) {
      clearTimeout(window._ultraCardUpdateTimer);
      window._ultraCardUpdateTimer = null;
    }

    // Global debouncing to prevent multiple modules from triggering rapid updates
    if (!window._ultraCardUpdateTimer) {
      const delay = immediate ? 0 : 150; // Increased debounce time for better batching

      window._ultraCardUpdateTimer = setTimeout(() => {
        const event = new CustomEvent('ultra-card-template-update', {
          bubbles: true,
          composed: true,
          detail: {
            timestamp: Date.now(),
            source: 'module-update',
          },
        });
        window.dispatchEvent(event);
        window._ultraCardUpdateTimer = null;
      }, delay);
    }
  }

  /**
   * Render a beautiful gradient error state for incomplete module configuration
   * Matches the website's gradient aesthetic (purple → pink → blue)
   *
   * @param title - Main error title (e.g., "Configure Entities")
   * @param subtitle - Helpful subtitle text (e.g., "Select an entity in the General tab")
   * @param icon - Icon to display (defaults to alert circle)
   * @returns TemplateResult with gradient error state
   */
  protected renderGradientErrorState(
    title: string,
    subtitle: string,
    icon: string = 'mdi:alert-circle-outline'
  ): TemplateResult {
    return html`
      <style>
        ${this.getGradientErrorStateStyles()}
      </style>
      <div class="ultra-config-needed">
        <div class="ultra-config-gradient"></div>
        <div class="ultra-config-content">
          <ha-icon icon="${icon}"></ha-icon>
          <div class="ultra-config-text">
            <div class="ultra-config-title">${title}</div>
            <div class="ultra-config-subtitle">${subtitle}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render a compact warning banner for partial configuration issues
   * Shows when some items are valid but others need configuration
   *
   * @param message - Warning message to display
   * @param count - Optional count to display (e.g., "2 items need configuration")
   * @returns TemplateResult with gradient warning banner
   */
  protected renderGradientWarningBanner(message: string, count?: number): TemplateResult {
    const displayMessage = count !== undefined ? `${count} ${message}` : message;

    return html`
      <style>
        ${this.getGradientErrorStateStyles()}
      </style>
      <div class="ultra-config-banner">
        <div class="ultra-config-banner-gradient"></div>
        <div class="ultra-config-banner-content">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span>${displayMessage}</span>
        </div>
      </div>
    `;
  }

  /**
   * Get shared CSS styles for gradient error states
   * Called by renderGradientErrorState and renderGradientWarningBanner
   *
   * @returns CSS string with gradient error state styles
   */
  protected getGradientErrorStateStyles(): string {
    return `
      /* Ultra Card Modern Gradient Error State */
      .ultra-config-needed {
        position: relative;
        padding: 16px;
        border-radius: 12px;
        overflow: hidden;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .ultra-config-gradient {
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, 
          rgba(168, 85, 247, 0.15) 0%, 
          rgba(236, 72, 153, 0.15) 50%, 
          rgba(59, 130, 246, 0.15) 100%);
        z-index: 0;
      }

      .ultra-config-content {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .ultra-config-content ha-icon {
        flex-shrink: 0;
        color: var(--primary-color);
        --mdc-icon-size: 24px;
      }

      .ultra-config-text {
        flex: 1;
        min-width: 0;
      }

      .ultra-config-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        margin-bottom: 2px;
      }

      .ultra-config-subtitle {
        font-size: 12px;
        color: var(--secondary-text-color);
        opacity: 0.8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Compact Warning Banner */
      .ultra-config-banner {
        position: relative;
        padding: 10px 14px;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 12px;
        backdrop-filter: blur(10px);
      }

      .ultra-config-banner-gradient {
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, 
          rgba(168, 85, 247, 0.12) 0%, 
          rgba(236, 72, 153, 0.12) 100%);
        z-index: 0;
      }

      .ultra-config-banner-content {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 12px;
        color: var(--primary-text-color);
      }

      .ultra-config-banner-content ha-icon {
        flex-shrink: 0;
        color: var(--primary-color);
        --mdc-icon-size: 18px;
      }
    `;
  }

  // ============================================
  // DESIGN PROPERTY UTILITIES
  // ============================================

  /**
   * Convert a style object to an inline CSS string
   * Use this for converting buildDesignStyles() output to a style attribute string
   * @param styles - Object with camelCase or kebab-case property names
   * @returns CSS string suitable for style attribute
   */
  protected buildStyleString(styles: Record<string, string | number | undefined>): string {
    return Object.entries(styles)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => {
        const cssKey = this._camelToKebab(key);
        return `${cssKey}: ${value}`;
      })
      .join('; ');
  }

  /**
   * Convert camelCase to kebab-case
   */
  private _camelToKebab(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Add pixel unit to a value if it's a number
   */
  protected _addPixelUnit(value: string | number | undefined): string {
    if (value === undefined || value === null || value === '') return '';
    if (typeof value === 'number') return `${value}px`;
    if (typeof value === 'string' && !isNaN(Number(value))) return `${value}px`;
    return String(value);
  }

  /**
   * Get padding CSS string from module design properties
   */
  protected getPaddingCss(effective: any): string {
    if (
      effective.padding_top ||
      effective.padding_right ||
      effective.padding_bottom ||
      effective.padding_left
    ) {
      const top = this._addPixelUnit(effective.padding_top) || '0';
      const right = this._addPixelUnit(effective.padding_right) || '0';
      const bottom = this._addPixelUnit(effective.padding_bottom) || '0';
      const left = this._addPixelUnit(effective.padding_left) || '0';
      return `${top} ${right} ${bottom} ${left}`;
    }
    return '';
  }

  /**
   * Get margin CSS string from module design properties
   */
  protected getMarginCss(effective: any): string {
    if (
      effective.margin_top ||
      effective.margin_right ||
      effective.margin_bottom ||
      effective.margin_left
    ) {
      const top = this._addPixelUnit(effective.margin_top) || '0';
      const right = this._addPixelUnit(effective.margin_right) || '0';
      const bottom = this._addPixelUnit(effective.margin_bottom) || '0';
      const left = this._addPixelUnit(effective.margin_left) || '0';
      return `${top} ${right} ${bottom} ${left}`;
    }
    return '';
  }

  /**
   * Get border CSS string from module design properties
   */
  protected getBorderCss(effective: any): string {
    if (effective.border_width) {
      const width = this._addPixelUnit(effective.border_width) || '0';
      const style = effective.border_style || 'solid';
      const color = effective.border_color || 'transparent';
      return `${width} ${style} ${color}`;
    }
    return '';
  }

  /**
   * Get background image CSS string from module design properties
   */
  protected getBackgroundImageCss(effective: any, hass?: HomeAssistant): string {
    if (!effective.background_image_type || effective.background_image_type === 'none') {
      // Fallback to legacy background_image if present
      if (effective.background_image) {
        return `url("${effective.background_image}")`;
      }
      return 'none';
    }

    switch (effective.background_image_type) {
      case 'upload': {
        if (effective.background_image && hass) {
          const resolved = getImageUrl(hass, effective.background_image);
          return `url("${resolved}")`;
        }
        break;
      }
      case 'url': {
        if (effective.background_image) {
          return `url("${effective.background_image}")`;
        }
        break;
      }
      case 'entity':
        if (effective.background_image_entity && hass?.states[effective.background_image_entity]) {
          const entityState = hass.states[effective.background_image_entity];
          let imageUrl = '';

          if (entityState.attributes?.entity_picture) {
            imageUrl = entityState.attributes.entity_picture;
          } else if (entityState.attributes?.image) {
            imageUrl = entityState.attributes.image;
          } else if (entityState.state && typeof entityState.state === 'string') {
            if (entityState.state.startsWith('/') || entityState.state.startsWith('http')) {
              imageUrl = entityState.state;
            }
          }

          if (imageUrl) {
            const resolved = getImageUrl(hass, imageUrl);
            return `url("${resolved}")`;
          }
        }
        break;
    }

    return 'none';
  }

  /**
   * Build container styles from module design properties
   * This is the main method modules should use to apply all Design tab properties
   *
   * Handles: background (color, gradient, image, filter), padding, margin, border,
   * size (width, height, min/max), shadow, backdrop filter, position, overflow
   *
   * @param module - The module configuration
   * @param hass - Home Assistant instance (needed for entity-based images)
   * @returns Style object ready to be converted to CSS string via buildStyleString()
   */
  protected buildDesignStyles(
    module: CardModule,
    hass?: HomeAssistant
  ): Record<string, string | undefined> {
    const mod = module as any;
    // Merge design properties with module root properties (design takes precedence)
    const effective = { ...mod, ...(mod.design || {}) } as any;

    const styles: Record<string, string | undefined> = {};

    // Get background image CSS
    const bgImage = this.getBackgroundImageCss(effective, hass);

    // Check if background filter is present - requires pseudo-element approach
    const hasBackgroundFilter =
      effective.background_filter && effective.background_filter !== 'none';

    if (hasBackgroundFilter) {
      // Use CSS variables for pseudo-element background filter approach
      styles.position = 'relative';
      styles.isolation = 'isolate';

      if (bgImage && bgImage !== 'none') {
        styles['--bg-image'] = bgImage;
      }
      if (effective.background_color) {
        styles['--bg-color'] = effective.background_color;
      }
      styles['--bg-size'] = effective.background_size || 'cover';
      styles['--bg-position'] = effective.background_position || 'center';
      styles['--bg-repeat'] = effective.background_repeat || 'no-repeat';
      styles['--bg-filter'] = effective.background_filter;
    } else {
      // Use computeBackgroundStyles for proper gradient and image layer handling
      const bgResult = computeBackgroundStyles({
        color: effective.background_color,
        fallback: 'transparent',
        image: bgImage !== 'none' ? bgImage : undefined,
        imageSize: effective.background_size || 'cover',
        imagePosition: effective.background_position || 'center',
        imageRepeat: effective.background_repeat || 'no-repeat',
      });

      // Apply background styles from the utility
      if (bgResult.styles.background && bgResult.styles.background !== 'transparent') {
        styles.background = bgResult.styles.background;
      }
      if (bgResult.styles.backgroundSize) {
        styles.backgroundSize = bgResult.styles.backgroundSize;
      }
      if (bgResult.styles.backgroundPosition) {
        styles.backgroundPosition = bgResult.styles.backgroundPosition;
      }
      if (bgResult.styles.backgroundRepeat) {
        styles.backgroundRepeat = bgResult.styles.backgroundRepeat;
      }
      if (bgResult.styles.backgroundColor && bgResult.styles.backgroundColor !== 'transparent') {
        styles.backgroundColor = bgResult.styles.backgroundColor;
      }
    }

    // Padding
    const padding = this.getPaddingCss(effective);
    if (padding) {
      styles.padding = padding;
    }

    // Margin
    const margin = this.getMarginCss(effective);
    if (margin) {
      styles.margin = margin;
    }

    // Border
    const border = this.getBorderCss(effective);
    if (border) {
      styles.border = border;
    }

    // Border radius
    if (effective.border_radius) {
      styles.borderRadius = this._addPixelUnit(effective.border_radius);
    }

    // Size properties
    if (effective.width) {
      styles.width = this._addPixelUnit(effective.width);
    }
    if (effective.height) {
      styles.height = this._addPixelUnit(effective.height);
    }
    if (effective.max_width) {
      styles.maxWidth = this._addPixelUnit(effective.max_width);
    }
    if (effective.max_height) {
      styles.maxHeight = this._addPixelUnit(effective.max_height);
    }
    if (effective.min_width) {
      styles.minWidth = this._addPixelUnit(effective.min_width);
    }
    if (effective.min_height) {
      styles.minHeight = this._addPixelUnit(effective.min_height);
    }

    // Backdrop filter
    if (effective.backdrop_filter) {
      styles.backdropFilter = effective.backdrop_filter;
      styles.webkitBackdropFilter = effective.backdrop_filter;
    }

    // Box shadow (support both h/v naming and x/y naming)
    const shadowH = effective.box_shadow_h ?? effective.box_shadow_x;
    const shadowV = effective.box_shadow_v ?? effective.box_shadow_y;
    if (
      shadowH !== undefined ||
      shadowV !== undefined ||
      effective.box_shadow_blur ||
      effective.box_shadow_spread ||
      effective.box_shadow_color
    ) {
      const x = shadowH || 0;
      const y = shadowV || 0;
      const blur = effective.box_shadow_blur || 0;
      const spread = effective.box_shadow_spread || 0;
      const color = effective.box_shadow_color || 'rgba(0,0,0,0.2)';
      const inset = effective.box_shadow_inset ? 'inset ' : '';
      styles.boxShadow = `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`;
    }

    // Position properties
    if (effective.position && effective.position !== 'static') {
      styles.position = effective.position;
    }
    if (effective.top !== undefined && effective.top !== '') {
      styles.top = this._addPixelUnit(effective.top);
    }
    if (effective.right !== undefined && effective.right !== '') {
      styles.right = this._addPixelUnit(effective.right);
    }
    if (effective.bottom !== undefined && effective.bottom !== '') {
      styles.bottom = this._addPixelUnit(effective.bottom);
    }
    if (effective.left !== undefined && effective.left !== '') {
      styles.left = this._addPixelUnit(effective.left);
    }
    if (effective.z_index !== undefined && effective.z_index !== '') {
      styles.zIndex = String(effective.z_index);
    }

    // Overflow
    if (effective.overflow) {
      styles.overflow = effective.overflow;
    }

    return styles;
  }

  /**
   * Get animation configuration if conditions are met
   * Returns animation class and CSS variables for the animation wrapper, or null if no animation
   *
   * Handles:
   * - animation_type - the animation class (fadeIn, slideUp, pulse, etc.)
   * - animation_entity - entity to watch for state
   * - animation_trigger_type - 'state' or 'attribute'
   * - animation_attribute - attribute name if trigger type is 'attribute'
   * - animation_state - value to match
   * - animation_duration, animation_delay, animation_timing - CSS variables
   * - intro_animation, outro_animation - entry/exit animations
   *
   * @param module - The module configuration
   * @param hass - Home Assistant instance
   * @returns Object with class and styles, or null if no animation should be applied
   */
  protected getAnimationConfig(
    module: CardModule,
    hass: HomeAssistant
  ): { class: string; styles: Record<string, string> } | null {
    const mod = module as any;
    const effective = { ...mod, ...(mod.design || {}) } as any;

    // Get animation type (check both root and design)
    const animationType = effective.animation_type;

    // No animation configured
    if (!animationType || animationType === 'none') {
      return null;
    }

    // Get animation parameters
    const animationDuration = effective.animation_duration || '2s';
    const animationDelay = effective.animation_delay || '0s';
    const animationTiming = effective.animation_timing || 'ease';

    // Entity-based conditional animation
    const entityId = effective.animation_entity;
    const triggerType = effective.animation_trigger_type || 'state';
    const attribute = effective.animation_attribute;
    const targetState = effective.animation_state;

    // Evaluate if animation should be active
    let shouldAnimate = false;

    if (!entityId) {
      // No entity specified - always animate
      shouldAnimate = true;
    } else if (targetState && hass && hass.states[entityId]) {
      const entity = hass.states[entityId];
      if (triggerType === 'attribute' && attribute) {
        // Attribute-based trigger
        shouldAnimate = String(entity.attributes[attribute]) === targetState;
      } else {
        // State-based trigger
        shouldAnimate = entity.state === targetState;
      }
    }

    if (!shouldAnimate) {
      return null;
    }

    return {
      class: `animation-${animationType}`,
      styles: {
        '--animation-duration': animationDuration,
        '--animation-delay': animationDelay,
        '--animation-timing': animationTiming,
      },
    };
  }

  /**
   * Get intro animation configuration if configured
   * Returns animation class and CSS variables for intro animation, or null if none
   *
   * Intro animations play once on initial render (entry animation)
   * Uses separate timing properties from continuous animations:
   * - intro_animation_duration, intro_animation_delay, intro_animation_timing
   *
   * @param module - The module configuration
   * @returns Object with class and styles, or null if no intro animation
   */
  protected getIntroAnimationConfig(
    module: CardModule
  ): { class: string; styles: Record<string, string> } | null {
    const mod = module as any;
    const effective = { ...mod, ...(mod.design || {}) } as any;

    // Get intro animation type
    const introAnimation = effective.intro_animation;

    // No intro animation configured
    if (!introAnimation || introAnimation === 'none') {
      return null;
    }

    // Get intro animation parameters (separate from continuous animation)
    const duration = effective.intro_animation_duration || '0.5s';
    const delay = effective.intro_animation_delay || '0s';
    const timing = effective.intro_animation_timing || 'ease';

    return {
      class: `intro-animation-${introAnimation}`,
      styles: {
        '--intro-animation-duration': duration,
        '--intro-animation-delay': delay,
        '--intro-animation-timing': timing,
      },
    };
  }

  /**
   * Get hover effect class from module design properties
   * Uses the UcHoverEffectsService for consistent hover effects across all modules
   *
   * @param module - The module configuration
   * @returns CSS class string for hover effect, or empty string if none
   */
  protected getHoverEffectClass(module: CardModule): string {
    const mod = module as any;
    const hoverEffect = mod.hover_effect || mod.design?.hover_effect;

    if (!hoverEffect || hoverEffect === 'none') {
      return '';
    }

    return UcHoverEffectsService.getHoverEffectClass(hoverEffect);
  }

  /**
   * Helper method to wrap content with animation wrapper if animation is configured
   * Use this in renderPreview() to easily add animation support
   *
   * Handles both:
   * - Continuous animations (animation_type with animation_duration/delay/timing)
   * - Intro animations (intro_animation with intro_animation_duration/delay/timing)
   *
   * @param content - The module content to potentially wrap
   * @param module - The module configuration
   * @param hass - Home Assistant instance
   * @returns The content, optionally wrapped in an animation div
   *
   * @example
   * ```typescript
   * const content = html`<div class="my-module">...</div>`;
   * return this.wrapWithAnimation(content, module, hass);
   * ```
   */
  protected wrapWithAnimation(
    content: TemplateResult,
    module: CardModule,
    hass: HomeAssistant
  ): TemplateResult {
    const continuousConfig = this.getAnimationConfig(module, hass);
    const introConfig = this.getIntroAnimationConfig(module);

    // No animations configured
    if (!continuousConfig && !introConfig) {
      return content;
    }

    // Build combined classes and styles
    const classes: string[] = ['module-animation-wrapper'];
    const combinedStyles: Record<string, string> = {};

    if (continuousConfig) {
      classes.push(continuousConfig.class);
      Object.assign(combinedStyles, continuousConfig.styles);
    }

    if (introConfig) {
      classes.push(introConfig.class);
      Object.assign(combinedStyles, introConfig.styles);
    }

    return html`
      <div class="${classes.join(' ')}" style="${this.buildStyleString(combinedStyles)}">
        ${content}
      </div>
    `;
  }
}
