/**
 * UniFi Network (Pro) — virtual rack, ports, topology, clients, WAN.
 * Auto-discovers Ubiquiti gear via the official Home Assistant UniFi integration.
 */

import { TemplateResult, html, nothing } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import {
  CardModule,
  UltraCardConfig,
  UnifiModule,
  UnifiViewMode,
  UnifiRackStyle,
  UnifiAnimationIntensity,
  UnifiTopologyLayout,
} from '../types';
import { localize } from '../localize/localize';
import { hasProAccess, renderProLockUI, renderProLockedPreview } from '../utils/uc-pro-access';
import {
  discoverUnifiTopology,
  forgetUnifiTopology,
  orderDevices,
  seedCuration,
  suggestVisibleDeviceIds,
  type UnifiDevice,
  type UnifiDeviceKind,
  type UnifiTopology,
} from '../services/uc-unifi-service';
import { ucUnifiDeviceDb } from '../services/uc-unifi-device-db';
import { unifiModuleStyles } from './unifi/styles';
import { renderRackView } from './unifi/rack-view';
import { renderPortsView } from './unifi/ports-view';
import { renderDevicesView } from './unifi/devices-view';
import { renderTopologyView } from './unifi/topology-view';
import { renderClientsView, renderWanView } from './unifi/clients-view';
import {
  ensureCapabilityReport,
  invalidateCapabilityReport,
  renderSetupWizard,
} from './unifi/wizard';

