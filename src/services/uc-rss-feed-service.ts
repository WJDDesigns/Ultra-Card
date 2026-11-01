/**
 * RSS / Atom / JSON Feed loading for the RSS Feed module.
 *
 * Most feeds can't be fetched straight from a dashboard because the site
 * doesn't allow cross-site requests (CORS). Ultra Card Connect (installed by
 * everyone for the Hub) has a small feed endpoint that fetches the feed from
 * Home Assistant instead; when that isn't there (older Connect) we try the
 * browser directly, which works for feeds that do allow it.
 */
import type { HomeAssistant } from '../ha/types';

export interface FeedItem {
  /** Stable id (guid / id / link) used to de-duplicate merged feeds. */
  id: string;
  title: string;
  link: string;
  /** Plain-text summary (HTML stripped). */
  summary: string;
  image: string;
  /** Epoch ms, or 0 when the feed gave no usable date. */
  published: number;
  /** Feed title (or the label the user gave the feed). */
  source: string;
}

export interface ParsedFeed {
  title: string;
  items: FeedItem[];
}

export type FeedLoadError = 'cors' | 'http' | 'parse' | 'blocked' | 'network';

interface CacheEntry {
  feed?: ParsedFeed | undefined;
  error?: FeedLoadError | undefined;
  errorDetail?: string | undefined;
  fetchedAt: number;
  pending?: Promise<void> | undefined;
}

const cache = new Map<string, CacheEntry>();

/** Tell mounted cards to re-render (same event the template service uses). */
function notifyFeedReady(): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(
      new CustomEvent('ultra-card-template-update', { detail: { source: 'rss-feed' } })
    );
  } catch {
    // ignore
  }
}

const text = (el: Element | null | undefined): string => (el?.textContent || '').trim();

/** First direct child (any namespace) whose local name matches. */
function child(el: Element, ...names: string[]): Element | null {
  for (const n of names) {
    for (const c of Array.from(el.children)) {
      if (c.localName === n || c.nodeName === n) return c;
    }
  }
  return null;
}

function children(el: Element, name: string): Element[] {
  return Array.from(el.children).filter(c => c.localName === name || c.nodeName === name);
}

/** Strip HTML to plain text without running anything in it. */
export function htmlToText(html: string): string {
  if (!html) return '';
  if (!/[<&]/.test(html)) return html.replace(/\s+/g, ' ').trim();
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body?.textContent || '').replace(/\s+/g, ' ').trim();
  } catch {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}

/** First image src in an HTML fragment. */
export function firstImageInHtml(html: string): string {
  if (!html || !/<img/i.test(html)) return '';
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.querySelector('img')?.getAttribute('src') || '';
  } catch {
    return '';
  }
}

function parseDate(value: string): number {
  if (!value) return 0;
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : 0;
}

/** Only http(s) links and images make it into the card. */
export function safeUrl(value: string, base?: string): string {
  const v = (value || '').trim();
  if (!v) return '';
  try {
    const u = base ? new URL(v, base) : new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : '';
  } catch {
    return '';
  }
}

function mediaImage(item: Element): string {
  for (const name of ['thumbnail', 'content']) {
    for (const c of Array.from(item.getElementsByTagName('*'))) {
      if (c.localName !== name) continue;
      if (!(c.namespaceURI || '').includes('search.yahoo.com/mrss') && !c.nodeName.startsWith('media:'))
        continue;
      const url = c.getAttribute('url') || '';
      const medium = c.getAttribute('medium') || '';
      const type = c.getAttribute('type') || '';
      if (url && (name === 'thumbnail' || medium === 'image' || type.startsWith('image/') || /\.(jpe?g|png|gif|webp|avif)(\?|$)/i.test(url)))
        return url;
    }
  }
  for (const enc of children(item, 'enclosure')) {
    const type = enc.getAttribute('type') || '';
    const url = enc.getAttribute('url') || '';
    if (url && (type.startsWith('image/') || /\.(jpe?g|png|gif|webp|avif)(\?|$)/i.test(url))) return url;
  }
  const itunes = Array.from(item.children).find(c => c.localName === 'image' && c.getAttribute('href'));
  if (itunes) return itunes.getAttribute('href') || '';
  return '';
}

