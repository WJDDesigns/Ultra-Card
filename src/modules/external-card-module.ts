import { html, TemplateResult, css, CSSResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { ExternalCardModule, UltraCardConfig, CardModule } from '../types';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { ucExternalCardsService } from '../services/uc-external-cards-service';
import {
  ThirdPartyLimitService,
  computeCardInstanceId,
  getCurrentDashboardId,
} from '../pro/third-party-limit-service';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import { ref } from 'lit/directives/ref.js';
import '../components/ultra-template-editor';
import yaml from 'js-yaml';

// Debounce timers for config updates to prevent rapid re-render loops from spurious events
const updateDebounceTimers = new Map<string, number>();

// Editor element cache to prevent unnecessary recreation and preserve UI state (scroll, focus, dropdowns)
const editorElementCache = new Map<string, any>();

// Cache for card elements (per module instance) to enable continuous hass updates
const cardElementCache = new Map<string, HTMLElement>();

// Global cache for allowed external card IDs (first 5 by timestamp)
// This is refreshed periodically to avoid expensive dashboard scans on every render
let allowedExternalCardIdsCache: Set<string> | null = null;
let allowedExternalCardIdsCacheTime = 0;
const ALLOWED_IDS_CACHE_TTL = 5000; // 5 seconds

// Export function to invalidate the allowed IDs cache
// Call this when external cards are added, duplicated, or deleted
export function invalidateExternalCardCache(): void {
  allowedExternalCardIdsCache = null;
  allowedExternalCardIdsCacheTime = 0;
}

// Export cleanup function for when modules are deleted
export function cleanupExternalCardCache(moduleId: string): void {
  // Clear any pending debounce timers
  const timer = updateDebounceTimers.get(moduleId);
  if (timer) {
    clearTimeout(timer);
    updateDebounceTimers.delete(moduleId);
  }

  // Clear all cached editor elements for this module ID (across all card types)
  // Cache keys follow pattern: ${moduleId}-${cardType}
  const keysToDelete: string[] = [];
  editorElementCache.forEach((_, key) => {
    if (key.startsWith(`${moduleId}-`)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => editorElementCache.delete(key));

  // Clear card element cache (both main and editor preview versions)
  cardElementCache.delete(moduleId);
  cardElementCache.delete(`${moduleId}-editor`);

  // Clear allowed IDs cache so it refreshes
  invalidateExternalCardCache();
}

export class UltraExternalCardModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'external_card',
    icon: 'mdi:card-bulleted',
    title: '3rd Party Card',
    description: 'Embed any 3rd party Home Assistant card',
    category: 'interactive',
    author: 'Ultra Card',
    version: '1.0.0',
    tags: ['external', 'integration', '3rd-party'],
  };

  createDefault(): ExternalCardModule {
    return {
      id: `external-card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'external_card',
      card_type: '',
      card_config: {},
      name: '',
      display_conditions: [],
      smart_scaling: true,
    };
  }

  hasNativeEditor(cardType: string): boolean {
    if (!cardType) return false;

    const editorType = `${cardType}-editor`;
    const editorElement = customElements.get(editorType);

    // Check if editor exists and is not HTMLUnknownElement
    return editorElement !== undefined && !(editorElement.prototype instanceof HTMLUnknownElement);
  }

  private _handleRefreshLock(
    e: Event,
    module: ExternalCardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    e.stopPropagation();
    try {
      // Force a fresh registration pass over all Ultra Cards on the dashboard
      const cards = Array.from(document.querySelectorAll('ultra-card')) as any[];
      const dashboardId = getCurrentDashboardId();
      for (const card of cards) {
        const cfg = card?.config as UltraCardConfig | undefined;
        if (!cfg) continue;
        const cid = (card?.dataset?.ucInstanceId as string) || computeCardInstanceId(cfg);
        try {
          ThirdPartyLimitService.register(cid, dashboardId, cfg);
          card.requestUpdate?.();
        } catch {}
      }

      const result = ThirdPartyLimitService.evaluate(hass);
      // If under or equal to limit, force re-render (fast-path unlock)
      if (!result.isPro && result.totalThirdParty <= 5) {
        (this as any).requestUpdate?.();
        return;
      }
      // Otherwise, if this module is now in allowed set, re-render to clear overlay
      const host = (this as any)?.host || undefined;
      const attachedId = (host as any)?.dataset?.ucInstanceId;
      let cardId = attachedId || (config as any)?.__ucInstanceId || computeCardInstanceId(config!);
      const resolved = (ThirdPartyLimitService as any).getCardIdForConfig?.(config);
      if (resolved) cardId = resolved;
      const key = `${dashboardId}:${cardId}:${module.id}`;
      if (result.allowedKeys?.has?.(key)) {
        (this as any).requestUpdate?.();
      }
    } catch {
      // silent
    }
  }

  /**
   * Extract timestamp from module ID for chronological ordering
   * IDs follow pattern: external-card-${Date.now()}-${random}
   */
  private _extractTimestamp(moduleId: string): number {
    const match = moduleId.match(/external-card-(\d+)-/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Get all external card modules from config for counting and ordering
   */
  private _getAllExternalModules(config?: UltraCardConfig): ExternalCardModule[] {
    if (!config?.layout?.rows) return [];

    const externalModules: ExternalCardModule[] = [];
    config.layout.rows.forEach(row => {
      row.columns.forEach(column => {
        column.modules?.forEach(mod => {
          if (mod.type === 'external_card') {
            externalModules.push(mod as ExternalCardModule);
          }
        });
      });
    });

    return externalModules;
  }

  /**
   * Refresh the global allowed external card IDs cache
   * This runs async in the background
   */
  private async _refreshAllowedIdsCache(hass: HomeAssistant): Promise<void> {
    try {
      // Import the dashboard scanner service dynamically
      const { ucDashboardScannerService } = await import(
        '../services/uc-dashboard-scanner-service'
      );

      // Initialize with hass
      ucDashboardScannerService.initialize(hass);

      // Scan ALL Ultra Cards across ALL dashboards (not just current one)
      const snapshot = await ucDashboardScannerService.scanAllDashboards();

      // Collect ALL external card modules across ALL Ultra Card instances
      const allExternalModules: Array<{ id: string; timestamp: number }> = [];

      snapshot.cards.forEach(dashboardCard => {
        const cardConfig = dashboardCard.config;
        if (cardConfig.layout && cardConfig.layout.rows) {
          cardConfig.layout.rows.forEach(row => {
            row.columns?.forEach(column => {
              column.modules?.forEach(mod => {
                if (mod.type === 'external_card' && mod.id) {
                  const timestamp = this._extractTimestamp(mod.id);
                  allExternalModules.push({ id: mod.id, timestamp });
                }
              });
            });
          });
        }
      });

      // Sort by timestamp (oldest first - ascending order)
      // Example: If modules were added at times [1005, 1001, 1003, 1002, 1004, 1000]
      // After sort: [1000, 1001, 1002, 1003, 1004, 1005]
      // This ensures the first 5 modules EVER added are always unlocked
      allExternalModules.sort((a, b) => a.timestamp - b.timestamp);

      // Take first 5 IDs (indices 0-4) - these are the oldest modules
      const allowedIds = new Set(allExternalModules.slice(0, 5).map(card => card.id));

      // Update cache
      allowedExternalCardIdsCache = allowedIds;
      allowedExternalCardIdsCacheTime = Date.now();
    } catch (error) {
      console.error('[UC External Card] Failed to refresh allowed IDs cache:', error);
    }
  }

  /**
   * Check if module should be locked (6th+ card for non-Pro users)
   * This now checks GLOBALLY across all Ultra Card instances using a cache
   */
  private _shouldLockModule(
    module: ExternalCardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): boolean {
    // Never lock in editor contexts (HA edit mode or Live Preview)
    if ((hass as any)?.editMode) {
      return false;
    }
    // Use centralized ThirdPartyLimitService for consistent global enforcement
    try {
      // Never lock if the HA edit dialog is actually visible (preview context)
      try {
        const candidates = [
          ...Array.from(document.querySelectorAll('hui-dialog-edit-card')),
          ...Array.from(document.querySelectorAll('hui-card-preview')),
        ] as Element[];
        const isVisible = (el: Element): boolean => {
          const rect = el.getClientRects?.();
          return !!rect && rect.length > 0 && rect[0].width > 0 && rect[0].height > 0;
        };
        for (const el of candidates) {
          if (isVisible(el)) return false;
          const host = el.closest('ha-dialog, mwc-dialog') as Element | null;
          if (host && isVisible(host)) return false;
        }
      } catch {}

      const dashboardId = getCurrentDashboardId();
      // Prefer instance id attached by UltraCard; fallback to computed id
      const host = (this as any)?.host || undefined;
      const attachedId = (host as any)?.dataset?.ucInstanceId;
      // If the hosting Ultra Card flagged this as editor preview, or global flag set, never lock
      if ((config as any)?.__ucIsEditorPreview || (window as any).__UC_PREVIEW_SUPPRESS_LOCKS) {
        return false;
      }

      let cardId = attachedId || (config as any)?.__ucInstanceId || computeCardInstanceId(config!);
      // If config was registered, prefer the service-resolved id
      const resolved = (ThirdPartyLimitService as any).getCardIdForConfig?.(config);
      if (resolved) cardId = resolved;
      // Do NOT register here to avoid re-registering on every render; rely on UltraCard
      const { allowedKeys, isPro, totalThirdParty } = ThirdPartyLimitService.evaluate(hass);
      // Fast-path: if total 3rd-party modules <= limit, never lock
      if (!isPro && totalThirdParty <= 5) {
        return false;
      }
      // Match service key format (dashboardId:cardId:moduleId)
      // cardId already computed above; reuse here
      const key = `${dashboardId}:${cardId}:${module.id}`;
      return !allowedKeys.has(key);
    } catch (e) {
      // Fallback to existing cache-based logic if service fails
      const integrationUser = ucCloudAuthService.checkIntegrationAuth(hass);
      const isPro =
        integrationUser?.subscription?.tier === 'pro' &&
        integrationUser?.subscription?.status === 'active';
      if (isPro) return false;
      const now = Date.now();
      if (
        !allowedExternalCardIdsCache ||
        now - allowedExternalCardIdsCacheTime > ALLOWED_IDS_CACHE_TTL
      ) {
        this._refreshAllowedIdsCache(hass);
        if (!allowedExternalCardIdsCache) {
          const allExternalModules = this._getAllExternalModules(config);
          const sorted = [...allExternalModules].sort(
            (a, b) => this._extractTimestamp(a.id) - this._extractTimestamp(b.id)
          );
          const index = sorted.findIndex(m => m.id === module.id);
          return index >= 5;
        }
      }
      const isAllowed = allowedExternalCardIdsCache.has(module.id);
      return !isAllowed;
    }
  }

  renderGeneralTab(
    module: ExternalCardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<ExternalCardModule>) => void
  ): TemplateResult | null {
    // Check if this card has a native editor
    if (!this.hasNativeEditor(module.card_type)) {
      // No native editor - user should use YAML tab
      return null;
    }

    // Get card info and name - use fallback if card_type is not set
    const cardInfo = module.card_type ? ucExternalCardsService.getCardInfo(module.card_type) : null;
    const cardName = cardInfo?.name || module.card_type || 'External Card';

    // Ref callback to set up the native editor with caching to preserve UI state
    const setupEditor = (container: Element | undefined) => {
      if (!container || !module.card_type) return;

      const editorType = `${module.card_type}-editor`;
      // Use a cache key that includes both module ID and card type to prevent cross-contamination
      const cacheKey = `${module.id}-${module.card_type}`;

      // Check for cached editor using the composite key
      let editor = editorElementCache.get(cacheKey);

      // Check if editor needs to be created or re-created
      const needsNewEditor = !editor || editor.tagName.toLowerCase() !== editorType;

      // Check if editor exists but is not in the container (was detached by tab switch)
      const editorNotMounted = editor && !container.contains(editor);

      if (needsNewEditor) {
        // Clear any old cache entries for this module ID (with different card types)
        const keysToDelete: string[] = [];
        editorElementCache.forEach((_, key) => {
          if (key.startsWith(`${module.id}-`) && key !== cacheKey) {
            keysToDelete.push(key);
          }
        });
        keysToDelete.forEach(key => editorElementCache.delete(key));
        try {
          editor = document.createElement(editorType) as any;

          // Check if editor is actually a custom element
          if (editor instanceof HTMLUnknownElement) {
            // Clear cache since this card type doesn't have an editor
            editorElementCache.delete(cacheKey);
            container.innerHTML = `
              <div style="padding: 40px; text-align: center; color: var(--secondary-text-color);">
                <ha-icon icon="mdi:information-outline" style="font-size: 48px; opacity: 0.5; margin-bottom: 16px;"></ha-icon>
                <p style="font-size: 14px; margin-bottom: 8px;">This card does not have a visual editor.</p>
                <p style="font-size: 13px; opacity: 0.8;">Use the YAML tab to configure this card.</p>
              </div>
            `;
            return;
          }

          // Set up config-changed listener (only once when editor is created)
          editor.addEventListener('config-changed', (e: CustomEvent) => {
            e.stopPropagation();
            if (e.detail && e.detail.config) {
              // Check if config actually changed by comparing with current module config
              const newConfigKey = JSON.stringify(e.detail.config);
              const currentConfigKey = JSON.stringify(module.card_config || {});

              if (newConfigKey === currentConfigKey) {
                return; // Ignore spurious config-changed events
              }

              // Clear any existing debounce timer
              const existingTimer = updateDebounceTimers.get(module.id);
              if (existingTimer) {
                clearTimeout(existingTimer);
              }

              // Debounce the update to prevent rapid re-render loops
              const timer = window.setTimeout(() => {
                updateModule({ card_config: { ...e.detail.config } });
                updateDebounceTimers.delete(module.id);
              }, 150); // 150ms debounce

              updateDebounceTimers.set(module.id, timer);
            }
          });

          // Cache the editor and mount it
          editorElementCache.set(cacheKey, editor);
          container.innerHTML = '';
          container.appendChild(editor);
        } catch (error) {
          console.error('Failed to create native editor:', error);
          editorElementCache.delete(cacheKey);
          container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--error-color);">
              <ha-icon icon="mdi:alert-circle" style="font-size: 48px; opacity: 0.5; margin-bottom: 16px;"></ha-icon>
              <p style="font-size: 14px; margin-bottom: 8px;">Failed to load editor</p>
              <p style="font-size: 13px; opacity: 0.8;">Use the YAML tab to configure this card.</p>
            </div>
          `;
          return;
        }
      } else if (editorNotMounted) {
        // Editor exists in cache but was detached from DOM (tab switch) - re-mount it
        container.innerHTML = '';
        container.appendChild(editor);
      }

      // Update properties on cached editor ONLY if they've actually changed
      // This prevents unnecessary re-renders that cause scroll/focus issues
      try {
        const configChanged =
          JSON.stringify(editor.config || {}) !== JSON.stringify(module.card_config || {});

        if (configChanged) {
          if (typeof editor.setConfig === 'function') {
            editor.setConfig(module.card_config || {});
          } else {
            editor.config = module.card_config || {};
          }
        }

        // Always update hass as it contains entity states that may have changed
        editor.hass = hass;
      } catch (error) {
        console.error('Failed to update cached editor:', error);
      }
    };

    return html`
      ${this.injectUcFormStyles()}
      <div class="external-card-general-tab">
        <div class="settings-section">
          <div
            class="section-title"
            style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: var(--primary-color); text-transform: uppercase;"
          >
            USING ${cardName.toUpperCase()}'S NATIVE EDITOR
          </div>
          <div
            class="section-description"
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;"
          >
            Configure this 3rd party card using its native configuration interface.
          </div>
          <div class="native-editor-container" ${ref(setupEditor)}></div>
        </div>
      </div>
    `;
  }

  renderYamlTab(
    module: ExternalCardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<ExternalCardModule>) => void
  ): TemplateResult {
    // Convert config to YAML format with proper indentation
    let yamlString: string;
    try {
      // Use card_config or empty object if undefined
      const configToConvert = module.card_config || {};

      // Convert to YAML with proper formatting (standard HA card config format)
      yamlString = yaml.dump(configToConvert, {
        indent: 2,
        lineWidth: -1, // Don't wrap lines
        noRefs: true, // Don't use references
        sortKeys: false, // Preserve key order
      });
    } catch (error) {
      console.error('Failed to convert config to YAML:', error);
      yamlString = '# Error converting config to YAML\n';
    }

    const handleYamlChange = (e: CustomEvent) => {
      try {
        const newConfig = yaml.load(e.detail.value) as any;
        updateModule({ card_config: newConfig });
      } catch (error) {
        console.error('Invalid YAML in editor:', error);
      }
    };

    return html`
      ${this.injectUcFormStyles()}
      <div class="external-card-yaml-tab">
        <div class="settings-section">
          <div
            class="section-title"
            style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: var(--primary-color); text-transform: uppercase;"
          >
            CARD CONFIGURATION (YAML)
          </div>
          <div
            class="section-description"
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;"
          >
            Edit the card's configuration directly in YAML format. Changes are applied
            automatically.
          </div>
          <ultra-template-editor
            .hass=${hass}
            .value=${yamlString}
            .placeholder=${'type: custom:button-card\nentity: sensor.example\nname: Example Card'}
            .minHeight=${200}
            .maxHeight=${600}
            @value-changed=${handleYamlChange}
          ></ultra-template-editor>
        </div>
      </div>
    `;
  }

  renderPreview(
    module: ExternalCardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    isEditorPreview?: boolean
  ): TemplateResult {
    const moduleWithDesign = module as any;

    // Extract design properties from the design object (priority system)
    const designProperties = {
      padding_top: moduleWithDesign.design?.padding_top,
      padding_bottom: moduleWithDesign.design?.padding_bottom,
      padding_left: moduleWithDesign.design?.padding_left,
      padding_right: moduleWithDesign.design?.padding_right,
      margin_top: moduleWithDesign.design?.margin_top,
      margin_bottom: moduleWithDesign.design?.margin_bottom,
      margin_left: moduleWithDesign.design?.margin_left,
      margin_right: moduleWithDesign.design?.margin_right,
      background_color: moduleWithDesign.design?.background_color,
      background_image: moduleWithDesign.design?.background_image,
      background_image_type: moduleWithDesign.design?.background_image_type,
      background_image_entity: moduleWithDesign.design?.background_image_entity,
      background_size: moduleWithDesign.design?.background_size,
      background_position: moduleWithDesign.design?.background_position,
      background_repeat: moduleWithDesign.design?.background_repeat,
      border_style: moduleWithDesign.design?.border_style,
      border_width: moduleWithDesign.design?.border_width,
      border_color: moduleWithDesign.design?.border_color,
      border_radius: moduleWithDesign.design?.border_radius,
      box_shadow_h: moduleWithDesign.design?.box_shadow_h,
      box_shadow_v: moduleWithDesign.design?.box_shadow_v,
      box_shadow_blur: moduleWithDesign.design?.box_shadow_blur,
      box_shadow_spread: moduleWithDesign.design?.box_shadow_spread,
      box_shadow_color: moduleWithDesign.design?.box_shadow_color,
      position: moduleWithDesign.design?.position,
      top: moduleWithDesign.design?.top,
      bottom: moduleWithDesign.design?.bottom,
      left: moduleWithDesign.design?.left,
      right: moduleWithDesign.design?.right,
      z_index: moduleWithDesign.design?.z_index,
      width: moduleWithDesign.design?.width,
      height: moduleWithDesign.design?.height,
      max_width: moduleWithDesign.design?.max_width,
      max_height: moduleWithDesign.design?.max_height,
      min_width: moduleWithDesign.design?.min_width,
      min_height: moduleWithDesign.design?.min_height,
      overflow: moduleWithDesign.design?.overflow,
      clip_path: moduleWithDesign.design?.clip_path,
      backdrop_filter: moduleWithDesign.design?.backdrop_filter,
    };

    // Container styles for design system with proper priority: design properties override module properties
    const containerStyles = {
      padding:
        designProperties.padding_top ||
        designProperties.padding_bottom ||
        designProperties.padding_left ||
        designProperties.padding_right ||
        moduleWithDesign.padding_top ||
        moduleWithDesign.padding_bottom ||
        moduleWithDesign.padding_left ||
        moduleWithDesign.padding_right
          ? `${this.addPixelUnit(designProperties.padding_top || moduleWithDesign.padding_top) || '0px'} ${this.addPixelUnit(designProperties.padding_right || moduleWithDesign.padding_right) || '0px'} ${this.addPixelUnit(designProperties.padding_bottom || moduleWithDesign.padding_bottom) || '0px'} ${this.addPixelUnit(designProperties.padding_left || moduleWithDesign.padding_left) || '0px'}`
          : '0px',
      // Standard 8px top/bottom margin for proper web design spacing
      margin:
        designProperties.margin_top ||
        designProperties.margin_bottom ||
        designProperties.margin_left ||
        designProperties.margin_right ||
        moduleWithDesign.margin_top ||
        moduleWithDesign.margin_bottom ||
        moduleWithDesign.margin_left ||
        moduleWithDesign.margin_right
          ? `${designProperties.margin_top || moduleWithDesign.margin_top || '8px'} ${designProperties.margin_right || moduleWithDesign.margin_right || '0px'} ${designProperties.margin_bottom || moduleWithDesign.margin_bottom || '8px'} ${designProperties.margin_left || moduleWithDesign.margin_left || '0px'}`
          : '8px 0',
      background:
        designProperties.background_color || moduleWithDesign.background_color || 'transparent',
      backgroundImage: this.getBackgroundImageCSS(
        { ...moduleWithDesign, ...designProperties },
        hass
      ),
      backgroundSize:
        designProperties.background_size || moduleWithDesign.background_size || 'cover',
      backgroundPosition:
        designProperties.background_position || moduleWithDesign.background_position || 'center',
      backgroundRepeat:
        designProperties.background_repeat || moduleWithDesign.background_repeat || 'no-repeat',
      border:
        (designProperties.border_style || moduleWithDesign.border_style) &&
        (designProperties.border_style || moduleWithDesign.border_style) !== 'none'
          ? `${designProperties.border_width || moduleWithDesign.border_width || '1px'} ${designProperties.border_style || moduleWithDesign.border_style} ${designProperties.border_color || moduleWithDesign.border_color || 'var(--divider-color)'}`
          : 'none',
      borderRadius:
        this.addPixelUnit(designProperties.border_radius || moduleWithDesign.border_radius) || '0',
      position: designProperties.position || moduleWithDesign.position || 'relative',
      top: designProperties.top || moduleWithDesign.top || 'auto',
      bottom: designProperties.bottom || moduleWithDesign.bottom || 'auto',
      left: designProperties.left || moduleWithDesign.left || 'auto',
      right: designProperties.right || moduleWithDesign.right || 'auto',
      zIndex: designProperties.z_index || moduleWithDesign.z_index || 'auto',
      width: designProperties.width || moduleWithDesign.width || '100%',
      height: designProperties.height || moduleWithDesign.height || 'auto',
      maxWidth: designProperties.max_width || moduleWithDesign.max_width || 'none',
      maxHeight: designProperties.max_height || moduleWithDesign.max_height || 'none',
      minWidth: designProperties.min_width || moduleWithDesign.min_width || 'none',
      minHeight: designProperties.min_height || moduleWithDesign.min_height || 'auto',
      overflow: designProperties.overflow || moduleWithDesign.overflow || 'visible',
      clipPath: designProperties.clip_path || moduleWithDesign.clip_path || 'none',
      backdropFilter:
        designProperties.backdrop_filter || moduleWithDesign.backdrop_filter || 'none',
      boxShadow:
        (designProperties.box_shadow_h || moduleWithDesign.box_shadow_h) &&
        (designProperties.box_shadow_v || moduleWithDesign.box_shadow_v)
          ? `${designProperties.box_shadow_h || moduleWithDesign.box_shadow_h || '0'} ${designProperties.box_shadow_v || moduleWithDesign.box_shadow_v || '0'} ${designProperties.box_shadow_blur || moduleWithDesign.box_shadow_blur || '0'} ${designProperties.box_shadow_spread || moduleWithDesign.box_shadow_spread || '0'} ${designProperties.box_shadow_color || moduleWithDesign.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : 'none',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    };

    // Check if card type is set
    if (!module.card_type) {
      return html`
        <div class="external-card-module-container" style=${this.styleObjectToCss(containerStyles)}>
          <div class="external-card-placeholder">
            <div class="ultra-card-logo">
              <ha-icon
                icon="mdi:card-multiple"
                style="--mdc-icon-size: 48px; color: var(--primary-color);"
              ></ha-icon>
            </div>
            <p class="card-title">Ultra Card</p>
            <p class="subtitle">No 3rd party card selected</p>
            <p class="instruction">Click edit to choose and configure a custom card</p>
          </div>
        </div>
      `;
    }

    // Check if card config has sufficient data (more than just 'type')
    if (!module.card_config || Object.keys(module.card_config).length <= 1) {
      const hasEditor = ucExternalCardsService.hasCardEditor(module.card_type);
      const cardName =
        module.name ||
        module.card_type
          .replace('custom:', '')
          .replace('-', ' ')
          .replace(/\b\w/g, l => l.toUpperCase());

      return html`
        <div class="external-card-module-container" style=${this.styleObjectToCss(containerStyles)}>
          <div class="external-card-placeholder">
            <div class="ultra-card-logo">
              <ha-icon
                icon="mdi:card-multiple"
                style="--mdc-icon-size: 48px; color: var(--primary-color);"
              ></ha-icon>
            </div>
            <p class="card-title">${cardName}</p>
            <p class="subtitle">3rd Party Card Ready</p>
            ${hasEditor
              ? html`<p class="instruction">Use the settings below to set up this card</p>`
              : html`<p class="instruction">
                  Please use the YAML editor below to configure this card
                </p>`}
          </div>
        </div>
      `;
    }

    // Check if card is available
    const isAvailable = ucExternalCardsService.isCardAvailable(module.card_type);

    if (!isAvailable) {
      return html`
        <div class="external-card-module-container" style=${this.styleObjectToCss(containerStyles)}>
          <div class="external-card-error">
            <div class="ultra-card-logo">
              <ha-icon
                icon="mdi:alert-circle"
                style="--mdc-icon-size: 48px; color: var(--error-color);"
              ></ha-icon>
            </div>
            <p class="card-title">Card Not Found</p>
            <p class="subtitle">${module.card_type}</p>
            <p class="instruction">This card is not installed on your system</p>
          </div>
        </div>
      `;
    }

    // Use ref callback to create and mount the card element after Lit renders the container
    // CRITICAL: Cache card elements and update their hass property on every render to enable
    // real-time updates (like native HA behavior). This fixes sporadic updates in 3rd party cards.
    const refCallback = (container: Element | undefined) => {
      if (!container) {
        return;
      }

      // Use different cache keys for editor preview vs main preview to prevent DOM element stealing
      const cacheKey = isEditorPreview ? `${module.id}-editor` : module.id;
      let cardElement = cardElementCache.get(cacheKey) as any;

      // Check if we need to create a new card element
      const needsRecreate =
        !cardElement ||
        cardElement.tagName.toLowerCase() !== module.card_type.replace('custom:', '');

      if (needsRecreate) {
        // Create fresh card element
        try {
          cardElement = ucExternalCardsService.createCardElement(
            module.card_type,
            module.card_config,
            hass
          ) as HTMLElement;

          if (!cardElement) {
            throw new Error('Failed to create card element');
          }

          // Apply inline styles to card element to fill container
          cardElement.style.width = '100%';
          cardElement.style.minWidth = '0';
          cardElement.style.flex = '1 1 auto';
          cardElement.style.display = 'block';

          // Clear and mount the card element
          container.innerHTML = '';
          container.appendChild(cardElement);

          // Cache the card element for future updates
          cardElementCache.set(cacheKey, cardElement);
        } catch (error) {
          console.error(`[External Card] Failed to create/mount ${module.card_type}:`, error);
          // If card creation fails, show error in container
          container.innerHTML = `
            <div class="external-card-placeholder">
              <div class="ultra-card-logo">
                <ha-icon icon="mdi:cog" style="--mdc-icon-size: 48px; color: var(--primary-color);"></ha-icon>
              </div>
              <p class="card-title">${module.name || module.card_type}</p>
              <p class="subtitle">3rd Party Card</p>
              <p class="instruction">Configuring card...</p>
            </div>
          `;
          return;
        }
      } else {
        // Card element exists - update its properties for real-time updates
        try {
          // Update config if it actually changed
          const configChanged =
            JSON.stringify(cardElement.config || {}) !== JSON.stringify(module.card_config || {});

          if (configChanged) {
            if (typeof cardElement.setConfig === 'function') {
              cardElement.setConfig(module.card_config || {});
            } else {
              cardElement.config = module.card_config || {};
            }
          }

          // CRITICAL: Always update hass on every render to enable real-time updates
          // This replicates native HA behavior where cards receive continuous hass updates
          // and allows cards like Apex Chart to show loading indicators and update smoothly
          cardElement.hass = hass;

          // Ensure element is still mounted (might have been detached by Lit)
          if (!container.contains(cardElement)) {
            container.innerHTML = '';
            container.appendChild(cardElement);
          }
        } catch (error) {
          console.error(`[External Card] Failed to update ${module.card_type}:`, error);
          // If update fails, try to recreate on next render
          cardElementCache.delete(cacheKey);
        }
      }
    };

    // Check if module should be locked (6th+ card for non-Pro users)
    // Skip lock check in editor preview (Live Preview in settings popup)
    const shouldLock = !isEditorPreview && this._shouldLockModule(module, hass, config);

    if (shouldLock) {
      // Read current totals for display
      const evalResult = ThirdPartyLimitService.evaluate(hass);
      const total3p = evalResult.totalThirdParty ?? 0;
      // Render with Pro lock overlay
      return html`
        <div class="external-card-module-container" style=${this.styleObjectToCss(containerStyles)}>
          <div
            class="pro-module-locked"
            style="position: relative; min-height: 200px; display: flex; align-items: center; justify-content: center;"
          >
            <div
              ${ref(refCallback)}
              class="external-card-container uc-external-card"
              style="
                width: 100%;
                display: flex;
                flex-direction: column;
                flex: 1 1 auto;
                min-width: 0;
                min-height: 0;
                filter: blur(8px);
                opacity: 0.5;
                pointer-events: none;
              "
            >
              <!-- Card will be mounted here -->
            </div>
            <div
              class="pro-module-overlay"
              style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 12px;
                z-index: 10001;
                pointer-events: all;
                cursor: default;
                touch-action: manipulation;
              "
            >
              <div
                class="pro-module-message"
                style="
                  text-align: center;
                  color: white;
                  padding: 6px;
                  max-width: 95%;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  gap: 4px;
                  pointer-events: all;
                "
              >
                <ha-icon icon="mdi:lock" style="font-size: 20px; flex-shrink: 0;"></ha-icon>
                <div style="font-size: 10px; opacity: 0.9; line-height: 1.2; white-space: nowrap;">
                  ${total3p}/5 3rd Party Cards
                </div>
                <div
                  style="
                    margin-top: 6px;
                    font-size: 10px;
                    opacity: 0.7;
                    white-space: nowrap;
                  "
                >
                  Refresh For Check
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Return the wrapper container with ref callback (unlocked card)
    // Wrap the card content container inside the design container
    return html`
      <div class="external-card-module-container" style=${this.styleObjectToCss(containerStyles)}>
        <div
          ${ref(refCallback)}
          class="external-card-container uc-external-card"
          style="
            width: 100%;
            display: flex;
            flex-direction: column;
            flex: 1 1 auto;
            min-width: 0;
            min-height: 0;
          "
          @click=${(e: Event) => e.stopPropagation()}
        >
          <!-- Card will be mounted here -->
        </div>
      </div>
    `;
  }

  private getBackgroundImageCSS(moduleWithDesign: any, hass: HomeAssistant): string {
    if (
      !moduleWithDesign.background_image_type ||
      moduleWithDesign.background_image_type === 'none'
    ) {
      return 'none';
    }

    switch (moduleWithDesign.background_image_type) {
      case 'upload':
      case 'url':
        if (moduleWithDesign.background_image) {
          return `url("${moduleWithDesign.background_image}")`;
        }
        break;

      case 'entity':
        if (
          moduleWithDesign.background_image_entity &&
          hass?.states[moduleWithDesign.background_image_entity]
        ) {
          const entityState = hass.states[moduleWithDesign.background_image_entity];
          let imageUrl = '';

          // Try to get image from entity
          if (entityState.attributes?.entity_picture) {
            imageUrl = entityState.attributes.entity_picture;
          } else if (entityState.attributes?.image) {
            imageUrl = entityState.attributes.image;
          } else if (entityState.state && typeof entityState.state === 'string') {
            // Handle cases where state itself is an image path
            if (entityState.state.startsWith('/') || entityState.state.startsWith('http')) {
              imageUrl = entityState.state;
            }
          }

          if (imageUrl) {
            // Handle Home Assistant local paths
            if (imageUrl.startsWith('/local/') || imageUrl.startsWith('/media/')) {
              imageUrl = imageUrl;
            } else if (imageUrl.startsWith('/')) {
              imageUrl = imageUrl;
            }
            return `url("${imageUrl}")`;
          }
        }
        break;
    }

    return 'none';
  }

  private styleObjectToCss(styleObj: Record<string, string>): string {
    return Object.entries(styleObj)
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
        return `${kebabKey}: ${value}`;
      })
      .join('; ');
  }

  private addPixelUnit(value: string | undefined): string | undefined {
    if (!value) return value;

    // If value is just a number or contains only numbers, add px
    if (/^\d+$/.test(value)) {
      return `${value}px`;
    }

    // If value is a multi-value (like "5 10 15 20"), add px to each number
    if (/^[\d\s]+$/.test(value)) {
      return value
        .split(' ')
        .map(v => (v.trim() ? `${v}px` : v))
        .join(' ');
    }

    // Otherwise return as-is (already has units like px, em, %, etc.)
    return value;
  }

  static get styles(): CSSResult {
    return css`
      /* Outer design container that applies design properties */
      .external-card-module-container {
        width: 100%;
        box-sizing: border-box;
      }

      /* Container works in both flex and grid layouts */
      .external-card-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        flex: 1 1 auto; /* For flex parent contexts (horizontal layouts) */
        min-width: 0; /* Allow flex shrinking below content size */
        min-height: 0; /* Allow flex shrinking below content size */
      }

      /* Child cards fill the container */
      .external-card-container > * {
        width: 100%;
        min-width: 0; /* Allow shrinking */
        flex: 1 1 auto; /* Let cards participate in flex */
      }

      /* Unique class for targeting 3rd party cards separately */
      .uc-external-card {
        /* Can be styled via Design tab */
      }

      /* Placeholder styles for when card isn't configured */
      .external-card-placeholder,
      .external-card-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px 24px;
        text-align: center;
        color: var(--secondary-text-color);
        background: var(--card-background-color, var(--ha-card-background));
        border-radius: var(--ha-card-border-radius, 12px);
        border: 1px dashed var(--divider-color);
        min-height: 180px;
        gap: 12px;
      }

      .external-card-error {
        border-color: var(--error-color);
        color: var(--error-color);
      }

      .ultra-card-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        background: rgba(var(--rgb-primary-color), 0.1);
        border-radius: 16px;
        margin-bottom: 8px;
      }

      .card-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-text-color);
        margin: 0 0 4px 0;
      }

      .external-card-placeholder p,
      .external-card-error p {
        margin: 0;
        font-size: 14px;
      }

      .external-card-placeholder .subtitle,
      .external-card-error .subtitle {
        font-size: 13px;
        opacity: 0.8;
        margin: 0 0 8px 0;
      }

      .external-card-placeholder .instruction,
      .external-card-error .instruction {
        font-size: 12px;
        opacity: 0.7;
        margin: 0;
        font-style: italic;
      }

      .external-card-error .card-type {
        font-family: monospace;
        font-size: 13px;
        opacity: 0.9;
      }

      /* Native editor container */
      .native-editor-container {
        min-height: 200px;
      }
    `;
  }
}
