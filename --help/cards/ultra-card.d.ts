import { LitElement, TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { UltraCardConfig } from '../types';
export declare class UltraCard extends LitElement {
    hass?: HomeAssistant;
    config?: UltraCardConfig;
    setConfig(config: UltraCardConfig): void;
    protected render(): TemplateResult;
    static get styles(): import("lit").CSSResult;
}
