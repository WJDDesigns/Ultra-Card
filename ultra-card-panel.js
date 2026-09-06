/*! For license information please see ultra-card-panel.js.LICENSE.txt */
var t,e,r,i,o={6478(t,e,r){r.d(e,{BT:()=>p,JM:()=>b,kg:()=>_});var i=r(9879);const o={en:()=>r.e(1543).then(r.t.bind(r,389,19)),ca:()=>r.e(2198).then(r.t.bind(r,8434,19)),cs:()=>r.e(7364).then(r.t.bind(r,9504,19)),da:()=>r.e(3751).then(r.t.bind(r,4149,19)),de:()=>r.e(931).then(r.t.bind(r,369,19)),"en-GB":()=>r.e(4351).then(r.t.bind(r,1885,19)),es:()=>r.e(4866).then(r.t.bind(r,8302,19)),fr:()=>r.e(3258).then(r.t.bind(r,5222,19)),it:()=>r.e(969).then(r.t.bind(r,4895,19)),nb:()=>r.e(6722).then(r.t.bind(r,4542,19)),nl:()=>r.e(1948).then(r.t.bind(r,6920,19)),nn:()=>r.e(9150).then(r.t.bind(r,5466,19)),no:()=>r.e(1959).then(r.t.bind(r,9093,19)),pl:()=>r.e(6870).then(r.t.bind(r,9026,19)),sv:()=>r.e(4377).then(r.t.bind(r,991,19))},n="en",s="uc-locale-loaded",a={},l=new Map,c=new Set;function d(t){return t.includes("-")||t.includes("_")?t.split(/[-_]/)[0]:t}function u(t){if(!t)return;if(o[t])return t;const e=d(t);return e!==t&&o[e]?e:void 0}function h(t){const e=u(t);if(!e||a[e]||c.has(e))return Promise.resolve();const r=l.get(e);if(r)return r;const n=o[e]().then(t=>{a[e]=function(t){return t&&"object"==typeof t.default&&t.default||t}(t),l.delete(e),"undefined"!=typeof window&&window.dispatchEvent(new CustomEvent(s,{detail:{lang:e}}))}).catch(t=>{l.delete(e),c.add(e),(0,i.Sn)(t,`locale ${e}`)});return l.set(e,n),n}function p(t){if("undefined"==typeof window)return()=>{};const e=e=>{var r,i;return t(null!==(i=null===(r=e.detail)||void 0===r?void 0:r.lang)&&void 0!==i?i:"")};return window.addEventListener(s,e),()=>window.removeEventListener(s,e)}function f(t,e){try{const r=a[e];if(!r)return;const i=t.split(".").reduce((t,e)=>{if(null!==t&&"object"==typeof t)return t[e]},r);return"string"==typeof i?i:void 0}catch(t){return}}function b(){return h(n)}function _(t,e,r){e&&!function(t){const e=u(t);return!e||!!a[e]}(e)&&h(e),a[n]||l.has(n)||c.has(n)||h(n);let i=f(t,e);if(i)return i;const o=d(e);if(o&&o!==e&&(i=f(t,o),i))return i;if(o!==n){const e=f(t,n);if(e)return e}return r||t}Object.freeze(Object.keys(o))},821(t,e,r){r.d(e,{DC:()=>s,eo:()=>n,nL:()=>o,zP:()=>i});const i="hub-navigate-tab";function o(t,e){t.dispatchEvent(new CustomEvent(i,{detail:e,bubbles:!0,composed:!0}))}const n="ultra_card_hub_pending_docs_slug";function s(t){try{localStorage.setItem(n,t),localStorage.setItem("ultra_card_hub_tab","docs")}catch(t){}"undefined"!=typeof document&&o(document,{tab:"docs",slug:t})}},9978(t,e,r){r.d(e,{z:()=>i});const i=r(2618).AH`
  :host {
    display: flex;
    flex-direction: column;
    /* Prevent the host itself from scrolling — only .hub-content should scroll */
    overflow: hidden;
    background: var(--primary-background-color);
    color: var(--primary-text-color);
    box-sizing: border-box;
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
    padding: 16px 24px 12px;
    gap: 12px;
    min-height: 56px;
    box-sizing: border-box;
    /* Prevent header from ever growing or scrolling away */
    overflow: hidden;
  }

  .hub-header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 400;
    color: var(--primary-text-color);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 870px) {
    .hub-header {
      padding: 8px 16px 8px 8px;
      gap: 8px;
    }
    .hub-header h1 {
      font-size: 20px;
    }
  }

  .hub-account-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 8px;
    background: var(--ha-card-background, var(--card-background-color));
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    color: var(--primary-text-color);
    font-size: 13px;
    cursor: pointer;
    transition: background 0.15s ease;
    flex-shrink: 0;
  }

  .hub-account-chip:hover {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
  }

  .hub-account-chip ha-icon {
    --mdc-icon-size: 18px;
    color: var(--secondary-text-color);
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
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid var(--primary-color);
    background: transparent;
    color: var(--primary-color);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
    flex-shrink: 0;
  }

  .hub-sign-in-btn:hover {
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
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

  /* Section cards (used by pro tab, etc.) */
  .hub-section {
    background: var(--ha-card-background, var(--card-background-color));
    border-radius: var(--ha-card-border-radius, 12px);
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
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
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
  }

  .empty-state-icon ha-icon {
    --mdc-icon-size: 40px;
    color: var(--primary-color);
    opacity: 0.6;
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
    margin-bottom: 20px;
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.06);
    border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
    border-radius: 10px;
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
    background: rgba(0, 0, 0, 0.06);
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
`},378(t,e,r){r.d(e,{xd:()=>b});var i=r(3045);class o{constructor(){this._sessionId=null,this._isEnabled=!1,this._listeners=new Set,this._deviceId=this._getOrCreateDeviceId(),this._sessionId=this._loadSessionId()}isEnabled(){return this._isEnabled}enable(){this._isEnabled=!0}disable(){this._isEnabled=!1,this.stopPolling(),i.v3&&console.log("📴 Cloud session sync disabled")}async createSession(t,e){if(!this._isEnabled)return i.v3&&console.log("📝 Cloud session sync disabled, skipping session creation"),null;try{i.v3&&console.log("🔄 Creating cloud session...");const r=await fetch(`${o.API_BASE}/ultra-card/v1/session/create`,{method:"POST",headers:{Authorization:`Bearer ${t.token}`,"Content-Type":"application/json"},body:JSON.stringify({device_id:this._deviceId,device_name:this._getDeviceName(),user_id:t.id,ha_user_id:e})});if(!r.ok)throw new Error(`Session creation failed: ${r.status}`);const n=await r.json();if(n.success&&n.session_id)return this._sessionId=n.session_id,this._saveSessionId(n.session_id),n.session_id;throw new Error("Invalid session response")}catch(t){return console.warn("⚠️ Failed to create cloud session, using local-only mode:",t),null}}async getCurrentSession(t,e){var r;if(!this._isEnabled)return null;try{i.v3&&console.log("🔄 Checking for active cloud session...");const n={"Content-Type":"application/json"};e&&(n.Authorization=`Bearer ${e}`);let s=`${o.API_BASE}/ultra-card/v1/session/current`;t&&(s+=`?ha_user_id=${encodeURIComponent(t)}`);const a=await fetch(s,{method:"GET",headers:n,credentials:"include"});if(!a.ok){if(404===a.status)return i.v3&&console.log("📭 No active cloud session found"),null;if(401===a.status)return i.v3&&console.log("🔐 Not authenticated, cannot retrieve session"),null;throw new Error(`Session fetch failed: ${a.status}`)}const l=await a.json();return l.success&&(null===(r=l.session)||void 0===r?void 0:r.user)?(this._sessionId=l.session.session_id,this._saveSessionId(l.session.session_id),l.session.user):null}catch(t){return console.warn("⚠️ Failed to fetch cloud session:",t),null}}async validateSession(t){if(!this._isEnabled||!this._sessionId)return!0;try{const e=await fetch(`${o.API_BASE}/ultra-card/v1/session/validate`,{method:"POST",headers:{Authorization:`Bearer ${t}`,"Content-Type":"application/json"},body:JSON.stringify({session_id:this._sessionId})});if(!e.ok)return!1;const r=await e.json();return r.success&&!0===r.valid}catch(t){return console.warn("⚠️ Session validation failed:",t),!0}}async invalidateSession(t){if(this._isEnabled)try{i.v3&&console.log("🔄 Invalidating cloud session..."),await fetch(`${o.API_BASE}/ultra-card/v1/session/logout`,{method:"DELETE",headers:{Authorization:`Bearer ${t}`,"Content-Type":"application/json"}}),this._clearSessionId()}catch(t){console.warn("⚠️ Failed to invalidate cloud session:",t)}}startPolling(t,e){this._isEnabled&&(this.stopPolling(),i.v3&&console.log("🔄 Starting session validation polling"),this._pollTimer=window.setInterval(async()=>{await this.validateSession(t)||(console.warn("⚠️ Session invalidated remotely, logging out"),this.stopPolling(),e())},o.POLL_INTERVAL))}stopPolling(){this._pollTimer&&(clearInterval(this._pollTimer),this._pollTimer=void 0)}addListener(t){this._listeners.add(t)}removeListener(t){this._listeners.delete(t)}_getOrCreateDeviceId(){try{let t=localStorage.getItem(o.DEVICE_ID_KEY);return t||(t=`device_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,localStorage.setItem(o.DEVICE_ID_KEY,t)),t}catch(t){return`device_${Date.now()}_${Math.random().toString(36).substr(2,9)}`}}_getDeviceName(){const t=navigator.userAgent;let e="Unknown Browser",r="Unknown OS";return t.includes("Chrome")?e="Chrome":t.includes("Safari")?e="Safari":t.includes("Firefox")?e="Firefox":t.includes("Edge")&&(e="Edge"),t.includes("Windows")?r="Windows":t.includes("Mac")?r="macOS":t.includes("Linux")?r="Linux":t.includes("Android")?r="Android":t.includes("iOS")&&(r="iOS"),`${e} on ${r}`}_loadSessionId(){try{return localStorage.getItem(o.SESSION_ID_KEY)}catch(t){return null}}_saveSessionId(t){try{localStorage.setItem(o.SESSION_ID_KEY,t)}catch(t){console.error("Failed to save session ID:",t)}}_clearSessionId(){try{localStorage.removeItem(o.SESSION_ID_KEY),this._sessionId=null}catch(t){console.error("Failed to clear session ID:",t)}}}o.API_BASE="https://ultracard.io/wp-json",o.SESSION_ID_KEY="ultra-card-session-id",o.POLL_INTERVAL=3e4,o.DEVICE_ID_KEY="ultra-card-device-id";const n=new o;var s=r(8690),a=r(1793);const l=15e3,c=6e4;class d extends Error{constructor(t){super(`Ultra Card Cloud did not respond within ${Math.round(t/1e3)}s. Please try again.`),this.name="UcCloudTimeoutError"}}function u(t,e){let r;return Promise.race([t,new Promise((t,i)=>{r=setTimeout(()=>i(new d(e)),e)})]).finally(()=>clearTimeout(r))}async function h(t,e,r){const i=new AbortController,o=setTimeout(()=>i.abort(),r),n=e.signal;n&&(n.aborted?i.abort():n.addEventListener("abort",()=>i.abort(),{once:!0}));try{return await fetch(t,Object.assign(Object.assign({},e),{signal:i.signal}))}catch(t){if("AbortError"===(null==t?void 0:t.name)&&!(null==n?void 0:n.aborted))throw new d(r);throw t}finally{clearTimeout(o)}}function p(t){const e=t.replace(/[^\x20-\x7E]+/g,"_").replace(/[\\/:*?"<>|]/g,"_").trim()||"upload.png";return e.length>180?e.slice(0,180):e}class f{constructor(){this._currentUser=null,this._listeners=new Set,this._integrationHass=null,this._isNotifying=!1;try{"undefined"!=typeof localStorage&&localStorage.removeItem(f.STORAGE_KEY)}catch(t){}}checkIntegrationAuth(t){var e,r;try{const i="sensor.ultra_card_pro_cloud_authentication_status",o=null===(e=null==t?void 0:t.states)||void 0===e?void 0:e[i];if(!o)return null;if("connected"!==o.state||!(null===(r=o.attributes)||void 0===r?void 0:r.authenticated))return null;const n=o.attributes;return{id:n.user_id,username:n.username||"",email:n.email||"",displayName:n.display_name||n.username||"",token:"",expiresAt:0,subscription:{tier:n.subscription_tier||"free",status:n.subscription_status||"expired",expires:n.subscription_expires,features:n.features||{auto_backups:"pro"===n.subscription_tier,snapshots_enabled:"pro"===n.subscription_tier,snapshot_limit:"pro"===n.subscription_tier?10:0,backup_retention_days:90},snapshot_count:0,snapshot_limit:"pro"===n.subscription_tier?10:0}}}catch(t){return console.debug("No Ultra Card Connect integration found:",t),null}}isIntegrationInstalled(t){var e;try{const r="sensor.ultra_card_pro_cloud_authentication_status";return!!(null===(e=null==t?void 0:t.states)||void 0===e?void 0:e[r])}catch(t){return!1}}async autoRegisterIntegration(t,e,r){var i,o;if(!(null==t?void 0:t.connection))return;const n=t.callApi,s=t.callWS;if("function"!=typeof n)return;const a=null===(i=null==t?void 0:t.states)||void 0===i?void 0:i["sensor.ultra_card_pro_cloud_authentication_status"];if("connected"!==(null==a?void 0:a.state)||!(null===(o=null==a?void 0:a.attributes)||void 0===o?void 0:o.authenticated))try{let t;const i="function"==typeof s?await s({type:"config_entries/get",domain:"ultra_card_pro_cloud"}):[],o=Array.isArray(i)&&i.length>0?i[0]:null;if(o){const i=await n("POST","config/config_entries/flow",{handler:"ultra_card_pro_cloud",show_advanced_options:!1,entry_id:o.entry_id});if(t=null==i?void 0:i.flow_id,!t)return;await n("POST",`config/config_entries/flow/${t}`,{next_step:"sign_in"}),await n("POST",`config/config_entries/flow/${t}`,{username:e,password:r})}else{const i=await n("POST","config/config_entries/flow",{handler:"ultra_card_pro_cloud",show_advanced_options:!1});if(t=null==i?void 0:i.flow_id,!t)return;await n("POST",`config/config_entries/flow/${t}`,{next_step:"sign_in"}),await n("POST",`config/config_entries/flow/${t}`,{username:e,password:r})}return}catch(t){return console.debug("Auto-register integration failed:",t),"Could not auto-configure. You can add the integration manually in Settings → Integrations."}}getCurrentUser(){return this._currentUser}setIntegrationUser(t,e){var r,i;e||console.warn("[UltraCard] setIntegrationUser called without hass; cloud requests using integration auth will fail."),(null===(r=this._currentUser)||void 0===r?void 0:r.email)!==t.email||(null===(i=this._currentUser)||void 0===i?void 0:i.token)!==t.token?(this._integrationHass=(null==t?void 0:t.token)?null:null!=e?e:null,this._setCurrentUser(t)):!t.token&&e&&(this._integrationHass=e)}isAuthenticated(){return!!this._currentUser&&(this._currentUser.token&&this._currentUser.token,!0)}shouldRefreshToken(){return this._shouldRefreshToken()}async loginViaHass(t,e,r){let i;try{i=await t.callApi("POST","ultra_card_pro_cloud/login",{username:e,password:r})}catch(t){const e=new Error(function(t){if(!t)return"";if("string"==typeof t)return(0,a.hc)(t,t);const e=t,r=e.body;if("string"==typeof r&&r.trim())return(0,a.hc)(r);if(r&&"object"==typeof r){const{error:t,message:e}=r;if("string"==typeof t&&t.trim())return(0,a.hc)(t);if("string"==typeof e&&e.trim())return(0,a.hc)(e)}return"string"==typeof e.message&&e.message.trim()?(0,a.hc)(e.message):"string"==typeof e.error&&e.error.trim()?(0,a.hc)(e.error):""}(t)||"Authentication failed");throw e.cause=t,e}if(!(null==i?void 0:i.success)||!(null==i?void 0:i.user))throw new Error((0,a.hc)(null==i?void 0:i.error,"Authentication failed"));const o=this._sensorAttrsToCloudUser(i.user);return this._integrationHass=t,this._setCurrentUser(o),o}async registerViaHass(t,e,r,i){var o,n;try{const o=await t.callApi("POST","ultra_card_pro_cloud/register",{username:e,email:r,display_name:i||e});if(!(null==o?void 0:o.success))throw new Error((null==o?void 0:o.error)||"Registration failed");return(null==o?void 0:o.message)||"Account created. Check your email inbox, junk, or spam for the ultracard.io message to finish setting your password."}catch(t){const e=(null===(o=null==t?void 0:t.body)||void 0===o?void 0:o.message)||(null===(n=null==t?void 0:t.body)||void 0===n?void 0:n.error)||(null==t?void 0:t.message)||"Registration failed";throw new Error(e)}}async logoutViaHass(t){try{await t.callApi("POST","ultra_card_pro_cloud/logout",{})}catch(t){}this._setCurrentUser(null),this._clearStorage(),this._clearAutoRefresh(),this._notifyListeners()}_sensorAttrsToCloudUser(t){return{id:t.user_id||0,username:t.username||"",email:t.email||"",displayName:t.display_name||t.username||"",token:"",expiresAt:0,subscription:{tier:t.subscription_tier||"free",status:t.subscription_status||"active",expires:t.subscription_expires,features:{auto_backups:"pro"===t.subscription_tier,snapshots_enabled:"pro"===t.subscription_tier,snapshot_limit:"pro"===t.subscription_tier?10:0,backup_retention_days:90},snapshot_count:0,snapshot_limit:"pro"===t.subscription_tier?10:0}}}async login(t){throw new Error("Direct browser login is no longer supported. Install Ultra Card Connect and sign in from the Hub Account tab.")}async register(t){throw new Error("Direct browser registration is no longer supported. Use the Hub Account tab (Ultra Card Connect).")}async refreshToken(t=0){throw new Error("Browser token refresh is no longer supported. Ultra Card Connect refreshes tokens on the server.")}async logout(){this._setCurrentUser(null),this._clearStorage(),this._clearAutoRefresh();try{n.stopPolling()}catch(t){}}getAuthHeader(){return this.isAuthenticated()&&this._currentUser.token?`Bearer ${this._currentUser.token}`:null}async authenticatedFetch(t,e={}){var r,i,o,n,a;if(!this.isAuthenticated())throw new Error("Not authenticated");if(!this._currentUser.token&&this._integrationHass){const n=(e.method||"GET").toUpperCase();if(e.body instanceof FormData){const o=e.body;if(function(t){for(const[,e]of t.entries())if(e instanceof File)return!0;return!1}(o)){if(!t.includes("/ultra-card/v1/media")&&!t.endsWith("/ultra-card/v1/media"))throw new Error("This request includes files and is not supported through Home Assistant integration auth.");const e=await h("/api/ultra_card_pro_cloud/media_upload",{method:"POST",body:o,credentials:"same-origin"},c);if(404===e.status){const e=(0,s.fu)(this._integrationHass);if(e.installed&&(e.outdated||!(0,s.p0)(this._integrationHass,"media_upload")))throw(0,s.ft)(this._integrationHass,"Media upload")||new Error("Media upload requires an updated Ultra Card Connect integration. Please update Connect and try again.");const i=function(t){for(const[e,r]of t.entries())if(r instanceof File)return{fieldName:e,file:r};return null}(o);if(!i)throw new Error("No file in FormData");const n=await(a=i.file,new Promise((t,e)=>{const r=new FileReader;r.onload=()=>{const e=r.result,i=e.indexOf(",");t(i>=0?e.slice(i+1):e)},r.onerror=()=>{var t;return e(null!==(t=r.error)&&void 0!==t?t:new Error("read failed"))},r.readAsDataURL(a)})),l=this._integrationHass.callApi;if("function"!=typeof l)throw new Error("Integration proxy unavailable");const d=await u(l("POST","ultra_card_pro_cloud/proxy",{method:"POST",url:t,body:{__media_upload_b64:{field:"photo",filename:p(i.file.name),content_type:i.file.type||"application/octet-stream",data:n}}}),c),h=null!==(r=null==d?void 0:d._status)&&void 0!==r?r:0,f=null==d?void 0:d._body;return{ok:h>=200&&h<300,status:h,json:()=>Promise.resolve(f),text:()=>Promise.resolve("string"==typeof f?f:JSON.stringify(f))}}return e}const d=function(t){var e;const r={};for(const[i,o]of t.entries()){if(o instanceof File)continue;const t=o;if(i.endsWith("[]")){const o=i.slice(0,-2),n=null!==(e=r[o])&&void 0!==e?e:[];n.push(t),r[o]=n}else if(void 0!==r[i]){const e=r[i];Array.isArray(e)?e.push(t):r[i]=[e,t]}else r[i]=t}return Array.isArray(r.photo_ids)&&(r.photo_ids=r.photo_ids.map(t=>parseInt(t,10))),r}(o),f=this._integrationHass.callApi;if("function"!=typeof f)throw new Error("Integration proxy unavailable");const b=await u(f("POST","ultra_card_pro_cloud/proxy",{method:n,url:t,body:d}),l),_=null!==(i=null==b?void 0:b._status)&&void 0!==i?i:0,g=null==b?void 0:b._body;return{ok:_>=200&&_<300,status:_,json:()=>Promise.resolve(g),text:()=>Promise.resolve("string"==typeof g?g:JSON.stringify(g))}}let d;if(void 0!==e.body&&null!==e.body&&(d=e.body,"string"==typeof d))try{d=JSON.parse(d)}catch(t){}const f=this._integrationHass.callApi;if("function"!=typeof f)throw new Error("Integration proxy unavailable");const b=await u(f("POST","ultra_card_pro_cloud/proxy",{method:n,url:t,body:void 0!==d?d:null}),l),_=null!==(o=null==b?void 0:b._status)&&void 0!==o?o:0,g=null==b?void 0:b._body;return{ok:_>=200&&_<300,status:_,json:()=>Promise.resolve(g),text:()=>Promise.resolve("string"==typeof g?g:JSON.stringify(g))}}const d=this.getAuthHeader();if(!d)throw new Error("Not authenticated");const f=e.body instanceof FormData,b={Authorization:d};f||(b["Content-Type"]="application/json");const _=f?c:l,g=await h(t,Object.assign(Object.assign({},e),{headers:Object.assign(Object.assign({},e.headers),b)}),_);if(401===g.status&&(null===(n=this._currentUser)||void 0===n?void 0:n.refreshToken))try{await this.refreshToken();const r=this.getAuthHeader();if(r){const i={Authorization:r};return f||(i["Content-Type"]="application/json"),h(t,Object.assign(Object.assign({},e),{headers:Object.assign(Object.assign({},e.headers),i)}),_)}}catch(t){throw new Error("Authentication expired. Please login again.")}return g}addListener(t){this._listeners.add(t)}removeListener(t){this._listeners.delete(t)}_createUserFromAuth(t){const e=t.expires_in?Date.now()+1e3*t.expires_in:Date.now()+f.DEFAULT_TOKEN_TTL;return{id:t.user_id,username:t.user_nicename,email:t.user_email,displayName:t.user_display_name,avatar:t.avatar_url,token:t.token,refreshToken:t.refresh_token,expiresAt:e}}_setCurrentUser(t){t||(this._integrationHass=null),this._currentUser=t,this._notifyListeners()}_notifyListeners(){if(!this._isNotifying){this._isNotifying=!0;try{this._listeners.forEach(t=>{try{t(this._currentUser)}catch(t){console.error("Error in auth listener:",t)}})}finally{this._isNotifying=!1}}}_shouldRefreshToken(){return!!this._currentUser&&Date.now()>=this._currentUser.expiresAt-f.REFRESH_THRESHOLD}_clearAutoRefresh(){this._refreshTimer&&(clearTimeout(this._refreshTimer),this._refreshTimer=void 0)}async _fetchSubscriptionData(t){try{const e=await fetch(`${f.API_BASE}/ultra-card/v1/subscription`,{method:"GET",headers:{Authorization:`Bearer ${t.token}`,"Content-Type":"application/json"}});if(e.ok){const r=await e.json();t.subscription=r}else console.warn("⚠️ Failed to fetch subscription, defaulting to free tier"),t.subscription={tier:"free",status:"active",features:{auto_backups:!0,snapshots_enabled:!1,snapshot_limit:0,backup_retention_days:30},snapshot_count:0,snapshot_limit:0}}catch(e){console.error("❌ Error fetching subscription:",e),t.subscription={tier:"free",status:"active",features:{auto_backups:!0,snapshots_enabled:!1,snapshot_limit:0,backup_retention_days:30},snapshot_count:0,snapshot_limit:0}}}_loadFromStorage(){try{const t=localStorage.getItem(f.STORAGE_KEY);if(t){const e=JSON.parse(t);this._isValidStoredUser(e)?this._currentUser=e:this._clearStorage()}}catch(t){console.error("❌ Failed to load auth from storage:",t),this._clearStorage()}}_clearStorage(){try{localStorage.removeItem(f.STORAGE_KEY)}catch(t){console.error("❌ Failed to clear auth storage:",t)}}_isValidStoredUser(t){if(!t)return console.warn("❌ Validation failed: user is null/undefined"),!1;const e={"user exists":!!t,"id is number":"number"==typeof t.id,"username is string":"string"==typeof t.username,"email is string":"string"==typeof t.email,"displayName is string":"string"==typeof t.displayName},r=Object.entries(e).filter(([t,e])=>!e).map(([t])=>t);return r.length>0?(console.warn("❌ Validation failed. Failed checks:",r),console.warn("   User data:",JSON.stringify(t,null,2)),!1):void 0!==t.token&&"string"!=typeof t.token?(console.warn("❌ Validation failed: token exists but is not a string"),!1):void 0===t.expiresAt||"number"==typeof t.expiresAt||(console.warn("❌ Validation failed: expiresAt exists but is not a number"),!1)}}f.API_BASE="https://ultracard.io/wp-json",f.JWT_ENDPOINT="/jwt-auth/v1",f.STORAGE_KEY="ultra-card-cloud-auth",f.REFRESH_THRESHOLD=3e5,f.DEFAULT_TOKEN_TTL=6048e5;const b=new f},8690(t,e,r){r.d(e,{$f:()=>i,Jd:()=>l,TV:()=>o,ft:()=>c,fu:()=>s,p0:()=>a});const i="sensor.ultra_card_pro_cloud_authentication_status",o="1.6.0";function n(t){if(!t||"string"!=typeof t)return null;const e=t.trim().split(/[-+]/)[0].split(".").map(t=>Number.parseInt(t,10));if(e.length<1||e.some(t=>Number.isNaN(t)))return null;for(;e.length<3;)e.push(0);return e.slice(0,3)}function s(t){const e=function(t){var e;return(null===(e=null==t?void 0:t.states)||void 0===e?void 0:e[i])||null}(t);if(!e)return{installed:!1,integrationVersion:null,capabilities:{},outdated:!1,reason:null};const r=e.attributes||{},s=r.integration_version,a="string"==typeof s&&s.trim()?s.trim():null;let l={};const c=r.capabilities;if(c&&"object"==typeof c&&!Array.isArray(c)&&(l=Object.assign({},c)),!a)return{installed:!0,integrationVersion:null,capabilities:l,outdated:!0,reason:"missing_version"};const d=function(t,e){const r=n(t),i=n(e);if(!r&&!i)return 0;if(!r)return-1;if(!i)return 1;for(let t=0;t<3;t++)if(r[t]!==i[t])return r[t]-i[t];return 0}(a,o)<0;return{installed:!0,integrationVersion:a,capabilities:l,outdated:d,reason:d?"below_minimum":null}}function a(t,e){const r=s(t);return!(!r.installed||r.outdated)&&!0===r.capabilities[e]}function l(t,e){const r=s(t);return r.installed&&r.outdated?e?`${e} requires Ultra Card Connect ${o} or newer. Please update the Ultra Card Connect integration.`:"Update Ultra Card Connect to continue. This feature needs Connect 1.6.0 or newer.":null}function c(t,e){const r=l(t,e);if(!r)return null;const i=new Error(r);return i.code="connect_outdated",i}},3496(t,e,r){r.d(e,{f:()=>n});var i=r(1001);const o="uc-toast-live-region",n=new class{constructor(){this._container=null}_ensureContainer(){if(this._container&&document.body.contains(this._container))return this._container;let t=document.getElementById(o);return t||(t=document.createElement("div"),t.id=o,t.setAttribute("role","status"),t.setAttribute("aria-live","polite"),t.setAttribute("aria-atomic","false"),t.style.cssText=`\n        position: fixed;\n        top: 16px;\n        right: 16px;\n        display: flex;\n        flex-direction: column;\n        gap: 8px;\n        z-index: ${i.Mu.TOAST_NOTIFICATION};\n        pointer-events: none;\n      `,document.body.appendChild(t)),this._container=t,t}show(t,e,r){var i,o;const n="string"==typeof t?{message:t,type:null!=e?e:"info",duration:null!=r?r:3e3}:t,s=null!==(i=n.type)&&void 0!==i?i:"info",a=null!==(o=n.duration)&&void 0!==o?o:3e3,l=this._ensureContainer();"error"===s?(l.setAttribute("role","alert"),l.setAttribute("aria-live","assertive")):(l.setAttribute("role","status"),l.setAttribute("aria-live","polite"));const c=document.createElement("div");c.setAttribute("aria-atomic","true"),c.textContent=n.message;const d=()=>{c.style.opacity="0",c.style.transform="translateX(40px)",setTimeout(()=>{c.remove(),0===l.children.length&&(l.setAttribute("role","status"),l.setAttribute("aria-live","polite"))},260)};if(n.action){const t=document.createElement("button");t.type="button",t.textContent=n.action.label,t.style.cssText="\n        margin-left: 12px;\n        padding: 4px 10px;\n        border: 1px solid rgba(255,255,255,0.7);\n        border-radius: 6px;\n        background: rgba(255,255,255,0.15);\n        color: inherit;\n        font: inherit;\n        font-weight: 600;\n        cursor: pointer;\n      ",t.addEventListener("click",()=>{var t;d(),null===(t=n.action)||void 0===t||t.onClick()}),c.appendChild(t)}const u="success"===s?"var(--success-color, #4caf50)":"error"===s?"var(--error-color, #f44336)":"warning"===s?"var(--warning-color, #ff9800)":"var(--primary-color, #03a9f4)";c.style.cssText=`\n      padding: 10px 20px;\n      background: ${u};\n      color: white;\n      border-radius: 8px;\n      font-size: 13px;\n      font-weight: 500;\n      box-shadow: 0 4px 12px rgba(0,0,0,0.25);\n      pointer-events: auto;\n      opacity: 0;\n      transform: translateX(40px);\n      transition: opacity 0.25s ease, transform 0.25s ease;\n      max-width: 360px;\n      word-break: break-word;\n    `,l.appendChild(c),requestAnimationFrame(()=>{c.style.opacity="1",c.style.transform="translateX(0)"}),a>0&&setTimeout(d,a)}success(t,e){this.show(t,"success",e)}error(t,e){this.show(t,"error",null!=e?e:4e3)}info(t,e){this.show(t,"info",e)}warning(t,e){this.show(t,"warning",e)}}},9879(t,e,r){r.d(e,{Sn:()=>a});var i=r(3496);const o=[/Failed to fetch dynamically imported module/i,/error loading dynamically imported module/i,/Importing a module script failed/i,/Failed to load module script/i,/Loading (?:CSS )?chunk [\w.-]+ failed/i,/ChunkLoadError/i,/^Load failed$/i,/NetworkError when attempting to fetch resource/i];let n=!1;function s(){try{window.location.reload()}catch(t){}}function a(t,e){return!(!function(t){if(!t)return!1;const e=t;if("ChunkLoadError"===e.name||"CSS_CHUNK_LOAD_FAILED"===e.code)return!0;const r="string"==typeof e.message?e.message:"string"==typeof t?t:"";return!!r&&o.some(t=>t.test(r))}(t)||"undefined"!=typeof window&&"undefined"!=typeof document&&(n?(console.warn(`[UltraCard] Chunk load failed (${e}); reload pending.`,t),0):(n=!0,async function(t){if("undefined"!=typeof navigator&&!1===navigator.onLine)return"offline";if("function"!=typeof fetch)return"unknown";const e=async t=>{var e;try{const r="undefined"!=typeof AbortController?new AbortController:void 0,i=r?setTimeout(()=>r.abort(),4e3):void 0,o=await fetch(t,{method:"HEAD",cache:"no-store",credentials:"same-origin",signal:null!==(e=null==r?void 0:r.signal)&&void 0!==e?e:null});return i&&clearTimeout(i),o.status}catch(t){return}},i=function(t){var e;const r=null==t?void 0:t.message;if("string"!=typeof r)return;const i=r.match(/(https?:\/\/\S+|\/\S+\.js\S*)/);return null===(e=null==i?void 0:i[1])||void 0===e?void 0:e.replace(/[).,]+$/,"")}(t);if(i){const t=await e(i);return 404===t||410===t?"version-skew":void 0===t?"offline":"unknown"}const o=(()=>{try{return new URL("ultra-card.js",r.p).toString()}catch(t){return}})();if(!o)return"unknown";const n=await e(o);return void 0===n?"offline":n>=200&&n<400?"version-skew":"unknown"}(t).then(r=>{console.warn(`[UltraCard] Chunk load failed (${e}): ${r}.`,t),function(t){const e=document.querySelector("home-assistant");if(e)try{return void e.dispatchEvent(new CustomEvent("hass-notification",{bubbles:!0,composed:!0,detail:{id:"ultra-card-chunk-load",message:t,duration:-1,dismissable:!0,action:{text:"Reload",action:s}}}))}catch(t){}i.f.show({message:t,type:"warning",duration:0,action:{label:"Reload",onClick:s}})}(function(t){switch(t){case"version-skew":return"Ultra Card was updated. Reload the page to finish.";case"offline":return"Ultra Card could not load part of this card. Check your connection and reload.";default:return"Ultra Card could not load part of this card. Reload the page to try again."}}(r))}),0)))}},3045(t,e,r){r.d(e,{v3:()=>i});const i=(()=>{try{if(window.__UC_DEBUG)return!0;const t=localStorage.getItem("uc_debug");return"1"===t||"true"===t}catch(t){return!1}})()},1793(t,e,r){r.d(e,{Fv:()=>i,hc:()=>s,nF:()=>a});const i="Can't reach Ultra Card cloud right now. Please try again in a few minutes.",o=["siteground","anti-bot","sg-captcha","sgcaptcha","bot-protection","bot protection","javascript challenge","exempt /wp-json","/wp-json/","robot challenge"];function n(t){const e=t.toLowerCase();return o.some(t=>e.includes(t))}function s(t,e=i){return"string"==typeof t&&t.trim()?n(t)?i:t.trim():e}function a(t){if("string"==typeof t)return n(t)?i:t;if(Array.isArray(t))return t.map(t=>a(t));if(t&&"object"==typeof t){const e={};for(const[r,i]of Object.entries(t))e[r]=a(i);return e}return t}},1001(t,e,r){r.d(e,{Mu:()=>i});const i={BASE_CONTENT:0,MODULE_CONTENT:1,MODULE_OVERLAY:2,MODULE_BACKGROUND:3,MODULE_DECORATIVE:5,MODULE_INTERACTIVE:8,CARD_BACKGROUND:10,CARD_CONTROLS:20,NATIVE_CARD_ABOVE_NAV:25,CARD_TOOLTIP:30,EDITOR_CONTENT:100,STICKY_HEADERS:400,EDITOR_TABS:500,EDITOR_NOTIFICATIONS:600,MODULE_POPUP_OVERLAY:1e3,MODULE_POPUP_CONTENT:1001,LAYOUT_CHILD_POPUP:1002,SELECTOR_POPUP:1003,RESIZE_HANDLE:1004,POPUP_STICKY_ELEMENTS:1005,POPUP_TABS:2e3,DROPDOWN_SELECT:5e3,DROPDOWN_MENU:5001,COLOR_PICKER_CONTAINER:0,COLOR_PICKER_PALETTE:5003,AUTOCOMPLETE:5004,CONTEXT_MENU:5005,DIALOG_OVERLAY:8e3,DIALOG_CONTENT:8001,TOAST_NOTIFICATION:8500,GRAPH_TOOLTIP:2147483647,CAMERA_FULLSCREEN_OVERLAY:1e4,CAMERA_FULLSCREEN_CONTENT:10001,FULLSCREEN_EDITOR:10002}},842(t,e,r){r.d(e,{mN:()=>$,AH:()=>l,W3:()=>x,Ec:()=>A});const i=globalThis,o=i.ShadowRoot&&(void 0===i.ShadyCSS||i.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),s=new WeakMap;class a{constructor(t,e,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(o&&void 0===t){const r=void 0!==e&&1===e.length;r&&(t=s.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),r&&s.set(e,t))}return t}toString(){return this.cssText}}const l=(t,...e)=>{const r=1===t.length?t[0]:e.reduce((e,r,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+t[i+1],t[0]);return new a(r,t,n)},c=(t,e)=>{if(o)t.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const r of e){const e=document.createElement("style"),o=i.litNonce;void 0!==o&&e.setAttribute("nonce",o),e.textContent=r.cssText,t.appendChild(e)}},d=o?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const r of t.cssRules)e+=r.cssText;return(t=>new a("string"==typeof t?t:t+"",void 0,n))(e)})(t):t,{is:u,defineProperty:h,getOwnPropertyDescriptor:p,getOwnPropertyNames:f,getOwnPropertySymbols:b,getPrototypeOf:_}=Object,g=globalThis,m=g.trustedTypes,v=m?m.emptyScript:"",y=g.reactiveElementPolyfillSupport,w=(t,e)=>t,x={toAttribute(t,e){switch(e){case Boolean:t=t?v:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let r=t;switch(e){case Boolean:r=null!==t;break;case Number:r=null===t?null:Number(t);break;case Object:case Array:try{r=JSON.parse(t)}catch(t){r=null}}return r}},A=(t,e)=>!u(t,e),E={attribute:!0,type:String,converter:x,reflect:!1,useDefault:!1,hasChanged:A};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;class $ extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=E){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const r=Symbol(),i=this.getPropertyDescriptor(t,r,e);void 0!==i&&h(this.prototype,t,i)}}static getPropertyDescriptor(t,e,r){const{get:i,set:o}=p(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:i,set(e){const n=i?.call(this);o?.call(this,e),this.requestUpdate(t,n,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??E}static _$Ei(){if(this.hasOwnProperty(w("elementProperties")))return;const t=_(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(w("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(w("properties"))){const t=this.properties,e=[...f(t),...b(t)];for(const r of e)this.createProperty(r,t[r])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,r]of e)this.elementProperties.set(t,r)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const r=this._$Eu(t,e);void 0!==r&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const r=new Set(t.flat(1/0).reverse());for(const t of r)e.unshift(d(t))}else void 0!==t&&e.push(d(t));return e}static _$Eu(t,e){const r=e.attribute;return!1===r?void 0:"string"==typeof r?r:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const r of e.keys())this.hasOwnProperty(r)&&(t.set(r,this[r]),delete this[r]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return c(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,r){this._$AK(t,r)}_$ET(t,e){const r=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,r);if(void 0!==i&&!0===r.reflect){const o=(void 0!==r.converter?.toAttribute?r.converter:x).toAttribute(e,r.type);this._$Em=t,null==o?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(t,e){const r=this.constructor,i=r._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=r.getPropertyOptions(i),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:x;this._$Em=i;const n=o.fromAttribute(e,t.type);this[i]=n??this._$Ej?.get(i)??n,this._$Em=null}}requestUpdate(t,e,r,i=!1,o){if(void 0!==t){const n=this.constructor;if(!1===i&&(o=this[t]),r??=n.getPropertyOptions(t),!((r.hasChanged??A)(o,e)||r.useDefault&&r.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,r))))return;this.C(t,e,r)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:r,reflect:i,wrapped:o},n){r&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==o||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||r||(e=void 0),this._$AL.set(t,e)),!0===i&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,r]of t){const{wrapped:t}=r,i=this[e];!0!==t||this._$AL.has(e)||void 0===i||this.C(e,void 0,r,i)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}}$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[w("elementProperties")]=new Map,$[w("finalized")]=new Map,y?.({ReactiveElement:$}),(g.reactiveElementVersions??=[]).push("2.1.2")},6752(t,e,r){r.d(e,{XX:()=>V,c0:()=>S,ge:()=>z,qy:()=>$,s6:()=>T});const i=globalThis,o=t=>t,n=i.trustedTypes,s=n?n.createPolicy("lit-html",{createHTML:t=>t}):void 0,a="$lit$",l=`lit$${Math.random().toFixed(9).slice(2)}$`,c="?"+l,d=`<${c}>`,u=document,h=()=>u.createComment(""),p=t=>null===t||"object"!=typeof t&&"function"!=typeof t,f=Array.isArray,b=t=>f(t)||"function"==typeof t?.[Symbol.iterator],_="[ \t\n\f\r]",g=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,m=/-->/g,v=/>/g,y=RegExp(`>|${_}(?:([^\\s"'>=/]+)(${_}*=${_}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),w=/'/g,x=/"/g,A=/^(?:script|style|textarea|title)$/i,E=t=>(e,...r)=>({_$litType$:t,strings:e,values:r}),$=E(1),S=(E(2),E(3),Symbol.for("lit-noChange")),T=Symbol.for("lit-nothing"),k=new WeakMap,C=u.createTreeWalker(u,129);function O(t,e){if(!f(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==s?s.createHTML(e):e}const P=(t,e)=>{const r=t.length-1,i=[];let o,n=2===e?"<svg>":3===e?"<math>":"",s=g;for(let e=0;e<r;e++){const r=t[e];let c,u,h=-1,p=0;for(;p<r.length&&(s.lastIndex=p,u=s.exec(r),null!==u);)p=s.lastIndex,s===g?"!--"===u[1]?s=m:void 0!==u[1]?s=v:void 0!==u[2]?(A.test(u[2])&&(o=RegExp("</"+u[2],"g")),s=y):void 0!==u[3]&&(s=y):s===y?">"===u[0]?(s=o??g,h=-1):void 0===u[1]?h=-2:(h=s.lastIndex-u[2].length,c=u[1],s=void 0===u[3]?y:'"'===u[3]?x:w):s===x||s===w?s=y:s===m||s===v?s=g:(s=y,o=void 0);const f=s===y&&t[e+1].startsWith("/>")?" ":"";n+=s===g?r+d:h>=0?(i.push(c),r.slice(0,h)+a+r.slice(h)+l+f):r+l+(-2===h?e:f)}return[O(t,n+(t[r]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),i]};class U{constructor({strings:t,_$litType$:e},r){let i;this.parts=[];let o=0,s=0;const d=t.length-1,u=this.parts,[p,f]=P(t,e);if(this.el=U.createElement(p,r),C.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(i=C.nextNode())&&u.length<d;){if(1===i.nodeType){if(i.hasAttributes())for(const t of i.getAttributeNames())if(t.endsWith(a)){const e=f[s++],r=i.getAttribute(t).split(l),n=/([.?@])?(.*)/.exec(e);u.push({type:1,index:o,name:n[2],strings:r,ctor:"."===n[1]?D:"?"===n[1]?j:"@"===n[1]?H:R}),i.removeAttribute(t)}else t.startsWith(l)&&(u.push({type:6,index:o}),i.removeAttribute(t));if(A.test(i.tagName)){const t=i.textContent.split(l),e=t.length-1;if(e>0){i.textContent=n?n.emptyScript:"";for(let r=0;r<e;r++)i.append(t[r],h()),C.nextNode(),u.push({type:2,index:++o});i.append(t[e],h())}}}else if(8===i.nodeType)if(i.data===c)u.push({type:2,index:o});else{let t=-1;for(;-1!==(t=i.data.indexOf(l,t+1));)u.push({type:7,index:o}),t+=l.length-1}o++}}static createElement(t,e){const r=u.createElement("template");return r.innerHTML=t,r}}function I(t,e,r=t,i){if(e===S)return e;let o=void 0!==i?r._$Co?.[i]:r._$Cl;const n=p(e)?void 0:e._$litDirective$;return o?.constructor!==n&&(o?._$AO?.(!1),void 0===n?o=void 0:(o=new n(t),o._$AT(t,r,i)),void 0!==i?(r._$Co??=[])[i]=o:r._$Cl=o),void 0!==o&&(e=I(t,o._$AS(t,e.values),o,i)),e}class N{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:r}=this._$AD,i=(t?.creationScope??u).importNode(e,!0);C.currentNode=i;let o=C.nextNode(),n=0,s=0,a=r[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new L(o,o.nextSibling,this,t):1===a.type?e=new a.ctor(o,a.name,a.strings,this,t):6===a.type&&(e=new M(o,this,t)),this._$AV.push(e),a=r[++s]}n!==a?.index&&(o=C.nextNode(),n++)}return C.currentNode=u,i}p(t){let e=0;for(const r of this._$AV)void 0!==r&&(void 0!==r.strings?(r._$AI(t,r,e),e+=r.strings.length-2):r._$AI(t[e])),e++}}class L{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,r,i){this.type=2,this._$AH=T,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=r,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=I(this,t,e),p(t)?t===T||null==t||""===t?(this._$AH!==T&&this._$AR(),this._$AH=T):t!==this._$AH&&t!==S&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):b(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==T&&p(this._$AH)?this._$AA.nextSibling.data=t:this.T(u.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:r}=t,i="number"==typeof r?this._$AC(t):(void 0===r.el&&(r.el=U.createElement(O(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===i)this._$AH.p(e);else{const t=new N(i,this),r=t.u(this.options);t.p(e),this.T(r),this._$AH=t}}_$AC(t){let e=k.get(t.strings);return void 0===e&&k.set(t.strings,e=new U(t)),e}k(t){f(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let r,i=0;for(const o of t)i===e.length?e.push(r=new L(this.O(h()),this.O(h()),this,this.options)):r=e[i],r._$AI(o),i++;i<e.length&&(this._$AR(r&&r._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=o(t).nextSibling;o(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class R{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,r,i,o){this.type=1,this._$AH=T,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=o,r.length>2||""!==r[0]||""!==r[1]?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=T}_$AI(t,e=this,r,i){const o=this.strings;let n=!1;if(void 0===o)t=I(this,t,e,0),n=!p(t)||t!==this._$AH&&t!==S,n&&(this._$AH=t);else{const i=t;let s,a;for(t=o[0],s=0;s<o.length-1;s++)a=I(this,i[r+s],e,s),a===S&&(a=this._$AH[s]),n||=!p(a)||a!==this._$AH[s],a===T?t=T:t!==T&&(t+=(a??"")+o[s+1]),this._$AH[s]=a}n&&!i&&this.j(t)}j(t){t===T?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class D extends R{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===T?void 0:t}}class j extends R{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==T)}}class H extends R{constructor(t,e,r,i,o){super(t,e,r,i,o),this.type=5}_$AI(t,e=this){if((t=I(this,t,e,0)??T)===S)return;const r=this._$AH,i=t===T&&r!==T||t.capture!==r.capture||t.once!==r.once||t.passive!==r.passive,o=t!==T&&(r===T||i);i&&this.element.removeEventListener(this.name,this,r),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class M{constructor(t,e,r){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(t){I(this,t)}}const z={M:a,P:l,A:c,C:1,L:P,R:N,D:b,V:I,I:L,H:R,N:j,U:H,B:D,F:M},F=i.litHtmlPolyfillSupport;F?.(U,L),(i.litHtmlVersions??=[]).push("3.3.2");const V=(t,e,r)=>{const i=r?.renderBefore??e;let o=i._$litPart$;if(void 0===o){const t=r?.renderBefore??null;i._$litPart$=o=new L(e.insertBefore(h(),t),t,void 0,r??{})}return o._$AI(t),o}},4791(t,e,r){r.d(e,{EM:()=>i,MZ:()=>a,wk:()=>l});const i=t=>(e,r)=>{void 0!==r?r.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)};var o=r(842);const n={attribute:!0,type:String,converter:o.W3,reflect:!1,hasChanged:o.Ec},s=(t=n,e,r)=>{const{kind:i,metadata:o}=r;let s=globalThis.litPropertyMetadata.get(o);if(void 0===s&&globalThis.litPropertyMetadata.set(o,s=new Map),"setter"===i&&((t=Object.create(t)).wrapped=!0),s.set(r.name,t),"accessor"===i){const{name:i}=r;return{set(r){const o=e.get.call(this);e.set.call(this,r),this.requestUpdate(i,o,t,!0,r)},init(e){return void 0!==e&&this.C(i,void 0,t,e),e}}}if("setter"===i){const{name:i}=r;return function(r){const o=this[i];e.call(this,r),this.requestUpdate(i,o,t,!0,r)}}throw Error("Unsupported decorator location: "+i)};function a(t){return(e,r)=>"object"==typeof r?s(t,e,r):((t,e,r)=>{const i=e.hasOwnProperty(r);return e.constructor.createProperty(r,t),i?Object.getOwnPropertyDescriptor(e,r):void 0})(t,e,r)}function l(t){return a({...t,state:!0,attribute:!1})}},2618(t,e,r){r.d(e,{WF:()=>s,AH:()=>i.AH,qy:()=>o.qy,s6:()=>o.s6});var i=r(842),o=r(6752);const n=globalThis;class s extends i.mN{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=(0,o.XX)(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return o.c0}}s._$litElement$=!0,s.finalized=!0,n.litElementHydrateSupport?.({LitElement:s});const a=n.litElementPolyfillSupport;a?.({LitElement:s}),(n.litElementVersions??=[]).push("4.2.2")}},n={};function s(t){var e=n[t];if(void 0!==e)return e.exports;var r=n[t]={exports:{}};return o[t](r,r.exports,s),r.exports}s.m=o,e=Object.getPrototypeOf?t=>Object.getPrototypeOf(t):t=>t.__proto__,s.t=function(r,i){if(1&i&&(r=this(r)),8&i)return r;if("object"==typeof r&&r){if(4&i&&r.__esModule)return r;if(16&i&&"function"==typeof r.then)return r}var o=Object.create(null);s.r(o);var n={};t=t||[null,e({}),e([]),e(e)];for(var a=2&i&&r;("object"==typeof a||"function"==typeof a)&&!~t.indexOf(a);a=e(a))Object.getOwnPropertyNames(a).forEach(t=>n[t]=()=>r[t]);return n.default=()=>r,s.d(o,n),o},s.d=(t,e)=>{for(var r in e)s.o(e,r)&&!s.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})},s.f={},s.e=t=>Promise.all(Object.keys(s.f).reduce((e,r)=>(s.f[r](t,e),e),[])),s.u=t=>"uc-"+({931:"locale-de",969:"locale-it",1543:"locale-en",1948:"locale-nl",1959:"locale-no",2198:"locale-ca",3002:"default-image",3258:"locale-fr",3751:"locale-da",4351:"locale-en-GB",4377:"locale-sv",4866:"locale-es",5877:"vendor-pako",6722:"locale-nb",6870:"locale-pl",7364:"locale-cs",9150:"locale-nn"}[t]||t)+"."+{800:"7aa57f83",931:"6534fe83",969:"869a6506",1130:"8c103d4f",1154:"085085db",1543:"5eb80184",1948:"b747dc04",1959:"dfb8c20d",2198:"03f0912b",3002:"93617d0e",3258:"420418e7",3751:"78cbd6bc",4351:"72f95097",4377:"e6bb1a09",4866:"14f836e5",5877:"45b285eb",6597:"51efd33a",6722:"c1ea8764",6870:"1a55b56d",7229:"456bf609",7364:"fd1a6fd0",7638:"e255bb33",8053:"a1176cf5",8612:"70e52534",8717:"3d963e91",8840:"61b87ad9",9150:"57a89c3a",9286:"5ce66fce",9532:"320c93d2"}[t]+".js",s.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),s.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},(()=>{var t;if("string"==typeof import.meta.url&&(t=import.meta.url),!t)throw new Error("Automatic publicPath is not supported in this browser");t=t.replace(/^blob:/,"").replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),s.p=t})(),r={5491:0},i=t=>{var e,i,{__webpack_esm_ids__:o,__webpack_esm_modules__:n,__webpack_esm_runtime__:a}=t,l=0;for(e in n)s.o(n,e)&&(s.m[e]=n[e]);for(a&&a(s);l<o.length;l++)i=o[l],s.o(r,i)&&r[i]&&r[i][0](),r[o[l]]=0},s.f.j=(t,e)=>{var o=s.o(r,t)?r[t]:void 0;if(0!==o)if(o)e.push(o[1]);else{var n=import("./"+s.u(t)).then(i,e=>{throw 0!==r[t]&&(r[t]=void 0),e});n=Promise.race([n,new Promise(e=>o=r[t]=[e])]),e.push(o[1]=n)}};try{const t=s.p;"string"==typeof t&&t.length>0&&!t.endsWith("/")&&(s.p=t.replace(/[?#].*$/,"").replace(/\/[^/]*$/,"/"))}catch(t){}var a=s(2618),l=s(4791),c=s(9978),d=s(378),u=s(6478),h=s(9879),p=s(821),f=function(t,e,r,i){var o,n=arguments.length,s=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,r,i);else for(var a=t.length-1;a>=0;a--)(o=t[a])&&(s=(n<3?o(s):n>3?o(e,r,s):o(e,r))||s);return n>3&&s&&Object.defineProperty(e,r,s),s};(0,u.JM)();const b="ultra_card_hub_tab",_={dashboard:()=>s.e(1130).then(s.bind(s,1130)),account:()=>s.e(9532).then(s.bind(s,9532)),favorites:()=>s.e(8612).then(s.bind(s,8612)),presets:()=>Promise.all([s.e(5877),s.e(800),s.e(8717),s.e(8053),s.e(7229)]).then(s.bind(s,3378)),colors:()=>s.e(8840).then(s.bind(s,8840)),variables:()=>s.e(1154).then(s.bind(s,1154)),templates:()=>s.e(6597).then(s.bind(s,6597)),docs:()=>Promise.all([s.e(800),s.e(7638)]).then(s.bind(s,7638))},g=[{key:"dashboard",labelKey:"hub.groups.home",icon:"mdi:home"},{key:"favorites",labelKey:"hub.tabs.favorites",icon:"mdi:heart"},{key:"presets",labelKey:"hub.tabs.presets",icon:"mdi:palette"},{key:"colors",labelKey:"hub.tabs.colors",icon:"mdi:eyedropper-variant"},{key:"variables",labelKey:"hub.tabs.variables",icon:"mdi:variable"},{key:"templates",labelKey:"hub.tabs.templates",icon:"mdi:code-tags"},{key:"account",labelKey:"hub.tabs.account",icon:"mdi:account-circle"},{key:"docs",labelKey:"hub.tabs.docs",icon:"mdi:book-open-page-variant"}];function m(t){return t?"pro"===t?"account":"about"===t?"docs":g.some(e=>e.key===t)?t:null:null}let v=class extends a.WF{constructor(){super(...arguments),this._activeTab="dashboard",this._pendingDocsSlug="",this._pendingPresetsView="",this._proAuth=null,this._cloudUser=null,this._narrow=window.matchMedia("(max-width: 870px)").matches,this._loadedTabs=new Set,this._showShortcuts=!1,this._tabLoadPromises=new Map,this._hubKeydownHandler=t=>{var e,r,i;if("?"!==t.key)return;const o=null===(r=null===(e=t.target)||void 0===e?void 0:e.tagName)||void 0===r?void 0:r.toLowerCase();"input"===o||"textarea"===o||(null===(i=t.target)||void 0===i?void 0:i.isContentEditable)||(t.preventDefault(),this._showShortcuts=!this._showShortcuts)},this._onMqlChange=t=>{this._narrow=t.matches}}connectedCallback(){super.connectedCallback(),this._restoreNavState(),this._mql=window.matchMedia("(max-width: 870px)"),this._mql.addEventListener("change",this._onMqlChange),this._updateProState(),this._cloudUser=d.xd.getCurrentUser(),this._authListener=t=>{this._cloudUser=t},d.xd.addListener(this._authListener),this._localeUnsub=(0,u.BT)(()=>this.requestUpdate()),this.addEventListener(p.zP,this._onNavigateTab),document.addEventListener(p.zP,this._onNavigateTab),document.addEventListener("keydown",this._hubKeydownHandler)}disconnectedCallback(){var t,e;super.disconnectedCallback(),null===(t=this._localeUnsub)||void 0===t||t.call(this),this._localeUnsub=void 0,null===(e=this._mql)||void 0===e||e.removeEventListener("change",this._onMqlChange),this._mql=void 0,this._authListener&&(d.xd.removeListener(this._authListener),this._authListener=void 0),this.removeEventListener(p.zP,this._onNavigateTab),document.removeEventListener(p.zP,this._onNavigateTab),document.removeEventListener("keydown",this._hubKeydownHandler)}_restoreNavState(){try{const t=m(localStorage.getItem(b));t&&(this._activeTab=t);const e=localStorage.getItem(p.eo);e&&(this._pendingDocsSlug=e,localStorage.removeItem(p.eo))}catch(t){}}_persistNavState(){try{localStorage.setItem(b,this._activeTab)}catch(t){}}_onNavigateTab(t){const e=t.detail;if(!(null==e?void 0:e.tab))return;const r={};e.slug&&(r.docsSlug=e.slug),e.presetsView&&(r.presetsView=e.presetsView),this._selectTab(e.tab,r)}_selectTab(t,e){var r;this._activeTab=null!==(r=m(t))&&void 0!==r?r:"dashboard",(null==e?void 0:e.docsSlug)&&(this._pendingDocsSlug=e.docsSlug),(null==e?void 0:e.presetsView)&&(this._pendingPresetsView=e.presetsView),this._persistNavState(),this._onTabActivated(this._activeTab)}_onTabActivated(t){"presets"===t&&this._refreshPresetsTab(),"docs"===t&&this._refreshDocsTab()}async _refreshPresetsTab(){const{ucPresetsService:t}=await Promise.all([s.e(5877),s.e(8717),s.e(9286)]).then(s.bind(s,8717));t.ensureWordPressLoaded(),await t.refreshWordPressPresets(),await Promise.all([s.e(5877),s.e(800),s.e(8717),s.e(8053),s.e(7229)]).then(s.bind(s,3378)),requestAnimationFrame(()=>{var t,e;const r=null===(t=this.renderRoot)||void 0===t?void 0:t.querySelector("hub-presets-tab");null===(e=null==r?void 0:r.refresh)||void 0===e||e.call(r)})}async _refreshDocsTab(){const t=this._pendingDocsSlug;await Promise.all([s.e(800),s.e(7638)]).then(s.bind(s,7638)),requestAnimationFrame(()=>{var e,r;const i=null===(e=this.renderRoot)||void 0===e?void 0:e.querySelector("hub-docs-tab");t&&(null==i?void 0:i.openSlug)?(i.openSlug(t),this._pendingDocsSlug=""):null===(r=null==i?void 0:i.reload)||void 0===r||r.call(i)})}updated(t){t.has("hass")&&this._updateProState()}_updateProState(){var t;if(!(null===(t=this.hass)||void 0===t?void 0:t.states))return void(this._proAuth=null);const e=this.hass.states["sensor.ultra_card_pro_cloud_authentication_status"];if(!e)return void(this._proAuth=null);const r=e.attributes;this._proAuth={authenticated:"connected"===e.state&&!!(null==r?void 0:r.authenticated),user_id:null==r?void 0:r.user_id,username:null==r?void 0:r.username,email:null==r?void 0:r.email,display_name:null==r?void 0:r.display_name,subscription_tier:null==r?void 0:r.subscription_tier,subscription_status:null==r?void 0:r.subscription_status,subscription_expires:null==r?void 0:r.subscription_expires};const i=d.xd.checkIntegrationAuth(this.hass);i&&d.xd.setIntegrationUser(i,this.hass)}_toggleSidebar(){this.dispatchEvent(new CustomEvent("hass-toggle-menu",{bubbles:!0,composed:!0}))}_renderAccountChip(){var t,e;const r=(null===(t=this._proAuth)||void 0===t?void 0:t.authenticated)?{name:this._proAuth.display_name||this._proAuth.username||"Account",tier:this._proAuth.subscription_tier}:this._cloudUser?{name:this._cloudUser.displayName||this._cloudUser.username||"Account",tier:null===(e=this._cloudUser.subscription)||void 0===e?void 0:e.tier}:null;if(r){const t="pro"===r.tier;return a.qy`
        <button
          class="hub-account-chip"
          @click=${()=>this._selectTab("account")}
          title="View account"
          aria-label="View account"
        >
          <ha-icon icon="mdi:account-circle"></ha-icon>
          <span>Hi, ${r.name}</span>
          <span class="hub-tier-badge ${t?"pro":"free"}">
            ${t?a.qy`<ha-icon icon="mdi:star" style="--mdc-icon-size:10px"></ha-icon>`:""}
            ${t?"PRO":"Free"}
          </span>
        </button>
      `}return a.qy`
      <button
        class="hub-sign-in-btn"
        @click=${()=>this._selectTab("account")}
        aria-label="Sign in"
      >
        <ha-icon icon="mdi:login"></ha-icon>
        Sign In
      </button>
    `}_ensureTabLoaded(t){if(this._loadedTabs.has(t))return;let e=this._tabLoadPromises.get(t);if(!e){const r=_[t];e=(r?r():Promise.resolve()).then(()=>{this._loadedTabs=new Set(this._loadedTabs),this._loadedTabs.add(t),this._tabLoadPromises.delete(t),this.requestUpdate()}).catch(e=>{this._tabLoadPromises.delete(t),(0,h.Sn)(e,`hub tab ${t}`)}),this._tabLoadPromises.set(t,e)}}_renderTabContent(){var t,e,r;const i=this._activeTab,o=null!==(r=null===(e=null===(t=this.hass)||void 0===t?void 0:t.locale)||void 0===e?void 0:e.language)&&void 0!==r?r:"en";if(this._ensureTabLoaded(i),!this._loadedTabs.has(i))return a.qy`
        <div class="tab-loading" aria-busy="true">
          <ha-icon icon="mdi:loading"></ha-icon>
          <span>${(0,u.kg)("hub.loading",o,"Loading…")}</span>
        </div>
      `;switch(i){case"dashboard":default:return a.qy`<hub-dashboard-tab .hass=${this.hass}></hub-dashboard-tab>`;case"account":return a.qy`<hub-account-tab
          .hass=${this.hass}
          .auth=${this._proAuth}
          .cloudUser=${this._cloudUser}
        ></hub-account-tab>`;case"favorites":return a.qy`<hub-favorites-tab></hub-favorites-tab>`;case"presets":return a.qy`<hub-presets-tab
          .hass=${this.hass}
          .initialView=${this._pendingPresetsView||"browse"}
          @presets-view-applied=${()=>{this._pendingPresetsView=""}}
        ></hub-presets-tab>`;case"colors":return a.qy`<hub-colors-tab .hass=${this.hass}></hub-colors-tab>`;case"variables":return a.qy`<hub-variables-tab .hass=${this.hass}></hub-variables-tab>`;case"templates":return a.qy`<hub-templates-tab></hub-templates-tab>`;case"docs":return a.qy`<hub-docs-tab
          .hass=${this.hass}
          .initialSlug=${this._pendingDocsSlug}
        ></hub-docs-tab>`}}render(){var t,e,r;const i=null!==(r=null===(e=null===(t=this.hass)||void 0===t?void 0:t.locale)||void 0===e?void 0:e.language)&&void 0!==r?r:"en";return a.qy`
      <div class="hub-container">
        <header class="hub-header ${this._narrow?"hub-header--narrow":""}">
          ${this._narrow?a.qy`
                <button
                  class="mobile-menu-btn"
                  @click=${this._toggleSidebar}
                  aria-label="Toggle sidebar"
                >
                  <ha-icon icon="mdi:menu"></ha-icon>
                </button>
              `:""}
          <h1>Ultra Card</h1>
          ${this._renderAccountChip()}
        </header>

        <nav class="hub-nav" aria-label="Hub navigation">
          <div class="tab-strip" role="tablist">
            ${g.map(t=>a.qy`
                <button
                  role="tab"
                  aria-selected=${this._activeTab===t.key?"true":"false"}
                  class=${this._activeTab===t.key?"active":""}
                  @click=${()=>this._selectTab(t.key)}
                >
                  <ha-icon icon=${t.icon}></ha-icon>
                  ${(0,u.kg)(t.labelKey,i,t.key)}
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
          ${this._renderTabContent()}
        </div>
      </div>

      ${this._showShortcuts?a.qy`
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
          `:a.s6}
    `}};v.styles=[c.z,a.AH`
      .hub-nav {
        display: flex;
        flex-direction: column;
        gap: 0;
        flex-shrink: 0;
        border-bottom: 2px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        background: var(--ha-card-background, var(--card-background-color));
      }

      .tab-strip {
        display: flex;
        gap: 0;
        padding: 0 16px;
        overflow-x: auto;
        scrollbar-width: none;
      }

      .tab-strip::-webkit-scrollbar {
        display: none;
      }

      .tab-strip button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        border: none;
        background: none;
        color: var(--secondary-text-color);
        font: inherit;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .tab-strip button.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      .tab-strip button ha-icon {
        --mdc-icon-size: 18px;
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
        padding: 8px 16px 8px 8px;
        gap: 8px;
      }

      .hub-header--narrow h1 {
        font-size: 20px;
        flex: 1;
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
    `],f([(0,l.MZ)({attribute:!1})],v.prototype,"hass",void 0),f([(0,l.wk)()],v.prototype,"_activeTab",void 0),f([(0,l.wk)()],v.prototype,"_pendingDocsSlug",void 0),f([(0,l.wk)()],v.prototype,"_pendingPresetsView",void 0),f([(0,l.wk)()],v.prototype,"_proAuth",void 0),f([(0,l.wk)()],v.prototype,"_cloudUser",void 0),f([(0,l.wk)()],v.prototype,"_narrow",void 0),f([(0,l.wk)()],v.prototype,"_loadedTabs",void 0),f([(0,l.wk)()],v.prototype,"_showShortcuts",void 0),v=f([(0,l.EM)("ultra-card-panel")],v);export{v as UltraCardPanel};