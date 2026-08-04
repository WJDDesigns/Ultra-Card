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
    const i = (this._input = document.createElement('input'));
    i.type = 'range';
    ['min', 'max', 'step', 'value'].forEach(a => {
      if (this.hasAttribute(a)) i.setAttribute(a, this.getAttribute(a)!);
    });
    i.style.width = '100%';
    i.addEventListener('input', () => {
      this.dispatchEvent(new CustomEvent('change', { bubbles: true }));
      this.dispatchEvent(new CustomEvent('value-changed', { detail: { value: Number(i.value) }, bubbles: true }));
    });
    this.appendChild(i);
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

/* ---- ha-camera-stream: demo placeholder feed ---- */
class HaCameraStreamShim extends HTMLElement {
  connectedCallback() {
    this.style.cssText += 'display:block;width:100%;height:100%;min-height:120px;position:relative;background:linear-gradient(160deg,#2a3440,#151a22 60%,#0d1117);border-radius:inherit;overflow:hidden';
    this.innerHTML = `
      <span style="position:absolute;top:8px;left:10px;font-size:10px;font-weight:800;color:#ff5252;letter-spacing:.1em">● REC</span>
      <span style="position:absolute;bottom:8px;right:10px;font-size:10px;color:#cfe3ff;font-family:monospace" class="ucd-cam-ts"></span>
      <span style="position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(41,182,246,.8),transparent);animation:ucdScan 5s ease-in-out infinite"></span>`;
    const ts = this.querySelector('.ucd-cam-ts') as HTMLElement;
    const tick = () => (ts.textContent = new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    setInterval(tick, 1000);
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
