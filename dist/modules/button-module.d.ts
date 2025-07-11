import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, ButtonModule, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';
export declare class UltraButtonModule extends BaseUltraModule {
    metadata: ModuleMetadata;
    createDefault(id?: string): ButtonModule;
    private getButtonStyles;
    private getAlignmentOptions;
    private getIconPositionOptions;
    renderGeneralTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    private renderLinkActionForm;
    private renderActionTypeSpecificFields;
    renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult;
    private getButtonStyleCSS;
    private getAlignmentCSS;
    validate(module: CardModule): {
        valid: boolean;
        errors: string[];
    };
    private getTextShadowCSS;
    private styleObjectToCss;
    private camelToKebab;
    private getBackgroundImageCSS;
    private addPixelUnit;
    getStyles(): string;
}
