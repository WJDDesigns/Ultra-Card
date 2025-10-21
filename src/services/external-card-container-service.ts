import { HomeAssistant } from 'custom-card-helpers';
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
  private currentHass?: HomeAssistant;
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
        try {
          // Set hass property directly - let cards decide if they need to update
          (containerInfo.cardElement as any).hass = hass;
        } catch (error) {
          // Silent - card might not be ready yet
        }
      }
    });
  }

  /**
   * Get or create a persistent container for a 3rd party card
   */
  public getContainer(moduleId: string, cardType: string, config: any): HTMLElement {
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
      containerInfo = this.createContainer(moduleId, normalizedCardType, config);
      this.containers.set(moduleId, containerInfo);
    } else {
      // Update config if changed
      this._updateConfig(containerInfo, config);
    }

    return containerInfo.container;
  }

  /**
   * Create a new isolated container with a 3rd party card
   */
  private createContainer(moduleId: string, cardType: string, config: any): ContainerInfo {
    // Create container div
    const container = document.createElement('div');
    container.className = 'external-card-isolated-container';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.position = 'relative';
    container.setAttribute('data-module-id', moduleId);

    // ucExternalCardsService expects card type without 'custom:' prefix
    const elementName = cardType.startsWith('custom:') ? cardType.substring(7) : cardType;

    // Create the card element
    let cardElement: HTMLElement;
    try {
      // Create element WITHOUT hass - we'll set it after
      cardElement = ucExternalCardsService.createCardElement(
        elementName,
        config,
        null
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
      if (this.currentHass) {
        this._initializeCardHass(containerInfo);
      } else {
        this.pendingHassSetup.add(moduleId);
      }

      return containerInfo;
    } catch (error) {
      console.error(`[External Card Container] Failed to create ${elementName}:`, error);

      // Create error placeholder
      const displayName = cardType.startsWith('custom:') ? cardType : `custom:${cardType}`;
      container.innerHTML = `
        <div style="padding: 16px; text-align: center; color: var(--error-color);">
          <ha-icon icon="mdi:alert-circle" style="font-size: 48px;"></ha-icon>
          <p>Failed to load ${displayName}</p>
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
   * Update the configuration of an existing card by module ID
   */
  public updateConfig(moduleId: string, newConfig: any): void {
    const containerInfo = this.containers.get(moduleId);
    if (!containerInfo) {
      return;
    }
    this._updateConfig(containerInfo, newConfig);
  }

  /**
   * Update the configuration of an existing card
   */
  private _updateConfig(containerInfo: ContainerInfo, newConfig: any): void {
    // Check if config actually changed
    const configChanged = JSON.stringify(containerInfo.config) !== JSON.stringify(newConfig);

    if (configChanged) {
      containerInfo.config = newConfig;

      // Update the card's config
      if (
        containerInfo.cardElement &&
        typeof (containerInfo.cardElement as any).setConfig === 'function'
      ) {
        try {
          (containerInfo.cardElement as any).setConfig(newConfig);
        } catch (error) {
          console.error(
            `[External Card Container] Failed to update config for ${containerInfo.cardType}:`,
            error
          );
        }
      }
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

      if (cardElement.isConnected && this.currentHass) {
        // Set hass using both methods for compatibility
        (cardElement as any).hass = this.currentHass;

        if (typeof (cardElement as any).setHass === 'function') {
          (cardElement as any).setHass(this.currentHass);
        }

        // For mushroom chips, force a second update after delay
        if (elementName.includes('mushroom-chips')) {
          setTimeout(() => {
            if (cardElement.isConnected && this.currentHass) {
              (cardElement as any).hass = this.currentHass;

              if (typeof (cardElement as any).setHass === 'function') {
                (cardElement as any).setHass(this.currentHass);
              }

              // Force re-render
              if (typeof (cardElement as any).requestUpdate === 'function') {
                (cardElement as any).requestUpdate();
              }
            }
          }, 300);
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
