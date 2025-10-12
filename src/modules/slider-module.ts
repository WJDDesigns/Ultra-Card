import { TemplateResult, html, css } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig, SliderModule } from '../types';
import { UltraLinkComponent } from '../components/ultra-link';
import { getImageUrl } from '../utils/image-upload';
import { getModuleRegistry } from './module-registry';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { localize } from '../localize/localize';
import { logicService } from '../services/logic-service';

// Global state manager for slider instances
class SliderStateManager {
  private static states = new Map<string, number>();
  private static timers = new Map<string, any>();
  private static initialized = new Map<string, boolean>();
  private static renderCount = new Map<string, number>();
  private static lastSlideChange = new Map<string, number>();
  private static currentDelay = new Map<string, number>();

  static getCurrentSlide(sliderId: string): number {
    return this.states.get(sliderId) || 0;
  }

  static setCurrentSlide(sliderId: string, index: number): void {
    const now = Date.now();
    this.states.set(sliderId, index);
    this.lastSlideChange.set(sliderId, now);

    // Dispatch event to trigger re-render in split preview
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ultra-card-slider-update'));
    }
  }

  static getTimer(sliderId: string): any {
    return this.timers.get(sliderId);
  }

  static setTimer(sliderId: string, timer: any): void {
    this.timers.set(sliderId, timer);
  }

  static clearTimer(sliderId: string): void {
    const timer = this.timers.get(sliderId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(sliderId);
    }
  }

  static isInitialized(sliderId: string): boolean {
    return this.initialized.get(sliderId) || false;
  }

  static setInitialized(sliderId: string, value: boolean): void {
    this.initialized.set(sliderId, value);
  }

  static incrementRenderCount(sliderId: string): number {
    const count = (this.renderCount.get(sliderId) || 0) + 1;
    this.renderCount.set(sliderId, count);
    return count;
  }

  static getCurrentDelay(sliderId: string): number | undefined {
    return this.currentDelay.get(sliderId);
  }

  static setCurrentDelay(sliderId: string, delay: number): void {
    this.currentDelay.set(sliderId, delay);
  }

  static cleanup(sliderId: string): void {
    this.clearTimer(sliderId);
    this.states.delete(sliderId);
    this.initialized.delete(sliderId);
    this.renderCount.delete(sliderId);
    this.lastSlideChange.delete(sliderId);
    this.currentDelay.delete(sliderId);
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
      pagination_position: 'bottom',
      pagination_color: 'var(--primary-text-color)',
      pagination_active_color: 'var(--primary-color)',
      pagination_size: 12,
      // Navigation defaults
      show_arrows: true,
      arrow_position: 'inside',
      arrow_style: 'circle',
      arrow_size: 40,
      arrow_color: 'var(--primary-text-color)',
      arrow_background_color: 'rgba(0, 0, 0, 0.3)',
      prev_arrow_icon: 'mdi:chevron-left',
      next_arrow_icon: 'mdi:chevron-right',
      arrows_always_visible: false,
      // Transition defaults
      transition_effect: 'slide-left',
      transition_speed: 300,
      transition_easing: 'ease-in-out',
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
      slider_height: 300,
      slider_width: '100%',
      gap: 0,
      slides_per_view: 1,
      space_between: 0,
      vertical_alignment: 'top',
      // Mobile defaults
      mobile_slides_per_view: 1,
      mobile_space_between: 0,
      // Global action configuration
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      // Logic (visibility) defaults
      display_mode: 'always',
      display_conditions: [],
      smart_scaling: true,
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
            'Slider Width',
            'Width of the slider container (e.g., 100%, 400px)',
            hass,
            { slider_width: sliderModule.slider_width || '100%' },
            [this.textField('slider_width')],
            (e: CustomEvent) => updateModule({ slider_width: e.detail.value.slider_width })
          )}
          ${this.renderFieldSection(
            'Slider Height',
            'Height of the slider in pixels',
            hass,
            { slider_height: sliderModule.slider_height || 300 },
            [this.numberField('slider_height', 50, 1000, 10)],
            (e: CustomEvent) => updateModule({ slider_height: e.detail.value.slider_height })
          )}
          ${this.renderFieldSection(
            'Slides Per View',
            'Number of slides visible at once',
            hass,
            { slides_per_view: sliderModule.slides_per_view || 1 },
            [this.numberField('slides_per_view', 1, 5, 1)],
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
          ${this.renderFieldSection(
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
          )}
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
                      { value: 'numbers', label: 'Numbers' },
                      { value: 'fraction', label: 'Fraction (1/5)' },
                      { value: 'progressbar', label: 'Progress Bar' },
                    ]),
                  ],
                  (e: CustomEvent) =>
                    updateModule({ pagination_style: e.detail.value.pagination_style })
                )}
                ${this.renderFieldSection(
                  'Pagination Position',
                  'Where to show pagination indicators',
                  hass,
                  { pagination_position: sliderModule.pagination_position || 'bottom' },
                  [
                    this.selectField('pagination_position', [
                      { value: 'top', label: 'Top' },
                      { value: 'bottom', label: 'Bottom' },
                      { value: 'left', label: 'Left' },
                      { value: 'right', label: 'Right' },
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
                ${this.renderFieldSection(
                  'Pagination Color',
                  'Color of inactive pagination indicators',
                  hass,
                  {
                    pagination_color: sliderModule.pagination_color || 'var(--primary-text-color)',
                  },
                  [this.textField('pagination_color')],
                  (e: CustomEvent) =>
                    updateModule({ pagination_color: e.detail.value.pagination_color })
                )}
                ${this.renderFieldSection(
                  'Active Pagination Color',
                  'Color of the active pagination indicator',
                  hass,
                  {
                    pagination_active_color:
                      sliderModule.pagination_active_color || 'var(--primary-color)',
                  },
                  [this.textField('pagination_active_color')],
                  (e: CustomEvent) =>
                    updateModule({
                      pagination_active_color: e.detail.value.pagination_active_color,
                    })
                )}
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
                ${this.renderFieldSection(
                  'Arrow Position',
                  'Position arrows inside or outside the slider',
                  hass,
                  { arrow_position: sliderModule.arrow_position || 'inside' },
                  [
                    this.selectField('arrow_position', [
                      { value: 'inside', label: 'Inside' },
                      { value: 'outside', label: 'Outside' },
                    ]),
                  ],
                  (e: CustomEvent) =>
                    updateModule({ arrow_position: e.detail.value.arrow_position })
                )}
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
                <div
                  style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
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
                  'Previous Arrow Icon',
                  'Icon for the previous arrow',
                  hass,
                  { prev_arrow_icon: sliderModule.prev_arrow_icon || 'mdi:chevron-left' },
                  [this.iconField('prev_arrow_icon')],
                  (e: CustomEvent) =>
                    updateModule({ prev_arrow_icon: e.detail.value.prev_arrow_icon })
                )}
                ${this.renderFieldSection(
                  'Next Arrow Icon',
                  'Icon for the next arrow',
                  hass,
                  { next_arrow_icon: sliderModule.next_arrow_icon || 'mdi:chevron-right' },
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
            { transition_effect: sliderModule.transition_effect || 'slide-left' },
            [
              this.selectField('transition_effect', [
                { value: 'slide-left', label: 'Slide Left' },
                { value: 'slide-right', label: 'Slide Right' },
                { value: 'slide-top', label: 'Slide Top' },
                { value: 'slide-bottom', label: 'Slide Bottom' },
                { value: 'fade', label: 'Fade' },
                { value: 'zoom-in', label: 'Zoom In' },
                { value: 'zoom-out', label: 'Zoom Out' },
                { value: 'circle', label: 'Circle' },
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
          ${this.renderFieldSection(
            'Transition Easing',
            'Timing function for the transition',
            hass,
            { transition_easing: sliderModule.transition_easing || 'ease-in-out' },
            [
              this.selectField('transition_easing', [
                { value: 'linear', label: 'Linear' },
                { value: 'ease', label: 'Ease' },
                { value: 'ease-in', label: 'Ease In' },
                { value: 'ease-out', label: 'Ease Out' },
                { value: 'ease-in-out', label: 'Ease In Out' },
              ]),
            ],
            (e: CustomEvent) =>
              updateModule({ transition_easing: e.detail.value.transition_easing })
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

        <!-- MOBILE RESPONSIVE -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            MOBILE RESPONSIVE
          </div>

          ${this.renderFieldSection(
            'Mobile Slides Per View',
            'Number of slides visible on mobile devices',
            hass,
            { mobile_slides_per_view: sliderModule.mobile_slides_per_view || 1 },
            [this.numberField('mobile_slides_per_view', 1, 3, 1)],
            (e: CustomEvent) =>
              updateModule({ mobile_slides_per_view: e.detail.value.mobile_slides_per_view })
          )}
          ${this.renderFieldSection(
            'Mobile Space Between',
            'Space between slides on mobile in pixels',
            hass,
            { mobile_space_between: sliderModule.mobile_space_between || 0 },
            [this.numberField('mobile_space_between', 0, 50, 5)],
            (e: CustomEvent) =>
              updateModule({ mobile_space_between: e.detail.value.mobile_space_between })
          )}
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
    return this.renderPreview(module, hass, config);
  }

  renderPreview(module: CardModule, hass: HomeAssistant, config: UltraCardConfig): TemplateResult {
    const sliderModule = module as SliderModule;
    const registry = getModuleRegistry();

    // Track render count for internal state management
    SliderStateManager.incrementRenderCount(sliderModule.id);

    // Group modules by page breaks
    const pages: CardModule[][] = [];
    let currentPageModules: CardModule[] = [];

    for (const childModule of sliderModule.modules) {
      if (childModule.type === 'pagebreak') {
        // Page break found - save current page and start new one
        pages.push([...currentPageModules]);
        currentPageModules = [];
      } else {
        // Regular module - add to current page
        currentPageModules.push(childModule);
      }
    }
    // Don't forget the last page
    if (currentPageModules.length > 0 || pages.length === 0) {
      pages.push(currentPageModules);
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

    // Get or initialize state
    const currentIndex = SliderStateManager.getCurrentSlide(sliderModule.id);

    // Ensure current slide index is valid
    if (currentIndex >= pages.length) {
      SliderStateManager.setCurrentSlide(sliderModule.id, 0);
    }

    const isMobile = window.innerWidth < 768;
    const slidesPerView = isMobile
      ? sliderModule.mobile_slides_per_view || 1
      : sliderModule.slides_per_view || 1;
    const spaceBetween = isMobile
      ? sliderModule.mobile_space_between || 0
      : sliderModule.space_between || 0;

    const verticalAlignment = sliderModule.vertical_alignment || 'top';
    const alignMap: Record<string, string> = {
      top: 'flex-start',
      center: 'center',
      bottom: 'flex-end',
      stretch: 'stretch',
    };

    const goToSlide = (index: number, event?: Event) => {
      if (index < 0 || index >= pages.length) {
        if (sliderModule.loop) {
          SliderStateManager.setCurrentSlide(sliderModule.id, index < 0 ? pages.length - 1 : 0);
        } else {
          return;
        }
      } else {
        SliderStateManager.setCurrentSlide(sliderModule.id, index);
      }

      // Reset auto-play timer on manual navigation to maintain consistent timing
      if (sliderModule.auto_play && event) {
        // Manual navigation - restart timer to maintain consistent timing
        startAutoPlay();
      }

      // Dispatch custom event to trigger card re-render
      // Try to find the slider element to dispatch the event
      const target =
        (event?.target as HTMLElement) ||
        document.querySelector(`[data-slider-id="${sliderModule.id}"]`);

      if (target) {
        const customEvent = new CustomEvent('slider-state-changed', {
          bubbles: true,
          composed: true,
          detail: { sliderId: sliderModule.id, index },
        });
        target.dispatchEvent(customEvent);
      } else {
        // Fallback: dispatch on window if we can't find the element
        window.dispatchEvent(
          new CustomEvent('slider-state-changed', {
            bubbles: true,
            composed: true,
            detail: { sliderId: sliderModule.id, index },
          })
        );
      }
    };

    const nextSlide = (event?: Event) => {
      const current = SliderStateManager.getCurrentSlide(sliderModule.id);
      goToSlide(current + 1, event);
    };

    const prevSlide = (event?: Event) => {
      const current = SliderStateManager.getCurrentSlide(sliderModule.id);
      goToSlide(current - 1, event);
    };

    // Touch and Mouse event handlers for swipe/drag
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;
    let mouseStartX = 0;
    let mouseStartY = 0;
    let isMouseDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (!sliderModule.allow_swipe) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isSwiping = false;
      SliderStateManager.clearTimer(sliderModule.id);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!sliderModule.allow_swipe || !touchStartX) return;

      const touchCurrentX = e.touches[0].clientX;
      const touchCurrentY = e.touches[0].clientY;
      const diffX = Math.abs(touchStartX - touchCurrentX);
      const diffY = Math.abs(touchStartY - touchCurrentY);

      // If horizontal swipe is dominant, prevent default to stop dashboard scroll
      if (diffX > diffY && diffX > 10) {
        e.preventDefault();
        e.stopPropagation();
        isSwiping = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!sliderModule.allow_swipe) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      // Only trigger if horizontal swipe is dominant
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        e.preventDefault();
        e.stopPropagation();
        if (diffX > 0) {
          nextSlide(e);
        } else {
          prevSlide(e);
        }
        // Auto-play timer will be restarted by goToSlide if needed
      } else {
        // No slide change occurred, restart auto-play if it was running
        if (sliderModule.auto_play) {
          startAutoPlay();
        }
      }

      touchStartX = 0;
      touchStartY = 0;
      isSwiping = false;
    };

    // Mouse drag handlers
    const handleMouseDown = (e: MouseEvent) => {
      if (!sliderModule.allow_swipe) return;
      // Don't interfere with clicks on buttons, links, or interactive elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('.slider-arrow') ||
        target.closest('.pagination-dot') ||
        target.closest('.pagination-number')
      ) {
        return;
      }

      mouseStartX = e.clientX;
      mouseStartY = e.clientY;
      isMouseDragging = true;
      SliderStateManager.clearTimer(sliderModule.id);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!sliderModule.allow_swipe || !isMouseDragging || !mouseStartX) return;

      const diffX = Math.abs(mouseStartX - e.clientX);
      const diffY = Math.abs(mouseStartY - e.clientY);

      // Once we detect significant horizontal movement, prevent default
      if (diffX > diffY && diffX > 10) {
        e.preventDefault();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!sliderModule.allow_swipe || !isMouseDragging) return;

      const mouseEndX = e.clientX;
      const mouseEndY = e.clientY;
      const diffX = mouseStartX - mouseEndX;
      const diffY = mouseStartY - mouseEndY;

      // Only trigger if horizontal drag is dominant and significant
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        e.preventDefault();
        if (diffX > 0) {
          nextSlide(e);
        } else {
          prevSlide(e);
        }
        // Auto-play timer will be restarted by goToSlide if needed
      } else {
        // No slide change occurred, restart auto-play if it was running
        if (sliderModule.auto_play) {
          startAutoPlay();
        }
      }

      mouseStartX = 0;
      mouseStartY = 0;
      isMouseDragging = false;
    };

    const handleMouseLeave = () => {
      if (isMouseDragging) {
        isMouseDragging = false;
        mouseStartX = 0;
        mouseStartY = 0;
        // Only restart auto-play if no slide change occurred during drag
        if (sliderModule.auto_play) {
          startAutoPlay();
        }
      }
    };

    // Auto-play functionality
    const startAutoPlay = () => {
      if (!sliderModule.auto_play) return;

      // Check if timer already exists - don't restart if it's already running
      const existingTimer = SliderStateManager.getTimer(sliderModule.id);
      if (existingTimer) return;

      const timer = setInterval(() => {
        nextSlide(); // No event parameter - this is auto-play, not manual navigation
      }, sliderModule.auto_play_delay || 3000);

      SliderStateManager.setTimer(sliderModule.id, timer);
    };

    const stopAutoPlay = () => {
      SliderStateManager.clearTimer(sliderModule.id);
    };

    // If auto-play is disabled, ensure cleanup
    if (!sliderModule.auto_play && SliderStateManager.isInitialized(sliderModule.id)) {
      SliderStateManager.clearTimer(sliderModule.id);
      SliderStateManager.setInitialized(sliderModule.id, false);
    }

    // Check if delay has changed - if so, restart timer
    const currentDelay = SliderStateManager.getCurrentDelay(sliderModule.id);
    const newDelay = sliderModule.auto_play_delay || 3000;
    const delayChanged = currentDelay !== undefined && currentDelay !== newDelay;

    if (delayChanged && sliderModule.auto_play) {
      SliderStateManager.clearTimer(sliderModule.id);
      SliderStateManager.setInitialized(sliderModule.id, false);
    }

    // Start auto-play if enabled (ONLY if not already initialized)
    // This prevents creating multiple timers on re-renders
    const existingTimer = SliderStateManager.getTimer(sliderModule.id);
    const isInit = SliderStateManager.isInitialized(sliderModule.id);

    if (sliderModule.auto_play && !existingTimer && !isInit) {
      SliderStateManager.setInitialized(sliderModule.id, true);
      SliderStateManager.setCurrentDelay(sliderModule.id, newDelay);
      setTimeout(() => startAutoPlay(), 100);
    }

    const renderPagination = () => {
      if (!sliderModule.show_pagination) return '';

      const style = sliderModule.pagination_style || 'dots';
      const position = sliderModule.pagination_position || 'bottom';
      const size = sliderModule.pagination_size || 12;
      const current = SliderStateManager.getCurrentSlide(sliderModule.id);

      if (style === 'dots') {
        return html`
          <div
            class="slider-pagination pagination-${position}"
            style="
              display: flex;
              gap: 8px;
              justify-content: center;
              align-items: center;
            "
          >
            ${pages.map(
              (page, index) => html`
                <div
                  class="pagination-dot ${index === current ? 'active' : ''}"
                  @click=${(e: Event) => goToSlide(index, e)}
                  style="
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    background: ${index === current
                    ? sliderModule.pagination_active_color || 'var(--primary-color)'
                    : sliderModule.pagination_color || 'var(--primary-text-color)'};
                    opacity: ${index === current ? '1' : '0.5'};
                    cursor: pointer;
                    transition: all 0.3s;
                  "
                ></div>
              `
            )}
          </div>
        `;
      } else if (style === 'numbers') {
        return html`
          <div
            class="slider-pagination pagination-${position}"
            style="
              display: flex;
              gap: 4px;
              justify-content: center;
              align-items: center;
            "
          >
            ${pages.map(
              (page, index) => html`
                <div
                  class="pagination-number ${index === current ? 'active' : ''}"
                  @click=${(e: Event) => goToSlide(index, e)}
                  style="
                    min-width: ${size * 2}px;
                    height: ${size * 2}px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    background: ${index === current
                    ? sliderModule.pagination_active_color || 'var(--primary-color)'
                    : 'transparent'};
                    border: 2px solid ${index === current
                    ? sliderModule.pagination_active_color || 'var(--primary-color)'
                    : sliderModule.pagination_color || 'var(--primary-text-color)'};
                    color: ${index === current
                    ? 'white'
                    : sliderModule.pagination_color || 'var(--primary-text-color)'};
                    font-size: ${size}px;
                    font-weight: ${index === current ? '600' : '400'};
                    cursor: pointer;
                    transition: all 0.3s;
                  "
                >
                  ${index + 1}
                </div>
              `
            )}
          </div>
        `;
      } else if (style === 'fraction') {
        return html`
          <div
            class="slider-pagination pagination-${position}"
            style="
              display: flex;
              justify-content: center;
              align-items: center;
              font-size: ${size + 4}px;
              font-weight: 600;
              color: ${sliderModule.pagination_active_color || 'var(--primary-color)'};
            "
          >
            ${current + 1} / ${pages.length}
          </div>
        `;
      } else if (style === 'progressbar') {
        const progress = ((current + 1) / pages.length) * 100;
        return html`
          <div
            class="slider-pagination pagination-${position}"
            style="
              width: 100%;
              height: ${size / 2}px;
              background: ${sliderModule.pagination_color || 'rgba(0, 0, 0, 0.2)'};
              border-radius: ${size / 4}px;
              overflow: hidden;
            "
          >
            <div
              class="progress-bar"
              style="
                height: 100%;
                width: ${progress}%;
                background: ${sliderModule.pagination_active_color || 'var(--primary-color)'};
                transition: width ${sliderModule.transition_speed ||
              300}ms ${sliderModule.transition_easing || 'ease-in-out'};
              "
            ></div>
          </div>
        `;
      }

      return '';
    };

    const renderArrows = () => {
      if (!sliderModule.show_arrows) return '';

      const arrowSize = sliderModule.arrow_size || 40;
      const arrowStyle = sliderModule.arrow_style || 'circle';
      const position = sliderModule.arrow_position || 'inside';
      const alwaysVisible = sliderModule.arrows_always_visible || false;

      const buttonStyle = `
        width: ${arrowSize}px;
        height: ${arrowSize}px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: none;
        transition: all 0.3s;
        background: ${arrowStyle !== 'minimal' ? sliderModule.arrow_background_color || 'rgba(0, 0, 0, 0.5)' : 'transparent'};
        color: ${sliderModule.arrow_color || 'white'};
        border: ${arrowStyle === 'square' || arrowStyle === 'minimal' ? '2px solid ' + (sliderModule.arrow_color || 'white') : 'none'};
        border-radius: ${arrowStyle === 'circle' ? '50%' : arrowStyle === 'square' ? '4px' : '0'};
        opacity: ${alwaysVisible ? '1' : '0'};
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 10;
      `;

      return html`
        <button
          class="slider-arrow slider-arrow-prev"
          @click=${(e: Event) => {
            e.stopPropagation();
            prevSlide(e);
          }}
          style="${buttonStyle} left: ${position === 'outside' ? `-${arrowSize + 10}px` : '10px'};"
        >
          <ha-icon icon="${sliderModule.prev_arrow_icon || 'mdi:chevron-left'}"></ha-icon>
        </button>
        <button
          class="slider-arrow slider-arrow-next"
          @click=${(e: Event) => {
            e.stopPropagation();
            nextSlide(e);
          }}
          style="${buttonStyle} right: ${position === 'outside' ? `-${arrowSize + 10}px` : '10px'};"
        >
          <ha-icon icon="${sliderModule.next_arrow_icon || 'mdi:chevron-right'}"></ha-icon>
        </button>
      `;
    };

    const current = SliderStateManager.getCurrentSlide(sliderModule.id);
    const transitionEffect = sliderModule.transition_effect || 'slide-left';
    const transitionSpeed = sliderModule.transition_speed || 300;
    const transitionEasing = sliderModule.transition_easing || 'ease-in-out';

    // Determine if we're using directional slides or effect-based transitions
    const isSlideEffect = transitionEffect.startsWith('slide-');
    const isAbsoluteEffect = ['fade', 'zoom-in', 'zoom-out', 'circle'].includes(transitionEffect);

    return html`
      <style>
        .slider-container {
          position: relative;
          width: ${sliderModule.slider_width || '100%'};
          height: ${sliderModule.slider_height || 300}px;
          overflow: hidden;
          margin: 0 auto;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          cursor: ${sliderModule.allow_swipe ? 'grab' : 'default'};
        }
        .slider-container * {
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          user-drag: none;
        }
        .slider-container:active {
          cursor: ${sliderModule.allow_swipe ? 'grabbing' : 'default'};
        }
        .slider-container:hover .slider-arrow {
          opacity: 1 !important;
        }
        .slider-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        /* Horizontal slide effects */
        .slider-wrapper.effect-slide-left,
        .slider-wrapper.effect-slide-right {
          display: flex;
          transition: transform ${transitionSpeed}ms ${transitionEasing};
        }

        /* Vertical slide effects */
        .slider-wrapper.effect-slide-top,
        .slider-wrapper.effect-slide-bottom {
          display: flex;
          flex-direction: column;
          transition: transform ${transitionSpeed}ms ${transitionEasing};
        }

        .slider-slide {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          justify-content: ${alignMap[verticalAlignment]};
          align-items: stretch;
          padding: ${sliderModule.gap || 0}px;
          box-sizing: border-box;
        }

        /* Slide effects - flex items */
        .slider-wrapper.effect-slide-left .slider-slide,
        .slider-wrapper.effect-slide-right .slider-slide {
          width: calc((100% - ${(slidesPerView - 1) * spaceBetween}px) / ${slidesPerView});
          height: 100%;
        }
        .slider-wrapper.effect-slide-top .slider-slide,
        .slider-wrapper.effect-slide-bottom .slider-slide {
          width: 100%;
          height: 100%;
        }

        /* Fade, Zoom, Circle effects - absolute positioning */
        .slider-wrapper.effect-fade .slider-slide,
        .slider-wrapper.effect-zoom-in .slider-slide,
        .slider-wrapper.effect-zoom-out .slider-slide,
        .slider-wrapper.effect-circle .slider-slide {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          pointer-events: none;
          transition:
            opacity ${transitionSpeed}ms ${transitionEasing},
            transform ${transitionSpeed}ms ${transitionEasing},
            clip-path ${transitionSpeed}ms ${transitionEasing};
        }

        /* Fade effect */
        .slider-wrapper.effect-fade .slider-slide.active {
          opacity: 1;
          pointer-events: auto;
        }

        /* Zoom In effect - starts small, grows to normal */
        .slider-wrapper.effect-zoom-in .slider-slide {
          transform: scale(0.8);
        }
        .slider-wrapper.effect-zoom-in .slider-slide.active {
          opacity: 1;
          transform: scale(1);
          pointer-events: auto;
        }

        /* Zoom Out effect - starts large, shrinks to normal */
        .slider-wrapper.effect-zoom-out .slider-slide {
          transform: scale(1.2);
        }
        .slider-wrapper.effect-zoom-out .slider-slide.active {
          opacity: 1;
          transform: scale(1);
          pointer-events: auto;
        }

        /* Circle effect - circular reveal */
        .slider-wrapper.effect-circle .slider-slide {
          clip-path: circle(0% at 50% 50%);
        }
        .slider-wrapper.effect-circle .slider-slide.active {
          opacity: 1;
          clip-path: circle(100% at 50% 50%);
          pointer-events: auto;
        }
        .slide-content {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow: hidden;
        }
        .slide-content > * {
          flex-shrink: 1;
          min-height: 0;
        }
        .slider-pagination {
          padding: 12px;
        }
        .pagination-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10;
        }
        .pagination-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 10;
        }
        .pagination-left {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          flex-direction: column;
        }
        .pagination-right {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          flex-direction: column;
        }
        .slider-arrow {
          transition:
            opacity 0.3s,
            transform 0.2s;
        }
        .slider-arrow:hover {
          transform: translateY(-50%) scale(1.1);
        }
      </style>

      <div
        class="slider-container uc-module-container effect-${transitionEffect}"
        data-slider-id="${sliderModule.id}"
        tabindex="0"
        @touchstart=${handleTouchStart}
        @touchmove=${handleTouchMove}
        @touchend=${handleTouchEnd}
        @mousedown=${handleMouseDown}
        @mousemove=${handleMouseMove}
        @mouseup=${handleMouseUp}
        @mouseleave=${(e: MouseEvent) => {
          handleMouseLeave();
          // Only restart auto-play if pause_on_hover is enabled and no drag occurred
          if (sliderModule.pause_on_hover && sliderModule.auto_play && !isMouseDragging) {
            startAutoPlay();
          }
        }}
        @mouseenter=${() => sliderModule.pause_on_hover && stopAutoPlay()}
        @keydown=${(e: KeyboardEvent) => {
          if (!sliderModule.allow_keyboard) return;
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide(e);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextSlide(e);
          }
        }}
        @wheel=${(e: WheelEvent) => {
          if (!sliderModule.allow_mousewheel) return;
          e.preventDefault();
          if (e.deltaY > 0) {
            nextSlide(e);
          } else if (e.deltaY < 0) {
            prevSlide(e);
          }
        }}
      >
        ${sliderModule.show_pagination && sliderModule.pagination_position === 'top'
          ? renderPagination()
          : ''}

        <div
          class="slider-wrapper effect-${transitionEffect}"
          style="${transitionEffect === 'slide-left'
            ? `transform: translateX(-${current * (100 / slidesPerView + spaceBetween)}%)`
            : transitionEffect === 'slide-right'
              ? `transform: translateX(${current * (100 / slidesPerView + spaceBetween)}%)`
              : transitionEffect === 'slide-top'
                ? `transform: translateY(-${current * 100}%)`
                : transitionEffect === 'slide-bottom'
                  ? `transform: translateY(${current * 100}%)`
                  : ''}"
        >
          ${pages.map((pageModules, index) => {
            const isActive = index === current;

            return html`
              <div class="slider-slide ${isActive ? 'active' : ''}">
                <div class="slide-content">
                  ${pageModules.map(childModule => {
                    const childModuleHandler = registry.getModule(childModule.type);
                    if (!childModuleHandler) {
                      return html`<div>Unknown module type: ${childModule.type}</div>`;
                    }

                    // Check visibility
                    const isVisible = logicService.evaluateModuleVisibility(childModule);
                    if (!isVisible) return '';

                    return childModuleHandler.renderPreview(childModule, hass, config);
                  })}
                </div>
              </div>
            `;
          })}
        </div>

        ${renderArrows()}
        ${sliderModule.show_pagination && sliderModule.pagination_position === 'bottom'
          ? renderPagination()
          : ''}
        ${sliderModule.show_pagination && sliderModule.pagination_position === 'left'
          ? renderPagination()
          : ''}
        ${sliderModule.show_pagination && sliderModule.pagination_position === 'right'
          ? renderPagination()
          : ''}
      </div>
    `;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const sliderModule = module as SliderModule;
    const errors = [...baseValidation.errors];

    // Validate modules array exists
    if (!sliderModule.modules) {
      errors.push('Slider must have a modules array');
    }

    // Validate numeric ranges
    if (
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
    return ``;
  }
}
