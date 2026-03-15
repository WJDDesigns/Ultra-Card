/*! For license information please see ultra-card-panel.js.LICENSE.txt */
(()=>{"use strict";var t,e,r,s,i={378:(t,e,r)=>{r.d(e,{x:()=>n});class s{constructor(){this._sessionId=null,this._isEnabled=!1,this._listeners=new Set,this._deviceId=this._getOrCreateDeviceId(),this._sessionId=this._loadSessionId()}isEnabled(){return this._isEnabled}enable(){this._isEnabled=!0}disable(){this._isEnabled=!1,this.stopPolling(),console.log("📴 Cloud session sync disabled")}async createSession(t,e){if(!this._isEnabled)return console.log("📝 Cloud session sync disabled, skipping session creation"),null;try{console.log("🔄 Creating cloud session...");const r=await fetch(`${s.API_BASE}/ultra-card/v1/session/create`,{method:"POST",headers:{Authorization:`Bearer ${t.token}`,"Content-Type":"application/json"},body:JSON.stringify({device_id:this._deviceId,device_name:this._getDeviceName(),user_id:t.id,ha_user_id:e})});if(!r.ok)throw new Error(`Session creation failed: ${r.status}`);const i=await r.json();if(i.success&&i.session_id)return this._sessionId=i.session_id,this._saveSessionId(i.session_id),i.session_id;throw new Error("Invalid session response")}catch(t){return console.warn("⚠️ Failed to create cloud session, using local-only mode:",t),null}}async getCurrentSession(t,e){var r;if(!this._isEnabled)return null;try{console.log("🔄 Checking for active cloud session...");const i={"Content-Type":"application/json"};e&&(i.Authorization=`Bearer ${e}`);let o=`${s.API_BASE}/ultra-card/v1/session/current`;t&&(o+=`?ha_user_id=${encodeURIComponent(t)}`);const n=await fetch(o,{method:"GET",headers:i,credentials:"include"});if(!n.ok){if(404===n.status)return console.log("📭 No active cloud session found"),null;if(401===n.status)return console.log("🔐 Not authenticated, cannot retrieve session"),null;throw new Error(`Session fetch failed: ${n.status}`)}const a=await n.json();return a.success&&(null===(r=a.session)||void 0===r?void 0:r.user)?(this._sessionId=a.session.session_id,this._saveSessionId(a.session.session_id),a.session.user):null}catch(t){return console.warn("⚠️ Failed to fetch cloud session:",t),null}}async validateSession(t){if(!this._isEnabled||!this._sessionId)return!0;try{const e=await fetch(`${s.API_BASE}/ultra-card/v1/session/validate`,{method:"POST",headers:{Authorization:`Bearer ${t}`,"Content-Type":"application/json"},body:JSON.stringify({session_id:this._sessionId})});if(!e.ok)return!1;const r=await e.json();return r.success&&!0===r.valid}catch(t){return console.warn("⚠️ Session validation failed:",t),!0}}async invalidateSession(t){if(this._isEnabled)try{console.log("🔄 Invalidating cloud session..."),await fetch(`${s.API_BASE}/ultra-card/v1/session/logout`,{method:"DELETE",headers:{Authorization:`Bearer ${t}`,"Content-Type":"application/json"}}),this._clearSessionId()}catch(t){console.warn("⚠️ Failed to invalidate cloud session:",t)}}startPolling(t,e){this._isEnabled&&(this.stopPolling(),console.log("🔄 Starting session validation polling"),this._pollTimer=window.setInterval((async()=>{await this.validateSession(t)||(console.warn("⚠️ Session invalidated remotely, logging out"),this.stopPolling(),e())}),s.POLL_INTERVAL))}stopPolling(){this._pollTimer&&(clearInterval(this._pollTimer),this._pollTimer=void 0)}addListener(t){this._listeners.add(t)}removeListener(t){this._listeners.delete(t)}_getOrCreateDeviceId(){try{let t=localStorage.getItem(s.DEVICE_ID_KEY);return t||(t=`device_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,localStorage.setItem(s.DEVICE_ID_KEY,t)),t}catch(t){return`device_${Date.now()}_${Math.random().toString(36).substr(2,9)}`}}_getDeviceName(){const t=navigator.userAgent;let e="Unknown Browser",r="Unknown OS";return t.includes("Chrome")?e="Chrome":t.includes("Safari")?e="Safari":t.includes("Firefox")?e="Firefox":t.includes("Edge")&&(e="Edge"),t.includes("Windows")?r="Windows":t.includes("Mac")?r="macOS":t.includes("Linux")?r="Linux":t.includes("Android")?r="Android":t.includes("iOS")&&(r="iOS"),`${e} on ${r}`}_loadSessionId(){try{return localStorage.getItem(s.SESSION_ID_KEY)}catch(t){return null}}_saveSessionId(t){try{localStorage.setItem(s.SESSION_ID_KEY,t)}catch(t){console.error("Failed to save session ID:",t)}}_clearSessionId(){try{localStorage.removeItem(s.SESSION_ID_KEY),this._sessionId=null}catch(t){console.error("Failed to clear session ID:",t)}}}s.API_BASE="https://ultracard.io/wp-json",s.SESSION_ID_KEY="ultra-card-session-id",s.POLL_INTERVAL=3e4,s.DEVICE_ID_KEY="ultra-card-device-id";const i=new s;class o{constructor(){this._currentUser=null,this._listeners=new Set,this._integrationHass=null,this._isNotifying=!1,this._lastSavedJson=null}checkIntegrationAuth(t){var e,r;try{const s="sensor.ultra_card_pro_cloud_authentication_status",i=null===(e=null==t?void 0:t.states)||void 0===e?void 0:e[s];if(!i)return null;if("connected"!==i.state||!(null===(r=i.attributes)||void 0===r?void 0:r.authenticated))return null;const o=i.attributes;return{id:o.user_id,username:o.username||"",email:o.email||"",displayName:o.display_name||o.username||"",token:"",expiresAt:0,subscription:{tier:o.subscription_tier||"free",status:o.subscription_status||"expired",expires:o.subscription_expires,features:o.features||{auto_backups:"pro"===o.subscription_tier,snapshots_enabled:"pro"===o.subscription_tier,snapshot_limit:"pro"===o.subscription_tier?10:0,backup_retention_days:90},snapshot_count:0,snapshot_limit:"pro"===o.subscription_tier?10:0}}}catch(t){return console.debug("No Ultra Card Connect integration found:",t),null}}isIntegrationInstalled(t){var e;try{const r="sensor.ultra_card_pro_cloud_authentication_status";return!!(null===(e=null==t?void 0:t.states)||void 0===e?void 0:e[r])}catch(t){return!1}}async autoRegisterIntegration(t,e,r){var s,i;if(!(null==t?void 0:t.connection))return;const o=t.callApi,n=t.callWS;if("function"!=typeof o)return;const a=null===(s=null==t?void 0:t.states)||void 0===s?void 0:s["sensor.ultra_card_pro_cloud_authentication_status"];if("connected"!==(null==a?void 0:a.state)||!(null===(i=null==a?void 0:a.attributes)||void 0===i?void 0:i.authenticated))try{let t;const s="function"==typeof n?await n({type:"config_entries/get",domain:"ultra_card_pro_cloud"}):[],i=Array.isArray(s)&&s.length>0?s[0]:null;if(i){const s=await o("POST","config/config_entries/flow",{handler:"ultra_card_pro_cloud",show_advanced_options:!1,entry_id:i.entry_id});if(t=null==s?void 0:s.flow_id,!t)return;await o("POST",`config/config_entries/flow/${t}`,{next_step:"sign_in"}),await o("POST",`config/config_entries/flow/${t}`,{username:e,password:r})}else{const s=await o("POST","config/config_entries/flow",{handler:"ultra_card_pro_cloud",show_advanced_options:!1});if(t=null==s?void 0:s.flow_id,!t)return;await o("POST",`config/config_entries/flow/${t}`,{next_step:"sign_in"}),await o("POST",`config/config_entries/flow/${t}`,{username:e,password:r})}return}catch(t){return console.debug("Auto-register integration failed:",t),"Could not auto-configure. You can add the integration manually in Settings → Integrations."}}_getHassUserId(){var t;try{let e=window.hass;if(!e){const t=document.querySelectorAll("ultra-card");for(const r of Array.from(t)){const t=r.hass;if(t&&t.user){e=t;break}}}if(!e){const t=document.querySelector("home-assistant");t&&(e=t.hass)}const r=(null===(t=null==e?void 0:e.user)||void 0===t?void 0:t.id)||null;return r||console.log("📝 HA user ID not available yet, hass object:",e?"exists":"missing","user:",(null==e?void 0:e.user)?"exists":"missing"),r}catch(t){return console.warn("Failed to get HA user ID:",t),null}}_retryCloudSessionCheck(){let t=0;const e=()=>{t++,this._getHassUserId()&&!this._currentUser?(console.log("🔄 Retrying cloud session check with now-available HA user ID (attempt",t,")"),this._checkCloudSession()):t<10?setTimeout(e,500):console.log("📝 Max retries reached, HA user ID still not available")};setTimeout(e,500)}async _checkCloudSession(){if(!i.isEnabled())return;console.log("🔄 Checking for active cloud session...");const t=this._getFromLocalStorage(),e=this._getHassUserId(),r=await i.getCurrentSession(e,null==t?void 0:t.token);if(r)return this._setCurrentUser(r),this._saveToStorage(),this._setupAutoRefresh(),void i.startPolling(r.token,(()=>{this.logout()}));this._currentUser&&(await i.validateSession(this._currentUser.token)?i.startPolling(this._currentUser.token,(()=>{this.logout()})):(console.warn("⚠️ Local session invalidated remotely"),await this.logout()))}getCurrentUser(){return this._currentUser}setIntegrationUser(t,e){var r,s;(null===(r=this._currentUser)||void 0===r?void 0:r.email)!==t.email||(null===(s=this._currentUser)||void 0===s?void 0:s.token)!==t.token?(this._integrationHass=(null==t?void 0:t.token)?null:null!=e?e:null,this._setCurrentUser(t)):!t.token&&e&&(this._integrationHass=e)}isAuthenticated(){return!!this._currentUser&&(this._currentUser.token&&this._currentUser.token,!0)}shouldRefreshToken(){return this._shouldRefreshToken()}async loginViaHass(t,e,r){let s;try{s=await t.callApi("POST","ultra_card_pro_cloud/login",{username:e,password:r})}catch(t){throw t}if(!(null==s?void 0:s.success)||!(null==s?void 0:s.user))throw new Error((null==s?void 0:s.error)||"Authentication failed");const i=this._sensorAttrsToCloudUser(s.user);return this._integrationHass=t,this._setCurrentUser(i),i}async registerViaHass(t,e,r,s){var i,o;try{const i=await t.callApi("POST","ultra_card_pro_cloud/register",{username:e,email:r,display_name:s||e});if(!(null==i?void 0:i.success))throw new Error((null==i?void 0:i.error)||"Registration failed");return(null==i?void 0:i.message)||"Account created. Check your email inbox, junk, or spam for the ultracard.io message to finish setting your password."}catch(t){const e=(null===(i=null==t?void 0:t.body)||void 0===i?void 0:i.message)||(null===(o=null==t?void 0:t.body)||void 0===o?void 0:o.error)||(null==t?void 0:t.message)||"Registration failed";throw new Error(e)}}async logoutViaHass(t){try{await t.callApi("POST","ultra_card_pro_cloud/logout",{})}catch(t){}this._setCurrentUser(null),this._notifyListeners()}_sensorAttrsToCloudUser(t){return{id:t.user_id||0,username:t.username||"",email:t.email||"",displayName:t.display_name||t.username||"",token:"",expiresAt:0,subscription:{tier:t.subscription_tier||"free",status:t.subscription_status||"active",expires:t.subscription_expires,features:{auto_backups:"pro"===t.subscription_tier,snapshots_enabled:"pro"===t.subscription_tier,snapshot_limit:"pro"===t.subscription_tier?10:0,backup_retention_days:90},snapshot_count:0,snapshot_limit:"pro"===t.subscription_tier?10:0}}}async login(t){try{const e=await fetch(`${o.API_BASE}${o.JWT_ENDPOINT}/token`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:t.username,password:t.password})});if(!e.ok){const t=await e.json().catch((()=>({message:"Login failed"})));throw new Error(t.message||`HTTP ${e.status}: ${e.statusText}`)}const r=await e.json(),s=this._createUserFromAuth(r);if(await this._fetchSubscriptionData(s),this._setCurrentUser(s),this._saveToStorage(),this._setupAutoRefresh(),i.isEnabled()){const t=this._getHassUserId();t?(await i.createSession(s,t),i.startPolling(s.token,(()=>{this.logout()}))):console.warn("⚠️ HA user ID not available, cloud session sync disabled")}return s}catch(t){throw console.error("❌ Login failed:",t),t}}async register(t){var e,r,s,i,n,a,l,c,d;try{if(!t.password)throw new Error("Password is required for direct registration.");const h=await fetch(`${o.API_BASE}/ultra-card/v1/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:t.username,email:t.email,password:t.password,display_name:t.firstName?`${t.firstName} ${t.lastName||""}`.trim():t.username})}),u=await h.json().catch((()=>({})));if(!h.ok){const t=u.message||`Registration failed (${h.status})`;throw new Error(t)}const p=null!==(e=u.token)&&void 0!==e?e:null===(r=null==u?void 0:u.data)||void 0===r?void 0:r.token;if(!p)return await this.login({username:t.username,password:t.password});const _={token:p,user_id:null!==(s=u.user_id)&&void 0!==s?s:0,user_email:null!==(i=u.user_email)&&void 0!==i?i:t.email,user_nicename:null!==(n=u.user_nicename)&&void 0!==n?n:t.username,user_display_name:null!==(a=u.user_display_name)&&void 0!==a?a:t.username,expires_in:null!==(d=null!==(l=u.expires_in)&&void 0!==l?l:null===(c=null==u?void 0:u.data)||void 0===c?void 0:c.expires_in)&&void 0!==d?d:void 0},b=this._createUserFromAuth(_);return await this._fetchSubscriptionData(b),this._setCurrentUser(b),this._saveToStorage(),this._setupAutoRefresh(),b}catch(t){throw console.error("❌ Registration failed:",t),t}}async refreshToken(t=0){var e;if(!(null===(e=this._currentUser)||void 0===e?void 0:e.refreshToken))throw new Error("No refresh token available");try{const t=await fetch(`${o.API_BASE}${o.JWT_ENDPOINT}/token/refresh`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refresh_token:this._currentUser.refreshToken})});if(!t.ok){if(t.status>=400&&t.status<500)throw new Error(`Invalid refresh token (${t.status})`);throw new Error(`Token refresh failed: ${t.statusText}`)}const e=await t.json();return this._currentUser=Object.assign(Object.assign({},this._currentUser),{token:e.token,expiresAt:Date.now()+1e3*(e.expires_in||3600)}),this._saveToStorage(),this._notifyListeners(),e.token}catch(e){if((e instanceof Error?e.message:"Unknown error").includes("Invalid refresh token"))throw console.error("❌ Refresh token invalid, logging out"),await this.logout(),e;if(t<3){const e=1e3*Math.pow(2,t);return console.warn(`⚠️ Token refresh failed (attempt ${t+1}/3), retrying in ${e}ms...`),await new Promise((t=>setTimeout(t,e))),this.refreshToken(t+1)}throw console.warn("⚠️ Token refresh failed after all retries, keeping session as-is"),e}}async logout(){var t,e;try{(null===(t=this._currentUser)||void 0===t?void 0:t.token)&&i.isEnabled()&&(await i.invalidateSession(this._currentUser.token),i.stopPolling()),(null===(e=this._currentUser)||void 0===e?void 0:e.token)&&await fetch(`${o.API_BASE}${o.JWT_ENDPOINT}/token/invalidate`,{method:"POST",headers:{Authorization:`Bearer ${this._currentUser.token}`}}).catch((()=>{}))}finally{this._setCurrentUser(null),this._clearStorage(),this._clearAutoRefresh()}}getAuthHeader(){return this.isAuthenticated()&&this._currentUser.token?`Bearer ${this._currentUser.token}`:null}async authenticatedFetch(t,e={}){var r,s;if(!this.isAuthenticated())throw new Error("Not authenticated");if(!this._currentUser.token&&this._integrationHass){const s=(e.method||"GET").toUpperCase();let i;if(void 0!==e.body&&null!==e.body&&(i=e.body instanceof FormData?void 0:e.body,"string"==typeof i))try{i=JSON.parse(i)}catch(t){}const o=this._integrationHass.callApi;if("function"!=typeof o)throw new Error("Integration proxy unavailable");const n=await o("POST","ultra_card_pro_cloud/proxy",{method:s,url:t,body:void 0!==i?i:null}),a=null!==(r=null==n?void 0:n._status)&&void 0!==r?r:0,l=null==n?void 0:n._body;return{ok:a>=200&&a<300,status:a,json:()=>Promise.resolve(l),text:()=>Promise.resolve("string"==typeof l?l:JSON.stringify(l))}}const i=this.getAuthHeader();if(!i)throw new Error("Not authenticated");const o=e.body instanceof FormData,n={Authorization:i};o||(n["Content-Type"]="application/json");const a=await fetch(t,Object.assign(Object.assign({},e),{headers:Object.assign(Object.assign({},e.headers),n)}));if(401===a.status&&(null===(s=this._currentUser)||void 0===s?void 0:s.refreshToken))try{await this.refreshToken();const r=this.getAuthHeader();if(r){const s={Authorization:r};return o||(s["Content-Type"]="application/json"),fetch(t,Object.assign(Object.assign({},e),{headers:Object.assign(Object.assign({},e.headers),s)}))}}catch(t){throw new Error("Authentication expired. Please login again.")}return a}addListener(t){this._listeners.add(t)}removeListener(t){this._listeners.delete(t)}_createUserFromAuth(t){const e=t.expires_in?Date.now()+1e3*t.expires_in:Date.now()+o.DEFAULT_TOKEN_TTL;return{id:t.user_id,username:t.user_nicename,email:t.user_email,displayName:t.user_display_name,avatar:t.avatar_url,token:t.token,refreshToken:t.refresh_token,expiresAt:e}}_setCurrentUser(t){t||(this._integrationHass=null),this._currentUser=t,this._notifyListeners()}_notifyListeners(){if(!this._isNotifying){this._isNotifying=!0;try{this._listeners.forEach((t=>{try{t(this._currentUser)}catch(t){console.error("Error in auth listener:",t)}}))}finally{this._isNotifying=!1}}}_isTokenValid(){return!!this._currentUser&&(!this._currentUser.expiresAt||0===this._currentUser.expiresAt||Date.now()<this._currentUser.expiresAt)}_shouldRefreshToken(){return!!this._currentUser&&Date.now()>=this._currentUser.expiresAt-o.REFRESH_THRESHOLD}_setupAutoRefresh(){if(this._clearAutoRefresh(),!this._currentUser)return;if(!this._currentUser.expiresAt||0===this._currentUser.expiresAt)return;const t=this._currentUser.expiresAt-Date.now()-o.REFRESH_THRESHOLD;t>0&&(this._refreshTimer=window.setTimeout((async()=>{try{await this.refreshToken(),this._setupAutoRefresh()}catch(t){console.error("Auto-refresh failed:",t)}}),t))}_attemptSessionRecovery(){this._currentUser&&this._currentUser.expiresAt&&0!==this._currentUser.expiresAt&&(this._isTokenValid()||this._currentUser.refreshToken&&window.setTimeout((async()=>{try{await this.refreshToken(),this._setupAutoRefresh()}catch(t){}}),0))}_clearAutoRefresh(){this._refreshTimer&&(clearTimeout(this._refreshTimer),this._refreshTimer=void 0)}async _fetchSubscriptionData(t){try{const e=await fetch(`${o.API_BASE}/ultra-card/v1/subscription`,{method:"GET",headers:{Authorization:`Bearer ${t.token}`,"Content-Type":"application/json"}});if(e.ok){const r=await e.json();t.subscription=r}else console.warn("⚠️ Failed to fetch subscription, defaulting to free tier"),t.subscription={tier:"free",status:"active",features:{auto_backups:!0,snapshots_enabled:!1,snapshot_limit:0,backup_retention_days:30},snapshot_count:0,snapshot_limit:0}}catch(e){console.error("❌ Error fetching subscription:",e),t.subscription={tier:"free",status:"active",features:{auto_backups:!0,snapshots_enabled:!1,snapshot_limit:0,backup_retention_days:30},snapshot_count:0,snapshot_limit:0}}}_loadFromStorage(){try{const t=localStorage.getItem(o.STORAGE_KEY);if(t){const e=JSON.parse(t);this._isValidStoredUser(e)?this._currentUser=e:this._clearStorage()}}catch(t){console.error("❌ Failed to load auth from storage:",t),this._clearStorage()}}_saveToStorage(){try{if(this._currentUser){const t=JSON.stringify(this._currentUser);if(t===this._lastSavedJson)return;localStorage.setItem(o.STORAGE_KEY,t),this._lastSavedJson=t,o._quotaErrorLogged=!1}else this._clearStorage(),this._lastSavedJson=null}catch(t){if(t instanceof DOMException&&"QuotaExceededError"===t.name)return void(o._quotaErrorLogged||(console.warn("⚠️ localStorage quota exceeded. Auth state will be kept in memory only."),o._quotaErrorLogged=!0));console.error("❌ Failed to save auth to storage:",t)}}_clearStorage(){try{localStorage.removeItem(o.STORAGE_KEY)}catch(t){console.error("❌ Failed to clear auth storage:",t)}}_getFromLocalStorage(){try{const t=localStorage.getItem(o.STORAGE_KEY);if(t)return JSON.parse(t)}catch(t){console.error("❌ Failed to read from storage:",t)}return null}_isValidStoredUser(t){if(!t)return console.warn("❌ Validation failed: user is null/undefined"),!1;const e={"user exists":!!t,"id is number":"number"==typeof t.id,"username is string":"string"==typeof t.username,"email is string":"string"==typeof t.email,"displayName is string":"string"==typeof t.displayName},r=Object.entries(e).filter((([t,e])=>!e)).map((([t])=>t));return r.length>0?(console.warn("❌ Validation failed. Failed checks:",r),console.warn("   User data:",JSON.stringify(t,null,2)),!1):void 0!==t.token&&"string"!=typeof t.token?(console.warn("❌ Validation failed: token exists but is not a string"),!1):void 0===t.expiresAt||"number"==typeof t.expiresAt||(console.warn("❌ Validation failed: expiresAt exists but is not a number"),!1)}}o.API_BASE="https://ultracard.io/wp-json",o.JWT_ENDPOINT="/jwt-auth/v1",o.STORAGE_KEY="ultra-card-cloud-auth",o.REFRESH_THRESHOLD=3e5,o.DEFAULT_TOKEN_TTL=6048e5,o._quotaErrorLogged=!1;const n=new o},4276:(t,e,r)=>{r.d(e,{EM:()=>s,MZ:()=>a,wk:()=>l});const s=t=>(e,r)=>{void 0!==r?r.addInitializer((()=>{customElements.define(t,e)})):customElements.define(t,e)};var i=r(4885);const o={attribute:!0,type:String,converter:i.W3,reflect:!1,hasChanged:i.Ec},n=(t=o,e,r)=>{const{kind:s,metadata:i}=r;let n=globalThis.litPropertyMetadata.get(i);if(void 0===n&&globalThis.litPropertyMetadata.set(i,n=new Map),n.set(r.name,t),"accessor"===s){const{name:s}=r;return{set(r){const i=e.get.call(this);e.set.call(this,r),this.requestUpdate(s,i,t)},init(e){return void 0!==e&&this.P(s,void 0,t),e}}}if("setter"===s){const{name:s}=r;return function(r){const i=this[s];e.call(this,r),this.requestUpdate(s,i,t)}}throw Error("Unsupported decorator location: "+s)};function a(t){return(e,r)=>"object"==typeof r?n(t,e,r):((t,e,r)=>{const s=e.hasOwnProperty(r);return e.constructor.createProperty(r,s?{...t,wrapped:!0}:t),s?Object.getOwnPropertyDescriptor(e,r):void 0})(t,e,r)}function l(t){return a({...t,state:!0,attribute:!1})}},4885:(t,e,r)=>{r.d(e,{mN:()=>S,AH:()=>l,W3:()=>w,Ec:()=>$});const s=globalThis,i=s.ShadowRoot&&(void 0===s.ShadyCSS||s.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),n=new WeakMap;class a{constructor(t,e,r){if(this._$cssResult$=!0,r!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const r=void 0!==e&&1===e.length;r&&(t=n.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),r&&n.set(e,t))}return t}toString(){return this.cssText}}const l=(t,...e)=>{const r=1===t.length?t[0]:e.reduce(((e,r,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+t[s+1]),t[0]);return new a(r,t,o)},c=(t,e)=>{if(i)t.adoptedStyleSheets=e.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet));else for(const r of e){const e=document.createElement("style"),i=s.litNonce;void 0!==i&&e.setAttribute("nonce",i),e.textContent=r.cssText,t.appendChild(e)}},d=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const r of t.cssRules)e+=r.cssText;return(t=>new a("string"==typeof t?t:t+"",void 0,o))(e)})(t):t,{is:h,defineProperty:u,getOwnPropertyDescriptor:p,getOwnPropertyNames:_,getOwnPropertySymbols:b,getPrototypeOf:g}=Object,f=globalThis,m=f.trustedTypes,v=m?m.emptyScript:"",y=f.reactiveElementPolyfillSupport,x=(t,e)=>t,w={toAttribute(t,e){switch(e){case Boolean:t=t?v:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let r=t;switch(e){case Boolean:r=null!==t;break;case Number:r=null===t?null:Number(t);break;case Object:case Array:try{r=JSON.parse(t)}catch(t){r=null}}return r}},$=(t,e)=>!h(t,e),A={attribute:!0,type:String,converter:w,reflect:!1,hasChanged:$};Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;class S extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=A){if(e.state&&(e.attribute=!1),this._$Ei(),this.elementProperties.set(t,e),!e.noAccessor){const r=Symbol(),s=this.getPropertyDescriptor(t,r,e);void 0!==s&&u(this.prototype,t,s)}}static getPropertyDescriptor(t,e,r){const{get:s,set:i}=p(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get(){return s?.call(this)},set(e){const o=s?.call(this);i.call(this,e),this.requestUpdate(t,o,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??A}static _$Ei(){if(this.hasOwnProperty(x("elementProperties")))return;const t=g(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(x("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(x("properties"))){const t=this.properties,e=[..._(t),...b(t)];for(const r of e)this.createProperty(r,t[r])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,r]of e)this.elementProperties.set(t,r)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const r=this._$Eu(t,e);void 0!==r&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const r=new Set(t.flat(1/0).reverse());for(const t of r)e.unshift(d(t))}else void 0!==t&&e.push(d(t));return e}static _$Eu(t,e){const r=e.attribute;return!1===r?void 0:"string"==typeof r?r:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const r of e.keys())this.hasOwnProperty(r)&&(t.set(r,this[r]),delete this[r]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return c(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((t=>t.hostConnected?.()))}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach((t=>t.hostDisconnected?.()))}attributeChangedCallback(t,e,r){this._$AK(t,r)}_$EC(t,e){const r=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,r);if(void 0!==s&&!0===r.reflect){const i=(void 0!==r.converter?.toAttribute?r.converter:w).toAttribute(e,r.type);this._$Em=t,null==i?this.removeAttribute(s):this.setAttribute(s,i),this._$Em=null}}_$AK(t,e){const r=this.constructor,s=r._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=r.getPropertyOptions(s),i="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:w;this._$Em=s,this[s]=i.fromAttribute(e,t.type),this._$Em=null}}requestUpdate(t,e,r){if(void 0!==t){if(r??=this.constructor.getPropertyOptions(t),!(r.hasChanged??$)(this[t],e))return;this.P(t,e,r)}!1===this.isUpdatePending&&(this._$ES=this._$ET())}P(t,e,r){this._$AL.has(t)||this._$AL.set(t,e),!0===r.reflect&&this._$Em!==t&&(this._$Ej??=new Set).add(t)}async _$ET(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,r]of t)!0!==r.wrapped||this._$AL.has(e)||void 0===this[e]||this.P(e,this[e],r)}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach((t=>t.hostUpdate?.())),this.update(e)):this._$EU()}catch(e){throw t=!1,this._$EU(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach((t=>t.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EU(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Ej&&=this._$Ej.forEach((t=>this._$EC(t,this[t]))),this._$EU()}updated(t){}firstUpdated(t){}}S.elementStyles=[],S.shadowRootOptions={mode:"open"},S[x("elementProperties")]=new Map,S[x("finalized")]=new Map,y?.({ReactiveElement:S}),(f.reactiveElementVersions??=[]).push("2.0.4")},5183:(t,e,r)=>{r.d(e,{WF:()=>o,AH:()=>s.AH,qy:()=>i.qy,s6:()=>i.s6});var s=r(4885),i=r(9247);class o extends s.mN{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=(0,i.XX)(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return i.c0}}o._$litElement$=!0,o.finalized=!0,globalThis.litElementHydrateSupport?.({LitElement:o});const n=globalThis.litElementPolyfillSupport;n?.({LitElement:o}),(globalThis.litElementVersions??=[]).push("4.1.1")},9247:(t,e,r)=>{r.d(e,{XX:()=>D,c0:()=>A,qy:()=>$,s6:()=>S});const s=globalThis,i=s.trustedTypes,o=i?i.createPolicy("lit-html",{createHTML:t=>t}):void 0,n="$lit$",a=`lit$${Math.random().toFixed(9).slice(2)}$`,l="?"+a,c=`<${l}>`,d=document,h=()=>d.createComment(""),u=t=>null===t||"object"!=typeof t&&"function"!=typeof t,p=Array.isArray,_="[ \t\n\f\r]",b=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,g=/-->/g,f=/>/g,m=RegExp(`>|${_}(?:([^\\s"'>=/]+)(${_}*=${_}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),v=/'/g,y=/"/g,x=/^(?:script|style|textarea|title)$/i,w=t=>(e,...r)=>({_$litType$:t,strings:e,values:r}),$=w(1),A=(w(2),w(3),Symbol.for("lit-noChange")),S=Symbol.for("lit-nothing"),E=new WeakMap,k=d.createTreeWalker(d,129);function T(t,e){if(!p(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==o?o.createHTML(e):e}const P=(t,e)=>{const r=t.length-1,s=[];let i,o=2===e?"<svg>":3===e?"<math>":"",l=b;for(let e=0;e<r;e++){const r=t[e];let d,h,u=-1,p=0;for(;p<r.length&&(l.lastIndex=p,h=l.exec(r),null!==h);)p=l.lastIndex,l===b?"!--"===h[1]?l=g:void 0!==h[1]?l=f:void 0!==h[2]?(x.test(h[2])&&(i=RegExp("</"+h[2],"g")),l=m):void 0!==h[3]&&(l=m):l===m?">"===h[0]?(l=i??b,u=-1):void 0===h[1]?u=-2:(u=l.lastIndex-h[2].length,d=h[1],l=void 0===h[3]?m:'"'===h[3]?y:v):l===y||l===v?l=m:l===g||l===f?l=b:(l=m,i=void 0);const _=l===m&&t[e+1].startsWith("/>")?" ":"";o+=l===b?r+c:u>=0?(s.push(d),r.slice(0,u)+n+r.slice(u)+a+_):r+a+(-2===u?e:_)}return[T(t,o+(t[r]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class U{constructor({strings:t,_$litType$:e},r){let s;this.parts=[];let o=0,c=0;const d=t.length-1,u=this.parts,[p,_]=P(t,e);if(this.el=U.createElement(p,r),k.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=k.nextNode())&&u.length<d;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(n)){const e=_[c++],r=s.getAttribute(t).split(a),i=/([.?@])?(.*)/.exec(e);u.push({type:1,index:o,name:i[2],strings:r,ctor:"."===i[1]?H:"?"===i[1]?j:"@"===i[1]?R:N}),s.removeAttribute(t)}else t.startsWith(a)&&(u.push({type:6,index:o}),s.removeAttribute(t));if(x.test(s.tagName)){const t=s.textContent.split(a),e=t.length-1;if(e>0){s.textContent=i?i.emptyScript:"";for(let r=0;r<e;r++)s.append(t[r],h()),k.nextNode(),u.push({type:2,index:++o});s.append(t[e],h())}}}else if(8===s.nodeType)if(s.data===l)u.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf(a,t+1));)u.push({type:7,index:o}),t+=a.length-1}o++}}static createElement(t,e){const r=d.createElement("template");return r.innerHTML=t,r}}function C(t,e,r=t,s){if(e===A)return e;let i=void 0!==s?r._$Co?.[s]:r._$Cl;const o=u(e)?void 0:e._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(!1),void 0===o?i=void 0:(i=new o(t),i._$AT(t,r,s)),void 0!==s?(r._$Co??=[])[s]=i:r._$Cl=i),void 0!==i&&(e=C(t,i._$AS(t,e.values),i,s)),e}class O{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:r}=this._$AD,s=(t?.creationScope??d).importNode(e,!0);k.currentNode=s;let i=k.nextNode(),o=0,n=0,a=r[0];for(;void 0!==a;){if(o===a.index){let e;2===a.type?e=new I(i,i.nextSibling,this,t):1===a.type?e=new a.ctor(i,a.name,a.strings,this,t):6===a.type&&(e=new L(i,this,t)),this._$AV.push(e),a=r[++n]}o!==a?.index&&(i=k.nextNode(),o++)}return k.currentNode=d,s}p(t){let e=0;for(const r of this._$AV)void 0!==r&&(void 0!==r.strings?(r._$AI(t,r,e),e+=r.strings.length-2):r._$AI(t[e])),e++}}class I{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,r,s){this.type=2,this._$AH=S,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=r,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=C(this,t,e),u(t)?t===S||null==t||""===t?(this._$AH!==S&&this._$AR(),this._$AH=S):t!==this._$AH&&t!==A&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>p(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==S&&u(this._$AH)?this._$AA.nextSibling.data=t:this.T(d.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:r}=t,s="number"==typeof r?this._$AC(t):(void 0===r.el&&(r.el=U.createElement(T(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new O(s,this),r=t.u(this.options);t.p(e),this.T(r),this._$AH=t}}_$AC(t){let e=E.get(t.strings);return void 0===e&&E.set(t.strings,e=new U(t)),e}k(t){p(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let r,s=0;for(const i of t)s===e.length?e.push(r=new I(this.O(h()),this.O(h()),this,this.options)):r=e[s],r._$AI(i),s++;s<e.length&&(this._$AR(r&&r._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class N{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,r,s,i){this.type=1,this._$AH=S,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=i,r.length>2||""!==r[0]||""!==r[1]?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=S}_$AI(t,e=this,r,s){const i=this.strings;let o=!1;if(void 0===i)t=C(this,t,e,0),o=!u(t)||t!==this._$AH&&t!==A,o&&(this._$AH=t);else{const s=t;let n,a;for(t=i[0],n=0;n<i.length-1;n++)a=C(this,s[r+n],e,n),a===A&&(a=this._$AH[n]),o||=!u(a)||a!==this._$AH[n],a===S?t=S:t!==S&&(t+=(a??"")+i[n+1]),this._$AH[n]=a}o&&!s&&this.j(t)}j(t){t===S?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class H extends N{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===S?void 0:t}}class j extends N{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==S)}}class R extends N{constructor(t,e,r,s,i){super(t,e,r,s,i),this.type=5}_$AI(t,e=this){if((t=C(this,t,e,0)??S)===A)return;const r=this._$AH,s=t===S&&r!==S||t.capture!==r.capture||t.once!==r.once||t.passive!==r.passive,i=t!==S&&(r===S||s);s&&this.element.removeEventListener(this.name,this,r),i&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class L{constructor(t,e,r){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(t){C(this,t)}}const z=s.litHtmlPolyfillSupport;z?.(U,I),(s.litHtmlVersions??=[]).push("3.2.1");const D=(t,e,r)=>{const s=r?.renderBefore??e;let i=s._$litPart$;if(void 0===i){const t=r?.renderBefore??null;s._$litPart$=i=new I(e.insertBefore(h(),t),t,void 0,r??{})}return i._$AI(t),i}},9978:(t,e,r)=>{r.d(e,{z:()=>s});const s=r(5183).AH`
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
`}},o={};function n(t){var e=o[t];if(void 0!==e)return e.exports;var r=o[t]={exports:{}};return i[t](r,r.exports,n),r.exports}n.m=i,e=Object.getPrototypeOf?t=>Object.getPrototypeOf(t):t=>t.__proto__,n.t=function(r,s){if(1&s&&(r=this(r)),8&s)return r;if("object"==typeof r&&r){if(4&s&&r.__esModule)return r;if(16&s&&"function"==typeof r.then)return r}var i=Object.create(null);n.r(i);var o={};t=t||[null,e({}),e([]),e(e)];for(var a=2&s&&r;"object"==typeof a&&!~t.indexOf(a);a=e(a))Object.getOwnPropertyNames(a).forEach((t=>o[t]=()=>r[t]));return o.default=()=>r,n.d(i,o),i},n.d=(t,e)=>{for(var r in e)n.o(e,r)&&!n.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})},n.f={},n.e=t=>Promise.all(Object.keys(n.f).reduce(((e,r)=>(n.f[r](t,e),e)),[])),n.u=t=>"uc-"+t+".js",n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),n.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r={},s="ultra-card:",n.l=(t,e,i,o)=>{if(r[t])r[t].push(e);else{var a,l;if(void 0!==i)for(var c=document.getElementsByTagName("script"),d=0;d<c.length;d++){var h=c[d];if(h.getAttribute("src")==t||h.getAttribute("data-webpack")==s+i){a=h;break}}a||(l=!0,(a=document.createElement("script")).charset="utf-8",a.timeout=120,n.nc&&a.setAttribute("nonce",n.nc),a.setAttribute("data-webpack",s+i),a.src=t),r[t]=[e];var u=(e,s)=>{a.onerror=a.onload=null,clearTimeout(p);var i=r[t];if(delete r[t],a.parentNode&&a.parentNode.removeChild(a),i&&i.forEach((t=>t(s))),e)return e(s)},p=setTimeout(u.bind(null,void 0,{type:"timeout",target:a}),12e4);a.onerror=u.bind(null,a.onerror),a.onload=u.bind(null,a.onload),l&&document.head.appendChild(a)}},n.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},(()=>{var t;n.g.importScripts&&(t=n.g.location+"");var e=n.g.document;if(!t&&e&&(e.currentScript&&"SCRIPT"===e.currentScript.tagName.toUpperCase()&&(t=e.currentScript.src),!t)){var r=e.getElementsByTagName("script");if(r.length)for(var s=r.length-1;s>-1&&(!t||!/^http(s?):/.test(t));)t=r[s--].src}if(!t)throw new Error("Automatic publicPath is not supported in this browser");t=t.replace(/^blob:/,"").replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),n.p=t})(),(()=>{var t={5491:0};n.f.j=(e,r)=>{var s=n.o(t,e)?t[e]:void 0;if(0!==s)if(s)r.push(s[2]);else{var i=new Promise(((r,i)=>s=t[e]=[r,i]));r.push(s[2]=i);var o=n.p+n.u(e),a=new Error;n.l(o,(r=>{if(n.o(t,e)&&(0!==(s=t[e])&&(t[e]=void 0),s)){var i=r&&("load"===r.type?"missing":r.type),o=r&&r.target&&r.target.src;a.message="Loading chunk "+e+" failed.\n("+i+": "+o+")",a.name="ChunkLoadError",a.type=i,a.request=o,s[1](a)}}),"chunk-"+e,e)}};var e=(e,r)=>{var s,i,[o,a,l]=r,c=0;if(o.some((e=>0!==t[e]))){for(s in a)n.o(a,s)&&(n.m[s]=a[s]);l&&l(n)}for(e&&e(r);c<o.length;c++)i=o[c],n.o(t,i)&&t[i]&&t[i][0](),t[i]=0},r=self.webpackChunkultra_card=self.webpackChunkultra_card||[];r.forEach(e.bind(null,0)),r.push=e.bind(null,r.push.bind(r))})();var a=n(5183),l=n(4276),c=n(9978),d=n(378),h=function(t,e,r,s){var i,o=arguments.length,n=o<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,r):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,s);else for(var a=t.length-1;a>=0;a--)(i=t[a])&&(n=(o<3?i(n):o>3?i(e,r,n):i(e,r))||n);return o>3&&n&&Object.defineProperty(e,r,n),n};const u={dashboard:()=>Promise.all([n.e(8980),n.e(1130)]).then(n.bind(n,1130)),account:()=>Promise.all([n.e(7568),n.e(4741)]).then(n.bind(n,4741)),favorites:()=>Promise.all([n.e(7568),n.e(8612)]).then(n.bind(n,8612)),presets:()=>Promise.all([n.e(9418),n.e(7568),n.e(8269)]).then(n.bind(n,8269)),colors:()=>Promise.all([n.e(7568),n.e(8840)]).then(n.bind(n,8840)),variables:()=>Promise.all([n.e(7568),n.e(1154)]).then(n.bind(n,1154)),templates:()=>n.e(6597).then(n.bind(n,6597)),pro:()=>Promise.all([n.e(8980),n.e(1328)]).then(n.bind(n,1328)),about:()=>Promise.all([n.e(6900),n.e(7713)]).then(n.bind(n,7713))},p=[{key:"dashboard",label:"Dashboard",icon:"mdi:view-dashboard"},{key:"account",label:"Account",icon:"mdi:account-circle"},{key:"pro",label:"Pro",icon:"mdi:star"},{key:"favorites",label:"Favorites",icon:"mdi:heart"},{key:"presets",label:"Presets",icon:"mdi:palette"},{key:"colors",label:"Colors",icon:"mdi:eyedropper-variant"},{key:"variables",label:"Variables",icon:"mdi:variable"},{key:"templates",label:"Templates",icon:"mdi:code-tags"},{key:"about",label:"About",icon:"mdi:information-outline"}];let _=class extends a.WF{constructor(){super(...arguments),this._activeTab="dashboard",this._proAuth=null,this._showProTab=!1,this._cloudUser=null,this._narrow=window.matchMedia("(max-width: 870px)").matches,this._loadedTabs=new Set,this._tabLoadPromises=new Map,this._onMqlChange=t=>{this._narrow=t.matches}}connectedCallback(){super.connectedCallback(),this._mql=window.matchMedia("(max-width: 870px)"),this._mql.addEventListener("change",this._onMqlChange),this._updateProState(),this._cloudUser=d.x.getCurrentUser(),this._authListener=t=>{this._cloudUser=t},d.x.addListener(this._authListener),this.addEventListener("hub-navigate-tab",this._onNavigateTab)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._mql)||void 0===t||t.removeEventListener("change",this._onMqlChange),this._mql=void 0,this._authListener&&(d.x.removeListener(this._authListener),this._authListener=void 0),this.removeEventListener("hub-navigate-tab",this._onNavigateTab)}_onNavigateTab(t){var e;const r=null===(e=t.detail)||void 0===e?void 0:e.tab;r&&(this._activeTab=r)}updated(t){t.has("hass")&&this._updateProState()}_updateProState(){var t;if(!(null===(t=this.hass)||void 0===t?void 0:t.states))return this._showProTab=!1,void(this._proAuth=null);const e=this.hass.states["sensor.ultra_card_pro_cloud_authentication_status"];if(this._showProTab=!!e,!e)return void(this._proAuth=null);const r=e.attributes;this._proAuth={authenticated:"connected"===e.state&&!!(null==r?void 0:r.authenticated),user_id:null==r?void 0:r.user_id,username:null==r?void 0:r.username,email:null==r?void 0:r.email,display_name:null==r?void 0:r.display_name,subscription_tier:null==r?void 0:r.subscription_tier,subscription_status:null==r?void 0:r.subscription_status,subscription_expires:null==r?void 0:r.subscription_expires};const s=d.x.checkIntegrationAuth(this.hass);s&&d.x.setIntegrationUser(s,this.hass)}_toggleSidebar(){this.dispatchEvent(new CustomEvent("hass-toggle-menu",{bubbles:!0,composed:!0}))}_renderAccountChip(){var t,e;const r=(null===(t=this._proAuth)||void 0===t?void 0:t.authenticated)?{name:this._proAuth.display_name||this._proAuth.username||"Account",tier:this._proAuth.subscription_tier}:this._cloudUser?{name:this._cloudUser.displayName||this._cloudUser.username||"Account",tier:null===(e=this._cloudUser.subscription)||void 0===e?void 0:e.tier}:null;if(r){const t="pro"===r.tier;return a.qy`
        <button
          class="hub-account-chip"
          @click=${()=>this._activeTab="account"}
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
        @click=${()=>this._activeTab="account"}
        aria-label="Sign in"
      >
        <ha-icon icon="mdi:login"></ha-icon>
        Sign In
      </button>
    `}_ensureTabLoaded(t){if(this._loadedTabs.has(t))return;let e=this._tabLoadPromises.get(t);if(!e){const r=u[t];e=(r?r():Promise.resolve()).then((()=>{this._loadedTabs=new Set(this._loadedTabs),this._loadedTabs.add(t),this._tabLoadPromises.delete(t),this.requestUpdate()})).catch((()=>{this._tabLoadPromises.delete(t)})),this._tabLoadPromises.set(t,e)}}_renderTabContent(){const t=this._activeTab;if(this._ensureTabLoaded(t),!this._loadedTabs.has(t))return a.qy`
        <div class="tab-loading" aria-busy="true">
          <ha-icon icon="mdi:loading"></ha-icon>
          <span>Loading…</span>
        </div>
      `;switch(t){case"dashboard":default:return a.qy`<hub-dashboard-tab .hass=${this.hass}></hub-dashboard-tab>`;case"account":return a.qy`<hub-account-tab
          .hass=${this.hass}
          .auth=${this._proAuth}
          .cloudUser=${this._cloudUser}
        ></hub-account-tab>`;case"favorites":return a.qy`<hub-favorites-tab></hub-favorites-tab>`;case"presets":return a.qy`<hub-presets-tab></hub-presets-tab>`;case"colors":return a.qy`<hub-colors-tab .hass=${this.hass}></hub-colors-tab>`;case"variables":return a.qy`<hub-variables-tab .hass=${this.hass}></hub-variables-tab>`;case"templates":return a.qy`<hub-templates-tab></hub-templates-tab>`;case"pro":return a.qy`<hub-pro-tab .auth=${this._proAuth} .hass=${this.hass} .cloudUser=${this._cloudUser}></hub-pro-tab>`;case"about":return a.qy`<ultra-about-tab .hass=${this.hass}></ultra-about-tab>`}}render(){const t=p;return a.qy`
      <div class="hub-container">
        <header class="hub-header ${this._narrow?"hub-header--narrow":""}">
          ${this._narrow?a.qy`
            <button
              class="mobile-menu-btn"
              @click=${this._toggleSidebar}
              aria-label="Toggle sidebar"
              title="Toggle sidebar"
            >
              <ha-icon icon="mdi:menu"></ha-icon>
            </button>
          `:""}
          <h1>Ultra Card</h1>
          ${this._renderAccountChip()}
        </header>

        <nav class="tab-strip" role="tablist" aria-label="Hub navigation">
          ${t.map((t=>a.qy`
              <button
                role="tab"
                aria-selected=${this._activeTab===t.key?"true":"false"}
                class=${this._activeTab===t.key?"active":""}
                @click=${()=>this._activeTab=t.key}
              >
                <ha-icon icon=${t.icon}></ha-icon>
                ${t.label}
              </button>
            `))}
        </nav>

        <div class="hub-content">
          ${this._renderTabContent()}
        </div>
      </div>
    `}};_.styles=[c.z,a.AH`
      /* Tab strip */
      .tab-strip {
        display: flex;
        gap: 0;
        border-bottom: 2px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        padding: 0 24px;
        background: var(--ha-card-background, var(--card-background-color));
        /* Horizontal scroll if tabs overflow on narrow screens */
        overflow-x: auto;
        overflow-y: hidden;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        /* Hide scrollbar visually but keep it functional */
        scrollbar-width: none;
        -ms-overflow-style: none;
        /* Never shrink — this is the sticky nav bar */
        flex-shrink: 0;
        /* Ensure it stays on-screen and doesn't participate in vertical scroll */
        position: relative;
        z-index: 1;
      }

      .tab-strip::-webkit-scrollbar {
        display: none;
      }

      .tab-strip button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 14px 20px;
        border: none;
        background: none;
        color: var(--secondary-text-color);
        font: inherit;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        transition: all 0.2s ease;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .tab-strip button ha-icon {
        --mdc-icon-size: 20px;
      }

      .tab-strip button:hover {
        color: var(--primary-text-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.04);
      }

      .tab-strip button.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      .tab-strip button.active ha-icon {
        color: var(--primary-color);
      }

      /* Mobile burger menu button */
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
        transition: background 0.15s ease;
        margin-left: -8px;
      }

      .mobile-menu-btn:hover {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
      }

      .mobile-menu-btn ha-icon {
        --mdc-icon-size: 24px;
      }

      /* Narrow header layout: burger | title | account chip */
      .hub-header--narrow {
        padding: 8px 16px 8px 8px;
        gap: 8px;
      }

      .hub-header--narrow h1 {
        font-size: 20px;
        flex: 1;
      }

      @media (max-width: 870px) {
        .tab-strip {
          padding: 0 4px;
        }
        .tab-strip button {
          padding: 12px 14px;
          font-size: 13px;
          gap: 5px;
        }
        .tab-strip button ha-icon {
          --mdc-icon-size: 18px;
        }
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
        to { transform: rotate(360deg); }
      }
    `],h([(0,l.MZ)({attribute:!1})],_.prototype,"hass",void 0),h([(0,l.wk)()],_.prototype,"_activeTab",void 0),h([(0,l.wk)()],_.prototype,"_proAuth",void 0),h([(0,l.wk)()],_.prototype,"_showProTab",void 0),h([(0,l.wk)()],_.prototype,"_cloudUser",void 0),h([(0,l.wk)()],_.prototype,"_narrow",void 0),h([(0,l.wk)()],_.prototype,"_loadedTabs",void 0),_=h([(0,l.EM)("ultra-card-panel")],_)})();