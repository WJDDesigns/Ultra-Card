import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, SeparatorModule, UltraCardConfig } from '../types';
export declare class UltraSeparatorModule extends BaseUltraModule {
    metadata: ModuleMetadata;
    createDefault(id?: string, hass?: HomeAssistant): SeparatorModule;
    renderGeneralTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderActionsTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderPreview(module: CardModule, hass: HomeAssistant, config?: UltraCardConfig, isEditorPreview?: boolean): TemplateResult;
    renderLogicTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    validate(module: CardModule): {
        valid: boolean;
        errors: string[];
    };
    getStyles(): string;
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
