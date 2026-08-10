import { UcMaxWaitDebounce } from './uc-max-wait-debounce';

export const PREVIEW_UPDATE_EVENT = 'ultra-card-template-update';

/** Quiet period used for coalescing; many modules fire within one websocket tick. */
export const PREVIEW_UPDATE_WAIT_MS = 50;

/**
 * Longest an unbroken stream of callbacks may postpone the event.
 *
 * Chosen to stay well under a second so a stalled paint is never visible as stale
 * content, while still coalescing the common case of a burst arriving together.
 */
export const PREVIEW_UPDATE_MAX_WAIT_MS = 250;

export interface PreviewUpdateDetail {
  timestamp: number;
  source: string;
  /** Listeners must not debounce further — user gestures need a same-frame paint. */
  immediate?: boolean;
  moduleType?: string;
}

/**
 * Coalesces preview-update requests from every module into one event.
 *
 * This was a bare timer on `window`, which existed to keep a single debounce
 * across callers. Only this bundle ever touched it, so a module singleton does
 * the same job and carries the starvation guard with it.
 */
let latestDetail: PreviewUpdateDetail | null = null;

const scheduler = new UcMaxWaitDebounce(
  () => {
    const detail = latestDetail ?? { timestamp: Date.now(), source: 'unknown' };
    latestDetail = null;
    window.dispatchEvent(
      new CustomEvent<PreviewUpdateDetail>(PREVIEW_UPDATE_EVENT, {
        bubbles: true,
        composed: true,
        detail,
      })
    );
  },
  { wait: PREVIEW_UPDATE_WAIT_MS, maxWait: PREVIEW_UPDATE_MAX_WAIT_MS }
);

/**
 * Ask every card and open preview to repaint.
 *
 * Requests are coalesced, and the last caller's detail wins, so a burst that ends
 * with an `immediate` request is delivered as immediate.
 */
export function requestPreviewUpdate(detail: Omit<PreviewUpdateDetail, 'timestamp'>): void {
  latestDetail = { ...detail, timestamp: Date.now() };
  if (detail.immediate) scheduler.scheduleNow();
  else scheduler.schedule();
}

/** Test seam: drop anything pending so cases cannot leak into one another. */
export function resetPreviewUpdateScheduler(): void {
  latestDetail = null;
  scheduler.cancel();
}
