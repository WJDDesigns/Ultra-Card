import { TemplateResult, html } from 'lit';
import { ref, createRef, Ref } from 'lit/directives/ref.js';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, MapModule, MapMarker, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';
import { getImageUrl } from '../utils/image-upload';
import { SENSITIVE_PLACEHOLDER } from '../utils/uc-config-encoder';
import * as L from 'leaflet';

export class UltraMapModule extends BaseUltraModule {
  private mapInstances: Map<string, L.Map> = new Map();
  private initializingMaps: Set<string> = new Set();
  private markersGroup: Map<string, L.Marker> = new Map();
  private entityStateCache: Map<string, string> = new Map();
  private lastUpdateTime: Map<string, number> = new Map();
  private mapResizeObservers: Map<string, ResizeObserver> = new Map();

  metadata: ModuleMetadata = {
    type: 'map',
    title: 'Map',
    description: 'Interactive map with custom markers and location tracking',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:map',
    category: 'content',
    tags: ['map', 'location', 'tracking', 'markers', 'gps'],
  };

  createDefault(id?: string, hass?: HomeAssistant): MapModule {
    return {
      id: id || this.generateId('map'),
      type: 'map',
      map_provider: 'openstreetmap', // Always use Leaflet with OSM
      map_type: 'roadmap',
      zoom: 14,
      show_map_controls: true,
      disable_zoom_scroll: false,
      disable_touch_drag: false,
      auto_zoom_entities: false,
      markers: [
        {
          id: this.generateId('marker'),
          name: 'My Location',
          type: 'manual',
          latitude: 37.2384841,
          longitude: -115.8250479,
          icon: 'mdi:alien',
          icon_color: 'var(--primary-color)',
          icon_size: 20, // Default icon size
          marker_image_type: 'icon',
        },
      ],
      map_height: 400,
      aspect_ratio: '16:9',
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  // Track map instances for cleanup - already declared at class level

  // Track expanded markers (similar to light module presets)
  private expandedMarkers: Set<string> = new Set();
  private draggedMarkerIndex: number | null = null;

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const mapModule = module as MapModule;
    const lang = hass?.locale?.language || 'en';

    const mapProviderOptions = [
      {
        value: 'openstreetmap',
        label: localize('editor.map.provider.osm', lang, 'OpenStreetMap (Free)'),
      },
      { value: 'google', label: localize('editor.map.provider.google', lang, 'Google Maps') },
    ];

    // Map style options based on provider
    const googleMapTypeOptions = [
      { value: 'roadmap', label: localize('editor.map.type.roadmap', lang, 'Roadmap') },
      { value: 'satellite', label: localize('editor.map.type.satellite', lang, 'Satellite') },
      { value: 'hybrid', label: localize('editor.map.type.hybrid', lang, 'Hybrid') },
      { value: 'terrain', label: localize('editor.map.type.terrain', lang, 'Terrain') },
    ];

    const osmMapTypeOptions = [
      { value: 'roadmap', label: localize('editor.map.type.osm_standard', lang, 'Standard') },
      { value: 'cycle', label: localize('editor.map.type.osm_cycle', lang, 'Cycle Map') },
      { value: 'transport', label: localize('editor.map.type.osm_transport', lang, 'Transport') },
      {
        value: 'humanitarian',
        label: localize('editor.map.type.osm_humanitarian', lang, 'Humanitarian'),
      },
    ];

    const mapTypeOptions =
      mapModule.map_provider === 'google' ? googleMapTypeOptions : osmMapTypeOptions;

    const aspectRatioOptions = [
      { value: '16:9', label: '16:9 (Widescreen)' },
      { value: '4:3', label: '4:3 (Standard)' },
      { value: '1:1', label: '1:1 (Square)' },
      { value: 'custom', label: 'Custom (Use Height)' },
    ];

    const addMarker = () => {
      const newMarker: MapMarker = {
        id: this.generateId('marker'),
        name: 'New Marker',
        type: 'manual',
        latitude: 37.2384841,
        longitude: -115.8250479,
        icon: 'mdi:alien',
        icon_color: 'var(--primary-color)',
        icon_size: 20, // Default icon size
        marker_image_type: 'icon',
      };
      const newMarkers = [...(mapModule.markers || []), newMarker];
      updateModule({ markers: newMarkers });
    };

    return html`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        <!-- Map Provider Selection -->
        ${this.renderSettingsSection(
          localize('editor.map.provider.title', lang, 'Map Provider'),
          localize('editor.map.provider.desc', lang, 'Choose your map provider'),
          [
            {
              title: localize('editor.map.provider.select', lang, 'Map Provider'),
              description: localize(
                'editor.map.provider.select_desc',
                lang,
                'OpenStreetMap is free and requires no API key. Google Maps offers more features but requires an API key.'
              ),
              hass,
              data: { map_provider: mapModule.map_provider || 'openstreetmap' },
              schema: [this.selectField('map_provider', mapProviderOptions)],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.map_provider;
                const prev = mapModule.map_provider || 'openstreetmap';
                if (next === prev) return;
                updateModule(e.detail.value);
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}

        <!-- Google Maps API Key (only for Google Maps) -->
        ${mapModule.map_provider === 'google'
          ? html`
              <div
                style="margin-bottom: 24px; padding: 16px; background: rgba(var(--rgb-primary-color), 0.05); border-left: 3px solid var(--primary-color); border-radius: 4px;"
              >
                <div
                  style="font-weight: 600; margin-bottom: 12px; color: var(--primary-text-color);"
                >
                  ${localize('editor.map.google_api_key', lang, 'Google Maps API Key (Optional)')}
                </div>
                <div
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                >
                  ${localize(
                    'editor.map.google_api_key_desc',
                    lang,
                    'Enter your Google Maps API key for full JavaScript API features. Without a key, basic tile layers are used (limited features).'
                  )}
                </div>
                <ha-textfield
                  .value=${mapModule.google_api_key || ''}
                  placeholder="AIzaSy..."
                  type="password"
                  @input=${(e: Event) => {
                    const value = (e.target as any).value;
                    updateModule({ google_api_key: value });
                  }}
                  style="width: 100%;"
                >
                  <ha-icon icon="mdi:key" slot="leadingIcon"></ha-icon>
                </ha-textfield>
                <div
                  style="font-size: 12px; margin-top: 8px; color: var(--secondary-text-color); opacity: 0.7;"
                >
                  <a
                    href="https://developers.google.com/maps/documentation/javascript/get-api-key"
                    target="_blank"
                    style="color: var(--primary-color); text-decoration: none;"
                  >
                    ${localize(
                      'editor.map.how_to_get_api_key',
                      lang,
                      'How to get a Google Maps API Key →'
                    )}
                  </a>
                </div>
              </div>
            `
          : ''}

        <!-- Map Style Selection -->
        ${this.renderSettingsSection(
          localize('editor.map.style.title', lang, 'Map Style'),
          localize('editor.map.style.desc', lang, 'Choose the visual style of the map'),
          [
            {
              title: localize('editor.map.style.select', lang, 'Map Style'),
              description: localize(
                'editor.map.style.select_desc',
                lang,
                mapModule.map_provider === 'google'
                  ? 'Choose the visual style for Google Maps'
                  : 'OpenStreetMap uses standard roadmap style'
              ),
              hass,
              data: { map_type: mapModule.map_type || 'roadmap' },
              schema: [this.selectField('map_type', mapTypeOptions)],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.map_type;
                const prev = mapModule.map_type || 'roadmap';
                if (next === prev) return;
                updateModule(e.detail.value);
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}

        <!-- Zoom Settings -->
        ${this.renderSettingsSection(
          localize('editor.map.zoom.title', lang, 'Zoom Settings'),
          localize('editor.map.zoom.desc', lang, 'Control map zoom level and auto-fit behavior'),
          [
            {
              title: localize('editor.map.zoom.level', lang, 'Zoom Level'),
              description: localize(
                'editor.map.zoom.level_desc',
                lang,
                'Manual zoom level (1-20). Lower values show more area.'
              ),
              hass,
              data: { zoom: mapModule.zoom || 14 },
              schema: [
                {
                  name: 'zoom',
                  label: `${localize('editor.map.zoom.level', lang, 'Zoom Level')}: ${mapModule.zoom || 14}`,
                  selector: {
                    number: {
                      min: 1,
                      max: 20,
                      step: 1,
                      mode: 'slider',
                    },
                  },
                },
              ],
              onChange: (e: CustomEvent) => {
                updateModule({ zoom: e.detail.value.zoom });
                // Trigger preview update to immediately reflect zoom changes
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
            {
              title: localize('editor.map.zoom.auto', lang, 'Auto-Zoom to Fit Entities'),
              description: localize(
                'editor.map.zoom.auto_desc',
                lang,
                'Automatically calculate zoom and center to show all entity markers. Manual zoom acts as a maximum zoom level (you can zoom out further for context).'
              ),
              hass,
              data: { auto_zoom_entities: mapModule.auto_zoom_entities || false },
              schema: [this.booleanField('auto_zoom_entities')],
              onChange: (e: CustomEvent) => {
                updateModule({ auto_zoom_entities: e.detail.value.auto_zoom_entities });
                // Trigger preview update to immediately reflect zoom changes
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}

        <!-- Manual Center Coordinates -->
        ${this.renderSettingsSection(
          localize('editor.map.center.title', lang, 'Map Center'),
          localize(
            'editor.map.center.desc',
            lang,
            'Manually set the map center coordinates. Leave empty to use first marker or auto-zoom.'
          ),
          [
            {
              title: localize('editor.map.center.latitude', lang, 'Center Latitude'),
              description: localize(
                'editor.map.center.latitude_desc',
                lang,
                'Latitude coordinate for map center (-90 to 90)'
              ),
              hass,
              data: { manual_center_latitude: mapModule.manual_center_latitude ?? null },
              schema: [
                {
                  name: 'manual_center_latitude',
                  label: localize('editor.map.center.latitude', lang, 'Center Latitude'),
                  selector: {
                    number: {
                      min: -90,
                      max: 90,
                      step: 0.000001,
                      mode: 'box',
                    },
                  },
                },
              ],
              onChange: (e: CustomEvent) => {
                const lat = e.detail.value.manual_center_latitude;
                updateModule({ manual_center_latitude: lat || undefined });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
            {
              title: localize('editor.map.center.longitude', lang, 'Center Longitude'),
              description: localize(
                'editor.map.center.longitude_desc',
                lang,
                'Longitude coordinate for map center (-180 to 180)'
              ),
              hass,
              data: { manual_center_longitude: mapModule.manual_center_longitude ?? null },
              schema: [
                {
                  name: 'manual_center_longitude',
                  label: localize('editor.map.center.longitude', lang, 'Center Longitude'),
                  selector: {
                    number: {
                      min: -180,
                      max: 180,
                      step: 0.000001,
                      mode: 'box',
                    },
                  },
                },
              ],
              onChange: (e: CustomEvent) => {
                const lon = e.detail.value.manual_center_longitude;
                updateModule({ manual_center_longitude: lon || undefined });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}

        <!-- Map Controls -->
        ${this.renderSettingsSection(
          localize('editor.map.controls.title', lang, 'Map Controls'),
          localize('editor.map.controls.desc', lang, 'Configure map interaction controls'),
          [
            {
              title: localize('editor.map.controls.show', lang, 'Show Map Controls'),
              description: localize(
                'editor.map.controls.show_desc',
                lang,
                'Display zoom, pan, and other map controls'
              ),
              hass,
              data: { show_map_controls: mapModule.show_map_controls ?? true },
              schema: [this.booleanField('show_map_controls')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_map_controls: e.detail.value.show_map_controls }),
            },
            {
              title: localize(
                'editor.map.controls.disable_scroll',
                lang,
                'Disable Zoom on Mouse Wheel Scroll'
              ),
              description: localize(
                'editor.map.controls.disable_scroll_desc',
                lang,
                'Prevent accidental zooming when scrolling the page'
              ),
              hass,
              data: { disable_zoom_scroll: mapModule.disable_zoom_scroll || false },
              schema: [this.booleanField('disable_zoom_scroll')],
              onChange: (e: CustomEvent) =>
                updateModule({ disable_zoom_scroll: e.detail.value.disable_zoom_scroll }),
            },
            {
              title: localize(
                'editor.map.controls.disable_drag',
                lang,
                'Disable Dragging on Touch Screens'
              ),
              description: localize(
                'editor.map.controls.disable_drag_desc',
                lang,
                'Prevent map panning on mobile/touch devices'
              ),
              hass,
              data: { disable_touch_drag: mapModule.disable_touch_drag || false },
              schema: [this.booleanField('disable_touch_drag')],
              onChange: (e: CustomEvent) =>
                updateModule({ disable_touch_drag: e.detail.value.disable_touch_drag }),
            },
          ]
        )}

        <!-- Map Dimensions -->
        ${this.renderSettingsSection(
          localize('editor.map.dimensions.title', lang, 'Map Dimensions'),
          localize('editor.map.dimensions.desc', lang, 'Control map size and aspect ratio'),
          [
            {
              title: localize('editor.map.dimensions.aspect_ratio', lang, 'Aspect Ratio'),
              description: localize(
                'editor.map.dimensions.aspect_ratio_desc',
                lang,
                'Choose preset aspect ratio or use custom height'
              ),
              hass,
              data: { aspect_ratio: mapModule.aspect_ratio || '16:9' },
              schema: [this.selectField('aspect_ratio', aspectRatioOptions)],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.aspect_ratio;
                const prev = mapModule.aspect_ratio || '16:9';
                if (next === prev) return;
                updateModule(e.detail.value);
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
            ...(mapModule.aspect_ratio === 'custom'
              ? [
                  {
                    title: localize('editor.map.dimensions.height', lang, 'Map Height'),
                    description: localize(
                      'editor.map.dimensions.height_desc',
                      lang,
                      'Custom height in pixels'
                    ),
                    hass,
                    data: { map_height: mapModule.map_height || 400 },
                    schema: [
                      {
                        name: 'map_height',
                        label: localize('editor.map.dimensions.height', lang, 'Map Height'),
                        selector: {
                          number: {
                            min: 100,
                            max: 1000,
                            step: 10,
                            mode: 'box',
                            unit_of_measurement: 'px',
                          },
                        },
                      },
                    ],
                    onChange: (e: CustomEvent) =>
                      updateModule({ map_height: e.detail.value.map_height }),
                  },
                ]
              : []),
          ]
        )}

        <!-- Markers Section -->
        <div
          style="margin-top: 32px; padding-top: 24px; border-top: 2px solid var(--divider-color);"
        >
          <div style="margin-bottom: 24px;">
            <div
              style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;"
            >
              <div>
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">
                  ${localize('editor.map.markers.title', lang, 'Map Markers')}
                </div>
                <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
                  ${localize(
                    'editor.map.markers.desc',
                    lang,
                    'Add custom markers or track entities with location data'
                  )}
                </div>
              </div>
              <mwc-button
                raised
                @click=${addMarker}
                style="--mdc-theme-primary: var(--primary-color);"
              >
                <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
                ${localize('editor.map.markers.add', lang, 'Add Marker')}
              </mwc-button>
            </div>
          </div>

          ${(mapModule.markers || []).length === 0
            ? html`
                <div
                  style="text-align: center; padding: 48px 16px; color: var(--secondary-text-color); background: var(--secondary-background-color); border-radius: 8px; border: 2px dashed var(--divider-color);"
                >
                  <ha-icon
                    icon="mdi:map-marker-question"
                    style="font-size: 48px; opacity: 0.3; display: block; margin: 0 auto 16px;"
                  ></ha-icon>
                  <div style="font-size: 16px; margin-bottom: 8px;">
                    ${localize('editor.map.markers.empty', lang, 'No markers added yet')}
                  </div>
                  <div style="font-size: 13px; opacity: 0.7;">
                    ${localize(
                      'editor.map.markers.empty_desc',
                      lang,
                      'Click "Add Marker" to create your first map marker'
                    )}
                  </div>
                </div>
              `
            : html`
                <div class="markers-list">
                  ${(mapModule.markers || []).map((marker, index) =>
                    this.renderMarkerEditor(marker, index, mapModule, hass, updateModule, config)
                  )}
                </div>
              `}
        </div>
      </div>
    `;
  }

  private renderMarkerEditor(
    marker: MapMarker,
    index: number,
    mapModule: MapModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    config?: UltraCardConfig
  ): TemplateResult {
    const lang = hass?.locale?.language || 'en';

    const updateMarker = (updates: Partial<MapMarker>) => {
      const hasChanges = Object.entries(updates).some(([key, value]) => {
        const currentValue = (marker as any)[key];
        if (currentValue === value) {
          return false;
        }
        if (typeof currentValue === 'number' && typeof value === 'number') {
          if (Number.isNaN(currentValue) && Number.isNaN(value)) {
            return false;
          }
          return currentValue !== value;
        }
        return true;
      });

      if (!hasChanges) {
        return;
      }

      const newMarkers = [...(mapModule.markers || [])];
      newMarkers[index] = { ...marker, ...updates };

      const shouldDelay =
        Object.keys(updates).length === 1 &&
        Object.prototype.hasOwnProperty.call(updates, 'icon_size');

      const commitUpdate = () => {
        updateModule({ markers: newMarkers });

        // Always kick the preview so Leaflet map regenerates markers and bounds
        setTimeout(() => this.triggerPreviewUpdate(), 50);
      };

      if (shouldDelay) {
        setTimeout(commitUpdate, 50);
      } else {
        commitUpdate();
      }
    };

    const deleteMarker = () => {
      const newMarkers = [...(mapModule.markers || [])];
      newMarkers.splice(index, 1);
      updateModule({ markers: newMarkers });
    };

    const duplicateMarker = () => {
      const newMarker = {
        ...marker,
        id: this.generateId('marker'),
        name: `${marker.name} Copy`,
      };
      const newMarkers = [...(mapModule.markers || []), newMarker];
      updateModule({ markers: newMarkers });
    };

    const moveMarker = (fromIndex: number, toIndex: number) => {
      const newMarkers = [...(mapModule.markers || [])];
      const [movedMarker] = newMarkers.splice(fromIndex, 1);
      newMarkers.splice(toIndex, 0, movedMarker);
      updateModule({ markers: newMarkers });
    };

    const markerTypeOptions = [
      {
        value: 'manual',
        label: localize('editor.map.marker.type.manual', lang, 'Manual Position'),
      },
      { value: 'entity', label: localize('editor.map.marker.type.entity', lang, 'Entity Tracker') },
    ];

    const markerDisplayOptions = [
      { value: 'icon', label: localize('editor.map.marker.display.icon', lang, 'Icon') },
      {
        value: 'custom_image',
        label: localize('editor.map.marker.display.custom_image', lang, 'Custom Image'),
      },
      {
        value: 'entity_image',
        label: localize('editor.map.marker.display.entity_image', lang, 'Entity Image'),
      },
    ];

    return html`
      <div
        class="marker-item"
        style="margin-bottom: 24px; background: var(--secondary-background-color); border-radius: 8px; border: 1px solid var(--divider-color); overflow: hidden;"
        data-marker-id="${marker.id}"
        data-marker-index="${index}"
        @dragover=${(e: DragEvent) => this.handleMarkerDragOver(e)}
        @dragenter=${(e: DragEvent) => this.handleMarkerDragEnter(e)}
        @dragleave=${(e: DragEvent) => this.handleMarkerDragLeave(e)}
        @drop=${(e: DragEvent) => this.handleMarkerDrop(e, index, moveMarker)}
      >
        <div
          class="marker-header"
          style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(var(--rgb-primary-color), 0.05); border-bottom: 1px solid var(--divider-color); cursor: pointer;"
          @click=${(e: Event) => this.toggleMarkerHeader(e)}
        >
          <div style="display: flex; align-items: center; gap: 12px;">
            <div
              class="drag-handle"
              style="padding: 8px; margin: -8px; cursor: grab; border-radius: 4px; transition: background-color 0.2s ease;"
              draggable="true"
              @dragstart=${(e: DragEvent) => this.handleMarkerDragStart(e, index)}
              @dragend=${(e: DragEvent) => this.handleMarkerDragEnd(e)}
              @click=${(e: Event) => e.stopPropagation()}
              @mousedown=${(e: Event) => e.stopPropagation()}
              .title=${localize('editor.map.marker.drag', lang, 'Drag to reorder')}
              @mouseenter=${(e: Event) => {
                const target = e.target as HTMLElement;
                target.style.backgroundColor = 'rgba(var(--rgb-primary-color), 0.1)';
              }}
              @mouseleave=${(e: Event) => {
                const target = e.target as HTMLElement;
                target.style.backgroundColor = 'transparent';
              }}
            >
              <ha-icon
                icon="mdi:drag"
                style="color: var(--secondary-text-color); pointer-events: none;"
              ></ha-icon>
            </div>
            <div style="font-weight: 600; color: var(--primary-text-color);">
              ${marker.name || `Marker ${index + 1}`}
            </div>
            ${marker.type === 'entity'
              ? html`<ha-icon
                  icon="mdi:map-marker-account"
                  style="color: var(--primary-color);"
                ></ha-icon>`
              : html`<ha-icon
                  icon="mdi:map-marker"
                  style="color: var(--primary-color);"
                ></ha-icon>`}
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <ha-icon-button
              @click=${(e: Event) => {
                e.stopPropagation();
                duplicateMarker();
              }}
              .title=${localize('editor.map.marker.duplicate', lang, 'Duplicate marker')}
            >
              <ha-icon icon="mdi:content-duplicate"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              @click=${(e: Event) => {
                e.stopPropagation();
                deleteMarker();
              }}
              .title=${localize('editor.map.marker.delete', lang, 'Delete marker')}
              .disabled=${(mapModule.markers || []).length <= 1}
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </ha-icon-button>
            <ha-icon
              class="expand-caret"
              icon="mdi:chevron-down"
              style="color: var(--secondary-text-color); transition: transform 0.2s ease; transform: ${this.expandedMarkers.has(
                marker.id
              )
                ? 'rotate(180deg)'
                : 'rotate(0deg)'}; cursor: pointer; padding: 8px; margin: -8px;"
              @click=${(e: Event) => {
                e.stopPropagation();
                const caret = e.target as HTMLElement;
                const card = caret.closest('.marker-item') as HTMLElement;
                const content = card?.querySelector('.marker-content') as HTMLElement;

                if (card && content && caret) {
                  const id = card.getAttribute('data-marker-id') || '';
                  if (this.expandedMarkers.has(id)) {
                    this.expandedMarkers.delete(id);
                    content.style.display = 'none';
                    caret.style.transform = 'rotate(0deg)';
                  } else {
                    this.expandedMarkers.add(id);
                    content.style.display = 'block';
                    caret.style.transform = 'rotate(180deg)';
                  }
                }
              }}
            ></ha-icon>
          </div>
        </div>

        <div
          class="marker-content"
          style="padding: 16px; display: ${this.expandedMarkers.has(marker.id) ? 'block' : 'none'};"
        >
          ${this.renderMarkerConfiguration(marker, hass, updateMarker, mapModule, config)}
        </div>
      </div>
    `;
  }

  private renderMarkerConfiguration(
    marker: MapMarker,
    hass: HomeAssistant,
    updateMarker: (updates: Partial<MapMarker>) => void,
    mapModule: MapModule,
    config?: UltraCardConfig
  ): TemplateResult {
    const lang = hass?.locale?.language || 'en';

    const markerTypeOptions = [
      {
        value: 'manual',
        label: localize('editor.map.marker.type.manual', lang, 'Manual Position'),
      },
      { value: 'entity', label: localize('editor.map.marker.type.entity', lang, 'Entity Tracker') },
    ];

    const markerDisplayOptions = [
      { value: 'icon', label: localize('editor.map.marker.display.icon', lang, 'Icon') },
      {
        value: 'custom_image',
        label: localize('editor.map.marker.display.custom_image', lang, 'Custom Image'),
      },
      {
        value: 'entity_image',
        label: localize('editor.map.marker.display.entity_image', lang, 'Entity Image'),
      },
    ];

    return html`
      <!-- Marker Name -->
      <div class="field-group" style="margin-bottom: 16px;">
        <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
          ${localize('editor.map.marker.name', lang, 'Marker Name')}
        </div>
        <div
          class="field-description"
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
        >
          ${localize('editor.map.marker.name_desc', lang, 'Display name for this marker')}
        </div>
        <ha-textfield
          .value=${marker.name || ''}
          placeholder=${localize('editor.map.marker.name_placeholder', lang, 'Enter marker name')}
          @input=${(e: Event) => {
            const target = e.target as any;
            const input = target.shadowRoot?.querySelector('input') || target;
            const value = target.value;
            const cursorPosition = input.selectionStart;
            const cursorEnd = input.selectionEnd;

            updateMarker({ name: value });

            requestAnimationFrame(() => {
              if (input && typeof cursorPosition === 'number') {
                target.value = value;
                input.value = value;
                input.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
              }
            });
          }}
          style="width: 100%;"
        ></ha-textfield>
      </div>

      <!-- Marker Type -->
      <div class="field-group" style="margin-bottom: 16px;">
        <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
          ${localize('editor.map.marker.type_label', lang, 'Marker Type')}
        </div>
        <div
          class="field-description"
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
        >
          ${localize('editor.map.marker.type_desc', lang, 'Choose marker position source')}
        </div>
        ${this.renderUcForm(
          hass,
          { type: marker.type || 'manual' },
          [this.selectField('type', markerTypeOptions)],
          (e: CustomEvent) => {
            const nextType = e.detail.value.type;
            const currentType = marker.type || 'manual';
            if (!nextType || nextType === currentType) {
              return;
            }
            updateMarker({ type: nextType });
          },
          false
        )}
      </div>

      <!-- Manual Position Fields -->
      ${marker.type === 'manual'
        ? html`
            <div
              class="field-group"
              style="margin-bottom: 16px; padding: 16px; background: rgba(var(--rgb-primary-color), 0.05); border-left: 3px solid var(--primary-color); border-radius: 4px;"
            >
              <div style="font-weight: 600; margin-bottom: 12px; color: var(--primary-text-color);">
                ${localize('editor.map.marker.manual_position', lang, 'Manual Position')}
              </div>

              <!-- Latitude -->
              <div style="margin-bottom: 12px;">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 500; margin-bottom: 4px;"
                >
                  ${localize('editor.map.marker.latitude', lang, 'Latitude')}
                </div>
                <ha-textfield
                  .value=${marker.latitude?.toString() || ''}
                  type="number"
                  inputmode="decimal"
                  min="-90"
                  max="90"
                  step="any"
                  placeholder="40.7128"
                  @input=${(e: Event) => {
                    const value = parseFloat((e.target as any).value);
                    if (!isNaN(value)) {
                      updateMarker({ latitude: value });
                    }
                  }}
                  style="width: 100%;"
                >
                  <span slot="suffix">°</span>
                </ha-textfield>
                <div
                  style="font-size: 11px; color: var(--secondary-text-color); margin-top: 4px; opacity: 0.7;"
                >
                  ${localize('editor.map.marker.latitude_range', lang, 'Range: -90 to 90')}
                </div>
              </div>

              <!-- Longitude -->
              <div>
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 500; margin-bottom: 4px;"
                >
                  ${localize('editor.map.marker.longitude', lang, 'Longitude')}
                </div>
                <ha-textfield
                  .value=${marker.longitude?.toString() || ''}
                  type="number"
                  inputmode="decimal"
                  min="-180"
                  max="180"
                  step="any"
                  placeholder="-74.006"
                  @input=${(e: Event) => {
                    const value = parseFloat((e.target as any).value);
                    if (!isNaN(value)) {
                      updateMarker({ longitude: value });
                    }
                  }}
                  style="width: 100%;"
                >
                  <span slot="suffix">°</span>
                </ha-textfield>
                <div
                  style="font-size: 11px; color: var(--secondary-text-color); margin-top: 4px; opacity: 0.7;"
                >
                  ${localize('editor.map.marker.longitude_range', lang, 'Range: -180 to 180')}
                </div>
              </div>
            </div>
          `
        : ''}

      <!-- Entity Tracker Field -->
      ${marker.type === 'entity'
        ? html`
            <div
              class="field-group"
              style="margin-bottom: 16px; padding: 16px; background: rgba(var(--rgb-primary-color), 0.05); border-left: 3px solid var(--primary-color); border-radius: 4px;"
            >
              <div style="font-weight: 600; margin-bottom: 12px; color: var(--primary-text-color);">
                ${localize('editor.map.marker.entity_tracker', lang, 'Entity Tracker')}
              </div>
              ${this.renderSettingsSection('', '', [
                {
                  title: localize('editor.map.marker.entity', lang, 'Entity'),
                  description: localize(
                    'editor.map.marker.entity_desc',
                    lang,
                    'Select a device_tracker, person, or any entity with location data'
                  ),
                  hass,
                  data: { entity: marker.entity || '' },
                  schema: [
                    {
                      name: 'entity',
                      selector: {
                        entity: {
                          domain: ['device_tracker', 'person', 'zone'],
                        },
                      },
                    },
                  ],
                  onChange: (e: CustomEvent) => {
                    updateMarker({ entity: e.detail.value.entity });
                  },
                },
              ])}
            </div>
          `
        : ''}

      <!-- Visual Settings -->
      <div class="field-group" style="margin-bottom: 16px;">
        <div
          style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: var(--primary-text-color);"
        >
          ${localize('editor.map.marker.visual', lang, 'Visual Settings')}
        </div>

        <!-- Marker Display Type -->
        <div style="margin-bottom: 16px;">
          <div class="field-title" style="font-size: 14px; font-weight: 500; margin-bottom: 4px;">
            ${localize('editor.map.marker.display_type', lang, 'Marker Display Type')}
          </div>
          <div
            class="field-description"
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.map.marker.display_type_desc',
              lang,
              'Choose how the marker appears'
            )}
          </div>
          ${this.renderUcForm(
            hass,
            { marker_image_type: marker.marker_image_type || 'icon' },
            [this.selectField('marker_image_type', markerDisplayOptions)],
            (e: CustomEvent) =>
              updateMarker({ marker_image_type: e.detail.value.marker_image_type }),
            false
          )}
        </div>

        <!-- Icon Settings -->
        ${marker.marker_image_type === 'icon' || !marker.marker_image_type
          ? html`
              <div style="margin-top: 16px;">
                <div style="margin-bottom: 12px;">
                  <div
                    class="field-title"
                    style="font-size: 14px; font-weight: 500; margin-bottom: 4px;"
                  >
                    ${localize('editor.map.marker.icon', lang, 'Marker Icon')}
                  </div>
                  <div
                    style="font-size: 11px; color: var(--secondary-text-color); margin-bottom: 8px; opacity: 0.7;"
                  >
                    ${localize(
                      'editor.map.marker.icon_optional',
                      lang,
                      'Optional - Leave empty for solid color teardrop'
                    )}
                  </div>
                  <ha-icon-picker
                    .hass=${hass}
                    .value=${marker.icon || ''}
                    @value-changed=${(e: CustomEvent) => {
                      updateMarker({ icon: e.detail.value });
                    }}
                  ></ha-icon-picker>
                </div>

                <div style="margin-bottom: 12px;">
                  <div
                    class="field-title"
                    style="font-size: 14px; font-weight: 500; margin-bottom: 4px;"
                  >
                    ${localize('editor.map.marker.icon_color', lang, 'Icon Color')}
                  </div>
                  <ultra-color-picker
                    .value=${marker.icon_color || 'var(--primary-color)'}
                    @value-changed=${(e: CustomEvent) => {
                      updateMarker({ icon_color: e.detail.value });
                    }}
                  ></ultra-color-picker>
                </div>

                <div>
                  <div
                    class="field-title"
                    style="font-size: 14px; font-weight: 500; margin-bottom: 4px;"
                  >
                    ${localize('editor.map.marker.icon_size', lang, 'Icon Size')}
                  </div>
                  <div class="number-range-control">
                    <input
                      type="range"
                      class="range-slider"
                      min="8"
                      max="64"
                      step="1"
                      .value="${marker.icon_size || 20}"
                      @input=${(e: Event) => {
                        const target = e.target as HTMLInputElement;
                        const value = parseInt(target.value);
                        updateMarker({ icon_size: value });
                      }}
                    />
                    <input
                      type="number"
                      class="range-input"
                      min="8"
                      max="64"
                      step="1"
                      .value="${marker.icon_size || 20}"
                      @input=${(e: Event) => {
                        const target = e.target as HTMLInputElement;
                        const value = parseInt(target.value);
                        if (!isNaN(value)) {
                          updateMarker({ icon_size: value });
                        }
                      }}
                    />
                  </div>
                  <div
                    style="font-size: 11px; color: var(--secondary-text-color); margin-top: 4px; opacity: 0.7;"
                  >
                    ${localize('editor.map.marker.icon_size_range', lang, 'Range: 8 to 64 pixels')}
                  </div>
                </div>
              </div>
            `
          : ''}

        <!-- Custom Image Settings -->
        ${marker.marker_image_type === 'custom_image'
          ? html`
              <div style="margin-top: 16px;">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 500; margin-bottom: 4px;"
                >
                  ${localize('editor.map.marker.custom_image', lang, 'Custom Image')}
                </div>
                <div
                  class="field-description"
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                >
                  ${localize(
                    'editor.map.marker.custom_image_desc',
                    lang,
                    'Upload an image or enter an image URL'
                  )}
                </div>
                <ha-textfield
                  .value=${marker.marker_image || ''}
                  placeholder="https://example.com/marker.png"
                  @input=${(e: Event) => {
                    const value = (e.target as any).value;
                    updateMarker({ marker_image: value });
                  }}
                  style="width: 100%; margin-bottom: 12px;"
                >
                  <ha-icon icon="mdi:image" slot="leadingIcon"></ha-icon>
                </ha-textfield>

                <div>
                  <div
                    class="field-title"
                    style="font-size: 14px; font-weight: 500; margin-bottom: 4px;"
                  >
                    ${localize('editor.map.marker.image_size', lang, 'Image Size')}
                  </div>
                  <div class="number-range-control">
                    <input
                      type="range"
                      class="range-slider"
                      min="8"
                      max="128"
                      step="1"
                      .value="${marker.icon_size || 32}"
                      @input=${(e: Event) => {
                        const target = e.target as HTMLInputElement;
                        const value = parseInt(target.value);
                        updateMarker({ icon_size: value });
                      }}
                    />
                    <input
                      type="number"
                      class="range-input"
                      min="8"
                      max="128"
                      step="1"
                      .value="${marker.icon_size || 32}"
                      @input=${(e: Event) => {
                        const target = e.target as HTMLInputElement;
                        const value = parseInt(target.value);
                        if (!isNaN(value)) {
                          updateMarker({ icon_size: value });
                        }
                      }}
                    />
                  </div>
                  <div
                    style="font-size: 11px; color: var(--secondary-text-color); margin-top: 4px; opacity: 0.7;"
                  >
                    ${localize(
                      'editor.map.marker.image_size_range',
                      lang,
                      'Range: 8 to 128 pixels'
                    )}
                  </div>
                </div>
              </div>
            `
          : ''}

        <!-- Entity Image Settings -->
        ${marker.marker_image_type === 'entity_image'
          ? html`
              <div style="margin-top: 16px;">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 500; margin-bottom: 4px;"
                >
                  ${localize('editor.map.marker.use_entity_picture', lang, 'Use Entity Picture')}
                </div>
                <div
                  class="field-description"
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                >
                  ${localize(
                    'editor.map.marker.use_entity_picture_desc',
                    lang,
                    'Use the entity_picture attribute from the tracked entity'
                  )}
                </div>
                ${this.renderUcForm(
                  hass,
                  { use_entity_picture: marker.use_entity_picture ?? true },
                  [this.booleanField('use_entity_picture')],
                  (e: CustomEvent) =>
                    updateMarker({ use_entity_picture: e.detail.value.use_entity_picture }),
                  false
                )}

                <div style="margin-top: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 14px; font-weight: 500; margin-bottom: 4px;"
                  >
                    ${localize('editor.map.marker.image_size', lang, 'Image Size')}
                  </div>
                  <div class="number-range-control">
                    <input
                      type="range"
                      class="range-slider"
                      min="8"
                      max="128"
                      step="1"
                      .value="${marker.icon_size || 32}"
                      @input=${(e: Event) => {
                        const target = e.target as HTMLInputElement;
                        const value = parseInt(target.value);
                        updateMarker({ icon_size: value });
                      }}
                    />
                    <input
                      type="number"
                      class="range-input"
                      min="8"
                      max="128"
                      step="1"
                      .value="${marker.icon_size || 32}"
                      @input=${(e: Event) => {
                        const target = e.target as HTMLInputElement;
                        const value = parseInt(target.value);
                        if (!isNaN(value)) {
                          updateMarker({ icon_size: value });
                        }
                      }}
                    />
                  </div>
                  <div
                    style="font-size: 11px; color: var(--secondary-text-color); margin-top: 4px; opacity: 0.7;"
                  >
                    ${localize(
                      'editor.map.marker.image_size_range',
                      lang,
                      'Range: 8 to 128 pixels'
                    )}
                  </div>
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }

  // Marker drag and drop handlers (similar to light module)
  private handleMarkerDragStart(e: DragEvent, index: number) {
    this.draggedMarkerIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', '');
    }
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
  }

