import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, SeparatorModule, UltraCardConfig } from '../types';
export declare class UltraSeparatorModule extends BaseUltraModule {
    metadata: ModuleMetadata;
    createDefault(id?: string, hass?: HomeAssistant): SeparatorModule;
    renderGeneralTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderActionsTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderPreview(module: CardModule, hass: HomeAssistant, config?: UltraCardConfig, previewContext?: 'live' | 'ha-preview' | 'dashboard'): TemplateResult;
    renderLogicTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    validate(module: CardModule): {
        valid: boolean;
        errors: string[];
    };
    getStyles(): string;
    /**
     * Parse width/height value that can be a number, percentage string, or pixel string
     * Returns the CSS value string (e.g., "100%", "200px", "50%")
     */
    private parseSizeValue;
    /**
     * Extract numeric value from size string for comparison/validation
     */
    private extractNumericValue;
    private getSeparatorStyles;
    private getSeparatorLineStyles;
    private getTitleContainerStyles;
    private getTitleStyles;
    private camelToKebab;
    private _colorWithAlpha;
    private getBackgroundImageCSS;
    private styleObjectToCss;
    private addPixelUnit;
}
