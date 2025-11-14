import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { CardModule, UltraCardConfig } from '../types';
export interface GlobalActionsConfig {
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
}
export interface ActionConfig {
    action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    perform_action?: string;
    service?: string;
    target?: Record<string, any> | string;
    service_data?: Record<string, any>;
    data?: Record<string, any>;
    [key: string]: any;
}
export declare class GlobalActionsTab {
    /**
     * Check if a module has an entity (directly or through nested structures)
     */
    private static moduleHasEntity;
    static render(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    private static renderActionConfig;
    private static computeLabel;
    static getDefaultActions(): GlobalActionsConfig;
    static validateActions(actions: GlobalActionsConfig): {
        valid: boolean;
        errors: string[];
    };
}
