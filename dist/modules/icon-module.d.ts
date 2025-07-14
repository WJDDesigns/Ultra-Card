import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, IconModule, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';
export declare class UltraIconModule extends BaseUltraModule {
    metadata: ModuleMetadata;
    createDefault(id?: string): IconModule;
    renderGeneralTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderActionsTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    private renderIconActionConfig;
    private renderSingleActionConfig;
    renderOtherTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult;
    validate(module: CardModule): {
        valid: boolean;
        errors: string[];
    };
    getStyles(): string;
    private _addIcon;
    private _removeIcon;
    private _updateIcon;
    private getBackgroundImageCSS;
    private styleObjectToCss;
    private addPixelUnit;
}