  private handleMarkerDragEnd(e: DragEvent) {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    this.draggedMarkerIndex = null;

    // Remove all drag-over indicators
    document.querySelectorAll('.marker-item').forEach(item => {
      (item as HTMLElement).style.borderTop = '';
      (item as HTMLElement).style.borderBottom = '';
    });
  }

  private handleMarkerDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  private handleMarkerDragEnter(e: DragEvent) {
    const target = (e.currentTarget as HTMLElement).closest('.marker-item') as HTMLElement;
    if (target && this.draggedMarkerIndex !== null) {
      const currentIndex = parseInt(target.getAttribute('data-marker-index') || '0');
      if (currentIndex !== this.draggedMarkerIndex) {
        target.style.borderTop =
          currentIndex < this.draggedMarkerIndex ? '2px solid var(--primary-color)' : '';
        target.style.borderBottom =
          currentIndex > this.draggedMarkerIndex ? '2px solid var(--primary-color)' : '';
      }
    }
  }

  private handleMarkerDragLeave(e: DragEvent) {
    const target = (e.currentTarget as HTMLElement).closest('.marker-item') as HTMLElement;
    if (target) {
      target.style.borderTop = '';
      target.style.borderBottom = '';
    }
  }

  private handleMarkerDrop(
    e: DragEvent,
    dropIndex: number,
    moveMarker: (fromIndex: number, toIndex: number) => void
  ) {
    e.preventDefault();
    e.stopPropagation();

    const target = (e.currentTarget as HTMLElement).closest('.marker-item') as HTMLElement;
    if (target) {
      target.style.borderTop = '';
      target.style.borderBottom = '';
    }

    if (this.draggedMarkerIndex !== null && this.draggedMarkerIndex !== dropIndex) {
      moveMarker(this.draggedMarkerIndex, dropIndex);
    }

    this.draggedMarkerIndex = null;
  }

