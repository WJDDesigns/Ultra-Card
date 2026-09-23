/**
 * Entry-side registration of the FreeSpace custom Lovelace view.
 *
 * Home Assistant resolves `type: custom:ultra-freespace-view` to the custom
 * element `ultra-freespace-view`, so the tag must exist as soon as the resource
 * loads. The Lit implementation lives in the `freespace` chunk and is fetched
 * on first use (same pattern as the Ultra Dashboard strategy shim).
 */

import { reportChunkLoadFailure } from '../utils/uc-chunk-load-error';
import {
  FREESPACE_ELEMENT_TAG,
  FREESPACE_IMPL_TAG,
  FREESPACE_VIEW_TYPE,
} from './types';

type FreeSpaceImplModule = typeof import('./uc-freespace-view-impl');

let loadPromise: Promise<FreeSpaceImplModule> | undefined;

export function loadUltraFreeSpaceView(): Promise<FreeSpaceImplModule> {
  if (!loadPromise) {
    loadPromise = import(
      /* webpackChunkName: "freespace" */ './uc-freespace-view-impl'
    ).catch(err => {
      loadPromise = undefined;
      reportChunkLoadFailure(err, 'FreeSpace view');
      throw err;
    });
  }
  return loadPromise;
}

/** Test-only: clear the memoized promise between tests. */
export function __resetUltraFreeSpaceViewLoaderForTests(): void {
  loadPromise = undefined;
}

/**
 * Thin host that HA talks to. Forwards LovelaceViewElement properties onto the
 * lazy-loaded Lit implementation once the chunk lands.
 */
export class UltraFreeSpaceView extends HTMLElement {
  private _impl: HTMLElement | null = null;
  private _pending = new Map<string, unknown>();
  private _config: unknown;
  private _resolveInitial: (() => void) | undefined;
  readonly initialRenderComplete: Promise<void>;

  constructor() {
    super();
    this.initialRenderComplete = new Promise<void>(resolve => {
      this._resolveInitial = resolve;
    });
  }

  connectedCallback(): void {
    void this._ensureImpl();
  }

  setConfig(config: unknown): void {
    this._config = config;
    this._forward('setConfig', config);
  }

  set hass(value: unknown) {
    this._pending.set('hass', value);
    this._applyProp('hass', value);
  }
  get hass(): unknown {
    return this._pending.get('hass');
  }

  set lovelace(value: unknown) {
    this._pending.set('lovelace', value);
    this._applyProp('lovelace', value);
  }
  get lovelace(): unknown {
    return this._pending.get('lovelace');
  }

  set index(value: number) {
    this._pending.set('index', value);
    this._applyProp('index', value);
  }
  get index(): number {
    return (this._pending.get('index') as number) ?? 0;
  }

  set narrow(value: boolean) {
    this._pending.set('narrow', value);
    this._applyProp('narrow', value);
  }
  get narrow(): boolean {
    return (this._pending.get('narrow') as boolean) ?? false;
  }

  set isStrategy(value: boolean) {
    this._pending.set('isStrategy', value);
    this._applyProp('isStrategy', value);
  }
  get isStrategy(): boolean {
    return (this._pending.get('isStrategy') as boolean) ?? false;
  }

  set cards(value: unknown[]) {
    this._pending.set('cards', value);
    this._applyProp('cards', value);
  }
  get cards(): unknown[] {
    return (this._pending.get('cards') as unknown[]) ?? [];
  }

  set badges(value: unknown[]) {
    this._pending.set('badges', value);
    this._applyProp('badges', value);
  }
  get badges(): unknown[] {
    return (this._pending.get('badges') as unknown[]) ?? [];
  }

  set sections(value: unknown[]) {
    this._pending.set('sections', value);
    this._applyProp('sections', value);
  }
  get sections(): unknown[] {
    return (this._pending.get('sections') as unknown[]) ?? [];
  }

  private _applyProp(name: string, value: unknown): void {
    if (!this._impl) return;
    (this._impl as any)[name] = value;
  }

  private _forward(method: string, arg: unknown): void {
    if (!this._impl) {
      this._pending.set(`__method:${method}`, arg);
      return;
    }
    const fn = (this._impl as any)[method];
    if (typeof fn === 'function') fn.call(this._impl, arg);
  }

  private async _ensureImpl(): Promise<void> {
    if (this._impl) return;
    try {
      await loadUltraFreeSpaceView();
    } catch {
      this._resolveInitial?.();
      this._resolveInitial = undefined;
      return;
    }
    if (this._impl) return;
    const impl = document.createElement(FREESPACE_IMPL_TAG);
    this._impl = impl;
    for (const [key, value] of this._pending) {
      if (key.startsWith('__method:')) continue;
      (impl as any)[key] = value;
    }
    if (this._config !== undefined) {
      (impl as any).setConfig?.(this._config);
    }
    this.appendChild(impl);
    // Wait a tick so Lit can render, then signal HA.
    await Promise.resolve();
    if (impl instanceof HTMLElement && 'updateComplete' in impl) {
      try {
        await (impl as any).updateComplete;
      } catch {
        // ignore
      }
    }
    this._resolveInitial?.();
    this._resolveInitial = undefined;
  }
}

export function registerUltraFreeSpaceView(): void {
  if (!customElements.get(FREESPACE_ELEMENT_TAG)) {
    customElements.define(FREESPACE_ELEMENT_TAG, UltraFreeSpaceView);
  }
}

export { FREESPACE_VIEW_TYPE, FREESPACE_ELEMENT_TAG };
