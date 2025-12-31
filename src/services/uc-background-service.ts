/**
 * Background Service
 * Manages view-wide background images across all Ultra Card instances
 * Handles priority resolution, conditional logic, and background application
 */

import { HomeAssistant } from 'custom-card-helpers';
import { BackgroundModule, UltraCardConfig } from '../types';
import { logicService } from './logic-service';
import { getImageUrl } from '../utils/image-upload';

interface RegisteredModule {
  cardId: string;
  moduleId: string;
  module: BackgroundModule;
  hass: HomeAssistant;
  config: UltraCardConfig;
  element: HTMLElement | null;
  registeredAt: number;
}

interface AppliedBackground {
  imageUrl: string;
  size: string;
  position: string;
  repeat: string;
  opacity: number;
}

interface ViewBackgroundLayer {
  viewContainer: HTMLElement;
  backgroundLayer: HTMLElement;
}

class UcBackgroundService {
  private registeredModules: Map<string, RegisteredModule> = new Map();
  private appliedBackgrounds: Map<HTMLElement, AppliedBackground> = new Map();
  private viewLayers: Map<HTMLElement, ViewBackgroundLayer> = new Map();
  private updateDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private backgroundDataAttribute = 'data-uc-background-applied';

  /**
   * Register a background module
   */
  registerModule(
    cardId: string,
    moduleId: string,
    module: BackgroundModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    element: HTMLElement | null = null
  ): void {
    const key = `${cardId}-${moduleId}`;

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
    });

    this.scheduleUpdate();
  }

  /**
   * Unregister a background module
   */
  unregisterModule(cardId: string, moduleId: string): void {
    const key = `${cardId}-${moduleId}`;
    this.registeredModules.delete(key);

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
    }, 100);
  }

  /**
   * Evaluate priority and render the winning module(s) per target container.
   * This ensures each view/dashboard container can have its own background.
   */
  private evaluateAndRender(): void {
    if (this.registeredModules.size === 0) {
      this.cleanup();
      return;
    }

    // Group modules by their resolved target container
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

    // Evaluate and apply backgrounds per container
    for (const [container, modules] of containerMap.entries()) {
      const activeModule = this.evaluateActiveModuleForContainer(modules);
      if (activeModule) {
        activeByContainer.set(container, activeModule);
        this.applyBackground(activeModule);
      }
    }

    // Remove backgrounds from containers that no longer have an active module
    for (const container of Array.from(this.appliedBackgrounds.keys())) {
      if (!activeByContainer.has(container)) {
        this.removeBackgroundFromContainer(container);
      }
    }
  }

  /**
   * Evaluate which module should be active for a specific container,
   * based on DOM order and logic conditions.
   */
  private evaluateActiveModuleForContainer(modules: RegisteredModule[]): RegisteredModule | null {
    if (!modules || modules.length === 0) return null;

    // Sort by DOM order (topmost first)
    modules.sort((a, b) => {
      if (a.element && b.element) {
        const position = a.element.compareDocumentPosition(b.element);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      }
      return a.registeredAt - b.registeredAt;
    });

    // Set hass for logic service using the first module in this group
    if (modules[0].hass) {
      logicService.setHass(modules[0].hass);
    }

    // Find first module that passes logic conditions
    for (const registered of modules) {
      const { module } = registered;

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
   * Apply background for a module
   */
  private applyBackground(registered: RegisteredModule): void {
    const { module, hass } = registered;

    // Determine target container (per view)
    const targetContainer = this.findTargetContainer(registered);
    if (!targetContainer) {
      return;
    }

    // Resolve background image URL
    const imageUrl = this.resolveBackgroundImageUrl(module, hass);

    // Get background settings
    const backgroundSize = module.background_size || 'cover';
    const backgroundPosition = module.background_position || 'center';
    const backgroundRepeat = module.background_repeat || 'no-repeat';
    const opacity = module.opacity !== undefined ? module.opacity : 100;

    // Check if background changed
    const currentBackground = this.appliedBackgrounds.get(targetContainer);
    const backgroundChanged =
      !currentBackground ||
      currentBackground.imageUrl !== imageUrl ||
      currentBackground.size !== backgroundSize ||
      currentBackground.position !== backgroundPosition ||
      currentBackground.repeat !== backgroundRepeat ||
      currentBackground.opacity !== opacity;

    if (!backgroundChanged && imageUrl && imageUrl !== 'none') {
      return; // No change needed
    }

    // Get or create background layer for this view
    const viewLayer = this.ensureBackgroundLayerForView(targetContainer);

    if (imageUrl && imageUrl !== 'none') {
      // Apply background styles to the layer (not the container)
      // Use z-index -2 to ensure it's behind Dynamic Weather's background layer (-1)
      viewLayer.backgroundLayer.style.backgroundImage = `url("${imageUrl}")`;
      viewLayer.backgroundLayer.style.backgroundSize = backgroundSize;
      viewLayer.backgroundLayer.style.backgroundPosition = backgroundPosition;
      viewLayer.backgroundLayer.style.backgroundRepeat = backgroundRepeat;
      viewLayer.backgroundLayer.style.opacity = (opacity / 100).toString();
      viewLayer.backgroundLayer.style.display = 'block';
      targetContainer.setAttribute(this.backgroundDataAttribute, 'true');

      // Store applied background
      this.appliedBackgrounds.set(targetContainer, {
        imageUrl,
        size: backgroundSize,
        position: backgroundPosition,
        repeat: backgroundRepeat,
        opacity,
      });
    } else {
      // Remove background
      this.removeBackgroundFromContainer(targetContainer);
    }
  }

  /**
   * Ensure background layer exists for a specific view
   */
  private ensureBackgroundLayerForView(viewContainer: HTMLElement): ViewBackgroundLayer {
    // Check if we already have a layer for this view
    const existing = this.viewLayers.get(viewContainer);
    if (existing && existing.backgroundLayer.isConnected) {
      return existing;
    }

    // Ensure view container has a stable ID or data attribute for tracking
    if (!viewContainer.id && !viewContainer.getAttribute('data-view-id')) {
      const stableId = this.getStableViewId(viewContainer);
      viewContainer.setAttribute('data-view-id', stableId);
    }

    // Create background layer for this view
    const backgroundLayer = document.createElement('div');
    const viewId =
      viewContainer.id || viewContainer.getAttribute('data-view-id') || `view-${Date.now()}`;
    backgroundLayer.id = `uc-background-layer-${viewId}`;
    backgroundLayer.setAttribute('data-view-id', viewId);
    backgroundLayer.style.position = 'fixed';
    backgroundLayer.style.top = '0';
    backgroundLayer.style.left = '0';
    backgroundLayer.style.width = '100vw';
    backgroundLayer.style.height = '100dvh';
    backgroundLayer.style.minHeight = '100vh';
    backgroundLayer.style.zIndex = '-1';
    backgroundLayer.style.pointerEvents = 'none'; // Allow clicks to pass through
    backgroundLayer.style.display = 'none'; // Hidden by default
    backgroundLayer.style.overflow = 'hidden';
    backgroundLayer.style.userSelect = 'none';
    backgroundLayer.style.background = 'transparent'; // Ensure transparent background

    // Insert into the specific view container (or body if no view was found).
    if (viewContainer === document.body) {
      document.body.appendChild(backgroundLayer);
    } else {
      viewContainer.appendChild(backgroundLayer);
    }

    const viewLayer: ViewBackgroundLayer = {
      viewContainer,
      backgroundLayer,
    };

    this.viewLayers.set(viewContainer, viewLayer);
    return viewLayer;
  }

  /**
   * Get stable view ID for tracking
   */
  private getStableViewId(container: HTMLElement): string {
    // Try to use existing ID or data attribute
    if (container.id) return container.id;
    if (container.getAttribute('data-view-id')) {
      return container.getAttribute('data-view-id')!;
    }

    // Generate stable ID based on container position/attributes
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

  /**
   * Resolve background image URL based on module type
   */
  private resolveBackgroundImageUrl(module: BackgroundModule, hass: HomeAssistant): string {
    switch (module.background_type) {
      case 'none':
        return 'none';

      case 'upload':
      case 'url':
        if (module.background_image) {
          return getImageUrl(hass, module.background_image);
        }
        return 'none';

      case 'entity':
        if (module.background_image_entity && hass?.states[module.background_image_entity]) {
          const entityState = hass.states[module.background_image_entity];
          // Try entity_picture first, then other image attributes
          const imageUrl =
            entityState.attributes.entity_picture ||
            entityState.attributes.image ||
            entityState.state;
          if (imageUrl && imageUrl !== 'unknown' && imageUrl !== 'unavailable') {
            return getImageUrl(hass, imageUrl);
          }
        }
        return 'none';

      default:
        return 'none';
    }
  }

  /**
   * Find the view container that owns the provided module instance.
   */
  private findTargetContainer(registered: RegisteredModule): HTMLElement | null {
    const { element } = registered;
    const viewContainer = this.findViewContainerForCard(element);
    if (viewContainer && viewContainer !== document.body) {
      return viewContainer;
    }
    // Fallback to body if we can't find a specific view
    return document.body;
  }

  /**
   * Find the view container for a card element
   */
  private findViewContainerForCard(element: HTMLElement | null): HTMLElement | null {
    if (!element) return null;

    // Walk up the DOM tree to find the view container
    let current: HTMLElement | null = element;
    const viewSelectors = [
      'hui-view',
      'hui-sections-view',
      'hui-masonry-view',
      'hui-panel-view',
      '.view',
      // Note: we intentionally do NOT treat 'ha-panel-lovelace' as a view
      // container here. For current_view scope we want per-view containers,
      // not the entire dashboard panel.
    ];

    while (current && current !== document.body) {
      // Check if current element itself matches a view selector
      for (const selector of viewSelectors) {
        if (current.matches && current.matches(selector)) {
          // Found the view container - verify it contains the element
          if (current.contains(element)) {
            return current;
          }
        }
      }
      // Walk up to parent
      current = current.parentElement;
    }

    // Fallback: use document.body
    return document.body;
  }

  /**
   * Remove background from a container
   */
  private removeBackgroundFromContainer(container: HTMLElement): void {
    const viewLayer = this.viewLayers.get(container);
    if (viewLayer) {
      viewLayer.backgroundLayer.style.display = 'none';
      viewLayer.backgroundLayer.style.backgroundImage = '';
      viewLayer.backgroundLayer.style.backgroundSize = '';
      viewLayer.backgroundLayer.style.backgroundPosition = '';
      viewLayer.backgroundLayer.style.backgroundRepeat = '';
      viewLayer.backgroundLayer.style.opacity = '';
    }

    if (container.hasAttribute(this.backgroundDataAttribute)) {
      container.removeAttribute(this.backgroundDataAttribute);
      this.appliedBackgrounds.delete(container);
    }
  }

  /**
   * Cleanup all backgrounds
   */
  private cleanup(): void {
    // Remove backgrounds from all containers
    for (const container of this.appliedBackgrounds.keys()) {
      this.removeBackgroundFromContainer(container);
    }
    this.appliedBackgrounds.clear();

    // Clean up orphaned layers
    this.cleanupOrphanedLayers();
  }

  /**
   * Clean up layers that are no longer in the DOM
   */
  private cleanupOrphanedLayers(): void {
    for (const [container, layer] of this.viewLayers.entries()) {
      if (!layer.backgroundLayer.isConnected) {
        this.viewLayers.delete(container);
      }
    }
  }

  /**
   * Force update (for external triggers)
   */
  public forceUpdate(): void {
    this.evaluateAndRender();
  }
}

// Singleton instance
export const ucBackgroundService = new UcBackgroundService();
