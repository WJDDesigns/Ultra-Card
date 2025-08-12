import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, MiniGraphModule as MiniGraphModuleType, UltraCardConfig } from '../types';
/**
 * Third-party wrapper module for kalkih/mini-graph-card
 * Only registered when the custom element is available in the runtime.
 * Ref: https://github.com/kalkih/mini-graph-card
 */
export declare class UltraMiniGraphModule extends BaseUltraModule {
    metadata: ModuleMetadata;
    createDefault(id?: string): MiniGraphModuleType;
    renderGeneralTab(module: CardModule, hass: HomeAssistant, _config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult;
    validate(module: CardModule): {
        valid: boolean;
        errors: string[];
    };
    getStyles(): string;
}
