import { describe, expect, it } from 'vitest';
import type { LayoutConfig } from '../../types';
import { applySmartLayoutDesign } from './uc-smart-layout-design';

type AnyModule = Record<string, unknown>;

function layoutOf(modules: AnyModule[]): LayoutConfig {
  return {
    rows: [
      {
        id: 'r',
        column_layout: '1-col',
        columns: [{ id: 'c', modules: modules as unknown as LayoutConfig['rows'][number]['columns'][number]['modules'] }],
      },
    ],
  } as LayoutConfig;
}

function modulesOf(layout: LayoutConfig): AnyModule[] {
  return layout.rows[0].columns[0].modules as unknown as AnyModule[];
}

describe('applySmartLayoutDesign', () => {
  it('gives rows editor margins and stretches columns', () => {
    const layout = layoutOf([{ id: 'w', type: 'animated_weather', weather_entity: 'weather.home' }]);
    applySmartLayoutDesign(layout);

    const row = layout.rows[0] as unknown as AnyModule;
    const column = layout.rows[0].columns[0] as unknown as AnyModule;
    expect(row.design).toEqual({ margin_top: '8px', margin_bottom: '8px' });
    expect(column.vertical_alignment).toBe('stretch');
    expect(column.horizontal_alignment).toBe('stretch');
  });

  it('spaces sections and puts groups of small modules in a panel, leaving big modules alone', () => {
    const layout = layoutOf([
      { id: 'w', type: 'animated_weather', weather_entity: 'weather.home' },
      {
        id: 'p',
        type: 'horizontal',
        modules: [
          { id: 'p1', type: 'people', person_entity: 'person.a' },
          { id: 'p2', type: 'people', person_entity: 'person.b' },
        ],
      },
    ]);
    applySmartLayoutDesign(layout);
    const [weather, people] = modulesOf(layout);

    expect(weather.design).toBeUndefined();
    const design = people.design as Record<string, string>;
    expect(design.margin_top).toBe('12px');
    expect(design.padding_left).toBe('14px');
    expect(design.border_radius).toBe('14px');
    expect(design.background_color).toContain('--rgb-primary-text-color');
  });

  it('treats a vertical stack of sections as the card body and styles each section', () => {
    const layout = layoutOf([
      {
        id: 'body',
        type: 'vertical',
        modules: [
          { id: 'h', type: 'horizontal', modules: [{ id: 'i', type: 'icon' }, { id: 'n', type: 'info', entity: 'sensor.x' }] },
          { id: 'c', type: 'climate', entity: 'climate.x' },
        ],
      },
    ]);
    applySmartLayoutDesign(layout);
    const body = modulesOf(layout)[0];
    const [header, climate] = body.modules as AnyModule[];

    expect(body.gap).toBe(12);
    expect(body.design).toBeUndefined();
    expect((header.design as Record<string, string>).padding_top).toBe('12px');
    expect(climate.design).toBeUndefined();
  });

  it('never overrides styling the plan already chose', () => {
    const layout = layoutOf([
      { id: 't', type: 'text', text: 'Title' },
      {
        id: 'p',
        type: 'horizontal',
        gap: 4,
        design: { margin_top: '0px', background_color: '#123456' },
        modules: [{ id: 'b', type: 'button', label: 'Go' }],
      },
    ]);
    applySmartLayoutDesign(layout);
    const [title, row] = modulesOf(layout);
    const design = row.design as Record<string, string>;

    expect(title.design).toBeUndefined();
    expect(row.gap).toBe(4);
    expect(design.margin_top).toBe('0px');
    expect(design.background_color).toBe('#123456');
    expect(design.padding_top).toBe('12px');
  });
});