export class UltraUnifiModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'unifi',
    title: 'UniFi Network',
    description: 'Virtual rack, live ports, topology and clients for UniFi gear',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:lan',
    category: 'data',
    tags: [
      'pro',
      'premium',
      'unifi',
      'ubiquiti',
      'network',
      'rack',
      'ports',
      'topology',
      'server-room',
    ],
  };

  private _discoveredIds = new Map<string, string[]>();
  private _deviceFilter = new Map<string, { q: string; kind: string }>();
  private _clientFilter = new Map<string, string>();
  private _orderDragIndex = new Map<string, number>();

  createDefault(id?: string, _hass?: HomeAssistant): UnifiModule {
    return {
      id: id || this.generateId('unifi'),
      type: 'unifi',
      view: 'rack',
      device_order: [],
      hidden_device_ids: [],
      include_clients: true,
      client_ids: [],
      curation_seeded: false,
      rack_max_devices: 16,
      use_device_images: true,
      show_title: true,
      title: 'UniFi Network',
      rack_style: 'dark',
      blank_background: false,
      show_port_labels: true,
      show_advanced: true,
      show_sparklines: true,
      animation_intensity: 'full',
      topology_layout: 'tree',
      setup_dismissed: false,
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override getRuntimeEntityIds(module: CardModule): string[] {
    const m = module as UnifiModule;
    return this._discoveredIds.get(m.id) || [];
  }

  destroy(moduleId?: string): void {
    if (moduleId) {
      forgetUnifiTopology(moduleId);
      this._discoveredIds.delete(moduleId);
      invalidateCapabilityReport(moduleId);
    }
  }

  private _topology(m: UnifiModule, hass: HomeAssistant): UnifiTopology {
    const topo = discoverUnifiTopology(hass, m.id, {
      include_clients: m.include_clients !== false,
      area_filter: m.area_filter,
    });
    this._discoveredIds.set(m.id, topo.allEntityIds);
    return topo;
  }

  private _visibleDevices(m: UnifiModule, topo: UnifiTopology): UnifiDevice[] {
    return orderDevices(
      topo.devices,
      m.device_order,
      m.hidden_device_ids,
      m.include_device_ids
    );
  }

  /** First-run: hide non-primary gear so the rack isn't a 400U wall. */
  private _maybeSeedCuration(
    m: UnifiModule,
    topo: UnifiTopology,
    apply: (updates: Partial<UnifiModule>) => void
  ): UnifiModule {
    const seeded = seedCuration(topo.devices, m);
    if (!seeded) return m;
    // Never mutate config synchronously during render — schedule a patch.
    queueMicrotask(() => apply(seeded));
    return { ...m, ...seeded };
  }

  private _callService(
    hass: HomeAssistant,
    domain: string,
    service: string,
    data: Record<string, unknown>
  ): void {
    try {
      hass.callService(domain, service, data);
    } catch {
      /* ignore */
    }
  }

  private _kindIcon(kind: UnifiDeviceKind): string {
    switch (kind) {
      case 'ap':
        return 'mdi:wifi';
      case 'gateway':
        return 'mdi:router-network';
      case 'pdu':
        return 'mdi:power-socket-us';
      case 'plug':
        return 'mdi:power-plug-outline';
      case 'switch':
        return 'mdi:switch';
      default:
        return 'mdi:lan';
    }
  }

  private _renderDevicePicker(
    m: UnifiModule,
    hass: HomeAssistant,
    topo: UnifiTopology,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const lang = hass?.locale?.language || 'en';
    const filter = this._deviceFilter.get(m.id) || { q: '', kind: 'all' };
    const hidden = new Set(m.hidden_device_ids || []);
    const visibleCount = topo.devices.filter(d => !hidden.has(d.deviceId)).length;

    const filtered = topo.devices.filter(d => {
      if (filter.kind !== 'all' && d.kind !== filter.kind) return false;
      if (!filter.q.trim()) return true;
      const q = filter.q.trim().toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        (d.model || '').toLowerCase().includes(q) ||
        d.kind.includes(q)
      );
    });

    const setHidden = (ids: string[], hide: boolean) => {
      const next = new Set(m.hidden_device_ids || []);
      for (const id of ids) {
        if (hide) next.add(id);
        else next.delete(id);
      }
      updateModule({
        hidden_device_ids: [...next],
        curation_seeded: true,
      } as Partial<CardModule>);
      this.triggerPreviewUpdate();
    };

    const kindCounts = {
      gateway: topo.devices.filter(d => d.kind === 'gateway').length,
      switch: topo.devices.filter(d => d.kind === 'switch').length,
      ap: topo.devices.filter(d => d.kind === 'ap').length,
      pdu: topo.devices.filter(d => d.kind === 'pdu').length,
      plug: topo.devices.filter(d => d.kind === 'plug').length,
      other: topo.devices.filter(d => d.kind === 'other').length,
    };

    return html`
      <div
        class="settings-section"
        style="background:var(--secondary-background-color);border-radius:8px;padding:16px;margin-bottom:24px;"
      >
        <div
          class="section-title"
          style="font-size:14px;font-weight:700;color:var(--primary-color);margin-bottom:8px;"
        >
          ${localize('editor.unifi.device_list', lang, 'UniFi hardware')}
        </div>
        <div style="font-size:12px;color:var(--secondary-text-color);margin-bottom:12px;line-height:1.45;">
          ${localize(
            'editor.unifi.device_list_hint',
            lang,
            'Only Ubiquiti network gear appears here. Connected phones, PCs, and IoT stay in the Clients view. Smart plugs and outlets never mount in the rack — shown ones appear in the Devices view.'
          )}
          ${topo.clients.length
            ? html`<br />${localize(
                'editor.unifi.clients_aside',
                lang,
                '{count} network clients available in the Clients view.'
              ).replace('{count}', String(topo.clients.length))}`
            : nothing}
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;align-items:center;">
          <span style="font-size:12px;font-weight:600;">
            ${localize('editor.unifi.showing_count', lang, 'Showing {shown} of {total}')
              .replace('{shown}', String(visibleCount))
              .replace('{total}', String(topo.devices.length))}
          </span>
          <span style="flex:1;"></span>
          <button
            class="uc-unifi-btn secondary"
            type="button"
            style="padding:4px 10px;font-size:11px;"
            @click=${() => {
              const ids = suggestVisibleDeviceIds(topo.devices, {
                max: m.rack_max_devices ?? 16,
              });
              const hide = topo.devices.filter(d => !ids.includes(d.deviceId)).map(d => d.deviceId);
              updateModule({
                hidden_device_ids: hide,
                device_order: ids,
                curation_seeded: true,
              } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            }}
          >
            ${localize('editor.unifi.show_rack_gear', lang, 'Show rack gear only')}
          </button>
          <button
            class="uc-unifi-btn secondary"
            type="button"
            style="padding:4px 10px;font-size:11px;"
            @click=${() => setHidden(topo.devices.map(d => d.deviceId), false)}
          >
            ${localize('editor.unifi.show_all', lang, 'Show all')}
          </button>
          <button
            class="uc-unifi-btn secondary"
            type="button"
            style="padding:4px 10px;font-size:11px;"
            @click=${() => setHidden(topo.devices.map(d => d.deviceId), true)}
          >
            ${localize('editor.unifi.hide_all', lang, 'Hide all')}
          </button>
        </div>

        ${this.renderSegmentedField(
          localize('editor.unifi.filter_kind', lang, 'Filter by type'),
          '',
          filter.kind,
          [
            {
              value: 'all',
              label: localize('editor.unifi.kind_all', lang, 'All ({n})').replace(
                '{n}',
                String(topo.devices.length)
              ),
            },
            {
              value: 'gateway',
              label: localize('editor.unifi.kind_gateway', lang, 'Gateways ({n})').replace(
                '{n}',
                String(kindCounts.gateway)
              ),
            },
            {
              value: 'switch',
              label: localize('editor.unifi.kind_switch', lang, 'Switches ({n})').replace(
                '{n}',
                String(kindCounts.switch)
              ),
            },
            {
              value: 'ap',
              label: localize('editor.unifi.kind_ap', lang, 'APs ({n})').replace(
                '{n}',
                String(kindCounts.ap)
              ),
            },
            {
              value: 'pdu',
              label: localize('editor.unifi.kind_pdu', lang, 'PDUs ({n})').replace(
                '{n}',
                String(kindCounts.pdu)
              ),
            },
            {
              value: 'plug',
              label: localize('editor.unifi.kind_plug', lang, 'Plugs ({n})').replace(
                '{n}',
                String(kindCounts.plug)
              ),
            },
          ].filter(s => s.value === 'all' || Number(s.label.match(/\((\d+)\)/)?.[1] || 0) > 0),
          next => {
            this._deviceFilter.set(m.id, { ...filter, kind: next });
            this.triggerPreviewUpdate(true);
          }
        )}

        ${this.renderFieldSection(
          localize('editor.unifi.search_devices', lang, 'Search'),
          localize('editor.unifi.search_devices_desc', lang, 'Filter by name or model.'),
          hass,
          { q: filter.q },
          [this.textField('q')],
          (e: CustomEvent) => {
            this._deviceFilter.set(m.id, { ...filter, q: e.detail.value?.q ?? '' });
            this.triggerPreviewUpdate(true);
          }
        )}

        <div style="max-height:320px;overflow:auto;margin-top:8px;">
          ${filtered.length === 0
            ? html`<div style="font-size:12px;opacity:0.65;padding:8px 0;">
                ${localize('editor.unifi.no_match', lang, 'No devices match this filter.')}
              </div>`
            : filtered.map(d => {
                const isHidden = hidden.has(d.deviceId);
                return html`
                  <div
                    style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--divider-color);"
                  >
                    <ha-icon
                      icon=${this._kindIcon(d.kind)}
                      style="--mdc-icon-size:18px;opacity:0.7;"
                    ></ha-icon>
                    <div style="flex:1;min-width:0;">
                      <div
                        style="font-weight:600;font-size:13px;${isHidden
                          ? 'opacity:0.45;text-decoration:line-through;'
                          : ''}"
                      >
                        ${d.name}
                      </div>
                      <div style="font-size:11px;opacity:0.6;">
                        ${d.kind} · ${d.model || '—'}${d.ports.length
                          ? ` · ${d.ports.length} ports`
                          : ''}
                      </div>
                    </div>
                    <button
                      class="uc-unifi-btn secondary"
                      type="button"
                      style="padding:4px 10px;font-size:11px;"
                      @click=${() => setHidden([d.deviceId], !isHidden)}
                    >
                      ${isHidden
                        ? localize('editor.unifi.show', lang, 'Show')
                        : localize('editor.unifi.hide', lang, 'Hide')}
                    </button>
                  </div>
                `;
              })}
        </div>
      </div>
    `;
  }

  /** Drag-and-drop (or arrow-button) rack ordering, right in the editor. */
  private _renderRackOrder(
    m: UnifiModule,
    hass: HomeAssistant,
    topo: UnifiTopology,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult | typeof nothing {
    const lang = hass?.locale?.language || 'en';
    const rackKinds = new Set<UnifiDeviceKind>(['gateway', 'switch', 'pdu']);
    const ordered = orderDevices(topo.devices, m.device_order, m.hidden_device_ids).filter(d =>
      rackKinds.has(d.kind)
    );
    if (ordered.length < 2) return nothing;

    const commit = (from: number, to: number) => {
      if (from === to || from < 0 || to < 0) return;
      const ids = ordered.map(d => d.deviceId);
      const next = [...ids];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      // Keep non-rack devices (APs etc.) after the rack order
      const rest = (m.device_order || []).filter(id => !ids.includes(id));
      updateModule({ device_order: [...next, ...rest] } as Partial<CardModule>);
      this.triggerPreviewUpdate();
    };

    const clearOver = (el: HTMLElement) =>
      el
        .closest('.uc-unifi-order-list')
        ?.querySelectorAll('.is-over')
        .forEach(n => n.classList.remove('is-over'));

    return html`
      <div
        class="settings-section"
        style="background:var(--secondary-background-color);border-radius:8px;padding:16px;margin-bottom:24px;"
      >
        <div
          class="section-title"
          style="font-size:14px;font-weight:700;color:var(--primary-color);margin-bottom:8px;"
        >
          ${localize('editor.unifi.rack_order', lang, 'Rack order')}
        </div>
        <div style="font-size:12px;color:var(--secondary-text-color);margin-bottom:12px;line-height:1.45;">
          ${localize(
            'editor.unifi.rack_order_hint',
            lang,
            'Drag devices to arrange the rack top to bottom.'
          )}
        </div>
        <div class="uc-unifi-order-list">
          ${ordered.map(
            (d, i) => html`
              <div
                class="uc-unifi-order-row"
                draggable="true"
                @dragstart=${(e: DragEvent) => {
                  this._orderDragIndex.set(m.id, i);
                  e.dataTransfer?.setData('text/plain', String(i));
                  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
                }}
                @dragover=${(e: DragEvent) => {
                  e.preventDefault();
                  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                  clearOver(e.currentTarget as HTMLElement);
                  (e.currentTarget as HTMLElement).classList.add('is-over');
                }}
                @dragleave=${(e: DragEvent) =>
                  (e.currentTarget as HTMLElement).classList.remove('is-over')}
                @drop=${(e: DragEvent) => {
                  e.preventDefault();
                  clearOver(e.currentTarget as HTMLElement);
                  const from = this._orderDragIndex.get(m.id);
                  this._orderDragIndex.delete(m.id);
                  if (from != null) commit(from, i);
                }}
                @dragend=${(e: DragEvent) => {
                  clearOver(e.currentTarget as HTMLElement);
                  this._orderDragIndex.delete(m.id);
                }}
              >
                <ha-icon
                  icon="mdi:drag-horizontal-variant"
                  style="--mdc-icon-size:18px;opacity:0.55;cursor:grab;"
                ></ha-icon>
                <span class="pos">${i + 1}</span>
                <ha-icon icon=${this._kindIcon(d.kind)} style="--mdc-icon-size:16px;opacity:0.7;"></ha-icon>
                <div style="flex:1;min-width:0;">
                  <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${d.name}
                  </div>
                  <div style="font-size:11px;opacity:0.6;">${d.model || d.kind}</div>
                </div>
                <button
                  class="uc-unifi-btn secondary"
                  type="button"
                  style="padding:2px 8px;font-size:12px;"
                  ?disabled=${i === 0}
                  title=${localize('editor.unifi.move_up', lang, 'Move up')}
                  @click=${() => commit(i, i - 1)}
                >
                  ↑
                </button>
                <button
                  class="uc-unifi-btn secondary"
                  type="button"
                  style="padding:2px 8px;font-size:12px;"
                  ?disabled=${i === ordered.length - 1}
                  title=${localize('editor.unifi.move_down', lang, 'Move down')}
                  @click=${() => commit(i, i + 1)}
                >
                  ↓
                </button>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  private _renderClientPicker(
    m: UnifiModule,
    hass: HomeAssistant,
    topo: UnifiTopology,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const lang = hass?.locale?.language || 'en';
    const q = this._clientFilter.get(m.id) || '';
    const added = new Set(m.client_ids || []);

    const clients = [...topo.clients].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
    const filtered = q.trim()
      ? clients.filter(c => {
          const needle = q.trim().toLowerCase();
          return (
            c.name.toLowerCase().includes(needle) ||
            c.mac.includes(needle.replace(/[^0-9a-f]/g, ''))
          );
        })
      : clients;

    const toggle = (deviceId: string, add: boolean) => {
      const next = new Set(m.client_ids || []);
      if (add) next.add(deviceId);
      else next.delete(deviceId);
      updateModule({ client_ids: [...next] } as Partial<CardModule>);
      this.triggerPreviewUpdate();
    };

    return html`
      <div
        class="settings-section"
        style="background:var(--secondary-background-color);border-radius:8px;padding:16px;margin-bottom:24px;"
      >
        <div
          class="section-title"
          style="font-size:14px;font-weight:700;color:var(--primary-color);margin-bottom:8px;"
        >
          ${localize('editor.unifi.client_list', lang, 'Clients')}
        </div>
        <div style="font-size:12px;color:var(--secondary-text-color);margin-bottom:12px;line-height:1.45;">
          ${localize(
            'editor.unifi.client_list_hint',
            lang,
            'Clients are opt-in: the Clients view only shows the ones you add here.'
          )}
        </div>

        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="font-size:12px;font-weight:600;">
            ${localize('editor.unifi.clients_added', lang, '{added} of {total} added')
              .replace('{added}', String(added.size))
              .replace('{total}', String(clients.length))}
          </span>
          <span style="flex:1;"></span>
          ${added.size
            ? html`
                <button
                  class="uc-unifi-btn secondary"
                  type="button"
                  style="padding:4px 10px;font-size:11px;"
                  @click=${() => {
                    updateModule({ client_ids: [] } as Partial<CardModule>);
                    this.triggerPreviewUpdate();
                  }}
                >
                  ${localize('editor.unifi.clients_clear', lang, 'Remove all')}
                </button>
              `
            : nothing}
        </div>

        ${this.renderFieldSection(
          localize('editor.unifi.search_clients', lang, 'Search'),
          localize('editor.unifi.search_clients_desc', lang, 'Filter by name or MAC.'),
          hass,
          { q },
          [this.textField('q')],
          (e: CustomEvent) => {
            this._clientFilter.set(m.id, e.detail.value?.q ?? '');
            this.triggerPreviewUpdate(true);
          }
        )}

        <div style="max-height:280px;overflow:auto;margin-top:8px;">
          ${filtered.length === 0
            ? html`<div style="font-size:12px;opacity:0.65;padding:8px 0;">
                ${localize('editor.unifi.no_client_match', lang, 'No clients match this filter.')}
              </div>`
            : filtered.map(c => {
                const isAdded = added.has(c.deviceId);
                return html`
                  <div
                    style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--divider-color);"
                  >
                    <ha-icon
                      icon="mdi:account-network"
                      style="--mdc-icon-size:18px;opacity:0.7;"
                    ></ha-icon>
                    <div style="flex:1;min-width:0;">
                      <div style="font-weight:600;font-size:13px;">${c.name}</div>
                      <div style="font-size:11px;opacity:0.6;">
                        ${c.mac ? c.mac.match(/.{1,2}/g)?.join(':') : '—'}
                      </div>
                    </div>
                    <button
                      class="uc-unifi-btn ${isAdded ? 'secondary' : ''}"
                      type="button"
                      style="padding:4px 10px;font-size:11px;"
                      @click=${() => toggle(c.deviceId, !isAdded)}
                    >
                      ${isAdded
                        ? localize('editor.unifi.client_remove', lang, 'Remove')
                        : localize('editor.unifi.client_add', lang, 'Add')}
                    </button>
                  </div>
                `;
              })}
        </div>
      </div>
    `;
  }

  // ── General tab ────────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as UnifiModule;
    const lang = hass?.locale?.language || 'en';

    if (!hasProAccess(hass)) {
      return renderProLockUI(
        lang,
        localize(
          'editor.unifi.pro_description',
          lang,
          'UniFi Network builds a live virtual rack, port panel, topology map, and client monitor from your official UniFi integration — with animated port lights, utilization rings, and one-click sensor setup.'
        )
      );
    }

    const topo = this._topology(m, hass);
    if (m.use_device_images !== false) {
      ucUnifiDeviceDb.ensureLoaded(() => this.triggerPreviewUpdate());
    }
    const curated = this._maybeSeedCuration(m, topo, updates => {
      updateModule(updates as Partial<CardModule>);
    });
    const devices = this._visibleDevices(curated, topo);
    const caps = ensureCapabilityReport(m.id, hass, () => this.triggerPreviewUpdate());
    const hiddenCount = (curated.hidden_device_ids || []).length;
    const view = curated.view || 'rack';
    // Which option groups make sense for each view
    const usesDevices = view === 'rack' || view === 'ports' || view === 'devices' || view === 'topology';
    const usesPhotos = view === 'rack' || view === 'devices';
    const usesAnimation = view !== 'clients' && view !== 'wan';

    return html`
      ${this.injectUcFormStyles()}
      <style>
        ${this.getStyles()}
      </style>
      <div class="module-general-settings">
        ${renderSetupWizard(curated, hass, caps, {
          onDismiss: () => {
            updateModule({ setup_dismissed: true } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          onEnabled: () => this.triggerPreviewUpdate(),
          triggerPreviewUpdate: () => this.triggerPreviewUpdate(),
        })}

        ${this.renderSettingsSection(
          localize('editor.unifi.section_view', lang, 'View'),
          localize(
            'editor.unifi.section_view_desc',
            lang,
            'Pick how this card visualizes your UniFi network.'
          ),
          []
        )}

        ${this.renderSegmentedField(
          localize('editor.unifi.view', lang, 'View mode'),
          localize(
            'editor.unifi.view_desc',
            lang,
            'Rack is the hero layout. Ports, devices, topology, clients and WAN cover the rest.'
          ),
          curated.view || 'rack',
          [
            { value: 'rack', label: localize('editor.unifi.view_rack', lang, 'Rack'), icon: 'mdi:server' },
            { value: 'ports', label: localize('editor.unifi.view_ports', lang, 'Ports'), icon: 'mdi:ethernet' },
            {
              value: 'devices',
              label: localize('editor.unifi.view_devices', lang, 'Devices'),
              icon: 'mdi:access-point-network',
            },
            {
              value: 'topology',
              label: localize('editor.unifi.view_topology', lang, 'Topology'),
              icon: 'mdi:sitemap',
            },
            {
              value: 'clients',
              label: localize('editor.unifi.view_clients', lang, 'Clients'),
              icon: 'mdi:account-network',
            },
            { value: 'wan', label: localize('editor.unifi.view_wan', lang, 'WAN'), icon: 'mdi:wan' },
          ],
          next => {
            updateModule({ view: next as UnifiViewMode } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          3
        )}

        <div
          style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:8px;background:rgba(var(--rgb-primary-color),0.08);margin:8px 0 24px;"
        >
          <ha-icon
            icon=${topo.hasUnifiIntegration || topo.devices.length
              ? 'mdi:check-circle'
              : 'mdi:alert-circle-outline'}
            style="color:var(--primary-color);--mdc-icon-size:22px;flex-shrink:0;"
          ></ha-icon>
          <div style="min-width:0;">
            <div style="font-size:14px;font-weight:600;">
              ${topo.devices.length
                ? localize(
                    'editor.unifi.found_infra',
                    lang,
                    'Found {count} UniFi devices ({shown} shown)'
                  )
                    .replace('{count}', String(topo.devices.length))
                    .replace('{shown}', String(Math.max(0, topo.devices.length - hiddenCount)))
                : localize('editor.unifi.found_none', lang, 'No UniFi devices found yet')}
            </div>
            <div style="font-size:12px;color:var(--secondary-text-color);">
              ${localize(
                'editor.unifi.found_hint_infra',
                lang,
                'Gateways, switches, APs and PDUs from the UniFi Network integration.'
              )}
              ${topo.clients.length
                ? ` ${localize(
                    'editor.unifi.found_clients',
                    lang,
                    '{count} clients with bandwidth sensors'
                  ).replace('{count}', String(topo.clients.length))}.`
                : ''}
            </div>
          </div>
        </div>

        ${usesDevices && topo.devices.length
          ? html`
              ${this.renderSettingsSection(
                localize('editor.unifi.section_devices', lang, 'Devices'),
                localize(
                  'editor.unifi.section_devices_desc',
                  lang,
                  'Show, hide, and order the UniFi hardware this card displays. Connected clients are separate.'
                ),
                []
              )}
              ${this._renderDevicePicker(curated, hass, topo, updateModule)}
            `
          : nothing}

        ${view === 'rack' ? this._renderRackOrder(curated, hass, topo, updateModule) : nothing}

        ${view === 'clients' && topo.clients.length
          ? this._renderClientPicker(curated, hass, topo, updateModule)
          : nothing}

        ${view === 'ports'
          ? this.renderSegmentedField(
              localize('editor.unifi.ports_device', lang, 'Ports device'),
              localize(
                'editor.unifi.ports_device_desc',
                lang,
                'Which switch or gateway the Ports view focuses on.'
              ),
              curated.ports_device_id || devices.find(d => d.ports.length)?.deviceId || '',
              devices
                .filter(d => d.ports.length > 0)
                .map(d => ({ value: d.deviceId, label: d.name })),
              next => {
                updateModule({ ports_device_id: next } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              }
            )
          : nothing}

        ${this.renderSettingsSection(
          localize('editor.unifi.section_display', lang, 'Display'),
          localize('editor.unifi.section_display_desc', lang, 'Title, style, and eye-candy controls.'),
          [
            {
              title: localize('editor.unifi.show_title', lang, 'Show title'),
              description: localize('editor.unifi.show_title_desc', lang, 'Show the card title above the view.'),
              hass,
              data: { show_title: m.show_title !== false },
              schema: [this.booleanField('show_title')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_title: e.detail.value?.show_title } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.unifi.title', lang, 'Title'),
              description: localize('editor.unifi.title_desc', lang, 'Optional heading text.'),
              hass,
              data: { title: m.title || '' },
              schema: [this.textField('title')],
              onChange: (e: CustomEvent) => {
                updateModule({ title: e.detail.value?.title ?? '' } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.unifi.blank_background', lang, 'Blank background'),
              description: localize(
                'editor.unifi.blank_background_desc',
                lang,
                'No card or container backgrounds — components float on the dashboard.'
              ),
              hass,
              data: { blank_background: m.blank_background === true },
              schema: [this.booleanField('blank_background')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  blank_background: e.detail.value?.blank_background,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            ...(view === 'ports' || view === 'devices'
              ? [
                  {
                    title: localize('editor.unifi.show_advanced', lang, 'Show advanced info'),
                    description: localize(
                      'editor.unifi.show_advanced_desc',
                      lang,
                      'Extra stats like RX/TX rates, uptime, and port counts.'
                    ),
                    hass,
                    data: { show_advanced: m.show_advanced !== false },
                    schema: [this.booleanField('show_advanced')],
                    onChange: (e: CustomEvent) => {
                      updateModule({
                        show_advanced: e.detail.value?.show_advanced,
                      } as Partial<CardModule>);
                      this.triggerPreviewUpdate();
                    },
                  },
                ]
              : []),
            ...(view === 'devices' || view === 'wan'
              ? [
                  {
                    title: localize('editor.unifi.show_sparklines', lang, 'Show sparklines'),
                    description: localize(
                      'editor.unifi.show_sparklines_desc',
                      lang,
                      'Mini history graphs on devices and WAN cards (uses recorder).'
                    ),
                    hass,
                    data: { show_sparklines: m.show_sparklines !== false },
                    schema: [this.booleanField('show_sparklines')],
                    onChange: (e: CustomEvent) => {
                      updateModule({
                        show_sparklines: e.detail.value?.show_sparklines,
                      } as Partial<CardModule>);
                      this.triggerPreviewUpdate();
                    },
                  },
                ]
              : []),
            ...(view === 'clients'
              ? [
                  {
                    title: localize('editor.unifi.include_clients', lang, 'Include clients'),
                    description: localize(
                      'editor.unifi.include_clients_desc',
                      lang,
                      'Discover client bandwidth sensors for the Clients view.'
                    ),
                    hass,
                    data: { include_clients: m.include_clients !== false },
                    schema: [this.booleanField('include_clients')],
                    onChange: (e: CustomEvent) => {
                      updateModule({
                        include_clients: e.detail.value?.include_clients,
                      } as Partial<CardModule>);
                      this.triggerPreviewUpdate();
                    },
                  },
                ]
              : []),
            ...(usesPhotos
              ? [
                  {
                    title: localize('editor.unifi.use_device_images', lang, 'Real device photos'),
                    description: localize(
                      'editor.unifi.use_device_images_desc',
                      lang,
                      'Show actual Ubiquiti product photos from ui.com. Falls back to drawn faceplates when offline.'
                    ),
                    hass,
                    data: { use_device_images: m.use_device_images !== false },
                    schema: [this.booleanField('use_device_images')],
                    onChange: (e: CustomEvent) => {
                      updateModule({
                        use_device_images: e.detail.value?.use_device_images,
                      } as Partial<CardModule>);
                      this.triggerPreviewUpdate();
                    },
                  },
                ]
              : []),
            ...(view === 'rack'
              ? [
                  {
                    title: localize('editor.unifi.show_port_labels', lang, 'Port tooltips'),
                    description: localize(
                      'editor.unifi.show_port_labels_desc',
                      lang,
                      'Show port name / speed tooltips on faceplates.'
                    ),
                    hass,
                    data: { show_port_labels: m.show_port_labels !== false },
                    schema: [this.booleanField('show_port_labels')],
                    onChange: (e: CustomEvent) => {
                      updateModule({
                        show_port_labels: e.detail.value?.show_port_labels,
                      } as Partial<CardModule>);
                      this.triggerPreviewUpdate();
                    },
                  },
                ]
              : []),
          ]
        )}

        ${view === 'rack'
          ? this.renderSegmentedField(
              localize('editor.unifi.rack_style', lang, 'Rack style'),
              localize('editor.unifi.rack_style_desc', lang, 'Visual theme for the virtual rack and faceplates.'),
              m.rack_style || 'dark',
              [
                { value: 'dark', label: localize('editor.unifi.style_dark', lang, 'Dark'), icon: 'mdi:weather-night' },
                { value: 'light', label: localize('editor.unifi.style_light', lang, 'Light'), icon: 'mdi:white-balance-sunny' },
                { value: 'glass', label: localize('editor.unifi.style_glass', lang, 'Glass'), icon: 'mdi:blur' },
                {
                  value: 'blueprint',
                  label: localize('editor.unifi.style_blueprint', lang, 'Blueprint'),
                  icon: 'mdi:blueprint',
                },
                {
                  value: 'blank',
                  label: localize('editor.unifi.style_blank', lang, 'Blank'),
                  icon: 'mdi:border-none-variant',
                },
              ],
              next => {
                updateModule({ rack_style: next as UnifiRackStyle } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
              5
            )
          : nothing}

        ${usesAnimation
          ? this.renderSegmentedField(
              localize('editor.unifi.animation', lang, 'Animation'),
              localize(
                'editor.unifi.animation_desc',
                lang,
                'Port blink, traffic flow, and ring motion. Respects prefers-reduced-motion.'
              ),
              m.animation_intensity || 'full',
              [
                { value: 'full', label: localize('editor.unifi.anim_full', lang, 'Full'), icon: 'mdi:flash' },
                {
                  value: 'subtle',
                  label: localize('editor.unifi.anim_subtle', lang, 'Subtle'),
                  icon: 'mdi:flash-outline',
                },
                { value: 'off', label: localize('editor.unifi.anim_off', lang, 'Off'), icon: 'mdi:flash-off' },
              ],
              next => {
                updateModule({
                  animation_intensity: next as UnifiAnimationIntensity,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
              3
            )
          : nothing}

        ${view === 'topology'
          ? this.renderSegmentedField(
              localize('editor.unifi.topology_layout', lang, 'Topology layout'),
              localize('editor.unifi.topology_layout_desc', lang, 'Tree follows uplinks; radial fans out from the gateway.'),
              m.topology_layout || 'tree',
              [
                { value: 'tree', label: localize('editor.unifi.layout_tree', lang, 'Tree'), icon: 'mdi:file-tree' },
                {
                  value: 'radial',
                  label: localize('editor.unifi.layout_radial', lang, 'Radial'),
                  icon: 'mdi:chart-bubble',
                },
              ],
              next => {
                updateModule({
                  topology_layout: next as UnifiTopologyLayout,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
              2
            )
          : nothing}

        ${this.renderSettingsSection(
          localize('editor.unifi.section_colors', lang, 'Colors'),
          localize('editor.unifi.section_colors_desc', lang, 'Optional accent overrides.'),
          []
        )}

        ${this.renderColorField(
          localize('editor.unifi.accent_color', lang, 'Accent'),
          localize('editor.unifi.accent_color_desc', lang, 'Rings, highlights, and flow accents.'),
          hass,
          m.accent_color || '',
          '',
          (value: string) => {
            updateModule({ accent_color: value || undefined } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}

        ${m.setup_dismissed
          ? html`
              <div style="margin-top:16px;">
                <button
                  class="uc-unifi-btn secondary"
                  type="button"
                  @click=${() => {
                    invalidateCapabilityReport(m.id);
                    updateModule({ setup_dismissed: false } as Partial<CardModule>);
                    this.triggerPreviewUpdate();
                  }}
                >
                  ${localize('editor.unifi.show_setup', lang, 'Show setup wizard')}
                </button>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  // ── Preview ────────────────────────────────────────────────────────────────

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as UnifiModule;
    const lang = hass?.locale?.language || 'en';

    if (!hasProAccess(hass)) {
      return renderProLockedPreview(
        lang,
        localize('editor.unifi.title_default', lang, 'UniFi Network')
      );
    }

    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);
    const topo = this._topology(m, hass);
    if (m.use_device_images !== false) {
      ucUnifiDeviceDb.ensureLoaded(() => this.triggerPreviewUpdate());
    }

    const patch = (updates: Partial<UnifiModule>) => {
      try {
        window.dispatchEvent(
          new CustomEvent('uc-module-patch-by-id', {
            detail: { moduleId: m.id, updates },
            bubbles: true,
            composed: true,
          })
        );
      } catch {
        /* ignore */
      }
      this.triggerPreviewUpdate(true);
    };

    const curated = this._maybeSeedCuration(m, topo, updates => patch(updates));
    const caps = ensureCapabilityReport(m.id, hass, () => this.triggerPreviewUpdate());
    const animClass =
      curated.animation_intensity === 'off'
        ? 'anim-off'
        : curated.animation_intensity === 'subtle'
          ? 'anim-subtle'
          : 'anim-full';

    const onDeviceClick = (device: UnifiDevice) => {
      const entity =
        device.stateEntityId ||
        device.trackerEntityId ||
        device.cpuEntityId ||
        device.entityIds[0];
      if (entity && hass) {
        const ev = new CustomEvent('hass-more-info', {
          detail: { entityId: entity },
          bubbles: true,
          composed: true,
        });
        document.querySelector('home-assistant')?.dispatchEvent(ev);
      }
    };

    const view = curated.view || 'rack';
    const visible = this._visibleDevices(curated, topo);
    const hiddenCount = (curated.hidden_device_ids || []).length;
    let body: TemplateResult;

    switch (view) {
      case 'ports':
        body = renderPortsView(curated, hass, topo, {
          onSelectDevice: deviceId => patch({ ports_device_id: deviceId }),
          onTogglePoe: (entityId, turnOn) =>
            this._callService(hass, 'switch', turnOn ? 'turn_on' : 'turn_off', {
              entity_id: entityId,
            }),
          onPowerCycle: entityId =>
            this._callService(hass, 'button', 'press', { entity_id: entityId }),
          onTogglePort: (entityId, turnOn) =>
            this._callService(hass, 'switch', turnOn ? 'turn_on' : 'turn_off', {
              entity_id: entityId,
            }),
          triggerPreviewUpdate: () => this.triggerPreviewUpdate(true),
        });
        break;
      case 'devices':
        body = renderDevicesView(curated, hass, topo, {
          onDeviceClick,
          triggerPreviewUpdate: () => this.triggerPreviewUpdate(),
        });
        break;
      case 'topology':
        body = renderTopologyView(curated, hass, topo, { onDeviceClick });
        break;
      case 'clients':
        body = renderClientsView(curated, hass, topo, {
          onBlock: (entityId, block) =>
            // UniFi block switch: on = allowed, off = blocked
            this._callService(hass, 'switch', block ? 'turn_off' : 'turn_on', {
              entity_id: entityId,
            }),
          triggerPreviewUpdate: () => this.triggerPreviewUpdate(true),
        });
        break;
      case 'wan':
        body = renderWanView(curated, hass, topo, {
          triggerPreviewUpdate: () => this.triggerPreviewUpdate(),
        });
        break;
      case 'rack':
      default:
        body = renderRackView(curated, hass, topo, { onDeviceClick });
        break;
    }

    return html`
      <div
        class="uc-unifi-wrapper ${hoverClass}"
        style="${designStyles}"
      >
        ${this.wrapWithAnimation(
          html`
            <div class="uc-unifi ${animClass} ${curated.blank_background ? 'is-blank' : ''}" style="${curated.accent_color ? `--uc-unifi-accent:${curated.accent_color};` : ''}${curated.text_color ? `color:${curated.text_color};` : ''}">
              <style>
                ${this.getStyles()}
              </style>

              ${curated.show_title !== false && curated.title
                ? html`<div class="uc-unifi-title">${curated.title}</div>`
                : nothing}

              ${hiddenCount > 0 && view === 'rack'
                ? html`
                    <div class="uc-unifi-curation-note">
                      ${localize(
                        'editor.unifi.curation_note',
                        lang,
                        'Showing {shown} of {total} UniFi devices. Manage visibility in the General tab.'
                      )
                        .replace('{shown}', String(visible.length))
                        .replace('{total}', String(topo.devices.length))}
                    </div>
                  `
                : nothing}

              ${renderSetupWizard(curated, hass, caps, {
                onDismiss: () => patch({ setup_dismissed: true }),
                onEnabled: () => this.triggerPreviewUpdate(),
                triggerPreviewUpdate: () => this.triggerPreviewUpdate(),
              })}

              ${!topo.hasUnifiIntegration && topo.devices.length === 0
                ? html`
                    <div class="uc-unifi-empty">
                      <ha-icon icon="mdi:lan-disconnect"></ha-icon>
                      <div>
                        ${localize(
                          'editor.unifi.empty',
                          lang,
                          'No UniFi Network integration detected. Add it in Home Assistant, then this card will auto-discover your gear.'
                        )}
                      </div>
                      <a
                        href="https://www.home-assistant.io/integrations/unifi/"
                        target="_blank"
                        rel="noopener"
                        >home-assistant.io/integrations/unifi</a
                      >
                    </div>
                  `
                : body}
            </div>
          `,
          module,
          hass
        )}
      </div>
    `;
  }

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}
      ${unifiModuleStyles()}
    `;
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    return { valid: errors.length === 0, errors };
  }
}