function parseJsonFeed(raw: string, feedUrl: string): ParsedFeed | null {
  type JsonFeedItem = Record<string, unknown>;
  let data: { title?: unknown; items?: unknown } | null;
  try {
    data = JSON.parse(raw) as { title?: unknown; items?: unknown } | null;
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object' || !Array.isArray(data.items)) return null;
  const title = String(data.title || '');
  const items: FeedItem[] = (data.items as JsonFeedItem[]).map((it, i) => {
    const html = String(it.content_html || '');
    const link = safeUrl(String(it.url || it.external_url || ''), feedUrl);
    return {
      id: String(it.id ?? link ?? i),
      title: htmlToText(String(it.title || '')),
      link,
      summary: htmlToText(String(it.summary || it.content_text || html)),
      image: safeUrl(String(it.image || it.banner_image || firstImageInHtml(html)), feedUrl),
      published: parseDate(String(it.date_published || it.date_modified || '')),
      source: title,
    };
  });
  return { title, items };
}

const XML_ENTITIES = new Set(['amp', 'lt', 'gt', 'quot', 'apos']);

/** Turn HTML-only named entities into characters and escape stray "&". */
export function fixXmlEntities(xml: string): string {
  return xml.replace(/&(#\d+;|#x[0-9a-f]+;|([a-z][a-z0-9]*);)?/gi, (m, ent: string, name: string) => {
    if (!ent) return '&amp;';
    if (!name || XML_ENTITIES.has(name)) return m;
    try {
      const decoded = new DOMParser().parseFromString(`<p>${m}</p>`, 'text/html').body?.textContent || '';
      if (decoded && decoded !== m) {
        return decoded.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      }
    } catch {
      // fall through
    }
    return '&amp;' + ent;
  });
}

/** True when the text is a web page rather than a feed. */
export function looksLikeHtml(raw: string): boolean {
  return /^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!doctype\s+html|<html[\s>])/i.test(raw);
}

const FEED_LINK_TYPES = /^(application\/(rss|atom|feed|rdf)\+(xml|json)|application\/json|text\/xml|application\/xml)$/i;

/**
 * Feed links a web page advertises (<link rel="alternate" type="application/rss+xml">),
 * so pasting a news page instead of its feed still works.
 */
export function findFeedLinks(html: string, pageUrl: string): string[] {
  if (!html || !/<link/i.test(html)) return [];
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const out: string[] = [];
    for (const link of Array.from(doc.querySelectorAll('link[href]'))) {
      const rel = (link.getAttribute('rel') || '').toLowerCase().split(/\s+/);
      const type = (link.getAttribute('type') || '').trim();
      if (!rel.includes('alternate') || !FEED_LINK_TYPES.test(type)) continue;
      const href = safeUrl(link.getAttribute('href') || '', pageUrl);
      if (href && href !== pageUrl && !out.includes(href)) out.push(href);
    }
    return out;
  } catch {
    return [];
  }
}

/** Parse RSS 2.0, RSS 1.0 (RDF), Atom or JSON Feed text. Null when it isn't a feed. */
export function parseFeed(raw: string, feedUrl: string): ParsedFeed | null {
  const trimmed = (raw || '').trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('{')) return parseJsonFeed(trimmed, feedUrl);

  const parseXml = (src: string): Document | null => {
    try {
      const d = new DOMParser().parseFromString(src, 'application/xml');
      return d.getElementsByTagName('parsererror').length > 0 ? null : d;
    } catch {
      return null;
    }
  };
  // Many feeds use HTML entities (&nbsp;, &auml;) or a bare "&" that strict XML
  // rejects; browsers' feed readers shrug these off, so retry with them fixed.
  const doc = parseXml(trimmed) || (looksLikeHtml(trimmed) ? null : parseXml(fixXmlEntities(trimmed)));
  if (!doc) return null;
  const root = doc.documentElement;
  if (!root) return null;

  // Atom
  if (root.localName === 'feed') {
    const title = htmlToText(text(child(root, 'title')));
    const items = children(root, 'entry').map((entry, i) => {
      const links = children(entry, 'link');
      const alt =
        links.find(l => (l.getAttribute('rel') || 'alternate') === 'alternate') || links[0];
      const link = safeUrl(alt?.getAttribute('href') || '', feedUrl);
      const content = text(child(entry, 'content'));
      const summary = text(child(entry, 'summary')) || content;
      return {
        id: text(child(entry, 'id')) || link || String(i),
        title: htmlToText(text(child(entry, 'title'))),
        link,
        summary: htmlToText(summary),
        image: safeUrl(mediaImage(entry) || firstImageInHtml(content || summary), feedUrl),
        published: parseDate(text(child(entry, 'published')) || text(child(entry, 'updated'))),
        source: title,
      };
    });
    return { title, items };
  }

  // RSS 2.0 (rss > channel > item) and RSS 1.0 (rdf:RDF > item)
  const channel = root.localName === 'rss' ? child(root, 'channel') : child(root, 'channel');
  const title = htmlToText(text(channel ? child(channel, 'title') : null));
  const itemParent = root.localName === 'rss' ? channel : root;
  if (!itemParent) return null;
  const items = children(itemParent, 'item').map((item, i) => {
    const encoded = text(child(item, 'encoded'));
    const description = text(child(item, 'description'));
    const link = safeUrl(text(child(item, 'link')), feedUrl);
    return {
      id: text(child(item, 'guid')) || link || String(i),
      title: htmlToText(text(child(item, 'title'))),
      link,
      summary: htmlToText(description || encoded),
      image: safeUrl(mediaImage(item) || firstImageInHtml(encoded || description), feedUrl),
      published: parseDate(text(child(item, 'pubDate')) || text(child(item, 'date'))),
      source: title,
    };
  });
  if (root.localName !== 'rss' && root.localName !== 'RDF' && items.length === 0) return null;
  return { title, items };
}

