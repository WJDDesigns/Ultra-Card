/**
 * Ultra Card Native Cards Service
 * Handles discovery and management of native Home Assistant cards (hui-* elements)
 */

/** Matches the timeout HA uses when waiting for a lazily loaded element. */
const ELEMENT_LOAD_TIMEOUT_MS = 2000;

/** How long to back off before retrying an element that failed to register. */
const ELEMENT_LOAD_RETRY_MS = 30000;

export interface NativeCardInfo {
  type: string; // e.g., 'hui-entities-card'
  name: string; // e.g., 'Entities'
  description?: string | undefined;
}

class UcNativeCardsService {
  /**
   * Get all available native HA cards
   * These are the hui-* elements built into Home Assistant
   */
  getAvailableNativeCards(): NativeCardInfo[] {
    return [
      // HA renamed this card to "Activity" in the picker but kept `type: logbook`,
      // and the element name has to match the type, not the label.
      { type: 'hui-logbook-card', name: 'Activity', description: 'Shows a list of events for entities' },
      { type: 'hui-alarm-panel-card', name: 'Alarm Panel', description: 'Control alarm panel entities' },
      { type: 'hui-area-card', name: 'Area', description: 'Display area information and controls' },
      { type: 'hui-button-card', name: 'Button', description: 'Simple button for entity control' },
      { type: 'hui-calendar-card', name: 'Calendar', description: 'Display calendar events' },
      { type: 'hui-clock-card', name: 'Clock', description: 'Display a clock' },
      { type: 'hui-conditional-card', name: 'Conditional', description: 'Show cards based on conditions' },
      { type: 'hui-entities-card', name: 'Entities', description: 'List multiple entities' },
      { type: 'hui-entity-card', name: 'Entity', description: 'Display single entity' },
      { type: 'hui-entity-filter-card', name: 'Entity Filter', description: 'Filter entities based on state' },
      { type: 'hui-gauge-card', name: 'Gauge', description: 'Display value as gauge' },
      { type: 'hui-glance-card', name: 'Glance', description: 'Quick overview of entities' },
      { type: 'hui-grid-card', name: 'Grid', description: 'Display cards in grid layout' },
      { type: 'hui-heading-card', name: 'Heading', description: 'Display heading text' },
      { type: 'hui-history-graph-card', name: 'History Graph', description: 'Display historical data' },
      { type: 'hui-horizontal-stack-card', name: 'Horizontal Stack', description: 'Stack cards horizontally' },
      { type: 'hui-humidifier-card', name: 'Humidifier', description: 'Control humidifier entities' },
      { type: 'hui-light-card', name: 'Light', description: 'Control light entities' },
      { type: 'hui-map-card', name: 'Map', description: 'Display map with device trackers' },
      { type: 'hui-markdown-card', name: 'Markdown', description: 'Display markdown content' },
      { type: 'hui-media-control-card', name: 'Media Control', description: 'Control media player entities' },
      { type: 'hui-picture-card', name: 'Picture', description: 'Display static image' },
      { type: 'hui-picture-elements-card', name: 'Picture Elements', description: 'Interactive image with elements' },
      { type: 'hui-picture-entity-card', name: 'Picture Entity', description: 'Display entity with image' },
      { type: 'hui-picture-glance-card', name: 'Picture Glance', description: 'Glance card with image' },
      { type: 'hui-plant-status-card', name: 'Plant Status', description: 'Display plant information' },
      { type: 'hui-sensor-card', name: 'Sensor', description: 'Display sensor entity' },
      { type: 'hui-statistic-card', name: 'Statistic', description: 'Display statistic data' },
      { type: 'hui-statistics-graph-card', name: 'Statistics Graph', description: 'Display statistical graph' },
      { type: 'hui-thermostat-card', name: 'Thermostat', description: 'Control thermostat entities' },
      { type: 'hui-tile-card', name: 'Tile', description: 'Modern tile card for entities' },
      { type: 'hui-todo-list-card', name: 'To-do List', description: 'Manage to-do list items' },
      { type: 'hui-vertical-stack-card', name: 'Vertical Stack', description: 'Stack cards vertically' },
      { type: 'hui-weather-forecast-card', name: 'Weather Forecast', description: 'Display weather forecast' },
      // Same rename as Activity/logbook: the picker says "Webpage", the type is `iframe`.
      { type: 'hui-iframe-card', name: 'Webpage', description: 'Embed a webpage' },
    ];
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
    const cards = this.getAvailableNativeCards();
    return cards.find(card => card.type === cardType) || null;
  }

  /**
   * Convert hui-* element name to YAML config type
   * e.g., 'hui-entities-card' -> 'entities'
   */
  elementNameToConfigType(elementName: string): string {
    if (!elementName || !elementName.startsWith('hui-')) {
      return elementName;
    }

    let configType = elementName.substring(4); // Remove 'hui-'
    
    if (configType.endsWith('-card')) {
      configType = configType.substring(0, configType.length - 5); // Remove '-card'
    }

    return configType;
  }

  /**
   * Convert YAML config type to hui-* element name
   * e.g., 'entities' -> 'hui-entities-card'
   */
  configTypeToElementName(configType: string): string {
    if (!configType || configType.startsWith('hui-')) {
      return configType;
    }

    return `hui-${configType}-card`;
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

