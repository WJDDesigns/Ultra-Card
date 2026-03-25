/**
 * Living Canvas Service
 * View-wide WebGL layer (same idea as Dynamic Weather): at most one winning module
 * per Lovelace view. Multiple Ultra Cards can register Living Canvas on the same view;
 * the first eligible instance in DOM order wins; extras are ignored (see conflict warn).
 */

import { HomeAssistant } from 'custom-card-helpers';
import { LivingCanvasModule, UltraCardConfig } from '../types';
import { logicService } from './logic-service';
import { ucCloudAuthService } from './uc-cloud-auth-service';
import { ucCustomVariablesService } from './uc-custom-variables-service';
import '../components/uc-living-canvas';

interface RegisteredModule {
  cardId: string;
  moduleId: string;
  module: LivingCanvasModule;
  hass: HomeAssistant;
  config: UltraCardConfig;
  element: HTMLElement | null;
  registeredAt: number;
  isEditorPreview: boolean;
}

interface ViewLivingLayer {
  viewContainer: HTMLElement;
  layer: HTMLElement;
  /** Lit `uc-living-canvas`; properties set imperatively */
  canvasEl: HTMLElement;
}

class UcLivingCanvasService {
  private registeredModules = new Map<string, RegisteredModule>();
  private viewLayers = new Map<HTMLElement, ViewLivingLayer>();
  private updateDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private styleElement: HTMLStyleElement | null = null;
  /** Log once per view id when more than one eligible Living Canvas competes on the same view */
  private conflictWarnedViewIds = new Set<string>();

