import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import * as THREE from 'three';
import type { LivingCanvasModule, LivingCanvasPreset } from '../types';
import { getLivingCanvasPresetColors, resolveLivingCanvasColor } from '../utils/uc-living-canvas-colors';

/** Detect visual/config changes when the same object reference is mutated (HA editor). */
function livingCanvasModuleVisualSignature(m: LivingCanvasModule | undefined): string {
  if (!m || typeof m !== 'object') return '';
  return [
    m.preset,
    m.speed,
    m.intensity,
    m.quality,
    m.opacity,
    m.position,
    m.enabled,
    m.respect_reduced_motion,
    m.enable_on_mobile,
    m.canvas_color_background,
    m.canvas_color_primary,
    m.canvas_color_secondary,
  ].join('|');
}

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// All presets output fully-opaque pixels — opacity is handled by CSS on the wrapper layer.
const FRAG = `
precision highp float;
varying vec2 vUv;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_intensity;
uniform float u_speed;
uniform float u_driver0;
uniform float u_driver1;
uniform float u_preset;
uniform vec3 u_color_bg;
uniform vec3 u_color_a;
uniform vec3 u_color_b;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = vUv;
  float t = u_time * u_speed * 0.35;
  vec3 col = u_color_bg;

  if (u_preset < 0.5) {
    // Aurora
    float n = noise(uv * 4.0 + vec2(t * 0.8, t * 0.45));
    float bands = sin(uv.y * 9.0 + t * 2.2 + n * 3.5);
    vec3 a = mix(u_color_bg * 0.55, u_color_a, smoothstep(-0.15, 0.75, bands * 0.5 + 0.5));
    col = mix(a, u_color_b, n * 0.4 * (0.3 + u_driver0 * 0.7));
    col += mix(u_color_bg, u_color_a, 0.65) * u_driver1 * 0.35;
  } else if (u_preset < 1.5) {
    // Plasma
    float v = sin(uv.x * 12.0 + t) + sin(uv.y * 11.0 + t * 1.07) + sin((uv.x + uv.y) * 9.0 + t * 0.9);
    v += noise(uv * 7.0 + t * 0.5) * 2.2;
    vec3 wave = vec3(0.45) + 0.55 * vec3(cos(v), cos(v + 2.1), cos(v + 4.2));
    vec3 pal = mix(wave, u_color_a, 0.5);
    col = mix(u_color_bg, pal, 0.85 + u_driver0 * 0.15);
    col += u_color_b * u_driver1 * 0.2;
  } else if (u_preset < 2.5) {
    // Particles (star field)
    vec2 gv = uv * u_resolution / 72.0;
    vec2 id = floor(gv);
    vec2 f = fract(gv) - 0.5;
    float h = hash(id + floor(t * 2.8));
    float flicker = step(0.9, h);
    float dist = length(f);
    float star = flicker * smoothstep(0.42, 0.0, dist);
    col = mix(u_color_bg, u_color_a, star);
    col += mix(u_color_a, u_color_b, 0.45) * u_driver0 * 0.25 * star;
    col += u_color_b * u_driver1 * 0.15 * noise(uv * 20.0 + t);
  } else {
    // Mesh gradient
    float tri = abs(fract(uv.x * 3.5 + t * 0.06) - 0.5) + abs(fract(uv.y * 3.5 - t * 0.04) - 0.5);
    float n = noise(uv * 2.5 + t * 0.1);
    col = mix(u_color_bg, u_color_a, smoothstep(0.15, 0.85, tri + u_driver0 * 0.25 + n * 0.08));
    col = mix(col, u_color_b, u_driver1 * 0.3 + n * 0.12);
  }

  col *= u_intensity;
  gl_FragColor = vec4(col, 1.0);
}
`;

function presetToIndex(preset: LivingCanvasPreset | undefined): number {
  switch (preset) {
    case 'plasma':
      return 1;
    case 'particles':
      return 2;
    case 'mesh':
      return 3;
    case 'aurora':
    default:
      return 0;
  }
}

function qualityToDpr(quality: string | undefined, devicePixelRatio: number): number {
  const dpr = devicePixelRatio || 1;
  if (quality === 'low') return Math.min(dpr, 1) * 0.75;
  if (quality === 'high') return Math.min(dpr, 2);
  return Math.min(dpr, 1.5);
}

