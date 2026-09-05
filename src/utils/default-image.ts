/**
 * The bundled default image is a ~180 KB base64 JPEG. It used to be a static
 * import reachable from ultra-card.js, so every dashboard paid for it even
 * though it only shows when an image module is left on "default". It now lives
 * in its own chunk and is fetched the first time something renders it.
 */
const TRANSPARENT_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

let cached: string | undefined;
let inflight: Promise<string> | undefined;

export function loadDefaultImage(): Promise<string> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = import(/* webpackChunkName: "default-image" */ './image-base64')
      .then(m => (cached = m.DEFAULT_VEHICLE_IMAGE_BASE64))
      .catch(err => {
        inflight = undefined;
        throw err;
      });
  }
  return inflight;
}

/**
 * Data URL when already loaded, otherwise a promise for it. Render with lit's
 * `until(defaultImageSrc(), DEFAULT_IMAGE_PLACEHOLDER)` so the `<img>` swaps in
 * place once the chunk arrives.
 */
export function defaultImageSrc(): string | Promise<string> {
  return cached ?? loadDefaultImage();
}

export const DEFAULT_IMAGE_PLACEHOLDER = TRANSPARENT_PIXEL;
