/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { html, render } from 'lit';
import { getModuleRegistry } from '../module-registry';
import { coreLoaders } from '../module-loaders';
import { CORE_MANIFESTS } from '../module-manifest-data';
import { mockHass, mockProHass } from '../../editor/tabs/__tests__/layout-tab-harness';
import { localDayBounds } from '../../services/uc-energy-price-service';
import type { EnergyPriceModule, UltraCardConfig } from '../../types';

const TYPE = 'energy_price';
const CONFIG: UltraCardConfig = { type: 'custom:ultra-card', layout: { rows: [] } };
const PRICE_ID = 'sensor.nordpool_kwh_se3_sek_3_10_025';

function renderToHost(template: unknown): HTMLElement {
  const host = document.createElement('div');
  document.body.appendChild(host);
  render(html`${template}`, host);
  return host;
}

/** A custom-integration Nord Pool sensor with 24 hourly prices for today, cheapest at 03:00. */
function nordpoolHass(
  extraStates: Record<string, unknown> = {},
  callService = vi.fn(async () => {})
) {
  const day = localDayBounds(new Date());
  const span = day.end.getTime() - day.start.getTime();
  const step = span / 24;
  const prices = Array.from({ length: 24 }, (_, i) => (i === 3 ? 0.05 : 0.5 + (i % 5) * 0.1));
  const rawToday = prices.map((value, i) => ({
    start: new Date(day.start.getTime() + i * step).toISOString(),
    end: new Date(day.start.getTime() + (i + 1) * step).toISOString(),
    value,
  }));
  return {
    ...mockHass,
    callService,
    states: {
      [PRICE_ID]: {
        entity_id: PRICE_ID,
        state: '0.5',
        attributes: {
          unit_of_measurement: 'SEK/kWh',
          friendly_name: 'Nord Pool SE3',
          raw_today: rawToday,
          raw_tomorrow: [],
          tomorrow_valid: false,
        },
      },
      ...extraStates,
    },
  } as typeof mockHass;
}

