/**
 * Popup Trigger Registry Service
 * 
 * Manages the relationship between modules and the popups they should trigger.
 * When a module is configured as a popup trigger, clicking that module will
 * open the associated popup instead of executing its normal action.
 */

// Global registry key to persist across re-renders
const REGISTRY_KEY = '__ultraPopupTriggerRegistry__';

interface PopupTriggerRegistry {
  // Maps module IDs to the popup IDs they should trigger
  moduleToPopup: Map<string, string>;
  // Maps popup IDs to their trigger module IDs (for cleanup)
  popupToModule: Map<string, string>;
}

/**
 * Get or create the global popup trigger registry
 */
const getRegistry = (): PopupTriggerRegistry => {
  const w = window as any;
  if (!w[REGISTRY_KEY]) {
    w[REGISTRY_KEY] = {
      moduleToPopup: new Map<string, string>(),
      popupToModule: new Map<string, string>(),
    } as PopupTriggerRegistry;
  }
  return w[REGISTRY_KEY] as PopupTriggerRegistry;
};

/**
 * Register a module as a popup trigger
 * @param popupId The ID of the popup to open
 * @param moduleId The ID of the module that should trigger the popup
 */
export const registerPopupTrigger = (popupId: string, moduleId: string): void => {
  if (!popupId || !moduleId) return;
  
  const registry = getRegistry();
  
  // First, clean up any existing registration for this popup
  unregisterPopupTrigger(popupId);
  
  // Register the new relationship
  registry.moduleToPopup.set(moduleId, popupId);
  registry.popupToModule.set(popupId, moduleId);
};

/**
 * Unregister a popup's trigger module
 * @param popupId The ID of the popup to unregister
 */
export const unregisterPopupTrigger = (popupId: string): void => {
  if (!popupId) return;
  
  const registry = getRegistry();
  
  // Get the module that was registered for this popup
  const moduleId = registry.popupToModule.get(popupId);
  
  if (moduleId) {
    // Remove from moduleToPopup only if it still points to this popup
    // (another popup might have claimed this module)
    if (registry.moduleToPopup.get(moduleId) === popupId) {
      registry.moduleToPopup.delete(moduleId);
    }
    registry.popupToModule.delete(popupId);
  }
};

/**
 * Check if a module should trigger a popup
 * @param moduleId The ID of the module being clicked
 * @returns The popup ID if this module should trigger a popup, undefined otherwise
 */
export const getPopupForModule = (moduleId: string): string | undefined => {
  if (!moduleId) return undefined;
  
  const registry = getRegistry();
  return registry.moduleToPopup.get(moduleId);
};

/**
 * Open a popup by dispatching a custom event
 * @param popupId The ID of the popup to open
 */
export const openPopupById = (popupId: string): void => {
  if (!popupId) return;
  
  // Get the popup store to update state directly
  const w = window as any;
  const store = w.__ultraPopupStore__;
  
  if (store) {
    store.states.set(popupId, true);
    store.manuallyOpened.add(popupId);
  }
  
  // Dispatch event to notify popup module
  window.dispatchEvent(
    new CustomEvent('ultra-popup-open', {
      detail: { popupId },
      bubbles: true,
      composed: true,
    })
  );
};

/**
 * Get all registered popup triggers (for debugging)
 * @returns Array of [moduleId, popupId] pairs
 */
export const getAllRegisteredTriggers = (): Array<[string, string]> => {
  const registry = getRegistry();
  return Array.from(registry.moduleToPopup.entries());
};

/**
 * Clear all registrations (used when card is removed or reconfigured)
 */
export const clearAllTriggers = (): void => {
  const registry = getRegistry();
  registry.moduleToPopup.clear();
  registry.popupToModule.clear();
};

// Export the popup trigger registry service as a singleton object for convenience
export const popupTriggerRegistry = {
  register: registerPopupTrigger,
  unregister: unregisterPopupTrigger,
  getPopupForModule,
  openPopup: openPopupById,
  getAllTriggers: getAllRegisteredTriggers,
  clearAll: clearAllTriggers,
};

export default popupTriggerRegistry;
