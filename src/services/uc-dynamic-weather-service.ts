/**
 * Dynamic Weather Service
 * Manages view-wide weather effects across all Ultra Card instances
 * Handles priority resolution, conditional logic, and weather effect rendering
 */

import { HomeAssistant } from 'custom-card-helpers';
import { DynamicWeatherModule, UltraCardConfig, WeatherEffectType } from '../types';
import { logicService } from './logic-service';
import { WeatherEffectsEngine } from '../utils/weather-effects-engine';
import { mapWeatherConditionToEffect } from '../utils/weather-condition-mapper';

interface RegisteredModule {
  cardId: string;
  moduleId: string;
  module: DynamicWeatherModule;
  hass: HomeAssistant;
  config: UltraCardConfig;
  element: HTMLElement | null;
  registeredAt: number;
  isEditorPreview: boolean;
  matrixRainColor?: string; // Track color for change detection
}

interface ViewWeatherLayer {
  viewContainer: HTMLElement;
  weatherLayer: HTMLElement;
  engine: WeatherEffectsEngine;
}

class UcDynamicWeatherService {
  private registeredModules: Map<string, RegisteredModule> = new Map();
  private viewLayers: Map<HTMLElement, ViewWeatherLayer> = new Map();
  private lastAppliedColors: Map<string, string> = new Map(); // Track last applied colors by view ID
  private updateDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private currentEffect: WeatherEffectType = 'none';
  private styleElement: HTMLStyleElement | null = null;

  /**
   * Register a weather module
   */
  registerModule(
    cardId: string,
    moduleId: string,
    module: DynamicWeatherModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    element: HTMLElement | null = null,
    isEditorPreviewOverride?: boolean
  ): void {
    const previewFlag = this.resolvePreviewFlag(config, element, isEditorPreviewOverride);
    const key = this.buildModuleKey(cardId, moduleId, previewFlag);
    
    // Get existing module
    const existing = this.registeredModules.get(key);

    this.registeredModules.set(key, {
      cardId,
      moduleId,
      module,
      hass,
      config,
      element,
      registeredAt: existing?.registeredAt || Date.now(),
      isEditorPreview: previewFlag,
      // Store current color from module - will be compared in renderWeatherEffect
      matrixRainColor: module.matrix_rain_color || '#00ff00',
    });

    this.scheduleUpdate();
  }

  /**
   * Unregister a weather module
   */
  unregisterModule(cardId: string, moduleId: string, isEditorPreviewOverride?: boolean): void {
    if (typeof isEditorPreviewOverride === 'boolean') {
      const key = this.buildModuleKey(cardId, moduleId, isEditorPreviewOverride);
      this.registeredModules.delete(key);
    } else {
      this.registeredModules.delete(this.buildModuleKey(cardId, moduleId, false));
      this.registeredModules.delete(this.buildModuleKey(cardId, moduleId, true));
    }

    if (this.registeredModules.size === 0) {
      this.cleanup();
    } else {
      this.scheduleUpdate();
    }
  }

  /**
   * Schedule an update (debounced)
   */
  private scheduleUpdate(): void {
    if (this.updateDebounceTimer) {
      clearTimeout(this.updateDebounceTimer);
    }

    this.updateDebounceTimer = setTimeout(() => {
      this.evaluateAndRender();
      this.updateDebounceTimer = null;
    }, 100); // Reduced to 100ms for more responsive updates
  }

  /**
   * Evaluate priority and render the winning module
   */
  private evaluateAndRender(): void {
    // Clean up orphaned layers first
    this.cleanupOrphanedLayers();

    const activeModule = this.evaluateActiveModule();

    if (!activeModule) {
      this.removeWeatherEffect();
      return;
    }

    // Check if mobile and if enabled on mobile
    const isMobile = window.innerWidth <= 768;
    if (isMobile && !activeModule.module.enable_on_mobile) {
      this.removeWeatherEffect();
      return;
    }

    // Determine effect to display
    const effect = this.resolveEffect(activeModule);

    if (effect === 'none') {
      this.removeWeatherEffect();
      return;
    }

    // Render the weather effect (only for the active module's view)
    this.renderWeatherEffect(effect, activeModule.module, activeModule);

    // Stop effects in other views
    const activeViewContainer = this.findViewContainerForCard(activeModule.element);
    for (const [viewContainer, viewLayer] of this.viewLayers.entries()) {
      if (viewContainer !== activeViewContainer) {
        if (viewLayer.engine) {
          viewLayer.engine.stop();
        }
        this.hideWeatherLayer(viewLayer);
      }
    }
  }

