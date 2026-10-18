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
  mdiFormatHorizontalAlignLeft,
  mdiFormatHorizontalAlignCenter,
  mdiFormatHorizontalAlignRight,
  mdiArrowExpandHorizontal,
  mdiEyeOffOutline,
  mdiEyeOutline,
  mdiLock,
  mdiLockOpenVariantOutline,
  mdiArrowCollapseVertical,
} from '@mdi/js';
import { localize } from '../localize/localize';
import {
  FREESPACE_ITEM_TAG,
  FREESPACE_PINS,
  MIN_CARD_H,
  type FreeSpaceCardLayout,
  type FreeSpacePin,
  type ResizeHandle,
} from './types';

const PIN_MENU: Record<FreeSpacePin, { icon: string; key: string; label: string }> = {
  left: { icon: mdiFormatHorizontalAlignLeft, key: 'menu_pin_left', label: 'Left' },
  center: { icon: mdiFormatHorizontalAlignCenter, key: 'menu_pin_center', label: 'Center' },
  right: { icon: mdiFormatHorizontalAlignRight, key: 'menu_pin_right', label: 'Right' },
  stretch: { icon: mdiArrowExpandHorizontal, key: 'menu_pin_stretch', label: 'Left & right' },
};

/** Stacking order for an item whose options menu is open: above every card, below the marquee and guides. */
const MENU_OPEN_Z = 9000;

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
  @property({ attribute: false }) public language = 'en';

  @state() private _hover = false;
  @state() private _menuOpen = false;
  /** Fixed-height card whose content is taller than the card (edit mode hint). */
  @state() private _clipped = false;

  private _touchStarted = false;
  private _sizeObserver: ResizeObserver | null = null;
  private _lastMeasuredH = 0;

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
      /* Without this the browser claims touch drags for scrolling and cancels the pointer. */
      touch-action: none;
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
    .menu button.active {
      color: var(--primary-color);
    }
    .menu .menu-label {
      padding: 6px 12px 2px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--secondary-text-color);
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
      touch-action: none;
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
      touch-action: none;
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
    :host([locked]) .overlay {
      cursor: default;
    }
    /* Height follows the card's content. */
    :host([auto-h]) .frame,
    :host([auto-h]) .card-slot,
    :host([auto-h]) .card-slot > * {
      height: auto;
    }
    /* Hidden on this screen: only drawn in edit mode, faded. */
    :host([hidden-here]) .card-slot {
      opacity: 0.35;
      filter: grayscale(1);
    }
    .badges {
      position: absolute;
      left: 6px;
      bottom: 6px;
      z-index: 3;
      display: flex;
      gap: 4px;
      pointer-events: none;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      height: 22px;
      padding: 0 6px;
      border-radius: 11px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }
    .badge.warn {
      background: var(--warning-color, #ffa600);
      color: #000;
    }
    .badge svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
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
    this._sizeObserver?.disconnect();
    this._sizeObserver = null;
  }

  protected override updated(changed: PropertyValues): void {
    if (
      changed.has('layout') ||
      changed.has('stacked') ||
      (changed as Map<PropertyKey, unknown>).has('_menuOpen')
    ) {
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
    if (changed.has('selected') || changed.has('editMode')) {
      this.toggleAttribute('selected', this.selected && this.editMode);
      if (!this.editMode) this._menuOpen = false;
    }
    if (changed.has('stacked')) {
      this.toggleAttribute('stacked', this.stacked);
    }
    if (changed.has('layout') || changed.has('editMode')) {
      this.toggleAttribute('hidden-here', !!this.layout?.hidden && this.editMode);
      this.toggleAttribute('locked', !!this.layout?.locked);
    }
    if (changed.has('layout') || changed.has('stacked') || changed.has('editMode')) {
      this._measure();
    }
  }

  private _autoHeight(): boolean {
    return !!this.layout?.auto_h && !this.stacked;
  }

  /**
   * Auto-height cards report their content height so the view can size the
   * canvas and selection around them. Fixed-height cards check whether their
   * content is cut off (edit mode only).
   */
  private _measure(): void {
    const watch = this._autoHeight() || (this.editMode && !this.stacked);
    if (!watch) {
      this._sizeObserver?.disconnect();
      this._sizeObserver = null;
      this._clipped = false;
      return;
    }
    if (!this._sizeObserver && typeof ResizeObserver !== 'undefined') {
      this._sizeObserver = new ResizeObserver(() => this._onResize());
      this._sizeObserver.observe(this);
      const slot = this.renderRoot?.querySelector('.card-slot');
      if (slot) this._sizeObserver.observe(slot);
      if (this.card) this._sizeObserver.observe(this.card);
    }
    this._onResize();
  }

  private _onResize(): void {
    const slot = this.renderRoot?.querySelector('.card-slot') as HTMLElement | null;
    if (this._autoHeight()) {
      this._clipped = false;
      // offsetHeight is in artboard units (the artboard's scale is a transform).
      const h = Math.max(MIN_CARD_H, Math.round(this.offsetHeight));
      if (h > 0 && Math.abs(h - this._lastMeasuredH) >= 1) {
        this._lastMeasuredH = h;
        this._fire('fs-measured', { cardIndex: this.cardIndex, h });
      }
      return;
    }
    this._lastMeasuredH = 0;
    if (!slot || !this.editMode) {
      this._clipped = false;
      return;
    }
    const content = Math.max(
      slot.scrollHeight,
      ...Array.from(slot.children).map(c => (c as HTMLElement).scrollHeight || 0)
    );
    this._clipped = content > slot.clientHeight + 2;
  }

  private _applyPosition(): void {
    if (this.stacked || !this.layout) return;
    this.style.left = `${this.layout.x}px`;
    this.style.top = `${this.layout.y}px`;
    this.style.width = `${this.layout.w}px`;
    this.style.height = this._autoHeight() ? 'auto' : `${this.layout.h}px`;
    this.style.minHeight = this._autoHeight() ? `${MIN_CARD_H}px` : '';
    this.toggleAttribute('auto-h', this._autoHeight());
    // An open options menu lives inside this item, so lift the whole item above
    // its neighbours while the menu is open (below the canvas guides and toolbar).
    this.style.zIndex = this._menuOpen ? String(MENU_OPEN_Z) : String(this.layout.z ?? 0);
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
    if (this._sizeObserver) {
      this._sizeObserver.disconnect();
      this._sizeObserver = null;
      this._measure();
    }
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

  private _t(key: string, fallback: string): string {
    return localize(`freespace.${key}`, this.language, fallback);
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

  private _setPin(pin: FreeSpacePin, ev: Event): void {
    ev.stopPropagation();
    this._menuOpen = false;
    this._fire('fs-set-pin', { cardIndex: this.cardIndex, pin });
  }

  private _menuAction(action: string, ev: Event): void {
    ev.stopPropagation();
    this._menuOpen = false;
    switch (action) {
      case 'edit':
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
      case 'lock':
      case 'hidden':
      case 'auto_h':
        this._fire('fs-toggle-flag', { cardIndex: this.cardIndex, flag: action });
        break;
    }
  }

  private _renderBadges() {
    if (!this.editMode || this.stacked) return nothing;
    const locked = !!this.layout?.locked;
    const hiddenHere = !!this.layout?.hidden;
    if (!locked && !hiddenHere && !this._clipped) return nothing;
    return html`
      <div class="badges">
        ${locked
          ? html`<span class="badge" title=${this._t('badge_locked_hint', 'Locked: unlock it to move or resize')}
              >${this._icon(mdiLock)}</span
            >`
          : nothing}
        ${hiddenHere
          ? html`<span class="badge" title=${this._t('badge_hidden_hint', 'Hidden on this screen size')}
              >${this._icon(mdiEyeOffOutline)} ${this._t('badge_hidden', 'Hidden')}</span
            >`
          : nothing}
        ${this._clipped
          ? html`<span
              class="badge warn"
              title=${this._t(
                'badge_clipped_hint',
                'The content is taller than this card and is cut off. Make the card taller or set its height to Auto.'
              )}
              >${this._t('badge_clipped', 'Cut off')}</span
            >`
          : nothing}
      </div>
    `;
  }

  protected override render() {
    const show = this._showChrome();
    const locked = !!this.layout?.locked;
    const hiddenHere = !!this.layout?.hidden;
    return html`
      <div class="frame">
        <div class="card-slot"></div>
        ${this._renderBadges()}
        ${this.editMode && this.editingAllowed
          ? html`
              <div
                class="overlay ${show ? 'visible' : ''}"
                @pointerdown=${this._onOverlayPointerDown}
              >
                <div class="control-overlay"></div>
                <div class="control-icon">${this._icon(locked ? mdiLock : mdiCursorMove)}</div>
                <button
                  type="button"
                  class="more"
                  aria-label=${this._t('menu_options', 'Card options')}
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
                            ${this._icon(mdiPencil)} ${this._t('menu_edit', 'Edit')}
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            @click=${(e: Event) => this._menuAction('duplicate', e)}
                          >
                            ${this._icon(mdiPlusCircleMultipleOutline)} ${this._t('tb_duplicate', 'Duplicate')}
                          </button>
                        </li>
                        <li>
                          <button type="button" @click=${(e: Event) => this._menuAction('copy', e)}>
                            ${this._icon(mdiContentCopy)} ${this._t('menu_copy', 'Copy')}
                          </button>
                        </li>
                        <li>
                          <button type="button" @click=${(e: Event) => this._menuAction('cut', e)}>
                            ${this._icon(mdiContentCut)} ${this._t('menu_cut', 'Cut')}
                          </button>
                        </li>
                        <li class="divider" role="separator"></li>
                        <li>
                          <button
                            type="button"
                            @click=${(e: Event) => this._menuAction('forward', e)}
                          >
                            ${this._icon(mdiArrangeBringForward)} ${this._t('tb_forward', 'Bring forward')}
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            @click=${(e: Event) => this._menuAction('backward', e)}
                          >
                            ${this._icon(mdiArrangeSendBackward)} ${this._t('tb_backward', 'Send backward')}
                          </button>
                        </li>
                        <li>
                          <button type="button" @click=${(e: Event) => this._menuAction('front', e)}>
                            ${this._icon(mdiArrangeBringToFront)} ${this._t('tb_front', 'Bring to front')}
                          </button>
                        </li>
                        <li>
                          <button type="button" @click=${(e: Event) => this._menuAction('back', e)}>
                            ${this._icon(mdiArrangeSendToBack)} ${this._t('tb_back', 'Send to back')}
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            @click=${(e: Event) => this._menuAction('reset-rotation', e)}
                          >
                            ${this._icon(mdiRotateLeft)} ${this._t('menu_reset_rotation', 'Reset rotation')}
                          </button>
                        </li>
                        <li class="divider" role="separator"></li>
                        <li>
                          <button type="button" @click=${(e: Event) => this._menuAction('lock', e)}>
                            ${locked
                              ? html`${this._icon(mdiLockOpenVariantOutline)} ${this._t('menu_unlock', 'Unlock')}`
                              : html`${this._icon(mdiLock)} ${this._t('menu_lock', 'Lock')}`}
                          </button>
                        </li>
                        <li>
                          <button type="button" @click=${(e: Event) => this._menuAction('auto_h', e)}>
                            ${this._icon(mdiArrowCollapseVertical)}
                            ${this.layout?.auto_h
                              ? this._t('menu_fixed_height', 'Fixed height')
                              : this._t('menu_auto_height', 'Auto height')}
                          </button>
                        </li>
                        <li>
                          <button type="button" @click=${(e: Event) => this._menuAction('hidden', e)}>
                            ${hiddenHere
                              ? html`${this._icon(mdiEyeOutline)} ${this._t('menu_show_here', 'Show on this screen')}`
                              : html`${this._icon(mdiEyeOffOutline)} ${this._t('menu_hide_here', 'Hide on this screen')}`}
                          </button>
                        </li>
                        <li class="divider" role="separator"></li>
                        <li class="menu-label" role="presentation">${this._t('menu_pin_to', 'Pin to')}</li>
                        ${FREESPACE_PINS.map(
                          p => html`
                            <li>
                              <button
                                type="button"
                                role="menuitemradio"
                                aria-checked=${(this.layout?.pin ?? 'left') === p ? 'true' : 'false'}
                                class=${(this.layout?.pin ?? 'left') === p ? 'active' : ''}
                                @click=${(e: Event) => this._setPin(p, e)}
                              >
                                ${this._icon(PIN_MENU[p].icon)} ${this._t(PIN_MENU[p].key, PIN_MENU[p].label)}
                              </button>
                            </li>
                          `
                        )}
                        <li class="divider" role="separator"></li>
                        <li>
                          <button
                            type="button"
                            class="danger"
                            @click=${(e: Event) => this._menuAction('delete', e)}
                          >
                            ${this._icon(mdiDelete)} ${this._t('tb_delete', 'Delete')}
                          </button>
                        </li>
                      </ul>
                    `
                  : nothing}
              </div>
              ${show && !locked
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
              ${this.selected && !locked
                ? html`
                    <div
                      class="rotate-zone nw"
                      title=${this._t('menu_rotate', 'Rotate')}
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
