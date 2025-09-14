import { HomeAssistant } from 'custom-card-helpers';

/**
 * Entity Icon Service
 *
 * Centralized service for determining the appropriate icon for Home Assistant entities.
 * This service attempts to use the same icon computation logic that Home Assistant's
 * entity picker uses, ensuring consistency across the Ultra Card.
 */
export class EntityIconService {
  /**
   * Get the icon for an entity, using Home Assistant's native computation when possible
   * @param entityId The entity ID
   * @param hass The Home Assistant instance
   * @returns The computed icon string, or null if no icon could be determined
   */
  static getEntityIcon(entityId: string, hass: HomeAssistant): string | null {
    if (!entityId || !hass?.states[entityId]) {
      return null;
    }

    const entityState = hass.states[entityId];

    // First, try to get the icon that Home Assistant would compute
    const computedIcon = this._getHomeAssistantComputedIcon(entityId, entityState, hass);
    if (computedIcon) {
      return computedIcon;
    }

    // Fallback to enhanced icon detection
    return this._getEnhancedIconForEntity(entityId, entityState);
  }

  /**
   * Get the icon that Home Assistant would naturally compute for this entity
   * This attempts to use the same logic as the entity picker
   */
  private static _getHomeAssistantComputedIcon(
    entityId: string,
    entityState: any,
    hass: HomeAssistant
  ): string | null {
    // First check if entity has a custom icon attribute
    if (entityState.attributes?.icon) {
      return entityState.attributes.icon;
    }

    // Try to use Home Assistant's built-in icon computation functions
    try {
      // Method 1: Try custom-card-helpers stateIcon function
      if ((window as any).customCards?.helpers?.stateIcon) {
        const icon = (window as any).customCards.helpers.stateIcon(entityState);
        if (icon) return icon;
      }

      // Method 2: Direct access to HA frontend functions
      // These functions might be available in different locations depending on HA version
      const possibleLocations = [
        (window as any).stateIcon,
        (window as any).computeStateIcon,
        (window as any).computeEntityIcon,
        (window as any).hassIcons?.stateIcon,
        (window as any).hassIcons?.computeStateIcon,
        (hass as any).stateIcon,
        (hass as any).computeStateIcon,
        (hass as any).computeEntityIcon,
      ];

      for (const iconFunction of possibleLocations) {
        if (typeof iconFunction === 'function') {
          try {
            const computed = iconFunction(entityState);
            if (computed) return computed;
          } catch (e) {
            // Continue to next method
          }
        }
      }

      // Method 3: Try to access icon through HA's entity registry
      if ((hass as any).entities && (hass as any).entities[entityId]) {
        const registryEntry = (hass as any).entities[entityId];
        if (registryEntry.icon) return registryEntry.icon;
      }

      // Method 4: For weather entities, try to get state-specific icons
      if (entityId.startsWith('weather.')) {
        const weatherIcons: Record<string, string> = {
          'clear-night': 'mdi:weather-night',
          cloudy: 'mdi:weather-cloudy',
          fog: 'mdi:weather-fog',
          hail: 'mdi:weather-hail',
          lightning: 'mdi:weather-lightning',
          'lightning-rainy': 'mdi:weather-lightning-rainy',
          partlycloudy: 'mdi:weather-partly-cloudy',
          pouring: 'mdi:weather-pouring',
          rainy: 'mdi:weather-rainy',
          snowy: 'mdi:weather-snowy',
          'snowy-rainy': 'mdi:weather-snowy-rainy',
          sunny: 'mdi:weather-sunny',
          windy: 'mdi:weather-windy',
          'windy-variant': 'mdi:weather-windy-variant',
          exceptional: 'mdi:weather-exceptional',
        };

        const weatherState = entityState.state;
        if (weatherIcons[weatherState]) {
          return weatherIcons[weatherState];
        }
      }
    } catch (e) {
      console.debug('Failed to compute HA icon, falling back to enhanced detection:', e);
    }

    return null;
  }

