import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import {
  CardModule,
  NavigationModule,
  NavRoute,
  NavStackItem,
  NavActionConfig,
  ModuleActionConfig,
  UltraCardConfig,
  PopupModule,
} from '../types';
import { UcFormUtils } from '../utils/uc-form-utils';
import { UltraLinkComponent } from '../components/ultra-link';
import { localize } from '../localize/localize';
import { ucNavigationService } from '../services/uc-navigation-service';
import '../components/ultra-color-picker';
import '../components/navigation-picker';
import '../entity-picker';

// Navbar style presets (matching UC visual design)
export type NavbarStylePreset =
  | 'uc_modern'
  | 'uc_minimal'
  | 'uc_ios_glass'
  | 'uc_material'
  | 'uc_floating'
  | 'uc_docked'
  | 'uc_neumorphic'
  | 'uc_gradient'
  | 'uc_sidebar'
  | 'uc_compact';

interface NavbarStyleConfig {
  id: NavbarStylePreset;
  name: string;
  description: string;
}

const NAVBAR_STYLE_PRESETS: NavbarStyleConfig[] = [
  {
    id: 'uc_modern',
    name: 'UC Modern',
    description: 'Clean modern style with rounded buttons and subtle shadows',
  },
  {
    id: 'uc_minimal',
    name: 'UC Minimal',
    description: 'Minimal flat design with sharp edges',
  },
  {
    id: 'uc_ios_glass',
    name: 'iOS Glass',
    description: 'iOS-style glassmorphism with heavy blur and vibrancy',
  },
  {
    id: 'uc_material',
    name: 'Material Design',
    description: 'Material Design 3 elevated surface with tonal colors',
  },
  {
    id: 'uc_floating',
    name: 'Floating Pill',
    description: 'Floating pill design with maximum border radius',
  },
  {
    id: 'uc_docked',
    name: 'Docked Bar',
    description: 'Edge-to-edge bar without border radius',
  },
  {
    id: 'uc_neumorphic',
    name: 'Neumorphic',
    description: 'Soft UI with light and dark shadows',
  },
  {
    id: 'uc_gradient',
    name: 'Gradient',
    description: 'Colorful gradient background',
  },
  {
    id: 'uc_sidebar',
    name: 'Sidebar',
    description: 'Vertical sidebar optimized for left/right positions',
  },
  {
    id: 'uc_compact',
    name: 'Compact',
    description: 'Ultra-compact with smaller icons and tight spacing',
  },
];

