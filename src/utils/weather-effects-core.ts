/**
 * Weather Effects Core
 * Runs the actual Three.js renderer on either the main thread or a worker.
 */

import { WeatherEffectType } from '../types';
import { SnowAccumulationSurface } from './weather-worker-messages';
import * as THREE from 'three';

type CanvasLike = HTMLCanvasElement | OffscreenCanvas;

interface EffectInstance {
  group: THREE.Group;
  update(delta: number, elapsed: number): void;
  dispose(): void;
  setOpacity(opacity: number): void;
  onResize?(
    width: number,
    height: number,
    isMobile: boolean,
    viewportWidth?: number,
    viewportHeight?: number
  ): void;
  setSnowSurfaces?(surfaces: SnowAccumulationSurface[]): void;
}

export interface WeatherEffectExtras {
  snowAccumulation?: boolean;
  matrixRainColor?: string;
}

interface EffectBuildContext {
  viewWidth: number;
  viewHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  isMobile: boolean;
  effect: WeatherEffectType;
  opacity: number;
  snowAccumulation: boolean;
  snowSurfaces: SnowAccumulationSurface[];
  matrixRainColor?: string;
}

export interface WeatherEffectsCoreOptions {
  canvas: CanvasLike;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  isMobile: boolean;
}

export interface WeatherEffectsCoreResizeOptions {
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  isMobile: boolean;
}

export const WEATHER_EFFECTS_VIEW_HEIGHT = 100;

const globalAny = globalThis as any;

const fallbackTimers = new Map<number, ReturnType<typeof setTimeout>>();
let fallbackId = 0;

const requestFrame: (cb: FrameRequestCallback) => number =
  typeof globalAny.requestAnimationFrame === 'function'
    ? (cb: FrameRequestCallback) => globalAny.requestAnimationFrame(cb)
    : (cb: FrameRequestCallback) => {
        const id = ++fallbackId;
        const handle = setTimeout(() => {
          fallbackTimers.delete(id);
          cb(performance.now());
        }, 16);
        fallbackTimers.set(id, handle);
        return id;
      };

const cancelFrame: (id: number) => void =
  typeof globalAny.cancelAnimationFrame === 'function'
    ? (id: number) => globalAny.cancelAnimationFrame(id)
    : (id: number) => {
        const handle = fallbackTimers.get(id);
        if (handle) {
          clearTimeout(handle);
          fallbackTimers.delete(id);
        }
      };

export class WeatherEffectsCore {
  private canvas: CanvasLike;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene = new THREE.Scene();
  private camera: THREE.OrthographicCamera;
  private animationFrame: number | null = null;
  private lastTimestamp = 0;

  private currentEffect: WeatherEffectType = 'none';
  private activeEffect: EffectInstance | null = null;
  private opacity = 100;

  private viewportWidth: number;
  private viewportHeight: number;
  private viewWidth: number;
  private viewHeight: number = WEATHER_EFFECTS_VIEW_HEIGHT;
  private devicePixelRatio: number;
  private isMobile: boolean;
  private effectExtras: WeatherEffectExtras = {};
  private lastAppliedExtras: WeatherEffectExtras = {};
  private snowSurfaces: SnowAccumulationSurface[] = [];

  private readonly renderLoop = (timestamp: number) => this.renderFrame(timestamp);

  constructor(options: WeatherEffectsCoreOptions) {
    this.canvas = options.canvas;
    this.viewportWidth = options.viewportWidth;
    this.viewportHeight = options.viewportHeight;
    this.devicePixelRatio = options.devicePixelRatio;
    this.isMobile = options.isMobile;
    this.viewWidth = this.computeViewWidth(this.viewHeight);
    this.camera = this.createCamera();
    this.renderer = this.createRenderer();
  }

  public start(effect: WeatherEffectType, opacity: number, extras: WeatherEffectExtras = {}): void {
    this.opacity = Math.max(0, Math.min(100, opacity));
    this.effectExtras = extras;

    const extrasChanged =
      this.lastAppliedExtras.snowAccumulation !== this.effectExtras.snowAccumulation ||
      this.lastAppliedExtras.matrixRainColor !== this.effectExtras.matrixRainColor;

    if (this.currentEffect === effect && this.activeEffect && !extrasChanged) {
      this.activeEffect.setOpacity(this.opacity);
      this.startLoop();
      return;
    }

    this.setEffect(effect);
  }

  public stop(): void {
    this.disposeActiveEffect();
    this.currentEffect = 'none';
    this.stopLoop();
    this.lastAppliedExtras = {};
  }

  public setOpacity(opacity: number): void {
    this.opacity = Math.max(0, Math.min(100, opacity));
    this.activeEffect?.setOpacity(this.opacity);
  }

  public setSnowSurfaces(surfaces: SnowAccumulationSurface[]): void {
    this.snowSurfaces = surfaces;
    if (this.activeEffect?.setSnowSurfaces) {
      this.activeEffect.setSnowSurfaces(surfaces);
    }
  }

  public getLastAppliedExtras(): WeatherEffectExtras {
    return { ...this.lastAppliedExtras };
  }

  public resize(options: WeatherEffectsCoreResizeOptions): void {
    this.viewportWidth = options.viewportWidth;
    this.viewportHeight = options.viewportHeight;
    this.devicePixelRatio = options.devicePixelRatio;
    this.isMobile = options.isMobile;
    this.viewWidth = this.computeViewWidth(this.viewHeight);
    this.camera = this.createCamera();
    this.renderer.setPixelRatio(Math.min(this.devicePixelRatio || 1, this.isMobile ? 1 : 1.5));
    this.renderer.setSize(this.viewportWidth, this.viewportHeight, false);

    if (this.activeEffect?.onResize) {
      this.activeEffect.onResize(
        this.viewWidth,
        this.viewHeight,
        this.isMobile,
        this.viewportWidth,
        this.viewportHeight
      );
      this.activeEffect.setSnowSurfaces?.(this.snowSurfaces);
    } else if (this.currentEffect !== 'none') {
      const effect = this.currentEffect;
      this.currentEffect = 'none';
      this.setEffect(effect);
    }
  }

  public destroy(): void {
    this.stop();
    this.renderer.dispose();
    this.scene.clear();
  }

  private computeViewWidth(viewHeight: number): number {
    const aspect = this.viewportWidth / Math.max(1, this.viewportHeight);
    return viewHeight * aspect;
  }

  private createRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas as HTMLCanvasElement,
      alpha: true,
      antialias: !this.isMobile,
      powerPreference: 'high-performance',
      stencil: false,
      depth: false,
      preserveDrawingBuffer: false,
    });

    renderer.setPixelRatio(Math.min(this.devicePixelRatio || 1, this.isMobile ? 1 : 1.5));
    renderer.setSize(this.viewportWidth, this.viewportHeight, false);

    return renderer;
  }

  private createCamera(): THREE.OrthographicCamera {
    const halfWidth = this.viewWidth / 2;
    const halfHeight = this.viewHeight / 2;
    const camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, -1000, 1000);
    camera.position.z = 10;
    return camera;
  }

  private startLoop(): void {
    if (this.animationFrame !== null) return;
    this.lastTimestamp = 0;
    this.animationFrame = requestFrame(this.renderLoop);
  }

  private stopLoop(): void {
    if (this.animationFrame !== null) {
      cancelFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private renderFrame(timestamp: number): void {
    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
    }

    const delta = Math.min((timestamp - this.lastTimestamp) / 1000, 0.05);
    this.lastTimestamp = timestamp;

    this.activeEffect?.update(delta, timestamp / 1000);
    this.renderer.render(this.scene, this.camera);
    this.animationFrame = requestFrame(this.renderLoop);
  }

  private setEffect(effect: WeatherEffectType): void {
    this.disposeActiveEffect();
    this.currentEffect = effect;

    if (effect === 'none') {
      this.stopLoop();
      return;
    }

    const instance = this.createEffectInstance(effect);
    if (!instance) {
      this.stopLoop();
      this.currentEffect = 'none';
      return;
    }

    this.activeEffect = instance;
    this.activeEffect.setOpacity(this.opacity);
    if (this.snowSurfaces.length && this.activeEffect.setSnowSurfaces) {
      this.activeEffect.setSnowSurfaces(this.snowSurfaces);
    }
    this.scene.add(instance.group);
    this.lastAppliedExtras = { ...this.effectExtras };
    this.startLoop();
  }

  private disposeActiveEffect(): void {
    if (!this.activeEffect) return;
    this.scene.remove(this.activeEffect.group);
    this.activeEffect.dispose();
    this.activeEffect = null;
  }

  private createEffectInstance(effect: WeatherEffectType): EffectInstance | null {
    const ctx: EffectBuildContext = {
      viewWidth: this.viewWidth,
      viewHeight: this.viewHeight,
      viewportWidth: this.viewportWidth,
      viewportHeight: this.viewportHeight,
      isMobile: this.isMobile,
      effect,
      opacity: this.opacity,
      snowAccumulation: Boolean(this.effectExtras.snowAccumulation),
      snowSurfaces: this.snowSurfaces,
      matrixRainColor: this.effectExtras.matrixRainColor,
    };

    // Check specific effects first before generic startsWith checks
    if (effect === 'matrix_rain') {
      return createMatrixRainEffect(ctx);
    }
    if (effect === 'acid_rain') {
      return createAcidRainEffect(ctx);
    }
    if (effect === 'lightning') {
      return createLightningEffect(ctx);
    }
    if (effect === 'sun_beams') {
      return createSunBeamEffect(ctx);
    }
    if (effect === 'clouds') {
      return createCloudEffect(ctx);
    }
    if (effect === 'hail') {
      return createHailEffect(ctx);
    }
    if (effect === 'wind') {
      return createWindEffect(ctx);
    }
    // Generic checks after specific ones
    if (effect.startsWith('rain')) {
      return createRainEffect(ctx);
    }
    if (effect.startsWith('snow')) {
      return createSnowEffect(ctx);
    }
    if (effect.startsWith('fog')) {
      return createFogEffect(ctx);
    }

    return null;
  }
}

