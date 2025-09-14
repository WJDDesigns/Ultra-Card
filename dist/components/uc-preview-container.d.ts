import { LitElement } from 'lit';
export declare class UcPreviewContainer extends LitElement {
    alignment: 'left' | 'center' | 'right';
    minHeight: number;
    height: number;
    static styles: import("lit").CSSResult;
    private getJustify;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'uc-preview-container': UcPreviewContainer;
    }
}
