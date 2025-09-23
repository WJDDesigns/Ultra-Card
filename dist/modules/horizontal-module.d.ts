import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig } from '../types';
import { HorizontalModule } from '../types';
export declare class UltraHorizontalModule extends BaseUltraModule {
    metadata: ModuleMetadata;
    createDefault(id?: string, hass?: HomeAssistant): HorizontalModule;
    renderGeneralTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderPreview(module: CardModule, hass: HomeAssistant, config?: UltraCardConfig): TemplateResult;
    private _renderChildModulePreview;
    /**
     * Apply layout module design properties to child modules
     * Layout properties override child module properties
     */
    private applyLayoutDesignToChild;
    renderLogicTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
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
    private getAlignItems;
    getStyles(): string;
}