/**
 * ---------------------
 * Effect Implementations
 * ---------------------
 */

function createRainEffect(ctx: EffectBuildContext): EffectInstance | null {
  const group = new THREE.Group();
  const preset = getRainPreset(ctx.effect, ctx.isMobile);
  
  // For lightning-only effect, dropCount should be 0 (no rain particles)
  const skipRain = preset.lightningOnly || false;
  const dropCount = skipRain ? 0 : preset.count;
  
  let rainMesh: THREE.Mesh | null = null;
  let rainGeometry: THREE.InstancedBufferGeometry | null = null;
  let rainMaterial: THREE.ShaderMaterial | null = null;
  const uniforms = {
    uTime: { value: 0 },
    uOpacity: { value: ctx.opacity / 100 },
    uViewSize: { value: new THREE.Vector2(ctx.viewWidth, ctx.viewHeight) },
    uLightning: { value: 0 },
  };
  
  if (!skipRain) {
    const baseGeometry = new THREE.PlaneGeometry(0.06, 1);
    rainGeometry = new THREE.InstancedBufferGeometry();
    rainGeometry.index = baseGeometry.index;
    rainGeometry.attributes.position = baseGeometry.attributes.position;
    rainGeometry.attributes.uv = baseGeometry.attributes.uv;
    rainGeometry.instanceCount = dropCount;

    const offsets = new Float32Array(dropCount * 3);
    const speeds = new Float32Array(dropCount);
    const lengths = new Float32Array(dropCount);
    const sway = new Float32Array(dropCount);
    const phases = new Float32Array(dropCount);

    for (let i = 0; i < dropCount; i++) {
      const i3 = i * 3;
      offsets[i3] = THREE.MathUtils.randFloatSpread(ctx.viewWidth + 10);
      offsets[i3 + 1] = THREE.MathUtils.randFloatSpread(ctx.viewHeight);
      offsets[i3 + 2] = Math.random() * 0.5;
      speeds[i] = THREE.MathUtils.randFloat(preset.speed.min, preset.speed.max);
      lengths[i] = THREE.MathUtils.randFloat(preset.length.min, preset.length.max);
      sway[i] = THREE.MathUtils.randFloat(0.5, 1.5);
      phases[i] = Math.random();
    }

    rainGeometry.setAttribute('instanceOffset', new THREE.InstancedBufferAttribute(offsets, 3));
    rainGeometry.setAttribute('instanceSpeed', new THREE.InstancedBufferAttribute(speeds, 1));
    rainGeometry.setAttribute('instanceLength', new THREE.InstancedBufferAttribute(lengths, 1));
    rainGeometry.setAttribute('instanceSway', new THREE.InstancedBufferAttribute(sway, 1));
    rainGeometry.setAttribute('instancePhase', new THREE.InstancedBufferAttribute(phases, 1));

    const vertexShader = `
      attribute vec3 instanceOffset;
      attribute float instanceSpeed;
      attribute float instanceLength;
      attribute float instanceSway;
      attribute float instancePhase;

      uniform float uTime;
      uniform vec2 uViewSize;

      varying float vAlpha;

      void main() {
        float progress = fract(uTime * instanceSpeed + instancePhase);
        float travel = (uViewSize.y * 0.5) - progress * (uViewSize.y + 20.0);
        vec3 transformed = position;
        transformed.y *= instanceLength;
        transformed.x += instanceOffset.x + sin(progress * 6.28318 + instancePhase) * instanceSway;
        transformed.y += travel + instanceOffset.y;
        transformed.z += -5.0 + instanceOffset.z;

        vAlpha = 1.0 - progress;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uOpacity;
      uniform float uLightning;
      varying float vAlpha;

      void main() {
        float alpha = vAlpha * 0.85 * uOpacity + uLightning * 0.3;
        gl_FragColor = vec4(0.65, 0.75, 0.9, clamp(alpha, 0.0, 1.0));
      }
    `;

    rainMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    rainMesh = new THREE.Mesh(rainGeometry, rainMaterial);
    rainMesh.frustumCulled = false;
    group.add(rainMesh);
  }

  let lightningTimer = preset.lightning ? THREE.MathUtils.randFloat(2, 5) : Number.POSITIVE_INFINITY;
  let normalizedOpacity = Math.max(0, Math.min(1, ctx.opacity / 100));
  const lightningFragmentShader = `
    varying vec2 vUv;
    uniform float uFlash;
    uniform vec2 uOrigin;
    uniform float uTime;

    float hash(float n) {
      return fract(sin(n) * 43758.5453);
    }

    float jaggedLine(vec2 uv, float anchor, float seed) {
      float segments = 8.0;
      float progress = clamp(1.0 - uv.y, 0.0, 0.999) * segments;
      float idx = floor(progress);
      float frac = fract(progress);
      float offsetA = hash(seed + idx) * 0.24 - 0.12;
      float offsetB = hash(seed + idx + 1.0) * 0.24 - 0.12;
      float offset = mix(offsetA, offsetB, smoothstep(0.0, 1.0, frac));
      float width = mix(0.006, 0.02, hash(seed + idx * 1.7));
      float target = anchor + offset;
      float dist = abs(uv.x - target);
      float intensity = smoothstep(width, 0.0, dist);
      float fade = smoothstep(0.0, 0.9, 1.0 - uv.y);
      return intensity * fade;
    }

    void main() {
      float seed = floor(uTime * 11.0);
      float core = jaggedLine(vUv, uOrigin.x, seed);
      float halo = jaggedLine(vUv, uOrigin.x + 0.008, seed + 2.0) * 0.4;
      float alpha = clamp((core + halo) * uFlash, 0.0, 1.0);
      vec3 color = vec3(1.0, 0.98, 0.9);
      gl_FragColor = vec4(color, alpha);
    }
  `;

  let lightningMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | null = null;
  let lightningGeometry: THREE.PlaneGeometry | null = null;
  let lightningUniforms:
    | {
        uFlash: { value: number };
        uOrigin: { value: THREE.Vector2 };
        uTime: { value: number };
      }
    | null = null;
  let lightningFlashTimer = 0;
  let lightningFlashDuration = 0.25;

  let screenFlashGeometry: THREE.PlaneGeometry | null = null;
  let screenFlashMaterial: THREE.MeshBasicMaterial | null = null;
  let screenFlashMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | null = null;

  if (preset.lightning) {
    lightningUniforms = {
      uFlash: { value: 0 },
      uOrigin: { value: new THREE.Vector2(0.85, 1.05) },
      uTime: { value: 0 },
    };
    lightningGeometry = new THREE.PlaneGeometry(ctx.viewWidth, ctx.viewHeight);
    const lightningMaterial = new THREE.ShaderMaterial({
      uniforms: lightningUniforms,
      vertexShader: fogVertexShader,
      fragmentShader: lightningFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    lightningMesh = new THREE.Mesh(lightningGeometry, lightningMaterial);
    lightningMesh.position.set(0, 0, -6);
    lightningMesh.renderOrder = 25;
    group.add(lightningMesh);

    screenFlashGeometry = new THREE.PlaneGeometry(ctx.viewWidth, ctx.viewHeight);
    screenFlashMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    screenFlashMesh = new THREE.Mesh(screenFlashGeometry, screenFlashMaterial);
    screenFlashMesh.position.set(0, 0, -8);
    screenFlashMesh.renderOrder = 30;
    group.add(screenFlashMesh);
  }

  const triggerLightning = () => {
    if (!lightningUniforms) return;
    lightningFlashDuration = THREE.MathUtils.randFloat(0.18, 0.32);
    lightningFlashTimer = lightningFlashDuration;
    lightningUniforms.uFlash.value = 1;
    lightningUniforms.uOrigin.value.set(
      THREE.MathUtils.randFloat(0.6, 0.95),
      THREE.MathUtils.randFloat(0.85, 1.05)
    );
    if (screenFlashMaterial) {
      screenFlashMaterial.opacity = Math.max(
        screenFlashMaterial.opacity,
        0.45 * normalizedOpacity + 0.1
      );
    }
  };

  return {
    group,
    update(delta: number) {
      uniforms.uTime.value += delta * preset.timeScale;
      if (preset.lightning) {
        lightningTimer -= delta;
        if (lightningTimer <= 0) {
          uniforms.uLightning.value = 1;
          lightningTimer = THREE.MathUtils.randFloat(2.5, 5);
          triggerLightning();
        } else {
          uniforms.uLightning.value = Math.max(0, uniforms.uLightning.value - delta * 3.5);
        }
        if (lightningUniforms) {
          lightningUniforms.uTime.value += delta;
          if (lightningFlashTimer > 0) {
            lightningFlashTimer -= delta;
            const normalizedTimer = Math.max(
              0,
              lightningFlashTimer / Math.max(lightningFlashDuration, 0.001)
            );
            lightningUniforms.uFlash.value = Math.pow(normalizedTimer, 1.4) * normalizedOpacity;
          } else if (lightningUniforms.uFlash.value > 0) {
            lightningUniforms.uFlash.value = Math.max(
              0,
              lightningUniforms.uFlash.value - delta * 8
            );
          }
        }
        if (screenFlashMaterial) {
          screenFlashMaterial.opacity = Math.max(
            0,
            screenFlashMaterial.opacity - delta * 6
          );
        }
      }
      uniforms.uViewSize.value.set(ctx.viewWidth, ctx.viewHeight);
    },
    setOpacity(value: number) {
      normalizedOpacity = Math.max(0, Math.min(1, value / 100));
      uniforms.uOpacity.value = normalizedOpacity;
    },
    onResize(width: number, height: number) {
      ctx.viewWidth = width;
      ctx.viewHeight = height;
      uniforms.uViewSize.value.set(width, height);
      if (lightningGeometry && lightningMesh) {
        lightningGeometry.dispose();
        lightningGeometry = new THREE.PlaneGeometry(width, height);
        lightningMesh.geometry = lightningGeometry;
      }
      if (screenFlashGeometry && screenFlashMesh) {
        screenFlashGeometry.dispose();
        screenFlashGeometry = new THREE.PlaneGeometry(width, height);
        screenFlashMesh.geometry = screenFlashGeometry;
      }
    },
    dispose() {
      if (rainGeometry) rainGeometry.dispose();
      if (rainMaterial) rainMaterial.dispose();
      if (lightningGeometry) {
        lightningGeometry.dispose();
      }
      lightningMesh?.material.dispose();
      if (screenFlashGeometry) {
        screenFlashGeometry.dispose();
      }
      screenFlashMesh?.material.dispose();
    },
  };
}

function getRainPreset(effect: WeatherEffectType, isMobile: boolean) {
  const scale = isMobile ? 0.6 : 1;
  switch (effect) {
    case 'rain_storm':
      return {
        count: Math.floor(600 * scale),
        length: { min: 1.1, max: 1.5 },
        speed: { min: 1.4, max: 1.9 },
        timeScale: 1.2,
        lightning: true,
        lightningOnly: false,
      };
    case 'rain_drizzle':
      return {
        count: Math.floor(250 * scale),
        length: { min: 0.6, max: 0.9 },
        speed: { min: 0.3, max: 0.6 },
        timeScale: 0.6,
        lightning: false,
        lightningOnly: false,
      };
    default:
      return {
        count: Math.floor(480 * scale),
        length: { min: 0.9, max: 1.2 },
        speed: { min: 1.0, max: 1.3 },
        timeScale: 1.0,
        lightning: false,
        lightningOnly: false,
      };
  }
}

function createSnowEffect(ctx: EffectBuildContext): EffectInstance | null {
  const group = new THREE.Group();
  const particleCount = getSnowCount(ctx.effect, ctx.isMobile);
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = THREE.MathUtils.randFloatSpread(ctx.viewWidth + 30);
    positions[i3 + 1] = THREE.MathUtils.randFloatSpread(ctx.viewHeight + 30);
    positions[i3 + 2] = Math.random() * 4 - 2;

    velocities[i3] = THREE.MathUtils.randFloat(-0.2, 0.2);
    const baseSpeed = ctx.effect === 'snow_storm' ? THREE.MathUtils.randFloat(-1.4, -0.9) : THREE.MathUtils.randFloat(-0.8, -0.4);
    velocities[i3 + 1] = baseSpeed;
    velocities[i3 + 2] = THREE.MathUtils.randFloat(-0.05, 0.05);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const texture = createSnowflakeTexture();
  const baseOpacity = ctx.effect === 'snow_storm' ? 0.9 : 0.75;
  const material = new THREE.PointsMaterial({
    map: texture,
    transparent: true,
    opacity: baseOpacity * (ctx.opacity / 100),
    sizeAttenuation: false,
    size: ctx.effect === 'snow_storm' ? 3.4 : 2.6,
    color: 0xffffff,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  group.add(points);

  let normalizedOpacity = Math.max(0, Math.min(1, ctx.opacity / 100));
  const accumulation =
    ctx.snowAccumulation && !ctx.isMobile ? createSnowAccumulationState(ctx, group) : null;

  return {
    group,
    update(delta: number) {
      const verts = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < verts.length; i += 3) {
        verts[i] += velocities[i] * delta * 25;
        verts[i + 1] += velocities[i + 1] * delta * 25;
        verts[i + 2] += velocities[i + 2] * delta * 10;

        const halfW = ctx.viewWidth / 2 + 15;
        const halfH = ctx.viewHeight / 2 + 15;

        if (verts[i + 1] < -halfH) {
          verts[i + 1] = halfH;
          verts[i] = THREE.MathUtils.randFloatSpread(ctx.viewWidth + 30);
        }
        if (verts[i] < -halfW) verts[i] = halfW;
        if (verts[i] > halfW) verts[i] = -halfW;
      }
      geometry.attributes.position.needsUpdate = true;
      accumulation?.update(delta, normalizedOpacity);
    },
    setOpacity(value: number) {
      normalizedOpacity = Math.max(0, Math.min(1, value / 100));
      material.opacity = baseOpacity * normalizedOpacity;
      accumulation?.setOpacity(normalizedOpacity);
    },
    onResize(
      width: number,
      height: number,
      isMobile: boolean,
      viewportWidth?: number,
      viewportHeight?: number
    ) {
      ctx.viewWidth = width;
      ctx.viewHeight = height;
      ctx.isMobile = isMobile;
      ctx.viewportWidth = viewportWidth ?? ctx.viewportWidth;
      ctx.viewportHeight = viewportHeight ?? ctx.viewportHeight;
      accumulation?.onResize(width, height, ctx);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      texture.dispose();
      accumulation?.dispose();
    },
    setSnowSurfaces(surfaces: SnowAccumulationSurface[]) {
      ctx.snowSurfaces = surfaces;
      accumulation?.setSurfaces(surfaces, ctx);
    },
  };
}

function getSnowCount(effect: WeatherEffectType, isMobile: boolean): number {
  const multiplier = isMobile ? 0.6 : 1;
  if (effect === 'snow_storm') {
    return Math.floor(1000 * multiplier);
  }
  return Math.floor(600 * multiplier);
}

function createFogEffect(ctx: EffectBuildContext): EffectInstance | null {
  const group = new THREE.Group();
  const settings = getFogSettings(ctx.effect, ctx.isMobile);
  const layers = settings.layers.map((layerConfig) =>
    createFogLayer(layerConfig, ctx, settings.baseOpacity)
  );

  layers.forEach((layer) => group.add(layer.mesh));

  return {
    group,
    update(delta: number) {
      layers.forEach((layer) => {
        layer.uniforms.uTime.value += delta * layer.config.speed;
      });
    },
    setOpacity(value: number) {
      const normalized = Math.max(0, Math.min(1, value / 100));
      layers.forEach((layer) => {
        const mobileScale = ctx.isMobile ? 0.75 : 1;
        layer.uniforms.uOpacity.value =
          settings.baseOpacity * layer.config.intensity * normalized * mobileScale;
      });
    },
    onResize(width: number, height: number, isMobile: boolean) {
      ctx.viewWidth = width;
      ctx.viewHeight = height;
      ctx.isMobile = isMobile;
      layers.forEach((layer) => {
        layer.uniforms.uResolution.value.set(width, height);
        layer.mesh.geometry.dispose();
        layer.mesh.geometry = new THREE.PlaneGeometry(width, height);
      });
    },
    dispose() {
      layers.forEach((layer) => {
        layer.mesh.geometry.dispose();
        layer.mesh.material.dispose();
      });
    },
  };
}

interface FogLayerConfig {
  scale: number;
  speed: number;
  intensity: number;
  flow: THREE.Vector2;
  low: number;
  high: number;
  contrast: number;
  color: [number, number, number];
}

interface FogSettings {
  baseOpacity: number;
  layers: FogLayerConfig[];
}

const fogVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fogFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uScale;
  uniform vec2 uFlow;
  uniform vec2 uResolution;
  uniform float uLow;
  uniform float uHigh;
  uniform float uContrast;
  uniform vec3 uColor;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 aspect = vec2(uResolution.x / max(uResolution.y, 0.0001), 1.0);
    vec2 uv = (vUv - 0.5) * aspect + 0.5;
    uv *= uScale;
    uv += uFlow * uTime;

    float primary = fbm(uv);
    float detail = fbm(uv * 1.8 - uFlow.yx * (uTime * 0.35));
    float density = mix(primary, detail, 0.35);
    density = smoothstep(uLow, uHigh, density);
    density = pow(density, uContrast);

    float alpha = density * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

interface FogShaderLayer {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  uniforms: {
    uTime: { value: number };
    uOpacity: { value: number };
    uScale: { value: number };
    uFlow: { value: THREE.Vector2 };
    uResolution: { value: THREE.Vector2 };
    uLow: { value: number };
    uHigh: { value: number };
    uContrast: { value: number };
    uColor: { value: THREE.Color };
  };
  config: FogLayerConfig;
}

function createFogLayer(
  config: FogLayerConfig,
  ctx: EffectBuildContext,
  baseOpacity: number
): FogShaderLayer {
  const geometry = new THREE.PlaneGeometry(ctx.viewWidth, ctx.viewHeight);
  const uniforms = {
    uTime: { value: 0 },
    uOpacity: { value: baseOpacity * config.intensity * (ctx.opacity / 100) },
    uScale: { value: config.scale },
    uFlow: { value: config.flow.clone() },
    uResolution: { value: new THREE.Vector2(ctx.viewWidth, ctx.viewHeight) },
    uLow: { value: config.low },
    uHigh: { value: config.high },
    uContrast: { value: config.contrast },
    uColor: { value: new THREE.Color(config.color[0], config.color[1], config.color[2]) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: fogVertexShader,
    fragmentShader: fogFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = -3;

  return {
    mesh,
    uniforms,
    config,
  };
}

function getFogSettings(effect: WeatherEffectType, isMobile: boolean): FogSettings {
  const isDense = effect === 'fog_dense';
  const baseOpacity = isDense ? 0.225 : 0.11;
  const mobileScale = isMobile ? 0.85 : 1;

  const layers: FogLayerConfig[] = isDense
    ? [
        {
          scale: 1.0 * mobileScale,
          speed: 0.28,
          intensity: 1.0,
          flow: new THREE.Vector2(0.08, 0.02),
          low: 0.25,
          high: 0.78,
          contrast: 1.1,
          color: [0.86, 0.89, 0.95],
        },
        {
          scale: 1.6 * mobileScale,
          speed: 0.36,
          intensity: 0.85,
          flow: new THREE.Vector2(-0.05, 0.025),
          low: 0.2,
          high: 0.7,
          contrast: 1.22,
          color: [0.9, 0.92, 0.97],
        },
        {
          scale: 2.2 * mobileScale,
          speed: 0.44,
          intensity: 0.65,
          flow: new THREE.Vector2(0.03, -0.02),
          low: 0.3,
          high: 0.85,
          contrast: 1.3,
          color: [0.78, 0.82, 0.9],
        },
      ]
    : [
        {
          scale: 1.2 * mobileScale,
          speed: 0.22,
          intensity: 0.75,
          flow: new THREE.Vector2(0.05, 0.015),
          low: 0.3,
          high: 0.82,
          contrast: 1.15,
          color: [0.88, 0.91, 0.96],
        },
        {
          scale: 1.9 * mobileScale,
          speed: 0.3,
          intensity: 0.55,
          flow: new THREE.Vector2(-0.03, 0.012),
          low: 0.25,
          high: 0.75,
          contrast: 1.22,
          color: [0.8, 0.84, 0.92],
        },
      ];

  return {
    baseOpacity,
    layers,
  };
}

function createSunBeamEffect(ctx: EffectBuildContext): EffectInstance | null {
  const group = new THREE.Group();
  let geometry = new THREE.PlaneGeometry(ctx.viewWidth, ctx.viewHeight);

  const uniforms = {
    uTime: { value: 0 },
    uOpacity: { value: ctx.opacity / 100 },
    uViewSize: { value: new THREE.Vector2(ctx.viewWidth, ctx.viewHeight) },
  };

  const vertexShader = `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec3 vPosition;
    uniform vec2 uViewSize;
    uniform float uTime;
    uniform float uOpacity;

    void main() {
      vec2 uv = vec2(
        (vPosition.x / uViewSize.x) + 0.5,
        (vPosition.y / uViewSize.y) + 0.5
      );

      vec2 origin = vec2(1.1, 1.05);
      vec2 dir = origin - uv;
      float dist = length(dir);
      float angle = atan(dir.y, dir.x);
      float beams = sin(angle * 18.0 + uTime * 0.8) * 0.5 + 0.5;
      float intensity = smoothstep(0.6, 0.0, dist) * beams;
      float alpha = intensity * 0.65 * uOpacity;

      vec3 color = mix(vec3(1.0, 0.95, 0.8), vec3(1.0, 0.85, 0.4), dist);
      gl_FragColor = vec4(color, alpha);
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0, -2);
  group.add(mesh);

  return {
    group,
    update(delta: number) {
      uniforms.uTime.value += delta;
    },
    setOpacity(value: number) {
      uniforms.uOpacity.value = Math.max(0, Math.min(1, value / 100));
    },
    onResize(width: number, height: number) {
      ctx.viewWidth = width;
      ctx.viewHeight = height;
      uniforms.uViewSize.value.set(width, height);
      mesh.geometry.dispose();
      geometry = new THREE.PlaneGeometry(width, height);
      mesh.geometry = geometry;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}

function createCloudEffect(ctx: EffectBuildContext): EffectInstance | null {
  const group = new THREE.Group();
  // Create a plane that covers the top portion of the screen (approx 50-60%)
  const heightRatio = 0.6;
  let geometry = new THREE.PlaneGeometry(ctx.viewWidth, ctx.viewHeight * heightRatio);

  const uniforms = {
    uTime: { value: 0 },
    uOpacity: { value: ctx.opacity / 100 },
    uViewSize: { value: new THREE.Vector2(ctx.viewWidth, ctx.viewHeight) },
    uCloudColor: { value: new THREE.Color(0xffffff) },
    uCloudShadow: { value: new THREE.Color(0xcfd6e3) },
    uScale: { value: ctx.isMobile ? 1.5 : 1.0 },
  };

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    uniform float uTime;
    uniform float uOpacity;
    uniform vec3 uCloudColor;
    uniform vec3 uCloudShadow;
    uniform float uScale;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      for (int i = 0; i < 6; i++) {
        value += amplitude * noise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
      }
      return value;
    }

    void main() {
      vec2 uv = vUv * uScale;
      
      // Slow movement
      float time = uTime * 0.05;
      
      // Primary shape
      vec2 q = vec2(0.0);
      q.x = fbm(uv + vec2(time * 0.5, time * 0.2));
      q.y = fbm(uv + vec2(1.0));
      
      vec2 r = vec2(0.0);
      r.x = fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.15 * time);
      r.y = fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.126 * time);
      
      float f = fbm(uv + r);
      
      // Density modulation
      float cloud = smoothstep(0.2, 0.7, f);
      
      // Soft edges
      cloud *= smoothstep(0.0, 0.3, vUv.y); // Fade at bottom
      cloud *= smoothstep(1.0, 0.8, vUv.y); // Fade at top
      
      // Volume/Shadow
      float shadow = smoothstep(0.3, 0.6, fbm(uv * 2.0 + r + vec2(0.5)));
      vec3 color = mix(uCloudShadow, uCloudColor, shadow * 0.8 + 0.2);
      
      // Reduced opacity to 25% of original (0.95 * 0.25 = 0.2375)
      float alpha = cloud * uOpacity * 0.2375;
      
      gl_FragColor = vec4(color, alpha);
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, ctx.viewHeight * 0.25, -6); // Position at top, slightly behind other effects
  mesh.renderOrder = -2; // Render behind rain/snow but in front of background
  group.add(mesh);

  return {
    group,
    update(delta: number) {
      uniforms.uTime.value += delta;
    },
    setOpacity(value: number) {
      uniforms.uOpacity.value = Math.max(0, Math.min(1, value / 100));
    },
    onResize(width: number, height: number, isMobile: boolean) {
      mesh.geometry.dispose();
      mesh.geometry = new THREE.PlaneGeometry(width, height * heightRatio);
      uniforms.uViewSize.value.set(width, height);
      uniforms.uScale.value = isMobile ? 1.5 : 1.0;
      mesh.position.set(0, height * 0.25, -6);
    },
    dispose() {
      mesh.geometry.dispose();
      material.dispose();
    },
  };
}

function createLightningEffect(ctx: EffectBuildContext): EffectInstance | null {
  const group = new THREE.Group();
  let normalizedOpacity = Math.max(0, Math.min(1, ctx.opacity / 100));
  
  const lightningFragmentShader = `
    varying vec2 vUv;
    uniform float uFlash;
    uniform vec2 uOrigin;
    uniform float uTime;

    float hash(float n) {
      return fract(sin(n) * 43758.5453);
    }

    float jaggedLine(vec2 uv, float anchor, float seed) {
      float segments = 8.0;
      float progress = clamp(1.0 - uv.y, 0.0, 0.999) * segments;
      float idx = floor(progress);
      float frac = fract(progress);
      float offsetA = hash(seed + idx) * 0.24 - 0.12;
      float offsetB = hash(seed + idx + 1.0) * 0.24 - 0.12;
      float offset = mix(offsetA, offsetB, smoothstep(0.0, 1.0, frac));
      float width = mix(0.006, 0.02, hash(seed + idx * 1.7));
      float target = anchor + offset;
      float dist = abs(uv.x - target);
      float intensity = smoothstep(width, 0.0, dist);
      float fade = smoothstep(0.0, 0.9, 1.0 - uv.y);
      return intensity * fade;
    }

    void main() {
      float seed = floor(uTime * 11.0);
      float core = jaggedLine(vUv, uOrigin.x, seed);
      float halo = jaggedLine(vUv, uOrigin.x + 0.008, seed + 2.0) * 0.4;
      float alpha = clamp((core + halo) * uFlash, 0.0, 1.0);
      vec3 color = vec3(1.0, 0.98, 0.9);
      gl_FragColor = vec4(color, alpha);
    }
  `;

  const lightningUniforms = {
    uFlash: { value: 0 },
    uOrigin: { value: new THREE.Vector2(0.85, 1.05) },
    uTime: { value: 0 },
  };
  
  let lightningGeometry = new THREE.PlaneGeometry(ctx.viewWidth, ctx.viewHeight);
  const lightningMaterial = new THREE.ShaderMaterial({
    uniforms: lightningUniforms,
    vertexShader: fogVertexShader,
    fragmentShader: lightningFragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const lightningMesh = new THREE.Mesh(lightningGeometry, lightningMaterial);
  lightningMesh.position.set(0, 0, -6);
  lightningMesh.renderOrder = 25;
  group.add(lightningMesh);

  let screenFlashGeometry = new THREE.PlaneGeometry(ctx.viewWidth, ctx.viewHeight);
  const screenFlashMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const screenFlashMesh = new THREE.Mesh(screenFlashGeometry, screenFlashMaterial);
  screenFlashMesh.position.set(0, 0, -8);
  screenFlashMesh.renderOrder = 30;
  group.add(screenFlashMesh);

  let lightningTimer = THREE.MathUtils.randFloat(1, 3);
  let lightningFlashTimer = 0;
  let lightningFlashDuration = 0.25;

  const triggerLightning = () => {
    lightningFlashDuration = THREE.MathUtils.randFloat(0.18, 0.32);
    lightningFlashTimer = lightningFlashDuration;
    lightningUniforms.uFlash.value = 1;
    lightningUniforms.uOrigin.value.set(
      THREE.MathUtils.randFloat(0.6, 0.95),
      THREE.MathUtils.randFloat(0.85, 1.05)
    );
    screenFlashMaterial.opacity = Math.max(screenFlashMaterial.opacity, 0.55 * normalizedOpacity + 0.15);
  };

  return {
    group,
    update(delta: number) {
      lightningTimer -= delta;
      if (lightningTimer <= 0) {
        lightningTimer = THREE.MathUtils.randFloat(1.5, 4);
        triggerLightning();
      }
      
      lightningUniforms.uTime.value += delta;
      if (lightningFlashTimer > 0) {
        lightningFlashTimer -= delta;
        const normalizedTimer = Math.max(0, lightningFlashTimer / Math.max(lightningFlashDuration, 0.001));
        lightningUniforms.uFlash.value = Math.pow(normalizedTimer, 1.4) * normalizedOpacity;
      } else if (lightningUniforms.uFlash.value > 0) {
        lightningUniforms.uFlash.value = Math.max(0, lightningUniforms.uFlash.value - delta * 8);
      }
      
      screenFlashMaterial.opacity = Math.max(0, screenFlashMaterial.opacity - delta * 6);
    },
    setOpacity(value: number) {
      normalizedOpacity = Math.max(0, Math.min(1, value / 100));
    },
    onResize(width: number, height: number) {
      ctx.viewWidth = width;
      ctx.viewHeight = height;
      if (lightningGeometry) {
        lightningGeometry.dispose();
        lightningGeometry = new THREE.PlaneGeometry(width, height);
        lightningMesh.geometry = lightningGeometry;
      }
      if (screenFlashGeometry) {
        screenFlashGeometry.dispose();
        screenFlashGeometry = new THREE.PlaneGeometry(width, height);
        screenFlashMesh.geometry = screenFlashGeometry;
      }
    },
    dispose() {
      if (lightningGeometry) lightningGeometry.dispose();
      lightningMaterial.dispose();
      if (screenFlashGeometry) screenFlashGeometry.dispose();
      screenFlashMaterial.dispose();
    },
  };
}

function createMatrixRainEffect(ctx: EffectBuildContext): EffectInstance | null {
  const group = new THREE.Group();
  
  // Authentic Matrix character set
  const matrixChars = 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ:・."=*+-<>¦|Z'.split('');
  
  // Generate textures for each character
  const charTextures = createMatrixCharacterTextures(matrixChars);
  
  // Get custom color from context or use default green
  const matrixColor = ctx.matrixRainColor || '#00ff00';
  const color = new THREE.Color(matrixColor);
  
  // Number of columns based on screen width
  const columnCount = ctx.isMobile ? 40 : 80;
  const charSize = 1.2; // Size of each character in world units
  const columnWidth = ctx.viewWidth / columnCount;
  
  const columns: {
    x: number;
    yOffset: number;
    speed: number;
    length: number;
    meshes: THREE.Mesh[];
    charIndices: number[];
  }[] = [];
  
  // Initialize columns
  for (let i = 0; i < columnCount; i++) {
    const length = Math.floor(THREE.MathUtils.randFloat(8, 25));
    const yOffset = Math.random() * ctx.viewHeight * 2;
    const speed = THREE.MathUtils.randFloat(10, 25);
    const x = -ctx.viewWidth / 2 + i * columnWidth + columnWidth / 2;
    
    const meshes: THREE.Mesh[] = [];
    const charIndices: number[] = [];
    
    // Create meshes for each character in this column
    for (let j = 0; j < length; j++) {
      const charIdx = Math.floor(Math.random() * matrixChars.length);
      charIndices.push(charIdx);
      
      const geometry = new THREE.PlaneGeometry(charSize * 0.9, charSize * 1.2);
      
      // Calculate brightness - head is brightest (white), trail fades
      const brightness = j === 0 ? 2.5 : (1.0 - (j / length) * 0.8);
      const charColor = new THREE.Color(
        color.r * brightness,
        color.g * brightness,
        color.b * brightness
      );
      
      const material = new THREE.MeshBasicMaterial({
        map: charTextures[charIdx],
        transparent: true,
        opacity: ctx.opacity / 100,
        color: charColor,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, yOffset - j * charSize * 1.4, 0);
      mesh.frustumCulled = false;
      group.add(mesh);
      meshes.push(mesh);
    }
    
    columns.push({
      x,
      yOffset,
      speed,
      length,
      meshes,
      charIndices,
    });
  }
  
  let changeCharTimer = 0;
  let normalizedOpacity = Math.max(0, Math.min(1, ctx.opacity / 100));
  
  return {
    group,
    update(delta: number) {
      changeCharTimer += delta;
      const shouldChangeChars = changeCharTimer > 0.05;
      if (shouldChangeChars) changeCharTimer = 0;
      
      columns.forEach(column => {
        // Move column down
        column.yOffset -= column.speed * delta;
        
        // Reset if off screen
        if (column.yOffset < -ctx.viewHeight / 2 - column.length * charSize * 1.4) {
          column.yOffset = ctx.viewHeight / 2 + Math.random() * ctx.viewHeight;
        }
        
        // Update each character in the column
        for (let i = 0; i < column.length; i++) {
          const mesh = column.meshes[i];
          mesh.position.y = column.yOffset - i * charSize * 1.4;
          
          // Randomly change characters - each character changes independently
          if (shouldChangeChars && Math.random() < 0.15) {
            const newCharIdx = Math.floor(Math.random() * matrixChars.length);
            column.charIndices[i] = newCharIdx;
            // Update the texture on the mesh
            (mesh.material as THREE.MeshBasicMaterial).map = charTextures[newCharIdx];
            (mesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
          }
        }
      });
    },
    setOpacity(value: number) {
      normalizedOpacity = Math.max(0, Math.min(1, value / 100));
      columns.forEach(column => {
        column.meshes.forEach(mesh => {
          (mesh.material as THREE.MeshBasicMaterial).opacity = normalizedOpacity;
        });
      });
    },
    onResize(width: number, height: number, isMobile: boolean) {
      ctx.viewWidth = width;
      ctx.viewHeight = height;
      ctx.isMobile = isMobile;
    },
    dispose() {
      columns.forEach(column => {
        column.meshes.forEach(mesh => {
          mesh.geometry.dispose();
          const material = mesh.material;
          if (Array.isArray(material)) {
            material.forEach(m => m.dispose());
          } else {
            material.dispose();
          }
        });
      });
      charTextures.forEach(tex => tex.dispose());
    },
  };
}

function createMatrixCharacterTextures(chars: string[]): THREE.Texture[] {
  const textures: THREE.Texture[] = [];
  const size = 64;
  
  chars.forEach(char => {
    const surface = createDrawingSurface(size, size);
    const ctx = surface.ctx;
    
    // Clear background
    ctx.clearRect(0, 0, size, size);
    
    // Draw character
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px "Courier New", "MS Gothic", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, size / 2, size / 2);
    
    const texture = createCanvasTexture(surface.canvas);
    texture.needsUpdate = true;
    textures.push(texture);
  });
  
  return textures;
}

function createHailEffect(ctx: EffectBuildContext): EffectInstance | null {
  const group = new THREE.Group();
  const hailCount = 15;
  const baseGeometry = new THREE.PlaneGeometry(0.25, 0.25); // Larger square ice chunks
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.index = baseGeometry.index;
  geometry.attributes.position = baseGeometry.attributes.position;
  geometry.attributes.uv = baseGeometry.attributes.uv;

  geometry.instanceCount = hailCount;

  const offsets = new Float32Array(hailCount * 3);
  const speeds = new Float32Array(hailCount);
  const sizes = new Float32Array(hailCount);
  const rotations = new Float32Array(hailCount);
  const phases = new Float32Array(hailCount);

  for (let i = 0; i < hailCount; i++) {
    const i3 = i * 3;
    offsets[i3] = THREE.MathUtils.randFloatSpread(ctx.viewWidth + 10);
    offsets[i3 + 1] = THREE.MathUtils.randFloatSpread(ctx.viewHeight);
    offsets[i3 + 2] = Math.random() * 2;
    
    // Hail falls fast but not too fast - using shader speed system like rain
    speeds[i] = THREE.MathUtils.randFloat(2.8, 4.0); // A bit slower - faster than rain_storm (1.4-1.9) but reasonable
    sizes[i] = THREE.MathUtils.randFloat(1.8, 2.8); // Larger chunks - more visible
    rotations[i] = Math.random() * Math.PI * 2;
    phases[i] = Math.random();
  }

  geometry.setAttribute('instanceOffset', new THREE.InstancedBufferAttribute(offsets, 3));
  geometry.setAttribute('instanceSpeed', new THREE.InstancedBufferAttribute(speeds, 1));
  geometry.setAttribute('instanceSize', new THREE.InstancedBufferAttribute(sizes, 1));
  geometry.setAttribute('instanceRotation', new THREE.InstancedBufferAttribute(rotations, 1));
  geometry.setAttribute('instancePhase', new THREE.InstancedBufferAttribute(phases, 1));

  const uniforms = {
    uTime: { value: 0 },
    uOpacity: { value: ctx.opacity / 100 },
    uViewSize: { value: new THREE.Vector2(ctx.viewWidth, ctx.viewHeight) },
  };

  const vertexShader = `
    attribute vec3 instanceOffset;
    attribute float instanceSpeed;
    attribute float instanceSize;
    attribute float instanceRotation;
    attribute float instancePhase;

    uniform float uTime;
    uniform vec2 uViewSize;

    varying float vAlpha;

    void main() {
      float progress = fract(uTime * instanceSpeed + instancePhase);
      float travel = (uViewSize.y * 0.5) - progress * (uViewSize.y + 20.0);
      
      // Rotate the chunk
      float angle = instanceRotation + uTime * instanceSpeed * 3.0;
      vec2 rotated = vec2(
        position.x * cos(angle) - position.y * sin(angle),
        position.x * sin(angle) + position.y * cos(angle)
      );
      
      vec3 transformed = vec3(rotated * instanceSize, position.z);
      transformed.x += instanceOffset.x; // NO horizontal sway - straight down
      transformed.y += travel + instanceOffset.y;
      transformed.z += -5.0 + instanceOffset.z;

      vAlpha = 1.0;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uOpacity;
    varying float vAlpha;

    void main() {
      // Hard-edged white ice chunks with slight blue tint
      vec3 iceColor = vec3(0.95, 0.98, 1.0);
      float alpha = vAlpha * uOpacity;
      gl_FragColor = vec4(iceColor, alpha);
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  group.add(mesh);

  let normalizedOpacity = Math.max(0, Math.min(1, ctx.opacity / 100));

  return {
    group,
    update(delta: number) {
      uniforms.uTime.value += delta;
      uniforms.uViewSize.value.set(ctx.viewWidth, ctx.viewHeight);
    },
    setOpacity(value: number) {
      normalizedOpacity = Math.max(0, Math.min(1, value / 100));
      uniforms.uOpacity.value = normalizedOpacity;
    },
    onResize(width: number, height: number) {
      ctx.viewWidth = width;
      ctx.viewHeight = height;
      uniforms.uViewSize.value.set(width, height);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}

function createHailstoneTexture(): THREE.Texture {
  const size = 64;
  const surface = createDrawingSurface(size);
  const ctx = surface.ctx;

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 4;
  
  // Create irregular polygon to simulate ice chunk (not circular)
  ctx.beginPath();
  const sides = 6 + Math.floor(Math.random() * 3); // 6-8 sides
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    // Irregular radius for each vertex
    const variance = 0.7 + Math.random() * 0.6;
    const x = centerX + Math.cos(angle) * radius * variance;
    const y = centerY + Math.sin(angle) * radius * variance;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  
  // Fill with bright white gradient
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.4, 'rgba(245, 250, 255, 1)');
  gradient.addColorStop(0.8, 'rgba(220, 235, 250, 0.9)');
  gradient.addColorStop(1, 'rgba(200, 220, 240, 0.7)');
  
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Sharp white edges to emphasize the angular shape
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Multiple highlights for icy sparkle effect
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.beginPath();
  ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.arc(centerX + radius * 0.25, centerY - radius * 0.2, radius * 0.15, 0, Math.PI * 2);
  ctx.fill();

  const texture = createCanvasTexture(surface.canvas);
  texture.needsUpdate = true;
  return texture;
}

function createAcidRainEffect(ctx: EffectBuildContext): EffectInstance | null {
  const group = new THREE.Group();
  const baseGeometry = new THREE.PlaneGeometry(0.08, 1.2);
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.index = baseGeometry.index;
  geometry.attributes.position = baseGeometry.attributes.position;
  geometry.attributes.uv = baseGeometry.attributes.uv;

  const dropCount = ctx.isMobile ? 350 : 550;
  geometry.instanceCount = dropCount;

  const offsets = new Float32Array(dropCount * 3);
  const speeds = new Float32Array(dropCount);
  const lengths = new Float32Array(dropCount);
  const phases = new Float32Array(dropCount);

  for (let i = 0; i < dropCount; i++) {
    const i3 = i * 3;
    offsets[i3] = THREE.MathUtils.randFloatSpread(ctx.viewWidth + 10);
    offsets[i3 + 1] = THREE.MathUtils.randFloatSpread(ctx.viewHeight);
    offsets[i3 + 2] = Math.random() * 0.5;
    speeds[i] = THREE.MathUtils.randFloat(0.9, 1.4);
    lengths[i] = THREE.MathUtils.randFloat(1.0, 1.4);
    phases[i] = Math.random();
  }

  geometry.setAttribute('instanceOffset', new THREE.InstancedBufferAttribute(offsets, 3));
  geometry.setAttribute('instanceSpeed', new THREE.InstancedBufferAttribute(speeds, 1));
  geometry.setAttribute('instanceLength', new THREE.InstancedBufferAttribute(lengths, 1));
  geometry.setAttribute('instancePhase', new THREE.InstancedBufferAttribute(phases, 1));

  const uniforms = {
    uTime: { value: 0 },
    uOpacity: { value: ctx.opacity / 100 },
    uViewSize: { value: new THREE.Vector2(ctx.viewWidth, ctx.viewHeight) },
  };

  const vertexShader = `
    attribute vec3 instanceOffset;
    attribute float instanceSpeed;
    attribute float instanceLength;
    attribute float instancePhase;

    uniform float uTime;
    uniform vec2 uViewSize;

    varying float vAlpha;

    void main() {
      float progress = fract(uTime * instanceSpeed + instancePhase);
      float travel = (uViewSize.y * 0.5) - progress * (uViewSize.y + 20.0);
      vec3 transformed = position;
      transformed.y *= instanceLength;
      transformed.x += instanceOffset.x;
      transformed.y += travel + instanceOffset.y;
      transformed.z += -5.0 + instanceOffset.z;

      vAlpha = 1.0 - progress;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uOpacity;
    varying float vAlpha;

    void main() {
      // Toxic yellowish-green colors
      vec3 acidColor1 = vec3(0.56, 0.93, 0.56); // #8fbc8f
      vec3 acidColor2 = vec3(0.60, 0.80, 0.20); // #9acd32
      vec3 acidColor3 = vec3(0.68, 1.0, 0.18);  // #adff2f
      
      // Mix colors for variation
      vec3 color = mix(acidColor1, acidColor2, vAlpha * 0.5);
      color = mix(color, acidColor3, vAlpha * vAlpha * 0.3);
      
      // Add glow effect
      float glow = vAlpha * 0.4;
      float alpha = (vAlpha * 0.9 + glow) * uOpacity;
      
      gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  group.add(mesh);

  return {
    group,
    update(delta: number) {
      uniforms.uTime.value += delta * 0.95;
      uniforms.uViewSize.value.set(ctx.viewWidth, ctx.viewHeight);
    },
    setOpacity(value: number) {
      uniforms.uOpacity.value = Math.max(0, Math.min(1, value / 100));
    },
    onResize(width: number, height: number) {
      ctx.viewWidth = width;
      ctx.viewHeight = height;
      uniforms.uViewSize.value.set(width, height);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}

function createWindEffect(ctx: EffectBuildContext): EffectInstance | null {
  const group = new THREE.Group();
  const particleCount = ctx.isMobile ? 150 : 300;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const swirl = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = THREE.MathUtils.randFloatSpread(ctx.viewWidth + 40);
    positions[i3 + 1] = THREE.MathUtils.randFloatSpread(ctx.viewHeight);
    positions[i3 + 2] = THREE.MathUtils.randFloat(-3, 3);

    velocities[i3] = THREE.MathUtils.randFloat(15, 35); // Horizontal speed
    velocities[i3 + 1] = THREE.MathUtils.randFloat(-2, 2); // Slight vertical drift
    velocities[i3 + 2] = THREE.MathUtils.randFloat(-0.1, 0.1);
    swirl[i] = THREE.MathUtils.randFloat(1, 3);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const texture = createDustParticleTexture();
  const material = new THREE.PointsMaterial({
    map: texture,
    transparent: true,
    opacity: 0.4 * (ctx.opacity / 100),
    sizeAttenuation: false,
    size: ctx.isMobile ? 1.8 : 2.4,
    color: 0xcccccc,
    depthWrite: false,
    depthTest: false,
    blending: THREE.NormalBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  group.add(points);

  let normalizedOpacity = Math.max(0, Math.min(1, ctx.opacity / 100));
  let time = 0;

  return {
    group,
    update(delta: number) {
      time += delta;
      const verts = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < verts.length; i += 3) {
        // Horizontal movement
        verts[i] += velocities[i] * delta;
        // Vertical swirl
        verts[i + 1] += velocities[i + 1] * delta + Math.sin(time * swirl[i / 3]) * 0.15;
        verts[i + 2] += velocities[i + 2] * delta;

        const halfW = ctx.viewWidth / 2 + 20;
        const halfH = ctx.viewHeight / 2;

        // Wrap around horizontally
        if (verts[i] > halfW) {
          verts[i] = -halfW;
          verts[i + 1] = THREE.MathUtils.randFloatSpread(ctx.viewHeight);
        }
        if (verts[i] < -halfW) {
          verts[i] = halfW;
        }
        
        // Keep within vertical bounds
        if (verts[i + 1] > halfH) verts[i + 1] = -halfH;
        if (verts[i + 1] < -halfH) verts[i + 1] = halfH;
      }
      geometry.attributes.position.needsUpdate = true;
    },
    setOpacity(value: number) {
      normalizedOpacity = Math.max(0, Math.min(1, value / 100));
      material.opacity = 0.4 * normalizedOpacity;
    },
    onResize(width: number, height: number, isMobile: boolean) {
      ctx.viewWidth = width;
      ctx.viewHeight = height;
      ctx.isMobile = isMobile;
      material.size = isMobile ? 1.8 : 2.4;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      texture.dispose();
    },
  };
}

function createDustParticleTexture(): THREE.Texture {
  const size = 16;
  const surface = createDrawingSurface(size);
  const ctx = surface.ctx;

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = createCanvasTexture(surface.canvas);
  texture.needsUpdate = true;
  return texture;
}

function createSnowflakeTexture(): THREE.Texture {
  const size = 32;
  const surface = createDrawingSurface(size);
  const ctx = surface.ctx;

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = createCanvasTexture(surface.canvas);
  texture.needsUpdate = true;
  return texture;
}

interface SnowAccumulationLayer {
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  uniforms: SnowAccumulationUniforms;
  texture: THREE.Texture;
  maxOpacity: number;
  heightRatio: number;
  alignment: 'top' | 'bottom';
}

interface SnowAccumulationUniforms {
  uOpacity: { value: number };
  uGlowOpacity: { value: number };
  uThreshold: { value: number };
  uTexture: { value: THREE.Texture };
}

interface CardAccumulationUniforms extends Record<string, THREE.IUniform<any>> {
  uOpacity: THREE.IUniform<number>;
  uGlow: THREE.IUniform<number>;
  uEdgeSoftness: THREE.IUniform<number>;
  uNoiseSeed: THREE.IUniform<number>;
  uTime: THREE.IUniform<number>;
}

interface SnowAccumulationCardLayer {
  id: string;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  uniforms: CardAccumulationUniforms;
  surface: SnowAccumulationSurface;
  update(surface: SnowAccumulationSurface): void;
  dispose(): void;
}

interface SnowAccumulationState {
  update(delta: number, opacityFactor: number): void;
  setOpacity(opacityFactor: number): void;
  onResize(width: number, height: number, ctx: EffectBuildContext): void;
  setSurfaces(surfaces: SnowAccumulationSurface[], ctx: EffectBuildContext): void;
  dispose(): void;
}

function createSnowAccumulationState(
  ctx: EffectBuildContext,
  parent: THREE.Group
): SnowAccumulationState {
  const topLayer = createSnowAccumulationLayer('top', ctx);
  const bottomLayer = createSnowAccumulationLayer('bottom', ctx);
  const baseLayers = [topLayer, bottomLayer];
  baseLayers.forEach((layer) => parent.add(layer.mesh));

  const cardLayers = new Map<string, SnowAccumulationCardLayer>();

  let timer = 0;
  const accumulateDuration = 26;
  const fadeDuration = 9;
  const totalDuration = accumulateDuration + fadeDuration;
  let opacityFactor = Math.max(0, Math.min(1, ctx.opacity / 100));
  let currentPhase = 0;

  const applyAlpha = (phase: number) => {
    const alpha = Math.max(0, Math.min(1, phase));
    baseLayers.forEach((layer) => {
      layer.uniforms.uOpacity.value = alpha * layer.maxOpacity * opacityFactor;
      const glow = layer.alignment === 'top' ? 0.65 : 0.5;
      layer.uniforms.uGlowOpacity.value = alpha * glow * opacityFactor;
    });
    cardLayers.forEach((layer) => {
      layer.uniforms.uOpacity.value = alpha * 0.85 * opacityFactor;
      layer.uniforms.uGlow.value = 0.2 + 0.5 * alpha * opacityFactor;
    });
  };

  const syncCardLayers = (surfaces: SnowAccumulationSurface[]) => {
    const nextIds = new Set(surfaces.map((surface) => surface.id));
    for (const [id, layer] of cardLayers) {
      if (!nextIds.has(id)) {
        parent.remove(layer.mesh);
        layer.dispose();
        cardLayers.delete(id);
      }
    }

    for (const surface of surfaces) {
      const existing = cardLayers.get(surface.id);
      if (existing) {
        existing.update(surface);
      } else {
        const layer = createSnowAccumulationCardLayer(surface, ctx);
        cardLayers.set(surface.id, layer);
        parent.add(layer.mesh);
      }
    }
    applyAlpha(currentPhase);
  };

  if (ctx.snowSurfaces?.length) {
    syncCardLayers(ctx.snowSurfaces);
  }

  return {
    update(delta, nextOpacity) {
      opacityFactor = nextOpacity;
      timer = (timer + delta) % totalDuration;
      currentPhase =
        timer < accumulateDuration
          ? timer / accumulateDuration
          : 1 - (timer - accumulateDuration) / fadeDuration;
      applyAlpha(currentPhase);
      cardLayers.forEach((layer) => {
        layer.uniforms.uTime.value += delta * 0.3;
      });
    },
    setOpacity(nextOpacity) {
      opacityFactor = nextOpacity;
      applyAlpha(currentPhase);
    },
    onResize(width: number, height: number, _ctx: EffectBuildContext) {
      baseLayers.forEach((layer) => {
        layer.mesh.geometry.dispose();
        layer.mesh.geometry = new THREE.PlaneGeometry(width, height * layer.heightRatio);
        const positionY =
          layer.alignment === 'top'
            ? height / 2 - (height * layer.heightRatio) / 2
            : -height / 2 + (height * layer.heightRatio) / 2;
        layer.mesh.position.set(0, positionY, -3);
      });
      cardLayers.forEach((layer) => layer.update(layer.surface));
      applyAlpha(currentPhase);
    },
    setSurfaces(surfaces, _ctx) {
      syncCardLayers(surfaces);
      cardLayers.forEach((layer) => layer.update(layer.surface));
      applyAlpha(currentPhase);
    },
    dispose() {
      baseLayers.forEach((layer) => {
        parent.remove(layer.mesh);
        layer.mesh.geometry.dispose();
        layer.uniforms.uTexture.value.dispose?.();
        layer.texture.dispose();
        layer.mesh.material.dispose();
      });
      cardLayers.forEach((layer) => {
        parent.remove(layer.mesh);
        layer.dispose();
      });
      cardLayers.clear();
    },
  };
}

function createSnowAccumulationLayer(
  alignment: 'top' | 'bottom',
  ctx: EffectBuildContext
): SnowAccumulationLayer {
  const texture = createSnowAccumulationTexture(alignment);
  const heightRatio = alignment === 'top' ? 0.16 : 0.22;
  const geometry = new THREE.PlaneGeometry(ctx.viewWidth, ctx.viewHeight * heightRatio);
  const uniforms = {
    uOpacity: { value: 0 },
    uGlowOpacity: { value: 0 },
    uThreshold: { value: alignment === 'top' ? 0.5 : 0.35 },
    uTexture: { value: texture },
  };

  const fragmentShader = `
    uniform float uOpacity;
    uniform float uGlowOpacity;
    uniform sampler2D uTexture;
    uniform float uThreshold;
    varying vec2 vUv;

    void main() {
      vec4 tex = texture2D(uTexture, vUv);
      float mask = smoothstep(uThreshold - 0.1, uThreshold + 0.1, tex.a);
      vec3 base = vec3(1.0);
      vec3 glow = vec3(0.9, 0.95, 1.0);
      float glowMask = smoothstep(0.3, 0.9, tex.a);

      vec3 color = mix(base, glow, uGlowOpacity * glowMask);
      float alpha = tex.a * uOpacity;
      gl_FragColor = vec4(color, alpha);
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: fogVertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.NormalBlending,
  });

  const mesh = new THREE.Mesh(geometry, material);
  const positionY =
    alignment === 'top'
      ? ctx.viewHeight / 2 - (ctx.viewHeight * heightRatio) / 2
      : -ctx.viewHeight / 2 + (ctx.viewHeight * heightRatio) / 2;
  mesh.position.set(0, positionY, -3);
  mesh.renderOrder = 12;

  return {
    mesh,
    uniforms,
    texture,
    maxOpacity: alignment === 'top' ? 0.35 : 0.45,
    heightRatio,
    alignment,
  };
}

function createSnowAccumulationTexture(position: 'top' | 'bottom'): THREE.Texture {
  const width = 512;
  const height = 256;
  const surface = createDrawingSurface(width, height);
  const ctx = surface.ctx;

  const gradient = ctx.createLinearGradient(
    0,
    position === 'top' ? 0 : height,
    0,
    position === 'top' ? height : 0
  );
  gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.5)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const lumps = 45;
  for (let i = 0; i < lumps; i++) {
    const lumpWidth = 40 + Math.random() * 120;
    const lumpHeight = 12 + Math.random() * 24;
    const x = Math.random() * width;
    const y =
      position === 'top'
        ? Math.random() * height * 0.45
        : height - Math.random() * height * 0.45;

    ctx.beginPath();
    ctx.ellipse(x, y, lumpWidth, lumpHeight, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fill();
  }

  const texture = createCanvasTexture(surface.canvas);
  texture.needsUpdate = true;
  return texture;
}

function createSnowAccumulationCardLayer(
  surface: SnowAccumulationSurface,
  ctx: EffectBuildContext
): SnowAccumulationCardLayer {
  const geometry = new THREE.PlaneGeometry(1, 1);
  const uniforms: CardAccumulationUniforms = {
    uOpacity: { value: 0 },
    uGlow: { value: 0 },
    uEdgeSoftness: { value: computeEdgeSoftness(surface) },
    uNoiseSeed: { value: Math.random() * 10 },
    uTime: { value: Math.random() * 5 },
  };

  const fragmentShader = `
    varying vec2 vUv;
    uniform float uOpacity;
    uniform float uGlow;
    uniform float uEdgeSoftness;
    uniform float uNoiseSeed;
    uniform float uTime;

    float ease(float t) {
      return t * t * (3.0 - 2.0 * t);
    }

    float ridge(float x) {
      return sin((x + uNoiseSeed) * 18.0 + uTime * 0.5) * 0.35 + 0.65;
    }

    void main() {
      float cap = ease(1.0 - vUv.y);
      float lumps = ridge(vUv.x) * cap;
      float left = smoothstep(0.0, uEdgeSoftness + 0.02, vUv.x);
      float right = smoothstep(0.0, uEdgeSoftness + 0.02, 1.0 - vUv.x);
      float edge = left * right;
      float alpha = clamp(lumps * edge * uOpacity, 0.0, 1.0);
      vec3 base = vec3(1.0);
      vec3 glow = vec3(0.9, 0.95, 1.0);
      vec3 color = mix(base, glow, uGlow);
      gl_FragColor = vec4(color, alpha);
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: fogVertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.NormalBlending,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = -2.9;
  mesh.renderOrder = 14;

  const layer: SnowAccumulationCardLayer = {
    id: surface.id,
    mesh,
    uniforms,
    surface,
    update(nextSurface) {
      this.surface = nextSurface;
      const width = toSceneWidth(ctx, nextSurface.width);
      const height = toSceneHeight(ctx, nextSurface.thickness);
      const centerX = nextSurface.x + nextSurface.width / 2;
      const centerY = nextSurface.y + nextSurface.thickness / 2;
      mesh.scale.set(Math.max(width, 0.001), Math.max(height, 0.001), 1);
      mesh.position.x = toSceneX(ctx, centerX);
      mesh.position.y = toSceneY(ctx, centerY);
      uniforms.uEdgeSoftness.value = computeEdgeSoftness(nextSurface);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };

  layer.update(surface);
  return layer;
}

function computeEdgeSoftness(surface: SnowAccumulationSurface): number {
  if (surface.width <= 0) {
    return 0.05;
  }
  return Math.min(surface.radius / surface.width, 0.3);
}

function toSceneX(ctx: EffectBuildContext, px: number): number {
  const normalized = px / Math.max(1, ctx.viewportWidth);
  return normalized * ctx.viewWidth - ctx.viewWidth / 2;
}

function toSceneY(ctx: EffectBuildContext, px: number): number {
  const normalized = px / Math.max(1, ctx.viewportHeight);
  return ctx.viewHeight / 2 - normalized * ctx.viewHeight;
}

function toSceneWidth(ctx: EffectBuildContext, px: number): number {
  return (px / Math.max(1, ctx.viewportWidth)) * ctx.viewWidth;
}

function toSceneHeight(ctx: EffectBuildContext, px: number): number {
  return (px / Math.max(1, ctx.viewportHeight)) * ctx.viewHeight;
}

function createDrawingSurface(
  width: number,
  height?: number
): {
  canvas: CanvasLike;
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
} {
  const resolvedHeight = height ?? width;
  if (typeof document !== 'undefined' && document.createElement) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = resolvedHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to get 2D context');
    }
    return { canvas, ctx };
  }

  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(width, resolvedHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to get 2D context');
    }
    return { canvas, ctx };
  }

  throw new Error('Canvas is not supported in this environment');
}

function createCanvasTexture(canvas: CanvasLike): THREE.Texture {
  if (typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas) {
    return new THREE.CanvasTexture<OffscreenCanvas>(canvas);
  }
  return new THREE.CanvasTexture<HTMLCanvasElement>(canvas as HTMLCanvasElement);
}
