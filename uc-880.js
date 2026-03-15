"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[880],{571:(e,t,i)=>{i.d(t,{s:()=>o});class o{static getEntityIcon(e,t){if("object"==typeof e&&null!==e&&!Array.isArray(e)){if(null==t?void 0:t.states)for(const[i,o]of Object.entries(t.states))if(o===e){e=i;break}if("string"!=typeof e)return this._getEnhancedIconForEntity("unknown",e)}if(!e||!(null==t?void 0:t.states[e]))return null;const i=t.states[e];return this._getHomeAssistantComputedIcon(e,i,t)||this._getEnhancedIconForEntity(e,i)}static _getHomeAssistantComputedIcon(e,t,i){var o,n,r,a,l;if(null===(o=t.attributes)||void 0===o?void 0:o.icon)return t.attributes.icon;try{if(null===(r=null===(n=window.customCards)||void 0===n?void 0:n.helpers)||void 0===r?void 0:r.stateIcon){const e=window.customCards.helpers.stateIcon(t);if(e)return e}const o=[window.stateIcon,window.computeStateIcon,window.computeEntityIcon,null===(a=window.hassIcons)||void 0===a?void 0:a.stateIcon,null===(l=window.hassIcons)||void 0===l?void 0:l.computeStateIcon,i.stateIcon,i.computeStateIcon,i.computeEntityIcon];for(const e of o)if("function"==typeof e)try{const i=e(t);if(i)return i}catch(e){}if(i.entities&&i.entities[e]){const t=i.entities[e];if(t.icon)return t.icon}if(e.startsWith("weather.")){const e={"clear-night":"mdi:weather-night",cloudy:"mdi:weather-cloudy",fog:"mdi:weather-fog",hail:"mdi:weather-hail",lightning:"mdi:weather-lightning","lightning-rainy":"mdi:weather-lightning-rainy",partlycloudy:"mdi:weather-partly-cloudy",pouring:"mdi:weather-pouring",rainy:"mdi:weather-rainy",snowy:"mdi:weather-snowy","snowy-rainy":"mdi:weather-snowy-rainy",sunny:"mdi:weather-sunny",windy:"mdi:weather-windy","windy-variant":"mdi:weather-windy-variant",exceptional:"mdi:weather-exceptional"},i=t.state;if(e[i])return e[i]}}catch(e){console.debug("Failed to compute HA icon, falling back to enhanced detection:",e)}return null}static _getEnhancedIconForEntity(e,t){var i,o,n;const r=e.split(".")[0],a=e.split(".")[1]||"",l=null===(i=t.attributes)||void 0===i?void 0:i.device_class,c=null===(o=t.attributes)||void 0===o?void 0:o.unit_of_measurement,s=(null===(n=t.attributes)||void 0===n?void 0:n.friendly_name)||"",d=t.state,p=a.toLowerCase(),m=s.toLowerCase();return this._isBatteryRelated(p,m,l,c)?this._isChargingRelated(p,m)?this._getChargingBatteryIcon(d,c):this._getBatteryIcon(d,c):this._isTemperatureRelated(p,m,l,c)?"mdi:thermometer":this._isHumidityRelated(p,m,l,c)?"mdi:water-percent":this._isPowerRelated(p,m,l,c)?"mdi:flash":this._isSignalRelated(p,m)?"mdi:wifi":"binary_sensor"===r&&this._isDoorWindowRelated(p,m)?"on"===d?"mdi:door-open":"mdi:door-closed":"binary_sensor"===r&&this._isMotionRelated(p,m)?"on"===d?"mdi:motion-sensor":"mdi:motion-sensor-off":this._isIlluminanceRelated(p,m,l,c)?"mdi:brightness-5":this._isPressureRelated(p,m,l,c)?"mdi:gauge":this._getDefaultIconForDomain(r,l,d)}static _isBatteryRelated(e,t,i,o){return"battery"===i||e.includes("battery")||e.includes("charge")||e.includes("power_level")||t.includes("battery")||t.includes("charge")||"%"===o}static _isChargingRelated(e,t){return["charging","charge_target","charging_target","charge_limit"].some((i=>e.includes(i)||t.toLowerCase().includes(i)))}static _getBatteryIcon(e,t){const i=parseFloat(e);return isNaN(i)?"mdi:battery-unknown":i>=95?"mdi:battery":i>=85?"mdi:battery-90":i>=75?"mdi:battery-80":i>=65?"mdi:battery-70":i>=55?"mdi:battery-60":i>=45?"mdi:battery-50":i>=35?"mdi:battery-40":i>=25?"mdi:battery-30":i>=15?"mdi:battery-20":i>=5?"mdi:battery-10":"mdi:battery-alert"}static _getChargingBatteryIcon(e,t){const i=parseFloat(e);return isNaN(i)?"mdi:battery-charging":i>=95?"mdi:battery-charging-100":i>=85?"mdi:battery-charging-90":i>=75?"mdi:battery-charging-80":i>=65?"mdi:battery-charging-70":i>=55?"mdi:battery-charging-60":i>=45?"mdi:battery-charging-50":i>=35?"mdi:battery-charging-40":i>=25?"mdi:battery-charging-30":i>=15?"mdi:battery-charging-20":i>=5?"mdi:battery-charging-10":"mdi:battery-charging-outline"}static _isTemperatureRelated(e,t,i,o){return"temperature"===i||e.includes("temp")||t.includes("temperature")||"°C"===o||"°F"===o||"K"===o}static _isHumidityRelated(e,t,i,o){return"humidity"===i||e.includes("humidity")||t.includes("humidity")||"%"===o&&(e.includes("humid")||t.includes("humid"))}static _isPowerRelated(e,t,i,o){return"power"===i||"energy"===i||e.includes("power")||e.includes("energy")||e.includes("consumption")||"W"===o||"kW"===o||"kWh"===o||"Wh"===o}static _isSignalRelated(e,t){return["signal","rssi","wifi","network"].some((i=>e.includes(i)||t.toLowerCase().includes(i)))}static _isDoorWindowRelated(e,t){return["door","window","gate"].some((i=>e.includes(i)||t.toLowerCase().includes(i)))}static _isMotionRelated(e,t){return["motion","movement","occupancy","presence"].some((i=>e.includes(i)||t.toLowerCase().includes(i)))}static _isIlluminanceRelated(e,t,i,o){return"illuminance"===i||e.includes("illuminance")||e.includes("brightness")||e.includes("lux")||"lx"===o||"lux"===o}static _isPressureRelated(e,t,i,o){return"pressure"===i||e.includes("pressure")||t.includes("pressure")||"hPa"===o||"mbar"===o||"Pa"===o||"psi"===o}static _getDefaultIconForDomain(e,t,i){return{alarm_control_panel:"mdi:shield",automation:"mdi:robot",binary_sensor:"mdi:radiobox-blank",button:"mdi:button-pointer",calendar:"mdi:calendar",camera:"mdi:video",climate:"mdi:thermostat",cover:"mdi:window-shutter",device_tracker:"mdi:account",fan:"mdi:fan",group:"mdi:google-circles-communities",humidifier:"mdi:air-humidifier",input_boolean:"mdi:toggle-switch",input_button:"mdi:button-pointer",input_datetime:"mdi:calendar-clock",input_number:"mdi:ray-vertex",input_select:"mdi:format-list-bulleted",input_text:"mdi:form-textbox",light:"mdi:lightbulb",lock:"mdi:lock",media_player:"mdi:speaker",number:"mdi:ray-vertex",person:"mdi:account",plant:"mdi:flower",remote:"mdi:remote",scene:"mdi:palette",script:"mdi:script-text",select:"mdi:format-list-bulleted",sensor:"mdi:eye",siren:"mdi:bullhorn",sun:"mdi:white-balance-sunny",switch:"mdi:toggle-switch",timer:"mdi:timer",vacuum:"mdi:robot-vacuum",water_heater:"mdi:thermometer",weather:"mdi:weather-partly-cloudy",zone:"mdi:map-marker"}[e]||"mdi:eye"}}},5064:(e,t,i)=>{function o(e){const t=Boolean(e.template_mode&&e.template),i=Boolean(e.dynamic_icon_template_mode&&e.dynamic_icon_template),o=Boolean(e.dynamic_color_template_mode&&e.dynamic_color_template),n=(t?1:0)+(i?1:0)+(o?1:0);return{hasLegacyTemplates:n>0,hasTemplateMode:t,hasDynamicIconTemplate:i,hasDynamicColorTemplate:o,templateCount:n}}function n(e){const t=o(e);if(!t.hasLegacyTemplates)return{unified_template_mode:!1,unified_template:"",ignore_entity_state_config:!1,migratedFrom:[]};const i=[],n=[];let a=!1;return t.hasTemplateMode&&(i.push("template_mode"),a=!0,t.hasDynamicIconTemplate||n.push(`"icon": ${r(e.template)}`)),t.hasDynamicIconTemplate&&(i.push("dynamic_icon_template"),n.push(`"icon": ${r(e.dynamic_icon_template)}`)),t.hasDynamicColorTemplate&&(i.push("dynamic_color_template"),n.push(`"icon_color": ${r(e.dynamic_color_template)}`)),{unified_template_mode:!0,unified_template:`{ ${n.join(", ")} }`,ignore_entity_state_config:a,migratedFrom:i}}function r(e){if(!e)return'""';const t=e.trim().replace(/\s+/g," ");return t.startsWith("{%")||t.startsWith("{{"),`"${t.replace(/"/g,'\\"')}"`}function a(e){return!e.unified_template_mode&&o(e).hasLegacyTemplates}i.d(t,{Xc:()=>n,aI:()=>o,bk:()=>a})},5121:(e,t,i)=>{function o(e){if(null==e)return{_error:"Template returned undefined or null"};if("object"==typeof e&&!Array.isArray(e)){const t={};if(void 0!==e.icon&&(t.icon=String(e.icon).trim()),void 0!==e.icon_color&&(t.icon_color=String(e.icon_color).trim()),void 0!==e.container_background_color&&(t.container_background_color=String(e.container_background_color).trim()),void 0!==e.name&&(t.name=String(e.name).trim()),void 0!==e.name_color&&(t.name_color=String(e.name_color).trim()),void 0!==e.state_text&&(t.state_text=String(e.state_text).trim()),void 0!==e.state_color&&(t.state_color=String(e.state_color).trim()),void 0!==e.content&&(t.content=String(e.content).trim()),void 0!==e.color&&(t.color=String(e.color).trim()),void 0!==e.value&&(t.value=e.value),void 0!==e.label&&(t.label=String(e.label).trim()),void 0!==e.gauge_color&&(t.gauge_color=String(e.gauge_color).trim()),void 0!==e.colors&&Array.isArray(e.colors)&&(t.colors=e.colors.map((e=>String(e).trim()))),void 0!==e.global_color&&(t.global_color=String(e.global_color).trim()),void 0!==e.fill_area&&(t.fill_area=Boolean(e.fill_area)),void 0!==e.pie_fill){const i="number"==typeof e.pie_fill?e.pie_fill:parseFloat(String(e.pie_fill));isNaN(i)||(t.pie_fill=i)}return void 0!==e.button_background_color&&(t.button_background_color=String(e.button_background_color).trim()),void 0!==e.button_text_color&&(t.button_text_color=String(e.button_text_color).trim()),void 0!==e.value_color&&(t.value_color=String(e.value_color).trim()),void 0!==e.entity&&(t.entity=String(e.entity).trim()),void 0!==e.visible&&(t.visible=Boolean(e.visible)),void 0!==e.overlay_text&&(t.overlay_text=String(e.overlay_text).trim()),void 0!==e.overlay_color&&(t.overlay_color=String(e.overlay_color).trim()),t}const t=String(e).trim();if(""===t)return{_error:"Template returned empty string"};if(t.startsWith("{")&&t.endsWith("}")||t.startsWith("[")&&t.endsWith("]"))try{const e=JSON.parse(t);if("object"!=typeof e||Array.isArray(e))return{_error:"Template must return an object, not an array"};const i={};if(void 0!==e.icon&&(i.icon=String(e.icon).trim()),void 0!==e.icon_color&&(i.icon_color=String(e.icon_color).trim()),void 0!==e.container_background_color&&(i.container_background_color=String(e.container_background_color).trim()),void 0!==e.name&&(i.name=String(e.name).trim()),void 0!==e.name_color&&(i.name_color=String(e.name_color).trim()),void 0!==e.state_text&&(i.state_text=String(e.state_text).trim()),void 0!==e.state_color&&(i.state_color=String(e.state_color).trim()),void 0!==e.content&&(i.content=String(e.content).trim()),void 0!==e.color&&(i.color=String(e.color).trim()),void 0!==e.value&&(i.value=e.value),void 0!==e.label&&(i.label=String(e.label).trim()),void 0!==e.gauge_color&&(i.gauge_color=String(e.gauge_color).trim()),void 0!==e.colors&&Array.isArray(e.colors)&&(i.colors=e.colors.map((e=>String(e).trim()))),void 0!==e.global_color&&(i.global_color=String(e.global_color).trim()),void 0!==e.fill_area&&(i.fill_area=Boolean(e.fill_area)),void 0!==e.pie_fill){const t="number"==typeof e.pie_fill?e.pie_fill:parseFloat(String(e.pie_fill));isNaN(t)||(i.pie_fill=t)}return void 0!==e.button_background_color&&(i.button_background_color=String(e.button_background_color).trim()),void 0!==e.button_text_color&&(i.button_text_color=String(e.button_text_color).trim()),void 0!==e.value_color&&(i.value_color=String(e.value_color).trim()),void 0!==e.entity&&(i.entity=String(e.entity).trim()),void 0!==e.visible&&(i.visible=Boolean(e.visible)),void 0!==e.overlay_text&&(i.overlay_text=String(e.overlay_text).trim()),void 0!==e.overlay_color&&(i.overlay_color=String(e.overlay_color).trim()),i}catch(e){return{_error:`Invalid JSON: ${e instanceof Error?e.message:"Unknown error"}`}}return{icon:t,_isString:!0}}function n(e){return void 0!==e._error}i.d(t,{HD:()=>n,cv:()=>o})},6358:(e,t,i)=>{var o=i(5183),n=i(4276),r=i(1001),a=function(e,t,i,o){var n,r=arguments.length,a=r<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(a=(r<3?n(a):r>3?n(t,i,a):n(t,i))||a);return r>3&&a&&Object.defineProperty(t,i,a),a};const l="uc-open-template-cheatsheet",c=[{key:"entity",type:"string",description:"Entity ID (e.g., sensor.temperature)",snippet:"{{ entity }}"},{key:"state",type:"string",description:"Current entity state value",snippet:"{{ state }}"},{key:"name",type:"string",description:"Custom name or friendly name",snippet:"{{ name }}"},{key:"friendly_name",type:"string",description:"Entity's friendly_name attribute",snippet:"{{ friendly_name }}"},{key:"attributes",type:"object",description:"All entity attributes",snippet:"{{ attributes }}"},{key:"unit",type:"string",description:"Unit of measurement (e.g., °C, %)",snippet:"{{ unit }}"},{key:"domain",type:"string",description:"Entity domain (sensor, light, switch, etc.)",snippet:"{{ domain }}"},{key:"device_class",type:"string",description:"Device class attribute",snippet:"{{ device_class }}"},{key:"state_number",type:"number",description:"Parsed numeric state value",snippet:"{{ state_number }}"},{key:"state_boolean",type:"boolean",description:"Boolean interpretation of state (on/true/yes)",snippet:"{{ state_boolean }}"},{key:"config",type:"object",description:"Config object passed to template",snippet:"{{ config }}"}],s=[{key:"icon",type:"string",description:"Icon name (e.g., mdi:fire)",snippet:'"icon": "mdi:fire"',modules:["icon","info"]},{key:"icon_color",type:"string",description:"Icon color (CSS color value)",snippet:'"icon_color": "red"',modules:["icon","info"]},{key:"container_background_color",type:"string",description:"Container background color",snippet:'"container_background_color": "rgba(255,0,0,0.1)"',modules:["icon","info"]},{key:"name",type:"string",description:"Display name text",snippet:'"name": "{{ friendly_name }}"',modules:["icon","info"]},{key:"name_color",type:"string",description:"Name text color",snippet:'"name_color": "var(--primary-color)"',modules:["icon","info"]},{key:"state_text",type:"string",description:"State value text",snippet:'"state_text": "{{ state }} {{ unit }}"',modules:["icon","info"]},{key:"state_color",type:"string",description:"State text color",snippet:'"state_color": "green"',modules:["icon","info"]},{key:"content",type:"string",description:"Text content (text module)",snippet:'"content": "{{ state }}"',modules:["text"]},{key:"color",type:"string",description:"Text color (text module)",snippet:'"color": "#333"',modules:["text"]},{key:"value",type:"number | string",description:"Bar value",snippet:'"value": {{ state_number }}',modules:["bar"]},{key:"label",type:"string",description:"Bar label text",snippet:'"label": "{{ name }}"',modules:["bar"]},{key:"gauge_color",type:"string",description:"Gauge color",snippet:'"gauge_color": "red"',modules:["gauge"]},{key:"colors",type:"string[]",description:"Array of colors for graphs",snippet:'"colors": ["red","green"]',modules:["graphs"]},{key:"global_color",type:"string",description:"Single color for all graph entities",snippet:'"global_color": "blue"',modules:["graphs"]},{key:"fill_area",type:"boolean",description:"Control line chart area fill",snippet:'"fill_area": true',modules:["graphs"]},{key:"pie_fill",type:"number | string",description:"Pie/donut slice fill percentage",snippet:'"pie_fill": 0.8',modules:["graphs"]},{key:"button_background_color",type:"string",description:"Spinbox button background",snippet:'"button_background_color": "#333"',modules:["spinbox"]},{key:"button_text_color",type:"string",description:"Spinbox button text color",snippet:'"button_text_color": "#fff"',modules:["spinbox"]},{key:"value_color",type:"string",description:"Spinbox value text color",snippet:'"value_color": "#000"',modules:["spinbox"]},{key:"entity",type:"string",description:"Camera entity ID",snippet:'"entity": "camera.front_door"',modules:["camera"]},{key:"visible",type:"boolean",description:"Camera visibility",snippet:'"visible": true',modules:["camera"]},{key:"overlay_text",type:"string",description:"Camera overlay text",snippet:'"overlay_text": "Live"',modules:["camera"]},{key:"overlay_color",type:"string",description:"Camera overlay text color",snippet:'"overlay_color": "white"',modules:["camera"]}],d={icon:[{label:"Simple icon by temperature",code:"{% if state|int > 25 %}mdi:fire{% else %}mdi:snowflake{% endif %}"},{label:"Battery icon and color",code:'{% set level = state | int %}\n{\n  "icon": "mdi:battery-{{ (level / 10) | round(0) * 10 }}",\n  "icon_color": "{% if level <= 20 %}#FF0000{% elif level <= 50 %}#FF8800{% else %}#00CC00{% endif %}"\n}'}],info:[{label:"Icon and color by state",code:'{\n  "icon": "{% if state|int > 25 %}mdi:fire{% else %}mdi:snowflake{% endif %}",\n  "icon_color": "{% if state|int > 25 %}red{% else %}blue{% endif %}",\n  "state_text": "{{ state }} {{ unit }}"\n}'},{label:"Full styling",code:'{\n  "name": "{{ friendly_name }}",\n  "state_text": "{{ state }}°F",\n  "icon_color": "{% if state|int > 75 %}#FF0000{% else %}#00FF00{% endif %}",\n  "container_background_color": "rgba(255, 0, 0, 0.1)"\n}'}]};let p=class extends o.WF{constructor(){super(...arguments),this.module="info",this.open=!1,this._activeTab="context",this._copiedKey=null,this._openCheatsheetHandler=e=>{var t;const i=e.detail;this.module=null!==(t=null==i?void 0:i.module)&&void 0!==t?t:"info",this.open=!0}}connectedCallback(){super.connectedCallback(),document.addEventListener(l,this._openCheatsheetHandler)}disconnectedCallback(){document.removeEventListener(l,this._openCheatsheetHandler),super.disconnectedCallback()}render(){if(!this.open)return o.qy``;const e=s.filter((e=>e.modules.includes(this.module))),t=d[this.module]||[];return o.qy`
      <div class="dialog-overlay" @click=${this._handleOverlayClick}>
        <div class="dialog-content" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">
            <h3>Template Cheatsheet</h3>
            <button class="close-btn" @click=${this._close} aria-label="Close">
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>

          <div class="tabs">
            <button
              class="tab ${"context"===this._activeTab?"active":""}"
              @click=${()=>this._activeTab="context"}
            >
              Context Variables
            </button>
            <button
              class="tab ${"properties"===this._activeTab?"active":""}"
              @click=${()=>this._activeTab="properties"}
            >
              Return Properties
            </button>
          </div>

          <div class="dialog-body">
            ${"context"===this._activeTab?o.qy`
                  <p class="section-desc">
                    Use these variables inside <code>{{ }}</code> or <code>{% %}</code> in your template.
                  </p>
                  <div class="entries">
                    ${c.map((e=>o.qy`
                          <div class="entry">
                            <div class="entry-top">
                              <div class="entry-main">
                                <code class="chip">${e.key}</code>
                                <span class="type">${e.type}</span>
                              </div>
                              <div class="entry-actions">
                                <button
                                  class="action-btn"
                                  @click=${()=>this._copyOrInsert(e.snippet,e.key)}
                                  title="Copy to clipboard"
                                >
                                  <span class="action-btn-icon"><ha-icon icon="mdi:content-copy"></ha-icon></span>
                                  <span class="action-btn-text">${this._copiedKey===e.key?"Copied!":"Copy"}</span>
                                </button>
                              </div>
                            </div>
                            <div class="entry-desc">${e.description}</div>
                            <div class="entry-snippet"><code>${e.snippet}</code></div>
                          </div>
                        `))}
                  </div>
                `:o.qy`
                  <p class="section-desc">
                    Return these properties in a JSON object from your template (Info/Icon modules).
                  </p>
                  <div class="entries">
                    ${e.map((e=>o.qy`
                          <div class="entry">
                            <div class="entry-top">
                              <div class="entry-main">
                                <code class="chip">${e.key}</code>
                                <span class="type">${e.type}</span>
                              </div>
                              <div class="entry-actions">
                                <button
                                  class="action-btn"
                                  @click=${()=>this._copyOrInsert(e.snippet,e.key)}
                                  title="Copy to clipboard"
                                >
                                  <span class="action-btn-icon"><ha-icon icon="mdi:content-copy"></ha-icon></span>
                                  <span class="action-btn-text">${this._copiedKey===e.key?"Copied!":"Copy"}</span>
                                </button>
                              </div>
                            </div>
                            <div class="entry-desc">${e.description}</div>
                            <div class="entry-snippet"><code>${e.snippet}</code></div>
                          </div>
                        `))}
                  </div>
                `}

            ${t.length>0?o.qy`
                  <div class="examples-section">
                    <h4>Example Templates</h4>
                    ${t.map((e=>o.qy`
                          <div class="example-block">
                            <div class="example-label">${e.label}</div>
                            <div class="example-code">
                              <pre><code>${e.code}</code></pre>
                              <button
                                class="copy-full-btn"
                                @click=${()=>this._copyOrInsert(e.code,`example-${e.label}`)}
                              >
                                <span class="action-btn-icon"><ha-icon icon="mdi:content-copy"></ha-icon></span>
                                <span>Copy</span>
                              </button>
                            </div>
                          </div>
                        `))}
                  </div>
                `:""}
          </div>
        </div>
      </div>
    `}_handleOverlayClick(e){e.target===e.currentTarget&&this._close()}_close(){this.open=!1,this._copiedKey=null,this.dispatchEvent(new CustomEvent("close"))}async _copyOrInsert(e,t){try{const i=navigator;i.clipboard&&i.clipboard.writeText&&await i.clipboard.writeText(e),this._copiedKey=t,setTimeout((()=>this._copiedKey=null),1500),this.dispatchEvent(new CustomEvent("insert-snippet",{detail:{value:e},bubbles:!0,composed:!0}))}catch(e){console.warn("[UltraCard] Failed to copy:",e)}}};p.styles=o.AH`
    :host {
      display: contents;
    }

    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: ${r.Mu.DIALOG_OVERLAY};
      padding: 16px;
    }

    .dialog-content {
      background: var(--card-background-color);
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      z-index: ${r.Mu.DIALOG_CONTENT};
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--divider-color);
      flex-shrink: 0;
    }

    .dialog-header h3 {
      margin: 0;
      font-size: 17px;
      font-weight: 600;
      color: var(--primary-text-color);
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
      color: var(--secondary-text-color);
      border-radius: 4px;
      opacity: 0.8;
    }

    .close-btn:hover {
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      opacity: 1;
    }

    .close-btn ha-icon {
      width: 20px;
      height: 20px;
    }

    .tabs {
      display: flex;
      gap: 0;
      padding: 0 20px;
      border-bottom: 1px solid var(--divider-color);
      flex-shrink: 0;
    }

    .tab {
      background: none;
      border: none;
      padding: 12px 16px;
      font-size: 13px;
      color: var(--secondary-text-color);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: color 0.15s ease;
    }

    .tab:hover {
      color: var(--primary-text-color);
    }

    .tab.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
      font-weight: 500;
    }

    .dialog-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px 20px;
    }

    .section-desc {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin: 0 0 14px;
      line-height: 1.5;
    }

    .section-desc code {
      background: rgba(var(--rgb-primary-color), 0.08);
      padding: 2px 5px;
      border-radius: 3px;
      font-family: ui-monospace, monospace;
      font-size: 11px;
    }

    .entries {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .entry {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 10px 12px;
      background: var(--secondary-background-color);
      border-radius: 6px;
      border: 1px solid transparent;
      transition: background 0.15s ease;
    }

    .entry:hover {
      background: rgba(var(--rgb-primary-color), 0.06);
    }

    .entry-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-width: 0;
    }

    .entry-main {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .chip {
      background: rgba(var(--rgb-primary-color), 0.12);
      padding: 3px 7px;
      border-radius: 4px;
      font-family: ui-monospace, monospace;
      font-size: 12px;
      font-weight: 500;
      color: var(--primary-color);
    }

    .type {
      font-size: 11px;
      color: var(--secondary-text-color);
      opacity: 0.9;
    }

    .entry-desc {
      font-size: 12px;
      color: var(--primary-text-color);
      line-height: 1.4;
      margin: 0;
    }

    .entry-snippet {
      font-size: 11px;
      margin: 0;
    }

    .entry-snippet code {
      background: var(--code-editor-background-color, #1a1a1a);
      padding: 8px 10px;
      border-radius: 4px;
      display: block;
      overflow-x: auto;
      font-family: ui-monospace, monospace;
      font-size: 11px;
      color: var(--primary-text-color);
      line-height: 1.4;
    }

    .entry-actions {
      flex-shrink: 0;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      font-size: 11px;
      background: var(--primary-color);
      color: var(--text-primary-color, white);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: opacity 0.15s ease;
      box-sizing: border-box;
      overflow: hidden;
    }

    .action-btn:hover {
      opacity: 0.92;
    }

    .action-btn-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 14px;
      height: 14px;
      line-height: 0;
      overflow: hidden;
    }

    .action-btn-icon ha-icon {
      --mdc-icon-size: 14px;
      width: 14px !important;
      height: 14px !important;
      min-width: 14px;
      min-height: 14px;
      max-width: 14px;
      max-height: 14px;
      display: block;
    }

    .action-btn-text {
      white-space: nowrap;
    }

    .examples-section {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--divider-color);
    }

    .examples-section h4 {
      margin: 0 0 10px;
      font-size: 13px;
      font-weight: 600;
      color: var(--primary-text-color);
    }

    .example-block {
      margin-bottom: 14px;
    }

    .example-block:last-child {
      margin-bottom: 0;
    }

    .example-label {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-bottom: 6px;
    }

    .example-code {
      position: relative;
    }

    .example-code pre {
      margin: 0;
      padding: 10px 12px 10px 10px;
      padding-right: 56px;
      background: var(--code-editor-background-color, #1a1a1a);
      border-radius: 6px;
      overflow-x: auto;
      font-size: 11px;
      font-family: ui-monospace, monospace;
      color: var(--primary-text-color);
      line-height: 1.45;
    }

    .copy-full-btn {
      position: absolute;
      top: 6px;
      right: 6px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 5px 10px;
      font-size: 11px;
      background: rgba(255, 255, 255, 0.08);
      color: var(--primary-text-color);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .copy-full-btn:hover {
      background: var(--primary-color);
      color: var(--text-primary-color, white);
      border-color: var(--primary-color);
    }

    .copy-full-btn .action-btn-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      line-height: 0;
    }

    .copy-full-btn .action-btn-icon ha-icon {
      width: 12px !important;
      height: 12px !important;
      min-width: 12px;
      min-height: 12px;
      display: block;
    }
  `,a([(0,n.MZ)({type:String})],p.prototype,"module",void 0),a([(0,n.MZ)({type:Boolean})],p.prototype,"open",void 0),a([(0,n.wk)()],p.prototype,"_activeTab",void 0),a([(0,n.wk)()],p.prototype,"_copiedKey",void 0),p=a([(0,n.EM)("uc-template-cheatsheet")],p)},9327:(e,t,i)=>{function o(e,t,i){var o;const n=null===(o=null==t?void 0:t.states)||void 0===o?void 0:o[e];if(!n)return{entity:e,state:"unavailable",name:(null==i?void 0:i.name)||e,attributes:{},unit:"",domain:e.split(".")[0]||"unknown",device_class:"",friendly_name:(null==i?void 0:i.name)||e,config:i||{}};const r=e.split(".")[0],a=n.attributes||{};return{entity:e,state:n.state,name:(null==i?void 0:i.name)||a.friendly_name||e,attributes:a,unit:a.unit_of_measurement||"",domain:r,device_class:a.device_class||"",friendly_name:a.friendly_name||"",config:i||{},state_number:parseFloat(n.state),state_boolean:"on"===n.state||"true"===n.state||"yes"===n.state}}function n(e,t,i){const n=e.map(((e,n)=>{const r=null==i?void 0:i[n];return o(e,t,r)})),r=n[0]||{entity:"",state:"unavailable",name:"",attributes:{},unit:"",domain:"unknown",device_class:"",friendly_name:"",config:{}};return Object.assign(Object.assign({},r),{entities:n})}i.d(t,{pL:()=>o,wI:()=>n})},9760:(e,t,i)=>{i.d(t,{formatEntityState:()=>n});var o=i(9811);const n=(e,t,i)=>{var n,r;const a=!1!==(null==i?void 0:i.includeUnit),l=null===(n=null==e?void 0:e.states)||void 0===n?void 0:n[t];if(!e||!l)return void 0!==(null==i?void 0:i.state)?String(i.state):"";const c=e.formatEntityState,s=c?c(l,void 0!==(null==i?void 0:i.state)?String(i.state):void 0):(0,o.computeStateDisplay)(e.localize,l,e.locale,null==i?void 0:i.state);if(a)return s;const d=null===(r=l.attributes)||void 0===r?void 0:r.unit_of_measurement;if(d&&"string"==typeof s){const e=` ${d}`;if(s.endsWith(e))return s.slice(0,-e.length)}return s}}}]);