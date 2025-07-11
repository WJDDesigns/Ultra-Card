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
    protected firstUpdated(): void;
    disconnectedCallback(): void;
    private _handleDocumentClick;
    protected updated(changedProps: Map<string, any>): void;
    private _togglePalette;
    private _selectColor;
    private _handleNativeColorChange;
    private _handleTextInputChange;
    private _handleTextInputKeyDown;
    private _applyTextInputValue;
    private _isValidColor;
    private _resetToDefault;
    private _getDisplayValue;
    private _getColorForNativeInput;
    private _isDefaultValue;
    protected render(): TemplateResult;
    static get styles(): import("lit").CSSResult;
}
