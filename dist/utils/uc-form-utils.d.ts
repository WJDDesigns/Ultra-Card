import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { CardModule, UltraCardConfig } from '../types';
/**
 * Ultra Card form utilities
 * Clean form rendering without CSS label hiding hacks
 */
export declare class UcFormUtils {
    /**
     * Ultra Card form renderer with computeLabel control
     */
    static renderForm(hass: HomeAssistant, data: Record<string, any>, schema: any[], onChange: (e: CustomEvent) => void, showLabels?: boolean): TemplateResult;
    /**
     * Field section with custom title/description + clean form
     */
    static renderFieldSection(title: string, description: string, hass: HomeAssistant, data: Record<string, any>, schema: any[], onChange: (e: CustomEvent) => void): TemplateResult;
    /**
     * Multiple field sections in a settings group
     */
    static renderSettingsSection(title: string, description: string, fields: Array<{
        title: string;
        description: string;
        hass: HomeAssistant;
        data: Record<string, any>;
        schema: any[];
        onChange: (e: CustomEvent) => void;
    }>): TemplateResult;
    /**
     * Schema builders for common field types
     */
    static entity(name: string, domain?: string[]): any;
    static text(name: string, multiline?: boolean): any;
    static select(name: string, options: Array<{
        value: string;
        label: string;
    }>): any;
    static icon(name: string): any;
    static boolean(name: string): any;
    static number(name: string, min?: number, max?: number, step?: number): any;
    static color(name: string): any;
    static grid(schema: any[]): any;
    static expandable(name: string, title: string, schema: any[]): any;
    /**
     * Render a variable indicator badge when an entity field uses a variable
     * Shows: "🔗 $varname → entity_id" with nice styling
     */
    static renderVariableIndicator(value: string | undefined, config: UltraCardConfig | undefined): TemplateResult;
    /**
     * Render entity picker with variable support
     * Shows a nice indicator when a variable is being used
     * Hides the ugly "Unknown entity" message from HA
     */
    static renderEntityFieldWithVariableSupport(hass: HomeAssistant, config: UltraCardConfig | undefined, fieldName: string, currentValue: string, onChange: (value: string) => void, options?: {
        domain?: string[];
        label?: string;
        includeNone?: boolean;
    }): TemplateResult;
    /**
     * Render variable quick-select chips above an entity picker
     * Shows both global and card-specific custom variables as clickable chips
     * When clicked, the variable's entity is selected in the picker
     */
    static renderVariableChips(hass: HomeAssistant, config: UltraCardConfig | undefined, currentValue: string, onSelect: (entityId: string) => void): TemplateResult;
    /**
     * Render entity picker with variable chips above it
     * Combines variable quick-select with the native ha-form entity picker
     */
    static renderEntityPickerWithVariables(hass: HomeAssistant, config: UltraCardConfig | undefined, fieldName: string, currentValue: string, onChange: (value: string) => void, domain?: string[], label?: string): TemplateResult;
    /**
     * Get the resolved value of a custom variable for display in chip tooltip
     */
    private static _getVariableResolvedValue;
    private static _hideLabels;
    private static _defaultComputeLabel;
    private static _hideDescriptions;
    private static _defaultComputeDescription;
    /**
     * Get clean form styles
     */
    static getCleanFormStyles(): string;
    /**
     * Inject clean form styles
     */
    static injectCleanFormStyles(): TemplateResult;
    /**
     * Calculate the nesting depth of layout modules
     * @param module The module to check
     * @param currentDepth The current depth (used internally for recursion)
     * @returns The maximum nesting depth found
     */
    static getLayoutNestingDepth(module: CardModule, currentDepth?: number): number;
    /**
     * Check if adding a module would exceed the maximum nesting depth
     * @param parentModule The parent layout module
     * @param childModule The child module to add
     * @param maxDepth Maximum allowed nesting depth (default: 3, allowing 2 levels of layout modules)
     * @returns True if the nesting would be valid, false otherwise
     */
    static validateNestingDepth(parentModule: CardModule, childModule: CardModule, maxDepth?: number): {
        valid: boolean;
        error?: string;
    };
}
