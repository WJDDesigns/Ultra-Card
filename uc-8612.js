"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[8612],{8612:(t,e,o)=>{o.r(e),o.d(e,{HubFavoritesTab:()=>v});var r=o(5183),a=o(4276),i=o(9286);class s{constructor(){this._favorites=[],this._listeners=new Set,this._loadFromStorage(),this._setupStorageListener()}getFavorites(){return[...this._favorites].sort(((t,e)=>new Date(e.created).getTime()-new Date(t.created).getTime()))}addFavorite(t,e,o,r=[]){const a=this._cloneRowWithNewIds(t),i={id:this._generateId(),name:e.trim(),description:null==o?void 0:o.trim(),row:a,created:(new Date).toISOString(),tags:r.map((t=>t.trim().toLowerCase())).filter(Boolean)};return this._favorites.push(i),this._saveToStorage(),this._notifyListeners(),this._broadcastChange(),i}removeFavorite(t){const e=this._favorites.findIndex((e=>e.id===t));return-1!==e&&(this._favorites[e],this._favorites.splice(e,1),this._saveToStorage(),this._notifyListeners(),this._broadcastChange(),!0)}updateFavorite(t,e){const o=this._favorites.findIndex((e=>e.id===t));return-1!==o&&(this._favorites[o]=Object.assign(Object.assign({},this._favorites[o]),e),this._saveToStorage(),this._notifyListeners(),this._broadcastChange(),!0)}getFavorite(t){return this._favorites.find((e=>e.id===t))}searchFavorites(t){const e=t.toLowerCase().trim();return e?this._favorites.filter((t=>{var o;return t.name.toLowerCase().includes(e)||(null===(o=t.description)||void 0===o?void 0:o.toLowerCase().includes(e))||t.tags.some((t=>t.includes(e)))})):this.getFavorites()}subscribe(t){return this._listeners.add(t),()=>this._listeners.delete(t)}debugFavorites(){console.log("=== Ultra Card Favorites Debug Info ==="),console.log("Storage Key:",s.STORAGE_KEY),console.log("Current Favorites Count:",this._favorites.length),console.log("Listeners Count:",this._listeners.size),console.log("LocalStorage Available:",this._isLocalStorageAvailable());try{const t=(0,i.bi)(s.STORAGE_KEY);if(console.log("Raw Storage Data:",t?`${t.length} characters`:"null"),console.log("Storage Data Valid:",t?"Valid JSON":"No data"),t){const e=JSON.parse(t);console.log("Parsed Data Type:",Array.isArray(e)?"Array":typeof e),console.log("Parsed Data Length:",Array.isArray(e)?e.length:"N/A")}}catch(t){console.error("Storage Data Error:",t)}console.log("Favorites List:",this._favorites.map((t=>({id:t.id,name:t.name,created:t.created,tags:t.tags.length})))),console.log("=====================================")}_cloneRowWithNewIds(t){const e=JSON.parse(JSON.stringify(t));return e.id=`row-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,e.columns=e.columns.map(((t,e)=>Object.assign(Object.assign({},t),{id:`col-${Date.now()}-${e}-${Math.random().toString(36).substr(2,9)}`,modules:t.modules.map(((t,e)=>Object.assign(Object.assign({},t),{id:`${t.type}-${Date.now()}-${e}-${Math.random().toString(36).substr(2,9)}`})))}))),e}_generateId(){return`favorite-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}_loadFromStorage(){try{if(!this._isLocalStorageAvailable())return void(this._favorites=[]);const t=(0,i.bi)(s.STORAGE_KEY);if(t){const e=JSON.parse(t);Array.isArray(e)?this._favorites=e.filter(this._isValidFavorite.bind(this)):this._favorites=[]}else this._favorites=[]}catch(t){console.error("Failed to load favorites from storage:",t),this._favorites=[]}}_saveToStorage(){try{if(!this._isLocalStorageAvailable())return;const t=JSON.stringify(this._favorites);(0,i.FX)(s.STORAGE_KEY,t)}catch(t){console.error("Failed to save favorites to storage:",t),t instanceof DOMException&&t.code===DOMException.QUOTA_EXCEEDED_ERR?(console.error("localStorage quota exceeded! Consider clearing old data or using fewer favorites."),this._handleStorageQuotaExceeded()):console.error("Unknown storage error:",t)}}_setupStorageListener(){window.addEventListener("storage",(t=>{t.key===s.STORAGE_KEY&&(this._loadFromStorage(),this._notifyListeners())})),window.addEventListener(s.SYNC_EVENT,(()=>{this._loadFromStorage(),this._notifyListeners()}))}_notifyListeners(){this._listeners.forEach((t=>t(this.getFavorites())))}_broadcastChange(){window.dispatchEvent(new CustomEvent(s.SYNC_EVENT))}_isValidFavorite(t){return t&&"string"==typeof t.id&&"string"==typeof t.name&&"string"==typeof t.created&&t.row&&"string"==typeof t.row.id&&Array.isArray(t.row.columns)}_isLocalStorageAvailable(){try{const t="__ultra_card_storage_test__";return(0,i.FX)(t,"test"),(0,i.Pw)(t),!0}catch(t){return!1}}_handleStorageQuotaExceeded(){if(console.log("Attempting to free up storage space by removing oldest favorites..."),this._favorites.length<=1)return void console.error("Cannot free up space - only one or no favorites exist");const t=Math.max(1,Math.floor(.25*this._favorites.length)),e=[...this._favorites].sort(((t,e)=>new Date(t.created).getTime()-new Date(e.created).getTime())).slice(t);this._favorites=e,console.log(`Removed ${t} oldest favorites to free up storage space`);try{const t=JSON.stringify(this._favorites);(0,i.FX)(s.STORAGE_KEY,t),console.log("Successfully saved favorites after cleanup"),this._notifyListeners(),this._broadcastChange()}catch(t){console.error("Still cannot save after cleanup:",t)}}}s.STORAGE_KEY="ultra-card-favorites",s.SYNC_EVENT="ultra-card-favorites-changed";const n=new s;"undefined"!=typeof window&&(window.debugUltraCardFavorites=()=>n.debugFavorites());var c=o(9978),l=o(378),d=o(7568),h=function(t,e,o,r){var a,i=arguments.length,s=i<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,r);else for(var n=t.length-1;n>=0;n--)(a=t[n])&&(s=(i<3?a(s):i>3?a(e,o,s):a(e,o))||s);return i>3&&s&&Object.defineProperty(e,o,s),s};let v=class extends r.WF{constructor(){super(...arguments),this._favorites=[],this._toastMsg="",this._search="",this._cloudUser=null,this._syncStatus=null,this._syncing=!1}connectedCallback(){super.connectedCallback(),this._favorites=n.getFavorites(),this._unsub=n.subscribe((t=>{this._favorites=t})),this._cloudUser=l.x.getCurrentUser(),this._syncStatus=d.Q.getSyncStatus(),this._authUnsub=t=>{this._cloudUser=t},l.x.addListener(this._authUnsub),this._syncUnsub=t=>{this._syncStatus=t},d.Q.addListener(this._syncUnsub)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._unsub)||void 0===t||t.call(this),this._authUnsub&&l.x.removeListener(this._authUnsub),this._syncUnsub&&d.Q.removeListener(this._syncUnsub),this._toastTimer&&clearTimeout(this._toastTimer)}_showToast(t){this._toastMsg=t,this._toastTimer&&clearTimeout(this._toastTimer),this._toastTimer=setTimeout((()=>this._toastMsg=""),2e3)}_copyRowConfig(t){try{navigator.clipboard.writeText(JSON.stringify(t.row)),this._showToast(`Copied "${t.name}"`)}catch(t){}}_removeFavorite(t){n.removeFavorite(t.id)&&(this._favorites=n.getFavorites())}_formatDate(t){if(!t)return"";try{return new Date(t).toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"})}catch(t){return""}}_goToAccount(){this.dispatchEvent(new CustomEvent("hub-navigate-tab",{detail:{tab:"account"},bubbles:!0,composed:!0}))}_formatSyncTime(t){if(!t)return"Never";try{const e=new Date(t),o=(new Date).getTime()-e.getTime(),r=Math.floor(o/6e4);if(r<1)return"Just now";if(r<60)return`${r}m ago`;const a=Math.floor(r/60);return a<24?`${a}h ago`:e.toLocaleDateString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch(t){return"Unknown"}}async _syncNow(){if(!this._syncing){this._syncing=!0;try{await d.Q.syncFavorites(),this._showToast("Favorites synced ✓")}catch(t){this._showToast("Sync failed — try again")}finally{this._syncing=!1}}}_renderSyncBanner(){var t;if(!this._cloudUser)return r.qy`
        <div class="sync-banner sync-banner-guest">
          <ha-icon icon="mdi:cloud-outline"></ha-icon>
          <div class="sync-banner-body">
            <strong>Back up & sync across all devices</strong>
            <span>Create a free account to keep your favorites safe and available on every device.</span>
          </div>
          <button class="sync-banner-btn" @click=${this._goToAccount}>Sign In</button>
        </div>
      `;const e=null===(t=this._syncStatus)||void 0===t?void 0:t.lastFavoritesSync;return r.qy`
      <div class="sync-banner sync-banner-active">
        <ha-icon icon=${this._syncing?"mdi:cloud-sync":"mdi:cloud-check"}></ha-icon>
        <div class="sync-banner-body">
          <strong>${this._syncing?"Syncing…":"Cloud Sync Active"}</strong>
          <span>Last synced: ${this._formatSyncTime(e)}</span>
        </div>
        <button class="sync-banner-btn" @click=${this._syncNow} ?disabled=${this._syncing}>
          ${this._syncing?"Syncing…":"Sync Now"}
        </button>
      </div>
    `}_getFilteredFavorites(){if(!this._search.trim())return this._favorites;const t=this._search.toLowerCase().trim();return this._favorites.filter((e=>e.name.toLowerCase().includes(t)||(e.description||"").toLowerCase().includes(t)||(e.tags||[]).some((e=>e.toLowerCase().includes(t)))))}render(){if(0===this._favorites.length)return r.qy`
        <div class="hub-tab-blurb">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <p><strong>Favorites</strong> are saved layout rows you can reuse. Save a row from the card editor (heart icon), then add it to any card from here.</p>
        </div>
        ${this._renderSyncBanner()}
        <div class="empty-state">
          <div class="empty-state-icon">
            <ha-icon icon="mdi:heart-outline"></ha-icon>
          </div>
          <h3>No Favorites Yet</h3>
          <p>Save rows from the card editor to see them here.</p>
          <p class="empty-hint">Tip: Click the heart icon on any row in the editor to save it as a favorite</p>
        </div>
      `;const t=this._getFilteredFavorites();return r.qy`
      <div class="hub-tab-blurb">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <p><strong>Favorites</strong> are saved layout rows you can reuse. Save a row from the card editor (heart icon), then add it to any card from here.</p>
      </div>
      ${this._renderSyncBanner()}
      <!-- Toolbar -->
      <div class="favorites-toolbar">
        ${this._favorites.length>3?r.qy`
              <div class="search-box">
                <ha-icon icon="mdi:magnify"></ha-icon>
                <input
                  type="text"
                  placeholder="Search favorites…"
                  .value=${this._search}
                  @input=${t=>this._search=t.target.value}
                />
              </div>
            `:""}
        <span class="favorites-count">
          <strong>${t.length}</strong> favorite${1!==t.length?"s":""}
        </span>
      </div>

      ${0===t.length?r.qy`
            <div class="empty-state">
              <div class="empty-state-icon">
                <ha-icon icon="mdi:magnify-close"></ha-icon>
              </div>
              <h3>No Results</h3>
              <p>No favorites match "${this._search}"</p>
            </div>
          `:r.qy`
            <div class="favorites-grid">
              ${t.map((t=>this._renderFavoriteCard(t)))}
            </div>
          `}

      <div class="toast ${this._toastMsg?"show":""}">${this._toastMsg}</div>
    `}_renderFavoriteCard(t){var e,o,a;const i=null!==(a=null===(o=null===(e=t.row)||void 0===e?void 0:e.columns)||void 0===o?void 0:o.length)&&void 0!==a?a:0,s=this._formatDate(t.created||t.date);return r.qy`
      <div class="favorite-card">
        <div class="fav-header">
          <div class="fav-icon-wrap">
            <ha-icon icon="mdi:heart"></ha-icon>
          </div>
          <div class="fav-title-area">
            <h4 class="fav-name">${t.name}</h4>
            <p class="fav-subtitle">${i} column${1!==i?"s":""}</p>
          </div>
          <div class="fav-actions">
            <button class="action-btn" title="Copy config" @click=${()=>this._copyRowConfig(t)}>
              <ha-icon icon="mdi:content-copy"></ha-icon>
            </button>
            <button class="action-btn delete" title="Remove" @click=${()=>this._removeFavorite(t)}>
              <ha-icon icon="mdi:delete-outline"></ha-icon>
            </button>
          </div>
        </div>

        ${t.description||t.tags&&t.tags.length?r.qy`
              <div class="fav-body">
                ${t.description?r.qy`<p class="fav-description">${t.description}</p>`:""}
                ${t.tags&&t.tags.length?r.qy`
                      <div class="fav-tags">
                        ${t.tags.slice(0,5).map((t=>r.qy`<span class="fav-tag">${t}</span>`))}
                      </div>
                    `:""}
              </div>
            `:""}

        <div class="fav-footer">
          <div class="fav-meta">
            ${s?r.qy`
                  <span class="meta-item">
                    <ha-icon icon="mdi:calendar-outline"></ha-icon>
                    ${s}
                  </span>
                `:""}
            <span class="meta-item">
              <ha-icon icon="mdi:view-column-outline"></ha-icon>
              ${i} col${1!==i?"s":""}
            </span>
          </div>
          <button class="copy-config-btn" @click=${()=>this._copyRowConfig(t)}>
            <ha-icon icon="mdi:code-json"></ha-icon>
            Copy Config
          </button>
        </div>
      </div>
    `}};v.styles=[c.z,r.AH`
      :host {
        display: block;
        animation: fadeSlideIn 0.3s ease-out;
      }

      /* Toolbar */
      .favorites-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 20px;
      }

      .search-box {
        flex: 1;
        min-width: 180px;
        max-width: 320px;
        position: relative;
      }

      .search-box input {
        width: 100%;
        padding: 10px 16px 10px 40px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 10px;
        background: var(--ha-card-background, var(--card-background-color));
        color: var(--primary-text-color);
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }

      .search-box input:focus {
        border-color: var(--primary-color);
      }

      .search-box ha-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        --mdc-icon-size: 20px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }

      .favorites-count {
        font-size: 13px;
        color: var(--secondary-text-color);
        font-weight: 500;
        white-space: nowrap;
      }

      .favorites-count strong {
        color: var(--primary-text-color);
      }

      /* Favorites grid — matching editor layout */
      .favorites-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
      }

      @media (max-width: 600px) {
        .favorites-grid {
          grid-template-columns: 1fr;
        }
      }

      /* Favorite card — matches editor */
      .favorite-card {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
      }

      .favorite-card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
        border-color: var(--primary-color);
      }

      /* Card header */
      .fav-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 16px 12px;
      }

      .fav-icon-wrap {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color, var(--primary-color)));
      }

      .fav-icon-wrap ha-icon {
        --mdc-icon-size: 22px;
        color: white;
      }

      .fav-title-area {
        flex: 1;
        min-width: 0;
      }

      .fav-name {
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .fav-subtitle {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 2px 0 0;
      }

      .fav-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }

      /* Card body */
      .fav-body {
        padding: 0 16px 12px;
      }

      .fav-description {
        margin: 0 0 10px;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      /* Tags */
      .fav-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 10px;
      }

      .fav-tag {
        display: inline-flex;
        align-items: center;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        color: var(--primary-color);
      }

      /* Footer meta */
      .fav-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 16px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.04));
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.01);
      }

      .fav-meta {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .fav-meta .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .fav-meta ha-icon {
        --mdc-icon-size: 14px;
        opacity: 0.6;
      }

      /* Copy config button */
      .copy-config-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: none;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 8px;
        color: var(--secondary-text-color);
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .copy-config-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.05);
      }

      .copy-config-btn ha-icon {
        --mdc-icon-size: 14px;
      }

      /* Sync Banner */
      .sync-banner {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        border-radius: 10px;
        margin-bottom: 16px;
        font-size: 13px;
      }

      .sync-banner ha-icon {
        --mdc-icon-size: 20px;
        flex-shrink: 0;
      }

      .sync-banner-guest {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
      }

      .sync-banner-guest ha-icon {
        color: var(--primary-color);
      }

      .sync-banner-active {
        background: rgba(var(--rgb-accent-color, 0, 150, 136), 0.07);
        border: 1px solid rgba(var(--rgb-accent-color, 0, 150, 136), 0.18);
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
      }

      .sync-banner-btn {
        flex-shrink: 0;
        padding: 5px 12px;
        border-radius: 6px;
        border: 1px solid var(--primary-color);
        background: none;
        color: var(--primary-color);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
        white-space: nowrap;
      }

      .sync-banner-btn:hover:not(:disabled) {
        background: var(--primary-color);
        color: white;
      }

      .sync-banner-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `],h([(0,a.wk)()],v.prototype,"_favorites",void 0),h([(0,a.wk)()],v.prototype,"_toastMsg",void 0),h([(0,a.wk)()],v.prototype,"_search",void 0),h([(0,a.wk)()],v.prototype,"_cloudUser",void 0),h([(0,a.wk)()],v.prototype,"_syncStatus",void 0),h([(0,a.wk)()],v.prototype,"_syncing",void 0),v=h([(0,a.EM)("hub-favorites-tab")],v)}}]);