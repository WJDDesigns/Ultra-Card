import { TemplateResult, html, svg } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import {
  CardModule,
  EnergyDisplayModule,
  EnergyNode,
  EnergyNodeType,
  EnergyDisplayStyle,
  UltraCardConfig,
} from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import { localize } from '../localize/localize';
import '../components/ultra-color-picker';

const DEFAULT_NODE_COLORS: Record<EnergyNodeType, string> = {
  solar: '#f59e0b',
  grid: '#3b82f6',
  battery: '#22c55e',
  home: '#06b6d4',
  device: '#8b5cf6',
};

const DEFAULT_NODE_ICONS: Record<EnergyNodeType, string> = {
  solar: 'mdi:solar-power',
  grid: 'mdi:transmission-tower',
  battery: 'mdi:battery',
  home: 'mdi:home',
  device: 'mdi:flash',
};

const DEFAULT_NODE_LABELS: Record<EnergyNodeType, string> = {
  solar: 'Solar',
  grid: 'Grid',
  battery: 'Battery',
  home: 'Home',
  device: 'Device',
};

function createDefaultNode(
  type: EnergyNodeType,
  idGen: (prefix: string) => string
): EnergyNode {
  return {
    id: idGen(`energy_${type}`),
    node_type: type,
    entity: '',
    label: DEFAULT_NODE_LABELS[type],
    icon: DEFAULT_NODE_ICONS[type],
    color: DEFAULT_NODE_COLORS[type],
    show_arrow: true,
    enabled: true,
  };
}

/**
 * Energy Display Pro Module
 *
 * Renders energy flow between Solar, Grid, Battery, Home and custom device nodes
 * with three styles: Circle Flow, Box Flow, and Sankey.
 */
export class UltraEnergyDisplayModule extends BaseUltraModule {
  private _draggedDevice: EnergyNode | null = null;
  private _expandedCoreSections = new Set<string>();
  private _expandedDeviceIds = new Set<string>();

  metadata: ModuleMetadata = {
    type: 'energy_display',
    title: 'Energy Display',
    description: 'Visualize energy flow between grid, solar, battery, home and devices',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:lightning-bolt',
    category: 'data',
    tags: ['pro', 'premium', 'energy', 'solar', 'grid', 'battery', 'power', 'flow', 'sankey'],
  };

