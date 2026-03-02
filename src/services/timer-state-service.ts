/**
 * Global store for timer module state (idle / running / paused / expired).
 * Survives re-renders and preview updates; keyed by module id.
 */

export type TimerStatus = 'idle' | 'running' | 'paused' | 'expired';

export interface TimerState {
  status: TimerStatus;
  remaining_seconds: number;
  end_time?: number; // timestamp when timer will reach 0 (for running)
  interval_id?: ReturnType<typeof setInterval>;
  on_expire?: () => void;
}

/** Tracks the last HA entity state we synced from, to avoid redundant re-syncs. */
interface EntitySyncRecord {
  haState: string;
  lastChanged: string;
}

const STORE_KEY = '__ultraTimerStore__';
const ENTITY_SYNC_KEY = '__ultraTimerEntitySync__';

function getStore(): Map<string, TimerState> {
  const w = window as unknown as Record<string, Map<string, TimerState>>;
  if (!w[STORE_KEY]) {
    w[STORE_KEY] = new Map<string, TimerState>();
  }
  return w[STORE_KEY];
}

function getEntitySyncStore(): Map<string, EntitySyncRecord> {
  const w = window as unknown as Record<string, Map<string, EntitySyncRecord>>;
  if (!w[ENTITY_SYNC_KEY]) {
    w[ENTITY_SYNC_KEY] = new Map<string, EntitySyncRecord>();
  }
  return w[ENTITY_SYNC_KEY];
}

function dispatchUpdate(): void {
  window.dispatchEvent(
    new CustomEvent('ultra-card-template-update', { bubbles: true, composed: true })
  );
}

function tick(moduleId: string): void {
  const store = getStore();
  const state = store.get(moduleId);
  if (!state || state.status !== 'running') return;

  state.remaining_seconds = Math.max(0, state.remaining_seconds - 1);
  dispatchUpdate();

  if (state.remaining_seconds <= 0) {
    if (state.interval_id) {
      clearInterval(state.interval_id);
      state.interval_id = undefined;
    }
    state.status = 'expired';
    const onExpire = state.on_expire;
    state.on_expire = undefined; // clear to avoid retain
    if (onExpire) onExpire();
    dispatchUpdate();
  }
}

export const timerStateService = {
  getState(moduleId: string): TimerState | undefined {
    return getStore().get(moduleId);
  },

  start(
    moduleId: string,
    durationSeconds: number,
    onExpire?: () => void
  ): void {
    const store = getStore();
    const existing = store.get(moduleId);
    if (existing?.interval_id) clearInterval(existing.interval_id);

    const state: TimerState = {
      status: 'running',
      remaining_seconds: durationSeconds,
      end_time: Date.now() + durationSeconds * 1000,
      on_expire: onExpire,
    };
    state.interval_id = setInterval(() => tick(moduleId), 1000);
    store.set(moduleId, state);
    dispatchUpdate();
  },

  pause(moduleId: string): void {
    const store = getStore();
    const state = store.get(moduleId);
    if (!state || state.status !== 'running') return;
    if (state.interval_id) {
      clearInterval(state.interval_id);
      state.interval_id = undefined;
    }
    state.status = 'paused';
    state.end_time = undefined;
    dispatchUpdate();
  },

  resume(moduleId: string): void {
    const store = getStore();
    const state = store.get(moduleId);
    if (!state || state.status !== 'paused') return;
    state.status = 'running';
    state.end_time = Date.now() + state.remaining_seconds * 1000;
    state.interval_id = setInterval(() => tick(moduleId), 1000);
    dispatchUpdate();
  },

  reset(moduleId: string): void {
    const store = getStore();
    const state = store.get(moduleId);
    if (state?.interval_id) clearInterval(state.interval_id);
    store.delete(moduleId);
    dispatchUpdate();
  },

  dismiss(moduleId: string): void {
    this.reset(moduleId);
  },

  snooze(moduleId: string, durationSeconds: number): void {
    const store = getStore();
    const state = store.get(moduleId);
    const onExpire = state?.on_expire;
    if (state?.interval_id) clearInterval(state.interval_id);
    this.start(moduleId, durationSeconds, onExpire);
  },

  /**
   * Syncs local timer state from a linked HA timer entity.
   * Only acts when the entity's state or last_changed timestamp actually changes,
   * so it is safe to call on every render cycle without causing interval churn.
   *
   * @param moduleId       The UC module id (store key)
   * @param haState        HA entity state string: 'active' | 'paused' | 'idle'
   * @param remainingSeconds  Pre-computed remaining seconds (use timerTimeRemaining() for active)
   * @param lastChanged    HA entity last_changed ISO string (change detector)
   * @param onExpire       Optional callback to run when local countdown hits zero
   */
  syncFromEntity(
    moduleId: string,
    haState: string,
    remainingSeconds: number,
    lastChanged: string,
    onExpire?: () => void
  ): void {
    const syncStore = getEntitySyncStore();
    const last = syncStore.get(moduleId);

    // Skip if nothing has changed on the HA side
    if (last && last.haState === haState && last.lastChanged === lastChanged) {
      return;
    }

    // Record the new HA state so we don't re-process it
    syncStore.set(moduleId, { haState, lastChanged });

    const store = getStore();
    const current = store.get(moduleId);

    if (haState === 'active') {
      // Clear any existing interval before starting fresh
      if (current?.interval_id) clearInterval(current.interval_id);
      const rounded = Math.round(remainingSeconds);
      const state: TimerState = {
        status: 'running',
        remaining_seconds: rounded,
        end_time: Date.now() + rounded * 1000,
        on_expire: onExpire,
      };
      state.interval_id = setInterval(() => tick(moduleId), 1000);
      store.set(moduleId, state);
      dispatchUpdate();
    } else if (haState === 'paused') {
      if (current?.interval_id) clearInterval(current.interval_id);
      const state: TimerState = {
        status: 'paused',
        remaining_seconds: Math.round(remainingSeconds),
        on_expire: current?.on_expire ?? onExpire,
      };
      store.set(moduleId, state);
      dispatchUpdate();
    } else {
      // idle (or unavailable/unknown) — reset only if we were in an active state
      if (current && current.status !== 'idle') {
        if (current.interval_id) clearInterval(current.interval_id);
        store.delete(moduleId);
        dispatchUpdate();
      }
    }
  },
};