  private toggleMarkerHeader(e: Event) {
    const header = e.currentTarget as HTMLElement;
    const card = header.closest('.marker-item') as HTMLElement;
    const content = card?.querySelector('.marker-content') as HTMLElement;
    const caret = header.querySelector('.expand-caret') as HTMLElement;

    if (card && content && caret) {
      const id = card.getAttribute('data-marker-id') || '';
      if (this.expandedMarkers.has(id)) {
        this.expandedMarkers.delete(id);
        content.style.display = 'none';
        caret.style.transform = 'rotate(0deg)';
      } else {
        this.expandedMarkers.add(id);
        content.style.display = 'block';
        caret.style.transform = 'rotate(180deg)';
      }
    }
  }

  /**
   * Returns the effective map provider and type for rendering.
   * If config requests Google but there is no valid API key (missing, empty, or redacted
   * from export), falls back to OpenStreetMap so the map still works for presets/shared configs.
   */
  private getEffectiveMapProvider(
    mapModule: MapModule
  ): { provider: 'openstreetmap' | 'google'; mapType: string } {
    const provider = mapModule.map_provider || 'openstreetmap';
    const mapType = mapModule.map_type || 'roadmap';
    if (provider !== 'google') {
      return { provider, mapType };
    }
    const key = (mapModule.google_api_key || '').trim();
    const hasValidKey =
      key.length > 0 &&
      key !== SENSITIVE_PLACEHOLDER &&
      !key.toLowerCase().startsWith('***');
    if (hasValidKey) {
      return { provider: 'google', mapType };
    }
    // Fallback to OpenStreetMap (free, no API key) so shared presets always show a working map
    return { provider: 'openstreetmap', mapType: 'roadmap' };
  }

