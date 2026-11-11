import { describe, it, expect, afterEach } from 'vitest';
import { liftStackingContexts, UC_LIFT_Z_INDEX } from './uc-stacking-lift';

describe('liftStackingContexts', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('raises stacking-context ancestors across shadow roots and restores them', () => {
    const view = document.createElement('hui-masonry-view');
    view.style.isolation = 'isolate';
    const card = document.createElement('div');
    card.style.isolation = 'isolate'; // stands in for container-type on the card host
    const plain = document.createElement('div');
    const host = document.createElement('div');
    host.style.isolation = 'isolate';
    host.style.position = 'relative';
    host.style.zIndex = '1';
    const shadow = host.attachShadow({ mode: 'open' });
    const panel = document.createElement('div');
    shadow.appendChild(panel);
    plain.appendChild(host);
    card.appendChild(plain);
    view.appendChild(card);
    document.body.appendChild(view);

    const release = liftStackingContexts(panel);

    expect(host.style.zIndex).toBe(String(UC_LIFT_Z_INDEX));
    expect(card.style.zIndex).toBe(String(UC_LIFT_Z_INDEX));
    expect(card.style.position).toBe('relative');
    // Not a stacking context: left alone.
    expect(plain.style.zIndex).toBe('');
    // The view is the boundary and is never touched.
    expect(view.style.zIndex).toBe('');

    release();
    expect(host.style.zIndex).toBe('1');
    expect(host.style.position).toBe('relative');
    expect(card.style.zIndex).toBe('');
    expect(card.style.position).toBe('');
  });

  it('keeps a shared ancestor lifted until every overlay releases it', () => {
    const card = document.createElement('div');
    card.style.isolation = 'isolate';
    const a = document.createElement('div');
    const b = document.createElement('div');
    card.append(a, b);
    document.body.appendChild(card);

    const releaseA = liftStackingContexts(a);
    const releaseB = liftStackingContexts(b);
    releaseA();
    expect(card.style.zIndex).toBe(String(UC_LIFT_Z_INDEX));
    releaseB();
    expect(card.style.zIndex).toBe('');
    // Releasing twice is harmless.
    releaseB();
    expect(card.style.zIndex).toBe('');
  });

  it('does not lower an ancestor that already sits higher', () => {
    const card = document.createElement('div');
    card.style.position = 'relative';
    card.style.zIndex = '10';
    const panel = document.createElement('div');
    card.appendChild(panel);
    document.body.appendChild(card);

    const release = liftStackingContexts(panel);
    expect(card.style.zIndex).toBe('10');
    release();
    expect(card.style.zIndex).toBe('10');
  });
});
