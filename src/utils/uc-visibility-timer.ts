/**
 * Timers that stand down while the tab is hidden.
 *
 * Browsers throttle background timers but still pay the full cost of whatever
 * the callback does, so a 1s re-render tick keeps doing layout work on a
 * sleeping wall tablet. These wrappers skip the work entirely while hidden and
 * run a single catch-up pass on the way back, so the UI is correct the moment
 * the user looks at it.
 */

export interface UcVisibilityTimer {
  /** Cancel the timer and detach its visibility listener. */
  stop(): void;
}

function isHidden(): boolean {
  return typeof document !== 'undefined' && document.hidden;
}

function onBecameVisible(run: () => void): () => void {
  if (typeof document === 'undefined') return () => {};
  const handler = (): void => {
    if (!document.hidden) run();
  };
  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
}

/**
 * `setInterval` that skips ticks while the tab is hidden. If any tick was
 * skipped, the callback runs once as soon as the tab is visible again so the
 * display never shows stale data.
 */
export function setVisibleInterval(callback: () => void, intervalMs: number): UcVisibilityTimer {
  let missedTick = false;

  const timer = setInterval(() => {
    if (isHidden()) {
      missedTick = true;
      return;
    }
    callback();
  }, intervalMs);

  const detach = onBecameVisible(() => {
    if (!missedTick) return;
    missedTick = false;
    callback();
  });

  return {
    stop(): void {
      clearInterval(timer);
      detach();
    },
  };
}

/**
 * `setTimeout` that defers rather than drops: if the tab is hidden when the
 * delay elapses, the callback is held until the tab is shown again. Callers
 * that re-arm the timer on each render therefore pause cleanly in the
 * background and resume on the first visible frame.
 */
export function setVisibleTimeout(callback: () => void, delayMs: number): UcVisibilityTimer {
  let detach: () => void = () => {};
  let settled = false;

  const fire = (): void => {
    if (settled) return;
    settled = true;
    detach();
    callback();
  };

  const timer = setTimeout(() => {
    if (isHidden()) {
      detach = onBecameVisible(fire);
      return;
    }
    fire();
  }, delayMs);

  return {
    stop(): void {
      settled = true;
      clearTimeout(timer);
      detach();
    },
  };
}