  /**
   * Evaluate which module should be active based on priority and logic
   */
  private evaluateActiveModule(): RegisteredModule | null {
    if (this.registeredModules.size === 0) return null;

    const modules = Array.from(this.registeredModules.values());
    const previewModules = modules.filter(module => module.isEditorPreview);
    // If any preview modules exist (HA editor), ignore live modules entirely so
    // the editor always reflects the in-progress state instead of falling back
    // to whatever the dashboard currently shows.
    const candidateModules = previewModules.length > 0 ? previewModules : modules;

    if (!candidateModules.length) {
      return null;
    }

    const orderedCandidates = this.sortModulesByDomOrder(candidateModules);

    for (const registered of orderedCandidates) {
      const { module } = registered;

      if (!module.enabled) continue;

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
   * Sort modules by DOM order (topmost first) with stable fallback to registration time
   */
  private sortModulesByDomOrder(modules: RegisteredModule[]): RegisteredModule[] {
    return [...modules].sort((a, b) => {
      if (a.element && b.element) {
        const position = a.element.compareDocumentPosition(b.element);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      }
      return a.registeredAt - b.registeredAt;
    });
  }

  /**
   * Resolve which effect to display
   */
  private resolveEffect(registered: RegisteredModule): WeatherEffectType {
    const { module, hass } = registered;

    if (module.mode === 'manual') {
      return (module.manual_effect || 'none') as WeatherEffectType;
    }

    // Automatic mode - get from weather entity
    if (module.weather_entity) {
      return mapWeatherConditionToEffect(hass, module.weather_entity);
    }

    return 'none';
  }

  /**
   * Render weather effect
   */
  private renderWeatherEffect(effect: WeatherEffectType, module: DynamicWeatherModule, registered: RegisteredModule): void {
    // Find the view container for this card
    const viewContainer = this.findViewContainerForCard(registered.element);
    if (!viewContainer) {
      console.warn('Dynamic Weather: Could not find view container for card');
      return;
    }

    // Check if effect changed
    const effectChanged = this.currentEffect !== effect;
    this.currentEffect = effect;

    const targetPosition: 'foreground' | 'background' = module.position || 'background';

    // Get or create weather layer for this view (needed for color change detection)
    const viewLayer = this.ensureWeatherLayerForView(viewContainer, targetPosition);
    this.showWeatherLayer(viewLayer);

    // Get stable view ID for color tracking
    const viewId = viewContainer.id || viewContainer.getAttribute('data-view-id') || this.getStableViewId(viewContainer);

    // Check if matrix rain color changed (for matrix_rain effect)
    const newColor = module.matrix_rain_color || '#00ff00';
    
    // ONLY use our tracking map for old color - don't query engine
    // because engine.getLastAppliedExtras() would return the color we just set
    const oldColor = this.lastAppliedColors.get(viewId);
    
    // Normalize colors for comparison (handle case differences, etc)
    const normalizedOld = oldColor?.toLowerCase().trim();
    const normalizedNew = newColor.toLowerCase().trim();
    
    const colorChanged = effect === 'matrix_rain' && 
      oldColor !== undefined && 
      normalizedOld !== normalizedNew;
    
    // Update stored color in registered module
    registered.matrixRainColor = newColor;


    if (!viewLayer.engine) {
      console.warn('Dynamic Weather: Engine not initialized');
      return;
    }

    // Handle reduced motion
    if (module.respect_reduced_motion && this.prefersReducedMotion()) {
      console.log('Dynamic Weather: Reduced motion enabled, stopping');
      viewLayer.engine.stop();
      this.hideWeatherLayer(viewLayer);
      return;
    }

    // Start or update effect - recreate if effect changed OR color changed
    if (effectChanged || colorChanged) {
      // Force recreation by stopping first if color changed
      if (colorChanged && !effectChanged) {
        viewLayer.engine.stop();
      }
      viewLayer.engine.start(effect, {
        opacity: module.opacity ?? 100,
        respectReducedMotion: module.respect_reduced_motion ?? true,
        matrixRainColor: newColor, // Use normalized newColor instead of module property
      });
      // Update tracking map after applying color
      if (effect === 'matrix_rain') {
        this.lastAppliedColors.set(viewId, newColor);
      }
    } else {
      // Just update opacity if effect is the same
      viewLayer.engine.setOpacity(module.opacity ?? 100);
    }
  }

  /**
   * Find the view container for a specific card element
   */
  private findViewContainerForCard(cardElement: HTMLElement | null): HTMLElement | null {
    if (!cardElement) {
      return this.findViewContainer();
    }

    // Walk up the DOM tree to find the view container
    let current: HTMLElement | null = cardElement;
    const viewSelectors = [
      'hui-view',
      'hui-sections-view',
      'hui-masonry-view',
      'hui-panel-view',
      '.view',
      'ha-panel-lovelace',
    ];

    while (current && current !== document.body) {
      // Check if current element itself matches a view selector
      for (const selector of viewSelectors) {
        if (current.matches && current.matches(selector)) {
          return current;
        }
      }
      // Walk up to parent
      current = current.parentElement;
    }

    // Fallback to finding any view container
    return this.findViewContainer();
  }

  /**
   * Ensure weather layer exists for a specific view
   */
  private ensureWeatherLayerForView(viewContainer: HTMLElement, position: 'foreground' | 'background'): ViewWeatherLayer {
    // Ensure view container has a stable ID or data attribute for tracking
    if (!viewContainer.id && !viewContainer.getAttribute('data-view-id')) {
      const stableId = this.getStableViewId(viewContainer);
      viewContainer.setAttribute('data-view-id', stableId);
    }
    
    // Check if we already have a layer for this view
    const existing = this.viewLayers.get(viewContainer);
    if (existing && existing.weatherLayer.isConnected) {
      // Update z-index based on position
      const targetZIndex = position === 'foreground' ? '9998' : '-1';
      if (existing.weatherLayer.style.zIndex !== targetZIndex) {
        existing.weatherLayer.style.zIndex = targetZIndex;
      }
      return existing;
    }

    // Create weather container for this view
    const weatherLayer = document.createElement('div');
    const viewId = viewContainer.id || viewContainer.getAttribute('data-view-id') || `view-${Date.now()}`;
    weatherLayer.id = `uc-dynamic-weather-layer-${viewId}`;
    weatherLayer.setAttribute('data-view-id', viewId);
    weatherLayer.style.position = 'fixed';
    weatherLayer.style.top = '0';
    weatherLayer.style.left = '0';
    weatherLayer.style.width = '100vw';
    weatherLayer.style.height = '100dvh';
    weatherLayer.style.minHeight = '100vh';
    // Foreground effects sit above everything, background effects sit above
    // the Ultra Background layer (z-index 0) but below cards.
    weatherLayer.style.zIndex = position === 'foreground' ? '9998' : '1';
    weatherLayer.style.pointerEvents = 'none'; // CRITICAL: Allow clicks to pass through
    weatherLayer.style.overflow = 'hidden';
    weatherLayer.style.userSelect = 'none';
    weatherLayer.style.background = 'transparent'; // Ensure transparent background
    weatherLayer.style.opacity = '0';
    weatherLayer.style.visibility = 'hidden';
    weatherLayer.style.transition = 'opacity 0.35s ease';

    // Create engine (it will create its own canvas)
    const engine = new WeatherEffectsEngine(weatherLayer);

    // Inject styles (only once)
    this.injectStyles();

    // Insert into the view container (or body if view container is body)
    if (viewContainer === document.body) {
      document.body.appendChild(weatherLayer);
    } else {
      // Append to view container, but use fixed positioning so it covers the viewport
      viewContainer.appendChild(weatherLayer);
    }

    const viewLayer: ViewWeatherLayer = {
      viewContainer,
      weatherLayer,
      engine,
    };

    this.viewLayers.set(viewContainer, viewLayer);
    return viewLayer;
  }

  /**
   * Get a stable view ID for tracking
   */
  private getStableViewId(viewContainer: HTMLElement): string {
    // Try to get existing ID
    if (viewContainer.id) {
      return viewContainer.id;
    }
    
    // Try data-view-id attribute
    const dataViewId = viewContainer.getAttribute('data-view-id');
    if (dataViewId) {
      return dataViewId;
    }
    
    // Generate a stable ID based on element position
    let element: HTMLElement | null = viewContainer;
    const path: string[] = [];
    
    while (element && element !== document.body) {
      const parent = element.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children);
        const index = siblings.indexOf(element);
        path.unshift(`${element.tagName.toLowerCase()}[${index}]`);
      }
      element = parent;
    }
    
    return path.join('/') || 'view-default';
  }

