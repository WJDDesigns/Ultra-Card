import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
/**
 * Utility class for rendering clean forms without redundant labels
 * Eliminates the duplicate field names that appear above custom field titles
 */
export declare class FormUtils {
    private static activeObservers;
    private static cleanupQueue;
    /**
     * Renders a clean ha-form without redundant labels
     * @param hass Home Assistant instance
     * @param data Form data object
     * @param schema Form schema array
     * @param onChange Value change handler
     * @returns Clean form template with hidden redundant labels
     */
    static renderCleanForm(hass: HomeAssistant, data: Record<string, any>, schema: any[], onChange: (e: CustomEvent) => void): TemplateResult;
    /**
     * Sets up a MutationObserver to watch for new form elements and clean them immediately
     */
    private static setupFormObserver;
    /**
     * Aggressive cleanup function that removes redundant labels immediately
     */
    private static aggressiveCleanup;
    /**
     * Gets the CSS styles needed to hide redundant form labels
     * @returns CSS string for clean form styling
     */
    static getCleanFormStyles(): string;
    /**
     * JavaScript-based cleanup to remove redundant text nodes
     * Call this after rendering forms as a backup solution
     */
    static cleanupRedundantLabels(containerElement: HTMLElement): void;
    /**
     * Renders a field with title, description, and clean form
     * @param title Field title
     * @param description Field description
     * @param hass Home Assistant instance
     * @param data Form data
     * @param schema Form schema
     * @param onChange Change handler
     * @returns Complete field template
     */
    static renderField(title: string, description: string, hass: HomeAssistant, data: Record<string, any>, schema: any[], onChange: (e: CustomEvent) => void): TemplateResult;
    /**
     * Creates a schema item with consistent structure
     * @param name Field name
     * @param selector Selector configuration
     * @returns Schema item without redundant label
     */
    static createSchemaItem(name: string, selector: any): any;
    /**
     * Renders a complete form section with title, description, and multiple fields
     * @param title Section title
     * @param description Section description
     * @param fields Array of field configurations
     * @returns Complete section template
     */
    static renderSection(title: string, description: string, fields: Array<{
        title: string;
        description: string;
        hass: HomeAssistant;
        data: Record<string, any>;
        schema: any[];
        onChange: (e: CustomEvent) => void;
    }>): TemplateResult;
    /**
     * Injects the clean form styles into a component
     * @returns Style template with clean form CSS
     */
    static injectCleanFormStyles(): TemplateResult;
}
