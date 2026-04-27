import { HomeAssistant } from 'custom-card-helpers';

/**
 * Extended HomeAssistant interface for todo item cache (parallel to __uvc_template_strings).
 */
declare module 'custom-card-helpers' {
  interface HomeAssistant {
    __uvc_todo_cache?: { [entityId: string]: TodoItem[] } | undefined;
  }
}

/** Single to-do item from todo.get_items response (summary, status, due, description, uid). */
export interface TodoItem {
  summary: string;
  status: 'needs_action' | 'completed';
  due?: string | undefined;
  description?: string | undefined;
  uid?: string | undefined;
}

/** Response from todo.get_items when called with return_response. Keyed by entity_id. */
interface TodoGetItemsResponse {
  [entityId: string]: { items: TodoItem[] };
}

const CACHE_KEY = '__uvc_todo_cache';

/**
 * Fetches to-do items via todo.get_items (requires return_response).
 * Caches results in hass.__uvc_todo_cache and subscribes to state_changed
 * for the entity so the cache is refreshed when the list changes.
 */
export class UltraCardTodoService {
  private _unsubByEntity: Map<string, () => void> = new Map();
  private _callbacksByEntity: Map<string, Set<() => void>> = new Map();

  /**
   * Get items for a todo entity. Uses cache when available; otherwise calls
   * todo.get_items with return_response and caches. Subscribes to state_changed
   * for the entity and calls onUpdate when the list changes.
   */
  async getItems(
    hass: HomeAssistant,
    entityId: string,
    onUpdate?: () => void
  ): Promise<TodoItem[]> {
    if (!hass || !entityId) return [];

    if (!(hass as any)[CACHE_KEY]) {
      (hass as any)[CACHE_KEY] = Object.create(null);
    }
    const cache = (hass as any)[CACHE_KEY] as { [entityId: string]: TodoItem[] };

    const registerCallback = () => {
      if (onUpdate) {
        let set = this._callbacksByEntity.get(entityId);
        if (!set) {
          set = new Set();
          this._callbacksByEntity.set(entityId, set);
        }
        set.add(onUpdate);
      }
    };

    const notifyCallbacks = () => {
      const set = this._callbacksByEntity.get(entityId);
      if (set) set.forEach((cb) => { try { cb(); } catch (e) { /* ignore */ } });
    };

    const fetchAndCache = async (): Promise<TodoItem[]> => {
      try {
        const result = await (hass as any).callService(
          'todo',
          'get_items',
          { entity_id: entityId },
          undefined,
          true,
          true
        );
        const response = result?.response ?? {};
        let items: TodoItem[] = [];
        const entry = response[entityId];
        if (Array.isArray(entry?.items)) {
          items = entry.items;
        } else if (Array.isArray((entry as any)?.todo_items)) {
          items = (entry as any).todo_items;
        } else if (Array.isArray(entry)) {
          items = entry as TodoItem[];
        } else if (Array.isArray(response)) {
          items = response as TodoItem[];
        } else if (typeof response === 'object' && response !== null) {
          const firstKey = Object.keys(response).find((k) => k.startsWith('todo.'));
          const first = firstKey ? (response as any)[firstKey] : undefined;
          if (Array.isArray(first?.items)) items = first.items;
          else if (Array.isArray((first as any)?.todo_items)) items = (first as any).todo_items;
          else if (Array.isArray(first)) items = first as TodoItem[];
        }
        if (items.length === 0 && (entry || response && Object.keys(response).length > 0)) {
          console.warn('[UltraCard] todo.get_items: unexpected response shape', { entityId, responseKeys: Object.keys(response), entry: entry ? Object.keys(entry as object) : null });
        }
        cache[entityId] = items;
        return items;
      } catch (err) {
        console.warn('[UltraCard] todo.get_items failed for', entityId, err);
        cache[entityId] = [];
        return [];
      }
    };

    if (cache[entityId] !== undefined) {
      registerCallback();
      this._ensureSubscription(hass, entityId, fetchAndCache, notifyCallbacks);
      return cache[entityId];
    }

    const items = await fetchAndCache();
    registerCallback();
    this._ensureSubscription(hass, entityId, fetchAndCache, notifyCallbacks);
    return items;
  }

  private _ensureSubscription(
    hass: HomeAssistant,
    entityId: string,
    fetchAndCache: () => Promise<TodoItem[]>,
    notifyCallbacks: () => void
  ): void {
    if (this._unsubByEntity.has(entityId)) return;
    const connection = (hass as any).connection;
    if (!connection?.subscribeEvents) return;

    connection.subscribeEvents((ev: { data: { entity_id: string } }) => {
      if (ev?.data?.entity_id !== entityId) return;
      fetchAndCache().then(() => notifyCallbacks());
    }, 'state_changed').then((unsub: () => void) => {
      this._unsubByEntity.set(entityId, unsub);
    }).catch(() => { /* ignore */ });
  }

  /**
   * Unsubscribe from state changes for an entity (e.g. when module is removed).
   * Optional; subscriptions are per-entity and low cost.
   */
  unsubscribeEntity(entityId: string): void {
    const unsub = this._unsubByEntity.get(entityId);
    if (unsub) {
      try { unsub(); } catch { /* ignore */ }
      this._unsubByEntity.delete(entityId);
    }
    this._callbacksByEntity.delete(entityId);
  }
}
