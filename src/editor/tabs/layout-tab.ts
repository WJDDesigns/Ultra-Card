import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { HomeAssistant } from 'custom-card-helpers';
import {
  UltraCardConfig,
  CardRow,
  CardColumn,
  CardModule,
  TextModule,
  SeparatorModule,
  ImageModule,
  BarModule,
  DisplayCondition,
  LayoutConfig,
} from '../../types';
import '../../components/ultra-color-picker';
import { getModuleRegistry } from '../../modules/module-registry';
import { BaseUltraModule } from '../../modules/base-module';
import { cleanupExternalCardCache } from '../../modules/external-card-module';
import { UcHoverEffectsService } from '../../services/uc-hover-effects-service';
import '../global-design-tab';
import { DesignProperties } from '../global-design-tab';
import { GlobalLogicTab } from '../../tabs/global-logic-tab';
import { logicService } from '../../services/logic-service';
import { getImageUrl, uploadImage } from '../../utils/image-upload';
import { localize } from '../../localize/localize';
import { Z_INDEX } from '../../utils/uc-z-index';
import { ucPresetsService } from '../../services/uc-presets-service';
import { ucFavoritesService } from '../../services/uc-favorites-service';
import { ThirdPartyLimitService, getCurrentDashboardId } from '../../pro/third-party-limit-service';
import { isThirdParty } from '../../pro/is-third-party';
import { ucExportImportService } from '../../services/uc-export-import-service';
import { ucDashboardScannerService } from '../../services/uc-dashboard-scanner-service';
import { ucModulePreviewService } from '../../services/uc-module-preview-service';
import { ucCloudAuthService } from '../../services/uc-cloud-auth-service';
import { ucExternalCardsService } from '../../services/uc-external-cards-service';
import {
  PresetDefinition,
  FavoriteRow,
  ExportData,
  HoverEffectConfig,
  EntityMapping,
  EntityReference,
} from '../../types';
import '../../components/uc-favorite-dialog';
import '../../components/uc-import-dialog';
import { simpleEntityMapper } from '../../components/uc-simple-entity-mapper';
import { entityDetector } from '../../services/uc-entity-detector';
import { entityMapper } from '../../services/uc-entity-mapper';

// Typography and font definitions matching the professional interface
const DEFAULT_FONTS = [{ value: 'default', label: '– Default –', category: 'default' }];

const TYPOGRAPHY_FONTS = [
  { value: 'Montserrat', label: 'Montserrat (used as default font)', category: 'typography' },
];

const WEB_SAFE_FONTS = [
  { value: 'Georgia, serif', label: 'Georgia, serif', category: 'websafe' },
  {
    value: 'Palatino Linotype, Book Antiqua, Palatino, serif',
    label: 'Palatino Linotype, Book Antiqua, Palatino, serif',
    category: 'websafe',
  },
  {
    value: 'Times New Roman, Times, serif',
    label: 'Times New Roman, Times, serif',
    category: 'websafe',
  },
  {
    value: 'Arial, Helvetica, sans-serif',
    label: 'Arial, Helvetica, sans-serif',
    category: 'websafe',
  },
  {
    value: 'Impact, Charcoal, sans-serif',
    label: 'Impact, Charcoal, sans-serif',
    category: 'websafe',
  },
  {
    value: 'Lucida Sans Unicode, Lucida Grande, sans-serif',
    label: 'Lucida Sans Unicode, Lucida Grande, sans-serif',
    category: 'websafe',
  },
  { value: 'Tahoma, Geneva, sans-serif', label: 'Tahoma, Geneva, sans-serif', category: 'websafe' },
  {
    value: 'Trebuchet MS, Helvetica, sans-serif',
    label: 'Trebuchet MS, Helvetica, sans-serif',
    category: 'websafe',
  },
  {
    value: 'Verdana, Geneva, sans-serif',
    label: 'Verdana, Geneva, sans-serif',
    category: 'websafe',
  },
  {
    value: 'Courier New, Courier, monospace',
    label: 'Courier New, Courier, monospace',
    category: 'websafe',
  },
  {
    value: 'Lucida Console, Monaco, monospace',
    label: 'Lucida Console, Monaco, monospace',
    category: 'websafe',
  },
];

@customElement('ultra-layout-tab')
export class LayoutTab extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public config!: UltraCardConfig;
  @property({ attribute: false }) public cloudUser?: any | null;

  @state() private _showModuleSelector = false;
  @state() private _selectedRowIndex = -1;
  @state() private _selectedColumnIndex = -1;
  @state() private _showModuleSettings = false;
  @state() private _selectedModule: {
    rowIndex: number;
    columnIndex: number;
    moduleIndex: number;
  } | null = null;
  @state() private _activeModuleTab = 'general';
  @state() private _activeDesignSubtab = 'text';

  // Row settings state
  @state() private _showRowSettings = false;
  @state() private _selectedRowForSettings = -1;
  @state() private _activeRowTab = 'general';

  // Column settings state
  @state() private _showColumnSettings = false;
  @state() private _selectedColumnForSettings: {
    rowIndex: number;
    columnIndex: number;
  } | null = null;
  @state() private _activeColumnTab = 'general';

  // Column layout selector state
  @state() private _showColumnLayoutSelector = false;
  @state() private _selectedRowForLayout = -1;

  // Collapsible preview in headers - now tracks per module
  @state() private _collapsedPreviewModules: Set<string> = new Set();
  // Global preview state for row/column settings (open by default)
  @state() private _isRowColumnPreviewCollapsed = false;
  // Track collapsed condition items by id (not in set => expanded)
  @state() private _collapsedConditionIds: Set<string> = new Set();
  // Track collapsed rows and columns
  @state() private _collapsedRows: Set<number> = new Set();
  @state() private _collapsedColumns: Set<string> = new Set();
  // Pin state for preview window (unpinned by default)
  @state() private _isPreviewPinned = false;
  // Drag state for condition reordering
  @state() private _draggingCondition:
    | { scope: 'module'; fromIndex: number }
    | { scope: 'row'; fromIndex: number }
    | { scope: 'column'; fromIndex: number }
    | null = null;

  // Global external card count across all Ultra Card instances
  @state() private _globalExternalCardCount = 0;

  // New state properties for presets, favorites, and export/import
  @state() private _activeModuleSelectorTab: 'modules' | '3rdparty' | 'presets' | 'favorites' =
    'modules';
  @state() private _activeModuleCategoryTab: 'standard' | 'pro' = 'standard';
  @state() private _selectedPresetCategory: 'all' | 'badges' | 'layouts' | 'widgets' | 'custom' =
    'all';
  @state() private _showFavoriteDialog = false;
  @state() private _favoriteRowToSave: CardRow | null = null;
  @state() private _showImportDialog = false;
  @state() private _openMoreMenuRowIndex: number = -1;

  // Undo/Redo state management
  @state() private _undoStack: { rows: CardRow[] }[] = [];
  @state() private _redoStack: { rows: CardRow[] }[] = [];
  private _maxHistorySize = 50; // Maximum number of undo states to keep
  private _isUndoRedoAction = false; // Flag to prevent saving undo states during undo/redo

  /** Listen for template updates from modules to refresh live previews */
  private _templateUpdateListener?: () => void;
  private _tabSwitchListener?: (e: CustomEvent) => void;
  private _documentClickListener?: (e: Event) => void;
  private _keydownListener?: (e: KeyboardEvent) => void;

  // Debouncing for template updates to prevent animation loops
  private _templateUpdateTimer?: number;
  private _lastTemplateUpdate = 0;

  // Scroll position preservation for mobile
  private _savedScrollPosition: number | null = null;
  private _shouldRestoreScroll = false;

  @state() private _entityMappingOpen = false;

  connectedCallback(): void {
    super.connectedCallback();
    this._templateUpdateListener = () => {
      // Debounce: only update once every 100ms to prevent animation loops
      const now = Date.now();
      if (now - this._lastTemplateUpdate < 100) {
        clearTimeout(this._templateUpdateTimer);
        this._templateUpdateTimer = window.setTimeout(() => {
          this._performTemplateUpdate();
        }, 100);
        return;
      }

      this._lastTemplateUpdate = now;
      this._performTemplateUpdate();
    };
    window.addEventListener('ultra-card-template-update', this._templateUpdateListener);
    // Also listen for slider updates
    window.addEventListener('ultra-card-slider-update', this._templateUpdateListener);

    // Listen for tab switch events from modules
    this._tabSwitchListener = (e: CustomEvent) => {
      if (e.detail?.tab === 'actions') {
        this._activeModuleTab = 'actions';
        this.requestUpdate();
        // Scroll to top of the popup content to show the actions section
        setTimeout(() => {
          const popupContent = this.shadowRoot?.querySelector('.popup-content');
          if (popupContent) {
            popupContent.scrollTop = 0;
          }
        }, 50);
      }
    };
    document.addEventListener('switch-to-actions-tab', this._tabSwitchListener);

    // Add window resize listener for popup repositioning
    this._windowResizeListener = () => {
      this._handleWindowResize();
    };
    window.addEventListener('resize', this._windowResizeListener);

    // Close more menu when clicking outside
    this._documentClickListener = (e: Event) => {
      if (this._openMoreMenuRowIndex !== -1) {
        const target = e.target as HTMLElement;
        if (!target.closest('.row-more-container')) {
          this._openMoreMenuRowIndex = -1;
        }
      }
    };
    document.addEventListener('click', this._documentClickListener);

    // Add keyboard shortcuts for undo/redo
    this._keydownListener = (e: KeyboardEvent) => {
      // Check if we're focused on an input element
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return; // Don't intercept keyboard shortcuts when typing in input fields
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        this._undo();
      } else if (ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        this._redo();
      }
    };
    document.addEventListener('keydown', this._keydownListener);

    // Inject hover effect styles into layout tab's shadow root for popup previews
    UcHoverEffectsService.injectHoverEffectStyles(this.shadowRoot!);

    // Update hover styles with current configuration
    this._updateHoverEffectStyles();
  }

  /** Determine if current device/viewport should be treated as mobile */
  private _isMobileDevice(): boolean {
    // Check for mobile viewport size (including iPhone in landscape)
    const isMobileViewport = window.innerWidth <= 768 || window.innerHeight <= 768;

    // Check for mobile user agents
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // Check for touch capability (additional mobile indicator)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return isMobileViewport || isMobileUserAgent || (isTouchDevice && window.innerWidth <= 1024);
  }

  private _handleWindowResize(): void {
    // Debounce resize events to avoid excessive repositioning
    clearTimeout(this._resizeTimeout);
    this._resizeTimeout = setTimeout(() => {
      // Reposition all visible popups to stay centered and within viewport
      const popups = document.querySelectorAll('.draggable-popup');
      popups.forEach(popup => {
        const element = popup as HTMLElement;
        if (element.offsetParent !== null) {
          // Only handle visible popups
          this._repositionPopup(element);
        }
      });
    }, 100);
  }

  private _repositionPopup(element: HTMLElement): void {
    const isMobile = this._isMobileDevice();
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // On mobile, let CSS handle positioning - just ensure it's not dragged off-screen
    if (isMobile) {
      // Reset any drag positioning and let CSS handle mobile layout
      element.style.position = 'fixed';
      element.style.top = '50%';
      element.style.left = '50%';
      element.style.transform = 'translate(-50%, -50%)';
      element.style.marginLeft = '';
      element.style.marginTop = '';
      element.style.width = '';
      element.style.height = '';
      element.style.maxWidth = '';
      element.style.maxHeight = '';
      return;
    }

    // On desktop, keep popup within viewport bounds
    let newLeft = rect.left;
    let newTop = rect.top;

    // Check if popup extends beyond right edge
    if (rect.right > viewportWidth) {
      newLeft = viewportWidth - rect.width - 20; // 20px padding
    }

    // Check if popup extends beyond left edge
    if (newLeft < 20) {
      newLeft = 20;
    }

    // Check if popup extends beyond bottom edge
    if (rect.bottom > viewportHeight) {
      newTop = viewportHeight - rect.height - 20; // 20px padding
    }

    // Check if popup extends beyond top edge
    if (newTop < 20) {
      newTop = 20;
    }

    // Only update position if it changed
    if (newLeft !== rect.left || newTop !== rect.top) {
      element.style.position = 'fixed';
      element.style.left = `${newLeft}px`;
      element.style.top = `${newTop}px`;
      element.style.transform = 'none';
      element.style.marginLeft = '0';
      element.style.marginTop = '0';
    }
  }

  private _initializePopupPosition(element: HTMLElement): void {
    // Initialize popup with proper responsive positioning
    const isMobile = this._isMobileDevice();

    if (isMobile) {
      // On mobile, let CSS handle all positioning - don't override
      // Just ensure any previous drag positioning is cleared
      element.style.marginLeft = '';
      element.style.marginTop = '';
      element.style.left = '';
      element.style.top = '';
      element.style.transform = '';
      element.style.width = '';
      element.style.height = '';
    } else {
      // On desktop, schedule a reposition after the element is rendered
      setTimeout(() => {
        this._repositionPopup(element);
      }, 0);
    }
  }

  private _togglePreviewCollapsed(e?: Event): void {
    if (e) e.stopPropagation();

    // Get current module key for tracking per-module state
    const moduleKey = this._getSelectedModuleKey();
    if (!moduleKey) return;

    // Toggle the collapsed state for this specific module
    if (this._collapsedPreviewModules.has(moduleKey)) {
      this._collapsedPreviewModules.delete(moduleKey);
    } else {
      this._collapsedPreviewModules.add(moduleKey);
    }

    // Trigger re-render
    this.requestUpdate();
  }

  // Helper to get unique key for the selected module
  private _getSelectedModuleKey(): string | null {
    if (!this._selectedModule) return null;
    const { rowIndex, columnIndex, moduleIndex } = this._selectedModule;
    return `${rowIndex}-${columnIndex}-${moduleIndex}`;
  }

  // Helper to check if current module preview is collapsed
  private _isCurrentModulePreviewCollapsed(): boolean {
    const moduleKey = this._getSelectedModuleKey();
    if (!moduleKey) return false; // Default to expanded
    return this._collapsedPreviewModules.has(moduleKey);
  }

  // Toggle row/column preview state
  private _toggleRowColumnPreviewCollapsed(e?: Event): void {
    if (e) e.stopPropagation();
    this._isRowColumnPreviewCollapsed = !this._isRowColumnPreviewCollapsed;
  }

  private _toggleConditionExpanded(conditionId: string): void {
    const next = new Set(this._collapsedConditionIds);
    if (next.has(conditionId)) next.delete(conditionId);
    else next.add(conditionId);
    this._collapsedConditionIds = next;
  }

  // Toggle row collapsed state
  private _toggleRowCollapsed(rowIndex: number, e?: Event): void {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const next = new Set(this._collapsedRows);
    if (next.has(rowIndex)) {
      next.delete(rowIndex);
    } else {
      next.add(rowIndex);
    }
    this._collapsedRows = next;
    this.requestUpdate();
  }

  // Toggle column collapsed state
  private _toggleColumnCollapsed(rowIndex: number, columnIndex: number, e?: Event): void {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const key = `${rowIndex}-${columnIndex}`;
    const next = new Set(this._collapsedColumns);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this._collapsedColumns = next;
    this.requestUpdate();
  }

  // Generic array reorder helper
  private _reorderArray<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
    if (fromIndex === toIndex) return arr;
    const copy = [...arr];
    const [moved] = copy.splice(fromIndex, 1);
    const adjustedTo = fromIndex < toIndex ? toIndex - 1 : toIndex;
    copy.splice(adjustedTo, 0, moved);
    return copy;
  }

  // Condition drag handlers
  private _onConditionDragStart(
    e: DragEvent,
    scope: 'module' | 'row' | 'column',
    fromIndex: number
  ): void {
    e.stopPropagation();
    this._draggingCondition = { scope, fromIndex } as any;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(fromIndex));
    }
  }

  private _onConditionDragOver(e: DragEvent): void {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  }

  private _onConditionDrop(
    e: DragEvent,
    scope: 'module' | 'row' | 'column',
    targetIndex: number,
    getConditions: () => DisplayCondition[] | undefined,
    setConditions: (next: DisplayCondition[]) => void
  ): void {
    e.preventDefault();
    e.stopPropagation();
    if (!this._draggingCondition || this._draggingCondition.scope !== scope) {
      this._draggingCondition = null;
      return;
    }
    const fromIndex = this._draggingCondition.fromIndex;
    const list = getConditions() || [];
    const next = this._reorderArray(list, fromIndex, targetIndex);
    setConditions(next);
    this._draggingCondition = null;
  }

  // Resolve background-image CSS for previews to match main card behavior
  private _resolvePreviewBackgroundImageCSS(design: any): string {
    const hass = this.hass;
    const type = design?.background_image_type;
    const backgroundImage = design?.background_image;

    // If explicitly set to none, return none regardless of stored path
    if (type === 'none') {
      return 'none';
    }
    // Support legacy direct path when no explicit type is set
    if (!type && backgroundImage) {
      const resolved = hass ? getImageUrl(hass, backgroundImage) : backgroundImage;
      return `url("${resolved}")`;
    }

    if (type === 'upload' || type === 'url') {
      if (backgroundImage) {
        const resolved = hass ? getImageUrl(hass, backgroundImage) : backgroundImage;
        return `url("${resolved}")`;
      }
      return 'none';
    }

    if (type === 'entity') {
      const entityId = design?.background_image_entity;
      if (entityId && hass && hass.states[entityId]) {
        const stateObj: any = hass.states[entityId];
        let src = '';
        if (stateObj.attributes?.entity_picture) src = stateObj.attributes.entity_picture;
        else if (stateObj.attributes?.image) src = stateObj.attributes.image;
        else if (typeof stateObj.state === 'string') src = stateObj.state;
        if (src) {
          const resolved = getImageUrl(hass, src);
          return `url("${resolved}")`;
        }
      }
      return 'none';
    }

    return 'none';
  }

  // Drag and drop state
  @state() private _draggedItem: {
    type: 'module' | 'column' | 'row' | 'nested-child';
    rowIndex: number;
    columnIndex?: number;
    moduleIndex?: number;
    data: any;
    layoutChildIndex?: number;
    nestedChildIndex?: number;
  } | null = null;
  @state() private _dropTarget: {
    type: 'module' | 'column' | 'row' | 'layout' | 'layout-child';
    rowIndex: number;
    columnIndex?: number;
    moduleIndex?: number;
    childIndex?: number;
  } | null = null;
  @state() private _selectedLayoutModuleIndex: number = -1;
  @state() private _selectedNestedChildIndex: number = -1;

  // Layout child module settings state
  @state() private _showLayoutChildSettings = false;
  @state() private _selectedLayoutChild: {
    parentRowIndex: number;
    parentColumnIndex: number;
    parentModuleIndex: number;
    childIndex: number;
  } | null = null;

  // Popup drag and resize state
  @state() private _popupDragState: {
    isDragging: boolean;
    dragStartX: number;
    dragStartY: number;
    initialX: number;
    initialY: number;
    element: HTMLElement | null;
  } = {
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    initialX: 0,
    initialY: 0,
    element: null,
  };

  @state() private _popupResizeState: {
    isResizing: boolean;
    resizeStartX: number;
    resizeStartY: number;
    initialWidth: number;
    initialHeight: number;
    element: HTMLElement | null;
  } = {
    isResizing: false,
    resizeStartX: 0,
    resizeStartY: 0,
    initialWidth: 0,
    initialHeight: 0,
    element: null,
  };

  private _windowResizeListener: (() => void) | null = null;
  private _resizeTimeout: ReturnType<typeof setTimeout> | null = null;

  // Component lifecycle
  disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up any active drag/resize operations
    this._endPopupDrag();
    this._endPopupResize();
    // Remove template update listener
    if (this._templateUpdateListener) {
      window.removeEventListener('ultra-card-template-update', this._templateUpdateListener);
      window.removeEventListener('ultra-card-slider-update', this._templateUpdateListener);
      this._templateUpdateListener = undefined;
    }

    // Remove tab switch listener
    if (this._tabSwitchListener) {
      document.removeEventListener('switch-to-actions-tab', this._tabSwitchListener);
      this._tabSwitchListener = undefined;
    }
    // Remove window resize listener
    if (this._windowResizeListener) {
      window.removeEventListener('resize', this._windowResizeListener);
      this._windowResizeListener = null;
    }
    // Clear resize timeout
    if (this._resizeTimeout) {
      clearTimeout(this._resizeTimeout);
      this._resizeTimeout = null;
    }
    // Remove document click listener
    if (this._documentClickListener) {
      document.removeEventListener('click', this._documentClickListener);
      this._documentClickListener = undefined;
    }
    // Remove keyboard listener
    if (this._keydownListener) {
      document.removeEventListener('keydown', this._keydownListener);
      this._keydownListener = undefined;
    }
    // Clear template update timer
    if (this._templateUpdateTimer) {
      clearTimeout(this._templateUpdateTimer);
      this._templateUpdateTimer = undefined;
    }
    // Clean up hover effect styles
    UcHoverEffectsService.removeHoverEffectStyles(this.shadowRoot!);
  }

  /**
   * Perform template update with single requestUpdate() call
   * This prevents animation loops caused by redundant re-renders
   */
  private _performTemplateUpdate(): void {
    // Single update is sufficient for Lit to detect changes
    // The config object is already updated in place by _updateModule
    this.requestUpdate();

    // Note: We intentionally do NOT dispatch config-changed with _forceUpdate timestamp here
    // That would cause animations to restart on every template update, creating loops
    // The _forceUpdate timestamp is only used for explicit user actions (add/delete/reorder)
  }

  /**
   * Add fixedmenuposition attribute to all ha-select elements
   * This makes dropdowns use fixed positioning like HA's tile-card
   * Fixed positioning allows dropdowns to escape stacking contexts and appear above tabs
   */
  private _addFixedMenuPositionToSelects(): void {
    requestAnimationFrame(() => {
      const selects = this.shadowRoot?.querySelectorAll('ha-select');
      selects?.forEach(select => {
        if (!select.hasAttribute('fixedmenuposition')) {
          select.setAttribute('fixedmenuposition', '');
        }
      });
    });
  }

  // Popup drag and resize functionality
  private _startPopupDrag(e: MouseEvent, element: HTMLElement): void {
    // Disable dragging on mobile for predictable centered UX
    if (this._isMobileDevice()) return;
    e.preventDefault();

    const rect = element.getBoundingClientRect();

    // Convert current position to absolute positioning for drag
    element.style.position = 'fixed';
    element.style.left = `${rect.left}px`;
    element.style.top = `${rect.top}px`;
    element.style.transform = 'none';
    // Clear centering margins so left/top take effect and prevent jump-to-top
    element.style.marginLeft = '0';
    element.style.marginTop = '0';

    this._popupDragState = {
      isDragging: true,
      dragStartX: e.clientX,
      dragStartY: e.clientY,
      initialX: rect.left,
      initialY: rect.top,
      element,
    };

    // Add global event listeners
    document.addEventListener('mousemove', this._handlePopupDrag);
    document.addEventListener('mouseup', this._endPopupDrag);

    // Add dragging class for visual feedback
    element.classList.add('popup-dragging');
  }

  private _handlePopupDrag = (e: MouseEvent): void => {
    if (!this._popupDragState.isDragging || !this._popupDragState.element) return;

    const deltaX = e.clientX - this._popupDragState.dragStartX;
    const deltaY = e.clientY - this._popupDragState.dragStartY;

    const newX = this._popupDragState.initialX + deltaX;
    const newY = this._popupDragState.initialY + deltaY;

    // Constrain to viewport
    const maxX = window.innerWidth - this._popupDragState.element.offsetWidth;
    const maxY = window.innerHeight - this._popupDragState.element.offsetHeight;

    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));

    this._popupDragState.element.style.left = `${constrainedX}px`;
    this._popupDragState.element.style.top = `${constrainedY}px`;
    this._popupDragState.element.style.transform = 'none';
  };

  private _endPopupDrag = (): void => {
    if (this._popupDragState.element) {
      this._popupDragState.element.classList.remove('popup-dragging');
    }

    this._popupDragState = {
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      initialX: 0,
      initialY: 0,
      element: null,
    };

    // Remove global event listeners
    document.removeEventListener('mousemove', this._handlePopupDrag);
    document.removeEventListener('mouseup', this._endPopupDrag);
  };
  private _startPopupResize(e: MouseEvent, element: HTMLElement): void {
    // Disable resizing on mobile for predictable centered UX
    if (this._isMobileDevice()) return;
    e.preventDefault();
    e.stopPropagation();

    // If popup is still centered via transform, convert to absolute left/top once
    const style = window.getComputedStyle(element);
    const hasTransform = style.transform && style.transform !== 'none';
    const rect = element.getBoundingClientRect();
    if (hasTransform) {
      element.style.position = 'fixed';
      element.style.left = `${rect.left}px`;
      element.style.top = `${rect.top}px`;
      element.style.transform = 'none';
      element.style.marginLeft = '0';
      element.style.marginTop = '0';
    }
    this._popupResizeState = {
      isResizing: true,
      resizeStartX: e.clientX,
      resizeStartY: e.clientY,
      initialWidth: rect.width,
      initialHeight: rect.height,
      element,
    };

    // Add global event listeners
    document.addEventListener('mousemove', this._handlePopupResize);
    document.addEventListener('mouseup', this._endPopupResize);

    // Add resizing class for visual feedback
    element.classList.add('popup-resizing');
  }
  private _handlePopupResize = (e: MouseEvent): void => {
    if (!this._popupResizeState.isResizing || !this._popupResizeState.element) return;

    const deltaX = e.clientX - this._popupResizeState.resizeStartX;
    const deltaY = e.clientY - this._popupResizeState.resizeStartY;

    const newWidth = this._popupResizeState.initialWidth + deltaX;
    const newHeight = this._popupResizeState.initialHeight + deltaY;

    // Set maximum dimensions only - no minimum restrictions
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.9;

    const constrainedWidth = Math.min(newWidth, maxWidth);
    const constrainedHeight = Math.min(newHeight, maxHeight);

    // Apply size and maintain current top/left (anchor stays in place)
    this._popupResizeState.element.style.setProperty('width', `${constrainedWidth}px`, 'important');
    this._popupResizeState.element.style.setProperty(
      'height',
      `${constrainedHeight}px`,
      'important'
    );
  };

  private _endPopupResize = (): void => {
    if (this._popupResizeState.element) {
      this._popupResizeState.element.classList.remove('popup-resizing');
      // Keep both width and height so user resize persists
    }

    this._popupResizeState = {
      isResizing: false,
      resizeStartX: 0,
      resizeStartY: 0,
      initialWidth: 0,
      initialHeight: 0,
      element: null,
    };

    // Remove global event listeners
    document.removeEventListener('mousemove', this._handlePopupResize);
    document.removeEventListener('mouseup', this._endPopupResize);
  };

  // Create visual column icon representation for popup
  private _createColumnIconHTML(proportions: number[]): string {
    const totalWidth = proportions.reduce((sum, prop) => sum + prop, 0);
    const columns = proportions
      .map((prop, index) => {
        const widthPercent = (prop / totalWidth) * 100;
        const gap = index > 0 ? 'margin-left: 2px;' : '';
        return `<div style="width: ${widthPercent}%; height: 16px; background: #2196F3; border-radius: 2px; ${gap}"></div>`;
      })
      .join('');

    return `<div style="display: flex; width: 100%; height: 16px; gap: 2px;">${columns}</div>`;
  }

  // Create simple icon representation for layout display
  private _createSimpleIcon(proportions: number[]): string {
    return proportions.map(prop => '█'.repeat(prop)).join(' ');
  }

  // Predefined column layouts - organized by column count
  private readonly COLUMN_LAYOUTS = [
    // 1 Column
    { id: '1-col', name: '1', proportions: [1], columnCount: 1 },

    // 2 Columns
    { id: '1-2-1-2', name: '1/2 + 1/2', proportions: [1, 1], columnCount: 2 },
    { id: '1-3-2-3', name: '1/3 + 2/3', proportions: [1, 2], columnCount: 2 },
    { id: '2-3-1-3', name: '2/3 + 1/3', proportions: [2, 1], columnCount: 2 },
    { id: '2-5-3-5', name: '2/5 + 3/5', proportions: [2, 3], columnCount: 2 },
    { id: '3-5-2-5', name: '3/5 + 2/5', proportions: [3, 2], columnCount: 2 },

    // 3 Columns
    {
      id: '1-3-1-3-1-3',
      name: '1/3 + 1/3 + 1/3',
      proportions: [1, 1, 1],
      columnCount: 3,
    },
    {
      id: '1-4-1-2-1-4',
      name: '1/4 + 1/2 + 1/4',
      proportions: [1, 2, 1],
      columnCount: 3,
    },
    {
      id: '1-5-3-5-1-5',
      name: '1/5 + 3/5 + 1/5',
      proportions: [1, 3, 1],
      columnCount: 3,
    },
    {
      id: '1-6-2-3-1-6',
      name: '1/6 + 2/3 + 1/6',
      proportions: [1, 4, 1],
      columnCount: 3,
    },

    // 4 Columns
    {
      id: '1-4-1-4-1-4-1-4',
      name: '1/4 + 1/4 + 1/4 + 1/4',
      proportions: [1, 1, 1, 1],
      columnCount: 4,
    },
    {
      id: '1-5-1-5-1-5-1-5',
      name: '1/5 + 1/5 + 1/5 + 1/5',
      proportions: [1, 1, 1, 1],
      columnCount: 4,
    },
    {
      id: '1-6-1-6-1-6-1-6',
      name: '1/6 + 1/6 + 1/6 + 1/6',
      proportions: [1, 1, 1, 1],
      columnCount: 4,
    },
    {
      id: '1-8-1-4-1-4-1-8',
      name: '1/8 + 1/4 + 1/4 + 1/8',
      proportions: [1, 2, 2, 1],
      columnCount: 4,
    },

    // 5 Columns
    {
      id: '1-5-1-5-1-5-1-5-1-5',
      name: '1/5 + 1/5 + 1/5 + 1/5 + 1/5',
      proportions: [1, 1, 1, 1, 1],
      columnCount: 5,
    },
    {
      id: '1-6-1-6-1-3-1-6-1-6',
      name: '1/6 + 1/6 + 1/3 + 1/6 + 1/6',
      proportions: [1, 1, 2, 1, 1],
      columnCount: 5,
    },
    {
      id: '1-8-1-4-1-4-1-4-1-8',
      name: '1/8 + 1/4 + 1/4 + 1/4 + 1/8',
      proportions: [1, 2, 2, 2, 1],
      columnCount: 5,
    },

    // 6 Columns
    {
      id: '1-6-1-6-1-6-1-6-1-6-1-6',
      name: '1/6 + 1/6 + 1/6 + 1/6 + 1/6 + 1/6',
      proportions: [1, 1, 1, 1, 1, 1],
      columnCount: 6,
    },
  ];

  // Get layouts for a specific column count
  private _getLayoutsForColumnCount(columnCount: number): typeof this.COLUMN_LAYOUTS {
    // Limit to maximum 6 columns
    const maxColumns = Math.min(columnCount, 6);
    return this.COLUMN_LAYOUTS.filter(layout => layout.columnCount === maxColumns);
  }

  // Migration helper to map legacy layout IDs to new ones
  private _migrateLegacyLayoutId(layoutId: string): string {
    const migrations: Record<string, string> = {
      '50-50': '1-2-1-2',
      '30-70': '1-3-2-3',
      '70-30': '2-3-1-3',
      '33-33-33': '1-3-1-3-1-3',
      '25-50-25': '1-4-1-2-1-4',
      '20-60-20': '1-5-3-5-1-5',
      '25-25-25-25': '1-4-1-4-1-4-1-4',
    };
    return migrations[layoutId] || layoutId;
  }

  // Initialize layout if it doesn't exist
  private _ensureLayout(): LayoutConfig {
    if (!this.config.layout || !this.config.layout.rows) {
      return {
        rows: [
          {
            id: `row-${Date.now()}`,
            columns: [
              {
                id: `col-${Date.now()}`,
                modules: [],
                vertical_alignment: 'stretch',
                horizontal_alignment: 'stretch',
              },
            ],
            column_layout: '1-col',
            // Default design properties with proper margins
            design: {
              margin_top: '8px',
              margin_bottom: '8px',
            },
          },
        ],
      };
    }
    return this.config.layout;
  }

  private _updateConfig(updates: Partial<UltraCardConfig>): void {
    const newConfig = { ...this.config, ...updates };

    // Update hover styles when configuration changes
    setTimeout(() => {
      this._updateHoverEffectStyles();
    }, 0);

    const event = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);

    // Dispatch template update event to refresh live preview
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
    }, 0);
  }

  private _updateLayout(layout: { rows: CardRow[] }): void {
    // Save current state to undo stack before making changes (unless it's an undo/redo action)
    if (!this._isUndoRedoAction) {
      this._saveStateToUndoStack();
      this._redoStack = []; // Clear redo stack when making new changes
    }

    this._updateConfig({ layout });
  }

  // Undo/Redo functionality
  private _saveStateToUndoStack(): void {
    const layout = this._ensureLayout();
    const currentState = {
      rows: JSON.parse(JSON.stringify(layout.rows)), // Deep copy
    };

    this._undoStack.push(currentState);

    // Limit undo stack size
    if (this._undoStack.length > this._maxHistorySize) {
      this._undoStack.shift();
    }
  }

  private _canUndo(): boolean {
    return this._undoStack.length > 0;
  }

  private _canRedo(): boolean {
    return this._redoStack.length > 0;
  }

  private _undo(): void {
    if (!this._canUndo()) return;

    const layout = this._ensureLayout();
    const currentState = {
      rows: JSON.parse(JSON.stringify(layout.rows)), // Deep copy
    };

    // Save current state to redo stack
    this._redoStack.push(currentState);

    // Get previous state from undo stack
    const previousState = this._undoStack.pop()!;

    // Apply previous state
    this._isUndoRedoAction = true;
    this._updateConfig({ layout: previousState });
    this._isUndoRedoAction = false;
  }

  private _redo(): void {
    if (!this._canRedo()) return;

    const layout = this._ensureLayout();
    const currentState = {
      rows: JSON.parse(JSON.stringify(layout.rows)), // Deep copy
    };

    // Save current state to undo stack
    this._undoStack.push(currentState);

    // Get next state from redo stack
    const nextState = this._redoStack.pop()!;

    // Apply next state
    this._isUndoRedoAction = true;
    this._updateConfig({ layout: nextState });
    this._isUndoRedoAction = false;
  }

  private _addRow(): void {
    const layout = this._ensureLayout();

    // Create a new empty row with no columns and default margins
    const newRow: CardRow = {
      id: `row-${Date.now()}`,
      columns: [], // Start with empty columns array
      column_layout: '1-col',
      // Default design properties with proper margins
      design: {
        margin_top: '8px',
        margin_bottom: '8px',
      },
    };

    // Create a completely new layout object to ensure Lit detects the change
    const newLayout = {
      rows: [...layout.rows, newRow],
    };

    this._updateLayout(newLayout);
    // Notify the limit service to re-evaluate immediately (avoid stale lock state)
    try {
      ThirdPartyLimitService.trigger();
    } catch {}
  }

  private _deleteRow(rowIndex: number): void {
    const layout = this._ensureLayout();

    if (layout.rows.length > 1) {
      // Create a completely new layout object with the row removed
      const newLayout = {
        rows: layout.rows.filter((_, index) => index !== rowIndex),
      };

      this._updateLayout(newLayout);
    } else {
    }
  }

  private _duplicateRow(rowIndex: number): void {
    const layout = this._ensureLayout();
    const rowToCopy = layout.rows[rowIndex];
    if (!rowToCopy) {
      console.error('Row to copy not found at index:', rowIndex);
      return;
    }

    // Deep clone the row with new IDs
    const duplicatedRow: CardRow = {
      ...JSON.parse(JSON.stringify(rowToCopy)),
      id: `row-${Date.now()}`,
      columns: rowToCopy.columns.map((column, idx) => ({
        ...JSON.parse(JSON.stringify(column)),
        id: `col-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
        modules: column.modules.map((module, moduleIdx) => ({
          ...JSON.parse(JSON.stringify(module)),
          id: `${module.type}-${Date.now()}-${moduleIdx}-${Math.random().toString(36).substr(2, 9)}`,
        })),
      })),
    };

    // Create new layout with duplicated row
    const newLayout = JSON.parse(JSON.stringify(layout));
    newLayout.rows.splice(rowIndex + 1, 0, duplicatedRow);
    this._updateLayout(newLayout);
    // Trigger service update to ensure previews reflect unlock state while editing
    try {
      ThirdPartyLimitService.trigger();
    } catch {}
  }

  private _addColumn(rowIndex: number): void {
    const layout = this._ensureLayout();
    const row = layout.rows[rowIndex];
    if (!row) {
      console.error('Row not found at index:', rowIndex);
      return;
    }

    // Enforce maximum 6 columns
    if (row.columns.length >= 6) {
      return;
    }

    const newColumn: CardColumn = {
      id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      modules: [],
      vertical_alignment: 'stretch',
      horizontal_alignment: 'stretch',
    };

    // Calculate new column count after adding
    const newColumnCount = row.columns.length + 1;

    // Get the first (default) layout for the new column count
    const defaultLayout = this._getLayoutsForColumnCount(newColumnCount)[0];
    const newColumnLayout = defaultLayout ? defaultLayout.id : `repeat(${newColumnCount}, 1fr)`;

    // Create new layout with added column and updated column_layout
    const newLayout = {
      rows: layout.rows.map((r, index) => {
        if (index === rowIndex) {
          return {
            ...r,
            columns: [...r.columns, newColumn],
            column_layout: newColumnLayout as CardRow['column_layout'],
          };
        }
        return r;
      }),
    };

    this._updateLayout(newLayout);
  }

  private _addColumnAfter(rowIndex: number, columnIndex: number): void {
    const layout = this._ensureLayout();
    const row = layout.rows[rowIndex];
    if (!row) return;

    // Enforce maximum 6 columns
    if (row.columns.length >= 6) {
      return;
    }

    const newColumn: CardColumn = {
      id: `col-${Date.now()}`,
      modules: [],
      vertical_alignment: 'stretch',
      horizontal_alignment: 'stretch',
    };

    // Calculate new column count after adding
    const newColumnCount = row.columns.length + 1;

    // Get the first (default) layout for the new column count
    const defaultLayout = this._getLayoutsForColumnCount(newColumnCount)[0];
    const newColumnLayout = defaultLayout ? defaultLayout.id : `repeat(${newColumnCount}, 1fr)`;

    // Create new layout with column inserted after the current column and updated column_layout
    const newLayout = {
      rows: layout.rows.map((r, index) => {
        if (index === rowIndex) {
          const newColumns = [...r.columns];
          newColumns.splice(columnIndex + 1, 0, newColumn);
          return {
            ...r,
            columns: newColumns,
            column_layout: newColumnLayout as CardRow['column_layout'],
          };
        }
        return r;
      }),
    };

    this._updateLayout(newLayout);
  }

  private _duplicateColumn(rowIndex: number, columnIndex: number): void {
    const layout = this._ensureLayout();
    const row = layout.rows[rowIndex];
    if (!row || !row.columns[columnIndex]) {
      console.error('Row or column not found:', rowIndex, columnIndex);
      return;
    }

    // Enforce maximum 6 columns
    if (row.columns.length >= 6) {
      return;
    }

    const columnToCopy = row.columns[columnIndex];

    // Deep clone the column with new ID and module IDs
    const duplicatedColumn: CardColumn = {
      ...JSON.parse(JSON.stringify(columnToCopy)),
      id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      modules: columnToCopy.modules.map((module, moduleIdx) => ({
        ...JSON.parse(JSON.stringify(module)),
        id: `${module.type}-${Date.now()}-${moduleIdx}-${Math.random().toString(36).substr(2, 9)}`,
      })),
    };

    // Calculate new column count after duplicating
    const newColumnCount = row.columns.length + 1;

    // Get the first (default) layout for the new column count
    const defaultLayout = this._getLayoutsForColumnCount(newColumnCount)[0];
    const newColumnLayout = defaultLayout ? defaultLayout.id : `repeat(${newColumnCount}, 1fr)`;

    // Create new layout with duplicated column and updated column_layout
    const newLayout = JSON.parse(JSON.stringify(layout));
    newLayout.rows[rowIndex].columns.splice(columnIndex + 1, 0, duplicatedColumn);
    newLayout.rows[rowIndex].column_layout = newColumnLayout;
    this._updateLayout(newLayout);
  }

  private _deleteColumn(rowIndex: number, columnIndex: number): void {
    const layout = this._ensureLayout();
    const row = layout.rows[rowIndex];
    if (!row) {
      console.error('Row not found at index:', rowIndex);
      return;
    }

    if (!row.columns[columnIndex]) {
      console.error('Column not found at index:', columnIndex);
      return;
    }

    // Calculate new column count after deletion
    const newColumnCount = row.columns.length - 1;

    // Get the first (default) layout for the new column count, or '1-col' if no columns left
    const defaultLayout =
      newColumnCount > 0 ? this._getLayoutsForColumnCount(newColumnCount)[0] : null;
    const newColumnLayout = defaultLayout ? defaultLayout.id : '1-col';

    // Create new layout with deleted column and updated column_layout
    const newLayout = {
      rows: layout.rows.map((r, index) => {
        if (index === rowIndex) {
          return {
            ...r,
            columns: r.columns.filter((_, colIndex) => colIndex !== columnIndex),
            column_layout: newColumnLayout as CardRow['column_layout'],
          };
        }
        return r;
      }),
    };

    this._updateLayout(newLayout);
  }

  private _openColumnLayoutSelector(rowIndex: number): void {
    this._selectedRowForLayout = rowIndex;
    this._showColumnLayoutSelector = true;
  }

  private _changeColumnLayout(layoutId: string): void {
    if (this._selectedRowForLayout === -1) return;

    const layout = this._ensureLayout();
    const row = layout.rows[this._selectedRowForLayout];
    if (!row) return;

    const selectedLayout = this.COLUMN_LAYOUTS.find(l => l.id === layoutId);
    if (!selectedLayout) return;

    const targetColumnCount = selectedLayout.columnCount;
    const currentColumnCount = row.columns.length;

    // Create new layout
    const newLayout = JSON.parse(JSON.stringify(layout));
    const targetRow = newLayout.rows[this._selectedRowForLayout];

    if (targetColumnCount === currentColumnCount) {
      // Same number of columns, just change the layout proportions
      targetRow.column_layout = layoutId as CardRow['column_layout'];
    } else if (targetColumnCount > currentColumnCount) {
      // Adding columns - WPBakery style
      const newColumns: CardColumn[] = [...targetRow.columns];

      // Add new empty columns
      for (let i = currentColumnCount; i < targetColumnCount; i++) {
        newColumns.push({
          id: `col-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
          modules: [],
          vertical_alignment: 'stretch',
          horizontal_alignment: 'stretch',
        });
      }

      targetRow.columns = newColumns;
      targetRow.column_layout = layoutId as CardRow['column_layout'];
    } else {
      // Reducing columns - WPBakery style: move all content to remaining columns
      const newColumns: CardColumn[] = [];
      const allModules: CardModule[] = [];

      // Collect all modules from all columns
      targetRow.columns.forEach(column => {
        if (column.modules && column.modules.length > 0) {
          allModules.push(...column.modules);
        }
      });

      // Create target number of columns
      for (let i = 0; i < targetColumnCount; i++) {
        if (i < currentColumnCount) {
          // Keep existing column structure but clear modules
          newColumns.push({
            ...targetRow.columns[i],
            modules: [],
          });
        } else {
          // Create new column
          newColumns.push({
            id: `col-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
            modules: [],
            vertical_alignment: 'stretch',
            horizontal_alignment: 'stretch',
          });
        }
      }

      // Distribute modules evenly across the remaining columns
      if (allModules.length > 0) {
        if (targetColumnCount === 1) {
          // Single column gets all modules
          newColumns[0].modules = allModules;
        } else {
          // Distribute modules round-robin style
          allModules.forEach((module, index) => {
            const targetColumnIndex = index % targetColumnCount;
            newColumns[targetColumnIndex].modules.push(module);
          });
        }
      }

      targetRow.columns = newColumns;
      targetRow.column_layout = layoutId as CardRow['column_layout'];
    }

    this._updateLayout(newLayout);

    // Close the selector
    this._showColumnLayoutSelector = false;
    this._selectedRowForLayout = -1;
  }

  private _getCurrentLayoutText(row: CardRow): string {
    const layoutId = row.column_layout;

    // Find matching predefined layout and return its name
    const predefinedLayout = this.COLUMN_LAYOUTS.find(l => l.id === layoutId);
    if (predefinedLayout) {
      return predefinedLayout.name;
    }

    // Fallback to column count
    return `${row.columns.length} Column${row.columns.length !== 1 ? 's' : ''}`;
  }

  private _getCurrentLayoutDisplay(row: CardRow): string {
    const columnCount = row.columns.length;
    const layoutId = row.column_layout;

    // Find matching predefined layout
    const predefinedLayout = this.COLUMN_LAYOUTS.find(l => l.id === layoutId);
    if (predefinedLayout) {
      return this._createSimpleIcon(predefinedLayout.proportions);
    }

    // Fallback to generic display based on column count
    switch (columnCount) {
      case 1:
        return '█';
      case 2:
        return '█ █';
      case 3:
        return '█ █ █';
      case 4:
        return '█ █ █ █';
      default:
        return '█ '.repeat(Math.min(columnCount, 6)).trim();
    }
  }

  private _openModuleSelector(rowIndex: number, columnIndex: number): void {
    const layout = this._ensureLayout();
    const row = layout.rows[rowIndex];

    // If the row has no columns, automatically add one
    if (!row || !row.columns || row.columns.length === 0) {
      this._addColumn(rowIndex);
      // Set the column index to 0 since we just added the first column
      columnIndex = 0;
    }

    this._selectedRowIndex = rowIndex;
    this._selectedColumnIndex = columnIndex;
    this._selectedLayoutModuleIndex = -1; // Reset to indicate we're adding to a column, not a layout module
    this._selectedNestedChildIndex = -1; // Reset nested child index
    this._showModuleSelector = true;
  }
  private _addModule(type: string): void {
    // Enforce non-pro third-party limit (pre-check)
    try {
      const integrationUser = ucCloudAuthService.checkIntegrationAuth(this.hass);
      const isPro =
        integrationUser?.subscription?.tier === 'pro' &&
        integrationUser?.subscription?.status === 'active';
      if (!isPro) {
        const additionalThirdParty = isThirdParty(type) ? 1 : 0;
        if (ThirdPartyLimitService.wouldExceedLimit(this.hass!, additionalThirdParty)) {
          this._showToast(
            'Limit reached: 5 third-party modules per dashboard. Upgrade to Pro to add more.',
            'error'
          );
          return;
        }
      }
    } catch {}
    if (this._selectedRowIndex === -1 || this._selectedColumnIndex === -1) {
      console.error('No row or column selected');
      return;
    }

    const layout = this._ensureLayout();

    if (!layout.rows[this._selectedRowIndex]) {
      console.error('Selected row does not exist:', this._selectedRowIndex);
      return;
    }

    const row = layout.rows[this._selectedRowIndex];

    if (!row.columns[this._selectedColumnIndex]) {
      console.error('Selected column does not exist:', this._selectedColumnIndex);
      return;
    }

    const column = row.columns[this._selectedColumnIndex];
    const lang = this.hass?.locale?.language || 'en';

    // Create a simple default module with proper typing
    let newModule: CardModule;

    switch (type) {
      case 'text':
        newModule = {
          id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'text',
          text: localize('editor.modules.sample_text', lang, 'Sample Text'),
          font_size: 16,
          color: 'var(--primary-text-color)',
        } as TextModule;
        // Ensure no default title is set
        delete (newModule as any).name;
        delete (newModule as any).title;
        break;
      case 'separator':
        newModule = {
          id: `separator-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'separator',
          thickness: 1,
          color: 'var(--divider-color)',
        } as SeparatorModule;
        // Ensure no default title is set
        delete (newModule as any).name;
        delete (newModule as any).title;
        delete (newModule as any).label;
        break;
      case 'image':
        newModule = {
          id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'image',
          image_type: 'none',
        } as ImageModule;
        // Ensure no default title is set
        delete (newModule as any).name;
        delete (newModule as any).title;
        delete (newModule as any).label;
        break;
      case 'markdown':
        newModule = {
          id: `markdown-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'markdown',
          content: `This is a markdown module that supports:

- Italic and bold text
- Links
- inline code
- Lists and more!`,
          markdown_content: `This is a markdown module that supports:
- Italic and bold text
- Links
- inline code
- Lists and more!`,
        } as any;
        // Ensure no default title is set
        delete (newModule as any).name;
        delete (newModule as any).title;
        delete (newModule as any).label;
        break;
      case 'bar':
        newModule = {
          id: `bar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'bar',
          entity: 'sensor.battery_level',
          bar_color: 'var(--primary-color)',
          // Default container background should be transparent; track color is handled separately
          background_color: 'transparent',
          height: 20,
          show_value: true,
        } as BarModule;
        // Ensure no default title is set
        delete (newModule as any).name;
        delete (newModule as any).title;
        delete (newModule as any).label;
        break;
      case 'button':
        newModule = {
          id: `button-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'button',
          label: 'Click Me',
          button_text: 'Click Me',
          tap_action: {
            action: 'more-info',
          },
        } as any;
        // Ensure no default title is set (but keep label for button functionality)
        delete (newModule as any).name;
        delete (newModule as any).title;
        break;
      case 'info':
        newModule = {
          id: `info-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'info',
          info_entities: [
            {
              entity: 'sensor.temperature',
              name: 'Temperature',
              icon: 'mdi:thermometer',
            },
          ],
        } as any;
        // Ensure no default title is set
        delete (newModule as any).name;
        delete (newModule as any).title;
        delete (newModule as any).label;
        break;
      default:
        // Try to use the module registry for other types
        try {
          const registry = getModuleRegistry();
          const registryModule = registry.createDefaultModule(type);
          if (registryModule) {
            newModule = registryModule;
            // Remove any default titles/names that might have been set by the registry
            delete (newModule as any).name;
            delete (newModule as any).title;
            delete (newModule as any).label;
            break;
          }
        } catch (e) {
          console.error('Module registry failed:', e);
        }
        // Fallback to text module
        newModule = {
          id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'text',
          text: 'Unknown Module Type',
          font_size: 16,
          color: 'var(--primary-text-color)',
        } as TextModule;
        break;
    }

    // Create new layout with updated modules
    let newLayout;

    if (this._selectedLayoutModuleIndex >= 0) {
      // Adding to a layout module (horizontal or vertical) or nested layout module
      newLayout = {
        rows: layout.rows.map((row, rIndex) => {
          if (rIndex === this._selectedRowIndex) {
            return {
              ...row,
              columns: row.columns.map((col, cIndex) => {
                if (cIndex === this._selectedColumnIndex) {
                  return {
                    ...col,
                    modules: col.modules.map((module, mIndex) => {
                      if (mIndex === this._selectedLayoutModuleIndex) {
                        const layoutModule = module as any;

                        // Check if we're adding to a nested layout module
                        if (this._selectedNestedChildIndex >= 0) {
                          // Adding to a nested layout module (layout module inside another layout module)
                          return {
                            ...layoutModule,
                            modules: layoutModule.modules.map(
                              (childModule: any, childIndex: number) => {
                                if (childIndex === this._selectedNestedChildIndex) {
                                  // This is the nested layout module we want to add to
                                  const nestedLayoutModule = childModule as any;
                                  return {
                                    ...nestedLayoutModule,
                                    modules: [...(nestedLayoutModule.modules || []), newModule],
                                  };
                                }
                                return childModule;
                              }
                            ),
                          };
                        } else {
                          // Adding to a regular layout module (not nested)
                          return {
                            ...layoutModule,
                            modules: [...(layoutModule.modules || []), newModule],
                          };
                        }
                      }
                      return module;
                    }),
                  };
                }
                return col;
              }),
            };
          }
          return row;
        }),
      };
    } else {
      // Adding directly to a column
      newLayout = {
        rows: layout.rows.map((row, rIndex) => {
          if (rIndex === this._selectedRowIndex) {
            return {
              ...row,
              columns: row.columns.map((col, cIndex) => {
                if (cIndex === this._selectedColumnIndex) {
                  return {
                    ...col,
                    modules: [...(col.modules || []), newModule],
                  };
                }
                return col;
              }),
            };
          }
          return row;
        }),
      };
    }

    this._updateLayout(newLayout);
    this._showModuleSelector = false;

    // Auto-open module settings for the newly added module (only for non-layout modules)
    if (this._shouldAutoOpenSettings(type)) {
      if (this._selectedLayoutModuleIndex >= 0) {
        // Module was added to a layout module - don't auto-open settings for now
        // TODO: Could implement nested module settings if needed
      } else {
        const moduleIndex = column.modules.length; // The new module will be at this index
        this._openModuleSettings(this._selectedRowIndex, this._selectedColumnIndex, moduleIndex);
      }
    }

    this._selectedRowIndex = -1;
    this._selectedColumnIndex = -1;
    this._selectedLayoutModuleIndex = -1;
    this._selectedNestedChildIndex = -1;
  }

  private _addPageBreakToSlider(
    parentRowIndex: number,
    parentColumnIndex: number,
    parentModuleIndex: number,
    sliderChildIndex: number
  ): void {
    const layout = this._ensureLayout();
    const registry = getModuleRegistry();

    // Get the parent layout module
    const parentLayout = layout.rows[parentRowIndex].columns[parentColumnIndex].modules[
      parentModuleIndex
    ] as any;

    if (!parentLayout || !parentLayout.modules || !parentLayout.modules[sliderChildIndex]) {
      console.error('Parent layout or slider child not found');
      return;
    }

    // Get the slider module
    const sliderModule = parentLayout.modules[sliderChildIndex] as any;

    if (!sliderModule || sliderModule.type !== 'slider') {
      console.error('Target is not a slider module');
      return;
    }

    // Create a new page break module
    const pageBreakModule = registry.createDefaultModule('pagebreak');
    if (!pageBreakModule) {
      console.error('Could not create page break module');
      return;
    }

    // Add the page break to the end of the slider's modules
    const newLayout = {
      rows: layout.rows.map((row, rIndex) => {
        if (rIndex === parentRowIndex) {
          return {
            ...row,
            columns: row.columns.map((col, cIndex) => {
              if (cIndex === parentColumnIndex) {
                return {
                  ...col,
                  modules: col.modules.map((module, mIndex) => {
                    if (mIndex === parentModuleIndex) {
                      const layoutModule = module as any;
                      return {
                        ...layoutModule,
                        modules: layoutModule.modules.map(
                          (childModule: any, childIndex: number) => {
                            if (childIndex === sliderChildIndex) {
                              // This is the slider module we want to add to
                              return {
                                ...childModule,
                                modules: [...(childModule.modules || []), pageBreakModule],
                              };
                            }
                            return childModule;
                          }
                        ),
                      };
                    }
                    return module;
                  }),
                };
              }
              return col;
            }),
          };
        }
        return row;
      }),
    };

    this._updateLayout(newLayout);
    this.requestUpdate();
  }

  private _addPageBreakToColumnSlider(
    rowIndex: number,
    columnIndex: number,
    moduleIndex: number
  ): void {
    const layout = this._ensureLayout();
    const registry = getModuleRegistry();

    // Get the slider module
    const sliderModule = layout.rows[rowIndex].columns[columnIndex].modules[moduleIndex] as any;

    if (!sliderModule || sliderModule.type !== 'slider') {
      console.error('Target is not a slider module');
      return;
    }

    // Create a new page break module
    const pageBreakModule = registry.createDefaultModule('pagebreak');
    if (!pageBreakModule) {
      console.error('Could not create page break module');
      return;
    }

    // Add the page break to the end of the slider's modules
    const newLayout = {
      rows: layout.rows.map((row, rIndex) => {
        if (rIndex === rowIndex) {
          return {
            ...row,
            columns: row.columns.map((col, cIndex) => {
              if (cIndex === columnIndex) {
                return {
                  ...col,
                  modules: col.modules.map((module, mIndex) => {
                    if (mIndex === moduleIndex) {
                      // This is the slider module we want to add to
                      return {
                        ...module,
                        modules: [...((module as any).modules || []), pageBreakModule],
                      };
                    }
                    return module;
                  }),
                };
              }
              return col;
            }),
          };
        }
        return row;
      }),
    };

    this._updateLayout(newLayout);
    this.requestUpdate();
  }

  private _addPreset(preset: PresetDefinition): void {
    try {
      // debug removed

      const currentLayout = this._ensureLayout();

      if (!preset.layout || !preset.layout.rows || preset.layout.rows.length === 0) {
        console.error('Invalid preset layout:', preset);
        console.error('Layout structure:', preset.layout);
        console.error('Layout rows:', preset.layout?.rows);
        console.error('Full preset object:', preset);
        this._showToast(`Error: Invalid preset "${preset.name}" - missing layout rows`, 'error');
        return;
      }

      // Detect entities in the preset
      const entityReferences = entityDetector.scanLayout(preset.layout);

      if (entityReferences.length > 0) {
        // Show entity mapping dialog
        this._showEntityMappingDialog(preset, entityReferences);
      } else {
        // No entities, add preset directly
        this._applyPresetToLayout(preset, []);
      }
    } catch (error) {
      console.error('Error adding preset:', error);
      this._showToast(
        `Error adding preset: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    }
  }

  private _showEntityMappingDialog(preset: PresetDefinition, entityReferences: any[]): void {
    if (this._entityMappingOpen) {
      console.warn('Entity mapping dialog already open - ignoring duplicate open request');
      return;
    }
    this._entityMappingOpen = true;

    // Show the simple entity mapper dialog
    simpleEntityMapper.show(
      this.hass,
      `Map Entities for "${preset.name}"`,
      entityReferences,
      (mappings: EntityMapping[]) => {
        console.log('✅ Apply mappings:', mappings);
        this._entityMappingOpen = false;
        this._applyPresetToLayout(preset, mappings);
      },
      () => {
        console.log('❌ Cancel mapping');
        this._entityMappingOpen = false;
        // On cancel, add preset with all original entities
        this._applyPresetToLayout(preset, []);
      }
    );
  }

  private _applyPresetToLayout(preset: PresetDefinition, mappings: EntityMapping[]): void {
    try {
      const currentLayout = this._ensureLayout();

      // Apply entity mappings to preset layout
      let mappedLayout = preset.layout;
      if (mappings.length > 0) {
        mappedLayout = entityMapper.applyMappingToLayout(preset.layout, mappings);

        // Store mappings in preset metadata for future export
        if (!preset.metadata.entityMappings) {
          preset.metadata.entityMappings = [];
        }
        preset.metadata.entityMappings.push(...mappings);
      }

      // Create a new layout with extensible arrays
      const newRows = [...currentLayout.rows];

      // Add all rows from the mapped preset at the end
      mappedLayout.rows.forEach((presetRow, index) => {
        try {
          // Clone the row with new IDs
          const newRow = this._cloneRowWithNewIds(presetRow);
          newRows.push(newRow);
        } catch (cloneError) {
          console.error(`Failed to clone row ${index}:`, cloneError);
          throw cloneError;
        }
      });

      // Create completely new layout object
      const newLayout: LayoutConfig = {
        rows: newRows,
        ...(currentLayout.gap !== undefined && { gap: currentLayout.gap }),
      };

      this._updateLayout(newLayout);
      this._showModuleSelector = false;
      this._selectedLayoutModuleIndex = -1;
      this._selectedNestedChildIndex = -1;
      this._selectedRowIndex = -1;
      this._selectedColumnIndex = -1;
      this._showToast(`"${preset.name}" preset added successfully!`, 'success');

      // debug removed
    } catch (error) {
      console.error('Error applying preset to layout:', error);
      this._showToast(
        `Error applying preset: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    }
  }

  private _remapRowEntities(rowIndex: number): void {
    try {
      if (this._entityMappingOpen) {
        console.warn('Entity mapping dialog already open - ignoring duplicate open request');
        return;
      }
      this._entityMappingOpen = true;

      const currentLayout = this._ensureLayout();
      const row = currentLayout.rows[rowIndex];

      if (!row) {
        this._showToast('Row not found', 'error');
        this._entityMappingOpen = false;
        return;
      }

      console.log('🔍 Scanning row for entities:', row);

      // Detect entities in the row
      const entityReferences = entityDetector.scanRow(row);

      console.log('📋 Found entity references:', entityReferences);

      if (entityReferences.length === 0) {
        console.warn('⚠️ No entities found in row:', row);
        this._showToast('No entities found in this row', 'info');
        this._entityMappingOpen = false;
        return;
      }

      // Show entity mapping dialog
      simpleEntityMapper.show(
        this.hass,
        `Remap Entities in Row ${rowIndex + 1}`,
        entityReferences,
        (mappings: EntityMapping[]) => {
          console.log('✅ Apply row mappings:', mappings);
          this._entityMappingOpen = false;
          this._applyMappingsToRow(rowIndex, mappings);
        },
        () => {
          console.log('❌ Cancel row mapping');
          this._entityMappingOpen = false;
          // Cancel - do nothing (keep original entities)
        }
      );
    } catch (error) {
      console.error('Error remapping row entities:', error);
      this._showToast(
        `Error remapping entities: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    }
  }

  private _applyMappingsToRow(rowIndex: number, mappings: EntityMapping[]): void {
    try {
      const currentLayout = this._ensureLayout();
      const row = currentLayout.rows[rowIndex];

      if (!row) {
        this._showToast('Row not found', 'error');
        return;
      }

      // Apply entity mappings to row
      const mappedRow = entityMapper.applyMappingToRow(row, mappings);

      // Update layout with mapped row
      const newLayout: LayoutConfig = {
        ...currentLayout,
        rows: currentLayout.rows.map((r, i) => (i === rowIndex ? mappedRow : r)),
      };

      this._updateLayout(newLayout);
      this._showToast(
        `Entities remapped successfully! ${mappings.length} mapping(s) applied.`,
        'success'
      );
    } catch (error) {
      console.error('Error applying mappings to row:', error);
      this._showToast(
        `Error applying mappings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    }
  }

  private _addFavorite(favorite: FavoriteRow): void {
    const currentLayout = this._ensureLayout();

    // Create a new layout with extensible arrays
    const newRows = [...currentLayout.rows];

    // Clone the favorite row with new IDs and add at the end
    const newRow = this._cloneRowWithNewIds(favorite.row);
    newRows.push(newRow);

    // Create completely new layout object
    const newLayout: LayoutConfig = {
      rows: newRows,
      ...(currentLayout.gap !== undefined && { gap: currentLayout.gap }),
    };

    this._updateLayout(newLayout);
    this._showModuleSelector = false;
    this._selectedLayoutModuleIndex = -1;
    this._selectedNestedChildIndex = -1;
    this._selectedRowIndex = -1;
    this._selectedColumnIndex = -1;
    this._showToast(`"${favorite.name}" favorite added successfully!`, 'success');
  }

  private _saveRowAsFavorite(rowIndex: number): void {
    const layout = this._ensureLayout();
    const row = layout.rows[rowIndex];
    if (!row) return;

    this._favoriteRowToSave = row;
    this._showFavoriteDialog = true;
  }

  private async _exportRow(rowIndex: number): Promise<void> {
    const layout = this._ensureLayout();
    const row = layout.rows[rowIndex];
    if (!row) return;

    try {
      this._showToast('Exporting row to clipboard...', 'info');
      await ucExportImportService.exportRowToClipboard(row, `Row ${rowIndex + 1}`);
      this._showToast('Row exported to clipboard!', 'success');
    } catch (error) {
      console.error('Failed to export row:', error);
      if (error instanceof Error && error.message === 'Export cancelled by user') {
        this._showToast('Export cancelled - privacy protection', 'info');
      } else {
        this._showToast('Failed to export row to clipboard', 'error');
      }
    }
  }

  private async _pasteRowFromClipboard(rowIndex: number): Promise<void> {
    try {
      // Show loading state
      this._showToast('Reading from clipboard...', 'info');

      // Try to read from clipboard with a small retry mechanism
      let importData = await ucExportImportService.importFromClipboard();

      // If no data found, wait a bit and try once more (for immediate paste after export)
      if (!importData) {
        await new Promise(resolve => setTimeout(resolve, 100));
        importData = await ucExportImportService.importFromClipboard();
      }

      if (!importData) {
        this._showToast(
          'No valid Ultra Card shortcode found. Please ensure you have copied a complete exported row/layout or try copying again.',
          'error'
        );
        return;
      }

      // Validate that it's row data or layout data
      let rowData: CardRow;
      let sourceName = '';

      if (importData.type === 'ultra-card-row' && importData.data) {
        // Direct row import
        rowData = importData.data as CardRow;
        sourceName = importData.metadata?.name || 'Imported Row';
      } else if (importData.type === 'ultra-card-layout' && importData.data) {
        // Layout import - take the first row
        const layoutData = importData.data as LayoutConfig;
        if (layoutData.rows && layoutData.rows.length > 0) {
          rowData = layoutData.rows[0];
          sourceName = `${importData.metadata?.name || 'Imported Layout'} (Row 1)`;
        } else {
          this._showToast('Layout data does not contain any rows', 'error');
          return;
        }
      } else {
        this._showToast(
          `Clipboard contains ${importData.type} data, but row data is required`,
          'error'
        );
        return;
      }

      // Clone the row with new IDs to avoid conflicts
      const clonedRow = this._cloneRowWithNewIds(rowData);

      // Enforce non-pro third-party limit for pasted rows
      try {
        const integrationUser = ucCloudAuthService.checkIntegrationAuth(this.hass);
        const isPro =
          integrationUser?.subscription?.tier === 'pro' &&
          integrationUser?.subscription?.status === 'active';
        if (!isPro) {
          const additionalThirdParty = (clonedRow.columns || []).reduce((acc, col) => {
            return (
              acc +
              (col.modules || []).reduce(
                (mAcc, m) => mAcc + (isThirdParty((m as any).type) ? 1 : 0),
                0
              )
            );
          }, 0);
          if (ThirdPartyLimitService.wouldExceedLimit(this.hass!, additionalThirdParty)) {
            this._showToast('Paste blocked: 5 third-party modules limit reached.', 'error');
            return;
          }
        }
      } catch {}

      // Create a new layout object to ensure Lit detects the change
      const currentLayout = this._ensureLayout();
      const newLayout = {
        rows: [...currentLayout.rows],
      };

      // Add the pasted row after the current row (duplicate behavior)
      newLayout.rows.splice(rowIndex + 1, 0, clonedRow);

      // Update the layout (includes undo/redo state management)
      this._updateLayout(newLayout);

      // Force immediate re-render
      this.requestUpdate();

      this._showToast(
        `Row added successfully from "${sourceName}"! Check below the current row.`,
        'success'
      );
    } catch (error) {
      console.error('Failed to paste row from clipboard:', error);
      if (error instanceof Error && error.name === 'NotAllowedError') {
        this._showToast('Clipboard access denied. Please check browser permissions.', 'error');
      } else {
        this._showToast('Failed to paste row from clipboard. Please try again.', 'error');
      }
    }
  }

  private async _exportFavorite(favorite: FavoriteRow): Promise<void> {
    try {
      this._showToast('Exporting favorite to clipboard...', 'info');
      await ucExportImportService.exportRowToClipboard(favorite.row, favorite.name);
      this._showToast('Favorite exported to clipboard!', 'success');
    } catch (error) {
      console.error('Failed to export favorite:', error);
      if (error instanceof Error && error.message === 'Export cancelled by user') {
        this._showToast('Export cancelled - privacy protection', 'info');
      } else {
        this._showToast('Failed to export favorite to clipboard', 'error');
      }
    }
  }
  private _deleteFavorite(favoriteId: string): void {
    if (confirm('Are you sure you want to delete this favorite?')) {
      ucFavoritesService.removeFavorite(favoriteId);
      this._showToast('Favorite deleted', 'info');
    }
  }

  private _cloneRowWithNewIds(row: CardRow): CardRow {
    try {
      // Use structuredClone if available (modern browsers), otherwise fallback to JSON
      const deepClone = (obj: any) => {
        if (typeof structuredClone !== 'undefined') {
          return structuredClone(obj);
        }
        return JSON.parse(JSON.stringify(obj));
      };

      const cloned = deepClone(row);
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substr(2, 9);

      // Generate new IDs safely
      cloned.id = `row-${timestamp}-${randomSuffix}`;

      // Apply default design properties if the row doesn't have them
      if (!cloned.design) {
        cloned.design = {};
      }

      // Apply default margins if not already set
      if (!cloned.design.margin_top && !cloned.design.margin_bottom) {
        cloned.design.margin_top = '8px';
        cloned.design.margin_bottom = '8px';
      }

      if (cloned.columns && Array.isArray(cloned.columns)) {
        cloned.columns.forEach((column: any, colIndex: number) => {
          column.id = `col-${timestamp}-${colIndex}-${randomSuffix}`;

          if (column.modules && Array.isArray(column.modules)) {
            column.modules.forEach((module: any, moduleIndex: number) => {
              module.id = `${module.type}-${timestamp}-${moduleIndex}-${randomSuffix}`;
            });
          }
        });
      }

      return cloned;
    } catch (error) {
      console.error('Error cloning row:', error);
      throw new Error(
        `Failed to clone row: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private _toggleMoreMenu(rowIndex: number): void {
    if (this._openMoreMenuRowIndex === rowIndex) {
      this._openMoreMenuRowIndex = -1;
    } else {
      this._openMoreMenuRowIndex = rowIndex;
    }
  }
  private _showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `ultra-toast ultra-toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: var(--${type === 'success' ? 'success' : type === 'error' ? 'error' : 'primary'}-color);
      color: white;
      border-radius: 8px;
      z-index: ${Z_INDEX.TOAST_NOTIFICATION};
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    `;

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }

  private _countExternalCardModules(): number {
    const layout = this._ensureLayout();
    let count = 0;

    layout.rows.forEach(row => {
      row.columns.forEach(column => {
        column.modules?.forEach(module => {
          if (module.type === 'external_card') {
            count++;
          }
        });
      });
    });

    return count;
  }

  /**
   * Count all external card modules across ALL Ultra Card instances in ALL dashboards
   * This provides a global count for Pro feature limiting
   */
  private async _countAllExternalCardModulesGlobally(): Promise<number> {
    try {
      // Scan ALL dashboards for all Ultra Card instances
      const snapshot = await ucDashboardScannerService.scanAllDashboards();

      let totalExternalCards = 0;

      // Count external_card modules in each Ultra Card instance
      snapshot.cards.forEach(dashboardCard => {
        const config = dashboardCard.config;

        if (config.layout && config.layout.rows) {
          config.layout.rows.forEach(row => {
            row.columns?.forEach(column => {
              column.modules?.forEach(module => {
                if (module.type === 'external_card') {
                  totalExternalCards++;
                }
              });
            });
          });
        }
      });

      // Debug logging - uncomment to see global external card count
      // console.log(`[UC] Global external card count across ALL dashboards: ${totalExternalCards}`);
      return totalExternalCards;
    } catch (error) {
      console.error('[UC] Failed to count global external cards:', error);
      // Fallback to local count if global scan fails
      return this._countExternalCardModules();
    }
  }

  /**
   * Get list of external card IDs that are allowed (first 5 by timestamp)
   * Returns a Set of allowed external card IDs for non-Pro users
   */
  private async _getAllowedExternalCardIds(): Promise<Set<string>> {
    try {
      // Scan the entire dashboard for all Ultra Card instances
      const snapshot = await ucDashboardScannerService.scanDashboard();

      // Collect all external card modules with their timestamps
      const allExternalCards: Array<{ id: string; timestamp: number }> = [];

      snapshot.cards.forEach(dashboardCard => {
        const config = dashboardCard.config;

        if (config.layout && config.layout.rows) {
          config.layout.rows.forEach(row => {
            row.columns?.forEach(column => {
              column.modules?.forEach(module => {
                if (module.type === 'external_card' && module.id) {
                  // Extract timestamp from ID format: external-card-{timestamp}-{random}
                  const match = module.id.match(/external-card-(\d+)-/);
                  if (match) {
                    const timestamp = parseInt(match[1], 10);
                    allExternalCards.push({ id: module.id, timestamp });
                  }
                }
              });
            });
          });
        }
      });

      // Sort by timestamp (oldest first)
      allExternalCards.sort((a, b) => a.timestamp - b.timestamp);

      // Take first 5
      const allowedIds = new Set(allExternalCards.slice(0, 5).map(card => card.id));

      return allowedIds;
    } catch (error) {
      console.error('[UC] Failed to get allowed external card IDs:', error);
      return new Set();
    }
  }

  /**
   * Refresh the global external card count
   * This is called when the 3rd party tab is rendered
   */
  private async _refreshGlobalExternalCardCount(): Promise<void> {
    // Only refresh if the count is not already being calculated
    if (!this._isRefreshingGlobalCount) {
      this._isRefreshingGlobalCount = true;
      try {
        const count = await this._countAllExternalCardModulesGlobally();
        this._globalExternalCardCount = count;
      } finally {
        this._isRefreshingGlobalCount = false;
      }
    }
  }

  /**
   * Handle refresh button click in 3rd party tab
   */
  private async _handleRefresh3rdPartyTab(): Promise<void> {
    await this._refreshGlobalExternalCardCount();
    this.requestUpdate();
  }

  /**
   * Open Ultra Card Pro purchase page
   */
  private _openProPage(): void {
    window.open('https://ultracard.io/product/ultra-card-pro/', '_blank');
  }
  private _isRefreshingGlobalCount = false;

  private _duplicateModule(rowIndex: number, columnIndex: number, moduleIndex: number): void {
    const layout = this._ensureLayout();
    const row = layout.rows[rowIndex];
    if (!row || !row.columns[columnIndex]) return;

    const column = row.columns[columnIndex];
    if (!column.modules || !column.modules[moduleIndex]) return;

    // Prevent duplication if it would exceed non-pro third-party limit
    try {
      const integrationUser = ucCloudAuthService.checkIntegrationAuth(this.hass);
      const isPro =
        integrationUser?.subscription?.tier === 'pro' &&
        integrationUser?.subscription?.status === 'active';
      if (!isPro) {
        const mod = column.modules[moduleIndex] as any;
        const additionalThirdParty = isThirdParty(mod?.type) ? 1 : 0;
        if (ThirdPartyLimitService.wouldExceedLimit(this.hass!, additionalThirdParty)) {
          this._showToast('Cannot duplicate: 5 third-party modules limit reached.', 'error');
          return;
        }
      }
    } catch {}

    const moduleToCopy = column.modules[moduleIndex];

    // Deep clone the module with new ID
    const duplicatedModule: CardModule = {
      ...JSON.parse(JSON.stringify(moduleToCopy)),
      id: `${moduleToCopy.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    // Invalidate external card cache if duplicating an external card
    const isExternalCard = moduleToCopy && moduleToCopy.type === 'external_card';
    if (isExternalCard) {
      import('../../modules/external-card-module').then(({ invalidateExternalCardCache }) => {
        invalidateExternalCardCache();
      });
    }

    // Create new layout with duplicated module
    const newLayout = {
      rows: layout.rows.map((r, rIndex) => {
        if (rIndex === rowIndex) {
          return {
            ...r,
            columns: r.columns.map((col, cIndex) => {
              if (cIndex === columnIndex) {
                const newModules = [...col.modules];
                newModules.splice(moduleIndex + 1, 0, duplicatedModule);
                return {
                  ...col,
                  modules: newModules,
                };
              }
              return col;
            }),
          };
        }
        return r;
      }),
    };

    this._updateLayout(newLayout);
  }

  private _deleteModule(rowIndex: number, columnIndex: number, moduleIndex: number): void {
    const layout = this._ensureLayout();
    const row = layout.rows[rowIndex];
    if (!row || !row.columns[columnIndex]) return;

    const column = row.columns[columnIndex];
    if (!column.modules || !column.modules[moduleIndex]) return;

    // Cleanup external card cache if this is an external card
    const moduleToDelete = column.modules[moduleIndex];
    const isExternalCard = moduleToDelete && moduleToDelete.type === 'external_card';

    if (isExternalCard) {
      import('../../modules/external-card-module').then(({ cleanupExternalCardCache }) => {
        cleanupExternalCardCache(moduleToDelete.id);
      });
    }

    // Create new layout without the deleted module
    const newLayout = {
      rows: layout.rows.map((r, rIndex) => {
        if (rIndex === rowIndex) {
          return {
            ...r,
            columns: r.columns.map((col, cIndex) => {
              if (cIndex === columnIndex) {
                return {
                  ...col,
                  modules: col.modules.filter((_, mIndex) => mIndex !== moduleIndex),
                };
              }
              return col;
            }),
          };
        }
        return r;
      }),
    };

    this._updateLayout(newLayout);

    // Refresh global count if an external card was deleted
    if (isExternalCard) {
      this._refreshGlobalExternalCardCount();
    }
  }

  private _openModuleSettings(rowIndex: number, columnIndex: number, moduleIndex: number): void {
    const module = this.config.layout?.rows[rowIndex]?.columns[columnIndex]?.modules[moduleIndex];

    // All modules (including external cards) now use Ultra Card settings popup
    this._selectedModule = { rowIndex, columnIndex, moduleIndex };
    this._showModuleSettings = true;

    // For external cards, check if they have a native editor
    if (module?.type === 'external_card') {
      const externalModule = module as any;
      if (externalModule.card_type) {
        // Check if card has native editor
        const editorType = `${externalModule.card_type}-editor`;
        const editorElement = customElements.get(editorType);
        const hasEditor =
          editorElement !== undefined && !(editorElement.prototype instanceof HTMLUnknownElement);

        // If no native editor, switch to YAML tab
        this._activeModuleTab = hasEditor ? 'general' : 'yaml';
      } else {
        // No card type set yet, use general tab
        this._activeModuleTab = 'general';
      }
    } else {
      // Regular modules start with general tab
      this._activeModuleTab = 'general';
    }
  }

  private _updateModule(updates: Partial<CardModule>): void {
    if (!this._selectedModule) {
      return;
    }

    // Capture scroll position before update (for mobile scroll preservation)
    const popupBody = this.shadowRoot?.querySelector('.popup-body') as HTMLElement;
    const selectorBody = this.shadowRoot?.querySelector('.selector-body') as HTMLElement;
    const scrollContainer = popupBody || selectorBody;
    if (scrollContainer) {
      this._savedScrollPosition = scrollContainer.scrollTop;
      this._shouldRestoreScroll = true;
    }

    const layout = this._ensureLayout();
    const { rowIndex, columnIndex, moduleIndex } = this._selectedModule;

    // Create a new layout with the updated module
    const newLayout = {
      rows: layout.rows.map((row, rIndex) => {
        if (rIndex === rowIndex) {
          return {
            ...row,
            columns: row.columns.map((col, cIndex) => {
              if (cIndex === columnIndex) {
                return {
                  ...col,
                  modules: col.modules.map((module, mIndex) => {
                    if (mIndex === moduleIndex) {
                      // Create updated module by copying original and applying updates
                      const updatedModule = { ...module };

                      // Apply updates, but DELETE properties that are set to undefined (for reset functionality)
                      for (const [key, value] of Object.entries(updates)) {
                        if (value === undefined) {
                          delete (updatedModule as any)[key];
                        } else {
                          (updatedModule as any)[key] = value;
                        }
                      }

                      return updatedModule as CardModule;
                    }
                    return module;
                  }),
                };
              }
              return col;
            }),
          };
        }
        return row;
      }),
    };

    this._updateLayout(newLayout);
  }

  private _updateLayoutChildModule(updates: Partial<CardModule>): void {
    if (!this._selectedLayoutChild) {
      return;
    }

    // Capture scroll position before update (for mobile scroll preservation)
    const popupBody = this.shadowRoot?.querySelector('.popup-body') as HTMLElement;
    const selectorBody = this.shadowRoot?.querySelector('.selector-body') as HTMLElement;
    const scrollContainer = popupBody || selectorBody;
    if (scrollContainer) {
      this._savedScrollPosition = scrollContainer.scrollTop;
      this._shouldRestoreScroll = true;
    }

    const { parentRowIndex, parentColumnIndex, parentModuleIndex, childIndex } =
      this._selectedLayoutChild;

    const layout = this._ensureLayout();
    const newLayout = JSON.parse(JSON.stringify(layout));

    const targetRow = newLayout.rows[parentRowIndex];
    if (!targetRow || !targetRow.columns[parentColumnIndex]) return;

    const targetColumn = targetRow.columns[parentColumnIndex];
    if (!targetColumn.modules || !targetColumn.modules[parentModuleIndex]) return;

    const layoutModule = targetColumn.modules[parentModuleIndex] as any;

    // Check if we're updating a nested child module (module inside a nested layout)
    if (this._selectedNestedChildIndex >= 0) {
      // We're updating a nested child module
      if (!layoutModule.modules || !layoutModule.modules[childIndex]) return;

      const nestedLayoutModule = layoutModule.modules[childIndex] as any;
      if (
        !nestedLayoutModule.modules ||
        !nestedLayoutModule.modules[this._selectedNestedChildIndex]
      )
        return;

      const originalChildModule = nestedLayoutModule.modules[this._selectedNestedChildIndex];

      // Create updated module by copying original and applying updates
      const updatedModule: any = { ...originalChildModule };

      // Special handling: deep-merge nested design object so partial updates don't wipe other fields
      if (updates.hasOwnProperty('design')) {
        const incomingDesign = (updates as any).design || {};
        const existingDesign = (updatedModule.design || {}) as Record<string, any>;
        const mergedDesign: Record<string, any> = { ...existingDesign };
        for (const [dKey, dVal] of Object.entries(incomingDesign)) {
          if (dVal === undefined) {
            delete mergedDesign[dKey];
          } else {
            mergedDesign[dKey] = dVal;
          }
        }
        updatedModule.design = mergedDesign;
      }

      // Apply remaining updates at top-level, but DELETE properties that are set to undefined (for reset)
      for (const [key, value] of Object.entries(updates)) {
        if (key === 'design') continue;
        if (value === undefined) {
          delete updatedModule[key];
        } else {
          updatedModule[key] = value;
        }
      }

      // Update the nested child module in the nested layout
      nestedLayoutModule.modules[this._selectedNestedChildIndex] = updatedModule;
    } else {
      // Regular layout child module update
      if (!layoutModule.modules || !layoutModule.modules[childIndex]) return;

      const originalChildModule = layoutModule.modules[childIndex];

      // Create updated module by copying original and applying updates
      const updatedModule: any = { ...originalChildModule };

      // Special handling: deep-merge nested design object so partial updates don't wipe other fields
      if (updates.hasOwnProperty('design')) {
        const incomingDesign = (updates as any).design || {};
        const existingDesign = (updatedModule.design || {}) as Record<string, any>;
        const mergedDesign: Record<string, any> = { ...existingDesign };
        for (const [dKey, dVal] of Object.entries(incomingDesign)) {
          if (dVal === undefined) {
            delete mergedDesign[dKey];
          } else {
            mergedDesign[dKey] = dVal;
          }
        }
        updatedModule.design = mergedDesign;
      }

      // Apply remaining updates at top-level, but DELETE properties that are set to undefined (for reset)
      for (const [key, value] of Object.entries(updates)) {
        if (key === 'design') continue;
        if (value === undefined) {
          delete updatedModule[key];
        } else {
          updatedModule[key] = value;
        }
      }

      // Update the child module in the layout
      layoutModule.modules[childIndex] = updatedModule;
    }

    this._updateLayout(newLayout);
  }
  private _updateModuleDesign(updates: Partial<DesignProperties>): void {
    // Support both direct module edits and child-module edits inside layout containers
    const isChildEdit = !this._selectedModule && !!this._selectedLayoutChild;
    if (!this._selectedModule && !this._selectedLayoutChild) {
      console.warn('_updateModuleDesign called but no selected module or layout child');
      return;
    }

    const moduleUpdates: any = {};

    // Convert design properties back to module properties (including undefined for reset)
    if (updates.hasOwnProperty('color')) moduleUpdates.color = updates.color;
    if (updates.hasOwnProperty('text_align')) {
      // Get the actual module to check its type
      const layout = this._ensureLayout();
      let actualModule: any = null;
      if (isChildEdit) {
        const { parentRowIndex, parentColumnIndex, parentModuleIndex, childIndex } =
          this._selectedLayoutChild!;
        actualModule = (
          layout.rows[parentRowIndex]?.columns[parentColumnIndex]?.modules[parentModuleIndex] as any
        )?.modules?.[childIndex] as any;
      } else {
        const { rowIndex, columnIndex, moduleIndex } = this._selectedModule!;
        actualModule = layout.rows[rowIndex]?.columns[columnIndex]?.modules[moduleIndex];
      }

      // For modules that use design object for text_align (like text modules), update the design object
      if (actualModule && actualModule.type === 'text') {
        if (!moduleUpdates.design) moduleUpdates.design = { ...(actualModule.design || {}) };
        moduleUpdates.design.text_align = updates.text_align;
      } else {
        moduleUpdates.text_align = updates.text_align;
      }
    }
    if (updates.hasOwnProperty('font_size')) {
      // For text modules, store font_size in design for consistency with module rendering,
      // and mirror a numeric top-level value for compatibility where needed.
      const layout = this._ensureLayout();
      let actualModule: any = null;
      if (isChildEdit) {
        const { parentRowIndex, parentColumnIndex, parentModuleIndex, childIndex } =
          this._selectedLayoutChild!;
        actualModule = (
          layout.rows[parentRowIndex]?.columns[parentColumnIndex]?.modules[parentModuleIndex] as any
        )?.modules?.[childIndex] as any;
      } else {
        const { rowIndex, columnIndex, moduleIndex } = this._selectedModule!;
        actualModule = layout.rows[rowIndex]?.columns[columnIndex]?.modules[moduleIndex];
      }

      if (actualModule && actualModule.type === 'text') {
        if (!moduleUpdates.design) moduleUpdates.design = { ...(actualModule.design || {}) };
        (moduleUpdates.design as any).font_size = (updates as any).font_size || undefined;
      }

      moduleUpdates.font_size = (updates as any).font_size || undefined;
    }
    if (updates.hasOwnProperty('line_height')) moduleUpdates.line_height = updates.line_height;
    if (updates.hasOwnProperty('letter_spacing'))
      moduleUpdates.letter_spacing = updates.letter_spacing;
    if (updates.hasOwnProperty('font_family')) moduleUpdates.font_family = updates.font_family;
    if (updates.hasOwnProperty('font_weight')) moduleUpdates.font_weight = updates.font_weight;
    if (updates.hasOwnProperty('text_transform'))
      moduleUpdates.text_transform = updates.text_transform;
    if (updates.hasOwnProperty('font_style')) moduleUpdates.font_style = updates.font_style;
    if (updates.hasOwnProperty('background_color')) {
      const layout = this._ensureLayout();
      let currentModule: any = null;
      if (isChildEdit) {
        const { parentRowIndex, parentColumnIndex, parentModuleIndex, childIndex } =
          this._selectedLayoutChild!;
        currentModule = (
          layout.rows[parentRowIndex]?.columns[parentColumnIndex]?.modules[parentModuleIndex] as any
        )?.modules?.[childIndex] as any;
      } else if (this._selectedModule) {
        currentModule =
          layout.rows[this._selectedModule.rowIndex]?.columns[this._selectedModule.columnIndex]
            ?.modules[this._selectedModule.moduleIndex];
      }
      if (!moduleUpdates.design) moduleUpdates.design = { ...(currentModule?.design || {}) };
      moduleUpdates.design.background_color = updates.background_color;
      // Also set top-level for immediate preview compatibility
      moduleUpdates.background_color = updates.background_color;
    }
    if (updates.hasOwnProperty('background_image'))
      moduleUpdates.background_image = updates.background_image;
    if (updates.hasOwnProperty('background_image_type'))
      moduleUpdates.background_image_type = updates.background_image_type;
    if (updates.hasOwnProperty('background_image_entity'))
      moduleUpdates.background_image_entity = updates.background_image_entity;
    if (updates.hasOwnProperty('backdrop_filter'))
      moduleUpdates.backdrop_filter = updates.backdrop_filter;
    if (updates.hasOwnProperty('background_filter'))
      moduleUpdates.background_filter = updates.background_filter;
    if (updates.hasOwnProperty('width')) {
      // Check if this is a bar module that stores width in design object
      const layout = this._ensureLayout();
      let currentModule: any = null;
      if (isChildEdit) {
        const { parentRowIndex, parentColumnIndex, parentModuleIndex, childIndex } =
          this._selectedLayoutChild!;
        currentModule = (
          layout.rows[parentRowIndex]?.columns[parentColumnIndex]?.modules[parentModuleIndex] as any
        )?.modules?.[childIndex] as any;
      } else if (this._selectedModule) {
        currentModule =
          layout.rows[this._selectedModule.rowIndex]?.columns[this._selectedModule.columnIndex]
            ?.modules[this._selectedModule.moduleIndex];
      }

      if (currentModule?.type === 'bar' || isChildEdit) {
        // For bar modules and child modules in layouts, update the design.width instead of top-level width
        if (!moduleUpdates.design) moduleUpdates.design = { ...(currentModule?.design || {}) };
        moduleUpdates.design.width = updates.width;
      } else {
        moduleUpdates.width = updates.width;
      }
    }
    if (updates.hasOwnProperty('height')) {
      // Check if this is a bar module that stores height in design object
      const layout = this._ensureLayout();
      let currentModule: any = null;
      if (isChildEdit) {
        const { parentRowIndex, parentColumnIndex, parentModuleIndex, childIndex } =
          this._selectedLayoutChild!;
        currentModule = (
          layout.rows[parentRowIndex]?.columns[parentColumnIndex]?.modules[parentModuleIndex] as any
        )?.modules?.[childIndex] as any;
      } else if (this._selectedModule) {
        currentModule =
          layout.rows[this._selectedModule.rowIndex]?.columns[this._selectedModule.columnIndex]
            ?.modules[this._selectedModule.moduleIndex];
      }

      if (currentModule?.type === 'bar' || isChildEdit) {
        // For bar modules and child modules in layouts, update the design.height instead of top-level height
        if (!moduleUpdates.design) moduleUpdates.design = { ...(currentModule?.design || {}) };
        moduleUpdates.design.height = updates.height;
      } else {
        moduleUpdates.height = updates.height;
      }
    }
    if (updates.hasOwnProperty('max_width')) {
      if (isChildEdit) {
        const layout = this._ensureLayout();
        const { parentRowIndex, parentColumnIndex, parentModuleIndex, childIndex } =
          this._selectedLayoutChild!;
        const currentModule = (
          layout.rows[parentRowIndex]?.columns[parentColumnIndex]?.modules[parentModuleIndex] as any
        )?.modules?.[childIndex] as any;
        if (!moduleUpdates.design) moduleUpdates.design = { ...(currentModule?.design || {}) };
        moduleUpdates.design.max_width = updates.max_width;
      } else {
        moduleUpdates.max_width = updates.max_width;
      }
    }
    if (updates.hasOwnProperty('max_height')) {
      if (isChildEdit) {
        const layout = this._ensureLayout();
        const { parentRowIndex, parentColumnIndex, parentModuleIndex, childIndex } =
          this._selectedLayoutChild!;
        const currentModule = (
          layout.rows[parentRowIndex]?.columns[parentColumnIndex]?.modules[parentModuleIndex] as any
        )?.modules?.[childIndex] as any;
        if (!moduleUpdates.design) moduleUpdates.design = { ...(currentModule?.design || {}) };
        moduleUpdates.design.max_height = updates.max_height;
      } else {
        moduleUpdates.max_height = updates.max_height;
      }
    }
    if (updates.hasOwnProperty('min_width')) {
      if (isChildEdit) {
        const layout = this._ensureLayout();
        const { parentRowIndex, parentColumnIndex, parentModuleIndex, childIndex } =
          this._selectedLayoutChild!;
        const currentModule = (
          layout.rows[parentRowIndex]?.columns[parentColumnIndex]?.modules[parentModuleIndex] as any
        )?.modules?.[childIndex] as any;
        if (!moduleUpdates.design) moduleUpdates.design = { ...(currentModule?.design || {}) };
        moduleUpdates.design.min_width = updates.min_width;
      } else {
        moduleUpdates.min_width = updates.min_width;
      }
    }
    if (updates.hasOwnProperty('min_height')) {
      if (isChildEdit) {
        const layout = this._ensureLayout();
        const { parentRowIndex, parentColumnIndex, parentModuleIndex, childIndex } =
          this._selectedLayoutChild!;
        const currentModule = (
          layout.rows[parentRowIndex]?.columns[parentColumnIndex]?.modules[parentModuleIndex] as any
        )?.modules?.[childIndex] as any;
        if (!moduleUpdates.design) moduleUpdates.design = { ...(currentModule?.design || {}) };
        moduleUpdates.design.min_height = updates.min_height;
      } else {
        moduleUpdates.min_height = updates.min_height;
      }
    }

    // Position properties
    if (updates.hasOwnProperty('position')) moduleUpdates.position = updates.position;
    if (updates.hasOwnProperty('top')) moduleUpdates.top = updates.top;
    if (updates.hasOwnProperty('bottom')) moduleUpdates.bottom = updates.bottom;
    if (updates.hasOwnProperty('left')) moduleUpdates.left = updates.left;
    if (updates.hasOwnProperty('right')) moduleUpdates.right = updates.right;
    if (updates.hasOwnProperty('z_index')) moduleUpdates.z_index = updates.z_index;

    // Text shadow properties
    if (updates.hasOwnProperty('text_shadow_h'))
      moduleUpdates.text_shadow_h = updates.text_shadow_h;
    if (updates.hasOwnProperty('text_shadow_v'))
      moduleUpdates.text_shadow_v = updates.text_shadow_v;
    if (updates.hasOwnProperty('text_shadow_blur'))
      moduleUpdates.text_shadow_blur = updates.text_shadow_blur;
    if (updates.hasOwnProperty('text_shadow_color'))
      moduleUpdates.text_shadow_color = updates.text_shadow_color;

    // Box shadow properties
    if (updates.hasOwnProperty('box_shadow_h')) moduleUpdates.box_shadow_h = updates.box_shadow_h;
    if (updates.hasOwnProperty('box_shadow_v')) moduleUpdates.box_shadow_v = updates.box_shadow_v;
    if (updates.hasOwnProperty('box_shadow_blur'))
      moduleUpdates.box_shadow_blur = updates.box_shadow_blur;
    if (updates.hasOwnProperty('box_shadow_spread'))
      moduleUpdates.box_shadow_spread = updates.box_shadow_spread;
    if (updates.hasOwnProperty('box_shadow_color'))
      moduleUpdates.box_shadow_color = updates.box_shadow_color;

    // Other properties
    if (updates.hasOwnProperty('overflow')) moduleUpdates.overflow = updates.overflow;
    if (updates.hasOwnProperty('clip_path')) moduleUpdates.clip_path = updates.clip_path;

    // Spacing properties
    if (updates.hasOwnProperty('margin_top')) moduleUpdates.margin_top = updates.margin_top;
    if (updates.hasOwnProperty('margin_bottom'))
      moduleUpdates.margin_bottom = updates.margin_bottom;
    if (updates.hasOwnProperty('margin_left')) moduleUpdates.margin_left = updates.margin_left;
    if (updates.hasOwnProperty('margin_right')) moduleUpdates.margin_right = updates.margin_right;
    if (updates.hasOwnProperty('padding_top')) moduleUpdates.padding_top = updates.padding_top;
    if (updates.hasOwnProperty('padding_bottom'))
      moduleUpdates.padding_bottom = updates.padding_bottom;
    if (updates.hasOwnProperty('padding_left')) moduleUpdates.padding_left = updates.padding_left;
    if (updates.hasOwnProperty('padding_right'))
      moduleUpdates.padding_right = updates.padding_right;

    // Border properties
    if (updates.hasOwnProperty('border_radius'))
      moduleUpdates.border_radius = updates.border_radius;
    if (updates.hasOwnProperty('border_style')) moduleUpdates.border_style = updates.border_style;
    if (updates.hasOwnProperty('border_width')) moduleUpdates.border_width = updates.border_width;
    if (updates.hasOwnProperty('border_color')) moduleUpdates.border_color = updates.border_color;

    // Animation properties
    if (updates.hasOwnProperty('animation_type'))
      moduleUpdates.animation_type = updates.animation_type;
    if (updates.hasOwnProperty('animation_entity'))
      moduleUpdates.animation_entity = updates.animation_entity;
    if (updates.hasOwnProperty('animation_trigger_type'))
      moduleUpdates.animation_trigger_type = updates.animation_trigger_type;
    if (updates.hasOwnProperty('animation_attribute'))
      moduleUpdates.animation_attribute = updates.animation_attribute;
    if (updates.hasOwnProperty('animation_state'))
      moduleUpdates.animation_state = updates.animation_state;
    if (updates.hasOwnProperty('intro_animation'))
      moduleUpdates.intro_animation = updates.intro_animation;
    if (updates.hasOwnProperty('outro_animation'))
      moduleUpdates.outro_animation = updates.outro_animation;
    if (updates.hasOwnProperty('animation_duration'))
      moduleUpdates.animation_duration = updates.animation_duration;
    if (updates.hasOwnProperty('animation_delay'))
      moduleUpdates.animation_delay = updates.animation_delay;
    if (updates.hasOwnProperty('animation_timing'))
      moduleUpdates.animation_timing = updates.animation_timing;

    // Handle margin/padding updates
    if (
      updates.hasOwnProperty('margin_top') ||
      updates.hasOwnProperty('margin_bottom') ||
      updates.hasOwnProperty('margin_left') ||
      updates.hasOwnProperty('margin_right')
    ) {
      const layout = this._ensureLayout();
      let module: any = null;
      if (isChildEdit) {
        const { parentRowIndex, parentColumnIndex, parentModuleIndex, childIndex } =
          this._selectedLayoutChild!;
        module = (
          layout.rows[parentRowIndex]?.columns[parentColumnIndex]?.modules[parentModuleIndex] as any
        )?.modules?.[childIndex] as any;
      } else if (this._selectedModule) {
        const { rowIndex, columnIndex, moduleIndex } = this._selectedModule;
        module = layout.rows[rowIndex]?.columns[columnIndex]?.modules[moduleIndex];
      }

      if (module) {
        // Check if all margin properties are being reset to undefined
        const marginTop = updates.hasOwnProperty('margin_top')
          ? updates.margin_top
          : (module as any).margin?.top;
        const marginBottom = updates.hasOwnProperty('margin_bottom')
          ? updates.margin_bottom
          : (module as any).margin?.bottom;
        const marginLeft = updates.hasOwnProperty('margin_left')
          ? updates.margin_left
          : (module as any).margin?.left;
        const marginRight = updates.hasOwnProperty('margin_right')
          ? updates.margin_right
          : (module as any).margin?.right;

        if (
          marginTop === undefined &&
          marginBottom === undefined &&
          marginLeft === undefined &&
          marginRight === undefined
        ) {
          // All margin properties are being reset, delete the entire margin object
          moduleUpdates.margin = undefined;
        } else {
          // Some margin properties exist, create/update the margin object
          const currentMargin = (module as any).margin || {};
          moduleUpdates.margin = {
            top: marginTop !== undefined ? marginTop : currentMargin.top,
            bottom: marginBottom !== undefined ? marginBottom : currentMargin.bottom,
            left: marginLeft !== undefined ? marginLeft : currentMargin.left,
            right: marginRight !== undefined ? marginRight : currentMargin.right,
          };
        }
      }
    }

    if (
      updates.hasOwnProperty('padding_top') ||
      updates.hasOwnProperty('padding_bottom') ||
      updates.hasOwnProperty('padding_left') ||
      updates.hasOwnProperty('padding_right')
    ) {
      const layout = this._ensureLayout();
      let module: any = null;
      
      if (isChildEdit) {
        const { parentRowIndex, parentColumnIndex, parentModuleIndex, childIndex } =
          this._selectedLayoutChild!;
        module = (
          layout.rows[parentRowIndex]?.columns[parentColumnIndex]?.modules[parentModuleIndex] as any
        )?.modules?.[childIndex] as any;
      } else if (this._selectedModule) {
        const { rowIndex, columnIndex, moduleIndex } = this._selectedModule;
        module = layout.rows[rowIndex]?.columns[columnIndex]?.modules[moduleIndex];
      }

      if (module) {
        // Check if all padding properties are being reset to undefined
        const paddingTop = updates.hasOwnProperty('padding_top')
          ? updates.padding_top
          : (module as any).padding?.top;
        const paddingBottom = updates.hasOwnProperty('padding_bottom')
          ? updates.padding_bottom
          : (module as any).padding?.bottom;
        const paddingLeft = updates.hasOwnProperty('padding_left')
          ? updates.padding_left
          : (module as any).padding?.left;
        const paddingRight = updates.hasOwnProperty('padding_right')
          ? updates.padding_right
          : (module as any).padding?.right;

        if (
          paddingTop === undefined &&
          paddingBottom === undefined &&
          paddingLeft === undefined &&
          paddingRight === undefined
        ) {
          // All padding properties are being reset, delete the entire padding object
          moduleUpdates.padding = undefined;
        } else {
          // Some padding properties exist, create/update the padding object
          const currentPadding = (module as any).padding || {};
          moduleUpdates.padding = {
            top: paddingTop !== undefined ? paddingTop : currentPadding.top,
            bottom: paddingBottom !== undefined ? paddingBottom : currentPadding.bottom,
            left: paddingLeft !== undefined ? paddingLeft : currentPadding.left,
            right: paddingRight !== undefined ? paddingRight : currentPadding.right,
          };
        }
      }
    }

    // Handle border updates
    if (
      updates.hasOwnProperty('border_radius') ||
      updates.hasOwnProperty('border_style') ||
      updates.hasOwnProperty('border_width') ||
      updates.hasOwnProperty('border_color')
    ) {
      const layout = this._ensureLayout();
      let module: any = null;
      
      if (isChildEdit) {
        const { parentRowIndex, parentColumnIndex, parentModuleIndex, childIndex } =
          this._selectedLayoutChild!;
        module = (
          layout.rows[parentRowIndex]?.columns[parentColumnIndex]?.modules[parentModuleIndex] as any
        )?.modules?.[childIndex] as any;
      } else if (this._selectedModule) {
        const { rowIndex, columnIndex, moduleIndex } = this._selectedModule;
        module = layout.rows[rowIndex]?.columns[columnIndex]?.modules[moduleIndex];
      }

      if (module) {
        // Check if all border properties are being reset to undefined
        const borderRadius = updates.hasOwnProperty('border_radius')
          ? updates.border_radius
          : (module as any).border?.radius;
        const borderStyle = updates.hasOwnProperty('border_style')
          ? updates.border_style
          : (module as any).border?.style;
        const borderWidth = updates.hasOwnProperty('border_width')
          ? updates.border_width
          : (module as any).border?.width;
        const borderColor = updates.hasOwnProperty('border_color')
          ? updates.border_color
          : (module as any).border?.color;

        if (
          borderRadius === undefined &&
          borderStyle === undefined &&
          borderWidth === undefined &&
          borderColor === undefined
        ) {
          // All border properties are being reset, delete the entire border object
          moduleUpdates.border = undefined;
        } else {
          // Some border properties exist, create/update the border object
          const currentBorder = (module as any).border || {};
          moduleUpdates.border = {
            radius:
              borderRadius !== undefined
                ? parseFloat(borderRadius) || 0
                : currentBorder.radius || 0,
            style: borderStyle !== undefined ? borderStyle : currentBorder.style || 'none',
            width: borderWidth !== undefined ? borderWidth : currentBorder.width || '1px',
            color:
              borderColor !== undefined
                ? borderColor
                : currentBorder.color || 'var(--divider-color)',
          };
        }
      }
    }

    // Apply the module updates
    if (isChildEdit) {
      this._updateLayoutChildModule(moduleUpdates);
    } else {
      this._updateModule(moduleUpdates);
    }
  }

  private _closeModuleSettings(): void {
    // Clean up external card editor cache when closing module settings
    if (this._selectedModule) {
      const layout = this._ensureLayout();
      const row = layout.rows[this._selectedModule.rowIndex];
      if (row && row.columns[this._selectedModule.columnIndex]) {
        const column = row.columns[this._selectedModule.columnIndex];
        const module = column.modules?.[this._selectedModule.moduleIndex];
        if (module?.type === 'external_card') {
          cleanupExternalCardCache(module.id);
        }
      }
    }

    this._showModuleSettings = false;
    this._selectedModule = null;
    this.requestUpdate();
  }

  private _navigateToPro(): void {
    // Navigate to the Pro tab in the Ultra Card editor
    const event = new CustomEvent('navigate-to-tab', {
      detail: { tab: 'pro' },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  private _closeLayoutChildSettings(): void {
    this._showLayoutChildSettings = false;
    this._selectedLayoutChild = null;
    this._selectedNestedChildIndex = -1; // Reset nested child index
    this.requestUpdate();
  }

  // Drag and Drop Methods
  private _onDragStart(
    e: DragEvent,
    type: 'module' | 'column' | 'row',
    rowIndex: number,
    columnIndex?: number,
    moduleIndex?: number
  ): void {
    if (!e.dataTransfer) return;

    e.stopPropagation();

    const layout = this._ensureLayout();
    let data: any;

    switch (type) {
      case 'module':
        if (columnIndex !== undefined && moduleIndex !== undefined) {
          data = layout.rows[rowIndex]?.columns[columnIndex]?.modules[moduleIndex];
        }
        break;
      case 'column':
        if (columnIndex !== undefined) {
          data = layout.rows[rowIndex]?.columns[columnIndex];
        }
        break;
      case 'row':
        data = layout.rows[rowIndex];
        break;
    }

    this._draggedItem = { type, rowIndex, columnIndex, moduleIndex, data };

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ type, rowIndex, columnIndex, moduleIndex })
    );

    // Add visual feedback
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.opacity = '0.6';
      target.style.transform = 'scale(0.95)';
    }

    // Add dragging state to host for CSS targeting
    if (type === 'column') {
      this.setAttribute('dragging-column', '');
    } else if (type === 'row') {
      this.setAttribute('dragging-row', '');
    }
  }
  private _onDragEnd(e: DragEvent): void {
    // Reset visual feedback
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.opacity = '';
      target.style.transform = '';
    }

    // Remove dragging state attributes
    this.removeAttribute('dragging-column');
    this.removeAttribute('dragging-row');

    this._draggedItem = null;
    this._dropTarget = null;
    this.requestUpdate();
  }

  private _onDragOver(e: DragEvent): void {
    if (!this._draggedItem) return;

    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  private _onDragEnter(
    e: DragEvent,
    type: 'module' | 'column' | 'row' | 'layout' | 'layout-child',
    rowIndex: number,
    columnIndex?: number,
    moduleIndex?: number
  ): void {
    e.preventDefault();
    e.stopPropagation();

    if (!this._draggedItem) return;

    // Don't allow dropping on self
    if (
      this._draggedItem.type === type &&
      this._draggedItem.rowIndex === rowIndex &&
      this._draggedItem.columnIndex === columnIndex &&
      this._draggedItem.moduleIndex === moduleIndex
    ) {
      return;
    }

    // Special handling for layout children being dragged to layout modules
    if (this._draggedItem.layoutChildIndex !== undefined) {
      // Only prevent dropping on the EXACT SAME parent layout module
      // Allow dropping on different layout modules (different row/column/module coordinates)
      if (
        type === 'layout' &&
        this._draggedItem.rowIndex === rowIndex &&
        this._draggedItem.columnIndex === columnIndex &&
        this._draggedItem.moduleIndex === moduleIndex
      ) {
        return;
      }
    }

    // Only show drop target for valid combinations
    const isValid = this._isValidDropTarget(this._draggedItem.type, type);

    if (!isValid) return;

    this._dropTarget = { type, rowIndex, columnIndex, moduleIndex };

    // Add enhanced visual feedback
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.borderColor = 'var(--primary-color)';
      target.style.backgroundColor = 'rgba(var(--rgb-primary-color), 0.1)';
    }

    this.requestUpdate();
  }

  private _onDragLeave(e: DragEvent): void {
    // Reset visual feedback
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.borderColor = '';
      target.style.backgroundColor = '';
    }

    // Only clear drop target if we're actually leaving the element
    if (
      e.relatedTarget &&
      e.currentTarget &&
      !(e.currentTarget as Element).contains(e.relatedTarget as Node)
    ) {
      this._dropTarget = null;
      this.requestUpdate();
    }
  }

  private _onDrop(
    e: DragEvent,
    type: 'module' | 'column' | 'row' | 'layout' | 'layout-child',
    rowIndex: number,
    columnIndex?: number,
    moduleIndex?: number
  ): void {
    e.preventDefault();
    e.stopPropagation();

    // Reset visual feedback
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.borderColor = '';
      target.style.backgroundColor = '';
    }

    if (!this._draggedItem) return;

    // Don't allow dropping on self
    if (
      this._draggedItem.type === type &&
      this._draggedItem.rowIndex === rowIndex &&
      this._draggedItem.columnIndex === columnIndex &&
      this._draggedItem.moduleIndex === moduleIndex
    ) {
      return;
    }

    // Validate drop target compatibility
    if (!this._isValidDropTarget(this._draggedItem.type, type)) return; // Reject invalid drops

    this._performMove(this._draggedItem, { type, rowIndex, columnIndex, moduleIndex });

    this._draggedItem = null;
    this._dropTarget = null;
    this.requestUpdate();
  }

  private _isValidDropTarget(sourceType: string, targetType: string): boolean {
    // Define valid drop combinations
    const validCombinations: Record<string, string[]> = {
      module: ['module', 'column', 'layout', 'layout-child'], // Modules can be dropped on other modules, column areas, layout modules, or layout children for reordering
      'nested-child': ['module', 'column', 'layout', 'layout-child'], // Back-compat alias (older DnD path)
      'layout-child': ['module', 'column', 'layout', 'layout-child'], // Actual type emitted by layout child drag start
      column: ['column', 'row'], // Columns can be dropped on other columns or row areas
      row: ['row'], // Rows can only be dropped on other rows
    };

    return validCombinations[sourceType]?.includes(targetType) || false;
  }

  private _performMove(source: any, target: any): void {
    const layout = this._ensureLayout();
    const newLayout = JSON.parse(JSON.stringify(layout));

    switch (source.type) {
      case 'module':
        this._moveModule(newLayout, source, target);
        break;
      case 'nested-child':
        this._moveNestedChild(newLayout, source, target);
        break;
      case 'column':
        this._moveColumn(newLayout, source, target);
        break;
      case 'row':
        this._moveRow(newLayout, source, target);
        break;
    }

    this._updateLayout(newLayout);
  }
  private _moveModule(layout: any, source: any, target: any): void {
    let sourceModule: any;
    let sourceRemoved = false;

    // Handle layout-child reordering within the same layout module FIRST
    if (source.layoutChildIndex !== undefined && target.type === 'layout-child') {
      const sourceParentRow = source.rowIndex;
      const sourceParentColumn = source.columnIndex;
      const sourceParentModule = source.moduleIndex;
      const sourceChildIndex = source.layoutChildIndex;

      const targetParentRow = target.rowIndex;
      const targetParentColumn = target.columnIndex;
      const targetParentModule = target.moduleIndex;
      const targetChildIndex = target.childIndex;

      // Check if this is reordering within the same layout module
      if (
        sourceParentRow === targetParentRow &&
        sourceParentColumn === targetParentColumn &&
        sourceParentModule === targetParentModule
      ) {
        if (sourceChildIndex === targetChildIndex) {
          // Dropping on self, do nothing
          return;
        }

        const layoutModule = layout.rows[sourceParentRow].columns[sourceParentColumn].modules[
          sourceParentModule
        ] as any;

        if (layoutModule && this._isLayoutModule(layoutModule.type) && layoutModule.modules) {
          // Remove from source position
          const movedModule = layoutModule.modules.splice(sourceChildIndex, 1)[0];

          // Calculate new insertion index - INSERT BEFORE the target module
          let newIndex = targetChildIndex;

          // If we removed an item from before the target position, adjust the target index
          if (sourceChildIndex < targetChildIndex) {
            newIndex = targetChildIndex - 1;
          }

          // Insert at new position (before the target module)
          layoutModule.modules.splice(newIndex, 0, movedModule);
        }
        return;
      }
    }

    // Get source module and handle removal
    if (source.layoutChildIndex !== undefined) {
      // Get source module from layout child
      const parentLayoutModule = layout.rows[source.rowIndex].columns[source.columnIndex].modules[
        source.moduleIndex
      ] as any;
      sourceModule = parentLayoutModule.modules[source.layoutChildIndex];
      // Remove from layout child
      parentLayoutModule.modules.splice(source.layoutChildIndex, 1);
      sourceRemoved = true;
    } else {
      // Get source module from regular column
      sourceModule =
        layout.rows[source.rowIndex].columns[source.columnIndex].modules[source.moduleIndex];
      // Don't remove from source first for layout targets!
    }

    if (target.type === 'layout') {
      // Move to layout module - validate target first, then move
      const targetLayoutModule =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];

      if (targetLayoutModule && this._isLayoutModule(targetLayoutModule.type)) {
        const sourceIsLayoutModule = this._isLayoutModule(sourceModule?.type);

        if (sourceIsLayoutModule) {
          this._relocateLayoutModule(layout, source, target, sourceModule, sourceRemoved, 'after');
          this._updateLayout(layout);
          return;
        }

        if (!targetLayoutModule.modules) {
          targetLayoutModule.modules = [];
        }
        // Add the module to the layout module FIRST
        targetLayoutModule.modules.push(sourceModule);

        // Only remove from source AFTER successfully adding to target (if not from layout child)
        if (source.layoutChildIndex === undefined) {
          layout.rows[source.rowIndex].columns[source.columnIndex].modules.splice(
            source.moduleIndex,
            1
          );
        }
      }
      return;
    }

    if (target.type === 'layout-child') {
      // Move to specific position within layout module
      const targetLayoutModule =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];

      if (targetLayoutModule && this._isLayoutModule(targetLayoutModule.type)) {
        const sourceIsLayoutModule = this._isLayoutModule(sourceModule?.type);

        if (sourceIsLayoutModule) {
          this._relocateLayoutModule(layout, source, target, sourceModule, sourceRemoved, 'before');
          this._updateLayout(layout);
          return;
        }

        if (!targetLayoutModule.modules) {
          targetLayoutModule.modules = [];
        }

        // Insert at specific position
        const insertIndex = (target as any).childIndex || 0;
        targetLayoutModule.modules.splice(insertIndex, 0, sourceModule);

        // Only remove from source AFTER successfully adding to target (if not from layout child)
        if (source.layoutChildIndex === undefined) {
          layout.rows[source.rowIndex].columns[source.columnIndex].modules.splice(
            source.moduleIndex,
            1
          );
        }
      }
      return;
    }

    // For non-layout targets, remove from source first (traditional move behavior)
    if (source.layoutChildIndex === undefined) {
      layout.rows[source.rowIndex].columns[source.columnIndex].modules.splice(
        source.moduleIndex,
        1
      );
    }

    // Add to target
    if (target.type === 'module') {
      // Insert at specific position
      let targetIndex = target.moduleIndex || 0;

      // If moving within the same column and target is after source, adjust index
      if (
        source.rowIndex === target.rowIndex &&
        source.columnIndex === target.columnIndex &&
        target.moduleIndex > source.moduleIndex
      ) {
        targetIndex--;
      }

      layout.rows[target.rowIndex].columns[target.columnIndex].modules.splice(
        targetIndex,
        0,
        sourceModule
      );
    } else if (target.type === 'column') {
      // Add to end of column
      layout.rows[target.rowIndex].columns[target.columnIndex].modules.push(sourceModule);
    }
  }

  private _relocateLayoutModule(
    layout: any,
    source: any,
    target: {
      rowIndex: number;
      columnIndex: number;
      moduleIndex?: number;
      childIndex?: number;
      type?: string;
    },
    moduleToMove: CardModule,
    sourceRemoved: boolean,
    position: 'before' | 'after'
  ): void {
    if (!moduleToMove) {
      return;
    }

    const sourceRow = layout.rows[source.rowIndex];
    const sourceColumn = sourceRow?.columns?.[source.columnIndex];
    const targetRow = layout.rows[target.rowIndex];
    const targetColumn = targetRow?.columns?.[target.columnIndex];

    if (!sourceColumn || !targetColumn) {
      return;
    }

    const sourceParentLayout =
      source.layoutChildIndex !== undefined && Array.isArray(sourceColumn.modules)
        ? sourceColumn.modules[source.moduleIndex]
        : undefined;

    const targetParentLayout =
      target.moduleIndex !== undefined && Array.isArray(targetColumn.modules)
        ? targetColumn.modules[target.moduleIndex]
        : undefined;

    const sourceList =
      source.layoutChildIndex !== undefined && this._isLayoutModule(sourceParentLayout?.type)
        ? sourceParentLayout.modules
        : sourceColumn.modules;

    const targetList =
      (target.type === 'layout' || target.type === 'layout-child') &&
      this._isLayoutModule(targetParentLayout?.type)
        ? targetParentLayout.modules
        : targetColumn.modules;

    if (!Array.isArray(targetList) || !Array.isArray(sourceList)) {
      return;
    }

    // Prevent layout modules from nesting inside other layout modules (e.g., vertical inside vertical)
    if (
      this._isLayoutModule(moduleToMove.type) &&
      this._isLayoutModule(targetParentLayout?.type) &&
      targetParentLayout?.type !== 'horizontal' &&
      targetParentLayout?.type !== 'slider'
    ) {
      return;
    }

    const sourceIndex =
      source.layoutChildIndex !== undefined ? source.layoutChildIndex : (source.moduleIndex ?? -1);

    if (!sourceRemoved && sourceIndex >= 0 && sourceIndex < sourceList.length) {
      sourceList.splice(sourceIndex, 1);
      sourceRemoved = true;
    }

    let insertIndex: number;
    if (target.type === 'layout-child' && target.childIndex !== undefined) {
      insertIndex = target.childIndex;
      if (position === 'after') {
        insertIndex += 1;
      }
    } else {
      insertIndex = position === 'before' ? 0 : targetList.length;
    }

    if (
      sourceRemoved &&
      sourceList === targetList &&
      sourceIndex >= 0 &&
      sourceIndex < insertIndex
    ) {
      insertIndex -= 1;
    }

    insertIndex = Math.max(0, Math.min(targetList.length, insertIndex));
    targetList.splice(insertIndex, 0, moduleToMove);
  }

  private _moveColumn(layout: any, source: any, target: any): void {
    // Remove column from source row
    const sourceColumn = layout.rows[source.rowIndex].columns[source.columnIndex];
    layout.rows[source.rowIndex].columns.splice(source.columnIndex, 1);

    // Update source row's column layout after removal
    const sourceRowNewColumnCount = layout.rows[source.rowIndex].columns.length;
    if (sourceRowNewColumnCount > 0) {
      const sourceDefaultLayout = this._getLayoutsForColumnCount(sourceRowNewColumnCount)[0];
      layout.rows[source.rowIndex].column_layout = sourceDefaultLayout
        ? sourceDefaultLayout.id
        : `repeat(${sourceRowNewColumnCount}, 1fr)`;
    }

    if (target.type === 'column') {
      // Insert at specific position within row
      layout.rows[target.rowIndex].columns.splice(target.columnIndex || 0, 0, sourceColumn);
    } else if (target.type === 'row') {
      // Add to end of target row
      layout.rows[target.rowIndex].columns.push(sourceColumn);
    }

    // Update target row's column layout after addition
    const targetRowNewColumnCount = layout.rows[target.rowIndex].columns.length;
    const targetDefaultLayout = this._getLayoutsForColumnCount(targetRowNewColumnCount)[0];
    layout.rows[target.rowIndex].column_layout = targetDefaultLayout
      ? targetDefaultLayout.id
      : `repeat(${targetRowNewColumnCount}, 1fr)`;
  }

  private _moveRow(layout: any, source: any, target: any): void {
    // Remove row from source
    const sourceRow = layout.rows[source.rowIndex];
    layout.rows.splice(source.rowIndex, 1);

    // Insert at target position
    const targetIndex = target.rowIndex;
    layout.rows.splice(targetIndex, 0, sourceRow);
  }

  private _moveNestedChild(layout: any, source: any, target: any): void {
    // Handle moving nested child modules (modules inside nested layout modules)
    const sourceParentLayout =
      layout.rows[source.rowIndex].columns[source.columnIndex].modules[source.moduleIndex];
    const sourceNestedLayout = sourceParentLayout.modules[source.layoutChildIndex];
    const sourceModule = sourceNestedLayout.modules[source.nestedChildIndex];

    // Remove from source
    sourceNestedLayout.modules.splice(source.nestedChildIndex, 1);

    // Add to target based on target type
    if (target.type === 'module') {
      // Moving to a regular column
      const targetColumn = layout.rows[target.rowIndex].columns[target.columnIndex];
      const targetIndex = target.moduleIndex || 0;
      targetColumn.modules.splice(targetIndex, 0, sourceModule);
    } else if (target.type === 'layout') {
      // Moving to a layout module
      const targetLayoutModule =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
      if (!targetLayoutModule.modules) {
        targetLayoutModule.modules = [];
      }
      targetLayoutModule.modules.push(sourceModule);
    } else if (target.type === 'layout-child') {
      // Moving to another position within a layout module
      const targetLayoutModule =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];
      const targetIndex = target.childIndex || 0;
      targetLayoutModule.modules.splice(targetIndex, 0, sourceModule);
    }
    // Note: We could add more target types here for moving to nested layouts, etc.
  }

  // Row settings methods
  private _openRowSettings(rowIndex: number): void {
    this._selectedRowForSettings = rowIndex;
    this._showRowSettings = true;
  }

  private _updateRow(updates: Partial<CardRow>): void {
    if (this._selectedRowForSettings === -1) {
      return;
    }

    const layout = this._ensureLayout();
    const newLayout = JSON.parse(JSON.stringify(layout));
    const targetRow = newLayout.rows[this._selectedRowForSettings];

    // Apply updates, but DELETE properties that are set to undefined (for reset functionality)
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) {
        delete (targetRow as any)[key];
      } else {
        (targetRow as any)[key] = value;
      }
    }

    this._updateLayout(newLayout);
  }

  // Column settings methods
  private _openColumnSettings(rowIndex: number, columnIndex: number): void {
    this._selectedColumnForSettings = { rowIndex, columnIndex };
    this._showColumnSettings = true;
  }

  private _updateColumn(updates: Partial<CardColumn>): void {
    if (!this._selectedColumnForSettings) {
      return;
    }

    const layout = this._ensureLayout();
    const newLayout = JSON.parse(JSON.stringify(layout));
    const targetColumn =
      newLayout.rows[this._selectedColumnForSettings.rowIndex].columns[
        this._selectedColumnForSettings.columnIndex
      ];

    // Apply updates, but DELETE properties that are set to undefined (for reset functionality)
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) {
        delete (targetColumn as any)[key];
      } else {
        (targetColumn as any)[key] = value;
      }
    }

    this._updateLayout(newLayout);
  }

  private _loadGoogleFont(fontFamily?: string): void {
    if (
      !fontFamily ||
      fontFamily === 'default' ||
      WEB_SAFE_FONTS.some(font => font.value === fontFamily)
    ) {
      return; // Don't load Google Fonts for web safe fonts
    }

    // Check if font is already loaded
    const existingLink = document.querySelector(`link[href*="${fontFamily.replace(/\s+/g, '+')}"]`);
    if (existingLink) {
      return;
    }

    // Create and append Google Fonts link
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }

  private _renderModulePreview(): TemplateResult {
    if (!this._selectedModule) return html``;
    const lang = this.hass?.locale?.language || 'en';

    const { rowIndex, columnIndex, moduleIndex } = this._selectedModule;
    // Always get a fresh reference to the module from the current config
    // This ensures we're rendering the latest data, not a stale object reference
    const module =
      this.config.layout?.rows?.[rowIndex]?.columns?.[columnIndex]?.modules?.[moduleIndex];

    if (!module) return html``;

    // Always use _renderSingleModuleWithAnimation which wraps in card container
    const previewContent = this._renderSingleModuleWithAnimation(module);

    return html`
      <div class="module-preview ${this._isPreviewPinned ? 'pinned' : ''}">
        <div class="preview-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <ha-icon
              class="preview-pin-icon ${this._isPreviewPinned ? 'pinned' : ''}"
              icon="${this._isPreviewPinned ? 'mdi:pin' : 'mdi:pin-outline'}"
              @click=${(e: Event) => {
                e.stopPropagation();
                this._togglePreviewPin();
              }}
              title="${this._isPreviewPinned
                ? localize(
                    'editor.layout.unpin_preview',
                    lang,
                    'Unpin preview (scroll with content)'
                  )
                : localize('editor.layout.pin_preview', lang, 'Pin preview (keep in view)')}"
            ></ha-icon>
            <span
              @click=${this._togglePreviewCollapsed}
              style="cursor: pointer; flex: 1;"
              title="${localize('editor.layout.toggle_preview', lang, 'Toggle preview')}"
            >
              ${localize('editor.layout.live_preview', lang, 'Live Preview')}
            </span>
          </div>
          <ha-icon
            class="preview-caret"
            icon="${this._isCurrentModulePreviewCollapsed()
              ? 'mdi:chevron-down'
              : 'mdi:chevron-up'}"
            @click=${this._togglePreviewCollapsed}
            title="${localize('editor.layout.toggle_preview', lang, 'Toggle preview')}"
          ></ha-icon>
        </div>
        <div
          class="preview-content"
          style="display: ${this._isCurrentModulePreviewCollapsed() ? 'none' : 'block'};"
        >
          ${previewContent}
        </div>
      </div>
    `;
  }

  private _togglePreviewPin(): void {
    this._isPreviewPinned = !this._isPreviewPinned;
  }

  private _renderSingleModule(
    module: CardModule,
    rowIndex?: number,
    columnIndex?: number,
    moduleIndex?: number
  ): TemplateResult {
    // For layout builder, render simplified version instead of actual preview
    return this._renderSimplifiedModule(module, rowIndex, columnIndex, moduleIndex);
  }

  private _renderSimplifiedModule(
    module: CardModule,
    rowIndex?: number,
    columnIndex?: number,
    moduleIndex?: number
  ): TemplateResult {
    const registry = getModuleRegistry();
    const lang = this.hass?.locale?.language || 'en';
    const moduleHandler = registry.getModule(module.type);

    // Get module metadata for icon and description
    const metadata = moduleHandler?.metadata || {
      icon: 'mdi:help-circle',
      title: 'Unknown',
      description: 'Unknown module type',
    };

    // Check if this is a layout module (horizontal, vertical, or slider)
    const isLayoutModule = this._isLayoutModule(module.type);

    if (isLayoutModule) {
      return this._renderLayoutModuleAsColumn(module, rowIndex, columnIndex, moduleIndex, metadata);
    }

    // Generate helpful info based on module type and configuration
    const moduleInfo = this._generateModuleInfo(module);

    // Get module title/name if available
    const moduleTitle = this._getModuleDisplayName(module);

    return html`
      <div class="simplified-module">
        <div class="simplified-module-header">
          <div
            class="simplified-module-drag-handle"
            title="${localize('editor.layout.drag_to_move_module', lang, 'Drag to move module')}"
          >
            <ha-icon icon="mdi:drag"></ha-icon>
          </div>
          <ha-icon icon="${metadata.icon}" class="simplified-module-icon"></ha-icon>
          <div class="simplified-module-content">
            <div class="simplified-module-title">${moduleTitle}</div>
            <div class="simplified-module-info">${moduleInfo}</div>
          </div>
          ${rowIndex !== undefined && columnIndex !== undefined && moduleIndex !== undefined
            ? html`
                <div class="simplified-module-actions">
                  <button
                    class="simplified-action-btn edit-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._openModuleSettings(rowIndex, columnIndex, moduleIndex);
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="${localize('editor.layout.edit_module', lang, 'Edit Module')}"
                  >
                    <ha-icon icon="mdi:pencil"></ha-icon>
                  </button>
                  <button
                    class="simplified-action-btn duplicate-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._duplicateModule(rowIndex, columnIndex, moduleIndex);
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="${localize('editor.layout.duplicate_module', lang, 'Duplicate Module')}"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </button>
                  <button
                    class="simplified-action-btn delete-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._deleteModule(rowIndex, columnIndex, moduleIndex);
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="${localize('editor.layout.delete_module', lang, 'Delete Module')}"
                  >
                    <ha-icon icon="mdi:delete"></ha-icon>
                  </button>
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }
  private _renderLayoutModuleAsColumn(
    module: CardModule,
    rowIndex?: number,
    columnIndex?: number,
    moduleIndex?: number,
    metadata?: any
  ): TemplateResult {
    const lang = this.hass?.locale?.language || 'en';
    const layoutModule = module as any; // HorizontalModule, VerticalModule, or SliderModule
    const hasChildren = layoutModule.modules && layoutModule.modules.length > 0;
    const isHorizontal = module.type === 'horizontal';
    const isVertical = module.type === 'vertical';
    const isSlider = module.type === 'slider';

    // Get layout title
    let layoutTitle = metadata?.title || 'Layout';
    if (isHorizontal) {
      layoutTitle = localize('editor.layout.horizontal_layout', lang, 'Horizontal Layout');
    } else if (isVertical) {
      layoutTitle = localize('editor.layout.vertical_layout', lang, 'Vertical Layout');
    } else if (isSlider) {
      layoutTitle = localize('editor.layout.slider_layout', lang, 'Slider Layout');
    }

    return html`
      <div class="layout-module-container">
        <div class="layout-module-header">
          <div class="layout-module-title">
            <div
              class="layout-module-drag-handle"
              title="${localize(
                'editor.layout.drag_to_move_layout',
                lang,
                'Drag to move layout module'
              )}"
            >
              <ha-icon icon="mdi:drag"></ha-icon>
            </div>
            <ha-icon icon="${metadata?.icon || 'mdi:view-sequential'}"></ha-icon>
            <span>${layoutTitle}</span>
          </div>
          <div class="layout-module-actions">
            ${rowIndex !== undefined && columnIndex !== undefined && moduleIndex !== undefined
              ? html`
                  <button
                    class="layout-module-add-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._openLayoutModuleSelector(rowIndex, columnIndex, moduleIndex);
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="${localize(
                      'editor.layout.add_module_to_layout',
                      lang,
                      'Add Module to Layout'
                    )}"
                  >
                    <ha-icon icon="mdi:plus"></ha-icon>
                  </button>
                  ${isSlider
                    ? html`
                        <button
                          class="layout-module-add-btn"
                          @click=${(e: Event) => {
                            e.stopPropagation();
                            this._addPageBreakToColumnSlider(rowIndex, columnIndex, moduleIndex);
                          }}
                          @mousedown=${(e: Event) => e.stopPropagation()}
                          @dragstart=${(e: Event) => e.preventDefault()}
                          title="${localize(
                            'editor.layout.add_page_break',
                            lang,
                            'Add Page Separator'
                          )}"
                        >
                          <ha-icon icon="mdi:format-page-break"></ha-icon>
                        </button>
                      `
                    : ''}
                  <button
                    class="layout-module-settings-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._openModuleSettings(rowIndex, columnIndex, moduleIndex);
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="${localize('editor.layout.layout_settings', lang, 'Layout Settings')}"
                  >
                    <ha-icon icon="mdi:cog"></ha-icon>
                  </button>
                  <button
                    class="layout-module-duplicate-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._duplicateModule(rowIndex, columnIndex, moduleIndex);
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="${localize('editor.layout.duplicate_layout', lang, 'Duplicate Layout')}"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </button>
                  <button
                    class="layout-module-delete-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._deleteModule(rowIndex, columnIndex, moduleIndex);
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="${localize('editor.layout.delete_layout', lang, 'Delete Layout')}"
                  >
                    <ha-icon icon="mdi:delete"></ha-icon>
                  </button>
                `
              : ''}
          </div>
        </div>
        <div
          class="layout-modules-container"
          style="
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 8px 12px;
            min-height: 60px;
            box-sizing: border-box;
            overflow: hidden;
          "
          @dragover=${this._onDragOver}
          @dragenter=${(e: DragEvent) =>
            this._onDragEnter(e, 'layout', rowIndex, columnIndex, moduleIndex)}
          @dragleave=${this._onDragLeave}
          @drop=${(e: DragEvent) => this._onDrop(e, 'layout', rowIndex, columnIndex, moduleIndex)}
        >
          ${hasChildren
            ? layoutModule.modules.map(
                (childModule: CardModule, childIndex: number) => html`
                  <div
                    class="layout-child-module-wrapper"
                    draggable="true"
                    @dragstart=${(e: DragEvent) =>
                      this._onLayoutChildDragStart(
                        e,
                        rowIndex,
                        columnIndex,
                        moduleIndex,
                        childIndex
                      )}
                    @dragend=${(e: DragEvent) => this._onLayoutChildDragEnd(e)}
                    @dragover=${this._onDragOver}
                    @dragenter=${(e: DragEvent) =>
                      this._onLayoutChildDragEnter(
                        e,
                        rowIndex,
                        columnIndex,
                        moduleIndex,
                        childIndex
                      )}
                    @dragleave=${this._onDragLeave}
                    @drop=${(e: DragEvent) =>
                      this._onLayoutChildDrop(e, rowIndex, columnIndex, moduleIndex, childIndex)}
                    class="${this._dropTarget?.type === 'layout-child' &&
                    this._dropTarget?.rowIndex === rowIndex &&
                    this._dropTarget?.columnIndex === columnIndex &&
                    this._dropTarget?.moduleIndex === moduleIndex &&
                    (this._dropTarget as any)?.childIndex === childIndex
                      ? 'drop-target'
                      : ''}"
                    style="width: 100%; max-width: 100%; box-sizing: border-box; overflow: hidden;"
                  >
                    ${this._renderLayoutChildModule(
                      childModule,
                      rowIndex,
                      columnIndex,
                      moduleIndex,
                      childIndex
                    )}
                  </div>
                `
              )
            : html`
                <div
                  class="layout-module-empty"
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    this._openLayoutModuleSelector(rowIndex!, columnIndex!, moduleIndex!);
                  }}
                  @dragover=${this._onDragOver}
                  @dragenter=${(e: DragEvent) =>
                    this._onDragEnter(e, 'layout', rowIndex!, columnIndex!, moduleIndex!)}
                  @dragleave=${this._onDragLeave}
                  @drop=${(e: DragEvent) =>
                    this._onDrop(e, 'layout', rowIndex!, columnIndex!, moduleIndex!)}
                  title="${localize(
                    'editor.layout.click_to_add_module',
                    lang,
                    'Click to add a module'
                  )}"
                  style="cursor: pointer; border: 2px dashed transparent; border-radius: 4px; padding: 12px;"
                >
                  <ha-icon icon="mdi:plus-circle"></ha-icon>
                  <span
                    >${localize('editor.layout.drop_modules_here', lang, 'Drop modules here')}</span
                  >
                </div>
              `}
          ${hasChildren
            ? html`
                <div
                  class="layout-append-zone"
                  @dragover=${this._onDragOver}
                  @dragenter=${(e: DragEvent) =>
                    this._onLayoutAppendDragEnter(e, rowIndex, columnIndex, moduleIndex)}
                  @dragleave=${this._onDragLeave}
                  @drop=${(e: DragEvent) =>
                    this._onLayoutAppendDrop(e, rowIndex, columnIndex, moduleIndex)}
                  style="
                    min-height: 20px;
                    margin-top: 8px;
                    border: 2px dashed transparent;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--secondary-text-color);
                    font-size: 12px;
                    transition: all 0.2s ease;
                  "
                >
                  Drop here to add to end
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  private _getJustifyContent(alignment: string): string {
    switch (alignment) {
      case 'left':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'right':
        return 'flex-end';
      case 'justify':
        return 'space-between';
      default:
        return 'flex-start';
    }
  }
  private _renderLayoutChildModule(
    childModule: CardModule,
    parentRowIndex?: number,
    parentColumnIndex?: number,
    parentModuleIndex?: number,
    childIndex?: number
  ): TemplateResult {
    const lang = this.hass?.locale?.language || 'en';

    // Check if this child module is itself a layout module (horizontal, vertical, or slider)
    const isNestedLayoutModule =
      childModule.type === 'horizontal' ||
      childModule.type === 'vertical' ||
      childModule.type === 'slider';

    if (isNestedLayoutModule) {
      // Render nested layout modules with full layout functionality
      // We need to create a special context for nested layout modules
      return this._renderNestedLayoutModule(
        childModule,
        parentRowIndex,
        parentColumnIndex,
        parentModuleIndex,
        childIndex
      );
    }

    // For non-layout modules, use the existing simplified rendering
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(childModule.type);

    // Get module metadata for icon and description
    const metadata = moduleHandler?.metadata || {
      icon: 'mdi:help-circle',
      title: 'Unknown',
      description: 'Unknown module type',
    };

    // Generate helpful info based on module type and configuration
    const moduleInfo = this._generateModuleInfo(childModule);
    const moduleTitle = this._getModuleDisplayName(childModule);

    // Check if this is a page break module - give it special styling
    const isPageBreak = childModule.type === 'pagebreak';
    const pageBreakStyle = isPageBreak
      ? 'background: rgba(var(--rgb-primary-color), 0.08); border-left: 3px solid rgba(var(--rgb-primary-color), 0.3);'
      : '';

    return html`
      <div
        class="layout-child-simplified-module ${isPageBreak ? 'pagebreak-module' : ''}"
        style="${pageBreakStyle}"
        @click=${(e: Event) => {
          // Only open settings if not clicking on action buttons or drag handle
          const target = e.target as HTMLElement;
          if (
            !target.closest('.layout-child-actions') &&
            !target.closest('.layout-child-drag-handle')
          ) {
            e.stopPropagation();
            if (
              parentRowIndex !== undefined &&
              parentColumnIndex !== undefined &&
              parentModuleIndex !== undefined &&
              childIndex !== undefined
            ) {
              this._openLayoutChildSettings(
                parentRowIndex,
                parentColumnIndex,
                parentModuleIndex,
                childIndex
              );
            }
          }
        }}
      >
        <div class="layout-child-module-header">
          <div
            class="layout-child-drag-handle"
            title="${localize('editor.layout.drag_to_reorder', lang, 'Drag to reorder')}"
          >
            <ha-icon icon="mdi:drag"></ha-icon>
          </div>
          <ha-icon icon="${metadata.icon}" class="layout-child-icon"></ha-icon>
          <div class="layout-child-content">
            <div class="layout-child-title">${moduleTitle}</div>
            <div class="layout-child-info">${moduleInfo}</div>
          </div>
          ${parentRowIndex !== undefined &&
          parentColumnIndex !== undefined &&
          parentModuleIndex !== undefined &&
          childIndex !== undefined
            ? html`
                <div class="layout-child-actions">
                  <button
                    class="layout-child-action-btn edit-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._openLayoutChildSettings(
                        parentRowIndex,
                        parentColumnIndex,
                        parentModuleIndex,
                        childIndex
                      );
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="${localize(
                      'editor.layout.edit_child_module',
                      lang,
                      'Edit Child Module'
                    )}"
                  >
                    <ha-icon icon="mdi:pencil"></ha-icon>
                  </button>
                  <button
                    class="layout-child-action-btn duplicate-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._duplicateLayoutChildModule(
                        parentRowIndex,
                        parentColumnIndex,
                        parentModuleIndex,
                        childIndex
                      );
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="${localize(
                      'editor.layout.duplicate_child_module',
                      lang,
                      'Duplicate Child Module'
                    )}"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </button>
                  <button
                    class="layout-child-action-btn delete-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._deleteLayoutChildModule(
                        parentRowIndex,
                        parentColumnIndex,
                        parentModuleIndex,
                        childIndex
                      );
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="${localize(
                      'editor.layout.delete_child_module',
                      lang,
                      'Delete Child Module'
                    )}"
                  >
                    <ha-icon icon="mdi:delete"></ha-icon>
                  </button>
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }
  private _renderNestedLayoutModule(
    layoutModule: CardModule,
    parentRowIndex?: number,
    parentColumnIndex?: number,
    parentModuleIndex?: number,
    childIndex?: number
  ): TemplateResult {
    const lang = this.hass?.locale?.language || 'en';
    const nestedLayout = layoutModule as any; // HorizontalModule, VerticalModule, or SliderModule
    const hasChildren = nestedLayout.modules && nestedLayout.modules.length > 0;
    const isHorizontal = layoutModule.type === 'horizontal';
    const isVertical = layoutModule.type === 'vertical';
    const isSlider = layoutModule.type === 'slider';

    // Get module metadata
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(layoutModule.type);
    const metadata = moduleHandler?.metadata || {
      icon: 'mdi:help-circle',
      title: 'Unknown Layout',
      description: 'Unknown layout type',
    };

    // Get layout title
    let layoutTitle = metadata.title || 'Layout';
    if (isHorizontal) {
      layoutTitle = localize('editor.layout.horizontal_layout', lang, 'Horizontal Layout');
    } else if (isVertical) {
      layoutTitle = localize('editor.layout.vertical_layout', lang, 'Vertical Layout');
    } else if (isSlider) {
      layoutTitle = localize('editor.layout.slider_module', lang, 'Slider Module');
    }

    return html`
      <div class="nested-layout-module-container layout-module-container">
        <div class="nested-layout-module-header layout-module-header">
          <div class="nested-layout-module-title layout-module-title">
            <div
              class="nested-layout-drag-handle layout-module-drag-handle"
              title="${localize(
                'editor.layout.drag_to_move_nested_layout',
                lang,
                'Drag to move nested layout module'
              )}"
            >
              <ha-icon icon="mdi:drag"></ha-icon>
            </div>
            <ha-icon icon="${metadata.icon}"></ha-icon>
            <span>${layoutTitle}</span>
          </div>
          <div class="nested-layout-module-actions layout-module-actions">
            ${parentRowIndex !== undefined &&
            parentColumnIndex !== undefined &&
            parentModuleIndex !== undefined &&
            childIndex !== undefined
              ? html`
                  <button
                    class="layout-module-add-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._openNestedLayoutModuleSelector(
                        parentRowIndex,
                        parentColumnIndex,
                        parentModuleIndex,
                        childIndex
                      );
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="${localize(
                      'editor.layout.add_module_to_nested_layout',
                      lang,
                      'Add Module to Nested Layout'
                    )}"
                  >
                    <ha-icon icon="mdi:plus"></ha-icon>
                  </button>
                  ${isSlider
                    ? html`
                        <button
                          class="layout-module-add-btn"
                          @click=${(e: Event) => {
                            e.stopPropagation();
                            this._addPageBreakToSlider(
                              parentRowIndex,
                              parentColumnIndex,
                              parentModuleIndex,
                              childIndex
                            );
                          }}
                          @mousedown=${(e: Event) => e.stopPropagation()}
                          @dragstart=${(e: Event) => e.preventDefault()}
                          title="${localize(
                            'editor.layout.add_page_break',
                            lang,
                            'Add Page Separator'
                          )}"
                        >
                          <ha-icon icon="mdi:format-page-break"></ha-icon>
                        </button>
                      `
                    : ''}
                  <button
                    class="layout-module-settings-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._openLayoutChildSettings(
                        parentRowIndex,
                        parentColumnIndex,
                        parentModuleIndex,
                        childIndex
                      );
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="${localize(
                      'editor.layout.nested_layout_settings',
                      lang,
                      'Nested Layout Settings'
                    )}"
                  >
                    <ha-icon icon="mdi:cog"></ha-icon>
                  </button>
                  <button
                    class="layout-module-duplicate-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._duplicateLayoutChildModule(
                        parentRowIndex,
                        parentColumnIndex,
                        parentModuleIndex,
                        childIndex
                      );
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="${localize(
                      'editor.layout.duplicate_nested_layout',
                      lang,
                      'Duplicate Nested Layout'
                    )}"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </button>
                  <button
                    class="layout-module-delete-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._deleteLayoutChildModule(
                        parentRowIndex,
                        parentColumnIndex,
                        parentModuleIndex,
                        childIndex
                      );
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="${localize(
                      'editor.layout.delete_nested_layout',
                      lang,
                      'Delete Nested Layout'
                    )}"
                  >
                    <ha-icon icon="mdi:delete"></ha-icon>
                  </button>
                `
              : ''}
          </div>
        </div>
        <div
          class="nested-layout-modules-container layout-modules-container"
          style="
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 8px 12px;
            min-height: 60px;
            box-sizing: border-box;
            overflow: hidden;
          "
          @dragover=${this._onDragOver}
          @dragenter=${(e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            // debug removed

            if (!this._draggedItem) return;

            // Only handle drops from OUTSIDE this specific nested layout
            // Check if dragging from within the EXACT SAME nested layout
            const isDraggingFromThisExactNestedLayout =
              this._draggedItem.type === 'nested-child' &&
              this._draggedItem.rowIndex === parentRowIndex &&
              this._draggedItem.columnIndex === parentColumnIndex &&
              this._draggedItem.moduleIndex === parentModuleIndex &&
              this._draggedItem.layoutChildIndex === childIndex;

            // debug removed

            if (isDraggingFromThisExactNestedLayout) {
              // debug removed
              return;
            }

            // debug removed

            // Allow dropping into nested layout modules from external sources
            this._dropTarget = {
              type: 'nested-layout' as any,
              rowIndex: parentRowIndex!,
              columnIndex: parentColumnIndex!,
              moduleIndex: parentModuleIndex!,
              childIndex: childIndex,
            };

            // Add visual feedback
            const target = e.currentTarget as HTMLElement;
            if (target) {
              target.style.borderColor = 'var(--primary-color)';
              target.style.backgroundColor = 'rgba(var(--rgb-primary-color), 0.1)';
            }

            this.requestUpdate();
          }}
          @dragleave=${this._onDragLeave}
          @drop=${(e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();

            // debug removed

            // Reset visual feedback
            const target = e.currentTarget as HTMLElement;
            if (target) {
              target.style.borderColor = '';
              target.style.backgroundColor = '';
            }

            if (!this._draggedItem) return;

            // Only handle drops from OUTSIDE this specific nested layout
            const isDraggingFromThisExactNestedLayout =
              this._draggedItem.type === 'nested-child' &&
              this._draggedItem.rowIndex === parentRowIndex &&
              this._draggedItem.columnIndex === parentColumnIndex &&
              this._draggedItem.moduleIndex === parentModuleIndex &&
              this._draggedItem.layoutChildIndex === childIndex;

            // debug removed

            if (isDraggingFromThisExactNestedLayout) {
              // debug removed
              return;
            }

            // Move the module to the nested layout
            const layout = this._ensureLayout();
            const newLayout = JSON.parse(JSON.stringify(layout));

            // Get the nested layout module
            const nestedLayoutModule = newLayout.rows[parentRowIndex!].columns[parentColumnIndex!]
              .modules[parentModuleIndex!].modules[childIndex!] as any;

            if (nestedLayoutModule && this._isLayoutModule(nestedLayoutModule.type)) {
              if (!nestedLayoutModule.modules) {
                nestedLayoutModule.modules = [];
              }

              // Get the source module
              let sourceModule;
              if ((this._draggedItem as any).nestedChildIndex !== undefined) {
                // From nested layout child (3rd level - e.g., image inside vertical inside horizontal)
                const sourceParentLayout =
                  newLayout.rows[this._draggedItem.rowIndex].columns[this._draggedItem.columnIndex]
                    .modules[this._draggedItem.moduleIndex];
                const sourceNestedLayout =
                  sourceParentLayout.modules[this._draggedItem.layoutChildIndex!];
                sourceModule =
                  sourceNestedLayout.modules[(this._draggedItem as any).nestedChildIndex];
                // Remove from source nested layout
                sourceNestedLayout.modules.splice((this._draggedItem as any).nestedChildIndex, 1);
              } else if (this._draggedItem.layoutChildIndex !== undefined) {
                // From direct layout child (2nd level - e.g., vertical inside horizontal)
                const sourceParentLayout =
                  newLayout.rows[this._draggedItem.rowIndex].columns[this._draggedItem.columnIndex]
                    .modules[this._draggedItem.moduleIndex];
                sourceModule = sourceParentLayout.modules[this._draggedItem.layoutChildIndex];
                // Remove from source
                sourceParentLayout.modules.splice(this._draggedItem.layoutChildIndex, 1);
              } else {
                // From regular module
                sourceModule =
                  newLayout.rows[this._draggedItem.rowIndex].columns[this._draggedItem.columnIndex]
                    .modules[this._draggedItem.moduleIndex];
                // Remove from source
                newLayout.rows[this._draggedItem.rowIndex].columns[
                  this._draggedItem.columnIndex
                ].modules.splice(this._draggedItem.moduleIndex, 1);
              }

              // Add to nested layout
              nestedLayoutModule.modules.push(sourceModule);

              // debug removed
              this._updateLayout(newLayout);
            }

            this._draggedItem = null;
            this._dropTarget = null;
            this.requestUpdate();
          }}
        >
          ${hasChildren
            ? nestedLayout.modules.map(
                (childModule: CardModule, nestedChildIndex: number) => html`
                  <div
                    class="nested-layout-child-wrapper"
                    style="width: 100%; box-sizing: border-box;"
                    @dragover=${(e: DragEvent) =>
                      this._onNestedChildDragOver(
                        e,
                        parentRowIndex,
                        parentColumnIndex,
                        parentModuleIndex,
                        childIndex,
                        nestedChildIndex
                      )}
                    @dragenter=${(e: DragEvent) =>
                      this._onNestedChildDragEnter(
                        e,
                        parentRowIndex,
                        parentColumnIndex,
                        parentModuleIndex,
                        childIndex,
                        nestedChildIndex
                      )}
                    @dragleave=${(e: DragEvent) => this._onNestedChildDragLeave(e)}
                    @drop=${(e: DragEvent) =>
                      this._onNestedChildDrop(
                        e,
                        parentRowIndex,
                        parentColumnIndex,
                        parentModuleIndex,
                        childIndex,
                        nestedChildIndex
                      )}
                  >
                    ${this._renderNestedChildModule(
                      childModule,
                      parentRowIndex,
                      parentColumnIndex,
                      parentModuleIndex,
                      childIndex,
                      nestedChildIndex
                    )}
                  </div>
                `
              )
            : html`
                <div
                  class="nested-layout-empty layout-module-empty"
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    if (
                      parentRowIndex !== undefined &&
                      parentColumnIndex !== undefined &&
                      parentModuleIndex !== undefined &&
                      childIndex !== undefined
                    ) {
                      this._openNestedLayoutModuleSelector(
                        parentRowIndex,
                        parentColumnIndex,
                        parentModuleIndex,
                        childIndex
                      );
                    }
                  }}
                  title="${localize(
                    'editor.layout.click_to_add_to_nested',
                    lang,
                    'Click to add a module to nested layout'
                  )}"
                  style="cursor: pointer;"
                >
                  <ha-icon icon="mdi:plus-circle"></ha-icon>
                  <span>
                    ${localize('editor.layout.drop_modules_here', lang, 'Drop modules here')}
                  </span>
                </div>
              `}
        </div>
      </div>
    `;
  }

  private _renderNestedChildModule(
    childModule: CardModule,
    parentRowIndex?: number,
    parentColumnIndex?: number,
    parentModuleIndex?: number,
    nestedLayoutIndex?: number,
    nestedChildIndex?: number
  ): TemplateResult {
    const lang = this.hass?.locale?.language || 'en';

    // Check if this child module is itself a layout module (for 3+ level nesting, which we prevent)
    const isNestedLayoutModule =
      childModule.type === 'horizontal' ||
      childModule.type === 'vertical' ||
      childModule.type === 'slider';

    if (isNestedLayoutModule) {
      // This would be a 3rd level of nesting, which we don't allow
      // But we still need to render it properly (this shouldn't happen with our validation)
      return this._renderLayoutChildModule(
        childModule,
        parentRowIndex,
        parentColumnIndex,
        parentModuleIndex,
        nestedLayoutIndex
      );
    }

    // For regular content modules inside nested layouts, use simplified rendering with proper nested indexing
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(childModule.type);

    // Get module metadata for icon and description
    const metadata = moduleHandler?.metadata || {
      icon: 'mdi:help-circle',
      title: 'Unknown',
      description: 'Unknown module type',
    };

    // Generate helpful info based on module type and configuration
    const moduleInfo = this._generateModuleInfo(childModule);
    const moduleTitle = this._getModuleDisplayName(childModule);

    return html`
      <div
        class="layout-child-simplified-module"
        draggable="true"
        @dragstart=${(e: DragEvent) =>
          this._onNestedChildDragStart(
            e,
            childModule,
            parentRowIndex,
            parentColumnIndex,
            parentModuleIndex,
            nestedLayoutIndex,
            nestedChildIndex
          )}
        @dragend=${(e: DragEvent) => this._onNestedChildDragEnd(e)}
        @click=${(e: Event) => {
          // Only open settings if not clicking on action buttons or drag handle
          const target = e.target as HTMLElement;
          if (
            !target.closest('.layout-child-actions') &&
            !target.closest('.layout-child-drag-handle')
          ) {
            e.stopPropagation();
            if (
              parentRowIndex !== undefined &&
              parentColumnIndex !== undefined &&
              parentModuleIndex !== undefined &&
              nestedLayoutIndex !== undefined &&
              nestedChildIndex !== undefined
            ) {
              this._openNestedChildSettings(
                parentRowIndex,
                parentColumnIndex,
                parentModuleIndex,
                nestedLayoutIndex,
                nestedChildIndex
              );
            }
          }
        }}
      >
        <div class="layout-child-module-header">
          <div
            class="layout-child-drag-handle"
            title="${localize('editor.layout.drag_to_reorder', lang, 'Drag to reorder')}"
          >
            <ha-icon icon="mdi:drag"></ha-icon>
          </div>
          <ha-icon icon="${metadata.icon}" class="layout-child-icon"></ha-icon>
          <div class="layout-child-content">
            <div class="layout-child-title">${moduleTitle}</div>
            <div class="layout-child-info">${moduleInfo}</div>
          </div>
          ${parentRowIndex !== undefined &&
          parentColumnIndex !== undefined &&
          parentModuleIndex !== undefined &&
          nestedLayoutIndex !== undefined &&
          nestedChildIndex !== undefined
            ? html`
                <div class="layout-child-actions">
                  <button
                    class="layout-child-action-btn edit-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._openNestedChildSettings(
                        parentRowIndex,
                        parentColumnIndex,
                        parentModuleIndex,
                        nestedLayoutIndex,
                        nestedChildIndex
                      );
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="${localize(
                      'editor.layout.edit_nested_child_module',
                      lang,
                      'Edit Nested Child Module'
                    )}"
                  >
                    <ha-icon icon="mdi:pencil"></ha-icon>
                  </button>
                  <button
                    class="layout-child-action-btn duplicate-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._duplicateNestedChildModule(
                        parentRowIndex,
                        parentColumnIndex,
                        parentModuleIndex,
                        nestedLayoutIndex,
                        nestedChildIndex
                      );
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="${localize(
                      'editor.layout.duplicate_nested_child_module',
                      lang,
                      'Duplicate Nested Child Module'
                    )}"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </button>
                  <button
                    class="layout-child-action-btn delete-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._deleteNestedChildModule(
                        parentRowIndex,
                        parentColumnIndex,
                        parentModuleIndex,
                        nestedLayoutIndex,
                        nestedChildIndex
                      );
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="${localize(
                      'editor.layout.delete_nested_child_module',
                      lang,
                      'Delete Nested Child Module'
                    )}"
                  >
                    <ha-icon icon="mdi:delete"></ha-icon>
                  </button>
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  // Drag and drop handlers for layout modules
  private _onLayoutModuleDragOver(
    e: DragEvent,
    rowIndex?: number,
    columnIndex?: number,
    moduleIndex?: number
  ): void {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  private _onLayoutModuleDragEnter(
    e: DragEvent,
    rowIndex?: number,
    columnIndex?: number,
    moduleIndex?: number
  ): void {
    e.preventDefault();
    e.stopPropagation();

    // Only allow dropping modules
    if (this._draggedItem && this._draggedItem.type === 'module') {
      // Check if we're dragging from a different location
      const isDifferentSource = !(
        this._draggedItem.rowIndex === rowIndex &&
        this._draggedItem.columnIndex === columnIndex &&
        this._draggedItem.moduleIndex === moduleIndex
      );

      if (isDifferentSource) {
        // Set visual feedback - add CSS class to show drop target
        const target = e.currentTarget as HTMLElement;
        target.classList.add('layout-drop-target');
      }
    }
  }

  private _onLayoutModuleDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
  }
  private _onLayoutModuleDrop(
    e: DragEvent,
    rowIndex?: number,
    columnIndex?: number,
    moduleIndex?: number
  ): void {
    e.preventDefault();
    e.stopPropagation();

    // Remove visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('layout-drop-target');

    if (!this._draggedItem || this._draggedItem.type !== 'module') {
      return;
    }

    if (rowIndex === undefined || columnIndex === undefined || moduleIndex === undefined) {
      return;
    }

    // Get the layout module we're dropping into
    const layout = this._ensureLayout();
    const targetRow = layout.rows[rowIndex];
    if (!targetRow || !targetRow.columns[columnIndex]) {
      return;
    }

    const targetColumn = targetRow.columns[columnIndex];
    const targetLayoutModule = targetColumn.modules[moduleIndex] as any; // HorizontalModule or VerticalModule

    if (!targetLayoutModule || !this._isLayoutModule(targetLayoutModule.type)) {
      return;
    }

    // Initialize modules array if it doesn't exist
    if (!targetLayoutModule.modules) {
      targetLayoutModule.modules = [];
    }

    // Clone the dragged module
    const draggedModule = JSON.parse(JSON.stringify(this._draggedItem.data));

    // FIX: Constrain image module sizing when adding to layout modules
    if (draggedModule.type === 'image') {
      // Only apply if using default settings (width is 100% and no explicit max-width)
      const hasDefaultWidth =
        !draggedModule.design?.width && (!draggedModule.width || draggedModule.width === '100%');

      if (hasDefaultWidth) {
        // Initialize design object if it doesn't exist
        if (!draggedModule.design) {
          draggedModule.design = {};
        }

        // Set responsive width with reasonable constraints
        draggedModule.width = '100%';
        // Use min() to ensure responsive scaling: responsive up to 500px, then lock at 500px
        draggedModule.design.max_width = 'min(100%, 500px)';

        // Change object_fit to 'cover' for better default appearance in layouts
        if (!draggedModule.object_fit || draggedModule.object_fit === 'contain') {
          draggedModule.object_fit = 'cover';
        }
      }
    }

    // Check if this is a reordering within the same layout module
    if (
      this._draggedItem.layoutChildIndex !== undefined &&
      this._draggedItem.rowIndex === rowIndex &&
      this._draggedItem.columnIndex === columnIndex &&
      this._draggedItem.moduleIndex === moduleIndex
    ) {
      // This is reordering within the same layout - don't add, the child handler should handle this
      return;
    }

    // Add the module to the layout module (only for new modules coming from outside)
    targetLayoutModule.modules.push(draggedModule);

    // Remove the module from its original location
    const sourceRow = layout.rows[this._draggedItem.rowIndex];
    if (sourceRow && sourceRow.columns[this._draggedItem.columnIndex!]) {
      const sourceColumn = sourceRow.columns[this._draggedItem.columnIndex!];
      sourceColumn.modules.splice(this._draggedItem.moduleIndex!, 1);
    }

    // Update the layout
    this._updateLayout(layout);

    // Clear drag state
    this._draggedItem = null;
    this._dropTarget = null;
  }

  private _onLayoutChildDragStart(
    e: DragEvent,
    parentRowIndex?: number,
    parentColumnIndex?: number,
    parentModuleIndex?: number,
    childIndex?: number
  ): void {
    if (!e.dataTransfer) return;

    e.stopPropagation();

    // Get the child module data
    const layout = this._ensureLayout();
    const layoutModule = layout.rows[parentRowIndex!]?.columns[parentColumnIndex!]?.modules[
      parentModuleIndex!
    ] as any;
    const childModule = layoutModule?.modules?.[childIndex!];

    if (childModule) {
      // Set drag data to indicate this is from a layout child
      this._draggedItem = {
        type: 'module',
        rowIndex: parentRowIndex!,
        columnIndex: parentColumnIndex!,
        moduleIndex: parentModuleIndex!,
        data: childModule,
        // Add special property to indicate this is from layout child
        layoutChildIndex: childIndex,
      } as any;

      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData(
        'text/plain',
        JSON.stringify({
          type: 'layout-child',
          parentRowIndex,
          parentColumnIndex,
          parentModuleIndex,
          childIndex,
        })
      );

      // Add visual feedback
      const target = e.currentTarget as HTMLElement;
      if (target) {
        target.style.opacity = '0.6';
        target.style.transform = 'scale(0.95)';
      }
    }
  }

  private _onLayoutChildDragEnd(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();

    // Reset visual feedback
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.opacity = '';
      target.style.transform = '';
    }

    this._draggedItem = null;
    this._dropTarget = null;
    this.requestUpdate();
  }

  private _onNestedChildDragStart(
    e: DragEvent,
    childModule: CardModule,
    parentRowIndex?: number,
    parentColumnIndex?: number,
    parentModuleIndex?: number,
    nestedLayoutIndex?: number,
    nestedChildIndex?: number
  ): void {
    if (!e.dataTransfer) return;

    e.stopPropagation();

    // Set up drag data for nested child modules
    this._draggedItem = {
      type: 'nested-child',
      rowIndex: parentRowIndex!,
      columnIndex: parentColumnIndex!,
      moduleIndex: parentModuleIndex!,
      layoutChildIndex: nestedLayoutIndex!, // Index of the nested layout module
      nestedChildIndex: nestedChildIndex!, // Index of the module within the nested layout
      data: childModule, // Store the module data for drag operations
    };

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', 'nested-child-module');

    // Visual feedback
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.opacity = '0.5';
      target.style.transform = 'scale(0.95)';
    }
  }
  private _onNestedChildDragEnd(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();

    // Reset visual feedback
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.opacity = '';
      target.style.transform = '';
    }

    this._draggedItem = null;
    this._dropTarget = null;
  }

  private _onNestedChildDragOver(
    e: DragEvent,
    parentRowIndex?: number,
    parentColumnIndex?: number,
    parentModuleIndex?: number,
    nestedLayoutIndex?: number,
    targetChildIndex?: number
  ): void {
    e.preventDefault();
    e.stopPropagation();
  }

  private _onNestedChildDragEnter(
    e: DragEvent,
    parentRowIndex?: number,
    parentColumnIndex?: number,
    parentModuleIndex?: number,
    nestedLayoutIndex?: number,
    targetChildIndex?: number
  ): void {
    e.preventDefault();
    e.stopPropagation();

    // debug removed

    if (!this._draggedItem) return;

    // Only handle reordering within the same nested layout
    const isSameNestedLayout =
      this._draggedItem.type === 'nested-child' &&
      this._draggedItem.rowIndex === parentRowIndex &&
      this._draggedItem.columnIndex === parentColumnIndex &&
      this._draggedItem.moduleIndex === parentModuleIndex &&
      this._draggedItem.layoutChildIndex === nestedLayoutIndex;

    if (!isSameNestedLayout) return;

    // Don't drop on yourself
    if (this._draggedItem.nestedChildIndex === targetChildIndex) return;

    // Visual feedback
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.backgroundColor = 'var(--primary-color, #03a9f4)';
      target.style.opacity = '0.3';
    }
  }

  private _onNestedChildDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.backgroundColor = '';
      target.style.opacity = '';
    }
  }

  private _onNestedChildDrop(
    e: DragEvent,
    parentRowIndex?: number,
    parentColumnIndex?: number,
    parentModuleIndex?: number,
    nestedLayoutIndex?: number,
    targetChildIndex?: number
  ): void {
    e.preventDefault();
    e.stopPropagation();

    // debug removed

    // Clear visual feedback
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.backgroundColor = '';
      target.style.opacity = '';
    }

    if (!this._draggedItem) return;

    // Only handle reordering within the same nested layout
    const isSameNestedLayout =
      this._draggedItem.type === 'nested-child' &&
      this._draggedItem.rowIndex === parentRowIndex &&
      this._draggedItem.columnIndex === parentColumnIndex &&
      this._draggedItem.moduleIndex === parentModuleIndex &&
      this._draggedItem.layoutChildIndex === nestedLayoutIndex;

    if (!isSameNestedLayout) return;

    // Don't drop on yourself
    if (this._draggedItem.nestedChildIndex === targetChildIndex) return;

    // debug removed

    // Reorder within the nested layout
    const layout = this._ensureLayout();
    const newLayout = JSON.parse(JSON.stringify(layout));

    let sourceChildIndex = this._draggedItem.nestedChildIndex!;
    let targetIndex = targetChildIndex!;

    // Access the nested layout using the same structure used for rendering
    const parentLayoutModule: any =
      newLayout.rows[parentRowIndex!].columns[parentColumnIndex!].modules[parentModuleIndex!];

    if (!parentLayoutModule || !Array.isArray(parentLayoutModule.modules)) {
      console.warn('❌ Parent layout module missing modules array');
      return;
    }

    const nestedLayout: any = parentLayoutModule.modules[nestedLayoutIndex!];
    if (!nestedLayout || !Array.isArray(nestedLayout.modules)) {
      console.warn('❌ Nested layout missing modules array');
      return;
    }

    const nestedModules = nestedLayout.modules as any[];

    // If moving downward, the removal shifts the target index
    if (sourceChildIndex < targetIndex) {
      targetIndex = Math.max(0, targetIndex - 1);
    }

    // Bounds safety
    sourceChildIndex = Math.max(0, Math.min(sourceChildIndex, nestedModules.length - 1));
    targetIndex = Math.max(0, Math.min(targetIndex, nestedModules.length));

    // Remove the dragged module
    const [draggedModule] = nestedModules.splice(sourceChildIndex, 1);

    // Insert at target position
    nestedModules.splice(targetIndex, 0, draggedModule);

    // debug removed

    // Update the layout
    this._updateLayout(newLayout);

    this._draggedItem = null;
    this.requestUpdate();
  }

  private _onLayoutChildDragEnter(
    e: DragEvent,
    rowIndex?: number,
    columnIndex?: number,
    moduleIndex?: number,
    childIndex?: number
  ): void {
    e.preventDefault();
    e.stopPropagation();

    if (!this._draggedItem || this._draggedItem.type !== 'module') return;

    // Don't allow dropping on self
    if (
      this._draggedItem.layoutChildIndex !== undefined &&
      this._draggedItem.rowIndex === rowIndex &&
      this._draggedItem.columnIndex === columnIndex &&
      this._draggedItem.moduleIndex === moduleIndex &&
      this._draggedItem.layoutChildIndex === childIndex
    ) {
      return;
    }

    // Set drop target for layout child reordering
    this._dropTarget = {
      type: 'layout-child',
      rowIndex: rowIndex!,
      columnIndex: columnIndex!,
      moduleIndex: moduleIndex!,
      childIndex: childIndex!,
    };
    this.requestUpdate();
  }

  private _onLayoutChildDrop(
    e: DragEvent,
    rowIndex?: number,
    columnIndex?: number,
    moduleIndex?: number,
    childIndex?: number
  ): void {
    e.preventDefault();
    e.stopPropagation();

    if (!this._draggedItem || this._draggedItem.type !== 'module') {
      return;
    }

    if (
      rowIndex === undefined ||
      columnIndex === undefined ||
      moduleIndex === undefined ||
      childIndex === undefined
    ) {
      return;
    }

    const layout = this._ensureLayout();
    const newLayout = JSON.parse(JSON.stringify(layout));
    const targetLayoutModule = newLayout.rows[rowIndex].columns[columnIndex].modules[
      moduleIndex
    ] as any;

    if (!targetLayoutModule || !this._isLayoutModule(targetLayoutModule.type)) {
      return;
    }

    if (!targetLayoutModule.modules) {
      targetLayoutModule.modules = [];
    }

    // Handle reordering within the same layout module
    if (this._draggedItem.layoutChildIndex !== undefined) {
      const sourceParentRow = this._draggedItem.rowIndex;
      const sourceParentColumn = this._draggedItem.columnIndex!;
      const sourceParentModule = this._draggedItem.moduleIndex!;
      const sourceChildIndex = this._draggedItem.layoutChildIndex;

      // Only handle reordering within the same layout module
      if (
        sourceParentRow === rowIndex &&
        sourceParentColumn === columnIndex &&
        sourceParentModule === moduleIndex
      ) {
        if (sourceChildIndex === childIndex) {
          // Dropping on self, do nothing
          return;
        }

        // Remove from source position
        const movedModule = targetLayoutModule.modules.splice(sourceChildIndex, 1)[0];

        // Calculate new insertion index - INSERT BEFORE the target module
        let newIndex = childIndex;

        // If we removed an item from before the target position, adjust the target index
        if (sourceChildIndex < childIndex) {
          newIndex = childIndex - 1;
        }

        // Insert at new position (before the target module)
        targetLayoutModule.modules.splice(newIndex, 0, movedModule);

        this._updateLayout(newLayout);
      } else {
        // Handle moving from a different layout module to this one
        const sourceLayoutModule = newLayout.rows[sourceParentRow].columns[sourceParentColumn]
          .modules[sourceParentModule] as any;

        if (
          sourceLayoutModule &&
          this._isLayoutModule(sourceLayoutModule.type) &&
          sourceLayoutModule.modules
        ) {
          // Remove from source layout
          const movedModule = sourceLayoutModule.modules.splice(sourceChildIndex, 1)[0];

          // Insert before the target module in the new layout
          targetLayoutModule.modules.splice(childIndex, 0, movedModule);

          this._updateLayout(newLayout);
        }
      }
    } else {
      // Handle dropping from a regular column - INSERT BEFORE the target module
      const draggedModule = JSON.parse(JSON.stringify(this._draggedItem.data));

      // Insert before the target module
      targetLayoutModule.modules.splice(childIndex, 0, draggedModule);

      // Remove from source column
      const sourceRow = newLayout.rows[this._draggedItem.rowIndex];
      if (sourceRow && sourceRow.columns[this._draggedItem.columnIndex!]) {
        const sourceColumn = sourceRow.columns[this._draggedItem.columnIndex!];
        sourceColumn.modules.splice(this._draggedItem.moduleIndex!, 1);
      }

      this._updateLayout(newLayout);
    }

    // Clear drag state
    this._draggedItem = null;
    this._dropTarget = null;
    this.requestUpdate();
  }

  private _onLayoutAppendDragEnter(
    e: DragEvent,
    rowIndex?: number,
    columnIndex?: number,
    moduleIndex?: number
  ): void {
    e.preventDefault();
    e.stopPropagation();

    if (!this._draggedItem || this._draggedItem.type !== 'module') return;

    // Set drop target for appending at the end
    this._dropTarget = {
      type: 'layout-append' as any,
      rowIndex: rowIndex!,
      columnIndex: columnIndex!,
      moduleIndex: moduleIndex!,
    };

    // Add visual feedback
    const target = e.currentTarget as HTMLElement;
    target.style.borderColor = 'var(--primary-color)';
    target.style.backgroundColor = 'rgba(var(--rgb-primary-color), 0.1)';

    this.requestUpdate();
  }

  private _onLayoutAppendDrop(
    e: DragEvent,
    rowIndex?: number,
    columnIndex?: number,
    moduleIndex?: number
  ): void {
    e.preventDefault();
    e.stopPropagation();

    // Remove visual feedback
    const target = e.currentTarget as HTMLElement;
    target.style.borderColor = 'transparent';
    target.style.backgroundColor = 'transparent';

    if (!this._draggedItem || this._draggedItem.type !== 'module') {
      return;
    }

    if (rowIndex === undefined || columnIndex === undefined || moduleIndex === undefined) {
      return;
    }

    const layout = this._ensureLayout();
    const newLayout = JSON.parse(JSON.stringify(layout));
    const targetLayoutModule = newLayout.rows[rowIndex].columns[columnIndex].modules[
      moduleIndex
    ] as any;

    if (targetLayoutModule && this._isLayoutModule(targetLayoutModule.type)) {
      if (!targetLayoutModule.modules) {
        targetLayoutModule.modules = [];
      }

      const sourceIsLayout = this._isLayoutModule(this._draggedItem.data?.type);

      if (sourceIsLayout) {
        let moduleRef: CardModule | undefined;
        let removedFromParent = false;

        if (this._draggedItem.layoutChildIndex !== undefined) {
          const parentLayoutModule = newLayout.rows[this._draggedItem.rowIndex].columns[
            this._draggedItem.columnIndex
          ].modules[this._draggedItem.moduleIndex] as any;
          moduleRef = parentLayoutModule?.modules?.[this._draggedItem.layoutChildIndex];

          if (moduleRef && Array.isArray(parentLayoutModule?.modules)) {
            parentLayoutModule.modules.splice(this._draggedItem.layoutChildIndex, 1);
            removedFromParent = true;
          }
        } else {
          moduleRef =
            newLayout.rows[this._draggedItem.rowIndex].columns[this._draggedItem.columnIndex]
              .modules[this._draggedItem.moduleIndex];
        }

        if (moduleRef) {
          this._relocateLayoutModule(
            newLayout,
            this._draggedItem,
            { rowIndex, columnIndex, moduleIndex, type: 'layout' },
            moduleRef,
            removedFromParent,
            'after'
          );
          this._relocateLayoutModule(
            newLayout,
            this._draggedItem,
            { rowIndex, columnIndex, moduleIndex, type: 'layout' },
            moduleRef,
            removedFromParent,
            'after'
          );
          this._updateLayout(newLayout);
          this._draggedItem = null;
          this._dropTarget = null;
          this.requestUpdate();
          return;
        }
      }

      // Handle reordering within the same layout module (move to end)
      if (
        this._draggedItem.layoutChildIndex !== undefined &&
        this._draggedItem.rowIndex === rowIndex &&
        this._draggedItem.columnIndex === columnIndex &&
        this._draggedItem.moduleIndex === moduleIndex
      ) {
        const sourceChildIndex = this._draggedItem.layoutChildIndex;

        // Remove from source position
        const movedModule = targetLayoutModule.modules.splice(sourceChildIndex, 1)[0];

        // Add to the end
        targetLayoutModule.modules.push(movedModule);

        this._updateLayout(newLayout);
      } else {
        // Handle moving from outside the layout (new module)
        const draggedModule = JSON.parse(JSON.stringify(this._draggedItem.data));

        // Add to the end
        targetLayoutModule.modules.push(draggedModule);

        if (this._draggedItem.layoutChildIndex !== undefined) {
          const parentLayoutModule = newLayout.rows[this._draggedItem.rowIndex].columns[
            this._draggedItem.columnIndex
          ].modules[this._draggedItem.moduleIndex] as any;
          if (parentLayoutModule?.modules) {
            parentLayoutModule.modules.splice(this._draggedItem.layoutChildIndex, 1);
          }
        } else {
          const sourceRow = newLayout.rows[this._draggedItem.rowIndex];
          if (sourceRow && sourceRow.columns[this._draggedItem.columnIndex!]) {
            const sourceColumn = sourceRow.columns[this._draggedItem.columnIndex!];
            sourceColumn.modules.splice(this._draggedItem.moduleIndex!, 1);
          }
        }

        this._updateLayout(newLayout);
      }
    }

    // Clear drag state
    this._draggedItem = null;
    this._dropTarget = null;
    this.requestUpdate();
  }

  // Layout module management methods
  private _openLayoutModuleSelector(
    rowIndex: number,
    columnIndex: number,
    moduleIndex: number
  ): void {
    // Set the layout module as the target for adding child modules
    this._selectedRowIndex = rowIndex;
    this._selectedColumnIndex = columnIndex;
    this._selectedLayoutModuleIndex = moduleIndex;
    this._showModuleSelector = true;
  }

  private _openNestedLayoutModuleSelector(
    parentRowIndex: number,
    parentColumnIndex: number,
    parentModuleIndex: number,
    childIndex: number
  ): void {
    // For now, we'll use a simplified approach where we temporarily modify the nested layout module
    // to act as if it's a top-level layout module for the purposes of adding children
    // This is a compromise solution that reuses the existing module selector infrastructure

    // Set the nested layout module as the target
    this._selectedRowIndex = parentRowIndex;
    this._selectedColumnIndex = parentColumnIndex;
    // Use a special encoding to indicate we're adding to a nested layout
    // We'll store the parent module index and child index in a way we can decode later
    this._selectedLayoutModuleIndex = parentModuleIndex;
    this._selectedNestedChildIndex = childIndex; // We'll need to add this state variable
    this._showModuleSelector = true;
  }

  private _openLayoutChildSettings(
    parentRowIndex: number,
    parentColumnIndex: number,
    parentModuleIndex: number,
    childIndex: number
  ): void {
    // Get the child module
    const layout = this._ensureLayout();
    const row = layout.rows[parentRowIndex];
    if (!row || !row.columns[parentColumnIndex]) return;

    const column = row.columns[parentColumnIndex];
    if (!column.modules || !column.modules[parentModuleIndex]) return;

    const layoutModule = column.modules[parentModuleIndex] as any;
    if (!layoutModule.modules || !layoutModule.modules[childIndex]) return;

    // All child modules (including external cards) now use Ultra Card child settings popup
    this._selectedLayoutChild = {
      parentRowIndex,
      parentColumnIndex,
      parentModuleIndex,
      childIndex,
    };
    this._showLayoutChildSettings = true;
  }

  private _duplicateLayoutChildModule(
    parentRowIndex: number,
    parentColumnIndex: number,
    parentModuleIndex: number,
    childIndex: number
  ): void {
    const layout = this._ensureLayout();
    const row = layout.rows[parentRowIndex];
    if (!row || !row.columns[parentColumnIndex]) return;

    const column = row.columns[parentColumnIndex];
    if (!column.modules || !column.modules[parentModuleIndex]) return;

    const layoutModule = column.modules[parentModuleIndex] as any;
    if (!layoutModule.modules || !layoutModule.modules[childIndex]) return;

    // Clone the child module
    const childModuleToDuplicate = layoutModule.modules[childIndex];
    const duplicatedModule = JSON.parse(JSON.stringify(childModuleToDuplicate));

    // Generate new IDs for the duplicated module and any nested content
    this._regenerateModuleIds(duplicatedModule);

    // Create new layout with the duplicated child module
    const newLayout = {
      rows: layout.rows.map((r, rIndex) => {
        if (rIndex === parentRowIndex) {
          return {
            ...r,
            columns: r.columns.map((col, cIndex) => {
              if (cIndex === parentColumnIndex) {
                return {
                  ...col,
                  modules: col.modules.map((module, mIndex) => {
                    if (mIndex === parentModuleIndex) {
                      const updatedLayoutModule = module as any;
                      const newModules = [...updatedLayoutModule.modules];
                      // Insert the duplicated module right after the original
                      newModules.splice(childIndex + 1, 0, duplicatedModule);
                      return {
                        ...updatedLayoutModule,
                        modules: newModules,
                      };
                    }
                    return module;
                  }),
                };
              }
              return col;
            }),
          };
        }
        return r;
      }),
    };

    this._updateLayout(newLayout);
  }

  private _duplicateNestedChildModule(
    parentRowIndex: number,
    parentColumnIndex: number,
    parentModuleIndex: number,
    nestedLayoutIndex: number,
    nestedChildIndex: number
  ): void {
    const layout = this._ensureLayout();
    const row = layout.rows[parentRowIndex];
    if (!row || !row.columns[parentColumnIndex]) return;

    const column = row.columns[parentColumnIndex];
    if (!column.modules || !column.modules[parentModuleIndex]) return;

    const parentLayoutModule = column.modules[parentModuleIndex] as any;
    if (!parentLayoutModule.modules || !parentLayoutModule.modules[nestedLayoutIndex]) return;

    const nestedLayoutModule = parentLayoutModule.modules[nestedLayoutIndex] as any;
    if (!nestedLayoutModule.modules || !nestedLayoutModule.modules[nestedChildIndex]) return;

    // Clone the nested child module
    const childModuleToDuplicate = nestedLayoutModule.modules[nestedChildIndex];
    const duplicatedModule = JSON.parse(JSON.stringify(childModuleToDuplicate));

    // Generate new IDs for the duplicated module and any nested content
    this._regenerateModuleIds(duplicatedModule);

    // Create new layout with the duplicated nested child module
    const newLayout = {
      rows: layout.rows.map((r, rIndex) => {
        if (rIndex === parentRowIndex) {
          return {
            ...r,
            columns: r.columns.map((col, cIndex) => {
              if (cIndex === parentColumnIndex) {
                return {
                  ...col,
                  modules: col.modules.map((module, mIndex) => {
                    if (mIndex === parentModuleIndex) {
                      const updatedParentLayoutModule = module as any;
                      return {
                        ...updatedParentLayoutModule,
                        modules: updatedParentLayoutModule.modules.map(
                          (nestedModule: any, nIndex: number) => {
                            if (nIndex === nestedLayoutIndex) {
                              const updatedNestedLayoutModule = nestedModule as any;
                              const newModules = [...updatedNestedLayoutModule.modules];
                              // Insert the duplicated module right after the original
                              newModules.splice(nestedChildIndex + 1, 0, duplicatedModule);
                              return {
                                ...updatedNestedLayoutModule,
                                modules: newModules,
                              };
                            }
                            return nestedModule;
                          }
                        ),
                      };
                    }
                    return module;
                  }),
                };
              }
              return col;
            }),
          };
        }
        return r;
      }),
    };

    this._updateLayout(newLayout);
  }
  private _deleteNestedChildModule(
    parentRowIndex: number,
    parentColumnIndex: number,
    parentModuleIndex: number,
    nestedLayoutIndex: number,
    nestedChildIndex: number
  ): void {
    const layout = this._ensureLayout();
    const row = layout.rows[parentRowIndex];
    if (!row || !row.columns[parentColumnIndex]) return;

    const column = row.columns[parentColumnIndex];
    if (!column.modules || !column.modules[parentModuleIndex]) return;

    const parentLayoutModule = column.modules[parentModuleIndex] as any;
    if (!parentLayoutModule.modules || !parentLayoutModule.modules[nestedLayoutIndex]) return;

    const nestedLayoutModule = parentLayoutModule.modules[nestedLayoutIndex] as any;
    if (!nestedLayoutModule.modules || !nestedLayoutModule.modules[nestedChildIndex]) return;

    // Create new layout with the nested child module removed
    const newLayout = {
      rows: layout.rows.map((r, rIndex) => {
        if (rIndex === parentRowIndex) {
          return {
            ...r,
            columns: r.columns.map((col, cIndex) => {
              if (cIndex === parentColumnIndex) {
                return {
                  ...col,
                  modules: col.modules.map((module, mIndex) => {
                    if (mIndex === parentModuleIndex) {
                      const updatedParentLayoutModule = module as any;
                      return {
                        ...updatedParentLayoutModule,
                        modules: updatedParentLayoutModule.modules.map(
                          (nestedModule: any, nIndex: number) => {
                            if (nIndex === nestedLayoutIndex) {
                              const updatedNestedLayoutModule = nestedModule as any;
                              const newModules = [...updatedNestedLayoutModule.modules];
                              // Remove the nested child module
                              newModules.splice(nestedChildIndex, 1);
                              return {
                                ...updatedNestedLayoutModule,
                                modules: newModules,
                              };
                            }
                            return nestedModule;
                          }
                        ),
                      };
                    }
                    return module;
                  }),
                };
              }
              return col;
            }),
          };
        }
        return r;
      }),
    };

    this._updateLayout(newLayout);
  }

  private _openNestedChildSettings(
    parentRowIndex: number,
    parentColumnIndex: number,
    parentModuleIndex: number,
    nestedLayoutIndex: number,
    nestedChildIndex: number
  ): void {
    // For now, this is a placeholder - we'd need to extend the settings system
    // to handle deeply nested modules. This could reuse the existing layout child
    // settings system with an additional nesting level parameter.
    // Extend the existing layout child settings system to handle nested children
    // We'll use the existing _selectedLayoutChild but add nested indexing
    this._selectedLayoutChild = {
      parentRowIndex,
      parentColumnIndex,
      parentModuleIndex,
      childIndex: nestedLayoutIndex, // The nested layout module index
    };

    // Store the nested child index separately for deeper nesting
    this._selectedNestedChildIndex = nestedChildIndex;
    this._showLayoutChildSettings = true;
  }

  private _regenerateModuleIds(module: any): void {
    // Generate new ID for the module
    module.id = `${module.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // If this is a layout module, regenerate IDs for all nested modules
    if ((module.type === 'horizontal' || module.type === 'vertical') && module.modules) {
      module.modules.forEach((childModule: any) => {
        this._regenerateModuleIds(childModule); // Recursive for nested layouts
      });
    }

    // Handle other modules with nested content (like info modules with entities)
    if (module.type === 'info' && module.info_entities) {
      module.info_entities.forEach((entity: any) => {
        entity.id = `info-entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      });
    }

    if (module.type === 'icon' && module.icons) {
      module.icons.forEach((icon: any) => {
        icon.id = `icon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      });
    }
  }

  private _deleteLayoutChildModule(
    parentRowIndex: number,
    parentColumnIndex: number,
    parentModuleIndex: number,
    childIndex: number
  ): void {
    const layout = this._ensureLayout();
    const row = layout.rows[parentRowIndex];
    if (!row || !row.columns[parentColumnIndex]) return;

    const column = row.columns[parentColumnIndex];
    if (!column.modules || !column.modules[parentModuleIndex]) return;

    const layoutModule = column.modules[parentModuleIndex] as any;
    if (!layoutModule.modules || !layoutModule.modules[childIndex]) return;

    // Create new layout without the deleted child module
    const newLayout = {
      rows: layout.rows.map((r, rIndex) => {
        if (rIndex === parentRowIndex) {
          return {
            ...r,
            columns: r.columns.map((col, cIndex) => {
              if (cIndex === parentColumnIndex) {
                return {
                  ...col,
                  modules: col.modules.map((module, mIndex) => {
                    if (mIndex === parentModuleIndex) {
                      const updatedLayoutModule = module as any;
                      return {
                        ...updatedLayoutModule,
                        modules: updatedLayoutModule.modules.filter(
                          (_: any, index: number) => index !== childIndex
                        ),
                      };
                    }
                    return module;
                  }),
                };
              }
              return col;
            }),
          };
        }
        return r;
      }),
    };

    this._updateLayout(newLayout);
  }

  private _getModuleSettingsTitle(module: CardModule, lang: string): string {
    // For external cards, show the friendly card name
    if (module.type === 'external_card') {
      const moduleAny = module as any;
      if (moduleAny.name) {
        return moduleAny.name; // e.g., "Bubble Card", "Mushroom Fan Card"
      }
      if (moduleAny.card_type) {
        const cardInfo = ucExternalCardsService.getCardInfo(moduleAny.card_type);
        if (cardInfo) {
          return cardInfo.name;
        }
        return moduleAny.card_type;
      }
      return '3rd Party Card';
    }

    // For other modules, use the standard pattern
    return `${localize('editor.layout.module_settings_title', lang, 'Module Settings')} - ${module.type.charAt(0).toUpperCase() + module.type.slice(1)}`;
  }
  private _getModuleDisplayName(module: CardModule): string {
    // Check for custom module name first (for editor organization)
    const moduleAny = module as any;
    if (moduleAny.module_name && moduleAny.module_name.trim()) {
      return moduleAny.module_name;
    }

    // For external cards, use the stored name or card type
    if (module.type === 'external_card' && module.name) {
      return module.name;
    }

    // Fallback to consistent module type names
    const lang = this.hass?.locale?.language || 'en';
    switch (module.type) {
      case 'text':
        return localize('editor.modules.text', lang, 'Text Module');
      case 'image':
        return localize('editor.modules.image', lang, 'Image Module');
      case 'icon':
        return localize('editor.modules.icon', lang, 'Icon Module');
      case 'bar':
        return localize('editor.modules.bar', lang, 'Bar Module');
      case 'info':
        return localize('editor.modules.info', lang, 'Info Module');
      case 'button':
        return localize('editor.modules.button', lang, 'Button Module');
      case 'separator':
        return localize('editor.modules.separator', lang, 'Separator Module');
      case 'markdown':
        return localize('editor.modules.markdown', lang, 'Markdown Module');
      case 'camera':
        return localize('editor.modules.camera', lang, 'Camera Module');
      case 'graphs':
        return localize('editor.modules.graphs', lang, 'Graphs Module');
      case 'external_card':
        return '3rd Party Card';
      default:
        return module.type.charAt(0).toUpperCase() + module.type.slice(1) + ' Module';
    }
  }

  private _generateModuleInfo(module: CardModule): string {
    const moduleAny = module as any;
    const lang = this.hass?.locale?.language || 'en';

    switch (module.type) {
      case 'text':
        // Show the actual text content
        if (moduleAny.text && moduleAny.text.trim()) {
          return moduleAny.text.length > 50
            ? `${moduleAny.text.substring(0, 50)}...`
            : moduleAny.text;
        }
        return localize('editor.modules.no_text_configured', lang, 'No text configured');

      case 'image':
        // Show image name/source
        if (moduleAny.image_entity) return `Entity: ${moduleAny.image_entity}`;
        if (moduleAny.image_url) {
          const url = moduleAny.image_url;
          // Handle base64 data URLs (uploaded images)
          if (url.startsWith('data:image/')) {
            return localize('editor.modules.uploaded_image', lang, 'Uploaded image');
          }
          // Handle regular URLs
          const fileName = url.split('/').pop() || url;
          return fileName.length > 30 ? `${fileName.substring(0, 30)}...` : fileName;
        }
        if (moduleAny.image_path) {
          const path = moduleAny.image_path;
          const fileName = path.split('/').pop() || path;
          return fileName.length > 30 ? `${fileName.substring(0, 30)}...` : fileName;
        }
        return localize('editor.modules.no_image_configured', lang, 'No image configured');

      case 'icon':
        const iconCount = moduleAny.icons?.length || 0;
        if (iconCount > 1)
          return localize(
            'editor.modules.icons_configured',
            lang,
            '{count} icons configured'
          ).replace('{count}', iconCount.toString());
        if (iconCount === 1) {
          const firstIcon = moduleAny.icons[0];
          if (firstIcon?.entity) return `Entity: ${firstIcon.entity}`;
          if (firstIcon?.icon) return `Icon: ${firstIcon.icon}`;
          return 'Icon configured';
        }
        return localize('editor.modules.no_icons_configured', lang, 'No icons configured');

      case 'bar':
        // Show the entity configured for the bar
        if (moduleAny.entity) return `Entity: ${moduleAny.entity}`;
        return localize(
          'editor.modules.default_entity_suggestion',
          lang,
          'Entity: sensor.battery_level'
        ); // Default entity suggestion

      case 'info':
        // Show the entity configured for info module
        if (moduleAny.info_entities?.length) {
          const firstEntity = moduleAny.info_entities[0];
          if (firstEntity?.entity) {
            return moduleAny.info_entities.length > 1
              ? `${firstEntity.entity} + ${moduleAny.info_entities.length - 1} more`
              : `Entity: ${firstEntity.entity}`;
          }
        }
        if (moduleAny.entity) return `Entity: ${moduleAny.entity}`;
        if (moduleAny.entities?.length) return `${moduleAny.entities.length} entities configured`;
        return 'No entity configured';

      case 'button':
        // Show the actual button text (without quotes)
        if (moduleAny.button_text && moduleAny.button_text.trim()) {
          return moduleAny.button_text;
        }
        if (moduleAny.text && moduleAny.text.trim()) {
          return moduleAny.text;
        }
        if (moduleAny.label && moduleAny.label.trim()) {
          return moduleAny.label;
        }
        return 'No button text configured';

      case 'markdown':
        // Show first few words of markdown content
        const markdownContent = moduleAny.content || moduleAny.markdown_content;
        if (markdownContent && markdownContent.trim()) {
          const plainText = markdownContent.replace(/[#*`>\-\[\]]/g, '').trim();
          const words = plainText.split(' ').slice(0, 8).join(' ');
          return words.length > 40 ? `${words.substring(0, 40)}...` : words;
        }
        return 'This is a markdown module that supports italic and bold text...';

      case 'separator':
        const sepInfo = [];
        if (moduleAny.separator_style) sepInfo.push(`Style: ${moduleAny.separator_style}`);
        if (moduleAny.thickness) sepInfo.push(`${moduleAny.thickness}px thick`);
        if (moduleAny.width_percent && moduleAny.width_percent !== 100)
          sepInfo.push(`${moduleAny.width_percent}% width`);
        if (sepInfo.length > 0) return sepInfo.join(' • ');
        return 'Visual separator';

      case 'external_card':
        // Show the card type for external cards
        if (moduleAny.card_type) {
          return `Card: ${moduleAny.card_type}`;
        }
        return 'No card type configured';

      default:
        // Try to find the most relevant info for any module
        if (moduleAny.entity) return `Entity: ${moduleAny.entity}`;
        if (moduleAny.entities?.length) return `${moduleAny.entities.length} entities`;
        if (moduleAny.value !== undefined) return `Value: ${moduleAny.value}`;
        if (moduleAny.text)
          return `Text: ${moduleAny.text.length > 20 ? moduleAny.text.substring(0, 20) + '...' : moduleAny.text}`;
        return `${module.type.charAt(0).toUpperCase()}${module.type.slice(1)} module`;
    }
  }

  private _renderSingleModuleWithAnimation(module: CardModule): TemplateResult {
    // Use centralized preview service that mirrors HA preview window behavior
    return ucModulePreviewService.renderModuleInCard(module, this.hass, this.config, {
      showLogicOverlay: true,
    });
  }

  private _getRowPreviewAnimationData(row: any): { class: string; duration: string } {
    // Check if row has animation configured in design
    const design = row.design || {};
    const animationType = design.animation_type;

    if (!animationType || animationType === 'none') {
      return { class: '', duration: '2s' };
    }

    // Get animation duration or use default
    const animationDuration = design.animation_duration || '2s';

    // Check if entity condition is configured and evaluate it
    const animationEntity = design.animation_entity;
    const animationTriggerType = design.animation_trigger_type || 'state';
    const animationAttribute = design.animation_attribute;
    const animationState = design.animation_state;

    // If no entity configured, always show animation
    if (!animationEntity) {
      return {
        class: `animation-${animationType}`,
        duration: animationDuration,
      };
    }

    // If entity is configured, check actual state to match real card behavior
    if (animationState && this.hass) {
      const entity = this.hass.states[animationEntity];
      if (entity) {
        let shouldTriggerAnimation = false;

        if (animationTriggerType === 'attribute' && animationAttribute) {
          // Check attribute value
          const attributeValue = entity.attributes[animationAttribute];
          shouldTriggerAnimation = String(attributeValue) === animationState;
        } else {
          // Check entity state
          shouldTriggerAnimation = entity.state === animationState;
        }

        // Only show animation if condition is met (matching actual card behavior)
        if (shouldTriggerAnimation) {
          return {
            class: `animation-${animationType}`,
            duration: animationDuration,
          };
        }
      }
    }

    // Entity configured but condition not met - no animation
    return { class: '', duration: animationDuration };
  }

  private _getColumnPreviewAnimationData(column: any): { class: string; duration: string } {
    // Check if column has animation configured in design
    const design = column.design || {};
    const animationType = design.animation_type;

    if (!animationType || animationType === 'none') {
      return { class: '', duration: '2s' };
    }

    // Get animation duration or use default
    const animationDuration = design.animation_duration || '2s';

    // Check if entity condition is configured and evaluate it
    const animationEntity = design.animation_entity;
    const animationTriggerType = design.animation_trigger_type || 'state';
    const animationAttribute = design.animation_attribute;
    const animationState = design.animation_state;

    // If no entity configured, always show animation
    if (!animationEntity) {
      return {
        class: `animation-${animationType}`,
        duration: animationDuration,
      };
    }

    // If entity is configured, check actual state to match real card behavior
    if (animationState && this.hass) {
      const entity = this.hass.states[animationEntity];
      if (entity) {
        let shouldTriggerAnimation = false;

        if (animationTriggerType === 'attribute' && animationAttribute) {
          // Check attribute value
          const attributeValue = entity.attributes[animationAttribute];
          shouldTriggerAnimation = String(attributeValue) === animationState;
        } else {
          // Check entity state
          shouldTriggerAnimation = entity.state === animationState;
        }

        // Only show animation if condition is met (matching actual card behavior)
        if (shouldTriggerAnimation) {
          return {
            class: `animation-${animationType}`,
            duration: animationDuration,
          };
        }
      }
    }

    // Entity configured but condition not met - no animation
    return { class: '', duration: animationDuration };
  }

  private _renderRowPreview(row: CardRow): TemplateResult {
    // Get row animation data for preview
    const rowAnimationData = this._getRowPreviewAnimationData(row);

    // Include background image using same resolution as main card
    const rd: any = row.design || {};
    const rowBgImageCSS = this._resolvePreviewBackgroundImageCSS(rd);

    // Check if background filter is present for pseudo-element approach
    const hasBackgroundFilter = rd.background_filter && rd.background_filter !== 'none';
    const filterClass = hasBackgroundFilter ? 'has-background-filter' : '';

    const rowContent = html`
      <div
        class="row-preview-content ${filterClass}"
        style="background: ${hasBackgroundFilter
          ? 'transparent'
          : row.design?.background_color ||
            row.background_color ||
            'var(--ha-card-background, var(--card-background-color, #fff))'}; 
        background-image: ${hasBackgroundFilter ? 'none' : rowBgImageCSS}; 
        background-size: ${hasBackgroundFilter ? 'auto' : rd.background_size || 'cover'}; 
        background-position: ${hasBackgroundFilter
          ? 'center'
          : rd.background_position || 'center'}; 
        background-repeat: ${hasBackgroundFilter ? 'repeat' : rd.background_repeat || 'no-repeat'}; 
        backdrop-filter: ${rd.backdrop_filter || 'none'}; 
        gap: ${row.gap ?? 16}px;
        ${hasBackgroundFilter
          ? `
          position: relative;
          --bg-image: ${rowBgImageCSS};
          --bg-size: ${rd.background_size || 'cover'};
          --bg-position: ${rd.background_position || 'center'};
          --bg-repeat: ${rd.background_repeat || 'no-repeat'};
          --bg-filter: ${rd.background_filter};
        `
          : ''}"
      >
        ${row.columns.map(
          (column, columnIndex) => html`<div class="column-preview">Column ${columnIndex + 1}</div>`
        )}
      </div>
    `;

    const lang = this.hass?.locale?.language || 'en';
    return html`
      <div class="module-preview">
        <div
          class="preview-header"
          @click=${this._toggleRowColumnPreviewCollapsed}
          title="${localize('editor.layout.toggle_preview', lang, 'Toggle preview')}"
        >
          <span>${localize('editor.layout.live_preview', lang, 'Live Preview')}</span>
          <ha-icon
            class="preview-caret"
            icon="${this._isRowColumnPreviewCollapsed ? 'mdi:chevron-down' : 'mdi:chevron-up'}"
          ></ha-icon>
        </div>
        <div
          class="preview-content"
          style="display: ${this._isRowColumnPreviewCollapsed ? 'none' : 'block'};"
        >
          ${rowAnimationData.class
            ? html`
                <div
                  class="${rowAnimationData.class}"
                  style="display: inherit; width: inherit; height: inherit; flex: inherit; animation-duration: ${rowAnimationData.duration};"
                >
                  ${rowContent}
                </div>
              `
            : rowContent}
        </div>
      </div>
    `;
  }

  private _renderColumnPreview(column: CardColumn): TemplateResult {
    // Get column animation data for preview
    const columnAnimationData = this._getColumnPreviewAnimationData(column);

    // Resolve background image exactly like main card
    const d: any = column.design || {};
    const bgImageCSS = this._resolvePreviewBackgroundImageCSS(d);

    // Check if background filter is present for pseudo-element approach
    const hasBackgroundFilter = d.background_filter && d.background_filter !== 'none';
    const filterClass = hasBackgroundFilter ? 'has-background-filter' : '';

    const columnContent = html`
      <div
        class="column-preview-content ${filterClass}"
        style="background: ${hasBackgroundFilter
          ? 'transparent'
          : column.design?.background_color ||
            column.background_color ||
            'var(--ha-card-background, var(--card-background-color, #fff))'}; 
        background-image: ${hasBackgroundFilter ? 'none' : bgImageCSS}; 
        background-size: ${hasBackgroundFilter ? 'auto' : d.background_size || 'cover'}; 
        background-position: ${hasBackgroundFilter ? 'center' : d.background_position || 'center'}; 
        background-repeat: ${hasBackgroundFilter ? 'repeat' : d.background_repeat || 'no-repeat'}; 
        backdrop-filter: ${d.backdrop_filter || 'none'};
        ${hasBackgroundFilter
          ? `
          position: relative;
          --bg-image: ${bgImageCSS};
          --bg-size: ${d.background_size || 'cover'};
          --bg-position: ${d.background_position || 'center'};
          --bg-repeat: ${d.background_repeat || 'no-repeat'};
          --bg-filter: ${d.background_filter};
        `
          : ''}"
      >
        <p>
          ${localize(
            'editor.layout.column_preview',
            this.hass?.locale?.language || 'en',
            'Column Preview'
          )}
        </p>
        <div class="module-count">
          ${localize(
            'editor.layout.modules_count',
            this.hass?.locale?.language || 'en',
            '{count} modules'
          ).replace('{count}', String(column.modules?.length || 0))}
        </div>
      </div>
    `;

    const lang = this.hass?.locale?.language || 'en';
    return html`
      <div class="module-preview">
        <div
          class="preview-header"
          @click=${this._toggleRowColumnPreviewCollapsed}
          title="${localize('editor.layout.toggle_preview', lang, 'Toggle preview')}"
        >
          <span>${localize('editor.layout.live_preview', lang, 'Live Preview')}</span>
          <ha-icon
            class="preview-caret"
            icon="${this._isRowColumnPreviewCollapsed ? 'mdi:chevron-down' : 'mdi:chevron-up'}"
          ></ha-icon>
        </div>
        <div
          class="preview-content"
          style="display: ${this._isRowColumnPreviewCollapsed ? 'none' : 'block'};"
        >
          ${columnAnimationData.class
            ? html`
                <div
                  class="${columnAnimationData.class}"
                  style="display: inherit; width: inherit; height: inherit; flex: inherit; animation-duration: ${columnAnimationData.duration};"
                >
                  ${columnContent}
                </div>
              `
            : columnContent}
        </div>
      </div>
    `;
  }
  private _renderModuleSettings(): TemplateResult {
    if (!this._selectedModule) return html``;

    const { rowIndex, columnIndex, moduleIndex } = this._selectedModule;
    const module = this.config.layout?.rows[rowIndex]?.columns[columnIndex]?.modules[moduleIndex];

    if (!module) return html``;

    // Determine which extra tabs are supported by this module
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);
    // External cards don't have Actions tab (they handle their own actions)
    const hasActionsTab =
      module.type !== 'external_card' &&
      moduleHandler &&
      typeof (moduleHandler as any).renderActionsTab === 'function';
    // Globally disable the legacy "Other" tab across modules
    const hasOtherTab = false;

    // Ensure active tab is valid for this module
    if (
      (this._activeModuleTab === 'actions' && !hasActionsTab) ||
      (this._activeModuleTab === 'other' && !hasOtherTab) ||
      (this._activeModuleTab === 'yaml' && module.type !== 'external_card')
    ) {
      this._activeModuleTab = 'general';
    }

    // For external cards, check if card has editor and default tab accordingly
    if (module.type === 'external_card') {
      const externalModule = module as any;
      const hasEditor = ucExternalCardsService.hasCardEditor(externalModule.card_type);

      // If no editor, hide General tab and default to YAML (only if not already on another valid tab)
      if (!hasEditor && this._activeModuleTab === 'general') {
        this._activeModuleTab = 'yaml';
      }

      // Ensure we don't show actions tab for external cards
      if (this._activeModuleTab === 'actions') {
        this._activeModuleTab = hasEditor ? 'general' : 'yaml';
      }
    }

    const lang = this.hass?.locale?.language || 'en';
    return html`
      <div class="module-settings-popup">
        <div class="popup-overlay"></div>
        <div
          class="popup-content draggable-popup"
          id="module-popup-${this._selectedModule?.rowIndex}-${this._selectedModule
            ?.columnIndex}-${this._selectedModule?.moduleIndex}"
        >
          <div
            class="popup-header"
            @mousedown=${(e: MouseEvent) => {
              const popup = (e.target as HTMLElement).closest('.popup-content') as HTMLElement;
              if (popup) this._startPopupDrag(e, popup);
            }}
          >
            <h3>${this._getModuleSettingsTitle(module, lang)}</h3>
            <div class="header-actions">
              <button
                class="action-button duplicate-button"
                @click=${() => {
                  if (this._selectedModule) {
                    this._duplicateModule(
                      this._selectedModule.rowIndex,
                      this._selectedModule.columnIndex,
                      this._selectedModule.moduleIndex
                    );
                    this._closeModuleSettings();
                  }
                }}
                title="${localize('editor.layout.duplicate_module', lang, 'Duplicate Module')}"
              >
                <ha-icon icon="mdi:content-copy"></ha-icon>
              </button>
              <button
                class="action-button delete-button"
                @click=${() => {
                  if (this._selectedModule) {
                    this._deleteModule(
                      this._selectedModule.rowIndex,
                      this._selectedModule.columnIndex,
                      this._selectedModule.moduleIndex
                    );
                    this._closeModuleSettings();
                  }
                }}
                title="${localize('editor.layout.delete_module', lang, 'Delete Module')}"
              >
                <ha-icon icon="mdi:delete"></ha-icon>
              </button>
              <button class="close-button" @click=${() => this._closeModuleSettings()}>×</button>
            </div>
          </div>

          <div class="popup-body">
            ${this._renderModulePreview()}

            <div class="module-tabs">
              ${module.type === 'external_card'
                ? ucExternalCardsService.hasCardEditor((module as any).card_type)
                  ? html`
                      <button
                        class="module-tab ${this._activeModuleTab === 'general' ? 'active' : ''}"
                        @click=${() => (this._activeModuleTab = 'general')}
                      >
                        ${localize('editor.layout.general_tab', lang, 'General')}
                      </button>
                    `
                  : ''
                : html`
                    <button
                      class="module-tab ${this._activeModuleTab === 'general' ? 'active' : ''}"
                      @click=${() => (this._activeModuleTab = 'general')}
                    >
                      ${localize('editor.layout.general_tab', lang, 'General')}
                    </button>
                  `}
              ${module.type === 'external_card'
                ? html`
                    <button
                      class="module-tab ${this._activeModuleTab === 'yaml' ? 'active' : ''}"
                      @click=${() => {
                        this._activeModuleTab = 'yaml';
                        this.requestUpdate();
                      }}
                    >
                      YAML
                    </button>
                  `
                : hasActionsTab
                  ? html`
                      <button
                        class="module-tab ${this._activeModuleTab === 'actions' ? 'active' : ''}"
                        @click=${() => (this._activeModuleTab = 'actions')}
                      >
                        ${localize('editor.layout.actions_tab', lang, 'Actions')}
                      </button>
                    `
                  : ''}
              ${hasOtherTab
                ? html`
                    <button
                      class="module-tab ${this._activeModuleTab === 'other' ? 'active' : ''}"
                      @click=${() => (this._activeModuleTab = 'other')}
                    >
                      ${localize('editor.layout.other_tab', lang, 'Other')}
                    </button>
                  `
                : ''}
              <button
                class="module-tab ${this._activeModuleTab === 'logic' ? 'active' : ''}"
                @click=${() => (this._activeModuleTab = 'logic')}
              >
                ${localize('editor.layout.logic_tab', lang, 'Logic')}
              </button>
              <button
                class="module-tab ${this._activeModuleTab === 'design' ? 'active' : ''}"
                @click=${() => (this._activeModuleTab = 'design')}
              >
                ${localize('editor.layout.design_tab', lang, 'Design')}
              </button>
            </div>

            <div class="module-tab-content">
              ${(() => {
                return '';
              })()}
              ${this._activeModuleTab === 'general'
                ? module.type === 'external_card' &&
                  !ucExternalCardsService.hasCardEditor((module as any).card_type)
                  ? ''
                  : this._renderGeneralTab(module)
                : ''}
              ${this._activeModuleTab === 'yaml' && module.type === 'external_card'
                ? (() => {
                    return this._renderYamlTab(module);
                  })()
                : (() => {
                    if (this._activeModuleTab === 'yaml') {
                    }
                    return '';
                  })()}
              ${this._activeModuleTab === 'actions' && hasActionsTab
                ? this._renderActionsTab(module)
                : ''}
              ${this._activeModuleTab === 'other' && hasOtherTab
                ? this._renderOtherTab(module)
                : ''}
              ${this._activeModuleTab === 'logic' ? this._renderModuleLogicTab(module) : ''}
              ${this._activeModuleTab === 'design' ? this._renderDesignTab(module) : ''}
            </div>
          </div>

          <!-- Resize handle -->
          <div
            class="resize-handle"
            @mousedown=${(e: MouseEvent) => {
              const popup = (e.target as HTMLElement).closest('.popup-content') as HTMLElement;
              if (popup) this._startPopupResize(e, popup);
            }}
            title="${localize('editor.layout.drag_to_resize', lang, 'Drag to resize')}"
          >
            <ha-icon icon="mdi:resize-bottom-right"></ha-icon>
          </div>
        </div>
      </div>
    `;
  }
  private _renderLayoutChildSettings(): TemplateResult {
    if (!this._selectedLayoutChild) return html``;

    const { parentRowIndex, parentColumnIndex, parentModuleIndex, childIndex } =
      this._selectedLayoutChild;

    // Get the child module from the layout
    const layout = this._ensureLayout();
    const parentRow = layout.rows[parentRowIndex];
    if (!parentRow || !parentRow.columns[parentColumnIndex]) return html``;

    const parentColumn = parentRow.columns[parentColumnIndex];
    if (!parentColumn.modules || !parentColumn.modules[parentModuleIndex]) return html``;

    const layoutModule = parentColumn.modules[parentModuleIndex] as any;

    let childModule: any;

    // Check if we're accessing a nested child module (module inside a nested layout)
    if (this._selectedNestedChildIndex >= 0) {
      // We're accessing a nested child module
      if (!layoutModule.modules || !layoutModule.modules[childIndex]) return html``;

      const nestedLayoutModule = layoutModule.modules[childIndex] as any;
      if (
        !nestedLayoutModule.modules ||
        !nestedLayoutModule.modules[this._selectedNestedChildIndex]
      )
        return html``;

      childModule = nestedLayoutModule.modules[this._selectedNestedChildIndex];
    } else {
      // Regular layout child module access
      if (!layoutModule.modules || !layoutModule.modules[childIndex]) return html``;

      childModule = layoutModule.modules[childIndex];
    }

    // Determine which extra tabs are supported by this module
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(childModule.type);
    // External cards don't have Actions tab (they handle their own actions)
    const hasActionsTab =
      childModule.type !== 'external_card' &&
      moduleHandler &&
      typeof (moduleHandler as any).renderActionsTab === 'function';
    // Globally disable the legacy "Other" tab across modules (child module editor)
    const hasOtherTab = false;

    // Ensure active tab is valid for this module
    if (
      (this._activeModuleTab === 'actions' && !hasActionsTab) ||
      (this._activeModuleTab === 'other' && !hasOtherTab) ||
      (this._activeModuleTab === 'yaml' && childModule.type !== 'external_card')
    ) {
      this._activeModuleTab = 'general';
    }

    // For external cards, check if card has editor and default tab accordingly
    if (childModule.type === 'external_card') {
      const hasEditor = ucExternalCardsService.hasCardEditor((childModule as any).card_type);

      // If no editor, default to YAML (only if on an invalid tab)
      if (!hasEditor && this._activeModuleTab === 'general') {
        this._activeModuleTab = 'yaml';
      }

      // Ensure we don't show actions tab for external cards
      if (this._activeModuleTab === 'actions') {
        this._activeModuleTab = hasEditor ? 'general' : 'yaml';
      }
    }

    const lang = this.hass?.locale?.language || 'en';
    return html`
      <div class="module-settings-popup">
        <div class="popup-overlay" @click=${() => this._closeLayoutChildSettings()}></div>
        <div
          class="popup-content draggable-popup"
          id="child-popup-${this._selectedLayoutChild?.parentRowIndex}-${this._selectedLayoutChild
            ?.parentColumnIndex}-${this._selectedLayoutChild?.parentModuleIndex}-${this
            ._selectedLayoutChild?.childIndex}"
        >
          <div
            class="popup-header"
            @mousedown=${(e: MouseEvent) => {
              const popup = (e.target as HTMLElement).closest('.popup-content') as HTMLElement;
              if (popup) this._startPopupDrag(e, popup);
            }}
          >
            <h3>
              ${localize(
                'editor.layout.child_module_settings_title',
                lang,
                'Child Module Settings'
              )}
              -
              ${this._getModuleSettingsTitle(childModule, lang).replace(
                /^(Module Settings - |Child Module Settings - )/,
                ''
              )}
            </h3>
            <div class="header-actions">
              <button
                class="action-button duplicate-button"
                @click=${() => {
                  if (this._selectedLayoutChild) {
                    this._duplicateLayoutChildModule(
                      this._selectedLayoutChild.parentRowIndex,
                      this._selectedLayoutChild.parentColumnIndex,
                      this._selectedLayoutChild.parentModuleIndex,
                      this._selectedLayoutChild.childIndex
                    );
                    this._closeLayoutChildSettings();
                  }
                }}
                title="Duplicate Child Module"
              >
                <ha-icon icon="mdi:content-copy"></ha-icon>
              </button>
              <button
                class="action-button delete-button"
                @click=${() => {
                  if (this._selectedLayoutChild) {
                    this._deleteLayoutChildModule(
                      this._selectedLayoutChild.parentRowIndex,
                      this._selectedLayoutChild.parentColumnIndex,
                      this._selectedLayoutChild.parentModuleIndex,
                      this._selectedLayoutChild.childIndex
                    );
                    this._closeLayoutChildSettings();
                  }
                }}
                title="Delete Child Module"
              >
                <ha-icon icon="mdi:delete"></ha-icon>
              </button>
              <button class="close-button" @click=${() => this._closeLayoutChildSettings()}>
                ×
              </button>
            </div>
          </div>

          <!-- Child module preview -->
          <div class="module-preview">
            <div
              class="preview-header"
              @click=${this._togglePreviewCollapsed}
              title="${localize('editor.layout.toggle_preview', lang, 'Toggle preview')}"
            >
              <span>${localize('editor.layout.live_preview', lang, 'Live Preview')}</span>
              <ha-icon
                class="preview-caret"
                icon="${this._isCurrentModulePreviewCollapsed()
                  ? 'mdi:chevron-down'
                  : 'mdi:chevron-up'}"
              ></ha-icon>
            </div>
            <div
              class="preview-content"
              style="display: ${this._isCurrentModulePreviewCollapsed() ? 'none' : 'block'};"
            >
              ${this._renderSingleModuleWithAnimation(childModule)}
            </div>
          </div>

          <div class="module-tabs">
            <button
              class="module-tab ${this._activeModuleTab === 'general' ? 'active' : ''}"
              @click=${() => (this._activeModuleTab = 'general')}
            >
              ${localize('editor.layout.general_tab', lang, 'General')}
            </button>
            ${childModule.type === 'external_card'
              ? html`
                  <button
                    class="module-tab ${this._activeModuleTab === 'yaml' ? 'active' : ''}"
                    @click=${() => {
                      this._activeModuleTab = 'yaml';
                      this.requestUpdate();
                    }}
                  >
                    YAML
                  </button>
                `
              : hasActionsTab
                ? html`
                    <button
                      class="module-tab ${this._activeModuleTab === 'actions' ? 'active' : ''}"
                      @click=${() => (this._activeModuleTab = 'actions')}
                    >
                      ${localize('editor.layout.actions_tab', lang, 'Actions')}
                    </button>
                  `
                : ''}
            ${hasOtherTab
              ? html`
                  <button
                    class="module-tab ${this._activeModuleTab === 'other' ? 'active' : ''}"
                    @click=${() => (this._activeModuleTab = 'other')}
                  >
                    Other
                  </button>
                `
              : ''}
            <button
              class="module-tab ${this._activeModuleTab === 'logic' ? 'active' : ''}"
              @click=${() => (this._activeModuleTab = 'logic')}
            >
              ${localize('editor.layout.logic_tab', lang, 'Logic')}
            </button>
            <button
              class="module-tab ${this._activeModuleTab === 'design' ? 'active' : ''}"
              @click=${() => (this._activeModuleTab = 'design')}
            >
              ${localize('editor.layout.design_tab', lang, 'Design')}
            </button>
          </div>

          <div class="popup-body">
            <div class="module-tab-content">
              ${this._activeModuleTab === 'general'
                ? this._renderLayoutChildGeneralTab(childModule)
                : ''}
              ${this._activeModuleTab === 'yaml' && childModule.type === 'external_card'
                ? (() => {
                    return this._renderLayoutChildYamlTab(childModule);
                  })()
                : ''}
              ${this._activeModuleTab === 'actions' && hasActionsTab
                ? this._renderLayoutChildActionsTab(childModule)
                : ''}
              ${this._activeModuleTab === 'other' && hasOtherTab
                ? this._renderLayoutChildOtherTab(childModule)
                : ''}
              ${this._activeModuleTab === 'logic'
                ? this._renderLayoutChildLogicTab(childModule)
                : ''}
              ${this._activeModuleTab === 'design'
                ? this._renderLayoutChildDesignTab(childModule)
                : ''}
            </div>
          </div>

          <!-- Resize handle -->
          <div
            class="resize-handle"
            @mousedown=${(e: MouseEvent) => {
              const popup = (e.target as HTMLElement).closest('.popup-content') as HTMLElement;
              if (popup) this._startPopupResize(e, popup);
            }}
            title="Drag to resize"
          >
            <ha-icon icon="mdi:resize-bottom-right"></ha-icon>
          </div>
        </div>
      </div>
    `;
  }

  // Layout child module tab render methods
  private _renderLayoutChildGeneralTab(module: CardModule): TemplateResult {
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);

    // Render Module Name field first for all modules
    const lang = this.hass?.locale?.language || 'en';
    const moduleNameField = html`
      <div class="settings-section">
        <label>${localize('editor.layout_extra.module_name', lang, 'Module Name:')}</label>
        <input
          type="text"
          .value=${(module as any).module_name || ''}
          @input=${(e: Event) =>
            this._updateLayoutChildModule({
              module_name: (e.target as HTMLInputElement).value,
            } as any)}
          placeholder="${localize(
            'editor.layout_extra.module_name_placeholder',
            lang,
            'Give this module a custom name to make it easier to identify in the editor.'
          )}"
          class="module-name-input"
        />
        <div class="field-help">
          ${localize(
            'editor.layout_extra.module_name_help',
            lang,
            'Give this module a custom name to make it easier to identify in the editor.'
          )}
        </div>
      </div>
    `;

    if (moduleHandler) {
      const moduleContent = moduleHandler.renderGeneralTab(
        module,
        this.hass,
        this.config,
        updates => this._updateLayoutChildModule(updates)
      );

      return html` ${moduleNameField} ${moduleContent} `;
    }

    // Fallback for unknown module types
    return html`
      ${moduleNameField}
      <div class="settings-section">
        <div class="error-message">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <span>No settings available for module type: ${module.type}</span>
        </div>
      </div>
    `;
  }

  private _renderLayoutChildActionsTab(module: CardModule): TemplateResult {
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);

    if (moduleHandler && typeof (moduleHandler as any).renderActionsTab === 'function') {
      return (moduleHandler as any).renderActionsTab(
        module,
        this.hass,
        this.config,
        updates => this._updateLayoutChildModule(updates),
        updates => this._updateConfig(updates)
      );
    }

    // Fallback for modules without actions tab
    return html`
      <div class="settings-section">
        <div class="info-message">
          <ha-icon icon="mdi:information"></ha-icon>
          <span>This module does not have action settings</span>
        </div>
      </div>
    `;
  }

  private _renderLayoutChildYamlTab(module: CardModule): TemplateResult {
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);

    if (moduleHandler && typeof (moduleHandler as any).renderYamlTab === 'function') {
      return (moduleHandler as any).renderYamlTab(module, this.hass, this.config, updates =>
        this._updateLayoutChildModule(updates)
      );
    }

    // Fallback for modules without YAML tab
    return html`
      <div class="settings-section">
        <div class="info-message">
          <ha-icon icon="mdi:information"></ha-icon>
          <span>YAML configuration not available for this module</span>
        </div>
      </div>
    `;
  }

  private _renderLayoutChildOtherTab(module: CardModule): TemplateResult {
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);

    if (moduleHandler && typeof (moduleHandler as any).renderOtherTab === 'function') {
      return (moduleHandler as any).renderOtherTab(module, this.hass, this.config, updates =>
        this._updateLayoutChildModule(updates)
      );
    }

    // Fallback for modules without other tab
    return html`
      <div class="settings-section">
        <div class="info-message">
          <ha-icon icon="mdi:information"></ha-icon>
          <span>This module does not have other settings</span>
        </div>
      </div>
    `;
  }

  private _renderModuleLogicTab(module: CardModule): TemplateResult {
    // For standalone modules, use _updateModule callback
    return GlobalLogicTab.render(module, this.hass, (updates: Partial<CardModule>) =>
      this._updateModule(updates)
    );
  }

  private _renderLayoutChildLogicTab(module: CardModule): TemplateResult {
    // For child modules, use _updateLayoutChildModule callback
    return GlobalLogicTab.render(module, this.hass, (updates: Partial<CardModule>) =>
      this._updateLayoutChildModule(updates)
    );
  }

  private _renderLayoutChildDesignTab(module: CardModule): TemplateResult {
    // Use the main _updateModuleDesign method which has all the complex logic
    // for handling margin/padding/border objects and property conversions
    const updateChildModuleDesign = (updates: Partial<DesignProperties>) => {
      this._updateModuleDesign(updates);
    };

    // Create a custom design properties object for the child module
    // IMPORTANT: Check design object FIRST, then top-level properties for consistent priority
    const designProperties = {
      color: (module as any).design?.color || (module as any).color,
      text_align: (module as any).design?.text_align || (module as any).text_align,
      font_size: (module as any).design?.font_size || (module as any).font_size,
      line_height: (module as any).design?.line_height || (module as any).line_height,
      letter_spacing: (module as any).design?.letter_spacing || (module as any).letter_spacing,
      font_family: (module as any).design?.font_family || (module as any).font_family,
      font_weight: (module as any).design?.font_weight || (module as any).font_weight,
      text_transform: (module as any).design?.text_transform || (module as any).text_transform,
      font_style: (module as any).design?.font_style || (module as any).font_style,
      background_color:
        (module as any).design?.background_color || (module as any).background_color,
      background_image:
        (module as any).design?.background_image || (module as any).background_image,
      background_image_type:
        (module as any).design?.background_image_type || (module as any).background_image_type,
      background_image_entity:
        (module as any).design?.background_image_entity || (module as any).background_image_entity,
      background_repeat:
        (module as any).design?.background_repeat || (module as any).background_repeat,
      background_position:
        (module as any).design?.background_position || (module as any).background_position,
      background_size: (module as any).design?.background_size || (module as any).background_size,
      backdrop_filter: (module as any).design?.backdrop_filter || (module as any).backdrop_filter,
      background_filter:
        (module as any).design?.background_filter || (module as any).background_filter,
      width: (module as any).design?.width || (module as any).width,
      height: (module as any).design?.height || (module as any).height,
      max_width: (module as any).design?.max_width || (module as any).max_width,
      max_height: (module as any).design?.max_height || (module as any).max_height,
      min_width: (module as any).design?.min_width || (module as any).min_width,
      min_height: (module as any).design?.min_height || (module as any).min_height,
      // Margin: check design object, then margin object, then top-level properties
      margin_top:
        (module as any).design?.margin_top ||
        (module as any).margin?.top ||
        (module as any).margin_top,
      margin_bottom:
        (module as any).design?.margin_bottom ||
        (module as any).margin?.bottom ||
        (module as any).margin_bottom,
      margin_left:
        (module as any).design?.margin_left ||
        (module as any).margin?.left ||
        (module as any).margin_left,
      margin_right:
        (module as any).design?.margin_right ||
        (module as any).margin?.right ||
        (module as any).margin_right,
      // Padding: check design object, then padding object, then top-level properties
      padding_top:
        (module as any).design?.padding_top ||
        (module as any).padding?.top ||
        (module as any).padding_top,
      padding_bottom:
        (module as any).design?.padding_bottom ||
        (module as any).padding?.bottom ||
        (module as any).padding_bottom,
      padding_left:
        (module as any).design?.padding_left ||
        (module as any).padding?.left ||
        (module as any).padding_left,
      padding_right:
        (module as any).design?.padding_right ||
        (module as any).padding?.right ||
        (module as any).padding_right,
      // Border: check design object, then border object, then top-level properties
      border_radius:
        (module as any).design?.border_radius ||
        (module as any).border?.radius ||
        (module as any).border_radius,
      border_style:
        (module as any).design?.border_style ||
        (module as any).border?.style ||
        (module as any).border_style,
      border_width:
        (module as any).design?.border_width ||
        (module as any).border?.width ||
        (module as any).border_width,
      border_color:
        (module as any).design?.border_color ||
        (module as any).border?.color ||
        (module as any).border_color,
      position: (module as any).design?.position || (module as any).position,
      top: (module as any).design?.top || (module as any).top,
      bottom: (module as any).design?.bottom || (module as any).bottom,
      left: (module as any).design?.left || (module as any).left,
      right: (module as any).design?.right || (module as any).right,
      z_index: (module as any).design?.z_index || (module as any).z_index,
      overflow: (module as any).design?.overflow || (module as any).overflow,
      clip_path: (module as any).design?.clip_path || (module as any).clip_path,
      box_shadow_h: (module as any).design?.box_shadow_h || (module as any).box_shadow_h,
      box_shadow_v: (module as any).design?.box_shadow_v || (module as any).box_shadow_v,
      box_shadow_blur: (module as any).design?.box_shadow_blur || (module as any).box_shadow_blur,
      box_shadow_spread:
        (module as any).design?.box_shadow_spread || (module as any).box_shadow_spread,
      box_shadow_color:
        (module as any).design?.box_shadow_color || (module as any).box_shadow_color,
      text_shadow_h: (module as any).design?.text_shadow_h || (module as any).text_shadow_h,
      text_shadow_v: (module as any).design?.text_shadow_v || (module as any).text_shadow_v,
      text_shadow_blur:
        (module as any).design?.text_shadow_blur || (module as any).text_shadow_blur,
      text_shadow_color:
        (module as any).design?.text_shadow_color || (module as any).text_shadow_color,
      // Animation properties - check design object first for consistency
      animation_type: (module as any).design?.animation_type || (module as any).animation_type,
      animation_entity:
        (module as any).design?.animation_entity || (module as any).animation_entity,
      animation_trigger_type:
        (module as any).design?.animation_trigger_type || (module as any).animation_trigger_type,
      animation_attribute:
        (module as any).design?.animation_attribute || (module as any).animation_attribute,
      animation_state: (module as any).design?.animation_state || (module as any).animation_state,
      intro_animation: (module as any).design?.intro_animation || (module as any).intro_animation,
      outro_animation: (module as any).design?.outro_animation || (module as any).outro_animation,
      animation_duration:
        (module as any).design?.animation_duration || (module as any).animation_duration,
      animation_delay: (module as any).design?.animation_delay || (module as any).animation_delay,
      animation_timing:
        (module as any).design?.animation_timing || (module as any).animation_timing,
    };

    const result = html`
      <ultra-global-design-tab
        .hass=${this.hass}
        .designProperties=${designProperties}
        .onUpdate=${updateChildModuleDesign}
      ></ultra-global-design-tab>
    `;

    return result;
  }
  private _renderRowSettings(): TemplateResult {
    if (this._selectedRowForSettings === -1) return html``;

    const row = this.config.layout?.rows[this._selectedRowForSettings];
    if (!row) return html``;

    return html`
      <div class="settings-popup">
        <div class="popup-overlay" @click=${() => (this._showRowSettings = false)}></div>
        <div class="popup-content draggable-popup" id="row-popup-${this._selectedRowForSettings}">
          <div
            class="popup-header"
            @mousedown=${(e: MouseEvent) => {
              const popup = (e.target as HTMLElement).closest('.popup-content') as HTMLElement;
              if (popup) this._startPopupDrag(e, popup);
            }}
          >
            <h3>
              ${localize(
                'editor.layout.row_settings',
                this.hass?.locale?.language || 'en',
                'Row Settings'
              )}
            </h3>
            <div class="header-actions">
              <button
                class="action-button duplicate-button"
                @click=${() => {
                  this._duplicateRow(this._selectedRowForSettings);
                  this._showRowSettings = false;
                }}
                title="Duplicate Row"
              >
                <ha-icon icon="mdi:content-copy"></ha-icon>
              </button>
              <button
                class="action-button delete-button"
                @click=${() => {
                  this._deleteRow(this._selectedRowForSettings);
                  this._showRowSettings = false;
                }}
                title="Delete Row"
              >
                <ha-icon icon="mdi:delete"></ha-icon>
              </button>
              <button class="close-button" @click=${() => (this._showRowSettings = false)}>
                ×
              </button>
            </div>
          </div>

          <div class="popup-body">
            ${this._renderRowPreview(row)}

            <div class="settings-tabs">
              <button
                class="settings-tab ${this._activeRowTab === 'general' ? 'active' : ''}"
                @click=${() => (this._activeRowTab = 'general')}
              >
                ${localize(
                  'editor.layout.general_tab',
                  this.hass?.locale?.language || 'en',
                  'General'
                )}
              </button>
              <button
                class="settings-tab ${this._activeRowTab === 'actions' ? 'active' : ''}"
                @click=${() => (this._activeRowTab = 'actions')}
              >
                ${localize(
                  'editor.layout.actions_tab',
                  this.hass?.locale?.language || 'en',
                  'Actions'
                )}
              </button>
              <button
                class="settings-tab ${this._activeRowTab === 'logic' ? 'active' : ''}"
                @click=${() => (this._activeRowTab = 'logic')}
              >
                ${localize('editor.layout.logic_tab', this.hass?.locale?.language || 'en', 'Logic')}
              </button>
              <button
                class="settings-tab ${this._activeRowTab === 'design' ? 'active' : ''}"
                @click=${() => (this._activeRowTab = 'design')}
              >
                ${localize(
                  'editor.layout.design_tab',
                  this.hass?.locale?.language || 'en',
                  'Design'
                )}
              </button>
            </div>
            <div class="settings-tab-content">
              ${this._activeRowTab === 'general' ? this._renderRowGeneralTab(row) : ''}
              ${this._activeRowTab === 'actions' ? this._renderRowActionsTab(row) : ''}
              ${this._activeRowTab === 'logic' ? this._renderRowLogicTab(row) : ''}
              ${this._activeRowTab === 'design' ? this._renderRowDesignTab(row) : ''}
            </div>
          </div>

          <!-- Resize handle -->
          <div
            class="resize-handle"
            @mousedown=${(e: MouseEvent) => {
              const popup = (e.target as HTMLElement).closest('.popup-content') as HTMLElement;
              if (popup) this._startPopupResize(e, popup);
            }}
            title="Drag to resize"
          >
            <ha-icon icon="mdi:resize-bottom-right"></ha-icon>
          </div>
        </div>
      </div>
    `;
  }

  private _renderColumnSettings(): TemplateResult {
    if (!this._selectedColumnForSettings) return html``;

    const { rowIndex, columnIndex } = this._selectedColumnForSettings;
    const column = this.config.layout?.rows[rowIndex]?.columns[columnIndex];
    if (!column) return html``;

    return html`
      <div class="settings-popup">
        <div class="popup-overlay" @click=${() => (this._showColumnSettings = false)}></div>
        <div
          class="popup-content draggable-popup"
          id="column-popup-${this._selectedColumnForSettings?.rowIndex}-${this
            ._selectedColumnForSettings?.columnIndex}"
        >
          <div
            class="popup-header"
            @mousedown=${(e: MouseEvent) => {
              const popup = (e.target as HTMLElement).closest('.popup-content') as HTMLElement;
              if (popup) this._startPopupDrag(e, popup);
            }}
          >
            <h3>
              ${localize(
                'editor.layout.column_settings',
                this.hass?.locale?.language || 'en',
                'Column Settings'
              )}
            </h3>
            <div class="header-actions">
              <button
                class="action-button duplicate-button"
                @click=${() => {
                  if (this._selectedColumnForSettings) {
                    this._duplicateColumn(
                      this._selectedColumnForSettings.rowIndex,
                      this._selectedColumnForSettings.columnIndex
                    );
                    this._showColumnSettings = false;
                  }
                }}
                title="Duplicate Column"
              >
                <ha-icon icon="mdi:content-copy"></ha-icon>
              </button>
              <button
                class="action-button delete-button"
                @click=${() => {
                  if (this._selectedColumnForSettings) {
                    this._deleteColumn(
                      this._selectedColumnForSettings.rowIndex,
                      this._selectedColumnForSettings.columnIndex
                    );
                    this._showColumnSettings = false;
                  }
                }}
                title="Delete Column"
              >
                <ha-icon icon="mdi:delete"></ha-icon>
              </button>
              <button class="close-button" @click=${() => (this._showColumnSettings = false)}>
                ×
              </button>
            </div>
          </div>

          <div class="popup-body">
            ${this._renderColumnPreview(column)}

            <div class="settings-tabs">
              <button
                class="settings-tab ${this._activeColumnTab === 'general' ? 'active' : ''}"
                @click=${() => (this._activeColumnTab = 'general')}
              >
                ${localize(
                  'editor.layout.general_tab',
                  this.hass?.locale?.language || 'en',
                  'General'
                )}
              </button>
              <button
                class="settings-tab ${this._activeColumnTab === 'actions' ? 'active' : ''}"
                @click=${() => (this._activeColumnTab = 'actions')}
              >
                ${localize(
                  'editor.layout.actions_tab',
                  this.hass?.locale?.language || 'en',
                  'Actions'
                )}
              </button>
              <button
                class="settings-tab ${this._activeColumnTab === 'logic' ? 'active' : ''}"
                @click=${() => (this._activeColumnTab = 'logic')}
              >
                ${localize('editor.layout.logic_tab', this.hass?.locale?.language || 'en', 'Logic')}
              </button>
              <button
                class="settings-tab ${this._activeColumnTab === 'design' ? 'active' : ''}"
                @click=${() => (this._activeColumnTab = 'design')}
              >
                ${localize(
                  'editor.layout.design_tab',
                  this.hass?.locale?.language || 'en',
                  'Design'
                )}
              </button>
            </div>
            <div class="settings-tab-content">
              ${this._activeColumnTab === 'general' ? this._renderColumnGeneralTab(column) : ''}
              ${this._activeColumnTab === 'actions' ? this._renderColumnActionsTab(column) : ''}
              ${this._activeColumnTab === 'logic' ? this._renderColumnLogicTab(column) : ''}
              ${this._activeColumnTab === 'design' ? this._renderColumnDesignTab(column) : ''}
            </div>
          </div>

          <!-- Resize handle -->
          <div
            class="resize-handle"
            @mousedown=${(e: MouseEvent) => {
              const popup = (e.target as HTMLElement).closest('.popup-content') as HTMLElement;
              if (popup) this._startPopupResize(e, popup);
            }}
            title="Drag to resize"
          >
            <ha-icon icon="mdi:resize-bottom-right"></ha-icon>
          </div>
        </div>
      </div>
    `;
  }
  private _renderRowGeneralTab(row: CardRow): TemplateResult {
    return html`
      <div class="settings-section">
        <label
          >${localize(
            'editor.layout.row_name',
            this.hass?.locale?.language || 'en',
            'Row Name'
          )}:</label
        >
        <input
          type="text"
          .value=${(row as any).row_name || ''}
          placeholder="Give this row a custom name to make it easier to identify in the editor"
          @input=${(e: Event) => {
            const value = (e.target as HTMLInputElement).value;
            this._updateRow({ row_name: value } as any);
          }}
        />
        <div class="hint-text">
          Give this row a custom name to make it easier to identify in the editor.
        </div>
      </div>
      <div class="settings-section">
        <ultra-color-picker
          .label=${localize(
            'editor.layout.row_background_color',
            this.hass?.locale?.language || 'en',
            'Row Background Color'
          )}
          .value=${row.background_color || ''}
          .defaultValue=${'var(--ha-card-background, var(--card-background-color, #fff))'}
          .hass=${this.hass}
          @value-changed=${(e: CustomEvent) => {
            const value = e.detail.value;
            this._updateRow({ background_color: value });
          }}
        ></ultra-color-picker>
      </div>
      <div class="settings-section">
        <label
          >${localize(
            'editor.layout.column_gap',
            this.hass?.locale?.language || 'en',
            'Column Gap (px)'
          )}:</label
        >
        <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
          <input
            type="range"
            class="gap-slider"
            min="0"
            max="50"
            step="1"
            .value="${row.gap ?? 16}"
            @input=${(e: Event) => {
              const target = e.target as HTMLInputElement;
              const value = Number(target.value);
              this._updateRow({ gap: value });
            }}
          />
          <input
            type="number"
            class="gap-input"
            min="0"
            max="50"
            step="1"
            .value="${row.gap ?? 16}"
            @input=${(e: Event) => {
              const target = e.target as HTMLInputElement;
              const value = Number(target.value);
              if (!isNaN(value)) {
                this._updateRow({ gap: value });
              }
            }}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                (e.target as HTMLInputElement).blur();
              }
            }}
          />
        </div>
      </div>
    `;
  }

  private _renderRowActionsTab(row: CardRow): TemplateResult {
    const actions = row as any as { tap_action?: any; hold_action?: any; double_tap_action?: any };
    const updateRow = (updates: Partial<CardRow>) => this._updateRow(updates);
    const handler = new (class extends (BaseUltraModule as any) {})();
    // Use GlobalActionsTab through BaseUltraModule default
    return (handler as any).renderActionsTab(
      actions,
      this.hass,
      this.config,
      (updates: any) => {
        this._updateRow(updates);
      },
      (updates: any) => this._updateConfig(updates)
    );
  }

  private _renderRowLogicTab(row: CardRow): TemplateResult {
    return GlobalLogicTab.render(row as any, this.hass, (updates: Partial<CardRow>) => {
      this._updateRow(updates);
    });
  }

  private _renderRowDesignTab(row: CardRow): TemplateResult {
    // Extract current design properties from row
    const isBarModule = (module as any)?.type === 'bar';
    const designProperties: DesignProperties = {
      ...row.design,
      // Map legacy properties to design properties if they exist
      background_color: row.design?.background_color || row.background_color,
      padding_top: row.design?.padding_top || row.padding?.toString(),
      padding_bottom: row.design?.padding_bottom || row.padding?.toString(),
      padding_left: row.design?.padding_left || row.padding?.toString(),
      padding_right: row.design?.padding_right || row.padding?.toString(),
      border_radius: row.design?.border_radius || row.border_radius?.toString(),
      border_color: row.design?.border_color || row.border_color,
      border_width: row.design?.border_width || row.border_width?.toString(),
      margin_top: row.design?.margin_top || row.margin?.toString(),
      margin_bottom: row.design?.margin_bottom || row.margin?.toString(),
      margin_left: row.design?.margin_left || row.margin?.toString(),
      margin_right: row.design?.margin_right || row.margin?.toString(),
      // Ensure animation properties are included
      animation_type: row.design?.animation_type,
      animation_entity: row.design?.animation_entity,
      animation_trigger_type: row.design?.animation_trigger_type,
      animation_attribute: row.design?.animation_attribute,
      animation_state: row.design?.animation_state,
      animation_duration: row.design?.animation_duration,
      intro_animation: row.design?.intro_animation,
      outro_animation: row.design?.outro_animation,
      animation_delay: row.design?.animation_delay,
      animation_timing: row.design?.animation_timing,
    };

    return html`
      <ultra-global-design-tab
        .hass=${this.hass}
        .designProperties=${designProperties}
        @design-changed=${(e: CustomEvent) => {
          const updates = e.detail;
          // Update the row with design properties
          const updatedDesign = { ...row.design, ...updates };
          this._updateRow({ design: updatedDesign });
        }}
      ></ultra-global-design-tab>
    `;
  }

  private _renderColumnGeneralTab(column: CardColumn): TemplateResult {
    return html`
      <div class="settings-section">
        <label
          >${localize(
            'editor.layout.vertical_alignment',
            this.hass?.locale?.language || 'en',
            'Vertical Alignment'
          )}:</label
        >
        <select
          .value=${column.vertical_alignment || 'center'}
          @change=${(e: Event) =>
            this._updateColumn({
              vertical_alignment: (e.target as HTMLSelectElement).value as any,
            })}
        >
          <option value="top">
            ${localize('editor.layout.alignment_top', this.hass?.locale?.language || 'en', 'Top')}
          </option>
          <option value="center">
            ${localize(
              'editor.layout.alignment_center',
              this.hass?.locale?.language || 'en',
              'Center'
            )}
          </option>
          <option value="bottom">
            ${localize(
              'editor.layout.alignment_bottom',
              this.hass?.locale?.language || 'en',
              'Bottom'
            )}
          </option>
          <option value="stretch">
            ${localize(
              'editor.layout.alignment_stretch',
              this.hass?.locale?.language || 'en',
              'Stretch'
            )}
          </option>
        </select>
      </div>
      <div class="settings-section">
        <label
          >${localize(
            'editor.layout.horizontal_alignment',
            this.hass?.locale?.language || 'en',
            'Horizontal Alignment'
          )}:</label
        >
        <select
          .value=${column.horizontal_alignment || 'center'}
          @change=${(e: Event) =>
            this._updateColumn({
              horizontal_alignment: (e.target as HTMLSelectElement).value as any,
            })}
        >
          <option value="left">
            ${localize('editor.layout.alignment_left', this.hass?.locale?.language || 'en', 'Left')}
          </option>
          <option value="center">
            ${localize(
              'editor.layout.alignment_center',
              this.hass?.locale?.language || 'en',
              'Center'
            )}
          </option>
          <option value="right">
            ${localize(
              'editor.layout.alignment_right',
              this.hass?.locale?.language || 'en',
              'Right'
            )}
          </option>
          <option value="stretch">
            ${localize(
              'editor.layout.alignment_stretch',
              this.hass?.locale?.language || 'en',
              'Stretch'
            )}
          </option>
        </select>
      </div>
    `;
  }

  private _renderColumnActionsTab(column: CardColumn): TemplateResult {
    const actions = column as any as {
      tap_action?: any;
      hold_action?: any;
      double_tap_action?: any;
    };
    const handler = new (class extends (BaseUltraModule as any) {})();
    return (handler as any).renderActionsTab(
      actions,
      this.hass,
      this.config,
      (updates: any) => {
        this._updateColumn(updates);
      },
      (updates: any) => this._updateConfig(updates)
    );
  }

  private _renderColumnLogicTab(column: CardColumn): TemplateResult {
    return GlobalLogicTab.render(column as any, this.hass, (updates: Partial<CardColumn>) => {
      this._updateColumn(updates);
    });
  }

  private _renderColumnDesignTab(column: CardColumn): TemplateResult {
    // Extract current design properties from column
    const designProperties: DesignProperties = {
      ...column.design,
      // Map legacy properties to design properties if they exist
      background_color: column.design?.background_color || column.background_color,
      padding_top: column.design?.padding_top || column.padding?.toString(),
      padding_bottom: column.design?.padding_bottom || column.padding?.toString(),
      padding_left: column.design?.padding_left || column.padding?.toString(),
      padding_right: column.design?.padding_right || column.padding?.toString(),
      border_radius: column.design?.border_radius || column.border_radius?.toString(),
      border_color: column.design?.border_color || column.border_color,
      border_width: column.design?.border_width || column.border_width?.toString(),
      margin_top: column.design?.margin_top || column.margin?.toString(),
      margin_bottom: column.design?.margin_bottom || column.margin?.toString(),
      margin_left: column.design?.margin_left || column.margin?.toString(),
      margin_right: column.design?.margin_right || column.margin?.toString(),
      // Ensure animation properties are included
      animation_type: column.design?.animation_type,
      animation_entity: column.design?.animation_entity,
      animation_trigger_type: column.design?.animation_trigger_type,
      animation_attribute: column.design?.animation_attribute,
      animation_state: column.design?.animation_state,
      animation_duration: column.design?.animation_duration,
      intro_animation: column.design?.intro_animation,
      outro_animation: column.design?.outro_animation,
      animation_delay: column.design?.animation_delay,
      animation_timing: column.design?.animation_timing,
    };

    return html`
      <ultra-global-design-tab
        .hass=${this.hass}
        .designProperties=${designProperties}
        @design-changed=${(e: CustomEvent) => {
          const updates = e.detail;
          // Update the column with design properties
          const updatedDesign = { ...column.design, ...updates };
          this._updateColumn({ design: updatedDesign });
        }}
      ></ultra-global-design-tab>
    `;
  }

  private _renderGeneralTab(module: CardModule): TemplateResult {
    const lang = this.hass?.locale?.language || 'en';
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);

    // Render Module Name field for all modules except external_card
    const moduleNameField =
      module.type !== 'external_card'
        ? html`
            <div class="settings-section">
              <label>${localize('editor.layout_extra.module_name', lang, 'Module Name:')}</label>
              <input
                type="text"
                .value=${(module as any).module_name || ''}
                @input=${(e: Event) =>
                  this._updateModule({ module_name: (e.target as HTMLInputElement).value } as any)}
                placeholder="${localize(
                  'editor.layout_extra.module_name_placeholder',
                  lang,
                  'Give this module a custom name to make it easier to identify in the editor.'
                )}"
                class="module-name-input"
              />
              <div class="field-help">
                ${localize(
                  'editor.layout_extra.module_name_help',
                  lang,
                  'Give this module a custom name to make it easier to identify in the editor.'
                )}
              </div>
            </div>
          `
        : '';

    if (moduleHandler) {
      const moduleContent = moduleHandler.renderGeneralTab(
        module,
        this.hass,
        this.config,
        updates => this._updateModule(updates)
      );

      // For external cards, don't show Module Name field
      if (module.type === 'external_card') {
        return moduleContent;
      }

      // For image modules, just render normally - the Image Name field will be removed later
      if (module.type === 'image') {
        return html` ${moduleNameField} ${moduleContent} `;
      }

      // Combine Module Name field with existing module content for other modules
      return html` ${moduleNameField} ${moduleContent} `;
    }

    // Fallback for unknown module types
    return html`
      ${moduleNameField}
      <div class="settings-section">
        <div class="error-message">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <span>No settings available for module type: ${module.type}</span>
        </div>
      </div>
    `;
  }

  private _renderActionsTab(module: CardModule): TemplateResult {
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);

    if (moduleHandler && typeof (moduleHandler as any).renderActionsTab === 'function') {
      return (moduleHandler as any).renderActionsTab(
        module,
        this.hass,
        this.config,
        updates => this._updateModule(updates),
        updates => this._updateConfig(updates)
      );
    }

    // Fallback for modules without actions tab
    return html`
      <div class="settings-section">
        <div class="info-message">
          <ha-icon icon="mdi:information"></ha-icon>
          <span>This module does not have action settings</span>
        </div>
      </div>
    `;
  }

  private _renderOtherTab(module: CardModule): TemplateResult {
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);

    if (moduleHandler && typeof (moduleHandler as any).renderOtherTab === 'function') {
      return (moduleHandler as any).renderOtherTab(module, this.hass, this.config, updates =>
        this._updateModule(updates)
      );
    }

    // Fallback for modules without other tab
    return html`
      <div class="settings-section">
        <div class="info-message">
          <ha-icon icon="mdi:information"></ha-icon>
          <span>This module does not have other settings</span>
        </div>
      </div>
    `;
  }

  private _renderYamlTab(module: CardModule): TemplateResult {
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);

    if (moduleHandler && typeof (moduleHandler as any).renderYamlTab === 'function') {
      return (moduleHandler as any).renderYamlTab(module, this.hass, this.config, updates =>
        this._updateModule(updates)
      );
    }

    // Fallback for modules without YAML tab
    return html`
      <div class="settings-section">
        <div class="info-message">
          <ha-icon icon="mdi:information"></ha-icon>
          <span>YAML configuration not available for this module</span>
        </div>
      </div>
    `;
  }

  // Add condition to module
  private _addCondition(module: CardModule): void {
    const newCondition: DisplayCondition = {
      id: `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'entity_state',
      entity: '',
      operator: '=',
      value: '',
      enabled: true,
    };

    const updatedConditions = [...(module.display_conditions || []), newCondition];
    this._updateModule({ display_conditions: updatedConditions });
  }

  // Add condition to row
  private _addRowCondition(row: CardRow): void {
    const newCondition: DisplayCondition = {
      id: `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'entity_state',
      entity: '',
      operator: '=',
      value: '',
      enabled: true,
    };

    const updatedConditions = [...(row.display_conditions || []), newCondition];
    this._updateRow({ display_conditions: updatedConditions });
  }

  // Add condition to column
  private _addColumnCondition(column: CardColumn): void {
    const newCondition: DisplayCondition = {
      id: `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'entity_state',
      entity: '',
      operator: '=',
      value: '',
      enabled: true,
    };

    const updatedConditions = [...(column.display_conditions || []), newCondition];
    this._updateColumn({ display_conditions: updatedConditions });
  }

  // Remove condition from module
  private _removeCondition(module: CardModule, conditionIndex: number): void {
    const conditions = module.display_conditions || [];
    const updatedConditions = conditions.filter((_, index) => index !== conditionIndex);
    this._updateModule({ display_conditions: updatedConditions });
  }

  // Update specific condition
  private _updateCondition(
    module: CardModule,
    conditionIndex: number,
    updates: Partial<DisplayCondition>
  ): void {
    const conditions = module.display_conditions || [];
    const updatedConditions = conditions.map((condition, index) =>
      index === conditionIndex ? { ...condition, ...updates } : condition
    );
    this._updateModule({ display_conditions: updatedConditions });
  }

  // Duplicate condition
  private _duplicateCondition(module: CardModule, conditionIndex: number): void {
    const conditions = module.display_conditions || [];
    const conditionToDuplicate = conditions[conditionIndex];
    if (conditionToDuplicate) {
      const duplicatedCondition = {
        ...conditionToDuplicate,
        id: `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      const updatedConditions = [
        ...conditions.slice(0, conditionIndex + 1),
        duplicatedCondition,
        ...conditions.slice(conditionIndex + 1),
      ];
      this._updateModule({ display_conditions: updatedConditions });
    }
  }

  // Render row condition (reuses module condition logic)
  private _renderRowCondition(
    row: CardRow,
    condition: DisplayCondition,
    index: number
  ): TemplateResult {
    return this._renderConditionGeneric(
      condition,
      index,
      updates => {
        const conditions = row.display_conditions || [];
        const updatedConditions = conditions.map((c, i) =>
          i === index ? { ...c, ...updates } : c
        );
        this._updateRow({ display_conditions: updatedConditions });
      },
      () => {
        const conditions = row.display_conditions || [];
        const updatedConditions = conditions.filter((_, i) => i !== index);
        this._updateRow({ display_conditions: updatedConditions });
      },
      'row',
      index,
      () => row.display_conditions,
      (next: DisplayCondition[]) => this._updateRow({ display_conditions: next })
    );
  }
  // Render column condition (reuses module condition logic)
  private _renderColumnCondition(
    column: CardColumn,
    condition: DisplayCondition,
    index: number
  ): TemplateResult {
    return this._renderConditionGeneric(
      condition,
      index,
      updates => {
        const conditions = column.display_conditions || [];
        const updatedConditions = conditions.map((c, i) =>
          i === index ? { ...c, ...updates } : c
        );
        this._updateColumn({ display_conditions: updatedConditions });
      },
      () => {
        const conditions = column.display_conditions || [];
        const updatedConditions = conditions.filter((_, i) => i !== index);
        this._updateColumn({ display_conditions: updatedConditions });
      },
      'column',
      index,
      () => column.display_conditions,
      (next: DisplayCondition[]) => this._updateColumn({ display_conditions: next })
    );
  }

  // Generic condition renderer that can be reused
  private _renderConditionGeneric(
    condition: DisplayCondition,
    index: number,
    onUpdate: (updates: Partial<DisplayCondition>) => void,
    onDelete: () => void,
    scope?: 'module' | 'row' | 'column',
    targetIndex?: number,
    getConditions?: () => DisplayCondition[] | undefined,
    setConditions?: (next: DisplayCondition[]) => void
  ): TemplateResult {
    const isExpanded = !this._collapsedConditionIds.has(condition.id);

    return html`
      <div
        class="condition-item enabled"
        draggable="true"
        @dragstart=${(e: DragEvent) => scope && this._onConditionDragStart(e, scope, index)}
        @dragover=${this._onConditionDragOver}
        @drop=${(e: DragEvent) =>
          scope && getConditions && setConditions && typeof targetIndex === 'number'
            ? this._onConditionDrop(e, scope, targetIndex!, getConditions!, setConditions!)
            : null}
      >
        <div class="condition-header">
          <div class="condition-header-left">
            <button
              type="button"
              class="condition-toggle ${isExpanded ? 'expanded' : ''}"
              @click=${() => this._toggleConditionExpanded(condition.id)}
            >
              <ha-icon icon="mdi:chevron-${isExpanded ? 'down' : 'right'}"></ha-icon>
            </button>
            <span class="condition-label">
              ${condition.type === 'entity_state'
                ? condition.entity || 'Select Entity State'
                : condition.type === 'entity_attribute'
                  ? condition.entity || 'Select Entity Attribute'
                  : condition.type === 'time'
                    ? 'Time Condition'
                    : 'Template Condition'}
            </span>
          </div>

          <div class="condition-actions">
            <button
              type="button"
              class="condition-action-btn delete"
              @click=${onDelete}
              title="Delete"
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </button>
          </div>
        </div>

        ${isExpanded
          ? html`
              <div class="condition-content">
                <!-- Condition Type Selector -->
                <div class="condition-field">
                  <label>Condition Type:</label>
                  <select
                    .value=${condition.type}
                    @change=${(e: Event) => {
                      const type = (e.target as HTMLSelectElement).value as
                        | 'entity_state'
                        | 'entity_attribute'
                        | 'template'
                        | 'time';
                      onUpdate({
                        type,
                        entity: '',
                        operator: '=',
                        value: '',
                      });
                    }}
                  >
                    <option value="entity_state">Entity State</option>
                    <option value="entity_attribute">Entity Attribute</option>
                    <option value="time">Date/Time</option>
                    <option value="template">Template</option>
                  </select>
                </div>

                ${condition.type === 'entity_state'
                  ? this._renderEntityConditionGeneric(condition, onUpdate)
                  : ''}
                ${condition.type === 'entity_attribute'
                  ? this._renderEntityAttributeConditionGeneric(condition, onUpdate)
                  : ''}

                <!-- Removed enable/disable toggle; delete the condition to disable -->
              </div>
            `
          : ''}
      </div>
    `;
  }

  // Generic entity condition renderer
  private _renderEntityConditionGeneric(
    condition: DisplayCondition,
    onUpdate: (updates: Partial<DisplayCondition>) => void
  ): TemplateResult {
    return html`
      <div class="entity-condition-fields">
        <!-- Entity Picker -->
        <div class="condition-field">
          <ha-form
            .hass=${this.hass}
            .data=${{ entity: condition.entity || '' }}
            .schema=${[
              {
                name: 'entity',
                selector: { entity: {} },
                label: 'Entity',
              },
            ]}
            @value-changed=${(e: CustomEvent) => onUpdate({ entity: e.detail.value.entity })}
          ></ha-form>
        </div>

        <!-- Operator -->
        <div class="condition-field">
          <label>Operator:</label>
          <select
            .value=${condition.operator || '='}
            @change=${(e: Event) =>
              onUpdate({
                operator: (e.target as HTMLSelectElement).value as any,
              })}
          >
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">&gt;</option>
            <option value=">=">&gt;=</option>
            <option value="<">&lt;</option>
            <option value="<=">&lt;=</option>
            <option value="has_value">Has a value</option>
            <option value="no_value">Doesn't have a value</option>
          </select>
        </div>

        <!-- Value (if not has_value/no_value) -->
        ${condition.operator !== 'has_value' && condition.operator !== 'no_value'
          ? html`
              <div class="condition-field">
                <label>Value:</label>
                <input
                  type="text"
                  .value=${condition.value || ''}
                  @input=${(e: Event) =>
                    onUpdate({
                      value: (e.target as HTMLInputElement).value,
                    })}
                  placeholder="Enter value to compare"
                />
              </div>
            `
          : ''}
      </div>
    `;
  }
  // Render entity attribute condition renderer
  private _renderEntityAttributeConditionGeneric(
    condition: DisplayCondition,
    onUpdate: (updates: Partial<DisplayCondition>) => void
  ): TemplateResult {
    return html`
      <div class="entity-attribute-fields">
        <!-- Entity Picker -->
        <div class="condition-field">
          <ha-form
            .hass=${this.hass}
            .data=${{ entity: condition.entity || '' }}
            .schema=${[
              {
                name: 'entity',
                selector: { entity: {} },
                label: 'Entity',
              },
            ]}
            @value-changed=${(e: CustomEvent) => onUpdate({ entity: e.detail.value.entity })}
          ></ha-form>
        </div>

        <!-- Attribute Selector -->
        <div class="condition-field">
          <label>Attribute Name:</label>
          <input
            type="text"
            .value=${condition.attribute || ''}
            @input=${(e: Event) => onUpdate({ attribute: (e.target as HTMLInputElement).value })}
            placeholder="Enter attribute name (e.g., battery_level, friendly_name)"
          />
          <div class="field-help">
            Enter the exact attribute name from the entity. Common examples: battery_level,
            friendly_name, unit_of_measurement
          </div>
        </div>

        <!-- Operator -->
        <div class="condition-field">
          <label>Operator:</label>
          <select
            .value=${condition.operator || '='}
            @change=${(e: Event) =>
              onUpdate({
                operator: (e.target as HTMLSelectElement).value as any,
              })}
          >
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">&gt;</option>
            <option value=">=">&gt;=</option>
            <option value="<">&lt;</option>
            <option value="<=">&lt;=</option>
            <option value="has_value">Has a value</option>
            <option value="no_value">Doesn't have a value</option>
          </select>
        </div>

        <!-- Value (if not has_value/no_value) -->
        ${condition.operator !== 'has_value' && condition.operator !== 'no_value'
          ? html`
              <div class="condition-field">
                <label>Value:</label>
                <input
                  type="text"
                  .value=${condition.value || ''}
                  @input=${(e: Event) =>
                    onUpdate({
                      value: (e.target as HTMLInputElement).value,
                    })}
                  placeholder="Enter value to compare"
                />
              </div>
            `
          : ''}
      </div>
    `;
  }

  // Render individual condition
  private _renderCondition(
    module: CardModule,
    condition: DisplayCondition,
    index: number
  ): TemplateResult {
    const isExpanded = !this._collapsedConditionIds.has(condition.id);

    return html`
      <div class="condition-item enabled">
        <div class="condition-header">
          <div class="condition-header-left">
            <button
              type="button"
              class="condition-toggle ${isExpanded ? 'expanded' : ''}"
              @click=${() => this._toggleConditionExpanded(condition.id)}
            >
              <ha-icon icon="mdi:chevron-${isExpanded ? 'down' : 'right'}"></ha-icon>
            </button>
            <span class="condition-label">
              ${condition.type === 'entity_state'
                ? condition.entity || 'Select Entity State'
                : condition.type === 'entity_attribute'
                  ? condition.entity || 'Select Entity Attribute'
                  : condition.type === 'time'
                    ? 'Time Condition'
                    : 'Template Condition'}
            </span>
          </div>

          <div class="condition-actions">
            <button
              type="button"
              class="condition-action-btn"
              @click=${() => this._duplicateCondition(module, index)}
              title="Duplicate"
            >
              <ha-icon icon="mdi:content-copy"></ha-icon>
            </button>
            <button
              type="button"
              class="condition-action-btn delete"
              @click=${() => this._removeCondition(module, index)}
              title="Delete"
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </button>
            <button
              type="button"
              class="condition-drag-handle"
              title="Drag to reorder"
              draggable="true"
              @dragstart=${(e: DragEvent) => this._onConditionDragStart(e, 'module', index)}
              @dragover=${this._onConditionDragOver}
              @drop=${(e: DragEvent) =>
                this._onConditionDrop(
                  e,
                  'module',
                  index,
                  () => module.display_conditions,
                  (next: DisplayCondition[]) => this._updateModule({ display_conditions: next })
                )}
            >
              <ha-icon icon="mdi:drag"></ha-icon>
            </button>
          </div>
        </div>

        ${isExpanded
          ? html`
              <div class="condition-content">
                <!-- Condition Type Selector -->
                <div class="condition-field">
                  <label>Condition Type:</label>
                  <select
                    .value=${condition.type}
                    @change=${(e: Event) => {
                      const type = (e.target as HTMLSelectElement).value as
                        | 'entity_state'
                        | 'entity_attribute'
                        | 'template'
                        | 'time';
                      this._updateCondition(module, index, {
                        type,
                        entity: '',
                        operator: '=',
                        value: '',
                      });
                    }}
                  >
                    <option value="entity_state">Entity State</option>
                    <option value="entity_attribute">Entity Attribute</option>
                    <option value="time">Date/Time</option>
                    <option value="template">Template</option>
                  </select>
                </div>

                ${condition.type === 'entity_state'
                  ? this._renderEntityCondition(module, condition, index)
                  : ''}
                ${condition.type === 'entity_attribute'
                  ? this._renderEntityAttributeCondition(module, condition, index)
                  : ''}
                ${condition.type === 'time'
                  ? this._renderTimeCondition(module, condition, index)
                  : ''}
                ${condition.type === 'template'
                  ? this._renderTemplateCondition(module, condition, index)
                  : ''}

                <!-- Removed enable/disable toggle; delete the condition to disable -->
              </div>
            `
          : ''}
      </div>
    `;
  }

  // Render entity condition fields
  private _renderEntityCondition(
    module: CardModule,
    condition: DisplayCondition,
    index: number
  ): TemplateResult {
    return html`
      <div class="entity-condition-fields">
        <!-- Entity Picker -->
        <div class="condition-field">
          <ha-form
            .hass=${this.hass}
            .data=${{ entity: condition.entity || '' }}
            .schema=${[
              {
                name: 'entity',
                selector: { entity: {} },
                label: 'Entity',
              },
            ]}
            .computeLabel=${(schema: any) =>
              schema.label ??
              (schema.name ? schema.name.charAt(0).toUpperCase() + schema.name.slice(1) : '')}
            @value-changed=${(e: CustomEvent) =>
              this._updateCondition(module, index, { entity: e.detail.value.entity })}
          ></ha-form>
        </div>

        <!-- Operator -->
        <div class="condition-field">
          <label>Operator:</label>
          <select
            .value=${condition.operator || '='}
            @change=${(e: Event) =>
              this._updateCondition(module, index, {
                operator: (e.target as HTMLSelectElement).value as any,
              })}
          >
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">&gt;</option>
            <option value=">=">&gt;=</option>
            <option value="<">&lt;</option>
            <option value="<=">&lt;=</option>
            <option value="has_value">Has a value</option>
            <option value="no_value">Doesn't have a value</option>
          </select>
        </div>

        <!-- Value (if not has_value/no_value) -->
        ${condition.operator !== 'has_value' && condition.operator !== 'no_value'
          ? html`
              <div class="condition-field">
                <label>Value:</label>
                <input
                  type="text"
                  .value=${condition.value || ''}
                  @input=${(e: Event) =>
                    this._updateCondition(module, index, {
                      value: (e.target as HTMLInputElement).value,
                    })}
                  placeholder="Enter value to compare"
                />
              </div>
            `
          : ''}
      </div>
    `;
  }

  // Render entity attribute condition fields
  private _renderEntityAttributeCondition(
    module: CardModule,
    condition: DisplayCondition,
    index: number
  ): TemplateResult {
    return html`
      <div class="entity-attribute-fields">
        <!-- Entity Picker -->
        <div class="condition-field">
          <ha-form
            .hass=${this.hass}
            .data=${{ entity: condition.entity || '' }}
            .schema=${[
              {
                name: 'entity',
                selector: { entity: {} },
                label: 'Entity',
              },
            ]}
            .computeLabel=${(schema: any) =>
              schema.label ??
              (schema.name ? schema.name.charAt(0).toUpperCase() + schema.name.slice(1) : '')}
            @value-changed=${(e: CustomEvent) =>
              this._updateCondition(module, index, { entity: e.detail.value.entity })}
          ></ha-form>
        </div>

        <!-- Attribute Selector -->
        <div class="condition-field">
          <label>Attribute Name:</label>
          <input
            type="text"
            .value=${condition.attribute || ''}
            @input=${(e: Event) =>
              this._updateCondition(module, index, {
                attribute: (e.target as HTMLInputElement).value,
              })}
            placeholder="Enter attribute name (e.g., battery_level, friendly_name)"
          />
          <div class="field-help">
            Enter the exact attribute name from the entity. Common examples: battery_level,
            friendly_name, unit_of_measurement
          </div>
        </div>

        <!-- Operator -->
        <div class="condition-field">
          <label>Operator:</label>
          <select
            .value=${condition.operator || '='}
            @change=${(e: Event) =>
              this._updateCondition(module, index, {
                operator: (e.target as HTMLSelectElement).value as any,
              })}
          >
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">&gt;</option>
            <option value=">=">&gt;=</option>
            <option value="<">&lt;</option>
            <option value="<=">&lt;=</option>
            <option value="has_value">Has a value</option>
            <option value="no_value">Doesn't have a value</option>
          </select>
        </div>

        <!-- Value (if not has_value/no_value) -->
        ${condition.operator !== 'has_value' && condition.operator !== 'no_value'
          ? html`
              <div class="condition-field">
                <label>Value:</label>
                <input
                  type="text"
                  .value=${condition.value || ''}
                  @input=${(e: Event) =>
                    this._updateCondition(module, index, {
                      value: (e.target as HTMLInputElement).value,
                    })}
                  placeholder="Enter value to compare"
                />
              </div>
            `
          : ''}
      </div>
    `;
  }

  // Render time condition fields
  private _renderTimeCondition(
    module: CardModule,
    condition: DisplayCondition,
    index: number
  ): TemplateResult {
    return html`
      <div class="time-condition-fields">
        <p class="condition-info">Local time is ${new Date().toLocaleString()}</p>

        <div class="time-inputs">
          <div class="condition-field">
            <label>From Time:</label>
            <input
              type="time"
              .value=${condition.time_from || ''}
              @input=${(e: Event) =>
                this._updateCondition(module, index, {
                  time_from: (e.target as HTMLInputElement).value,
                })}
            />
          </div>

          <div class="condition-field">
            <label>To Time:</label>
            <input
              type="time"
              .value=${condition.time_to || ''}
              @input=${(e: Event) =>
                this._updateCondition(module, index, {
                  time_to: (e.target as HTMLInputElement).value,
                })}
            />
          </div>
        </div>
      </div>
    `;
  }

  // Render template condition
  private _renderTemplateCondition(
    module: CardModule,
    condition: DisplayCondition,
    index: number
  ): TemplateResult {
    return html`
      <div class="template-condition">
        <div class="condition-field">
          <label>Template:</label>
          <textarea
            .value=${condition.template || ''}
            @input=${(e: Event) =>
              this._updateCondition(module, index, {
                template: (e.target as HTMLTextAreaElement).value,
              })}
            placeholder="{% if states('sensor.example') == 'on' %}true{% else %}false{% endif %}"
            rows="3"
          ></textarea>
        </div>
        <div class="template-help">Template should return 'true' or 'false'</div>
      </div>
    `;
  }

  private _renderLogicTab(module: CardModule): TemplateResult {
    const conditions = module.display_conditions || [];
    const displayMode = module.display_mode || 'always';
    const templateMode = false; // Advanced Template Mode removed; use Display Conditions instead

    const lang = this.hass?.locale?.language || 'en';
    return html`
      <div class="logic-tab-content">
        <!-- Basic Conditions Section -->
        <div class="logic-section">
          <div class="section-header">
            <h3>${localize('editor.layout_logic.display_title', lang, 'Display this Element')}</h3>
          </div>

          <div class="template-description">
            ${localize(
              'editor.layout_logic.display_desc',
              lang,
              'Control when this element is shown. Choose "Always" to keep it visible. Select "If EVERY condition below is met" or "If ANY condition below is met" to display it only when the conditions you add below evaluate to true.'
            )}
          </div>

          <div class="display-mode-selector">
            <select
              .value=${displayMode}
              @change=${(e: Event) => {
                const value = (e.target as HTMLSelectElement).value as 'always' | 'every' | 'any';
                this._updateModule({ display_mode: value });
              }}
              class="display-mode-dropdown"
            >
              <option value="always">
                ${localize('editor.layout_logic.always', lang, 'Always')}
              </option>
              <option value="every">
                ${localize('editor.layout_logic.every', lang, 'If EVERY condition below is met')}
              </option>
              <option value="any">
                ${localize('editor.layout_logic.any', lang, 'If ANY condition below is met')}
              </option>
            </select>
          </div>
        </div>

        <!-- Conditions Section -->
        ${displayMode !== 'always'
          ? html`
              <div class="conditions-section">
                <div class="conditions-header">
                  <h4>${localize('editor.layout_logic.conditions', lang, 'Conditions')}</h4>
                  <button
                    type="button"
                    class="add-condition-btn"
                    @click=${() => this._addCondition(module)}
                  >
                    <ha-icon icon="mdi:plus"></ha-icon>
                    ${localize('editor.layout_logic.add_condition', lang, 'Add Condition')}
                  </button>
                </div>

                <div class="conditions-list" @dragover=${this._onConditionDragOver}>
                  ${conditions.map(
                    (condition, index) => html`
                      <div
                        class="condition-row-dropzone"
                        @drop=${(e: DragEvent) =>
                          this._onConditionDrop(
                            e,
                            'module',
                            index,
                            () => module.display_conditions,
                            (next: DisplayCondition[]) =>
                              this._updateModule({ display_conditions: next })
                          )}
                      >
                        ${this._renderCondition(module, condition, index)}
                      </div>
                    `
                  )}
                </div>

                ${conditions.length === 0
                  ? html`
                      <div class="no-conditions">
                        <p>
                          ${localize(
                            'editor.layout_logic.no_conditions',
                            lang,
                            'No conditions added yet. Click "Add Condition" to get started.'
                          )}
                        </p>
                      </div>
                    `
                  : ''}
              </div>
            `
          : ''}

        <!-- Advanced Template Mode removed; use Template condition type in Conditions -->
      </div>
    `;
  }
  private _renderDesignTab(module: CardModule): TemplateResult {
    const isBarModule = (module as any)?.type === 'bar';
    // Extract current design properties from module
    const designProperties: DesignProperties = {
      color: (module as any).design?.color || (module as any).color,
      text_align: (() => {
        // Explicit priority order for text alignment
        if ((module as any).text_align !== undefined) return (module as any).text_align;
        if ((module as any).alignment !== undefined) return (module as any).alignment;
        if ((module as any).design?.text_align !== undefined)
          return (module as any).design.text_align;
        // Do not inject defaults here; allow field to remain blank in the editor
        return undefined;
      })(),
      font_size: (() => {
        const fontSize = (module as any).design?.font_size || (module as any).font_size;
        if (fontSize !== undefined && fontSize !== null && fontSize !== '')
          return fontSize.toString();
        // No default so the input can be blank
        return undefined;
      })(),
      line_height: ((module as any).design?.line_height || (module as any).line_height)?.toString(),
      letter_spacing: (module as any).design?.letter_spacing || (module as any).letter_spacing,
      font_family: (module as any).design?.font_family || (module as any).font_family,
      font_weight: (() => {
        const fontWeight = (module as any).design?.font_weight || (module as any).font_weight;
        if (fontWeight !== undefined && fontWeight !== null && fontWeight !== '') return fontWeight;
        // No default so the input can be blank
        return undefined;
      })(),
      text_transform: (() => {
        const textTransform =
          (module as any).design?.text_transform || (module as any).text_transform;
        if (textTransform !== undefined && textTransform !== null && textTransform !== '')
          return textTransform;
        // No default so the input can be blank
        return undefined;
      })(),
      font_style: (module as any).design?.font_style || (module as any).font_style,
      // Use design-scoped background color only so default top-level values
      // don't mark Background as edited on brand-new modules
      background_color: (module as any).design?.background_color,
      background_image: (module as any).background_image,
      background_image_type: (module as any).background_image_type,
      background_image_entity: (module as any).background_image_entity,
      backdrop_filter: (module as any).backdrop_filter,
      background_filter: (module as any).background_filter,
      // For Bar modules, the top-level height is the bar thickness, not container height.
      // Use design-scoped size values only so default bar height doesn't mark Sizes as edited.
      width: (isBarModule ? (module as any).design?.width : (module as any).width) as any,
      height: (isBarModule ? (module as any).design?.height : (module as any).height) as any,
      max_width: (module as any).max_width,
      max_height: (module as any).max_height,
      min_width: (module as any).min_width,
      min_height: (module as any).min_height,
      margin_top: (module as any).margin?.top?.toString() || (module as any).margin_top,
      margin_bottom: (module as any).margin?.bottom?.toString() || (module as any).margin_bottom,
      margin_left: (module as any).margin?.left?.toString() || (module as any).margin_left,
      margin_right: (module as any).margin?.right?.toString() || (module as any).margin_right,
      padding_top: (module as any).padding?.top?.toString() || (module as any).padding_top,
      padding_bottom: (module as any).padding?.bottom?.toString() || (module as any).padding_bottom,
      padding_left: (module as any).padding?.left?.toString() || (module as any).padding_left,
      padding_right: (module as any).padding?.right?.toString() || (module as any).padding_right,
      border_radius:
        (module as any).border?.radius?.toString() || (module as any).border_radius?.toString(),
      border_style: (module as any).border?.style || (module as any).border_style,
      border_width: (module as any).border?.width?.toString() || (module as any).border_width,
      border_color: (module as any).border?.color || (module as any).border_color,
      // Position properties
      position: (module as any).position,
      top: (module as any).top,
      bottom: (module as any).bottom,
      left: (module as any).left,
      right: (module as any).right,
      z_index: (module as any).z_index,
      // Text shadow properties
      text_shadow_h: (module as any).text_shadow_h,
      text_shadow_v: (module as any).text_shadow_v,
      text_shadow_blur: (module as any).text_shadow_blur,
      text_shadow_color: (module as any).text_shadow_color,
      // Box shadow properties
      box_shadow_h: (module as any).box_shadow_h,
      box_shadow_v: (module as any).box_shadow_v,
      box_shadow_blur: (module as any).box_shadow_blur,
      box_shadow_spread: (module as any).box_shadow_spread,
      box_shadow_color: (module as any).box_shadow_color,
      // Other properties
      overflow: (module as any).overflow,
      clip_path: (module as any).clip_path,
      // Animation properties
      animation_type: (module as any).animation_type,
      animation_entity: (module as any).animation_entity,
      animation_trigger_type: (module as any).animation_trigger_type,
      animation_attribute: (module as any).animation_attribute,
      animation_state: (module as any).animation_state,
      intro_animation: (module as any).intro_animation,
      outro_animation: (module as any).outro_animation,
      animation_duration: (module as any).animation_duration,
      animation_delay: (module as any).animation_delay,
      animation_timing: (module as any).animation_timing,
    };

    return html`
      <ultra-global-design-tab
        .hass=${this.hass}
        .designProperties=${designProperties}
        .onUpdate=${(updates: Partial<DesignProperties>) => {
          this._updateModuleDesign(updates);
        }}
      ></ultra-global-design-tab>
    `;
  }
  private _renderTextDesignTab(module: CardModule): TemplateResult {
    // Only show text design options for text modules
    if (module.type === 'text') {
      const textModule = module as TextModule;
      return html`
        <!-- Text Color Section -->
        <div class="settings-section">
          <ultra-color-picker
            .label=${'Text Color'}
            .value=${textModule.color || ''}
            .defaultValue=${'var(--primary-text-color)'}
            .hass=${this.hass}
            @value-changed=${(e: CustomEvent) => {
              const value = e.detail.value;
              this._updateModule({ color: value });
              // Load Google Font if needed
              this._loadGoogleFont(textModule.font_family);
            }}
          ></ultra-color-picker>
        </div>

        <!-- Font Family Dropdown -->
        <div class="settings-section">
          <label>Font:</label>
          <select
            .value=${textModule.font_family || 'default'}
            @change=${(e: Event) => {
              const fontFamily = (e.target as HTMLSelectElement).value;
              this._updateModule({ font_family: fontFamily });
              this._loadGoogleFont(fontFamily);
            }}
            class="font-dropdown"
          >
            ${DEFAULT_FONTS.map(
              font => html`
                <option value="${font.value}" ?selected=${textModule.font_family === font.value}>
                  ${font.label}
                </option>
              `
            )}
            <optgroup label="Fonts from Typography settings">
              ${TYPOGRAPHY_FONTS.map(
                font => html`
                  <option value="${font.value}" ?selected=${textModule.font_family === font.value}>
                    ${font.label}
                  </option>
                `
              )}
            </optgroup>
            <optgroup label="Web safe font combinations (do not need to be loaded)">
              ${WEB_SAFE_FONTS.map(
                font => html`
                  <option value="${font.value}" ?selected=${textModule.font_family === font.value}>
                    ${font.label}
                  </option>
                `
              )}
            </optgroup>
          </select>
        </div>

        <!-- Font Size -->
        <div class="settings-section">
          <label>Font Size (px):</label>
          <input
            type="text"
            .value=${(textModule.font_size ?? '').toString()}
            @input=${(e: Event) => {
              const raw = (e.target as HTMLInputElement).value;
              // allow blank
              if (raw === '') {
                this._updateModule({ font_size: undefined });
                return;
              }
              // accept plain number or number with units; store number when numeric
              const numeric = parseFloat(raw);
              if (!Number.isNaN(numeric) && /^\s*-?\d*\.?\d*\s*(px|rem|em|%)?\s*$/i.test(raw)) {
                // keep numeric (module schema expects number for legacy field)
                this._updateModule({ font_size: numeric });
              } else {
                // if invalid, do not update to avoid thrashing
              }
            }}
            placeholder=""
            class="font-size-input"
          />
        </div>

        <!-- Text Alignment -->
        <div class="settings-section">
          <label>Text Alignment:</label>
          <div class="alignment-buttons">
            ${['left', 'center', 'right'].map(
              align => html`
                <button
                  class="alignment-btn ${textModule.alignment === align ? 'active' : ''}"
                  @click=${() => this._updateModule({ alignment: align as any })}
                >
                  <ha-icon icon="mdi:format-align-${align}"></ha-icon>
                </button>
              `
            )}
          </div>
        </div>

        <!-- Text Formatting -->
        <div class="settings-section">
          <label>Text Formatting:</label>
          <div class="format-buttons">
            <button
              class="format-btn ${textModule.bold ? 'active' : ''}"
              @click=${() => this._updateModule({ bold: !textModule.bold })}
            >
              <ha-icon icon="mdi:format-bold"></ha-icon>
            </button>
            <button
              class="format-btn ${textModule.italic ? 'active' : ''}"
              @click=${() => this._updateModule({ italic: !textModule.italic })}
            >
              <ha-icon icon="mdi:format-italic"></ha-icon>
            </button>
            <button
              class="format-btn ${textModule.uppercase ? 'active' : ''}"
              @click=${() => this._updateModule({ uppercase: !textModule.uppercase })}
            >
              <ha-icon icon="mdi:format-letter-case-upper"></ha-icon>
            </button>
            <button
              class="format-btn ${textModule.strikethrough ? 'active' : ''}"
              @click=${() => this._updateModule({ strikethrough: !textModule.strikethrough })}
            >
              <ha-icon icon="mdi:format-strikethrough"></ha-icon>
            </button>
          </div>
        </div>
      `;
    }

    // For separator modules, show color picker
    if (module.type === 'separator') {
      const separatorModule = module as SeparatorModule;
      return html`
        <div class="settings-section">
          <ultra-color-picker
            .label=${'Separator Color'}
            .value=${separatorModule.color || ''}
            .defaultValue=${'var(--divider-color)'}
            .hass=${this.hass}
            @value-changed=${(e: CustomEvent) => {
              const value = e.detail.value;
              this._updateModule({ color: value });
            }}
          ></ultra-color-picker>
        </div>
      `;
    }

    // For bar modules, show bar-specific color options
    if (module.type === 'bar') {
      const barModule = module as BarModule;
      return html`
        <!-- Bar Colors -->
        <div class="settings-section">
          <ultra-color-picker
            .label=${'Bar Color'}
            .value=${barModule.bar_color || ''}
            .defaultValue=${'var(--primary-color)'}
            .hass=${this.hass}
            @value-changed=${(e: CustomEvent) => {
              const value = e.detail.value;
              this._updateModule({ bar_color: value });
            }}
          ></ultra-color-picker>
        </div>

        <div class="settings-section">
          <ultra-color-picker
            .label=${'Background Color'}
            .value=${barModule.background_color || ''}
            .defaultValue=${'var(--secondary-background-color)'}
            .hass=${this.hass}
            @value-changed=${(e: CustomEvent) => {
              const value = e.detail.value;
              this._updateModule({ background_color: value });
            }}
          ></ultra-color-picker>
        </div>

        <!-- Bar Dimensions -->
        <div class="settings-section">
          <label>Bar Height (px):</label>
          <input
            type="text"
            .value=${(barModule.height ?? '').toString()}
            @input=${(e: Event) => {
              const raw = (e.target as HTMLInputElement).value;
              if (raw === '') {
                this._updateModule({ height: undefined });
                return;
              }
              const numeric = parseFloat(raw);
              if (!Number.isNaN(numeric)) {
                this._updateModule({ height: numeric });
              }
            }}
            class="number-input"
          />
        </div>

        <div class="settings-section">
          <label>Border Radius (px):</label>
          <input
            type="text"
            .value=${(barModule.border_radius ?? '').toString()}
            @input=${(e: Event) => {
              const raw = (e.target as HTMLInputElement).value;
              if (raw === '') {
                this._updateModule({ border_radius: undefined });
                return;
              }
              const numeric = parseFloat(raw);
              if (!Number.isNaN(numeric)) {
                this._updateModule({ border_radius: numeric });
              }
            }}
            class="number-input"
          />
        </div>

        <!-- Value Display Options -->
        <div class="settings-section">
          <label class="checkbox-wrapper">
            <input
              type="checkbox"
              .checked=${barModule.show_value !== false}
              @change=${(e: Event) =>
                this._updateModule({ show_value: (e.target as HTMLInputElement).checked })}
            />
            Show Value
          </label>
        </div>

        ${barModule.show_value
          ? html`
              <div class="settings-section">
                <label>Value Position:</label>
                <div class="value-position-buttons">
                  ${['inside', 'outside', 'none'].map(
                    position => html`
                      <button
                        class="position-btn ${barModule.value_position === position
                          ? 'active'
                          : ''}"
                        @click=${() => this._updateModule({ value_position: position as any })}
                      >
                        ${position.charAt(0).toUpperCase() + position.slice(1)}
                      </button>
                    `
                  )}
                </div>
              </div>
            `
          : ''}

        <div class="settings-section">
          <label class="checkbox-wrapper">
            <input
              type="checkbox"
              .checked=${barModule.show_percentage !== false}
              @change=${(e: Event) =>
                this._updateModule({ show_percentage: (e.target as HTMLInputElement).checked })}
            />
            Show as Percentage
          </label>
        </div>

        <div class="settings-section">
          <label class="checkbox-wrapper">
            <input
              type="checkbox"
              .checked=${barModule.animation !== false}
              @change=${(e: Event) =>
                this._updateModule({ animation: (e.target as HTMLInputElement).checked })}
            />
            Animation
          </label>
        </div>
      `;
    }

    // For image modules, show image-specific design options
    if (module.type === 'image') {
      const imageModule = module as ImageModule;
      return html`
        <!-- Image Alignment -->
        <div class="settings-section">
          <label>Image Alignment:</label>
          <div class="alignment-buttons">
            ${['left', 'center', 'right'].map(
              align => html`
                <button
                  class="alignment-btn ${imageModule.alignment === align ? 'active' : ''}"
                  @click=${() => this._updateModule({ alignment: align as any })}
                >
                  <ha-icon icon="mdi:format-align-${align}"></ha-icon>
                </button>
              `
            )}
          </div>
        </div>

        <!-- Image Dimensions -->
        <div class="settings-section">
          <label>Width (px):</label>
          <input
            type="text"
            .value=${(imageModule.image_width ?? '').toString()}
            @input=${(e: Event) => {
              const raw = (e.target as HTMLInputElement).value;
              if (raw === '') {
                this._updateModule({ image_width: undefined });
                return;
              }
              const numeric = parseFloat(raw);
              if (!Number.isNaN(numeric)) {
                this._updateModule({ image_width: numeric });
              }
            }}
            class="number-input"
          />
        </div>

        <div class="settings-section">
          <label>Height (px):</label>
          <input
            type="text"
            .value=${(imageModule.image_height ?? '').toString()}
            @input=${(e: Event) => {
              const raw = (e.target as HTMLInputElement).value;
              if (raw === '') {
                this._updateModule({ image_height: undefined });
                return;
              }
              const numeric = parseFloat(raw);
              if (!Number.isNaN(numeric)) {
                this._updateModule({ image_height: numeric });
              }
            }}
            class="number-input"
          />
        </div>

        <div class="settings-section">
          <label>Border Radius (px):</label>
          <input
            type="text"
            .value=${(imageModule.border_radius ?? '').toString()}
            @input=${(e: Event) => {
              const raw = (e.target as HTMLInputElement).value;
              if (raw === '') {
                this._updateModule({ border_radius: undefined });
                return;
              }
              const numeric = parseFloat(raw);
              if (!Number.isNaN(numeric)) {
                this._updateModule({ border_radius: numeric });
              }
            }}
            class="number-input"
          />
        </div>

        <div class="settings-section">
          <label>Image Fit:</label>
          <div class="value-position-buttons">
            ${['cover', 'contain', 'fill', 'none'].map(
              fit => html`
                <button
                  class="position-btn ${imageModule.image_fit === fit ? 'active' : ''}"
                  @click=${() => this._updateModule({ image_fit: fit as any })}
                >
                  ${fit.charAt(0).toUpperCase() + fit.slice(1)}
                </button>
              `
            )}
          </div>
        </div>
      `;
    }

    return html`<div class="settings-section">
      <p>Design options not available for ${module.type} modules.</p>
    </div>`;
  }

  private _renderBackgroundDesignTab(module: CardModule): TemplateResult {
    return html`
      <div class="settings-section">
        <ultra-color-picker
          .label=${'Background Color'}
          .value=${module.background_color || ''}
          .defaultValue=${'var(--ha-card-background, var(--card-background-color, #fff))'}
          .hass=${this.hass}
          @value-changed=${(e: CustomEvent) => {
            const value = e.detail.value;
            this._updateModule({ background_color: value });
          }}
        ></ultra-color-picker>

        <div class="property-group">
          <label>Background Image Type:</label>
          <select
            .value=${module.background_image_type || 'none'}
            @change=${(e: Event) => {
              const value = (e.target as HTMLSelectElement).value as
                | 'none'
                | 'upload'
                | 'entity'
                | 'url';
              this._updateModule({ background_image_type: value });
            }}
            class="property-select"
          >
            <option value="none">None</option>
            <option value="upload">Upload Image</option>
            <option value="entity">Entity Image</option>
            <option value="url">Image URL</option>
          </select>
        </div>

        ${module.background_image_type === 'upload'
          ? html`
              <div class="property-group">
                <label>Upload Background Image:</label>
                <div class="upload-container">
                  <div class="file-upload-row">
                    <label class="file-upload-button">
                      <div class="button-content">
                        <ha-icon icon="mdi:upload"></ha-icon>
                        <span class="button-label">Choose File</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        @change=${this._handleBackgroundImageUpload}
                        style="display: none"
                      />
                    </label>
                    <div class="path-display">
                      ${module.background_image
                        ? html`<span class="uploaded-path" title="${module.background_image}">
                            ${this._truncatePath(module.background_image)}
                          </span>`
                        : html`<span class="no-file">No file chosen</span>`}
                    </div>
                  </div>
                </div>
              </div>
            `
          : ''}
        ${module.background_image_type === 'entity'
          ? html`
              <div class="property-group">
                <label>Background Image Entity:</label>
                <ha-entity-picker
                  .hass=${this.hass}
                  .value=${module.background_image_entity || ''}
                  @value-changed=${(e: CustomEvent) => {
                    this._updateModule({ background_image_entity: e.detail.value });
                  }}
                  .label=${'Select entity with image attribute'}
                  allow-custom-entity
                ></ha-entity-picker>
              </div>
            `
          : ''}
        ${module.background_image_type === 'url'
          ? html`
              <div class="property-group">
                <label>Background Image URL:</label>
                <input
                  type="text"
                  .value=${module.background_image || ''}
                  @input=${(e: Event) => {
                    const value = (e.target as HTMLInputElement).value;
                    this._updateModule({ background_image: value });
                  }}
                  placeholder="https://example.com/image.jpg"
                  class="property-input"
                />
              </div>
            `
          : ''}
        ${module.background_image_type && module.background_image_type !== 'none'
          ? html`
              <div class="property-group">
                <label>Background Size:</label>
                <select
                  .value=${this._getBackgroundSizeDropdownValue(module.background_size)}
                  @change=${(e: Event) => {
                    const value = (e.target as HTMLSelectElement).value;
                    this._updateModule({ background_size: value });
                  }}
                  class="property-select"
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="auto">Auto</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              ${this._getBackgroundSizeDropdownValue(module.background_size) === 'custom'
                ? html`
                    <div class="property-group">
                      <label>Custom Width:</label>
                      <input
                        type="text"
                        .value=${this._getCustomSizeValue(module.background_size, 'width')}
                        @input=${(e: Event) => {
                          const width = (e.target as HTMLInputElement).value;
                          const height = this._getCustomSizeValue(module.background_size, 'height');
                          const customSize =
                            width && height ? `${width} ${height}` : width || height || 'auto';
                          this._updateModule({ background_size: customSize });
                        }}
                        placeholder="100px, 50%, auto"
                        class="property-input"
                      />
                    </div>
                    <div class="property-group">
                      <label>Custom Height:</label>
                      <input
                        type="text"
                        .value=${this._getCustomSizeValue(module.background_size, 'height')}
                        @input=${(e: Event) => {
                          const height = (e.target as HTMLInputElement).value;
                          const width = this._getCustomSizeValue(module.background_size, 'width');
                          const customSize =
                            width && height ? `${width} ${height}` : width || height || 'auto';
                          this._updateModule({ background_size: customSize });
                        }}
                        placeholder="100px, 50%, auto"
                        class="property-input"
                      />
                    </div>
                  `
                : ''}

              <div class="property-group">
                <label>Background Repeat:</label>
                <select
                  .value=${module.background_repeat || 'no-repeat'}
                  @change=${(e: Event) => {
                    const value = (e.target as HTMLSelectElement).value as
                      | 'repeat'
                      | 'repeat-x'
                      | 'repeat-y'
                      | 'no-repeat';
                    this._updateModule({ background_repeat: value });
                  }}
                  class="property-select"
                >
                  <option value="no-repeat">No Repeat</option>
                  <option value="repeat">Repeat</option>
                  <option value="repeat-x">Repeat X</option>
                  <option value="repeat-y">Repeat Y</option>
                </select>
              </div>

              <div class="property-group">
                <label>Background Position:</label>
                <select
                  .value=${module.background_position || 'center center'}
                  @change=${(e: Event) => {
                    const value = (e.target as HTMLSelectElement).value;
                    this._updateModule({ background_position: value });
                  }}
                  class="property-select"
                >
                  <option value="left top">Left Top</option>
                  <option value="left center">Left Center</option>
                  <option value="left bottom">Left Bottom</option>
                  <option value="center top">Center Top</option>
                  <option value="center center">Center</option>
                  <option value="center bottom">Center Bottom</option>
                  <option value="right top">Right Top</option>
                  <option value="right center">Right Center</option>
                  <option value="right bottom">Right Bottom</option>
                </select>
              </div>
            `
          : ''}
      </div>
    `;
  }
  private _renderSpacingDesignTab(module: CardModule): TemplateResult {
    return html`
      <div class="spacing-grid">
        <div class="spacing-section">
          <h4>Margin</h4>
          <div class="spacing-cross">
            <input
              type="text"
              placeholder="Top"
              .value=${(module.margin?.top ?? '').toString()}
              @input=${(e: Event) => {
                const raw = (e.target as HTMLInputElement).value;
                const next = raw === '' ? undefined : parseFloat(raw);
                this._updateModule({
                  margin: { ...module.margin, top: next as any },
                });
              }}
            />
            <div class="spacing-row">
              <input
                type="text"
                placeholder="Left"
                .value=${(module.margin?.left ?? '').toString()}
                @input=${(e: Event) =>
                  this._updateModule({
                    margin: {
                      ...module.margin,
                      left:
                        (e.target as HTMLInputElement).value === ''
                          ? (undefined as any)
                          : parseFloat((e.target as HTMLInputElement).value),
                    },
                  })}
              />
              <span class="spacing-center">M</span>
              <input
                type="text"
                placeholder="Right"
                .value=${(module.margin?.right ?? '').toString()}
                @input=${(e: Event) =>
                  this._updateModule({
                    margin: {
                      ...module.margin,
                      right:
                        (e.target as HTMLInputElement).value === ''
                          ? (undefined as any)
                          : parseFloat((e.target as HTMLInputElement).value),
                    },
                  })}
              />
            </div>
            <input
              type="text"
              placeholder="Bottom"
              .value=${(module.margin?.bottom ?? '').toString()}
              @input=${(e: Event) =>
                this._updateModule({
                  margin: {
                    ...module.margin,
                    bottom:
                      (e.target as HTMLInputElement).value === ''
                        ? (undefined as any)
                        : parseFloat((e.target as HTMLInputElement).value),
                  },
                })}
            />
          </div>
        </div>

        <div class="spacing-section">
          <h4>Padding</h4>
          <div class="spacing-cross">
            <input
              type="text"
              placeholder="Top"
              .value=${(module.padding?.top ?? '').toString()}
              @input=${(e: Event) =>
                this._updateModule({
                  padding: {
                    ...module.padding,
                    top:
                      (e.target as HTMLInputElement).value === ''
                        ? (undefined as any)
                        : parseFloat((e.target as HTMLInputElement).value),
                  },
                })}
            />
            <div class="spacing-row">
              <input
                type="text"
                placeholder="Left"
                .value=${(module.padding?.left ?? '').toString()}
                @input=${(e: Event) =>
                  this._updateModule({
                    padding: {
                      ...module.padding,
                      left:
                        (e.target as HTMLInputElement).value === ''
                          ? (undefined as any)
                          : parseFloat((e.target as HTMLInputElement).value),
                    },
                  })}
              />
              <span class="spacing-center">P</span>
              <input
                type="text"
                placeholder="Right"
                .value=${(module.padding?.right ?? '').toString()}
                @input=${(e: Event) =>
                  this._updateModule({
                    padding: {
                      ...module.padding,
                      right:
                        (e.target as HTMLInputElement).value === ''
                          ? (undefined as any)
                          : parseFloat((e.target as HTMLInputElement).value),
                    },
                  })}
              />
            </div>
            <input
              type="text"
              placeholder="Bottom"
              .value=${(module.padding?.bottom ?? '').toString()}
              @input=${(e: Event) =>
                this._updateModule({
                  padding: {
                    ...module.padding,
                    bottom:
                      (e.target as HTMLInputElement).value === ''
                        ? (undefined as any)
                        : parseFloat((e.target as HTMLInputElement).value),
                  },
                })}
            />
          </div>
        </div>
      </div>
    `;
  }

  protected firstUpdated(changedProperties: Map<string, any>): void {
    super.firstUpdated(changedProperties);
    // Component has finished initial render
  }
  protected updated(changedProperties: Map<string, any>): void {
    super.updated(changedProperties);

    // Add fixedmenuposition to all ha-select elements (like HA tile-card does)
    this._addFixedMenuPositionToSelects();

    // Initialize dashboard scanner service when hass is available
    if (changedProperties.has('hass') && this.hass) {
      ucDashboardScannerService.initialize(this.hass);
    }

    // Initialize popup positioning when popups are shown
    if (changedProperties.has('_showModuleSelector') && this._showModuleSelector) {
      setTimeout(() => {
        const popup = this.shadowRoot?.querySelector('#module-selector-popup') as HTMLElement;
        if (popup) {
          this._initializePopupPosition(popup);
        }
      }, 0);
    }

    if (changedProperties.has('_selectedModule') && this._selectedModule) {
      setTimeout(() => {
        const popup = this.shadowRoot?.querySelector(
          `#module-popup-${this._selectedModule?.rowIndex}-${this._selectedModule?.columnIndex}-${this._selectedModule?.moduleIndex}`
        ) as HTMLElement;
        if (popup) {
          this._initializePopupPosition(popup);
        }
      }, 0);
    }

    if (changedProperties.has('_selectedLayoutChild') && this._selectedLayoutChild) {
      setTimeout(() => {
        const popup = this.shadowRoot?.querySelector(
          `#child-popup-${this._selectedLayoutChild?.parentRowIndex}-${this._selectedLayoutChild?.parentColumnIndex}-${this._selectedLayoutChild?.parentModuleIndex}-${this._selectedLayoutChild?.childIndex}`
        ) as HTMLElement;
        if (popup) {
          this._initializePopupPosition(popup);
        }
      }, 0);
    }

    // Restore scroll position after update (for mobile scroll preservation)
    if (this._shouldRestoreScroll && this._savedScrollPosition !== null) {
      const scrollPos = this._savedScrollPosition;

      // Multiple restoration attempts to handle async rendering
      const restoreScroll = () => {
        const popupBody = this.shadowRoot?.querySelector('.popup-body') as HTMLElement;
        const selectorBody = this.shadowRoot?.querySelector('.selector-body') as HTMLElement;
        const scrollContainer = popupBody || selectorBody;

        if (scrollContainer && scrollPos !== null) {
          // Force instant scroll (no smooth scrolling)
          scrollContainer.style.scrollBehavior = 'auto';
          scrollContainer.scrollTop = scrollPos;

          // Restore smooth scrolling after a moment
          setTimeout(() => {
            if (scrollContainer) {
              scrollContainer.style.scrollBehavior = '';
            }
          }, 100);
        }
      };

      // First attempt immediately
      restoreScroll();

      // Second attempt in requestAnimationFrame
      requestAnimationFrame(() => {
        restoreScroll();

        // Third attempt after a short delay (for mobile)
        setTimeout(() => {
          restoreScroll();
        }, 50);
      });

      this._shouldRestoreScroll = false;
      this._savedScrollPosition = null;
    }
  }

  private _renderBorderDesignTab(module: CardModule): TemplateResult {
    return html`
      <div class="settings-section">
        <label>Border Radius (px):</label>
        <input
          type="text"
          .value=${(module.border?.radius ?? '').toString()}
          @input=${(e: Event) =>
            this._updateModule({
              border: {
                ...module.border,
                radius:
                  (e.target as HTMLInputElement).value === ''
                    ? (undefined as any)
                    : parseFloat((e.target as HTMLInputElement).value),
              },
            })}
        />
      </div>
    `;
  }

  protected render(): TemplateResult {
    const layout = this._ensureLayout();
    const lang = this.hass?.locale?.language || 'en';

    return html`
      <div class="layout-builder">
        <div class="builder-header">
          <h3>${localize('editor.tabs.layout', lang, 'Layout Builder')}</h3>
          <div class="header-buttons">
            <button
              class="undo-btn"
              @click=${(e: Event) => {
                e.stopPropagation();
                this._undo();
              }}
              ?disabled=${!this._canUndo()}
              title="${localize('editor.layout.undo_tooltip', lang, 'Undo last change (Ctrl+Z)')}"
            >
              <ha-icon icon="mdi:undo"></ha-icon>
              <span>${localize('editor.layout.undo', lang, 'Undo')}</span>
            </button>
            <button
              class="redo-btn"
              @click=${(e: Event) => {
                e.stopPropagation();
                this._redo();
              }}
              ?disabled=${!this._canRedo()}
              title="${localize(
                'editor.layout.redo_tooltip',
                lang,
                'Redo last undone change (Ctrl+Y)'
              )}"
            >
              <ha-icon icon="mdi:redo"></ha-icon>
              <span>${localize('editor.layout.redo', lang, 'Redo')}</span>
            </button>
            <button
              class="add-row-btn"
              @click=${(e: Event) => {
                e.stopPropagation();
                this._addRow();
              }}
              title="${localize(
                'editor.layout.add_row_tooltip',
                lang,
                'Add a new row to your layout'
              )}"
            >
              <ha-icon icon="mdi:plus"></ha-icon>
              ${localize('editor.layout.add_row', lang, 'Add Row')}
            </button>
          </div>
        </div>

        <div class="rows-container">
          ${layout.rows.map(
            (row, rowIndex) => html`
              <div
                class="row-builder"
                draggable="true"
                @dragstart=${(e: DragEvent) => this._onDragStart(e, 'row', rowIndex)}
                @dragend=${this._onDragEnd}
                @dragover=${this._onDragOver}
                @dragenter=${(e: DragEvent) => this._onDragEnter(e, 'row', rowIndex)}
                @dragleave=${this._onDragLeave}
                @drop=${(e: DragEvent) => this._onDrop(e, 'row', rowIndex)}
                class="${this._dropTarget?.type === 'row' && this._dropTarget?.rowIndex === rowIndex
                  ? 'drop-target'
                  : ''}"
              >
                <div class="row-header">
                  <div class="row-title">
                    <div class="row-title-left">
                      <div class="row-drag-handle" title="Drag to move row">
                        <ha-icon icon="mdi:drag"></ha-icon>
                      </div>
                      <span class="row-name-top"
                        >${(row as any).row_name || `Row ${rowIndex + 1}`}</span
                      >
                      <button
                        class="column-layout-btn"
                        @click=${(e: Event) => {
                          e.stopPropagation();
                          this._openColumnLayoutSelector(rowIndex);
                        }}
                        @mousedown=${(e: Event) => e.stopPropagation()}
                        @dragstart=${(e: Event) => e.preventDefault()}
                        title="Change Column Layout"
                      >
                        <span class="layout-icon">${this._getCurrentLayoutDisplay(row)}</span>
                      </button>
                      <span class="column-layout-text">${this._getCurrentLayoutText(row)}</span>
                    </div>
                    <div class="row-title-right">
                      <button
                        class="row-settings-btn"
                        @click=${(e: Event) => {
                          e.stopPropagation();
                          this._openRowSettings(rowIndex);
                        }}
                        @mousedown=${(e: Event) => e.stopPropagation()}
                        @dragstart=${(e: Event) => e.preventDefault()}
                        title="${localize(
                          'editor.layout.row_settings',
                          this.hass?.locale?.language || 'en',
                          'Row Settings'
                        )}"
                      >
                        <ha-icon icon="mdi:cog"></ha-icon>
                      </button>
                      <button
                        class="row-collapse-btn"
                        @click=${(e: Event) => this._toggleRowCollapsed(rowIndex, e)}
                        @mousedown=${(e: Event) => e.stopPropagation()}
                        @dragstart=${(e: Event) => e.preventDefault()}
                        title="${this._collapsedRows.has(rowIndex) ? 'Expand row' : 'Collapse row'}"
                      >
                        <ha-icon
                          icon="mdi:chevron-down"
                          style="transform: rotate(${this._collapsedRows.has(rowIndex)
                            ? '-90deg'
                            : '0deg'}); transition: transform 0.2s ease;"
                        ></ha-icon>
                      </button>
                    </div>
                  </div>
                  <div
                    class="row-bottom"
                    style="display: ${this._collapsedRows.has(rowIndex) ? 'none' : 'flex'};"
                  >
                    <div class="row-actions-left">
                      <button
                        class="row-add-column-btn"
                        @click=${(e: Event) => {
                          e.stopPropagation();
                          this._addColumn(rowIndex);
                        }}
                        @mousedown=${(e: Event) => e.stopPropagation()}
                        @dragstart=${(e: Event) => e.preventDefault()}
                        title="Add Column to Row"
                      >
                        <ha-icon icon="mdi:plus"></ha-icon>
                      </button>
                      <button
                        class="row-export-btn"
                        @click=${(e: Event) => {
                          e.stopPropagation();
                          this._exportRow(rowIndex);
                        }}
                        @mousedown=${(e: Event) => e.stopPropagation()}
                        @dragstart=${(e: Event) => e.preventDefault()}
                        title="Export row"
                      >
                        <ha-icon icon="mdi:export"></ha-icon>
                      </button>
                      <button
                        class="row-paste-btn"
                        @click=${(e: Event) => {
                          e.stopPropagation();
                          this._pasteRowFromClipboard(rowIndex);
                        }}
                        @mousedown=${(e: Event) => e.stopPropagation()}
                        @dragstart=${(e: Event) => e.preventDefault()}
                        title="Import from clipboard"
                      >
                        <ha-icon icon="mdi:clipboard-text"></ha-icon>
                      </button>
                      <button
                        class="row-remap-entities-btn"
                        @click=${(e: Event) => {
                          e.stopPropagation();
                          this._remapRowEntities(rowIndex);
                        }}
                        @mousedown=${(e: Event) => e.stopPropagation()}
                        @dragstart=${(e: Event) => e.preventDefault()}
                        title="Remap Entities"
                      >
                        <ha-icon icon="mdi:resistor-nodes"></ha-icon>
                      </button>
                    </div>
                    <div class="row-actions-right">
                      <button
                        class="row-favorite-btn"
                        @click=${(e: Event) => {
                          e.stopPropagation();
                          this._saveRowAsFavorite(rowIndex);
                        }}
                        @mousedown=${(e: Event) => e.stopPropagation()}
                        @dragstart=${(e: Event) => e.preventDefault()}
                        title="Save as favorite"
                      >
                        <ha-icon icon="mdi:heart"></ha-icon>
                      </button>
                      <button
                        class="row-duplicate-btn"
                        @click=${(e: Event) => {
                          e.stopPropagation();
                          this._duplicateRow(rowIndex);
                        }}
                        @mousedown=${(e: Event) => e.stopPropagation()}
                        @dragstart=${(e: Event) => e.preventDefault()}
                        title="Duplicate Row"
                      >
                        <ha-icon icon="mdi:content-copy"></ha-icon>
                      </button>
                      <button
                        class="delete-row-btn"
                        @click=${(e: Event) => {
                          e.stopPropagation();
                          this._deleteRow(rowIndex);
                        }}
                        @mousedown=${(e: Event) => e.stopPropagation()}
                        @dragstart=${(e: Event) => e.preventDefault()}
                        title="Delete Row"
                      >
                        <ha-icon icon="mdi:delete"></ha-icon>
                      </button>
                      <div class="row-more-container">
                        <button
                          class="row-more-btn"
                          @click=${(e: Event) => {
                            e.stopPropagation();
                            this._toggleMoreMenu(rowIndex);
                          }}
                          @mousedown=${(e: Event) => e.stopPropagation()}
                          @dragstart=${(e: Event) => e.preventDefault()}
                          title="More actions"
                        >
                          <ha-icon icon="mdi:dots-vertical"></ha-icon>
                        </button>
                        ${this._openMoreMenuRowIndex === rowIndex
                          ? html`
                              <div
                                class="row-more-menu"
                                @click=${(e: Event) => e.stopPropagation()}
                              >
                                <button
                                  class="more-menu-item paste"
                                  @click=${() => {
                                    this._pasteRowFromClipboard(rowIndex);
                                    this._openMoreMenuRowIndex = -1;
                                  }}
                                >
                                  <ha-icon icon="mdi:clipboard-text"></ha-icon>
                                  <span>Paste from Clipboard</span>
                                </button>
                                <button
                                  class="more-menu-item favorite"
                                  @click=${() => {
                                    this._saveRowAsFavorite(rowIndex);
                                    this._openMoreMenuRowIndex = -1;
                                  }}
                                >
                                  <ha-icon icon="mdi:heart"></ha-icon>
                                  <span>Save as Favorite</span>
                                </button>
                                <button
                                  class="more-menu-item export"
                                  @click=${() => {
                                    this._exportRow(rowIndex);
                                    this._openMoreMenuRowIndex = -1;
                                  }}
                                >
                                  <ha-icon icon="mdi:export"></ha-icon>
                                  <span>Export Row</span>
                                </button>
                              </div>
                            `
                          : ''}
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="columns-container"
                  data-layout="${row.column_layout || '1-2-1-2'}"
                  style="display: ${this._collapsedRows.has(rowIndex) ? 'none' : 'flex'};"
                >
                  ${row.columns && row.columns.length > 0
                    ? row.columns.map(
                        (column, columnIndex) => html`
                          <div
                            class="column-builder"
                            draggable="true"
                            @dragstart=${(e: DragEvent) =>
                              this._onDragStart(e, 'column', rowIndex, columnIndex)}
                            @dragend=${this._onDragEnd}
                            @dragover=${this._onDragOver}
                            @dragenter=${(e: DragEvent) =>
                              this._onDragEnter(e, 'column', rowIndex, columnIndex)}
                            @dragleave=${this._onDragLeave}
                            @drop=${(e: DragEvent) =>
                              this._onDrop(e, 'column', rowIndex, columnIndex)}
                            class="${this._dropTarget?.type === 'column' &&
                            this._dropTarget?.rowIndex === rowIndex &&
                            this._dropTarget?.columnIndex === columnIndex
                              ? 'drop-target'
                              : ''}"
                          >
                            <div class="column-header">
                              <div class="column-title">
                                <div class="column-drag-handle" title="Drag to move column">
                                  <ha-icon icon="mdi:drag"></ha-icon>
                                </div>
                                <button
                                  class="column-collapse-btn"
                                  @click=${(e: Event) =>
                                    this._toggleColumnCollapsed(rowIndex, columnIndex, e)}
                                  @mousedown=${(e: Event) => e.stopPropagation()}
                                  @dragstart=${(e: Event) => e.preventDefault()}
                                  title="${this._collapsedColumns.has(`${rowIndex}-${columnIndex}`)
                                    ? 'Expand column'
                                    : 'Collapse column'}"
                                >
                                  <ha-icon
                                    icon="mdi:chevron-down"
                                    style="transform: rotate(${this._collapsedColumns.has(
                                      `${rowIndex}-${columnIndex}`
                                    )
                                      ? '-90deg'
                                      : '0deg'}); transition: transform 0.2s ease;"
                                  ></ha-icon>
                                </button>
                                <span>Column ${columnIndex + 1}</span>
                              </div>
                              <div class="column-actions">
                                <button
                                  class="column-add-module-btn"
                                  @click=${(e: Event) => {
                                    e.stopPropagation();
                                    this._openModuleSelector(rowIndex, columnIndex);
                                  }}
                                  @mousedown=${(e: Event) => e.stopPropagation()}
                                  @dragstart=${(e: Event) => e.preventDefault()}
                                  title="Add Module to Column"
                                >
                                  <ha-icon icon="mdi:plus"></ha-icon>
                                </button>
                                <button
                                  class="column-duplicate-btn"
                                  @click=${(e: Event) => {
                                    e.stopPropagation();
                                    this._duplicateColumn(rowIndex, columnIndex);
                                  }}
                                  @mousedown=${(e: Event) => e.stopPropagation()}
                                  @dragstart=${(e: Event) => e.preventDefault()}
                                  title="Duplicate Column"
                                >
                                  <ha-icon icon="mdi:content-copy"></ha-icon>
                                </button>
                                <button
                                  class="column-settings-btn"
                                  @click=${(e: Event) => {
                                    e.stopPropagation();
                                    this._openColumnSettings(rowIndex, columnIndex);
                                  }}
                                  @mousedown=${(e: Event) => e.stopPropagation()}
                                  @dragstart=${(e: Event) => e.preventDefault()}
                                  title="${localize(
                                    'editor.layout.column_settings',
                                    this.hass?.locale?.language || 'en',
                                    'Column Settings'
                                  )}"
                                >
                                  <ha-icon icon="mdi:cog"></ha-icon>
                                </button>
                                <button
                                  class="column-delete-btn"
                                  @click=${(e: Event) => {
                                    e.stopPropagation();
                                    this._deleteColumn(rowIndex, columnIndex);
                                  }}
                                  @mousedown=${(e: Event) => e.stopPropagation()}
                                  @dragstart=${(e: Event) => e.preventDefault()}
                                  title="Delete Column"
                                >
                                  <ha-icon icon="mdi:delete"></ha-icon>
                                </button>
                              </div>
                            </div>
                            <div
                              class="modules-container ${this._dropTarget?.type === 'column' &&
                              this._dropTarget?.rowIndex === rowIndex &&
                              this._dropTarget?.columnIndex === columnIndex
                                ? 'drop-target'
                                : ''}"
                              @dragover=${this._onDragOver}
                              @dragenter=${(e: DragEvent) =>
                                this._onDragEnter(e, 'column', rowIndex, columnIndex)}
                              @dragleave=${this._onDragLeave}
                              @drop=${(e: DragEvent) =>
                                this._onDrop(e, 'column', rowIndex, columnIndex)}
                              style="display: ${this._collapsedColumns.has(
                                `${rowIndex}-${columnIndex}`
                              )
                                ? 'none'
                                : 'block'};"
                            >
                              ${column.modules.map(
                                (module, moduleIndex) => html`
                                  <div
                                    class="module-item"
                                    draggable="true"
                                    @dragstart=${(e: DragEvent) =>
                                      this._onDragStart(
                                        e,
                                        'module',
                                        rowIndex,
                                        columnIndex,
                                        moduleIndex
                                      )}
                                    @dragend=${this._onDragEnd}
                                    @dragover=${this._onDragOver}
                                    @dragenter=${(e: DragEvent) =>
                                      this._onDragEnter(
                                        e,
                                        'module',
                                        rowIndex,
                                        columnIndex,
                                        moduleIndex
                                      )}
                                    @dragleave=${this._onDragLeave}
                                    @drop=${(e: DragEvent) =>
                                      this._onDrop(e, 'module', rowIndex, columnIndex, moduleIndex)}
                                    class="${this._dropTarget?.type === 'module' &&
                                    this._dropTarget?.rowIndex === rowIndex &&
                                    this._dropTarget?.columnIndex === columnIndex &&
                                    this._dropTarget?.moduleIndex === moduleIndex
                                      ? 'drop-target'
                                      : ''}"
                                  >
                                    <div
                                      class="module-content"
                                      @click=${() =>
                                        this._openModuleSettings(
                                          rowIndex,
                                          columnIndex,
                                          moduleIndex
                                        )}
                                    >
                                      ${this._renderSingleModule(
                                        module,
                                        rowIndex,
                                        columnIndex,
                                        moduleIndex
                                      )}
                                    </div>
                                  </div>
                                `
                              )}
                              <button
                                class="add-module-btn"
                                @click=${(e: Event) => {
                                  e.stopPropagation();
                                  this._openModuleSelector(rowIndex, columnIndex);
                                }}
                              >
                                <ha-icon icon="mdi:plus"></ha-icon>
                                Add Module
                              </button>
                            </div>
                          </div>
                        `
                      )
                    : html`
                        <div class="empty-row-message">
                          <p>This row has no columns.</p>
                          <button
                            class="add-module-btn"
                            @click=${(e: Event) => {
                              e.stopPropagation();
                              this._openModuleSelector(rowIndex, 0);
                            }}
                            style="margin-top: 8px;"
                          >
                            <ha-icon icon="mdi:plus"></ha-icon>
                            Add Module (will create column automatically)
                          </button>
                        </div>
                      `}
                  <div class="add-column-container">
                    <button
                      class="add-column-btn"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        this._addColumn(rowIndex);
                      }}
                      title="Add Column"
                    >
                      <ha-icon icon="mdi:plus"></ha-icon>
                      Add Column
                    </button>
                  </div>
                </div>
              </div>
            `
          )}
        </div>

        ${this._showModuleSelector ? this._renderModuleSelector() : ''}
        ${this._showModuleSettings ? this._renderModuleSettings() : ''}
        ${this._showLayoutChildSettings ? this._renderLayoutChildSettings() : ''}
        ${this._showRowSettings ? this._renderRowSettings() : ''}
        ${this._showColumnSettings ? this._renderColumnSettings() : ''}
        ${this._showColumnLayoutSelector ? this._renderColumnLayoutSelector() : ''}
        ${this._renderFavoriteDialog()} ${this._renderImportDialog()}
      </div>
    `;
  }
  private _renderModuleSelector(): TemplateResult {
    const registry = getModuleRegistry();
    // Get all modules but exclude external_card from the selector (it's only for 3rd party tab)
    const allModules = registry.getAllModules().filter(m => m.metadata.type !== 'external_card');
    const isAddingToLayoutModule = this._selectedLayoutModuleIndex >= 0;

    return html`
      <style>
        .module-category-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          padding: 12px;
          background: var(--secondary-background-color);
          border-radius: 12px;
        }

        .category-tab {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid transparent;
          border-radius: 8px;
          background: var(--card-background-color);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
          transition: all 0.3s;
          font-family: inherit;
        }

        .category-tab.active {
          border-color: var(--primary-color);
          background: linear-gradient(
            135deg,
            rgba(3, 169, 244, 0.1) 0%,
            rgba(3, 169, 244, 0.05) 100%
          );
        }

        .category-tab.pro-tab {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .category-tab.pro-tab.active {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
        }

        .pro-badge-mini {
          font-size: 12px;
        }

        .pro-upgrade-prompt {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 32px;
          border-radius: 16px;
          text-align: center;
        }

        .pro-upgrade-prompt .pro-icon {
          font-size: 64px;
          margin-bottom: 16px;
          animation: proPulse 2s ease-in-out infinite;
        }

        .pro-upgrade-prompt .pro-icon ha-icon {
          --mdc-icon-size: 64px;
        }

        @keyframes proPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }

        .pro-upgrade-prompt h3 {
          font-size: 24px;
          margin: 0 0 12px 0;
          font-weight: 700;
        }

        .pro-upgrade-prompt p {
          opacity: 0.95;
          margin: 0 0 20px 0;
          font-size: 16px;
        }

        .pro-features {
          list-style: none;
          padding: 0;
          margin: 24px 0;
          display: grid;
          gap: 12px;
          text-align: left;
          max-width: 300px;
          margin: 24px auto;
        }

        .pro-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 500;
        }

        .pro-features li ha-icon {
          --mdc-icon-size: 20px;
        }

        .upgrade-btn {
          padding: 14px 32px;
          background: rgba(255, 255, 255, 0.25);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          color: white;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.3s;
          font-family: inherit;
        }

        .upgrade-btn:hover {
          background: rgba(255, 255, 255, 0.35);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }
      </style>
      <div class="module-selector-popup">
        <div
          class="popup-overlay"
          @click=${() => {
            this._showModuleSelector = false;
            this._selectedLayoutModuleIndex = -1;
            this._selectedNestedChildIndex = -1;
          }}
        ></div>
        <div class="selector-content draggable-popup" id="module-selector-popup">
          <div class="selector-header-wrapper">
            <div
              class="selector-header"
              @mousedown=${(e: MouseEvent) => {
                const popup = (e.target as HTMLElement).closest('.selector-content') as HTMLElement;
                if (popup) this._startPopupDrag(e, popup);
              }}
            >
              <div class="selector-header-top">
                <h3>Add Module</h3>
                <button
                  class="close-button"
                  title="Close"
                  @mousedown=${(e: Event) => e.stopPropagation()}
                  @click=${() => {
                    this._showModuleSelector = false;
                    this._selectedLayoutModuleIndex = -1;
                    this._selectedNestedChildIndex = -1;
                  }}
                >
                  ×
                </button>
              </div>
              ${isAddingToLayoutModule
                ? html`<p class="selector-subtitle">
                    Adding to layout module (content modules and layout modules allowed up to 2
                    levels deep)
                  </p>`
                : ''}
            </div>

            <!-- Tab Navigation -->
            <div class="module-selector-tabs">
              <button
                class="tab-button ${this._activeModuleSelectorTab === 'modules' ? 'active' : ''}"
                @click=${() => (this._activeModuleSelectorTab = 'modules')}
              >
                <ha-icon icon="mdi:puzzle"></ha-icon>
                <span>Modules</span>
              </button>
              <button
                class="tab-button ${this._activeModuleSelectorTab === '3rdparty' ? 'active' : ''}"
                @click=${() => (this._activeModuleSelectorTab = '3rdparty')}
              >
                <ha-icon icon="mdi:card-multiple"></ha-icon>
                <span>3rd Party</span>
              </button>
              <button
                class="tab-button ${this._activeModuleSelectorTab === 'presets' ? 'active' : ''}"
                @click=${() => {
                  this._activeModuleSelectorTab = 'presets';
                  // Refresh WordPress presets when presets tab is opened
                  ucPresetsService.refreshWordPressPresets();
                }}
              >
                <ha-icon icon="mdi:palette"></ha-icon>
                <span>Presets</span>
              </button>
              <button
                class="tab-button ${this._activeModuleSelectorTab === 'favorites' ? 'active' : ''}"
                @click=${() => (this._activeModuleSelectorTab = 'favorites')}
              >
                <ha-icon icon="mdi:heart"></ha-icon>
                <span>Favorites</span>
              </button>
            </div>
          </div>

          <div class="selector-body">
            ${this._activeModuleSelectorTab === 'modules'
              ? this._renderModulesTab(allModules, isAddingToLayoutModule)
              : ''}
            ${this._activeModuleSelectorTab === '3rdparty' ? this._render3rdPartyTab() : ''}
            ${this._activeModuleSelectorTab === 'presets' ? this._renderPresetsTab() : ''}
            ${this._activeModuleSelectorTab === 'favorites' ? this._renderFavoritesTab() : ''}
          </div>

          <!-- Resize handle -->
          <div
            class="resize-handle"
            @mousedown=${(e: MouseEvent) => {
              const popup = (e.target as HTMLElement).closest('.selector-content') as HTMLElement;
              if (popup) this._startPopupResize(e, popup);
            }}
            title="Drag to resize"
          >
            <ha-icon icon="mdi:resize-bottom-right"></ha-icon>
          </div>
        </div>
      </div>
    `;
  }

  private _formatCategoryTitle(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  private _renderModulesTab(allModules: any[], isAddingToLayoutModule: boolean): TemplateResult {
    // Check integration auth only (no card auth fallback)
    const integrationUser = ucCloudAuthService.checkIntegrationAuth(this.hass);
    const isPro =
      integrationUser?.subscription?.tier === 'pro' &&
      integrationUser?.subscription?.status === 'active';
    const isLoggedIn = !!integrationUser;

    // Filter modules by PRO status
    const standardModules = allModules.filter(m => !m.metadata.tags?.includes('pro'));
    const proModules = allModules.filter(m => m.metadata.tags?.includes('pro'));

    // Apply active category filter
    const filteredModules =
      this._activeModuleCategoryTab === 'standard' ? standardModules : proModules;

    const layoutModules = filteredModules.filter(
      m => m.metadata.category === 'layout' && m.metadata.type !== 'pagebreak'
    );
    let contentModules = filteredModules.filter(m => m.metadata.category !== 'layout');

    // Get the parent layout module and check nesting depth if we're adding to a layout module
    let parentLayoutType: string | null = null;
    let nestingDepth = 0;
    if (isAddingToLayoutModule && this._selectedLayoutModuleIndex >= 0) {
      const layout = this.config.layout;
      let parentModule =
        layout.rows[this._selectedRowIndex]?.columns[this._selectedColumnIndex]?.modules[
          this._selectedLayoutModuleIndex
        ];

      // Check if we're adding to a nested layout module
      if (this._selectedNestedChildIndex >= 0) {
        // We're adding to a nested layout module (layout inside another layout)
        const outerLayoutModule = parentModule as any;
        if (
          outerLayoutModule &&
          outerLayoutModule.modules &&
          outerLayoutModule.modules[this._selectedNestedChildIndex]
        ) {
          parentModule = outerLayoutModule.modules[this._selectedNestedChildIndex];
          nestingDepth = 2; // We're already at the second level of nesting
        }
      } else {
        nestingDepth = 1; // We're at the first level of nesting
      }

      parentLayoutType = parentModule?.type || null;

      // Calculate current nesting depth by checking if parent has layout children
      if (
        parentModule &&
        (parentModule.type === 'horizontal' ||
          parentModule.type === 'vertical' ||
          parentModule.type === 'slider')
      ) {
        const layoutParent = parentModule as any;
        if (layoutParent.modules && layoutParent.modules.length > 0) {
          // Check if any existing children are layout modules (indicating we're at max depth)
          const hasLayoutChildren = layoutParent.modules.some(
            (child: any) =>
              child.type === 'horizontal' || child.type === 'vertical' || child.type === 'slider'
          );
          if (hasLayoutChildren && nestingDepth >= 2) {
            nestingDepth = 3; // Would exceed maximum depth
          }
        }
      }

      // If adding to a slider, include pagebreak in content modules
      if (parentLayoutType === 'slider') {
        const pageBreakModule = allModules.find(m => m.metadata.type === 'pagebreak');
        if (pageBreakModule) {
          contentModules = [pageBreakModule, ...contentModules];
        }
      }
    }

    // Filter layout modules based on nesting rules (max 2 levels)
    let allowedLayoutModules: any[] = [];
    if (isAddingToLayoutModule && parentLayoutType) {
      if (nestingDepth < 2) {
        // Allow both horizontal and vertical layout modules for levels 1 and 2
        allowedLayoutModules = layoutModules;
      }
      // If nestingDepth >= 2, don't show any layout modules (content only)
    } else if (!isAddingToLayoutModule) {
      // When adding to columns, show all layout modules
      allowedLayoutModules = layoutModules;
    }

    return html`
      <!-- PRO/Standard Tab Navigation -->
      <div class="module-category-tabs">
        <button
          class="category-tab ${this._activeModuleCategoryTab === 'standard' ? 'active' : ''}"
          @click=${() => (this._activeModuleCategoryTab = 'standard')}
        >
          <ha-icon icon="mdi:puzzle"></ha-icon>
          <span>Standard</span>
        </button>
        <button
          class="category-tab pro-tab ${this._activeModuleCategoryTab === 'pro' ? 'active' : ''}"
          @click=${() => (this._activeModuleCategoryTab = 'pro')}
        >
          <ha-icon icon="mdi:star-circle"></ha-icon>
          <span>PRO</span>
          <span class="pro-badge-mini">⭐</span>
        </button>
      </div>

      ${this._activeModuleCategoryTab === 'pro' && !isPro
        ? this._renderProUpgradePrompt(isLoggedIn)
        : html`
            ${allowedLayoutModules.length > 0
              ? html`
                  <div class="module-category layout-containers">
                    <h4 class="category-title">Layout Containers</h4>
                    <p class="category-description">
                      ${isAddingToLayoutModule
                        ? nestingDepth < 2
                          ? `Add horizontal or vertical layout modules (${2 - nestingDepth} more level${2 - nestingDepth !== 1 ? 's' : ''} allowed)`
                          : 'Maximum nesting depth reached - only content modules allowed'
                        : 'Create containers to organize your modules'}
                    </p>
                    <div class="module-types layout-modules">
                      ${allowedLayoutModules.map(module => {
                        const metadata = module.metadata;
                        const isHorizontal = metadata.type === 'horizontal';
                        const isVertical = metadata.type === 'vertical';
                        return html`
                          <button
                            class="module-type-btn layout-module ${isHorizontal
                              ? 'horizontal-layout'
                              : ''} ${isVertical ? 'vertical-layout' : ''}"
                            @click=${() => this._addModule(metadata.type)}
                            title="${metadata.description}"
                          >
                            <ha-icon icon="${metadata.icon}"></ha-icon>
                            <div class="module-info">
                              <span class="module-title">${metadata.title}</span>
                              <span class="module-description">${metadata.description}</span>
                            </div>
                          </button>
                        `;
                      })}
                    </div>
                  </div>
                `
              : ''}
            ${contentModules.length > 0
              ? html`
                  <div class="module-category">
                    <h4 class="category-title">Content Modules</h4>
                    <p class="category-description">Add content and interactive elements</p>
                    <div class="module-types content-modules">
                      ${contentModules.map(module => {
                        const metadata = module.metadata;
                        return html`
                          <button
                            class="module-type-btn content-module"
                            @click=${() => this._addModule(metadata.type)}
                            title="${metadata.description}"
                          >
                            <ha-icon icon="${metadata.icon}"></ha-icon>
                            <div class="module-info">
                              <span class="module-title">${metadata.title}</span>
                              <span class="module-description">${metadata.description}</span>
                            </div>
                          </button>
                        `;
                      })}
                    </div>
                  </div>
                `
              : ''}
          `}
    `;
  }

  /**
   * Render PRO upgrade prompt for non-Pro users
   */
  private _renderProUpgradePrompt(isLoggedIn: boolean): TemplateResult {
    return html`
      <div class="pro-upgrade-prompt">
        <div class="pro-icon">
          <ha-icon icon="mdi:star-circle"></ha-icon>
        </div>
        <h3>Ultra Card PRO</h3>
        <p>
          Access premium modules like Weather Forecast, advanced animations, and more exclusive
          features.
        </p>
        <ul class="pro-features">
          <li><ha-icon icon="mdi:check-circle"></ha-icon> Premium Modules</li>
          <li><ha-icon icon="mdi:check-circle"></ha-icon> Cloud Backups</li>
          <li><ha-icon icon="mdi:check-circle"></ha-icon> Auto Snapshots</li>
          <li><ha-icon icon="mdi:check-circle"></ha-icon> Priority Support</li>
        </ul>
        <button class="upgrade-btn" @click=${this._handleUpgradeClick}>
          ${isLoggedIn ? 'Upgrade to PRO' : 'Login or Upgrade'}
        </button>
      </div>
    `;
  }

  /**
   * Handle upgrade button click - navigate to PRO tab
   */
  private _handleUpgradeClick(): void {
    // Dispatch event to parent to switch to PRO tab
    this.dispatchEvent(
      new CustomEvent('switch-tab', {
        detail: { tab: 'pro' },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _renderPresetImages(preset: any, wpPreset: any): TemplateResult {
    // Get all available images
    const images: string[] = [];

    // Add featured image first if it exists
    if (preset.thumbnail) {
      images.push(preset.thumbnail);
    }

    // Add gallery images if they exist
    if (wpPreset.gallery && Array.isArray(wpPreset.gallery) && wpPreset.gallery.length > 0) {
      // Add gallery images that aren't already in the list
      wpPreset.gallery.forEach((img: string) => {
        if (img && !images.includes(img)) {
          images.push(img);
        }
      });
    }

    // If no images, show icon
    if (images.length === 0) {
      return html`
        <div class="preset-icon-large">
          <ha-icon icon="${preset.icon}"></ha-icon>
        </div>
      `;
    }

    // If only one image, show simple thumbnail
    if (images.length === 1) {
      return html`
        <div class="preset-thumbnail">
          <img src="${images[0]}" alt="${preset.name} preview" />
        </div>
      `;
    }

    // Multiple images - show slider
    const sliderId = `slider-${preset.id}`;
    return html`
      <div class="preset-image-slider" id="${sliderId}">
        <div
          class="preset-slider-container"
          style="transform: translateX(0%)"
          @mousedown=${(e: MouseEvent) => this._handleSliderMouseDown(e, sliderId, images.length)}
          @touchstart=${(e: TouchEvent) => this._handleSliderTouchStart(e, sliderId, images.length)}
        >
          ${images.map(
            (image, index) => html`
              <div class="preset-slider-image">
                <img src="${image}" alt="${preset.name} preview ${index + 1}" />
              </div>
            `
          )}
        </div>

        <!-- Navigation arrows -->
        <button
          class="preset-slider-nav prev"
          @click=${(e: Event) => {
            e.stopPropagation();
            this._navigateSlider(sliderId, -1, images.length);
          }}
        >
          <ha-icon icon="mdi:chevron-left"></ha-icon>
        </button>
        <button
          class="preset-slider-nav next"
          @click=${(e: Event) => {
            e.stopPropagation();
            this._navigateSlider(sliderId, 1, images.length);
          }}
        >
          <ha-icon icon="mdi:chevron-right"></ha-icon>
        </button>

        <!-- Dots indicator -->
        <div class="preset-slider-dots">
          ${images.map(
            (_, index) => html`
              <div
                class="preset-slider-dot ${index === 0 ? 'active' : ''}"
                @click=${(e: Event) => {
                  e.stopPropagation();
                  this._goToSlide(sliderId, index, images.length);
                }}
              ></div>
            `
          )}
        </div>
      </div>
    `;
  }

  private _navigateSlider(sliderId: string, direction: number, totalImages: number): void {
    const slider = this.shadowRoot?.querySelector(`#${sliderId}`);
    if (!slider) return;

    const container = slider.querySelector('.preset-slider-container') as HTMLElement;
    const dots = slider.querySelectorAll('.preset-slider-dot');

    if (!container || !dots.length) return;

    // Get current slide index from transform
    const currentTransform = container.style.transform || 'translateX(0%)';
    const currentIndex = Math.abs(parseInt(currentTransform.match(/-?\d+/)?.[0] || '0') / 100);

    // Calculate new index
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = totalImages - 1;
    if (newIndex >= totalImages) newIndex = 0;

    // Update transform
    container.style.transform = `translateX(-${newIndex * 100}%)`;

    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === newIndex);
    });
  }

  private _goToSlide(sliderId: string, targetIndex: number, totalImages: number): void {
    const slider = this.shadowRoot?.querySelector(`#${sliderId}`);
    if (!slider) return;

    const container = slider.querySelector('.preset-slider-container') as HTMLElement;
    const dots = slider.querySelectorAll('.preset-slider-dot');

    if (!container || !dots.length) return;

    // Update transform
    container.style.transform = `translateX(-${targetIndex * 100}%)`;

    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === targetIndex);
    });
  }

  private _handleSliderMouseDown(e: MouseEvent, sliderId: string, totalImages: number): void {
    e.preventDefault();
    const startX = e.clientX;
    let isDragging = false;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      if (Math.abs(deltaX) > 10) {
        isDragging = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;

      if (isDragging && Math.abs(deltaX) > 50) {
        const direction = deltaX > 0 ? -1 : 1;
        this._navigateSlider(sliderId, direction, totalImages);
      }

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  private _handleSliderTouchStart(e: TouchEvent, sliderId: string, totalImages: number): void {
    const startX = e.touches[0].clientX;
    let isDragging = false;

    const handleTouchMove = (e: TouchEvent) => {
      const deltaX = e.touches[0].clientX - startX;
      if (Math.abs(deltaX) > 10) {
        isDragging = true;
        e.preventDefault(); // Prevent scrolling
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaX = e.changedTouches[0].clientX - startX;

      if (isDragging && Math.abs(deltaX) > 50) {
        const direction = deltaX > 0 ? -1 : 1;
        this._navigateSlider(sliderId, direction, totalImages);
      }

      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }
  private _renderPresetsTab(): TemplateResult {
    const categories = ['all', 'badges', 'layouts', 'widgets', 'custom'] as const;
    const presets = ucPresetsService.getPresetsByCategory(this._selectedPresetCategory);
    const wpStatus = ucPresetsService.getWordPressStatus();
    const wpCount = ucPresetsService.getWordPressPresetsCount();

    return html`
      <div class="presets-container">
        <!-- Header with WordPress status -->
        <div class="presets-header">
          <div class="preset-categories">
            ${categories.map(
              category => html`
                <button
                  class="category-btn ${this._selectedPresetCategory === category ? 'active' : ''}"
                  @click=${() => (this._selectedPresetCategory = category)}
                >
                  <ha-icon
                    icon="${category === 'all'
                      ? 'mdi:view-grid'
                      : category === 'badges'
                        ? 'mdi:account-circle'
                        : category === 'layouts'
                          ? 'mdi:view-dashboard'
                          : category === 'widgets'
                            ? 'mdi:widgets'
                            : 'mdi:puzzle'}"
                  ></ha-icon>
                  <span>${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                </button>
              `
            )}
          </div>

          ${wpStatus.error
            ? html`
                <div class="wordpress-status">
                  <div class="status-item error">
                    <ha-icon icon="mdi:alert-circle"></ha-icon>
                    <span>Failed to load presets</span>
                    <button
                      class="retry-btn"
                      @click=${() => ucPresetsService.refreshWordPressPresets()}
                      title="Retry loading presets"
                    >
                      <ha-icon icon="mdi:refresh"></ha-icon>
                    </button>
                  </div>
                </div>
              `
            : ''}
        </div>

        <!-- Presets Grid -->
        <div class="presets-grid">
          ${presets.length > 0
            ? presets.map(preset => {
                const isWpPreset = preset.id.startsWith('wp-');
                const isWjdDesigns = preset.author === 'WJD Designs';
                const isCommunity = isWpPreset && !isWjdDesigns;
                const isDefault = isWpPreset && isWjdDesigns;
                const wpPreset = preset as any;

                return html`
                  <div
                    class="preset-card ${isWpPreset
                      ? isCommunity
                        ? 'community-preset'
                        : 'default-preset'
                      : 'builtin-preset'}"
                    @click=${() => {
                      this._addPreset(preset);
                      // Track download for WordPress presets
                      if (isWpPreset) {
                        ucPresetsService.trackPresetDownload(preset.id);
                      }
                    }}
                  >
                    <!-- Header with badge, title, and stats -->
                    <div class="preset-header">
                      <div class="preset-header-left">
                        <div
                          class="origin-badge ${isCommunity
                            ? 'community'
                            : isDefault
                              ? 'default'
                              : 'builtin'}"
                        >
                          ${isCommunity ? 'Community' : isDefault ? 'Default' : 'Built-in'}
                        </div>
                        <div class="preset-title-info">
                          <h4 class="preset-header-title">${preset.name}</h4>
                          ${!isWjdDesigns
                            ? html`<span class="preset-header-author">by ${preset.author}</span>`
                            : ''}
                        </div>
                      </div>
                      <div class="preset-stats">
                        ${preset.metadata?.downloads
                          ? html`<span class="stat"
                              ><ha-icon icon="mdi:download"></ha-icon>${preset.metadata
                                .downloads}</span
                            >`
                          : ''}
                        ${isCommunity && preset.metadata?.rating && preset.metadata.rating > 0
                          ? html`<span class="stat"
                              ><ha-icon icon="mdi:star"></ha-icon>${preset.metadata.rating.toFixed(
                                1
                              )}${wpPreset.rating_count && wpPreset.rating_count > 1
                                ? ` (${wpPreset.rating_count})`
                                : ''}</span
                            >`
                          : ''}
                      </div>
                    </div>

                    <!-- Large preview image or slider -->
                    <div class="preset-preview">${this._renderPresetImages(preset, wpPreset)}</div>

                    <!-- Content section -->
                    <div class="preset-content">
                      <p class="preset-description">${preset.description}</p>

                      <!-- Tags and integrations -->
                      ${preset.tags.filter(
                        tag => !['community', 'wordpress', 'standard'].includes(tag)
                      ).length > 0 ||
                      (Array.isArray(wpPreset.integrations) && wpPreset.integrations.length > 0)
                        ? html`
                            <div class="preset-tags">
                              ${preset.tags
                                .filter(
                                  tag => !['community', 'wordpress', 'standard'].includes(tag)
                                )
                                .slice(0, 3)
                                .map(tag => html`<span class="tag">${tag}</span>`)}
                              ${Array.isArray(wpPreset.integrations) && wpPreset.integrations.length
                                ? wpPreset.integrations
                                    .slice(0, 2)
                                    .map(
                                      (i: string) =>
                                        html`<span class="integration-chip">${i}</span>`
                                    )
                                : ''}
                            </div>
                          `
                        : ''}
                    </div>

                    <!-- Action buttons at bottom -->
                    <div class="preset-actions">
                      <button
                        class="add-preset-btn primary"
                        @click=${(e: Event) => {
                          e.stopPropagation();
                          this._addPreset(preset);
                          if (isWpPreset) {
                            ucPresetsService.trackPresetDownload(preset.id);
                          }
                        }}
                        title="Add this preset to your card"
                      >
                        <ha-icon icon="mdi:plus"></ha-icon>
                        <span>Add</span>
                      </button>

                      ${isWpPreset
                        ? html`
                            <button
                              class="read-more-btn secondary"
                              @click=${(e: Event) => {
                                e.stopPropagation();
                                if (wpPreset.preset_url) {
                                  window.open(wpPreset.preset_url, '_blank');
                                }
                              }}
                              title="View full preset details on ultracard.io"
                            >
                              <ha-icon icon="mdi:open-in-new"></ha-icon>
                              <span>Read More</span>
                            </button>
                          `
                        : ''}
                    </div>
                  </div>
                `;
              })
            : html`<div class="empty-state">
                <ha-icon icon="mdi:palette-outline"></ha-icon>
                <p>No presets available in this category</p>
                ${wpStatus.error
                  ? html`<div class="error-details">
                      <p class="error-hint">
                        ${wpStatus.error.includes('CORS') ||
                        wpStatus.error.includes('Failed to fetch')
                          ? html`
                              <strong>Connection Issue:</strong> Unable to load presets from
                              ultracard.io.<br />
                              This usually happens when accessing Home Assistant via IP address
                              instead of homeassistant.local.<br /><br />
                              <strong>Solutions:</strong><br />
                              • Access HA via <code>http://homeassistant.local:8123</code> instead
                              of IP address<br />
                              • Or wait for the server CORS configuration to be updated<br />
                              • Check your internet connection
                            `
                          : html`Error: ${wpStatus.error}<br />Check your internet connection and
                              try refreshing.`}
                      </p>
                    </div>`
                  : ''}
              </div>`}
        </div>

        <!-- Reload Button at Bottom -->
        <div class="preset-footer">
          <button
            class="reload-btn ${wpStatus.loading ? 'loading' : ''}"
            @click=${() => ucPresetsService.refreshWordPressPresets()}
            title="Refresh presets from server"
            ?disabled=${wpStatus.loading}
          >
            <ha-icon icon="mdi:refresh" class="${wpStatus.loading ? 'spinning' : ''}"></ha-icon>
            <span>Reload</span>
          </button>
        </div>
      </div>
    `;
  }

  private _renderFavoritesTab(): TemplateResult {
    const favorites = ucFavoritesService.getFavorites();

    return html`
      <div class="favorites-container">
        <div class="favorites-header">
          <h4>Saved Favorites</h4>
          <button class="import-btn" @click=${() => (this._showImportDialog = true)}>
            <ha-icon icon="mdi:import"></ha-icon>
            <span>Import</span>
          </button>
        </div>

        <div class="favorites-grid">
          ${favorites.length > 0
            ? favorites.map(
                favorite => html`
                  <div class="favorite-card">
                    <div class="favorite-header">
                      <h4>${favorite.name}</h4>
                      <div class="favorite-actions">
                        <button
                          class="action-btn"
                          @click=${() => this._addFavorite(favorite)}
                          title="Add to layout"
                        >
                          <ha-icon icon="mdi:plus"></ha-icon>
                        </button>
                        <button
                          class="action-btn"
                          @click=${() => this._exportFavorite(favorite)}
                          title="Export"
                        >
                          <ha-icon icon="mdi:export"></ha-icon>
                        </button>
                        <button
                          class="action-btn delete"
                          @click=${() => this._deleteFavorite(favorite.id)}
                          title="Delete"
                        >
                          <ha-icon icon="mdi:delete"></ha-icon>
                        </button>
                      </div>
                    </div>
                    ${favorite.description
                      ? html`<p class="favorite-description">${favorite.description}</p>`
                      : ''}
                    <div class="favorite-meta">
                      <span class="favorite-date">
                        ${new Date(favorite.created).toLocaleDateString()}
                      </span>
                      ${favorite.tags.length > 0
                        ? html`<div class="favorite-tags">
                            ${favorite.tags
                              .slice(0, 2)
                              .map(tag => html`<span class="tag">${tag}</span>`)}
                          </div>`
                        : ''}
                    </div>
                  </div>
                `
              )
            : html`<div class="empty-state">
                <ha-icon icon="mdi:heart-outline"></ha-icon>
                <p>No favorites saved yet</p>
                <p class="empty-hint">Use the heart icon on any row to save it as a favorite</p>
              </div>`}
        </div>
      </div>
    `;
  }
  private _render3rdPartyTab(): TemplateResult {
    // Check Pro access (integration only)
    const integrationUser = ucCloudAuthService.checkIntegrationAuth(this.hass);
    const isPro =
      integrationUser?.subscription?.tier === 'pro' &&
      integrationUser?.subscription?.status === 'active';

    const availableCards = ucExternalCardsService.getAvailableCards();
    const popularCards = ucExternalCardsService.getPopularCards();
    const lang = this.hass?.locale?.language || 'en';

    // Refresh global count when tab is rendered
    this._refreshGlobalExternalCardCount();

    return html`
      <div class="thirdparty-container">
        <div class="thirdparty-header">
          <h4>3rd Party Cards</h4>
          <button class="refresh-btn" @click=${() => this._handleRefresh3rdPartyTab()}>
            <ha-icon icon="mdi:refresh"></ha-icon>
            <span>Refresh</span>
          </button>
        </div>

        ${!isPro
          ? html`
              <div class="limit-indicator">
                <ha-icon icon="mdi:information-outline"></ha-icon>
                <span
                  >${Math.min(this._globalExternalCardCount, 5)} / ${5} cards used across
                  dashboard</span
                >
                <div class="upgrade-section">
                  <span class="upgrade-text">Want Unlimited?</span>
                  <button class="get-pro-btn" @click=${this._openProPage}>Get Pro</button>
                </div>
              </div>
            `
          : html`
              <div class="pro-indicator">
                <ha-icon icon="mdi:crown"></ha-icon>
                <span>Unlimited Cards</span>
              </div>
            `}

        <div class="thirdparty-notebox">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <div class="notebox-content">
            <strong>Compatibility Notice:</strong>
            <p>
              Some 3rd party modules do not work as intended. Please let us know and we will look
              into it.
            </p>
          </div>
        </div>

        ${availableCards.length > 0
          ? html`
              <div class="thirdparty-section">
                <h5 class="section-title">Installed Cards (${availableCards.length})</h5>
                <div class="cards-grid">
                  ${availableCards.map(
                    card => html`
                      <div
                        class="card-item"
                        @click=${async () => await this._addCardFromTab(card.type)}
                      >
                        <div class="card-icon">
                          <ha-icon icon="mdi:card-bulleted"></ha-icon>
                        </div>
                        <div class="card-info">
                          <div class="card-name">${card.name}</div>
                          <div class="card-type">${card.type}</div>
                          ${card.version
                            ? html`<div class="card-version">v${card.version}</div>`
                            : ''}
                        </div>
                        <div class="card-add-hint">
                          <ha-icon icon="mdi:plus-circle"></ha-icon>
                        </div>
                      </div>
                    `
                  )}
                </div>
              </div>
            `
          : ''}
        ${popularCards.length > 0
          ? html`
              <div class="thirdparty-section popular-section">
                <h5 class="section-title">
                  ${availableCards.length > 0 ? 'Popular Cards' : 'Popular Cards (Not Installed)'}
                </h5>
                <div class="popular-cards-list">
                  ${popularCards.map(card => {
                    const isInstalled = ucExternalCardsService.isCardAvailable(card.type);
                    return html`
                      <div class="popular-card ${isInstalled ? 'installed' : 'not-installed'}">
                        <div class="popular-card-content">
                          <ha-icon
                            icon="${isInstalled ? 'mdi:check-circle' : 'mdi:information'}"
                            class="status-icon"
                          ></ha-icon>
                          <div class="popular-card-info">
                            <div class="popular-card-name">${card.name}</div>
                            <div class="popular-card-desc">${card.description}</div>
                          </div>
                        </div>
                        ${!isInstalled
                          ? html`
                              <a
                                href="${ucExternalCardsService.getHACSUrl(card.type) || '#'}"
                                target="_blank"
                                class="install-link"
                              >
                                <ha-icon icon="mdi:open-in-new"></ha-icon>
                                View
                              </a>
                            `
                          : html`<span class="installed-badge">Installed</span>`}
                      </div>
                    `;
                  })}
                </div>
              </div>
            `
          : ''}
        ${availableCards.length === 0 && popularCards.length === 0
          ? html`
              <div class="empty-state">
                <ha-icon icon="mdi:card-off"></ha-icon>
                <p>No 3rd party cards detected</p>
                <p class="empty-hint">Install custom cards via HACS to use them here</p>
              </div>
            `
          : ''}

        <div class="thirdparty-info">
          <ha-icon icon="mdi:information"></ha-icon>
          <div class="info-content">
            <strong>How to use:</strong>
            <p>
              Click any installed card to add it to your selected column. When you click the pencil
              to edit, the card's native editor will open automatically.
            </p>
          </div>
        </div>
      </div>

      <style>
        .thirdparty-container {
          padding: 20px;
          /* Removed overflow-y: auto to prevent nested scrolling - let .selector-body handle scrolling */
        }

        .thirdparty-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid var(--divider-color);
        }

        .thirdparty-header h4 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .refresh-btn {
          padding: 8px 16px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
          transition: background 0.2s;
        }

        .refresh-btn:hover {
          background: var(--primary-color-hover);
        }

        .thirdparty-notebox {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 152, 0, 0.1);
          border: 1px solid rgba(255, 152, 0, 0.3);
          border-radius: 8px;
          margin-bottom: 16px;
          align-items: flex-start;
        }

        .thirdparty-notebox ha-icon {
          color: #ff9800;
          --mdc-icon-size: 20px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .notebox-content {
          flex: 1;
          font-size: 13px;
          line-height: 1.5;
        }

        .notebox-content strong {
          display: block;
          margin-bottom: 4px;
          color: var(--primary-text-color);
          font-weight: 600;
        }

        .notebox-content p {
          margin: 0;
          color: var(--secondary-text-color);
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .limit-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--warning-color, #ff9800);
          color: white;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .limit-indicator ha-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .limit-indicator > span {
          flex: 1;
        }

        .upgrade-section {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
        }

        .upgrade-text {
          opacity: 0.9;
          font-weight: 500;
          white-space: nowrap;
        }

        .get-pro-btn {
          background: rgba(255, 255, 255, 0.25);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.5);
          padding: 6px 16px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .get-pro-btn:hover {
          background: rgba(255, 255, 255, 0.35);
          border-color: rgba(255, 255, 255, 0.8);
          transform: translateY(-1px);
        }

        .get-pro-btn:active {
          transform: translateY(0);
        }

        .upgrade-hint {
          margin-left: auto;
          opacity: 0.9;
          font-weight: 500;
        }

        .pro-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: var(--success-color, #4caf50);
          color: white;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
          font-weight: 500;
        }

        .thirdparty-section {
          margin-bottom: 32px;
        }

        .section-title {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--secondary-text-color);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 12px;
        }

        .card-item {
          padding: 16px;
          background: var(--card-background-color);
          border: 2px solid var(--divider-color);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .card-item:hover {
          border-color: var(--primary-color);
          box-shadow: 0 4px 12px rgba(var(--rgb-primary-color), 0.2);
          transform: translateY(-2px);
        }

        .card-item:active {
          transform: translateY(0px);
        }

        .card-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(var(--rgb-primary-color), 0.1);
          border-radius: 8px;
          flex-shrink: 0;
        }

        .card-icon ha-icon {
          --mdc-icon-size: 24px;
          color: var(--primary-color);
        }

        .card-info {
          flex: 1;
          min-width: 0;
        }

        .card-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--primary-text-color);
          margin-bottom: 4px;
        }

        .card-type {
          font-size: 12px;
          color: var(--secondary-text-color);
          font-family: 'Courier New', monospace;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-version {
          font-size: 11px;
          color: var(--secondary-text-color);
          margin-top: 2px;
        }

        .card-add-hint {
          opacity: 0.5;
          transition: opacity 0.2s;
          color: var(--primary-color);
        }

        .card-add-hint ha-icon {
          --mdc-icon-size: 24px;
        }

        .card-item:hover .card-add-hint {
          opacity: 1;
        }

        .popular-cards-list {
          display: grid;
          gap: 10px;
        }

        .popular-card {
          padding: 12px;
          background: var(--card-background-color);
          border: 1px solid var(--divider-color);
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .popular-card.not-installed {
          background: rgba(255, 152, 0, 0.05);
          border-color: rgba(255, 152, 0, 0.2);
        }

        .popular-card-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .status-icon {
          --mdc-icon-size: 20px;
          flex-shrink: 0;
        }

        .popular-card.installed .status-icon {
          color: #4caf50;
        }

        .popular-card.not-installed .status-icon {
          color: #ff9800;
        }

        .popular-card-info {
          flex: 1;
        }

        .popular-card-name {
          font-weight: 600;
          font-size: 13px;
          color: var(--primary-text-color);
        }

        .popular-card-desc {
          font-size: 12px;
          color: var(--secondary-text-color);
          margin-top: 2px;
        }

        .install-link {
          padding: 6px 12px;
          background: var(--primary-color);
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: background 0.2s;
          white-space: nowrap;
        }

        .install-link:hover {
          background: var(--primary-color-hover);
        }

        .installed-badge {
          padding: 6px 12px;
          background: rgba(76, 175, 80, 0.1);
          color: #4caf50;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .thirdparty-info {
          margin-top: 24px;
          padding: 16px;
          background: rgba(var(--rgb-primary-color), 0.05);
          border-radius: 8px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .thirdparty-info ha-icon {
          color: var(--primary-color);
          --mdc-icon-size: 20px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .info-content {
          flex: 1;
          font-size: 13px;
          line-height: 1.5;
        }

        .info-content strong {
          display: block;
          margin-bottom: 4px;
          color: var(--primary-text-color);
        }

        .info-content p {
          margin: 0;
          color: var(--secondary-text-color);
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: var(--secondary-text-color);
        }

        .empty-state ha-icon {
          --mdc-icon-size: 64px;
          opacity: 0.3;
          margin-bottom: 16px;
        }

        .empty-state p {
          margin: 8px 0;
        }

        .empty-hint {
          font-size: 13px;
          color: var(--secondary-text-color);
          opacity: 0.7;
        }

        /* Pro Access Overlay */
        .thirdparty-container.pro-locked {
          position: relative;
        }

        .thirdparty-container.pro-locked > :not(.pro-overlay) {
          filter: blur(8px);
          pointer-events: none;
          user-select: none;
        }

        .pro-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: ${Z_INDEX.EDITOR_CONTENT};
          background: rgba(0, 0, 0, 0.02);
        }

        .pro-overlay-content {
          background: var(--card-background-color);
          border-radius: 16px;
          padding: 48px 40px;
          max-width: 450px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          border: 2px solid var(--divider-color);
        }

        .pro-overlay-content ha-icon {
          --mdc-icon-size: 64px;
          color: var(--primary-color);
          opacity: 0.8;
          margin-bottom: 24px;
        }

        .pro-overlay-content h3 {
          margin: 0 0 16px 0;
          font-size: 24px;
          font-weight: 700;
          color: var(--primary-text-color);
        }

        .pro-overlay-content p {
          margin: 0 0 32px 0;
          font-size: 15px;
          line-height: 1.6;
          color: var(--secondary-text-color);
        }

        .upgrade-button,
        .signin-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          font-family: inherit;
        }

        .upgrade-button {
          background: linear-gradient(
            135deg,
            var(--primary-color) 0%,
            var(--accent-color, var(--primary-color)) 100%
          );
          color: white;
        }

        .upgrade-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(var(--rgb-primary-color), 0.4);
        }

        .signin-button {
          background: var(--primary-color);
          color: white;
        }

        .signin-button:hover {
          background: var(--primary-color-hover, var(--primary-color));
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(var(--rgb-primary-color), 0.4);
        }

        .upgrade-button ha-icon,
        .signin-button ha-icon {
          --mdc-icon-size: 20px;
          margin: 0;
          padding: 0;
          flex-shrink: 0;
        }
      </style>
    `;
  }

  private async _addCardFromTab(cardType: string): Promise<void> {
    // Check if a column is selected
    if (this._selectedRowIndex === -1 || this._selectedColumnIndex === -1) {
      // Show error message to user
      const lang = this.hass?.locale?.language || 'en';
      alert(
        localize(
          'editor.layout.select_column_first',
          lang,
          'Please select a column first by clicking "Add Module" on the column where you want to add this card.'
        )
      );
      return;
    }

    // Check Pro access and module limit (integration only)
    const integrationUser = ucCloudAuthService.checkIntegrationAuth(this.hass);
    const isPro =
      integrationUser?.subscription?.tier === 'pro' &&
      integrationUser?.subscription?.status === 'active';

    const currentCount = this._countExternalCardModules();
    const limit = 5;

    if (!isPro && currentCount >= limit) {
      this._showToast(
        `Free users are limited to ${limit} 3rd party cards. Upgrade to Pro for unlimited cards!`,
        'error'
      );
      return;
    }

    // Add the card with proper error handling
    try {
      await this._add3rdPartyCard(cardType);
    } catch (error) {
      console.error('[UC] Failed to add 3rd party card:', error);
      this._showToast(`Failed to add card: ${error?.message || 'Unknown error'}`, 'error');
    }
  }

  private _renderFavoriteDialog(): TemplateResult {
    if (!this._showFavoriteDialog || !this._favoriteRowToSave) {
      return html``;
    }

    return html`
      <uc-favorite-dialog
        .row=${this._favoriteRowToSave}
        .open=${this._showFavoriteDialog}
        @close=${() => {
          this._showFavoriteDialog = false;
          this._favoriteRowToSave = null;
        }}
        @saved=${(e: CustomEvent) => {
          this._showToast(`"${e.detail.name}" saved to favorites!`, 'success');
        }}
      ></uc-favorite-dialog>
    `;
  }

  private _renderImportDialog(): TemplateResult {
    return html`
      <uc-import-dialog
        .open=${this._showImportDialog}
        @close=${() => (this._showImportDialog = false)}
        @import=${this._handleImport}
      ></uc-import-dialog>
    `;
  }

  private _handleImport(e: CustomEvent<ExportData>): void {
    const importData = e.detail;

    if (importData.type === 'ultra-card-row') {
      // Check for entities in the imported row
      const rowData = importData.data as CardRow;
      const entityReferences = entityDetector.scanRow(rowData);

      if (entityReferences.length > 0) {
        // Show entity mapping dialog for row import
        this._showRowImportMappingDialog(
          rowData,
          entityReferences,
          importData.metadata?.name || 'Imported Row'
        );
      } else {
        // No entities, add row directly
        this._addImportedRow(rowData, importData.metadata?.name || 'Imported Row');
      }
    } else if (importData.type === 'ultra-card-layout') {
      // Replace entire layout (with confirmation)
      if (confirm('This will replace your entire layout. Are you sure?')) {
        const newLayout = importData.data as { rows: CardRow[] };
        this._updateLayout(newLayout);
        this._showToast(`Layout "${importData.metadata.name}" imported successfully!`, 'success');
      }
    } else if (importData.type === 'ultra-card-module') {
      // Add module to selected column
      if (this._selectedRowIndex >= 0 && this._selectedColumnIndex >= 0) {
        const layout = this._ensureLayout();
        const column = layout.rows[this._selectedRowIndex]?.columns[this._selectedColumnIndex];
        if (column) {
          const newModule = importData.data as CardModule;
          column.modules.push(newModule);
          this._updateLayout(layout);
          this._showToast(`Module "${importData.metadata.name}" imported successfully!`, 'success');
        }
      } else {
        this._showToast('Please select a column to add the module to', 'error');
      }
    }
  }
  private _showRowImportMappingDialog(
    rowData: CardRow,
    entityReferences: EntityReference[],
    rowName: string
  ): void {
    if (this._entityMappingOpen) {
      console.warn('Entity mapping dialog already open - ignoring duplicate open request');
      return;
    }
    this._entityMappingOpen = true;

    // Show the simple entity mapper dialog
    simpleEntityMapper.show(
      this.hass,
      `Map Entities for "${rowName}"`,
      entityReferences,
      (mappings: EntityMapping[]) => {
        console.log('✅ Apply row import mappings:', mappings);
        this._entityMappingOpen = false;
        this._addImportedRowWithMappings(rowData, mappings, rowName);
      },
      () => {
        console.log('❌ Cancel row import mapping');
        this._entityMappingOpen = false;
        // Cancel - add row with original entities (no mappings)
        this._addImportedRow(rowData, rowName);
      }
    );
  }
  private _addImportedRow(rowData: CardRow, rowName: string): void {
    const layout = this._ensureLayout();
    const newRow = this._cloneRowWithNewIds(rowData);

    // Insert after current selected row or at the end
    const insertIndex =
      this._selectedRowIndex >= 0 ? this._selectedRowIndex + 1 : layout.rows.length;
    layout.rows.splice(insertIndex, 0, newRow);

    this._updateLayout(layout);
    this._showToast(`Row "${rowName}" imported successfully!`, 'success');
  }

  private _addImportedRowWithMappings(
    rowData: CardRow,
    mappings: EntityMapping[],
    rowName: string
  ): void {
    const layout = this._ensureLayout();

    // Apply entity mappings to row
    const mappedRow = entityMapper.applyMappingToRow(rowData, mappings);
    const newRow = this._cloneRowWithNewIds(mappedRow);

    // Insert after current selected row or at the end
    const insertIndex =
      this._selectedRowIndex >= 0 ? this._selectedRowIndex + 1 : layout.rows.length;
    layout.rows.splice(insertIndex, 0, newRow);

    this._updateLayout(layout);
    this._showToast(
      `Row "${rowName}" imported successfully with ${mappings.length} entity mapping(s)!`,
      'success'
    );
  }

  // Layout Module Rules - centralized logic for layout module behavior
  private async _getDefaultCardConfig(cardType: string, fullCardType: string): Promise<any> {
    // Validate card type
    if (!cardType || cardType.trim() === '') {
      throw new Error('Card type is required');
    }

    // First try using HA's card creation helper if available
    try {
      const haHelper = await this._tryHACardHelper(fullCardType);
      if (haHelper && typeof haHelper === 'object') {
        return haHelper;
      }
    } catch (error) {}

    // Then try to get stub config from the card itself
    try {
      const stubConfig = await this._tryGetStubConfig(cardType);
      if (stubConfig && typeof stubConfig === 'object') {
        return stubConfig;
      }
    } catch (error) {}

    // Try hardcoded defaults for known problematic cards
    const hardcodedConfig = this._getHardcodedDefault(fullCardType);
    if (hardcodedConfig) {
      return hardcodedConfig;
    }

    // Only use minimal fallback if everything else fails
    return {
      type: fullCardType,
    };
  }
  private async _tryHACardHelper(fullCardType: string): Promise<any | null> {
    // Try to use Home Assistant's card helper to get default config
    // This leverages HA's own card creation mechanism
    if (!this.hass) return null;

    try {
      // Check if HA's card helper is available
      const helpers = (window as any).customCards;
      if (helpers && typeof helpers.createCardElement === 'function') {
        // Create a temporary config with just the type
        const tempConfig = { type: fullCardType };

        // Try to create the element to trigger any default config generation
        const element = await helpers.createCardElement(tempConfig);

        if (element && typeof element.getStubConfig === 'function') {
          const config = await element.getStubConfig();
          return config;
        }
      }

      // Try using HA's lovelace config if available
      const lovelace = (this.hass as any).lovelace;
      if (lovelace && lovelace.config && lovelace.config.views) {
        // Look for similar cards in the current dashboard
        for (const view of lovelace.config.views) {
          if (view.cards) {
            for (const card of view.cards) {
              if (card.type === fullCardType) {
                // Return a copy without any entity-specific data
                const template = { ...card };
                delete template.entity;
                delete template.entities;
                return template;
              }
            }
          }
        }
      }
    } catch (error) {}

    return null;
  }

  private _getHardcodedDefault(fullCardType: string): any | null {
    // Hardcoded defaults for cards that have known issues with getStubConfig
    const defaults: Record<string, any> = {
      'custom:apexcharts-card': {
        type: 'custom:apexcharts-card',
        header: {
          show: true,
          title: 'ApexCharts Card',
          show_states: true,
          colorize_states: true,
        },
        series: [
          {
            entity: 'sensor.temperature',
            data_generator: `// REMOVE ME\nconst now = new Date();\nconst data = [];\nfor(let i = 0; i <= 24; i++) {\n  data.push([now.getTime() - i * 1000 * 60 * 60, Math.floor((Math.random() * 10) + 1)])\n}\nreturn data.reverse();`,
          },
        ],
        graph_span: '24h',
      },
      'custom:button-card': {
        type: 'custom:button-card',
        entity: 'light.example',
        name: 'Example Light',
        icon: 'mdi:lightbulb',
        tap_action: {
          action: 'toggle',
        },
      },
      'custom:mini-graph-card': {
        type: 'custom:mini-graph-card',
        entities: [
          {
            entity: 'sensor.temperature',
          },
        ],
        hours_to_show: 24,
        points_per_hour: 4,
        line_width: 2,
        line_color: 'var(--primary-color)',
      },
      'custom:weather-card': {
        type: 'custom:weather-card',
        entity: 'weather.home',
        name: 'Weather',
      },
      'custom:vacuum-card': {
        type: 'custom:vacuum-card',
        entity: 'vacuum.robot',
        map: 'camera.vacuum_map',
      },
      'custom:fold-entity-row': {
        type: 'custom:fold-entity-row',
        head: {
          entity: 'group.all_lights',
          name: 'All Lights',
        },
        entities: [],
      },
    };

    return defaults[fullCardType] || null;
  }

  private async _tryGetStubConfig(cardType: string): Promise<any | null> {
    const elementName = cardType.startsWith('custom:') ? cardType.substring(7) : cardType;

    // Get the card element constructor
    const cardConstructor = customElements.get(elementName);
    if (!cardConstructor) {
      return null;
    }

    try {
      let stubConfigPromise: Promise<any> | null = null;

      // Try static method first (most common - used by ApexCharts, etc.)
      if (typeof (cardConstructor as any).getStubConfig === 'function') {
        try {
          // Some cards need hass passed as a parameter to the static method
          const result = (cardConstructor as any).getStubConfig(this.hass);
          stubConfigPromise = Promise.resolve(result);
        } catch (staticError) {
          console.warn(`[UC] Static getStubConfig threw error:`, staticError);
          // If static fails, try without parameters (some cards don't expect parameters)
          try {
            const result = (cardConstructor as any).getStubConfig();
            stubConfigPromise = Promise.resolve(result);
          } catch (noParamError) {
            console.warn(`[UC] Static getStubConfig (no params) also failed:`, noParamError);
            stubConfigPromise = null;
          }
        }

        if (!stubConfigPromise) {
        }
      }

      if (!stubConfigPromise) {
        // Try instance method (less common, but some cards use this)
        const element = document.createElement(elementName) as any;

        // Set hass on the element BEFORE calling getStubConfig
        if (this.hass) {
          element.hass = this.hass;
        }

        if (typeof element.getStubConfig === 'function') {
          stubConfigPromise = Promise.resolve(element.getStubConfig());
        } else {
          return null;
        }
      }

      // If we have a promise, race it with timeout
      if (stubConfigPromise) {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 2000)
        );

        const stubConfig = await Promise.race([stubConfigPromise, timeoutPromise]);
        return stubConfig;
      } else {
        return null;
      }
    } catch (error) {
      console.warn(`[UC] getStubConfig failed for ${cardType}:`, error);
      return null;
    }
  }

  private async _add3rdPartyCard(cardType: string): Promise<void> {
    if (this._selectedRowIndex === -1 || this._selectedColumnIndex === -1) {
      console.error('No row or column selected');
      return;
    }

    // Check Pro access (integration only)
    const integrationUser = ucCloudAuthService.checkIntegrationAuth(this.hass);
    const isPro =
      integrationUser?.subscription?.tier === 'pro' &&
      integrationUser?.subscription?.status === 'active';

    // For non-Pro users, check the global limit
    if (!isPro) {
      const currentGlobalCount = await this._countAllExternalCardModulesGlobally();

      if (currentGlobalCount >= 5) {
        // Show error toast
        this._showToast(
          'You have reached the maximum of 5 external cards across your dashboard. Upgrade to Ultra Card Pro for unlimited external cards.',
          'error'
        );
        return;
      }
    }

    const layout = this._ensureLayout();
    const row = layout.rows[this._selectedRowIndex];
    const column = row.columns[this._selectedColumnIndex];

    // Ensure card type has custom: prefix if needed
    let fullCardType = cardType;
    if (!cardType.startsWith('custom:') && !cardType.startsWith('hui-')) {
      fullCardType = `custom:${cardType}`;
    }

    // Get card info for better display name
    const cardInfo = ucExternalCardsService.getCardInfo(cardType);
    const cardName = cardInfo ? cardInfo.name : cardType;

    // Create external card module with better default config
    const defaultConfig = await this._getDefaultCardConfig(cardType, fullCardType);
    const newModule = {
      id: `external-card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'external_card' as const,
      name: cardName, // Use the card's friendly name
      card_type: cardType, // Store the original type (without custom: prefix)
      card_config: defaultConfig,
    };

    // Add to column
    const newLayout = {
      rows: layout.rows.map((r, rIndex) => {
        if (rIndex === this._selectedRowIndex) {
          return {
            ...r,
            columns: r.columns.map((c, cIndex) => {
              if (cIndex === this._selectedColumnIndex) {
                return {
                  ...c,
                  modules: [...(c.modules || []), newModule as any],
                };
              }
              return c;
            }),
          };
        }
        return r;
      }),
    };

    this._updateLayout(newLayout);
    this._showModuleSelector = false;

    // Invalidate cache immediately for instant lock status update
    import('../../modules/external-card-module').then(({ invalidateExternalCardCache }) => {
      invalidateExternalCardCache();
    });

    // Refresh the global count after adding
    await this._refreshGlobalExternalCardCount();

    // Open standard module settings popup immediately for configuration
    const moduleIndex = (column.modules || []).length;
    this._selectedModule = {
      rowIndex: this._selectedRowIndex,
      columnIndex: this._selectedColumnIndex,
      moduleIndex: moduleIndex,
    };
    this._showModuleSettings = true;

    // Check if the card has a native editor
    const editorType = `${cardType}-editor`;
    const editorElement = customElements.get(editorType);
    const hasEditor =
      editorElement !== undefined && !(editorElement.prototype instanceof HTMLUnknownElement);

    // If no native editor, switch to YAML tab
    this._activeModuleTab = hasEditor ? 'general' : 'yaml';
  }

  private _isLayoutModule(moduleType: string): boolean {
    const layoutModuleTypes = ['horizontal', 'vertical', 'slider'];
    return layoutModuleTypes.includes(moduleType);
  }

  private _shouldAutoOpenSettings(moduleType: string): boolean {
    // Layout modules should NOT auto-open settings
    if (this._isLayoutModule(moduleType)) {
      return false;
    }
    // All other modules should auto-open settings
    return true;
  }

  private _getLayoutModuleColor(moduleType: string): string {
    if (this._isLayoutModule(moduleType)) {
      return 'var(--success-color, #4caf50)';
    }
    return 'var(--accent-color, var(--orange-color, #ff9800))';
  }

  private _renderColumnLayoutSelector(): TemplateResult {
    const layout = this._ensureLayout();
    const currentRow = layout.rows[this._selectedRowForLayout];
    const currentColumnCount = currentRow ? currentRow.columns.length : 1;

    // Get the current layout ID, considering migration
    const currentLayoutId = currentRow?.column_layout || '1-col';
    const migratedLayoutId = this._migrateLegacyLayoutId(currentLayoutId);

    // Show only layouts for the current column count
    const availableLayouts = this._getLayoutsForColumnCount(currentColumnCount);

    return html`
      <div class="column-layout-selector-popup">
        <div class="popup-overlay" @click=${() => (this._showColumnLayoutSelector = false)}></div>
        <div class="selector-content draggable-popup" id="column-layout-selector-popup">
          <div
            class="selector-header"
            @mousedown=${(e: MouseEvent) => {
              const popup = (e.target as HTMLElement).closest('.selector-content') as HTMLElement;
              if (popup) this._startPopupDrag(e, popup);
            }}
          >
            <h3>Choose Column Layout</h3>
            <p>
              Select any layout for ${currentColumnCount}
              column${currentColumnCount !== 1 ? 's' : ''} (Currently: ${currentColumnCount}
              column${currentColumnCount !== 1 ? 's' : ''})
            </p>
          </div>

          <div class="selector-body">
            <div class="layout-options">
              ${availableLayouts.map(
                layout => html`
                  <button
                    class="layout-option-btn ${layout.id === currentLayoutId ||
                    layout.id === migratedLayoutId
                      ? 'current'
                      : ''}"
                    @click=${() => this._changeColumnLayout(layout.id)}
                    title="${layout.name}"
                  >
                    <div class="layout-visual">
                      <div class="layout-icon-large">
                        ${unsafeHTML(this._createColumnIconHTML(layout.proportions))}
                      </div>
                    </div>
                    <div class="layout-name">${layout.name}</div>
                    ${layout.id === currentLayoutId || layout.id === migratedLayoutId
                      ? html`<div class="current-badge">Current</div>`
                      : ''}
                  </button>
                `
              )}
            </div>
          </div>

          <!-- Resize handle -->
          <div
            class="resize-handle"
            @mousedown=${(e: MouseEvent) => {
              const popup = (e.target as HTMLElement).closest('.selector-content') as HTMLElement;
              if (popup) this._startPopupResize(e, popup);
            }}
            title="Drag to resize"
          >
            <ha-icon icon="mdi:resize-bottom-right"></ha-icon>
          </div>
        </div>
      </div>
    `;
  }
  static get styles() {
    return css`
      :host {
        --accent-color: var(--orange-color, #ff9800);
        --orange-color: #ff9800;
        --secondary-color: var(--orange-color, #ff9800);
      }

      .layout-builder {
        padding: 12px;
        background: var(--card-background-color);
        border-radius: 8px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .builder-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--divider-color);
        flex-wrap: wrap;
        gap: 8px;
        flex-shrink: 0;
      }

      .builder-header h3 {
        margin: 0;
        flex: 1;
        min-width: 120px;
        font-size: 18px;
      }

      .header-buttons {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .undo-btn,
      .redo-btn,
      .add-row-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        white-space: nowrap;
        font-weight: 500;
        transition: all 0.2s ease;
        min-height: 40px;
      }

      /* Mobile optimization for undo/redo buttons */
      @media (max-width: 768px) {
        .header-buttons {
          gap: 6px;
        }

        .undo-btn,
        .redo-btn {
          padding: 10px 12px;
          gap: 6px;
        }

        /* Hide text labels on mobile for undo/redo buttons to save space */
        .undo-btn span,
        .redo-btn span {
          display: none;
        }

        /* Ensure disabled buttons are visible on mobile with proper contrast */
        .undo-btn:disabled,
        .redo-btn:disabled {
          background: var(--disabled-color, #ccc) !important;
          color: var(--text-color, #999) !important;
          cursor: not-allowed !important;
          transform: none !important;
          box-shadow: none !important;
          opacity: 1 !important;
          display: flex !important;
        }

        .undo-btn:disabled ha-icon,
        .redo-btn:disabled ha-icon {
          opacity: 1 !important;
          --mdc-icon-size: 20px;
          color: var(--text-color, #999) !important;
        }

        /* Keep add row button text visible as it's the primary action */
        .add-row-btn {
          padding: 10px 16px;
        }
      }

      .undo-btn:hover,
      .redo-btn:hover,
      .add-row-btn:hover {
        background: var(--primary-color-dark, var(--primary-color));
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .undo-btn:disabled,
      .redo-btn:disabled {
        background: var(--disabled-color, #ccc);
        color: var(--text-color, #999);
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
        opacity: 1;
      }

      .undo-btn:disabled:hover,
      .redo-btn:disabled:hover {
        background: var(--disabled-color, #ccc);
        transform: none;
        box-shadow: none;
      }

      .row-builder {
        margin-bottom: 16px;
        border: 2px solid var(--primary-color);
        border-radius: 8px;
        background: var(--card-background-color);
        width: 100%;
        box-sizing: border-box;
        position: static;
        transition: all 0.2s ease;
        overflow: visible;
      }

      .row-builder:last-child {
        margin-bottom: 0;
      }

      .row-header {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 8px 12px;
        background: var(--primary-color);
        color: white;
        font-weight: 500;
        border-bottom: 2px solid var(--primary-color);
        position: relative;
        z-index: ${Z_INDEX.CARD_BACKGROUND};
        border-radius: 8px 8px 0px 0px;
      }

      .row-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      .row-title-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .row-title-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .column-layout-text {
        color: rgba(255, 255, 255, 0.9);
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
      }

      .row-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      .row-actions-left {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .row-actions-right {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      /* Icon sizes for both action groups */
      .row-actions-left button ha-icon,
      .row-actions-right button ha-icon {
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .row-name-top {
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        font-weight: 500;
        max-width: 20ch;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .row-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        color: rgba(255, 255, 255, 0.7);
        cursor: grab;
        opacity: 0.8;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 16px;
      }

      .row-drag-handle:hover {
        opacity: 1;
      }

      .row-drag-handle:active {
        cursor: grabbing;
      }

      .column-layout-btn {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        padding: 4px 8px;
        cursor: pointer;
        color: white;
        font-size: 14px;
        transition: all 0.2s ease;
        min-width: 32px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .column-layout-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
      }

      .layout-icon {
        font-family: monospace;
        font-weight: bold;
        letter-spacing: 1px;
      }

      .row-actions {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: flex-end;
      }

      /* Reduce icon sizes in row actions for better spacing */
      .row-actions button ha-icon {
        width: 18px;
        height: 18px;
      }

      /* Collapse button styles for rows */
      .row-collapse-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        padding: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        border-radius: 4px;
        width: 24px;
        height: 24px;
      }

      .row-collapse-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .row-collapse-btn ha-icon {
        transition: transform 0.2s ease;
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .row-duplicate-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 0;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
      }

      .row-duplicate-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .row-add-column-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 0;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
      }

      .row-add-column-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .row-settings-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 0;
        border-radius: 4px;
        transition: background-color 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
      }

      .row-settings-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .delete-row-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 0;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
      }

      .delete-row-btn:hover {
        background: rgba(255, 100, 100, 0.8);
        color: white;
      }

      .rows-container {
        flex: 1;
        min-height: 0;
        width: 100%;
        box-sizing: border-box;
      }

      .columns-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        padding: 12px;
        box-sizing: border-box;
        background: var(--card-background-color);
        border-top: 1px solid var(--primary-color);
      }

      /* Editor view: Force single column layout for better usability */
      .columns-container[data-layout='1-col'],
      .columns-container[data-layout='1-2-1-2'],
      .columns-container[data-layout='1-3-2-3'],
      .columns-container[data-layout='2-3-1-3'],
      .columns-container[data-layout='2-5-3-5'],
      .columns-container[data-layout='3-5-2-5'],
      .columns-container[data-layout='1-3-1-3-1-3'],
      .columns-container[data-layout='1-4-1-2-1-4'],
      .columns-container[data-layout='1-5-3-5-1-5'],
      .columns-container[data-layout='1-6-2-3-1-6'],
      .columns-container[data-layout='1-4-1-4-1-4-1-4'],
      .columns-container[data-layout='1-5-1-5-1-5-1-5'],
      .columns-container[data-layout='1-6-1-6-1-6-1-6'],
      .columns-container[data-layout='1-8-1-4-1-4-1-8'],
      .columns-container[data-layout='1-5-1-5-1-5-1-5'],
      .columns-container[data-layout='1-6-1-6-1-3-1-6-1-6'],
      .columns-container[data-layout='1-8-1-4-1-4-1-4-1-8'],
      .columns-container[data-layout='1-6-1-6-1-6-1-6-1-6-1-6'],
      /* Legacy support */
      .columns-container[data-layout='50-50'],
      .columns-container[data-layout='30-70'],
      .columns-container[data-layout='70-30'],
      .columns-container[data-layout='33-33-33'],
      .columns-container[data-layout='25-50-25'],
      .columns-container[data-layout='20-60-20'],
      .columns-container[data-layout='25-25-25-25'] {
        display: flex;
        flex-direction: column;
        gap: 8px;
        border: 1px solid var(--primary-color);
        margin-bottom: 16px;
        border-radius: 0px 0px 8px 8px;
      }

      .column-builder {
        border: 2px solid var(--accent-color, var(--orange-color, #ff9800));
        border-radius: 0px 0px 6px 6px;
        background: var(--card-background-color);
        width: 100%;
        box-sizing: border-box;
        overflow: visible;

        position: static;
      }

      .column-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
        padding: 8px 12px;
        background: var(--accent-color, var(--orange-color, #ff9800));
        color: white;
        border-bottom: 2px solid var(--accent-color, var(--orange-color, #ff9800));
        position: relative;
        z-index: ${Z_INDEX.MODULE_DECORATIVE};
        border-radius: 6px 6px 0px 0px;
      }

      .column-actions {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      /* Reduce icon sizes in column actions for better spacing */
      .column-actions button ha-icon {
        width: 20px;
        height: 20px;
      }

      /* Collapse button styles for columns */
      .column-collapse-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        transition: all 0.2s ease;
        border-radius: 4px;
      }

      .column-collapse-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .column-collapse-btn ha-icon {
        transition: transform 0.2s ease;
        width: 20px;
        height: 20px;
      }

      .column-add-module-btn,
      .column-duplicate-btn,
      .column-settings-btn,
      .column-delete-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        padding: 6px 8px;
        border-radius: 4px;
        transition: all 0.2s ease;
        font-size: 12px;
        min-width: 28px;
        min-height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .column-add-module-btn:hover,
      .column-duplicate-btn:hover,
      .column-settings-btn:hover {
        background: rgba(255, 255, 255, 0.25);
        color: white;
        transform: scale(1.05);
      }

      .column-delete-btn:hover:not([disabled]) {
        background: rgba(255, 100, 100, 0.9);
        color: white;
        transform: scale(1.05);
      }

      .column-delete-btn[disabled] {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none;
      }

      .column-delete-btn[disabled]:hover {
        background: none;
        transform: none;
      }

      .column-actions ha-icon {
        --mdc-icon-size: 16px;
      }

      .column-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .column-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        color: rgba(255, 255, 255, 0.7);
        cursor: grab;
        opacity: 0.8;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 14px;
      }

      .column-drag-handle:hover {
        opacity: 1;
      }

      .column-drag-handle:active {
        cursor: grabbing;
      }

      .modules-container {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
        box-sizing: border-box;
        padding: 12px;
        background: var(--card-background-color);
        border: 1px solid var(--secondary-color, var(--accent-color, #ff9800));
        border-top: none;
        border-radius: 0px 0px 6px 6px;
        margin-top: 0;

        position: static;
        overflow: visible;
      }

      .module-item {
        position: relative;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        margin-bottom: 8px;
        width: 100%;
        min-height: 60px;
        transition: border-color 0.2s ease;
        box-sizing: border-box;
        overflow: visible;
      }

      .module-item:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 12px rgba(var(--rgb-primary-color), 0.2);
        transform: translateY(-1px);
      }

      .module-content {
        padding: 8px;
        cursor: pointer;
        width: 100%;
        box-sizing: border-box;
        overflow: hidden;
        word-wrap: break-word;
        word-break: break-word;
        pointer-events: auto;
        position: relative;
        z-index: ${Z_INDEX.MODULE_CONTENT};

        /* Ensure content doesn't interfere with hover actions positioning */
        contain: layout style;
      }

      /* Simplified Module Styles */
      .simplified-module {
        padding: 12px;
        border-radius: 6px;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, #e0e0e0);
        width: 100%;
        box-sizing: border-box;
      }

      .simplified-module-header {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
      }

      .simplified-module-drag-handle {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color, #757575);
        cursor: grab;
        opacity: 0.6;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 16px;
      }

      .simplified-module:hover .simplified-module-drag-handle {
        opacity: 1;
      }

      .simplified-module-drag-handle:active {
        cursor: grabbing;
      }

      .simplified-module-icon {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color, #2196f3);
        color: white;
        border-radius: 6px;
        --mdc-icon-size: 20px;
      }

      .simplified-module-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .simplified-module-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color, #212121);
        line-height: 1.3;
        margin: 0;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      .simplified-module-info {
        font-size: 12px;
        color: var(--secondary-text-color, #757575);
        line-height: 1.2;
        margin: 0;
        opacity: 0.8;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      .simplified-module-actions {
        display: flex;
        gap: 4px;
        align-items: center;
        flex-shrink: 0;
      }

      .simplified-action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0;
      }

      .simplified-action-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .simplified-action-btn.edit-btn {
        color: var(--primary-color, #2196f3);
        border-color: var(--primary-color, #2196f3);
      }

      .simplified-action-btn.edit-btn:hover {
        background: var(--primary-color, #2196f3);
        color: white;
      }

      .simplified-action-btn.duplicate-btn {
        color: var(--info-color, #2196f3);
        border-color: var(--info-color, #2196f3);
      }

      .simplified-action-btn.duplicate-btn:hover {
        background: var(--info-color, #2196f3);
        color: white;
      }

      .simplified-action-btn.delete-btn {
        color: var(--error-color, #f44336);
        border-color: var(--error-color, #f44336);
      }

      .simplified-action-btn.delete-btn:hover {
        background: var(--error-color, #f44336);
        color: white;
      }

      .simplified-action-btn ha-icon {
        --mdc-icon-size: 14px;
      }

      /* Disable animations within layout builder modules */
      .module-content * {
        max-width: 100%;
        box-sizing: border-box;
        animation: none !important;
        transition: none !important;
      }

      .module-content *:hover {
        transform: none !important;
        animation: none !important;
        transition: none !important;
      }

      .module-content img {
        max-width: 100%;
        height: auto;
        display: block;
      }
      .add-module-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px;
        border: 2px dashed var(--divider-color);
        border-radius: 4px;
        background: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        width: 100%;
        box-sizing: border-box;
        font-size: 13px;
        min-height: 36px;
      }

      .add-module-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .add-column-container {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px 12px 12px 12px;
        width: 100%;
        box-sizing: border-box;
      }

      .add-column-btn {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px 12px;
        border: 2px dashed var(--secondary-text-color);
        border-radius: 6px;
        background: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 13px;
        width: 100%;
        min-height: 40px;
        box-sizing: border-box;
      }

      .add-column-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
        background: var(--primary-color-light, rgba(33, 150, 243, 0.05));
      }

      .add-column-btn ha-icon {
        --mdc-icon-size: 20px;
      }

      /* Empty Row Message */
      .empty-row-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px 16px;
        border: 2px dashed var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--secondary-text-color);
        text-align: center;
        min-height: 120px;
      }

      .empty-row-message p {
        margin: 0 0 8px 0;
        font-size: 14px;
        opacity: 0.8;
      }

      /* Module Selector Popup */
      .module-selector-popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: ${Z_INDEX.MODULE_POPUP_OVERLAY};
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .popup-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
      }

      .selector-content {
        position: relative;
        background: var(--card-background-color);
        border-radius: 8px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow: visible; /* allow resize handle to be positioned relative to this container */
        display: flex;
        flex-direction: column;
      }

      .selector-body {
        overflow-x: hidden; /* prevent bleed */
        overflow-y: auto; /* allow vertical scrolling when content exceeds height */
        max-height: inherit;
        padding: 0 24px 28px 24px; /* consistent horizontal padding, leave room for resize handle */
        flex: 1; /* take up remaining space */
        border-radius: 0 0 8px 8px; /* maintain bottom border radius */
        /* Ensure content doesn't hide under header */
        position: relative;
        z-index: ${Z_INDEX.MODULE_CONTENT};
      }

      /* Improve mobile scrolling behavior */
      @media (max-width: 768px) {
        .selector-body {
          padding: 0 16px 20px 16px; /* Reduce padding on mobile */
          /* Ensure proper scrolling on mobile */
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
      }

      .selector-content.draggable-popup {
        position: fixed; /* Use fixed positioning for better control */
        width: min(700px, 95vw);
        height: min(750px, 90vh);
        /* Use transform for better centering on all devices */
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: ${Z_INDEX.SELECTOR_POPUP};
        max-width: calc(100vw - 40px); /* Ensure 20px padding on each side */
        max-height: calc(100vh - 40px); /* Ensure 20px padding on top/bottom */
      }

      /* Mobile optimization for selector popup */
      @media (max-width: 768px), (max-height: 768px) {
        .selector-content.draggable-popup {
          width: calc(100vw - 20px) !important; /* Full width with 10px padding each side */
          height: calc(100vh - 40px) !important; /* Full height with 20px padding top/bottom */
          max-width: none !important; /* Remove max-width constraint on mobile */
          max-height: none !important; /* Remove max-height constraint on mobile */
          /* Ensure proper centering on mobile */
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          margin: 0 !important;
        }

        /* Ensure header content stays properly aligned on mobile */
        .selector-header-top {
          flex-wrap: nowrap;
          align-items: center;
          justify-content: space-between;
        }

        .selector-header h3 {
          flex: 1;
          min-width: 0; /* Allow text to truncate if needed */
          margin-right: 12px;
        }

        .selector-header .close-button {
          flex-shrink: 0; /* Prevent close button from shrinking */
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 0; /* Remove auto margin on mobile */
        }
      }

      .selector-header-wrapper {
        position: sticky; /* keep header and tabs visible while scrolling */
        top: 0;
        z-index: ${Z_INDEX.POPUP_STICKY_ELEMENTS};
        background: var(--card-background-color);
        border-radius: 8px 8px 0 0; /* maintain top border radius */
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        margin-bottom: 16px; /* Space between sticky header/tabs and content */
      }

      .selector-header {
        padding: 20px 24px 16px;
        cursor: move;
        user-select: none;
        background: var(--card-background-color);
      }

      .selector-header-top {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        white-space: nowrap;
      }

      .selector-header h3 {
        margin: 0; /* align vertically with X */
        flex: 1; /* push the X to the far right */
      }

      .selector-subtitle {
        margin: 8px 0 0 0;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }

      .selector-header .close-button {
        margin-left: auto; /* ensure it sits on the same row to the right */
        background: none;
        border: none;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        color: var(--secondary-text-color);
      }

      .selector-header .close-button:hover {
        color: var(--primary-color);
      }

      .module-stats {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .category-title {
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: var(--primary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .module-types {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .module-type-btn {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
        width: 100%;
        min-height: 60px;
      }

      .module-type-btn:hover {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
      }

      /* Ensure text elements are white on hover */
      .module-type-btn:hover .module-title,
      .module-type-btn:hover .module-description {
        color: white !important;
      }

      .module-type-btn ha-icon {
        font-size: 32px;
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color);
        color: white;
        border-radius: 8px;
      }

      .module-type-btn:hover ha-icon {
        background: white;
        color: var(--primary-color);
      }

      .module-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
        flex: 1;
      }

      .module-title {
        font-weight: 500;
        font-size: 16px;
        color: var(--primary-text-color);
      }

      .module-description {
        font-size: 14px;
        color: var(--secondary-text-color);
        line-height: 1.3;
      }

      .module-author,
      .module-version {
        display: none; /* Hide for cleaner look */
      }

      /* Module Category Styles */
      .module-category {
        margin-bottom: 24px;
      }

      .category-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .category-description {
        font-size: 14px;
        color: var(--secondary-text-color);
        margin: 0 0 16px 0;
        line-height: 1.4;
      }

      /* Layout Module Specific Styles */
      .layout-modules .module-type-btn.layout-module {
        position: relative;
        border: 2px solid var(--success-color, #4caf50);
        background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.1));
      }

      .layout-modules .module-type-btn.horizontal-layout {
        border-color: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.vertical-layout {
        border-color: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.layout-module:hover {
        border-color: var(--success-color, #4caf50);
        background: var(--success-color, #4caf50);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
      }

      .layout-modules .module-type-btn.horizontal-layout:hover {
        border-color: var(--success-color, #4caf50);
        background: var(--success-color, #4caf50);
        color: white;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
      }

      .layout-modules .module-type-btn.vertical-layout:hover {
        border-color: var(--success-color, #4caf50);
        background: var(--success-color, #4caf50);
        color: white;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
      }

      /* Ensure layout module text is white on hover */
      .layout-modules .module-type-btn.layout-module:hover .module-title,
      .layout-modules .module-type-btn.layout-module:hover .module-description,
      .layout-modules .module-type-btn.horizontal-layout:hover .module-title,
      .layout-modules .module-type-btn.horizontal-layout:hover .module-description,
      .layout-modules .module-type-btn.vertical-layout:hover .module-title,
      .layout-modules .module-type-btn.vertical-layout:hover .module-description {
        color: white !important;
      }

      .layout-modules .module-type-btn.layout-module ha-icon {
        background: var(--success-color, #4caf50);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.2);
      }

      .layout-modules .module-type-btn.horizontal-layout ha-icon {
        background: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.vertical-layout ha-icon {
        background: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.layout-module:hover ha-icon {
        background: white;
        color: var(--success-color, #4caf50);
        border-color: rgba(0, 0, 0, 0.1);
      }

      .layout-modules .module-type-btn.horizontal-layout:hover ha-icon {
        color: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.vertical-layout:hover ha-icon {
        color: var(--success-color, #4caf50);
      }

      .layout-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        background: var(--success-color, #4caf50);
        color: white;
        font-size: 9px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        opacity: 0.9;
      }

      .layout-modules .module-type-btn.horizontal-layout .layout-badge {
        background: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.vertical-layout .layout-badge {
        background: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.layout-module:hover .layout-badge {
        background: rgba(255, 255, 255, 0.2);
        opacity: 1;
      }

      /* Content Module Styles */
      .content-modules .module-type-btn.content-module {
        border: 1px solid var(--divider-color);
      }

      .content-modules .module-type-btn.content-module:hover {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
      }

      /* Ensure content module text is white on hover */
      .content-modules .module-type-btn.content-module:hover .module-title,
      .content-modules .module-type-btn.content-module:hover .module-description {
        color: white !important;
      }

      /* Column Layout Selector Popup */
      .column-layout-selector-popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: ${Z_INDEX.MODULE_POPUP_CONTENT};
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .layout-options {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-top: 16px;
      }

      .layout-option-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px 12px;
        border: 2px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
        min-height: 80px;
        gap: 8px;
      }

      .layout-option-btn:hover {
        border-color: var(--primary-color);
        background: var(--primary-color-light, rgba(33, 150, 243, 0.1));
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .layout-option-btn.current {
        border-color: var(--primary-color);
        background: var(--primary-color-light, rgba(33, 150, 243, 0.1));
        position: relative;
      }

      .layout-option-btn.current .layout-icon-large {
        color: var(--primary-color);
      }

      .current-badge {
        position: absolute;
        top: 4px;
        right: 4px;
        background: var(--primary-color);
        color: white;
        font-size: 8px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .layout-visual {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 32px;
      }

      .layout-icon-large {
        font-family: monospace;
        font-weight: bold;
        font-size: 20px;
        letter-spacing: 2px;
        color: var(--primary-color);
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .layout-name {
        font-size: 12px;
        font-weight: 500;
        color: var(--primary-text-color);
        line-height: 1.2;
      }

      .module-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 16px;
        border: 1px dashed var(--divider-color);
        border-radius: 4px;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      .error-message {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: var(--error-color);
        color: white;
        border-radius: 4px;
        font-size: 14px;
      }

      /* General Settings Popup Styles */
      .settings-popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: ${Z_INDEX.LAYOUT_CHILD_POPUP};
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 20px;
        overflow-y: hidden; /* scrolling handled inside content to support sticky header */
        overflow-x: visible;
      }

      .settings-tabs {
        display: flex;
        border-bottom: 1px solid var(--divider-color);
        position: sticky;
        top: 0;
        z-index: ${Z_INDEX.POPUP_TABS};
        background: var(--card-background-color);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        /* Don't use isolation: isolate - it prevents fixed dropdowns from escaping */
      }

      .settings-tab {
        flex: 1;
        padding: 12px 16px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--secondary-text-color);
        font-size: 14px;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
      }

      .settings-tab:hover {
        color: var(--primary-color);
      }

      .settings-tab.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      .settings-tab-content {
        padding: 24px;
        flex: 1 1 auto;
        min-height: 0; /* allow parent to control height */
        overflow-y: auto;
        overflow-x: visible; /* allow dropdowns to render outside */
        /* Keep content BELOW sticky tabs */
        position: relative;
        z-index: 1;
      }

      /* Module Settings Popup */
      .module-settings-popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: ${Z_INDEX.MODULE_POPUP_CONTENT};
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 20px;
        overflow-y: hidden; /* scrolling handled inside popup-content for sticky header */
        overflow-x: visible;
      }

      .popup-content {
        position: relative;
        background: var(--card-background-color);
        border-radius: 8px;
        width: 720px;
        min-height: 480px;
        max-width: 98vw;
        max-height: 98vh;
        overflow: visible; /* allow resize handle to be positioned relative to this container */
        display: flex;
        flex-direction: column;
      }

      .popup-body {
        overflow-y: auto; /* scrolling handled by popup body, not the main container */
        overflow-x: visible; /* allow dropdowns to render outside horizontally */
        flex: 1;
        padding-bottom: 28px; /* leave room so content doesn't sit under the resize handle */
      }

      /* Dropdown positioning fixes for popup context -
         ensure menus anchor to fields inside transformed draggable popups */
      .popup-content ha-select,
      .selector-content ha-select,
      .popup-content mwc-select,
      .popup-content ha-combo-box {
        position: relative !important;
        overflow: visible !important;
        z-index: ${Z_INDEX.DROPDOWN_SELECT} !important;
      }

      .popup-content ha-select .mdc-select__menu,
      .popup-content ha-select mwc-menu,
      .popup-content ha-select .mdc-menu,
      .popup-content ha-select ha-menu,
      .popup-content mwc-menu,
      .popup-content ha-menu,
      .popup-content .mdc-menu-surface,
      .selector-content ha-select .mdc-select__menu,
      .selector-content ha-select mwc-menu,
      .selector-content ha-select .mdc-menu,
      .selector-content ha-select ha-menu {
        /* Let HA position menus; we only ensure visibility */
        z-index: ${Z_INDEX.DROPDOWN_MENU} !important;
        max-height: 300px !important;
        overflow-y: auto !important;
        max-width: min(360px, 95vw) !important;
      }

      /* Ensure native editor dropdowns appear above module popup tabs */
      /* CRITICAL: Use fixed menu positioning like HA does in tile-card */
      .module-tab-content ha-select,
      .settings-tab-content ha-select,
      .module-tab-content mwc-select,
      .module-tab-content ha-combo-box,
      .module-tab-content mwc-menu-surface {
        position: relative !important;
        z-index: ${Z_INDEX.DROPDOWN_SELECT} !important;
      }

      /* Add fixed menu positioning attribute behavior */
      .module-tab-content ha-select[fixedmenuposition],
      .settings-tab-content ha-select[fixedmenuposition] {
        --mdc-menu-max-height: 400px;
      }

      /* Force ALL dropdown menus to appear above everything - ultra aggressive targeting */
      .module-tab-content ha-select::part(menu),
      .module-tab-content mwc-select::part(menu),
      .module-tab-content ha-select .mdc-menu-surface,
      .module-tab-content mwc-menu-surface,
      .module-tab-content ha-select mwc-menu,
      .module-tab-content ha-select ha-menu,
      .module-tab-content ha-list-item,
      .settings-tab-content ha-select::part(menu),
      .settings-tab-content mwc-select::part(menu),
      .settings-tab-content ha-select .mdc-menu-surface,
      .settings-tab-content mwc-menu-surface,
      .settings-tab-content ha-select mwc-menu,
      .settings-tab-content ha-select ha-menu,
      .settings-tab-content ha-list-item {
        z-index: 99999 !important;
        position: fixed !important;
      }

      /* Target the actual menu that renders in shadow DOM */
      .module-tab-content ha-select,
      .settings-tab-content ha-select {
        --mdc-menu-z-index: 99999 !important;
        --ha-select-menu-z-index: 99999 !important;
      }

      /* Global dropdown override - ensures any HA dropdown appears above popup tabs */
      ha-menu,
      mwc-menu,
      mwc-menu-surface,
      .mdc-menu-surface {
        z-index: 99999 !important;
      }

      /* Allow dropdown overflow; keep inner content scrollable */
      .popup-content {
        /* Allow dropdowns to overflow the scrolling container */
        overflow: visible !important;
      }

      .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid var(--divider-color);
        position: sticky; /* keep header visible while scrolling */
        top: 0;
        z-index: 0;
        background: var(--card-background-color);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
      }

      .close-button {
        background: none;
        border: none;
        font-size: 32px;
        cursor: pointer;
        color: var(--secondary-text-color);
        padding: 0;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }

      .close-button:hover {
        color: var(--primary-color);
      }
      .action-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .action-button ha-icon {
        --mdc-icon-size: 20px;
      }

      .duplicate-button {
        color: var(--primary-color);
      }

      .duplicate-button:hover {
        background: var(--primary-color);
        color: white;
      }

      .delete-button {
        color: var(--error-color);
      }

      .delete-button:hover {
        background: var(--error-color);
        color: white;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      /* Drag and Resize Functionality */
      .draggable-popup {
        position: absolute;
        /* Avoid transforms so fixed-position menus anchor to viewport correctly */
        transform: none !important;
        max-width: none;
        max-height: none;
        width: min(700px, 95vw);
        height: min(750px, 90vh);
        /* Center the popup initially */
        /* Use margins for centering instead of transforms to not create a containing block */
        top: 50%;
        left: 50%;
        margin-left: -350px; /* half of width when 700px; will be clamped by max-width */
        margin-top: -375px; /* half of height when 750px; responsive will adjust */
        /* Reset translate centering */
        /* transform already set to none above */
        z-index: ${Z_INDEX.MODULE_POPUP_OVERLAY};
      }

      /* During drag/resize, remove centering transform and use absolute positioning */
      .draggable-popup.popup-dragging,
      .draggable-popup.popup-resizing {
        position: absolute;
        transform: none;
        /* left and top will be set by JavaScript during drag */
      }

      /* Selector popup drag positioning */
      .selector-content.popup-dragging {
        position: absolute;
        transform: none;
        /* left and top will be set by JavaScript during drag */
      }

      /* Mobile optimization for module popups */
      @media (max-width: 768px), (max-height: 768px) {
        .draggable-popup {
          /* Use transform-based centering for better mobile compatibility */
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: calc(100vw - 20px) !important;
          height: calc(100vh - 40px) !important;
          margin: 0 !important;
          max-width: none !important;
          max-height: none !important;
        }
        /* Remove move affordance on mobile */
        .popup-header {
          cursor: default;
        }
        /* Hide resize handle on mobile */
        .draggable-popup .resize-handle {
          display: none;
        }
      }

      .popup-header {
        cursor: move;
        user-select: none;
      }

      .resize-handle {
        position: absolute;
        bottom: 0px;
        right: 0px;
        width: 20px;
        height: 20px;
        cursor: se-resize;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color);
        background: var(--card-background-color);
        border-radius: 8px 0 8px 0;
        transition: all 0.2s ease;
        z-index: ${Z_INDEX.RESIZE_HANDLE}; /* ensure it stays above all content including scrollable areas */
        pointer-events: auto; /* ensure it's always clickable */
      }

      /* Keep sticky behavior even during drag/resize */
      .draggable-popup .resize-handle {
        transform: none !important;
      }

      .resize-handle:hover {
        color: var(--primary-color);
        background: var(--divider-color);
      }

      .resize-handle ha-icon {
        --mdc-icon-size: 16px;
      }

      .popup-dragging {
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
        z-index: ${Z_INDEX.POPUP_TABS} !important;
      }

      .popup-resizing {
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
        transition: none !important;
      }

      .popup-resizing * {
        transition: none !important;
      }

      /* Override any conflicting styles for resizable elements */
      .draggable-popup.popup-resizing {
        max-width: none !important;
        max-height: none !important;
        width: auto !important;
        height: auto !important;
      }

      .popup-dragging .popup-header,
      .popup-resizing .popup-header {
        cursor: move;
      }

      .popup-dragging .resize-handle,
      .popup-resizing .resize-handle {
        pointer-events: none;
      }

      /* Selector popup drag behavior - above popup tabs when dragging */
      .selector-content.popup-dragging {
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
        z-index: ${Z_INDEX.POPUP_TABS + 10} !important;
      }

      .selector-content.popup-dragging .selector-header {
        cursor: move;
      }

      .selector-content.popup-dragging .resize-handle {
        pointer-events: none;
      }

      /* Module Preview */
      .module-preview {
        margin: 16px 24px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden; /* prevent content from overflowing the preview container */
        max-width: 100%;
        transition: all 0.3s ease;
      }

      /* Pinned preview - sticky positioning */
      .module-preview.pinned {
        position: sticky;
        top: 16px;
        z-index: 1;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-color: var(--primary-color);
        background: var(--card-background-color);
      }

      /* Ensure pinned preview header also has solid background */
      .module-preview.pinned .preview-header {
        background: var(--secondary-background-color);
      }

      /* Ensure pinned preview content has solid background */
      .module-preview.pinned .preview-content {
        background: var(
          --view-background,
          var(--lovelace-background, var(--primary-background-color))
        );
      }

      .preview-header {
        padding: 12px 16px;
        background: var(--secondary-background-color);
        font-weight: 500;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .preview-pin-icon {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .preview-pin-icon:hover {
        color: var(--primary-color);
        transform: scale(1.15);
      }

      .preview-pin-icon.pinned {
        color: var(--primary-color);
        transform: rotate(45deg);
      }

      .preview-pin-icon.pinned:hover {
        transform: rotate(45deg) scale(1.15);
      }

      .preview-caret {
        --mdc-icon-size: 20px;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .preview-caret:hover {
        color: var(--primary-color);
      }

      .preview-content {
        padding: 16px;
        min-height: 60px;
        display: block;
        max-width: 100%;
        overflow: hidden; /* ensure preview content doesn't overflow */
        background: var(
          --view-background,
          var(--lovelace-background, var(--primary-background-color))
        );
      }

      /* Module Tabs - sticky at top, above scrolling content */
      .module-tabs {
        display: flex;
        border-bottom: 1px solid var(--divider-color);
        z-index: ${Z_INDEX.BASE_CONTENT};
        background: var(--card-background-color);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        /* Don't use isolation: isolate - it prevents fixed dropdowns from escaping */
      }

      .module-tab {
        flex: 1;
        padding: 12px 16px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--secondary-text-color);
        font-size: 14px;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
      }

      .module-tab:hover {
        color: var(--primary-color);
      }

      .module-tab.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      .module-tab-content {
        padding: 24px;
        flex: 1;
        overflow-y: auto; /* body scrolls */
        overflow-x: visible; /* allow dropdown menus to render outside content column */
        width: 100%;
        box-sizing: border-box;
        min-height: 0; /* Allow flex child to shrink below content size */
        /* Keep content BELOW sticky tabs */
        position: relative;
        z-index: 0;
      }

      /* Design Subtabs */
      .design-subtabs {
        display: flex;
        margin-bottom: 16px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        overflow: hidden;
      }

      .design-subtab {
        flex: 1;
        padding: 8px 12px;
        background: var(--secondary-background-color);
        border: none;
        cursor: pointer;
        color: var(--secondary-text-color);
        font-size: 12px;
        transition: all 0.2s ease;
      }

      .design-subtab:hover {
        color: var(--primary-color);
      }

      .design-subtab.active {
        background: var(--primary-color);
        color: white;
      }

      /* Settings Sections */
      .settings-section {
        margin-bottom: 20px;
        width: 100%;
        box-sizing: border-box;
      }

      .settings-section label {
        display: block;
        font-weight: 500;
        margin-bottom: 8px;
        font-size: 14px;
        color: var(--primary-text-color);
        width: 100%;
        box-sizing: border-box;
      }

      /* Color Section Styling */
      .color-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .color-picker-wrapper {
        display: flex;
        align-items: center;
      }

      .color-picker-wrapper ultra-color-picker {
        width: 100%;
        max-width: 300px;
      }

      /* Font Dropdown Styling */
      .font-dropdown {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        font-family: inherit;
      }

      .font-dropdown:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .font-dropdown optgroup {
        font-weight: 600;
        color: var(--secondary-text-color);
        background: var(--card-background-color);
        padding: 4px 0;
      }

      .font-dropdown option {
        padding: 4px 8px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      /* Font Size Input Styling */
      .font-size-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .font-size-input:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      /* Enhanced Alignment Buttons */
      .alignment-buttons {
        display: flex;
        gap: 6px;
        margin-top: 4px;
      }

      .alignment-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        padding: 0;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .alignment-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .alignment-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .alignment-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      .settings-section input,
      .settings-section select,
      .settings-section textarea {
        width: 100%;
        max-width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        box-sizing: border-box;
      }

      .settings-section textarea {
        min-height: 60px;
        resize: vertical;
      }

      /* Gap control container styles */
      .gap-control-container {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
      }

      .gap-slider {
        flex: 1;
        min-width: 0;
        -webkit-appearance: none;
        appearance: none;
        height: 6px;
        border-radius: 3px;
        background: var(--divider-color);
        outline: none;
        opacity: 0.7;
        transition: opacity 0.2s;
      }

      .gap-slider:hover {
        opacity: 1;
      }

      .gap-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;
      }

      .gap-slider::-webkit-slider-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
      }

      .gap-slider::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;
      }

      .gap-slider::-moz-range-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
      }

      .gap-slider::-moz-range-track {
        height: 6px;
        border-radius: 3px;
        background: var(--divider-color);
        border: none;
      }

      .gap-input {
        flex: 0 0 60px;
        min-width: 60px;
        max-width: 60px;
        text-align: center;
        padding: 6px 8px !important;
      }

      /* Ensure form elements fit properly */
      .settings-section ha-form {
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }

      /* Ensure color pickers fit properly */
      .settings-section ultra-color-picker {
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }

      /* Consistent styling for all module settings */
      .module-tab-content .settings-section,
      .settings-tab-content .settings-section {
        border-radius: 8px;
        padding: 16px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        margin-bottom: 16px;
      }

      .module-tab-content .settings-section:last-child,
      .settings-tab-content .settings-section:last-child {
        margin-bottom: 0;
      }

      /* Enhanced input field styling for consistency */
      .module-tab-content input[type='number'],
      .module-tab-content input[type='text'],
      .module-tab-content input[type='color'],
      .module-tab-content select,
      .module-tab-content textarea,
      .settings-tab-content input[type='number'],
      .settings-tab-content input[type='text'],
      .settings-tab-content input[type='color'],
      .settings-tab-content select,
      .settings-tab-content textarea {
        width: 100%;
        max-width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        font-family: inherit;
        box-sizing: border-box;
        transition: border-color 0.2s ease;
      }

      .module-tab-content input:focus,
      .module-tab-content select:focus,
      .module-tab-content textarea:focus,
      .settings-tab-content input:focus,
      .settings-tab-content select:focus,
      .settings-tab-content textarea:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      /* Range sliders consistent styling */
      .module-tab-content input[type='range'],
      .settings-tab-content input[type='range'] {
        width: 100%;
        height: 6px;
        border-radius: 3px;
        background: var(--divider-color);
        outline: none;
        -webkit-appearance: none;
      }

      .module-tab-content input[type='range']::-webkit-slider-thumb,
      .settings-tab-content input[type='range']::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
      }

      /* Checkbox and radio button styling */
      .module-tab-content input[type='checkbox'],
      .module-tab-content input[type='radio'],
      .settings-tab-content input[type='checkbox'],
      .settings-tab-content input[type='radio'] {
        width: auto;
        margin-right: 8px;
        accent-color: var(--primary-color);
      }

      /* Label styling for form elements */
      .module-tab-content label,
      .settings-tab-content label {
        display: block;
        font-weight: 500;
        margin-bottom: 8px;
        font-size: 14px;
        color: var(--primary-text-color);
        line-height: 1.4;
      }

      /* Field groups */
      .module-tab-content .field-group,
      .settings-tab-content .field-group {
        gap: 12px;
        align-items: flex-end;
      }

      .module-tab-content .field-group > div,
      .settings-tab-content .field-group > div {
        flex: 1;
      }

      /* Button Groups */
      .alignment-buttons,
      .format-buttons {
        display: flex;
        gap: 4px;
      }

      .alignment-btn,
      .format-btn {
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .alignment-btn:hover,
      .format-btn:hover {
        border-color: var(--primary-color);
      }

      .alignment-btn.active,
      .format-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      /* Value Position Buttons for Bar Module */
      .value-position-buttons {
        display: flex;
        gap: 8px;
      }

      .position-btn {
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .position-btn:hover {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .position-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      /* Spacing Grid */
      .spacing-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }

      .spacing-section h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 500;
      }

      .spacing-cross {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
        align-items: center;
        max-width: 120px;
        margin: 0 auto;
      }

      .spacing-row {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 8px;
        align-items: center;
      }

      .spacing-center {
        width: 32px;
        height: 32px;
        background: var(--primary-color);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        font-weight: bold;
        font-size: 12px;
      }

      .spacing-cross input {
        width: 60px;
        text-align: center;
        padding: 4px 8px;
        font-size: 12px;
      }

      /* Module Rendering */
      .text-module {
        word-wrap: break-word;
      }

      .separator-module {
        width: 100%;
      }

      .image-module {
        text-align: center;
      }
      .image-placeholder {
        padding: 20px;
        border: 2px dashed var(--divider-color);
        border-radius: 4px;
        color: var(--secondary-text-color);
        font-style: italic;
      }
      .module-placeholder {
        padding: 20px;
        text-align: center;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      /* Logic Tab Styles */
      .logic-tab-content {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 16px;
      }

      .logic-section {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid var(--divider-color);
      }

      .section-header h3 {
        margin: 0 0 16px 0;
        color: var(--primary-text-color);
        font-size: 18px;
        font-weight: 600;
      }

      .display-mode-dropdown {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        min-height: 48px;
      }

      /* Conditions Section */
      .conditions-section {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid var(--divider-color);
      }

      .conditions-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .conditions-header h4 {
        margin: 0;
        color: var(--primary-text-color);
        font-size: 16px;
        font-weight: 600;
      }

      .add-condition-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .add-condition-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      .add-condition-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      .conditions-list {
        display: flex;
        flex-direction: column;
        gap: 14px; /* slightly larger separation between condition cards */
      }

      .no-conditions {
        text-align: center;
        padding: 32px;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      /* Individual Condition Item */
      .condition-item {
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 0;
        transition: all 0.2s ease;
      }

      .condition-item.disabled {
        opacity: 0.6;
      }

      .condition-item:hover {
        border-color: var(--primary-color);
      }

      .condition-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: var(--card-background-color);
        border-radius: 8px 8px 0 0;
        border-bottom: 1px solid var(--divider-color);
      }

      .condition-header-left {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }

      .condition-toggle {
        background: none;
        border: none;
        color: var(--primary-text-color);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background 0.2s ease;
      }

      .condition-toggle:hover {
        background: var(--secondary-background-color);
      }

      .condition-toggle ha-icon {
        --mdc-icon-size: 18px;
        transition: transform 0.2s ease;
      }

      .condition-toggle.expanded ha-icon {
        transform: rotate(0deg);
      }

      .condition-label {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .condition-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .condition-action-btn {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        padding: 6px;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .condition-action-btn:hover {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      .condition-action-btn.delete:hover {
        background: var(--error-color);
        color: white;
      }

      .condition-action-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      .condition-drag-handle {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: grab;
        padding: 6px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .condition-drag-handle:hover {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      .condition-drag-handle:active {
        cursor: grabbing;
      }

      /* Condition Content */
      .condition-content {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .condition-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 8px; /* add breathing room between stacked fields */
      }

      .condition-field label {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 14px;
        display: block;
        margin: 0 0 8px 0;
        text-transform: capitalize;
      }

      .condition-field select,
      .condition-field input,
      .condition-field textarea {
        padding: 10px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        transition: border-color 0.2s ease;
      }

      .condition-field select:focus,
      .condition-field input:focus,
      .condition-field textarea:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .condition-enable-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: normal !important;
        cursor: pointer;
      }

      /* Condition Type Specific Styles */
      .entity-condition-fields,
      .time-condition-fields,
      .custom-field-condition,
      .template-condition {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .time-inputs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .condition-info {
        margin: 0;
        padding: 8px 12px;
        background: var(--info-color, #2196f3);
        color: white;
        border-radius: 6px;
        font-size: 12px;
        text-align: center;
      }

      .template-help {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-style: italic;
        margin-top: 4px;
      }

      /* Template Section */
      .template-section {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid var(--divider-color);
      }

      .template-header {
        margin-bottom: 16px;
      }

      .template-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: var(--primary-text-color);
        cursor: pointer;
      }

      .template-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .template-editor {
        min-height: 120px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.4;
        resize: vertical;
      }

      @media (max-width: 768px) {
        .columns-container {
          flex-direction: column;
        }

        .column-builder {
          border-right: none;
          border-bottom: 1px solid var(--divider-color);
        }

        .column-builder:last-child {
          border-bottom: none;
        }

        /* Single column module grid on mobile */
        .module-types {
          grid-template-columns: 1fr;
        }

        /* Hide green layout badge on mobile to avoid conflict with title */
        .layout-badge {
          display: none !important;
        }

        .spacing-grid {
          grid-template-columns: 1fr;
        }

        .time-inputs {
          grid-template-columns: 1fr;
        }
      }

      /* Logic Module Dimming */
      .module-with-logic {
        position: relative;
      }

      .module-with-logic.logic-hidden {
        opacity: 0.4;
        filter: grayscale(50%);
      }

      .logic-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: 500;
        border-radius: 4px;
        pointer-events: none;
        z-index: ${Z_INDEX.CARD_BACKGROUND};
      }

      .logic-overlay ha-icon {
        --mdc-icon-size: 20px;
        margin-bottom: 4px;
      }

      .logic-overlay span {
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
      }

      /* Toggle Switch Styles */
      .switch-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
      }

      .switch-label {
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 16px;
      }

      .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
      }

      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--switch-unchecked-color, #ccc);
        transition: 0.3s;
        border-radius: 24px;
      }

      .slider:before {
        position: absolute;
        content: '';
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      input:checked + .slider {
        background-color: var(--primary-color);
      }

      input:focus + .slider {
        box-shadow: 0 0 1px var(--primary-color);
      }

      input:checked + .slider:before {
        transform: translateX(26px);
      }

      .slider.round {
        border-radius: 24px;
      }

      .slider.round:before {
        border-radius: 50%;
      }

      /* Disabled state for conditions */
      .disabled-note {
        font-size: 12px;
        color: var(--warning-color, #ff9800);
        font-style: italic;
        font-weight: normal;
      }

      .template-description {
        font-size: 14px;
        color: var(--secondary-text-color);
        line-height: 1.4;
        margin: 4px 0 12px 0;
      }

      /* Animation keyframes and classes for preview windows */
      @keyframes pulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }

      @keyframes vibrate {
        0%,
        100% {
          transform: translateX(0);
        }
        10%,
        30%,
        50%,
        70%,
        90% {
          transform: translateX(-2px);
        }
        20%,
        40%,
        60%,
        80% {
          transform: translateX(2px);
        }
      }

      @keyframes rotate-left {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(-360deg);
        }
      }

      @keyframes rotate-right {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes hover {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      @keyframes fade {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      @keyframes scale {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
      }

      @keyframes bounce {
        0%,
        20%,
        50%,
        80%,
        100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-10px);
        }
        60% {
          transform: translateY(-5px);
        }
      }

      @keyframes shake {
        0%,
        100% {
          transform: translateX(0);
        }
        10%,
        30%,
        50%,
        70%,
        90% {
          transform: translateX(-5px);
        }
        20%,
        40%,
        60%,
        80% {
          transform: translateX(5px);
        }
      }

      @keyframes tada {
        0% {
          transform: scale(1);
        }
        10%,
        20% {
          transform: scale(0.9) rotate(-3deg);
        }
        30%,
        50%,
        70%,
        90% {
          transform: scale(1.1) rotate(3deg);
        }
        40%,
        60%,
        80% {
          transform: scale(1.1) rotate(-3deg);
        }
        100% {
          transform: scale(1) rotate(0);
        }
      }

      .animation-pulse {
        animation-name: pulse;
        animation-iteration-count: infinite;
      }

      .animation-vibrate {
        animation-name: vibrate;
        animation-iteration-count: infinite;
      }

      .animation-rotate-left {
        animation-name: rotate-left;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
      }

      .animation-rotate-right {
        animation-name: rotate-right;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
      }

      .animation-hover {
        animation-name: hover;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
      }

      .animation-fade {
        animation-name: fade;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
      }

      .animation-scale {
        animation-name: scale;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
      }

      .animation-bounce {
        animation-name: bounce;
        animation-iteration-count: infinite;
      }

      .animation-shake {
        animation-name: shake;
        animation-timing-function: cubic-bezier(0.36, 0.07, 0.19, 0.97);
        animation-iteration-count: infinite;
      }

      .animation-tada {
        animation-name: tada;
        animation-iteration-count: infinite;
      }

      /* Row and Column Preview Styles */
      .row-preview-content {
        display: flex;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        min-height: 60px;
        align-items: center;
        justify-content: space-around;
      }

      .column-preview {
        flex: 1;
        padding: 12px;
        margin: 0 4px;
        background: var(--accent-color);
        color: white;
        border-radius: 4px;
        text-align: center;
        font-size: 14px;
        font-weight: 500;
      }

      .column-preview-content {
        padding: 16px;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        text-align: center;
        background: var(--secondary-background-color);
        min-height: 60px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .column-preview-content p {
        margin: 0 0 8px 0;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      /* Background filter support for previews - use pseudo-element to avoid blurring content */
      .row-preview-content.has-background-filter,
      .column-preview-content.has-background-filter {
        position: relative;
        isolation: isolate;
      }

      .row-preview-content.has-background-filter::before,
      .column-preview-content.has-background-filter::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: inherit;
        background-image: var(--bg-image);
        background-size: var(--bg-size);
        background-position: var(--bg-position);
        background-repeat: var(--bg-repeat);
        filter: var(--bg-filter);
        border-radius: inherit;
        z-index: -1;
        pointer-events: none;
      }

      .module-count {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      /* Drag and Drop Styles */
      .row-builder[draggable='true'],
      .column-builder[draggable='true'],
      .module-item[draggable='true'] {
        cursor: grab;
      }

      .row-builder[draggable='true']:hover,
      .column-builder[draggable='true']:hover,
      .module-item[draggable='true']:hover {
        cursor: grab;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .row-builder[draggable='true']:active,
      .column-builder[draggable='true']:active,
      .module-item[draggable='true']:active {
        cursor: grabbing;
        transform: scale(0.98);
      }

      /* Invalid drop target indication */
      :host([dragging-column]) .module-item,
      :host([dragging-row]) .module-item,
      :host([dragging-row]) .column-builder {
        cursor: not-allowed !important;
        opacity: 0.5;
        pointer-events: auto;
      }
      .drop-target {
        box-shadow: 0 0 20px rgba(var(--rgb-primary-color), 0.6) !important;
        background: rgba(var(--rgb-primary-color), 0.1) !important;
        transform: scale(1.02) !important;
        transition: all 0.2s ease !important;
      }
      .drop-target.row-builder {
        border-color: var(--primary-color) !important;
        border-width: 3px !important;
        border-style: dashed !important;
      }
      .drop-target.column-builder {
        border-color: var(--primary-color) !important;
        border-width: 3px !important;
        border-style: dashed !important;
      }

      .drop-target.module-item {
        border-color: var(--primary-color) !important;
        border-width: 2px !important;
        border-style: dashed !important;
      }

      /* Drag handle indicators (disabled) */
      /* We now render explicit drag handles inside headers. The legacy
         pseudo-element indicators caused duplicate icons on mobile. */
      .row-header::before,
      .column-header::before,
      .module-content::before {
        content: none !important; /* hide legacy indicators */
      }

      /* Module item hover effect - consolidated with action display */
      .module-item:hover {
        border-color: var(--primary-color) !important;
      }

      .row-header {
        position: relative;
      }

      .column-header {
        position: relative;
      }

      .module-content {
        position: relative;
      }

      /* Visual feedback during drag */
      .row-builder[draggable='true'][style*='opacity: 0.5'] {
        background: rgba(var(--rgb-primary-color), 0.1) !important;
        border: 2px dashed var(--primary-color) !important;
      }

      .column-builder[draggable='true'][style*='opacity: 0.5'] {
        background: rgba(var(--rgb-primary-color), 0.1) !important;
        border: 2px dashed var(--primary-color) !important;
      }

      .module-item[draggable='true'][style*='opacity: 0.5'] {
        background: rgba(var(--rgb-primary-color), 0.1) !important;
        border: 2px dashed var(--primary-color) !important;
      }

      /* Enhanced modules container styling */
      .modules-container {
        min-height: 80px;
        position: relative;
        transition: all 0.2s ease;
      }

      /* Module Name Field Styling */
      .module-name-input {
        width: 100%;
        max-width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        font-family: inherit;
        box-sizing: border-box;
      }

      .module-name-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      .field-help {
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.4;
        margin-top: 4px;
        font-style: italic;
      }

      /* Note: Image module still shows "Image Name" field from the registry.
         This will need to be addressed in the image module itself to remove
         the duplicate field since we now have universal "Module Name" above. */

      .modules-container:empty {
        border: 2px dashed var(--divider-color);
        background: var(--secondary-background-color);
      }

      .modules-container:empty::before {
        content: 'Drop modules here or click Add Module';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--secondary-text-color);
        font-style: italic;
        font-size: 13px;
        pointer-events: none;
        text-align: center;
      }

      .modules-container::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border: 2px dashed transparent;
        border-radius: 6px;
        pointer-events: none;
        transition: all 0.2s ease;
        z-index: 1;
      }

      .column-builder.drop-target .modules-container::after {
        border-color: var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.1);
      }

      /* Layout Module Styles - Column-like appearance */
      .layout-module-container {
        border: 2px solid var(--success-color, #4caf50);
        border-radius: 6px;
        background: var(--card-background-color);
        width: 100%;
        box-sizing: border-box;
        overflow: visible;
        margin-bottom: 8px;
      }

      .layout-module-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
        padding: 8px 12px;
        background: var(--success-color, #4caf50);
        color: white;
        border-bottom: 2px solid var(--success-color, #4caf50);
        border-radius: 0px;
      }

      .layout-module-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .layout-module-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        color: rgba(255, 255, 255, 0.7);
        cursor: grab;
        opacity: 0.8;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 14px;
      }

      .layout-module-drag-handle:hover {
        opacity: 1;
      }

      .layout-module-drag-handle:active {
        cursor: grabbing;
      }

      .layout-module-actions {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .layout-module-add-btn,
      .layout-module-settings-btn,
      .layout-module-duplicate-btn,
      .layout-module-delete-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
        --mdc-icon-size: 16px;
      }

      .layout-module-add-btn:hover,
      .layout-module-settings-btn:hover,
      .layout-module-duplicate-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .layout-module-delete-btn:hover {
        background: rgba(255, 100, 100, 0.8);
        color: white;
      }

      .layout-modules-container {
        background: var(--card-background-color);
        border: 2px dashed var(--divider-color);
        border-radius: 4px;
        margin: 8px;
        transition: all 0.2s ease;
        position: relative;
      }

      .layout-modules-container:hover {
        border-color: var(--success-color, #4caf50);
        background: rgba(76, 175, 80, 0.05);
      }

      .layout-modules-container.layout-drop-target {
        border-color: var(--primary-color) !important;
        border-width: 3px !important;
        border-style: dashed !important;
        background: rgba(var(--rgb-primary-color), 0.1) !important;
        box-shadow: 0 0 20px rgba(var(--rgb-primary-color), 0.3) !important;
      }

      .layout-module-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--secondary-text-color);
        font-style: italic;
        text-align: center;
        padding: 24px;
        width: 100%;
        cursor: pointer;
        user-select: none;
        transition:
          color 0.2s ease,
          opacity 0.2s ease;
      }

      .layout-module-empty ha-icon {
        --mdc-icon-size: 32px;
        opacity: 0.7;
      }

      .layout-module-empty:hover ha-icon {
        opacity: 1;
      }

      .layout-child-module-wrapper {
        width: 100%;
        box-sizing: border-box;
        cursor: grab;
      }

      .layout-child-module-wrapper:active {
        cursor: grabbing;
      }

      /* Simplified layout child module styling */
      .layout-child-simplified-module {
        width: 100%;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        transition: all 0.2s ease;
        cursor: pointer;
        box-sizing: border-box;
        margin-bottom: 8px;
      }

      .layout-child-simplified-module:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }

      .layout-child-simplified-module:hover .layout-child-content {
        color: var(--primary-text-color);
      }

      .layout-child-simplified-module:active {
        cursor: grabbing;
        transform: scale(0.98);
      }

      .layout-child-module-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        min-height: 40px;
        box-sizing: border-box;
      }

      .layout-child-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
        flex-shrink: 0;
      }

      .layout-child-content {
        flex: 1;
        min-width: 0;
      }

      .layout-child-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 2px;
      }

      .layout-child-info {
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .layout-child-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        color: var(--secondary-text-color);
        cursor: grab;
        opacity: 0.6;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 14px;
      }

      .layout-child-drag-handle:hover {
        opacity: 1;
        color: var(--primary-color);
      }

      .layout-child-drag-handle:active {
        cursor: grabbing;
      }

      .layout-child-actions {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .layout-child-action-btn {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
        --mdc-icon-size: 14px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .layout-child-action-btn.edit-btn:hover {
        background: var(--primary-color);
        color: white;
      }

      .layout-child-action-btn.delete-btn:hover {
        background: var(--error-color);
        color: white;
      }

      /* Drag handle for touch devices */
      @media (hover: none) {
        /* On touch devices, show action buttons on tap/focus */
        .module-item:active .module-hover-overlay,
        .module-item:focus-within .module-hover-overlay {
          opacity: 1;
          visibility: visible;
        }

        .module-action-btn {
          width: 36px;
          height: 36px;
        }

        .module-action-btn ha-icon {
          --mdc-icon-size: 20px;
        }
      }

      /* Module Selector Tabs */
      .module-selector-tabs {
        display: flex;
        border-bottom: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        /* Tabs are inside sticky wrapper, no separate positioning needed */
        /* Ensure tabs don't overflow on mobile */
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE/Edge */
      }

      .module-selector-tabs::-webkit-scrollbar {
        display: none; /* Chrome/Safari */
      }

      .tab-button {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 16px;
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        border-bottom: 2px solid transparent;
      }

      .tab-button:hover {
        color: var(--primary-color);
        background: var(--primary-color-10);
      }

      .tab-button.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
        background: var(--primary-color-10);
      }

      .tab-button ha-icon {
        --mdc-icon-size: 18px;
      }

      /* Layout Containers spacing */
      .module-category.layout-containers {
        margin-top: 20px;
      }

      /* Presets Tab */
      .presets-container {
        padding: 16px;
      }

      .preset-categories {
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
        flex-wrap: wrap;
        justify-content: center;
      }

      .category-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 20px;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 12px;
      }

      .category-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .category-btn.active {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: white;
      }

      .category-btn ha-icon {
        --mdc-icon-size: 14px;
      }

      .presets-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 20px;
      }

      .preset-card {
        display: flex;
        flex-direction: column;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .preset-card:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }

      /* WordPress preset specific styles */
      .presets-header {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 24px;
        align-items: center;
      }

      .preset-footer {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 16px 0;
        border-top: 1px solid var(--divider-color);
        margin-top: 16px;
      }

      .reload-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 20px;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 12px;
        font-weight: 500;
      }

      .reload-btn:hover:not(:disabled) {
        border-color: var(--primary-color);
        color: var(--primary-color);
        background: var(--card-background-color);
      }

      .reload-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .reload-btn ha-icon {
        --mdc-icon-size: 14px;
        transition: transform 0.6s ease;
      }

      .reload-btn ha-icon.spinning {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .wordpress-status {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .status-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        background: var(--secondary-background-color);
        color: var(--secondary-text-color);
      }

      .status-item.loading {
        background: rgba(var(--rgb-primary-color), 0.1);
        color: var(--primary-color);
      }

      .status-item.error {
        background: rgba(var(--rgb-error-color, 244, 67, 54), 0.1);
        color: var(--error-color, #f44336);
      }

      .status-item.success {
        background: rgba(var(--rgb-success-color, 76, 175, 80), 0.1);
        color: var(--success-color, #4caf50);
      }

      .status-item ha-icon {
        --mdc-icon-size: 16px;
      }

      .spinning {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .retry-btn,
      .refresh-btn {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        margin-left: 8px;
      }

      .retry-btn:hover,
      .refresh-btn:hover {
        background: rgba(0, 0, 0, 0.1);
        transform: scale(1.1);
      }

      .retry-btn ha-icon,
      .refresh-btn ha-icon {
        --mdc-icon-size: 14px;
      }

      /* Preset header with badge, title, and stats */
      .preset-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: rgba(var(--rgb-primary-color), 0.02);
        border-bottom: 1px solid var(--divider-color);
        gap: 12px;
      }

      .preset-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
      }

      .preset-title-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;
      }

      .preset-header-title {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .preset-header-author {
        font-size: 11px;
        color: var(--secondary-text-color);
        font-style: italic;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Origin badge styles */
      .preset-header .origin-badge {
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        flex-shrink: 0;
      }

      /* Different styles for different badge types */
      .preset-header .origin-badge.community {
        background: rgba(var(--rgb-secondary-color, 255, 152, 0), 0.9);
        color: white;
        border: 1px solid rgba(var(--rgb-secondary-color, 255, 152, 0), 1);
      }

      .preset-header .origin-badge.default {
        background: rgba(var(--rgb-primary-color), 0.9);
        color: white;
        border: 1px solid rgba(var(--rgb-primary-color), 1);
      }

      .preset-header .origin-badge.builtin {
        background: rgba(var(--rgb-secondary-text-color), 0.8);
        color: white;
        border: 1px solid rgba(var(--rgb-secondary-text-color), 0.9);
      }

      /* Large preview section */
      .preset-preview {
        position: relative;
        width: 100%;
        height: 200px;
        background: var(--secondary-background-color);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        padding: 8px;
        box-sizing: border-box;
      }

      .preset-thumbnail {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        overflow: hidden;
        position: relative;
      }

      .preset-thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        transition: transform 0.3s ease;
      }

      .preset-card:hover .preset-thumbnail img {
        transform: scale(1.05);
      }

      /* Image slider styles */
      .preset-image-slider {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
        border-radius: 8px;
      }
      .preset-slider-container {
        display: flex;
        width: 100%;
        height: 100%;
        transition: transform 0.3s ease;
        cursor: grab;
      }
      .preset-slider-container:active {
        cursor: grabbing;
      }
      .preset-slider-image {
        flex: 0 0 100%;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .preset-slider-image img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        transition: transform 0.3s ease;
      }

      .preset-card:hover .preset-slider-image img {
        transform: scale(1.05);
      }

      /* Slider navigation dots */
      .preset-slider-dots {
        position: absolute;
        bottom: 8px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 6px;
        z-index: 2;
      }

      .preset-slider-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid rgba(0, 0, 0, 0.2);
      }

      .preset-slider-dot.active {
        background: rgba(255, 255, 255, 0.9);
        transform: scale(1.2);
      }

      .preset-slider-dot:hover {
        background: rgba(255, 255, 255, 0.8);
      }

      /* Slider navigation arrows */
      .preset-slider-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(0, 0, 0, 0.5);
        color: white;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transition: all 0.2s ease;
        z-index: 2;
      }

      .preset-image-slider:hover .preset-slider-nav {
        opacity: 1;
      }

      .preset-slider-nav:hover {
        background: rgba(0, 0, 0, 0.7);
        transform: translateY(-50%) scale(1.1);
      }

      .preset-slider-nav.prev {
        left: 8px;
      }

      .preset-slider-nav.next {
        right: 8px;
      }

      .preset-slider-nav ha-icon {
        font-size: 16px;
      }

      .preset-icon-large {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 80px;
        height: 80px;
        background: rgba(var(--rgb-primary-color), 0.1);
        border-radius: 50%;
        color: var(--primary-color);
      }

      .preset-icon-large ha-icon {
        font-size: 40px;
      }

      /* Content section */
      .preset-content {
        padding: 16px;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .preset-description {
        margin: 0;
        font-size: 13px;
        line-height: 1.4;
        color: var(--secondary-text-color);
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      /* Action buttons at bottom */
      .preset-actions {
        display: flex;
        gap: 8px;
        padding: 12px 16px;
        border-top: 1px solid var(--divider-color);
        background: var(--card-background-color);
      }

      .preset-actions button {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        flex: 1;
        justify-content: center;
        min-height: 40px;
      }

      .preset-actions button ha-icon {
        font-size: 16px;
      }

      /* Primary button (Add) */
      .add-preset-btn.primary {
        background: var(--primary-color);
        color: white;
        border: none;
      }

      .add-preset-btn.primary:hover {
        background: var(--primary-color);
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(var(--rgb-primary-color), 0.3);
      }

      /* Secondary button (Read More) */
      .read-more-btn.secondary {
        background: transparent;
        color: var(--primary-color);
        border: 1px solid var(--primary-color);
      }

      .read-more-btn.secondary:hover {
        background: var(--primary-color);
        color: white;
        transform: translateY(-1px);
      }

      /* Enhanced preset cards for community presets */
      .preset-card.community-preset {
        border-left: 3px solid rgba(var(--rgb-secondary-color, 255, 152, 0), 1);
      }

      .preset-card.community-preset:hover {
        border-left-color: rgba(var(--rgb-secondary-color, 255, 152, 0), 1);
        box-shadow: 0 4px 16px rgba(var(--rgb-secondary-color, 255, 152, 0), 0.2);
      }

      /* Enhanced preset cards for default presets */
      .preset-card.default-preset {
        border-left: 3px solid var(--primary-color);
      }

      .preset-card.default-preset:hover {
        border-left-color: var(--primary-color);
        box-shadow: 0 4px 16px rgba(var(--rgb-primary-color), 0.2);
      }

      .preset-card.builtin-preset {
        border-left: 3px solid var(--divider-color);
      }

      /* Preset stats (downloads, ratings) */
      .preset-stats {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .preset-stats .stat {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        color: var(--secondary-text-color);
        background: rgba(var(--rgb-secondary-text-color), 0.1);
        padding: 3px 8px;
        border-radius: 6px;
        font-weight: 500;
      }

      .preset-stats .stat ha-icon {
        --mdc-icon-size: 12px;
      }

      /* Error hint for empty states */
      .error-hint {
        font-size: 12px;
        color: var(--error-color, #f44336);
        text-align: center;
        margin-top: 8px;
        font-style: italic;
      }

      /* Preset description and actions */
      .preset-description {
        margin: 8px 0;
        line-height: 1.4;
        color: var(--secondary-text-color);
        font-size: 13px;
      }

      .preset-author {
        font-size: 11px;
        color: var(--secondary-text-color);
      }

      .preset-tags {
        display: flex;
        gap: 4px;
      }

      .tag {
        padding: 2px 6px;
        background: var(--secondary-background-color);
        border-radius: 10px;
        font-size: 10px;
        color: var(--secondary-text-color);
      }

      /* Integrations chips */
      .preset-integrations {
        margin-top: 6px;
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .integration-chip {
        display: inline-flex;
        align-items: center;
        padding: 2px 6px;
        font-size: 10px;
        border-radius: 12px;
        background: var(--primary-color-10);
        color: var(--primary-color);
        border: 1px solid rgba(var(--rgb-primary-color), 0.2);
      }

      /* Favorites Tab */
      .favorites-container {
        padding: 16px;
      }

      .favorites-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }

      .favorites-header h4 {
        margin: 0;
        color: var(--primary-text-color);
      }

      .import-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
      }

      .import-btn:hover {
        background: var(--primary-color-dark);
      }

      .import-btn ha-icon {
        --mdc-icon-size: 14px;
      }

      .favorites-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
      }

      .favorite-card {
        padding: 16px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 12px;
      }

      .favorite-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .favorite-header h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .favorite-actions {
        display: flex;
        gap: 4px;
      }

      .action-btn {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .action-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .action-btn.delete:hover {
        border-color: var(--error-color);
        color: var(--error-color);
      }

      .action-btn ha-icon {
        --mdc-icon-size: 14px;
      }

      .favorite-description {
        margin: 0 0 8px 0;
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }

      .favorite-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .favorite-date {
        font-size: 11px;
        color: var(--secondary-text-color);
      }

      .favorite-tags {
        display: flex;
        gap: 4px;
      }

      /* Empty States */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        text-align: center;
        color: var(--secondary-text-color);
      }

      .empty-state ha-icon {
        --mdc-icon-size: 48px;
        margin-bottom: 16px;
        opacity: 0.6;
      }

      .empty-state p {
        margin: 0 0 8px 0;
        font-size: 14px;
      }

      .empty-hint {
        font-size: 12px;
        opacity: 0.8;
      }

      .error-details {
        margin-top: 16px;
        padding: 16px;
        background: var(--error-color);
        color: white;
        border-radius: 8px;
        text-align: left;
        max-width: 500px;
      }

      .error-hint {
        margin: 0 !important;
        font-size: 13px !important;
        line-height: 1.4;
      }

      .error-hint code {
        background: rgba(255, 255, 255, 0.2);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
      }

      .error-hint strong {
        font-weight: 600;
      }

      /* Row Action Buttons */
      .row-paste-btn,
      .row-remap-entities-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 0;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
      }

      .row-paste-btn:hover,
      .row-remap-entities-btn:hover {
        background: rgba(100, 150, 255, 0.8);
        color: white;
      }

      .row-favorite-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 0;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
      }

      .row-favorite-btn:hover {
        background: rgba(255, 100, 150, 0.8);
        color: white;
      }

      .row-export-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 0;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
      }

      .row-export-btn:hover {
        background: rgba(100, 150, 255, 0.8);
        color: white;
      }

      /* More actions button - hidden on desktop, shown on mobile */
      .row-more-container {
        position: relative;
        display: none; /* Hidden on desktop */
        z-index: 100;
      }

      .row-more-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .row-more-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      /* Ensure menu appears above everything */
      .row-more-menu {
        position: absolute;
        top: 100%;
        right: 0;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        z-index: ${Z_INDEX.CONTEXT_MENU};
        min-width: 180px;
        overflow: hidden;
        margin-top: 4px;
      }

      .more-menu-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        background: none;
        border: none;
        width: 100%;
        text-align: left;
        color: var(--primary-text-color);
        cursor: pointer;
        transition: background-color 0.2s ease;
        font-size: 14px;
        font-weight: 500;
        min-height: 48px;
        box-sizing: border-box;
      }

      .more-menu-item:hover {
        background: var(--secondary-background-color);
      }

      .more-menu-item:active {
        background: var(--divider-color);
      }

      .more-menu-item.favorite {
        color: var(--pink-color, #e91e63);
      }

      .more-menu-item.export {
        color: var(--blue-color, #2196f3);
      }

      .more-menu-item ha-icon {
        --mdc-icon-size: 20px;
        flex-shrink: 0;
      }

      .more-menu-item span {
        flex: 1;
        white-space: nowrap;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .presets-grid,
        .favorites-grid {
          grid-template-columns: 1fr;
          gap: 16px;
        }

        /* Improve tab visibility on mobile */
        .module-selector-tabs {
          /* Tabs are now inside sticky header, no need for separate sticky positioning */
          background: var(--secondary-background-color);
          border-bottom: 2px solid var(--divider-color);
          gap: 0; /* Remove gap on mobile for better fit */
        }

        .tab-button {
          flex-direction: row;
          gap: 6px;
          min-width: 0; /* Allow buttons to shrink */
          white-space: nowrap;
          padding: 14px 8px;
          min-height: 48px;
          font-size: 13px;
          font-weight: 500;
        }

        .tab-button ha-icon {
          --mdc-icon-size: 20px;
        }

        .tab-button span {
          font-size: 13px;
          font-weight: 500;
        }

        .preset-categories {
          justify-content: center;
          gap: 6px;
        }

        .category-btn {
          padding: 10px 12px;
          font-size: 13px;
        }

        .reload-btn {
          padding: 10px 12px;
          font-size: 13px;
        }

        /* Make module selector popup larger on mobile */
        .selector-content {
          width: 95vw !important;
          max-width: 95vw !important;
          height: 85vh !important;
          max-height: 85vh !important;
        }

        .selector-body {
          padding: 12px;
          overflow-y: auto;
        }

        /* Improve module cards on mobile */
        .module-types {
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .module-type-btn {
          padding: 16px;
          text-align: left;
        }

        .preset-preview {
          height: 160px;
          padding: 6px;
        }

        .preset-header {
          padding: 10px 12px;
        }

        .preset-header-title {
          font-size: 14px;
        }

        .preset-content {
          padding: 12px;
        }

        .preset-actions {
          padding: 10px 12px;
        }

        .preset-actions button {
          padding: 8px 12px;
          font-size: 12px;
        }

        /* Mobile slider improvements */
        .preset-slider-nav {
          width: 28px;
          height: 28px;
        }

        .preset-slider-nav ha-icon {
          font-size: 14px;
        }

        .preset-slider-dots {
          bottom: 6px;
        }

        .preset-slider-dot {
          width: 6px;
          height: 6px;
        }

        .favorite-card {
          padding: 12px;
        }

        /* Hide column layout text on mobile to save space */
        .column-layout-text {
          display: none;
        }

        /* Show all action icons on mobile (no more overflow menu needed) */
        .row-paste-btn,
        .row-remap-entities-btn,
        .row-favorite-btn,
        .row-export-btn {
          display: flex;
        }

        /* Keep overflow menu hidden on mobile */
        .row-more-container {
          display: none;
        }

        /* Increase gap between action icons on mobile for better spacing */
        .row-actions-left,
        .row-actions-right {
          gap: 10px;
        }

        /* Adjust button and icon sizes on mobile */
        .row-actions-left button,
        .row-actions-right button {
          width: 36px;
          height: 36px;
        }

        .row-actions-left button ha-icon,
        .row-actions-right button ha-icon {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    `;
  }

  private async _handleBackgroundImageUpload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.hass) return;

    try {
      const imagePath = await uploadImage(this.hass, file);
      this._updateModule({
        background_image: imagePath,
        background_image_type: 'upload' as const,
      });
    } catch (error) {
      console.error('Background image upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  private _truncatePath(path: string): string {
    if (!path) return '';
    const maxLength = 30;
    if (path.length <= maxLength) return path;
    return '...' + path.slice(-maxLength + 3);
  }
  private _getBackgroundSizeDropdownValue(backgroundSize: string | undefined): string {
    if (!backgroundSize) {
      return 'cover';
    }

    // If it's one of the preset values, return it as-is
    if (['cover', 'contain', 'auto'].includes(backgroundSize)) {
      return backgroundSize;
    }

    // If it's 'custom' or any other custom value, return 'custom'
    return 'custom';
  }

  private _getCustomSizeValue(
    backgroundSize: string | undefined,
    dimension: 'width' | 'height'
  ): string {
    if (!backgroundSize || ['cover', 'contain', 'auto'].includes(backgroundSize)) {
      return '';
    }

    // If it's just 'custom' without actual values, return empty
    if (backgroundSize === 'custom') {
      return '';
    }

    // Parse custom size value like "100px 200px" or "50% auto"
    const parts = backgroundSize.split(' ');
    if (dimension === 'width') {
      return parts[0] || '';
    } else if (dimension === 'height') {
      return parts[1] || parts[0] || '';
    }
    return '';
  }

  /**
   * Collect all hover effect configurations from the current card config
   */
  private _collectHoverEffectConfigs(): HoverEffectConfig[] {
    const configs: HoverEffectConfig[] = [];

    if (!this.config) return configs;

    // Collect from rows
    this.config.layout?.rows?.forEach(row => {
      if (row.design?.hover_effect) {
        configs.push(row.design.hover_effect);
      }

      // Collect from columns
      row.columns?.forEach(column => {
        if (column.design?.hover_effect) {
          configs.push(column.design.hover_effect);
        }

        // Collect from modules
        column.modules?.forEach(module => {
          if ((module as any).design?.hover_effect) {
            configs.push((module as any).design.hover_effect);
          }
        });
      });
    });

    return configs;
  }

  /**
   * Update hover effect styles based on current configuration
   */
  private _updateHoverEffectStyles(): void {
    if (!this.shadowRoot) return;

    const configs = this._collectHoverEffectConfigs();
    if (configs.length > 0) {
      UcHoverEffectsService.updateHoverEffectStyles(this.shadowRoot, configs);
    }
  }
}
