import { TemplateResult, html, css } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig, SliderControlModule, SliderBar } from '../types';
import { UltraLinkComponent } from '../components/ultra-link';
import { localize } from '../localize/localize';
import { EntityIconService } from '../services/entity-icon-service';

export class UltraSliderControlModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'slider_control',
    title: 'Slider Control',
    description: 'Interactive slider for controlling entity values',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:tune-vertical',
    category: 'interactive',
    tags: ['slider', 'control', 'light', 'cover', 'fan', 'interactive', 'entity'],
  };

  // Drag state management
  private dragState = new Map<
    string,
    {
      isDragging: boolean;
      startX: number;
      startY: number;
      startValue: number;
      currentValue: number;
    }
  >();

  // Bar management state
  private expandedBars: Set<string> = new Set();

  // Track which bars are being interacted with to prevent reactive updates
  private interactingBars: Set<string> = new Set();

  // Track local values during interaction to prevent glitchy behavior
  private localSliderValues: Map<string, number> = new Map();

  // Track cooldown period after interaction ends
  private sliderCooldowns: Map<string, any> = new Map();

  // Track transition state for smooth return to entity value
  private sliderTransitions: Map<string, any> = new Map();

  // Request update method for UI refresh
  requestUpdate(): void {
    // This will be called by the editor to trigger a re-render
    // The actual implementation depends on the editor context
  }

  // Cleanup method to prevent memory leaks
  cleanup(): void {
    // Clear all cooldown timers
    this.sliderCooldowns.forEach(timer => {
      clearTimeout(timer);
    });
    this.sliderCooldowns.clear();

    // Clear all transition timers
    this.sliderTransitions.forEach(timer => {
      clearInterval(timer);
    });
    this.sliderTransitions.clear();

    this.localSliderValues.clear();
    this.interactingBars.clear();
  }

  createDefault(id?: string, homeAssistant?: HomeAssistant): SliderControlModule {
    // Auto-detect suitable entity and create bars array
    const bars: SliderBar[] = [];

    if (homeAssistant?.states) {
      const entityIds = Object.keys(homeAssistant.states);
      const light = entityIds.find(id => id.startsWith('light.'));
      const cover = entityIds.find(id => id.startsWith('cover.'));
      const fan = entityIds.find(id => id.startsWith('fan.'));
      const inputNumber = entityIds.find(id => id.startsWith('input_number.'));

      const autoEntity = light || cover || fan || inputNumber || '';

      if (autoEntity) {
        // Auto-detect entity capabilities and create appropriate bars
        if (light) {
          const entityState = homeAssistant.states[light];
          if (entityState) {
            // Always add brightness bar for lights
            bars.push({
              id: this.generateId('brightness'),
              type: 'brightness',
              entity: light,
              min_value: 0,
              max_value: 100,
              step: 1,
              // Initialize with some default style settings
              slider_style: 'flat',
              show_icon: true,
              show_name: true,
              show_value: true,
              // Individual element positioning
              icon_position: 'left',
              name_position: 'left',
              value_position: 'right',
              info_section_position: 'left',
              // Legacy positioning (backward compatibility)
              outside_text_position: 'left',
              outside_name_position: 'top_left',
              outside_value_position: 'bottom_left',
            });

            // Add RGB bar if supported
            if (entityState.attributes.rgb_color) {
              bars.push({
                id: this.generateId('rgb'),
                type: 'rgb',
                entity: light,
                min_value: 0,
                max_value: 100,
                step: 1,
                // RGB bars often look better with gradient style
                slider_style: 'flat',
                show_icon: true,
                show_name: true,
                show_value: true,
                // Individual element positioning
                icon_position: 'left',
                name_position: 'left',
                value_position: 'right',
                info_section_position: 'left',
                // Legacy positioning (backward compatibility)
                outside_text_position: 'left',
                outside_name_position: 'top_left',
                outside_value_position: 'bottom_left',
              });
            }

            // Add color temp bar if supported
            if (entityState.attributes.color_temp) {
              bars.push({
                id: this.generateId('color_temp'),
                type: 'color_temp',
                entity: light,
                min_value: 0,
                max_value: 100,
                step: 1,
                // Color temp bars also benefit from gradient style
                slider_style: 'flat',
                show_icon: true,
                show_name: true,
                show_value: true,
                // Individual element positioning
                icon_position: 'left',
                name_position: 'left',
                value_position: 'right',
                info_section_position: 'left',
                // Legacy positioning (backward compatibility)
                outside_text_position: 'left',
                outside_name_position: 'top_left',
                outside_value_position: 'bottom_left',
              });
            }
          }
        } else if (cover) {
          bars.push({
            id: this.generateId('cover'),
            type: 'numeric',
            entity: cover,
            min_value: 0,
            max_value: 100,
            step: 1,
            show_icon: true,
            show_name: true,
            show_value: true,
            // Individual element positioning
            icon_position: 'left',
            name_position: 'left',
            value_position: 'right',
            info_section_position: 'left',
            // Legacy positioning (backward compatibility)
            outside_text_position: 'left',
            outside_name_position: 'top_left',
            outside_value_position: 'bottom_left',
          });
        } else if (fan) {
          bars.push({
            id: this.generateId('fan'),
            type: 'numeric',
            entity: fan,
            min_value: 0,
            max_value: 100,
            step: 1,
            show_icon: true,
            show_name: true,
            show_value: true,
            // Individual element positioning
            icon_position: 'left',
            name_position: 'left',
            value_position: 'right',
            info_section_position: 'left',
            // Legacy positioning (backward compatibility)
            outside_text_position: 'left',
            outside_name_position: 'top_left',
            outside_value_position: 'bottom_left',
          });
        } else if (inputNumber) {
          const entityState = homeAssistant.states[inputNumber];
          bars.push({
            id: this.generateId('input_number'),
            type: 'numeric',
            entity: inputNumber,
            min_value: entityState?.attributes.min || 0,
            max_value: entityState?.attributes.max || 100,
            step: entityState?.attributes.step || 1,
            show_icon: true,
            show_name: true,
            show_value: true,
            // Individual element positioning
            icon_position: 'left',
            name_position: 'left',
            value_position: 'right',
            info_section_position: 'left',
            // Legacy positioning (backward compatibility)
            outside_text_position: 'left',
            outside_name_position: 'top_left',
            outside_value_position: 'bottom_left',
          });
        }
      }
    }

    return {
      id: id || this.generateId('slider_control'),
      type: 'slider_control',

      // Multi-bar Configuration
      bars: bars,

      // Orientation & Layout
      orientation: 'horizontal',
      layout_mode: 'overlay',
      outside_text_position: 'left',
      outside_name_position: 'top_left',
      outside_value_position: 'bottom_left',
      split_bar_position: 'left',
      split_info_position: 'right',
      split_bar_length: 60,

      // Slider Visual Style
      slider_style: 'flat',
      slider_height: 55,
      bar_spacing: 8,
      slider_radius: 'round',
      border_radius: 10,
      slider_track_color: '', // Empty = auto-calculate from fill at 25% opacity
      slider_fill_color: 'var(--primary-color)',
      dynamic_fill_color: false,
      glass_blur_amount: 8,

      // Gradient Support
      use_gradient: false,
      gradient_stops: [],

      // Display Elements
      show_icon: true,
      dynamic_icon: true,
      icon_as_toggle: true,
      icon_size: 24,
      icon_color: 'var(--primary-text-color)',
      auto_contrast: true,

      show_name: true,
      name_size: 14,
      name_color: 'var(--primary-text-color)',
      name_bold: true,

      show_state: false,
      state_size: 12,
      state_color: 'var(--secondary-text-color)',
      state_bold: false,

      show_value: true,
      value_size: 14,
      value_color: 'var(--primary-text-color)',
      value_suffix: '%',
      show_bar_label: false,

      // Toggle Integration
      show_toggle: false,
      toggle_position: 'right',
      toggle_size: 28,
      toggle_color_on: 'var(--primary-color)',
      toggle_color_off: 'rgba(var(--rgb-primary-text-color), 0.3)',

      // Light Color Control
      show_color_picker: false,
      color_picker_position: 'below',
      color_picker_size: 'medium',

      // Animation
      animate_on_change: true,
      transition_duration: 200,
      haptic_feedback: true,

      // Actions
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },

      // Hover
      enable_hover_effect: false,

      // Logic
      display_mode: 'always',
      display_conditions: [],
    };
  }

  // Migration method for backward compatibility
  migrateFromLegacy(module: any, homeAssistant?: HomeAssistant): SliderControlModule {
    const sliderControl = module as SliderControlModule;

    // Check if this is a legacy config (has single entity but no bars)
    if (sliderControl.entity && (!sliderControl.bars || sliderControl.bars.length === 0)) {
      const bars: SliderBar[] = [];
      const entityState = homeAssistant?.states?.[sliderControl.entity];

      if (entityState) {
        const domain = sliderControl.entity.split('.')[0];

        if (domain === 'light') {
          // Migrate based on light_control_mode
          const controlMode = sliderControl.light_control_mode || 'brightness';

          if (controlMode === 'brightness' || controlMode === 'both' || controlMode === 'all') {
            bars.push({
              id: this.generateId('brightness'),
              type: 'brightness',
              entity: sliderControl.entity,
              name: sliderControl.name,
              min_value: sliderControl.min_value,
              max_value: sliderControl.max_value,
              step: sliderControl.step,
              // Copy global style settings to bar
              slider_style: sliderControl.slider_style,
              slider_height: sliderControl.slider_height,
              slider_track_color: sliderControl.slider_track_color,
              slider_fill_color: sliderControl.slider_fill_color,
              dynamic_fill_color: sliderControl.dynamic_fill_color,
              show_icon: sliderControl.show_icon,
              show_name: sliderControl.show_name,
              show_value: sliderControl.show_value,
              icon: sliderControl.icon,
              icon_size: sliderControl.icon_size,
              icon_color: sliderControl.icon_color,
              dynamic_icon: sliderControl.dynamic_icon,
              icon_as_toggle: sliderControl.icon_as_toggle,
              name_size: sliderControl.name_size,
              name_color: sliderControl.name_color,
              name_bold: sliderControl.name_bold,
              value_size: sliderControl.value_size,
              value_color: sliderControl.value_color,
              value_suffix: sliderControl.value_suffix,
              auto_contrast: sliderControl.auto_contrast,
            });
          }

          if (controlMode === 'rgb' || controlMode === 'both' || controlMode === 'all') {
            bars.push({
              id: this.generateId('rgb'),
              type: 'rgb',
              entity: sliderControl.entity,
              min_value: sliderControl.min_value,
              max_value: sliderControl.max_value,
              step: sliderControl.step,
              // Copy global style settings to bar
              slider_style: sliderControl.slider_style,
              slider_height: sliderControl.slider_height,
              slider_track_color: sliderControl.slider_track_color,
              slider_fill_color: sliderControl.slider_fill_color,
              dynamic_fill_color: sliderControl.dynamic_fill_color,
              show_icon: sliderControl.show_icon,
              show_name: sliderControl.show_name,
              show_value: sliderControl.show_value,
              icon: sliderControl.icon,
              icon_size: sliderControl.icon_size,
              icon_color: sliderControl.icon_color,
              dynamic_icon: sliderControl.dynamic_icon,
              icon_as_toggle: sliderControl.icon_as_toggle,
              name_size: sliderControl.name_size,
              name_color: sliderControl.name_color,
              name_bold: sliderControl.name_bold,
              value_size: sliderControl.value_size,
              value_color: sliderControl.value_color,
              value_suffix: sliderControl.value_suffix,
              auto_contrast: sliderControl.auto_contrast,
            });
          }

          if (controlMode === 'color_temp' || controlMode === 'all') {
            bars.push({
              id: this.generateId('color_temp'),
              type: 'color_temp',
              entity: sliderControl.entity,
              min_value: sliderControl.min_value,
              max_value: sliderControl.max_value,
              step: sliderControl.step,
              // Copy global style settings to bar
              slider_style: sliderControl.slider_style,
              slider_height: sliderControl.slider_height,
              slider_track_color: sliderControl.slider_track_color,
              slider_fill_color: sliderControl.slider_fill_color,
              dynamic_fill_color: sliderControl.dynamic_fill_color,
              show_icon: sliderControl.show_icon,
              show_name: sliderControl.show_name,
              show_value: sliderControl.show_value,
              icon: sliderControl.icon,
              icon_size: sliderControl.icon_size,
              icon_color: sliderControl.icon_color,
              dynamic_icon: sliderControl.dynamic_icon,
              icon_as_toggle: sliderControl.icon_as_toggle,
              name_size: sliderControl.name_size,
              name_color: sliderControl.name_color,
              name_bold: sliderControl.name_bold,
              value_size: sliderControl.value_size,
              value_color: sliderControl.value_color,
              value_suffix: sliderControl.value_suffix,
              auto_contrast: sliderControl.auto_contrast,
            });
          }
        } else {
          // Non-light entity
          bars.push({
            id: this.generateId('numeric'),
            type: 'numeric',
            entity: sliderControl.entity,
            name: sliderControl.name,
            min_value: sliderControl.min_value,
            max_value: sliderControl.max_value,
            step: sliderControl.step,
            // Copy global style settings to bar
            slider_style: sliderControl.slider_style,
            slider_height: sliderControl.slider_height,
            slider_track_color: sliderControl.slider_track_color,
            slider_fill_color: sliderControl.slider_fill_color,
            dynamic_fill_color: sliderControl.dynamic_fill_color,
            show_icon: sliderControl.show_icon,
            show_name: sliderControl.show_name,
            show_value: sliderControl.show_value,
            icon: sliderControl.icon,
            icon_size: sliderControl.icon_size,
            icon_color: sliderControl.icon_color,
            dynamic_icon: sliderControl.dynamic_icon,
            icon_as_toggle: sliderControl.icon_as_toggle,
            name_size: sliderControl.name_size,
            name_color: sliderControl.name_color,
            name_bold: sliderControl.name_bold,
            value_size: sliderControl.value_size,
            value_color: sliderControl.value_color,
            value_suffix: sliderControl.value_suffix,
            auto_contrast: sliderControl.auto_contrast,
          });
        }
      }

      // Return migrated config
      return {
        ...sliderControl,
        bars: bars,
        // Keep legacy properties for backward compatibility but mark as deprecated
        entity: sliderControl.entity, // Keep for reference
        name: sliderControl.name, // Keep for reference
        min_value: sliderControl.min_value, // Keep for reference
        max_value: sliderControl.max_value, // Keep for reference
        step: sliderControl.step, // Keep for reference
        light_control_mode: sliderControl.light_control_mode, // Keep for reference
      };
    }

    // Already migrated or new config
    return sliderControl;
  }

  // Helper methods for bar management
  private _addBar(type?: string, entity?: string): SliderBar {
    const barId = this.generateId('bar');
    const defaultType = type || 'numeric';

    return {
      id: barId,
      type: defaultType as any,
      entity: entity || '',
      min_value: 0,
      max_value: 100,
      step: 1,
      show_icon: true,
      show_name: true,
      show_value: true,
      // Individual element positioning (modern approach)
      icon_position: 'left',
      name_position: 'left',
      value_position: 'right',
      info_section_position: 'left',
      // Legacy positioning (kept for backward compatibility)
      outside_text_position: 'left',
      outside_name_position: 'top_left',
      outside_value_position: 'bottom_left',
      overlay_name_position: 'top',
      overlay_value_position: 'middle',
      overlay_icon_position: 'bottom',
      content_position: 'left',
      // Default style settings for new bars
      slider_style: 'flat',
      dynamic_icon: true,
      icon_as_toggle: true,
      name_bold: true,
      auto_contrast: true,
    };
  }

  private _deleteBar(barId: string, bars: SliderBar[]): SliderBar[] {
    return bars.filter(bar => bar.id !== barId);
  }

  private _duplicateBar(bar: SliderBar): SliderBar {
    return {
      ...bar,
      id: this.generateId('bar'),
      name: bar.name ? `${bar.name} (Copy)` : undefined,
    };
  }

  private _reorderBars(bars: SliderBar[], fromIndex: number, toIndex: number): SliderBar[] {
    const newBars = [...bars];
    const [removed] = newBars.splice(fromIndex, 1);
    newBars.splice(toIndex, 0, removed);
    return newBars;
  }

  private _detectBarType(entity: string, homeAssistant: HomeAssistant): string {
    if (!entity || !homeAssistant?.states?.[entity]) {
      return 'numeric';
    }

    const entityState = homeAssistant.states[entity];
    const domain = entity.split('.')[0];

    // Check for RGB color support
    if (entityState.attributes.rgb_color) {
      return 'rgb';
    }

    // Check for color temperature support
    if (entityState.attributes.color_temp) {
      return 'color_temp';
    }

    // Check for brightness support (lights)
    if (domain === 'light' && entityState.attributes.brightness !== undefined) {
      return 'brightness';
    }

    // Default to numeric for any entity with numeric state
    return 'numeric';
  }

  private _getBarGradient(
    bar: SliderBar,
    homeAssistant: HomeAssistant,
    orientation: 'horizontal' | 'vertical' = 'horizontal'
  ): string {
    const gradientDir = orientation === 'vertical' ? '0deg' : '90deg';

    switch (bar.type) {
      case 'rgb':
        return orientation === 'vertical'
          ? `linear-gradient(0deg, rgb(255, 0, 0) 0%, rgb(255, 255, 0) 16.67%, rgb(0, 255, 0) 33.33%, rgb(0, 255, 255) 50%, rgb(0, 0, 255) 66.67%, rgb(255, 0, 255) 83.33%, rgb(255, 0, 0) 100%)`
          : `linear-gradient(90deg, rgb(255, 0, 0) 0%, rgb(255, 255, 0) 16.67%, rgb(0, 255, 0) 33.33%, rgb(0, 255, 255) 50%, rgb(0, 0, 255) 66.67%, rgb(255, 0, 255) 83.33%, rgb(255, 0, 0) 100%)`;

      case 'color_temp':
        return `linear-gradient(${gradientDir}, rgb(255, 147, 41) 0%, rgb(255, 180, 112) 10%, rgb(255, 220, 177) 20%, rgb(255, 246, 213) 30%, rgb(255, 255, 255) 50%, rgb(230, 240, 255) 70%, rgb(208, 232, 255) 80%, rgb(169, 200, 255) 90%, rgb(130, 170, 255) 100%)`;

      case 'red':
        return 'rgb(255, 0, 0)';

      case 'green':
        return 'rgb(0, 255, 0)';

      case 'blue':
        return 'rgb(0, 0, 255)';

      case 'brightness':
      case 'numeric':
      default:
        return 'var(--primary-color)';
    }
  }

  renderGeneralTab(
    module: CardModule,
    homeAssistant: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const sliderControl = module as SliderControlModule;
    const lang = homeAssistant?.locale?.language || 'en';
    const layoutMode = sliderControl.layout_mode || 'outside';

    // Check for legacy config and migrate if needed
    if (sliderControl.entity && (!sliderControl.bars || sliderControl.bars.length === 0)) {
      const migratedConfig = this.migrateFromLegacy(sliderControl, homeAssistant);
      updateModule(migratedConfig);
      return html`<div style="padding: 20px; text-align: center; color: var(--primary-color);">
        <ha-icon icon="mdi:refresh" style="font-size: 48px; margin-bottom: 12px;"></ha-icon>
        <div>Migrating to new multi-bar format...</div>
      </div>`;
    }

    return html`
      <div class="slider-control-general-tab">
        ${this.injectUcFormStyles()}
        <style>
          .slider-control-general-tab {
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 24px;
          }
          .settings-section {
            background: var(--secondary-background-color);
            border-radius: 8px;
            padding: 16px;
          }
          .settings-section.layout-settings {
            order: 1;
          }
          .settings-section.slider-style {
            order: 2;
          }
          .settings-section.bars-configuration {
            order: 3;
          }
          .section-title {
            font-size: 18px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--primary-color);
            margin-bottom: 16px;
            letter-spacing: 0.5px;
          }
          .field-container {
            margin-bottom: 16px;
          }
          .field-title {
            font-size: ${sliderControl.name_size || 16}px;
            font-weight: 600;
            margin-bottom: 4px;
            color: var(--primary-text-color);
          }
          .field-description {
            font-size: 13px;
            color: var(--secondary-text-color);
            margin-bottom: 12px;
            opacity: 0.8;
            line-height: 1.4;
          }
          .conditional-fields-group {
            margin-top: 16px;
            border-left: 4px solid var(--primary-color);
            background: rgba(var(--rgb-primary-color), 0.08);
            border-radius: 0 8px 8px 0;
            padding: 16px;
          }
          .bar-item {
            background: var(--card-background-color);
            border-radius: 8px;
            border: 1px solid var(--divider-color);
            margin-bottom: 12px;
            overflow: hidden;
          }
          .bar-header {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .bar-header:hover {
            background: var(--secondary-background-color);
          }
          .bar-header.expanded {
            background: var(--secondary-background-color);
            border-bottom: 1px solid var(--divider-color);
          }
          .drag-handle {
            color: var(--secondary-text-color);
            margin-right: 12px;
            cursor: grab;
          }
          .drag-handle:active {
            cursor: grabbing;
          }
          .bar-item.dragging {
            opacity: 0.5;
            transform: rotate(2deg);
          }
          .bar-item.drag-over {
            border-top: 2px solid var(--primary-color);
          }
          .bar-individual-controls {
            display: flex;
            gap: 8px;
            align-items: center;
            margin-right: 8px;
          }
          .bar-individual-control {
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            transition: all 0.2s ease;
            position: relative;
          }
          .bar-individual-control:hover {
            transform: scale(1.1);
          }
          .bar-individual-control.disabled {
            opacity: 0.5;
            pointer-events: none;
          }
          .bar-individual-control.active {
            background: var(--primary-color);
          }
          .bar-individual-control.active:hover {
            background: var(--primary-color-dark);
          }
          .bar-individual-control.inactive {
            background: var(--secondary-background-color);
          }
          .bar-individual-control.inactive:hover {
            background: var(--divider-color);
          }
          .bar-individual-control ha-icon {
            --mdc-icon-size: 16px;
            transition: color 0.2s ease;
          }
          .bar-individual-control.active ha-icon {
            color: white;
          }
          .bar-individual-control.inactive ha-icon {
            color: var(--secondary-text-color);
          }
          .bar-type-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            margin-right: 12px;
            min-width: 60px;
            text-align: center;
          }
          .bar-type-badge.numeric {
            background: #2196f3;
            color: white;
          }
          .bar-type-badge.brightness {
            background: #ff9800;
            color: white;
          }
          .bar-type-badge.rgb {
            background: linear-gradient(45deg, #ff0000, #00ff00, #0000ff);
            color: white;
          }
          .bar-type-badge.color_temp {
            background: linear-gradient(45deg, #ff9329, #82aaff);
            color: white;
          }
          .bar-type-badge.red {
            background: #f44336;
            color: white;
          }
          .bar-type-badge.green {
            background: #4caf50;
            color: white;
          }
          .bar-type-badge.blue {
            background: #2196f3;
            color: white;
          }
          .bar-type-badge.attribute {
            background: #9c27b0;
            color: white;
          }
          .bar-label {
            flex: 1;
            font-weight: 500;
            color: var(--primary-text-color);
          }
          .bar-actions {
            display: flex;
            gap: 8px;
            align-items: center;
          }
          .bar-action-button {
            background: none;
            border: none;
            color: var(--secondary-text-color);
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s;
          }
          .bar-action-button:hover {
            background: var(--secondary-background-color);
            color: var(--primary-text-color);
          }
          .bar-action-button.delete:hover {
            color: var(--error-color);
          }
          .bar-content {
            padding: 0 16px;
            max-height: 0;
            overflow: hidden;
            transition:
              max-height 0.2s ease-out,
              padding 0.2s ease-out;
            opacity: 0;
          }
          .bar-content.expanded {
            padding: 16px;
            max-height: 9999px;
            overflow: visible;
            opacity: 1;
            transition:
              max-height 0.2s ease-in,
              padding 0.2s ease-in,
              opacity 0.15s ease-in;
          }
          .add-bar-button {
            width: 100%;
            padding: 12px;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
            margin-bottom: 16px;
          }
          .add-bar-button:hover {
            background: var(--primary-color-dark);
          }
        </style>

        <!-- BARS CONFIGURATION -->
        <div class="settings-section bars-configuration">
          <div class="section-title">BARS CONFIGURATION</div>

          <button
            class="add-bar-button"
            @click=${() => {
              const newBar = this._addBar();
              const updatedBars = [...(sliderControl.bars || []), newBar];
              updateModule({ bars: updatedBars });
              // Auto-expand the new bar
              this.expandedBars.add(newBar.id);
            }}
          >
            <ha-icon icon="mdi:plus" style="margin-right: 8px;"></ha-icon>
            Add Bar
          </button>

          ${(sliderControl.bars || []).map((bar, index) => {
            const entityState = homeAssistant?.states?.[bar.entity];
            const entityName = entityState?.attributes?.friendly_name || bar.entity;
            const displayName = bar.name || entityName;
            const isExpanded = this.expandedBars.has(bar.id);
            const showIconSection = bar.show_icon !== false && sliderControl.show_icon !== false;
            const showNameSection = bar.show_name !== false && sliderControl.show_name !== false;
            const showValueSection = bar.show_value !== false && sliderControl.show_value !== false;

            return html`
              <div
                class="bar-item"
                data-bar-id="${bar.id}"
                draggable="true"
                @dragstart=${(e: DragEvent) => {
                  const composedPath = e.composedPath?.() || [];
                  const canDrag = composedPath.some(element =>
                    (element as HTMLElement).classList?.contains('drag-handle')
                  );

                  if (!canDrag) {
                    e.preventDefault();
                    return;
                  }

                  e.dataTransfer!.setData('text/plain', bar.id);
                  e.dataTransfer!.effectAllowed = 'move';
                  (e.currentTarget as HTMLElement).classList.add('dragging');
                }}
                @dragend=${(e: DragEvent) => {
                  (e.currentTarget as HTMLElement).classList.remove('dragging');
                }}
                @dragover=${(e: DragEvent) => {
                  e.preventDefault();
                  e.dataTransfer!.dropEffect = 'move';
                  (e.currentTarget as HTMLElement).classList.add('drag-over');
                }}
                @dragleave=${(e: DragEvent) => {
                  (e.currentTarget as HTMLElement).classList.remove('drag-over');
                }}
                @drop=${(e: DragEvent) => {
                  e.preventDefault();
                  (e.currentTarget as HTMLElement).classList.remove('drag-over');
                  const draggedBarId = e.dataTransfer!.getData('text/plain');
                  const targetBarId = bar.id;

                  if (draggedBarId !== targetBarId) {
                    const updatedBars = [...(sliderControl.bars || [])];
                    const draggedIndex = updatedBars.findIndex(b => b.id === draggedBarId);
                    const targetIndex = updatedBars.findIndex(b => b.id === targetBarId);

                    if (draggedIndex !== -1 && targetIndex !== -1) {
                      const draggedBar = updatedBars.splice(draggedIndex, 1)[0];
                      updatedBars.splice(targetIndex, 0, draggedBar);
                      updateModule({ bars: updatedBars });
                    }
                  }
                }}
              >
                <div
                  class="bar-header ${isExpanded ? 'expanded' : ''}"
                  @click=${() => {
                    const wasExpanded = this.expandedBars.has(bar.id);
                    if (wasExpanded) {
                      this.expandedBars.delete(bar.id);
                    } else {
                      this.expandedBars.add(bar.id);
                    }
                    this.requestUpdate();
                  }}
                >
                  <ha-icon
                    icon="mdi:drag-vertical"
                    class="drag-handle"
                    @click=${(e: Event) => e.stopPropagation()}
                  ></ha-icon>
                  <div class="bar-type-badge ${bar.type}">${bar.type}</div>
                  <div class="bar-label">${displayName}</div>

                  <!-- Individual Bar Controls -->
                  <div class="bar-individual-controls">
                    <div
                      class="bar-individual-control ${bar.show_icon !== false
                        ? 'active'
                        : 'inactive'}"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        const updatedBars = [...(sliderControl.bars || [])];
                        const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                        if (barIndex !== -1) {
                          updatedBars[barIndex] = {
                            ...updatedBars[barIndex],
                            show_icon: !bar.show_icon,
                          };
                        }
                        updateModule({ bars: updatedBars });
                      }}
                      title="Toggle icon visibility"
                    >
                      <ha-icon icon="mdi:lightbulb"></ha-icon>
                    </div>
                    <div
                      class="bar-individual-control ${bar.show_name !== false
                        ? 'active'
                        : 'inactive'}"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        const updatedBars = [...(sliderControl.bars || [])];
                        const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                        if (barIndex !== -1) {
                          updatedBars[barIndex] = {
                            ...updatedBars[barIndex],
                            show_name: !bar.show_name,
                          };
                        }
                        updateModule({ bars: updatedBars });
                      }}
                      title="Toggle name visibility"
                    >
                      <ha-icon icon="mdi:text"></ha-icon>
                    </div>
                    <div
                      class="bar-individual-control ${bar.show_value !== false
                        ? 'active'
                        : 'inactive'}"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        const updatedBars = [...(sliderControl.bars || [])];
                        const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                        if (barIndex !== -1) {
                          updatedBars[barIndex] = {
                            ...updatedBars[barIndex],
                            show_value: !bar.show_value,
                          };
                        }
                        updateModule({ bars: updatedBars });
                      }}
                      title="Toggle value visibility"
                    >
                      <ha-icon icon="mdi:numeric"></ha-icon>
                    </div>
                  </div>

                  <div class="bar-actions">
                    <button
                      class="bar-action-button"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        const duplicatedBar = this._duplicateBar(bar);
                        const updatedBars = [...(sliderControl.bars || [])];
                        updatedBars.splice(index + 1, 0, duplicatedBar);
                        updateModule({ bars: updatedBars });
                      }}
                      title="Duplicate bar"
                    >
                      <ha-icon icon="mdi:content-copy"></ha-icon>
                    </button>
                    <button
                      class="bar-action-button delete"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        const updatedBars = this._deleteBar(bar.id, sliderControl.bars || []);
                        updateModule({ bars: updatedBars });
                      }}
                      title="Delete bar"
                    >
                      <ha-icon icon="mdi:delete"></ha-icon>
                    </button>
                    <ha-icon
                      icon="mdi:chevron-${isExpanded ? 'up' : 'down'}"
                      style="transition: transform 0.2s ease;"
                    ></ha-icon>
                  </div>
                </div>

                <div class="bar-content ${isExpanded ? 'expanded' : ''}">
                  ${this.renderFieldSection(
                    'Entity',
                    'Select the entity to control with this bar',
                    homeAssistant,
                    { entity: bar.entity },
                    [this.entityField('entity')],
                    (e: CustomEvent) => {
                      const updatedBars = [...(sliderControl.bars || [])];
                      const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                      if (barIndex !== -1) {
                        updatedBars[barIndex] = {
                          ...updatedBars[barIndex],
                          entity: e.detail.value.entity,
                        };
                        // Auto-detect type for new entity
                        const detectedType = this._detectBarType(
                          e.detail.value.entity,
                          homeAssistant
                        );
                        updatedBars[barIndex].type = detectedType as any;
                      }
                      updateModule({ bars: updatedBars });
                    }
                  )}
                  ${this.renderFieldSection(
                    'Bar Type',
                    'Type of slider bar (auto-detected)',
                    homeAssistant,
                    { type: bar.type },
                    [
                      this.selectField('type', [
                        { value: 'numeric', label: 'Numeric' },
                        { value: 'brightness', label: 'Brightness' },
                        { value: 'rgb', label: 'RGB Color' },
                        { value: 'color_temp', label: 'Color Temperature' },
                        { value: 'red', label: 'Red Channel' },
                        { value: 'green', label: 'Green Channel' },
                        { value: 'blue', label: 'Blue Channel' },
                        { value: 'attribute', label: 'Custom Attribute' },
                      ]),
                    ],
                    (e: CustomEvent) => {
                      const updatedBars = [...(sliderControl.bars || [])];
                      const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                      if (barIndex !== -1) {
                        updatedBars[barIndex] = {
                          ...updatedBars[barIndex],
                          type: e.detail.value.type,
                        };
                      }
                      updateModule({ bars: updatedBars });
                      this.requestUpdate();
                    }
                  )}
                  ${bar.type === 'attribute'
                    ? html`
                        ${this.renderFieldSection(
                          'Attribute',
                          'Specific attribute to control (e.g., percentage, position, volume_level)',
                          homeAssistant,
                          { attribute: bar.attribute || 'percentage' },
                          [this.textField('attribute')],
                          (e: CustomEvent) => {
                            const updatedBars = [...(sliderControl.bars || [])];
                            const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                            if (barIndex !== -1) {
                              updatedBars[barIndex] = {
                                ...updatedBars[barIndex],
                                attribute: e.detail.value.attribute,
                              };
                            }
                            updateModule({ bars: updatedBars });
                          }
                        )}
                      `
                    : ''}
                  ${this.renderFieldSection(
                    'Name',
                    'Override the bar label (leave empty to use entity name)',
                    homeAssistant,
                    { name: bar.name || '' },
                    [this.textField('name')],
                    (e: CustomEvent) => {
                      const updatedBars = [...(sliderControl.bars || [])];
                      const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                      if (barIndex !== -1) {
                        updatedBars[barIndex] = {
                          ...updatedBars[barIndex],
                          name: e.detail.value.name,
                        };
                      }
                      updateModule({ bars: updatedBars });
                    }
                  )}
                  ${this.renderFieldSection(
                    'Min Value',
                    'Minimum value for this bar',
                    homeAssistant,
                    { min_value: bar.min_value ?? 0 },
                    [this.numberField('min_value', 0, 1000, 1)],
                    (e: CustomEvent) => {
                      const updatedBars = [...(sliderControl.bars || [])];
                      const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                      if (barIndex !== -1) {
                        updatedBars[barIndex] = {
                          ...updatedBars[barIndex],
                          min_value: e.detail.value.min_value,
                        };
                      }
                      updateModule({ bars: updatedBars });
                    }
                  )}
                  ${this.renderFieldSection(
                    'Max Value',
                    'Maximum value for this bar',
                    homeAssistant,
                    { max_value: bar.max_value ?? 100 },
                    [this.numberField('max_value', 0, 1000, 1)],
                    (e: CustomEvent) => {
                      const updatedBars = [...(sliderControl.bars || [])];
                      const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                      if (barIndex !== -1) {
                        updatedBars[barIndex] = {
                          ...updatedBars[barIndex],
                          max_value: e.detail.value.max_value,
                        };
                      }
                      updateModule({ bars: updatedBars });
                    }
                  )}
                  ${this.renderFieldSection(
                    'Step',
                    'Step increment for value changes',
                    homeAssistant,
                    { step: bar.step ?? 1 },
                    [this.numberField('step', 0.1, 100, 0.1)],
                    (e: CustomEvent) => {
                      const updatedBars = [...(sliderControl.bars || [])];
                      const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                      if (barIndex !== -1) {
                        updatedBars[barIndex] = {
                          ...updatedBars[barIndex],
                          step: e.detail.value.step,
                        };
                      }
                      updateModule({ bars: updatedBars });
                    }
                  )}
                  ${(() => {
                    const layoutMode = sliderControl.layout_mode || 'overlay';
                    const orientation = sliderControl.orientation || 'horizontal';

                    // Determine positioning options based on layout and orientation
                    let positionOptions: { value: string; label: string }[] = [];

                    if (layoutMode === 'overlay') {
                      if (orientation === 'horizontal') {
                        positionOptions = [
                          { value: 'left', label: 'Left' },
                          { value: 'center', label: 'Center' },
                          { value: 'right', label: 'Right' },
                        ];
                      } else {
                        positionOptions = [
                          { value: 'bottom', label: 'Bottom' },
                          { value: 'center', label: 'Center' },
                          { value: 'top', label: 'Top' },
                        ];
                      }
                    } else if (layoutMode === 'split') {
                      if (orientation === 'horizontal') {
                        positionOptions = [
                          { value: 'left', label: 'Left' },
                          { value: 'right', label: 'Right' },
                        ];
                      } else {
                        positionOptions = [
                          { value: 'top', label: 'Top' },
                          { value: 'bottom', label: 'Bottom' },
                        ];
                      }
                    } else if (layoutMode === 'outside') {
                      if (orientation === 'horizontal') {
                        positionOptions = [
                          { value: 'top_left', label: 'Top Left' },
                          { value: 'top_center', label: 'Top Center' },
                          { value: 'top_right', label: 'Top Right' },
                          { value: 'bottom_left', label: 'Bottom Left' },
                          { value: 'bottom_center', label: 'Bottom Center' },
                          { value: 'bottom_right', label: 'Bottom Right' },
                        ];
                      } else {
                        positionOptions = [
                          { value: 'left_top', label: 'Left Top' },
                          { value: 'left_center', label: 'Left Center' },
                          { value: 'left_bottom', label: 'Left Bottom' },
                          { value: 'right_top', label: 'Right Top' },
                          { value: 'right_center', label: 'Right Center' },
                          { value: 'right_bottom', label: 'Right Bottom' },
                        ];
                      }
                    }

                    return html`
                      <div
                        style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--divider-color);"
                      >
                        <div
                          style="font-size: 14px; font-weight: 600; color: var(--primary-color); margin-bottom: 12px;"
                        >
                          ELEMENT POSITIONING
                        </div>

                        ${bar.show_icon !== false && sliderControl.show_icon !== false
                          ? html`
                              ${this.renderFieldSection(
                                'Icon Position',
                                'Position of the icon element',
                                homeAssistant,
                                {
                                  icon_position: bar.icon_position || 'left',
                                },
                                [this.selectField('icon_position', positionOptions)],
                                (e: CustomEvent) => {
                                  const updatedBars = [...(sliderControl.bars || [])];
                                  const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                  if (barIndex !== -1) {
                                    updatedBars[barIndex] = {
                                      ...updatedBars[barIndex],
                                      icon_position: e.detail.value.icon_position,
                                    };
                                  }
                                  updateModule({ bars: updatedBars });
                                }
                              )}
                            `
                          : ''}
                        ${bar.show_name !== false && sliderControl.show_name !== false
                          ? html`
                              ${this.renderFieldSection(
                                'Name Position',
                                'Position of the name label',
                                homeAssistant,
                                {
                                  name_position: bar.name_position || 'left',
                                },
                                [this.selectField('name_position', positionOptions)],
                                (e: CustomEvent) => {
                                  const updatedBars = [...(sliderControl.bars || [])];
                                  const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                  if (barIndex !== -1) {
                                    updatedBars[barIndex] = {
                                      ...updatedBars[barIndex],
                                      name_position: e.detail.value.name_position,
                                    };
                                  }
                                  updateModule({ bars: updatedBars });
                                }
                              )}
                            `
                          : ''}
                        ${bar.show_value !== false && sliderControl.show_value !== false
                          ? html`
                              ${this.renderFieldSection(
                                'Value Position',
                                'Position of the value display',
                                homeAssistant,
                                {
                                  value_position: bar.value_position || 'right',
                                },
                                [this.selectField('value_position', positionOptions)],
                                (e: CustomEvent) => {
                                  const updatedBars = [...(sliderControl.bars || [])];
                                  const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                  if (barIndex !== -1) {
                                    updatedBars[barIndex] = {
                                      ...updatedBars[barIndex],
                                      value_position: e.detail.value.value_position,
                                    };
                                  }
                                  updateModule({ bars: updatedBars });
                                }
                              )}
                            `
                          : ''}
                        ${layoutMode === 'split'
                          ? html`
                              ${this.renderFieldSection(
                                'Info Section Position',
                                'Position of the entire info section relative to the bar',
                                homeAssistant,
                                {
                                  info_section_position:
                                    bar.info_section_position ||
                                    (orientation === 'horizontal' ? 'left' : 'top'),
                                },
                                [
                                  this.selectField(
                                    'info_section_position',
                                    orientation === 'horizontal'
                                      ? [
                                          { value: 'left', label: 'Left' },
                                          { value: 'right', label: 'Right' },
                                        ]
                                      : [
                                          { value: 'top', label: 'Top' },
                                          { value: 'bottom', label: 'Bottom' },
                                        ]
                                  ),
                                ],
                                (e: CustomEvent) => {
                                  const updatedBars = [...(sliderControl.bars || [])];
                                  const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                  if (barIndex !== -1) {
                                    updatedBars[barIndex] = {
                                      ...updatedBars[barIndex],
                                      info_section_position: e.detail.value.info_section_position,
                                    };
                                  }
                                  updateModule({ bars: updatedBars });
                                }
                              )}
                            `
                          : ''}
                      </div>
                    `;
                  })()}
                  ${sliderControl.layout_mode === 'split'
                    ? html`
                        <div class="field-container">
                          <div class="field-title">Bar Length</div>
                          <div class="field-description">Percentage of space for bar (0-100%)</div>
                          <div style="display: flex; gap: 8px; align-items: center;">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              .value="${bar.split_bar_length ??
                              sliderControl.split_bar_length ??
                              60}"
                              @input=${(e: Event) => {
                                const target = e.target as HTMLInputElement;
                                const updatedBars = [...(sliderControl.bars || [])];
                                const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                if (barIndex !== -1) {
                                  updatedBars[barIndex] = {
                                    ...updatedBars[barIndex],
                                    split_bar_length: parseInt(target.value),
                                  };
                                }
                                updateModule({ bars: updatedBars });
                              }}
                              style="flex: 1;"
                            />
                            <input
                              type="number"
                              min="0"
                              max="100"
                              .value="${bar.split_bar_length ??
                              sliderControl.split_bar_length ??
                              60}"
                              @input=${(e: Event) => {
                                const target = e.target as HTMLInputElement;
                                const value = Math.max(0, Math.min(100, parseInt(target.value)));
                                const updatedBars = [...(sliderControl.bars || [])];
                                const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                if (barIndex !== -1) {
                                  updatedBars[barIndex] = {
                                    ...updatedBars[barIndex],
                                    split_bar_length: value,
                                  };
                                }
                                updateModule({ bars: updatedBars });
                              }}
                              style="width: 70px;"
                            />
                          </div>
                        </div>
                      `
                    : ''}

                  <!-- Bar Slider Style -->
                  <div
                    style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--divider-color);"
                  >
                    <div
                      style="font-size: 14px; font-weight: 600; color: var(--primary-color); margin-bottom: 12px;"
                    >
                      SLIDER STYLE
                    </div>

                    ${this.renderFieldSection(
                      'Slider Style',
                      'Visual appearance of the slider',
                      homeAssistant,
                      { slider_style: bar.slider_style || sliderControl.slider_style || 'flat' },
                      [
                        this.selectField('slider_style', [
                          { value: 'flat', label: 'Flat' },
                          { value: 'glossy', label: 'Glossy' },
                          { value: 'embossed', label: 'Embossed' },
                          { value: 'inset', label: 'Inset' },
                          { value: 'neon-glow', label: 'Neon Glow' },
                          { value: 'outline', label: 'Outline' },
                          { value: 'glass', label: 'Glass' },
                          { value: 'metallic', label: 'Metallic' },
                          { value: 'neumorphic', label: 'Neumorphic' },
                          { value: 'minimal', label: 'Minimal' },
                        ]),
                      ],
                      (e: CustomEvent) => {
                        const updatedBars = [...(sliderControl.bars || [])];
                        const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                        if (barIndex !== -1) {
                          updatedBars[barIndex] = {
                            ...updatedBars[barIndex],
                            slider_style: e.detail.value.slider_style,
                          };
                        }
                        updateModule({ bars: updatedBars });
                        this.requestUpdate();
                      }
                    )}

                    <div class="field-container">
                      <div class="field-title">
                        ${sliderControl.orientation === 'vertical'
                          ? 'Slider Width'
                          : 'Slider Height'}
                      </div>
                      <div class="field-description">
                        ${sliderControl.orientation === 'vertical'
                          ? 'Width of vertical bars in pixels'
                          : 'Height of horizontal bars in pixels'}
                      </div>
                      <div style="display: flex; gap: 8px; align-items: center;">
                        <input
                          type="range"
                          min="20"
                          max="200"
                          step="5"
                          .value="${bar.slider_height || sliderControl.slider_height || 40}"
                          @input=${(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            const updatedBars = [...(sliderControl.bars || [])];
                            const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                            if (barIndex !== -1) {
                              updatedBars[barIndex] = {
                                ...updatedBars[barIndex],
                                slider_height: parseInt(target.value),
                              };
                            }
                            updateModule({ bars: updatedBars });
                          }}
                          style="flex: 1;"
                        />
                        <input
                          type="number"
                          min="20"
                          max="200"
                          .value="${bar.slider_height || sliderControl.slider_height || 40}"
                          @input=${(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            const updatedBars = [...(sliderControl.bars || [])];
                            const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                            if (barIndex !== -1) {
                              updatedBars[barIndex] = {
                                ...updatedBars[barIndex],
                                slider_height: parseInt(target.value),
                              };
                            }
                            updateModule({ bars: updatedBars });
                          }}
                          style="width: 70px;"
                        />
                      </div>
                    </div>

                    ${this.renderFieldSection(
                      'Border Radius',
                      'Slider border radius style',
                      homeAssistant,
                      {
                        slider_radius: bar.slider_radius || sliderControl.slider_radius || 'round',
                      },
                      [
                        this.selectField('slider_radius', [
                          { value: 'square', label: 'Square' },
                          { value: 'round', label: 'Round' },
                          { value: 'pill', label: 'Pill' },
                        ]),
                      ],
                      (e: CustomEvent) => {
                        const updatedBars = [...(sliderControl.bars || [])];
                        const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                        if (barIndex !== -1) {
                          updatedBars[barIndex] = {
                            ...updatedBars[barIndex],
                            slider_radius: e.detail.value.slider_radius,
                          };
                        }
                        updateModule({ bars: updatedBars });
                      }
                    )}
                    ${(bar.slider_style || sliderControl.slider_style) === 'glass'
                      ? html`
                          <div class="conditional-fields-group">
                            <div class="field-container">
                              <div class="field-title">Glass Blur Amount</div>
                              <div class="field-description">
                                Backdrop filter blur amount (0-20px)
                              </div>
                              <div style="display: flex; gap: 8px; align-items: center;">
                                <input
                                  type="range"
                                  min="0"
                                  max="20"
                                  step="1"
                                  .value="${bar.glass_blur_amount ||
                                  sliderControl.glass_blur_amount ||
                                  8}"
                                  @input=${(e: Event) => {
                                    const target = e.target as HTMLInputElement;
                                    const updatedBars = [...(sliderControl.bars || [])];
                                    const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                    if (barIndex !== -1) {
                                      updatedBars[barIndex] = {
                                        ...updatedBars[barIndex],
                                        glass_blur_amount: parseInt(target.value),
                                      };
                                    }
                                    updateModule({ bars: updatedBars });
                                  }}
                                  style="flex: 1;"
                                />
                                <input
                                  type="number"
                                  min="0"
                                  max="20"
                                  .value="${bar.glass_blur_amount ||
                                  sliderControl.glass_blur_amount ||
                                  8}"
                                  @input=${(e: Event) => {
                                    const target = e.target as HTMLInputElement;
                                    const updatedBars = [...(sliderControl.bars || [])];
                                    const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                    if (barIndex !== -1) {
                                      updatedBars[barIndex] = {
                                        ...updatedBars[barIndex],
                                        glass_blur_amount: parseInt(target.value),
                                      };
                                    }
                                    updateModule({ bars: updatedBars });
                                  }}
                                  style="width: 70px;"
                                />
                              </div>
                            </div>
                          </div>
                        `
                      : ''}
                  </div>

                  ${bar.type !== 'rgb' && bar.type !== 'color_temp'
                    ? html`
                        <!-- Bar Slider Colors -->
                        <div
                          style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--divider-color);"
                        >
                          <div
                            style="font-size: 14px; font-weight: 600; color: var(--primary-color); margin-bottom: 12px;"
                          >
                            SLIDER COLORS
                          </div>

                          <div class="field-container">
                            <div class="field-title">Track Color</div>
                            <div class="field-description">
                              Background color (leave empty for auto: fill at 25% opacity)
                            </div>
                            <ultra-color-picker
                              .value=${bar.slider_track_color ||
                              sliderControl.slider_track_color ||
                              ''}
                              .defaultValue=${''}
                              .homeAssistant=${homeAssistant}
                              @value-changed=${(e: CustomEvent) => {
                                const updatedBars = [...(sliderControl.bars || [])];
                                const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                if (barIndex !== -1) {
                                  updatedBars[barIndex] = {
                                    ...updatedBars[barIndex],
                                    slider_track_color: e.detail.value,
                                  };
                                }
                                updateModule({ bars: updatedBars });
                              }}
                            ></ultra-color-picker>
                          </div>

                          ${(bar.dynamic_fill_color ?? sliderControl.dynamic_fill_color ?? false)
                            ? html``
                            : html`
                                <div class="field-container">
                                  <div class="field-title">Fill Color</div>
                                  <div class="field-description">
                                    Color of the filled portion of the slider
                                  </div>
                                  <ultra-color-picker
                                    .value=${bar.slider_fill_color ||
                                    sliderControl.slider_fill_color ||
                                    ''}
                                    .defaultValue=${'var(--primary-color)'}
                                    .homeAssistant=${homeAssistant}
                                    @value-changed=${(e: CustomEvent) => {
                                      const updatedBars = [...(sliderControl.bars || [])];
                                      const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                      if (barIndex !== -1) {
                                        updatedBars[barIndex] = {
                                          ...updatedBars[barIndex],
                                          slider_fill_color: e.detail.value,
                                        };
                                      }
                                      updateModule({ bars: updatedBars });
                                    }}
                                  ></ultra-color-picker>
                                </div>
                              `}

                          <div
                            style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px;"
                          >
                            <div>
                              <div class="field-title">Dynamic Fill Color</div>
                              <div class="field-description">
                                Use entity color (RGB lights, etc.)
                              </div>
                            </div>
                            <ha-switch
                              .checked=${bar.dynamic_fill_color ??
                              sliderControl.dynamic_fill_color ??
                              false}
                              @change=${(e: Event) => {
                                const target = e.target as any;
                                const updatedBars = [...(sliderControl.bars || [])];
                                const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                if (barIndex !== -1) {
                                  updatedBars[barIndex] = {
                                    ...updatedBars[barIndex],
                                    dynamic_fill_color: target.checked,
                                  };
                                }
                                updateModule({ bars: updatedBars });
                              }}
                            ></ha-switch>
                          </div>
                        </div>
                      `
                    : ''}

                  <!-- Bar Display Elements -->
                  <div
                    style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--divider-color);"
                  >
                    <div
                      style="font-size: 14px; font-weight: 600; color: var(--primary-color); margin-bottom: 12px;"
                    >
                      DISPLAY ELEMENTS
                    </div>

                    ${layoutMode === 'overlay'
                      ? html`
                          <div
                            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;"
                          >
                            <div>
                              <div class="field-title">Auto Contrast</div>
                              <div class="field-description">
                                Automatically adjust text/icon color based on fill
                              </div>
                            </div>
                            <ha-switch
                              .checked=${bar.auto_contrast ?? sliderControl.auto_contrast ?? true}
                              @change=${(e: Event) => {
                                const target = e.target as any;
                                const updatedBars = [...(sliderControl.bars || [])];
                                const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                if (barIndex !== -1) {
                                  updatedBars[barIndex] = {
                                    ...updatedBars[barIndex],
                                    auto_contrast: target.checked,
                                  };
                                }
                                updateModule({ bars: updatedBars });
                              }}
                            ></ha-switch>
                          </div>
                        `
                      : ''}

                    <!-- Icon Settings -->
                    <div style="margin-bottom: 24px;">
                      <div
                        style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;"
                      >
                        <div>
                          <div class="field-title">Show Icon</div>
                          <div class="field-description">Display an icon on the slider</div>
                        </div>
                        <ha-switch
                          .checked=${bar.show_icon ?? sliderControl.show_icon ?? true}
                          @change=${(e: Event) => {
                            const target = e.target as any;
                            const updatedBars = [...(sliderControl.bars || [])];
                            const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                            if (barIndex !== -1) {
                              updatedBars[barIndex] = {
                                ...updatedBars[barIndex],
                                show_icon: target.checked,
                              };
                            }
                            updateModule({ bars: updatedBars });
                          }}
                        ></ha-switch>
                      </div>

                      ${(bar.show_icon ?? sliderControl.show_icon) !== false
                        ? html`
                            <div class="conditional-fields-group">
                              ${this.renderFieldSection(
                                'Icon',
                                'Icon to display (leave empty for entity icon)',
                                homeAssistant,
                                { icon: bar.icon || sliderControl.icon || '' },
                                [this.iconField('icon')],
                                (e: CustomEvent) => {
                                  const updatedBars = [...(sliderControl.bars || [])];
                                  const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                  if (barIndex !== -1) {
                                    updatedBars[barIndex] = {
                                      ...updatedBars[barIndex],
                                      icon: e.detail.value.icon,
                                    };
                                  }
                                  updateModule({ bars: updatedBars });
                                }
                              )}

                              <div
                                style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;"
                              >
                                <div>
                                  <div class="field-title">Dynamic Icon</div>
                                  <div class="field-description">Use entity's default icon</div>
                                </div>
                                <ha-switch
                                  .checked=${bar.dynamic_icon ?? sliderControl.dynamic_icon ?? true}
                                  @change=${(e: Event) => {
                                    const target = e.target as any;
                                    const updatedBars = [...(sliderControl.bars || [])];
                                    const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                    if (barIndex !== -1) {
                                      updatedBars[barIndex] = {
                                        ...updatedBars[barIndex],
                                        dynamic_icon: target.checked,
                                      };
                                    }
                                    updateModule({ bars: updatedBars });
                                  }}
                                ></ha-switch>
                              </div>

                              <div
                                style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;"
                              >
                                <div>
                                  <div class="field-title">Icon as Toggle</div>
                                  <div class="field-description">
                                    Click icon to toggle entity on/off (icon changes with state)
                                  </div>
                                </div>
                                <ha-switch
                                  .checked=${bar.icon_as_toggle ??
                                  sliderControl.icon_as_toggle ??
                                  true}
                                  @change=${(e: Event) => {
                                    const target = e.target as any;
                                    const updatedBars = [...(sliderControl.bars || [])];
                                    const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                    if (barIndex !== -1) {
                                      updatedBars[barIndex] = {
                                        ...updatedBars[barIndex],
                                        icon_as_toggle: target.checked,
                                      };
                                    }
                                    updateModule({ bars: updatedBars });
                                  }}
                                ></ha-switch>
                              </div>

                              <div class="field-container">
                                <div class="field-title">Icon Size</div>
                                <div class="field-description">Icon size in pixels</div>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                  <input
                                    type="range"
                                    min="16"
                                    max="48"
                                    step="2"
                                    .value="${bar.icon_size || sliderControl.icon_size || 24}"
                                    @input=${(e: Event) => {
                                      const target = e.target as HTMLInputElement;
                                      const updatedBars = [...(sliderControl.bars || [])];
                                      const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                      if (barIndex !== -1) {
                                        updatedBars[barIndex] = {
                                          ...updatedBars[barIndex],
                                          icon_size: parseInt(target.value),
                                        };
                                      }
                                      updateModule({ bars: updatedBars });
                                    }}
                                    style="flex: 1;"
                                  />
                                  <input
                                    type="number"
                                    min="16"
                                    max="48"
                                    .value="${bar.icon_size || sliderControl.icon_size || 24}"
                                    @input=${(e: Event) => {
                                      const target = e.target as HTMLInputElement;
                                      const updatedBars = [...(sliderControl.bars || [])];
                                      const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                      if (barIndex !== -1) {
                                        updatedBars[barIndex] = {
                                          ...updatedBars[barIndex],
                                          icon_size: parseInt(target.value),
                                        };
                                      }
                                      updateModule({ bars: updatedBars });
                                    }}
                                    style="width: 70px;"
                                  />
                                </div>
                              </div>

                              <div class="field-container">
                                <div class="field-title">Icon Color</div>
                                <div class="field-description">Color for the icon</div>
                                <ultra-color-picker
                                  .value=${bar.icon_color || sliderControl.icon_color || ''}
                                  .defaultValue=${'var(--primary-text-color)'}
                                  .homeAssistant=${homeAssistant}
                                  @value-changed=${(e: CustomEvent) => {
                                    const updatedBars = [...(sliderControl.bars || [])];
                                    const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                    if (barIndex !== -1) {
                                      updatedBars[barIndex] = {
                                        ...updatedBars[barIndex],
                                        icon_color: e.detail.value,
                                      };
                                    }
                                    updateModule({ bars: updatedBars });
                                  }}
                                ></ultra-color-picker>
                              </div>
                            </div>
                          `
                        : ''}
                    </div>

                    <!-- Name Settings -->
                    <div style="margin-bottom: 24px;">
                      <div
                        style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;"
                      >
                        <div>
                          <div class="field-title">Show Name</div>
                          <div class="field-description">Display entity name</div>
                        </div>
                        <ha-switch
                          .checked=${bar.show_name ?? sliderControl.show_name ?? true}
                          @change=${(e: Event) => {
                            const target = e.target as any;
                            const updatedBars = [...(sliderControl.bars || [])];
                            const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                            if (barIndex !== -1) {
                              updatedBars[barIndex] = {
                                ...updatedBars[barIndex],
                                show_name: target.checked,
                              };
                            }
                            updateModule({ bars: updatedBars });
                          }}
                        ></ha-switch>
                      </div>

                      ${(bar.show_name ?? sliderControl.show_name) !== false
                        ? html`
                            <div class="conditional-fields-group">
                              <div class="field-container">
                                <div class="field-title">Name Size</div>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                  <input
                                    type="range"
                                    min="10"
                                    max="24"
                                    step="1"
                                    .value="${bar.name_size || sliderControl.name_size || 14}"
                                    @input=${(e: Event) => {
                                      const target = e.target as HTMLInputElement;
                                      const updatedBars = [...(sliderControl.bars || [])];
                                      const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                      if (barIndex !== -1) {
                                        updatedBars[barIndex] = {
                                          ...updatedBars[barIndex],
                                          name_size: parseInt(target.value),
                                        };
                                      }
                                      updateModule({ bars: updatedBars });
                                    }}
                                    style="flex: 1;"
                                  />
                                  <input
                                    type="number"
                                    min="10"
                                    max="24"
                                    .value="${bar.name_size || sliderControl.name_size || 14}"
                                    @input=${(e: Event) => {
                                      const target = e.target as HTMLInputElement;
                                      const updatedBars = [...(sliderControl.bars || [])];
                                      const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                      if (barIndex !== -1) {
                                        updatedBars[barIndex] = {
                                          ...updatedBars[barIndex],
                                          name_size: parseInt(target.value),
                                        };
                                      }
                                      updateModule({ bars: updatedBars });
                                    }}
                                    style="width: 70px;"
                                  />
                                </div>
                              </div>

                              <div class="field-container">
                                <div class="field-title">Name Color</div>
                                <ultra-color-picker
                                  .value=${bar.name_color || sliderControl.name_color || ''}
                                  .defaultValue=${'var(--primary-text-color)'}
                                  .homeAssistant=${homeAssistant}
                                  @value-changed=${(e: CustomEvent) => {
                                    const updatedBars = [...(sliderControl.bars || [])];
                                    const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                    if (barIndex !== -1) {
                                      updatedBars[barIndex] = {
                                        ...updatedBars[barIndex],
                                        name_color: e.detail.value,
                                      };
                                    }
                                    updateModule({ bars: updatedBars });
                                  }}
                                ></ultra-color-picker>
                              </div>

                              <div
                                style="display: flex; align-items: center; justify-content: space-between;"
                              >
                                <div class="field-title">Bold</div>
                                <ha-switch
                                  .checked=${bar.name_bold ?? sliderControl.name_bold ?? true}
                                  @change=${(e: Event) => {
                                    const target = e.target as any;
                                    const updatedBars = [...(sliderControl.bars || [])];
                                    const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                    if (barIndex !== -1) {
                                      updatedBars[barIndex] = {
                                        ...updatedBars[barIndex],
                                        name_bold: target.checked,
                                      };
                                    }
                                    updateModule({ bars: updatedBars });
                                  }}
                                ></ha-switch>
                              </div>
                            </div>
                          `
                        : ''}
                    </div>

                    <!-- Value Settings -->
                    <div style="margin-bottom: 24px;">
                      <div
                        style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;"
                      >
                        <div>
                          <div class="field-title">Show Value</div>
                          <div class="field-description">Display current numeric value</div>
                        </div>
                        <ha-switch
                          .checked=${bar.show_value ?? sliderControl.show_value ?? true}
                          @change=${(e: Event) => {
                            const target = e.target as any;
                            const updatedBars = [...(sliderControl.bars || [])];
                            const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                            if (barIndex !== -1) {
                              updatedBars[barIndex] = {
                                ...updatedBars[barIndex],
                                show_value: target.checked,
                              };
                            }
                            updateModule({ bars: updatedBars });
                          }}
                        ></ha-switch>
                      </div>

                      <div
                        style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;"
                      >
                        <div>
                          <div class="field-title">Show Bar Label</div>
                          <div class="field-description">
                            Display bar label (Brightness, RGB Color, etc.)
                          </div>
                        </div>
                        <ha-switch
                          .checked=${bar.show_bar_label ?? sliderControl.show_bar_label ?? true}
                          @change=${(e: Event) => {
                            const target = e.target as any;
                            const updatedBars = [...(sliderControl.bars || [])];
                            const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                            if (barIndex !== -1) {
                              updatedBars[barIndex] = {
                                ...updatedBars[barIndex],
                                show_bar_label: target.checked,
                              };
                            }
                            updateModule({ bars: updatedBars });
                          }}
                        ></ha-switch>
                      </div>

                      ${(bar.show_value ?? sliderControl.show_value) !== false
                        ? html`
                            <div class="conditional-fields-group">
                              <div class="field-container">
                                <div class="field-title">Value Size</div>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                  <input
                                    type="range"
                                    min="10"
                                    max="24"
                                    step="1"
                                    .value="${bar.value_size || sliderControl.value_size || 14}"
                                    @input=${(e: Event) => {
                                      const target = e.target as HTMLInputElement;
                                      const updatedBars = [...(sliderControl.bars || [])];
                                      const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                      if (barIndex !== -1) {
                                        updatedBars[barIndex] = {
                                          ...updatedBars[barIndex],
                                          value_size: parseInt(target.value),
                                        };
                                      }
                                      updateModule({ bars: updatedBars });
                                    }}
                                    style="flex: 1;"
                                  />
                                  <input
                                    type="number"
                                    min="10"
                                    max="24"
                                    .value="${bar.value_size || sliderControl.value_size || 14}"
                                    @input=${(e: Event) => {
                                      const target = e.target as HTMLInputElement;
                                      const updatedBars = [...(sliderControl.bars || [])];
                                      const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                      if (barIndex !== -1) {
                                        updatedBars[barIndex] = {
                                          ...updatedBars[barIndex],
                                          value_size: parseInt(target.value),
                                        };
                                      }
                                      updateModule({ bars: updatedBars });
                                    }}
                                    style="width: 70px;"
                                  />
                                </div>
                              </div>

                              <div class="field-container">
                                <div class="field-title">Value Color</div>
                                <ultra-color-picker
                                  .value=${bar.value_color || sliderControl.value_color || ''}
                                  .defaultValue=${'var(--primary-text-color)'}
                                  .homeAssistant=${homeAssistant}
                                  @value-changed=${(e: CustomEvent) => {
                                    const updatedBars = [...(sliderControl.bars || [])];
                                    const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                    if (barIndex !== -1) {
                                      updatedBars[barIndex] = {
                                        ...updatedBars[barIndex],
                                        value_color: e.detail.value,
                                      };
                                    }
                                    updateModule({ bars: updatedBars });
                                  }}
                                ></ultra-color-picker>
                              </div>

                              ${this.renderFieldSection(
                                'Value Suffix',
                                'Text to append to value (e.g., %, °C, °F)',
                                homeAssistant,
                                {
                                  value_suffix:
                                    bar.value_suffix || sliderControl.value_suffix || '',
                                },
                                [this.textField('value_suffix')],
                                (e: CustomEvent) => {
                                  const updatedBars = [...(sliderControl.bars || [])];
                                  const barIndex = updatedBars.findIndex(b => b.id === bar.id);
                                  if (barIndex !== -1) {
                                    updatedBars[barIndex] = {
                                      ...updatedBars[barIndex],
                                      value_suffix: e.detail.value.value_suffix,
                                    };
                                  }
                                  updateModule({ bars: updatedBars });
                                }
                              )}
                            </div>
                          `
                        : ''}
                    </div>
                  </div>
                </div>
              </div>
            `;
          })}
        </div>

        <!-- LAYOUT SETTINGS -->
        <div class="settings-section layout-settings">
          <div class="section-title">LAYOUT SETTINGS</div>

          ${this.renderFieldSection(
            'Orientation',
            'Slider direction: horizontal or vertical',
            homeAssistant,
            { orientation: sliderControl.orientation || 'horizontal' },
            [
              this.selectField('orientation', [
                { value: 'horizontal', label: 'Horizontal' },
                { value: 'vertical', label: 'Vertical' },
              ]),
            ],
            (e: CustomEvent) => updateModule({ orientation: e.detail.value.orientation })
          )}
          ${this.renderFieldSection(
            'Layout Mode',
            'How to position information relative to the slider',
            homeAssistant,
            { layout_mode: sliderControl.layout_mode || 'outside' },
            [
              this.selectField('layout_mode', [
                { value: 'outside', label: 'Outside (info beside slider)' },
                { value: 'overlay', label: 'Overlay (info on slider)' },
                { value: 'split', label: 'Split (adjustable ratio)' },
              ]),
            ],
            (e: CustomEvent) => updateModule({ layout_mode: e.detail.value.layout_mode })
          )}
          ${sliderControl.layout_mode === 'split'
            ? html`
                <div class="conditional-fields-group">
                  <div class="field-description">
                    Configure bar position and ratio inside each bar card below.
                  </div>
                </div>
              `
            : ''}
        </div>

        <!-- Bar Spacing (kept global) -->
        <div class="settings-section">
          <div class="field-container">
            <div class="field-title">Bar Spacing</div>
            <div class="field-description">
              Spacing between multiple bars (negative values allowed for overlap)
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input
                type="range"
                min="-20"
                max="40"
                step="2"
                .value="${sliderControl.bar_spacing || 8}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  updateModule({ bar_spacing: parseInt(target.value) });
                }}
                style="flex: 1;"
              />
              <input
                type="number"
                min="-20"
                max="40"
                .value="${sliderControl.bar_spacing || 8}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  updateModule({ bar_spacing: parseInt(target.value) });
                }}
                style="width: 70px;"
              />
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderActionsTab(
    module: CardModule,
    homeAssistant: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const sliderControl = module as SliderControlModule;

    return html`
      <div class="actions-tab">
        ${this.injectUcFormStyles()}
        <style>
          .actions-tab {
            padding: 8px;
          }
        </style>

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          ${UltraLinkComponent.render(
            homeAssistant,
            {
              tap_action: sliderControl.tap_action || { action: 'nothing' },
              hold_action: sliderControl.hold_action || { action: 'nothing' },
              double_tap_action: sliderControl.double_tap_action || { action: 'nothing' },
            },
            (updates: any) => {
              const moduleUpdates: Partial<SliderControlModule> = {};
              if (updates.tap_action) moduleUpdates.tap_action = updates.tap_action;
              if (updates.hold_action) moduleUpdates.hold_action = updates.hold_action;
              if (updates.double_tap_action)
                moduleUpdates.double_tap_action = updates.double_tap_action;
              updateModule(moduleUpdates);
            },
            'Link Configuration'
          )}
        </div>
      </div>
    `;
  }

  renderLogicTab(
    module: CardModule,
    homeAssistant: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    // No conditional logic for slider control module
    return html``;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    // Render loop fix - removed excessive logging
    const sliderControl = module as SliderControlModule;
    const homeAssistant = hass;

    // GRACEFUL RENDERING: Check for incomplete configuration
    if (!sliderControl.bars || sliderControl.bars.length === 0) {
      return this.renderGradientErrorState(
        'Add Bars',
        'Configure slider bars in the General tab',
        'mdi:tune-vertical'
      );
    }

    // Check if any bars have entities configured
    const validBars = sliderControl.bars.filter(b => b.entity && b.entity.trim() !== '');
    const incompleteBars = sliderControl.bars.filter(b => !b.entity || b.entity.trim() === '');

    if (validBars.length === 0 && incompleteBars.length > 0) {
      const barList = incompleteBars.map((b, i) => b.name || `Bar ${i + 1}`).join(', ');
      return this.renderGradientErrorState('Bars Need Entities', barList, 'mdi:tune-vertical');
    }

    // Show warning banner if some bars are incomplete
    const warningBanner =
      incompleteBars.length > 0
        ? this.renderGradientWarningBanner(
            `${incompleteBars.length > 1 ? 'bars' : 'bar'} need${incompleteBars.length === 1 ? 's' : ''} entities`,
            incompleteBars.length
          )
        : '';

    // Render each bar
    const bars = validBars;
    const orientation = sliderControl.orientation || 'horizontal';
    const barSpacing = sliderControl.bar_spacing || 8;
    const layoutMode = sliderControl.layout_mode || 'outside';
    const isVertical = orientation === 'vertical';
    const verticalSliderHeight = 200; // Base visual height for vertical sliders when not filling parent
    const orientationClass = isVertical ? 'uc-orientation-vertical' : 'uc-orientation-horizontal';
    const layoutClass = `uc-layout-${layoutMode}`;
    const baseLayoutClass = `uc-slider-layout ${layoutClass} ${orientationClass}`;
    const isOutsideLayout = layoutMode === 'outside';

    // Helper to render a single bar
    const renderSingleBar = (bar: SliderBar, index: number) => {
      const entityState = homeAssistant?.states?.[bar.entity];
      if (!entityState) {
        return html`
          <div
            style="padding: 12px; text-align: center; color: var(--error-color); background: var(--error-color); color: white; border-radius: 8px;"
          >
            <ha-icon icon="mdi:alert-circle" style="margin-right: 8px;"></ha-icon>
            Entity not found: ${bar.entity}
          </div>
        `;
      }

      const domain = bar.entity.split('.')[0];
      const entityName = bar.name || entityState.attributes.friendly_name || bar.entity;
      const isOn = entityState.state === 'on' || entityState.state === 'open';

      const showIconSection = bar.show_icon !== false && sliderControl.show_icon !== false;
      const showNameSection = bar.show_name !== false && sliderControl.show_name !== false;
      const showValueSection = bar.show_value !== false && sliderControl.show_value !== false;
      const hasInfoSection = showIconSection || showNameSection || showValueSection;

      // Calculate value and percentage based on bar type
      let currentValue = 0;
      let displayValue = '0';
      let percentage = 0;

      if (bar.type === 'brightness') {
        const brightness = entityState.attributes.brightness || 0;
        currentValue = Math.round((brightness / 255) * 100);
        percentage = currentValue;
        displayValue = `${currentValue}`;
      } else if (bar.type === 'rgb') {
        // Convert RGB to hue percentage
        const rgbColor = entityState.attributes.rgb_color || [255, 255, 255];
        const hue = this.rgbToHue(rgbColor[0], rgbColor[1], rgbColor[2]);
        percentage = Math.max(0, Math.min(100, hue));
        displayValue = `rgb(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]})`;
      } else if (bar.type === 'color_temp') {
        const colorTemp = entityState.attributes.color_temp || 154;
        const minTemp = 154;
        const maxTemp = 500;
        percentage = Math.max(
          0,
          Math.min(100, ((maxTemp - colorTemp) / (maxTemp - minTemp)) * 100)
        );
        displayValue = `${Math.round(1000000 / colorTemp)}K`;
      } else if (bar.type === 'red') {
        const rgbColor = entityState.attributes.rgb_color || [255, 255, 255];
        percentage = Math.max(0, Math.min(100, (rgbColor[0] / 255) * 100));
        displayValue = `${rgbColor[0]}`;
      } else if (bar.type === 'green') {
        const rgbColor = entityState.attributes.rgb_color || [255, 255, 255];
        percentage = Math.max(0, Math.min(100, (rgbColor[1] / 255) * 100));
        displayValue = `${rgbColor[1]}`;
      } else if (bar.type === 'blue') {
        const rgbColor = entityState.attributes.rgb_color || [255, 255, 255];
        percentage = Math.max(0, Math.min(100, (rgbColor[2] / 255) * 100));
        displayValue = `${rgbColor[2]}`;
      } else {
        // Numeric or attribute
        let value = 0;
        if (bar.type === 'attribute' && bar.attribute) {
          value = parseFloat(entityState.attributes[bar.attribute]) || 0;
        } else {
          value = parseFloat(entityState.state) || 0;
        }

        const min = bar.min_value ?? 0;
        const max = bar.max_value ?? 100;
        currentValue = value;
        percentage = ((value - min) / (max - min)) * 100;
        displayValue = value.toFixed(1);
      }

      // Clamp percentage
      percentage = Math.max(0, Math.min(100, percentage));

      const sliderKey = `${bar.entity}-${bar.type}`;
      const useLocalValue =
        this.interactingBars.has(sliderKey) || this.localSliderValues.has(sliderKey);

      // Check if entity state changed significantly - if so, clear cache
      if (useLocalValue && !this.interactingBars.has(sliderKey)) {
        // If entity is off and we have a cached value, clear it
        const isEntityOff = entityState?.state === 'off' || entityState?.state === 'closed';
        if (isEntityOff) {
          // Entity is off, should show 0%
          this.localSliderValues.delete(sliderKey);
        } else {
          // Check if cached value differs significantly from actual state
          const cachedValue = this.localSliderValues.get(sliderKey) ?? percentage;
          const diff = Math.abs(cachedValue - percentage);
          // If difference is large (more than 5%), entity state likely changed externally
          if (diff > 5) {
            this.localSliderValues.delete(sliderKey);
          }
        }
      }

      const livePercentage = this.interactingBars.has(sliderKey) || this.localSliderValues.has(sliderKey)
        ? (this.localSliderValues.get(sliderKey) ?? percentage)
        : percentage;

      // Determine fill/gradient for this bar based on overrides and defaults
      const defaultFill = this._getBarGradient(bar, homeAssistant, orientation);
      const barFillOverride =
        typeof bar.slider_fill_color === 'string' ? bar.slider_fill_color.trim() : '';
      const globalFillOverride =
        typeof sliderControl.slider_fill_color === 'string'
          ? sliderControl.slider_fill_color.trim()
          : '';
      const isGradientBar = bar.type === 'rgb' || bar.type === 'color_temp';
      const useDynamicFill = isGradientBar
        ? false
        : (bar.dynamic_fill_color ?? sliderControl.dynamic_fill_color ?? false);

      let gradient = defaultFill;

      if (useDynamicFill) {
        gradient = this.resolveDynamicFillColor(bar, entityState, defaultFill);
      } else if (!isGradientBar && barFillOverride) {
        gradient = barFillOverride;
      } else if (!isGradientBar && globalFillOverride) {
        gradient = globalFillOverride;
      }
      const gradientIsGradientString = gradient.includes('gradient');
      const applyGradientAsTrack = isGradientBar;
      const isCustomGradientFill = !applyGradientAsTrack && gradientIsGradientString;
      const isGradient = gradientIsGradientString;
      const isVertical = orientation === 'vertical';
      const ratioApplies = layoutMode === 'split' && (showIconSection || showValueSection);
      const isVerticalOutsideLayout = isVertical && layoutMode === 'outside';
      const outsideIconSize = bar.icon_size || sliderControl.icon_size || 16;
      const outsideIconBaseSpacing = showIconSection ? outsideIconSize + 12 : 0;
      // Final bar length excluding icon space in vertical-outside layout
      const targetVerticalHeight = isVerticalOutsideLayout
        ? Math.max(40, verticalSliderHeight - outsideIconBaseSpacing)
        : verticalSliderHeight;
      const gradientDir = isVertical ? '0deg' : '90deg';
      const overlayFillSnippet = isCustomGradientFill
        ? `background: ${gradient}; opacity: 1;`
        : `background: linear-gradient(${gradientDir}, ${gradient} 0%, ${gradient} ${livePercentage}%, transparent ${livePercentage}%, transparent 100%); opacity: 0.8;`;
      const resolvedOverlayNamePosition =
        bar.overlay_name_position || sliderControl.overlay_name_position || 'top';
      const resolvedOverlayValuePosition =
        bar.overlay_value_position || sliderControl.overlay_value_position || 'middle';
      const resolvedOverlayIconPosition =
        bar.overlay_icon_position || sliderControl.overlay_icon_position || 'bottom';

      // Default track color: use fill color at 25% opacity
      let trackColor = sliderControl.slider_track_color;
      if (!trackColor) {
        if (isGradient) {
          trackColor = 'rgba(var(--rgb-primary-color), 0.25)';
        } else if (gradient.startsWith('rgb(')) {
          trackColor = gradient.replace('rgb(', 'rgba(').replace(')', ', 0.25)');
        } else {
          trackColor = 'rgba(var(--rgb-primary-color), 0.25)';
        }
      }

      // Get bar-specific settings with fallback to global
      const barSliderHeight = bar.slider_height || sliderControl.slider_height || 55;
      const barSliderStyle = bar.slider_style || sliderControl.slider_style || 'flat';
      const barSliderRadius = bar.slider_radius || sliderControl.slider_radius || 'round';
      const barGlassBlurAmount = bar.glass_blur_amount || sliderControl.glass_blur_amount || 8;

      // Build container and slider styles based on slider_style
      let containerStyles = '';
      let overlayContent = '';

      const baseBackground = applyGradientAsTrack
        ? gradient
        : isCustomGradientFill
          ? trackColor
          : `linear-gradient(${gradientDir}, ${gradient} 0%, ${gradient} ${livePercentage}%, ${trackColor} ${livePercentage}%, ${trackColor} 100%)`;

      let borderRadius = '10px';
      if (barSliderRadius === 'square') borderRadius = '0';
      else if (barSliderRadius === 'pill') borderRadius = `${barSliderHeight / 2}px`;

      switch (barSliderStyle) {
        case 'flat':
          containerStyles = `
            background: ${baseBackground};
            border-radius: ${borderRadius};
          `;
          break;
        case 'glossy':
          containerStyles = `
            background: ${baseBackground};
            border-radius: ${borderRadius};
            box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
          `;
          overlayContent = `
            background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.1) 100%);
          `;
          break;
        case 'glass': {
          containerStyles = `
            background: transparent;
            border-radius: ${borderRadius};
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          `;
          overlayContent = `
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(${barGlassBlurAmount}px);
          `;
          break;
        }
        case 'minimal':
          containerStyles = `
            background: ${trackColor};
            border-radius: 10px;
          `;
          overlayContent = overlayFillSnippet;
          break;
        default:
          containerStyles = `
            background: ${baseBackground};
            border-radius: ${borderRadius};
          `;
      }

      if (isCustomGradientFill && !overlayContent) {
        overlayContent = overlayFillSnippet;
      }

      // Handle slider interaction
      let debounceTimer: any;

      const handleSliderStart = (e: Event) => {
        this.interactingBars.add(sliderKey);
        // Clear any existing local value and set current entity percentage
        this.localSliderValues.delete(sliderKey);
        this.localSliderValues.set(sliderKey, livePercentage);
        this.localSliderValues = new Map(this.localSliderValues);
      };

      const handleSliderEnd = (e: Event) => {
        this.interactingBars.delete(sliderKey);

        // Keep local value indefinitely until next interaction
        // This prevents jumping when entity state doesn't match clicked position
        // The value will be cleared when user starts next interaction
      };

      const handleSliderInput = (e: Event) => {
        const input = e.target as HTMLInputElement;
        const newPercentage = parseFloat(input.value);

        // Store the local value during interaction
        this.localSliderValues.set(sliderKey, newPercentage);
        this.localSliderValues = new Map(this.localSliderValues);

        // Clear previous timer
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        // Throttle service calls with longer delay to prevent glitching
        debounceTimer = setTimeout(() => {
          try {
            if (domain === 'light') {
              const serviceData: any = { entity_id: bar.entity };

              if (bar.type === 'brightness') {
                const brightness = Math.round((newPercentage / 100) * 255);
                serviceData.brightness = brightness;
              } else if (bar.type === 'rgb') {
                const hue = newPercentage / 100;
                // Always use full brightness (value=1) for vibrant colors
                // The brightness slider will control actual light intensity
                const rgb = this.hsvToRgb(hue, 1, 1);
                serviceData.rgb_color = rgb;
                // Don't send brightness to prevent other sliders from moving
              } else if (bar.type === 'red') {
                const red = Math.round(newPercentage * 2.55);
                const rgbColor = entityState.attributes.rgb_color || [255, 255, 255];
                serviceData.rgb_color = [red, rgbColor[1], rgbColor[2]];
              } else if (bar.type === 'green') {
                const green = Math.round(newPercentage * 2.55);
                const rgbColor = entityState.attributes.rgb_color || [255, 255, 255];
                serviceData.rgb_color = [rgbColor[0], green, rgbColor[2]];
              } else if (bar.type === 'blue') {
                const blue = Math.round(newPercentage * 2.55);
                const rgbColor = entityState.attributes.rgb_color || [255, 255, 255];
                serviceData.rgb_color = [rgbColor[0], rgbColor[1], blue];
              } else if (bar.type === 'color_temp') {
                const minTemp = 154;
                const maxTemp = 500;
                const colorTemp = Math.round(maxTemp - (newPercentage / 100) * (maxTemp - minTemp));
                serviceData.color_temp = colorTemp;
                // Don't send brightness to prevent other sliders from moving
              }

              // Don't await - let it run in background
              homeAssistant.callService('light', 'turn_on', serviceData);
            } else if (domain === 'cover') {
              homeAssistant.callService('cover', 'set_cover_position', {
                entity_id: bar.entity,
                position: Math.round(newPercentage),
              });
            } else if (domain === 'fan') {
              // Handle fan entities - check if using attribute type
              if (bar.type === 'attribute' && bar.attribute === 'percentage') {
                // Convert percentage back to actual value range
                const min = bar.min_value ?? 0;
                const max = bar.max_value ?? 100;
                const step = bar.step ?? 1;
                let actualValue = (newPercentage / 100) * (max - min) + min;
                // Snap to step
                actualValue = Math.round(actualValue / step) * step;
                // Clamp to range
                actualValue = Math.max(min, Math.min(max, actualValue));
                homeAssistant.callService('fan', 'set_percentage', {
                  entity_id: bar.entity,
                  percentage: Math.round(actualValue),
                });
              } else if (bar.type === 'attribute' && bar.attribute) {
                // Handle other generic attributes
                const min = bar.min_value ?? 0;
                const max = bar.max_value ?? 100;
                const step = bar.step ?? 1;
                let actualValue = (newPercentage / 100) * (max - min) + min;
                // Snap to step
                actualValue = Math.round(actualValue / step) * step;
                // Clamp to range
                actualValue = Math.max(min, Math.min(max, actualValue));

                // Try to call a service based on the attribute name
                if (bar.attribute === 'volume_level') {
                  homeAssistant.callService('media_player', 'volume_set', {
                    entity_id: bar.entity,
                    volume_level: actualValue / 100, // volume_level is 0-1
                  });
                } else {
                  // For other attributes, try to use the set_value service if available
                  console.warn(`No specific service handler for attribute: ${bar.attribute}`);
                }
              } else if (bar.type === 'numeric' || !bar.type) {
                // Default numeric control for fans uses percentage
                homeAssistant.callService('fan', 'set_percentage', {
                  entity_id: bar.entity,
                  percentage: Math.round(newPercentage),
                });
              }
            } else if (domain === 'input_number') {
              const min = bar.min_value ?? 0;
              const max = bar.max_value ?? 100;
              const newValue = (newPercentage / 100) * (max - min) + min;
              homeAssistant.callService('input_number', 'set_value', {
                entity_id: bar.entity,
                value: newValue,
              });
            }

            if (sliderControl.haptic_feedback && 'vibrate' in navigator) {
              navigator.vibrate(10);
            }
          } catch (error) {
            console.error('Failed to update entity:', error);
          }
        }, 200); // 200ms debounce delay to prevent glitching
      };

      // Determine container dimensions
      const isGradientSlider = bar.type === 'rgb' || bar.type === 'color_temp';

      // For gradient sliders, we need asymmetric extension for perfect alignment
      // Top needs 15px to reach edge, bottom needs 13px to not overshoot
      const thumbExtensionTop = isVertical ? (isGradientSlider ? 15 : 0) : 0;
      const thumbExtensionBottom = isVertical ? (isGradientSlider ? 13 : 0) : 0;
      const inputExtension = thumbExtensionTop + thumbExtensionBottom;

      const shouldFillParent = isVertical && layoutMode === 'split';

      const barWrapperClass = `uc-slider-bar uc-layout-${layoutMode} uc-orientation-${orientation} uc-bar-type-${bar.type}`;

      const containerWidth = isVertical ? `${barSliderHeight}px` : '100%';
      const containerHeight = isVertical
        ? shouldFillParent
          ? '100%'
          : `${targetVerticalHeight}px`
        : `${barSliderStyle === 'minimal' ? 8 : barSliderHeight}px`;

      return html`
        <div class="${barWrapperClass}">
          ${sliderControl.show_bar_label !== false && layoutMode !== 'outside'
            ? html`
                <div
                  class="uc-slider-label"
                  style="font-size: 11px; color: var(--secondary-text-color); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;"
                >
                  ${entityName}
                </div>
              `
            : ''}

          <div
            class="slider-track-container uc-slider-track"
            style="
              position: relative;
              height: ${containerHeight};
              width: ${containerWidth};
              ${containerStyles}
              transition: all ${bar.transition_duration ||
            sliderControl.transition_duration ||
            200}ms ease;
              overflow: ${barSliderStyle === 'minimal' ? 'visible' : 'hidden'};
              ${barSliderStyle === 'minimal' ? 'display: flex; align-items: center;' : ''}
              ${isVertical ? 'display: flex; justify-content: center; align-items: center;' : ''}
              --slider-height: ${barSliderHeight}px;
            "
          >
            ${overlayContent && !applyGradientAsTrack
              ? html`
                  <div
                    style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  ${isVertical
                      ? `width: 100%; height: ${livePercentage}%;`
                      : `height: 100%; width: ${livePercentage}%;`}
                  ${overlayContent}
                  border-radius: ${borderRadius};
                  pointer-events: none;
                  z-index: 1;
                  transition: width 80ms ease-out, height 80ms ease-out;
                "
                  ></div>
                `
              : ''}

            <input
              type="range"
              min="0"
              max="100"
              step="${(() => {
                // Calculate step as percentage of the range
                const min = bar.min_value ?? 0;
                const max = bar.max_value ?? 100;
                const step = bar.step ?? 1;
                const range = max - min;
                // Convert step to percentage scale
                return range > 0 ? (step / range) * 100 : 1;
              })()}"
              .value="${livePercentage}"
              @input=${handleSliderInput}
              @mousedown=${handleSliderStart}
              @mouseup=${handleSliderEnd}
              @touchstart=${handleSliderStart}
              @touchend=${handleSliderEnd}
              class="${bar.type === 'rgb' || bar.type === 'color_temp'
                ? `gradient-slider ${isVertical ? 'vertical-gradient-indicator' : 'horizontal-gradient-indicator'}`
                : 'fill-slider'}"
              style="
                -webkit-appearance: none;
                appearance: none;
                width: ${isVertical
                ? shouldFillParent
                  ? `calc(100% + ${inputExtension}px)`
                  : `${targetVerticalHeight + inputExtension}px`
                : '100%'};
                height: ${isVertical
                ? isGradientSlider
                  ? '32px'
                  : `${barSliderHeight}px`
                : '100%'};
                background: transparent;
                outline: none;
                cursor: pointer;
                position: absolute;
                top: ${isVertical ? '50%' : '0'};
                left: ${isVertical ? '50%' : '0'};
                z-index: 2;
                ${isVertical
                ? `transform: translateX(-50%) translateY(-50%) rotate(270deg); transform-origin: center center;`
                : ''}
              "
            />

            ${isGradientSlider
              ? html`
                  <div
                    class="slider-indicator ${isVertical
                      ? 'vertical-indicator'
                      : 'horizontal-indicator'}"
                    style="${isVertical
                      ? `top: ${100 - livePercentage}%;`
                      : `left: ${livePercentage}%`};"
                  ></div>
                `
              : ''}
            ${layoutMode === 'overlay'
              ? html`
                  ${isVertical
                    ? (() => {
                        const iconPos = bar.icon_position || 'center';
                        const namePos = bar.name_position || 'center';
                        const valuePos = bar.value_position || 'center';

                        const useAutoContrast =
                          bar.auto_contrast ?? sliderControl.auto_contrast ?? true;
                        const contrastColor = livePercentage > 50 ? '#000' : '#fff';
                        const nameColor = useAutoContrast
                          ? contrastColor
                          : bar.name_color ||
                            sliderControl.name_color ||
                            'var(--primary-text-color)';
                        const valueColor = useAutoContrast
                          ? contrastColor
                          : bar.value_color ||
                            sliderControl.value_color ||
                            'var(--primary-text-color)';
                        const iconColor = useAutoContrast
                          ? contrastColor
                          : bar.icon_color ||
                            sliderControl.icon_color ||
                            'var(--primary-text-color)';
                        const iconToggle =
                          bar.icon_as_toggle ?? sliderControl.icon_as_toggle ?? true;

                        const toggleHandler = iconToggle
                          ? async () => {
                              try {
                                const domain = bar.entity.split('.')[0];
                                const isOn =
                                  entityState?.state === 'on' || entityState?.state === 'open';
                                if (domain === 'light') {
                                  await homeAssistant.callService(
                                    'light',
                                    isOn ? 'turn_off' : 'turn_on',
                                    { entity_id: bar.entity }
                                  );
                                } else if (domain === 'cover') {
                                  await homeAssistant.callService(
                                    'cover',
                                    isOn ? 'close_cover' : 'open_cover',
                                    { entity_id: bar.entity }
                                  );
                                } else if (domain === 'fan') {
                                  await homeAssistant.callService(
                                    'fan',
                                    isOn ? 'turn_off' : 'turn_on',
                                    { entity_id: bar.entity }
                                  );
                                } else if (domain === 'switch') {
                                  await homeAssistant.callService(
                                    'switch',
                                    isOn ? 'turn_off' : 'turn_on',
                                    { entity_id: bar.entity }
                                  );
                                }
                                
                                // Clear cached slider value after toggle to ensure slider reflects new state
                                this.localSliderValues.delete(sliderKey);
                                this.localSliderValues = new Map(this.localSliderValues);
                              } catch (error) {
                                console.error('Failed to toggle entity:', error);
                              }
                            }
                          : undefined;

                        // Group elements by position
                        const topElements: TemplateResult[] = [];
                        const middleElements: TemplateResult[] = [];
                        const bottomElements: TemplateResult[] = [];

                        const iconElement = showIconSection
                          ? html`
                              <ha-icon
                                class="uc-slider-icon uc-overlay-info-item"
                                icon="${bar.icon ||
                                sliderControl.icon ||
                                EntityIconService.getEntityIcon(entityState, homeAssistant)}"
                                style="
                              --mdc-icon-size: ${bar.icon_size || sliderControl.icon_size || 16}px;
                              color: ${iconColor};
                              cursor: ${iconToggle ? 'pointer' : 'default'};
                              pointer-events: ${iconToggle ? 'auto' : 'none'};
                            "
                                @click=${toggleHandler}
                              ></ha-icon>
                            `
                          : null;

                        const nameElement = showNameSection
                          ? html`
                              <div
                                class="uc-slider-name uc-overlay-info-item"
                                style="
                              font-size: ${bar.name_size || sliderControl.name_size || 14}px;
                              color: ${nameColor};
                              font-weight: ${(bar.name_bold ?? sliderControl.name_bold ?? true)
                                  ? 'bold'
                                  : 'normal'};
                              text-align: center;
                              writing-mode: vertical-rl;
                              text-orientation: mixed;
                            "
                              >
                                ${entityName}
                              </div>
                            `
                          : null;

                        const valueElement = showValueSection
                          ? html`
                              <div
                                class="uc-slider-value uc-overlay-info-item"
                                style="
                              font-size: ${bar.value_size || sliderControl.value_size || 14}px;
                              color: ${valueColor};
                              font-weight: 600;
                              text-align: center;
                            "
                              >
                                ${displayValue}${bar.type === 'brightness'
                                  ? bar.value_suffix || sliderControl.value_suffix || '%'
                                  : ''}
                              </div>
                            `
                          : null;

                        // Assign elements to positions
                        if (iconElement) {
                          if (iconPos === 'top') topElements.push(iconElement);
                          else if (iconPos === 'bottom') bottomElements.push(iconElement);
                          else middleElements.push(iconElement);
                        }
                        if (nameElement) {
                          if (namePos === 'top') topElements.push(nameElement);
                          else if (namePos === 'bottom') bottomElements.push(nameElement);
                          else middleElements.push(nameElement);
                        }
                        if (valueElement) {
                          if (valuePos === 'top') topElements.push(valueElement);
                          else if (valuePos === 'bottom') bottomElements.push(valueElement);
                          else middleElements.push(valueElement);
                        }

                        return html`
                          <div
                            class="uc-overlay-info-container"
                            style="
                              position: absolute;
                              left: 50%;
                              transform: translateX(-50%);
                              pointer-events: none;
                              z-index: 3;
                              width: 100%;
                              top: 16px;
                              height: calc(100% - 32px);
                              display: grid;
                              grid-template-rows: auto 1fr auto;
                              justify-items: center;
                            "
                          >
                            <div
                              style="display: flex; flex-direction: column; align-items: center; gap: 4px;"
                            >
                              ${topElements}
                            </div>
                            <div
                              style="width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;"
                            >
                              ${middleElements}
                            </div>
                            <div
                              style="display: flex; flex-direction: column; align-items: center; gap: 4px;"
                            >
                              ${bottomElements}
                            </div>
                          </div>
                        `;
                      })()
                    : html`
                        <!-- Horizontal Overlay Layout with Individual Element Positioning -->
                        ${(() => {
                          const iconPos = bar.icon_position || 'left';
                          const namePos = bar.name_position || 'left';
                          const valuePos = bar.value_position || 'right';

                          const iconToggle =
                            bar.icon_as_toggle ?? sliderControl.icon_as_toggle ?? true;
                          const iconSize = bar.icon_size || sliderControl.icon_size || 16;
                          const autoContrast =
                            bar.auto_contrast ?? sliderControl.auto_contrast ?? true;
                          const contrastColor = autoContrast
                            ? livePercentage > 50
                              ? '#000'
                              : '#fff'
                            : '';

                          const toggleHandler = iconToggle
                            ? async () => {
                                try {
                                  const domain = bar.entity.split('.')[0];
                                  const isOn =
                                    entityState?.state === 'on' || entityState?.state === 'open';
                                  if (domain === 'light') {
                                    await homeAssistant.callService(
                                      'light',
                                      isOn ? 'turn_off' : 'turn_on',
                                      { entity_id: bar.entity }
                                    );
                                  } else if (domain === 'cover') {
                                    await homeAssistant.callService(
                                      'cover',
                                      isOn ? 'close_cover' : 'open_cover',
                                      { entity_id: bar.entity }
                                    );
                                  } else if (domain === 'fan') {
                                    await homeAssistant.callService(
                                      'fan',
                                      isOn ? 'turn_off' : 'turn_on',
                                      { entity_id: bar.entity }
                                    );
                                  } else if (domain === 'switch') {
                                    await homeAssistant.callService(
                                      'switch',
                                      isOn ? 'turn_off' : 'turn_on',
                                      { entity_id: bar.entity }
                                    );
                                  }
                                  
                                  // Clear cached slider value after toggle to ensure slider reflects new state
                                  this.localSliderValues.delete(sliderKey);
                                  this.localSliderValues = new Map(this.localSliderValues);
                                } catch (error) {
                                  console.error('Failed to toggle entity:', error);
                                }
                              }
                            : undefined;

                          // Group elements by position to avoid overlap
                          const leftElements: TemplateResult[] = [];
                          const centerElements: TemplateResult[] = [];
                          const rightElements: TemplateResult[] = [];

                          const iconElement = showIconSection
                            ? html`
                                <ha-icon
                                  icon="${bar.icon ||
                                  sliderControl.icon ||
                                  EntityIconService.getEntityIcon(entityState, homeAssistant)}"
                                  style="
                                    --mdc-icon-size: ${iconSize}px;
                                    color: ${autoContrast
                                    ? contrastColor
                                    : bar.icon_color ||
                                      sliderControl.icon_color ||
                                      'var(--primary-text-color)'};
                                    pointer-events: ${iconToggle ? 'auto' : 'none'};
                                    cursor: ${iconToggle ? 'pointer' : 'default'};
                                  "
                                  @click=${toggleHandler}
                                ></ha-icon>
                              `
                            : null;

                          const nameElement = showNameSection
                            ? html`
                                <div
                                  class="uc-slider-name"
                                  style="
                                    font-size: ${bar.name_size || sliderControl.name_size || 14}px;
                                    color: ${autoContrast
                                    ? contrastColor
                                    : bar.name_color ||
                                      sliderControl.name_color ||
                                      'var(--primary-text-color)'};
                                    font-weight: ${(bar.name_bold ??
                                  sliderControl.name_bold ??
                                  true)
                                    ? 'bold'
                                    : 'normal'};
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    white-space: nowrap;
                                    max-width: 150px;
                                  "
                                >
                                  ${entityName}
                                </div>
                              `
                            : null;

                          const valueElement = showValueSection
                            ? html`
                                <div
                                  class="uc-slider-value"
                                  style="
                                    font-size: ${bar.value_size ||
                                  sliderControl.value_size ||
                                  14}px;
                                    color: ${autoContrast
                                    ? contrastColor
                                    : bar.value_color ||
                                      sliderControl.value_color ||
                                      'var(--primary-text-color)'};
                                    font-weight: 600;
                                  "
                                >
                                  ${displayValue}${bar.type === 'brightness'
                                    ? bar.value_suffix || sliderControl.value_suffix || '%'
                                    : ''}
                                </div>
                              `
                            : null;

                          // Assign elements to position groups
                          if (iconElement) {
                            if (iconPos === 'left') leftElements.push(iconElement);
                            else if (iconPos === 'right') rightElements.push(iconElement);
                            else centerElements.push(iconElement);
                          }
                          if (nameElement) {
                            if (namePos === 'left') leftElements.push(nameElement);
                            else if (namePos === 'right') rightElements.push(nameElement);
                            else centerElements.push(nameElement);
                          }
                          if (valueElement) {
                            if (valuePos === 'left') leftElements.push(valueElement);
                            else if (valuePos === 'right') rightElements.push(valueElement);
                            else centerElements.push(valueElement);
                          }

                          return html`
                            <div
                              style="position: absolute; inset: 0; pointer-events: none; z-index: 3;"
                            >
                              ${leftElements.length
                                ? html`
                                    <div
                                      style="
                                        position: absolute;
                                        left: 8px;
                                        top: 50%;
                                        transform: translateY(-50%);
                                        display: flex;
                                        align-items: center;
                                        gap: 8px;
                                      "
                                    >
                                      ${leftElements}
                                    </div>
                                  `
                                : ''}
                              ${centerElements.length
                                ? html`
                                    <div
                                      style="
                                        position: absolute;
                                        left: 50%;
                                        top: 50%;
                                        transform: translate(-50%, -50%);
                                        display: flex;
                                        align-items: center;
                                        gap: 8px;
                                      "
                                    >
                                      ${centerElements}
                                    </div>
                                  `
                                : ''}
                              ${rightElements.length
                                ? html`
                                    <div
                                      style="
                                        position: absolute;
                                        right: 8px;
                                        top: 50%;
                                        transform: translateY(-50%);
                                        display: flex;
                                        align-items: center;
                                        gap: 8px;
                                      "
                                    >
                                      ${rightElements}
                                    </div>
                                  `
                                : ''}
                            </div>
                          `;
                        })()}
                      `}
                `
              : ''}
          </div>
        </div>
      `;
    };

    // Render all bars
    const barsContent = bars.map((bar, index) => renderSingleBar(bar, index));

    // Build layout based on mode
    let finalLayout;

    if (layoutMode === 'outside') {
      // Create individual bar info for outside layout
      const barsWithInfo = bars.map((bar, index) => {
        const entityState = homeAssistant?.states?.[bar.entity];
        const entityName = bar.name || entityState?.attributes.friendly_name || bar.entity;

        let displayValue = '0';
        if (entityState) {
          switch (bar.type) {
            case 'brightness': {
              const brightness = entityState.attributes.brightness || 0;
              displayValue = `${Math.round((brightness / 255) * 100)}`;
              break;
            }
            case 'rgb': {
              const rgb = entityState.attributes.rgb_color || [255, 255, 255];
              displayValue = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
              break;
            }
            case 'color_temp': {
              const colorTemp = entityState.attributes.color_temp || 154;
              displayValue = `${Math.round(1000000 / colorTemp)}K`;
              break;
            }
            case 'red':
            case 'green':
            case 'blue': {
              const color = entityState.attributes.rgb_color || [255, 255, 255];
              const colorIndex = bar.type === 'red' ? 0 : bar.type === 'green' ? 1 : 2;
              displayValue = `${color[colorIndex]}`;
              break;
            }
            case 'attribute': {
              if (bar.attribute && entityState.attributes[bar.attribute] !== undefined) {
                const value = parseFloat(entityState.attributes[bar.attribute]) || 0;
                displayValue = `${Math.round(value)}`;
                if (bar.attribute === 'percentage') {
                  displayValue += '%';
                }
              } else {
                displayValue = '0';
              }
              break;
            }
            default: {
              displayValue = `${entityState.state}`;
            }
          }
        }

        const barElement = renderSingleBar(bar, index);
        const showIconOutside = bar.show_icon !== false && sliderControl.show_icon !== false;
        const outsideIconSize = bar.icon_size || sliderControl.icon_size || 16;
        const outsideIconGap = 8; // Gap between bar and icon
        const outsideIconTotalSpace = showIconOutside ? outsideIconSize + outsideIconGap : 0;

        if (isVertical) {
          // Vertical Outside Layout with Individual Element Positioning
          const iconPos = bar.icon_position || 'left_top';
          const namePos = bar.name_position || 'left_top';
          const valuePos = bar.value_position || 'left_bottom';

          const showIconSection = bar.show_icon !== false && sliderControl.show_icon !== false;
          const showName = bar.show_name !== false && sliderControl.show_name !== false;
          const showValue = bar.show_value !== false && sliderControl.show_value !== false;

          // Group elements by position area (6 possible positions)
          const positionGroups: Record<string, TemplateResult[]> = {
            left_top: [],
            left_center: [],
            left_bottom: [],
            right_top: [],
            right_center: [],
            right_bottom: [],
          };

          const iconToggle = bar.icon_as_toggle ?? sliderControl.icon_as_toggle ?? true;
          const barSliderKey = `${bar.entity}-${bar.type}`;
          const toggleHandler = iconToggle
            ? async () => {
                try {
                  const domain = bar.entity.split('.')[0];
                  const isOn = entityState?.state === 'on' || entityState?.state === 'open';
                  if (domain === 'light') {
                    await homeAssistant.callService('light', isOn ? 'turn_off' : 'turn_on', {
                      entity_id: bar.entity,
                    });
                  } else if (domain === 'cover') {
                    await homeAssistant.callService('cover', isOn ? 'close_cover' : 'open_cover', {
                      entity_id: bar.entity,
                    });
                  } else if (domain === 'fan') {
                    await homeAssistant.callService('fan', isOn ? 'turn_off' : 'turn_on', {
                      entity_id: bar.entity,
                    });
                  }
                  
                  // Clear cached slider value after toggle to ensure slider reflects new state
                  this.localSliderValues.delete(barSliderKey);
                  this.localSliderValues = new Map(this.localSliderValues);
                } catch (error) {
                  console.error('Failed to toggle entity:', error);
                }
              }
            : undefined;

          // Create elements
          const iconElement = showIconSection
            ? html`
                <ha-icon
                  icon="${EntityIconService.getEntityIcon(entityState, homeAssistant)}"
                  style="
                --mdc-icon-size: ${outsideIconSize}px;
                color: ${(bar.dynamic_icon ?? sliderControl.dynamic_icon ?? true) &&
                  entityState?.attributes.rgb_color
                    ? `rgb(${entityState.attributes.rgb_color.join(',')})`
                    : bar.icon_color || sliderControl.icon_color || 'var(--secondary-text-color)'};
                cursor: ${iconToggle ? 'pointer' : 'default'};
                pointer-events: ${iconToggle ? 'auto' : 'none'};
              "
                  @click=${toggleHandler}
                ></ha-icon>
              `
            : null;

          const nameElement = showName
            ? html`
                <div
                  class="uc-slider-name"
                  style="
                writing-mode: vertical-rl;
                text-orientation: mixed;
                font-size: ${bar.name_size || sliderControl.name_size || 16}px;
                color: ${bar.name_color || sliderControl.name_color || 'var(--primary-text-color)'};
                font-weight: ${(bar.name_bold ?? sliderControl.name_bold ?? true)
                    ? '500'
                    : 'normal'};
              "
                >
                  ${entityName}
                </div>
              `
            : null;

          const valueElement = showValue
            ? html`
                <div
                  class="uc-slider-value"
                  style="
                writing-mode: vertical-rl;
                text-orientation: mixed;
                font-size: ${bar.value_size || sliderControl.value_size || 14}px;
                color: ${bar.value_color ||
                  sliderControl.value_color ||
                  'var(--secondary-text-color)'};
              "
                >
                  ${displayValue}${bar.type === 'brightness'
                    ? bar.value_suffix || sliderControl.value_suffix || '%'
                    : ''}
                </div>
              `
            : null;

          // Assign elements to position groups
          if (iconElement && positionGroups[iconPos]) positionGroups[iconPos].push(iconElement);
          if (nameElement && positionGroups[namePos]) positionGroups[namePos].push(nameElement);
          if (valueElement && positionGroups[valuePos]) positionGroups[valuePos].push(valueElement);

          // Check which sides have content
          const hasLeftContent =
            positionGroups.left_top.length +
              positionGroups.left_center.length +
              positionGroups.left_bottom.length >
            0;
          const hasRightContent =
            positionGroups.right_top.length +
              positionGroups.right_center.length +
              positionGroups.right_bottom.length >
            0;

          const barHeightWithinWrapper = verticalSliderHeight;

          const renderPositionColumn = (side: 'left' | 'right') => {
            const topItems = positionGroups[`${side}_top`];
            const centerItems = positionGroups[`${side}_center`];
            const bottomItems = positionGroups[`${side}_bottom`];

            const hasContent = topItems.length + centerItems.length + bottomItems.length > 0;
            if (!hasContent) return html``;

            return html`
              <div
                style="display: flex; flex-direction: column; height: ${barHeightWithinWrapper}px; justify-content: space-between;"
              >
                <div style="display: flex; flex-direction: column; gap: 4px; align-items: center;">
                  ${topItems}
                </div>
                <div
                  style="display: flex; flex-direction: column; gap: 4px; align-items: center; justify-content: center; flex: 1;"
                >
                  ${centerItems}
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px; align-items: center;">
                  ${bottomItems}
                </div>
              </div>
            `;
          };

          return html`
            <div
              class="uc-slider-item uc-layout-${layoutMode} uc-orientation-vertical uc-bar-type-${bar.type}"
              style="display: flex; align-items: flex-start; justify-content: center; gap: 8px; height: ${verticalSliderHeight}px;"
            >
              ${hasLeftContent ? renderPositionColumn('left') : ''}
              <div
                style="height: ${barHeightWithinWrapper}px; display: flex; align-items: center; justify-content: center;"
              >
                ${barElement}
              </div>
              ${hasRightContent ? renderPositionColumn('right') : ''}
            </div>
          `;
        } else {
          // Horizontal Outside Layout with Individual Element Positioning
          const iconPos = bar.icon_position || 'top_left';
          const namePos = bar.name_position || 'top_left';
          const valuePos = bar.value_position || 'top_right';

          const showIconSection = bar.show_icon !== false && sliderControl.show_icon !== false;
          const showName = bar.show_name !== false && sliderControl.show_name !== false;
          const showValue = bar.show_value !== false && sliderControl.show_value !== false;

          // Group elements by position area (6 possible positions)
          const positionGroups: Record<string, TemplateResult[]> = {
            top_left: [],
            top_center: [],
            top_right: [],
            bottom_left: [],
            bottom_center: [],
            bottom_right: [],
          };

          const iconToggle = bar.icon_as_toggle ?? sliderControl.icon_as_toggle ?? true;
          const barSliderKey = `${bar.entity}-${bar.type}`;
          const toggleHandler = iconToggle
            ? async () => {
                try {
                  const domain = bar.entity.split('.')[0];
                  const isOn = entityState?.state === 'on' || entityState?.state === 'open';
                  if (domain === 'light') {
                    await homeAssistant.callService('light', isOn ? 'turn_off' : 'turn_on', {
                      entity_id: bar.entity,
                    });
                  } else if (domain === 'cover') {
                    await homeAssistant.callService('cover', isOn ? 'close_cover' : 'open_cover', {
                      entity_id: bar.entity,
                    });
                  } else if (domain === 'fan') {
                    await homeAssistant.callService('fan', isOn ? 'turn_off' : 'turn_on', {
                      entity_id: bar.entity,
                    });
                  }
                  
                  // Clear cached slider value after toggle to ensure slider reflects new state
                  this.localSliderValues.delete(barSliderKey);
                  this.localSliderValues = new Map(this.localSliderValues);
                } catch (error) {
                  console.error('Failed to toggle entity:', error);
                }
              }
            : undefined;

          // Create elements
          const iconElement = showIconSection
            ? html`
                <ha-icon
                  icon="${EntityIconService.getEntityIcon(entityState, homeAssistant)}"
                  style="
                --mdc-icon-size: ${sliderControl.icon_size || 16}px;
                color: ${sliderControl.dynamic_icon && entityState?.attributes.rgb_color
                    ? `rgb(${entityState.attributes.rgb_color.join(',')})`
                    : 'var(--secondary-text-color)'};
                cursor: ${iconToggle ? 'pointer' : 'default'};
                pointer-events: ${iconToggle ? 'auto' : 'none'};
              "
                  @click=${toggleHandler}
                ></ha-icon>
              `
            : null;

          const nameElement = showName
            ? html`
                <div
                  class="uc-slider-name"
                  style="
                font-size: ${bar.name_size || sliderControl.name_size || 14}px;
                color: ${bar.name_color ||
                  sliderControl.name_color ||
                  'var(--secondary-text-color)'};
                font-weight: ${(bar.name_bold ?? sliderControl.name_bold ?? true)
                    ? '600'
                    : 'normal'};
                line-height: 1;
              "
                >
                  ${entityName}
                </div>
              `
            : null;

          const valueElement = showValue
            ? html`
                <div
                  class="uc-slider-value"
                  style="
                font-size: ${bar.value_size || sliderControl.value_size || 14}px;
                color: ${bar.value_color ||
                  sliderControl.value_color ||
                  'var(--secondary-text-color)'};
                font-weight: 600;
              "
                >
                  ${displayValue}${bar.type === 'brightness'
                    ? bar.value_suffix || sliderControl.value_suffix || '%'
                    : ''}
                </div>
              `
            : null;

          // Assign elements to position groups
          if (iconElement && positionGroups[iconPos]) positionGroups[iconPos].push(iconElement);
          if (nameElement && positionGroups[namePos]) positionGroups[namePos].push(nameElement);
          if (valueElement && positionGroups[valuePos]) positionGroups[valuePos].push(valueElement);

          // Check which rows have content
          const hasTopContent =
            positionGroups.top_left.length +
              positionGroups.top_center.length +
              positionGroups.top_right.length >
            0;
          const hasBottomContent =
            positionGroups.bottom_left.length +
              positionGroups.bottom_center.length +
              positionGroups.bottom_right.length >
            0;

          const renderPositionRow = (row: 'top' | 'bottom') => {
            const leftItems = positionGroups[`${row}_left`];
            const centerItems = positionGroups[`${row}_center`];
            const rightItems = positionGroups[`${row}_right`];

            const hasContent = leftItems.length + centerItems.length + rightItems.length > 0;
            if (!hasContent) return html``;

            return html`
              <div
                style="display: flex; justify-content: space-between; align-items: center; width: 100%; ${row ===
                'top'
                  ? 'margin-bottom: 4px;'
                  : 'margin-top: 4px;'}"
              >
                <div style="display: flex; align-items: center; gap: 8px;">${leftItems}</div>
                <div style="display: flex; align-items: center; gap: 8px;">${centerItems}</div>
                <div style="display: flex; align-items: center; gap: 8px;">${rightItems}</div>
              </div>
            `;
          };

          const barInfo = html`
            ${hasTopContent ? renderPositionRow('top') : ''}
            ${hasBottomContent ? renderPositionRow('bottom') : ''}
          `;

          return html`
            <div
              class="uc-slider-item uc-layout-${layoutMode} uc-orientation-horizontal uc-bar-type-${bar.type}"
            >
              ${barInfo}${barElement}
            </div>
          `;
        }
      });

      finalLayout = html`
        <div
          class="${baseLayoutClass}"
          style="display: flex; flex-direction: ${isVertical
            ? 'row'
            : 'column'}; width: 100%; gap: ${barSpacing}px; align-items: ${isVertical
            ? 'flex-start'
            : 'stretch'};"
        >
          ${barsWithInfo}
        </div>
      `;
    } else if (layoutMode === 'overlay') {
      finalLayout = html`
        <div
          class="${baseLayoutClass}"
          style="position: relative; ${isVertical
            ? 'display: flex; flex-direction: column; align-items: center; justify-content: center;'
            : ''}"
        >
          <div
            class="uc-slider-items"
            style="display: flex; ${isVertical
              ? 'flex-direction: row; gap: ' +
                barSpacing +
                'px; justify-content: center; align-items: center;'
              : 'flex-direction: column; gap: ' + barSpacing + 'px;'} width: 100%;"
          >
            ${barsContent}
          </div>
        </div>
      `;
    } else {
      // Split mode
      const defaultSplitBarPosition = sliderControl.split_bar_position || 'left';
      const defaultSplitBarLength = sliderControl.split_bar_length ?? 60;

      // Create combined info + bar for each slider
      const combinedBars = bars.map((bar, index) => {
        const entityState = homeAssistant?.states?.[bar.entity];
        const entityName = bar.name || entityState?.attributes.friendly_name || bar.entity;

        // Use info_section_position for split mode to determine bar/info layout
        const infoSectionPos = bar.info_section_position || (isVertical ? 'top' : 'left');
        const barPosition = isVertical
          ? infoSectionPos === 'bottom'
            ? 'left'
            : 'right' // If info is bottom, bar is top (left); if info is top, bar is bottom (right)
          : infoSectionPos === 'right'
            ? 'left'
            : 'right'; // If info is right, bar is left; if info is left, bar is right
        const barLength = bar.split_bar_length ?? defaultSplitBarLength;
        const showIconSection = bar.show_icon !== false && sliderControl.show_icon !== false;
        const showNameSection = bar.show_name !== false && sliderControl.show_name !== false;
        const showValueSection = bar.show_value !== false && sliderControl.show_value !== false;
        const hasInfoSection = showIconSection || showNameSection || showValueSection;

        // Calculate bar and info sizes using percentages
        // For vertical: use min-height to ensure bars are always visible
        // At 100%, use a large min-height; otherwise calculate proportionally
        const verticalBaseHeight = 200; // Base height for 100% bar
        const barSize = isVertical
          ? barLength === 100
            ? `min-height: ${verticalBaseHeight}px; height: 100%;`
            : `height: ${barLength}%; min-height: ${Math.floor((verticalBaseHeight * barLength) / 100)}px;`
          : `width: ${barLength}%;`;

        const infoSize = isVertical
          ? `height: ${100 - barLength}%;`
          : `width: ${100 - barLength}%;`;

        // Always show info container unless bar is 100% (need it for spacing even if empty)
        const shouldShowInfoContainer = barLength < 100;

        let displayValue = '0';
        if (entityState) {
          switch (bar.type) {
            case 'brightness': {
              const brightness = entityState.attributes.brightness || 0;
              displayValue = `${Math.round((brightness / 255) * 100)}`;
              break;
            }
            case 'rgb': {
              const rgb = entityState.attributes.rgb_color || [255, 255, 255];
              displayValue = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
              break;
            }
            case 'color_temp': {
              const colorTemp = entityState.attributes.color_temp || 154;
              displayValue = `${Math.round(1000000 / colorTemp)}K`;
              break;
            }
            case 'red':
            case 'green':
            case 'blue': {
              const color = entityState.attributes.rgb_color || [255, 255, 255];
              const colorIndex = bar.type === 'red' ? 0 : bar.type === 'green' ? 1 : 2;
              displayValue = `${color[colorIndex]}`;
              break;
            }
            case 'attribute': {
              if (bar.attribute && entityState.attributes[bar.attribute] !== undefined) {
                const value = parseFloat(entityState.attributes[bar.attribute]) || 0;
                displayValue = `${Math.round(value)}`;
                if (bar.attribute === 'percentage') {
                  displayValue += '%';
                }
              } else {
                displayValue = '0';
              }
              break;
            }
            default: {
              displayValue = `${entityState.state}`;
            }
          }
        }

        const barElement = renderSingleBar(bar, index);

        const itemClass = `uc-slider-item uc-layout-${layoutMode} ${
          isVertical ? 'uc-orientation-vertical' : 'uc-orientation-horizontal'
        } uc-bar-type-${bar.type}`;

        const itemAlign = isOutsideLayout && isVertical ? 'stretch' : 'center';
        const infoSpacingStyle = isVertical
          ? barPosition === 'left'
            ? 'margin-bottom: 8px;'
            : 'margin-top: 8px;'
          : '';

        // Build info section with individual element positioning
        const renderInfoSection = () => {
          if (!shouldShowInfoContainer) return html``;

          const iconToggle = bar.icon_as_toggle ?? sliderControl.icon_as_toggle ?? true;
          const barSliderKey = `${bar.entity}-${bar.type}`;
          const toggleHandler = iconToggle
            ? async () => {
                try {
                  const domain = bar.entity.split('.')[0];
                  const isOn = entityState?.state === 'on' || entityState?.state === 'open';
                  if (domain === 'light') {
                    await homeAssistant.callService('light', isOn ? 'turn_off' : 'turn_on', {
                      entity_id: bar.entity,
                    });
                  } else if (domain === 'cover') {
                    await homeAssistant.callService('cover', isOn ? 'close_cover' : 'open_cover', {
                      entity_id: bar.entity,
                    });
                  } else if (domain === 'fan') {
                    await homeAssistant.callService('fan', isOn ? 'turn_off' : 'turn_on', {
                      entity_id: bar.entity,
                    });
                  }
                  
                  // Clear cached slider value after toggle to ensure slider reflects new state
                  this.localSliderValues.delete(barSliderKey);
                  this.localSliderValues = new Map(this.localSliderValues);
                } catch (error) {
                  console.error('Failed to toggle entity:', error);
                }
              }
            : undefined;

          const allElements: TemplateResult[] = [];

          if (showIconSection) {
            allElements.push(html`
              <ha-icon
                icon="${EntityIconService.getEntityIcon(entityState, homeAssistant)}"
                style="
                  --mdc-icon-size: ${bar.icon_size || sliderControl.icon_size || 16}px;
                  color: ${(bar.dynamic_icon ?? sliderControl.dynamic_icon ?? true) &&
                entityState?.attributes.rgb_color
                  ? `rgb(${entityState.attributes.rgb_color.join(',')})`
                  : bar.icon_color || sliderControl.icon_color || 'var(--primary-text-color)'};
                  cursor: ${iconToggle ? 'pointer' : 'default'};
                  pointer-events: ${iconToggle ? 'auto' : 'none'};
                "
                @click=${toggleHandler}
              ></ha-icon>
            `);
          }

          if (showNameSection) {
            allElements.push(html`
              <div
                class="uc-slider-name"
                style="
                  font-size: ${bar.name_size || sliderControl.name_size || 16}px;
                  color: ${bar.name_color ||
                sliderControl.name_color ||
                'var(--primary-text-color)'};
                  font-weight: ${(bar.name_bold ?? sliderControl.name_bold ?? true)
                  ? '500'
                  : 'normal'};
                "
              >
                ${entityName}
              </div>
            `);
          }

          if (showValueSection) {
            allElements.push(html`
              <div
                class="uc-slider-value"
                style="
                  font-size: ${bar.value_size || sliderControl.value_size || 14}px;
                  color: ${bar.value_color ||
                sliderControl.value_color ||
                'var(--secondary-text-color)'};
                "
              >
                ${displayValue}${bar.type === 'brightness'
                  ? bar.value_suffix || sliderControl.value_suffix || '%'
                  : ''}
              </div>
            `);
          }

          return html`
            <div
              class="uc-slider-info"
              style="${infoSize} display: flex; align-items: center; justify-content: center; ${isVertical
                ? 'flex-direction: column; text-align: center;'
                : 'flex-direction: row;'} gap: 8px;"
            >
              ${allElements}
            </div>
          `;
        };

        return html`
          <div
            class="${itemClass}"
            style="display: flex; align-items: ${itemAlign}; ${isVertical
              ? 'flex-direction: column; height: 100%;'
              : 'width: 100%;'}"
          >
            ${barPosition === 'left'
              ? html`
                  ${renderInfoSection()}
                  <div
                    class="uc-slider-track-wrapper"
                    style="${barSize} ${isVertical
                      ? 'display: flex; justify-content: center; align-items: stretch;'
                      : ''}"
                  >
                    ${barElement}
                  </div>
                `
              : html`
                  <div
                    class="uc-slider-track-wrapper"
                    style="${barSize} ${isVertical
                      ? 'display: flex; justify-content: center; align-items: stretch;'
                      : ''}"
                  >
                    ${barElement}
                  </div>
                  ${renderInfoSection()}
                `}
          </div>
        `;
      });

      finalLayout = html`
        <div
          class="${baseLayoutClass}"
          style="display: flex; flex-direction: ${isVertical
            ? 'row'
            : 'column'}; width: 100%; ${isVertical
            ? 'height: 100%;'
            : ''} gap: ${barSpacing}px; align-items: ${isVertical
            ? 'stretch'
            : 'stretch'}; justify-content: ${isVertical ? 'center' : 'stretch'};"
        >
          ${combinedBars}
        </div>
      `;
    }

    return html`
      <div
        class="slider-control-container ${baseLayoutClass}"
        style="padding: 16px; position: relative; ${isVertical
          ? 'display: flex; justify-content: center; align-items: center;'
          : ''} ${isOutsideLayout ? 'overflow: hidden;' : ''}"
      >
        ${warningBanner}
        <style>
          .slider-control-container input[type='range']::-webkit-slider-track {
            background: transparent;
            height: 100%;
          }
          .slider-control-container input[type='range']::-moz-range-track {
            background: transparent;
            height: 100%;
          }

          /* Fill sliders (brightness, numeric) - no thumb, just fill/empty cut line */
          .slider-control-container input.fill-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 0;
            height: 0;
            background: transparent;
            border: none;
            cursor: pointer;
          }
          .slider-control-container input.fill-slider::-moz-range-thumb {
            width: 0;
            height: 0;
            background: transparent;
            border: none;
            cursor: pointer;
          }

          /* Gradient slider thumb styling */
          .slider-control-container
            .slider-track-container
            input.gradient-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 1px;
            height: var(--slider-height, 55px);
            border: none;
            background: transparent;
            cursor: pointer;
            margin: 0;
            opacity: 0;
          }
          .slider-control-container
            .slider-track-container
            input.gradient-slider::-moz-range-thumb {
            width: 1px;
            height: var(--slider-height, 55px);
            border: none;
            background: transparent;
            cursor: pointer;
            margin: 0;
            opacity: 0;
          }

          .slider-control-container .slider-track-container .slider-indicator {
            position: absolute;
            background: rgba(0, 0, 0, 0.3);
            border: 2px solid #ffffff;
            border-radius: 4px;
            box-shadow:
              0 0 8px rgba(0, 0, 0, 0.5),
              inset 0 0 3px rgba(255, 255, 255, 0.2);
            pointer-events: none;
            will-change: top, left;
            transition:
              top 80ms ease-out,
              left 80ms ease-out;
            z-index: 3;
          }
          .slider-control-container .slider-track-container .slider-indicator.horizontal-indicator {
            width: 8px;
            height: var(--slider-height, 55px);
            top: 50%;
            transform: translate(-50%, -50%);
          }
          .slider-control-container .slider-track-container .slider-indicator.vertical-indicator {
            height: 8px;
            width: var(--slider-height, 55px);
            left: 50%;
            transform: translate(-50%, -50%);
          }
        </style>

        ${finalLayout}
      </div>
    `;
  }

  // Helper methods for color conversion
  private resolveDynamicFillColor(bar: SliderBar, entityState: any, fallback: string): string {
    if (!entityState || !entityState.attributes) {
      return fallback;
    }

    const attributes = entityState.attributes;

    if (Array.isArray(attributes.rgb_color) && attributes.rgb_color.length === 3) {
      const [r, g, b] = attributes.rgb_color;
      return `rgb(${r}, ${g}, ${b})`;
    }

    if (Array.isArray(attributes.hs_color) && attributes.hs_color.length >= 2) {
      const [h, s] = attributes.hs_color;
      const rgb = this.hsvToRgb(
        ((h ?? 0) % 360) / 360,
        Math.max(0, Math.min(100, s ?? 100)) / 100,
        1
      );
      return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    }

    if (typeof attributes.color_temp === 'number' && attributes.color_temp > 0) {
      const kelvin = Math.max(1000, Math.min(40000, Math.round(1000000 / attributes.color_temp)));
      const [r, g, b] = this.colorTemperatureToRGB(kelvin);
      return `rgb(${r}, ${g}, ${b})`;
    }

    if (typeof attributes.color === 'string' && attributes.color.trim()) {
      return attributes.color;
    }

    return fallback;
  }

  private rgbToHue(r: number, g: number, b: number): number {
    const red = r / 255;
    const green = g / 255;
    const blue = b / 255;

    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const delta = max - min;

    if (delta === 0) return 0;

    let hue = 0;
    if (max === red) {
      hue = (((green - blue) / delta) % 6) / 6;
    } else if (max === green) {
      hue = ((blue - red) / delta + 2) / 6;
    } else {
      hue = ((red - green) / delta + 4) / 6;
    }

    if (hue < 0) hue += 1;
    if (hue > 1) hue -= 1;

    // Convert to percentage for our specific gradient
    // Our gradient: red(0%) -> yellow(16.67%) -> green(33.33%) -> cyan(50%) -> blue(66.67%) -> magenta(83.33%) -> red(100%)
    // Map HSV hue (0-1) to our gradient positions (0-100%)
    // For pure red (255, 0, 0), hue should be 0, which maps to 0% (bottom of gradient)
    return hue * 100;
  }

  private hsvToRgb(h: number, s: number, v: number): [number, number, number] {
    const c = v * s;
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
    const m = v - c;

    let red = 0,
      green = 0,
      blue = 0;

    if (h < 1 / 6) {
      red = c;
      green = x;
      blue = 0;
    } else if (h < 2 / 6) {
      red = x;
      green = c;
      blue = 0;
    } else if (h < 3 / 6) {
      red = 0;
      green = c;
      blue = x;
    } else if (h < 4 / 6) {
      red = 0;
      green = x;
      blue = c;
    } else if (h < 5 / 6) {
      red = x;
      green = 0;
      blue = c;
    } else {
      red = c;
      green = 0;
      blue = x;
    }

    return [
      Math.round((red + m) * 255),
      Math.round((green + m) * 255),
      Math.round((blue + m) * 255),
    ];
  }

  /**
   * Extract RGB values from a color string (hex, rgb, or CSS var)
   * Returns default blue if parsing fails
   */
  private extractRgbFromColor(color: string): [number, number, number] {
    // Try to extract from hex color
    if (color.startsWith('#')) {
      const hex = color.substring(1);
      if (hex.length === 3) {
        return [
          parseInt(hex[0] + hex[0], 16),
          parseInt(hex[1] + hex[1], 16),
          parseInt(hex[2] + hex[2], 16),
        ];
      } else if (hex.length === 6) {
        return [
          parseInt(hex.substring(0, 2), 16),
          parseInt(hex.substring(2, 4), 16),
          parseInt(hex.substring(4, 6), 16),
        ];
      }
    }

    // Try to extract from rgb() format
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
    }

    // Try to extract from rgba() format
    const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
    if (rgbaMatch) {
      return [parseInt(rgbaMatch[1]), parseInt(rgbaMatch[2]), parseInt(rgbaMatch[3])];
    }

    // Default to primary blue color
    return [33, 150, 243];
  }

  private colorTemperatureToRGB(kelvin: number): [number, number, number] {
    const temperature = kelvin / 100;

    let red: number;
    let green: number;
    let blue: number;

    if (temperature <= 66) {
      red = 255;
      green = 99.4708025861 * Math.log(Math.max(1, temperature)) - 161.1195681661;
      blue =
        temperature <= 19
          ? 0
          : 138.5177312231 * Math.log(Math.max(1, temperature - 10)) - 305.0447927307;
    } else {
      red = 329.698727446 * Math.pow(temperature - 60, -0.1332047592);
      green = 288.1221695283 * Math.pow(temperature - 60, -0.0755148492);
      blue = 255;
    }

    const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

    return [clamp(red), clamp(green), clamp(blue)];
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const sliderControl = module as SliderControlModule;
    const errors = [...baseValidation.errors];

    // LENIENT VALIDATION: Allow empty/incomplete bars - UI will show placeholder
    // Only validate bars that have been started
    if (sliderControl.bars && sliderControl.bars.length > 0) {
      // Validate each bar - but only for truly breaking errors
      sliderControl.bars.forEach((bar, index) => {
        // Only validate bars that have some content
        const hasContent = bar.entity && bar.entity.trim() !== '';

        if (hasContent) {
          if (bar.min_value !== undefined && bar.max_value !== undefined) {
            if (bar.min_value >= bar.max_value) {
              errors.push(`Bar ${index + 1}: Min value must be less than max value`);
            }
          }
        }
      });
    }

    // Validate slider height (truly breaking if invalid)
    if (
      sliderControl.slider_height &&
      (sliderControl.slider_height < 20 || sliderControl.slider_height > 200)
    ) {
      errors.push('Slider height must be between 20 and 200 pixels');
    }

    return { valid: errors.length === 0, errors };
  }

  getStyles(): string {
    return `
      /* Placeholder for styles */
    `;
  }
}