export class UltraNavigationModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'navigation',
    title: 'Navigation',
    description: 'Add a global navigation bar with routes, popups, and media player controls',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:compass-outline',
    category: 'layout',
    tags: ['navigation', 'navbar', 'menu', 'routes', 'layout'],
  };

  private _expandedRoutes: Set<string> = new Set();

  createDefault(id?: string, hass?: HomeAssistant): NavigationModule {
    return {
      id: id || this.generateId('navigation'),
      type: 'navigation',
      nav_routes: [
        {
          id: this.generateId('nav-route'),
          icon: 'mdi:home',
          label: 'Home',
          url: '/lovelace/home',
        },
      ],
      nav_scope: 'all_views',
      nav_style: 'uc_modern',
      nav_desktop: {
        mode: 'floating',
        show_labels: true,
        min_width: 768,
        position: 'bottom',
      },
      nav_mobile: {
        mode: 'docked',
        show_labels: false,
        position: 'bottom',
      },
      nav_layout: {
        auto_padding: {
          enabled: true,
          desktop_px: 100,
          mobile_px: 80,
          media_player_px: 100,
        },
      },
      nav_haptic: {
        url: false,
        tap_action: true,
        hold_action: true,
        double_tap_action: true,
      },
      nav_media_player: {
        enabled: false,
        entity: '',
        display_mode: 'icon_click',
        album_cover_background: false,
        icon_position: 'end',
        widget_position: 'above',
        desktop_position: 'bottom-center',
      },
      nav_styles: '',
      nav_template: '',
      display_mode: 'always',
      display_conditions: [],
    };
  }

  // Track which special items are expanded
  private _expandedSpecialItems: Set<string> = new Set();

  // Build a unified list of all navbar items (routes + stacks + children + special items) for ordering
  private buildUnifiedNavItems(navModule: NavigationModule): Array<{
    type: 'route' | 'stack' | 'stack_child' | 'media_player';
    id: string;
    data?: NavRoute | NavStackItem;
    position: number;
    parentStackId?: string;
  }> {
    const topItems: Array<{
      type: 'route' | 'stack' | 'media_player';
      id: string;
      data?: NavRoute | NavStackItem;
      position: number;
    }> = [];

    // Add routes with their original positions
    (navModule.nav_routes || []).forEach((route, idx) => {
      topItems.push({ type: 'route', id: route.id, data: route, position: idx });
    });

    // Add stacks (positioned after routes by default)
    (navModule.nav_stacks || []).forEach((stack, idx) => {
      topItems.push({
        type: 'stack',
        id: stack.id,
        data: stack,
        position: (navModule.nav_routes || []).length + idx,
      });
    });

    // Add media player icon if enabled
    if (navModule.nav_media_player?.enabled) {
      const mpPos = navModule.nav_media_player?.icon_position;
      let pos = topItems.length; // default to end
      if (mpPos === 'start') pos = 0;
      else if (mpPos === 'end') pos = topItems.length;
      else if (typeof mpPos === 'number') pos = mpPos;
      topItems.push({ type: 'media_player', id: '__media_player__', position: pos });
    }

    // Sort top-level items by position
    topItems.sort((a, b) => a.position - b.position);

    // Build result with stack children inserted after their parent stacks
    const result: Array<{
      type: 'route' | 'stack' | 'stack_child' | 'media_player';
      id: string;
      data?: NavRoute | NavStackItem;
      position: number;
      parentStackId?: string;
    }> = [];

    topItems.forEach(item => {
      result.push(item);
      if (item.type === 'stack' && item.data) {
        const stack = item.data as NavStackItem;
        (stack.children || []).forEach(child => {
          result.push({
            type: 'stack_child',
            id: child.id,
            data: child,
            position: -1, // not used for children
            parentStackId: item.id,
          });
        });
      }
    });

    return result;
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const navModule = this.resolveNavigationConfig(module as NavigationModule, config);
    const routes = navModule.nav_routes || [];
    const lang = hass?.locale?.language || 'en';

    const styleOptions = NAVBAR_STYLE_PRESETS.map(style => ({
      value: style.id,
      label: `${style.name} - ${style.description}`,
    }));

    // Build unified item list for display
    const unifiedItems = this.buildUnifiedNavItems(navModule);

    return html`
      ${this.injectUcFormStyles()}
      <style>
        ${this.getEditorStyles()}
      </style>

      <div class="module-settings">
        <!-- Edit Mode Info Banner -->
        <div class="info-box" style="margin-bottom: 16px;">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <span
            >Changes preview live in the navbar below. Close this editor to interact with the
            navbar.</span
          >
        </div>

        <!-- Paths Section -->
        <div class="settings-section">
          <div class="section-title">NAVIGATION ITEMS</div>
          <div class="section-description">
            Configure and reorder items that appear in your navbar. Drag to reorder. Drag paths onto
            a stack to add them as children.
          </div>

          <div class="routes-list" id="nav-items-list">
            ${unifiedItems.map((item, visualIndex) => {
              if (item.type === 'route' && item.data) {
                const routeIndex = routes.findIndex(r => r.id === item.id);
                return this.renderRouteRow(
                  item.data as NavRoute,
                  routeIndex,
                  routes,
                  hass,
                  navModule,
                  updateModule,
                  visualIndex,
                  unifiedItems.length,
                  undefined,
                  config
                );
              } else if (item.type === 'stack_child' && item.data && item.parentStackId) {
                return this.renderRouteRow(
                  item.data as NavRoute,
                  -1,
                  [],
                  hass,
                  navModule,
                  updateModule,
                  visualIndex,
                  unifiedItems.length,
                  item.parentStackId,
                  config
                );
              } else if (item.type === 'stack' && item.data) {
                const stacks = navModule.nav_stacks || [];
                const stackIndex = stacks.findIndex(s => s.id === item.id);
                return this.renderStackRow(
                  item.data as NavStackItem,
                  stackIndex,
                  stacks,
                  hass,
                  navModule,
                  updateModule,
                  visualIndex,
                  unifiedItems.length
                );
              } else if (item.type === 'media_player') {
                const hasEntity =
                  navModule.nav_media_player?.entity && navModule.nav_media_player?.entity !== '';
                return this.renderSpecialItemRow(
                  'media_player',
                  'mdi:music',
                  'Media Player',
                  hasEntity
                    ? navModule.nav_media_player?.entity
                    : '⚠️ Click to select entity (required)',
                  visualIndex,
                  unifiedItems.length,
                  navModule,
                  hass,
                  updateModule,
                  config
                );
              }
              return '';
            })}
          </div>

          <div style="display: flex; gap: 12px;">
            <button
              class="add-entity-btn"
              style="flex: 1;"
              @click=${() => {
                const newRoute = this.createDefaultRoute();
                this._expandedRoutes.add(newRoute.id);
                updateModule({ nav_routes: [...routes, newRoute] });
              }}
            >
              <ha-icon icon="mdi:plus"></ha-icon>
              Add Path
            </button>
            <button
              class="add-entity-btn"
              style="flex: 1;"
              @click=${() => {
                const stacks = navModule.nav_stacks || [];
                const newStack = this.createDefaultStack();
                this._expandedRoutes.add(newStack.id);
                updateModule({ nav_stacks: [...stacks, newStack] });
              }}
            >
              <ha-icon icon="mdi:view-sequential"></ha-icon>
              Add Stack
            </button>
          </div>
        </div>

        <!-- Special Items Section -->
        <div class="settings-section">
          <div class="section-title">SPECIAL ITEMS</div>
          <div class="section-description">
            Enable special navbar items. When enabled, they appear in the items list above for
            reordering.
          </div>

          <div class="field-container">
            <div
              class="field-row"
              style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0;"
            >
              <div style="display: flex; align-items: center; gap: 12px;">
                <ha-icon icon="mdi:music" style="color: var(--primary-color);"></ha-icon>
                <div>
                  <div class="field-title" style="margin: 0;">Media Player Icon</div>
                  <div class="field-description" style="margin: 0;">
                    Show a media player icon in the navbar
                  </div>
                </div>
              </div>
              <ha-switch
                .checked=${navModule.nav_media_player?.enabled === true}
                @change=${(e: Event) => {
                  updateModule({
                    nav_media_player: {
                      ...navModule.nav_media_player,
                      enabled: (e.target as HTMLInputElement).checked,
                    },
                  });
                }}
              ></ha-switch>
            </div>
          </div>
        </div>

        <!-- Style Section -->
        <div class="settings-section">
          <div class="section-title">NAVBAR STYLE</div>

          ${UcFormUtils.renderFieldSection(
            'Visual Preset',
            'Choose a visual style preset for your navbar.',
            hass,
            { nav_style: navModule.nav_style || 'uc_modern' },
            [UcFormUtils.select('nav_style', styleOptions)],
            (e: CustomEvent) => {
              updateModule({ nav_style: e.detail.value.nav_style });
            }
          )}

          <div class="color-field" style="margin-top: 16px;">
            <div class="field-title">Dock Color</div>
            <div class="field-description">
              Custom accent color for the dock background. For glass styles this tints the glass.
            </div>
            <ultra-color-picker
              .hass=${hass}
              .value=${navModule.nav_dock_color || ''}
              @value-changed=${(e: CustomEvent) => updateModule({ nav_dock_color: e.detail.value })}
            ></ultra-color-picker>
          </div>

          <div class="color-field" style="margin-top: 12px;">
            <div class="field-title">Icon Color</div>
            <div class="field-description">
              Custom color for navbar icons. Overrides the default icon color from the style preset.
            </div>
            <ultra-color-picker
              .hass=${hass}
              .value=${navModule.nav_icon_color || ''}
              @value-changed=${(e: CustomEvent) => updateModule({ nav_icon_color: e.detail.value })}
            ></ultra-color-picker>
          </div>
        </div>

        <!-- Visibility Scope Section -->
        <div class="settings-section">
          <div class="section-title">VISIBILITY</div>

          ${UcFormUtils.renderFieldSection(
            'Show Navigation On',
            'Control where this navbar appears.',
            hass,
            { nav_scope: navModule.nav_scope || 'all_views' },
            [
              UcFormUtils.select('nav_scope', [
                { value: 'all_views', label: 'All views (global)' },
                { value: 'current_view', label: 'Current view only' },
              ]),
            ],
            (e: CustomEvent) => {
              updateModule({ nav_scope: e.detail.value.nav_scope });
            }
          )}

          <div class="info-box" style="margin-top: 8px;">
            <ha-icon icon="mdi:information"></ha-icon>
            <span>
              <strong>All views:</strong> Navbar appears on every view in your dashboard.<br />
              <strong>Current view:</strong> Navbar only appears on the view where this card is
              placed.
            </span>
          </div>

          <div
            class="info-box"
            style="margin-top: 8px; border-left-color: var(--warning-color); background: rgba(var(--rgb-warning-color), 0.1);"
          >
            <ha-icon icon="mdi:alert" style="color: var(--warning-color);"></ha-icon>
            <span>
              <strong>Note:</strong> Only one global navbar can be active at a time. If you have
              multiple navbars set to "All views", only the first registered one will be displayed.
              Use "Current view only" for navbars on specific pages.
            </span>
          </div>
        </div>

        <!-- Desktop Configuration Section -->
        ${this.renderSettingsSection(
          'DESKTOP MODE',
          'Configure navbar appearance and behavior on desktop devices.',
          [
            {
              title: 'Mode',
              description: 'Choose floating (centered with margins) or docked (edge-to-edge).',
              hass,
              data: { mode: navModule.nav_desktop?.mode || 'floating' },
              schema: [
                UcFormUtils.select('mode', [
                  { value: 'floating', label: 'Floating' },
                  { value: 'docked', label: 'Docked' },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                updateModule({
                  nav_desktop: { ...navModule.nav_desktop, mode: e.detail.value.mode },
                });
              },
            },
            {
              title: 'Position',
              description: 'Where the navbar appears on desktop.',
              hass,
              data: { position: navModule.nav_desktop?.position || 'bottom' },
              schema: [
                UcFormUtils.select('position', [
                  { value: 'bottom', label: 'Bottom' },
                  { value: 'top', label: 'Top' },
                  { value: 'left', label: 'Left' },
                  { value: 'right', label: 'Right' },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                updateModule({
                  nav_desktop: { ...navModule.nav_desktop, position: e.detail.value.position },
                });
              },
            },
            {
              title: 'Show Labels',
              description: 'Control label visibility on desktop.',
              hass,
              data: {
                show_labels:
                  typeof navModule.nav_desktop?.show_labels === 'boolean'
                    ? navModule.nav_desktop.show_labels
                      ? 'true'
                      : 'false'
                    : (navModule.nav_desktop?.show_labels ?? 'false'),
              },
              schema: [
                UcFormUtils.select('show_labels', [
                  { value: 'false', label: 'Hidden' },
                  { value: 'true', label: 'Icons & Labels' },
                  { value: 'text_only', label: 'Text only (no icons)' },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                const value = e.detail.value.show_labels;
                const convertedValue = value === 'true' ? true : value === 'false' ? false : value;
                updateModule({
                  nav_desktop: {
                    ...navModule.nav_desktop,
                    show_labels: convertedValue,
                  },
                });
              },
            },
            {
              title: 'Item Alignment',
              description: 'How items are distributed within the dock.',
              hass,
              data: { alignment: navModule.nav_desktop?.alignment || 'center' },
              schema: [
                UcFormUtils.select('alignment', [
                  { value: 'center', label: 'Center' },
                  { value: 'start', label: 'Start' },
                  { value: 'end', label: 'End' },
                  { value: 'space-between', label: 'Space Between' },
                  { value: 'space-around', label: 'Space Around' },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                updateModule({
                  nav_desktop: {
                    ...navModule.nav_desktop,
                    alignment: e.detail.value.alignment,
                  },
                });
              },
            },
            {
              title: 'Min Width',
              description: 'Viewport width (px) that switches to desktop mode.',
              hass,
              data: { min_width: navModule.nav_desktop?.min_width ?? 768 },
              schema: [UcFormUtils.number('min_width', 320, 2560)],
              onChange: (e: CustomEvent) => {
                updateModule({
                  nav_desktop: {
                    ...navModule.nav_desktop,
                    min_width: Number(e.detail.value.min_width),
                  },
                });
              },
            },
          ]
        )}

        <!-- Desktop Offset Slider (only for floating mode) -->
        ${navModule.nav_desktop?.mode === 'floating'
          ? html`
              <div class="field-group" style="margin: 16px 0; padding: 0 16px;">
                <div>
                  <div
                    class="field-title"
                    style="font-size: 14px; font-weight: 600; margin-bottom: 4px;"
                  >
                    Desktop Offset
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color);"
                  >
                    Distance from screen edge in floating mode (px).
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
                  <ha-slider
                    style="flex: 1;"
                    .min=${0}
                    .max=${100}
                    .step=${1}
                    .value=${navModule.nav_desktop?.offset ?? 16}
                    @change=${(e: Event) =>
                      updateModule({
                        nav_desktop: {
                          ...navModule.nav_desktop,
                          offset: parseInt((e.target as any).value, 10),
                        },
                      })}
                  ></ha-slider>
                  <span style="min-width: 40px; text-align: center; font-weight: 600;">
                    ${navModule.nav_desktop?.offset ?? 16}px
                  </span>
                </div>
              </div>
            `
          : ''}

        <!-- Mobile Configuration Section -->
        ${this.renderSettingsSection(
          'MOBILE MODE',
          'Configure navbar appearance and behavior on mobile devices.',
          [
            {
              title: 'Mode',
              description: 'Choose docked (default) or floating (desktop-like).',
              hass,
              data: { mode: navModule.nav_mobile?.mode || 'docked' },
              schema: [
                UcFormUtils.select('mode', [
                  { value: 'docked', label: 'Docked' },
                  { value: 'floating', label: 'Floating' },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                updateModule({
                  nav_mobile: { ...navModule.nav_mobile, mode: e.detail.value.mode },
                });
              },
            },
            {
              title: 'Position',
              description: 'Where the navbar appears on mobile.',
              hass,
              data: { position: navModule.nav_mobile?.position || 'bottom' },
              schema: [
                UcFormUtils.select('position', [
                  { value: 'bottom', label: 'Bottom' },
                  { value: 'top', label: 'Top' },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                updateModule({
                  nav_mobile: { ...navModule.nav_mobile, position: e.detail.value.position },
                });
              },
            },
            {
              title: 'Show Labels',
              description: 'Control label visibility on mobile.',
              hass,
              data: {
                show_labels:
                  typeof navModule.nav_mobile?.show_labels === 'boolean'
                    ? navModule.nav_mobile.show_labels
                      ? 'true'
                      : 'false'
                    : (navModule.nav_mobile?.show_labels ?? 'false'),
              },
              schema: [
                UcFormUtils.select('show_labels', [
                  { value: 'false', label: 'Hidden' },
                  { value: 'true', label: 'Icons & Labels' },
                  { value: 'text_only', label: 'Text only (no icons)' },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                const value = e.detail.value.show_labels;
                updateModule({
                  nav_mobile: {
                    ...navModule.nav_mobile,
                    show_labels: value === 'true' ? true : value === 'false' ? false : value,
                  },
                });
              },
            },
            {
              title: 'Item Alignment',
              description: 'How items are distributed within the dock.',
              hass,
              data: { alignment: navModule.nav_mobile?.alignment || 'center' },
              schema: [
                UcFormUtils.select('alignment', [
                  { value: 'center', label: 'Center' },
                  { value: 'start', label: 'Start' },
                  { value: 'end', label: 'End' },
                  { value: 'space-between', label: 'Space Between' },
                  { value: 'space-around', label: 'Space Around' },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                updateModule({
                  nav_mobile: {
                    ...navModule.nav_mobile,
                    alignment: e.detail.value.alignment,
                  },
                });
              },
            },
          ]
        )}

        <!-- Mobile Offset Slider (only for floating mode) -->
        ${navModule.nav_mobile?.mode === 'floating'
          ? html`
              <div class="field-group" style="margin: 16px 0; padding: 0 16px;">
                <div>
                  <div
                    class="field-title"
                    style="font-size: 14px; font-weight: 600; margin-bottom: 4px;"
                  >
                    Mobile Offset
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color);"
                  >
                    Distance from screen edge in floating mode (px).
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
                  <ha-slider
                    style="flex: 1;"
                    .min=${0}
                    .max=${100}
                    .step=${1}
                    .value=${navModule.nav_mobile?.offset ?? 16}
                    @change=${(e: Event) =>
                      updateModule({
                        nav_mobile: {
                          ...navModule.nav_mobile,
                          offset: parseInt((e.target as any).value, 10),
                        },
                      })}
                  ></ha-slider>
                  <span style="min-width: 40px; text-align: center; font-weight: 600;">
                    ${navModule.nav_mobile?.offset ?? 16}px
                  </span>
                </div>
              </div>
            `
          : ''}

        <!-- Layout & Padding Section -->
        ${this.renderSettingsSection('LAYOUT & PADDING', 'Configure spacing and layout behavior.', [
          {
            title: 'Auto Padding',
            description: 'Automatically pad the dashboard to prevent content overlap.',
            hass,
            data: { enabled: navModule.nav_layout?.auto_padding?.enabled ?? true },
            schema: [UcFormUtils.boolean('enabled')],
            onChange: (e: CustomEvent) => {
              updateModule({
                nav_layout: {
                  ...navModule.nav_layout,
                  auto_padding: {
                    ...(navModule.nav_layout?.auto_padding || {}),
                    enabled: e.detail.value.enabled,
                  },
                },
              });
            },
          },
          {
            title: 'Desktop Padding (px)',
            description: 'Padding applied when navbar is visible on desktop.',
            hass,
            data: { desktop_px: navModule.nav_layout?.auto_padding?.desktop_px ?? 100 },
            schema: [UcFormUtils.number('desktop_px', 0, 400)],
            onChange: (e: CustomEvent) => {
              updateModule({
                nav_layout: {
                  ...navModule.nav_layout,
                  auto_padding: {
                    ...(navModule.nav_layout?.auto_padding || {}),
                    desktop_px: Number(e.detail.value.desktop_px),
                  },
                },
              });
            },
          },
          {
            title: 'Mobile Padding (px)',
            description: 'Padding applied when navbar is visible on mobile.',
            hass,
            data: { mobile_px: navModule.nav_layout?.auto_padding?.mobile_px ?? 80 },
            schema: [UcFormUtils.number('mobile_px', 0, 400)],
            onChange: (e: CustomEvent) => {
              updateModule({
                nav_layout: {
                  ...navModule.nav_layout,
                  auto_padding: {
                    ...(navModule.nav_layout?.auto_padding || {}),
                    mobile_px: Number(e.detail.value.mobile_px),
                  },
                },
              });
            },
          },
          {
            title: 'Media Player Padding (px)',
            description: 'Extra padding when media player widget is visible.',
            hass,
            data: { media_player_px: navModule.nav_layout?.auto_padding?.media_player_px ?? 100 },
            schema: [UcFormUtils.number('media_player_px', 0, 400)],
            onChange: (e: CustomEvent) => {
              updateModule({
                nav_layout: {
                  ...navModule.nav_layout,
                  auto_padding: {
                    ...(navModule.nav_layout?.auto_padding || {}),
                    media_player_px: Number(e.detail.value.media_player_px),
                  },
                },
              });
            },
          },
        ])}

        <!-- Auto-Hide Section -->
        <div class="settings-section">
          <div class="section-title">AUTO-HIDE</div>
          <div class="section-description">
            macOS-style dock auto-hide. The navbar slides off-screen after a period of inactivity
            and reappears when the cursor reaches the screen edge. Off by default.
          </div>

          ${UcFormUtils.renderFieldSection(
            'Enable Auto-Hide',
            'Hide the navbar when not in use.',
            hass,
            { enabled: navModule.nav_autohide?.enabled ?? false },
            [UcFormUtils.boolean('enabled')],
            (e: CustomEvent) => {
              updateModule({
                nav_autohide: {
                  ...(navModule.nav_autohide || {}),
                  enabled: e.detail.value.enabled,
                },
              });
            }
          )}
          ${navModule.nav_autohide?.enabled
            ? html`
                <div class="field-group" style="margin: 16px 0; padding: 0 16px;">
                  <div>
                    <div
                      class="field-title"
                      style="font-size: 14px; font-weight: 600; margin-bottom: 4px;"
                    >
                      Hide Delay
                    </div>
                    <div
                      class="field-description"
                      style="font-size: 13px; color: var(--secondary-text-color);"
                    >
                      Seconds of inactivity before the navbar hides.
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
                    <ha-slider
                      style="flex: 1;"
                      .min=${1}
                      .max=${15}
                      .step=${0.5}
                      .value=${navModule.nav_autohide?.delay ?? 3}
                      @change=${(e: Event) =>
                        updateModule({
                          nav_autohide: {
                            ...(navModule.nav_autohide || {}),
                            delay: parseFloat((e.target as any).value),
                          },
                        })}
                    ></ha-slider>
                    <span style="min-width: 40px; text-align: center; font-weight: 600;">
                      ${navModule.nav_autohide?.delay ?? 3}s
                    </span>
                  </div>
                </div>
              `
            : ''}
        </div>

        <!-- Haptics Section -->
        ${this.renderSettingsSection(
          'HAPTIC FEEDBACK',
          'Configure haptic feedback for interactions.',
          [
            {
              title: 'Enable Haptics',
              description: 'Master toggle for all navbar haptic feedback.',
              hass,
              data: { enabled: navModule.nav_haptic !== false },
              schema: [UcFormUtils.boolean('enabled')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  nav_haptic: e.detail.value.enabled ? this.getHapticConfig(navModule) : false,
                });
              },
            },
            {
              title: 'URL Navigation',
              description: 'Trigger haptic when navigating to a URL.',
              hass,
              data: { url: this.getHapticConfig(navModule).url ?? false },
              schema: [UcFormUtils.boolean('url')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  nav_haptic: { ...this.getHapticConfig(navModule), url: e.detail.value.url },
                });
              },
            },
            {
              title: 'Tap Action',
              description: 'Trigger haptic on tap.',
              hass,
              data: { tap_action: this.getHapticConfig(navModule).tap_action ?? true },
              schema: [UcFormUtils.boolean('tap_action')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  nav_haptic: {
                    ...this.getHapticConfig(navModule),
                    tap_action: e.detail.value.tap_action,
                  },
                });
              },
            },
            {
              title: 'Hold Action',
              description: 'Trigger haptic on hold.',
              hass,
              data: { hold_action: this.getHapticConfig(navModule).hold_action ?? true },
              schema: [UcFormUtils.boolean('hold_action')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  nav_haptic: {
                    ...this.getHapticConfig(navModule),
                    hold_action: e.detail.value.hold_action,
                  },
                });
              },
            },
            {
              title: 'Double Tap',
              description: 'Trigger haptic on double tap.',
              hass,
              data: {
                double_tap_action: this.getHapticConfig(navModule).double_tap_action ?? true,
              },
              schema: [UcFormUtils.boolean('double_tap_action')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  nav_haptic: {
                    ...this.getHapticConfig(navModule),
                    double_tap_action: e.detail.value.double_tap_action,
                  },
                });
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
    const navModule = this.resolveNavigationConfig(module as NavigationModule, config);

    // Show a placeholder in editor/preview contexts, matching background-module behavior
    const isDashboardEditMode = (() => {
      if (previewContext === 'live' || previewContext === 'ha-preview') {
        return false;
      }
      try {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('edit') === '1';
      } catch {
        return false;
      }
    })();

    const showPlaceholder =
      previewContext === 'live' || previewContext === 'ha-preview' || isDashboardEditMode;

    if (showPlaceholder) {
      const routeCount = navModule.nav_routes?.length || 0;
      const hasMediaPlayer =
        navModule.nav_media_player?.enabled && navModule.nav_media_player?.entity;
      const hasSettings = false; // Settings icon removed

      return html`
        <div
          style="
            padding: 24px;
            text-align: center;
            background: rgba(var(--rgb-primary-color), 0.1);
            border: 2px dashed var(--primary-color);
            border-radius: 8px;
          "
        >
          <ha-icon
            icon="mdi:compass-outline"
            style="color: var(--primary-color); --mdc-icon-size: 48px; margin-bottom: 8px; display: block;"
          ></ha-icon>
          <div style="font-weight: 600; color: var(--primary-color); margin-bottom: 4px;">
            Navigation Module
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color); opacity: 0.8;">
            ${routeCount} path${routeCount !== 1 ? 's' : ''}
            ${hasMediaPlayer ? ' • Media Player' : ''} ${hasSettings ? ' • Settings' : ''}
          </div>
          <div
            style="font-size: 11px; color: var(--secondary-text-color); margin-top: 8px; opacity: 0.7;"
          >
            ${navModule.nav_scope === 'all_views' ? 'Global (all views)' : 'Current view only'}
          </div>
          <div
            style="font-size: 10px; color: var(--secondary-text-color); margin-top: 12px; opacity: 0.6; font-style: italic;"
          >
            The navbar overlays the dashboard. Exit edit mode to see it in place.
          </div>
        </div>
      `;
    }

    // For all other contexts (including actual dashboard viewing), return empty
    // The navbar is rendered as an overlay by the navigation service
    return html``;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const navModule = module as NavigationModule;
    const errors: string[] = [];

    if (!navModule.nav_routes || navModule.nav_routes.length === 0) {
      errors.push('At least one navigation route is required.');
    }

    navModule.nav_routes?.forEach(route => {
      const hasAction = !!route.tap_action || !!route.hold_action || !!route.double_tap_action;
      if (!route.url && !hasAction) {
        errors.push(`Route "${route.label || route.id}" must have a URL or an action.`);
      }
    });

    return { valid: errors.length === 0, errors };
  }

  private resolveNavigationConfig(
    module: NavigationModule,
    config?: UltraCardConfig
  ): NavigationModule {
    if (!config) return module;

    const templateName = module.nav_template?.trim();
    const templateConfig =
      templateName && config.nav_templates ? config.nav_templates[templateName] : undefined;

    const mergedRoutes =
      module.nav_routes && module.nav_routes.length > 0
        ? module.nav_routes
        : templateConfig?.nav_routes || [];

    return {
      ...module,
      nav_routes: mergedRoutes,
      nav_desktop: {
        ...(templateConfig?.nav_desktop || {}),
        ...(module.nav_desktop || {}),
      },
      nav_mobile: {
        ...(templateConfig?.nav_mobile || {}),
        ...(module.nav_mobile || {}),
      },
      nav_layout: {
        ...(templateConfig?.nav_layout || {}),
        ...(module.nav_layout || {}),
      },
      nav_haptic: module.nav_haptic ?? templateConfig?.nav_haptic,
      nav_media_player: {
        ...(templateConfig?.nav_media_player || {}),
        ...(module.nav_media_player || {}),
      },
      nav_styles: module.nav_styles ?? templateConfig?.nav_styles,
    };
  }

  private createDefaultRoute(): NavRoute {
    return {
      id: this.generateId('nav-route'),
      icon: 'mdi:home-outline',
      label: 'New Path',
      url: '',
    };
  }

  private createDefaultStack(): NavStackItem {
    return {
      id: this.generateId('nav-stack'),
      icon: 'mdi:dots-horizontal',
      label: 'More',
      open_mode: 'click',
      orientation: 'auto',
      children: [],
    };
  }

  // Track dragged item info for unified drag and drop
  private _draggedItem: {
    type: 'route' | 'stack' | 'stack_child' | 'media_player';
    id: string;
    visualIndex: number;
    parentStackId?: string;
  } | null = null;

  // Handle reordering of unified nav items including stack child drag in/out
  private handleUnifiedReorder(
    fromIndex: number,
    toIndex: number,
    navModule: NavigationModule,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const items = this.buildUnifiedNavItems(navModule);
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;

    const movedItem = items[fromIndex];
    const targetItem = items[toIndex];
    if (!movedItem) return;

    const dragged = this._draggedItem;
    if (!dragged) return;

    const routes = [...(navModule.nav_routes || [])];
    const stacks = (navModule.nav_stacks || []).map(s => ({
      ...s,
      children: [...(s.children || [])],
    }));
    let mediaPlayerPosition: number | 'start' | 'end' =
      navModule.nav_media_player?.icon_position || 'end';

    // Case 1: Stack child dropped on a top-level position → eject from stack
    if (
      dragged.type === 'stack_child' &&
      dragged.parentStackId &&
      targetItem &&
      targetItem.type !== 'stack_child'
    ) {
      const srcStack = stacks.find(s => s.id === dragged.parentStackId);
      if (!srcStack) return;
      const childIdx = srcStack.children.findIndex(c => c.id === dragged.id);
      if (childIdx < 0) return;
      const [ejectedChild] = srcStack.children.splice(childIdx, 1);

      // Figure out where to insert in routes array
      let insertIdx = routes.length;
      if (targetItem.type === 'route') {
        const routeIdx = routes.findIndex(r => r.id === targetItem.id);
        if (routeIdx >= 0) insertIdx = routeIdx;
      }
      routes.splice(insertIdx, 0, ejectedChild);

      updateModule({
        nav_routes: routes,
        nav_stacks: stacks,
      });
      return;
    }

    // Case 2: Stack child reorder within same stack
    if (
      dragged.type === 'stack_child' &&
      dragged.parentStackId &&
      targetItem?.type === 'stack_child' &&
      targetItem.parentStackId === dragged.parentStackId
    ) {
      const stack = stacks.find(s => s.id === dragged.parentStackId);
      if (!stack) return;
      const fromIdx = stack.children.findIndex(c => c.id === dragged.id);
      const toIdx = stack.children.findIndex(c => c.id === targetItem.id);
      if (fromIdx < 0 || toIdx < 0) return;
      const [moved] = stack.children.splice(fromIdx, 1);
      stack.children.splice(toIdx, 0, moved);

      updateModule({ nav_stacks: stacks });
      return;
    }

    // Case 3: Stack child dropped on a child of a different stack → move between stacks
    if (
      dragged.type === 'stack_child' &&
      dragged.parentStackId &&
      targetItem?.type === 'stack_child' &&
      targetItem.parentStackId !== dragged.parentStackId
    ) {
      const srcStack = stacks.find(s => s.id === dragged.parentStackId);
      const destStack = stacks.find(s => s.id === targetItem.parentStackId);
      if (!srcStack || !destStack) return;
      const childIdx = srcStack.children.findIndex(c => c.id === dragged.id);
      if (childIdx < 0) return;
      const [movedChild] = srcStack.children.splice(childIdx, 1);
      const destIdx = destStack.children.findIndex(c => c.id === targetItem.id);
      destStack.children.splice(destIdx >= 0 ? destIdx : destStack.children.length, 0, movedChild);

      updateModule({ nav_stacks: stacks });
      return;
    }

    // Case 4: Default top-level reorder (routes, stacks, media player)
    // Filter to only top-level items
    const topLevelItems = items.filter(i => i.type !== 'stack_child');
    const fromTopIdx = topLevelItems.findIndex(i => i.id === movedItem.id);
    const toTopIdx = topLevelItems.findIndex(i => i.id === targetItem?.id);
    if (fromTopIdx < 0 || toTopIdx < 0 || fromTopIdx === toTopIdx) return;

    const newTopItems = [...topLevelItems];
    const [removed] = newTopItems.splice(fromTopIdx, 1);
    newTopItems.splice(toTopIdx, 0, removed);

    // Rebuild arrays from new order
    const newRoutes: NavRoute[] = [];
    const newStacks: NavStackItem[] = [];
    let topIndex = 0;

    newTopItems.forEach(item => {
      if (item.type === 'route' && item.data) {
        newRoutes.push(item.data as NavRoute);
        topIndex++;
      } else if (item.type === 'stack' && item.data) {
        newStacks.push(item.data as NavStackItem);
        topIndex++;
      } else if (item.type === 'media_player') {
        mediaPlayerPosition = topIndex;
      }
    });

    // Determine if media player is at start or end
    const totalTopItems = newRoutes.length + newStacks.length;
    if (typeof mediaPlayerPosition === 'number') {
      if (mediaPlayerPosition === 0) mediaPlayerPosition = 'start';
      else if (mediaPlayerPosition >= totalTopItems) mediaPlayerPosition = 'end';
    }

    updateModule({
      nav_routes: newRoutes,
      nav_stacks: newStacks,
      nav_media_player: {
        ...navModule.nav_media_player,
        icon_position: mediaPlayerPosition,
      },
    });
  }

  // Handle dropping an item onto a stack header (to add as a child)
  private handleDropOnStack(
    targetStackId: string,
    navModule: NavigationModule,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const dragged = this._draggedItem;
    if (!dragged) return;

    // Can't drop a stack onto itself or media player into a stack
    if (dragged.type === 'stack' || dragged.type === 'media_player') return;

    // If already in this stack, ignore
    if (dragged.type === 'stack_child' && dragged.parentStackId === targetStackId) return;

    const routes = [...(navModule.nav_routes || [])];
    const stacks = (navModule.nav_stacks || []).map(s => ({
      ...s,
      children: [...(s.children || [])],
    }));
    const targetStack = stacks.find(s => s.id === targetStackId);
    if (!targetStack) return;

    let routeToAdd: NavRoute | null = null;

    if (dragged.type === 'route') {
      // Remove from top-level routes, add to stack
      const idx = routes.findIndex(r => r.id === dragged.id);
      if (idx < 0) return;
      [routeToAdd] = routes.splice(idx, 1);
    } else if (dragged.type === 'stack_child' && dragged.parentStackId) {
      // Move from one stack to another
      const srcStack = stacks.find(s => s.id === dragged.parentStackId);
      if (!srcStack) return;
      const childIdx = srcStack.children.findIndex(c => c.id === dragged.id);
      if (childIdx < 0) return;
      [routeToAdd] = srcStack.children.splice(childIdx, 1);
    }

    if (routeToAdd) {
      targetStack.children.push(routeToAdd);
      updateModule({
        nav_routes: routes,
        nav_stacks: stacks,
      });
    }

    this._draggedItem = null;
  }

  private renderSpecialItemRow(
    type: 'media_player',
    icon: string,
    label: string,
    description: string,
    visualIndex: number,
    totalItems: number,
    navModule: NavigationModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    config?: UltraCardConfig
  ): TemplateResult {
    const itemId = type === 'media_player' ? '__media_player__' : '__media_player__';
    const isExpanded = this._expandedSpecialItems.has(itemId);

    const toggleExpand = () => {
      if (isExpanded) {
        this._expandedSpecialItems.delete(itemId);
      } else {
        this._expandedSpecialItems.add(itemId);
      }
      updateModule({});
    };

    // Drag and drop handlers
    const onDragStart = (e: DragEvent) => {
      this._draggedItem = { type, id: itemId, visualIndex };
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify({ type, visualIndex }));
      }
      (e.currentTarget as HTMLElement).classList.add('dragging');
    };

    const onDragEnd = (e: DragEvent) => {
      this._draggedItem = null;
      (e.currentTarget as HTMLElement).classList.remove('dragging');
      // Remove drag-over class from all items
      document
        .querySelectorAll('.entity-row.drag-over')
        .forEach(el => el.classList.remove('drag-over'));
    };

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
      (e.currentTarget as HTMLElement).classList.add('drag-over');
    };

    const onDragLeave = (e: DragEvent) => {
      (e.currentTarget as HTMLElement).classList.remove('drag-over');
    };

    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).classList.remove('drag-over');
      if (!this._draggedItem || this._draggedItem.visualIndex === visualIndex) return;
      this.handleUnifiedReorder(
        this._draggedItem.visualIndex,
        visualIndex,
        navModule,
        updateModule
      );
      this._draggedItem = null;
    };

    return html`
      <div
        class="entity-row special-item ${isExpanded ? 'expanded' : ''}"
        draggable="true"
        @dragstart=${onDragStart}
        @dragend=${onDragEnd}
        @dragover=${onDragOver}
        @dragleave=${onDragLeave}
        @drop=${onDrop}
      >
        <div class="entity-header" @click=${toggleExpand}>
          <div class="drag-handle" @click=${(e: Event) => e.stopPropagation()}>
            <ha-icon
              icon="mdi:drag"
              style="--mdc-icon-size: 20px; color: var(--secondary-text-color);"
            ></ha-icon>
          </div>
          <div class="entity-info">
            <ha-icon
              icon="${icon}"
              class="entity-icon"
              style="color: var(--primary-color);"
            ></ha-icon>
            <div class="entity-name">${label}</div>
            <div class="entity-detail">${description}</div>
          </div>
          <div class="entity-actions" @click=${(e: Event) => e.stopPropagation()}>
            <span class="special-badge">Media</span>
            <ha-icon
              icon="${isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}"
              class="expand-icon"
            ></ha-icon>
          </div>
        </div>

        ${isExpanded && type === 'media_player'
          ? html`
              <div class="entity-expanded">
                ${this.renderMediaPlayerExpandedSettings(navModule, hass, updateModule, config)}
              </div>
            `
          : ''}
      </div>
    `;
  }

  /** Map inactive_tap_action to dropdown category for media player (idle/off/unavailable only). */
  private getInactiveTapActionCategory(mediaPlayer: NavigationModule['nav_media_player']): string {
    const action = mediaPlayer?.inactive_tap_action;
    if (!action) return 'play';
    if (action.action === 'nothing') return 'nothing';
    if (action.action === 'navigate' && !action.navigation_path) return 'navigate';
    if (action.action === 'navigate') return 'navigate';
    if (action.action === 'url') return 'url';
    if (action.action === 'open-popup') return 'open-popup';
    if (action.action === 'toggle') return 'toggle';
    if (action.action === 'more-info') return 'more-info';
    if (action.action === 'assist') return 'assist';
    if (action.action === 'perform-action' || (action.action as string) === 'call-service') return 'perform-action';
    return 'perform-action';
  }

  private renderMediaPlayerExpandedSettings(
    navModule: NavigationModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    config?: UltraCardConfig
  ): TemplateResult {
    const mediaPlayer = navModule.nav_media_player || {};
    const displayMode = mediaPlayer.display_mode || 'icon_click';
    const hasEntity = mediaPlayer.entity && mediaPlayer.entity !== '';
    const inactiveCategory = this.getInactiveTapActionCategory(mediaPlayer);

    const setInactiveTapAction = (cat: string) => {
      switch (cat) {
        case 'play':
          const { inactive_tap_action: _, ...rest } = mediaPlayer;
          updateModule({ nav_media_player: { ...rest } });
          break;
        case 'nothing':
          updateModule({
            nav_media_player: { ...mediaPlayer, inactive_tap_action: { action: 'nothing' } },
          });
          break;
        case 'navigate':
          updateModule({
            nav_media_player: {
              ...mediaPlayer,
              inactive_tap_action: {
                action: 'navigate',
                navigation_path: mediaPlayer.inactive_tap_action?.navigation_path || '',
              },
            },
          });
          break;
        case 'url':
          updateModule({
            nav_media_player: {
              ...mediaPlayer,
              inactive_tap_action: {
                action: 'url',
                url_path: mediaPlayer.inactive_tap_action?.url_path || '',
              },
            },
          });
          break;
        case 'open-popup':
          updateModule({
            nav_media_player: {
              ...mediaPlayer,
              inactive_tap_action: {
                action: 'open-popup',
                popup_id: mediaPlayer.inactive_tap_action?.popup_id || '',
              },
            },
          });
          break;
        case 'toggle':
          updateModule({
            nav_media_player: {
              ...mediaPlayer,
              inactive_tap_action: {
                action: 'toggle',
                entity: mediaPlayer.inactive_tap_action?.entity || mediaPlayer.entity || '',
              },
            },
          });
          break;
        case 'more-info':
          updateModule({
            nav_media_player: {
              ...mediaPlayer,
              inactive_tap_action: {
                action: 'more-info',
                entity: mediaPlayer.inactive_tap_action?.entity || mediaPlayer.entity || '',
              },
            },
          });
          break;
        case 'assist':
          updateModule({
            nav_media_player: {
              ...mediaPlayer,
              inactive_tap_action: {
                action: 'assist',
                pipeline_id: mediaPlayer.inactive_tap_action?.pipeline_id,
                start_listening: mediaPlayer.inactive_tap_action?.start_listening ?? false,
              },
            },
          });
          break;
        case 'perform-action':
          updateModule({
            nav_media_player: {
              ...mediaPlayer,
              inactive_tap_action: {
                ...(mediaPlayer.inactive_tap_action || {}),
                action: 'perform-action',
              },
            },
          });
          break;
      }
    };

    const updateInactiveTapAction = (updates: Partial<NavActionConfig>) => {
      updateModule({
        nav_media_player: {
          ...mediaPlayer,
          inactive_tap_action: { ...(mediaPlayer.inactive_tap_action || {}), ...updates } as NavActionConfig,
        },
      });
    };

    const serviceActionValue = (() => {
      const a = (mediaPlayer.inactive_tap_action || {}) as NavActionConfig;
      return {
        action: a.perform_action || a.service || '',
        ...(a.data ? { data: a.data } : {}),
        ...(a.service_data ? { data: a.service_data } : {}),
        ...(a.target ? { target: a.target } : {}),
      };
    })();

    return html`
      ${!hasEntity
        ? html`
            <div
              class="info-box"
              style="background: var(--warning-color, orange); color: var(--text-primary-color); padding: 12px; border-radius: 8px; margin-bottom: 16px;"
            >
              ⚠️ <strong>Entity Required:</strong> Select a media player entity below for the icon
              to appear in the navbar.
            </div>
          `
        : ''}
      ${UcFormUtils.renderFieldSection(
        'Entity',
        'Media player entity to display.',
        hass,
        { entity: mediaPlayer.entity || '' },
        [UcFormUtils.entity('entity', ['media_player'])],
        (e: CustomEvent) => {
          updateModule({
            nav_media_player: { ...mediaPlayer, entity: e.detail.value.entity },
          });
        }
      )}
      ${UcFormUtils.renderFieldSection(
        'Interaction Mode',
        'How the media player widget opens.',
        hass,
        { display_mode: displayMode },
        [
          UcFormUtils.select('display_mode', [
            { value: 'icon_hover', label: 'Expand on hover' },
            { value: 'icon_click', label: 'Expand on click' },
          ]),
        ],
        (e: CustomEvent) => {
          updateModule({
            nav_media_player: { ...mediaPlayer, display_mode: e.detail.value.display_mode },
          });
        }
      )}
      ${UcFormUtils.renderFieldSection(
        'Widget Position',
        'Where the expanded widget appears relative to the icon.',
        hass,
        { widget_position: mediaPlayer.widget_position || 'above' },
        [
          UcFormUtils.select('widget_position', [
            { value: 'above', label: 'Above icon' },
            { value: 'below', label: 'Below icon' },
          ]),
        ],
        (e: CustomEvent) => {
          updateModule({
            nav_media_player: { ...mediaPlayer, widget_position: e.detail.value.widget_position },
          });
        }
      )}
      ${UcFormUtils.renderFieldSection(
        'Album Cover Background',
        'Use album art as blurred background for the widget.',
        hass,
        { album_cover_background: mediaPlayer.album_cover_background ?? false },
        [UcFormUtils.boolean('album_cover_background')],
        (e: CustomEvent) => {
          updateModule({
            nav_media_player: {
              ...mediaPlayer,
              album_cover_background: e.detail.value.album_cover_background,
            },
          });
        }
      )}

      <!-- Inactive Tap Action (idle/off/unavailable only) -->
      <div class="field-group-title" style="margin-top: 16px; margin-bottom: 8px;">Inactive Tap Action</div>
      <div class="field-description" style="margin-bottom: 12px;">
        When the media player is idle, off, or unavailable, tapping the icon can do something other than start playback.
      </div>
      <div class="field-container">
        <ha-select
          style="width: 100%;"
          .value=${inactiveCategory}
          @selected=${(e: any) => {
            e.stopPropagation();
            const nextValue = e.detail?.value ?? e.target?.value;
            if (nextValue) setInactiveTapAction(nextValue);
          }}
          @closed=${(e: Event) => e.stopPropagation()}
        >
          <mwc-list-item value="play">Play (default)</mwc-list-item>
          <mwc-list-item value="nothing">Do nothing</mwc-list-item>
          <mwc-list-item value="open-popup">Open popup</mwc-list-item>
          <mwc-list-item value="navigate">Navigate</mwc-list-item>
          <mwc-list-item value="url">Open URL</mwc-list-item>
          <mwc-list-item value="more-info">More info</mwc-list-item>
          <mwc-list-item value="toggle">Toggle</mwc-list-item>
          <mwc-list-item value="perform-action">Perform action</mwc-list-item>
          <mwc-list-item value="assist">Assist</mwc-list-item>
        </ha-select>
      </div>
      ${inactiveCategory === 'navigate'
        ? html`
            <div class="field-container" style="margin-top: 8px;">
              <div class="field-title">Path</div>
              <ultra-navigation-picker
                .hass=${hass}
                .value=${mediaPlayer.inactive_tap_action?.navigation_path || ''}
                label=""
                @value-changed=${(e: CustomEvent) =>
                  updateInactiveTapAction({ navigation_path: e.detail.value })}
              ></ultra-navigation-picker>
            </div>
          `
        : ''}
      ${inactiveCategory === 'url'
        ? html`
            <div class="field-container" style="margin-top: 8px;">
              <div class="field-title">URL</div>
              <ha-textfield
                style="width: 100%;"
                .value=${mediaPlayer.inactive_tap_action?.url_path || ''}
                placeholder="https://example.com"
                @input=${(e: Event) =>
                  updateInactiveTapAction({ url_path: (e.target as HTMLInputElement).value })}
                @click=${(e: Event) => e.stopPropagation()}
              ></ha-textfield>
            </div>
          `
        : ''}
      ${inactiveCategory === 'open-popup' && config
        ? html`
            <div class="field-container" style="margin-top: 8px;">
              <div class="field-title">Popup</div>
              ${(() => {
                const popups = this.getPopupModules(config);
                if (popups.length === 0) {
                  return html`
                    <div class="info-box" style="padding: 12px; border-radius: 8px;">
                      No popup modules found. Add a Popup module to this card first.
                    </div>
                  `;
                }
                return html`
                  <ha-select
                    style="width: 100%;"
                    .value=${mediaPlayer.inactive_tap_action?.popup_id || ''}
                    @selected=${(e: any) => {
                      e.stopPropagation();
                      updateInactiveTapAction({ action: 'open-popup', popup_id: e.target.value });
                    }}
                    @closed=${(e: Event) => e.stopPropagation()}
                  >
                    ${popups.map(
                      p => html`<mwc-list-item value="${p.value}">${p.label}</mwc-list-item>`
                    )}
                  </ha-select>
                `;
              })()}
            </div>
          `
        : ''}
      ${inactiveCategory === 'toggle' || inactiveCategory === 'more-info'
        ? html`
            <div class="field-container" style="margin-top: 8px;">
              <div class="field-title">Entity</div>
              <ha-entity-picker
                .hass=${hass}
                .value=${mediaPlayer.inactive_tap_action?.entity || mediaPlayer.entity || ''}
                @value-changed=${(e: CustomEvent) =>
                  updateInactiveTapAction({ entity: e.detail.value })}
                allow-custom-entity
              ></ha-entity-picker>
            </div>
          `
        : ''}
      ${inactiveCategory === 'assist'
        ? html`
            <div class="field-container" style="margin-top: 8px;">
              <ha-form
                .hass=${hass}
                .data=${{
                  pipeline_id: mediaPlayer.inactive_tap_action?.pipeline_id,
                  start_listening: mediaPlayer.inactive_tap_action?.start_listening ?? false,
                }}
                .schema=${[
                  {
                    name: 'pipeline_id',
                    selector: { assist_pipeline: { include_last_used: true } },
                  },
                  { name: 'start_listening', selector: { boolean: {} } },
                ]}
                .computeLabel=${() => ''}
                @value-changed=${(e: CustomEvent) => {
                  e.stopPropagation();
                  const v = e.detail.value || {};
                  updateInactiveTapAction({
                    action: 'assist',
                    pipeline_id: v.pipeline_id,
                    start_listening: v.start_listening,
                  });
                }}
              ></ha-form>
            </div>
          `
        : ''}
      ${inactiveCategory === 'perform-action'
        ? html`
            <div class="nav-action-perform-action" style="margin-top: 8px;">
              <div class="field-title">Action</div>
              <ha-service-control
                .hass=${hass}
                .value=${serviceActionValue}
                @value-changed=${(e: CustomEvent) => {
                  e.stopPropagation();
                  const value = e.detail?.value || {};
                  const next: NavActionConfig = {
                    ...(mediaPlayer.inactive_tap_action || {}),
                    action: 'perform-action',
                    perform_action: value.action || '',
                    target: value.target,
                    data: value.data,
                  };
                  if (!value.data) delete (next as any).data;
                  updateModule({
                    nav_media_player: { ...mediaPlayer, inactive_tap_action: next },
                  });
                }}
              ></ha-service-control>
            </div>
          `
        : ''}
    `;
  }

  private renderRouteRow(
    route: NavRoute,
    index: number,
    routes: NavRoute[],
    hass: HomeAssistant,
    navModule: NavigationModule,
    updateModule: (updates: Partial<CardModule>) => void,
    visualIndex?: number,
    totalItems?: number,
    parentStackId?: string,
    config?: UltraCardConfig
  ): TemplateResult {
    const isExpanded = this._expandedRoutes.has(route.id);
    const isStackChild = !!parentStackId;
    const label = route.label || (isStackChild ? 'Stack Item' : `Path ${index + 1}`);
    const icon = route.icon || 'mdi:compass-outline';
    const effectiveVisualIndex = visualIndex ?? index;

    // When this is a stack child, operations target the parent stack's children
    const updateRoute = (updates: Partial<NavRoute>) => {
      if (isStackChild) {
        const stacks = (navModule.nav_stacks || []).map(s => {
          if (s.id !== parentStackId) return s;
          return {
            ...s,
            children: (s.children || []).map(c => (c.id === route.id ? { ...c, ...updates } : c)),
          };
        });
        updateModule({ nav_stacks: stacks });
      } else {
        const nextRoutes = routes.map(r => (r.id === route.id ? { ...r, ...updates } : r));
        updateModule({ nav_routes: nextRoutes });
      }
    };

    const removeRoute = () => {
      this._expandedRoutes.delete(route.id);
      if (isStackChild) {
        const stacks = (navModule.nav_stacks || []).map(s => {
          if (s.id !== parentStackId) return s;
          return { ...s, children: (s.children || []).filter(c => c.id !== route.id) };
        });
        updateModule({ nav_stacks: stacks });
      } else {
        const nextRoutes = routes.filter(r => r.id !== route.id);
        updateModule({ nav_routes: nextRoutes });
      }
    };

    const duplicateRoute = () => {
      const cloned: NavRoute = {
        ...JSON.parse(JSON.stringify(route)),
        id: this.generateId('nav-route'),
        label: `${route.label || (isStackChild ? 'Stack Item' : `Path ${index + 1}`)} (Copy)`,
      };
      if (isStackChild) {
        const stacks = (navModule.nav_stacks || []).map(s => {
          if (s.id !== parentStackId) return s;
          const kids = [...(s.children || [])];
          const idx = kids.findIndex(c => c.id === route.id);
          kids.splice(idx + 1, 0, cloned);
          return { ...s, children: kids };
        });
        updateModule({ nav_stacks: stacks });
      } else {
        const nextRoutes = [...routes];
        const idx = nextRoutes.findIndex(r => r.id === route.id);
        nextRoutes.splice(idx + 1, 0, cloned);
        updateModule({ nav_routes: nextRoutes });
      }
    };

    const toggleExpand = () => {
      if (isExpanded) {
        this._expandedRoutes.delete(route.id);
      } else {
        this._expandedRoutes.add(route.id);
      }
      updateModule({});
    };

    // Drag and drop handlers
    const onDragStart = (e: DragEvent) => {
      this._draggedItem = {
        type: isStackChild ? 'stack_child' : 'route',
        id: route.id,
        visualIndex: effectiveVisualIndex,
        parentStackId: parentStackId,
      };
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData(
          'text/plain',
          JSON.stringify({
            type: isStackChild ? 'stack_child' : 'route',
            id: route.id,
            visualIndex: effectiveVisualIndex,
            parentStackId,
          })
        );
      }
      (e.currentTarget as HTMLElement).classList.add('dragging');
    };

    const onDragEnd = (e: DragEvent) => {
      this._draggedItem = null;
      (e.currentTarget as HTMLElement).classList.remove('dragging');
      document
        .querySelectorAll('.entity-row.drag-over')
        .forEach(el => el.classList.remove('drag-over'));
    };

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
      (e.currentTarget as HTMLElement).classList.add('drag-over');
    };

    const onDragLeave = (e: DragEvent) => {
      (e.currentTarget as HTMLElement).classList.remove('drag-over');
    };

    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).classList.remove('drag-over');
      if (!this._draggedItem || this._draggedItem.visualIndex === effectiveVisualIndex) return;
      this.handleUnifiedReorder(
        this._draggedItem.visualIndex,
        effectiveVisualIndex,
        navModule,
        updateModule
      );
      this._draggedItem = null;
    };

    // Find parent stack name for display
    const parentStackName = isStackChild
      ? (navModule.nav_stacks || []).find(s => s.id === parentStackId)?.label || 'Stack'
      : '';

    return html`
      <div
        class="entity-row ${isExpanded ? 'expanded' : ''} ${isStackChild ? 'stack-child-row' : ''}"
        draggable="true"
        @dragstart=${onDragStart}
        @dragend=${onDragEnd}
        @dragover=${onDragOver}
        @dragleave=${onDragLeave}
        @drop=${onDrop}
        style="${isStackChild
          ? 'margin-left: 24px; border-left: 2px solid var(--accent-color); border-radius: 0 12px 12px 0;'
          : ''}"
      >
        <div class="entity-header" @click=${toggleExpand}>
          <div class="drag-handle" @click=${(e: Event) => e.stopPropagation()}>
            <ha-icon
              icon="mdi:drag"
              style="--mdc-icon-size: 20px; color: var(--secondary-text-color);"
            ></ha-icon>
          </div>
          <div class="entity-info">
            <ha-icon icon="${icon}" class="entity-icon"></ha-icon>
            <div class="entity-name">
              ${isStackChild
                ? html`<span
                      style="font-size: 10px; color: var(--accent-color); font-weight: 600; text-transform: uppercase;"
                      >${parentStackName} ›</span
                    >
                    ${label}`
                : label}
            </div>
            ${route.url ? html` <div class="entity-detail">${route.url}</div> ` : ''}
          </div>
          <div class="entity-actions" @click=${(e: Event) => e.stopPropagation()}>
            <button class="entity-action-btn duplicate" @click=${duplicateRoute} title="Duplicate">
              <ha-icon icon="mdi:content-copy"></ha-icon>
            </button>
            <button class="entity-action-btn delete" @click=${removeRoute} title="Delete">
              <ha-icon icon="mdi:delete"></ha-icon>
            </button>
            <ha-icon
              icon="${isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}"
              class="expand-icon"
            ></ha-icon>
          </div>
        </div>

        ${isExpanded
          ? html`
              <div class="entity-expanded">
                ${UcFormUtils.renderFieldSection(
                  'Label',
                  'Text shown below the icon in the navbar.',
                  hass,
                  { label: route.label || '' },
                  [UcFormUtils.text('label')],
                  (e: CustomEvent) => updateRoute({ label: e.detail.value.label })
                )}

                ${this.renderActionEditor(route, hass, config || ({} as UltraCardConfig), updateRoute)}

                ${UcFormUtils.renderFieldSection(
                  'Icon',
                  'Material Design icon for this path.',
                  hass,
                  { icon: route.icon || '' },
                  [UcFormUtils.icon('icon')],
                  (e: CustomEvent) => updateRoute({ icon: e.detail.value.icon })
                )}

                <div class="color-field">
                  <div class="field-title">Icon Color</div>
                  <div class="field-description">Custom color for the icon.</div>
                  <ultra-color-picker
                    .hass=${hass}
                    .value=${route.icon_color || ''}
                    @value-changed=${(e: CustomEvent) =>
                      updateRoute({ icon_color: e.detail.value })}
                  ></ultra-color-picker>
                </div>

                ${UcFormUtils.renderFieldSection(
                  'Selected Icon (Optional)',
                  'Different icon shown when this path is active.',
                  hass,
                  { icon_selected: route.icon_selected || '' },
                  [UcFormUtils.icon('icon_selected')],
                  (e: CustomEvent) => updateRoute({ icon_selected: e.detail.value.icon_selected })
                )}

                <div class="color-field">
                  <div class="field-title">Selected Color</div>
                  <div class="field-description">Color when path is active.</div>
                  <ultra-color-picker
                    .hass=${hass}
                    .value=${route.selected_color || ''}
                    @value-changed=${(e: CustomEvent) =>
                      updateRoute({ selected_color: e.detail.value })}
                  ></ultra-color-picker>
                </div>

                ${UcFormUtils.renderFieldSection(
                  'Image URL (Optional)',
                  'Use custom image instead of icon (e.g., user avatar).',
                  hass,
                  { image: route.image || '' },
                  [UcFormUtils.text('image')],
                  (e: CustomEvent) => updateRoute({ image: e.detail.value.image })
                )}
                ${UcFormUtils.renderFieldSection(
                  'Selected Image URL (Optional)',
                  'Different image shown when path is active.',
                  hass,
                  { image_selected: route.image_selected || '' },
                  [UcFormUtils.text('image_selected')],
                  (e: CustomEvent) => updateRoute({ image_selected: e.detail.value.image_selected })
                )}

                <!-- Notification Settings -->
                <div
                  style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--divider-color);"
                >
                  <div class="field-group-title">Notifications</div>
                  ${this.renderNotificationEditor(route, hass, updateRoute)}
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }

  private renderStackRow(
    stack: NavStackItem,
    index: number,
    stacks: NavStackItem[],
    hass: HomeAssistant,
    navModule: NavigationModule,
    updateModule: (updates: Partial<CardModule>) => void,
    visualIndex?: number,
    totalItems?: number
  ): TemplateResult {
    const isExpanded = this._expandedRoutes.has(stack.id);
    const label = stack.label || `Stack ${index + 1}`;
    const icon = stack.icon || 'mdi:dots-horizontal';
    const effectiveVisualIndex = visualIndex ?? index;
    const children = stack.children || [];

    const updateStack = (updates: Partial<NavStackItem>) => {
      const nextStacks = stacks.map(s => (s.id === stack.id ? { ...s, ...updates } : s));
      updateModule({ nav_stacks: nextStacks });
    };

    const removeStack = () => {
      // When removing a stack, eject children back to top-level routes
      const ejectedChildren = [...children];
      const nextStacks = stacks.filter(s => s.id !== stack.id);
      this._expandedRoutes.delete(stack.id);
      updateModule({
        nav_routes: [...(navModule.nav_routes || []), ...ejectedChildren],
        nav_stacks: nextStacks,
      });
    };

    const duplicateStack = () => {
      const clonedChildren = (children || []).map(c => ({
        ...JSON.parse(JSON.stringify(c)),
        id: this.generateId('nav-route'),
      }));
      const cloned: NavStackItem = {
        ...JSON.parse(JSON.stringify(stack)),
        id: this.generateId('nav-stack'),
        label: `${stack.label || `Stack ${index + 1}`} (Copy)`,
        children: clonedChildren,
      };
      const nextStacks = [...stacks];
      const idx = nextStacks.findIndex(s => s.id === stack.id);
      nextStacks.splice(idx + 1, 0, cloned);
      updateModule({ nav_stacks: nextStacks });
    };

    const toggleExpand = () => {
      if (isExpanded) {
        this._expandedRoutes.delete(stack.id);
      } else {
        this._expandedRoutes.add(stack.id);
      }
      updateModule({});
    };

    // Drag start for the stack itself (reorder among top-level items)
    const onDragStart = (e: DragEvent) => {
      this._draggedItem = { type: 'stack', id: stack.id, visualIndex: effectiveVisualIndex };
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData(
          'text/plain',
          JSON.stringify({ type: 'stack', id: stack.id, visualIndex: effectiveVisualIndex })
        );
      }
      (e.currentTarget as HTMLElement).classList.add('dragging');
    };

    const onDragEnd = (e: DragEvent) => {
      this._draggedItem = null;
      (e.currentTarget as HTMLElement).classList.remove('dragging');
      document
        .querySelectorAll('.entity-row.drag-over, .stack-drop-zone.drag-over')
        .forEach(el => el.classList.remove('drag-over'));
    };

    // Drop on the stack header → add dragged item as child of this stack
    const onStackDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const dragged = this._draggedItem;
      // Only accept routes and stack_children from other stacks
      if (
        dragged &&
        (dragged.type === 'route' ||
          (dragged.type === 'stack_child' && dragged.parentStackId !== stack.id))
      ) {
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
        (e.currentTarget as HTMLElement).classList.add('drag-over');
      }
    };

    const onStackDragLeave = (e: DragEvent) => {
      (e.currentTarget as HTMLElement).classList.remove('drag-over');
    };

    const onStackDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as HTMLElement).classList.remove('drag-over');
      this.handleDropOnStack(stack.id, navModule, updateModule);
    };

    // Regular reorder drop (for reordering stacks among top-level items)
    const onReorderDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
      (e.currentTarget as HTMLElement).classList.add('drag-over');
    };

    const onReorderDragLeave = (e: DragEvent) => {
      (e.currentTarget as HTMLElement).classList.remove('drag-over');
    };

    const onReorderDrop = (e: DragEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).classList.remove('drag-over');
      if (!this._draggedItem || this._draggedItem.visualIndex === effectiveVisualIndex) return;
      // If dragging a route or stack_child onto a stack row at the list level, use unified reorder
      this.handleUnifiedReorder(
        this._draggedItem.visualIndex,
        effectiveVisualIndex,
        navModule,
        updateModule
      );
      this._draggedItem = null;
    };

    return html`
      <div
        class="entity-row stack-row ${isExpanded ? 'expanded' : ''}"
        draggable="true"
        @dragstart=${onDragStart}
        @dragend=${onDragEnd}
        @dragover=${onReorderDragOver}
        @dragleave=${onReorderDragLeave}
        @drop=${onReorderDrop}
        style="border: 2px solid var(--accent-color); border-radius: 12px;"
      >
        <div class="entity-header" @click=${toggleExpand}>
          <div class="drag-handle" @click=${(e: Event) => e.stopPropagation()}>
            <ha-icon
              icon="mdi:drag"
              style="--mdc-icon-size: 20px; color: var(--secondary-text-color);"
            ></ha-icon>
          </div>
          <div class="entity-info">
            <ha-icon
              icon="${icon}"
              class="entity-icon"
              style="color: var(--accent-color);"
            ></ha-icon>
            <div class="entity-name">
              <span style="color: var(--accent-color);">Stack:</span> ${label}
            </div>
            <div class="entity-detail">
              ${children.length} item${children.length !== 1 ? 's' : ''} · Drag paths here to add
            </div>
          </div>
          <div class="entity-actions" @click=${(e: Event) => e.stopPropagation()}>
            <button
              class="entity-action-btn duplicate"
              @click=${duplicateStack}
              title="Duplicate stack"
            >
              <ha-icon icon="mdi:content-copy"></ha-icon>
            </button>
            <button
              class="entity-action-btn delete"
              @click=${removeStack}
              title="Delete stack (items are moved to top level)"
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </button>
            <ha-icon
              icon="${isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}"
              class="expand-icon"
            ></ha-icon>
          </div>
        </div>

        <!-- Drop zone for adding items to this stack -->
        <div
          class="stack-drop-zone"
          @dragover=${onStackDragOver}
          @dragleave=${onStackDragLeave}
          @drop=${onStackDrop}
          style="
            padding: 8px 16px;
            border-top: 1px dashed var(--divider-color);
            text-align: center;
            font-size: 12px;
            color: var(--secondary-text-color);
            transition: all 0.2s ease;
          "
        >
          <ha-icon
            icon="mdi:tray-arrow-down"
            style="--mdc-icon-size: 16px; margin-right: 4px;"
          ></ha-icon>
          Drop paths here to add to stack
        </div>

        ${isExpanded
          ? html`
              <div class="entity-expanded">
                ${UcFormUtils.renderFieldSection(
                  'Label',
                  'Text shown below the stack icon in the navbar.',
                  hass,
                  { label: stack.label || '' },
                  [UcFormUtils.text('label')],
                  (e: CustomEvent) => updateStack({ label: e.detail.value.label })
                )}
                ${UcFormUtils.renderFieldSection(
                  'Icon',
                  'Material Design icon for this stack.',
                  hass,
                  { icon: stack.icon || '' },
                  [UcFormUtils.icon('icon')],
                  (e: CustomEvent) => updateStack({ icon: e.detail.value.icon })
                )}

                <div class="field-container">
                  <div class="field-title">Open Mode</div>
                  <div class="field-description">
                    Choose how the stack opens to show child items.
                  </div>
                  <ha-select
                    style="width: 100%;"
                    .value=${stack.open_mode || 'click'}
                    @selected=${(e: any) => {
                      e.stopPropagation();
                      updateStack({ open_mode: e.target.value });
                    }}
                    @closed=${(e: Event) => e.stopPropagation()}
                  >
                    <mwc-list-item value="click">Click to open</mwc-list-item>
                    <mwc-list-item value="hover">Hover to open</mwc-list-item>
                  </ha-select>
                </div>

                <div class="field-container">
                  <div class="field-title">Stack Orientation</div>
                  <div class="field-description">
                    Direction child items are displayed. Auto will show vertically for horizontal
                    navbars and horizontally for vertical navbars.
                  </div>
                  <ha-select
                    style="width: 100%;"
                    .value=${stack.orientation || 'auto'}
                    @selected=${(e: any) => {
                      e.stopPropagation();
                      updateStack({ orientation: e.target.value });
                    }}
                    @closed=${(e: Event) => e.stopPropagation()}
                  >
                    <mwc-list-item value="auto">Auto (opposite of navbar)</mwc-list-item>
                    <mwc-list-item value="vertical">Vertical</mwc-list-item>
                    <mwc-list-item value="horizontal">Horizontal</mwc-list-item>
                  </ha-select>
                </div>

                <div class="info-box" style="margin-top: 16px;">
                  <ha-icon icon="mdi:information-outline"></ha-icon>
                  <span>
                    Drag paths from the list above into this stack, or drag children out to eject
                    them back to the top level. Children appear indented below this stack in the
                    items list.
                  </span>
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }

  /**
   * Collect all popup modules from the card config for the popup picker dropdown.
   */
  private getPopupModules(config?: UltraCardConfig): Array<{ value: string; label: string }> {
    const popups: Array<{ value: string; label: string }> = [];
    if (!config?.layout?.rows) return popups;

    const collect = (items: any[]): void => {
      if (!items || !Array.isArray(items)) return;
      for (const item of items) {
        if (item.columns && Array.isArray(item.columns)) {
          for (const col of item.columns) {
            if (col.modules) collect(col.modules);
          }
          continue;
        }
        if (item.type === 'popup') {
          const pm = item as PopupModule;
          const name =
            pm.title_text?.trim() ||
            pm.name?.trim() ||
            `Popup (${pm.id.slice(-6)})`;
          popups.push({ value: pm.id, label: name });
        }
        // Recurse into layout containers that can hold modules
        if (item.modules && Array.isArray(item.modules)) {
          collect(item.modules);
        }
      }
    };

    collect(config.layout.rows);
    return popups;
  }

  /**
   * Render the action configuration section for a nav route.
   * Shows a simplified dropdown for nav-specific actions + HA native action selector.
   */
  /**
   * Map a route's effective action type to a simplified category for our dropdown.
   * HA-native actions (toggle, more-info, assist, etc.) map to 'ha-action'.
   */
  private getActionCategory(route: NavRoute): string {
    const action = route.tap_action?.action as string | undefined;
    if (!action || action === 'default') return 'navigate';
    if (action === 'navigate' && !route.tap_action?.navigation_path) return 'navigate';
    if (action === 'url') return 'url';
    if (action === 'open-popup') return 'open-popup';
    if (action === 'toggle') return 'toggle';
    if (action === 'more-info') return 'more-info';
    if (action === 'assist') return 'assist';
    if (action === 'perform-action' || action === 'call-service') return 'perform-action';
    if (action === 'nothing') return 'nothing';
    // Everything else falls back to perform-action UI
    return 'perform-action';
  }

  private renderActionEditor(
    route: NavRoute,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateRoute: (updates: Partial<NavRoute>) => void
  ): TemplateResult {
    const category = this.getActionCategory(route);
    const serviceActionValue = (() => {
      const tapAction = (route.tap_action || {}) as NavActionConfig;
      const service = tapAction.perform_action || tapAction.service || '';
      const data = tapAction.data ?? tapAction.service_data;
      const target = tapAction.target;
      return {
        action: service,
        ...(data ? { data } : {}),
        ...(target ? { target } : {}),
      };
    })();

    const setCategory = (cat: string) => {
      switch (cat) {
        case 'navigate':
          updateRoute({ tap_action: undefined });
          break;
        case 'url':
          updateRoute({ tap_action: { action: 'url', url_path: route.tap_action?.url_path || '' } });
          break;
        case 'open-popup':
          updateRoute({ tap_action: { action: 'open-popup', popup_id: route.tap_action?.popup_id || '' } });
          break;
        case 'toggle':
          updateRoute({
            tap_action: { action: 'toggle', entity: route.tap_action?.entity || '' },
          });
          break;
        case 'more-info':
          updateRoute({
            tap_action: { action: 'more-info', entity: route.tap_action?.entity || '' },
          });
          break;
        case 'assist':
          updateRoute({
            tap_action: {
              action: 'assist',
              pipeline_id: route.tap_action?.pipeline_id,
              start_listening: route.tap_action?.start_listening,
            },
          });
          break;
        case 'perform-action':
          updateRoute({
            tap_action: {
              ...(route.tap_action || {}),
              action: 'perform-action',
            },
          });
          break;
        case 'nothing':
          updateRoute({ tap_action: { action: 'nothing' } });
          break;
      }
    };

    return html`
      <!-- Action Type -->
      <div class="field-container">
        <div class="field-title">Action Type</div>
        <div class="field-description">
          What happens when this icon is tapped.
        </div>
        <ha-select
          style="width: 100%;"
          .value=${category}
          @selected=${(e: any) => {
            e.stopPropagation();
            const nextValue = e.detail?.value ?? e.target?.value;
            if (nextValue) {
              setCategory(nextValue);
            }
          }}
          @closed=${(e: Event) => e.stopPropagation()}
        >
          <mwc-list-item value="navigate">Navigate to Path</mwc-list-item>
          <mwc-list-item value="url">Open External URL</mwc-list-item>
          <mwc-list-item value="open-popup">Open Popup</mwc-list-item>
          <mwc-list-item value="toggle">Toggle Entity</mwc-list-item>
          <mwc-list-item value="more-info">More Info</mwc-list-item>
          <mwc-list-item value="perform-action">Perform Action</mwc-list-item>
          <mwc-list-item value="assist">Assist</mwc-list-item>
          <mwc-list-item value="nothing">No Action</mwc-list-item>
        </ha-select>
      </div>

      <!-- Navigate: Path picker -->
      ${category === 'navigate'
        ? html`
            <div class="field-container">
              <div class="field-title">Path</div>
              <div class="field-description">
                Select a dashboard view, or type a full URL (http/https) to open externally.
              </div>
              <ultra-navigation-picker
                .hass=${hass}
                .value=${route.url || ''}
                label=""
                @value-changed=${(e: CustomEvent) => updateRoute({ url: e.detail.value })}
              ></ultra-navigation-picker>
            </div>
          `
        : ''}

      <!-- URL: Text field -->
      ${category === 'url'
        ? html`
            <div class="field-container">
              <div class="field-title">URL</div>
              <div class="field-description">
                External website to open in a new tab (e.g., https://google.com).
              </div>
              <ha-textfield
                style="width: 100%;"
                .value=${route.tap_action?.url_path || ''}
                placeholder="https://example.com"
                @input=${(e: Event) => {
                  const url = (e.target as HTMLInputElement).value;
                  updateRoute({
                    tap_action: { ...route.tap_action, action: 'url', url_path: url },
                  });
                }}
                @click=${(e: Event) => e.stopPropagation()}
              ></ha-textfield>
            </div>
          `
        : ''}

      <!-- Open Popup: Popup picker -->
      ${category === 'open-popup'
        ? html`
            <div class="field-container">
              <div class="field-title">Popup</div>
              <div class="field-description">
                Select a popup module from this card to open when tapped.
              </div>
              ${(() => {
                const popups = this.getPopupModules(config);
                if (popups.length === 0) {
                  return html`
                    <div
                      class="info-box"
                      style="background: var(--warning-color, orange); color: var(--text-primary-color); padding: 12px; border-radius: 8px;"
                    >
                      No popup modules found. Add a Popup module to this card first.
                    </div>
                  `;
                }
                return html`
                  <ha-select
                    style="width: 100%;"
                    .value=${route.tap_action?.popup_id || ''}
                    @selected=${(e: any) => {
                      e.stopPropagation();
                      updateRoute({
                        tap_action: {
                          ...route.tap_action,
                          action: 'open-popup',
                          popup_id: e.target.value,
                        },
                      });
                    }}
                    @closed=${(e: Event) => e.stopPropagation()}
                  >
                    ${popups.map(
                      p => html`<mwc-list-item value="${p.value}">${p.label}</mwc-list-item>`
                    )}
                  </ha-select>
                `;
              })()}
            </div>
          `
        : ''}

      <!-- Toggle / More Info: Entity picker -->
      ${category === 'toggle' || category === 'more-info'
        ? html`
            <div class="field-container">
              <div class="field-title">Entity</div>
              <div class="field-description">
                ${category === 'toggle'
                  ? 'Select the entity to toggle.'
                  : 'Select the entity to show more info for.'}
              </div>
              <ha-form
                .hass=${hass}
                .data=${{ entity: route.tap_action?.entity || '' }}
                .schema=${[
                  {
                    name: 'entity',
                    selector: { entity: {} },
                  },
                ]}
                .computeLabel=${(schema: any) => schema.label || ''}
                @value-changed=${(e: CustomEvent) => {
                  e.stopPropagation();
                  const entity = e.detail?.value?.entity || '';
                  updateRoute({
                    tap_action: {
                      ...(route.tap_action || {}),
                      action: category as 'toggle' | 'more-info',
                      entity,
                    },
                  });
                }}
              ></ha-form>
            </div>
          `
        : ''}

      <!-- Assist: Pipeline picker -->
      ${category === 'assist'
        ? html`
            <div class="field-container">
              <div class="field-title">Assist</div>
              <div class="field-description">
                Choose the Assist pipeline and whether to start listening.
              </div>
              <ha-form
                .hass=${hass}
                .data=${{
                  pipeline_id: route.tap_action?.pipeline_id,
                  start_listening: route.tap_action?.start_listening ?? false,
                }}
                .schema=${[
                  {
                    name: 'pipeline_id',
                    selector: {
                      assist_pipeline: {
                        include_last_used: true,
                      },
                    },
                  },
                  { name: 'start_listening', selector: { boolean: {} } },
                ]}
                .computeLabel=${(schema: any) => schema.label || ''}
                @value-changed=${(e: CustomEvent) => {
                  e.stopPropagation();
                  const values = e.detail.value || {};
                  updateRoute({
                    tap_action: {
                      ...(route.tap_action || {}),
                      action: 'assist',
                      pipeline_id: values.pipeline_id,
                      start_listening: values.start_listening,
                    },
                  });
                }}
              ></ha-form>
            </div>
          `
        : ''}

      <!-- Perform Action: Service picker -->
      ${category === 'perform-action'
        ? html`
            <div class="nav-action-perform-action">
              <div class="field-container">
                <div class="field-title">Action</div>
                <div class="field-description">
                  Choose the service to call and optional target/data.
                </div>
                <ha-service-control
                  .hass=${hass}
                  .value=${serviceActionValue}
                  @value-changed=${(e: CustomEvent) => {
                    e.stopPropagation();
                    const value = e.detail?.value || {};
                    const nextAction: NavActionConfig = {
                      ...(route.tap_action || {}),
                      action: 'perform-action',
                      perform_action: value.action || '',
                      target: value.target,
                      data: value.data,
                    };
                    if (!value.data) delete (nextAction as any).data;
                    if ((nextAction as any).service_data) delete (nextAction as any).service_data;
                    if ((nextAction as any).service) delete (nextAction as any).service;
                    updateRoute({ tap_action: nextAction });
                  }}
                ></ha-service-control>
              </div>
            </div>
          `
        : ''}
    `;
  }

  private renderNotificationEditor(
    route: NavRoute,
    hass: HomeAssistant,
    updateRoute: (updates: Partial<NavRoute>) => void
  ): TemplateResult {
    const badge = route.badge || {};
    const mode = badge.mode || 'static';

    const updateBadge = (updates: Partial<NavRoute['badge']>) => {
      updateRoute({ badge: { ...badge, ...updates } });
    };

    return html`
      <div class="field-container">
        <div class="field-title">Notification Source</div>
        <div class="field-description">Choose how to determine the notification count.</div>
        <ha-select
          style="width: 100%;"
          .value=${mode}
          @selected=${(e: any) => {
            e.stopPropagation();
            updateBadge({ mode: e.target.value });
          }}
          @closed=${(e: Event) => e.stopPropagation()}
        >
          <mwc-list-item value="static">Static value</mwc-list-item>
          <mwc-list-item value="entity">Entity state</mwc-list-item>
          <mwc-list-item value="template">Template</mwc-list-item>
        </ha-select>
      </div>

      ${mode === 'static'
        ? html`
            <div class="info-box" style="margin-bottom: 12px;">
              <ha-icon icon="mdi:information-outline"></ha-icon>
              <span>Enter a fixed number or text to show in the notification badge.</span>
            </div>
            <div class="field-container">
              <div class="field-title">Count / Text</div>
              <ha-textfield
                style="width: 100%;"
                .value=${badge.count || ''}
                placeholder="5"
                @input=${(e: Event) => updateBadge({ count: (e.target as HTMLInputElement).value })}
                @click=${(e: Event) => e.stopPropagation()}
              ></ha-textfield>
            </div>
          `
        : ''}
      ${mode === 'entity'
        ? html`
            <div class="info-box" style="margin-bottom: 12px;">
              <ha-icon icon="mdi:information-outline"></ha-icon>
              <span
                >Pull the notification count directly from an entity's state or attribute. Great for
                counters, sensors, or any numeric entity.</span
              >
            </div>
            <div class="field-container">
              <div class="field-title">Entity</div>
              <ha-entity-picker
                .hass=${hass}
                .value=${badge.entity || ''}
                @value-changed=${(e: CustomEvent) => updateBadge({ entity: e.detail.value })}
                allow-custom-entity
              ></ha-entity-picker>
            </div>
            <div class="field-container">
              <div class="field-title">Attribute (Optional)</div>
              <div class="field-description">
                Use a specific attribute instead of the entity state.
              </div>
              <ha-textfield
                style="width: 100%;"
                .value=${badge.entity_attribute || ''}
                placeholder="e.g., unread_count"
                @input=${(e: Event) =>
                  updateBadge({ entity_attribute: (e.target as HTMLInputElement).value })}
                @click=${(e: Event) => e.stopPropagation()}
              ></ha-textfield>
            </div>
          `
        : ''}
      ${mode === 'template'
        ? html`
            <div class="info-box" style="margin-bottom: 12px;">
              <ha-icon icon="mdi:information-outline"></ha-icon>
              <span
                >Use a JavaScript template for advanced logic. Access hass, states, and user
                objects. Return a number or string.</span
              >
            </div>
            <div class="field-container">
              <div class="field-title">Count Template</div>
              <div class="field-description">
                Example: return states['sensor.notifications'].state;
              </div>
              <ha-textfield
                style="width: 100%;"
                multiline
                rows="3"
                .value=${badge.count_template || '[[[ return 0; ]]]'}
                placeholder="[[[ return hass.states['sensor.example'].state; ]]]"
                @input=${(e: Event) =>
                  updateBadge({ count_template: (e.target as HTMLInputElement).value })}
                @click=${(e: Event) => e.stopPropagation()}
              ></ha-textfield>
            </div>
          `
        : ''}

      <div class="field-container" style="margin-top: 16px;">
        <div class="field-title">Hide When Zero</div>
        <div class="field-description">Hide the badge when the count is 0 or empty.</div>
        <ha-switch
          .checked=${badge.hide_when_zero ?? true}
          @change=${(e: Event) =>
            updateBadge({ hide_when_zero: (e.target as HTMLInputElement).checked })}
        ></ha-switch>
      </div>

      <div class="entity-fields-grid" style="margin-top: 16px;">
        <div class="field-container">
          <div class="field-title">Badge Color</div>
          <ultra-color-picker
            .value=${badge.color || 'red'}
            @value-changed=${(e: CustomEvent) => updateBadge({ color: e.detail.value })}
          ></ultra-color-picker>
        </div>
        <div class="field-container">
          <div class="field-title">Text Color</div>
          <ultra-color-picker
            .value=${badge.text_color || badge.textColor || '#ffffff'}
            @value-changed=${(e: CustomEvent) =>
              updateBadge({ text_color: e.detail.value, textColor: undefined })}
          ></ultra-color-picker>
        </div>
      </div>
    `;
  }

  private renderBooleanModeSelect(
    mode: 'auto' | 'true' | 'false' | 'template',
    update: (value: boolean | string | undefined) => void
  ) {
    return html`
      <ha-select
        style="width: 100%;"
        .value=${mode}
        @selected=${(e: any) => {
          const nextMode = e.target.value;
          if (nextMode === 'auto') update(undefined);
          if (nextMode === 'true') update(true);
          if (nextMode === 'false') update(false);
          if (nextMode === 'template') update('[[[ return true; ]]]');
        }}
      >
        <mwc-list-item value="auto">Auto</mwc-list-item>
        <mwc-list-item value="true">Always True</mwc-list-item>
        <mwc-list-item value="false">Always False</mwc-list-item>
        <mwc-list-item value="template">JS Template</mwc-list-item>
      </ha-select>
    `;
  }

  private getBooleanMode(
    value: boolean | string | undefined
  ): 'auto' | 'true' | 'false' | 'template' {
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (typeof value === 'string') {
      return 'template';
    }
    return 'auto';
  }

  private getHapticConfig(navModule: NavigationModule) {
    if (navModule.nav_haptic === true) {
      return {
        url: false,
        tap_action: true,
        hold_action: true,
        double_tap_action: true,
      };
    }
    if (navModule.nav_haptic === false || !navModule.nav_haptic) {
      return {
        url: false,
        tap_action: true,
        hold_action: true,
        double_tap_action: true,
      };
    }
    return navModule.nav_haptic;
  }

  private getEditorStyles(): string {
    return `
      .module-settings {
        padding-bottom: 24px;
      }
      .settings-section {
        background: var(--secondary-background-color);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 24px;
      }
      .section-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--primary-color);
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .section-description {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 20px;
        line-height: 1.4;
      }
      .info-box {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        background: rgba(var(--rgb-info-color), 0.1);
        border-radius: 8px;
        border-left: 4px solid var(--info-color);
        font-size: 13px;
        color: var(--primary-text-color);
      }
      .info-box ha-icon {
        color: var(--info-color);
        --mdc-icon-size: 20px;
      }
      .add-entity-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 12px;
        border: 1px dashed var(--primary-color);
        border-radius: 10px;
        background: none;
        color: var(--primary-color);
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s;
      }
      .add-entity-btn:hover {
        background: rgba(var(--rgb-primary-color), 0.08);
      }
      .routes-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
      }
      .entity-row {
        border: 1px solid var(--divider-color);
        border-radius: 10px;
        background: var(--card-background-color);
        overflow: hidden;
        transition: all 0.2s;
      }
      .entity-row:hover {
        border-color: var(--primary-color);
      }
      .entity-row.expanded {
        border-color: var(--primary-color);
        box-shadow: 0 4px 12px rgba(var(--rgb-primary-color), 0.15);
      }
      .entity-row.dragging {
        opacity: 0.5;
        border: 2px dashed var(--primary-color);
      }
      .entity-row.drag-over {
        border: 2px solid var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.05);
      }
      .entity-row.stack-child-row {
        background: rgba(var(--rgb-accent-color, var(--rgb-primary-color)), 0.03);
      }
      .entity-row.stack-child-row:hover {
        border-color: var(--accent-color);
      }
      .stack-drop-zone.drag-over {
        background: rgba(var(--rgb-accent-color, var(--rgb-primary-color)), 0.15) !important;
        color: var(--accent-color) !important;
        font-weight: 600;
        border-top-color: var(--accent-color) !important;
      }
      .entity-row.special-item {
        border-left: 3px solid var(--primary-color);
      }
      .special-badge {
        font-size: 10px;
        padding: 2px 8px;
        background: rgba(var(--rgb-primary-color), 0.15);
        color: var(--primary-color);
        border-radius: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      .entity-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 14px;
        cursor: pointer;
        user-select: none;
        gap: 8px;
      }
      .drag-handle {
        cursor: grab;
        padding: 4px;
        display: flex;
        align-items: center;
        opacity: 0.5;
        transition: opacity 0.2s;
      }
      .drag-handle:hover {
        opacity: 1;
      }
      .drag-handle:active {
        cursor: grabbing;
      }
      .entity-info {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
      }
      .entity-icon {
        --mdc-icon-size: 22px;
        color: var(--primary-color);
        flex-shrink: 0;
      }
      .entity-name {
        font-weight: 600;
        font-size: 14px;
        color: var(--primary-text-color);
      }
      .entity-detail {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-left: 8px;
      }
      .entity-actions {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }
      .entity-action-btn {
        border: none;
        background: none;
        padding: 6px;
        cursor: pointer;
        border-radius: 6px;
        color: var(--secondary-text-color);
        transition: all 0.2s;
      }
      .entity-action-btn:hover {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }
      .entity-action-btn.delete:hover {
        color: var(--error-color);
      }
      .entity-action-btn.duplicate:hover {
        color: var(--accent-color);
      }
      .expand-icon {
        --mdc-icon-size: 20px;
        color: var(--secondary-text-color);
        transition: transform 0.2s;
      }
      .entity-row.expanded .expand-icon {
        transform: rotate(180deg);
      }
      .entity-expanded {
        padding: 16px;
        border-top: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
      }
      .entity-field-group {
        margin-bottom: 20px;
      }
      .entity-field-group:last-child {
        margin-bottom: 0;
      }
      .field-group-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--divider-color);
      }
      .entity-fields-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }
      .field-container {
        margin-bottom: 12px;
      }
      /* Perform Action: hide HA action type dropdown and show only action fields */
      .nav-action-perform-action ha-selector-ui-action ha-select,
      .nav-action-perform-action ha-form .label,
      .nav-action-perform-action ha-form label,
      .nav-action-perform-action ha-form .mdc-floating-label,
      .nav-action-perform-action ha-selector-ui-action::part(select),
      .nav-action-perform-action ha-selector-ui-action::part(action) {
        display: none;
      }
      .nav-action-perform-action ha-selector-ui-action {
        margin-top: 0;
      }
      .field-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-text-color);
        margin-bottom: 6px;
      }
      .field-description {
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.4;
        margin-bottom: 8px;
      }
      .compact-item-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        margin-bottom: 8px;
        background: var(--card-background-color);
      }
      .color-field {
        margin-bottom: 16px;
      }
    `;
  }
}
