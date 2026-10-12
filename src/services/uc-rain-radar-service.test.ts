import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CUSTOM_SOURCE_MAX_NATIVE_ZOOM,
  FRAMES_TTL_MS,
  RAINVIEWER_MAPS_URL,
  RAINVIEWER_MAX_NATIVE_ZOOM,
  clampNumber,
  clearRadarCache,
  filterByTimeSpan,
  homeLatLng,
  latestObservedIndex,
  loadRadarFrames,
  maxNativeZoomFor,
  minutesFromNow,
  parseWeatherMaps,
  radarTileUrl,
  resolveCenter,
  resolveMapStyle,
  sourceUrlFor,
} from './uc-rain-radar-service';

const PAYLOAD = {
  version: '2.0',
  generated: 1760220000,
  host: 'https://tilecache.rainviewer.com/',
  radar: {
    past: [
      { time: 1760219400, path: '/v2/radar/abc2' },
      { time: 1760218800, path: '/v2/radar/abc1' },
    ],
    nowcast: [
      { time: 1760220000, path: '/v2/radar/fc1' },
      { time: 1760219400, path: '/v2/radar/dup' },
    ],
  },
};

const hass = (extra: Record<string, unknown> = {}) =>
  ({
    states: {
      'person.wayne': {
        entity_id: 'person.wayne',
        state: 'home',
        attributes: { latitude: 51.5, longitude: -0.12 },
      },
      'person.nowhere': { entity_id: 'person.nowhere', state: 'unknown', attributes: {} },
    },
    ...extra,
  }) as any;

