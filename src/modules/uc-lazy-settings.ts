import { html, TemplateResult } from 'lit';
import { until } from 'lit/directives/until.js';
import { reportChunkLoadFailure } from '../utils/uc-chunk-load-error';

/**
 * Settings UI for the modules that ship inside `ultra-card.js` (text, icon,
 * bar, ...) lives in a separate chunk so a dashboard never downloads editor
 * code. The module file keeps its preview and delegates each settings tab here.
 *
 * The first call kicks off the import and renders a placeholder through Lit's
 * `until()`, which swaps in the real tab when the chunk lands. Every call after
 * that is synchronous, so a settings panel that is already open re-renders
 * without flicker as the user edits.
 */
export type LazySettings<S> = {
  <R>(render: (settings: S) => R): R | TemplateResult;
  /** Start the fetch without rendering (e.g. when the editor opens). */
  prefetch(): Promise<void>;
  /** True once the chunk is in memory. */
  isLoaded(): boolean;
};

export function createLazySettings<S>(importer: () => Promise<S>, name: string): LazySettings<S> {
  let loaded: S | undefined;
  let inflight: Promise<S> | undefined;
  let error: unknown;

  const load = (): Promise<S> => {
    if (loaded) return Promise.resolve(loaded);
    if (!inflight) {
      inflight = importer()
        .then(mod => {
          loaded = mod;
          return mod;
        })
        .catch(err => {
          inflight = undefined;
          error = err;
          reportChunkLoadFailure(err, name);
          throw err;
        });
    }
    return inflight;
  };

  const fn = (<R>(render: (settings: S) => R): R | TemplateResult => {
    if (loaded) return render(loaded);
    // A previous attempt failed; try again on the next render but tell the user
    // what happened rather than showing a placeholder forever.
    const attempt = load().then(
      mod => render(mod),
      () => renderFailed()
    );
    return html`${until(attempt, error ? renderFailed() : renderPlaceholder())}`;
  }) as LazySettings<S>;

  fn.prefetch = () =>
    load().then(
      () => undefined,
      () => undefined
    );
  fn.isLoaded = () => !!loaded;
  return fn;
}

type AnyClass = abstract new (...args: never[]) => object;

/**
 * Copy the settings subclass's own methods onto the module class prototype.
 *
 * The moved settings code is written as a subclass so it type-checks against
 * the module's protected helpers, but at runtime it runs with the *module*
 * instance as `this` (the subclass is never instantiated). Private helpers that
 * moved along with it (`_addIcon`, `_renderFieldWithLock`, ...) therefore have
 * to be reachable from the module's prototype chain; this installs them once,
 * when the chunk loads. Anything the module already defines is left alone.
 */
export function installSettingsMethods(host: AnyClass, settings: AnyClass): void {
  const hostProto = host.prototype as Record<string, unknown>;
  const settingsProto = settings.prototype as Record<string, unknown>;
  for (const key of Object.getOwnPropertyNames(settingsProto)) {
    if (key === 'constructor') continue;
    if (Object.prototype.hasOwnProperty.call(hostProto, key)) continue;
    const descriptor = Object.getOwnPropertyDescriptor(settingsProto, key);
    if (descriptor) Object.defineProperty(hostProto, key, descriptor);
  }
}

function renderPlaceholder(): TemplateResult {
  return html`
    <div class="uc-settings-loading" aria-busy="true" style="padding: 8px 0;">
      ${[70, 100, 55].map(
        w => html`
          <div
            style="height: 14px; width: ${w}%; margin: 12px 0; border-radius: calc(6px * var(--uc-radius-scale, 1)); background: var(--divider-color, rgba(127,127,127,0.25)); opacity: 0.6;"
          ></div>
        `
      )}
    </div>
  `;
}

function renderFailed(): TemplateResult {
  return html`
    <div
      class="uc-settings-failed"
      style="padding: 12px; border-radius: calc(8px * var(--uc-radius-scale, 1)); background: var(--error-color, #db4437); color: #fff; font-size: 13px;"
    >
      Settings could not be loaded. Reload the page and try again.
    </div>
  `;
}
