import { TemplateResult, html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig, ScrollRowModule } from '../types';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { localize } from '../localize/localize';
import { isChildModuleVisible, renderChildModulePreview } from './layout-container-utils';

export class UltraScrollRowModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'scroll_row',
    title: 'Scroll Row',
    description: 'Horizontally scrollable row with snap points and next-item peek',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:gesture-swipe-horizontal',
    category: 'layout',
    tags: ['layout', 'scroll', 'row', 'snap', 'carousel', 'swipe', 'horizontal', 'container'],
  };

  createDefault(id?: string, hass?: HomeAssistant): ScrollRowModule {
    return {
      id: id || this.generateId('scroll_row'),
      type: 'scroll_row',
      modules: [],
      item_width: '42%',
      gap: 12,
      snap_align: 'start',
      show_scrollbar: false,
      show_arrows: false,
      fade_edges: false,
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
    const rowModule = module as ScrollRowModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}

      <div class="module-general-settings">
        <!-- Items -->
        ${this.renderSettingsSection(
          localize('editor.scroll_row.items.title', lang, 'Items'),
          localize(
            'editor.scroll_row.items.desc',
            lang,
            'Sizing and spacing of the items in the row. Widths under 100% let the next item peek in from the edge.'
          ),
          []
        )}
        <div style="margin-top: -24px; margin-bottom: 32px;">
          ${this.renderUnitAwareSliderField(
            localize('editor.scroll_row.items.width', lang, 'Item Width'),
            localize(
              'editor.scroll_row.items.width_desc',
              lang,
              'Percentage of the row (e.g. 42%) or a fixed width (e.g. 140px).'
            ),
            rowModule.item_width || '42%',
            '42%',
            10,
            100,
            1,
            '%',
            '42%',
            next =>
              updateModule({
                item_width: next === undefined ? undefined : typeof next === 'number' ? `${next}%` : next,
              })
          )}
          ${this.renderSliderField(
            localize('editor.scroll_row.items.gap', lang, 'Gap Between Items'),
            '',
            rowModule.gap ?? 12,
            12,
            0,
            48,
            1,
            next => updateModule({ gap: next })
          )}
          ${this.renderSegmentedField(
            localize('editor.scroll_row.items.snap', lang, 'Snap Alignment'),
            localize(
              'editor.scroll_row.items.snap_desc',
              lang,
              'Where items settle when scrolling stops.'
            ),
            rowModule.snap_align || 'start',
            [
              {
                value: 'start',
                label: localize('editor.common.left', lang, 'Left'),
                icon: 'mdi:format-horizontal-align-left',
              },
              {
                value: 'center',
                label: localize('editor.common.center', lang, 'Center'),
                icon: 'mdi:format-horizontal-align-center',
              },
              {
                value: 'none',
                label: localize('editor.scroll_row.items.no_snap', lang, 'No Snap'),
                icon: 'mdi:gesture-swipe-horizontal',
              },
            ],
            next => updateModule({ snap_align: next as 'start' | 'center' | 'none' })
          )}
        </div>

        <!-- Appearance -->
        ${this.renderSettingsSection(
          localize('editor.scroll_row.appearance.title', lang, 'Appearance'),
          '',
          [
            {
              title: localize('editor.scroll_row.appearance.scrollbar', lang, 'Show Scrollbar'),
              description: '',
              hass,
              data: { show_scrollbar: rowModule.show_scrollbar || false },
              schema: [this.booleanField('show_scrollbar')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_scrollbar: e.detail.value.show_scrollbar });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.scroll_row.appearance.arrows', lang, 'Show Scroll Arrows'),
              description: localize(
                'editor.scroll_row.appearance.arrows_desc',
                lang,
                'Overlay arrows for scrolling with a mouse.'
              ),
              hass,
              data: { show_arrows: rowModule.show_arrows || false },
              schema: [this.booleanField('show_arrows')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_arrows: e.detail.value.show_arrows });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.scroll_row.appearance.fade', lang, 'Fade Edges'),
              description: localize(
                'editor.scroll_row.appearance.fade_desc',
                lang,
                'Fade out content at the row edges to hint at more items.'
              ),
              hass,
              data: { fade_edges: rowModule.fade_edges || false },
              schema: [this.booleanField('fade_edges')],
              onChange: (e: CustomEvent) => {
                updateModule({ fade_edges: e.detail.value.fade_edges });
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}
      </div>
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const rowModule = module as ScrollRowModule;
    const lang = hass?.locale?.language || 'en';
    const hasChildren = rowModule.modules && rowModule.modules.length > 0;
    const isEditorPreview = previewContext === 'live' || previewContext === 'ha-preview';

    const visibleChildren = hasChildren
      ? rowModule.modules!.filter(cm => isChildModuleVisible(cm, hass))
      : [];
    const allChildrenHiddenByLogic = hasChildren && visibleChildren.length === 0;
    if (allChildrenHiddenByLogic && !isEditorPreview) {
      return html``;
    }

    const gap = rowModule.gap ?? 12;
    const itemWidth = rowModule.item_width || '42%';
    const snapAlign = rowModule.snap_align || 'start';
    const designStyles = this.buildDesignStyles(module, hass);
    const hoverClass = this.getHoverEffectClass(module);

    const scrollByAmount = (e: Event, direction: 1 | -1) => {
      e.stopPropagation();
      const btn = e.currentTarget as HTMLElement;
      const scroller = btn
        .closest('.scroll-row-wrapper')
        ?.querySelector('.scroll-row-scroller') as HTMLElement | null;
      if (scroller) {
        scroller.scrollBy({ left: direction * scroller.clientWidth * 0.8, behavior: 'smooth' });
      }
    };

    return this.wrapWithAnimation(
      html`
        <div class="scroll-row-wrapper ${hoverClass}" style="${this.buildStyleString(designStyles)}">
          <div
            class="scroll-row-scroller ${rowModule.show_scrollbar
              ? ''
              : 'hide-scrollbar'} ${rowModule.fade_edges ? 'fade-edges' : ''}"
            style="gap: ${gap}px; ${snapAlign !== 'none'
              ? 'scroll-snap-type: x mandatory;'
              : ''}"
          >
            ${visibleChildren.length > 0
              ? repeat(
                  visibleChildren,
                  cm => cm.id || cm.type,
                  childModule => html`
                    <div
                      class="scroll-row-item"
                      style="flex: 0 0 ${itemWidth}; ${snapAlign !== 'none'
                        ? `scroll-snap-align: ${snapAlign};`
                        : ''}"
                    >
                      ${renderChildModulePreview(childModule, hass, config, previewContext)}
                    </div>
                  `
                )
              : html`
                  <div class="empty-layout-message" style="flex: 1 0 100%;">
                    ${allChildrenHiddenByLogic
                      ? html`<span
                          >${localize(
                            'editor.scroll_row.empty.all_hidden',
                            lang,
                            'All modules hidden by logic'
                          )}</span
                        >`
                      : html`
                          <span
                            >${localize(
                              'editor.scroll_row.empty.no_modules',
                              lang,
                              'No modules added yet'
                            )}</span
                          >
                          <small
                            >${localize(
                              'editor.scroll_row.empty.add_modules',
                              lang,
                              'Add modules in the layout builder to see them in this row'
                            )}</small
                          >
                        `}
                  </div>
                `}
          </div>
          ${rowModule.show_arrows && visibleChildren.length > 0
            ? html`
                <button
                  type="button"
                  class="scroll-row-arrow scroll-row-arrow-left"
                  aria-label="Scroll left"
                  @click=${(e: Event) => scrollByAmount(e, -1)}
                >
                  <ha-icon icon="mdi:chevron-left"></ha-icon>
                </button>
                <button
                  type="button"
                  class="scroll-row-arrow scroll-row-arrow-right"
                  aria-label="Scroll right"
                  @click=${(e: Event) => scrollByAmount(e, 1)}
                >
                  <ha-icon icon="mdi:chevron-right"></ha-icon>
                </button>
              `
            : ''}
        </div>
      `,
      module,
      hass
    );
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
      .scroll-row-wrapper {
        position: relative;
        width: 100%;
        box-sizing: border-box;
      }

      .scroll-row-scroller {
        display: flex;
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior-x: contain;
        scrollbar-width: thin;
      }

      .scroll-row-scroller.hide-scrollbar {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .scroll-row-scroller.hide-scrollbar::-webkit-scrollbar {
        display: none;
      }

      .scroll-row-scroller.fade-edges {
        mask-image: linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%);
        -webkit-mask-image: linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%);
      }

      .scroll-row-item {
        min-width: 0;
        box-sizing: border-box;
      }

      .scroll-row-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 50%;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.15s ease;
        z-index: 2;
      }

      .scroll-row-wrapper:hover .scroll-row-arrow {
        opacity: 0.92;
      }

      .scroll-row-arrow-left {
        left: 4px;
      }

      .scroll-row-arrow-right {
        right: 4px;
      }

      .scroll-row-wrapper .empty-layout-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: var(--secondary-text-color);
        font-style: italic;
        text-align: center;
        padding: 20px;
      }

      .scroll-row-wrapper .empty-layout-message span {
        font-size: 14px;
        font-weight: 500;
      }

      .scroll-row-wrapper .empty-layout-message small {
        font-size: 12px;
        opacity: 0.8;
      }

      ${BaseUltraModule.getSliderStyles()}
    `;
  }
}
