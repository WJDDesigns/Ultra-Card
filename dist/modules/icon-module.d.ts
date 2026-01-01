import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, IconModule, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';
import '../components/ultra-template-editor';
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
    /**
     * Render simplified settings for static icons (no entity connection)
     * Static icons show only: icon, size, color, background, animation, hover
     */
    private _renderStaticIconSettings;
    renderActionsTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderLogicTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderOtherTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderPreview(module: CardModule, hass: HomeAssistant, config?: UltraCardConfig, previewContext?: 'live' | 'ha-preview' | 'dashboard'): TemplateResult;
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
    /**
     * Build entity context for unified templates
     * Provides access to entity data, attributes, and helper functions
     */
    private _getEntityContext;
    getStyles(): string;
    private _addIcon;
    private _removeIcon;
    private _updateIcon;
    private _debouncedUpdateIcon;
    private _triggerPreviewUpdate;
    private _updateIconWithLockSync;
    private _debouncedUpdateIconWithLockSync;
    private getBackgroundImageCSS;
    private styleObjectToCss;
    private _renderSizeControl;
    private _renderBackgroundPaddingControl;
    private _renderFieldWithLock;
    private _renderSizeControlWithLock;
    private _updateIconAnimationClasses;
    private _getInlineAnimation;
    private _applyAnimationDirectly;
    private _injectKeyframesForAllSplitPreviewIcons;
    /**
     * Helper method to add pixel unit if needed
     * Handles edge cases like "20x" -> "20px" and validates unit strings
     * Supports both string and number types for flexibility
     */
    private addPixelUnit;
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
    /**
     * Check if an entity has a custom icon or entity_picture and return the appropriate URL
     * @param entityState The entity state object
     * @param hass Home Assistant instance
     * @returns The entity picture URL or null if not available
     */
    private _getEntityPicture;
    /**
     * Check if an entity should use its picture instead of an icon
     * @param entityState The entity state object
     * @returns True if entity picture should be used
     */
    private _shouldUseEntityPicture;
    private _injectKeyframesIntoHaIcon;
}