  // Extract coordinates from entity
  private extractCoordinates(
    entityId: string,
    hass: HomeAssistant
  ): { latitude: number; longitude: number } | null {
    const entityState = hass.states[entityId];
    if (!entityState) return null;

    const attrs = entityState.attributes;
    let latitude: number | undefined = undefined;
    let longitude: number | undefined = undefined;

    // First check for standard latitude/longitude attributes
    if (attrs.latitude !== undefined && attrs.longitude !== undefined) {
      latitude = attrs.latitude;
      longitude = attrs.longitude;
    }
    // Then check for the "Location" attribute which may contain coordinates
    else if (attrs.Location !== undefined) {
      // Check if Location is already an array
      if (Array.isArray(attrs.Location)) {
        if (attrs.Location.length >= 2) {
          const lat = parseFloat(attrs.Location[0]);
          const lon = parseFloat(attrs.Location[1]);
          if (!isNaN(lat) && !isNaN(lon)) {
            latitude = lat;
            longitude = lon;
          }
        }
      }
      // Try to parse "lat, lon" format if it's a string
      else if (typeof attrs.Location === 'string') {
        const parts = attrs.Location.split(',').map(p => parseFloat(p.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          latitude = parts[0];
          longitude = parts[1];
        }
      }
    }

    if (latitude !== undefined && longitude !== undefined) {
      return { latitude, longitude };
    }

    return null;
  }

  private _trackEntityChanges(mapModule: MapModule, mapId: string, hass: HomeAssistant): void {
    // Check if any entity markers have changed location
    const entityMarkers = mapModule.markers?.filter(m => m.type === 'entity' && m.entity) || [];

    if (entityMarkers.length === 0) return;

    let hasChanges = false;
    const currentTime = Date.now();
    const lastUpdate = this.lastUpdateTime.get(mapId) || 0;

    // Throttle updates to every 2 seconds minimum
    if (currentTime - lastUpdate < 2000) return;

    for (const marker of entityMarkers) {
      if (!marker.entity) continue;

      const state = hass?.states[marker.entity];
      if (!state) continue;

      // Create a state signature including location
      const coords = this.extractCoordinates(marker.entity, hass);
      const stateSignature = coords ? `${coords.latitude},${coords.longitude}` : 'unknown';

      const cacheKey = `${mapId}_${marker.entity}`;
      const previousState = this.entityStateCache.get(cacheKey);

      if (previousState !== stateSignature) {
        this.entityStateCache.set(cacheKey, stateSignature);
        hasChanges = true;
      }
    }

    // If any entity locations changed, update the map
    if (hasChanges) {
      this.lastUpdateTime.set(mapId, currentTime);
      const map = this.mapInstances.get(mapId);

      if (map && (map as any)._container) {
        this.updateExistingMap(map, mapModule, hass);
      }
    }
  }

  // Calculate auto-zoom level to fit all entity markers
  private calculateAutoZoom(
    markers: MapMarker[],
    hass: HomeAssistant
  ): { bounds: L.LatLngBounds } | null {
    const coordinates: Array<{ latitude: number; longitude: number }> = [];

    // Collect all entity marker coordinates
    for (const marker of markers) {
      if (marker.type === 'entity' && marker.entity) {
        const coords = this.extractCoordinates(marker.entity, hass);
        if (coords) {
          coordinates.push(coords);
        }
      }
    }

    if (coordinates.length === 0) return null;

    // Create Leaflet LatLngBounds from all coordinates
    const bounds = L.latLngBounds(
      coordinates.map(coord => L.latLng(coord.latitude, coord.longitude))
    );

    return { bounds };
  }

  private handleMapResize(mapId: string, mapModule: MapModule, hass: HomeAssistant): void {
    const map = this.mapInstances.get(mapId);
    if (!map || !(map as any)._container) return;

    // First, tell Leaflet the container size changed
    map.invalidateSize();

    // Then recalculate zoom/center if auto-zoom is enabled
    if (mapModule.auto_zoom_entities && mapModule.markers && mapModule.markers.length > 0) {
      const autoZoomResult = this.calculateAutoZoom(mapModule.markers, hass);
      if (autoZoomResult) {
        // Use fitBounds with generous padding to prevent markers from being cut off
        // maxZoom respects user's zoom preference
        map.fitBounds(autoZoomResult.bounds, {
          padding: [50, 50], // 50px padding on all sides
          maxZoom: mapModule.zoom || 14,
          animate: true,
        });
      }
    }
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const mapModule = module as MapModule;
    // Include preview context in mapId to handle different rendering contexts
    const contextSuffix = previewContext ? `-${previewContext}` : '';
    const mapId = `map-${mapModule.id}${contextSuffix}`;

    // Track entity states for automatic updates
    if (!previewContext || previewContext === 'dashboard') {
      // Only auto-update in the actual dashboard view
      this._trackEntityChanges(mapModule, mapId, hass);
    }

    // Calculate height based on aspect ratio
    let height = mapModule.map_height || 400;
    if (mapModule.aspect_ratio && mapModule.aspect_ratio !== 'custom') {
      const aspectRatios = {
        '16:9': 56.25,
        '4:3': 75,
        '1:1': 100,
      };
      // Calculate actual pixel height based on container width (assume 100%)
      // We'll handle this in the initialization
      height = 400; // Default, will be calculated from aspect ratio
    }

    const containerStyle =
      mapModule.aspect_ratio && mapModule.aspect_ratio !== 'custom'
        ? `position: relative; width: 100%; height: 0; padding-bottom: ${
            { '16:9': '56.25%', '4:3': '75%', '1:1': '100%' }[mapModule.aspect_ratio]
          }; overflow: hidden; border-radius: 8px;`
        : `width: 100%; height: ${height}px; position: relative; overflow: hidden; border-radius: 8px;`;

    const mapStyle =
      mapModule.aspect_ratio && mapModule.aspect_ratio !== 'custom'
        ? 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;'
        : 'width: 100%; height: 100%;';

    // Ref callback for map container - called when element is added to DOM
    const mapContainerRef = (element: Element | undefined) => {
      if (!element) {
        // Clean up observer if element is being removed
        const observer = this.mapResizeObservers.get(mapId);
        if (observer) {
          observer.disconnect();
          this.mapResizeObservers.delete(mapId);
        }
        return;
      }

      // Check if this element already has a map initialized
      const elemAny = element as any;
      if (elemAny._ucMapInstance) {
        // Map already exists in this element
        const map = elemAny._ucMapInstance;

        // Update existing map if module data has changed
        // This works for all contexts: live, ha-preview, and dashboard
        if (!elemAny._ucLastUpdate || JSON.stringify(mapModule) !== elemAny._ucLastUpdate) {
          elemAny._ucLastUpdate = JSON.stringify(mapModule);
          this.updateExistingMap(map, mapModule, hass);
        }
        return;
      }

      // Check if we're already processing this map
      if (this.initializingMaps.has(mapId)) {
        return;
      }

      // Initialize new map
      this.initializingMaps.add(mapId);

      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        this.initializeLeafletMap(element as HTMLElement, mapId, mapModule, hass);
        this.initializingMaps.delete(mapId);
      });
    };

