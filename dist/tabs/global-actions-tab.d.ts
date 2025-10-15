import { TemplateResult } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type { CardModule } from '../types';
import '../components/ultra-color-picker';
export declare class GlobalActionsTab {
    private static triggerPreviewUpdate;
    static render<M extends CardModule>(module: M, hass: HomeAssistant, updateModule: (updates: Partial<M>) => void, title?: string): TemplateResult;
    static getClickableClass(module: any): string;
    static getClickableStyle(module: any): string;
    /**
     * Resolves 'default' actions to their actual behavior at runtime
     * 'default' becomes 'more-info' for the module's entity if available, otherwise 'none'
     */
    static resolveAction(action: any, moduleEntity?: string): any;
    static getHoverStyles(): string;
    private static renderActionConfig;
    private static renderHoverEffectsSection;
    private static computeLabel;
}
