import { html, TemplateResult, css, CSSResult } from 'lit';
import { ref } from 'lit/directives/ref.js';
import { cache } from 'lit/directives/cache.js';
import { guard } from 'lit/directives/guard.js';
import { HomeAssistant } from 'custom-card-helpers';
import { ExternalCardModule, UltraCardConfig, CardModule } from '../types';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import {
  ucExternalCardsService,
  normalizeNativeCardConfigType,
} from '../services/uc-external-cards-service';
import { externalCardContainerService } from '../services/external-card-container-service';
import {
  ThirdPartyLimitService,
  computeCardInstanceId,
  getCurrentDashboardId,
} from '../pro/third-party-limit-service';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import yaml from 'js-yaml';
import '../components/ultra-template-editor';

// Debounce timers for editor config updates to prevent rapid re-render loops
const updateDebounceTimers = new Map<string, number>();

// Editor element cache to prevent unnecessary recreation and preserve UI state (scroll, focus, dropdowns)
const editorElementCache = new Map<string, any>();

// Guard to prevent re-entrancy in config-changed handler (prevents freeze loops)
const configChangeGuard = new Map<string, boolean>();

// Track last config sent to prevent duplicate updates
const lastSentConfig = new Map<string, string>();

/**
 * Strip card-mod properties from config before passing to editors
 * Card-mod is a runtime integration that editors don't understand
 * These properties should only be present at render time, not editor time
 */