    return html`
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossorigin=""
      />
      <style>
        .leaflet-container {
          font-family: var(--primary-font-family, inherit);
        }
        .leaflet-popup-content-wrapper {
          background: var(--card-background-color);
          color: var(--primary-text-color);
        }
        .leaflet-popup-tip {
          background: var(--card-background-color);
        }
        .custom-marker-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .custom-marker-icon ha-icon {
          --mdi-icon-size: 24px;
        }

        /* Ensure map panes don't overlay HA UI elements */
        .leaflet-pane {
          z-index: 1 !important;
        }
        .leaflet-map-pane {
          z-index: 1 !important;
        }
        .leaflet-tile-pane {
          z-index: 1 !important;
        }
        .leaflet-overlay-pane {
          z-index: 1 !important;
        }
        .leaflet-shadow-pane {
          z-index: 1 !important;
        }
        .leaflet-marker-pane {
          z-index: 1 !important;
        }
        .leaflet-tooltip-pane {
          z-index: 1 !important;
        }
        .leaflet-popup-pane {
          z-index: 1 !important;
        }

        /* Ensure map controls don't overlay HA UI elements (sidebar, menus, etc.) */
        .leaflet-control-container {
          z-index: 1 !important;
        }
        .leaflet-top,
        .leaflet-bottom,
        .leaflet-left,
        .leaflet-right {
          z-index: 1 !important;
        }
        .leaflet-control-zoom {
          z-index: 1 !important;
        }
        .leaflet-control-attribution {
          z-index: 1 !important;
        }
        .leaflet-control {
          z-index: 1 !important;
        }

        /* Range control styles from Bar module */
        .number-range-control {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .range-slider {
          flex: 1;
        }

        .range-input {
          width: 72px !important;
          max-width: 72px !important;
          min-width: 72px !important;
          padding: 4px 6px !important;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          font-size: 13px;
          text-align: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
          box-sizing: border-box;
        }

        .range-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
        }

        .range-input::-webkit-outer-spin-button,
        .range-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .range-input[type='number'] {
          -moz-appearance: textfield;
        }
        .custom-marker-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }
      </style>
      <div
        class="map-container"
        style="${containerStyle} box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: box-shadow 0.2s ease;"
        @mouseenter=${(e: Event) => {
          const target = e.currentTarget as HTMLElement;
          target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
        }}
        @mouseleave=${(e: Event) => {
          const target = e.currentTarget as HTMLElement;
          target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
      >
        <div ${ref(mapContainerRef)} id="${mapId}" style="${mapStyle}"></div>
      </div>
    `;
  }

  private initializeLeafletMap(
    container: HTMLElement,
    mapId: string,
    mapModule: MapModule,
    hass: HomeAssistant
  ): void {
    if (!container) {
      this.initializingMaps.delete(mapId);
      return;
    }

    // Check if container has dimensions
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
      this.initializingMaps.delete(mapId);
      setTimeout(() => {
        if (!this.mapInstances.has(mapId) && !this.initializingMaps.has(mapId)) {
          this.initializingMaps.add(mapId);
          this.initializeLeafletMap(container, mapId, mapModule, hass);
        }
      }, 300);
      return;
    }

    // Remove existing map if any
    const existingMap = this.mapInstances.get(mapId);
    if (existingMap) {
      existingMap.remove();
      this.mapInstances.delete(mapId);
    }

    // Also clean up any existing resize observer
    const existingObserver = this.mapResizeObservers.get(mapId);
    if (existingObserver) {
      existingObserver.disconnect();
      this.mapResizeObservers.delete(mapId);
    }

    // Get center coordinates
    // Priority: 1. Manual center, 2. First marker, 3. Default (New York)
    let centerLat = mapModule.manual_center_latitude ?? 40.7128;
    let centerLon = mapModule.manual_center_longitude ?? -74.006;
    const validMarkers: Array<{ lat: number; lon: number; marker: MapMarker }> = [];

    // Collect all valid marker coordinates
    for (const marker of mapModule.markers || []) {
      let lat: number | undefined;
      let lon: number | undefined;

      if (marker.type === 'manual') {
        lat = marker.latitude;
        lon = marker.longitude;
      } else if (marker.type === 'entity' && marker.entity) {
        const coords = this.extractCoordinates(marker.entity, hass);
        if (coords) {
          lat = coords.latitude;
          lon = coords.longitude;
        }
      }

      if (lat !== undefined && lon !== undefined) {
        validMarkers.push({ lat, lon, marker });
        // Only use first marker as center if no manual center is set
        if (
          validMarkers.length === 1 &&
          !mapModule.manual_center_latitude &&
          !mapModule.manual_center_longitude
        ) {
          centerLat = lat;
          centerLon = lon;
        }
      }
    }

    // Calculate zoom and center
    const zoom = mapModule.zoom || 14;
    const useAutoZoom = mapModule.auto_zoom_entities && validMarkers.length > 0;

    // For auto-zoom, we'll use fitBounds after initialization
    // For manual zoom, use the specified center or first marker
    const initialZoom = useAutoZoom ? 10 : zoom; // Start with a neutral zoom for auto-zoom

    // Initialize Leaflet map
    try {
      const map = L.map(container, {
        zoomControl: mapModule.show_map_controls ?? true,
        scrollWheelZoom: !mapModule.disable_zoom_scroll,
        dragging: !mapModule.disable_touch_drag,
      }).setView([centerLat, centerLon], initialZoom);

      // Store map reference both in the global map and on the element itself
      this.mapInstances.set(mapId, map);
      (container as any)._ucMapInstance = map;

      // Set up ResizeObserver to handle container size changes
      const resizeObserver = new ResizeObserver(() => {
        this.handleMapResize(mapId, mapModule, hass);
      });
      resizeObserver.observe(container);
      this.mapResizeObservers.set(mapId, resizeObserver);

      // Force map to recalculate size
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      // Add tile layer based on provider (fallback to OSM if Google chosen but no API key)
      const { provider: mapProvider, mapType } = this.getEffectiveMapProvider(mapModule);
      const tileKey = `${mapProvider}-${mapType}`;

      let tileLayer;
      if (mapProvider === 'google') {
        // Google Maps tiles with retina support
        const tileUrls: Record<string, string> = {
          roadmap: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en',
          satellite: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&hl=en',
          hybrid: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=en',
          terrain: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&hl=en',
        };
        tileLayer = L.tileLayer(tileUrls[mapType] || tileUrls.roadmap, {
          attribution: '&copy; Google Maps',
          maxZoom: 20,
          subdomains: ['0', '1', '2', '3'],
          detectRetina: true,
          keepBuffer: 2,
          updateWhenZooming: false,
          updateWhenIdle: true,
        });
      } else {
        // OpenStreetMap with retina support
        const osmStyles: Record<string, string> = {
          standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          cycle: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
          transport: 'https://tile.memomaps.de/tilegen/{z}/{x}/{y}.png',
          humanitarian: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        };
        const osmStyle = mapType === 'roadmap' ? 'standard' : mapType;
        tileLayer = L.tileLayer(osmStyles[osmStyle] || osmStyles.standard, {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          detectRetina: true,
          keepBuffer: 2,
          updateWhenZooming: false,
          updateWhenIdle: true,
        });
      }

      tileLayer.addTo(map);
      // Store tile layer reference for updates
      (map as any)._mapModuleTileLayer = tileLayer;
      (map as any)._mapModuleTileKey = tileKey;

      // Add markers
      const leafletMarkers: L.Marker[] = [];
      for (const { lat, lon, marker } of validMarkers) {
        const leafletMarker = this.addLeafletMarker(map, marker, hass);
        if (leafletMarker) {
          leafletMarkers.push(leafletMarker);
        }
      }
      // Store markers for later updates
      (map as any)._mapModuleMarkers = leafletMarkers;

      // Apply consistent auto-zoom logic across all contexts
      if (useAutoZoom) {
        const autoZoomResult = this.calculateAutoZoom(mapModule.markers || [], hass);
        if (autoZoomResult) {
          // Use fitBounds with generous padding to prevent markers from being cut off
          // maxZoom respects user's zoom preference
          map.fitBounds(autoZoomResult.bounds, {
            padding: [50, 50], // 50px padding on all sides
            maxZoom: zoom,
            animate: false,
          });
        }
      }
    } catch (error) {}
  }

  private updateAllMapsForModule(
    moduleId: string,
    mapModule: MapModule,
    hass: HomeAssistant
  ): void {
    // Prevent infinite loops by checking if we're already updating
    const updateKey = `updating_${moduleId}`;
    if ((this as any)[updateKey]) {
      return;
    }

    (this as any)[updateKey] = true;

    try {
      // Only update the current context to prevent loops
      const currentMapId = 'map-' + moduleId;
      const map = this.mapInstances.get(currentMapId);

      if (map && (map as any)._container) {
        this.updateExistingMap(map, mapModule, hass);
      }
    } catch (error) {
    } finally {
      // Clear the update flag after a longer delay to prevent rapid re-triggering
      setTimeout(() => {
        (this as any)[updateKey] = false;
      }, 500);
    }
  }

  private updateExistingMap(map: L.Map, mapModule: MapModule, hass: HomeAssistant): void {
    // Coalesce rapid updates PER MAP INSTANCE to avoid dropped updates and extension errors
    const mapAny = map as any;
    if (mapAny._ucUpdating) {
      mapAny._ucUpdatePending = true; // ensure a final pass runs after current update
      return;
    }
    mapAny._ucUpdating = true;

    try {
      // Update map settings without recreating it

      // Calculate zoom and center based on auto-zoom setting
      const targetZoom = mapModule.zoom || 14;

      if (mapModule.auto_zoom_entities && mapModule.markers && mapModule.markers.length > 0) {
        const autoZoomResult = this.calculateAutoZoom(mapModule.markers, hass);
        if (autoZoomResult) {
          // Use fitBounds with generous padding to prevent markers from being cut off
          // maxZoom respects user's zoom preference
          map.fitBounds(autoZoomResult.bounds, {
            padding: [50, 50], // 50px padding on all sides
            maxZoom: targetZoom,
            animate: false,
          });
        }
      } else {
        // Auto-zoom is disabled - use manual center or first marker
        // Priority: 1. Manual center, 2. First marker with valid coords
        let newCenter: L.LatLng | null = null;

        if (
          mapModule.manual_center_latitude !== undefined &&
          mapModule.manual_center_longitude !== undefined
        ) {
          // Use manual center if set
          newCenter = L.latLng(mapModule.manual_center_latitude, mapModule.manual_center_longitude);
        } else if (mapModule.markers && mapModule.markers.length > 0) {
          // Use first marker with valid coordinates
          for (const marker of mapModule.markers) {
            if (marker.type === 'entity' && marker.entity) {
              const coords = this.extractCoordinates(marker.entity, hass);
              if (coords) {
                newCenter = L.latLng(coords.latitude, coords.longitude);
                break;
              }
            } else if (
              marker.type === 'manual' &&
              marker.latitude !== undefined &&
              marker.longitude !== undefined
            ) {
              newCenter = L.latLng(marker.latitude, marker.longitude);
              break;
            }
          }
        }
        // Update view with new center and zoom
        if (newCenter) {
          map.setView(newCenter, targetZoom, { animate: false });
        } else if (map.getZoom() !== targetZoom) {
          map.setZoom(targetZoom);
        }
      }

      // Update controls
      if (mapModule.show_map_controls) {
        if (!mapAny.zoomControl) {
          map.addControl(L.control.zoom());
        }
      } else {
        if (mapAny.zoomControl) {
          map.removeControl(mapAny.zoomControl);
        }
      }

      // Check if we need to update tile layer (provider or style changed)
      const currentTileLayer = mapAny._mapModuleTileLayer;
      const { provider: mapProvider, mapType } = this.getEffectiveMapProvider(mapModule);
      const tileKey = `${mapProvider}-${mapType}`;

      if (currentTileLayer && mapAny._mapModuleTileKey !== tileKey) {
        // Add new tile layer first (for smooth transition)
        let newTileLayer;
        if (mapProvider === 'google') {
          const tileUrls: Record<string, string> = {
            roadmap: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en',
            satellite: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&hl=en',
            hybrid: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=en',
            terrain: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&hl=en',
          };
          newTileLayer = L.tileLayer(tileUrls[mapType] || tileUrls.roadmap, {
            attribution: '&copy; Google Maps',
            maxZoom: 20,
            subdomains: ['0', '1', '2', '3'],
            detectRetina: true,
            keepBuffer: 2,
            updateWhenZooming: false,
            updateWhenIdle: true,
          });
        } else {
          const osmStyles: Record<string, string> = {
            standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            cycle: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
            transport: 'https://tile.memomaps.de/tilegen/{z}/{x}/{y}.png',
            humanitarian: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
          };
          const osmStyle = mapType === 'roadmap' ? 'standard' : mapType;
          newTileLayer = L.tileLayer(osmStyles[osmStyle] || osmStyles.standard, {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
            detectRetina: true,
            keepBuffer: 2,
            updateWhenZooming: false,
            updateWhenIdle: true,
          });
        }

        newTileLayer.addTo(map);

        // Remove old tile layer after new one is added
        setTimeout(() => {
          if (currentTileLayer && map.hasLayer(currentTileLayer)) {
            map.removeLayer(currentTileLayer);
          }
        }, 100);

        mapAny._mapModuleTileLayer = newTileLayer;
        mapAny._mapModuleTileKey = tileKey;
      }

      // Update markers - remove old ones and add new ones
      const existingMarkers = mapAny._mapModuleMarkers || [];
      existingMarkers.forEach((m: L.Marker) => {
        try {
          if (m && map.hasLayer(m)) {
            map.removeLayer(m);
          }
        } catch (e) {
          // Ignore errors from already removed markers
        }
      });

      // Also remove any orphaned markers that might exist on the map
      // This ensures complete cleanup even if tracking was lost
      map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          try {
            map.removeLayer(layer);
          } catch (e) {
            // Ignore errors
          }
        }
      });

      mapAny._mapModuleMarkers = [];

      // Force a small delay to ensure markers are fully removed before adding new ones
      setTimeout(() => {
        // Collect and add current markers
        const validMarkers: Array<{ lat: number; lon: number; marker: MapMarker }> = [];
        for (const marker of mapModule.markers || []) {
          let lat: number | undefined;
          let lon: number | undefined;

          if (marker.type === 'manual') {
            lat = marker.latitude;
            lon = marker.longitude;
          } else if (marker.type === 'entity' && marker.entity) {
            const coords = this.extractCoordinates(marker.entity, hass);
            if (coords) {
              lat = coords.latitude;
              lon = coords.longitude;
            }
          }

          if (lat !== undefined && lon !== undefined) {
            validMarkers.push({ lat, lon, marker });
          }
        }

        // Add updated markers
        const newMarkers: L.Marker[] = [];
        for (const { lat, lon, marker } of validMarkers) {
          try {
            const leafletMarker = this.addLeafletMarker(map, marker, hass);
            if (leafletMarker) {
              newMarkers.push(leafletMarker);
            }
          } catch (error) {}
        }
        mapAny._mapModuleMarkers = newMarkers;
      }, 100);

      // Invalidate size in case container resized
      setTimeout(() => map.invalidateSize(), 50);
    } catch (error) {
    } finally {
      // Finish update and run any pending update immediately after
      setTimeout(() => {
        mapAny._ucUpdating = false;
        if (mapAny._ucUpdatePending) {
          mapAny._ucUpdatePending = false;
          this.updateExistingMap(map, mapModule, hass);
        }
      }, 0);
    }
  }

  private addLeafletMarker(map: L.Map, marker: MapMarker, hass: HomeAssistant): L.Marker {
    const coords = this.extractCoordinates(marker.entity || '', hass) || {
      latitude: marker.latitude,
      longitude: marker.longitude,
    };

    if (!coords) {
      return null as any;
    }

    const latlng = L.latLng(coords.latitude, coords.longitude);
    let leafletMarker: L.Marker;

    if (marker.marker_image_type === 'custom_image' && marker.marker_image) {
      // Custom image marker
      const imageSize = marker.icon_size || 32;
      const containerSize = Math.max(40, imageSize + 8);

      const customIcon = L.divIcon({
        html: `
          <div style="
            position: relative;
            width: ${containerSize}px;
            height: ${containerSize}px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <img 
              src="${marker.marker_image}" 
              style="
                width: ${imageSize}px;
                height: ${imageSize}px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                object-fit: cover;
              "
            />
          </div>
        `,
        iconSize: [containerSize, containerSize],
        iconAnchor: [containerSize / 2, containerSize],
        popupAnchor: [0, -containerSize],
        className: '',
        shadowUrl: null,
      });

      leafletMarker = L.marker(latlng, { icon: customIcon });
    } else if (marker.marker_image_type === 'entity_image' && marker.entity) {
      // Entity image marker
      const state = hass?.states[marker.entity];
      const entityPicture = state?.attributes?.entity_picture;

      if (entityPicture) {
        const imageSize = marker.icon_size || 32;
        const containerSize = Math.max(40, imageSize + 8);

        const entityIcon = L.divIcon({
          html: `
            <div style="
              position: relative;
              width: ${containerSize}px;
              height: ${containerSize}px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <img 
                src="${entityPicture}" 
                style="
                  width: ${imageSize}px;
                  height: ${imageSize}px;
                  border-radius: 50%;
                  border: 2px solid white;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  object-fit: cover;
                "
              />
            </div>
          `,
          iconSize: [containerSize, containerSize],
          iconAnchor: [containerSize / 2, containerSize],
          popupAnchor: [0, -containerSize],
          className: '',
          shadowUrl: null,
        });

        leafletMarker = L.marker(latlng, { icon: entityIcon });
      } else {
        // Fallback to default marker
        leafletMarker = L.marker(latlng);
      }
    } else {
      // Icon marker
      const icon = this.createIconMarker(marker);
      leafletMarker = L.marker(latlng, { icon });

      // CRITICAL: If using icon marker with an icon, replace placeholder with actual ha-icon element
      const markerType = marker.marker_image_type || 'icon';
      if (markerType === 'icon' && marker.icon && marker.icon.trim() !== '') {
        setTimeout(() => {
          this._injectHaIconIntoMarker(leafletMarker, marker);
        }, 0);
      } else if (markerType === 'icon') {
      }
    }

    // Add popup if marker has a name
    if (marker.name) {
      leafletMarker.bindPopup(marker.name);
    }

    // Add to map and store reference
    leafletMarker.addTo(map);
    this.markersGroup.set(marker.id, leafletMarker);

    return leafletMarker;
  }

  private _injectHaIconIntoMarker(leafletMarker: L.Marker, marker: MapMarker): void {
    const iconEl = (leafletMarker as any)._icon;
    if (!iconEl) {
      return;
    }

    // Find the placeholder div for the icon
    const iconPlaceholder = iconEl.querySelector('[data-icon-placeholder]');
    if (!iconPlaceholder) {
      return;
    }

    // Create actual ha-icon element
    const haIcon = document.createElement('ha-icon');
    haIcon.setAttribute('icon', marker.icon || '');

    const color = marker.icon_color || 'var(--primary-color)';
    const iconSize = marker.icon_size || 20;
    const containerSize = iconSize * 2.5;
    const teardropSize = containerSize * 0.8;
    const actualIconSize = teardropSize * 0.6;
    // Set the icon property (not just attribute)
    (haIcon as any).icon = marker.icon || '';

    // Apply aggressive styling with !important
    haIcon.style.cssText = `
      color: ${color} !important;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
      font-size: ${actualIconSize}px !important;
      width: ${actualIconSize}px !important;
      height: ${actualIconSize}px !important;
      min-width: ${actualIconSize}px !important;
      min-height: ${actualIconSize}px !important;
      line-height: ${actualIconSize}px !important;
      --mdi-icon-size: ${actualIconSize}px !important;
      display: block !important;
    `;

    // Replace placeholder with actual element
    iconPlaceholder.innerHTML = '';
    iconPlaceholder.appendChild(haIcon);

    // CRITICAL: Use both MutationObserver and retry mechanism for maximum reliability
    this._applyIconSizingWithMutationObserver(haIcon, actualIconSize, color);
    this._applyIconSizingWithRetry(haIcon, actualIconSize, color);
  }

  private _applyIconSizingWithRetry(
    haIcon: HTMLElement,
    actualIconSize: number,
    color: string,
    attempt: number = 0
  ): void {
    const maxAttempts = 15; // Increased from 10 to 15
    const baseDelay = 30; // Reduced from 50ms to 30ms for faster initial attempts

    if (attempt >= maxAttempts) {
      // As a fallback, try to apply sizing to the ha-icon element itself
      this._applyFallbackIconSizing(haIcon, actualIconSize, color);
      return;
    }

    const delay = baseDelay * Math.pow(1.3, attempt); // Reduced exponential factor from 1.5 to 1.3

    setTimeout(() => {
      if (haIcon.shadowRoot) {
        // Try multiple selectors to find the SVG element
        const svgSelectors = [
          'ha-svg-icon svg',
          'svg',
          'mdi-icon svg',
          'iron-icon svg',
          '.icon svg',
          '[part="icon"] svg',
        ];

        let svg: SVGElement | null = null;
        for (const selector of svgSelectors) {
          svg = haIcon.shadowRoot.querySelector(selector) as SVGElement;
          if (svg) {
            break;
          }
        }

        if (svg) {
          // Apply comprehensive sizing to SVG element
          svg.style.cssText = `
            width: ${actualIconSize}px !important; 
            height: ${actualIconSize}px !important;
            color: ${color} !important;
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          `;

          // Set attributes directly for guaranteed sizing
          svg.setAttribute('width', actualIconSize.toString());
          svg.setAttribute('height', actualIconSize.toString());
          svg.setAttribute('viewBox', svg.getAttribute('viewBox') || '0 0 24 24');

          // Apply to all child elements that might contain the icon
          const iconElements = svg.querySelectorAll('path, circle, rect, polygon, line, polyline');
          iconElements.forEach(element => {
            (element as SVGElement).style.cssText = `
              fill: ${color} !important;
              stroke: ${color} !important;
            `;
          });

          // Also try to style the parent container if it exists
          const parentContainer = svg.parentElement;
          if (parentContainer) {
            parentContainer.style.cssText = `
              width: ${actualIconSize}px !important;
              height: ${actualIconSize}px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            `;
          }
        } else {
          // Try to style ha-svg-icon directly if no SVG found
          const haSvgIcon = haIcon.shadowRoot.querySelector('ha-svg-icon') as HTMLElement;
          if (haSvgIcon) {
            haSvgIcon.style.cssText = `
              width: ${actualIconSize}px !important;
              height: ${actualIconSize}px !important;
              color: ${color} !important;
              display: block !important;
            `;

            // Set size attribute if it exists
            if (haSvgIcon.hasAttribute('size')) {
              haSvgIcon.setAttribute('size', actualIconSize.toString());
            }
          } else {
            // Debug: Log the shadow root structure            this._applyIconSizingWithRetry(haIcon, actualIconSize, color, attempt + 1);
          }
        }
      } else {
        this._applyIconSizingWithRetry(haIcon, actualIconSize, color, attempt + 1);
      }
    }, delay);
  }

  private _applyFallbackIconSizing(
    haIcon: HTMLElement,
    actualIconSize: number,
    color: string
  ): void {
    // Apply sizing directly to the ha-icon element as a fallback
    haIcon.style.cssText = `
      width: ${actualIconSize}px !important;
      height: ${actualIconSize}px !important;
      color: ${color} !important;
      display: block !important;
      font-size: ${actualIconSize}px !important;
    `;

    // Set size attribute if it exists
    if (haIcon.hasAttribute('size')) {
      haIcon.setAttribute('size', actualIconSize.toString());
    }
  }

  private _applyIconSizingWithMutationObserver(
    haIcon: HTMLElement,
    actualIconSize: number,
    color: string
  ): void {
    // Try to apply sizing immediately if shadow DOM is already available
    if (haIcon.shadowRoot) {
      this._applyIconSizingToElement(haIcon, actualIconSize, color);
      return;
    }

    // Set up MutationObserver to watch for shadow root creation
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && haIcon.shadowRoot) {
          this._applyIconSizingToElement(haIcon, actualIconSize, color);
          observer.disconnect(); // Stop observing once we've applied the sizing
        }
      });
    });

    // Start observing the ha-icon element
    observer.observe(haIcon, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    // Disconnect observer after 5 seconds to prevent memory leaks
    setTimeout(() => {
      observer.disconnect();
    }, 5000);
  }

  private _applyIconSizingToElement(
    haIcon: HTMLElement,
    actualIconSize: number,
    color: string
  ): boolean {
    if (!haIcon.shadowRoot) {
      return false;
    }

    // Try multiple selectors to find the SVG element
    const svgSelectors = [
      'ha-svg-icon svg',
      'svg',
      'mdi-icon svg',
      'iron-icon svg',
      '.icon svg',
      '[part="icon"] svg',
    ];

    let svg: SVGElement | null = null;
    for (const selector of svgSelectors) {
      svg = haIcon.shadowRoot.querySelector(selector) as SVGElement;
      if (svg) {
        break;
      }
    }

    if (svg) {
      // Apply comprehensive sizing to SVG element
      svg.style.cssText = `
        width: ${actualIconSize}px !important; 
        height: ${actualIconSize}px !important;
        color: ${color} !important;
        display: block !important;
        margin: 0 !important;
        padding: 0 !important;
      `;

      // Set attributes directly for guaranteed sizing
      svg.setAttribute('width', actualIconSize.toString());
      svg.setAttribute('height', actualIconSize.toString());
      svg.setAttribute('viewBox', svg.getAttribute('viewBox') || '0 0 24 24');

      // Apply to all child elements that might contain the icon
      const iconElements = svg.querySelectorAll('path, circle, rect, polygon, line, polyline');
      iconElements.forEach(element => {
        (element as SVGElement).style.cssText = `
          fill: ${color} !important;
          stroke: ${color} !important;
        `;
      });

      // Also try to style the parent container if it exists
      const parentContainer = svg.parentElement;
      if (parentContainer) {
        parentContainer.style.cssText = `
          width: ${actualIconSize}px !important;
          height: ${actualIconSize}px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        `;
      }

      return true;
    }

    // Try to style ha-svg-icon directly if no SVG found
    const haSvgIcon = haIcon.shadowRoot.querySelector('ha-svg-icon') as HTMLElement;
    if (haSvgIcon) {
      haSvgIcon.style.cssText = `
        width: ${actualIconSize}px !important;
        height: ${actualIconSize}px !important;
        color: ${color} !important;
        display: block !important;
      `;

      // Set size attribute if it exists
      if (haSvgIcon.hasAttribute('size')) {
        haSvgIcon.setAttribute('size', actualIconSize.toString());
      }

      return true;
    }

    return false;
  }

  private createIconMarker(marker: MapMarker): L.DivIcon {
    const icon = marker.icon;
    const color = marker.icon_color || 'var(--primary-color)';
    const iconSize = marker.icon_size || 20;

    // Scale container and teardrop proportionally to icon size
    // For a 20px icon setting, we want a 50px container
    const containerSize = iconSize * 2.5;
    const teardropSize = containerSize * 0.8; // Teardrop is 80% of container
    // Icon should be 60% of the teardrop size for good visual balance
    const actualIconSize = teardropSize * 0.6;
    const anchorY = containerSize;

    // If no icon specified, show just the colored teardrop
    if (!icon || icon.trim() === '') {
      return L.divIcon({
        html: `
          <div style="
            position: relative;
            width: ${containerSize}px;
            height: ${containerSize}px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              position: absolute;
              width: ${teardropSize}px;
              height: ${teardropSize}px;
              background: ${color};
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              border: 2px solid white;
            "></div>
          </div>
        `,
        iconSize: [containerSize, containerSize],
        iconAnchor: [containerSize / 2, anchorY],
        popupAnchor: [0, -anchorY],
        className: '',
        shadowUrl: null, // Disable shadow to prevent black outlines
      });
    }

    // Create icon marker with ha-icon inside
    // Position icon in the circular part of the teardrop (upper portion)
    const iconOffsetY = teardropSize * 0.3; // Position icon 30% from top of teardrop

    const htmlContent = `
        <div style="
          position: relative;
          width: ${containerSize}px;
          height: ${containerSize}px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            position: absolute;
            width: ${teardropSize}px;
            height: ${teardropSize}px;
            background: white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 2px solid ${color};
          "></div>
          <div
            data-icon-placeholder
            style="
              position: absolute;
              top: ${iconOffsetY}px;
              left: 50%;
              transform: translateX(-50%);
              width: ${actualIconSize}px;
              height: ${actualIconSize}px;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1;
            "
          >
            <!-- ha-icon will be injected here -->
          </div>
        </div>
      `;

    return L.divIcon({
      html: htmlContent,
      iconSize: [containerSize, containerSize],
      iconAnchor: [containerSize / 2, anchorY],
      popupAnchor: [0, -anchorY],
      className: '',
      shadowUrl: null, // Disable shadow to prevent black outlines
    });
  }

  private createMarkerPopup(marker: MapMarker, hass: HomeAssistant): string {
    let content = `<div style="padding: 8px;"><strong>${marker.name || 'Marker'}</strong>`;

    if (marker.type === 'entity' && marker.entity) {
      const entityState = hass.states[marker.entity];
      if (entityState) {
        const friendlyName = entityState.attributes.friendly_name || marker.entity;
        const state = entityState.state;
        content += `<br><span style="font-size: 12px;">Entity: ${friendlyName}</span>`;
        content += `<br><span style="font-size: 12px;">State: ${state}</span>`;
      }
    } else if (marker.type === 'manual') {
      content += `<br><span style="font-size: 12px;">Lat: ${marker.latitude?.toFixed(6)}</span>`;
      content += `<br><span style="font-size: 12px;">Lon: ${marker.longitude?.toFixed(6)}</span>`;
    }

    content += '</div>';
    return content;
  }

  getCardSize(module: CardModule): number {
    const mapModule = module as MapModule;
    const height = mapModule.map_height || 400;
    return Math.ceil(height / 50);
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const mapModule = module as MapModule;

    // LENIENT VALIDATION: Already lenient, only validates if markers exist
    // Only validate markers that have been started
    if (mapModule.markers && mapModule.markers.length > 0) {
      mapModule.markers.forEach((marker, index) => {
        if (marker.type === 'manual') {
          // Only validate if coordinates are partially set
          if (marker.latitude !== undefined) {
            if (marker.latitude < -90 || marker.latitude > 90) {
              errors.push(`Marker ${index + 1}: Invalid latitude value`);
            }
          }
          if (marker.longitude !== undefined) {
            if (marker.longitude < -180 || marker.longitude > 180) {
              errors.push(`Marker ${index + 1}: Invalid longitude value`);
            }
          }
        } else if (marker.type === 'entity') {
          // Allow empty entity - UI will handle
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
