/*! For license information please see ultra-card-panel.js.LICENSE.txt */
var t={6478(t,e,r){r.d(e,{BT:()=>p,JM:()=>f,kg:()=>g});var o=r(9879);const i={en:()=>r.e(1543).then(()=>r.t(389,19)),ca:()=>r.e(2198).then(()=>r.t(8434,19)),cs:()=>r.e(7364).then(()=>r.t(9504,19)),da:()=>r.e(3751).then(()=>r.t(4149,19)),de:()=>r.e(931).then(()=>r.t(369,19)),"en-GB":()=>r.e(4351).then(()=>r.t(1885,19)),es:()=>r.e(4866).then(()=>r.t(8302,19)),fr:()=>r.e(3258).then(()=>r.t(5222,19)),it:()=>r.e(969).then(()=>r.t(4895,19)),nb:()=>r.e(6722).then(()=>r.t(4542,19)),nl:()=>r.e(1948).then(()=>r.t(6920,19)),nn:()=>r.e(9150).then(()=>r.t(5466,19)),no:()=>r.e(1959).then(()=>r.t(9093,19)),pl:()=>r.e(6870).then(()=>r.t(9026,19)),sv:()=>r.e(4377).then(()=>r.t(991,19))},n="en",s="uc-locale-loaded",a={},l=new Map,c=new Set;function d(t){return t.includes("-")||t.includes("_")?t.split(/[-_]/)[0]:t}function u(t){if(!t)return;if(i[t])return t;const e=d(t);return e!==t&&i[e]?e:void 0}function h(t){const e=u(t);if(!e||a[e]||c.has(e))return Promise.resolve();const r=l.get(e);if(r)return r;const n=i[e]().then(t=>{a[e]=function(t){return t&&"object"==typeof t.default&&t.default||t}(t),l.delete(e),"undefined"!=typeof window&&window.dispatchEvent(new CustomEvent(s,{detail:{lang:e}}))}).catch(t=>{l.delete(e),c.add(e),(0,o.Sn)(t,`locale ${e}`)});return l.set(e,n),n}function p(t){if("undefined"==typeof window)return()=>{};const e=e=>{var r,o;return t(null!==(o=null===(r=e.detail)||void 0===r?void 0:r.lang)&&void 0!==o?o:"")};return window.addEventListener(s,e),()=>window.removeEventListener(s,e)}function b(t,e){try{const r=a[e];if(!r)return;const o=t.split(".").reduce((t,e)=>{if(null!==t&&"object"==typeof t)return t[e]},r);return"string"==typeof o?o:void 0}catch(t){return}}function f(){return h(n)}function g(t,e,r){e&&!function(t){const e=u(t);return!e||!!a[e]}(e)&&h(e),a[n]||l.has(n)||c.has(n)||h(n);let o=b(t,e);if(o)return o;const i=d(e);if(i&&i!==e&&(o=b(t,i),o))return o;if(i!==n){const e=b(t,n);if(e)return e}return r||t}Object.freeze(Object.keys(i))},821(t,e,r){r.d(e,{DC:()=>s,nL:()=>i});const o="hub-navigate-tab";function i(t,e){t.dispatchEvent(new CustomEvent(o,{detail:e,bubbles:!0,composed:!0}))}const n="ultra_card_hub_pending_docs_slug";function s(t){try{localStorage.setItem(n,t),localStorage.setItem("ultra_card_hub_tab","docs")}catch(t){}var e;e={tab:"docs",slug:t},"undefined"!=typeof document&&i(document,e)}r.d(e,["eo",0,n,"zP",0,o])},9978(t,e,r){const o=r(2618).AH`
  :host {
    display: flex;
    flex-direction: column;
    /* Prevent the host itself from scrolling — only .hub-content should scroll */
    overflow: hidden;
    background: var(--primary-background-color);
    color: var(--primary-text-color);
    box-sizing: border-box;

    /* Hub design tokens — every tab reads these so surfaces, radii and
       borders stay consistent. All fall back to HA theme variables. */
    --uc-hub-primary-rgb: var(--rgb-primary-color, 3, 169, 244);
    --uc-hub-surface: var(--ha-card-background, var(--card-background-color, #fff));
    --uc-hub-surface-2: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
    --uc-hub-border: var(--divider-color, rgba(0, 0, 0, 0.08));
    --uc-hub-radius-lg: var(--ha-card-border-radius, 14px);
    --uc-hub-radius-md: 10px;
    --uc-hub-radius-sm: 8px;
    --uc-hub-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
    --uc-hub-shadow-md: 0 6px 20px rgba(0, 0, 0, 0.08);
    --uc-hub-content-max: 1440px;
    --uc-hub-focus-ring: 0 0 0 3px rgba(var(--uc-hub-primary-rgb), 0.35);
  }

  :where(button, [role='tab'], a, input, select, textarea):focus-visible {
    outline: none;
    box-shadow: var(--uc-hub-focus-ring);
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  .hub-container {
    display: flex;
    flex-direction: column;
    /* Must fill host and be bounded so inner scroll works */
    flex: 1;
    min-height: 0;
    /* Clip any overflow so the page itself never scrolls */
    overflow: hidden;
    box-sizing: border-box;
  }

  .hub-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px 10px;
    gap: 12px;
    min-height: 60px;
    box-sizing: border-box;
    /* Prevent header from ever growing or scrolling away */
    overflow: hidden;
    background: var(--uc-hub-surface);
  }

  .hub-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  .hub-brand-mark {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: linear-gradient(
      135deg,
      var(--primary-color),
      var(--accent-color, var(--primary-color))
    );
    box-shadow: 0 2px 6px rgba(var(--uc-hub-primary-rgb), 0.3);
  }

  .hub-brand-mark ha-icon {
    --mdc-icon-size: 20px;
  }

  .hub-brand-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.15;
  }

  .hub-header h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--primary-text-color);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .hub-brand-sub {
    font-size: 12px;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }

  @media (max-width: 870px) {
    .hub-header {
      padding: 8px 12px 8px 8px;
      gap: 8px;
      min-height: 56px;
    }
    .hub-header h1 {
      font-size: 18px;
    }
    .hub-brand-mark {
      width: 32px;
      height: 32px;
      border-radius: 9px;
    }
    .hub-brand-sub {
      display: none;
    }
  }

  .hub-account-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px 6px 8px;
    border-radius: 999px;
    background: var(--uc-hub-surface-2);
    border: 1px solid var(--uc-hub-border);
    color: var(--primary-text-color);
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
    flex-shrink: 0;
    max-width: 260px;
  }

  .hub-account-chip span:first-of-type {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .hub-account-chip:hover {
    border-color: rgba(var(--uc-hub-primary-rgb), 0.5);
    background: rgba(var(--uc-hub-primary-rgb), 0.06);
  }

  .hub-account-chip ha-icon {
    --mdc-icon-size: 20px;
    color: var(--primary-color);
  }

  .hub-tier-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .hub-tier-badge.pro {
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
    color: var(--primary-color);
  }

  .hub-tier-badge.free {
    background: rgba(158, 158, 158, 0.15);
    color: var(--secondary-text-color);
  }

  .hub-sign-in-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 999px;
    border: none;
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: filter 0.15s ease, transform 0.15s ease;
    flex-shrink: 0;
  }

  .hub-sign-in-btn:hover {
    filter: brightness(1.08);
  }

  .hub-sign-in-btn ha-icon {
    --mdc-icon-size: 16px;
  }

  .hub-tabs {
    flex-shrink: 0;
  }

  .hub-content {
    flex: 1;
    min-height: 0;
    /* Only this region scrolls — vertically only */
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 24px;
    box-sizing: border-box;
  }

  /* Centre content on very wide screens so cards don't stretch edge to edge. */
  .hub-page {
    width: 100%;
    max-width: var(--uc-hub-content-max);
    margin: 0 auto;
  }

  /* Shared buttons */
  .hub-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: var(--uc-hub-radius-sm);
    border: 1px solid var(--uc-hub-border);
    background: var(--uc-hub-surface);
    color: var(--primary-text-color);
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.2;
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease,
      filter 0.15s ease;
  }

  .hub-btn ha-icon {
    --mdc-icon-size: 16px;
  }

  .hub-btn:hover:not(:disabled) {
    border-color: rgba(var(--uc-hub-primary-rgb), 0.5);
    color: var(--primary-color);
  }

  .hub-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .hub-btn--primary {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }

  .hub-btn--primary:hover:not(:disabled) {
    color: var(--text-primary-color, #fff);
    border-color: var(--primary-color);
    filter: brightness(1.08);
  }

  .hub-btn--outline {
    background: transparent;
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  .hub-btn--outline:hover:not(:disabled) {
    background: rgba(var(--uc-hub-primary-rgb), 0.08);
  }

  .hub-btn--ghost {
    background: transparent;
    border-color: transparent;
    color: var(--secondary-text-color);
  }

  .hub-btn--ghost:hover:not(:disabled) {
    background: var(--uc-hub-surface-2);
    border-color: transparent;
    color: var(--primary-text-color);
  }

  .hub-btn--sm {
    padding: 5px 10px;
    font-size: 12px;
  }

  .hub-btn .spin {
    animation: hubSpin 1s linear infinite;
  }

  /* Sync banner — shared by Favorites, Colors and Variables */
  .sync-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: var(--uc-hub-radius-md);
    margin-bottom: 16px;
    font-size: 13px;
    background: var(--uc-hub-surface);
    border: 1px solid var(--uc-hub-border);
  }

  .sync-banner ha-icon {
    --mdc-icon-size: 20px;
    flex-shrink: 0;
    color: var(--secondary-text-color);
  }

  .sync-banner-guest {
    background: rgba(var(--uc-hub-primary-rgb), 0.06);
    border-color: rgba(var(--uc-hub-primary-rgb), 0.18);
  }

  .sync-banner-guest ha-icon {
    color: var(--primary-color);
  }

  .sync-banner-active {
    background: rgba(76, 175, 80, 0.07);
    border-color: rgba(76, 175, 80, 0.22);
  }

  .sync-banner-active ha-icon {
    color: var(--success-color, #4caf50);
  }

  .sync-banner-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .sync-banner-body strong {
    font-weight: 600;
    color: var(--primary-text-color);
  }

  .sync-banner-body span {
    color: var(--secondary-text-color);
    font-size: 12px;
    line-height: 1.4;
  }

  .sync-banner-btn {
    flex-shrink: 0;
    padding: 6px 12px;
    border-radius: var(--uc-hub-radius-sm);
    border: 1px solid var(--primary-color);
    background: none;
    color: var(--primary-color);
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .sync-banner-btn:hover:not(:disabled) {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }

  .sync-banner-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    .sync-banner {
      flex-wrap: wrap;
    }
    .sync-banner-btn {
      margin-left: 32px;
    }
  }

  /* Page-level toolbar (search + filters + actions) */
  .hub-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
  }

  .hub-search {
    flex: 1;
    min-width: 200px;
    max-width: 360px;
    position: relative;
  }

  .hub-search input {
    width: 100%;
    padding: 10px 14px 10px 40px;
    border: 1px solid var(--uc-hub-border);
    border-radius: var(--uc-hub-radius-md);
    background: var(--uc-hub-surface);
    color: var(--primary-text-color);
    font: inherit;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }

  .hub-search input:focus {
    border-color: var(--primary-color);
    box-shadow: var(--uc-hub-focus-ring);
  }

  .hub-search ha-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    --mdc-icon-size: 20px;
    color: var(--secondary-text-color);
    pointer-events: none;
  }

  /* Stat tiles */
  .stat-tiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }

  .stat-tile {
    padding: 14px 16px;
    background: var(--uc-hub-surface-2);
    border: 1px solid var(--uc-hub-border);
    border-radius: var(--uc-hub-radius-md);
  }

  .stat-tile-value {
    font-size: 26px;
    font-weight: 700;
    line-height: 1.15;
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
  }

  .stat-tile-label {
    margin-top: 4px;
    font-size: 12px;
    color: var(--secondary-text-color);
  }

  .stat-tile-value.ok {
    color: var(--success-color, #4caf50);
  }

  .stat-tile-value.bad {
    color: var(--error-color, #f44336);
  }

  @keyframes hubSpin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Shared loading placeholder (centered spinner + label) */
  .hub-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 48px 24px;
    color: var(--secondary-text-color);
    font-size: 14px;
    text-align: center;
  }

  .hub-loading ha-icon {
    --mdc-icon-size: 32px;
    color: var(--primary-color);
    animation: hubSpin 1s linear infinite;
  }

  /* Section cards (used by pro tab, etc.) */
  .hub-section {
    background: var(--uc-hub-surface);
    border-radius: var(--uc-hub-radius-lg);
    border: 1px solid var(--uc-hub-border);
    box-shadow: var(--uc-hub-shadow-sm);
    padding: 24px;
    margin-bottom: 20px;
  }

  .hub-section:last-child {
    margin-bottom: 0;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
  }

  .header-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color, var(--primary-color)));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .header-icon ha-icon {
    --mdc-icon-size: 24px;
    color: white;
  }

  .header-content h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--primary-text-color);
  }

  .header-content p {
    margin: 4px 0 0 0;
    font-size: 13px;
    color: var(--secondary-text-color);
  }

  /* Empty states */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 60px 24px;
    color: var(--secondary-text-color);
  }

  .empty-state-icon {
    width: 72px;
    height: 72px;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    background: rgba(var(--uc-hub-primary-rgb), 0.1);
    border: 1px solid rgba(var(--uc-hub-primary-rgb), 0.18);
  }

  .empty-state-icon ha-icon {
    --mdc-icon-size: 36px;
    color: var(--primary-color);
  }

  .empty-state .hub-btn {
    margin-top: 18px;
  }

  .empty-state h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--primary-text-color);
  }

  .empty-state p {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    max-width: 400px;
    color: var(--secondary-text-color);
  }

  .empty-state .empty-hint {
    margin-top: 6px;
    font-size: 12px;
    opacity: 0.7;
  }

  /* Grids */
  .grid-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  @media (max-width: 870px) {
    .grid-cards {
      grid-template-columns: 1fr;
    }
    .hub-content {
      padding: 12px;
    }
    .hub-section {
      padding: 16px;
    }
  }

  /* Action buttons (small icon buttons) */
  .action-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    border-radius: 8px;
    color: var(--secondary-text-color);
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
  }

  .action-btn:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
  }

  .action-btn.delete:hover {
    border-color: var(--error-color, #f44336);
    color: var(--error-color, #f44336);
    background: rgba(244, 67, 54, 0.08);
  }

  .action-btn ha-icon {
    --mdc-icon-size: 16px;
  }

  /* Toast notification */
  .toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: var(--primary-text-color);
    color: var(--primary-background-color);
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    z-index: 999;
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: none;
  }

  .toast.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  /* Section title standalone */
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--primary-text-color);
    margin: 0 0 16px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Filter chips */
  .filter-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }

  .filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    background: var(--ha-card-background, var(--card-background-color));
    color: var(--secondary-text-color);
    transition: all 0.2s ease;
    user-select: none;
  }

  .filter-chip:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  .filter-chip.active {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border-color: var(--primary-color);
  }

  .filter-chip ha-icon {
    --mdc-icon-size: 16px;
  }

  /* Tab intro blurb (what this tab is for) */
  .hub-tab-blurb {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    margin-bottom: 16px;
    background: rgba(var(--uc-hub-primary-rgb), 0.06);
    border: 1px solid rgba(var(--uc-hub-primary-rgb), 0.15);
    border-radius: var(--uc-hub-radius-md);
    font-size: 13px;
    color: var(--secondary-text-color);
    line-height: 1.45;
  }

  .hub-tab-blurb ha-icon {
    --mdc-icon-size: 20px;
    color: var(--primary-color);
    flex-shrink: 0;
    margin-top: 1px;
  }

  .hub-tab-blurb p {
    margin: 0;
  }

  .hub-tab-blurb strong {
    color: var(--primary-text-color);
  }

  .hub-tab-blurb code {
    background: var(--uc-hub-surface-2);
    border: 1px solid var(--uc-hub-border);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-family: var(--code-font-family, 'SF Mono', 'Fira Code', monospace);
  }

  /* Animations */
  @keyframes fadeSlideIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;r.d(e,["z",0,o])},378(t,e,r){r.d(e,{xd:()=>f});var o=r(3045);class i{constructor(){this._sessionId=null,this._isEnabled=!1,this._listeners=new Set,this._deviceId=this._getOrCreateDeviceId(),this._sessionId=this._loadSessionId()}isEnabled(){return this._isEnabled}enable(){this._isEnabled=!0}disable(){this._isEnabled=!1,this.stopPolling(),o.v3&&console.log("📴 Cloud session sync disabled")}async createSession(t,e){if(!this._isEnabled)return o.v3&&console.log("📝 Cloud session sync disabled, skipping session creation"),null;try{o.v3&&console.log("🔄 Creating cloud session...");const r=await fetch(`${i.API_BASE}/ultra-card/v1/session/create`,{method:"POST",headers:{Authorization:`Bearer ${t.token}`,"Content-Type":"application/json"},body:JSON.stringify({device_id:this._deviceId,device_name:this._getDeviceName(),user_id:t.id,ha_user_id:e})});if(!r.ok)throw new Error(`Session creation failed: ${r.status}`);const n=await r.json();if(n.success&&n.session_id)return this._sessionId=n.session_id,this._saveSessionId(n.session_id),n.session_id;throw new Error("Invalid session response")}catch(t){return console.warn("⚠️ Failed to create cloud session, using local-only mode:",t),null}}async getCurrentSession(t,e){var r;if(!this._isEnabled)return null;try{o.v3&&console.log("🔄 Checking for active cloud session...");const n={"Content-Type":"application/json"};e&&(n.Authorization=`Bearer ${e}`);let s=`${i.API_BASE}/ultra-card/v1/session/current`;t&&(s+=`?ha_user_id=${encodeURIComponent(t)}`);const a=await fetch(s,{method:"GET",headers:n,credentials:"include"});if(!a.ok){if(404===a.status)return o.v3&&console.log("📭 No active cloud session found"),null;if(401===a.status)return o.v3&&console.log("🔐 Not authenticated, cannot retrieve session"),null;throw new Error(`Session fetch failed: ${a.status}`)}const l=await a.json();return l.success&&(null===(r=l.session)||void 0===r?void 0:r.user)?(this._sessionId=l.session.session_id,this._saveSessionId(l.session.session_id),l.session.user):null}catch(t){return console.warn("⚠️ Failed to fetch cloud session:",t),null}}async validateSession(t){if(!this._isEnabled||!this._sessionId)return!0;try{const e=await fetch(`${i.API_BASE}/ultra-card/v1/session/validate`,{method:"POST",headers:{Authorization:`Bearer ${t}`,"Content-Type":"application/json"},body:JSON.stringify({session_id:this._sessionId})});if(!e.ok)return!1;const r=await e.json();return r.success&&!0===r.valid}catch(t){return console.warn("⚠️ Session validation failed:",t),!0}}async invalidateSession(t){if(this._isEnabled)try{o.v3&&console.log("🔄 Invalidating cloud session..."),await fetch(`${i.API_BASE}/ultra-card/v1/session/logout`,{method:"DELETE",headers:{Authorization:`Bearer ${t}`,"Content-Type":"application/json"}}),this._clearSessionId()}catch(t){console.warn("⚠️ Failed to invalidate cloud session:",t)}}startPolling(t,e){this._isEnabled&&(this.stopPolling(),o.v3&&console.log("🔄 Starting session validation polling"),this._pollTimer=window.setInterval(async()=>{await this.validateSession(t)||(console.warn("⚠️ Session invalidated remotely, logging out"),this.stopPolling(),e())},i.POLL_INTERVAL))}stopPolling(){this._pollTimer&&(clearInterval(this._pollTimer),this._pollTimer=void 0)}addListener(t){this._listeners.add(t)}removeListener(t){this._listeners.delete(t)}_getOrCreateDeviceId(){try{let t=localStorage.getItem(i.DEVICE_ID_KEY);return t||(t=`device_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,localStorage.setItem(i.DEVICE_ID_KEY,t)),t}catch(t){return`device_${Date.now()}_${Math.random().toString(36).substr(2,9)}`}}_getDeviceName(){const t=navigator.userAgent;let e="Unknown Browser",r="Unknown OS";return t.includes("Chrome")?e="Chrome":t.includes("Safari")?e="Safari":t.includes("Firefox")?e="Firefox":t.includes("Edge")&&(e="Edge"),t.includes("Windows")?r="Windows":t.includes("Mac")?r="macOS":t.includes("Linux")?r="Linux":t.includes("Android")?r="Android":t.includes("iOS")&&(r="iOS"),`${e} on ${r}`}_loadSessionId(){try{return localStorage.getItem(i.SESSION_ID_KEY)}catch(t){return null}}_saveSessionId(t){try{localStorage.setItem(i.SESSION_ID_KEY,t)}catch(t){console.error("Failed to save session ID:",t)}}_clearSessionId(){try{localStorage.removeItem(i.SESSION_ID_KEY),this._sessionId=null}catch(t){console.error("Failed to clear session ID:",t)}}}i.API_BASE="https://ultracard.io/wp-json",i.SESSION_ID_KEY="ultra-card-session-id",i.POLL_INTERVAL=3e4,i.DEVICE_ID_KEY="ultra-card-device-id";const n=new i;var s=r(8690),a=r(1793);const l=15e3,c=6e4;class d extends Error{constructor(t){super(`Ultra Card Cloud did not respond within ${Math.round(t/1e3)}s. Please try again.`),this.name="UcCloudTimeoutError"}}function u(t,e){let r;return Promise.race([t,new Promise((t,o)=>{r=setTimeout(()=>o(new d(e)),e)})]).finally(()=>clearTimeout(r))}async function h(t,e,r){const o=new AbortController,i=setTimeout(()=>o.abort(),r),n=e.signal;n&&(n.aborted?o.abort():n.addEventListener("abort",()=>o.abort(),{once:!0}));try{return await fetch(t,Object.assign(Object.assign({},e),{signal:o.signal}))}catch(t){if("AbortError"===(null==t?void 0:t.name)&&!(null==n?void 0:n.aborted))throw new d(r);throw t}finally{clearTimeout(i)}}function p(t){const e=t.replace(/[^\x20-\x7E]+/g,"_").replace(/[\\/:*?"<>|]/g,"_").trim()||"upload.png";return e.length>180?e.slice(0,180):e}class b{constructor(){this._currentUser=null,this._listeners=new Set,this._integrationHass=null,this._isNotifying=!1;try{"undefined"!=typeof localStorage&&localStorage.removeItem(b.STORAGE_KEY)}catch(t){}}checkIntegrationAuth(t){var e,r;try{const o="sensor.ultra_card_pro_cloud_authentication_status",i=null===(e=null==t?void 0:t.states)||void 0===e?void 0:e[o];if(!i)return null;if("connected"!==i.state||!(null===(r=i.attributes)||void 0===r?void 0:r.authenticated))return null;const n=i.attributes;return{id:n.user_id,username:n.username||"",email:n.email||"",displayName:n.display_name||n.username||"",token:"",expiresAt:0,subscription:{tier:n.subscription_tier||"free",status:n.subscription_status||"expired",expires:n.subscription_expires,features:n.features||{auto_backups:"pro"===n.subscription_tier,snapshots_enabled:"pro"===n.subscription_tier,snapshot_limit:"pro"===n.subscription_tier?10:0,backup_retention_days:90},snapshot_count:0,snapshot_limit:"pro"===n.subscription_tier?10:0}}}catch(t){return console.debug("No Ultra Card Connect integration found:",t),null}}isIntegrationInstalled(t){var e;try{const r="sensor.ultra_card_pro_cloud_authentication_status";return!!(null===(e=null==t?void 0:t.states)||void 0===e?void 0:e[r])}catch(t){return!1}}async autoRegisterIntegration(t,e,r){var o,i;if(!(null==t?void 0:t.connection))return;const n=t.callApi,s=t.callWS;if("function"!=typeof n)return;const a=null===(o=null==t?void 0:t.states)||void 0===o?void 0:o["sensor.ultra_card_pro_cloud_authentication_status"];if("connected"!==(null==a?void 0:a.state)||!(null===(i=null==a?void 0:a.attributes)||void 0===i?void 0:i.authenticated))try{let t;const o="function"==typeof s?await s({type:"config_entries/get",domain:"ultra_card_pro_cloud"}):[],i=Array.isArray(o)&&o.length>0?o[0]:null;if(i){const o=await n("POST","config/config_entries/flow",{handler:"ultra_card_pro_cloud",show_advanced_options:!1,entry_id:i.entry_id});if(t=null==o?void 0:o.flow_id,!t)return;await n("POST",`config/config_entries/flow/${t}`,{next_step:"sign_in"}),await n("POST",`config/config_entries/flow/${t}`,{username:e,password:r})}else{const o=await n("POST","config/config_entries/flow",{handler:"ultra_card_pro_cloud",show_advanced_options:!1});if(t=null==o?void 0:o.flow_id,!t)return;await n("POST",`config/config_entries/flow/${t}`,{next_step:"sign_in"}),await n("POST",`config/config_entries/flow/${t}`,{username:e,password:r})}return}catch(t){return console.debug("Auto-register integration failed:",t),"Could not auto-configure. You can add the integration manually in Settings → Integrations."}}getCurrentUser(){return this._currentUser}setIntegrationUser(t,e){var r,o;e||console.warn("[UltraCard] setIntegrationUser called without hass; cloud requests using integration auth will fail."),(null===(r=this._currentUser)||void 0===r?void 0:r.email)!==t.email||(null===(o=this._currentUser)||void 0===o?void 0:o.token)!==t.token?(this._integrationHass=(null==t?void 0:t.token)?null:null!=e?e:null,this._setCurrentUser(t)):!t.token&&e&&(this._integrationHass=e)}isAuthenticated(){return!!this._currentUser&&(this._currentUser.token&&this._currentUser.token,!0)}shouldRefreshToken(){return this._shouldRefreshToken()}async loginViaHass(t,e,r){let o;try{o=await t.callApi("POST","ultra_card_pro_cloud/login",{username:e,password:r})}catch(t){const e=new Error(function(t){if(!t)return"";if("string"==typeof t)return(0,a.hc)(t,t);const e=t,r=e.body;if("string"==typeof r&&r.trim())return(0,a.hc)(r);if(r&&"object"==typeof r){const{error:t,message:e}=r;if("string"==typeof t&&t.trim())return(0,a.hc)(t);if("string"==typeof e&&e.trim())return(0,a.hc)(e)}return"string"==typeof e.message&&e.message.trim()?(0,a.hc)(e.message):"string"==typeof e.error&&e.error.trim()?(0,a.hc)(e.error):""}(t)||"Authentication failed");throw e.cause=t,e}if(!(null==o?void 0:o.success)||!(null==o?void 0:o.user))throw new Error((0,a.hc)(null==o?void 0:o.error,"Authentication failed"));const i=this._sensorAttrsToCloudUser(o.user);return this._integrationHass=t,this._setCurrentUser(i),i}async registerViaHass(t,e,r,o){var i,n;try{const i=await t.callApi("POST","ultra_card_pro_cloud/register",{username:e,email:r,display_name:o||e});if(!(null==i?void 0:i.success))throw new Error((null==i?void 0:i.error)||"Registration failed");return(null==i?void 0:i.message)||"Account created. Check your email inbox, junk, or spam for the ultracard.io message to finish setting your password."}catch(t){const e=(null===(i=null==t?void 0:t.body)||void 0===i?void 0:i.message)||(null===(n=null==t?void 0:t.body)||void 0===n?void 0:n.error)||(null==t?void 0:t.message)||"Registration failed";throw new Error(e)}}async logoutViaHass(t){try{await t.callApi("POST","ultra_card_pro_cloud/logout",{})}catch(t){}this._setCurrentUser(null),this._clearStorage(),this._clearAutoRefresh(),this._notifyListeners()}_sensorAttrsToCloudUser(t){return{id:t.user_id||0,username:t.username||"",email:t.email||"",displayName:t.display_name||t.username||"",token:"",expiresAt:0,subscription:{tier:t.subscription_tier||"free",status:t.subscription_status||"active",expires:t.subscription_expires,features:{auto_backups:"pro"===t.subscription_tier,snapshots_enabled:"pro"===t.subscription_tier,snapshot_limit:"pro"===t.subscription_tier?10:0,backup_retention_days:90},snapshot_count:0,snapshot_limit:"pro"===t.subscription_tier?10:0}}}async login(t){throw new Error("Direct browser login is no longer supported. Install Ultra Card Connect and sign in from the Hub Account tab.")}async register(t){throw new Error("Direct browser registration is no longer supported. Use the Hub Account tab (Ultra Card Connect).")}async refreshToken(t=0){throw new Error("Browser token refresh is no longer supported. Ultra Card Connect refreshes tokens on the server.")}async logout(){this._setCurrentUser(null),this._clearStorage(),this._clearAutoRefresh();try{n.stopPolling()}catch(t){}}getAuthHeader(){return this.isAuthenticated()&&this._currentUser.token?`Bearer ${this._currentUser.token}`:null}async authenticatedFetch(t,e={}){var r,o,i,n,a;if(!this.isAuthenticated())throw new Error("Not authenticated");if(!this._currentUser.token&&this._integrationHass){const n=(e.method||"GET").toUpperCase();if(e.body instanceof FormData){const i=e.body;if(function(t){for(const[,e]of t.entries())if(e instanceof File)return!0;return!1}(i)){if(!t.includes("/ultra-card/v1/media")&&!t.endsWith("/ultra-card/v1/media"))throw new Error("This request includes files and is not supported through Home Assistant integration auth.");const e=await h("/api/ultra_card_pro_cloud/media_upload",{method:"POST",body:i,credentials:"same-origin"},c);if(404===e.status){const e=(0,s.fu)(this._integrationHass);if(e.installed&&(e.outdated||!(0,s.p0)(this._integrationHass,"media_upload")))throw(0,s.ft)(this._integrationHass,"Media upload")||new Error("Media upload requires an updated Ultra Card Connect integration. Please update Connect and try again.");const o=function(t){for(const[e,r]of t.entries())if(r instanceof File)return{fieldName:e,file:r};return null}(i);if(!o)throw new Error("No file in FormData");const n=await(a=o.file,new Promise((t,e)=>{const r=new FileReader;r.onload=()=>{const e=r.result,o=e.indexOf(",");t(o>=0?e.slice(o+1):e)},r.onerror=()=>{var t;return e(null!==(t=r.error)&&void 0!==t?t:new Error("read failed"))},r.readAsDataURL(a)})),l=this._integrationHass.callApi;if("function"!=typeof l)throw new Error("Integration proxy unavailable");const d=await u(l("POST","ultra_card_pro_cloud/proxy",{method:"POST",url:t,body:{__media_upload_b64:{field:"photo",filename:p(o.file.name),content_type:o.file.type||"application/octet-stream",data:n}}}),c),h=null!==(r=null==d?void 0:d._status)&&void 0!==r?r:0,b=null==d?void 0:d._body;return{ok:h>=200&&h<300,status:h,json:()=>Promise.resolve(b),text:()=>Promise.resolve("string"==typeof b?b:JSON.stringify(b))}}return e}const d=function(t){var e;const r={};for(const[o,i]of t.entries()){if(i instanceof File)continue;const t=i;if(o.endsWith("[]")){const i=o.slice(0,-2),n=null!==(e=r[i])&&void 0!==e?e:[];n.push(t),r[i]=n}else if(void 0!==r[o]){const e=r[o];Array.isArray(e)?e.push(t):r[o]=[e,t]}else r[o]=t}return Array.isArray(r.photo_ids)&&(r.photo_ids=r.photo_ids.map(t=>parseInt(t,10))),r}(i),b=this._integrationHass.callApi;if("function"!=typeof b)throw new Error("Integration proxy unavailable");const f=await u(b("POST","ultra_card_pro_cloud/proxy",{method:n,url:t,body:d}),l),g=null!==(o=null==f?void 0:f._status)&&void 0!==o?o:0,m=null==f?void 0:f._body;return{ok:g>=200&&g<300,status:g,json:()=>Promise.resolve(m),text:()=>Promise.resolve("string"==typeof m?m:JSON.stringify(m))}}let d;if(void 0!==e.body&&null!==e.body&&(d=e.body,"string"==typeof d))try{d=JSON.parse(d)}catch(t){}const b=this._integrationHass.callApi;if("function"!=typeof b)throw new Error("Integration proxy unavailable");const f=await u(b("POST","ultra_card_pro_cloud/proxy",{method:n,url:t,body:void 0!==d?d:null}),l),g=null!==(i=null==f?void 0:f._status)&&void 0!==i?i:0,m=null==f?void 0:f._body;return{ok:g>=200&&g<300,status:g,json:()=>Promise.resolve(m),text:()=>Promise.resolve("string"==typeof m?m:JSON.stringify(m))}}const d=this.getAuthHeader();if(!d)throw new Error("Not authenticated");const b=e.body instanceof FormData,f={Authorization:d};b||(f["Content-Type"]="application/json");const g=b?c:l,m=await h(t,Object.assign(Object.assign({},e),{headers:Object.assign(Object.assign({},e.headers),f)}),g);if(401===m.status&&(null===(n=this._currentUser)||void 0===n?void 0:n.refreshToken))try{await this.refreshToken();const r=this.getAuthHeader();if(r){const o={Authorization:r};return b||(o["Content-Type"]="application/json"),h(t,Object.assign(Object.assign({},e),{headers:Object.assign(Object.assign({},e.headers),o)}),g)}}catch(t){throw new Error("Authentication expired. Please login again.")}return m}addListener(t){this._listeners.add(t)}removeListener(t){this._listeners.delete(t)}_createUserFromAuth(t){const e=t.expires_in?Date.now()+1e3*t.expires_in:Date.now()+b.DEFAULT_TOKEN_TTL;return{id:t.user_id,username:t.user_nicename,email:t.user_email,displayName:t.user_display_name,avatar:t.avatar_url,token:t.token,refreshToken:t.refresh_token,expiresAt:e}}_setCurrentUser(t){t||(this._integrationHass=null),this._currentUser=t,this._notifyListeners()}_notifyListeners(){if(!this._isNotifying){this._isNotifying=!0;try{this._listeners.forEach(t=>{try{t(this._currentUser)}catch(t){console.error("Error in auth listener:",t)}})}finally{this._isNotifying=!1}}}_shouldRefreshToken(){return!!this._currentUser&&Date.now()>=this._currentUser.expiresAt-b.REFRESH_THRESHOLD}_clearAutoRefresh(){this._refreshTimer&&(clearTimeout(this._refreshTimer),this._refreshTimer=void 0)}async _fetchSubscriptionData(t){try{const e=await fetch(`${b.API_BASE}/ultra-card/v1/subscription`,{method:"GET",headers:{Authorization:`Bearer ${t.token}`,"Content-Type":"application/json"}});if(e.ok){const r=await e.json();t.subscription=r}else console.warn("⚠️ Failed to fetch subscription, defaulting to free tier"),t.subscription={tier:"free",status:"active",features:{auto_backups:!0,snapshots_enabled:!1,snapshot_limit:0,backup_retention_days:30},snapshot_count:0,snapshot_limit:0}}catch(e){console.error("❌ Error fetching subscription:",e),t.subscription={tier:"free",status:"active",features:{auto_backups:!0,snapshots_enabled:!1,snapshot_limit:0,backup_retention_days:30},snapshot_count:0,snapshot_limit:0}}}_loadFromStorage(){try{const t=localStorage.getItem(b.STORAGE_KEY);if(t){const e=JSON.parse(t);this._isValidStoredUser(e)?this._currentUser=e:this._clearStorage()}}catch(t){console.error("❌ Failed to load auth from storage:",t),this._clearStorage()}}_clearStorage(){try{localStorage.removeItem(b.STORAGE_KEY)}catch(t){console.error("❌ Failed to clear auth storage:",t)}}_isValidStoredUser(t){if(!t)return console.warn("❌ Validation failed: user is null/undefined"),!1;const e={"user exists":!!t,"id is number":"number"==typeof t.id,"username is string":"string"==typeof t.username,"email is string":"string"==typeof t.email,"displayName is string":"string"==typeof t.displayName},r=Object.entries(e).filter(([t,e])=>!e).map(([t])=>t);return r.length>0?(console.warn("❌ Validation failed. Failed checks:",r),console.warn("   User data:",JSON.stringify(t,null,2)),!1):void 0!==t.token&&"string"!=typeof t.token?(console.warn("❌ Validation failed: token exists but is not a string"),!1):void 0===t.expiresAt||"number"==typeof t.expiresAt||(console.warn("❌ Validation failed: expiresAt exists but is not a number"),!1)}}b.API_BASE="https://ultracard.io/wp-json",b.JWT_ENDPOINT="/jwt-auth/v1",b.STORAGE_KEY="ultra-card-cloud-auth",b.REFRESH_THRESHOLD=3e5,b.DEFAULT_TOKEN_TTL=6048e5;const f=new b},8690(t,e,r){r.d(e,{Jd:()=>l,ft:()=>c,fu:()=>s,p0:()=>a});const o="sensor.ultra_card_pro_cloud_authentication_status",i="1.6.0";function n(t){if(!t||"string"!=typeof t)return null;const e=t.trim().split(/[-+]/)[0].split(".").map(t=>Number.parseInt(t,10));if(e.length<1||e.some(t=>Number.isNaN(t)))return null;for(;e.length<3;)e.push(0);return e.slice(0,3)}function s(t){const e=function(t){var e;return(null===(e=null==t?void 0:t.states)||void 0===e?void 0:e[o])||null}(t);if(!e)return{installed:!1,integrationVersion:null,capabilities:{},outdated:!1,reason:null};const r=e.attributes||{},s=r.integration_version,a="string"==typeof s&&s.trim()?s.trim():null;let l={};const c=r.capabilities;if(c&&"object"==typeof c&&!Array.isArray(c)&&(l=Object.assign({},c)),!a)return{installed:!0,integrationVersion:null,capabilities:l,outdated:!0,reason:"missing_version"};const d=function(t,e){const r=n(t),o=n(e);if(!r&&!o)return 0;if(!r)return-1;if(!o)return 1;for(let t=0;t<3;t++)if(r[t]!==o[t])return r[t]-o[t];return 0}(a,i)<0;return{installed:!0,integrationVersion:a,capabilities:l,outdated:d,reason:d?"below_minimum":null}}function a(t,e){const r=s(t);return!(!r.installed||r.outdated)&&!0===r.capabilities[e]}function l(t,e){const r=s(t);return r.installed&&r.outdated?e?`${e} requires Ultra Card Connect ${i} or newer. Please update the Ultra Card Connect integration.`:"Update Ultra Card Connect to continue. This feature needs Connect 1.6.0 or newer.":null}function c(t,e){const r=l(t,e);if(!r)return null;const o=new Error(r);return o.code="connect_outdated",o}r.d(e,["$f",0,o])},3496(t,e,r){var o=r(1001);const i="uc-toast-live-region",n=new class{constructor(){this._container=null}_ensureContainer(){if(this._container&&document.body.contains(this._container))return this._container;let t=document.getElementById(i);return t||(t=document.createElement("div"),t.id=i,t.setAttribute("role","status"),t.setAttribute("aria-live","polite"),t.setAttribute("aria-atomic","false"),t.style.cssText=`\n        position: fixed;\n        top: 16px;\n        right: 16px;\n        display: flex;\n        flex-direction: column;\n        gap: 8px;\n        z-index: ${o.Mu.TOAST_NOTIFICATION};\n        pointer-events: none;\n      `,document.body.appendChild(t)),this._container=t,t}show(t,e,r){var o,i;const n="string"==typeof t?{message:t,type:null!=e?e:"info",duration:null!=r?r:3e3}:t,s=null!==(o=n.type)&&void 0!==o?o:"info",a=null!==(i=n.duration)&&void 0!==i?i:3e3,l=this._ensureContainer();"error"===s?(l.setAttribute("role","alert"),l.setAttribute("aria-live","assertive")):(l.setAttribute("role","status"),l.setAttribute("aria-live","polite"));const c=document.createElement("div");c.setAttribute("aria-atomic","true"),c.textContent=n.message;const d=()=>{c.style.opacity="0",c.style.transform="translateX(40px)",setTimeout(()=>{c.remove(),0===l.children.length&&(l.setAttribute("role","status"),l.setAttribute("aria-live","polite"))},260)};if(n.action){const t=document.createElement("button");t.type="button",t.textContent=n.action.label,t.style.cssText="\n        margin-left: 12px;\n        padding: 4px 10px;\n        border: 1px solid rgba(255,255,255,0.7);\n        border-radius: 6px;\n        background: rgba(255,255,255,0.15);\n        color: inherit;\n        font: inherit;\n        font-weight: 600;\n        cursor: pointer;\n      ",t.addEventListener("click",()=>{var t;d(),null===(t=n.action)||void 0===t||t.onClick()}),c.appendChild(t)}const u="success"===s?"var(--success-color, #4caf50)":"error"===s?"var(--error-color, #f44336)":"warning"===s?"var(--warning-color, #ff9800)":"var(--primary-color, #03a9f4)";c.style.cssText=`\n      padding: 10px 20px;\n      background: ${u};\n      color: white;\n      border-radius: 8px;\n      font-size: 13px;\n      font-weight: 500;\n      box-shadow: 0 4px 12px rgba(0,0,0,0.25);\n      pointer-events: auto;\n      opacity: 0;\n      transform: translateX(40px);\n      transition: opacity 0.25s ease, transform 0.25s ease;\n      max-width: 360px;\n      word-break: break-word;\n    `,l.appendChild(c),requestAnimationFrame(()=>{c.style.opacity="1",c.style.transform="translateX(0)"}),a>0&&setTimeout(d,a)}success(t,e){this.show(t,"success",e)}error(t,e){this.show(t,"error",null!=e?e:4e3)}info(t,e){this.show(t,"info",e)}warning(t,e){this.show(t,"warning",e)}};r.d(e,["f",0,n])},9879(t,e,r){r.d(e,{Sn:()=>a});var o=r(3496);const i=[/Failed to fetch dynamically imported module/i,/error loading dynamically imported module/i,/Importing a module script failed/i,/Failed to load module script/i,/Loading (?:CSS )?chunk [\w.-]+ failed/i,/ChunkLoadError/i,/^Load failed$/i,/NetworkError when attempting to fetch resource/i];let n=!1;function s(){try{window.location.reload()}catch(t){}}function a(t,e){return!(!function(t){if(!t)return!1;const e=t;if("ChunkLoadError"===e.name||"CSS_CHUNK_LOAD_FAILED"===e.code)return!0;const r="string"==typeof e.message?e.message:"string"==typeof t?t:"";return!!r&&i.some(t=>t.test(r))}(t)||"undefined"!=typeof window&&"undefined"!=typeof document&&(n?(console.warn(`[UltraCard] Chunk load failed (${e}); reload pending.`,t),0):(n=!0,async function(t){if("undefined"!=typeof navigator&&!1===navigator.onLine)return"offline";if("function"!=typeof fetch)return"unknown";const e=async t=>{var e;try{const r="undefined"!=typeof AbortController?new AbortController:void 0,o=r?setTimeout(()=>r.abort(),4e3):void 0,i=await fetch(t,{method:"HEAD",cache:"no-store",credentials:"same-origin",signal:null!==(e=null==r?void 0:r.signal)&&void 0!==e?e:null});return o&&clearTimeout(o),i.status}catch(t){return}},o=function(t){var e;const r=null==t?void 0:t.message;if("string"!=typeof r)return;const o=r.match(/(https?:\/\/\S+|\/\S+\.js\S*)/);return null===(e=null==o?void 0:o[1])||void 0===e?void 0:e.replace(/[).,]+$/,"")}(t);if(o){const t=await e(o);return 404===t||410===t?"version-skew":void 0===t?"offline":"unknown"}const i=(()=>{try{return new URL("ultra-card.js",r.p).toString()}catch(t){return}})();if(!i)return"unknown";const n=await e(i);return void 0===n?"offline":n>=200&&n<400?"version-skew":"unknown"}(t).then(r=>{console.warn(`[UltraCard] Chunk load failed (${e}): ${r}.`,t),function(t){const e=document.querySelector("home-assistant");if(e)try{return void e.dispatchEvent(new CustomEvent("hass-notification",{bubbles:!0,composed:!0,detail:{id:"ultra-card-chunk-load",message:t,duration:-1,dismissable:!0,action:{text:"Reload",action:s}}}))}catch(t){}o.f.show({message:t,type:"warning",duration:0,action:{label:"Reload",onClick:s}})}(function(t){switch(t){case"version-skew":return"Ultra Card was updated. Reload the page to finish.";case"offline":return"Ultra Card could not load part of this card. Check your connection and reload.";default:return"Ultra Card could not load part of this card. Reload the page to try again."}}(r))}),0)))}},3045(t,e,r){const o=(()=>{try{if(window.__UC_DEBUG)return!0;const t=localStorage.getItem("uc_debug");return"1"===t||"true"===t}catch(t){return!1}})();r.d(e,["v3",0,o])},1793(t,e,r){r.d(e,{hc:()=>s,nF:()=>a});const o="Can't reach Ultra Card cloud right now. Please try again in a few minutes.",i=["siteground","anti-bot","sg-captcha","sgcaptcha","bot-protection","bot protection","javascript challenge","exempt /wp-json","/wp-json/","robot challenge"];function n(t){const e=t.toLowerCase();return i.some(t=>e.includes(t))}function s(t,e=o){return"string"==typeof t&&t.trim()?n(t)?o:t.trim():e}function a(t){if("string"==typeof t)return n(t)?o:t;if(Array.isArray(t))return t.map(t=>a(t));if(t&&"object"==typeof t){const e={};for(const[r,o]of Object.entries(t))e[r]=a(o);return e}return t}r.d(e,["Fv",0,o])},1001(t,e,r){r.d(e,["Mu",0,{BASE_CONTENT:0,MODULE_CONTENT:1,MODULE_OVERLAY:2,MODULE_BACKGROUND:3,MODULE_DECORATIVE:5,MODULE_INTERACTIVE:8,CARD_BACKGROUND:10,CARD_CONTROLS:20,NATIVE_CARD_ABOVE_NAV:25,CARD_TOOLTIP:30,EDITOR_CONTENT:100,STICKY_HEADERS:400,EDITOR_TABS:500,EDITOR_NOTIFICATIONS:600,MODULE_POPUP_OVERLAY:1e3,MODULE_POPUP_CONTENT:1001,LAYOUT_CHILD_POPUP:1002,SELECTOR_POPUP:1003,RESIZE_HANDLE:1004,POPUP_STICKY_ELEMENTS:1005,POPUP_TABS:2e3,DROPDOWN_SELECT:5e3,DROPDOWN_MENU:5001,COLOR_PICKER_CONTAINER:0,COLOR_PICKER_PALETTE:5003,AUTOCOMPLETE:5004,CONTEXT_MENU:5005,DIALOG_OVERLAY:8e3,DIALOG_CONTENT:8001,TOAST_NOTIFICATION:8500,GRAPH_TOOLTIP:2147483647,CAMERA_FULLSCREEN_OVERLAY:1e4,CAMERA_FULLSCREEN_CONTENT:10001,FULLSCREEN_EDITOR:10002}])},842(t,e,r){r.d(e,{mN:()=>E,AH:()=>l,W3:()=>w,Ec:()=>A});const o=globalThis,i=o.ShadowRoot&&(void 0===o.ShadyCSS||o.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),s=new WeakMap;class a{constructor(t,e,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const r=void 0!==e&&1===e.length;r&&(t=s.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),r&&s.set(e,t))}return t}toString(){return this.cssText}}const l=(t,...e)=>{const r=1===t.length?t[0]:e.reduce((e,r,o)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+t[o+1],t[0]);return new a(r,t,n)},c=(t,e)=>{if(i)t.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const r of e){const e=document.createElement("style"),i=o.litNonce;void 0!==i&&e.setAttribute("nonce",i),e.textContent=r.cssText,t.appendChild(e)}},d=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const r of t.cssRules)e+=r.cssText;return(t=>new a("string"==typeof t?t:t+"",void 0,n))(e)})(t):t,{is:u,defineProperty:h,getOwnPropertyDescriptor:p,getOwnPropertyNames:b,getOwnPropertySymbols:f,getPrototypeOf:g}=Object,m=globalThis,_=m.trustedTypes,v=_?_.emptyScript:"",y=m.reactiveElementPolyfillSupport,x=(t,e)=>t,w={toAttribute(t,e){switch(e){case Boolean:t=t?v:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let r=t;switch(e){case Boolean:r=null!==t;break;case Number:r=null===t?null:Number(t);break;case Object:case Array:try{r=JSON.parse(t)}catch(t){r=null}}return r}},A=(t,e)=>!u(t,e),$={attribute:!0,type:String,converter:w,reflect:!1,useDefault:!1,hasChanged:A};Symbol.metadata??=Symbol("metadata"),m.litPropertyMetadata??=new WeakMap;class E extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=$){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const r=Symbol(),o=this.getPropertyDescriptor(t,r,e);void 0!==o&&h(this.prototype,t,o)}}static getPropertyDescriptor(t,e,r){const{get:o,set:i}=p(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:o,set(e){const n=o?.call(this);i?.call(this,e),this.requestUpdate(t,n,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??$}static _$Ei(){if(this.hasOwnProperty(x("elementProperties")))return;const t=g(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(x("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(x("properties"))){const t=this.properties,e=[...b(t),...f(t)];for(const r of e)this.createProperty(r,t[r])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,r]of e)this.elementProperties.set(t,r)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const r=this._$Eu(t,e);void 0!==r&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const r=new Set(t.flat(1/0).reverse());for(const t of r)e.unshift(d(t))}else void 0!==t&&e.push(d(t));return e}static _$Eu(t,e){const r=e.attribute;return!1===r?void 0:"string"==typeof r?r:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const r of e.keys())this.hasOwnProperty(r)&&(t.set(r,this[r]),delete this[r]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return c(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,r){this._$AK(t,r)}_$ET(t,e){const r=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,r);if(void 0!==o&&!0===r.reflect){const i=(void 0!==r.converter?.toAttribute?r.converter:w).toAttribute(e,r.type);this._$Em=t,null==i?this.removeAttribute(o):this.setAttribute(o,i),this._$Em=null}}_$AK(t,e){const r=this.constructor,o=r._$Eh.get(t);if(void 0!==o&&this._$Em!==o){const t=r.getPropertyOptions(o),i="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:w;this._$Em=o;const n=i.fromAttribute(e,t.type);this[o]=n??this._$Ej?.get(o)??n,this._$Em=null}}requestUpdate(t,e,r,o=!1,i){if(void 0!==t){const n=this.constructor;if(!1===o&&(i=this[t]),r??=n.getPropertyOptions(t),!((r.hasChanged??A)(i,e)||r.useDefault&&r.reflect&&i===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,r))))return;this.C(t,e,r)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:r,reflect:o,wrapped:i},n){r&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==i||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||r||(e=void 0),this._$AL.set(t,e)),!0===o&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,r]of t){const{wrapped:t}=r,o=this[e];!0!==t||this._$AL.has(e)||void 0===o||this.C(e,void 0,r,o)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}}E.elementStyles=[],E.shadowRootOptions={mode:"open"},E[x("elementProperties")]=new Map,E[x("finalized")]=new Map,y?.({ReactiveElement:E}),(m.reactiveElementVersions??=[]).push("2.1.2")},6752(t,e,r){const o=globalThis,i=t=>t,n=o.trustedTypes,s=n?n.createPolicy("lit-html",{createHTML:t=>t}):void 0,a="$lit$",l=`lit$${Math.random().toFixed(9).slice(2)}$`,c="?"+l,d=`<${c}>`,u=document,h=()=>u.createComment(""),p=t=>null===t||"object"!=typeof t&&"function"!=typeof t,b=Array.isArray,f=t=>b(t)||"function"==typeof t?.[Symbol.iterator],g="[ \t\n\f\r]",m=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,v=/>/g,y=RegExp(`>|${g}(?:([^\\s"'>=/]+)(${g}*=${g}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),x=/'/g,w=/"/g,A=/^(?:script|style|textarea|title)$/i,$=t=>(e,...r)=>({_$litType$:t,strings:e,values:r}),E=$(1),S=($(2),$(3),Symbol.for("lit-noChange")),k=Symbol.for("lit-nothing"),T=new WeakMap,C=u.createTreeWalker(u,129);function O(t,e){if(!b(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==s?s.createHTML(e):e}const P=(t,e)=>{const r=t.length-1,o=[];let i,n=2===e?"<svg>":3===e?"<math>":"",s=m;for(let e=0;e<r;e++){const r=t[e];let c,u,h=-1,p=0;for(;p<r.length&&(s.lastIndex=p,u=s.exec(r),null!==u);)p=s.lastIndex,s===m?"!--"===u[1]?s=_:void 0!==u[1]?s=v:void 0!==u[2]?(A.test(u[2])&&(i=RegExp("</"+u[2],"g")),s=y):void 0!==u[3]&&(s=y):s===y?">"===u[0]?(s=i??m,h=-1):void 0===u[1]?h=-2:(h=s.lastIndex-u[2].length,c=u[1],s=void 0===u[3]?y:'"'===u[3]?w:x):s===w||s===x?s=y:s===_||s===v?s=m:(s=y,i=void 0);const b=s===y&&t[e+1].startsWith("/>")?" ":"";n+=s===m?r+d:h>=0?(o.push(c),r.slice(0,h)+a+r.slice(h)+l+b):r+l+(-2===h?e:b)}return[O(t,n+(t[r]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),o]};class U{constructor({strings:t,_$litType$:e},r){let o;this.parts=[];let i=0,s=0;const d=t.length-1,u=this.parts,[p,b]=P(t,e);if(this.el=U.createElement(p,r),C.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(o=C.nextNode())&&u.length<d;){if(1===o.nodeType){if(o.hasAttributes())for(const t of o.getAttributeNames())if(t.endsWith(a)){const e=b[s++],r=o.getAttribute(t).split(l),n=/([.?@])?(.*)/.exec(e);u.push({type:1,index:i,name:n[2],strings:r,ctor:"."===n[1]?D:"?"===n[1]?j:"@"===n[1]?z:R}),o.removeAttribute(t)}else t.startsWith(l)&&(u.push({type:6,index:i}),o.removeAttribute(t));if(A.test(o.tagName)){const t=o.textContent.split(l),e=t.length-1;if(e>0){o.textContent=n?n.emptyScript:"";for(let r=0;r<e;r++)o.append(t[r],h()),C.nextNode(),u.push({type:2,index:++i});o.append(t[e],h())}}}else if(8===o.nodeType)if(o.data===c)u.push({type:2,index:i});else{let t=-1;for(;-1!==(t=o.data.indexOf(l,t+1));)u.push({type:7,index:i}),t+=l.length-1}i++}}static createElement(t,e){const r=u.createElement("template");return r.innerHTML=t,r}}function I(t,e,r=t,o){if(e===S)return e;let i=void 0!==o?r._$Co?.[o]:r._$Cl;const n=p(e)?void 0:e._$litDirective$;return i?.constructor!==n&&(i?._$AO?.(!1),void 0===n?i=void 0:(i=new n(t),i._$AT(t,r,o)),void 0!==o?(r._$Co??=[])[o]=i:r._$Cl=i),void 0!==i&&(e=I(t,i._$AS(t,e.values),i,o)),e}class N{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:r}=this._$AD,o=(t?.creationScope??u).importNode(e,!0);C.currentNode=o;let i=C.nextNode(),n=0,s=0,a=r[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new L(i,i.nextSibling,this,t):1===a.type?e=new a.ctor(i,a.name,a.strings,this,t):6===a.type&&(e=new H(i,this,t)),this._$AV.push(e),a=r[++s]}n!==a?.index&&(i=C.nextNode(),n++)}return C.currentNode=u,o}p(t){let e=0;for(const r of this._$AV)void 0!==r&&(void 0!==r.strings?(r._$AI(t,r,e),e+=r.strings.length-2):r._$AI(t[e])),e++}}class L{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,r,o){this.type=2,this._$AH=k,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=r,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=I(this,t,e),p(t)?t===k||null==t||""===t?(this._$AH!==k&&this._$AR(),this._$AH=k):t!==this._$AH&&t!==S&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):f(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==k&&p(this._$AH)?this._$AA.nextSibling.data=t:this.T(u.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:r}=t,o="number"==typeof r?this._$AC(t):(void 0===r.el&&(r.el=U.createElement(O(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===o)this._$AH.p(e);else{const t=new N(o,this),r=t.u(this.options);t.p(e),this.T(r),this._$AH=t}}_$AC(t){let e=T.get(t.strings);return void 0===e&&T.set(t.strings,e=new U(t)),e}k(t){b(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let r,o=0;for(const i of t)o===e.length?e.push(r=new L(this.O(h()),this.O(h()),this,this.options)):r=e[o],r._$AI(i),o++;o<e.length&&(this._$AR(r&&r._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=i(t).nextSibling;i(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class R{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,r,o,i){this.type=1,this._$AH=k,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=i,r.length>2||""!==r[0]||""!==r[1]?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=k}_$AI(t,e=this,r,o){const i=this.strings;let n=!1;if(void 0===i)t=I(this,t,e,0),n=!p(t)||t!==this._$AH&&t!==S,n&&(this._$AH=t);else{const o=t;let s,a;for(t=i[0],s=0;s<i.length-1;s++)a=I(this,o[r+s],e,s),a===S&&(a=this._$AH[s]),n||=!p(a)||a!==this._$AH[s],a===k?t=k:t!==k&&(t+=(a??"")+i[s+1]),this._$AH[s]=a}n&&!o&&this.j(t)}j(t){t===k?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class D extends R{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===k?void 0:t}}class j extends R{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==k)}}class z extends R{constructor(t,e,r,o,i){super(t,e,r,o,i),this.type=5}_$AI(t,e=this){if((t=I(this,t,e,0)??k)===S)return;const r=this._$AH,o=t===k&&r!==k||t.capture!==r.capture||t.once!==r.once||t.passive!==r.passive,i=t!==k&&(r===k||o);o&&this.element.removeEventListener(this.name,this,r),i&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class H{constructor(t,e,r){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(t){I(this,t)}}const M={M:a,P:l,A:c,C:1,L:P,R:N,D:f,V:I,I:L,H:R,N:j,U:z,B:D,F:H},V=o.litHtmlPolyfillSupport;V?.(U,L),(o.litHtmlVersions??=[]).push("3.3.2"),r.d(e,["XX",0,(t,e,r)=>{const o=r?.renderBefore??e;let i=o._$litPart$;if(void 0===i){const t=r?.renderBefore??null;o._$litPart$=i=new L(e.insertBefore(h(),t),t,void 0,r??{})}return i._$AI(t),i},"c0",0,S,"ge",0,M,"qy",0,E,"s6",0,k])},4791(t,e,r){r.d(e,{EM:()=>o,MZ:()=>a,wk:()=>l});const o=t=>(e,r)=>{void 0!==r?r.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)};var i=r(842);const n={attribute:!0,type:String,converter:i.W3,reflect:!1,hasChanged:i.Ec},s=(t=n,e,r)=>{const{kind:o,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),"setter"===o&&((t=Object.create(t)).wrapped=!0),s.set(r.name,t),"accessor"===o){const{name:o}=r;return{set(r){const i=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,i,t,!0,r)},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===o){const{name:o}=r;return function(r){const i=this[o];e.call(this,r),this.requestUpdate(o,i,t,!0,r)}}throw Error("Unsupported decorator location: "+o)};function a(t){return(e,r)=>"object"==typeof r?s(t,e,r):((t,e,r)=>{const o=e.hasOwnProperty(r);return e.constructor.createProperty(r,t),o?Object.getOwnPropertyDescriptor(e,r):void 0})(t,e,r)}function l(t){return a({...t,state:!0,attribute:!1})}},2618(t,e,r){r.d(e,{WF:()=>s,AH:()=>o.AH,qy:()=>i.qy,s6:()=>i.s6});var o=r(842),i=r(6752);const n=globalThis;class s extends o.mN{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=(0,i.XX)(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return i.c0}}s._$litElement$=!0,s.finalized=!0,n.litElementHydrateSupport?.({LitElement:s});const a=n.litElementPolyfillSupport;a?.({LitElement:s}),(n.litElementVersions??=[]).push("4.2.2")}};const e={};function r(o){const i=e[o];if(void 0!==i)return i.exports;const n=e[o]={exports:{}};return t[o](n,n.exports,r),n.exports}r.m=t,(()=>{const t=Object.getPrototypeOf;let e;r.t=function(o,i){if(1&i&&(o=this(o)),8&i)return o;if("object"==typeof o&&o){if(4&i&&o.__esModule)return o;if(16&i&&"function"==typeof o.then)return o}const n=Object.create(null);r.r(n);const s={};e=e||[null,t({}),t([]),t(t)];for(var a=2&i&&o;("object"==typeof a||"function"==typeof a)&&!~e.indexOf(a);a=t(a))Object.getOwnPropertyNames(a).forEach(t=>s[t]=()=>o[t]);return s.default=()=>o,r.d(n,s),n}})(),r.d=(t,e)=>{if(Array.isArray(e))for(var o=0;o<e.length;){var i=e[o++],n=e[o++],s=0===n?{enumerable:!0,value:e[o++]}:{enumerable:!0,get:n};r.o(t,i)||Object.defineProperty(t,i,s)}else for(var i in e)r.o(e,i)&&!r.o(t,i)&&Object.defineProperty(t,i,{enumerable:!0,get:e[i]})},r.f={},r.e=t=>Promise.all(Object.keys(r.f).reduce((e,o)=>(r.f[o](t,e),e),[])),r.u=t=>"uc-"+({931:"locale-de",969:"locale-it",1543:"locale-en",1948:"locale-nl",1959:"locale-no",2198:"locale-ca",3002:"default-image",3258:"locale-fr",3751:"locale-da",4351:"locale-en-GB",4377:"locale-sv",4866:"locale-es",5877:"vendor-pako",6722:"locale-nb",6870:"locale-pl",7364:"locale-cs",9150:"locale-nn"}[t]||t)+"."+{23:"bef92fb6",931:"30eada51",969:"86aa419b",1130:"51135d3c",1154:"759c8dbd",1172:"7ac11546",1543:"99a55bbf",1948:"b66bd5d2",1959:"dd9724df",2034:"b5b55c5d",2198:"051e8d58",3002:"7ae9b424",3258:"7fafca10",3751:"f11e9007",4351:"df476c4e",4377:"8a119651",4480:"cd6f2170",4676:"3b082769",4866:"f2931523",5877:"0961e8a0",6444:"9970f2ef",6597:"512d5752",6722:"283b44cf",6870:"d6acfbd9",7229:"83dbdce8",7364:"f98244cf",8612:"593ad7ea",8717:"dc1c1eee",8840:"6a0d383e",9150:"d29ab904",9286:"3d00b660",9418:"9128fc89",9532:"c0b6af5a"}[t]+".js",r.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r.r=t=>{Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},(()=>{let t;if("string"==typeof import.meta.url&&(t=import.meta.url),!t)throw new Error("Automatic publicPath is not supported in this browser");t=t.replace(/^blob:|[?#].*$/g,"").replace(/\/[^/]+$/,"/"),r.p=t})(),(()=>{const t={5491:0},e=e=>{let{__webpack_esm_ids__:o,__webpack_esm_modules__:i,__webpack_esm_runtime__:n}=e;var s,a,l=0;for(s in i)r.o(i,s)&&(r.m[s]=i[s]);for(n&&n(r);l<o.length;l++)a=o[l],r.o(t,a)&&t[a]&&t[a][0](),t[a]=0};r.f.j=(o,i)=>{let n=r.o(t,o)?t[o]:void 0;if(0!==n)if(n)i.push(n[1]);else{let s=import("./"+r.u(o)).then(e,e=>{throw 0!==t[o]&&(t[o]=void 0),e});s=Promise.race([s,new Promise(e=>n=t[o]=[e])]),i.push(n[1]=s)}},r.ei=(o,i)=>{let n=[],s=r.o(t,o)?t[o]:void 0;if(0!==s)if(s)n.push(s[1]);else{let r=i().then(e,e=>{throw 0!==t[o]&&(t[o]=void 0),e});r=Promise.race([r,new Promise(e=>s=t[o]=[e])]),n.push(s[1]=r)}return Object.keys(r.f).forEach(t=>{"j"!==t&&r.f[t](o,n)}),Promise.all(n)}})();try{const t=r.p;"string"==typeof t&&t.length>0&&!t.endsWith("/")&&(r.p=t.replace(/[?#].*$/,"").replace(/\/[^/]*$/,"/"))}catch(t){}var o=r(2618),i=r(4791),n=r(9978),s=r(378),a=r(6478),l=r(9879),c=r(821),d=function(t,e,r,o){var i,n=arguments.length,s=n<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,r,o);else for(var a=t.length-1;a>=0;a--)(i=t[a])&&(s=(n<3?i(s):n>3?i(e,r,s):i(e,r))||s);return n>3&&s&&Object.defineProperty(e,r,s),s};(0,a.JM)();const u="ultra_card_hub_tab",h={dashboard:()=>r.e(1130).then(()=>r(1130)),account:()=>r.e(9532).then(()=>r(9532)),favorites:()=>r.e(8612).then(()=>r(8612)),presets:()=>Promise.all([r.e(5877),r.e(9418),r.e(8717),r.e(6444),r.e(4480),r.e(7229)]).then(()=>r(3378)),themes:()=>Promise.all([r.e(6444),r.e(2034)]).then(()=>r(9653)),colors:()=>r.e(8840).then(()=>r(8840)),variables:()=>r.e(1154).then(()=>r(1154)),templates:()=>r.e(6597).then(()=>r(6597)),docs:()=>Promise.all([r.e(9418),r.e(4676)]).then(()=>r(4676))},p=[{key:"dashboard",labelKey:"hub.groups.home",icon:"mdi:home"},{key:"favorites",labelKey:"hub.tabs.favorites",icon:"mdi:heart"},{key:"presets",labelKey:"hub.tabs.presets",icon:"mdi:palette"},{key:"themes",labelKey:"hub.tabs.themes",icon:"mdi:palette-swatch"},{key:"colors",labelKey:"hub.tabs.colors",icon:"mdi:eyedropper-variant"},{key:"variables",labelKey:"hub.tabs.variables",icon:"mdi:variable"},{key:"templates",labelKey:"hub.tabs.templates",icon:"mdi:code-tags"},{key:"account",labelKey:"hub.tabs.account",icon:"mdi:account-circle"},{key:"docs",labelKey:"hub.tabs.docs",icon:"mdi:book-open-page-variant"}];function b(t){return t?"pro"===t?"account":"about"===t?"docs":p.some(e=>e.key===t)?t:null:null}let f=class extends o.WF{constructor(){super(...arguments),this._activeTab="dashboard",this._pendingDocsSlug="",this._pendingPresetsView="",this._pendingThemesView="",this._proAuth=null,this._cloudUser=null,this._narrow=window.matchMedia("(max-width: 870px)").matches,this._loadedTabs=new Set,this._showShortcuts=!1,this._tabLoadPromises=new Map,this._hubKeydownHandler=t=>{var e,r,o;if("?"!==t.key)return;const i=null===(r=null===(e=t.target)||void 0===e?void 0:e.tagName)||void 0===r?void 0:r.toLowerCase();"input"===i||"textarea"===i||(null===(o=t.target)||void 0===o?void 0:o.isContentEditable)||(t.preventDefault(),this._showShortcuts=!this._showShortcuts)},this._onMqlChange=t=>{this._narrow=t.matches},this._onTabStripKeydown=t=>{if(!["ArrowLeft","ArrowRight","Home","End"].includes(t.key))return;const e=p.findIndex(t=>t.key===this._activeTab);if(e<0)return;let r=e;r="ArrowLeft"===t.key?(e-1+p.length)%p.length:"ArrowRight"===t.key?(e+1)%p.length:"Home"===t.key?0:p.length-1,t.preventDefault();const o=p[r].key;this._selectTab(o),this.updateComplete.then(()=>{var t;const e=null===(t=this.renderRoot)||void 0===t?void 0:t.querySelector(`#hub-tab-${o}`);null==e||e.focus(),null==e||e.scrollIntoView({block:"nearest",inline:"nearest"})})}}connectedCallback(){super.connectedCallback(),this._restoreNavState(),this._mql=window.matchMedia("(max-width: 870px)"),this._mql.addEventListener("change",this._onMqlChange),this._updateProState(),this._cloudUser=s.xd.getCurrentUser(),this._authListener=t=>{this._cloudUser=t},s.xd.addListener(this._authListener),this._localeUnsub=(0,a.BT)(()=>this.requestUpdate()),this.addEventListener(c.zP,this._onNavigateTab),document.addEventListener(c.zP,this._onNavigateTab),document.addEventListener("keydown",this._hubKeydownHandler)}disconnectedCallback(){var t,e;super.disconnectedCallback(),null===(t=this._localeUnsub)||void 0===t||t.call(this),this._localeUnsub=void 0,null===(e=this._mql)||void 0===e||e.removeEventListener("change",this._onMqlChange),this._mql=void 0,this._authListener&&(s.xd.removeListener(this._authListener),this._authListener=void 0),this.removeEventListener(c.zP,this._onNavigateTab),document.removeEventListener(c.zP,this._onNavigateTab),document.removeEventListener("keydown",this._hubKeydownHandler)}_restoreNavState(){try{const t=b(localStorage.getItem(u));t&&(this._activeTab=t);const e=localStorage.getItem(c.eo);e&&(this._pendingDocsSlug=e,localStorage.removeItem(c.eo))}catch(t){}}_persistNavState(){try{localStorage.setItem(u,this._activeTab)}catch(t){}}_onNavigateTab(t){const e=t.detail;if(!(null==e?void 0:e.tab))return;const r={};e.slug&&(r.docsSlug=e.slug),e.presetsView&&(r.presetsView=e.presetsView),e.themesView&&(r.themesView=e.themesView),this._selectTab(e.tab,r)}_selectTab(t,e){var r;this._activeTab=null!==(r=b(t))&&void 0!==r?r:"dashboard",(null==e?void 0:e.docsSlug)&&(this._pendingDocsSlug=e.docsSlug),(null==e?void 0:e.presetsView)&&(this._pendingPresetsView=e.presetsView),(null==e?void 0:e.themesView)&&(this._pendingThemesView=e.themesView),this._persistNavState(),this._onTabActivated(this._activeTab)}_onTabActivated(t){"presets"===t&&this._refreshPresetsTab(),"docs"===t&&this._refreshDocsTab()}async _refreshPresetsTab(){const{ucPresetsService:t}=await Promise.all([r.e(5877),r.e(8717),r.e(9286)]).then(()=>r(8717));t.ensureWordPressLoaded(),await t.refreshWordPressPresets(),await Promise.all([r.e(5877),r.e(9418),r.e(8717),r.e(6444),r.e(4480),r.e(7229)]).then(()=>r(3378)),requestAnimationFrame(()=>{var t,e;const r=null===(t=this.renderRoot)||void 0===t?void 0:t.querySelector("hub-presets-tab");null===(e=null==r?void 0:r.refresh)||void 0===e||e.call(r)})}async _refreshDocsTab(){const t=this._pendingDocsSlug;await Promise.all([r.e(9418),r.e(4676)]).then(()=>r(4676)),requestAnimationFrame(()=>{var e,r;const o=null===(e=this.renderRoot)||void 0===e?void 0:e.querySelector("hub-docs-tab");t&&(null==o?void 0:o.openSlug)?(o.openSlug(t),this._pendingDocsSlug=""):null===(r=null==o?void 0:o.reload)||void 0===r||r.call(o)})}updated(t){var e;if(t.has("hass")&&this._updateProState(),t.has("_activeTab")){const t=null===(e=this.renderRoot)||void 0===e?void 0:e.querySelector(`#hub-tab-${this._activeTab}`);null==t||t.scrollIntoView({block:"nearest",inline:"nearest"})}}_updateProState(){var t;if(!(null===(t=this.hass)||void 0===t?void 0:t.states))return void(this._proAuth=null);const e=this.hass.states["sensor.ultra_card_pro_cloud_authentication_status"];if(!e)return void(this._proAuth=null);const r=e.attributes;this._proAuth={authenticated:"connected"===e.state&&!!(null==r?void 0:r.authenticated),user_id:null==r?void 0:r.user_id,username:null==r?void 0:r.username,email:null==r?void 0:r.email,display_name:null==r?void 0:r.display_name,subscription_tier:null==r?void 0:r.subscription_tier,subscription_status:null==r?void 0:r.subscription_status,subscription_expires:null==r?void 0:r.subscription_expires};const o=s.xd.checkIntegrationAuth(this.hass);o&&s.xd.setIntegrationUser(o,this.hass)}_toggleSidebar(){this.dispatchEvent(new CustomEvent("hass-toggle-menu",{bubbles:!0,composed:!0}))}_renderAccountChip(){var t,e;const r=(null===(t=this._proAuth)||void 0===t?void 0:t.authenticated)?{name:this._proAuth.display_name||this._proAuth.username||"Account",tier:this._proAuth.subscription_tier}:this._cloudUser?{name:this._cloudUser.displayName||this._cloudUser.username||"Account",tier:null===(e=this._cloudUser.subscription)||void 0===e?void 0:e.tier}:null;if(r){const t="pro"===r.tier;return o.qy`
        <button
          class="hub-account-chip"
          @click=${()=>this._selectTab("account")}
          title="View account"
          aria-label="View account"
        >
          <ha-icon icon="mdi:account-circle"></ha-icon>
          <span>Hi, ${r.name}</span>
          <span class="hub-tier-badge ${t?"pro":"free"}">
            ${t?o.qy`<ha-icon icon="mdi:star" style="--mdc-icon-size:10px"></ha-icon>`:""}
            ${t?"PRO":"Free"}
          </span>
        </button>
      `}return o.qy`
      <button
        class="hub-sign-in-btn"
        @click=${()=>this._selectTab("account")}
        aria-label="Sign in"
      >
        <ha-icon icon="mdi:login"></ha-icon>
        Sign In
      </button>
    `}_ensureTabLoaded(t){if(this._loadedTabs.has(t))return;let e=this._tabLoadPromises.get(t);if(!e){const r=h[t];e=(r?r():Promise.resolve()).then(()=>{this._loadedTabs=new Set(this._loadedTabs),this._loadedTabs.add(t),this._tabLoadPromises.delete(t),this.requestUpdate()}).catch(e=>{this._tabLoadPromises.delete(t),(0,l.Sn)(e,`hub tab ${t}`)}),this._tabLoadPromises.set(t,e)}}_renderTabContent(){var t,e,r;const i=this._activeTab,n=null!==(r=null===(e=null===(t=this.hass)||void 0===t?void 0:t.locale)||void 0===e?void 0:e.language)&&void 0!==r?r:"en";if(this._ensureTabLoaded(i),!this._loadedTabs.has(i))return o.qy`
        <div class="tab-loading" aria-busy="true">
          <ha-icon icon="mdi:loading"></ha-icon>
          <span>${(0,a.kg)("hub.loading",n,"Loading…")}</span>
        </div>
      `;switch(i){case"dashboard":default:return o.qy`<hub-dashboard-tab .hass=${this.hass}></hub-dashboard-tab>`;case"account":return o.qy`<hub-account-tab
          .hass=${this.hass}
          .auth=${this._proAuth}
          .cloudUser=${this._cloudUser}
        ></hub-account-tab>`;case"favorites":return o.qy`<hub-favorites-tab></hub-favorites-tab>`;case"presets":return o.qy`<hub-presets-tab
          .hass=${this.hass}
          .initialView=${this._pendingPresetsView||"browse"}
          @presets-view-applied=${()=>{this._pendingPresetsView=""}}
        ></hub-presets-tab>`;case"themes":return o.qy`<hub-themes-tab
          .hass=${this.hass}
          .initialView=${this._pendingThemesView||"browse"}
          @themes-view-applied=${()=>{this._pendingThemesView=""}}
        ></hub-themes-tab>`;case"colors":return o.qy`<hub-colors-tab .hass=${this.hass}></hub-colors-tab>`;case"variables":return o.qy`<hub-variables-tab .hass=${this.hass}></hub-variables-tab>`;case"templates":return o.qy`<hub-templates-tab></hub-templates-tab>`;case"docs":return o.qy`<hub-docs-tab
          .hass=${this.hass}
          .initialSlug=${this._pendingDocsSlug}
        ></hub-docs-tab>`}}render(){var t,e,r;const i=null!==(r=null===(e=null===(t=this.hass)||void 0===t?void 0:t.locale)||void 0===e?void 0:e.language)&&void 0!==r?r:"en";return o.qy`
      <div class="hub-container">
        <header class="hub-header ${this._narrow?"hub-header--narrow":""}">
          ${this._narrow?o.qy`
                <button
                  class="mobile-menu-btn"
                  @click=${this._toggleSidebar}
                  aria-label="Toggle sidebar"
                >
                  <ha-icon icon="mdi:menu"></ha-icon>
                </button>
              `:""}
          <div class="hub-brand">
            <div class="hub-brand-mark" aria-hidden="true">
              <ha-icon icon="mdi:cards"></ha-icon>
            </div>
            <div class="hub-brand-text">
              <h1>Ultra Card</h1>
              <span class="hub-brand-sub">${(0,a.kg)("hub.subtitle",i,"Hub")}</span>
            </div>
          </div>
          ${this._renderAccountChip()}
        </header>

        <nav class="hub-nav" aria-label="Hub navigation">
          <div class="tab-strip" role="tablist" @keydown=${this._onTabStripKeydown}>
            ${p.map(t=>o.qy`
                <button
                  role="tab"
                  id="hub-tab-${t.key}"
                  aria-selected=${this._activeTab===t.key?"true":"false"}
                  aria-controls="hub-tabpanel-${t.key}"
                  tabindex=${this._activeTab===t.key?"0":"-1"}
                  class=${this._activeTab===t.key?"active":""}
                  @click=${()=>this._selectTab(t.key)}
                >
                  <ha-icon icon=${t.icon}></ha-icon>
                  ${(0,a.kg)(t.labelKey,i,t.key)}
                </button>
              `)}
          </div>
        </nav>

        <div
          class="hub-content"
          role="tabpanel"
          id="hub-tabpanel-${this._activeTab}"
          aria-labelledby="hub-tab-${this._activeTab}"
        >
          <div class="hub-page">${this._renderTabContent()}</div>
        </div>
      </div>

      ${this._showShortcuts?o.qy`
            <div
              class="shortcuts-backdrop"
              role="dialog"
              aria-label="Keyboard shortcuts"
              @click=${()=>{this._showShortcuts=!1}}
            >
              <div class="shortcuts-panel" @click=${t=>t.stopPropagation()}>
                <h2>Keyboard shortcuts</h2>
                <ul>
                  <li><span>Toggle this help</span><kbd>?</kbd></li>
                  <li><span>Focus docs search (Docs tab)</span><kbd>/</kbd></li>
                </ul>
                <button
                  type="button"
                  class="close"
                  @click=${()=>{this._showShortcuts=!1}}
                >
                  Close
                </button>
              </div>
            </div>
          `:o.s6}
    `}};f.styles=[n.z,o.AH`
      .hub-nav {
        display: flex;
        flex-direction: column;
        gap: 0;
        flex-shrink: 0;
        border-bottom: 1px solid var(--uc-hub-border);
        background: var(--uc-hub-surface);
        box-shadow: var(--uc-hub-shadow-sm);
        position: relative;
        z-index: 1;
      }

      .tab-strip {
        display: flex;
        gap: 2px;
        padding: 0 16px;
        overflow-x: auto;
        scrollbar-width: none;
      }

      .tab-strip::-webkit-scrollbar {
        display: none;
      }

      .tab-strip button {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 14px;
        border: none;
        background: none;
        color: var(--secondary-text-color);
        font: inherit;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
        border-radius: 8px 8px 0 0;
        transition: color 0.15s ease, background 0.15s ease;
      }

      .tab-strip button::after {
        content: '';
        position: absolute;
        left: 10px;
        right: 10px;
        bottom: 0;
        height: 2px;
        border-radius: 2px 2px 0 0;
        background: var(--primary-color);
        opacity: 0;
        transform: scaleX(0.6);
        transition: opacity 0.15s ease, transform 0.2s ease;
      }

      .tab-strip button:hover {
        color: var(--primary-text-color);
        background: var(--uc-hub-surface-2);
      }

      .tab-strip button.active {
        color: var(--primary-color);
        font-weight: 600;
      }

      .tab-strip button.active::after {
        opacity: 1;
        transform: scaleX(1);
      }

      .tab-strip button ha-icon {
        --mdc-icon-size: 18px;
      }

      @media (max-width: 870px) {
        .tab-strip {
          padding: 0 8px;
        }
        .tab-strip button {
          padding: 10px 12px;
          font-size: 13px;
        }
      }

      .mobile-menu-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        border: none;
        background: none;
        color: var(--primary-text-color);
        cursor: pointer;
        border-radius: 50%;
        padding: 0;
        margin-left: -8px;
      }

      .hub-header--narrow {
        padding: 8px 12px 8px 8px;
        gap: 8px;
      }

      .tab-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 48px 24px;
        color: var(--secondary-text-color);
        font-size: 14px;
      }

      .tab-loading ha-icon {
        --mdc-icon-size: 24px;
        margin-right: 8px;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .shortcuts-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }

      .shortcuts-panel {
        max-width: 400px;
        width: 100%;
        background: var(--ha-card-background, var(--card-background-color));
        border-radius: 14px;
        padding: 20px 24px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      }

      .shortcuts-panel h2 {
        margin: 0 0 12px;
        font-size: 18px;
      }

      .shortcuts-panel ul {
        margin: 0;
        padding: 0;
        list-style: none;
        font-size: 14px;
        color: var(--secondary-text-color);
      }

      .shortcuts-panel li {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
      }

      .shortcuts-panel kbd {
        font-family: inherit;
        padding: 2px 8px;
        border-radius: 6px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 12px;
      }

      .shortcuts-panel button.close {
        margin-top: 16px;
        width: 100%;
        padding: 10px;
        border-radius: 8px;
        border: none;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        cursor: pointer;
        font: inherit;
      }
    `],d([(0,i.MZ)({attribute:!1})],f.prototype,"hass",void 0),d([(0,i.wk)()],f.prototype,"_activeTab",void 0),d([(0,i.wk)()],f.prototype,"_pendingDocsSlug",void 0),d([(0,i.wk)()],f.prototype,"_pendingPresetsView",void 0),d([(0,i.wk)()],f.prototype,"_pendingThemesView",void 0),d([(0,i.wk)()],f.prototype,"_proAuth",void 0),d([(0,i.wk)()],f.prototype,"_cloudUser",void 0),d([(0,i.wk)()],f.prototype,"_narrow",void 0),d([(0,i.wk)()],f.prototype,"_loadedTabs",void 0),d([(0,i.wk)()],f.prototype,"_showShortcuts",void 0),f=d([(0,i.EM)("ultra-card-panel")],f);export{f as UltraCardPanel};