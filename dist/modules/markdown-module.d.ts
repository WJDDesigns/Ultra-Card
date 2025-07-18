import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, MarkdownModule, UltraCardConfig } from '../types';
export declare class UltraMarkdownModule extends BaseUltraModule {
    metadata: ModuleMetadata;
    createDefault(id?: string): MarkdownModule;
    renderGeneralTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult;
    validate(module: CardModule): {
        valid: boolean;
        errors: string[];
    };
    getStyles(): string;
    private styleObjectToCss;
    private camelToKebab;
    private getBackgroundImageCSS;
    private addPixelUnit;
}
