/**
 * Ultra Card External Cards Service
 * Handles discovery, validation, and management of 3rd party Home Assistant cards
 */

// Use the existing CustomCard type from types.ts which is already declared in global.d.ts
import { CustomCard } from '../types';

// Alias for consistency
type CustomCardInfo = CustomCard;

/**
 * Convert a native HA element name (hui-*-card) to its YAML config type (e.g., calendar)
 */
export function normalizeNativeCardConfigType(cardType: string): string {
  if (!cardType || !cardType.startsWith('hui-')) {
    return cardType;
  }

  let normalized = cardType.substring(4); // remove hui-

  if (normalized.endsWith('-card')) {
    normalized = normalized.substring(0, normalized.length - 5);
  }

  return normalized;
}

/** Strip Home Assistant's `custom:` Lovelace type prefix. */
function stripCustomPrefix(type: string): string {
  return type.startsWith('custom:') ? type.slice('custom:'.length) : type;
}

class UcExternalCardsService {
  /**
   * Get all available custom cards registered in Home Assistant
   */
  getAvailableCards(): CustomCardInfo[] {
    const win = window;

    if (!win.customCards || !Array.isArray(win.customCards)) {
      return [];
    }

    // Filter out Ultra Card to prevent recursive embedding
    return [...win.customCards]
      .filter(card => card.type !== 'ultra-card')
      .sort((a, b) => {
        // Sort alphabetically by name
        return (a.name || a.type).localeCompare(b.name || b.type);
      });
  }

  /**
   * Registered community card (HACS / JS module) — renders as its own custom element (e.g. mushroom-entity-card).
   */
  private _isCommunityCardType(typeWithoutPrefix: string): boolean {
    return !!window.customCards?.some(card => card.type === typeWithoutPrefix);
  }

  /**
   * Core Lovelace cards use hui-*-card tags and lazy chunks; `hui-card` + tryCreateCardElement handles them.
   */
  private _shouldUseHuiCardWrapper(configLovelaceType: string): boolean {
    if (!configLovelaceType || !configLovelaceType.startsWith('custom:')) {
      const base = stripCustomPrefix(configLovelaceType);
      if (this._isCommunityCardType(base)) {
        return false;
      }
    } else {
      // custom:foo → always embed via community element path
      return false;
    }
    return customElements.get('hui-card') !== undefined;
  }

  /**
   * Check if a specific card type is available/registered
   */
  isCardAvailable(cardType: string): boolean {
    if (!cardType) return false;

    const stripped = stripCustomPrefix(cardType);

    // Community card: same tag as type (often loads shortly after registry entry)
    try {
      if (customElements.get(stripped) !== undefined) return true;
    } catch (e) {
      // Element check failed
    }

    if (this._isCommunityCardType(stripped)) {
      return true;
    }

    // Native card chunk may already be registered (eager or previously lazy-loaded)
    try {
      if (customElements.get(`hui-${stripped}-card`) !== undefined) return true;
    } catch (e) {
      // Element check failed
    }

    // Native types are always created through HA's `hui-card` (handles lazy loading like picture-entity)
    return customElements.get('hui-card') !== undefined;
  }

  /**
   * Get information about a specific card type
   */
  getCardInfo(cardType: string): CustomCardInfo | null {
    const win = window;

    if (!win.customCards || !Array.isArray(win.customCards)) {
      return null;
    }

    const cardInfo = win.customCards.find(card => card.type === cardType);
    return cardInfo || null;
  }

  /**
   * Attempt to get the card's configuration editor element if it exists
   */
  getCardEditor(cardType: string): Promise<HTMLElement | null> {
    return new Promise(resolve => {
      try {
        const editorType = `${cardType}-editor`;

        // Check if editor element is defined
        const editorExists = customElements.get(editorType) !== undefined;

        if (editorExists) {
          const editor = document.createElement(editorType);
          resolve(editor as HTMLElement);
        } else {
          resolve(null);
        }
      } catch (error) {
        console.warn(`Failed to create editor for ${cardType}:`, error);
        resolve(null);
      }
    });
  }

