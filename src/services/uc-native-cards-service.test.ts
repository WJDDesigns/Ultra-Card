import { describe, it, expect } from 'vitest';
import { ucNativeCardsService } from './uc-native-cards-service';

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
