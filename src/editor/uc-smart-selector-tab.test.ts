import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/uc-smart-cards-service', () => ({
  ucSmartCardsService: {
    getConnectorStatus: vi.fn(async () => ({
      available: { ha_assist: true, user_provider: false, cloud_default: false },
      default_connector: 'auto',
      limits: { free_remaining: 3, free_daily_generations: 5 },
    })),
    generatePreset: vi.fn(async () => ({
      generation: { warnings: ['trimmed unused module'], connector_used: 'ha_assist' },
      presets: [],
    })),
    getPresetCandidates: vi.fn(() => [
      {
        id: 'smart-1',
        name: 'Morning Dashboard',
        description: 'Weather and coffee',
        category: 'layouts',
        icon: 'mdi:weather-sunny',
        author: 'Assist',
        version: '1.0.0',
        tags: ['morning'],
        layout: {
          rows: [
            {
              id: 'r1',
              columns: [
                {
                  id: 'c1',
                  modules: [{ id: 't1', type: 'text', text: 'Hello' }],
                },
              ],
            },
          ],
        },
      },
    ]),
  },
}));

import './uc-smart-selector-tab';
import type { UcSmartSelectorTab } from './uc-smart-selector-tab';

describe('uc-smart-selector-tab wizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function mount(): Promise<UcSmartSelectorTab> {
    const el = document.createElement('uc-smart-selector-tab') as UcSmartSelectorTab;
    (el as any).hass = { locale: { language: 'en' }, states: {} };
    (el as any).isPro = false;
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 0));
    await el.updateComplete;
    return el;
  }

  it('starts on status step and advances to compose', async () => {
    const el = await mount();
    const anyEl = el as any;
    expect(anyEl._wizardStep).toBe('status');
    const continueBtn = [...el.renderRoot.querySelectorAll('button')].find(b =>
      (b.textContent || '').includes('Continue')
    ) as HTMLButtonElement;
    expect(continueBtn).toBeTruthy();
    continueBtn.click();
    await el.updateComplete;
    expect(anyEl._wizardStep).toBe('compose');
    expect(el.renderRoot.querySelector('#smart-prompt-input')).toBeTruthy();
    el.remove();
  });

  it('after generate advances to preview with warnings', async () => {
    const el = await mount();
    const anyEl = el as any;
    anyEl._wizardStep = 'compose';
    anyEl._prompt = 'build a morning card';
    await el.updateComplete;
    await anyEl._generate();
    await el.updateComplete;
    expect(anyEl._wizardStep).toBe('preview');
    expect(anyEl._warnings).toContain('trimmed unused module');
    expect(anyEl._results.length).toBe(1);
    el.remove();
  });

  it('apply emits preset-selected without skipEntityMapping', async () => {
    const el = await mount();
    const anyEl = el as any;
    anyEl._selectedPreset = {
      id: 'smart-1',
      name: 'Morning Dashboard',
      description: 'Weather and coffee',
      category: 'layouts',
      icon: 'mdi:weather-sunny',
      author: 'Assist',
      version: '1.0.0',
      tags: [],
      layout: { rows: [] },
    };
    anyEl._wizardStep = 'apply';
    await el.updateComplete;

    const events: CustomEvent[] = [];
    el.addEventListener('preset-selected', (e: Event) => events.push(e as CustomEvent));
    anyEl._emitPresetSelected(anyEl._selectedPreset);
    expect(events).toHaveLength(1);
    expect(events[0].detail.preset.id).toBe('smart-1');
    expect(events[0].detail.skipEntityMapping).toBeUndefined();
    el.remove();
  });
});
