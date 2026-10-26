import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

/**
 * `<uc-slide-confirm>` — "slide to unlock" control.
 *
 * Drag the knob to the end of the track to fire `confirmed`. Letting go earlier
 * springs it back, so a stray tap can't trigger the action. Keyboard users can
 * focus the knob and press Enter or the right arrow.
 */
@customElement('uc-slide-confirm')
export class UcSlideConfirm extends LitElement {
  @property({ type: String }) label = '';
  @property({ type: String }) icon = 'mdi:lock';
  /** Icon shown once the knob is far enough to confirm (e.g. an open lock). */
  @property({ type: String, attribute: 'done-icon' }) doneIcon = '';
  @property({ type: Boolean, reflect: true }) disabled = false;

  @state() private _offset = 0;
  @state() private _dragging = false;

  private _startX = 0;
  private _max = 0;
  private _pointerId: number | null = null;

  static override styles = css`
    :host {
      display: block;
      width: 100%;
      --uc-slide-height: 48px;
    }
    .track {
      position: relative;
      height: var(--uc-slide-height);
      border-radius: 999px;
      background: color-mix(in srgb, var(--primary-color) 14%, var(--secondary-background-color, #2a2a2a));
      border: 1px solid color-mix(in srgb, var(--primary-color) 30%, transparent);
      overflow: hidden;
      user-select: none;
      -webkit-user-select: none;
      touch-action: pan-y;
    }
    .fill {
      position: absolute;
      inset: 0 auto 0 0;
      border-radius: 999px;
      background: color-mix(in srgb, var(--primary-color) 30%, transparent);
      pointer-events: none;
    }
    .label {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-left: var(--uc-slide-height);
      font-size: 14px;
      font-weight: 600;
      color: var(--primary-text-color);
      opacity: 0.8;
      pointer-events: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .knob {
      position: absolute;
      top: 3px;
      left: 3px;
      width: calc(var(--uc-slide-height) - 8px);
      height: calc(var(--uc-slide-height) - 8px);
      border-radius: 50%;
      border: none;
      padding: 0;
      display: grid;
      place-items: center;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      cursor: grab;
      touch-action: none;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      --mdc-icon-size: 22px;
    }
    .knob ha-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--mdc-icon-size);
      height: var(--mdc-icon-size);
      line-height: 0;
    }
    .knob:not(.dragging) {
      transition: transform 0.25s ease;
    }
    .knob.dragging {
      cursor: grabbing;
    }
    .knob:focus-visible {
      outline: 2px solid var(--primary-text-color);
      outline-offset: 2px;
    }
    :host([disabled]) .track {
      opacity: 0.5;
    }
    :host([disabled]) .knob {
      cursor: default;
    }
  `;

  private _onDown(e: PointerEvent): void {
    e.stopPropagation();
    if (this.disabled) return;
    const track = this.shadowRoot?.querySelector('.track') as HTMLElement | null;
    const knob = e.currentTarget as HTMLElement;
    if (!track) return;
    this._max = Math.max(0, track.clientWidth - knob.offsetWidth - 6);
    this._startX = e.clientX - this._offset;
    this._pointerId = e.pointerId;
    knob.setPointerCapture(e.pointerId);
    this._dragging = true;
  }

  private _onMove(e: PointerEvent): void {
    if (!this._dragging || e.pointerId !== this._pointerId) return;
    e.stopPropagation();
    this._offset = Math.max(0, Math.min(this._max, e.clientX - this._startX));
  }

  private _onUp(e: PointerEvent): void {
    if (!this._dragging || e.pointerId !== this._pointerId) return;
    e.stopPropagation();
    this._dragging = false;
    this._pointerId = null;
    if (this._max > 0 && this._offset >= this._max * 0.9) {
      this._offset = this._max;
      this._confirm();
    }
    this._offset = 0;
  }

  private _onKey(e: KeyboardEvent): void {
    if (this.disabled) return;
    if (e.key === 'Enter' || e.key === 'ArrowRight') {
      e.preventDefault();
      this._confirm();
    }
  }

  private _confirm(): void {
    this.dispatchEvent(new CustomEvent('confirmed', { bubbles: true, composed: true }));
  }

  override render() {
    const knobWidth = 40;
    const atEnd = this._max > 0 && this._offset >= this._max * 0.9;
    const icon = atEnd && this.doneIcon ? this.doneIcon : this.icon;
    return html`
      <div class="track">
        <div class="fill" style="width:${this._offset + knobWidth + 6}px;"></div>
        <div class="label">${this.label}</div>
        <button
          type="button"
          class="knob ${this._dragging ? 'dragging' : ''}"
          role="slider"
          aria-label=${this.label}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow=${this._max ? Math.round((this._offset / this._max) * 100) : 0}
          aria-disabled=${this.disabled ? 'true' : 'false'}
          style="transform: translateX(${this._offset}px);"
          @pointerdown=${this._onDown}
          @pointermove=${this._onMove}
          @pointerup=${this._onUp}
          @pointercancel=${this._onUp}
          @click=${(e: Event) => e.stopPropagation()}
          @keydown=${this._onKey}
        >
          <ha-icon icon=${icon}></ha-icon>
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-slide-confirm': UcSlideConfirm;
  }
}
