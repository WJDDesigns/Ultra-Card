import { html, TemplateResult, css, CSSResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { ExternalCardModule, UltraCardConfig, CardModule } from '../types';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { ucExternalCardsService } from '../services/uc-external-cards-service';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import { ref } from 'lit/directives/ref.js';
import '../components/ultra-template-editor';

// Debounce timers for config updates to prevent rapid re-render loops from spurious events
const updateDebounceTimers = new Map<string, number>();

// Editor element cache to prevent unnecessary recreation and preserve UI state (scroll, focus, dropdowns)
const editorElementCache = new Map<string, any>();

// Global cache for allowed external card IDs (first 5 by timestamp)
// This is refreshed periodically to avoid expensive dashboard scans on every render
let allowedExternalCardIdsCache: Set<string> | null = null;
let allowedExternalCardIdsCacheTime = 0;
const ALLOWED_IDS_CACHE_TTL = 5000; // 5 seconds

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

  // Clear allowed IDs cache so it refreshes
  allowedExternalCardIdsCache = null;
  allowedExternalCardIdsCacheTime = 0;
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

      // Sort by timestamp (oldest first)
      allExternalModules.sort((a, b) => a.timestamp - b.timestamp);

      // Take first 5 IDs
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
    // Check Pro access via integration only
    const integrationUser = ucCloudAuthService.checkIntegrationAuth(hass);
    const isPro =
      integrationUser?.subscription?.tier === 'pro' &&
      integrationUser?.subscription?.status === 'active';

    if (isPro) return false;

    // Check if cache needs refresh (TTL expired or doesn't exist)
    const now = Date.now();
    if (
      !allowedExternalCardIdsCache ||
      now - allowedExternalCardIdsCacheTime > ALLOWED_IDS_CACHE_TTL
    ) {
      // Trigger async refresh in background
      this._refreshAllowedIdsCache(hass);

      // If cache doesn't exist yet, use fallback local check
      if (!allowedExternalCardIdsCache) {
        const allExternalModules = this._getAllExternalModules(config);
        const sorted = [...allExternalModules].sort((a, b) => {
          return this._extractTimestamp(a.id) - this._extractTimestamp(b.id);
        });
        const index = sorted.findIndex(m => m.id === module.id);
        return index >= 5;
      }
    }

    // Use cached allowed IDs
    const isAllowed = allowedExternalCardIdsCache.has(module.id);
    const shouldLock = !isAllowed;

    return shouldLock;
  }

  renderGeneralTab(
    module: ExternalCardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<ExternalCardModule>) => void
  ): TemplateResult {
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
    const yamlString = JSON.stringify(module.card_config || {}, null, 2);

    const handleYamlChange = (e: CustomEvent) => {
      try {
        const newConfig = JSON.parse(e.detail.value);
        updateModule({ card_config: newConfig });
      } catch (error) {
        console.error('Invalid JSON in YAML editor:', error);
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
            CARD CONFIGURATION (YAML/JSON)
          </div>
          <div
            class="section-description"
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;"
          >
            Edit the card's configuration directly in JSON format. Changes are applied
            automatically.
          </div>
          <ultra-template-editor
            .hass=${hass}
            .value=${yamlString}
            .placeholder=${'{\n  "entity": "sensor.example"\n}'}
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
    config?: UltraCardConfig
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
            <ha-icon icon="mdi:card-off"></ha-icon>
            <p>No card selected</p>
            <p class="subtitle">Click edit to configure this card</p>
          </div>
        </div>
      `;
    }

    // Check if card config has sufficient data (more than just 'type')
    if (!module.card_config || Object.keys(module.card_config).length <= 1) {
      return html`
        <div class="external-card-module-container" style=${this.styleObjectToCss(containerStyles)}>
          <div class="external-card-placeholder">
            <ha-icon icon="mdi:cog"></ha-icon>
            <p>${module.name || module.card_type}</p>
            <p class="subtitle">Click edit to configure this card</p>
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
            <ha-icon icon="mdi:alert-circle"></ha-icon>
            <p><strong>Card Not Found</strong></p>
            <p class="card-type">${module.card_type}</p>
            <p class="subtitle">This card is not installed on your system</p>
          </div>
        </div>
      `;
    }

    // Use ref callback to create and mount the card element after Lit renders the container
    // NOTE: We don't cache preview elements because a DOM element can only exist in one place.
    // If we cache, the element gets "stolen" from the main card view when Live Preview opens.
    // Creating fresh elements on each render is lightweight and prevents display issues.
    const refCallback = (container: Element | undefined) => {
      if (!container) {
        return;
      }

      // Create a fresh card element each time (no caching for preview)
      try {
        const cardElement = ucExternalCardsService.createCardElement(
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
      } catch (error) {
        console.error(`[External Card] Failed to create/mount ${module.card_type}:`, error);
        // If card creation fails, show error in container
        container.innerHTML = `
          <div class="external-card-placeholder">
            <ha-icon icon="mdi:cog"></ha-icon>
            <p>${module.name || module.card_type}</p>
            <p class="subtitle">Configuring card...</p>
          </div>
        `;
      }
    };

    // Check if module should be locked (6th+ card for non-Pro users)
    const shouldLock = this._shouldLockModule(module, hass, config);

    if (shouldLock) {
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
                z-index: 10;
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
                "
              >
                <ha-icon icon="mdi:lock" style="font-size: 20px; flex-shrink: 0;"></ha-icon>
                <div
                  style="font-size: 11px; font-weight: 600; line-height: 1.2; white-space: nowrap;"
                >
                  Pro Feature
                </div>
                <div style="font-size: 9px; opacity: 0.8; line-height: 1.2; display: none;">
                  Upgrade to Pro
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
        padding: 40px 20px;
        text-align: center;
        color: var(--secondary-text-color);
        background: var(--card-background-color, var(--ha-card-background));
        border-radius: var(--ha-card-border-radius, 12px);
        border: 1px dashed var(--divider-color);
      }

      .external-card-error {
        border-color: var(--error-color);
        color: var(--error-color);
      }

      .external-card-placeholder ha-icon,
      .external-card-error ha-icon {
        font-size: 48px;
        opacity: 0.5;
        margin-bottom: 16px;
      }

      .external-card-placeholder p,
      .external-card-error p {
        margin: 4px 0;
        font-size: 14px;
      }

      .external-card-placeholder .subtitle,
      .external-card-error .subtitle {
        font-size: 12px;
        opacity: 0.8;
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
