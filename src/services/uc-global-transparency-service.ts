/**
 * Global Card Transparency Service
 * Manages applying transparency overlay to all Ultra Card instances using CSS injection
 */

import { GlobalCardTransparency } from '../types';

// Declare global variable for Ultra Cards to access
declare global {
  interface Window {
    ultraCardGlobalTransparency?: GlobalCardTransparency | null;
  }
}

class UcGlobalTransparencyService {
  private activeConfig: GlobalCardTransparency | null = null;
  private controllerId: string | null = null;
  private styleTagId: string | null = null;

  /**
   * Apply global transparency to all Ultra Cards using CSS injection
   */
  apply(config: GlobalCardTransparency, controllerId: string): void {
    if (!config.enabled) {
      this.restore(controllerId);
      return;
    }

    // Don't apply global transparency if we're in the card editor
    if (document.querySelector('hui-dialog-edit-card')) {
      return;
    }

    this.activeConfig = config;
    this.controllerId = controllerId;

    // Store config in global variable for Ultra Cards to access
    window.ultraCardGlobalTransparency = config;

    // Dispatch custom event for Ultra Cards to listen to
    window.dispatchEvent(
      new CustomEvent('ultra-card-global-transparency-changed', {
        detail: config,
      })
    );
  }

  /**
   * Restore original styles and disable transparency
   */
  restore(controllerId?: string): void {
    // Clear global variable
    window.ultraCardGlobalTransparency = null;

    this.activeConfig = null;
    this.controllerId = null;

    // Dispatch custom event to remove transparency
    window.dispatchEvent(
      new CustomEvent('ultra-card-global-transparency-changed', {
        detail: null,
      })
    );
  }

  /**
   * Get current active configuration
   */
  getActiveConfig(): GlobalCardTransparency | null {
    return this.activeConfig;
  }

  /**
   * Check if transparency is currently active
   */
  isActive(): boolean {
    return this.activeConfig !== null && this.styleTagId !== null;
  }
}

// Export singleton instance
export const ucGlobalTransparencyService = new UcGlobalTransparencyService();
