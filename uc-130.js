"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[130],{1130:(a,o,t)=>{t.r(o),t.d(o,{HubDashboardTab:()=>l});var r=t(5183),s=t(4276),e=t(9978),i=t(8980),n=t(4541),d=function(a,o,t,r){var s,e=arguments.length,i=e<3?o:null===r?r=Object.getOwnPropertyDescriptor(o,t):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(a,o,t,r);else for(var n=a.length-1;n>=0;n--)(s=a[n])&&(i=(e<3?s(i):e>3?s(o,t,i):s(o,t))||i);return e>3&&i&&Object.defineProperty(o,t,i),i};let l=class extends r.WF{constructor(){super(...arguments),this._stats=null,this._statsLoading=!0,this._statsError="",this._changelogBody="",this._changelogLoading=!0,this._changelogError="",this._changelogTitle=""}connectedCallback(){super.connectedCallback(),this._loadStats(),this._loadChangelog()}async _loadChangelog(){this._changelogLoading=!0,this._changelogError="",this._changelogBody="",this._changelogTitle="";const a=/beta|alpha/i.test(n.x);try{const o=await fetch("https://api.github.com/repos/WJDDesigns/Ultra-Card/releases?per_page=20",{headers:{Accept:"application/vnd.github.v3+json"}});if(!o.ok)throw new Error(`HTTP ${o.status}`);const t=await o.json(),r=a?t.find((a=>a.prerelease)):t.find((a=>!a.prerelease));(null==r?void 0:r.body)?(this._changelogTitle=r.name||r.tag_name||"Changelog",this._changelogBody=r.body):this._changelogBody=a?"No beta release notes found.":"No stable release notes found."}catch(a){console.warn("Changelog fetch failed:",a),this._changelogError="Could not load changelog from GitHub."}finally{this._changelogLoading=!1}}async _loadStats(){var a,o;if(this.hass){this._statsLoading=!0,this._statsError="";try{i.ucDashboardScannerService.initialize(this.hass);const t=await i.ucDashboardScannerService.scanAllDashboards();let r=1;try{const a=await this.hass.callWS({type:"lovelace/dashboards/list"});Array.isArray(a)&&(r=a.length+1)}catch(a){}this._stats={cardCount:t.card_count,viewCount:null!==(o=null===(a=t.views)||void 0===a?void 0:a.length)&&void 0!==o?o:0,dashboardCount:r}}catch(a){console.warn("Dashboard scan for stats failed:",a),this._statsError="Could not load dashboard stats.",this._stats=null}finally{this._statsLoading=!1}}else this._statsLoading=!1}render(){return r.qy`
      <div class="welcome-hero">
        <h2>Welcome to Ultra Card</h2>
        <p>
          Build beautiful, modular dashboards with the layout builder. Use presets, favorites,
          variables, and templates to create cards that fit your Home Assistant setup.
        </p>
        <div class="version-badge">
          <ha-icon icon="mdi:tag-outline"></ha-icon>
          Version ${n.x}
        </div>
      </div>

      <div class="hub-tab-blurb">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <p><strong>Dashboard.</strong> Totals across all your dashboards — how many dashboards, views, and Ultra Cards you have — plus the latest release notes.</p>
      </div>

      <div class="stats-card">
        <h3><ha-icon icon="mdi:view-dashboard"></ha-icon> Your Home Assistant</h3>
        ${this._statsLoading?r.qy`<div class="stats-loading">Scanning all dashboards…</div>`:this._statsError?r.qy`<div class="stats-error">${this._statsError}</div>`:this._stats?r.qy`
                  <div class="stats-grid">
                    <div class="stat-item">
                      <div class="stat-value">${this._stats.dashboardCount}</div>
                      <div class="stat-label">Lovelace Dashboard${1!==this._stats.dashboardCount?"s":""}</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value">${this._stats.viewCount}</div>
                      <div class="stat-label">View${1!==this._stats.viewCount?"s":""}</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value">${this._stats.cardCount}</div>
                      <div class="stat-label">Ultra Card${1!==this._stats.cardCount?"s":""}</div>
                    </div>
                  </div>
                `:r.qy`<div class="stats-loading">No data</div>`}
      </div>

      <div class="changelog-card">
        <h3><ha-icon icon="mdi:new-box"></ha-icon> ${this._changelogTitle||"Recent updates"}</h3>
        ${this._changelogLoading?r.qy`<div class="changelog-body-loading">Loading changelog…</div>`:this._changelogError?r.qy`<div class="changelog-body-error">${this._changelogError}</div>`:r.qy`<div class="changelog-body">${this._changelogBody}</div>`}
      </div>
    `}};l.styles=[e.z,r.AH`
      :host {
        display: block;
        animation: fadeSlideIn 0.3s ease-out;
      }

      .welcome-hero {
        text-align: center;
        padding: 32px 24px 28px;
        margin-bottom: 24px;
        background: linear-gradient(135deg, rgba(var(--rgb-primary-color, 3, 169, 244), 0.08), rgba(var(--rgb-primary-color, 3, 169, 244), 0.02));
        border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
        border-radius: 16px;
      }

      .welcome-hero h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 700;
        color: var(--primary-text-color);
      }

      .welcome-hero p {
        margin: 0;
        font-size: 15px;
        color: var(--secondary-text-color);
        line-height: 1.5;
        max-width: 520px;
        margin-left: auto;
        margin-right: auto;
      }

      .stats-card {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 14px;
        padding: 20px 24px;
        margin-bottom: 24px;
      }

      .stats-card h3 {
        margin: 0 0 16px 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .stats-card h3 ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 16px;
      }

      .stat-item {
        padding: 12px 16px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
        border-radius: 10px;
        text-align: center;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: var(--primary-color);
        line-height: 1.2;
      }

      .stat-label {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      .stats-loading,
      .stats-error {
        padding: 16px;
        text-align: center;
        color: var(--secondary-text-color);
        font-size: 14px;
      }

      .stats-error {
        color: var(--error-color, #f44336);
      }

      .changelog-card {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 14px;
        padding: 24px;
        margin-bottom: 24px;
      }

      .changelog-card h3 {
        margin: 0 0 16px 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .changelog-card h3 ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      .changelog-list {
        margin: 0;
        padding-left: 20px;
        font-size: 14px;
        color: var(--secondary-text-color);
        line-height: 1.7;
      }

      .changelog-list li {
        margin-bottom: 6px;
      }

      .changelog-body {
        margin-top: 12px;
        padding: 16px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
        border-radius: 10px;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.6;
        white-space: pre-wrap;
        word-break: break-word;
        max-height: 320px;
        overflow-y: auto;
      }

      .changelog-body-loading,
      .changelog-body-error {
        padding: 16px;
        text-align: center;
        color: var(--secondary-text-color);
        font-size: 13px;
      }

      .changelog-body-error {
        color: var(--error-color, #f44336);
      }

      .version-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-color);
        margin-top: 8px;
      }

      .version-badge ha-icon {
        --mdc-icon-size: 16px;
      }
    `],d([(0,s.MZ)({attribute:!1})],l.prototype,"hass",void 0),d([(0,s.wk)()],l.prototype,"_stats",void 0),d([(0,s.wk)()],l.prototype,"_statsLoading",void 0),d([(0,s.wk)()],l.prototype,"_statsError",void 0),d([(0,s.wk)()],l.prototype,"_changelogBody",void 0),d([(0,s.wk)()],l.prototype,"_changelogLoading",void 0),d([(0,s.wk)()],l.prototype,"_changelogError",void 0),d([(0,s.wk)()],l.prototype,"_changelogTitle",void 0),l=d([(0,s.EM)("hub-dashboard-tab")],l)},4541:(a,o,t)=>{t.d(o,{x:()=>r});const r="3.2.0-beta5"}}]);