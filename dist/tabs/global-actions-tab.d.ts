import { TemplateResult } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type { CardModule } from '../types';
export declare class GlobalActionsTab {
    static render<M extends CardModule>(module: M, hass: HomeAssistant, updateModule: (updates: Partial<M>) => void, title?: string): TemplateResult;
    static getClickableClass(module: any): string;
    static getClickableStyle(module: any): string;
    static getHoverStyles(): string;
    private static renderActionConfig;
    private static computeLabel;
}
