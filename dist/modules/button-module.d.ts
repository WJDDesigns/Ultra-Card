import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, ButtonModule, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';
export declare class UltraButtonModule extends BaseUltraModule {
    metadata: ModuleMetadata;
    createDefault(id?: string, hass?: HomeAssistant): ButtonModule;
    private getButtonStyles;
    private getAlignmentOptions;
    private getIconPositionOptions;
    renderGeneralTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    private renderLinkActionForm;
    private renderActionTypeSpecificFields;
    renderActionsTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    private renderButtonActionConfig;
    private renderSingleActionConfig;
    renderPreview(module: CardModule, hass: HomeAssistant, config?: UltraCardConfig, isEditorPreview?: boolean): TemplateResult;
    private styleObjectToCss;
    private getBackgroundImageCSS;
    renderLogicTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
}
