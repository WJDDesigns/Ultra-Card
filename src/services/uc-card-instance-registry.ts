import { UltraCardConfig } from '../types';

/**
 * Registry of live (connected) Ultra Card instances.
 *
 * `document.querySelectorAll('ultra-card')` cannot see cards inside HA's
 * shadow DOM, so anything that needs to reason about "the other cards on this
 * page" (unique instance IDs, cross-card duplicate module-ID healing for
 * issue #103) goes through this registry instead. Cards register on
 * connectedCallback and unregister on disconnectedCallback.
 */

export interface UcCardInstanceEntry {
  /** The card element itself (used only for identity checks). */
  element: Element;
  /** Current per-card instance id (may change once shortly after connect). */
  getInstanceId: () => string | undefined;
  /** Current card config, if set. */
  getConfig: () => UltraCardConfig | undefined;
  /** Raw stored config JSON as last passed to the card's setConfig. */
  getRawConfigJson: () => string | undefined;
  /** True when the card renders inside HA's editor preview dialog. */
  isEditorPreview: () => boolean;
}

class UcCardInstanceRegistry {
  private _entries = new Map<Element, UcCardInstanceEntry>();

  register(entry: UcCardInstanceEntry): void {
    this._entries.set(entry.element, entry);
  }

  unregister(element: Element): void {
    this._entries.delete(element);
  }

  /** All live entries, in registration (mount) order. */
  getAll(): UcCardInstanceEntry[] {
    return Array.from(this._entries.values());
  }

  /** Mount-order index of a registered element (-1 when not registered). */
  indexOf(element: Element): number {
    return Array.from(this._entries.keys()).indexOf(element);
  }

  /** Instance ids currently claimed by live cards other than `element`. */
  getClaimedInstanceIds(except?: Element): Set<string> {
    const claimed = new Set<string>();
    for (const entry of this._entries.values()) {
      if (except && entry.element === except) continue;
      const id = entry.getInstanceId();
      if (id) claimed.add(id);
    }
    return claimed;
  }
}

export const ucCardInstanceRegistry = new UcCardInstanceRegistry();
