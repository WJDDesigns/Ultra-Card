import { WeatherEffectType } from '../types';
import {
  WeatherEffectsCore,
  WeatherEffectsCoreOptions,
  WeatherEffectsCoreResizeOptions,
  WeatherEffectExtras,
  WEATHER_EFFECTS_VIEW_HEIGHT,
} from './weather-effects-core';
import {
  SnowAccumulationSurface,
  WeatherWorkerEffectOptions,
  WeatherWorkerMessage,
  WeatherWorkerResponse,
} from './weather-worker-messages';

interface WeatherEffectOptions {
  opacity?: number;
  respectReducedMotion?: boolean;
  snowAccumulation?: boolean;
  matrixRainColor?: string;
}

type WorkerState = 'idle' | 'pending' | 'ready' | 'failed';

const supportsOffscreenCanvas =
  typeof window !== 'undefined' &&
  'Worker' in window &&
  'transferControlToOffscreen' in HTMLCanvasElement.prototype;

export class WeatherEffectsEngine {
  private canvas: HTMLCanvasElement;
  private readonly resizeHandler = () => this.handleResize();

  private worker?: Worker;
  private workerState: WorkerState = 'idle';
  private workerQueue: WeatherWorkerMessage[] = [];

  private fallbackCore: WeatherEffectsCore | null = null;
  private effectOptions: WeatherWorkerEffectOptions = {};
  private snowSurfaces: SnowAccumulationSurface[] = [];

  private currentEffect: WeatherEffectType = 'none';
  private opacity = 100;
  private respectReducedMotion = true;

  private viewportWidth = window.innerWidth;
  private viewportHeight = window.innerHeight;
  private viewWidth = this.computeViewWidth(WEATHER_EFFECTS_VIEW_HEIGHT);
  private viewHeight = WEATHER_EFFECTS_VIEW_HEIGHT;
  private isMobile = window.innerWidth <= 768;

  constructor(private container: HTMLElement) {
    this.canvas = this.createCanvas();
    window.addEventListener('resize', this.resizeHandler);
  }

  public start(effect: WeatherEffectType, options: WeatherEffectOptions = {}): void {
    this.opacity = Math.max(0, Math.min(100, options.opacity ?? this.opacity));
    this.respectReducedMotion = options.respectReducedMotion ?? true;
    this.effectOptions = {
      snowAccumulation: options.snowAccumulation ?? false,
      matrixRainColor: options.matrixRainColor,
    };

    if (this.respectReducedMotion && this.prefersReducedMotion()) {
      this.stop();
      return;
    }

    // Always construct extras object to ensure it's available for fallback
    const extras: WeatherEffectExtras = {
      snowAccumulation: this.effectOptions.snowAccumulation ?? false,
      matrixRainColor: this.effectOptions.matrixRainColor,
    };

    if (this.useWorkerPath()) {
      this.ensureWorkerInitialized();
      this.postWorkerMessage({
        type: 'START',
        effect,
        opacity: this.opacity,
        options: this.effectOptions,
      });
    } else {
      this.ensureFallbackCore();
      this.fallbackCore!.start(effect, this.opacity, extras);
    }

    this.currentEffect = effect;
  }

  public stop(): void {
    if (this.useWorkerPath()) {
      if (this.workerState !== 'failed') {
        this.postWorkerMessage({ type: 'STOP' });
      }
    } else {
      this.fallbackCore?.stop();
    }
    this.currentEffect = 'none';
  }

  public setOpacity(opacity: number): void {
    this.opacity = Math.max(0, Math.min(100, opacity));
    if (this.useWorkerPath() && this.workerState !== 'failed') {
      this.postWorkerMessage({ type: 'SET_OPACITY', opacity: this.opacity });
    } else {
      this.fallbackCore?.setOpacity(this.opacity);
    }
  }

  public updateSnowSurfaces(surfaces: SnowAccumulationSurface[]): void {
    this.snowSurfaces = surfaces;
    if (this.useWorkerPath() && this.workerState !== 'failed') {
      this.postWorkerMessage({ type: 'SET_SNOW_SURFACES', surfaces });
    } else {
      this.ensureFallbackCore();
      this.fallbackCore?.setSnowSurfaces(surfaces);
    }
  }

  public getLastAppliedExtras(): WeatherWorkerEffectOptions {
    if (this.fallbackCore) {
      return this.fallbackCore.getLastAppliedExtras();
    }
    // For worker path, return the current effectOptions as we don't have direct access
    return { ...this.effectOptions };
  }

  public destroy(): void {
    this.stop();
    window.removeEventListener('resize', this.resizeHandler);

    if (this.worker) {
      this.postWorkerMessage({ type: 'DISPOSE' });
      this.worker.terminate();
      this.worker = undefined;
    }

    if (this.fallbackCore) {
      this.fallbackCore.destroy();
      this.fallbackCore = null;
    }

    if (this.canvas.parentElement === this.container) {
      this.container.removeChild(this.canvas);
    }
  }

