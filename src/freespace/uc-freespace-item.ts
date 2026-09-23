/**
 * FreeSpace card wrapper: positions a hui-card and paints native-feeling edit chrome.
 */

import { LitElement, html, css, nothing, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  mdiContentCopy,
  mdiContentCut,
  mdiDelete,
  mdiDotsVertical,
  mdiPencil,
  mdiPlusCircleMultipleOutline,
  mdiArrangeBringForward,
  mdiArrangeSendBackward,
  mdiArrangeBringToFront,
  mdiArrangeSendToBack,
  mdiRotateLeft,
  mdiCursorMove,
} from '@mdi/js';
import {
  FREESPACE_ITEM_TAG,
  type FreeSpaceCardLayout,
  type ResizeHandle,
} from './types';

const RESIZE_HANDLES: ResizeHandle[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

@customElement(FREESPACE_ITEM_TAG)
export class UcFreeSpaceItem extends LitElement {
  @property({ attribute: false }) public card: HTMLElement | null = null;
  @property({ attribute: false }) public layout!: FreeSpaceCardLayout;
  @property({ type: Number }) public cardIndex = 0;
  @property({ type: Boolean }) public editMode = false;
  @property({ type: Boolean }) public selected = false;
  @property({ type: Boolean }) public stacked = false;
  @property({ type: Boolean }) public editingAllowed = true;
  @property({ type: Number }) public scale = 1;

  @state() private _hover = false;
  @state() private _menuOpen = false;

  private _touchStarted = false;

  static override styles = css`
    :host {
      display: block;
      position: absolute;
      box-sizing: border-box;
      outline: none;
    }
    :host([stacked]) {
      position: relative;
      left: auto !important;
      top: auto !important;
      width: 100% !important;
      height: auto !important;
      transform: none !important;
      margin-bottom: 12px;
    }
    .frame {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px));
    }
    :host([stacked]) .frame {
      height: auto;
    }
    .card-slot {
      width: 100%;
      height: 100%;
      border-radius: inherit;
      overflow: hidden;
    }
    :host([stacked]) .card-slot {
      height: auto;
      overflow: visible;
    }
    .card-slot > * {
      display: block;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }
    :host([stacked]) .card-slot > * {
      height: auto;
    }

    .overlay {
      position: absolute;
      inset: 0;
      opacity: 0;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 180ms ease-in-out;
      border-radius: inherit;
      z-index: 2;
      cursor: move;
    }
    .overlay.visible {
      opacity: 1;
      pointer-events: auto;
    }
    .control-overlay {
      position: absolute;
      inset: 0;
      opacity: 0.8;
      background-color: var(--primary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: inherit;
      z-index: 0;
    }
    .control-icon {
      position: relative;
      z-index: 1;
      display: flex;
      color: var(--primary-text-color);
      border-radius: 50%;
      padding: 8px;
      background: var(--secondary-background-color);
    }
    .control-icon svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }

    .more {
      position: absolute;
      right: -6px;
      top: -6px;
      z-index: 3;
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 50%;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }
    .more svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }
    .more:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }

    .menu {
      position: absolute;
      right: 0;
      top: 28px;
      z-index: 4;
      min-width: 200px;
      padding: 4px 0;
      margin: 0;
      list-style: none;
      background: var(--card-background-color, var(--ha-card-background, #fff));
      color: var(--primary-text-color);
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
      border: 1px solid var(--divider-color);
    }
    .menu button {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 10px 16px;
      border: none;
      background: transparent;
      color: inherit;
      font: inherit;
      font-size: 14px;
      cursor: pointer;
      text-align: left;
    }
    .menu button:hover,
    .menu button:focus-visible {
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
      outline: none;
    }
    .menu button.danger {
      color: var(--error-color, #db4437);
    }
    .menu button svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
      flex-shrink: 0;
    }
    .menu .divider {
      height: 1px;
      margin: 4px 0;
      background: var(--divider-color);
    }

    .handle {
      position: absolute;
      width: 10px;
      height: 10px;
      background: var(--primary-color);
      border: 1px solid var(--card-background-color, #fff);
      border-radius: 2px;
      z-index: 3;
      box-sizing: border-box;
    }
    .handle.n {
      top: -5px;
      left: 50%;
      transform: translateX(-50%);
      cursor: ns-resize;
    }
    .handle.s {
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%);
      cursor: ns-resize;
    }
    .handle.e {
      right: -5px;
      top: 50%;
      transform: translateY(-50%);
      cursor: ew-resize;
    }
    .handle.w {
      left: -5px;
      top: 50%;
      transform: translateY(-50%);
      cursor: ew-resize;
    }
    .handle.ne {
      top: -5px;
      right: -5px;
      cursor: nesw-resize;
    }
    .handle.nw {
      top: -5px;
      left: -5px;
      cursor: nwse-resize;
    }
    .handle.se {
      bottom: -5px;
      right: -5px;
      cursor: nwse-resize;
    }
    .handle.sw {
      bottom: -5px;
      left: -5px;
      cursor: nesw-resize;
    }

    .rotate-zone {
      position: absolute;
      width: 22px;
      height: 22px;
      z-index: 3;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
      cursor: grab;
      /* Only when the item is selected (highlighted) */
      opacity: 0;
      pointer-events: none;
      transition: opacity 120ms ease-in-out;
    }
    :host([selected]) .rotate-zone {
      opacity: 1;
      pointer-events: auto;
    }
    .rotate-zone svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
      filter: drop-shadow(0 0 1px var(--card-background-color, #fff));
    }
    /* Single rotate control: top-left only */
    .rotate-zone.nw {
      top: -28px;
      left: -28px;
    }

    :host(:focus-visible) .frame {
      box-shadow: 0 0 0 2px var(--primary-color);
    }
    :host([selected]) .frame {
      box-shadow: 0 0 0 2px var(--primary-color);
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('focus', this._onFocus);
    this.addEventListener('blur', this._onBlur);
    this.addEventListener('mouseenter', this._onMouseEnter);
    this.addEventListener('mouseleave', this._onMouseLeave);
    this.addEventListener('contextmenu', this._onContextMenu);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('focus', this._onFocus);
    this.removeEventListener('blur', this._onBlur);
    this.removeEventListener('mouseenter', this._onMouseEnter);
    this.removeEventListener('mouseleave', this._onMouseLeave);
    this.removeEventListener('contextmenu', this._onContextMenu);
    document.removeEventListener('click', this._documentClicked);
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('layout') || changed.has('stacked')) {
      this._applyPosition();
    }
    if (changed.has('card') && this.card) {
      this._mountCard();
    }
    if (changed.has('editMode')) {
      this.toggleAttribute('tabindex', this.editMode && this.editingAllowed);
      if (this.editMode && this.editingAllowed) this.setAttribute('tabindex', '0');
      else this.removeAttribute('tabindex');
    }
    if (changed.has('selected')) {
      this.toggleAttribute('selected', this.selected);
    }
    if (changed.has('stacked')) {
      this.toggleAttribute('stacked', this.stacked);
    }
  }

  private _applyPosition(): void {
    if (this.stacked || !this.layout) return;
    this.style.left = `${this.layout.x}px`;
    this.style.top = `${this.layout.y}px`;
    this.style.width = `${this.layout.w}px`;
    this.style.height = `${this.layout.h}px`;
    this.style.zIndex = String(this.layout.z ?? 0);
    this.style.transform = this.layout.r ? `rotate(${this.layout.r}deg)` : '';
  }

  private _mountCard(): void {
    const slot = this.renderRoot?.querySelector('.card-slot') as HTMLElement | null;
    if (!slot || !this.card) return;
    while (slot.firstChild) slot.removeChild(slot.firstChild);
    // Tell the card to fill its container (HA grid layout mode).
    try {
      (this.card as any).layout = 'grid';
    } catch {
      // ignore
    }
    slot.appendChild(this.card);
  }

  protected override firstUpdated(): void {
    this._mountCard();
    this._applyPosition();
  }

  private _onFocus = (): void => {
    this._hover = true;
  };
  private _onBlur = (): void => {
    if (!this._menuOpen) this._hover = false;
  };
  private _onMouseEnter = (): void => {
    if (this._touchStarted) return;
    this._hover = true;
  };
  private _onMouseLeave = (): void => {
    if (!this._menuOpen) this._hover = false;
  };

  private _documentClicked = (ev: MouseEvent): void => {
    this._hover = ev.composedPath().includes(this);
    if (!this._hover) this._menuOpen = false;
    document.removeEventListener('click', this._documentClicked);
  };

  private _showChrome(): boolean {
    return this.editMode && this.editingAllowed && (this._hover || this.selected || this._menuOpen);
  }

  private _icon(path: string) {
    return html`<svg viewBox="0 0 24 24"><path d=${path}></path></svg>`;
  }

  private _fire(name: string, detail?: unknown): void {
    this.dispatchEvent(
      new CustomEvent(name, { detail, bubbles: true, composed: true })
    );
  }

  private _onOverlayPointerDown(ev: PointerEvent): void {
    if (!this.editMode || !this.editingAllowed) return;
    if ((ev.target as HTMLElement).closest('.more, .menu, .handle, .rotate-zone')) return;
    if (ev.pointerType === 'touch') this._touchStarted = true;
    this._fire('fs-interaction-start', {
      cardIndex: this.cardIndex,
      mode: 'move',
      origin: this.layout,
      pointerEvent: ev,
      captureTarget: this,
    });
  }

  private _onHandlePointerDown(ev: PointerEvent, handle: ResizeHandle): void {
    ev.stopPropagation();
    ev.preventDefault();
    this._fire('fs-interaction-start', {
      cardIndex: this.cardIndex,
      mode: 'resize',
      handle,
      origin: this.layout,
      pointerEvent: ev,
      captureTarget: this,
    });
  }

  private _onRotatePointerDown(ev: PointerEvent): void {
    ev.stopPropagation();
    ev.preventDefault();
    this._fire('fs-interaction-start', {
      cardIndex: this.cardIndex,
      mode: 'rotate',
      origin: this.layout,
      pointerEvent: ev,
      captureTarget: this,
    });
  }

  private _toggleMenu(ev: Event): void {
    ev.stopPropagation();
    this._menuOpen = !this._menuOpen;
    if (this._menuOpen) {
      document.addEventListener('click', this._documentClicked);
      this._fire('fs-select-card', { cardIndex: this.cardIndex });
    }
  }

  /** Hijack right-click to open the same options menu as the ⋮ button. */
  private _onContextMenu = (ev: MouseEvent): void => {
    if (!this.editMode || !this.editingAllowed) return;
    ev.preventDefault();
    ev.stopPropagation();
    this._hover = true;
    this._menuOpen = true;
    this._fire('fs-select-card', { cardIndex: this.cardIndex });
    document.addEventListener('click', this._documentClicked);
  };

  private _menuAction(action: string, ev: Event): void {
    ev.stopPropagation();
    this._menuOpen = false;
    switch (action) {
      case 'edit':
        this._fire('ll-edit-card', { path: [/* filled by view */ this.cardIndex] });
        this._fire('fs-edit-card', { cardIndex: this.cardIndex });
        break;
      case 'duplicate':
        this._fire('fs-duplicate-card', { cardIndex: this.cardIndex });
        break;
      case 'copy':
        this._fire('fs-copy-card', { cardIndex: this.cardIndex });
        break;
      case 'cut':
        this._fire('fs-cut-card', { cardIndex: this.cardIndex });
        break;
      case 'delete':
        this._fire('fs-delete-card', { cardIndex: this.cardIndex });
        break;
      case 'forward':
      case 'backward':
      case 'front':
      case 'back':
        this._fire('fs-z-order', { cardIndex: this.cardIndex, action });
        break;
      case 'reset-rotation':
        this._fire('fs-reset-rotation', { cardIndex: this.cardIndex });
        break;
    }
  }

  protected override render() {
    const show = this._showChrome();
    return html`
      <div class="frame">
        <div class="card-slot"></div>
        ${this.editMode && this.editingAllowed
          ? html`
              <div
                class="overlay ${show ? 'visible' : ''}"
                @pointerdown=${this._onOverlayPointerDown}
              >
                <div class="control-overlay"></div>
                <div class="control-icon">${this._icon(mdiCursorMove)}</div>
                <button
                  type="button"
                  class="more"
                  aria-label="Card options"
                  @click=${this._toggleMenu}
                  @pointerdown=${(e: Event) => e.stopPropagation()}
                >
                  ${this._icon(mdiDotsVertical)}
                </button>
                ${this._menuOpen
                  ? html`
                      <ul class="menu" role="menu">
                        <li>
                          <button type="button" @click=${(e: Event) => this._menuAction('edit', e)}>
                            ${this._icon(mdiPencil)} Edit
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            @click=${(e: Event) => this._menuAction('duplicate', e)}
                          >
                            ${this._icon(mdiPlusCircleMultipleOutline)} Duplicate
                          </button>
                        </li>
                        <li>
                          <button type="button" @click=${(e: Event) => this._menuAction('copy', e)}>
                            ${this._icon(mdiContentCopy)} Copy
                          </button>
                        </li>
                        <li>
                          <button type="button" @click=${(e: Event) => this._menuAction('cut', e)}>
                            ${this._icon(mdiContentCut)} Cut
                          </button>
                        </li>
                        <li class="divider" role="separator"></li>
                        <li>
                          <button
                            type="button"
                            @click=${(e: Event) => this._menuAction('forward', e)}
                          >
                            ${this._icon(mdiArrangeBringForward)} Bring forward
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            @click=${(e: Event) => this._menuAction('backward', e)}
                          >
                            ${this._icon(mdiArrangeSendBackward)} Send backward
                          </button>
                        </li>
                        <li>
                          <button type="button" @click=${(e: Event) => this._menuAction('front', e)}>
                            ${this._icon(mdiArrangeBringToFront)} Bring to front
                          </button>
                        </li>
                        <li>
                          <button type="button" @click=${(e: Event) => this._menuAction('back', e)}>
                            ${this._icon(mdiArrangeSendToBack)} Send to back
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            @click=${(e: Event) => this._menuAction('reset-rotation', e)}
                          >
                            ${this._icon(mdiRotateLeft)} Reset rotation
                          </button>
                        </li>
                        <li class="divider" role="separator"></li>
                        <li>
                          <button
                            type="button"
                            class="danger"
                            @click=${(e: Event) => this._menuAction('delete', e)}
                          >
                            ${this._icon(mdiDelete)} Delete
                          </button>
                        </li>
                      </ul>
                    `
                  : nothing}
              </div>
              ${show
                ? html`
                    ${RESIZE_HANDLES.map(
                      h => html`
                        <div
                          class="handle ${h}"
                          @pointerdown=${(e: PointerEvent) => this._onHandlePointerDown(e, h)}
                        ></div>
                      `
                    )}
                  `
                : nothing}
              ${this.selected
                ? html`
                    <div
                      class="rotate-zone nw"
                      title="Rotate"
                      @pointerdown=${this._onRotatePointerDown}
                    >
                      ${this._icon(mdiRotateLeft)}
                    </div>
                  `
                : nothing}
            `
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [FREESPACE_ITEM_TAG]: UcFreeSpaceItem;
  }
}
