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

/* ---- hui-entities-card: the demo has no HA core cards, so the Native Card
 * module gets a small stand-in that renders like HA's Entities card. ---- */
function escapeHtml(v: unknown): string {
  return String(v ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
}

const DOMAIN_ICONS: Record<string, string> = {
  light: 'mdi:lightbulb',
  switch: 'mdi:toggle-switch',
  lock: 'mdi:lock',
  sensor: 'mdi:eye',
  binary_sensor: 'mdi:radiobox-blank',
  cover: 'mdi:window-shutter',
  fan: 'mdi:fan',
  climate: 'mdi:thermostat',
};

function formatStateText(stateObj: any): string {
  if (!stateObj) return 'Unavailable';
  const unit = stateObj.attributes?.unit_of_measurement;
  const raw = String(stateObj.state);
  if (unit) return `${raw} ${unit}`;
  return raw.charAt(0).toUpperCase() + raw.slice(1).replace(/_/g, ' ');
}

class HuiEntitiesCardShim extends HTMLElement {
  private _config: any = { entities: [] };
  private _hass: any;
  private _sr = this.attachShadow({ mode: 'open' });

  setConfig(config: any) {
    this._config = config || { entities: [] };
    this._render();
  }
  set hass(h: any) {
    this._hass = h;
    this._render();
  }
  get hass() {
    return this._hass;
  }
  getCardSize() {
    return 1 + (this._config.entities?.length || 0);
  }

  private _render() {
    const rows = (this._config.entities || []).map((e: any) => (typeof e === 'string' ? { entity: e } : e));
    const states = this._hass?.states || {};
    const rowHtml = rows
      .map((r: any) => {
        const so = states[r.entity];
        const domain = String(r.entity || '').split('.')[0];
        const name = r.name || so?.attributes?.friendly_name || r.entity;
        const icon = r.icon || so?.attributes?.icon || DOMAIN_ICONS[domain] || 'mdi:bookmark';
        const on = ['on', 'unlocked', 'open'].includes(so?.state);
        const toggle = domain === 'light' || domain === 'switch' || domain === 'fan';
        const value = toggle
          ? `<span class="tg ${on ? 'on' : ''}"><span></span></span>`
          : `<span class="val">${escapeHtml(formatStateText(so))}</span>`;
        return `<div class="row"><ha-icon class="${on ? 'active' : ''}" icon="${escapeHtml(icon)}"></ha-icon>
          <span class="name">${escapeHtml(name)}</span>${value}</div>`;
      })
      .join('');
    const title = this._config.title
      ? `<div class="hd">${escapeHtml(this._config.title)}</div>`
      : '';
    this._sr.innerHTML = `<style>
      :host{display:block}
      .card{background:var(--ha-card-background,var(--card-background-color,#1c1c1c));border-radius:var(--ha-card-border-radius,12px);
        border:1px solid var(--divider-color,rgba(255,255,255,.12));color:var(--primary-text-color,#e1e1e1);padding:4px 0 8px}
      .hd{font-size:22px;line-height:28px;padding:16px 16px 4px;letter-spacing:-.01em}
      .row{display:flex;align-items:center;gap:16px;padding:0 16px;height:40px}
      ha-icon{color:var(--state-icon-color,#44739e);width:40px;--mdc-icon-size:24px}
      ha-icon.active{color:var(--state-icon-active-color,#fdd835)}
      .name{flex:1;font-size:14px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
      .val{font-size:14px;color:var(--primary-text-color,#e1e1e1)}
      .tg{width:34px;height:14px;border-radius:7px;background:rgba(255,255,255,.3);position:relative}
      .tg span{position:absolute;top:-3px;left:-2px;width:20px;height:20px;border-radius:50%;background:#bdbdbd;box-shadow:0 1px 3px rgba(0,0,0,.4)}
      .tg.on{background:color-mix(in srgb,var(--primary-color,#03a9f4) 50%,transparent)}
      .tg.on span{left:16px;background:var(--primary-color,#03a9f4)}
    </style><div class="card">${title}${rowHtml}</div>`;
  }
}
define('hui-entities-card', HuiEntitiesCardShim);

/* ---- uc-demo-third-party-card: a neutral stand-in for a community card, so
 * the External Card module shows a mounted card. Plots a sensor's 24 h trend. */
class UcDemoThirdPartyCard extends HTMLElement {
  private _config: any = {};
  private _hass: any;
  private _sr = this.attachShadow({ mode: 'open' });

  setConfig(config: any) {
    if (!config?.entity) throw new Error('entity is required');
    this._config = config;
    this._render();
  }
  set hass(h: any) {
    this._hass = h;
    this._render();
  }
  getCardSize() {
    return 3;
  }

  private _render() {
    const so = this._hass?.states?.[this._config.entity];
    if (!so) return;
    const cur = parseFloat(so.state) || 0;
    // A stable, plausible day curve ending at the current value.
    const pts = Array.from({ length: 25 }, (_, i) => {
      const t = i / 24;
      return cur * (0.55 + 0.35 * Math.sin(t * Math.PI * 2.2 - 1.3) + 0.12 * Math.sin(t * 19)) ;
    });
    pts[24] = cur;
    const min = Math.min(...pts);
    const max = Math.max(...pts);
    const span = max - min || 1;
    const W = 300;
    const H = 70;
    const xy = pts.map((v, i) => [(i / 24) * W, H - 4 - ((v - min) / span) * (H - 10)]);
    const line = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const color = this._config.color || 'var(--accent-color,#ff9800)';
    const unit = so.attributes?.unit_of_measurement || '';
    const name = this._config.name || so.attributes?.friendly_name || this._config.entity;
    this._sr.innerHTML = `<style>
      :host{display:block}
      .card{background:var(--ha-card-background,var(--card-background-color,#1c1c1c));border-radius:var(--ha-card-border-radius,12px);
        border:1px solid var(--divider-color,rgba(255,255,255,.12));color:var(--primary-text-color,#e1e1e1);padding:14px 16px 10px;overflow:hidden}
      .top{display:flex;justify-content:space-between;align-items:baseline}
      .name{font-size:13px;color:var(--secondary-text-color,#9b9b9b)}
      .val{font-size:28px;font-weight:600}
      .val small{font-size:14px;font-weight:400;color:var(--secondary-text-color,#9b9b9b);margin-left:3px}
      .rng{display:flex;justify-content:space-between;font-size:11px;color:var(--secondary-text-color,#9b9b9b)}
      svg{display:block;width:100%;height:70px;margin:6px 0 2px}
    </style>
    <div class="card">
      <div class="top"><span class="name">${escapeHtml(name)}</span><span class="name">${escapeHtml(this._config.hours_to_show || 24)} h</span></div>
      <div class="val">${escapeHtml(Math.round(cur).toLocaleString('en-US'))}<small>${escapeHtml(unit)}</small></div>
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
        <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${color}" stop-opacity=".35"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
        <path d="${line} L${W},${H} L0,${H} Z" fill="url(#g)"/>
        <path d="${line}" fill="none" stroke="${color}" stroke-width="2.2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
      </svg>
      <div class="rng"><span>min ${escapeHtml(Math.round(min))}</span><span>max ${escapeHtml(Math.round(max))}</span></div>
    </div>`;
  }
}
define('uc-demo-third-party-card', UcDemoThirdPartyCard);

/* ---- shared keyframes (document level) ---- */
if (!document.getElementById('ucd-shim-css')) {
  const s = document.createElement('style');
  s.id = 'ucd-shim-css';
  s.textContent =
    '@keyframes ucdSpin{to{transform:rotate(360deg)}}@keyframes ucdScan{0%{top:8%}50%{top:88%}100%{top:8%}}';
  document.head.appendChild(s);
}
