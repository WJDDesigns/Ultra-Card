import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  PREVIEW_UPDATE_EVENT,
  requestPreviewUpdate,
  resetPreviewUpdateScheduler,
  type PreviewUpdateDetail,
} from './uc-preview-update';

describe('requestPreviewUpdate', () => {
  let events: PreviewUpdateDetail[];
  const listener = (e: Event) => events.push((e as CustomEvent<PreviewUpdateDetail>).detail);

  beforeEach(() => {
    vi.useFakeTimers();
    events = [];
    window.addEventListener(PREVIEW_UPDATE_EVENT, listener);
  });

  afterEach(() => {
    window.removeEventListener(PREVIEW_UPDATE_EVENT, listener);
    resetPreviewUpdateScheduler();
    vi.useRealTimers();
  });

  it('coalesces a burst from several modules into one event', () => {
    requestPreviewUpdate({ source: 'module-update' });
    requestPreviewUpdate({ source: 'module-update' });
    requestPreviewUpdate({ source: 'global-actions' });
    expect(events).toHaveLength(0);

    vi.advanceTimersByTime(50);
    expect(events).toHaveLength(1);
    // Last caller wins, so the event describes the most recent request.
    expect(events[0]?.source).toBe('global-actions');
  });

  it('still fires while callbacks keep arriving', () => {
    // The failure this guards against: a template callback every 10ms rearmed the
    // 50ms debounce forever, so the card never repainted until the stream paused.
    for (let elapsed = 0; elapsed < 600; elapsed += 10) {
      requestPreviewUpdate({ source: 'module-update' });
      vi.advanceTimersByTime(10);
    }

    expect(events.length).toBeGreaterThanOrEqual(2);
  });

  it('marks an immediate request so listeners skip their own debounce', () => {
    requestPreviewUpdate({ source: 'module-update', immediate: true });
    vi.advanceTimersByTime(0);

    expect(events).toHaveLength(1);
    expect(events[0]?.immediate).toBe(true);
  });

  it('lets an immediate request overtake a pending debounced one', () => {
    requestPreviewUpdate({ source: 'module-update' });
    requestPreviewUpdate({ source: 'module-update', immediate: true });

    vi.advanceTimersByTime(0);
    expect(events).toHaveLength(1);
    expect(events[0]?.immediate).toBe(true);

    // The overtaken request must not also fire once its original delay elapses.
    vi.advanceTimersByTime(100);
    expect(events).toHaveLength(1);
  });

  it('carries a timestamp and passes moduleType through for external-card filtering', () => {
    requestPreviewUpdate({ source: 'module-update', moduleType: 'external_card' });
    vi.advanceTimersByTime(50);

    expect(events[0]?.moduleType).toBe('external_card');
    expect(typeof events[0]?.timestamp).toBe('number');
  });
});
