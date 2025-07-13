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
    /**
     * Apply layout module design properties to child modules
     * Layout properties override child module properties
     */
    private applyLayoutDesignToChild;
    validate(module: CardModule): {
        valid: boolean;
        errors: string[];
    };
    private styleObjectToCss;
    private camelToKebab;
    private addPixelUnit;
    private getPaddingCSS;
    private getMarginCSS;
    private getBackgroundCSS;
    private getBackgroundImageCSS;
    private getBorderCSS;
    private getJustifyContent;
    getStyles(): string;
}