  private createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.userSelect = 'none';
    canvas.style.willChange = 'opacity, transform';
    canvas.style.transform = 'translateZ(0)';
    this.container.appendChild(canvas);
    return canvas;
  }

  private recreateCanvas(): void {
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
    this.canvas = this.createCanvas();
  }

  private useWorkerPath(): boolean {
    return supportsOffscreenCanvas && this.workerState !== 'failed';
  }

  private ensureWorkerInitialized(): void {
    if (this.worker || !supportsOffscreenCanvas) {
      return;
    }

    try {
      this.worker = new Worker(new URL('../workers/dynamic-weather-worker.ts', import.meta.url));
      this.worker.onmessage = (event: MessageEvent<WeatherWorkerResponse>) => {
        if (event.data.type === 'READY') {
          this.workerState = 'ready';
          this.flushWorkerQueue();
          if (this.currentEffect !== 'none') {
            this.postWorkerMessage({
              type: 'START',
              effect: this.currentEffect,
              opacity: this.opacity,
              options: this.effectOptions,
            });
          }
        } else if (event.data.type === 'ERROR') {
          console.error('Dynamic Weather worker error:', event.data.error);
          this.handleWorkerFailure();
        }
      };
      this.worker.onerror = err => {
        this.handleWorkerFailure();
      };

      const offscreen = this.canvas.transferControlToOffscreen();
      const initMessage: WeatherWorkerMessage = {
        type: 'INIT',
        canvas: offscreen,
        devicePixelRatio: window.devicePixelRatio || 1,
        viewportWidth: this.viewportWidth,
        viewportHeight: this.viewportHeight,
        viewWidth: this.viewWidth,
        viewHeight: this.viewHeight,
        isMobile: this.isMobile,
      };
      this.workerState = 'pending';
      this.worker.postMessage(initMessage, [offscreen]);
    } catch (error) {
      console.error('Failed to initialize dynamic weather worker:', error);
      this.handleWorkerFailure();
    }
  }

  private ensureFallbackCore(): void {
    if (this.fallbackCore) return;

    const coreOptions: WeatherEffectsCoreOptions = {
      canvas: this.canvas,
      viewportWidth: this.viewportWidth,
      viewportHeight: this.viewportHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      isMobile: this.isMobile,
    };
    this.fallbackCore = new WeatherEffectsCore(coreOptions);
    this.fallbackCore.setSnowSurfaces(this.snowSurfaces);
  }

  private handleWorkerFailure(): void {
    this.workerState = 'failed';
    if (this.worker) {
      this.worker.terminate();
      this.worker = undefined;
    }
    this.flushWorkerQueue(true);
    this.recreateCanvas();
    if (this.fallbackCore) {
      this.fallbackCore.destroy();
      this.fallbackCore = null;
    }
    this.ensureFallbackCore();
    if (this.currentEffect !== 'none') {
      // Pass current effectOptions as extras to preserve matrixRainColor and other settings
      const extras: WeatherEffectExtras = {
        snowAccumulation: this.effectOptions.snowAccumulation ?? false,
        matrixRainColor: this.effectOptions.matrixRainColor,
      };
      this.fallbackCore!.start(this.currentEffect, this.opacity, extras);
      this.fallbackCore!.setSnowSurfaces(this.snowSurfaces);
    }
  }

  private postWorkerMessage(message: WeatherWorkerMessage): void {
    if (this.workerState === 'ready' && this.worker) {
      this.worker.postMessage(message);
    } else {
      this.workerQueue.push(message);
    }
  }

  private flushWorkerQueue(drop = false): void {
    if (drop || !this.worker) {
      this.workerQueue = [];
      return;
    }

    for (const message of this.workerQueue) {
      this.worker.postMessage(message);
    }
    this.workerQueue = [];
  }

  private handleResize(): void {
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
    this.isMobile = this.viewportWidth <= 768;
    this.viewHeight = WEATHER_EFFECTS_VIEW_HEIGHT;
    this.viewWidth = this.computeViewWidth(this.viewHeight);

    if (this.useWorkerPath()) {
      this.postWorkerMessage({
        type: 'RESIZE',
        devicePixelRatio: window.devicePixelRatio || 1,
        viewportWidth: this.viewportWidth,
        viewportHeight: this.viewportHeight,
        viewWidth: this.viewWidth,
        viewHeight: this.viewHeight,
        isMobile: this.isMobile,
      });
    } else {
      this.ensureFallbackCore();
      const resizePayload: WeatherEffectsCoreResizeOptions = {
        viewportWidth: this.viewportWidth,
        viewportHeight: this.viewportHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
        isMobile: this.isMobile,
      };
      this.fallbackCore!.resize(resizePayload);
    }
  }

  private computeViewWidth(viewHeight: number): number {
    const aspect = this.viewportWidth / Math.max(1, this.viewportHeight);
    return viewHeight * aspect;
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
