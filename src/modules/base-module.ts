import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { CardModule, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalDesignTab } from '../tabs/global-design-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { UcFormUtils } from '../utils/uc-form-utils';
import { UltraLinkComponent, TapActionConfig } from '../components/ultra-link';
import { ucGestureService, GestureConfig } from '../services/uc-gesture-service';

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
    await UltraLinkComponent.handleAction(
      action,
      hass,
      element,
      config,
      moduleEntity,
      module
    );
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
}
