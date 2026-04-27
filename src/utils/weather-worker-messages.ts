import { WeatherEffectType } from '../types';

export interface SnowAccumulationSurface {
  id: string;
  x: number;
  y: number;
  width: number;
  thickness: number;
  radius: number;
}

export interface WeatherWorkerEffectOptions {
  snowAccumulation?: boolean | undefined;
  matrixRainColor?: string | undefined;
}

export type WeatherWorkerMessage =
  | {
      type: 'INIT';
      canvas: OffscreenCanvas;
      devicePixelRatio: number;
      viewportWidth: number;
      viewportHeight: number;
      viewWidth: number;
      viewHeight: number;
      isMobile: boolean;
    }
  | {
      type: 'START';
      effect: WeatherEffectType;
      opacity: number;
      options?: WeatherWorkerEffectOptions | undefined;
    }
  | {
      type: 'SET_OPACITY';
      opacity: number;
    }
  | {
      type: 'RESIZE';
      devicePixelRatio: number;
      viewportWidth: number;
      viewportHeight: number;
      viewWidth: number;
      viewHeight: number;
      isMobile: boolean;
    }
  | {
      type: 'SET_SNOW_SURFACES';
      surfaces: SnowAccumulationSurface[];
    }
  | { type: 'STOP' }
  | { type: 'DISPOSE' };

export type WeatherWorkerResponse = { type: 'READY' } | { type: 'ERROR'; error: string };
