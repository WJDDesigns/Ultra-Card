import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CUSTOM_SOURCE_MAX_NATIVE_ZOOM,
  FRAMES_TTL_MS,
  RAINVIEWER_MAPS_URL,
  RAINVIEWER_MAX_NATIVE_ZOOM,
  RAINBOW_ATTRIBUTION,
  RAINBOW_MAX_NATIVE_ZOOM,
  RAINBOW_TTL_MS,
  loadModuleFrames,
  loadRainbowFrames,
  parseRainbowSnapshot,
  radarAttributionFor,
  rainbowFrames,
  rainbowKey,
  clampNumber,
  clearRadarCache,
  filterByTimeSpan,
  clearGoogleSessions,
  frameTileUrl,
  keyedBaseMap,
  loadGoogleBaseMap,
  mapProviderFor,
  homeLatLng,
  loadOpenWeatherFrames,
  openWeatherFrames,
  openWeatherKey,
  radarSourceFor,
  sourceKeyFor,
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

describe('OpenWeather source', () => {
  afterEach(() => clearRadarCache());
  const KEY = 'abcdef0123456789abcdef0123456789';

  it('is used only when chosen and a valid key is set', () => {
    expect(radarSourceFor({})).toBe('rainviewer');
    expect(radarSourceFor({ radar_source: 'openweather' })).toBe('rainviewer');
    expect(
      radarSourceFor({ radar_source: 'openweather', openweather_api_key: ' x"><script ' })
    ).toBe('rainviewer');
    expect(radarSourceFor({ radar_source: 'openweather', openweather_api_key: ` ${KEY} ` })).toBe(
      'openweather'
    );
    expect(openWeatherKey({ openweather_api_key: ` ${KEY} ` })).toBe(KEY);
    expect(sourceKeyFor({ radar_source: 'openweather', openweather_api_key: KEY })).toContain(
      'owm:'
    );
  });

  it('builds hourly frames back over the span plus forecast hours', () => {
    const now = Date.UTC(2026, 9, 12, 12, 40);
    const hour = Date.UTC(2026, 9, 12, 12) / 1000;
    const frames = openWeatherFrames(now, 120, true);
    expect(frames.map(f => f.time - hour)).toEqual([-7200, -3600, 0, 3600, 7200, 10800]);
    expect(frames.map(f => f.forecast)).toEqual([false, false, false, true, true, true]);
    expect(openWeatherFrames(now, 30, false)).toHaveLength(2);
  });

  it('builds tile URLs for Weather Maps 2.0 and the free 1.0 layer', () => {
    expect(
      frameTileUrl(
        { host: KEY, provider: 'openweather2' },
        { path: '1760270400' },
        {
          smooth: true,
          snow: true,
        }
      )
    ).toBe(
      `https://maps.openweathermap.org/maps/2.0/weather/PR0/{z}/{x}/{y}?appid=${KEY}&date=1760270400&opacity=1`
    );
    expect(
      frameTileUrl(
        { host: KEY, provider: 'openweather1' },
        { path: 'now' },
        {
          smooth: true,
          snow: true,
        }
      )
    ).toBe(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${KEY}`);
  });

  it('falls back to the current-only layer, and fails when the key works for neither', async () => {
    const now = Date.UTC(2026, 9, 12, 12, 40);
    const v1Only = vi.fn(async (url: string) => url.includes('tile.openweathermap.org'));
    const set = await loadOpenWeatherFrames(KEY, true, 120, now, v1Only);
    expect(set.provider).toBe('openweather1');
    expect(set.frames).toHaveLength(1);
    expect(v1Only).toHaveBeenCalledTimes(2);
    // Reused without probing again.
    await loadOpenWeatherFrames(KEY, true, 120, now + 1000, v1Only);
    expect(v1Only).toHaveBeenCalledTimes(2);

    clearRadarCache();
    const v2 = await loadOpenWeatherFrames(KEY, true, 60, now, async () => true);
    expect(v2.provider).toBe('openweather2');
    expect(v2.frames.length).toBeGreaterThan(2);

    clearRadarCache();
    await expect(loadOpenWeatherFrames(KEY, true, 60, now, async () => false)).rejects.toThrow();
  });
});

describe('Rainbow.ai source', () => {
  afterEach(() => clearRadarCache());
  const KEY = 'rb_live-0123456789abcdef';
  const SNAP = 1760220000;
  const okFetch = (payload: unknown) =>
    vi.fn(async (_url: string) => ({ ok: true, json: async () => payload }));

  it('is used only when chosen and a valid key is set', () => {
    expect(radarSourceFor({ radar_source: 'rainbow' })).toBe('rainviewer');
    expect(radarSourceFor({ radar_source: 'rainbow', rainbow_api_key: 'bad key"' })).toBe(
      'rainviewer'
    );
    expect(radarSourceFor({ radar_source: 'rainbow', rainbow_api_key: ` ${KEY} ` })).toBe(
      'rainbow'
    );
    expect(rainbowKey({ rainbow_api_key: ` ${KEY} ` })).toBe(KEY);
    expect(sourceKeyFor({ radar_source: 'rainbow', rainbow_api_key: KEY })).toContain('rainbow:');
    expect(maxNativeZoomFor({ radar_source: 'rainbow', rainbow_api_key: KEY })).toBe(
      RAINBOW_MAX_NATIVE_ZOOM
    );
  });

  it('builds now plus half-hour forecast frames from a snapshot', () => {
    const frames = rainbowFrames(SNAP, true);
    expect(frames.map(f => f.path)).toEqual([
      `${SNAP}/0`,
      `${SNAP}/1800`,
      `${SNAP}/3600`,
      `${SNAP}/5400`,
      `${SNAP}/7200`,
    ]);
    expect(frames[0]?.forecast).toBe(false);
    expect(frames.slice(1).every(f => f.forecast)).toBe(true);
    expect(latestObservedIndex(frames)).toBe(0);
    expect(rainbowFrames(SNAP, false)).toHaveLength(1);
  });

  it('parses the snapshot response', () => {
    expect(parseRainbowSnapshot({ snapshot: SNAP })).toBe(SNAP);
    expect(parseRainbowSnapshot({ snapshot: String(SNAP) })).toBe(SNAP);
    expect(parseRainbowSnapshot({})).toBeNull();
    expect(parseRainbowSnapshot(null)).toBeNull();
  });

  it('fetches the snapshot with the key, caches it and builds tile URLs', async () => {
    const fetcher = okFetch({ snapshot: SNAP });
    const set = await loadRainbowFrames(KEY, true, 1000, fetcher);
    expect(fetcher).toHaveBeenCalledWith(`https://api.rainbow.ai/tiles/v1/snapshot?token=${KEY}`);
    expect(set.provider).toBe('rainbow');
    expect(set.frames).toHaveLength(5);
    expect(frameTileUrl(set, set.frames[1]!, { smooth: true, snow: true })).toBe(
      `https://api.rainbow.ai/tiles/v1/precip/${SNAP}/1800/{z}/{x}/{y}?token=${KEY}`
    );
    await loadRainbowFrames(KEY, true, 1000 + RAINBOW_TTL_MS - 1, fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);
    await loadRainbowFrames(KEY, true, 1000 + RAINBOW_TTL_MS, fetcher);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('throws when the key is refused or no snapshot comes back', async () => {
    const refused = vi.fn(async () => ({ ok: false, json: async () => ({}) }));
    await expect(loadRainbowFrames(KEY, true, 0, refused)).rejects.toThrow();
    await expect(loadRainbowFrames(KEY, true, 0, okFetch({}))).rejects.toThrow();
  });

  it('loads through loadModuleFrames and credits Rainbow.ai', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => ({ snapshot: SNAP }) } as Response);
    const set = await loadModuleFrames({
      radar_source: 'rainbow',
      rainbow_api_key: KEY,
      show_forecast: false,
    });
    expect(set.frames.map(f => f.path)).toEqual([`${SNAP}/0`]);
    expect(radarAttributionFor(set.provider)).toBe(RAINBOW_ATTRIBUTION);
    fetchSpy.mockRestore();
  });
});

