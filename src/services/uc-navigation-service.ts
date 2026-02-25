import { HomeAssistant, forwardHaptic } from 'custom-card-helpers';
import { html, render, TemplateResult } from 'lit';
import {
  NavigationModule,
  UltraCardConfig,
  NavRoute,
  NavStackItem,
  NavBadgeConfig,
  NavDesktopConfig,
  NavMediaPlayerConfig,
  NavActionConfig,
  NavShowLabels,
  NavAutohideConfig,
} from '../types';
import { openPopupById } from './popup-trigger-registry';
import { logicService } from './logic-service';
import { ucActionService } from './uc-action-service';
import { responsiveDesignService } from './uc-responsive-design-service';
import { Z_INDEX } from '../utils/uc-z-index';
import { getImageUrl } from '../utils/image-upload';

interface RegisteredModule {
  cardId: string;
  moduleId: string;
  module: NavigationModule;
  hass: HomeAssistant;
  config: UltraCardConfig;
  element: HTMLElement | null;
  registeredAt: number;
}

interface ViewNavLayer {
  viewContainer: HTMLElement;
  navLayer: HTMLElement;
  viewId: string;
  activeModuleKey?: string;
  activeModule?: RegisteredModule;
  mediaPlayerExpanded?: boolean;
  activeStackId?: string;
  /** Viewport rect of the active stack button — used to position the popup outside .navbar-card */
  _stackButtonRect?: DOMRect;
  /** Shared hover-close timer for stack open_mode:'hover' */
  _stackHoverTimer?: ReturnType<typeof setTimeout>;
  /** Auto-hide state */
  autohideHidden?: boolean;
  autohideTimer?: ReturnType<typeof setTimeout>;
  /** In edit mode: when true, show full dock temporarily so user can preview it */
  editModePreviewExpanded?: boolean;
}

interface NavGestureState {
  holdTimeout: ReturnType<typeof setTimeout> | null;
  clickTimeout: ReturnType<typeof setTimeout> | null;
  isHolding: boolean;
  clickCount: number;
  lastClickTime: number;
  lastTarget?: HTMLElement | null;
}

// Use window storage for preview overrides to ensure singleton behavior across module boundaries
declare global {
  interface Window {
    __ucNavigationPreviewOverrides?: Map<
      string,
      { module: NavigationModule; config: UltraCardConfig; updatedAt: number }
    >;
    __ucNavigationPreviewListenerAdded?: boolean;
  }
}

// Get or create the shared preview overrides map
function getPreviewOverrides(): Map<
  string,
  { module: NavigationModule; config: UltraCardConfig; updatedAt: number }
> {
  if (!window.__ucNavigationPreviewOverrides) {
    window.__ucNavigationPreviewOverrides = new Map();
  }
  return window.__ucNavigationPreviewOverrides;
}

class UcNavigationService {
  private registeredModules: Map<string, RegisteredModule> = new Map();
  private viewLayers: Map<HTMLElement, ViewNavLayer> = new Map();
  private updateDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private gestureStates: Map<string, NavGestureState> = new Map();

  // Auto-hide tracking
  private autohideMouseHandler: ((e: MouseEvent) => void) | null = null;
  private autohideActive = false;

  // Media player state watcher – detects track changes even when the
  // originating card is on a non-visible view and not receiving hass updates.
  private _mediaWatchInterval: ReturnType<typeof setInterval> | null = null;
  private _lastMediaSnapshot: Map<string, string> = new Map(); // entity_id → last_updated

  /** On mobile, poll for open dialogs (e.g. date picker) inside shadow roots so we hide the navbar. */
  private _mobileOverlayCheckInterval: ReturnType<typeof setInterval> | null = null;

  // Use the getter to access the shared map
  private get previewOverrides() {
    return getPreviewOverrides();
  }

  private readonly defaultDesktopMinWidth = 768;

  private isMobileViewport(): boolean {
    return typeof window !== 'undefined' && window.matchMedia?.('(max-width: 767px)')?.matches === true;
  }

  private readonly scheduleUpdateBound = () => this.scheduleUpdate();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('location-changed', this.scheduleUpdateBound);
      window.addEventListener('popstate', this.scheduleUpdateBound);
      window.addEventListener('resize', this.scheduleUpdateBound);

      // Only add the preview update listener once globally
      if (!window.__ucNavigationPreviewListenerAdded) {
        window.__ucNavigationPreviewListenerAdded = true;
        window.addEventListener('uc-navigation-preview-update', ((e: CustomEvent) => {
          const detail = e.detail || {};
          if (detail?.module && detail?.moduleId && detail?.config) {
            getPreviewOverrides().set(detail.moduleId, {
              module: detail.module as NavigationModule,
              config: detail.config as UltraCardConfig,
              updatedAt: Date.now(),
            });
            // Dispatch a custom event to trigger re-render in all instances
            window.dispatchEvent(new CustomEvent('uc-navigation-force-render'));
          }
        }) as EventListener);
      }

      // Listen for force render events
      window.addEventListener('uc-navigation-force-render', () => {
        if (this.updateDebounceTimer) {
          clearTimeout(this.updateDebounceTimer);
          this.updateDebounceTimer = null;
        }
        this.evaluateAndRender();
      });

      // Listen for editor close events to clear preview overrides
      // This uses MutationObserver to detect when editor dialogs are removed
      const observeEditorDialogs = () => {
        const observer = new MutationObserver(mutations => {
          for (const mutation of mutations) {
            for (const node of Array.from(mutation.removedNodes)) {
              if (node instanceof HTMLElement) {
                const tagName = node.tagName?.toLowerCase();
                // Check if an editor dialog was removed
                if (
                  tagName === 'hui-dialog-edit-card' ||
                  tagName === 'ha-dialog' ||
                  node.querySelector?.('ultra-card-editor')
                ) {
                  if (this.previewOverrides.size > 0) {
                    this.previewOverrides.clear();
                    this.scheduleUpdate();
                  }
                }
              }
            }
          }
        });

        observer.observe(document.body, { childList: true, subtree: true });
      };

      // Start observing after a short delay
      setTimeout(observeEditorDialogs, 1000);

      // Watch HA shadow roots for dialogs, panel changes, and drawer so we can hide the navbar
      const observeHaOverlays = () => {
        const ha = document.querySelector('home-assistant') as HTMLElement & { shadowRoot?: ShadowRoot } | null;
        const haRoot = ha?.shadowRoot;
        if (!haRoot) {
          setTimeout(observeHaOverlays, 2000);
          return;
        }

        const observer = new MutationObserver(() => {
          this.scheduleUpdate();
        });

        observer.observe(haRoot, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['open'],
        });

