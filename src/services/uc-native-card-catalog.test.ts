import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  CURATED_NATIVE_CARDS,
  configTypeToElementName,
  discoverNativeCards,
  elementNameToConfigType,
  getDiscoveredNativeCards,
  isSelectableCardType,
  resetNativeCardDiscovery,
} from './uc-native-card-catalog';

/** The key HA's own card picker labels cards with. */
const nameKey = (type: string) => `ui.panel.lovelace.editor.card.${type}.name`;
const descKey = (type: string) => `ui.panel.lovelace.editor.card.${type}.description`;

/** A `hass` whose lovelace translations cover exactly `types`. */
function fakeHass(types: string[], overrides: Record<string, unknown> = {}) {
  const resources: Record<string, string> = {};
  for (const type of types) {
    resources[nameKey(type)] = `Name of ${type}`;
    resources[descKey(type)] = `Description of ${type}`;
  }

  return {
    language: 'en',
    config: { version: '2026.8.0' },
    localize: (key: string) => resources[key] ?? '',
    translationMetadata: { translations: { en: { hash: 'abc123' } } },
    ...overrides,
  };
}

/** Stub `fetch` so it serves the lovelace fragment for `types`. */
function stubFragmentFetch(types: string[]) {
  const resources: Record<string, string> = {};
  for (const type of types) {
    resources[nameKey(type)] = `Fragment name of ${type}`;
    resources[descKey(type)] = `Fragment description of ${type}`;
  }

  const fetchMock = vi.fn(async (url: string) => ({
    ok: true,
    json: async () => resources,
    url,
  }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('uc-native-card-catalog mapping', () => {
  it('maps element names to HA config types and back', () => {
    expect(elementNameToConfigType('hui-entities-card')).toBe('entities');
    expect(configTypeToElementName('entities')).toBe('hui-entities-card');
  });

  it('leaves values that are already in the target form alone', () => {
    expect(elementNameToConfigType('entities')).toBe('entities');
    expect(configTypeToElementName('hui-entities-card')).toBe('hui-entities-card');
    expect(elementNameToConfigType('')).toBe('');
    expect(configTypeToElementName('')).toBe('');
  });

  it('round-trips every curated card', () => {
    for (const card of CURATED_NATIVE_CARDS) {
      expect(configTypeToElementName(elementNameToConfigType(card.type))).toBe(card.type);
    }
  });

  it('keys the cards HA renamed off the YAML type, not the picker label', () => {
    // HA's picker says "Activity" and "Webpage", but the types stayed `logbook`
    // and `iframe`, and the element name follows the type.
    expect(configTypeToElementName('logbook')).toBe('hui-logbook-card');
    expect(configTypeToElementName('iframe')).toBe('hui-iframe-card');

    const byName = (name: string) => CURATED_NATIVE_CARDS.find(card => card.name === name);
    expect(byName('Activity')?.type).toBe('hui-logbook-card');
    expect(byName('Webpage')?.type).toBe('hui-iframe-card');

    // The labels never become element names.
    expect(CURATED_NATIVE_CARDS.map(card => card.type)).not.toContain('hui-activity-card');
    expect(CURATED_NATIVE_CARDS.map(card => card.type)).not.toContain('hui-webpage-card');
  });

  it('rejects translation keys in the card namespace that are not cards', () => {
    expect(isSelectableCardType('generic')).toBe(false);
    expect(isSelectableCardType('empty_state')).toBe(false);
    expect(isSelectableCardType('manual')).toBe(false);
    expect(isSelectableCardType('error')).toBe(false);
    expect(isSelectableCardType('')).toBe(false);
  });

  it('rejects cards HA keeps in its own picker sections', () => {
    expect(isSelectableCardType('energy-usage-graph')).toBe(false);
    expect(isSelectableCardType('power-sankey')).toBe(false);
    expect(isSelectableCardType('water-sankey')).toBe(false);
  });

  it('accepts real card types', () => {
    expect(isSelectableCardType('logbook')).toBe(true);
    expect(isSelectableCardType('iframe')).toBe(true);
    expect(isSelectableCardType('tile')).toBe(true);
  });
});

describe('uc-native-card-catalog discovery', () => {
  beforeEach(() => {
    resetNativeCardDiscovery();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    resetNativeCardDiscovery();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('builds the catalog from the lovelace translation fragment', async () => {
    // A card set that is deliberately not the curated one, including a card the
    // curated list has never heard of.
    const types = [
      'tile',
      'logbook',
      'iframe',
      'markdown',
      'entities',
      'entity',
      'button',
      'gauge',
      'glance',
      'grid',
      'shortcut',
    ];
    stubFragmentFetch(types);

    const cards = await discoverNativeCards(fakeHass(types));

    expect(cards.map(card => card.type).sort()).toEqual(
      types.map(configTypeToElementName).sort()
    );
    expect(cards.find(card => card.type === 'hui-shortcut-card')).toBeDefined();
  });

  it('drops cards this HA does not have', async () => {
    const types = [
      'tile',
      'entities',
      'entity',
      'button',
      'gauge',
      'glance',
      'grid',
      'markdown',
      'logbook',
      'iframe',
    ];
    stubFragmentFetch(types);

    const cards = await discoverNativeCards(fakeHass(types));

    // In the curated list, absent from this HA.
    expect(cards.map(card => card.type)).not.toContain('hui-clock-card');
    expect(cards.map(card => card.type)).not.toContain('hui-plant-status-card');
  });

  it('ignores non-card and energy keys the fragment also carries', async () => {
    const types = [
      'tile',
      'entities',
      'entity',
      'button',
      'gauge',
      'glance',
      'grid',
      'markdown',
      'logbook',
      'iframe',
      'generic',
      'empty_state',
      'energy-usage-graph',
      'water-sankey',
    ];
    stubFragmentFetch(types);

    const cards = await discoverNativeCards(fakeHass(types));
    const elements = cards.map(card => card.type);

    expect(elements).not.toContain('hui-generic-card');
    expect(elements).not.toContain('hui-empty_state-card');
    expect(elements).not.toContain('hui-energy-usage-graph-card');
    expect(elements).not.toContain('hui-water-sankey-card');
    expect(elements).toContain('hui-tile-card');
  });

  it("prefers HA's own labels for names and descriptions", async () => {
    const types = [
      'logbook',
      'tile',
      'entities',
      'entity',
      'button',
      'gauge',
      'glance',
      'grid',
      'markdown',
      'iframe',
    ];
    stubFragmentFetch(types);

    const cards = await discoverNativeCards(fakeHass(types));
    const logbook = cards.find(card => card.type === 'hui-logbook-card');

    // `hass.localize` wins over the raw fragment value, and both win over the
    // curated 'Activity' / 'Shows a list of events for entities'.
    expect(logbook?.name).toBe('Name of logbook');
    expect(logbook?.description).toBe('Description of logbook');
  });

  it('falls back to curated names when HA has no translation for a card', async () => {
    const types = [
      'logbook',
      'tile',
      'entities',
      'entity',
      'button',
      'gauge',
      'glance',
      'grid',
      'markdown',
      'iframe',
    ];
    stubFragmentFetch(types);

    // Fragment lists the cards, but localize knows nothing.
    const cards = await discoverNativeCards(fakeHass([]));
    const logbook = cards.find(card => card.type === 'hui-logbook-card');

    expect(logbook?.name).toBe('Fragment name of logbook');
  });

  it('humanizes the type when nothing supplies a name', async () => {
    const types = [
      'brand-new-card',
      'tile',
      'entities',
      'entity',
      'button',
      'gauge',
      'glance',
      'grid',
      'markdown',
      'logbook',
      'iframe',
    ];
    // Fragment keys present, but with empty values, and localize knows nothing.
    const resources: Record<string, string> = {};
    for (const type of types) resources[nameKey(type)] = '';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => resources }))
    );

    const cards = await discoverNativeCards(fakeHass([]));

    expect(cards.find(card => card.type === 'hui-brand-new-card-card')?.name).toBe(
      'Brand New Card'
    );
  });

  it('probes with localize when the fragment cannot be fetched', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, json: async () => ({}) }))
    );

    // The probe only knows candidates, so use curated types plus a newer one.
    const types = [
      ...CURATED_NATIVE_CARDS.map(card => elementNameToConfigType(card.type)),
      'shortcut',
    ];
    const cards = await discoverNativeCards(fakeHass(types));

    expect(cards.map(card => card.type)).toContain('hui-shortcut-card');
    expect(cards.map(card => card.type)).toContain('hui-logbook-card');
  });

  it('drops absent cards even on the probe path', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline');
      })
    );

    const types = CURATED_NATIVE_CARDS.map(card => elementNameToConfigType(card.type)).filter(
      type => type !== 'clock'
    );
    const cards = await discoverNativeCards(fakeHass(types));

    expect(cards.map(card => card.type)).not.toContain('hui-clock-card');
    expect(cards.map(card => card.type)).toContain('hui-tile-card');
  });

  it('falls back to the curated list when discovery finds nothing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, json: async () => ({}) }))
    );

    const cards = await discoverNativeCards(fakeHass([]));

    expect(cards).toEqual(CURATED_NATIVE_CARDS);
  });

  it('falls back to the curated list when discovery finds implausibly few cards', async () => {
    stubFragmentFetch(['tile', 'entities']);

    const cards = await discoverNativeCards(fakeHass(['tile', 'entities']));

    expect(cards).toEqual(CURATED_NATIVE_CARDS);
  });

  it('falls back to the curated list when hass is unusable', async () => {
    expect(await discoverNativeCards(undefined)).toEqual(CURATED_NATIVE_CARDS);
    resetNativeCardDiscovery();
    expect(await discoverNativeCards({})).toEqual(CURATED_NATIVE_CARDS);
  });

  it('never lets a thrown fetch escape', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => {
        throw new Error('boom');
      })
    );

    await expect(discoverNativeCards(fakeHass([]))).resolves.toEqual(CURATED_NATIVE_CARDS);
  });

  it('caches the result so repeated picker opens cost one lookup', async () => {
    const types = CURATED_NATIVE_CARDS.map(card => elementNameToConfigType(card.type));
    const fetchMock = stubFragmentFetch(types);
    const hass = fakeHass(types);

    const first = await discoverNativeCards(hass);
    const second = await discoverNativeCards(hass);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
  });

  it('shares one lookup between concurrent callers', async () => {
    const types = CURATED_NATIVE_CARDS.map(card => elementNameToConfigType(card.type));
    const fetchMock = stubFragmentFetch(types);
    const hass = fakeHass(types);

    const [a, b, c] = await Promise.all([
      discoverNativeCards(hass),
      discoverNativeCards(hass),
      discoverNativeCards(hass),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(b).toBe(a);
    expect(c).toBe(a);
  });

  it('looks again when the HA version or language changes', async () => {
    const types = CURATED_NATIVE_CARDS.map(card => elementNameToConfigType(card.type));
    const fetchMock = stubFragmentFetch(types);

    await discoverNativeCards(fakeHass(types));
    await discoverNativeCards(fakeHass(types, { config: { version: '2026.9.0' } }));

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('exposes the cached result synchronously, and only once resolved', async () => {
    const types = CURATED_NATIVE_CARDS.map(card => elementNameToConfigType(card.type));
    stubFragmentFetch(types);
    const hass = fakeHass(types);

    expect(getDiscoveredNativeCards()).toBeNull();

    const pending = discoverNativeCards(hass);
    expect(getDiscoveredNativeCards()).toBeNull();

    const cards = await pending;
    expect(getDiscoveredNativeCards()).toBe(cards);

    resetNativeCardDiscovery();
    expect(getDiscoveredNativeCards()).toBeNull();
  });

  it('loads the lovelace translation fragment before probing', async () => {
    const types = CURATED_NATIVE_CARDS.map(card => elementNameToConfigType(card.type));
    stubFragmentFetch(types);
    const loadFragmentTranslation = vi.fn(async () => undefined);

    await discoverNativeCards(fakeHass(types, { loadFragmentTranslation }));

    expect(loadFragmentTranslation).toHaveBeenCalledWith('lovelace');
  });

  it('uses the localize returned by the fragment load when hass.localize is stale', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, json: async () => ({}) }))
    );

    const types = CURATED_NATIVE_CARDS.map(card => elementNameToConfigType(card.type));
    const fresh = (key: string) => (types.some(type => key === nameKey(type)) ? 'Fresh' : '');

    const cards = await discoverNativeCards({
      language: 'en',
      config: { version: '2026.8.0' },
      // The panel has not loaded lovelace strings yet.
      localize: () => '',
      loadFragmentTranslation: async () => fresh,
    });

    expect(cards.length).toBe(types.length);
    expect(cards[0]?.name).toBe('Fresh');
  });

  it('survives a fragment load that rejects', async () => {
    const types = CURATED_NATIVE_CARDS.map(card => elementNameToConfigType(card.type));
    stubFragmentFetch(types);

    const cards = await discoverNativeCards(
      fakeHass(types, {
        loadFragmentTranslation: async () => {
          throw new Error('no such fragment');
        },
      })
    );

    expect(cards.length).toBe(types.length);
  });

  it('skips the fetch when HA gives no translation hash', async () => {
    const types = CURATED_NATIVE_CARDS.map(card => elementNameToConfigType(card.type));
    const fetchMock = stubFragmentFetch(types);

    const cards = await discoverNativeCards(fakeHass(types, { translationMetadata: {} }));

    expect(fetchMock).not.toHaveBeenCalled();
    // The localize probe still produces a full catalog.
    expect(cards.length).toBe(types.length);
  });

  it('requests the fragment HA itself would have fetched', async () => {
    const types = CURATED_NATIVE_CARDS.map(card => elementNameToConfigType(card.type));
    const fetchMock = stubFragmentFetch(types);

    await discoverNativeCards(
      fakeHass(types, {
        language: 'nl',
        translationMetadata: { translations: { nl: { hash: 'deadbeef' } } },
      })
    );

    expect(fetchMock).toHaveBeenCalledWith(
      '/static/translations/lovelace/nl-deadbeef.json',
      expect.objectContaining({ credentials: 'same-origin' })
    );
  });
});
