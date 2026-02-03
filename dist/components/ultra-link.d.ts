import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { UltraCardConfig, CardModule } from '../types';
export interface UltraLinkConfig {
    tap_action?: TapActionConfig;
    hold_action?: TapActionConfig;
    double_tap_action?: TapActionConfig;
}
export interface TapActionConfig {
    action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing' | 'none';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    perform_action?: string;
    service?: string;
    target?: Record<string, any>;
    data?: Record<string, any>;
    service_data?: Record<string, any>;
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
    /**
     * Resolves a 'default' action to the appropriate native action based on entity domain
     * @param action The action config with 'default' action type
     * @param hass Home Assistant instance
     * @returns Resolved action config with native action for the entity type
     */
    private static resolveDefaultAction;
    static handleAction(action: TapActionConfig | undefined, hass: HomeAssistant, element?: HTMLElement, config?: UltraCardConfig, moduleEntity?: string, module?: CardModule): Promise<void>;
}
