"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[1154],{1154:(e,t,a)=>{a.r(t),a.d(t,{HubVariablesTab:()=>p});var r=a(5183),i=a(4276);class s{constructor(){this._variables=[],this._listeners=new Set,this._backupVersion=0,this._loadFromStorage(),this._setupStorageListener()}getVariables(){return[...this._variables].filter((e=>!1!==e.isGlobal)).sort(((e,t)=>e.order-t.order))}getVariablesForCard(e){return[...this.getVariables(),...((null==e?void 0:e._customVariables)||[]).filter((e=>!0!==e.isGlobal)).sort(((e,t)=>e.order-t.order))]}getCardSpecificVariables(e){return((null==e?void 0:e._customVariables)||[]).filter((e=>!0!==e.isGlobal)).sort(((e,t)=>e.order-t.order))}getVariableByName(e){return this._variables.find((t=>t.name.toLowerCase()===e.toLowerCase()&&!1!==t.isGlobal))}getVariableByNameInContext(e,t){return((null==t?void 0:t._customVariables)||[]).find((t=>t.name.toLowerCase()===e.toLowerCase()&&!0!==t.isGlobal))||this.getVariableByName(e)}addVariable(e,t,a="state",r=!0,i,s=[]){const o=this._sanitizeVariableName(e);if(!o)return console.error("Invalid variable name. Use only letters, numbers, and underscores."),null;if(this._variables.some((e=>e.name.toLowerCase()===o.toLowerCase())))return console.error(`Variable with name "${o}" already exists as a global variable.`),null;if(s.some((e=>e.name.toLowerCase()===o.toLowerCase())))return console.error(`Variable with name "${o}" already exists as a card-specific variable.`),null;const n={id:this._generateId(),name:o,entity:t,value_type:a,attribute_name:"attribute"===a?i:void 0,order:this._getNextOrder(),created:(new Date).toISOString(),isGlobal:r};this._variables.push(n);const l=this._saveToStorage();return this._notifyListeners(),l&&this._broadcastChange(),n}createCardVariable(e,t,a="state",r=[],i){const s=this._sanitizeVariableName(e);if(!s)return console.error("Invalid variable name. Use only letters, numbers, and underscores."),null;if(r.some((e=>e.name.toLowerCase()===s.toLowerCase())))return console.error(`Variable with name "${s}" already exists in this card.`),null;if(this._variables.some((e=>e.name.toLowerCase()===s.toLowerCase())))return console.error(`Variable with name "${s}" already exists as a global variable.`),null;const o=r.length>0?Math.max(...r.map((e=>e.order)))+1:0;return{id:this._generateId(),name:s,entity:t,value_type:a,attribute_name:"attribute"===a?i:void 0,order:o,created:(new Date).toISOString(),isGlobal:!1}}updateVariable(e,t,a=[]){const r=this._variables.findIndex((t=>t.id===e));if(-1===r)return!1;if(t.name){const r=this._sanitizeVariableName(t.name);if(!r)return console.error("Invalid variable name. Use only letters, numbers, and underscores."),!1;if(this._variables.some((t=>t.id!==e&&t.name.toLowerCase()===r.toLowerCase())))return console.error(`Variable with name "${r}" already exists as a global variable.`),!1;if(a.some((e=>e.name.toLowerCase()===r.toLowerCase())))return console.error(`Variable with name "${r}" already exists as a card-specific variable.`),!1;t.name=r}this._variables[r]=Object.assign(Object.assign({},this._variables[r]),t);const i=this._saveToStorage();return this._notifyListeners(),i&&this._broadcastChange(),!0}deleteVariable(e){const t=this._variables.findIndex((t=>t.id===e));if(-1===t)return!1;this._variables.splice(t,1);const a=this._saveToStorage();return this._notifyListeners(),a&&this._broadcastChange(),!0}reorderVariables(e){const t=new Set(this._variables.map((e=>e.id)));if(!e.every((e=>t.has(e)))||e.length!==this._variables.length)return!1;e.forEach(((e,t)=>{const a=this._variables.find((t=>t.id===e));a&&(a.order=t)}));const a=this._saveToStorage();return this._notifyListeners(),a&&this._broadcastChange(),!0}resolveVariable(e,t){const a=this.getVariableByName(e);return this._resolveVariableValue(a,t)}resolveVariableInContext(e,t,a){const r=this.getVariableByNameInContext(e,a);return this._resolveVariableValue(r,t)}_resolveVariableValue(e,t){if(!e)return null;switch(e.value_type){case"entity_id":default:return e.entity;case"state":return`states('${e.entity}')`;case"attribute":return e.attribute_name?`state_attr('${e.entity}', '${e.attribute_name}')`:e.entity}}resolveEntityField(e,t){if(!e)return e;if(e.startsWith("$")){const a=e.substring(1),r=this.getVariableByNameInContext(a,t);return r?r.entity:void 0}return e}isVariableReference(e){return!!e&&e.startsWith("$")}getVariableInfo(e,t){if(!e||!e.startsWith("$"))return{isVariable:!1};const a=e.substring(1),r=this.getVariableByNameInContext(a,t);return{isVariable:!0,variableName:e,resolvedEntity:null==r?void 0:r.entity,variable:r}}getVariableNames(){return this._variables.filter((e=>!1!==e.isGlobal)).map((e=>e.name))}getVariableNamesInContext(e){return[...this.getVariableNames(),...((null==e?void 0:e._customVariables)||[]).filter((e=>!0!==e.isGlobal)).map((e=>e.name))]}resolveConfigVariables(e){return this._deepResolveVariables(e,e)}resolveModuleVariables(e,t){return this._deepResolveVariables(e,t||{})}_deepResolveVariables(e,t){if(null==e)return e;if("string"==typeof e)return e.startsWith("$")&&this.resolveEntityField(e,t)||e;if(Array.isArray(e))return e.map((e=>this._deepResolveVariables(e,t)));if("object"==typeof e){const a={};for(const r of Object.keys(e)){const i=e[r];this._isEntityFieldKey(r)&&"string"==typeof i&&i.startsWith("$")?a[r]=this.resolveEntityField(i,t)||i:a[r]=this._deepResolveVariables(i,t)}return a}return e}_isEntityFieldKey(e){return["entity","entity_id","entities","camera_entity","media_player","target_entity","source_entity","destination_entity"].includes(e)||e.endsWith("_entity")||e.endsWith("_entity_id")}subscribe(e){this._listeners.add(e);const t=this.getVariables();return e(t),()=>{this._listeners.delete(e)}}clearAll(){this._variables=[],this._saveToStorage(),this._notifyListeners(),this._broadcastChange()}importVariables(e,t=!0,a=[]){const r={imported:0,skipped:[]};if(!Array.isArray(e)||0===e.length)return r;if(t){const t=new Set(this._variables.map((e=>e.name.toLowerCase()))),i=new Set(a.map((e=>e.name.toLowerCase())));e.forEach((e=>{const a=(null==e?void 0:e.name)||"unknown";if(!this._isValidVariable(e))return void r.skipped.push({name:a,reason:"invalid"});const s=e.name.toLowerCase();t.has(s)?r.skipped.push({name:e.name,reason:"global-exists"}):i.has(s)?r.skipped.push({name:e.name,reason:"card-conflict"}):(this._variables.push(Object.assign(Object.assign({},e),{id:e.id||this._generateId(),order:this._getNextOrder()})),t.add(s),r.imported++)}))}else{const t=new Set(a.map((e=>e.name.toLowerCase()))),i=e.filter((e=>{const a=(null==e?void 0:e.name)||"unknown";return this._isValidVariable(e)?!t.has(e.name.toLowerCase())||(r.skipped.push({name:e.name,reason:"card-conflict"}),!1):(r.skipped.push({name:a,reason:"invalid"}),!1)}));this._variables=i.map(((e,t)=>Object.assign(Object.assign({},e),{id:e.id||this._generateId(),order:t}))),r.imported=i.length}return this._saveToStorage(),this._notifyListeners(),this._broadcastChange(),r}exportVariables(){return this.getVariables()}getVariablesForBackup(){return{variables:this.getVariables(),version:this._backupVersion}}needsRestoreFromBackup(){return this._isLocalStorageAvailable()?!localStorage.getItem(s.STORAGE_KEY)&&0===this._variables.length:0===this._variables.length}restoreFromBackup(e){if(this._variables.length>0)return!1;const t=Array.isArray(e)?e:e.variables;return!(!t||0===t.length||(this._variables=t.filter((e=>this._isValidVariable(e)&&!1!==e.isGlobal)),this._saveToStorage(),this._notifyListeners(),0))}_requestBackup(){this._backupVersion++,window.dispatchEvent(new CustomEvent(s.BACKUP_EVENT,{detail:this.getVariablesForBackup()}))}subscribeToBackupRequests(e){const t=t=>{e(t.detail)};return window.addEventListener(s.BACKUP_EVENT,t),()=>window.removeEventListener(s.BACKUP_EVENT,t)}hasVariable(e){return this._variables.some((t=>t.name.toLowerCase()===e.toLowerCase()&&!1!==t.isGlobal))}hasVariableInContext(e,t){return!!((null==t?void 0:t._customVariables)||[]).some((t=>t.name.toLowerCase()===e.toLowerCase()&&!0!==t.isGlobal))||this.hasVariable(e)}isValidVariableName(e){return/^[a-zA-Z][a-zA-Z0-9_]*$/.test(e)}debugVariables(){console.log("=== Ultra Card Custom Variables Debug Info ==="),console.log("Storage Key:",s.STORAGE_KEY),console.log("Current Variables Count:",this._variables.length),console.log("Listeners Count:",this._listeners.size),console.log("LocalStorage Available:",this._isLocalStorageAvailable());try{const e=localStorage.getItem(s.STORAGE_KEY);if(console.log("Raw Storage Data:",e?`${e.length} characters`:"null"),e){const t=JSON.parse(e);console.log("Parsed Data Type:",Array.isArray(t)?"Array":typeof t),console.log("Parsed Data Length:",Array.isArray(t)?t.length:"N/A")}}catch(e){console.error("Storage Data Error:",e)}console.log("Variables List:",this._variables.map((e=>({id:e.id,name:e.name,entity:e.entity,value_type:e.value_type,order:e.order})))),console.log("==========================================")}_sanitizeVariableName(e){let t=e.trim();return t=t.replace(/[\s-]+/g,"_"),t=t.replace(/[^a-zA-Z0-9_]/g,""),/^[0-9]/.test(t)&&(t="v_"+t),t&&this.isValidVariableName(t)?t:""}_loadFromStorage(){try{if(!this._isLocalStorageAvailable())return void(this._variables=[]);const e=localStorage.getItem(s.STORAGE_KEY);if(e){const t=JSON.parse(e);Array.isArray(t)?this._variables=t.filter(this._isValidVariable.bind(this)):this._variables=[]}else this._variables=[]}catch(e){console.error("Failed to load custom variables from storage:",e),this._variables=[]}}_saveToStorage(){try{if(!this._isLocalStorageAvailable())return!1;const e=JSON.stringify(this._variables);return localStorage.setItem(s.STORAGE_KEY,e),!0}catch(e){return e instanceof DOMException&&e.code===DOMException.QUOTA_EXCEEDED_ERR?console.error('localStorage quota exceeded. Run: localStorage.removeItem("ultra-card-pending-backup")'):console.error("Failed to save custom variables:",e),!1}}_setupStorageListener(){window.addEventListener("storage",(e=>{e.key===s.STORAGE_KEY&&(this._loadFromStorage(),this._notifyListeners())})),window.addEventListener(s.SYNC_EVENT,(()=>{try{const e="__uc_test__";localStorage.setItem(e,"1"),localStorage.removeItem(e),this._loadFromStorage(),this._notifyListeners()}catch(e){}}))}_broadcastChange(){window.dispatchEvent(new CustomEvent(s.SYNC_EVENT)),this._requestBackup()}_notifyListeners(){const e=this.getVariables();this._listeners.forEach((t=>{try{t(e)}catch(e){console.warn("Error notifying custom variables listener:",e)}}))}_generateId(){return`var-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}_getNextOrder(){return 0===this._variables.length?0:Math.max(...this._variables.map((e=>e.order)))+1}_isValidVariable(e){return e&&"string"==typeof e.id&&"string"==typeof e.name&&"string"==typeof e.entity&&"number"==typeof e.order&&["entity_id","state","attribute","full_object"].includes(e.value_type)&&this.isValidVariableName(e.name)}_isLocalStorageAvailable(){try{const e="__ultra_card_variables_storage_test__";return localStorage.setItem(e,"test"),localStorage.removeItem(e),!0}catch(e){return!1}}}s.STORAGE_KEY="ultra-card-custom-variables",s.SYNC_EVENT="ultra-card-custom-variables-changed",s.BACKUP_EVENT="ultra-card-variables-backup-needed";const o=new s;"undefined"!=typeof window&&(window.ucCustomVariablesService=o,window.debugUltraCardCustomVariables=()=>o.debugVariables());var n=a(9978),l=a(378),d=a(7568),c=function(e,t,a,r){var i,s=arguments.length,o=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,a):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,a,r);else for(var n=e.length-1;n>=0;n--)(i=e[n])&&(o=(s<3?i(o):s>3?i(t,a,o):i(t,a))||o);return s>3&&o&&Object.defineProperty(t,a,o),o};let p=class extends r.WF{constructor(){super(...arguments),this._variables=[],this._toastMsg="",this._search="",this._showAddForm=!1,this._newName="",this._newEntity="",this._newValueType="state",this._newAttribute="",this._editingId=null,this._editName="",this._editEntity="",this._editValueType="state",this._editAttribute="",this._cloudUser=null,this._syncStatus=null,this._syncing=!1}connectedCallback(){super.connectedCallback(),this._variables=o.getVariables(),this._unsub=o.subscribe((e=>{this._variables=e})),this._cloudUser=l.x.getCurrentUser(),this._syncStatus=d.Q.getSyncStatus(),this._authUnsub=e=>{this._cloudUser=e},l.x.addListener(this._authUnsub),this._syncUnsub=e=>{this._syncStatus=e},d.Q.addListener(this._syncUnsub)}disconnectedCallback(){var e;super.disconnectedCallback(),null===(e=this._unsub)||void 0===e||e.call(this),this._authUnsub&&l.x.removeListener(this._authUnsub),this._syncUnsub&&d.Q.removeListener(this._syncUnsub),this._toastTimer&&clearTimeout(this._toastTimer)}_goToAccount(){this.dispatchEvent(new CustomEvent("hub-navigate-tab",{detail:{tab:"account"},bubbles:!0,composed:!0}))}_formatSyncTime(e){if(!e)return"Never";try{const t=new Date(e),a=Math.floor((Date.now()-t.getTime())/6e4);if(a<1)return"Just now";if(a<60)return`${a}m ago`;const r=Math.floor(a/60);return r<24?`${r}h ago`:t.toLocaleDateString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch(e){return"Unknown"}}async _syncNow(){if(!this._syncing){this._syncing=!0;try{await d.Q.syncVariables(),this._showToast("Variables synced ✓")}catch(e){this._showToast("Sync failed — try again")}finally{this._syncing=!1}}}_renderSyncBanner(){var e;return this._cloudUser?r.qy`
      <div class="sync-banner sync-banner-active">
        <ha-icon icon=${this._syncing?"mdi:cloud-sync":"mdi:cloud-check"}></ha-icon>
        <div class="sync-banner-body">
          <strong>${this._syncing?"Syncing…":"Cloud Sync Active"}</strong>
          <span>Last synced: ${this._formatSyncTime(null===(e=this._syncStatus)||void 0===e?void 0:e.lastVariablesSync)}</span>
        </div>
        <button class="sync-banner-btn" @click=${this._syncNow} ?disabled=${this._syncing}>
          ${this._syncing?"Syncing…":"Sync Now"}
        </button>
      </div>
    `:r.qy`
        <div class="sync-banner sync-banner-guest">
          <ha-icon icon="mdi:cloud-outline"></ha-icon>
          <div class="sync-banner-body">
            <strong>Back up & sync across all devices</strong>
            <span>Create a free account to keep your variables synced everywhere — change one entity and every card updates.</span>
          </div>
          <button class="sync-banner-btn" @click=${this._goToAccount}>Sign In</button>
        </div>
      `}_showToast(e){this._toastMsg=e,this._toastTimer&&clearTimeout(this._toastTimer),this._toastTimer=setTimeout((()=>this._toastMsg=""),2e3)}_copyVarRef(e){try{navigator.clipboard.writeText(`$${e}`),this._showToast(`Copied $${e}`)}catch(e){}}_addVariable(){const e=this._newName.trim(),t=this._newEntity.trim();if(!e||!t)return;const a=o.addVariable(e,t,this._newValueType,!0,"attribute"===this._newValueType?this._newAttribute:void 0);a?(this._newName="",this._newEntity="",this._newValueType="state",this._newAttribute="",this._showAddForm=!1,this._showToast(`Added variable $${a.name}`)):this._showToast("Could not add variable (name may already exist)")}_deleteVariable(e){o.deleteVariable(e.id),this._showToast(`Deleted $${e.name}`)}_startEdit(e){this._editingId=e.id,this._editName=e.name,this._editEntity=e.entity,this._editValueType=e.value_type,this._editAttribute=e.attribute_name||""}_saveEdit(){this._editingId&&(o.updateVariable(this._editingId,{name:this._editName,entity:this._editEntity,value_type:this._editValueType,attribute_name:"attribute"===this._editValueType?this._editAttribute:void 0})?(this._editingId=null,this._showToast("Variable updated")):this._showToast("Could not update (name conflict?)"))}_cancelEdit(){this._editingId=null}_getResolvedValue(e){return this.hass&&o.resolveVariable(e.name,this.hass)||"—"}_getCurrentState(e){var t;if(!(null===(t=this.hass)||void 0===t?void 0:t.states))return"—";const a=this.hass.states[e.entity];if(!a)return"unavailable";if("attribute"===e.value_type&&e.attribute_name){const t=a.attributes[e.attribute_name];return null!=t?String(t):"—"}return a.state}_getTypeIcon(e){switch(e){case"entity_id":return"mdi:identifier";case"state":return"mdi:state-machine";case"attribute":return"mdi:code-braces";default:return"mdi:variable"}}_getFilteredVariables(){if(!this._search.trim())return this._variables;const e=this._search.toLowerCase().trim();return this._variables.filter((t=>t.name.toLowerCase().includes(e)||t.entity.toLowerCase().includes(e)||(t.attribute_name||"").toLowerCase().includes(e)))}render(){if(0===this._variables.length&&!this._showAddForm)return r.qy`
        <div class="hub-tab-blurb">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <p><strong>Variables</strong> let you reference entities by name (e.g. <code>$living_room_temp</code>) in templates and module fields. These are global and shared across all cards; card-specific variables are in each card’s Card Settings tab.</p>
        </div>
        ${this._renderSyncBanner()}
        <div class="empty-state">
          <div class="empty-state-icon">
            <ha-icon icon="mdi:variable"></ha-icon>
          </div>
          <h3>No Variables</h3>
          <p>Create variables to use entity references like <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-size: 13px;">$my_sensor</code> across all your Ultra Cards.</p>
          <p class="empty-hint">Variables let you change one entity and update all cards at once</p>
          <button class="add-btn" style="margin-top: 16px;" @click=${()=>this._showAddForm=!0}>
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Variable
          </button>
        </div>
      `;const e=this._getFilteredVariables();return r.qy`
      <div class="hub-tab-blurb">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <p><strong>Variables</strong> let you reference entities by name (e.g. <code>$living_room_temp</code>) in templates and module fields. These are global and shared across all cards; card-specific variables are in each card’s Card Settings tab.</p>
      </div>
      ${this._renderSyncBanner()}

      <!-- Header -->
      <div class="vars-header">
        <div class="vars-header-left">
          <span class="vars-count">
            <strong>${e.length}</strong> global variable${1!==e.length?"s":""}
          </span>
          ${this._variables.length>3?r.qy`
                <div class="search-box">
                  <ha-icon icon="mdi:magnify"></ha-icon>
                  <input
                    type="text"
                    placeholder="Search variables…"
                    .value=${this._search}
                    @input=${e=>this._search=e.target.value}
                  />
                </div>
              `:""}
        </div>
        <button class="add-btn" @click=${()=>this._showAddForm=!this._showAddForm}>
          <ha-icon icon=${this._showAddForm?"mdi:close":"mdi:plus"}></ha-icon>
          ${this._showAddForm?"Cancel":"Add Variable"}
        </button>
      </div>

      <!-- Add form -->
      ${this._showAddForm?this._renderAddForm():r.s6}

      <!-- Variables grid -->
      ${0===e.length&&this._search?r.qy`
            <div class="empty-state">
              <div class="empty-state-icon"><ha-icon icon="mdi:magnify-close"></ha-icon></div>
              <h3>No Results</h3>
              <p>No variables match "${this._search}"</p>
            </div>
          `:r.qy`
            <div class="vars-grid">
              ${e.map((e=>this._renderVariableCard(e)))}
            </div>
          `}

      <div class="toast ${this._toastMsg?"show":""}">${this._toastMsg}</div>
    `}_renderAddForm(){const e=!this._newName.trim()||o.isValidVariableName(this._newName.trim()),t=this._newName.trim()&&o.hasVariable(this._newName.trim()),a=this._newName.trim()&&this._newEntity.trim()&&e&&!t;return r.qy`
      <div class="add-form">
        <h3><ha-icon icon="mdi:variable-box"></ha-icon> Add Global Variable</h3>

        <div class="form-row">
          <span class="form-label">Name</span>
          <input
            type="text"
            class="form-input"
            placeholder="e.g. living_room_temp"
            .value=${this._newName}
            @input=${e=>this._newName=e.target.value}
          />
        </div>
        <div class="form-hint">
          Use in cards as <strong>$${this._newName||"name"}</strong>. Letters, numbers, underscores only.
        </div>

        <div class="form-row">
          <span class="form-label">Entity</span>
          <input
            type="text"
            class="form-input"
            placeholder="e.g. sensor.living_room_temperature"
            .value=${this._newEntity}
            @input=${e=>this._newEntity=e.target.value}
          />
        </div>

        <div class="form-row">
          <span class="form-label">Value Type</span>
          <select
            class="form-select"
            .value=${this._newValueType}
            @change=${e=>this._newValueType=e.target.value}
          >
            <option value="state">State — returns states('entity')</option>
            <option value="entity_id">Entity ID — returns the entity ID directly</option>
            <option value="attribute">Attribute — returns a specific attribute</option>
          </select>
        </div>

        ${"attribute"===this._newValueType?r.qy`
              <div class="form-row">
                <span class="form-label">Attribute</span>
                <input
                  type="text"
                  class="form-input"
                  placeholder="e.g. temperature, friendly_name"
                  .value=${this._newAttribute}
                  @input=${e=>this._newAttribute=e.target.value}
                />
              </div>
            `:r.s6}

        ${t?r.qy`
              <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(244,67,54,0.08);border:1px solid rgba(244,67,54,0.2);border-radius:8px;margin-bottom:12px;font-size:12px;color:#f44336;">
                <ha-icon icon="mdi:alert-circle" style="--mdc-icon-size:16px;flex-shrink:0"></ha-icon>
                A variable named "$${this._newName}" already exists.
              </div>
            `:r.s6}

        <div class="form-actions">
          <button class="form-btn secondary" @click=${()=>this._showAddForm=!1}>Cancel</button>
          <button class="form-btn primary" ?disabled=${!a} @click=${this._addVariable}>
            <ha-icon icon="mdi:check"></ha-icon>
            Add Variable
          </button>
        </div>
      </div>
    `}_renderVariableCard(e){const t=this._editingId===e.id,a=this._getCurrentState(e);return r.qy`
      <div class="var-card ${t?"editing":""}">
        <div class="var-header">
          <div class="var-icon-wrap ${e.value_type}">
            <ha-icon icon=${this._getTypeIcon(e.value_type)}></ha-icon>
          </div>
          <div class="var-title-area">
            <h4 class="var-name">
              <span class="var-name-prefix">$</span><span class="var-name-text">${e.name}</span>
            </h4>
            <p class="var-subtitle">${e.entity}</p>
          </div>
          <div class="var-actions">
            <button class="copy-var-btn" title="Copy reference" @click=${()=>this._copyVarRef(e.name)}>
              <ha-icon icon="mdi:content-copy"></ha-icon>
              $${e.name}
            </button>
            ${t?r.s6:r.qy`
                  <button class="action-btn" title="Edit" @click=${()=>this._startEdit(e)}>
                    <ha-icon icon="mdi:pencil"></ha-icon>
                  </button>
                  <button class="action-btn delete" title="Delete" @click=${()=>this._deleteVariable(e)}>
                    <ha-icon icon="mdi:delete-outline"></ha-icon>
                  </button>
                `}
          </div>
        </div>

        ${t?r.qy`
              <div class="edit-section">
                <div class="edit-row">
                  <span class="edit-label">Name</span>
                  <input
                    type="text"
                    class="edit-input"
                    .value=${this._editName}
                    @input=${e=>this._editName=e.target.value}
                  />
                </div>
                <div class="edit-row">
                  <span class="edit-label">Entity</span>
                  <input
                    type="text"
                    class="edit-input"
                    .value=${this._editEntity}
                    @input=${e=>this._editEntity=e.target.value}
                  />
                </div>
                <div class="edit-row">
                  <span class="edit-label">Type</span>
                  <select
                    class="edit-select"
                    .value=${this._editValueType}
                    @change=${e=>this._editValueType=e.target.value}
                  >
                    <option value="state">State</option>
                    <option value="entity_id">Entity ID</option>
                    <option value="attribute">Attribute</option>
                  </select>
                </div>
                ${"attribute"===this._editValueType?r.qy`
                      <div class="edit-row">
                        <span class="edit-label">Attribute</span>
                        <input
                          type="text"
                          class="edit-input"
                          .value=${this._editAttribute}
                          @input=${e=>this._editAttribute=e.target.value}
                        />
                      </div>
                    `:r.s6}
                <div class="edit-row" style="justify-content: flex-end; gap: 6px; margin-top: 4px;">
                  <button class="action-btn" title="Save" @click=${this._saveEdit}>
                    <ha-icon icon="mdi:check"></ha-icon>
                  </button>
                  <button class="action-btn" title="Cancel" @click=${this._cancelEdit}>
                    <ha-icon icon="mdi:close"></ha-icon>
                  </button>
                </div>
              </div>
            `:r.qy`
              <div class="var-details">
                <div class="detail-row">
                  <span class="detail-label">Type</span>
                  <span class="type-badge ${e.value_type}">${e.value_type.replace("_"," ")}</span>
                </div>
                ${"attribute"===e.value_type&&e.attribute_name?r.qy`
                      <div class="detail-row">
                        <span class="detail-label">Attribute</span>
                        <span class="detail-value">${e.attribute_name}</span>
                      </div>
                    `:r.s6}
                <div class="detail-row">
                  <span class="detail-label">Current</span>
                  <span class="detail-value" title="${a}">${a}</span>
                </div>
              </div>

              <div class="resolved-value">
                <span class="resolved-label">Resolves to:</span>
                <span class="resolved-text">${this._getResolvedValue(e)}</span>
              </div>
            `}
      </div>
    `}};p.styles=[n.z,r.AH`
      :host {
        display: block;
        animation: fadeSlideIn 0.3s ease-out;
      }

      /* Header */
      .vars-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }

      .vars-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
      }

      .vars-count {
        font-size: 13px;
        color: var(--secondary-text-color);
        font-weight: 500;
        white-space: nowrap;
      }

      .vars-count strong {
        color: var(--primary-text-color);
      }

      .search-box {
        flex: 1;
        min-width: 150px;
        max-width: 280px;
        position: relative;
      }

      .search-box input {
        width: 100%;
        padding: 8px 14px 8px 36px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 10px;
        background: var(--ha-card-background, var(--card-background-color));
        color: var(--primary-text-color);
        font-size: 13px;
        outline: none;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }

      .search-box input:focus {
        border-color: var(--primary-color);
      }

      .search-box ha-icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
        pointer-events: none;
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
        white-space: nowrap;
      }

      .add-btn:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(var(--rgb-primary-color, 3, 169, 244), 0.3);
      }

      .add-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      /* Add form */
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
        gap: 12px;
        margin-bottom: 14px;
      }

      .form-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--secondary-text-color);
        min-width: 80px;
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

      .form-select {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 8px;
        background: var(--primary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        outline: none;
        box-sizing: border-box;
      }

      .form-hint {
        font-size: 11px;
        color: var(--secondary-text-color);
        margin-top: -6px;
        margin-bottom: 12px;
        padding-left: 92px;
      }

      .form-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 20px;
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

      .form-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      /* Variables list */
      .vars-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 16px;
      }

      @media (max-width: 600px) {
        .vars-grid {
          grid-template-columns: 1fr;
        }
      }

      .var-card {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
      }

      .var-card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
        border-color: var(--primary-color);
      }

      .var-card.editing {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
      }

      .var-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
      }

      .var-icon-wrap {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .var-icon-wrap.entity_id {
        background: linear-gradient(135deg, #2196f3, #42a5f5);
      }

      .var-icon-wrap.state {
        background: linear-gradient(135deg, #4caf50, #66bb6a);
      }

      .var-icon-wrap.attribute {
        background: linear-gradient(135deg, #ff9800, #ffb74d);
      }

      .var-icon-wrap ha-icon {
        --mdc-icon-size: 22px;
        color: white;
      }

      .var-title-area {
        flex: 1;
        min-width: 0;
      }

      .var-name {
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .var-name-prefix {
        color: var(--primary-color);
        font-family: 'SF Mono', 'Fira Code', monospace;
      }

      .var-name-text {
        font-family: 'SF Mono', 'Fira Code', monospace;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .var-subtitle {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .var-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }

      /* Details section */
      .var-details {
        padding: 0 16px 14px;
      }

      .detail-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.04));
        font-size: 13px;
      }

      .detail-row:last-child {
        border-bottom: none;
      }

      .detail-label {
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      .detail-value {
        color: var(--primary-text-color);
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 200px;
        text-align: right;
      }

      .type-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      .type-badge.entity_id {
        background: rgba(33, 150, 243, 0.1);
        color: #2196f3;
      }

      .type-badge.state {
        background: rgba(76, 175, 80, 0.1);
        color: #4caf50;
      }

      .type-badge.attribute {
        background: rgba(255, 152, 0, 0.1);
        color: #ff9800;
      }

      /* Resolved value display */
      .resolved-value {
        padding: 10px 16px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.03);
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.04));
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
      }

      .resolved-label {
        color: var(--secondary-text-color);
        font-weight: 500;
        white-space: nowrap;
      }

      .resolved-text {
        flex: 1;
        font-family: 'SF Mono', 'Fira Code', monospace;
        color: var(--primary-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Copy var name button */
      .copy-var-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        background: none;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 6px;
        color: var(--secondary-text-color);
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        font-family: 'SF Mono', 'Fira Code', monospace;
      }

      .copy-var-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.05);
      }

      .copy-var-btn ha-icon {
        --mdc-icon-size: 12px;
      }

      /* Edit inline */
      .edit-section {
        padding: 14px 16px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.02);
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

      .edit-select {
        padding: 6px 10px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 6px;
        background: var(--primary-background-color);
        color: var(--primary-text-color);
        font-size: 13px;
        outline: none;
      }

      .edit-label {
        font-size: 11px;
        color: var(--secondary-text-color);
        font-weight: 500;
        min-width: 60px;
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
    `],c([(0,i.MZ)({attribute:!1})],p.prototype,"hass",void 0),c([(0,i.wk)()],p.prototype,"_variables",void 0),c([(0,i.wk)()],p.prototype,"_toastMsg",void 0),c([(0,i.wk)()],p.prototype,"_search",void 0),c([(0,i.wk)()],p.prototype,"_showAddForm",void 0),c([(0,i.wk)()],p.prototype,"_newName",void 0),c([(0,i.wk)()],p.prototype,"_newEntity",void 0),c([(0,i.wk)()],p.prototype,"_newValueType",void 0),c([(0,i.wk)()],p.prototype,"_newAttribute",void 0),c([(0,i.wk)()],p.prototype,"_editingId",void 0),c([(0,i.wk)()],p.prototype,"_editName",void 0),c([(0,i.wk)()],p.prototype,"_editEntity",void 0),c([(0,i.wk)()],p.prototype,"_editValueType",void 0),c([(0,i.wk)()],p.prototype,"_editAttribute",void 0),c([(0,i.wk)()],p.prototype,"_cloudUser",void 0),c([(0,i.wk)()],p.prototype,"_syncStatus",void 0),c([(0,i.wk)()],p.prototype,"_syncing",void 0),p=c([(0,i.EM)("hub-variables-tab")],p)}}]);