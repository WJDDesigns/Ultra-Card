/**
 * FreeSpace availability.
 *
 * FreeSpace is on for everyone who has Ultra Card Connect installed: it shows
 * in the view Layout dropdown and offers edit tools. The custom view element
 * is always registered, so existing FreeSpace views keep rendering without
 * Connect.
 */

import { safeRemoveItem } from '../utils/safe-storage';
import { isConnectInstalled } from './uc-connect-compatibility';

/** The old per-browser opt-in switch; removed when FreeSpace became default-on. */
const LEGACY_STORAGE_KEY = 'ultra-card-freespace';

class UcFreeSpaceSettingsService {
  constructor() {
    safeRemoveItem(LEGACY_STORAGE_KEY);
  }

  /** True when FreeSpace should appear in the Layout dropdown and offer edit tools. */
  isDiscoverable(hass: unknown): boolean {
    return isConnectInstalled(hass);
  }
}

export const ucFreeSpaceSettingsService = new UcFreeSpaceSettingsService();
