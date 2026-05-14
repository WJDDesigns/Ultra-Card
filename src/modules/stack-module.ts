import { TemplateResult, html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import {
  CardModule,
  UltraCardConfig,
  StackModule,
  StackLayerConfig,
  StackAnchor,
} from '../types';
import { getModuleRegistry } from './module-registry';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { localize } from '../localize/localize';
import { logicService } from '../services/logic-service';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import { ucModulePreviewService } from '../services/uc-module-preview-service';
import { generateCSSVariables } from '../utils/css-variable-utils';
import { computeBackgroundStyles } from '../utils/uc-color-utils';
import { autoMigrateCardModule } from '../utils/template-migration';

const STACK_ANCHOR_GRID: Array<{
  anchor: StackAnchor;
  icon: string;
  label: string;
}> = [
  { anchor: 'top-left', icon: 'mdi:arrow-top-left', label: 'Top left' },
  { anchor: 'top-center', icon: 'mdi:arrow-up', label: 'Top center' },
  { anchor: 'top-right', icon: 'mdi:arrow-top-right', label: 'Top right' },
  { anchor: 'middle-left', icon: 'mdi:arrow-left', label: 'Middle left' },
  { anchor: 'center', icon: 'mdi:circle-medium', label: 'Center' },
  { anchor: 'middle-right', icon: 'mdi:arrow-right', label: 'Middle right' },
  { anchor: 'bottom-left', icon: 'mdi:arrow-bottom-left', label: 'Bottom left' },
  { anchor: 'bottom-center', icon: 'mdi:arrow-down', label: 'Bottom center' },
  { anchor: 'bottom-right', icon: 'mdi:arrow-bottom-right', label: 'Bottom right' },
];

const STACK_ASPECT_OPTIONS: Array<{
  value: NonNullable<StackModule['aspect_ratio']>;
  icon: string;
  label: string;
}> = [
  { value: '16:9', icon: 'mdi:rectangle-outline', label: '16 : 9' },
  { value: '4:3', icon: 'mdi:rectangle-outline', label: '4 : 3' },
  { value: '3:2', icon: 'mdi:rectangle-outline', label: '3 : 2' },
  { value: '1:1', icon: 'mdi:square-outline', label: '1 : 1' },
  { value: '2:3', icon: 'mdi:crop-portrait', label: '2 : 3' },
  { value: 'auto', icon: 'mdi:arrow-expand-vertical', label: 'Auto' },
];

const STACK_PRESETS: Array<{
  id: string;
  icon: string;
  label: string;
  description: string;
}> = [
  {
    id: 'hero',
    icon: 'mdi:image-text',
    label: 'Hero',
    description: 'Full image background with title overlay',
  },
  {
    id: 'camera_badge',
    icon: 'mdi:cctv',
    label: 'Camera + badge',
    description: 'Camera feed with corner status icon',
  },
  {
    id: 'clock_weather',
    icon: 'mdi:weather-sunny-alert',
    label: 'Clock + weather',
    description: 'Side-by-side ambient widgets',
  },
  {
    id: 'media',
    icon: 'mdi:music',
    label: 'Media',
    description: 'Album art with media controls',
  },
];

function aspectRatioToPaddingTop(ar: NonNullable<StackModule['aspect_ratio']>): string {
  switch (ar) {
    case '16:9':
      return '56.25%';
    case '4:3':
      return '75%';
    case '3:2':
      return '66.6667%';
    case '1:1':
      return '100%';
    case '2:3':
      return '150%';
    default:
      return '56.25%';
  }
}

/**
 * Compute the absolutely-positioned wrapper for a stack layer.
 *
 * Every wrapper fills the stack content area (`inset: 0`) and uses flexbox
 * to align its single child to the anchor point. Offsets are applied as
 * matching-side padding so they push the child *away* from its anchor. The
 * child gets its own `width` / `height` from the layer config and clips its
 * own content with `overflow: hidden`, so a layer can never visually escape
 * its declared bounds even if the inner module renders content much larger
 * than itself (e.g. an image with a huge intrinsic size).
 *
 * Why this approach instead of `top/left + transform: translate(-50%, -50%)`:
 * the transform approach lays out the wrapper at 50%/50% with full width/height
 * and offsets visually with transform — some browsers compute `overflow:hidden`
 * clip rects against the LAYOUT box (which extends well past the parent),
 * causing the layer to disappear when the parent has `overflow:hidden`. The
 * flex approach keeps the wrapper's layout box equal to the parent at all
 * times, eliminating that whole class of bugs.
 */
function getStackLayerStyles(
  cfg: StackLayerConfig | undefined,
  orderZ: number,
  options?: { allowChildOverflow?: boolean }
): { wrapper: string; child: string } {
  const anchor: StackAnchor = cfg?.anchor ?? 'center';
  const ox = cfg?.offset_x ?? '0px';
  const oy = cfg?.offset_y ?? '0px';

  // Runtime fallback: every layer with no explicit width fills the stack
  // horizontally so it's visible by default. Users can shrink any layer to
  // a specific px / % via the width field. Height stays auto so modules
  // respect their natural / aspect-ratio height.
  const wRaw = cfg?.width;
  const hRaw = cfg?.height;
  const w = wRaw && wRaw !== 'auto' ? wRaw : '100%';
  const h = hRaw && hRaw !== 'auto' ? hRaw : 'auto';

  const op = cfg?.opacity !== undefined && cfg?.opacity !== null ? Number(cfg.opacity) : 1;
  const zi =
    cfg?.z_index_override !== undefined && cfg?.z_index_override !== null
      ? cfg.z_index_override
      : orderZ;

  // Map anchor → flexbox alignment + which side the offset pushes from
  let justify = 'center';
  let alignI = 'center';
  let pl = '0px';
  let pr = '0px';
  let pt = '0px';
  let pb = '0px';

  if (anchor.startsWith('top')) {
    alignI = 'flex-start';
    pt = oy;
  } else if (anchor.startsWith('bottom')) {
    alignI = 'flex-end';
    pb = oy;
  } else {
    alignI = 'center';
    pt = oy;
  }

  if (anchor.endsWith('left')) {
    justify = 'flex-start';
    pl = ox;
  } else if (anchor.endsWith('right')) {
    justify = 'flex-end';
    pr = ox;
  } else {
    justify = 'center';
    pl = ox;
  }

  const wrapper = [
    'position:absolute',
    'inset:0',
    'display:flex',
    `align-items:${alignI}`,
    `justify-content:${justify}`,
    `padding:${pt} ${pr} ${pb} ${pl}`,
    `opacity:${op}`,
    `z-index:${zi}`,
    'pointer-events:none',
    'box-sizing:border-box',
    // Wrapper itself never clips — the parent stack handles overall clipping
    // based on user's clip_overflow. This lets layers extend slightly past
    // the stack edge when clip_overflow is off.
    'overflow:visible',
  ].join(';');

  // When the child uses a 3D transform (rotateX/Y/Z), its rotated corners
  // naturally extend beyond the layer's axis-aligned rectangle. Clipping the
  // layer would chop the rotated corners off, so we relax overflow when the
  // caller asks us to.
  const childOverflow = options?.allowChildOverflow ? 'visible' : 'hidden';
  const child = [
    `width:${w}`,
    `height:${h}`,
    options?.allowChildOverflow ? 'max-width:none' : 'max-width:100%',
    options?.allowChildOverflow ? 'max-height:none' : 'max-height:100%',
    'min-width:0',
    'min-height:0',
    'pointer-events:auto',
    'box-sizing:border-box',
    // Contain the inner module's rendered content within the layer bounds.
    // Without this, modules like `image` can render at their intrinsic size
    // (potentially much larger than the layer) and visually overflow into
    // unexpected positions, making the layer appear blank when the parent
    // stack clips with overflow:hidden.
    `overflow:${childOverflow}`,
    // Children of the inner module rendering use display:flex to ensure
    // the rendered module fills the available space cleanly.
    'display:flex',
    'align-items:stretch',
    'justify-content:stretch',
  ].join(';');

  return { wrapper, child };
}

/**
 * Default stack layer for any newly-added child. Every layer starts centered
 * with zero offsets and natural size so the user can nudge in any direction
 * from a neutral baseline. Modules that visually rely on filling the
 * container (image, video, camera, weather effects, canvas) default to
 * `width: 100%` so they span the card; `height: auto` lets them respect
 * their own intrinsic aspect ratio without being clipped by `overflow:hidden`
 * on the stack.
 */
function defaultStackLayerForModuleType(type: string): StackLayerConfig {
  if (
    ['image', 'video_bg', 'camera', 'background', 'living_canvas', 'dynamic_weather'].includes(
      type
    )
  ) {
    return {
      anchor: 'center',
      width: '100%',
      height: 'auto',
      offset_x: '0px',
      offset_y: '0px',
    };
  }
  return { anchor: 'center', width: 'auto', height: 'auto', offset_x: '0px', offset_y: '0px' };
}

export class UltraStackModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'stack',
    title: 'Stack Overlay',
    description:
      'Layer modules on top of each other with anchor-based absolute positioning',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:layers',
    category: 'layout',
    tags: ['layout', 'stack', 'overlay', 'absolute', 'layer', 'z-index', 'anchor', 'hero'],
  };

  /** General-tab selected layer row (editor-only; not persisted) */
  private _stackSelectedLayerIndex = 0;

  createDefault(id?: string, _hass?: HomeAssistant): StackModule {
    return {
      id: id || this.generateId('stack'),
      type: 'stack',
      modules: [],
      aspect_ratio: '16:9',
      clip_overflow: true,
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const base = super.validate(module);
    const sm = module as StackModule;
    const errors = [...base.errors];
    if (sm.modules?.length) {
      for (const child of sm.modules) {
        if (child.type === 'stack') {
          errors.push('Stack Overlay cannot contain another Stack Overlay module.');
          break;
        }
      }
    }
    return { valid: errors.length === 0, errors };
  }

  renderLogicTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as any, hass, updates => updateModule(updates));
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const sm = module as StackModule;
    const lang = hass?.locale?.language || 'en';
    const modules = sm.modules || [];
    if (this._stackSelectedLayerIndex >= modules.length) {
      this._stackSelectedLayerIndex = Math.max(0, modules.length - 1);
    }
    const sel = this._stackSelectedLayerIndex;
    const selected = modules[sel];

    const applyModules = (next: CardModule[]) => {
      updateModule({ modules: next } as Partial<CardModule>);
      this.triggerPreviewUpdate();
    };

    const updateSelectedLayer = (patch: Partial<StackLayerConfig>) => {
      if (!selected) return;
      const next = modules.map((m, i) =>
        i === sel
          ? ({
              ...m,
              stack_layer: { ...(m as any).stack_layer, ...patch },
            } as CardModule)
          : m
      );
      applyModules(next);
    };

    const aspectRatioCurrent = sm.aspect_ratio || '16:9';

    return html`
      ${this.injectUcFormStyles()}
      ${this._renderStackEditorStyles()}

      <div class="module-general-settings">
        ${modules.length === 0
          ? this._renderPresetsSection(lang, presetId =>
              this._applyStackPreset(presetId, hass, next => {
                applyModules(next);
                this._stackSelectedLayerIndex = 0;
              })
            )
          : ''}

        <!-- Container -->
        <div class="uc-stack-section">
          <div class="uc-stack-section-title">
            ${localize('editor.stack.container.title', lang, 'Container')}
          </div>
          <div class="uc-stack-section-desc">
            ${localize(
              'editor.stack.container.desc',
              lang,
              'Aspect ratio or fixed height defines the overlay area.'
            )}
          </div>

          <div class="uc-stack-field-label">
            ${localize('editor.stack.aspect_ratio', lang, 'Aspect ratio')}
          </div>
          <div class="uc-stack-aspect-grid">
            ${STACK_ASPECT_OPTIONS.map(
              opt => html`
                <button
                  type="button"
                  class="uc-stack-chip ${aspectRatioCurrent === opt.value ? 'active' : ''}"
                  @click=${() => {
                    updateModule({ aspect_ratio: opt.value } as Partial<CardModule>);
                    this.triggerPreviewUpdate();
                  }}
                >
                  <ha-icon icon="${opt.icon}"></ha-icon>
                  <span>${opt.label}</span>
                </button>
              `
            )}
          </div>

          ${this.renderFieldSection(
            localize('editor.stack.height', lang, 'Height (optional)'),
            localize(
              'editor.stack.height_desc',
              lang,
              'When set (e.g. 280px, 40vh), overrides aspect ratio height.'
            ),
            hass,
            { h: sm.height || '' },
            [this.textField('h')],
            (e: CustomEvent) => {
              const v = (e.detail.value.h || '').trim();
              updateModule({ height: v || undefined } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            }
          )}
          ${this.renderFieldSection(
            localize('editor.stack.clip', lang, 'Clip overflow'),
            localize('editor.stack.clip_desc', lang, 'Hide content outside rounded bounds.'),
            hass,
            { clip: sm.clip_overflow !== false },
            [this.booleanField('clip')],
            (e: CustomEvent) => {
              updateModule({ clip_overflow: e.detail.value.clip } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            }
          )}
        </div>

        <!-- Layers -->
        <div class="uc-stack-section">
          <div class="uc-stack-section-title">
            ${localize('editor.stack.layers.title', lang, 'Layers')}
          </div>
          <div class="uc-stack-section-desc">
            ${localize(
              'editor.stack.layers.desc',
              lang,
              'Layers are stacked bottom (first) to top (last). Click a row to edit its position.'
            )}
          </div>

          ${modules.length === 0
            ? html`
                <div class="uc-stack-empty">
                  <ha-icon icon="mdi:layers-outline"></ha-icon>
                  <div class="uc-stack-empty-title">
                    ${localize('editor.stack.layers.empty_title', lang, 'No layers yet')}
                  </div>
                  <div class="uc-stack-empty-desc">
                    ${localize(
                      'editor.stack.layers.empty_desc',
                      lang,
                      'Drag modules into this stack from the layout tree, or pick a Quick start preset above. New layers default to the center of the card so you can offset them in any direction.'
                    )}
                  </div>
                </div>
              `
            : html`
                <div class="uc-stack-layer-list">
                  ${modules.map((child, index) =>
                    this._renderLayerRow(child, index, modules, applyModules, lang)
                  )}
                </div>
              `}
        </div>

        <!-- Layer position (only when something is selected) -->
        ${selected
          ? this._renderLayerPositionSection(selected, sel, lang, hass, updateSelectedLayer)
          : ''}
      </div>
    `;
  }

  private _renderStackEditorStyles(): TemplateResult {
    return html`
      <style>
        .uc-stack-section {
          background: var(--secondary-background-color);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }
        .uc-stack-section-title {
          font-size: 18px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--primary-color);
          margin-bottom: 4px;
          letter-spacing: 0.5px;
        }
        .uc-stack-section-desc {
          font-size: 13px;
          color: var(--secondary-text-color);
          opacity: 0.85;
          line-height: 1.4;
          margin-bottom: 16px;
        }
        .uc-stack-field-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-text-color);
          margin-bottom: 8px;
        }

        /* Aspect ratio / preset chips */
        .uc-stack-aspect-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
          gap: 8px;
          margin-bottom: 24px;
        }
        .uc-stack-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 12px 8px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          border: 2px solid var(--divider-color);
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.15s ease;
        }
        .uc-stack-chip ha-icon {
          --mdc-icon-size: 22px;
          color: var(--secondary-text-color);
        }
        .uc-stack-chip:hover {
          border-color: var(--primary-color);
        }
        .uc-stack-chip.active {
          background: var(--primary-color);
          border-color: var(--primary-color);
          color: var(--text-primary-color, #fff);
        }
        .uc-stack-chip.active ha-icon {
          color: var(--text-primary-color, #fff);
        }

        /* Preset cards */
        .uc-stack-preset-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }
        .uc-stack-preset-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          padding: 14px;
          background: var(--card-background-color);
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s ease;
        }
        .uc-stack-preset-card:hover {
          border-color: var(--primary-color);
          background: rgba(var(--rgb-primary-color), 0.04);
        }
        .uc-stack-preset-card ha-icon {
          --mdc-icon-size: 24px;
          color: var(--primary-color);
        }
        .uc-stack-preset-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-text-color);
        }
        .uc-stack-preset-desc {
          font-size: 12px;
          color: var(--secondary-text-color);
          line-height: 1.3;
        }

        /* Layer list */
        .uc-stack-layer-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }
        .uc-stack-layer-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: var(--card-background-color);
          border: 2px solid var(--divider-color);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .uc-stack-layer-row:hover {
          border-color: var(--primary-color);
        }
        .uc-stack-layer-row.selected {
          border-color: var(--primary-color);
          background: rgba(var(--rgb-primary-color), 0.08);
        }
        .uc-stack-layer-row.hidden {
          opacity: 0.55;
        }
        .uc-stack-layer-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: rgba(var(--rgb-primary-color), 0.12);
          color: var(--primary-color);
          flex-shrink: 0;
        }
        .uc-stack-layer-icon ha-icon {
          --mdc-icon-size: 20px;
        }
        .uc-stack-layer-titles {
          flex: 1;
          min-width: 0;
        }
        .uc-stack-layer-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-text-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .uc-stack-layer-sub {
          font-size: 11px;
          color: var(--secondary-text-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .uc-stack-layer-actions {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .uc-stack-layer-actions ha-icon-button {
          --mdc-icon-button-size: 36px;
          --mdc-icon-size: 18px;
          color: var(--secondary-text-color);
        }
        .uc-stack-layer-actions ha-icon-button[disabled] {
          opacity: 0.3;
        }
        .uc-stack-layer-actions ha-icon-button.delete:hover {
          color: var(--error-color);
        }

        /* Anchor grid */
        .uc-stack-anchor-grid {
          display: grid;
          grid-template-columns: repeat(3, 56px);
          grid-template-rows: repeat(3, 56px);
          gap: 6px;
          margin-bottom: 20px;
        }
        .uc-stack-anchor-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--card-background-color);
          border: 2px solid var(--divider-color);
          border-radius: 8px;
          cursor: pointer;
          color: var(--secondary-text-color);
          transition: all 0.15s ease;
        }
        .uc-stack-anchor-cell ha-icon {
          --mdc-icon-size: 24px;
        }
        .uc-stack-anchor-cell:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }
        .uc-stack-anchor-cell.active {
          background: var(--primary-color);
          border-color: var(--primary-color);
          color: var(--text-primary-color, #fff);
        }

        /* Empty state */
        .uc-stack-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 32px 16px;
          background: var(--card-background-color);
          border: 1px dashed var(--divider-color);
          border-radius: 8px;
          margin-bottom: 16px;
          text-align: center;
        }
        .uc-stack-empty ha-icon {
          --mdc-icon-size: 40px;
          color: var(--secondary-text-color);
          opacity: 0.6;
        }
        .uc-stack-empty-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-text-color);
        }
        .uc-stack-empty-desc {
          font-size: 13px;
          color: var(--secondary-text-color);
          line-height: 1.4;
          max-width: 280px;
        }

        /* Two-column inline fields */
        .uc-stack-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
      </style>
    `;
  }

  private _renderPresetsSection(
    lang: string,
    onPick: (id: string) => void
  ): TemplateResult {
    return html`
      <div class="uc-stack-section">
        <div class="uc-stack-section-title">
          ${localize('editor.stack.presets.title', lang, 'Quick start')}
        </div>
        <div class="uc-stack-section-desc">
          ${localize(
            'editor.stack.presets.desc',
            lang,
            'Pick a starting point — you can edit, reorder, and remove layers afterwards.'
          )}
        </div>
        <div class="uc-stack-preset-grid">
          ${STACK_PRESETS.map(
            preset => html`
              <button
                type="button"
                class="uc-stack-preset-card"
                @click=${() => onPick(preset.id)}
              >
                <ha-icon icon="${preset.icon}"></ha-icon>
                <div class="uc-stack-preset-title">
                  ${localize(`editor.stack.preset.${preset.id}`, lang, preset.label)}
                </div>
                <div class="uc-stack-preset-desc">
                  ${localize(
                    `editor.stack.preset.${preset.id}_desc`,
                    lang,
                    preset.description
                  )}
                </div>
              </button>
            `
          )}
        </div>
      </div>
    `;
  }

  private _renderLayerRow(
    child: CardModule,
    index: number,
    modules: CardModule[],
    applyModules: (next: CardModule[]) => void,
    lang: string
  ): TemplateResult {
    const meta = getModuleRegistry().getModuleMetadata(child.type);
    const title = meta?.title || child.type;
    const isHidden = child.display_mode === 'never';
    const isSelected = this._stackSelectedLayerIndex === index;
    const anchor = (child as any).stack_layer?.anchor || 'top-left';
    const subTitle = `${anchor.replace('-', ' ')} · ${localize('editor.stack.layer_z', lang, 'layer')} ${index + 1}`;

    return html`
      <div
        class="uc-stack-layer-row ${isSelected ? 'selected' : ''} ${isHidden ? 'hidden' : ''}"
        @click=${() => {
          this._stackSelectedLayerIndex = index;
          this.triggerPreviewUpdate();
        }}
      >
        <div class="uc-stack-layer-icon">
          <ha-icon icon="${meta?.icon || 'mdi:shape'}"></ha-icon>
        </div>
        <div class="uc-stack-layer-titles">
          <div class="uc-stack-layer-title">${title}</div>
          <div class="uc-stack-layer-sub">${subTitle}</div>
        </div>
        <div class="uc-stack-layer-actions">
          <ha-icon-button
            .label=${localize('editor.stack.layer.visibility', lang, 'Toggle visibility')}
            @click=${(e: Event) => {
              e.stopPropagation();
              const next = modules.map((m, i) =>
                i === index
                  ? ({
                      ...m,
                      display_mode: m.display_mode === 'never' ? 'always' : 'never',
                    } as CardModule)
                  : m
              );
              applyModules(next);
            }}
          >
            <ha-icon icon="${isHidden ? 'mdi:eye-off' : 'mdi:eye'}"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            .label=${localize('editor.stack.layer.up', lang, 'Move up')}
            ?disabled=${index === 0}
            @click=${(e: Event) => {
              e.stopPropagation();
              if (index <= 0) return;
              const next = [...modules];
              [next[index - 1], next[index]] = [next[index], next[index - 1]];
              this._stackSelectedLayerIndex = index - 1;
              applyModules(next);
            }}
          >
            <ha-icon icon="mdi:arrow-up"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            .label=${localize('editor.stack.layer.down', lang, 'Move down')}
            ?disabled=${index >= modules.length - 1}
            @click=${(e: Event) => {
              e.stopPropagation();
              if (index >= modules.length - 1) return;
              const next = [...modules];
              [next[index + 1], next[index]] = [next[index], next[index + 1]];
              this._stackSelectedLayerIndex = index + 1;
              applyModules(next);
            }}
          >
            <ha-icon icon="mdi:arrow-down"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            class="delete"
            .label=${localize('editor.stack.layer.delete', lang, 'Remove layer')}
            @click=${(e: Event) => {
              e.stopPropagation();
              const next = modules.filter((_, i) => i !== index);
              this._stackSelectedLayerIndex = Math.max(0, index - 1);
              applyModules(next);
            }}
          >
            <ha-icon icon="mdi:delete"></ha-icon>
          </ha-icon-button>
        </div>
      </div>
    `;
  }

  private _renderLayerPositionSection(
    selected: CardModule,
    sel: number,
    lang: string,
    hass: HomeAssistant,
    updateSelectedLayer: (patch: Partial<StackLayerConfig>) => void
  ): TemplateResult {
    const meta = getModuleRegistry().getModuleMetadata(selected.type);
    const layerTitle = meta?.title || selected.type;
    const cfg: StackLayerConfig = (selected as any).stack_layer || {};
    const currentAnchor: StackAnchor = (cfg.anchor as StackAnchor) || 'top-left';

    return html`
      <div class="uc-stack-section">
        <div class="uc-stack-section-title">
          ${localize('editor.stack.layer.position.title', lang, 'Layer position')}
        </div>
        <div class="uc-stack-section-desc">
          ${localize('editor.stack.layer.position.desc', lang, 'Editing layer')} ${sel + 1} ·
          ${layerTitle}
        </div>

        <div class="uc-stack-field-label">
          ${localize('editor.stack.layer.anchor', lang, 'Anchor point')}
        </div>
        <div class="uc-stack-anchor-grid">
          ${STACK_ANCHOR_GRID.map(
            cell => html`
              <button
                type="button"
                class="uc-stack-anchor-cell ${currentAnchor === cell.anchor ? 'active' : ''}"
                title="${localize(`editor.stack.anchor.${cell.anchor}`, lang, cell.label)}"
                @click=${() => updateSelectedLayer({ anchor: cell.anchor })}
              >
                <ha-icon icon="${cell.icon}"></ha-icon>
              </button>
            `
          )}
        </div>

        <div class="uc-stack-field-label">
          ${localize('editor.stack.layer.offset', lang, 'Offset from anchor')}
        </div>
        <div class="uc-stack-two-col">
          ${this.renderFieldSection(
            localize('editor.stack.layer.offset_x', lang, 'Offset X'),
            '',
            hass,
            { ox: cfg.offset_x ?? '0px' },
            [this.textField('ox')],
            (e: CustomEvent) => updateSelectedLayer({ offset_x: e.detail.value.ox })
          )}
          ${this.renderFieldSection(
            localize('editor.stack.layer.offset_y', lang, 'Offset Y'),
            '',
            hass,
            { oy: cfg.offset_y ?? '0px' },
            [this.textField('oy')],
            (e: CustomEvent) => updateSelectedLayer({ offset_y: e.detail.value.oy })
          )}
        </div>

        <div class="uc-stack-field-label" style="margin-top:8px;">
          ${localize('editor.stack.layer.size', lang, 'Size')}
        </div>
        <div class="uc-stack-two-col">
          ${this.renderFieldSection(
            localize('editor.stack.layer.width', lang, 'Width'),
            '',
            hass,
            { w: cfg.width ?? 'auto' },
            [this.textField('w')],
            (e: CustomEvent) => updateSelectedLayer({ width: e.detail.value.w })
          )}
          ${this.renderFieldSection(
            localize('editor.stack.layer.height', lang, 'Height'),
            '',
            hass,
            { h: cfg.height ?? 'auto' },
            [this.textField('h')],
            (e: CustomEvent) => updateSelectedLayer({ height: e.detail.value.h })
          )}
        </div>

        ${this.renderSliderField(
          localize('editor.stack.layer.opacity', lang, 'Opacity'),
          '',
          cfg.opacity !== undefined ? Number(cfg.opacity) : 1,
          1,
          0,
          1,
          0.05,
          (val: number) => updateSelectedLayer({ opacity: val }),
          ''
        )}
        ${this.renderFieldSection(
          localize('editor.stack.layer.z_index', lang, 'Z-index override'),
          localize(
            'editor.stack.layer.z_desc',
            lang,
            'Leave empty to use layer list order (bottom to top).'
          ),
          hass,
          { z: cfg.z_index_override ?? '' },
          [this.textField('z')],
          (e: CustomEvent) => {
            const raw = String(e.detail.value.z ?? '').trim();
            const z = raw === '' ? undefined : parseInt(raw, 10);
            updateSelectedLayer({
              z_index_override: Number.isFinite(z as number) ? (z as number) : undefined,
            });
          }
        )}
      </div>
    `;
  }

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}
      .stack-module-preview { box-sizing: border-box; }
      .stack-preview-content { box-sizing: border-box; position: relative; }
      .stack-preview-content[style*="--bg-filter"]::before {
        content: '';
        position: absolute;
        inset: 0;
        background-color: var(--bg-color, transparent);
        background-image: var(--bg-image, none);
        background-size: var(--bg-size, cover);
        background-position: var(--bg-position, center);
        background-repeat: var(--bg-repeat, no-repeat);
        filter: var(--bg-filter);
        border-radius: inherit;
        z-index: -1;
        pointer-events: none;
      }
      .stack-preview-content[style*="cursor: pointer"] .stack-layer-wrapper {
        pointer-events: none !important;
      }
      .stack-preview-content[style*="cursor: pointer"] .stack-layer-child {
        pointer-events: none !important;
      }
      .stack-layer-wrapper { box-sizing: border-box; }
      .stack-layer-child { box-sizing: border-box; }
      /* The inner module rendered inside a stack layer should fully fill the
         layer's child box. Without this, child modules that compute their own
         small fixed dimensions (e.g. image module's default 200px height)
         leave large empty space inside the layer. */
      .stack-layer-child > * {
        flex: 1 1 auto;
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        min-width: 0;
        min-height: 0;
      }
      /* Inside an image module nested in a stack, the img should fill the
         layer-child's available area while preserving its aspect ratio (the
         image module's object-fit controls cover vs contain). */
      .stack-layer-child .image-module-container,
      .stack-layer-child .image-module-preview {
        width: 100% !important;
        height: 100% !important;
        max-width: 100% !important;
        max-height: 100% !important;
      }
      .stack-layer-child .image-module-preview > div {
        width: 100% !important;
        height: 100% !important;
      }
      .stack-layer-child .image-module-preview img {
        width: 100% !important;
        height: 100% !important;
        max-width: 100% !important;
        max-height: 100% !important;
      }
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const sm = module as StackModule;
    (this as any)._currentConfig = config;
    (this as any)._currentPreviewContext = previewContext;
    const lang = hass?.locale?.language || 'en';
    const moduleWithDesign = sm as any;
    const effective = { ...moduleWithDesign, ...(moduleWithDesign.design || {}) } as any;
    const hasChildren = sm.modules && sm.modules.length > 0;

    const hasBackgroundFilter =
      effective.background_filter && effective.background_filter !== 'none';

    const bgResult = hasBackgroundFilter
      ? { styles: {} as Record<string, string> }
      : computeBackgroundStyles({
          color: effective.background_color,
          fallback: 'transparent',
          image: this.getBackgroundImageCss(effective, hass),
          imageSize: effective.background_size || 'cover',
          imagePosition: effective.background_position || 'center',
          imageRepeat: effective.background_repeat || 'no-repeat',
        });

    const borderRadiusValue =
      effective.border_radius ||
      moduleWithDesign.border_radius ||
      (effective.border?.radius !== undefined ? effective.border.radius : undefined) ||
      (moduleWithDesign.border?.radius !== undefined ? moduleWithDesign.border.radius : undefined);

    const clipOverflow = sm.clip_overflow !== false;
    const explicitOverflow = effective.overflow;
    const overflowVal = (() => {
      if (!clipOverflow && (!explicitOverflow || explicitOverflow === 'visible')) {
        return 'visible';
      }
      if (explicitOverflow && explicitOverflow !== 'visible') {
        return explicitOverflow;
      }
      if (
        clipOverflow ||
        (borderRadiusValue &&
          String(borderRadiusValue) !== '0' &&
          String(borderRadiusValue) !== '0px')
      ) {
        return 'hidden';
      }
      return explicitOverflow || 'visible';
    })();

    const pad = this.getPaddingCss(effective);
    const marginStr = this.getMarginCss(effective);

    // We compute the layout mode here so containerStyles can choose the right
    // positioning. In aspect-ratio / fixed-height modes the inner content is
    // absolutely positioned over a sized outer (`inset: 0`); in auto mode it
    // sits in normal flow with `position: relative` and a min-height.
    const heightOverride = (sm.height || '').trim();
    const ar = sm.aspect_ratio || '16:9';
    const useAspect = !heightOverride && ar !== 'auto';
    const usesAbsoluteInner = !!heightOverride || useAspect;

    const containerStyles: Record<string, string> = {
      ...(pad ? { padding: pad } : { padding: '0px' }),
      ...(marginStr ? { margin: marginStr } : {}),
      ...bgResult.styles,
      border:
        effective.border_width ||
        effective.border?.width ||
        effective.border_color ||
        effective.border?.color ||
        (effective.border_style && effective.border_style !== 'none') ||
        (effective.border?.style && effective.border.style !== 'none')
          ? this.getBorderCss(effective)
          : 'none',
      borderRadius: this._addPixelUnit(String(borderRadiusValue || '')) || '0',
      // Only set position from design when we are NOT using the absolute
      // inner-fill mode. Otherwise the design's `position: relative` would
      // override `position: absolute` and break aspect-ratio sizing.
      ...(usesAbsoluteInner
        ? {}
        : {
            position: effective.position || (effective.z_index ? 'relative' : 'relative'),
          }),
      zIndex: effective.z_index || 'auto',
      ...(hasBackgroundFilter ? { isolation: 'isolate' } : {}),
      // In absolute-inner mode width/height are derived from `inset: 0`; setting
      // explicit width/height would conflict and prevent `inset` from working.
      ...(usesAbsoluteInner
        ? {}
        : {
            width: effective.width || '100%',
            height: effective.height || undefined,
          }),
      maxWidth: effective.max_width || undefined,
      minWidth: effective.min_width || undefined,
      maxHeight: effective.max_height || undefined,
      boxShadow: effective.box_shadow || undefined,
      backdropFilter: effective.backdrop_filter || undefined,
      clipPath: effective.clip_path || undefined,
      display: 'block',
      overflow: overflowVal,
      boxSizing: 'border-box',
    };

    if (hasBackgroundFilter) {
      const bgImageCSS = this.getBackgroundImageCss(effective, hass);
      if (bgImageCSS && bgImageCSS !== 'none') {
        containerStyles['--bg-image'] = bgImageCSS;
      }
      if (effective.background_color) {
        containerStyles['--bg-color'] = effective.background_color;
      }
      containerStyles['--bg-size'] = effective.background_size || 'cover';
      containerStyles['--bg-position'] = effective.background_position || 'center';
      containerStyles['--bg-repeat'] = effective.background_repeat || 'no-repeat';
      containerStyles['--bg-filter'] = effective.background_filter;
      containerStyles.position = 'relative';
    }

    const cssVarPrefix = (sm as any).design?.css_variable_prefix;
    if (cssVarPrefix) {
      const cssVars = generateCSSVariables(cssVarPrefix, (sm as any).design);
      Object.assign(containerStyles, cssVars);
    }

    const handlers = this.createGestureHandlers(
      sm.id,
      {
        tap_action: sm.tap_action,
        hold_action: sm.hold_action,
        double_tap_action: sm.double_tap_action,
        entity: (sm as any).entity,
        module: sm,
      },
      hass,
      config
    );

    const hasActions =
      (sm.tap_action && sm.tap_action.action !== 'nothing') ||
      (sm.hold_action && sm.hold_action.action !== 'nothing') ||
      (sm.double_tap_action && sm.double_tap_action.action !== 'nothing');

    const hoverClass = this.getHoverEffectClass(module);

    const _allDesignStyles = this.buildDesignStyles(module, hass);
    const VISUAL_SURFACE_PROPS = new Set([
      'border',
      'borderRadius',
      'padding',
      'paddingTop',
      'paddingBottom',
      'paddingLeft',
      'paddingRight',
      'background',
      'backgroundColor',
      'backgroundImage',
      'backgroundSize',
      'backgroundPosition',
      'backgroundRepeat',
      'boxShadow',
      'backdropFilter',
      'webkitBackdropFilter',
      'clipPath',
      'overflow',
      'isolation',
      'filter',
      'margin',
      'marginTop',
      'marginBottom',
      'marginLeft',
      'marginRight',
    ]);
    const _wrapperOnlyStyles = Object.fromEntries(
      Object.entries(_allDesignStyles).filter(([k]) => !VISUAL_SURFACE_PROPS.has(k))
    ) as Record<string, string | undefined>;
    const designStyles = this.buildStyleString(_wrapperOnlyStyles);

    const paddingTop = useAspect ? aspectRatioToPaddingTop(ar) : '0';

    const outerSizing = heightOverride
      ? `width:100%;position:relative;height:${heightOverride};`
      : useAspect
        ? 'width:100%;position:relative;'
        : 'width:100%;position:relative;min-height:120px;';

    // Inner styles MUST come AFTER containerStyles in the style attribute so
    // that `position:absolute; inset:0;` wins against any conflicting declaration.
    const innerOverrideStyles = usesAbsoluteInner ? 'position:absolute;inset:0;' : '';
    const innerMin = !usesAbsoluteInner ? 'min-height:120px;' : '';

    return this.wrapWithAnimation(
      html`
        <div class="stack-module-preview ${hoverClass}" style="${designStyles}">
          <div class="stack-outer" style="${outerSizing}">
            ${useAspect && !heightOverride
              ? html`<div style="width:100%;padding-top:${paddingTop};pointer-events:none;"></div>`
              : ''}
            <div
              class="stack-preview-content"
              style="${innerMin}${this.buildStyleString(containerStyles)};${innerOverrideStyles}cursor:${hasActions
                ? 'pointer'
                : 'default'};${hasActions ? 'pointer-events:auto;' : ''}"
              @pointerdown=${hasActions ? handlers.onPointerDown : null}
              @pointermove=${hasActions ? handlers.onPointerMove : null}
              @pointerup=${hasActions ? handlers.onPointerUp : null}
              @pointercancel=${hasActions ? handlers.onPointerCancel : null}
              @pointerleave=${hasActions ? handlers.onPointerLeave : null}
            >
              ${hasChildren
                ? (() => {
                    logicService.setHass(hass);
                    const mods = sm.modules ?? [];
                    const visibleChildren = mods.filter(cm => {
                      const m = cm as CardModule & { design?: Record<string, unknown> };
                      const visibleByModule = logicService.evaluateModuleVisibility(m);
                      const visibleByGlobal = logicService.evaluateLogicProperties({
                        logic_entity: m?.design?.logic_entity,
                        logic_attribute: m?.design?.logic_attribute,
                        logic_operator: m?.design?.logic_operator,
                        logic_value: m?.design?.logic_value,
                      });
                      return visibleByModule && visibleByGlobal;
                    });
                    return repeat(
                      visibleChildren,
                      cm => cm.id || cm.type,
                      (childModule, index) => {
                        const childDesign = (childModule as any).design || {};
                        const has3dTransform = !!(
                          childDesign.transform_perspective ||
                          childDesign.transform_rotate_x ||
                          childDesign.transform_rotate_y ||
                          childDesign.transform_rotate_z
                        );
                        const styles = getStackLayerStyles(
                          (childModule as CardModule & { stack_layer?: StackLayerConfig }).stack_layer,
                          index + 1,
                          { allowChildOverflow: has3dTransform }
                        );
                        return html`
                          <div class="stack-layer-wrapper" style="${styles.wrapper}">
                            <div class="stack-layer-child" style="${styles.child}">
                              ${this._renderStackChild(
                                childModule,
                                hass,
                                moduleWithDesign,
                                config,
                                previewContext
                              )}
                            </div>
                          </div>
                        `;
                      }
                    );
                  })()
                : html`
                    <div
                      class="empty-layout-message"
                      style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--secondary-text-color);font-style:italic;text-align:center;padding:16px;"
                    >
                      <span style="font-size:14px;font-weight:500;"
                        >${localize('editor.stack.empty', lang, 'No layers yet')}</span
                      >
                      <small style="font-size:12px;opacity:0.8;"
                        >${localize(
                          'editor.stack.empty_hint',
                          lang,
                          'Drag modules into this stack from the layout tree, or pick a Quick start preset'
                        )}</small
                      >
                    </div>
                  `}
            </div>
          </div>
        </div>
      `,
      module,
      hass
    );
  }

  private _applyStackPreset(
    presetId: string,
    hass: HomeAssistant,
    setModules: (modules: CardModule[]) => void
  ): void {
    const reg = getModuleRegistry();
    const load = (types: string[]) => Promise.all(types.map(t => reg.ensureModuleLoaded(t)));

    if (presetId === 'hero') {
      void load(['image', 'text']).then(() => {
        const img = reg.getModule('image')!.createDefault(undefined, hass) as CardModule;
        const tx = reg.getModule('text')!.createDefault(undefined, hass) as any;
        tx.text = 'Title';
        (img as any).stack_layer = defaultStackLayerForModuleType('image');
        (tx as any).stack_layer = defaultStackLayerForModuleType('text');
        setModules([img, tx]);
      });
      return;
    }
    if (presetId === 'camera_badge') {
      void load(['camera', 'icon']).then(() => {
        const cam = reg.getModule('camera')!.createDefault(undefined, hass) as CardModule;
        const ic = reg.getModule('icon')!.createDefault(undefined, hass) as CardModule;
        (cam as any).stack_layer = defaultStackLayerForModuleType('camera');
        (ic as any).stack_layer = defaultStackLayerForModuleType('icon');
        setModules([cam, ic]);
      });
      return;
    }
    if (presetId === 'clock_weather') {
      void load(['animated_clock', 'animated_weather']).then(() => {
        const c1 = reg.getModule('animated_clock')!.createDefault(undefined, hass) as CardModule;
        const c2 = reg.getModule('animated_weather')!.createDefault(undefined, hass) as CardModule;
        (c1 as any).stack_layer = defaultStackLayerForModuleType('animated_clock');
        (c2 as any).stack_layer = defaultStackLayerForModuleType('animated_weather');
        setModules([c1, c2]);
      });
      return;
    }
    if (presetId === 'media') {
      void load(['image', 'media_player']).then(() => {
        const bg = reg.getModule('image')!.createDefault(undefined, hass) as CardModule;
        const mp = reg.getModule('media_player')!.createDefault(undefined, hass) as CardModule;
        (bg as any).stack_layer = defaultStackLayerForModuleType('image');
        (mp as any).stack_layer = defaultStackLayerForModuleType('media_player');
        setModules([bg, mp]);
      });
    }
  }

  private _renderStackChild(
    childModule: CardModule,
    hass: HomeAssistant,
    layoutDesign: any,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const moduleToRender = this.applyLayoutDesignToChild(childModule, layoutDesign);

    logicService.setHass(hass);
    const childWithDesign: any = moduleToRender as any;
    const shouldShow = logicService.evaluateModuleVisibility(childWithDesign);
    const globalLogicVisible = logicService.evaluateLogicProperties({
      logic_entity: childWithDesign?.design?.logic_entity,
      logic_attribute: childWithDesign?.design?.logic_attribute,
      logic_operator: childWithDesign?.design?.logic_operator,
      logic_value: childWithDesign?.design?.logic_value,
    });

    if (!shouldShow || !globalLogicVisible) {
      return html``;
    }

    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(moduleToRender.type);

    if (!moduleHandler) {
      return ucModulePreviewService.renderModuleLoadingState(moduleToRender);
    }

    const isProModule =
      moduleHandler.metadata?.tags?.includes('pro') ||
      moduleHandler.metadata?.tags?.includes('premium') ||
      false;

    let hasProAccess = false;
    const integrationUser = ucCloudAuthService.checkIntegrationAuth(hass);
    if (
      integrationUser?.subscription?.tier === 'pro' &&
      integrationUser?.subscription?.status === 'active'
    ) {
      hasProAccess = true;
    } else if (ucCloudAuthService.isAuthenticated()) {
      const cloudUser = ucCloudAuthService.getCurrentUser();
      if (cloudUser?.subscription?.tier === 'pro' && cloudUser?.subscription?.status === 'active') {
        hasProAccess = true;
      }
    }

    const shouldShowProOverlay = isProModule && !hasProAccess;

    const migratedChild = autoMigrateCardModule(moduleToRender);
    const moduleContent = moduleHandler.renderPreview(migratedChild, hass, config, previewContext);

    if (shouldShowProOverlay) {
      return html`
        <div class="pro-module-locked" style="position: relative;">
          ${moduleContent}
          <div
            class="pro-module-overlay"
            style="
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.8);
              backdrop-filter: blur(8px);
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 12px;
              z-index: 10;
            "
          >
            <div
              class="pro-module-message"
              style="
                text-align: center;
                color: white;
                padding: 6px;
                max-width: 95%;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
              "
            >
              <ha-icon icon="mdi:lock" style="font-size: 20px; flex-shrink: 0;"></ha-icon>
              <div style="font-size: 11px; font-weight: 600; line-height: 1.2;">Pro Module</div>
            </div>
          </div>
        </div>
      `;
    }

    const m: any = moduleToRender as any;
    const animationType = m.animation_type || m.design?.animation_type;
    if (animationType && animationType !== 'none') {
      const animationDuration = m.animation_duration || m.design?.animation_duration || '2s';
      const animationDelay = m.animation_delay || m.design?.animation_delay || '0s';
      const animationTiming = m.animation_timing || m.design?.animation_timing || 'ease';
      const entityId = m.animation_entity || m.design?.animation_entity;
      const triggerType = m.animation_trigger_type || m.design?.animation_trigger_type || 'state';
      const attribute = m.animation_attribute || m.design?.animation_attribute;
      const targetState = m.animation_state || m.design?.animation_state;
      let shouldAnimate = false;
      if (!entityId) {
        shouldAnimate = true;
      } else if (targetState && hass && hass.states[entityId]) {
        const entity = hass.states[entityId];
        if (triggerType === 'attribute' && attribute) {
          shouldAnimate = String(entity.attributes[attribute]) === targetState;
        } else {
          shouldAnimate = entity.state === targetState;
        }
      }
      if (shouldAnimate) {
        return html`
          <div
            class="module-animation-wrapper animation-${animationType}"
            style="
              --animation-duration: ${animationDuration};
              --animation-delay: ${animationDelay};
              --animation-timing: ${animationTiming};
            "
          >
            ${moduleContent}
          </div>
        `;
      }
    }

    return moduleContent;
  }

  private applyLayoutDesignToChild(childModule: CardModule, layoutDesign: any): CardModule {
    const mergedModule = { ...childModule } as any;
    const childDesign = (childModule as any).design || {};
    const hasExplicitMargin =
      childDesign.margin_top !== undefined ||
      childDesign.margin_bottom !== undefined ||
      childDesign.margin_left !== undefined ||
      childDesign.margin_right !== undefined ||
      (childModule as any).margin_top !== undefined ||
      (childModule as any).margin_bottom !== undefined ||
      (childModule as any).margin_left !== undefined ||
      (childModule as any).margin_right !== undefined;

    if (!hasExplicitMargin) {
      mergedModule.margin_top = '0';
      mergedModule.margin_bottom = '0';
      mergedModule.margin_left = '0';
      mergedModule.margin_right = '0';
    }

    if (layoutDesign.color) mergedModule.color = layoutDesign.color;
    if (layoutDesign.font_size) mergedModule.font_size = layoutDesign.font_size;
    if (layoutDesign.font_family) mergedModule.font_family = layoutDesign.font_family;
    if (layoutDesign.font_weight) mergedModule.font_weight = layoutDesign.font_weight;
    if (layoutDesign.text_align) mergedModule.text_align = layoutDesign.text_align;
    if (layoutDesign.line_height) mergedModule.line_height = layoutDesign.line_height;
    if (layoutDesign.letter_spacing) mergedModule.letter_spacing = layoutDesign.letter_spacing;
    if (layoutDesign.text_transform) mergedModule.text_transform = layoutDesign.text_transform;
    if (layoutDesign.font_style) mergedModule.font_style = layoutDesign.font_style;
    if (layoutDesign.white_space) mergedModule.white_space = layoutDesign.white_space;

    if (layoutDesign.text_shadow_h) mergedModule.text_shadow_h = layoutDesign.text_shadow_h;
    if (layoutDesign.text_shadow_v) mergedModule.text_shadow_v = layoutDesign.text_shadow_v;
    if (layoutDesign.text_shadow_blur) mergedModule.text_shadow_blur = layoutDesign.text_shadow_blur;
    if (layoutDesign.text_shadow_color) mergedModule.text_shadow_color = layoutDesign.text_shadow_color;
    if (layoutDesign.box_shadow_h) mergedModule.box_shadow_h = layoutDesign.box_shadow_h;
    if (layoutDesign.box_shadow_v) mergedModule.box_shadow_v = layoutDesign.box_shadow_v;
    if (layoutDesign.box_shadow_blur) mergedModule.box_shadow_blur = layoutDesign.box_shadow_blur;
    if (layoutDesign.box_shadow_spread) mergedModule.box_shadow_spread = layoutDesign.box_shadow_spread;
    if (layoutDesign.box_shadow_color) mergedModule.box_shadow_color = layoutDesign.box_shadow_color;

    if (layoutDesign.animation_type) mergedModule.animation_type = layoutDesign.animation_type;
    if (layoutDesign.animation_entity) mergedModule.animation_entity = layoutDesign.animation_entity;
    if (layoutDesign.animation_trigger_type)
      mergedModule.animation_trigger_type = layoutDesign.animation_trigger_type;
    if (layoutDesign.animation_attribute)
      mergedModule.animation_attribute = layoutDesign.animation_attribute;
    if (layoutDesign.animation_state) mergedModule.animation_state = layoutDesign.animation_state;
    if (layoutDesign.intro_animation) mergedModule.intro_animation = layoutDesign.intro_animation;
    if (layoutDesign.outro_animation) mergedModule.outro_animation = layoutDesign.outro_animation;
    if (layoutDesign.animation_duration)
      mergedModule.animation_duration = layoutDesign.animation_duration;
    if (layoutDesign.animation_delay) mergedModule.animation_delay = layoutDesign.animation_delay;
    if (layoutDesign.animation_timing) mergedModule.animation_timing = layoutDesign.animation_timing;

    return mergedModule as CardModule;
  }
}