async function fetchViaConnect(
  hass: HomeAssistant,
  url: string
): Promise<{ ok: boolean; status: number; body: string; refused?: boolean } | null> {
  type FeedApiResponse = { ok?: unknown; status?: unknown; body?: unknown } | null;
  const callApi = (hass as { callApi?: unknown } | undefined)?.callApi;
  if (typeof callApi !== 'function') return null;
  try {
    const res = (await callApi.call(
      hass,
      'GET',
      `ultra_card_pro_cloud/feed?url=${encodeURIComponent(url)}`
    )) as FeedApiResponse;
    if (!res || typeof res !== 'object') return null;
    return {
      ok: !!res.ok,
      status: Number(res.status) || 0,
      body: typeof res.body === 'string' ? res.body : '',
    };
  } catch (err) {
    // 404 = Connect too old to have the endpoint; let the caller try direct.
    const e = (err || {}) as { status_code?: unknown; status?: unknown; error?: unknown };
    const status = Number(e.status_code ?? e.status ?? 0);
    if (status === 400 || status === 403) {
      // Connect itself refused the address (bad URL or a private one).
      return { ok: false, status, body: String(e.error || ''), refused: true };
    }
    return null;
  }
}

/** Fetch straight from the browser; only works for feeds that allow CORS. */
async function fetchDirect(url: string): Promise<{ ok: boolean; status: number; body: string } | null> {
  let res: Response;
  try {
    res = await fetch(url, { credentials: 'omit', cache: 'no-cache' });
  } catch {
    return null;
  }
  if (!res.ok) return { ok: false, status: res.status, body: '' };
  return { ok: true, status: res.status, body: await res.text() };
}

/** One fetch-and-parse for a discovered feed link (Connect first, then the browser). */
async function fetchAndParse(hass: HomeAssistant, url: string): Promise<ParsedFeed | null> {
  const viaConnect = await fetchViaConnect(hass, url);
  if (viaConnect?.refused) return null;
  if (viaConnect?.ok) {
    const parsed = parseFeed(viaConnect.body, url);
    if (parsed) return parsed;
  }
  const direct = await fetchDirect(url);
  return direct?.ok ? parseFeed(direct.body, url) : null;
}

