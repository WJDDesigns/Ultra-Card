import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { DeviceBreakpoint, DEVICE_BREAKPOINTS } from '../types';

export interface BreakpointChangedEvent {
  detail: {
    breakpoint: DeviceBreakpoint;
    width: number | null; // null = no constraint (desktop)
  };
}

/**
 * Preview width values for simulating different device sizes.
 * These are practical preview widths, not the actual breakpoint thresholds.
 */
export const PREVIEW_WIDTHS: Record<DeviceBreakpoint, number | null> = {
  desktop: null, // Full width
  laptop: 1280,
  tablet: 900,
  mobile: 375,
};

/**
 * Breakpoint preview selector component.
 * Displays device icons for simulating different screen sizes in preview areas.
 * Compact design suitable for preview headers.
 */
@customElement('uc-breakpoint-preview')
export class UcBreakpointPreview extends LitElement {
  @property({ attribute: false }) public selectedBreakpoint: DeviceBreakpoint = 'desktop';

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
    }

    .breakpoint-selector {
      display: flex;
      align-items: center;
      gap: 2px;
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
      border-radius: 6px;
      padding: 2px;
    }

    .breakpoint-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
      color: var(--secondary-text-color, #888);
    }

    .breakpoint-btn:hover {
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
      color: var(--primary-text-color, #fff);
    }

    .breakpoint-btn.active {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
    }

    .breakpoint-btn ha-icon {
      --mdc-icon-size: 18px;
      width: 18px;
      height: 18px;
    }
  `;

  private _selectBreakpoint(breakpoint: DeviceBreakpoint): void {
    if (this.selectedBreakpoint === breakpoint) return;

    this.selectedBreakpoint = breakpoint;
    this.dispatchEvent(
      new CustomEvent('breakpoint-changed', {
        detail: {
          breakpoint,
          width: PREVIEW_WIDTHS[breakpoint],
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _getBreakpointTooltip(breakpoint: DeviceBreakpoint): string {
    const config = DEVICE_BREAKPOINTS[breakpoint];
    const width = PREVIEW_WIDTHS[breakpoint];
    if (width) {
      return `${config.label} (${width}px)`;
    }
    return `${config.label} (full width)`;
  }

  render(): TemplateResult {
    const devices: Array<{ key: DeviceBreakpoint; icon: string }> = [
      { key: 'desktop', icon: DEVICE_BREAKPOINTS.desktop.icon },
      { key: 'laptop', icon: DEVICE_BREAKPOINTS.laptop.icon },
      { key: 'tablet', icon: DEVICE_BREAKPOINTS.tablet.icon },
      { key: 'mobile', icon: DEVICE_BREAKPOINTS.mobile.icon },
    ];

    return html`
      <div class="breakpoint-selector">
        ${devices.map(
          ({ key, icon }) => html`
            <button
              class="breakpoint-btn ${this.selectedBreakpoint === key ? 'active' : ''}"
              @click=${() => this._selectBreakpoint(key)}
              title="${this._getBreakpointTooltip(key)}"
            >
              <ha-icon .icon=${icon}></ha-icon>
            </button>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-breakpoint-preview': UcBreakpointPreview;
  }
}
