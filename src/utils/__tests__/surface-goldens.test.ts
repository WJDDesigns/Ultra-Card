/** @vitest-environment jsdom */
/**
 * Golden render of every module surface style.
 *
 * These snapshots freeze what bar, slider control, button, spinbox and popup
 * trigger render for each of their style values today. They are the contract
 * for moving that CSS into `uc-surface-recipes.ts`: a refactor may not change
 * a single byte here unless the change is deliberate and the snapshot is
 * updated in the same commit with a note.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { html, render } from 'lit';
import { getModuleRegistry } from '../../modules/module-registry';
import { BaseUltraModule } from '../../modules/base-module';
import { mockHass } from '../../editor/tabs/__tests__/layout-tab-harness';
import { UC_SURFACE_RECIPES } from '../uc-surface-recipes';

// resolveEntity reaches for the custom-variables service through a runtime
// require() that vitest's ESM loader cannot satisfy; none of these fixtures
// use variables, so the identity mapping is exact.
(BaseUltraModule.prototype as any).resolveEntity = (v: string | undefined) => v;

const hass = {
  ...mockHass,
  states: {
    'sensor.level': { entity_id: 'sensor.level', state: '55', attributes: { unit_of_measurement: '%' } },
    'sensor.full': { entity_id: 'sensor.full', state: '100', attributes: { unit_of_measurement: '%' } },
    'light.lamp': {
      entity_id: 'light.lamp',
      state: 'on',
      attributes: { brightness: 140, supported_color_modes: ['brightness'], friendly_name: 'Lamp' },
    },
  },
} as any;

const config = { type: 'custom:ultra-card', layout: { rows: [] } } as any;

/** Inline `style` of every element in render order, whitespace-normalised. */
function styles(host: HTMLElement): string[] {
  return Array.from(host.querySelectorAll<HTMLElement>('[style]')).map(el => {
    const cls = el.className && typeof el.className === 'string' ? `.${el.className.trim().replace(/\s+/g, '.')}` : el.tagName.toLowerCase();
    return `${cls} {${el.getAttribute('style')!.replace(/\s+/g, ' ').trim()}}`;
  });
}

function paint(type: string, patch: Record<string, unknown>): string[] {
  const reg = getModuleRegistry();
  const module = { ...reg.createDefaultModule(type, `g-${type}`, hass)!, ...patch };
  const handler = reg.getModule(type)!;
  const host = document.createElement('div');
  document.body.appendChild(host);
  try {
    render(html`${handler.renderPreview(module as any, hass, config, 'live')}`, host);
    return styles(host);
  } finally {
    host.remove();
  }
}

describe('surface goldens', () => {
  beforeAll(async () => {
    const reg = getModuleRegistry();
    await Promise.all(['bar', 'slider_control', 'button', 'spinbox', 'popup'].map(t => reg.ensureModuleLoaded(t)));
  });

  const BAR_STYLES = [...UC_SURFACE_RECIPES];
  for (const style of BAR_STYLES) {
    for (const use_gradient of [false, true]) {
      for (const entity of ['sensor.level', 'sensor.full']) {
        it(`bar ${style} gradient=${use_gradient} ${entity}`, () => {
          expect(
            paint('bar', {
              entity,
              bar_style: style,
              use_gradient,
              gradient_stops: use_gradient
                ? [
                    { id: 'a', position: 0, color: '#ff0000' },
                    { id: 'b', position: 100, color: '#00ff00' },
                  ]
                : undefined,
              bar_color: '#2196f3',
              bar_background_color: '#eeeeee',
              glass_blur_amount: 8,
            })
          ).toMatchSnapshot();
        });
      }
    }
  }

  const SLIDER_STYLES = ['flat', 'glossy', 'embossed', 'inset', 'gradient-overlay', 'neon-glow', 'outline', 'glass', 'metallic', 'neumorphic', 'minimal'];
  for (const style of SLIDER_STYLES) {
    it(`slider_control ${style}`, () => {
      expect(
        paint('slider_control', {
          slider_style: style,
          glass_blur_amount: 8,
          bars: [{ id: 'b1', entity: 'light.lamp', name: 'Lamp', slider_style: style }],
        })
      ).toMatchSnapshot();
    });
  }

  const CONTROL_STYLES = ['flat', 'glossy', 'embossed', 'inset', 'gradient-overlay', 'neon-glow', 'outline', 'glass', 'metallic', 'neumorphic'];
  for (const style of CONTROL_STYLES) {
    it(`button ${style}`, () => {
      expect(paint('button', { style, background_color: '#2196f3', label: 'Go' })).toMatchSnapshot();
    });
    it(`spinbox ${style}`, () => {
      expect(paint('spinbox', { button_style: style, entity: 'sensor.level' })).toMatchSnapshot();
    });
    it(`popup trigger ${style}`, () => {
      expect(paint('popup', { trigger_button_style: style, trigger_type: 'button', trigger_text: 'Open' })).toMatchSnapshot();
    });
  }
});