  createDefault(id?: string, _hass?: HomeAssistant): EnergyDisplayModule {
    const gen = (p: string) => this.generateId(p);
    return {
      id: id || this.generateId('energy_display'),
      type: 'energy_display',
      display_style: 'circle_flow',
      nodes: [
        createDefaultNode('solar', gen),
        createDefaultNode('grid', gen),
        createDefaultNode('battery', gen),
        createDefaultNode('home', gen),
      ],
      show_self_sufficiency: true,
      animation_speed: 'normal',
      flow_line_width: 2,
      show_values: true,
      unit_display: 'auto',
      show_labels: true,
      show_icons: true,
      circle_size: 48,
      node_spacing: 24,
      box_border_width: 2,
      box_border_radius: 12,
      gauge_size: 80,
      sankey_width: 400,
      sankey_curve_factor: 0.5,
      sankey_column_spacing: 16,
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const base = super.validate(module);
    const ed = module as EnergyDisplayModule;
    const errors = [...base.errors];
    if (!ed.nodes || !Array.isArray(ed.nodes)) {
      errors.push('At least one energy node is required');
    }
    return { valid: errors.length === 0, errors };
  }

  getStyles(): string {
    return `
      .energy-display-preview-wrapper {
        display: block;
      }
      .energy-display-module {
        position: relative;
      }
      .energy-display-module .energy-flow-dot {
        offset-path: var(--flow-path);
        offset-distance: 0%;
        animation: energy-flow-dot var(--flow-duration) linear infinite;
        will-change: offset-distance;
      }
      .energy-display-module .energy-flow-dot[style*="0s"] {
        animation: none;
        will-change: auto;
      }
      @keyframes energy-flow-dot {
        to { offset-distance: 100%; }
      }
      .energy-display-module .node-value {
        transition: opacity 0.5s ease, transform 0.3s ease;
      }
      .energy-display-module foreignObject {
        pointer-events: none;
      }
      .energy-display-module foreignObject * {
        pointer-events: auto;
      }
      .energy-display-module .energy-node circle {
        transition: stroke-width 0.2s ease, filter 0.2s ease;
      }
      .energy-display-module .energy-node:hover circle {
        filter: brightness(1.05);
      }
      /* Only max-width so explicit height on SVG is preserved (dashboard flex can collapse height: auto) */
      .energy-display-module svg {
        max-width: 100%;
      }
      .energy-display-module.energy-circle-flow svg,
      .energy-display-module.energy-sankey svg {
        min-height: 200px;
      }
    `;
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const edModule = module as EnergyDisplayModule;
    const lang = hass?.locale?.language || 'en';

    const integrationUser = ucCloudAuthService.checkIntegrationAuth(hass);
    const isPro =
      integrationUser?.subscription?.tier === 'pro' &&
      integrationUser?.subscription?.status === 'active';

    if (!isPro) {
      return this._renderProLockUI(lang);
    }

    return this._renderEditorContent(edModule, hass, config, updateModule);
  }

  private _renderProLockUI(lang: string): TemplateResult {
    return html`
      <div
        class="pro-lock-container"
        style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px;
          text-align: center;
          background: var(--secondary-background-color);
          border-radius: 12px;
          margin: 16px;
        "
      >
        <ha-icon
          icon="mdi:lock"
          style="color: var(--primary-color); --mdi-icon-size: 48px; margin-bottom: 16px;"
        ></ha-icon>
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">
          ${localize('editor.pro.feature_locked', lang, 'Pro Feature')}
        </div>
        <div
          style="font-size: 14px; color: var(--secondary-text-color); margin-bottom: 16px; max-width: 300px;"
        >
          ${localize(
            'editor.energy_display.pro_description',
            lang,
            'Energy Display is a Pro feature. Visualize energy flow between grid, solar, battery, home and devices with Circle Flow, Box Flow, or Sankey styles.'
          )}
        </div>
        <a
          href="https://ultracard.io/pro"
          target="_blank"
          style="
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: var(--primary-color);
            color: var(--text-primary-color, white);
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
          "
        >
          <ha-icon icon="mdi:crown" style="--mdi-icon-size: 20px;"></ha-icon>
          ${localize('editor.pro.upgrade_button', lang, 'Upgrade to Pro')}
        </a>
      </div>
    `;
  }

  private _getCoreNodes(ed: EnergyDisplayModule): EnergyNode[] {
    const nodes = ed.nodes || [];
    const order: EnergyNodeType[] = ['solar', 'grid', 'battery', 'home'];
    const result: EnergyNode[] = [];
    for (const t of order) {
      const found = nodes.find(n => n.node_type === t);
      result.push(
        found || {
          id: this.generateId(`energy_${t}`),
          node_type: t,
          entity: '',
          label: DEFAULT_NODE_LABELS[t],
          icon: DEFAULT_NODE_ICONS[t],
          color: DEFAULT_NODE_COLORS[t],
          show_arrow: true,
          enabled: true,
        }
      );
    }
    return result;
  }

  private _getDeviceNodes(ed: EnergyDisplayModule): EnergyNode[] {
    return (ed.nodes || []).filter(n => n.node_type === 'device');
  }

  private _setNodes(ed: EnergyDisplayModule, updateModule: (u: Partial<EnergyDisplayModule>) => void, core: EnergyNode[], devices: EnergyNode[]): void {
    updateModule({ nodes: [...core, ...devices] });
  }

  private _updateCoreNode(
    ed: EnergyDisplayModule,
    type: EnergyNodeType,
    updates: Partial<EnergyNode>,
    updateModule: (u: Partial<EnergyDisplayModule>) => void
  ): void {
    const core = this._getCoreNodes(ed);
    const devices = this._getDeviceNodes(ed);
    const idx = core.findIndex(n => n.node_type === type);
    if (idx === -1) return;
    core[idx] = { ...core[idx], ...updates };
    this._setNodes(ed, updateModule, core, devices);
  }

  private _updateDeviceAtIndex(
    ed: EnergyDisplayModule,
    deviceIndex: number,
    updates: Partial<EnergyNode>,
    updateModule: (u: Partial<EnergyDisplayModule>) => void
  ): void {
    const core = this._getCoreNodes(ed);
    const devices = this._getDeviceNodes(ed);
    if (deviceIndex < 0 || deviceIndex >= devices.length) return;
    devices[deviceIndex] = { ...devices[deviceIndex], ...updates };
    this._setNodes(ed, updateModule, core, devices);
  }

  private _addDevice(ed: EnergyDisplayModule, updateModule: (u: Partial<EnergyDisplayModule>) => void): void {
    const core = this._getCoreNodes(ed);
    const devices = this._getDeviceNodes(ed);
    const newDevice: EnergyNode = {
      id: this.generateId('energy_device'),
      node_type: 'device',
      entity: '',
      label: 'Device',
      icon: DEFAULT_NODE_ICONS.device,
      color: DEFAULT_NODE_COLORS.device,
      show_arrow: true,
      enabled: true,
    };
    this._expandedDeviceIds.add(newDevice.id);
    this._setNodes(ed, updateModule, core, [...devices, newDevice]);
  }

  private _deleteDevice(ed: EnergyDisplayModule, deviceIndex: number, updateModule: (u: Partial<EnergyDisplayModule>) => void): void {
    const core = this._getCoreNodes(ed);
    const devices = this._getDeviceNodes(ed);
    const removed = devices[deviceIndex];
    if (removed) this._expandedDeviceIds.delete(removed.id);
    const next = devices.filter((_, i) => i !== deviceIndex);
    this._setNodes(ed, updateModule, core, next);
  }

  private _reorderDevices(
    ed: EnergyDisplayModule,
    fromIndex: number,
    toIndex: number,
    updateModule: (u: Partial<EnergyDisplayModule>) => void
  ): void {
    const core = this._getCoreNodes(ed);
    let devices = [...this._getDeviceNodes(ed)];
    const [removed] = devices.splice(fromIndex, 1);
    devices.splice(toIndex, 0, removed);
    this._setNodes(ed, updateModule, core, devices);
  }

  private _toggleCoreSection(type: string): void {
    if (this._expandedCoreSections.has(type)) this._expandedCoreSections.delete(type);
    else this._expandedCoreSections.add(type);
    window.dispatchEvent(new CustomEvent('ultra-card-module-update'));
  }

  private _toggleDeviceExpand(id: string): void {
    if (this._expandedDeviceIds.has(id)) this._expandedDeviceIds.delete(id);
    else this._expandedDeviceIds.add(id);
    window.dispatchEvent(new CustomEvent('ultra-card-module-update'));
  }

  private _onDeviceDragStart(e: DragEvent, node: EnergyNode): void {
    this._draggedDevice = node;
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  }

  private _onDeviceDragEnd(): void {
    this._draggedDevice = null;
    window.dispatchEvent(new CustomEvent('ultra-card-module-update'));
  }

  private _onDeviceDrop(
    e: DragEvent,
    dropIndex: number,
    ed: EnergyDisplayModule,
    updateModule: (u: Partial<EnergyDisplayModule>) => void
  ): void {
    e.preventDefault();
    if (!this._draggedDevice) return;
    const devices = this._getDeviceNodes(ed);
    const fromIndex = devices.findIndex(d => d.id === this._draggedDevice!.id);
    if (fromIndex === -1 || fromIndex === dropIndex) return;
    this._reorderDevices(ed, fromIndex, dropIndex, updateModule);
    this._draggedDevice = null;
  }

  private _renderEditorContent(
    edModule: EnergyDisplayModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<EnergyDisplayModule>) => void
  ): TemplateResult {
    const lang = hass?.locale?.language || 'en';
    const coreNodes = this._getCoreNodes(edModule);
    const deviceNodes = this._getDeviceNodes(edModule);
    const style = edModule.display_style || 'circle_flow';

    return html`
      <style>
        ${this.injectUcFormStyles()} ${BaseUltraModule.getSliderStyles()}
        .settings-section {
          background: var(--secondary-background-color);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--primary-color);
          margin-bottom: 16px;
        }
        .style-picker {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .style-option {
          padding: 12px;
          border: 2px solid var(--divider-color);
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s ease;
        }
        .style-option:hover { border-color: var(--primary-color); opacity: 0.9; }
        .style-option.selected { border-color: var(--primary-color); background: rgba(var(--rgb-primary-color), 0.08); }
        .style-option ha-icon { --mdi-icon-size: 28px; color: var(--primary-color); }
        .core-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: var(--card-background-color);
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          border: 1px solid var(--divider-color);
        }
        .core-section-header:hover { background: var(--primary-color); opacity: 0.9; }
        .core-section-header ha-icon.expand-icon { transition: transform 0.2s ease; }
        .core-section-header ha-icon.expand-icon.expanded { transform: rotate(180deg); }
        .entity-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: var(--card-background-color);
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: move;
          border: 1px solid var(--divider-color);
          transition: all 0.2s ease;
        }
        .entity-row.dragging { opacity: 0.5; transform: scale(0.95); }
        .entity-row .drag-handle { cursor: grab; color: var(--secondary-text-color); flex-shrink: 0; }
        .entity-row .expand-icon { cursor: pointer; flex-shrink: 0; }
        .entity-row .expand-icon.expanded { transform: rotate(180deg); }
        .entity-row .delete-icon { cursor: pointer; color: var(--error-color); flex-shrink: 0; }
        .entity-settings { padding: 16px; background: rgba(var(--rgb-primary-color), 0.05); border-left: 3px solid var(--primary-color); border-radius: 0 8px 8px 0; margin-bottom: 8px; }
        .add-entity-btn {
          width: 100%; padding: 12px; background: var(--primary-color); color: var(--text-primary-color); border: none; border-radius: 8px;
          cursor: pointer; font-size: 14px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
      </style>

      <!-- Section 1: Display Style -->
      <div class="settings-section">
        <div class="section-title">Display Style</div>
        <div class="style-picker">
          ${(['circle_flow', 'box_flow', 'sankey'] as const).map(
            s => html`
              <div
                class="style-option ${style === s ? 'selected' : ''}"
                @click=${() => updateModule({ display_style: s })}
              >
                <ha-icon icon=${s === 'circle_flow' ? 'mdi:circle-double' : s === 'box_flow' ? 'mdi:view-grid' : 'mdi:chart-sankey'}></ha-icon>
                <div style="font-size: 13px; margin-top: 6px;">${s === 'circle_flow' ? 'Circle Flow' : s === 'box_flow' ? 'Box Flow' : 'Sankey'}</div>
              </div>
            `
          )}
        </div>
      </div>

      <!-- Section 2: Core Energy Nodes -->
      <div class="settings-section">
        <div class="section-title">Core Energy Nodes</div>
        <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;">
          Configure Solar, Grid, Battery, and Home. Use power sensor entities (W).
        </div>
        ${coreNodes.map(node => {
          const isExpanded = this._expandedCoreSections.has(node.node_type);
          return html`
            <div>
              <div
                class="core-section-header"
                @click=${() => this._toggleCoreSection(node.node_type)}
              >
                <span style="display: flex; align-items: center; gap: 8px;">
                  <ha-icon icon="${node.icon || DEFAULT_NODE_ICONS[node.node_type]}"></ha-icon>
                  <span>${node.label || DEFAULT_NODE_LABELS[node.node_type]}</span>
                </span>
                <ha-icon class="expand-icon ${isExpanded ? 'expanded' : ''}" icon="mdi:chevron-down"></ha-icon>
              </div>
              ${isExpanded
                ? html`
                    <div class="entity-settings">
                      ${this.renderEntityPickerWithVariables(hass, config, 'entity', node.entity || '', (v) => this._updateCoreNode(edModule, node.node_type, { entity: v }, updateModule), ['sensor'], `${node.node_type} power entity`)}
                      ${node.node_type === 'battery'
                        ? this.renderEntityPickerWithVariables(hass, config, 'secondary_entity', node.secondary_entity || '', (v) => this._updateCoreNode(edModule, node.node_type, { secondary_entity: v || undefined }, updateModule), ['sensor'], 'Battery SoC % (optional)')
                        : node.node_type === 'grid'
                          ? this.renderEntityPickerWithVariables(hass, config, 'secondary_entity', node.secondary_entity || '', (v) => this._updateCoreNode(edModule, node.node_type, { secondary_entity: v || undefined }, updateModule), ['sensor'], 'Grid export sensor (optional)')
                          : ''}
                      ${this.renderTextInput('Label', node.label || '', (v) => this._updateCoreNode(edModule, node.node_type, { label: v }, updateModule))}
                      <div class="form-field" style="margin-top: 12px;">
                        <label class="form-label">Icon</label>
                        <ha-form .hass=${hass} .data=${{ icon: node.icon || '' }} .schema=${[{ name: 'icon', selector: { icon: {} } }]} @value-changed=${(e: CustomEvent) => this._updateCoreNode(edModule, node.node_type, { icon: e.detail.value.icon }, updateModule)}></ha-form>
                      </div>
                      <div class="form-field" style="margin-top: 12px;">
                        <label class="form-label">Color</label>
                        <ultra-color-picker .label="" .value="${node.color || ''}" .defaultValue="${DEFAULT_NODE_COLORS[node.node_type]}" .hass=${hass} @value-changed=${(e: CustomEvent) => this._updateCoreNode(edModule, node.node_type, { color: e.detail.value }, updateModule)}></ultra-color-picker>
                      </div>
                      ${this.renderCheckbox('Show directional arrow', node.show_arrow !== false, (v) => this._updateCoreNode(edModule, node.node_type, { show_arrow: v }, updateModule))}
                      ${this.renderCheckbox('Enabled', node.enabled !== false, (v) => this._updateCoreNode(edModule, node.node_type, { enabled: v }, updateModule))}
                    </div>
                  `
                : ''}
            </div>
          `;
        })}
      </div>

      <!-- Section 3: Custom Device Nodes -->
      <div class="settings-section">
        <div class="section-title">Custom Device Nodes</div>
        <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;">
          Add devices to show individual power consumption. Drag to reorder.
        </div>
        <div class="entity-rows-container">
          ${deviceNodes.map((dev, idx) => this._renderDeviceRow(dev, idx, edModule, hass, config, updateModule))}
        </div>
        <button class="add-entity-btn" @click=${() => this._addDevice(edModule, updateModule)}>
          <ha-icon icon="mdi:plus"></ha-icon>
          Add Device
        </button>
      </div>

      <!-- Section 4: Flow and Animation -->
      <div class="settings-section">
        <div class="section-title">Flow and Animation</div>
        ${this.renderSelect('Animation speed', edModule.animation_speed || 'normal', [
          { value: 'none', label: 'None' },
          { value: 'slow', label: 'Slow' },
          { value: 'normal', label: 'Normal' },
          { value: 'fast', label: 'Fast' },
        ], (v: string) => updateModule({ animation_speed: v as EnergyDisplayModule['animation_speed'] }))}
        ${this.renderSliderField('Flow line width', 'Line thickness (px)', edModule.flow_line_width ?? 2, 2, 1, 6, 1, (v) => updateModule({ flow_line_width: v }), 'px')}
        ${this.renderCheckbox('Show values', edModule.show_values !== false, (v) => updateModule({ show_values: v }))}
        ${this.renderSelect('Unit display', edModule.unit_display || 'auto', [
          { value: 'auto', label: 'Auto (W / kW)' },
          { value: 'W', label: 'W' },
          { value: 'kW', label: 'kW' },
        ], (v: string) => updateModule({ unit_display: v as EnergyDisplayModule['unit_display'] }))}
        ${this.renderCheckbox('Show labels', edModule.show_labels !== false, (v) => updateModule({ show_labels: v }))}
        ${this.renderCheckbox('Show icons', edModule.show_icons !== false, (v) => updateModule({ show_icons: v }))}
        ${this.renderCheckbox('Show self-sufficiency gauge', edModule.show_self_sufficiency !== false, (v) => updateModule({ show_self_sufficiency: v }))}
        ${edModule.show_self_sufficiency !== false
          ? this.renderEntityPickerWithVariables(hass, config, 'self_sufficiency_entity', edModule.self_sufficiency_entity || '', (v) => updateModule({ self_sufficiency_entity: v || undefined }), ['sensor'], 'Self-sufficiency entity (optional override)')
          : ''}
      </div>

      <!-- Section 5: Style-specific options -->
      <div class="settings-section">
        <div class="section-title">Style Options</div>
        ${style === 'circle_flow'
          ? html`
              ${this.renderSliderField('Circle size', 'Node circle diameter (px)', edModule.circle_size ?? 48, 48, 24, 96, 4, (v) => updateModule({ circle_size: v }), 'px')}
              ${this.renderSliderField('Node spacing', 'Spacing between nodes (px)', edModule.node_spacing ?? 24, 24, 8, 64, 4, (v) => updateModule({ node_spacing: v }), 'px')}
            `
          : style === 'box_flow'
            ? html`
                ${this.renderSliderField('Box border width', 'px', edModule.box_border_width ?? 2, 2, 1, 8, 1, (v) => updateModule({ box_border_width: v }), 'px')}
                ${this.renderSliderField('Box corner radius', 'px', edModule.box_border_radius ?? 12, 12, 0, 32, 2, (v) => updateModule({ box_border_radius: v }), 'px')}
                ${this.renderSliderField('Gauge size', 'Central gauge diameter (px)', edModule.gauge_size ?? 80, 80, 40, 160, 8, (v) => updateModule({ gauge_size: v }), 'px')}
              `
            : html`
                ${this.renderSliderField('Sankey width', 'Diagram width (px)', edModule.sankey_width ?? 400, 400, 200, 800, 50, (v) => updateModule({ sankey_width: v }), 'px')}
                ${this.renderSliderField('Curve factor', 'Path curvature', edModule.sankey_curve_factor ?? 0.5, 0.5, 0.1, 1, 0.1, (v) => updateModule({ sankey_curve_factor: v }))}
                ${this.renderSliderField('Column spacing', 'px', edModule.sankey_column_spacing ?? 16, 16, 8, 48, 4, (v) => updateModule({ sankey_column_spacing: v }), 'px')}
              `}
      </div>
    `;
  }

