/// <reference lib="webworker" />

import {
  WeatherEffectsCore,
  WeatherEffectsCoreOptions,
  WeatherEffectsCoreResizeOptions,
} from '../utils/weather-effects-core';
import {
  WeatherWorkerEffectOptions,
  WeatherWorkerMessage,
  WeatherWorkerResponse,
} from '../utils/weather-worker-messages';

declare const self: DedicatedWorkerGlobalScope;
export {};

let core: WeatherEffectsCore | null = null;

self.addEventListener('message', (event: MessageEvent<WeatherWorkerMessage>) => {
  const data = event.data;

  switch (data.type) {
    case 'INIT':
      initializeCore(data);
      break;
    case 'START':
      core?.start(data.effect, data.opacity, data.options || {});
      break;
    case 'SET_OPACITY':
      core?.setOpacity(data.opacity);
      break;
    case 'RESIZE':
      if (core) {
        const resizePayload: WeatherEffectsCoreResizeOptions = {
          viewportWidth: data.viewportWidth,
          viewportHeight: data.viewportHeight,
          devicePixelRatio: data.devicePixelRatio,
          isMobile: data.isMobile,
        };
        core.resize(resizePayload);
      }
      break;
    case 'SET_SNOW_SURFACES':
      core?.setSnowSurfaces(data.surfaces || []);
      break;
    case 'STOP':
      core?.stop();
      break;
    case 'DISPOSE':
      core?.destroy();
      core = null;
      break;
  }
});

function initializeCore(data: Extract<WeatherWorkerMessage, { type: 'INIT' }>): void {
  try {
    core?.destroy();
    const options: WeatherEffectsCoreOptions = {
      canvas: data.canvas,
      viewportWidth: data.viewportWidth,
      viewportHeight: data.viewportHeight,
      devicePixelRatio: data.devicePixelRatio,
      isMobile: data.isMobile,
    };
    core = new WeatherEffectsCore(options);
    postResponse({ type: 'READY' });
  } catch (error) {
    postResponse({
      type: 'ERROR',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function postResponse(message: WeatherWorkerResponse): void {
  self.postMessage(message);
}

