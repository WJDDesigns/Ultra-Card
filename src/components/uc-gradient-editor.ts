import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import './ultra-color-picker';

export interface GradientStop {
  id: string;
  position: number;
  color: string;
}

// Smart color interpolation between two colors
function interpolateColor(color1: string, color2: string, factor: number): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return color1;

  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);

  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Generate gradient CSS string from stops
export function generateGradientString(stops: GradientStop[]): string {
  if (!stops || stops.length === 0) return '';

  const sortedStops = [...stops].sort((a, b) => a.position - b.position);
  return sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
}

// Create default gradient stops (red to yellow to green)
export function createDefaultGradientStops(): GradientStop[] {
  return [
    { id: '1', position: 0, color: '#ff0000' }, // Red at 0%
    { id: '2', position: 50, color: '#ffff00' }, // Yellow at 50%
    { id: '3', position: 100, color: '#00ff00' }, // Green at 100%
  ];
}

let stopIdCounter = 4; // Start from 4 since 1, 2, 3 are defaults

export function createStopAtLargestGap(stops: GradientStop[]): GradientStop {
  if (!stops || stops.length < 2) {
    return { id: `stop-${stopIdCounter++}`, position: 50, color: '#808080' };
  }

  const sortedStops = [...stops].sort((a, b) => a.position - b.position);

  let largestGap = 0;
  let insertPosition = 50;
  let insertColor = '#808080';

  for (let i = 0; i < sortedStops.length - 1; i++) {
    const gap = sortedStops[i + 1].position - sortedStops[i].position;
    if (gap > largestGap) {
      largestGap = gap;
      insertPosition = sortedStops[i].position + gap / 2;
      insertColor = interpolateColor(sortedStops[i].color, sortedStops[i + 1].color, 0.5);
    }
  }

  return {
    id: `stop-${stopIdCounter++}`,
    position: Math.round(insertPosition),
    color: insertColor,
  };
}

