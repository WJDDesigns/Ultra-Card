// Animated Weather Module Editor
// Visual drag-and-drop editor with accordion items

import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { AnimatedWeatherModule, UltraCardConfig, CardModule } from '../types';
import { localize } from '../localize/localize';
import { BaseUltraModule } from './base-module';

// Item metadata
interface WeatherItemMeta {
  id: string;
  label: string;
  icon: string;
  column: 'left' | 'right';
}

const WEATHER_ITEMS: Record<string, WeatherItemMeta> = {
  location: { id: 'location', label: 'Location', icon: 'mdi:map-marker', column: 'left' },
  condition: { id: 'condition', label: 'Condition', icon: 'mdi:weather-partly-cloudy', column: 'left' },
  custom_entity: { id: 'custom_entity', label: 'Custom Entity', icon: 'mdi:plus-circle', column: 'left' },
  precipitation: { id: 'precipitation', label: 'Precipitation', icon: 'mdi:weather-pouring', column: 'left' },
  precipitation_probability: { id: 'precipitation_probability', label: 'Precipitation Probability', icon: 'mdi:weather-rainy', column: 'left' },
  wind: { id: 'wind', label: 'Wind', icon: 'mdi:weather-windy', column: 'left' },
  pressure: { id: 'pressure', label: 'Pressure', icon: 'mdi:gauge', column: 'left' },
  visibility: { id: 'visibility', label: 'Visibility', icon: 'mdi:eye', column: 'left' },
  date: { id: 'date', label: 'Date', icon: 'mdi:calendar', column: 'right' },
  temperature: { id: 'temperature', label: 'Temperature', icon: 'mdi:thermometer', column: 'right' },
  temp_range: { id: 'temp_range', label: 'High/Low', icon: 'mdi:thermometer-lines', column: 'right' },
};

// Track expanded accordion in module's temporary state (not persisted to config)
const expandedAccordionState: Record<string, string | null> = {};

