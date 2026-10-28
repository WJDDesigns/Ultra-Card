/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { htmlToText, mergeFeedItems, parseFeed, relativeTime, safeUrl } from './uc-rss-feed-service';

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
});
