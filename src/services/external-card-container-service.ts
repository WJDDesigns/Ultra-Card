import { HomeAssistant } from 'custom-card-helpers';
import { escapeHtml } from '../utils/html-sanitizer';
import { ucExternalCardsService } from './uc-external-cards-service';

interface ContainerInfo {
  container: HTMLElement;
  cardElement: HTMLElement;
  moduleId: string;
  cardType: string;
  config: any;
}

/**
 * Service that manages persistent containers for 3rd party cards
 * Ultra Card acts as a simple container - cards manage their own lifecycle
 */
class ExternalCardContainerService {
  private static instance: ExternalCardContainerService;
  private containers = new Map<string, ContainerInfo>();
  private currentHass: HomeAssistant | undefined;
  private pendingHassSetup = new Set<string>(); // Track cards waiting for hass

  private constructor() {}

  public static getInstance(): ExternalCardContainerService {
    if (!ExternalCardContainerService.instance) {
      ExternalCardContainerService.instance = new ExternalCardContainerService();
    }
    return ExternalCardContainerService.instance;
  }

  /**
   * Set the current Home Assistant instance
   * This directly updates all card elements with new hass
   */
  public setHass(hass: HomeAssistant): void {
    if (!hass) return;

    const isFirstHass = !this.currentHass;

    // Only update if hass actually changed
    if (this.currentHass === hass) return;

    this.currentHass = hass;

    // If this is the first hass, initialize any cards that were created without it
    if (isFirstHass && this.pendingHassSetup.size > 0) {
      this.pendingHassSetup.forEach(moduleId => {
        const containerInfo = this.containers.get(moduleId);
        if (containerInfo?.cardElement) {
          this._initializeCardHass(containerInfo);
        }
      });
      this.pendingHassSetup.clear();
    }

    // Pass hass to all card elements - cards handle their own optimization
    this.containers.forEach((containerInfo, moduleId) => {
      if (containerInfo.cardElement?.isConnected) {
        this._applyHassToCardElement(containerInfo, hass);
      }
    });
  }

  /**
   * Push hass onto a single embedded card (used by global setHass and per-preview context hass).
   */
  private _applyHassToCardElement(
    containerInfo: ContainerInfo,
    hass: HomeAssistant | undefined
  ): void {
    if (!hass || !containerInfo.cardElement?.isConnected) {
      return;
    }
    try {
      (containerInfo.cardElement as any).hass = hass;

      const elementName = containerInfo.cardType.startsWith('custom:')
        ? containerInfo.cardType.substring(7)
        : containerInfo.cardType;

      if (elementName.includes('apexcharts')) {
        if (typeof (containerInfo.cardElement as any).requestUpdate === 'function') {
          (containerInfo.cardElement as any).requestUpdate();
        }
      }

      if (elementName.includes('webrtc-camera') || elementName.includes('webrtc')) {
        if (typeof (containerInfo.cardElement as any).requestUpdate === 'function') {
          (containerInfo.cardElement as any).requestUpdate();
        }
      }
    } catch {
      // Card might not be ready yet
    }
  }

  /**
   * Apply hass from the current render context (e.g. Live Preview) so embedded cards
   * see the same states as the editor. Falls back to singleton last hass from UltraCard.
   */
  private _applyContextHass(
    containerInfo: ContainerInfo,
    contextHass?: HomeAssistant
  ): void {
    const h = contextHass ?? this.currentHass;
    this._applyHassToCardElement(containerInfo, h);
  }

