/**
 * Global store for timer module state (idle / running / paused / expired).
 * Survives re-renders and preview updates; keyed by module id.
 */

export type TimerStatus = 'idle' | 'running' | 'paused' | 'expired';

export interface TimerState {
  status: TimerStatus;
  remaining_seconds: number;
  /** Total seconds the timer was started with (basis for progress calculation) */
  total_seconds?: number | undefined;
  end_time?: number | undefined; // timestamp when timer will reach 0 (for running)
  interval_id?: ReturnType<typeof setInterval> | undefined;
  on_expire?: (() => void) | undefined;
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

/**
 * Creates the 1-second tick interval for a timer.
 * The interval self-cleans when its timer state has been removed or replaced,
 * so orphaned intervals (e.g. after module removal) stop themselves.
 */
function startTickInterval(moduleId: string): ReturnType<typeof setInterval> {
  const intervalId = setInterval(() => {
    const state = getStore().get(moduleId);
    if (!state || state.interval_id !== intervalId) {
      clearInterval(intervalId);
      return;
    }
    tick(moduleId);
  }, 1000);
  return intervalId;
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
      total_seconds: durationSeconds,
      end_time: Date.now() + durationSeconds * 1000,
      on_expire: onExpire,
    };
    state.interval_id = startTickInterval(moduleId);
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
    state.interval_id = startTickInterval(moduleId);
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

  /**
   * Fully tears down a timer: clears its interval and removes all stored state
   * (including the entity-sync record). Idempotent — safe to call for unknown ids.
   * Call when a timer module is removed so no orphaned interval keeps running.
   */
  destroyTimer(moduleId: string): void {
    const store = getStore();
    const state = store.get(moduleId);
    if (state?.interval_id) {
      clearInterval(state.interval_id);
      state.interval_id = undefined;
    }
    store.delete(moduleId);
    getEntitySyncStore().delete(moduleId);
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
   * @param totalSeconds   Optional full duration of the HA timer (basis for progress)
   */
  syncFromEntity(
    moduleId: string,
    haState: string,
    remainingSeconds: number,
    lastChanged: string,
    onExpire?: () => void,
    totalSeconds?: number
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
        total_seconds: totalSeconds !== undefined ? Math.round(totalSeconds) : current?.total_seconds,
        end_time: Date.now() + rounded * 1000,
        on_expire: onExpire,
      };
      state.interval_id = startTickInterval(moduleId);
      store.set(moduleId, state);
      dispatchUpdate();
    } else if (haState === 'paused') {
      if (current?.interval_id) clearInterval(current.interval_id);
      const state: TimerState = {
        status: 'paused',
        remaining_seconds: Math.round(remainingSeconds),
        total_seconds: totalSeconds !== undefined ? Math.round(totalSeconds) : current?.total_seconds,
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
