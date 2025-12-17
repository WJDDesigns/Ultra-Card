import { TemplateResult, html, css } from 'lit';
import { ref, createRef, Ref } from 'lit/directives/ref.js';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig, SliderModule } from '../types';
import { UltraLinkComponent } from '../components/ultra-link';
import { getImageUrl } from '../utils/image-upload';
import { getModuleRegistry } from './module-registry';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { localize } from '../localize/localize';
import { logicService } from '../services/logic-service';
import '../components/ultra-color-picker';
import Swiper from 'swiper';
import {
  Navigation,
  Pagination,
  Autoplay,
  Keyboard,
  Mousewheel,
  EffectFade,
  Scrollbar,
} from 'swiper/modules';

// Register Swiper modules globally (only slide and fade effects supported)
Swiper.use([
  Navigation,
  Pagination,
  Autoplay,
  Keyboard,
  Mousewheel,
  EffectFade,
  Scrollbar,
]);
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/scrollbar';

// Swiper instance manager for slider instances
class SwiperInstanceManager {
  private static instances = new Map<string, Swiper>();

  static getInstance(sliderId: string): Swiper | undefined {
    return this.instances.get(sliderId);
  }

  static setInstance(sliderId: string, instance: Swiper): void {
    this.instances.set(sliderId, instance);
  }

  static destroyInstance(sliderId: string): void {
    const instance = this.instances.get(sliderId);
    if (instance) {
      try {
        // Clean up ResizeObserver if it exists
        const element = instance.el as HTMLElement;
        if (element && (element as any)._swiperResizeObserver) {
          (element as any)._swiperResizeObserver.disconnect();
          delete (element as any)._swiperResizeObserver;
        }
        instance.destroy(true, true);
      } catch (e) {
        // Ignore errors during cleanup
      }
      this.instances.delete(sliderId);
    }
  }

  static cleanup(sliderId: string): void {
    this.destroyInstance(sliderId);
  }
}

