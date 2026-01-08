import { TemplateResult, html, css } from 'lit';
import { HomeAssistant, fireEvent } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import {
  CardModule,
  GridModule,
  GridEntity,
  GridStylePreset,
  GridDisplayMode,
  GridSortBy,
  GridPaginationStyle,
  GridLoadAnimation,
  MetroSize,
  UltraCardConfig,
  ModuleActionConfig,
  DisplayCondition,
} from '../types';
import { UcFormUtils } from '../utils/uc-form-utils';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { UltraLinkComponent } from '../components/ultra-link';
import { localize } from '../localize/localize';
import { logicService } from '../services/logic-service';
import '../components/ultra-color-picker';

// Grid style preset configurations
interface GridStyleConfig {
  id: GridStylePreset;
  name: string;
  description: string;
  category: 'modern' | 'minimal' | 'classic' | 'advanced';
  showIcon: boolean;
  showName: boolean;
  showState: boolean;
  layout: 'vertical' | 'horizontal' | 'icon-only';
  defaultIconSize: number;
  defaultFontSize: number;
  defaultPadding: string;
  defaultBorderRadius: string;
  // Indicates if this style supports variable heights (masonry/metro modes)
  supportsVariableHeight: boolean;
}

// Define all 20 style presets
const GRID_STYLE_PRESETS: GridStyleConfig[] = [
  // Modern Styles (1-5)
  {
    id: 'style_1',
    name: 'Modern Stack',
    description: 'Name above icon above state',
    category: 'modern',
    showIcon: true,
    showName: true,
    showState: true,
    layout: 'vertical',
    defaultIconSize: 32,
    defaultFontSize: 12,
    defaultPadding: '16px',
    defaultBorderRadius: '12px',
    supportsVariableHeight: true,
  },
  {
    id: 'style_2',
    name: 'Minimalist',
    description: 'Icon above state only',
    category: 'modern',
    showIcon: true,
    showName: false,
    showState: true,
    layout: 'vertical',
    defaultIconSize: 36,
    defaultFontSize: 11,
    defaultPadding: '12px',
    defaultBorderRadius: '8px',
    supportsVariableHeight: true,
  },
  {
    id: 'style_3',
    name: 'Sidebar',
    description: 'Icon left, name + state right',
    category: 'modern',
    showIcon: true,
    showName: true,
    showState: true,
    layout: 'horizontal',
    defaultIconSize: 28,
    defaultFontSize: 13,
    defaultPadding: '12px',
    defaultBorderRadius: '10px',
    supportsVariableHeight: false, // Horizontal layout doesn't scale well with variable heights
  },
  {
    id: 'style_4',
    name: 'Badge Icon',
    description: 'Large icon with floating state badge',
    category: 'modern',
    showIcon: true,
    showName: false,
    showState: true,
    layout: 'icon-only',
    defaultIconSize: 48,
    defaultFontSize: 10,
    defaultPadding: '16px',
    defaultBorderRadius: '50%',
    supportsVariableHeight: true, // Icon-only scales well
  },
  {
    id: 'style_5',
    name: 'Compact Row',
    description: 'Icon + name horizontal, state below',
    category: 'modern',
    showIcon: true,
    showName: true,
    showState: true,
    layout: 'vertical',
    defaultIconSize: 24,
    defaultFontSize: 12,
    defaultPadding: '10px',
    defaultBorderRadius: '8px',
    supportsVariableHeight: true,
  },
  // Minimal Styles (6-10)
  {
    id: 'style_6',
    name: 'Icon Only',
    description: 'Icon only, hover shows name',
    category: 'minimal',
    showIcon: true,
    showName: false,
    showState: false,
    layout: 'icon-only',
    defaultIconSize: 32,
    defaultFontSize: 11,
    defaultPadding: '12px',
    defaultBorderRadius: '8px',
    supportsVariableHeight: true,
  },
  {
    id: 'style_7',
    name: 'Compact',
    description: 'Icon + state, no name',
    category: 'minimal',
    showIcon: true,
    showName: false,
    showState: true,
    layout: 'vertical',
    defaultIconSize: 24,
    defaultFontSize: 10,
    defaultPadding: '8px',
    defaultBorderRadius: '6px',
    supportsVariableHeight: true,
  },
  {
    id: 'style_8',
    name: 'Text Only',
    description: 'Name + state, no icon',
    category: 'minimal',
    showIcon: false,
    showName: true,
    showState: true,
    layout: 'vertical',
    defaultIconSize: 0,
    defaultFontSize: 13,
    defaultPadding: '12px',
    defaultBorderRadius: '8px',
    supportsVariableHeight: true,
  },
  {
    id: 'style_9',
    name: 'Ring Progress',
    description: 'Circular icon with progress ring',
    category: 'minimal',
    showIcon: true,
    showName: false,
    showState: true,
    layout: 'icon-only',
    defaultIconSize: 40,
    defaultFontSize: 11,
    defaultPadding: '8px',
    defaultBorderRadius: '50%',
    supportsVariableHeight: true,
  },
  {
    id: 'style_10',
    name: 'Corner Badge',
    description: 'Square tile with corner state',
    category: 'minimal',
    showIcon: true,
    showName: false,
    showState: true,
    layout: 'icon-only',
    defaultIconSize: 28,
    defaultFontSize: 9,
    defaultPadding: '12px',
    defaultBorderRadius: '8px',
    supportsVariableHeight: true,
  },
  // Classic Styles (11-15)
  {
    id: 'style_11',
    name: 'Card',
    description: 'Card-like with shadow',
    category: 'classic',
    showIcon: true,
    showName: true,
    showState: true,
    layout: 'vertical',
    defaultIconSize: 32,
    defaultFontSize: 12,
    defaultPadding: '16px',
    defaultBorderRadius: '12px',
    supportsVariableHeight: true,
  },
  {
    id: 'style_12',
    name: 'Button',
    description: 'Button-style with border',
    category: 'classic',
    showIcon: true,
    showName: true,
    showState: false,
    layout: 'horizontal',
    defaultIconSize: 20,
    defaultFontSize: 13,
    defaultPadding: '10px 16px',
    defaultBorderRadius: '24px',
    supportsVariableHeight: false, // Buttons shouldn't vary in height
  },
  {
    id: 'style_13',
    name: 'List Item',
    description: 'List-style horizontal',
    category: 'classic',
    showIcon: true,
    showName: true,
    showState: true,
    layout: 'horizontal',
    defaultIconSize: 24,
    defaultFontSize: 14,
    defaultPadding: '8px 12px',
    defaultBorderRadius: '4px',
    supportsVariableHeight: false, // List items should be uniform
  },
  {
    id: 'style_14',
    name: 'Badge',
    description: 'Badge-style rounded',
    category: 'classic',
    showIcon: true,
    showName: true,
    showState: false,
    layout: 'horizontal',
    defaultIconSize: 16,
    defaultFontSize: 12,
    defaultPadding: '6px 12px',
    defaultBorderRadius: '16px',
    supportsVariableHeight: false, // Badges should be uniform
  },
  {
    id: 'style_15',
    name: 'Panel',
    description: 'Panel with header bar',
    category: 'classic',
    showIcon: true,
    showName: true,
    showState: true,
    layout: 'vertical',
    defaultIconSize: 28,
    defaultFontSize: 12,
    defaultPadding: '0',
    defaultBorderRadius: '8px',
    supportsVariableHeight: true,
  },
  // Advanced Styles (16-20)
  {
    id: 'style_16',
    name: 'Glass',
    description: 'Glass morphism effect',
    category: 'advanced',
    showIcon: true,
    showName: true,
    showState: true,
    layout: 'vertical',
    defaultIconSize: 32,
    defaultFontSize: 12,
    defaultPadding: '16px',
    defaultBorderRadius: '16px',
    supportsVariableHeight: true,
  },
  {
    id: 'style_17',
    name: 'Gradient',
    description: 'Gradient background overlay',
    category: 'advanced',
    showIcon: true,
    showName: true,
    showState: true,
    layout: 'vertical',
    defaultIconSize: 36,
    defaultFontSize: 12,
    defaultPadding: '20px',
    defaultBorderRadius: '12px',
    supportsVariableHeight: true,
  },
  {
    id: 'style_18',
    name: 'Split',
    description: 'Split-color design',
    category: 'advanced',
    showIcon: true,
    showName: true,
    showState: true,
    layout: 'horizontal',
    defaultIconSize: 28,
    defaultFontSize: 12,
    defaultPadding: '0',
    defaultBorderRadius: '10px',
    supportsVariableHeight: false, // Split design needs consistent height
  },
  {
    id: 'style_19',
    name: 'Neumorphic',
    description: 'Soft UI design',
    category: 'advanced',
    showIcon: true,
    showName: true,
    showState: true,
    layout: 'vertical',
    defaultIconSize: 32,
    defaultFontSize: 12,
    defaultPadding: '16px',
    defaultBorderRadius: '16px',
    supportsVariableHeight: true,
  },
  {
    id: 'style_20',
    name: 'Accent Border',
    description: 'Flat with accent border',
    category: 'advanced',
    showIcon: true,
    showName: true,
    showState: true,
    layout: 'vertical',
    defaultIconSize: 28,
    defaultFontSize: 12,
    defaultPadding: '14px',
    defaultBorderRadius: '8px',
    supportsVariableHeight: true,
  },
];

// Helper to get style config
function getStyleConfig(styleId: GridStylePreset): GridStyleConfig {
  return GRID_STYLE_PRESETS.find(s => s.id === styleId) || GRID_STYLE_PRESETS[0];
}

