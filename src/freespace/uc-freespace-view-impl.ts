/**
 * FreeSpace view implementation (lazy chunk).
 *
 * Receives pre-built hui-card / hui-badge elements from HA's hui-view and
 * lays them out on a scaled artboard with free drag / resize / rotate / layer.
 */

import { LitElement, html, css, nothing, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { mdiCellphone, mdiContentCopy, mdiLaptop, mdiMonitor, mdiPlus, mdiTablet } from '@mdi/js';
import { ucFreeSpaceSettingsService } from '../services/uc-freespace-settings-service';
import { ucSectionsLayoutService } from '../services/uc-sections-layout-service';
import { isConnectInstalled } from '../services/uc-connect-compatibility';
import { localize } from '../localize/localize';
import {
  FREESPACE_IMPL_TAG,
  FREESPACE_ITEM_TAG,
  type FreeSpaceCardLayout,
  type FreeSpaceViewOptions,
  type InteractionState,
  type ResizeHandle,
} from './types';
import {
  applyLayoutsToView,
  applyZOrder,
  assignDefaultLayouts,
  computeArtboardHeight,
  copyBreakpointLayouts,
  countSectionCards,
  effectiveCanvasWidth,
  flattenSectionsToCards,
  hasExplicitBreakpointLayout,
  parseViewLayoutStore,
  readFreeSpaceOptions,
  setCardLayout,
  shouldStackPhone,
  type ZOrderAction,
} from './uc-freespace-config';
import {
  BREAKPOINT_SPECS,
  FREESPACE_BREAKPOINTS,
  resolveBreakpoint,
  type FreeSpaceBreakpoint,
} from './uc-freespace-breakpoints';
import {
  alignmentGuides,
  snapLayout,
  snapToGuides,
  stackOrder,
} from './uc-freespace-geometry';
import { FreeSpaceInteractionEngine } from './uc-freespace-interaction';
import './uc-freespace-item';

const BP_ICONS: Record<FreeSpaceBreakpoint, string> = {
  desktop: mdiMonitor,
  laptop: mdiLaptop,
  tablet: mdiTablet,
  phone: mdiCellphone,
};

@customElement(FREESPACE_IMPL_TAG)
export class UltraFreeSpaceViewImpl extends LitElement {
  @property({ attribute: false }) public hass: any;
  @property({ attribute: false }) public lovelace: any;
  @property({ type: Number }) public index = 0;
  @property({ type: Boolean }) public narrow = false;
  @property({ type: Boolean }) public isStrategy = false;
  @property({ attribute: false }) public cards: HTMLElement[] = [];
  @property({ attribute: false }) public badges: HTMLElement[] = [];
  @property({ attribute: false }) public sections: HTMLElement[] = [];

  @state() private _config: any;
  @state() private _options: FreeSpaceViewOptions = readFreeSpaceOptions(undefined);
  @state() private _layouts: FreeSpaceCardLayout[] = [];
  @state() private _scale = 1;
  /** Painted artboard width in design px (may fill the viewport like Sections). */
  @state() private _artboardWidth = 1200;
  @state() private _artboardHeight = 800;
  @state() private _artboardOffsetX = 0;
  /** Edit preview of a narrower breakpoint (Phone/Tablet) on a wider screen. */
  @state() private _devicePreview = false;
  /** Artboard is narrower than the viewport (full width off) — show width bounds. */
  @state() private _showWidthBounds = false;
  @state() private _selected: number | null = null;
  @state() private _guides: { vertical: number[]; horizontal: number[] } = {
    vertical: [],
    horizontal: [],
  };
  @state() private _discoverable = false;
  @state() private _connectInstalled = false;
  /** Live breakpoint from container width (used outside edit mode). */
  @state() private _liveBreakpoint: FreeSpaceBreakpoint = 'desktop';
  /** Breakpoint currently being edited (edit mode toolbar). */
  @state() private _editBreakpoint: FreeSpaceBreakpoint = 'desktop';
  @state() private _containerWidth = 1200;

  private _engine: FreeSpaceInteractionEngine;
  private _resizeObserver: ResizeObserver | null = null;
  private _unsubSettings: (() => void) | null = null;
  /** Optimistic layouts keyed by `${breakpoint}:${cardIndex}`. */
  private _optimistic: Map<string, FreeSpaceCardLayout> = new Map();
  private _saving = false;
  private _pendingSave: {
    cardIndex: number;
    layout: FreeSpaceCardLayout;
    breakpoint: FreeSpaceBreakpoint;
  } | null = null;
  /** Cached fill height in CSS px — must not track our own expanding content. */
  private _fillHeightPx = 0;
  private _unsubSectionsWidth: (() => void) | null = null;
  private _onWindowResize = (): void => {
    this._fillHeightPx = 0;
    this._updateScale();
  };

  constructor() {
    super();
    this._engine = new FreeSpaceInteractionEngine({
      onMove: state => this._onInteractionMove(state),
      onEnd: (state, cancelled) => this._onInteractionEnd(state, cancelled),
      onClick: index => {
        this._selected = index;
      },
      onDoubleClick: index => this._editCard(index),
    });
  }

  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      position: relative;
      flex: 1 1 auto;
      min-height: 100%;
      height: 100%;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
    }
    /* Hub → Home → Full width: FreeSpace uses the whole content column. */
    :host([data-uc-full-width]) {
      width: 100%;
      max-width: none;
      margin-inline: 0;
    }
    .badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      padding: 12px 16px 0;
      position: relative;
      z-index: 2;
    }
    .viewport {
      position: relative;
      width: 100%;
      flex: 1 1 auto;
      min-height: 0;
      /* Fixed to the *scaled* artboard size so the unscaled child cannot
         expand the page (transform: scale does not affect layout). */
      overflow: hidden;
      background: transparent;
      z-index: 1;
    }
    /* Full-bleed edit grid: covers the entire FreeSpace host (behind cards),
       not only the artboard / empty gaps. */
    .grid-layer {
      display: none;
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background-color: var(--primary-background-color, #111);
      background-image: radial-gradient(
        circle,
        var(--divider-color, rgba(127, 127, 127, 0.45)) 1px,
        transparent 1px
      );
      background-size: 16px 16px;
      background-repeat: repeat;
      background-position: 0 0;
    }
    :host([edit]) .grid-layer {
      display: block;
    }
    .artboard {
      position: absolute;
      top: 0;
      left: 0;
      transform-origin: top left;
      box-sizing: border-box;
      background: transparent;
    }
    /* Outline only — keep the grid layer visible through the frame. */
    .artboard.device-preview {
      box-shadow: 0 0 0 1px var(--divider-color, rgba(127, 127, 127, 0.45));
    }
    /* Full-width off (edit only): left/right edges mark the design canvas. */
    :host([edit]) .artboard.width-bounds {
      box-shadow:
        inset 1px 0 0 var(--primary-color, #03a9f4),
        inset -1px 0 0 var(--primary-color, #03a9f4);
      /* Keep cards that sit past the lines visible & draggable. */
      overflow: visible;
    }
    .width-bound {
      display: none;
      position: absolute;
      top: 0;
      bottom: 0;
      width: 0;
      pointer-events: none;
      z-index: 3;
      border-left: 1px dashed rgba(var(--rgb-primary-color, 3, 169, 244), 0.85);
    }
    :host([edit]) .width-bound.visible {
      display: block;
    }
    .artboard.stacked {
      position: relative;
      transform: none !important;
      width: 100% !important;
      height: auto !important;
      min-height: 100%;
      padding: 12px 16px 80px;
      box-sizing: border-box;
      background: none;
    }
    .guides {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 9999;
    }
    .guide-v,
    .guide-h {
      position: absolute;
      background: var(--primary-color);
      opacity: 0.7;
    }
    .guide-v {
      top: 0;
      bottom: 0;
      width: 1px;
    }
    .guide-h {
      left: 0;
      right: 0;
      height: 1px;
    }
    .banner {
      margin: 12px 16px 0;
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.3);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
      color: var(--primary-text-color);
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      font-size: 14px;
      position: relative;
      z-index: 2;
    }
    .banner button {
      margin-left: auto;
      border: 1px solid var(--primary-color);
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-radius: 8px;
      padding: 6px 12px;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }
    .hint {
      margin: 8px 16px;
      color: var(--secondary-text-color);
      font-size: 13px;
      position: relative;
      z-index: 2;
    }
    .fab {
      position: fixed;
      right: calc(16px + env(safe-area-inset-right));
      bottom: calc(16px + env(safe-area-inset-bottom));
      z-index: 10;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .fab svg {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }
    .fab:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 3px;
    }
    .empty {
      padding: 48px 24px;
      text-align: center;
      color: var(--secondary-text-color);
    }
    .bp-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      padding: 8px 16px 0;
      position: sticky;
      top: 0;
      z-index: 5;
    }
    .bp-bar .bp-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color, var(--ha-card-background, transparent));
      color: var(--primary-text-color);
      font: inherit;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    .bp-bar .bp-btn svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }
    .bp-bar .bp-btn.active {
      border-color: var(--primary-color);
      color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
    }
    .bp-bar .bp-btn:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
    .bp-bar .bp-copy {
      margin-left: auto;
    }
    .bp-bar .bp-meta {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
  `;

  setConfig(config: unknown): void {
    this._config = config;
    this._options = readFreeSpaceOptions(config);
    this._rebuildLayouts();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._engine.attachWindowListeners();
    this._unsubSettings = ucFreeSpaceSettingsService.subscribe(() => this._refreshGating());
    this._unsubSectionsWidth = ucSectionsLayoutService.subscribe(() => {
      this._applyFullWidthAttr();
      this._fillHeightPx = 0;
      this._updateScale();
    });
    this._refreshGating();
    this._applyFullWidthAttr();
    window.addEventListener('resize', this._onWindowResize);
    this.addEventListener('pointermove', this._onPointerMove);
    this.addEventListener('pointerup', this._onPointerUp);
    this.addEventListener('pointercancel', this._onPointerUp);
    this.addEventListener('fs-interaction-start', this._onFsStart as EventListener);
    this.addEventListener('fs-select-card', this._onFsSelect as EventListener);
    this.addEventListener('fs-edit-card', this._onFsEdit as EventListener);
    this.addEventListener('fs-duplicate-card', this._onFsDuplicate as EventListener);
    this.addEventListener('fs-copy-card', this._onFsCopy as EventListener);
    this.addEventListener('fs-cut-card', this._onFsCut as EventListener);
    this.addEventListener('fs-delete-card', this._onFsDelete as EventListener);
    this.addEventListener('fs-z-order', this._onFsZOrder as EventListener);
    this.addEventListener('fs-reset-rotation', this._onFsResetRotation as EventListener);
    this.addEventListener('keydown', this._onKeyDown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._engine.detachWindowListeners();
    this._unsubSettings?.();
    this._unsubSettings = null;
    this._unsubSectionsWidth?.();
    this._unsubSectionsWidth = null;
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    window.removeEventListener('resize', this._onWindowResize);
    this.removeEventListener('pointermove', this._onPointerMove);
    this.removeEventListener('pointerup', this._onPointerUp);
    this.removeEventListener('pointercancel', this._onPointerUp);
    this.removeEventListener('fs-interaction-start', this._onFsStart as EventListener);
    this.removeEventListener('fs-select-card', this._onFsSelect as EventListener);
    this.removeEventListener('fs-edit-card', this._onFsEdit as EventListener);
    this.removeEventListener('fs-duplicate-card', this._onFsDuplicate as EventListener);
    this.removeEventListener('fs-copy-card', this._onFsCopy as EventListener);
    this.removeEventListener('fs-cut-card', this._onFsCut as EventListener);
    this.removeEventListener('fs-delete-card', this._onFsDelete as EventListener);
    this.removeEventListener('fs-z-order', this._onFsZOrder as EventListener);
    this.removeEventListener('fs-reset-rotation', this._onFsResetRotation as EventListener);
    this.removeEventListener('keydown', this._onKeyDown);
  }

  protected override firstUpdated(): void {
    const viewport = this.renderRoot.querySelector('.viewport') as HTMLElement | null;
    if (viewport && typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => this._updateScale());
      this._resizeObserver.observe(viewport);
    }
    this._updateScale();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('cards') || changed.has('_config')) {
      this._rebuildLayouts();
    }
    if (changed.has('hass')) {
      this._refreshGating();
    }
    if (changed.has('lovelace')) {
      this.toggleAttribute('edit', !!this.lovelace?.editMode);
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('_options') || changed.has('_layouts') || changed.has('_editBreakpoint')) {
      this._updateScale();
    }
  }

  private _lang(): string {
    return this.hass?.locale?.language ?? 'en';
  }

  private _t(key: string, fallback: string): string {
    return localize(`freespace.${key}`, this._lang(), fallback);
  }

  private _refreshGating(): void {
    this._connectInstalled = isConnectInstalled(this.hass);
    this._discoverable = ucFreeSpaceSettingsService.isDiscoverable(this.hass);
  }

  /** Honor Hub → Themes → Sections/FreeSpace view width (full width). */
  private _applyFullWidthAttr(): void {
    const mode = ucSectionsLayoutService.get().mode;
    this.toggleAttribute('data-uc-full-width', mode === 'full');
  }

  /** True when Hub full-width is on — never letterbox the matching breakpoint. */
  private _preferFullWidth(): boolean {
    return ucSectionsLayoutService.get().mode === 'full';
  }

  /** True when any card extends past the design canvas left/right edges. */
  private _cardsOutsideWidthBounds(): boolean {
    if (!this._showWidthBounds || !(this._artboardWidth > 0)) return false;
    const w = this._artboardWidth;
    return this._layouts.some(l => l.x < 0 || l.x + l.w > w);
  }

  private _editMode(): boolean {
    return !!this.lovelace?.editMode && !this.isStrategy;
  }

  private _activeBreakpoint(): FreeSpaceBreakpoint {
    return this._editMode() ? this._editBreakpoint : this._liveBreakpoint;
  }

  private _optKey(cardIndex: number, bp?: FreeSpaceBreakpoint): string {
    return `${bp ?? this._activeBreakpoint()}:${cardIndex}`;
  }

  private _canvasWidth(): number {
    return effectiveCanvasWidth(this._options, this._activeBreakpoint());
  }

  private _editingAllowed(): boolean {
    return this._editMode() && this._discoverable && !this._useStacked();
  }

  private _useStacked(): boolean {
    if (this._activeBreakpoint() !== 'phone') return false;
    const view = this._viewConfig();
    const cardConfigs = Array.isArray(view.cards) ? view.cards : [];
    return shouldStackPhone(cardConfigs, this._options);
  }

  private _viewConfig(): any {
    return this.lovelace?.config?.views?.[this.index] ?? this._config ?? {};
  }

  private _rebuildLayouts(): void {
    const bp = this._activeBreakpoint();
    const view = this._viewConfig();
    const cardConfigs = Array.isArray(view.cards) ? view.cards : [];
    const count = Math.max(this.cards?.length ?? 0, cardConfigs.length);
    const configs = Array.from({ length: count }, (_, i) => cardConfigs[i] ?? {});
    const optimistic = Array.from(
      { length: count },
      (_, i) => this._optimistic.get(this._optKey(i, bp)) ?? null
    );
    this._layouts = assignDefaultLayouts(configs, this._options, optimistic, bp);
    // Height is finalized in _updateScale so the grid fills the viewport.
    this._updateScale();
  }

  /**
   * Target CSS height for the visible FreeSpace area. Cached so ResizeObserver
   * cannot feed on our own height (that was the infinite-scroll bug).
   * Refreshed on window resize or when the cache is cleared.
   */
  private _availableViewportPx(): number {
    if (typeof window === 'undefined') return 0;
    if (this._fillHeightPx > 0) return this._fillHeightPx;
    const top = this.getBoundingClientRect().top;
    // Only trust the measurement when this view is near the top of the window
    // (not mid-scroll from a previous giant artboard).
    const measured =
      top >= -40 && top < window.innerHeight
        ? Math.floor(window.innerHeight - Math.max(0, top) - 8)
        : Math.floor(window.innerHeight * 0.85);
    this._fillHeightPx = Math.max(320, measured);
    return this._fillHeightPx;
  }

  private _artboardRect(): DOMRect | null {
    const artboard = this.renderRoot?.querySelector('.artboard') as HTMLElement | null;
    return artboard?.getBoundingClientRect() ?? null;
  }

  private _onFsStart = (ev: Event): void => {
    const detail = (ev as CustomEvent).detail as {
      cardIndex: number;
      mode: 'move' | 'resize' | 'rotate';
      handle?: ResizeHandle;
      origin: FreeSpaceCardLayout;
      pointerEvent: PointerEvent;
      captureTarget: Element;
    };
    if (!this._editingAllowed()) return;
    const rect = this._artboardRect();
    if (rect) this._engine.setArtboardOrigin(rect.left, rect.top);
    this._selected = detail.cardIndex;
    this._engine.pointerDown(detail.pointerEvent, {
      cardIndex: detail.cardIndex,
      mode: detail.mode,
      ...(detail.handle !== undefined ? { handle: detail.handle } : {}),
      origin: this._layouts[detail.cardIndex] ?? detail.origin,
      captureTarget: detail.captureTarget,
    });
  };

  private _onPointerMove = (ev: PointerEvent): void => {
    this._engine.pointerMove(ev);
  };

  private _onPointerUp = (ev: PointerEvent): void => {
    this._engine.pointerUp(ev);
  };

  private _onInteractionMove(state: InteractionState): void {
    let layout = state.current;
    if (state.mode === 'move') {
      const guides = alignmentGuides(this._layouts, state.cardIndex);
      const snapped = snapToGuides(layout, guides);
      layout = snapped.layout;
      this._guides = { vertical: snapped.activeV, horizontal: snapped.activeH };
    } else {
      this._guides = { vertical: [], horizontal: [] };
    }
    if (this._options.grid > 0 && state.mode !== 'rotate') {
      layout = snapLayout(layout, this._options.grid);
    }
    this._optimistic.set(this._optKey(state.cardIndex), layout);
    this._layouts = this._layouts.map((l, i) => (i === state.cardIndex ? layout : l));
  }

  private async _onInteractionEnd(state: InteractionState, cancelled: boolean): Promise<void> {
    this._guides = { vertical: [], horizontal: [] };
    if (cancelled) {
      this._optimistic.delete(this._optKey(state.cardIndex));
      this._rebuildLayouts();
      return;
    }
    let layout = this._layouts[state.cardIndex] ?? state.current;
    if (this._options.grid > 0 && state.mode !== 'rotate') {
      layout = snapLayout(layout, this._options.grid);
    }
    this._optimistic.set(this._optKey(state.cardIndex), layout);
    await this._persistLayout(state.cardIndex, layout);
  }

  private async _persistLayout(cardIndex: number, layout: FreeSpaceCardLayout): Promise<void> {
    if (!this.lovelace?.saveConfig) return;
    let breakpoint = this._activeBreakpoint();
    if (this._saving) {
      this._pendingSave = { cardIndex, layout, breakpoint };
      return;
    }
    this._saving = true;
    try {
      let pending: typeof this._pendingSave = { cardIndex, layout, breakpoint };
      while (pending) {
        cardIndex = pending.cardIndex;
        layout = pending.layout;
        breakpoint = pending.breakpoint;
        this._pendingSave = null;
        const next = setCardLayout(
          this.lovelace.config,
          this.index,
          cardIndex,
          layout,
          this._options.grid,
          breakpoint
        );
        await this.lovelace.saveConfig(next);
        pending = this._pendingSave;
      }
    } catch (err) {
      console.warn('[FreeSpace] save failed', err);
      this._optimistic.delete(this._optKey(cardIndex, breakpoint));
      this._rebuildLayouts();
    } finally {
      this._saving = false;
    }
  }

  private async _persistAllLayouts(layouts: FreeSpaceCardLayout[]): Promise<void> {
    if (!this.lovelace?.saveConfig) return;
    const bp = this._activeBreakpoint();
    layouts.forEach((l, i) => this._optimistic.set(this._optKey(i, bp), l));
    this._layouts = layouts;
    try {
      const next = applyLayoutsToView(this.lovelace.config, this.index, layouts, bp);
      await this.lovelace.saveConfig(next);
    } catch (err) {
      console.warn('[FreeSpace] save failed', err);
    }
  }

  private _editCard(cardIndex: number): void {
    this._selected = cardIndex;
    this.dispatchEvent(
      new CustomEvent('ll-edit-card', {
        detail: { path: [this.index, cardIndex] },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onFsSelect = (ev: Event): void => {
    const { cardIndex } = (ev as CustomEvent).detail;
    this._selected = cardIndex;
  };

  private _setEditBreakpoint(bp: FreeSpaceBreakpoint): void {
    if (bp === this._editBreakpoint) return;
    this._selected = null;
    this._editBreakpoint = bp;
    // Recalc fill/scale for the new canvas width (don't upscale phone on desktop).
    this._fillHeightPx = 0;
    this._rebuildLayouts();
    this._updateScale();
  }

  /**
   * Sections-like sizing (edit and live share the same rules):
   * - Matching breakpoint: artboard fills the viewport at 1:1 (never upscales).
   * - Design canvas wider than the viewport: scale down to fit.
   * - Edit preview of a narrower breakpoint (Phone on desktop): true-size
   *   device frame, centered — same pixel size as that breakpoint live.
   */
  private _updateScale(): void {
    const viewport = this.renderRoot?.querySelector('.viewport') as HTMLElement | null;
    if (!viewport) {
      this._scale = 1;
      this._artboardOffsetX = 0;
      this._devicePreview = false;
      this._showWidthBounds = false;
      this._engine.setScale(1);
      return;
    }
    const width = viewport.clientWidth || this._canvasWidth();
    this._containerWidth = width;
    const live = resolveBreakpoint(width);
    if (live !== this._liveBreakpoint) {
      this._liveBreakpoint = live;
      if (!this._editMode()) {
        const bp = this._activeBreakpoint();
        const view = this._viewConfig();
        const cardConfigs = Array.isArray(view.cards) ? view.cards : [];
        const count = Math.max(this.cards?.length ?? 0, cardConfigs.length);
        const configs = Array.from({ length: count }, (_, i) => cardConfigs[i] ?? {});
        const optimistic = Array.from(
          { length: count },
          (_, i) => this._optimistic.get(this._optKey(i, bp)) ?? null
        );
        this._layouts = assignDefaultLayouts(configs, this._options, optimistic, bp);
      }
    }
    if (this._useStacked()) {
      this._scale = 1;
      this._artboardWidth = width;
      this._artboardOffsetX = 0;
      this._devicePreview = false;
      this._showWidthBounds = false;
      this._engine.setScale(1);
      this._artboardHeight = computeArtboardHeight(this._layouts, this._options.min_height);
      viewport.style.height = '';
      viewport.style.minHeight = '';
      return;
    }

    const designCanvas = this._canvasWidth();
    const fullWidth = this._preferFullWidth();
    // Preview a smaller breakpoint on a larger screen only when full width is
    // off. With full width on, Tablet/Phone/Laptop edit should fill the view
    // the same way Desktop does.
    const devicePreview =
      !fullWidth &&
      this._editMode() &&
      BREAKPOINT_SPECS[this._editBreakpoint].minWidth < BREAKPOINT_SPECS[live].minWidth;

    if (devicePreview) {
      this._devicePreview = true;
      this._showWidthBounds = true;
      this._artboardWidth = designCanvas;
      this._scale = 1;
      this._artboardOffsetX = Math.max(0, Math.round((width - designCanvas) / 2));
    } else if (!fullWidth && designCanvas > 0 && designCanvas < width) {
      // Full width off: keep design canvas size, centered, with width bounds.
      this._devicePreview = false;
      this._showWidthBounds = true;
      this._artboardWidth = designCanvas;
      this._scale = 1;
      this._artboardOffsetX = Math.max(0, Math.round((width - designCanvas) / 2));
    } else if (designCanvas > width && width > 0 && !fullWidth) {
      // Canvas larger than the window — scale down only (edit === live).
      this._devicePreview = false;
      this._showWidthBounds = false;
      this._artboardWidth = designCanvas;
      this._scale = width / designCanvas;
      this._artboardOffsetX = 0;
    } else {
      // Full width (or canvas already fills): use the whole viewport at 1:1.
      this._devicePreview = false;
      this._showWidthBounds = false;
      this._artboardWidth = Math.max(width, 1);
      this._scale = 1;
      this._artboardOffsetX = 0;
    }
    this._engine.setScale(this._scale);

    const contentHeight = computeArtboardHeight(this._layouts, this._options.min_height);
    const availablePx = this._availableViewportPx();
    const fillHeight =
      this._scale > 0 && availablePx > 0
        ? Math.ceil(availablePx / this._scale)
        : 0;
    this._artboardHeight = Math.max(contentHeight, fillHeight, 1);

    viewport.style.height = `${this._artboardHeight * this._scale}px`;
    viewport.style.minHeight = '';
  }

  private async _copyFromDesktop(): Promise<void> {
    if (!this.lovelace?.saveConfig) return;
    const to = this._editBreakpoint;
    if (to === 'desktop') return;
    try {
      const next = copyBreakpointLayouts(this.lovelace.config, this.index, 'desktop', to, true);
      await this.lovelace.saveConfig(next);
      this._optimistic.clear();
      this._rebuildLayouts();
    } catch (err) {
      console.warn('[FreeSpace] copy breakpoint failed', err);
    }
  }

  private _onArtboardPointerDown = (ev: PointerEvent): void => {
    if (!this._editMode()) return;
    const path = ev.composedPath();
    const onItem = path.some(
      n => n instanceof HTMLElement && n.tagName.toLowerCase() === FREESPACE_ITEM_TAG
    );
    if (onItem) return;
    this._selected = null;
  };

  private _onFsEdit = (ev: Event): void => {
    const { cardIndex } = (ev as CustomEvent).detail;
    this._editCard(cardIndex);
  };

  private _onFsDuplicate = (ev: Event): void => {
    const { cardIndex } = (ev as CustomEvent).detail;
    this.dispatchEvent(
      new CustomEvent('ll-duplicate-card', {
        detail: { path: [this.index, cardIndex] },
        bubbles: true,
        composed: true,
      })
    );
  };

  private _onFsCopy = (ev: Event): void => {
    const { cardIndex } = (ev as CustomEvent).detail;
    this.dispatchEvent(
      new CustomEvent('ll-copy-card', {
        detail: { path: [this.index, cardIndex] },
        bubbles: true,
        composed: true,
      })
    );
  };

  private _onFsCut = (ev: Event): void => {
    const { cardIndex } = (ev as CustomEvent).detail;
    this.dispatchEvent(
      new CustomEvent('ll-copy-card', {
        detail: { path: [this.index, cardIndex] },
        bubbles: true,
        composed: true,
      })
    );
    this.dispatchEvent(
      new CustomEvent('ll-delete-card', {
        detail: { path: [this.index, cardIndex], silent: true },
        bubbles: true,
        composed: true,
      })
    );
  };

  private _onFsDelete = (ev: Event): void => {
    const { cardIndex } = (ev as CustomEvent).detail;
    this.dispatchEvent(
      new CustomEvent('ll-delete-card', {
        detail: { path: [this.index, cardIndex], silent: false },
        bubbles: true,
        composed: true,
      })
    );
  };

  private _onFsZOrder = async (ev: Event): Promise<void> => {
    const { cardIndex, action } = (ev as CustomEvent).detail as {
      cardIndex: number;
      action: ZOrderAction;
    };
    const next = applyZOrder(this._layouts, cardIndex, action);
    await this._persistAllLayouts(next);
  };

  private _onFsResetRotation = async (ev: Event): Promise<void> => {
    const { cardIndex } = (ev as CustomEvent).detail;
    const layout = { ...this._layouts[cardIndex], r: 0 };
    this._optimistic.set(this._optKey(cardIndex), layout);
    this._layouts = this._layouts.map((l, i) => (i === cardIndex ? layout : l));
    await this._persistLayout(cardIndex, layout);
  };

  private _addCard(): void {
    this.dispatchEvent(
      new CustomEvent('ll-create-card', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _importSections(): Promise<void> {
    if (!this.lovelace?.saveConfig) return;
    const view = this._viewConfig();
    const flattened = flattenSectionsToCards(view, this._options);
    flattened.type = 'custom:ultra-freespace-view';
    flattened.freespace = { ...this._options };
    const views = [...this.lovelace.config.views];
    views[this.index] = flattened;
    try {
      await this.lovelace.saveConfig({ ...this.lovelace.config, views });
      this._optimistic.clear();
      this.setConfig(flattened);
    } catch (err) {
      console.warn('[FreeSpace] import sections failed', err);
    }
  }

  private _onKeyDown = (ev: KeyboardEvent): void => {
    if (!this._editingAllowed() || this._selected === null) return;
    const target = ev.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

    const idx = this._selected;
    const layout = this._layouts[idx];
    if (!layout) return;
    const step = ev.shiftKey ? 10 : 1;

    if (ev.key === 'Escape') {
      this._selected = null;
      this._engine.cancel();
      return;
    }
    if (ev.key === 'Enter') {
      ev.preventDefault();
      this._editCard(idx);
      return;
    }
    if (ev.key === 'Delete' || ev.key === 'Backspace') {
      ev.preventDefault();
      this.dispatchEvent(
        new CustomEvent('ll-delete-card', {
          detail: { path: [this.index, idx], silent: false },
          bubbles: true,
          composed: true,
        })
      );
      return;
    }
    if (ev.key === '[') {
      ev.preventDefault();
      void this._onFsZOrder(
        new CustomEvent('fs-z-order', { detail: { cardIndex: idx, action: 'backward' } })
      );
      return;
    }
    if (ev.key === ']') {
      ev.preventDefault();
      void this._onFsZOrder(
        new CustomEvent('fs-z-order', { detail: { cardIndex: idx, action: 'forward' } })
      );
      return;
    }

    let next = layout;
    if (ev.key === 'ArrowLeft') next = { ...layout, x: layout.x - step };
    else if (ev.key === 'ArrowRight') next = { ...layout, x: layout.x + step };
    else if (ev.key === 'ArrowUp') next = { ...layout, y: Math.max(0, layout.y - step) };
    else if (ev.key === 'ArrowDown') next = { ...layout, y: layout.y + step };
    else return;

    ev.preventDefault();
    this._optimistic.set(this._optKey(idx), next);
    this._layouts = this._layouts.map((l, i) => (i === idx ? next : l));
    // Debounce-ish: persist immediately on key (HA saves are cheap enough for nudges)
    void this._persistLayout(idx, next);
  };

  private _icon(path: string) {
    return html`<svg viewBox="0 0 24 24"><path d=${path}></path></svg>`;
  }

  private _renderBreakpointBar() {
    if (!this._editMode() || !this._discoverable) return nothing;
    const active = this._editBreakpoint;
    const view = this._viewConfig();
    const cards = Array.isArray(view.cards) ? view.cards : [];
    const explicitCount = cards.filter((c: unknown) =>
      hasExplicitBreakpointLayout(parseViewLayoutStore((c as any)?.view_layout), active)
    ).length;

    return html`
      <div class="bp-bar" role="toolbar" aria-label=${this._t('breakpoints', 'Breakpoints')}>
        ${FREESPACE_BREAKPOINTS.map(bp => {
          const spec = BREAKPOINT_SPECS[bp];
          return html`
            <button
              type="button"
              class="bp-btn ${bp === active ? 'active' : ''}"
              title=${`${spec.label} (≥ ${spec.minWidth}px)`}
              @click=${() => this._setEditBreakpoint(bp)}
            >
              ${this._icon(BP_ICONS[bp])}
              ${this._t(`bp_${bp}`, spec.label)}
            </button>
          `;
        })}
        ${active !== 'desktop'
          ? html`
              <button
                type="button"
                class="bp-btn bp-copy"
                @click=${() => this._copyFromDesktop()}
                title=${this._t('copy_from_desktop', 'Copy Desktop layout here')}
              >
                ${this._icon(mdiContentCopy)}
                ${this._t('copy_from_desktop', 'Copy from Desktop')}
              </button>
            `
          : nothing}
        <span class="bp-meta">
          ${this._t('bp_explicit', '{count} cards with {bp} layout')
            .replace('{count}', String(explicitCount))
            .replace('{bp}', BREAKPOINT_SPECS[active].label)}
        </span>
      </div>
    `;
  }

  protected override render() {
    const editMode = this._editMode();
    const stacked = this._useStacked();
    const editingAllowed = this._editingAllowed();
    const view = this._viewConfig();
    const sectionCardCount = countSectionCards(view);
    const order = stacked ? stackOrder(this._layouts) : this._layouts.map((_, i) => i);

    return html`
      <div class="grid-layer" aria-hidden="true"></div>
      ${this.badges?.length
        ? html`<div class="badges">${this.badges.map(b => b)}</div>`
        : nothing}

      ${this._renderBreakpointBar()}

      ${editMode && sectionCardCount > 0
        ? html`
            <div class="banner">
              <span>
                ${this._t(
                  'import_sections',
                  'This view still has {count} cards in Sections. Import them into FreeSpace?'
                ).replace('{count}', String(sectionCardCount))}
              </span>
              <button type="button" @click=${() => this._importSections()}>
                ${this._t('import_sections_action', 'Import sections')}
              </button>
            </div>
          `
        : nothing}

      ${editMode && !this._connectInstalled
        ? html`
            <p class="hint">
              ${this._t(
                'requires_connect',
                'Install Ultra Card Connect to arrange FreeSpace cards.'
              )}
            </p>
          `
        : nothing}

      ${editMode && this._connectInstalled && !ucFreeSpaceSettingsService.isEnabled()
        ? html`
            <p class="hint">
              ${this._t(
                'enable_in_hub',
                'Enable FreeSpace in Ultra Card Hub → Home to unlock arranging tools.'
              )}
            </p>
          `
        : nothing}

      ${editMode && stacked
        ? html`
            <p class="hint">
              ${this._t(
                'narrow_hint',
                'Switch to a wider screen to arrange FreeSpace. Cards are stacked for readability.'
              )}
            </p>
          `
        : nothing}

      ${editMode && editingAllowed
        ? html`
            <p class="hint">
              ${this._t(
                'select_hint',
                'Click a card to select it. Double-click to edit. Right-click for the card menu. Click empty space to deselect.'
              )}
              ${this._devicePreview
                ? ` ${this._t(
                    'device_preview_hint',
                    'Showing {bp} at true size — same as on that device.'
                  ).replace('{bp}', BREAKPOINT_SPECS[this._activeBreakpoint()].label)}`
                : this._showWidthBounds
                  ? ` ${this._t(
                      'width_bounds_hint',
                      'Dashed lines mark the design canvas width (Hub → Home → Full width is off).'
                    )}`
                  : ''}${
                this._showWidthBounds && this._cardsOutsideWidthBounds()
                  ? ` ${this._t(
                      'outside_bounds_hint',
                      'Some cards sit outside the lines — they still work; drag them back to keep them inside the canvas.'
                    )}`
                  : ''
              }
            </p>
          `
        : nothing}

      <div class="viewport">
        ${editMode && this._showWidthBounds
          ? html`
              <div
                class="width-bound visible"
                style="left:${this._artboardOffsetX}px"
                title=${this._t('width_bound', 'Design canvas edge')}
              ></div>
              <div
                class="width-bound visible"
                style="left:${this._artboardOffsetX + Math.round(this._artboardWidth * this._scale)}px"
                title=${this._t('width_bound', 'Design canvas edge')}
              ></div>
            `
          : nothing}
        <div
          class="artboard ${stacked ? 'stacked' : ''} ${editMode && this._devicePreview ? 'device-preview' : ''} ${editMode && this._showWidthBounds ? 'width-bounds' : ''}"
          style=${stacked
            ? ''
            : `width:${this._artboardWidth}px;height:${this._artboardHeight}px;transform:scale(${this._scale});left:${this._artboardOffsetX}px`}
          @pointerdown=${this._onArtboardPointerDown}
        >
          ${!this.cards?.length
            ? html`<div class="empty">${this._t('empty', 'Add a card to start building.')}</div>`
            : order.map(i => {
                const card = this.cards[i];
                if (!card) return nothing;
                const layout = this._layouts[i];
                if (!layout) return nothing;
                return html`
                  <uc-freespace-item
                    .card=${card}
                    .layout=${layout}
                    .cardIndex=${i}
                    .editMode=${editMode}
                    .editingAllowed=${editingAllowed}
                    .selected=${this._selected === i}
                    .stacked=${stacked}
                    .scale=${this._scale}
                    @focus=${() => {
                      this._selected = i;
                    }}
                  ></uc-freespace-item>
                `;
              })}
          ${!stacked && (this._guides.vertical.length || this._guides.horizontal.length)
            ? html`
                <div class="guides">
                  ${this._guides.vertical.map(
                    x => html`<div class="guide-v" style="left:${x}px"></div>`
                  )}
                  ${this._guides.horizontal.map(
                    y => html`<div class="guide-h" style="top:${y}px"></div>`
                  )}
                </div>
              `
            : nothing}
        </div>
      </div>

      ${editingAllowed
        ? html`
            <button
              type="button"
              class="fab"
              aria-label=${this._t('add_card', 'Add card')}
              @click=${() => this._addCard()}
            >
              <svg viewBox="0 0 24 24"><path d=${mdiPlus}></path></svg>
            </button>
          `
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [FREESPACE_IMPL_TAG]: UltraFreeSpaceViewImpl;
  }
}

// Ensure the item tag is defined when this chunk loads.
void FREESPACE_ITEM_TAG;
