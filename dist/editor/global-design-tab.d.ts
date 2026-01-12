import { LitElement, TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import '../components/ultra-color-picker';
import '../components/uc-device-selector';
import { ResponsiveDesignProperties } from '../types';
export interface DesignProperties {
    color?: string;
    text_align?: 'left' | 'center' | 'right' | 'justify';
    font_size?: string;
    line_height?: string;
    letter_spacing?: string;
    font_family?: string;
    font_weight?: string;
    text_transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    font_style?: 'normal' | 'italic' | 'oblique';
    white_space?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line';
    background_color?: string;
    background_image?: string;
    background_image_type?: 'none' | 'upload' | 'entity' | 'url';
    background_image_entity?: string;
    background_repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
    background_position?: 'left top' | 'left center' | 'left bottom' | 'center top' | 'center center' | 'center bottom' | 'right top' | 'right center' | 'right bottom';
    background_size?: 'cover' | 'contain' | 'auto' | string;
    backdrop_filter?: string;
    background_filter?: string;
    width?: string;
    height?: string;
    max_width?: string;
    max_height?: string;
    min_width?: string;
    min_height?: string;
    margin_top?: string;
    margin_bottom?: string;
    margin_left?: string;
    margin_right?: string;
    padding_top?: string;
    padding_bottom?: string;
    padding_left?: string;
    padding_right?: string;
    border_radius?: string;
    border_style?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
    border_width?: string;
    border_color?: string;
    position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    z_index?: string;
    text_shadow_h?: string;
    text_shadow_v?: string;
    text_shadow_blur?: string;
    text_shadow_color?: string;
    box_shadow_h?: string;
    box_shadow_v?: string;
    box_shadow_blur?: string;
    box_shadow_spread?: string;
    box_shadow_color?: string;
    overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
    clip_path?: string;
    animation_type?: 'none' | 'pulse' | 'vibrate' | 'rotate-left' | 'rotate-right' | 'hover' | 'fade' | 'scale' | 'bounce' | 'shake' | 'tada';
    animation_entity?: string;
    animation_trigger_type?: 'state' | 'attribute';
    animation_attribute?: string;
    animation_state?: string;
    intro_animation?: 'none' | 'fadeIn' | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight' | 'zoomIn' | 'bounceIn' | 'flipInX' | 'flipInY' | 'rotateIn';
    outro_animation?: 'none' | 'fadeOut' | 'slideOutUp' | 'slideOutDown' | 'slideOutLeft' | 'slideOutRight' | 'zoomOut' | 'bounceOut' | 'flipOutX' | 'flipOutY' | 'rotateOut';
    animation_duration?: string;
    animation_delay?: string;
    animation_timing?: 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier(0.25,0.1,0.25,1)';
    extra_class?: string;
    element_id?: string;
    css_variable_prefix?: string;
}
export declare class GlobalDesignTab extends LitElement {
    hass: HomeAssistant;
    designProperties: DesignProperties;
    onUpdate?: (properties: Partial<DesignProperties>) => void;
    responsiveDesign?: ResponsiveDesignProperties;
    private _expandedSections;
    private _marginLocked;
    private _paddingLocked;
    private _clipboardProperties;
    private _selectedDevice;
    private _responsiveEnabled;
    private static readonly CLIPBOARD_KEY;
    private static _lastAnimationTriggerType;
    connectedCallback(): void;
    updated(changedProperties: Map<string, unknown>): void;
    /**
     * Auto-enable responsive mode toggle if there are existing device overrides
     */
    private _checkAndEnableResponsiveMode;
    disconnectedCallback(): void;
    private _storageEventListener?;
    private _handleStorageEvent;
    private _loadClipboardFromStorage;
    private _saveClipboardToStorage;
    private _clearClipboardFromStorage;
    private _toggleSection;
    private _updateProperty;
    private _updateSpacing;
    private _createSpacingInputHandler;
    private _createRobustInputHandler;
    private _createProtectedKeydownHandler;
    private _handleNumericKeydown;
    private _toggleSpacingLock;
    private _resetSection;
    private _copyDesign;
    private _pasteDesign;
    private _resetAllDesign;
    /**
     * Toggle responsive overrides mode
     */
    private _toggleResponsiveMode;
    /**
     * Handle device selection change from the device selector
     */
    private _handleDeviceChange;
    /**
     * Reset overrides for the current device
     */
    private _resetCurrentDeviceOverrides;
    /**
     * Check if a section has device-specific overrides for the current device
     */
    private _sectionHasDeviceOverrides;
    /**
     * Check if ANY section has device overrides for non-desktop devices
     */
    private _hasAnyDeviceOverridesForSection;
    /**
     * Get informational text about the current device selection
     */
    private _getDeviceInfoText;
    /**
     * Get the effective design value for a property based on current device.
     * For desktop (base), returns the base value.
     * For other devices, returns device-specific override if exists, otherwise base value.
     */
    private _getEffectiveValue;
    /**
     * Get the device-specific value only (not merged with base).
     * Used to check if a device has an override for a property.
     */
    private _getDeviceOnlyValue;
    /**
     * Get effective design properties for the currently selected device.
     * Merges base (desktop) values with device-specific overrides.
     */
    private _getEffectiveDesignForCurrentDevice;
    private _clearClipboard;
    private _handleBackgroundImageUpload;
    private _truncatePath;
    private _getStateValueHint;
    private _getAttributeNameHint;
    private _getAttributeValueHint;
    private _hasModifiedProperties;
    private _loadGoogleFont;
    private _renderAccordion;
    protected render(): TemplateResult;
    static get styles(): import("lit").CSSResult;
    private _getBackgroundSizeDropdownValue;
    private _getCustomSizeValue;
}
