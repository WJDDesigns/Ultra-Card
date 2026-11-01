/** @vitest-environment jsdom */
import { afterEach, describe, it, expect, vi } from 'vitest';
import {
  clearFeedCache,
  getFeedState,
  htmlToText,
  mergeFeedItems,
  parseFeed,
  findFeedLinks,
  looksLikeHtml,
  relativeTime,
  safeUrl,
} from './uc-rss-feed-service';
import type { HomeAssistant } from '../ha/types';

const RSS = `<?xml version="1.0"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Home News</title>
    <item>
      <title>Solar &amp; batteries</title>
      <link>https://example.com/solar</link>
      <guid>solar-1</guid>
      <description><![CDATA[<p>Panels <b>everywhere</b></p>]]></description>
      <pubDate>Tue, 27 Oct 2026 10:00:00 GMT</pubDate>
      <media:thumbnail url="https://example.com/solar.jpg"/>
    </item>
    <item>
      <title>Heat pumps</title>
      <link>/heat</link>
      <content:encoded><![CDATA[<img src="https://example.com/heat.png"><p>Warm</p>]]></content:encoded>
      <pubDate>Mon, 26 Oct 2026 10:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Bad link</title>
      <link>javascript:alert(1)</link>
    </item>
  </channel>
</rss>`;

const ATOM = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Release notes</title>
  <entry>
    <title>Version 2</title>
    <id>tag:example.com,2026:2</id>
    <link rel="alternate" href="https://example.com/v2"/>
    <updated>2026-10-28T08:00:00Z</updated>
    <summary>Second release</summary>
  </entry>
