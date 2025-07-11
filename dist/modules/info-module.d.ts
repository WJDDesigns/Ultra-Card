import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, InfoModule, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';
export declare class UltraInfoModule extends BaseUltraModule {
    metadata: ModuleMetadata;
    createDefault(id?: string): InfoModule;
    renderGeneralTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult;
    validate(module: CardModule): {
        valid: boolean;
        errors: string[];
    };
    getStyles(): string;
    private _addEntity;
    private _removeEntity;
    private _handleEntityChange;
    private _updateEntity;
    private getBackgroundImageCSS;
    private styleObjectToCss;
    private addPixelUnit;
}
