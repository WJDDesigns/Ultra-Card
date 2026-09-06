import { TemplateResult, html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { formatEntityState } from '../utils/number-format';
import { CardModule, IconModule, IconConfig, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { TemplateService } from '../services/template-service';
// Removed ActionsTabService in favor of GlobalActionsTab
import { UltraLinkComponent } from '../components/ultra-link';
import { getImageUrl } from '../utils/image-upload';
import { localize } from '../localize/localize';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { logicService } from '../services/logic-service';
import { computeBackgroundStyles } from '../utils/uc-color-utils';

import { createLazySettings } from './uc-lazy-settings';

import { buildEntityContext, computeEntitySignature } from '../utils/template-context';
import {
  parseUnifiedTemplate,
  hasTemplateError,
  unifiedTemplateIcon,
} from '../utils/template-parser';
import { preprocessTemplateVariables } from '../utils/uc-template-processor';
import { parseLocaleNumber } from '../utils/parse-locale-number';

/** Unified-template output keys the icon module reads (`state` is an alias for `state_text`). */
export const ICON_TEMPLATE_KEYS = [
  'icon',
  'icon_color',
  'name',
  'name_color',
  'state_text',
  'state',
  'state_color',
  'container_background_color',
  'active',
  'is_active',
] as const;

const iconSettings = createLazySettings(
  () => import(/* webpackChunkName: "core-settings" */ './settings/icon-module-settings'),
  'icon settings'
);

export class UltraIconModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'icon',
    title: 'Icons',
    description: 'Interactive icon buttons',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:circle',
    category: 'interactive',
    tags: ['icon', 'button', 'interactive', 'control'],
  };

  private _previewCollapsed = false;
  // Drag state for reordering icons in the editor
  protected _draggedIconIndex: number | null = null;
  protected _dragOverIconIndex: number | null = null;
  private _templateService: TemplateService | undefined;
  /** Last good unified-template icon color per key (anti-flash across WS re-subscribe). */
  private _lastUnifiedIconDisplayColorByKey = new Map<string, string>();
  protected _attributeCache = new Map<string, { value: string | undefined; label: string }[]>();
  protected _updateTimeout: NodeJS.Timeout | undefined;
  private _processingAttributes = new Set<string>();

  // Ensure animation/keyframe CSS is globally available (outside editor shadow DOM)
  private static _globalStylesInjected = false;

  // Keyframes CSS shared across all icons (needed inside nested shadow roots)
  private static readonly _ANIMATION_KEYFRAMES = `
    @keyframes iconPulse {0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.7;transform:scale(1.1);}}
    @keyframes iconSpin {from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes iconBounce {0%,20%,50%,80%,100%{transform:translateY(0);}40%{transform:translateY(-10px);}60%{transform:translateY(-5px);}}
    @keyframes iconFlash {0%,50%,100%{opacity:1;}25%,75%{opacity:0.3;}}
    @keyframes iconShake {0%,100%{transform:translateX(0);}10%,30%,50%,70%,90%{transform:translateX(-2px);}20%,40%,60%,80%{transform:translateX(2px);}}
    @keyframes iconVibrate {0%,100%{transform:translate(0);}10%{transform:translate(-1px,-1px);}20%{transform:translate(1px,-1px);}30%{transform:translate(-1px,1px);}40%{transform:translate(1px,1px);}50%{transform:translate(-1px,-1px);}60%{transform:translate(1px,-1px);}70%{transform:translate(-1px,1px);}80%{transform:translate(1px,1px);}90%{transform:translate(-1px,-1px);}}
    @keyframes iconRotateLeft {from{transform:rotate(0deg);}to{transform:rotate(-360deg);}}
    @keyframes iconRotateRight {from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes iconFade {0%,100%{opacity:1;}50%{opacity:0.3;}}
    @keyframes iconScale {0%,100%{transform:scale(1);}50%{transform:scale(1.2);}}
    @keyframes iconTada {0%{transform:scale(1);}10%,20%{transform:scale(0.9) rotate(-3deg);}30%,50%,70%,90%{transform:scale(1.1) rotate(3deg);}40%,60%,80%{transform:scale(1.1) rotate(-3deg);}100%{transform:scale(1) rotate(0);}}
  `;

  // Inject module CSS into <head> once
  private _injectGlobalStyles(): void {
    if (UltraIconModule._globalStylesInjected) return;

    if (typeof document !== 'undefined') {
      const styleId = 'uvc-icon-module-styles';
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        // Only inject shared keyframes globally to avoid leaking component-specific CSS
        styleEl.textContent = UltraIconModule._ANIMATION_KEYFRAMES;
        document.head.appendChild(styleEl);
      }
      UltraIconModule._globalStylesInjected = true;
    }
  }

  // Simple string hash function for template cache keys
  private _hashString(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36); // Convert to base36 for shorter strings
  }

  /**
   * Build a collision-resistant unified template key for icon items.
   * Includes module + icon scopes so duplicated/missing icon ids don't collide.
   */
  private _buildUnifiedIconTemplateKey(
    icon: IconConfig,
    processedTemplate: string,
    cardConfig?: UltraCardConfig,
    moduleId?: string,
    iconIndex?: number,
    suffix = ''
  ): string {
    const cardScope =
      (cardConfig as any)?.__ucInstanceId &&
      String((cardConfig as any).__ucInstanceId).trim() !== ''
        ? String((cardConfig as any).__ucInstanceId)
        : 'card_unknown';
    const moduleScope = moduleId && moduleId.trim() !== '' ? moduleId : 'module_unknown';
    const iconScope =
      icon.id && String(icon.id).trim() !== ''
        ? String(icon.id)
        : iconIndex !== undefined
          ? `idx_${iconIndex.toString()}`
          : `hash_${this._hashString(`${icon.entity || ''}|${icon.name || ''}|${icon.icon_inactive || ''}|${icon.icon_active || ''}`)}`;
    const templateHash = this._hashString(processedTemplate);
    return `unified_${cardScope}_${moduleScope}_${icon.entity}_${iconScope}_${templateHash}${suffix}`;
  }

  createDefault(id?: string, hass?: HomeAssistant): IconModule {
    return {
      id: id || this.generateId('icon'),
      type: 'icon',
      icons: [
        {
          id: this.generateId('icon-item'),
          icon_mode: 'entity', // 'entity' = connected to HA entity, 'static' = standalone icon
          entity: 'weather.forecast_home',
          name: '',
          icon_inactive: 'mdi:weather-partly-cloudy',
          icon_active: 'mdi:weather-partly-cloudy',
          inactive_state: '',
          active_state: '',
          inactive_attribute: '',
          active_attribute: '',
          display_attribute: '',
          custom_inactive_state_text: '',
          custom_active_state_text: '',
          custom_inactive_name_text: '',
          custom_active_name_text: '',

          // Entity color options
          use_entity_color_for_icon: false,
          use_state_color_for_inactive_icon: false,
          use_state_color_for_active_icon: false,

          // Color configuration
          color_inactive: 'var(--secondary-text-color)',
          color_active: 'var(--primary-color)',
          inactive_icon_color: 'var(--secondary-text-color)',
          active_icon_color: 'var(--primary-color)',
          inactive_name_color: 'var(--primary-text-color)',
          active_name_color: 'var(--primary-text-color)',
          inactive_state_color: 'var(--secondary-text-color)',
          active_state_color: 'var(--secondary-text-color)',

          // Display toggles
          show_name_when_inactive: true,
          show_state_when_inactive: true,
          show_icon_when_inactive: true,
          show_name_when_active: true,
          show_state_when_active: true,
          show_icon_when_active: true,
          show_entity_picture: true,

          // Legacy (backward compatibility)
          show_state: true,
          show_name: true,

          // Other display options
          show_units: true,
          enable_hover_effect: false,

          // Sizing
          icon_size: 26,
          text_size: 14,
          name_icon_gap: 8,
          name_state_gap: 2,
          icon_state_gap: 4,

          // Active/Inactive specific sizing
          active_icon_size: 26,
          inactive_icon_size: 26,
          active_text_size: 14,
          inactive_text_size: 14,
          state_size: 14,
          active_state_size: 14,
          inactive_state_size: 14,

          // Individual size lock mechanism
          icon_size_locked: true,
          text_size_locked: true,
          state_size_locked: true,

          // Field lock mechanism (active fields inherit from inactive by default)
          active_icon_locked: true,
          active_icon_color_locked: false,
          active_icon_background_locked: true,
          active_icon_background_color_locked: true,
          active_name_locked: true,
          active_name_color_locked: true,
          active_state_locked: false,
          active_state_color_locked: true,

          // Icon background
          icon_background: 'none',
          use_entity_color_for_icon_background: false,
          icon_background_color: 'transparent',

          // Icon background padding (distance from icon to background edge)
          icon_background_padding: 8,
          inactive_icon_background_padding: 8,
          active_icon_background_padding: 8,
          active_icon_background_padding_locked: true,

          // Animations
          inactive_icon_animation: 'none',
          active_icon_animation: 'none',

          // Container appearance
          vertical_alignment: 'center',
          container_width: undefined,
          container_background_shape: 'none',
          container_background_color: '#808080',

          // Ultra Link Actions (Default = undefined for smart defaults)
          tap_action: undefined,
          hold_action: undefined,
          double_tap_action: undefined,

          // Legacy actions (backward compatibility)
          click_action: 'toggle',
          double_click_action: 'none',
          hold_action_legacy: 'none',
          navigation_path: '',
          url: '',
          service: '',
          service_data: {},

          // Unified template system
          unified_template_mode: false,
          unified_template: '',
          ignore_entity_state_config: false,
        },
      ],
      // alignment: undefined, // No default alignment to allow Global Design tab control
      // vertical_alignment: undefined, // No default alignment to allow Global Design tab control
      columns: 3,
      gap: 16,
      allow_wrap: true, // Allow grid items to wrap to new rows
      // Size configuration - defaults in General tab (not Design tab)
      text_size: 16,
      icon_size: 24,
      // Global action configuration (for the module container) - smart default based on entity type
      tap_action: undefined,
      hold_action: undefined,
      double_tap_action: undefined,
      // Logic (visibility) defaults
      display_mode: 'always',
      display_conditions: [],
    };
  }

  preloadSettings(): Promise<void> {
    return iconSettings.prefetch();
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return iconSettings(s => s.renderIconGeneralTab(this, module, hass, config, updateModule));
  }

  override renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as any, hass, updates => updateModule(updates));
  }

  // Explicit Logic tab renderer (some editors call this directly)
  renderLogicTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as any, hass, updates => updateModule(updates));
  }

  // Note: Icon-specific display and spacing settings were moved to General tab for consistency
  // This method is kept for backward compatibility but only renders logic
  override renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return this.renderLogicTab(module, hass, config, updateModule);
  }

  /**
   * Resolves the module-level item layout (issue #125) into flex styles shared by
   * the live preview and the split preview. Defaults reproduce the classic
   * centered icon-above-text arrangement.
   */
  private _getIconItemLayout(
    iconModule: IconModule | undefined,
    icon: IconConfig
  ): {
    flexDirection: string;
    justifyContent: string;
    alignItems: string;
    margin: string;
    textAlignItems: string;
    textAlign: string;
  } {
    const position = iconModule?.icon_position || 'top';
    const distribution = iconModule?.content_distribution || 'normal';
    const overall = iconModule?.overall_alignment || 'center';
    const nameAlignment = iconModule?.name_alignment || 'center';
    const horizontal = position === 'left' || position === 'right';
    const reversed = position === 'right' || position === 'bottom';

    const flexFor = (v: string): string =>
      v === 'left' || v === 'top' || v === 'start'
        ? 'flex-start'
        : v === 'right' || v === 'bottom' || v === 'end'
          ? 'flex-end'
          : 'center';
    const overallFlex = flexFor(overall);
    const verticalFlex = flexFor(icon.vertical_alignment || 'center');

    return {
      flexDirection: horizontal
        ? reversed
          ? 'row-reverse'
          : 'row'
        : reversed
          ? 'column-reverse'
          : 'column',
      justifyContent:
        distribution !== 'normal' ? distribution : horizontal ? overallFlex : verticalFlex,
      alignItems: horizontal ? verticalFlex : overallFlex,
      margin: overall === 'left' ? '0 auto 0 0' : overall === 'right' ? '0 0 0 auto' : '0 auto',
      textAlignItems: flexFor(nameAlignment),
      textAlign: nameAlignment === 'start' ? 'left' : nameAlignment === 'end' ? 'right' : 'center',
    };
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const iconModule = module as IconModule;
    const lang = hass?.locale?.language || 'en';

    // Initialize template service if needed
    if (!this._templateService && hass) {
      this._templateService = new TemplateService(hass);
    }

    // Update hass reference if it changed
    if (this._templateService && hass) {
      this._templateService.updateHass(hass);
    }

    // Apply design properties with priority - Global Design saves to top-level properties
    const moduleWithDesign = iconModule as any;
    const designFromDesignObject = (iconModule as any).design || {};

    // Create merged design properties object that prioritizes top-level properties (where Global Design saves)
    const designProperties = {
      // Text properties - prioritize top-level (where Global Design saves them)
      color: (iconModule as any).color || designFromDesignObject.color,
      font_size: (iconModule as any).font_size || designFromDesignObject.font_size,
      font_weight: (iconModule as any).font_weight || designFromDesignObject.font_weight,
      font_style: (iconModule as any).font_style || designFromDesignObject.font_style,
      text_transform: (iconModule as any).text_transform || designFromDesignObject.text_transform,
      font_family: (iconModule as any).font_family || designFromDesignObject.font_family,
      line_height: (iconModule as any).line_height || designFromDesignObject.line_height,
      letter_spacing: (iconModule as any).letter_spacing || designFromDesignObject.letter_spacing,
      text_align: (iconModule as any).text_align || designFromDesignObject.text_align,
      text_shadow_h: (iconModule as any).text_shadow_h || designFromDesignObject.text_shadow_h,
      text_shadow_v: (iconModule as any).text_shadow_v || designFromDesignObject.text_shadow_v,
      text_shadow_blur:
        (iconModule as any).text_shadow_blur || designFromDesignObject.text_shadow_blur,
      text_shadow_color:
        (iconModule as any).text_shadow_color || designFromDesignObject.text_shadow_color,
      // Container properties - also check both locations
      background_color:
        (iconModule as any).background_color || designFromDesignObject.background_color,
      background_image:
        (iconModule as any).background_image || designFromDesignObject.background_image,
      background_image_type:
        (iconModule as any).background_image_type || designFromDesignObject.background_image_type,
      background_image_entity:
        (iconModule as any).background_image_entity ||
        designFromDesignObject.background_image_entity,
      background_size:
        (iconModule as any).background_size || designFromDesignObject.background_size,
      background_position:
        (iconModule as any).background_position || designFromDesignObject.background_position,
      background_repeat:
        (iconModule as any).background_repeat || designFromDesignObject.background_repeat,
      border_radius: (iconModule as any).border_radius || designFromDesignObject.border_radius,
      border_style: (iconModule as any).border_style || designFromDesignObject.border_style,
      border_width: (iconModule as any).border_width || designFromDesignObject.border_width,
      border_color: (iconModule as any).border_color || designFromDesignObject.border_color,
      padding_top: (iconModule as any).padding_top || designFromDesignObject.padding_top,
      padding_bottom: (iconModule as any).padding_bottom || designFromDesignObject.padding_bottom,
      padding_left: (iconModule as any).padding_left || designFromDesignObject.padding_left,
      padding_right: (iconModule as any).padding_right || designFromDesignObject.padding_right,
      margin_top: (iconModule as any).margin_top || designFromDesignObject.margin_top,
      margin_bottom: (iconModule as any).margin_bottom || designFromDesignObject.margin_bottom,
      margin_left: (iconModule as any).margin_left || designFromDesignObject.margin_left,
      margin_right: (iconModule as any).margin_right || designFromDesignObject.margin_right,
      position: (iconModule as any).position || designFromDesignObject.position,
      top: (iconModule as any).top || designFromDesignObject.top,
      bottom: (iconModule as any).bottom || designFromDesignObject.bottom,
      left: (iconModule as any).left || designFromDesignObject.left,
      right: (iconModule as any).right || designFromDesignObject.right,
      z_index: (iconModule as any).z_index || designFromDesignObject.z_index,
      width: (iconModule as any).width || designFromDesignObject.width,
      height: (iconModule as any).height || designFromDesignObject.height,
      max_width: (iconModule as any).max_width || designFromDesignObject.max_width,
      max_height: (iconModule as any).max_height || designFromDesignObject.max_height,
      min_width: (iconModule as any).min_width || designFromDesignObject.min_width,
      min_height: (iconModule as any).min_height || designFromDesignObject.min_height,
      overflow: (iconModule as any).overflow || designFromDesignObject.overflow,
      clip_path: (iconModule as any).clip_path || designFromDesignObject.clip_path,
      backdrop_filter:
        (iconModule as any).backdrop_filter || designFromDesignObject.backdrop_filter,
      box_shadow_h: (iconModule as any).box_shadow_h || designFromDesignObject.box_shadow_h,
      box_shadow_v: (iconModule as any).box_shadow_v || designFromDesignObject.box_shadow_v,
      box_shadow_blur:
        (iconModule as any).box_shadow_blur || designFromDesignObject.box_shadow_blur,
      box_shadow_spread:
        (iconModule as any).box_shadow_spread || designFromDesignObject.box_shadow_spread,
      box_shadow_color:
        (iconModule as any).box_shadow_color || designFromDesignObject.box_shadow_color,
      hover_effect: (iconModule as any).hover_effect || designFromDesignObject.hover_effect,
    };

    // Check if any icon has a template-based container background color (needs to be parsed from template strings)
    // This needs to happen BEFORE containerStyles are built
    let templateContainerBg = '';
    const tempValidIcons = (iconModule.icons || []).filter(i => i.entity && i.entity.trim() !== '');
    for (let tempIconIdx = 0; tempIconIdx < tempValidIcons.length; tempIconIdx++) {
      const icon = tempValidIcons[tempIconIdx];
      // Check if icon has unified template mode enabled
      if (icon.unified_template_mode && icon.unified_template) {
        // Initialize template service if needed
        if (!this._templateService && hass) {
          this._templateService = new TemplateService(hass);
        }

        const processedUnifiedTemplate = preprocessTemplateVariables(
          icon.unified_template,
          hass,
          config
        );
        const templateKey = this._buildUnifiedIconTemplateKey(
          icon,
          processedUnifiedTemplate,
          config,
          iconModule.id,
          tempIconIdx
        );

        if (!hass.__uvc_template_strings) {
          hass.__uvc_template_strings = {};
        }

        if (this._templateService) {
          const context = this._getEntityContext(icon, hass, config);
          const entitySig = computeEntitySignature(icon.entity, hass);
          this._templateService.subscribeToTemplate(
            processedUnifiedTemplate,
            templateKey,
            () => {
              this.triggerPreviewUpdate();
            },
            context,
            config,
            entitySig
          );
        }

        // Check if we already have the rendered template result
        const unifiedResult = hass?.__uvc_template_strings?.[templateKey];
        if (unifiedResult && String(unifiedResult).trim() !== '') {
          const parsed = parseUnifiedTemplate(unifiedResult);
          if (!hasTemplateError(parsed) && parsed.container_background_color) {
            templateContainerBg = parsed.container_background_color;
            break; // Use first icon's template background
          }
        }
      }
    }

    // Container styles for design system - no hardcoded spacing, user controls all
    const containerStyles = {
      // Flexbox centering for when specific width/height is set
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      // Only apply padding if explicitly set by user
      padding:
        designProperties.padding_top ||
        designProperties.padding_bottom ||
        designProperties.padding_left ||
        designProperties.padding_right ||
        moduleWithDesign.padding_top ||
        moduleWithDesign.padding_bottom ||
        moduleWithDesign.padding_left ||
        moduleWithDesign.padding_right
          ? `${this.addPixelUnit(designProperties.padding_top || moduleWithDesign.padding_top) || '0px'} ${this.addPixelUnit(designProperties.padding_right || moduleWithDesign.padding_right) || '0px'} ${this.addPixelUnit(designProperties.padding_bottom || moduleWithDesign.padding_bottom) || '0px'} ${this.addPixelUnit(designProperties.padding_left || moduleWithDesign.padding_left) || '0px'}`
          : '0',
      margin:
        designProperties.margin_top ||
        designProperties.margin_bottom ||
        designProperties.margin_left ||
        designProperties.margin_right ||
        moduleWithDesign.margin_top ||
        moduleWithDesign.margin_bottom ||
        moduleWithDesign.margin_left ||
        moduleWithDesign.margin_right
          ? `${designProperties.margin_top || moduleWithDesign.margin_top || '0px'} ${designProperties.margin_right || moduleWithDesign.margin_right || '0px'} ${designProperties.margin_bottom || moduleWithDesign.margin_bottom || '0px'} ${designProperties.margin_left || moduleWithDesign.margin_left || '0px'}`
          : '0',
      background:
        templateContainerBg ||
        designProperties.background_color ||
        moduleWithDesign.background_color ||
        'transparent',
      backgroundImage: this.getBackgroundImageCSS(
        { ...moduleWithDesign, ...designProperties },
        hass,
        config
      ),
      backgroundSize:
        designProperties.background_size || moduleWithDesign.background_size || 'cover',
      backgroundPosition:
        designProperties.background_position || moduleWithDesign.background_position || 'center',
      backgroundRepeat:
        designProperties.background_repeat || moduleWithDesign.background_repeat || 'no-repeat',
      border:
        (designProperties.border_style || moduleWithDesign.border_style) &&
        (designProperties.border_style || moduleWithDesign.border_style) !== 'none'
          ? `${this.addPixelUnit(designProperties.border_width || moduleWithDesign.border_width) || '1px'} ${designProperties.border_style || moduleWithDesign.border_style} ${designProperties.border_color || moduleWithDesign.border_color || 'var(--divider-color)'}`
          : 'none',
      borderRadius:
        this.addPixelUnit(designProperties.border_radius || moduleWithDesign.border_radius) || '0',
      position: designProperties.position || moduleWithDesign.position || 'relative',
      top: designProperties.top || moduleWithDesign.top || 'auto',
      bottom: designProperties.bottom || moduleWithDesign.bottom || 'auto',
      left: designProperties.left || moduleWithDesign.left || 'auto',
      right: designProperties.right || moduleWithDesign.right || 'auto',
      zIndex: designProperties.z_index || moduleWithDesign.z_index || 'auto',
      width: designProperties.width || moduleWithDesign.width || '100%',
      height: designProperties.height || moduleWithDesign.height || 'auto',
      maxWidth: designProperties.max_width || moduleWithDesign.max_width || '100%',
      maxHeight: designProperties.max_height || moduleWithDesign.max_height || 'none',
      minWidth: designProperties.min_width || moduleWithDesign.min_width || 'none',
      minHeight: designProperties.min_height || moduleWithDesign.min_height || 'auto',
      overflow: designProperties.overflow || moduleWithDesign.overflow || 'hidden',
      clipPath: designProperties.clip_path || moduleWithDesign.clip_path || 'none',
      backdropFilter:
        designProperties.backdrop_filter || moduleWithDesign.backdrop_filter || 'none',
      boxShadow:
        designProperties.box_shadow_h && designProperties.box_shadow_v
          ? `${designProperties.box_shadow_h || '0'} ${designProperties.box_shadow_v || '0'} ${designProperties.box_shadow_blur || '0'} ${designProperties.box_shadow_spread || '0'} ${designProperties.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : moduleWithDesign.box_shadow_h && moduleWithDesign.box_shadow_v
            ? `${moduleWithDesign.box_shadow_h || '0'} ${moduleWithDesign.box_shadow_v || '0'} ${moduleWithDesign.box_shadow_blur || '0'} ${moduleWithDesign.box_shadow_spread || '0'} ${moduleWithDesign.box_shadow_color || 'rgba(0,0,0,0.1)'}`
            : 'none',
      boxSizing: 'border-box',
    };

    // Ensure animations/styles exist globally
    this._injectGlobalStyles();
    // Ensure keyframes exist inside ha-icon shadow roots for Live Preview animations
    this._injectKeyframesForAllSplitPreviewIcons();

    // Inject into local shadow DOM — include keyframes so animations work in shadow DOM context
    const localStyle = html`<style>
      ${UltraIconModule._ANIMATION_KEYFRAMES}
      ${this.getStyles()}
    </style>`;

    const hoverEffectClass = this.getHoverEffectClass(module);
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));

    // GRACEFUL RENDERING: Check for incomplete configuration
    // Static icons are always valid (no entity required)
    // Entity-based icons need an entity to be valid
    // Also respect per-icon user_visibility (HA auth user filter)
    if (hass) {
      logicService.setHass(hass);
    }
    const validIcons = (iconModule.icons || []).filter(
      i =>
        (i.icon_mode === 'static' || (i.entity && i.entity.trim() !== '')) &&
        logicService.evaluateUserVisibility(i.user_visibility)
    );
    // Only entity-based icons without entities are incomplete
    const incompleteIcons = (iconModule.icons || []).filter(
      i => i.icon_mode !== 'static' && (!i.entity || i.entity.trim() === '')
    );

    if (!iconModule.icons || iconModule.icons.length === 0) {
      return html`
        ${localStyle}
        ${this.renderGradientErrorState(
          localize('editor.icon.error_no_icons', lang, 'Add Icons'),
          localize('editor.icon.error_no_icons_desc', lang, 'Configure icons in the General tab'),
          'mdi:shape-outline'
        )}
      `;
    }

    if (validIcons.length === 0 && incompleteIcons.length > 0) {
      const iconList = incompleteIcons.map((i, idx) => `Icon ${idx + 1}`).join(', ');
      return html`
        ${localStyle}
        ${this.renderGradientErrorState(
          localize('editor.icon.error_icons_need_entities', lang, 'Icons Need Entities'),
          iconList,
          'mdi:shape-outline'
        )}
      `;
    }

    const warningBanner =
      incompleteIcons.length > 0
        ? this.renderGradientWarningBanner(
            `${incompleteIcons.length > 1 ? 'icons' : 'icon'} need${incompleteIcons.length === 1 ? 's' : ''} entities`,
            incompleteIcons.length
          )
        : '';

    return this.wrapWithAnimation(
      html`
        ${localStyle} ${warningBanner}
        <div class="icon-module-container ${hoverEffectClass}" style="${designStyles}">
          <div class="icon-module-preview">
            <div
              class="icon-grid"
              style="
            display: grid;
            grid-template-columns: repeat(${Math.min(
                iconModule.columns || 3,
                validIcons.length
              )}, 1fr);
            grid-auto-flow: ${iconModule.allow_wrap === false ? 'column' : 'row'};
            gap: ${iconModule.gap || 16}px;
            justify-content: ${iconModule.alignment || 'center'};
          "
            >
              ${validIcons.map((icon, iconIdx) => {
                const isStaticIcon = icon.icon_mode === 'static';
                const resolvedIconEntity = isStaticIcon
                  ? undefined
                  : this.resolveEntity(icon.entity, config) || icon.entity;
                const entityState =
                  isStaticIcon || !resolvedIconEntity
                    ? undefined
                    : hass?.states[resolvedIconEntity];
                const currentState = entityState?.state || 'unknown';

                const isActive = isStaticIcon ? false : this._evaluateIconState(icon, hass, config);

                // Store template results in local variables (icons may be read-only)
                let templateContainerBgColor: string | undefined;

                // Determine what to show based on state
                // Static icons: always show icon, never show name/state (pure icon only)
                const shouldShowIcon = isStaticIcon
                  ? true
                  : isActive
                    ? icon.show_icon_when_active !== false
                    : icon.show_icon_when_inactive !== false;
                const shouldShowName = isStaticIcon
                  ? false
                  : isActive
                    ? icon.show_name_when_active !== false
                    : icon.show_name_when_inactive !== false;
                const shouldShowState = isStaticIcon
                  ? false
                  : isActive
                    ? icon.show_state_when_active !== false
                    : icon.show_state_when_inactive !== false;

                // Get display values based on state - priority cascade for templates
                let displayIcon = isActive
                  ? icon.icon_active || icon.icon_inactive
                  : icon.icon_inactive;
                let displayColor = isActive
                  ? icon.use_state_color_for_active_icon
                    ? this._getEntityStateColor(entityState) || icon.active_icon_color
                    : icon.use_entity_color_for_icon
                      ? entityState?.attributes?.rgb_color
                        ? `rgb(${entityState.attributes.rgb_color.join(',')})`
                        : icon.active_icon_color
                      : icon.active_icon_color
                  : icon.use_state_color_for_inactive_icon
                    ? this._getEntityStateColor(entityState) || icon.inactive_icon_color
                    : icon.use_entity_color_for_icon
                      ? entityState?.attributes?.rgb_color
                        ? `rgb(${entityState.attributes.rgb_color.join(',')})`
                        : icon.inactive_icon_color
                      : icon.inactive_icon_color;

                let tmplName: string | undefined;
                let tmplStateText: string | undefined;
                let tmplNameColor: string | undefined;
                let tmplStateColor: string | undefined;

                // PRIORITY 1: Unified template (if enabled)
                if (icon.unified_template_mode && icon.unified_template) {
                  if (!this._templateService && hass) {
                    this._templateService = new TemplateService(hass);
                  } else if (this._templateService && hass) {
                    // CRITICAL: Update the template service's hass reference to ensure
                    // template results are stored in the same hass object we read from.
                    // Without this, results may be stored in an old hass reference.
                    this._templateService.updateHass(hass);
                  }

                  const processedUnifiedTemplate = preprocessTemplateVariables(
                    icon.unified_template,
                    hass,
                    config
                  );
                  const templateKey = this._buildUnifiedIconTemplateKey(
                    icon,
                    processedUnifiedTemplate,
                    config,
                    iconModule.id,
                    iconIdx
                  );

                  if (!hass.__uvc_template_strings) {
                    hass.__uvc_template_strings = {};
                  }

                  if (this._templateService) {
                    const context = this._getEntityContext(icon, hass, config);
                    const entitySig = computeEntitySignature(icon.entity, hass);
                    this._templateService.subscribeToTemplate(
                      processedUnifiedTemplate,
                      templateKey,
                      () => {
                        this.triggerPreviewUpdate();
                      },
                      context,
                      config,
                      entitySig
                    );
                  }

                  const unifiedResult = hass?.__uvc_template_strings?.[templateKey];
                  let appliedUnifiedIconColor = false;
                  if (unifiedResult && String(unifiedResult).trim() !== '') {
                    const parsed = parseUnifiedTemplate(unifiedResult);
                    if (!hasTemplateError(parsed)) {
                      const uIcon = unifiedTemplateIcon(parsed);
                      if (uIcon) displayIcon = uIcon;
                      if (parsed.icon_color) {
                        displayColor = parsed.icon_color;
                        this._lastUnifiedIconDisplayColorByKey.set(templateKey, parsed.icon_color);
                        appliedUnifiedIconColor = true;
                      }
                      if (parsed.name) tmplName = String(parsed.name);
                      if (parsed.state_text !== undefined) {
                        tmplStateText = String(parsed.state_text);
                      } else if (parsed._isString && parsed.content && !uIcon) {
                        tmplStateText = String(parsed.content).trim();
                      }
                      if (parsed.name_color) tmplNameColor = String(parsed.name_color);
                      if (parsed.state_color) tmplStateColor = String(parsed.state_color);
                      if (parsed.container_background_color) {
                        templateContainerBgColor = parsed.container_background_color;
                      }
                    }
                  }
                  if (!appliedUnifiedIconColor) {
                    const heldColor = this._lastUnifiedIconDisplayColorByKey.get(templateKey);
                    if (heldColor) displayColor = heldColor;
                  }
                } else if (entityState?.attributes?.icon && !displayIcon) {
                  displayIcon = entityState.attributes.icon;
                }

                const nameColor =
                  tmplNameColor ||
                  designProperties.color ||
                  (isActive ? icon.active_name_color : icon.inactive_name_color);
                const stateColor =
                  tmplStateColor ||
                  designProperties.color ||
                  (isActive ? icon.active_state_color : icon.inactive_state_color);

                // Apply Global Design text formatting properties
                const globalTextStyles = {
                  fontSize: designProperties.font_size
                    ? /[a-zA-Z%]/.test(designProperties.font_size)
                      ? designProperties.font_size
                      : this.addPixelUnit(designProperties.font_size) || designProperties.font_size
                    : undefined,
                  fontFamily: designProperties.font_family || undefined,
                  fontWeight: designProperties.font_weight || undefined,
                  fontStyle: designProperties.font_style || undefined,
                  textTransform: designProperties.text_transform || undefined,
                  lineHeight: designProperties.line_height || undefined,
                  letterSpacing: designProperties.letter_spacing || undefined,
                  textAlign: designProperties.text_align || undefined,
                  textShadow:
                    designProperties.text_shadow_h && designProperties.text_shadow_v
                      ? `${designProperties.text_shadow_h || '0'} ${designProperties.text_shadow_v || '0'} ${designProperties.text_shadow_blur || '0'} ${designProperties.text_shadow_color || 'rgba(0,0,0,0.5)'}`
                      : undefined,
                };

                const displayName =
                  tmplName ||
                  (isActive
                    ? icon.custom_active_name_text ||
                      icon.name ||
                      entityState?.attributes?.friendly_name ||
                      icon.entity
                    : icon.custom_inactive_name_text ||
                      icon.name ||
                      entityState?.attributes?.friendly_name ||
                      icon.entity);

                let displayState: string;

                if (tmplStateText !== undefined) {
                  displayState = tmplStateText;
                } else {
                  displayState = this._getDisplayStateValue(icon, hass, isActive, config);
                }

                // Icon background styles - use active/inactive specific properties
                const iconBackground = isActive
                  ? icon.active_icon_background || icon.icon_background
                  : icon.inactive_icon_background || icon.icon_background;

                const iconBackgroundColor = isActive
                  ? icon.active_icon_background_color || icon.icon_background_color
                  : icon.inactive_icon_background_color || icon.icon_background_color;

                const iconBackgroundPadding = isActive
                  ? (icon.active_icon_background_padding ?? icon.icon_background_padding ?? 8)
                  : (icon.inactive_icon_background_padding ?? icon.icon_background_padding ?? 8);

                const iconBackgroundStyle = (() => {
                  if (iconBackground === 'none') {
                    return {};
                  }

                  const computedColor = icon.use_entity_color_for_icon_background
                    ? entityState?.attributes?.rgb_color
                      ? `rgb(${entityState.attributes.rgb_color.join(',')})`
                      : iconBackgroundColor
                    : iconBackgroundColor;

                  const { styles: backgroundStyles } = computeBackgroundStyles({
                    color: computedColor,
                    fallback: iconBackgroundColor || 'transparent',
                  });

                  return {
                    ...backgroundStyles,
                    borderRadius:
                      iconBackground === 'circle'
                        ? '50%'
                        : iconBackground === 'rounded-square'
                          ? '8px'
                          : '0',
                    padding: `${iconBackgroundPadding}px`,
                  };
                })();

                // Always ensure wrapper centers content for animations
                const baseWrapperStyle = {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                };

                const mergedWrapperStyle = { ...baseWrapperStyle, ...iconBackgroundStyle };

                // Animation classes
                const activeAnimation = icon.active_icon_animation || 'none';
                const inactiveAnimation = icon.inactive_icon_animation || 'none';

                const currentAnimation = isActive ? activeAnimation : inactiveAnimation;
                const animationClass =
                  currentAnimation !== 'none' ? `icon-animation-${currentAnimation}` : '';

                // Force animation class updates when state changes
                if (animationClass) {
                  setTimeout(() => {
                    this._updateIconAnimationClasses(icon.entity, animationClass, isActive);
                  }, 100);
                }

                // Container styles
                const itemLayout = this._getIconItemLayout(iconModule, icon);
                const containerStyles: Record<string, string> = {
                  display: 'flex',
                  flexDirection: itemLayout.flexDirection,
                  alignItems: itemLayout.alignItems,
                  justifyContent: itemLayout.justifyContent,
                  // Apply padding from design properties if set, otherwise use 0
                  padding:
                    designProperties.padding_top ||
                    designProperties.padding_bottom ||
                    designProperties.padding_left ||
                    designProperties.padding_right
                      ? `${this.addPixelUnit(designProperties.padding_top) || '0px'} ${this.addPixelUnit(designProperties.padding_right) || '0px'} ${this.addPixelUnit(designProperties.padding_bottom) || '0px'} ${this.addPixelUnit(designProperties.padding_left) || '0px'}`
                      : '0',
                  borderRadius: designProperties.border_radius
                    ? this.addPixelUnit(designProperties.border_radius) || '0'
                    : icon.container_background_shape === 'circle'
                      ? '50%'
                      : icon.container_background_shape === 'rounded'
                        ? '8px'
                        : icon.container_background_shape === 'square'
                          ? '0'
                          : '0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: icon.container_width ? `${icon.container_width}%` : 'auto',
                };

                const hasContainerBackground =
                  icon.container_background_shape && icon.container_background_shape !== 'none';

                if (hasContainerBackground) {
                  // Priority: template result > configured container_background_color > default
                  const containerBgColor =
                    templateContainerBgColor || icon.container_background_color || '#808080';
                  const { styles: backgroundStyles } = computeBackgroundStyles({
                    color: containerBgColor,
                    fallback: containerBgColor,
                    image: this.getBackgroundImageCSS(icon, hass, config),
                    imageSize: (icon as any).background_size || 'cover',
                    imagePosition: icon.background_position || 'center',
                    imageRepeat: icon.background_repeat || 'no-repeat',
                  });
                  Object.assign(containerStyles, backgroundStyles);
                } else {
                  // Even if container_background_shape is 'none', check for template background color
                  if (templateContainerBgColor) {
                    containerStyles.backgroundColor = templateContainerBgColor;
                    containerStyles.background = templateContainerBgColor;
                    // Apply border-radius from design properties when template background is used
                    if (designProperties.border_radius) {
                      containerStyles.borderRadius =
                        this.addPixelUnit(designProperties.border_radius) || '0';
                    }
                  } else {
                    containerStyles.background = 'transparent';
                    containerStyles.backgroundColor = 'transparent';
                  }
                }

                // Create gesture handlers using centralized service
                // This prevents double-click bugs and ensures consistent behavior across all modules
                // Per-icon actions take precedence when explicitly configured; 'nothing' and
                // 'default' are treated as "not set" because legacy icon defaults wrote
                // { action: 'nothing' }, and overriding module-level actions with those
                // would break existing configs.
                const pickIconAction = (iconAction: any, moduleAction: any) =>
                  iconAction &&
                  iconAction.action &&
                  iconAction.action !== 'nothing' &&
                  iconAction.action !== 'default'
                    ? iconAction
                    : moduleAction;
                const effectiveTapAction = pickIconAction(icon.tap_action, iconModule.tap_action);
                const effectiveHoldAction = pickIconAction(
                  icon.hold_action,
                  iconModule.hold_action
                );
                const effectiveDoubleTapAction = pickIconAction(
                  icon.double_tap_action,
                  iconModule.double_tap_action
                );
                const handleGestures = this.createGestureHandlers(
                  `${iconModule.id}_${icon.id}`,
                  {
                    tap_action: effectiveTapAction,
                    hold_action: effectiveHoldAction,
                    double_tap_action: effectiveDoubleTapAction,
                    entity: resolvedIconEntity || icon.entity,
                    module: iconModule,
                  },
                  hass,
                  config
                );

                // Keyboard accessibility: undefined actions fall back to the gesture
                // service's smart default, so an icon is only non-interactive when its
                // actions are all explicitly set to nothing/none.
                const isNothingAction = (a: any) =>
                  !!a && (a.action === 'nothing' || a.action === 'none');
                const hasActionableGestures =
                  !isNothingAction(effectiveTapAction) ||
                  !isNothingAction(effectiveHoldAction) ||
                  !isNothingAction(effectiveDoubleTapAction);
                const iconAriaLabel =
                  icon.name ||
                  entityState?.attributes?.friendly_name ||
                  icon.entity ||
                  displayIcon ||
                  'Icon';
                const onIconKeyDown = (e: KeyboardEvent) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return;
                  e.preventDefault();
                  e.stopPropagation();
                  if (isNothingAction(effectiveTapAction)) return;
                  this.handleModuleAction(
                    effectiveTapAction ||
                      ({ action: 'default', entity: resolvedIconEntity || icon.entity } as any),
                    hass,
                    e.currentTarget as HTMLElement,
                    config,
                    resolvedIconEntity || icon.entity,
                    iconModule
                  );
                };

                // Get hover effect configuration from module design
                const hoverEffect = (iconModule as any).design?.hover_effect;
                const hoverEffectClass = this.getHoverEffectClass(module);

                return html`
                  <div
                    class="icon-item-preview ${hoverEffectClass}"
                    role=${ifDefined(hasActionableGestures ? 'button' : undefined)}
                    tabindex=${ifDefined(hasActionableGestures ? '0' : undefined)}
                    aria-label=${ifDefined(hasActionableGestures ? iconAriaLabel : undefined)}
                    style=${this.styleObjectToCss({
                      ...containerStyles,
                      // Flex gap works for every icon position; name/state spacing is
                      // handled inside the text block.
                      gap: shouldShowName
                        ? `${icon.name_icon_gap ?? 8}px`
                        : shouldShowState
                          ? `${icon.icon_state_gap ?? 4}px`
                          : '0px',
                      touchAction: 'manipulation', // Improve touch responsiveness
                      backgroundImage: this.getBackgroundImageCSS(icon, hass, config),
                      backgroundSize: (icon as any).background_size || 'cover',
                      backgroundPosition: designProperties.background_position || 'center',
                      backgroundRepeat: designProperties.background_repeat || 'no-repeat',
                      margin: itemLayout.margin,
                    })}
                    @keydown=${hasActionableGestures ? onIconKeyDown : undefined}
                    @pointerdown=${handleGestures.onPointerDown}
                    @pointermove=${handleGestures.onPointerMove}
                    @pointerup=${handleGestures.onPointerUp}
                    @pointerleave=${handleGestures.onPointerLeave}
                    @pointercancel=${handleGestures.onPointerCancel}
                  >
                    ${shouldShowIcon
                      ? html`
                          <div
                            style="${this.styleObjectToCss({
                              ...mergedWrapperStyle,
                              flexShrink: '0',
                            })}"
                          >
                            ${this._shouldUseEntityPicture(entityState, icon)
                              ? html`
                                  <img
                                    src="${this._getEntityPicture(entityState, hass)}"
                                    class="${animationClass} ultra-force-animation entity-picture"
                                    style="
                                    width: ${Number(
                                      isActive
                                        ? icon.active_icon_size || icon.icon_size
                                        : icon.inactive_icon_size || icon.icon_size
                                    ) || 26}px;
                                    height: ${Number(
                                      isActive
                                        ? icon.active_icon_size || icon.icon_size
                                        : icon.inactive_icon_size || icon.icon_size
                                    ) || 26}px;
                                    border-radius: 50%;
                                    object-fit: cover;
                                    ${animationClass && animationClass !== 'none'
                                      ? `animation: ${this._getInlineAnimation(animationClass)} !important;`
                                      : ''}
                                  "
                                    data-animation-debug="${animationClass || 'none'}"
                                    data-is-active="${isActive}"
                                    alt="Entity picture"
                                  />
                                `
                              : html`
                                  <ha-icon
                                    icon="${displayIcon || 'mdi:help-circle'}"
                                    class="${animationClass} ultra-force-animation"
                                    style="
                                    color: ${displayColor || 'var(--secondary-text-color)'};
                                    --mdc-icon-size: ${Number(
                                      isActive
                                        ? icon.active_icon_size || icon.icon_size
                                        : icon.inactive_icon_size || icon.icon_size
                                    ) || 26}px;
                                    ${animationClass && animationClass !== 'none'
                                      ? `animation: ${this._getInlineAnimation(animationClass)} !important;`
                                      : ''}
                                  "
                                    data-animation-debug="${animationClass || 'none'}"
                                    data-is-active="${isActive}"
                                  ></ha-icon>
                                `}
                          </div>
                        `
                      : ''}
                    ${shouldShowName || shouldShowState
                      ? html`
                          <div
                            class="icon-text"
                            style="display: flex; flex-direction: column; min-width: 0; align-items: ${itemLayout.textAlignItems}; text-align: ${itemLayout.textAlign};"
                          >
                            ${shouldShowName
                              ? html`
                                  <div
                                    class="icon-name"
                                    style="
                            font-size: ${globalTextStyles.fontSize
                                      ? globalTextStyles.fontSize
                                      : `${
                                          isActive
                                            ? icon.active_text_size || icon.text_size || 12
                                            : icon.inactive_text_size || icon.text_size || 14
                                        }px`};
                              color: ${nameColor || 'var(--primary-text-color)'};
                            text-align: ${globalTextStyles.textAlign || itemLayout.textAlign};
                            line-height: ${globalTextStyles.lineHeight || '1.2'};
                              max-width: 120px;
                            word-wrap: break-word;
                            margin-bottom: ${shouldShowState
                                      ? `${icon.name_state_gap ?? 2}px`
                                      : '0px'};
                            font-family: ${globalTextStyles.fontFamily || 'inherit'};
                            font-weight: ${globalTextStyles.fontWeight || 'inherit'};
                            font-style: ${globalTextStyles.fontStyle || 'inherit'};
                            text-transform: ${globalTextStyles.textTransform || 'inherit'};
                            letter-spacing: ${globalTextStyles.letterSpacing || 'inherit'};
                            text-shadow: ${globalTextStyles.textShadow || 'none'};
                          "
                                  >
                                    ${displayName}
                                  </div>
                                `
                              : ''}
                            ${shouldShowState
                              ? html`
                                  <div
                                    class="icon-state"
                                    style="
                            font-size: ${globalTextStyles.fontSize
                                      ? globalTextStyles.fontSize
                                      : `${
                                          isActive
                                            ? icon.active_state_size || icon.state_size || 12
                                            : icon.inactive_state_size || icon.state_size || 12
                                        }px`};
                              color: ${stateColor || 'var(--secondary-text-color)'};
                            text-align: ${globalTextStyles.textAlign || itemLayout.textAlign};
                            line-height: ${globalTextStyles.lineHeight || '1.2'};
                            font-family: ${globalTextStyles.fontFamily || 'inherit'};
                            font-weight: ${globalTextStyles.fontWeight || 'inherit'};
                            font-style: ${globalTextStyles.fontStyle || 'inherit'};
                            text-transform: ${globalTextStyles.textTransform || 'inherit'};
                            letter-spacing: ${globalTextStyles.letterSpacing || 'inherit'};
                            text-shadow: ${globalTextStyles.textShadow || 'none'};
                          "
                                  >
                                    ${displayState}
                                  </div>
                                `
                              : ''}
                          </div>
                        `
                      : ''}
                  </div>
                `;
              })}
            </div>
          </div>
        </div>
      `,
      module,
      hass
    );
  }

  // Split preview method for child module settings popup only
  renderSplitPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
    const iconModule = module as IconModule;

    // Determine current state of the first icon to show which preview is "current"
    let isCurrentlyActive = false;
    if (iconModule.icons.length > 0) {
      const firstIcon = iconModule.icons[0];

      // Use the same evaluation logic as the main preview
      isCurrentlyActive = this._evaluateIconState(firstIcon, hass);
    }

    // Ensure global styles are available
    this._injectGlobalStyles();
    // Ensure keyframes exist inside ha-icon shadow roots used in popup
    this._injectKeyframesForAllSplitPreviewIcons();

    return html`
      <style>
        ${UltraIconModule._ANIMATION_KEYFRAMES} .icon-split-preview {
          --animation-duration: 2s;
          --animation-timing: linear;
        }
        .icon-split-preview .icon-animation-spin {
          animation: iconSpin var(--animation-duration) var(--animation-timing) infinite;
        }
        .icon-split-preview .icon-animation-bounce {
          animation: iconBounce 1s ease-in-out infinite;
        }
        .icon-split-preview .icon-animation-pulse {
          animation: iconPulse 1.5s ease-in-out infinite;
        }
        .icon-split-preview .icon-animation-flash {
          animation: iconFlash 1s ease-in-out infinite;
        }
        .icon-split-preview .icon-animation-shake {
          animation: iconShake 0.5s ease-in-out infinite;
        }
        .icon-split-preview .icon-animation-vibrate {
          animation: iconVibrate 0.3s ease-in-out infinite;
        }
        .icon-split-preview .icon-animation-rotate-left {
          animation: iconRotateLeft var(--animation-duration) var(--animation-timing) infinite;
        }
        .icon-split-preview .icon-animation-rotate-right {
          animation: iconRotateRight var(--animation-duration) var(--animation-timing) infinite;
        }
        .icon-split-preview .icon-animation-fade {
          animation: iconFade 2s ease-in-out infinite;
        }
        .icon-split-preview .icon-animation-scale {
          animation: iconScale 1.5s ease-in-out infinite;
        }
        .icon-split-preview .icon-animation-tada {
          animation: iconTada 2s ease-in-out infinite;
        }
      </style>
      <div class="icon-split-preview">
        <!-- State Labels -->
        <div
          style="
               display: grid; 
               grid-template-columns: 1fr 1fr; 
               margin-bottom: 12px;
               text-align: center;
             "
        >
          <div>
            ${!isCurrentlyActive
              ? html`<div
                  style="font-size: 10px; font-weight: 700; color: var(--primary-color); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;"
                >
                  Current
                </div>`
              : html`<div style="height: 14px; margin-bottom: 4px;"></div>`}
            <div style="font-size: 12px; font-weight: 600; color: var(--secondary-text-color);">
              Inactive State
            </div>
          </div>
          <div>
            ${isCurrentlyActive
              ? html`<div
                  style="font-size: 10px; font-weight: 700; color: var(--primary-color); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;"
                >
                  Current
                </div>`
              : html`<div style="height: 14px; margin-bottom: 4px;"></div>`}
            <div style="font-size: 12px; font-weight: 600; color: var(--secondary-text-color);">
              Active State
            </div>
          </div>
        </div>

        <!-- Split Preview Container -->
        <div
          style="
               display: grid; 
               grid-template-columns: 1fr 1fr; 
               border: 1px solid var(--divider-color); 
               border-radius: var(--uc-r-8, 8px); 
               overflow: hidden;
               min-height: 120px;
             "
        >
          <!-- Inactive Preview -->
          <div
            style="
                 background: var(--uc-pane-bg, var(--card-background-color));
                 border-right: 1px solid var(--divider-color);
                 padding: 16px;
                 display: flex;
                 align-items: center;
                 justify-content: center;
               "
          >
            ${this._renderSimpleIconGrid(iconModule, hass, false)}
          </div>

          <!-- Active Preview -->
          <div
            style="
                 background: var(--uc-pane-bg, var(--card-background-color));
                 padding: 16px;
                 display: flex;
                 align-items: center;
                 justify-content: center;
               "
          >
            ${this._renderSimpleIconGrid(iconModule, hass, true)}
          </div>
        </div>

        <!-- Icon Count Indicator -->
        ${iconModule.icons.length > 6
          ? html`
              <div
                style="
                 text-align: center;
                 padding: 8px;
                 color: var(--secondary-text-color);
                 font-size: 12px;
                 font-style: italic;
               "
              >
                Showing first 6 of ${iconModule.icons.length} icons
              </div>
            `
          : ''}
      </div>
    `;
  }

  private _renderSimpleIconGrid(
    iconModule: IconModule,
    hass: HomeAssistant,
    isActiveState: boolean
  ): TemplateResult {
    const iconsToShow = iconModule.icons.slice(0, 6);
    const gridCols = Math.min(3, iconsToShow.length);

    // Get design properties ONLY from the design object (Design tab)
    // This ensures Design tab always takes precedence over General tab
    const designFromDesignObject = (iconModule as any).design || {};
    const designProperties = {
      color: designFromDesignObject.color,
      font_size: designFromDesignObject.font_size,
      font_weight: designFromDesignObject.font_weight,
      font_style: designFromDesignObject.font_style,
      text_transform: designFromDesignObject.text_transform,
      font_family: designFromDesignObject.font_family,
      line_height: designFromDesignObject.line_height,
      letter_spacing: designFromDesignObject.letter_spacing,
      text_align: designFromDesignObject.text_align,
      text_shadow_h: designFromDesignObject.text_shadow_h,
      text_shadow_v: designFromDesignObject.text_shadow_v,
      text_shadow_blur: designFromDesignObject.text_shadow_blur,
      text_shadow_color: designFromDesignObject.text_shadow_color,
      background_position: designFromDesignObject.background_position,
      background_repeat: designFromDesignObject.background_repeat,
      hover_effect: designFromDesignObject.hover_effect,
    };

    return html`
      <div
        style="
          display: flex;
        "
      >
        ${iconsToShow.map((icon, iconIdx) =>
          this._renderSingleIconPreview(
            icon,
            hass,
            isActiveState,
            iconModule,
            designProperties,
            undefined,
            iconIdx
          )
        )}
      </div>
    `;
  }

  private _renderSingleIconPreview(
    icon: IconConfig,
    hass: HomeAssistant,
    isActiveState: boolean,
    iconModule?: IconModule,
    designProperties?: any,
    cardConfig?: UltraCardConfig,
    iconIndex?: number
  ): TemplateResult {
    const resolvedPreviewEntity = this.resolveEntity(icon.entity, cardConfig) || icon.entity;
    const entityState = resolvedPreviewEntity ? hass?.states[resolvedPreviewEntity] : undefined;
    const currentState = entityState?.state || 'unknown';

    // Store template results in local variables (icons may be read-only)
    let templateContainerBgColor: string | undefined;

    // Use exact same logic as main card - determine what to show based on state
    const shouldShowIcon = isActiveState
      ? icon.show_icon_when_active !== false
      : icon.show_icon_when_inactive !== false;
    const shouldShowName = isActiveState
      ? icon.show_name_when_active !== false
      : icon.show_name_when_inactive !== false;
    const shouldShowState = isActiveState
      ? icon.show_state_when_active !== false
      : icon.show_state_when_inactive !== false;

    // Get display values based on state - priority cascade for templates
    let displayIcon = isActiveState ? icon.icon_active || icon.icon_inactive : icon.icon_inactive;
    let displayColor = isActiveState
      ? icon.use_state_color_for_active_icon
        ? this._getEntityStateColor(entityState) || icon.active_icon_color
        : icon.use_entity_color_for_icon
          ? entityState?.attributes?.rgb_color
            ? `rgb(${entityState.attributes.rgb_color.join(',')})`
            : icon.active_icon_color
          : icon.active_icon_color
      : icon.use_state_color_for_inactive_icon
        ? this._getEntityStateColor(entityState) || icon.inactive_icon_color
        : icon.use_entity_color_for_icon
          ? entityState?.attributes?.rgb_color
            ? `rgb(${entityState.attributes.rgb_color.join(',')})`
            : icon.inactive_icon_color
          : icon.inactive_icon_color;

    let tmplName: string | undefined;
    let tmplStateText: string | undefined;
    let tmplNameColor: string | undefined;
    let tmplStateColor: string | undefined;

    // PRIORITY 1: Unified template (if enabled)
    if (icon.unified_template_mode && icon.unified_template) {
      if (!this._templateService && hass) {
        this._templateService = new TemplateService(hass);
      } else if (this._templateService && hass) {
        // CRITICAL: Keep hass reference current so template results land on the
        // same object the renderer reads from (prevents stale color in editor preview).
        this._templateService.updateHass(hass);
      }

      // For the inactive editor preview, simulate the "inactive state" value so the
      // template evaluates as it would when the entity is actually in its inactive state.
      // Without this, both previews evaluate with the real entity state, causing the
      // inactive preview to show the same icon/color as the active preview even when
      // the entity has different active vs inactive values (e.g. inactive_attribute: min).
      let previewStateOverride: string | null = null;
      if (!isActiveState && entityState) {
        if (
          icon.inactive_attribute &&
          entityState.attributes?.[icon.inactive_attribute] !== undefined
        ) {
          previewStateOverride = String(entityState.attributes[icon.inactive_attribute]);
        } else if (icon.inactive_state && icon.inactive_state.trim() !== '') {
          previewStateOverride = icon.inactive_state;
        }
      }

      // For live rendering, inject entity context into the template so HA auto-tracks
      // the entity and re-evaluates on state change.  For the inactive editor preview,
      // we skip injection and instead pass a literal state override via `variables`
      // (so the preview displays the "inactive state" styling regardless of live state).
      const processedUnifiedTemplate = preprocessTemplateVariables(
        icon.unified_template,
        hass,
        cardConfig
      );

      const templateKeySuffix = previewStateOverride !== null ? `_inactive_preview` : '';
      const templateKey = this._buildUnifiedIconTemplateKey(
        icon,
        processedUnifiedTemplate,
        cardConfig,
        iconModule?.id,
        iconIndex,
        templateKeySuffix
      );

      if (!hass.__uvc_template_strings) {
        hass.__uvc_template_strings = {};
      }

      if (this._templateService) {
        const baseContext = this._getEntityContext(icon, hass, cardConfig);
        const context =
          previewStateOverride !== null
            ? {
                ...baseContext,
                state: previewStateOverride,
                state_number: parseLocaleNumber(previewStateOverride),
              }
            : baseContext;
        const entitySig =
          previewStateOverride !== null
            ? `${icon.entity}|inactive_preview=${previewStateOverride}`
            : computeEntitySignature(icon.entity, hass);
        this._templateService.subscribeToTemplate(
          processedUnifiedTemplate,
          templateKey,
          () => {
            this.triggerPreviewUpdate();
          },
          context,
          cardConfig,
          entitySig
        );
      }

      const unifiedResult = hass?.__uvc_template_strings?.[templateKey];
      let appliedSplitPreviewColor = false;
      if (unifiedResult && String(unifiedResult).trim() !== '') {
        const parsed = parseUnifiedTemplate(unifiedResult);
        if (!hasTemplateError(parsed)) {
          const uIcon = unifiedTemplateIcon(parsed);
          if (uIcon) displayIcon = uIcon;
          if (parsed.icon_color) {
            displayColor = parsed.icon_color;
            this._lastUnifiedIconDisplayColorByKey.set(templateKey, parsed.icon_color);
            appliedSplitPreviewColor = true;
          }
          if (parsed.name) tmplName = String(parsed.name);
          if (parsed.state_text !== undefined) {
            tmplStateText = String(parsed.state_text);
          } else if (parsed._isString && parsed.content && !uIcon) {
            tmplStateText = String(parsed.content).trim();
          }
          if (parsed.name_color) tmplNameColor = String(parsed.name_color);
          if (parsed.state_color) tmplStateColor = String(parsed.state_color);
          if (parsed.container_background_color) {
            templateContainerBgColor = parsed.container_background_color;
          }
        }
      }
      if (!appliedSplitPreviewColor) {
        const heldSplit = this._lastUnifiedIconDisplayColorByKey.get(templateKey);
        if (heldSplit) displayColor = heldSplit;
      }
    } else if (entityState?.attributes?.icon && !displayIcon) {
      displayIcon = entityState.attributes.icon;
    }

    const nameColor =
      tmplNameColor ||
      designProperties?.color ||
      (isActiveState ? icon.active_name_color : icon.inactive_name_color);
    const stateColor =
      tmplStateColor ||
      designProperties?.color ||
      (isActiveState ? icon.active_state_color : icon.inactive_state_color);

    // Apply Global Design text formatting properties (same as main renderPreview)
    const globalTextStyles = designProperties
      ? {
          fontSize: designProperties.font_size
            ? /[a-zA-Z%]/.test(designProperties.font_size)
              ? designProperties.font_size
              : this.addPixelUnit(designProperties.font_size) || designProperties.font_size
            : undefined,
          fontFamily: designProperties.font_family || undefined,
          fontWeight: designProperties.font_weight || undefined,
          fontStyle: designProperties.font_style || undefined,
          textTransform: designProperties.text_transform || undefined,
          lineHeight: designProperties.line_height || undefined,
          letterSpacing: designProperties.letter_spacing || undefined,
          textAlign: designProperties.text_align || undefined,
          textShadow:
            designProperties.text_shadow_h && designProperties.text_shadow_v
              ? `${designProperties.text_shadow_h || '0'} ${designProperties.text_shadow_v || '0'} ${designProperties.text_shadow_blur || '0'} ${designProperties.text_shadow_color || 'rgba(0,0,0,0.5)'}`
              : undefined,
        }
      : {
          fontSize: undefined,
          fontFamily: undefined,
          fontWeight: undefined,
          fontStyle: undefined,
          textTransform: undefined,
          lineHeight: undefined,
          letterSpacing: undefined,
          textAlign: undefined,
          textShadow: undefined,
        };

    const displayName =
      tmplName ||
      (isActiveState
        ? icon.custom_active_name_text ||
          icon.name ||
          entityState?.attributes?.friendly_name ||
          icon.entity
        : icon.custom_inactive_name_text ||
          icon.name ||
          entityState?.attributes?.friendly_name ||
          icon.entity);

    let displayState: string;

    if (tmplStateText !== undefined) {
      displayState = tmplStateText;
    } else {
      displayState = this._getDisplayStateValue(icon, hass, isActiveState, cardConfig);
    }

    // Icon background styles - use active/inactive specific properties
    const iconBackground = isActiveState
      ? icon.active_icon_background || icon.icon_background
      : icon.inactive_icon_background || icon.icon_background;

    const iconBackgroundColor = isActiveState
      ? icon.active_icon_background_color || icon.icon_background_color
      : icon.inactive_icon_background_color || icon.icon_background_color;

    const iconBackgroundPadding = isActiveState
      ? (icon.active_icon_background_padding ?? icon.icon_background_padding ?? 8)
      : (icon.inactive_icon_background_padding ?? icon.icon_background_padding ?? 8);

    const iconBackgroundStyle = (() => {
      if (iconBackground === 'none') {
        return {};
      }

      const computedColor = icon.use_entity_color_for_icon_background
        ? entityState?.attributes?.rgb_color
          ? `rgb(${entityState.attributes.rgb_color.join(',')})`
          : iconBackgroundColor
        : iconBackgroundColor;

      const { styles: backgroundStyles } = computeBackgroundStyles({
        color: computedColor,
        fallback: iconBackgroundColor || 'transparent',
      });

      return {
        ...backgroundStyles,
        borderRadius:
          iconBackground === 'circle' ? '50%' : iconBackground === 'rounded-square' ? '8px' : '0',
        padding: `${iconBackgroundPadding}px`,
      };
    })();

    // Always ensure wrapper centers content for animations
    const baseWrapperStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    const mergedWrapperStyle = { ...baseWrapperStyle, ...iconBackgroundStyle };

    // Animation classes
    const activeAnimation = icon.active_icon_animation || 'none';
    const inactiveAnimation = icon.inactive_icon_animation || 'none';
    const currentAnimation = isActiveState ? activeAnimation : inactiveAnimation;
    const animationClass = currentAnimation !== 'none' ? `icon-animation-${currentAnimation}` : '';

    // Container styles - exact same as main card
    const itemLayout = this._getIconItemLayout(iconModule, icon);
    const containerStyles: Record<string, string> = {
      display: 'flex',
      flexDirection: itemLayout.flexDirection,
      alignItems: itemLayout.alignItems,
      justifyContent: itemLayout.justifyContent,
      // Apply padding from design properties if set, otherwise use 0
      padding:
        designProperties?.padding_top ||
        designProperties?.padding_bottom ||
        designProperties?.padding_left ||
        designProperties?.padding_right
          ? `${this.addPixelUnit(designProperties.padding_top) || '0px'} ${this.addPixelUnit(designProperties.padding_right) || '0px'} ${this.addPixelUnit(designProperties.padding_bottom) || '0px'} ${this.addPixelUnit(designProperties.padding_left) || '0px'}`
          : '0',
      borderRadius: designProperties?.border_radius
        ? this.addPixelUnit(designProperties.border_radius) || '0'
        : icon.container_background_shape === 'circle'
          ? '50%'
          : icon.container_background_shape === 'rounded'
            ? '8px'
            : icon.container_background_shape === 'square'
              ? '0'
              : '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      width: icon.container_width ? `${icon.container_width}%` : 'auto',
      margin: itemLayout.margin,
    };

    const hasContainerBackground =
      icon.container_background_shape && icon.container_background_shape !== 'none';

    if (hasContainerBackground) {
      // Priority: template result > configured container_background_color > default
      const containerBgColor =
        templateContainerBgColor || icon.container_background_color || '#808080';
      const { styles: backgroundStyles } = computeBackgroundStyles({
        color: containerBgColor,
        fallback: containerBgColor,
        image: this.getBackgroundImageCSS(icon, hass, cardConfig),
        imageSize: (icon as any).background_size || 'cover',
        imagePosition: icon.background_position || 'center',
        imageRepeat: icon.background_repeat || 'no-repeat',
      });
      Object.assign(containerStyles, backgroundStyles);
    } else {
      // Even if container_background_shape is 'none', check for template background color
      if (templateContainerBgColor) {
        containerStyles.backgroundColor = templateContainerBgColor;
        containerStyles.background = templateContainerBgColor;
        // Apply border-radius from design properties when template background is used
        if (designProperties?.border_radius) {
          containerStyles.borderRadius = this.addPixelUnit(designProperties.border_radius) || '0';
        }
      } else {
        containerStyles.background = 'transparent';
        containerStyles.backgroundColor = 'transparent';
      }
    }

    // Use actual spacing values for true-to-life preview
    const actualNameIconGap = icon.name_icon_gap ?? 8;
    const actualNameStateGap = icon.name_state_gap ?? 2;
    const actualIconStateGap = icon.icon_state_gap ?? 4;

    // Get hover effect configuration from module design (if provided)
    const hoverEffect = iconModule ? (iconModule as any).design?.hover_effect : undefined;
    const hoverEffectClass = this.getHoverEffectClass(iconModule as any);

    return html`
      <div
        class="icon-item-preview ${hoverEffectClass}"
        style=${this.styleObjectToCss({
          ...containerStyles,
          gap: shouldShowName
            ? `${actualNameIconGap}px`
            : shouldShowState
              ? `${actualIconStateGap}px`
              : '0px',
        })}
        @click=${(e: Event) => {
          e.preventDefault();
          if (!iconModule) return;
          // Handle undefined actions with smart defaults
          if (!iconModule.tap_action || iconModule.tap_action.action !== 'nothing') {
            const action = iconModule.tap_action || {
              action: 'default',
              entity: resolvedPreviewEntity || icon.entity,
            };
            UltraLinkComponent.handleAction(
              action as any,
              hass,
              e.target as HTMLElement,
              cardConfig,
              resolvedPreviewEntity || icon.entity,
              iconModule
            );
          }
        }}
      >
        ${shouldShowIcon
          ? html`
              <div
                style="${this.styleObjectToCss({
                  ...mergedWrapperStyle,
                  flexShrink: '0',
                })}"
              >
                ${this._shouldUseEntityPicture(entityState, icon)
                  ? html`
                      <img
                        src="${this._getEntityPicture(entityState, hass)}"
                        class="${animationClass} ultra-force-animation entity-picture"
                        style="
                          width: ${Number(
                          isActiveState
                            ? icon.active_icon_size || icon.icon_size
                            : icon.inactive_icon_size || icon.icon_size
                        ) || 26}px;
                          height: ${Number(
                          isActiveState
                            ? icon.active_icon_size || icon.icon_size
                            : icon.inactive_icon_size || icon.icon_size
                        ) || 26}px;
                          border-radius: 50%;
                          object-fit: cover;
                          ${animationClass && animationClass !== 'none'
                          ? `animation: ${this._getInlineAnimation(animationClass)} !important;`
                          : ''}
                        "
                        data-animation-debug="${animationClass || 'none'}"
                        data-is-active="${isActiveState}"
                        alt="Entity picture"
                      />
                    `
                  : html`
                      <ha-icon
                        icon="${displayIcon || 'mdi:help-circle'}"
                        class="${animationClass} ultra-force-animation"
                        style="
                          color: ${displayColor || 'var(--secondary-text-color)'};
                          --mdc-icon-size: ${(() => {
                          // Priority: 1) Icon state-specific size, 2) Icon default size, 3) Module icon_size, 4) Fallback
                          const iconSpecificSize = Number(
                            isActiveState
                              ? icon.active_icon_size || icon.icon_size
                              : icon.inactive_icon_size || icon.icon_size
                          );
                          if (iconSpecificSize) {
                            return `${iconSpecificSize}px`;
                          }
                          // Use module-level icon_size if set
                          if (iconModule?.icon_size) {
                            return `${iconModule.icon_size}px`;
                          }
                          return '26px';
                        })()};
                          ${animationClass && animationClass !== 'none'
                          ? `animation: ${this._getInlineAnimation(animationClass)} !important;`
                          : ''}
                        "
                        data-animation-debug="${animationClass || 'none'}"
                        data-is-active="${isActiveState}"
                      ></ha-icon>
                    `}
              </div>
            `
          : ''}
        ${shouldShowName || shouldShowState
          ? html`
              <div
                class="icon-text"
                style="display: flex; flex-direction: column; min-width: 0; align-items: ${itemLayout.textAlignItems}; text-align: ${itemLayout.textAlign};"
              >
                ${shouldShowName
                  ? html`
                      <div
                        class="icon-name"
                        style="
                        font-size: ${(() => {
                          // Priority: 1) Design tab font_size, 2) Icon-specific sizes, 3) Module text_size, 4) Default
                          if (globalTextStyles.fontSize) {
                            return globalTextStyles.fontSize;
                          }
                          const iconTextSize = isActiveState
                            ? icon.active_text_size || icon.text_size
                            : icon.inactive_text_size || icon.text_size;
                          if (iconTextSize) {
                            return `${iconTextSize}px`;
                          }
                          if (iconModule?.text_size) {
                            return `${iconModule.text_size}px`;
                          }
                          return isActiveState ? '12px' : '14px';
                        })()};
                        color: ${nameColor || 'var(--primary-text-color)'};
                        text-align: ${globalTextStyles.textAlign || itemLayout.textAlign};
                        line-height: ${globalTextStyles.lineHeight || '1.2'};
                        max-width: 120px;
                        word-wrap: break-word;
                        margin-bottom: ${shouldShowState ? `${actualNameStateGap}px` : '0px'};
                        font-family: ${globalTextStyles.fontFamily || 'inherit'};
                        font-weight: ${globalTextStyles.fontWeight || 'inherit'};
                        font-style: ${globalTextStyles.fontStyle || 'inherit'};
                        text-transform: ${globalTextStyles.textTransform || 'inherit'};
                        letter-spacing: ${globalTextStyles.letterSpacing || 'inherit'};
                        text-shadow: ${globalTextStyles.textShadow || 'none'};
                      "
                      >
                        ${displayName}
                      </div>
                    `
                  : ''}
                ${shouldShowState
                  ? html`
                      <div
                        class="icon-state"
                        style="
                        font-size: ${(() => {
                          // Priority: 1) Design tab font_size, 2) Icon-specific sizes, 3) Module text_size, 4) Default
                          if (globalTextStyles.fontSize) {
                            return globalTextStyles.fontSize;
                          }
                          const iconStateSize = isActiveState
                            ? icon.active_state_size || icon.state_size
                            : icon.inactive_state_size || icon.state_size;
                          if (iconStateSize) {
                            return `${iconStateSize}px`;
                          }
                          if (iconModule?.text_size) {
                            return `${iconModule.text_size}px`;
                          }
                          return '10px';
                        })()};
                        color: ${stateColor || 'var(--secondary-text-color)'};
                        text-align: ${globalTextStyles.textAlign || itemLayout.textAlign};
                        line-height: ${globalTextStyles.lineHeight || '1.2'};
                        font-family: ${globalTextStyles.fontFamily || 'inherit'};
                        font-weight: ${globalTextStyles.fontWeight || 'inherit'};
                        font-style: ${globalTextStyles.fontStyle || 'inherit'};
                        text-transform: ${globalTextStyles.textTransform || 'inherit'};
                        letter-spacing: ${globalTextStyles.letterSpacing || 'inherit'};
                        text-shadow: ${globalTextStyles.textShadow || 'none'};
                      "
                      >
                        ${displayState}
                      </div>
                    `
                  : ''}
              </div>
            `
          : ''}
      </div>
    `;
  }

  private renderIconGrid(
    iconModule: IconModule,
    hass: HomeAssistant,
    forceActive: boolean,
    syncAnimationClasses: boolean = true
  ): TemplateResult {
    // Get hover effect configuration from module design
    const hoverEffect = (iconModule as any).design?.hover_effect;
    const hoverEffectClass = this.getHoverEffectClass(iconModule as any);

    // Get design properties ONLY from the design object (Design tab)
    // This ensures Design tab always takes precedence over General tab
    const designFromDesignObject = (iconModule as any).design || {};
    const designProperties = {
      color: designFromDesignObject.color,
      font_size: designFromDesignObject.font_size,
      font_weight: designFromDesignObject.font_weight,
      font_style: designFromDesignObject.font_style,
      text_transform: designFromDesignObject.text_transform,
      font_family: designFromDesignObject.font_family,
      line_height: designFromDesignObject.line_height,
      letter_spacing: designFromDesignObject.letter_spacing,
      text_align: designFromDesignObject.text_align,
      text_shadow_h: designFromDesignObject.text_shadow_h,
      text_shadow_v: designFromDesignObject.text_shadow_v,
      text_shadow_blur: designFromDesignObject.text_shadow_blur,
      text_shadow_color: designFromDesignObject.text_shadow_color,
      background_position: designFromDesignObject.background_position,
      background_repeat: designFromDesignObject.background_repeat,
      hover_effect: designFromDesignObject.hover_effect,
    };

    return html`
      <div
        class="icon-grid"
        style="
          display: grid;
          grid-template-columns: repeat(${Math.min(
          Math.max(1, Math.floor((iconModule.columns || 3) / 2)),
          iconModule.icons.length
        )}, 1fr);
          grid-auto-flow: ${iconModule.allow_wrap === false ? 'column' : 'row'};
          gap: ${iconModule.gap || 16}px;
          justify-content: ${iconModule.alignment || 'center'};
        "
      >
        ${iconModule.icons.slice(0, 6).map((icon, previewIndex) => {
          const entityState = hass?.states[icon.entity];
          const currentState = entityState?.state || 'unknown';
          // Force the active state based on the forceActive parameter
          const isActive = forceActive;

          // Store template results in local variables (icons may be read-only)
          let templateContainerBgColor: string | undefined;
          let tmplIcon: string | undefined;
          let tmplIconColor: string | undefined;
          let tmplName: string | undefined;
          let tmplStateText: string | undefined;
          let tmplNameColor: string | undefined;
          let tmplStateColor: string | undefined;

          // PRIORITY 1: Evaluate unified template if enabled (needed for container_background_color)
          if (icon.unified_template_mode && icon.unified_template) {
            if (!this._templateService && hass) {
              this._templateService = new TemplateService(hass);
            } else if (this._templateService && hass) {
              this._templateService.updateHass(hass);
            }

            const processedUnifiedTemplate = preprocessTemplateVariables(
              icon.unified_template,
              hass,
              undefined
            );
            const templateKey = this._buildUnifiedIconTemplateKey(
              icon,
              processedUnifiedTemplate,
              undefined,
              iconModule.id,
              previewIndex
            );

            if (!hass.__uvc_template_strings) {
              hass.__uvc_template_strings = {};
            }

            if (this._templateService) {
              const context = this._getEntityContext(icon, hass);
              const entitySig = computeEntitySignature(icon.entity, hass);
              this._templateService.subscribeToTemplate(
                processedUnifiedTemplate,
                templateKey,
                () => {
                  this.triggerPreviewUpdate();
                },
                context,
                undefined,
                entitySig
              );
            }

            const unifiedResult = hass?.__uvc_template_strings?.[templateKey];
            let appliedGridTplColor = false;
            if (unifiedResult && String(unifiedResult).trim() !== '') {
              const parsed = parseUnifiedTemplate(unifiedResult);
              if (!hasTemplateError(parsed)) {
                const uIcon = unifiedTemplateIcon(parsed);
                if (uIcon) tmplIcon = uIcon;
                else if (parsed.icon) tmplIcon = String(parsed.icon);
                if (parsed.icon_color) {
                  tmplIconColor = String(parsed.icon_color);
                  this._lastUnifiedIconDisplayColorByKey.set(templateKey, tmplIconColor);
                  appliedGridTplColor = true;
                }
                if (parsed.name) tmplName = String(parsed.name);
                if (parsed.state_text !== undefined) tmplStateText = String(parsed.state_text);
                if (parsed.name_color) tmplNameColor = String(parsed.name_color);
                if (parsed.state_color) tmplStateColor = String(parsed.state_color);
                if (parsed.container_background_color) {
                  templateContainerBgColor = parsed.container_background_color;
                }
              }
            }
            if (!appliedGridTplColor) {
              const heldGrid = this._lastUnifiedIconDisplayColorByKey.get(templateKey);
              if (heldGrid) tmplIconColor = heldGrid;
            }
          }

          // Determine what to show based on forced state
          const shouldShowIcon = isActive
            ? icon.show_icon_when_active !== false
            : icon.show_icon_when_inactive !== false;
          const shouldShowName = isActive
            ? icon.show_name_when_active !== false
            : icon.show_name_when_inactive !== false;
          const shouldShowState = isActive
            ? icon.show_state_when_active !== false
            : icon.show_state_when_inactive !== false;

          // Get display values based on forced state
          let displayIcon = isActive ? icon.icon_active || icon.icon_inactive : icon.icon_inactive;

          // Use entity's current icon if no custom icon is set (for dynamic weather icons, etc.)
          if (entityState?.attributes?.icon && !displayIcon) {
            displayIcon = entityState.attributes.icon;
          }

          let displayColor = isActive
            ? icon.use_state_color_for_active_icon
              ? this._getEntityStateColor(entityState) || icon.active_icon_color
              : icon.use_entity_color_for_icon
                ? entityState?.attributes?.rgb_color
                  ? `rgb(${entityState.attributes.rgb_color.join(',')})`
                  : icon.active_icon_color
                : icon.active_icon_color
            : icon.use_state_color_for_inactive_icon
              ? this._getEntityStateColor(entityState) || icon.inactive_icon_color
              : icon.use_entity_color_for_icon
                ? entityState?.attributes?.rgb_color
                  ? `rgb(${entityState.attributes.rgb_color.join(',')})`
                  : icon.inactive_icon_color
                : icon.inactive_icon_color;

          if (tmplIcon) displayIcon = tmplIcon;
          if (tmplIconColor) displayColor = tmplIconColor;

          const nameColor =
            tmplNameColor ||
            designProperties.color ||
            (isActive ? icon.active_name_color : icon.inactive_name_color);
          const stateColor =
            tmplStateColor ||
            designProperties.color ||
            (isActive ? icon.active_state_color : icon.inactive_state_color);

          // Apply Global Design text formatting properties
          const globalTextStyles = {
            fontSize: designProperties.font_size
              ? /[a-zA-Z%]/.test(designProperties.font_size)
                ? designProperties.font_size
                : this.addPixelUnit(designProperties.font_size) || designProperties.font_size
              : undefined,
            fontFamily: designProperties.font_family || undefined,
            fontWeight: designProperties.font_weight || undefined,
            fontStyle: designProperties.font_style || undefined,
            textTransform: designProperties.text_transform || undefined,
            lineHeight: designProperties.line_height || undefined,
            letterSpacing: designProperties.letter_spacing || undefined,
            textAlign: designProperties.text_align || undefined,
            textShadow:
              designProperties.text_shadow_h && designProperties.text_shadow_v
                ? `${designProperties.text_shadow_h || '0'} ${designProperties.text_shadow_v || '0'} ${designProperties.text_shadow_blur || '0'} ${designProperties.text_shadow_color || 'rgba(0,0,0,0.5)'}`
                : undefined,
          };

          const displayName =
            tmplName ||
            (isActive
              ? icon.custom_active_name_text ||
                icon.name ||
                entityState?.attributes?.friendly_name ||
                icon.entity
              : icon.custom_inactive_name_text ||
                icon.name ||
                entityState?.attributes?.friendly_name ||
                icon.entity);

          let displayState: string;

          if (tmplStateText !== undefined) {
            displayState = tmplStateText;
          } else {
            displayState = this._getDisplayStateValue(icon, hass, isActive);
          }

          // Icon background styles - use active/inactive specific properties
          const iconBackground = isActive
            ? icon.active_icon_background || icon.icon_background
            : icon.inactive_icon_background || icon.icon_background;

          const iconBackgroundColor = isActive
            ? icon.active_icon_background_color || icon.icon_background_color
            : icon.inactive_icon_background_color || icon.icon_background_color;

          const iconBackgroundPadding = isActive
            ? (icon.active_icon_background_padding ?? icon.icon_background_padding ?? 8)
            : (icon.inactive_icon_background_padding ?? icon.icon_background_padding ?? 8);

          const iconBackgroundStyle = (() => {
            if (iconBackground === 'none') {
              return {};
            }

            const computedColor = icon.use_entity_color_for_icon_background
              ? entityState?.attributes?.rgb_color
                ? `rgb(${entityState.attributes.rgb_color.join(',')})`
                : iconBackgroundColor
              : iconBackgroundColor;

            const { styles: backgroundStyles } = computeBackgroundStyles({
              color: computedColor,
              fallback: iconBackgroundColor || 'transparent',
            });

            return {
              ...backgroundStyles,
              borderRadius:
                iconBackground === 'circle'
                  ? '50%'
                  : iconBackground === 'rounded-square'
                    ? '8px'
                    : '0',
              padding: `${iconBackgroundPadding}px`,
            };
          })();

          // Always ensure wrapper centers content for animations
          const baseWrapperStyle = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          };

          const mergedWrapperStyle = { ...baseWrapperStyle, ...iconBackgroundStyle };

          // Animation classes
          const activeAnimation = icon.active_icon_animation || 'none';
          const inactiveAnimation = icon.inactive_icon_animation || 'none';

          const currentAnimation = isActive ? activeAnimation : inactiveAnimation;
          const animationClass =
            currentAnimation !== 'none' ? `icon-animation-${currentAnimation}` : '';

          // Force animation class updates when state changes
          if (animationClass && syncAnimationClasses) {
            setTimeout(() => {
              this._updateIconAnimationClasses(icon.entity, animationClass, isActive);
            }, 150);
          }

          // Animation styles are handled by CSS classes

          // Container styles (smaller for split view)
          const containerStyles: Record<string, string> = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: icon.vertical_alignment || 'center',
            padding: '8px',
            borderRadius:
              icon.container_background_shape === 'circle'
                ? '50%'
                : icon.container_background_shape === 'rounded'
                  ? '8px'
                  : icon.container_background_shape === 'square'
                    ? '0'
                    : '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            width: icon.container_width ? `${icon.container_width}%` : 'auto',
            margin: '0 auto',
          };

          const hasContainerBackground =
            icon.container_background_shape && icon.container_background_shape !== 'none';

          if (hasContainerBackground) {
            // Priority: template result > configured container_background_color > default
            const containerBgColor =
              templateContainerBgColor || icon.container_background_color || '#808080';
            const { styles: backgroundStyles } = computeBackgroundStyles({
              color: containerBgColor,
              fallback: containerBgColor,
              image: this.getBackgroundImageCSS(icon, hass),
              imageSize: (icon as any).background_size || 'cover',
              imagePosition: icon.background_position || 'center',
              imageRepeat: icon.background_repeat || 'no-repeat',
            });
            Object.assign(containerStyles, backgroundStyles);
          } else {
            // Even if container_background_shape is 'none', check for template background color
            if (templateContainerBgColor) {
              containerStyles.backgroundColor = templateContainerBgColor;
              containerStyles.background = templateContainerBgColor;
            } else {
              containerStyles.background = 'transparent';
              containerStyles.backgroundColor = 'transparent';
            }
          }

          // Use actual spacing values for true-to-life preview
          const actualNameIconGap = icon.name_icon_gap ?? 8;
          const actualNameStateGap = icon.name_state_gap ?? 2;
          const actualIconStateGap = icon.icon_state_gap ?? 4;

          return html`
            <div
              class="icon-item-preview ${hoverEffectClass}"
              style=${this.styleObjectToCss({
                ...containerStyles,
                gap: '0px',
              })}
            >
              ${shouldShowIcon
                ? html`
                    <div
                      style="${this.styleObjectToCss({
                        ...mergedWrapperStyle,
                        marginBottom: shouldShowName
                          ? `${actualNameIconGap}px`
                          : shouldShowState
                            ? `${actualIconStateGap}px`
                            : '0px',
                      })}"
                    >
                      ${this._shouldUseEntityPicture(entityState, icon)
                        ? html`
                            <img
                              src="${this._getEntityPicture(entityState, hass)}"
                              class="${animationClass} ultra-force-animation entity-picture"
                              style="
                                width: ${Number(
                                isActive
                                  ? icon.active_icon_size || icon.icon_size
                                  : icon.inactive_icon_size || icon.icon_size
                              ) || 26}px;
                                height: ${Number(
                                isActive
                                  ? icon.active_icon_size || icon.icon_size
                                  : icon.inactive_icon_size || icon.icon_size
                              ) || 26}px;
                                border-radius: 50%;
                                object-fit: cover;
                                ${animationClass && animationClass !== 'none'
                                ? `animation: ${this._getInlineAnimation(animationClass)} !important;`
                                : ''}
                              "
                              data-animation-debug="${animationClass || 'none'}"
                              data-is-active="${isActive}"
                              alt="Entity picture"
                            />
                          `
                        : html`
                            <ha-icon
                              icon="${displayIcon || 'mdi:help-circle'}"
                              class="${animationClass} ultra-force-animation"
                              style="
                                color: ${displayColor || 'var(--secondary-text-color)'};
                                --mdc-icon-size: ${(() => {
                                // Priority: 1) Icon state-specific size, 2) Icon default size, 3) Module icon_size, 4) Fallback
                                const iconSpecificSize = Number(
                                  isActive
                                    ? icon.active_icon_size || icon.icon_size
                                    : icon.inactive_icon_size || icon.icon_size
                                );
                                if (iconSpecificSize) {
                                  return `${iconSpecificSize}px`;
                                }
                                // Use module-level icon_size if set
                                if (iconModule?.icon_size) {
                                  return `${iconModule.icon_size}px`;
                                }
                                return '26px';
                              })()};
                                ${animationClass && animationClass !== 'none'
                                ? `animation: ${this._getInlineAnimation(animationClass)} !important;`
                                : ''}
                              "
                              data-animation-debug="${animationClass || 'none'}"
                              data-is-active="${isActive}"
                            ></ha-icon>
                          `}
                    </div>
                  `
                : ''}
              ${shouldShowName
                ? html`
                    <div
                      class="icon-name"
                      style="
                        font-size: ${globalTextStyles.fontSize
                        ? globalTextStyles.fontSize
                        : `${
                            isActive
                              ? icon.active_text_size || icon.text_size || 12
                              : icon.inactive_text_size || icon.text_size || 14
                          }px`};
                        color: ${nameColor || 'var(--primary-text-color)'};
                        text-align: ${globalTextStyles.textAlign || 'center'};
                        line-height: ${globalTextStyles.lineHeight || '1.2'};
                        max-width: 120px;
                        word-wrap: break-word;
                        margin-bottom: ${shouldShowState ? `${actualNameStateGap}px` : '0px'};
                        font-family: ${globalTextStyles.fontFamily || 'inherit'};
                        font-weight: ${globalTextStyles.fontWeight || 'inherit'};
                        font-style: ${globalTextStyles.fontStyle || 'inherit'};
                        text-transform: ${globalTextStyles.textTransform || 'inherit'};
                        letter-spacing: ${globalTextStyles.letterSpacing || 'inherit'};
                        text-shadow: ${globalTextStyles.textShadow || 'none'};
                      "
                    >
                      ${displayName}
                    </div>
                  `
                : ''}
              ${shouldShowState
                ? html`
                    <div
                      class="icon-state"
                      style="
                        font-size: ${globalTextStyles.fontSize
                        ? globalTextStyles.fontSize
                        : `${
                            isActive
                              ? icon.active_state_size || icon.state_size || 10
                              : icon.inactive_state_size || icon.state_size || 10
                          }px`};
                        color: ${stateColor || 'var(--secondary-text-color)'};
                        text-align: ${globalTextStyles.textAlign || 'center'};
                        line-height: ${globalTextStyles.lineHeight || '1.2'};
                        font-family: ${globalTextStyles.fontFamily || 'inherit'};
                        font-weight: ${globalTextStyles.fontWeight || 'inherit'};
                        font-style: ${globalTextStyles.fontStyle || 'inherit'};
                        text-transform: ${globalTextStyles.textTransform || 'inherit'};
                        letter-spacing: ${globalTextStyles.letterSpacing || 'inherit'};
                        text-shadow: ${globalTextStyles.textShadow || 'none'};
                      "
                    >
                      ${displayState}
                    </div>
                  `
                : ''}
            </div>
          `;
        })}
      </div>
    `;
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const iconModule = module as IconModule;
    const errors = [...baseValidation.errors];

    // LENIENT VALIDATION: Allow empty/incomplete icons - UI will show placeholder
    // Only validate icons that have been started
    if (iconModule.icons && iconModule.icons.length > 0) {
      iconModule.icons.forEach((icon, index) => {
        // Static icons are always valid (no entity required, just need an icon)
        // Entity-based icons need an entity to be fully valid
        const isStaticIcon = icon.icon_mode === 'static';
        const hasContent = isStaticIcon
          ? icon.icon_inactive && icon.icon_inactive.trim() !== ''
          : (icon.entity && icon.entity.trim() !== '') ||
            (icon.icon_inactive && icon.icon_inactive.trim() !== '');

        if (hasContent) {
          // Only validate truly critical errors
          // Icon format validation could go here if needed
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Update template service with new hass reference
  public updateHass(hass: HomeAssistant): void {
    if (this._templateService) {
      this._templateService.updateHass(hass);
    }
  }

  // Clean up template subscriptions
  public cleanup(): void {
    if (this._templateService) {
      this._templateService.unsubscribeAllTemplates();
      this._templateService = undefined;
    }
    // Clear attribute cache
    this._attributeCache.clear();

    // Clear processing flags
    this._processingAttributes.clear();

    // Clear any pending updates
    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
      this._updateTimeout = undefined;
    }
  }

  // Helper method to get the display state value (attribute value or entity state)
  private _getDisplayStateValue(
    icon: IconConfig,
    hass: HomeAssistant,
    isActive: boolean,
    config?: UltraCardConfig
  ): string {
    const entityId = this.resolveEntity(icon.entity, config) || icon.entity;
    const entityState = entityId ? hass?.states[entityId] : undefined;
    if (!entityState) {
      return 'unknown';
    }

    const currentState = entityState.state;

    // Check simple display_attribute first (applies to both active and inactive)
    if (icon.display_attribute && entityState.attributes?.[icon.display_attribute] !== undefined) {
      const attributeValue = entityState.attributes[icon.display_attribute];
      return this._formatValueWithUnits(String(attributeValue), entityId, icon, hass);
    }

    // Check if attributes are selected for display (active/inactive specific)
    const selectedAttribute = isActive ? icon.active_attribute : icon.inactive_attribute;

    if (selectedAttribute && entityState.attributes?.[selectedAttribute] !== undefined) {
      // Use the attribute value as the display state
      const attributeValue = entityState.attributes[selectedAttribute];
      return this._formatValueWithUnits(String(attributeValue), entityId, icon, hass);
    }

    // Fall back to custom text or entity state
    const customText = isActive ? icon.custom_active_state_text : icon.custom_inactive_state_text;

    if (customText && customText.trim() !== '') {
      return customText;
    }

    return this._formatValueWithUnits(currentState, entityId, icon, hass);
  }

  // Helper method to get available attributes from an entity (ultra-simplified)
  protected _getEntityAttributes(
    entityId: string,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): { value: string | undefined; label: string }[] {
    const options = [{ value: '', label: 'None (Use State)' }];

    try {
      const resolvedId = this.resolveEntity(entityId, config) || entityId;
      if (!resolvedId || !hass?.states?.[resolvedId]) {
        return options;
      }

      const entityState = hass.states[resolvedId];
      const attributes = entityState.attributes || {};

      // Process all attributes, but safely
      Object.keys(attributes).forEach(key => {
        // Skip system/internal attributes that aren't useful for state evaluation
        if (
          !key.startsWith('_') &&
          key !== 'friendly_name' &&
          key !== 'entity_picture' &&
          key !== 'supported_features' &&
          key !== 'device_class' &&
          key !== 'state_class'
        ) {
          const value = attributes[key];
          let displayValue = '';

          // Safely convert value to string
          if (value === null || value === undefined) {
            displayValue = 'null';
          } else if (typeof value === 'object') {
            displayValue = Array.isArray(value) ? `[${value.length} items]` : '{object}';
          } else {
            displayValue = String(value).substring(0, 20);
          }

          options.push({
            value: key,
            label: `${key} (${displayValue})`,
          });
        }
      });

      return options;
    } catch (error) {
      console.error('Error getting attributes:', error);
      return options;
    }
  }

  // Helper method to detect binary entities by domain
  protected _isBinaryEntity(entityId: string): boolean {
    const binaryDomains = [
      'binary_sensor',
      'switch',
      'input_boolean',
      'automation',
      'script',
      'light', // lights can be on/off
      'fan', // fans can be on/off
      'lock', // locks can be locked/unlocked (on/off)
      'cover', // covers can be open/closed
      'device_tracker', // device trackers can be home/away (on/off)
    ];

    const domain = entityId.split('.')[0];
    return binaryDomains.includes(domain);
  }

  /**
   * Enhanced state matching that supports both actual entity states, binary equivalents,
   * and numeric comparison operators (>, >=, <, <=, !=, =)
   */
  private _matchesState(actualValue: string, configuredState: string, entityState: any): boolean {
    // Direct match first
    if (actualValue === configuredState) {
      return true;
    }

    // Case-insensitive match
    if (actualValue.toLowerCase() === configuredState.toLowerCase()) {
      return true;
    }

    // Check for comparison operators (>=, <=, !=, >, <, =)
    // Must check longer operators first to avoid matching partial operators
    const comparisonMatch = configuredState.match(/^(>=|<=|!=|>|<|=)\s*(.+)$/);
    if (comparisonMatch) {
      const operator = comparisonMatch[1];
      const targetValueStr = comparisonMatch[2].trim();

      // Try numeric comparison first
      const actualNum = parseFloat(actualValue);
      const targetNum = parseFloat(targetValueStr);

      if (!isNaN(actualNum) && !isNaN(targetNum)) {
        switch (operator) {
          case '>':
            return actualNum > targetNum;
          case '>=':
            return actualNum >= targetNum;
          case '<':
            return actualNum < targetNum;
          case '<=':
            return actualNum <= targetNum;
          case '!=':
            return actualNum !== targetNum;
          case '=':
            return actualNum === targetNum;
        }
      } else {
        // Fall back to string comparison for non-numeric values
        switch (operator) {
          case '!=':
            return actualValue.toLowerCase() !== targetValueStr.toLowerCase();
          case '=':
            return actualValue.toLowerCase() === targetValueStr.toLowerCase();
          default:
            // Other operators don't make sense for strings, return false
            return false;
        }
      }
    }

    // Binary state mapping - allow users to use either actual states or binary equivalents
    const domain = entityState?.entity_id?.split('.')[0];
    const deviceClass = entityState?.attributes?.device_class;

    // Create mapping of actual states to binary equivalents
    const stateMappings = this._getStateMappings(domain, deviceClass);

    // Check if configured state maps to actual value
    if (stateMappings[configuredState.toLowerCase()] === actualValue.toLowerCase()) {
      return true;
    }

    // Check reverse mapping (actual state maps to configured binary)
    if (stateMappings[actualValue.toLowerCase()] === configuredState.toLowerCase()) {
      return true;
    }

    return false;
  }

  /**
   * Get state mappings for different entity types and device classes
   */
  private _getStateMappings(domain: string, deviceClass?: string): Record<string, string> {
    const mappings: Record<string, string> = {};

    // Common binary mappings that work for most entities
    mappings['on'] = 'on';
    mappings['off'] = 'off';
    mappings['true'] = 'on';
    mappings['false'] = 'off';
    mappings['yes'] = 'on';
    mappings['no'] = 'off';
    mappings['1'] = 'on';
    mappings['0'] = 'off';

    // Domain-specific mappings
    switch (domain) {
      case 'binary_sensor':
        // Map common binary sensor states to on/off
        mappings['open'] = 'on';
        mappings['closed'] = 'off';
        mappings['detected'] = 'on';
        mappings['clear'] = 'off';
        mappings['motion'] = 'on';
        mappings['no_motion'] = 'off';
        mappings['occupied'] = 'on';
        mappings['not_occupied'] = 'off';
        mappings['wet'] = 'on';
        mappings['dry'] = 'off';
        mappings['connected'] = 'on';
        mappings['disconnected'] = 'off';
        mappings['home'] = 'on';
        mappings['away'] = 'off';
        mappings['problem'] = 'on';
        mappings['ok'] = 'off';
        mappings['unsafe'] = 'on';
        mappings['safe'] = 'off';

        // Device class specific mappings
        if (deviceClass) {
          switch (deviceClass) {
            case 'door':
            case 'window':
            case 'garage_door':
              mappings['open'] = 'on';
              mappings['closed'] = 'off';
              break;
            case 'lock':
              mappings['unlocked'] = 'on';
              mappings['locked'] = 'off';
              break;
            case 'motion':
              mappings['motion'] = 'on';
              mappings['no_motion'] = 'off';
              break;
            case 'occupancy':
              mappings['occupied'] = 'on';
              mappings['not_occupied'] = 'off';
              break;
            case 'presence':
              mappings['home'] = 'on';
              mappings['away'] = 'off';
              break;
            case 'connectivity':
              mappings['connected'] = 'on';
              mappings['disconnected'] = 'off';
              break;
          }
        }
        break;

      case 'cover':
        mappings['open'] = 'on';
        mappings['closed'] = 'off';
        mappings['opening'] = 'on';
        mappings['closing'] = 'off';
        break;

      case 'lock':
        mappings['unlocked'] = 'on';
        mappings['locked'] = 'off';
        mappings['unlocking'] = 'on';
        mappings['locking'] = 'off';
        break;

      case 'device_tracker':
      case 'person':
        mappings['home'] = 'on';
        mappings['away'] = 'off';
        mappings['not_home'] = 'off';
        break;

      case 'alarm_control_panel':
        mappings['disarmed'] = 'off';
        mappings['armed_home'] = 'on';
        mappings['armed_away'] = 'on';
        mappings['armed_night'] = 'on';
        mappings['armed_vacation'] = 'on';
        mappings['armed_custom_bypass'] = 'on';
        break;
    }

    return mappings;
  }

  // Helper method to properly evaluate icon state (matches logic from actual card)
  private _evaluateIconState(
    icon: IconConfig,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): boolean {
    // Static icons have no entity and no active/inactive distinction
    // Always return false (use inactive/single-state properties)
    if (icon.icon_mode === 'static') {
      return false;
    }

    const resolvedEntity = this.resolveEntity(icon.entity, config) || icon.entity;
    const entityState = resolvedEntity ? hass?.states[resolvedEntity] : undefined;
    if (!entityState) {
      return false;
    }

    const currentState = entityState.state;

    // Get attribute values if specified
    const inactiveValue = icon.inactive_attribute
      ? entityState.attributes?.[icon.inactive_attribute]?.toString() || ''
      : currentState;
    const activeValue = icon.active_attribute
      ? entityState.attributes?.[icon.active_attribute]?.toString() || ''
      : currentState;

    // PRIORITY 1: Check unified template with ignore_entity_state_config flag
    // When ignore_entity_state_config is true:
    // - Template controls display properties (icon, color, name, etc.)
    // - For active/inactive state (used for animations), we:
    //   1. Check if template returns an explicit "active" property in JSON - use that
    //   2. Otherwise, ALWAYS fall back to entity state evaluation (active_state/inactive_state config)
    // This ensures animations work correctly based on active_state even when using templates
    let shouldUseEntityStateForActive = false;

    if (icon.unified_template_mode && icon.unified_template && icon.ignore_entity_state_config) {
      // Default to using entity state for active/inactive determination
      // This will be overridden only if template explicitly specifies "active" property
      shouldUseEntityStateForActive = true;

      if (!this._templateService && hass) {
        this._templateService = new TemplateService(hass);
      } else if (this._templateService && hass) {
        // CRITICAL: Update the template service's hass reference to ensure
        // template results are stored in the same hass object we read from.
        this._templateService.updateHass(hass);
      }

      const processedUnifiedTemplate = preprocessTemplateVariables(
        icon.unified_template,
        hass,
        config
      );
      const templateKey = this._buildUnifiedIconTemplateKey(icon, processedUnifiedTemplate, config);

      if (!hass.__uvc_template_strings) {
        hass.__uvc_template_strings = {};
      }

      // Note: config may be undefined for callers without card config (e.g. split preview);
      // in that case only global variables resolve here.
      if (this._templateService) {
        const context = this._getEntityContext(icon, hass, config);
        const entitySig = computeEntitySignature(icon.entity, hass);
        this._templateService.subscribeToTemplate(
          processedUnifiedTemplate,
          templateKey,
          () => {
            this.triggerPreviewUpdate();
          },
          context,
          undefined,
          entitySig
        );
      }

      const templateResult = hass?.__uvc_template_strings?.[templateKey];
      if (templateResult !== undefined) {
        const resultStr = String(templateResult).trim();
        const resultLower = resultStr.toLowerCase();

        // Check if result is a simple boolean value - use it directly for active state
        const isBooleanResult = ['true', 'false', 'on', 'off', 'yes', 'no', '0', '1'].includes(
          resultLower
        );

        if (isBooleanResult) {
          return (
            ['true', 'on', 'yes', '1'].includes(resultLower) ||
            (parseFloat(resultLower) > 0 && !isNaN(parseFloat(resultLower)))
          );
        }

        // Check if result is JSON
        if (resultStr.startsWith('{') && resultStr.endsWith('}')) {
          try {
            const parsed = JSON.parse(resultStr);
            // If JSON has explicit "active" or "is_active" property, use that for active state
            if (parsed.active !== undefined) {
              return Boolean(parsed.active);
            }
            if (parsed.is_active !== undefined) {
              return Boolean(parsed.is_active);
            }
            // JSON without explicit active property - use entity state evaluation
            // shouldUseEntityStateForActive is already true, so we fall through
          } catch {
            // JSON parsing failed - still use entity state evaluation for robustness
            // shouldUseEntityStateForActive is already true
          }
        }
        // For any other template result (non-JSON, non-boolean), use entity state evaluation
        // shouldUseEntityStateForActive is already true
      }
      // If templateResult is undefined (not yet evaluated), use entity state evaluation
      // shouldUseEntityStateForActive is already true
    }

    // If both active_state and inactive_state are defined, check both
    if (icon.active_state && icon.inactive_state) {
      if (this._matchesState(activeValue, icon.active_state, entityState)) {
        return true;
      }
      if (this._matchesState(inactiveValue, icon.inactive_state, entityState)) {
        return false;
      }
      // If state doesn't match either, default to inactive
      return false;
    }

    // If only active_state is defined
    if (icon.active_state) {
      return this._matchesState(activeValue, icon.active_state, entityState);
    }

    // If only inactive_state is defined
    if (icon.inactive_state) {
      return !this._matchesState(inactiveValue, icon.inactive_state, entityState);
    }

    // If attributes are selected but no specific states are defined,
    // use intelligent defaults based on the attribute values
    if (
      (icon.active_attribute || icon.inactive_attribute) &&
      !icon.active_state &&
      !icon.inactive_state
    ) {
      // For numeric attributes (like temperature), consider values > 70 as "active"
      const numericValue = parseFloat(activeValue || inactiveValue);
      if (!isNaN(numericValue)) {
        return numericValue > 70; // Default threshold for temperature-like values
      }

      // For string attributes, use common patterns
      const value = (activeValue || inactiveValue).toLowerCase();
      const activePatterns = ['cloudy', 'rainy', 'stormy', 'snowy', 'windy', 'hot', 'warm'];
      const inactivePatterns = ['sunny', 'clear', 'fair', 'cold', 'cool'];

      if (activePatterns.some(pattern => value.includes(pattern))) {
        return true;
      }

      if (inactivePatterns.some(pattern => value.includes(pattern))) {
        return false;
      }

      // Default to showing the attribute value (active state)
      return true;
    }

    // If neither is defined, use common "active" patterns
    // Use the primary value (attribute if specified, otherwise state)
    const primaryValue =
      icon.active_attribute || icon.inactive_attribute
        ? icon.active_attribute
          ? activeValue
          : inactiveValue
        : currentState;

    const activeStates = ['on', 'true', 'active', 'open', 'playing', 'home'];
    const inactiveStates = [
      'off',
      'false',
      'inactive',
      'closed',
      'paused',
      'stopped',
      'away',
      'unavailable',
      'unknown',
    ];

    if (activeStates.includes(primaryValue.toLowerCase())) {
      return true;
    }

    if (inactiveStates.includes(primaryValue.toLowerCase())) {
      return false;
    }

    // For numeric states, consider > 0 as active
    const numericState = parseFloat(primaryValue);
    if (!isNaN(numericState)) {
      return numericState > 0;
    }

    // Default fallback
    return false;
  }

  /**
   * Build entity context for unified templates (`variables` passed to HA
   * `render_template`). Refreshed on every render; `TemplateService` re-subscribes
   * when `computeEntitySignature` changes so Jinja sees up-to-date `state`.
   */
  private _getEntityContext(
    icon: IconConfig,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): Record<string, any> {
    return buildEntityContext(this.resolveEntity(icon.entity, config) || icon.entity, hass, {
      name: icon.name,
      icon_inactive: icon.icon_inactive,
      icon_active: icon.icon_active,
      active_state: icon.active_state,
      inactive_state: icon.inactive_state,
    });
  }

  getStyles(): string {
    return `
      /* Scope all icon-form tweaks to icon module editor only */
      .icon-module-general-settings [slot='label'] {
        display: none !important;
      }


      
      .icon-grid {
        width: 100%;
      }

      /* Collapsible Header Styles */
      .collapsible-header:hover {
        background: rgba(var(--rgb-primary-color), 0.08) !important;
        border-color: var(--primary-color) !important;
      }

      .collapsible-header:active {
        transform: scale(0.98);
      }

      /* Split Preview Styles */
      .split-preview-container {
        position: relative;
      }

      .split-preview-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 1px;
        height: 100%;
        background: var(--divider-color);
        z-index: 1;
      }

      .icon-module-split-preview .inactive-preview .icon-item-preview {
        border: 1px solid rgba(var(--rgb-primary-color), 0.1);
        background: rgba(var(--rgb-primary-color), 0.02);
      }

      .icon-module-split-preview .active-preview .icon-item-preview {
        border: 1px solid rgba(var(--rgb-primary-color), 0.2);
        background: rgba(var(--rgb-primary-color), 0.04);
      }

      .icon-module-split-preview .inactive-preview .icon-item-preview.hover-enabled:hover {
        background: rgba(var(--rgb-primary-color), 0.08) !important;
        border-color: var(--primary-color) !important;
        transform: scale(1.02);
      }

      .icon-module-split-preview .active-preview .icon-item-preview.hover-enabled:hover {
        background: rgba(var(--rgb-primary-color), 0.12) !important;
        border-color: var(--primary-color) !important;
        transform: scale(1.02);
      }

      /* Preview state indicators */
      .icon-module-split-preview .preview-header div {
        padding: 8px 12px;
        border-radius: var(--uc-r-20, 20px);
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0 8px;
        background: rgba(var(--rgb-primary-color), 0.08);
        border: 1px solid rgba(var(--rgb-primary-color), 0.2);
      }

      /* Responsive adjustments for split view */
      @media (max-width: 768px) {
        .icon-module-split-preview .split-preview-container {
          grid-template-columns: 1fr !important;
          grid-template-rows: auto auto;
        }

        .icon-module-split-preview .preview-header {
          flex-direction: column !important;
          gap: 8px !important;
        }

        .icon-module-split-preview .inactive-preview {
          border-right: none !important;
          border-bottom: 1px solid var(--divider-color) !important;
        }

        .icon-module-split-preview .split-preview-container::before {
          display: none;
        }

        .icon-module-split-preview .preview-header div {
          margin: 0 !important;
        }

        .collapsible-header {
          padding: 10px 12px !important;
        }

        .collapsible-header span {
          font-size: 14px !important;
        }

        .collapsible-header ha-icon {
          font-size: 16px !important;
        }
      }

      @media (max-width: 480px) {
        /* Removed mobile-specific icon-grid overrides to maintain consistent user-configured spacing */

        .icon-module-split-preview .inactive-preview,
        .icon-module-split-preview .active-preview {
          padding: 8px !important;
        }

        .icon-module-split-preview .preview-header div {
          font-size: 10px !important;
          padding: 6px 8px !important;
        }

        .collapsible-header {
          padding: 8px 10px !important;
        }

        .collapsible-header span {
          font-size: 12px !important;
        }

        .collapsible-header ha-icon {
          font-size: 14px !important;
        }
      }
      
      .icon-item-preview.hover-enabled:hover {
        background: var(--primary-color) !important;
        color: var(--text-primary-color, #fff);
        transform: scale(1.05);
      }
      
      .icon-item-preview.hover-enabled:hover ha-icon {
        color: var(--text-primary-color, #fff) !important;
      }
      
      .icon-item-preview.hover-enabled:hover .icon-name,
      .icon-item-preview.hover-enabled:hover .icon-state {
        color: var(--text-primary-color, #fff) !important;
      }
      
      /* Field styling */
      .field-title {
        font-size: 16px !important;
        font-weight: 600 !important;
     
        margin-bottom: 4px !important;
        display: block !important;
      }

      .field-description {
        font-size: 13px !important;
        color: var(--secondary-text-color) !important;
        margin-bottom: 12px !important;
        display: block !important;
        opacity: 0.8 !important;
        line-height: 1.4 !important;
      }

      .section-title {
        font-size: 18px !important;
        font-weight: 700 !important;
        color: var(--primary-color) !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
      }

      .settings-section {
        margin-bottom: 16px;
        max-width: 100%;
        box-sizing: border-box;
      }

      /* Conditional Fields Grouping CSS */
      .conditional-fields-group {
        margin-top: 16px;
        border-left: 4px solid var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.08);
        border-radius: 0 var(--uc-r-8, 8px) var(--uc-r-8, 8px) 0;
        overflow: hidden;
        transition: all 0.2s ease;
        animation: slideInFromLeft 0.3s ease-out;
      }

      .conditional-fields-group:hover {
        background: rgba(var(--rgb-primary-color), 0.12);
      }

      .conditional-fields-header {
        background: rgba(var(--rgb-primary-color), 0.15);
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-color);
        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .conditional-fields-content {
        padding: 16px;
      }

      .conditional-fields-content > .field-title:first-child {
        margin-top: 0 !important;
      }

      @keyframes slideInFromLeft {
        from { 
          opacity: 0; 
          transform: translateX(-10px); 
        }
        to { 
          opacity: 1; 
          transform: translateX(0); 
        }
      }

      /* Expandable details styling */
      details > summary {
        list-style: none;
      }

      details > summary::-webkit-details-marker {
        display: none;
      }

      details[open] > summary ha-icon {
        transform: rotate(90deg);
      }

      details > summary:hover {
        background: rgba(var(--rgb-primary-color), 0.1) !important;
      }

      /* Icon animations - Simple and direct selectors */
      .icon-animation-pulse {
        animation: iconPulse 2s ease-in-out infinite !important;
      }

      .icon-animation-spin {
        animation: iconSpin 2s linear infinite !important;
      }

      .icon-animation-bounce {
        animation: iconBounce 1s ease-in-out infinite !important;
      }

      .icon-animation-flash {
        animation: iconFlash 1s ease-in-out infinite !important;
      }

      .icon-animation-shake {
        animation: iconShake 0.5s ease-in-out infinite !important;
      }

      .icon-animation-vibrate {
        animation: iconVibrate 0.3s ease-in-out infinite !important;
      }

      .icon-animation-rotate-left {
        animation: iconRotateLeft 2s linear infinite !important;
      }

      .icon-animation-rotate-right {
        animation: iconRotateRight 2s linear infinite !important;
      }

      .icon-animation-fade {
        animation: iconFade 2s ease-in-out infinite !important;
      }

      .icon-animation-scale {
        animation: iconScale 1s ease-in-out infinite !important;
      }

      .icon-animation-tada {
        animation: iconTada 1s ease-in-out infinite !important;
      }



      @keyframes iconPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); }
      }

      @keyframes iconSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @keyframes iconBounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }

      @keyframes iconFlash {
        0%, 50%, 100% { opacity: 1; }
        25%, 75% { opacity: 0.3; }
      }

      @keyframes iconShake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
        20%, 40%, 60%, 80% { transform: translateX(2px); }
      }

      @keyframes iconVibrate {
        0%, 100% { transform: translate(0); }
        10% { transform: translate(-1px, -1px); }
        20% { transform: translate(1px, -1px); }
        30% { transform: translate(-1px, 1px); }
        40% { transform: translate(1px, 1px); }
        50% { transform: translate(-1px, -1px); }
        60% { transform: translate(1px, -1px); }
        70% { transform: translate(-1px, 1px); }
        80% { transform: translate(1px, 1px); }
        90% { transform: translate(-1px, -1px); }
      }

      @keyframes iconRotateLeft {
        from { transform: rotate(0deg); }
        to { transform: rotate(-360deg); }
      }

      @keyframes iconRotateRight {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @keyframes iconFade {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }

      @keyframes iconScale {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }

      @keyframes iconTada {
        0% { transform: scale(1); }
        10%, 20% { transform: scale(0.9) rotate(-3deg); }
        30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
        40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
        100% { transform: scale(1) rotate(0); }
      }

      @keyframes lockUnlockedPulse {
        0%, 100% { 
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
          border-color: var(--info-color, #2196F3);
        }
        50% { 
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.4);
          border-color: var(--info-color, #1976D2);
        }
      }

      /* Respect user's motion preferences */
      @media (prefers-reduced-motion: reduce) {
        .lock-btn.unlocked {
          animation: none !important;
        }
      }

      /* Add icon button styling */
      .add-icon-btn:hover {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      
      /* Remove icon button styling */
      .remove-icon-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      /* Icon picker specific styling */
      ha-icon-picker {
        --ha-icon-picker-width: 100%;
        --ha-icon-picker-height: 56px;
      }

      /* Dropdown styling */
      ha-select {
        width: 100%;
        --ha-select-height: 40px;
      }

      /* Hide any radio buttons that might still be rendered */
      ha-radio,
      mwc-radio,
      .mdc-radio {
        display: none !important;
      }

      /* Text field and select consistency */
      ha-textfield,
      ha-select {
        --mdc-shape-small: 8px;
        --mdc-theme-primary: var(--primary-color);
      }

      /* Note: Dropdown positioning fixes are now handled globally in ultra-card-editor.ts */

      /* Module tab content input width - restrict to icon module only */
      .icon-module .module-tab-content input[type="number"], 
      .icon-module .module-tab-content input[type="text"],
      .icon-module .module-tab-content .gap-input {
        width: 25% !important;
        max-width: 25% !important;
        min-width: 25% !important;
      }

      /* Grid styling for layout options */
      .settings-section[style*="grid"] > div {
        min-width: 0;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .settings-section[style*="grid-template-columns: 1fr 1fr 1fr"] {
          grid-template-columns: 1fr !important;
          gap: 12px !important;
        }

        .settings-section[style*="grid-template-columns: 1fr 1fr"] {
          grid-template-columns: 1fr !important;
          gap: 12px !important;
        }

        .conditional-fields-group {
          border-left-width: 3px;
        }
        
        .conditional-fields-header {
          padding: 10px 12px;
          font-size: 13px;
        }
        
        .conditional-fields-content {
          padding: 12px;
        }

        /* Mobile-friendly field titles and descriptions */
        .field-title {
          font-size: 14px !important;
        }

        .field-description {
          font-size: 12px !important;
          line-height: 1.3 !important;
        }

        .section-title {
          font-size: 16px !important;
        }

        /* Mobile-friendly size controls */
        .gap-control-container {
          gap: 8px !important;
        }

        .gap-input {
          width: 44px !important;
          max-width: 44px !important;
          min-width: 44px !important;
          font-size: 12px !important;
        }

        .reset-btn {
          width: 32px !important;
          height: 32px !important;
        }

        .reset-btn ha-icon {
          font-size: 14px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 !important;
          padding: 0 !important;
          line-height: 1 !important;
        }

        /* Mobile-friendly lock buttons */
        .lock-btn {
          padding: 6px 12px !important;
          font-size: 12px !important;
        }

        .lock-btn ha-icon {
          font-size: 16px !important;
        }

        .lock-btn.unlocked {
          border-color: var(--info-color, #2196F3) !important;
          background: rgba(33, 150, 243, 0.15) !important;
          color: var(--info-color, #2196F3) !important;
          box-shadow: 0 0 0 1px rgba(33, 150, 243, 0.3) !important;
        }

        .lock-btn.unlocked ha-icon {
          color: var(--info-color, #2196F3) !important;
        }

        /* Mobile-friendly accordions */
        details > summary {
          padding: 12px !important;
          font-size: 14px !important;
        }

        details > summary ha-icon {
          font-size: 16px !important;
        }

        /* Mobile-friendly form fields */
        .icon-settings-container {
          padding: 12px !important;
        }

        /* Removed mobile-specific icon-grid overrides to maintain consistent user-configured spacing across all screen sizes */
        /* Note: .icon-item-preview padding intentionally not modified on mobile to keep desktop/mobile parity */
      }

      /* Extra small devices (phones, 480px and down) */
      @media (max-width: 480px) {
        .field-title {
          font-size: 13px !important;
        }

        .field-description {
          font-size: 11px !important;
        }

        .section-title {
          font-size: 14px !important;
        }

        .gap-input {
          width: 40px !important;
          max-width: 40px !important;
          min-width: 40px !important;
          font-size: 11px !important;
        }

        .reset-btn {
          width: 28px !important;
          height: 28px !important;
        }

        .reset-btn ha-icon {
          font-size: 12px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 !important;
          padding: 0 !important;
          line-height: 1 !important;
        }

        .lock-btn {
          padding: 4px 8px !important;
          font-size: 11px !important;
        }

        .lock-btn.unlocked {
          border-color: var(--info-color, #2196F3) !important;
          background: rgba(33, 150, 243, 0.15) !important;
          color: var(--info-color, #2196F3) !important;
          box-shadow: 0 0 0 1px rgba(33, 150, 243, 0.3) !important;
        }

        .lock-btn.unlocked ha-icon {
          color: var(--info-color, #2196F3) !important;
        }

        .icon-settings-container {
          padding: 8px !important;
        }

        /* Stack lock controls vertically on very small screens */
        .gap-control-container {
          flex-wrap: wrap !important;
          gap: 6px !important;
        }

        .gap-slider {
          width: 100% !important;
          order: 1;
        }

        .gap-input {
          order: 2;
        }

        .reset-btn {
          order: 3;
        }

        .lock-btn {
          order: 4;
          width: 100% !important;
          justify-content: center !important;
        }
      }

      /* Ensure form elements don't overflow */
      .settings-section ha-form {
        max-width: 100%;
        overflow: visible;
      }

      /* Color picker adjustments */
      .settings-section ha-form[data-field*="color"] {
        min-height: 56px;
      }

      /* Boolean toggle adjustments */
      .settings-section ha-form[data-field*="mode"] {
        display: flex;
        align-items: center;
        min-height: auto;
      }

      /* Number slider adjustments */
      .settings-section ha-form[data-field*="size"] .mdc-slider,
      .settings-section ha-form[data-field*="gap"] .mdc-slider,
      .settings-section ha-form[data-field*="columns"] .mdc-slider {
        width: 100%;
        max-width: 100%;
      }

      /* Gap control styles */
      ${BaseUltraModule.getSliderStyles()}

      /* Lock button styles */
      .lock-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border: 2px solid var(--divider-color);
        border-radius: var(--uc-r-8, 8px);
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
        outline: none;
        position: relative;
      }

      .lock-btn:hover {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }

      .lock-btn.locked {
        border-color: var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.1);
        color: var(--primary-color);
      }

      .lock-btn.locked:hover {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }

      button.lock-btn.unlocked {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
      }

      .lock-btn.unlocked {
        border-color: var(--info-color, #2196F3) !important;
        background: rgba(33, 150, 243, 0.15) !important;
        color: var(--info-color, #2196F3) !important;
        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2) !important;
        animation: lockUnlockedPulse 2s ease-in-out infinite;
      }

      .lock-btn.unlocked:hover {
        background: var(--info-color, #2196F3) !important;
        color: white !important;
        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.4) !important;
        animation: none !important;
      }

      .lock-btn.unlocked ha-icon {
        color: var(--info-color, #2196F3) !important;
      }

      .lock-btn.unlocked:hover ha-icon {
        color: white !important;
      }

      .lock-btn ha-icon {
        font-size: 18px;
      }

      /* Field lock button styling */
      .field-container .lock-btn {
        padding: 6px 12px;
        font-size: 12px;
        min-width: auto;
      }

      .field-container .lock-btn ha-icon {
        font-size: 16px;
      }

      /* Collapsible per-icon panel (mirrors people-module data-item panels) */
      ha-expansion-panel.icon-item-panel {
        --ha-card-border-radius: var(--uc-r-8, 8px);
        --expansion-panel-summary-padding: 0;
        /* Horizontal-only padding on the variable so the collapsed .container
           (height: 0) does not still leak vertical padding below the row. */
        --expansion-panel-content-padding: 0 12px;
        margin-bottom: 8px;
      }

      ha-expansion-panel.icon-item-panel::part(summary) {
        padding: 0;
        min-height: unset;
      }

      ha-expansion-panel.icon-item-panel::part(content) {
        padding: 12px;
      }

      ha-expansion-panel.icon-item-panel.dragging {
        opacity: 0.5;
      }

      ha-expansion-panel.icon-item-panel.drag-over {
        outline: 2px dashed var(--primary-color);
        outline-offset: -2px;
      }

      .icon-item-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        width: 100%;
        box-sizing: border-box;
      }

      .icon-item-drag-handle {
        cursor: grab;
        color: var(--secondary-text-color);
        padding: 4px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
      }

      .icon-item-drag-handle:active {
        cursor: grabbing;
      }

      .icon-item-badge {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(var(--rgb-primary-color), 0.1);
        border-radius: var(--uc-r-6, 6px);
        color: var(--primary-color);
        flex-shrink: 0;
      }

      .icon-item-info {
        flex: 1;
        min-width: 0;
        text-align: left;
      }

      .icon-item-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .icon-item-subtitle {
        font-size: 12px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Inside the panel the container is just a content wrapper — the panel
         itself provides the border/background chrome. */
      ha-expansion-panel.icon-item-panel .icon-settings-container {
        background: transparent;
        border: none;
        padding: 4px 0 0 0;
        margin-bottom: 0;
      }

      /* Icon settings container */
      .icon-settings-container {
        background: var(--secondary-background-color);
        border-radius: var(--uc-r-8, 8px);
        padding: 16px;
        margin-bottom: 24px;
        border: 1px solid var(--divider-color);
      }

      .icon-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--divider-color);
      }

      .icon-preview {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border-radius: 50%;
        flex-shrink: 0;
      }

      .icon-title {
        flex: 1;
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .remove-icon-btn {
        background: var(--error-color);
        color: white;
        border: none;
        border-radius: var(--uc-r-4, 4px);
        padding: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .remove-icon-btn:hover {
        background: var(--error-color);
        opacity: 0.8;
      }

      .remove-icon-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      .remove-icon-btn ha-icon {
        font-size: 16px;
      }

      /* Size lock container */
      .size-lock-container {
        padding: 12px;
        background: rgba(var(--rgb-primary-color), 0.05);
        border-radius: var(--uc-r-8, 8px);
        border: 1px solid rgba(var(--rgb-primary-color), 0.2);
      }

      /* Removed overrides that modified ui_action options to avoid conflicts with HA selector */

      /* Template Section Styles */
      .template-section {
        background: var(--card-background-color);
        border-radius: var(--uc-r-8, 8px);
        padding: 16px;
        border: 1px solid var(--divider-color);
        margin-bottom: 32px;
      }

      .template-header {
        margin-bottom: 16px;
      }

      .switch-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 8px;
      }

      .switch-label-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .switch-label {
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 16px;
      }

      .help-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        padding: 0;
        background: var(--primary-color) !important;
        border: none !important;
        color: var(--text-primary-color, white) !important;
        cursor: pointer;
        border-radius: 50%;
        line-height: 0;
      }

      .help-btn:hover {
        opacity: 0.85;
      }

      .help-btn ha-icon {
        --mdc-icon-size: 18px;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
        display: block;
      }

      .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
      }

      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--switch-unchecked-color, #ccc);
        transition: .4s;
      }

      .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .4s;
      }

      input:checked + .slider {
        background-color: var(--primary-color);
      }

      input:checked + .slider:before {
        transform: translateX(26px);
      }

      .slider.round {
        border-radius: var(--uc-r-24, 24px);
    max-width: 50px;
}
      }

      .slider.round:before {
        border-radius: 50%;
      }

      .template-description {
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.4;
        margin-bottom: 8px;
      }

      .template-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .template-editor {
        min-height: 120px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.4;
        resize: vertical;
        width: 100%;
        padding: 12px;
        border: 1px solid var(--divider-color);
        border-radius: var(--uc-r-8, 8px);
        background: var(--card-background-color);
        color: var(--primary-text-color);
        outline: none;
        transition: border-color 0.2s ease;
      }

      .template-editor:focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      .template-help {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-style: italic;
        margin-top: 4px;
      }

      .template-help p {
        margin: 8px 0;
        font-weight: 500;
      }

      .template-help ul {
        margin: 4px 0;
        padding-left: 16px;
      }

      .template-help li {
        margin: 2px 0;
      }

      .template-help code {
        background: rgba(var(--rgb-primary-color), 0.1);
        padding: 2px 4px;
        border-radius: var(--uc-r-3, 3px);
        font-family: 'Courier New', monospace;
        font-size: 11px;
      }

      ${GlobalActionsTab.getHoverStyles()}
    `;
  }

  private getBackgroundImageCSS(
    moduleWithDesign: any,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): string {
    const imageType = moduleWithDesign.background_image_type;
    const backgroundImage = moduleWithDesign.background_image;
    const backgroundEntity =
      this.resolveEntity(moduleWithDesign.background_image_entity, config) ||
      moduleWithDesign.background_image_entity;

    if (!imageType || imageType === 'none') return 'none';

    switch (imageType) {
      case 'upload': {
        if (backgroundImage) {
          const resolved = getImageUrl(hass, backgroundImage);
          return `url("${resolved}")`;
        }
        break;
      }
      case 'url': {
        if (backgroundImage) {
          return `url("${backgroundImage}")`;
        }
        break;
      }
      case 'entity': {
        if (backgroundEntity && hass) {
          const entityState = hass.states[backgroundEntity];
          if (entityState) {
            const imageUrl =
              (entityState.attributes as any)?.entity_picture ||
              (entityState.attributes as any)?.image ||
              (typeof entityState.state === 'string' ? entityState.state : '');
            if (imageUrl && imageUrl !== 'unknown' && imageUrl !== 'unavailable') {
              const resolved = getImageUrl(hass, imageUrl);
              return `url("${resolved}")`;
            }
          }
        }
        break;
      }
    }

    return 'none';
  }

  private styleObjectToCss(styleObj: Record<string, string>): string {
    return Object.entries(styleObj)
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
        return `${kebabKey}: ${value}`;
      })
      .join('; ');
  }

  private _updateIconAnimationClasses(
    _entityId: string,
    newAnimationClass: string,
    _isActive: boolean
  ): void {
    const selector = 'ha-icon[data-animation-debug]:not([data-animation-debug="none"])';
    const roots: Array<Document | ShadowRoot> = [document];
    const renderRoot = (this as any).renderRoot as ShadowRoot | undefined;
    const shadowRoot = (this as any).shadowRoot as ShadowRoot | undefined;

    if (renderRoot) roots.push(renderRoot);
    if (shadowRoot && shadowRoot !== renderRoot) roots.push(shadowRoot);

    roots.forEach(root => {
      try {
        const allIcons = root.querySelectorAll(selector);
        allIcons.forEach((icon: Element) => {
          const iconEl = icon as HTMLElement;
          const desiredClass = iconEl.getAttribute('data-animation-debug') || '';
          if (desiredClass !== newAnimationClass) return;

          const currentClasses = iconEl.className.split(' ');
          const filteredClasses = currentClasses.filter(cls => !cls.startsWith('icon-animation-'));
          if (newAnimationClass && !newAnimationClass.includes('none')) {
            filteredClasses.push(newAnimationClass);
          }
          iconEl.className = filteredClasses.join(' ');

          const animKey = newAnimationClass.replace('icon-animation-', '');
          if (animKey && animKey !== 'none') {
            const keyframeName =
              'icon' +
              animKey
                .split('-')
                .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                .join('');
            const timing =
              animKey.includes('spin') || animKey.includes('rotate')
                ? '2s linear infinite'
                : '1s ease-in-out infinite';
            iconEl.style.animation = `${keyframeName} ${timing}`;
          } else {
            iconEl.style.animation = '';
          }

          this._injectKeyframesIntoHaIcon(iconEl);
          (iconEl as any).offsetHeight;
        });
      } catch (_error) {
        // Ignore animation sync errors to keep editor responsive.
        return;
      }
    });
  }

  // Get inline animation string for a given animation class
  private _getInlineAnimation(animationClass: string): string {
    const animKey = animationClass.replace('icon-animation-', '');
    if (!animKey || animKey === 'none') return '';

    const keyframeName =
      'icon' +
      animKey
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

    const timing =
      animKey.includes('spin') || animKey.includes('rotate')
        ? '2s linear infinite'
        : animKey === 'bounce'
          ? '1s ease-in-out infinite'
          : animKey === 'shake'
            ? '0.5s ease-in-out infinite'
            : animKey === 'vibrate'
              ? '0.3s ease-in-out infinite'
              : '2s ease-in-out infinite';

    return `${keyframeName} ${timing}`;
  }

  // Apply animation directly to an icon element
  private _applyAnimationDirectly(iconEl: HTMLElement, animationClass: string): void {
    const animKey = animationClass.replace('icon-animation-', '');
    if (!animKey || animKey === 'none') return;

    // Generate keyframe name
    const keyframeName =
      'icon' +
      animKey
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

    // Apply timing
    const timing =
      animKey.includes('spin') || animKey.includes('rotate')
        ? '2s linear infinite'
        : '2s ease-in-out infinite';

    // Set inline style
    (iconEl.style as any).animation = `${keyframeName} ${timing}`;

    // Also inject keyframes
    this._injectKeyframesIntoHaIcon(iconEl);
  }

  // Inject keyframes into ha-icon shadowRoot so animations work inside dialog previews
  private _injectKeyframesForAllSplitPreviewIcons(): void {
    const selector = 'ha-icon[data-animation-debug]:not([data-animation-debug="none"])';
    const collectAndInject = () => {
      const uniqueIcons = new Set<HTMLElement>();
      const roots: Array<Document | ShadowRoot> = [document];
      const renderRoot = (this as any).renderRoot as ShadowRoot | undefined;
      const shadowRoot = (this as any).shadowRoot as ShadowRoot | undefined;

      if (renderRoot) roots.push(renderRoot);
      if (shadowRoot && shadowRoot !== renderRoot) roots.push(shadowRoot);

      roots.forEach(root => {
        root.querySelectorAll(selector).forEach(icon => uniqueIcons.add(icon as HTMLElement));
      });

      uniqueIcons.forEach(icon => this._injectKeyframesIntoHaIcon(icon));
      return uniqueIcons.size;
    };

    const injected = collectAndInject();
    if (injected === 0) {
      setTimeout(() => collectAndInject(), 120);
    }
  }

  /**
   * Helper method to add pixel unit if needed
   * Handles edge cases like "20x" -> "20px" and validates unit strings
   * Supports both string and number types for flexibility
   */
  private addPixelUnit(value: string | number | undefined): string | undefined {
    if (!value && value !== 0) return value as string | undefined;

    // Convert number to string
    const valueStr = String(value);

    // Handle special CSS values
    if (
      valueStr === 'auto' ||
      valueStr === 'none' ||
      valueStr === 'inherit' ||
      valueStr === 'initial' ||
      valueStr === 'unset'
    ) {
      return valueStr;
    }

    // Normalize "x" to "px" (common typo when users can't type "px")
    if (valueStr.endsWith('x') && !valueStr.endsWith('px')) {
      const normalized = valueStr.replace(/x$/, 'px');
      return normalized;
    }

    // Check if value already has valid CSS units
    if (
      valueStr.includes('px') ||
      valueStr.includes('%') ||
      valueStr.includes('em') ||
      valueStr.includes('rem') ||
      valueStr.includes('vh') ||
      valueStr.includes('vw') ||
      valueStr.includes('ch') ||
      valueStr.includes('ex') ||
      valueStr.includes('vmin') ||
      valueStr.includes('vmax')
    ) {
      return valueStr;
    }

    // If value is just a number (with optional decimal), add px
    if (/^\d+(\.\d+)?$/.test(valueStr)) {
      return `${valueStr}px`;
    }

    // If value is multiple numbers separated by spaces, add px to each
    if (/^[\d\.\s]+$/.test(valueStr)) {
      return valueStr
        .split(' ')
        .map(v => (v.trim() && /^\d+(\.\d+)?$/.test(v.trim()) ? `${v.trim()}px` : v.trim()))
        .join(' ');
    }

    // Otherwise return as-is (might be a CSS variable, calc(), etc.)
    return valueStr;
  }

  /**
   * Format entity state value with units if show_units is enabled
   */
  private _formatValueWithUnits(
    value: string,
    entityId: string,
    icon: IconConfig,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): string {
    // Respect entity display precision; include unit only if enabled
    const resolvedId = this.resolveEntity(entityId, config) || entityId;
    if (!resolvedId || !hass?.states?.[resolvedId]) return value;
    return formatEntityState(hass, resolvedId, {
      state: value,
      includeUnit: icon.show_units !== false,
    });
  }

  /**
   * Extract color from entity state attributes
   */
  private _getEntityStateColor(entityState: any): string | null {
    if (!entityState || !entityState.attributes) return null;

    // Check for RGB color attributes (most common for lights)
    if (entityState.attributes.rgb_color && Array.isArray(entityState.attributes.rgb_color)) {
      return `rgb(${entityState.attributes.rgb_color.join(',')})`;
    }

    // Check for HS color attributes and convert to RGB
    if (entityState.attributes.hs_color && Array.isArray(entityState.attributes.hs_color)) {
      const [h, s] = entityState.attributes.hs_color;
      const rgb = this._hsToRgb(h / 360, s / 100, 1);
      return `rgb(${rgb.join(',')})`;
    }

    // Check for color name attribute
    if (entityState.attributes.color_name) {
      return entityState.attributes.color_name;
    }

    // Check for hex color attribute
    if (entityState.attributes.color && typeof entityState.attributes.color === 'string') {
      return entityState.attributes.color;
    }

    // For binary sensors or switches, use state-based colors
    if (entityState.entity_id) {
      const domain = entityState.entity_id.split('.')[0];
      if (domain === 'binary_sensor' || domain === 'switch') {
        return entityState.state === 'on' ? '#4CAF50' : '#F44336'; // Green for on, red for off
      }
    }

    return null;
  }

  /**
   * Convert HSV to RGB
   */
  private _hsToRgb(h: number, s: number, v: number): number[] {
    let r: number, g: number, b: number;

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;
      case 1:
        r = q;
        g = v;
        b = p;
        break;
      case 2:
        r = p;
        g = v;
        b = t;
        break;
      case 3:
        r = p;
        g = q;
        b = v;
        break;
      case 4:
        r = t;
        g = p;
        b = v;
        break;
      case 5:
        r = v;
        g = p;
        b = q;
        break;
      default:
        r = g = b = 0;
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  /**
   * Check if an entity has a custom icon or entity_picture and return the appropriate URL
   * @param entityState The entity state object
   * @param hass Home Assistant instance
   * @returns The entity picture URL or null if not available
   */
  private _getEntityPicture(entityState: any, hass: HomeAssistant): string | null {
    if (!entityState || !hass) return null;

    const entityId = entityState.entity_id;
    if (!entityId) return null;

    // First check for entity_picture (most common for person, device_tracker, camera, media_player)
    const entityPicture = entityState.attributes?.entity_picture;
    if (entityPicture) {
      // Convert relative URL to absolute URL if needed
      if (entityPicture.startsWith('/')) {
        const baseUrl = (hass as any).hassUrl ? (hass as any).hassUrl() : '';
        return `${baseUrl.replace(/\/$/, '')}${entityPicture}`;
      }
      return entityPicture;
    }

    // Check for other image attributes that might contain entity pictures
    const imageAttributes = [
      'image',
      'picture',
      'thumbnail',
      'avatar',
      'photo',
      'icon_url',
      'image_url',
    ];

    for (const attr of imageAttributes) {
      const imageUrl = entityState.attributes?.[attr];
      if (imageUrl && typeof imageUrl === 'string') {
        // Convert relative URL to absolute URL if needed
        if (imageUrl.startsWith('/')) {
          const baseUrl = (hass as any).hassUrl ? (hass as any).hassUrl() : '';
          return `${baseUrl.replace(/\/$/, '')}${imageUrl}`;
        }
        return imageUrl;
      }
    }

    return null;
  }

  /**
   * Check if an entity should use its picture instead of an icon
   * @param entityState The entity state object
   * @param iconConfig The icon configuration
   * @returns True if entity picture should be used
   */
  private _shouldUseEntityPicture(entityState: any, iconConfig?: IconConfig): boolean {
    if (!entityState) return false;
    if (iconConfig?.icon_mode === 'static') return false;
    if (iconConfig?.show_entity_picture === false) return false;

    const entityId = entityState.entity_id;
    if (!entityId) return false;

    // Check for entity_picture first (most common)
    if (entityState.attributes?.entity_picture) return true;

    // Check for other image attributes
    const imageAttributes = [
      'image',
      'picture',
      'thumbnail',
      'avatar',
      'photo',
      'icon_url',
      'image_url',
    ];

    return imageAttributes.some(
      attr =>
        entityState.attributes?.[attr] &&
        typeof entityState.attributes[attr] === 'string' &&
        entityState.attributes[attr].trim() !== ''
    );
  }

  private _injectKeyframesIntoHaIcon(iconEl: HTMLElement): void {
    const sr = (iconEl as any).shadowRoot as ShadowRoot | undefined;
    if (!sr) {
      return;
    }

    // Always inject fresh keyframes (remove existing first)
    const existingStyle = sr.querySelector('style[data-uvc-keyframes]');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Inject fresh keyframes
    try {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-uvc-keyframes', '');
      styleEl.textContent = UltraIconModule._ANIMATION_KEYFRAMES;
      sr.appendChild(styleEl);

      // Also try injecting into document head as backup
      if (!document.head.querySelector('style[data-uvc-global-keyframes]')) {
        const globalStyle = document.createElement('style');
        globalStyle.setAttribute('data-uvc-global-keyframes', '');
        globalStyle.textContent = UltraIconModule._ANIMATION_KEYFRAMES;
        document.head.appendChild(globalStyle);
      }
    } catch (error) {
      console.error(`❌ Error injecting keyframes:`, error);
    }
  }
}
