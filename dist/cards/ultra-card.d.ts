import { LitElement, TemplateResult, PropertyValues } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { UltraCardConfig } from '../types';
import '../editor/ultra-card-editor';
export declare class UltraCard extends LitElement {
    hass?: HomeAssistant;
    config?: UltraCardConfig;
    private _moduleVisibilityState;
    private _animatingModules;
    private _rowVisibilityState;
    private _columnVisibilityState;
    private _animatingRows;
    private _animatingColumns;
    private _lastHassChangeTime;
    private _templateUpdateListener?;
    /**
     * Flag to ensure module CSS is injected only once per card instance.
     */
    private _moduleStylesInjected;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected willUpdate(changedProps: PropertyValues): void;
    setConfig(config: UltraCardConfig): void;
    static getConfigElement(): HTMLElement;
    static getStubConfig(): UltraCardConfig;
    protected render(): TemplateResult;
    private _getCardStyle;
    private _renderRow;
    private _renderColumn;
    private _renderModule;
    private _parseAnimationDuration;
    /**
     * Helper method to evaluate state-based animation conditions
     */
    private _getStateBasedAnimationClass;
    /**
     * Counts total modules in a config (useful for logging)
     */
    private _countTotalModules;
    /**
     * Convert column layout ID to CSS grid template columns
     */
    private _getGridTemplateColumns;
    /**
     * Helper method to ensure border radius values have proper units
     */
    private _addPixelUnit;
    /**
     * Generate CSS styles for a row based on design properties
     */
    private _generateRowStyles;
    /**
     * Generate CSS styles for a column based on design properties
     */
    private _generateColumnStyles;
    /**
     * Build a CSS background-image value from design properties for rows/columns.
     * Mirrors module background image behavior (upload/url/entity/legacy path).
     */
    private _resolveBackgroundImageCSS;
    /**
     * Convert style object to CSS string
     */
    private _styleObjectToCss;
    /**
     * Inject a <style> block containing the combined styles from every registered
     * module into the card's shadow-root. This is required for features such as
     * the icon animation classes (e.g. `.icon-animation-pulse`) defined within
     * individual modules to take effect when the card is rendered in Lovelace.
     */
    private _injectModuleStyles;
    static get styles(): import("lit").CSSResult;
}
