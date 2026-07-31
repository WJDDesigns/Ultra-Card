import { TemplateResult, html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig, GridLayoutModule } from '../types';
import { getModuleRegistry } from './module-registry';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { localize } from '../localize/localize';
import {
  INTERACTIVE_CHILD_SELECTORS,
  isChildModuleVisible,
  renderChildModulePreview,
} from './layout-container-utils';

export class UltraGridLayoutModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'grid_layout',
    title: 'Grid Layout',
    description: 'True CSS-grid container with per-child column and row spans',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:view-grid-plus',
    category: 'layout',
    tags: ['layout', 'grid', 'container', 'span', 'columns', 'responsive', 'masonry'],
  };

  createDefault(id?: string, hass?: HomeAssistant): GridLayoutModule {
    return {
      id: id || this.generateId('grid_layout'),
      type: 'grid_layout',
      modules: [],
      column_mode: 'fixed',
      columns: 2,
      min_column_width: '140px',
      gap: 12,
      dense_packing: false,
      item_alignment: 'stretch',
      mobile_breakpoint: 600,
      mobile_columns: 1,
      item_spans: {},
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
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
    const gridModule = module as GridLayoutModule;
    const lang = hass?.locale?.language || 'en';
    const columnMode = gridModule.column_mode || 'fixed';
    const columns = gridModule.columns ?? 2;

    return html`
      ${this.injectUcFormStyles()}

      <div class="module-general-settings">
        <!-- Grid Configuration -->
        ${this.renderSettingsSection(
          localize('editor.grid_layout.config.title', lang, 'Grid Configuration'),
          localize(
            'editor.grid_layout.config.desc',
            lang,
            'Configure the grid tracks. Children placed in this container flow into the grid cells.'
          ),
          []
        )}
        <div style="margin-top: -24px; margin-bottom: 32px;">
          ${this.renderSegmentedField(
            localize('editor.grid_layout.config.column_mode', lang, 'Column Mode'),
            localize(
              'editor.grid_layout.config.column_mode_desc',
              lang,
              'Fixed uses an exact column count. Auto Fit fills the width with as many columns as fit.'
            ),
            columnMode,
            [
              {
                value: 'fixed',
                label: localize('editor.grid_layout.config.fixed', lang, 'Fixed Columns'),
                icon: 'mdi:view-column',
              },
              {
                value: 'auto-fit',
                label: localize('editor.grid_layout.config.auto_fit', lang, 'Auto Fit'),
                icon: 'mdi:arrow-expand-horizontal',
              },
            ],
            next => updateModule({ column_mode: next as 'fixed' | 'auto-fit' })
          )}
          ${columnMode === 'fixed'
            ? this.renderSliderField(
                localize('editor.grid_layout.config.columns', lang, 'Columns'),
                localize(
                  'editor.grid_layout.config.columns_desc',
                  lang,
                  'Number of equal-width columns in the grid.'
                ),
                columns,
                2,
                1,
                6,
                1,
                next => updateModule({ columns: next }),
                ''
              )
            : this.renderFieldSection(
                localize('editor.grid_layout.config.min_width', lang, 'Minimum Column Width'),
                localize(
                  'editor.grid_layout.config.min_width_desc',
                  lang,
                  'Smallest allowed column width (e.g. 140px). Columns are added or removed to fit.'
                ),
                hass,
                { min_column_width: gridModule.min_column_width || '140px' },
                [this.textField('min_column_width')],
                (e: CustomEvent) => {
                  updateModule({ min_column_width: e.detail.value.min_column_width });
                  this.triggerPreviewUpdate();
                }
              )}
          ${this.renderFieldSection(
            localize('editor.grid_layout.config.item_alignment', lang, 'Item Alignment'),
            localize(
              'editor.grid_layout.config.item_alignment_desc',
              lang,
              'Vertical alignment of items within their grid cell.'
            ),
            hass,
            { item_alignment: gridModule.item_alignment || 'stretch' },
            [
              this.selectField('item_alignment', [
                { value: 'stretch', label: localize('editor.common.stretch', lang, 'Stretch') },
                { value: 'start', label: localize('editor.common.top', lang, 'Top') },
                { value: 'center', label: localize('editor.common.center', lang, 'Center') },
                { value: 'end', label: localize('editor.common.bottom', lang, 'Bottom') },
              ]),
            ],
            (e: CustomEvent) => {
              updateModule({ item_alignment: e.detail.value.item_alignment });
              this.triggerPreviewUpdate();
            }
          )}
          ${this.renderFieldSection(
            localize('editor.grid_layout.config.dense', lang, 'Dense Packing'),
            localize(
              'editor.grid_layout.config.dense_desc',
              lang,
              'Backfill gaps left by spanning items (masonry-like packing).'
            ),
            hass,
            { dense_packing: gridModule.dense_packing || false },
            [this.booleanField('dense_packing')],
            (e: CustomEvent) => {
              updateModule({ dense_packing: e.detail.value.dense_packing });
              this.triggerPreviewUpdate();
            }
          )}
        </div>

        <!-- Spacing -->
        ${this.renderSettingsSection(
          localize('editor.grid_layout.spacing.title', lang, 'Spacing'),
          localize('editor.grid_layout.spacing.desc', lang, 'Gaps between grid cells.'),
          []
        )}
        <div style="margin-top: -24px; margin-bottom: 32px;">
          ${this.renderSliderField(
            localize('editor.grid_layout.spacing.gap', lang, 'Column Gap'),
            '',
            gridModule.gap ?? 12,
            12,
            0,
            48,
            1,
            next => updateModule({ gap: next })
          )}
          ${this.renderSliderField(
            localize('editor.grid_layout.spacing.row_gap', lang, 'Row Gap'),
            localize(
              'editor.grid_layout.spacing.row_gap_desc',
              lang,
              'Follows the column gap until changed.'
            ),
            gridModule.row_gap ?? gridModule.gap ?? 12,
            gridModule.gap ?? 12,
            0,
            48,
            1,
            next => updateModule({ row_gap: next })
          )}
        </div>

        <!-- Responsive -->
        ${this.renderSettingsSection(
          localize('editor.grid_layout.responsive.title', lang, 'Responsive'),
          localize(
            'editor.grid_layout.responsive.desc',
            lang,
            'Collapse the grid on small screens.'
          ),
          [
            {
              title: localize('editor.grid_layout.responsive.mobile_columns', lang, 'Mobile Columns'),
              description: localize(
                'editor.grid_layout.responsive.mobile_columns_desc',
                lang,
                'Column count used below the breakpoint. Item spans are reset on mobile.'
              ),
              hass,
              data: { mobile_columns: String(gridModule.mobile_columns ?? 1) },
              schema: [
                this.selectField('mobile_columns', [
                  { value: '0', label: localize('editor.grid_layout.responsive.off', lang, 'Off') },
                  { value: '1', label: '1' },
                  { value: '2', label: '2' },
                  { value: '3', label: '3' },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                updateModule({ mobile_columns: Number(e.detail.value.mobile_columns) });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.grid_layout.responsive.breakpoint', lang, 'Mobile Breakpoint (px)'),
              description: localize(
                'editor.grid_layout.responsive.breakpoint_desc',
                lang,
                'Viewport width below which the mobile column count applies.'
              ),
              hass,
              data: { mobile_breakpoint: gridModule.mobile_breakpoint ?? 600 },
              schema: [this.numberField('mobile_breakpoint', 320, 1280, 10)],
              onChange: (e: CustomEvent) => {
                updateModule({ mobile_breakpoint: e.detail.value.mobile_breakpoint });
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}

        <!-- Item Spans -->
        ${this.renderSettingsSection(
          localize('editor.grid_layout.spans.title', lang, 'Item Spans'),
          localize(
            'editor.grid_layout.spans.desc',
            lang,
            'Let individual children span multiple columns or rows.'
          ),
          []
        )}
        <div style="margin-top: -24px; margin-bottom: 32px;">
          ${(gridModule.modules || []).length === 0
            ? html`
                <div
                  style="font-size: 13px; color: var(--secondary-text-color); font-style: italic; padding: 8px 4px;"
                >
                  ${localize(
                    'editor.grid_layout.spans.empty',
                    lang,
                    'Add modules to this grid in the layout builder first, then configure their spans here.'
                  )}
                </div>
              `
            : (gridModule.modules || []).map((child, index) => {
                const registry = getModuleRegistry();
                const meta = registry.getModuleMetadata(child.type);
                const childName =
                  (child as any).name || meta?.title || child.type;
                const spans = gridModule.item_spans?.[child.id] || {};
                const maxColSpan = columnMode === 'fixed' ? Math.max(columns, 1) : 4;
                const spanOptions = (max: number) =>
                  Array.from({ length: max }, (_, i) => ({
                    value: String(i + 1),
                    label: String(i + 1),
                  }));
                return this.renderFieldSection(
                  `${index + 1}. ${childName}`,
                  '',
                  hass,
                  {
                    col_span: String(Math.min(spans.columns ?? 1, maxColSpan)),
                    row_span: String(spans.rows ?? 1),
                  },
                  [
                    this.selectField('col_span', spanOptions(maxColSpan)),
                    this.selectField('row_span', spanOptions(4)),
                  ],
                  (e: CustomEvent) => {
                    const colSpan = Number(e.detail.value.col_span ?? spans.columns ?? 1);
                    const rowSpan = Number(e.detail.value.row_span ?? spans.rows ?? 1);
                    const nextSpans = { ...(gridModule.item_spans || {}) };
                    nextSpans[child.id] = { columns: colSpan, rows: rowSpan };
                    updateModule({ item_spans: nextSpans });
                    this.triggerPreviewUpdate();
                  }
                );
              })}
          ${(gridModule.modules || []).length > 0
            ? html`
                <div
                  style="font-size: 12px; color: var(--secondary-text-color); opacity: 0.8; padding: 4px;"
                >
                  ${localize(
                    'editor.grid_layout.spans.hint',
                    lang,
                    'The first select is column span, the second is row span.'
                  )}
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const gridModule = module as GridLayoutModule;
    const lang = hass?.locale?.language || 'en';
    const hasChildren = gridModule.modules && gridModule.modules.length > 0;
    const isEditorPreview = previewContext === 'live' || previewContext === 'ha-preview';

    const visibleChildren = hasChildren
      ? gridModule.modules!.filter(cm => isChildModuleVisible(cm, hass))
      : [];
    const allChildrenHiddenByLogic = hasChildren && visibleChildren.length === 0;
    if (allChildrenHiddenByLogic && !isEditorPreview) {
      return html``;
    }

    const columnMode = gridModule.column_mode || 'fixed';
    const columns = Math.max(gridModule.columns ?? 2, 1);
    const gap = gridModule.gap ?? 12;
    const rowGap = gridModule.row_gap ?? gap;
    const gridTemplateColumns =
      columnMode === 'auto-fit'
        ? `repeat(auto-fit, minmax(min(${gridModule.min_column_width || '140px'}, 100%), 1fr))`
        : `repeat(${columns}, minmax(0, 1fr))`;

    const designStyles = this.buildDesignStyles(module, hass);
    const containerStyles: Record<string, string | undefined> = {
      ...designStyles,
      display: 'grid',
      gridTemplateColumns,
      columnGap: `${gap}px`,
      rowGap: `${rowGap}px`,
      gridAutoFlow: gridModule.dense_packing ? 'row dense' : 'row',
      alignItems: gridModule.item_alignment || 'stretch',
      boxSizing: 'border-box',
      maxWidth: designStyles.maxWidth || '100%',
    };

    const handlers = this.createGestureHandlers(
      gridModule.id,
      {
        tap_action: gridModule.tap_action,
        hold_action: gridModule.hold_action,
        double_tap_action: gridModule.double_tap_action,
        module: gridModule,
      },
      hass,
      config,
      INTERACTIVE_CHILD_SELECTORS
    );
    const hasActions =
      (gridModule.tap_action && gridModule.tap_action.action !== 'nothing') ||
      (gridModule.hold_action && gridModule.hold_action.action !== 'nothing') ||
      (gridModule.double_tap_action && gridModule.double_tap_action.action !== 'nothing');

    const hoverClass = this.getHoverEffectClass(module);
    const containerId = `uc-grid-${gridModule.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const mobileBreakpoint = gridModule.mobile_breakpoint ?? 600;
    const mobileColumns = gridModule.mobile_columns ?? 1;
    const mobileCss =
      mobileColumns > 0 && mobileBreakpoint > 0
        ? `
          @media (max-width: ${mobileBreakpoint}px) {
            #${containerId} {
              grid-template-columns: repeat(${mobileColumns}, minmax(0, 1fr)) !important;
            }
            #${containerId} > .grid-layout-item {
              grid-column: auto !important;
              grid-row: auto !important;
            }
          }
        `
        : '';

    return this.wrapWithAnimation(
      html`
        ${mobileCss ? html`<style>${mobileCss}</style>` : ''}
        <div
          id="${containerId}"
          class="grid-layout-preview ${hoverClass}"
          style="${this.buildStyleString(containerStyles)}; cursor: ${hasActions
            ? 'pointer'
            : 'default'};"
          @pointerdown=${hasActions ? handlers.onPointerDown : null}
          @pointermove=${hasActions ? handlers.onPointerMove : null}
          @pointerup=${hasActions ? handlers.onPointerUp : null}
          @pointercancel=${hasActions ? handlers.onPointerCancel : null}
          @pointerleave=${hasActions ? handlers.onPointerLeave : null}
        >
          ${visibleChildren.length > 0
            ? repeat(
                visibleChildren,
                cm => cm.id || cm.type,
                childModule => {
                  const spans = gridModule.item_spans?.[childModule.id];
                  const colSpan =
                    columnMode === 'fixed'
                      ? Math.min(spans?.columns ?? 1, columns)
                      : spans?.columns ?? 1;
                  const rowSpan = spans?.rows ?? 1;
                  const spanStyle = `${colSpan > 1 ? `grid-column: span ${colSpan};` : ''} ${
                    rowSpan > 1 ? `grid-row: span ${rowSpan};` : ''
                  }`;
                  return html`
                    <div
                      class="grid-layout-item"
                      style="min-width: 0; box-sizing: border-box; ${spanStyle}"
                    >
                      ${renderChildModulePreview(childModule, hass, config, previewContext)}
                    </div>
                  `;
                }
              )
            : html`
                <div class="empty-layout-message" style="grid-column: 1 / -1;">
                  ${allChildrenHiddenByLogic
                    ? html`
                        <span
                          >${localize(
                            'editor.grid_layout.empty.all_hidden',
                            lang,
                            'All modules hidden by logic'
                          )}</span
                        >
                      `
                    : html`
                        <span
                          >${localize(
                            'editor.grid_layout.empty.no_modules',
                            lang,
                            'No modules added yet'
                          )}</span
                        >
                        <small
                          >${localize(
                            'editor.grid_layout.empty.add_modules',
                            lang,
                            'Add modules in the layout builder to see them in the grid'
                          )}</small
                        >
                      `}
                </div>
              `}
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
      .grid-layout-preview {
        transition: all 0.2s ease;
      }

      .grid-layout-item {
        pointer-events: auto;
      }

      .grid-layout-preview .empty-layout-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: var(--secondary-text-color);
        font-style: italic;
        text-align: center;
        width: 100%;
        padding: 20px;
      }

      .grid-layout-preview .empty-layout-message span {
        font-size: 14px;
        font-weight: 500;
      }

      .grid-layout-preview .empty-layout-message small {
        font-size: 12px;
        opacity: 0.8;
      }

      ${BaseUltraModule.getSliderStyles()}
    `;
  }
}
