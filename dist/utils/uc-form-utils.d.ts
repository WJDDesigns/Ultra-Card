import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
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
    /**
     * Get clean form styles
     */
    static getCleanFormStyles(): string;
    /**
     * Inject clean form styles
     */
    static injectCleanFormStyles(): TemplateResult;
}
