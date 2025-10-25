import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, BarModule, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';
import '../components/uc-gradient-editor';
import '../components/ultra-template-editor';
export declare class UltraBarModule extends BaseUltraModule {
    metadata: ModuleMetadata;
    private _templateService?;
    private _templateInputDebounce;
    createDefault(id?: string, hass?: HomeAssistant): BarModule;
    renderLogicTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    private findSuitableBatterySensor;
    renderGeneralTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderActionsTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderPreview(module: CardModule, hass: HomeAssistant, config?: UltraCardConfig, previewContext?: 'live' | 'ha-preview' | 'dashboard'): TemplateResult;
    private _hashString;
    validate(module: CardModule): {
        valid: boolean;
        errors: string[];
    };
    getStyles(): string;
    private styleObjectToCss;
    private camelToKebab;
    private getBackgroundImageCSS;
    private getImageUrl;
    private getBarSizeFromHeight;
    private getBarRadiusFromStyle;
    private interpolateColor;
    private hexToRgb;
    private rgbToHex;
    private parseColorToRGBA;
    private resolveCSSColor;
    private addPixelUnit;
}
