"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[8032],{8032:(e,t,i)=>{i.r(t),i.d(t,{UltraNativeCardModule:()=>C,cleanupNativeCardCache:()=>y});var n=i(5183),o=i(8791),a=i(7475),r=i(1874),c=i(1001),s=i(382);const d=new Map,l=new Map,p=new Map,g=new Map,f=new Map,v=new Map;class C extends a.m{constructor(){super(...arguments),this.metadata={type:"native_card",title:"Native HA Card",description:"Native Home Assistant card",author:"Home Assistant",version:"1.0.0",icon:"mdi:home-assistant",category:"content",tags:["native","home-assistant","card"]}}createDefault(){return{id:`native-card-${Date.now()}`,type:"native_card",name:"Native Card",card_type:"hui-entities-card",card_config:{type:"entities",entities:[]},display_conditions:[]}}_attachContainerEventListeners(e){if(e.hasAttribute("data-uc-events-attached"))return;e.setAttribute("data-uc-events-attached","true");const t=e=>{e.stopPropagation()};e.addEventListener("keydown",t,!1),e.addEventListener("keyup",t,!1),e.addEventListener("keypress",t,!1),e.addEventListener("input",t,!1),e.addEventListener("change",t,!1),e.addEventListener("focus",t,!1),e.addEventListener("blur",t,!1),e.addEventListener("click",t,!1),e.addEventListener("mousedown",t,!1),e.addEventListener("mouseup",t,!1),e.addEventListener("pointerdown",t,!1),e.addEventListener("pointerup",t,!1)}renderGeneralTab(e,t,i,a){const c=r.e.getNativeCardInfo(e.card_type),s=(null==c?void 0:c.name)||e.name||"Native Card";return n.qy`
      <div class="native-card-general-tab">
        <div class="settings-section">
          <div
            class="section-title"
            style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: var(--primary-color); text-transform: uppercase;"
          >
            ${s.toUpperCase()} SETTINGS
          </div>
          <div
            class="section-description"
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;"
          >
            Configure this native Home Assistant card using its built-in editor.
          </div>
          <div class="native-editor-container" ${(0,o.K)((i=>{if(!i||!e.card_type)return;const n=`${e.id}-editor`;let o=d.get(n);const c=!o,s=o&&!i.contains(o);c?(async()=>{try{const c=r.e.elementNameToConfigType(e.card_type),s=`${e.card_type}-editor`;console.log("[UC Native Card] Creating editor for:",e.card_type,"config type:",c,"editor element:",s);let C,y=!1,m=null;try{if(customElements.get(s))console.log("[UC Native Card] Editor class found, creating directly:",s),m=document.createElement(s),y=!0;else{const t=customElements.get(e.card_type);if(t&&"function"==typeof t.getConfigElement){console.log("[UC Native Card] Getting config element from card class");const e=await Promise.resolve(t.getConfigElement());!e||e instanceof HTMLUnknownElement?console.log("[UC Native Card] getConfigElement returned invalid result:",e):(m=e,y=!0,console.log("[UC Native Card] Got direct editor from getConfigElement:",m.tagName))}}}catch(e){console.log("[UC Native Card] Could not get direct editor, falling back to wrapper:",e)}if((!m||m instanceof HTMLUnknownElement)&&(console.log("[UC Native Card] Using hui-card-element-editor wrapper"),m=document.createElement("hui-card-element-editor"),y=!1),o=m,o._ucIsDirectEditor=y,!o||o instanceof HTMLUnknownElement)return console.warn("[UC Native Card] No valid editor available"),d.delete(n),void(i.innerHTML='\n                <div style="padding: 40px; text-align: center; color: var(--secondary-text-color);">\n                  <ha-icon icon="mdi:information-outline" style="font-size: 48px; opacity: 0.5; margin-bottom: 16px;"></ha-icon>\n                  <p style="font-size: 14px; margin-bottom: 8px;">This card does not have a visual editor.</p>\n                  <p style="font-size: 13px; opacity: 0.8;">Use the YAML tab to configure this card.</p>\n                </div>\n              ');let u=null;o.addEventListener("config-changed",(i=>{if(i.stopPropagation(),i.stopImmediatePropagation(),i.detail&&i.detail.config){const n=Object.assign({},i.detail.config);!n.type&&e.card_type&&(n.type=r.e.elementNameToConfigType(e.card_type));const o=JSON.stringify(n);if(p.get(e.id)===o)return;if(o===JSON.stringify(e.card_config||{}))return;p.set(e.id,o),u=Object.assign({},n),C&&clearTimeout(C),l.set(e.id,!0),C=window.setTimeout((()=>{u&&(function(e,t,i,n){const o=Object.assign({},i);o.type||(o.type=r.e.elementNameToConfigType(t)),["live","ha-preview","dashboard"].forEach((i=>{const a=`${e}-preview-${i}`;let r=g.get(a);if(!r&&"dashboard"===i){const t=`${e}-preview`;r=g.get(t),r&&(g.set(a,r),g.delete(t))}if(r)try{if(r.hass=n,r.isConnected)if("function"==typeof r.setConfig)try{r.setConfig(o)}catch(e){r.config=o}else r.config=o;else if(r.config=o,"function"==typeof r.setConfig)try{r.setConfig(o)}catch(e){}f.set(a,o),r.isConnected?v.delete(a):v.set(a,!0)}catch(e){f.delete(a),v.set(a,!0),console.warn(`[UC Native Card] Failed to update card instance for ${i}:`,e)}else{if("dashboard"===i)try{console.log(`[UC Native Card] Searching DOM for dashboard card: ${t}`);const e=document.querySelectorAll("ultra-card");for(const i of Array.from(e)){const e=i.querySelectorAll(t);for(const i of Array.from(e))try{if(i.hass=n,"function"==typeof i.setConfig)try{i.setConfig(o),console.log("[UC Native Card] Updated dashboard card via setConfig:",t)}catch(e){i.config=o,console.log("[UC Native Card] Updated dashboard card via config property:",t)}else i.config=o,console.log("[UC Native Card] Updated dashboard card via config property:",t);g.set(a,i),f.set(a,o);break}catch(e){console.warn("[UC Native Card] Failed to update card in DOM:",e)}if(g.has(a))break}g.has(a)||console.warn(`[UC Native Card] Could not find dashboard card in DOM: ${t}`)}catch(e){console.warn("[UC Native Card] DOM search failed:",e)}g.has(a)||(f.delete(a),v.delete(a))}}))}(e.id,e.card_type,u,t),a({card_config:u}),u=null),C=void 0,setTimeout((()=>{l.set(e.id,!1)}),200)}),600)}})),d.set(n,o),i.innerHTML="",i.appendChild(o),this._attachContainerEventListeners(i);const h=async()=>{await new Promise((e=>requestAnimationFrame(e)));const i=o._ucIsDirectEditor;t&&(o.hass=t),t.lovelace&&(o.lovelace=t.lovelace),await new Promise((e=>setTimeout(e,50)));const n=Object.assign({},e.card_config||{});if(n.type||(n.type=r.e.elementNameToConfigType(e.card_type)),console.log("[UC Native Card] Setting initial editor config (direct:",i,"):",n),i){const e=Object.assign({},n);e.entities||"entities"!==n.type&&"calendar"!==n.type||(e.entities=[]),!e.entity&&n.type;try{"function"==typeof o.setConfig?(o.setConfig(e),console.log("[UC Native Card] Direct editor setConfig succeeded with config:",e)):console.warn("[UC Native Card] Direct editor has no setConfig method")}catch(e){console.log("[UC Native Card] Direct editor setConfig error:",e.message);try{o.setConfig(n)}catch(e){console.log("[UC Native Card] Fallback setConfig also failed (expected for unconfigured cards)")}}}else{const e=Object.assign({},n);e.entities||"entities"!==n.type&&"calendar"!==n.type||(e.entities=[]),o.value=e,console.log("[UC Native Card] Set wrapper value:",e),setTimeout((()=>{o.querySelector(":not(ha-code-editor)")||(console.log("[UC Native Card] Editor may be in YAML mode, retrying..."),o.value=Object.assign({},e))}),200)}};h();const b=e.card_config||{};if(Object.keys(b).length<=1)try{const i=customElements.get(e.card_type);i&&"function"==typeof i.getStubConfig&&Promise.resolve(i.getStubConfig(t)).then((e=>{e&&"object"==typeof e&&(console.log("[UC Native Card] Got stub config from card:",e),a({card_config:e}))})).catch((e=>{console.log("[UC Native Card] Failed to get stub config:",e)}))}catch(e){console.log("[UC Native Card] Error getting stub config:",e)}return}catch(e){return console.error("[UC Native Card] Failed to create editor:",e),d.delete(n),void(i.innerHTML='\n            <div style="padding: 40px; text-align: center; color: var(--error-color);">\n              <ha-icon icon="mdi:alert-circle" style="font-size: 48px; opacity: 0.5; margin-bottom: 16px;"></ha-icon>\n              <p style="font-size: 14px; margin-bottom: 8px;">Failed to load editor</p>\n              <p style="font-size: 13px; opacity: 0.8;">Use the YAML tab to configure this card.</p>\n            </div>\n          ')}})():(s&&(i.innerHTML="",i.appendChild(o),this._attachContainerEventListeners(i)),l.get(e.id)||((i,n)=>{try{const o=n.contains(i),a=i._ucIsDirectEditor;t.lovelace&&(i.lovelace=t.lovelace);const c=Object.assign({},e.card_config||{});c.type||(c.type=r.e.elementNameToConfigType(e.card_type));const s=a?i.config||i._config||{}:i.value||{},d=JSON.stringify(s)!==JSON.stringify(c),p=l.get(e.id);if(i.hass=t,!p&&(!o||d)){l.set(e.id,!0);try{if(a){const e=Object.assign({},c);if(e.entities||"entities"!==c.type&&"calendar"!==c.type||(e.entities=[]),"function"==typeof i.setConfig)try{i.setConfig(e)}catch(e){console.log("[UC Native Card] setConfig error (expected):",e.message)}}else{const e=Object.assign({},c);e.entities||"entities"!==c.type&&"calendar"!==c.type||(e.entities=[]),i.value=e}}finally{setTimeout((()=>l.set(e.id,!1)),100)}}}catch(e){console.error("[UC Native Card] Failed to update editor properties:",e)}})(o,i))}))}></div>
        </div>
      </div>
    `}renderPreview(e,t,i,a){const c=a||"dashboard",s=`${e.id}-preview-${c}`;return n.qy`
      <div class="native-card-preview" ${(0,o.K)((i=>{if(!i||!e.card_type)return;let n=g.get(s);if(!n||n.tagName&&n.tagName.toLowerCase()===e.card_type.toLowerCase()||(console.warn("[UC Native Card] Cached card element is invalid, recreating"),g.delete(s),f.delete(s),n=void 0),n&&n.isConnected,n&&i.contains(n))try{n.hass=t;const i=Object.assign({},e.card_config||{});i.type||(i.type=r.e.elementNameToConfigType(e.card_type));const o=f.get(s),a=v.get(s),c=n.config||{};f.set(s,i);const d=o&&JSON.stringify(o)===JSON.stringify(i);if(JSON.stringify(c)!==JSON.stringify(i)&&!d||a){v.delete(s);try{"function"==typeof n.setConfig?n.setConfig(i):n.config=i}catch(e){console.warn("[UC Native Card] setConfig failed (non-critical):",e)}}else v.delete(s)}catch(e){console.error("[UC Native Card] Failed to update card:",e)}else{if(n)try{if(n.parentElement&&n.parentElement!==i&&n.parentElement.removeChild(n),!i.contains(n)){for(;i.firstChild;)i.removeChild(i.firstChild);i.appendChild(n)}n.hass=t;const o=Object.assign({},e.card_config||{});o.type||(o.type=r.e.elementNameToConfigType(e.card_type));try{"function"==typeof n.setConfig?n.setConfig(o):n.config=o,f.set(s,o),v.delete(s)}catch(e){console.warn("[UC Native Card] setConfig failed on remount:",e)}return}catch(e){console.error("[UC Native Card] Failed to remount card:",e)}if(!n)try{if(n=document.createElement(e.card_type),n instanceof HTMLUnknownElement)return void(i.innerHTML=`\n              <div style="padding: 16px; text-align: center; color: var(--error-color);">\n                <ha-icon icon="mdi:alert-circle"></ha-icon>\n                <p>Card not found: ${e.card_type}</p>\n              </div>\n            `);g.set(s,n)}catch(e){return console.error("[UC Native Card] Failed to create card:",e),void(i.innerHTML='\n            <div style="padding: 16px; text-align: center; color: var(--error-color);">\n              <ha-icon icon="mdi:alert-circle"></ha-icon>\n              <p>Failed to load card</p>\n            </div>\n          ')}for(;i.firstChild;)i.removeChild(i.firstChild);i.appendChild(n);try{n.hass=t;const o=Object.assign({},e.card_config||{});o.type||(o.type=r.e.elementNameToConfigType(e.card_type));try{"function"==typeof n.setConfig?n.setConfig(o):n.config=o,f.set(s,o),v.delete(s)}catch(e){return console.error("[UC Native Card] Error setting card config:",e),void(i.innerHTML=`\n            <div style="padding: 16px; text-align: center; color: var(--error-color);">\n              <ha-icon icon="mdi:alert-circle"></ha-icon>\n              <p>Card configuration error</p>\n              <small>${(null==e?void 0:e.message)||"Unknown error"}</small>\n            </div>\n          `)}}catch(e){console.error("[UC Native Card] Failed to initialize card:",e)}}}))}></div>
    `}renderYamlTab(e,t,i,o){const a=s.Ay.dump(e.card_config||{});return n.qy`
      <div class="native-card-yaml-tab">
        <div class="settings-section">
          <div
            class="section-title"
            style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: var(--primary-color);"
          >
            CARD CONFIGURATION (YAML)
          </div>
          <div
            class="section-description"
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;"
          >
            Edit the card's configuration directly in YAML format. Changes are applied automatically.
          </div>
          <ultra-template-editor
            .value=${a}
            .hass=${t}
            .label=${"Card Configuration"}
            .mode=${"yaml"}
            @value-changed=${e=>{e.stopPropagation();try{const t=s.Ay.load(e.detail.value);o({card_config:t})}catch(e){console.error("[UC Native Card] Invalid YAML:",e)}}}
          ></ultra-template-editor>
        </div>
      </div>
    `}static get styles(){return n.AH`
      /* Stacking context above UC navbar so built-in HA popups (date picker, etc.) show on top */
      .native-card-preview {
        width: 100%;
        min-height: 100px;
        display: block;
        position: relative;
        z-index: ${c.Mu.NATIVE_CARD_ABOVE_NAV};
      }
      
      .native-card-preview > * {
        display: block;
        width: 100%;
      }

      .native-card-general-tab,
      .native-card-yaml-tab {
        width: 100%;
        padding: 16px;
        overflow: visible;
        position: relative;
      }

      .native-card-general-tab .settings-section {
        overflow: visible;
        position: relative;
      }

      .native-editor-container {
        min-height: 200px;
        width: 100%;
        overflow: visible;
        position: relative;
      }
      
      /* Ensure native card editor dropdowns render above other content */
      .native-editor-container ha-select,
      .native-editor-container mwc-select,
      .native-editor-container ha-combo-box,
      .native-editor-container ha-entity-picker {
        position: relative;
        z-index: 100;
      }
      
      /* Allow dropdown menus from embedded editors to render properly */
      .native-editor-container ha-select::part(menu),
      .native-editor-container mwc-select::part(menu),
      .native-editor-container .mdc-menu-surface,
      .native-editor-container mwc-menu-surface,
      .native-editor-container mwc-menu {
        z-index: 9999 !important;
        position: fixed !important;
      }

      .settings-section {
        margin-bottom: 24px;
      }
    `}}function y(e){const t=`${e}-editor`;d.delete(t),l.delete(e),p.delete(e),["live","ha-preview","dashboard"].forEach((t=>{const i=`${e}-preview-${t}`;g.delete(i),f.delete(i),v.delete(i)}));const i=`${e}-preview`;g.delete(i),f.delete(i),v.delete(i)}}}]);