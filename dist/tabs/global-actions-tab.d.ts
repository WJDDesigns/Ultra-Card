import { LitElement, PropertyValues, TemplateResult } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type { CardModule } from '../types';
import '../components/ultra-color-picker';
export declare class GlobalActionsTab extends LitElement {
    hass: HomeAssistant;
    module: CardModule;
    tabTitle?: string;
    private _config;
    protected willUpdate(changedProps: PropertyValues): void;
    private _valueChanged;
    private _triggerPreviewUpdate;
    protected render(): TemplateResult<1>;
    private _renderHoverEffectsSection;
    static get styles(): import("lit").CSSResult;
    static render<M extends CardModule>(module: M, hass: HomeAssistant, updateModule: (updates: Partial<M>) => void, title?: string): TemplateResult;
    static getClickableClass(module: any): string;
    static getClickableStyle(module: any): string;
    /**
     * Resolves 'default' actions to their actual behavior at runtime
     * 'default' becomes 'more-info' for the module's entity if available, otherwise 'none'
     */
    static resolveAction(action: any, moduleEntity?: string): any;
    static getHoverStyles(): string;
}