  /**
   * Get or create a persistent container for a 3rd party card
   * @param contextHass - hass from the host render (editor preview); ensures cards get states even
   *                      before/without UltraCard's singleton setHass running for this view.
   */
  public getContainer(
    moduleId: string,
    cardType: string,
    config: any,
    contextHass?: HomeAssistant
  ): HTMLElement {
    // Normalize card type - ensure we store it consistently
    const normalizedCardType = cardType.startsWith('custom:') ? cardType : `custom:${cardType}`;

    // Check if we already have a container for this module
    let containerInfo = this.containers.get(moduleId);

    // If container exists but card type changed, recreate
    if (containerInfo && containerInfo.cardType !== normalizedCardType) {
      this.destroyContainer(moduleId);
      containerInfo = undefined;
    }

    // Create new container if needed
    if (!containerInfo) {
      containerInfo = this.createContainer(moduleId, normalizedCardType, config, contextHass);
      this.containers.set(moduleId, containerInfo);
    } else {
      this._applyContextHass(containerInfo, contextHass);
      // Update config if changed
      this._updateConfig(containerInfo, config);

      // For ApexCharts, trigger re-initialization when container is retrieved
      // This handles the case where card was created in editor but needs to render on dashboard
      const elementName = normalizedCardType.startsWith('custom:')
        ? normalizedCardType.substring(7)
        : normalizedCardType;

      if (elementName.includes('apexcharts') && containerInfo.cardElement) {
        // Schedule re-initialization after the container is mounted
        setTimeout(() => {
          if (containerInfo!.cardElement?.isConnected && this.currentHass) {
            (containerInfo!.cardElement as any).hass = this.currentHass;

            // Force re-render
            if (typeof (containerInfo!.cardElement as any).requestUpdate === 'function') {
              (containerInfo!.cardElement as any).requestUpdate();
            }

            // Dispatch resize to help chart calculate dimensions
            window.dispatchEvent(new Event('resize'));
          }
        }, 150);
      }

      // For WebRTC camera cards, trigger stream initialization when container is retrieved
      // This handles the case where card was created but needs to start streaming on dashboard
      if ((elementName.includes('webrtc-camera') || elementName.includes('webrtc')) && containerInfo.cardElement) {
        // Schedule initialization after the container is mounted
        setTimeout(() => {
          if (containerInfo!.cardElement?.isConnected && this.currentHass) {
            (containerInfo!.cardElement as any).hass = this.currentHass;

            // Force re-render to trigger stream
            if (typeof (containerInfo!.cardElement as any).requestUpdate === 'function') {
              (containerInfo!.cardElement as any).requestUpdate();
            }

            // Try to trigger internal refresh if card has the method
            if (typeof (containerInfo!.cardElement as any).refresh === 'function') {
              (containerInfo!.cardElement as any).refresh();
            }

            // Dispatch resize to help card detect dimensions
            window.dispatchEvent(new Event('resize'));
          }
        }, 150);

        // Second attempt for slow WebRTC connections
        setTimeout(() => {
          if (containerInfo!.cardElement?.isConnected && this.currentHass) {
            (containerInfo!.cardElement as any).hass = this.currentHass;

            if (typeof (containerInfo!.cardElement as any).requestUpdate === 'function') {
              (containerInfo!.cardElement as any).requestUpdate();
            }

            window.dispatchEvent(new Event('resize'));
          }
        }, 600);
      }
    }

    return containerInfo.container;
  }

  /**
   * Create a new isolated container with a 3rd party card
   */
  private createContainer(
    moduleId: string,
    cardType: string,
    config: any,
    contextHass?: HomeAssistant
  ): ContainerInfo {
    // Create container div
    const container = document.createElement('div');
    container.className = 'external-card-isolated-container';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.position = 'relative';
    container.setAttribute('data-module-id', moduleId);

    // ucExternalCardsService expects card type without 'custom:' prefix
    const elementName = cardType.startsWith('custom:') ? cardType.substring(7) : cardType;

    // If the custom element class isn't registered yet (3rd-party card script
    // still loading), defer creation until customElements.whenDefined resolves.
    // Otherwise document.createElement would produce an HTMLUnknownElement and
    // any hass/config we set on it would shadow the prototype setters once the
    // element gets upgraded — permanently breaking cards like better-moment-card
    // that only render inside `set hass`.
    if (elementName.includes('-') && !customElements.get(elementName)) {
      return this._createDeferredContainer(
        moduleId,
        cardType,
        elementName,
        config,
        container,
        contextHass
      );
    }

    // Create the card element
    const hassForCreate = contextHass ?? this.currentHass;

    let cardElement: HTMLElement;
    try {
      // Create element WITH hass if available - critical for WebRTC and other streaming cards
      // that need hass during setConfig to establish connections
      cardElement = ucExternalCardsService.createCardElement(
        elementName,
        config,
        hassForCreate || null
      ) as HTMLElement;

      if (!cardElement) {
        throw new Error('Failed to create card element - returned null');
      }

      // Apply styles to card element
      cardElement.style.width = '100%';
      cardElement.style.minWidth = '0';
      cardElement.style.flex = '1 1 auto';
      cardElement.style.display = 'block';

      // Mount the card in the container
      container.appendChild(cardElement);

      const containerInfo: ContainerInfo = {
        container,
        cardElement,
        moduleId,
        cardType,
        config,
      };

      // Set initial hass if available, otherwise mark as pending
      if (hassForCreate) {
        this._initializeCardHass(containerInfo);
      } else {
        this.pendingHassSetup.add(moduleId);
      }

      return containerInfo;
    } catch (error) {
      console.error(`[External Card Container] Failed to create ${elementName}:`, error);

      // Create error placeholder
      const displayName = cardType.startsWith('custom:') ? cardType : `custom:${cardType}`;
      const safeName = escapeHtml(displayName);
      container.innerHTML = `
        <div style="padding: 16px; text-align: center; color: var(--error-color);">
          <ha-icon icon="mdi:alert-circle" style="font-size: 48px;"></ha-icon>
          <p>Failed to load ${safeName}</p>
        </div>
      `;

      return {
        container,
        cardElement: container,
        moduleId,
        cardType,
        config,
      };
    }
  }

