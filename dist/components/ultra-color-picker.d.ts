import { LitElement, TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
export interface ColorChangedEvent {
    detail: {
        value: string;
    };
}
export declare class UltraColorPicker extends LitElement {
    hass?: HomeAssistant;
    value?: string;
    label?: string;
    defaultValue?: string;
    disabled: boolean;
    private _currentValue?;
    private _showPalette;
    private _textInputValue?;
    private _favoriteColors;
    private _showAddToFavorites;
    private _transparency;
    private _documentClickHandler?;
    private _favoritesUnsubscribe?;
    protected firstUpdated(): void;
    disconnectedCallback(): void;
    private _handleDocumentClick;
    protected updated(changedProps: Map<string, any>): void;
    private _togglePalette;
    private _selectColor;
    private _applyColorSelection;
    private _handleNativeColorChange;
    private _handleTextInputChange;
    private _handleTextInputKeyDown;
    private _applyTextInputValue;
    private _isValidColor;
    private _resetToDefault;
    private _addToFavorites;
    private _getColorDisplayName;
    private _getDisplayValue;
    private _getColorForNativeInput;
    private _isDefaultValue;
    private _getContrastColor;
    /**
     * Resolve a CSS variable or color to its computed RGBA value.
     * This preserves alpha transparency from theme variables.
     */
    private _resolveCSSColor;
    /**
     * Extract transparency from a color value (0-100, where 100 is fully opaque)
     */
    private _extractTransparency;
    /**
     * Convert hex color to RGB values
     */
    private _hexToRgb;
    /**
     * Get base color without alpha/transparency
     */
    private _getBaseColor;
    /**
     * Apply transparency to a base color
     */
    private _applyTransparency;
    /**
     * Handle transparency slider change
     */
    private _handleTransparencyChange;
    protected render(): TemplateResult;
    static get styles(): import("lit").CSSResult;
}
