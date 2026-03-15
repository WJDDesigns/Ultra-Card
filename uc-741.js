"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[741],{4741:(r,o,t)=>{t.r(o),t.d(o,{HubAccountTab:()=>l});var i=t(5183),e=t(4276),a=t(9978),n=t(378),s=t(7568),c=function(r,o,t,i){var e,a=arguments.length,n=a<3?o:null===i?i=Object.getOwnPropertyDescriptor(o,t):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(r,o,t,i);else for(var s=r.length-1;s>=0;s--)(e=r[s])&&(n=(a<3?e(n):a>3?e(o,t,n):e(o,t))||n);return a>3&&n&&Object.defineProperty(o,t,n),n};let l=class extends i.WF{constructor(){super(...arguments),this.auth=null,this.cloudUser=null,this._formMode="signin",this._username="",this._password="",this._email="",this._displayName="",this._loading=!1,this._error="",this._autoConfigNote="",this._syncStatus=null,this._syncCounts={colors:0,variables:0,presets:0,favorites:0}}connectedCallback(){super.connectedCallback(),this._syncStatus=s.Q.getSyncStatus(),this._refreshCounts(),this._syncListener=r=>{this._syncStatus=r,this._refreshCounts()},s.Q.addListener(this._syncListener)}disconnectedCallback(){super.disconnectedCallback(),this._syncListener&&s.Q.removeListener(this._syncListener)}_refreshCounts(){var r,o,t,i;try{const e=JSON.parse(null!==(r=localStorage.getItem("ultra-card-favorite-colors"))&&void 0!==r?r:"[]"),a=JSON.parse(null!==(o=localStorage.getItem("ultra-card-custom-variables"))&&void 0!==o?o:"[]"),n=JSON.parse(null!==(t=localStorage.getItem("ultra-card-favorites"))&&void 0!==t?t:"[]"),s=JSON.parse(null!==(i=localStorage.getItem("ultra-card-presets"))&&void 0!==i?i:"[]");this._syncCounts={colors:Array.isArray(e)?e.length:0,variables:Array.isArray(a)?a.length:0,favorites:Array.isArray(n)?n.length:0,presets:Array.isArray(s)?s.length:0}}catch(r){this._syncCounts={colors:0,variables:0,presets:0,favorites:0}}}_formatSyncTime(r){if(!r)return"Never";const o=Date.now()-r.getTime();return o<6e4?"Just now":o<36e5?`${Math.floor(o/6e4)}m ago`:o<864e5?`${Math.floor(o/36e5)}h ago`:r.toLocaleDateString()}get _effectiveUser(){return n.x.checkIntegrationAuth(this.hass)||this.cloudUser}_switchFormMode(r){this._formMode=r,this._error="",this._autoConfigNote=""}async _handleSignIn(r){r.preventDefault();const o=this._username.trim();if(o&&this._password){this._loading=!0,this._error="",this._autoConfigNote="";try{await n.x.loginViaHass(this.hass,o,this._password),this._username="",this._password=""}catch(r){this._error=r instanceof Error?r.message:"Login failed"}finally{this._loading=!1}}else this._error="Please enter your email and password"}async _handleRegister(r){if(r.preventDefault(),this._error="",this._autoConfigNote="",this._username.trim()&&this._email.trim()){this._loading=!0;try{const r=await n.x.registerViaHass(this.hass,this._username.trim(),this._email.trim(),this._displayName.trim());this._username="",this._email="",this._displayName="",this._autoConfigNote=r||"Account created. Check your email inbox, junk, or spam for the ultracard.io message to finish setting your password, then come back here to sign in."}catch(r){this._error=r instanceof Error?r.message:"Registration failed. Please try again."}finally{this._loading=!1}}else this._error="Please fill in all required fields."}async _handleLogout(){await n.x.logoutViaHass(this.hass)}render(){const r=this._effectiveUser;return r?this._renderAuthenticated(r):n.x.isIntegrationInstalled(this.hass)?this._renderUnauthenticated():this._renderSetupGuide()}_renderSetupGuide(){return i.qy`
      <div class="account-card">
        <h3>
          <ha-icon icon="mdi:connection"></ha-icon>
          Connect Ultra Card
        </h3>
        <p style="font-size:13px;color:var(--secondary-text-color);line-height:1.6;margin:0 0 20px;">
          Ultra Card uses the <strong>Ultra Card Connect</strong> integration to securely
          store your account credentials in Home Assistant — so your login persists across
          any device and browser, with no local storage needed.
        </p>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;align-items:flex-start;gap:10px;font-size:13px;">
            <ha-icon icon="mdi:numeric-1-circle" style="color:var(--primary-color);flex-shrink:0;margin-top:1px;"></ha-icon>
            <span>Install <strong>Ultra Card Connect</strong> via HACS → Integrations</span>
          </div>
          <div style="display:flex;align-items:flex-start;gap:10px;font-size:13px;">
            <ha-icon icon="mdi:numeric-2-circle" style="color:var(--primary-color);flex-shrink:0;margin-top:1px;"></ha-icon>
            <span>Add it under <strong>Settings → Integrations → Add Integration</strong>, or click below</span>
          </div>
          <div style="display:flex;align-items:flex-start;gap:10px;font-size:13px;">
            <ha-icon icon="mdi:numeric-3-circle" style="color:var(--primary-color);flex-shrink:0;margin-top:1px;"></ha-icon>
            <span>Come back here to sign in — your account stays logged in permanently</span>
          </div>
        </div>
        <a
          href="/config/integrations/integration/ultra_card_pro_cloud"
          style="display:inline-flex;align-items:center;gap:6px;margin-top:20px;padding:9px 16px;
                 background:var(--primary-color);color:white;border-radius:8px;font-size:13px;
                 font-weight:500;text-decoration:none;"
        >
          <ha-icon icon="mdi:plus-circle" style="--mdc-icon-size:16px;"></ha-icon>
          Set Up Integration
        </a>
      </div>
    `}_renderAuthenticated(r){var o,t;const e="pro"===(null===(o=r.subscription)||void 0===o?void 0:o.tier)&&"active"===(null===(t=r.subscription)||void 0===t?void 0:t.status);return i.qy`
      <div class="account-card">
        <h3>
          <ha-icon icon="mdi:account-circle"></ha-icon>
          Account
        </h3>
        <div class="user-info">
          <div class="user-info-row">
            <ha-icon icon="mdi:account"></ha-icon>
            <span>${r.displayName||r.username}</span>
          </div>
          <div class="user-info-row">
            <ha-icon icon="mdi:email-outline"></ha-icon>
            <span>${r.email}</span>
          </div>
          <div class="tier-badge ${e?"pro":"free"}">
            ${e?i.qy`<ha-icon icon="mdi:star" style="--mdc-icon-size:14px"></ha-icon>`:""}
            ${e?"Pro":"Free"}
          </div>
        </div>

        ${this._renderSyncStats(e)}

        ${e?i.qy`
              <div class="manage-link">
                <a href="https://ultracard.io/dashboard/" target="_blank" rel="noopener noreferrer">
                  Manage account at ultracard.io
                </a>
              </div>
            `:i.qy`
              <div class="upgrade-section">
                <h4>Upgrade to Ultra Card Pro</h4>
                <p>
                  Unlock dashboard snapshots, auto-backups, and all Pro modules. Sync across devices.
                </p>
                <a
                  class="upgrade-btn"
                  href="https://ultracard.io/product/ultra-card-pro/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ha-icon icon="mdi:star"></ha-icon>
                  Upgrade to Pro
                </a>
              </div>
            `}

        <button class="logout-btn" @click=${this._handleLogout}>Sign out</button>
      </div>
    `}_renderSyncStats(r){var o,t,e,a;const n=this._syncStatus,c=null!==(o=null==n?void 0:n.isSyncing)&&void 0!==o&&o,l=this._formatSyncTime(null!==(t=null==n?void 0:n.lastColorsSync)&&void 0!==t?t:null),d=this._formatSyncTime(null!==(e=null==n?void 0:n.lastVariablesSync)&&void 0!==e?e:null),p=this._formatSyncTime(null!==(a=null==n?void 0:n.lastFavoritesSync)&&void 0!==a?a:null),u=[{icon:"mdi:palette",label:"Colors",count:this._syncCounts.colors,lastSync:l},{icon:"mdi:variable",label:"Variables",count:this._syncCounts.variables,lastSync:d},{icon:"mdi:heart",label:"Favorites",count:this._syncCounts.favorites,lastSync:p},{icon:"mdi:view-dashboard",label:"Presets",count:this._syncCounts.presets,lastSync:"—",proOnly:!1}];return i.qy`
      <div class="sync-stats-section">
        <div class="sync-stats-header">
          <span class="sync-stats-title">
            <ha-icon icon="mdi:cloud-sync"></ha-icon>
            Cloud Sync
          </span>
          <span class="sync-stats-badge ${r?"pro":"free"}">
            ${r?"Pro":"Free"}
          </span>
        </div>

        <div class="sync-stats-grid">
          ${u.map((({icon:r,label:o,count:t,lastSync:e})=>i.qy`
            <div class="sync-stat-card">
              <div class="sync-stat-icon">
                <ha-icon icon=${r}></ha-icon>
              </div>
              <div class="sync-stat-body">
                <div class="sync-stat-count">${t}</div>
                <div class="sync-stat-label">${o}</div>
                ${"—"!==e?i.qy`
                  <div class="sync-stat-time">
                    <ha-icon icon="mdi:clock-outline"></ha-icon>
                    ${e}
                  </div>
                `:""}
              </div>
            </div>
          `))}
        </div>

        <button
          class="sync-now-btn"
          ?disabled=${c}
          @click=${async()=>{await s.Q.syncAll(),this._refreshCounts()}}
        >
          <ha-icon icon="mdi:${c?"loading":"cloud-upload"}" class="${c?"spin":""}"></ha-icon>
          ${c?"Syncing…":"Sync Now"}
        </button>
      </div>
    `}_renderUnauthenticated(){return i.qy`
      <div class="account-card">
        <h3>
          <ha-icon icon="mdi:login"></ha-icon>
          Sign in or create an account
        </h3>
        <p class="form-note" style="margin: 0 0 16px 0;">
          Sign in to cloud-save favorites, colors, and presets. Upgrade to Pro for full features.
        </p>

        <div class="form-tabs">
          <button
            class="${"signin"===this._formMode?"active":""}"
            @click=${()=>this._switchFormMode("signin")}
          >
            Sign In
          </button>
          <button
            class="${"register"===this._formMode?"active":""}"
            @click=${()=>this._switchFormMode("register")}
          >
            Create account
          </button>
        </div>

        ${"signin"===this._formMode?this._renderSignInForm():this._renderRegisterForm()}
      </div>
    `}_renderSignInForm(){return i.qy`
      <form class="form-section" @submit=${this._handleSignIn}>
        <div class="form-field">
          <label for="account-signin-username">Username or email</label>
          <input
            id="account-signin-username"
            type="text"
            .value=${this._username}
            @input=${r=>{this._username=r.target.value,this._error=""}}
            autocomplete="username"
            ?disabled=${this._loading}
          />
        </div>
        <div class="form-field">
          <label for="account-signin-password">Password</label>
          <input
            id="account-signin-password"
            type="password"
            .value=${this._password}
            @input=${r=>{this._password=r.target.value,this._error=""}}
            autocomplete="current-password"
            ?disabled=${this._loading}
          />
        </div>
        <p class="form-note">
          <a href="https://ultracard.io/wp-login.php?action=lostpassword" target="_blank" rel="noopener">
            Forgot password?
          </a>
        </p>
        ${this._error?i.qy`<p class="form-error">${this._error}</p>`:""}
        ${this._autoConfigNote?i.qy`<p class="form-note">${this._autoConfigNote}</p>`:""}
        <button type="submit" class="form-submit" ?disabled=${this._loading}>
          ${this._loading?i.qy`<ha-icon icon="mdi:loading" class="spinning"></ha-icon> Signing in…`:i.qy`<ha-icon icon="mdi:login"></ha-icon> Sign In`}
        </button>
      </form>
    `}_renderRegisterForm(){return i.qy`
      <form class="form-section" @submit=${this._handleRegister}>
        <div class="register-notice">
          <ha-icon icon="mdi:cloud-check"></ha-icon>
          <span>
            Create a free account to cloud-sync your Favorites, Colors &amp; Variables across devices.
            After you register, we will email you from ultracard.io so you can set your password.
          </span>
        </div>
        <div class="form-field">
          <label for="account-reg-display">Display name</label>
          <input
            id="account-reg-display"
            type="text"
            .value=${this._displayName}
            @input=${r=>{this._displayName=r.target.value,this._error="",this._autoConfigNote=""}}
            autocomplete="name"
          />
        </div>
        <div class="form-field">
          <label for="account-reg-email">Email</label>
          <input
            id="account-reg-email"
            type="email"
            .value=${this._email}
            @input=${r=>{this._email=r.target.value,this._error="",this._autoConfigNote=""}}
            autocomplete="email"
          />
        </div>
        <div class="form-field">
          <label for="account-reg-username">Username</label>
          <input
            id="account-reg-username"
            type="text"
            .value=${this._username}
            @input=${r=>{this._username=r.target.value,this._error="",this._autoConfigNote=""}}
            autocomplete="username"
          />
        </div>
        ${this._error?i.qy`<p class="form-error">${this._error}</p>`:""}
        ${this._autoConfigNote?i.qy`<p class="form-note">${this._autoConfigNote}</p>`:""}
        <button
          type="submit"
          class="form-submit-btn"
          ?disabled=${this._loading||!this._username.trim()||!this._email.trim()}
        >
          ${this._loading?i.qy`<ha-icon icon="mdi:loading" class="spin"></ha-icon> Creating account…`:i.qy`<ha-icon icon="mdi:email-fast"></ha-icon> Create Account`}
        </button>
      </form>
    `}};l.styles=[a.z,i.AH`
      :host {
        display: block;
        animation: fadeSlideIn 0.3s ease-out;
        padding-bottom: 60px;
      }

      .account-card {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 14px;
        padding: 24px;
        margin-bottom: 24px;
      }

      .account-card h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .account-card h3 ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      .form-tabs {
        display: flex;
        gap: 0;
        margin-bottom: 20px;
        border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
      }

      .form-tabs button {
        padding: 10px 16px;
        border: none;
        background: none;
        color: var(--secondary-text-color);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
        transition: color 0.2s ease;
      }

      .form-tabs button:hover {
        color: var(--primary-text-color);
      }

      .form-tabs button.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      .form-section {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .form-field label {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }

      .form-field input {
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.2));
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        box-sizing: border-box;
      }

      .form-field input:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .form-submit {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 18px;
        border-radius: 8px;
        border: none;
        background: var(--primary-color);
        color: var(--primary-text-color);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        margin-top: 4px;
      }

      .form-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .form-submit ha-icon {
        --mdc-icon-size: 18px;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .spinning {
        animation: spin 0.8s linear infinite;
      }

      .form-error {
        font-size: 13px;
        color: var(--error-color, #db4437);
        margin-top: 4px;
      }

      .form-note {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 8px;
      }

      .form-note a {
        color: var(--primary-color);
        text-decoration: none;
      }

      .form-note a:hover {
        text-decoration: underline;
      }

      .user-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .user-info-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: var(--primary-text-color);
      }

      .user-info-row ha-icon {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
      }

      .tier-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        margin-top: 8px;
      }

      .tier-badge.pro {
        background: linear-gradient(135deg, rgba(245, 87, 108, 0.2), rgba(240, 147, 251, 0.2));
        color: var(--primary-text-color);
      }

      .tier-badge.free {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
        color: var(--primary-text-color);
      }

      .upgrade-section {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
      }

      .upgrade-section h4 {
        margin: 0 0 12px 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .upgrade-section p {
        margin: 0 0 16px 0;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.5;
      }

      .upgrade-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border-radius: 8px;
        border: none;
        background: linear-gradient(135deg, #f5576c, #f093fb);
        color: white;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        transition: opacity 0.15s ease;
      }

      .upgrade-btn:hover {
        opacity: 0.95;
      }

      .upgrade-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .manage-link {
        font-size: 13px;
        margin-top: 12px;
      }

      .manage-link a {
        color: var(--primary-color);
        text-decoration: none;
      }

      /* Password strength meter */
      .strength-meter {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 6px;
      }

      .strength-bar {
        display: flex;
        gap: 3px;
        flex: 1;
      }

      .strength-segment {
        height: 4px;
        flex: 1;
        border-radius: 2px;
        background: var(--divider-color, rgba(0, 0, 0, 0.12));
        transition: background 0.25s ease;
      }

      .strength-label {
        font-size: 11px;
        font-weight: 600;
        min-width: 58px;
        text-align: right;
        transition: color 0.2s ease;
      }

      /* Register notice */
      .register-notice {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.07);
        border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
        border-radius: 8px;
        padding: 12px 14px;
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.5;
      }

      .register-notice ha-icon {
        --mdc-icon-size: 16px;
        color: var(--primary-color);
        flex-shrink: 0;
        margin-top: 1px;
      }

      .form-submit-outline {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 18px;
        border-radius: 8px;
        border: 1px solid var(--primary-color);
        background: none;
        color: var(--primary-color);
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 4px;
        transition: all 0.15s ease;
      }

      .form-submit-outline:hover {
        background: var(--primary-color);
        color: white;
      }

      .form-submit-outline ha-icon {
        --mdc-icon-size: 18px;
      }

      .form-submit-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 11px 18px;
        border-radius: 8px;
        border: none;
        background: var(--primary-color);
        color: white;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 4px;
        transition: opacity 0.15s ease;
      }

      .form-submit-btn:hover:not(:disabled) {
        opacity: 0.88;
      }

      .form-submit-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      .form-submit-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .spin {
        animation: spin 0.8s linear infinite;
      }

      .manage-link a:hover {
        text-decoration: underline;
      }

      .logout-btn {
        margin-top: 16px;
        padding: 8px 14px;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        background: transparent;
        color: var(--secondary-text-color);
        font-size: 13px;
        cursor: pointer;
      }

      .logout-btn:hover {
        background: rgba(0, 0, 0, 0.05);
        color: var(--primary-text-color);
      }

      /* ── Sync Stats ─────────────────────────────────────────────────────── */
      .sync-stats-section {
        margin: 16px 0 4px;
        padding: 14px;
        border-radius: 10px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.05);
        border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
      }

      .sync-stats-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .sync-stats-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .sync-stats-title ha-icon {
        --mdc-icon-size: 16px;
        color: var(--primary-color);
      }

      .sync-stats-badge {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 2px 8px;
        border-radius: 20px;
      }

      .sync-stats-badge.pro {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
      }

      .sync-stats-badge.free {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
        color: var(--primary-color);
        border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.3);
      }

      .sync-stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin-bottom: 12px;
      }

      .sync-stat-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 10px 6px 8px;
        border-radius: 8px;
        background: var(--card-background-color, var(--ha-card-background));
        border: 1px solid var(--divider-color, rgba(0,0,0,0.08));
        text-align: center;
        min-width: 0;
      }

      .sync-stat-icon ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
        opacity: 0.8;
      }

      .sync-stat-count {
        font-size: 22px;
        font-weight: 700;
        color: var(--primary-text-color);
        line-height: 1;
      }

      .sync-stat-label {
        font-size: 11px;
        font-weight: 500;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
      }

      .sync-stat-time {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        font-size: 10px;
        color: var(--secondary-text-color);
        opacity: 0.7;
        margin-top: 2px;
      }

      .sync-stat-time ha-icon {
        --mdc-icon-size: 11px;
      }

      .sync-now-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
        padding: 8px 12px;
        border-radius: 7px;
        border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.3);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);
        color: var(--primary-color);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s ease;
      }

      .sync-now-btn:hover:not(:disabled) {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.18);
      }

      .sync-now-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .sync-now-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .spin {
        animation: spin 0.8s linear infinite;
      }
    `],c([(0,e.MZ)({attribute:!1})],l.prototype,"hass",void 0),c([(0,e.MZ)({attribute:!1})],l.prototype,"auth",void 0),c([(0,e.MZ)({attribute:!1})],l.prototype,"cloudUser",void 0),c([(0,e.wk)()],l.prototype,"_formMode",void 0),c([(0,e.wk)()],l.prototype,"_username",void 0),c([(0,e.wk)()],l.prototype,"_password",void 0),c([(0,e.wk)()],l.prototype,"_email",void 0),c([(0,e.wk)()],l.prototype,"_displayName",void 0),c([(0,e.wk)()],l.prototype,"_loading",void 0),c([(0,e.wk)()],l.prototype,"_error",void 0),c([(0,e.wk)()],l.prototype,"_autoConfigNote",void 0),c([(0,e.wk)()],l.prototype,"_syncStatus",void 0),c([(0,e.wk)()],l.prototype,"_syncCounts",void 0),l=c([(0,e.EM)("hub-account-tab")],l)}}]);