  registerModule(
    cardId: string,
    moduleId: string,
    module: LivingCanvasModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    element: HTMLElement | null = null,
    isEditorPreviewOverride?: boolean
  ): void {
    const previewFlag = this.resolvePreviewFlag(config, element, isEditorPreviewOverride);
    const key = this.buildModuleKey(cardId, moduleId, previewFlag);
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
    });
    this.scheduleUpdate();
  }

  unregisterModule(cardId: string, moduleId: string, isEditorPreviewOverride?: boolean): void {
    if (typeof isEditorPreviewOverride === 'boolean') {
      this.registeredModules.delete(this.buildModuleKey(cardId, moduleId, isEditorPreviewOverride));
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

  private scheduleUpdate(): void {
    if (this.updateDebounceTimer) clearTimeout(this.updateDebounceTimer);
    this.updateDebounceTimer = setTimeout(() => {
      this.evaluateAndRender();
      this.updateDebounceTimer = null;
    }, 32); // ~2 frames — fast enough to feel instant, prevents render spam
  }

  private hasProAccess(hass: HomeAssistant): boolean {
    const u = ucCloudAuthService.checkIntegrationAuth(hass);
    return u?.subscription?.tier === 'pro' && u?.subscription?.status === 'active';
  }

  private resolveEntity(entityValue: string | undefined, config?: UltraCardConfig): string | undefined {
    if (!entityValue) return undefined;
    return ucCustomVariablesService.resolveEntityField(entityValue, config);
  }

  private normalizeDriver(hass: HomeAssistant, config: UltraCardConfig | undefined, entityVal?: string): number {
    const id = this.resolveEntity(entityVal, config);
    if (!id || !hass?.states?.[id]) return 0;
    const raw = hass.states[id].state;
    const f = parseFloat(String(raw));
    if (!Number.isNaN(f)) {
      if (f >= 0 && f <= 1) return f;
      if (f >= 0 && f <= 100) return f / 100;
      return Math.max(0, Math.min(1, (Math.sin(f * 0.065) + 1) / 2));
    }
    if (raw === 'on' || raw === 'true') return 1;
    if (raw === 'off' || raw === 'false' || raw === 'unavailable' || raw === 'unknown') return 0;
    return 0;
  }

  private evaluateAndRender(): void {
    this.cleanupOrphanedLayers();

    const winners = this.evaluateActiveModulesPerView();
    if (winners.size === 0) {
      this.hideAllLayers();
      return;
    }

    const isMobile = window.innerWidth <= 768;

    const activeViewContainers = new Set<HTMLElement>();

    for (const [viewContainer, active] of winners) {
      if (!this.hasProAccess(active.hass)) {
        continue;
      }
      if (isMobile && active.module.enable_on_mobile === false) {
        continue;
      }
      if (active.module.respect_reduced_motion !== false && this.prefersReducedMotion()) {
        continue;
      }

      const position: 'foreground' | 'background' = active.module.position || 'background';
      const viewLayer = this.ensureLayerForView(viewContainer, position);
      const el = viewLayer.canvasEl as any;

      // Use the imperative applyModule() if available — immediately syncs all shader
      // uniforms (preset, colors, intensity, etc.) without waiting for Lit's async cycle.
      // Fallback to property assignment for environments where the element isn't upgraded yet.
      const moduleClone = { ...active.module };
      if (typeof el.applyModule === 'function') {
        el.applyModule(moduleClone);
      } else {
        el.module = moduleClone;
        if (typeof el.requestUpdate === 'function') el.requestUpdate();
      }

      el.hass = active.hass;
      el.driver0 = this.normalizeDriver(active.hass, active.config, active.module.driver_entity_a);
      el.driver1 = this.normalizeDriver(active.hass, active.config, active.module.driver_entity_b);
      el.fillViewport = true;

      // CSS opacity on the wrapper layer — z-index: -1 keeps it behind all cards.
      const cssOpacity = Math.max(0, Math.min(1, (active.module.opacity ?? 100) / 100));
      viewLayer.layer.style.opacity = String(cssOpacity);

      this.showLayer(viewLayer);
      activeViewContainers.add(viewContainer);
    }

    if (activeViewContainers.size === 0) {
      this.hideAllLayers();
      return;
    }

    for (const [vc, vl] of this.viewLayers.entries()) {
      if (!activeViewContainers.has(vc)) {
        this.hideLayer(vl);
      }
    }
  }

  /**
   * One winning Living Canvas per Lovelace view container. Candidates are ordered by DOM
   * position; first eligible (enabled + display logic) wins for that view.
   */
  private evaluateActiveModulesPerView(): Map<HTMLElement, RegisteredModule> {
    const winners = new Map<HTMLElement, RegisteredModule>();
    if (this.registeredModules.size === 0) return winners;

    const modules = Array.from(this.registeredModules.values());
    const previewModules = modules.filter(m => m.isEditorPreview);
    const candidateModules = previewModules.length > 0 ? previewModules : modules;
    if (!candidateModules.length) return winners;

    const ordered = [...candidateModules].sort((a, b) => {
      if (a.element && b.element) {
        const pos = a.element.compareDocumentPosition(b.element);
        if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      }
      return a.registeredAt - b.registeredAt;
    });

    for (const reg of ordered) {
      if (reg.module.enabled === false) continue;
      logicService.setHass(reg.hass);
      const ok = logicService.evaluateDisplayConditions(
        reg.module.display_conditions || [],
        reg.module.display_mode || 'always'
      );
      if (!ok) continue;

      const viewContainer = this.findViewContainerForCard(reg.element);
      if (!viewContainer) continue;

      if (winners.has(viewContainer)) {
        this.maybeWarnLivingCanvasConflict(viewContainer);
        continue;
      }
      winners.set(viewContainer, reg);
    }
    return winners;
  }

  private maybeWarnLivingCanvasConflict(viewContainer: HTMLElement): void {
    const vid =
      viewContainer.id ||
      viewContainer.getAttribute('data-view-id') ||
      this.getStableViewId(viewContainer);
    if (this.conflictWarnedViewIds.has(vid)) return;
    this.conflictWarnedViewIds.add(vid);
    console.warn(
      '[Ultra Card] Living Canvas: multiple eligible modules on the same view. Only the first Ultra Card (DOM order) is used. Remove or disable extra Living Canvas modules on this view to avoid conflicts.'
    );
  }

  private findViewContainerForCard(cardElement: HTMLElement | null): HTMLElement | null {
    if (!cardElement) return this.findViewContainer();
    let current: HTMLElement | null = cardElement;
    const selectors = [
      'hui-view',
      'hui-sections-view',
      'hui-masonry-view',
      'hui-panel-view',
      '.view',
      'ha-panel-lovelace',
    ];
    while (current && current !== document.body) {
      for (const sel of selectors) {
        if (current.matches?.(sel)) return current;
      }
      current = current.parentElement;
    }
    return this.findViewContainer();
  }

  private findViewContainer(): HTMLElement | null {
    const selectors = [
      'hui-view',
      'hui-sections-view',
      'hui-masonry-view',
      'hui-panel-view',
      '.view',
      'ha-panel-lovelace',
    ];
    for (const sel of selectors) {
      const c = document.querySelector(sel) as HTMLElement;
      if (c) return c;
    }
    return document.body;
  }

  private ensureLayerForView(viewContainer: HTMLElement, position: 'foreground' | 'background'): ViewLivingLayer {
    if (!viewContainer.id && !viewContainer.getAttribute('data-view-id')) {
      viewContainer.setAttribute('data-view-id', this.getStableViewId(viewContainer));
    }
    const existing = this.viewLayers.get(viewContainer);
    if (existing?.layer.isConnected) {
      const z = position === 'foreground' ? '9998' : '-1';
      if (existing.layer.style.zIndex !== z) existing.layer.style.zIndex = z;
      return existing;
    }

    const viewId = viewContainer.id || viewContainer.getAttribute('data-view-id') || `view-${Date.now()}`;
    const layer = document.createElement('div');
    layer.id = `uc-living-canvas-layer-${viewId}`;
    layer.style.position = 'fixed';
    layer.style.top = '0';
    layer.style.left = '0';
    layer.style.width = '100vw';
    layer.style.height = '100dvh';
    layer.style.minHeight = '100vh';
    layer.style.zIndex = position === 'foreground' ? '9998' : '-1';
    layer.style.pointerEvents = 'none';
    layer.style.overflow = 'hidden';
    layer.style.opacity = '1';
    layer.style.visibility = 'hidden';
    layer.style.display = 'none';

    const canvasEl = document.createElement('uc-living-canvas');
    canvasEl.style.width = '100%';
    canvasEl.style.height = '100%';
    canvasEl.style.display = 'block';
    layer.appendChild(canvasEl);

    this.injectStyles();
    if (viewContainer === document.body) {
      document.body.appendChild(layer);
    } else {
      viewContainer.appendChild(layer);
    }

    const vl: ViewLivingLayer = { viewContainer, layer, canvasEl };
    this.viewLayers.set(viewContainer, vl);
    return vl;
  }

  private getStableViewId(viewContainer: HTMLElement): string {
    if (viewContainer.id) return viewContainer.id;
    const d = viewContainer.getAttribute('data-view-id');
    if (d) return d;
    let element: HTMLElement | null = viewContainer;
    const path: string[] = [];
    while (element && element !== document.body) {
      const parent = element.parentElement;
      if (parent) {
        const idx = Array.from(parent.children).indexOf(element);
        path.unshift(`${element.tagName.toLowerCase()}[${idx}]`);
      }
      element = parent;
    }
    return path.join('/') || 'view-default';
  }

  private injectStyles(): void {
    if (this.styleElement) return;
    this.styleElement = document.createElement('style');
    this.styleElement.textContent = `
      [id^="uc-living-canvas-layer"] {
        contain: layout style paint;
        isolation: isolate;
      }
      @media (max-width: 768px) {
        [id^="uc-living-canvas-layer"] {
          height: 100dvh !important;
          min-height: 100vh !important;
        }
      }
    `;
    document.head.appendChild(this.styleElement);
  }

  private showLayer(vl: ViewLivingLayer): void {
    vl.layer.style.display = 'block';
    vl.layer.style.visibility = 'visible';
    // Opacity is set by evaluateAndRender() before this call — don't overwrite it here.
  }

  private hideLayer(vl: ViewLivingLayer): void {
    vl.layer.style.display = 'none';
    vl.layer.style.visibility = 'hidden';
  }

  private hideAllLayers(): void {
    for (const vl of this.viewLayers.values()) {
      this.hideLayer(vl);
    }
  }

  private cleanupOrphanedLayers(): void {
    for (const [vc, vl] of this.viewLayers.entries()) {
      if (!vc.isConnected || !vl.layer.isConnected) {
        vl.layer.remove();
        this.viewLayers.delete(vc);
      }
    }
  }

  cleanup(): void {
    this.conflictWarnedViewIds.clear();
    for (const vl of this.viewLayers.values()) {
      vl.layer.remove();
    }
    this.viewLayers.clear();
    if (this.styleElement?.parentElement) {
      this.styleElement.parentElement.removeChild(this.styleElement);
      this.styleElement = null;
    }
    if (this.updateDebounceTimer) {
      clearTimeout(this.updateDebounceTimer);
      this.updateDebounceTimer = null;
    }
    this.registeredModules.clear();
  }

  forceUpdate(): void {
    if (this.updateDebounceTimer) {
      clearTimeout(this.updateDebounceTimer);
      this.updateDebounceTimer = null;
    }
    this.evaluateAndRender();
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private buildModuleKey(cardId: string, moduleId: string, isEditorPreview: boolean): string {
    return `${cardId}${isEditorPreview ? ':preview' : ''}-${moduleId}`;
  }

  private resolvePreviewFlag(
    config: UltraCardConfig,
    element: HTMLElement | null,
    override?: boolean
  ): boolean {
    if (typeof override === 'boolean') return override;
    if ((config as any)?.__ucIsEditorPreview) return true;
    return this.isElementInPreview(element);
  }

  private isElementInPreview(element: HTMLElement | null): boolean {
    if (!element) return false;
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

export const ucLivingCanvasService = new UcLivingCanvasService();
