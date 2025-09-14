import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, IconModule, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';
export declare class UltraIconModule extends BaseUltraModule {
    metadata: ModuleMetadata;
    private _previewCollapsed;
    private _templateService?;
    private static _globalStylesInjected;
    private _localStylesInjected;
    private static readonly _ANIMATION_KEYFRAMES;
    private _injectGlobalStyles;
    private _hashString;
    private _highlightJinja2;
    createDefault(id?: string, hass?: HomeAssistant): IconModule;
    renderGeneralTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderActionsTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderLogicTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderOtherTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult;
    renderSplitPreview(module: CardModule, hass: HomeAssistant): TemplateResult;
    private _renderSimpleIconGrid;
    private _renderSingleIconPreview;
    private renderIconGrid;
    validate(module: CardModule): {
        valid: boolean;
        errors: string[];
    };
    updateHass(hass: HomeAssistant): void;
    cleanup(): void;
    private _isBinaryEntity;
    private _evaluateIconState;
    getStyles(): string;
    private _addIcon;
    private _removeIcon;
    private _updateIcon;
    private _updateIconWithLockSync;
    private getBackgroundImageCSS;
    private styleObjectToCss;
    private addPixelUnit;
    private _renderSizeControl;
    private _renderFieldWithLock;
    private _renderSizeControlWithLock;
    private _updateIconAnimationClasses;
    private _getInlineAnimation;
    private _applyAnimationDirectly;
    private _injectKeyframesForAllSplitPreviewIcons;
    /**
     * Format entity state value with units if show_units is enabled
     */
    private _formatValueWithUnits;
    private _injectKeyframesIntoHaIcon;
}
