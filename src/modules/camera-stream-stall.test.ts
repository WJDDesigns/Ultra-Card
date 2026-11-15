import { describe, it, expect } from 'vitest';
import { streamStallVerdict, findStreamVideo } from './camera-module';

const vid = (currentTime: number, paused = false, controls = false) =>
  ({ currentTime, paused, controls }) as any;

describe('camera live stream stall watchdog', () => {
  it('rebuilds a stream whose picture stopped moving for the limit', () => {
    const v = vid(12);
    let t = streamStallVerdict({}, v, 0, false, 30_000);
    expect(t.rebuild).toBe(false);
    t = streamStallVerdict(t, v, 10_000, false, 30_000);
    expect(t.rebuild).toBe(false);
    t = streamStallVerdict(t, v, 30_000, false, 30_000);
    expect(t.rebuild).toBe(true);
  });

  it('keeps a moving stream and reports progress', () => {
    const v = vid(1);
    let t = streamStallVerdict({}, v, 0, false, 30_000);
    v.currentTime = 11;
    t = streamStallVerdict(t, v, 10_000, false, 30_000);
    expect(t.progressed).toBe(true);
    v.currentTime = 21;
    t = streamStallVerdict(t, v, 40_000, false, 30_000);
    expect(t.rebuild).toBe(false);
  });

  it('ignores hidden pages, user-paused videos and players without video', () => {
    const v = vid(5);
    const t = streamStallVerdict({}, v, 0, false, 30_000);
    expect(streamStallVerdict(t, v, 60_000, true, 30_000).rebuild).toBe(false);
    const paused = vid(5, true, true);
    expect(
      streamStallVerdict({ video: paused, lastTime: 5, since: 0 }, paused, 60_000, false).rebuild
    ).toBe(false);
    expect(streamStallVerdict(t, undefined, 60_000, false, 30_000).rebuild).toBe(false);
  });

  it('restarts the clock when the player swaps its video element', () => {
    const a = vid(5);
    const b = vid(5);
    let t = streamStallVerdict({}, a, 0, false, 30_000);
    t = streamStallVerdict(t, b, 40_000, false, 30_000);
    expect(t.rebuild).toBe(false);
  });

  it('finds the video inside nested player shadow roots', () => {
    const stream = document.createElement('ha-camera-stream');
    const sr = stream.attachShadow({ mode: 'open' });
    const hls = document.createElement('ha-hls-player');
    sr.appendChild(hls);
    const sr2 = hls.attachShadow({ mode: 'open' });
    const video = document.createElement('video');
    sr2.appendChild(video);
    expect(findStreamVideo(stream)).toBe(video);
    expect(findStreamVideo(document.createElement('ha-camera-stream'))).toBeUndefined();
  });
});
