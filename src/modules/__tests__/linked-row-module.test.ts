/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { html, render } from 'lit';
import { getModuleRegistry } from '../module-registry';
import { CORE_MANIFESTS } from '../module-manifest-data';
import { ucLinkedRowService } from '../../services/uc-linked-row-service';
import type { UltraCardConfig } from '../../types';

const SENSOR = 'sensor.ultra_card_pro_cloud_authentication_status';
const CONFIG: UltraCardConfig = { type: 'custom:ultra-card', layout: { rows: [] } };

function proHass(callApi: any) {
  return {
    callApi,
    config: { components: ['ultra_card_pro_cloud'] },
    locale: { language: 'en' },
    user: { is_admin: false },
    states: {
      [SENSOR]: {
        entity_id: SENSOR,
        state: 'connected',
        attributes: {
          authenticated: true,
          user_id: 1,
          username: 'test',
          subscription_tier: 'pro',
          subscription_status: 'active',
          integration_version: '1.10.0',
          capabilities: { linked_rows: true },
        },
      },
    },
  } as any;
}

function renderToHost(template: unknown): HTMLElement {
  const host = document.createElement('div');
  document.body.appendChild(host);
  render(html`${template}`, host);
  return host;
}

const text = (t: string) => ({ id: `t-${t}`, type: 'text', text: t }) as any;

describe('linked_row module', () => {
  beforeAll(async () => {
    const reg = getModuleRegistry();
    await Promise.all(['linked_row', 'text'].map(t => reg.ensureModuleLoaded(t)));
  });

  beforeEach(() => {
    localStorage.clear();
    ucLinkedRowService.reset();
  });

  it('is a Pro layout module in the manifest', () => {
    const manifest = CORE_MANIFESTS.find(m => m.type === 'linked_row')!;
    expect(manifest.category).toBe('layout');
    expect(manifest.tags).toEqual(expect.arrayContaining(['pro', 'premium']));
  });

  it('createDefault validates and renders an empty-state hint', () => {
    const handler = getModuleRegistry().getModule('linked_row')!;
    const def = handler.createDefault();
    expect(def.type).toBe('linked_row');
    expect(handler.validate(def)).toEqual({ valid: true, errors: [] });
    const host = renderToHost(handler.renderPreview(def, proHass(vi.fn()), CONFIG));
    expect(host.querySelector('.uc-linked-row-empty')).toBeTruthy();
    expect(host.textContent).toContain('Linked Row');
  });

  it('renders the local copy without Connect and the newer shared copy with it', async () => {
    const handler = getModuleRegistry().getModule('linked_row')!;
    const m = {
      ...handler.createDefault(),
      linked_id: 'lr_a',
      linked_revision: 1,
      modules: [text('Local copy')],
    } as any;

    const noConnect = { ...proHass(vi.fn()), config: { components: [] } };
    expect(renderToHost(handler.renderPreview(m, noConnect, CONFIG)).textContent).toContain(
      'Local copy'
    );

    const callApi = vi.fn().mockResolvedValue({
      row: { id: 'lr_a', name: 'A', modules: [text('Shared copy')], revision: 2, updated_at: '' },
    });
    const hass = proHass(callApi);
    handler.renderPreview(m, hass, CONFIG);
    await ucLinkedRowService.fetchRow(hass, 'lr_a');
    const dash = renderToHost(handler.renderPreview(m, hass, CONFIG)).textContent || '';
    expect(dash).toContain('Shared copy');
    // The editor preview keeps showing what is being edited.
    const editor = renderToHost(handler.renderPreview(m, hass, CONFIG, 'live')).textContent || '';
    expect(editor).toContain('Local copy');
  });

  it('renders the General tab with and without Pro', () => {
    const handler = getModuleRegistry().getModule('linked_row')!;
    const def = handler.createDefault();
    const update = vi.fn();
    const locked = renderToHost(
      handler.renderGeneralTab(def, { ...proHass(vi.fn()), states: {} }, CONFIG, update)
    );
    expect(locked.textContent).toContain('Pro');
    const callApi = vi.fn().mockResolvedValue({ rows: [] });
    const open = renderToHost(handler.renderGeneralTab(def, proHass(callApi), CONFIG, update));
    expect(open.textContent).toContain('Create shared row');
  });
});
