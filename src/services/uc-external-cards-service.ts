/**
 * Ultra Card External Cards Service
 * Handles discovery, validation, and management of 3rd party Home Assistant cards
 */

// Use the existing CustomCard type from types.ts which is already declared in global.d.ts
import { CustomCard } from '../types';

// Alias for consistency
type CustomCardInfo = CustomCard;

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
   * Check if a specific card type is available/registered
   */
  isCardAvailable(cardType: string): boolean {
    if (!cardType) return false;

    // Check if the custom element is defined
    try {
      const elementExists = customElements.get(cardType) !== undefined;
      if (elementExists) return true;
    } catch (e) {
      // Element check failed
    }

    // Also check window.customCards registry
    if (window.customCards && Array.isArray(window.customCards)) {
      return window.customCards.some(card => card.type === cardType);
    }

    return false;
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
      // Determine the element tag name to create
      // Cards are registered as elements, not with custom: prefix
      let elementName = cardType;

      // Remove custom: prefix if present for element creation
      if (elementName.startsWith('custom:')) {
        elementName = elementName.substring(7); // Remove 'custom:' prefix
      }

      if (!this.isCardAvailable(elementName)) {
        return null;
      }

      const element = document.createElement(elementName) as any;

      // IMPORTANT: Set config FIRST, then hass
      // Some cards (like Bubble Card) try to update when hass is set
      // and expect config to already be there
      if (config) {
        // Most cards expect setConfig method
        if (typeof element.setConfig === 'function') {
          try {
            element.setConfig(config);
          } catch (configError) {
            console.error(`[External Card] Failed to set config for ${elementName}:`, configError);
            throw configError;
          }
        } else {
          element.config = config;
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

    try {
      const editorType = `${cardType}-editor`;
      return customElements.get(editorType) !== undefined;
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
