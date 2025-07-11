import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, TextModule, UltraCardConfig } from '../types';
export declare class UltraTextModule extends BaseUltraModule {
    metadata: ModuleMetadata;
    private clickTimeout;
    createDefault(id?: string): TextModule;
    renderGeneralTab(module: CardModule, hass: HomeAssistant, config: UltraCardConfig, updateModule: (updates: Partial<CardModule>) => void): TemplateResult;
    renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult;
    validate(module: CardModule): {
        valid: boolean;
        errors: string[];
    };
    private hasActiveLink;
    private validateAction;
    private handleClick;
    private handleDoubleClick;
    private holdTimeout;
    private isHolding;
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
    getStyles(): string;
    private getBackgroundImageCSS;
    private getImageUrl;
    private styleObjectToCss;
    private camelToKebab;
    private addPixelUnit;
}