</feed>`;

const JSON_FEED = JSON.stringify({
  version: 'https://jsonfeed.org/version/1.1',
  title: 'JSON news',
  items: [
    { id: 'a', title: 'From JSON', url: 'https://example.com/json', date_published: '2026-10-25T00:00:00Z', image: 'https://example.com/j.jpg' },
  ],
});

describe('uc-rss-feed-service', () => {
  it('parses RSS 2.0 with media images, content:encoded images and relative links', () => {
    const feed = parseFeed(RSS, 'https://example.com/feed.xml')!;
    expect(feed.title).toBe('Home News');
    expect(feed.items).toHaveLength(3);
    const [solar, heat, bad] = feed.items;
    expect(solar!.title).toBe('Solar & batteries');
    expect(solar!.summary).toBe('Panels everywhere');
    expect(solar!.image).toBe('https://example.com/solar.jpg');
    expect(solar!.published).toBe(Date.parse('2026-10-27T10:00:00Z'));
    expect(heat!.link).toBe('https://example.com/heat');
    expect(heat!.image).toBe('https://example.com/heat.png');
    expect(bad!.link).toBe('');
  });

  it('parses Atom and JSON Feed', () => {
    const atom = parseFeed(ATOM, 'https://example.com/atom')!;
    expect(atom.title).toBe('Release notes');
    expect(atom.items[0]!.link).toBe('https://example.com/v2');
    expect(atom.items[0]!.summary).toBe('Second release');
    const json = parseFeed(JSON_FEED, 'https://example.com/feed.json')!;
    expect(json.items[0]!.title).toBe('From JSON');
    expect(json.items[0]!.image).toBe('https://example.com/j.jpg');
  });

  it('returns null for things that are not feeds', () => {
    expect(parseFeed('<html><body>hi</body></html>', 'https://example.com')).toBeNull();
    expect(parseFeed('not xml at all <', 'https://example.com')).toBeNull();
    expect(parseFeed('', 'https://example.com')).toBeNull();
  });

  it('reads feeds with HTML entities or stray ampersands', () => {
    const rss = `<?xml version="1.0"?><rss version="2.0"><channel><title>hr&nbsp;News</title>
      <item><title>K&ouml;ln &amp; Frankfurt & mehr</title><link>https://x.de/a?b=1&c=2</link></item></channel></rss>`;
    const feed = parseFeed(rss, 'https://x.de/index.rss');
    expect(feed?.title).toBe('hr News');
    expect(feed?.items[0]?.title).toBe('Köln & Frankfurt & mehr');
    expect(feed?.items[0]?.link).toBe('https://x.de/a?b=1&c=2');
  });

  it('keeps the complete items of a feed that was cut off', () => {
    const cut = `<?xml version="1.0" encoding="utf-8"?>
<rss xmlns:content="https://purl.org/rss/1.0/modules/content/" version="2.0"><channel><title>Südhessen</title>
<item><title>Eins</title><link><![CDATA[https://x.de/1.html]]></link><content:encoded><![CDATA[<img src="https://x.de/1.jpg">Text]]></content:encoded></item>
<item><title>Zwei</title><link><![CDATA[https://x.de/2.html]]></link></item>
<item><title>Drei</title><content:encoded><![CDATA[<img src="https://x.de/3.jpg"> Abgeschnit`;
    const feed = parseFeed(cut, 'https://x.de/index.rss');
    expect(feed?.title).toBe('Südhessen');
    expect(feed?.items.map(i => i.title)).toEqual(['Eins', 'Zwei']);
    expect(feed?.items[0]?.image).toBe('https://x.de/1.jpg');
    const atom = parseFeed(
      '<feed xmlns="http://www.w3.org/2005/Atom"><title>A</title><entry><title>One</title></entry><entry><title>Tw',
      'https://x.de/atom'
    );
    expect(atom?.items.map(i => i.title)).toEqual(['One']);
  });

  it('finds the feed links a web page advertises', () => {
    const page = `<!DOCTYPE html><html><head>
      <link rel="alternate" type="application/rss+xml" title="RSS" href="/suedhessen/index.rss">
      <link rel="alternate" hreflang="en" href="https://x.de/en">
      <link rel="stylesheet" href="/a.css"></head><body></body></html>`;
    expect(looksLikeHtml(page)).toBe(true);
    expect(looksLikeHtml(RSS)).toBe(false);
    expect(findFeedLinks(page, 'https://www.x.de/suedhessen/index.html')).toEqual([
      'https://www.x.de/suedhessen/index.rss',
    ]);
  });

  it('merges feeds newest first with filters and de-duplication', () => {
    const rss = parseFeed(RSS, 'https://example.com/feed.xml')!;
    const atom = parseFeed(ATOM, 'https://example.com/atom')!;
    const now = Date.parse('2026-10-28T12:00:00Z');
    const all = mergeFeedItems([{ feed: rss }, { feed: atom }, { feed: rss }], { maxItems: 10 }, now);
    expect(all.map(i => i.title)).toEqual(['Version 2', 'Solar & batteries', 'Heat pumps', 'Bad link']);
    const filtered = mergeFeedItems(
      [{ feed: rss }, { feed: atom }],
      { maxItems: 10, include: ['solar', 'heat'], exclude: ['pumps'] },
      now
    );
    expect(filtered.map(i => i.title)).toEqual(['Solar & batteries']);
    const recent = mergeFeedItems([{ feed: rss }, { feed: atom }], { maxItems: 2, maxAgeDays: 1 }, now);
    expect(recent.map(i => i.title)).toEqual(['Version 2', 'Bad link']);
  });

  it('keeps only http(s) urls and strips html', () => {
    expect(safeUrl('javascript:alert(1)')).toBe('');
    expect(safeUrl('/a', 'https://x.org/feed')).toBe('https://x.org/a');
    expect(htmlToText('<p>a <script>x</script>b</p>')).toBe('a xb');
    expect(relativeTime(Date.parse('2026-10-28T11:00:00Z'), 'en', Date.parse('2026-10-28T12:00:00Z'))).toBe(
      '1 hour ago'
    );
  });

  describe('loading', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
      clearFeedCache();
    });

    const hassWith = (callApi: (...args: unknown[]) => unknown) =>
      ({ callApi: vi.fn(callApi) }) as unknown as HomeAssistant;

    const settle = async (hass: HomeAssistant, url: string) => {
      getFeedState(hass, url, 600_000);
      for (let i = 0; i < 20; i++) await Promise.resolve();
      await new Promise(r => setTimeout(r, 0));
      return getFeedState(hass, url, 600_000);
    };

    it('falls back to the browser when the site turns Home Assistant away', async () => {
      const fetchMock = vi.fn(async () => new Response(ATOM, { status: 200 }));
      vi.stubGlobal('fetch', fetchMock);
      const hass = hassWith(async () => ({ ok: false, status: 403, body: '' }));
      const state = await settle(hass, 'https://news.example.de/atom.xml');
      expect(fetchMock).toHaveBeenCalledOnce();
      expect(state.error).toBeUndefined();
      expect(state.feed?.items[0]?.title).toBe('Version 2');
    });

    it('reports the site error when neither Connect nor the browser can read it', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))));
      const hass = hassWith(async () => ({ ok: false, status: 403, body: '' }));
      const state = await settle(hass, 'https://news.example.de/rss');
      expect(state.error).toBe('http');
      expect(state.errorDetail).toBe('403');
    });

    it('follows the feed link when given a web page', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))));
      const page =
        '<!doctype html><html><head><link rel="alternate" type="application/atom+xml" href="/atom.xml"></head></html>';
      const hass = hassWith(async (_m: unknown, path: unknown) =>
        String(path).includes(encodeURIComponent('/atom.xml'))
          ? { ok: true, status: 200, body: ATOM }
          : { ok: true, status: 200, body: page }
      );
      const state = await settle(hass, 'https://news.example.de/region/index.html');
      expect(state.error).toBeUndefined();
      expect(state.feed?.items[0]?.title).toBe('Version 2');
    });

    it('does not retry in the browser when Connect refuses the address', async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);
      const hass = hassWith(async () => Promise.reject({ status_code: 403, error: 'private_address' }));
      const state = await settle(hass, 'https://router.example/feed');
      expect(fetchMock).not.toHaveBeenCalled();
      expect(state.error).toBe('blocked');
    });
  });
});