        const haMain = haRoot.querySelector('home-assistant-main');
        const mainRoot = (haMain as HTMLElement & { shadowRoot?: ShadowRoot })?.shadowRoot;
        if (mainRoot) {
          observer.observe(mainRoot, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['open'],
          });
        }
      };
      setTimeout(observeHaOverlays, 2000);
    }
  }

  registerModule(
    cardId: string,
    moduleId: string,
    module: NavigationModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    element: HTMLElement | null = null
  ): void {
    const key = `${cardId}-${moduleId}`;
    const existing = this.registeredModules.get(key);

    // DON'T clear preview override on re-registration
    // Re-registration happens on every config change during editing
    // Preview override will be cleared manually when editor closes

    this.registeredModules.set(key, {
      cardId,
      moduleId,
      module,
      hass,
      config,
      element,
      registeredAt: existing?.registeredAt || Date.now(),
    });

    this.scheduleUpdate();
    // Start/stop the media player watcher as needed
    this.manageMediaPlayerWatcher();
  }

  unregisterModule(cardId: string, moduleId: string): void {
    const key = `${cardId}-${moduleId}`;
    this.registeredModules.delete(key);

    if (this.registeredModules.size === 0) {
      this.cleanup();
    } else {
      this.scheduleUpdate();
    }
    // Re-evaluate whether we still need the media watcher
    this.manageMediaPlayerWatcher();
  }

  /**
   * Retrieve the freshest `hass` object from the HA root element.
   * When the originating card is on a non-visible view, its stored `hass`
   * can be stale. The `<home-assistant>` element always has the latest state.
   */
  private getFreshHass(registered: RegisteredModule): HomeAssistant {
    try {
      const haEl = document.querySelector('home-assistant') as any;
      if (haEl?.hass) {
        // Keep stored reference in sync so downstream code is consistent
        registered.hass = haEl.hass;
        return haEl.hass;
      }
    } catch {
      // Fallback silently
    }
    return registered.hass;
  }

  /**
   * Collect all media_player entity IDs from currently registered navigation modules.
   */
  private getTrackedMediaEntities(): Set<string> {
    const entities = new Set<string>();
    for (const reg of this.registeredModules.values()) {
      const mp = (reg.module as any)?.nav_media_player;
      if (mp?.enabled !== false && mp?.entity) {
        entities.add(mp.entity as string);
      }
    }
    return entities;
  }

  /**
   * Start or stop the media player state watcher based on whether any
   * registered navigation module has a media player configured.
   */
  private manageMediaPlayerWatcher(): void {
    const entities = this.getTrackedMediaEntities();
    if (entities.size > 0 && !this._mediaWatchInterval) {
      this.startMediaPlayerWatcher();
    } else if (entities.size === 0 && this._mediaWatchInterval) {
      this.stopMediaPlayerWatcher();
    }
  }

  /**
   * Poll the HA root element for media player state changes every ~1 s.
   * When a tracked entity's last_updated changes, trigger a full re-render
   * so album art / title / artist update in real-time.
   */
  private startMediaPlayerWatcher(): void {
    if (this._mediaWatchInterval) return;

    this._mediaWatchInterval = setInterval(() => {
      try {
        const haEl = document.querySelector('home-assistant') as any;
        const hass: HomeAssistant | undefined = haEl?.hass;
        if (!hass?.states) return;

        const entities = this.getTrackedMediaEntities();
        let changed = false;

        for (const entityId of entities) {
          const state = hass.states[entityId];
          if (!state) continue;
          const prev = this._lastMediaSnapshot.get(entityId);
          const curr = state.last_updated || '';
          if (prev !== curr) {
            this._lastMediaSnapshot.set(entityId, curr);
            changed = true;
          }
        }

        if (changed) {
          // Push fresh hass into all registered modules before rendering
          for (const reg of this.registeredModules.values()) {
            reg.hass = hass;
          }
          this.evaluateAndRender();
        }
      } catch {
        // Silently ignore errors in the watcher
      }
    }, 1000);
  }

  private stopMediaPlayerWatcher(): void {
    if (this._mediaWatchInterval) {
      clearInterval(this._mediaWatchInterval);
      this._mediaWatchInterval = null;
    }
    this._lastMediaSnapshot.clear();
  }

  /**
   * Check if there are multiple global (all_views) navbars registered
   * Returns info about conflicts for display in the editor
   */
  getGlobalNavbarConflicts(
    currentCardId: string,
    currentModuleId: string
  ): {
    hasConflict: boolean;
    conflictingNavbars: Array<{ cardId: string; moduleId: string }>;
  } {
    const currentKey = `${currentCardId}-${currentModuleId}`;
    const globalNavbars: Array<{ cardId: string; moduleId: string; key: string }> = [];

    for (const [key, registered] of this.registeredModules.entries()) {
      const navScope = registered.module.nav_scope || 'all_views';
      if (navScope === 'all_views') {
        globalNavbars.push({
          cardId: registered.cardId,
          moduleId: registered.moduleId,
          key,
        });
      }
    }

    // Filter out the current module and check for conflicts
    const conflicting = globalNavbars.filter(nav => nav.key !== currentKey);

    return {
      hasConflict: conflicting.length > 0 && globalNavbars.some(n => n.key === currentKey),
      conflictingNavbars: conflicting,
    };
  }

  /**
   * Toggle the edit-mode dock preview on/off.
   * Called from the navigation module's placeholder card in the editor.
   */
  toggleEditModePreview(show: boolean): void {
    for (const layer of this.viewLayers.values()) {
      layer.editModePreviewExpanded = show;
    }
    this.evaluateAndRender();
  }

  /**
   * Whether the dock is currently shown as a preview in edit mode.
   */
  isEditModePreviewExpanded(): boolean {
    for (const layer of this.viewLayers.values()) {
      if (layer.editModePreviewExpanded) return true;
    }
    return false;
  }

  /**
   * Walk subtree (including shadow roots) and return true if any open dialog is found.
   * Used so we hide the navbar when date pickers/overlays open inside the view (e.g. mobile).
   */
  private hasOpenDialogInSubtree(root: Node, depth: number = 0): boolean {
    const maxDepth = 20;
    if (depth > maxDepth) return false;

    const el = root as HTMLElement & { open?: boolean; shadowRoot?: ShadowRoot };
    if (el.nodeType !== Node.ELEMENT_NODE) return false;

    const tag = el.tagName?.toLowerCase();
    if (tag === 'ha-dialog' && (el.hasAttribute('open') || el.open)) return true;
    if (tag === 'paper-dialog' && (el.hasAttribute('open') || (el as any).opened)) return true;
    if (el.getAttribute?.('role') === 'dialog' && el.hasAttribute?.('open')) return true;

    const shadow = (el as Element).shadowRoot;
    if (shadow && this.hasOpenDialogInSubtree(shadow, depth + 1)) return true;

    for (let child = root.firstChild; child; child = child.nextSibling) {
      if (this.hasOpenDialogInSubtree(child, depth + 1)) return true;
    }
    return false;
  }

  /**
   * Returns true when the navbar should be hidden because an HA overlay or
   * non-Lovelace panel is active (dialogs, settings, automations, sidebar).
   */
  private isNavbarObscured(): boolean {
    try {
      const ha = document.querySelector('home-assistant') as HTMLElement & { shadowRoot?: ShadowRoot; hass?: any } | null;
      const haRoot = ha?.shadowRoot;
      if (!haRoot) return false;

      // 1. Check if we're on a Lovelace dashboard panel
      // Use HA's hass object which reliably tracks the current panel
      const hass = ha?.hass;
      if (hass?.panelUrl) {
        const currentPanel = hass.panels?.[hass.panelUrl];
        if (currentPanel?.component_name !== 'lovelace') {
          return true; // Not on a dashboard (settings, automations, dev tools, etc.)
        }
      }

      // 2. Check for open HA dialogs (date pickers, more-info, confirmations)
      // Search including shadow roots so we catch dialogs rendered inside the view (e.g. mobile date picker)
      if (this.hasOpenDialogInSubtree(haRoot)) return true;

      // 3. Check for open sidebar/drawer on mobile
      const haMain = haRoot.querySelector('home-assistant-main');
      const mainRoot = (haMain as HTMLElement & { shadowRoot?: ShadowRoot })?.shadowRoot;
      if (mainRoot) {
        const drawer = mainRoot.querySelector('ha-drawer');
        if (drawer) {
          const d = drawer as HTMLElement & { open?: boolean };
          if (drawer.hasAttribute('open') || d.open) {
            return true;
          }
        }
      }
    } catch {
      // Fail open - show navbar if detection fails
    }
    return false;
  }

  private scheduleUpdate(): void {
    if (this.updateDebounceTimer) {
      clearTimeout(this.updateDebounceTimer);
    }

    this.updateDebounceTimer = setTimeout(() => {
      this.evaluateAndRender();
      this.updateDebounceTimer = null;
      this.startOrStopMobileOverlayCheck();
    }, 10); // Reduced debounce for faster real-time updates
  }

  /** On mobile, poll so we hide the navbar when date picker etc. opens inside shadow roots. */
  private startOrStopMobileOverlayCheck(): void {
    const shouldRun = this.registeredModules.size > 0 && this.isMobileViewport();
    if (shouldRun && !this._mobileOverlayCheckInterval) {
      this._mobileOverlayCheckInterval = setInterval(() => {
        if (this.registeredModules.size === 0 || !this.isMobileViewport()) {
          this.startOrStopMobileOverlayCheck();
          return;
        }
        this.evaluateAndRender();
      }, 400);
    } else if (!shouldRun && this._mobileOverlayCheckInterval) {
      clearInterval(this._mobileOverlayCheckInterval);
      this._mobileOverlayCheckInterval = null;
    }
  }

  private evaluateAndRender(): void {
    // Preview overrides are cleared when:
    // 1. Module is re-registered (config saved)
    // 2. clearPreviewOverride() is called explicitly
    // We don't auto-clear based on time to allow continuous editing
    this.cleanupOrphanedLayers();

    if (this.registeredModules.size === 0) {
      this.cleanup();
      return;
    }

    const containerMap = new Map<HTMLElement, RegisteredModule[]>();

    for (const registered of this.registeredModules.values()) {
      const target = this.findTargetContainer(registered);
      if (!target) continue;

      let list = containerMap.get(target);
      if (!list) {
        list = [];
        containerMap.set(target, list);
      }
      list.push(registered);
    }

    const activeByContainer = new Map<HTMLElement, RegisteredModule>();

    for (const [container, modules] of containerMap.entries()) {
      const activeModule = this.evaluateActiveModuleForContainer(modules);
      if (activeModule) {
        activeByContainer.set(container, activeModule);
        this.renderNavigationForContainer(activeModule, container);
      } else {
        this.clearNavigationForContainer(container);
      }
    }

    for (const container of Array.from(this.viewLayers.keys())) {
      if (!activeByContainer.has(container)) {
        this.clearNavigationForContainer(container);
      }
    }
  }

  private evaluateActiveModuleForContainer(modules: RegisteredModule[]): RegisteredModule | null {
    if (!modules || modules.length === 0) return null;

    modules.sort((a, b) => {
      // Only compare document position if both elements exist AND are connected
      if (a.element && b.element && a.element.isConnected && b.element.isConnected) {
        const position = a.element.compareDocumentPosition(b.element);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      }
      // Fall back to registration order
      return a.registeredAt - b.registeredAt;
    });

    if (modules[0].hass) {
      logicService.setHass(modules[0].hass);
    }

    const breakpoint = responsiveDesignService.getCurrentBreakpoint();
    const currentPath = window.location.pathname;

    for (const registered of modules) {
      const { module } = registered;

      if (module.hidden_on_devices && module.hidden_on_devices.includes(breakpoint)) {
        continue;
      }

      // Check nav_scope - if 'current_view', only show on the view where the card is placed
      const navScope = module.nav_scope || 'all_views';
      if (navScope === 'current_view') {
        const cardViewPath = this.getCardViewPath(registered.element);
        if (cardViewPath && !this.isOnSameView(currentPath, cardViewPath)) {
          continue;
        }
      }

      const shouldDisplay = logicService.evaluateDisplayConditions(
        module.display_conditions || [],
        module.display_mode || 'always'
      );

      if (shouldDisplay) {
        return registered;
      }
    }

    return null;
  }

  /**
   * Get the view path where a card element is located
   */
  private getCardViewPath(element: HTMLElement | null): string | null {
    if (!element) return null;

    // Try to find the hui-view element and get its path
    let current: HTMLElement | null = element;
    while (current) {
      // Check for hui-view element
      if (current.tagName?.toLowerCase() === 'hui-view') {
        // Get the view index from the parent
        const viewRoot = current.closest('hui-root');
        if (viewRoot) {
          const views = viewRoot.querySelectorAll('hui-view');
          const viewIndex = Array.from(views).indexOf(current);
          if (viewIndex >= 0) {
            // Build the path based on the current dashboard
            const dashboardPath = window.location.pathname.split('/').slice(0, 3).join('/');
            return viewIndex === 0 ? dashboardPath : `${dashboardPath}/${viewIndex}`;
          }
        }
      }

      // Check for view-specific attributes
      const viewPath = current.getAttribute('data-view-path');
      if (viewPath) return viewPath;

      current = current.parentElement;
    }

    // Fallback: use the current path when the card was registered
    return null;
  }

  /**
   * Check if two paths refer to the same view
   */
  private isOnSameView(currentPath: string, cardViewPath: string): boolean {
    // Normalize paths by removing trailing slashes
    const normCurrent = currentPath.replace(/\/$/, '');
    const normCard = cardViewPath.replace(/\/$/, '');

    // Direct match
    if (normCurrent === normCard) return true;

    // Handle hash-based view navigation (e.g., /lovelace/0#view-name)
    const currentBase = normCurrent.split('#')[0];
    const cardBase = normCard.split('#')[0];
    if (currentBase === cardBase) return true;

    // Handle index-based views (lovelace/0 vs lovelace)
    const currentParts = normCurrent.split('/').filter(Boolean);
    const cardParts = normCard.split('/').filter(Boolean);

    // If on default view (no index), compare base paths
    if (currentParts.length >= 2 && cardParts.length >= 2) {
      const currentDashboard = currentParts.slice(0, 2).join('/');
      const cardDashboard = cardParts.slice(0, 2).join('/');

      if (currentDashboard === cardDashboard) {
        const currentView = currentParts[2] || '0';
        const cardView = cardParts[2] || '0';
        return currentView === cardView;
      }
    }

    return false;
  }

  private renderNavigationForContainer(registered: RegisteredModule, container: HTMLElement): void {
    // Always pull the freshest hass so media player state is current
    // even when the originating card is on a non-visible view.
    this.getFreshHass(registered);

    const viewLayer = this.ensureNavLayerForView(container);
    const moduleKey = `${registered.cardId}-${registered.moduleId}`;

    viewLayer.activeModuleKey = moduleKey;
    viewLayer.activeModule = registered;

    const previewOverride = this.previewOverrides.get(registered.moduleId);

    const moduleForRender = previewOverride?.module ?? registered.module;
    const configForRender = previewOverride?.config ?? registered.config;

    const navConfig = this.resolveNavigationConfig(moduleForRender, configForRender);
    const hass = registered.hass;

    // Hide navbar when HA overlay or non-Lovelace panel is active
    if (this.isNavbarObscured()) {
      viewLayer.navLayer.style.display = 'none';
      return;
    }
    viewLayer.navLayer.style.display = '';

    const template = this.renderNavigationTemplate(navConfig, registered, viewLayer);
    render(template, viewLayer.navLayer);
  }

  private clearNavigationForContainer(container: HTMLElement): void {
    const viewLayer = this.viewLayers.get(container);
    if (!viewLayer) return;

    render(html``, viewLayer.navLayer);
  }

  private ensureNavLayerForView(viewContainer: HTMLElement): ViewNavLayer {
    const existing = this.viewLayers.get(viewContainer);
    if (existing && existing.navLayer.isConnected) {
      return existing;
    }

    if (!viewContainer.id && !viewContainer.getAttribute('data-view-id')) {
      const stableId = this.getStableViewId(viewContainer);
      viewContainer.setAttribute('data-view-id', stableId);
    }

    const navLayer = document.createElement('div');
    const viewId =
      viewContainer.id || viewContainer.getAttribute('data-view-id') || `view-${Date.now()}`;
    navLayer.id = `uc-navigation-layer-${viewId}`;
    navLayer.setAttribute('data-view-id', viewId);
    navLayer.style.position = 'fixed';
    navLayer.style.top = '0';
    navLayer.style.left = '0';
    navLayer.style.width = '100vw';
    navLayer.style.height = '100dvh';
    navLayer.style.minHeight = '100vh';
    navLayer.style.pointerEvents = 'none';
    navLayer.style.zIndex = `${Z_INDEX.CARD_CONTROLS}`;

    if (viewContainer === document.body) {
      document.body.appendChild(navLayer);
    } else {
      viewContainer.appendChild(navLayer);
    }

    const viewLayer: ViewNavLayer = {
      viewContainer,
      navLayer,
      viewId,
    };

    this.viewLayers.set(viewContainer, viewLayer);
    return viewLayer;
  }

  private cleanupOrphanedLayers(): void {
    for (const [container, layer] of this.viewLayers.entries()) {
      if (!container.isConnected || !layer.navLayer.isConnected) {
        render(html``, layer.navLayer);
        layer.navLayer.remove();
        this.viewLayers.delete(container);
      }
    }
  }

  private cleanup(): void {
    // Stop media player watcher
    this.stopMediaPlayerWatcher();

    if (this._mobileOverlayCheckInterval) {
      clearInterval(this._mobileOverlayCheckInterval);
      this._mobileOverlayCheckInterval = null;
    }

    // Tear down auto-hide listeners
    if (this.autohideMouseHandler) {
      document.removeEventListener('mousemove', this.autohideMouseHandler);
      this.autohideMouseHandler = null;
      this.autohideActive = false;
    }
    for (const [container, layer] of this.viewLayers.entries()) {
      if (layer.autohideTimer) clearTimeout(layer.autohideTimer);
      render(html``, layer.navLayer);
      layer.navLayer.remove();
    }
    this.viewLayers.clear();
  }

  private resolveNavigationConfig(
    module: NavigationModule,
    config: UltraCardConfig
  ): NavigationModule {
    const templateName = module.nav_template?.trim();
    const templateConfig =
      templateName && config?.nav_templates ? config.nav_templates[templateName] : undefined;

    const mergedRoutes =
      module.nav_routes && module.nav_routes.length > 0
        ? module.nav_routes
        : templateConfig?.nav_routes || [];

    return {
      ...module,
      nav_routes: mergedRoutes,
      nav_desktop: {
        ...(templateConfig?.nav_desktop || {}),
        ...(module.nav_desktop || {}),
      },
      nav_mobile: {
        ...(templateConfig?.nav_mobile || {}),
        ...(module.nav_mobile || {}),
      },
      nav_layout: {
        ...(templateConfig?.nav_layout || {}),
        ...(module.nav_layout || {}),
      },
      nav_haptic: module.nav_haptic ?? templateConfig?.nav_haptic,
      nav_media_player: {
        ...(templateConfig?.nav_media_player || {}),
        ...(module.nav_media_player || {}),
      },
      nav_styles: module.nav_styles ?? templateConfig?.nav_styles,
    };
  }

  private renderNavigationTemplate(
    navModule: NavigationModule,
    registered: RegisteredModule,
    viewLayer: ViewNavLayer
  ): TemplateResult {
    const hass = registered.hass;
    const isDesktop = this.isDesktop(navModule.nav_desktop);
    const desktopConfig = navModule.nav_desktop || {};
    const mobileConfig = navModule.nav_mobile || {};

    const deviceConfig = isDesktop ? desktopConfig : mobileConfig;
    const mode = deviceConfig.mode || (isDesktop ? 'floating' : 'docked');
    const position =
      deviceConfig.position || (isDesktop ? desktopConfig.position || 'bottom' : 'bottom');

    const showLabels = deviceConfig.show_labels ?? false;

    const hidden = this.resolveBoolean(deviceConfig.hidden, false, hass, navModule, navModule);
    if (hidden) {
      return html``;
    }

    const mediaPlayerConfig = navModule.nav_media_player;
    const routes = navModule.nav_routes || [];

    // Determine if media player should be rendered as an icon in the navbar
    const mediaPlayerInNavbar = this.shouldRenderMediaPlayerInNavbar(
      mediaPlayerConfig,
      hass,
      navModule
    );

    // For widget mode (not icon modes), render media player separately
    const mediaPlayerWidgetTemplate = !mediaPlayerInNavbar
      ? this.renderMediaPlayerWidget(
          mediaPlayerConfig,
          hass,
          navModule,
          isDesktop,
          registered,
          viewLayer
        )
      : html``;

    const baseStyles = this.buildBaseStyles(navModule.nav_style);
    const customStyles = navModule.nav_styles || '';

    // Calculate offset styling — applies to both docked and floating modes
    const offset = deviceConfig.offset ?? (mode === 'floating' ? 16 : 0);
    const offsetStyle = mode === 'floating' && offset > 0 ? this.getFloatingOffsetStyle(position, offset) : '';

    // Icon spacing
    const iconGap = navModule.nav_layout?.icon_gap;
    const iconGapStyle = iconGap != null ? `--uc-nav-icon-gap: ${iconGap}px;` : '';

    // Alignment
    const alignment = deviceConfig.alignment || 'center';

    // Custom color overrides — for glass styles, tint with transparency
    const isGlassStyle =
      navModule.nav_style === 'uc_ios_glass' || navModule.nav_style === 'uc_floating';
    const rawDockColor = navModule.nav_dock_color || '';
    const dockColor =
      rawDockColor && isGlassStyle
        ? this.toRgbaColor(rawDockColor, 0.25) // tint at 25% opacity for glass
        : rawDockColor;
    const iconColor = navModule.nav_icon_color || '';

    // Detect edit mode — but NOT when the card editor is open with a live
    // preview override for this module (user is actively editing the dock)
    const hasActivePreview = this.previewOverrides.has(registered.moduleId);
    const isDashboardEditMode = (() => {
      if (hasActivePreview) return false; // show dock for live preview
      try {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('edit') === '1';
      } catch {
        return false;
      }
    })();

    // Auto-hide logic
    const autohide = navModule.nav_autohide;
    const autohideEnabled = autohide?.enabled === true && !isDashboardEditMode;
    const isAutoHidden = autohideEnabled && viewLayer.autohideHidden === true;

    // Set up auto-hide if enabled
    if (autohideEnabled) {
      this.setupAutohide(viewLayer, navModule, position);
    } else {
      this.teardownAutohide(viewLayer);
    }

    // Stack backdrop - closes stack when clicking outside
    const stackBackdrop = viewLayer.activeStackId
      ? html`
          <div
            class="stack-backdrop"
            style="position: fixed; inset: 0; pointer-events: auto; z-index: 50;"
            @click=${() => {
              viewLayer.activeStackId = undefined;
              viewLayer._stackButtonRect = undefined;
              this.requestRender(viewLayer);
            }}
          ></div>
        `
      : '';

    // Stack children popup rendered outside .navbar-card to avoid overflow clipping
    const stackPopup = this.renderActiveStackPopup(navModule, hass, registered, viewLayer, position);

    return html`
      <style>
        ${baseStyles}
        ${customStyles}
      </style>
      <div
        class="navbar ${isDesktop ? 'desktop' : 'mobile'} ${mode} ${position} ${isAutoHidden
          ? 'autohide-hidden'
          : ''} ${autohideEnabled ? 'autohide-enabled' : ''} style-${navModule.nav_style ||
        'uc_modern'}"
        style="${iconGapStyle}"
      >
        ${isDashboardEditMode
          ? viewLayer.editModePreviewExpanded
            ? html`
                ${stackBackdrop} ${stackPopup} ${mediaPlayerWidgetTemplate}
                <div
                  class="navbar-card ${isDesktop ? 'desktop' : 'mobile'} ${mode} ${position}${dockColor
                    ? ' has-dock-color'
                    : ''}"
                  style="${mode === 'docked'
                    ? this.getDockedStyle(position, isDesktop, offset)
                    : offsetStyle} justify-content: ${alignment};${dockColor
                    ? ` --uc-nav-dock-color: ${dockColor}; --navbar-button-bg: rgba(255,255,255,0.12); --navbar-button-hover-bg: rgba(255,255,255,0.24); --navbar-button-active-bg: rgba(255,255,255,0.36); --navbar-icon-color: rgba(255,255,255,0.85); --navbar-icon-active-color: #fff;`
                    : ''}${iconColor
                    ? ` --uc-nav-icon-color: ${iconColor}; --navbar-icon-color: ${iconColor}; --navbar-icon-active-color: ${iconColor};`
                    : ''}"
                >
                  ${this.renderRoutesWithMediaPlayer(
                    routes,
                    mediaPlayerConfig,
                    mediaPlayerInNavbar,
                    hass,
                    navModule,
                    registered,
                    viewLayer,
                    showLabels
                  )}
                </div>
                ${this.renderMediaPlayerPopup(mediaPlayerConfig, hass, navModule, registered, viewLayer)}
              `
            : '' /* Dock hidden — toggle lives in the module placeholder card */
          : html`
              ${stackBackdrop} ${stackPopup} ${mediaPlayerWidgetTemplate}
              <div
                class="navbar-card ${isDesktop ? 'desktop' : 'mobile'} ${mode} ${position}${dockColor
                  ? ' has-dock-color'
                  : ''}"
                style="${mode === 'docked'
                  ? this.getDockedStyle(position, isDesktop, offset)
                  : offsetStyle} justify-content: ${alignment};${dockColor
                  ? ` --uc-nav-dock-color: ${dockColor}; --navbar-button-bg: rgba(255,255,255,0.12); --navbar-button-hover-bg: rgba(255,255,255,0.24); --navbar-button-active-bg: rgba(255,255,255,0.36); --navbar-icon-color: rgba(255,255,255,0.85); --navbar-icon-active-color: #fff;`
                  : ''}${iconColor
                  ? ` --uc-nav-icon-color: ${iconColor}; --navbar-icon-color: ${iconColor}; --navbar-icon-active-color: ${iconColor};`
                  : ''}"
              >
                ${this.renderRoutesWithMediaPlayer(
                  routes,
                  mediaPlayerConfig,
                  mediaPlayerInNavbar,
                  hass,
                  navModule,
                  registered,
                  viewLayer,
                  showLabels
                )}
              </div>
              ${this.renderMediaPlayerPopup(mediaPlayerConfig, hass, navModule, registered, viewLayer)}
            `}
      </div>
    `;
  }

  private renderRouteItem(
    route: NavRoute,
    hass: HomeAssistant,
    navModule: NavigationModule,
    registered: RegisteredModule,
    viewLayer: ViewNavLayer,
    showLabels: NavShowLabels
  ): TemplateResult {
    const resolvedRoute = this.resolveRoute(route, hass, navModule, registered.config);
    if (resolvedRoute.hidden) {
      return html``;
    }

    const { isSelected, selectedColor } = this.getRouteSelection(resolvedRoute, navModule, hass);

    const resolvedImage = isSelected
      ? resolvedRoute.image_selected || resolvedRoute.image
      : resolvedRoute.image;
    const resolvedIcon = isSelected
      ? resolvedRoute.icon_selected || resolvedRoute.icon
      : resolvedRoute.icon;

    const iconColor = isSelected && selectedColor ? selectedColor : resolvedRoute.icon_color;
    // Normalize showLabels - handle both boolean and string values
    const showLabelsValue = showLabels as any;
    const normalizedShowLabels =
      showLabelsValue === true || showLabelsValue === 'true'
        ? true
        : showLabelsValue === false || showLabelsValue === 'false'
          ? false
          : showLabelsValue;
    // text_only (or legacy routes_only) = show label text, hide icon
    const isTextOnly =
      normalizedShowLabels === 'text_only' || normalizedShowLabels === 'routes_only';
    const showLabel = normalizedShowLabels === true || isTextOnly;
    const showIcon = !isTextOnly;

    const elementId = `uc-nav-route-${registered.cardId}-${registered.moduleId}-${resolvedRoute.id}`;
    const handlers = this.createNavGestureHandlers(
      elementId,
      resolvedRoute,
      hass,
      registered,
      viewLayer
    );

    const badgeTemplate = this.renderBadge(resolvedRoute.badge, hass, navModule, resolvedRoute);

    return html`
      <div
        class="route ${isSelected ? 'active' : ''} ${isTextOnly ? 'text-only' : ''}"
        @pointerdown=${handlers.onPointerDown}
        @pointerup=${handlers.onPointerUp}
        @pointerleave=${handlers.onPointerLeave}
        @pointercancel=${handlers.onPointerCancel}
        style="${selectedColor ? `--nav-selected-color:${selectedColor};` : ''}"
      >
        ${showIcon
          ? html`
              <div class="button ${isSelected ? 'active' : ''}">
                ${resolvedImage
                  ? html`
                      <img
                        class="image ${isSelected ? 'active' : ''}"
                        src="${resolvedImage}"
                        alt="${resolvedRoute.label || ''}"
                      />
                    `
                  : resolvedIcon
                    ? html`
                        <ha-icon
                          class="icon ${isSelected ? 'active' : ''}"
                          icon="${resolvedIcon}"
                          style="${iconColor ? `color:${iconColor};` : ''}"
                        ></ha-icon>
                      `
                    : html`
                        <ha-icon
                          class="icon ${isSelected ? 'active' : ''}"
                          icon="mdi:help-circle-outline"
                        ></ha-icon>
                      `}
                ${badgeTemplate}
              </div>
            `
          : ''}
        ${showLabel
          ? html`
              <div class="label ${isSelected ? 'active' : ''}">${resolvedRoute.label || ''}</div>
            `
          : ''}
      </div>
    `;
  }

  private renderStackItem(
    stack: NavStackItem,
    hass: HomeAssistant,
    navModule: NavigationModule,
    registered: RegisteredModule,
    viewLayer: ViewNavLayer,
    showLabels: NavShowLabels
  ): TemplateResult {
    const hidden = this.resolveBoolean(stack.hidden, false, hass, navModule, stack);
    if (hidden) return html``;

    const icon = stack.icon || 'mdi:dots-horizontal';
    const label = stack.label || '';
    const children = stack.children || [];
    const isExpanded = viewLayer.activeStackId === stack.id;

    // Normalize showLabels (handle both boolean and string values)
    const showLabelsValue = showLabels as any;
    const normalizedShowLabels =
      showLabelsValue === true || showLabelsValue === 'true'
        ? true
        : showLabelsValue === false || showLabelsValue === 'false'
          ? false
          : showLabelsValue;
    const showLabel =
      normalizedShowLabels === true || normalizedShowLabels === 'routes_only'
        ? normalizedShowLabels !== false
        : false;

    // Determine stack orientation based on navbar position and stack setting
    const isDesktop = this.isDesktop(navModule.nav_desktop);
    const position = isDesktop
      ? navModule.nav_desktop?.position || 'bottom'
      : navModule.nav_mobile?.position || 'bottom';
    const isHorizontalNavbar = position === 'left' || position === 'right';

    // Resolve orientation: 'auto' means opposite of navbar direction
    let stackIsHorizontal: boolean;
    if (stack.orientation === 'horizontal') {
      stackIsHorizontal = true;
    } else if (stack.orientation === 'vertical') {
      stackIsHorizontal = false;
    } else {
      // auto: horizontal navbar → vertical stack, vertical navbar → horizontal stack
      stackIsHorizontal = isHorizontalNavbar;
    }

    // Handle stack click/hover — store button rect for the portal popup
    const handleStackClick = (e: Event) => {
      e.stopPropagation();
      if (stack.open_mode === 'hover') return;
      const el = e.currentTarget as HTMLElement;
      viewLayer._stackButtonRect = isExpanded ? undefined : el.getBoundingClientRect();
      viewLayer.activeStackId = isExpanded ? undefined : stack.id;
      this.requestRender(viewLayer);
    };

    const handleStackMouseEnter = (e: Event) => {
      if (stack.open_mode !== 'hover') return;
      if (viewLayer._stackHoverTimer) {
        clearTimeout(viewLayer._stackHoverTimer);
        viewLayer._stackHoverTimer = undefined;
      }
      if (viewLayer.activeStackId !== stack.id) {
        const el = e.currentTarget as HTMLElement;
        viewLayer._stackButtonRect = el.getBoundingClientRect();
        viewLayer.activeStackId = stack.id;
        this.requestRender(viewLayer);
      }
    };

    const handleStackMouseLeave = () => {
      if (stack.open_mode !== 'hover') return;
      // Delay close so the popup stays open while moving cursor to it
      viewLayer._stackHoverTimer = setTimeout(() => {
        if (viewLayer.activeStackId === stack.id) {
          viewLayer.activeStackId = undefined;
          viewLayer._stackButtonRect = undefined;
          this.requestRender(viewLayer);
        }
      }, 300);
    };

    // Badge for stack
    const badgeTemplate = this.renderBadge(stack.badge, hass, navModule, stack as any);

    // Children popup is rendered outside .navbar-card via renderActiveStackPopup()
    // to avoid overflow clipping on mobile (see renderNavigation)
    return html`
      <div
        class="route stack-item ${isExpanded ? 'expanded' : ''}"
        @click=${handleStackClick}
        @mouseenter=${stack.open_mode === 'hover' ? handleStackMouseEnter : undefined}
        @mouseleave=${stack.open_mode === 'hover' ? handleStackMouseLeave : undefined}
      >
        <div class="button">
          <ha-icon
            class="icon"
            icon="${icon}"
            style="${stack.icon_color ? `color:${stack.icon_color};` : ''}"
          ></ha-icon>
          ${badgeTemplate}
        </div>
        ${showLabel ? html`<div class="label">${label}</div>` : ''}
      </div>
    `;
  }

  /**
   * Render the expanded stack children popup as a portal OUTSIDE .navbar-card.
   * This avoids overflow clipping on mobile bottom/top navbars which have
   * overflow-x: auto / overflow-y: hidden for horizontal scrolling.
   * The popup is absolutely positioned within .navbar (position:fixed; inset:0)
   * using viewport coordinates from the stored button rect.
   */
  private renderActiveStackPopup(
    navModule: NavigationModule,
    hass: HomeAssistant,
    registered: RegisteredModule,
    viewLayer: ViewNavLayer,
    position: string
  ): TemplateResult {
    const activeId = viewLayer.activeStackId;
    const rect = viewLayer._stackButtonRect;
    if (!activeId || !rect) return html``;

    const stacks = navModule.nav_stacks || [];
    const stack = stacks.find(s => s.id === activeId);
    if (!stack) return html``;

    const children = stack.children || [];
    if (children.length === 0) return html``;

    // Determine stack orientation
    const isDesktop = this.isDesktop(navModule.nav_desktop);
    const isHorizontalNavbar = position === 'left' || position === 'right';
    let stackIsHorizontal: boolean;
    if (stack.orientation === 'horizontal') {
      stackIsHorizontal = true;
    } else if (stack.orientation === 'vertical') {
      stackIsHorizontal = false;
    } else {
      stackIsHorizontal = isHorizontalNavbar;
    }

    // Compute popup position using the button's viewport rect.
    // .navbar has position:fixed; inset:0 so its coord space = viewport.
    const gap = 8;
    let posStyle = '';
    if (position === 'bottom') {
      posStyle = `bottom: ${window.innerHeight - rect.top + gap}px; left: ${rect.left + rect.width / 2}px; transform: translateX(-50%);`;
    } else if (position === 'top') {
      posStyle = `top: ${rect.bottom + gap}px; left: ${rect.left + rect.width / 2}px; transform: translateX(-50%);`;
    } else if (position === 'left') {
      posStyle = `left: ${rect.right + gap}px; top: ${rect.top + rect.height / 2}px; transform: translateY(-50%);`;
    } else if (position === 'right') {
      posStyle = `right: ${window.innerWidth - rect.left + gap}px; top: ${rect.top + rect.height / 2}px; transform: translateY(-50%);`;
    }

    return html`
      <div
        class="stack-children ${stackIsHorizontal ? 'horizontal' : 'vertical'} from-${position}"
        style="
          position: absolute;
          ${posStyle}
          display: flex;
          flex-direction: ${stackIsHorizontal ? 'row' : 'column'};
          gap: 8px;
          padding: 8px;
          background: var(--uc-nav-dock-color, var(--navbar-background-color));
          border-radius: var(--navbar-border-radius, 12px);
          box-shadow: var(--navbar-box-shadow);
          backdrop-filter: blur(var(--navbar-backdrop-blur, 16px)) saturate(180%);
          -webkit-backdrop-filter: blur(var(--navbar-backdrop-blur, 16px)) saturate(180%);
          border: 1px solid var(--navbar-border-color, rgba(var(--rgb-primary-color), 0.1));
          pointer-events: auto;
          z-index: 100;
        "
        @click=${(e: Event) => e.stopPropagation()}
        @mouseenter=${() => {
          if (viewLayer._stackHoverTimer) {
            clearTimeout(viewLayer._stackHoverTimer);
            viewLayer._stackHoverTimer = undefined;
          }
        }}
        @mouseleave=${() => {
          if (stack.open_mode === 'hover') {
            viewLayer._stackHoverTimer = setTimeout(() => {
              if (viewLayer.activeStackId === stack.id) {
                viewLayer.activeStackId = undefined;
                viewLayer._stackButtonRect = undefined;
                this.requestRender(viewLayer);
              }
            }, 300);
          }
        }}
      >
        ${children.map((child, childIdx) =>
          this.renderStackChildItem(child, hass, navModule, registered, viewLayer, childIdx)
        )}
      </div>
    `;
  }

  private renderStackChildItem(
    child: NavRoute,
    hass: HomeAssistant,
    navModule: NavigationModule,
    registered: RegisteredModule,
    viewLayer: ViewNavLayer,
    childIndex: number = 0
  ): TemplateResult {
    // Resolve route properties (templates, images, etc.) the same way top-level routes do
    const resolvedChild = this.resolveRoute(child, hass, navModule, registered.config);

    const hidden = this.resolveBoolean(resolvedChild.hidden, false, hass, navModule, resolvedChild);
    if (hidden) return html``;

    const url = resolvedChild.url || '';
    const label = resolvedChild.label || '';
    const isSelected = url ? this.isCurrentUrl(url) : false;

    // Resolve image and icon exactly like renderRouteItem
    const resolvedImage = isSelected
      ? resolvedChild.image_selected || resolvedChild.image
      : resolvedChild.image;
    const resolvedIcon = isSelected
      ? resolvedChild.icon_selected || resolvedChild.icon
      : resolvedChild.icon || 'mdi:star-outline';
    const iconColor = isSelected && resolvedChild.selected_color
      ? resolvedChild.selected_color
      : resolvedChild.icon_color;

    // Badge
    const badgeTemplate = this.renderBadge(resolvedChild.badge, hass, navModule, resolvedChild);

    const handleClick = async (e?: Event) => {
      const actionElement = (e?.currentTarget as HTMLElement) || undefined;
      // Close the stack
      viewLayer.activeStackId = undefined;
      viewLayer._stackButtonRect = undefined;
      this.requestRender(viewLayer);

      // Block navigation in edit mode
      try {
        if (new URLSearchParams(window.location.search).get('edit') === '1') return;
      } catch {
        /* ignore */
      }

      // Handle tap_action if configured
      const action = resolvedChild.tap_action;
      if (action && action.action && action.action !== 'default' && action.action !== 'nothing') {
        if (action.action === 'url' && action.url_path) {
          window.open(action.url_path, '_blank', 'noopener');
          return;
        }
        if (action.action === 'open-popup' && action.popup_id) {
          openPopupById(action.popup_id);
          return;
        }
        if (action.action === 'navigate' && action.navigation_path) {
          await this.performNavigation(action.navigation_path, hass, registered, viewLayer, 'tap');
          return;
        }
        if (action.action === 'more-info' && action.entity) {
          const event = new CustomEvent('hass-more-info', {
            bubbles: true,
            composed: true,
            detail: { entityId: action.entity },
          });
          const hosts = [
            document.querySelector('home-assistant'),
            document.querySelector('home-assistant-main'),
            document,
            window,
          ].filter(Boolean) as Array<EventTarget>;
          hosts.forEach(host => host.dispatchEvent(event));
          return;
        }
        // Delegate other actions to the action service
        await ucActionService.handleAction(
          action as any,
          hass,
          actionElement,
          registered.config,
          undefined,
          registered.module
        );
        return;
      }

      // Fallback: Navigate if URL is set
      if (url) {
        await this.performNavigation(url, hass, registered, viewLayer, 'tap');
      }
    };

    // Staggered animation delay based on child index
    const animDelay = childIndex * 50;

    return html`
      <div
        class="stack-child-item route ${isSelected ? 'active' : ''}"
        @click=${handleClick}
        style="display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; padding: 4px; animation-delay: ${animDelay}ms;"
      >
        <div class="button ${isSelected ? 'active' : ''}" style="width: 40px; height: 40px;">
          ${resolvedImage
            ? html`
                <img
                  class="image ${isSelected ? 'active' : ''}"
                  src="${resolvedImage}"
                  alt="${label}"
                />
              `
            : resolvedIcon
              ? html`
                  <ha-icon
                    class="icon ${isSelected ? 'active' : ''}"
                    icon="${resolvedIcon}"
                    style="${iconColor ? `color:${iconColor};` : ''}"
                  ></ha-icon>
                `
              : html`
                  <ha-icon
                    class="icon ${isSelected ? 'active' : ''}"
                    icon="mdi:help-circle-outline"
                  ></ha-icon>
                `}
          ${badgeTemplate}
        </div>
        ${label
          ? html`<div class="label ${isSelected ? 'active' : ''}" style="font-size: 11px;">
              ${label}
            </div>`
          : ''}
      </div>
    `;
  }

  private renderBadge(
    badge: NavBadgeConfig | undefined,
    hass: HomeAssistant,
    navModule: NavigationModule,
    context: NavRoute
  ): TemplateResult {
    if (!badge) return html``;

    // Resolve badge count based on mode
    let count: string | number | undefined;
    const mode = badge.mode || 'static';

    if (mode === 'entity' && badge.entity) {
      // Pull from entity state or attribute
      const entityState = hass.states?.[badge.entity];
      if (entityState) {
        if (badge.entity_attribute && entityState.attributes) {
          count = entityState.attributes[badge.entity_attribute];
        } else {
          count = entityState.state;
        }
      }
    } else if (mode === 'template' && badge.count_template) {
      // Use JS template
      const resolved = this.resolveJsTemplate(
        badge.count_template,
        hass,
        navModule,
        undefined,
        context
      );
      count = resolved !== undefined && resolved !== null ? String(resolved) : undefined;
    } else {
      // Static mode - use count field
      count = this.resolveString(badge.count, hass, navModule, context);
    }

    // Convert to string for display
    const countStr = count !== undefined && count !== null ? String(count) : '';

    // Hide if zero and hide_when_zero is enabled
    if (badge.hide_when_zero !== false) {
      if (!countStr || countStr === '0' || countStr === 'unknown' || countStr === 'unavailable') {
        return html``;
      }
    }

    // Check explicit show condition
    const hasContent = !!countStr;
    const show = this.resolveBoolean(badge.show, hasContent, hass, navModule, context);
    if (!show) {
      return html``;
    }

    const bgColor = badge.color || 'red';
    const textColor = badge.text_color || badge.textColor || '#ffffff';

    return html`
      <span class="badge" style="background:${bgColor}; color:${textColor}"> ${countStr} </span>
    `;
  }

  /**
   * Check if media player should be rendered as an icon within the navbar routes
   */
  private shouldRenderMediaPlayerInNavbar(
    mediaPlayer: NavMediaPlayerConfig | undefined,
    hass: HomeAssistant,
    navModule: NavigationModule
  ): boolean {
    // Check if media player is enabled
    if (!mediaPlayer || !mediaPlayer.enabled || !mediaPlayer.entity) return false;

    const state = hass.states?.[mediaPlayer.entity];
    // Still render even without state - shows placeholder icon

    const displayMode = mediaPlayer.display_mode || 'icon_click';
    // Icon modes should render within the navbar (enabled always shows)
    return displayMode === 'icon' || displayMode === 'icon_hover' || displayMode === 'icon_click';
  }

  /**
   * Render routes with special items (media player, stacks) injected at specified positions
   */
  private renderRoutesWithMediaPlayer(
    routes: NavRoute[],
    mediaPlayer: NavMediaPlayerConfig | undefined,
    mediaPlayerInNavbar: boolean,
    hass: HomeAssistant,
    navModule: NavigationModule,
    registered: RegisteredModule,
    viewLayer: ViewNavLayer,
    showLabels: NavShowLabels
  ): TemplateResult[] {
    const routeTemplates = routes.map(route =>
      this.renderRouteItem(route, hass, navModule, registered, viewLayer, showLabels)
    );

    // Add stack items
    const stacks = navModule.nav_stacks || [];
    const stackTemplates = stacks.map(stack =>
      this.renderStackItem(stack, hass, navModule, registered, viewLayer, showLabels)
    );

    // Build list of special items to insert
    const specialItems: Array<{
      type: 'media_player' | 'stack';
      position: 'start' | 'end' | number;
      template: TemplateResult;
    }> = [];

    // Add stacks (they go at the end by default)
    stackTemplates.forEach((template, idx) => {
      specialItems.push({
        type: 'stack',
        position: 'end',
        template,
      });
    });

    // Add media player if enabled
    if (mediaPlayerInNavbar && mediaPlayer?.enabled) {
      const mediaPlayerIcon = this.renderMediaPlayerIcon(
        mediaPlayer,
        hass,
        navModule,
        registered,
        viewLayer,
        showLabels
      );
      specialItems.push({
        type: 'media_player',
        position: mediaPlayer.icon_position ?? 'end',
        template: mediaPlayerIcon,
      });
    }

    // If no special items, just return routes
    if (specialItems.length === 0) {
      return routeTemplates;
    }

    // Sort special items by position (start items first, then numbered, then end items)
    specialItems.sort((a, b) => {
      const posA = a.position === 'start' ? -1 : a.position === 'end' ? 999 : a.position;
      const posB = b.position === 'start' ? -1 : b.position === 'end' ? 999 : b.position;
      return posA - posB;
    });

    // Build final array with special items inserted
    const result = [...routeTemplates];
    let insertOffset = 0;

    for (const item of specialItems) {
      if (item.position === 'start') {
        result.unshift(item.template);
        insertOffset++;
      } else if (item.position === 'end') {
        result.push(item.template);
      } else if (typeof item.position === 'number') {
        const index = Math.max(0, Math.min(item.position + insertOffset, result.length));
        result.splice(index, 0, item.template);
        insertOffset++;
      }
    }

    return result;
  }

  /**
   * REMOVED: Settings icon was unreliable in Sections view
   */
  private renderSettingsIcon(
    registered: RegisteredModule,
    viewLayer: ViewNavLayer,
    showLabels: NavShowLabels,
    navModule: NavigationModule
  ): TemplateResult {
    return html``;
  }

  /**
   * Render media player as an icon/button in the navbar
   */
  private renderMediaPlayerIcon(
    mediaPlayer: NavMediaPlayerConfig,
    hass: HomeAssistant,
    navModule: NavigationModule,
    registered: RegisteredModule,
    viewLayer: ViewNavLayer,
    showLabels: NavShowLabels
  ): TemplateResult {
    const entity = mediaPlayer.entity!;
    const state = hass.states?.[entity];

    // Show play button even if no state (entity not found or idle)
    const isPlaying = state?.state === 'playing';
    const isPaused = state?.state === 'paused';
    const isIdle =
      !state || state.state === 'idle' || state.state === 'off' || state.state === 'unavailable';

    const displayMode = mediaPlayer.display_mode || 'icon';
    const isExpanded = viewLayer.mediaPlayerExpanded ?? false;
    const title = state?.attributes?.media_title || state?.attributes?.friendly_name || entity;
    const image = state?.attributes?.entity_picture;
    // Build cache-busted URL so album art refreshes on track change
    const imageUrl = this.getMediaImageUrl(hass, image, state);

    const mediaItem = {
      id: `media-${registered.moduleId}`,
      tap_action: mediaPlayer.tap_action,
      hold_action: mediaPlayer.hold_action,
      double_tap_action: mediaPlayer.double_tap_action,
    } as NavRoute;

    const handlers = this.createNavGestureHandlers(
      `uc-nav-media-${registered.cardId}-${registered.moduleId}`,
      mediaItem,
      hass,
      registered,
      viewLayer,
      ['.media-player-button']
    );

    // Normalize showLabels (handle both boolean and string values from config)
    let shouldShowLabel = false;
    const showLabelsValue = showLabels as boolean | string;
    if (showLabelsValue === true || showLabelsValue === 'true') {
      shouldShowLabel = true;
    } else if (showLabelsValue === 'routes_only') {
      shouldShowLabel = true;
    }

    // Handle click - play/pause, inactive action, or expand widget
    const handleClick = async () => {
      // Inactive (idle/off/unavailable only): use configured inactive_tap_action or default to play
      if (isIdle) {
        const inactiveAction = mediaPlayer.inactive_tap_action;
        if (inactiveAction) {
          if (inactiveAction.action === 'nothing') return;
          await this.executeNavAction(
            inactiveAction,
            mediaItem,
            hass,
            registered,
            viewLayer,
            'tap',
            undefined
          );
          return;
        }
        await this.toggleMediaPlayback(hass, entity, state?.state);
        return;
      }

      // Paused: always start playback (inactive action applies only to idle/off/unavailable)
      if (isPaused) {
        await this.toggleMediaPlayback(hass, entity, state?.state);
        return;
      }

      // If playing and in icon_click mode, expand the widget
      if (displayMode === 'icon_click') {
        viewLayer.mediaPlayerExpanded = !isExpanded;
        this.requestRender(viewLayer);
      }
    };

    // Handle hover for icon_hover mode
    const handleMouseEnter = () => {
      if (displayMode === 'icon_hover' && !isExpanded && isPlaying) {
        viewLayer.mediaPlayerExpanded = true;
        this.requestRender(viewLayer);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (displayMode === 'icon_hover') {
        // Check if we're leaving to the popup
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (relatedTarget?.closest('.media-player-popup')) {
          return; // Don't close if moving to popup
        }
        viewLayer.mediaPlayerExpanded = false;
        this.requestRender(viewLayer);
      }
    };

    // Determine which icon to show
    // Use background-image (like HA's hui-media-control-card) instead of
    // <img src> — background-image swaps are handled by the CSS engine and
    // update reliably when the URL changes, avoiding stale-image issues.
    let iconContent;
    if (isPlaying && image) {
      // Playing with album art - show album art
      iconContent = html`
        <div
          class="image media-album-art"
          role="img"
          aria-label="${title}"
          style="background-image: url('${imageUrl}');"
        ></div>
      `;
    } else if (isPlaying) {
      // Playing without album art - show music icon
      iconContent = html`<ha-icon class="icon active" icon="mdi:music"></ha-icon>`;
    } else if (isPaused && image) {
      // Paused with album art - show album art with play overlay
      iconContent = html`
        <div
          class="image media-album-art"
          role="img"
          aria-label="${title}"
          style="background-image: url('${imageUrl}'); opacity: 0.6;"
        ></div>
        <ha-icon
          class="icon media-play-overlay"
          icon="mdi:play"
          style="position: absolute;"
        ></ha-icon>
      `;
    } else {
      // Idle/paused/off - show play button
      iconContent = html`<ha-icon class="icon" icon="mdi:play"></ha-icon>`;
    }

    // Green background when playing (unless using album art background)
    const showGreenBg = isPlaying && !image;
    const buttonStyle = showGreenBg ? 'background: rgba(76, 175, 80, 0.3);' : '';

    return html`
      <div
        class="route media-route ${isPlaying ? 'active' : ''} ${isExpanded ? 'expanded' : ''}"
        data-media-player-icon
        @click=${handleClick}
        @mouseenter=${handleMouseEnter}
        @mouseleave=${handleMouseLeave}
        @pointerdown=${displayMode === 'icon_click' ? null : handlers.onPointerDown}
        @pointerup=${displayMode === 'icon_click' ? null : handlers.onPointerUp}
        @pointerleave=${handlers.onPointerLeave}
        @pointercancel=${handlers.onPointerCancel}
      >
        <div class="button ${isPlaying ? 'active' : ''} media-button" style="${buttonStyle}">
          ${iconContent}
        </div>
        ${shouldShowLabel ? html`<div class="label">Media</div>` : ''}
      </div>
    `;
  }

  /**
   * Render the media player widget popup (appears above the icon when expanded)
   */
  private renderMediaPlayerPopup(
    mediaPlayer: NavMediaPlayerConfig | undefined,
    hass: HomeAssistant,
    navModule: NavigationModule,
    registered: RegisteredModule,
    viewLayer: ViewNavLayer
  ): TemplateResult {
    if (!mediaPlayer || !mediaPlayer.entity) return html``;

    const displayMode = mediaPlayer.display_mode || 'widget';
    // Only show popup for icon modes when expanded
    if (displayMode === 'widget') return html``;

    const isExpanded = viewLayer.mediaPlayerExpanded ?? false;
    if (!isExpanded) return html``;

    const entity = mediaPlayer.entity;
    const state = hass.states?.[entity];
    if (!state) return html``;

    const title = state.attributes?.media_title || state.attributes?.friendly_name || entity;
    const artist = state.attributes?.media_artist || '';
    const image = state.attributes?.entity_picture;
    // Build cache-busted URL so album art refreshes on track change
    const imageUrl = this.getMediaImageUrl(hass, image, state);
    const albumBg = mediaPlayer.album_cover_background && image ? imageUrl : '';
    const widgetPosition = mediaPlayer.widget_position || 'above';

    const mediaItem = {
      id: `media-popup-${registered.moduleId}`,
      tap_action: mediaPlayer.tap_action,
      hold_action: mediaPlayer.hold_action,
      double_tap_action: mediaPlayer.double_tap_action,
    } as NavRoute;

    const handlers = this.createNavGestureHandlers(
      `uc-nav-media-popup-${registered.cardId}-${registered.moduleId}`,
      mediaItem,
      hass,
      registered,
      viewLayer,
      ['.media-player-button']
    );

    // Handle hover leave for icon_hover mode
    const handleMouseLeave = () => {
      if (displayMode === 'icon_hover') {
        viewLayer.mediaPlayerExpanded = false;
        this.requestRender(viewLayer);
      }
    };

    // Handle click outside to close for icon_click mode
    const handleBackdropClick = () => {
      if (displayMode === 'icon_click') {
        viewLayer.mediaPlayerExpanded = false;
        this.requestRender(viewLayer);
      }
    };

    // Calculate popup position based on the media player icon
    const popupId = `media-popup-${registered.cardId}-${registered.moduleId}`;

    // Schedule positioning after render - use double RAF to ensure layout is complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const popup = viewLayer.navLayer?.querySelector(`#${popupId}`) as HTMLElement;
        const mediaIcon = viewLayer.navLayer?.querySelector(
          '[data-media-player-icon]'
        ) as HTMLElement;

        if (popup && mediaIcon) {
          const iconRect = mediaIcon.getBoundingClientRect();

          // Get actual popup width after it's rendered
          const popupWidth = popup.offsetWidth || 300;

          // Center the popup horizontally on the icon
          let left = iconRect.left + iconRect.width / 2 - popupWidth / 2;

          // Keep popup within viewport bounds with padding
          const viewportWidth = window.innerWidth;
          const padding = 16;
          if (left < padding) left = padding;
          if (left + popupWidth > viewportWidth - padding) {
            left = viewportWidth - popupWidth - padding;
          }

          popup.style.left = `${left}px`;

          if (widgetPosition === 'above') {
            // Position above the icon with gap
            const bottom = window.innerHeight - iconRect.top + 12;
            popup.style.bottom = `${bottom}px`;
            popup.style.top = 'auto';
          } else {
            // Position below the icon with gap
            const top = iconRect.bottom + 12;
            popup.style.top = `${top}px`;
            popup.style.bottom = 'auto';
          }
        }
      });
    });

    return html`
      <div class="media-player-popup-backdrop" @click=${handleBackdropClick}></div>
      <div
        id="${popupId}"
        class="media-player-popup ${widgetPosition}"
        @mouseleave=${handleMouseLeave}
      >
        <div
          class="media-player-bg"
          style="${albumBg ? `background-image:url('${albumBg}');` : ''}"
        ></div>
        <div
          class="media-player-content"
          @pointerdown=${handlers.onPointerDown}
          @pointerup=${handlers.onPointerUp}
          @pointerleave=${handlers.onPointerLeave}
          @pointercancel=${handlers.onPointerCancel}
        >
          ${image
            ? html`
                <div
                  class="media-player-image"
                  style="background-image: url('${imageUrl}');"
                ></div>
              `
            : html``}
          <div class="media-player-info">
            <div class="media-player-title">${title}</div>
            ${artist ? html`<div class="media-player-artist">${artist}</div>` : ''}
          </div>
          <div class="media-player-controls">
            <button
              class="media-player-button"
              @click=${() =>
                hass.callService('media_player', 'media_previous_track', { entity_id: entity })}
            >
              <ha-icon icon="mdi:skip-previous"></ha-icon>
            </button>
            <button
              class="media-player-button media-player-button-play-pause"
              @click=${() => this.toggleMediaPlayback(hass, entity, state.state)}
            >
              <ha-icon icon="${state.state === 'playing' ? 'mdi:pause' : 'mdi:play'}"></ha-icon>
            </button>
            <button
              class="media-player-button"
              @click=${() =>
                hass.callService('media_player', 'media_next_track', { entity_id: entity })}
            >
              <ha-icon icon="mdi:skip-next"></ha-icon>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render media player as a standalone widget (for widget display mode only)
   */
  private renderMediaPlayerWidget(
    mediaPlayer: NavMediaPlayerConfig | undefined,
    hass: HomeAssistant,
    navModule: NavigationModule,
    isDesktop: boolean,
    registered: RegisteredModule,
    viewLayer: ViewNavLayer
  ): TemplateResult {
    if (!mediaPlayer || !mediaPlayer.entity) return html``;

    const entity = mediaPlayer.entity;
    const state = hass.states?.[entity];
    if (!state) return html``;

    const defaultShow = state.state === 'playing' || state.state === 'paused';
    const show = this.resolveBoolean(mediaPlayer.show, defaultShow, hass, navModule, state);
    if (!show) return html``;

    const displayMode = mediaPlayer.display_mode || 'widget';
    // Only render widget for widget mode
    if (displayMode !== 'widget') return html``;

    const title = state.attributes?.media_title || state.attributes?.friendly_name || entity;
    const artist = state.attributes?.media_artist || '';
    const image = state.attributes?.entity_picture;
    // Build cache-busted URL so album art refreshes on track change
    const imageUrl = this.getMediaImageUrl(hass, image, state);
    const albumBg = mediaPlayer.album_cover_background && image ? imageUrl : '';

    const position = mediaPlayer.desktop_position || 'bottom-center';
    const positionClass = isDesktop ? position : 'bottom-center';

    const mediaItem = {
      id: `media-${registered.moduleId}`,
      tap_action: mediaPlayer.tap_action,
      hold_action: mediaPlayer.hold_action,
      double_tap_action: mediaPlayer.double_tap_action,
    } as NavRoute;

    const handlers = this.createNavGestureHandlers(
      `uc-nav-media-${registered.cardId}-${registered.moduleId}`,
      mediaItem,
      hass,
      registered,
      viewLayer,
      ['.media-player-button']
    );

    return html`
      <div class="media-player ${positionClass}">
        <div
          class="media-player-bg"
          style="${albumBg ? `background-image:url('${albumBg}');` : ''}"
        ></div>
        <div
          class="media-player-content"
          @pointerdown=${handlers.onPointerDown}
          @pointerup=${handlers.onPointerUp}
          @pointerleave=${handlers.onPointerLeave}
          @pointercancel=${handlers.onPointerCancel}
        >
          ${image
            ? html`
                <div
                  class="media-player-image"
                  style="background-image: url('${imageUrl}');"
                ></div>
              `
            : html``}
          <div class="media-player-info">
            <div class="media-player-title">${title}</div>
            ${artist ? html`<div class="media-player-artist">${artist}</div>` : ''}
          </div>
          <div class="media-player-controls">
            <button
              class="media-player-button"
              @click=${() =>
                hass.callService('media_player', 'media_previous_track', { entity_id: entity })}
            >
              <ha-icon icon="mdi:skip-previous"></ha-icon>
            </button>
            <button
              class="media-player-button media-player-button-play-pause"
              @click=${() => this.toggleMediaPlayback(hass, entity, state.state)}
            >
              <ha-icon icon="${state.state === 'playing' ? 'mdi:pause' : 'mdi:play'}"></ha-icon>
            </button>
            <button
              class="media-player-button"
              @click=${() =>
                hass.callService('media_player', 'media_next_track', { entity_id: entity })}
            >
              <ha-icon icon="mdi:skip-next"></ha-icon>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private createNavGestureHandlers(
    elementId: string,
    item: NavRoute,
    hass: HomeAssistant,
    registered: RegisteredModule,
    viewLayer: ViewNavLayer,
    excludeSelectors: string[] = []
  ) {
    const state = this.getGestureState(elementId);
    const shouldExcludeTarget = (target: HTMLElement) =>
      excludeSelectors.some(selector => target.closest(selector));

    const executeAction = async (
      action: NavActionConfig | undefined,
      actionType: 'tap' | 'hold' | 'double',
      actionElement?: HTMLElement | null
    ) => {
      await this.executeNavAction(
        action,
        item,
        hass,
        registered,
        viewLayer,
        actionType,
        actionElement ?? state.lastTarget ?? undefined
      );
    };

    return {
      onPointerDown: (e: PointerEvent) => {
        const target = e.target as HTMLElement;
        if (shouldExcludeTarget(target)) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();

        state.isHolding = false;
        state.lastTarget = e.currentTarget as HTMLElement;

        if (!item.hold_action || item.hold_action.action === 'nothing') {
          return;
        }

        state.holdTimeout = setTimeout(async () => {
          state.isHolding = true;
          await executeAction(item.hold_action, 'hold');
          this.clearGestureState(elementId);
        }, 500);
      },
      onPointerUp: (e: PointerEvent) => {
        const target = e.target as HTMLElement;
        if (shouldExcludeTarget(target)) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();

        state.lastTarget = e.currentTarget as HTMLElement;

        if (state.holdTimeout) {
          clearTimeout(state.holdTimeout);
          state.holdTimeout = null;
        }

        if (state.isHolding) {
          this.clearGestureState(elementId);
          return;
        }

        const now = Date.now();
        const timeSinceLastClick = now - state.lastClickTime;
        state.lastClickTime = now;

        if (item.double_tap_action && timeSinceLastClick < 300) {
          state.clickCount += 1;
        } else {
          state.clickCount = 1;
        }

        if (state.clickTimeout) {
          clearTimeout(state.clickTimeout);
          state.clickTimeout = null;
        }

        if (state.clickCount === 2 && item.double_tap_action) {
          executeAction(item.double_tap_action, 'double', e.currentTarget as HTMLElement);
          this.clearGestureState(elementId);
          return;
        }

        state.clickTimeout = setTimeout(async () => {
          await executeAction(item.tap_action, 'tap', e.currentTarget as HTMLElement);
          this.clearGestureState(elementId);
        }, 250);
      },
      onPointerLeave: () => {
        // Only cancel hold gesture — do NOT cancel the click timeout.
        // On touch devices pointerleave fires right after pointerup when the
        // finger lifts, which would cancel the pending 250ms tap action.
        const s = this.gestureStates.get(elementId);
        if (s) {
          if (s.holdTimeout) {
            clearTimeout(s.holdTimeout);
            s.holdTimeout = null;
          }
          s.isHolding = false;
        }
      },
      onPointerCancel: () => {
        this.clearGestureState(elementId);
      },
    };
  }

  /**
   * Execute a nav action (navigate, url, open-popup, more-info, perform-action, etc.).
   * Reused by gesture handlers and by media player inactive tap.
   */
  private async executeNavAction(
    action: NavActionConfig | undefined,
    item: NavRoute,
    hass: HomeAssistant,
    registered: RegisteredModule,
    viewLayer: ViewNavLayer,
    actionType: 'tap' | 'hold' | 'double',
    actionElement?: HTMLElement | null
  ): Promise<void> {
    const element = actionElement ?? undefined;
    try {
      if (new URLSearchParams(window.location.search).get('edit') === '1') return;
    } catch {
      /* ignore */
    }

    if (!action) {
      if (item.url) {
        await this.performNavigation(item.url, hass, registered, viewLayer, actionType);
      }
      return;
    }

    if (action.action === 'nothing') {
      return;
    }

    if (action.action === 'default') {
      if (item.url) {
        await this.performNavigation(item.url, hass, registered, viewLayer, actionType);
      }
      return;
    }

    if (action.action === 'navigate' && action.navigation_path) {
      await this.performNavigation(
        action.navigation_path,
        hass,
        registered,
        viewLayer,
        actionType
      );
      return;
    }

    if (action.action === 'url' && action.url_path) {
      window.open(action.url_path, '_blank', 'noopener');
      this.triggerHaptic(actionType, registered);
      return;
    }

    if (action.action === 'open-popup' && action.popup_id) {
      openPopupById(action.popup_id);
      this.triggerHaptic(actionType, registered);
      return;
    }

    if (action.action === 'more-info' && action.entity) {
      const event = new CustomEvent('hass-more-info', {
        bubbles: true,
        composed: true,
        detail: { entityId: action.entity },
      });
      const hosts = [
        document.querySelector('home-assistant'),
        document.querySelector('home-assistant-main'),
        document,
        window,
      ].filter(Boolean) as Array<EventTarget>;
      hosts.forEach(host => host.dispatchEvent(event));
      this.triggerHaptic(actionType, registered);
      return;
    }

    await ucActionService.handleAction(
      action as any,
      hass,
      element,
      registered.config,
      undefined,
      registered.module
    );
    this.triggerHaptic(actionType, registered);
  }

  private async performNavigation(
    path: string,
    hass: HomeAssistant,
    registered: RegisteredModule,
    viewLayer: ViewNavLayer,
    actionType: 'tap' | 'hold' | 'double'
  ): Promise<void> {
    // Smart detection: external URLs open in a new tab
    if (/^https?:\/\//i.test(path)) {
      window.open(path, '_blank', 'noopener');
      this.triggerHaptic(actionType, registered);
      return;
    }

    await ucActionService.handleAction(
      { action: 'navigate', navigation_path: path } as any,
      hass,
      undefined,
      registered.config,
      undefined,
      registered.module
    );
    this.triggerHaptic('url', registered);
    this.triggerHaptic(actionType, registered);
  }

  private triggerHaptic(
    type: 'tap' | 'hold' | 'double' | 'url',
    registered: RegisteredModule
  ): void {
    // Use preview override if available for live haptic config updates
    const previewOverride = this.previewOverrides.get(registered.moduleId);
    const module = previewOverride?.module ?? registered.module;

    const hapticSetting = module.nav_haptic;
    if (hapticSetting === false) return;

    const config =
      typeof hapticSetting === 'object'
        ? hapticSetting
        : { url: false, tap_action: true, hold_action: true, double_tap_action: true };

    if (type === 'url' && !config.url) return;
    if (type === 'tap' && config.tap_action === false) return;
    if (type === 'hold' && config.hold_action === false) return;
    if (type === 'double' && config.double_tap_action === false) return;

    forwardHaptic('selection');
  }

  private getGestureState(elementId: string): NavGestureState {
    if (!this.gestureStates.has(elementId)) {
      this.gestureStates.set(elementId, {
        holdTimeout: null,
        clickTimeout: null,
        isHolding: false,
        clickCount: 0,
        lastClickTime: 0,
      });
    }
    return this.gestureStates.get(elementId)!;
  }

  private clearGestureState(elementId: string): void {
    const state = this.gestureStates.get(elementId);
    if (!state) return;

    if (state.holdTimeout) {
      clearTimeout(state.holdTimeout);
      state.holdTimeout = null;
    }
    if (state.clickTimeout) {
      clearTimeout(state.clickTimeout);
      state.clickTimeout = null;
    }
    state.isHolding = false;
    state.clickCount = 0;
  }

  // ── Auto-hide: macOS-style dock behavior ──────────────────────────

  private setupAutohide(
    viewLayer: ViewNavLayer,
    navModule: NavigationModule,
    position: string
  ): void {
    const delay = (navModule.nav_autohide?.delay ?? 3) * 1000;

    // Start the idle timer if not already hidden
    if (!viewLayer.autohideHidden && !viewLayer.autohideTimer) {
      viewLayer.autohideTimer = setTimeout(() => {
        viewLayer.autohideHidden = true;
        viewLayer.autohideTimer = undefined;
        this.requestRender(viewLayer);
      }, delay);
    }

    // Only install the global mouse handler once
    if (this.autohideActive) return;
    this.autohideActive = true;

    const edgeThreshold = 8; // px from edge to trigger reveal

    this.autohideMouseHandler = (e: MouseEvent) => {
      // Find the active view layer that uses autohide
      for (const layer of this.viewLayers.values()) {
        if (!layer.activeModule) continue;

        const previewOverride = this.previewOverrides.get(layer.activeModule.moduleId);
        const mod = previewOverride?.module ?? layer.activeModule.module;
        const cfg = previewOverride?.config ?? layer.activeModule.config;
        const navConfig = this.resolveNavigationConfig(mod, cfg);
        if (!navConfig.nav_autohide?.enabled) continue;

        const isDesk = this.isDesktop(navConfig.nav_desktop);
        const dConfig = isDesk ? navConfig.nav_desktop || {} : navConfig.nav_mobile || {};
        const pos = dConfig.position || (isDesk ? 'bottom' : 'bottom');
        const hideDelay = (navConfig.nav_autohide?.delay ?? 3) * 1000;

        const atEdge =
          (pos === 'bottom' && e.clientY >= window.innerHeight - edgeThreshold) ||
          (pos === 'top' && e.clientY <= edgeThreshold) ||
          (pos === 'left' && e.clientX <= edgeThreshold) ||
          (pos === 'right' && e.clientX >= window.innerWidth - edgeThreshold);

        if (atEdge && layer.autohideHidden) {
          // Reveal
          layer.autohideHidden = false;
          if (layer.autohideTimer) {
            clearTimeout(layer.autohideTimer);
            layer.autohideTimer = undefined;
          }
          this.requestRender(layer);
        }

        // Detect if mouse is over the navbar itself (reset idle timer)
        const navCard = layer.navLayer.querySelector('.navbar-card') as HTMLElement | null;
        if (navCard && !layer.autohideHidden) {
          const rect = navCard.getBoundingClientRect();
          const overNavbar =
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom;

          if (overNavbar) {
            // Reset timer while hovering
            if (layer.autohideTimer) {
              clearTimeout(layer.autohideTimer);
              layer.autohideTimer = undefined;
            }
          } else if (!layer.autohideTimer) {
            // Start idle timer when mouse leaves navbar
            layer.autohideTimer = setTimeout(() => {
              layer.autohideHidden = true;
              layer.autohideTimer = undefined;
              this.requestRender(layer);
            }, hideDelay);
          }
        }
      }
    };

    document.addEventListener('mousemove', this.autohideMouseHandler, { passive: true });
  }

  private teardownAutohide(viewLayer: ViewNavLayer): void {
    if (viewLayer.autohideTimer) {
      clearTimeout(viewLayer.autohideTimer);
      viewLayer.autohideTimer = undefined;
    }
    viewLayer.autohideHidden = false;

    // Only remove global listener if no layers use autohide
    if (this.autohideActive && this.autohideMouseHandler) {
      let anyActive = false;
      for (const layer of this.viewLayers.values()) {
        if (layer.activeModule) {
          const previewOverride = this.previewOverrides.get(layer.activeModule.moduleId);
          const mod = previewOverride?.module ?? layer.activeModule.module;
          const cfg = previewOverride?.config ?? layer.activeModule.config;
          const navConfig = this.resolveNavigationConfig(mod, cfg);
          if (navConfig.nav_autohide?.enabled) {
            anyActive = true;
            break;
          }
        }
      }
      if (!anyActive) {
        document.removeEventListener('mousemove', this.autohideMouseHandler);
        this.autohideMouseHandler = null;
        this.autohideActive = false;
      }
    }
  }

  /**
   * Universal media play/pause toggle that works with all media player integrations.
   * Tries multiple strategies with fallbacks to ensure maximum compatibility
   * (e.g. Spotify, Sonos, Google Cast, etc.).
   */
  private async toggleMediaPlayback(
    hass: HomeAssistant,
    entityId: string,
    currentState: string
  ): Promise<void> {
    const isPlaying = currentState === 'playing';
    const stateObj = hass.states[entityId];
    const features = stateObj?.attributes?.supported_features ?? 0;

    // Feature bitmask constants from HA MediaPlayerEntityFeature
    const SUPPORT_PAUSE = 1;
    const SUPPORT_PLAY = 16384;

    // Strategy 1: Use specific play/pause if supported by the entity
    if (isPlaying && features & SUPPORT_PAUSE) {
      try {
        await hass.callService('media_player', 'media_pause', { entity_id: entityId });
        return;
      } catch {
        // fall through
      }
    } else if (!isPlaying && features & SUPPORT_PLAY) {
      try {
        await hass.callService('media_player', 'media_play', { entity_id: entityId });
        return;
      } catch {
        // fall through
      }
    }

    // Strategy 2: Try the combined media_play_pause (some players only support this)
    try {
      await hass.callService('media_player', 'media_play_pause', { entity_id: entityId });
      return;
    } catch {
      // fall through
    }

    // Strategy 3: Brute-force try the opposite specific service
    try {
      if (isPlaying) {
        await hass.callService('media_player', 'media_pause', { entity_id: entityId });
      } else {
        await hass.callService('media_player', 'media_play', { entity_id: entityId });
      }
      return;
    } catch {
      // fall through
    }

    // Strategy 4: Open the more-info dialog so the user can control playback natively
    const event = new CustomEvent('hass-more-info', {
      bubbles: true,
      composed: true,
      detail: { entityId },
    });
    document.querySelector('home-assistant')?.dispatchEvent(event);
  }

  private requestRender(viewLayer: ViewNavLayer): void {
    if (!viewLayer.activeModule) return;
    // Ensure we render with the freshest hass (media player state, etc.)
    this.getFreshHass(viewLayer.activeModule);
    const navConfig = this.resolveNavigationConfig(
      viewLayer.activeModule.module,
      viewLayer.activeModule.config
    );
    const template = this.renderNavigationTemplate(navConfig, viewLayer.activeModule, viewLayer);
    render(template, viewLayer.navLayer);
  }

  private resolveRoute(
    route: NavRoute,
    hass: HomeAssistant,
    navModule: NavigationModule,
    config?: UltraCardConfig
  ) {
    const icon = this.resolveString(route.icon, hass, navModule, route);
    const iconSelected = this.resolveString(route.icon_selected, hass, navModule, route);
    const image = this.resolveString(route.image, hass, navModule, route);
    const imageSelected = this.resolveString(route.image_selected, hass, navModule, route);
    const label = this.resolveString(route.label, hass, navModule, route);
    const url = this.resolveString(route.url, hass, navModule, route);

    const hidden = this.resolveBoolean(route.hidden, false, hass, navModule, route);

    return {
      ...route,
      url,
      label,
      icon,
      icon_selected: iconSelected,
      image: this.getResolvedImage(image, hass),
      image_selected: this.getResolvedImage(imageSelected, hass),
      icon_color: this.resolveString(route.icon_color, hass, navModule, route) || undefined,
      selected: route.selected,
      selected_color: this.resolveString(route.selected_color, hass, navModule, route) || undefined,
      hidden,
    };
  }

  private getRouteSelection(route: NavRoute, navModule: NavigationModule, hass: HomeAssistant) {
    let isSelected = false;

    if (typeof route.selected === 'boolean') {
      isSelected = route.selected;
    } else if (typeof route.selected === 'string') {
      isSelected = this.resolveBoolean(route.selected, false, hass, navModule, route);
    } else if (route.url) {
      isSelected = this.isCurrentUrl(route.url);
    }

    const selectedColor = route.selected_color;
    return { isSelected, selectedColor };
  }

  private isCurrentUrl(targetUrl: string): boolean {
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const normalizedTarget = targetUrl.trim();
    if (!normalizedTarget) return false;

    if (current === normalizedTarget) return true;
    if (current.startsWith(`${normalizedTarget}?`)) return true;
    if (current.startsWith(`${normalizedTarget}#`)) return true;
    if (current.startsWith(`${normalizedTarget}/`)) return true;
    return false;
  }

  private resolveBoolean(
    value: boolean | string | undefined,
    defaultValue: boolean | undefined,
    hass: HomeAssistant,
    navModule: NavigationModule,
    context: any
  ): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === 'true') return true;
      if (trimmed === 'false') return false;
      const resolved = this.resolveJsTemplate(trimmed, hass, navModule, undefined, context);
      if (typeof resolved === 'boolean') return resolved;
      if (typeof resolved === 'string') {
        if (resolved.trim() === 'true') return true;
        if (resolved.trim() === 'false') return false;
      }
    }
    return defaultValue ?? false;
  }

  private resolveString(
    value: string | undefined,
    hass: HomeAssistant,
    navModule: NavigationModule,
    context: any
  ): string | undefined {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return '';
    const resolved = this.resolveJsTemplate(trimmed, hass, navModule, undefined, context);
    if (resolved === undefined || resolved === null) return '';
    return String(resolved);
  }

  private resolveJsTemplate(
    value: string,
    hass: HomeAssistant,
    navModule: NavigationModule,
    config?: UltraCardConfig,
    context?: any
  ): any {
    if (!value.includes('[[[')) return value;
    const match = value.match(/\[\[\[([\s\S]*)\]\]\]/);
    if (!match) return value;

    const code = match[1];
    try {
      const fn = new Function(
        'hass',
        'config',
        'route',
        'nav',
        'states',
        'user',
        'return (function() { ' + code + ' })();'
      );
      return fn(hass, config, context, navModule, hass.states, hass.user);
    } catch (error) {
      console.warn('[UltraCard] Failed to evaluate JS template:', error);
      return value;
    }
  }

  private getResolvedImage(image: string | undefined, hass: HomeAssistant): string | undefined {
    if (!image) return undefined;
    return getImageUrl(hass, image);
  }

  /**
   * Build a cache-busted image URL for media player album art.
   * HA media player proxy URLs (e.g. /api/media_player_proxy/...) don't change
   * between tracks even though the served content does. Appending the entity's
   * last_updated timestamp forces the browser to re-fetch when the track changes.
   */
  private getMediaImageUrl(
    hass: HomeAssistant,
    image: string | undefined,
    _state: { last_updated?: string; last_changed?: string } | undefined
  ): string {
    if (!image) return '';

    // Match HA's own hui-media-control-card behaviour exactly:
    //   url = hass.hassUrl(entity_picture)
    // hassUrl() resolves relative proxy paths against the HA base URL.
    // No extra query params — HA's built-in `cache` hash already changes
    // per track and is the only cache-buster needed.
    const hassUrl = (hass as any).hassUrl;
    const result = typeof hassUrl === 'function' ? hassUrl(image) : image;
    return result || '';
  }

  private isDesktop(desktopConfig?: NavDesktopConfig): boolean {
    const minWidth = desktopConfig?.min_width ?? this.defaultDesktopMinWidth;
    return window.innerWidth >= minWidth;
  }

  private getDockedStyle(position: string, isDesktop: boolean, offset: number = 0): string {
    const offsetMargin = offset > 0 ? ` margin-${position}: ${offset}px;` : '';
    if (position === 'left' || position === 'right') {
      return `height: 100%; width: ${isDesktop ? '72px' : '64px'}; border-radius: 0;${offsetMargin}`;
    }
    return `width: 100%; border-radius: 0;${offsetMargin}`;
  }

  /** Convert a CSS color string to rgba with a given alpha (for glass tinting) */
  private toRgbaColor(color: string, alpha: number): string {
    // If already an rgba, replace alpha
    if (color.startsWith('rgba(')) {
      return color.replace(/,\s*[\d.]+\s*\)$/, `, ${alpha})`);
    }
    // If rgb(), convert to rgba
    if (color.startsWith('rgb(')) {
      return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }
    // If hex, convert
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    }
    // For var() or other CSS values, wrap in color-mix
    return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
  }

  private getFloatingOffsetStyle(position: string, offset: number): string {
    // Apply margin based on position to push navbar away from the edge
    switch (position) {
      case 'top':
        return `margin-top: ${offset}px;`;
      case 'bottom':
        return `margin-bottom: ${offset}px;`;
      case 'left':
        return `margin-left: ${offset}px;`;
      case 'right':
        return `margin-right: ${offset}px;`;
      default:
        return `margin-bottom: ${offset}px;`;
    }
  }

  private buildBaseStyles(navStyle?: string): string {
    const styleMap: Record<string, string> = {
      uc_modern: `
        --navbar-primary-color: var(--primary-color);
        --navbar-border-radius: 14px;
        --navbar-route-icon-size: 22px;
        --navbar-background-color: var(--card-background-color);
        --navbar-box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
        --navbar-backdrop-blur: 0px;
        --navbar-button-bg: rgba(var(--rgb-primary-color), 0.08);
        --navbar-button-hover-bg: rgba(var(--rgb-primary-color), 0.14);
        --navbar-button-active-bg: rgba(var(--rgb-primary-color), 0.22);
        --navbar-icon-color: var(--primary-text-color);
        --navbar-icon-active-color: var(--primary-color);
        --navbar-button-radius: 10px;
      `,
      uc_minimal: `
        --navbar-primary-color: var(--primary-color);
        --navbar-border-radius: 8px;
        --navbar-route-icon-size: 20px;
        --navbar-background-color: var(--card-background-color);
        --navbar-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        --navbar-backdrop-blur: 0px;
        --navbar-button-bg: transparent;
        --navbar-button-hover-bg: rgba(var(--rgb-primary-color), 0.08);
        --navbar-button-active-bg: rgba(var(--rgb-primary-color), 0.14);
        --navbar-icon-color: var(--secondary-text-color);
        --navbar-icon-active-color: var(--primary-color);
        --navbar-button-radius: 8px;
      `,
      uc_ios_glass: `
        --navbar-primary-color: var(--primary-color);
        --navbar-border-radius: 20px;
        --navbar-route-icon-size: 24px;
        --navbar-background-color: rgba(255, 255, 255, 0.25);
        --navbar-box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5);
        --navbar-backdrop-blur: 40px;
        --navbar-border-color: rgba(255, 255, 255, 0.3);
        --navbar-button-bg: rgba(255, 255, 255, 0.15);
        --navbar-button-hover-bg: rgba(255, 255, 255, 0.25);
        --navbar-button-active-bg: rgba(255, 255, 255, 0.35);
        --navbar-icon-color: var(--primary-text-color);
        --navbar-icon-active-color: var(--primary-color);
        --navbar-button-radius: 14px;
      `,
      uc_material: `
        --navbar-primary-color: var(--primary-color);
        --navbar-border-radius: 16px;
        --navbar-route-icon-size: 22px;
        --navbar-background-color: var(--card-background-color);
        --navbar-box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15);
        --navbar-backdrop-blur: 0px;
        --navbar-button-bg: rgba(var(--rgb-primary-color), 0.06);
        --navbar-button-hover-bg: rgba(var(--rgb-primary-color), 0.12);
        --navbar-button-active-bg: rgba(var(--rgb-primary-color), 0.18);
        --navbar-icon-color: var(--primary-text-color);
        --navbar-icon-active-color: var(--primary-color);
        --navbar-button-radius: 50%;
      `,
      uc_floating: `
        --navbar-primary-color: var(--primary-color);
        --navbar-border-radius: 999px;
        --navbar-route-icon-size: 20px;
        --navbar-background-color: var(--card-background-color);
        --navbar-box-shadow: 0 10px 40px rgba(0, 0, 0, 0.24);
        --navbar-backdrop-blur: 8px;
        --navbar-button-bg: rgba(var(--rgb-primary-color), 0.08);
        --navbar-button-hover-bg: rgba(var(--rgb-primary-color), 0.14);
        --navbar-button-active-bg: rgba(var(--rgb-primary-color), 0.22);
        --navbar-icon-color: var(--primary-text-color);
        --navbar-icon-active-color: var(--primary-color);
        --navbar-button-radius: 50%;
      `,
      uc_docked: `
        --navbar-primary-color: var(--primary-color);
        --navbar-border-radius: 0;
        --navbar-route-icon-size: 22px;
        --navbar-background-color: var(--card-background-color);
        --navbar-box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.1);
        --navbar-backdrop-blur: 0px;
        --navbar-button-bg: rgba(var(--rgb-primary-color), 0.06);
        --navbar-button-hover-bg: rgba(var(--rgb-primary-color), 0.12);
        --navbar-button-active-bg: rgba(var(--rgb-primary-color), 0.2);
        --navbar-icon-color: var(--primary-text-color);
        --navbar-icon-active-color: var(--primary-color);
        --navbar-button-radius: 10px;
      `,
      uc_neumorphic: `
        --navbar-primary-color: var(--primary-color);
        --navbar-border-radius: 16px;
        --navbar-route-icon-size: 22px;
        --navbar-background-color: var(--card-background-color);
        --navbar-box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.2), -6px -6px 12px rgba(255, 255, 255, 0.05);
        --navbar-backdrop-blur: 0px;
        --navbar-button-bg: var(--card-background-color);
        --navbar-button-hover-bg: var(--card-background-color);
        --navbar-button-active-bg: var(--card-background-color);
        --navbar-icon-color: var(--secondary-text-color);
        --navbar-icon-active-color: var(--primary-color);
        --navbar-button-radius: 12px;
        --navbar-button-shadow: inset 2px 2px 4px rgba(0,0,0,0.15), inset -2px -2px 4px rgba(255,255,255,0.05);
        --navbar-button-active-shadow: inset 3px 3px 6px rgba(0,0,0,0.25), inset -3px -3px 6px rgba(255,255,255,0.05);
      `,
      uc_gradient: `
        --navbar-primary-color: #ffffff;
        --navbar-border-radius: 16px;
        --navbar-route-icon-size: 24px;
        --navbar-background-color: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        --navbar-box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
        --navbar-backdrop-blur: 0px;
        --navbar-button-bg: rgba(255, 255, 255, 0.15);
        --navbar-button-hover-bg: rgba(255, 255, 255, 0.25);
        --navbar-button-active-bg: rgba(255, 255, 255, 0.35);
        --navbar-icon-color: rgba(255, 255, 255, 0.9);
        --navbar-icon-active-color: #ffffff;
        --navbar-button-radius: 12px;
      `,
      uc_sidebar: `
        --navbar-primary-color: var(--primary-color);
        --navbar-border-radius: 12px;
        --navbar-route-icon-size: 24px;
        --navbar-background-color: var(--card-background-color);
        --navbar-box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14);
        --navbar-backdrop-blur: 0px;
        --navbar-button-bg: rgba(var(--rgb-primary-color), 0.06);
        --navbar-button-hover-bg: rgba(var(--rgb-primary-color), 0.12);
        --navbar-button-active-bg: rgba(var(--rgb-primary-color), 0.2);
        --navbar-icon-color: var(--primary-text-color);
        --navbar-icon-active-color: var(--primary-color);
        --navbar-button-radius: 10px;
      `,
      uc_compact: `
        --navbar-primary-color: var(--primary-color);
        --navbar-border-radius: 10px;
        --navbar-route-icon-size: 18px;
        --navbar-background-color: var(--card-background-color);
        --navbar-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        --navbar-backdrop-blur: 0px;
        --navbar-button-bg: rgba(var(--rgb-primary-color), 0.06);
        --navbar-button-hover-bg: rgba(var(--rgb-primary-color), 0.12);
        --navbar-button-active-bg: rgba(var(--rgb-primary-color), 0.2);
        --navbar-icon-color: var(--primary-text-color);
        --navbar-icon-active-color: var(--primary-color);
        --navbar-button-radius: 8px;
      `,
    };

    const styleVars = styleMap[navStyle || 'uc_modern'] || styleMap.uc_modern;

    return `
      .navbar {
        position: fixed;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        pointer-events: none;
        z-index: ${Z_INDEX.CARD_CONTROLS};
        ${styleVars}
        --navbar-route-image-size: 28px;
        --navbar-box-shadow-mobile-floating: 0 10px 24px rgba(0, 0, 0, 0.2);
        --navbar-box-shadow-desktop: 0 12px 28px rgba(0, 0, 0, 0.18);
        --navbar-z-index: 3;
        --navbar-popup-backdrop-z-index: 900;
        --navbar-popup-z-index: 901;
      }
      .navbar.top {
        align-items: flex-start;
      }
      .navbar.bottom {
        align-items: flex-end;
      }
      .navbar.left {
        justify-content: flex-start;
        align-items: center;
      }
      .navbar.right {
        justify-content: flex-end;
        align-items: center;
      }
      .navbar-card {
        pointer-events: auto;
        position: relative;
        z-index: 60;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--uc-nav-icon-gap, 8px);
        padding: 8px 10px;
        background-image: var(--uc-nav-dock-color, var(--navbar-background-color));
        background-color: var(--uc-nav-dock-color, var(--navbar-background-color));
        border-radius: var(--navbar-border-radius);
        box-shadow: var(--navbar-box-shadow);
        border: 1px solid var(--navbar-border-color, rgba(var(--rgb-primary-color), 0.1));
        backdrop-filter: blur(var(--navbar-backdrop-blur, 16px)) saturate(180%);
        -webkit-backdrop-filter: blur(var(--navbar-backdrop-blur, 16px)) saturate(180%);
      }
      .navbar-card.floating {
        margin: 12px;
      }
      .navbar-card.desktop {
        box-shadow: var(--navbar-box-shadow);
      }
      .navbar-card.desktop.floating {
        margin: 16px;
      }
      .navbar-card.mobile.floating {
        box-shadow: var(--navbar-box-shadow-mobile-floating);
        margin: 12px;
      }

      /* ── Mobile horizontal scroll when too many icons ── */
      .navbar-card.mobile.bottom,
      .navbar-card.mobile.top {
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none; /* Firefox */
      }
      .navbar-card.mobile.bottom::-webkit-scrollbar,
      .navbar-card.mobile.top::-webkit-scrollbar {
        display: none; /* Chrome/Safari */
      }
      .navbar-card.mobile.floating.bottom,
      .navbar-card.mobile.floating.top {
        max-width: calc(100vw - 24px); /* account for floating margins */
      }
      /* Vertical mobile navbar scroll */
      .navbar-card.mobile.left,
      .navbar-card.mobile.right {
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
      }
      .navbar-card.mobile.left::-webkit-scrollbar,
      .navbar-card.mobile.right::-webkit-scrollbar {
        display: none;
      }
      .navbar-card.mobile.floating.left,
      .navbar-card.mobile.floating.right {
        max-height: calc(100vh - 24px);
      }

      .navbar-card.docked {
        margin: 0;
        border-left: none;
        border-right: none;
      }
      .navbar-card.docked.bottom {
        border-bottom: none;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }
      .navbar-card.docked.top {
        border-top: none;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
      }
      .navbar-card.left,
      .navbar-card.right {
        flex-direction: column;
        padding: 12px 10px;
      }
      .navbar-card.docked.left {
        border-left: none;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
      .navbar-card.docked.right {
        border-right: none;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
      .route {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        min-width: 52px;
        flex-shrink: 0;
        cursor: pointer;
        user-select: none;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease;
      }
      .route:hover {
        transform: translateY(-2px);
      }
      .button {
        position: relative;
        width: 44px;
        height: 44px;
        border-radius: var(--navbar-button-radius, calc(var(--navbar-border-radius) * 0.7));
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--navbar-button-bg, rgba(var(--rgb-primary-color), 0.08));
        box-shadow: var(--navbar-button-shadow, none);
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease, box-shadow 0.25s ease, filter 0.2s ease;
      }
      .button:hover {
        background: var(--navbar-button-hover-bg, rgba(var(--rgb-primary-color), 0.12));
      }
      .button.active {
        background: var(--navbar-button-active-bg, rgba(var(--rgb-primary-color), 0.2));
        box-shadow: var(--navbar-button-active-shadow, 0 6px 14px rgba(var(--rgb-primary-color), 0.25));
      }
      .icon {
        --mdc-icon-size: var(--navbar-route-icon-size);
        color: var(--uc-nav-icon-color, var(--navbar-icon-color, var(--primary-text-color)));
        transition: color 0.2s ease, transform 0.2s ease;
      }
      .icon.active {
        color: var(--uc-nav-icon-color, var(--navbar-icon-active-color, var(--navbar-primary-color)));
      }
      /* Text-only mode: no icon button, just the label acts as the route */
      .route.text-only {
        min-width: auto;
        padding: 8px 12px;
      }
      .route.text-only .label {
        font-size: 14px;
      }
      .route.text-only .label.active {
        color: var(--uc-nav-icon-color, var(--navbar-icon-active-color, var(--navbar-primary-color)));
      }

      /* ── Per-style hover animations (routes + stack icon + stack children) ── */
      /* .route:hover > .button uses direct child selector so stack popup children are unaffected */

      /* Modern: lift + shadow bloom */
      .style-uc_modern .route:hover > .button,
      .style-uc_modern .stack-child-item:hover .button {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 6px 16px rgba(var(--rgb-primary-color), 0.25);
      }

      /* Minimal: subtle scale */
      .style-uc_minimal .route:not(.stack-item):hover,
      .style-uc_minimal .stack-child-item:hover {
        transform: none;
      }
      .style-uc_minimal .route:hover > .button,
      .style-uc_minimal .stack-child-item:hover .button {
        transform: scale(1.08);
      }

      /* iOS Glass: glow + lift */
      .style-uc_ios_glass .route:hover > .button,
      .style-uc_ios_glass .stack-child-item:hover .button {
        transform: translateY(-4px) scale(1.08);
        box-shadow: 0 4px 20px rgba(var(--rgb-primary-color), 0.3), 0 0 12px rgba(255,255,255,0.15);
        filter: brightness(1.1);
      }

      /* Material: scale pulse (ripple-like) */
      .style-uc_material .route:not(.stack-item):hover,
      .style-uc_material .stack-child-item:hover {
        transform: none;
      }
      .style-uc_material .route:hover > .button,
      .style-uc_material .stack-child-item:hover .button {
        transform: scale(1.12);
      }
      .style-uc_material .route:active > .button,
      .style-uc_material .stack-child-item:active .button {
        transform: scale(0.92);
        transition-duration: 0.1s;
      }

      /* Floating: bounce up */
      .style-uc_floating .route:not(.stack-item):hover {
        transform: translateY(-6px);
      }
      .style-uc_floating .stack-item:hover > .button {
        transform: translateY(-6px) scale(1.1);
        box-shadow: 0 8px 20px rgba(var(--rgb-primary-color), 0.3);
      }
      .style-uc_floating .route:not(.stack-item):hover > .button,
      .style-uc_floating .stack-child-item:hover .button {
        transform: scale(1.1);
        box-shadow: 0 8px 20px rgba(var(--rgb-primary-color), 0.3);
      }
      .style-uc_floating .stack-child-item:hover {
        transform: translateY(-3px);
      }

      /* Docked: highlight bar + scale */
      .style-uc_docked .route:not(.stack-item):hover,
      .style-uc_docked .stack-child-item:hover {
        transform: none;
      }
      .style-uc_docked .route:hover > .button,
      .style-uc_docked .stack-child-item:hover .button {
        transform: scale(1.06);
      }
      .style-uc_docked .route::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 50%;
        width: 0;
        height: 3px;
        background: var(--uc-nav-icon-color, var(--navbar-primary-color));
        border-radius: 2px;
        transform: translateX(-50%);
        transition: width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .style-uc_docked .route:hover::after,
      .style-uc_docked .route.active::after {
        width: 20px;
      }

      /* Neumorphic: press-in effect */
      .style-uc_neumorphic .route:not(.stack-item):hover,
      .style-uc_neumorphic .stack-child-item:hover {
        transform: none;
      }
      .style-uc_neumorphic .route:hover > .button,
      .style-uc_neumorphic .stack-child-item:hover .button {
        box-shadow: inset 3px 3px 6px rgba(0,0,0,0.2), inset -3px -3px 6px rgba(255,255,255,0.05);
        transform: scale(0.96);
      }
      .style-uc_neumorphic .route:active > .button,
      .style-uc_neumorphic .stack-child-item:active .button {
        box-shadow: inset 4px 4px 8px rgba(0,0,0,0.3), inset -4px -4px 8px rgba(255,255,255,0.05);
        transform: scale(0.93);
      }

      /* Gradient: glow + lift + brighten */
      .style-uc_gradient .route:hover > .button,
      .style-uc_gradient .stack-child-item:hover .button {
        transform: translateY(-3px) scale(1.08);
        box-shadow: 0 6px 24px rgba(255,255,255,0.2);
        filter: brightness(1.15);
      }

      /* Sidebar: scale + shadow */
      .style-uc_sidebar .route:not(.stack-item):hover,
      .style-uc_sidebar .stack-child-item:hover {
        transform: none;
      }
      .style-uc_sidebar .route:hover > .button,
      .style-uc_sidebar .stack-child-item:hover .button {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(var(--rgb-primary-color), 0.2);
      }

      /* Compact: quick snap scale */
      .style-uc_compact .route:not(.stack-item):hover,
      .style-uc_compact .stack-child-item:hover {
        transform: none;
      }
      .style-uc_compact .route:hover > .button,
      .style-uc_compact .stack-child-item:hover .button {
        transform: scale(1.15);
      }
      .style-uc_compact .route:active > .button,
      .style-uc_compact .stack-child-item:active .button {
        transform: scale(0.9);
        transition-duration: 0.1s;
      }

      /* Custom dock color: ensure label contrast too */
      .navbar-card.has-dock-color .label {
        color: rgba(255, 255, 255, 0.85);
      }
      .navbar-card.has-dock-color .label.active {
        color: #fff;
      }
      .image {
        width: var(--navbar-route-image-size);
        height: var(--navbar-route-image-size);
        border-radius: 50%;
        object-fit: cover;
      }
      .label {
        font-size: 12px;
        font-weight: 600;
        color: var(--primary-text-color);
        white-space: nowrap;
      }
      .stack-item {
        position: relative;
        flex-shrink: 0;
      }
      /* Stack icon hover — direct child only, not popup children */
      .stack-item:hover > .button {
        background: var(--navbar-button-hover-bg, rgba(var(--rgb-primary-color), 0.12));
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 6px 16px rgba(var(--rgb-primary-color), 0.2);
      }
      .stack-item:hover > .button > .icon {
        color: var(--uc-nav-icon-color, var(--navbar-icon-active-color, var(--navbar-primary-color)));
      }
      .stack-item.expanded > .button {
        background: var(--navbar-button-active-bg, rgba(var(--rgb-primary-color), 0.2));
        box-shadow: var(--navbar-button-active-shadow, 0 4px 10px rgba(var(--rgb-primary-color), 0.2));
      }
      /* Stack container entrance — subtle scale + fade */
      .stack-children {
        animation: stack-container-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      .stack-children.from-bottom {
        transform-origin: center bottom;
        animation-name: stack-container-from-bottom;
      }
      .stack-children.from-top {
        transform-origin: center top;
        animation-name: stack-container-from-top;
      }
      .stack-children.from-left {
        transform-origin: left center;
        animation-name: stack-container-from-left;
      }
      .stack-children.from-right {
        transform-origin: right center;
        animation-name: stack-container-from-right;
      }
      @keyframes stack-container-from-bottom {
        from { opacity: 0; transform: translateX(-50%) scaleY(0.6) scaleX(0.9); }
        to   { opacity: 1; transform: translateX(-50%) scaleY(1) scaleX(1); }
      }
      @keyframes stack-container-from-top {
        from { opacity: 0; transform: translateX(-50%) scaleY(0.6) scaleX(0.9); }
        to   { opacity: 1; transform: translateX(-50%) scaleY(1) scaleX(1); }
      }
      @keyframes stack-container-from-left {
        from { opacity: 0; transform: translateY(-50%) scaleX(0.6) scaleY(0.9); }
        to   { opacity: 1; transform: translateY(-50%) scaleX(1) scaleY(1); }
      }
      @keyframes stack-container-from-right {
        from { opacity: 0; transform: translateY(-50%) scaleX(0.6) scaleY(0.9); }
        to   { opacity: 1; transform: translateY(-50%) scaleX(1) scaleY(1); }
      }
      @keyframes stack-container-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }

      /* Each child item slides in from the dock direction with stagger */
      .stack-child-item {
        opacity: 0;
        animation: stack-child-slide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        transition: transform 0.15s ease, background 0.15s ease;
      }
      .stack-children.from-bottom .stack-child-item {
        animation-name: stack-child-slide-up;
      }
      .stack-children.from-top .stack-child-item {
        animation-name: stack-child-slide-down;
      }
      .stack-children.from-left .stack-child-item {
        animation-name: stack-child-slide-right;
      }
      .stack-children.from-right .stack-child-item {
        animation-name: stack-child-slide-left;
      }
      @keyframes stack-child-slide-up {
        from { opacity: 0; transform: translateY(24px) scale(0.7); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes stack-child-slide-down {
        from { opacity: 0; transform: translateY(-24px) scale(0.7); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes stack-child-slide-right {
        from { opacity: 0; transform: translateX(-24px) scale(0.7); }
        to   { opacity: 1; transform: translateX(0) scale(1); }
      }
      @keyframes stack-child-slide-left {
        from { opacity: 0; transform: translateX(24px) scale(0.7); }
        to   { opacity: 1; transform: translateX(0) scale(1); }
      }
      @keyframes stack-child-slide {
        from { opacity: 0; transform: scale(0.7); }
        to   { opacity: 1; transform: scale(1); }
      }
      /* Stack child items use the same style variables as dock items */
      .stack-child-item .button {
        background: var(--navbar-button-bg, rgba(var(--rgb-primary-color), 0.08));
        border-radius: var(--navbar-button-radius, calc(var(--navbar-border-radius) * 0.7));
        box-shadow: var(--navbar-button-shadow, none);
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease, box-shadow 0.25s ease, filter 0.2s ease;
      }
      .stack-child-item .button:hover {
        background: var(--navbar-button-hover-bg, rgba(var(--rgb-primary-color), 0.12));
      }
      .stack-child-item .button.active {
        background: var(--navbar-button-active-bg, rgba(var(--rgb-primary-color), 0.2));
        box-shadow: var(--navbar-button-active-shadow, 0 4px 10px rgba(var(--rgb-primary-color), 0.2));
      }
      .stack-child-item .icon {
        color: var(--uc-nav-icon-color, var(--navbar-icon-color, var(--primary-text-color)));
      }
      .stack-child-item .icon.active {
        color: var(--uc-nav-icon-color, var(--navbar-icon-active-color, var(--navbar-primary-color)));
      }
      .stack-child-item .label {
        color: var(--primary-text-color);
      }
      .stack-child-item:hover {
        transform: scale(1.05);
      }

      /* Per-style hover for stack children */
      .style-uc_modern .stack-child-item:hover .button {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 4px 12px rgba(var(--rgb-primary-color), 0.2);
      }
      .style-uc_ios_glass .stack-child-item:hover .button {
        transform: translateY(-2px) scale(1.06);
        box-shadow: 0 4px 16px rgba(var(--rgb-primary-color), 0.25), 0 0 8px rgba(255,255,255,0.1);
        filter: brightness(1.1);
      }
      .style-uc_material .stack-child-item:hover .button {
        transform: scale(1.1);
      }
      .style-uc_material .stack-child-item:active .button {
        transform: scale(0.92);
        transition-duration: 0.1s;
      }
      .style-uc_floating .stack-child-item:hover .button {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(var(--rgb-primary-color), 0.25);
      }
      .style-uc_neumorphic .stack-child-item:hover .button {
        box-shadow: inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.05);
        transform: scale(0.96);
      }
      .style-uc_gradient .stack-child-item:hover .button {
        transform: translateY(-2px) scale(1.06);
        box-shadow: 0 4px 16px rgba(255,255,255,0.15);
        filter: brightness(1.12);
      }
      .style-uc_compact .stack-child-item:hover .button {
        transform: scale(1.12);
      }
      .style-uc_compact .stack-child-item:active .button {
        transform: scale(0.9);
        transition-duration: 0.1s;
      }

      /* Custom dock color: style the stack popup too */
      .navbar-card.has-dock-color ~ .stack-backdrop + .stack-children,
      .has-dock-color .stack-children {
        /* Inherits dock color vars from parent */
      }
      .navbar-card.has-dock-color .stack-child-item .label {
        color: rgba(255, 255, 255, 0.85);
      }
      .navbar-card.has-dock-color .stack-child-item .label.active {
        color: #fff;
      }

      /* ── Auto-hide transitions ──────────────────────────── */
      .navbar.autohide-enabled {
        transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease;
      }
      .navbar.autohide-hidden.bottom {
        transform: translateY(calc(100% + 8px));
        opacity: 0;
      }
      .navbar.autohide-hidden.top {
        transform: translateY(calc(-100% - 8px));
        opacity: 0;
      }
      .navbar.autohide-hidden.left {
        transform: translateX(calc(-100% - 8px));
        opacity: 0;
      }
      .navbar.autohide-hidden.right {
        transform: translateX(calc(100% + 8px));
        opacity: 0;
      }

      .badge {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 16px;
        height: 16px;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 700;
        padding: 0 4px;
      }
      .media-player {
        pointer-events: auto;
        position: fixed;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        border-radius: 16px;
        background: var(--navbar-background-color);
        box-shadow: var(--navbar-box-shadow);
        overflow: hidden;
      }
      .media-player.bottom-center {
        left: 50%;
        bottom: 90px;
        transform: translateX(-50%);
      }
      .media-player.top-center {
        left: 50%;
        top: 16px;
        transform: translateX(-50%);
      }
      .media-player.top-left {
        top: 16px;
        left: 16px;
      }
      .media-player.top-right {
        top: 16px;
        right: 16px;
      }
      .media-player.bottom-left {
        bottom: 90px;
        left: 16px;
      }
      .media-player.bottom-right {
        bottom: 90px;
        right: 16px;
      }
      .media-player-bg {
        position: absolute;
        inset: 0;
        background-size: cover;
        background-position: center;
        opacity: 0.12;
        filter: blur(12px);
      }
      .media-player-content {
        position: relative;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .media-player-image {
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        border-radius: 12px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      }
      .media-player-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 140px;
      }
      .media-player-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .media-player-artist {
        font-size: 11px;
        color: var(--secondary-text-color);
      }
      .media-player-controls {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .media-player-button {
        border: none;
        background: rgba(var(--rgb-primary-color), 0.15);
        color: var(--primary-text-color);
        border-radius: 10px;
        padding: 6px;
        cursor: pointer;
      }
      .media-player-button-play-pause {
        background: var(--navbar-primary-color);
        color: var(--text-primary-color, #fff);
      }
      .media-player-icon {
        pointer-events: auto;
        position: fixed;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--navbar-background-color);
        box-shadow: var(--navbar-box-shadow);
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.2s ease;
      }
      .media-player-icon:hover {
        transform: scale(1.05);
      }
      .media-player-icon.bottom-center {
        left: 50%;
        bottom: 90px;
        transform: translateX(-50%);
      }
      .media-player-icon.top-center {
        left: 50%;
        top: 16px;
        transform: translateX(-50%);
      }
      .media-player-icon.top-left {
        top: 16px;
        left: 16px;
      }
      .media-player-icon.top-right {
        top: 16px;
        right: 16px;
      }
      .media-player-icon.bottom-left {
        bottom: 90px;
        left: 16px;
      }
      .media-player-icon.bottom-right {
        bottom: 90px;
        right: 16px;
      }
      .media-icon-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .media-icon-fallback {
        --mdc-icon-size: 28px;
        color: var(--navbar-primary-color);
      }
      .media-route {
        position: relative;
      }
      .settings-route {
        cursor: pointer;
      }
      .settings-route .button {
        transition: background-color 0.2s, transform 0.2s;
      }
      .settings-route:hover .button {
        background-color: rgba(var(--rgb-primary-color), 0.2);
      }
      .settings-route .icon {
        transition: color 0.2s;
      }
      .settings-route:hover .icon {
        color: var(--navbar-primary-color);
      }
      .media-button {
        position: relative;
        overflow: hidden;
      }
      .media-button .media-album-art {
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border-radius: inherit;
      }
      .media-button .media-playing-indicator {
        position: absolute;
        bottom: 2px;
        right: 2px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: transparent;
        border: 2px solid var(--card-background-color);
      }
      .media-button .media-playing-indicator.active {
        background: #4caf50;
        box-shadow: 0 0 6px #4caf50;
        animation: pulse-indicator 2s ease-in-out infinite;
      }
      .media-playing-indicator {
        position: absolute;
        bottom: 4px;
        right: 4px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: transparent;
      }
      .media-playing-indicator.active {
        background: #4caf50;
        box-shadow: 0 0 8px #4caf50;
        animation: pulse-indicator 2s ease-in-out infinite;
      }
      @keyframes pulse-indicator {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(0.9); }
      }
      /* Media Player Popup Styles */
      .media-player-popup-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.3);
        z-index: var(--navbar-popup-backdrop-z-index);
        pointer-events: auto;
        animation: backdrop-fade-in 0.15s ease-out;
      }
      @keyframes backdrop-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .media-player-popup {
        pointer-events: auto;
        position: fixed;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-radius: 16px;
        background: var(--navbar-background-color);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(var(--navbar-backdrop-blur, 16px)) saturate(180%);
        -webkit-backdrop-filter: blur(var(--navbar-backdrop-blur, 16px)) saturate(180%);
        overflow: visible;
        z-index: var(--navbar-popup-z-index);
        animation: media-popup-slide-in 0.2s ease-out;
      }
      /* Arrow pointer */
      .media-player-popup::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        background: var(--navbar-background-color);
        transform: rotate(45deg);
        box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.1);
      }
      .media-player-popup.above::after {
        bottom: -8px;
        left: 50%;
        margin-left: -8px;
      }
      .media-player-popup.below::after {
        top: -8px;
        left: 50%;
        margin-left: -8px;
        box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.1);
      }
      @keyframes media-popup-slide-in {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .media-route.expanded .button {
        background: rgba(var(--rgb-primary-color), 0.25);
        box-shadow: 0 4px 12px rgba(var(--rgb-primary-color), 0.3);
      }
    `;
  }

  private findTargetContainer(registered: RegisteredModule): HTMLElement | null {
    const { element, module } = registered;

    // For 'all_views' scope, always use document.body to ensure the navbar
    // stays visible when navigating between views (the card's view container
    // gets disconnected when leaving that view)
    const navScope = module.nav_scope || 'all_views';
    if (navScope === 'all_views') {
      return document.body;
    }

    // For 'current_view' scope, use the view container
    const viewContainer = this.findViewContainerForCard(element);
    if (viewContainer && viewContainer !== document.body) {
      return viewContainer;
    }
    return document.body;
  }

  private findViewContainerForCard(element: HTMLElement | null): HTMLElement | null {
    if (!element) return null;

    let current: HTMLElement | null = element;
    const viewSelectors = [
      'hui-view',
      'hui-sections-view',
      'hui-masonry-view',
      'hui-panel-view',
      '.view',
    ];

    while (current && current !== document.body) {
      for (const selector of viewSelectors) {
        if (current.matches && current.matches(selector)) {
          return current;
        }
      }
      current = current.parentElement;
    }

    return document.body;
  }

  private getStableViewId(container: HTMLElement): string {
    if (container.id) return container.id;
    if (container.getAttribute('data-view-id')) {
      return container.getAttribute('data-view-id')!;
    }

    const path: string[] = [];
    let current: HTMLElement | null = container;
    let depth = 0;
    while (current && current !== document.body && depth < 5) {
      const tag = current.tagName.toLowerCase();
      const id = current.id;
      const className = current.className;
      if (id) {
        path.unshift(`#${id}`);
        break;
      } else if (className && typeof className === 'string') {
        const firstClass = className.split(' ')[0];
        if (firstClass) path.unshift(`.${firstClass}`);
      } else {
        path.unshift(tag);
      }
      current = current.parentElement;
      depth++;
    }
    return path.length > 0 ? path.join('>') : `view-${Date.now()}`;
  }
}

export const ucNavigationService = new UcNavigationService();
