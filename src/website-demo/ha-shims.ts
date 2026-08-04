/**
 * Minimal shims for Home Assistant frontend elements used by Ultra Card
 * module previews when running outside Home Assistant (ultracard.io).
 * Light-DOM elements so the surrounding shadow root's stylesheets
 * (MDI webfont classes, HA theme vars) apply directly.
 */

function define(tag: string, cls: CustomElementConstructor) {
  if (!customElements.get(tag)) customElements.define(tag, cls);
}

/* ---- shared MDI stylesheet (constructable, fetched once) ---- */
let mdiSheetPromise: Promise<CSSStyleSheet> | null = null;
export function getMdiSheet(): Promise<CSSStyleSheet> {
  if (!mdiSheetPromise) {
    mdiSheetPromise = fetch(
      'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css'
    )
      .then(r => r.text())
      .then(cssText => {
        const abs = cssText.replace(
          /url\("?\.\.\/fonts\//g,
          'url("https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/fonts/'
        );
        const sheet = new CSSStyleSheet();
        return sheet.replace(abs).then(() => sheet);
      });
  }
  return mdiSheetPromise;
}

/* ---- ha-icon: renders the MDI webfont glyph in shadow DOM ----
 * IMPORTANT: must never mutate its light DOM — attributeChangedCallback fires
 * synchronously while lit clones templates, and light-DOM mutation there
 * corrupts lit's part indexing. Shadow DOM mutation is safe. */
class HaIconShim extends HTMLElement {
  static get observedAttributes() {
    return ['icon'];
  }
  private _sr: ShadowRoot;
  private _i: HTMLElement;
  constructor() {
    super();
    this._sr = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent =
      ':host{display:inline-flex;align-items:center;justify-content:center;vertical-align:middle}i{font-size:var(--mdc-icon-size,24px);line-height:1;color:inherit;font-style:normal}';
    this._sr.appendChild(style);
    this._i = document.createElement('i');
    this._sr.appendChild(this._i);
    getMdiSheet()
      .then(sheet => {
        this._sr.adoptedStyleSheets = [sheet];
      })
      .catch(() => {});
  }
  attributeChangedCallback() {
    const name = (this.getAttribute('icon') || '').replace(/^mdi:/, '');
    this._i.className = name ? `mdi mdi-${name}` : '';
  }
  set icon(v: string) {
    this.setAttribute('icon', v || '');
  }
  get icon() {
    return this.getAttribute('icon') || '';
  }
}
define('ha-icon', HaIconShim);

/* ---- ha-slider ---- */
class HaSliderShim extends HTMLElement {
  private _input?: HTMLInputElement;
  connectedCallback() {
    if (this._input) return;
    const sr = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `
      :host{display:inline-block;width:100%;min-width:80px}
      input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:20px;background:transparent;outline:none;margin:0}
      input[type=range]::-webkit-slider-runnable-track{height:6px;border-radius:3px;
        background:var(--slider-track-color, rgba(255,255,255,.22))}
      input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;
        background:var(--slider-color, var(--primary-color,#03a9f4));margin-top:-5px;box-shadow:0 1px 4px rgba(0,0,0,.4)}
      input[type=range]::-moz-range-track{height:6px;border-radius:3px;background:var(--slider-track-color, rgba(255,255,255,.22))}
      input[type=range]::-moz-range-thumb{width:16px;height:16px;border:0;border-radius:50%;background:var(--slider-color, var(--primary-color,#03a9f4))}
    `;
    sr.appendChild(style);
    const i = (this._input = document.createElement('input'));
    i.type = 'range';
    ['min', 'max', 'step', 'value'].forEach(a => {
      if (this.hasAttribute(a)) i.setAttribute(a, this.getAttribute(a)!);
    });
    i.addEventListener('input', () => {
      this.dispatchEvent(new CustomEvent('change', { bubbles: true }));
      this.dispatchEvent(new CustomEvent('value-changed', { detail: { value: Number(i.value) }, bubbles: true }));
    });
    sr.appendChild(i);
  }
  set value(v: any) {
    if (this._input) this._input.value = String(v);
    else this.setAttribute('value', String(v));
  }
  get value() {
    return this._input ? Number(this._input.value) : Number(this.getAttribute('value') || 0);
  }
  set min(v: any) { this._input?.setAttribute('min', String(v)); }
  set max(v: any) { this._input?.setAttribute('max', String(v)); }
  set step(v: any) { this._input?.setAttribute('step', String(v)); }
  set disabled(v: any) { if (this._input) this._input.disabled = !!v; }
}
define('ha-slider', HaSliderShim);

/* ---- ha-switch ---- */
class HaSwitchShim extends HTMLElement {
  private _checked = false;
  connectedCallback() {
    this.style.cssText +=
      'display:inline-block;width:36px;height:20px;border-radius:10px;background:var(--switch-unchecked-track-color,#555);position:relative;cursor:pointer;transition:background .2s';
    this._knob();
    this.addEventListener('click', () => {
      this.checked = !this._checked;
      this.dispatchEvent(new CustomEvent('change', { bubbles: true }));
    });
  }
  private _knob() {
    this.innerHTML = `<span style="position:absolute;top:2px;left:${this._checked ? '18px' : '2px'};width:16px;height:16px;border-radius:50%;background:#fff;transition:left .2s"></span>`;
    this.style.background = this._checked ? 'var(--primary-color,#03a9f4)' : '#555';
  }
  set checked(v: boolean) {
    this._checked = !!v;
    if (this.isConnected) this._knob();
  }
  get checked() {
    return this._checked;
  }
}
define('ha-switch', HaSwitchShim);

/* ---- simple passthrough containers ---- */
class PassThrough extends HTMLElement {}
['ha-card', 'ha-alert', 'ha-expansion-panel', 'ha-dialog'].forEach(t => define(t, class extends PassThrough {}));

/* ---- ha-button ---- */
class HaButtonShim extends HTMLElement {
  connectedCallback() {
    this.style.cssText +=
      'display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;background:var(--primary-color,#03a9f4);color:#fff;font-weight:600;cursor:pointer;font-size:14px';
  }
}
define('ha-button', HaButtonShim);

/* ---- ha-icon-button ---- */
class HaIconButtonShim extends HTMLElement {
  connectedCallback() {
    this.style.cssText += 'display:inline-flex;cursor:pointer;padding:6px;border-radius:50%';
  }
}
define('ha-icon-button', HaIconButtonShim);

/* ---- ha-circular-progress ---- */
class HaProgressShim extends HTMLElement {
  connectedCallback() {
    this.innerHTML =
      '<span style="display:inline-block;width:24px;height:24px;border:3px solid rgba(255,255,255,.2);border-top-color:var(--primary-color,#03a9f4);border-radius:50%;animation:ucdSpin 1s linear infinite"></span>';
  }
}
define('ha-circular-progress', HaProgressShim);

/* ---- ha-camera-stream: real HLS demo feed (San Diego Zoo koala cam) ---- */
const DEMO_HLS = 'https://zssd-koala.hls.camzonecdn.com/CamzoneStreams/zssd-koala/Playlist.m3u8';
let hlsLibPromise: Promise<any> | null = null;
function loadHlsLib(): Promise<any> {
  if (!hlsLibPromise) {
    hlsLibPromise = new Promise((resolve, reject) => {
      if ((window as any).Hls) return resolve((window as any).Hls);
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
      s.onload = () => resolve((window as any).Hls);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return hlsLibPromise;
}
class HaCameraStreamShim extends HTMLElement {
  connectedCallback() {
    if (this.querySelector('video')) return;
    this.style.cssText +=
      'display:block;width:100%;height:100%;min-height:120px;position:relative;background:#0d1117;border-radius:inherit;overflow:hidden';
    const video = document.createElement('video');
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block';
    this.appendChild(video);
    const badge = document.createElement('span');
    badge.style.cssText =
      'position:absolute;top:8px;left:10px;font-size:10px;font-weight:800;color:#ff5252;letter-spacing:.1em;background:rgba(0,0,0,.45);padding:2px 8px;border-radius:99px';
    badge.textContent = '● LIVE';
    this.appendChild(badge);
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = DEMO_HLS;
      video.play().catch(() => {});
    } else {
      loadHlsLib()
        .then(Hls => {
          if (Hls && Hls.isSupported()) {
            const hls = new Hls({ maxBufferLength: 10 });
            hls.loadSource(DEMO_HLS);
            hls.attachMedia(video);
            video.play().catch(() => {});
          }
        })
        .catch(() => {});
    }
  }
}
define('ha-camera-stream', HaCameraStreamShim);

/* ---- shared keyframes (document level) ---- */
if (!document.getElementById('ucd-shim-css')) {
  const s = document.createElement('style');
  s.id = 'ucd-shim-css';
  s.textContent =
    '@keyframes ucdSpin{to{transform:rotate(360deg)}}@keyframes ucdScan{0%{top:8%}50%{top:88%}100%{top:8%}}';
  document.head.appendChild(s);
}
