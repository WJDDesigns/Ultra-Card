import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { CardModule, UltraCardConfig } from '../types';
import { UcFormUtils } from '../utils/uc-form-utils';
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
    createDefault(id?: string): CardModule;
    renderGeneralTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderActionsTab?(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderOtherTab?(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult;
    validate(module: CardModule): {
        valid: boolean;
        errors: string[];
    };
    getStyles?(): string;
    migrate?(module: any, fromVersion: string, toVersion: string): CardModule;
}
export declare abstract class BaseUltraModule implements UltraModule {
    abstract metadata: ModuleMetadata;
    abstract createDefault(id?: string): CardModule;
    abstract renderGeneralTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    abstract renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult;
    renderActionsTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    validate(module: CardModule): {
        valid: boolean;
        errors: string[];
    };
    protected generateId(prefix: string): string;
    protected renderFormField(label: string, input: TemplateResult, description?: string): TemplateResult;
    protected renderColorPicker(label: string, value: string, onChange: (color: string) => void, description?: string): TemplateResult;
    protected renderNumberInput(label: string, value: number, onChange: (value: number) => void, options?: {
        min?: number;
        max?: number;
        step?: number;
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
}
