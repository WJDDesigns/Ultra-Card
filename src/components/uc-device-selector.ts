import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { DeviceBreakpoint, DEVICE_BREAKPOINTS, ResponsiveDesignProperties } from '../types';

export interface DeviceChangedEvent {
  detail: {
    device: DeviceBreakpoint;
  };
}

/**
 * Device selector component for responsive design settings.
 * Displays 4 device icons (desktop, laptop, tablet, mobile) as a horizontal tab bar.
 * Desktop is the default/base device. Shows visual indicator when a device has custom overrides.
 */
@customElement('uc-device-selector')
export class UcDeviceSelector extends LitElement {
  @property({ attribute: false }) public selectedDevice: DeviceBreakpoint = 'desktop';
  @property({ attribute: false }) public design?: ResponsiveDesignProperties;
  @property({ type: Boolean }) public showBaseOption = false; // Default to not showing base option

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .device-selector {
      display: flex;
      background: var(--card-background-color, #1c1c1c);
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
    }

    .device-tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      background: transparent;
      border: none;
      color: var(--secondary-text-color, #888);
      min-height: 56px;
    }

    .device-tab:not(:last-child) {
      border-right: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
    }

    .device-tab:hover {
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
      color: var(--primary-text-color, #fff);
    }

    .device-tab.active {
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
      color: var(--primary-color, #03a9f4);
    }

    .device-tab.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--primary-color, #03a9f4);
    }

    .device-icon {
      width: 24px;
      height: 24px;
      --mdc-icon-size: 24px;
    }

    .device-label {
      font-size: 10px;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }

    .override-indicator {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary-color, #03a9f4);
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .override-indicator.has-overrides {
      opacity: 1;
      background: var(--warning-color, #ff9800);
    }

    /* Base/Default Device tab styling (Desktop) */
    .device-tab.base-device {
      position: relative;
    }

    .device-tab.base-device::before {
      content: '';
      position: absolute;
      top: 4px;
      left: 4px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--success-color, #4caf50);
    }

    .device-tab.base-device .device-label {
      font-weight: 600;
    }

    /* Tooltip styling */
    .device-tab[title] {
      position: relative;
    }
  `;

  /**
   * Check if a specific device has any override values set
   */
  private _hasDeviceOverrides(device: DeviceBreakpoint): boolean {
    if (!this.design) return false;
    const deviceDesign = this.design[device];
    if (!deviceDesign) return false;
    // Check if there are any non-empty values
    return Object.values(deviceDesign).some(
      value => value !== undefined && value !== null && value !== ''
    );
  }

  /**
   * Handle device tab click
   */
  private _selectDevice(device: DeviceBreakpoint): void {
    if (this.selectedDevice === device) return;
    
    this.selectedDevice = device;
    this.dispatchEvent(
      new CustomEvent('device-changed', {
        detail: { device },
        bubbles: true,
        composed: true,
      })
    );
  }

  render(): TemplateResult {
    const devices: Array<{ key: DeviceBreakpoint; config: { label: string; icon: string }; isBase?: boolean }> = [
      { key: 'desktop', config: DEVICE_BREAKPOINTS.desktop, isBase: true },
      { key: 'laptop', config: DEVICE_BREAKPOINTS.laptop },
      { key: 'tablet', config: DEVICE_BREAKPOINTS.tablet },
      { key: 'mobile', config: DEVICE_BREAKPOINTS.mobile },
    ];

    return html`
      <div class="device-selector">
        ${devices.map(
          ({ key, config, isBase }) => html`
            <button
              class="device-tab ${this.selectedDevice === key ? 'active' : ''} ${isBase ? 'base-device' : ''}"
              @click=${() => this._selectDevice(key)}
              title="${config.label}${this._getBreakpointDescription(key)}${isBase ? ' (Default)' : ''}"
            >
              <ha-icon class="device-icon" .icon=${config.icon}></ha-icon>
              <span class="device-label">${config.label}${isBase ? '*' : ''}</span>
              ${!isBase && this._hasDeviceOverrides(key)
                ? html`<span class="override-indicator has-overrides"></span>`
                : ''}
            </button>
          `
        )}
      </div>
    `;
  }

  /**
   * Get human-readable breakpoint description
   */
  private _getBreakpointDescription(device: DeviceBreakpoint): string {
    const config = DEVICE_BREAKPOINTS[device];
    if ('minWidth' in config && 'maxWidth' in config) {
      return ` (${config.minWidth}px - ${config.maxWidth}px)`;
    } else if ('minWidth' in config) {
      return ` (≥${config.minWidth}px)`;
    } else if ('maxWidth' in config) {
      return ` (≤${config.maxWidth}px)`;
    }
    return '';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-device-selector': UcDeviceSelector;
  }
}
