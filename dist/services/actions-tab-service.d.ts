import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { CardModule, UltraCardConfig } from '../types';
export interface ModuleWithActions {
    tap_action?: any;
    hold_action?: any;
    double_tap_action?: any;
    enable_hover_effect?: boolean;
    hover_background_color?: string;
}
export declare class ActionsTabService {
    /**
     * Renders a complete Actions tab for any module using the global-actions-tab component
     * with hover effects section below it
     */
    static render(module: CardModule & ModuleWithActions, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    /**
     * Utility method to check if a module has any active actions configured
     */
    static hasActiveActions(module: ModuleWithActions): boolean;
    /**
     * Gets the standard hover CSS styles for clickable elements
     */
    static getHoverStyles(): string;
    /**
     * Gets the CSS class name for clickable elements
     */
    static getClickableClass(module: ModuleWithActions): string;
    /**
     * Gets the style properties for clickable elements
     */
    static getClickableStyle(module: ModuleWithActions): string;
}