async function loadFeed(hass: HomeAssistant, url: string): Promise<void> {
  const entry = cache.get(url) || { fetchedAt: 0 };
  try {
    let raw: string | null = null;
    let parsed: ParsedFeed | null = null;
    const viaConnect = await fetchViaConnect(hass, url);
    if (viaConnect?.refused) {
      entry.error = 'blocked';
      entry.errorDetail = viaConnect.body || String(viaConnect.status);
      return;
    }
    if (viaConnect?.ok) {
      raw = viaConnect.body;
      parsed = parseFeed(raw, url);
    }
    if (!parsed) {
      // Connect missing, or the site turned Home Assistant away (some news
      // sites block servers but let browsers in): try the browser directly.
      const direct = await fetchDirect(url);
      if (direct?.ok) {
        raw = direct.body;
        parsed = parseFeed(raw, url);
      } else if (!raw) {
        if (viaConnect && !viaConnect.ok) {
          entry.error = 'http';
          entry.errorDetail = viaConnect.status ? String(viaConnect.status) : viaConnect.body;
        } else if (direct) {
          entry.error = 'http';
          entry.errorDetail = String(direct.status);
        } else {
          entry.error = 'cors';
        }
        return;
      }
    }
    if (!parsed && raw && looksLikeHtml(raw)) {
      // A web page, not a feed: follow the feed link it advertises, if any.
      for (const feedUrl of findFeedLinks(raw, url).slice(0, 2)) {
        parsed = await fetchAndParse(hass, feedUrl);
        if (parsed) break;
      }
    }
    if (!parsed) {
      entry.error = 'parse';
      return;
    }
    entry.feed = parsed;
    entry.error = undefined;
    entry.errorDetail = undefined;
  } catch {
    entry.error = 'network';
  } finally {
    entry.fetchedAt = Date.now();
    entry.pending = undefined;
    cache.set(url, entry);
    notifyFeedReady();
  }
}

export interface FeedState {
  feed?: ParsedFeed | undefined;
  error?: FeedLoadError | undefined;
  errorDetail?: string | undefined;
  loading: boolean;
}

/**
 * Current state of a feed, starting a (re)load in the background when the
 * cached copy is older than `maxAgeMs`. Cards re-render when it finishes.
 */
export function getFeedState(hass: HomeAssistant, url: string, maxAgeMs: number): FeedState {
  const clean = safeUrl(url);
  if (!clean) return { loading: false, error: 'parse' };
  let entry = cache.get(clean);
  const stale = !entry || Date.now() - entry.fetchedAt > Math.max(60_000, maxAgeMs);
  if (stale && !entry?.pending && hass) {
    entry = entry || { fetchedAt: 0 };
    entry.pending = loadFeed(hass, clean);
    cache.set(clean, entry);
  }
  return {
    feed: entry?.feed,
    error: entry?.error,
    errorDetail: entry?.errorDetail,
    loading: !!entry?.pending && !entry?.feed,
  };
}

/** Forget cached feeds (used by tests and the editor's Refresh button). */
export function clearFeedCache(url?: string): void {
  if (url) cache.delete(safeUrl(url) || url);
  else cache.clear();
}

export interface MergeOptions {
  maxItems: number;
  include?: string[] | undefined;
  exclude?: string[] | undefined;
  maxAgeDays?: number | undefined;
}

/** Merge several feeds newest first, drop duplicates, apply keyword filters. */
export function mergeFeedItems(
  feeds: Array<{ feed: ParsedFeed | undefined; label?: string | undefined }>,
  opts: MergeOptions,
  now: number = Date.now()
): FeedItem[] {
  const seen = new Set<string>();
  const out: FeedItem[] = [];
  const inc = (opts.include || []).map(s => s.toLowerCase().trim()).filter(Boolean);
  const exc = (opts.exclude || []).map(s => s.toLowerCase().trim()).filter(Boolean);
  const minTime = opts.maxAgeDays && opts.maxAgeDays > 0 ? now - opts.maxAgeDays * 86_400_000 : 0;
  for (const { feed, label } of feeds) {
    if (!feed) continue;
    for (const item of feed.items) {
      const key = item.link || item.id;
      if (key && seen.has(key)) continue;
      const hay = `${item.title} ${item.summary}`.toLowerCase();
      if (inc.length && !inc.some(k => hay.includes(k))) continue;
      if (exc.some(k => hay.includes(k))) continue;
      if (minTime && item.published && item.published < minTime) continue;
      if (key) seen.add(key);
      out.push(label ? { ...item, source: label } : item);
    }
  }
  out.sort((a, b) => b.published - a.published);
  return out.slice(0, Math.max(1, opts.maxItems));
}

/** "5 min ago" style label. */
export function relativeTime(ts: number, lang: string, now: number = Date.now()): string {
  if (!ts) return '';
  const diff = Math.round((ts - now) / 1000);
  const abs = Math.abs(diff);
  let rtf: Intl.RelativeTimeFormat;
  try {
    rtf = new Intl.RelativeTimeFormat(lang || 'en', { numeric: 'auto' });
  } catch {
    rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  }
  if (abs < 60) return rtf.format(Math.round(diff), 'second');
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 86400 * 7) return rtf.format(Math.round(diff / 86400), 'day');
  return new Date(ts).toLocaleDateString(lang || undefined, { day: 'numeric', month: 'short' });
}