@customElement('uc-living-canvas')
export class UcLivingCanvas extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
      min-height: 180px;
      position: relative;
      overflow: hidden;
    }
    :host([fill-viewport]) {
      min-height: 0;
      height: 100%;
      width: 100%;
    }
    .uc-lc-host {
      width: 100%;
      height: 100%;
      min-height: inherit;
      position: relative;
    }
    canvas {
      display: block;
      width: 100% !important;
      height: 100% !important;
    }
  `;

  @property({
    type: Object,
    attribute: false,
    hasChanged(n: LivingCanvasModule | undefined, o: LivingCanvasModule | undefined) {
      return livingCanvasModuleVisualSignature(n) !== livingCanvasModuleVisualSignature(o);
    },
  })
  public module!: LivingCanvasModule;

  @property({ attribute: false })
  public hass!: HomeAssistant;

  @property({ type: Boolean, reflect: true, attribute: 'fill-viewport' })
  public fillViewport = false;

  @property({ type: Number })
  public driver0 = 0;

  @property({ type: Number })
  public driver1 = 0;

  private _container: HTMLDivElement | undefined;
  private _renderer: THREE.WebGLRenderer | undefined;
  private _scene: THREE.Scene | undefined;
  private _camera: THREE.OrthographicCamera | undefined;
  private _mesh: THREE.Mesh | undefined;
  private _material: THREE.ShaderMaterial | undefined;
  private _raf = 0;
  private _resizeObserver: ResizeObserver | undefined;
  private _frozenTime = 0;
  private _hiddenListener: (() => void) | undefined;
  private _reducedMql: MediaQueryList | undefined;
  private _reducedListener: (() => void) | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    void this.updateComplete.then(() => {
      if (this.isConnected && !this._renderer && this.module) {
        this._initThree();
      }
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._teardown();
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (this._material && (changed.has('module') || changed.has('hass'))) {
      this._syncAllUniforms(this.module);
    }
    if ((changed.has('driver0') || changed.has('driver1')) && this._material) {
      this._material.uniforms.u_driver0.value = Math.max(0, Math.min(1, this.driver0));
      this._material.uniforms.u_driver1.value = Math.max(0, Math.min(1, this.driver1));
    }
    if (changed.has('module') && this.isConnected && !this._renderer && this.module) {
      void this.updateComplete.then(() => {
        if (!this._renderer && this.isConnected && this.module) {
          this._initThree();
        }
      });
    }
  }

  override render() {
    return html`<div class="uc-lc-host"></div>`;
  }

  /** Map module colors from config into shader uniforms. */
  private _syncColors(): void {
    if (!this._material || !this.module) return;
    const m = this.module;
    const defs = getLivingCanvasPresetColors(m.preset);
    const doc = this.ownerDocument || document;
    const bg = resolveLivingCanvasColor(doc, m.canvas_color_background, defs.background);
    const pa = resolveLivingCanvasColor(doc, m.canvas_color_primary, defs.primary);
    const sb = resolveLivingCanvasColor(doc, m.canvas_color_secondary, defs.secondary);
    this._material.uniforms.u_color_bg.value.set(bg[0], bg[1], bg[2]);
    this._material.uniforms.u_color_a.value.set(pa[0], pa[1], pa[2]);
    this._material.uniforms.u_color_b.value.set(sb[0], sb[1], sb[2]);
  }

  /** Sync all uniforms from a module object. Called both by updated() and applyModule(). */
  private _syncAllUniforms(m: LivingCanvasModule): void {
    if (!this._material) return;
    this._material.uniforms.u_preset.value = presetToIndex(m.preset);
    this._material.uniforms.u_intensity.value = Math.max(0, Math.min(1, ((m.intensity ?? 70) as number) / 100));
    this._material.uniforms.u_speed.value = Math.max(0.25, Math.min(3, m.speed ?? 1));
    this._syncColors();
    this._onResize();
  }

  /**
   * Imperative update called by the service — updates the module reference and
   * immediately pushes all shader uniforms without waiting for Lit's async cycle.
   * This guarantees real-time response when the user changes preset, colors, etc.
   */
  public applyModule(m: LivingCanvasModule): void {
    // Store raw so Lit tracking also stays consistent
    (this as any).__module = m;
    this.module = m;
    if (this._material) {
      this._syncAllUniforms(m);
    } else if (this.isConnected) {
      // Three.js not yet initialized; init now with the correct preset
      void this.updateComplete.then(() => {
        if (!this._renderer && this.isConnected && this.module) {
          this._initThree();
        }
      });
    }
  }

  private _teardown(): void {
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = 0;
    }
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
    if (this._hiddenListener) {
      document.removeEventListener('visibilitychange', this._hiddenListener);
      this._hiddenListener = undefined;
    }
    if (this._reducedMql && this._reducedListener) {
      this._reducedMql.removeEventListener('change', this._reducedListener);
    }
    this._reducedMql = undefined;
    this._reducedListener = undefined;
    this._mesh?.geometry.dispose();
    if (this._material) {
      this._material.dispose();
    }
    this._renderer?.dispose();
    if (this._renderer?.domElement?.parentElement) {
      this._renderer.domElement.parentElement.removeChild(this._renderer.domElement);
    }
    this._renderer = undefined;
    this._scene = undefined;
    this._camera = undefined;
    this._mesh = undefined;
    this._material = undefined;
  }

  private _initThree(): void {
    if (this._renderer) return;
    const host = this.renderRoot.querySelector('.uc-lc-host') as HTMLDivElement | null;
    if (!host || !this.module) return;
    this._container = host;

    const mod = this.module;
    const intensity = Math.max(0, Math.min(1, ((mod.intensity ?? 70) as number) / 100));
    const speed = Math.max(0.25, Math.min(3, mod.speed ?? 1));
    const dpr = qualityToDpr(mod.quality, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);

    this._scene = new THREE.Scene();
    this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this._camera.position.z = 0;

    this._material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(1, 1) },
        u_intensity: { value: intensity },
        u_speed: { value: speed },
        u_driver0: { value: Math.max(0, Math.min(1, this.driver0)) },
        u_driver1: { value: Math.max(0, Math.min(1, this.driver1)) },
        u_preset: { value: presetToIndex(mod.preset) },
        u_color_bg: { value: new THREE.Vector3(0.04, 0.06, 0.1) },
        u_color_a: { value: new THREE.Vector3(1, 1, 1) },
        u_color_b: { value: new THREE.Vector3(1, 1, 1) },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      depthTest: false,
      depthWrite: false,
    });
    this._syncAllUniforms(mod);

    const geometry = new THREE.PlaneGeometry(2, 2);
    this._mesh = new THREE.Mesh(geometry, this._material);
    this._scene.add(this._mesh);

    this._renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'low-power',
    });
    this._renderer.setPixelRatio(dpr);
    this._renderer.setClearColor(0x050608, 1);
    host.appendChild(this._renderer.domElement);

    this._resizeObserver = new ResizeObserver(() => this._onResize());
    this._resizeObserver.observe(host);
    this._onResize();

    this._hiddenListener = () => {
      if (!document.hidden) this._frozenTime = performance.now() / 1000;
    };
    document.addEventListener('visibilitychange', this._hiddenListener);

    this._reducedMql = window.matchMedia('(prefers-reduced-motion: reduce)');
    this._reducedListener = () => {
      this._frozenTime = performance.now() / 1000;
    };
    this._reducedMql.addEventListener('change', this._reducedListener);

    const loop = () => {
      this._raf = requestAnimationFrame(loop);
      if (!this._material || !this._renderer || !this._scene || !this._camera) return;
      if (document.hidden) return;
      const respect = this.module?.respect_reduced_motion !== false;
      const reduced = respect && this._reducedMql?.matches;
      this._material.uniforms.u_time.value = reduced ? this._frozenTime : performance.now() / 1000;
      this._renderer.render(this._scene, this._camera);
    };
    this._frozenTime = performance.now() / 1000;
    loop();
  }

  private _onResize(): void {
    if (!this._container || !this._renderer || !this._material) return;
    const w = Math.max(1, Math.floor(this._container.clientWidth));
    const h = Math.max(1, Math.floor(this._container.clientHeight));
    const mod = this.module;
    const dpr = qualityToDpr(mod?.quality, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
    this._renderer.setPixelRatio(dpr);
    this._renderer.setSize(w, h, false);
    this._material.uniforms.u_resolution.value.set(w * dpr, h * dpr);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-living-canvas': UcLivingCanvas;
  }
}
