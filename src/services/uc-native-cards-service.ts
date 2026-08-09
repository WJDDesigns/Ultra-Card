/**
 * Ultra Card Native Cards Service
 * Handles discovery and management of native Home Assistant cards (hui-* elements)
 */

import {
  CURATED_NATIVE_CARDS,
  configTypeToElementName,
  discoverNativeCards,
  elementNameToConfigType,
  getDiscoveredNativeCards,
  resetNativeCardDiscovery,
  type NativeCardInfo,
} from './uc-native-card-catalog';

export type { NativeCardInfo };

/** Matches the timeout HA uses when waiting for a lazily loaded element. */
const ELEMENT_LOAD_TIMEOUT_MS = 2000;

/** How long to back off before retrying an element that failed to register. */
const ELEMENT_LOAD_RETRY_MS = 30000;

/**
 * Element names that were recorded from HA's picker label instead of its YAML
 * type. Neither has ever matched a real HA card, so anything saved under them
 * is already broken and can be rewritten on read without risk.
 */
const CARD_TYPE_ALIASES: Record<string, string> = {
  'hui-activity-card': 'hui-logbook-card',
  'hui-webpage-card': 'hui-iframe-card',
};

class UcNativeCardsService {
  /**
   * Native HA cards this install offers.
   *
   * Returns the runtime-discovered catalog once `ensureDiscovered` has resolved,
   * and the curated baseline until then, so callers stay synchronous.
   */
  getAvailableNativeCards(): NativeCardInfo[] {
    return getDiscoveredNativeCards() ?? CURATED_NATIVE_CARDS;
  }

  /**
   * Discover the cards the running HA actually has, replacing the baseline.
   *
   * Safe to call on every picker open: the result is cached for the session and
   * concurrent calls share one lookup.
   */
  async ensureDiscovered(hass: unknown): Promise<NativeCardInfo[]> {
    return discoverNativeCards(hass);
  }

  /** Force the next `ensureDiscovered` to look again. */
  resetDiscovery(): void {
    resetNativeCardDiscovery();
  }

  /**
   * Map an element name that was never valid onto the card HA actually ships.
   * Returns the input unchanged when there is nothing to repair.
   */
  resolveCardType(cardType: string): string {
    return CARD_TYPE_ALIASES[cardType] || cardType;
  }

  /**
   * Check if a card type is a native HA card
   */
  isNativeCard(cardType: string): boolean {
    return !!cardType && cardType.startsWith('hui-');
  }

  /**
   * Get information about a specific native card
   */
  getNativeCardInfo(cardType: string): NativeCardInfo | null {
    const discovered = getDiscoveredNativeCards()?.find(card => card.type === cardType);
    if (discovered) return discovered;

    // A card saved before an HA downgrade is no longer discoverable, but the
    // module still has to render with a name, so keep answering from the baseline.
    return CURATED_NATIVE_CARDS.find(card => card.type === cardType) || null;
  }

  /**
   * Convert hui-* element name to YAML config type
   * e.g., 'hui-entities-card' -> 'entities'
   */
  elementNameToConfigType(elementName: string): string {
    return elementNameToConfigType(elementName);
  }

  /**
   * Convert YAML config type to hui-* element name
   * e.g., 'entities' -> 'hui-entities-card'
   */
  configTypeToElementName(configType: string): string {
    return configTypeToElementName(configType);
  }

  /**
   * Make sure the custom element class for a native card is registered.
   *
   * Home Assistant only eagerly defines a handful of card elements (entity,
   * entities, button, glance, grid, light, sensor, thermostat, tile, ...).
   * Everything else lives in a lazily imported chunk, so `document.createElement`
   * would hand back an inert element that never upgrades: it renders nothing and
   * has no `setConfig`. Asking HA's own card helpers to build the card triggers
   * that import for us.
   */
  async ensureCardElementLoaded(cardType: string): Promise<CustomElementConstructor | undefined> {
    if (!cardType) return undefined;

    const registered = customElements.get(cardType);
    if (registered) return registered;

    // Both the preview and the editor ask on every render, so a card that will
    // never register would otherwise restart a full ELEMENT_LOAD_TIMEOUT_MS wait
    // each time. Back off instead, and let a later render retry.
    const failedAt = this._failedElementLoads.get(cardType);
    if (failedAt !== undefined && Date.now() - failedAt < ELEMENT_LOAD_RETRY_MS) {
      return undefined;
    }

    let pending = this._pendingElementLoads.get(cardType);
    if (!pending) {
      pending = this._loadCardElement(cardType)
        .catch(error => {
          console.warn(`[UC Native Cards] Load failed for ${cardType}:`, error);
          return undefined;
        })
        .then(result => {
          this._pendingElementLoads.delete(cardType);
          if (result) {
            this._failedElementLoads.delete(cardType);
          } else {
            this._failedElementLoads.set(cardType, Date.now());
          }
          return result;
        });
      this._pendingElementLoads.set(cardType, pending);
    }
    return pending;
  }

  /**
   * Build a usable default config for a native card.
   *
   * Mirrors HA's own card picker: `getStubConfig` expects an entity shortlist plus
   * a fallback list, and several cards (thermostat, gauge, media-control, ...)
   * throw or render nothing when their entity is missing.
   */
  async getStubConfig(cardType: string, hass: any): Promise<Record<string, any>> {
    const baseConfig = { type: this.elementNameToConfigType(cardType) };

    const cardClass = (await this.ensureCardElementLoaded(cardType)) as any;
    if (!cardClass || typeof cardClass.getStubConfig !== 'function') {
      return baseConfig;
    }

    try {
      const allEntities = hass?.states ? Object.keys(hass.states) : [];
      const stubConfig = await Promise.resolve(cardClass.getStubConfig(hass, [], allEntities));

      // Not every card includes `type` in its stub, so keep ours as the base.
      return stubConfig && typeof stubConfig === 'object'
        ? { ...baseConfig, ...stubConfig }
        : baseConfig;
    } catch (error) {
      console.warn(`[UC Native Cards] getStubConfig failed for ${cardType}:`, error);
      return baseConfig;
    }
  }

  private _pendingElementLoads = new Map<string, Promise<CustomElementConstructor | undefined>>();
  private _failedElementLoads = new Map<string, number>();

  private async _loadCardElement(
    cardType: string
  ): Promise<CustomElementConstructor | undefined> {
    try {
      const loadCardHelpers = (window as any).loadCardHelpers;
      if (typeof loadCardHelpers === 'function') {
        const helpers = await loadCardHelpers();
        // The config is intentionally minimal: HA imports the chunk before it
        // validates, so an incomplete config still gets the element registered.
        helpers?.createCardElement?.({ type: this.elementNameToConfigType(cardType) });
      }
    } catch (error) {
      console.warn(`[UC Native Cards] Could not preload ${cardType}:`, error);
    }

    await Promise.race([
      customElements.whenDefined(cardType),
      new Promise(resolve => setTimeout(resolve, ELEMENT_LOAD_TIMEOUT_MS)),
    ]);

    return customElements.get(cardType);
  }
}

export const ucNativeCardsService = new UcNativeCardsService();

