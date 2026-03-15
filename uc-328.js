"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[328],{1328:(t,a,o)=>{o.r(a),o.d(a,{HubProTab:()=>u});var e=o(5183),s=o(4276),i=o(9978),n=o(378),r=o(8980);const c=new class{constructor(){this.hass=null,this.apiBase=""}initialize(t,a){this.hass=t,this.apiBase=`${a}/wp-json/ultra-card/v1`,r.ucDashboardScannerService.initialize(t)}async createSnapshot(){var t;if(!n.x.isAuthenticated())throw new Error("Must be logged in to create snapshots");const a=n.x.getCurrentUser();if(!a||"pro"!==(null===(t=a.subscription)||void 0===t?void 0:t.tier))throw new Error("Pro subscription required to create manual snapshots");try{const t=await r.ucDashboardScannerService.scanAllDashboards();if(0===t.card_count)throw new Error("No Ultra Cards found in dashboard");return console.log(`📦 Captured ${t.card_count} Ultra Cards from ${t.views.length} views`),{id:(await this.apiCall("/snapshots",{method:"POST",body:JSON.stringify({type:"manual",snapshot_data:t})})).snapshot_id,type:"manual",date:(new Date).toISOString().split("T")[0],created:(new Date).toISOString(),snapshot_data:t}}catch(t){throw console.error("❌ Failed to create snapshot:",t),t}}async createAutoSnapshot(){var t;const a=n.x.getCurrentUser();if(a&&"pro"===(null===(t=a.subscription)||void 0===t?void 0:t.tier))try{console.log("🤖 Creating automatic daily snapshot...");const t=await r.ucDashboardScannerService.scanAllDashboards();if(0===t.card_count)return void console.log("⚠️ No Ultra Cards found, skipping auto snapshot");await this.apiCall("/snapshots",{method:"POST",body:JSON.stringify({type:"auto",snapshot_data:t})})}catch(t){console.error("❌ Auto snapshot failed:",t)}else console.log("⏭️ Skipping auto snapshot - not authenticated or not a Pro user")}async listSnapshots(t=30){if(!n.x.isAuthenticated())throw new Error("Must be logged in to view snapshots");try{const a=Date.now();return console.log(`📋 Fetching snapshot list with cache-busting timestamp: ${a}`),await this.apiCall(`/snapshots?limit=${t}&_=${a}`,{method:"GET"})}catch(t){throw console.error("❌ Failed to list snapshots:",t),t}}async getSnapshot(t){if(!n.x.isAuthenticated())throw new Error("Must be logged in to view snapshots");try{return await this.apiCall(`/snapshots/${t}`,{method:"GET"})}catch(a){throw console.error(`Failed to get snapshot ${t}:`,a),a}}async restoreSnapshot(t){if(!n.x.isAuthenticated())throw new Error("Must be logged in to restore snapshots");console.log(`🔄 Restoring snapshot ${t}...`);try{const a=(await this.apiCall(`/snapshots/${t}/restore`,{method:"POST"})).snapshot_data,o={};return a.cards.forEach((t=>{o[t.view_title]||(o[t.view_title]=[]),o[t.view_title].push(t)})),Object.keys(o).forEach((t=>{o[t].sort(((t,a)=>t.card_index-a.card_index))})),console.log(`✅ Snapshot restored: ${a.card_count} cards across ${Object.keys(o).length} views`),{snapshot_data:a,instructions:this.generateRestoreInstructions(a,o),cards_by_view:o}}catch(a){throw console.error(`Failed to restore snapshot ${t}:`,a),a}}async deleteSnapshot(t){if(!n.x.isAuthenticated())throw new Error("Must be logged in to delete snapshots");try{await this.apiCall(`/snapshots/${t}`,{method:"DELETE"}),console.log(`🗑️ Snapshot ${t} deleted`)}catch(a){throw console.error(`Failed to delete snapshot ${t}:`,a),a}}async getSettings(){if(!n.x.isAuthenticated())throw new Error("Must be logged in to view settings");try{return await this.apiCall("/snapshot-settings",{method:"GET"})}catch(t){throw console.error("Failed to get snapshot settings:",t),t}}async updateSettings(t){if(!n.x.isAuthenticated())throw new Error("Must be logged in to update settings");try{await this.apiCall("/snapshot-settings",{method:"PUT",body:JSON.stringify(t)})}catch(t){throw console.error("Failed to update snapshot settings:",t),t}}canCreateSnapshots(){var t;const a=n.x.getCurrentUser();return"pro"===(null===(t=null==a?void 0:a.subscription)||void 0===t?void 0:t.tier)}async getDashboardPreview(){try{if(!await r.ucDashboardScannerService.canScan())return{can_scan:!1,ultra_card_count:0,view_count:0,estimated_size_kb:0};const t=await r.ucDashboardScannerService.getDashboardStats(),a=15*t.ultra_cards;return{can_scan:!0,ultra_card_count:t.ultra_cards,view_count:t.total_views,estimated_size_kb:a}}catch(t){return console.error("Failed to get dashboard preview:",t),{can_scan:!1,ultra_card_count:0,view_count:0,estimated_size_kb:0}}}generateRestoreInstructions(t,a){const o=Object.keys(a).length,e=t.card_count;let s=`This snapshot contains ${e} Ultra Card${e>1?"s":""} across ${o} view${o>1?"s":""}.\n\n`;return s+="**Restoration Instructions:**\n\n",Object.keys(a).forEach(((t,o)=>{const e=a[t];s+=`**${o+1}. ${t}** (${e.length} card${e.length>1?"s":""})\n`,e.forEach(((t,a)=>{s+=`   - Position ${t.card_index+1}: ${t.card_name||"Ultra Card"}\n`})),s+="\n"})),s+="\n**To restore:**\n",s+="1. Open each view in your Home Assistant dashboard\n",s+='2. Click "Edit Dashboard" (top right)\n',s+="3. Add or replace Ultra Cards in the positions shown above\n",s+="4. Paste the config for each card (available in detailed view)\n",s+="5. Save your changes\n",s}async apiCall(t,a={}){if(!n.x.isAuthenticated())throw new Error("Not authenticated");const o=`${this.apiBase}${t}`,e=await n.x.authenticatedFetch(o,Object.assign(Object.assign({},a),{headers:Object.assign({"Content-Type":"application/json"},a.headers||{})}));if(!e.ok){const t=await e.json().catch((()=>({message:"Unknown error"})));throw new Error(t.message||`API call failed: ${e.status}`)}return e.json()}},d="ultra_card_last_auto_snapshot",l=new class{constructor(){this._checkInterval=null,this._isRunning=!1,this._listeners=new Set,this._loadLastSnapshotTime()}start(){this._checkInterval||(this._checkAndTriggerSnapshot(),this._checkInterval=window.setInterval((()=>{this._checkAndTriggerSnapshot()}),6e4),this._notifyListeners())}stop(){this._checkInterval&&(clearInterval(this._checkInterval),this._checkInterval=null,this._notifyListeners())}async _checkAndTriggerSnapshot(){var t;if(this._isRunning)return;const a=n.x.getCurrentUser();if(a&&"pro"===(null===(t=a.subscription)||void 0===t?void 0:t.tier))try{const t=await c.getSettings();if(!t.enabled)return;if(this._shouldRunSnapshot(t.time,t.timezone)){this._isRunning=!0,this._notifyListeners();try{await c.createAutoSnapshot(),this._saveLastSnapshotTime()}catch(t){console.error("❌ Auto-snapshot failed:",t)}finally{this._isRunning=!1,this._notifyListeners()}}}catch(t){console.error("❌ Error checking snapshot schedule:",t)}}_shouldRunSnapshot(t,a){const o=this._getLastSnapshotTime(),e=new Date,[s,i]=t.split(":").map(Number),n=new Date(e);if(n.setHours(s,i,0,0),!o)return e>=n;const r=new Date(o);return!(r.getFullYear()===e.getFullYear()&&r.getMonth()===e.getMonth()&&r.getDate()===e.getDate())&&e>=n}_getLastSnapshotTime(){try{return localStorage.getItem(d)}catch(t){return console.error("Failed to read last snapshot time:",t),null}}_saveLastSnapshotTime(){try{const t=(new Date).toISOString();localStorage.setItem(d,t)}catch(t){console.error("Failed to save last snapshot time:",t)}}updateLastSnapshotTime(){this._saveLastSnapshotTime(),this._notifyListeners()}_loadLastSnapshotTime(){this._getLastSnapshotTime()}async triggerManualSnapshot(){try{await c.createSnapshot(),this._saveLastSnapshotTime(),this._notifyListeners()}catch(t){throw console.error("❌ Manual snapshot failed:",t),t}}async getStatus(){const t=this._getLastSnapshotTime();let a=null;try{const o=await c.getSettings();o.enabled&&(a=this._calculateNextSnapshotTime(o.time,o.timezone,t))}catch(t){console.error("Failed to get snapshot settings:",t)}return{enabled:!!this._checkInterval,nextSnapshotTime:a,lastSnapshotTime:t?new Date(t):null,isRunning:this._isRunning}}_calculateNextSnapshotTime(t,a,o){const[e,s]=t.split(":").map(Number),i=new Date,n=new Date(i);if(n.setHours(e,s,0,0),n<=i&&n.setDate(n.getDate()+1),o){const t=new Date(o);t.getFullYear()===i.getFullYear()&&t.getMonth()===i.getMonth()&&t.getDate()===i.getDate()&&n.getDate()===i.getDate()&&n.setDate(n.getDate()+1)}return n}subscribe(t){return this._listeners.add(t),this.getStatus().then((a=>t(a))),()=>{this._listeners.delete(t)}}_notifyListeners(){this.getStatus().then((t=>{this._listeners.forEach((a=>a(t)))}))}};var p=function(t,a,o,e){var s,i=arguments.length,n=i<3?a:null===e?e=Object.getOwnPropertyDescriptor(a,o):e;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,a,o,e);else for(var r=t.length-1;r>=0;r--)(s=t[r])&&(n=(i<3?s(n):i>3?s(a,o,n):s(a,o))||n);return i>3&&n&&Object.defineProperty(a,o,n),n};const h="https://ultracard.io/product/ultra-card-pro/";let u=class extends e.WF{constructor(){super(...arguments),this.auth=null,this.cloudUser=null,this._toastMsg="",this._cloudUser=null,this._snapshotSettingsOpen=!1,this._ssEnabled=!1,this._ssTime="03:00",this._ssTimezone="UTC",this._ssLoading=!1,this._snapshotsListOpen=!1,this._snapshotsList=[],this._snapshotsLoading=!1,this._creatingSnapshot=!1,this._snapshotsSummaryLoaded=!1}updated(t){var a,o,e,s;if(t.has("hass")&&this.hass){const t=n.x.checkIntegrationAuth(this.hass);this._cloudUser=t,t&&n.x.setIntegrationUser(t)}((null===(a=this.auth)||void 0===a?void 0:a.authenticated)&&"pro"===(null===(o=this.auth)||void 0===o?void 0:o.subscription_tier)||"pro"===(null===(s=null===(e=this.cloudUser)||void 0===e?void 0:e.subscription)||void 0===s?void 0:s.tier))&&this.hass&&!this._snapshotsSummaryLoaded&&!this._snapshotsLoading&&this._loadSnapshotsList()}_showToast(t){this._toastMsg=t,this._toastTimer&&clearTimeout(this._toastTimer),this._toastTimer=setTimeout((()=>this._toastMsg=""),2500)}_formatExpiry(t){if(null==t)return"—";try{return new Date(1e3*t).toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"})}catch(t){return"—"}}render(){var t,a,o,s,i,n,r,c,d,l,p;const h=this.auth,u=null!=h,g=!!(null==h?void 0:h.authenticated)||!!this.cloudUser,b=!!(null==h?void 0:h.authenticated)&&"pro"===(null==h?void 0:h.subscription_tier)||!(null==h?void 0:h.authenticated)&&"pro"===(null===(a=null===(t=this.cloudUser)||void 0===t?void 0:t.subscription)||void 0===a?void 0:a.tier),m="active"===(null==h?void 0:h.subscription_status)||"active"===(null===(s=null===(o=this.cloudUser)||void 0===o?void 0:o.subscription)||void 0===s?void 0:s.status),v=null!=h?h:{authenticated:!0,username:null===(i=this.cloudUser)||void 0===i?void 0:i.username,email:null===(n=this.cloudUser)||void 0===n?void 0:n.email,display_name:null===(r=this.cloudUser)||void 0===r?void 0:r.displayName,subscription_tier:(null===(d=null===(c=this.cloudUser)||void 0===c?void 0:c.subscription)||void 0===d?void 0:d.tier)||"free",subscription_status:null===(p=null===(l=this.cloudUser)||void 0===l?void 0:l.subscription)||void 0===p?void 0:p.status};return e.qy`
      <!-- Integration Status -->
      ${this._renderIntegrationStatus(u,g,b)}

      <!-- Banner -->
      ${this._renderBanner(b,g)}

      <!-- Authenticated: show account + tools -->
      ${g?e.qy`
            ${this._renderAccount(v,b,m)}
            ${b?e.qy`
                  ${this._renderDashboardTools()}
                  ${this._renderProSettings()}
                  ${this._renderProSupport()}
                `:this._renderUpgradePrompt()}
            ${this._renderFeaturesGrid()}
          `:this._renderSignInPrompt()}

      <div class="toast ${this._toastMsg?"show":""}">${this._toastMsg}</div>
    `}_renderIntegrationStatus(t,a,o){if(a){const t=this.auth;return e.qy`
        <div class="integration-status authenticated">
          <div class="status-icon-wrap success">
            <ha-icon icon="mdi:check-circle"></ha-icon>
          </div>
          <div class="status-body">
            <h4>Connected via Ultra Card Connect</h4>
            <p>
              <strong>${t.display_name||t.username}${t.email?` · ${t.email}`:""}</strong>
            </p>
            <p>Subscription: <strong>${o?"PRO":"Free"}</strong> ${o?"⭐":""}</p>
            <p class="status-note">
              Manage in <a href="/config/integrations/integration/ultra_card_pro_cloud" target="_top">Settings → Integrations</a>
            </p>
          </div>
        </div>
      `}return e.s6}_renderBanner(t,a){return a?e.qy`
      <div class="pro-banner ${t?"pro":"free"}">
        <div class="banner-icon-wrap"><ha-icon icon="mdi:star-circle"></ha-icon></div>
        <div class="banner-content">
          <h3>
            ${t?e.qy`<ha-icon icon="mdi:star"></ha-icon>`:""}
            Ultra Card Pro
          </h3>
          <p>${t?"Thank you for being a Pro member!":"Upgrade to unlock all features"}</p>
        </div>
        <div class="banner-side">
          <div class="banner-badge">
            ${t?e.qy`<ha-icon icon="mdi:check-decagram"></ha-icon>`:""}
            ${t?"PRO":"FREE"}
          </div>
          ${t?e.s6:e.qy`
                <a
                  class="banner-upgrade-btn"
                  href=${h}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ha-icon icon="mdi:star"></ha-icon>
                  Upgrade to Pro
                </a>
              `}
        </div>
      </div>
    `:e.qy`
        <div class="pro-banner disconnected">
          <div class="banner-icon-wrap"><ha-icon icon="mdi:star-circle"></ha-icon></div>
          <div class="banner-content">
            <h3>Ultra Card Pro</h3>
            <p>Professional card management and cloud backups</p>
          </div>
        </div>
      `}_renderSignInPrompt(){return e.qy`
      <div class="install-card sign-in-prompt">
        <div class="cta-icon">
          <ha-icon icon="mdi:account-arrow-right-outline"></ha-icon>
        </div>
        <h3>Sign in to access Pro features</h3>
        <p>
          Use the <strong>Account</strong> tab to sign in or create an account. Once connected,
          you can upgrade to Pro and use dashboard snapshots, cloud backups, and all Pro modules.
        </p>
      </div>
    `}_renderAccount(t,a,o){return e.qy`
      <div class="account-card">
        <div class="section-header">
          <div class="header-icon"><ha-icon icon="mdi:account-circle"></ha-icon></div>
          <div class="header-content">
            <h3>Account</h3>
            <p>Your Ultra Card Connect account details</p>
          </div>
        </div>
        <div class="account-row">
          <span class="account-label">Display Name</span>
          <span class="account-value">${t.display_name||t.username||"—"}</span>
        </div>
        ${t.email?e.qy`
              <div class="account-row">
                <span class="account-label">Email</span>
                <span class="account-value">${t.email}</span>
              </div>
            `:""}
        <div class="account-row">
          <span class="account-label">Subscription</span>
          <span class="tier-badge ${a?"pro":"free"}">
            ${a?e.qy`<ha-icon icon="mdi:star" style="--mdc-icon-size:14px"></ha-icon>`:""}
            ${t.subscription_tier||"free"}
          </span>
        </div>
        <div class="account-row">
          <span class="account-label">Status</span>
          <span class="account-value">
            <span class="status-dot ${o?"active":"inactive"}"></span>
            ${t.subscription_status||"—"}
          </span>
        </div>
        ${null!=t.subscription_expires?e.qy`
              <div class="account-row">
                <span class="account-label">Renews</span>
                <span class="account-value">${this._formatExpiry(t.subscription_expires)}</span>
              </div>
            `:""}
      </div>
    `}_renderDashboardTools(){return e.qy`
      <div class="tools-section">
        <div class="section-header">
          <div class="header-icon" style="background:linear-gradient(135deg,#e91e63,#f06292);">
            <ha-icon icon="mdi:view-dashboard"></ha-icon>
          </div>
          <div class="header-content">
            <h3>Dashboard Pro Tools</h3>
            <p>Manage entire dashboard snapshots</p>
          </div>
        </div>
        <div class="tools-grid">
          <button class="tool-card" @click=${this._handleExportDashboard}>
            <div class="tool-icon export"><ha-icon icon="mdi:export"></ha-icon></div>
            <div class="tool-content"><h4>Export Dashboard</h4><p>Download entire dashboard</p></div>
          </button>
          <button class="tool-card" @click=${this._handleImportDashboard}>
            <div class="tool-icon import"><ha-icon icon="mdi:import"></ha-icon></div>
            <div class="tool-content"><h4>Import Dashboard</h4><p>Load dashboard from file</p></div>
          </button>
          <button class="tool-card" ?disabled=${this._creatingSnapshot} @click=${this._handleCreateSnapshot}>
            <div class="tool-icon snapshot"><ha-icon icon="mdi:camera-plus"></ha-icon></div>
            <div class="tool-content"><h4>${this._creatingSnapshot?"Creating…":"Create Snapshot"}</h4><p>Manual dashboard snapshot</p></div>
          </button>
          <button class="tool-card" @click=${this._handleViewSnapshots}>
            <div class="tool-icon history"><ha-icon icon="mdi:history"></ha-icon></div>
            <div class="tool-content"><h4>View Snapshots</h4><p>${this._snapshotsListOpen?"Hide snapshot list":"Browse all snapshots"}</p></div>
          </button>
          <button class="tool-card" @click=${this._handleSnapshotSettings}>
            <div class="tool-icon settings"><ha-icon icon="mdi:cog"></ha-icon></div>
            <div class="tool-content"><h4>Snapshot Settings</h4><p>${this._snapshotSettingsOpen?"Close settings":"Configure auto-snapshots"}</p></div>
          </button>
        </div>

        ${this._renderSnapshotSummary()}

        ${this._snapshotsListOpen?this._renderSnapshotsList():""}
        ${this._snapshotSettingsOpen?this._renderSnapshotSettingsPanel():""}
      </div>
    `}_renderSnapshotSummary(){const t=this._snapshotsList,a=t.filter((t=>"manual"===t.type)).length,o=t.filter((t=>"auto"===t.type)).length,s=t.length>0?t.slice().sort(((t,a)=>(a.created_timestamp||0)-(t.created_timestamp||0)))[0]:null,i=s?this._formatSnapshotDate(s.created||s.date||""):null;return e.qy`
      <div class="snapshot-summary">
        <div class="snapshot-summary-row">
          <span class="snapshot-summary-label">
            <ha-icon icon="mdi:camera"></ha-icon>
            Manual
          </span>
          <span class="snapshot-summary-value">${a}</span>
        </div>
        <div class="snapshot-summary-row">
          <span class="snapshot-summary-label">
            <ha-icon icon="mdi:clock-outline"></ha-icon>
            Auto
          </span>
          <span class="snapshot-summary-value">${o}</span>
        </div>
        <div class="snapshot-summary-row snapshot-summary-latest">
          <span class="snapshot-summary-label">
            <ha-icon icon="mdi:clock-check-outline"></ha-icon>
            Latest
          </span>
          <span class="snapshot-summary-value">${null!=i?i:"No snapshots yet"}</span>
        </div>
      </div>
    `}_renderSnapshotsList(){return this._snapshotsLoading?e.qy`<div class="ss-panel" style="text-align:center;padding:24px;"><ha-icon icon="mdi:loading" class="spinning" style="--mdc-icon-size:24px;color:var(--primary-color);"></ha-icon><br/>Loading snapshots…</div>`:0===this._snapshotsList.length?e.qy`<div class="ss-panel" style="text-align:center;"><ha-icon icon="mdi:camera-off" style="--mdc-icon-size:32px;color:var(--secondary-text-color);opacity:0.5;"></ha-icon><p style="margin:8px 0 0;color:var(--secondary-text-color);font-size:13px;">No snapshots yet. Create your first one above.</p></div>`:e.qy`
      <div class="snapshots-list">
        ${this._snapshotsList.map((t=>e.qy`
          <div class="snapshot-item">
            <div class="snapshot-icon ${"auto"===t.type?"auto":"manual"}">
              <ha-icon icon=${"auto"===t.type?"mdi:clock-outline":"mdi:camera"}></ha-icon>
            </div>
            <div class="snapshot-info">
              <h5>${"auto"===t.type?"Auto Snapshot":"Manual Snapshot"}</h5>
              <p>${this._formatSnapshotDate(t.created||t.date||"")}</p>
            </div>
            <div class="snapshot-meta">
              <span class="card-count">${t.card_count||"?"} cards</span>
            </div>
          </div>
        `))}
      </div>
    `}_renderSnapshotSettingsPanel(){return this._ssLoading?e.qy`<div class="ss-panel" style="text-align:center;padding:24px;"><ha-icon icon="mdi:loading" class="spinning" style="--mdc-icon-size:24px;color:var(--primary-color);"></ha-icon><br/>Loading settings…</div>`:e.qy`
      <div class="ss-panel">
        <h4><ha-icon icon="mdi:clock-check-outline"></ha-icon> Auto-Snapshot Schedule</h4>

        <div class="ss-row">
          <span class="ss-label">Enabled</span>
          <ha-switch
            .checked=${this._ssEnabled}
            @change=${t=>this._ssEnabled=t.target.checked}
          ></ha-switch>
        </div>

        <div class="ss-row">
          <span class="ss-label">Time</span>
          <input
            type="time"
            class="ss-input"
            .value=${this._ssTime}
            @input=${t=>this._ssTime=t.target.value}
          />
        </div>

        <div class="ss-row">
          <span class="ss-label">Timezone</span>
          <select
            class="ss-input"
            .value=${this._ssTimezone}
            @change=${t=>this._ssTimezone=t.target.value}
          >
            ${["UTC","America/New_York","America/Chicago","America/Denver","America/Los_Angeles","America/Phoenix","America/Anchorage","Pacific/Honolulu","Europe/London","Europe/Paris","Europe/Berlin","Europe/Rome","Asia/Tokyo","Asia/Shanghai","Asia/Kolkata","Australia/Sydney"].map((t=>e.qy`<option value=${t} ?selected=${this._ssTimezone===t}>${t.replace(/_/g," ")}</option>`))}
          </select>
        </div>

        <div class="ss-actions">
          <button class="ss-save-btn" ?disabled=${this._ssLoading} @click=${this._saveSnapshotSettings}>
            <ha-icon icon="mdi:content-save" style="--mdc-icon-size:16px;"></ha-icon>
            Save Settings
          </button>
          <button class="ss-cancel-btn" @click=${()=>this._snapshotSettingsOpen=!1}>
            Cancel
          </button>
        </div>
      </div>
    `}_renderProSettings(){return e.qy`
      <div class="tools-section" style="border:2px solid var(--primary-color);">
        <div class="section-header">
          <div class="header-icon"><ha-icon icon="mdi:cog"></ha-icon></div>
          <div class="header-content">
            <h3>Pro Settings</h3>
            <p>Exclusive settings for Ultra Card Pro subscribers</p>
          </div>
        </div>
        <div class="pro-setting-item">
          <div class="setting-icon-wrap">
            <ha-icon icon="mdi:card-remove-outline"></ha-icon>
          </div>
          <div class="setting-body">
            <h4>Start with Empty Card</h4>
            <p>When adding a new Ultra Card, start with an empty layout instead of the default text and image modules</p>
          </div>
          <div class="setting-toggle">
            <ha-switch
              .checked=${this._getSkipDefaultModules()}
              @change=${this._handleSkipDefaultModulesChange}
            ></ha-switch>
          </div>
        </div>
      </div>
    `}_renderProSupport(){return e.qy`
      <div class="tools-section">
        <div class="section-header">
          <div class="header-icon" style="background:#5865F2;">
            <ha-icon icon="mdi:forum"></ha-icon>
          </div>
          <div class="header-content">
            <h3>Pro Support</h3>
            <p>Priority support for Pro subscribers</p>
          </div>
        </div>
        <div class="discord-card">
          <div class="discord-icon">
            <ha-icon icon="mdi:forum"></ha-icon>
          </div>
          <div class="discord-body">
            <h4>Chat with Us on Discord</h4>
            <p>Get direct priority support, share feedback, and connect with the Ultra Card community.</p>
          </div>
          <a
            class="discord-btn"
            href="https://discord.com/users/915385171396689921"
            target="_blank"
            rel="noopener"
          >
            <ha-icon icon="mdi:chat"></ha-icon>
            Message Me
          </a>
        </div>
      </div>
    `}_renderUpgradePrompt(){return e.qy`
      <div class="upgrade-card">
        <div class="upgrade-icon">
          <ha-icon icon="mdi:star-shooting"></ha-icon>
        </div>
        <h3>Unlock Pro Features</h3>
        <p>Get export, import, manual backups, dashboard snapshots, and more for all your cards.</p>
        <ul class="features-checklist">
          <li><ha-icon icon="mdi:check"></ha-icon> Export & import full card configs</li>
          <li><ha-icon icon="mdi:check"></ha-icon> 30 manual backups across all cards</li>
          <li><ha-icon icon="mdi:check"></ha-icon> Dashboard snapshots & auto-snapshots</li>
          <li><ha-icon icon="mdi:check"></ha-icon> Name your cards and backups</li>
          <li><ha-icon icon="mdi:check"></ha-icon> Priority support</li>
        </ul>
        <a
          class="upgrade-btn"
          href=${h}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ha-icon icon="mdi:star"></ha-icon>
          Upgrade to Pro
        </a>
      </div>
    `}_renderFeaturesGrid(){return e.qy`
      <div class="tools-section">
        <div class="section-header">
          <div class="header-icon" style="background:linear-gradient(135deg,#f093fb,#f5576c);">
            <ha-icon icon="mdi:flash"></ha-icon>
          </div>
          <div class="header-content">
            <h3>Pro Features</h3>
            <p>Available when editing your cards</p>
          </div>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon sync"><ha-icon icon="mdi:sync"></ha-icon></div>
            <div class="feature-info"><h4>Cloud Sync</h4><p>Sync card configs across all your devices automatically</p></div>
          </div>
          <div class="feature-card">
            <div class="feature-icon backup"><ha-icon icon="mdi:cloud-upload"></ha-icon></div>
            <div class="feature-info"><h4>Cloud Backups</h4><p>Manual and automatic backups with version history</p></div>
          </div>
          <div class="feature-card">
            <div class="feature-icon presets"><ha-icon icon="mdi:palette"></ha-icon></div>
            <div class="feature-info"><h4>Pro Modules</h4><p>Access exclusive premium modules and templates</p></div>
          </div>
          <div class="feature-card">
            <div class="feature-icon support"><ha-icon icon="mdi:face-agent"></ha-icon></div>
            <div class="feature-info"><h4>Priority Support</h4><p>Get help faster with priority support access</p></div>
          </div>
        </div>
      </div>
    `}_getSkipDefaultModules(){try{return"true"===localStorage.getItem("ultra-card-skip-default-modules")}catch(t){return!1}}_handleSkipDefaultModulesChange(t){const a=t.target.checked;try{localStorage.setItem("ultra-card-skip-default-modules",String(a)),this._showToast(a?"New cards will start empty":"New cards will use default modules")}catch(t){}}_handleExportDashboard(){var t,a,o,e,s;try{const i=null===(o=null===(a=null===(t=this.hass)||void 0===t?void 0:t.panels)||void 0===a?void 0:a.lovelace)||void 0===o?void 0:o.config,n={views:(null==i?void 0:i.views)||[],dashboard_path:(null==i?void 0:i.dashboard_path)||"default",exported_at:(new Date).toISOString(),exported_by:(null===(e=this.auth)||void 0===e?void 0:e.display_name)||(null===(s=this.auth)||void 0===s?void 0:s.username)||"Unknown"},r=new Blob([JSON.stringify(n,null,2)],{type:"application/json"}),c=URL.createObjectURL(r),d=document.createElement("a");d.href=c,d.download=`dashboard-export-${Date.now()}.json`,document.body.appendChild(d),d.click(),document.body.removeChild(d),URL.revokeObjectURL(c),this._showToast("Dashboard exported")}catch(t){console.error("Dashboard export failed:",t),this._showToast("Failed to export dashboard")}}_handleImportDashboard(){const t=document.createElement("input");t.type="file",t.accept=".json",t.onchange=async t=>{var a;try{const o=null===(a=t.target.files)||void 0===a?void 0:a[0];if(!o)return;const e=await o.text(),s=JSON.parse(e);if(!s.views||!Array.isArray(s.views))return void this._showToast("Invalid dashboard file");this._showToast(`Read ${s.views.length} views — use HA raw editor to apply`)}catch(t){console.error("Dashboard import failed:",t),this._showToast("Failed to read dashboard file")}},t.click()}_ensureSnapshotInit(){c.initialize(this.hass,"https://ultracard.io")}async _handleCreateSnapshot(){var t;this._creatingSnapshot=!0;try{this._ensureSnapshotInit();const a=await c.createSnapshot(),o=(null===(t=null==a?void 0:a.snapshot_data)||void 0===t?void 0:t.card_count)||0;this._showToast(`Snapshot created (${o} card${1!==o?"s":""})`),await this._loadSnapshotsList()}catch(t){console.error("Snapshot failed:",t),this._showToast((null==t?void 0:t.message)||"Failed to create snapshot")}finally{this._creatingSnapshot=!1}}async _handleViewSnapshots(){this._snapshotsListOpen?this._snapshotsListOpen=!1:(this._snapshotsListOpen=!0,await this._loadSnapshotsList())}async _loadSnapshotsList(){this._snapshotsLoading=!0;try{this._ensureSnapshotInit(),this._snapshotsList=await c.listSnapshots(20)}catch(t){console.error("List snapshots failed:",t),this._showToast((null==t?void 0:t.message)||"Failed to load snapshots"),this._snapshotsList=[]}finally{this._snapshotsLoading=!1,this._snapshotsSummaryLoaded=!0}}async _handleSnapshotSettings(){if(this._snapshotSettingsOpen)this._snapshotSettingsOpen=!1;else{this._ssLoading=!0,this._snapshotSettingsOpen=!0;try{this._ensureSnapshotInit();const t=await c.getSettings();this._ssEnabled=t.enabled,this._ssTime=t.time||"03:00",this._ssTimezone=t.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone||"UTC"}catch(t){console.error("Failed to load settings:",t),this._showToast((null==t?void 0:t.message)||"Failed to load snapshot settings")}finally{this._ssLoading=!1}}}async _saveSnapshotSettings(){this._ssLoading=!0;try{this._ensureSnapshotInit(),await c.updateSettings({enabled:this._ssEnabled,time:this._ssTime,timezone:this._ssTimezone}),this._ssEnabled?l.start():l.stop(),this._showToast("Snapshot settings saved"),this._snapshotSettingsOpen=!1}catch(t){console.error("Failed to save settings:",t),this._showToast((null==t?void 0:t.message)||"Failed to save settings")}finally{this._ssLoading=!1}}_formatSnapshotDate(t){try{return new Date(t).toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"})}catch(a){return t}}};u.styles=[i.z,e.AH`
      :host {
        display: block;
        animation: fadeSlideIn 0.3s ease-out;
        padding-bottom: 60px;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .spinning {
        animation: spin 1s linear infinite;
      }

      /* Integration status card */
      .integration-status {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 20px;
        border-radius: 14px;
        margin-bottom: 24px;
      }

      .integration-status.authenticated {
        background: linear-gradient(135deg, rgba(76, 175, 80, 0.08), rgba(76, 175, 80, 0.02));
        border: 1px solid rgba(76, 175, 80, 0.2);
      }

      .integration-status.not-configured {
        background: linear-gradient(135deg, rgba(255, 152, 0, 0.08), rgba(255, 152, 0, 0.02));
        border: 1px solid rgba(255, 152, 0, 0.2);
      }

      .integration-status.not-installed {
        background: linear-gradient(135deg, rgba(var(--rgb-primary-color, 3, 169, 244), 0.06), transparent);
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
      }

      .status-icon-wrap {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .status-icon-wrap.success {
        background: rgba(76, 175, 80, 0.15);
      }

      .status-icon-wrap.success ha-icon {
        color: #4caf50;
        --mdc-icon-size: 24px;
      }

      .status-icon-wrap.warning {
        background: rgba(255, 152, 0, 0.15);
      }

      .status-icon-wrap.warning ha-icon {
        color: #ff9800;
        --mdc-icon-size: 24px;
      }

      .status-icon-wrap.info {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);
      }

      .status-icon-wrap.info ha-icon {
        color: var(--primary-color);
        --mdc-icon-size: 24px;
      }

      .status-body {
        flex: 1;
        min-width: 0;
      }

      .status-body h4 {
        margin: 0 0 4px 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .status-body p {
        margin: 0 0 4px 0;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }

      .status-body a {
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 500;
      }

      .status-body a:hover {
        text-decoration: underline;
      }

      .status-note {
        font-size: 12px;
        opacity: 0.7;
        margin-top: 6px;
      }

      /* Pro Banner */
      .pro-banner {
        position: relative;
        padding: 28px;
        border-radius: 16px;
        margin-bottom: 24px;
        overflow: hidden;
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .pro-banner::before {
        content: '';
        position: absolute;
        inset: 0;
        opacity: 0.12;
        background: radial-gradient(circle at 80% 20%, white 0%, transparent 60%);
      }

      .pro-banner.pro {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        box-shadow: 0 8px 24px rgba(245, 87, 108, 0.3);
      }

      .pro-banner.free {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
      }

      .pro-banner.disconnected {
        background: linear-gradient(135deg, #546e7a 0%, #37474f 100%);
        color: white;
        box-shadow: 0 8px 24px rgba(84, 110, 122, 0.25);
      }

      .banner-icon-wrap {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .banner-icon-wrap ha-icon {
        --mdc-icon-size: 30px;
        color: white;
      }

      .banner-content {
        flex: 1;
        position: relative;
        z-index: 1;
      }

      .banner-content h3 {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .banner-content h3 ha-icon {
        --mdc-icon-size: 22px;
      }

      .banner-content p {
        margin: 4px 0 0;
        font-size: 14px;
        opacity: 0.9;
      }

      .banner-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 18px;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        font-weight: 700;
        font-size: 14px;
        letter-spacing: 0.5px;
        position: relative;
        z-index: 1;
      }

      .banner-badge ha-icon {
        --mdc-icon-size: 16px;
      }

      .banner-side {
        display: flex;
        align-items: center;
        gap: 12px;
        position: relative;
        z-index: 1;
      }

      .banner-upgrade-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 42px;
        padding: 0 18px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.96);
        color: #5b46b1;
        font-size: 14px;
        font-weight: 700;
        text-decoration: none;
        white-space: nowrap;
        box-shadow: 0 10px 24px rgba(24, 35, 52, 0.18);
      }

      .banner-upgrade-btn:hover {
        background: white;
        transform: translateY(-1px);
      }

      .banner-upgrade-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      @media (max-width: 720px) {
        .pro-banner {
          flex-direction: column;
          align-items: stretch;
        }

        .banner-side {
          flex-direction: column;
          align-items: stretch;
        }

        .banner-badge,
        .banner-upgrade-btn {
          justify-content: center;
        }
      }

      /* Account card */
      .account-card {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 14px;
        padding: 24px;
        margin-bottom: 24px;
      }

      .account-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.04));
        font-size: 14px;
      }

      .account-row:last-child {
        border-bottom: none;
      }

      .account-label {
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      .account-value {
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .tier-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .tier-badge.pro {
        background: linear-gradient(135deg, #f093fb, #f5576c);
        color: white;
      }

      .tier-badge.free {
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
        color: var(--secondary-text-color);
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }

      .status-dot.active {
        background: #4caf50;
        box-shadow: 0 0 6px rgba(76, 175, 80, 0.4);
      }

      .status-dot.inactive {
        background: var(--disabled-text-color, #999);
      }

      /* Pro tools section */
      .tools-section {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 14px;
        padding: 24px;
        margin-bottom: 24px;
      }

      .tools-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
      }

      @media (max-width: 600px) {
        .tools-grid {
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }
      }

      .tool-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 10px;
        padding: 20px 14px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        font: inherit;
        color: inherit;
      }

      .tool-card:hover {
        border-color: var(--primary-color);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
      }

      .tool-card:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .tool-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .tool-icon ha-icon {
        --mdc-icon-size: 22px;
        color: white;
      }

      .tool-icon.export { background: linear-gradient(135deg, #2196f3, #42a5f5); }
      .tool-icon.import { background: linear-gradient(135deg, #4caf50, #66bb6a); }
      .tool-icon.backup { background: linear-gradient(135deg, #ff9800, #ffb74d); }
      .tool-icon.restore { background: linear-gradient(135deg, #9c27b0, #ba68c8); }
      .tool-icon.history { background: linear-gradient(135deg, #607d8b, #90a4ae); }
      .tool-icon.snapshot { background: linear-gradient(135deg, #e91e63, #f06292); }
      .tool-icon.settings { background: linear-gradient(135deg, #795548, #a1887f); }

      .tool-content h4 {
        margin: 0;
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .tool-content p {
        margin: 2px 0 0;
        font-size: 11px;
        color: var(--secondary-text-color);
        line-height: 1.3;
      }

      /* Snapshot summary below dashboard tools */
      .snapshot-summary {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 16px 24px;
        margin-top: 16px;
        padding: 14px 16px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
        border-radius: 10px;
        font-size: 13px;
      }

      .snapshot-summary-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .snapshot-summary-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      .snapshot-summary-label ha-icon {
        --mdc-icon-size: 18px;
        color: var(--primary-color);
      }

      .snapshot-summary-value {
        color: var(--primary-text-color);
        font-weight: 600;
      }

      .snapshot-summary-latest .snapshot-summary-value {
        font-weight: 500;
        font-size: 12px;
      }

      /* Status info bars */
      .tools-status {
        margin-top: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
      }

      .tools-status.info {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.06);
        color: var(--primary-color);
      }

      .tools-status.warning {
        background: rgba(255, 152, 0, 0.08);
        color: #f57c00;
      }

      .tools-status.success {
        background: rgba(76, 175, 80, 0.08);
        color: #4caf50;
      }

      .tools-status ha-icon {
        --mdc-icon-size: 16px;
        flex-shrink: 0;
      }

      /* Upgrade prompt for free users */
      .upgrade-card {
        background: var(--ha-card-background, var(--card-background-color));
        border: 2px solid var(--primary-color);
        border-radius: 16px;
        padding: 28px;
        margin-bottom: 24px;
        text-align: center;
      }

      .upgrade-icon {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(240, 147, 251, 0.12), rgba(245, 87, 108, 0.12));
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
      }

      .upgrade-icon ha-icon {
        --mdc-icon-size: 32px;
        color: #f5576c;
      }

      .upgrade-card h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 700;
        color: var(--primary-text-color);
      }

      .upgrade-card > p {
        margin: 0 0 20px 0;
        font-size: 14px;
        color: var(--secondary-text-color);
        line-height: 1.5;
      }

      .features-checklist {
        display: flex;
        flex-direction: column;
        gap: 10px;
        text-align: left;
        max-width: 380px;
        margin: 0 auto 24px;
      }

      .features-checklist li {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        color: var(--primary-text-color);
        list-style: none;
      }

      .features-checklist li ha-icon {
        --mdc-icon-size: 18px;
        color: #4caf50;
        flex-shrink: 0;
      }

      .upgrade-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 14px 32px;
        border: none;
        border-radius: 12px;
        background: linear-gradient(135deg, #f093fb, #f5576c);
        color: white;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
      }

      .upgrade-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(245, 87, 108, 0.35);
        filter: brightness(1.05);
      }

      .upgrade-btn ha-icon {
        --mdc-icon-size: 20px;
      }

      /* Not installed CTA */
      .install-card {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 16px;
        padding: 32px;
        text-align: center;
        margin-bottom: 24px;
      }

      .install-card .cta-icon {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
      }

      .install-card .cta-icon ha-icon {
        --mdc-icon-size: 36px;
        color: var(--primary-color);
      }

      .install-card h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 700;
        color: var(--primary-text-color);
      }

      .install-card > p {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: var(--secondary-text-color);
        line-height: 1.5;
        max-width: 480px;
        margin-left: auto;
        margin-right: auto;
      }

      .benefits-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 12px;
        margin: 24px 0;
        text-align: left;
      }

      .benefit-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
        border-radius: 10px;
      }

      .benefit-item ha-icon {
        --mdc-icon-size: 20px;
        color: #4caf50;
        margin-top: 1px;
        flex-shrink: 0;
      }

      .benefit-item strong {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-text-color);
        margin-bottom: 2px;
      }

      .benefit-item span {
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.3;
      }

      .install-steps {
        text-align: left;
        max-width: 420px;
        margin: 0 auto 24px;
        padding: 16px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
        border-radius: 10px;
      }

      .install-steps h5 {
        margin: 0 0 10px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .install-steps ol {
        margin: 0;
        padding-left: 20px;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.8;
      }

      .install-steps ol strong {
        color: var(--primary-text-color);
      }

      .cta-buttons {
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .cta-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        text-decoration: none;
        transition: all 0.2s ease;
        cursor: pointer;
        border: none;
      }

      .cta-btn.primary {
        background: var(--primary-color);
        color: white;
      }

      .cta-btn.primary:hover {
        filter: brightness(1.1);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(var(--rgb-primary-color, 3, 169, 244), 0.3);
      }

      .cta-btn.secondary {
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .cta-btn.secondary:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .cta-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      /* Features grid */
      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 280px));
        justify-content: center;
        gap: 14px;
      }

      .feature-card {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 16px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
        border-radius: 12px;
        transition: all 0.2s ease;
      }

      .feature-card:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }

      .feature-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .feature-icon ha-icon {
        --mdc-icon-size: 20px;
        color: white;
      }

      .feature-icon.sync { background: linear-gradient(135deg, #2196f3, #42a5f5); }
      .feature-icon.backup { background: linear-gradient(135deg, #ff9800, #ffb74d); }
      .feature-icon.presets { background: linear-gradient(135deg, #e91e63, #f06292); }
      .feature-icon.support { background: linear-gradient(135deg, #4caf50, #66bb6a); }

      .feature-info h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .feature-info p {
        margin: 2px 0 0;
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }

      /* Pro settings */
      .pro-setting-item {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 16px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
        border-radius: 10px;
        transition: all 0.2s ease;
      }

      .pro-setting-item:hover {
        background: var(--divider-color, rgba(0, 0, 0, 0.06));
      }

      .setting-icon-wrap {
        width: 44px;
        height: 44px;
        min-width: 44px;
        background: linear-gradient(135deg, var(--primary-color, #03a9f4), #0288d1);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 8px rgba(3, 169, 244, 0.25);
      }

      .setting-icon-wrap ha-icon {
        --mdc-icon-size: 24px;
        color: white;
      }

      .setting-body {
        flex: 1;
        min-width: 0;
      }

      .setting-body h4 {
        margin: 0 0 4px 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .setting-body p {
        margin: 0;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }

      .setting-toggle {
        padding-top: 4px;
      }

      /* Discord support section */
      .discord-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        background: linear-gradient(135deg, rgba(88, 101, 242, 0.08), rgba(88, 101, 242, 0.02));
        border: 1px solid rgba(88, 101, 242, 0.2);
        border-radius: 14px;
        transition: all 0.2s ease;
      }

      .discord-card:hover {
        border-color: rgba(88, 101, 242, 0.4);
        box-shadow: 0 4px 16px rgba(88, 101, 242, 0.1);
      }

      .discord-icon {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        background: #5865F2;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(88, 101, 242, 0.3);
      }

      .discord-icon ha-icon {
        --mdc-icon-size: 26px;
        color: white;
      }

      .discord-body {
        flex: 1;
        min-width: 0;
      }

      .discord-body h4 {
        margin: 0 0 4px;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .discord-body p {
        margin: 0;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }

      .discord-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 20px;
        background: #5865F2;
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.2s ease;
        flex-shrink: 0;
        white-space: nowrap;
      }

      .discord-btn:hover {
        background: #4752C4;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(88, 101, 242, 0.35);
      }

      .discord-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      /* Snapshot settings inline panel */
      .ss-panel {
        margin-top: 16px;
        padding: 20px;
        background: var(--secondary-background-color, rgba(0,0,0,0.03));
        border-radius: 12px;
        border: 1px solid var(--divider-color, rgba(0,0,0,0.08));
        animation: fadeSlideIn 0.2s ease-out;
      }

      .ss-panel h4 {
        margin: 0 0 16px 0;
        font-size: 15px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--primary-text-color);
      }

      .ss-panel h4 ha-icon { --mdc-icon-size: 20px; color: var(--primary-color); }

      .ss-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
      }

      .ss-row:last-child { margin-bottom: 0; }

      .ss-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--secondary-text-color);
        min-width: 80px;
      }

      .ss-input {
        padding: 8px 12px;
        border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
        border-radius: 8px;
        background: var(--primary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        outline: none;
        box-sizing: border-box;
      }

      .ss-input:focus { border-color: var(--primary-color); }

      select.ss-input {
        cursor: pointer;
        min-width: 160px;
      }

      .ss-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
      }

      .ss-save-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 18px;
        border: none;
        border-radius: 8px;
        background: var(--primary-color);
        color: white;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .ss-save-btn:hover:not(:disabled) { filter: brightness(1.1); }
      .ss-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

      .ss-cancel-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 18px;
        border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
        border-radius: 8px;
        background: transparent;
        color: var(--secondary-text-color);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .ss-cancel-btn:hover { border-color: var(--primary-color); color: var(--primary-color); }

      /* Snapshot list panel */
      .snapshots-list {
        margin-top: 16px;
        animation: fadeSlideIn 0.2s ease-out;
      }

      .snapshot-item {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 16px;
        background: var(--secondary-background-color, rgba(0,0,0,0.03));
        border-radius: 10px;
        margin-bottom: 8px;
        border: 1px solid var(--divider-color, rgba(0,0,0,0.06));
        transition: all 0.2s ease;
      }

      .snapshot-item:hover {
        border-color: var(--primary-color);
      }

      .snapshot-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .snapshot-icon.manual { background: linear-gradient(135deg, #e91e63, #f06292); }
      .snapshot-icon.auto { background: linear-gradient(135deg, #4caf50, #66bb6a); }

      .snapshot-icon ha-icon { --mdc-icon-size: 20px; color: white; }

      .snapshot-info { flex: 1; min-width: 0; }
      .snapshot-info h5 { margin: 0; font-size: 14px; font-weight: 600; color: var(--primary-text-color); }
      .snapshot-info p { margin: 2px 0 0; font-size: 12px; color: var(--secondary-text-color); }

      .snapshot-meta {
        text-align: right;
        font-size: 12px;
        color: var(--secondary-text-color);
        flex-shrink: 0;
      }

      .snapshot-meta .card-count {
        font-weight: 600;
        color: var(--primary-color);
      }
    `],p([(0,s.MZ)({attribute:!1})],u.prototype,"auth",void 0),p([(0,s.MZ)({attribute:!1})],u.prototype,"hass",void 0),p([(0,s.MZ)({attribute:!1})],u.prototype,"cloudUser",void 0),p([(0,s.wk)()],u.prototype,"_toastMsg",void 0),p([(0,s.wk)()],u.prototype,"_cloudUser",void 0),p([(0,s.wk)()],u.prototype,"_snapshotSettingsOpen",void 0),p([(0,s.wk)()],u.prototype,"_ssEnabled",void 0),p([(0,s.wk)()],u.prototype,"_ssTime",void 0),p([(0,s.wk)()],u.prototype,"_ssTimezone",void 0),p([(0,s.wk)()],u.prototype,"_ssLoading",void 0),p([(0,s.wk)()],u.prototype,"_snapshotsListOpen",void 0),p([(0,s.wk)()],u.prototype,"_snapshotsList",void 0),p([(0,s.wk)()],u.prototype,"_snapshotsLoading",void 0),p([(0,s.wk)()],u.prototype,"_creatingSnapshot",void 0),u=p([(0,s.EM)("hub-pro-tab")],u)}}]);