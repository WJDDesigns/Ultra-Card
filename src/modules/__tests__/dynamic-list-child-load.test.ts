/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { html, render } from 'lit';
import { getModuleRegistry } from '../module-registry';
import { mockHass } from '../../editor/tabs/__tests__/layout-tab-harness';
import { PREVIEW_UPDATE_EVENT, resetPreviewUpdateScheduler } from '../../utils/uc-preview-update';

/**
 * Issue #130: a dynamic list rendered on a cold page load showed skeletons for
 * its generated children forever. The children are not in the card config, so
 * the card's "module loaded" listener ignored them and nothing re-rendered.
 */
describe('dynamic list: generated children that are not loaded yet', () => {
  beforeAll(async () => {
    await getModuleRegistry().ensureModuleLoaded('dynamic-list');
  });

  afterEach(() => {
    resetPreviewUpdateScheduler();
    vi.useRealTimers();
  });

  it('renders a skeleton and asks for a repaint once the child module has loaded', async () => {
    vi.useFakeTimers();
    const registry = getModuleRegistry();
    const handler = registry.getModule('dynamic-list')!;
    expect(handler).toBeTruthy();

    // A generated child of a type that is registered but not loaded in this test.
    const childType = 'gauge';
    expect(registry.isModuleLoaded(childType)).toBe(false);

    const module = registry.createDefaultModule('dynamic-list', 'dl1', mockHass)! as any;
    module.source_type = 'template';
    module.dynamic_template = '{{ [] | tojson }}';

    // Pre-seed the template result the way the websocket callback would.
    const hass: any = { ...mockHass, connection: { subscribeMessage: () => Promise.resolve(() => {}) } };
    handler.renderPreview(module, hass, { type: 'custom:ultra-card', layout: { rows: [] } }, 'dashboard');
    expect(hass.__uvc_template_strings).toBeTruthy();
    const key = `layout_mods_dynlist_dl1_${(handler as any)._hashString(module.dynamic_template)}`;
    hass.__uvc_template_strings[key] = [
      { id: 'g1', type: childType, entity: 'sensor.x', display_mode: 'always', display_conditions: [] },
    ];

    const repaint = vi.fn();
    window.addEventListener(PREVIEW_UPDATE_EVENT, repaint);

    const host = document.createElement('div');
    document.body.appendChild(host);
    render(
      html`${handler.renderPreview(module, hass, { type: 'custom:ultra-card', layout: { rows: [] } }, 'dashboard')}`,
      host
    );
    expect(host.querySelector('.uc-module-skeleton')).toBeTruthy();

    // Let the chunk import resolve, then the coalesced preview-update timer fire.
    await registry.ensureModuleLoaded(childType);
    await vi.advanceTimersByTimeAsync(300);

    expect(registry.isModuleLoaded(childType)).toBe(true);
    expect(repaint).toHaveBeenCalled();

    window.removeEventListener(PREVIEW_UPDATE_EVENT, repaint);
    host.remove();
  });
});
