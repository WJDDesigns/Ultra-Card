/**
 * Lazy handles for services that drag three.js into whatever imports them.
 *
 * `ultra-card.ts` used to import these statically, which put ~600 KB of
 * minified three.js into ultra-card.js for every dashboard, even ones with no
 * weather or living-canvas module. Now the chunk is fetched only when a card
 * containing such a module is connected.
 */
import { createLazyService, type LazyService } from './uc-lazy-service';

type DynamicWeatherServiceApi = Pick<
  typeof import('./uc-dynamic-weather-service').ucDynamicWeatherService,
  'registerModule' | 'unregisterModule'
>;

type NavigationServiceApi = Pick<
  typeof import('./uc-navigation-service').ucNavigationService,
  'registerModule' | 'unregisterModule'
>;

type VideoBgServiceApi = Pick<
  typeof import('./uc-video-bg-service').ucVideoBgService,
  'registerModule' | 'unregisterModule'
>;

type BackgroundServiceApi = Pick<
  typeof import('./uc-background-service').ucBackgroundService,
  'registerModule' | 'unregisterModule'
>;

type LivingCanvasServiceApi = Pick<
  typeof import('./uc-living-canvas-service').ucLivingCanvasService,
  'registerModule' | 'unregisterModule'
>;

export const lazyDynamicWeatherService: LazyService<DynamicWeatherServiceApi> = createLazyService(
  () =>
    import(/* webpackChunkName: "svc-dynamic-weather" */ './uc-dynamic-weather-service').then(
      m => m.ucDynamicWeatherService
    ),
  'dynamic weather service'
);

/** Not three.js, but ~70 KB minified that only navigation-module cards need. */
export const lazyNavigationService: LazyService<NavigationServiceApi> = createLazyService(() =>
  import(/* webpackChunkName: "svc-navigation" */ './uc-navigation-service').then(
    m => m.ucNavigationService
  ),
  'navigation service'
);

export const lazyLivingCanvasService: LazyService<LivingCanvasServiceApi> = createLazyService(() =>
  import(/* webpackChunkName: "svc-living-canvas" */ './uc-living-canvas-service').then(
    m => m.ucLivingCanvasService
  ),
  'living canvas service'
);

/** Only cards with a video background module need it (~18 KB minified source). */
export const lazyVideoBgService: LazyService<VideoBgServiceApi> = createLazyService(() =>
  import(/* webpackChunkName: "svc-video-bg" */ './uc-video-bg-service').then(
    m => m.ucVideoBgService
  ),
  'video background service'
);

/** Only cards with a background module need it. */
export const lazyBackgroundService: LazyService<BackgroundServiceApi> = createLazyService(() =>
  import(/* webpackChunkName: "svc-background" */ './uc-background-service').then(
    m => m.ucBackgroundService
  ),
  'background service'
);
