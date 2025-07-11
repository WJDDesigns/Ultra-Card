import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig } from '../types';
import { VerticalModule } from '../types';
export declare class UltraVerticalModule extends BaseUltraModule {
    metadata: ModuleMetadata;
    createDefault(id?: string): VerticalModule;
    renderGeneralTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult;
    private _renderChildModulePreview;
    private _getModuleTitle;
    private _getModuleIcon;
    validate(module: CardModule): {
        valid: boolean;
        errors: string[];
    };
    private getJustifyContent;
    private _onDragOver;
    private _onDragEnter;
    private _onDragLeave;
    private _onDrop;
    private _onModuleDragStart;
    private _onDragEnd;
    private _onAddModuleClick;
    getStyles(): string;
}
