import { describe, it, expect, beforeAll, vi } from 'vitest';
import { ucNativeCardsService } from '../uc-native-cards-service';

/**
 * Regression cover for https://github.com/WJDDesigns/Ultra-Card/issues/109:
 * a native card was handed `getStubConfig(hass)` instead of HA's
 * `getStubConfig(hass, entities, entitiesFallback)`, so the call threw and the
 * card kept a config with no entity. HA's own editors read that entity while
 * rendering, which left the module's settings panel blank.
 */

const hass = {
  states: {
    'climate.living_room': { entity_id: 'climate.living_room' },
    'light.kitchen': { entity_id: 'light.kitchen' },
  },
} as any;

beforeAll(() => {
  class StubThermostatCard extends HTMLElement {
    static getStubConfig(_hass: any, entities: string[], entitiesFallback: string[]) {
      const candidates = [...(entities || []), ...(entitiesFallback || [])];
      return {
        type: 'thermostat',
        entity: candidates.find(entityId => entityId.startsWith('climate.')) || '',
      };
    }
  }
  customElements.define('hui-thermostat-card', StubThermostatCard);

  class StubClockCard extends HTMLElement {
    static getStubConfig() {
      return { type: 'clock' };
    }
  }
  customElements.define('hui-clock-card', StubClockCard);

  class StubPlainCard extends HTMLElement {}
  customElements.define('hui-plain-card', StubPlainCard);

  class StubThrowingCard extends HTMLElement {
    static getStubConfig() {
      throw new Error('nope');
    }
  }
  customElements.define('hui-throwing-card', StubThrowingCard);
});

describe('ucNativeCardsService.getStubConfig', () => {
  it('passes the entity lists HA cards expect, so the config gets an entity', async () => {
    const config = await ucNativeCardsService.getStubConfig('hui-thermostat-card', hass);

    expect(config).toEqual({ type: 'thermostat', entity: 'climate.living_room' });
  });

  it('keeps the config type when a card omits it from its stub', async () => {
    const spy = vi
      .spyOn(customElements.get('hui-thermostat-card') as any, 'getStubConfig')
      .mockReturnValue({ entity: 'climate.living_room' });

    const config = await ucNativeCardsService.getStubConfig('hui-thermostat-card', hass);

    expect(config).toEqual({ type: 'thermostat', entity: 'climate.living_room' });
    spy.mockRestore();
  });

  it('falls back to the bare type for cards without a stub config', async () => {
    await expect(ucNativeCardsService.getStubConfig('hui-plain-card', hass)).resolves.toEqual({
      type: 'plain',
    });
  });

  it('falls back to the bare type when a card throws', async () => {
    await expect(ucNativeCardsService.getStubConfig('hui-throwing-card', hass)).resolves.toEqual({
      type: 'throwing',
    });
  });

  it('leaves cards alone that legitimately need no entity', async () => {
    await expect(ucNativeCardsService.getStubConfig('hui-clock-card', hass)).resolves.toEqual({
      type: 'clock',
    });
  });
});

describe('ucNativeCardsService.ensureCardElementLoaded', () => {
  it('returns the class for an already registered card without loading helpers', async () => {
    const loadCardHelpers = vi.fn();
    (window as any).loadCardHelpers = loadCardHelpers;

    const cls = await ucNativeCardsService.ensureCardElementLoaded('hui-thermostat-card');

    expect(cls).toBe(customElements.get('hui-thermostat-card'));
    expect(loadCardHelpers).not.toHaveBeenCalled();
  });

  it('asks HA to build the card so its lazily loaded chunk gets imported', async () => {
    const createCardElement = vi.fn(() => {
      customElements.define('hui-lazy-card', class extends HTMLElement {});
      return document.createElement('hui-lazy-card');
    });
    (window as any).loadCardHelpers = vi.fn().mockResolvedValue({ createCardElement });

    const cls = await ucNativeCardsService.ensureCardElementLoaded('hui-lazy-card');

    expect(createCardElement).toHaveBeenCalledWith({ type: 'lazy' });
    expect(cls).toBe(customElements.get('hui-lazy-card'));
  });
});
