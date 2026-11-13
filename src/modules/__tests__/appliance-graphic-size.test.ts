import { describe, it, expect } from 'vitest';
import { render } from 'lit';
import { UltraWasherModule } from '../appliance-module';

const hass = {
  states: {
    'sensor.washer_state': { entity_id: 'sensor.washer_state', state: 'run', attributes: {} },
  },
  entities: {},
  devices: {},
  language: 'en',
  locale: { language: 'en' },
  callService: () => Promise.resolve(),
} as any;

function svgWidth(overrides: Record<string, unknown>): number {
  const mod = new UltraWasherModule() as any;
  const m = { ...mod.createDefault('w1'), entity: 'sensor.washer_state', ...overrides };
  const host = document.createElement('div');
  render(mod.renderPreview(m, hass), host);
  const svg = host.querySelector('.uc-appl-visual svg');
  return Number(svg?.getAttribute('width'));
}

describe('Appliance graphic size', () => {
  it('compact layout uses its own size setting', () => {
    expect(svgWidth({ layout: 'compact' })).toBe(40);
    expect(svgWidth({ layout: 'compact', appliance_compact_size: 72 })).toBe(72);
  });

  it('hero layout follows the size below 110px', () => {
    expect(svgWidth({ layout: 'hero', appliance_size: 80 })).toBe(80);
    expect(svgWidth({ layout: 'hero', appliance_size: 180 })).toBe(180);
  });

  it('standard layout keeps following the size', () => {
    expect(svgWidth({ layout: 'standard', appliance_size: 120 })).toBe(120);
  });
});
