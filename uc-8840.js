"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[8840],{8840:(o,t,r)=>{r.r(t),r.d(t,{HubColorsTab:()=>p});var e=r(5183),i=r(4276),s=r(9286);class a{constructor(){this._favorites=[],this._listeners=new Set,this._instanceId=`inst-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,this._isBroadcasting=!1,this._hass=null,this._haLoaded=!1,this._logged404=!1,this._loadFromStorage(),this._setupStorageListener()}getFavorites(){return[...this._favorites].sort(((o,t)=>o.order-t.order))}addFavorite(o,t){const r={id:this._generateId(),name:o.trim(),color:t,order:this._getNextOrder()};return this._favorites.push(r),this._saveToStorage(),this._notifyListeners(),this._broadcastChange(),this._syncToHAIfAvailable(),r}updateFavorite(o,t){var r;const e=this._favorites.findIndex((t=>t.id===o));return-1!==e&&(this._favorites[e]=Object.assign(Object.assign(Object.assign({},this._favorites[e]),t),{name:(null===(r=t.name)||void 0===r?void 0:r.trim())||this._favorites[e].name}),this._saveToStorage(),this._notifyListeners(),this._broadcastChange(),this._syncToHAIfAvailable(),!0)}deleteFavorite(o){const t=this._favorites.findIndex((t=>t.id===o));return-1!==t&&(this._favorites[t],this._favorites.splice(t,1),this._saveToStorage(),this._notifyListeners(),this._broadcastChange(),this._syncToHAIfAvailable(),!0)}reorderFavorites(o){const t=new Set(this._favorites.map((o=>o.id)));return!(!o.every((o=>t.has(o)))||o.length!==this._favorites.length||(o.forEach(((o,t)=>{const r=this._favorites.find((t=>t.id===o));r&&(r.order=t)})),this._saveToStorage(),this._notifyListeners(),this._broadcastChange(),this._syncToHAIfAvailable(),0))}importFromConfig(o){if(!Array.isArray(o)||0===o.length)return;const t=new Set(this._favorites.map((o=>o.color.toLowerCase())));o.forEach((o=>{var r,e;!t.has(o.color.toLowerCase())&&this._isValidColor(o.color)&&this._favorites.push({id:o.id||this._generateId(),name:(null===(r=o.name)||void 0===r?void 0:r.trim())||"Unnamed Color",color:o.color,order:null!==(e=o.order)&&void 0!==e?e:this._getNextOrder()})})),this._saveToStorage(),this._notifyListeners(),this._broadcastChange(),this._syncToHAIfAvailable()}exportForConfig(){return this.getFavorites()}hasColor(o){return this._favorites.some((t=>t.color.toLowerCase()===o.toLowerCase()))}refreshFromStorage(){this._loadFromStorage(),this._notifyListeners()}setHass(o){this._hass=null!=o?o:null,!this._haLoaded&&(null==o?void 0:o.callApi)&&this.loadFromHA(o).catch((()=>{}))}async loadFromHA(o){var t,r,e;if(null==o?void 0:o.callApi)try{const t=await o.callApi("GET","ultra_card_pro_cloud/favorite_colors");this._haLoaded=!0;const r=null==t?void 0:t.colors;if(Array.isArray(r)&&r.length>0){const o=r.filter((o=>this._isValidFavorite(o)));o.length>0&&(this._favorites=o,this._saveToStorage(),this._notifyListeners(),this._broadcastChange())}}catch(o){const i=null!==(r=null!==(t=null==o?void 0:o.status)&&void 0!==t?t:null==o?void 0:o.status_code)&&void 0!==r?r:null===(e=null==o?void 0:o.response)||void 0===e?void 0:e.status;if(404===i)return this._haLoaded=!0,void(this._logged404||(this._logged404=!0,console.info('Ultra Card: Favorite colors sync requires the "Ultra Card Pro Cloud" integration. Install it from HACS (Integration: Ultra Card Pro Cloud) to persist colors across devices and after logout.')));if(401===i||403===i)return this._haLoaded=!0,void console.debug("Failed to load favorite colors from HA (auth error):",o);console.debug("Failed to load favorite colors from HA (will retry):",o)}}async syncToHA(o){var t,r,e;if(null==o?void 0:o.callApi)try{await o.callApi("POST","ultra_card_pro_cloud/favorite_colors",{colors:this._favorites})}catch(o){const i=null!==(r=null!==(t=null==o?void 0:o.status)&&void 0!==t?t:null==o?void 0:o.status_code)&&void 0!==r?r:null===(e=null==o?void 0:o.response)||void 0===e?void 0:e.status;if(404===i&&!this._logged404)return this._logged404=!0,void console.info('Ultra Card: Favorite colors sync requires the "Ultra Card Pro Cloud" integration. Install it from HACS (Integration: Ultra Card Pro Cloud) to persist colors across devices and after logout.');404!==i&&console.debug("Failed to sync favorite colors to HA:",o)}}_syncToHAIfAvailable(){var o;(null===(o=this._hass)||void 0===o?void 0:o.callApi)&&this.syncToHA(this._hass).catch((()=>{}))}subscribe(o){this._listeners.add(o);const t=this.getFavorites();return o(t),()=>{this._listeners.delete(o)}}clearAll(){this._favorites=[],this._saveToStorage(),this._notifyListeners(),this._broadcastChange(),this._syncToHAIfAvailable()}testService(){console.log("UcFavoriteColorsService: Test method called"),console.log("Current favorites:",this._favorites),console.log("Number of listeners:",this._listeners.size);const o=this.addFavorite("Test Color","#ff0000");console.log("Test color added:",o);const t=this.getFavorites();console.log("All favorites after test add:",t)}debugFavoriteColors(){console.log("=== Ultra Card Favorite Colors Debug Info ==="),console.log("Storage Key:",a.STORAGE_KEY),console.log("Current Favorite Colors Count:",this._favorites.length),console.log("Listeners Count:",this._listeners.size),console.log("LocalStorage Available:",this._isLocalStorageAvailable());try{const o=(0,s.bi)(a.STORAGE_KEY);if(console.log("Raw Storage Data:",o?`${o.length} characters`:"null"),console.log("Storage Data Valid:",o?"Valid JSON":"No data"),o){const t=JSON.parse(o);console.log("Parsed Data Type:",Array.isArray(t)?"Array":typeof t),console.log("Parsed Data Length:",Array.isArray(t)?t.length:"N/A")}}catch(o){console.error("Storage Data Error:",o)}console.log("Favorite Colors List:",this._favorites.map((o=>({id:o.id,name:o.name,color:o.color,order:o.order})))),console.log("==========================================")}_loadFromStorage(){try{if(!this._isLocalStorageAvailable())return void(this._favorites=[]);const o=(0,s.bi)(a.STORAGE_KEY);if(o){const t=JSON.parse(o);Array.isArray(t)?this._favorites=t.filter(this._isValidFavorite.bind(this)):this._favorites=[]}else this._favorites=[]}catch(o){console.error("Failed to load favorite colors from storage:",o),this._favorites=[]}}_saveToStorage(){try{if(!this._isLocalStorageAvailable())return;const o=JSON.stringify(this._favorites);(0,s.FX)(a.STORAGE_KEY,o)}catch(o){console.error("Failed to save favorite colors to storage:",o),o instanceof DOMException&&o.code===DOMException.QUOTA_EXCEEDED_ERR?(console.error("localStorage quota exceeded! Consider clearing old data or using fewer favorite colors."),this._handleStorageQuotaExceeded()):console.error("Unknown storage error:",o)}}_setupStorageListener(){window.addEventListener("storage",(o=>{o.key===a.STORAGE_KEY&&(this._loadFromStorage(),this._notifyListeners())})),window.addEventListener(a.SYNC_EVENT,(o=>{var t;(null===(t=o.detail)||void 0===t?void 0:t.sourceInstance)===this._instanceId||this._isBroadcasting||(this._loadFromStorage(),this._notifyListeners())}))}_broadcastChange(){this._isBroadcasting=!0,window.dispatchEvent(new CustomEvent(a.SYNC_EVENT,{detail:{sourceInstance:this._instanceId}})),setTimeout((()=>{this._isBroadcasting=!1}),0)}_notifyListeners(){const o=this.getFavorites();this._listeners.forEach((t=>{try{t(o)}catch(o){console.warn("Error notifying favorite colors listener:",o)}}))}_generateId(){return`fav-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}_getNextOrder(){return 0===this._favorites.length?0:Math.max(...this._favorites.map((o=>o.order)))+1}_isValidFavorite(o){return o&&"string"==typeof o.id&&"string"==typeof o.name&&"string"==typeof o.color&&"number"==typeof o.order&&this._isValidColor(o.color)}_isValidColor(o){if(!o||"string"!=typeof o)return!1;const t=o.trim();if(0===t.length)return!1;if(t.toLowerCase().includes("gradient"))return/^(linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient|repeating-radial-gradient)\s*\(.*\)\s*$/i.test(t);if(t.startsWith("var("))return t.includes("--")&&t.endsWith(")");if([/^#([A-Fa-f0-9]{3,8})$/,/^rgb\s*\(/i,/^rgba\s*\(/i,/^hsl\s*\(/i,/^hsla\s*\(/i,/^hwb\s*\(/i,/^lab\s*\(/i,/^lch\s*\(/i,/^oklch\s*\(/i,/^oklab\s*\(/i,/^color\s*\(/i].some((o=>o.test(t))))return!0;const r=t.toLowerCase();return!!["transparent","currentcolor","inherit","initial","unset","red","blue","green","yellow","orange","purple","pink","brown","black","white","gray","grey","cyan","magenta","lime","navy","teal","silver","maroon","olive","aqua","fuchsia","coral","crimson","gold","indigo","ivory","khaki","lavender","plum","salmon","sienna","tan","tomato","turquoise","violet","wheat"].includes(r)||!!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(t)}_isLocalStorageAvailable(){try{const o="__ultra_card_colors_storage_test__";return(0,s.FX)(o,"test"),(0,s.Pw)(o),!0}catch(o){return!1}}_handleStorageQuotaExceeded(){if(console.log("Attempting to free up storage space by removing oldest favorite colors..."),this._favorites.length<=1)return void console.error("Cannot free up space - only one or no favorite colors exist");const o=Math.max(1,Math.floor(.25*this._favorites.length)),t=[...this._favorites].sort(((o,t)=>o.order-t.order)).slice(0,this._favorites.length-o);this._favorites=t,console.log(`Removed ${o} oldest favorite colors to free up storage space`);try{const o=JSON.stringify(this._favorites);(0,s.FX)(a.STORAGE_KEY,o),console.log("Successfully saved favorite colors after cleanup"),this._notifyListeners(),this._broadcastChange()}catch(o){console.error("Still cannot save after cleanup:",o)}}}a.STORAGE_KEY="ultra-card-favorite-colors",a.SYNC_EVENT="ultra-card-favorite-colors-changed";const n=new a;"undefined"!=typeof window&&(window.ucFavoriteColorsService=n,window.debugUltraCardFavoriteColors=()=>n.debugFavoriteColors());var l=r(9978),c=r(378),d=r(7568),h=function(o,t,r,e){var i,s=arguments.length,a=s<3?t:null===e?e=Object.getOwnPropertyDescriptor(t,r):e;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(o,t,r,e);else for(var n=o.length-1;n>=0;n--)(i=o[n])&&(a=(s<3?i(a):s>3?i(t,r,a):i(t,r))||a);return s>3&&a&&Object.defineProperty(t,r,a),a};let p=class extends e.WF{constructor(){super(...arguments),this._colors=[],this._toastMsg="",this._showAddForm=!1,this._newColorName="",this._newColorValue="#3498db",this._editingId=null,this._editName="",this._editColor="",this._cloudUser=null,this._syncStatus=null,this._syncing=!1}connectedCallback(){super.connectedCallback(),n.refreshFromStorage(),this.hass&&n.setHass(this.hass),this._colors=n.getFavorites(),this._unsub=n.subscribe((o=>{this._colors=o})),this._cloudUser=c.x.getCurrentUser(),this._syncStatus=d.Q.getSyncStatus(),this._authUnsub=o=>{this._cloudUser=o},c.x.addListener(this._authUnsub),this._syncUnsub=o=>{this._syncStatus=o},d.Q.addListener(this._syncUnsub)}updated(o){o.has("hass")&&this.hass&&n.setHass(this.hass)}disconnectedCallback(){var o;super.disconnectedCallback(),null===(o=this._unsub)||void 0===o||o.call(this),this._authUnsub&&c.x.removeListener(this._authUnsub),this._syncUnsub&&d.Q.removeListener(this._syncUnsub),this._toastTimer&&clearTimeout(this._toastTimer)}_goToAccount(){this.dispatchEvent(new CustomEvent("hub-navigate-tab",{detail:{tab:"account"},bubbles:!0,composed:!0}))}_formatSyncTime(o){if(!o)return"Never";try{const t=new Date(o),r=Math.floor((Date.now()-t.getTime())/6e4);if(r<1)return"Just now";if(r<60)return`${r}m ago`;const e=Math.floor(r/60);return e<24?`${e}h ago`:t.toLocaleDateString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch(o){return"Unknown"}}async _syncNow(){if(!this._syncing){this._syncing=!0;try{await d.Q.syncFavoriteColors(),this._showToast("Colors synced ✓")}catch(o){this._showToast("Sync failed — try again")}finally{this._syncing=!1}}}_renderSyncBanner(){var o;return this._cloudUser?e.qy`
      <div class="sync-banner sync-banner-active">
        <ha-icon icon=${this._syncing?"mdi:cloud-sync":"mdi:cloud-check"}></ha-icon>
        <div class="sync-banner-body">
          <strong>${this._syncing?"Syncing…":"Cloud Sync Active"}</strong>
          <span>Last synced: ${this._formatSyncTime(null===(o=this._syncStatus)||void 0===o?void 0:o.lastColorsSync)}</span>
        </div>
        <button class="sync-banner-btn" @click=${this._syncNow} ?disabled=${this._syncing}>
          ${this._syncing?"Syncing…":"Sync Now"}
        </button>
      </div>
    `:e.qy`
        <div class="sync-banner sync-banner-guest">
          <ha-icon icon="mdi:cloud-outline"></ha-icon>
          <div class="sync-banner-body">
            <strong>Back up & sync across all devices</strong>
            <span>Create a free account to keep your color palette available everywhere.</span>
          </div>
          <button class="sync-banner-btn" @click=${this._goToAccount}>Sign In</button>
        </div>
      `}_showToast(o){this._toastMsg=o,this._toastTimer&&clearTimeout(this._toastTimer),this._toastTimer=setTimeout((()=>this._toastMsg=""),2e3)}_copyColor(o){try{navigator.clipboard.writeText(o),this._showToast(`Copied ${o}`)}catch(o){}}_deleteColor(o){n.deleteFavorite(o.id),this._colors=n.getFavorites()}_addColor(){const o=this._newColorName.trim(),t=this._newColorValue.trim();o&&t&&(n.hasColor(t)?this._showToast("This color already exists"):(n.addFavorite(o,t),this._colors=n.getFavorites(),this._newColorName="",this._newColorValue="#3498db",this._showAddForm=!1,this._showToast(`Added "${o}"`)))}_startEdit(o){this._editingId=o.id,this._editName=o.name,this._editColor=o.color}_saveEdit(){this._editingId&&(n.updateFavorite(this._editingId,{name:this._editName,color:this._editColor}),this._colors=n.getFavorites(),this._editingId=null,this._showToast("Color updated"))}_cancelEdit(){this._editingId=null}_isLight(o){try{const t=o.replace("#","");if(t.length<6)return!0;const r=parseInt(t.substring(0,2),16);return(299*r+587*parseInt(t.substring(2,4),16)+114*parseInt(t.substring(4,6),16))/1e3>155}catch(o){return!1}}render(){if(0===this._colors.length&&!this._showAddForm)return e.qy`
        <div class="hub-tab-blurb">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <p><strong>Favorite colors</strong> appear in every Ultra Card color picker so you can reuse your palette. Add colors here or save them from any picker with the heart icon.</p>
        </div>
        ${this._renderSyncBanner()}
        <div class="empty-state">
          <div class="empty-state-icon">
            <ha-icon icon="mdi:palette-swatch-variant"></ha-icon>
          </div>
          <h3>No Saved Colors</h3>
          <p>Save your favorite colors here for quick access across all your cards.</p>
          <p class="empty-hint">Add colors below or use the heart icon in any card's color picker</p>
          <button class="add-btn" style="margin-top: 16px;" @click=${()=>this._showAddForm=!0}>
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Color
          </button>
        </div>
      `;const o=this._newColorValue&&n.hasColor(this._newColorValue);return e.qy`
      <div class="hub-tab-blurb">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <p><strong>Favorite colors</strong> appear in every Ultra Card color picker so you can reuse your palette. Add colors here or save them from any picker with the heart icon.</p>
      </div>
      ${this._renderSyncBanner()}
      <div class="colors-header">
        <span class="colors-count">
          <strong>${this._colors.length}</strong> saved color${1!==this._colors.length?"s":""}
        </span>
        <button class="add-btn" @click=${()=>this._showAddForm=!this._showAddForm}>
          <ha-icon icon=${this._showAddForm?"mdi:close":"mdi:plus"}></ha-icon>
          ${this._showAddForm?"Cancel":"Add Color"}
        </button>
      </div>

      ${this._showAddForm?e.qy`
            <div class="add-form">
              <h3><ha-icon icon="mdi:palette-swatch"></ha-icon> Add New Color</h3>

              <div class="form-row">
                <span class="form-label">Color</span>
                <div class="color-input-group">
                  <input
                    type="color"
                    class="color-picker-input"
                    .value=${this._newColorValue}
                    @input=${o=>this._newColorValue=o.target.value}
                  />
                  <input
                    type="text"
                    class="form-input"
                    placeholder="#3498db or rgb(52, 152, 219)"
                    .value=${this._newColorValue}
                    @input=${o=>this._newColorValue=o.target.value}
                  />
                  <div class="color-preview-large" style="background: ${this._newColorValue}"></div>
                </div>
              </div>

              <div class="form-row">
                <span class="form-label">Name</span>
                <input
                  type="text"
                  class="form-input"
                  placeholder="e.g. Ocean Blue"
                  .value=${this._newColorName}
                  @input=${o=>this._newColorName=o.target.value}
                  @keydown=${o=>"Enter"===o.key&&this._addColor()}
                />
              </div>

              ${o?e.qy`
                    <div class="duplicate-warning">
                      <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                      This color value already exists in your favorites.
                    </div>
                  `:""}

              <div class="form-actions">
                <button class="form-btn secondary" @click=${()=>this._showAddForm=!1}>
                  Cancel
                </button>
                <button
                  class="form-btn primary"
                  ?disabled=${!this._newColorName.trim()||!this._newColorValue.trim()||!!o}
                  @click=${this._addColor}
                >
                  <ha-icon icon="mdi:check"></ha-icon>
                  Add Color
                </button>
              </div>
            </div>
          `:""}

      <!-- Color cards -->
      <div class="colors-grid">
        ${this._colors.map((o=>this._renderColorCard(o)))}
      </div>

      <div class="toast ${this._toastMsg?"show":""}">${this._toastMsg}</div>
    `}_renderColorCard(o){const t=this._editingId===o.id;return e.qy`
      <div class="color-card ${t?"editing":""}">
        <div
          class="color-swatch-area"
          style="background: ${t?this._editColor:o.color}"
          @click=${()=>this._copyColor(o.color)}
          title="Click to copy"
        >
          <div class="swatch-overlay">
            <ha-icon icon="mdi:content-copy" @click=${t=>{t.stopPropagation(),this._copyColor(o.color)}}></ha-icon>
            <ha-icon icon="mdi:pencil" @click=${t=>{t.stopPropagation(),this._startEdit(o)}}></ha-icon>
          </div>
        </div>

        ${t?e.qy`
              <div class="edit-inline">
                <div class="edit-row">
                  <input
                    type="color"
                    class="edit-color-input"
                    .value=${this._editColor}
                    @input=${o=>this._editColor=o.target.value}
                  />
                  <input
                    type="text"
                    class="edit-input"
                    .value=${this._editColor}
                    @input=${o=>this._editColor=o.target.value}
                  />
                </div>
                <div class="edit-row">
                  <input
                    type="text"
                    class="edit-input"
                    .value=${this._editName}
                    placeholder="Color name"
                    @input=${o=>this._editName=o.target.value}
                    @keydown=${o=>"Enter"===o.key&&this._saveEdit()}
                  />
                  <div class="edit-actions">
                    <button class="action-btn" title="Save" @click=${this._saveEdit}>
                      <ha-icon icon="mdi:check"></ha-icon>
                    </button>
                    <button class="action-btn" title="Cancel" @click=${this._cancelEdit}>
                      <ha-icon icon="mdi:close"></ha-icon>
                    </button>
                  </div>
                </div>
              </div>
            `:e.qy`
              <div class="color-info">
                <div class="color-details">
                  <div class="color-name">${o.name}</div>
                  <div class="color-value">${o.color}</div>
                </div>
                <div class="color-actions">
                  <button class="action-btn" title="Edit" @click=${()=>this._startEdit(o)}>
                    <ha-icon icon="mdi:pencil"></ha-icon>
                  </button>
                  <button class="action-btn delete" title="Remove" @click=${()=>this._deleteColor(o)}>
                    <ha-icon icon="mdi:delete-outline"></ha-icon>
                  </button>
                </div>
              </div>
            `}
      </div>
    `}};p.styles=[l.z,e.AH`
      :host {
        display: block;
        animation: fadeSlideIn 0.3s ease-out;
      }

      .colors-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }

      .colors-count {
        font-size: 13px;
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      .colors-count strong {
        color: var(--primary-text-color);
      }

      .add-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .add-btn:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(var(--rgb-primary-color, 3, 169, 244), 0.3);
      }

      .add-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      /* Add color form */
      .add-form {
        background: var(--ha-card-background, var(--card-background-color));
        border: 2px solid var(--primary-color);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 24px;
        animation: fadeSlideIn 0.2s ease-out;
      }

      .add-form h3 {
        margin: 0 0 20px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .add-form h3 ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      .form-row {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
      }

      .form-row:last-of-type {
        margin-bottom: 20px;
      }

      .form-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--secondary-text-color);
        min-width: 60px;
      }

      .form-input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 8px;
        background: var(--primary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }

      .form-input:focus {
        border-color: var(--primary-color);
      }

      .color-input-group {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .color-picker-input {
        width: 48px;
        height: 48px;
        border: 2px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 12px;
        cursor: pointer;
        padding: 2px;
        background: var(--primary-background-color);
        transition: border-color 0.2s;
      }

      .color-picker-input:hover {
        border-color: var(--primary-color);
      }

      .color-preview-large {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        border: 2px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        flex-shrink: 0;
      }

      .form-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }

      .form-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 20px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: all 0.2s ease;
      }

      .form-btn.primary {
        background: var(--primary-color);
        color: white;
      }

      .form-btn.primary:hover:not(:disabled) {
        filter: brightness(1.1);
      }

      .form-btn.primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .form-btn.secondary {
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .form-btn.secondary:hover {
        border-color: var(--primary-color);
      }

      .form-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      /* Duplicate warning */
      .duplicate-warning {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: rgba(255, 152, 0, 0.1);
        border: 1px solid rgba(255, 152, 0, 0.3);
        border-radius: 8px;
        margin-bottom: 16px;
        font-size: 12px;
        color: #f57c00;
      }

      .duplicate-warning ha-icon {
        --mdc-icon-size: 16px;
        flex-shrink: 0;
      }

      /* Color grid */
      .colors-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
      }

      @media (max-width: 600px) {
        .colors-grid {
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }
      }

      .color-card {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 16px;
        overflow: hidden;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
      }

      .color-card:hover {
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
        transform: translateY(-3px);
      }

      .color-card.editing {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
      }

      .color-swatch-area {
        width: 100%;
        height: 100px;
        position: relative;
        cursor: pointer;
        transition: height 0.2s ease;
      }

      .color-card:hover .color-swatch-area {
        height: 108px;
      }

      .swatch-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 8px 12px;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.4));
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        opacity: 0;
        transition: opacity 0.2s;
      }

      .color-card:hover .swatch-overlay {
        opacity: 1;
      }

      .swatch-overlay ha-icon {
        --mdc-icon-size: 18px;
        color: white;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
        cursor: pointer;
      }

      .color-info {
        padding: 12px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .color-details {
        flex: 1;
        min-width: 0;
      }

      .color-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-bottom: 2px;
      }

      .color-value {
        font-size: 12px;
        font-family: 'SF Mono', 'Fira Code', monospace;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .color-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }

      /* Edit inline form within card */
      .edit-inline {
        padding: 12px 14px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
        overflow: visible;
      }

      .edit-row {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 8px;
      }

      .edit-row:last-child {
        margin-bottom: 0;
      }

      .edit-input {
        flex: 1;
        min-width: 0;
        padding: 6px 10px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 6px;
        background: var(--primary-background-color);
        color: var(--primary-text-color);
        font-size: 13px;
        outline: none;
        box-sizing: border-box;
      }

      .edit-input:focus {
        border-color: var(--primary-color);
      }

      .edit-color-input {
        width: 32px;
        height: 32px;
        min-width: 32px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        cursor: pointer;
        padding: 1px;
        flex-shrink: 0;
      }

      .edit-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
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
      .sync-banner ha-icon { --mdc-icon-size: 20px; flex-shrink: 0; }
      .sync-banner-guest {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
      }
      .sync-banner-guest ha-icon { color: var(--primary-color); }
      .sync-banner-active {
        background: rgba(var(--rgb-accent-color, 0, 150, 136), 0.07);
        border: 1px solid rgba(var(--rgb-accent-color, 0, 150, 136), 0.18);
      }
      .sync-banner-active ha-icon { color: var(--success-color, #4caf50); }
      .sync-banner-body { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
      .sync-banner-body strong { font-weight: 600; color: var(--primary-text-color); }
      .sync-banner-body span { color: var(--secondary-text-color); font-size: 12px; }
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
      .sync-banner-btn:hover:not(:disabled) { background: var(--primary-color); color: white; }
      .sync-banner-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `],h([(0,i.MZ)({attribute:!1})],p.prototype,"hass",void 0),h([(0,i.wk)()],p.prototype,"_colors",void 0),h([(0,i.wk)()],p.prototype,"_toastMsg",void 0),h([(0,i.wk)()],p.prototype,"_showAddForm",void 0),h([(0,i.wk)()],p.prototype,"_newColorName",void 0),h([(0,i.wk)()],p.prototype,"_newColorValue",void 0),h([(0,i.wk)()],p.prototype,"_editingId",void 0),h([(0,i.wk)()],p.prototype,"_editName",void 0),h([(0,i.wk)()],p.prototype,"_editColor",void 0),h([(0,i.wk)()],p.prototype,"_cloudUser",void 0),h([(0,i.wk)()],p.prototype,"_syncStatus",void 0),h([(0,i.wk)()],p.prototype,"_syncing",void 0),p=h([(0,i.EM)("hub-colors-tab")],p)}}]);