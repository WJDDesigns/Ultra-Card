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

// Module-level state (survives re-renders during a drag)
const expandedAccordionState: Record<string, string | null> = {};
const _drag: {
  item: { itemId: string; fromColumn: 'left' | 'right'; fromIndex: number } | null;
  activeZone: HTMLElement | null;
} = { item: null, activeZone: null };

export function renderAnimatedWeatherModuleEditor(
  context: any,
  module: CardModule,
  hass: HomeAssistant,
  config: UltraCardConfig,
  updateModule: (updates: Partial<CardModule>) => void
): TemplateResult {
  const weatherModule = module as AnimatedWeatherModule;
  const lang = hass.locale?.language || 'en';

  // ─── Entity attribute availability ───────────────────────────────────────────

  const weatherEntity = weatherModule.weather_entity ? hass.states[weatherModule.weather_entity] : null;
  const hasPrecipitation = weatherEntity?.attributes?.precipitation != null;
  const hasPrecipitationProbability = weatherEntity?.attributes?.precipitation_probability != null;
  const hasWind =
    weatherEntity?.attributes?.wind_speed !== undefined ||
    weatherEntity?.attributes?.wind_bearing !== undefined;
  const hasPressure = weatherEntity?.attributes?.pressure != null;
  const hasVisibility = weatherEntity?.attributes?.visibility != null;

  const isItemAvailable = (itemId: string): boolean => {
    if (!WEATHER_ITEMS[itemId]) return false;
    if (itemId === 'precipitation' && !hasPrecipitation) return false;
    if (itemId === 'precipitation_probability' && !hasPrecipitationProbability) return false;
    if (itemId === 'wind' && !hasWind) return false;
    if (itemId === 'pressure' && !hasPressure) return false;
    if (itemId === 'visibility' && !hasVisibility) return false;
    return true;
  };

  // ─── Column ordering ──────────────────────────────────────────────────────────

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
    }
    return ['date', 'temperature', 'temp_range'];
  };

  // Filter to available items so indices are stable and predictable
  const leftOrder = (weatherModule.left_column_order || getDefaultOrder('left')).filter(isItemAvailable);
  const rightOrder = (weatherModule.right_column_order || getDefaultOrder('right')).filter(isItemAvailable);

  // ─── Accordion state ──────────────────────────────────────────────────────────

  const moduleId = weatherModule.id || 'default';
  const getExpanded = () => expandedAccordionState[moduleId] || null;
  const setExpanded = (id: string | null) => { expandedAccordionState[moduleId] = id; };

  // ─── Drag handlers ────────────────────────────────────────────────────────────

  const onDragStart = (e: DragEvent, itemId: string, column: 'left' | 'right', index: number) => {
    _drag.item = { itemId, fromColumn: column, fromIndex: index };
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', itemId);
    }
    // Delay so the drag ghost is captured before the opacity change
    requestAnimationFrame(() => (e.target as HTMLElement).classList.add('wm-dragging'));
  };

  const onDragEnd = (e: DragEvent) => {
    (e.target as HTMLElement).classList.remove('wm-dragging');
    _drag.item = null;
    if (_drag.activeZone) {
      _drag.activeZone.classList.remove('wm-drop-active');
      _drag.activeZone = null;
    }
  };

  // Drop zone event handlers
  const onZoneDragOver = (e: DragEvent) => {
    if (!_drag.item) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  };

  const onZoneDragEnter = (e: DragEvent) => {
    if (!_drag.item) return;
    e.preventDefault();
    const zone = e.currentTarget as HTMLElement;
    if (_drag.activeZone && _drag.activeZone !== zone) {
      _drag.activeZone.classList.remove('wm-drop-active');
    }
    _drag.activeZone = zone;
    zone.classList.add('wm-drop-active');
  };

  const onZoneDragLeave = (e: DragEvent) => {
    const zone = e.currentTarget as HTMLElement;
    const related = e.relatedTarget as Node | null;
    // Only deactivate when truly leaving (not bubbling from a child element)
    if (!related || !zone.contains(related)) {
      zone.classList.remove('wm-drop-active');
      if (_drag.activeZone === zone) _drag.activeZone = null;
    }
  };

  const onZoneDrop = (e: DragEvent, targetColumn: 'left' | 'right', targetIndex: number) => {
    e.preventDefault();
    const zone = e.currentTarget as HTMLElement;
    zone.classList.remove('wm-drop-active');
    if (_drag.activeZone === zone) _drag.activeZone = null;

    const ds = _drag.item;
    if (!ds) return;
    _drag.item = null;

    const { itemId, fromColumn, fromIndex } = ds;
    const newLeft = [...leftOrder];
    const newRight = [...rightOrder];

    // Remove from source column
    if (fromColumn === 'left') newLeft.splice(fromIndex, 1);
    else newRight.splice(fromIndex, 1);

    // Adjust insert index when moving forward within the same column:
    // removal shifts every subsequent slot one earlier.
    let insertAt = targetIndex;
    if (fromColumn === targetColumn && fromIndex < targetIndex) {
      insertAt = targetIndex - 1;
    }

    // Insert into target column
    if (targetColumn === 'left') newLeft.splice(insertAt, 0, itemId);
    else newRight.splice(insertAt, 0, itemId);

    // Skip if nothing changed
    if (newLeft.join(',') === leftOrder.join(',') && newRight.join(',') === rightOrder.join(',')) return;

    updateModule({ left_column_order: newLeft, right_column_order: newRight });
    setTimeout(() => context.triggerPreviewUpdate(), 50);
  };

  // ─── Render helpers ───────────────────────────────────────────────────────────

  /**
   * A thin strip between items that grows into a vivid insert-line during drag.
   * pointer-events: none on children prevents dragLeave from firing when the
   * cursor moves over the inner indicator div.
   */
  const renderDropZone = (column: 'left' | 'right', insertIndex: number, isEmpty = false) => html`
    <div
      class="wm-drop-zone${isEmpty ? ' wm-drop-zone-empty' : ''}"
      @dragover=${onZoneDragOver}
      @dragenter=${onZoneDragEnter}
      @dragleave=${onZoneDragLeave}
      @drop=${(e: DragEvent) => onZoneDrop(e, column, insertIndex)}
    >
      <div class="wm-drop-line"></div>
      ${isEmpty ? html`<span class="wm-drop-hint">Drop here</span>` : ''}
    </div>
  `;

  const renderAccordionItem = (itemId: string, column: 'left' | 'right', index: number) => {
    const meta = WEATHER_ITEMS[itemId];
    if (!meta) return html``;

    const showKey  = `show_${itemId}`  as keyof AnimatedWeatherModule;
    const sizeKey  = `${itemId}_size`  as keyof AnimatedWeatherModule;
    const colorKey = `${itemId}_color` as keyof AnimatedWeatherModule;

    const isVisible  = weatherModule[showKey] !== false;
    const isExpanded = getExpanded() === itemId;

    const toggleExpand = (e: Event) => {
      e.stopPropagation();
      setExpanded(getExpanded() === itemId ? null : itemId);
      updateModule({});
    };

    return html`
      <div
        class="wm-item"
        draggable="true"
        @dragstart=${(e: DragEvent) => onDragStart(e, itemId, column, index)}
        @dragend=${onDragEnd}
      >
        <div class="wm-item-header ${isExpanded ? 'expanded' : ''}">
          <ha-icon icon="mdi:drag" class="wm-drag-handle"></ha-icon>
          <ha-icon icon="${meta.icon}" class="wm-item-icon"></ha-icon>
          <span class="wm-item-label">${meta.label}</span>
          <ha-icon
            icon="${isVisible ? 'mdi:eye' : 'mdi:eye-off'}"
            class="wm-visibility ${isVisible ? 'on' : 'off'}"
            @click=${(e: Event) => {
              e.stopPropagation();
              updateModule({ [showKey]: isVisible ? false : true } as any);
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}
          ></ha-icon>
          <ha-icon
            icon="mdi:chevron-${isExpanded ? 'up' : 'down'}"
            class="wm-chevron"
            @click=${toggleExpand}
          ></ha-icon>
        </div>

        ${isExpanded ? html`
          <div class="wm-item-content">
            ${context.renderSliderField(
              localize('editor.animated_weather.item_size', lang, 'Size'), '',
              (weatherModule[sizeKey] as number) ?? (column === 'left' ? 14 : 16),
              column === 'left' ? 14 : 16,
              0, 128, 1,
              (v: number) => { updateModule({ [sizeKey]: v } as any); },
              'px'
            )}
            <div class="wm-color-row">
              <div class="wm-color-label">${localize('editor.animated_weather.item_color', lang, 'Color')}</div>
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
        ` : ''}
      </div>
    `;
  };

  const renderColumn = (title: string, column: 'left' | 'right', order: string[]) => html`
    <div class="wm-column">
      <div class="wm-column-title">${title}</div>
      ${order.length === 0
        ? renderDropZone(column, 0, true)
        : html`
            ${renderDropZone(column, 0)}
            ${order.map((itemId, index) => html`
              ${renderAccordionItem(itemId, column, index)}
              ${renderDropZone(column, index + 1)}
            `)}
          `
      }
    </div>
  `;

  // ─── Template ─────────────────────────────────────────────────────────────────

  return html`
    ${context.injectUcFormStyles()}
    <style>
      ${BaseUltraModule.getSliderStyles()}

      .wm-editor {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 16px;
      }

      .wm-section {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 16px;
      }

      .wm-section-title {
        font-size: 18px;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--primary-color);
        margin-bottom: 16px;
        letter-spacing: 0.5px;
      }

      .wm-section-desc {
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.4;
        margin-bottom: 0;
      }

      /* ── Two-column grid ─────────────────────── */

      .wm-columns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-top: 24px;
      }

      .wm-column {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 16px;
        min-height: 180px;
      }

      .wm-column-title {
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--primary-color);
        letter-spacing: 0.5px;
        margin-bottom: 8px;
      }

      /* ── Draggable items ─────────────────────── */

      .wm-item {
        background: var(--primary-background-color);
        border-radius: 6px;
        border: 1px solid transparent;
        transition: opacity 0.15s, transform 0.15s, border-color 0.15s;
        cursor: grab;
        user-select: none;
      }

      .wm-item:active { cursor: grabbing; }

      /* Applied one rAF after dragstart so the drag ghost looks normal */
      .wm-item.wm-dragging {
        opacity: 0.3;
        transform: scale(0.97);
        border-color: var(--primary-color);
      }

      .wm-item-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        cursor: pointer;
      }

      .wm-drag-handle {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
        cursor: grab;
        flex-shrink: 0;
      }

      .wm-item-icon {
        --mdc-icon-size: 18px;
        color: var(--primary-color);
        flex-shrink: 0;
      }

      .wm-item-label {
        flex: 1;
        font-size: 13px;
        font-weight: 500;
        color: var(--primary-text-color);
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .wm-visibility {
        --mdc-icon-size: 18px;
        cursor: pointer;
        flex-shrink: 0;
        transition: color 0.15s;
      }
      .wm-visibility.on  { color: var(--primary-color); }
      .wm-visibility.off { color: var(--disabled-text-color, #888); }

      .wm-chevron {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
        flex-shrink: 0;
        transition: transform 0.2s;
      }

      .wm-item-header.expanded .wm-chevron {
        transform: rotate(180deg);
      }

      .wm-item-content {
        padding: 0 12px 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        border-top: 1px solid var(--divider-color);
      }

      .wm-color-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .wm-color-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }

      /* ── Drop zones ──────────────────────────── */

      /*
       * Each zone is a small invisible strip between items.
       * .wm-drop-line is the visual indicator — pointer-events:none
       * so moving the cursor onto it doesn't trigger dragleave on the parent.
       */

      .wm-drop-zone {
        height: 10px;
        position: relative;
        border-radius: 4px;
        /* A slightly expanded hit area makes it easier to target */
        margin: -1px 0;
        z-index: 1;
      }

      .wm-drop-line {
        pointer-events: none;
        position: absolute;
        inset: 0;
        top: 50%;
        left: 8px;
        right: 8px;
        height: 2px;
        transform: translateY(-50%);
        border-radius: 2px;
        background: transparent;
        transition: background 0.1s, box-shadow 0.1s, height 0.1s;
      }

      /* Active: grow the zone and show the colored insert line */
      .wm-drop-zone.wm-drop-active {
        height: 36px;
      }

      .wm-drop-zone.wm-drop-active .wm-drop-line {
        background: var(--primary-color);
        height: 3px;
        box-shadow:
          0 0 0 3px rgba(var(--rgb-primary-color, 3, 169, 244), 0.18),
          0 0 10px rgba(var(--rgb-primary-color, 3, 169, 244), 0.35);
      }

      /* Caret dots at each end of the line */
      .wm-drop-zone.wm-drop-active .wm-drop-line::before,
      .wm-drop-zone.wm-drop-active .wm-drop-line::after {
        content: '';
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--primary-color);
      }
      .wm-drop-zone.wm-drop-active .wm-drop-line::before { left: -4px; }
      .wm-drop-zone.wm-drop-active .wm-drop-line::after  { right: -4px; }

      /* Empty column drop target */
      .wm-drop-zone-empty {
        height: 72px !important;
        border: 2px dashed var(--divider-color);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: border-color 0.15s, background 0.15s;
      }

      .wm-drop-zone-empty .wm-drop-line {
        display: none;
      }

      .wm-drop-hint {
        pointer-events: none;
        font-size: 12px;
        color: var(--secondary-text-color);
        transition: color 0.15s;
      }

      .wm-drop-zone-empty.wm-drop-active {
        border-color: var(--primary-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.07);
      }

      .wm-drop-zone-empty.wm-drop-active .wm-drop-hint {
        color: var(--primary-color);
        font-weight: 600;
      }

      /* ── Layout ──────────────────────────────── */

      .wm-control-row {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .wm-control-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }

      @media (max-width: 600px) {
        .wm-columns { grid-template-columns: 1fr; }
      }
    </style>

    <div class="wm-editor">

      <!-- Weather Entity -->
      <div class="wm-section">
        <div class="wm-section-title">${localize('editor.animated_weather.entity_section', lang, 'Weather Entity')}</div>
        ${context.renderEntityPickerWithVariables(
          hass, config, 'weather_entity', weatherModule.weather_entity || '',
          (value: string) => { updateModule({ weather_entity: value }); context.triggerPreviewUpdate(); },
          ['weather'],
          localize('editor.animated_weather.entity', lang, 'Weather Entity')
        )}
        <div class="field-description" style="font-size: 13px !important; font-weight: 400 !important; margin-top: 4px; color: var(--secondary-text-color);">
          ${localize('editor.animated_weather.entity_desc', lang, 'Select a weather entity to drive the animated background and forecast display.')}
        </div>
      </div>

      <!-- Layout Settings -->
      <div class="wm-section">
        <div class="wm-section-title">${localize('editor.animated_weather.layout_section', lang, 'Layout Settings')}</div>

        ${context.renderSliderField(
          localize('editor.animated_weather.layout_spread', lang, 'Layout Spread'),
          localize('editor.animated_weather.layout_spread_desc', lang, '0% Compact ↔ 100% Full-Width'),
          weatherModule.layout_spread ?? 100, 100,
          0, 100, 1,
          (v: number) => updateModule({ layout_spread: v }),
          '%'
        )}
        ${context.renderSliderField(
          localize('editor.animated_weather.left_column_gap', lang, 'Left Column Gap'),
          localize('editor.animated_weather.left_column_gap_desc', lang, '0–32px'),
          weatherModule.left_column_gap ?? 8, 8,
          0, 32, 1,
          (v: number) => updateModule({ left_column_gap: v }),
          'px'
        )}
        ${context.renderSliderField(
          localize('editor.animated_weather.right_column_gap', lang, 'Right Column Gap'),
          localize('editor.animated_weather.right_column_gap_desc', lang, '0–32px'),
          weatherModule.right_column_gap ?? 8, 8,
          0, 32, 1,
          (v: number) => updateModule({ right_column_gap: v }),
          'px'
        )}
      </div>

      <!-- Center Column (Weather Icon) -->
      <div class="wm-section">
        <div class="wm-section-title">${localize('editor.animated_weather.icon_section', lang, 'Center Column (Weather Icon)')}</div>

        ${context.renderSliderField(
          localize('editor.animated_weather.icon_size', lang, 'Icon Size'),
          localize('editor.animated_weather.icon_size_desc', lang, '0–300px'),
          weatherModule.main_icon_size ?? 120, 120,
          0, 300, 10,
          (v: number) => updateModule({ main_icon_size: v }),
          'px'
        )}

        <div class="wm-control-row">
          <div class="wm-control-label">${localize('editor.animated_weather.icon_style', lang, 'Icon Style')}</div>
          ${context.renderUcForm(
            hass,
            { icon_style: weatherModule.icon_style || 'fill' },
            [context.selectField('icon_style', [
              { value: 'fill', label: localize('editor.animated_weather.icon_style_filled', lang, 'Filled') },
              { value: 'line', label: localize('editor.animated_weather.icon_style_outlined', lang, 'Outlined') },
            ])],
            (e: CustomEvent) => {
              if (e.detail.value.icon_style === weatherModule.icon_style) return;
              updateModule(e.detail.value);
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            },
            false
          )}
        </div>
      </div>

      <!-- Drag & Drop header -->
      <div class="wm-section" style="padding-bottom: 0;">
        <div class="wm-section-title">${localize('editor.animated_weather.column_items_section', lang, 'Column Items')}</div>
        <div class="wm-section-desc">
          ${localize('editor.animated_weather.column_items_desc', lang, 'Drag items to reorder within or between columns — a blue line shows exactly where the item will land. Click the eye to toggle visibility, the chevron to edit size & color.')}
        </div>
      </div>

      <!-- Drag & Drop columns -->
      <div class="wm-columns">
        ${renderColumn(localize('editor.animated_weather.left_column', lang, 'Left Column'),  'left',  leftOrder)}
        ${renderColumn(localize('editor.animated_weather.right_column', lang, 'Right Column'), 'right', rightOrder)}
      </div>

    </div>
  `;
}
