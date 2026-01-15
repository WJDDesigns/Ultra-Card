import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { CardModule, UltraCardConfig } from '../types';
import { UcFormUtils } from '../utils/uc-form-utils';
import { TapActionConfig } from '../components/ultra-link';
import { GestureConfig } from '../services/uc-gesture-service';
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
export interface UltraModule {
    metadata: ModuleMetadata;
    createDefault(id?: string, hass?: HomeAssistant): CardModule;
    renderGeneralTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderActionsTab?(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void, updateConfig?: (updates: Partial<UltraCardConfig>) => void): TemplateResult;
    renderOtherTab?(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderDesignTab?(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderYamlTab?(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderPreview(module: CardModule, hass: HomeAssistant, config?: UltraCardConfig, previewContext?: 'live' | 'ha-preview' | 'dashboard'): TemplateResult;
    validate(module: CardModule): {
        valid: boolean;
        errors: string[];
    };
    getStyles?(): string;
    migrate?(module: any, fromVersion: string, toVersion: string): CardModule;
}
export declare abstract class BaseUltraModule implements UltraModule {
    abstract metadata: ModuleMetadata;
    abstract createDefault(id?: string, hass?: HomeAssistant): CardModule;
    abstract renderGeneralTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    abstract renderPreview(module: CardModule, hass: HomeAssistant, config?: UltraCardConfig, previewContext?: 'live' | 'ha-preview' | 'dashboard'): TemplateResult;
    renderActionsTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void, updateConfig?: (updates: Partial<UltraCardConfig>) => void): TemplateResult;
    renderOtherTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderDesignTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    validate(module: CardModule): {
        valid: boolean;
        errors: string[];
    };
    protected generateId(prefix: string): string;
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
    protected resolveEntity(entityValue: string | undefined, config?: UltraCardConfig): string | undefined;
    /**
     * Check if an entity field is using a variable reference
     */
    protected isVariableReference(entityValue: string | undefined): boolean;
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
    handleModuleAction(action: TapActionConfig | undefined, hass: HomeAssistant, element?: HTMLElement, config?: UltraCardConfig, moduleEntity?: string, module?: CardModule): Promise<void>;
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
    protected createGestureHandlers(elementId: string, gestureConfig: GestureConfig, hass: HomeAssistant, cardConfig?: UltraCardConfig, excludeSelectors?: string[]): {
        onPointerDown: (e: PointerEvent) => void;
        onPointerUp: (e: PointerEvent) => void;
        onPointerLeave: () => void;
        onPointerCancel: () => void;
    };
    protected renderFormField(label: string, input: TemplateResult, description?: string): TemplateResult;
    protected renderColorPicker(label: string, value: string, onChange: (color: string) => void, description?: string): TemplateResult;
    protected renderNumberInput(label: string, value: number, onChange: (value: number) => void, options?: {
        min?: number;
        max?: number;
        step?: number;
        defaultValue?: number;
    }, description?: string): TemplateResult;
    protected renderTextInput(label: string, value: string, onChange: (value: string) => void, placeholder?: string, description?: string): TemplateResult;
    protected renderEntityPicker(label: string, value: string, onChange: (value: string) => void, hass: HomeAssistant, placeholder?: string, description?: string, entityFilter?: (entityId: string) => boolean): TemplateResult;
    protected renderTextArea(label: string, value: string, onChange: (value: string) => void, placeholder?: string, description?: string): TemplateResult;
    protected renderSelect(label: string, value: string, options: {
        value: string;
        label: string;
    }[], onChange: (value: string) => void, description?: string): TemplateResult;
    protected renderCheckbox(label: string, checked: boolean, onChange: (checked: boolean) => void, description?: string): TemplateResult;
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
    protected renderConditionalFieldsGroup(header: string, content: TemplateResult): TemplateResult;
    /**
     * Ultra Card form renderer
     */
    protected renderUcForm: (hass: HomeAssistant, data: Record<string, any>, schema: any[], onChange: (e: CustomEvent) => void, hideLabels?: boolean) => TemplateResult;
    /**
     * Field section with custom title/description + clean form
     */
    protected renderFieldSection: (title: string, description: string, hass: HomeAssistant, data: Record<string, any>, schema: any[], onChange: (e: CustomEvent) => void) => TemplateResult;
    /**
     * Settings section with multiple fields
     */
    protected renderSettingsSection: (title: string, description: string, fields: Array<{
        title: string;
        description: string;
        hass: HomeAssistant;
        data: Record<string, any>;
        schema: any[];
        onChange: (e: CustomEvent) => void;
    }>) => TemplateResult;
    /**
     * Inject clean form styles
     */
    protected injectUcFormStyles: () => TemplateResult;
    protected entityField: typeof UcFormUtils.entity;
    protected textField: typeof UcFormUtils.text;
    protected selectField: typeof UcFormUtils.select;
    protected iconField: typeof UcFormUtils.icon;
    protected booleanField: typeof UcFormUtils.boolean;
    protected numberField: typeof UcFormUtils.number;
    protected colorField: typeof UcFormUtils.color;
    protected gridField: typeof UcFormUtils.grid;
    protected expandableField: typeof UcFormUtils.expandable;
    /**
     * Render variable quick-select chips above entity pickers
     * Shows both global and card-specific custom variables as clickable chips
     * When a chip is clicked, the variable's entity is selected
     */
    protected renderVariableChips: (hass: HomeAssistant, config: UltraCardConfig | undefined, currentValue: string, onSelect: (entityId: string) => void) => TemplateResult;
    /**
     * Render entity picker with variable chips above it
     * Combines variable quick-select with the native ha-form entity picker
     */
    protected renderEntityPickerWithVariables: (hass: HomeAssistant, config: UltraCardConfig | undefined, fieldName: string, currentValue: string, onChange: (value: string) => void, domain?: string[], label?: string) => TemplateResult;
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
    protected triggerPreviewUpdate(immediate?: boolean): void;
    /**
     * Render a beautiful gradient error state for incomplete module configuration
     * Matches the website's gradient aesthetic (purple → pink → blue)
     *
     * @param title - Main error title (e.g., "Configure Entities")
     * @param subtitle - Helpful subtitle text (e.g., "Select an entity in the General tab")
     * @param icon - Icon to display (defaults to alert circle)
     * @returns TemplateResult with gradient error state
     */
    protected renderGradientErrorState(title: string, subtitle: string, icon?: string): TemplateResult;
    /**
     * Render a compact warning banner for partial configuration issues
     * Shows when some items are valid but others need configuration
     *
     * @param message - Warning message to display
     * @param count - Optional count to display (e.g., "2 items need configuration")
     * @returns TemplateResult with gradient warning banner
     */
    protected renderGradientWarningBanner(message: string, count?: number): TemplateResult;
    /**
     * Get shared CSS styles for gradient error states
     * Called by renderGradientErrorState and renderGradientWarningBanner
     *
     * @returns CSS string with gradient error state styles
     */
    protected getGradientErrorStateStyles(): string;
}