function stripCardModProperties(config: any): any {
  if (!config || typeof config !== 'object') return config;

  const stripped = { ...config };

  // Remove all card-mod related properties (case-insensitive, handle spaces/hyphens/underscores)
  // Matches: card_mod, card mod, card-mod, cardMod, cardmod, CARD_MOD, etc.
  Object.keys(stripped).forEach(key => {
    const normalizedKey = key.toLowerCase().replace(/[-\s]/g, '_');
    if (normalizedKey === 'card_mod' || normalizedKey.startsWith('card_mod_')) {
      delete stripped[key];
    }
  });

  return stripped;
}

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
  
  // Clear config change guards and tracking
  configChangeGuard.delete(moduleId);
  lastSentConfig.delete(moduleId);

  // NOTE: We do NOT destroy the container here!
  // The container is managed by a singleton service and persists across disconnects.
  // This allows the same card element to be remounted without recreation,
  // preventing flicker when Lit re-renders cause disconnect/reconnect cycles.

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
    };
  }

  hasNativeEditor(cardType: string): boolean {
    if (!cardType) return false;

    const editorType = `${cardType}-editor`;
    const editorElement = customElements.get(editorType);

    // Check if editor exists and is not HTMLUnknownElement
    return editorElement !== undefined && !(editorElement.prototype instanceof HTMLUnknownElement);
  }

  /**
   * Check if config has meaningfully changed
   * This is more nuanced than JSON.stringify comparison to handle edge cases
   * Specifically designed to catch Bubble Card entity selections that might be missed
   */
  private _hasConfigChanged(oldConfig: any, newConfig: any): boolean {
    // Handle null/undefined cases
    if (!oldConfig && !newConfig) return false;
    if (!oldConfig || !newConfig) return true;
    
    // JSON comparison as first pass
    const oldJson = JSON.stringify(oldConfig);
    const newJson = JSON.stringify(newConfig);
    
    if (oldJson === newJson) return false;
    
    // For Bubble Card and other cards: specifically check entity field changes
    // Different cards may use different field names for entities
    if (oldConfig.entity !== newConfig.entity) return true;
    if (oldConfig.entity_id !== newConfig.entity_id) return true;
    
    // Check for nested entity references (some cards nest config)
    if (oldConfig.settings?.entity !== newConfig.settings?.entity) return true;
    if (oldConfig.data?.entity !== newConfig.data?.entity) return true;
    
    // If we got here, configs are different (based on JSON comparison)
    return true;
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
      // Pro users never see locks
      if (isPro) {
        return false;
      }
      // Fast-path: if total 3rd-party modules <= limit, never lock
      if (totalThirdParty <= 5) {
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
    // For Custom YAML Cards (empty card_type), show guidance to use YAML tab
    if (!module.card_type) {
      const isCustomYamlCard = module.name === 'Custom YAML Card';
      return html`
        ${this.injectUcFormStyles()}
        <div class="external-card-general-tab">
          <div class="settings-section" style="text-align: center; padding: 40px 20px;">
            <ha-icon 
              icon="${isCustomYamlCard ? 'mdi:code-braces' : 'mdi:information-outline'}" 
              style="font-size: 48px; color: var(--primary-color); opacity: 0.7; margin-bottom: 16px;"
            ></ha-icon>
            <p style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 8px;">
              ${isCustomYamlCard ? 'Paste Your Card Configuration' : 'No Card Type Set'}
            </p>
            <p style="font-size: 14px; color: var(--secondary-text-color); margin-bottom: 16px;">
              ${isCustomYamlCard 
                ? 'Use the YAML tab to paste any valid Lovelace card configuration.' 
                : 'Switch to the YAML tab to configure the card type.'}
            </p>
            <div style="background: rgba(var(--rgb-primary-color), 0.1); border-radius: 8px; padding: 16px; text-align: left; font-family: monospace; font-size: 13px; max-width: 320px; margin: 0 auto;">
              <div style="color: var(--secondary-text-color); margin-bottom: 8px; font-family: inherit; font-size: 12px;">Example configuration:</div>
              <div style="color: var(--primary-text-color);">type: custom:webrtc-camera</div>
              <div style="color: var(--primary-text-color);">url: rtsp://user:pass@ip:554/stream</div>
            </div>
          </div>
        </div>
      `;
    }

    // For native HA cards (hui-*), always show General tab - their editors always exist
    const isNativeCard = module.card_type && module.card_type.startsWith('hui-');
    
    // Check if this card has a native editor (skip check for native HA cards)
    if (!isNativeCard && !this.hasNativeEditor(module.card_type)) {
      // No native editor - user should use YAML tab
      return null;
    }

    // Get card info and name - use fallback if card_type is not set
    let cardName: string;
    if (isNativeCard) {
      // For native HA cards, try to get friendly name from module.name
      cardName = module.name || module.card_type || 'Native HA Card';
    } else {
    const cardInfo = module.card_type ? ucExternalCardsService.getCardInfo(module.card_type) : null;
      cardName = cardInfo?.name || module.card_type || 'External Card';
    }

    // Helper function to set properties on the editor
    const setupEditorProperties = (editor: any, container: Element) => {
      try {
        const editorIsMounted = container.contains(editor);

        // Provide necessary context to native editors (lovelace object)
        // Native HA editors require this for navigation, view configuration, etc.
        if ((hass as any).lovelace) {
          (editor as any).lovelace = (hass as any).lovelace;
        }

        // Strip card-mod properties before passing to editor
        // Card-mod is a runtime integration that editors don't understand
        const editorConfig = stripCardModProperties(module.card_config || {});

        if (
          module.card_type &&
          module.card_type.startsWith('hui-') &&
          editorConfig &&
          typeof editorConfig === 'object'
        ) {
          editorConfig.type = normalizeNativeCardConfigType(module.card_type);
        }

        const configChanged = JSON.stringify(editor.config || {}) !== JSON.stringify(editorConfig);

        // Skip setConfig if guard is active (we're in the middle of handling a config change)
        // This prevents triggering another config-changed event during re-render
        const guardActive = configChangeGuard.get(module.id);
        
        // Always update config if editor was just remounted OR if config changed
        // But NOT if the guard is active (prevents loop)
        if (!guardActive && (!editorIsMounted || configChanged)) {
          // Ensure hass is set BEFORE setConfig for native editors that might need it during initialization
          // e.g. hui-entities-card-editor relies on hass for entity dropdowns
          editor.hass = hass;

          // Set guard temporarily while we update config to prevent re-entrancy
          configChangeGuard.set(module.id, true);
          
          try {
            if (typeof editor.setConfig === 'function') {
              editor.setConfig(editorConfig);
            } else {
              editor.config = editorConfig;
            }
          } finally {
            // Clear guard after a microtask to allow any synchronous config-changed to be ignored
            setTimeout(() => configChangeGuard.set(module.id, false), 50);
          }
        }

        // Always update hass as it contains entity states that may have changed
        editor.hass = hass;
      } catch (error) {
        console.error('Failed to update cached editor:', error);
      }
    };

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
          // Create editor element directly (works for both native and custom cards)
          editor = document.createElement(editorType) as any;

          // Check if editor is actually a custom element
          if (!editor || editor instanceof HTMLUnknownElement) {
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

          // Track pending config for debounced updates (closure variable)
          let pendingConfig: any = null;
          
          // Set up config-changed listener (only once when editor is created)
          editor.addEventListener('config-changed', (e: CustomEvent) => {
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            if (e.detail && e.detail.config) {
              // Preserve card-mod properties from original config
              // The editor doesn't know about card-mod, so we need to merge it back in
              const originalCardMod: any = {};
              if (module.card_config) {
                Object.keys(module.card_config).forEach(key => {
                  const normalizedKey = key.toLowerCase().replace(/[-\s]/g, '_');
                  if (normalizedKey === 'card_mod' || normalizedKey.startsWith('card_mod_')) {
                    originalCardMod[key] = module.card_config![key];
                  }
                });
              }

              // Merge editor config with preserved card-mod properties
              const mergedConfig = {
                ...e.detail.config,
                ...originalCardMod,
              };
              
              // Check against last sent config to prevent duplicate updates
              const configKey = JSON.stringify(mergedConfig);
              if (lastSentConfig.get(module.id) === configKey) {
                return;
              }

              // Check if config meaningfully changed using improved detection
              const configMeaningfullyChanged = this._hasConfigChanged(
                module.card_config || {},
                mergedConfig
              );

              if (!configMeaningfullyChanged) {
                return;
              }

              // Track this config to prevent duplicates
              lastSentConfig.set(module.id, configKey);
              
              // Store latest config for the debounced update
              pendingConfig = { ...mergedConfig };

              // IMMEDIATE: Update the Live Preview card element directly (no waiting)
              // This ensures the Live Preview shows changes immediately
              // Note: Pass full config WITH card_mod to the actual card for rendering
              const liveContainerId = `${module.id}-live`;
              externalCardContainerService.updateConfig(liveContainerId, {
                type: module.card_type,
                ...mergedConfig,
              });

              // Clear any existing debounce timer
              const existingTimer = updateDebounceTimers.get(module.id);
              if (existingTimer) {
                clearTimeout(existingTimer);
              }

              // Set guard to prevent setupEditorProperties from resetting editor during typing
              configChangeGuard.set(module.id, true);

              // Longer debounce (600ms) to allow smooth typing without interruption
              const timer = window.setTimeout(() => {
                // Use the latest pending config (captures all keystrokes during debounce)
                if (pendingConfig) {
                  updateModule({ card_config: pendingConfig });
                  pendingConfig = null;
                }
                updateDebounceTimers.delete(module.id);
                
                // Clear guard after re-render completes
                setTimeout(() => {
                  configChangeGuard.set(module.id, false);
                }, 200);
              }, 600);

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

      // CRITICAL FIX: Prevent keyboard and input events from bubbling to parent
      // This isolates the embedded 3rd party editor from Ultra Card's event handlers
      // Prevents issues where typing in embedded editors causes characters to be deleted
      // Using a data attribute to prevent duplicate listeners on the same container
      if (!container.hasAttribute('data-uc-events-attached')) {
        container.setAttribute('data-uc-events-attached', 'true');
        
        const stopEventBubbling = (e: Event) => {
          e.stopPropagation();
        };
        
        // Stop all events from bubbling UP to Ultra Card handlers
        // Use bubble phase (false) so events reach the editor elements first
        container.addEventListener('keydown', stopEventBubbling, false);
        container.addEventListener('keyup', stopEventBubbling, false);
        container.addEventListener('keypress', stopEventBubbling, false);
        container.addEventListener('input', stopEventBubbling, false);
        container.addEventListener('change', stopEventBubbling, false);
        container.addEventListener('focus', stopEventBubbling, false);
        container.addEventListener('blur', stopEventBubbling, false);
        
        // CRITICAL: Stop click/mouse/pointer events in BUBBLE phase (not capture phase)
        // Using bubble phase (false) allows events to reach dropdown elements first,
        // then stops them from bubbling up to Ultra Card's handlers which can cause freezing.
        // Capture phase (true) would block events before reaching the dropdowns.
        container.addEventListener('click', stopEventBubbling, false);
        container.addEventListener('mousedown', stopEventBubbling, false);
        container.addEventListener('mouseup', stopEventBubbling, false);
        container.addEventListener('pointerdown', stopEventBubbling, false);
        container.addEventListener('pointerup', stopEventBubbling, false);
      }

      // CRITICAL: Skip ALL property updates when user is typing (guard is active)
      // This prevents editor.hass updates from causing the 3rd party editor to re-render
      // and reset input values during typing
      if (configChangeGuard.get(module.id)) {
        return;
      }

      // Update properties on cached editor (for cached/remounted editors)
      setupEditorProperties(editor, container);
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
        flowLevel: -1, // Use block style for all levels
        styles: {
          '!!null': 'empty', // Don't output null values
        },
      });

      // Remove any leading pipe character if present (shouldn't happen, but defensive)
      yamlString = yamlString.replace(/^\|\s*\n/, '');
    } catch (error) {
      console.error('[UC] Failed to convert config to YAML:', error);
      yamlString = '# Error converting config to YAML\n';
    }

    const handleYamlChange = (e: CustomEvent) => {
      try {
        const newConfig = yaml.load(e.detail.value) as any;
        
        // Extract card type from YAML if present and update card_type accordingly
        // This enables the "Custom YAML Card" workflow where users paste complete configs
        if (newConfig && typeof newConfig === 'object' && newConfig.type) {
          let extractedCardType = newConfig.type;
          
          // Remove 'custom:' prefix for element name (e.g., 'custom:webrtc-camera' -> 'webrtc-camera')
          if (typeof extractedCardType === 'string' && extractedCardType.startsWith('custom:')) {
            extractedCardType = extractedCardType.substring(7);
          }
          
          // Check if card_type changed (or was empty before)
          if (module.card_type !== extractedCardType) {
            console.log('[UC External Card] YAML type detected, updating card_type:', extractedCardType);
            updateModule({ 
              card_type: extractedCardType,
              card_config: newConfig 
            });
          } else {
            // Card type unchanged, just update config
            updateModule({ card_config: newConfig });
          }
        } else {
          // No type in config, just update card_config
          updateModule({ card_config: newConfig });
        }
      } catch (error) {
        console.error('Invalid YAML in editor:', error);
      }
    };

    // Use Ultra Card's own CodeMirror-based editor for YAML

    return html`
      ${this.injectUcFormStyles()}
      <div class="external-card-yaml-tab" style="width: 100%; height: 100%; display: block;">
        <div class="settings-section" style="width: 100%; height: 100%; display: block;">
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
          <div 
            class="yaml-editor-container" 
            style="width: 100%; display: block;"
            @mousedown=${(e: Event) => {
              // Only stop propagation for drag operations, not clicks on the editor
              const target = e.target as HTMLElement;
              if (!target.closest('ultra-template-editor') && !target.closest('.cm-editor')) {
                e.stopPropagation();
              }
            }}
            @dragstart=${(e: Event) => e.stopPropagation()}
          >
            <ultra-template-editor
              .hass=${hass}
              .value=${yamlString}
              .placeholder=${"type: custom:webrtc-camera\nurl: rtsp://user:pass@192.168.1.100:554/stream\n\n# Or any other card:\ntype: custom:button-card\nentity: sensor.example\nname: Example Card"}
              .minHeight=${300}
              .maxHeight=${600}
              @value-changed=${handleYamlChange}
            ></ultra-template-editor>
          </div>
        </div>
      </div>
    `;
  }

  renderPreview(
    module: ExternalCardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
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
      // Check if this is a Custom YAML Card (name indicates it was created via Custom YAML Card option)
      const isCustomYamlCard = module.name === 'Custom YAML Card';
      
      return html`
        <div class="external-card-module-container" style=${this.styleObjectToCss(containerStyles)}>
          <div class="external-card-placeholder">
            <div class="ultra-card-logo">
              <ha-icon
                icon="${isCustomYamlCard ? 'mdi:code-braces' : 'mdi:card-multiple'}"
                style="--mdc-icon-size: 48px; color: var(--primary-color);"
              ></ha-icon>
            </div>
            <p class="card-title">${isCustomYamlCard ? 'Custom YAML Card' : 'Ultra Card'}</p>
            <p class="subtitle">${isCustomYamlCard ? 'Paste your card configuration' : 'No 3rd party card selected'}</p>
            <p class="instruction">${isCustomYamlCard 
              ? 'Go to the YAML tab and paste any valid Lovelace card configuration' 
              : 'Click edit to choose and configure a custom card'}</p>
            ${isCustomYamlCard ? html`
              <div style="margin-top: 12px; padding: 12px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 8px; font-size: 12px; font-family: monospace; text-align: left; max-width: 280px;">
                <div style="color: var(--secondary-text-color); margin-bottom: 4px;">Example:</div>
                <div style="color: var(--primary-text-color);">type: custom:webrtc-camera</div>
                <div style="color: var(--primary-text-color);">url: rtsp://...</div>
              </div>
            ` : ''}
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

    // Check if card is available (remove custom: prefix if present)
    const cardElementName = module.card_type.startsWith('custom:')
      ? module.card_type.substring(7)
      : module.card_type;
    const isAvailable = ucExternalCardsService.isCardAvailable(cardElementName);

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

    // Use the container service for isolated card management
    // This provides true isolation from Ultra Card's render cycle
    const mountContainer = (containerDiv: Element | undefined) => {
      // ref() calls this with undefined when element is removed during re-renders
      // This is normal Lit behavior - just skip silently
      if (!containerDiv || !(containerDiv instanceof HTMLElement)) {
        return;
      }

      // CRITICAL: Use separate container IDs for each context
      // The same card element can only be in ONE place in the DOM at a time
      // Dashboard, HA Preview, and Live Preview must each have their own card instance
      let containerId = module.id;
      if (previewContext === 'live') {
        containerId = `${module.id}-live`;
      } else if (previewContext === 'ha-preview') {
        containerId = `${module.id}-ha-preview`;
      }
      // else: dashboard context uses base module.id

      // CRITICAL: Check if container already exists in service before creating a new one
      // The Live Preview creates a NEW DOM element on every render, but the card element
      // should persist across renders to prevent flicker
      const currentChild = containerDiv.firstElementChild;
      const isAlreadyInitialized = (containerDiv as any)._ucInitialized === containerId;

      // Check if we already have the card element in the service
      const hasExistingContainer = externalCardContainerService.hasContainer(containerId);

      // FAST PATH: If this DOM already has the right card mounted, skip everything
      if (isAlreadyInitialized && currentChild && hasExistingContainer) {
        // Already correctly mounted with the right card element, do nothing
        return;
      }

      // REMOUNT PATH: Container exists but this is a new DOM (Live Preview re-render)
      // Get the existing container WITHOUT creating a new card element
      if (hasExistingContainer && !currentChild) {
        // Get the existing container (this won't create a new one, just returns the existing)
        const cardConfig = {
          type: module.card_type,
          ...(module.card_config || {}),
        };

        const isolatedContainer = externalCardContainerService.getContainer(
          containerId,
          module.card_type,
          cardConfig
        );

        // Mount the existing container to the new DOM
        containerDiv.appendChild(isolatedContainer);
        (containerDiv as any)._ucInitialized = containerId;
        return;
      }

      // SLOW PATH: First mount or config changed - create/update the card element
      // Get or create the card element
      const cardConfig = {
        type: module.card_type,
        ...(module.card_config || {}),
      };

      const isolatedContainer = externalCardContainerService.getContainer(
        containerId,
        module.card_type,
        cardConfig
      );

      // Mount or remount the container
      if (currentChild !== isolatedContainer) {
        // Only manipulate DOM if the child is wrong or missing
        if (currentChild) {
          containerDiv.removeChild(currentChild);
        }
        containerDiv.appendChild(isolatedContainer);

        // Force a resize event for cards that might need it (like Entity Progress)
        // Only on first mount
        if (!hasExistingContainer) {
          setTimeout(() => {
            if (isolatedContainer) {
              window.dispatchEvent(new Event('resize'));
            }
          }, 100);
        }
      }

      // ApexCharts requires special handling - it needs to reinitialize after DOM mount
      // This handles the case where the card was created but needs to render properly on dashboard
      const cardElementName = module.card_type.startsWith('custom:')
        ? module.card_type.substring(7)
        : module.card_type;

      if (cardElementName.includes('apexcharts')) {
        // Get the actual card element from the container
        const cardEl = isolatedContainer.querySelector(cardElementName) as any;
        if (cardEl) {
          // Schedule multiple re-render attempts for ApexCharts
          setTimeout(() => {
            if (cardEl.isConnected && hass) {
              cardEl.hass = hass;
              if (typeof cardEl.requestUpdate === 'function') {
                cardEl.requestUpdate();
              }
              window.dispatchEvent(new Event('resize'));
            }
          }, 100);

          setTimeout(() => {
            if (cardEl.isConnected && hass) {
              cardEl.hass = hass;
              if (typeof cardEl.requestUpdate === 'function') {
                cardEl.requestUpdate();
              }
              // ApexCharts may need resize to properly calculate chart dimensions
              window.dispatchEvent(new Event('resize'));
            }
          }, 300);

          // Final attempt with longer delay for slow-loading charts
          setTimeout(() => {
            if (cardEl.isConnected && hass) {
              cardEl.hass = hass;
              if (typeof cardEl.requestUpdate === 'function') {
                cardEl.requestUpdate();
              }
              window.dispatchEvent(new Event('resize'));
            }
          }, 600);
        }
      }

      // WebRTC camera cards require special handling - stream needs to initialize after DOM mount
      // This handles dashboard first load where card is created and immediately needs to start streaming
      if (cardElementName.includes('webrtc-camera') || cardElementName.includes('webrtc')) {
        // Get the actual card element - it's the first child of the isolated container
        const cardEl = isolatedContainer.firstElementChild as any;
        if (cardEl) {
          
          // Schedule multiple initialization attempts for WebRTC stream establishment
          setTimeout(() => {
            if (cardEl.isConnected && hass) {
              cardEl.hass = hass;
              
              // Wait a moment for hass to be processed
              setTimeout(() => {
                if (typeof cardEl.setConfig === 'function') {
                  try {
                    const config = {
                      type: 'custom:webrtc-camera',
                      ...(module.card_config || {})
                    };
                    cardEl.setConfig(config);
                  } catch (e) {}
                }
                
                if (typeof cardEl.play === 'function') {
                  try {
                    cardEl.play();
                  } catch (e) {}
                }
              }, 50);
              
              if (typeof cardEl.requestUpdate === 'function') {
                cardEl.requestUpdate();
              }
              
              if (typeof cardEl.refresh === 'function') {
                cardEl.refresh();
              }
              
              window.dispatchEvent(new Event('resize'));
            }
          }, 200);

          setTimeout(() => {
            if (cardEl.isConnected && hass) {
              cardEl.hass = hass;
              
              if (typeof cardEl.play === 'function') {
                try {
                  cardEl.play();
                } catch (e) {}
              }
              
              if (typeof cardEl.requestUpdate === 'function') {
                cardEl.requestUpdate();
              }
              if (typeof cardEl.refresh === 'function') {
                cardEl.refresh();
              }
              window.dispatchEvent(new Event('resize'));
            }
          }, 500);

          // Third attempt for slow WebRTC connections
          setTimeout(() => {
            if (cardEl.isConnected && hass) {
              cardEl.hass = hass;
              
              if (typeof cardEl.play === 'function') {
                try {
                  cardEl.play();
                } catch (e) {}
              }
              
              if (typeof cardEl.requestUpdate === 'function') {
                cardEl.requestUpdate();
              }
              if (typeof cardEl.refresh === 'function') {
                cardEl.refresh();
              }
              window.dispatchEvent(new Event('resize'));
            }
          }, 1000);

          // Fourth attempt - even longer delay
          setTimeout(() => {
            if (cardEl.isConnected && hass) {
              cardEl.hass = hass;
              
              if (typeof cardEl.play === 'function') {
                try {
                  cardEl.play();
                } catch (e) {}
              }
              
              if (typeof cardEl.requestUpdate === 'function') {
                cardEl.requestUpdate();
              }
              
              window.dispatchEvent(new Event('resize'));
            }
          }, 2000);
        }
      }

      (containerDiv as any)._ucInitialized = containerId; // Mark as initialized
    };

    // Check if module should be locked (6th+ card for non-Pro users)
    // Skip lock check in editor contexts (Live Preview and HA Preview)
    const shouldLock = !previewContext && this._shouldLockModule(module, hass, config);

    if (shouldLock) {
      // Read current totals for display
      const evalResult = ThirdPartyLimitService.evaluate(hass);
      const total3p = evalResult.totalThirdParty ?? 0;
      // Render with Pro lock overlay
      return html`${guard(
        [module.id, module.card_type],
        () => html`
          <div
            class="external-card-module-container"
            style=${this.styleObjectToCss(containerStyles)}
          >
            <div
              class="pro-module-locked"
              style="position: relative; min-height: 200px; display: flex; align-items: center; justify-content: center;"
            >
              ${cache(html`
                <div
                  ${ref(mountContainer)}
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
              `)}
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
                  <div
                    style="font-size: 10px; opacity: 0.9; line-height: 1.2; white-space: nowrap;"
                  >
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
        `
      )}`;
    }

    // Return the wrapper container with mount callback (unlocked card)
    // Wrap the card content container inside the design container
    // Use guard() to only re-render when module ID or card type changes
    // This prevents the 60+ re-renders triggered by the editor from destroying the container
    return html`${guard(
      [module.id, module.card_type],
      () => html`
        <div class="external-card-module-container" style=${this.styleObjectToCss(containerStyles)}>
          ${cache(html`
            <div
              ${ref(mountContainer)}
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
              <!-- Isolated container will be mounted here -->
            </div>
          `)}
        </div>
      `
    )}`;
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
        overflow-anchor: none; /* Prevent scroll anchoring on mobile when cards update */
      }

      /* Container works in both flex and grid layouts */
      .external-card-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        flex: 1 1 auto; /* For flex parent contexts (horizontal layouts) */
        min-width: 0; /* Allow flex shrinking below content size */
        min-height: 0; /* Allow flex shrinking below content size */
        overflow-anchor: none; /* Prevent scroll anchoring on mobile when cards update */
        isolation: isolate; /* Create new stacking context to prevent flicker */
        contain: layout; /* Contain layout changes within this element */
      }

      /* Child cards fill the container */
      .external-card-container > * {
        width: 100%;
        min-width: 0; /* Allow shrinking */
        flex: 1 1 auto; /* Let cards participate in flex */
        will-change: transform; /* Optimize repaints during updates */
        backface-visibility: hidden; /* Prevent flicker during redraws */
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

      /* General tab wrapper - must allow overflow for dropdown menus */
      .external-card-general-tab {
        width: 100%;
        overflow: visible;
        position: relative;
      }
      
      .external-card-general-tab .settings-section {
        overflow: visible;
        position: relative;
      }
      
      /* Native editor container */
      .native-editor-container {
        min-height: 200px;
        overflow: visible; /* Allow dropdown menus to render outside container */
        position: relative;
      }
      
      /* Ensure 3rd party card editor dropdowns render above other content */
      .native-editor-container ha-select,
      .native-editor-container mwc-select,
      .native-editor-container ha-combo-box {
        position: relative;
        z-index: 100;
      }
      
      /* Allow dropdown menus from embedded editors to render properly */
      .native-editor-container ha-select::part(menu),
      .native-editor-container mwc-select::part(menu),
      .native-editor-container .mdc-menu-surface,
      .native-editor-container mwc-menu-surface,
      .native-editor-container mwc-menu {
        z-index: 9999 !important;
        position: fixed !important;
      }

      /* YAML tab styling */
      .external-card-yaml-tab {
        width: 100%;
        height: 100%;
        display: block;
        overflow: visible;
      }

      .external-card-yaml-tab .settings-section {
        width: 100%;
        height: 100%;
        display: block;
      }

      .yaml-editor-container {
        width: 100%;
        display: block;
        position: relative;
        z-index: 1;
      }

      .yaml-textarea {
        position: relative;
        z-index: 10;
        pointer-events: auto;
        cursor: text !important;
        user-select: text !important;
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
      }

      .yaml-textarea:focus {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }

      .yaml-editor-fallback {
        width: 100%;
        display: block;
        position: relative;
        z-index: 1;
      }
    `;
  }
}