  private _renderDeviceRow(
    dev: EnergyNode,
    deviceIndex: number,
    ed: EnergyDisplayModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (u: Partial<EnergyDisplayModule>) => void
  ): TemplateResult {
    const isExpanded = this._expandedDeviceIds.has(dev.id);
    return html`
      <div
        class="entity-row ${this._draggedDevice?.id === dev.id ? 'dragging' : ''}"
        draggable="true"
        @dragstart=${(e: DragEvent) => this._onDeviceDragStart(e, dev)}
        @dragend=${() => this._onDeviceDragEnd()}
        @dragover=${(e: DragEvent) => {
          e.preventDefault();
          if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
        }}
        @drop=${(e: DragEvent) => this._onDeviceDrop(e, deviceIndex, ed, updateModule)}
      >
        <ha-icon icon="mdi:drag" class="drag-handle"></ha-icon>
        <ha-icon icon="${dev.icon || DEFAULT_NODE_ICONS.device}" style="flex-shrink: 0;"></ha-icon>
        <div class="entity-info" style="flex: 1; font-size: 14px; overflow: hidden; text-overflow: ellipsis;">
          ${dev.label || 'Device'} ${dev.entity ? ` · ${dev.entity}` : ' · No entity'}
        </div>
        <ha-icon class="expand-icon ${isExpanded ? 'expanded' : ''}" icon="mdi:chevron-down" @click=${() => this._toggleDeviceExpand(dev.id)}></ha-icon>
        <ha-icon class="delete-icon" icon="mdi:delete" @click=${() => this._deleteDevice(ed, deviceIndex, updateModule)}></ha-icon>
      </div>
      ${isExpanded
        ? html`
            <div class="entity-settings">
              ${this.renderEntityPickerWithVariables(hass, config, 'entity', dev.entity || '', (v) => this._updateDeviceAtIndex(ed, deviceIndex, { entity: v }, updateModule), ['sensor'], 'Power entity')}
              ${this.renderTextInput('Label', dev.label || '', (v) => this._updateDeviceAtIndex(ed, deviceIndex, { label: v }, updateModule))}
              <div class="form-field" style="margin-top: 12px;">
                <label class="form-label">Icon</label>
                <ha-form .hass=${hass} .data=${{ icon: dev.icon || '' }} .schema=${[{ name: 'icon', selector: { icon: {} } }]} @value-changed=${(e: CustomEvent) => this._updateDeviceAtIndex(ed, deviceIndex, { icon: e.detail.value.icon }, updateModule)}></ha-form>
              </div>
              <div class="form-field" style="margin-top: 12px;">
                <label class="form-label">Color</label>
                <ultra-color-picker .label="" .value="${dev.color || ''}" .defaultValue="${DEFAULT_NODE_COLORS.device}" .hass=${hass} @value-changed=${(e: CustomEvent) => this._updateDeviceAtIndex(ed, deviceIndex, { color: e.detail.value }, updateModule)}></ultra-color-picker>
              </div>
            </div>
          `
        : ''}
    `;
  }

  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as EnergyDisplayModule, hass, (u) => updateModule(u));
  }

  renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as EnergyDisplayModule, hass, (u) => updateModule(u));
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const edModule = module as EnergyDisplayModule;
    const style = edModule.display_style || 'circle_flow';
    let content: TemplateResult;
    if (style === 'circle_flow') {
      content = this._renderCircleFlow(edModule, hass, config);
    } else if (style === 'box_flow') {
      content = this._renderBoxFlow(edModule, hass, config);
    } else {
      content = this._renderSankey(edModule, hass, config);
    }
    const handlers = this.createGestureHandlers(
      module.id,
      {
        tap_action: edModule.tap_action,
        hold_action: edModule.hold_action,
        double_tap_action: edModule.double_tap_action,
        entity: undefined,
        module: edModule,
      },
      hass,
      config
    );
    const wrapped = html`
      <div
        class="energy-display-preview-wrapper"
        @pointerdown=${handlers.onPointerDown}
        @pointerup=${handlers.onPointerUp}
        @pointerleave=${handlers.onPointerLeave}
        @pointercancel=${handlers.onPointerCancel}
        style="cursor: ${edModule.tap_action?.action !== 'nothing' ? 'pointer' : 'default'}; display: block; width: 100%; box-sizing: border-box;"
      >
        ${content}
      </div>
    `;
    return this.wrapWithAnimation(wrapped, module, hass);
  }

  private _parsePowerFromState(state: string | undefined, unitAttr: string | undefined): { value: number; unit: 'W' | 'kW' } {
    const raw = (state ?? '').toString().trim();
    const unit = (unitAttr ?? '').toLowerCase();
    let num = parseFloat(raw.replace(/[^\d.-]/g, '')) || 0;
    if (unit.includes('kw') || raw.toLowerCase().includes('kw')) {
      num = num * 1000;
    }
    const abs = Math.abs(num);
    return { value: num, unit: abs >= 1000 ? 'kW' : 'W' };
  }

  private _getNodePower(hass: HomeAssistant, config: UltraCardConfig | undefined, entityId: string): { value: number; unit: 'W' | 'kW'; text: string } {
    const resolved = this.resolveEntity(entityId, config);
    if (!resolved || !hass.states[resolved]) {
      return { value: 0, unit: 'W', text: '—' };
    }
    const s = hass.states[resolved];
    const unitAttr = (s.attributes?.unit_of_measurement as string) ?? '';
    const { value, unit } = this._parsePowerFromState(s.state, unitAttr);
    const displayUnit = unit === 'kW' ? 'kW' : 'W';
    const displayVal = unit === 'kW' ? value / 1000 : value;
    const text = value === 0 ? '0 W' : `${displayVal.toFixed(1)} ${displayUnit}`;
    return { value, unit, text };
  }

  private _getNodeSecondary(hass: HomeAssistant, config: UltraCardConfig | undefined, entityId: string): string {
    const resolved = this.resolveEntity(entityId, config);
    if (!resolved || !hass.states[resolved]) return '—';
    const s = hass.states[resolved];
    const v = parseFloat(String(s.state));
    return isNaN(v) ? String(s.state) : `${v.toFixed(1)} %`;
  }

  private _formatPower(value: number, unitDisplay: 'auto' | 'W' | 'kW'): string {
    const abs = Math.abs(value);
    const sign = value < 0 ? '−' : '';
    if (unitDisplay === 'kW') return `${sign}${(abs / 1000).toFixed(1)} kW`;
    if (unitDisplay === 'W') return `${sign}${Math.round(abs)} W`;
    return abs >= 1000 ? `${sign}${(abs / 1000).toFixed(1)} kW` : `${sign}${Math.round(abs)} W`;
  }

  private _getFlowDuration(speed: 'slow' | 'normal' | 'fast' | 'none'): string {
    if (speed === 'none') return '0s';
    if (speed === 'slow') return '3s';
    if (speed === 'fast') return '1s';
    return '2s';
  }

  private _renderCircleFlow(
    module: EnergyDisplayModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): TemplateResult {
    const designStyles = this.buildDesignStyles(module, hass);
    const styleStr = this.buildStyleString(designStyles);
    const core = this._getCoreNodes(module);
    const devices = this._getDeviceNodes(module);
    const showValues = module.show_values !== false;
    const showLabels = module.show_labels !== false;
    const circleSize = Math.max(24, Math.min(96, module.circle_size ?? 48));
    const lineWidth = Math.max(1, Math.min(6, module.flow_line_width ?? 2));
    const flowDuration = this._getFlowDuration(module.animation_speed || 'normal');
    const animate = flowDuration !== '0s';

    const half = circleSize / 2;
    const enabledDevices = devices.filter(d => d.enabled !== false);
    const deviceCount = enabledDevices.length;

    // All nodes sit on a single circle ring, evenly spaced.
    // Core nodes occupy fixed cardinal positions (top, left, right, bottom).
    // Device nodes fill the gaps between them.

    // Collect active core nodes in order
    const order: EnergyNodeType[] = ['solar', 'grid', 'battery', 'home'];
    const activeCoreNodes: EnergyNode[] = [];
    order.forEach(t => {
      const n = core.find(c => c.node_type === t);
      if (n && n.enabled !== false) activeCoreNodes.push(n);
    });

    const totalNodes = activeCoreNodes.length + deviceCount;
    // Ring radius grows with node count so nodes don't overlap
    const ringR = Math.max(80, totalNodes * (circleSize + 10) / (2 * Math.PI));
    const pad = half + (showLabels ? 22 : 8) + 4;
    const VW = Math.round((ringR + pad) * 2);
    const VH = VW; // square viewBox for the ring
    const cx = VW / 2;
    const cy = VH / 2;

    // Assign fixed angles to core nodes (cardinal: top, left, right, bottom)
    const coreAngles: Partial<Record<EnergyNodeType, number>> = {
      solar:   -Math.PI / 2,        // top
      grid:    Math.PI,              // left
      home:    0,                    // right
      battery: Math.PI / 2,         // bottom
    };

    // Build all node positions
    const positions: Array<{ node: EnergyNode; x: number; y: number }> = [];

    activeCoreNodes.forEach(n => {
      const angle = coreAngles[n.node_type] ?? 0;
      positions.push({ node: n, x: cx + ringR * Math.cos(angle), y: cy + ringR * Math.sin(angle) });
    });

    // Place device nodes evenly in the arc between battery (bottom, π/2) and home (right, 0)
    // going clockwise through the bottom-right quadrant. With more devices, extend further.
    if (deviceCount > 0) {
      // Arc from just past battery going clockwise back to just before home
      // Battery = π/2, Home = 0 (= 2π). Going clockwise: π/2 → π → 3π/2 → 2π
      // We go the long way around (avoiding Solar at -π/2 and Grid at π)
      // Place devices in the bottom-right arc: from 3π/4 to 7π/4 (avoiding top half)
      const arcStart = (3 * Math.PI) / 4;
      const arcEnd = (7 * Math.PI) / 4;
      enabledDevices.forEach((d, i) => {
        const t = deviceCount === 1 ? 0.5 : i / (deviceCount - 1);
        const angle = arcStart + t * (arcEnd - arcStart);
        positions.push({ node: d, x: cx + ringR * Math.cos(angle), y: cy + ringR * Math.sin(angle) });
      });
    }

    if (positions.length === 0) {
      return html`
        <div class="energy-display-module" style="${styleStr} padding: 16px; min-height: 200px;">
          ${this.renderGradientErrorState(
            'Configure energy nodes',
            'Add entities for Solar, Grid, Battery and Home in the General tab.',
            'mdi:lightning-bolt'
          )}
        </div>
      `;
    }

    const pathsToCenter: Array<{ d: string; color: string; hasFlow: boolean }> = [];
    positions.forEach(({ node, x, y }) => {
      const entityId = this.resolveEntity(node.entity, config);
      let hasFlow = false;
      if (entityId && hass.states[entityId]) {
        const power = this._getNodePower(hass, config, node.entity);
        hasFlow = Math.abs(power.value) > 0;
      }
      const isSource = node.node_type === 'solar' || node.node_type === 'grid';
      const pathD = isSource
        ? `M ${x} ${y} L ${cx} ${cy}`
        : `M ${cx} ${cy} L ${x} ${y}`;
      pathsToCenter.push({
        d: pathD,
        color: node.color || DEFAULT_NODE_COLORS[node.node_type],
        hasFlow: hasFlow || animate,
      });
    });

    return html`
      <div class="energy-display-module energy-circle-flow" style="${styleStr} padding: 12px; width: 100%; box-sizing: border-box;">
        <svg viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: auto; display: block; margin: 0 auto; overflow: visible;">
          ${pathsToCenter.map(
            (p, i) => svg`
              <path d="${p.d}" fill="none" stroke="${p.color}" stroke-width="${lineWidth}" opacity="0.8"/>
              ${animate && p.hasFlow
                ? svg`<circle r="4" fill="${p.color}" cx="0" cy="0" style="offset-path: path('${p.d}'); offset-distance: 0%; animation: energy-flow-dot ${flowDuration} linear infinite;"/>`
                : svg``}
            `
          )}
          ${positions.map(({ node, x, y }) => {
            const entityId = this.resolveEntity(node.entity, config);
            let valueText = '—';
            let secondaryText = '';
            if (entityId && hass.states[entityId]) {
              const power = this._getNodePower(hass, config, node.entity);
              valueText = this._formatPower(power.value, module.unit_display || 'auto');
              if (node.secondary_entity && (node.node_type === 'battery' || node.node_type === 'grid')) {
                secondaryText = this._getNodeSecondary(hass, config, node.secondary_entity);
              }
            }
            const color = node.color || DEFAULT_NODE_COLORS[node.node_type];
            const label = node.label || DEFAULT_NODE_LABELS[node.node_type];
            return svg`
              <g class="energy-node" data-node-id="${node.id}">
                ${showLabels ? svg`<text x="${x}" y="${y - half - 6}" text-anchor="middle" font-size="11" fill="var(--secondary-text-color)">${label}</text>` : svg``}
                <circle cx="${x}" cy="${y}" r="${half}" fill="var(--card-background-color)" stroke="${color}" stroke-width="2"/>
                ${showValues ? svg`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" fill="var(--primary-text-color)">${valueText}</text>` : svg``}
                ${secondaryText ? svg`<text x="${x}" y="${y + 13}" text-anchor="middle" font-size="10" fill="var(--secondary-text-color)">${secondaryText}</text>` : svg``}
              </g>
            `;
          })}
        </svg>
      </div>
    `;
  }

  private _renderBoxFlow(
    module: EnergyDisplayModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): TemplateResult {
    const core = this._getCoreNodes(module);
    const devices = this._getDeviceNodes(module).filter(d => d.enabled !== false);
    const showValues = module.show_values !== false;
    const showLabels = module.show_labels !== false;
    const showGauge = module.show_self_sufficiency !== false;
    const borderRadius = Math.max(0, module.box_border_radius ?? 10);
    const borderWidth = Math.max(1, module.box_border_width ?? 2);
    const flowDuration = this._getFlowDuration(module.animation_speed || 'normal');
    const animate = flowDuration !== '0s';
    const lineW = Math.max(1, module.flow_line_width ?? 2);

    let selfPct = 0;
    const selfEntity = this.resolveEntity(module.self_sufficiency_entity || '', config);
    if (showGauge && selfEntity && hass.states[selfEntity]) {
      const v = parseFloat(String(hass.states[selfEntity].state));
      selfPct = isNaN(v) ? 0 : Math.max(0, Math.min(100, v));
    }

    const order: EnergyNodeType[] = ['solar', 'grid', 'battery', 'home'];
    const boxNodes = order.map(t => core.find(n => n.node_type === t && n.enabled !== false)).filter(Boolean) as EnergyNode[];
    const homeNode = boxNodes.find(n => n.node_type === 'home');
    const homeColor = homeNode?.color || DEFAULT_NODE_COLORS.home;

    const designStyles = this.buildDesignStyles(module, hass);
    const styleStr = this.buildStyleString(designStyles);

    // --- Pure SVG layout ---
    // Box dimensions (same for all nodes including devices)
    const bW = 90;   // box width
    const bH = 44;   // box height — compact, same as device pills
    const gaugeR = showGauge ? 28 : 0;
    const gaugeDiam = gaugeR * 2;
    const colGap = Math.max(gaugeDiam + 16, 80); // horizontal gap between left & right columns (gauge fits here)
    const rowGap = 48;  // vertical gap between top & bottom rows (lines pass through here)
    const devGap = 12;  // gap between device row and bottom row
    const devCount = devices.length;

    // Column x positions (left edge of box)
    const xLeft  = 0;
    const xRight = bW + colGap;
    const VW = xRight + bW;

    // Row y positions (top edge of box)
    const yTop = 0;
    const yBot = bH + rowGap;
    const yDev = yBot + bH + devGap;

    // Hub center (center of the gap between the 4 boxes)
    const hubX = VW / 2;
    const hubY = bH + rowGap / 2;

    // Box center points
    const boxCx: Partial<Record<EnergyNodeType, number>> = {
      solar:   xLeft  + bW / 2,
      grid:    xRight + bW / 2,
      battery: xLeft  + bW / 2,
      home:    xRight + bW / 2,
    };
    const boxCy: Partial<Record<EnergyNodeType, number>> = {
      solar:   yTop + bH / 2,
      grid:    yTop + bH / 2,
      battery: yBot + bH / 2,
      home:    yBot + bH / 2,
    };

    // For each box, find the nearest edge midpoint toward the hub
    // Returns the point on the box edge closest to the hub
    const edgePt = (type: EnergyNodeType): [number, number] => {
      const cx = boxCx[type]!;
      const cy = boxCy[type]!;
      const dx = hubX - cx;
      const dy = hubY - cy;
      // Clamp to box edge
      const ex = cx + Math.sign(dx) * bW / 2;
      const ey = cy + Math.sign(dy) * bH / 2;
      // Which edge is closer? Use the one with smaller overshoot
      const tx = Math.abs(dx) > 0 ? (Math.sign(dx) * bW / 2) / dx : Infinity;
      const ty = Math.abs(dy) > 0 ? (Math.sign(dy) * bH / 2) / dy : Infinity;
      if (tx < ty) {
        // hits left/right edge
        return [cx + Math.sign(dx) * bW / 2, cy + dy * tx];
      } else {
        // hits top/bottom edge
        return [cx + dx * ty, cy + Math.sign(dy) * bH / 2];
      }
    };

    // Device x centers — clamped so boxes stay within [0, VW]
    const devCenters: number[] = devices.map((_, i) => {
      const t = devCount === 1 ? 0.5 : i / (devCount - 1);
      const cx = xLeft + t * VW;
      // Clamp so box [cx-bW/2, cx+bW/2] stays within [0, VW]
      return Math.max(bW / 2, Math.min(VW - bW / 2, cx));
    });
    // If multiple devices are too close after clamping, spread them evenly
    if (devCount > 1) {
      const minSpacing = bW + 8;
      // Push apart from left
      for (let i = 1; i < devCount; i++) {
        if (devCenters[i] - devCenters[i - 1] < minSpacing) {
          devCenters[i] = devCenters[i - 1] + minSpacing;
        }
      }
      // Pull back from right
      for (let i = devCount - 2; i >= 0; i--) {
        if (devCenters[i + 1] - devCenters[i] < minSpacing) {
          devCenters[i] = devCenters[i + 1] - minSpacing;
        }
      }
      // Re-clamp after spreading
      for (let i = 0; i < devCount; i++) {
        devCenters[i] = Math.max(bW / 2, Math.min(VW - bW / 2, devCenters[i]));
      }
    }
    // Expand VW if devices need more horizontal space
    const devTotalW = devCount > 0 ? devCenters[devCount - 1] + bW / 2 : VW;
    const effectiveVW = Math.max(VW, devTotalW);
    // Recenter hub if VW expanded (keep hub centered between the 4 core boxes, not device row)
    const finalHubX = VW / 2;  // hub stays centered on the core 4 boxes

    // Small padding so strokes at edges don't clip
    const svgPad = Math.ceil(lineW / 2) + 1;
    const VH = devCount > 0 ? yDev + bH + svgPad : yBot + bH + svgPad;

    // Build flow paths — straight line from box edge to hub
    interface FlowPath { d: string; color: string; }
    const flowPaths: FlowPath[] = [];

    boxNodes.forEach(node => {
      const [ex, ey] = edgePt(node.node_type);
      const isSource = node.node_type === 'solar' || node.node_type === 'grid';
      const d = isSource
        ? `M ${ex} ${ey} L ${finalHubX} ${hubY}`
        : `M ${finalHubX} ${hubY} L ${ex} ${ey}`;
      flowPaths.push({ d, color: node.color || DEFAULT_NODE_COLORS[node.node_type] });
    });

    // Device paths from hub bottom-edge → device box top-center
    devices.forEach((d, i) => {
      const dcx = devCenters[i];
      const hubBottomY = hubY + gaugeR + 2;
      const path = `M ${finalHubX} ${hubBottomY} L ${dcx} ${yDev}`;
      flowPaths.push({ d: path, color: d.color || DEFAULT_NODE_COLORS.device });
    });

    // Render a box with label+value in SVG
    const renderBox = (
      x: number, y: number, w: number, h: number,
      color: string, label: string, value: string, rx: number, bw: number
    ) => svg`
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"
        fill="var(--card-background-color)" stroke="${color}" stroke-width="${bw}" opacity="0.95"/>
      ${showValues ? svg`<text x="${x + w / 2}" y="${y + h / 2 - (showLabels ? 7 : 0)}"
        text-anchor="middle" dominant-baseline="central"
        font-size="13" font-weight="700" fill="var(--primary-text-color)">${value}</text>` : svg``}
      ${showLabels ? svg`<text x="${x + w / 2}" y="${y + h / 2 + (showValues ? 10 : 0)}"
        text-anchor="middle" dominant-baseline="central"
        font-size="10" fill="var(--secondary-text-color)">${label}</text>` : svg``}
    `;

    return html`
      <div class="energy-display-module energy-box-flow" style="${styleStr} padding: 12px; width: 100%; box-sizing: border-box;">
        <svg viewBox="${-svgPad} ${-svgPad} ${effectiveVW + svgPad * 2} ${VH + svgPad * 2}" preserveAspectRatio="xMidYMid meet"
          style="width: 100%; height: auto; display: block; overflow: hidden;">

          <!-- Flow lines — drawn first so boxes sit on top -->
          ${flowPaths.map(p => svg`
            <path d="${p.d}" fill="none" stroke="${p.color}" stroke-width="${lineW}" opacity="0.75" stroke-linecap="round"/>
            ${animate ? svg`
              <circle r="3" cx="0" cy="0" fill="${p.color}"
                style="offset-path: path('${p.d}'); offset-distance: 0%; animation: energy-flow-dot ${flowDuration} linear infinite;"/>
              <circle r="3" cx="0" cy="0" fill="${p.color}"
                style="offset-path: path('${p.d}'); offset-distance: 0%; animation: energy-flow-dot ${flowDuration} linear calc(${flowDuration} * -0.5) infinite;"/>
            ` : svg``}
          `)}

          <!-- Hub / gauge center -->
          ${showGauge ? svg`
            <circle cx="${finalHubX}" cy="${hubY}" r="${gaugeR}" fill="var(--card-background-color)" stroke="var(--divider-color)" stroke-width="2"/>
            <circle cx="${finalHubX}" cy="${hubY}" r="${gaugeR - 4}" fill="none" stroke="${homeColor}" stroke-width="4"
              stroke-dasharray="${(selfPct / 100) * (2 * Math.PI * (gaugeR - 4)).toFixed(1)} ${(2 * Math.PI * (gaugeR - 4)).toFixed(1)}"
              stroke-dashoffset="${((2 * Math.PI * (gaugeR - 4)) * 0.25).toFixed(1)}"
              stroke-linecap="round"
              style="transition: stroke-dasharray 0.5s ease; transform: rotate(-90deg); transform-origin: ${finalHubX}px ${hubY}px;"/>
            <text x="${finalHubX}" y="${hubY - 5}" text-anchor="middle" font-size="9" font-weight="700" fill="var(--primary-text-color)">${selfPct.toFixed(0)}%</text>
            <text x="${finalHubX}" y="${hubY + 8}" text-anchor="middle" font-size="8" fill="var(--secondary-text-color)">Home</text>
          ` : svg`<circle cx="${finalHubX}" cy="${hubY}" r="4" fill="var(--divider-color)"/>`}

          <!-- Core node boxes -->
          ${boxNodes.map(node => {
            const entityId = this.resolveEntity(node.entity, config);
            let valueText = '—';
            if (entityId && hass.states[entityId]) {
              const power = this._getNodePower(hass, config, node.entity);
              valueText = this._formatPower(power.value, module.unit_display || 'auto');
            }
            const color = node.color || DEFAULT_NODE_COLORS[node.node_type];
            const label = node.label || DEFAULT_NODE_LABELS[node.node_type];
            const bx = node.node_type === 'solar' || node.node_type === 'battery' ? xLeft : xRight;
            const by = node.node_type === 'solar' || node.node_type === 'grid' ? yTop : yBot;
            return renderBox(bx, by, bW, bH, color, label, valueText, borderRadius, borderWidth);
          })}

          <!-- Device boxes -->
          ${devices.map((d, i) => {
            const entityId = this.resolveEntity(d.entity, config);
            let valueText = '—';
            if (entityId && hass.states[entityId]) {
              const power = this._getNodePower(hass, config, d.entity);
              valueText = this._formatPower(power.value, module.unit_display || 'auto');
            }
            const color = d.color || DEFAULT_NODE_COLORS.device;
            const label = d.label || DEFAULT_NODE_LABELS.device;
            const dcx = devCenters[i];
            return renderBox(dcx - bW / 2, yDev, bW, bH, color, label, valueText, borderRadius, borderWidth);
          })}
        </svg>
      </div>
    `;
  }

  private _renderSankey(
    module: EnergyDisplayModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): TemplateResult {
    const core = this._getCoreNodes(module);
    const devices = this._getDeviceNodes(module).filter(d => d.enabled !== false);
    const showValues = module.show_values !== false;
    const showLabels = module.show_labels !== false;
    const curveFactor = Math.max(0.1, Math.min(1, module.sankey_curve_factor ?? 0.5));
    const designStyles = this.buildDesignStyles(module, hass);
    const styleStr = this.buildStyleString(designStyles);
    const flowDuration = this._getFlowDuration(module.animation_speed || 'normal');
    const animate = flowDuration !== '0s';

    const sources = core.filter(n => (n.node_type === 'solar' || n.node_type === 'grid') && n.enabled !== false);
    const homeNode = core.find(n => n.node_type === 'home' && n.enabled !== false);
    const batteryNode = core.find(n => n.node_type === 'battery' && n.enabled !== false);
    const consumers = ([batteryNode, ...devices]).filter(Boolean) as EnergyNode[];

    const getPower = (node: EnergyNode) => {
      const eid = this.resolveEntity(node.entity, config);
      if (!eid || !hass.states[eid]) return 0;
      return Math.abs(this._getNodePower(hass, config, node.entity).value);
    };

    const sourceItems = sources.map(n => ({ node: n, value: getPower(n) }));
    const consumerItems = consumers.map(n => ({ node: n, value: getPower(n) }));
    const totalIn = Math.max(1, sourceItems.reduce((a, x) => a + x.value, 0));
    const totalOut = Math.max(1, consumerItems.reduce((a, x) => a + x.value, 0));
    const homePower = homeNode ? getPower(homeNode) : 0;

    // --- Layout ---
    const VW = 300;
    const barW = 44;
    const labelFontSize = 10;
    const valueFontSize = 10;
    const labelH = showLabels ? labelFontSize + 4 : 0;
    const valueH = showValues ? valueFontSize + 4 : 0;
    const textBelowH = labelH + valueH;        // height reserved below each bar for its label+value
    const barGap = textBelowH + 14;            // gap = text space + breathing room between bars
    const homeEdgeGap = 12;                    // gap between flow slices on the home bar edge
    const minBarH = 36;
    const colPad = 16;

    // Compute proportional bar heights with minimums
    const numSrc = sourceItems.length;
    const numCon = consumerItems.length;
    const srcAvailH = Math.max(200, 320 - colPad * 2 - barGap * Math.max(0, numSrc - 1));
    const conAvailH = Math.max(200, 320 - colPad * 2 - barGap * Math.max(0, numCon - 1));
    const srcH = sourceItems.map(s => Math.max(minBarH, Math.round((s.value / totalIn) * srcAvailH)));
    const conH = consumerItems.map(c => Math.max(minBarH, Math.round((c.value / totalOut) * conAvailH)));

    const srcTotalH = srcH.reduce((a, b) => a + b, 0) + barGap * Math.max(0, numSrc - 1);
    const conTotalH = conH.reduce((a, b) => a + b, 0) + barGap * Math.max(0, numCon - 1);

    // Home bar height = tallest column (bars only, gaps already included)
    const homeH = Math.max(srcTotalH, conTotalH, minBarH * 2);

    // Home node label+value sits above the home bar — reserve space at top
    const homeTextH = (showLabels ? labelH : 0) + (showValues ? valueH : 0);
    const VH = homeH + colPad * 2 + homeTextH + 8;

    const xSrc = 0;
    const xHome = (VW - barW) / 2;
    const xCon = VW - barW;
    const homeY = colPad + homeTextH;
    const homeRight = xHome + barW;

    // Center source/consumer columns vertically relative to homeH
    const srcStartY = homeY + (homeH - srcTotalH) / 2;
    const conStartY = homeY + (homeH - conTotalH) / 2;

    let y = srcStartY;
    const srcRects = sourceItems.map((s, i) => {
      const r = { node: s.node, value: s.value, x: xSrc, y, w: barW, h: srcH[i], color: s.node.color || DEFAULT_NODE_COLORS[s.node.node_type] };
      y += srcH[i] + barGap;
      return r;
    });

    y = conStartY;
    const conRects = consumerItems.map((c, i) => {
      const r = { node: c.node, value: c.value, x: xCon, y, w: barW, h: conH[i], color: c.node.color || DEFAULT_NODE_COLORS[c.node.node_type] };
      y += conH[i] + barGap;
      return r;
    });

    // Distribute source slices along Home's left edge.
    // Slices must fit exactly within homeH: compute proportional heights then
    // normalize so sum(slices) + gaps * (n-1) === homeH exactly.
    const minSliceH = 8;
    const srcEdgeGapsH = homeEdgeGap * Math.max(0, numSrc - 1);
    const srcEdgeAvailH = homeH - srcEdgeGapsH;
    const srcSliceHRaw = sourceItems.map(s => Math.max(minSliceH, Math.round((s.value / totalIn) * srcEdgeAvailH)));
    const srcSliceHSum = srcSliceHRaw.reduce((a, b) => a + b, 0);
    // Scale down if they exceed available space
    const srcSliceScale = srcSliceHSum > srcEdgeAvailH ? srcEdgeAvailH / srcSliceHSum : 1;
    const srcSliceHFinal = srcSliceHRaw.map(h => Math.max(minSliceH, Math.round(h * srcSliceScale)));
    // Re-center the slice block within homeH
    const srcSliceTotalH = srcSliceHFinal.reduce((a, b) => a + b, 0) + srcEdgeGapsH;
    let homeLeftY = homeY + (homeH - srcSliceTotalH) / 2;

    // Same for consumer slices on Home's right edge
    const conEdgeGapsH = homeEdgeGap * Math.max(0, numCon - 1);
    const conEdgeAvailH = homeH - conEdgeGapsH;
    const conSliceHRaw = consumerItems.map(c => Math.max(minSliceH, Math.round((c.value / totalOut) * conEdgeAvailH)));
    const conSliceHSum = conSliceHRaw.reduce((a, b) => a + b, 0);
    const conSliceScale = conSliceHSum > conEdgeAvailH ? conEdgeAvailH / conSliceHSum : 1;
    const conSliceHFinal = conSliceHRaw.map(h => Math.max(minSliceH, Math.round(h * conSliceScale)));
    const conSliceTotalH = conSliceHFinal.reduce((a, b) => a + b, 0) + conEdgeGapsH;
    let homeRightY = homeY + (homeH - conSliceTotalH) / 2;

    const cp = Math.max(24, (xHome - barW) * curveFactor * 1.5);

    interface FlowBand { shapePath: string; centerPath: string; color: string; id: string }
    const srcFlowBands: FlowBand[] = [];
    srcRects.forEach((r, i) => {
      const sliceH = srcSliceHFinal[i];
      const sy1 = r.y;
      const sy2 = r.y + r.h;
      const ey1 = homeLeftY;
      const ey2 = homeLeftY + sliceH;
      homeLeftY += sliceH + homeEdgeGap;

      const sx = r.x + r.w;
      const ex = xHome;
      const topD = `M ${sx} ${sy1} C ${sx + cp} ${sy1}, ${ex - cp} ${ey1}, ${ex} ${ey1}`;
      const botD = `L ${ex} ${ey2} C ${ex - cp} ${ey2}, ${sx + cp} ${sy2}, ${sx} ${sy2} Z`;
      const midSy = (sy1 + sy2) / 2;
      const midEy = (ey1 + ey2) / 2;
      const centerPath = `M ${sx} ${midSy} C ${sx + cp} ${midSy}, ${ex - cp} ${midEy}, ${ex} ${midEy}`;
      srcFlowBands.push({ shapePath: `${topD} ${botD}`, centerPath, color: r.color, id: `sf-${i}` });
    });

    const conFlowBands: FlowBand[] = [];
    conRects.forEach((r, i) => {
      const sliceH = conSliceHFinal[i];
      const sy1 = homeRightY;
      const sy2 = homeRightY + sliceH;
      homeRightY += sliceH + homeEdgeGap;

      const ey1 = r.y;
      const ey2 = r.y + r.h;
      const sx = homeRight;
      const ex = r.x;
      const topD = `M ${sx} ${sy1} C ${sx + cp} ${sy1}, ${ex - cp} ${ey1}, ${ex} ${ey1}`;
      const botD = `L ${ex} ${ey2} C ${ex - cp} ${ey2}, ${sx + cp} ${sy2}, ${sx} ${sy2} Z`;
      const midSy = (sy1 + sy2) / 2;
      const midEy = (ey1 + ey2) / 2;
      const centerPath = `M ${sx} ${midSy} C ${sx + cp} ${midSy}, ${ex - cp} ${midEy}, ${ex} ${midEy}`;
      conFlowBands.push({ shapePath: `${topD} ${botD}`, centerPath, color: r.color, id: `cf-${i}` });
    });

    // 3 staggered dots per flow, each offset by 33% of the duration
    const dotOffsets = ['0s', `calc(${flowDuration} * -0.33)`, `calc(${flowDuration} * -0.66)`];

    return html`
      <div class="energy-display-module energy-sankey" style="${styleStr} padding: 12px; width: 100%; box-sizing: border-box;">
        <svg viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: auto; display: block; overflow: visible;">

          <!-- Flow bands — rendered first so bars sit on top -->
          ${[...srcFlowBands, ...conFlowBands].map(f => svg`
            <path d="${f.shapePath}" fill="${f.color}" opacity="0.5"/>
          `)}

          <!-- Animated dots travelling along each flow's center path -->
          ${animate ? [...srcFlowBands, ...conFlowBands].map(f => svg`
            ${dotOffsets.map((delay, di) => svg`
              <circle r="3" cx="0" cy="0" fill="white" opacity="0.85"
                style="offset-path: path('${f.centerPath}'); offset-distance: 0%; animation: energy-flow-dot ${flowDuration} linear ${delay} infinite;"/>
            `)}
          `) : svg``}

          <!-- Source bars: only round the LEFT (outer) corners -->
          ${srcRects.map(r => {
            const { x, y, w, h } = r;
            const rx = 5;
            // Top-left and bottom-left rounded, right side straight
            const d = `M ${x + rx} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x + rx} ${y + h} Q ${x} ${y + h} ${x} ${y + h - rx} L ${x} ${y + rx} Q ${x} ${y} ${x + rx} ${y} Z`;
            return svg`
              <path d="${d}" fill="${r.color}" opacity="0.95"/>
              ${showLabels ? svg`<text x="${x + w / 2}" y="${y + h + labelH}" text-anchor="middle" font-size="${labelFontSize}" font-weight="600" fill="var(--primary-text-color)">${r.node.label || DEFAULT_NODE_LABELS[r.node.node_type]}</text>` : svg``}
              ${showValues ? svg`<text x="${x + w / 2}" y="${y + h + labelH + valueH}" text-anchor="middle" font-size="${valueFontSize}" fill="var(--secondary-text-color)">${this._formatPower(r.value, module.unit_display || 'auto')}</text>` : svg``}
            `;
          })}

          <!-- Home bar: no border radius — flows attach flush to both sides -->
          <rect x="${xHome}" y="${homeY}" width="${barW}" height="${homeH}" rx="0" fill="var(--secondary-background-color)" stroke="var(--divider-color)" stroke-width="1" opacity="0.9"/>
          ${showLabels ? svg`<text x="${xHome + barW / 2}" y="${homeY - valueH - 2}" text-anchor="middle" font-size="${labelFontSize}" font-weight="600" fill="var(--primary-text-color)">${homeNode?.label || 'Home'}</text>` : svg``}
          ${showValues ? svg`<text x="${xHome + barW / 2}" y="${homeY - 2}" text-anchor="middle" font-size="${valueFontSize}" fill="var(--secondary-text-color)">${this._formatPower(homePower, module.unit_display || 'auto')}</text>` : svg``}

          <!-- Consumer bars: only round the RIGHT (outer) corners -->
          ${conRects.map(r => {
            const { x, y, w, h } = r;
            const rx = 5;
            // Top-right and bottom-right rounded, left side straight
            const d = `M ${x} ${y} L ${x + w - rx} ${y} Q ${x + w} ${y} ${x + w} ${y + rx} L ${x + w} ${y + h - rx} Q ${x + w} ${y + h} ${x + w - rx} ${y + h} L ${x} ${y + h} Z`;
            return svg`
              <path d="${d}" fill="${r.color}" opacity="0.95"/>
              ${showLabels ? svg`<text x="${x + w / 2}" y="${y + h + labelH}" text-anchor="middle" font-size="${labelFontSize}" font-weight="600" fill="var(--primary-text-color)">${r.node.label || DEFAULT_NODE_LABELS[r.node.node_type]}</text>` : svg``}
              ${showValues ? svg`<text x="${x + w / 2}" y="${y + h + labelH + valueH}" text-anchor="middle" font-size="${valueFontSize}" fill="var(--secondary-text-color)">${this._formatPower(r.value, module.unit_display || 'auto')}</text>` : svg``}
            `;
          })}        </svg>
      </div>
    `;
  }
}
