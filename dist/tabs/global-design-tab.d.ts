import { TemplateResult } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type { CardModule } from '../types';
import './uc-responsive-design-tab';
/**
 * GlobalDesignTab - Now delegates to the responsive design tab component
 * which provides WPBakery-style device-specific design controls.
 */
export declare class GlobalDesignTab {
    static render<M extends CardModule>(module: M, hass: HomeAssistant, updateModule: (updates: Partial<M>) => void): TemplateResult;
}
