/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { html, render } from 'lit';
import { UltraInfoModule } from '../info-module';
import type { InfoModule, UltraCardConfig } from '../../types';

/**
 * Cover for #113: the name used to be locked ahead of the value, so a
 * "value on top, name underneath" layout was impossible from the editor.
 */

const CARD_CONFIG: UltraCardConfig = {
  type: 'custom:ultra-card',
  layout: { rows: [] },
} as unknown as UltraCardConfig;

function makeHass() {
  return {
    locale: { language: 'en' },
    states: {
      'sensor.outside_temperature': {
        entity_id: 'sensor.outside_temperature',
        state: '22.9',
        attributes: { friendly_name: 'Outside temperature', unit_of_measurement: '°C' },
        last_changed: new Date().toISOString(),
      },
    },
  } as any;
}

function makeModule(overrides: Record<string, unknown> = {}): InfoModule {
  const handler = new UltraInfoModule();
  const base = handler.createDefault('info_test');
  return {
    ...base,
    info_entities: [
      {
        ...base.info_entities[0]!,
        entity: 'sensor.outside_temperature',
        ...overrides,
      },
    ],
  };
}

/** Order of the name and value nodes as they appear in the committed DOM. */
function renderedOrder(module: InfoModule): string[] {
  const handler = new UltraInfoModule();
  const preview = handler.renderPreview(module, makeHass(), CARD_CONFIG, 'live');
  const host = document.createElement('div');
  document.body.appendChild(host);
  render(html`${preview}`, host);

  const order = Array.from(host.querySelectorAll('.entity-name, .entity-value')).map(el =>
    el.classList.contains('entity-name') ? 'name' : 'value'
  );
  host.remove();
  return order;
}

describe('info module: name and value order', () => {
  it('puts the name first by default', () => {
    expect(renderedOrder(makeModule())).toEqual(['name', 'value']);
  });

  it('puts the name first when the option is set explicitly', () => {
    expect(renderedOrder(makeModule({ name_value_order: 'name-first' }))).toEqual([
      'name',
      'value',
    ]);
  });

  it('puts the value first when value-first is selected', () => {
    expect(renderedOrder(makeModule({ name_value_order: 'value-first' }))).toEqual([
      'value',
      'name',
    ]);
  });

  it('honours value-first in horizontal layout too', () => {
    expect(
      renderedOrder(
        makeModule({ name_value_layout: 'horizontal', name_value_order: 'value-first' })
      )
    ).toEqual(['value', 'name']);
  });

  it('honours value-first with a distribution and a visible icon', () => {
    expect(
      renderedOrder(
        makeModule({
          name_value_layout: 'horizontal',
          content_distribution: 'space-between',
          show_icon: true,
          name_value_order: 'value-first',
        })
      )
    ).toEqual(['value', 'name']);
  });

  it('still groups icon and name ahead of the value by default', () => {
    expect(
      renderedOrder(
        makeModule({
          name_value_layout: 'horizontal',
          content_distribution: 'space-between',
          show_icon: true,
        })
      )
    ).toEqual(['name', 'value']);
  });

  it('leaves a hidden name alone when value-first is set', () => {
    expect(renderedOrder(makeModule({ show_name: false, name_value_order: 'value-first' }))).toEqual(
      ['value']
    );
  });

  it('defaults the new option on a freshly created module', () => {
    const handler = new UltraInfoModule();
    expect(handler.createDefault('fresh').info_entities[0]!.name_value_order).toBe('name-first');
  });
});