export class UltraGridModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'grid',
    title: 'Grid',
    description: 'Display entities in a customizable grid layout with multiple styles',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:view-grid',
    category: 'data',
    tags: ['grid', 'entities', 'dashboard', 'tiles', 'display'],
  };

  // Track expanded entities in editor
  private _expandedEntities: Set<string> = new Set();
  // Track dragged item for reordering
  private _draggedItem: GridEntity | null = null;
  // Track current pagination page per module
  private _currentPages: Map<string, number> = new Map();
  // Track animation start time per module (for unique animation keys on dashboard)
  private _animationStartTimes: Map<string, number> = new Map();
  // Store hass reference
  private _hass?: HomeAssistant;
  // Track entity action states for proper form binding
  private _entityActionStates: Map<string, { tap_action?: any; hold_action?: any; double_tap_action?: any }> = new Map();
  // Track gesture state for each grid item (for hold and double-tap detection)
  private _gestureState: Map<string, {
    holdTimeout: any;
    clickTimeout: any;
    isHolding: boolean;
    clickCount: number;
    lastClickTime: number;
  }> = new Map();

  createDefault(id?: string, hass?: HomeAssistant): GridModule {
    const moduleId = id || this.generateId('grid');
    
    return {
      id: moduleId,
      type: 'grid',

      // Entity Management
      entities: [],
      enable_auto_filter: false,
      include_domains: [],
      exclude_domains: [],
      exclude_entities: [],
      include_keywords: [],
      exclude_keywords: [],

      // Layout Configuration
      grid_style: 'style_1',
      grid_display_mode: 'grid',
      columns: 4,
      rows: 0, // auto
      gap: 12,

      // Sorting & Filtering
      sort_by: 'name',
      sort_direction: 'asc',
      max_items: 15, // default limit for new grids

      // Pagination
      enable_pagination: false,
      items_per_page: 12,
      pagination_style: 'both',

      // Animation
      enable_load_animation: true,
      load_animation: 'fadeIn',
      grid_animation_duration: 600, // milliseconds
      animation_stagger: 100, // milliseconds between each item

      // Global Styling
      global_icon_size: 32,
      global_font_size: 12,
      global_name_color: 'var(--primary-text-color)',
      global_state_color: 'var(--secondary-text-color)',
      global_icon_color: 'var(--primary-color)',
      global_background_color: 'var(--card-background-color)',
      global_border_radius: '12px',
      global_padding: '16px',
      global_border_width: 0,
      global_border_color: 'var(--divider-color)',

      // State-based styling
      global_on_color: 'var(--state-active-color, #fdd835)',
      global_off_color: 'var(--secondary-text-color)',
      global_unavailable_color: 'var(--disabled-color, #bdbdbd)',

      // Style-specific colors
      // Glass style (style_16)
      glass_tint_color: 'rgba(255, 255, 255, 0.1)',
      glass_blur_amount: 10,
      glass_border_color: 'rgba(255, 255, 255, 0.2)',

      // Gradient style (style_17)
      gradient_start_color: '#6666FF',
      gradient_end_color: '#000070',
      gradient_direction: 'to-bottom-right',

      // Panel style (style_15)
      panel_header_color: 'var(--primary-color)',
      panel_header_text_color: 'var(--text-primary-color, #fff)',

      // Split style (style_18)
      split_left_color: 'var(--primary-color)',
      split_right_color: 'var(--card-background-color)',

      // Neumorphic style (style_19)
      neumorphic_light_shadow: 'rgba(255, 255, 255, 0.1)',
      neumorphic_dark_shadow: 'rgba(0, 0, 0, 0.15)',

      // Accent Border style (style_20)
      accent_border_color: 'var(--primary-color)',

      // Card style (style_11)
      card_shadow_color: 'rgba(0, 0, 0, 0.1)',

      // Global Actions - 'default' uses smart domain-based actions
      tap_action: { action: 'default' },
      hold_action: { action: 'more-info' },
      double_tap_action: { action: 'nothing' },

      // Hover
      enable_hover_effect: true,
      hover_effect: 'scale',
      hover_scale: 1.05,

      // Logic
      display_mode: 'always' as any,
      display_conditions: [],
    };
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const gridModule = module as GridModule;
    const errors = [...baseValidation.errors];

    // Check entities or auto-filter
    if (!gridModule.enable_auto_filter && (!gridModule.entities || gridModule.entities.length === 0)) {
      errors.push('At least one entity must be configured, or enable auto-filter');
    }

    // Validate columns
    if (gridModule.columns < 1 || gridModule.columns > 12) {
      errors.push('Columns must be between 1 and 12');
    }

    return { valid: errors.length === 0, errors };
  }

  // Get all domains available in Home Assistant
  private getAvailableDomains(hass: HomeAssistant): string[] {
    if (!hass?.states) return [];
    const domains = new Set<string>();
    Object.keys(hass.states).forEach(entityId => {
      const domain = entityId.split('.')[0];
      domains.add(domain);
    });
    return Array.from(domains).sort();
  }

  // Get filtered entities based on domain and keyword filters
  private getFilteredEntities(module: GridModule, hass: HomeAssistant): GridEntity[] {
    let entities: GridEntity[] = [...(module.entities || [])];

    if (module.enable_auto_filter && hass?.states) {
      const allEntityIds = Object.keys(hass.states);

      // Filter by included domains
      let filtered = allEntityIds;
      if (module.include_domains && module.include_domains.length > 0) {
        filtered = allEntityIds.filter(entityId => {
          const domain = entityId.split('.')[0];
          return module.include_domains!.includes(domain);
        });
      }

      // Filter by included keywords (entity_id must contain at least one keyword)
      if (module.include_keywords && module.include_keywords.length > 0) {
        filtered = filtered.filter(entityId => {
          const lowerEntityId = entityId.toLowerCase();
          return module.include_keywords!.some(keyword => 
            lowerEntityId.includes(keyword.toLowerCase())
          );
        });
      }

      // Exclude specific domains
      if (module.exclude_domains && module.exclude_domains.length > 0) {
        filtered = filtered.filter(entityId => {
          const domain = entityId.split('.')[0];
          return !module.exclude_domains!.includes(domain);
        });
      }

      // Exclude by keywords (entity_id must NOT contain any of these keywords)
      if (module.exclude_keywords && module.exclude_keywords.length > 0) {
        filtered = filtered.filter(entityId => {
          const lowerEntityId = entityId.toLowerCase();
          return !module.exclude_keywords!.some(keyword => 
            lowerEntityId.includes(keyword.toLowerCase())
          );
        });
      }

      // Exclude specific entities
      if (module.exclude_entities && module.exclude_entities.length > 0) {
        filtered = filtered.filter(id => !module.exclude_entities!.includes(id));
      }

      // Convert to GridEntity objects (only add new ones not already in manual list)
      const manualEntityIds = new Set(entities.map(e => e.entity));
      const autoEntities: GridEntity[] = filtered
        .filter(entityId => !manualEntityIds.has(entityId))
        .map(entityId => ({
          id: this.generateId('grid_entity'),
          entity: entityId,
        }));

      entities = [...entities, ...autoEntities];
    }

    // Remove hidden entities
    entities = entities.filter(e => !e.hidden);

    // Filter entities based on individual display conditions
    entities = entities.filter(entity => {
      // If no display_mode or it's 'always', show the entity
      if (!entity.display_mode || entity.display_mode === 'always') {
        return true;
      }

      // Evaluate display conditions using the logic service
      return logicService.evaluateDisplayConditions(
        entity.display_conditions || [],
        entity.display_mode
      );
    });

    return entities;
  }

  // Sort entities based on configuration
  private sortEntities(
    entities: GridEntity[],
    sortBy: GridSortBy,
    direction: 'asc' | 'desc',
    hass: HomeAssistant
  ): GridEntity[] {
    const sorted = [...entities].sort((a, b) => {
      const stateA = hass?.states?.[a.entity];
      const stateB = hass?.states?.[b.entity];

      let comparison = 0;

      switch (sortBy) {
        case 'name':
          const nameA = a.custom_name || stateA?.attributes?.friendly_name || a.entity;
          const nameB = b.custom_name || stateB?.attributes?.friendly_name || b.entity;
          comparison = nameA.localeCompare(nameB);
          break;

        case 'last_updated':
          const timeA = stateA?.last_updated ? new Date(stateA.last_updated).getTime() : 0;
          const timeB = stateB?.last_updated ? new Date(stateB.last_updated).getTime() : 0;
          comparison = timeA - timeB;
          break;

        case 'state':
          const valA = stateA?.state || '';
          const valB = stateB?.state || '';
          comparison = valA.localeCompare(valB);
          break;

        case 'domain':
          const domainA = a.entity.split('.')[0];
          const domainB = b.entity.split('.')[0];
          comparison = domainA.localeCompare(domainB);
          break;

        case 'custom':
        default:
          comparison = 0; // Keep original order
          break;
      }

      return direction === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }

  // Get paginated entities
  private getPaginatedEntities(
    entities: GridEntity[],
    module: GridModule,
    moduleId: string
  ): { entities: GridEntity[]; currentPage: number; totalPages: number } {
    if (!module.enable_pagination || module.items_per_page <= 0) {
      return { entities, currentPage: 1, totalPages: 1 };
    }

    const currentPage = this._currentPages.get(moduleId) || 1;
    const totalPages = Math.ceil(entities.length / module.items_per_page);
    const startIndex = (currentPage - 1) * module.items_per_page;
    const endIndex = startIndex + module.items_per_page;

    return {
      entities: entities.slice(startIndex, endIndex),
      currentPage,
      totalPages,
    };
  }

  // Get entity display info
  private getEntityDisplayInfo(
    entity: GridEntity,
    hass: HomeAssistant,
    module: GridModule
  ): { name: string; state: string; icon: string; isOn: boolean; isUnavailable: boolean; entityPicture: string | null } {
    const entityState = hass?.states?.[entity.entity];

    const name = entity.custom_name || entityState?.attributes?.friendly_name || entity.entity.split('.')[1] || entity.entity;
    const state = entityState?.state || 'unavailable';
    const icon = entity.custom_icon || entityState?.attributes?.icon || this.getDefaultIcon(entity.entity);
    const isOn = ['on', 'open', 'playing', 'home', 'active'].includes(state.toLowerCase());
    const isUnavailable = state === 'unavailable' || state === 'unknown';
    
    // Get entity_picture for person, camera, media_player entities (unless custom_icon is set)
    const entityPicture = !entity.custom_icon ? (entityState?.attributes?.entity_picture || null) : null;

    return { name, state, icon, isOn, isUnavailable, entityPicture };
  }

  // Get default icon based on domain
  private getDefaultIcon(entityId: string): string {
    const domain = entityId.split('.')[0];
    const domainIcons: Record<string, string> = {
      light: 'mdi:lightbulb',
      switch: 'mdi:toggle-switch',
      sensor: 'mdi:eye',
      binary_sensor: 'mdi:checkbox-marked-circle',
      climate: 'mdi:thermostat',
      cover: 'mdi:window-shutter',
      fan: 'mdi:fan',
      lock: 'mdi:lock',
      media_player: 'mdi:cast',
      vacuum: 'mdi:robot-vacuum',
      camera: 'mdi:video',
      automation: 'mdi:robot',
      script: 'mdi:script',
      scene: 'mdi:palette',
      input_boolean: 'mdi:toggle-switch-outline',
      input_number: 'mdi:ray-vertex',
      input_select: 'mdi:format-list-bulleted',
      input_text: 'mdi:form-textbox',
      person: 'mdi:account',
      device_tracker: 'mdi:crosshairs-gps',
      weather: 'mdi:weather-partly-cloudy',
      sun: 'mdi:white-balance-sunny',
      zone: 'mdi:map-marker',
      timer: 'mdi:timer',
      counter: 'mdi:counter',
      alarm_control_panel: 'mdi:shield-home',
      water_heater: 'mdi:water-boiler',
      humidifier: 'mdi:air-humidifier',
    };
    return domainIcons[domain] || 'mdi:help-circle';
  }

  // Get icon color based on state
  private getIconColor(
    entity: GridEntity,
    isOn: boolean,
    isUnavailable: boolean,
    module: GridModule
  ): string {
    if (entity.custom_color) return entity.custom_color;

    // Check state-based colors
    if (entity.state_colors) {
      const state = this._hass?.states?.[entity.entity]?.state;
      if (state && entity.state_colors[state]) {
        return entity.state_colors[state];
      }
    }

    if (isUnavailable) return module.global_unavailable_color || 'var(--disabled-color)';
    if (isOn) return module.global_on_color || module.global_icon_color || 'var(--state-active-color)';
    return module.global_off_color || module.global_icon_color || 'var(--primary-color)';
  }

  // Get smart default action based on entity domain
  private getSmartDefaultAction(entityId: string, hass: HomeAssistant): ModuleActionConfig {
    const domain = entityId.split('.')[0];
    const entityState = hass?.states?.[entityId];
    
    // Domains that support toggle
    const toggleDomains = [
      'light', 'switch', 'fan', 'input_boolean', 'automation', 
      'script', 'scene', 'cover', 'lock', 'vacuum', 'media_player',
      'climate', 'humidifier', 'water_heater'
    ];
    
    if (toggleDomains.includes(domain)) {
      return { action: 'toggle', entity: entityId };
    }
    
    // Special handling for specific domains
    switch (domain) {
      case 'button':
      case 'input_button':
        return { action: 'perform-action', perform_action: 'button.press', target: { entity_id: entityId } };
      case 'script':
        return { action: 'perform-action', perform_action: 'script.turn_on', target: { entity_id: entityId } };
      case 'scene':
        return { action: 'perform-action', perform_action: 'scene.turn_on', target: { entity_id: entityId } };
      case 'number':
      case 'input_number':
      case 'input_select':
      case 'input_text':
      case 'sensor':
      case 'binary_sensor':
      case 'weather':
      case 'person':
      case 'device_tracker':
      case 'zone':
      case 'sun':
      case 'calendar':
      default:
        // For sensors and other non-controllable entities, show more-info
        return { action: 'more-info', entity: entityId };
    }
  }

  // Get or create gesture state for an entity
  private getGestureState(entityId: string) {
    if (!this._gestureState.has(entityId)) {
      this._gestureState.set(entityId, {
        holdTimeout: null,
        clickTimeout: null,
        isHolding: false,
        clickCount: 0,
        lastClickTime: 0,
      });
    }
    return this._gestureState.get(entityId)!;
  }

  // Resolve action for a given action type (tap, hold, double_tap)
  private resolveAction(
    actionType: 'tap' | 'hold' | 'double_tap',
    entity: GridEntity,
    module: GridModule,
    hass: HomeAssistant
  ): ModuleActionConfig | null {
    let action: ModuleActionConfig | undefined;
    
    // Check entity override first
    if (entity.override_actions) {
      if (actionType === 'tap' && entity.tap_action) {
        action = entity.tap_action;
      } else if (actionType === 'hold' && entity.hold_action) {
        action = entity.hold_action;
      } else if (actionType === 'double_tap' && entity.double_tap_action) {
        action = entity.double_tap_action;
      }
    }
    
    // Fall back to module-level action
    if (!action) {
      if (actionType === 'tap') {
        action = module.tap_action;
      } else if (actionType === 'hold') {
        action = module.hold_action;
      } else if (actionType === 'double_tap') {
        action = module.double_tap_action;
      }
    }
    
    // If action is 'default', use smart domain-based action (for tap only)
    if (action?.action === 'default') {
      if (actionType === 'tap') {
        action = this.getSmartDefaultAction(entity.entity, hass);
      } else {
        // For hold/double-tap, 'default' means more-info
        action = { action: 'more-info', entity: entity.entity };
      }
    }
    
    // Check if action should be executed
    if (!action || action.action === 'nothing' || (action as any).action === 'none') {
      return null;
    }
    
    // Ensure entity is set for more-info and toggle actions
    const actionConfig = { ...action };
    if ((actionConfig.action === 'more-info' || actionConfig.action === 'toggle') && !actionConfig.entity) {
      actionConfig.entity = entity.entity;
    }
    
    return actionConfig;
  }

  // Handle pointer down for gesture detection
  private handleItemPointerDown(
    event: PointerEvent,
    entity: GridEntity,
    module: GridModule,
    hass: HomeAssistant
  ): void {
    event.preventDefault();
    const state = this.getGestureState(entity.id);
    state.isHolding = false;
    
    // Start hold timer
    state.holdTimeout = setTimeout(() => {
      state.isHolding = true;
      
      // Execute hold action
      const action = this.resolveAction('hold', entity, module, hass);
      if (action) {
        this.handleModuleAction(action, hass, event.target as HTMLElement);
      }
    }, 500); // 500ms hold threshold
  }

  // Handle pointer up for gesture detection  
  private handleItemPointerUp(
    event: PointerEvent,
    entity: GridEntity,
    module: GridModule,
    hass: HomeAssistant
  ): void {
    event.preventDefault();
    const state = this.getGestureState(entity.id);
    
    // Clear hold timer
    if (state.holdTimeout) {
      clearTimeout(state.holdTimeout);
      state.holdTimeout = null;
    }
    
    // If this was a hold gesture, don't process as click
    if (state.isHolding) {
      state.isHolding = false;
      return;
    }
    
    const now = Date.now();
    const timeSinceLastClick = now - state.lastClickTime;
    
    // Double click detection (within 300ms)
    if (timeSinceLastClick < 300 && state.clickCount === 1) {
      // This is a double click
      if (state.clickTimeout) {
        clearTimeout(state.clickTimeout);
        state.clickTimeout = null;
      }
      state.clickCount = 0;
      
      // Execute double-tap action
      const action = this.resolveAction('double_tap', entity, module, hass);
      if (action) {
        this.handleModuleAction(action, hass, event.target as HTMLElement);
      }
    } else {
      // This might be a single click, but wait to see if double click follows
      state.clickCount = 1;
      state.lastClickTime = now;
      
      state.clickTimeout = setTimeout(() => {
        // This is a single click
        state.clickCount = 0;
        
        // Execute tap action
        const action = this.resolveAction('tap', entity, module, hass);
        if (action) {
          this.handleModuleAction(action, hass, event.target as HTMLElement);
        }
      }, 300); // Wait 300ms to see if double click follows
    }
  }

  // Handle pointer cancel/leave
  private handleItemPointerCancel(entity: GridEntity): void {
    const state = this.getGestureState(entity.id);
    if (state.holdTimeout) {
      clearTimeout(state.holdTimeout);
      state.holdTimeout = null;
    }
    state.isHolding = false;
  }

  // Render Actions Tab
  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as GridModule, hass, updates =>
      updateModule(updates)
    );
  }

  // Render Logic Tab
  renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as GridModule, hass, updates =>
      updateModule(updates)
    );
  }

  // Render General Tab
  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const gridModule = module as GridModule;
    const lang = hass?.locale?.language || 'en';
    this._hass = hass;

    // Get current style config for styling sections
    const styleConfig = getStyleConfig(gridModule.grid_style || 'style_1');

    const styleOptions = GRID_STYLE_PRESETS.map(style => ({
      value: style.id,
      label: `${style.name} - ${style.description}`,
    }));

    // Check if current style supports variable heights (masonry/metro)
    const currentStyleConfig = getStyleConfig(gridModule.grid_style || 'style_1');
    const supportsVariableHeight = currentStyleConfig.supportsVariableHeight;

    // Only show masonry/metro options if the style supports it
    const displayModeOptions = supportsVariableHeight
      ? [
          { value: 'grid', label: 'Regular Grid' },
          { value: 'masonry', label: 'Masonry' },
          { value: 'metro', label: 'Metro Tiles' },
        ]
      : [{ value: 'grid', label: 'Regular Grid' }];

    const sortOptions = [
      { value: 'name', label: 'Name' },
      { value: 'last_updated', label: 'Last Updated' },
      { value: 'state', label: 'State' },
      { value: 'domain', label: 'Domain' },
      { value: 'custom', label: 'Custom Order' },
    ];

    const paginationStyleOptions = [
      { value: 'numbers', label: 'Page Numbers' },
      { value: 'buttons', label: 'Prev/Next Buttons' },
      { value: 'both', label: 'Both' },
    ];

    const animationOptions = [
      { value: 'none', label: 'None' },
      { value: 'fadeIn', label: 'Fade In' },
      { value: 'slideUp', label: 'Slide Up' },
      { value: 'slideDown', label: 'Slide Down' },
      { value: 'slideLeft', label: 'Slide Left' },
      { value: 'slideRight', label: 'Slide Right' },
      { value: 'zoomIn', label: 'Zoom In' },
    ];

    const availableDomains = this.getAvailableDomains(hass);

    return html`
      ${this.injectUcFormStyles()}
      <style>
        ${this.getEditorStyles()}
      </style>

      <div class="module-settings">
        <!-- Entity Selection Section -->
        <div class="settings-section">
          <div class="section-title">ENTITIES</div>

          <div class="entity-rows-container">
            ${(gridModule.entities || []).map((entity, index) =>
              this.renderEntityRow(entity, index, gridModule, hass, updateModule)
            )}
          </div>

          <button
            class="add-entity-btn"
            @click=${() => {
              const newEntity: GridEntity = {
                id: this.generateId('grid_entity'),
                entity: '',
              };
              updateModule({
                entities: [...(gridModule.entities || []), newEntity],
              });
              this._expandedEntities.add(newEntity.id);
            }}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Entity
          </button>

          <!-- Auto Filter Toggle -->
          <div style="margin-top: 24px;">
            ${this.renderSettingsSection('', '', [
              {
                title: 'Enable Auto Filter',
                description: 'Automatically include entities from selected domains.',
                hass,
                data: { enable_auto_filter: gridModule.enable_auto_filter || false },
                schema: [this.booleanField('enable_auto_filter')],
                onChange: (e: CustomEvent) =>
                  updateModule({ enable_auto_filter: e.detail.value.enable_auto_filter }),
              },
            ])}
          </div>

          ${gridModule.enable_auto_filter
            ? html`
                <div class="conditional-group">
                  <!-- Include Domains -->
                  <div class="field-container">
                    <div class="field-title">Include Domains</div>
                    <div class="field-description">Select domains to include in the grid.</div>
                    <div class="chips-container">
                      ${(gridModule.include_domains || []).map(
                        domain => html`
                          <div class="filter-chip">
                            ${domain}
                            <ha-icon
                              icon="mdi:close"
                              class="chip-remove-icon"
                              @click=${() => {
                                updateModule({
                                  include_domains: (gridModule.include_domains || []).filter(
                                    d => d !== domain
                                  ),
                                });
                              }}
                            ></ha-icon>
                          </div>
                        `
                      )}
                    </div>
                    <div class="domain-input-row">
                      <select
                        class="domain-select"
                        @change=${(e: Event) => {
                          const target = e.target as HTMLSelectElement;
                          const domain = target.value;
                          if (domain && !(gridModule.include_domains || []).includes(domain)) {
                            updateModule({
                              include_domains: [...(gridModule.include_domains || []), domain],
                            });
                          }
                          target.value = '';
                        }}
                      >
                        <option value="">Select domain to include...</option>
                        ${availableDomains
                          .filter(d => !(gridModule.include_domains || []).includes(d))
                          .map(domain => html`<option value="${domain}">${domain}</option>`)}
                      </select>
                    </div>
                  </div>

                  <!-- Exclude Domains -->
                  <div class="field-container">
                    <div class="field-title">Exclude Domains</div>
                    <div class="field-description">Select domains to exclude from the grid.</div>
                    <div class="chips-container">
                      ${(gridModule.exclude_domains || []).map(
                        domain => html`
                          <div class="filter-chip exclude-chip">
                            ${domain}
                            <ha-icon
                              icon="mdi:close"
                              class="chip-remove-icon"
                              @click=${() => {
                                updateModule({
                                  exclude_domains: (gridModule.exclude_domains || []).filter(
                                    d => d !== domain
                                  ),
                                });
                              }}
                            ></ha-icon>
                          </div>
                        `
                      )}
                    </div>
                    <div class="domain-input-row">
                      <select
                        class="domain-select"
                        @change=${(e: Event) => {
                          const target = e.target as HTMLSelectElement;
                          const domain = target.value;
                          if (domain && !(gridModule.exclude_domains || []).includes(domain)) {
                            updateModule({
                              exclude_domains: [...(gridModule.exclude_domains || []), domain],
                            });
                          }
                          target.value = '';
                        }}
                      >
                        <option value="">Select domain to exclude...</option>
                        ${availableDomains
                          .filter(d => !(gridModule.exclude_domains || []).includes(d))
                          .map(domain => html`<option value="${domain}">${domain}</option>`)}
                      </select>
                    </div>
                  </div>

                  <!-- Include Keywords -->
                  <div class="field-container">
                    <div class="field-title">Include Keywords</div>
                    <div class="field-description">Only show entities containing these words (case-insensitive).</div>
                    <div class="chips-container">
                      ${(gridModule.include_keywords || []).map(
                        keyword => html`
                          <div class="filter-chip">
                            ${keyword}
                            <ha-icon
                              icon="mdi:close"
                              class="chip-remove-icon"
                              @click=${() => {
                                updateModule({
                                  include_keywords: (gridModule.include_keywords || []).filter(
                                    k => k !== keyword
                                  ),
                                });
                              }}
                            ></ha-icon>
                          </div>
                        `
                      )}
                    </div>
                    <div class="keyword-input-row">
                      <input
                        type="text"
                        class="keyword-input"
                        placeholder="Type keyword and press Enter..."
                        @keydown=${(e: KeyboardEvent) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement;
                            const keyword = target.value.trim();
                            if (keyword && !(gridModule.include_keywords || []).includes(keyword)) {
                              updateModule({
                                include_keywords: [...(gridModule.include_keywords || []), keyword],
                              });
                            }
                            target.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>

                  <!-- Exclude Keywords -->
                  <div class="field-container">
                    <div class="field-title">Exclude Keywords</div>
                    <div class="field-description">Hide entities containing these words (case-insensitive).</div>
                    <div class="chips-container">
                      ${(gridModule.exclude_keywords || []).map(
                        keyword => html`
                          <div class="filter-chip exclude-chip">
                            ${keyword}
                            <ha-icon
                              icon="mdi:close"
                              class="chip-remove-icon"
                              @click=${() => {
                                updateModule({
                                  exclude_keywords: (gridModule.exclude_keywords || []).filter(
                                    k => k !== keyword
                                  ),
                                });
                              }}
                            ></ha-icon>
                          </div>
                        `
                      )}
                    </div>
                    <div class="keyword-input-row">
                      <input
                        type="text"
                        class="keyword-input"
                        placeholder="Type keyword and press Enter..."
                        @keydown=${(e: KeyboardEvent) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement;
                            const keyword = target.value.trim();
                            if (keyword && !(gridModule.exclude_keywords || []).includes(keyword)) {
                              updateModule({
                                exclude_keywords: [...(gridModule.exclude_keywords || []), keyword],
                              });
                            }
                            target.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>

                  <!-- Entity Count Info -->
                  <div class="info-box">
                    <ha-icon icon="mdi:information"></ha-icon>
                    <span>
                      ${this.getFilteredEntities(gridModule, hass).length} entities match your filters
                    </span>
                  </div>
                </div>
              `
            : ''}
        </div>

        <!-- Grid Style Section -->
        <div class="settings-section">
          <div class="section-title">GRID STYLE</div>

          ${UcFormUtils.renderFieldSection(
            'Style Preset',
            'Choose a visual style for your grid items.',
            hass,
            { grid_style: gridModule.grid_style || 'style_1' },
            [UcFormUtils.select('grid_style', styleOptions)],
            (e: CustomEvent) => {
              const newStyle = e.detail.value.grid_style as GridStylePreset;
              const styleConfig = getStyleConfig(newStyle);
              // Reset display mode to 'grid' if the new style doesn't support variable heights
              const displayModeUpdate = !styleConfig.supportsVariableHeight && gridModule.grid_display_mode !== 'grid'
                ? { grid_display_mode: 'grid' as GridDisplayMode }
                : {};
              updateModule({
                grid_style: newStyle,
                global_icon_size: styleConfig.defaultIconSize,
                global_font_size: styleConfig.defaultFontSize,
                global_padding: styleConfig.defaultPadding,
                global_border_radius: styleConfig.defaultBorderRadius,
                ...displayModeUpdate,
              });
            }
          )}

        </div>

        <!-- Layout Section -->
        <div class="settings-section">
          <div class="section-title">LAYOUT</div>

          ${UcFormUtils.renderFieldSection(
            'Display Mode',
            'How items are arranged in the grid.',
            hass,
            { grid_display_mode: gridModule.grid_display_mode || 'grid' },
            [UcFormUtils.select('grid_display_mode', displayModeOptions)],
            (e: CustomEvent) => updateModule({ grid_display_mode: e.detail.value.grid_display_mode })
          )}

          <div class="field-container">
            <div class="field-title">Columns (${gridModule.columns || 4})</div>
            <div class="field-description">Number of columns in the grid (1-12).</div>
            <div class="number-range-control">
              <input
                type="range"
                class="range-slider"
                min="1"
                max="12"
                step="1"
                .value="${String(gridModule.columns || 4)}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  updateModule({ columns: parseInt(target.value, 10) });
                }}
              />
              <input
                type="number"
                class="range-input"
                min="1"
                max="12"
                step="1"
                .value="${String(gridModule.columns || 4)}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = parseInt(target.value, 10);
                  if (!isNaN(value) && value >= 1 && value <= 12) {
                    updateModule({ columns: value });
                  }
                }}
              />
              <button
                class="range-reset-btn"
                @click=${() => updateModule({ columns: 4 })}
                title="Reset to default (4)"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>

          <div class="field-container">
            <div class="field-title">Gap (${gridModule.gap || 12}px)</div>
            <div class="field-description">Space between grid items in pixels.</div>
            <div class="number-range-control">
              <input
                type="range"
                class="range-slider"
                min="0"
                max="32"
                step="2"
                .value="${String(gridModule.gap || 12)}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  updateModule({ gap: parseInt(target.value, 10) });
                }}
              />
              <input
                type="number"
                class="range-input"
                min="0"
                max="32"
                step="2"
                .value="${String(gridModule.gap || 12)}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = parseInt(target.value, 10);
                  if (!isNaN(value)) {
                    updateModule({ gap: value });
                  }
                }}
              />
              <button
                class="range-reset-btn"
                @click=${() => updateModule({ gap: 12 })}
                title="Reset to default (12)"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Sorting Section -->
        <div class="settings-section">
          <div class="section-title">SORTING & DISPLAY</div>

          ${UcFormUtils.renderFieldSection(
            'Sort By',
            'How to sort the grid items.',
            hass,
            { sort_by: gridModule.sort_by || 'name' },
            [UcFormUtils.select('sort_by', sortOptions)],
            (e: CustomEvent) => updateModule({ sort_by: e.detail.value.sort_by })
          )}

          ${this.renderSettingsSection('', '', [
            {
              title: 'Invert Sort Order',
              description: 'Reverse the sort direction.',
              hass,
              data: { sort_direction: gridModule.sort_direction === 'desc' },
              schema: [this.booleanField('sort_direction')],
              onChange: (e: CustomEvent) =>
                updateModule({
                  sort_direction: e.detail.value.sort_direction ? 'desc' : 'asc',
                }),
            },
          ])}

          <div class="field-container">
            <div class="field-title">Max Items (${gridModule.max_items || 0} = All)</div>
            <div class="field-description">Maximum number of items to display.</div>
            <div class="number-range-control">
              <input
                type="range"
                class="range-slider"
                min="0"
                max="100"
                step="1"
                .value="${String(gridModule.max_items || 0)}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  updateModule({ max_items: parseInt(target.value, 10) });
                }}
              />
              <input
                type="number"
                class="range-input"
                min="0"
                step="1"
                .value="${String(gridModule.max_items || 0)}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = parseInt(target.value, 10);
                  if (!isNaN(value)) {
                    updateModule({ max_items: value });
                  }
                }}
              />
              <button
                class="range-reset-btn"
                @click=${() => updateModule({ max_items: 0 })}
                title="Reset to default (0 = All)"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination Section -->
        <div class="settings-section">
          <div class="section-title">PAGINATION</div>

          ${this.renderSettingsSection('', '', [
            {
              title: 'Enable Pagination',
              description: 'Show pagination controls.',
              hass,
              data: { enable_pagination: gridModule.enable_pagination || false },
              schema: [this.booleanField('enable_pagination')],
              onChange: (e: CustomEvent) =>
                updateModule({ enable_pagination: e.detail.value.enable_pagination }),
            },
          ])}

          ${gridModule.enable_pagination
            ? html`
                <div class="conditional-group">
                  ${UcFormUtils.renderFieldSection(
                    'Pagination Style',
                    'Type of pagination controls.',
                    hass,
                    { pagination_style: gridModule.pagination_style || 'both' },
                    [UcFormUtils.select('pagination_style', paginationStyleOptions)],
                    (e: CustomEvent) =>
                      updateModule({ pagination_style: e.detail.value.pagination_style })
                  )}

                  <div class="field-container">
                    <div class="field-title">Items Per Page (${gridModule.items_per_page || 12})</div>
                    <div class="field-description">Number of items per page.</div>
                    <div class="number-range-control">
                      <input
                        type="range"
                        class="range-slider"
                        min="4"
                        max="48"
                        step="4"
                        .value="${String(gridModule.items_per_page || 12)}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          updateModule({ items_per_page: parseInt(target.value, 10) });
                        }}
                      />
                      <input
                        type="number"
                        class="range-input"
                        min="1"
                        step="1"
                        .value="${String(gridModule.items_per_page || 12)}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          const value = parseInt(target.value, 10);
                          if (!isNaN(value) && value > 0) {
                            updateModule({ items_per_page: value });
                          }
                        }}
                      />
                      <button
                        class="range-reset-btn"
                        @click=${() => updateModule({ items_per_page: 12 })}
                        title="Reset to default (12)"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>
                </div>
              `
            : ''}
        </div>

        <!-- Animation Section -->
        <div class="settings-section">
          <div class="section-title">ANIMATION</div>

          ${this.renderSettingsSection('', '', [
            {
              title: 'Enable Load Animation',
              description: 'Animate items when they first appear.',
              hass,
              data: { enable_load_animation: gridModule.enable_load_animation !== false },
              schema: [this.booleanField('enable_load_animation')],
              onChange: (e: CustomEvent) =>
                updateModule({ enable_load_animation: e.detail.value.enable_load_animation }),
            },
          ])}

          ${gridModule.enable_load_animation !== false
            ? html`
                <div class="conditional-group">
                  ${UcFormUtils.renderFieldSection(
                    'Animation Type',
                    'The animation effect for items.',
                    hass,
                    { load_animation: gridModule.load_animation || 'fadeIn' },
                    [UcFormUtils.select('load_animation', animationOptions)],
                    (e: CustomEvent) =>
                      updateModule({ load_animation: e.detail.value.load_animation })
                  )}

                  <div class="field-container">
                    <div class="field-title">Animation Duration (${gridModule.grid_animation_duration || 600}ms)</div>
                    <div class="field-description">How long each animation takes.</div>
                    <div class="number-range-control">
                      <input
                        type="range"
                        class="range-slider"
                        min="200"
                        max="2000"
                        step="100"
                        .value="${String(gridModule.grid_animation_duration || 600)}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          updateModule({ grid_animation_duration: parseInt(target.value, 10) });
                        }}
                      />
                      <input
                        type="number"
                        class="range-input"
                        min="100"
                        step="50"
                        .value="${String(gridModule.grid_animation_duration || 600)}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          const value = parseInt(target.value, 10);
                          if (!isNaN(value)) {
                            updateModule({ grid_animation_duration: value });
                          }
                        }}
                      />
                      <button
                        class="range-reset-btn"
                        @click=${() => updateModule({ grid_animation_duration: 600 })}
                        title="Reset to default (600)"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>

                  <div class="field-container">
                    <div class="field-title">Stagger Delay (${gridModule.animation_stagger || 100}ms)</div>
                    <div class="field-description">Delay between each item's animation.</div>
                    <div class="number-range-control">
                      <input
                        type="range"
                        class="range-slider"
                        min="0"
                        max="300"
                        step="10"
                        .value="${String(gridModule.animation_stagger || 100)}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          updateModule({ animation_stagger: parseInt(target.value, 10) });
                        }}
                      />
                      <input
                        type="number"
                        class="range-input"
                        min="0"
                        step="10"
                        .value="${String(gridModule.animation_stagger || 100)}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          const value = parseInt(target.value, 10);
                          if (!isNaN(value)) {
                            updateModule({ animation_stagger: value });
                          }
                        }}
                      />
                      <button
                        class="range-reset-btn"
                        @click=${() => updateModule({ animation_stagger: 100 })}
                        title="Reset to default (100)"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>
                </div>
              `
            : ''}
        </div>

        ${this.renderGridStylingSection(gridModule, hass, styleConfig, updateModule)}
      </div>
    `;
  }

  // Render grid styling section (colors, sizing, hover effects)
  private renderGridStylingSection(
    gridModule: GridModule,
    hass: HomeAssistant,
    styleConfig: GridStyleConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const hoverEffectOptions = [
      { value: 'none', label: 'None' },
      { value: 'scale', label: 'Scale' },
      { value: 'glow', label: 'Glow' },
      { value: 'lift', label: 'Lift' },
      { value: 'color', label: 'Color Change' },
    ];

    return html`
      <!-- Icon Styling (if style shows icons) -->
      ${styleConfig.showIcon
        ? html`
            <div class="settings-section">
              <div class="section-title">ICON STYLING</div>

              <div class="field-container">
                <div class="field-title">Icon Size (${gridModule.global_icon_size || 32}px)</div>
                <div class="field-description">Size of icons in pixels.</div>
                <div class="number-range-control">
                  <input
                    type="range"
                    class="range-slider"
                    min="16"
                    max="72"
                    step="2"
                    .value="${String(gridModule.global_icon_size || 32)}"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      updateModule({ global_icon_size: parseInt(target.value, 10) });
                    }}
                  />
                  <input
                    type="number"
                    class="range-input"
                    min="12"
                    max="100"
                    step="1"
                    .value="${String(gridModule.global_icon_size || 32)}"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const value = parseInt(target.value, 10);
                      if (!isNaN(value)) {
                        updateModule({ global_icon_size: value });
                      }
                    }}
                  />
                  <button
                    class="range-reset-btn"
                    @click=${() => updateModule({ global_icon_size: styleConfig.defaultIconSize })}
                    title="Reset to default"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>

              <div class="color-field">
                <div class="field-title">Icon Color (Default)</div>
                <div class="field-description">Default color for icons.</div>
                <ultra-color-picker
                  .hass=${hass}
                  .value=${gridModule.global_icon_color || 'var(--primary-color)'}
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({ global_icon_color: e.detail.value });
                  }}
                ></ultra-color-picker>
              </div>

              <div class="color-field">
                <div class="field-title">Active/On Color</div>
                <div class="field-description">Color when entity is on/active.</div>
                <ultra-color-picker
                  .hass=${hass}
                  .value=${gridModule.global_on_color || 'var(--state-active-color)'}
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({ global_on_color: e.detail.value });
                  }}
                ></ultra-color-picker>
              </div>

              <div class="color-field">
                <div class="field-title">Inactive/Off Color</div>
                <div class="field-description">Color when entity is off/inactive.</div>
                <ultra-color-picker
                  .hass=${hass}
                  .value=${gridModule.global_off_color || 'var(--secondary-text-color)'}
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({ global_off_color: e.detail.value });
                  }}
                ></ultra-color-picker>
              </div>

              <div class="color-field">
                <div class="field-title">Unavailable Color</div>
                <div class="field-description">Color when entity is unavailable.</div>
                <ultra-color-picker
                  .hass=${hass}
                  .value=${gridModule.global_unavailable_color || 'var(--disabled-color)'}
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({ global_unavailable_color: e.detail.value });
                  }}
                ></ultra-color-picker>
              </div>
            </div>
          `
        : ''}

      <!-- Text Styling (if style shows name or state) -->
      ${styleConfig.showName || styleConfig.showState
        ? html`
            <div class="settings-section">
              <div class="section-title">TEXT STYLING</div>

              <div class="field-container">
                <div class="field-title">Font Size (${gridModule.global_font_size || 12}px)</div>
                <div class="field-description">Base font size for text.</div>
                <div class="number-range-control">
                  <input
                    type="range"
                    class="range-slider"
                    min="10"
                    max="24"
                    step="1"
                    .value="${String(gridModule.global_font_size || 12)}"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      updateModule({ global_font_size: parseInt(target.value, 10) });
                    }}
                  />
                  <input
                    type="number"
                    class="range-input"
                    min="8"
                    max="36"
                    step="1"
                    .value="${String(gridModule.global_font_size || 12)}"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const value = parseInt(target.value, 10);
                      if (!isNaN(value)) {
                        updateModule({ global_font_size: value });
                      }
                    }}
                  />
                  <button
                    class="range-reset-btn"
                    @click=${() => updateModule({ global_font_size: styleConfig.defaultFontSize })}
                    title="Reset to default"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>

              ${styleConfig.showName
                ? html`
                    <div class="color-field">
                      <div class="field-title">Name Color</div>
                      <div class="field-description">Color for entity names.</div>
                      <ultra-color-picker
                        .hass=${hass}
                        .value=${gridModule.global_name_color || 'var(--primary-text-color)'}
                        @value-changed=${(e: CustomEvent) => {
                          updateModule({ global_name_color: e.detail.value });
                        }}
                      ></ultra-color-picker>
                    </div>
                  `
                : ''}

              ${styleConfig.showState
                ? html`
                    <div class="color-field">
                      <div class="field-title">State Color</div>
                      <div class="field-description">Color for state text.</div>
                      <ultra-color-picker
                        .hass=${hass}
                        .value=${gridModule.global_state_color || 'var(--secondary-text-color)'}
                        @value-changed=${(e: CustomEvent) => {
                          updateModule({ global_state_color: e.detail.value });
                        }}
                      ></ultra-color-picker>
                    </div>
                  `
                : ''}
            </div>
          `
        : ''}

      <!-- Item Styling -->
      <div class="settings-section">
        <div class="section-title">ITEM STYLING</div>

        <div class="color-field">
          <div class="field-title">Item Background</div>
          <div class="field-description">Background color for grid items.</div>
          <ultra-color-picker
            .hass=${hass}
            .value=${gridModule.global_background_color || 'var(--card-background-color)'}
            @value-changed=${(e: CustomEvent) => {
              updateModule({ global_background_color: e.detail.value });
            }}
          ></ultra-color-picker>
        </div>

        ${UcFormUtils.renderFieldSection(
          'Border Radius',
          'Corner rounding for items (e.g., 8px or 50% for circles).',
          hass,
          { global_border_radius: gridModule.global_border_radius || '12px' },
          [UcFormUtils.text('global_border_radius')],
          (e: CustomEvent) =>
            updateModule({ global_border_radius: e.detail.value.global_border_radius })
        )}

        ${UcFormUtils.renderFieldSection(
          'Item Padding',
          'Inner spacing for items (e.g., 16px or 12px 16px).',
          hass,
          { global_padding: gridModule.global_padding || '16px' },
          [UcFormUtils.text('global_padding')],
          (e: CustomEvent) =>
            updateModule({ global_padding: e.detail.value.global_padding })
        )}

        <div class="field-container">
          <div class="field-title">Border Width (${gridModule.global_border_width || 0}px)</div>
          <div class="field-description">Border thickness in pixels.</div>
          <div class="number-range-control">
            <input
              type="range"
              class="range-slider"
              min="0"
              max="4"
              step="1"
              .value="${String(gridModule.global_border_width || 0)}"
              @input=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                updateModule({ global_border_width: parseInt(target.value, 10) });
              }}
            />
            <input
              type="number"
              class="range-input"
              min="0"
              max="10"
              step="1"
              .value="${String(gridModule.global_border_width || 0)}"
              @input=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                const value = parseInt(target.value, 10);
                if (!isNaN(value)) {
                  updateModule({ global_border_width: value });
                }
              }}
            />
            <button
              class="range-reset-btn"
              @click=${() => updateModule({ global_border_width: 0 })}
              title="Reset to default (0)"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        ${(gridModule.global_border_width || 0) > 0
          ? html`
              <div class="color-field" style="margin-top: 12px;">
                <div class="field-title">Border Color</div>
                <div class="field-description">Color for item borders.</div>
                <ultra-color-picker
                  .hass=${hass}
                  .value=${gridModule.global_border_color || 'var(--divider-color)'}
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({ global_border_color: e.detail.value });
                  }}
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>

      <!-- Style-Specific Colors -->
      ${this.renderStyleSpecificColors(gridModule, hass, styleConfig, updateModule)}

      <!-- Hover Effects -->
      <div class="settings-section">
        <div class="section-title">HOVER EFFECTS</div>

        ${this.renderSettingsSection('', '', [
          {
            title: 'Enable Hover Effect',
            description: 'Add visual feedback on hover.',
            hass,
            data: { enable_hover_effect: gridModule.enable_hover_effect !== false },
            schema: [this.booleanField('enable_hover_effect')],
            onChange: (e: CustomEvent) =>
              updateModule({ enable_hover_effect: e.detail.value.enable_hover_effect }),
          },
        ])}

        ${gridModule.enable_hover_effect !== false
          ? html`
              <div class="conditional-group">
                ${UcFormUtils.renderFieldSection(
                  'Hover Effect',
                  'Type of hover animation.',
                  hass,
                  { hover_effect: gridModule.hover_effect || 'scale' },
                  [UcFormUtils.select('hover_effect', hoverEffectOptions)],
                  (e: CustomEvent) =>
                    updateModule({ hover_effect: e.detail.value.hover_effect })
                )}

                ${gridModule.hover_effect === 'scale'
                  ? html`
                      <div class="field-container">
                        <div class="field-title">Scale Amount (${gridModule.hover_scale || 1.05}x)</div>
                        <div class="field-description">How much to scale on hover.</div>
                        <div class="number-range-control">
                          <input
                            type="range"
                            class="range-slider"
                            min="1"
                            max="1.2"
                            step="0.01"
                            .value="${String(gridModule.hover_scale || 1.05)}"
                            @input=${(e: Event) => {
                              const target = e.target as HTMLInputElement;
                              updateModule({ hover_scale: parseFloat(target.value) });
                            }}
                          />
                          <input
                            type="number"
                            class="range-input"
                            min="1"
                            max="1.5"
                            step="0.01"
                            .value="${String(gridModule.hover_scale || 1.05)}"
                            @input=${(e: Event) => {
                              const target = e.target as HTMLInputElement;
                              const value = parseFloat(target.value);
                              if (!isNaN(value)) {
                                updateModule({ hover_scale: value });
                              }
                            }}
                          />
                          <button
                            class="range-reset-btn"
                            @click=${() => updateModule({ hover_scale: 1.05 })}
                            title="Reset to default (1.05)"
                          >
                            <ha-icon icon="mdi:refresh"></ha-icon>
                          </button>
                        </div>
                      </div>
                    `
                  : ''}

                ${gridModule.hover_effect === 'color'
                  ? html`
                      <div class="color-field">
                        <div class="field-title">Hover Background Color</div>
                        <div class="field-description">Background color on hover.</div>
                        <ultra-color-picker
                          .hass=${hass}
                          .value=${gridModule.hover_background_color || 'var(--primary-color)'}
                          @value-changed=${(e: CustomEvent) => {
                            updateModule({ hover_background_color: e.detail.value });
                          }}
                        ></ultra-color-picker>
                      </div>
                    `
                  : ''}

                ${gridModule.hover_effect === 'glow'
                  ? html`
                      <div class="color-field">
                        <div class="field-title">Glow Color</div>
                        <div class="field-description">Color of the glow effect.</div>
                        <ultra-color-picker
                          .hass=${hass}
                          .value=${gridModule.hover_glow_color || 'var(--primary-color)'}
                          @value-changed=${(e: CustomEvent) => {
                            updateModule({ hover_glow_color: e.detail.value });
                          }}
                        ></ultra-color-picker>
                      </div>
                    `
                  : ''}
              </div>
            `
          : ''}
      </div>
    `;
  }

  // Render Entities Tab (custom tab for entity management)
  renderEntitiesTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const gridModule = module as GridModule;
    const lang = hass?.locale?.language || 'en';
    const availableDomains = this.getAvailableDomains(hass);

    return html`
      ${this.injectUcFormStyles()}
      <style>
        ${this.getEditorStyles()}
      </style>

      <div class="module-settings">
        <!-- Manual Entity Selection -->
        <div class="settings-section">
          <div class="section-title">ENTITIES</div>

          <div class="entity-rows-container">
            ${(gridModule.entities || []).map((entity, index) =>
              this.renderEntityRow(entity, index, gridModule, hass, updateModule)
            )}
          </div>

          <button
            class="add-entity-btn"
            @click=${() => {
              const newEntity: GridEntity = {
                id: this.generateId('grid_entity'),
                entity: '',
              };
              updateModule({
                entities: [...(gridModule.entities || []), newEntity],
              });
              this._expandedEntities.add(newEntity.id);
            }}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Entity
          </button>
        </div>

        <!-- Auto Filter Section -->
        <div class="settings-section">
          <div class="section-title">AUTO FILTER</div>

          ${this.renderSettingsSection('', '', [
            {
              title: 'Enable Auto Filter',
              description: 'Automatically include entities from selected domains.',
              hass,
              data: { enable_auto_filter: gridModule.enable_auto_filter || false },
              schema: [this.booleanField('enable_auto_filter')],
              onChange: (e: CustomEvent) =>
                updateModule({ enable_auto_filter: e.detail.value.enable_auto_filter }),
            },
          ])}

          ${gridModule.enable_auto_filter
            ? html`
                <div class="conditional-group">
                  <!-- Include Domains -->
                  <div class="field-container">
                    <div class="field-title">Include Domains</div>
                    <div class="field-description">Select domains to include in the grid.</div>
                    <div class="chips-container">
                      ${(gridModule.include_domains || []).map(
                        domain => html`
                          <div class="filter-chip">
                            ${domain}
                            <ha-icon
                              icon="mdi:close"
                              class="chip-remove-icon"
                              @click=${() => {
                                updateModule({
                                  include_domains: (gridModule.include_domains || []).filter(
                                    d => d !== domain
                                  ),
                                });
                              }}
                            ></ha-icon>
                          </div>
                        `
                      )}
                    </div>
                    <div class="domain-input-row">
                      <select
                        class="domain-select"
                        @change=${(e: Event) => {
                          const target = e.target as HTMLSelectElement;
                          const domain = target.value;
                          if (
                            domain &&
                            !(gridModule.include_domains || []).includes(domain)
                          ) {
                            updateModule({
                              include_domains: [...(gridModule.include_domains || []), domain],
                            });
                          }
                          target.value = '';
                        }}
                      >
                        <option value="">Select domain...</option>
                        ${availableDomains
                          .filter(d => !(gridModule.include_domains || []).includes(d))
                          .map(domain => html`<option value="${domain}">${domain}</option>`)}
                      </select>
                    </div>
                  </div>

                  <!-- Exclude Domains -->
                  <div class="field-container">
                    <div class="field-title">Exclude Domains</div>
                    <div class="field-description">Select domains to exclude from the grid.</div>
                    <div class="chips-container">
                      ${(gridModule.exclude_domains || []).map(
                        domain => html`
                          <div class="filter-chip exclude-chip">
                            ${domain}
                            <ha-icon
                              icon="mdi:close"
                              class="chip-remove-icon"
                              @click=${() => {
                                updateModule({
                                  exclude_domains: (gridModule.exclude_domains || []).filter(
                                    d => d !== domain
                                  ),
                                });
                              }}
                            ></ha-icon>
                          </div>
                        `
                      )}
                    </div>
                    <div class="domain-input-row">
                      <select
                        class="domain-select"
                        @change=${(e: Event) => {
                          const target = e.target as HTMLSelectElement;
                          const domain = target.value;
                          if (
                            domain &&
                            !(gridModule.exclude_domains || []).includes(domain)
                          ) {
                            updateModule({
                              exclude_domains: [...(gridModule.exclude_domains || []), domain],
                            });
                          }
                          target.value = '';
                        }}
                      >
                        <option value="">Select domain...</option>
                        ${availableDomains
                          .filter(d => !(gridModule.exclude_domains || []).includes(d))
                          .map(domain => html`<option value="${domain}">${domain}</option>`)}
                      </select>
                    </div>
                  </div>

                  <!-- Exclude Entities -->
                  <div class="field-container">
                    <div class="field-title">Exclude Specific Entities</div>
                    <div class="field-description">Exclude specific entities from the grid.</div>
                    <div class="chips-container">
                      ${(gridModule.exclude_entities || []).map(
                        entityId => html`
                          <div class="filter-chip exclude-chip">
                            ${entityId.split('.')[1] || entityId}
                            <ha-icon
                              icon="mdi:close"
                              class="chip-remove-icon"
                              @click=${() => {
                                updateModule({
                                  exclude_entities: (gridModule.exclude_entities || []).filter(
                                    e => e !== entityId
                                  ),
                                });
                              }}
                            ></ha-icon>
                          </div>
                        `
                      )}
                    </div>
                    ${UcFormUtils.renderFieldSection(
                      '',
                      '',
                      hass,
                      { exclude_entity: '' },
                      [UcFormUtils.entity('exclude_entity')],
                      (e: CustomEvent) => {
                        const entityId = e.detail.value.exclude_entity;
                        if (
                          entityId &&
                          !(gridModule.exclude_entities || []).includes(entityId)
                        ) {
                          updateModule({
                            exclude_entities: [...(gridModule.exclude_entities || []), entityId],
                          });
                        }
                      }
                    )}
                  </div>

                  <!-- Entity Count -->
                  <div class="info-box">
                    <ha-icon icon="mdi:information"></ha-icon>
                    <span>
                      ${this.getFilteredEntities(gridModule, hass).length} entities match your filters
                    </span>
                  </div>
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  // Render individual entity row in editor
  private renderEntityRow(
    entity: GridEntity,
    index: number,
    module: GridModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const isExpanded = this._expandedEntities.has(entity.id);
    const entityState = hass?.states?.[entity.entity];
    const displayName =
      entity.custom_name || entityState?.attributes?.friendly_name || entity.entity || 'No entity';

    return html`
      <div
        class="entity-row ${this._draggedItem?.id === entity.id ? 'dragging' : ''}"
        draggable="true"
        @dragstart=${(e: DragEvent) => {
          this._draggedItem = entity;
          e.dataTransfer?.setData('text/plain', entity.id);
        }}
        @dragend=${() => {
          this._draggedItem = null;
        }}
        @dragover=${(e: DragEvent) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement).classList.add('drag-over');
        }}
        @dragleave=${(e: DragEvent) => {
          (e.currentTarget as HTMLElement).classList.remove('drag-over');
        }}
        @drop=${(e: DragEvent) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement).classList.remove('drag-over');
          if (this._draggedItem && this._draggedItem.id !== entity.id) {
            const entities = [...(module.entities || [])];
            const fromIndex = entities.findIndex(e => e.id === this._draggedItem!.id);
            const toIndex = entities.findIndex(e => e.id === entity.id);
            if (fromIndex !== -1 && toIndex !== -1) {
              const [moved] = entities.splice(fromIndex, 1);
              entities.splice(toIndex, 0, moved);
              updateModule({ entities });
            }
          }
        }}
      >
        <ha-icon icon="mdi:drag" class="drag-handle"></ha-icon>
        <div class="entity-info ${!entity.entity ? 'no-entity' : ''}">
          ${displayName}
        </div>
        <ha-icon
          icon="${isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}"
          class="expand-icon ${isExpanded ? 'expanded' : ''}"
          @click=${() => {
            if (isExpanded) {
              this._expandedEntities.delete(entity.id);
            } else {
              this._expandedEntities.add(entity.id);
            }
            this.triggerPreviewUpdate();
          }}
        ></ha-icon>
        <ha-icon
          icon="mdi:delete"
          class="delete-icon"
          @click=${() => {
            updateModule({
              entities: (module.entities || []).filter(e => e.id !== entity.id),
            });
          }}
        ></ha-icon>
      </div>

      ${isExpanded
        ? html`
            <div class="entity-settings">
              ${UcFormUtils.renderFieldSection(
                'Entity',
                'Select the entity to display.',
                hass,
                { entity: entity.entity || '' },
                [UcFormUtils.entity('entity')],
                (e: CustomEvent) => {
                  const entities = [...(module.entities || [])];
                  const idx = entities.findIndex(en => en.id === entity.id);
                  if (idx !== -1) {
                    entities[idx] = { ...entities[idx], entity: e.detail.value.entity };
                    updateModule({ entities });
                  }
                }
              )}

              ${UcFormUtils.renderFieldSection(
                'Custom Name',
                'Override the entity display name.',
                hass,
                { custom_name: entity.custom_name || '' },
                [UcFormUtils.text('custom_name')],
                (e: CustomEvent) => {
                  const entities = [...(module.entities || [])];
                  const idx = entities.findIndex(en => en.id === entity.id);
                  if (idx !== -1) {
                    entities[idx] = { ...entities[idx], custom_name: e.detail.value.custom_name };
                    updateModule({ entities });
                  }
                }
              )}

              ${UcFormUtils.renderFieldSection(
                'Custom Icon',
                'Override the entity icon.',
                hass,
                { custom_icon: entity.custom_icon || '' },
                [UcFormUtils.icon('custom_icon')],
                (e: CustomEvent) => {
                  const entities = [...(module.entities || [])];
                  const idx = entities.findIndex(en => en.id === entity.id);
                  if (idx !== -1) {
                    entities[idx] = { ...entities[idx], custom_icon: e.detail.value.custom_icon };
                    updateModule({ entities });
                  }
                }
              )}

              <div class="color-field">
                <div class="field-title">Custom Color</div>
                <div class="field-description">Override the icon color.</div>
                <ultra-color-picker
                  .hass=${hass}
                  .value=${entity.custom_color || ''}
                  @value-changed=${(e: CustomEvent) => {
                    const entities = [...(module.entities || [])];
                    const idx = entities.findIndex(en => en.id === entity.id);
                    if (idx !== -1) {
                      entities[idx] = { ...entities[idx], custom_color: e.detail.value };
                      updateModule({ entities });
                    }
                  }}
                ></ultra-color-picker>
              </div>

              ${module.grid_display_mode === 'metro'
                ? html`
                    ${UcFormUtils.renderFieldSection(
                      'Metro Size',
                      'Size of this tile in metro mode.',
                      hass,
                      { metro_size: entity.metro_size || 'small' },
                      [
                        UcFormUtils.select('metro_size', [
                          { value: 'small', label: 'Small (1x1)' },
                          { value: 'medium', label: 'Medium (2x1)' },
                          { value: 'large', label: 'Large (2x2)' },
                        ]),
                      ],
                      (e: CustomEvent) => {
                        const entities = [...(module.entities || [])];
                        const idx = entities.findIndex(en => en.id === entity.id);
                        if (idx !== -1) {
                          entities[idx] = {
                            ...entities[idx],
                            metro_size: e.detail.value.metro_size,
                          };
                          updateModule({ entities });
                        }
                      }
                    )}
                  `
                : ''}

              ${this.renderSettingsSection('', '', [
                {
                  title: 'Override Actions',
                  description: 'Use custom actions for this item.',
                  hass,
                  data: { override_actions: entity.override_actions || false },
                  schema: [this.booleanField('override_actions')],
                  onChange: (e: CustomEvent) => {
                    const isEnabled = e.detail.value.override_actions;
                    // Clear cached state when toggling off so fresh values load when re-enabled
                    if (!isEnabled) {
                      this._entityActionStates.delete(entity.id);
                    }
                    const entities = [...(module.entities || [])];
                    const idx = entities.findIndex(en => en.id === entity.id);
                    if (idx !== -1) {
                      entities[idx] = {
                        ...entities[idx],
                        override_actions: isEnabled,
                      };
                      updateModule({ entities });
                    }
                  },
                },
              ])}

              ${entity.override_actions
                ? (() => {
                    // Get or initialize action state for this entity
                    // Our state is the source of truth for the form - only initialize from entity once
                    let actionState = this._entityActionStates.get(entity.id);
                    if (!actionState) {
                      // First time - initialize from entity's saved values or defaults
                      actionState = {
                        tap_action: entity.tap_action || { action: 'toggle' },
                        hold_action: entity.hold_action || { action: 'more-info' },
                        double_tap_action: entity.double_tap_action || { action: 'none' },
                      };
                      this._entityActionStates.set(entity.id, actionState);
                    }
                    
                    return html`
                    <div class="entity-actions-override">
                      <div class="entity-action-info">
                        <ha-icon icon="mdi:information-outline"></ha-icon>
                        <span>Override the default domain-based actions for this entity.</span>
                      </div>
                      
                      <!-- Tap Action -->
                      <div class="entity-action-field">
                        <ha-form
                          .hass=${hass}
                          .data=${{ tap_action: actionState.tap_action }}
                          .schema=${[{ name: 'tap_action', selector: { ui_action: {} } }]}
                          .computeLabel=${() => 'Tap Action'}
                          @value-changed=${(e: CustomEvent) => {
                            const newAction = e.detail.value.tap_action;
                            // Update our state (source of truth for form)
                            const state = this._entityActionStates.get(entity.id) || {};
                            state.tap_action = newAction;
                            this._entityActionStates.set(entity.id, state);
                            // Persist to entity config
                            const entities = [...(module.entities || [])];
                            const idx = entities.findIndex(en => en.id === entity.id);
                            if (idx !== -1) {
                              entities[idx] = { ...entities[idx], tap_action: newAction };
                              updateModule({ entities });
                            }
                          }}
                        ></ha-form>
                      </div>
                      
                      <!-- Hold Action -->
                      <div class="entity-action-field">
                        <ha-form
                          .hass=${hass}
                          .data=${{ hold_action: actionState.hold_action }}
                          .schema=${[{ name: 'hold_action', selector: { ui_action: {} } }]}
                          .computeLabel=${() => 'Hold Action'}
                          @value-changed=${(e: CustomEvent) => {
                            const newAction = e.detail.value.hold_action;
                            // Update our state (source of truth for form)
                            const state = this._entityActionStates.get(entity.id) || {};
                            state.hold_action = newAction;
                            this._entityActionStates.set(entity.id, state);
                            // Persist to entity config
                            const entities = [...(module.entities || [])];
                            const idx = entities.findIndex(en => en.id === entity.id);
                            if (idx !== -1) {
                              entities[idx] = { ...entities[idx], hold_action: newAction };
                              updateModule({ entities });
                            }
                          }}
                        ></ha-form>
                      </div>
                      
                      <!-- Double Tap Action -->
                      <div class="entity-action-field">
                        <ha-form
                          .hass=${hass}
                          .data=${{ double_tap_action: actionState.double_tap_action }}
                          .schema=${[{ name: 'double_tap_action', selector: { ui_action: {} } }]}
                          .computeLabel=${() => 'Double Tap Action'}
                          @value-changed=${(e: CustomEvent) => {
                            const newAction = e.detail.value.double_tap_action;
                            // Update our state (source of truth for form)
                            const state = this._entityActionStates.get(entity.id) || {};
                            state.double_tap_action = newAction;
                            this._entityActionStates.set(entity.id, state);
                            // Persist to entity config
                            const entities = [...(module.entities || [])];
                            const idx = entities.findIndex(en => en.id === entity.id);
                            if (idx !== -1) {
                              entities[idx] = { ...entities[idx], double_tap_action: newAction };
                              updateModule({ entities });
                            }
                          }}
                        ></ha-form>
                      </div>
                    </div>
                  `;
                  })()
                : ''}

              <!-- Spacer between sections -->
              <div class="entity-section-spacer"></div>

              <!-- Conditional Display Logic -->
              ${this.renderSettingsSection('', '', [
                {
                  title: 'Conditional Display',
                  description: 'Control when this entity is shown based on conditions.',
                  hass,
                  data: { has_logic: (entity.display_mode && entity.display_mode !== 'always') || false },
                  schema: [this.booleanField('has_logic')],
                  onChange: (e: CustomEvent) => {
                    const entities = [...(module.entities || [])];
                    const idx = entities.findIndex(en => en.id === entity.id);
                    if (idx !== -1) {
                      entities[idx] = {
                        ...entities[idx],
                        display_mode: e.detail.value.has_logic ? 'every' : 'always',
                        display_conditions: e.detail.value.has_logic ? (entities[idx].display_conditions || []) : [],
                      };
                      updateModule({ entities });
                    }
                  },
                },
              ])}

              ${entity.display_mode && entity.display_mode !== 'always'
                ? html`
                    <div class="conditional-group">
                      ${UcFormUtils.renderFieldSection(
                        'Display Mode',
                        'When multiple conditions exist, show this entity if...',
                        hass,
                        { display_mode: entity.display_mode || 'every' },
                        [
                          UcFormUtils.select('display_mode', [
                            { value: 'every', label: 'EVERY condition is met' },
                            { value: 'any', label: 'ANY condition is met' },
                          ]),
                        ],
                        (e: CustomEvent) => {
                          const entities = [...(module.entities || [])];
                          const idx = entities.findIndex(en => en.id === entity.id);
                          if (idx !== -1) {
                            entities[idx] = { ...entities[idx], display_mode: e.detail.value.display_mode };
                            updateModule({ entities });
                          }
                        }
                      )}

                      <div class="entity-conditions-list">
                        <div style="display:flex; align-items:center; justify-content: space-between; margin-bottom: 12px;">
                          <div style="font-size: 14px; font-weight: 600;">Conditions</div>
                          <button
                            class="add-condition-btn"
                            @click=${() => {
                              const entities = [...(module.entities || [])];
                              const idx = entities.findIndex(en => en.id === entity.id);
                              if (idx !== -1) {
                                const newCond: DisplayCondition = {
                                  id: `cond_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                                  type: 'entity_state',
                                  entity: '',
                                  operator: '=',
                                  value: '',
                                };
                                entities[idx] = {
                                  ...entities[idx],
                                  display_conditions: [...(entities[idx].display_conditions || []), newCond],
                                };
                                updateModule({ entities });
                              }
                            }}
                            style="display:flex; align-items:center; gap:6px; padding:4px 8px; border:1px dashed var(--primary-color); background:none; color:var(--primary-color); border-radius:4px; cursor:pointer; font-size: 12px;"
                          >
                            <ha-icon icon="mdi:plus" style="--mdc-icon-size: 14px;"></ha-icon>
                            Add
                          </button>
                        </div>

                        ${(entity.display_conditions || []).length === 0
                          ? html`<div style="text-align: center; padding: 12px; color: var(--secondary-text-color); font-style: italic; font-size: 12px;">
                              No conditions. Add one to control visibility.
                            </div>`
                          : ''}

                        ${(entity.display_conditions || []).map((cond, condIndex) =>
                          this.renderEntityCondition(entity, cond, condIndex, module, hass, updateModule)
                        )}
                      </div>
                    </div>
                  `
                : ''}
            </div>
          `
        : ''}
    `;
  }

  // Render individual condition for an entity
  private renderEntityCondition(
    entity: GridEntity,
    cond: any,
    condIndex: number,
    module: GridModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const updateCondition = (updates: Record<string, any>) => {
      const entities = [...(module.entities || [])];
      const entityIdx = entities.findIndex(en => en.id === entity.id);
      if (entityIdx !== -1) {
        const conditions = [...(entities[entityIdx].display_conditions || [])];
        conditions[condIndex] = { ...cond, ...updates };
        entities[entityIdx] = { ...entities[entityIdx], display_conditions: conditions };
        updateModule({ entities });
      }
    };

    const removeCondition = () => {
      const entities = [...(module.entities || [])];
      const entityIdx = entities.findIndex(en => en.id === entity.id);
      if (entityIdx !== -1) {
        const conditions = (entities[entityIdx].display_conditions || []).filter((_, i) => i !== condIndex);
        entities[entityIdx] = { ...entities[entityIdx], display_conditions: conditions };
        updateModule({ entities });
      }
    };

    return html`
      <div class="entity-condition-item">
        <div class="entity-condition-header">
          <span class="entity-condition-label">Condition ${condIndex + 1}</span>
          <ha-icon
            icon="mdi:delete"
            class="entity-condition-delete"
            @click=${removeCondition}
          ></ha-icon>
        </div>

        ${UcFormUtils.renderFieldSection(
          'Type',
          '',
          hass,
          { type: cond.type || 'entity_state' },
          [
            UcFormUtils.select('type', [
              { value: 'entity_state', label: 'Entity State' },
              { value: 'entity_attribute', label: 'Entity Attribute' },
              { value: 'template', label: 'Template' },
              { value: 'time', label: 'Time Range' },
            ]),
          ],
          (e: CustomEvent) => {
            const newType = e.detail.value.type;
            const base: any = { type: newType };
            if (newType === 'entity_state') {
              Object.assign(base, { entity: '', operator: '=', value: '' });
            } else if (newType === 'entity_attribute') {
              Object.assign(base, { entity: '', attribute: '', operator: '=', value: '' });
            } else if (newType === 'time') {
              Object.assign(base, { time_from: '00:00', time_to: '23:59' });
            } else if (newType === 'template') {
              Object.assign(base, { template: '' });
            }
            updateCondition(base);
          }
        )}

        ${cond.type === 'entity_state' || !cond.type
          ? html`
              ${UcFormUtils.renderFieldSection(
                'Entity',
                '',
                hass,
                { entity: cond.entity || '' },
                [UcFormUtils.entity('entity')],
                (e: CustomEvent) => updateCondition(e.detail.value)
              )}
              ${UcFormUtils.renderFieldSection(
                'Operator',
                '',
                hass,
                { operator: cond.operator || '=' },
                [
                  UcFormUtils.select('operator', [
                    { value: '=', label: '=' },
                    { value: '!=', label: '!=' },
                    { value: '>', label: '>' },
                    { value: '>=', label: '>=' },
                    { value: '<', label: '<' },
                    { value: '<=', label: '<=' },
                    { value: 'contains', label: 'contains' },
                    { value: 'not_contains', label: 'not_contains' },
                    { value: 'has_value', label: 'has_value' },
                    { value: 'no_value', label: 'no_value' },
                  ]),
                ],
                (e: CustomEvent) => updateCondition(e.detail.value)
              )}
              ${UcFormUtils.renderFieldSection(
                'Value',
                '',
                hass,
                { value: cond.value || '' },
                [UcFormUtils.text('value')],
                (e: CustomEvent) => updateCondition(e.detail.value)
              )}
            `
          : ''}

        ${cond.type === 'entity_attribute'
          ? html`
              ${UcFormUtils.renderFieldSection(
                'Entity',
                '',
                hass,
                { entity: cond.entity || '' },
                [UcFormUtils.entity('entity')],
                (e: CustomEvent) => updateCondition(e.detail.value)
              )}
              ${UcFormUtils.renderFieldSection(
                'Attribute',
                '',
                hass,
                { attribute: cond.attribute || '' },
                [UcFormUtils.text('attribute')],
                (e: CustomEvent) => updateCondition(e.detail.value)
              )}
              ${UcFormUtils.renderFieldSection(
                'Operator',
                '',
                hass,
                { operator: cond.operator || '=' },
                [
                  UcFormUtils.select('operator', [
                    { value: '=', label: '=' },
                    { value: '!=', label: '!=' },
                    { value: '>', label: '>' },
                    { value: '>=', label: '>=' },
                    { value: '<', label: '<' },
                    { value: '<=', label: '<=' },
                    { value: 'contains', label: 'contains' },
                    { value: 'not_contains', label: 'not_contains' },
                  ]),
                ],
                (e: CustomEvent) => updateCondition(e.detail.value)
              )}
              ${UcFormUtils.renderFieldSection(
                'Value',
                '',
                hass,
                { value: cond.value || '' },
                [UcFormUtils.text('value')],
                (e: CustomEvent) => updateCondition(e.detail.value)
              )}
            `
          : ''}

        ${cond.type === 'time'
          ? html`
              ${UcFormUtils.renderFieldSection(
                'From',
                'Time in HH:MM format (e.g., 08:00)',
                hass,
                { time_from: cond.time_from || '00:00' },
                [UcFormUtils.text('time_from')],
                (e: CustomEvent) => updateCondition(e.detail.value)
              )}
              ${UcFormUtils.renderFieldSection(
                'To',
                'Time in HH:MM format (e.g., 22:00)',
                hass,
                { time_to: cond.time_to || '23:59' },
                [UcFormUtils.text('time_to')],
                (e: CustomEvent) => updateCondition(e.detail.value)
              )}
            `
          : ''}

        ${cond.type === 'template'
          ? html`
              ${UcFormUtils.renderFieldSection(
                'Template',
                'Jinja2 template that evaluates to true/false',
                hass,
                { template: cond.template || '' },
                [UcFormUtils.text('template')],
                (e: CustomEvent) => updateCondition(e.detail.value)
              )}
            `
          : ''}
      </div>
    `;
  }

  // Render style-specific color options based on selected style
  private renderStyleSpecificColors(
    gridModule: GridModule,
    hass: HomeAssistant,
    styleConfig: GridStyleConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const styleId = gridModule.grid_style || 'style_1';

    // Determine which style-specific options to show
    const showGlass = styleId === 'style_16';
    const showGradient = styleId === 'style_17';
    const showPanel = styleId === 'style_15';
    const showSplit = styleId === 'style_18';
    const showNeumorphic = styleId === 'style_19';
    const showAccentBorder = styleId === 'style_20';
    const showCardShadow = styleId === 'style_11';

    const hasStyleSpecificOptions = showGlass || showGradient || showPanel || showSplit || showNeumorphic || showAccentBorder || showCardShadow;

    const gradientDirectionOptions = [
      { value: 'to-bottom', label: 'Top to Bottom' },
      { value: 'to-right', label: 'Left to Right' },
      { value: 'to-bottom-right', label: 'Diagonal (↘)' },
      { value: 'to-bottom-left', label: 'Diagonal (↙)' },
    ];

    return html`
      <div class="settings-section">
        <div class="section-title">STYLE COLORS</div>
        <div class="style-info">
          <ha-icon icon="mdi:palette"></ha-icon>
          <span>Customize colors for the <strong>${styleConfig.name}</strong> style</span>
        </div>

        <!-- If no style-specific options, show info message -->
        ${!hasStyleSpecificOptions ? html`
          <div class="info-box" style="margin-top: 0;">
            <ha-icon icon="mdi:information-outline"></ha-icon>
            <span>This style uses the standard colors from the sections above. Try <strong>Glass</strong>, <strong>Gradient</strong>, or <strong>Panel</strong> styles for additional color options.</span>
          </div>
        ` : ''}

        <!-- Glass Style (style_16) -->
        ${showGlass ? html`
          <div class="color-field">
            <div class="field-title">Glass Tint Color</div>
            <div class="field-description">Background tint for the glass effect.</div>
            <ultra-color-picker
              .hass=${hass}
              .value=${gridModule.glass_tint_color || 'rgba(255, 255, 255, 0.1)'}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ glass_tint_color: e.detail.value });
              }}
            ></ultra-color-picker>
          </div>

          <div class="color-field">
            <div class="field-title">Glass Border Color</div>
            <div class="field-description">Border color for the glass effect.</div>
            <ultra-color-picker
              .hass=${hass}
              .value=${gridModule.glass_border_color || 'rgba(255, 255, 255, 0.2)'}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ glass_border_color: e.detail.value });
              }}
            ></ultra-color-picker>
          </div>

          <div class="field-container">
            <div class="field-title">Blur Amount (${gridModule.glass_blur_amount || 10}px)</div>
            <div class="field-description">Intensity of the blur effect.</div>
            <div class="number-range-control">
              <input
                type="range"
                class="range-slider"
                min="0"
                max="30"
                step="1"
                .value="${String(gridModule.glass_blur_amount || 10)}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  updateModule({ glass_blur_amount: parseInt(target.value, 10) });
                }}
              />
              <input
                type="number"
                class="range-input"
                min="0"
                max="50"
                step="1"
                .value="${String(gridModule.glass_blur_amount || 10)}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = parseInt(target.value, 10);
                  if (!isNaN(value)) {
                    updateModule({ glass_blur_amount: value });
                  }
                }}
              />
              <button
                class="range-reset-btn"
                @click=${() => updateModule({ glass_blur_amount: 10 })}
                title="Reset to default (10)"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Gradient Style (style_17) -->
        ${showGradient ? html`
          <div class="color-field">
            <div class="field-title">Gradient Start Color</div>
            <div class="field-description">Starting color of the gradient.</div>
            <ultra-color-picker
              .hass=${hass}
              .value=${gridModule.gradient_start_color || '#6666FF'}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ gradient_start_color: e.detail.value });
              }}
            ></ultra-color-picker>
          </div>

          <div class="color-field">
            <div class="field-title">Gradient End Color</div>
            <div class="field-description">Ending color of the gradient.</div>
            <ultra-color-picker
              .hass=${hass}
              .value=${gridModule.gradient_end_color || '#000070'}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ gradient_end_color: e.detail.value });
              }}
            ></ultra-color-picker>
          </div>

          ${UcFormUtils.renderFieldSection(
            'Gradient Direction',
            'Direction of the gradient flow.',
            hass,
            { gradient_direction: gridModule.gradient_direction || 'to-bottom-right' },
            [UcFormUtils.select('gradient_direction', gradientDirectionOptions)],
            (e: CustomEvent) =>
              updateModule({ gradient_direction: e.detail.value.gradient_direction })
          )}
        ` : ''}

        <!-- Panel Style (style_15) -->
        ${showPanel ? html`
          <div class="color-field">
            <div class="field-title">Header Background</div>
            <div class="field-description">Background color for the header bar.</div>
            <ultra-color-picker
              .hass=${hass}
              .value=${gridModule.panel_header_color || 'var(--primary-color)'}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ panel_header_color: e.detail.value });
              }}
            ></ultra-color-picker>
          </div>

          <div class="color-field">
            <div class="field-title">Header Text Color</div>
            <div class="field-description">Text color in the header bar.</div>
            <ultra-color-picker
              .hass=${hass}
              .value=${gridModule.panel_header_text_color || '#ffffff'}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ panel_header_text_color: e.detail.value });
              }}
            ></ultra-color-picker>
          </div>
        ` : ''}

        <!-- Split Style (style_18) -->
        ${showSplit ? html`
          <div class="color-field">
            <div class="field-title">Left Side Color</div>
            <div class="field-description">Color for the left side of the split.</div>
            <ultra-color-picker
              .hass=${hass}
              .value=${gridModule.split_left_color || 'var(--primary-color)'}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ split_left_color: e.detail.value });
              }}
            ></ultra-color-picker>
          </div>

          <div class="color-field">
            <div class="field-title">Right Side Color</div>
            <div class="field-description">Color for the right side of the split.</div>
            <ultra-color-picker
              .hass=${hass}
              .value=${gridModule.split_right_color || 'var(--card-background-color)'}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ split_right_color: e.detail.value });
              }}
            ></ultra-color-picker>
          </div>
        ` : ''}

        <!-- Neumorphic Style (style_19) -->
        ${showNeumorphic ? html`
          <div class="color-field">
            <div class="field-title">Light Shadow Color</div>
            <div class="field-description">Color for the light (highlight) shadow.</div>
            <ultra-color-picker
              .hass=${hass}
              .value=${gridModule.neumorphic_light_shadow || 'rgba(255, 255, 255, 0.1)'}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ neumorphic_light_shadow: e.detail.value });
              }}
            ></ultra-color-picker>
          </div>

          <div class="color-field">
            <div class="field-title">Dark Shadow Color</div>
            <div class="field-description">Color for the dark shadow.</div>
            <ultra-color-picker
              .hass=${hass}
              .value=${gridModule.neumorphic_dark_shadow || 'rgba(0, 0, 0, 0.15)'}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ neumorphic_dark_shadow: e.detail.value });
              }}
            ></ultra-color-picker>
          </div>
        ` : ''}

        <!-- Accent Border Style (style_20) -->
        ${showAccentBorder ? html`
          <div class="color-field">
            <div class="field-title">Accent Border Color</div>
            <div class="field-description">Color for the accent border on the left side.</div>
            <ultra-color-picker
              .hass=${hass}
              .value=${gridModule.accent_border_color || 'var(--primary-color)'}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ accent_border_color: e.detail.value });
              }}
            ></ultra-color-picker>
          </div>
        ` : ''}

        <!-- Card Style (style_11) -->
        ${showCardShadow ? html`
          <div class="color-field">
            <div class="field-title">Shadow Color</div>
            <div class="field-description">Color for the card shadow.</div>
            <ultra-color-picker
              .hass=${hass}
              .value=${gridModule.card_shadow_color || 'rgba(0, 0, 0, 0.1)'}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ card_shadow_color: e.detail.value });
              }}
            ></ultra-color-picker>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Render Preview - Main grid rendering
  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const gridModule = module as GridModule;
    this._hass = hass;

    // Get and process entities
    let entities = this.getFilteredEntities(gridModule, hass);
    entities = this.sortEntities(entities, gridModule.sort_by, gridModule.sort_direction, hass);

    // Apply max items limit
    if (gridModule.max_items && gridModule.max_items > 0) {
      entities = entities.slice(0, gridModule.max_items);
    }

    // Get paginated entities
    const { entities: displayEntities, currentPage, totalPages } = this.getPaginatedEntities(
      entities,
      gridModule,
      gridModule.id
    );

    const styleConfig = getStyleConfig(gridModule.grid_style || 'style_1');

    // Animation should play when enabled
    // CSS animations naturally only play once per element insertion
    const shouldAnimate =
      gridModule.enable_load_animation !== false &&
      gridModule.load_animation !== 'none';

    // Build grid styles
    const gridStyles = this.buildGridStyles(gridModule);

    // Pre-calculate metro sizes for better space filling
    const metroSizes = gridModule.grid_display_mode === 'metro' 
      ? this.calculateMetroSizes(displayEntities.length, gridModule.columns || 4)
      : undefined;

    // Generate a unique animation key to force CSS animation to play
    const isPreviewContext = previewContext === 'live' || previewContext === 'ha-preview';
    
    // For dashboard, use a stable key per module that's set once when card first loads
    // This ensures animation plays on initial load but not on every re-render
    let animationKey: string | number;
    if (isPreviewContext) {
      // Preview contexts get fresh timestamp to always replay animation
      animationKey = Date.now();
    } else {
      // Dashboard: set animation start time once, then reuse it
      if (!this._animationStartTimes.has(gridModule.id)) {
        this._animationStartTimes.set(gridModule.id, Date.now());
      }
      animationKey = this._animationStartTimes.get(gridModule.id)!;
    }

    return html`
      <style>
        ${this.getStyles()}
      </style>
      <div 
        class="uc-grid-container uc-grid-mode-${gridModule.grid_display_mode || 'grid'}" 
        data-mode="${gridModule.grid_display_mode || 'grid'}"
        data-animation-key="${animationKey}"
        style="${gridStyles}"
      >
        ${displayEntities.length > 0
          ? displayEntities.map((entity, index) =>
              this.renderGridItem(entity, index, gridModule, hass, styleConfig, shouldAnimate, metroSizes)
            )
          : html`
              <div class="grid-empty-state">
                <ha-icon icon="mdi:view-grid-plus"></ha-icon>
                <span>No entities configured</span>
              </div>
            `}
      </div>
      ${gridModule.enable_pagination && totalPages > 1
        ? this.renderPaginationControls(currentPage, totalPages, gridModule)
        : ''}
    `;
  }

  // Build grid container CSS
  private buildGridStyles(module: GridModule): string {
    const gap = module.gap || 12;
    const columns = module.columns || 4;

    let styles = `display: grid; gap: ${gap}px; width: 100%;`;

    switch (module.grid_display_mode) {
      case 'masonry':
        // CSS Masonry simulation using fixed row heights and row spans
        // Each row is 80px (enough for icon + text), items can span 1, 2, or 3 rows
        // align-items: start ensures items don't stretch beyond their content
        styles += `grid-template-columns: repeat(${columns}, minmax(0, 1fr)); grid-auto-rows: 80px; grid-auto-flow: dense; align-items: stretch;`;
        break;
      case 'metro':
        // Metro uses doubled columns for finer control of tile sizes
        // Each "unit" is 2 grid columns, so a 4-column layout has 8 grid columns
        // Row height is 90px to accommodate content properly
        styles += `grid-template-columns: repeat(${columns * 2}, minmax(0, 1fr)); grid-auto-rows: 90px; grid-auto-flow: dense; align-items: stretch;`;
        break;
      case 'grid':
      default:
        styles += `grid-template-columns: repeat(${columns}, minmax(0, 1fr));`;
        break;
    }

    return styles;
  }

  // Calculate metro sizes for all items to ensure good space filling
  private calculateMetroSizes(totalItems: number, columns: number): string[] {
    const sizes: string[] = [];
    const gridColumns = columns * 2; // Metro uses doubled columns
    
    // Define size column spans
    const SMALL = 2;  // 1 visual column
    const MEDIUM = 4; // 2 visual columns
    
    // First pass: assign base sizes with variety
    for (let i = 0; i < totalItems; i++) {
      // Create a varied pattern: 
      // Position 0, 6, 12... = large (2x2)
      // Position 2, 5, 8, 11... = medium (2x1) 
      // Others = small (1x1)
      if (i % 6 === 0 && totalItems > 3) {
        sizes.push('large');
      } else if (i % 3 === 2) {
        sizes.push('medium');
      } else {
        sizes.push('small');
      }
    }
    
    // Second pass: adjust sizes to fill rows completely
    // Calculate column usage per row and expand items to fill gaps
    let currentCol = 0;
    const rowStarts: number[] = [0]; // Track where each row starts
    
    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i];
      const span = size === 'small' ? SMALL : MEDIUM;
      
      // Check if this item would overflow the row
      if (currentCol + span > gridColumns) {
        // This item starts a new row
        rowStarts.push(i);
        currentCol = span;
      } else {
        currentCol += span;
      }
      
      // If row is exactly full, next item starts new row
      if (currentCol === gridColumns) {
        if (i < sizes.length - 1) {
          rowStarts.push(i + 1);
        }
        currentCol = 0;
      }
    }
    
    // Third pass: for each row, if there's remaining space, expand items
    for (let rowIdx = 0; rowIdx < rowStarts.length; rowIdx++) {
      const rowStart = rowStarts[rowIdx];
      const rowEnd = rowIdx < rowStarts.length - 1 ? rowStarts[rowIdx + 1] : sizes.length;
      
      // Calculate current row usage
      let rowUsage = 0;
      for (let i = rowStart; i < rowEnd; i++) {
        const size = sizes[i];
        rowUsage += size === 'small' ? SMALL : MEDIUM;
      }
      
      // If row is not full, expand items to fill
      const gap = gridColumns - rowUsage;
      if (gap > 0 && gap < gridColumns) {
        // Try to expand small items to medium to fill gap
        for (let i = rowStart; i < rowEnd && gap > 0; i++) {
          if (sizes[i] === 'small') {
            // Expanding small to medium adds 2 columns
            const newUsage = rowUsage + 2;
            if (newUsage <= gridColumns) {
              sizes[i] = 'medium';
              rowUsage = newUsage;
              if (rowUsage === gridColumns) break;
            }
          }
        }
      }
    }
    
    return sizes;
  }

  // Render individual grid item
  private renderGridItem(
    entity: GridEntity,
    index: number,
    module: GridModule,
    hass: HomeAssistant,
    styleConfig: GridStyleConfig,
    shouldAnimate: boolean,
    metroSizes?: string[]
  ): TemplateResult {
    const { name, state, icon, isOn, isUnavailable, entityPicture } = this.getEntityDisplayInfo(entity, hass, module);
    const iconColor = this.getIconColor(entity, isOn, isUnavailable, module);

    // Build item styles
    const itemStyles = this.buildItemStyles(entity, module, styleConfig, isOn, isUnavailable);
    const animationStyles = shouldAnimate ? this.buildAnimationStyles(module, index) : '';

    // Build mode-specific classes
    let modeClasses = '';
    
    if (module.grid_display_mode === 'metro') {
      // Metro mode - use pre-calculated sizes or entity override
      if (entity.metro_size) {
        modeClasses = `metro-${entity.metro_size}`;
      } else if (metroSizes && metroSizes[index]) {
        modeClasses = `metro-${metroSizes[index]}`;
      } else {
        modeClasses = 'metro-small';
      }
    } else if (module.grid_display_mode === 'masonry') {
      // Masonry mode - vary heights for visual interest
      // Create a staggered pattern: some items span 2 rows, some span 3
      if (index % 5 === 0) {
        modeClasses = 'masonry-extra-tall';
      } else if (index % 3 === 0) {
        modeClasses = 'masonry-tall';
      }
    }

    // Hover class
    const hoverClass = module.enable_hover_effect !== false ? `hover-${module.hover_effect || 'scale'}` : '';

    return html`
      <div
        class="uc-grid-item grid-style-${module.grid_style} ${modeClasses} ${hoverClass}"
        style="${itemStyles}${animationStyles}"
        @pointerdown=${(e: PointerEvent) => this.handleItemPointerDown(e, entity, module, hass)}
        @pointerup=${(e: PointerEvent) => this.handleItemPointerUp(e, entity, module, hass)}
        @pointercancel=${() => this.handleItemPointerCancel(entity)}
        @pointerleave=${() => this.handleItemPointerCancel(entity)}
      >
        ${this.renderItemContent(entity, module, styleConfig, name, state, icon, iconColor, entityPicture)}
      </div>
    `;
  }

  // Build item styles
  private buildItemStyles(
    entity: GridEntity,
    module: GridModule,
    styleConfig: GridStyleConfig,
    isOn: boolean,
    isUnavailable: boolean
  ): string {
    const bgColor = entity.custom_background || module.global_background_color || 'var(--card-background-color)';
    const borderRadius = module.global_border_radius || styleConfig.defaultBorderRadius;
    const padding = module.global_padding || styleConfig.defaultPadding;
    const borderWidth = module.global_border_width || 0;
    const borderColor = module.global_border_color || 'var(--divider-color)';

    let styles = `background: ${bgColor}; border-radius: ${borderRadius}; padding: ${padding}; cursor: pointer; transition: all 0.2s ease;`;

    if (borderWidth > 0) {
      styles += `border: ${borderWidth}px solid ${borderColor};`;
    }

    // Style-specific additions using customizable colors
    switch (module.grid_style) {
      case 'style_11': // Card style
        const shadowColor = module.card_shadow_color || 'rgba(0, 0, 0, 0.1)';
        styles += `box-shadow: 0 2px 8px ${shadowColor};`;
        break;

      case 'style_15': // Panel style - handled in renderItemContent for header
        break;

      case 'style_16': // Glass style
        const glassTint = module.glass_tint_color || 'rgba(255, 255, 255, 0.1)';
        const glassBlur = module.glass_blur_amount || 10;
        const glassBorder = module.glass_border_color || 'rgba(255, 255, 255, 0.2)';
        styles += `background: ${glassTint}; backdrop-filter: blur(${glassBlur}px); -webkit-backdrop-filter: blur(${glassBlur}px); border: 1px solid ${glassBorder};`;
        break;

      case 'style_17': // Gradient style
        // Use explicit fallbacks to ensure gradient is visible even if CSS vars aren't set
        const gradientStart = module.gradient_start_color || '#6666FF';
        const gradientEnd = module.gradient_end_color || '#000070';
        const gradientDir = module.gradient_direction || 'to-bottom-right';
        const cssDirection = gradientDir.replace('to-', 'to ').replace('-', ' ');
        styles += `background: linear-gradient(${cssDirection}, ${gradientStart}, ${gradientEnd}) !important;`;
        break;

      case 'style_18': // Split style - handled in renderItemContent
        break;

      case 'style_19': // Neumorphic style
        const lightShadow = module.neumorphic_light_shadow || 'rgba(255, 255, 255, 0.1)';
        const darkShadow = module.neumorphic_dark_shadow || 'rgba(0, 0, 0, 0.15)';
        styles += `box-shadow: 6px 6px 12px ${darkShadow}, -6px -6px 12px ${lightShadow};`;
        break;

      case 'style_20': // Accent Border style
        const accentColor = isOn 
          ? (module.accent_border_color || module.global_on_color || 'var(--primary-color)') 
          : (module.accent_border_color || 'var(--divider-color)');
        styles += `border-left: 3px solid ${accentColor};`;
        break;
    }

    return styles;
  }

  // Build animation styles
  private buildAnimationStyles(module: GridModule, index: number): string {
    if (!module.enable_load_animation || module.load_animation === 'none') {
      return '';
    }

    const duration = module.grid_animation_duration || 600; // ms
    const stagger = module.animation_stagger || 100; // ms between each item
    const delay = stagger * index;
    const animation = module.load_animation || 'fadeIn';

    // Ensure animation plays by setting all animation properties explicitly
    return `opacity: 0; animation: grid-${animation} ${duration}ms ease-out ${delay}ms forwards;`;
  }

  // Render item content based on style
  private renderItemContent(
    entity: GridEntity,
    module: GridModule,
    styleConfig: GridStyleConfig,
    name: string,
    state: string,
    icon: string,
    iconColor: string,
    entityPicture: string | null
  ): TemplateResult {
    const iconSize = module.global_icon_size || styleConfig.defaultIconSize;
    const fontSize = module.global_font_size || styleConfig.defaultFontSize;
    const nameColor = module.global_name_color || 'var(--primary-text-color)';
    const stateColor = module.global_state_color || 'var(--secondary-text-color)';

    // Helper to render icon or entity picture (for person, camera, media_player entities)
    const renderIconOrPicture = (size: number, color: string) => {
      if (entityPicture) {
        return html`
          <div class="grid-item-picture" style="width: ${size}px; height: ${size}px;">
            <img src="${entityPicture}" alt="${name}" />
          </div>
        `;
      }
      return html`<ha-icon icon="${icon}" style="--mdc-icon-size: ${size}px; color: ${color};"></ha-icon>`;
    };

    // Different layouts based on style
    switch (styleConfig.layout) {
      case 'horizontal':
        return html`
          <div class="grid-item-horizontal">
            ${styleConfig.showIcon ? renderIconOrPicture(iconSize, iconColor) : ''}
            <div class="grid-item-text">
              ${styleConfig.showName ? html`<span class="grid-item-name" style="font-size: ${fontSize}px; color: ${nameColor};">${name}</span>` : ''}
              ${styleConfig.showState ? html`<span class="grid-item-state" style="font-size: ${fontSize - 1}px; color: ${stateColor};">${state}</span>` : ''}
            </div>
          </div>
        `;

      case 'icon-only':
        return html`
          <div class="grid-item-icon-only">
            ${styleConfig.showIcon ? renderIconOrPicture(iconSize, iconColor) : ''}
            ${styleConfig.showState && module.grid_style === 'style_4'
              ? html`<span class="grid-item-badge" style="font-size: ${fontSize - 2}px;">${state}</span>`
              : ''}
            ${styleConfig.showState && module.grid_style === 'style_10'
              ? html`<span class="grid-item-corner-badge" style="font-size: ${fontSize - 3}px;">${state}</span>`
              : ''}
            ${styleConfig.showState && module.grid_style === 'style_9'
              ? html`<span class="grid-item-ring-state" style="font-size: ${fontSize}px;">${state}</span>`
              : ''}
          </div>
        `;

      case 'vertical':
      default:
        if (module.grid_style === 'style_1') {
          return html`
            <div class="grid-item-vertical">
              ${styleConfig.showName ? html`<span class="grid-item-name" style="font-size: ${fontSize}px; color: ${nameColor}; margin-bottom: 8px;">${name}</span>` : ''}
              ${styleConfig.showIcon ? renderIconOrPicture(iconSize, iconColor) : ''}
              ${styleConfig.showState ? html`<span class="grid-item-state" style="font-size: ${fontSize - 1}px; color: ${stateColor}; margin-top: 8px;">${state}</span>` : ''}
            </div>
          `;
        } else if (module.grid_style === 'style_5') {
          return html`
            <div class="grid-item-compact">
              <div class="grid-item-top-row">
                ${styleConfig.showIcon ? renderIconOrPicture(iconSize, iconColor) : ''}
                ${styleConfig.showName ? html`<span class="grid-item-name" style="font-size: ${fontSize}px; color: ${nameColor};">${name}</span>` : ''}
              </div>
              ${styleConfig.showState ? html`<span class="grid-item-state" style="font-size: ${fontSize - 1}px; color: ${stateColor};">${state}</span>` : ''}
            </div>
          `;
        } else if (module.grid_style === 'style_15') {
          // Panel style with customizable header colors
          const panelHeaderBg = module.panel_header_color || iconColor;
          const panelHeaderText = module.panel_header_text_color || 'var(--text-primary-color, white)';
          return html`
            <div class="grid-item-panel">
              <div class="grid-item-panel-header" style="background: ${panelHeaderBg};">
                ${styleConfig.showIcon
                  ? entityPicture
                    ? html`<div class="grid-item-picture" style="width: ${iconSize - 4}px; height: ${iconSize - 4}px;"><img src="${entityPicture}" alt="${name}" /></div>`
                    : html`<ha-icon icon="${icon}" style="--mdc-icon-size: ${iconSize - 4}px; color: ${panelHeaderText};"></ha-icon>`
                  : ''}
              </div>
              <div class="grid-item-panel-body" style="padding: 12px;">
                ${styleConfig.showName ? html`<span class="grid-item-name" style="font-size: ${fontSize}px; color: ${nameColor};">${name}</span>` : ''}
                ${styleConfig.showState ? html`<span class="grid-item-state" style="font-size: ${fontSize - 1}px; color: ${stateColor};">${state}</span>` : ''}
              </div>
            </div>
          `;
        } else if (module.grid_style === 'style_18') {
          // Split style with customizable left/right colors
          const splitLeftBg = module.split_left_color || iconColor;
          const splitRightBg = module.split_right_color || 'transparent';
          return html`
            <div class="grid-item-split">
              <div class="grid-item-split-left" style="background: ${splitLeftBg}; padding: 16px;">
                ${styleConfig.showIcon
                  ? entityPicture
                    ? html`<div class="grid-item-picture" style="width: ${iconSize}px; height: ${iconSize}px;"><img src="${entityPicture}" alt="${name}" /></div>`
                    : html`<ha-icon icon="${icon}" style="--mdc-icon-size: ${iconSize}px; color: var(--text-primary-color, white);"></ha-icon>`
                  : ''}
              </div>
              <div class="grid-item-split-right" style="background: ${splitRightBg}; padding: 12px;">
                ${styleConfig.showName ? html`<span class="grid-item-name" style="font-size: ${fontSize}px; color: ${nameColor};">${name}</span>` : ''}
                ${styleConfig.showState ? html`<span class="grid-item-state" style="font-size: ${fontSize - 1}px; color: ${stateColor};">${state}</span>` : ''}
              </div>
            </div>
          `;
        } else {
          return html`
            <div class="grid-item-vertical">
              ${styleConfig.showIcon ? renderIconOrPicture(iconSize, iconColor) : ''}
              ${styleConfig.showName ? html`<span class="grid-item-name" style="font-size: ${fontSize}px; color: ${nameColor}; ${styleConfig.showIcon ? 'margin-top: 8px;' : ''}">${name}</span>` : ''}
              ${styleConfig.showState ? html`<span class="grid-item-state" style="font-size: ${fontSize - 1}px; color: ${stateColor}; margin-top: 4px;">${state}</span>` : ''}
            </div>
          `;
        }
    }
  }

  // Render pagination controls
  private renderPaginationControls(
    currentPage: number,
    totalPages: number,
    module: GridModule
  ): TemplateResult {
    const style = module.pagination_style || 'both';
    const showNumbers = style === 'numbers' || style === 'both';
    const showButtons = style === 'buttons' || style === 'both';

    return html`
      <div class="uc-grid-pagination">
        ${showButtons
          ? html`
              <button
                class="pagination-btn"
                ?disabled=${currentPage <= 1}
                @click=${() => {
                  this._currentPages.set(module.id, currentPage - 1);
                  this.triggerPreviewUpdate();
                }}
              >
                <ha-icon icon="mdi:chevron-left"></ha-icon>
              </button>
            `
          : ''}
        ${showNumbers
          ? html`
              <div class="pagination-numbers">
                ${Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  page => html`
                    <button
                      class="pagination-number ${page === currentPage ? 'active' : ''}"
                      @click=${() => {
                        this._currentPages.set(module.id, page);
                        this.triggerPreviewUpdate();
                      }}
                    >
                      ${page}
                    </button>
                  `
                )}
              </div>
            `
          : ''}
        ${showButtons
          ? html`
              <button
                class="pagination-btn"
                ?disabled=${currentPage >= totalPages}
                @click=${() => {
                  this._currentPages.set(module.id, currentPage + 1);
                  this.triggerPreviewUpdate();
                }}
              >
                <ha-icon icon="mdi:chevron-right"></ha-icon>
              </button>
            `
          : ''}
      </div>
    `;
  }

  // Get editor-specific styles
  private getEditorStyles(): string {
    return `
      .settings-section {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 24px;
      }
      .section-title {
        font-size: 18px;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--primary-color);
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 2px solid var(--primary-color);
        letter-spacing: 0.5px;
      }
      .field-container {
        margin-bottom: 16px;
      }
      .field-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
        margin-bottom: 4px;
      }
      .field-description {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 12px;
        opacity: 0.8;
        line-height: 1.4;
      }
      .number-range-control {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .range-slider {
        flex: 0 0 65%;
        height: 6px;
        background: var(--divider-color);
        border-radius: 3px;
        outline: none;
        appearance: none;
        -webkit-appearance: none;
        cursor: pointer;
      }
      .range-slider::-webkit-slider-thumb {
        appearance: none;
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        background: var(--primary-color);
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      .range-input {
        flex: 0 0 20%;
        padding: 6px 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 13px;
        text-align: center;
      }
      .range-reset-btn {
        width: 32px;
        height: 32px;
        padding: 0;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }
      .range-reset-btn:hover {
        background: var(--primary-color);
        color: var(--text-primary-color);
        border-color: var(--primary-color);
      }
      .conditional-group {
        margin-top: 16px;
        border-left: 4px solid var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.08);
        border-radius: 0 8px 8px 0;
        padding: 16px;
      }
      .entity-rows-container {
        margin-top: 16px;
      }
      .entity-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: var(--card-background-color);
        border-radius: 8px;
        margin-bottom: 8px;
        cursor: move;
        border: 1px solid var(--divider-color);
        transition: all 0.2s ease;
      }
      .entity-row:hover {
        border-color: var(--primary-color);
      }
      .entity-row.dragging {
        opacity: 0.5;
      }
      .entity-row.drag-over {
        border-top: 3px solid var(--primary-color);
      }
      .drag-handle {
        cursor: grab;
        color: var(--secondary-text-color);
      }
      .entity-info {
        flex: 1;
        font-size: 14px;
        color: var(--primary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .entity-info.no-entity {
        color: var(--secondary-text-color);
        font-style: italic;
      }
      .expand-icon {
        cursor: pointer;
        color: var(--primary-color);
        transition: transform 0.2s ease;
      }
      .expand-icon.expanded {
        transform: rotate(180deg);
      }
      .delete-icon {
        cursor: pointer;
        color: var(--error-color);
      }
      .entity-settings {
        padding: 16px;
        background: rgba(var(--rgb-primary-color), 0.05);
        border-left: 3px solid var(--primary-color);
        border-radius: 0 8px 8px 0;
        margin-bottom: 8px;
        animation: slideDown 0.3s ease;
      }
      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .add-entity-btn {
        width: 100%;
        padding: 12px;
        background: var(--primary-color);
        color: var(--text-primary-color);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s ease;
      }
      .add-entity-btn:hover {
        opacity: 0.9;
      }
      .chips-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 12px;
      }
      .filter-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: var(--primary-color);
        color: var(--text-primary-color);
        border-radius: 16px;
        font-size: 13px;
        transition: all 0.2s ease;
        position: relative;
      }
      .filter-chip.exclude-chip {
        background: var(--error-color);
      }
      .filter-chip:hover {
        opacity: 0.9;
        padding-right: 32px;
      }
      .chip-remove-icon {
        cursor: pointer;
        font-size: 16px;
        opacity: 0;
        position: absolute;
        right: 8px;
        transition: opacity 0.2s ease;
      }
      .filter-chip:hover .chip-remove-icon {
        opacity: 1;
      }
      .domain-select {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        cursor: pointer;
      }
      .keyword-input-row {
        margin-top: 8px;
      }
      .keyword-input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        box-sizing: border-box;
      }
      .keyword-input:focus {
        outline: none;
        border-color: var(--primary-color);
      }
      .keyword-input::placeholder {
        color: var(--secondary-text-color);
        opacity: 0.7;
      }
      .info-box {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: rgba(var(--rgb-primary-color), 0.1);
        border-radius: 8px;
        margin-top: 16px;
        font-size: 13px;
        color: var(--primary-color);
      }
      .style-info {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: rgba(var(--rgb-primary-color), 0.08);
        border-radius: 8px;
        margin-bottom: 16px;
        font-size: 13px;
        color: var(--secondary-text-color);
        border-left: 3px solid var(--primary-color);
      }
      .style-info ha-icon {
        color: var(--primary-color);
        --mdc-icon-size: 20px;
      }
      .style-info strong {
        color: var(--primary-text-color);
      }
      .color-field {
        margin-bottom: 16px;
      }
      .action-override-note {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: rgba(var(--rgb-info-color, 3, 169, 244), 0.1);
        border-radius: 8px;
        font-size: 13px;
        color: var(--info-color, #03a9f4);
        margin-top: 12px;
      }
      /* Entity Actions Override Styles */
      .entity-actions-override {
        margin-top: 16px;
        padding: 16px;
        background: rgba(var(--rgb-primary-color), 0.05);
        border-radius: 8px;
        border-left: 3px solid var(--primary-color);
      }
      .entity-action-info {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background: rgba(var(--rgb-info-color, 3, 169, 244), 0.1);
        border-radius: 6px;
        font-size: 12px;
        color: var(--info-color, #03a9f4);
        margin-bottom: 16px;
      }
      .entity-action-info ha-icon {
        --mdc-icon-size: 18px;
        flex-shrink: 0;
      }
      .entity-action-field {
        margin-bottom: 16px;
      }
      .entity-action-field:last-child {
        margin-bottom: 0;
      }
      .entity-action-field ha-form {
        --ha-form-padding: 0;
        display: block;
        width: 100%;
      }
      /* Ensure action selectors can expand and show all fields */
      .entity-action-field ha-selector,
      .entity-action-field ha-selector-ui-action {
        display: block;
        width: 100%;
      }
      .entity-action-field ha-expansion-panel {
        --expansion-panel-content-padding: 0 16px 16px;
      }
      /* Section Spacer */
      .entity-section-spacer {
        height: 24px;
        margin: 8px 0;
        border-bottom: 1px dashed var(--divider-color);
      }
      /* Entity Condition Styles */
      .entity-conditions-list {
        margin-top: 12px;
      }
      .add-condition-btn {
        font-size: 12px;
        transition: all 0.2s ease;
      }
      .add-condition-btn:hover {
        background: var(--primary-color) !important;
        color: var(--text-primary-color) !important;
        border-style: solid !important;
      }
      .entity-condition-item {
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 8px;
        background: var(--card-background-color);
        transition: all 0.2s ease;
      }
      .entity-condition-item:hover {
        border-color: var(--primary-color);
      }
      .entity-condition-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--divider-color);
      }
      .entity-condition-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .entity-condition-delete {
        cursor: pointer;
        color: var(--error-color);
        --mdc-icon-size: 18px;
        transition: transform 0.2s ease;
      }
      .entity-condition-delete:hover {
        transform: scale(1.1);
      }
    `;
  }

  // Get styles for preview rendering
  getStyles(): string {
    return `
      /* Grid Container */
      .uc-grid-container {
        width: 100%;
        box-sizing: border-box;
      }

      /* Grid Container Mode Styles */
      .uc-grid-container.uc-grid-mode-metro {
        /* Metro uses dense packing to fill gaps */
      }

      .uc-grid-container.uc-grid-mode-masonry {
        /* Masonry allows variable heights */
        align-items: start;
      }

      /* Grid Item Base */
      .uc-grid-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        box-sizing: border-box;
        /* overflow hidden causes text cutoff - use visible but clip visual overflow */
        overflow: visible;
      }

      /* In regular grid mode, items have equal height */
      .uc-grid-mode-grid .uc-grid-item {
        min-height: 80px;
      }

      /* In masonry mode, items span rows based on class */
      .uc-grid-mode-masonry .uc-grid-item {
        grid-row: span 1;
        /* Don't force overflow hidden - let content determine height within row span */
        min-height: auto;
        height: 100%;
      }

      /* In metro mode, items have defined sizes via classes */
      .uc-grid-mode-metro .uc-grid-item {
        min-height: auto;
        height: 100%;
      }

      /* Hover Effects */
      .uc-grid-item.hover-scale:hover {
        transform: scale(var(--hover-scale, 1.05));
        z-index: 1;
      }

      .uc-grid-item.hover-glow:hover {
        box-shadow: 0 0 20px var(--hover-glow-color, var(--primary-color));
      }

      .uc-grid-item.hover-lift:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      }

      .uc-grid-item.hover-color:hover {
        background: var(--hover-background-color, var(--primary-color)) !important;
      }

      /* Metro Sizes - spans based on doubled column grid */
      /* Small = 1 visual column (2 grid columns) */
      .uc-grid-item.metro-small {
        grid-column: span 2;
        grid-row: span 1;
        height: 100%;
        min-width: 0;
      }

      /* Medium = 2 visual columns (4 grid columns) */
      .uc-grid-item.metro-medium {
        grid-column: span 4;
        grid-row: span 1;
        height: 100%;
        min-width: 0;
      }

      /* Large = 2 visual columns, 2 rows tall */
      .uc-grid-item.metro-large {
        grid-column: span 4;
        grid-row: span 2;
        height: 100%;
        min-width: 0;
      }

      /* Masonry varied heights - items fill their row span completely */
      .uc-grid-item.masonry-tall {
        grid-row: span 2;
        height: 100%;
      }

      .uc-grid-item.masonry-extra-tall {
        grid-row: span 3;
        height: 100%;
      }

      /* Grid Item Content Layouts */
      .grid-item-vertical {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        gap: 4px;
        padding: 8px;
        box-sizing: border-box;
      }

      .grid-item-horizontal {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 12px;
        width: 100%;
        height: 100%;
        padding: 8px;
        box-sizing: border-box;
      }

      .grid-item-text {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        flex: 1;
        min-width: 0;
        overflow: hidden;
      }

      .grid-item-icon-only {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        width: 100%;
        height: 100%;
      }

      /* Entity picture for person, camera, media_player entities */
      .grid-item-picture {
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
        background: var(--secondary-background-color);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .grid-item-picture img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .grid-item-compact {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        padding: 8px;
        box-sizing: border-box;
      }

      .grid-item-top-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }

      /* Panel Style */
      .grid-item-panel {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .grid-item-panel-header {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px;
      }

      .grid-item-panel-body {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
      }

      /* Split Style */
      .grid-item-split {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .grid-item-split-left {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 40%;
      }

      .grid-item-split-right {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        flex: 1;
      }

      /* Text Elements */
      .grid-item-name {
        font-weight: 500;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        /* Allow wrapping for longer names in metro/masonry but truncate in regular grid */
        word-break: break-word;
      }

      /* Regular grid: single line with ellipsis */
      .uc-grid-mode-grid .grid-item-name {
        white-space: nowrap;
      }

      /* Metro/Masonry: allow wrapping for larger tiles */
      .uc-grid-mode-metro .grid-item-name,
      .uc-grid-mode-masonry .grid-item-name {
        white-space: normal;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      /* Large metro tiles can show more lines */
      .uc-grid-mode-metro .metro-large .grid-item-name {
        -webkit-line-clamp: 3;
      }

      .grid-item-state {
        opacity: 0.8;
        line-height: 1.3;
        text-transform: capitalize;
      }

      /* Badge Styles */
      .grid-item-badge {
        position: absolute;
        bottom: -4px;
        right: -4px;
        background: var(--primary-color);
        color: var(--text-primary-color, white);
        padding: 2px 6px;
        border-radius: 10px;
        font-weight: 600;
        text-transform: capitalize;
      }

      .grid-item-corner-badge {
        position: absolute;
        top: 4px;
        right: 4px;
        font-size: 10px;
        background: rgba(0, 0, 0, 0.5);
        color: white;
        padding: 2px 4px;
        border-radius: 4px;
        text-transform: capitalize;
      }

      .grid-item-ring-state {
        position: absolute;
        bottom: 8px;
        left: 50%;
        transform: translateX(-50%);
        text-transform: capitalize;
        color: var(--primary-text-color);
        font-weight: 500;
        white-space: nowrap;
      }

      /* Empty State */
      .grid-empty-state {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px;
        color: var(--secondary-text-color);
        gap: 8px;
      }

      .grid-empty-state ha-icon {
        --mdc-icon-size: 48px;
        opacity: 0.5;
      }

      /* Pagination */
      .uc-grid-pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 16px;
        padding: 8px;
      }

      .pagination-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .pagination-btn:hover:not([disabled]) {
        background: var(--primary-color);
        color: var(--text-primary-color);
        border-color: var(--primary-color);
      }

      .pagination-btn[disabled] {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .pagination-numbers {
        display: flex;
        gap: 4px;
      }

      .pagination-number {
        width: 32px;
        height: 32px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .pagination-number:hover {
        border-color: var(--primary-color);
      }

      .pagination-number.active {
        background: var(--primary-color);
        color: var(--text-primary-color);
        border-color: var(--primary-color);
      }

      /* Load Animations */
      @keyframes grid-fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes grid-slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes grid-slideDown {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes grid-slideLeft {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }

      @keyframes grid-slideRight {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      }

      @keyframes grid-zoomIn {
        from { opacity: 0; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1); }
      }

      /* Style-specific Overrides */
      .grid-style-style_4 .grid-item-icon-only {
        min-height: 60px;
      }

      .grid-style-style_6:hover::after {
        content: attr(data-name);
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: var(--tooltip-background-color, rgba(0, 0, 0, 0.9));
        color: var(--tooltip-text-color, white);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        pointer-events: none;
        z-index: 10;
      }

      /* Ring Progress style - circular ring with icon inside */
      .grid-style-style_9 {
        position: relative;
        aspect-ratio: 1 / 1 !important;
        border-radius: 50% !important;
        background: transparent !important;
        border: 3px solid var(--primary-color) !important;
        box-sizing: border-box;
      }
      
      .grid-style-style_9 .grid-item-icon-only {
        flex-direction: column;
      }

      .grid-style-style_12 {
        border: 2px solid var(--divider-color) !important;
      }

      .grid-style-style_12:hover {
        border-color: var(--primary-color) !important;
      }

      .grid-style-style_15 {
        padding: 0 !important;
        overflow: hidden;
      }

      /* Style 17 (Gradient) - background set via inline styles from buildItemStyles */
      .grid-style-style_17 .grid-item-name,
      .grid-style-style_17 .grid-item-state {
        color: var(--text-primary-color, white);
      }

      .grid-style-style_18 {
        padding: 0 !important;
        overflow: hidden;
      }

      /* Responsive adjustments */
      @media (max-width: 600px) {
        .uc-grid-container.uc-grid-mode-grid,
        .uc-grid-container.uc-grid-mode-masonry {
          grid-template-columns: repeat(2, 1fr) !important;
        }

        .uc-grid-container.uc-grid-mode-metro {
          grid-template-columns: repeat(4, 1fr) !important;
        }

        .uc-grid-item.metro-small {
          grid-column: span 2;
          grid-row: span 1;
        }

        .uc-grid-item.metro-medium,
        .uc-grid-item.metro-large {
          grid-column: span 4;
          grid-row: span 1;
        }

        .uc-grid-item.masonry-tall,
        .uc-grid-item.masonry-extra-tall {
          grid-row: span 1;
        }
      }
    `;
  }
}
