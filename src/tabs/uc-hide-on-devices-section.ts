import { html, TemplateResult } from 'lit';
import type { DeviceBreakpoint } from '../types';
import { localize } from '../localize/localize';

/**
 * Shared "Hide on Devices" section (Desktop / Laptop / Tablet / Mobile).
 * Used by the Logic tab for modules, rows and columns, and by navigation items.
 */
export function renderHideOnDevicesSection(
  hidden: DeviceBreakpoint[],
  onChange: (next: DeviceBreakpoint[] | undefined) => void,
  lang: string
): TemplateResult {
  const toggle = (device: DeviceBreakpoint): void => {
    const next = hidden.includes(device) ? hidden.filter(d => d !== device) : [...hidden, device];
    onChange(next.length > 0 ? next : undefined);
  };

  return html`
    <div
      class="settings-section"
      style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px; border-left: 3px solid var(--primary-color);"
    >
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <ha-icon icon="mdi:responsive" style="color: var(--primary-color);"></ha-icon>
        <span style="font-size: 16px; font-weight: 700; color: var(--primary-text-color);">
          ${localize('editor.logic.hide_on_devices', lang, 'Hide on Devices')}
        </span>
      </div>
      <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;">
        ${localize(
          'editor.logic.hide_on_devices_desc',
          lang,
          'Hide this element on specific screen sizes. Use this to create different layouts for different devices.'
        )}
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
        <label
          style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--card-background-color); border-radius: 6px; cursor: pointer; border: 1px solid ${hidden.includes('desktop') ? 'var(--primary-color)' : 'var(--divider-color)'}; transition: all 0.2s ease;"
        >
          <ha-checkbox
            .checked=${hidden.includes('desktop')}
            @change=${() => toggle('desktop')}
          ></ha-checkbox>
          <ha-icon
            icon="mdi:monitor"
            style="color: ${hidden.includes('desktop') ? 'var(--primary-color)' : 'var(--secondary-text-color)'}; --mdc-icon-size: 20px;"
          ></ha-icon>
          <div style="flex: 1;">
            <div style="font-weight: 500; font-size: 13px;">Desktop</div>
            <div style="font-size: 11px; color: var(--secondary-text-color);">≥1381px</div>
          </div>
        </label>
        <label
          style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--card-background-color); border-radius: 6px; cursor: pointer; border: 1px solid ${hidden.includes('laptop') ? 'var(--primary-color)' : 'var(--divider-color)'}; transition: all 0.2s ease;"
        >
          <ha-checkbox
            .checked=${hidden.includes('laptop')}
            @change=${() => toggle('laptop')}
          ></ha-checkbox>
          <ha-icon
            icon="mdi:laptop"
            style="color: ${hidden.includes('laptop') ? 'var(--primary-color)' : 'var(--secondary-text-color)'}; --mdc-icon-size: 20px;"
          ></ha-icon>
          <div style="flex: 1;">
            <div style="font-weight: 500; font-size: 13px;">Laptop</div>
            <div style="font-size: 11px; color: var(--secondary-text-color);">1025-1380px</div>
          </div>
        </label>
        <label
          style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--card-background-color); border-radius: 6px; cursor: pointer; border: 1px solid ${hidden.includes('tablet') ? 'var(--primary-color)' : 'var(--divider-color)'}; transition: all 0.2s ease;"
        >
          <ha-checkbox
            .checked=${hidden.includes('tablet')}
            @change=${() => toggle('tablet')}
          ></ha-checkbox>
          <ha-icon
            icon="mdi:tablet"
            style="color: ${hidden.includes('tablet') ? 'var(--primary-color)' : 'var(--secondary-text-color)'}; --mdc-icon-size: 20px;"
          ></ha-icon>
          <div style="flex: 1;">
            <div style="font-weight: 500; font-size: 13px;">Tablet</div>
            <div style="font-size: 11px; color: var(--secondary-text-color);">601-1024px</div>
          </div>
        </label>
        <label
          style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--card-background-color); border-radius: 6px; cursor: pointer; border: 1px solid ${hidden.includes('mobile') ? 'var(--primary-color)' : 'var(--divider-color)'}; transition: all 0.2s ease;"
        >
          <ha-checkbox
            .checked=${hidden.includes('mobile')}
            @change=${() => toggle('mobile')}
          ></ha-checkbox>
          <ha-icon
            icon="mdi:cellphone"
            style="color: ${hidden.includes('mobile') ? 'var(--primary-color)' : 'var(--secondary-text-color)'}; --mdc-icon-size: 20px;"
          ></ha-icon>
          <div style="flex: 1;">
            <div style="font-weight: 500; font-size: 13px;">Mobile</div>
            <div style="font-size: 11px; color: var(--secondary-text-color);">≤600px</div>
          </div>
        </label>
      </div>
      ${
        hidden.length > 0
          ? html`
              <div
                style="margin-top: 12px; padding: 8px 12px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 4px; font-size: 12px; color: var(--primary-color);"
              >
                <ha-icon
                  icon="mdi:information-outline"
                  style="--mdc-icon-size: 14px; vertical-align: middle; margin-right: 4px;"
                ></ha-icon>
                This element will be hidden on:
                ${hidden.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
              </div>
            `
          : ''
      }
    </div>
  `;
}
