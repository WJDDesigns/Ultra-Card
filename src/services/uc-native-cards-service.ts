/**
 * Ultra Card Native Cards Service
 * Handles discovery and management of native Home Assistant cards (hui-* elements)
 */

export interface NativeCardInfo {
  type: string; // e.g., 'hui-entities-card'
  name: string; // e.g., 'Entities'
  description?: string;
}

class UcNativeCardsService {
  /**
   * Get all available native HA cards
   * These are the hui-* elements built into Home Assistant
   */
  getAvailableNativeCards(): NativeCardInfo[] {
    return [
      { type: 'hui-activity-card', name: 'Activity', description: 'Shows a list of events for entities' },
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
      { type: 'hui-webpage-card', name: 'Webpage', description: 'Embed a webpage' },
    ];
  }

  /**
   * Check if a card type is a native HA card
   */
  isNativeCard(cardType: string): boolean {
    return cardType && cardType.startsWith('hui-');
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
}

export const ucNativeCardsService = new UcNativeCardsService();

