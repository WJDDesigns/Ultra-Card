import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { CardModule } from '../types';
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