  /**
   * Enhanced icon detection based on entity patterns and characteristics
   */
  private static _getEnhancedIconForEntity(entityId: string, entityState: any): string | null {
    const domain = entityId.split('.')[0];
    const entityName = entityId.split('.')[1] || '';
    const deviceClass = entityState.attributes?.device_class;
    const unitOfMeasurement = entityState.attributes?.unit_of_measurement;
    const friendlyName = entityState.attributes?.friendly_name || '';
    const state = entityState.state;

    // Check for specific patterns in entity names
    const lowerEntityName = entityName.toLowerCase();
    const lowerFriendlyName = friendlyName.toLowerCase();

    // Battery-related entities (including charging)
    if (
      this._isBatteryRelated(lowerEntityName, lowerFriendlyName, deviceClass, unitOfMeasurement)
    ) {
      if (this._isChargingRelated(lowerEntityName, lowerFriendlyName)) {
        return this._getChargingBatteryIcon(state, unitOfMeasurement);
      }
      return this._getBatteryIcon(state, unitOfMeasurement);
    }

    // Temperature sensors
    if (
      this._isTemperatureRelated(lowerEntityName, lowerFriendlyName, deviceClass, unitOfMeasurement)
    ) {
      return 'mdi:thermometer';
    }

    // Humidity sensors
    if (
      this._isHumidityRelated(lowerEntityName, lowerFriendlyName, deviceClass, unitOfMeasurement)
    ) {
      return 'mdi:water-percent';
    }

    // Power/Energy sensors
    if (this._isPowerRelated(lowerEntityName, lowerFriendlyName, deviceClass, unitOfMeasurement)) {
      return 'mdi:flash';
    }

    // Network/Signal strength
    if (this._isSignalRelated(lowerEntityName, lowerFriendlyName)) {
      return 'mdi:wifi';
    }

    // Door/Window sensors
    if (
      domain === 'binary_sensor' &&
      this._isDoorWindowRelated(lowerEntityName, lowerFriendlyName)
    ) {
      return state === 'on' ? 'mdi:door-open' : 'mdi:door-closed';
    }

    // Motion sensors
    if (domain === 'binary_sensor' && this._isMotionRelated(lowerEntityName, lowerFriendlyName)) {
      return state === 'on' ? 'mdi:motion-sensor' : 'mdi:motion-sensor-off';
    }

    // Light sensors
    if (
      this._isIlluminanceRelated(lowerEntityName, lowerFriendlyName, deviceClass, unitOfMeasurement)
    ) {
      return 'mdi:brightness-5';
    }

    // Pressure sensors
    if (
      this._isPressureRelated(lowerEntityName, lowerFriendlyName, deviceClass, unitOfMeasurement)
    ) {
      return 'mdi:gauge';
    }

    // Default domain-based icons
    return this._getDefaultIconForDomain(domain, deviceClass, state);
  }

  private static _isBatteryRelated(
    entityName: string,
    friendlyName: string,
    deviceClass?: string,
    unit?: string
  ): boolean {
    return (
      deviceClass === 'battery' ||
      entityName.includes('battery') ||
      entityName.includes('charge') ||
      entityName.includes('power_level') ||
      friendlyName.includes('battery') ||
      friendlyName.includes('charge') ||
      unit === '%'
    );
  }

  private static _isChargingRelated(entityName: string, friendlyName: string): boolean {
    const chargingPatterns = ['charging', 'charge_target', 'charging_target', 'charge_limit'];
    return chargingPatterns.some(
      pattern => entityName.includes(pattern) || friendlyName.toLowerCase().includes(pattern)
    );
  }

  private static _getBatteryIcon(state: string, unit?: string): string {
    const level = parseFloat(state);
    if (isNaN(level)) return 'mdi:battery-unknown';

    if (level >= 95) return 'mdi:battery';
    if (level >= 85) return 'mdi:battery-90';
    if (level >= 75) return 'mdi:battery-80';
    if (level >= 65) return 'mdi:battery-70';
    if (level >= 55) return 'mdi:battery-60';
    if (level >= 45) return 'mdi:battery-50';
    if (level >= 35) return 'mdi:battery-40';
    if (level >= 25) return 'mdi:battery-30';
    if (level >= 15) return 'mdi:battery-20';
    if (level >= 5) return 'mdi:battery-10';
    return 'mdi:battery-alert';
  }

  private static _getChargingBatteryIcon(state: string, unit?: string): string {
    const level = parseFloat(state);
    if (isNaN(level)) return 'mdi:battery-charging';

    if (level >= 95) return 'mdi:battery-charging-100';
    if (level >= 85) return 'mdi:battery-charging-90';
    if (level >= 75) return 'mdi:battery-charging-80';
    if (level >= 65) return 'mdi:battery-charging-70';
    if (level >= 55) return 'mdi:battery-charging-60';
    if (level >= 45) return 'mdi:battery-charging-50';
    if (level >= 35) return 'mdi:battery-charging-40';
    if (level >= 25) return 'mdi:battery-charging-30';
    if (level >= 15) return 'mdi:battery-charging-20';
    if (level >= 5) return 'mdi:battery-charging-10';
    return 'mdi:battery-charging-outline';
  }

