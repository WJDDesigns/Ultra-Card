import { describe, expect, it, vi } from 'vitest';
import { ucThemeDashboardService } from './uc-theme-dashboard-service';

function fakeHass(config: unknown) {
  const saved: any[] = [];
  const hass = {
    callWS: vi.fn(async (msg: any) => {
      if (msg.type === 'lovelace/config') return JSON.parse(JSON.stringify(config));
      if (msg.type === 'lovelace/config/save') {
        saved.push(msg);
        return null;
      }
      if (msg.type === 'lovelace/dashboards/list') {
        return [{ url_path: 'wall', title: 'Wall', mode: 'storage' }, { url_path: 'yaml-one', title: 'Yaml', mode: 'yaml' }];
      }
      throw new Error(`unexpected ${msg.type}`);
    }),
  } as any;
  return { hass, saved };
}

const CONFIG = {
  views: [
    {
      cards: [
        { type: 'custom:ultra-card', layout: {}, uc_theme: 'soft' },
        { type: 'vertical-stack', cards: [{ type: 'custom:ultra-card', layout: {} }, { type: 'entities' }] },
      ],
    },
    {
      type: 'sections',
      sections: [
        {
          cards: [
            {
              type: 'conditional',
              card: { type: 'custom:ultra-card', layout: {}, uc_theme: 'glass' },
            },
          ],
        },
      ],
    },
  ],
};

describe('ucThemeDashboardService', () => {
  it('lists the default dashboard first and keeps yaml mode', async () => {
    const { hass } = fakeHass(CONFIG);
    const list = await ucThemeDashboardService.listDashboards(hass);
    expect(list[0].urlPath).toBeNull();
    expect(list.map(d => d.urlPath)).toEqual([null, 'wall', 'yaml-one']);
    expect(list[2].mode).toBe('yaml');
  });

  it('counts Ultra Cards through stacks, sections and conditional cards', async () => {
    const { hass } = fakeHass(CONFIG);
    const n = await ucThemeDashboardService.countUltraCards(hass, { urlPath: null, title: 'x' });
    expect(n).toBe(3);
  });

  it('writes uc_theme on every Ultra Card and only saves when something changed', async () => {
    const { hass, saved } = fakeHass(CONFIG);
    const ref = { urlPath: 'wall', title: 'Wall', mode: 'storage' as const };
    const result = await ucThemeDashboardService.applyTheme(hass, ref, 'bold');
    expect(result.cardsSeen).toBe(3);
    expect(result.cardsUpdated).toBe(3);
    expect(saved).toHaveLength(1);
    expect(saved[0].url_path).toBe('wall');
    const savedCfg = saved[0].config;
    expect(savedCfg.views[0].cards[0].uc_theme).toBe('bold');
    expect(savedCfg.views[0].cards[1].cards[0].uc_theme).toBe('bold');
    expect(savedCfg.views[1].sections[0].cards[0].card.uc_theme).toBe('bold');
    // non-Ultra cards untouched
    expect(savedCfg.views[0].cards[1].cards[1]).toEqual({ type: 'entities' });
  });

  it('clears uc_theme when asked to follow the global default', async () => {
    const { hass, saved } = fakeHass(CONFIG);
    const result = await ucThemeDashboardService.applyTheme(hass, { urlPath: null, title: 'd' }, undefined);
    // two cards had a theme, one did not
    expect(result.cardsUpdated).toBe(2);
    expect('uc_theme' in saved[0].config.views[0].cards[0]).toBe(false);
  });

  it('refuses yaml dashboards', async () => {
    const { hass } = fakeHass(CONFIG);
    await expect(
      ucThemeDashboardService.applyTheme(hass, { urlPath: 'y', title: 'y', mode: 'yaml' }, 'soft')
    ).rejects.toThrow(/YAML/);
  });

  it('undo restores the previous config', async () => {
    const { hass, saved } = fakeHass(CONFIG);
    const ref = { urlPath: 'wall', title: 'Wall', mode: 'storage' as const };
    await ucThemeDashboardService.applyTheme(hass, ref, 'bold');
    expect(ucThemeDashboardService.canUndo()?.urlPath).toBe('wall');
    await ucThemeDashboardService.undo(hass);
    expect(saved).toHaveLength(2);
    expect(saved[1].config.views[0].cards[0].uc_theme).toBe('soft');
    expect(ucThemeDashboardService.canUndo()).toBeNull();
  });
});
