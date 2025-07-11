import { LitElement, TemplateResult } from 'lit';
import './ultra-color-picker';
export interface GradientStop {
    id: string;
    position: number;
    color: string;
}
export declare function generateGradientString(stops: GradientStop[]): string;
export declare function createDefaultGradientStops(): GradientStop[];
export declare function createStopAtLargestGap(stops: GradientStop[]): GradientStop;
export declare class UCGradientEditor extends LitElement {
    stops: GradientStop[];
    barSize: 'thin' | 'regular' | 'thick' | 'thiccc';
    barRadius: 'round' | 'square' | 'rounded-square';
    barStyle: string;
    private _draggedIndex;
    static styles: import("lit").CSSResult;
    render(): TemplateResult;
    private _renderStopItem;
    private _addStop;
    private _resetStops;
    private _deleteStop;
    private _handleColorChange;
    private _handlePositionChange;
    private _validateAndSortStops;
    private _notifyChange;
    private _dispatchResetEvent;
    private _handleDragStart;
    private _handleDragEnd;
    private _handleDragOver;
    private _handleDrop;
}
declare global {
    interface HTMLElementTagNameMap {
        'uc-gradient-editor': UCGradientEditor;
    }
}