  /**
   * Validate card configuration
   */
  validateCardConfig(cardType: string, config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation
    if (!cardType || typeof cardType !== 'string') {
      errors.push('Card type is required and must be a string');
    }

    if (!config || typeof config !== 'object') {
      errors.push('Card configuration is required and must be an object');
    }

    // Check if card is available
    if (cardType && !this.isCardAvailable(cardType)) {
      errors.push(`Card type "${cardType}" is not installed or not available`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create a card element with the given configuration
   */
  createCardElement(cardType: string, config: any, hass: any): HTMLElement | null {
    try {
      const fullConfig =
        config && typeof config === 'object' && !Array.isArray(config) ? { ...config } : {};

      const rawType = (fullConfig.type as string) || cardType;
      if (!rawType) {
        console.error('[External Card Service] No card type in config');
        return null;
      }
      if (!fullConfig.type) {
        fullConfig.type = rawType;
      }

      const strippedForCheck = stripCustomPrefix(rawType);
      if (!this.isCardAvailable(strippedForCheck)) {
        console.error(
          `[External Card Service] Card ${strippedForCheck} is not available/registered`
        );
        return null;
      }

      // Built-in Lovelace cards: prefer direct hui-*-card + setConfig like native_card / core
      // so behavior (state_image, media-source URLs, etc.) matches the dashboard picture-entity card.
      // If the class is not registered yet (lazy chunk), fall back to hui-card + tryCreateCardElement.
      if (this._shouldUseHuiCardWrapper(rawType)) {
        const typeBase = stripCustomPrefix(rawType);
        const nativeTag = `hui-${typeBase}-card`;

        if (customElements.get(nativeTag)) {
          const element = document.createElement(nativeTag) as any;
          if (hass) {
            element.hass = hass;
          }
          if (typeof element.setConfig === 'function') {
            try {
              element.setConfig(fullConfig);
            } catch (configError) {
              console.error(
                `[External Card] Failed to set config for ${nativeTag}:`,
                configError
              );
              throw configError;
            }
          } else {
            element.config = fullConfig;
          }
          return element as HTMLElement;
        }

        const wrapper = document.createElement('hui-card') as any;
        wrapper.config = fullConfig;
        if (hass) {
          wrapper.hass = hass;
        }
        if (typeof wrapper.load === 'function') {
          wrapper.load();
        }
        return wrapper as HTMLElement;
      }

      // Community cards: element tag matches type without custom:
      const elementName = strippedForCheck;
      const element = document.createElement(elementName) as any;

      // Defensive: if the custom element class is not yet registered,
      // document.createElement returns HTMLUnknownElement. Assigning hass/config
      // to it would create plain own-properties that SHADOW the eventual
      // prototype setters when the element is later upgraded — permanently
      // breaking cards that only paint inside `set hass` (e.g. better-moment-card).
      // Return null so the container service can defer creation via
      // customElements.whenDefined() and create the element after registration.
      if (element instanceof HTMLUnknownElement) {
        console.warn(
          `[External Card] Custom element <${elementName}> is not registered yet; deferring creation.`
        );
        return null;
      }

      // IMPORTANT: Set config FIRST, then hass
      // Some cards (like Bubble Card) try to update when hass is set
      // and expect config to already be there
      if (config) {
        // Most cards expect setConfig method
        if (typeof element.setConfig === 'function') {
          try {
            element.setConfig(fullConfig);
          } catch (configError) {
            console.error(`[External Card] Failed to set config for ${elementName}:`, configError);
            throw configError;
          }
        } else {
          element.config = fullConfig;
        }
      }

      // Set hass AFTER config
      if (hass) {
        element.hass = hass;
      }

      return element as HTMLElement;
    } catch (error) {
      console.error(`[External Card] Failed to create ${cardType}:`, error);
      return null;
    }
  }

  /**
   * Get popular/common cards that users might want to add
   */
  getPopularCards(): Array<{ type: string; name: string; description: string }> {
    return [
      {
        type: 'mushroom-entity-card',
        name: 'Mushroom Entity Card',
        description: 'Beautiful minimalist entity card',
      },
      {
        type: 'mini-graph-card',
        name: 'Mini Graph Card',
        description: 'Compact history graph card',
      },
      {
        type: 'button-card',
        name: 'Button Card',
        description: 'Highly customizable button card',
      },
      {
        type: 'weather-card',
        name: 'Weather Card',
        description: 'Animated weather card',
      },
      {
        type: 'spotify-card',
        name: 'Spotify Card',
        description: 'Spotify media player card',
      },
    ];
  }

  /**
   * Check if a card type has a native editor
   */
  hasCardEditor(cardType: string): boolean {
    if (!cardType) return false;

    // Native HA cards (hui-*) always have editors - they just load lazily
    if (cardType.startsWith('hui-')) {
      return true;
    }

    try {
      const editorType = `${cardType}-editor`;
      const editorElement = customElements.get(editorType);

      // Check if editor exists and is not HTMLUnknownElement
      return (
        editorElement !== undefined && !(editorElement.prototype instanceof HTMLUnknownElement)
      );
    } catch (e) {
      return false;
    }
  }

  /**
   * Get suggested HACS repository URL for a card type
   */
  getHACSUrl(cardType: string): string | null {
    // Common card type to HACS repo mappings
    const knownCards: Record<string, string> = {
      'mushroom-entity-card': 'https://github.com/piitaya/lovelace-mushroom',
      'mini-graph-card': 'https://github.com/kalkih/mini-graph-card',
      'button-card': 'https://github.com/custom-cards/button-card',
      'weather-card': 'https://github.com/bramkragten/weather-card',
      'spotify-card': 'https://github.com/custom-cards/spotify-card',
    };

    return knownCards[cardType] || null;
  }
}

// Export singleton instance
export const ucExternalCardsService = new UcExternalCardsService();
