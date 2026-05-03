// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  __resetMediaResolverForTests,
  getResolvedMediaUrlSync,
  isMediaSourceUri,
  resolveMediaSource,
} from './media-resolver';

const URI = 'media-source://media_source/local/bilder/hintergrundbilder/Uebersicht_1.png';

function makeHass(callWS: (msg: any) => Promise<any>) {
  return {
    callWS,
    hassUrl: () => 'https://hass.example.com',
  } as any;
}

beforeEach(() => {
  __resetMediaResolverForTests();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('isMediaSourceUri', () => {
  it('detects media-source URIs', () => {
    expect(isMediaSourceUri(URI)).toBe(true);
    expect(isMediaSourceUri('media-source://media_source/foo')).toBe(true);
  });

  it('rejects non-strings and non-media-source values', () => {
    expect(isMediaSourceUri('')).toBe(false);
    expect(isMediaSourceUri('https://example.com/a.png')).toBe(false);
    expect(isMediaSourceUri('/local/a.png')).toBe(false);
    expect(isMediaSourceUri(undefined as any)).toBe(false);
    expect(isMediaSourceUri(42 as any)).toBe(false);
  });
});

describe('resolveMediaSource', () => {
  it('calls hass.callWS with the resolve_media payload and absolutizes the result', async () => {
    const callWS = vi.fn().mockResolvedValue({
      url: '/media/local/bilder/hintergrundbilder/Uebersicht_1.png?authSig=abc',
      mime_type: 'image/png',
    });
    const hass = makeHass(callWS);

    const url = await resolveMediaSource(hass, URI);

    expect(callWS).toHaveBeenCalledWith({
      type: 'media_source/resolve_media',
      media_content_id: URI,
    });
    expect(url).toBe(
      'https://hass.example.com/media/local/bilder/hintergrundbilder/Uebersicht_1.png?authSig=abc'
    );
  });

  it('returns absolute URLs from hass unchanged', async () => {
    const callWS = vi
      .fn()
      .mockResolvedValue({ url: 'https://signed.example.com/x.png?sig=1' });
    const hass = makeHass(callWS);

    const url = await resolveMediaSource(hass, URI);
    expect(url).toBe('https://signed.example.com/x.png?sig=1');
  });

  it('caches successful resolutions', async () => {
    const callWS = vi.fn().mockResolvedValue({ url: '/media/x.png' });
    const hass = makeHass(callWS);

    await resolveMediaSource(hass, URI);
    await resolveMediaSource(hass, URI);

    expect(callWS).toHaveBeenCalledTimes(1);
  });

  it('coalesces concurrent in-flight requests for the same URI', async () => {
    let resolveFn: (value: any) => void = () => undefined;
    const callWS = vi.fn().mockImplementation(
      () =>
        new Promise(resolve => {
          resolveFn = resolve;
        })
    );
    const hass = makeHass(callWS);

    const p1 = resolveMediaSource(hass, URI);
    const p2 = resolveMediaSource(hass, URI);

    resolveFn({ url: '/media/x.png' });

    await Promise.all([p1, p2]);
    expect(callWS).toHaveBeenCalledTimes(1);
  });

  it('falls back to /local/ rewrite when the WS call rejects', async () => {
    const callWS = vi.fn().mockRejectedValue(new Error('not registered'));
    const hass = makeHass(callWS);

    const url = await resolveMediaSource(hass, URI);
    expect(url).toBe(
      'https://hass.example.com/local/bilder/hintergrundbilder/Uebersicht_1.png'
    );
  });

  it('returns empty string when fallback also has nothing useful', async () => {
    const callWS = vi.fn().mockRejectedValue(new Error('boom'));
    const hass = makeHass(callWS);

    const url = await resolveMediaSource(hass, 'media-source://media_source/other/x.png');
    expect(url).toBe('');
  });

  it('returns the input unchanged for non-media-source values', async () => {
    const callWS = vi.fn();
    const hass = makeHass(callWS);

    const url = await resolveMediaSource(hass, '/local/a.png');
    expect(url).toBe('/local/a.png');
    expect(callWS).not.toHaveBeenCalled();
  });
});

describe('getResolvedMediaUrlSync', () => {
  it('returns the URI unchanged for non-media-source values', () => {
    expect(getResolvedMediaUrlSync(undefined, 'https://x/a.png')).toBe('https://x/a.png');
  });

  it('returns empty string on first call and dispatches update event when resolved', async () => {
    const callWS = vi.fn().mockResolvedValue({ url: '/media/x.png' });
    const hass = makeHass(callWS);

    const events: Event[] = [];
    const handler = (e: Event) => events.push(e);
    window.addEventListener('ultra-card-template-update', handler);

    const first = getResolvedMediaUrlSync(hass, URI);
    expect(first).toBe('');

    await new Promise(resolve => setTimeout(resolve, 0));

    const second = getResolvedMediaUrlSync(hass, URI);
    expect(second).toBe('https://hass.example.com/media/x.png');
    expect(events.length).toBeGreaterThanOrEqual(1);

    window.removeEventListener('ultra-card-template-update', handler);
  });
});
