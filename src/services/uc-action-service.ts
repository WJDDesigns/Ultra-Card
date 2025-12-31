import { HomeAssistant } from 'custom-card-helpers';
import { UltraLinkComponent, TapActionConfig } from '../components/ultra-link';
import { CardModule, UltraCardConfig } from '../types';

/**
 * Centralized action service that handles all module actions
 * This ensures confirmation dialogs work consistently across all modules
 */
export class UcActionService {
  private static instance: UcActionService;

  private constructor() {}

  static getInstance(): UcActionService {
    if (!UcActionService.instance) {
      UcActionService.instance = new UcActionService();
    }
    return UcActionService.instance;
  }

  /**
   * Handles an action with automatic module context
   * This is the main method all modules should use
   */
  async handleAction(
    action: TapActionConfig | undefined,
    hass: HomeAssistant,
    element?: HTMLElement,
    config?: UltraCardConfig,
    moduleEntity?: string,
    module?: CardModule
  ): Promise<void> {
    // Always pass the module to UltraLinkComponent.handleAction
    // This ensures confirmation dialogs work for all modules
    await UltraLinkComponent.handleAction(
      action,
      hass,
      element,
      config,
      moduleEntity,
      module
    );
  }
}

export const ucActionService = UcActionService.getInstance();

