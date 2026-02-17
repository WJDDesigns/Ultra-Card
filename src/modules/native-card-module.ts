import { html, TemplateResult, css, CSSResult } from 'lit';
import { ref } from 'lit/directives/ref.js';
import { HomeAssistant } from 'custom-card-helpers';
import { NativeCardModule, UltraCardConfig } from '../types';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { ucNativeCardsService } from '../services/uc-native-cards-service';
import { Z_INDEX } from '../utils/uc-z-index';
import yaml from 'js-yaml';

// Editor element cache to prevent unnecessary recreation
const editorElementCache = new Map<string, HTMLElement>();

// Guard to prevent re-entrancy in config-changed handler (prevents freeze loops)
const nativeConfigChangeGuard = new Map<string, boolean>();

// Track last config sent to prevent duplicate updates
const nativeLastSentConfig = new Map<string, string>();

// Card element cache for preview/live rendering
const cardElementCache = new Map<string, HTMLElement>();

// Track last config applied to preview cards to force updates
const cardLastConfig = new Map<string, any>();

// Track if card was disconnected (so we can force update on reconnect)
const cardWasDisconnected = new Map<string, boolean>();

// Helper function to update all context-specific card instances when config changes
function updateAllCardInstances(
  moduleId: string,
  cardType: string,
  cardConfig: any,
  hass: HomeAssistant
): void {
  const contexts: Array<'live' | 'ha-preview' | 'dashboard'> = ['live', 'ha-preview', 'dashboard'];
  
  // Prepare normalized config once
  const normalizedConfig = { ...cardConfig };
  if (!normalizedConfig.type) {
    normalizedConfig.type = ucNativeCardsService.elementNameToConfigType(cardType);
  }
  
  contexts.forEach(context => {
    const cacheKey = `${moduleId}-preview-${context}`;
    let cardElement = cardElementCache.get(cacheKey);
    
    // Fallback: Check legacy cache key for dashboard context (backwards compatibility)
    if (!cardElement && context === 'dashboard') {
      const legacyKey = `${moduleId}-preview`;
      cardElement = cardElementCache.get(legacyKey);
      if (cardElement) {
        // Migrate to context-specific cache
        cardElementCache.set(cacheKey, cardElement);
        cardElementCache.delete(legacyKey);
      }
    }
    
    // Update card element if it exists
    if (cardElement) {
      try {
        // Update hass
        (cardElement as any).hass = hass;
        
        // Always update config (both connected and disconnected cards)
        // For disconnected cards, set config property directly to ensure it persists
        // Some cards don't accept setConfig when disconnected, but config property always works
        if (cardElement.isConnected) {
          // Connected card - use setConfig if available
          if (typeof (cardElement as any).setConfig === 'function') {
            try {
              (cardElement as any).setConfig(normalizedConfig);
            } catch (e) {
              // Fallback to config property if setConfig fails
              (cardElement as any).config = normalizedConfig;
            }
          } else {
            (cardElement as any).config = normalizedConfig;
          }
        } else {
          // Disconnected card - always set config property directly
          // This ensures config persists when card reconnects
          (cardElement as any).config = normalizedConfig;
          // Also try setConfig in case card accepts it while disconnected
          if (typeof (cardElement as any).setConfig === 'function') {
            try {
              (cardElement as any).setConfig(normalizedConfig);
            } catch (e) {
              // Ignore - config property is already set
            }
          }
        }
        
        // Update cached config for both connected and disconnected cards
        // This ensures FAST PATH knows the card is already up-to-date and won't revert it
        cardLastConfig.set(cacheKey, normalizedConfig);
        
        if (cardElement.isConnected) {
          cardWasDisconnected.delete(cacheKey); // Clear flag if connected
        } else {
          // Mark as disconnected - FAST PATH will check this flag
          // But since we've updated cardLastConfig, FAST PATH will see config matches and won't revert
          cardWasDisconnected.set(cacheKey, true);
        }
      } catch (error) {
        // If update fails, clear cached config so FAST PATH will update on reconnect
        cardLastConfig.delete(cacheKey);
        cardWasDisconnected.set(cacheKey, true); // Mark as needing update
        console.warn(`[UC Native Card] Failed to update card instance for ${context}:`, error);
      }
    } else {
      // Card doesn't exist in cache - for dashboard, search DOM and update directly
      // Dashboard is a separate Ultra Card instance, so we need to find and update the card element
      if (context === 'dashboard') {
        try {
          console.log(`[UC Native Card] Searching DOM for dashboard card: ${cardType}`);
          
          // Search for all Ultra Card instances in the DOM
          const allUltraCards = document.querySelectorAll('ultra-card');
          
          for (const ultraCard of Array.from(allUltraCards)) {
            // Find all card elements of this type within this Ultra Card instance
            const cardElements = ultraCard.querySelectorAll(cardType);
            
            // Try to find the card that belongs to this module
            for (const cardEl of Array.from(cardElements)) {
              try {
                // Update this card element directly
                (cardEl as any).hass = hass;
                
                // Try to update config
                if (typeof (cardEl as any).setConfig === 'function') {
                  try {
                    (cardEl as any).setConfig(normalizedConfig);
                    console.log(`[UC Native Card] Updated dashboard card via setConfig:`, cardType);
                  } catch (e) {
                    (cardEl as any).config = normalizedConfig;
                    console.log(`[UC Native Card] Updated dashboard card via config property:`, cardType);
                  }
                } else {
                  (cardEl as any).config = normalizedConfig;
                  console.log(`[UC Native Card] Updated dashboard card via config property:`, cardType);
                }
                
                // Cache this element for future updates
                cardElementCache.set(cacheKey, cardEl as HTMLElement);
                cardLastConfig.set(cacheKey, normalizedConfig);
                
                // Successfully updated - break out
                break;
              } catch (updateError) {
                console.warn('[UC Native Card] Failed to update card in DOM:', updateError);
              }
            }
            
            // If we found and cached a card, break out of Ultra Card loop
            if (cardElementCache.has(cacheKey)) {
              break;
            }
          }
          
          // If still not found, log warning
          if (!cardElementCache.has(cacheKey)) {
            console.warn(`[UC Native Card] Could not find dashboard card in DOM: ${cardType}`);
          }
        } catch (domError) {
          console.warn('[UC Native Card] DOM search failed:', domError);
        }
      }
      
      // Clear any stale cached config so new card gets latest config
      if (!cardElementCache.has(cacheKey)) {
        cardLastConfig.delete(cacheKey);
        cardWasDisconnected.delete(cacheKey);
      }
    }
  });
}

