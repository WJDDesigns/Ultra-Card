import type { HomeAssistant } from 'custom-card-helpers';

export interface HaUserInfo {
  id: string;
  name: string;
  is_active?: boolean | undefined;
  is_owner?: boolean | undefined;
}

type UsersLoadedListener = () => void;

/**
 * Caches Home Assistant auth users for the user-visibility picker.
 * Uses `config/auth/list` when available; falls back to the current `hass.user`.
 */
class UcHaUsersService {
  private _users: HaUserInfo[] | null = null;
  private _loading = false;
  private _lastHassRef: HomeAssistant | null = null;
  private _listeners = new Set<UsersLoadedListener>();
  private _fallbackOnly = false;

  /** Subscribe to cache updates (e.g. after async auth list load). */
  subscribe(listener: UsersLoadedListener): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  private _notify(): void {
    this._listeners.forEach(l => {
      try {
        l();
      } catch {
        /* ignore listener errors */
      }
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('uc-ha-users-loaded', { bubbles: true, composed: true })
      );
    }
  }

  private _fromHassUser(hass: HomeAssistant | undefined): HaUserInfo[] {
    const u = (hass as any)?.user;
    if (!u?.id) return [];
    return [
      {
        id: String(u.id),
        name: String(u.name || u.id),
        is_active: true,
        is_owner: !!u.is_owner,
      },
    ];
  }

  /**
   * Sync snapshot of users. Kicks off a background fetch when needed.
   * Callers that need a re-render after load should subscribe or listen for `uc-ha-users-loaded`.
   */
  getUsers(hass: HomeAssistant | undefined): HaUserInfo[] {
    if (!hass) return [];

    // Invalidate when hass identity object changes (new connection / user)
    if (this._lastHassRef !== hass && this._users) {
      const prevId = (this._lastHassRef as any)?.user?.id;
      const nextId = (hass as any)?.user?.id;
      if (prevId !== nextId) {
        this._users = null;
        this._fallbackOnly = false;
      }
    }
    this._lastHassRef = hass;

    if (this._users) {
      return this._users;
    }

    const fallback = this._fromHassUser(hass);
    if (!this._loading) {
      void this._fetch(hass, fallback);
    }
    return fallback;
  }

  /** Whether the last successful result was only the current-user fallback. */
  isFallbackOnly(): boolean {
    return this._fallbackOnly;
  }

  private async _fetch(hass: HomeAssistant, fallback: HaUserInfo[]): Promise<void> {
    this._loading = true;
    try {
      const callWS = (hass as any).callWS;
      if (typeof callWS !== 'function') {
        this._users = fallback;
        this._fallbackOnly = true;
        this._notify();
        return;
      }
      const raw = await callWS({ type: 'config/auth/list' });
      const list = Array.isArray(raw) ? raw : Array.isArray(raw?.users) ? raw.users : [];
      const mapped: HaUserInfo[] = list
        .map((u: any) => ({
          id: String(u.id ?? ''),
          name: String(u.name || u.username || u.id || ''),
          is_active: u.is_active !== false,
          is_owner: !!u.is_owner,
        }))
        .filter((u: HaUserInfo) => !!u.id && u.is_active !== false);

      if (mapped.length > 0) {
        this._users = mapped;
        this._fallbackOnly = false;
      } else {
        this._users = fallback;
        this._fallbackOnly = true;
      }
      this._notify();
    } catch {
      this._users = fallback;
      this._fallbackOnly = true;
      this._notify();
    } finally {
      this._loading = false;
    }
  }

  /** Test / hard-reset helper. */
  clearCache(): void {
    this._users = null;
    this._loading = false;
    this._lastHassRef = null;
    this._fallbackOnly = false;
  }
}

export const ucHaUsersService = new UcHaUsersService();
