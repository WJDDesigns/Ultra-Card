import { html, TemplateResult, css, CSSResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { ExternalCardModule, UltraCardConfig } from '../types';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { ucExternalCardsService } from '../services/uc-external-cards-service';
import { ref } from 'lit/directives/ref.js';

// Cache card elements by module ID to prevent flashing/reloading
const cardElementCache = new Map<string, HTMLElement>();

// Export cleanup function for when modules are deleted
export function cleanupExternalCardCache(moduleId: string): void {
  cardElementCache.delete(moduleId);
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
    tags: ['pro', 'external', 'integration', '3rd-party'],
  };

  createDefault(id?: string, hass?: HomeAssistant): ExternalCardModule {
    return {
      id: id || this.generateId('external-card'),
      type: 'external_card',
      card_type: '',
      card_config: {},
    };
  }

  // External cards use native HA dialog for configuration - no embedded editor needed
  // The native dialog is rendered by uc-native-card-dialog component in layout-tab.ts
  renderGeneralTab(
    module: ExternalCardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<ExternalCardModule>) => void
  ): TemplateResult {
    // External cards don't use the module settings popup - they use the native dialog
    // This method is only called if someone somehow opens the settings for an external card
    // which should be prevented by the layout-tab.ts code
    return html`
      <div style="padding: 40px; text-align: center;">
        <ha-icon icon="mdi:information" style="font-size: 48px; opacity: 0.5;"></ha-icon>
        <p style="margin-top: 16px;">External cards use their native configuration dialog.</p>
        <p style="font-size: 13px; color: var(--secondary-text-color);">
          Close this and click edit again to open the native dialog.
        </p>
      </div>
    `;
  }

  renderPreview(
    module: ExternalCardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): TemplateResult {
    // Check if card type is set
    if (!module.card_type) {
      return html`
        <div class="external-card-placeholder">
          <ha-icon icon="mdi:card-off"></ha-icon>
          <p>No card selected</p>
          <p class="subtitle">Click edit to configure this card</p>
        </div>
      `;
    }

    // Check if card config has sufficient data (more than just 'type')
    if (!module.card_config || Object.keys(module.card_config).length <= 1) {
      return html`
        <div class="external-card-placeholder">
          <ha-icon icon="mdi:cog"></ha-icon>
          <p>${module.name || module.card_type}</p>
          <p class="subtitle">Click edit to configure this card</p>
        </div>
      `;
    }

    // Check if card is available
    const isAvailable = ucExternalCardsService.isCardAvailable(module.card_type);

    if (!isAvailable) {
      return html`
        <div class="external-card-error">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <p><strong>Card Not Found</strong></p>
          <p class="card-type">${module.card_type}</p>
          <p class="subtitle">This card is not installed on your system</p>
        </div>
      `;
    }

    // Use ref callback to create and mount the card element after Lit renders the container
    const refCallback = (container: Element | undefined) => {
      if (!container) {
        // Element is being unmounted - nothing to do
        return;
      }

      // Check if we have a cached card element for this module
      let cardElement = cardElementCache.get(module.id);

      if (cardElement) {
        // Reuse existing element - just update config and hass
        if (typeof (cardElement as any).setConfig === 'function') {
          try {
            (cardElement as any).setConfig(module.card_config);
          } catch (e) {
            // Config update might fail during configuration
            console.warn(`[External Card] Config update failed for ${module.card_type}:`, e);
          }
        }
        (cardElement as any).hass = hass;

        // Mount it if it's not already in this container
        if (!container.contains(cardElement)) {
          container.innerHTML = '';
          container.appendChild(cardElement);
        }
        return;
      }

      // Create a fresh card element (first time only)
      try {
        cardElement = ucExternalCardsService.createCardElement(
          module.card_type,
          module.card_config,
          hass
        ) as HTMLElement;

        if (!cardElement) {
          throw new Error('Failed to create card element');
        }

        // Store in cache to prevent recreating on every render
        cardElementCache.set(module.id, cardElement);

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

    // Return the wrapper container with ref callback
    return html`
      <div
        ${ref(refCallback)}
        class="external-card-wrapper"
        @click=${(e: Event) => e.stopPropagation()}
      >
        <!-- Card will be mounted here -->
      </div>
    `;
  }

  static get styles(): CSSResult {
    return css`
      /* Let container size naturally to content, like Ultra Card's own modules */
      :host {
        display: block;
        box-sizing: border-box;
      }

      .external-card-wrapper {
        display: inline-block;
        box-sizing: border-box;
        position: relative;
        min-width: fit-content;
        /* inline-block + min-width ensures cards don't collapse in horizontal layouts */
      }

      /* Allow natural sizing for child cards */
      .external-card-wrapper > * {
        box-sizing: border-box;
      }

      .external-card-placeholder,
      .external-card-error {
        padding: 40px 20px;
        text-align: center;
        background: var(--card-background-color, #fff);
        border-radius: 8px;
        border: 1px dashed var(--divider-color, #e0e0e0);
      }

      .external-card-error {
        border-color: #ff9800;
        background: rgba(255, 152, 0, 0.05);
      }

      .external-card-placeholder ha-icon,
      .external-card-error ha-icon {
        font-size: 48px;
        opacity: 0.5;
        display: block;
        margin: 0 auto 16px;
      }

      .external-card-placeholder p,
      .external-card-error p {
        margin: 8px 0;
        color: var(--primary-text-color, #212121);
      }

      .subtitle {
        font-size: 13px !important;
        color: var(--secondary-text-color, #757575) !important;
      }

      .card-type {
        font-family: 'Courier New', monospace;
        font-size: 12px !important;
        background: rgba(0, 0, 0, 0.05);
        padding: 4px 8px;
        border-radius: 4px;
        display: inline-block;
      }
    `;
  }
}
