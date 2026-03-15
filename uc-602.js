"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[602],{602:(e,t,o)=>{o.r(t),o.d(t,{UltraDynamicListModule:()=>z});var i=o(5183),n=o(7475),a=o(5147),s=o(8938),l=o(5320);const r="__uvc_todo_cache";class d{constructor(){this._unsubByEntity=new Map,this._callbacksByEntity=new Map}async getItems(e,t,o){if(!e||!t)return[];e[r]||(e[r]=Object.create(null));const i=e[r],n=()=>{if(o){let e=this._callbacksByEntity.get(t);e||(e=new Set,this._callbacksByEntity.set(t,e)),e.add(o)}},a=()=>{const e=this._callbacksByEntity.get(t);e&&e.forEach((e=>{try{e()}catch(e){}}))},s=async()=>{var o,n,a,s;try{const l=await e.callService("todo","get_items",{entity_id:t},void 0,!0,!0);fetch("http://127.0.0.1:7242/ingest/36063b29-f1db-4787-bed7-95c789116512",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"c2200c"},body:JSON.stringify({sessionId:"c2200c",location:"uc-todo-service.ts:fetchAndCache",message:"todo.get_items result",data:{entityId:t,hasResponse:!!(null==l?void 0:l.response),responseKeys:(null==l?void 0:l.response)?Object.keys(l.response):[],entryKeys:(null===(o=null==l?void 0:l.response)||void 0===o?void 0:o[t])?Object.keys(l.response[t]||{}):[],firstEntryItemsLength:Array.isArray(null===(a=null===(n=null==l?void 0:l.response)||void 0===n?void 0:n[t])||void 0===a?void 0:a.items)?l.response[t].items.length:"n/a"},timestamp:Date.now(),hypothesisId:"F"})}).catch((()=>{}));const r=null!==(s=null==l?void 0:l.response)&&void 0!==s?s:{};let d=[];const c=r[t];if(Array.isArray(null==c?void 0:c.items))d=c.items;else if(Array.isArray(null==c?void 0:c.todo_items))d=c.todo_items;else if(Array.isArray(c))d=c;else if(Array.isArray(r))d=r;else if("object"==typeof r&&null!==r){const e=Object.keys(r).find((e=>e.startsWith("todo."))),t=e?r[e]:void 0;Array.isArray(null==t?void 0:t.items)?d=t.items:Array.isArray(null==t?void 0:t.todo_items)?d=t.todo_items:Array.isArray(t)&&(d=t)}return 0===d.length&&(c||r&&Object.keys(r).length>0)&&console.warn("[UltraCard] todo.get_items: unexpected response shape",{entityId:t,responseKeys:Object.keys(r),entry:c?Object.keys(c):null}),i[t]=d,d}catch(e){return console.warn("[UltraCard] todo.get_items failed for",t,e),i[t]=[],[]}};if(void 0!==i[t])return n(),this._ensureSubscription(e,t,s,a),i[t];const l=await s();return n(),this._ensureSubscription(e,t,s,a),l}_ensureSubscription(e,t,o,i){if(this._unsubByEntity.has(t))return;const n=e.connection;(null==n?void 0:n.subscribeEvents)&&n.subscribeEvents((e=>{var n;(null===(n=null==e?void 0:e.data)||void 0===n?void 0:n.entity_id)===t&&o().then((()=>i()))}),"state_changed").then((e=>{this._unsubByEntity.set(t,e)})).catch((()=>{}))}unsubscribeEntity(e){const t=this._unsubByEntity.get(e);if(t){try{t()}catch(e){}this._unsubByEntity.delete(e)}this._callbacksByEntity.delete(e)}}var c=o(5155),p=o(5255),m=o(230),u=o(378),v=o(6478);o(9654),o(7921);const y="{# Todo Template — full control over how each item renders.\n   Available variables:\n     items   — list of todo item objects with keys:\n                 summary, status, due, description, uid, entity_id\n   Output a JSON array of module configs via | tojson. #}\n{% set ns = namespace(mods=[]) %}\n{% for item in items %}\n  {% set is_done = item.status == 'completed' %}\n  {% set color = '#9e9e9e' if is_done else 'var(--primary-text-color)' %}\n  {% set icon  = 'mdi:checkbox-marked-circle' if is_done else 'mdi:checkbox-blank-circle-outline' %}\n  {% set label = item.summary ~ (' ✓' if is_done else '') %}\n  {% set label = label ~ (' — ' ~ item.due if item.due else '') %}\n  {% set mod = {\n    'id': 'todo_tpl_' ~ loop.index,\n    'type': 'text',\n    'text': label,\n    'color': color,\n    'icon': icon,\n    'icon_position': 'before',\n    'display_mode': 'always', 'display_conditions': []\n  } %}\n  {% set ns.mods = ns.mods + [mod] %}\n{% endfor %}\n{{ ns.mods | tojson }}",h="{# Action Template — build modules from a HA service response.\n   'response' holds the raw return value of your configured action.\n   For todo.get_items with entity_id 'todo.shopping' the structure is:\n     response['todo.shopping']['items']  — list of items\n\n   Adapt the path below to match your own service response shape. #}\n{% set entity = 'todo.shopping' %}\n{% set raw = response.get(entity, {}).get('items', []) %}\n{% set ns = namespace(mods=[]) %}\n{% for item in raw %}\n  {% set is_done = item.status == 'completed' %}\n  {% set mod = {\n    'id': 'act_' ~ loop.index,\n    'type': 'text',\n    'text': item.summary ~ (' ✓' if is_done else ''),\n    'color': '#4caf50' if is_done else 'var(--primary-text-color)',\n    'display_mode': 'always', 'display_conditions': []\n  } %}\n  {% set ns.mods = ns.mods + [mod] %}\n{% endfor %}\n{{ ns.mods | tojson }}",_="{# Doors & Windows — shows open/closed with color-coded icon #}\n{% set sensors = [\n  {'entity': 'binary_sensor.front_door',        'name': 'Front Door',        'icon_on': 'mdi:door-open',    'icon_off': 'mdi:door-closed'},\n  {'entity': 'binary_sensor.back_door',         'name': 'Back Door',         'icon_on': 'mdi:door-open',    'icon_off': 'mdi:door-closed'},\n  {'entity': 'binary_sensor.garage_door',       'name': 'Garage',            'icon_on': 'mdi:garage-open',  'icon_off': 'mdi:garage'},\n  {'entity': 'binary_sensor.living_room_window','name': 'Living Room Window','icon_on': 'mdi:window-open',  'icon_off': 'mdi:window-closed'},\n  {'entity': 'binary_sensor.bedroom_window',   'name': 'Bedroom Window',    'icon_on': 'mdi:window-open',  'icon_off': 'mdi:window-closed'}\n] %}\n{% set ns = namespace(mods=[]) %}\n{% for s in sensors %}\n  {% set is_open = states(s.entity) == 'on' %}\n  {% set icon_item = {\n    'id': 'ii_' ~ loop.index,\n    'icon_mode': 'entity',\n    'entity': s.entity,\n    'name': s.name,\n    'icon_inactive': s.icon_off,\n    'icon_active':   s.icon_on,\n    'active_state':  'on',\n    'inactive_icon_color': '#4caf50',\n    'active_icon_color':   '#f44336',\n    'show_name_when_inactive': true, 'show_state_when_inactive': true, 'show_icon_when_inactive': true,\n    'show_name_when_active':   true, 'show_state_when_active':   true, 'show_icon_when_active':   true\n  } %}\n  {% set mod = {'id': 'dw_' ~ loop.index, 'type': 'icon', 'icons': [icon_item], 'display_mode': 'always', 'display_conditions': []} %}\n  {% set ns.mods = ns.mods + [mod] %}\n{% endfor %}\n{{ ns.mods | tojson }}",g="{# Tire Pressure — bar per wheel, color changes at thresholds #}\n{% set wheels = [\n  {'entity': 'sensor.car_tyre_pressure_front_left',  'name': 'Front Left'},\n  {'entity': 'sensor.car_tyre_pressure_front_right', 'name': 'Front Right'},\n  {'entity': 'sensor.car_tyre_pressure_rear_left',   'name': 'Rear Left'},\n  {'entity': 'sensor.car_tyre_pressure_rear_right',  'name': 'Rear Right'}\n] %}\n{% set ns = namespace(mods=[]) %}\n{% for w in wheels %}\n  {% set psi = states(w.entity) | float(0) | round(1) %}\n  {% set color = '#f44336' if psi < 30 or psi > 38 else ('#ff9800' if psi < 32 or psi > 36 else '#4caf50') %}\n  {% set mod = {\n    'id': 'tyre_' ~ loop.index,\n    'type': 'bar',\n    'entity': w.entity,\n    'name': w.name ~ ' (' ~ psi ~ ' psi)',\n    'bar_color': color,\n    'display_mode': 'always',\n    'display_conditions': []\n  } %}\n  {% set ns.mods = ns.mods + [mod] %}\n{% endfor %}\n{{ ns.mods | tojson }}",f="{# Lights — icon shows on/off, dimmer % shown in state text #}\n{% set lights = [\n  {'entity': 'light.living_room', 'name': 'Living Room'},\n  {'entity': 'light.kitchen',     'name': 'Kitchen'},\n  {'entity': 'light.bedroom',     'name': 'Bedroom'},\n  {'entity': 'light.hallway',     'name': 'Hallway'}\n] %}\n{% set ns = namespace(mods=[]) %}\n{% for l in lights %}\n  {% set is_on = states(l.entity) == 'on' %}\n  {% set brightness = (state_attr(l.entity, 'brightness') | int(0) / 255 * 100) | round(0) %}\n  {% set state_label = brightness ~ '%' if is_on else 'Off' %}\n  {% set icon_item = {\n    'id': 'li_' ~ loop.index,\n    'icon_mode': 'entity',\n    'entity': l.entity,\n    'name': l.name,\n    'icon_inactive': 'mdi:lightbulb-outline',\n    'icon_active':   'mdi:lightbulb',\n    'active_state':  'on',\n    'inactive_icon_color': '#9e9e9e',\n    'active_icon_color':   '#ffc107',\n    'show_name_when_inactive': true, 'show_state_when_inactive': true, 'show_icon_when_inactive': true,\n    'show_name_when_active':   true, 'show_state_when_active':   true, 'show_icon_when_active':   true\n  } %}\n  {% set mod = {'id': 'lt_' ~ loop.index, 'type': 'icon', 'icons': [icon_item], 'display_mode': 'always', 'display_conditions': []} %}\n  {% set ns.mods = ns.mods + [mod] %}\n{% endfor %}\n{{ ns.mods | tojson }}",b="{# Temperature sensors — text with hot/cold color coding #}\n{% set sensors = [\n  {'entity': 'sensor.living_room_temperature', 'name': 'Living Room'},\n  {'entity': 'sensor.bedroom_temperature',     'name': 'Bedroom'},\n  {'entity': 'sensor.outdoor_temperature',     'name': 'Outdoor'},\n  {'entity': 'sensor.garage_temperature',      'name': 'Garage'}\n] %}\n{% set ns = namespace(mods=[]) %}\n{% for s in sensors %}\n  {% set temp = states(s.entity) | float(0) | round(1) %}\n  {% set unit = state_attr(s.entity, 'unit_of_measurement') | default('°') %}\n  {% set color = '#f44336' if temp > 26 else ('#2196f3' if temp < 18 else '#4caf50') %}\n  {% set mod = {\n    'id': 'temp_' ~ loop.index,\n    'type': 'text',\n    'text': s.name ~ ':  ' ~ temp ~ unit,\n    'color': color,\n    'display_mode': 'always',\n    'display_conditions': []\n  } %}\n  {% set ns.mods = ns.mods + [mod] %}\n{% endfor %}\n{{ ns.mods | tojson }}",x="{# CPU & Memory bars — red above 80%, orange above 50% #}\n{% set sensors = [\n  {'entity': 'sensor.processor_use',    'name': 'CPU'},\n  {'entity': 'sensor.memory_use_percent','name': 'Memory'},\n  {'entity': 'sensor.disk_use_percent', 'name': 'Disk'}\n] %}\n{% set ns = namespace(mods=[]) %}\n{% for s in sensors %}\n  {% set val = states(s.entity) | float(0) | round(1) %}\n  {% set color = '#f44336' if val > 80 else ('#ff9800' if val > 50 else '#4caf50') %}\n  {% set mod = {\n    'id': 'sys_' ~ loop.index,\n    'type': 'bar',\n    'entity': s.entity,\n    'name': s.name ~ ' — ' ~ val ~ '%',\n    'bar_color': color,\n    'display_mode': 'always',\n    'display_conditions': []\n  } %}\n  {% set ns.mods = ns.mods + [mod] %}\n{% endfor %}\n{{ ns.mods | tojson }}",w="\n  background: rgba(var(--rgb-primary-color, 33,150,243), 0.1);\n  padding: 10px 14px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n",$="\n  margin: 0;\n  padding: 12px 14px;\n  font-size: 11px;\n  line-height: 1.6;\n  background: var(--code-editor-background-color, #1e1e1e);\n  color: var(--code-editor-text-color, #d4d4d4);\n  font-family: 'Fira Code', Consolas, monospace;\n  overflow-x: auto;\n  white-space: pre-wrap;\n",k="\n  background: var(--primary-color);\n  color: white;\n  border: none;\n  border-radius: 6px;\n  padding: 6px 12px;\n  font-size: 12px;\n  font-weight: 600;\n  cursor: pointer;\n  white-space: nowrap;\n",S="\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 4px;\n  width: 100%;\n  padding: 8px 12px;\n  background: rgba(var(--rgb-primary-color, 33,150,243), 0.12);\n  color: var(--primary-color);\n  border: 1px solid rgba(var(--rgb-primary-color, 33,150,243), 0.3);\n  border-radius: 8px;\n  font-size: 13px;\n  font-weight: 600;\n  cursor: pointer;\n",j="\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(var(--rgb-primary-color, 33,150,243), 0.12);\n  color: var(--primary-color);\n  border: 1px solid rgba(var(--rgb-primary-color, 33,150,243), 0.3);\n  border-radius: 6px;\n  padding: 4px;\n  cursor: pointer;\n";class z extends n.m{constructor(){super(...arguments),this._templateService=null,this._todoService=null,this._expandedModules=new Map,this._currentPage=new Map,this._actionCache=new Map,this._actionFetching=new Set,this._actionTimers=new Map,this.metadata={type:"dynamic-list",title:"Dynamic List",description:"Generate a list of modules dynamically using a Jinja2 template",author:"WJD Designs",version:"1.0.0",icon:"mdi:code-braces",category:"layout",tags:["dynamic","template","jinja2","list","loop","layout"]}}_hashString(e){let t=0;for(let o=0;o<e.length;o+=1)t=(t<<5)-t+e.charCodeAt(o)&4294967295;return Math.abs(t).toString(36)}createDefault(e){return{id:e||this.generateId("dynamic-list"),type:"dynamic-list",source_type:"template",dynamic_template:_,todo_entity:void 0,todo_entities:[],todo_statuses:[],todo_item_template:{module_type:"text",primary_field:"summary",secondary_field:"due",icon:"mdi:checkbox-marked-circle-outline"},todo_dynamic_template:y,action_source:{domain:"todo",service:"get_items",service_data:{},watch_entities:[],refresh_interval:0},action_template:h,direction:"horizontal",gap:8,wrap:!0,columns:4,rows:0,limit:0,limit_behavior:"show_more",align_h:"center",align_v:"center",tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}renderGeneralTab(e,t,o,n){var a,s,l,r,d,c,p,m,u,S,j,z,T,A,O,C,D,E,L;const I=e,q=(null===(a=null==t?void 0:t.locale)||void 0===a?void 0:a.language)||"en",J=(()=>{const e=String(I.source_type||"template").toLowerCase();return"todo"===e?"todo":"todo-template"===e?"todo-template":"action"===e?"action":"template"})(),P="todo"===J,M="todo-template"===J,N="action"===J,U=I.todo_item_template||{module_type:"text",primary_field:"summary",secondary_field:"due",icon:"mdi:checkbox-marked-circle-outline"};return i.qy`
      ${this.injectUcFormStyles()}
      <style>
        .dynamic-list-editor ha-form { display: block; }
        .dynamic-list-editor ha-form .form-group { margin-bottom: 8px; }
        .dynamic-list-editor ha-form ha-select,
        .dynamic-list-editor ha-form .mdc-select { min-height: 40px; height: auto; }
        .dynamic-list-editor ha-form ha-select .mdc-select__anchor { min-height: 40px; }
      </style>
      <div class="module-general-settings ultra-clean-form dynamic-list-editor">

        <!-- Source type: Template vs Todo List (dropdown) -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 12px; letter-spacing: 0.5px;"
          >
            Source
          </div>
          <div class="field-group" style="margin-bottom: 0;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">List source</label>
            <ha-selector
              .hass=${t}
              .selector=${{select:{options:[{value:"template",label:"Jinja2 Template"},{value:"todo",label:"Todo List (field mapping)"},{value:"todo-template",label:"Todo List + Jinja2 Template"},{value:"action",label:"HA Action / Service call"}]}}}
              .value=${J}
              @value-changed=${e=>n({source_type:e.detail.value||"template"})}
            ></ha-selector>
          </div>
        </div>

        ${P?i.qy`
        <!-- ── Todo List (field mapping) source ─────────────────────────────── -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 4px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;"
          >
            <ha-icon icon="mdi:format-list-checks" style="--mdc-icon-size: 20px;"></ha-icon>
            Todo List
          </div>
          <div
            class="field-description"
            style="font-size: 12px; margin-bottom: 12px; color: var(--secondary-text-color); line-height: 1.5;"
          >
            Use one or more to-do list entities (e.g. Local Todo, M365). Items are fetched via <code>todo.get_items</code>. Combine multiple lists (e.g. M365 sub-lists) by adding them in "Also include".
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Todo list</label>
            <ha-selector
              .hass=${t}
              .selector=${{select:{options:[{value:"",label:"Default (first available)"},...t.states?Object.keys(t.states).filter((e=>e.startsWith("todo."))).map((e=>{var o,i;return{value:e,label:(null===(i=null===(o=t.states[e])||void 0===o?void 0:o.attributes)||void 0===i?void 0:i.friendly_name)||e}})):[]]}}}
              .value=${null!==(s=I.todo_entity)&&void 0!==s?s:""}
              @value-changed=${e=>n({todo_entity:e.detail.value||void 0})}
            ></ha-selector>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Also include</label>
            <ha-selector
              .hass=${t}
              .selector=${{select:{multiple:!0,options:[{value:"",label:"Default (first available)"},...t.states?Object.keys(t.states).filter((e=>e.startsWith("todo."))).map((e=>{var o,i;return{value:e,label:(null===(i=null===(o=t.states[e])||void 0===o?void 0:o.attributes)||void 0===i?void 0:i.friendly_name)||e}})):[]]}}}
              .value=${I.todo_entities||[]}
              @value-changed=${e=>n({todo_entities:Array.isArray(e.detail.value)?e.detail.value:[]})}
            ></ha-selector>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Show statuses</label>
            <ha-selector
              .hass=${t}
              .selector=${{select:{options:[{value:"both",label:"Both"},{value:"needs_action",label:"Needs action only"},{value:"completed",label:"Completed only"}]}}}
              .value=${(()=>{const e=I.todo_statuses||[];return 0===e.length||2===e.length?"both":"completed"===e[0]?"completed":"needs_action"})()}
              @value-changed=${e=>{const t=e.detail.value;n({todo_statuses:"both"===t?[]:"completed"===t?["completed"]:["needs_action"]})}}
            ></ha-selector>
          </div>
          <div class="field-group" style="margin-bottom: 8px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Item display</label>
            <ha-selector
              .hass=${t}
              .selector=${{select:{options:[{value:"text",label:"Text (primary + secondary)"},{value:"icon",label:"Icon"},{value:"bar",label:"Bar"}]}}}
              .value=${U.module_type||"text"}
              @value-changed=${e=>n({todo_item_template:Object.assign(Object.assign({},U),{module_type:e.detail.value||"text"})})}
            ></ha-selector>
          </div>
          <div class="field-group" style="margin-bottom: 8px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Primary field</label>
            <ha-selector
              .hass=${t}
              .selector=${{select:{options:[{value:"summary",label:"Summary"},{value:"description",label:"Description"},{value:"due",label:"Due date"},{value:"status",label:"Status"}]}}}
              .value=${U.primary_field||"summary"}
              @value-changed=${e=>n({todo_item_template:Object.assign(Object.assign({},U),{primary_field:e.detail.value||"summary"})})}
            ></ha-selector>
          </div>
          <div class="field-group" style="margin-bottom: 8px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Secondary field</label>
            <ha-selector
              .hass=${t}
              .selector=${{select:{options:[{value:"none",label:"None"},{value:"summary",label:"Summary"},{value:"description",label:"Description"},{value:"due",label:"Due date"},{value:"status",label:"Status"}]}}}
              .value=${null!==(l=U.secondary_field)&&void 0!==l?l:"due"}
              @value-changed=${e=>n({todo_item_template:Object.assign(Object.assign({},U),{secondary_field:"none"===e.detail.value?void 0:e.detail.value})})}
            ></ha-selector>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Icon (default / fallback)</label>
            <ha-icon-picker
              .hass=${t}
              .value=${U.icon||"mdi:checkbox-marked-circle-outline"}
              @value-changed=${e=>n({todo_item_template:Object.assign(Object.assign({},U),{icon:e.detail.value||"mdi:checkbox-marked-circle-outline"})})}
            ></ha-icon-picker>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Icon when incomplete</label>
            <ha-icon-picker
              .hass=${t}
              .value=${null!==(d=null!==(r=U.icon_incomplete)&&void 0!==r?r:U.icon)&&void 0!==d?d:"mdi:checkbox-marked-circle-outline"}
              @value-changed=${e=>n({todo_item_template:Object.assign(Object.assign({},U),{icon_incomplete:e.detail.value||void 0})})}
            ></ha-icon-picker>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Icon color when incomplete</label>
            <ultra-color-picker
              .hass=${t}
              .value=${null!==(c=U.icon_color_incomplete)&&void 0!==c?c:""}
              .defaultValue=${"var(--secondary-text-color)"}
              @value-changed=${e=>{var t;return n({todo_item_template:Object.assign(Object.assign({},U),{icon_color_incomplete:null!==(t=e.detail.value)&&void 0!==t?t:void 0})})}}
            ></ultra-color-picker>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Icon when completed</label>
            <ha-icon-picker
              .hass=${t}
              .value=${null!==(m=null!==(p=U.icon_completed)&&void 0!==p?p:U.icon)&&void 0!==m?m:"mdi:checkbox-marked-circle"}
              @value-changed=${e=>n({todo_item_template:Object.assign(Object.assign({},U),{icon_completed:e.detail.value||void 0})})}
            ></ha-icon-picker>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Icon color when completed</label>
            <ultra-color-picker
              .hass=${t}
              .value=${null!==(u=U.icon_color_completed)&&void 0!==u?u:""}
              .defaultValue=${"var(--primary-color)"}
              @value-changed=${e=>{var t;return n({todo_item_template:Object.assign(Object.assign({},U),{icon_color_completed:null!==(t=e.detail.value)&&void 0!==t?t:void 0})})}}
            ></ultra-color-picker>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Icon position</label>
            <ha-selector
              .hass=${t}
              .selector=${{select:{options:[{value:"before",label:"Before text"},{value:"after",label:"After text"},{value:"none",label:"None (hide icon)"}]}}}
              .value=${null!==(S=U.icon_position)&&void 0!==S?S:"before"}
              @value-changed=${e=>n({todo_item_template:Object.assign(Object.assign({},U),{icon_position:e.detail.value||"before"})})}
            ></ha-selector>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Text alignment</label>
            <ha-selector
              .hass=${t}
              .selector=${{select:{options:[{value:"left",label:"Left"},{value:"center",label:"Center"},{value:"right",label:"Right"},{value:"justify",label:"Justify"}]}}}
              .value=${null!==(j=U.alignment)&&void 0!==j?j:"left"}
              @value-changed=${e=>n({todo_item_template:Object.assign(Object.assign({},U),{alignment:e.detail.value||"left"})})}
            ></ha-selector>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <ha-form
              .hass=${t}
              .data=${{allow_tap_to_complete:!0===U.allow_tap_to_complete}}
              .schema=${[{name:"allow_tap_to_complete",label:"Allow tap to complete",description:"Tap a row to toggle completed/needs action (shows checkbox icon; tap toggles status).",selector:{boolean:{}}}]}
              .computeLabel=${e=>e.label||e.name}
              .computeDescription=${e=>e.description||""}
              @value-changed=${e=>{var t;return n({todo_item_template:Object.assign(Object.assign({},U),{allow_tap_to_complete:!0===(null===(t=e.detail.value)||void 0===t?void 0:t.allow_tap_to_complete)})})}}
            ></ha-form>
          </div>
          <div
            class="field-description"
            style="font-size: 11px; margin-top: 12px; padding: 8px; background: rgba(0,0,0,0.15); border-radius: 6px; color: var(--secondary-text-color); line-height: 1.4;"
          >
            <strong>Description JSON (Local Todo, etc.):</strong> You can put JSON in an item’s description to override display or define multiple modules. Object (e.g. <code>{"color": "#f00", "text": "Custom"}</code>) is merged into the row. Array of module configs shows multiple modules for that one item.
          </div>
        </div>

        `:M?i.qy`
        <!-- ── Todo List + Jinja2 Template source ────────────────────────────── -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 4px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;"
          >
            <ha-icon icon="mdi:format-list-checks" style="--mdc-icon-size: 20px;"></ha-icon>
            Todo List
          </div>
          <div
            class="field-description"
            style="font-size: 12px; margin-bottom: 12px; color: var(--secondary-text-color); line-height: 1.5;"
          >
            Choose one or more todo lists. Items are fetched and injected into your template as <code>items</code> — a list of objects with keys <code>summary</code>, <code>status</code>, <code>due</code>, <code>description</code>, <code>uid</code>, and <code>entity_id</code>.
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Todo list</label>
            <ha-selector
              .hass=${t}
              .selector=${{select:{options:[{value:"",label:"Default (first available)"},...t.states?Object.keys(t.states).filter((e=>e.startsWith("todo."))).map((e=>{var o,i;return{value:e,label:(null===(i=null===(o=t.states[e])||void 0===o?void 0:o.attributes)||void 0===i?void 0:i.friendly_name)||e}})):[]]}}}
              .value=${null!==(z=I.todo_entity)&&void 0!==z?z:""}
              @value-changed=${e=>n({todo_entity:e.detail.value||void 0})}
            ></ha-selector>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Also include</label>
            <ha-selector
              .hass=${t}
              .selector=${{select:{multiple:!0,options:[{value:"",label:"Default (first available)"},...t.states?Object.keys(t.states).filter((e=>e.startsWith("todo."))).map((e=>{var o,i;return{value:e,label:(null===(i=null===(o=t.states[e])||void 0===o?void 0:o.attributes)||void 0===i?void 0:i.friendly_name)||e}})):[]]}}}
              .value=${I.todo_entities||[]}
              @value-changed=${e=>n({todo_entities:Array.isArray(e.detail.value)?e.detail.value:[]})}
            ></ha-selector>
          </div>
          <div class="field-group" style="margin-bottom: 0;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Show statuses</label>
            <ha-selector
              .hass=${t}
              .selector=${{select:{options:[{value:"both",label:"Both"},{value:"needs_action",label:"Needs action only"},{value:"completed",label:"Completed only"}]}}}
              .value=${(()=>{const e=I.todo_statuses||[];return 0===e.length||2===e.length?"both":"completed"===e[0]?"completed":"needs_action"})()}
              @value-changed=${e=>{const t=e.detail.value;n({todo_statuses:"both"===t?[]:"completed"===t?["completed"]:["needs_action"]})}}
            ></ha-selector>
          </div>
        </div>

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 4px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;"
          >
            <ha-icon icon="mdi:code-braces" style="--mdc-icon-size: 20px;"></ha-icon>
            Jinja2 Template
          </div>
          <div
            class="field-description"
            style="font-size: 12px; margin-bottom: 16px; color: var(--secondary-text-color); line-height: 1.5;"
          >
            Write a Jinja2 template that receives <code>items</code> (your fetched todo items) and outputs a <strong>JSON array</strong> of module configs via <code>| tojson</code>. Each item has: <code>summary</code>, <code>status</code>, <code>due</code>, <code>description</code>, <code>uid</code>, <code>entity_id</code>.
          </div>
          <div class="field-group">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Template</div>
            <div
              @mousedown=${e=>{const t=e.target;t.closest("ultra-template-editor")||t.closest(".cm-editor")||e.stopPropagation()}}
              @dragstart=${e=>e.stopPropagation()}
            >
              <ultra-template-editor
                .hass=${t}
                .value=${I.todo_dynamic_template||""}
                .placeholder=${y}
                .minHeight=${220}
                .maxHeight=${500}
                @value-changed=${e=>n({todo_dynamic_template:e.detail.value})}
              ></ultra-template-editor>
            </div>
          </div>
        </div>

        `:N?i.qy`
        <!-- ── Action / Service source ───────────────────────────────────────── -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 4px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;"
          >
            <ha-icon icon="mdi:lightning-bolt" style="--mdc-icon-size: 20px;"></ha-icon>
            Action / Service Call
          </div>
          <div
            class="field-description"
            style="font-size: 12px; margin-bottom: 12px; color: var(--secondary-text-color); line-height: 1.5;"
          >
            Call any HA service with <code>return_response: true</code>. The response is injected into your template as <code>response</code>. Use <strong>Watch entities</strong> to re-fetch when state changes, or set a <strong>Refresh interval</strong> for periodic polling.
          </div>

          ${(()=>{var e,o;const a=I.action_source||{domain:"",service:"",service_data:{},watch_entities:[],refresh_interval:0},s=e=>n({action_source:Object.assign(Object.assign({},a),e)});return i.qy`
              <div class="field-group" style="margin-bottom: 12px;">
                <ha-form
                  .hass=${t}
                  .data=${{domain:a.domain||"",service:a.service||""}}
                  .schema=${[{name:"domain",label:"Domain",description:"e.g. todo, weather, calendar",selector:{text:{}}},{name:"service",label:"Service",description:"e.g. get_items, get_forecasts",selector:{text:{}}}]}
                  .computeLabel=${e=>e.label||e.name}
                  .computeDescription=${e=>e.description||""}
                  @value-changed=${e=>{var t,o;void 0!==(null===(t=e.detail.value)||void 0===t?void 0:t.domain)&&s({domain:e.detail.value.domain}),void 0!==(null===(o=e.detail.value)||void 0===o?void 0:o.service)&&s({service:e.detail.value.service})}}
                ></ha-form>
              </div>
              <div class="field-group" style="margin-bottom: 12px;">
                <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 6px;">Service data (JSON)</label>
                <div class="field-description" style="font-size: 11px; color: var(--secondary-text-color); margin-bottom: 8px;">
                  Passed as <code>service_data</code>. You may use <code>$variable</code> syntax. E.g. <code>{"entity_id": "todo.shopping"}</code>
                </div>
                <ultra-template-editor
                  .hass=${t}
                  .value=${JSON.stringify(null!==(e=a.service_data)&&void 0!==e?e:{},null,2)}
                  .placeholder=${'{\n  "entity_id": "todo.shopping"\n}'}
                  .minHeight=${80}
                  .maxHeight=${200}
                  @value-changed=${e=>{try{const t=JSON.parse(e.detail.value||"{}");s({service_data:"object"==typeof t&&null!==t?t:{}})}catch(e){}}}
                ></ultra-template-editor>
              </div>
              <div class="field-group" style="margin-bottom: 12px;">
                <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 6px;">Watch entities (state_changed refresh)</label>
                <ha-selector
                  .hass=${t}
                  .selector=${{entity:{multiple:!0}}}
                  .value=${a.watch_entities||[]}
                  @value-changed=${e=>s({watch_entities:Array.isArray(e.detail.value)?e.detail.value:[]})}
                ></ha-selector>
              </div>
              <div class="field-group" style="margin-bottom: 0;">
                <ha-form
                  .hass=${t}
                  .data=${{refresh_interval:null!==(o=a.refresh_interval)&&void 0!==o?o:0}}
                  .schema=${[{name:"refresh_interval",label:"Refresh interval (seconds)",description:"0 = no polling (rely on watch entities only)",selector:{number:{min:0,max:3600,step:5,mode:"box"}}}]}
                  .computeLabel=${e=>e.label||e.name}
                  .computeDescription=${e=>e.description||""}
                  @value-changed=${e=>{var t,o;return s({refresh_interval:null!==(o=null===(t=e.detail.value)||void 0===t?void 0:t.refresh_interval)&&void 0!==o?o:0})}}
                ></ha-form>
              </div>
            `})()}
        </div>

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 4px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;"
          >
            <ha-icon icon="mdi:code-braces" style="--mdc-icon-size: 20px;"></ha-icon>
            Result Template
          </div>
          <div
            class="field-description"
            style="font-size: 12px; margin-bottom: 16px; color: var(--secondary-text-color); line-height: 1.5;"
          >
            Write a Jinja2 template that processes <code>response</code> (the raw service response object) and outputs a <strong>JSON array</strong> of module configs via <code>| tojson</code>.
          </div>
          <div class="field-group">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Template</div>
            <div
              @mousedown=${e=>{const t=e.target;t.closest("ultra-template-editor")||t.closest(".cm-editor")||e.stopPropagation()}}
              @dragstart=${e=>e.stopPropagation()}
            >
              <ultra-template-editor
                .hass=${t}
                .value=${I.action_template||""}
                .placeholder=${h}
                .minHeight=${220}
                .maxHeight=${500}
                @value-changed=${e=>n({action_template:e.detail.value})}
              ></ultra-template-editor>
            </div>
          </div>
        </div>

        `:i.qy`
        <!-- ── Jinja2 Template source ─────────────────────────────────────────── -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 4px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;"
          >
            <ha-icon icon="mdi:code-braces" style="--mdc-icon-size: 20px;"></ha-icon>
            Jinja2 Template
          </div>
          <div
            class="field-description"
            style="font-size: 12px; margin-bottom: 16px; color: var(--secondary-text-color); line-height: 1.5;"
          >
            Write a Jinja2 template that outputs a <strong>JSON array</strong> of module config
            objects using <code>| tojson</code>. Each object must have a unique
            <code>id</code>, a <code>type</code> (e.g. <code>text</code>, <code>icon</code>,
            <code>bar</code>), and any fields that module supports.
          </div>
          <div class="field-group">
            <div
              class="field-title"
              style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
            >
              ${(0,v.kg)("editor.dynamic_list.template_label",q,"Template")}
            </div>
            <div
              @mousedown=${e=>{const t=e.target;t.closest("ultra-template-editor")||t.closest(".cm-editor")||e.stopPropagation()}}
              @dragstart=${e=>e.stopPropagation()}
            >
              <ultra-template-editor
                .hass=${t}
                .value=${I.dynamic_template||""}
                .placeholder=${_}
                .minHeight=${220}
                .maxHeight=${500}
                @value-changed=${e=>{n({dynamic_template:e.detail.value})}}
              ></ultra-template-editor>
            </div>
          </div>
        </div>
        `}

        <!-- Layout Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            Layout
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">${(0,v.kg)("editor.dynamic_list.direction",q,"Direction")}</label>
            <ha-selector
              .hass=${t}
              .selector=${{select:{options:[{value:"horizontal",label:"Horizontal (side by side)"},{value:"vertical",label:"Vertical (stacked)"}]}}}
              .value=${I.direction||"horizontal"}
              @value-changed=${e=>n({direction:e.detail.value||"horizontal"})}
            ></ha-selector>
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <ha-form
              .hass=${t}
              .data=${{wrap:!1!==I.wrap}}
              .schema=${[{name:"wrap",label:"Auto Wrap",description:"Automatically wrap items onto new rows or columns when they run out of space",selector:{boolean:{}}}]}
              .computeLabel=${e=>e.label||e.name}
              .computeDescription=${e=>e.description||""}
              @value-changed=${e=>n({wrap:e.detail.value.wrap})}
            ></ha-form>
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <ha-form
              .hass=${t}
              .data=${{columns:null!==(T=I.columns)&&void 0!==T?T:0}}
              .schema=${[{name:"columns",label:"Columns",description:"horizontal"===(I.direction||"horizontal")?"Columns per row — items fill left to right then wrap (0 = auto size)":"Columns in the grid — items fill top to bottom per column (0 = single stack)",selector:{number:{min:0,max:12,step:1,mode:"slider"}}}]}
              .computeLabel=${e=>e.label||e.name}
              .computeDescription=${e=>e.description||""}
              @value-changed=${e=>n({columns:e.detail.value.columns})}
            ></ha-form>
          </div>

          ${"horizontal"===(I.direction||"horizontal")?i.qy`
          <div class="field-group" style="margin-bottom: 16px;">
            <ha-form
              .hass=${t}
              .data=${{rows:null!==(A=I.rows)&&void 0!==A?A:0}}
              .schema=${[{name:"rows",label:"Max Rows",description:"Maximum rows in horizontal wrap layout (0 = unlimited). Works best with Columns set.",selector:{number:{min:0,max:20,step:1,mode:"slider"}}}]}
              .computeLabel=${e=>e.label||e.name}
              .computeDescription=${e=>e.description||""}
              @value-changed=${e=>n({rows:e.detail.value.rows})}
            ></ha-form>
          </div>`:""}

          <div class="field-group" style="margin-bottom: 16px;">
            <ha-form
              .hass=${t}
              .data=${{gap:null!==(O=I.gap)&&void 0!==O?O:8}}
              .schema=${[{name:"gap",label:(0,v.kg)("editor.dynamic_list.gap",q,"Gap (px)"),description:(0,v.kg)("editor.dynamic_list.gap_desc",q,"Space between generated modules in pixels"),selector:{number:{min:0,max:64,step:1,unit_of_measurement:"px",mode:"slider"}}}]}
              .computeLabel=${e=>e.label||e.name}
              .computeDescription=${e=>e.description||""}
              @value-changed=${e=>n({gap:e.detail.value.gap})}
            ></ha-form>
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Horizontal Alignment</label>
            <ha-selector
              .hass=${t}
              .selector=${{select:{options:[{value:"start",label:"Left"},{value:"center",label:"Center"},{value:"end",label:"Right"},{value:"space-between",label:"Space Between"},{value:"space-around",label:"Space Around"},{value:"stretch",label:"Stretch"}]}}}
              .value=${I.align_h||"center"}
              @value-changed=${e=>n({align_h:e.detail.value||"center"})}
            ></ha-selector>
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Vertical Alignment</label>
            <ha-selector
              .hass=${t}
              .selector=${{select:{options:[{value:"start",label:"Top"},{value:"center",label:"Center"},{value:"end",label:"Bottom"},{value:"stretch",label:"Stretch"}]}}}
              .value=${I.align_v||"center"}
              @value-changed=${e=>n({align_v:e.detail.value||"center"})}
            ></ha-selector>
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Sort by</label>
            <ha-selector
              .hass=${t}
              .selector=${{select:{options:[{value:"default",label:"Default (source order)"},{value:"summary",label:"Summary / name (A–Z or Z–A)"},{value:"due",label:"Due date (todo only)"},{value:"status",label:"Status (todo: incomplete first/last)"}]}}}
              .value=${null!==(C=I.sort_by)&&void 0!==C?C:"default"}
              @value-changed=${e=>n({sort_by:e.detail.value||"default"})}
            ></ha-selector>
          </div>

          ${I.sort_by&&"default"!==I.sort_by?i.qy`
          <div class="field-group" style="margin-bottom: 16px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Sort direction</label>
            <ha-selector
              .hass=${t}
              .selector=${{select:{options:[{value:"asc",label:"Ascending (A→Z, oldest first, incomplete first)"},{value:"desc",label:"Descending (Z→A, newest first, completed first)"}]}}}
              .value=${null!==(D=I.sort_direction)&&void 0!==D?D:"asc"}
              @value-changed=${e=>n({sort_direction:e.detail.value||"asc"})}
            ></ha-selector>
          </div>`:""}

          <div class="field-group" style="margin-bottom: 16px;">
            <ha-form
              .hass=${t}
              .data=${{limit:null!==(E=I.limit)&&void 0!==E?E:0}}
              .schema=${[{name:"limit",label:"Show Only (items)",description:"Show only the first N items initially. 0 = show all. Set above 0 to enable Show More or Pagination.",selector:{number:{min:0,max:100,step:1,mode:"slider"}}}]}
              .computeLabel=${e=>e.label||e.name}
              .computeDescription=${e=>e.description||""}
              @value-changed=${e=>n({limit:e.detail.value.limit})}
            ></ha-form>
          </div>

          ${(null!==(L=I.limit)&&void 0!==L?L:0)>0?i.qy`
          <div class="field-group">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">When limit reached</label>
            <ha-selector
              .hass=${t}
              .selector=${{select:{options:[{value:"show_more",label:"Show More / Show Less button"},{value:"paginate",label:"Paginate (prev / next)"}]}}}
              .value=${I.limit_behavior||"show_more"}
              @value-changed=${e=>n({limit_behavior:e.detail.value||"show_more"})}
            ></ha-selector>
          </div>`:""}
        </div>

        <!-- Examples Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 4px; letter-spacing: 0.5px;"
          >
            Examples
          </div>
          <div class="field-description" style="font-size: 12px; margin-bottom: 16px; color: var(--secondary-text-color); line-height: 1.5;">
            Click <strong>Use</strong> to load an example into the editor above, then swap in your own entity IDs. Each example is fully working — just replace the entity names.
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">

            ${[{title:"Doors & Windows",desc:"Binary sensors — icon changes open/closed, color-coded green/red",tpl:_},{title:"Tire Pressure",desc:"Bar per wheel — red if under/over-inflated, orange near threshold",tpl:g},{title:"Lights",desc:"Icon per light — shows dimmer % when on, grey when off",tpl:f},{title:"Temperature Sensors",desc:"Text per sensor — blue when cold, red when hot, green when comfortable",tpl:b},{title:"CPU / Memory / Disk",desc:"Bar per system metric — color shifts at 50% and 80%",tpl:x}].map((e=>i.qy`
              <details style="border: 1px solid var(--divider-color); border-radius: 8px; overflow: hidden;">
                <summary style="${w} list-style: none; cursor: pointer;">
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 13px; font-weight: 600; color: var(--primary-text-color);">${e.title}</div>
                    <div style="font-size: 11px; color: var(--secondary-text-color); margin-top: 2px;">${e.desc}</div>
                  </div>
                  <button
                    style="${k}"
                    @click=${t=>{t.stopPropagation(),n({dynamic_template:e.tpl})}}
                  >Use</button>
                </summary>
                <pre style="${$}">${e.tpl}</pre>
              </details>
            `))}

          </div>
        </div>

        <!-- Domain Cheat Sheet Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 4px; letter-spacing: 0.5px;"
          >
            Domain Cheat Sheet
          </div>
          <div class="field-description" style="font-size: 12px; margin-bottom: 16px; color: var(--secondary-text-color); line-height: 1.5;">
            These templates loop over <strong>every entity</strong> in a domain automatically — no hardcoded entity IDs needed. New entities appear on the card instantly. Replace <code>states.light</code> with any domain below.
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${[{domain:"light",label:"All Lights",icon_on:"mdi:lightbulb",icon_off:"mdi:lightbulb-outline",active_state:"on",icon_color_on:"#ffc107",icon_color_off:"#9e9e9e"},{domain:"switch",label:"All Switches",icon_on:"mdi:toggle-switch",icon_off:"mdi:toggle-switch-off-outline",active_state:"on",icon_color_on:"#4caf50",icon_color_off:"#9e9e9e"},{domain:"binary_sensor",label:"All Binary Sensors",icon_on:"mdi:checkbox-marked-circle",icon_off:"mdi:checkbox-blank-circle-outline",active_state:"on",icon_color_on:"#f44336",icon_color_off:"#4caf50"},{domain:"cover",label:"All Covers (Blinds / Garage)",icon_on:"mdi:window-shutter-open",icon_off:"mdi:window-shutter",active_state:"open",icon_color_on:"#ff9800",icon_color_off:"#4caf50"},{domain:"fan",label:"All Fans",icon_on:"mdi:fan",icon_off:"mdi:fan-off",active_state:"on",icon_color_on:"#2196f3",icon_color_off:"#9e9e9e"},{domain:"media_player",label:"All Media Players",icon_on:"mdi:play-circle",icon_off:"mdi:stop-circle-outline",active_state:"playing",icon_color_on:"#9c27b0",icon_color_off:"#9e9e9e"},{domain:"climate",label:"All Climate / Thermostats",icon_on:"mdi:thermostat",icon_off:"mdi:thermostat",active_state:"heat",icon_color_on:"#f44336",icon_color_off:"#2196f3"},{domain:"person",label:"All People (Presence)",icon_on:"mdi:home-account",icon_off:"mdi:account-arrow-right",active_state:"home",icon_color_on:"#4caf50",icon_color_off:"#9e9e9e"},{domain:"sensor",label:"All Sensors (text)",icon_on:"",icon_off:"",active_state:"",icon_color_on:"",icon_color_off:""}].map((e=>{const t="sensor"===e.domain?`{% set ns = namespace(mods=[]) %}\n{% for entity in states.${e.domain} %}\n  {% set mod = {\n    'id': '${e.domain}_' ~ loop.index,\n    'type': 'text',\n    'text': entity.name ~ ': ' ~ entity.state,\n    'display_mode': 'always', 'display_conditions': []\n  } %}\n  {% set ns.mods = ns.mods + [mod] %}\n{% endfor %}\n{{ ns.mods | tojson }}`:`{% set ns = namespace(mods=[]) %}\n{% for entity in states.${e.domain} %}\n  {% set icon_item = {\n    'id': '${e.domain}_ii_' ~ loop.index,\n    'icon_mode': 'entity',\n    'entity': entity.entity_id,\n    'name': entity.name,\n    'icon_inactive': '${e.icon_off}',\n    'icon_active':   '${e.icon_on}',\n    'active_state':  '${e.active_state}',\n    'inactive_icon_color': '${e.icon_color_off}',\n    'active_icon_color':   '${e.icon_color_on}',\n    'show_name_when_inactive': true, 'show_state_when_inactive': true, 'show_icon_when_inactive': true,\n    'show_name_when_active':   true, 'show_state_when_active':   true, 'show_icon_when_active':   true\n  } %}\n  {% set mod = {'id': '${e.domain}_' ~ loop.index, 'type': 'icon', 'icons': [icon_item], 'display_mode': 'always', 'display_conditions': []} %}\n  {% set ns.mods = ns.mods + [mod] %}\n{% endfor %}\n{{ ns.mods | tojson }}`;return i.qy`
                <details style="border: 1px solid var(--divider-color); border-radius: 8px; overflow: hidden;">
                  <summary style="${w} list-style: none; cursor: pointer;">
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-size: 13px; font-weight: 600; color: var(--primary-text-color);">${e.label}</div>
                      <div style="font-size: 11px; color: var(--secondary-text-color); margin-top: 2px;">
                        <code>states.${e.domain}</code>
                      </div>
                    </div>
                    <button
                      style="${k}"
                      @click=${e=>{e.stopPropagation(),n({dynamic_template:t})}}
                    >Use</button>
                  </summary>
                  <pre style="${$}">${t}</pre>
                </details>
              `}))}
          </div>
        </div>

        <!-- Reference / Key Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 4px; letter-spacing: 0.5px;"
          >
            Reference & Key
          </div>
          <div class="field-description" style="font-size: 12px; margin-bottom: 16px; color: var(--secondary-text-color); line-height: 1.5;">
            Every template follows the same three-step pattern. Below is a complete reference for beginners and advanced users.
          </div>

          <!-- Pattern -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 13px; font-weight: 700; color: var(--primary-text-color); margin-bottom: 8px;">The 3-step pattern</div>
            <pre style="${$}">{% set ns = namespace(mods=[]) %}    {# Step 1 — create an empty list #}
{% for item in my_list %}              {# Step 2 — loop over your data  #}
  {% set mod = { 'id': 'mod_' ~ loop.index, 'type': 'text', 'text': item } %}
  {% set ns.mods = ns.mods + [mod] %}
{% endfor %}
{{ ns.mods | tojson }}                {# Step 3 — output as JSON        #}</pre>
          </div>

          <!-- Jinja2 helpers -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 13px; font-weight: 700; color: var(--primary-text-color); margin-bottom: 8px;">Jinja2 helpers</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              ${[["states(entity)",'Current state string, e.g. "on", "22.5"'],["state_attr(entity, attr)","Single attribute, e.g. brightness, friendly_name"],["is_state(entity, value)","Returns true/false — great for if conditions"],["loop.index","1-based counter inside a {% for %} loop"],["loop.index0","0-based counter inside a {% for %} loop"],["value | float(0)","Convert state to number, fallback 0 if unavailable"],["value | round(1)","Round to 1 decimal place"],["value | title",'Capitalise first letter — "on" → "On"'],['value | default("N/A")',"Use fallback if value is undefined/none"],["A ~ B","Concatenate strings — equivalent to A + B"]].map((([e,t])=>i.qy`
                <div style="background: rgba(0,0,0,0.15); border-radius: 6px; padding: 8px 10px;">
                  <code style="font-size: 11px; color: var(--primary-color); font-family: 'Fira Code', Consolas, monospace; display: block; margin-bottom: 3px;">${e}</code>
                  <span style="font-size: 11px; color: var(--secondary-text-color);">${t}</span>
                </div>
              `))}
            </div>
          </div>

          <!-- Module type fields -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 13px; font-weight: 700; color: var(--primary-text-color); margin-bottom: 8px;">Module type fields</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">

              <details style="border: 1px solid var(--divider-color); border-radius: 6px; overflow: hidden;">
                <summary style="padding: 8px 12px; cursor: pointer; font-size: 12px; font-weight: 600; background: rgba(0,0,0,0.1); color: var(--primary-text-color); list-style: none;">
                  text — plain text with optional color
                </summary>
                <pre style="${$}">{'id': 'unique_id', 'type': 'text',
 'text': 'Hello World',       {# required — the string to display     #}
 'color': '#4caf50',          {# optional — any CSS color             #}
 'display_mode': 'always', 'display_conditions': []}</pre>
              </details>

              <details style="border: 1px solid var(--divider-color); border-radius: 6px; overflow: hidden;">
                <summary style="padding: 8px 12px; cursor: pointer; font-size: 12px; font-weight: 600; background: rgba(0,0,0,0.1); color: var(--primary-text-color); list-style: none;">
                  icon — entity-linked icon with active/inactive states
                </summary>
                <pre style="${$}">{'id': 'unique_id', 'type': 'icon',
 'icons': [{
   'id': 'icon_item_1',
   'icon_mode': 'entity',         {# 'entity' = HA-linked, 'static' = standalone #}
   'entity': 'binary_sensor.door',
   'name': 'Front Door',          {# label shown below/beside the icon            #}
   'icon_inactive': 'mdi:door-closed',
   'icon_active':   'mdi:door-open',
   'active_state':  'on',         {# state value that triggers the active style    #}
   'inactive_icon_color': '#4caf50',
   'active_icon_color':   '#f44336',
   'show_name_when_inactive': true, 'show_state_when_inactive': true,
   'show_name_when_active':   true, 'show_state_when_active':   true
 }],
 'display_mode': 'always', 'display_conditions': []}</pre>
              </details>

              <details style="border: 1px solid var(--divider-color); border-radius: 6px; overflow: hidden;">
                <summary style="padding: 8px 12px; cursor: pointer; font-size: 12px; font-weight: 600; background: rgba(0,0,0,0.1); color: var(--primary-text-color); list-style: none;">
                  bar — horizontal progress bar
                </summary>
                <pre style="${$}">{'id': 'unique_id', 'type': 'bar',
 'entity': 'sensor.cpu_percent',  {# entity whose state drives the bar value  #}
 'name':   'CPU',                 {# label shown above the bar                #}
 'bar_color': '#4caf50',          {# optional — bar fill color                #}
 'display_mode': 'always', 'display_conditions': []}</pre>
              </details>

            </div>
          </div>

          <!-- Common required fields -->
          <div>
            <div style="font-size: 13px; font-weight: 700; color: var(--primary-text-color); margin-bottom: 8px;">Fields every module needs</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              ${[["id","Must be unique per item — use loop.index to guarantee this"],["type","Module type: text, icon, bar, gauge, markdown …"],["display_mode",'Always set to "always" unless using visibility conditions'],["display_conditions","Always set to [] unless using visibility conditions"]].map((([e,t])=>i.qy`
                <div style="background: rgba(0,0,0,0.15); border-radius: 6px; padding: 8px 10px;">
                  <code style="font-size: 11px; color: var(--primary-color); font-family: 'Fira Code', Consolas, monospace; display: block; margin-bottom: 3px;">${e}</code>
                  <span style="font-size: 11px; color: var(--secondary-text-color);">${t}</span>
                </div>
              `))}
            </div>
          </div>

        </div>

      </div>
    `}renderActionsTab(e,t,o,i){return a.A.render(e,t,(e=>i(e)))}renderOtherTab(e,t,o,i){return s.X.render(e,t,(e=>i(e)))}_parseDescriptionJson(e){if(!e||"string"!=typeof e)return null;const t=e.trim();if(t.startsWith("{")&&t.endsWith("}")||t.startsWith("[")&&t.endsWith("]"))try{const e=JSON.parse(t);return"object"==typeof e&&null!==e?e:null}catch(e){return null}return null}_mapTodoItemsToModules(e,t,o,i){var n,a,s,l;const r=Array.isArray(t)&&t.length>0?e.filter((e=>t.includes(e.item.status))):e,d=o.icon||"mdi:checkbox-marked-circle-outline",c=null!==(a=null!==(n=o.icon_incomplete)&&void 0!==n?n:o.icon)&&void 0!==a?a:d,p=null!==(l=null!==(s=o.icon_completed)&&void 0!==s?s:o.icon)&&void 0!==l?l:"mdi:checkbox-marked-circle",m=[];return r.forEach((({item:e,entityId:t},n)=>{var a,s,l;const r=`${i}_todo_${n}_${(e.uid||n).toString().slice(0,8)}`,d=(e=>{const t=o.primary_field||"summary";return"summary"===t?e.summary||"":"description"===t?e.description||"":"due"===t?e.due||"":"status"===t?"completed"===e.status?"Done":"To do":e.summary||""})(e),u=(e=>{const t=o.secondary_field;return t&&"none"!==t?"summary"===t?e.summary||"":"description"===t?e.description||"":"due"===t?e.due||"":"status"===t?"completed"===e.status?"Done":"To do":"":""})(e),v=d,y=this._parseDescriptionJson(e.description);if(Array.isArray(y)&&y.length>0)return void y.forEach(((e,t)=>{if(e&&"object"==typeof e&&!Array.isArray(e)){const o=e,i=o.id||`${r}_${t}`,n=Object.assign(Object.assign({},o),{id:"string"==typeof i?i:`${r}_${t}`,display_mode:o.display_mode||"always",display_conditions:Array.isArray(o.display_conditions)?o.display_conditions:[]});m.push(n)}}));let h;if("icon"===o.module_type){const i="completed"===e.status;h={id:r,type:"icon",icons:[{id:`${r}_icon`,icon_mode:"static",entity:t,name:v,icon_inactive:i?p:c,icon_active:p,inactive_icon_color:i?null!==(a=o.icon_color_completed)&&void 0!==a?a:"var(--primary-color)":null!==(s=o.icon_color_incomplete)&&void 0!==s?s:"var(--secondary-text-color)",active_icon_color:null!==(l=o.icon_color_completed)&&void 0!==l?l:"var(--primary-color)",show_name_when_inactive:!0,show_state_when_inactive:!1,show_icon_when_inactive:!0,show_name_when_active:!0,show_state_when_active:!1,show_icon_when_active:!0}],display_mode:"always",display_conditions:[]}}else{const i=u?`${d} — ${u}`:d,n="completed"===e.status,a={id:r,type:"text",text:i,display_mode:"always",display_conditions:[],icon:n?p:c,icon_color:n?o.icon_color_completed:o.icon_color_incomplete,icon_position:("none"===o.icon_position?"none":o.icon_position)||"before",alignment:o.alignment||"left"};o.allow_tap_to_complete&&e.uid&&(a.tap_action={action:"perform-action",service:"todo.update_item",target:{entity_id:t},service_data:{item:e.uid,status:n?"needs_action":"completed"}}),h=a}if(y&&!Array.isArray(y)&&"object"==typeof y){const e=y,t=Object.assign(Object.assign({},h),e);t.id||(t.id=h.id),t.display_mode||(t.display_mode="always"),void 0===t.display_conditions&&(t.display_conditions=[]),m.push(t)}else m.push(h)})),m}renderPreview(e,t,o,n){var a,s,r,v,y,h,_,g,f,b,x,w,$,k,z,T,A;const O=e,C=(()=>{const e=String(O.source_type||"template").toLowerCase();return"todo"===e?"todo":"todo-template"===e?"todo-template":"action"===e?"action":"template"})();if(fetch("http://127.0.0.1:7242/ingest/36063b29-f1db-4787-bed7-95c789116512",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"c2200c"},body:JSON.stringify({sessionId:"c2200c",location:"dynamic-list-module.ts:renderPreview:entry",message:"Dynamic list renderPreview",data:{raw_source_type:O.source_type,typeof_source_type:typeof O.source_type,sourceType:C,todo_entity:O.todo_entity,branch:C},timestamp:Date.now(),hypothesisId:"A"})}).catch((()=>{})),!t)return this.renderGradientErrorState("Waiting for Home Assistant","This module requires a live connection","mdi:loading");let D=[];if("todo"===C){fetch("http://127.0.0.1:7242/ingest/36063b29-f1db-4787-bed7-95c789116512",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"c2200c"},body:JSON.stringify({sessionId:"c2200c",location:"dynamic-list-module.ts:todo-branch",message:"Entered todo branch",data:{todo_entity:O.todo_entity,todo_entities:O.todo_entities},timestamp:Date.now(),hypothesisId:"A"})}).catch((()=>{}));const e=t.states&&Object.keys(t.states).find((e=>e.startsWith("todo."))),o=t=>((null==t?void 0:t.trim())||e||"").trim(),n=o(null!==(a=O.todo_entity)&&void 0!==a?a:""),s=(O.todo_entities||[]).map((e=>o(e))).filter((e=>e&&e!==n)),l=n?[n,...s]:s.length?s:e?[e]:[];if(0===l.length)return this.renderGradientErrorState("No Todo List",'Add a to-do list (e.g. Local Todo) or choose one in the General tab. Use "Default (first available)" when you have at least one todo entity.',"mdi:format-list-checks");this._todoService||(this._todoService=new d);const r=t.__uvc_todo_cache,c=()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))};let p=!1;for(const e of l)void 0===(null==r?void 0:r[e])&&(p=!0,this._todoService.getItems(t,e,c));if(p)return i.qy`
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              padding: 16px;
              color: var(--secondary-text-color);
              font-size: 13px;
            "
          >
            <ha-icon icon="mdi:loading" style="--mdc-icon-size: 16px; animation: spin 1s linear infinite;"></ha-icon>
            Loading todo items…
          </div>
        `;const m=[];l.forEach((e=>{((null==r?void 0:r[e])||[]).forEach((t=>m.push({item:t,entityId:e})))}));const u=O.sort_by||"default",v=O.sort_direction||"asc";if("default"!==u){const e="asc"===v?1:-1;m.sort(((t,o)=>{if("summary"===u){const i=(t.item.summary||"").toLowerCase(),n=(o.item.summary||"").toLowerCase();return e*(i<n?-1:i>n?1:0)}if("due"===u){const i=t.item.due||"",n=o.item.due||"",a=i?new Date(i).getTime():0,s=n?new Date(n).getTime():0;return e*(a-s)}if("status"===u){const i=e=>"completed"===e?1:0;return e*(i(t.item.status)-i(o.item.status))}return 0}))}const y=O.todo_item_template||{module_type:"text",primary_field:"summary",secondary_field:"due",icon:"mdi:checkbox-marked-circle-outline"};D=this._mapTodoItemsToModules(m,O.todo_statuses,y,O.id)}else if("todo-template"===C){const e=t.states&&Object.keys(t.states).find((e=>e.startsWith("todo."))),n=t=>((null==t?void 0:t.trim())||e||"").trim(),a=n(null!==(s=O.todo_entity)&&void 0!==s?s:""),p=(O.todo_entities||[]).map((e=>n(e))).filter((e=>e&&e!==a)),m=a?[a,...p]:p.length?p:e?[e]:[];if(0===m.length)return this.renderGradientErrorState("No Todo List","Choose a to-do list entity in the General tab.","mdi:format-list-checks");const u=null===(r=O.todo_dynamic_template)||void 0===r?void 0:r.trim();if(!u)return this.renderGradientErrorState("Add a Template","Enter a Jinja2 template in the General tab to map your todo items to modules.","mdi:code-braces");this._todoService||(this._todoService=new d);const y=t.__uvc_todo_cache,h=()=>{"undefined"==typeof window||window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50))};let _=!1;for(const e of m)void 0===(null==y?void 0:y[e])&&(_=!0,this._todoService.getItems(t,e,h));if(_)return i.qy`
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:16px;color:var(--secondary-text-color);font-size:13px;">
            <ha-icon icon="mdi:loading" style="--mdc-icon-size:16px;animation:spin 1s linear infinite;"></ha-icon>
            Loading todo items…
          </div>`;const g=O.todo_statuses,f=[];m.forEach((e=>{((null==y?void 0:y[e])||[]).forEach((t=>{g&&0!==g.length&&!g.includes(t.status)||f.push(Object.assign(Object.assign({},t),{entity_id:e}))}))}));const b=`{% set items = ${JSON.stringify(f)} %}\n${u}`;this._templateService||(this._templateService=new l.I(t)),t.__uvc_template_strings||(t.__uvc_template_strings={});const x=(0,c.KD)(b,t,o),w=this._hashString(x),$=`layout_mods_dynlist_todotpl_${O.id}_${w}`;this._templateService.hasTemplateSubscription($)||this._templateService.subscribeToTemplate(x,$,h,{},o);const k=null===(v=t.__uvc_template_strings)||void 0===v?void 0:v[$];if(!k)return i.qy`
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:16px;color:var(--secondary-text-color);font-size:13px;">
            <ha-icon icon="mdi:loading" style="--mdc-icon-size:16px;animation:spin 1s linear infinite;"></ha-icon>
            Evaluating template…
          </div>`;try{const e=Array.isArray(k)?k:JSON.parse(String(k).trim());D=Array.isArray(e)?e:[]}catch(e){return console.error("[UltraCard] Dynamic List (todo-template): parse error",k,e),this.renderGradientErrorState("Invalid Template Output","Template must output a JSON array via {{ ns.mods | tojson }}.","mdi:alert-circle-outline")}}else if("action"===C){const e=O.action_source;if(!(null==e?void 0:e.domain)||!(null==e?void 0:e.service))return this.renderGradientErrorState("Configure an Action","Set the Domain and Service in the General tab.","mdi:lightning-bolt");const n=null===(y=O.action_template)||void 0===y?void 0:y.trim();if(!n)return this.renderGradientErrorState("Add a Template","Enter a Jinja2 template in the General tab to map the service response to modules.","mdi:code-braces");const a=`__uvc_action_${O.id}`,s=this._actionCache.get(a),r=()=>{"undefined"==typeof window||window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50))},d=async()=>{var o,i;if(!this._actionFetching.has(a)){this._actionFetching.add(a);try{const n=e.service_data?Object.assign({},e.service_data):{},s=await t.callService(e.domain,e.service,n,void 0,!0,!0);this._actionCache.set(a,null!==(i=null!==(o=null==s?void 0:s.response)&&void 0!==o?o:s)&&void 0!==i?i:{})}catch(e){console.warn("[UltraCard] Dynamic List action source failed:",e),this._actionCache.set(a,{})}finally{this._actionFetching.delete(a),r()}}};if(void 0===s)return d(),i.qy`
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:16px;color:var(--secondary-text-color);font-size:13px;">
            <ha-icon icon="mdi:loading" style="--mdc-icon-size:16px;animation:spin 1s linear infinite;"></ha-icon>
            Calling action…
          </div>`;const p=`__uvc_action_watch_${O.id}`;if(!window[p]&&(null!==(_=null===(h=e.watch_entities)||void 0===h?void 0:h.length)&&void 0!==_?_:0)>0){window[p]=!0;const o=t.connection;null===(g=null==o?void 0:o.subscribeEvents)||void 0===g||g.call(o,(t=>{var o,i;(null===(o=e.watch_entities)||void 0===o?void 0:o.includes(null===(i=null==t?void 0:t.data)||void 0===i?void 0:i.entity_id))&&d()}),"state_changed").catch((()=>{}))}const m=null!==(f=e.refresh_interval)&&void 0!==f?f:0;if(m>0&&!this._actionTimers.has(a)){const e=setInterval(d,1e3*m);this._actionTimers.set(a,e)}const u=`{% set response = ${JSON.stringify(s)} %}\n${n}`;this._templateService||(this._templateService=new l.I(t)),t.__uvc_template_strings||(t.__uvc_template_strings={});const v=(0,c.KD)(u,t,o),x=this._hashString(v),w=`layout_mods_dynlist_action_${O.id}_${x}`;this._templateService.hasTemplateSubscription(w)||this._templateService.subscribeToTemplate(v,w,r,{},o);const $=null===(b=t.__uvc_template_strings)||void 0===b?void 0:b[w];if(!$)return i.qy`
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:16px;color:var(--secondary-text-color);font-size:13px;">
            <ha-icon icon="mdi:loading" style="--mdc-icon-size:16px;animation:spin 1s linear infinite;"></ha-icon>
            Evaluating template…
          </div>`;try{const e=Array.isArray($)?$:JSON.parse(String($).trim());D=Array.isArray(e)?e:[]}catch(e){return console.error("[UltraCard] Dynamic List (action): parse error",$,e),this.renderGradientErrorState("Invalid Template Output","Template must output a JSON array via {{ ns.mods | tojson }}.","mdi:alert-circle-outline")}}else{if(fetch("http://127.0.0.1:7242/ingest/36063b29-f1db-4787-bed7-95c789116512",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"c2200c"},body:JSON.stringify({sessionId:"c2200c",location:"dynamic-list-module.ts:template-branch",message:"Entered template branch",data:{hasTemplate:!(!O.dynamic_template||!O.dynamic_template.trim())},timestamp:Date.now(),hypothesisId:"A"})}).catch((()=>{})),!O.dynamic_template||""===O.dynamic_template.trim())return this.renderGradientErrorState("Add a Jinja2 Template","Enter a template in the General tab to generate modules dynamically","mdi:code-braces");this._templateService||(this._templateService=new l.I(t)),t.__uvc_template_strings||(t.__uvc_template_strings={});const e=(0,c.KD)(O.dynamic_template,t,o),n=this._hashString(e),a=`layout_mods_dynlist_${O.id}_${n}`;this._templateService.hasTemplateSubscription(a)||this._templateService.subscribeToTemplate(e,a,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),{},o);const s=null===(x=t.__uvc_template_strings)||void 0===x?void 0:x[a];if(!s)return i.qy`
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              padding: 16px;
              color: var(--secondary-text-color);
              font-size: 13px;
            "
          >
            <ha-icon icon="mdi:loading" style="--mdc-icon-size: 16px; animation: spin 1s linear infinite;"></ha-icon>
            Evaluating template…
          </div>
        `;if(Array.isArray(s))D=s;else if(null!==s&&"object"==typeof s)D=[];else try{const e=JSON.parse(String(s).trim());D=Array.isArray(e)?e:[]}catch(e){return console.error("[UltraCard] Dynamic List: failed to parse template output:",s,e),this.renderGradientErrorState("Invalid Template Output","Template must output a JSON array. End your template with {{ ns.mods | tojson }}.","mdi:alert-circle-outline")}const r=O.sort_by||"default",d=O.sort_direction||"asc";if("summary"===r&&D.length>0){const e="asc"===d?1:-1,t=e=>{var t,o,i,n,a;return(null!==(a=null!==(o=null!==(t=e.text)&&void 0!==t?t:e.name)&&void 0!==o?o:null===(n=null===(i=e.icons)||void 0===i?void 0:i[0])||void 0===n?void 0:n.name)&&void 0!==a?a:"").toString().toLowerCase()};D=[...D].sort(((o,i)=>e*(t(o)<t(i)?-1:t(o)>t(i)?1:0)))}}if(0===D.length){fetch("http://127.0.0.1:7242/ingest/36063b29-f1db-4787-bed7-95c789116512",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"c2200c"},body:JSON.stringify({sessionId:"c2200c",location:"dynamic-list-module.ts:empty-list",message:"Showing empty list message",data:{sourceType:C,moduleId:O.id},timestamp:Date.now(),hypothesisId:"E",runId:"post-fix"})}).catch((()=>{}));const e="todo"===C||"todo-template"===C,t=e?"No to-do items":"Template returned an empty list";return i.qy`
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 16px;
            color: var(--secondary-text-color);
            font-size: 13px;
          "
        >
          <ha-icon icon="${e?"mdi:format-list-checks":"mdi:playlist-remove"}" style="--mdc-icon-size: 16px;"></ha-icon>
          ${t}
        </div>
      `}const E=(0,p.oD)(),L=O.direction||"horizontal",I=null!==(w=O.gap)&&void 0!==w?w:8,q=!1!==O.wrap,J=null!==($=O.columns)&&void 0!==$?$:4,P=null!==(k=O.rows)&&void 0!==k?k:0,M=null!==(z=O.limit)&&void 0!==z?z:0,N=O.limit_behavior||"show_more",U=O.align_h||"center",B=O.align_v||"center",W=O.id;let G=D;if(P>0&&"horizontal"===L){const e=J>0?P*J:P;G=D.slice(0,e)}const R=M>0&&M<G.length;let H=G,F=i.qy``;if(R)if("show_more"===N){const e=null!==(T=this._expandedModules.get(W))&&void 0!==T&&T;H=e?G:G.slice(0,M);const t=G.length-M;F=e?i.qy`
              <button style="${S}" @click=${()=>{this._expandedModules.set(W,!1),window.dispatchEvent(new CustomEvent("ultra-card-template-update"))}}>
                <ha-icon icon="mdi:chevron-up" style="--mdc-icon-size:16px;"></ha-icon>
                Show less
              </button>`:i.qy`
              <button style="${S}" @click=${()=>{this._expandedModules.set(W,!0),window.dispatchEvent(new CustomEvent("ultra-card-template-update"))}}>
                <ha-icon icon="mdi:chevron-down" style="--mdc-icon-size:16px;"></ha-icon>
                Show ${t} more
              </button>`}else{const e=Math.ceil(G.length/M),t=Math.min(null!==(A=this._currentPage.get(W))&&void 0!==A?A:0,e-1);H=G.slice(t*M,t*M+M),F=i.qy`
          <div style="${"\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 12px;\n  padding: 4px 0;\n"}">
            <button
              style="${j}${0===t?"opacity:0.35;pointer-events:none;":""}"
              @click=${()=>{this._currentPage.set(W,Math.max(0,t-1)),window.dispatchEvent(new CustomEvent("ultra-card-template-update"))}}
            ><ha-icon icon="mdi:chevron-left" style="--mdc-icon-size:18px;"></ha-icon></button>
            <span style="font-size:12px;color:var(--secondary-text-color);">${t+1} / ${e}</span>
            <button
              style="${j}${t>=e-1?"opacity:0.35;pointer-events:none;":""}"
              @click=${()=>{this._currentPage.set(W,Math.min(e-1,t+1)),window.dispatchEvent(new CustomEvent("ultra-card-template-update"))}}
            ><ha-icon icon="mdi:chevron-right" style="--mdc-icon-size:18px;"></ha-icon></button>
          </div>`}const K=J>0,X=K?`display:grid;grid-template-columns:repeat(${J},1fr);gap:${I}px;width:100%;justify-items:${"space-between"===U||"space-around"===U?"center":U};align-items:${B};`:"horizontal"===L?`display:flex;flex-direction:row;flex-wrap:${q?"wrap":"nowrap"};gap:${I}px;width:100%;justify-content:${U};align-items:${B};`:`display:flex;flex-direction:column;gap:${I}px;width:100%;align-items:${"space-between"===U||"space-around"===U?"center":U};justify-content:${B};`,V=!K&&"horizontal"===L,Z=H.map((e=>{var a,s,l,r,d,c,p,v;if(!m.S.evaluateModuleVisibility(e))return i.qy``;const y=E.getModule(e.type);if(!y)return i.qy`<div style="font-size:11px; color: var(--warning-color); padding: 4px;">Unknown module type: ${e.type}</div>`;const h=(null===(s=null===(a=y.metadata)||void 0===a?void 0:a.tags)||void 0===s?void 0:s.includes("pro"))||(null===(r=null===(l=y.metadata)||void 0===l?void 0:l.tags)||void 0===r?void 0:r.includes("premium"))||!1;let _=!1;const g=u.x.checkIntegrationAuth(t);if("pro"===(null===(d=null==g?void 0:g.subscription)||void 0===d?void 0:d.tier)&&"active"===(null===(c=null==g?void 0:g.subscription)||void 0===c?void 0:c.status))_=!0;else if(u.x.isAuthenticated()){const e=u.x.getCurrentUser();"pro"===(null===(p=null==e?void 0:e.subscription)||void 0===p?void 0:p.tier)&&"active"===(null===(v=null==e?void 0:e.subscription)||void 0===v?void 0:v.status)&&(_=!0)}if(h&&!_)return i.qy`<div style="font-size:11px; color: var(--warning-color); padding: 4px;">🔒 Pro module</div>`;const f=Object.assign(Object.assign(Object.assign(Object.assign({},O.design||{}),void 0!==O.font_size&&null!==O.font_size&&{font_size:O.font_size}),void 0!==O.color&&null!==O.color&&{color:O.color}),void 0!==O.font_family&&null!=O.font_family&&{font_family:O.font_family}),b=Object.assign(Object.assign({},e),{design:Object.assign(Object.assign({},f),e.design||{})}),x=y.renderPreview(b,t,o,n),w=K||"vertical"!==L||"center"!==U&&"end"!==U?"":`width: fit-content; max-width: 100%; align-self: ${"center"===U?"center":"flex-end"};`,$=w?i.qy`<div style="${w}">${x}</div>`:x;return V?i.qy`<div style="${"flex: 0 0 auto; min-width: 0;"}">${$}</div>`:$}));return i.qy`
      <div style="display:flex;flex-direction:column;gap:8px;width:100%;">
        <div style="${X}">${Z}</div>
        ${F}
      </div>
    `}validate(e){var t,o;const i=e,n=[],a=String(i.source_type||"template").toLowerCase();return"todo"===a?i.todo_entity&&i.todo_entity.trim()||n.push("todo_entity is required when source is Todo List"):"todo-template"===a?i.todo_dynamic_template&&i.todo_dynamic_template.trim()||n.push("todo_dynamic_template is required when source is Todo List + Template"):"action"===a?((null===(t=i.action_source)||void 0===t?void 0:t.domain)&&(null===(o=i.action_source)||void 0===o?void 0:o.service)||n.push("action_source.domain and action_source.service are required when source is Action"),i.action_template&&i.action_template.trim()||n.push("action_template is required when source is Action")):i.dynamic_template&&""!==i.dynamic_template.trim()||n.push("dynamic_template is required when source is Template"),{valid:0===n.length,errors:n}}}}}]);