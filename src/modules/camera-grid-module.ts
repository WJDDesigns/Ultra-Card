import { TemplateResult, html, nothing } from 'lit';
import { keyed } from 'lit/directives/keyed.js';
import { ref } from 'lit/directives/ref.js';
import { HomeAssistant, fireEvent } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import {
  CardModule,
  CameraGridLayout,
  CameraGridModule,
  CameraGridNamePosition,
  CameraGridTile,
  CameraGridTileType,
  CameraGridViewMode,
  UltraCardConfig,
} from '../types';
import { localize } from '../localize/localize';
import { getImageUrl } from '../utils/image-upload';
import { openCameraFullscreen } from '../utils/uc-camera-fullscreen';
import { UltraLinkComponent } from '../components/ultra-link';

type FitMode = 'cover' | 'contain' | 'fill';

const DEFAULT_ASPECT = 16 / 9;
const HOLD_MS = 500;

interface TileRuntime {
  player?: Element | undefined;
  snapshotTimer?: ReturnType<typeof setInterval> | undefined;
  snapshotIntervalMs?: number | undefined;
  snapshotSrc?: string | undefined;
  snapshotEntity?: string | undefined;
  snapshotInFlight?: boolean | undefined;
  lastSnapshotAt?: number | undefined;
}

interface ModuleRuntime {
  wrapper?: Element | undefined;
  spotlightOverride?: string | undefined;
  page: number;
  motionHoldUntil?: number | undefined;
  motionHoldTileId?: string | undefined;
  cycleTimer?: ReturnType<typeof setInterval> | undefined;
  cycleIntervalMs?: number | undefined;
  pageTimer?: ReturnType<typeof setInterval> | undefined;
  pageIntervalMs?: number | undefined;
  pageCount?: number | undefined;
  clockTimer?: ReturnType<typeof setInterval> | undefined;
  holdTimeout?: ReturnType<typeof setTimeout> | undefined;
  isHolding?: boolean | undefined;
}

const TILE_ICONS: Record<CameraGridTileType, string> = {
  camera: 'mdi:cctv',
  image: 'mdi:image',
  text: 'mdi:format-text',
  clock: 'mdi:clock-outline',
  empty: 'mdi:checkbox-blank-outline',
};

