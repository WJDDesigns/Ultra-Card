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

const STORE_KEY = '__ultraTimerStore__';

function getStore(): Map<string, TimerState> {
  const w = window as unknown as Record<string, Map<string, TimerState>>;
  if (!w[STORE_KEY]) {
    w[STORE_KEY] = new Map<string, TimerState>();
  }
  return w[STORE_KEY];
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
};
