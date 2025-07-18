import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
export interface UltraLinkConfig {
    tap_action?: TapActionConfig;
    hold_action?: TapActionConfig;
    double_tap_action?: TapActionConfig;
}
export interface TapActionConfig {
    action: 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
    perform_action?: string;
    target?: Record<string, any>;
    [key: string]: any;
}
export declare class UltraLinkComponent {
    static render(hass: HomeAssistant, config: UltraLinkConfig, updateConfig: (updates: Partial<UltraLinkConfig>) => void, title?: string): TemplateResult;
    /**
     * Renders a clean ha-form without redundant labels
     * @param hass Home Assistant instance
     * @param data Form data
     * @param schema Form schema
     * @param onChange Change handler
     * @returns Clean form template
     */
    private static renderCleanForm;
    private static renderActionFields;
    private static renderNavigationPicker;
    static getDefaultConfig(): UltraLinkConfig;
    static handleAction(action: TapActionConfig, hass: HomeAssistant, element?: HTMLElement): void;
}
