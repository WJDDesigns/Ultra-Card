/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { html, render } from 'lit';
import { getModuleRegistry } from '../module-registry';
import { mockHass } from '../../editor/tabs/__tests__/layout-tab-harness';
import { clearFeedCache } from '../../services/uc-rss-feed-service';
import type { RssFeedModule, UltraCardConfig } from '../../types';

const TYPE = 'rss_feed';
const CONFIG: UltraCardConfig = { type: 'custom:ultra-card', layout: { rows: [] } };
const FEED = `<?xml version="1.0"?><rss version="2.0"><channel><title>Test feed</title>
<item><title>First story</title><link>https://example.com/1</link><description>Hello</description><pubDate>Tue, 27 Oct 2026 10:00:00 GMT</pubDate></item>
</channel></rss>`;

function renderToHost(template: unknown): HTMLElement {
  const host = document.createElement('div');
  document.body.appendChild(host);
  render(html`${template}`, host);
  return host;
}

describe('RSS Feed module', () => {
  beforeAll(async () => {
    await getModuleRegistry().ensureModuleLoaded(TYPE);
  });
  afterEach(() => clearFeedCache());

  it('is free and valid with its own defaults', () => {
    const handler = getModuleRegistry().getModule(TYPE)!;
    expect(handler.metadata.tags).not.toContain('pro');
    const module = handler.createDefault('rss-1');
    expect(handler.validate(module)).toEqual({ valid: true, errors: [] });
  });

  it('shows the empty state with no feeds', () => {
    const handler = getModuleRegistry().getModule(TYPE)!;
    const host = renderToHost(handler.renderPreview(handler.createDefault('rss-2'), mockHass, CONFIG, 'dashboard'));
    expect(host.textContent).toContain('Add a feed');
    host.remove();
  });

  it('loads a feed through Ultra Card Connect and lists its items', async () => {
    const handler = getModuleRegistry().getModule(TYPE)!;
    const callApi = vi.fn().mockResolvedValue({ ok: true, status: 200, body: FEED });
    const hass = { ...mockHass, callApi } as unknown as typeof mockHass;
    const module = { ...handler.createDefault('rss-3'), feeds: ['https://example.com/feed.xml'] } as RssFeedModule;
    let host = renderToHost(handler.renderPreview(module, hass, CONFIG, 'dashboard'));
    expect(host.textContent).toContain('Loading feed');
    host.remove();
    await vi.waitFor(() => expect(callApi).toHaveBeenCalled());
    await new Promise(r => setTimeout(r, 0));
    expect(callApi.mock.calls[0]![1]).toBe(
      'ultra_card_pro_cloud/feed?url=https%3A%2F%2Fexample.com%2Ffeed.xml'
    );
    host = renderToHost(handler.renderPreview(module, hass, CONFIG, 'dashboard'));
    expect(host.textContent).toContain('Test feed');
    const link = host.querySelector('a.uc-rss-item') as HTMLAnchorElement;
    expect(link.href).toBe('https://example.com/1');
    expect(link.textContent).toContain('First story');
    host.remove();
  });
});
