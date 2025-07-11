import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, SeparatorModule, UltraCardConfig } from '../types';
export declare class UltraSeparatorModule extends BaseUltraModule {
    metadata: ModuleMetadata;
    createDefault(id?: string): SeparatorModule;
    renderGeneralTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult;
    validate(module: CardModule): {
        valid: boolean;
        errors: string[];
    };
    getStyles(): string;
    private getSeparatorStyles;
    private getSeparatorLineStyles;
    private getTitleStyles;
    private camelToKebab;
    private getBackgroundImageCSS;
    private styleObjectToCss;
    private addPixelUnit;
}