export class UltraNativeCardModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'native_card',
    title: 'Native HA Card',
    description: 'Native Home Assistant card',
    author: 'Home Assistant',
    version: '1.0.0',
    icon: 'mdi:home-assistant',
    category: 'content',
    tags: ['native', 'home-assistant', 'card'],
  };

  createDefault(): NativeCardModule {
    return {
      id: `native-card-${Date.now()}`,
      type: 'native_card',
      name: 'Native Card',
      card_type: 'hui-entities-card',
      card_config: {
        type: 'entities',
        entities: [],
      },
      display_conditions: [],
    };
  }

  /**
   * Attach event listeners to container to prevent keyboard/input events from bubbling
   * Uses a data attribute marker to prevent duplicate listeners
   */
  private _attachContainerEventListeners(container: Element): void {
    // Only attach if not already attached (prevents duplicate listeners)
    if (container.hasAttribute('data-uc-events-attached')) {
      return;
    }
    container.setAttribute('data-uc-events-attached', 'true');

    // CRITICAL: Stop events from bubbling UP to prevent interference with Ultra Card handlers
    // Use bubble phase (false) so events reach the target element first, then stop propagation
    const stopEventBubbling = (e: Event) => {
      e.stopPropagation();
    };

    // Bubble phase for all events - let the editor elements handle them first
    container.addEventListener('keydown', stopEventBubbling, false);
    container.addEventListener('keyup', stopEventBubbling, false);
    container.addEventListener('keypress', stopEventBubbling, false);
    container.addEventListener('input', stopEventBubbling, false);
    container.addEventListener('change', stopEventBubbling, false);
    container.addEventListener('focus', stopEventBubbling, false);
    container.addEventListener('blur', stopEventBubbling, false);
    container.addEventListener('click', stopEventBubbling, false);
    container.addEventListener('mousedown', stopEventBubbling, false);
    container.addEventListener('mouseup', stopEventBubbling, false);
    container.addEventListener('pointerdown', stopEventBubbling, false);
    container.addEventListener('pointerup', stopEventBubbling, false);
  }

  renderGeneralTab(
    module: NativeCardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<NativeCardModule>) => void
  ): TemplateResult | null {
    const cardInfo = ucNativeCardsService.getNativeCardInfo(module.card_type);
    const cardName = cardInfo?.name || module.name || 'Native Card';

    // Function to update editor properties (called on every render if needed)
    const setupEditorProperties = (editor: any, container: Element) => {
      try {
        const editorIsMounted = container.contains(editor);
        const isDirectEditor = (editor as any)._ucIsDirectEditor;

        // Provide necessary context - hui-card-element-editor needs lovelace
        if ((hass as any).lovelace) {
          (editor as any).lovelace = (hass as any).lovelace;
        }

        // Prepare config - MUST include type for hui-card-element-editor
        const editorConfig = { ...(module.card_config || {}) };
        if (!editorConfig.type) {
          editorConfig.type = ucNativeCardsService.elementNameToConfigType(module.card_type);
        }

        // Check if config actually changed
        const currentEditorConfig = isDirectEditor 
          ? ((editor as any).config || (editor as any)._config || {})
          : ((editor as any).value || {});
        const configChanged = JSON.stringify(currentEditorConfig) !== JSON.stringify(editorConfig);

        // Skip if guard is active (we're in the middle of handling a config change)
        const guardActive = nativeConfigChangeGuard.get(module.id);

        // Always set hass first (needed for entity dropdowns etc.)
        (editor as any).hass = hass;

        // Only update config if editor was just remounted OR if config changed
        // But NOT if the guard is active (prevents loop)
        if (!guardActive && (!editorIsMounted || configChanged)) {
          // Set guard temporarily while we update config
          nativeConfigChangeGuard.set(module.id, true);

          try {
            if (isDirectEditor) {
              // Direct editor - use setConfig method
              // Add minimal defaults for required fields
              const configWithDefaults = { ...editorConfig };
              if (!configWithDefaults.entities && (editorConfig.type === 'entities' || editorConfig.type === 'calendar')) {
                configWithDefaults.entities = [];
              }
              
              if (typeof (editor as any).setConfig === 'function') {
                try {
                  (editor as any).setConfig(configWithDefaults);
                } catch (e) {
                  // Expected for unconfigured cards (missing required fields)
                  console.log('[UC Native Card] setConfig error (expected):', (e as Error).message);
                }
              }
            } else {
              // hui-card-element-editor wrapper uses 'value' property
              // Add defaults for cards that require certain fields  
              const wrapperConfig = { ...editorConfig };
              if (!wrapperConfig.entities && (editorConfig.type === 'entities' || editorConfig.type === 'calendar')) {
                wrapperConfig.entities = [];
              }
              (editor as any).value = wrapperConfig;
            }
          } finally {
            // Clear guard after a short delay
            setTimeout(() => nativeConfigChangeGuard.set(module.id, false), 100);
          }
        }
      } catch (error) {
        console.error('[UC Native Card] Failed to update editor properties:', error);
      }
    };

    // Ref callback to set up the native editor (only creates/mounts editor)
    const setupEditor = (container: Element | undefined) => {
      if (!container || !module.card_type) return;

      const cacheKey = `${module.id}-editor`;

      // Check for cached editor
      let editor = editorElementCache.get(cacheKey);

      // Check if editor needs to be created
      const needsNewEditor = !editor;

      // Check if editor exists but is not mounted (was detached by tab switch)
      const editorNotMounted = editor && !container.contains(editor);

      if (needsNewEditor) {
        // Use async IIFE to handle async editor loading
        (async () => {
          try {
            // Get the config type (e.g., "calendar" from "hui-calendar-card")
            const configType = ucNativeCardsService.elementNameToConfigType(module.card_type);
            const editorElementName = `${module.card_type}-editor`;
            console.log('[UC Native Card] Creating editor for:', module.card_type, 'config type:', configType, 'editor element:', editorElementName);
            
            // Track whether we got a direct editor (vs hui-card-element-editor wrapper)
            let isDirectEditor = false;
            let editorElement: HTMLElement | null = null;
            
            try {
              // Check if the specific card editor is already defined
              const editorClass = customElements.get(editorElementName);
              if (editorClass) {
                console.log('[UC Native Card] Editor class found, creating directly:', editorElementName);
                editorElement = document.createElement(editorElementName);
                isDirectEditor = true;
              } else {
                // Try to get the editor from the card class's getConfigElement
                const cardClass = customElements.get(module.card_type) as any;
                if (cardClass && typeof cardClass.getConfigElement === 'function') {
                  console.log('[UC Native Card] Getting config element from card class');
                  const result = await Promise.resolve(cardClass.getConfigElement());
                  if (result && !(result instanceof HTMLUnknownElement)) {
                    editorElement = result;
                    isDirectEditor = true;
                    console.log('[UC Native Card] Got direct editor from getConfigElement:', editorElement.tagName);
                  } else {
                    console.log('[UC Native Card] getConfigElement returned invalid result:', result);
                  }
                }
              }
            } catch (e) {
              console.log('[UC Native Card] Could not get direct editor, falling back to wrapper:', e);
            }
            
            // If we couldn't get the direct editor, use hui-card-element-editor wrapper
            if (!editorElement || editorElement instanceof HTMLUnknownElement) {
              console.log('[UC Native Card] Using hui-card-element-editor wrapper');
              editorElement = document.createElement('hui-card-element-editor');
              isDirectEditor = false;
            }
            
            editor = editorElement;
            
            // Store whether this is a direct editor for later use
            (editor as any)._ucIsDirectEditor = isDirectEditor;

            // Check if editor element is valid
            if (!editor || editor instanceof HTMLUnknownElement) {
              console.warn('[UC Native Card] No valid editor available');
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
          let configUpdateTimer: number | undefined;
          let pendingConfig: any = null; // Track pending config for debounced updates
          
          editor.addEventListener('config-changed', (e: CustomEvent) => {
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            if (e.detail && e.detail.config) {
              const normalizedConfig = { ...e.detail.config };
              if (!normalizedConfig.type && module.card_type) {
                normalizedConfig.type = ucNativeCardsService.elementNameToConfigType(module.card_type);
              }

              // Check against last sent config to prevent duplicate updates
              const configKey = JSON.stringify(normalizedConfig);
              if (nativeLastSentConfig.get(module.id) === configKey) {
                return;
              }

              // Check if config actually changed
              const currentConfigKey = JSON.stringify(module.card_config || {});
              if (configKey === currentConfigKey) {
                return; // Ignore spurious config-changed events
              }

              // Track this config to prevent duplicates
              nativeLastSentConfig.set(module.id, configKey);
              
              // Store latest config for the debounced update
              pendingConfig = { ...normalizedConfig };

              // Clear any existing debounce timer
              if (configUpdateTimer) {
                clearTimeout(configUpdateTimer);
              }

              // Set guard to prevent setupEditorProperties from resetting editor during typing
              nativeConfigChangeGuard.set(module.id, true);

              // Longer debounce (600ms) to allow smooth typing without interruption
              configUpdateTimer = window.setTimeout(() => {
                // Use the latest pending config (captures all keystrokes during debounce)
                if (pendingConfig) {
                  // Update card preview instances immediately (without re-rendering editor)
                  updateAllCardInstances(module.id, module.card_type, pendingConfig, hass);
                  
                  // Update module config (triggers re-render, but guard protects editor)
                  updateModule({ card_config: pendingConfig });
                  pendingConfig = null;
                }
                
                configUpdateTimer = undefined;
                
                // Clear guard after re-render completes
                setTimeout(() => {
                  nativeConfigChangeGuard.set(module.id, false);
                }, 200);
              }, 600);
            }
          });

          // Cache the editor and mount it
          editorElementCache.set(cacheKey, editor);
          container.innerHTML = '';
          container.appendChild(editor);

          // Attach event listeners (with deduplication marker)
          this._attachContainerEventListeners(container);

          // CRITICAL: Initialize the editor with config
          // Direct editors (from getConfigElement) use setConfig
          // hui-card-element-editor wrapper uses the value property
          const initializeEditor = async () => {
            // Wait for next frame to ensure DOM is ready
            await new Promise(resolve => requestAnimationFrame(resolve));
            
            const isDirectEditor = (editor as any)._ucIsDirectEditor;
            
            // Set hass and lovelace first - these are needed for editor initialization
            if (hass) {
              (editor as any).hass = hass;
            }
            if ((hass as any).lovelace) {
              (editor as any).lovelace = (hass as any).lovelace;
            }
            
            // Small delay to let the element initialize
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Prepare config with type
            const editorConfig = { ...(module.card_config || {}) };
            if (!editorConfig.type) {
              editorConfig.type = ucNativeCardsService.elementNameToConfigType(module.card_type);
            }
            
            console.log('[UC Native Card] Setting initial editor config (direct:', isDirectEditor, '):', editorConfig);
            
            if (isDirectEditor) {
              // Direct editor - use setConfig method
              // For cards that require certain fields (like entities), provide minimal defaults
              // so the editor can render its UI even when unconfigured
              const configWithDefaults = { ...editorConfig };
              
              // Add minimal defaults for common required fields
              if (!configWithDefaults.entities && (editorConfig.type === 'entities' || editorConfig.type === 'calendar')) {
                configWithDefaults.entities = [];
              }
              if (!configWithDefaults.entity && editorConfig.type === 'entity') {
                // Don't set a default entity - the editor should handle undefined
              }
              
              try {
                if (typeof (editor as any).setConfig === 'function') {
                  (editor as any).setConfig(configWithDefaults);
                  console.log('[UC Native Card] Direct editor setConfig succeeded with config:', configWithDefaults);
                } else {
                  console.warn('[UC Native Card] Direct editor has no setConfig method');
                }
              } catch (e) {
                // Many cards throw when required fields are missing - this is expected
                // Try again with the original config (some editors handle empty better)
                console.log('[UC Native Card] Direct editor setConfig error:', (e as Error).message);
                try {
                  (editor as any).setConfig(editorConfig);
                } catch (e2) {
                  console.log('[UC Native Card] Fallback setConfig also failed (expected for unconfigured cards)');
                }
              }
            } else {
              // hui-card-element-editor wrapper - use value property
              // Add defaults for cards that require certain fields
              const wrapperConfig = { ...editorConfig };
              if (!wrapperConfig.entities && (editorConfig.type === 'entities' || editorConfig.type === 'calendar')) {
                wrapperConfig.entities = [];
              }
              
              (editor as any).value = wrapperConfig;
              console.log('[UC Native Card] Set wrapper value:', wrapperConfig);
              
              // For wrapper, check if the editor loaded properly after a delay
              setTimeout(() => {
                // If the editor still shows YAML mode, try setting value again
                const hasVisualEditor = editor.querySelector(':not(ha-code-editor)');
                if (!hasVisualEditor) {
                  console.log('[UC Native Card] Editor may be in YAML mode, retrying...');
                  (editor as any).value = { ...wrapperConfig };
                }
              }, 200);
            }
          };
          
          initializeEditor();

          // Get stub config if needed (async, but don't block)
          const currentConfig = module.card_config || {};
          if (Object.keys(currentConfig).length <= 1) {
            try {
              const cardConstructor = customElements.get(module.card_type) as any;
              if (cardConstructor && typeof cardConstructor.getStubConfig === 'function') {
                Promise.resolve(cardConstructor.getStubConfig(hass)).then((stubConfig) => {
                  if (stubConfig && typeof stubConfig === 'object') {
                    console.log('[UC Native Card] Got stub config from card:', stubConfig);
                    // Save stub config and let setupEditorProperties apply it
                    updateModule({ card_config: stubConfig });
                  }
                }).catch((e) => {
                  console.log('[UC Native Card] Failed to get stub config:', e);
                });
              }
            } catch (e) {
              console.log('[UC Native Card] Error getting stub config:', e);
            }
          }
          
          // Return early - setupEditorProperties will be called after timeout
          return;

        } catch (error) {
          console.error('[UC Native Card] Failed to create editor:', error);
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
        })(); // End of async IIFE
        return; // Return from setupEditor - async IIFE handles the rest
      } else if (editorNotMounted) {
        // Editor exists in cache but was detached from DOM (tab switch) - re-mount it
        container.innerHTML = '';
        container.appendChild(editor);
        
        // Attach event listeners (with deduplication marker)
        this._attachContainerEventListeners(container);
      }

      // CRITICAL: Skip ALL property updates when user is typing (guard is active)
      // This prevents editor.hass updates from causing the editor to re-render
      // and reset input values during typing
      if (nativeConfigChangeGuard.get(module.id)) {
        return;
      }

      // Update properties on cached editor (for cached/remounted editors)
      setupEditorProperties(editor, container);
    };

    return html`
      <div class="native-card-general-tab">
        <div class="settings-section">
          <div
            class="section-title"
            style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: var(--primary-color); text-transform: uppercase;"
          >
            ${cardName.toUpperCase()} SETTINGS
          </div>
          <div
            class="section-description"
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;"
          >
            Configure this native Home Assistant card using its built-in editor.
          </div>
          <div class="native-editor-container" ${ref(setupEditor)}></div>
        </div>
      </div>
    `;
  }

  renderPreview(
    module: NativeCardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    // Use context-specific cache key so each context (dashboard, HA preview, builder) has its own card instance
    const context = previewContext || 'dashboard';
    const cacheKey = `${module.id}-preview-${context}`;

    // Ref callback to render the actual native card
    const setupCard = (container: Element | undefined) => {
      if (!container || !module.card_type) return;

      let cardElement = cardElementCache.get(cacheKey);

      // Validate cached card element is still valid (hasn't been garbage collected or corrupted)
      if (cardElement && (!cardElement.tagName || cardElement.tagName.toLowerCase() !== module.card_type.toLowerCase())) {
        // Card element is invalid - clear cache and recreate
        console.warn('[UC Native Card] Cached card element is invalid, recreating');
        cardElementCache.delete(cacheKey);
        cardLastConfig.delete(cacheKey);
        cardElement = undefined;
      }

      // Check if card element exists and is still in DOM
      const cardInDOM = cardElement && cardElement.isConnected;
      const cardInThisContainer = cardElement && container.contains(cardElement);

      // FAST PATH: Card is already mounted in this container - just update properties
      if (cardInThisContainer) {
        try {
          // Always update hass for live entity data
          (cardElement as any).hass = hass;

          // Prepare config with correct type (always use current module config as source of truth)
          const cardConfig = { ...(module.card_config || {}) };
          if (!cardConfig.type) {
            cardConfig.type = ucNativeCardsService.elementNameToConfigType(module.card_type);
          }

          // Always sync card with module.card_config (source of truth)
          // Check both cached config and card's internal config to detect any drift
          const lastConfig = cardLastConfig.get(cacheKey);
          const wasDisconnected = cardWasDisconnected.get(cacheKey);
          const cardInternalConfig = (cardElement as any).config || {};
          
          // Always update cache to match module.card_config (source of truth)
          // This ensures cache reflects the current state, even if updateAllCardInstances just updated it
          cardLastConfig.set(cacheKey, cardConfig);
          
          // Compare module config with cached config and card's internal config
          // Only update card if there's actual drift (card doesn't match module config)
          // If cache already matches module config, card should be up-to-date (updated by updateAllCardInstances)
          const cacheMatches = lastConfig && JSON.stringify(lastConfig) === JSON.stringify(cardConfig);
          const internalDrift = JSON.stringify(cardInternalConfig) !== JSON.stringify(cardConfig);
          
          // Only update card if there's internal drift AND cache doesn't already match
          // This prevents reverting updates from updateAllCardInstances
          const needsUpdate = internalDrift && !cacheMatches;
          
          if (needsUpdate || wasDisconnected) {
            cardWasDisconnected.delete(cacheKey); // Clear flag
            
            try {
              // Update card config - use setConfig if available, otherwise set config property
              if (typeof (cardElement as any).setConfig === 'function') {
                (cardElement as any).setConfig(cardConfig);
              } else {
                (cardElement as any).config = cardConfig;
              }
            } catch (configError) {
              console.warn('[UC Native Card] setConfig failed (non-critical):', configError);
            }
          } else {
            // Card is already up-to-date - just clear disconnected flag
            cardWasDisconnected.delete(cacheKey);
          }
        } catch (error) {
          console.error('[UC Native Card] Failed to update card:', error);
        }
        return; // Exit early - no DOM manipulation needed
      }

      // REMOUNT PATH: Card exists but needs to be mounted (orphaned or in wrong container)
      if (cardElement) {
        try {
          // Remove from old parent if it exists (handles both orphaned and wrong container cases)
          if (cardElement.parentElement && cardElement.parentElement !== container) {
            cardElement.parentElement.removeChild(cardElement);
          }
          
          // Clear container only if card is not already in it
          if (!container.contains(cardElement)) {
            // Remove any existing children from container
            while (container.firstChild) {
              container.removeChild(container.firstChild);
            }
            
            // Mount the card
            container.appendChild(cardElement);
          }
          
          // Always update properties after remount (ensures card is properly initialized)
          (cardElement as any).hass = hass;
          const cardConfig = { ...(module.card_config || {}) };
          if (!cardConfig.type) {
            cardConfig.type = ucNativeCardsService.elementNameToConfigType(module.card_type);
          }
          
          // Always set config on remount to ensure card is properly initialized
          // (even if config hasn't changed, card might need re-initialization after being orphaned)
          try {
            if (typeof (cardElement as any).setConfig === 'function') {
              (cardElement as any).setConfig(cardConfig);
            } else {
              (cardElement as any).config = cardConfig;
            }
            cardLastConfig.set(cacheKey, cardConfig);
            cardWasDisconnected.delete(cacheKey); // Clear disconnected flag on remount
          } catch (configError) {
            console.warn('[UC Native Card] setConfig failed on remount:', configError);
          }
          
          return; // Exit after remount
        } catch (error) {
          console.error('[UC Native Card] Failed to remount card:', error);
          // Fall through to create new card if remount fails
        }
      }

      // CREATE PATH: Need to create new card element
      if (!cardElement) {
        try {
          // Create the native card element directly
          cardElement = document.createElement(module.card_type);

          if (cardElement instanceof HTMLUnknownElement) {
            container.innerHTML = `
              <div style="padding: 16px; text-align: center; color: var(--error-color);">
                <ha-icon icon="mdi:alert-circle"></ha-icon>
                <p>Card not found: ${module.card_type}</p>
              </div>
            `;
            return;
          }

          cardElementCache.set(cacheKey, cardElement);
        } catch (error) {
          console.error('[UC Native Card] Failed to create card:', error);
          container.innerHTML = `
            <div style="padding: 16px; text-align: center; color: var(--error-color);">
              <ha-icon icon="mdi:alert-circle"></ha-icon>
              <p>Failed to load card</p>
            </div>
          `;
          return;
        }
      }

      // Mount the card element (it's new, so always mount)
      // Clear container and mount
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(cardElement);

      // Initialize card properties
      try {
        // Set hass BEFORE config (some cards need hass during setConfig)
        (cardElement as any).hass = hass;

        // Prepare config with correct type
        const cardConfig = { ...(module.card_config || {}) };
        if (!cardConfig.type) {
          cardConfig.type = ucNativeCardsService.elementNameToConfigType(module.card_type);
        }

        // Always set config on new card creation
        try {
          if (typeof (cardElement as any).setConfig === 'function') {
            (cardElement as any).setConfig(cardConfig);
          } else {
            (cardElement as any).config = cardConfig;
          }
          cardLastConfig.set(cacheKey, cardConfig);
          cardWasDisconnected.delete(cacheKey); // Clear disconnected flag on creation
        } catch (configError) {
          console.error('[UC Native Card] Error setting card config:', configError);
          container.innerHTML = `
            <div style="padding: 16px; text-align: center; color: var(--error-color);">
              <ha-icon icon="mdi:alert-circle"></ha-icon>
              <p>Card configuration error</p>
              <small>${configError?.message || 'Unknown error'}</small>
            </div>
          `;
          return;
        }
      } catch (error) {
        console.error('[UC Native Card] Failed to initialize card:', error);
      }
    };

    return html`
      <div class="native-card-preview" ${ref(setupCard)}></div>
    `;
  }

  renderYamlTab(
    module: NativeCardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<NativeCardModule>) => void
  ): TemplateResult {
    const handleYamlChange = (e: CustomEvent) => {
      e.stopPropagation();
      try {
        const newConfig = yaml.load(e.detail.value) as any;
        updateModule({ card_config: newConfig });
      } catch (error) {
        console.error('[UC Native Card] Invalid YAML:', error);
      }
    };

    const yamlValue = yaml.dump(module.card_config || {});

    return html`
      <div class="native-card-yaml-tab">
        <div class="settings-section">
          <div
            class="section-title"
            style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: var(--primary-color);"
          >
            CARD CONFIGURATION (YAML)
          </div>
          <div
            class="section-description"
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;"
          >
            Edit the card's configuration directly in YAML format. Changes are applied automatically.
          </div>
          <ultra-template-editor
            .value=${yamlValue}
            .hass=${hass}
            .label=${'Card Configuration'}
            .mode=${'yaml'}
            @value-changed=${handleYamlChange}
          ></ultra-template-editor>
        </div>
      </div>
    `;
  }

  static get styles(): CSSResult {
    return css`
      /* Stacking context above UC navbar so built-in HA popups (date picker, etc.) show on top */
      .native-card-preview {
        width: 100%;
        min-height: 100px;
        display: block;
        position: relative;
        z-index: ${Z_INDEX.NATIVE_CARD_ABOVE_NAV};
      }
      
      .native-card-preview > * {
        display: block;
        width: 100%;
      }

      .native-card-general-tab,
      .native-card-yaml-tab {
        width: 100%;
        padding: 16px;
        overflow: visible;
        position: relative;
      }

      .native-card-general-tab .settings-section {
        overflow: visible;
        position: relative;
      }

      .native-editor-container {
        min-height: 200px;
        width: 100%;
        overflow: visible;
        position: relative;
      }
      
      /* Ensure native card editor dropdowns render above other content */
      .native-editor-container ha-select,
      .native-editor-container mwc-select,
      .native-editor-container ha-combo-box,
      .native-editor-container ha-entity-picker {
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

      .settings-section {
        margin-bottom: 24px;
      }
    `;
  }
}

// Export function to clean up cache when module is deleted
export function cleanupNativeCardCache(moduleId: string): void {
  const editorKey = `${moduleId}-editor`;
  
  editorElementCache.delete(editorKey);
  
  // Clean up config change guards
  nativeConfigChangeGuard.delete(moduleId);
  nativeLastSentConfig.delete(moduleId);
  
  // Clean up all context-specific preview cache entries
  const contexts: Array<'live' | 'ha-preview' | 'dashboard'> = ['live', 'ha-preview', 'dashboard'];
  contexts.forEach(context => {
    const previewKey = `${moduleId}-preview-${context}`;
    cardElementCache.delete(previewKey);
    cardLastConfig.delete(previewKey);
    cardWasDisconnected.delete(previewKey);
  });
  
  // Also clean up legacy preview key (for backwards compatibility)
  const legacyPreviewKey = `${moduleId}-preview`;
  cardElementCache.delete(legacyPreviewKey);
  cardLastConfig.delete(legacyPreviewKey);
  cardWasDisconnected.delete(legacyPreviewKey);
}

