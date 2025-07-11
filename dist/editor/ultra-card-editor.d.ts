import { LitElement, TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { UltraCardConfig } from '../types';
import './tabs/about-tab';
import './tabs/layout-tab';
import '../components/ultra-color-picker';
export declare class UltraCardEditor extends LitElement {
    hass?: HomeAssistant;
    config: UltraCardConfig;
    private _activeTab;
    private _configDebounceTimeout?;
    setConfig(config: UltraCardConfig): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private _handleConfigChanged;
    private _updateConfig;
    protected render(): TemplateResult<1>;
    private _renderSettingsTab;
    static get styles(): import("lit").CSSResult;
}