export class UltraCameraGridModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'camera_grid',
    title: 'Camera Grid',
    description: 'NVR-style multi-camera grid with live tiles, logos, and flexible layouts',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:view-grid-outline',
    category: 'content',
    tags: ['camera', 'grid', 'security', 'nvr', 'surveillance', 'multiview'],
  };

  private _hass: HomeAssistant | undefined;
  private _moduleRuntime: Map<string, ModuleRuntime> = new Map();
  private _tileRuntime: Map<string, TileRuntime> = new Map();
  private _playerRefs: Map<string, (element: Element | undefined) => void> = new Map();
  private _wrapperRefs: Map<string, (element: Element | undefined) => void> = new Map();
  private _visibilityListener: (() => void) | undefined;
  private _expandedTiles: Set<string> = new Set();
  private _draggedTile: CameraGridTile | null = null;

  createDefault(id?: string, _hass?: HomeAssistant): CameraGridModule {
    return {
      id: id || this.generateId('camera_grid'),
      type: 'camera_grid',
      tiles: [],
      layout: 'regular',
      columns: 2,
      min_tile_width: 160,
      gap: 8,
      tile_aspect_ratio: DEFAULT_ASPECT,
      tile_border_radius: 8,
      spotlight_span: 2,
      spotlight_position: 'top-left',
      tap_to_spotlight: true,
      spotlight_cycle: false,
      spotlight_cycle_interval: 8,
      motion_spotlight: true,
      motion_hold_seconds: 15,
      motion_highlight_color: '',
      view_mode: 'auto',
      refresh_interval: 10,
      adaptive_streaming: true,
      image_fit: 'cover',
      show_names: true,
      name_position: 'bottom-left',
      show_status_badges: true,
      show_snapshot_time: false,
      fallback_image: '',
      tiles_per_page: 0,
      pagination_style: 'both',
      auto_page: false,
      auto_page_interval: 8,
      tile_tap_action: 'spotlight',
      tile_hold_action: 'fullscreen',
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const m = module as CameraGridModule;
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    if ((m.columns ?? 2) < 1 || (m.columns ?? 2) > 8) errors.push('Columns must be between 1 and 8');
    for (const tile of m.tiles || []) {
      if (tile.type === 'camera' && !tile.entity) {
        errors.push('Each camera tile needs a camera entity');
      }
      if ((tile.col_span ?? 1) < 1 || (tile.row_span ?? 1) < 1) {
        errors.push('Tile spans must be at least 1');
      }
    }
    return { valid: errors.length === 0, errors };
  }

  override getRuntimeEntityIds(module: CardModule): string[] {
    const m = module as CameraGridModule;
    const ids: string[] = [];
    for (const tile of m.tiles || []) {
      if (tile.entity) ids.push(tile.entity);
      if (tile.motion_entity) ids.push(tile.motion_entity);
      if (tile.recording_entity) ids.push(tile.recording_entity);
      if (tile.image_entity) ids.push(tile.image_entity);
    }
    return ids;
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as CameraGridModule;
    const lang = hass?.locale?.language || 'en';
    const tiles = m.tiles || [];
    const cameraEntities = tiles
      .filter(t => t.type === 'camera' && t.entity)
      .map(t => t.entity as string);

    return html`
      ${this.injectUcFormStyles()}
      <style>
        ${this.getStyles()}
      </style>
      <div class="module-general-settings">
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.camera_grid.tiles.title', lang, 'Tiles')}
          </div>
          <div class="section-description">
            ${localize(
              'editor.camera_grid.tiles.desc',
              lang,
              'Add cameras and extra tiles, then drag to rearrange the grid.'
            )}
          </div>
          ${this.renderChipListField(
            localize('editor.camera_grid.tiles.add_cameras', lang, 'Add cameras'),
            localize(
              'editor.camera_grid.tiles.add_cameras_desc',
              lang,
              'Pick camera entities to add as tiles. Drag the list below to change order.'
            ),
            hass,
            cameraEntities,
            next => {
              updateModule({ tiles: this._syncCameraTiles(tiles, next) });
              this.triggerPreviewUpdate();
            },
            {
              mode: 'entity',
              entityDomains: ['camera'],
              placeholder: localize(
                'editor.camera_grid.tiles.camera_placeholder',
                lang,
                'Choose a camera'
              ),
            }
          )}
          <div class="entity-rows-container">
            ${tiles.map((tile, index) =>
              this._renderTileRow(tile, index, m, hass, config, updateModule, lang)
            )}
          </div>
          <div class="uc-cg-add-row">
            ${this._addTileButton(lang, 'image', 'mdi:image', 'Add image', () => {
              this._addTile(m, updateModule, { type: 'image', image_type: 'upload', image_fit: 'contain' });
            })}
            ${this._addTileButton(lang, 'text', 'mdi:format-text', 'Add text', () => {
              this._addTile(m, updateModule, { type: 'text', text: '' });
            })}
            ${this._addTileButton(lang, 'clock', 'mdi:clock-outline', 'Add clock', () => {
              this._addTile(m, updateModule, { type: 'clock', clock_format: '24h', show_date: true });
            })}
            ${this._addTileButton(lang, 'empty', 'mdi:checkbox-blank-outline', 'Add empty', () => {
              this._addTile(m, updateModule, { type: 'empty' });
            })}
          </div>
        </div>

        ${this.renderSettingsSection(
          localize('editor.camera_grid.layout.title', lang, 'Layout'),
          localize(
            'editor.camera_grid.layout.desc',
            lang,
            'Choose how tiles are arranged and sized.'
          ),
          []
        )}
        ${this.renderSegmentedField(
          localize('editor.camera_grid.layout.mode', lang, 'Grid style'),
          localize(
            'editor.camera_grid.layout.mode_desc',
            lang,
            'Regular keeps even cells. Auto-fit wraps by width. Masonry stacks mixed ratios. Spotlight enlarges one tile. Custom uses per-tile spans.'
          ),
          m.layout || 'regular',
          [
            { value: 'regular', label: localize('editor.camera_grid.layout.regular', lang, 'Regular') },
            { value: 'auto_fit', label: localize('editor.camera_grid.layout.auto_fit', lang, 'Auto-fit') },
            { value: 'masonry', label: localize('editor.camera_grid.layout.masonry', lang, 'Masonry') },
            {
              value: 'spotlight',
              label: localize('editor.camera_grid.layout.spotlight', lang, 'Spotlight'),
            },
            { value: 'custom', label: localize('editor.camera_grid.layout.custom', lang, 'Custom') },
          ],
          next => updateModule({ layout: next as CameraGridLayout }),
          3
        )}
        ${m.layout !== 'auto_fit'
          ? this.renderSliderField(
              localize('editor.camera_grid.layout.columns', lang, 'Columns'),
              localize(
                'editor.camera_grid.layout.columns_desc',
                lang,
                'Number of columns in the grid.'
              ),
              m.columns ?? 2,
              2,
              1,
              8,
              1,
              v => updateModule({ columns: v }),
              ''
            )
          : this.renderSliderField(
              localize('editor.camera_grid.layout.min_tile_width', lang, 'Minimum tile width'),
              localize(
                'editor.camera_grid.layout.min_tile_width_desc',
                lang,
                'Tiles wrap onto new rows when the card is narrower than this width.'
              ),
              m.min_tile_width ?? 160,
              160,
              80,
              400,
              10,
              v => updateModule({ min_tile_width: v }),
              'px'
            )}
        ${this.renderSliderField(
          localize('editor.camera_grid.layout.gap', lang, 'Gap'),
          localize('editor.camera_grid.layout.gap_desc', lang, 'Space between tiles.'),
          m.gap ?? 8,
          8,
          0,
          32,
          1,
          v => updateModule({ gap: v }),
          'px'
        )}
        ${this.renderSegmentedField(
          localize('editor.camera_grid.layout.aspect', lang, 'Tile aspect ratio'),
          localize(
            'editor.camera_grid.layout.aspect_desc',
            lang,
            'Default shape for camera tiles. Masonry can override this per tile.'
          ),
          this._aspectPreset(m.tile_aspect_ratio ?? DEFAULT_ASPECT),
          [
            { value: '1.7778', label: '16:9' },
            { value: '1.3333', label: '4:3' },
            { value: '1', label: '1:1' },
            { value: 'custom', label: localize('editor.camera_grid.layout.aspect_custom', lang, 'Custom') },
          ],
          next => {
            if (next === 'custom') {
              updateModule({ tile_aspect_ratio: m.tile_aspect_ratio || DEFAULT_ASPECT });
              return;
            }
            updateModule({ tile_aspect_ratio: Number(next) });
          },
          4
        )}
        ${this._aspectPreset(m.tile_aspect_ratio ?? DEFAULT_ASPECT) === 'custom'
          ? this.renderSliderField(
              localize('editor.camera_grid.layout.aspect_value', lang, 'Custom ratio'),
              localize(
                'editor.camera_grid.layout.aspect_value_desc',
                lang,
                'Width divided by height. 1.78 is 16:9.'
              ),
              Number((m.tile_aspect_ratio ?? DEFAULT_ASPECT).toFixed(2)),
              1.78,
              0.5,
              3,
              0.01,
              v => updateModule({ tile_aspect_ratio: v }),
              ''
            )
          : ''}
        ${this.renderSliderField(
          localize('editor.camera_grid.layout.radius', lang, 'Tile corner radius'),
          localize(
            'editor.camera_grid.layout.radius_desc',
            lang,
            'Round the corners of each tile.'
          ),
          m.tile_border_radius ?? 8,
          8,
          0,
          32,
          1,
          v => updateModule({ tile_border_radius: v }),
          'px'
        )}
        ${m.layout === 'spotlight'
          ? this.renderConditionalFieldsGroup(
              localize('editor.camera_grid.spotlight.title', lang, 'Spotlight'),
              html`
                ${this.renderSegmentedField(
                  localize('editor.camera_grid.spotlight.span', lang, 'Spotlight size'),
                  localize(
                    'editor.camera_grid.spotlight.span_desc',
                    lang,
                    'How many columns and rows the featured tile occupies.'
                  ),
                  String(m.spotlight_span ?? 2),
                  [
                    { value: '2', label: '2×2' },
                    { value: '3', label: '3×3' },
                  ],
                  next => updateModule({ spotlight_span: Number(next) as 2 | 3 })
                )}
                ${this.renderSegmentedField(
                  localize('editor.camera_grid.spotlight.position', lang, 'Spotlight position'),
                  localize(
                    'editor.camera_grid.spotlight.position_desc',
                    lang,
                    'Where the featured tile sits in the grid.'
                  ),
                  m.spotlight_position || 'top-left',
                  [
                    {
                      value: 'top-left',
                      label: localize('editor.camera_grid.spotlight.top_left', lang, 'Top left'),
                    },
                    {
                      value: 'top-right',
                      label: localize('editor.camera_grid.spotlight.top_right', lang, 'Top right'),
                    },
                    { value: 'left', label: localize('editor.camera_grid.spotlight.left', lang, 'Left') },
                    {
                      value: 'right',
                      label: localize('editor.camera_grid.spotlight.right', lang, 'Right'),
                    },
                    {
                      value: 'center',
                      label: localize('editor.camera_grid.spotlight.center', lang, 'Center'),
                    },
                  ],
                  next => updateModule({ spotlight_position: next as CameraGridModule['spotlight_position'] }),
                  3
                )}
                ${this.renderSettingsSection('', '', [
                  {
                    title: localize(
                      'editor.camera_grid.spotlight.tap_to_spotlight',
                      lang,
                      'Tap to spotlight'
                    ),
                    description: localize(
                      'editor.camera_grid.spotlight.tap_to_spotlight_desc',
                      lang,
                      'Tap a smaller camera to swap it into the featured slot.'
                    ),
                    hass,
                    data: { tap_to_spotlight: m.tap_to_spotlight !== false },
                    schema: [this.booleanField('tap_to_spotlight')],
                    onChange: (e: CustomEvent) =>
                      updateModule({
                        tap_to_spotlight: e.detail.value?.tap_to_spotlight ?? true,
                      }),
                  },
                ])}
              `
            )
          : ''}

        ${this.renderSettingsSection(
          localize('editor.camera_grid.stream.title', lang, 'Stream'),
          localize(
            'editor.camera_grid.stream.desc',
            lang,
            'How camera tiles fetch video. Adaptive keeps live video on the featured tile only.'
          ),
          []
        )}
        ${this.renderSegmentedField(
          localize('editor.camera_grid.stream.view_mode', lang, 'Stream mode'),
          localize(
            'editor.camera_grid.stream.view_mode_desc',
            lang,
            'Auto uses Home Assistant snapshot polling. Live opens a continuous stream. Snapshot refreshes on your interval.'
          ),
          m.view_mode || 'auto',
          [
            { value: 'auto', label: localize('editor.camera.view_mode.options.auto', lang, 'Auto') },
            { value: 'live', label: localize('editor.camera.view_mode.options.live', lang, 'Live') },
            {
              value: 'snapshot',
              label: localize('editor.camera.view_mode.options.snapshot', lang, 'Snapshot'),
            },
          ],
          next => updateModule({ view_mode: next as CameraGridViewMode })
        )}
        ${this.renderSliderField(
          localize('editor.camera_grid.stream.refresh', lang, 'Snapshot refresh'),
          localize(
            'editor.camera_grid.stream.refresh_desc',
            lang,
            'Seconds between still-image refreshes in snapshot mode.'
          ),
          m.refresh_interval ?? 10,
          10,
          1,
          300,
          1,
          v => updateModule({ refresh_interval: v }),
          's'
        )}
        ${this.renderSettingsSection('', '', [
          {
            title: localize('editor.camera_grid.stream.adaptive', lang, 'Adaptive streaming'),
            description: localize(
              'editor.camera_grid.stream.adaptive_desc',
              lang,
              'Live stream only the spotlight or large tiles. Small tiles use snapshots to save bandwidth.'
            ),
            hass,
            data: { adaptive_streaming: m.adaptive_streaming !== false },
            schema: [this.booleanField('adaptive_streaming')],
            onChange: (e: CustomEvent) =>
              updateModule({
                adaptive_streaming: e.detail.value?.adaptive_streaming ?? true,
              }),
          },
        ])}
        ${this.renderSegmentedField(
          localize('editor.camera_grid.stream.fit', lang, 'Image fit'),
          localize(
            'editor.camera_grid.stream.fit_desc',
            lang,
            'How the feed fills each tile. Cover crops, contain letterboxes, fill stretches.'
          ),
          m.image_fit || 'cover',
          [
            { value: 'cover', label: localize('editor.camera.image_fit.options.cover', lang, 'Cover') },
            {
              value: 'contain',
              label: localize('editor.camera.image_fit.options.contain', lang, 'Contain'),
            },
            { value: 'fill', label: localize('editor.camera.image_fit.options.fill', lang, 'Fill') },
          ],
          next => updateModule({ image_fit: next as CameraGridModule['image_fit'] })
        )}

        ${this.renderSettingsSection(
          localize('editor.camera_grid.overlays.title', lang, 'Overlays and badges'),
          localize(
            'editor.camera_grid.overlays.desc',
            lang,
            'Name labels, motion and recording badges, and fallback imagery.'
          ),
          [
            {
              title: localize('editor.camera_grid.overlays.show_names', lang, 'Show names'),
              description: localize(
                'editor.camera_grid.overlays.show_names_desc',
                lang,
                'Overlay the camera or tile name on each feed.'
              ),
              hass,
              data: { show_names: m.show_names !== false },
              schema: [this.booleanField('show_names')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_names: e.detail.value?.show_names ?? true }),
            },
            {
              title: localize('editor.camera_grid.overlays.badges', lang, 'Status badges'),
              description: localize(
                'editor.camera_grid.overlays.badges_desc',
                lang,
                'Show motion, recording, and offline indicators on tiles.'
              ),
              hass,
              data: { show_status_badges: m.show_status_badges !== false },
              schema: [this.booleanField('show_status_badges')],
              onChange: (e: CustomEvent) =>
                updateModule({
                  show_status_badges: e.detail.value?.show_status_badges ?? true,
                }),
            },
            {
              title: localize('editor.camera_grid.overlays.snapshot_time', lang, 'Snapshot time'),
              description: localize(
                'editor.camera_grid.overlays.snapshot_time_desc',
                lang,
                'Show when the last snapshot was taken on snapshot tiles.'
              ),
              hass,
              data: { show_snapshot_time: m.show_snapshot_time === true },
              schema: [this.booleanField('show_snapshot_time')],
              onChange: (e: CustomEvent) =>
                updateModule({
                  show_snapshot_time: e.detail.value?.show_snapshot_time ?? false,
                }),
            },
          ]
        )}
        ${m.show_names !== false
          ? this.renderSegmentedField(
              localize('editor.camera_grid.overlays.name_position', lang, 'Name position'),
              localize(
                'editor.camera_grid.overlays.name_position_desc',
                lang,
                'Where the name overlay sits on each tile.'
              ),
              m.name_position || 'bottom-left',
              [
                { value: 'top-left', label: localize('editor.camera.name_position.options.top_left', lang, 'Top left') },
                {
                  value: 'top-middle',
                  label: localize('editor.camera_grid.overlays.top_middle', lang, 'Top middle'),
                },
                {
                  value: 'top-right',
                  label: localize('editor.camera.name_position.options.top_right', lang, 'Top right'),
                },
                {
                  value: 'bottom-left',
                  label: localize('editor.camera.name_position.options.bottom_left', lang, 'Bottom left'),
                },
                {
                  value: 'bottom-middle',
                  label: localize('editor.camera_grid.overlays.bottom_middle', lang, 'Bottom middle'),
                },
                {
                  value: 'bottom-right',
                  label: localize('editor.camera.name_position.options.bottom_right', lang, 'Bottom right'),
                },
                {
                  value: 'center',
                  label: localize('editor.camera.name_position.options.center', lang, 'Center'),
                },
              ],
              next => updateModule({ name_position: next as CameraGridNamePosition }),
              4
            )
          : ''}
        ${this.renderFileField(
          localize('editor.camera_grid.overlays.fallback', lang, 'Fallback image'),
          localize(
            'editor.camera_grid.overlays.fallback_desc',
            lang,
            'Shown when a camera is unavailable or a snapshot fails.'
          ),
          hass,
          m.fallback_image || '',
          path => updateModule({ fallback_image: path })
        )}

        ${this.renderSettingsSection(
          localize('editor.camera_grid.behaviour.title', lang, 'Behaviour'),
          localize(
            'editor.camera_grid.behaviour.desc',
            lang,
            'What happens when you tap or hold a camera tile, plus auto-cycle and motion spotlight.'
          ),
          []
        )}
        ${this.renderSegmentedField(
          localize('editor.camera_grid.behaviour.tap', lang, 'Tap action'),
          localize(
            'editor.camera_grid.behaviour.tap_desc',
            lang,
            'Spotlight swaps the featured camera. Fullscreen opens the live feed. More info opens the entity dialog.'
          ),
          m.tile_tap_action || 'spotlight',
          [
            {
              value: 'spotlight',
              label: localize('editor.camera_grid.behaviour.spotlight', lang, 'Spotlight'),
            },
            {
              value: 'fullscreen',
              label: localize('editor.camera_grid.behaviour.fullscreen', lang, 'Fullscreen'),
            },
            {
              value: 'more-info',
              label: localize('editor.camera_grid.behaviour.more_info', lang, 'More info'),
            },
            {
              value: 'nothing',
              label: localize('editor.camera_grid.behaviour.nothing', lang, 'Nothing'),
            },
          ],
          next => updateModule({ tile_tap_action: next as CameraGridModule['tile_tap_action'] }),
          2
        )}
        ${this.renderSegmentedField(
          localize('editor.camera_grid.behaviour.hold', lang, 'Hold action'),
          localize(
            'editor.camera_grid.behaviour.hold_desc',
            lang,
            'Action used when a camera tile is pressed and held.'
          ),
          m.tile_hold_action || 'fullscreen',
          [
            {
              value: 'fullscreen',
              label: localize('editor.camera_grid.behaviour.fullscreen', lang, 'Fullscreen'),
            },
            {
              value: 'more-info',
              label: localize('editor.camera_grid.behaviour.more_info', lang, 'More info'),
            },
            {
              value: 'nothing',
              label: localize('editor.camera_grid.behaviour.nothing', lang, 'Nothing'),
            },
          ],
          next => updateModule({ tile_hold_action: next as CameraGridModule['tile_hold_action'] })
        )}
        ${this.renderSettingsSection('', '', [
          {
            title: localize('editor.camera_grid.behaviour.cycle', lang, 'Auto-cycle spotlight'),
            description: localize(
              'editor.camera_grid.behaviour.cycle_desc',
              lang,
              'Rotate the featured camera on an interval. Pauses while motion is holding the spotlight.'
            ),
            hass,
            data: { spotlight_cycle: m.spotlight_cycle === true },
            schema: [this.booleanField('spotlight_cycle')],
            onChange: (e: CustomEvent) =>
              updateModule({ spotlight_cycle: e.detail.value?.spotlight_cycle ?? false }),
          },
        ])}
        ${m.spotlight_cycle
          ? this.renderSliderField(
              localize('editor.camera_grid.behaviour.cycle_interval', lang, 'Cycle interval'),
              localize(
                'editor.camera_grid.behaviour.cycle_interval_desc',
                lang,
                'Seconds each camera stays in the spotlight.'
              ),
              m.spotlight_cycle_interval ?? 8,
              8,
              2,
              120,
              1,
              v => updateModule({ spotlight_cycle_interval: v }),
              's'
            )
          : ''}
        ${this.renderSettingsSection('', '', [
          {
            title: localize('editor.camera_grid.behaviour.motion', lang, 'Motion spotlight'),
            description: localize(
              'editor.camera_grid.behaviour.motion_desc',
              lang,
              'When a tile motion sensor turns on, that camera jumps to the spotlight and stays there for the hold time.'
            ),
            hass,
            data: { motion_spotlight: m.motion_spotlight !== false },
            schema: [this.booleanField('motion_spotlight')],
            onChange: (e: CustomEvent) =>
              updateModule({ motion_spotlight: e.detail.value?.motion_spotlight ?? true }),
          },
        ])}
        ${m.motion_spotlight !== false
          ? html`
              ${this.renderSliderField(
                localize('editor.camera_grid.behaviour.motion_hold', lang, 'Motion hold'),
                localize(
                  'editor.camera_grid.behaviour.motion_hold_desc',
                  lang,
                  'Seconds to keep a motion camera in the spotlight after it triggers.'
                ),
                m.motion_hold_seconds ?? 15,
                15,
                3,
                180,
                1,
                v => updateModule({ motion_hold_seconds: v }),
                's'
              )}
              ${this.renderColorField(
                localize('editor.camera_grid.behaviour.motion_color', lang, 'Motion highlight'),
                localize(
                  'editor.camera_grid.behaviour.motion_color_desc',
                  lang,
                  'Outline color for tiles that currently have motion.'
                ),
                hass,
                m.motion_highlight_color || '',
                'var(--accent-color, #ff9800)',
                color => updateModule({ motion_highlight_color: color })
              )}
            `
          : ''}

        ${this.renderSettingsSection(
          localize('editor.camera_grid.pagination.title', lang, 'Pagination'),
          localize(
            'editor.camera_grid.pagination.desc',
            lang,
            'Split large camera lists across pages.'
          ),
          []
        )}
        ${this.renderSliderField(
          localize('editor.camera_grid.pagination.per_page', lang, 'Tiles per page'),
          localize(
            'editor.camera_grid.pagination.per_page_desc',
            lang,
            '0 shows every tile. Set a number to page through larger sets.'
          ),
          m.tiles_per_page ?? 0,
          0,
          0,
          32,
          1,
          v => updateModule({ tiles_per_page: v }),
          ''
        )}
        ${this.renderSegmentedField(
          localize('editor.camera_grid.pagination.style', lang, 'Pager style'),
          localize(
            'editor.camera_grid.pagination.style_desc',
            lang,
            'How page navigation is shown under the grid.'
          ),
          m.pagination_style || 'both',
          [
            { value: 'both', label: localize('editor.camera_grid.pagination.both', lang, 'Arrows and dots') },
            { value: 'dots', label: localize('editor.camera_grid.pagination.dots', lang, 'Dots') },
            { value: 'arrows', label: localize('editor.camera_grid.pagination.arrows', lang, 'Arrows') },
            { value: 'none', label: localize('editor.camera_grid.pagination.none', lang, 'Hidden') },
          ],
          next =>
            updateModule({ pagination_style: next as CameraGridModule['pagination_style'] }),
          2
        )}
        ${this.renderSettingsSection('', '', [
          {
            title: localize('editor.camera_grid.pagination.auto', lang, 'Auto-page'),
            description: localize(
              'editor.camera_grid.pagination.auto_desc',
              lang,
              'Advance pages automatically on an interval.'
            ),
            hass,
            data: { auto_page: m.auto_page === true },
            schema: [this.booleanField('auto_page')],
            onChange: (e: CustomEvent) =>
              updateModule({ auto_page: e.detail.value?.auto_page ?? false }),
          },
        ])}
        ${m.auto_page
          ? this.renderSliderField(
              localize('editor.camera_grid.pagination.auto_interval', lang, 'Page interval'),
              localize(
                'editor.camera_grid.pagination.auto_interval_desc',
                lang,
                'Seconds between automatic page changes.'
              ),
              m.auto_page_interval ?? 8,
              8,
              2,
              120,
              1,
              v => updateModule({ auto_page_interval: v }),
              's'
            )
          : ''}
      </div>
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as CameraGridModule;
    const lang = hass?.locale?.language || 'en';
    this._hass = hass;
    const tiles = m.tiles || [];

    if (!tiles.length) {
      return this.renderGradientErrorState(
        localize('editor.camera_grid.empty', lang, 'Add cameras'),
        localize(
          'editor.camera_grid.empty_desc',
          lang,
          'Choose camera entities in the General tab to build the grid'
        ),
        'mdi:view-grid-outline'
      );
    }

    const rt = this._runtimeFor(m.id);
    this._updateMotionHold(m, hass, tiles, rt);
    const paged = this._pagedTiles(m, tiles, rt);
    const spotlightId = this._effectiveSpotlightId(m, paged, rt);
    this._ensureModuleTimers(m, rt);

    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);
    const wrapperRef = this._wrapperRef(m.id);

    const body = html`
      <div
        class="uc-camera-grid ${hoverClass}"
        data-uc-camera-grid-id="${m.id}"
        data-uc-role="pane"
        ${ref(wrapperRef)}
        style="${designStyles}"
      >
        ${this._renderLayout(m, hass, config, paged, spotlightId, rt)}
        ${this._renderPager(m, tiles, rt, lang)}
      </div>
    `;

    return this.wrapWithAnimation(body, module, hass);
  }

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}
      .uc-camera-grid { width: 100%; box-sizing: border-box; }
      .uc-cg-grid, .uc-cg-masonry { width: 100%; }
      .uc-cg-masonry { display: flex; align-items: flex-start; }
      .uc-cg-masonry-col { flex: 1; min-width: 0; display: flex; flex-direction: column; }
      .uc-cg-tile {
        position: relative;
        overflow: hidden;
        background: #111;
        color: #fff;
        min-width: 0;
        min-height: 0;
      }
      .uc-cg-tile:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      .uc-cg-tile.is-interactive { cursor: pointer; }
      .uc-cg-player, .uc-cg-media {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
      }
      .uc-cg-placeholder {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px;
        text-align: center;
        background: #1a1a1a;
        color: rgba(255,255,255,0.85);
      }
      .uc-cg-name {
        position: absolute;
        padding: 4px 8px;
        background: rgba(0,0,0,0.65);
        border-radius: 4px;
        font-size: 12px;
        line-height: 1.2;
        max-width: calc(100% - 12px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        pointer-events: none;
        z-index: 2;
      }
      .uc-cg-badges {
        position: absolute;
        top: 6px;
        right: 6px;
        display: flex;
        gap: 4px;
        z-index: 3;
        pointer-events: none;
      }
      .uc-cg-badge {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        box-shadow: 0 0 0 2px rgba(0,0,0,0.45);
      }
      .uc-cg-badge.motion { background: #ff3b30; animation: uc-cg-pulse 1.2s ease-in-out infinite; }
      .uc-cg-badge.recording { background: #ff3b30; }
      .uc-cg-badge.offline { background: #8e8e93; }
      .uc-cg-time {
        position: absolute;
        bottom: 6px;
        right: 6px;
        font-size: 10px;
        padding: 2px 6px;
        background: rgba(0,0,0,0.6);
        border-radius: 4px;
        z-index: 2;
        pointer-events: none;
      }
      .uc-cg-text, .uc-cg-clock {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 12px;
        text-align: center;
        background: var(--uc-pane-bg, var(--card-background-color, #1c1c1e));
        color: var(--primary-text-color, #fff);
      }
      .uc-cg-clock-time { font-size: 22px; font-weight: 700; letter-spacing: 0.02em; }
      .uc-cg-clock-date { font-size: 12px; opacity: 0.75; margin-top: 4px; }
      .uc-cg-empty { background: rgba(255,255,255,0.04); }
      .uc-cg-pager {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 10px;
      }
      .uc-cg-pager button {
        border: none;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        border-radius: 999px;
        min-width: 32px;
        height: 32px;
        cursor: pointer;
      }
      .uc-cg-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        padding: 0;
        min-width: 8px;
        height: 8px;
        background: var(--disabled-color);
      }
      .uc-cg-dot.active { background: var(--primary-color); }
      @keyframes uc-cg-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.45; transform: scale(0.85); }
      }
      .entity-rows-container { margin-top: 8px; }
      .entity-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: var(--uc-pane-bg, var(--card-background-color));
        border-radius: var(--uc-r-8, 8px);
        margin-bottom: 8px;
        cursor: move;
        border: 1px solid var(--divider-color);
      }
      .entity-row:hover { border-color: var(--primary-color); }
      .entity-row.dragging { opacity: 0.5; }
      .entity-row.drag-over { border-top: 3px solid var(--primary-color); }
      .drag-handle { cursor: grab; color: var(--secondary-text-color); }
      .entity-info {
        flex: 1;
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .entity-info.no-entity { color: var(--secondary-text-color); font-style: italic; }
      .expand-icon { cursor: pointer; color: var(--primary-color); }
      .delete-icon { cursor: pointer; color: var(--error-color); }
      .entity-settings {
        padding: 16px;
        background: rgba(var(--rgb-primary-color), 0.05);
        border-left: 3px solid var(--primary-color);
        border-radius: 0 var(--uc-r-8, 8px) var(--uc-r-8, 8px) 0;
        margin-bottom: 8px;
      }
      .uc-cg-add-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 8px;
      }
      .add-entity-btn {
        width: 100%;
        padding: 12px;
        background: var(--primary-color);
        color: var(--text-primary-color);
        border: none;
        border-radius: var(--uc-r-8, 8px);
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .section-description {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin: -8px 0 16px;
        line-height: 1.4;
      }
    `;
  }

  // ── Editor helpers ──────────────────────────────────────────────────────────

  private _addTileButton(
    lang: string,
    type: CameraGridTileType,
    icon: string,
    fallback: string,
    onClick: () => void
  ): TemplateResult {
    return html`
      <button class="add-entity-btn" type="button" @click=${onClick}>
        <ha-icon icon="${icon}"></ha-icon>
        ${localize(`editor.camera_grid.tiles.add_${type}`, lang, fallback)}
      </button>
    `;
  }

  private _addTile(
    module: CameraGridModule,
    updateModule: (updates: Partial<CardModule>) => void,
    partial: Partial<CameraGridTile> & { type: CameraGridTileType }
  ): void {
    const tile: CameraGridTile = {
      id: this.generateId('cg_tile'),
      view_mode: 'inherit',
      ...partial,
    };
    updateModule({ tiles: [...(module.tiles || []), tile] });
    this._expandedTiles.add(tile.id);
    this.triggerPreviewUpdate();
  }

  private _syncCameraTiles(tiles: CameraGridTile[], entities: string[]): CameraGridTile[] {
    const existing = new Map(
      tiles.filter(t => t.type === 'camera' && t.entity).map(t => [t.entity as string, t])
    );
    const next: CameraGridTile[] = [];
    for (const tile of tiles) {
      if (tile.type !== 'camera') {
        next.push(tile);
        continue;
      }
      if (tile.entity && entities.includes(tile.entity)) next.push(tile);
    }
    const present = new Set(next.filter(t => t.type === 'camera').map(t => t.entity));
    for (const entity of entities) {
      if (present.has(entity)) continue;
      next.push(
        existing.get(entity) || {
          id: this.generateId('cg_tile'),
          type: 'camera',
          entity,
          view_mode: 'inherit',
        }
      );
    }
    return next;
  }

  private _updateTile(
    module: CameraGridModule,
    tileId: string,
    patch: Partial<CameraGridTile>,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const tiles = (module.tiles || []).map(t => (t.id === tileId ? { ...t, ...patch } : t));
    updateModule({ tiles });
    this.triggerPreviewUpdate();
  }

  private _renderTileRow(
    tile: CameraGridTile,
    _index: number,
    module: CameraGridModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const isExpanded = this._expandedTiles.has(tile.id);
    const state = tile.entity ? hass?.states?.[tile.entity] : undefined;
    const displayName =
      tile.name ||
      state?.attributes?.friendly_name ||
      tile.entity ||
      localize(`editor.camera_grid.tiles.type_${tile.type}`, lang, tile.type);

    return html`
      <div
        class="entity-row ${this._draggedTile?.id === tile.id ? 'dragging' : ''}"
        draggable="true"
        @dragstart=${(e: DragEvent) => {
          this._draggedTile = tile;
          e.dataTransfer?.setData('text/plain', tile.id);
        }}
        @dragend=${() => {
          this._draggedTile = null;
        }}
        @dragover=${(e: DragEvent) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement).classList.add('drag-over');
        }}
        @dragleave=${(e: DragEvent) => {
          (e.currentTarget as HTMLElement).classList.remove('drag-over');
        }}
        @drop=${(e: DragEvent) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement).classList.remove('drag-over');
          const dragged = this._draggedTile;
          if (dragged && dragged.id !== tile.id) {
            const list = [...(module.tiles || [])];
            const fromIndex = list.findIndex(t => t.id === dragged.id);
            const toIndex = list.findIndex(t => t.id === tile.id);
            if (fromIndex !== -1 && toIndex !== -1) {
              const [moved] = list.splice(fromIndex, 1);
              list.splice(toIndex, 0, moved);
              updateModule({ tiles: list });
              this.triggerPreviewUpdate();
            }
          }
        }}
      >
        <ha-icon icon="mdi:drag" class="drag-handle"></ha-icon>
        <ha-icon icon="${TILE_ICONS[tile.type]}"></ha-icon>
        <div class="entity-info ${!tile.entity && tile.type === 'camera' ? 'no-entity' : ''}">
          ${displayName}
        </div>
        <ha-icon
          icon="${isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}"
          class="expand-icon"
          @click=${() => {
            if (isExpanded) this._expandedTiles.delete(tile.id);
            else this._expandedTiles.add(tile.id);
            this.triggerPreviewUpdate();
          }}
        ></ha-icon>
        <ha-icon
          icon="mdi:delete"
          class="delete-icon"
          @click=${() => {
            updateModule({ tiles: (module.tiles || []).filter(t => t.id !== tile.id) });
            this.triggerPreviewUpdate();
          }}
        ></ha-icon>
      </div>
      ${isExpanded
        ? html`<div class="entity-settings">
            ${this._renderTileSettings(tile, module, hass, config, updateModule, lang)}
          </div>`
        : nothing}
    `;
  }

  private _renderTileSettings(
    tile: CameraGridTile,
    module: CameraGridModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const patch = (next: Partial<CameraGridTile>) =>
      this._updateTile(module, tile.id, next, updateModule);

    return html`
      ${this.renderFieldSection(
        localize('editor.camera_grid.tile.name', lang, 'Name'),
        localize(
          'editor.camera_grid.tile.name_desc',
          lang,
          'Optional label. Leave blank to use the entity name.'
        ),
        hass,
        { name: tile.name || '' },
        [{ name: 'name', selector: { text: {} } }],
        (e: CustomEvent) => patch({ name: e.detail.value?.name ?? '' })
      )}
      ${tile.type === 'camera'
        ? html`
            ${this.renderEntityPickerWithVariables(
              hass,
              config,
              'entity',
              tile.entity || '',
              value => patch({ entity: value }),
              ['camera'],
              localize('editor.camera_grid.tile.entity', lang, 'Camera entity')
            )}
            ${this.renderSegmentedField(
              localize('editor.camera_grid.tile.view_mode', lang, 'Tile stream mode'),
              localize(
                'editor.camera_grid.tile.view_mode_desc',
                lang,
                'Inherit uses the grid default. Override for this tile only.'
              ),
              tile.view_mode || 'inherit',
              [
                { value: 'inherit', label: localize('editor.camera_grid.tile.inherit', lang, 'Inherit') },
                { value: 'auto', label: localize('editor.camera.view_mode.options.auto', lang, 'Auto') },
                { value: 'live', label: localize('editor.camera.view_mode.options.live', lang, 'Live') },
                {
                  value: 'snapshot',
                  label: localize('editor.camera.view_mode.options.snapshot', lang, 'Snapshot'),
                },
              ],
              next => patch({ view_mode: next as CameraGridTile['view_mode'] }),
              2
            )}
            ${this.renderEntityPickerWithVariables(
              hass,
              config,
              'motion_entity',
              tile.motion_entity || '',
              value => patch({ motion_entity: value }),
              ['binary_sensor'],
              localize('editor.camera_grid.tile.motion', lang, 'Motion sensor')
            )}
            ${this.renderEntityPickerWithVariables(
              hass,
              config,
              'recording_entity',
              tile.recording_entity || '',
              value => patch({ recording_entity: value }),
              ['binary_sensor', 'switch', 'sensor'],
              localize('editor.camera_grid.tile.recording', lang, 'Recording entity')
            )}
          `
        : nothing}
      ${tile.type === 'image'
        ? html`
            ${this.renderSegmentedField(
              localize('editor.camera_grid.tile.image_source', lang, 'Image source'),
              localize(
                'editor.camera_grid.tile.image_source_desc',
                lang,
                'Upload a logo, paste a URL, or use an entity picture.'
              ),
              tile.image_type || 'upload',
              [
                { value: 'upload', label: localize('editor.camera_grid.tile.upload', lang, 'Upload') },
                { value: 'url', label: localize('editor.camera_grid.tile.url', lang, 'URL') },
                { value: 'entity', label: localize('editor.camera_grid.tile.entity_pic', lang, 'Entity') },
              ],
              next => patch({ image_type: next as CameraGridTile['image_type'] })
            )}
            ${(tile.image_type || 'upload') === 'upload' || tile.image_type === 'url'
              ? this.renderFileField(
                  localize('editor.camera_grid.tile.image', lang, 'Image'),
                  localize(
                    'editor.camera_grid.tile.image_desc',
                    lang,
                    'Logo or still image shown in this tile.'
                  ),
                  hass,
                  tile.image_url || '',
                  path => patch({ image_url: path })
                )
              : this.renderEntityPickerWithVariables(
                  hass,
                  config,
                  'image_entity',
                  tile.image_entity || '',
                  value => patch({ image_entity: value }),
                  undefined,
                  localize('editor.camera_grid.tile.image_entity', lang, 'Image entity')
                )}
            ${this.renderSegmentedField(
              localize('editor.camera_grid.tile.image_fit', lang, 'Image fit'),
              localize(
                'editor.camera_grid.tile.image_fit_desc',
                lang,
                'Cover crops the image. Contain shows the whole logo.'
              ),
              tile.image_fit || 'contain',
              [
                { value: 'cover', label: localize('editor.camera.image_fit.options.cover', lang, 'Cover') },
                {
                  value: 'contain',
                  label: localize('editor.camera.image_fit.options.contain', lang, 'Contain'),
                },
              ],
              next => patch({ image_fit: next as CameraGridTile['image_fit'] })
            )}
          `
        : nothing}
      ${tile.type === 'text'
        ? this.renderFieldSection(
            localize('editor.camera_grid.tile.text', lang, 'Text'),
            localize('editor.camera_grid.tile.text_desc', lang, 'Shown in the centre of this tile.'),
            hass,
            { text: tile.text || '' },
            [{ name: 'text', selector: { text: {} } }],
            (e: CustomEvent) => patch({ text: e.detail.value?.text ?? '' })
          )
        : nothing}
      ${tile.type === 'clock'
        ? html`
            ${this.renderSegmentedField(
              localize('editor.camera_grid.tile.clock_format', lang, 'Clock format'),
              localize(
                'editor.camera_grid.tile.clock_format_desc',
                lang,
                '12-hour or 24-hour time.'
              ),
              tile.clock_format || '24h',
              [
                { value: '12h', label: '12h' },
                { value: '24h', label: '24h' },
              ],
              next => patch({ clock_format: next as CameraGridTile['clock_format'] })
            )}
            ${this.renderSettingsSection('', '', [
              {
                title: localize('editor.camera_grid.tile.show_date', lang, 'Show date'),
                description: localize(
                  'editor.camera_grid.tile.show_date_desc',
                  lang,
                  'Show the current date under the time.'
                ),
                hass,
                data: { show_date: tile.show_date !== false },
                schema: [this.booleanField('show_date')],
                onChange: (e: CustomEvent) =>
                  patch({ show_date: e.detail.value?.show_date ?? true }),
              },
            ])}
          `
        : nothing}
      ${module.layout === 'masonry'
        ? this.renderSegmentedField(
            localize('editor.camera_grid.tile.aspect', lang, 'Tile ratio'),
            localize(
              'editor.camera_grid.tile.aspect_desc',
              lang,
              'Used by masonry to estimate tile height.'
            ),
            this._aspectPreset(tile.aspect_ratio || module.tile_aspect_ratio || DEFAULT_ASPECT),
            [
              { value: '1.7778', label: '16:9' },
              { value: '1.3333', label: '4:3' },
              { value: '1', label: '1:1' },
            ],
            next => patch({ aspect_ratio: Number(next) })
          )
        : nothing}
      ${module.layout === 'custom'
        ? html`
            ${this.renderSliderField(
              localize('editor.camera_grid.tile.col_span', lang, 'Column span'),
              localize(
                'editor.camera_grid.tile.col_span_desc',
                lang,
                'How many columns this tile occupies.'
              ),
              tile.col_span ?? 1,
              1,
              1,
              4,
              1,
              v => patch({ col_span: v }),
              ''
            )}
            ${this.renderSliderField(
              localize('editor.camera_grid.tile.row_span', lang, 'Row span'),
              localize(
                'editor.camera_grid.tile.row_span_desc',
                lang,
                'How many rows this tile occupies.'
              ),
              tile.row_span ?? 1,
              1,
              1,
              4,
              1,
              v => patch({ row_span: v }),
              ''
            )}
          `
        : nothing}
    `;
  }

  // ── Preview layout ──────────────────────────────────────────────────────────

  private _renderLayout(
    module: CameraGridModule,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    tiles: CameraGridTile[],
    spotlightId: string | undefined,
    rt: ModuleRuntime
  ): TemplateResult {
    const gap = `${module.gap ?? 8}px`;
    const columns = Math.max(1, Math.min(8, module.columns || 2));
    const layout = module.layout || 'regular';

    if (layout === 'masonry') {
      const stacks = this._masonryColumns(tiles, columns, module.tile_aspect_ratio || DEFAULT_ASPECT);
      return html`
        <div class="uc-cg-masonry" style="gap:${gap}">
          ${stacks.map(
            col => html`
              <div class="uc-cg-masonry-col" style="gap:${gap}">
                ${col.map(tile =>
                  this._renderTile(module, hass, config, tile, spotlightId, rt, {
                    aspect: tile.aspect_ratio || module.tile_aspect_ratio || DEFAULT_ASPECT,
                  })
                )}
              </div>
            `
          )}
        </div>
      `;
    }

    const gridColumns =
      layout === 'auto_fit'
        ? `repeat(auto-fill, minmax(${module.min_tile_width || 160}px, 1fr))`
        : `repeat(${columns}, minmax(0, 1fr))`;

    return html`
      <div
        class="uc-cg-grid"
        style="display:grid;grid-template-columns:${gridColumns};grid-auto-flow:dense;gap:${gap}"
      >
        ${tiles.map(tile => {
          const isSpot = layout === 'spotlight' && tile.id === spotlightId;
          const style = this._tileGridStyle(module, tile, isSpot, columns);
          return this._renderTile(module, hass, config, tile, spotlightId, rt, style);
        })}
      </div>
    `;
  }

  private _tileGridStyle(
    module: CameraGridModule,
    tile: CameraGridTile,
    isSpot: boolean,
    columns: number
  ): { aspect?: number; grid?: string } {
    const ratio = module.tile_aspect_ratio || DEFAULT_ASPECT;
    if (isSpot) {
      const span = Math.min(module.spotlight_span || 2, columns);
      const { col, row } = this._spotlightOrigin(module.spotlight_position, columns, span);
      return { grid: `grid-column:${col} / span ${span};grid-row:${row} / span ${span};` };
    }
    if (module.layout === 'custom') {
      const cs = Math.max(1, tile.col_span || 1);
      const rs = Math.max(1, tile.row_span || 1);
      return rs > 1
        ? { grid: `grid-column:span ${cs};grid-row:span ${rs};` }
        : { grid: `grid-column:span ${cs};grid-row:span ${rs};`, aspect: ratio };
    }
    return { aspect: ratio };
  }

  private _spotlightOrigin(
    position: CameraGridModule['spotlight_position'],
    columns: number,
    span: number
  ): { col: number; row: number } {
    const maxStart = Math.max(1, columns - span + 1);
    switch (position) {
      case 'top-right':
        return { col: maxStart, row: 1 };
      case 'right':
        return { col: maxStart, row: 1 };
      case 'left':
        return { col: 1, row: 1 };
      case 'center':
        return { col: Math.max(1, Math.floor((columns - span) / 2) + 1), row: 1 };
      default:
        return { col: 1, row: 1 };
    }
  }

  private _masonryColumns(
    tiles: CameraGridTile[],
    columns: number,
    fallbackRatio: number
  ): CameraGridTile[][] {
    const cols: CameraGridTile[][] = Array.from({ length: columns }, () => []);
    const heights = Array(columns).fill(0);
    for (const tile of tiles) {
      const i = heights.indexOf(Math.min(...heights));
      cols[i].push(tile);
      heights[i] += 1 / (tile.aspect_ratio || fallbackRatio);
    }
    return cols;
  }

  private _renderTile(
    module: CameraGridModule,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    tile: CameraGridTile,
    spotlightId: string | undefined,
    rt: ModuleRuntime,
    style: { aspect?: number; grid?: string }
  ): TemplateResult {
    const radius = `${module.tile_border_radius ?? 8}px`;
    const motionOn = this._entityOn(hass, tile.motion_entity);
    const highlight = motionOn
      ? `box-shadow: inset 0 0 0 2px ${module.motion_highlight_color || 'var(--accent-color, #ff9800)'};`
      : '';
    const aspect = style.aspect ? `aspect-ratio:${style.aspect};` : '';
    const interactive = tile.type === 'camera' || !!tile.tap_action;
    const tileStyle = `${style.grid || ''}${aspect}border-radius:${radius};${highlight}`;

    return html`
      <div
        class="uc-cg-tile ${interactive ? 'is-interactive' : ''}"
        style="${tileStyle}"
        role="${interactive ? 'button' : 'group'}"
        tabindex="${interactive ? '0' : '-1'}"
        @click=${(e: Event) => this._onTileTap(e, module, tile, hass, config, spotlightId, rt)}
        @keydown=${(e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this._onTileTap(e, module, tile, hass, config, spotlightId, rt);
          }
        }}
        @mousedown=${(e: Event) => this._onPointerDown(e, module, tile, hass, config)}
        @mouseup=${() => this._onPointerUp()}
        @mouseleave=${() => this._onPointerUp()}
        @touchstart=${(e: Event) => this._onPointerDown(e, module, tile, hass, config)}
        @touchend=${() => this._onPointerUp()}
      >
        ${this._renderTileContent(module, hass, tile, spotlightId)}
      </div>
    `;
  }

  private _renderTileContent(
    module: CameraGridModule,
    hass: HomeAssistant,
    tile: CameraGridTile,
    spotlightId: string | undefined
  ): TemplateResult {
    if (tile.type === 'image') return this._renderImageTile(module, hass, tile);
    if (tile.type === 'text') return this._renderTextTile(module, tile);
    if (tile.type === 'clock') return this._renderClockTile(hass, tile);
    if (tile.type === 'empty') return html`<div class="uc-cg-placeholder uc-cg-empty"></div>`;
    return this._renderCameraTile(module, hass, tile, spotlightId);
  }

  private _renderCameraTile(
    module: CameraGridModule,
    hass: HomeAssistant,
    tile: CameraGridTile,
    spotlightId: string | undefined
  ): TemplateResult {
    const lang = hass.locale?.language || 'en';
    const entityId = this.resolveEntity(tile.entity || '', undefined) || tile.entity || '';
    const stateObj = entityId ? hass.states?.[entityId] : undefined;
    const unavailable = !stateObj || stateObj.state === 'unavailable' || stateObj.state === 'unknown';
    const name =
      tile.name?.trim() ||
      stateObj?.attributes?.friendly_name ||
      entityId ||
      localize('editor.camera_grid.tiles.type_camera', lang, 'Camera');
    const viewMode = this._effectiveViewMode(module, tile, spotlightId);
    const fit = this._resolveFit(module.image_fit);
    const key = `${tile.id}|${entityId}|${viewMode}`;

    const overlay = this._nameOverlay(module, name);
    const badges = this._badges(module, hass, tile, unavailable);
    const snapshotTime =
      module.show_snapshot_time && viewMode === 'snapshot'
        ? this._snapshotTimeLabel(module.id, tile.id, hass)
        : nothing;

    if (!entityId) {
      return html`
        <div class="uc-cg-placeholder">
          <ha-icon icon="mdi:camera-plus"></ha-icon>
          <span>${localize('editor.camera_grid.empty', lang, 'Add cameras')}</span>
        </div>
        ${overlay}
      `;
    }

    if (unavailable) {
      const fallback = this._fallbackSrc(module, hass);
      return html`
        <div class="uc-cg-placeholder">
          ${fallback
            ? html`<img class="uc-cg-media" src=${fallback} alt="" style="object-fit:${fit}" />`
            : html`
                <ha-icon icon="mdi:camera-off"></ha-icon>
                <span>${localize('editor.camera.unavailable', lang, 'Camera Unavailable')}</span>
              `}
        </div>
        ${overlay}${badges}
      `;
    }

    return html`
      ${keyed(key, this._renderPlayer(module, hass, tile, entityId, stateObj, viewMode, fit))}
      ${overlay}${badges}${snapshotTime}
    `;
  }

  private _renderPlayer(
    module: CameraGridModule,
    hass: HomeAssistant,
    tile: CameraGridTile,
    entityId: string,
    stateObj: any,
    viewMode: CameraGridViewMode,
    fit: FitMode
  ): TemplateResult {
    const runtimeKey = this._tileKey(module.id, tile.id);
    const playerRef = this._playerRef(runtimeKey);
    const ratio = tile.aspect_ratio || module.tile_aspect_ratio || DEFAULT_ASPECT;

    if (viewMode === 'live') {
      return html`
        <ha-camera-stream
          ${ref(playerRef)}
          class="uc-cg-player"
          style="object-fit:${fit};--video-max-height:100%;"
          .hass=${hass}
          .stateObj=${stateObj}
          .fitMode=${fit}
          .muted=${true}
          .controls=${false}
        ></ha-camera-stream>
      `;
    }

    if (viewMode === 'snapshot') {
      this._ensureSnapshot(module, tile, entityId);
      const src = this._tileRuntime.get(runtimeKey)?.snapshotSrc || '';
      return html`
        <img
          ${ref(playerRef)}
          class="uc-cg-player"
          style="object-fit:${fit}"
          alt=${entityId}
          src=${src}
          @error=${() => this._onSnapshotError(module, tile, entityId)}
        />
      `;
    }

    return html`
      <hui-image
        ${ref(playerRef)}
        class="uc-cg-player"
        .hass=${hass}
        .cameraImage=${entityId}
        .cameraView=${'auto'}
        .fitMode=${fit}
        .aspectRatio=${`${ratio.toFixed(4)}:1`}
      ></hui-image>
    `;
  }

  private _renderImageTile(
    module: CameraGridModule,
    hass: HomeAssistant,
    tile: CameraGridTile
  ): TemplateResult {
    const src = this._imageSrc(hass, tile);
    const fit = tile.image_fit || 'contain';
    const name = tile.name || '';
    if (!src) {
      return html`
        <div class="uc-cg-placeholder">
          <ha-icon icon="mdi:image-outline"></ha-icon>
        </div>
        ${this._nameOverlay(module, name)}
      `;
    }
    return html`
      <img class="uc-cg-media" src=${src} alt=${name} style="object-fit:${fit}" />
      ${this._nameOverlay(module, name)}
    `;
  }

  private _renderTextTile(module: CameraGridModule, tile: CameraGridTile): TemplateResult {
    return html`
      <div class="uc-cg-text">
        <div>${tile.text || tile.name || ''}</div>
      </div>
      ${tile.text ? nothing : this._nameOverlay(module, tile.name || '')}
    `;
  }

  private _renderClockTile(hass: HomeAssistant, tile: CameraGridTile): TemplateResult {
    const lang = hass.locale?.language || 'en';
    const now = new Date();
    const hour12 = (tile.clock_format || '24h') === '12h';
    const time = now.toLocaleTimeString(lang, { hour12, hour: 'numeric', minute: '2-digit' });
    const date = now.toLocaleDateString(lang, { weekday: 'short', month: 'short', day: 'numeric' });
    return html`
      <div class="uc-cg-clock">
        <div class="uc-cg-clock-time">${time}</div>
        ${tile.show_date !== false ? html`<div class="uc-cg-clock-date">${date}</div>` : nothing}
      </div>
    `;
  }

  private _nameOverlay(module: CameraGridModule, name: string): TemplateResult | typeof nothing {
    if (module.show_names === false || !name) return nothing;
    const pos = module.name_position || 'bottom-left';
    const map: Record<string, string> = {
      'top-left': 'top:6px;left:6px;',
      'top-middle': 'top:6px;left:50%;transform:translateX(-50%);',
      'top-right': 'top:6px;right:6px;',
      'bottom-left': 'bottom:6px;left:6px;',
      'bottom-middle': 'bottom:6px;left:50%;transform:translateX(-50%);',
      'bottom-right': 'bottom:6px;right:6px;',
      center: 'top:50%;left:50%;transform:translate(-50%,-50%);',
    };
    return html`<div class="uc-cg-name" style="${map[pos] || map['bottom-left']}">${name}</div>`;
  }

  private _badges(
    module: CameraGridModule,
    hass: HomeAssistant,
    tile: CameraGridTile,
    unavailable: boolean
  ): TemplateResult | typeof nothing {
    if (module.show_status_badges === false) return nothing;
    const motion = this._entityOn(hass, tile.motion_entity);
    const recording = this._entityOn(hass, tile.recording_entity);
    if (!motion && !recording && !unavailable) return nothing;
    return html`
      <div class="uc-cg-badges">
        ${motion ? html`<span class="uc-cg-badge motion" title="Motion"></span>` : nothing}
        ${recording ? html`<span class="uc-cg-badge recording" title="Recording"></span>` : nothing}
        ${unavailable ? html`<span class="uc-cg-badge offline" title="Offline"></span>` : nothing}
      </div>
    `;
  }

  private _snapshotTimeLabel(
    moduleId: string,
    tileId: string,
    hass: HomeAssistant
  ): TemplateResult | typeof nothing {
    const at = this._tileRuntime.get(this._tileKey(moduleId, tileId))?.lastSnapshotAt;
    if (!at) return nothing;
    const lang = hass.locale?.language || 'en';
    const label = new Date(at).toLocaleTimeString(lang, { hour: 'numeric', minute: '2-digit' });
    return html`<div class="uc-cg-time">${label}</div>`;
  }

  private _renderPager(
    module: CameraGridModule,
    tiles: CameraGridTile[],
    rt: ModuleRuntime,
    lang: string
  ): TemplateResult | typeof nothing {
    const per = module.tiles_per_page || 0;
    if (per <= 0 || tiles.length <= per) return nothing;
    const pages = Math.ceil(tiles.length / per);
    const page = Math.min(rt.page, pages - 1);
    const style = module.pagination_style || 'both';
    if (style === 'none') return nothing;
    const showArrows = style === 'arrows' || style === 'both';
    const showDots = style === 'dots' || style === 'both';
    return html`
      <div class="uc-cg-pager">
        ${showArrows
          ? html`
              <button
                type="button"
                aria-label=${localize('editor.camera_grid.pagination.prev', lang, 'Previous page')}
                @click=${() => this._setPage(module.id, (page - 1 + pages) % pages)}
              >
                <ha-icon icon="mdi:chevron-left"></ha-icon>
              </button>
            `
          : nothing}
        ${showDots
          ? Array.from({ length: pages }, (_, i) => html`
              <button
                type="button"
                class="uc-cg-dot ${i === page ? 'active' : ''}"
                aria-label=${localize('editor.camera_grid.pagination.page', lang, 'Page {n}').replace(
                  '{n}',
                  String(i + 1)
                )}
                @click=${() => this._setPage(module.id, i)}
              ></button>
            `)
          : nothing}
        ${showArrows
          ? html`
              <button
                type="button"
                aria-label=${localize('editor.camera_grid.pagination.next', lang, 'Next page')}
                @click=${() => this._setPage(module.id, (page + 1) % pages)}
              >
                <ha-icon icon="mdi:chevron-right"></ha-icon>
              </button>
            `
          : nothing}
      </div>
    `;
  }

  // ── Interaction ─────────────────────────────────────────────────────────────

  private _onTileTap(
    event: Event,
    module: CameraGridModule,
    tile: CameraGridTile,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    spotlightId: string | undefined,
    rt: ModuleRuntime
  ): void {
    if (rt.isHolding) return;
    event.stopPropagation();
    if (tile.type !== 'camera') {
      if (tile.tap_action) {
        void UltraLinkComponent.handleAction(
          tile.tap_action,
          hass,
          event.currentTarget as HTMLElement,
          config,
          tile.entity || tile.image_entity,
          module
        );
      }
      return;
    }

    const tap = module.tile_tap_action || 'spotlight';
    if (tap === 'nothing') return;

    const useSpotlight = module.layout === 'spotlight' && tap === 'spotlight';

    if (useSpotlight) {
      rt.spotlightOverride = tile.id === spotlightId ? module.spotlight_tile_id : tile.id;
      this.triggerPreviewUpdate();
      return;
    }
    if (tap === 'spotlight' || tap === 'fullscreen') {
      this._openFullscreen(module, tile, hass, event);
      return;
    }
    if (tap === 'more-info' && tile.entity) {
      fireEvent(event.target as HTMLElement, 'hass-more-info', { entityId: tile.entity });
    }
  }

  private _onPointerDown(
    event: Event,
    module: CameraGridModule,
    tile: CameraGridTile,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined
  ): void {
    const rt = this._runtimeFor(module.id);
    rt.isHolding = false;
    if (rt.holdTimeout) clearTimeout(rt.holdTimeout);
    rt.holdTimeout = setTimeout(() => {
      rt.isHolding = true;
      this._runHold(event, module, tile, hass, config);
    }, HOLD_MS);
  }

  private _onPointerUp(): void {
    // Hold timer is cleared after click so tap still fires when the press was short.
    // The hold flag is consumed by `_onTileTap`.
    for (const rt of this._moduleRuntime.values()) {
      if (rt.holdTimeout) {
        clearTimeout(rt.holdTimeout);
        rt.holdTimeout = undefined;
      }
      setTimeout(() => {
        rt.isHolding = false;
      }, 0);
    }
  }

  private _runHold(
    event: Event,
    module: CameraGridModule,
    tile: CameraGridTile,
    hass: HomeAssistant,
    _config: UltraCardConfig | undefined
  ): void {
    if (tile.type !== 'camera') return;
    const hold = module.tile_hold_action || 'fullscreen';
    if (hold === 'nothing') return;
    if (hold === 'fullscreen') {
      this._openFullscreen(module, tile, hass, event);
      return;
    }
    if (hold === 'more-info' && tile.entity) {
      fireEvent(event.target as HTMLElement, 'hass-more-info', { entityId: tile.entity });
    }
  }

  private _openFullscreen(
    module: CameraGridModule,
    tile: CameraGridTile,
    hass: HomeAssistant,
    event: Event
  ): void {
    if (!tile.entity) return;
    const state = hass.states?.[tile.entity];
    openCameraFullscreen(hass, {
      entity: tile.entity,
      name: tile.name || state?.attributes?.friendly_name,
      showName: module.show_names !== false,
      showControls: false,
      anchor: (event.currentTarget as HTMLElement) || (event.target as HTMLElement),
    });
  }

  // ── Runtime / timers ────────────────────────────────────────────────────────

  private _runtimeFor(moduleId: string): ModuleRuntime {
    let state = this._moduleRuntime.get(moduleId);
    if (!state) {
      state = { page: 0 };
      this._moduleRuntime.set(moduleId, state);
    }
    return state;
  }

  private _tileKey(moduleId: string, tileId: string): string {
    return `${moduleId}:${tileId}`;
  }

  private _playerRef(key: string): (element: Element | undefined) => void {
    let callback = this._playerRefs.get(key);
    if (!callback) {
      callback = (element?: Element) => {
        const state = this._tileRuntime.get(key) || {};
        state.player = element;
        this._tileRuntime.set(key, state);
        if (element) return;
        setTimeout(() => {
          if (this._tileRuntime.get(key)?.player) return;
          this._clearTileTimers(key);
          this._tileRuntime.delete(key);
          this._playerRefs.delete(key);
        }, 0);
      };
      this._playerRefs.set(key, callback);
    }
    return callback;
  }

  private _wrapperRef(moduleId: string): (element: Element | undefined) => void {
    let callback = this._wrapperRefs.get(moduleId);
    if (!callback) {
      callback = (element?: Element) => {
        const rt = this._runtimeFor(moduleId);
        rt.wrapper = element;
        if (element) return;
        setTimeout(() => {
          if (this._moduleRuntime.get(moduleId)?.wrapper) return;
          this._clearModuleTimers(moduleId);
        }, 0);
      };
      this._wrapperRefs.set(moduleId, callback);
    }
    return callback;
  }

  private _clearTileTimers(key: string): void {
    const state = this._tileRuntime.get(key);
    if (!state) return;
    if (state.snapshotTimer) {
      clearInterval(state.snapshotTimer);
      state.snapshotTimer = undefined;
    }
  }

  private _clearModuleTimers(moduleId: string): void {
    const rt = this._moduleRuntime.get(moduleId);
    if (!rt) return;
    if (rt.cycleTimer) clearInterval(rt.cycleTimer);
    if (rt.pageTimer) clearInterval(rt.pageTimer);
    if (rt.clockTimer) clearInterval(rt.clockTimer);
    if (rt.holdTimeout) clearTimeout(rt.holdTimeout);
    rt.cycleTimer = undefined;
    rt.pageTimer = undefined;
    rt.clockTimer = undefined;
    rt.holdTimeout = undefined;
  }

  private _ensureModuleTimers(module: CameraGridModule, rt: ModuleRuntime): void {
    const cameraTiles = (module.tiles || []).filter(t => t.type === 'camera' && t.entity);
    const motionHeld = !!rt.motionHoldTileId && (rt.motionHoldUntil || 0) > Date.now();
    const shouldCycle =
      module.layout === 'spotlight' &&
      module.spotlight_cycle &&
      cameraTiles.length > 1 &&
      !motionHeld;
    const cycleMs = Math.max(2, module.spotlight_cycle_interval || 8) * 1000;

    if (!shouldCycle && rt.cycleTimer) {
      clearInterval(rt.cycleTimer);
      rt.cycleTimer = undefined;
      rt.cycleIntervalMs = undefined;
    } else if (shouldCycle && (!rt.cycleTimer || rt.cycleIntervalMs !== cycleMs)) {
      if (rt.cycleTimer) clearInterval(rt.cycleTimer);
      rt.cycleIntervalMs = cycleMs;
      rt.cycleTimer = setInterval(() => {
        if (typeof document !== 'undefined' && document.hidden) return;
        const live = this._moduleRuntime.get(module.id);
        if (!live) return;
        if (live.motionHoldTileId && (live.motionHoldUntil || 0) > Date.now()) return;
        const cams = (module.tiles || []).filter(t => t.type === 'camera' && t.entity);
        if (cams.length < 2) return;
        const current = live.spotlightOverride || module.spotlight_tile_id || cams[0]?.id;
        const idx = Math.max(0, cams.findIndex(t => t.id === current));
        live.spotlightOverride = cams[(idx + 1) % cams.length].id;
        this.triggerPreviewUpdate();
      }, cycleMs);
    }

    const per = module.tiles_per_page || 0;
    const pages = per > 0 ? Math.ceil((module.tiles || []).length / per) : 1;
    const shouldPage = module.auto_page && pages > 1;
    const pageMs = Math.max(2, module.auto_page_interval || 8) * 1000;

    if (!shouldPage && rt.pageTimer) {
      clearInterval(rt.pageTimer);
      rt.pageTimer = undefined;
      rt.pageIntervalMs = undefined;
    } else if (
      shouldPage &&
      (!rt.pageTimer || rt.pageIntervalMs !== pageMs || rt.pageCount !== pages)
    ) {
      if (rt.pageTimer) clearInterval(rt.pageTimer);
      rt.pageIntervalMs = pageMs;
      rt.pageCount = pages;
      rt.pageTimer = setInterval(() => {
        if (typeof document !== 'undefined' && document.hidden) return;
        const live = this._moduleRuntime.get(module.id);
        if (!live) return;
        live.page = (live.page + 1) % pages;
        this.triggerPreviewUpdate();
      }, pageMs);
    }

    const shouldClock = (module.tiles || []).some(t => t.type === 'clock');
    if (!shouldClock && rt.clockTimer) {
      clearInterval(rt.clockTimer);
      rt.clockTimer = undefined;
    } else if (shouldClock && !rt.clockTimer) {
      rt.clockTimer = setInterval(() => {
        if (typeof document !== 'undefined' && document.hidden) return;
        this.triggerPreviewUpdate();
      }, 1000);
    }
  }

  private _updateMotionHold(
    module: CameraGridModule,
    hass: HomeAssistant,
    tiles: CameraGridTile[],
    rt: ModuleRuntime
  ): void {
    if (module.motion_spotlight === false) {
      rt.motionHoldTileId = undefined;
      rt.motionHoldUntil = undefined;
      return;
    }
    const active = tiles.find(
      t => t.type === 'camera' && t.motion_entity && this._entityOn(hass, t.motion_entity)
    );
    const holdMs = Math.max(3, module.motion_hold_seconds || 15) * 1000;
    if (active) {
      if (rt.motionHoldTileId !== active.id) {
        rt.motionHoldTileId = active.id;
        rt.motionHoldUntil = Date.now() + holdMs;
      } else if ((rt.motionHoldUntil || 0) < Date.now()) {
        rt.motionHoldUntil = Date.now() + holdMs;
      }
      return;
    }
    if ((rt.motionHoldUntil || 0) < Date.now()) {
      rt.motionHoldTileId = undefined;
      rt.motionHoldUntil = undefined;
    }
  }

  private _effectiveSpotlightId(
    module: CameraGridModule,
    tiles: CameraGridTile[],
    rt: ModuleRuntime
  ): string | undefined {
    if (rt.motionHoldTileId && tiles.some(t => t.id === rt.motionHoldTileId)) {
      return rt.motionHoldTileId;
    }
    if (rt.spotlightOverride && tiles.some(t => t.id === rt.spotlightOverride)) {
      return rt.spotlightOverride;
    }
    if (module.spotlight_tile_id && tiles.some(t => t.id === module.spotlight_tile_id)) {
      return module.spotlight_tile_id;
    }
    return tiles.find(t => t.type === 'camera')?.id || tiles[0]?.id;
  }

  private _pagedTiles(
    module: CameraGridModule,
    tiles: CameraGridTile[],
    rt: ModuleRuntime
  ): CameraGridTile[] {
    const per = module.tiles_per_page || 0;
    if (per <= 0 || tiles.length <= per) return tiles;
    const pages = Math.ceil(tiles.length / per);
    if (rt.page >= pages) rt.page = 0;
    const start = rt.page * per;
    return tiles.slice(start, start + per);
  }

  private _setPage(moduleId: string, page: number): void {
    const rt = this._runtimeFor(moduleId);
    rt.page = page;
    this.triggerPreviewUpdate();
  }

  private _effectiveViewMode(
    module: CameraGridModule,
    tile: CameraGridTile,
    spotlightId: string | undefined
  ): CameraGridViewMode {
    if (tile.view_mode && tile.view_mode !== 'inherit') return tile.view_mode;
    const globalMode = module.view_mode || 'auto';
    if (!module.adaptive_streaming) return globalMode;
    if (globalMode === 'snapshot') return 'snapshot';

    const isFeatured =
      tile.id === spotlightId ||
      (module.layout === 'custom' && ((tile.col_span || 1) >= 2 || (tile.row_span || 1) >= 2));

    if (module.layout === 'spotlight') return isFeatured ? 'live' : 'snapshot';
    if (module.layout === 'custom') return isFeatured ? 'live' : 'snapshot';
    return 'snapshot';
  }

  private _resolveFit(fit: CameraGridModule['image_fit']): FitMode {
    if (fit === 'contain' || fit === 'fill') return fit;
    return 'cover';
  }

  private _entityOn(hass: HomeAssistant, entityId?: string): boolean {
    if (!entityId) return false;
    const state = hass.states?.[entityId]?.state;
    return state === 'on' || state === 'true' || state === 'recording';
  }

  private _imageSrc(hass: HomeAssistant, tile: CameraGridTile): string {
    if (tile.image_type === 'entity' && tile.image_entity) {
      const pic = hass.states?.[tile.image_entity]?.attributes?.entity_picture;
      return pic ? getImageUrl(hass, pic) : '';
    }
    return tile.image_url ? getImageUrl(hass, tile.image_url) : '';
  }

  private _fallbackSrc(module: CameraGridModule, hass: HomeAssistant): string {
    return module.fallback_image ? getImageUrl(hass, module.fallback_image) : '';
  }

  private _aspectPreset(ratio: number): string {
    if (Math.abs(ratio - 16 / 9) < 0.05) return '1.7778';
    if (Math.abs(ratio - 4 / 3) < 0.05) return '1.3333';
    if (Math.abs(ratio - 1) < 0.05) return '1';
    return 'custom';
  }

  private _ensureSnapshot(
    module: CameraGridModule,
    tile: CameraGridTile,
    entityId: string
  ): void {
    const key = this._tileKey(module.id, tile.id);
    let state = this._tileRuntime.get(key);
    if (!state) {
      state = {};
      this._tileRuntime.set(key, state);
    }
    const intervalMs = Math.min(300, Math.max(1, module.refresh_interval || 10)) * 1000;

    if (state.snapshotEntity !== entityId) {
      state.snapshotEntity = entityId;
      state.snapshotSrc = undefined;
      if (state.snapshotTimer) {
        clearInterval(state.snapshotTimer);
        state.snapshotTimer = undefined;
      }
    }

    if (!state.snapshotSrc) {
      this._refreshSnapshot(key, entityId, false);
    }

    if (state.snapshotTimer && state.snapshotIntervalMs !== intervalMs) {
      clearInterval(state.snapshotTimer);
      state.snapshotTimer = undefined;
    }

    if (!state.snapshotTimer) {
      state.snapshotIntervalMs = intervalMs;
      state.snapshotTimer = setInterval(() => this._refreshSnapshot(key, entityId, true), intervalMs);
    }

    this._ensureVisibilityListener();
  }

  private _refreshSnapshot(key: string, entityId: string, applyToElement: boolean): void {
    const state = this._tileRuntime.get(key);
    const hass = this._hass;
    if (!state || !hass) return;
    if (applyToElement && typeof document !== 'undefined' && document.hidden) return;

    const stateObj = hass.states?.[entityId] as any;
    const picture: string | undefined = stateObj?.attributes?.entity_picture;
    if (!picture) {
      void this._resolveSignedSnapshot(key, entityId);
      return;
    }

    const base =
      typeof (hass as any).hassUrl === 'function' ? (hass as any).hassUrl(picture) : picture;
    const src = `${base}${base.includes('?') ? '&' : '?'}_uc=${Date.now()}`;
    state.snapshotSrc = src;
    state.lastSnapshotAt = Date.now();

    const element = state.player as HTMLImageElement | undefined;
    if (applyToElement) {
      if (element instanceof HTMLImageElement) {
        element.src = src;
      } else {
        this.triggerPreviewUpdate();
      }
    }
  }

  private async _resolveSignedSnapshot(key: string, entityId: string): Promise<void> {
    const state = this._tileRuntime.get(key);
    const hass = this._hass;
    if (!state || !hass || state.snapshotInFlight) return;

    state.snapshotInFlight = true;
    try {
      const signed = await (hass as any).callWS({
        type: 'auth/sign_path',
        path: `/api/camera_proxy/${entityId}`,
      });
      if (!signed?.path) return;
      const base =
        typeof (hass as any).hassUrl === 'function'
          ? (hass as any).hassUrl(signed.path)
          : signed.path;
      state.snapshotSrc = `${base}${base.includes('?') ? '&' : '?'}_uc=${Date.now()}`;
      state.lastSnapshotAt = Date.now();
      const element = state.player as HTMLImageElement | undefined;
      if (element instanceof HTMLImageElement) {
        element.src = state.snapshotSrc;
      } else {
        this.triggerPreviewUpdate();
      }
    } catch {
      // Leave the previous frame; the next tick retries.
    } finally {
      state.snapshotInFlight = false;
    }
  }

  private _onSnapshotError(
    module: CameraGridModule,
    tile: CameraGridTile,
    entityId: string
  ): void {
    const state = this._tileRuntime.get(this._tileKey(module.id, tile.id));
    if (module.fallback_image && this._hass) {
      const fallback = this._fallbackSrc(module, this._hass);
      const element = state?.player as HTMLImageElement | undefined;
      if (fallback && element instanceof HTMLImageElement && element.src !== fallback) {
        element.src = fallback;
      }
      return;
    }
    void this._resolveSignedSnapshot(this._tileKey(module.id, tile.id), entityId);
  }

  private _ensureVisibilityListener(): void {
    if (this._visibilityListener || typeof document === 'undefined') return;
    this._visibilityListener = () => {
      if (document.hidden) return;
      this._tileRuntime.forEach((state, key) => {
        if (state.snapshotTimer && state.snapshotEntity) {
          this._refreshSnapshot(key, state.snapshotEntity, true);
        }
      });
    };
    document.addEventListener('visibilitychange', this._visibilityListener);
  }
}