describe('rain radar service', () => {
  afterEach(() => clearRadarCache());

  it('parses past and forecast frames in time order without duplicates', () => {
    const set = parseWeatherMaps(PAYLOAD, true, 1)!;
    expect(set.host).toBe('https://tilecache.rainviewer.com');
    expect(set.frames.map(f => f.path)).toEqual([
      '/v2/radar/abc1',
      '/v2/radar/abc2',
      '/v2/radar/fc1',
    ]);
    expect(set.frames.map(f => f.forecast)).toEqual([false, false, true]);
    expect(latestObservedIndex(set.frames)).toBe(1);
  });

  it('leaves forecast frames out when asked and rejects junk', () => {
    expect(parseWeatherMaps(PAYLOAD, false, 1)!.frames).toHaveLength(2);
    expect(parseWeatherMaps(null, true, 1)).toBeNull();
    expect(parseWeatherMaps({ host: 'x', radar: { past: [] } }, true, 1)).toBeNull();
    expect(parseWeatherMaps({ radar: PAYLOAD.radar }, true, 1)).toBeNull();
  });

  it('builds RainViewer tile URLs with the free color scheme', () => {
    expect(
      radarTileUrl(
        'https://tilecache.rainviewer.com',
        { path: '/v2/radar/abc' },
        { smooth: true, snow: false }
      )
    ).toBe('https://tilecache.rainviewer.com/v2/radar/abc/256/{z}/{x}/{y}/2/1_0.png');
    expect(radarTileUrl('https://h', { path: 'p' }, { smooth: false, snow: true })).toBe(
      'https://h/p/256/{z}/{x}/{y}/2/0_1.png'
    );
  });

  it('resolves the map center from home, entity or coordinates', () => {
    const withHome = hass({ config: { latitude: 40, longitude: -75 } });
    expect(homeLatLng(withHome)).toEqual({ lat: 40, lng: -75 });
    expect(resolveCenter({ center_mode: 'home' }, withHome)).toEqual({ lat: 40, lng: -75 });
    expect(
      resolveCenter({ center_mode: 'entity', center_entity: 'person.wayne' }, withHome)
    ).toEqual({
      lat: 51.5,
      lng: -0.12,
    });
    // An entity without a location falls back to home.
    expect(
      resolveCenter({ center_mode: 'entity', center_entity: 'person.nowhere' }, withHome)
    ).toEqual({
      lat: 40,
      lng: -75,
    });
    expect(resolveCenter({ center_mode: 'manual', latitude: 10, longitude: 20 }, withHome)).toEqual(
      {
        lat: 10,
        lng: 20,
      }
    );
    expect(
      resolveCenter({ center_mode: 'manual', latitude: 100, longitude: 20 }, hass())
    ).toBeNull();
    expect(resolveCenter({}, undefined)).toBeNull();
  });

  it('falls back to zone.home when hass.config has no location', () => {
    const h = hass();
    h.states['zone.home'] = {
      entity_id: 'zone.home',
      state: '0',
      attributes: { latitude: 1, longitude: 2 },
    };
    expect(homeLatLng(h)).toEqual({ lat: 1, lng: 2 });
  });

  it('picks base maps and helper values', () => {
    expect(resolveMapStyle('auto', true)).toBe('dark');
    expect(resolveMapStyle(undefined, false)).toBe('light');
    expect(resolveMapStyle('satellite', true)).toBe('satellite');
    expect(clampNumber('9', 3, 12, 7)).toBe(9);
    expect(clampNumber(50, 3, 12, 7)).toBe(12);
    expect(clampNumber('x', 3, 12, 7)).toBe(7);
    expect(minutesFromNow(1000, 1000 * 1000 - 20 * 60000)).toBe(20);
  });

  it('only accepts http(s) custom sources and adjusts native zoom', () => {
    expect(sourceUrlFor({})).toBe(RAINVIEWER_MAPS_URL);
    expect(sourceUrlFor({ source_url: 'javascript:alert(1)' })).toBe(RAINVIEWER_MAPS_URL);
    expect(sourceUrlFor({ source_url: ' https://radar.local/maps.json ' })).toBe(
      'https://radar.local/maps.json'
    );
    expect(maxNativeZoomFor({})).toBe(RAINVIEWER_MAX_NATIVE_ZOOM);
    expect(maxNativeZoomFor({ source_url: 'https://radar.local/maps.json' })).toBe(
      CUSTOM_SOURCE_MAX_NATIVE_ZOOM
    );
  });

  it('shares one request between callers and reuses it until the TTL passes', async () => {
    const fetcher = vi.fn(async () => ({ ok: true, json: async () => PAYLOAD }));
    const [a, b] = await Promise.all([
      loadRadarFrames('https://x/maps.json', true, 1000, fetcher),
      loadRadarFrames('https://x/maps.json', false, 1000, fetcher),
    ]);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(a.frames).toHaveLength(3);
    expect(b.frames).toHaveLength(2);
    await loadRadarFrames('https://x/maps.json', true, 1000 + FRAMES_TTL_MS - 1, fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);
    await loadRadarFrames('https://x/maps.json', true, 1000 + FRAMES_TTL_MS + 1, fetcher);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('throws when the source fails, and retries next time', async () => {
    const bad = vi.fn(async () => ({ ok: false, json: async () => ({}) }));
    await expect(loadRadarFrames('https://y/maps.json', true, 1, bad)).rejects.toThrow();
    const good = vi.fn(async () => ({ ok: true, json: async () => PAYLOAD }));
    await expect(loadRadarFrames('https://y/maps.json', true, 2, good)).resolves.toBeTruthy();
  });
});

describe('filterByTimeSpan', () => {
  const frames = [0, 1, 2, 3, 4, 5, 6].map(i => ({
    time: 10000 + i * 600,
    path: `/p${i}`,
    forecast: i >= 5,
  }));

  it('keeps past frames within the span of the newest observed frame plus all forecast', () => {
    // Newest observed frame is index 4 (time 12400); 30 min back = 10600.
    expect(filterByTimeSpan(frames, 30).map(f => f.path)).toEqual([
      '/p1',
      '/p2',
      '/p3',
      '/p4',
      '/p5',
      '/p6',
    ]);
    expect(filterByTimeSpan(frames, 10).map(f => f.path)).toEqual(['/p3', '/p4', '/p5', '/p6']);
  });

  it('defaults to two hours and ignores junk', () => {
    expect(filterByTimeSpan(frames, undefined)).toHaveLength(7);
    expect(filterByTimeSpan(frames, 'abc')).toHaveLength(7);
    expect(filterByTimeSpan([], 30)).toEqual([]);
  });
});
