import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, IconModule, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';
export declare class UltraIconModule extends BaseUltraModule {
    metadata: ModuleMetadata;
    private _previewCollapsed;
    private _templateService?;
    private _attributeCache;
    private _updateTimeout?;
    private _processingAttributes;
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
    renderPreview(module: CardModule, hass: HomeAssistant, config?: UltraCardConfig): TemplateResult;
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
    private _getDisplayStateValue;
    private _getEntityAttributes;
    private _isBinaryEntity;
    /**
     * Enhanced state matching that supports both actual entity states and binary equivalents
     */
    private _matchesState;
    /**
     * Get state mappings for different entity types and device classes
     */
    private _getStateMappings;
    private _evaluateIconState;
    getStyles(): string;
    private _addIcon;
    private _removeIcon;
    private _updateIcon;
    private _debouncedUpdateIcon;
    private _triggerPreviewUpdate;
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
    /**
     * Extract color from entity state attributes
     */
    private _getEntityStateColor;
    /**
     * Convert HSV to RGB
     */
    private _hsToRgb;
    private _injectKeyframesIntoHaIcon;
}