  /**
   * Find the view container
   */
  private findViewContainer(): HTMLElement | null {
    const selectors = [
      'hui-view',
      'hui-sections-view',
      'hui-masonry-view',
      'hui-panel-view',
      '.view',
      'ha-panel-lovelace',
    ];

    for (const selector of selectors) {
      const container = document.querySelector(selector) as HTMLElement;
      if (container) return container;
    }

    return document.body;
  }

  /**
   * Inject CSS styles
   */
  private injectStyles(): void {
    if (this.styleElement) return;

    this.styleElement = document.createElement('style');
    this.styleElement.textContent = `
      [id^="uc-dynamic-weather-layer"] {
        transition: opacity 0.5s ease;
        will-change: transform;
        transform: translate3d(0, 0, 0);
        -webkit-transform: translate3d(0, 0, 0);
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        perspective: 1000px;
        -webkit-perspective: 1000px;
        contain: layout style paint; /* CSS containment - isolate from page reflows */
        isolation: isolate; /* Create stacking context */
      }
      
      [id^="uc-dynamic-weather-layer"] canvas {
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
        will-change: contents; /* Hint that canvas content changes frequently */
      }
      
      @media (max-width: 768px) {
        [id^="uc-dynamic-weather-layer"] {
          height: 100dvh !important;
          min-height: 100vh !important;
        }
      }
    `;
    document.head.appendChild(this.styleElement);
  }