  private static _isTemperatureRelated(
    entityName: string,
    friendlyName: string,
    deviceClass?: string,
    unit?: string
  ): boolean {
    return (
      deviceClass === 'temperature' ||
      entityName.includes('temp') ||
      friendlyName.includes('temperature') ||
      unit === '°C' ||
      unit === '°F' ||
      unit === 'K'
    );
  }

  private static _isHumidityRelated(
    entityName: string,
    friendlyName: string,
    deviceClass?: string,
    unit?: string
  ): boolean {
    return (
      deviceClass === 'humidity' ||
      entityName.includes('humidity') ||
      friendlyName.includes('humidity') ||
      (unit === '%' && (entityName.includes('humid') || friendlyName.includes('humid')))
    );
  }

  private static _isPowerRelated(
    entityName: string,
    friendlyName: string,
    deviceClass?: string,
    unit?: string
  ): boolean {
    return (
      deviceClass === 'power' ||
      deviceClass === 'energy' ||
      entityName.includes('power') ||
      entityName.includes('energy') ||
      entityName.includes('consumption') ||
      unit === 'W' ||
      unit === 'kW' ||
      unit === 'kWh' ||
      unit === 'Wh'
    );
  }

  private static _isSignalRelated(entityName: string, friendlyName: string): boolean {
    const patterns = ['signal', 'rssi', 'wifi', 'network'];
    return patterns.some(
      pattern => entityName.includes(pattern) || friendlyName.toLowerCase().includes(pattern)
    );
  }

  private static _isDoorWindowRelated(entityName: string, friendlyName: string): boolean {
    const patterns = ['door', 'window', 'gate'];
    return patterns.some(
      pattern => entityName.includes(pattern) || friendlyName.toLowerCase().includes(pattern)
    );
  }

  private static _isMotionRelated(entityName: string, friendlyName: string): boolean {
    const patterns = ['motion', 'movement', 'occupancy', 'presence'];
    return patterns.some(
      pattern => entityName.includes(pattern) || friendlyName.toLowerCase().includes(pattern)
    );
  }

  private static _isIlluminanceRelated(
    entityName: string,
    friendlyName: string,
    deviceClass?: string,
    unit?: string
  ): boolean {
    return (
      deviceClass === 'illuminance' ||
      entityName.includes('illuminance') ||
      entityName.includes('brightness') ||
      entityName.includes('lux') ||
      unit === 'lx' ||
      unit === 'lux'
    );
  }

  private static _isPressureRelated(
    entityName: string,
    friendlyName: string,
    deviceClass?: string,
    unit?: string
  ): boolean {
    return (
      deviceClass === 'pressure' ||
      entityName.includes('pressure') ||
      friendlyName.includes('pressure') ||
      unit === 'hPa' ||
      unit === 'mbar' ||
      unit === 'Pa' ||
      unit === 'psi'
    );
  }

  private static _getDefaultIconForDomain(
    domain: string,
    deviceClass?: string,
    state?: string
  ): string {
    // Domain-specific default icons
    const domainIcons: Record<string, string> = {
      alarm_control_panel: 'mdi:shield',
      automation: 'mdi:robot',
      binary_sensor: 'mdi:radiobox-blank',
      button: 'mdi:button-pointer',
      calendar: 'mdi:calendar',
      camera: 'mdi:video',
      climate: 'mdi:thermostat',
      cover: 'mdi:window-shutter',
      device_tracker: 'mdi:account',
      fan: 'mdi:fan',
      group: 'mdi:google-circles-communities',
      humidifier: 'mdi:air-humidifier',
      input_boolean: 'mdi:toggle-switch',
      input_button: 'mdi:button-pointer',
      input_datetime: 'mdi:calendar-clock',
      input_number: 'mdi:ray-vertex',
      input_select: 'mdi:format-list-bulleted',
      input_text: 'mdi:form-textbox',
      light: 'mdi:lightbulb',
      lock: 'mdi:lock',
      media_player: 'mdi:speaker',
      number: 'mdi:ray-vertex',
      person: 'mdi:account',
      plant: 'mdi:flower',
      remote: 'mdi:remote',
      scene: 'mdi:palette',
      script: 'mdi:script-text',
      select: 'mdi:format-list-bulleted',
      sensor: 'mdi:eye',
      siren: 'mdi:bullhorn',
      sun: 'mdi:white-balance-sunny',
      switch: 'mdi:toggle-switch',
      timer: 'mdi:timer',
      vacuum: 'mdi:robot-vacuum',
      water_heater: 'mdi:thermometer',
      weather: 'mdi:weather-partly-cloudy',
      zone: 'mdi:map-marker',
    };

    return domainIcons[domain] || 'mdi:eye';
  }
}
