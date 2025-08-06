import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, ImageModule, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';
export declare class UltraImageModule extends BaseUltraModule {
    metadata: ModuleMetadata;
    createDefault(id?: string, hass?: HomeAssistant): ImageModule;
    renderGeneralTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderActionsTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult;
    private handleFileUpload;
    validate(module: CardModule): {
        valid: boolean;
        errors: string[];
    };
    private getBackgroundImageCSS;
    private styleObjectToCss;
    getStyles(): string;
    private addPixelUnit;
}
