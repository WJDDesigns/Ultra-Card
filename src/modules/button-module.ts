import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { createLazySettings } from './uc-lazy-settings';
import { CardModule, ButtonModule, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { UltraLinkComponent } from '../components/ultra-link';
import { getImageUrl } from '../utils/image-upload';

const buttonSettings = createLazySettings(
  () => import(/* webpackChunkName: "core-settings" */ './settings/button-module-settings'),
  'button settings'
);

export class UltraButtonModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'button',
    title: 'Button',
    description: 'Interactive buttons with actions',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:gesture-tap-button',
    category: 'interactive',
    tags: ['button', 'action', 'click', 'interactive'],
  };

  createDefault(id?: string, hass?: HomeAssistant): ButtonModule {
    return {
      id: id || this.generateId('button'),
      type: 'button',
      label: '',
      style: 'flat',
      // alignment: undefined, // No default alignment to allow Global Design tab control
      icon: '',
      icon_position: 'before',
      show_icon: false,
      icon_size: '24px',
      background_color: 'var(--primary-color)',
      text_color: 'white',
      // Entity-based background color
      use_entity_color: false,
      background_color_entity: '',
      background_state_colors: {},
      // Additional action configuration for future upgrade
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      // Logic (visibility) defaults
      display_mode: 'always',
      display_conditions: [],
    };
  }

  preloadSettings(): Promise<void> {
    return buttonSettings.prefetch();
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return buttonSettings(s => s.renderButtonGeneralTab(this, module, hass, config, updateModule));
  }

  override renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const buttonModule = module as ButtonModule;

    return GlobalActionsTab.render(buttonModule as any, hass, updates => updateModule(updates));
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const buttonModule = module as ButtonModule;

    const moduleWithDesign = buttonModule as any;
    const designProperties = (buttonModule as any).design || {};

    const mirroredFontSize =
      typeof moduleWithDesign.font_size === 'string' ? moduleWithDesign.font_size : undefined;
    const rawFontSize =
      (typeof designProperties.font_size === 'string' && designProperties.font_size.trim() !== ''
        ? designProperties.font_size
        : mirroredFontSize) || '14px';
    const fontSize = this.addPixelUnit(rawFontSize) || '14px';

    // Resolve background color - check entity-based color first if enabled
    let backgroundColor =
      designProperties.background_color || buttonModule.background_color || 'var(--primary-color)';

    if (buttonModule.use_entity_color && buttonModule.background_color_entity && hass) {
      const resolvedColorEntity =
        this.resolveEntity(buttonModule.background_color_entity, config) ||
        buttonModule.background_color_entity;
      const entityState = hass.states[resolvedColorEntity];
      if (entityState) {
        // Check state colors mapping first
        if (
          buttonModule.background_state_colors &&
          Object.keys(buttonModule.background_state_colors).length > 0
        ) {
          const stateColor = this.matchStateColor(
            buttonModule.background_state_colors,
            entityState.state
          );
          if (stateColor) {
            backgroundColor = stateColor;
          } else {
            // Fallback to entity color extraction
            const entityColor = this.getEntityStateColor(entityState);
            if (entityColor) {
              backgroundColor = entityColor;
            }
          }
        } else {
          // No state colors mapping, use entity color extraction
          const entityColor = this.getEntityStateColor(entityState);
          if (entityColor) {
            backgroundColor = entityColor;
          }
        }
      }
    }

    const hasCustomTextColor =
      !!designProperties.color ||
      !!moduleWithDesign.color ||
      !!buttonModule.text_color ||
      !!moduleWithDesign.text_color;

    const textColor =
      designProperties.color ||
      moduleWithDesign.color ||
      buttonModule.text_color ||
      moduleWithDesign.text_color ||
      'white';

    const fontWeight = designProperties.font_weight || moduleWithDesign.font_weight || '500';
    const fontFamily = designProperties.font_family || moduleWithDesign.font_family || 'inherit';
    const fontStyle = designProperties.font_style || moduleWithDesign.font_style || 'normal';
    const textTransform =
      designProperties.text_transform || moduleWithDesign.text_transform || 'none';
    const letterSpacingRaw =
      designProperties.letter_spacing || moduleWithDesign.letter_spacing || undefined;
    const letterSpacing =
      letterSpacingRaw !== undefined &&
      letterSpacingRaw !== null &&
      `${letterSpacingRaw}`.trim() !== ''
        ? `${letterSpacingRaw}`
        : undefined;
    const lineHeightRaw = designProperties.line_height || moduleWithDesign.line_height;
    const lineHeight =
      lineHeightRaw !== undefined && lineHeightRaw !== null && `${lineHeightRaw}`.trim() !== ''
        ? `${lineHeightRaw}`
        : undefined;

    const moduleAlignment = buttonModule.alignment || 'center';
    const containerJustify = this.getFlexJustify(moduleAlignment);

    const textAlignValue =
      designProperties.text_align || moduleWithDesign.text_align || moduleAlignment;
    const contentJustify = this.getFlexJustify(textAlignValue, true);

    const textShadow = this.resolveTextShadow(designProperties, moduleWithDesign);

    const styleClass = buttonModule.style || 'flat';

    const baseButtonStyle: Record<string, string> = {
      color: textColor,
      padding: '12px 24px',
      fontSize,
      fontWeight: String(fontWeight),
      fontFamily,
      fontStyle,
      textTransform,
      borderRadius:
        this.addPixelUnit(designProperties.border_radius || moduleWithDesign.border_radius) ||
        '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: contentJustify,
      gap: '8px',
      minHeight: '40px',
      textShadow,
    };

    if (letterSpacing) {
      baseButtonStyle.letterSpacing = letterSpacing;
    }

    if (lineHeight) {
      baseButtonStyle.lineHeight = lineHeight;
    }

    const styleOverrides: Record<string, Record<string, string>> = {
      flat: {
        background: backgroundColor,
        border: 'none',
        boxShadow: 'none',
      },
      glossy: {
        background: `linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0)), ${backgroundColor}`,
        border: 'none',
      },
      embossed: {
        background: backgroundColor,
        border: '1px solid rgba(0,0,0,0.15)',
        boxShadow: 'inset 0 2px 2px rgba(255,255,255,0.2), inset 0 -2px 2px rgba(0,0,0,0.15)',
      },
      inset: {
        background: backgroundColor,
        border: 'none',
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.35)',
      },
      'gradient-overlay': {
        background: `linear-gradient(135deg, rgba(255,255,255,0.15), rgba(0,0,0,0.15)), ${backgroundColor}`,
        border: 'none',
      },
      'neon-glow': {
        background: backgroundColor,
        border: 'none',
        boxShadow: `0 0 10px ${backgroundColor}, 0 0 20px ${backgroundColor}`,
      },
      outline: {
        background: 'transparent',
        border: `2px solid ${backgroundColor}`,
      },
      glass: {
        background: backgroundColor,
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,0.25)',
      },
      metallic: {
        background: 'linear-gradient(90deg, #d7d7d7, #f0f0f0 50%, #d7d7d7)',
        border: '1px solid #bbb',
      },
    };

    if (!hasCustomTextColor) {
      styleOverrides.outline.color = backgroundColor;
      styleOverrides.metallic.color = '#333';
    }

    const mergedButtonStyle: Record<string, string> = {
      ...baseButtonStyle,
      ...(styleOverrides[styleClass] || styleOverrides.flat),
    };

    const dimensions = [
      ['width', designProperties.width ?? moduleWithDesign.width],
      ['height', designProperties.height ?? moduleWithDesign.height],
      ['maxWidth', designProperties.max_width ?? moduleWithDesign.max_width],
      ['maxHeight', designProperties.max_height ?? moduleWithDesign.max_height],
      ['minWidth', designProperties.min_width ?? moduleWithDesign.min_width],
      ['minHeight', designProperties.min_height ?? moduleWithDesign.min_height],
    ] as Array<[string, unknown]>;

    dimensions.forEach(([key, value]) => {
      const normalized = this.addPixelUnit(value as string | number | undefined | null);
      if (normalized) {
        mergedButtonStyle[key] = normalized;
      }
    });

    if (!mergedButtonStyle.width && moduleAlignment === 'justify') {
      mergedButtonStyle.width = '100%';
    }

    const alignmentStyles: Record<string, string> = {
      display: 'flex',
      justifyContent: containerJustify,
      alignItems: 'center',
      width: '100%',
    };

    const paddingTop = this.addPixelUnit(
      designProperties.padding_top || moduleWithDesign.padding_top
    );
    const paddingRight = this.addPixelUnit(
      designProperties.padding_right || moduleWithDesign.padding_right
    );
    const paddingBottom = this.addPixelUnit(
      designProperties.padding_bottom || moduleWithDesign.padding_bottom
    );
    const paddingLeft = this.addPixelUnit(
      designProperties.padding_left || moduleWithDesign.padding_left
    );
    const hasPadding = paddingTop || paddingRight || paddingBottom || paddingLeft;

    const marginTop = this.addPixelUnit(designProperties.margin_top || moduleWithDesign.margin_top);
    const marginRight = this.addPixelUnit(
      designProperties.margin_right || moduleWithDesign.margin_right
    );
    const marginBottom = this.addPixelUnit(
      designProperties.margin_bottom || moduleWithDesign.margin_bottom
    );
    const marginLeft = this.addPixelUnit(
      designProperties.margin_left || moduleWithDesign.margin_left
    );
    const hasMargin = marginTop || marginRight || marginBottom || marginLeft;

    const containerStyles = {
      width: '100%',
      height: 'auto',
      maxWidth: 'none',
      maxHeight: 'none',
      minWidth: 'auto',
      minHeight: 'auto',
      padding: hasPadding
        ? `${paddingTop || '0'} ${paddingRight || '0'} ${paddingBottom || '0'} ${paddingLeft || '0'}`
        : '0',
      margin: hasMargin
        ? `${marginTop || '0'} ${marginRight || '0'} ${marginBottom || '0'} ${marginLeft || '0'}`
        : '0',
      background: designProperties.background_color || 'transparent',
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
      borderRadius:
        this.addPixelUnit(designProperties.border_radius || moduleWithDesign.border_radius) ||
        '8px',
      border:
        designProperties.border_style && designProperties.border_style !== 'none'
          ? `${this.addPixelUnit(designProperties.border_width) || '1px'} ${designProperties.border_style} ${designProperties.border_color || 'var(--divider-color)'}`
          : 'none',
      boxShadow:
        designProperties.box_shadow_h ||
        designProperties.box_shadow_v ||
        designProperties.box_shadow_blur ||
        designProperties.box_shadow_spread
          ? `${this.addPixelUnit(designProperties.box_shadow_h) || '0px'} ${this.addPixelUnit(designProperties.box_shadow_v) || '0px'} ${this.addPixelUnit(designProperties.box_shadow_blur) || '0px'} ${this.addPixelUnit(designProperties.box_shadow_spread) || '0px'} ${designProperties.box_shadow_color || 'rgba(0,0,0,.2)'}`
          : 'none',
      boxSizing: 'border-box',
    } as Record<string, string>;

    // Create gesture handlers using centralized service
    const handlers = this.createGestureHandlers(
      buttonModule.id,
      {
        tap_action: buttonModule.tap_action,
        hold_action: buttonModule.hold_action,
        double_tap_action: buttonModule.double_tap_action,
        entity: (buttonModule as any).entity,
        module: buttonModule,
      },
      hass,
      config
    );

    const hoverEffect = (buttonModule as any).design?.hover_effect;
    const hoverEffectClass = this.getHoverEffectClass(module);
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));

    // Calculate icon size
    const iconSize = this.addPixelUnit(buttonModule.icon_size) || '24px';

    return this.wrapWithAnimation(
      html`
        <div
          class="button-module-container"
          style="${designStyles}; ${this.buildStyleString(containerStyles)}"
        >
          <div class="button-module-preview" style="${this.buildStyleString(alignmentStyles)}">
            <button
              class="ultra-button ${styleClass} ${moduleAlignment === 'justify'
                ? 'justify'
                : ''} ${hoverEffectClass}"
              style="${this.buildStyleString(mergedButtonStyle)}"
              aria-label="${(buttonModule.label || 'Button').trim() || 'Button'}"
              @pointerdown=${handlers.onPointerDown}
              @pointermove=${handlers.onPointerMove}
              @pointerup=${handlers.onPointerUp}
              @pointerleave=${handlers.onPointerLeave}
              @pointercancel=${handlers.onPointerCancel}
              @keydown=${handlers.onKeyDown}
            >
              ${buttonModule.show_icon &&
              buttonModule.icon &&
              buttonModule.icon_position === 'before'
                ? html`<ha-icon
                    icon="${buttonModule.icon}"
                    style="--mdc-icon-size: ${iconSize}; width: ${iconSize}; height: ${iconSize};"
                  ></ha-icon>`
                : ''}
              ${buttonModule.label ?? ''}
              ${buttonModule.show_icon &&
              buttonModule.icon &&
              buttonModule.icon_position === 'after'
                ? html`<ha-icon
                    icon="${buttonModule.icon}"
                    style="--mdc-icon-size: ${iconSize}; width: ${iconSize}; height: ${iconSize};"
                  ></ha-icon>`
                : ''}
            </button>
          </div>
        </div>
      `,
      module,
      hass
    );
  }

  private styleObjectToCss(styles: Record<string, string | number>): string {
    return Object.entries(styles)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');
  }

  private getFlexJustify(
    alignment: string | undefined,
    allowSpaceBetween: boolean = false
  ): string {
    switch (alignment) {
      case 'left':
        return 'flex-start';
      case 'right':
        return 'flex-end';
      case 'justify':
        return allowSpaceBetween ? 'space-between' : 'center';
      default:
        return 'center';
    }
  }

  private resolveTextShadow(
    design: Record<string, any>,
    moduleWithDesign: Record<string, any>
  ): string {
    const designHasShadow = [
      'text_shadow_h',
      'text_shadow_v',
      'text_shadow_blur',
      'text_shadow_color',
    ].some(key => {
      const value = design[key];
      return value !== undefined && value !== null && `${value}`.trim() !== '';
    });

    if (designHasShadow) {
      return `${this.addPixelUnit(design.text_shadow_h) || '0px'} ${this.addPixelUnit(design.text_shadow_v) || '0px'} ${this.addPixelUnit(design.text_shadow_blur) || '0px'} ${design.text_shadow_color || 'rgba(0,0,0,.2)'}`;
    }

    const moduleHasShadow = [
      'text_shadow_h',
      'text_shadow_v',
      'text_shadow_blur',
      'text_shadow_color',
    ].some(key => {
      const value = moduleWithDesign[key];
      return value !== undefined && value !== null && `${value}`.trim() !== '';
    });

    if (moduleHasShadow) {
      return `${this.addPixelUnit(moduleWithDesign.text_shadow_h) || '0px'} ${this.addPixelUnit(moduleWithDesign.text_shadow_v) || '0px'} ${this.addPixelUnit(moduleWithDesign.text_shadow_blur) || '0px'} ${moduleWithDesign.text_shadow_color || 'rgba(0,0,0,.2)'}`;
    }

    return 'none';
  }

  private addPixelUnit(value: string | number | undefined | null): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    const str = String(value).trim();
    if (!str) {
      return undefined;
    }

    if (/^-?\d+(?:\.\d+)?$/.test(str)) {
      return `${str}px`;
    }

    if (/^(?:-?\d+(?:\.\d+)?\s+)+-?\d+(?:\.\d+)?$/.test(str)) {
      return str
        .split(/\s+/)
        .map(part => (/^-?\d+(?:\.\d+)?$/.test(part) ? `${part}px` : part))
        .join(' ');
    }

    return str;
  }

  // Trigger preview update for reactive UI

  /**
   * Look up a state color, tolerating numeric states ("20" matches "20.0")
   */
  private matchStateColor(
    stateColors: { [state: string]: string },
    state: string
  ): string | undefined {
    if (stateColors[state] !== undefined) {
      return stateColors[state];
    }
    // Numeric-tolerant comparison so e.g. "20.0" matches a "20" mapping
    const toNumber = (value: string): number | null => {
      const trimmed = value.trim();
      if (trimmed === '') return null;
      const num = Number(trimmed);
      return Number.isFinite(num) ? num : null;
    };
    const stateNum = toNumber(state);
    const stateLower = state.trim().toLowerCase();
    for (const [key, color] of Object.entries(stateColors)) {
      const keyNum = toNumber(key);
      if (stateNum !== null && keyNum !== null) {
        if (keyNum === stateNum) {
          return color;
        }
      } else if (key.trim().toLowerCase() === stateLower) {
        return color;
      }
    }
    return undefined;
  }

  /**
   * Extract color from entity state attributes
   */
  private getEntityStateColor(entityState: any): string | null {
    if (!entityState || !entityState.attributes) return null;

    // Check for RGB color attributes (most common for lights)
    if (entityState.attributes.rgb_color && Array.isArray(entityState.attributes.rgb_color)) {
      return `rgb(${entityState.attributes.rgb_color.join(',')})`;
    }

    // Check for HS color attributes and convert to RGB
    if (entityState.attributes.hs_color && Array.isArray(entityState.attributes.hs_color)) {
      const [h, s] = entityState.attributes.hs_color;
      const rgb = this.hsToRgb(h / 360, s / 100, 1);
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
      const state = entityState.state;

      switch (domain) {
        case 'light':
          return state === 'on' ? '#FFA500' : '#666666'; // Orange when on, gray when off
        case 'switch':
          return state === 'on' ? '#4CAF50' : '#666666'; // Green when on, gray when off
        case 'binary_sensor':
          return state === 'on' ? '#F44336' : '#4CAF50'; // Red when on, green when off
        default:
          return state === 'on' || state === 'open' || state === 'active'
            ? 'var(--primary-color)'
            : '#666666';
      }
    }

    return null;
  }

  /**
   * Convert HSV to RGB
   */
  private hsToRgb(h: number, s: number, v: number): number[] {
    let r: number, g: number, b: number;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0:
        ((r = v), (g = t), (b = p));
        break;
      case 1:
        ((r = q), (g = v), (b = p));
        break;
      case 2:
        ((r = p), (g = v), (b = t));
        break;
      case 3:
        ((r = p), (g = q), (b = v));
        break;
      case 4:
        ((r = t), (g = p), (b = v));
        break;
      case 5:
        ((r = v), (g = p), (b = q));
        break;
      default:
        ((r = 0), (g = 0), (b = 0));
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  // Resolve background images from global design (upload/url/entity)
  private getBackgroundImageCSS(
    moduleWithDesign: any,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): string {
    const imageType = moduleWithDesign.background_image_type;
    const backgroundImage = moduleWithDesign.background_image;
    const backgroundEntity = moduleWithDesign.background_image_entity;

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
          const resolvedEntity = this.resolveEntity(backgroundEntity, config) || backgroundEntity;
          const entityState = hass.states[resolvedEntity];
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

  // Explicit Logic tab renderer (some editors call this directly)
  renderLogicTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as any, hass, updates => updateModule(updates));
  }

  getStyles(): string {
    return `
      /* State color editor styles */
      .state-color-editor {
        width: 100%;
      }

      .state-color-row {
        width: 100%;
        min-width: 0;
        overflow: hidden;
      }

      .state-color-row ultra-color-picker {
        min-width: 0;
        flex: 1;
      }

      ${BaseUltraModule.getSliderStyles()}
    `;
  }
}
