import { TemplateResult } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type { CardModule } from '../types';
export declare class GlobalDesignTab {
    static render<M extends CardModule>(module: M, hass: HomeAssistant, updateModule: (updates: Partial<M>) => void): TemplateResult;
}