export class UltraSliderModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'slider',
    title: 'Slider Layout',
    description: 'Create interactive slideshows with multiple pages of modules',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:view-carousel',
    category: 'layout',
    tags: ['layout', 'slider', 'carousel', 'slideshow', 'pages', 'swipe'],
  };

  createDefault(id?: string, hass?: HomeAssistant): SliderModule {
    const registry = getModuleRegistry();
    const pageBreakHandler = registry.getModule('pagebreak');

    // Create an initial page break to help users understand the concept
    const initialPageBreak = pageBreakHandler?.createDefault(
      this.generateId('pagebreak'),
      hass
    ) || {
      id: this.generateId('pagebreak'),
      type: 'pagebreak' as const,
      display_mode: 'always' as const,
      display_conditions: [],
    };

    return {
      id: id || this.generateId('slider'),
      type: 'slider',
      modules: [initialPageBreak], // Start with one page break to show users how it works
      // Pagination defaults
      show_pagination: true,
      pagination_style: 'dots',
      pagination_position: undefined,
      pagination_color: 'var(--primary-text-color)',
      pagination_active_color: 'var(--primary-color)',
      pagination_size: 12,
      pagination_overlay: false, // Default to non-overlay mode (pagination gets its own space)
      // Navigation defaults
      show_arrows: true,
      arrow_position_offset: 0,
      arrow_style: 'circle',
      arrow_size: 40,
      arrow_color: 'var(--primary-text-color)',
      arrow_background_color: 'rgba(0, 0, 0, 0.3)',
      prev_arrow_icon: 'mdi:chevron-left',
      next_arrow_icon: 'mdi:chevron-right',
      arrows_always_visible: false,
      // Transition defaults
      transition_effect: 'slide',
      transition_speed: 300,
      // Layout defaults
      slider_direction: 'horizontal',
      centered_slides: true, // Enabled by default
      // Auto-play defaults
      auto_play: false,
      auto_play_delay: 3000,
      pause_on_hover: true,
      loop: true,
      // Interaction defaults
      allow_swipe: true,
      allow_keyboard: true,
      allow_mousewheel: false,
      // Layout defaults
      auto_height: true,
      slider_height: 300,
      slider_width: '100%',
      gap: 0,
      slides_per_view: 1,
      space_between: 0,
      vertical_alignment: 'top',
      // Global action configuration
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      // Logic (visibility) defaults
      display_mode: 'always',
      display_conditions: [],
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const sliderModule = module as SliderModule;
    const lang = hass?.locale?.language || 'en';

    // Count pages (separated by pagebreak modules)
    const pageBreakCount = sliderModule.modules.filter(m => m.type === 'pagebreak').length;
    const pageCount = pageBreakCount + 1;
    const totalModules = sliderModule.modules.filter(m => m.type !== 'pagebreak').length;

    return html`
      <div class="slider-general-tab">
        ${this.injectUcFormStyles()}
        <style>
          .slider-general-tab {
            padding: 8px;
          }
          .inline-toggle {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
            padding-bottom: 0;
            border-bottom: none;
          }
          .inline-toggle .section-title {
            font-size: 18px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--primary-color);
            letter-spacing: 0.5px;
            margin-bottom: 0;
          }
          .preview-note {
            background: var(--info-color, #2196f3);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            font-size: 14px;
            line-height: 1.5;
          }
          .preview-note ha-icon {
            flex-shrink: 0;
            margin-top: 2px;
          }
        </style>

        <!-- Preview Note -->
        <div class="preview-note">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <div>
            <strong>Note:</strong> Slider transitions may not appear in the Home Assistant
            Configuration Preview Window. To see transitions, check the
            <strong>Live Preview</strong> popup in the editor or view the card on your dashboard.
          </div>
        </div>

        <!-- SLIDER LAYOUT -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            SLIDER LAYOUT
          </div>

          ${this.renderFieldSection(
            'Layout Direction',
            'Horizontal or vertical slider orientation',
            hass,
            { slider_direction: sliderModule.slider_direction || 'horizontal' },
            [
              this.selectField('slider_direction', [
                { value: 'horizontal', label: 'Horizontal' },
                { value: 'vertical', label: 'Vertical' },
              ]),
            ],
            (e: CustomEvent) => {
              const newDirection = e.detail.value.slider_direction;
              const updates: any = { slider_direction: newDirection };

              // Auto-update pagination position based on direction
              const currentPosition = sliderModule.pagination_position;
              if (newDirection === 'vertical') {
                // If switching to vertical and position is horizontal-only, switch to right
                if (currentPosition === 'top' || currentPosition === 'bottom') {
                  updates.pagination_position = 'right';
                } else if (!currentPosition) {
                  updates.pagination_position = 'right';
                }
              } else {
                // If switching to horizontal and position is vertical-only, switch to bottom
                if (currentPosition === 'left' || currentPosition === 'right') {
                  updates.pagination_position = 'bottom';
                } else if (!currentPosition) {
                  updates.pagination_position = 'bottom';
                }
              }

              // Auto-update icons if using default horizontal icons
              if (newDirection === 'vertical') {
                if (
                  !sliderModule.prev_arrow_icon ||
                  sliderModule.prev_arrow_icon === 'mdi:chevron-left'
                ) {
                  updates.prev_arrow_icon = 'mdi:chevron-up';
                }
                if (
                  !sliderModule.next_arrow_icon ||
                  sliderModule.next_arrow_icon === 'mdi:chevron-right'
                ) {
                  updates.next_arrow_icon = 'mdi:chevron-down';
                }
              } else {
                if (
                  !sliderModule.prev_arrow_icon ||
                  sliderModule.prev_arrow_icon === 'mdi:chevron-up'
                ) {
                  updates.prev_arrow_icon = 'mdi:chevron-left';
                }
                if (
                  !sliderModule.next_arrow_icon ||
                  sliderModule.next_arrow_icon === 'mdi:chevron-down'
                ) {
                  updates.next_arrow_icon = 'mdi:chevron-right';
                }
              }

              updateModule(updates);
            }
          )}

          ${(sliderModule.slides_per_view || 1) > 1
            ? html`
                <div
                  class="field-row"
                  style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--secondary-background-color); border-radius: 8px; margin-bottom: 12px;"
                >
                  <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">Center Slider</div>
                    <div style="font-size: 12px; color: var(--secondary-text-color); line-height: 1.4;">
                      Center active slide in the viewport (only available when Slides Per View > 1)
                    </div>
                  </div>
                  <ha-switch
                    .checked=${sliderModule.centered_slides ?? true}
                    @change=${(e: Event) => {
                      const target = e.target as any;
                      updateModule({ centered_slides: target.checked });
                    }}
                  ></ha-switch>
                </div>
              `
            : ''}

          <div style="margin-bottom: 16px;">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
              Slider Width
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
            >
              Width of the slider container (e.g., 100%, 400px)
            </div>
            <ha-textfield
              .value=${sliderModule.slider_width || '100%'}
              placeholder="100%"
              @input=${(e: Event) => {
                const target = e.target as any;
                const input = target.shadowRoot?.querySelector('input') || target;
                const value = target.value;
                const cursorPosition = input.selectionStart;
                const cursorEnd = input.selectionEnd;

                updateModule({ slider_width: value });

                requestAnimationFrame(() => {
                  if (input && typeof cursorPosition === 'number') {
                    target.value = value;
                    input.value = value;
                    input.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
                  }
                });
                setTimeout(() => {
                  if (input && typeof cursorPosition === 'number') {
                    target.value = value;
                    input.value = value;
                    input.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
                  }
                }, 0);
                setTimeout(() => {
                  if (input && typeof cursorPosition === 'number') {
                    target.value = value;
                    input.value = value;
                    input.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
                  }
                }, 10);
              }}
              style="width: 100%; --mdc-theme-primary: var(--primary-color);"
            ></ha-textfield>
          </div>

          <div
            class="field-row"
            style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--secondary-background-color); border-radius: 8px; margin-bottom: 12px;"
          >
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 4px;">Auto Height</div>
              <div style="font-size: 12px; color: var(--secondary-text-color); line-height: 1.4;">
                Automatically adjust slider height to fit content on each page
              </div>
            </div>
            <ha-switch
              .checked=${sliderModule.auto_height ?? true}
              @change=${(e: Event) => {
                const target = e.target as any;
                updateModule({ auto_height: target.checked });
              }}
            ></ha-switch>
          </div>

          ${!(sliderModule.auto_height ?? true)
            ? this.renderFieldSection(
                'Slider Height',
                'Fixed height for the slider in pixels',
                hass,
                { slider_height: sliderModule.slider_height || 300 },
                [this.numberField('slider_height', 50, 1000, 10)],
                (e: CustomEvent) => updateModule({ slider_height: e.detail.value.slider_height })
              )
            : ''}
          ${this.renderFieldSection(
            'Slides Per View',
            'Number of slides visible at once',
            hass,
            { slides_per_view: sliderModule.slides_per_view || 1 },
            [this.numberField('slides_per_view', 1, 10, 1)],
            (e: CustomEvent) => updateModule({ slides_per_view: e.detail.value.slides_per_view })
          )}
          ${this.renderFieldSection(
            'Space Between',
            'Space between slides in pixels',
            hass,
            { space_between: sliderModule.space_between || 0 },
            [this.numberField('space_between', 0, 100, 5)],
            (e: CustomEvent) => updateModule({ space_between: e.detail.value.space_between })
          )}
          ${(sliderModule.slides_per_view || 1) > 1
            ? this.renderFieldSection(
                'Vertical Alignment',
                'Vertical alignment of content within slides',
                hass,
                { vertical_alignment: sliderModule.vertical_alignment || 'top' },
                [
                  this.selectField('vertical_alignment', [
                    { value: 'top', label: 'Top' },
                    { value: 'center', label: 'Center' },
                    { value: 'bottom', label: 'Bottom' },
                    { value: 'stretch', label: 'Stretch' },
                  ]),
                ],
                (e: CustomEvent) =>
                  updateModule({ vertical_alignment: e.detail.value.vertical_alignment })
              )
            : ''}
        </div>

        <!-- PAGINATION -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div class="inline-toggle">
            <div class="section-title">PAGINATION</div>
            <ha-switch
              .checked=${sliderModule.show_pagination ?? true}
              @change=${(e: Event) => {
                const target = e.target as any;
                updateModule({ show_pagination: target.checked });
              }}
            ></ha-switch>
          </div>

          ${sliderModule.show_pagination
            ? html`
                ${this.renderFieldSection(
                  'Pagination Style',
                  'How pagination indicators are displayed',
                  hass,
                  { pagination_style: sliderModule.pagination_style || 'dots' },
                  [
                    this.selectField('pagination_style', [
                      { value: 'dots', label: 'Dots' },
                      { value: 'dots-and-dash', label: 'Dots and Dash' },
                      { value: 'dash-lines', label: 'Dash Lines' },
                      { value: 'numbers', label: 'Numbers' },
                      { value: 'fraction', label: 'Fraction (1/5)' },
                      { value: 'progressbar', label: 'Progress' },
                      { value: 'scrollbar', label: 'Scrollbar' },
                      { value: 'dynamic', label: 'Dynamic' },
                    ]),
                  ],
                  (e: CustomEvent) =>
                    updateModule({ pagination_style: e.detail.value.pagination_style })
                )}
                ${(sliderModule.auto_height ?? true)
                  ? html`
                      <div
                        class="field-row"
                        style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--secondary-background-color); border-radius: 8px; margin-bottom: 12px;"
                      >
                        <div style="flex: 1;">
                          <div style="font-weight: 600; margin-bottom: 4px;">
                            Pagination Overlay
                          </div>
                          <div
                            style="font-size: 12px; color: var(--secondary-text-color); line-height: 1.4;"
                          >
                            When enabled, pagination overlays content. When disabled, pagination
                            gets its own space.
                          </div>
                        </div>
                        <ha-switch
                          .checked=${sliderModule.pagination_overlay ?? false}
                          @change=${(e: Event) => {
                            const target = e.target as any;
                            updateModule({ pagination_overlay: target.checked });
                          }}
                        ></ha-switch>
                      </div>
                    `
                  : ''}
                ${this.renderFieldSection(
                  'Pagination Position',
                  'Where to show pagination indicators',
                  hass,
                  { pagination_position: sliderModule.pagination_position || (sliderModule.slider_direction === 'vertical' ? 'right' : 'bottom') },
                  [
                    this.selectField('pagination_position', [
                      ...(sliderModule.slider_direction === 'vertical'
                        ? [
                            { value: 'left', label: 'Left' },
                            { value: 'right', label: 'Right' },
                          ]
                        : [
                            { value: 'top', label: 'Top' },
                            { value: 'bottom', label: 'Bottom' },
                          ]),
                    ]),
                  ],
                  (e: CustomEvent) =>
                    updateModule({ pagination_position: e.detail.value.pagination_position })
                )}
                ${this.renderFieldSection(
                  'Pagination Size',
                  'Size of pagination indicators in pixels',
                  hass,
                  { pagination_size: sliderModule.pagination_size || 12 },
                  [this.numberField('pagination_size', 6, 30, 1)],
                  (e: CustomEvent) =>
                    updateModule({ pagination_size: e.detail.value.pagination_size })
                )}
                <div style="margin-bottom: 16px;">
                  <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">
                    Pagination Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Color of inactive pagination indicators
                  </div>
                  <ultra-color-picker
                    .label=${'Pagination Color'}
                    .value=${sliderModule.pagination_color || 'var(--primary-text-color)'}
                    .defaultValue=${'var(--primary-text-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ pagination_color: e.detail.value })}
                  ></ultra-color-picker>
                </div>
                <div style="margin-bottom: 16px;">
                  <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">
                    Active Pagination Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Color of the active pagination indicator
                  </div>
                  <ultra-color-picker
                    .label=${'Active Pagination Color'}
                    .value=${sliderModule.pagination_active_color || 'var(--primary-color)'}
                    .defaultValue=${'var(--primary-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ pagination_active_color: e.detail.value })}
                  ></ultra-color-picker>
                </div>
              `
            : ''}
        </div>

        <!-- NAVIGATION ARROWS -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div class="inline-toggle">
            <div class="section-title">NAVIGATION ARROWS</div>
            <ha-switch
              .checked=${sliderModule.show_arrows ?? true}
              @change=${(e: Event) => {
                const target = e.target as any;
                updateModule({ show_arrows: target.checked });
              }}
            ></ha-switch>
          </div>

          ${sliderModule.show_arrows
            ? html`
                <div
                  style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; padding: 12px; background: var(--secondary-background-color); border-radius: 8px;"
                >
                  <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">Arrows Always Visible</div>
                    <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
                      Keep arrows visible (otherwise show on hover)
                    </div>
                  </div>
                  <ha-switch
                    .checked=${sliderModule.arrows_always_visible || false}
                    @change=${(e: Event) => {
                      const target = e.target as any;
                      updateModule({ arrows_always_visible: target.checked });
                    }}
                  ></ha-switch>
                </div>
                ${this.renderFieldSection(
                  'Arrow Position Offset',
                  'Offset arrows position: positive = more inside, negative = more outside (in pixels)',
                  hass,
                  { arrow_position_offset: sliderModule.arrow_position_offset || 0 },
                  [this.numberField('arrow_position_offset', -100, 100, 5)],
                  (e: CustomEvent) =>
                    updateModule({ arrow_position_offset: e.detail.value.arrow_position_offset })
                )}
                <div style="margin-bottom: 16px;">
                  <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">
                    Arrow Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Color of the arrow icons
                  </div>
                  <ultra-color-picker
                    .label=${'Arrow Color'}
                    .value=${sliderModule.arrow_color || 'var(--primary-text-color)'}
                    .defaultValue=${'var(--primary-text-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ arrow_color: e.detail.value })}
                  ></ultra-color-picker>
                </div>
                <div style="margin-bottom: 16px;">
                  <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">
                    Arrow Background Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Background color of the arrow buttons (not used for minimal style)
                  </div>
                  <ultra-color-picker
                    .label=${'Arrow Background Color'}
                    .value=${sliderModule.arrow_background_color || 'rgba(0, 0, 0, 0.3)'}
                    .defaultValue=${'rgba(0, 0, 0, 0.3)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ arrow_background_color: e.detail.value })}
                  ></ultra-color-picker>
                </div>
                ${this.renderFieldSection(
                  'Arrow Style',
                  'Visual style of the arrows',
                  hass,
                  { arrow_style: sliderModule.arrow_style || 'circle' },
                  [
                    this.selectField('arrow_style', [
                      { value: 'default', label: 'Default' },
                      { value: 'circle', label: 'Circle' },
                      { value: 'square', label: 'Square' },
                      { value: 'minimal', label: 'Minimal' },
                    ]),
                  ],
                  (e: CustomEvent) => updateModule({ arrow_style: e.detail.value.arrow_style })
                )}
                ${this.renderFieldSection(
                  'Arrow Size',
                  'Size of navigation arrows in pixels',
                  hass,
                  { arrow_size: sliderModule.arrow_size || 40 },
                  [this.numberField('arrow_size', 20, 80, 5)],
                  (e: CustomEvent) => updateModule({ arrow_size: e.detail.value.arrow_size })
                )}
                ${this.renderFieldSection(
                  'Previous Arrow Icon',
                  'Icon for the previous arrow',
                  hass,
                  {
                    prev_arrow_icon:
                      sliderModule.prev_arrow_icon ||
                      (sliderModule.slider_direction === 'vertical'
                        ? 'mdi:chevron-up'
                        : 'mdi:chevron-left'),
                  },
                  [this.iconField('prev_arrow_icon')],
                  (e: CustomEvent) =>
                    updateModule({ prev_arrow_icon: e.detail.value.prev_arrow_icon })
                )}
                ${this.renderFieldSection(
                  'Next Arrow Icon',
                  'Icon for the next arrow',
                  hass,
                  {
                    next_arrow_icon:
                      sliderModule.next_arrow_icon ||
                      (sliderModule.slider_direction === 'vertical'
                        ? 'mdi:chevron-down'
                        : 'mdi:chevron-right'),
                  },
                  [this.iconField('next_arrow_icon')],
                  (e: CustomEvent) =>
                    updateModule({ next_arrow_icon: e.detail.value.next_arrow_icon })
                )}
              `
            : ''}
        </div>

        <!-- TRANSITION & ANIMATION -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            TRANSITION & ANIMATION
          </div>

          ${this.renderFieldSection(
            'Transition Effect',
            'Animation style between slides',
            hass,
            { transition_effect: sliderModule.transition_effect || 'slide' },
            [
              this.selectField('transition_effect', [
                { value: 'slide', label: 'Slide' },
                { value: 'fade', label: 'Fade' },
              ]),
            ],
            (e: CustomEvent) =>
              updateModule({ transition_effect: e.detail.value.transition_effect })
          )}
          ${this.renderFieldSection(
            'Transition Speed',
            'Transition duration in milliseconds',
            hass,
            { transition_speed: sliderModule.transition_speed || 300 },
            [this.numberField('transition_speed', 100, 2000, 50)],
            (e: CustomEvent) => updateModule({ transition_speed: e.detail.value.transition_speed })
          )}
        </div>

        <!-- AUTO-PLAY -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div class="inline-toggle">
            <div class="section-title">AUTO-PLAY</div>
            <ha-switch
              .checked=${sliderModule.auto_play || false}
              @change=${(e: Event) => {
                const target = e.target as any;
                updateModule({ auto_play: target.checked });
              }}
            ></ha-switch>
          </div>

          ${sliderModule.auto_play
            ? html`
                ${this.renderFieldSection(
                  'Auto-play Delay',
                  'Time between slides in milliseconds',
                  hass,
                  { auto_play_delay: sliderModule.auto_play_delay || 3000 },
                  [this.numberField('auto_play_delay', 1000, 10000, 500)],
                  (e: CustomEvent) =>
                    updateModule({ auto_play_delay: e.detail.value.auto_play_delay })
                )}
                <div
                  style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
                >
                  <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">Pause on Hover</div>
                    <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
                      Pause auto-play when hovering over slider
                    </div>
                  </div>
                  <ha-switch
                    .checked=${sliderModule.pause_on_hover ?? true}
                    @change=${(e: Event) => {
                      const target = e.target as any;
                      updateModule({ pause_on_hover: target.checked });
                    }}
                  ></ha-switch>
                </div>
              `
            : ''}
          <div
            style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
          >
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 4px;">Loop</div>
              <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
                Return to first slide after the last
              </div>
            </div>
            <ha-switch
              .checked=${sliderModule.loop ?? true}
              @change=${(e: Event) => {
                const target = e.target as any;
                updateModule({ loop: target.checked });
              }}
            ></ha-switch>
          </div>
        </div>

        <!-- INTERACTION -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            INTERACTION
          </div>

          <div
            style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
          >
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 4px;">Allow Swipe</div>
              <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
                Enable touch/swipe gestures
              </div>
            </div>
            <ha-switch
              .checked=${sliderModule.allow_swipe ?? true}
              @change=${(e: Event) => {
                const target = e.target as any;
                updateModule({ allow_swipe: target.checked });
              }}
            ></ha-switch>
          </div>
          <div
            style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
          >
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 4px;">Allow Keyboard</div>
              <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
                Navigate with arrow keys
              </div>
            </div>
            <ha-switch
              .checked=${sliderModule.allow_keyboard ?? true}
              @change=${(e: Event) => {
                const target = e.target as any;
                updateModule({ allow_keyboard: target.checked });
              }}
            ></ha-switch>
          </div>
          <div
            style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
          >
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 4px;">Allow Mousewheel</div>
              <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
                Navigate with mouse wheel
              </div>
            </div>
            <ha-switch
              .checked=${sliderModule.allow_mousewheel || false}
              @change=${(e: Event) => {
                const target = e.target as any;
                updateModule({ allow_mousewheel: target.checked });
              }}
            ></ha-switch>
          </div>
        </div>

      </div>
    `;
  }

  renderLogicTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module, hass, updateModule);
  }

  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const sliderModule = module as SliderModule;

    return html`
      <div class="actions-tab">
        ${this.injectUcFormStyles()}
        <style>
          .actions-tab {
            padding: 8px;
          }
        </style>

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            LINK CONFIGURATION
          </div>

          ${UltraLinkComponent.render(
            hass,
            {
              tap_action: sliderModule.tap_action || { action: 'nothing' },
              hold_action: sliderModule.hold_action || { action: 'nothing' },
              double_tap_action: sliderModule.double_tap_action || { action: 'nothing' },
            },
            (updates: any) => {
              const moduleUpdates: Partial<SliderModule> = {};
              if (updates.tap_action) moduleUpdates.tap_action = updates.tap_action;
              if (updates.hold_action) moduleUpdates.hold_action = updates.hold_action;
              if (updates.double_tap_action)
                moduleUpdates.double_tap_action = updates.double_tap_action;
              updateModule(moduleUpdates);
            },
            'Link Configuration'
          )}
        </div>
      </div>
    `;
  }

  // Split preview for module settings popup - same as regular preview
  renderSplitPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
    // Use the same config object structure
    const config = { layout: { rows: [] } } as UltraCardConfig;
    return this.renderPreview(module, hass, config, 'live');
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const sliderModule = module as SliderModule;
    const registry = getModuleRegistry();


    // Group modules by page breaks
    const pages: CardModule[][] = [];
    let currentPageModules: CardModule[] = [];

    for (const childModule of sliderModule.modules) {
      if (childModule.type === 'pagebreak') {
        // Only push if we actually have content accumulated
        if (currentPageModules.length > 0) {
          pages.push([...currentPageModules]);
          currentPageModules = [];
        }
        continue;
      }

      // Regular module - add to current page
      currentPageModules.push(childModule);
    }

    // Push the final page if it has content. If no pages were created at all,
    // allow a single empty page so the "Slider is empty" message can render.
    if (currentPageModules.length > 0) {
      pages.push([...currentPageModules]);
    } else if (pages.length === 0) {
      pages.push([]);
    }

    // Ensure we have at least one page
    if (pages.length === 0 || (pages.length === 1 && pages[0].length === 0)) {
      return html`
        <div style="padding: 40px 20px; text-align: center; color: var(--secondary-text-color);">
          <ha-icon
            icon="mdi:view-carousel"
            style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"
          ></ha-icon>
          <div style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">Slider is empty</div>
          <div style="font-size: 14px; opacity: 0.8;">
            Drag modules here to add content.<br />
            Use <strong>Page Break</strong> modules to separate slides.
          </div>
        </div>
      `;
    }

    // In Live Preview, ensure we have at least one slide with content
    if (previewContext === 'live') {
      const hasContent = pages.some(page => page.length > 0);
      if (!hasContent) {
        return html`
          <div style="padding: 40px 20px; text-align: center; color: var(--secondary-text-color);">
            <ha-icon
              icon="mdi:view-carousel"
              style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"
            ></ha-icon>
            <div style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">
              No content in slider
            </div>
            <div style="font-size: 14px; opacity: 0.8;">
              Add modules to the slider to see content here.
            </div>
          </div>
        `;
      }
    }

    const sliderId = sliderModule.id;
    const uniqueClass = `swiper-${sliderId.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const dataAttr = `data-swiper-init-${sliderId}`;

    // Store initialization function globally so it can be called from the element
    if (typeof window !== 'undefined') {
      (window as any)[`initSwiper_${sliderId}`] = (element: HTMLElement) => {
        // Read context from element attribute, not closure
        const currentContext = element.getAttribute('data-preview-context') || 'dashboard';
        const existingInstance = SwiperInstanceManager.getInstance(sliderId);
        const elementSwiper = (element as any).swiper;
        // Get the context that was used when Swiper was initialized (if any)
        const initContext = element.getAttribute('data-swiper-init-context') || null;

        // Check if Swiper is already properly initialized and functional
        if ((existingInstance || elementSwiper) && !elementSwiper?.destroyed) {
          // Check if re-initialization needed due to context change
          if (initContext && initContext !== currentContext) {
            // Context changed - force re-init
            // Clean up old instance
            if (existingInstance) {
              SwiperInstanceManager.destroyInstance(sliderId);
            }
            if (elementSwiper) {
              elementSwiper.destroy(true, true);
              delete (element as any).swiper;
            }
            element.removeAttribute('data-swiper-initialized');
            element.removeAttribute('data-swiper-init-context');
            // Continue to initialization below
          } else if (initContext === currentContext) {
            // Already initialized and functional in same context
            return;
          }
        }

        // CRITICAL: Prevent multiple simultaneous initialization attempts
        if ((element as any)._swiperInitializing) {
          return;
        }
        (element as any)._swiperInitializing = true;

        // Store current context on element (for template rendering)
        element.setAttribute('data-preview-context', currentContext);

        // Preview contexts need more time for DOM to be ready
        const isPreview = currentContext === 'live' || currentContext === 'ha-preview';
        const initDelay = isPreview ? 100 : 0;
        const maxRetries = isPreview ? 10 : 2;
        let retryCount = 0;

        const attemptInit = () => {
          const containerElement = element.closest('.ultra-slider-container') as HTMLElement | null;
          const paginationSelector = `.swiper-pagination[data-slider-id="${sliderId}"]`;
          const scrollbarSelector = `.swiper-scrollbar[data-slider-id="${sliderId}"]`;
          const paginationEl = containerElement?.querySelector(paginationSelector) as HTMLElement | null;
          const scrollbarEl = containerElement?.querySelector(scrollbarSelector) as HTMLElement | null;
          const nextEl = element.querySelector('.swiper-button-next');
          const prevEl = element.querySelector('.swiper-button-prev');
          const slideCount = element.querySelectorAll('.swiper-slide').length;
          
          // CRITICAL: Check if container has dimensions before initializing
          // Get the ACTUAL container element (the .swiper element, not the .ultra-slider-container)
          const swiperElement = element;
          
          // For Live Preview, ensure we're measuring the correct container
          let containerWidth = swiperElement.offsetWidth;
          let containerHeight = swiperElement.offsetHeight;
          
          // CRITICAL FIX: If container width is absurdly large (likely measuring wrong element in Live Preview),
          // try to get the correct width from parent container or use a reasonable default
          // Lowered threshold to 2000 to catch widths like 15363px
          if (containerWidth > 2000 && currentContext === 'live') {
            // Try to get width from parent container
            if (containerElement) {
              const parentWidth = containerElement.offsetWidth;
              if (parentWidth > 0 && parentWidth < 2000) {
                containerWidth = parentWidth;
              } else {
                // Use computed style as fallback
                const computedWidth = parseInt(getComputedStyle(swiperElement).width) || 0;
                if (computedWidth > 0 && computedWidth < 2000) {
                  containerWidth = computedWidth;
                } else {
                  // Last resort: use window width as reasonable default
                  containerWidth = Math.min(window.innerWidth, 800);
                }
              }
            } else {
              // No parent container found, use window width as fallback
              containerWidth = Math.min(window.innerWidth, 800);
            }
            
            // Force the container to have a reasonable width BEFORE Swiper initializes
            swiperElement.style.maxWidth = `${containerWidth}px`;
            swiperElement.style.width = `${containerWidth}px`;
            if (containerElement) {
              containerElement.style.maxWidth = `${containerWidth}px`;
            }
          }

          if (slideCount === 0) {
            retryCount++;
            if (retryCount < maxRetries) {
              setTimeout(attemptInit, initDelay * retryCount);
              return;
            } else {
              console.error('[Slider] No slides found after retries:', sliderId);
              element.removeAttribute('data-swiper-initialized');
              // Clear initialization guard flag
              delete (element as any)._swiperInitializing;
              return;
            }
          }
          
          // CRITICAL: Wait for container to have dimensions before initializing Swiper
          // Swiper needs container width to calculate slide positions correctly
          if (containerWidth === 0 || (!isVertical && containerHeight === 0)) {
            retryCount++;
            if (retryCount < maxRetries) {
              setTimeout(attemptInit, initDelay * retryCount);
              return;
            } else {
              console.warn('[Slider] Container has no dimensions after retries, initializing anyway:', sliderId, {
                containerWidth,
                containerHeight,
                isVertical,
              });
            }
          }

          try {
            const swiperOptions = this.mapConfigToSwiper(
              sliderModule,
              pages.length,
              sliderId
            );

            // Override element references for Shadow DOM
            if (swiperOptions.pagination && paginationEl) {
              swiperOptions.pagination.el = paginationEl;
            }
            if (swiperOptions.scrollbar && scrollbarEl) {
              swiperOptions.scrollbar.el = scrollbarEl;
            }
            if (swiperOptions.navigation && nextEl && prevEl) {
              swiperOptions.navigation.nextEl = nextEl;
              swiperOptions.navigation.prevEl = prevEl;
            }

            const swiper = new Swiper(element, swiperOptions);
            SwiperInstanceManager.setInstance(sliderId, swiper);

            // Store the context that was used for initialization
            element.setAttribute('data-swiper-init-context', currentContext);

            // CRITICAL FIX: Correct container width IMMEDIATELY after Swiper creation
            // BEFORE any updateSize/updateSlides calls, to prevent Swiper from calculating wrong widths
            let correctedContainerWidth = containerWidth;
            if (currentContext === 'live') {
              // Re-check container width - Swiper might have changed it
              const currentMeasuredWidth = (element as HTMLElement).offsetWidth;
              
              // If width is absurdly large, force correction
              if (currentMeasuredWidth > 2000) {
                // Try to get correct width from parent container
                const containerElement = (element.parentElement as HTMLElement)?.closest('.ultra-slider-container') as HTMLElement;
                if (containerElement) {
                  const parentWidth = containerElement.offsetWidth;
                  if (parentWidth > 0 && parentWidth < 2000) {
                    correctedContainerWidth = parentWidth;
                  } else {
                    // Use computed style as fallback
                    const computedWidth = parseInt(getComputedStyle(element).width) || 0;
                    if (computedWidth > 0 && computedWidth < 2000) {
                      correctedContainerWidth = computedWidth;
                    } else {
                      // Use the original containerWidth from attemptInit if it was reasonable
                      if (containerWidth > 0 && containerWidth < 2000) {
                        correctedContainerWidth = containerWidth;
                      } else {
                        // Last resort: use window width as reasonable default
                        correctedContainerWidth = Math.min(window.innerWidth, 800);
                      }
                    }
                  }
                } else {
                  // Use the original containerWidth from attemptInit if it was reasonable
                  if (containerWidth > 0 && containerWidth < 2000) {
                    correctedContainerWidth = containerWidth;
                  } else {
                    // Last resort: use window width as reasonable default
                    correctedContainerWidth = Math.min(window.innerWidth, 800);
                  }
                }
                
                // CRITICAL: Force container to correct width BEFORE Swiper calculates slide widths
                (element as HTMLElement).style.maxWidth = `${correctedContainerWidth}px`;
                (element as HTMLElement).style.width = `${correctedContainerWidth}px`;
                
                // Also force parent container
                const parentContainerElement = (element.parentElement as HTMLElement)?.closest('.ultra-slider-container') as HTMLElement;
                if (parentContainerElement) {
                  parentContainerElement.style.maxWidth = `${correctedContainerWidth}px`;
                }
              } else {
                correctedContainerWidth = currentMeasuredWidth;
              }
            }


            // CRITICAL FIX: Force navigation to always be enabled when loop/rewind is enabled
            // Swiper's rewind doesn't properly keep arrows enabled at boundaries
            if (swiper.params.loop || swiper.params.rewind) {
              // Override Swiper's navigation disable logic
              swiper.allowSlideNext = true;
              swiper.allowSlidePrev = true;

              // Listen for navigation state changes and force them back to enabled
              swiper.on('navigationHide', () => {
                swiper.allowSlideNext = true;
                swiper.allowSlidePrev = true;
                if (swiper.navigation) {
                  swiper.navigation.update();
                }
              });

              swiper.on('reachEnd', () => {
                swiper.allowSlideNext = true;
                if (swiper.navigation) {
                  swiper.navigation.update();
                }
              });

              swiper.on('reachBeginning', () => {
                swiper.allowSlidePrev = true;
                if (swiper.navigation) {
                  swiper.navigation.update();
                }
              });
            }

            // CRITICAL: Ensure Swiper calculates slide widths AFTER width correction
            // Use the corrected width we just set
            swiper.updateSize();
            swiper.updateSlides();
            
            // CRITICAL: Verify width is still correct after Swiper calculations
            const finalContainerWidth = (element as HTMLElement).offsetWidth;
            if (currentContext === 'live' && finalContainerWidth > 2000) {
              // Force correction again if Swiper changed it
              (element as HTMLElement).style.maxWidth = `${correctedContainerWidth}px`;
              (element as HTMLElement).style.width = `${correctedContainerWidth}px`;
              swiper.updateSize();
              swiper.updateSlides();
            }
            
            // Constrain all slides to container width
            if (correctedContainerWidth > 0 && !isVertical) {
              swiper.slides.forEach((slide: HTMLElement) => {
                const currentWidth = slide.offsetWidth;
                if (currentWidth > correctedContainerWidth) {
                  // Force slide width to container width if Swiper calculated it too large
                  slide.style.maxWidth = `${correctedContainerWidth}px`;
                  slide.style.width = `${correctedContainerWidth}px`;
                }
              });
            }
            
            // CRITICAL: Force Swiper to apply transition duration
            // Swiper applies transition inline, but we need to ensure it's set correctly
            const wrapper = swiper.wrapperEl as HTMLElement;
            if (wrapper) {
              // Swiper should set this, but ensure it's applied
              wrapper.style.transitionDuration = `${swiper.params.speed}ms`;
              wrapper.style.transitionTimingFunction = 'ease';
              wrapper.style.transitionProperty = 'transform';
            }

            // DEBUG: Log after initial updateSize/updateSlides
            const updateData = {
              slidesCount: swiper.slides.length,
              containerWidth: (element as HTMLElement).offsetWidth,
              wrapperWidth: swiper.wrapperEl?.offsetWidth,
              wrapperTransform: getComputedStyle(swiper.wrapperEl).transform,
              wrapperTransition: getComputedStyle(swiper.wrapperEl).transition,
              wrapperTransitionDuration: getComputedStyle(swiper.wrapperEl).transitionDuration,
              wrapperInlineTransition: (swiper.wrapperEl as HTMLElement).style.transition,
              translate: swiper.getTranslate(),
              speed: swiper.params.speed,
              slides: Array.from(swiper.slides)
                .slice(0, 3)
                .map((slide, idx) => ({
                  index: idx,
                  width: (slide as HTMLElement).offsetWidth,
                  inlineWidth: (slide as HTMLElement).style.width,
                  computedWidth: getComputedStyle(slide).width,
                  transform: getComputedStyle(slide).transform,
                  isVisible:
                    (slide as HTMLElement).offsetWidth > 0 &&
                    (slide as HTMLElement).offsetHeight > 0,
                })),
            };

            swiper.updateProgress();
            swiper.pagination?.render?.();
            swiper.pagination?.update?.();
            swiper.navigation?.update?.();
            // Full update for all effects to ensure proper initialization
            swiper.update();

            // Function to update dynamic pagination visibility and sizing
            const updateDynamicPagination = () => {
              if (sliderModule.pagination_style !== 'dynamic') return;
              
              const totalSlides = swiper.slides.length;
              const currentIndex = swiper.activeIndex;
              const paginationEl = containerElement?.querySelector(
                paginationSelector
              ) as HTMLElement | null;
              if (!paginationEl) return;

              const bullets = Array.from(paginationEl.querySelectorAll('.swiper-pagination-bullet')) as HTMLElement[];
              
              // Determine visible range based on position
              let startIndex = 0;
              let endIndex = totalSlides - 1;
              
              if (totalSlides <= 3) {
                // For 3 or fewer slides, show all
                startIndex = 0;
                endIndex = totalSlides - 1;
              } else if (currentIndex === 0) {
                // First slide: show 3 bullets (0, 1, 2)
                startIndex = 0;
                endIndex = 2;
              } else if (currentIndex === 1) {
                // Second slide: show 4 bullets (0, 1, 2, 3)
                startIndex = 0;
                endIndex = 3;
              } else if (currentIndex === totalSlides - 1) {
                // Last slide: show 3 bullets (total-3, total-2, total-1)
                startIndex = Math.max(0, totalSlides - 3);
                endIndex = totalSlides - 1;
              } else if (currentIndex === totalSlides - 2) {
                // Second to last: show 4 bullets (total-4, total-3, total-2, total-1)
                startIndex = Math.max(0, totalSlides - 4);
                endIndex = totalSlides - 1;
              } else {
                // Middle slides: show 5 bullets centered around active
                startIndex = Math.max(0, currentIndex - 2);
                endIndex = Math.min(totalSlides - 1, currentIndex + 2);
              }

              // Update bullet visibility and size
              bullets.forEach((bullet, index) => {
                const isVisible = index >= startIndex && index <= endIndex;
                const distanceFromActive = Math.abs(index - currentIndex);
                
                if (!isVisible) {
                  bullet.style.display = 'none';
                  return;
                }
                
                bullet.style.display = '';
                
                // Remove all size classes
                bullet.classList.remove(
                  'swiper-pagination-bullet-active-main',
                  'swiper-pagination-bullet-active-prev',
                  'swiper-pagination-bullet-active-next',
                  'swiper-pagination-bullet-active-prev-prev',
                  'swiper-pagination-bullet-active-next-next'
                );
                
                // Set size based on distance from active
                if (distanceFromActive === 0) {
                  // Active bullet - largest
                  bullet.classList.add('swiper-pagination-bullet-active');
                  bullet.classList.add('swiper-pagination-bullet-active-main');
                  // Set inline styles to ensure size is applied
                  bullet.style.transform = 'scale(1.3)';
                  bullet.style.opacity = '1';
                } else {
                  // Remove active class from non-active bullets
                  bullet.classList.remove('swiper-pagination-bullet-active');
                  if (distanceFromActive === 1) {
                    // Adjacent bullets - medium
                    if (index < currentIndex) {
                      bullet.classList.add('swiper-pagination-bullet-active-prev');
                    } else {
                      bullet.classList.add('swiper-pagination-bullet-active-next');
                    }
                    bullet.style.transform = 'scale(1)';
                    bullet.style.opacity = '0.7';
                  } else if (distanceFromActive === 2) {
                    // Outer bullets - smallest
                    if (index < currentIndex) {
                      bullet.classList.add('swiper-pagination-bullet-active-prev-prev');
                    } else {
                      bullet.classList.add('swiper-pagination-bullet-active-next-next');
                    }
                    bullet.style.transform = 'scale(0.6)';
                    bullet.style.opacity = '0.4';
                  } else {
                    // Even further bullets - smallest
                    bullet.style.transform = 'scale(0.6)';
                    bullet.style.opacity = '0.4';
                  }
                }
              });
            };

            // Initialize dynamic pagination after Swiper renders pagination
            if (sliderModule.pagination_style === 'dynamic') {
              // Use setTimeout to ensure pagination DOM is ready
              setTimeout(() => {
                updateDynamicPagination();
              }, 100);
            }

            // CRITICAL: Manual per-slide height update instead of Swiper's autoHeight
            // which calculates max height across all slides
            let isUpdatingHeight = false; // Guard to prevent infinite loops
            const updateCurrentSlideHeight = () => {
              if (!swiper || swiper.destroyed || isUpdatingHeight) return;
              isUpdatingHeight = true;

              const activeSlide = swiper.slides[swiper.activeIndex];
              if (!activeSlide) {
                isUpdatingHeight = false;
                return;
              }

              const slideContent = activeSlide.querySelector('.slide-content') as HTMLElement;
              if (!slideContent) {
                isUpdatingHeight = false;
                return;
              }

              // Get actual content height - for vertical sliders, use offsetHeight for proper measurement
              const contentHeight = isVertical 
                ? slideContent.offsetHeight || slideContent.scrollHeight 
                : slideContent.scrollHeight;

              // Update BOTH wrapper and swiper container height to match active slide only
              const wrapper = swiper.wrapperEl;
              const swiperEl = swiper.el as HTMLElement;

              if (sliderModule.auto_height ?? true) {
                // CRITICAL: Only update height, NEVER touch wrapper transition
                // Swiper manages wrapper.transform transition - we must preserve it
                if (wrapper) {
                  // Only update height - don't touch transition at all
                  wrapper.style.height = `${contentHeight}px`;
                  // Ensure transform transition is preserved by re-applying it
                  wrapper.style.transitionDuration = `${swiper.params.speed}ms`;
                  wrapper.style.transitionTimingFunction = 'ease';
                  wrapper.style.transitionProperty = 'transform';
                }
                if (swiperEl) {
                  // Only swiperEl gets height transition, wrapper keeps transform transition
                  swiperEl.style.transition = 'height 0.3s ease';
                  swiperEl.style.height = `${contentHeight}px`;
                }

                // Ensure all slides are set to auto height so they don't constrain each other
                swiper.slides.forEach((slide: HTMLElement) => {
                  slide.style.height = 'auto';
                  slide.style.minHeight = '0';
                  // For vertical sliders, ensure slides don't overlap
                  if (isVertical) {
                    slide.style.width = '100%';
                    slide.style.position = 'relative';
                  }
                });

                isUpdatingHeight = false;
              } else {
                isUpdatingHeight = false;
              }
            };

            // Track previous index to detect actual navigation
            let previousSlideIndex = swiper.activeIndex;

            // Dispatch custom event for compatibility
            swiper.on('slideChange', () => {
              // Only log if index actually changed (prevents logging during initialization loops)
              const actualIndexChanged = swiper.activeIndex !== previousSlideIndex;
              previousSlideIndex = swiper.activeIndex;

              // Update arrow visibility immediately
              if (!swiper.params.loop && !swiper.params.rewind) {
                if (prevEl) {
                  prevEl.classList.toggle('swiper-button-disabled', swiper.isBeginning);
                }
                if (nextEl) {
                  nextEl.classList.toggle('swiper-button-disabled', swiper.isEnd);
                }
              }

              // Update height immediately on slide change (with transitions disabled to avoid conflicts)
              // Skip auto-height updates for effects that require fixed height
              const transitionEffectForHeight = sliderModule.transition_effect || 'slide';
              // Only fade requires fixed height (slide uses auto-height)
              const requiresFixedHeight = transitionEffectForHeight === 'fade';
              if (
                (sliderModule.auto_height ?? true) &&
                !requiresFixedHeight &&
                actualIndexChanged
              ) {
                // Use double requestAnimationFrame to ensure DOM has updated
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    updateCurrentSlideHeight();
                  });
                });
              }

              // Update dynamic pagination visibility and sizing
              if (actualIndexChanged && sliderModule.pagination_style === 'dynamic') {
                updateDynamicPagination();
              }

              // Dispatch custom event for compatibility
              if (actualIndexChanged) {
                window.dispatchEvent(
                  new CustomEvent('slider-state-changed', {
                    bubbles: true,
                    composed: true,
                    detail: { sliderId, index: swiper.activeIndex },
                  })
                );
              }
            });

            if (nextEl) {
              nextEl.addEventListener('click', () => {
                // Navigation handled by Swiper
              });
            }
            if (prevEl) {
              prevEl.addEventListener('click', () => {
                // Navigation handled by Swiper
              });
            }

            // Swiper's built-in navigation is enabled - no manual handlers needed
            // Swiper will handle arrow clicks automatically

            swiper.on('destroy', () => {
              // Cleanup handled automatically
            });

            // CRITICAL: Set initial height and arrow visibility
            const setInitialSlideHeight = () => {
              if (!swiper || swiper.destroyed) return;

              // CRITICAL: Skip height modifications for fade effect (uses absolute positioning)
              const currentEffect = sliderModule.transition_effect || 'slide';
              const skipHeightModifications = currentEffect === 'fade';

              const activeSlide = swiper.slides[swiper.activeIndex];
              if (!activeSlide) return;

              const slideContent = activeSlide.querySelector('.slide-content') as HTMLElement;
              if (!slideContent) return;

              const contentHeight = isVertical 
                ? slideContent.offsetHeight || slideContent.scrollHeight 
                : slideContent.scrollHeight;
              const wrapper = swiper.wrapperEl;
              const swiperEl = swiper.el as HTMLElement;

              // Only apply auto-height logic for slide effect (not for fade, cube, flip, coverflow)
              if ((sliderModule.auto_height ?? true) && !skipHeightModifications) {
                if (wrapper) {
                  wrapper.style.height = `${contentHeight}px`;
                  // CRITICAL: Preserve Swiper's transform transition, don't override it
                  // Set transition properties individually to preserve transform transition
                  wrapper.style.transitionDuration = `${swiper.params.speed}ms`;
                  wrapper.style.transitionTimingFunction = 'ease';
                  wrapper.style.transitionProperty = 'transform';
                  // Don't set wrapper.style.transition - that would override Swiper's transform
                }
                if (swiperEl) {
                  swiperEl.style.transition = 'height 0.3s ease';
                  swiperEl.style.height = `${contentHeight}px`;
                }

                // Ensure all slides are set to auto height so they don't constrain each other
                swiper.slides.forEach((slide: HTMLElement) => {
                  slide.style.height = 'auto';
                  slide.style.minHeight = '0';
                  // For vertical sliders, ensure slides don't overlap
                  if (isVertical) {
                    slide.style.width = '100%';
                    slide.style.position = 'relative';
                  }
                });
              } else if (
                wrapper &&
                (!(sliderModule.auto_height ?? true) || skipHeightModifications) &&
                sliderModule.slider_height
              ) {
                // Fixed height mode OR effects that require fixed height
                // Ensure wrapper and swiper use the configured height
                const fixedHeight = sliderModule.slider_height || 300;
                wrapper.style.height = `${fixedHeight}px`;
                if (swiperEl) {
                  swiperEl.style.height = `${fixedHeight}px`;
                }
              }

              // Set initial arrow visibility for non-loop mode
              if (!swiper.params.loop && !swiper.params.rewind) {
                if (prevEl) {
                  prevEl.classList.toggle('swiper-button-disabled', swiper.isBeginning);
                }
                if (nextEl) {
                  nextEl.classList.toggle('swiper-button-disabled', swiper.isEnd);
                }
              }
            };

            // CRITICAL: Use double requestAnimationFrame to ensure DOM is fully rendered
            // and container has final dimensions before Swiper calculations
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (swiper && !swiper.destroyed) {
                  // CRITICAL: Force Swiper to recalculate all dimensions before first update
                  // This ensures slides get proper width/height calculated
                  swiper.updateSize();
                  swiper.updateSlides();
                  swiper.updateSlidesClasses();

                  // Reset any inline styles that might interfere with Swiper's calculations
                  swiper.slides.forEach((slide: HTMLElement) => {
                    // Only reset width/height if Swiper should manage it
                    if (
                      transitionEffect === 'slide' ||
                      transitionEffect === 'slide-left' ||
                      transitionEffect === 'slide-right'
                    ) {
                      if (!isVertical) {
                        slide.style.width = '';
                      } else {
                        slide.style.height = '';
                      }
                    }
                  });

                  // CRITICAL: Force Swiper to recalculate translate values
                  swiper.update();
                  swiper.setTranslate(swiper.getTranslate());

                  setInitialSlideHeight();

                  // CRITICAL: Force size recalculation for Live Preview
                  // Swiper may have calculated wrong widths if container wasn't ready
                  if (currentContext === 'live') {
                    requestAnimationFrame(() => {
                      if (swiper && !swiper.destroyed) {
                        // Force Swiper to recalculate all dimensions
                        swiper.updateSize();
                        swiper.updateSlides();
                        swiper.updateSlidesClasses();
                        swiper.update();
                      }
                    });
                  }

                  // Double-check after DOM fully settles (especially important for Live Preview)
                  setTimeout(
                    () => {
                      if (swiper && !swiper.destroyed) {
                        setInitialSlideHeight();
                        // One more size update for Live Preview
                        if (currentContext === 'live') {
                          swiper.updateSize();
                          swiper.updateSlides();
                          swiper.update();
                        }
                      }
                    },
                    currentContext === 'live' ? 200 : 100
                  );
                }
              });
            });

            // Set up ResizeObserver to detect content changes and update height
            // Add debouncing to prevent constant updates
            // CRITICAL: Skip for fade effect (uses absolute positioning)
            const currentEffect = sliderModule.transition_effect || 'slide';
            const skipResizeHeightUpdates = currentEffect === 'fade';
            
            let resizeTimeout: number | null = null;
            const resizeObserver = new ResizeObserver(() => {
              // Skip height updates for effects that need fixed positioning
              if (swiper && !swiper.destroyed && (sliderModule.auto_height ?? true) && !skipResizeHeightUpdates) {
                // Clear existing timeout
                if (resizeTimeout !== null) {
                  clearTimeout(resizeTimeout);
                }
                // Debounce resize updates
                resizeTimeout = window.setTimeout(() => {
                  requestAnimationFrame(() => {
                    if (swiper && !swiper.destroyed) {
                      const activeSlide = swiper.slides[swiper.activeIndex];
                      const slideContent = activeSlide?.querySelector(
                        '.slide-content'
                      ) as HTMLElement;
                      if (slideContent) {
                        const isVertical = sliderModule.slider_direction === 'vertical';
                        const contentHeight = isVertical 
                          ? slideContent.offsetHeight || slideContent.scrollHeight 
                          : slideContent.scrollHeight;
                        const wrapper = swiper.wrapperEl;
                        const swiperEl = swiper.el as HTMLElement;
                        if (wrapper) {
                          wrapper.style.height = `${contentHeight}px`;
                          // CRITICAL: Preserve Swiper's transform transition
                          wrapper.style.transitionDuration = `${swiper.params.speed}ms`;
                          wrapper.style.transitionTimingFunction = 'ease';
                          wrapper.style.transitionProperty = 'transform';
                        }
                        if (swiperEl) {
                          swiperEl.style.height = `${contentHeight}px`;
                        }
                        // Ensure all slides are set to auto height
                        swiper.slides.forEach((slide: HTMLElement) => {
                          slide.style.height = 'auto';
                          slide.style.minHeight = '0';
                        });
                      }
                    }
                  });
                }, 100); // 100ms debounce
              }
            });

            // Observe all slide content for size changes
            const slideContents = element.querySelectorAll('.slide-content');
            slideContents.forEach(content => {
              resizeObserver.observe(content as Element);
            });

            // Store observer for cleanup
            (element as any)._swiperResizeObserver = resizeObserver;
            
            // Clear initialization guard flag
            delete (element as any)._swiperInitializing;
          } catch (e) {
            console.error('[Slider] Error initializing:', e);
            element.removeAttribute('data-swiper-initialized');
            // Clear initialization guard flag on error
            delete (element as any)._swiperInitializing;
          }
        };

        // Start initialization attempt
        if (isPreview) {
          setTimeout(attemptInit, initDelay);
        } else {
          requestAnimationFrame(() => requestAnimationFrame(attemptInit));
        }
      };
    }

    const slidesPerView = sliderModule.slides_per_view || 1;

    const verticalAlignment = sliderModule.vertical_alignment || 'top';
    const alignMap: Record<string, string> = {
      top: 'flex-start',
      center: 'center',
      bottom: 'flex-end',
      stretch: 'stretch',
    };

    // Custom arrow styling
    const arrowSize = sliderModule.arrow_size || 40;
    const arrowStyle = sliderModule.arrow_style || 'default';
    const arrowPositionOffset = sliderModule.arrow_position_offset || 0;
    const alwaysVisible = sliderModule.arrows_always_visible || false;

    // Arrow button style - minimal has no background/border, default uses Swiper default, others are custom
    const arrowButtonStyle = arrowStyle === 'minimal' 
      ? `
        width: ${arrowSize}px;
        height: ${arrowSize}px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: none;
        background: transparent !important;
        transition: all 0.3s;
        color: ${sliderModule.arrow_color || 'white'};
        opacity: ${alwaysVisible ? '1' : '0'};
      `
      : arrowStyle === 'default'
      ? `
        width: ${arrowSize}px;
        height: ${arrowSize}px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: none;
        transition: all 0.3s;
        opacity: ${alwaysVisible ? '1' : '0'};
      `
      : `
        width: ${arrowSize}px;
        height: ${arrowSize}px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: none;
        transition: all 0.3s;
        background: ${sliderModule.arrow_background_color || 'rgba(0, 0, 0, 0.5)'};
        color: ${sliderModule.arrow_color || 'white'};
        border: ${arrowStyle === 'square' ? '2px solid ' + (sliderModule.arrow_color || 'white') : 'none'};
        border-radius: ${arrowStyle === 'circle' ? '50%' : arrowStyle === 'square' ? '4px' : '0'};
        opacity: ${alwaysVisible ? '1' : '0'};
      `;

    // Arrow positioning - always inside, but offset can move them
    const basePosition = 10;
    const prevArrowPosition = `${basePosition + arrowPositionOffset}px`;
    const nextArrowPosition = `${basePosition + arrowPositionOffset}px`;

    const isVertical = sliderModule.slider_direction === 'vertical';
    const defaultHeight = sliderModule.slider_height || 400;

    const paginationOverlay = sliderModule.pagination_overlay ?? false;
    const paginationPosition =
      sliderModule.pagination_position || (isVertical ? 'right' : 'bottom');
    const paginationStyle = sliderModule.pagination_style || 'dots';
    const isNumbersPagination = paginationStyle === 'numbers';
    const isScrollbarPagination = paginationStyle === 'scrollbar';
    const paginationOutside =
      sliderModule.show_pagination && !paginationOverlay && !isVertical;
    const paginationRowSpacing = paginationOutside
      ? isNumbersPagination || isScrollbarPagination
        ? 32
        : 16
      : 0;
    const bottomPaginationMargin =
      paginationOutside && isNumbersPagination ? 80 : 0;
    const paginationZIndex = paginationOverlay ? 20 : 0;
    const getPaginationRowTemplate = () =>
      html`
        <div
          class="slider-pagination-row"
          data-slider-id="${sliderId}"
          data-position="${paginationPosition}"
        >
          ${isScrollbarPagination
            ? html`
                <div class="swiper-scrollbar" data-slider-id="${sliderId}"></div>
              `
            : html`
                <div
                  class="swiper-pagination pagination-${paginationPosition}"
                  data-slider-id="${sliderId}"
                ></div>
              `}
        </div>
      `;

    // Detect if effect requires fixed height for proper display
    const transitionEffect = sliderModule.transition_effect || 'slide';
    // Only fade requires fixed height (slide uses auto-height)
    const requiresFixedHeight = transitionEffect === 'fade';

    return html`
      <style>
        .ultra-slider-container {
          position: relative;
          width: ${sliderModule.slider_width || '100%'};
          ${isVertical ? `height: ${defaultHeight}px;` : ''}
          display: flex;
          flex-direction: ${isVertical ? 'row' : 'column'};
          margin: 0 auto;
          overflow: ${isVertical ? 'hidden' : 'hidden'};
          ${previewContext === 'live' ? 'min-height: 0; max-height: none; max-width: 100%; overflow: hidden !important;' : ''}
        }
        .ultra-slider-container .swiper {
          width: 100% !important;
          max-width: 100% !important;
          height: ${isVertical
          ? `${defaultHeight}px`
          : requiresFixedHeight
            ? `${sliderModule.slider_height || defaultHeight}px`
            : (sliderModule.auto_height ?? true)
              ? 'auto'
              : `${sliderModule.slider_height || defaultHeight}px`};
          position: relative;
          overflow: hidden !important;
          ${previewContext === 'live' ? 'min-height: 0; max-width: 100% !important; overflow: hidden !important;' : ''}
          /* CRITICAL: Ensure container doesn't clip slides during transition */
          ${transitionEffect === 'slide' ||
        transitionEffect === 'slide-left' ||
        transitionEffect === 'slide-right'
          ? `
          /* For slide effect, ensure overflow is hidden but slides can still be visible during transition */
          `
          : ''}
          ${previewContext === 'live' ? 'min-height: 0;' : ''}
          ${!(sliderModule.auto_height ?? true) && sliderModule.slider_height && !isVertical
          ? `height: ${sliderModule.slider_height}px !important;`
          : ''}
          /* Effects always need fixed height for proper rendering */
          ${requiresFixedHeight && !isVertical
          ? `height: ${sliderModule.slider_height || defaultHeight}px !important;`
          : ''}
          /* Add padding for pagination when overlay is disabled (only applies when auto_height is true) */
          ${!isVertical &&
        sliderModule.show_pagination &&
        (sliderModule.auto_height ?? true) &&
        !paginationOverlay &&
        !isNumbersPagination &&
        !isScrollbarPagination
          ? `
            ${paginationPosition === 'top' ? 'padding-top: 32px;' : ''}
            ${paginationPosition === 'bottom' ? 'padding-bottom: 32px;' : ''}
          `
          : ''}
          ${isVertical &&
        sliderModule.show_pagination &&
        sliderModule.pagination_style !== 'scrollbar' &&
        (sliderModule.auto_height ?? true) &&
        !(sliderModule.pagination_overlay ?? false)
          ? `
            ${paginationPosition === 'left' ? 'padding-left: 32px;' : ''}
            ${paginationPosition === 'right' ? 'padding-right: 32px;' : ''}
          `
          : ''}
        }
        .ultra-slider-container .swiper-wrapper {
          /* Swiper handles positioning - let Swiper control all transform/positioning */
          position: relative;
          z-index: 1;
          box-sizing: border-box;
          ${previewContext === 'live' ? 'min-height: 0;' : ''}
          /* CRITICAL: Don't override Swiper's width/height for effects - Swiper handles internally */
          ${transitionEffect === 'slide' ||
        transitionEffect === 'slide-left' ||
        transitionEffect === 'slide-right'
          ? `
          /* For slide effect, Swiper will set wrapper width inline to (slideWidth * slidesCount) */
          width: auto !important;
          display: flex;
          flex-direction: ${isVertical ? 'column' : 'row'};
          flex-wrap: nowrap;
          will-change: transform;
          /* CRITICAL: Let Swiper handle ALL transitions - don't set any transition properties */
          ${isVertical 
            ? `height: ${(sliderModule.auto_height ?? true) ? 'auto' : '100%'};` 
            : (sliderModule.auto_height ?? true) ? 'height: auto;' : `height: ${sliderModule.slider_height || defaultHeight}px;`}
          `
          : `
          /* CRITICAL: For fade - let Swiper fully control wrapper */
          /* Swiper sets fade effect to use absolute positioning internally */
          width: 100%;
          height: 100%;
          `}
        }
        .ultra-slider-container .swiper-slide {
          /* Swiper handles slide positioning - different handling per effect type */
          box-sizing: border-box;
          padding: 0;
          ${previewContext === 'live' ? 'min-height: 0; overflow: hidden;' : ''}
          
          ${transitionEffect === 'slide' ||
          transitionEffect === 'slide-left' ||
          transitionEffect === 'slide-right'
            ? `
          /* SLIDE EFFECT: flexbox layout with transform transitions */
          display: block;
          flex-shrink: 0;
          ${!isVertical
              ? `
            width: 100%;
            min-width: 0;
            max-width: 100%;
            height: ${(sliderModule.auto_height ?? true) ? 'auto' : '100%'};
          `
              : `
            width: 100%;
            height: auto;
            min-height: 0;
            position: relative;
          `}
          overflow: ${(sliderModule.auto_height ?? true) ? 'visible' : 'hidden'};
          `
            : `
          /* FADE EFFECT: Swiper uses absolute positioning for crossfade */
          /* Don't override width/height - let Swiper control positioning */
          width: 100%;
          height: 100%;
          `}
        }
        /* Ensure slide content displays properly */
        .ultra-slider-container .swiper-slide > .slide-content {
          display: flex;
          flex-direction: column;
          /* CRITICAL: Constrain slide-content to slide width */
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          overflow: hidden;
          ${previewContext === 'live' ? 'max-width: 100% !important; overflow: hidden !important;' : ''}
        }
        .ultra-slider-container .slide-content {
          width: 100%;
          max-width: 100%;
          height: ${isVertical ? 'auto' : requiresFixedHeight ? '100%' : 'fit-content'};
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow: ${requiresFixedHeight ? 'hidden' : 'visible'};
          box-sizing: border-box;
          flex: ${isVertical ? '0 0 auto' : '0 0 auto'};
          /* Vertical alignment - only applies when slides_per_view > 1 */
          ${slidesPerView > 1 ? `justify-content: ${alignMap[verticalAlignment]};` : ''}
          ${slidesPerView > 1 && verticalAlignment === 'stretch' ? 'height: 100%;' : ''}
          ${previewContext === 'live' ? 'min-height: 0; max-width: 100% !important; overflow: hidden !important;' : ''}
        }
        .ultra-slider-container .slide-content > * {
          flex-shrink: 0;
          min-height: 0;
          height: auto;
          /* CRITICAL: Constrain child elements to slide width */
          max-width: 100%;
          box-sizing: border-box;
          ${previewContext === 'live' ? 'max-width: 100% !important; overflow: hidden;' : ''}
        }
        .ultra-slider-container .child-module-wrapper {
          overflow: visible;
          box-sizing: border-box;
          height: fit-content;
          flex: 0 0 auto;
          /* CRITICAL: Constrain child modules to slide width */
          width: 100% !important;
          max-width: 100% !important;
          ${previewContext === 'live' ? 'max-width: 100% !important; overflow: hidden !important;' : ''}
        }
        /* Ensure nested layout modules scale correctly within slider slides */
        .ultra-slider-container .swiper-slide .horizontal-module-preview,
        .ultra-slider-container .swiper-slide .vertical-module-preview,
        .ultra-slider-container .swiper-slide .slider-module {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box;
        }
        /* Ensure nested horizontal layout content scales correctly */
        .ultra-slider-container .swiper-slide .horizontal-preview-content {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box;
          /* When multiple slides visible, ensure flex children scale properly */
          ${slidesPerView > 1 ? `
            flex-shrink: 1;
            flex-basis: 0;
          ` : ''}
        }
        /* Ensure nested horizontal layout children scale correctly */
        .ultra-slider-container .swiper-slide .horizontal-preview-content .child-module-preview {
          min-width: 0 !important;
          flex-shrink: 1 !important;
          box-sizing: border-box;
        }
        /* Ensure nested vertical layout content scales correctly */
        .ultra-slider-container .swiper-slide .vertical-preview-content {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box;
        }
        /* Ensure nested vertical layout children scale correctly */
        .ultra-slider-container .swiper-slide .vertical-preview-content .child-module-preview {
          min-width: 0 !important;
          flex-shrink: 1 !important;
          box-sizing: border-box;
        }
        /* Ensure nested slider modules scale correctly */
        .ultra-slider-container .swiper-slide .slider-module .ultra-slider-container {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box;
        }
        .ultra-slider-container .swiper-button-prev,
        .ultra-slider-container .swiper-button-next {
          ${arrowButtonStyle}
          position: absolute;
          ${isVertical
          ? `
            left: 50%;
            transform: translateX(-50%);
          `
          : `
            top: 50%;
            transform: translateY(-50%);
          `}
          z-index: 10;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        .ultra-slider-container .swiper-button-prev {
          ${isVertical
          ? `
            top: ${prevArrowPosition};
          `
          : `
            left: ${prevArrowPosition};
          `}
        }
        .ultra-slider-container .swiper-button-next {
          ${isVertical
          ? `
            bottom: ${nextArrowPosition};
            top: auto;
          `
          : `
            right: ${nextArrowPosition};
          `}
        }
        /* Hide disabled arrows when loop is off */
        .ultra-slider-container .swiper-button-disabled {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        /* CRITICAL: Completely hide Swiper's default arrow content */
        .ultra-slider-container .swiper-button-prev *:not(ha-icon):not(ha-icon *),
        .ultra-slider-container .swiper-button-next *:not(ha-icon):not(ha-icon *) {
          display: none !important;
        }
        .ultra-slider-container .swiper-button-prev::before,
        .ultra-slider-container .swiper-button-prev::after,
        .ultra-slider-container .swiper-button-next::before,
        .ultra-slider-container .swiper-button-next::after {
          content: none !important;
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }
        /* Ensure ONLY our ha-icon is visible */
        .ultra-slider-container .swiper-button-prev ha-icon,
        .ultra-slider-container .swiper-button-next ha-icon {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          pointer-events: none;
          width: 100%;
          height: 100%;
        }
        /* Reset any Swiper default styling on navigation buttons */
        .ultra-slider-container .swiper-button-prev,
        .ultra-slider-container .swiper-button-next {
          font-family: inherit !important;
          font-size: inherit !important;
        }
        /* Show arrows on hover when not disabled */
        .ultra-slider-container:hover .swiper-button-prev:not(.swiper-button-disabled),
        .ultra-slider-container:hover .swiper-button-next:not(.swiper-button-disabled) {
          opacity: 1 !important;
        }
        .ultra-slider-container .swiper-button-prev:not(.swiper-button-disabled):hover,
        .ultra-slider-container .swiper-button-next:not(.swiper-button-disabled):hover {
          ${isVertical
          ? `
            transform: translateX(-50%) scale(1.1) !important;
          `
          : `
            transform: translateY(-50%) scale(1.1) !important;
          `}
        }
        /* CRITICAL: Completely hide disabled arrows */
        .ultra-slider-container .swiper-button-disabled,
        .ultra-slider-container .swiper-button-prev.swiper-button-disabled,
        .ultra-slider-container .swiper-button-next.swiper-button-disabled {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        /* Override any hover states for disabled arrows */
        .ultra-slider-container:hover .swiper-button-disabled,
        .ultra-slider-container:hover .swiper-button-prev.swiper-button-disabled,
        .ultra-slider-container:hover .swiper-button-next.swiper-button-disabled {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        /* Custom pagination styling */
        .ultra-slider-container .swiper-pagination {
          position: ${isVertical ||
        paginationOverlay ||
        !(sliderModule.auto_height ?? true)
          ? 'absolute'
          : 'relative'};
          z-index: ${paginationZIndex};
          pointer-events: all;
          ${isVertical && (paginationPosition === 'left' || paginationPosition === 'right')
            ? '' /* Left/right pagination styles handled separately below */
            : isVertical
              ? `
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                width: auto;
                height: auto;
                flex-direction: column;
              `
              : paginationOverlay || !(sliderModule.auto_height ?? true)
                ? `
                bottom: 10px;
                left: 50%;
                transform: translateX(-50%);
                width: auto;
                height: auto;
                pointer-events: all;
              `
                : `
                display: flex;
                justify-content: center;
                align-items: center;
              `}
        }
        ${paginationOutside
          ? `
        .ultra-slider-container .slider-pagination-row {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          gap: 8px;
        }
        .ultra-slider-container .slider-pagination-row[data-position='bottom'] {
          margin-top: ${bottomPaginationMargin}px;
        }
        .ultra-slider-container .slider-pagination-row[data-position='top'] {
          margin-bottom: ${paginationRowSpacing}px;
        }
        .ultra-slider-container .slider-pagination-row .swiper-pagination,
        .ultra-slider-container .slider-pagination-row .swiper-scrollbar {
          position: relative !important;
          transform: none !important;
          left: auto !important;
          right: auto !important;
          top: auto !important;
          bottom: auto !important;
          width: 100%;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .ultra-slider-container .slider-pagination-row .swiper-scrollbar {
          height: 8px;
          background: ${sliderModule.pagination_color || 'rgba(0, 0, 0, 0.1)'};
          border-radius: 4px;
        }
        .ultra-slider-container .slider-pagination-row .swiper-scrollbar .swiper-scrollbar-drag {
          background: ${sliderModule.pagination_active_color || 'var(--primary-color)'};
          border-radius: 4px;
        }
        `
          : ''}
        /* Ensure pagination is visible when positioned on left/right (vertical sliders only) */
        ${isVertical && (paginationPosition === 'left' || paginationPosition === 'right')
          ? `
        /* Remove wrapper margin - padding handles spacing */
        `
          : ''}
        .ultra-slider-container .swiper-pagination-bullet {
          width: ${sliderModule.pagination_size || 12}px;
          height: ${sliderModule.pagination_size || 12}px;
          background: ${sliderModule.pagination_color || 'var(--primary-text-color)'};
          opacity: 0.5;
          margin: ${isVertical ? '4px 0' : '0 4px'};
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.3s;
          pointer-events: all;
          display: inline-block;
        }
        .ultra-slider-container .swiper-pagination-bullet-active {
          background: ${sliderModule.pagination_active_color || 'var(--primary-color)'};
          opacity: 1;
          transform: scale(1.2);
        }
        /* Dynamic pagination styling - centered with tapering bullets */
        /* Note: These styles apply to ALL dynamic pagination, but will be overridden by conditional styles below */
        .ultra-slider-container .swiper-pagination-bullets-dynamic {
          overflow: hidden;
        }
        /* Custom styling for numbers pagination - only when using numbers style */
        ${sliderModule.pagination_style === 'numbers'
          ? `
        .ultra-slider-container .swiper-pagination-bullet {
          border: 2px solid ${sliderModule.pagination_color || 'var(--primary-text-color)'};
          background: transparent;
          color: ${sliderModule.pagination_color || 'var(--primary-text-color)'};
        }
        .ultra-slider-container .swiper-pagination-bullet-active {
          border: 2px solid ${sliderModule.pagination_active_color || 'var(--primary-color)'};
          background: ${sliderModule.pagination_active_color || 'var(--primary-color)'};
          color: white;
        }
        `
          : ''}
        /* Dots and Dash pagination styling */
        ${sliderModule.pagination_style === 'dots-and-dash'
          ? `
        .ultra-slider-container .swiper-pagination-bullet {
          width: ${sliderModule.pagination_size || 12}px;
          height: ${sliderModule.pagination_size || 12}px;
          background: ${sliderModule.pagination_color || 'var(--primary-text-color)'};
          opacity: 0.5;
          margin: ${isVertical ? '4px 0' : '0 4px'};
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.3s;
        }
        .ultra-slider-container .swiper-pagination-bullet-active {
          width: ${(sliderModule.pagination_size || 12) * 2}px;
          height: ${sliderModule.pagination_size || 12}px;
          background: ${sliderModule.pagination_active_color || 'var(--primary-color)'};
          opacity: 1;
          border-radius: ${(sliderModule.pagination_size || 12) * 3 / 4}px;
          transform: scale(1);
        }
        `
          : ''}
        /* Dash Lines pagination styling */
        ${sliderModule.pagination_style === 'dash-lines'
          ? `
        .ultra-slider-container .swiper-pagination-bullet {
          width: ${(sliderModule.pagination_size || 12) * 2}px;
          height: ${(sliderModule.pagination_size || 12) / 2}px;
          background: ${sliderModule.pagination_color || 'var(--primary-text-color)'};
          opacity: 0.5;
          margin: ${isVertical ? '4px 0' : '0 4px'};
          cursor: pointer;
          border-radius: ${(sliderModule.pagination_size || 12) / 4}px;
          transition: all 0.3s;
        }
        .ultra-slider-container .swiper-pagination-bullet-active {
          width: ${(sliderModule.pagination_size || 12) * 2.5}px;
          height: ${(sliderModule.pagination_size || 12) / 2}px;
          background: ${sliderModule.pagination_active_color || 'var(--primary-color)'};
          opacity: 1;
          border-radius: ${(sliderModule.pagination_size || 12) / 4}px;
          transform: scale(1);
        }
        `
          : ''}
        /* Dynamic pagination styling - active is largest, adjacent bullets are medium, outer bullets are smallest */
        /* Size progression: smallest (outer) -> medium (adjacent) -> largest (active) -> medium (adjacent) -> smallest (outer) */
        ${sliderModule.pagination_style === 'dynamic'
          ? `
        .ultra-slider-container .swiper-pagination-bullets-dynamic {
          overflow: visible !important;
          width: auto !important;
          text-align: center !important;
          display: inline-block !important;
          ${isVertical && (sliderModule.pagination_position === 'left' || sliderModule.pagination_position === 'right')
            ? `
              left: auto !important;
              transform: none !important;
              position: relative !important;
            `
            : `
              left: 50% !important;
              transform: translateX(-50%) !important;
              position: relative !important;
            `}
        }
        /* Base style for all dynamic bullets - smallest size (outer bullets, 2 steps away) */
        .ultra-slider-container .swiper-pagination-bullets-dynamic .swiper-pagination-bullet {
          opacity: 0.4 !important;
          transition: all 0.3s ease !important;
          transform-origin: center center !important;
          transform: scale(0.6) !important;
          width: ${sliderModule.pagination_size || 12}px !important;
          height: ${sliderModule.pagination_size || 12}px !important;
        }
        /* Override Swiper's default active bullet styles */
        .ultra-slider-container .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active {
          transform: scale(0.6) !important;
          opacity: 0.4 !important;
        }
        /* Explicitly set outer bullets (2 steps away) to smallest size */
        .ultra-slider-container .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-prev-prev,
        .ultra-slider-container .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-next-next {
          transform: scale(0.6) !important;
          opacity: 0.4 !important;
          width: ${sliderModule.pagination_size || 12}px !important;
          height: ${sliderModule.pagination_size || 12}px !important;
        }
        /* Medium size (1 step away from active) - adjacent bullets */
        .ultra-slider-container .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-prev,
        .ultra-slider-container .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-next {
          transform: scale(1) !important;
          opacity: 0.7 !important;
          width: ${sliderModule.pagination_size || 12}px !important;
          height: ${sliderModule.pagination_size || 12}px !important;
        }
        /* Largest size (active bullet) - must be last to override everything */
        .ultra-slider-container .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-main,
        .ultra-slider-container .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-main.swiper-pagination-bullet-active {
          transform: scale(1.3) !important;
          opacity: 1 !important;
          width: ${sliderModule.pagination_size || 12}px !important;
          height: ${sliderModule.pagination_size || 12}px !important;
        }
        /* Ensure regular active bullets (without active-main class) don't get wrong scale */
        .ultra-slider-container .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active:not(.swiper-pagination-bullet-active-main):not(.swiper-pagination-bullet-active-prev):not(.swiper-pagination-bullet-active-next) {
          transform: scale(0.6) !important;
        }
        `
          : ''}
        .ultra-slider-container .swiper-pagination-fraction {
          font-size: ${(sliderModule.pagination_size || 12) + 4}px;
          font-weight: 600;
          color: ${sliderModule.pagination_active_color || 'var(--primary-color)'};
        }
        .ultra-slider-container .swiper-pagination-progressbar {
          position: absolute;
          ${isVertical
          ? `
            width: 4px;
            height: 100%;
            top: 0;
            left: auto;
            right: 0;
          `
          : `
            height: ${(sliderModule.pagination_size || 12) / 2}px;
            width: 100%;
            bottom: 0;
            top: auto;
          `}
          background: ${sliderModule.pagination_color || 'rgba(0, 0, 0, 0.2)'};
          border-radius: ${(sliderModule.pagination_size || 12) / 4}px;
        }
        .ultra-slider-container .swiper-pagination-progressbar .swiper-pagination-progressbar-fill {
          background: ${sliderModule.pagination_active_color || 'var(--primary-color)'};
          ${isVertical
          ? `
            width: 100%;
            height: 0%;
            top: 0;
            left: 0;
          `
          : `
            width: 0%;
            height: 100%;
            top: 0;
            left: 0;
          `}
        }
        /* Custom pagination styling */
        .ultra-slider-container .swiper-pagination {
          position: ${isVertical ||
        paginationOverlay ||
        !(sliderModule.auto_height ?? true)
          ? 'absolute'
          : 'relative'};
          z-index: ${paginationZIndex};
          pointer-events: all;
          ${isVertical
          ? `
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: auto;
            height: auto;
            flex-direction: column;
          `
          : paginationOverlay || !(sliderModule.auto_height ?? true)
            ? `
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            width: auto;
            height: auto;
            z-index: ${paginationZIndex};
            pointer-events: all;
          `
            : `
                display: flex;
                justify-content: center;
                align-items: center;
          `}
        }
        /* Pagination position overrides - must come after base styles */
        .ultra-slider-container .swiper-pagination.pagination-top {
          top: 10px !important;
          bottom: auto !important;
          left: 50% !important;
          right: auto !important;
          transform: translateX(-50%) !important;
          position: absolute !important;
          ${isVertical ? 'left: auto !important; right: 10px !important; top: 0 !important; transform: translateY(0) !important;' : ''}
        }
        /* Left and Right pagination for vertical sliders - rotated to match top/bottom styling */
        ${isVertical
          ? `
        .ultra-slider-container .swiper-pagination.pagination-left {
          left: 0 !important;
          right: auto !important;
          top: 50% !important;
          bottom: auto !important;
          transform: translateY(-50%) rotate(90deg) !important;
          transform-origin: center center !important;
          position: absolute !important;
          width: auto !important;
          height: auto !important;
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          z-index: ${paginationZIndex} !important;
          padding-left: 10px;
        }
        .ultra-slider-container .swiper-pagination.pagination-left .swiper-pagination-bullet {
          margin: 0 4px !important;
          transform-origin: center center !important;
        }
        .ultra-slider-container .swiper-pagination.pagination-left .swiper-pagination-bullets-dynamic {
          transform: none !important; /* Remove rotation from dynamic container, let parent handle it */
        }
        .ultra-slider-container .swiper-pagination.pagination-right {
          left: auto !important;
          right: 0 !important;
          top: 50% !important;
          bottom: auto !important;
          transform: translateY(-50%) rotate(-90deg) !important;
          transform-origin: center center !important;
          position: absolute !important;
          width: auto !important;
          height: auto !important;
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          z-index: ${paginationZIndex} !important;
          padding-right: 10px;
        }
        .ultra-slider-container .swiper-pagination.pagination-right .swiper-pagination-bullet {
          margin: 0 4px !important;
          transform-origin: center center !important;
        }
        .ultra-slider-container .swiper-pagination.pagination-right .swiper-pagination-bullets-dynamic {
          transform: none !important; /* Remove rotation from dynamic container, let parent handle it */
        }
        `
          : ''}
        .ultra-slider-container .swiper-pagination.pagination-bottom {
          top: auto !important;
          bottom: 10px !important;
          left: 50% !important;
          right: auto !important;
          transform: translateX(-50%) !important;
          position: absolute !important;
          z-index: ${paginationZIndex} !important;
          ${isVertical ? 'left: auto !important; right: 10px !important; top: auto !important; bottom: 0 !important; transform: translateY(0) !important;' : ''}
        }
        /* Scrollbar styling */
        .ultra-slider-container .swiper-scrollbar {
          position: absolute;
          ${isVertical
          ? `
            width: 8px;
            height: 100%;
            right: 0;
            top: 0;
            left: auto;
          `
          : `
            width: 100%;
            height: 8px;
            bottom: 0;
            top: auto;
          `}
          background: ${sliderModule.pagination_color || 'rgba(0, 0, 0, 0.1)'};
          border-radius: 4px;
          z-index: ${paginationZIndex};
        }
        .ultra-slider-container .swiper-scrollbar-drag {
          background: ${sliderModule.pagination_active_color || 'var(--primary-color)'};
          border-radius: 4px;
          ${isVertical
          ? `
            width: 100%;
          `
          : `
            height: 100%;
          `}
        }
        /* ===== EFFECT-SPECIFIC CSS ===== */
        /* FADE EFFECT: Swiper uses absolute positioning and opacity */
        /* Note: Swiper adds .swiper-fade class to the .swiper element, not the container */
        ${transitionEffect === 'fade'
          ? `
        .ultra-slider-container .swiper.swiper-fade .swiper-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .ultra-slider-container .swiper.swiper-fade .swiper-slide {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          opacity: 0 !important;
          transition: opacity ${sliderModule.transition_speed || 300}ms ease !important;
          pointer-events: none;
          z-index: 1;
        }
        .ultra-slider-container .swiper.swiper-fade .swiper-slide-active {
          opacity: 1 !important;
          pointer-events: auto;
          z-index: 2;
        }
        /* Ensure slide content fills the slide for fade effect */
        .ultra-slider-container .swiper.swiper-fade .slide-content {
          height: 100%;
        }
        `
          : ''}
      </style>

      <div class="ultra-slider-container uc-module-container" data-slider-id="${sliderId}">
        ${paginationOutside && paginationPosition === 'top' ? getPaginationRowTemplate() : ''}
        <div
          class="swiper ${uniqueClass}"
          data-preview-context="${previewContext || 'dashboard'}"
          ${ref((el?: Element) => {
            if (!el || !(el instanceof HTMLElement)) return;

            // Read context from element attribute, not closure
            const currentContext = el.getAttribute('data-preview-context') || 'dashboard';
            const wasInitialized = el.hasAttribute('data-swiper-initialized');
            const previousInitContext = el.getAttribute('data-swiper-init-context');

            // Store config hash to detect config changes
            const configHash = JSON.stringify({
              pagination_style: sliderModule.pagination_style,
              show_pagination: sliderModule.show_pagination,
              slider_direction: sliderModule.slider_direction,
              transition_effect: sliderModule.transition_effect,
              centered_slides: sliderModule.centered_slides,
            });
            const previousConfigHash = el.getAttribute('data-config-hash');
            const configChanged = previousConfigHash && previousConfigHash !== configHash;

            // Allow re-init if context changed OR config changed
            if (
              wasInitialized &&
              previousInitContext === currentContext &&
              !configChanged &&
              (el as any).swiper
            ) {
              return; // Same context and config, already initialized
            }

            // Context or config changed or not initialized - proceed
            if (wasInitialized && (previousInitContext !== currentContext || configChanged)) {
              // Clean up old instance
              const oldSwiper = (el as any).swiper;
              if (oldSwiper) {
                oldSwiper.destroy(true, true);
                delete (el as any).swiper;
              }
              SwiperInstanceManager.destroyInstance(sliderId);
              // Clean up context tracking attributes
              el.removeAttribute('data-swiper-init-context');
            }

            // Mark as initializing to prevent duplicate attempts
            el.setAttribute('data-swiper-initialized', 'true');
            el.setAttribute('data-config-hash', configHash);

            const initFn = (window as any)[`initSwiper_${sliderId}`];
            if (!initFn) {
              console.error(
                '[Slider] Initialization function not found for:',
                sliderId,
                'context:',
                currentContext
              );
              return;
            }

            // In preview contexts, add extra delay to ensure DOM is ready
            const isPreview = currentContext === 'ha-preview' || currentContext === 'live';
            const isDashboard = currentContext === 'dashboard' || !currentContext;

            // Different initialization strategies based on context
            if (isPreview) {
              // Preview contexts need multiple retries with longer delays
              // For Live Preview, use even longer delays as DOM takes longer to stabilize
              const isLivePreview = currentContext === 'live';
              const delayMultiplier = isLivePreview ? 2 : 1;
              const maxAttempts = isLivePreview ? 40 : 30;
              const initialDelay = isLivePreview ? 300 : 100;

              const tryInit = (attempt = 1) => {
                const slideCount = el.querySelectorAll('.swiper-slide').length;
                const containerWidth = el.offsetWidth;
                const containerHeight = el.offsetHeight;

                if (slideCount > 0 && (containerWidth > 0 || containerHeight > 0)) {
                  // Found slides and container has dimensions, initialize immediately
                  initFn(el);
                } else if (attempt < maxAttempts) {
                  // Keep retrying with exponential backoff
                  const delay = Math.min(100 * attempt * delayMultiplier, 1000);
                  setTimeout(() => tryInit(attempt + 1), delay);
                } else {
                  console.error('[Slider] Failed to initialize after max attempts:', {
                    sliderId,
                    context: currentContext,
                    slideCount,
                    containerWidth,
                    containerHeight,
                  });
                  el.removeAttribute('data-swiper-initialized');
                }
              };

              // Start with initial delay for preview contexts
              setTimeout(() => tryInit(1), initialDelay);
            } else {
              // Dashboard: immediate initialization
              initFn(el);
            }
          })}
        >
          <div class="swiper-wrapper">
            ${pages.map(
              pageModules => html`
                <div class="swiper-slide">
                  <div class="slide-content">
                    ${pageModules.map(childModule => {
                      const childModuleHandler = registry.getModule(childModule.type);
                      if (!childModuleHandler) {
                        return html`<div>Unknown module type: ${childModule.type}</div>`;
                      }

                      // Check visibility
                      const isVisible = logicService.evaluateModuleVisibility(childModule);
                      if (!isVisible) return '';

                      // Detect if this is a layout module (handles its own flex layout)
                      const childType = (childModule as any)?.type;
                      const isLayoutModule =
                        childType === 'horizontal' ||
                        childType === 'vertical' ||
                        childType === 'slider';

                      // For layout modules, let them handle their own sizing
                      // For other modules, wrap them to ensure proper rendering
                      if (isLayoutModule) {
                        return html`
                          <div class="child-module-wrapper" style="width: 100%;">
                            ${childModuleHandler.renderPreview(
                              childModule,
                              hass,
                              config,
                              previewContext
                            )}
                          </div>
                        `;
                      }

                      // Regular modules - render as-is
                      return html`
                        <div class="child-module-wrapper" style="width: 100%;">
                          ${childModuleHandler.renderPreview(
                            childModule,
                            hass,
                            config,
                            previewContext
                          )}
                        </div>
                      `;
                    })}
                  </div>
                </div>
              `
            )}
          </div>

          ${sliderModule.show_pagination && (paginationOverlay || isVertical)
            ? isScrollbarPagination
              ? html`
                  <div
                    class="swiper-scrollbar"
                    data-slider-id="${sliderId}"
                  ></div>
                `
              : html`
                  <div
                    class="swiper-pagination pagination-${paginationPosition}"
                    data-slider-id="${sliderId}"
                  ></div>
                `
            : ''}
          ${sliderModule.show_arrows
            ? html`
                <div class="swiper-button-prev">
                  <ha-icon
                    icon="${(() => {
                      const currentIcon = sliderModule.prev_arrow_icon || 'mdi:chevron-left';
                      if (isVertical) {
                        // Auto-convert horizontal icons to vertical
                        if (currentIcon === 'mdi:chevron-left') return 'mdi:chevron-up';
                        return currentIcon;
                      } else {
                        // Auto-convert vertical icons to horizontal
                        if (currentIcon === 'mdi:chevron-up') return 'mdi:chevron-left';
                        return currentIcon;
                      }
                    })()}"
                  ></ha-icon>
                </div>
                <div class="swiper-button-next">
                  <ha-icon
                    icon="${(() => {
                      const currentIcon = sliderModule.next_arrow_icon || 'mdi:chevron-right';
                      if (isVertical) {
                        // Auto-convert horizontal icons to vertical
                        if (currentIcon === 'mdi:chevron-right') return 'mdi:chevron-down';
                        return currentIcon;
                      } else {
                        // Auto-convert vertical icons to horizontal
                        if (currentIcon === 'mdi:chevron-down') return 'mdi:chevron-right';
                        return currentIcon;
                      }
                    })()}"
                  ></ha-icon>
                </div>
              `
            : ''}
        </div>
        ${paginationOutside && paginationPosition !== 'top' ? getPaginationRowTemplate() : ''}
      </div>
    `;
  }

  // Map Ultra Card slider configuration to Swiper options
  private mapConfigToSwiper(
    sliderModule: SliderModule,
    pageCount: number,
    sliderId: string
  ): any {
    // Determine slides per view - use user setting, but default to 1 for pagebreak-based sliders
    const slidesPerView = sliderModule.slides_per_view || 1;
    const spaceBetween = sliderModule.space_between ?? (sliderModule.gap || 0);

    // Map layout direction
    let direction: 'horizontal' | 'vertical' = 'horizontal';
    if (sliderModule.slider_direction === 'vertical') {
      direction = 'vertical';
    }

    // Map transition effects - only slide and fade are supported
    let effect: 'slide' | 'fade' = 'slide';
    let effectOptions: any = {};

    const transitionEffect = sliderModule.transition_effect || 'slide';

    // Handle effects
    if (transitionEffect === 'fade') {
      effect = 'fade';
      effectOptions = {
        fadeEffect: {
          crossFade: true,
        },
      };
    } else {
      // Default to slide for any other value (including legacy values)
      effect = 'slide';
      // slider_direction setting controls direction
      if (sliderModule.slider_direction === 'vertical') {
        direction = 'vertical';
      }
    }

    // Fade requires slidesPerView=1, slide can use any value
    const finalSlidesPerView = effect === 'fade' ? 1 : slidesPerView;

    // Map pagination
    let paginationOptions: any = false;
    let scrollbarOptions: any = false;

    if (sliderModule.show_pagination) {
      const paginationSelector = `.swiper-pagination[data-slider-id="${sliderId}"]`;
      const scrollbarSelector = `.swiper-scrollbar[data-slider-id="${sliderId}"]`;
      const style = sliderModule.pagination_style || 'dots';

      // Handle scrollbar separately (it's not pagination)
      if (style === 'scrollbar') {
        scrollbarOptions = {
          el: scrollbarSelector,
          draggable: true,
        };
      } else {
        paginationOptions = {
          el: paginationSelector,
          clickable: true,
        };

        if (style === 'dots') {
          paginationOptions.type = 'bullets';
        } else if (style === 'dots-and-dash') {
          paginationOptions.type = 'bullets';
        } else if (style === 'dash-lines') {
          paginationOptions.type = 'bullets';
        } else if (style === 'numbers') {
          // Custom render for numbers
          paginationOptions.type = 'bullets';
          paginationOptions.renderBullet = (index: number, className: string) => {
            const size = sliderModule.pagination_size || 12;
            const bgColor = sliderModule.pagination_color || 'var(--primary-text-color)';
            const activeBgColor = sliderModule.pagination_active_color || 'var(--primary-color)';
            const textColor = className.includes('active') ? 'white' : bgColor;
            const bg = className.includes('active') ? activeBgColor : 'transparent';

            return `<div class="${className}" style="
              min-width: ${size * 2.5}px !important;
              height: ${size * 2.5}px !important;
              display: inline-flex !important;
              align-items: center !important;
              justify-content: center !important;
              border-radius: 4px !important;
              font-size: ${size + 2}px !important;
              line-height: 1 !important;
              margin: 0 4px !important;
              padding: 4px !important;
              border: 2px solid ${bgColor} !important;
              background: ${bg} !important;
              color: ${textColor} !important;
              opacity: 1 !important;
              cursor: pointer !important;
              font-weight: 600 !important;
            ">${index + 1}</div>`;
          };
        } else if (style === 'fraction') {
          paginationOptions.type = 'fraction';
        } else if (style === 'progressbar') {
          paginationOptions.type = 'progressbar';
        } else if (style === 'dynamic') {
          paginationOptions.type = 'bullets';
          // Disable Swiper's built-in dynamic bullets - we handle it manually
          paginationOptions.dynamicBullets = false;
          paginationOptions.hideOnClick = false;
        }
      }
    }

    // Enable Swiper's built-in navigation for slide effect
    const navigationOptions = sliderModule.show_arrows
      ? {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }
      : false;

    // Auto-play
    let autoplayOptions: any = false;
    if (sliderModule.auto_play) {
      autoplayOptions = {
        delay: sliderModule.auto_play_delay || 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: sliderModule.pause_on_hover ?? true,
      };
    }

    // Modules are now registered globally via Swiper.use()
    // We don't need to pass them in the config anymore

    const enableLoop = sliderModule.loop ?? true;

    // Fade effect doesn't work well with loop mode (loop duplicates slides)
    // Slide effect can use loop mode
    const canUseLoop = effect === 'slide';

    // For loop mode to work with any slide count, we need at least 2 slides
    const canEnableLoop = enableLoop && pageCount >= 2 && canUseLoop;

    // Rewind is different from loop - it just jumps back to start without duplicating slides
    // Rewind works fine with fade effect
    const shouldUseRewind = !canEnableLoop && enableLoop;

    const transitionSpeed = sliderModule.transition_speed || 300;

    const swiperConfig: any = {
      // modules are registered globally - don't pass them in config
      direction,
      effect,
      ...effectOptions,
      slidesPerView: finalSlidesPerView,
      slidesPerGroup: 1, // CRITICAL: Must be set before loop check
      spaceBetween,
      loop: canEnableLoop,
      // Rewind enables continuous navigation by jumping back to start/end
      // This works with ALL effects including cube, flip, fade
      rewind: shouldUseRewind,
      speed: transitionSpeed,
      pagination: paginationOptions,
      scrollbar: scrollbarOptions,
      navigation: navigationOptions,
      autoplay: autoplayOptions,
      keyboard: sliderModule.allow_keyboard
        ? {
            enabled: true,
            onlyInViewport: true,
          }
        : false,
      mousewheel: sliderModule.allow_mousewheel
        ? {
            enabled: true,
            forceToAxis: true,
          }
        : false,
      allowTouchMove: sliderModule.allow_swipe ?? true,
      // CRITICAL: Disable Swiper's autoHeight (uses max height across all slides)
      // We handle per-slide height manually in slideChange event
      autoHeight: false,
      // Centered slides only works when slides_per_view > 1
      centeredSlides: (sliderModule.centered_slides ?? true) && finalSlidesPerView > 1,
      // Observer for dynamic content updates
      observer: true,
      observeParents: true,
      observeSlideChildren: true,
      // CRITICAL: Allow clicks on interactive elements (buttons, links) inside slides
      // Without this, Swiper intercepts all touch/click events and prevents buttons from working
      preventClicks: false,
      preventClicksPropagation: false,
      // Don't prevent default touch behavior - allows buttons/links to work
      touchStartPreventDefault: false,
      // Use passive listeners for better scroll performance
      passiveListeners: true,
      // Allow elements with 'swiper-no-swiping' class to receive events without triggering swipe
      noSwiping: true,
      noSwipingClass: 'swiper-no-swiping',
      // Also allow common interactive elements to receive clicks
      noSwipingSelector: 'button, a, input, select, textarea, .popup-trigger, [role="button"]',
      // CRITICAL: Only listen for touch/mouse events on the swiper wrapper, not child content
      // This allows interactive elements (buttons, links, popups) inside slides to work properly
      touchEventsTarget: 'wrapper',
    };

    // Loop mode configuration
    if (canEnableLoop) {
      swiperConfig.watchSlidesProgress = true;
    }

    return swiperConfig;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const sliderModule = module as SliderModule;
    const errors = [...baseValidation.errors];

    // Validate modules array exists
    if (!sliderModule.modules) {
      errors.push('Slider must have a modules array');
    }

    // Validate numeric ranges (only validate height when not using auto-height)
    if (
      sliderModule.auto_height === false &&
      sliderModule.slider_height &&
      (sliderModule.slider_height < 50 || sliderModule.slider_height > 1000)
    ) {
      errors.push('Slider height must be between 50 and 1000 pixels');
    }

    if (
      sliderModule.slides_per_view &&
      (sliderModule.slides_per_view < 1 || sliderModule.slides_per_view > 5)
    ) {
      errors.push('Slides per view must be between 1 and 5');
    }

    return { valid: errors.length === 0, errors };
  }

  getStyles(): string {
    // Swiper CSS is imported directly via import statements
    // Custom styles for Ultra Card-specific features are in renderPreview
    return ``;
  }
}
