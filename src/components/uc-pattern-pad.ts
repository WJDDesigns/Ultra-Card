import { LitElement, html, css, svg, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

/** Dot centres in the 300x300 viewBox, numbered 1-9 left to right, top to bottom. */
const DOTS: Array<[number, number]> = [50, 150, 250].flatMap(y =>
  [50, 150, 250].map(x => [x, y] as [number, number])
);
const HIT_RADIUS = 42;

/** Dot passed over when jumping straight between two dots (1 to 3 crosses 2), like Android. */
export function middleDot(a: number, b: number): number | null {
  const [ax, ay] = DOTS[a - 1];
  const [bx, by] = DOTS[b - 1];
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const i = DOTS.findIndex(([x, y]) => x === mx && y === my);
  return i >= 0 ? i + 1 : null;
}

/**
 * `<uc-pattern-pad>` — 3x3 "draw a pattern" grid.
 *
 * Fires `pattern-complete` with `{ pattern }` (dot numbers 1-9 as a string, e.g. "14789")
 * when the finger or mouse lets go. Set `pattern` to show a fixed pattern, and `status`
 * to colour it as right or wrong.
 */
@customElement('uc-pattern-pad')
export class UcPatternPad extends LitElement {
  /** Pattern to show while nobody is drawing. */
  @property({ type: String }) pattern = '';
  @property({ type: String }) status: '' | 'ok' | 'error' = '';
  @property({ type: Boolean, reflect: true }) disabled = false;

  @state() private _path: number[] = [];
  @state() private _pointer: [number, number] | null = null;

  private _pointerId: number | null = null;

  static override styles = css`
    :host {
      display: block;
      width: 100%;
      max-width: 260px;
      margin: 0 auto;
      --uc-pattern-color: var(--primary-color);
    }
    :host([disabled]) {
      opacity: 0.5;
      pointer-events: none;
    }
    svg {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 1;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
      cursor: pointer;
    }
    .dot {
      fill: var(--secondary-text-color);
      opacity: 0.55;
    }
    .dot.on {
      fill: var(--uc-pattern-color);
      opacity: 1;
    }
    .ring {
      fill: color-mix(in srgb, var(--uc-pattern-color) 20%, transparent);
    }
    .line {
      fill: none;
      stroke: var(--uc-pattern-color);
      stroke-width: 8;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0.8;
    }
    :host([data-status='error']) {
      --uc-pattern-color: var(--error-color, #db4437);
    }
    :host([data-status='ok']) {
      --uc-pattern-color: var(--success-color, #43a047);
    }
  `;

  /** Clears whatever was drawn. */
  clear(): void {
    this._path = [];
    this._pointer = null;
  }

  protected override updated(): void {
    if (this.status) this.setAttribute('data-status', this.status);
    else this.removeAttribute('data-status');
  }

  private _toViewBox(e: PointerEvent): [number, number] {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    return [((e.clientX - rect.left) / rect.width) * 300, ((e.clientY - rect.top) / rect.height) * 300];
  }

  private _hit([px, py]: [number, number]): void {
    const i = DOTS.findIndex(([x, y]) => Math.hypot(px - x, py - y) <= HIT_RADIUS);
    if (i < 0) return;
    const dot = i + 1;
    if (this._path.includes(dot)) return;
    const next = [...this._path];
    const last = next[next.length - 1];
    if (last) {
      const mid = middleDot(last, dot);
      if (mid && !next.includes(mid)) next.push(mid);
    }
    next.push(dot);
    this._path = next;
  }

  private _onDown(e: PointerEvent): void {
    if (this.disabled || this._pointerId !== null) return;
    e.preventDefault();
    this._pointerId = e.pointerId;
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    this.status = '';
    this._path = [];
    const p = this._toViewBox(e);
    this._pointer = p;
    this._hit(p);
  }

  private _onMove(e: PointerEvent): void {
    if (e.pointerId !== this._pointerId) return;
    const p = this._toViewBox(e);
    this._pointer = p;
    this._hit(p);
  }

  private _onUp(e: PointerEvent): void {
    if (e.pointerId !== this._pointerId) return;
    this._pointerId = null;
    this._pointer = null;
    if (this._path.length === 0) return;
    this.dispatchEvent(
      new CustomEvent('pattern-complete', {
        detail: { pattern: this._path.join('') },
        bubbles: true,
        composed: true,
      })
    );
  }

  override render() {
    const drawing = this._pointerId !== null || this._path.length > 0;
    const path = drawing
      ? this._path
      : this.pattern
          .split('')
          .map(Number)
          .filter(n => n >= 1 && n <= 9);
    const points = path.map(n => DOTS[n - 1].join(',')).join(' ');
    const last = path.length ? DOTS[path[path.length - 1] - 1] : null;

    return html`
      <svg
        viewBox="0 0 300 300"
        role="img"
        aria-label="Pattern"
        @pointerdown=${this._onDown}
        @pointermove=${this._onMove}
        @pointerup=${this._onUp}
        @pointercancel=${this._onUp}
      >
        ${path.length > 1 ? svg`<polyline class="line" points=${points}></polyline>` : nothing}
        ${last && this._pointer
          ? svg`<line class="line" x1=${last[0]} y1=${last[1]} x2=${this._pointer[0]} y2=${this._pointer[1]}></line>`
          : nothing}
        ${DOTS.map(([x, y], i) => {
          const on = path.includes(i + 1);
          return svg`
            ${on ? svg`<circle class="ring" cx=${x} cy=${y} r="28"></circle>` : nothing}
            <circle class="dot ${on ? 'on' : ''}" cx=${x} cy=${y} r=${on ? 12 : 9}></circle>
          `;
        })}
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-pattern-pad': UcPatternPad;
  }
}
