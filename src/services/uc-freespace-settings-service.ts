/**
 * FreeSpace discoverability toggle.
 *
 * Stored per browser (localStorage), same pattern as Sections view width.
 * The custom view element is always registered so existing FreeSpace views
 * keep rendering; this flag + Connect install only control whether FreeSpace
 * appears in the Layout dropdown and whether edit tools are offered.
 */

import { safeGetItem, safeRemoveItem, safeSetItem } from '../utils/safe-storage';
import { isConnectInstalled } from './uc-connect-compatibility';

const STORAGE_KEY = 'ultra-card-freespace';
/**
 * Same-document sync. The Hub panel and the card are separate bundles, so each
 * has its own instance; `storage` events only fire in *other* documents.
 */
const CHANGE_EVENT = 'uc-freespace-settings-changed';

export interface UcFreeSpaceSettings {
  /** User opted in via Hub > Home. Requires Connect to be discoverable. */
  enabled: boolean;
}

const DEFAULTS: UcFreeSpaceSettings = { enabled: false };

class UcFreeSpaceSettingsService {
  private _settings: UcFreeSpaceSettings = { ...DEFAULTS };
  private _listeners = new Set<() => void>();

  constructor() {
    this._loadFromStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', e => {
        if (e.key === STORAGE_KEY) this._reloadExternal();
      });
      window.addEventListener(CHANGE_EVENT, e => {
        if ((e as CustomEvent<{ source?: unknown }>).detail?.source !== this) {
          this._reloadExternal();
        }
      });
    }
  }

  private _reloadExternal(): void {
    this._loadFromStorage();
    this._notify();
  }

  get(): UcFreeSpaceSettings {
    return { ...this._settings };
  }

  /** True when the user has enabled FreeSpace in the Hub. */
  isEnabled(): boolean {
    return this._settings.enabled;
  }

  /**
   * True when FreeSpace should appear in the Layout dropdown and offer edit tools.
   * Requires both the Hub toggle and Ultra Card Connect installed.
   */
  isDiscoverable(hass: unknown): boolean {
    return this._settings.enabled && isConnectInstalled(hass);
  }

  setEnabled(enabled: boolean): void {
    if (enabled === this._settings.enabled) return;
    this._settings = { enabled };
    if (!enabled) safeRemoveItem(STORAGE_KEY);
    else safeSetItem(STORAGE_KEY, JSON.stringify(this._settings));
    this._notify();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { source: this } }));
    }
  }

  subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  private _loadFromStorage(): void {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) {
      this._settings = { ...DEFAULTS };
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<UcFreeSpaceSettings>;
      this._settings = { enabled: parsed.enabled === true };
    } catch {
      this._settings = { ...DEFAULTS };
    }
  }

  private _notify(): void {
    for (const l of this._listeners) {
      try {
        l();
      } catch {
        // listeners must not break each other
      }
    }
  }
}

export const ucFreeSpaceSettingsService = new UcFreeSpaceSettingsService();