  /**
   * Create a deferred container for a 3rd-party card whose custom element class
   * has not yet been registered. Shows a lightweight loading placeholder, then
   * swaps in the real element once `customElements.whenDefined()` resolves.
   *
   * This avoids the "upgrade-shadowing" bug where assigning hass/config to an
   * HTMLUnknownElement would create own-properties that shadow the prototype's
   * setters when the element is later upgraded — permanently preventing cards
   * like better-moment-card (which only render inside `set hass`) from painting.
   */
  private _createDeferredContainer(
    moduleId: string,
    cardType: string,
    elementName: string,
    config: any,
    container: HTMLElement,
    contextHass: HomeAssistant | undefined
  ): ContainerInfo {
    container.setAttribute('data-uc-deferred', elementName);

    const placeholder = document.createElement('div');
    placeholder.className = 'external-card-loading';
    placeholder.style.width = '100%';
    placeholder.style.minHeight = '40px';
    placeholder.style.padding = '12px 16px';
    placeholder.style.boxSizing = 'border-box';
    placeholder.style.textAlign = 'center';
    placeholder.style.color = 'var(--secondary-text-color, #999)';
    placeholder.style.opacity = '0.7';
    placeholder.style.fontSize = '13px';
    placeholder.textContent = `Loading ${cardType}...`;
    container.appendChild(placeholder);

    const containerInfo: ContainerInfo = {
      container,
      cardElement: placeholder,
      moduleId,
      cardType,
      config,
    };

    // Track in pending so a later setHass run can find us if needed.
    this.pendingHassSetup.add(moduleId);

    // Cap the wait so a typo / missing card doesn't show "Loading..." forever.
    let timedOut = false;
    const TIMEOUT_MS = 15000;
    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      if (
        this.containers.get(moduleId) === containerInfo &&
        containerInfo.cardElement === placeholder &&
        container.contains(placeholder)
      ) {
        placeholder.textContent = `Card not loaded: ${cardType}`;
        placeholder.style.color = 'var(--error-color, #db4437)';
      }
    }, TIMEOUT_MS);

    customElements
      .whenDefined(elementName)
      .then(() => {
        window.clearTimeout(timeoutId);
        if (timedOut) return;

        // Container may have been destroyed or swapped (e.g., card type changed).
        if (this.containers.get(moduleId) !== containerInfo) return;
        if (containerInfo.cardElement !== placeholder) return;

        const hassForCreateNow = this.currentHass ?? contextHass;
        const realElement = ucExternalCardsService.createCardElement(
          elementName,
          containerInfo.config,
          hassForCreateNow ?? null
        ) as HTMLElement | null;

        if (!realElement) {
          placeholder.textContent = `Failed to load ${cardType}`;
          placeholder.style.color = 'var(--error-color, #db4437)';
          return;
        }

        realElement.style.width = '100%';
        realElement.style.minWidth = '0';
        realElement.style.flex = '1 1 auto';
        realElement.style.display = 'block';

        if (container.contains(placeholder)) {
          container.replaceChild(realElement, placeholder);
        } else {
          container.appendChild(realElement);
        }

        containerInfo.cardElement = realElement;
        container.removeAttribute('data-uc-deferred');

        if (hassForCreateNow) {
          this._initializeCardHass(containerInfo);
          this.pendingHassSetup.delete(moduleId);
        }
      })
      .catch(error => {
        window.clearTimeout(timeoutId);
        console.error(
          `[External Card Container] customElements.whenDefined failed for ${elementName}:`,
          error
        );
      });

    return containerInfo;
  }

  /**
   * Update the configuration of an existing card by module ID
   */
  public updateConfig(moduleId: string, newConfig: any, contextHass?: HomeAssistant): void {
    const containerInfo = this.containers.get(moduleId);
    if (!containerInfo) {
      return;
    }
    if (contextHass) {
      this._applyContextHass(containerInfo, contextHass);
    }
    this._updateConfig(containerInfo, newConfig);
  }

  /**
   * Update the configuration of an existing card
   */
  private _updateConfig(containerInfo: ContainerInfo, newConfig: any): void {
    // Check if config actually changed
    const configChanged = JSON.stringify(containerInfo.config) !== JSON.stringify(newConfig);

    if (!configChanged) {
      return;
    }

    containerInfo.config = newConfig;
    const el = containerInfo.cardElement as any;
    if (!el) {
      return;
    }

    try {
      if (typeof el.setConfig === 'function') {
        el.setConfig(newConfig);
      } else if (el.tagName?.toLowerCase() === 'hui-card' && typeof el.load === 'function') {
        el.config = newConfig;
        el.load();
      } else if ('config' in el) {
        el.config = newConfig;
      }
    } catch (error) {
      console.error(
        `[External Card Container] Failed to update config for ${containerInfo.cardType}:`,
        error
      );
    }
  }

  /**
   * Initialize hass on a card element
   */
  private _initializeCardHass(containerInfo: ContainerInfo): void {
    const { cardElement, cardType } = containerInfo;
    const elementName = cardType.startsWith('custom:') ? cardType.substring(7) : cardType;

    const setupHass = async () => {
      // Wait for card's updateComplete if it's a Lit element
      if ((cardElement as any).updateComplete) {
        try {
          await (cardElement as any).updateComplete;
        } catch (e) {
          // Ignore
        }
      }

      // Give card a moment to initialize
      await new Promise(resolve => setTimeout(resolve, 50));

      // Prefer singleton hass from UltraCard; fall back to hass already on the element
      // (e.g. Live Preview passed context hass before setHass() ever ran)
      const effectiveHass =
        this.currentHass || ((cardElement as any).hass as HomeAssistant | undefined);

      if (cardElement.isConnected && effectiveHass) {
        // Set hass using both methods for compatibility
        (cardElement as any).hass = effectiveHass;

        if (typeof (cardElement as any).setHass === 'function') {
          (cardElement as any).setHass(effectiveHass);
        }

        // For mushroom chips, force a second update after delay
        if (elementName.includes('mushroom-chips')) {
          setTimeout(() => {
            const h =
              this.currentHass || ((cardElement as any).hass as HomeAssistant | undefined);
            if (cardElement.isConnected && h) {
              (cardElement as any).hass = h;

              if (typeof (cardElement as any).setHass === 'function') {
                (cardElement as any).setHass(h);
              }

              // Force re-render
              if (typeof (cardElement as any).requestUpdate === 'function') {
                (cardElement as any).requestUpdate();
              }
            }
          }, 300);
        }

        // ApexCharts cards need special handling - the chart library needs to initialize
        // after the element is in the DOM and has dimensions
        if (elementName.includes('apexcharts')) {
          // First update to ensure card is ready
          setTimeout(() => {
            const h =
              this.currentHass || ((cardElement as any).hass as HomeAssistant | undefined);
            if (cardElement.isConnected && h) {
              (cardElement as any).hass = h;

              // Force re-render to trigger chart initialization
              if (typeof (cardElement as any).requestUpdate === 'function') {
                (cardElement as any).requestUpdate();
              }

              // Dispatch resize event to help chart calculate dimensions
              window.dispatchEvent(new Event('resize'));
            }
          }, 100);

          // Second update after chart has had time to initialize
          setTimeout(() => {
            const h =
              this.currentHass || ((cardElement as any).hass as HomeAssistant | undefined);
            if (cardElement.isConnected && h) {
              (cardElement as any).hass = h;

              // Force another re-render
              if (typeof (cardElement as any).requestUpdate === 'function') {
                (cardElement as any).requestUpdate();
              }

              // Some ApexCharts versions need a resize event to properly render
              window.dispatchEvent(new Event('resize'));

              // Try to trigger the chart's internal resize method if available
              const apexChart = (cardElement as any)._chart || (cardElement as any).chart;
              if (apexChart && typeof apexChart.updateOptions === 'function') {
                try {
                  apexChart.updateOptions({}, false, true);
                } catch (e) {
                  // Ignore - chart might not be ready
                }
              }
            }
          }, 500);
        }

        // WebRTC camera cards need special handling for stream initialization
        // These cards require multiple initialization attempts to establish WebRTC connections
        if (elementName.includes('webrtc-camera') || elementName.includes('webrtc')) {
          // First attempt - initial setup
          setTimeout(() => {
            const h =
              this.currentHass || ((cardElement as any).hass as HomeAssistant | undefined);
            if (cardElement.isConnected && h) {
              (cardElement as any).hass = h;

              // Force re-render to trigger stream initialization
              if (typeof (cardElement as any).requestUpdate === 'function') {
                (cardElement as any).requestUpdate();
              }

              // Dispatch resize event to help card detect dimensions
              window.dispatchEvent(new Event('resize'));
            }
          }, 100);

          // Second attempt - ensure stream starts
          setTimeout(() => {
            const h =
              this.currentHass || ((cardElement as any).hass as HomeAssistant | undefined);
            if (cardElement.isConnected && h) {
              (cardElement as any).hass = h;

              if (typeof (cardElement as any).requestUpdate === 'function') {
                (cardElement as any).requestUpdate();
              }

              // Try to trigger internal refresh if card has the method
              if (typeof (cardElement as any).refresh === 'function') {
                (cardElement as any).refresh();
              }

              window.dispatchEvent(new Event('resize'));
            }
          }, 500);

          // Third attempt - handle slow connections
          setTimeout(() => {
            const h =
              this.currentHass || ((cardElement as any).hass as HomeAssistant | undefined);
            if (cardElement.isConnected && h) {
              (cardElement as any).hass = h;

              if (typeof (cardElement as any).requestUpdate === 'function') {
                (cardElement as any).requestUpdate();
              }

              // Some WebRTC cards need visibility change events
              if (typeof (cardElement as any).updateComplete !== 'undefined') {
                Promise.resolve((cardElement as any).updateComplete).then(() => {
                  window.dispatchEvent(new Event('resize'));
                });
              }
            }
          }, 1000);
        }
      }
    };

    requestAnimationFrame(() => setupHass());
  }

  /**
   * Destroy a container and clean up resources
   */
  public destroyContainer(moduleId: string): void {
    const containerInfo = this.containers.get(moduleId);
    if (!containerInfo) return;

    // Remove from DOM if still attached
    if (containerInfo.container.parentNode) {
      containerInfo.container.parentNode.removeChild(containerInfo.container);
    }

    // Clean up card element
    if (containerInfo.cardElement) {
      // Some cards may have cleanup methods
      if (typeof (containerInfo.cardElement as any).disconnectedCallback === 'function') {
        try {
          (containerInfo.cardElement as any).disconnectedCallback();
        } catch (error) {
          console.error('Error during card cleanup:', error);
        }
      }
    }

    // Remove from map and pending setup
    this.containers.delete(moduleId);
    this.pendingHassSetup.delete(moduleId);
  }

  /**
   * Destroy all containers (for cleanup)
   */
  public destroyAll(): void {
    this.containers.forEach((_, moduleId) => {
      this.destroyContainer(moduleId);
    });
    this.containers.clear();
    this.pendingHassSetup.clear();
  }

  /**
   * Check if a container exists for a module
   */
  public hasContainer(moduleId: string): boolean {
    return this.containers.has(moduleId);
  }

  /**
   * Get all active container IDs
   */
  public getActiveContainerIds(): string[] {
    return Array.from(this.containers.keys());
  }
}

// Export singleton instance
export const externalCardContainerService = ExternalCardContainerService.getInstance();
