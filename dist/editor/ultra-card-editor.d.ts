import { LitElement, TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { UltraCardConfig } from '../types';
import './tabs/about-tab';
import './tabs/layout-tab';
import '../components/ultra-color-picker';
import '../components/uc-favorite-colors-manager';
export declare class UltraCardEditor extends LitElement {
    hass?: HomeAssistant;
    config: UltraCardConfig;
    private _activeTab;
    private _configDebounceTimeout?;
    private _isFullScreen;
    private _isMobile;
    /** Flag to ensure module CSS for animations is injected once */
    private _moduleStylesInjected;
    setConfig(config: UltraCardConfig): void;
    connectedCallback(): void;
    private _resizeListener?;
    disconnectedCallback(): void;
    private _checkMobileDevice;
    private _handleConfigChanged;
    private _handleKeyDown;
    private _updateConfig;
    private _toggleFullScreen;
    protected render(): TemplateResult<1>;
    private _renderSettingsTab;
    /**
     * Inject a <style> element containing the combined CSS returned by the
     * ModuleRegistry so that module previews benefit from their specific styles
     * (especially animations) while editing.
     */
    private _injectModuleStyles;
    static get styles(): import("lit").CSSResult;
}
