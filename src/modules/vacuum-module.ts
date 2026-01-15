import { TemplateResult, html, nothing, svg, SVGTemplateResult } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant, fireEvent } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, VacuumModule, UltraCardConfig, VacuumRoom, VacuumZone, VacuumDisplaySection, VacuumSectionType } from '../types';

// Entity state type (from home-assistant-js-websocket)
interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
  context: { id: string; parent_id?: string; user_id?: string };
}
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';
import '../components/ultra-color-picker';

/**
 * Vacuum Module - Pro Feature
 *
 * Provides a comprehensive interface for robot vacuum cleaners with:
 * - Multiple layout modes (compact, standard, detailed)
 * - Battery and status display
 * - Cleaning statistics
 * - Component wear indicators
 * - Control buttons with service calls
 * - State-based animations
 * - Map display with swipe gesture
 * - Integration-specific features for Xiaomi/Roborock/Valetudo/Ecovacs/Neato/Roomba
 */
export class UltraVacuumModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'vacuum',
    title: 'Vacuum Control',
    description: 'Interactive vacuum cleaner control with map, stats, and animations',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:robot-vacuum',
    category: 'interactive',
    tags: ['vacuum', 'cleaning', 'robot', 'pro'],
  };

  // Track current view for swipe gesture
  private _currentView: 'vacuum' | 'map' = 'vacuum';
  private _touchStartX: number = 0;
  private _touchStartY: number = 0;
  private _isSwiping: boolean = false;

  // Pointer-drag support for swipe carousel (mouse + touch via Pointer Events)
  private _pointerDown: boolean = false;
  private _pointerStartX: number = 0;
  private _pointerStartY: number = 0;
  private _pointerDeltaX: number = 0;
  private _pointerDragActive: boolean = false;
  private _pointerContainerWidth: number = 0;
  private _pointerRafPending: boolean = false;

  // Track expanded sections for accordion UI (per module instance)
  private _expandedSectionsMap: Map<string, Set<string>> = new Map();
  private _draggedSectionId: string | null = null;
  private _addDropdownOpenMap: Map<string, boolean> = new Map();

  // Section metadata for drag-and-drop card layout
  private static readonly VACUUM_SECTIONS: Record<VacuumSectionType, {
    id: VacuumSectionType;
    icon: string;
    label: string;
    required: boolean;
    defaultEnabled: boolean;
    description: string;
    hasEntityOverride: boolean;
  }> = {
    vacuum_image: {
      id: 'vacuum_image',
      icon: 'mdi:robot-vacuum',
      label: 'Vacuum Image',
      required: false,
      defaultEnabled: true,
      description: 'Animated robot vacuum icon/image',
      hasEntityOverride: false,
    },
    title_status: {
      id: 'title_status',
      icon: 'mdi:format-title',
      label: 'Title & Status',
      required: false,
      defaultEnabled: true,
      description: 'Vacuum name and current status',
      hasEntityOverride: false,
    },
    battery: {
      id: 'battery',
      icon: 'mdi:battery',
      label: 'Battery Level',
      required: false,
      defaultEnabled: false,
      description: 'Battery percentage with icon',
      hasEntityOverride: true,
    },
    current_room: {
      id: 'current_room',
      icon: 'mdi:home-floor-1',
      label: 'Current Room',
      required: false,
      defaultEnabled: false,
      description: 'Room currently being cleaned',
      hasEntityOverride: true,
    },
    fan_speed: {
      id: 'fan_speed',
      icon: 'mdi:fan',
      label: 'Speed',
      required: false,
      defaultEnabled: true,
      description: 'Fan speed control dropdown',
      hasEntityOverride: false,
    },
    current_stats: {
      id: 'current_stats',
      icon: 'mdi:chart-line',
      label: 'Current Session Stats',
      required: false,
      defaultEnabled: false,
      description: 'Current session time and area',
      hasEntityOverride: true,
    },
    last_clean: {
      id: 'last_clean',
      icon: 'mdi:history',
      label: 'Last Cleaning',
      required: false,
      defaultEnabled: false,
      description: 'Last cleaning start/end times',
      hasEntityOverride: true,
    },
    total_stats: {
      id: 'total_stats',
      icon: 'mdi:chart-bar',
      label: 'Lifetime Statistics',
      required: false,
      defaultEnabled: false,
      description: 'Total area, time, and clean count',
      hasEntityOverride: true,
    },
    component_life: {
      id: 'component_life',
      icon: 'mdi:cog-refresh',
      label: 'Component Life',
      required: false,
      defaultEnabled: false,
      description: 'Filter, brush, and sensor wear',
      hasEntityOverride: true,
    },
    errors: {
      id: 'errors',
      icon: 'mdi:alert-circle',
      label: 'Errors',
      required: false,
      defaultEnabled: false,
      description: 'Vacuum and dock error display',
      hasEntityOverride: true,
    },
    dnd: {
      id: 'dnd',
      icon: 'mdi:bell-off',
      label: 'Do Not Disturb',
      required: false,
      defaultEnabled: false,
      description: 'DND mode status and toggle',
      hasEntityOverride: true,
    },
    volume: {
      id: 'volume',
      icon: 'mdi:volume-high',
      label: 'Volume Control',
      required: false,
      defaultEnabled: false,
      description: 'Speaker volume slider',
      hasEntityOverride: true,
    },
    quick_controls: {
      id: 'quick_controls',
      icon: 'mdi:play-pause',
      label: 'Quick Controls',
      required: false,
      defaultEnabled: true,
      description: 'Start, pause, stop, dock buttons',
      hasEntityOverride: false,
    },
    map: {
      id: 'map',
      icon: 'mdi:map',
      label: 'Map Display',
      required: false,
      defaultEnabled: false,
      description: 'Floor map with vacuum position',
      hasEntityOverride: true,
    },
  };

  // Default section order for new modules
  private static readonly DEFAULT_SECTION_ORDER: VacuumSectionType[] = [
    'vacuum_image',
    'title_status',
    'fan_speed',
    'quick_controls',
  ];

  createDefault(id?: string, hass?: HomeAssistant): CardModule {
    return {
      id: id || this.generateId('vacuum'),
      type: 'vacuum',
      entity: '',
      name: '',

      // Additional Entity Sensors (optional, auto-detected when possible)
      battery_entity: '',
      status_entity: '',
      cleaning_binary_entity: '',
      charging_binary_entity: '',
      cleaning_area_entity: '',
      cleaning_time_entity: '',
      current_room_entity: '',
      last_clean_begin_entity: '',
      last_clean_end_entity: '',
      total_cleaning_area_entity: '',
      total_cleaning_time_entity: '',
      total_cleaning_count_entity: '',
      vacuum_error_entity: '',
      dock_error_entity: '',
      volume_entity: '',
      do_not_disturb_entity: '',
      do_not_disturb_begin_entity: '',
      do_not_disturb_end_entity: '',
      selected_map_entity: '',
      map_image_entity: '',
      full_clean_button_entity: '',

      // Layout Configuration
      layout_mode: 'standard',

      // Display Toggles
      show_name: true,
      show_status: true,
      show_battery: true,
      show_cleaning_stats: true,
      show_component_wear: false,
      show_map: false,
      show_controls: true,
      show_current_room: true,
      show_last_clean: true,
      show_total_stats: true,
      show_errors: true,
      show_dnd: false,
      show_volume: false,

      // Component Wear Display
      show_filter_life: true,
      show_main_brush_life: true,
      show_side_brush_life: true,
      show_sensor_life: false,

      // Control Configuration
      control_layout: 'row',
      show_start_button: true,
      show_pause_button: true,
      show_stop_button: true,
      show_dock_button: true,
      show_locate_button: false,
      show_fan_speed: false,
      show_room_selection: false,
      show_zone_cleanup: false,

      // Animation Configuration
      enable_animations: true,
      animation_cleaning: 'spin',
      animation_returning: 'pulse',
      animation_docking: 'slide',
      animation_charging: 'pulse',
      animation_speed: 'normal',

      // Map Display Configuration
      map_display_mode: 'swipe',
      map_height: 200,
      map_border_radius: 12,
      map_refresh_rate: 5,

      // Styling
      vacuum_icon: 'mdi:robot-vacuum',
      vacuum_size: 200,
      icon_size: 80,
      primary_color: 'var(--primary-color)',
      background_style: 'card',
      status_color_cleaning: '#4CAF50',
      status_color_returning: '#2196F3',
      status_color_docked: '#9E9E9E',
      status_color_idle: '#FF9800',
      status_color_error: '#F44336',
      battery_color_high: '#4CAF50',
      battery_color_medium: '#FF9800',
      battery_color_low: '#F44336',
      battery_threshold_medium: 50,
      battery_threshold_low: 20,

      // Integration Detection
      detected_integration: 'generic',

      // Actions
      tap_action: { action: 'default' },
      hold_action: { action: 'default' },
      double_tap_action: { action: 'default' },

      // Hover configuration
      enable_hover_effect: false,

      // Card Layout Sections (drag-and-drop customization)
      // Generate with consistent timestamps
      ...(() => {
        const timestamp = Date.now();
        const sections = UltraVacuumModule.DEFAULT_SECTION_ORDER.map((type, index) => ({
          id: `section_${type}_${timestamp}_${index}`,
          type,
          enabled: UltraVacuumModule.VACUUM_SECTIONS[type].defaultEnabled,
          order: index,
          settings: {},
        }));
        return {
          display_sections: sections,
          section_order: sections.map(s => s.id),
        };
      })(),
    } as VacuumModule;
  }

  /**
   * Detect vacuum integration based on entity attributes
   */
  private detectIntegration(entity: HassEntity): 'generic' | 'xiaomi' | 'roborock' | 'valetudo' | 'ecovacs' | 'neato' | 'roomba' | 'eufy' | 'shark' | 'tuya' {
    if (!entity?.attributes) return 'generic';

    const attrs = entity.attributes;
    const entityId = entity.entity_id || '';
    const modelLower = (attrs.model || '').toLowerCase();

    // Check for specific integrations via attributes or entity patterns
    if (attrs.valetudo_state !== undefined || entityId.includes('valetudo')) {
      return 'valetudo';
    }
    if (modelLower.includes('roborock') || entityId.includes('roborock')) {
      return 'roborock';
    }
    if (modelLower.includes('xiaomi') || entityId.includes('xiaomi') || attrs.main_brush_left !== undefined) {
      return 'xiaomi';
    }
    if (modelLower.includes('ecovacs') || entityId.includes('ecovacs')) {
      return 'ecovacs';
    }
    if (modelLower.includes('neato') || entityId.includes('neato')) {
      return 'neato';
    }
    if (modelLower.includes('roomba') || entityId.includes('roomba') || entityId.includes('irobot')) {
      return 'roomba';
    }
    // Eufy/Robovac - check for Eufy-specific attributes or entity naming
    if (modelLower.includes('eufy') || entityId.includes('eufy') || entityId.includes('robovac') ||
        attrs.boost_iq !== undefined || (typeof attrs.auto_return === 'boolean' && attrs.cleaning_area !== undefined)) {
      return 'eufy';
    }
    // Shark/SharkIQ
    if (modelLower.includes('shark') || entityId.includes('shark')) {
      return 'shark';
    }
    // Tuya - check for tuya platform or entity naming
    if (entityId.includes('tuya') || (attrs as any).platform === 'tuya') {
      return 'tuya';
    }

    return 'generic';
  }

  /**
   * Auto-populate related entities when vacuum entity is selected
   * Uses a multi-phase approach:
   * 1. Brand-specific patterns (Roborock, Xiaomi, Eufy, Shark, Roomba, Tuya, etc.)
   * 2. Fuzzy name matching for unknown brands
   * 3. Device class and unit-based smart detection
   */
  private autoPopulateEntities(vacuumEntityId: string, hass: HomeAssistant): Partial<VacuumModule> {
    if (!vacuumEntityId || !hass?.states) return {};

    // Extract base name from vacuum.entity_id (e.g., vacuum.roborock_q5 -> roborock_q5)
    const baseName = vacuumEntityId.replace('vacuum.', '');
    const updates: Partial<VacuumModule> = {};

    // Helper to check if entity exists
    const entityExists = (entityId: string): boolean => {
      return entityId in hass.states;
    };

    // Helper to find first matching entity from patterns
    const findEntity = (patterns: string[]): string | undefined => {
      for (const pattern of patterns) {
        if (entityExists(pattern)) return pattern;
      }
      return undefined;
    };

    // Normalize a name by removing separators for comparison
    const normalizeName = (name: string): string => {
      return name.toLowerCase().replace(/[-_.\s]/g, '');
    };

    // Generate fuzzy name variants for a base name
    const getFuzzyVariants = (name: string): string[] => {
      const normalized = normalizeName(name);
      const parts = name.split(/[-_.\s]/);
      const variants = [
        name, // Original
        normalized, // No separators
        name.replace(/_/g, '-'), // Underscores to dashes
        name.replace(/-/g, '_'), // Dashes to underscores
        parts.join(''), // Joined without separators
      ];
      // Also try without common suffixes like "_vacuum"
      if (name.includes('_vacuum')) {
        const withoutVacuum = name.replace('_vacuum', '');
        variants.push(withoutVacuum, normalizeName(withoutVacuum));
      }
      if (name.includes('vacuum_')) {
        const withoutVacuum = name.replace('vacuum_', '');
        variants.push(withoutVacuum, normalizeName(withoutVacuum));
      }
      return [...new Set(variants)]; // Deduplicate
    };

    // Fuzzy search: find entity matching any variant of baseName with given suffixes
    const fuzzyFindEntity = (domain: string, suffixes: string[]): string | undefined => {
      const variants = getFuzzyVariants(baseName);
      // First pass: try exact patterns with all variants
      for (const variant of variants) {
        for (const suffix of suffixes) {
          const entityId = `${domain}.${variant}${suffix ? '_' + suffix : ''}`;
          if (entityExists(entityId)) return entityId;
          // Also try without separator before suffix
          const entityIdNoSep = `${domain}.${variant}${suffix}`;
          if (entityExists(entityIdNoSep)) return entityIdNoSep;
        }
      }
      // Second pass: search all entities in domain for fuzzy match
      const normalizedBase = normalizeName(baseName);
      for (const entityId of Object.keys(hass.states)) {
        if (!entityId.startsWith(`${domain}.`)) continue;
        const entityName = entityId.replace(`${domain}.`, '');
        const normalizedEntity = normalizeName(entityName);
        // Check if entity name contains our normalized base name and any suffix
        if (normalizedEntity.includes(normalizedBase)) {
          for (const suffix of suffixes) {
            const normalizedSuffix = normalizeName(suffix);
            if (normalizedEntity.includes(normalizedSuffix)) {
              return entityId;
            }
          }
        }
      }
      return undefined;
    };

    // Smart detection: find by device_class or unit_of_measurement
    const findByDeviceClass = (domain: string, deviceClass: string): string | undefined => {
      const normalizedBase = normalizeName(baseName);
      for (const entityId of Object.keys(hass.states)) {
        if (!entityId.startsWith(`${domain}.`)) continue;
        const entity = hass.states[entityId];
        if (entity?.attributes?.device_class === deviceClass) {
          // Check if this entity is related to our vacuum (contains base name)
          const normalizedEntity = normalizeName(entityId.replace(`${domain}.`, ''));
          if (normalizedEntity.includes(normalizedBase)) {
            return entityId;
          }
        }
      }
      return undefined;
    };

    const findByUnit = (domain: string, units: string[], keywords: string[]): string | undefined => {
      const normalizedBase = normalizeName(baseName);
      for (const entityId of Object.keys(hass.states)) {
        if (!entityId.startsWith(`${domain}.`)) continue;
        const entity = hass.states[entityId];
        const unit = entity?.attributes?.unit_of_measurement || '';
        if (units.includes(unit)) {
          // Check if entity name contains base name and any keyword
          const normalizedEntity = normalizeName(entityId.replace(`${domain}.`, ''));
          if (normalizedEntity.includes(normalizedBase)) {
            for (const keyword of keywords) {
              if (normalizedEntity.includes(normalizeName(keyword))) {
                return entityId;
              }
            }
          }
        }
      }
      return undefined;
    };

    // =====================================================================
    // Phase 1: Brand-specific patterns (comprehensive list)
    // =====================================================================

    // Battery sensor patterns - Extended for all brands
    const batteryPatterns = [
      // Standard patterns
      `sensor.${baseName}_battery`,
      `sensor.${baseName}_battery_level`,
      `sensor.${baseName}_battery_percentage`,
      `sensor.${baseName.replace('_vacuum', '')}_battery`,
      // Roomba/iRobot patterns (often without underscores)
      `sensor.${baseName.replace(/_/g, '')}_battery`,
      `sensor.${baseName.replace(/_/g, '')}_battery_level`,
      // Shark patterns
      `sensor.${baseName}_battery_state`,
      // Tuya patterns
      `sensor.${baseName}_battery_state_of_charge`,
    ];
    let batteryEntity = findEntity(batteryPatterns);
    // Fallback: fuzzy search
    if (!batteryEntity) {
      batteryEntity = fuzzyFindEntity('sensor', ['battery', 'battery_level', 'battery_percentage', 'batt']);
    }
    // Fallback: device_class battery
    if (!batteryEntity) {
      batteryEntity = findByDeviceClass('sensor', 'battery');
    }
    if (batteryEntity) updates.battery_entity = batteryEntity;

    // Status sensor patterns
    const statusPatterns = [
      `sensor.${baseName}_status`,
      `sensor.${baseName}_vacuum_status`,
      `sensor.${baseName}_state`,
      `sensor.${baseName}_cleaning_status`,
    ];
    let statusEntity = findEntity(statusPatterns);
    if (!statusEntity) {
      statusEntity = fuzzyFindEntity('sensor', ['status', 'state', 'vacuum_status']);
    }
    if (statusEntity) updates.status_entity = statusEntity;

    // Cleaning binary sensor
    const cleaningPatterns = [
      `binary_sensor.${baseName}_cleaning`,
      `binary_sensor.${baseName}_is_cleaning`,
      `binary_sensor.${baseName}_running`,
    ];
    let cleaningEntity = findEntity(cleaningPatterns);
    if (!cleaningEntity) {
      cleaningEntity = fuzzyFindEntity('binary_sensor', ['cleaning', 'is_cleaning', 'running']);
    }
    if (cleaningEntity) updates.cleaning_binary_entity = cleaningEntity;

    // Charging binary sensor
    const chargingPatterns = [
      `binary_sensor.${baseName}_charging`,
      `binary_sensor.${baseName}_is_charging`,
      `binary_sensor.${baseName}_docked`,
    ];
    let chargingEntity = findEntity(chargingPatterns);
    if (!chargingEntity) {
      chargingEntity = fuzzyFindEntity('binary_sensor', ['charging', 'is_charging', 'docked']);
    }
    // Fallback: device_class battery_charging
    if (!chargingEntity) {
      chargingEntity = findByDeviceClass('binary_sensor', 'battery_charging');
    }
    if (chargingEntity) updates.charging_binary_entity = chargingEntity;

    // Current room sensor
    const roomPatterns = [
      `sensor.${baseName}_current_room`,
      `sensor.${baseName}_room`,
      `sensor.${baseName}_current_segment`,
    ];
    let roomEntity = findEntity(roomPatterns);
    if (!roomEntity) {
      roomEntity = fuzzyFindEntity('sensor', ['current_room', 'room', 'segment']);
    }
    if (roomEntity) updates.current_room_entity = roomEntity;

    // Cleaning area sensor - Extended for Eufy and Tuya
    const areaPatterns = [
      `sensor.${baseName}_cleaning_area`,
      `sensor.${baseName}_current_clean_area`,
      `sensor.${baseName}_clean_area`,
      `sensor.${baseName}_cleaned_area`,
      `sensor.${baseName}_area_cleaned`,
      // Tuya patterns
      `sensor.${baseName}_total_cleaning_area`,
    ];
    let areaEntity = findEntity(areaPatterns);
    if (!areaEntity) {
      areaEntity = fuzzyFindEntity('sensor', ['cleaning_area', 'clean_area', 'cleaned_area', 'area_cleaned']);
    }
    // Fallback: look for m² or ft² units
    if (!areaEntity) {
      areaEntity = findByUnit('sensor', ['m²', 'ft²', 'sq m', 'sqm'], ['area', 'clean']);
    }
    if (areaEntity) updates.cleaning_area_entity = areaEntity;

    // Cleaning time sensor - Extended for Eufy and Tuya
    const timePatterns = [
      `sensor.${baseName}_cleaning_time`,
      `sensor.${baseName}_current_clean_duration`,
      `sensor.${baseName}_clean_time`,
      `sensor.${baseName}_cleaning_duration`,
      `sensor.${baseName}_duration`,
    ];
    let timeEntity = findEntity(timePatterns);
    if (!timeEntity) {
      timeEntity = fuzzyFindEntity('sensor', ['cleaning_time', 'clean_time', 'duration', 'cleaning_duration']);
    }
    // Fallback: look for time units
    if (!timeEntity) {
      timeEntity = findByUnit('sensor', ['min', 'minutes', 's', 'seconds', 'h', 'hours'], ['time', 'duration', 'clean']);
    }
    if (timeEntity) updates.cleaning_time_entity = timeEntity;

    // Last clean begin/end
    const lastCleanBeginPatterns = [
      `sensor.${baseName}_last_clean_begin`,
      `sensor.${baseName}_last_clean_start`,
      `sensor.${baseName}_last_cleaning_start`,
    ];
    let lastCleanBegin = findEntity(lastCleanBeginPatterns);
    if (!lastCleanBegin) {
      lastCleanBegin = fuzzyFindEntity('sensor', ['last_clean_begin', 'last_clean_start', 'last_cleaning_start']);
    }
    if (lastCleanBegin) updates.last_clean_begin_entity = lastCleanBegin;

    const lastCleanEndPatterns = [
      `sensor.${baseName}_last_clean_end`,
      `sensor.${baseName}_last_clean_finish`,
      `sensor.${baseName}_last_cleaning_end`,
    ];
    let lastCleanEnd = findEntity(lastCleanEndPatterns);
    if (!lastCleanEnd) {
      lastCleanEnd = fuzzyFindEntity('sensor', ['last_clean_end', 'last_clean_finish', 'last_cleaning_end']);
    }
    if (lastCleanEnd) updates.last_clean_end_entity = lastCleanEnd;

    // Total statistics
    const totalAreaPatterns = [
      `sensor.${baseName}_total_cleaning_area`,
      `sensor.${baseName}_total_clean_area`,
      `sensor.${baseName}_lifetime_area`,
    ];
    let totalArea = findEntity(totalAreaPatterns);
    if (!totalArea) {
      totalArea = fuzzyFindEntity('sensor', ['total_cleaning_area', 'total_clean_area', 'lifetime_area', 'total_area']);
    }
    if (totalArea) updates.total_cleaning_area_entity = totalArea;

    const totalTimePatterns = [
      `sensor.${baseName}_total_cleaning_time`,
      `sensor.${baseName}_total_clean_time`,
      `sensor.${baseName}_total_duration`,
      `sensor.${baseName}_lifetime_time`,
    ];
    let totalTime = findEntity(totalTimePatterns);
    if (!totalTime) {
      totalTime = fuzzyFindEntity('sensor', ['total_cleaning_time', 'total_clean_time', 'total_duration', 'lifetime_time']);
    }
    if (totalTime) updates.total_cleaning_time_entity = totalTime;

    const totalCountPatterns = [
      `sensor.${baseName}_total_cleaning_count`,
      `sensor.${baseName}_total_clean_count`,
      `sensor.${baseName}_cleaning_count`,
      `sensor.${baseName}_total_cleans`,
    ];
    let totalCount = findEntity(totalCountPatterns);
    if (!totalCount) {
      totalCount = fuzzyFindEntity('sensor', ['total_cleaning_count', 'total_clean_count', 'cleaning_count', 'total_cleans']);
    }
    if (totalCount) updates.total_cleaning_count_entity = totalCount;

    // Component wear sensors - Extended for Tuya
    const filterPatterns = [
      `sensor.${baseName}_filter_time_left`,
      `sensor.${baseName}_filter_life`,
      `sensor.${baseName}_filter`,
      `sensor.${baseName}_filter_utilization`, // Tuya
      `sensor.${baseName}_hepa_filter_life`,
    ];
    let filterEntity = findEntity(filterPatterns);
    if (!filterEntity) {
      filterEntity = fuzzyFindEntity('sensor', ['filter_time_left', 'filter_life', 'filter', 'filter_utilization', 'hepa_filter']);
    }
    if (filterEntity) updates.filter_entity = filterEntity;

    const mainBrushPatterns = [
      `sensor.${baseName}_main_brush_time_left`,
      `sensor.${baseName}_main_brush_life`,
      `sensor.${baseName}_main_brush`,
      `sensor.${baseName}_brush_utilization`, // Tuya
      `sensor.${baseName}_rolling_brush_life`,
    ];
    let mainBrush = findEntity(mainBrushPatterns);
    if (!mainBrush) {
      mainBrush = fuzzyFindEntity('sensor', ['main_brush_time_left', 'main_brush_life', 'main_brush', 'brush_utilization', 'rolling_brush']);
    }
    if (mainBrush) updates.main_brush_entity = mainBrush;

    const sideBrushPatterns = [
      `sensor.${baseName}_side_brush_time_left`,
      `sensor.${baseName}_side_brush_life`,
      `sensor.${baseName}_side_brush`,
      `sensor.${baseName}_edge_brush_life`,
    ];
    let sideBrush = findEntity(sideBrushPatterns);
    if (!sideBrush) {
      sideBrush = fuzzyFindEntity('sensor', ['side_brush_time_left', 'side_brush_life', 'side_brush', 'edge_brush']);
    }
    if (sideBrush) updates.side_brush_entity = sideBrush;

    const sensorPatterns = [
      `sensor.${baseName}_sensor_time_left`,
      `sensor.${baseName}_sensor_dirty_time_left`,
      `sensor.${baseName}_sensor_life`,
    ];
    let sensorLife = findEntity(sensorPatterns);
    if (!sensorLife) {
      sensorLife = fuzzyFindEntity('sensor', ['sensor_time_left', 'sensor_dirty_time_left', 'sensor_life']);
    }
    if (sensorLife) updates.sensor_entity = sensorLife;

    // Error sensors - Extended for all brands
    const vacuumErrorPatterns = [
      `sensor.${baseName}_vacuum_error`,
      `sensor.${baseName}_error`,
      `sensor.${baseName}_last_error`,
      `sensor.${baseName}_error_code`,
    ];
    let vacuumError = findEntity(vacuumErrorPatterns);
    if (!vacuumError) {
      vacuumError = fuzzyFindEntity('sensor', ['vacuum_error', 'error', 'last_error', 'error_code']);
    }
    if (vacuumError) updates.vacuum_error_entity = vacuumError;

    const dockErrorPatterns = [
      `sensor.${baseName}_dock_error`,
      `sensor.${baseName}_mop_drying_remaining_time`,
      `sensor.${baseName}_dock_status`,
    ];
    let dockError = findEntity(dockErrorPatterns);
    if (!dockError) {
      dockError = fuzzyFindEntity('sensor', ['dock_error', 'mop_drying_remaining_time', 'dock_status']);
    }
    if (dockError) updates.dock_error_entity = dockError;

    // Map image entity
    const mapPatterns = [
      `image.${baseName}_first_floor`,
      `image.${baseName}_map`,
      `image.${baseName}`,
      `camera.${baseName}_map`,
      `camera.${baseName}`,
    ];
    let mapEntity = findEntity(mapPatterns);
    if (!mapEntity) {
      // Fuzzy search for map in image domain
      mapEntity = fuzzyFindEntity('image', ['first_floor', 'map', '']);
      if (!mapEntity) {
        mapEntity = fuzzyFindEntity('camera', ['map', '']);
      }
    }
    if (mapEntity) {
      if (mapEntity.startsWith('image.')) {
        updates.map_image_entity = mapEntity;
      } else {
        updates.map_entity = mapEntity;
      }
    }

    // Volume control
    const volumePatterns = [
      `number.${baseName}_volume`,
      `number.${baseName}_speaker_volume`,
    ];
    let volumeEntity = findEntity(volumePatterns);
    if (!volumeEntity) {
      volumeEntity = fuzzyFindEntity('number', ['volume', 'speaker_volume']);
    }
    if (volumeEntity) updates.volume_entity = volumeEntity;

    // Do not disturb - Extended for Eufy
    const dndPatterns = [
      `switch.${baseName}_do_not_disturb`,
      `switch.${baseName}_dnd`,
      `switch.${baseName}_quiet_hours`,
    ];
    let dndEntity = findEntity(dndPatterns);
    if (!dndEntity) {
      dndEntity = fuzzyFindEntity('switch', ['do_not_disturb', 'dnd', 'quiet_hours']);
    }
    if (dndEntity) updates.do_not_disturb_entity = dndEntity;

    // Selected map
    const selectedMapPatterns = [
      `select.${baseName}_selected_map`,
      `select.${baseName}_map`,
    ];
    let selectedMap = findEntity(selectedMapPatterns);
    if (!selectedMap) {
      selectedMap = fuzzyFindEntity('select', ['selected_map', 'map']);
    }
    if (selectedMap) updates.selected_map_entity = selectedMap;

    // Full clean button
    const fullCleanPatterns = [
      `button.${baseName}_full_cleaning`,
      `button.${baseName}_start_cleaning`,
      `button.${baseName}_start`,
    ];
    let fullClean = findEntity(fullCleanPatterns);
    if (!fullClean) {
      fullClean = fuzzyFindEntity('button', ['full_cleaning', 'start_cleaning', 'start']);
    }
    if (fullClean) updates.full_clean_button_entity = fullClean;

    // Bin/dustbin status (Roomba specific)
    const binPatterns = [
      `binary_sensor.${baseName}_bin_full`,
      `sensor.${baseName}_bin_full`,
      `binary_sensor.${baseName.replace(/_/g, '')}_bin_full`,
    ];
    const binEntity = findEntity(binPatterns);
    // Note: bin_entity would need to be added to VacuumModule type if we want to use it

    return updates;
  }

  /**
   * Render the Card Layout section with drag-and-drop accordion
   */
  private   renderCardLayoutSection(
    vacuumModule: VacuumModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    // Get current sections or create defaults
    const sections = vacuumModule.display_sections || this.getDefaultSections();
    const sectionOrder = vacuumModule.section_order || sections.map(s => s.id);
    const layoutStyle = vacuumModule.card_layout_style || 'single_column';
    const isDoubleColumn = layoutStyle === 'double_column';
    
    // Initialize state maps for this module if not already done
    if (!this._expandedSectionsMap.has(vacuumModule.id)) {
      this._expandedSectionsMap.set(vacuumModule.id, new Set());
    }
    if (!this._addDropdownOpenMap.has(vacuumModule.id)) {
      this._addDropdownOpenMap.set(vacuumModule.id, false);
    }

    // Get available sections that can be added
    const addedSectionTypes = new Set(sections.map(s => s.type));
    const availableSections = Object.values(UltraVacuumModule.VACUUM_SECTIONS)
      .filter(meta => !addedSectionTypes.has(meta.id));

    // For double column layout, separate sections by column
    const leftSections = isDoubleColumn 
      ? sectionOrder.filter(id => {
          const section = sections.find(s => s.id === id);
          return section && (section.column === 'left' || !section.column);
        })
      : sectionOrder;
    const rightSections = isDoubleColumn 
      ? sectionOrder.filter(id => {
          const section = sections.find(s => s.id === id);
          return section && section.column === 'right';
        })
      : [];

    // Drag handlers
    const handleDragStart = (e: DragEvent, sectionId: string) => {
      this._draggedSectionId = sectionId;
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', sectionId);
      }
      (e.target as HTMLElement).style.opacity = '0.4';
    };

    const handleDragEnd = (e: DragEvent) => {
      (e.target as HTMLElement).style.opacity = '';
      this._draggedSectionId = null;
      document.querySelectorAll('.vacuum-section-item.drop-zone-active').forEach(el => {
        el.classList.remove('drop-zone-active');
      });
      document.querySelectorAll('.vacuum-column-drop-zone.active').forEach(el => {
        el.classList.remove('active');
      });
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
    };

    const handleDragEnter = (e: DragEvent) => {
      (e.currentTarget as HTMLElement).classList.add('drop-zone-active');
    };

    const handleDragLeave = (e: DragEvent) => {
      (e.currentTarget as HTMLElement).classList.remove('drop-zone-active');
    };

    // Handle drop on a section item (reorder within column or same list)
    const handleDrop = (e: DragEvent, targetId: string, targetColumn?: 'left' | 'right') => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).classList.remove('drop-zone-active');

      if (!this._draggedSectionId || this._draggedSectionId === targetId) return;

      const draggedSection = sections.find(s => s.id === this._draggedSectionId);
      const targetSection = sections.find(s => s.id === targetId);
      if (!draggedSection || !targetSection) return;

      // Determine which column to place in
      const newColumn = targetColumn || targetSection.column || 'left';

      if (isDoubleColumn) {
        // Get the column-specific order
        const columnOrder = newColumn === 'right' ? [...rightSections] : [...leftSections];
        const otherColumnOrder = newColumn === 'right' ? [...leftSections] : [...rightSections];
        
        // Remove from current position (could be in either column)
        const draggedInColumn = columnOrder.indexOf(this._draggedSectionId);
        const draggedInOther = otherColumnOrder.indexOf(this._draggedSectionId);
        
        if (draggedInColumn !== -1) {
          columnOrder.splice(draggedInColumn, 1);
        }
        if (draggedInOther !== -1) {
          otherColumnOrder.splice(draggedInOther, 1);
        }
        
        // Insert at target position in the target column
        const targetIndex = columnOrder.indexOf(targetId);
        if (targetIndex !== -1) {
          columnOrder.splice(targetIndex, 0, this._draggedSectionId);
        } else {
          columnOrder.push(this._draggedSectionId);
        }
        
        // Rebuild section_order with left column first, then right
        const newOrder = newColumn === 'right' 
          ? [...otherColumnOrder, ...columnOrder]
          : [...columnOrder, ...otherColumnOrder];
        
        // Update sections with new column assignment and order
        const updatedSections = sections.map(s => {
          if (s.id === this._draggedSectionId) {
            return { ...s, column: newColumn, order: newOrder.indexOf(s.id) };
          }
          return { ...s, order: newOrder.indexOf(s.id) };
        });

        updateModule({ display_sections: updatedSections, section_order: newOrder });
      } else {
        // Single column mode - simple reorder
        const currentOrder = [...sectionOrder];
        const draggedIndex = currentOrder.indexOf(this._draggedSectionId);
        const targetIndex = currentOrder.indexOf(targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        currentOrder.splice(draggedIndex, 1);
        currentOrder.splice(targetIndex, 0, this._draggedSectionId);

        const updatedSections = sections.map(s => ({
          ...s,
          order: currentOrder.indexOf(s.id),
        }));

        updateModule({ display_sections: updatedSections, section_order: currentOrder });
      }
      
      this._draggedSectionId = null;
      setTimeout(() => this.triggerPreviewUpdate(), 50);
    };

    // Handle drop on empty column drop zone
    const handleColumnDrop = (e: DragEvent, column: 'left' | 'right') => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).classList.remove('active');
      
      if (!this._draggedSectionId) return;
      
      const columnOrder = column === 'right' ? [...rightSections] : [...leftSections];
      const otherColumnOrder = column === 'right' ? [...leftSections] : [...rightSections];
      
      // Remove from other column
      const draggedInOther = otherColumnOrder.indexOf(this._draggedSectionId);
      if (draggedInOther !== -1) {
        otherColumnOrder.splice(draggedInOther, 1);
      }
      
      // Remove from current column (if somehow there)
      const draggedInColumn = columnOrder.indexOf(this._draggedSectionId);
      if (draggedInColumn !== -1) {
        columnOrder.splice(draggedInColumn, 1);
      }
      
      // Add to end of target column
      columnOrder.push(this._draggedSectionId);
      
      // Rebuild order
      const newOrder = [...otherColumnOrder, ...columnOrder];
      
      const updatedSections = sections.map(s => {
        if (s.id === this._draggedSectionId) {
          return { ...s, column, order: newOrder.indexOf(s.id) };
        }
        return { ...s, order: newOrder.indexOf(s.id) };
      });

      updateModule({ display_sections: updatedSections, section_order: newOrder });
      this._draggedSectionId = null;
      setTimeout(() => this.triggerPreviewUpdate(), 50);
    };

    // Toggle section visibility
    const toggleVisibility = (sectionId: string) => {
      const updatedSections = sections.map(s =>
        s.id === sectionId ? { ...s, enabled: !s.enabled } : s
      );
      updateModule({ display_sections: updatedSections });
      setTimeout(() => this.triggerPreviewUpdate(), 50);
    };

    // Toggle section expanded state
    const toggleExpanded = (sectionId: string) => {
      // Get or create the expanded sections set for this module
      if (!this._expandedSectionsMap.has(vacuumModule.id)) {
        this._expandedSectionsMap.set(vacuumModule.id, new Set());
      }
      const expandedSections = this._expandedSectionsMap.get(vacuumModule.id)!;
      
      if (expandedSections.has(sectionId)) {
        // Collapse this section
        expandedSections.delete(sectionId);
      } else {
        // Expand this section and close all others (only one open at a time)
        expandedSections.clear();
        expandedSections.add(sectionId);
      }
      
      // Trigger re-render by calling update with a harmless property change
      // Use a timestamp to force update without changing functional data
      updateModule({ _ui_refresh: Date.now() } as any);
    };

    // Remove section
    const removeSection = (sectionId: string) => {
      const section = sections.find(s => s.id === sectionId);
      if (!section) return;

      const meta = UltraVacuumModule.VACUUM_SECTIONS[section.type];
      if (meta?.required) return; // Can't remove required sections

      const updatedSections = sections.filter(s => s.id !== sectionId);
      const updatedOrder = sectionOrder.filter(id => id !== sectionId);
      updateModule({ display_sections: updatedSections, section_order: updatedOrder });
      setTimeout(() => this.triggerPreviewUpdate(), 50);
    };

    // Add section
    const addSection = (sectionType: VacuumSectionType) => {
      const meta = UltraVacuumModule.VACUUM_SECTIONS[sectionType];
      if (!meta) return;

      // Auto-populate entity for this section type if vacuum entity exists
      let entityOverride: string | undefined = undefined;
      let moduleEntityUpdates: Partial<VacuumModule> = {};
      if (vacuumModule.entity && meta.hasEntityOverride) {
        const autoPopulated = this.autoPopulateEntities(vacuumModule.entity, hass);
        // Also apply module-level entity fields so the section renders immediately
        moduleEntityUpdates = { ...autoPopulated } as Partial<VacuumModule>;
        
        // Map section type to the appropriate auto-detected entity
        switch (sectionType) {
          case 'battery':
            entityOverride = autoPopulated.battery_entity;
            break;
          case 'current_room':
            entityOverride = autoPopulated.current_room_entity;
            break;
          case 'current_stats':
            entityOverride = autoPopulated.cleaning_area_entity;
            break;
          case 'last_clean':
            entityOverride = autoPopulated.last_clean_begin_entity;
            break;
          case 'total_stats':
            entityOverride = autoPopulated.total_cleaning_area_entity;
            break;
          case 'component_life':
            // For component life, set specific override fields in settings (these are what rendering uses)
            // and also ensure module-level entities are filled for fallback.
            entityOverride = undefined;
            break;
          case 'errors':
            entityOverride = autoPopulated.vacuum_error_entity;
            break;
          case 'dnd':
            entityOverride = autoPopulated.do_not_disturb_entity;
            break;
          case 'volume':
            entityOverride = autoPopulated.volume_entity;
            break;
          case 'map':
            entityOverride = autoPopulated.map_image_entity || autoPopulated.map_entity;
            break;
        }
      }

      const newSection: VacuumDisplaySection = {
        id: `section_${sectionType}_${Date.now()}`,
        type: sectionType,
        enabled: true,
        order: sections.length,
        column: isDoubleColumn ? 'left' : undefined, // Default to left column in double column mode
        settings:
          sectionType === 'component_life'
            ? ({
                filter_entity_override: (moduleEntityUpdates as any).filter_entity,
                main_brush_entity_override: (moduleEntityUpdates as any).main_brush_entity,
                side_brush_entity_override: (moduleEntityUpdates as any).side_brush_entity,
                sensor_entity_override: (moduleEntityUpdates as any).sensor_entity,
              } as any)
            : entityOverride
              ? { entity_override: entityOverride }
              : {},
      };

      const updatedSections = [...sections, newSection];
      const updatedOrder = [...sectionOrder, newSection.id];
      
      // Auto-expand the new section (and close all others)
      if (!this._expandedSectionsMap.has(vacuumModule.id)) {
        this._expandedSectionsMap.set(vacuumModule.id, new Set());
      }
      const expandedSections = this._expandedSectionsMap.get(vacuumModule.id)!;
      expandedSections.clear();
      expandedSections.add(newSection.id);
      
      // Close dropdown
      this._addDropdownOpenMap.set(vacuumModule.id, false);
      
      updateModule({
        ...moduleEntityUpdates,
        display_sections: updatedSections,
        section_order: updatedOrder,
      });
      setTimeout(() => this.triggerPreviewUpdate(), 50);
    };

    // Update section settings
    const updateSectionSettings = (sectionId: string, settings: Partial<VacuumDisplaySection['settings']>) => {
      const updatedSections = sections.map(s =>
        s.id === sectionId ? { ...s, settings: { ...s.settings, ...settings } } : s
      );
      updateModule({ display_sections: updatedSections });
      setTimeout(() => this.triggerPreviewUpdate(), 50);
    };

    // Render individual section accordion
    const renderSectionItem = (sectionId: string, column?: 'left' | 'right') => {
      const section = sections.find(s => s.id === sectionId);
      if (!section) return html``;

      const meta = UltraVacuumModule.VACUUM_SECTIONS[section.type];
      if (!meta) return html``;

      // Get expanded state for this module
      const expandedSections = this._expandedSectionsMap.get(vacuumModule.id) || new Set();
      const isExpanded = expandedSections.has(sectionId);

      return html`
        <div
          class="vacuum-section-item"
          draggable="true"
          @dragstart=${(e: DragEvent) => handleDragStart(e, sectionId)}
          @dragend=${handleDragEnd}
          @dragover=${handleDragOver}
          @dragenter=${handleDragEnter}
          @dragleave=${handleDragLeave}
          @drop=${(e: DragEvent) => handleDrop(e, sectionId, column)}
        >
          <div class="vacuum-section-header ${isExpanded ? 'expanded' : ''}">
            <ha-icon icon="mdi:drag" class="vacuum-drag-handle"></ha-icon>
            <ha-icon icon="${meta.icon}" class="vacuum-section-icon"></ha-icon>
            <span class="vacuum-section-label">${meta.label}</span>
            <ha-icon
              icon="${section.enabled ? 'mdi:eye' : 'mdi:eye-off'}"
              class="vacuum-visibility-toggle ${section.enabled ? 'visible' : 'hidden'}"
              @click=${(e: Event) => { e.stopPropagation(); toggleVisibility(sectionId); }}
            ></ha-icon>
            ${!meta.required ? html`
              <ha-icon
                icon="mdi:delete"
                class="vacuum-delete-btn"
                @click=${(e: Event) => { e.stopPropagation(); removeSection(sectionId); }}
              ></ha-icon>
            ` : ''}
            <ha-icon
              icon="mdi:chevron-${isExpanded ? 'up' : 'down'}"
              class="vacuum-expand-toggle"
              @click=${(e: Event) => { e.stopPropagation(); toggleExpanded(sectionId); }}
            ></ha-icon>
          </div>

          ${isExpanded ? html`
            <div class="vacuum-section-settings">
              ${this.renderSectionSettings(section, hass, updateSectionSettings, vacuumModule)}
            </div>
          ` : ''}
        </div>
      `;
    };

    return html`
      <style>
        .vacuum-card-layout {
          background: var(--secondary-background-color);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .vacuum-section-title {
          font-size: 18px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--primary-color);
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }

        .vacuum-section-description {
          font-size: 13px;
          color: var(--secondary-text-color);
          margin-bottom: 16px;
          line-height: 1.4;
        }

        .vacuum-sections-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .vacuum-section-item {
          background: var(--primary-background-color);
          border-radius: 6px;
          cursor: move;
          border: 2px solid transparent;
          transition: all 0.2s;
        }

        .vacuum-section-item.drop-zone-active {
          border-color: var(--primary-color);
          background: rgba(var(--rgb-primary-color), 0.1);
        }

        .vacuum-section-header {
          display: flex;
          align-items: center;
          padding: 12px;
          gap: 8px;
          cursor: pointer;
        }

        .vacuum-section-header:hover {
          background: rgba(var(--rgb-primary-color), 0.05);
          border-radius: 6px;
        }

        .vacuum-drag-handle {
          --mdc-icon-size: 20px;
          color: var(--secondary-text-color);
          cursor: grab;
        }

        .vacuum-drag-handle:active {
          cursor: grabbing;
        }

        .vacuum-section-icon {
          --mdc-icon-size: 20px;
          color: var(--primary-color);
        }

        .vacuum-section-label {
          flex: 1;
          font-weight: 500;
          color: var(--primary-text-color);
        }

        .vacuum-visibility-toggle {
          --mdc-icon-size: 20px;
          cursor: pointer;
          transition: color 0.2s;
        }

        .vacuum-visibility-toggle.visible {
          color: var(--primary-color);
        }

        .vacuum-visibility-toggle.hidden {
          color: var(--secondary-text-color);
          opacity: 0.5;
        }

        .vacuum-delete-btn {
          --mdc-icon-size: 20px;
          color: var(--error-color, #f44336);
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .vacuum-delete-btn:hover {
          opacity: 1;
        }

        .vacuum-expand-toggle {
          --mdc-icon-size: 20px;
          color: var(--secondary-text-color);
          cursor: pointer;
          transition: transform 0.2s;
        }

        .vacuum-section-settings {
          padding: 12px 12px 16px 12px;
          border-top: 1px solid var(--divider-color);
          background: rgba(var(--rgb-primary-color), 0.02);
        }

        .vacuum-add-section {
          margin-top: 16px;
        }

        .vacuum-add-btn {
          width: 100%;
          padding: 12px;
          border: 2px dashed var(--primary-color);
          background: transparent;
          color: var(--primary-color);
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .vacuum-add-btn:hover {
          background: rgba(var(--rgb-primary-color), 0.1);
        }

        .vacuum-add-dropdown {
          position: relative;
        }

        .vacuum-add-options {
          position: absolute;
          bottom: 100%;
          left: 0;
          right: 0;
          background: var(--primary-background-color);
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          box-shadow: 0 -4px 12px rgba(0,0,0,0.15);
          max-height: 300px;
          overflow-y: auto;
          z-index: 100;
          margin-bottom: 8px;
        }

        .vacuum-add-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .vacuum-add-option:hover {
          background: rgba(var(--rgb-primary-color), 0.1);
        }

        .vacuum-add-option ha-icon {
          --mdc-icon-size: 20px;
          color: var(--primary-color);
        }

        .vacuum-add-option-label {
          flex: 1;
          font-size: 14px;
          color: var(--primary-text-color);
        }

        .vacuum-add-option-desc {
          font-size: 11px;
          color: var(--secondary-text-color);
        }

        .vacuum-setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
        }

        .vacuum-setting-label {
          font-size: 14px;
          color: var(--primary-text-color);
        }

        .vacuum-setting-desc {
          font-size: 12px;
          color: var(--secondary-text-color);
        }
        
        .vacuum-layout-style-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--divider-color);
        }
        
        .vacuum-layout-style-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--primary-text-color);
        }
        
        .vacuum-layout-style-select {
          flex: 1;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid var(--divider-color);
          background: var(--primary-background-color);
          color: var(--primary-text-color);
          font-size: 14px;
          cursor: pointer;
        }
        
        .vacuum-columns-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        
        .vacuum-column {
          background: rgba(var(--rgb-primary-color), 0.03);
          border: 1px dashed var(--divider-color);
          border-radius: 8px;
          padding: 8px;
          min-height: 100px;
        }
        
        .vacuum-column-header {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--secondary-text-color);
          padding: 4px 8px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .vacuum-column-header ha-icon {
          --mdc-icon-size: 16px;
        }
        
        .vacuum-column-sections {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-height: 60px;
        }
        
        .vacuum-column-drop-zone {
          border: 2px dashed var(--divider-color);
          border-radius: 6px;
          padding: 16px;
          text-align: center;
          color: var(--secondary-text-color);
          font-size: 12px;
          transition: all 0.2s;
        }
        
        .vacuum-column-drop-zone.active {
          border-color: var(--primary-color);
          background: rgba(var(--rgb-primary-color), 0.1);
          color: var(--primary-color);
        }
      </style>

      <div class="vacuum-card-layout">
        <div class="vacuum-section-title">Card Layout</div>
        <div class="vacuum-section-description">
          Drag to reorder sections. Click the eye to toggle visibility. Expand to customize settings.
        </div>
        
        <!-- Layout Style Selector -->
        <div class="vacuum-layout-style-row">
          <span class="vacuum-layout-style-label">Layout Style</span>
          <select 
            class="vacuum-layout-style-select"
            @change=${(e: Event) => {
              const select = e.target as HTMLSelectElement;
              const newStyle = select.value as 'single_column' | 'double_column';
              // When switching to single column, clear column assignments
              if (newStyle === 'single_column') {
                const updatedSections = sections.map(s => ({ ...s, column: undefined }));
                updateModule({ card_layout_style: newStyle, display_sections: updatedSections });
              } else {
                // When switching to double column, assign all to left by default
                const updatedSections = sections.map(s => ({ ...s, column: 'left' as const }));
                updateModule({ card_layout_style: newStyle, display_sections: updatedSections });
              }
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }}
          >
            <option value="single_column" ?selected=${layoutStyle === 'single_column'}>Single Column</option>
            <option value="double_column" ?selected=${layoutStyle === 'double_column'}>Double Column</option>
          </select>
        </div>

        ${isDoubleColumn ? html`
          <!-- Double Column Layout -->
          <div class="vacuum-columns-container">
            <!-- Left Column -->
            <div class="vacuum-column">
              <div class="vacuum-column-header">
                <ha-icon icon="mdi:arrow-left-bold-box-outline"></ha-icon>
                Left Column
              </div>
              <div class="vacuum-column-sections">
                ${leftSections.length > 0 
                  ? leftSections.map(sectionId => renderSectionItem(sectionId, 'left'))
                  : html`
                    <div 
                      class="vacuum-column-drop-zone"
                      @dragover=${handleDragOver}
                      @dragenter=${(e: DragEvent) => (e.currentTarget as HTMLElement).classList.add('active')}
                      @dragleave=${(e: DragEvent) => (e.currentTarget as HTMLElement).classList.remove('active')}
                      @drop=${(e: DragEvent) => handleColumnDrop(e, 'left')}
                    >
                      Drop sections here
                    </div>
                  `
                }
                ${leftSections.length > 0 ? html`
                  <div 
                    class="vacuum-column-drop-zone"
                    @dragover=${handleDragOver}
                    @dragenter=${(e: DragEvent) => (e.currentTarget as HTMLElement).classList.add('active')}
                    @dragleave=${(e: DragEvent) => (e.currentTarget as HTMLElement).classList.remove('active')}
                    @drop=${(e: DragEvent) => handleColumnDrop(e, 'left')}
                  >
                    Drop here to add to bottom
                  </div>
                ` : ''}
              </div>
            </div>
            
            <!-- Right Column -->
            <div class="vacuum-column">
              <div class="vacuum-column-header">
                <ha-icon icon="mdi:arrow-right-bold-box-outline"></ha-icon>
                Right Column
              </div>
              <div class="vacuum-column-sections">
                ${rightSections.length > 0 
                  ? rightSections.map(sectionId => renderSectionItem(sectionId, 'right'))
                  : html`
                    <div 
                      class="vacuum-column-drop-zone"
                      @dragover=${handleDragOver}
                      @dragenter=${(e: DragEvent) => (e.currentTarget as HTMLElement).classList.add('active')}
                      @dragleave=${(e: DragEvent) => (e.currentTarget as HTMLElement).classList.remove('active')}
                      @drop=${(e: DragEvent) => handleColumnDrop(e, 'right')}
                    >
                      Drop sections here
                    </div>
                  `
                }
                ${rightSections.length > 0 ? html`
                  <div 
                    class="vacuum-column-drop-zone"
                    @dragover=${handleDragOver}
                    @dragenter=${(e: DragEvent) => (e.currentTarget as HTMLElement).classList.add('active')}
                    @dragleave=${(e: DragEvent) => (e.currentTarget as HTMLElement).classList.remove('active')}
                    @drop=${(e: DragEvent) => handleColumnDrop(e, 'right')}
                  >
                    Drop here to add to bottom
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        ` : html`
          <!-- Single Column Layout -->
          <div class="vacuum-sections-list">
            ${sectionOrder.map(sectionId => renderSectionItem(sectionId))}
          </div>
        `}

        ${availableSections.length > 0 ? html`
          <div class="vacuum-add-section">
            <div class="vacuum-add-dropdown">
              <button
                class="vacuum-add-btn"
                @click=${() => {
                  const currentState = this._addDropdownOpenMap.get(vacuumModule.id) || false;
                  this._addDropdownOpenMap.set(vacuumModule.id, !currentState);
                  updateModule({ display_sections: [...sections] });
                }}
              >
                + Add Section
              </button>
              <div class="vacuum-add-options" style="display: ${this._addDropdownOpenMap.get(vacuumModule.id) ? 'block' : 'none'};">
                ${availableSections.map(meta => html`
                  <div
                    class="vacuum-add-option"
                    @click=${() => addSection(meta.id)}
                  >
                    <ha-icon icon="${meta.icon}"></ha-icon>
                    <div>
                      <div class="vacuum-add-option-label">${meta.label}</div>
                      <div class="vacuum-add-option-desc">${meta.description}</div>
                    </div>
                  </div>
                `)}
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Render settings for a specific section type
   */
  private renderSectionSettings(
    section: VacuumDisplaySection,
    hass: HomeAssistant,
    updateSettings: (sectionId: string, settings: Partial<VacuumDisplaySection['settings']>) => void,
    vacuumModule: VacuumModule
  ): TemplateResult {
    const meta = UltraVacuumModule.VACUUM_SECTIONS[section.type];
    const settings = section.settings || {};

    // Get entity for this section type
    const getEntityForSection = (): string | undefined => {
      switch (section.type) {
        case 'battery': return settings.entity_override || vacuumModule.battery_entity;
        case 'current_room': return settings.entity_override || vacuumModule.current_room_entity;
        case 'current_stats': return settings.entity_override || vacuumModule.cleaning_area_entity;
        case 'last_clean': return settings.entity_override || vacuumModule.last_clean_begin_entity;
        case 'total_stats': return settings.entity_override || vacuumModule.total_cleaning_area_entity;
        case 'component_life': return settings.entity_override || vacuumModule.filter_entity;
        case 'errors': return settings.entity_override || vacuumModule.vacuum_error_entity;
        case 'dnd': return settings.entity_override || vacuumModule.do_not_disturb_entity;
        case 'volume': return settings.entity_override || vacuumModule.volume_entity;
        case 'map': return settings.entity_override || vacuumModule.map_image_entity || vacuumModule.map_entity;
        default: return undefined;
      }
    };

    const currentEntity = getEntityForSection();

    // Common toggle for show_icon
    const renderToggle = (key: string, label: string, defaultValue: boolean = true) => html`
      <div class="vacuum-setting-row">
        <div>
          <div class="vacuum-setting-label">${label}</div>
        </div>
        <ha-switch
          .checked=${settings[key as keyof typeof settings] ?? defaultValue}
          @change=${(e: Event) => {
            const target = e.target as any;
            updateSettings(section.id, { [key]: target.checked });
          }}
        ></ha-switch>
      </div>
    `;

    // Entity override picker (if section supports it)
    const renderEntityOverride = () => {
      if (!meta.hasEntityOverride) return html``;

      return html`
        <div style="margin-top: 12px;">
          <div class="vacuum-setting-label" style="margin-bottom: 8px;">Entity Override</div>
          <div class="vacuum-setting-desc" style="margin-bottom: 8px;">
            Override the auto-detected entity (current: ${currentEntity || 'none'})
          </div>
          ${this.renderUcForm(
            hass,
            { entity_override: settings.entity_override || '' },
            [{ name: 'entity_override', selector: { entity: {} } }],
            (e: CustomEvent) => updateSettings(section.id, { entity_override: e.detail.value.entity_override }),
            false
          )}
        </div>
      `;
    };

    // Color picker
    const renderColorPicker = (key: string, label: string, defaultColor: string = 'var(--primary-color)') => html`
      <div style="margin-top: 12px;">
        <div class="vacuum-setting-label" style="margin-bottom: 8px;">${label}</div>
        <ultra-color-picker
          .value="${settings[key as keyof typeof settings] || defaultColor}"
          .hass="${hass}"
          @value-changed=${(e: CustomEvent) => updateSettings(section.id, { [key]: e.detail.value })}
        ></ultra-color-picker>
      </div>
    `;

    // Margin controls
    const renderMargins = () => html`
      <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--divider-color);">
        <div class="vacuum-setting-label" style="margin-bottom: 12px;">Spacing</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          ${this.renderFieldSection(
            'Top',
            '',
            hass,
            { margin_top: settings.margin_top || 0 },
            [{ name: 'margin_top', selector: { number: { min: -50, max: 50, step: 2, mode: 'box', unit_of_measurement: 'px' } } }],
            (e: CustomEvent) => updateSettings(section.id, { margin_top: e.detail.value.margin_top })
          )}
          ${this.renderFieldSection(
            'Bottom',
            '',
            hass,
            { margin_bottom: settings.margin_bottom || 0 },
            [{ name: 'margin_bottom', selector: { number: { min: -50, max: 50, step: 2, mode: 'box', unit_of_measurement: 'px' } } }],
            (e: CustomEvent) => updateSettings(section.id, { margin_bottom: e.detail.value.margin_bottom })
          )}
          ${this.renderFieldSection(
            'Left',
            '',
            hass,
            { margin_left: settings.margin_left || 0 },
            [{ name: 'margin_left', selector: { number: { min: -50, max: 50, step: 2, mode: 'box', unit_of_measurement: 'px' } } }],
            (e: CustomEvent) => updateSettings(section.id, { margin_left: e.detail.value.margin_left })
          )}
          ${this.renderFieldSection(
            'Right',
            '',
            hass,
            { margin_right: settings.margin_right || 0 },
            [{ name: 'margin_right', selector: { number: { min: -50, max: 50, step: 2, mode: 'box', unit_of_measurement: 'px' } } }],
            (e: CustomEvent) => updateSettings(section.id, { margin_right: e.detail.value.margin_right })
          )}
        </div>
      </div>
    `;

    // Section-specific settings
    switch (section.type) {
      case 'vacuum_image':
        return html`
          <div class="vacuum-setting-desc" style="margin-bottom: 12px;">
            The animated robot vacuum image with spinning brushes
          </div>
          ${this.renderFieldSection(
            'Size',
            'Size of the vacuum image in pixels',
            hass,
            { icon_size: settings.icon_size ?? 200 },
            [{ name: 'icon_size', selector: { number: { min: 60, max: 300, step: 10 } } }],
            (e: CustomEvent) => updateSettings(section.id, { icon_size: e.detail.value.icon_size })
          )}
          ${renderColorPicker('icon_color', 'Primary Color')}
          <div style="margin-top: 12px;">
            <div class="vacuum-setting-label" style="margin-bottom: 8px;">Custom Image</div>
            <div class="vacuum-setting-desc" style="margin-bottom: 8px;">
              Use a custom image instead of the built-in SVG (URL or /local/ path)
            </div>
            ${this.renderUcForm(
              hass,
              { custom_image: (settings as any).custom_image || vacuumModule.custom_vacuum_image || '' },
              [{ name: 'custom_image', selector: { text: {} } }],
              (e: CustomEvent) => updateSettings(section.id, { custom_image: e.detail.value.custom_image } as any),
              false
            )}
          </div>
          ${renderMargins()}
        `;

      case 'title_status':
        return html`
          ${renderToggle('show_label', 'Show Name', true)}
          ${renderToggle('show_value', 'Show Status', true)}
          ${renderColorPicker('label_color', 'Name Color', 'var(--primary-text-color)')}
          ${renderColorPicker('value_color', 'Status Color')}
          ${renderMargins()}
        `;

      case 'battery':
        return html`
          ${renderToggle('show_title', 'Show Section Title', false)}
          ${renderToggle('show_icon', 'Show Battery Icon', true)}
          ${renderToggle('show_percentage', 'Show Percentage', true)}
          ${renderColorPicker('color', 'Color')}
          ${renderEntityOverride()}
          ${renderMargins()}
        `;

      case 'current_room':
        return html`
          ${renderToggle('show_title', 'Show Section Title', false)}
          ${renderToggle('show_icon', 'Show Room Icon', true)}
          ${renderToggle('show_label', 'Show Room Name', true)}
          ${renderColorPicker('color', 'Color')}
          ${renderEntityOverride()}
          ${renderMargins()}
        `;

      case 'fan_speed':
        return html`
          <div class="vacuum-setting-desc" style="margin-bottom: 12px;">
            Speed dropdown selector. The available speeds come from the vacuum entity.
          </div>
          ${this.renderFieldSection(
            'Style',
            'Layout style for the speed control',
            hass,
            { style: settings.style || 'default' },
            [{
              name: 'style',
              selector: {
                select: {
                  options: [
                    { value: 'default', label: 'Default' },
                    { value: 'speed_only', label: 'Speed Only' },
                    { value: 'compact', label: 'Compact' },
                  ],
                },
              },
            }],
            (e: CustomEvent) => updateSettings(section.id, { style: e.detail.value.style })
          )}
          ${renderColorPicker('color', 'Color')}
          ${renderMargins()}
        `;

      case 'current_stats':
        return html`
          ${renderToggle('show_title', 'Show Section Title', true)}
          ${renderToggle('show_icon', 'Show Icons', true)}
          ${renderToggle('show_label', 'Show Labels', true)}
          ${renderColorPicker('color', 'Color')}
          ${renderEntityOverride()}
          ${renderMargins()}
        `;

      case 'last_clean':
        return html`
          ${renderToggle('show_title', 'Show Section Title', true)}
          ${renderToggle('show_icon', 'Show Icons', true)}
          ${renderToggle('show_label', 'Show Labels', true)}
          ${renderColorPicker('color', 'Color')}
          ${renderEntityOverride()}
          ${renderMargins()}
        `;

      case 'total_stats':
        return html`
          ${renderToggle('show_title', 'Show Section Title', true)}
          ${renderToggle('show_icon', 'Show Icons', true)}
          ${renderToggle('show_label', 'Show Labels', true)}
          ${renderColorPicker('color', 'Color')}
          ${renderEntityOverride()}
          ${renderMargins()}
        `;

      case 'component_life':
        return html`
          ${renderToggle('show_filter', 'Show Filter Life', true)}
          ${renderToggle('show_main_brush', 'Show Main Brush Life', true)}
          ${renderToggle('show_side_brush', 'Show Side Brush Life', true)}
          ${renderToggle('show_sensor', 'Show Sensor Life', false)}
          ${renderToggle('show_graph', 'Show Progress Bars', true)}
          ${renderToggle('show_percentage', 'Show Percentages', true)}
          ${renderColorPicker('bar_color', 'Bar Color')}
          
          <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--divider-color);">
            <div class="vacuum-setting-label" style="margin-bottom: 8px;">Entity Overrides</div>
            ${this.renderFieldSection(
              'Filter Entity',
              `Auto-detected: ${vacuumModule.filter_entity || 'none'}`,
              hass,
              { filter_entity_override: settings.filter_entity_override || '' },
              [{ name: 'filter_entity_override', selector: { entity: { domain: 'sensor' } } }],
              (e: CustomEvent) => updateSettings(section.id, { filter_entity_override: e.detail.value.filter_entity_override })
            )}
            ${this.renderFieldSection(
              'Main Brush Entity',
              `Auto-detected: ${vacuumModule.main_brush_entity || 'none'}`,
              hass,
              { main_brush_entity_override: settings.main_brush_entity_override || '' },
              [{ name: 'main_brush_entity_override', selector: { entity: { domain: 'sensor' } } }],
              (e: CustomEvent) => updateSettings(section.id, { main_brush_entity_override: e.detail.value.main_brush_entity_override })
            )}
            ${this.renderFieldSection(
              'Side Brush Entity',
              `Auto-detected: ${vacuumModule.side_brush_entity || 'none'}`,
              hass,
              { side_brush_entity_override: settings.side_brush_entity_override || '' },
              [{ name: 'side_brush_entity_override', selector: { entity: { domain: 'sensor' } } }],
              (e: CustomEvent) => updateSettings(section.id, { side_brush_entity_override: e.detail.value.side_brush_entity_override })
            )}
            ${this.renderFieldSection(
              'Sensor Entity',
              `Auto-detected: ${vacuumModule.sensor_entity || 'none'}`,
              hass,
              { sensor_entity_override: settings.sensor_entity_override || '' },
              [{ name: 'sensor_entity_override', selector: { entity: { domain: 'sensor' } } }],
              (e: CustomEvent) => updateSettings(section.id, { sensor_entity_override: e.detail.value.sensor_entity_override })
            )}
          </div>
          
          ${renderMargins()}
        `;

      case 'errors':
        return html`
          <div class="vacuum-setting-desc" style="margin-bottom: 12px;">
            Displays error messages from the vacuum and dock
          </div>
          ${renderToggle('show_icon', 'Show Error Icon', true)}
          ${renderColorPicker('error_color', 'Error Color', 'var(--error-color, #f44336)')}
          ${renderEntityOverride()}
          ${renderMargins()}
        `;

      case 'dnd':
        return html`
          ${renderToggle('show_icon', 'Show DND Icon', true)}
          ${renderToggle('show_label', 'Show Status Text', true)}
          ${renderColorPicker('button_color', 'Button Color')}
          ${renderEntityOverride()}
          ${renderMargins()}
        `;

      case 'volume':
        return html`
          ${renderToggle('show_icon', 'Show Volume Icon', true)}
          ${renderToggle('show_value', 'Show Volume Level', true)}
          ${renderColorPicker('color', 'Color')}
          ${renderEntityOverride()}
          ${renderMargins()}
        `;

      case 'quick_controls':
        return html`
          ${renderToggle('show_start', 'Show Start Button', true)}
          ${renderToggle('show_pause', 'Show Pause Button', true)}
          ${renderToggle('show_stop', 'Show Stop Button', true)}
          ${renderToggle('show_dock', 'Show Dock Button', true)}
          ${renderToggle('show_locate', 'Show Locate Button', false)}
          ${this.renderFieldSection(
            'Button Layout',
            'Arrangement of control buttons',
            hass,
            { control_layout: settings.control_layout || 'row' },
            [{
              name: 'control_layout',
              selector: {
                select: {
                  options: [
                    { value: 'row', label: 'Row (Default)' },
                    { value: 'grid', label: 'Grid' },
                    { value: 'compact', label: 'Compact (Icons Only)' },
                  ],
                },
              },
            }],
            (e: CustomEvent) => updateSettings(section.id, { control_layout: e.detail.value.control_layout })
          )}
          ${renderColorPicker('button_color', 'Button Color')}
          ${renderMargins()}
        `;

      case 'map':
        const isSwipeMode = settings.display_mode === 'swipe';
        return html`
          <div class="vacuum-setting-desc" style="margin-bottom: 12px;">
            Displays the vacuum's floor map
          </div>
          ${this.renderFieldSection(
            'Display Mode',
            'How the map should be displayed',
            hass,
            { display_mode: settings.display_mode || 'below_vacuum' },
            [{
              name: 'display_mode',
              selector: {
                select: {
                  options: [
                    { value: 'below_vacuum', label: 'Default (Show as Section)' },
                    { value: 'replace_vacuum', label: 'Replace Vacuum Image with Map' },
                    { value: 'swipe', label: 'Swipe to View' },
                  ],
                },
              },
            }],
            (e: CustomEvent) => updateSettings(section.id, { display_mode: e.detail.value.display_mode })
          )}
          ${isSwipeMode ? html`
            <div class="vacuum-setting-desc" style="margin: 8px 0; padding: 8px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 6px; font-size: 12px;">
              <ha-icon icon="mdi:information" style="--mdc-icon-size: 14px; margin-right: 4px;"></ha-icon>
              Map height is automatic in Swipe mode (matches vacuum image size)
            </div>
          ` : this.renderFieldSection(
            'Map Height',
            'Height of the map display in pixels',
            hass,
            { bar_height: settings.bar_height || 200 },
            [{ name: 'bar_height', selector: { number: { min: 100, max: 500, step: 10 } } }],
            (e: CustomEvent) => updateSettings(section.id, { bar_height: e.detail.value.bar_height })
          )}
          ${renderEntityOverride()}
          ${renderMargins()}
        `;

      default:
        return html`
          <div class="vacuum-setting-desc">
            No additional settings for this section type.
          </div>
        `;
    }
  }

  /**
   * Get default sections for new modules
   */
  private getDefaultSections(): VacuumDisplaySection[] {
    const timestamp = Date.now();
    return UltraVacuumModule.DEFAULT_SECTION_ORDER.map((type, index) => ({
      id: `section_${type}_${timestamp}_${index}`,
      type,
      enabled: UltraVacuumModule.VACUUM_SECTIONS[type].defaultEnabled,
      order: index,
      settings: {},
    }));
  }

  /**
   * Render a single section based on its type
   */
  private renderSection(
    section: VacuumDisplaySection,
    module: VacuumModule,
    entity: HassEntity,
    hass: HomeAssistant,
    params: {
      displayName: string;
      state: string;
      batteryLevel: number | null;
      isCharging: boolean;
      statusColor: string;
      animationClass: string;
      vacuumSize: number;
      fanSpeed: string;
      fanSpeedOptions: string[];
      isActive: boolean;
      isDocked: boolean;
    }
  ): TemplateResult {
    if (!section.enabled) return html``;
    
    const settings = section.settings || {};
    
    // Build margin style string
    const marginStyle = [
      settings.margin_top ? `margin-top: ${settings.margin_top}px;` : '',
      settings.margin_right ? `margin-right: ${settings.margin_right}px;` : '',
      settings.margin_bottom ? `margin-bottom: ${settings.margin_bottom}px;` : '',
      settings.margin_left ? `margin-left: ${settings.margin_left}px;` : '',
    ].filter(Boolean).join(' ');

    // Helper to wrap content with margins
    const wrapWithMargins = (content: TemplateResult) => {
      if (!marginStyle) return content;
      return html`<div style="${marginStyle}">${content}</div>`;
    };

    switch (section.type) {
      case 'vacuum_image':
        // Check if map section exists and has 'replace_vacuum' display mode
        const sections = module.display_sections || this.getDefaultSections();
        const mapSection = sections.find(s => s.type === 'map' && s.enabled);
        const shouldShowMap = mapSection?.settings?.display_mode === 'replace_vacuum';
        const showSwipeDots = mapSection?.settings?.display_mode === 'swipe';
        const shouldSwipeReplaceImage = mapSection?.settings?.display_mode === 'swipe';
        
        const imageSize = settings.icon_size ?? 200;
        const customImg = settings.custom_image || module.custom_vacuum_image;

        // If map should replace vacuum, render the map instead
        if (shouldShowMap) {
          return wrapWithMargins(html`
            <div class="vacuum-icon-container">
              ${this.renderMapView(module, hass, mapSection?.settings, true)}
            </div>
          `);
        }

        // Swipe mode is a 2-page carousel inside the image area (vacuum ↔ map)
        if (shouldSwipeReplaceImage) {
          // Track is 200% wide (two pages). To show the 2nd page, translate -50% (not -100%).
          const base = this._currentView === 'map' ? -50 : 0;
          const dragOffset = this._pointerDragActive && this._pointerContainerWidth
            ? (this._pointerDeltaX / this._pointerContainerWidth) * 50
            : 0;
          const translate = Math.max(-50, Math.min(0, base + dragOffset));
          const trackStyle = `transform: translateX(${translate}%);`;
          const mapSettings = { ...(mapSection?.settings || {}), bar_height: imageSize };
          return wrapWithMargins(html`
            <div class="vacuum-icon-container">
              <div
                class="vacuum-swipe-carousel ${this._pointerDragActive ? 'dragging' : ''}"
                style="width: ${imageSize}px; height: ${imageSize}px;"
                @touchstart=${(e: TouchEvent) => this.handleTouchStart(e)}
                @touchmove=${(e: TouchEvent) => this.handleTouchMove(e, true)}
                @touchend=${(e: TouchEvent) => this.handleTouchEnd(e, true)}
                @pointerdown=${(e: PointerEvent) => this.handlePointerDown(e, true)}
                @pointermove=${(e: PointerEvent) => this.handlePointerMove(e, true)}
                @pointerup=${(e: PointerEvent) => this.handlePointerUp(e, true)}
                @pointercancel=${(e: PointerEvent) => this.handlePointerUp(e, true)}
              >
                <div class="vacuum-swipe-track" style="${trackStyle}">
                  <div class="vacuum-swipe-page">
                    ${customImg
                      ? html`
                          <div class="vacuum-image ${params.animationClass}" style="width: ${imageSize}px; height: ${imageSize}px;">
                            <img
                              draggable="false"
                              src="${customImg}"
                              alt="Vacuum"
                              style="width: 100%; height: 100%; object-fit: contain;"
                              @dragstart=${(e: DragEvent) => e.preventDefault()}
                            />
                          </div>
                        `
                      : this.renderVacuumIcon(module, params.animationClass, imageSize, params.isActive, params.isDocked, settings.icon_color)}
                  </div>
                  <div class="vacuum-swipe-page">
                    ${this.renderMapView(module, hass, mapSettings, true)}
                  </div>
                </div>
              </div>
              ${showSwipeDots ? this.renderPaginationDots(settings.icon_color) : ''}
            </div>
          `);
        }

        // If custom image provided, use it
        if (customImg) {
          return wrapWithMargins(html`
            <div 
              class="vacuum-icon-container ${module.entity ? 'clickable' : ''}"
              @click=${module.entity ? (e: Event) => this.showMoreInfo(e, module.entity) : nothing}
            >
              <div class="vacuum-image ${params.animationClass}" style="width: ${imageSize}px; height: ${imageSize}px;">
                <img src="${customImg}" alt="Vacuum" style="width: 100%; height: 100%; object-fit: contain;" />
              </div>
            </div>
          `);
        }
        
        // Otherwise use the animated SVG
        return wrapWithMargins(html`
          <div 
            class="vacuum-icon-container ${module.entity ? 'clickable' : ''}"
            @click=${module.entity ? (e: Event) => this.showMoreInfo(e, module.entity) : nothing}
          >
            ${this.renderVacuumIcon(module, params.animationClass, imageSize, params.isActive, params.isDocked, settings.icon_color)}
          </div>
        `);

      case 'title_status':
        return wrapWithMargins(html`
          <div 
            class="vacuum-header ${module.entity ? 'clickable' : ''}"
            @click=${module.entity ? (e: Event) => this.showMoreInfo(e, module.entity) : nothing}
          >
            ${settings.show_label !== false ? html`
              <div class="vacuum-name" style="${settings.label_color ? `color: ${settings.label_color}` : ''}">
                ${params.displayName}
              </div>
            ` : ''}
            ${settings.show_value !== false ? html`
              <div class="vacuum-status-text" style="color: ${settings.value_color || params.statusColor}">
                ${this.formatState(params.state)}
              </div>
            ` : ''}
          </div>
        `);

      case 'battery':
        if (params.batteryLevel === null) return html``;
        const batteryColor = settings.color || this.getBatteryColor(params.batteryLevel, module);
        const batteryEntityId = settings.entity_override || module.battery_entity;
        return wrapWithMargins(html`
          ${settings.show_title ? html`<div class="stats-section-title">Battery</div>` : ''}
          <div 
            class="vacuum-battery ${batteryEntityId ? 'clickable' : ''}" 
            style="color: ${batteryColor}"
            @click=${batteryEntityId ? (e: Event) => this.showMoreInfo(e, batteryEntityId) : nothing}
          >
            ${settings.show_icon !== false ? html`
              <ha-icon 
                icon="${this.getBatteryIcon(params.batteryLevel, params.isCharging)}"
                style="color: ${batteryColor};"
              ></ha-icon>
            ` : ''}
            ${settings.show_percentage !== false ? html`<span>${params.batteryLevel}%</span>` : ''}
          </div>
        `);

      case 'current_room':
        const roomEntity = settings.entity_override || module.current_room_entity;
        const currentRoom = this.getEntityValue(hass, roomEntity);
        if (!currentRoom) return html``;
        const roomColor = settings.color;
        return wrapWithMargins(html`
          ${settings.show_title ? html`<div class="stats-section-title">Current Room</div>` : ''}
          <div 
            class="vacuum-current-room ${roomEntity ? 'clickable' : ''}"
            @click=${roomEntity ? (e: Event) => this.showMoreInfo(e, roomEntity) : nothing}
          >
            ${settings.show_icon !== false ? html`
              <ha-icon icon="mdi:home-map-marker" style="${roomColor ? `color: ${roomColor}` : ''}"></ha-icon>
            ` : ''}
            ${settings.show_label !== false ? html`<span>${currentRoom}</span>` : ''}
          </div>
        `);

      case 'fan_speed':
        if (params.fanSpeedOptions.length === 0) return html``;
        return wrapWithMargins(this.renderFanSpeedControl(module, entity, hass, params.fanSpeed, params.fanSpeedOptions, settings));

      case 'current_stats':
        // Prefer linked entities (auto-populated), fall back to attributes
        return wrapWithMargins(this.renderCleaningStatsDetailed(entity, module, hass, settings));

      case 'last_clean':
        // Uses module-level entities (auto-populated / user configured)
        return wrapWithMargins(this.renderLastClean(module, hass, settings));

      case 'total_stats':
        // Uses module-level entities (auto-populated / user configured)
        return wrapWithMargins(this.renderTotalStats(module, hass, settings));

      case 'component_life':
        return wrapWithMargins(this.renderComponentWearSection(entity, module, hass, settings));

      case 'errors':
        const errorEntity = settings.entity_override || module.vacuum_error_entity;
        const dockErrorEntity = module.dock_error_entity;
        const vacuumError = this.getEntityValue(hass, errorEntity);
        const dockError = this.getEntityValue(hass, dockErrorEntity);
        const hasError = (vacuumError && vacuumError !== 'none' && vacuumError !== 'ok') || 
                         (dockError && dockError !== 'ok');
        if (!hasError) return html``;
        const errorColor = settings.error_color || 'var(--error-color, #f44336)';
        return wrapWithMargins(html`
          <div 
            class="vacuum-error-banner ${errorEntity ? 'clickable' : ''}" 
            style="background: color-mix(in srgb, ${errorColor} 15%, transparent); border-color: ${errorColor}; color: ${errorColor};"
            @click=${errorEntity ? (e: Event) => this.showMoreInfo(e, errorEntity) : nothing}
          >
            ${settings.show_icon !== false ? html`
              <ha-icon icon="mdi:alert-circle" style="color: ${errorColor};"></ha-icon>
            ` : ''}
            <span>${vacuumError && vacuumError !== 'none' ? this.formatError(vacuumError) : ''}${dockError && dockError !== 'ok' ? ` Dock: ${this.formatError(dockError)}` : ''}</span>
          </div>
        `);

      case 'dnd':
        return wrapWithMargins(this.renderDndStatus(module, hass, settings));

      case 'volume':
        return wrapWithMargins(this.renderVolumeControl(module, hass, settings));

      case 'quick_controls':
        return wrapWithMargins(this.renderControlsSection(module, entity, hass, params.state, params.fanSpeed, params.fanSpeedOptions, settings));

      case 'map':
        const mapDisplayMode = settings.display_mode || 'below_vacuum';
        
        // If display mode is 'replace_vacuum', don't render here (handled in vacuum_image section)
        if (mapDisplayMode === 'replace_vacuum') {
          return html``;
        }
        
        // If display mode is 'swipe', map is rendered inside the vacuum image slot
        if (mapDisplayMode === 'swipe') return html``;
        
        // Default 'below_vacuum' mode - render normally
        const mapEntity = settings.entity_override || module.map_image_entity || module.map_entity;
        return wrapWithMargins(html`
          <div 
            class="${mapEntity ? 'clickable' : ''}"
            @click=${mapEntity ? (e: Event) => this.showMoreInfo(e, mapEntity) : nothing}
          >
            ${this.renderMapView(module, hass, settings)}
          </div>
        `);

      default:
        return html``;
    }
  }

  /**
   * Render component wear with section settings
   */
  private renderComponentWearSection(
    entity: HassEntity,
    module: VacuumModule,
    hass: HomeAssistant,
    settings: VacuumDisplaySection['settings']
  ): TemplateResult {
    const components: { key: string; label: string; icon: string; entity?: string }[] = [];
    
    // Use entity overrides if provided, otherwise use auto-detected entities
    if (settings?.show_filter !== false) {
      const filterEntity = settings?.filter_entity_override || module.filter_entity;
      if (filterEntity) components.push({ key: 'filter', label: 'Filter', icon: 'mdi:air-filter', entity: filterEntity });
    }
    if (settings?.show_main_brush !== false) {
      const mainBrushEntity = settings?.main_brush_entity_override || module.main_brush_entity;
      if (mainBrushEntity) components.push({ key: 'main_brush', label: 'Main Brush', icon: 'mdi:brush', entity: mainBrushEntity });
    }
    if (settings?.show_side_brush !== false) {
      const sideBrushEntity = settings?.side_brush_entity_override || module.side_brush_entity;
      if (sideBrushEntity) components.push({ key: 'side_brush', label: 'Side Brush', icon: 'mdi:asterisk', entity: sideBrushEntity });
    }
    if (settings?.show_sensor !== false) {
      const sensorEntity = settings?.sensor_entity_override || module.sensor_entity;
      if (sensorEntity) components.push({ key: 'sensor', label: 'Sensors', icon: 'mdi:eye', entity: sensorEntity });
    }

    if (components.length === 0) return html``;

    return html`
      <div class="vacuum-component-wear">
        ${components.map(comp => {
          const percentage = this.getComponentWearFromEntity(hass, comp.entity);
          if (percentage === null) return html``;
          
          const color = settings?.bar_color || this.getWearColor(percentage);
          
          return html`
            <div 
              class="wear-item ${comp.entity ? 'clickable' : ''}"
              @click=${comp.entity ? (e: Event) => this.showMoreInfo(e, comp.entity) : nothing}
            >
              <div class="wear-header">
                <ha-icon icon="${comp.icon}"></ha-icon>
                <span class="wear-label">${comp.label}</span>
                ${settings?.show_percentage !== false ? html`
                  <span class="wear-value">${percentage}%</span>
                ` : ''}
              </div>
              ${settings?.show_graph !== false ? html`
                <div class="wear-bar">
                  <div class="wear-progress" style="width: ${percentage}%; background-color: ${color}"></div>
                </div>
              ` : ''}
            </div>
          `;
        })}
      </div>
    `;
  }

  /**
   * Render controls with section settings
   */
  private renderControlsSection(
    module: VacuumModule,
    entity: HassEntity,
    hass: HomeAssistant,
    state: string,
    fanSpeed: string,
    fanSpeedOptions: string[],
    settings?: VacuumDisplaySection['settings']
  ): TemplateResult {
    const showStart = settings?.show_start ?? (module.show_start_button !== false);
    const showPause = settings?.show_pause ?? (module.show_pause_button !== false);
    const showStop = settings?.show_stop ?? (module.show_stop_button !== false);
    const showDock = settings?.show_dock ?? (module.show_dock_button !== false);
    const showLocate = settings?.show_locate ?? (module.show_locate_button || false);
    
    const controlLayout = settings?.control_layout || module.control_layout || 'row';
    const buttonColor = settings?.button_color;
    const buttonStyle = buttonColor ? `color: ${buttonColor}; border-color: ${buttonColor};` : '';
    const compactButtonStyle = buttonColor ? `color: ${buttonColor};` : '';
    
    // Compact mode: just icons in a row, no background or border
    if (controlLayout === 'compact') {
      return html`
        <div class="vacuum-controls compact">
          ${showStart ? html`
            <button
              class="vacuum-control-btn-compact"
              style="${compactButtonStyle}"
              @click=${() => this.handleVacuumCommand('start', entity.entity_id, hass)}
              title="Start"
            >
              <ha-icon icon="mdi:play"></ha-icon>
            </button>
          ` : ''}
          ${showPause ? html`
            <button
              class="vacuum-control-btn-compact"
              style="${compactButtonStyle}"
              @click=${() => this.handleVacuumCommand('pause', entity.entity_id, hass)}
              title="Pause"
            >
              <ha-icon icon="mdi:pause"></ha-icon>
            </button>
          ` : ''}
          ${showStop ? html`
            <button
              class="vacuum-control-btn-compact"
              style="${compactButtonStyle}"
              @click=${() => this.handleVacuumCommand('stop', entity.entity_id, hass)}
              title="Stop"
            >
              <ha-icon icon="mdi:stop"></ha-icon>
            </button>
          ` : ''}
          ${showDock ? html`
            <button
              class="vacuum-control-btn-compact"
              style="${compactButtonStyle}"
              @click=${() => this.handleVacuumCommand('return_to_base', entity.entity_id, hass)}
              title="Return to Dock"
            >
              <ha-icon icon="mdi:home"></ha-icon>
            </button>
          ` : ''}
          ${showLocate ? html`
            <button
              class="vacuum-control-btn-compact"
              style="${compactButtonStyle}"
              @click=${() => this.handleVacuumCommand('locate', entity.entity_id, hass)}
              title="Locate"
            >
              <ha-icon icon="mdi:map-marker"></ha-icon>
            </button>
          ` : ''}
        </div>
      `;
    }
    
    return html`
      <div class="vacuum-controls ${controlLayout}">
        ${showStart ? html`
          <button
            class="vacuum-control-btn"
            style="${buttonStyle}"
            @click=${() => this.handleVacuumCommand('start', entity.entity_id, hass)}
            title="Start"
          >
            <ha-icon icon="mdi:play"></ha-icon>
          </button>
        ` : ''}
        ${showPause ? html`
          <button
            class="vacuum-control-btn"
            style="${buttonStyle}"
            @click=${() => this.handleVacuumCommand('pause', entity.entity_id, hass)}
            title="Pause"
          >
            <ha-icon icon="mdi:pause"></ha-icon>
          </button>
        ` : ''}
        ${showStop ? html`
          <button
            class="vacuum-control-btn"
            style="${buttonStyle}"
            @click=${() => this.handleVacuumCommand('stop', entity.entity_id, hass)}
            title="Stop"
          >
            <ha-icon icon="mdi:stop"></ha-icon>
          </button>
        ` : ''}
        ${showDock ? html`
          <button
            class="vacuum-control-btn"
            style="${buttonStyle}"
            @click=${() => this.handleVacuumCommand('return_to_base', entity.entity_id, hass)}
            title="Return to Dock"
          >
            <ha-icon icon="mdi:home"></ha-icon>
          </button>
        ` : ''}
        ${showLocate ? html`
          <button
            class="vacuum-control-btn"
            style="${buttonStyle}"
            @click=${() => this.handleVacuumCommand('locate', entity.entity_id, hass)}
            title="Locate"
          >
            <ha-icon icon="mdi:map-marker"></ha-icon>
          </button>
        ` : ''}
      </div>
    `;
  }

  /**
   * Get component wear percentage from an entity
   */
  private getComponentWearFromEntity(hass: HomeAssistant, entityId?: string): number | null {
    if (!entityId) return null;
    const entity = hass?.states[entityId];
    if (!entity) return null;
    
    const value = parseFloat(entity.state);
    if (isNaN(value)) return null;
    
    // Normalize - some entities report hours remaining (0-300), some report percentage
    return value > 100 ? Math.round((value / 300) * 100) : Math.round(value);
  }

  /**
   * Render sections based on order for any layout
   */
  private renderSectionsInOrder(
    module: VacuumModule,
    entity: HassEntity,
    hass: HomeAssistant,
    params: {
      displayName: string;
      state: string;
      batteryLevel: number | null;
      isCharging: boolean;
      statusColor: string;
      animationClass: string;
      vacuumSize: number;
      fanSpeed: string;
      fanSpeedOptions: string[];
      isActive: boolean;
      isDocked: boolean;
    }
  ): TemplateResult {
    const sections = module.display_sections || this.getDefaultSections();
    const sectionOrder = module.section_order || sections.map(s => s.id);
    const isDoubleColumn = module.card_layout_style === 'double_column';

    if (isDoubleColumn) {
      // Separate sections by column
      const leftSections = sectionOrder.filter(id => {
        const section = sections.find(s => s.id === id);
        return section && section.enabled && (section.column === 'left' || !section.column);
      });
      const rightSections = sectionOrder.filter(id => {
        const section = sections.find(s => s.id === id);
        return section && section.enabled && section.column === 'right';
      });

      const renderColumn = (sectionIds: string[]) => sectionIds.map(sectionId => {
        const section = sections.find(s => s.id === sectionId);
        if (!section || !section.enabled) return html``;
        return this.renderSection(section, module, entity, hass, params);
      });

      return html`
        <div class="vacuum-double-column-layout">
          <div class="vacuum-column-left">
            ${renderColumn(leftSections)}
          </div>
          <div class="vacuum-column-right">
            ${renderColumn(rightSections)}
          </div>
        </div>
      `;
    }

    // Single column (default)
    return html`
      ${sectionOrder.map(sectionId => {
        const section = sections.find(s => s.id === sectionId);
        if (!section || !section.enabled) return html``;
        return this.renderSection(section, module, entity, hass, params);
      })}
    `;
  }

  /**
   * Get vacuum state from entity
   */
  private getVacuumState(entity: HassEntity): string {
    if (!entity) return 'unavailable';
    return entity.state || 'unknown';
  }

  /**
   * Get battery level from entity attributes
   */
  private getBatteryLevel(entity: HassEntity): number | null {
    if (!entity?.attributes) return null;
    const battery = entity.attributes.battery_level ?? entity.attributes.battery ?? entity.attributes.battery_percentage;
    return typeof battery === 'number' ? battery : null;
  }

  /**
   * Get fan speed options from entity
   */
  private getFanSpeedOptions(entity: HassEntity): string[] {
    if (!entity?.attributes?.fan_speed_list) return [];
    return entity.attributes.fan_speed_list;
  }

  /**
   * Get current fan speed from entity
   */
  private getCurrentFanSpeed(entity: HassEntity): string {
    if (!entity?.attributes?.fan_speed) return '';
    return entity.attributes.fan_speed;
  }

  /**
   * Get status color based on vacuum state
   */
  private getStatusColor(state: string, module: VacuumModule): string {
    const stateMap: Record<string, string> = {
      'cleaning': module.status_color_cleaning || '#4CAF50',
      'docked': module.status_color_docked || '#9E9E9E',
      'returning': module.status_color_returning || '#2196F3',
      'idle': module.status_color_idle || '#FF9800',
      'paused': module.status_color_idle || '#FF9800',
      'error': module.status_color_error || '#F44336',
    };
    return stateMap[state] || 'var(--secondary-text-color)';
  }

  /**
   * Get battery color based on level and thresholds
   */
  private getBatteryColor(level: number | null, module: VacuumModule): string {
    if (level === null) return 'var(--secondary-text-color)';
    const thresholdLow = module.battery_threshold_low ?? 20;
    const thresholdMedium = module.battery_threshold_medium ?? 50;
    
    if (level <= thresholdLow) {
      return module.battery_color_low || '#F44336';
    } else if (level <= thresholdMedium) {
      return module.battery_color_medium || '#FF9800';
    }
    return module.battery_color_high || '#4CAF50';
  }

  /**
   * Get battery icon based on level
   */
  private getBatteryIcon(level: number | null, isCharging: boolean): string {
    if (level === null) return 'mdi:battery-unknown';
    if (isCharging) {
      if (level >= 90) return 'mdi:battery-charging-100';
      if (level >= 80) return 'mdi:battery-charging-80';
      if (level >= 60) return 'mdi:battery-charging-60';
      if (level >= 40) return 'mdi:battery-charging-40';
      if (level >= 20) return 'mdi:battery-charging-20';
      return 'mdi:battery-charging-10';
    }
    if (level >= 90) return 'mdi:battery';
    if (level >= 80) return 'mdi:battery-80';
    if (level >= 60) return 'mdi:battery-60';
    if (level >= 40) return 'mdi:battery-40';
    if (level >= 20) return 'mdi:battery-20';
    if (level >= 10) return 'mdi:battery-10';
    return 'mdi:battery-outline';
  }

  /**
   * Get animation class based on state and configuration
   */
  private getAnimationClass(state: string, module: VacuumModule): string {
    if (!module.enable_animations) return '';
    
    const speed = module.animation_speed || 'normal';
    const speedSuffix = speed === 'slow' ? '-slow' : speed === 'fast' ? '-fast' : '';
    
    switch (state) {
      case 'cleaning':
        const cleaningAnim = module.animation_cleaning || 'spin';
        return cleaningAnim !== 'none' ? `vacuum-anim-${cleaningAnim}${speedSuffix}` : '';
      case 'returning':
        const returningAnim = module.animation_returning || 'pulse';
        return returningAnim !== 'none' ? `vacuum-anim-${returningAnim}${speedSuffix}` : '';
      case 'docked':
        // Check if charging
        const chargingAnim = module.animation_charging || 'pulse';
        return chargingAnim !== 'none' ? `vacuum-anim-${chargingAnim}${speedSuffix}` : '';
      default:
        return '';
    }
  }

  /**
   * Handle vacuum command (start, pause, stop, return_to_base, locate)
   */
  private async handleVacuumCommand(
    command: 'start' | 'pause' | 'stop' | 'return_to_base' | 'locate',
    entity: string,
    hass: HomeAssistant
  ): Promise<void> {
    try {
      await hass.callService('vacuum', command, {
        entity_id: entity,
      });
    } catch (error) {
      console.error(`Vacuum command ${command} failed:`, error);
    }
  }

  /**
   * Handle fan speed change
   */
  private async handleFanSpeedChange(
    speed: string,
    entity: string,
    hass: HomeAssistant
  ): Promise<void> {
    try {
      await hass.callService('vacuum', 'set_fan_speed', {
        entity_id: entity,
        fan_speed: speed,
      });
    } catch (error) {
      console.error('Fan speed change failed:', error);
    }
  }

  /**
   * Handle room cleanup (integration-specific)
   */
  private async handleRoomCleanup(
    roomIds: (string | number)[],
    entity: string,
    hass: HomeAssistant,
    integration: string
  ): Promise<void> {
    try {
      switch (integration) {
        case 'xiaomi':
        case 'roborock':
          await hass.callService('xiaomi_miio', 'vacuum_clean_segment', {
            entity_id: entity,
            segments: roomIds,
          });
          break;
        case 'valetudo':
          await hass.callService('vacuum', 'send_command', {
            entity_id: entity,
            command: 'segment_cleanup',
            params: { segment_ids: roomIds },
          });
          break;
        default:
          // Generic fallback - try send_command
          await hass.callService('vacuum', 'send_command', {
            entity_id: entity,
            command: 'app_segment_clean',
            params: roomIds,
          });
      }
    } catch (error) {
      console.error('Room cleanup failed:', error);
    }
  }

  /**
   * Show more-info dialog for an entity
   */
  private showMoreInfo(e: Event, entityId: string | undefined): void {
    if (!entityId) return;
    e.stopPropagation();
    fireEvent(e.target as HTMLElement, 'hass-more-info', { entityId });
  }

  /**
   * Toggle a switch entity
   */
  private async toggleSwitch(e: Event, entityId: string | undefined, hass: HomeAssistant): Promise<void> {
    if (!entityId || !hass) return;
    e.stopPropagation();
    try {
      const entity = hass.states[entityId];
      const domain = entityId.split('.')[0];
      if (domain === 'switch') {
        await hass.callService('switch', 'toggle', { entity_id: entityId });
      } else if (domain === 'input_boolean') {
        await hass.callService('input_boolean', 'toggle', { entity_id: entityId });
      } else {
        // Fallback: try homeassistant.toggle
        await hass.callService('homeassistant', 'toggle', { entity_id: entityId });
      }
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  }

  /**
   * Get component wear percentage
   */
  private getComponentWear(entity: HassEntity, component: 'filter' | 'main_brush' | 'side_brush' | 'sensor'): number | null {
    if (!entity?.attributes) return null;
    
    const attrMap: Record<string, string[]> = {
      filter: ['filter_left', 'filter_life', 'filter_life_remaining'],
      main_brush: ['main_brush_left', 'main_brush_life', 'main_brush_life_remaining'],
      side_brush: ['side_brush_left', 'side_brush_life', 'side_brush_life_remaining'],
      sensor: ['sensor_dirty_left', 'sensor_life', 'sensor_life_remaining'],
    };

    const attrs = attrMap[component];
    for (const attr of attrs) {
      const value = entity.attributes[attr];
      if (typeof value === 'number') {
        // Normalize to percentage (some report hours, some report percentage)
        return value > 100 ? Math.round((value / 300) * 100) : value;
      }
    }
    return null;
  }

  /**
   * Format time from seconds/minutes to human-readable string
   */
  private formatDuration(value: number | undefined, unit: 'seconds' | 'minutes' = 'minutes'): string {
    if (value === undefined || value === null) return '--';
    
    let totalMinutes = unit === 'seconds' ? Math.floor(value / 60) : value;
    
    if (totalMinutes < 60) {
      return `${totalMinutes}m`;
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  /**
   * Format area (m² or sqft)
   */
  private formatArea(value: number | undefined): string {
    if (value === undefined || value === null) return '--';
    return `${value} m²`;
  }

  // Swipe gesture handlers
  private handleTouchStart(e: TouchEvent): void {
    this._touchStartX = e.touches[0].clientX;
    this._touchStartY = e.touches[0].clientY;
    this._isSwiping = false;
  }

  private handleTouchMove(e: TouchEvent, hasMap: boolean): void {
    if (!hasMap) return;
    
    const deltaX = e.touches[0].clientX - this._touchStartX;
    const deltaY = Math.abs(e.touches[0].clientY - this._touchStartY);
    
    // Only trigger horizontal swipe if movement is more horizontal than vertical
    if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > deltaY) {
      this._isSwiping = true;
      // Prevent the page from hijacking horizontal swipe gestures
      e.preventDefault();
      e.stopPropagation();
    }
  }

  private handleTouchEnd(e: TouchEvent, hasMap: boolean): void {
    if (!hasMap || !this._isSwiping) return;
    
    const deltaX = e.changedTouches[0].clientX - this._touchStartX;
    
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0 && this._currentView === 'vacuum') {
        this._currentView = 'map';
      } else if (deltaX > 0 && this._currentView === 'map') {
        this._currentView = 'vacuum';
      }
      this.triggerPreviewUpdate();
    }
    
    this._isSwiping = false;
  }

  // Pointer handlers for mouse drag + touch swipe on the image carousel
  private handlePointerDown(e: PointerEvent, hasMap: boolean): void {
    if (!hasMap) return;
    // Only respond to primary button for mouse
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    this._pointerDown = true;
    this._pointerDragActive = false;
    this._pointerDeltaX = 0;
    this._pointerStartX = e.clientX;
    this._pointerStartY = e.clientY;

    const el = e.currentTarget as HTMLElement | null;
    if (el) {
      this._pointerContainerWidth = el.getBoundingClientRect().width || 0;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  }

  private handlePointerMove(e: PointerEvent, hasMap: boolean): void {
    if (!hasMap || !this._pointerDown) return;

    const dx = e.clientX - this._pointerStartX;
    const dy = Math.abs(e.clientY - this._pointerStartY);

    // Activate drag only when it's clearly horizontal
    if (!this._pointerDragActive) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > dy) {
        this._pointerDragActive = true;
      } else {
        return;
      }
    }

    // When dragging horizontally, prevent HA from scrolling/stealing the gesture
    e.preventDefault();
    e.stopPropagation();

    this._pointerDeltaX = dx;
    if (!this._pointerRafPending) {
      this._pointerRafPending = true;
      requestAnimationFrame(() => {
        this._pointerRafPending = false;
        this.triggerPreviewUpdate();
      });
    }
  }

  private handlePointerUp(e: PointerEvent, hasMap: boolean): void {
    if (!hasMap) return;

    const el = e.currentTarget as HTMLElement | null;
    if (el) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }

    if (!this._pointerDown) return;

    const dx = this._pointerDeltaX;
    const w = this._pointerContainerWidth || 0;

    if (this._pointerDragActive) {
      const threshold = Math.max(60, w * 0.18);
      if (Math.abs(dx) > threshold) {
        // Drag left -> map, drag right -> vacuum
        this._currentView = dx < 0 ? 'map' : 'vacuum';
      }
    }

    this._pointerDown = false;
    this._pointerDragActive = false;
    this._pointerDeltaX = 0;
    this._pointerContainerWidth = 0;
    this.triggerPreviewUpdate();
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const vacuumModule = module as VacuumModule;

    return html`
      <style>
        ${this.injectUcFormStyles()}
      </style>

      <!-- Entity Configuration -->
      ${this.renderSettingsSection('Entity Configuration', 'Select the vacuum entity to control', [
        {
          title: 'Vacuum Entity',
          description: 'Select a vacuum entity - related sensors will be auto-detected',
          hass,
          data: { entity: vacuumModule.entity || '' },
          schema: [
            {
              name: 'entity',
              selector: { entity: { domain: 'vacuum' } },
            },
          ],
          onChange: (e: CustomEvent) => {
            const newEntity = e.detail.value.entity;
            // Auto-detect integration when entity changes
            const entityState = hass.states[newEntity];
            const detectedIntegration = entityState ? this.detectIntegration(entityState) : 'generic';
            // Auto-populate related entities based on vacuum entity name
            const autoPopulated = this.autoPopulateEntities(newEntity, hass);
            updateModule({ 
              entity: newEntity, 
              detected_integration: detectedIntegration,
              ...autoPopulated
            });
          },
        },
        {
          title: 'Display Name',
          description: 'Custom name to display (leave empty to use entity name)',
          hass,
          data: { name: vacuumModule.name || '' },
          schema: [{ name: 'name', selector: { text: {} } }],
          onChange: (e: CustomEvent) => updateModule({ name: e.detail.value.name }),
        },
      ])}

      <!-- Card Layout Builder -->
      ${this.renderCardLayoutSection(vacuumModule, hass, updateModule)}

      <!-- Animations Toggle -->
      ${this.renderSettingsSection('Animations', 'Control vacuum animations', [
        {
          title: 'Enable Animations',
          description: 'Turn on/off vacuum animations (spinning brushes, dock LED, etc.)',
          hass,
          data: { enable_animations: vacuumModule.enable_animations !== false },
          schema: [this.booleanField('enable_animations')],
          onChange: (e: CustomEvent) => updateModule({ enable_animations: e.detail.value.enable_animations }),
        },
      ])}
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const vacuumModule = module as VacuumModule;
    const entity = hass?.states[vacuumModule.entity];
    
    // Get vacuum data
    const state = this.getVacuumState(entity);
    const batteryLevel = this.getBatteryLevel(entity);
    const isCharging = state === 'docked' && entity?.attributes?.status?.toLowerCase().includes('charg');
    const fanSpeed = this.getCurrentFanSpeed(entity);
    const fanSpeedOptions = this.getFanSpeedOptions(entity);
    
    // Get display name
    const displayName = vacuumModule.name || entity?.attributes?.friendly_name || 'Vacuum';
    
    // Get status color and animation class
    const statusColor = this.getStatusColor(state, vacuumModule);
    const animationClass = this.getAnimationClass(state, vacuumModule);
    
    // Hover effects
    const hoverEffect = (vacuumModule as any)?.hover_effect;
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);
    
    // Map configuration - get display mode from map section settings
    const sections = vacuumModule.display_sections || this.getDefaultSections();
    const mapSection = sections.find(s => s.type === 'map' && s.enabled);
    const mapDisplayMode = mapSection?.settings?.display_mode || 'below_vacuum';
    const mapEntityOverride = mapSection?.settings?.entity_override;
    const hasMap =
      !!(vacuumModule.map_entity || vacuumModule.map_image_entity || mapEntityOverride || vacuumModule.map_card_config);
    
    // Size configuration
    const vacuumSize = vacuumModule.vacuum_size || 120;
    
    // Layout-specific rendering
    const layoutMode = vacuumModule.layout_mode || 'standard';
    
    return html`
      <style>
        ${this.getStyles()}
      </style>
      
      <div 
        class="vacuum-module-container ${hoverEffectClass} layout-${layoutMode} ${mapDisplayMode === 'swipe' ? 'swipe-mode' : ''}"
        @touchstart=${(e: TouchEvent) => this.handleTouchStart(e)}
        @touchmove=${(e: TouchEvent) => this.handleTouchMove(e, !!hasMap && mapDisplayMode === 'swipe')}
        @touchend=${(e: TouchEvent) => this.handleTouchEnd(e, !!hasMap && mapDisplayMode === 'swipe')}
      >
        ${!entity
          ? this.renderNoEntity(vacuumModule)
          : layoutMode === 'compact'
            ? this.renderCompactLayout(vacuumModule, entity, hass, displayName, state, batteryLevel, isCharging, statusColor, animationClass, vacuumSize)
            : layoutMode === 'detailed'
              ? this.renderDetailedLayout(vacuumModule, entity, hass, displayName, state, batteryLevel, isCharging, statusColor, animationClass, vacuumSize, fanSpeed, fanSpeedOptions)
              : this.renderStandardLayout(vacuumModule, entity, hass, displayName, state, batteryLevel, isCharging, statusColor, animationClass, vacuumSize, fanSpeed, fanSpeedOptions)
        }
      </div>
    `;
  }

  private renderNoEntity(module: VacuumModule): TemplateResult {
    return html`
      <div class="vacuum-no-entity">
        <ha-icon icon="mdi:robot-vacuum-alert"></ha-icon>
        <span>No vacuum entity configured</span>
      </div>
    `;
  }

  /**
   * Render pagination dots for swipe mode
   */
  private renderPaginationDots(primaryColor?: string): TemplateResult {
    const isMapView = this._currentView === 'map';
    const activeStyle = primaryColor ? `background: ${primaryColor};` : '';
    
    return html`
      <div class="vacuum-pagination-dots">
        <div 
          class="vacuum-dot ${!isMapView ? 'active' : ''}"
          style="${!isMapView ? activeStyle : ''}"
          @click=${() => { this._currentView = 'vacuum'; this.triggerPreviewUpdate(); }}
          title="Vacuum"
        ></div>
        <div 
          class="vacuum-dot ${isMapView ? 'active' : ''}"
          style="${isMapView ? activeStyle : ''}"
          @click=${() => { this._currentView = 'map'; this.triggerPreviewUpdate(); }}
          title="Map"
        ></div>
      </div>
    `;
  }

  private renderCompactLayout(
    module: VacuumModule,
    entity: HassEntity,
    hass: HomeAssistant,
    displayName: string,
    state: string,
    batteryLevel: number | null,
    isCharging: boolean,
    statusColor: string,
    animationClass: string,
    vacuumSize: number
  ): TemplateResult {
    const isActive = state === 'cleaning' || state === 'returning';
    const isDocked = state === 'docked' || state === 'charging' || isCharging;
    
    // Always use section-based rendering
    const params = {
      displayName,
      state,
      batteryLevel,
      isCharging,
      statusColor,
      animationClass,
      vacuumSize: vacuumSize * 0.6,
      fanSpeed: '',
      fanSpeedOptions: [] as string[],
      isActive,
      isDocked,
    };
    
    return html`
      <div class="vacuum-compact vacuum-sections-layout">
        ${this.renderSectionsInOrder(module, entity, hass, params)}
      </div>
    `;
  }

  private renderStandardLayout(
    module: VacuumModule,
    entity: HassEntity,
    hass: HomeAssistant,
    displayName: string,
    state: string,
    batteryLevel: number | null,
    isCharging: boolean,
    statusColor: string,
    animationClass: string,
    vacuumSize: number,
    fanSpeed: string,
    fanSpeedOptions: string[]
  ): TemplateResult {
    const isActive = state === 'cleaning' || state === 'returning';
    const isDocked = state === 'docked' || state === 'charging' || isCharging;
    
    // Always use section-based rendering
    const params = {
      displayName,
      state,
      batteryLevel,
      isCharging,
      statusColor,
      animationClass,
      vacuumSize,
      fanSpeed,
      fanSpeedOptions,
      isActive,
      isDocked,
    };
    
    return html`
      <div class="vacuum-standard vacuum-sections-layout">
        ${this.renderSectionsInOrder(module, entity, hass, params)}
      </div>
    `;
  }

  private renderDetailedLayout(
    module: VacuumModule,
    entity: HassEntity,
    hass: HomeAssistant,
    displayName: string,
    state: string,
    batteryLevel: number | null,
    isCharging: boolean,
    statusColor: string,
    animationClass: string,
    vacuumSize: number,
    fanSpeed: string,
    fanSpeedOptions: string[]
  ): TemplateResult {
    const isActive = state === 'cleaning' || state === 'returning';
    const isDocked = state === 'docked' || state === 'charging' || isCharging;
    
    // Always use section-based rendering
    const params = {
      displayName,
      state,
      batteryLevel,
      isCharging,
      statusColor,
      animationClass,
      vacuumSize,
      fanSpeed,
      fanSpeedOptions,
      isActive,
      isDocked,
    };
    
    return html`
      <div class="vacuum-detailed vacuum-sections-layout">
        ${this.renderSectionsInOrder(module, entity, hass, params)}
      </div>
    `;
  }

  private renderVacuumIcon(module: VacuumModule, animationClass: string, size: number, isActive: boolean = false, isDocked: boolean = false, primaryColor?: string): TemplateResult {
    const customImage = module.custom_vacuum_image;
    const color = primaryColor || module.primary_color || 'var(--primary-color)';
    
    // Don't apply pulse animation when docked - let the dock LED handle visual feedback
    const finalAnimationClass = isDocked ? '' : animationClass;
    
    // If user provided a custom image, use it
    if (customImage) {
      return html`
        <div class="vacuum-image ${finalAnimationClass}" style="width: ${size}px; height: ${size}px;">
          <img src="${customImage}" alt="Vacuum" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>
      `;
    }
    
    // Use our custom animated SVG vacuum
    return html`
      <div class="vacuum-svg-container ${finalAnimationClass}" style="width: ${size}px; height: ${size}px;">
        ${this.renderVacuumSVG(size, isActive, color, isDocked)}
      </div>
    `;
  }

  /**
   * Render an animated SVG robot vacuum
   * Shows spinning circular brushes underneath the robot with only tips visible
   * Shows dock with charging LED when docked
   */
  private renderVacuumSVG(size: number, isActive: boolean, primaryColor: string, isDocked: boolean = false): TemplateResult {
    // Brush parameters - positioned toward center bottom of robot
    // Robot body is centered at (50, 60) with radius 38
    // Bottom edge at y=98, left edge at x=12, right edge at x=88
    // Position brushes close to center with minimal bristle tips showing
    const leftBrushX = 30;
    const leftBrushY = 85;
    const rightBrushX = 70;
    const rightBrushY = 85;
    const bristleLength = 12; // Very short so only tiny tips show
    const numBristles = 8;
    
    // Generate bristle endpoints for asterisk pattern (evenly spaced)
    // Each bristle is a line from center outward
    const generateBristles = (cx: number, cy: number) => {
      const bristles = [];
      for (let i = 0; i < numBristles; i++) {
        const angle = (i * 360 / numBristles) * (Math.PI / 180);
        const x2 = cx + Math.cos(angle) * bristleLength;
        const y2 = cy + Math.sin(angle) * bristleLength;
        bristles.push({ x1: cx, y1: cy, x2, y2 });
      }
      return bristles;
    };
    
    const leftBristles = generateBristles(leftBrushX, leftBrushY);
    const rightBristles = generateBristles(rightBrushX, rightBrushY);
    
    return html`
      <svg 
        viewBox="5 ${isDocked ? '0' : '20'} 90 ${isDocked ? '105' : '85'}" 
        width="${size}" 
        height="${size}"
        class="vacuum-svg ${isActive ? 'vacuum-svg-active' : ''}"
        style="overflow: visible;"
      >
        <defs>
          <!-- Gradient for the body -->
          <linearGradient id="vacuumBodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color: var(--card-background-color, #3a3a3a); stop-opacity: 1" />
            <stop offset="100%" style="stop-color: var(--secondary-background-color, #2a2a2a); stop-opacity: 1" />
          </linearGradient>
          <!-- Dock gradient -->
          <linearGradient id="dockGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color: var(--secondary-background-color, #444); stop-opacity: 1" />
            <stop offset="100%" style="stop-color: var(--card-background-color, #2a2a2a); stop-opacity: 1" />
          </linearGradient>
          <!-- Shadow filter -->
          <filter id="vacuumShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
        
        <!-- DOCK (shown when docked) -->
        ${isDocked ? html`
          <g class="vacuum-dock">
            <!-- Dock station at top -->
            <path d="M 25 5 L 75 5 L 75 22 Q 75 28 69 28 L 31 28 Q 25 28 25 22 Z" 
                  fill="url(#dockGradient)" 
                  stroke="#666666" 
                  stroke-width="1.5"/>
            <!-- Dock charging contacts -->
            <rect x="38" y="24" width="8" height="6" rx="1" fill="#777777"/>
            <rect x="54" y="24" width="8" height="6" rx="1" fill="#777777"/>
            <!-- Dock LED indicator - slow blinking when charging -->
            <circle cx="50" cy="12" r="3" fill="${primaryColor}" class="vacuum-dock-led"/>
            <!-- Dock brand line -->
            <line x1="35" y1="18" x2="65" y2="18" stroke="#888888" stroke-width="1"/>
          </g>
        ` : ''}
        
        <!-- BRUSHES DRAWN FIRST (underneath the robot body) -->
        
        <!-- Left side brush - thin asterisk pattern with spinning bristles -->
        <g class="vacuum-side-brush-left ${isActive ? 'vacuum-brush-spin' : ''}" style="transform-origin: ${leftBrushX}px ${leftBrushY}px;">
          ${leftBristles.map(b => svg`
            <line x1="${b.x1}" y1="${b.y1}" x2="${b.x2}" y2="${b.y2}" 
                  stroke="${primaryColor}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          `)}
          <circle cx="${leftBrushX}" cy="${leftBrushY}" r="3" 
                  fill="var(--divider-color, #444)" stroke="${primaryColor}" stroke-width="1.5"/>
        </g>
        
        <!-- Right side brush - thin asterisk pattern with spinning bristles -->
        <g class="vacuum-side-brush-right ${isActive ? 'vacuum-brush-spin-reverse' : ''}" style="transform-origin: ${rightBrushX}px ${rightBrushY}px;">
          ${rightBristles.map(b => svg`
            <line x1="${b.x1}" y1="${b.y1}" x2="${b.x2}" y2="${b.y2}" 
                  stroke="${primaryColor}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          `)}
          <circle cx="${rightBrushX}" cy="${rightBrushY}" r="3" 
                  fill="var(--divider-color, #444)" stroke="${primaryColor}" stroke-width="1.5"/>
        </g>
        
        <!-- ROBOT BODY DRAWN ON TOP -->
        
        <!-- Main body - outer ring -->
        <circle 
          cx="50" cy="60" r="38" 
          fill="url(#vacuumBodyGradient)" 
          stroke="var(--divider-color, #555)" 
          stroke-width="2"
          filter="url(#vacuumShadow)"
        />
        
        <!-- Inner body ring -->
        <circle 
          cx="50" cy="60" r="31" 
          fill="none" 
          stroke="var(--divider-color, #444)" 
          stroke-width="1.5"
        />
        
        <!-- Top sensor/LiDAR bump -->
        <circle 
          cx="50" cy="30" r="6" 
          fill="var(--secondary-background-color, #333)"
          stroke="var(--divider-color, #555)" 
          stroke-width="1.5"
        />
        <circle 
          cx="50" cy="30" r="3" 
          fill="${primaryColor}"
          class="${isActive ? 'vacuum-sensor-blink' : ''}"
        />
        
        <!-- Center dust bin area - positioned in lower half -->
        <ellipse 
          cx="50" cy="73" rx="12" ry="8" 
          fill="var(--secondary-background-color, #333)"
          stroke="var(--divider-color, #555)" 
          stroke-width="1"
        />
        
        <!-- Horizontal divider line -->
        <line 
          x1="22" y1="55" x2="78" y2="55" 
          stroke="var(--divider-color, #555)" 
          stroke-width="1.5"
          stroke-linecap="round"
        />
        
        <!-- Status LED indicator -->
        <circle 
          cx="50" cy="44" r="3" 
          fill="${isActive ? primaryColor : (isDocked ? primaryColor : 'var(--divider-color, #555)')}"
          class="${isActive ? 'vacuum-status-led' : (isDocked ? 'vacuum-charging-led' : '')}"
        />

        <!-- Dock arc overlay (drawn on top of robot so it isn't hidden by the body) -->
        ${isDocked ? svg`
          <g class="vacuum-dock-arc-group">
            <!-- Single blue arc positioned at the TOP of the robot -->
            <!-- Slightly lower than the absolute top so glow isn't clipped by the image container -->
            <path d="M 12 32 Q 50 2 88 32"
                  fill="none"
                  stroke="${primaryColor}"
                  stroke-width="6"
                  stroke-linecap="round"
                  class="vacuum-dock-arc-pulse"
                  style="color: ${primaryColor};" />
          </g>
        ` : ''}
      </svg>
    `;
  }

  private formatState(state: string): string {
    const stateMap: Record<string, string> = {
      'cleaning': 'Cleaning',
      'docked': 'Docked',
      'returning': 'Returning',
      'idle': 'Idle',
      'paused': 'Paused',
      'error': 'Error',
      'unavailable': 'Unavailable',
      'unknown': 'Unknown',
    };
    return stateMap[state] || state.charAt(0).toUpperCase() + state.slice(1);
  }

  private renderCleaningStats(entity: HassEntity, module: VacuumModule): TemplateResult {
    const attrs = entity?.attributes || {};
    const cleaningTime = attrs.cleaning_time ?? attrs.clean_time ?? attrs.total_cleaning_time;
    const cleanedArea = attrs.cleaned_area ?? attrs.clean_area ?? attrs.total_cleaned_area;
    
    if (cleaningTime === undefined && cleanedArea === undefined) {
      return html``;
    }
    
    return html`
      <div class="vacuum-stats">
        ${cleaningTime !== undefined
          ? html`
              <div class="vacuum-stat">
                <ha-icon icon="mdi:clock-outline"></ha-icon>
                <span>${this.formatDuration(cleaningTime)}</span>
              </div>
            `
          : ''
        }
        ${cleanedArea !== undefined
          ? html`
              <div class="vacuum-stat">
                <ha-icon icon="mdi:texture-box"></ha-icon>
                <span>${this.formatArea(cleanedArea)}</span>
              </div>
            `
          : ''
        }
      </div>
    `;
  }

  /**
   * Get a value from a linked entity
   */
  private getEntityValue(hass: HomeAssistant, entityId?: string): string | null {
    if (!entityId || !hass.states[entityId]) return null;
    return hass.states[entityId].state;
  }

  /**
   * Get numeric value from a linked entity
   */
  private getEntityNumericValue(hass: HomeAssistant, entityId?: string): number | null {
    const value = this.getEntityValue(hass, entityId);
    if (value === null || value === 'unavailable' || value === 'unknown') return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }

  /**
   * Format error strings into human-readable format
   */
  private formatError(error: string): string {
    if (!error || error === 'none' || error === 'ok') return '';
    // Convert snake_case to Title Case
    return error
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private renderCleaningStatsDetailed(entity: HassEntity, module: VacuumModule, hass: HomeAssistant, settings?: VacuumDisplaySection['settings']): TemplateResult {
    const attrs = entity?.attributes || {};
    
    // Get entity references for click handling
    const timeEntity = module.cleaning_time_entity;
    const areaEntity = module.cleaning_area_entity;
    
    // Try linked entities first, fallback to attributes
    // Supports: Roborock, Xiaomi, Eufy, Shark, Roomba, Tuya naming conventions
    const cleaningTime = this.getEntityNumericValue(hass, timeEntity) ?? 
                         attrs.cleaning_time ?? attrs.clean_time ?? attrs.cleanTime ?? attrs.duration;
    const cleanedArea = this.getEntityNumericValue(hass, areaEntity) ?? 
                        attrs.cleaned_area ?? attrs.clean_area ?? attrs.cleaning_area ?? attrs.area_cleaned;
    
    if (cleaningTime === undefined && cleanedArea === undefined) {
      return html``;
    }
    
    const showTitle = settings?.show_title !== false;
    const showIcon = settings?.show_icon !== false;
    const showLabel = settings?.show_label !== false;
    const color = settings?.color;
    const iconStyle = color ? `color: ${color};` : '';
    
    return html`
      <div class="vacuum-stats-detailed">
        ${showTitle ? html`<div class="stats-section-title">Current Session</div>` : ''}
        <div class="stats-row">
          ${cleaningTime !== undefined && cleaningTime !== null
            ? html`
                <div 
                  class="stat-item ${timeEntity ? 'clickable' : ''}"
                  @click=${timeEntity ? (e: Event) => this.showMoreInfo(e, timeEntity) : nothing}
                >
                  ${showIcon ? html`<ha-icon icon="mdi:clock-outline" style="${iconStyle}"></ha-icon>` : ''}
                  <div class="stat-value">${this.formatDuration(cleaningTime)}</div>
                  ${showLabel ? html`<div class="stat-label">Time</div>` : ''}
                </div>
              `
            : ''
          }
          ${cleanedArea !== undefined && cleanedArea !== null
            ? html`
                <div 
                  class="stat-item ${areaEntity ? 'clickable' : ''}"
                  @click=${areaEntity ? (e: Event) => this.showMoreInfo(e, areaEntity) : nothing}
                >
                  ${showIcon ? html`<ha-icon icon="mdi:texture-box" style="${iconStyle}"></ha-icon>` : ''}
                  <div class="stat-value">${this.formatArea(cleanedArea)}</div>
                  ${showLabel ? html`<div class="stat-label">Area</div>` : ''}
                </div>
              `
            : ''
          }
        </div>
      </div>
    `;
  }

  private renderLastClean(module: VacuumModule, hass: HomeAssistant, settings?: VacuumDisplaySection['settings']): TemplateResult {
    const beginEntity = module.last_clean_begin_entity;
    const endEntity = module.last_clean_end_entity;
    const lastBegin = this.getEntityValue(hass, beginEntity);
    const lastEnd = this.getEntityValue(hass, endEntity);
    
    if (!lastBegin && !lastEnd) return html``;
    
    const showTitle = settings?.show_title !== false;
    const showIcon = settings?.show_icon !== false;
    const showLabel = settings?.show_label !== false;
    const color = settings?.color;
    const iconStyle = color ? `color: ${color};` : '';
    
    const formatTimestamp = (ts: string | null): string => {
      if (!ts) return '';
      try {
        const date = new Date(ts);
        return date.toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });
      } catch {
        return ts;
      }
    };
    
    return html`
      <div class="vacuum-last-clean">
        ${showTitle ? html`<div class="stats-section-title">Last Cleaning</div>` : ''}
        <div class="last-clean-times">
          ${lastBegin
            ? html`
                <div 
                  class="time-item ${beginEntity ? 'clickable' : ''}"
                  @click=${beginEntity ? (e: Event) => this.showMoreInfo(e, beginEntity) : nothing}
                >
                  ${showIcon ? html`<ha-icon icon="mdi:play-circle-outline" style="${iconStyle}"></ha-icon>` : ''}
                  ${showLabel ? html`<span>${formatTimestamp(lastBegin)}</span>` : ''}
                </div>
              `
            : ''
          }
          ${lastEnd
            ? html`
                <div 
                  class="time-item ${endEntity ? 'clickable' : ''}"
                  @click=${endEntity ? (e: Event) => this.showMoreInfo(e, endEntity) : nothing}
                >
                  ${showIcon ? html`<ha-icon icon="mdi:stop-circle-outline" style="${iconStyle}"></ha-icon>` : ''}
                  ${showLabel ? html`<span>${formatTimestamp(lastEnd)}</span>` : ''}
                </div>
              `
            : ''
          }
        </div>
      </div>
    `;
  }

  private renderTotalStats(module: VacuumModule, hass: HomeAssistant, settings?: VacuumDisplaySection['settings']): TemplateResult {
    // Get vacuum entity attributes as fallback (for Eufy, Roomba, and others that use attributes)
    const vacuumEntity = module.entity ? hass?.states[module.entity] : null;
    const attrs = vacuumEntity?.attributes || {};
    
    // Try linked entities first, fallback to vacuum entity attributes
    const totalAreaEntity = module.total_cleaning_area_entity;
    const totalTimeEntity = module.total_cleaning_time_entity;
    const totalCountEntity = module.total_cleaning_count_entity;
    
    const totalArea = this.getEntityNumericValue(hass, totalAreaEntity) ??
                      attrs.total_cleaning_area ?? attrs.total_clean_area ?? attrs.lifetime_area;
    const totalTime = this.getEntityNumericValue(hass, totalTimeEntity) ??
                      attrs.total_cleaning_time ?? attrs.total_clean_time ?? attrs.lifetime_time;
    const totalCount = this.getEntityNumericValue(hass, totalCountEntity) ??
                       attrs.total_cleaning_count ?? attrs.total_clean_count ?? attrs.total_cleans ?? attrs.cleaning_count;
    
    if (totalArea === null && totalTime === null && totalCount === null) return html``;
    
    const showTitle = settings?.show_title !== false;
    const showIcon = settings?.show_icon !== false;
    const showLabel = settings?.show_label !== false;
    const color = settings?.color;
    const iconStyle = color ? `color: ${color};` : '';
    
    return html`
      <div class="vacuum-total-stats">
        ${showTitle ? html`<div class="stats-section-title">Lifetime Statistics</div>` : ''}
        <div class="stats-row">
          ${totalTime !== null
            ? html`
                <div 
                  class="stat-item ${totalTimeEntity ? 'clickable' : ''}"
                  @click=${totalTimeEntity ? (e: Event) => this.showMoreInfo(e, totalTimeEntity) : nothing}
                >
                  ${showIcon ? html`<ha-icon icon="mdi:clock-check-outline" style="${iconStyle}"></ha-icon>` : ''}
                  <div class="stat-value">${this.formatDuration(totalTime * 60)}</div>
                  ${showLabel ? html`<div class="stat-label">Total Time</div>` : ''}
                </div>
              `
            : ''
          }
          ${totalArea !== null
            ? html`
                <div 
                  class="stat-item ${totalAreaEntity ? 'clickable' : ''}"
                  @click=${totalAreaEntity ? (e: Event) => this.showMoreInfo(e, totalAreaEntity) : nothing}
                >
                  ${showIcon ? html`<ha-icon icon="mdi:floor-plan" style="${iconStyle}"></ha-icon>` : ''}
                  <div class="stat-value">${this.formatArea(totalArea)}</div>
                  ${showLabel ? html`<div class="stat-label">Total Area</div>` : ''}
                </div>
              `
            : ''
          }
          ${totalCount !== null
            ? html`
                <div 
                  class="stat-item ${totalCountEntity ? 'clickable' : ''}"
                  @click=${totalCountEntity ? (e: Event) => this.showMoreInfo(e, totalCountEntity) : nothing}
                >
                  ${showIcon ? html`<ha-icon icon="mdi:counter" style="${iconStyle}"></ha-icon>` : ''}
                  <div class="stat-value">${totalCount}</div>
                  ${showLabel ? html`<div class="stat-label">Sessions</div>` : ''}
                </div>
              `
            : ''
          }
        </div>
      </div>
    `;
  }

  private renderDndStatus(module: VacuumModule, hass: HomeAssistant, settings?: VacuumDisplaySection['settings']): TemplateResult {
    // Get vacuum entity attributes as fallback (for Eufy which uses do_not_disturb as boolean attribute)
    const vacuumEntity = module.entity ? hass?.states[module.entity] : null;
    const attrs = vacuumEntity?.attributes || {};
    
    const dndEntityId = settings?.entity_override || module.do_not_disturb_entity;
    let dndState = this.getEntityValue(hass, dndEntityId);
    // Fallback to vacuum entity attributes for Eufy and similar
    if (dndState === null && attrs.do_not_disturb !== undefined) {
      dndState = attrs.do_not_disturb ? 'on' : 'off';
    }
    const beginTime = this.getEntityValue(hass, module.do_not_disturb_begin_entity);
    const endTime = this.getEntityValue(hass, module.do_not_disturb_end_entity);
    
    if (dndState === null) return html``;
    
    const isOn = dndState === 'on' || String(dndState) === 'true';
    const showIcon = settings?.show_icon !== false;
    const showLabel = settings?.show_label !== false;
    const buttonColor = settings?.button_color || 'var(--primary-color)';
    const activeColor = isOn ? buttonColor : 'var(--disabled-color, #9e9e9e)';
    const buttonStyle = `background: ${activeColor}; border-color: ${activeColor}; color: var(--text-primary-color, #fff);`;
    // DND is toggleable if we have a switch entity
    const isToggleable = dndEntityId && (dndEntityId.startsWith('switch.') || dndEntityId.startsWith('input_boolean.'));
    
    return html`
      <div 
        class="vacuum-dnd-status ${isOn ? 'dnd-active' : ''} ${isToggleable ? 'clickable' : ''}" 
        style="${buttonStyle} border-radius: 8px; padding: 8px 12px; cursor: ${isToggleable ? 'pointer' : 'default'};"
        @click=${isToggleable ? (e: Event) => this.toggleSwitch(e, dndEntityId, hass) : nothing}
      >
        <div class="dnd-header" style="display: flex; align-items: center; gap: 8px;">
          ${showIcon ? html`<ha-icon icon="${isOn ? 'mdi:bell-off' : 'mdi:bell'}" style="color: inherit;"></ha-icon>` : ''}
          ${showLabel ? html`<span>Do Not Disturb: ${isOn ? 'On' : 'Off'}</span>` : ''}
        </div>
        ${beginTime && endTime && showLabel
          ? html`<div class="dnd-times" style="opacity: 0.8; font-size: 0.85em; margin-top: 4px;">${beginTime} - ${endTime}</div>`
          : ''
        }
      </div>
    `;
  }

  private renderVolumeControl(module: VacuumModule, hass: HomeAssistant, settings?: VacuumDisplaySection['settings']): TemplateResult {
    const volumeEntityId = settings?.entity_override || module.volume_entity;
    const volume = this.getEntityNumericValue(hass, volumeEntityId);
    
    if (volume === null) return html``;
    
    const showIcon = settings?.show_icon !== false;
    const showValue = settings?.show_value !== false;
    const color = settings?.color || 'var(--primary-color)';
    
    return html`
      <div 
        class="vacuum-volume ${volumeEntityId ? 'clickable' : ''}"
        @click=${volumeEntityId ? (e: Event) => this.showMoreInfo(e, volumeEntityId) : nothing}
      >
        <div class="volume-header">
          ${showIcon ? html`<ha-icon icon="mdi:volume-high" style="color: ${color};"></ha-icon>` : ''}
          ${showValue ? html`<span>Volume: ${volume}%</span>` : ''}
        </div>
        <div class="volume-bar">
          <div class="volume-bar-fill" style="width: ${volume}%; background: ${color};"></div>
        </div>
      </div>
    `;
  }

  private renderComponentWear(entity: HassEntity, module: VacuumModule, hass?: HomeAssistant): TemplateResult {
    // Get from linked entities first (time left in hours), fallback to entity attributes
    const filterTimeLeft = hass ? this.getEntityNumericValue(hass, module.filter_entity) : null;
    const mainBrushTimeLeft = hass ? this.getEntityNumericValue(hass, module.main_brush_entity) : null;
    const sideBrushTimeLeft = hass ? this.getEntityNumericValue(hass, module.side_brush_entity) : null;
    const sensorTimeLeft = hass ? this.getEntityNumericValue(hass, module.sensor_entity) : null;
    
    // Calculate percentage from time left (assuming max is ~300 hours for most components)
    const timeToPercent = (timeLeft: number | null, maxHours: number = 300): number | null => {
      if (timeLeft === null) return null;
      // If negative, show 0%
      if (timeLeft < 0) return 0;
      return Math.min(100, Math.round((timeLeft / maxHours) * 100));
    };
    
    const filterLife = module.show_filter_life !== false 
      ? (filterTimeLeft !== null ? timeToPercent(filterTimeLeft, 150) : this.getComponentWear(entity, 'filter'))
      : null;
    const mainBrushLife = module.show_main_brush_life !== false 
      ? (mainBrushTimeLeft !== null ? timeToPercent(mainBrushTimeLeft, 300) : this.getComponentWear(entity, 'main_brush'))
      : null;
    const sideBrushLife = module.show_side_brush_life !== false 
      ? (sideBrushTimeLeft !== null ? timeToPercent(sideBrushTimeLeft, 200) : this.getComponentWear(entity, 'side_brush'))
      : null;
    const sensorLife = module.show_sensor_life 
      ? (sensorTimeLeft !== null ? timeToPercent(sensorTimeLeft, 30) : this.getComponentWear(entity, 'sensor'))
      : null;
    
    const hasAnyData = filterLife !== null || mainBrushLife !== null || sideBrushLife !== null || sensorLife !== null;
    
    if (!hasAnyData) {
      return html``;
    }
    
    return html`
      <div class="component-wear">
        <div class="component-wear-title">Component Life</div>
        <div class="component-wear-grid">
          ${filterLife !== null
            ? html`
                <div class="component-item">
                  <ha-icon icon="mdi:air-filter"></ha-icon>
                  <div class="component-bar">
                    <div class="component-bar-fill" style="width: ${filterLife}%; background: ${this.getWearColor(filterLife)}"></div>
                  </div>
                  <span class="component-value">${filterLife}%</span>
                </div>
              `
            : ''
          }
          ${mainBrushLife !== null
            ? html`
                <div class="component-item">
                  <ha-icon icon="mdi:brush"></ha-icon>
                  <div class="component-bar">
                    <div class="component-bar-fill" style="width: ${mainBrushLife}%; background: ${this.getWearColor(mainBrushLife)}"></div>
                  </div>
                  <span class="component-value">${mainBrushLife}%</span>
                </div>
              `
            : ''
          }
          ${sideBrushLife !== null
            ? html`
                <div class="component-item">
                  <ha-icon icon="mdi:fan"></ha-icon>
                  <div class="component-bar">
                    <div class="component-bar-fill" style="width: ${sideBrushLife}%; background: ${this.getWearColor(sideBrushLife)}"></div>
                  </div>
                  <span class="component-value">${sideBrushLife}%</span>
                </div>
              `
            : ''
          }
          ${sensorLife !== null
            ? html`
                <div class="component-item">
                  <ha-icon icon="mdi:eye"></ha-icon>
                  <div class="component-bar">
                    <div class="component-bar-fill" style="width: ${sensorLife}%; background: ${this.getWearColor(sensorLife)}"></div>
                  </div>
                  <span class="component-value">${sensorLife}%</span>
                </div>
              `
            : ''
          }
        </div>
      </div>
    `;
  }

  private getWearColor(percentage: number): string {
    if (percentage <= 20) return '#F44336';
    if (percentage <= 50) return '#FF9800';
    return '#4CAF50';
  }

  private renderControls(
    module: VacuumModule,
    entity: HassEntity,
    hass: HomeAssistant,
    state: string,
    fanSpeed: string,
    fanSpeedOptions: string[]
  ): TemplateResult {
    const layout = module.control_layout || 'row';
    const isActive = state === 'cleaning' || state === 'returning';
    
    return html`
      <div class="vacuum-controls layout-${layout}">
        ${module.show_start_button !== false
          ? html`
              <button
                class="vacuum-control-btn ${state === 'cleaning' ? 'active' : ''}"
                @click=${() => this.handleVacuumCommand('start', module.entity, hass)}
                title="Start"
              >
                <ha-icon icon="mdi:play"></ha-icon>
                ${layout !== 'compact' ? html`<span>Start</span>` : ''}
              </button>
            `
          : ''
        }
        ${module.show_pause_button !== false
          ? html`
              <button
                class="vacuum-control-btn ${state === 'paused' ? 'active' : ''}"
                @click=${() => this.handleVacuumCommand('pause', module.entity, hass)}
                title="Pause"
                ?disabled=${!isActive}
              >
                <ha-icon icon="mdi:pause"></ha-icon>
                ${layout !== 'compact' ? html`<span>Pause</span>` : ''}
              </button>
            `
          : ''
        }
        ${module.show_stop_button !== false
          ? html`
              <button
                class="vacuum-control-btn"
                @click=${() => this.handleVacuumCommand('stop', module.entity, hass)}
                title="Stop"
                ?disabled=${!isActive && state !== 'paused'}
              >
                <ha-icon icon="mdi:stop"></ha-icon>
                ${layout !== 'compact' ? html`<span>Stop</span>` : ''}
              </button>
            `
          : ''
        }
        ${module.show_dock_button !== false
          ? html`
              <button
                class="vacuum-control-btn ${state === 'returning' ? 'active' : ''}"
                @click=${() => this.handleVacuumCommand('return_to_base', module.entity, hass)}
                title="Return to Dock"
              >
                <ha-icon icon="mdi:home"></ha-icon>
                ${layout !== 'compact' ? html`<span>Dock</span>` : ''}
              </button>
            `
          : ''
        }
        ${module.show_locate_button
          ? html`
              <button
                class="vacuum-control-btn"
                @click=${() => this.handleVacuumCommand('locate', module.entity, hass)}
                title="Locate"
              >
                <ha-icon icon="mdi:map-marker"></ha-icon>
                ${layout !== 'compact' ? html`<span>Locate</span>` : ''}
              </button>
            `
          : ''
        }
      </div>
    `;
  }

  private renderCompactControls(module: VacuumModule, entity: HassEntity, hass: HomeAssistant): TemplateResult {
    const state = this.getVacuumState(entity);
    const isActive = state === 'cleaning' || state === 'returning';
    
    return html`
      <div class="vacuum-compact-controls">
        ${isActive
          ? html`
              <button class="vacuum-compact-btn" @click=${() => this.handleVacuumCommand('pause', module.entity, hass)} title="Pause">
                <ha-icon icon="mdi:pause"></ha-icon>
              </button>
              <button class="vacuum-compact-btn" @click=${() => this.handleVacuumCommand('return_to_base', module.entity, hass)} title="Dock">
                <ha-icon icon="mdi:home"></ha-icon>
              </button>
            `
          : html`
              <button class="vacuum-compact-btn" @click=${() => this.handleVacuumCommand('start', module.entity, hass)} title="Start">
                <ha-icon icon="mdi:play"></ha-icon>
              </button>
            `
        }
      </div>
    `;
  }

  private renderFanSpeedControl(
    module: VacuumModule,
    entity: HassEntity,
    hass: HomeAssistant,
    currentSpeed: string,
    options: string[],
    settings?: VacuumDisplaySection['settings']
  ): TemplateResult {
    const formatSpeed = (speed: string): string => {
      return speed.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };
    
    const style = settings?.style || 'default';
    const color = settings?.color || 'var(--primary-color)';
    const selectStyle = `background: ${color}; border-color: ${color};`;
    
    // Reusable select with dropdown caret
    const renderSelect = (extraClass: string = '', extraStyle: string = selectStyle) => html`
      <div class="fan-speed-select-wrapper">
        <select 
          class="fan-speed-select ${extraClass}"
          style="${extraStyle}"
          @change=${(e: Event) => {
            const select = e.target as HTMLSelectElement;
            this.handleFanSpeedChange(select.value, module.entity, hass);
          }}
        >
          ${options.map(
            speed => html`
              <option value="${speed}" ?selected=${currentSpeed === speed}>
                ${formatSpeed(speed)}
              </option>
            `
          )}
        </select>
        <ha-icon class="fan-speed-caret" icon="mdi:chevron-down" style="color: ${extraClass === 'compact' ? color : 'inherit'};"></ha-icon>
      </div>
    `;
    
    // Speed Only mode - just the dropdown
    if (style === 'speed_only') {
      return html`
        <div class="vacuum-fan-speed-row speed-only">
          ${renderSelect('', selectStyle)}
        </div>
      `;
    }
    
    // Compact mode - centered layout without background
    if (style === 'compact') {
      return html`
        <div class="vacuum-fan-speed-row compact">
          <ha-icon icon="mdi:fan" style="color: ${color};"></ha-icon>
          ${renderSelect('compact', `color: ${color}; border-color: ${color};`)}
        </div>
      `;
    }
    
    // Default mode
    return html`
      <div class="vacuum-fan-speed-row">
        <div class="fan-speed-left">
          <ha-icon icon="mdi:fan" style="color: ${color};"></ha-icon>
          <span>Speed</span>
        </div>
        <div class="fan-speed-right">
          ${renderSelect('', selectStyle)}
        </div>
      </div>
    `;
  }

  private renderMapView(
    module: VacuumModule,
    hass: HomeAssistant,
    sectionSettings?: VacuumDisplaySection['settings'],
    inline: boolean = false
  ): TemplateResult {
    const mapHeight = sectionSettings?.bar_height || module.map_height || 200;
    const borderRadius = module.map_border_radius || 12;
    const displayMode = sectionSettings?.display_mode || 'below_vacuum';
    
    const overrideEntityId = sectionSettings?.entity_override;
    const overrideEntity = overrideEntityId ? hass?.states[overrideEntityId] : null;

    // Check map_image_entity first (image domain), then fall back to map_entity (camera domain)
    const mapImageEntity = module.map_image_entity ? hass?.states[module.map_image_entity] : null;
    const mapCameraEntity = module.map_entity ? hass?.states[module.map_entity] : null;
    
    // Get the image URL - image entities use entity_picture attribute
    const entityPicture =
      overrideEntity?.attributes?.entity_picture ||
      mapImageEntity?.attributes?.entity_picture ||
      mapCameraEntity?.attributes?.entity_picture;
    
    // Close button not needed (dots/swipe handle navigation)
    const showCloseButton = false;
    
    if (entityPicture) {
      return html`
        <div class="vacuum-map-container ${inline ? 'inline' : ''}" style="height: ${mapHeight}px; border-radius: ${borderRadius}px;">
          <img
            draggable="false"
            src="${entityPicture}" 
            alt="Vacuum Map" 
            class="vacuum-map-image"
            style="border-radius: ${borderRadius}px;"
            @dragstart=${(e: DragEvent) => e.preventDefault()}
          />
          ${showCloseButton ? html`
            <button 
              class="map-close-btn"
              @click=${() => { this._currentView = 'vacuum'; this.triggerPreviewUpdate(); }}
            >
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          ` : ''}
        </div>
      `;
    }
    
    return html`
      <div class="vacuum-map-container vacuum-map-empty ${inline ? 'inline' : ''}" style="height: ${mapHeight}px; border-radius: ${borderRadius}px;">
        <ha-icon icon="mdi:map-outline"></ha-icon>
        <span>No map available</span>
        ${showCloseButton ? html`
          <button 
            class="map-close-btn"
            @click=${() => { this._currentView = 'vacuum'; this.triggerPreviewUpdate(); }}
          >
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        ` : ''}
      </div>
    `;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const vacuumModule = module as VacuumModule;
    const errors = [...baseValidation.errors];
    
    if (!vacuumModule.entity || vacuumModule.entity.trim() === '') {
      errors.push('Vacuum entity is required');
    } else if (!vacuumModule.entity.startsWith('vacuum.')) {
      errors.push('Entity must be a vacuum entity (vacuum.*)');
    }
    
    if (vacuumModule.map_entity && !vacuumModule.map_entity.startsWith('camera.')) {
      errors.push('Map entity must be a camera entity (camera.*)');
    }
    
    return { valid: errors.length === 0, errors };
  }

  getStyles(): string {
    return `
      /* Clickable elements - for more-info and toggle actions */
      .clickable {
        cursor: pointer;
        transition: opacity 0.2s ease, transform 0.1s ease;
      }
      .clickable:hover {
        opacity: 0.8;
      }
      .clickable:active {
        transform: scale(0.98);
      }
      
      .vacuum-module-container {
        padding: 12px 16px 16px 16px;
        background: var(--card-background-color, var(--ha-card-background));
        border-radius: 12px;
        position: relative;
        overflow: hidden;
      }
      .vacuum-module-container.swipe-mode {
        /* Allow vertical scrolling but keep horizontal swipes available for our handler */
        touch-action: pan-y;
      }
      
      .vacuum-no-entity {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px;
        color: var(--secondary-text-color);
        gap: 12px;
      }
      .vacuum-no-entity ha-icon {
        font-size: 48px;
        opacity: 0.5;
      }
      
      .vacuum-compact {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .vacuum-compact-left {
        flex-shrink: 0;
      }
      .vacuum-compact-right {
        flex: 1;
        min-width: 0;
      }
      .vacuum-compact-info {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 4px;
      }
      .vacuum-battery-compact {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        color: var(--secondary-text-color);
      }
      .vacuum-battery-compact ha-icon {
        font-size: 18px;
      }
      .vacuum-compact-controls {
        display: flex;
        gap: 8px;
        margin-left: auto;
      }
      .vacuum-compact-btn {
        background: var(--primary-color);
        color: var(--text-primary-color, white);
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .vacuum-compact-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
      .vacuum-compact-btn ha-icon {
        font-size: 18px;
      }
      
      .vacuum-standard {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        text-align: center;
      }
      .vacuum-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        width: 100%;
      }
      .vacuum-name {
        font-size: 20px;
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .vacuum-status-text {
        font-size: 14px;
        font-weight: 500;
        text-transform: capitalize;
      }
      .vacuum-battery {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        font-weight: 500;
      }
      .vacuum-battery ha-icon {
        --mdc-icon-size: 20px;
      }
      .vacuum-icon-container {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
      .vacuum-status-badge {
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
        color: white;
        text-transform: uppercase;
      }
      
      .vacuum-detailed {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .vacuum-header-detailed {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .vacuum-header-left {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .vacuum-status-text {
        font-size: 14px;
        font-weight: 500;
      }
      .vacuum-battery-detailed {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 18px;
        font-weight: 600;
      }
      .vacuum-battery-detailed ha-icon {
        font-size: 28px;
      }
      .vacuum-main-content {
        display: flex;
        gap: 24px;
        align-items: flex-start;
      }
      .vacuum-icon-wrapper {
        flex-shrink: 0;
      }
      .vacuum-info-panel {
        flex: 1;
        min-width: 0;
      }
      
      .vacuum-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-color);
        transition: all 0.3s ease;
      }
      .vacuum-icon ha-icon {
        width: 100%;
        height: 100%;
      }
      .vacuum-image {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      /* SVG Vacuum Container */
      .vacuum-svg-container {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .vacuum-svg {
        transition: all 0.3s ease;
      }
      
      .vacuum-status {
        font-size: 14px;
        font-weight: 500;
      }
      
      .vacuum-stats {
        display: flex;
        justify-content: center;
        gap: 24px;
        padding: 12px 0;
      }
      .vacuum-stat {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        color: var(--secondary-text-color);
      }
      .vacuum-stat ha-icon {
        font-size: 18px;
      }
      
      .vacuum-stats-detailed {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .stats-section-title {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--secondary-text-color);
        letter-spacing: 0.5px;
      }
      .stats-row {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }
      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        min-width: 60px;
      }
      .stat-item ha-icon {
        font-size: 20px;
        color: var(--primary-color);
      }
      .stat-value {
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .stat-label {
        font-size: 11px;
        color: var(--secondary-text-color);
        text-transform: uppercase;
      }
      
      .component-wear {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
      }
      .component-wear-title {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--secondary-text-color);
        margin-bottom: 12px;
      }
      .component-wear-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .component-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .component-item ha-icon {
        font-size: 16px;
        color: var(--secondary-text-color);
        width: 20px;
      }
      .component-bar {
        flex: 1;
        height: 6px;
        background: var(--divider-color);
        border-radius: 3px;
        overflow: hidden;
      }
      .component-bar-fill {
        height: 100%;
        border-radius: 3px;
        transition: width 0.3s ease;
      }
      .component-value {
        font-size: 12px;
        font-weight: 600;
        color: var(--secondary-text-color);
        width: 36px;
        text-align: right;
      }
      
      /* Current Room */
      .vacuum-current-room {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }
      .vacuum-current-room ha-icon {
        --mdc-icon-size: 16px;
        color: var(--primary-color);
      }
      
      /* Error Banner */
      .vacuum-error-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: rgba(var(--rgb-error-color, 244, 67, 54), 0.15);
        border-radius: 8px;
        color: var(--error-color, #f44336);
        font-size: 13px;
        margin-bottom: 12px;
      }
      .vacuum-error-banner ha-icon {
        --mdc-icon-size: 20px;
        flex-shrink: 0;
      }
      
      /* Last Clean Section */
      .vacuum-last-clean {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--divider-color);
      }
      .last-clean-times {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 8px;
      }
      .time-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--primary-text-color);
      }
      .time-item ha-icon {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
      }
      
      /* Total Stats Section */
      .vacuum-total-stats {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--divider-color);
      }
      
      /* Do Not Disturb Status */
      .vacuum-dnd-status {
        margin-top: 12px;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid;
        transition: all 0.2s ease;
      }
      .dnd-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 500;
      }
      .dnd-header ha-icon {
        --mdc-icon-size: 18px;
      }
      .dnd-times {
        margin-top: 6px;
        padding-left: 26px;
        font-size: 12px;
        opacity: 0.8;
      }
      
      /* Volume Control */
      .vacuum-volume {
        margin-top: 12px;
        padding: 12px;
        background: var(--secondary-background-color);
        border-radius: 8px;
        border: 1px solid var(--divider-color);
      }
      .volume-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--primary-text-color);
        margin-bottom: 8px;
      }
      .volume-header ha-icon {
        --mdc-icon-size: 18px;
        color: var(--primary-color);
      }
      .volume-bar {
        height: 6px;
        background: var(--divider-color);
        border-radius: 3px;
        overflow: hidden;
      }
      .volume-bar-fill {
        height: 100%;
        background: var(--primary-color);
        border-radius: 3px;
        transition: width 0.3s ease;
      }
      
      .vacuum-controls {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-top: 0;
        flex-wrap: wrap;
      }
      .vacuum-controls.grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 8px;
      }
      .vacuum-controls.compact {
        gap: 16px;
        justify-content: center;
      }
      .vacuum-control-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 12px 16px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: var(--primary-text-color);
        min-width: 60px;
      }
      .vacuum-control-btn:hover:not(:disabled) {
        background: var(--primary-color);
        color: var(--text-primary-color, white);
        border-color: var(--primary-color);
      }
      .vacuum-control-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .vacuum-control-btn.active {
        background: var(--primary-color);
        color: var(--text-primary-color, white);
        border-color: var(--primary-color);
      }
      .vacuum-control-btn ha-icon {
        font-size: 24px;
      }
      .vacuum-control-btn span {
        font-size: 11px;
        font-weight: 500;
      }
      /* Compact button - icon only, no background */
      .vacuum-control-btn-compact {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        background: transparent;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        color: var(--primary-text-color);
        --mdc-icon-size: 24px;
      }
      .vacuum-control-btn-compact:hover:not(:disabled) {
        background: color-mix(in srgb, currentColor 10%, transparent);
      }
      .vacuum-control-btn-compact:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .layout-compact .vacuum-control-btn {
        padding: 8px;
        min-width: 44px;
      }
      .layout-compact .vacuum-control-btn span {
        display: none;
      }
      
      /* Fan Speed Row - single line with dropdown */
      .vacuum-fan-speed-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: var(--secondary-background-color);
        border-radius: 12px;
        margin-bottom: 0;
        gap: 16px;
        width: 100%;
        box-sizing: border-box;
      }
      /* Speed Only - just the dropdown centered */
      .vacuum-fan-speed-row.speed-only {
        background: transparent;
        padding: 8px 0;
        justify-content: center;
      }
      /* Compact - centered with icon, no background */
      .vacuum-fan-speed-row.compact {
        background: transparent;
        padding: 8px 0;
        justify-content: center;
        gap: 8px;
      }
      .vacuum-fan-speed-row.compact .fan-speed-select {
        background: transparent;
        border: 1px solid currentColor;
        padding: 8px 28px 8px 12px;
        font-size: 13px;
        color: inherit;
      }
      .vacuum-fan-speed-row.compact .fan-speed-select.compact {
        background: transparent;
      }
      .vacuum-fan-speed-row.compact .fan-speed-caret {
        color: inherit;
      }

      /* Swipe carousel inside image area */
      .vacuum-swipe-carousel {
        overflow: hidden;
        position: relative;
        border-radius: 12px;
        /* Helps mobile browsers allow horizontal swipe without scroll hijack */
        touch-action: pan-y;
        user-select: none;
        cursor: grab;
      }
      .vacuum-swipe-carousel img {
        -webkit-user-drag: none;
        user-drag: none;
      }
      .vacuum-swipe-carousel.dragging {
        cursor: grabbing;
      }
      .vacuum-swipe-track {
        display: flex;
        width: 200%;
        height: 100%;
        transition: transform 280ms ease;
        will-change: transform;
      }
      .vacuum-swipe-page {
        width: 50%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .fan-speed-left {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
        flex-shrink: 0;
      }
      .fan-speed-left ha-icon {
        --mdc-icon-size: 20px;
        color: var(--secondary-text-color);
      }
      .fan-speed-right {
        display: flex;
        align-items: center;
        flex: 1;
        justify-content: flex-end;
      }
      .fan-speed-select-wrapper {
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      .fan-speed-select {
        padding: 10px 32px 10px 16px;
        background: var(--primary-color);
        color: var(--text-primary-color, white);
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
        min-width: 120px;
        text-align: left;
      }
      .fan-speed-caret {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        --mdc-icon-size: 18px;
        color: var(--text-primary-color, white);
        opacity: 0.9;
      }
      .fan-speed-select.compact + .fan-speed-caret {
        color: inherit;
      }
      .fan-speed-select:hover {
        opacity: 0.9;
      }
      .fan-speed-select:focus {
        outline: 2px solid rgba(var(--rgb-primary-color), 0.5);
        outline-offset: 2px;
      }
      .fan-speed-select option {
        background: var(--card-background-color);
        color: var(--primary-text-color);
        padding: 8px 12px;
      }
      
      /* Legacy styles - kept for backwards compatibility */
      .vacuum-fan-speed {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        background: var(--secondary-background-color);
        border-radius: 12px;
      }
      .fan-speed-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }
      .fan-speed-label ha-icon {
        font-size: 18px;
      }
      .fan-speed-options {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .fan-speed-btn {
        padding: 6px 12px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 16px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: var(--primary-text-color);
      }
      .fan-speed-btn:hover {
        border-color: var(--primary-color);
      }
      .fan-speed-btn.active {
        background: var(--primary-color);
        color: var(--text-primary-color, white);
        border-color: var(--primary-color);
      }
      
      .vacuum-map-container {
        position: relative;
        margin-top: 16px;
        overflow: hidden;
        background: var(--secondary-background-color);
      }
      .vacuum-map-container.inline {
        margin-top: 0;
      }
      .vacuum-map-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .vacuum-map-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--secondary-text-color);
      }
      .vacuum-map-empty ha-icon {
        font-size: 48px;
        opacity: 0.5;
      }
      .map-close-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(0, 0, 0, 0.5);
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: white;
        transition: background 0.2s ease;
      }
      .map-close-btn:hover {
        background: rgba(0, 0, 0, 0.7);
      }
      
      /* Pagination Dots for Swipe Mode */
      .vacuum-pagination-dots {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        margin-top: 2px;
        padding: 4px 0 0 0;
      }
      .vacuum-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--divider-color, rgba(255, 255, 255, 0.3));
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .vacuum-dot:hover {
        background: var(--secondary-text-color);
        transform: scale(1.2);
      }
      .vacuum-dot.active {
        background: var(--primary-color);
        width: 24px;
        border-radius: 4px;
      }
      
      /* SVG Brush Animations */
      @keyframes brush-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes brush-spin-reverse {
        from { transform: rotate(360deg); }
        to { transform: rotate(0deg); }
      }
      @keyframes roller-move {
        0% { transform: translateX(0); }
        100% { transform: translateX(7px); }
      }
      @keyframes sensor-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
      @keyframes status-led-pulse {
        0%, 100% { opacity: 1; filter: drop-shadow(0 0 2px currentColor); }
        50% { opacity: 0.6; filter: drop-shadow(0 0 6px currentColor); }
      }
      
      /* SVG Animation Classes */
      .vacuum-side-brush-left {
        transform-origin: 30px 85px;
      }
      .vacuum-side-brush-right {
        transform-origin: 70px 85px;
      }
      
      /* Ensure bristle lines are always visible */
      .vacuum-side-brush-left line,
      .vacuum-side-brush-right line {
        vector-effect: non-scaling-stroke;
      }
      .vacuum-brush-spin {
        animation: brush-spin 1.2s linear infinite;
      }
      .vacuum-brush-spin-reverse {
        animation: brush-spin-reverse 1.2s linear infinite;
      }
      
      /* Dock LED animation - slow blink when docked/charging */
      .vacuum-dock-led {
        animation: dock-led-blink 2s ease-in-out infinite;
      }
      @keyframes dock-led-blink {
        0%, 100% { opacity: 1; filter: drop-shadow(0 0 6px currentColor); }
        50% { opacity: 0.3; filter: none; }
      }
      
      /* Dock arc charging pulse */
      .vacuum-dock-arc-pulse {
        animation: dock-arc-pulse 2s ease-in-out infinite;
      }
      @keyframes dock-arc-pulse {
        0%, 100% { 
          /* Low point: no glow */
          filter: none;
        }
        50% { 
          /* High point: use the previous "low" glow size */
          filter: drop-shadow(0 0 1px currentColor) drop-shadow(0 0 4px currentColor);
        }
      }
      
      /* Charging LED on robot when docked */
      .vacuum-charging-led {
        animation: charging-led-pulse 3s ease-in-out infinite;
      }
      @keyframes charging-led-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
      
      /* Prevent clipping on brushes */
      .vacuum-svg-container {
        overflow: visible;
      }
      .vacuum-roller-animate line {
        animation: roller-move 0.3s linear infinite;
      }
      .vacuum-sensor-blink {
        animation: sensor-blink 1s ease-in-out infinite;
      }
      .vacuum-status-led {
        animation: status-led-pulse 1.5s ease-in-out infinite;
      }
      
      /* Container Animations */
      @keyframes vacuum-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes vacuum-spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes vacuum-spin-fast {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes vacuum-pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.8; }
      }
      @keyframes vacuum-rotate {
        0% { transform: rotate(-15deg); }
        50% { transform: rotate(15deg); }
        100% { transform: rotate(-15deg); }
      }
      @keyframes vacuum-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      @keyframes vacuum-slide {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(-5px); }
      }
      @keyframes vacuum-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
      @keyframes vacuum-glow {
        0%, 100% { filter: drop-shadow(0 0 4px var(--primary-color)); }
        50% { filter: drop-shadow(0 0 12px var(--primary-color)); }
      }
      @keyframes vacuum-breathe {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
      }
      
      /* Vacuum cleaning movement - random left-right wobbling */
      @keyframes vacuum-cleaning-move {
        0% { transform: rotate(0deg); }
        8% { transform: rotate(-15deg); }
        16% { transform: rotate(-12deg); }
        24% { transform: rotate(18deg); }
        32% { transform: rotate(14deg); }
        40% { transform: rotate(-20deg); }
        48% { transform: rotate(-16deg); }
        56% { transform: rotate(22deg); }
        64% { transform: rotate(16deg); }
        72% { transform: rotate(-18deg); }
        80% { transform: rotate(-10deg); }
        88% { transform: rotate(12deg); }
        96% { transform: rotate(5deg); }
        100% { transform: rotate(0deg); }
      }
      .vacuum-svg-active {
        animation: vacuum-cleaning-move 7s ease-in-out infinite;
      }
      
      .vacuum-anim-spin { animation: vacuum-spin 2s linear infinite; }
      .vacuum-anim-spin-slow { animation: vacuum-spin-slow 4s linear infinite; }
      .vacuum-anim-spin-fast { animation: vacuum-spin-fast 1s linear infinite; }
      .vacuum-anim-pulse { animation: vacuum-pulse 1.5s ease-in-out infinite; }
      .vacuum-anim-pulse-slow { animation: vacuum-pulse 3s ease-in-out infinite; }
      .vacuum-anim-pulse-fast { animation: vacuum-pulse 0.8s ease-in-out infinite; }
      .vacuum-anim-rotate { animation: vacuum-rotate 2s ease-in-out infinite; }
      .vacuum-anim-rotate-slow { animation: vacuum-rotate 4s ease-in-out infinite; }
      .vacuum-anim-rotate-fast { animation: vacuum-rotate 1s ease-in-out infinite; }
      .vacuum-anim-bounce { animation: vacuum-bounce 1s ease-in-out infinite; }
      .vacuum-anim-bounce-slow { animation: vacuum-bounce 2s ease-in-out infinite; }
      .vacuum-anim-bounce-fast { animation: vacuum-bounce 0.5s ease-in-out infinite; }
      .vacuum-anim-slide { animation: vacuum-slide 1.5s ease-in-out infinite; }
      .vacuum-anim-slide-slow { animation: vacuum-slide 3s ease-in-out infinite; }
      .vacuum-anim-slide-fast { animation: vacuum-slide 0.8s ease-in-out infinite; }
      .vacuum-anim-blink { animation: vacuum-blink 1s ease-in-out infinite; }
      .vacuum-anim-blink-slow { animation: vacuum-blink 2s ease-in-out infinite; }
      .vacuum-anim-blink-fast { animation: vacuum-blink 0.5s ease-in-out infinite; }
      .vacuum-anim-glow { animation: vacuum-glow 2s ease-in-out infinite; }
      .vacuum-anim-glow-slow { animation: vacuum-glow 4s ease-in-out infinite; }
      .vacuum-anim-glow-fast { animation: vacuum-glow 1s ease-in-out infinite; }
      .vacuum-anim-breathe { animation: vacuum-breathe 3s ease-in-out infinite; }
      .vacuum-anim-breathe-slow { animation: vacuum-breathe 5s ease-in-out infinite; }
      .vacuum-anim-breathe-fast { animation: vacuum-breathe 1.5s ease-in-out infinite; }
      
      /* Double column layout */
      .vacuum-double-column-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        width: 100%;
      }
      
      .vacuum-double-column-layout .vacuum-column-left,
      .vacuum-double-column-layout .vacuum-column-right {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 0;
      }
      
      /* Make certain sections span full width in double column */
      .vacuum-double-column-layout .vacuum-icon-container,
      .vacuum-double-column-layout .vacuum-header,
      .vacuum-double-column-layout .vacuum-swipe-carousel {
        /* These look better spanning the column */
      }
      
      /* Responsive: stack columns on small screens */
      @media (max-width: 400px) {
        .vacuum-double-column-layout {
          grid-template-columns: 1fr;
        }
      }
      
      /* Sections-based layout styles */
      .vacuum-sections-layout {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        text-align: center;
      }
      
      .vacuum-sections-layout .vacuum-icon-container {
        margin: 0;
      }
      
      .vacuum-sections-layout .vacuum-header {
        width: 100%;
      }
      
      .vacuum-sections-layout .vacuum-battery {
        justify-content: center;
        margin-top: 8px;
      }
      
      .vacuum-sections-layout .vacuum-current-room {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 14px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }
      
      .vacuum-sections-layout .vacuum-current-room ha-icon {
        --mdc-icon-size: 18px;
      }
      
      .vacuum-sections-layout .vacuum-controls {
        width: 100%;
        justify-content: center;
      }
      
      .vacuum-sections-layout .vacuum-error-banner {
        width: 100%;
        background: rgba(var(--rgb-error-color, 244, 67, 54), 0.1);
        border: 1px solid var(--error-color, #f44336);
        border-radius: 8px;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--error-color, #f44336);
      }
      
      .vacuum-sections-layout .vacuum-error-banner ha-icon {
        --mdc-icon-size: 20px;
      }
      
      .vacuum-sections-layout .vacuum-component-wear {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;
        text-align: left;
      }
      
      .vacuum-sections-layout .wear-item {
        background: rgba(var(--rgb-primary-color), 0.05);
        padding: 8px 12px;
        border-radius: 8px;
      }
      
      .vacuum-sections-layout .wear-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
      }
      
      .vacuum-sections-layout .wear-header ha-icon {
        --mdc-icon-size: 18px;
        color: var(--primary-color);
      }
      
      .vacuum-sections-layout .wear-label {
        flex: 1;
        font-size: 13px;
        color: var(--primary-text-color);
      }
      
      .vacuum-sections-layout .wear-value {
        font-size: 13px;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      
      .vacuum-sections-layout .wear-bar {
        height: 6px;
        background: var(--divider-color, rgba(0,0,0,0.1));
        border-radius: 3px;
        overflow: hidden;
      }
      
      .vacuum-sections-layout .wear-progress {
        height: 100%;
        border-radius: 3px;
        transition: width 0.3s ease;
      }
      
      /* Compact sections layout */
      .vacuum-compact.vacuum-sections-layout {
        flex-direction: row;
        flex-wrap: wrap;
        gap: 12px;
        text-align: left;
      }
      
      .vacuum-compact.vacuum-sections-layout .vacuum-icon-container {
        margin: 0;
        flex: 0 0 auto;
      }
      
      .vacuum-compact.vacuum-sections-layout .vacuum-header {
        flex: 1;
        min-width: 0;
        align-items: flex-start;
      }
      
      .vacuum-compact.vacuum-sections-layout .vacuum-controls {
        width: auto;
        flex: 0 0 auto;
      }
    `;
  }
}
