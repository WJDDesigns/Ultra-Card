/**
 * FreeSpace view implementation (lazy chunk).
 *
 * Receives pre-built hui-card / hui-badge elements from HA's hui-view and
 * lays them out on a scaled artboard with free drag / resize / rotate / layer.
 */

import { LitElement, html, css, nothing, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  mdiAlignHorizontalCenter,
  mdiAlignHorizontalLeft,
  mdiAlignHorizontalRight,
  mdiAlignVerticalBottom,
  mdiAlignVerticalCenter,
  mdiAlignVerticalTop,
  mdiArrangeBringForward,
  mdiArrangeBringToFront,
  mdiArrangeSendBackward,
  mdiArrangeSendToBack,
  mdiArrowExpandHorizontal,
  mdiCellphone,
  mdiContentCopy,
  mdiContentDuplicate,
  mdiDelete,
  mdiDistributeHorizontalCenter,
  mdiDistributeVerticalCenter,
  mdiFormatHorizontalAlignCenter,
  mdiFormatHorizontalAlignLeft,
  mdiFormatHorizontalAlignRight,
  mdiLaptop,
  mdiMagnet,
  mdiMonitor,
  mdiPencil,
  mdiPlus,
  mdiTablet,
} from '@mdi/js';
import { ucFreeSpaceSettingsService } from '../services/uc-freespace-settings-service';
import { ucSectionsLayoutService } from '../services/uc-sections-layout-service';
import { isConnectInstalled } from '../services/uc-connect-compatibility';
import { ucConfirmService } from '../services/uc-confirm-service';
import { localize } from '../localize/localize';
import {
  FREESPACE_IMPL_TAG,
  FREESPACE_ITEM_TAG,
  FREESPACE_PINS,
  type FreeSpaceAlign,
  type FreeSpaceCardLayout,
  type FreeSpacePin,
  type FreeSpaceViewOptions,
  type InteractionState,
  type ResizeHandle,
} from './types';
import {
  applyLayoutsToView,
  applyZOrder,
  assignDefaultLayouts,
  clearBreakpointLayouts,
  computeArtboardHeight,
  copyBreakpointLayouts,
  countSectionCards,
  effectiveCanvasWidth,
  flattenSectionsToCards,
  isBreakpointCustom,
  readFreeSpaceOptions,
  removeCards,
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
  alignGroup,
  alignInArtboard,
  alignmentGuides,
  cardsInRect,
  clampLayout,
  distributeGroup,
  resolvePinnedLayouts,
  snapLayout,
  snapToGuides,
  stackOrder,
  withPin,
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
  /** On-screen layouts: pins already applied for the current artboard width. */
  @state() private _layouts: FreeSpaceCardLayout[] = [];
  /** Snap to the view's grid while dragging (toolbar toggle, this session only). */
  @state() private _snapOn = true;
  @state() private _scale = 1;
  /** Painted artboard width in design px (may fill the viewport like Sections). */
  @state() private _artboardWidth = 1200;
  @state() private _artboardHeight = 800;
  @state() private _artboardOffsetX = 0;
  /** Edit preview of a narrower breakpoint (Phone/Tablet) on a wider screen. */
  @state() private _devicePreview = false;
  /** Artboard is narrower than the viewport (full width off) — show width bounds. */
  @state() private _showWidthBounds = false;
  /** Selected card indices; the last one is the primary (last clicked). */
  @state() private _selection: number[] = [];
  /** Marquee rectangle in artboard units while drag-selecting empty space. */
  @state() private _marquee: { left: number; top: number; right: number; bottom: number } | null =
    null;
  private get _selected(): number | null {
    return this._selection.length ? this._selection[this._selection.length - 1]! : null;
  }
  private set _selected(index: number | null) {
    this._selection = index === null ? [] : [index];
  }
  /** Layouts of the other selected cards at drag start (group move). */
  private _groupOrigins: Map<number, FreeSpaceCardLayout> | null = null;
  private _marqueeStart: {
    x: number;
    y: number;
    additive: boolean;
    base: number[];
    pointerId: number;
    moved: boolean;
    clientX: number;
    clientY: number;
  } | null = null;
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
  /** Stored layouts (before pins are applied). */
  private _rawLayouts: FreeSpaceCardLayout[] = [];
  /** Artboard width `_layouts` were resolved for; -1 forces a re-resolve, 0 = stacked. */
  private _pinWidth = -1;
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
      onClick: (index, additive) => {
        if (!additive) {
          this._selected = index;
          return;
        }
        this._selection = this._selection.includes(index)
          ? this._selection.filter(i => i !== index)
          : [...this._selection, index];
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
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 6;
      container-type: inline-size;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
      margin: 8px 16px 0;
      padding: 4px 6px;
      border-radius: 12px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color, var(--ha-card-background, #1c1c1c));
      box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0, 0, 0, 0.25));
    }
    .tb-group {
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }
    .tb-group.muted {
      opacity: 0.55;
    }
    .tb-sep {
      width: 1px;
      height: 22px;
      margin: 0 4px;
      background: var(--divider-color);
    }
    .tb-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 32px;
      min-width: 32px;
      padding: 0 8px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--primary-text-color);
      font: inherit;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      box-sizing: border-box;
    }
    .tb-btn:hover {
      background: rgba(127, 127, 127, 0.14);
    }
    .tb-btn.active {
      color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.14);
    }
    .tb-btn.danger {
      color: var(--error-color, #db4437);
    }
    .tb-btn:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 1px;
    }
    .tb-btn svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
      flex-shrink: 0;
    }
    .tb-field {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      height: 32px;
      padding: 0 6px;
      border-radius: 8px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      color: var(--secondary-text-color);
      font-size: 11px;
      font-weight: 600;
      box-sizing: border-box;
    }
    .tb-field:focus-within {
      outline: 2px solid var(--primary-color);
    }
    .tb-field input {
      width: 48px;
      border: none;
      outline: none;
      background: transparent;
      color: var(--primary-text-color);
      font: inherit;
      font-size: 12px;
      font-variant-numeric: tabular-nums;
      -moz-appearance: textfield;
    }
    .tb-field input::-webkit-outer-spin-button,
    .tb-field input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    .tb-segment {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 2px;
      border-radius: 10px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
    }
    .tb-count {
      padding: 0 6px;
      font-size: 12px;
      font-weight: 600;
      color: var(--primary-color);
      white-space: nowrap;
    }
    .marquee {
      position: absolute;
      border: 1px solid var(--primary-color);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);
      pointer-events: none;
      z-index: 9997;
    }
    .tb-meta {
      margin-left: auto;
      padding: 0 6px;
      font-size: 12px;
      color: var(--secondary-text-color);
      white-space: nowrap;
    }
    @container (max-width: 1100px) {
      .tb-btn .tb-label {
        display: none;
      }
    }
    .pin-line {
      position: absolute;
      height: 0;
      border-top: 1px dashed var(--primary-color);
      pointer-events: none;
      z-index: 9998;
    }
    .pin-line.vertical {
      width: 0;
      height: auto;
      border-top: none;
      border-left: 1px dashed var(--primary-color);
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
    this.addEventListener('fs-set-pin', this._onFsSetPin as EventListener);
    this.addEventListener('keydown', this._onKeyDown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._engine.detachWindowListeners();
    window.removeEventListener('pointermove', this._onMarqueeMove);
    window.removeEventListener('pointerup', this._onMarqueeUp);
    window.removeEventListener('pointercancel', this._onMarqueeUp);
    this._marqueeStart = null;
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
    this.removeEventListener('fs-set-pin', this._onFsSetPin as EventListener);
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
      const editing = !!this.lovelace?.editMode;
      this.toggleAttribute('edit', editing);
      if (!editing) {
        this._selected = null;
        this._guides = { vertical: [], horizontal: [] };
      }
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
    this._rawLayouts = assignDefaultLayouts(configs, this._options, optimistic, bp);
    this._layouts = this._rawLayouts;
    this._pinWidth = -1;
    // Pins and height are finalized in _updateScale.
    this._updateScale();
  }

  /** Replace layouts that are already in current-width coordinates. */
  private _commitLayouts(layouts: FreeSpaceCardLayout[]): void {
    this._rawLayouts = layouts;
    this._pinWidth = this._artboardWidth;
    this._layouts = layouts;
  }

  private _commitLayout(cardIndex: number, layout: FreeSpaceCardLayout): void {
    this._optimistic.set(this._optKey(cardIndex), layout);
    this._commitLayouts(this._layouts.map((l, i) => (i === cardIndex ? layout : l)));
  }

  private _grid(): number {
    return this._snapOn ? this._options.grid : 0;
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
    const pe = detail.pointerEvent;
    const additive = pe.shiftKey || pe.ctrlKey || pe.metaKey;
    const inSelection = this._selection.includes(detail.cardIndex);
    // Modifier clicks toggle on release; pressing an unselected card selects it alone.
    if (!additive && !inSelection) this._selected = detail.cardIndex;
    this._groupOrigins =
      detail.mode === 'move' && this._selection.length > 1 && this._selection.includes(detail.cardIndex)
        ? new Map(
            this._selection
              .filter(i => i !== detail.cardIndex && this._layouts[i])
              .map(i => [i, this._layouts[i]!] as [number, FreeSpaceCardLayout])
          )
        : null;
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
    const group = state.mode === 'move' ? this._groupOrigins : null;
    if (state.mode === 'move') {
      // Other selected cards move with this one, so they are not snap targets.
      const others = this._layouts.filter((_, i) => i === state.cardIndex || !group?.has(i));
      const self = others.indexOf(this._layouts[state.cardIndex]!);
      const guides = alignmentGuides(others, self);
      const snapped = snapToGuides(layout, guides);
      layout = snapped.layout;
      this._guides = { vertical: snapped.activeV, horizontal: snapped.activeH };
    } else {
      this._guides = { vertical: [], horizontal: [] };
    }
    if (this._grid() > 0 && state.mode !== 'rotate') {
      layout = snapLayout(layout, this._grid());
    }
    if (!group) {
      this._commitLayout(state.cardIndex, layout);
      return;
    }
    const dx = layout.x - state.origin.x;
    const dy = layout.y - state.origin.y;
    this._commitLayouts(
      this._layouts.map((l, i) => {
        if (i === state.cardIndex) return layout;
        const o = group.get(i);
        return o ? clampLayout({ ...o, x: o.x + dx, y: o.y + dy }) : l;
      })
    );
  }

  private async _onInteractionEnd(state: InteractionState, cancelled: boolean): Promise<void> {
    this._guides = { vertical: [], horizontal: [] };
    const group = this._groupOrigins;
    this._groupOrigins = null;
    if (cancelled) {
      this._optimistic.delete(this._optKey(state.cardIndex));
      group?.forEach((_, i) => this._optimistic.delete(this._optKey(i)));
      this._rebuildLayouts();
      return;
    }
    if (group) {
      await this._persistAllLayouts(this._layouts);
      return;
    }
    let layout = this._layouts[state.cardIndex] ?? state.current;
    if (this._grid() > 0 && state.mode !== 'rotate') {
      layout = snapLayout(layout, this._grid());
    }
    this._commitLayout(state.cardIndex, layout);
    await this._persistLayout(state.cardIndex, layout);
  }

  // ---------------------------------------------------------------- marquee

  private _artboardPoint(clientX: number, clientY: number): { x: number; y: number } | null {
    const rect = this._artboardRect();
    if (!rect || !(this._scale > 0)) return null;
    return { x: (clientX - rect.left) / this._scale, y: (clientY - rect.top) / this._scale };
  }

  private _onMarqueeMove = (ev: PointerEvent): void => {
    const s = this._marqueeStart;
    if (!s || ev.pointerId !== s.pointerId) return;
    if (!s.moved && Math.hypot(ev.clientX - s.clientX, ev.clientY - s.clientY) < 4) return;
    s.moved = true;
    const p = this._artboardPoint(ev.clientX, ev.clientY);
    if (!p) return;
    const rect = {
      left: Math.min(s.x, p.x),
      top: Math.min(s.y, p.y),
      right: Math.max(s.x, p.x),
      bottom: Math.max(s.y, p.y),
    };
    this._marquee = rect;
    const hit = cardsInRect(this._layouts, rect);
    this._selection = s.additive ? [...new Set([...s.base, ...hit])] : hit;
  };

  private _onMarqueeUp = (ev: PointerEvent): void => {
    const s = this._marqueeStart;
    if (!s || ev.pointerId !== s.pointerId) return;
    window.removeEventListener('pointermove', this._onMarqueeMove);
    window.removeEventListener('pointerup', this._onMarqueeUp);
    window.removeEventListener('pointercancel', this._onMarqueeUp);
    this._marqueeStart = null;
    this._marquee = null;
    // A plain click on empty space clears the selection.
    if (!s.moved && !s.additive) this._selection = [];
  };

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
          this._breakpointBase(this.lovelace.config, breakpoint),
          this.index,
          cardIndex,
          layout,
          this._grid(),
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
    this._commitLayouts(layouts);
    try {
      const base = this._breakpointBase(this.lovelace.config, bp);
      const next = applyLayoutsToView(base, this.index, layouts, bp);
      await this.lovelace.saveConfig(next);
    } catch (err) {
      console.warn('[FreeSpace] save failed', err);
    }
  }

  private _isCustom(bp: FreeSpaceBreakpoint, config: any = this.lovelace?.config): boolean {
    const cards = config?.views?.[this.index]?.cards;
    return isBreakpointCustom(Array.isArray(cards) ? cards : [], bp);
  }

  /**
   * The first edit on a breakpoint that uses Desktop makes it Custom: copy the
   * Desktop layout for every card so the whole breakpoint stops following
   * Desktop, not just the card being moved.
   */
  private _breakpointBase(config: any, bp: FreeSpaceBreakpoint): any {
    if (bp === 'desktop' || this._isCustom(bp, config)) return config;
    return copyBreakpointLayouts(config, this.index, 'desktop', bp);
  }

  private async _setBreakpointMode(mode: 'desktop' | 'custom'): Promise<void> {
    const bp = this._editBreakpoint;
    if (!this.lovelace?.saveConfig || bp === 'desktop') return;
    const isCustom = this._isCustom(bp);
    if ((mode === 'custom') === isCustom) return;
    const label = BREAKPOINT_SPECS[bp].label;
    if (mode === 'desktop') {
      const ok = await ucConfirmService.confirm(
        this._t('reset_to_desktop_title', 'Use the Desktop layout?').replace('{bp}', label),
        this._t(
          'reset_to_desktop_body',
          'Your {bp} positions will be removed and {bp} will follow the Desktop layout again.'
        ).replace(/\{bp\}/g, label),
        { destructive: true, confirmText: this._t('reset_to_desktop_confirm', 'Use Desktop') }
      );
      if (!ok) return;
    }
    try {
      const config = this.lovelace.config;
      const next =
        mode === 'custom'
          ? copyBreakpointLayouts(config, this.index, 'desktop', bp)
          : clearBreakpointLayouts(config, this.index, bp);
      this._selection = [];
      this._optimistic.clear();
      await this.lovelace.saveConfig(next);
      this._rebuildLayouts();
    } catch (err) {
      console.warn('[FreeSpace] breakpoint layout change failed', err);
    }
  }

  private async _deleteSelection(): Promise<void> {
    const indices = [...this._selection];
    if (!indices.length || !this.lovelace?.saveConfig) return;
    const ok = await ucConfirmService.confirm(
      this._t('delete_selected_title', 'Delete {count} cards?').replace('{count}', String(indices.length)),
      this._t('delete_selected_body', 'The selected cards will be removed from this view.'),
      { destructive: true, confirmText: this._t('tb_delete', 'Delete') }
    );
    if (!ok) return;
    try {
      this._selection = [];
      this._optimistic.clear();
      await this.lovelace.saveConfig(removeCards(this.lovelace.config, this.index, indices));
    } catch (err) {
      console.warn('[FreeSpace] delete failed', err);
    }
  }

  private _alignSelection(align: FreeSpaceAlign): void {
    void this._persistAllLayouts(alignGroup(this._layouts, this._selection, align));
  }

  private _distributeSelection(axis: 'horizontal' | 'vertical'): void {
    void this._persistAllLayouts(distributeGroup(this._layouts, this._selection, axis));
  }

  private _pinSelection(pin: FreeSpacePin): void {
    const sel = new Set(this._selection);
    void this._persistAllLayouts(
      this._layouts.map((l, i) => (sel.has(i) ? withPin(l, pin, this._artboardWidth) : l))
    );
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
    if (!this._selection.includes(cardIndex)) this._selected = cardIndex;
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
        this._rawLayouts = assignDefaultLayouts(configs, this._options, optimistic, bp);
        this._layouts = this._rawLayouts;
        this._pinWidth = -1;
      }
    }
    if (this._useStacked()) {
      this._scale = 1;
      this._artboardWidth = width;
      this._artboardOffsetX = 0;
      this._devicePreview = false;
      this._showWidthBounds = false;
      if (this._pinWidth !== 0) {
        this._pinWidth = 0;
        this._layouts = this._rawLayouts;
      }
      this._engine.setScale(1);
      this._artboardHeight = computeArtboardHeight(this._layouts, this._options.min_height);
      viewport.style.height = '';
      viewport.style.minHeight = '';
      return;
    }

    const designCanvas = this._canvasWidth();
    const fullWidth = this._preferFullWidth();
    // Editing a smaller breakpoint on a larger screen (Phone on desktop) uses a
    // centred frame at that device's canvas width with edge guides, so cards
    // are placed within the real device width rather than across the monitor.
    const devicePreview =
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
    if (this._pinWidth !== this._artboardWidth) {
      this._pinWidth = this._artboardWidth;
      this._layouts = resolvePinnedLayouts(this._rawLayouts, this._artboardWidth);
    }

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

  private _onArtboardPointerDown = (ev: PointerEvent): void => {
    if (!this._editMode()) return;
    const path = ev.composedPath();
    const onItem = path.some(
      n => n instanceof HTMLElement && n.tagName.toLowerCase() === FREESPACE_ITEM_TAG
    );
    if (onItem) return;
    const p = this._artboardPoint(ev.clientX, ev.clientY);
    if (!this._editingAllowed() || ev.pointerType === 'touch' || ev.button !== 0 || !p) {
      this._selected = null;
      return;
    }
    ev.preventDefault();
    this._marqueeStart = {
      x: p.x,
      y: p.y,
      additive: ev.shiftKey || ev.ctrlKey || ev.metaKey,
      base: [...this._selection],
      pointerId: ev.pointerId,
      moved: false,
      clientX: ev.clientX,
      clientY: ev.clientY,
    };
    window.addEventListener('pointermove', this._onMarqueeMove);
    window.addEventListener('pointerup', this._onMarqueeUp);
    window.addEventListener('pointercancel', this._onMarqueeUp);
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
    const current = this._layouts[cardIndex];
    if (!current) return;
    await this._updateCardLayout(cardIndex, { ...current, r: 0 });
  };

  private _onFsSetPin = async (ev: Event): Promise<void> => {
    const { cardIndex, pin } = (ev as CustomEvent).detail as {
      cardIndex: number;
      pin: FreeSpacePin;
    };
    this._setPin(cardIndex, pin);
  };

  private async _updateCardLayout(cardIndex: number, layout: FreeSpaceCardLayout): Promise<void> {
    this._commitLayout(cardIndex, layout);
    await this._persistLayout(cardIndex, layout);
  }

  private _setPin(cardIndex: number, pin: FreeSpacePin): void {
    const current = this._layouts[cardIndex];
    if (!current || (current.pin ?? 'left') === pin) return;
    void this._updateCardLayout(cardIndex, withPin(current, pin, this._artboardWidth));
  }

  private _align(cardIndex: number, align: FreeSpaceAlign): void {
    const current = this._layouts[cardIndex];
    if (!current) return;
    void this._updateCardLayout(cardIndex, alignInArtboard(current, align, this._artboardWidth));
  }

  private _setField(cardIndex: number, key: 'x' | 'y' | 'w' | 'h' | 'r', raw: string): void {
    const current = this._layouts[cardIndex];
    const value = Number(raw);
    if (!current || raw.trim() === '' || !Number.isFinite(value)) {
      this.requestUpdate();
      return;
    }
    void this._updateCardLayout(cardIndex, clampLayout({ ...current, [key]: value }));
  }

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
    if (!this._editingAllowed()) return;
    // ev.target is retargeted to this host for events from our shadow DOM
    // (toolbar inputs), so check the real origin.
    const target = ev.composedPath()[0] as HTMLElement | undefined;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'a') {
      ev.preventDefault();
      this._selection = this._layouts.map((_, i) => i);
      return;
    }
    if (this._selected === null) return;

    const idx = this._selected;
    const layout = this._layouts[idx];
    if (!layout) return;
    const step = ev.shiftKey ? 10 : 1;
    const multi = this._selection.length > 1;

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
      if (multi) {
        void this._deleteSelection();
        return;
      }
      this.dispatchEvent(
        new CustomEvent('ll-delete-card', {
          detail: { path: [this.index, idx], silent: false },
          bubbles: true,
          composed: true,
        })
      );
      return;
    }
    if (multi && ev.key.startsWith('Arrow')) {
      ev.preventDefault();
      const dx = ev.key === 'ArrowLeft' ? -step : ev.key === 'ArrowRight' ? step : 0;
      const dy = ev.key === 'ArrowUp' ? -step : ev.key === 'ArrowDown' ? step : 0;
      const sel = new Set(this._selection);
      void this._persistAllLayouts(
        this._layouts.map((l, i) => (sel.has(i) ? clampLayout({ ...l, x: l.x + dx, y: l.y + dy }) : l))
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
    // Debounce-ish: persist immediately on key (HA saves are cheap enough for nudges)
    void this._updateCardLayout(idx, next);
  };

  private _icon(path: string) {
    return html`<svg viewBox="0 0 24 24"><path d=${path}></path></svg>`;
  }

  private _tbButton(opts: {
    icon: string;
    label: string;
    onClick: () => void;
    active?: boolean;
    showLabel?: boolean;
    danger?: boolean;
    title?: string;
  }) {
    return html`
      <button
        type="button"
        class="tb-btn ${opts.active ? 'active' : ''} ${opts.danger ? 'danger' : ''}"
        title=${opts.title ?? opts.label}
        aria-label=${opts.label}
        aria-pressed=${opts.active === undefined ? nothing : opts.active ? 'true' : 'false'}
        @click=${opts.onClick}
      >
        ${this._icon(opts.icon)}
        ${opts.showLabel ? html`<span class="tb-label">${opts.label}</span>` : nothing}
      </button>
    `;
  }

  private _tbField(
    idx: number,
    key: 'x' | 'y' | 'w' | 'h' | 'r',
    label: string,
    value: number
  ) {
    return html`
      <label class="tb-field" title=${this._t(`tb_field_${key}`, label)}>
        ${label}
        <input
          type="number"
          inputmode="decimal"
          .value=${String(Math.round(value))}
          @change=${(e: Event) => this._setField(idx, key, (e.target as HTMLInputElement).value)}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
        />
      </label>
    `;
  }

  private _renderSelectionTools(idx: number, layout: FreeSpaceCardLayout) {
    const pin = layout.pin ?? 'left';
    const pinsActive = this._preferFullWidth();
    const pinNote = pinsActive
      ? ''
      : ` ${this._t('tb_pin_inactive', '(takes effect when Full width is on in Hub → Home)')}`;
    const pinMeta = this._pinMeta();
    const zOrder = (action: ZOrderAction) =>
      void this._onFsZOrder(new CustomEvent('fs-z-order', { detail: { cardIndex: idx, action } }));

    return html`
      <span class="tb-sep"></span>
      <div class="tb-group">
        ${this._tbField(idx, 'x', 'X', layout.x)} ${this._tbField(idx, 'y', 'Y', layout.y)}
        ${this._tbField(idx, 'w', 'W', layout.w)} ${this._tbField(idx, 'h', 'H', layout.h)}
        ${this._tbField(idx, 'r', '°', layout.r)}
      </div>
      <span class="tb-sep"></span>
      <div
        class="tb-group ${pinsActive ? '' : 'muted'}"
        role="radiogroup"
        aria-label=${this._t('tb_pin', 'Horizontal pin')}
      >
        ${FREESPACE_PINS.map(p =>
          this._tbButton({
            icon: pinMeta[p].icon,
            label: pinMeta[p].label,
            title: `${pinMeta[p].label}${pinNote}`,
            active: pin === p,
            onClick: () => this._setPin(idx, p),
          })
        )}
      </div>
      <span class="tb-sep"></span>
      <div class="tb-group" aria-label=${this._t('tb_align', 'Align')}>
        ${(
          [
            ['left', mdiAlignHorizontalLeft, this._t('tb_align_left', 'Align left')],
            ['center', mdiAlignHorizontalCenter, this._t('tb_align_center', 'Align center')],
            ['right', mdiAlignHorizontalRight, this._t('tb_align_right', 'Align right')],
            ['top', mdiAlignVerticalTop, this._t('tb_align_top', 'Align top')],
          ] as Array<[FreeSpaceAlign, string, string]>
        ).map(([a, icon, label]) => this._tbButton({ icon, label, onClick: () => this._align(idx, a) }))}
      </div>
      <span class="tb-sep"></span>
      <div class="tb-group" aria-label=${this._t('tb_layer', 'Layer')}>
        ${this._tbButton({ icon: mdiArrangeBringToFront, label: this._t('tb_front', 'Bring to front'), onClick: () => zOrder('front') })}
        ${this._tbButton({ icon: mdiArrangeBringForward, label: this._t('tb_forward', 'Bring forward'), onClick: () => zOrder('forward') })}
        ${this._tbButton({ icon: mdiArrangeSendBackward, label: this._t('tb_backward', 'Send backward'), onClick: () => zOrder('backward') })}
        ${this._tbButton({ icon: mdiArrangeSendToBack, label: this._t('tb_back', 'Send to back'), onClick: () => zOrder('back') })}
      </div>
      <span class="tb-sep"></span>
      <div class="tb-group">
        ${this._tbButton({ icon: mdiPencil, label: this._t('tb_edit', 'Edit card'), onClick: () => this._editCard(idx) })}
        ${this._tbButton({
          icon: mdiContentDuplicate,
          label: this._t('tb_duplicate', 'Duplicate'),
          onClick: () => this._onFsDuplicate(new CustomEvent('fs-duplicate-card', { detail: { cardIndex: idx } })),
        })}
        ${this._tbButton({
          icon: mdiDelete,
          label: this._t('tb_delete', 'Delete'),
          danger: true,
          onClick: () => this._onFsDelete(new CustomEvent('fs-delete-card', { detail: { cardIndex: idx } })),
        })}
      </div>
    `;
  }

  private _pinMeta(): Record<FreeSpacePin, { icon: string; label: string }> {
    return {
      left: { icon: mdiFormatHorizontalAlignLeft, label: this._t('tb_pin_left', 'Pin left') },
      center: { icon: mdiFormatHorizontalAlignCenter, label: this._t('tb_pin_center', 'Pin center') },
      right: { icon: mdiFormatHorizontalAlignRight, label: this._t('tb_pin_right', 'Pin right') },
      stretch: {
        icon: mdiArrowExpandHorizontal,
        label: this._t('tb_pin_stretch', 'Pin left & right (stretch)'),
      },
    };
  }

  private _renderMultiTools() {
    const sel = this._selection;
    const picked = sel.map(i => this._layouts[i]).filter(Boolean) as FreeSpaceCardLayout[];
    const pins = new Set(picked.map(l => l.pin ?? 'left'));
    const sharedPin = pins.size === 1 ? [...pins][0] : null;
    const pinsActive = this._preferFullWidth();
    const pinNote = pinsActive
      ? ''
      : ` ${this._t('tb_pin_inactive', '(takes effect when Full width is on in Hub → Home)')}`;
    const pinMeta = this._pinMeta();
    const aligns: Array<[FreeSpaceAlign, string, string]> = [
      ['left', mdiAlignHorizontalLeft, this._t('tb_align_left', 'Align left')],
      ['center', mdiAlignHorizontalCenter, this._t('tb_align_center', 'Align center')],
      ['right', mdiAlignHorizontalRight, this._t('tb_align_right', 'Align right')],
      ['top', mdiAlignVerticalTop, this._t('tb_align_top', 'Align top')],
      ['middle', mdiAlignVerticalCenter, this._t('tb_align_middle', 'Align middle')],
      ['bottom', mdiAlignVerticalBottom, this._t('tb_align_bottom', 'Align bottom')],
    ];
    const canDistribute = sel.length >= 3;

    return html`
      <span class="tb-sep"></span>
      <span class="tb-count">
        ${this._t('tb_selected', '{count} selected').replace('{count}', String(sel.length))}
      </span>
      <span class="tb-sep"></span>
      <div class="tb-group" aria-label=${this._t('tb_align', 'Align')}>
        ${aligns.map(([a, icon, label]) =>
          this._tbButton({ icon, label, onClick: () => this._alignSelection(a) })
        )}
      </div>
      <span class="tb-sep"></span>
      <div class="tb-group ${canDistribute ? '' : 'muted'}" aria-label=${this._t('tb_distribute', 'Distribute')}>
        ${this._tbButton({
          icon: mdiDistributeHorizontalCenter,
          label: this._t('tb_distribute_h', 'Distribute horizontally'),
          title: canDistribute
            ? this._t('tb_distribute_h', 'Distribute horizontally')
            : this._t('tb_distribute_need', 'Select 3 or more cards to distribute'),
          onClick: () => canDistribute && this._distributeSelection('horizontal'),
        })}
        ${this._tbButton({
          icon: mdiDistributeVerticalCenter,
          label: this._t('tb_distribute_v', 'Distribute vertically'),
          title: canDistribute
            ? this._t('tb_distribute_v', 'Distribute vertically')
            : this._t('tb_distribute_need', 'Select 3 or more cards to distribute'),
          onClick: () => canDistribute && this._distributeSelection('vertical'),
        })}
      </div>
      <span class="tb-sep"></span>
      <div
        class="tb-group ${pinsActive ? '' : 'muted'}"
        role="radiogroup"
        aria-label=${this._t('tb_pin', 'Horizontal pin')}
      >
        ${FREESPACE_PINS.map(p =>
          this._tbButton({
            icon: pinMeta[p].icon,
            label: pinMeta[p].label,
            title: `${pinMeta[p].label}${pinNote}`,
            active: sharedPin === p,
            onClick: () => this._pinSelection(p),
          })
        )}
      </div>
      <span class="tb-sep"></span>
      <div class="tb-group">
        ${this._tbButton({
          icon: mdiDelete,
          label: this._t('tb_delete', 'Delete'),
          danger: true,
          onClick: () => void this._deleteSelection(),
        })}
      </div>
    `;
  }

  private _renderToolbar() {
    if (!this._editMode() || !this._discoverable) return nothing;
    const active = this._editBreakpoint;
    const editing = this._editingAllowed();
    const idx = editing ? this._selected : null;
    const selectedLayout = idx !== null ? this._layouts[idx] : undefined;
    const multi = editing && this._selection.length > 1;
    const custom = this._isCustom(active);

    return html`
      <div class="toolbar" role="toolbar" aria-label=${this._t('toolbar', 'FreeSpace tools')}>
        <div class="tb-group" role="radiogroup" aria-label=${this._t('breakpoints', 'Breakpoints')}>
          ${FREESPACE_BREAKPOINTS.map(bp => {
            const spec = BREAKPOINT_SPECS[bp];
            return this._tbButton({
              icon: BP_ICONS[bp],
              label: this._t(`bp_${bp}`, spec.label),
              title: `${spec.label} (≥ ${spec.minWidth}px)`,
              active: bp === active,
              showLabel: true,
              onClick: () => this._setEditBreakpoint(bp),
            });
          })}
        </div>
        ${active !== 'desktop'
          ? html`
              <span class="tb-sep"></span>
              <div
                class="tb-segment"
                role="radiogroup"
                aria-label=${this._t('bp_layout', '{bp} layout').replace('{bp}', BREAKPOINT_SPECS[active].label)}
              >
                ${this._tbButton({
                  icon: mdiMonitor,
                  label: this._t('use_desktop', 'Use Desktop'),
                  title: this._t(
                    'use_desktop_hint',
                    'Follow the Desktop layout. Moving a card here switches to Custom.'
                  ),
                  active: !custom,
                  showLabel: true,
                  onClick: () => void this._setBreakpointMode('desktop'),
                })}
                ${this._tbButton({
                  icon: mdiPencil,
                  label: this._t('custom_layout', 'Custom'),
                  title: this._t('custom_layout_hint', 'Arrange this screen size on its own'),
                  active: custom,
                  showLabel: true,
                  onClick: () => void this._setBreakpointMode('custom'),
                })}
              </div>
            `
          : nothing}
        ${multi
          ? this._renderMultiTools()
          : idx !== null && selectedLayout
          ? this._renderSelectionTools(idx, selectedLayout)
          : html`
              <span class="tb-sep"></span>
              <div class="tb-group">
                ${this._options.grid > 0
                  ? this._tbButton({
                      icon: mdiMagnet,
                      label: this._t('tb_snap', 'Snap to grid'),
                      active: this._snapOn,
                      showLabel: true,
                      onClick: () => (this._snapOn = !this._snapOn),
                    })
                  : nothing}
                ${this._editingAllowed()
                  ? this._tbButton({
                      icon: mdiPlus,
                      label: this._t('add_card', 'Add card'),
                      showLabel: true,
                      onClick: () => this._addCard(),
                    })
                  : nothing}
              </div>
              ${editing
                ? html`<span class="tb-meta">
                    ${this._t('tb_multi_hint', 'Shift-click or drag on empty space to select several')}
                  </span>`
                : nothing}
            `}
      </div>
    `;
  }

  /** Dashed lines from the selected card to the edge(s) it is pinned to. */
  private _renderPinLines() {
    if (!this._editMode() || this._selected === null || this._selection.length > 1) return nothing;
    const l = this._layouts[this._selected];
    if (!l?.pin || l.pin === 'left') return nothing;
    const W = this._artboardWidth;
    const midY = l.y + l.h / 2;
    const toLeft = html`<div class="pin-line" style="left:0;width:${Math.max(0, l.x)}px;top:${midY}px"></div>`;
    const toRight = html`<div
      class="pin-line"
      style="left:${l.x + l.w}px;width:${Math.max(0, W - l.x - l.w)}px;top:${midY}px"
    ></div>`;
    if (l.pin === 'right') return toRight;
    if (l.pin === 'stretch') return html`${toLeft}${toRight}`;
    return html`<div
      class="pin-line vertical"
      style="left:${W / 2}px;top:${l.y - 12}px;height:${l.h + 24}px"
    ></div>`;
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

      ${this._renderToolbar()}

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

      ${editMode && stacked
        ? html`
            <p class="hint">
              ${this._t(
                'narrow_hint',
                'Phone is using the Desktop layout, stacked for readability. Choose Custom in the toolbar to arrange a Phone layout.'
              )}
            </p>
          `
        : nothing}

      ${editMode && editingAllowed
        ? html`
            <p class="hint">
              ${this._t(
                'select_hint',
                'Click to select, Shift-click or drag on empty space to select several. Double-click to edit. Right-click for the card menu.'
              )}
              ${this._devicePreview
                ? ` ${this._t(
                    'device_preview_hint',
                    'Showing {bp} at true size. Dashed lines mark the device edges.'
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
                    .selected=${this._selection.includes(i)}
                    .stacked=${stacked}
                    .scale=${this._scale}
                    @focus=${() => {
                      if (!this._selection.includes(i)) this._selected = i;
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
          ${!stacked ? this._renderPinLines() : nothing}
          ${this._marquee
            ? html`<div
                class="marquee"
                style="left:${this._marquee.left}px;top:${this._marquee.top}px;width:${this._marquee.right -
                this._marquee.left}px;height:${this._marquee.bottom - this._marquee.top}px"
              ></div>`
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