export function renderAnimatedWeatherModuleEditor(
  context: any,
  module: CardModule,
  hass: HomeAssistant,
  config: UltraCardConfig,
  updateModule: (updates: Partial<CardModule>) => void
): TemplateResult {
  const weatherModule = module as AnimatedWeatherModule;
  const lang = hass.locale?.language || 'en';

  // Check which attributes are available in the weather entity
  const weatherEntity = weatherModule.weather_entity
    ? hass.states[weatherModule.weather_entity]
    : null;
  const hasPrecipitation =
    weatherEntity?.attributes?.precipitation !== undefined &&
    weatherEntity?.attributes?.precipitation !== null;
  const hasPrecipitationProbability =
    weatherEntity?.attributes?.precipitation_probability !== undefined &&
    weatherEntity?.attributes?.precipitation_probability !== null;
  const hasWind =
    weatherEntity?.attributes?.wind_speed !== undefined ||
    weatherEntity?.attributes?.wind_bearing !== undefined;
  const hasPressure =
    weatherEntity?.attributes?.pressure !== undefined &&
    weatherEntity?.attributes?.pressure !== null;
  const hasVisibility =
    weatherEntity?.attributes?.visibility !== undefined &&
    weatherEntity?.attributes?.visibility !== null;

  // Get default order if not set
  const getDefaultOrder = (column: 'left' | 'right'): string[] => {
    if (column === 'left') {
      const items: string[] = ['location', 'condition'];
      if (weatherModule.custom_entity) items.push('custom_entity');
      if (hasPrecipitation) items.push('precipitation');
      if (hasPrecipitationProbability) items.push('precipitation_probability');
      if (hasWind) items.push('wind');
      if (hasPressure) items.push('pressure');
      if (hasVisibility) items.push('visibility');
      return items;
    } else {
      return ['date', 'temperature', 'temp_range'];
    }
  };

  const leftOrder = weatherModule.left_column_order || getDefaultOrder('left');
  const rightOrder = weatherModule.right_column_order || getDefaultOrder('right');

  // State management
  let draggedItem: { itemId: string; fromColumn: 'left' | 'right'; fromIndex: number } | null = null;
  const moduleId = weatherModule.id || 'default';
  
  // Get expanded accordion state
  const getExpandedAccordion = () => expandedAccordionState[moduleId] || null;
  const setExpandedAccordion = (itemId: string | null) => {
    expandedAccordionState[moduleId] = itemId;
  };

  // Drag handlers
  const handleDragStart = (e: DragEvent, itemId: string, column: 'left' | 'right', index: number) => {
    draggedItem = { itemId, fromColumn: column, fromIndex: index };
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', itemId);
    }
    (e.target as HTMLElement).style.opacity = '0.4';
  };

  const handleDragEnd = (e: DragEvent) => {
    (e.target as HTMLElement).style.opacity = '';
    draggedItem = null;
    // Remove all drop zone highlights
    document.querySelectorAll('.drop-zone-active').forEach(el => el.classList.remove('drop-zone-active'));
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

  const handleDrop = (e: DragEvent, targetColumn: 'left' | 'right', targetIndex: number) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).classList.remove('drop-zone-active');

    if (!draggedItem) return;

    const { itemId, fromColumn, fromIndex } = draggedItem;

    // Create new order arrays
    let newLeftOrder = [...leftOrder];
    let newRightOrder = [...rightOrder];

    // Remove from source
    if (fromColumn === 'left') {
      newLeftOrder.splice(fromIndex, 1);
    } else {
      newRightOrder.splice(fromIndex, 1);
    }

    // Add to target
    if (targetColumn === 'left') {
      newLeftOrder.splice(targetIndex, 0, itemId);
    } else {
      newRightOrder.splice(targetIndex, 0, itemId);
    }

    // Update module
    updateModule({
      left_column_order: newLeftOrder,
      right_column_order: newRightOrder,
    });

    setTimeout(() => context.triggerPreviewUpdate(), 50);
  };

  // Toggle visibility
  const toggleVisibility = (itemId: string) => {
    const showKey = `show_${itemId}` as keyof AnimatedWeatherModule;
    const currentValue = weatherModule[showKey];
    updateModule({ [showKey]: currentValue === false ? true : false } as any);
    setTimeout(() => context.triggerPreviewUpdate(), 50);
  };

  // Render accordion item
  const renderAccordionItem = (itemId: string, column: 'left' | 'right', index: number) => {
    const meta = WEATHER_ITEMS[itemId];
    if (!meta) return html``;

    // Check if item should be available (entity has this attribute)
    if (itemId === 'precipitation' && !hasPrecipitation) return html``;
    if (itemId === 'precipitation_probability' && !hasPrecipitationProbability) return html``;
    if (itemId === 'wind' && !hasWind) return html``;
    if (itemId === 'pressure' && !hasPressure) return html``;
    if (itemId === 'visibility' && !hasVisibility) return html``;

    const showKey = `show_${itemId}` as keyof AnimatedWeatherModule;
    const sizeKey = `${itemId}_size` as keyof AnimatedWeatherModule;
    const colorKey = `${itemId}_color` as keyof AnimatedWeatherModule;

    const isVisible = weatherModule[showKey] !== false;
    const isExpanded = getExpandedAccordion() === itemId;

    const toggleExpand = (e: Event) => {
      e.stopPropagation();
      const currentExpanded = getExpandedAccordion();
      setExpandedAccordion(currentExpanded === itemId ? null : itemId);
      // Force re-render
      updateModule({});
    };

    return html`
      <div
        class="accordion-item"
        draggable="true"
        @dragstart=${(e: DragEvent) => handleDragStart(e, itemId, column, index)}
        @dragend=${handleDragEnd}
        @dragover=${handleDragOver}
        @dragenter=${handleDragEnter}
        @dragleave=${handleDragLeave}
        @drop=${(e: DragEvent) => handleDrop(e, column, index)}
      >
        <div class="accordion-header ${isExpanded ? 'expanded' : ''}">
          <ha-icon icon="mdi:drag" class="drag-handle"></ha-icon>
          <ha-icon icon="${meta.icon}" class="item-icon"></ha-icon>
          <span class="item-label">${meta.label}</span>
          <ha-icon
            icon="${isVisible ? 'mdi:eye' : 'mdi:eye-off'}"
            class="visibility-toggle ${isVisible ? 'visible' : 'hidden'}"
            @click=${(e: Event) => {
              e.stopPropagation();
              toggleVisibility(itemId);
            }}
          ></ha-icon>
          <ha-icon
            icon="mdi:chevron-${isExpanded ? 'up' : 'down'}"
            class="expand-toggle"
            @click=${toggleExpand}
          ></ha-icon>
        </div>

        ${isExpanded
          ? html`
              <div class="accordion-content">
                <!-- Size Control -->
                <div class="control-row">
                  ${context.renderSliderField(
                    'Size',
                    '',
                    (weatherModule[sizeKey] as number) || (column === 'left' ? 14 : 16),
                    column === 'left' ? 14 : 16,
                    0,
                    128,
                    1,
                    (value: number) => updateModule({ [sizeKey]: value } as any),
                    'px'
                  )}
                </div>

                <!-- Color Control -->
                <div class="control-row">
                  <div class="control-label">Color</div>
                  <ultra-color-picker
                    .value="${weatherModule[colorKey] || 'var(--primary-text-color)'}"
                    .hass="${hass}"
                    @value-changed=${(e: CustomEvent) => {
                      updateModule({ [colorKey]: e.detail.value } as any);
                      setTimeout(() => context.triggerPreviewUpdate(), 50);
                    }}
                  ></ultra-color-picker>
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  };

  return html`
    ${context.injectUcFormStyles()}
    <style>
      ${BaseUltraModule.getSliderStyles()}
      .weather-editor-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 16px;
      }

      .entity-config-section {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 16px;
      }

      .section-title {
        font-size: 18px;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--primary-color);
        margin-bottom: 16px;
        letter-spacing: 0.5px;
      }

      .section-description {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 16px;
        line-height: 1.4;
      }

      .columns-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-top: 24px;
      }

      .column {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 16px;
        min-height: 200px;
      }

      .column-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-color);
        margin-bottom: 12px;
        text-transform: uppercase;
      }

      .accordion-item {
        background: var(--primary-background-color);
        border-radius: 6px;
        margin-bottom: 8px;
        cursor: move;
        border: 2px solid transparent;
        transition: all 0.2s;
      }

      .accordion-item.drop-zone-active {
        border-color: var(--primary-color);
        background: var(--primary-color);
        opacity: 0.3;
      }

      .accordion-header {
        display: flex;
        align-items: center;
        padding: 12px;
        gap: 8px;
        cursor: pointer;
      }

      .drag-handle {
        --mdc-icon-size: 20px;
        color: var(--secondary-text-color);
        cursor: grab;
      }

      .drag-handle:active {
        cursor: grabbing;
      }

      .item-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      .item-label {
        flex: 1;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .visibility-toggle {
        --mdc-icon-size: 20px;
        cursor: pointer;
        transition: color 0.2s;
      }

      .visibility-toggle.visible {
        color: var(--primary-color);
      }

      .visibility-toggle.hidden {
        color: var(--disabled-text-color);
      }

      .expand-toggle {
        --mdc-icon-size: 20px;
        color: var(--secondary-text-color);
        transition: transform 0.2s;
      }

      .accordion-header.expanded .expand-toggle {
        transform: rotate(180deg);
      }

      .accordion-content {
        padding: 0 12px 12px 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .control-row {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .control-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }

      @media (max-width: 768px) {
        .columns-container {
          grid-template-columns: 1fr;
        }
      }
    </style>

    <div class="weather-editor-container">
      <!-- Entity Configuration -->
      <div class="entity-config-section">
        <div class="section-title">Weather Entity</div>
        ${context.renderUcForm(
          hass,
          { weather_entity: weatherModule.weather_entity || '' },
          [context.entityField('weather_entity', ['weather'])],
          (e: CustomEvent) => updateModule(e.detail.value),
          false
        )}
      </div>

      <!-- General Settings -->
      <div class="entity-config-section">
        <div class="section-title">Layout Settings</div>
        
        <!-- Layout Spread -->
        ${context.renderSliderField(
          'Layout Spread',
          '0% Compact Centered ↔ 100% Full-Width Spread',
          weatherModule.layout_spread ?? 100,
          100,
          0,
          100,
          1,
          (value: number) => updateModule({ layout_spread: value }),
          '%'
        )}

        ${context.renderSliderField(
          'Left Column Vertical Gap',
          '0-32px',
          weatherModule.left_column_gap ?? 8,
          8,
          0,
          32,
          1,
          (value: number) => updateModule({ left_column_gap: value }),
          'px'
        )}

        ${context.renderSliderField(
          'Right Column Vertical Gap',
          '0-32px',
          weatherModule.right_column_gap ?? 8,
          8,
          0,
          32,
          1,
          (value: number) => updateModule({ right_column_gap: value }),
          'px'
        )}
      </div>

      <!-- Center Column Settings -->
      <div class="entity-config-section">
        <div class="section-title">Center Column (Weather Icon)</div>
        
        ${context.renderSliderField(
          'Icon Size',
          '0-300px',
          weatherModule.main_icon_size || 120,
          120,
          0,
          300,
          10,
          (value: number) => updateModule({ main_icon_size: value }),
          'px'
        )}

        <div class="control-row">
          <div class="control-label">Icon Style</div>
          ${context.renderUcForm(
            hass,
            { icon_style: weatherModule.icon_style || 'fill' },
            [
              context.selectField('icon_style', [
                { value: 'fill', label: 'Filled' },
                { value: 'line', label: 'Outlined' },
              ]),
            ],
            (e: CustomEvent) => {
              const next = e.detail.value.icon_style;
              const prev = weatherModule.icon_style;
              if (next === prev) return;
              updateModule(e.detail.value);
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            },
            false
          )}
        </div>
      </div>

      <!-- Column Layout Editor -->
      <div class="entity-config-section" style="padding-bottom: 0;">
        <div class="section-title">Drag & Drop Column Items</div>
        <div class="section-description">
          Drag items to reorder them within or between columns. Click the eye icon to toggle visibility. Click the chevron to expand item settings.
        </div>
      </div>

      <div class="columns-container">
        <!-- Left Column -->
        <div class="column">
          <div class="column-title">Left Column</div>
          ${leftOrder.map((itemId, index) => renderAccordionItem(itemId, 'left', index))}
        </div>

        <!-- Right Column -->
        <div class="column">
          <div class="column-title">Right Column</div>
          ${rightOrder.map((itemId, index) => renderAccordionItem(itemId, 'right', index))}
        </div>
      </div>
    </div>
  `;
}