describe('Energy Price & EV module', () => {
  beforeAll(async () => {
    await getModuleRegistry().ensureModuleLoaded(TYPE);
  });

  it('is registered in the manifest, loaders and registry with Pro tags', () => {
    expect(coreLoaders[TYPE]).toBeTypeOf('function');
    const manifest = CORE_MANIFESTS.find(m => m.type === TYPE);
    expect(manifest).toBeTruthy();
    expect(manifest?.tags).toContain('pro');
    expect(manifest?.tags).toContain('premium');
    const handler = getModuleRegistry().getModule(TYPE);
    expect(handler?.metadata.title).toBe(manifest?.title);
    expect(handler?.metadata.icon).toBe(manifest?.icon);
    expect(handler?.metadata.category).toBe(manifest?.category);
  });

  it('createDefault is valid and opts into the shared action contract', () => {
    const reg = getModuleRegistry();
    const module = reg.createDefaultModule(
      TYPE,
      'ep-default',
      undefined as any
    ) as EnergyPriceModule;
    expect(module.type).toBe(TYPE);
    expect(module.price_entity).toBe('');
    expect(module.display_mode).toBe('always');
    expect(module.tap_action).toEqual({ action: 'nothing' });
    const handler = reg.getModule(TYPE);
    expect(handler?.validate(module)).toEqual({ valid: true, errors: [] });
  });

  it('renders a friendly setup state from the default config', () => {
    const reg = getModuleRegistry();
    const handler = reg.getModule(TYPE);
    const module = reg.createDefaultModule(TYPE, 'ep-empty', mockHass);
    for (const ctx of ['dashboard', 'live', 'ha-preview'] as const) {
      const host = renderToHost(
        handler?.renderPreview(module as EnergyPriceModule, mockHass, CONFIG, ctx)
      );
      expect(host.textContent).toContain('price sensor');
      host.remove();
    }
  });

  it('renders the current price, level, chart and cheapest window from a Nord Pool sensor', () => {
    const reg = getModuleRegistry();
    const handler = reg.getModule(TYPE);
    const module = {
      ...(reg.createDefaultModule(TYPE, 'ep-np', mockHass) as EnergyPriceModule),
      price_entity: PRICE_ID,
      window_hours: 1,
      window_label: 'Dishwasher',
    };
    const host = renderToHost(handler?.renderPreview(module, nordpoolHass(), CONFIG, 'dashboard'));
    expect(host.querySelector('.uc-ep-price')).toBeTruthy();
    expect(host.querySelector('.uc-ep-level')).toBeTruthy();
    expect(host.querySelectorAll('svg rect').length).toBeGreaterThanOrEqual(24);
    expect(host.textContent).toContain('Nord Pool');
    expect(host.textContent).toContain('SEK/kWh');
    host.remove();
  });

  it('shows a missing-sensor state instead of throwing', () => {
    const reg = getModuleRegistry();
    const handler = reg.getModule(TYPE);
    const module = {
      ...(reg.createDefaultModule(TYPE, 'ep-missing', mockHass) as EnergyPriceModule),
      price_entity: 'sensor.does_not_exist',
    };
    const host = renderToHost(handler?.renderPreview(module, mockHass, CONFIG, 'dashboard'));
    expect(host.textContent).toContain('sensor.does_not_exist');
    host.remove();
  });

  it('renders an EV plan and only calls a service when the button is tapped', async () => {
    const callService = vi.fn(async () => {});
    const hass = nordpoolHass(
      {
        'sensor.car_soc': { entity_id: 'sensor.car_soc', state: '40', attributes: {} },
        'switch.charger': { entity_id: 'switch.charger', state: 'off', attributes: {} },
      },
      callService
    );
    const reg = getModuleRegistry();
    const handler = reg.getModule(TYPE);
    const module = {
      ...(reg.createDefaultModule(TYPE, 'ep-ev', mockHass) as EnergyPriceModule),
      price_entity: PRICE_ID,
      ev_enabled: true,
      ev_soc_entity: 'sensor.car_soc',
      ev_charger_entity: 'switch.charger',
      ev_apply_mode: 'charger' as const,
    };
    const host = renderToHost(handler?.renderPreview(module, hass, CONFIG, 'dashboard'));
    expect(host.querySelector('.uc-ep-ev')).toBeTruthy();
    expect(host.querySelector('.uc-ep-soc')).toBeTruthy();
    expect(callService).not.toHaveBeenCalled();
    const button = host.querySelector<HTMLButtonElement>('.uc-ep-apply');
    expect(button).toBeTruthy();
    button?.click();
    await Promise.resolve();
    expect(callService).toHaveBeenCalledWith('homeassistant', 'turn_on', {
      entity_id: 'switch.charger',
    });
    host.remove();
  });

  it('locks the general tab for non-Pro users and renders it for Pro', () => {
    const reg = getModuleRegistry();
    const handler = reg.getModule(TYPE);
    const module = reg.createDefaultModule(TYPE, 'ep-tab', mockHass) as EnergyPriceModule;
    const locked = renderToHost(handler?.renderGeneralTab(module, mockHass, CONFIG, () => {}));
    expect(locked.innerHTML).toContain('mdi:lock');
    locked.remove();

    const pro = renderToHost(
      handler?.renderGeneralTab({ ...module, ev_enabled: true }, mockProHass, CONFIG, () => {})
    );
    expect(pro.innerHTML).not.toContain('mdi:lock');
    expect(pro.querySelectorAll('.settings-section').length).toBeGreaterThan(3);
    pro.remove();
  });

  it('declares octopus sibling events as runtime entities', () => {
    const handler = getModuleRegistry().getModule(TYPE);
    const ids = handler?.getRuntimeEntityIds?.({
      ...(handler.createDefault('ep-oct') as EnergyPriceModule),
      price_entity: 'sensor.octopus_energy_electricity_19m_123_current_rate',
    });
    expect(ids).toContain('event.octopus_energy_electricity_19m_123_current_day_rates');
    expect(ids).toContain('event.octopus_energy_electricity_19m_123_next_day_rates');
  });

  it('exposes balanced CSS', () => {
    const styles = getModuleRegistry().getModule(TYPE)?.getStyles?.() || '';
    expect((styles.match(/\{/g) || []).length).toBe((styles.match(/\}/g) || []).length);
  });
});