@customElement('uc-gradient-editor')
export class UCGradientEditor extends LitElement {
  @property({ type: Array }) stops: GradientStop[] = createDefaultGradientStops();
  @property({ type: String }) barSize: 'thin' | 'regular' | 'thick' | 'thiccc' = 'regular';
  @property({ type: String }) barRadius: 'round' | 'square' | 'rounded-square' = 'round';
  @property({ type: String }) barStyle: string = 'flat';
  @state() private _draggedIndex: number | null = null;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      font-family: var(--mdc-typography-body1-font-family, Roboto, sans-serif);
    }

    .gradient-preview {
      width: 100%;
      height: 16px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      margin-bottom: 16px;
      position: relative;
      overflow: hidden;
      background-color: var(--card-background-color, #1c1c1c);
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .gradient-preview-fill {
      width: 100%;
      height: 100%;
      border-radius: inherit;
      position: relative;
    }

    /* Bar size variants to match actual card bars */
    .gradient-preview.bar-size-thin {
      height: 8px;
      border-radius: 4px;
    }

    .gradient-preview.bar-size-regular {
      height: 16px;
      border-radius: 8px;
    }

    .gradient-preview.bar-size-thick {
      height: 24px;
      border-radius: 12px;
    }

    .gradient-preview.bar-size-thiccc {
      height: 32px;
      border-radius: 16px;
    }

    /* Bar radius variants to match actual card bars */
    .gradient-preview.bar-radius-square {
      border-radius: 0;
    }

    .gradient-preview.bar-radius-round {
      /* Uses default border-radius from size classes */
    }

    .gradient-preview.bar-radius-rounded-square.bar-size-thin {
      border-radius: 2px;
    }

    .gradient-preview.bar-radius-rounded-square.bar-size-regular {
      border-radius: 4px;
    }

    .gradient-preview.bar-radius-rounded-square.bar-size-thick {
      border-radius: 6px;
    }

    .gradient-preview.bar-radius-rounded-square.bar-size-thiccc {
      border-radius: 8px;
    }

    .buttons-row {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }

    .add-button,
    .reset-button {
      flex: 1;
      padding: 12px 16px;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .add-button {
      background: var(--primary-color);
      color: var(--text-primary-color);
    }

    .add-button:hover {
      background: var(--primary-color);
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .reset-button {
      background: var(--secondary-color, #666);
      color: white;
    }

    .reset-button:hover {
      background: var(--secondary-color, #666);
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .stops-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .stop-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--card-background-color, #1c1c1c);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .stop-item:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .stop-item.dragging {
      opacity: 0.7;
      transform: scale(1.02);
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .drag-handle {
      width: 20px;
      height: 20px;
      cursor: grab;
      color: var(--secondary-text-color);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .drag-handle:hover {
      color: var(--primary-text-color);
    }

    .drag-handle:active {
      cursor: grabbing;
    }

    .color-preview {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid var(--divider-color);
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }

    .color-preview:hover {
      border-color: var(--primary-color);
      transform: scale(1.1);
    }

    .percentage-input {
      width: 80px;
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      text-align: center;
      font-weight: 500;
    }

    .percentage-input:focus {
      border-color: var(--primary-color);
      outline: none;
      box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
    }

    .stop-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--secondary-text-color);
      font-size: 14px;
    }

    .delete-button {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--secondary-text-color);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .delete-button:hover {
      background: rgba(var(--rgb-error-color, 244, 67, 54), 0.1);
      color: var(--error-color, #f44336);
    }

    .delete-button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .stop-item.boundary .delete-button {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .icon {
      width: 18px;
      height: 18px;
    }

    /* Drag and drop styling */
    .stops-list.drag-active .stop-item:not(.dragging) {
      transition: transform 0.2s ease;
    }
  `;

  render(): TemplateResult {
    const sortedStops = [...this.stops].sort((a, b) => a.position - b.position);
    const gradientString = generateGradientString(sortedStops);

    return html`
      <!-- Gradient Preview -->
      <div
        class="gradient-preview bar-size-${this.barSize} bar-radius-${this
          .barRadius} bar-style-${this.barStyle}"
      >
        <div
          class="gradient-preview-fill bar-style-${this.barStyle}"
          style="background: linear-gradient(to right, ${gradientString})"
        ></div>
      </div>

      <!-- Action Buttons -->
      <div class="buttons-row">
        <button class="add-button" @click=${this._addStop}>
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Add Stop
        </button>
        <button class="reset-button" @click=${this._resetStops}>
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
            />
          </svg>
          Reset
        </button>
      </div>

      <!-- Gradient Stops List -->
      <div class="stops-list ${this._draggedIndex !== null ? 'drag-active' : ''}">
        ${repeat(
          sortedStops,
          stop => stop.id,
          (stop, index) => this._renderStopItem(stop, index, sortedStops.length)
        )}
      </div>
    `;
  }

  private _renderStopItem(stop: GradientStop, index: number, totalStops: number): TemplateResult {
    const isBoundary = stop.position === 0 || stop.position === 100;
    const isDragging = this._draggedIndex === index;
    const canDelete = totalStops > 2 && !isBoundary;

    return html`
      <div
        class="stop-item ${isBoundary ? 'boundary' : ''} ${isDragging ? 'dragging' : ''}"
        draggable="true"
        @dragstart=${(e: DragEvent) => this._handleDragStart(e, index)}
        @dragend=${this._handleDragEnd}
        @dragover=${this._handleDragOver}
        @drop=${(e: DragEvent) => this._handleDrop(e, index)}
      >
        <!-- Drag Handle -->
        <div class="drag-handle">
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M9 3h2v2H9V3zm4 0h2v2h-2V3zM9 7h2v2H9V7zm4 0h2v2h-2V7zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2z"
            />
          </svg>
        </div>

        <!-- Color Preview & Picker -->
        <div class="color-preview" style="background-color: ${stop.color}">
          <ultra-color-picker
            .value=${stop.color}
            .defaultValue=${stop.color}
            .showResetButton=${false}
            style="width: 100%; height: 100%; border-radius: 50%; overflow: hidden;"
            @value-changed=${(e: CustomEvent) => this._handleColorChange(stop.id, e.detail.value)}
          ></ultra-color-picker>
        </div>

        <!-- Percentage Input -->
        <input
          type="number"
          class="percentage-input"
          .value=${stop.position.toString()}
          min="0"
          max="100"
          @input=${(e: Event) =>
            this._handlePositionChange(
              stop.id,
              parseFloat((e.target as HTMLInputElement).value) || 0
            )}
          @blur=${this._validateAndSortStops}
        />

        <!-- Stop Info -->
        <div class="stop-info">
          <span>${stop.position}%</span>
        </div>

        <!-- Delete Button -->
        <button
          class="delete-button"
          ?disabled=${!canDelete}
          @click=${() => this._deleteStop(stop.id)}
          title=${canDelete ? 'Delete stop' : 'Cannot delete boundary stops'}
        >
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
            />
          </svg>
        </button>
      </div>
    `;
  }

  private _addStop(): void {
    const newStop = createStopAtLargestGap(this.stops);
    this.stops = [...this.stops, newStop];
    this._notifyChange();
  }

  private _resetStops(): void {
    this.stops = createDefaultGradientStops();
    stopIdCounter = 4; // Reset counter
    this._notifyChange();
    this._dispatchResetEvent();
  }

  private _deleteStop(stopId: string): void {
    if (this.stops.length <= 2) return;

    const stopToDelete = this.stops.find(s => s.id === stopId);
    if (!stopToDelete || stopToDelete.position === 0 || stopToDelete.position === 100) return;

    this.stops = this.stops.filter(s => s.id !== stopId);
    this._notifyChange();
  }

  private _handleColorChange(stopId: string, newColor: string): void {
    this.stops = this.stops.map(stop => (stop.id === stopId ? { ...stop, color: newColor } : stop));
    this._notifyChange();
  }

  private _handlePositionChange(stopId: string, newPosition: number): void {
    // Clamp position between 0 and 100
    newPosition = Math.max(0, Math.min(100, newPosition));

    this.stops = this.stops.map(stop =>
      stop.id === stopId ? { ...stop, position: newPosition } : stop
    );
    this.requestUpdate(); // Update UI immediately
  }

  private _validateAndSortStops(): void {
    // Ensure boundary stops stay at 0 and 100
    this.stops = this.stops.map(stop => {
      if (stop.position === 0 || (stop.id === '1' && stop.position < 50)) {
        return { ...stop, position: 0 };
      }
      if (stop.position === 100 || (stop.id === '3' && stop.position > 50)) {
        return { ...stop, position: 100 };
      }
      return stop;
    });

    this._notifyChange();
  }

  private _notifyChange(): void {
    this.dispatchEvent(
      new CustomEvent('gradient-changed', {
        detail: { stops: this.stops },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _dispatchResetEvent(): void {
    this.dispatchEvent(
      new CustomEvent('gradient-stop-reset', {
        bubbles: true,
        composed: true,
      })
    );
  }

  // Drag and Drop functionality
  private _handleDragStart(e: DragEvent, index: number): void {
    this._draggedIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', index.toString());
    }
  }

  private _handleDragEnd(): void {
    this._draggedIndex = null;
  }

  private _handleDragOver(e: DragEvent): void {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  private _handleDrop(e: DragEvent, dropIndex: number): void {
    e.preventDefault();

    if (this._draggedIndex === null || this._draggedIndex === dropIndex) return;

    const sortedStops = [...this.stops].sort((a, b) => a.position - b.position);
    const draggedStop = sortedStops[this._draggedIndex];
    const targetStop = sortedStops[dropIndex];

    // Swap positions
    this.stops = this.stops.map(stop => {
      if (stop.id === draggedStop.id) {
        return { ...stop, position: targetStop.position };
      }
      if (stop.id === targetStop.id) {
        return { ...stop, position: draggedStop.position };
      }
      return stop;
    });

    this._draggedIndex = null;
    this._notifyChange();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-gradient-editor': UCGradientEditor;
  }
}
