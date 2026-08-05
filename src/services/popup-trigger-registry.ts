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
    // The popup module keys its state by `${cardInstanceId}:${moduleId}` (or the bare
    // module ID when no card instance ID exists). Match both forms so the state write
    // targets the same key(s) the module reads, instead of creating a phantom bare-ID entry.
    const matchingKeys: string[] = [];
    store.states.forEach((_value: boolean, key: string) => {
      if (key === popupId || key.endsWith(`:${popupId}`)) {
        matchingKeys.push(key);
      }
    });
    for (const key of matchingKeys) {
      store.states.set(key, true);
      store.manuallyOpened.add(key);
    }
    // If the popup hasn't rendered yet (no state entry), the event below still opens it
    // via the module's 'ultra-popup-open' listener, which uses the composite key.
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

const PORTAL_ID_PREFIX = 'ultra-popup-portal-';

/**
 * Resolve the store key of the popup a DOM element is rendered inside.
 *
 * Popups render into a portal on document.body, so DOM ancestry is the only
 * link a child module has back to the popup containing it. Walks out of shadow
 * roots because some modules render their content inside a custom element.
 *
 * @param element An element rendered somewhere inside a popup
 * @returns The popup's store key (`${cardInstanceId}:${moduleId}` or the bare
 *          module ID), or undefined when the element isn't inside a popup
 */
export const getContainingPopupKey = (element?: Element | null): string | undefined => {
  let current: Element | null = element || null;

  while (current) {
    const portal = current.closest('.ultra-popup-portal');
    if (portal) {
      return portal.id.startsWith(PORTAL_ID_PREFIX)
        ? portal.id.slice(PORTAL_ID_PREFIX.length)
        : undefined;
    }
    const root = current.getRootNode();
    current = root instanceof ShadowRoot ? root.host : null;
  }

  return undefined;
};

/**
 * Close a popup by dispatching a custom event
 *
 * Counterpart to openPopupById. Accepts either a bare popup module ID (closes
 * that popup on every card) or a full store key from getContainingPopupKey
 * (closes only that card's instance).
 *
 * @param popupIdOrKey The ID of the popup to close, or its store key
 */
export const closePopupById = (popupIdOrKey: string): void => {
  if (!popupIdOrKey) return;

  // Store keys are `${cardInstanceId}:${moduleId}`; neither instance IDs nor
  // module IDs contain a colon, so the trailing segment is the module ID.
  const separatorIndex = popupIdOrKey.lastIndexOf(':');
  const isStoreKey = separatorIndex !== -1;
  const popupId = isStoreKey ? popupIdOrKey.slice(separatorIndex + 1) : popupIdOrKey;

  const w = window as any;
  const store = w.__ultraPopupStore__;

  if (store) {
    // A bare ID targets every card's copy of the popup, the same way
    // openPopupById does; a store key targets one card instance only.
    const matchingKeys: string[] = [];
    store.states.forEach((_value: boolean, key: string) => {
      const matches = isStoreKey
        ? key === popupIdOrKey
        : key === popupId || key.endsWith(`:${popupId}`);
      if (matches) {
        matchingKeys.push(key);
      }
    });
    for (const key of matchingKeys) {
      store.states.set(key, false);
      // Manual-open is sticky by design and forces the popup back open on the
      // next render, so it has to be cleared for the close to hold.
      store.manuallyOpened.delete(key);
      const timerId = store.timers?.get(key);
      if (timerId !== undefined) {
        window.clearTimeout(timerId);
        store.timers.delete(key);
      }
    }
  }

  // Dispatch event to notify popup module, which owns portal teardown
  window.dispatchEvent(
    new CustomEvent('ultra-popup-close', {
      detail: { popupId, popupKey: isStoreKey ? popupIdOrKey : undefined },
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
  closePopup: closePopupById,
  getContainingPopupKey,
  getAllTriggers: getAllRegisteredTriggers,
  clearAll: clearAllTriggers,
};

export default popupTriggerRegistry;
