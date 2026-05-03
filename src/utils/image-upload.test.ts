// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getImageUrl } from './image-upload';
import {
  __resetMediaResolverForTests,
  resolveMediaSource,
} from './media-resolver';

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

describe('getImageUrl', () => {
  const hass = makeHass(async () => ({ url: '/x.png' }));

  it('returns empty string for empty input', () => {
    expect(getImageUrl(hass, '')).toBe('');
  });

  it('returns absolute http(s) URLs unchanged', () => {
    expect(getImageUrl(hass, 'https://example.com/foo.png')).toBe(
      'https://example.com/foo.png'
    );
    expect(getImageUrl(hass, 'http://example.com/foo.png')).toBe(
      'http://example.com/foo.png'
    );
  });

  it('expands /api/image/serve/<id> paths to /original on hassUrl', () => {
    expect(getImageUrl(hass, '/api/image/serve/abc123')).toBe(
      'https://hass.example.com/api/image/serve/abc123/original'
    );
  });

  it('rewrites /local/, media/local/, /media/local/ to /local/<rel> on hassUrl', () => {
    expect(getImageUrl(hass, '/local/foo.png')).toBe(
      'https://hass.example.com/local/foo.png'
    );
    expect(getImageUrl(hass, 'media/local/foo.png')).toBe(
      'https://hass.example.com/local/foo.png'
    );
    expect(getImageUrl(hass, '/media/local/foo.png')).toBe(
      'https://hass.example.com/local/foo.png'
    );
  });

  it('routes media-source:// URIs through the resolver and returns the resolved URL once cached', async () => {
    const callWS = vi.fn().mockResolvedValue({
      url: '/media/local/photo.png?authSig=token',
    });
    const liveHass = makeHass(callWS);
    const uri = 'media-source://media_source/local/photo.png';

    expect(getImageUrl(liveHass, uri)).toBe('');

    await resolveMediaSource(liveHass, uri);

    expect(getImageUrl(liveHass, uri)).toBe(
      'https://hass.example.com/media/local/photo.png?authSig=token'
    );
    expect(callWS).toHaveBeenCalledTimes(1);
  });

  it('falls back to /local/ rewrite when media-source resolution fails', async () => {
    const callWS = vi.fn().mockRejectedValue(new Error('not registered'));
    const liveHass = makeHass(callWS);
    const uri = 'media-source://media_source/local/photo.png';

    await resolveMediaSource(liveHass, uri);

    expect(getImageUrl(liveHass, uri)).toBe('https://hass.example.com/local/photo.png');
  });
});
