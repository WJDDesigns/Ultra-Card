import { afterEach, describe, expect, it, vi } from 'vitest';
import { addPinchZoomToCamera } from './uc-camera-fullscreen';

describe('addPinchZoomToCamera', () => {
  afterEach(() => vi.restoreAllMocks());

  type ListenerCall = [type: string, listener: unknown, options?: unknown];
  const dragListeners = (calls: unknown[][]): ListenerCall[] =>
    (calls as ListenerCall[]).filter(([type]) => type === 'mousemove' || type === 'mouseup');

  it('binds its document drag listeners to the viewer signal', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const viewer = new AbortController();

    addPinchZoomToCamera(
      document.createElement('img'),
      document.createElement('div'),
      viewer.signal
    );

    const calls = dragListeners(add.mock.calls);
    expect(calls.map(([type]) => type).sort()).toEqual(['mousemove', 'mouseup']);
    for (const [, , options] of calls) {
      expect((options as AddEventListenerOptions).signal).toBe(viewer.signal);
    }
  });

  it('stops reacting to mouse moves once the viewer is closed', () => {
    const camera = document.createElement('img');
    const container = document.createElement('div');
    container.appendChild(camera);
    document.body.appendChild(container);
    const viewer = new AbortController();
    addPinchZoomToCamera(camera, container, viewer.signal);

    // Zoom in so dragging is active, then start a drag. The drag handler
    // calls preventDefault() on every move it handles.
    camera.dispatchEvent(
      new WheelEvent('wheel', { deltaY: -500, bubbles: true, cancelable: true })
    );
    camera.dispatchEvent(new MouseEvent('mousedown', { clientX: 10, clientY: 10, bubbles: true }));
    const move = () => new MouseEvent('mousemove', { clientX: 40, clientY: 40, cancelable: true });

    const whileOpen = move();
    document.dispatchEvent(whileOpen);
    expect(whileOpen.defaultPrevented).toBe(true);

    viewer.abort();
    const afterClose = move();
    document.dispatchEvent(afterClose);
    expect(afterClose.defaultPrevented).toBe(false);

    container.remove();
  });
});