  /**
   * Remove weather effect from all views
   */
  private removeWeatherEffect(): void {
    // Stop all engines
    for (const viewLayer of this.viewLayers.values()) {
      if (viewLayer.engine) {
        viewLayer.engine.stop();
      }
      this.hideWeatherLayer(viewLayer);
    }
    this.currentEffect = 'none';
  }

  /**
   * Clean up weather layers for views that no longer exist
   */
  private cleanupOrphanedLayers(): void {
    for (const [viewContainer, viewLayer] of this.viewLayers.entries()) {
      if (!viewContainer.isConnected || !viewLayer.weatherLayer.isConnected) {
        // View or layer was removed from DOM
        if (viewLayer.engine) {
          viewLayer.engine.stop();
          viewLayer.engine.destroy();
        }
        this.viewLayers.delete(viewContainer);
      }
    }
  }

  /**
   * Check if user prefers reduced motion
   */
  private prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Full cleanup
   */
  cleanup(): void {
    // Destroy all engines
    for (const viewLayer of this.viewLayers.values()) {
      if (viewLayer.engine) {
        viewLayer.engine.destroy();
      }
    }
    this.viewLayers.clear();

    this.removeWeatherEffect();

    if (this.styleElement && this.styleElement.parentElement) {
      this.styleElement.parentElement.removeChild(this.styleElement);
      this.styleElement = null;
    }

    if (this.updateDebounceTimer) {
      clearTimeout(this.updateDebounceTimer);
      this.updateDebounceTimer = null;
    }

    this.registeredModules.clear();
  }

  /**
   * Force immediate re-evaluation
   */
  forceUpdate(): void {
    if (this.updateDebounceTimer) {
      clearTimeout(this.updateDebounceTimer);
      this.updateDebounceTimer = null;
    }
    this.evaluateAndRender();
  }

  /**
   * Get current active module count
   */
  getActiveModuleCount(): number {
    return this.registeredModules.size;
  }

  private showWeatherLayer(viewLayer: ViewWeatherLayer): void {
    if (!viewLayer?.weatherLayer) return;
    viewLayer.weatherLayer.style.visibility = 'visible';
    viewLayer.weatherLayer.style.opacity = '1';
  }

  private hideWeatherLayer(viewLayer: ViewWeatherLayer): void {
    if (!viewLayer?.weatherLayer) return;
    viewLayer.weatherLayer.style.opacity = '0';
    viewLayer.weatherLayer.style.visibility = 'hidden';
  }

  private buildModuleKey(cardId: string, moduleId: string, isEditorPreview: boolean): string {
    return `${cardId}${isEditorPreview ? ':preview' : ''}-${moduleId}`;
  }

  private resolvePreviewFlag(
    config: UltraCardConfig,
    element: HTMLElement | null,
    override?: boolean
  ): boolean {
    if (typeof override === 'boolean') {
      return override;
    }
    if ((config as any)?.__ucIsEditorPreview) {
      return true;
    }
    return this.isElementInPreview(element);
  }

  private isElementInPreview(element: HTMLElement | null): boolean {
    if (!element) {
      return false;
    }

    let node: Element | null = element;
    let depth = 0;
    while (node && depth < 40) {
      const tag = node.tagName?.toLowerCase?.();
      if (
        tag === 'hui-card-preview' ||
        tag === 'hui-dialog-edit-card' ||
        tag === 'hui-dialog-edit-card-advanced'
      ) {
        return true;
      }

      const root = (node as any).getRootNode?.();
      if (root && root instanceof ShadowRoot && root.host) {
        node = root.host as HTMLElement;
      } else {
        node = (node as HTMLElement).parentElement;
      }
      depth++;
    }

    return false;
  }
}

// Export singleton instance
export const ucDynamicWeatherService = new UcDynamicWeatherService();

