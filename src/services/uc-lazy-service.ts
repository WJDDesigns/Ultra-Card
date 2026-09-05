/**
 * Wrap a singleton service that lives in its own webpack chunk.
 *
 * Used for services whose dependency graph is heavy (three.js, CodeMirror) but
 * which only matter when a card actually contains the related module. The host
 * card calls `load()` when such a module is present, and `peek()` on teardown
 * paths where "never loaded" simply means "nothing to clean up".
 */
export interface LazyService<T> {
  /** Start (or join) the chunk load. Rejections reset state so a later call retries. */
  load(): Promise<T>;
  /** The service if its chunk has finished loading, otherwise undefined. */
  peek(): T | undefined;
}

export function createLazyService<T>(importer: () => Promise<T>): LazyService<T> {
  let instance: T | undefined;
  let inflight: Promise<T> | undefined;

  return {
    load() {
      if (instance !== undefined) return Promise.resolve(instance);
      if (!inflight) {
        inflight = importer()
          .then(svc => {
            instance = svc;
            return svc;
          })
          .catch(err => {
            inflight = undefined;
            throw err;
          });
      }
      return inflight;
    },
    peek() {
      return instance;
    },
  };
}