describe('keyed map providers', () => {
  afterEach(() => clearGoogleSessions());

  it('uses Esri until the chosen provider has a key', () => {
    expect(mapProviderFor({})).toBe('esri');
    expect(mapProviderFor({ map_provider: 'google' })).toBe('esri');
    expect(mapProviderFor({ map_provider: 'mapbox', map_api_key: 'pk.abc"onerror' })).toBe('esri');
    expect(
      mapProviderFor({ map_provider: 'mapbox', map_api_key: ' pk.eyJ1Ijoid2F5bmUi.abc_-1 ' })
    ).toBe('mapbox');
  });

  it('builds Mapbox and MapTiler tile URLs per style', () => {
    expect(keyedBaseMap('mapbox', 'dark', 'pk.k').url).toBe(
      'https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/{z}/{x}/{y}?access_token=pk.k'
    );
    expect(keyedBaseMap('maptiler', 'satellite', 'abc').url).toBe(
      'https://api.maptiler.com/maps/hybrid/256/{z}/{x}/{y}.jpg?key=abc'
    );
  });

  it('creates and reuses a Google session, and throws when the key is refused', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({ session: 'S1', expiry: 2000000000 }),
    }));
    const base = await loadGoogleBaseMap('satellite', 'KEY12345', 'en', 1000, fetcher);
    expect(base.url).toBe(
      'https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=S1&key=KEY12345'
    );
    const body = JSON.parse(
      (fetcher.mock.calls[0] as unknown as [string, { body: string }])[1].body
    );
    expect(body).toMatchObject({ mapType: 'satellite', layerTypes: ['layerRoadmap'] });
    await loadGoogleBaseMap('satellite', 'KEY12345', 'en', 2000, fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);
    const refused = vi.fn(async () => ({ ok: false, json: async () => ({}) }));
    await expect(loadGoogleBaseMap('light', 'BADKEY123', 'en', 1000, refused)).rejects.toThrow();
  });
});
