import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, InfoModule, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';
import '../components/ultra-template-editor';
export declare class UltraInfoModule extends BaseUltraModule {
    metadata: ModuleMetadata;
    private _templateService?;
    private _templateInputDebounce;
    createDefault(id?: string, hass?: HomeAssistant): InfoModule;
    renderGeneralTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderActionsTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderLogicTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    private renderSingleActionConfig;
    renderSplitPreview(module: CardModule, hass: HomeAssistant): TemplateResult;
    renderPreview(module: CardModule, hass: HomeAssistant, config?: UltraCardConfig, previewContext?: 'live' | 'ha-preview' | 'dashboard'): TemplateResult;
    validate(module: CardModule): {
        valid: boolean;
        errors: string[];
    };
    getStyles(): string;
    private clickTimeout;
    private holdTimeout;
    private isHolding;
    private hasActiveActions;
    private handleClick;
    private handleDoubleClick;
    private handleMouseDown;
    private handleMouseUp;
    private handleMouseLeave;
    private handleTouchStart;
    private handleTouchEnd;
    private startHold;
    private endHold;
    private handleTapAction;
    private handleDoubleAction;
    private handleHoldAction;
    private _addEntity;
    private _removeEntity;
    private _handleEntityChange;
    private _updateEntity;
    private getBackgroundImageCSS;
    private styleObjectToCss;
    private addPixelUnit;
    private _hashString;
    private _handleTemplateChange;
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
}
