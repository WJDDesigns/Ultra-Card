/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll } from 'vitest';
import { html, render } from 'lit';
import { getModuleRegistry } from '../module-registry';
import { mockHass } from '../../editor/tabs/__tests__/layout-tab-harness';
import type { RainRadarModule, UltraCardConfig } from '../../types';

const TYPE = 'rain_radar';
const CONFIG: UltraCardConfig = { type: 'custom:ultra-card', layout: { rows: [] } };
const homeHass = { ...mockHass, config: { latitude: 52.37, longitude: 4.9 } } as typeof mockHass;

function renderToHost(template: unknown): HTMLElement {
  const host = document.createElement('div');
  document.body.appendChild(host);
  render(html`${template}`, host);
  return host;
}

describe('Rain Radar module', () => {
  beforeAll(async () => {
    await getModuleRegistry().ensureModuleLoaded(TYPE);
  });

  it('is free and valid with its own defaults', () => {
    const handler = getModuleRegistry().getModule(TYPE)!;
    expect(handler.metadata.tags).not.toContain('pro');
    const module = handler.createDefault('rr-1');
    expect(handler.validate(module)).toEqual({ valid: true, errors: [] });
  });

  it('shows a friendly empty state when there is no location', () => {
    const handler = getModuleRegistry().getModule(TYPE)!;
    const module = handler.createDefault('rr-2');
    const host = renderToHost(handler.renderPreview(module, mockHass, CONFIG, 'dashboard'));
    expect(host.querySelector('uc-rain-radar')).toBeNull();
    expect(host.textContent).toContain('Choose where to show the radar');
    host.remove();
  });

  it('renders the radar map element when Home Assistant has a home location', async () => {
    const handler = getModuleRegistry().getModule(TYPE)!;
    const module = {
      ...handler.createDefault('rr-3'),
      title: 'Rain near home',
      height: 260,
    } as RainRadarModule;
    const host = renderToHost(handler.renderPreview(module, homeHass, CONFIG, 'dashboard'));
    const el = host.querySelector('uc-rain-radar') as HTMLElement & {
      updateComplete: Promise<unknown>;
    };
    expect(el).toBeTruthy();
    await el.updateComplete;
    const wrap = el.shadowRoot!.querySelector('.wrap') as HTMLElement;
    expect(wrap.style.height).toBe('260px');
    expect(el.shadowRoot!.textContent).toContain('Rain near home');
    host.remove();
  });

  it('shows coordinate fields only in coordinates mode', () => {
    const handler = getModuleRegistry().getModule(TYPE)!;
    const base = handler.createDefault('rr-4') as RainRadarModule;
    const home = renderToHost(handler.renderGeneralTab(base, homeHass, CONFIG, () => {}));
    expect(home.textContent).not.toContain('Latitude');
    home.remove();
    const manual = renderToHost(
      handler.renderGeneralTab({ ...base, center_mode: 'manual' }, homeHass, CONFIG, () => {})
    );
    expect(manual.textContent).toContain('Latitude');
    manual.remove();
  });
});
