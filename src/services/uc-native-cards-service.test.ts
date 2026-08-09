import { describe, it, expect, afterEach, vi } from 'vitest';
import { ucNativeCardsService } from './uc-native-cards-service';
import { CURATED_NATIVE_CARDS } from './uc-native-card-catalog';

describe('uc-native-cards-service card types', () => {
  it('lists element names that match HA config types, not picker labels', () => {
    const cards = ucNativeCardsService.getAvailableNativeCards();
    const byName = (name: string) => cards.find(card => card.name === name);

    // HA renamed both cards in the picker but kept the original YAML type.
    expect(byName('Activity')?.type).toBe('hui-logbook-card');
    expect(byName('Webpage')?.type).toBe('hui-iframe-card');
  });

  it('round-trips every listed card between element name and config type', () => {
    for (const card of ucNativeCardsService.getAvailableNativeCards()) {
      const configType = ucNativeCardsService.elementNameToConfigType(card.type);
      expect(ucNativeCardsService.configTypeToElementName(configType)).toBe(card.type);
    }
  });

  it('rewrites element names that never matched a real HA card', () => {
    expect(ucNativeCardsService.resolveCardType('hui-activity-card')).toBe('hui-logbook-card');
    expect(ucNativeCardsService.resolveCardType('hui-webpage-card')).toBe('hui-iframe-card');
  });

  it('leaves valid element names untouched', () => {
    expect(ucNativeCardsService.resolveCardType('hui-tile-card')).toBe('hui-tile-card');
    expect(ucNativeCardsService.resolveCardType('hui-logbook-card')).toBe('hui-logbook-card');
    expect(ucNativeCardsService.resolveCardType('')).toBe('');
  });
});

describe('uc-native-cards-service discovery', () => {
  afterEach(() => {
    ucNativeCardsService.resetDiscovery();
    vi.unstubAllGlobals();
  });

  it('serves the curated list until discovery resolves', () => {
    expect(ucNativeCardsService.getAvailableNativeCards()).toEqual(CURATED_NATIVE_CARDS);
  });

  it('serves the discovered cards once discovery resolves', async () => {
    const types = ['tile', 'logbook', 'iframe', 'shortcut'];
    const resources: Record<string, string> = {};
    for (const type of types) {
      resources[`ui.panel.lovelace.editor.card.${type}.name`] = `HA ${type}`;
    }
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => resources }))
    );

    await ucNativeCardsService.ensureDiscovered({
      language: 'en',
      config: { version: '2026.8.0' },
      localize: (key: string) => resources[key] ?? '',
      translationMetadata: { translations: { en: { hash: 'h' } } },
    });

    // Four cards is below the plausibility floor, so this stays curated. The
    // point is that a resolved discovery is what answers from here on.
    expect(ucNativeCardsService.getAvailableNativeCards()).toEqual(CURATED_NATIVE_CARDS);
  });

  it('still names a card that discovery no longer lists', async () => {
    // An HA without the clock card, so discovery drops it.
    const types = CURATED_NATIVE_CARDS.map(card =>
      ucNativeCardsService.elementNameToConfigType(card.type)
    ).filter(type => type !== 'clock');
    const resources: Record<string, string> = {};
    for (const type of types) {
      resources[`ui.panel.lovelace.editor.card.${type}.name`] = `HA ${type}`;
    }
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => resources }))
    );

    await ucNativeCardsService.ensureDiscovered({
      language: 'en',
      config: { version: '2026.8.0' },
      localize: (key: string) => resources[key] ?? '',
      translationMetadata: { translations: { en: { hash: 'h' } } },
    });

    expect(
      ucNativeCardsService.getAvailableNativeCards().map(card => card.type)
    ).not.toContain('hui-clock-card');

    // A layout saved on a newer HA must still render with a name, not a blank.
    expect(ucNativeCardsService.getNativeCardInfo('hui-clock-card')?.name).toBe('Clock');
    expect(ucNativeCardsService.getNativeCardInfo('hui-tile-card')?.name).toBe('HA tile');
    expect(ucNativeCardsService.getNativeCardInfo('not-a-card')).toBeNull();
  });
});
