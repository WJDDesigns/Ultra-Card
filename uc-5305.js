"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[5305],{5305:(e,n,t)=>{t.r(n),t.d(n,{UltraVacuumModule:()=>s});var i=t(5183),a=t(9811),o=t(7475),r=t(5262);t(7921);class s extends o.m{constructor(){super(...arguments),this.metadata={type:"vacuum",title:"Vacuum Control",description:"Interactive vacuum cleaner control with map, stats, and animations",author:"WJD Designs",version:"1.0.0",icon:"mdi:robot-vacuum",category:"interactive",tags:["vacuum","cleaning","robot","pro"]},this._currentView="vacuum",this._touchStartX=0,this._touchStartY=0,this._isSwiping=!1,this._pointerDown=!1,this._pointerStartX=0,this._pointerStartY=0,this._pointerDeltaX=0,this._pointerDragActive=!1,this._pointerContainerWidth=0,this._pointerRafPending=!1,this._expandedSectionsMap=new Map,this._draggedSectionId=null,this._addDropdownOpenMap=new Map}createDefault(e,n){return Object.assign({id:e||this.generateId("vacuum"),type:"vacuum",entity:"",name:"",battery_entity:"",status_entity:"",cleaning_binary_entity:"",charging_binary_entity:"",cleaning_area_entity:"",cleaning_time_entity:"",current_room_entity:"",last_clean_begin_entity:"",last_clean_end_entity:"",total_cleaning_area_entity:"",total_cleaning_time_entity:"",total_cleaning_count_entity:"",vacuum_error_entity:"",dock_error_entity:"",volume_entity:"",do_not_disturb_entity:"",do_not_disturb_begin_entity:"",do_not_disturb_end_entity:"",selected_map_entity:"",map_image_entity:"",full_clean_button_entity:"",layout_mode:"standard",show_name:!0,show_status:!0,show_battery:!0,show_cleaning_stats:!0,show_component_wear:!1,show_map:!1,show_controls:!0,show_current_room:!0,show_last_clean:!0,show_total_stats:!0,show_errors:!0,show_dnd:!1,show_volume:!1,show_filter_life:!0,show_main_brush_life:!0,show_side_brush_life:!0,show_sensor_life:!1,control_layout:"row",show_start_button:!0,show_pause_button:!0,show_stop_button:!0,show_dock_button:!0,show_locate_button:!1,show_fan_speed:!1,show_room_selection:!1,show_zone_cleanup:!1,enable_animations:!0,animation_cleaning:"spin",animation_returning:"pulse",animation_docking:"slide",animation_charging:"pulse",animation_speed:"normal",map_display_mode:"swipe",map_height:200,map_border_radius:12,map_refresh_rate:5,vacuum_icon:"mdi:robot-vacuum",vacuum_size:200,icon_size:80,primary_color:"var(--primary-color)",background_style:"card",status_color_cleaning:"#4CAF50",status_color_returning:"#2196F3",status_color_docked:"#9E9E9E",status_color_idle:"#FF9800",status_color_error:"#F44336",battery_color_high:"#4CAF50",battery_color_medium:"#FF9800",battery_color_low:"#F44336",battery_threshold_medium:50,battery_threshold_low:20,detected_integration:"generic",tap_action:{action:"default"},hold_action:{action:"default"},double_tap_action:{action:"default"},enable_hover_effect:!1},(()=>{const e=Date.now(),n=s.DEFAULT_SECTION_ORDER.map(((n,t)=>({id:`section_${n}_${e}_${t}`,type:n,enabled:s.VACUUM_SECTIONS[n].defaultEnabled,order:t,settings:{}})));return{display_sections:n,section_order:n.map((e=>e.id))}})())}detectIntegration(e){if(!(null==e?void 0:e.attributes))return"generic";const n=e.attributes,t=e.entity_id||"",i=(n.model||"").toLowerCase();return void 0!==n.valetudo_state||t.includes("valetudo")?"valetudo":i.includes("roborock")||t.includes("roborock")?"roborock":i.includes("xiaomi")||t.includes("xiaomi")||void 0!==n.main_brush_left?"xiaomi":i.includes("ecovacs")||t.includes("ecovacs")?"ecovacs":i.includes("neato")||t.includes("neato")?"neato":i.includes("roomba")||t.includes("roomba")||t.includes("irobot")?"roomba":i.includes("eufy")||t.includes("eufy")||t.includes("robovac")||void 0!==n.boost_iq||"boolean"==typeof n.auto_return&&void 0!==n.cleaning_area?"eufy":i.includes("shark")||t.includes("shark")?"shark":t.includes("tuya")||"tuya"===n.platform?"tuya":"generic"}autoPopulateEntities(e,n){if(!e||!(null==n?void 0:n.states))return{};const t=e.replace("vacuum.",""),i={},a=e=>e in n.states,o=e=>{for(const n of e)if(a(n))return n},r=e=>e.toLowerCase().replace(/[-_.\s]/g,""),s=(e,i)=>{const o=(e=>{const n=r(e),t=e.split(/[-_.\s]/),i=[e,n,e.replace(/_/g,"-"),e.replace(/-/g,"_"),t.join("")];if(e.includes("_vacuum")){const n=e.replace("_vacuum","");i.push(n,r(n))}if(e.includes("vacuum_")){const n=e.replace("vacuum_","");i.push(n,r(n))}return[...new Set(i)]})(t);for(const n of o)for(const t of i){const i=`${e}.${n}${t?"_"+t:""}`;if(a(i))return i;const o=`${e}.${n}${t}`;if(a(o))return o}const s=r(t);for(const t of Object.keys(n.states)){if(!t.startsWith(`${e}.`))continue;const n=t.replace(`${e}.`,""),a=r(n);if(a.includes(s))for(const e of i){const n=r(e);if(a.includes(n))return t}}},c=(e,i)=>{var a;const o=r(t);for(const t of Object.keys(n.states)){if(!t.startsWith(`${e}.`))continue;const s=n.states[t];if((null===(a=null==s?void 0:s.attributes)||void 0===a?void 0:a.device_class)===i&&r(t.replace(`${e}.`,"")).includes(o))return t}},l=(e,i,a)=>{var o;const s=r(t);for(const t of Object.keys(n.states)){if(!t.startsWith(`${e}.`))continue;const c=n.states[t],l=(null===(o=null==c?void 0:c.attributes)||void 0===o?void 0:o.unit_of_measurement)||"";if(i.includes(l)){const n=r(t.replace(`${e}.`,""));if(n.includes(s))for(const e of a)if(n.includes(r(e)))return t}}};let u=o([`sensor.${t}_battery`,`sensor.${t}_battery_level`,`sensor.${t}_battery_percentage`,`sensor.${t.replace("_vacuum","")}_battery`,`sensor.${t.replace(/_/g,"")}_battery`,`sensor.${t.replace(/_/g,"")}_battery_level`,`sensor.${t}_battery_state`,`sensor.${t}_battery_state_of_charge`]);u||(u=s("sensor",["battery","battery_level","battery_percentage","batt"])),u||(u=c("sensor","battery")),u&&(i.battery_entity=u);let d=o([`sensor.${t}_status`,`sensor.${t}_vacuum_status`,`sensor.${t}_state`,`sensor.${t}_cleaning_status`]);d||(d=s("sensor",["status","state","vacuum_status"])),d&&(i.status_entity=d);let m=o([`binary_sensor.${t}_cleaning`,`binary_sensor.${t}_is_cleaning`,`binary_sensor.${t}_running`]);m||(m=s("binary_sensor",["cleaning","is_cleaning","running"])),m&&(i.cleaning_binary_entity=m);let p=o([`binary_sensor.${t}_charging`,`binary_sensor.${t}_is_charging`,`binary_sensor.${t}_docked`]);p||(p=s("binary_sensor",["charging","is_charging","docked"])),p||(p=c("binary_sensor","battery_charging")),p&&(i.charging_binary_entity=p);let v=o([`sensor.${t}_current_room`,`sensor.${t}_room`,`sensor.${t}_current_segment`]);v||(v=s("sensor",["current_room","room","segment"])),v&&(i.current_room_entity=v);let _=o([`sensor.${t}_cleaning_area`,`sensor.${t}_current_clean_area`,`sensor.${t}_clean_area`,`sensor.${t}_cleaned_area`,`sensor.${t}_area_cleaned`,`sensor.${t}_total_cleaning_area`]);_||(_=s("sensor",["cleaning_area","clean_area","cleaned_area","area_cleaned"])),_||(_=l("sensor",["m²","ft²","sq m","sqm"],["area","clean"])),_&&(i.cleaning_area_entity=_);let h=o([`sensor.${t}_cleaning_time`,`sensor.${t}_current_clean_duration`,`sensor.${t}_clean_time`,`sensor.${t}_cleaning_duration`,`sensor.${t}_duration`]);h||(h=s("sensor",["cleaning_time","clean_time","duration","cleaning_duration"])),h||(h=l("sensor",["min","minutes","s","seconds","h","hours"],["time","duration","clean"])),h&&(i.cleaning_time_entity=h);let g=o([`sensor.${t}_last_clean_begin`,`sensor.${t}_last_clean_start`,`sensor.${t}_last_cleaning_start`]);g||(g=s("sensor",["last_clean_begin","last_clean_start","last_cleaning_start"])),g&&(i.last_clean_begin_entity=g);let y=o([`sensor.${t}_last_clean_end`,`sensor.${t}_last_clean_finish`,`sensor.${t}_last_cleaning_end`]);y||(y=s("sensor",["last_clean_end","last_clean_finish","last_cleaning_end"])),y&&(i.last_clean_end_entity=y);let b=o([`sensor.${t}_total_cleaning_area`,`sensor.${t}_total_clean_area`,`sensor.${t}_lifetime_area`]);b||(b=s("sensor",["total_cleaning_area","total_clean_area","lifetime_area","total_area"])),b&&(i.total_cleaning_area_entity=b);let f=o([`sensor.${t}_total_cleaning_time`,`sensor.${t}_total_clean_time`,`sensor.${t}_total_duration`,`sensor.${t}_lifetime_time`]);f||(f=s("sensor",["total_cleaning_time","total_clean_time","total_duration","lifetime_time"])),f&&(i.total_cleaning_time_entity=f);let x=o([`sensor.${t}_total_cleaning_count`,`sensor.${t}_total_clean_count`,`sensor.${t}_cleaning_count`,`sensor.${t}_total_cleans`]);x||(x=s("sensor",["total_cleaning_count","total_clean_count","cleaning_count","total_cleans"])),x&&(i.total_cleaning_count_entity=x);let $=o([`sensor.${t}_filter_time_left`,`sensor.${t}_filter_life`,`sensor.${t}_filter`,`sensor.${t}_filter_utilization`,`sensor.${t}_hepa_filter_life`]);$||($=s("sensor",["filter_time_left","filter_life","filter","filter_utilization","hepa_filter"])),$&&(i.filter_entity=$);let w=o([`sensor.${t}_main_brush_time_left`,`sensor.${t}_main_brush_life`,`sensor.${t}_main_brush`,`sensor.${t}_brush_utilization`,`sensor.${t}_rolling_brush_life`]);w||(w=s("sensor",["main_brush_time_left","main_brush_life","main_brush","brush_utilization","rolling_brush"])),w&&(i.main_brush_entity=w);let k=o([`sensor.${t}_side_brush_time_left`,`sensor.${t}_side_brush_life`,`sensor.${t}_side_brush`,`sensor.${t}_edge_brush_life`]);k||(k=s("sensor",["side_brush_time_left","side_brush_life","side_brush","edge_brush"])),k&&(i.side_brush_entity=k);let S=o([`sensor.${t}_sensor_time_left`,`sensor.${t}_sensor_dirty_time_left`,`sensor.${t}_sensor_life`]);S||(S=s("sensor",["sensor_time_left","sensor_dirty_time_left","sensor_life"])),S&&(i.sensor_entity=S);let q=o([`sensor.${t}_vacuum_error`,`sensor.${t}_error`,`sensor.${t}_last_error`,`sensor.${t}_error_code`]);q||(q=s("sensor",["vacuum_error","error","last_error","error_code"])),q&&(i.vacuum_error_entity=q);let C=o([`sensor.${t}_dock_error`,`sensor.${t}_mop_drying_remaining_time`,`sensor.${t}_dock_status`]);C||(C=s("sensor",["dock_error","mop_drying_remaining_time","dock_status"])),C&&(i.dock_error_entity=C);let D=o([`image.${t}_first_floor`,`image.${t}_map`,`image.${t}`,`camera.${t}_map`,`camera.${t}`]);D||(D=s("image",["first_floor","map",""]),D||(D=s("camera",["map",""]))),D&&(D.startsWith("image.")?i.map_image_entity=D:i.map_entity=D);let E=o([`number.${t}_volume`,`number.${t}_speaker_volume`]);E||(E=s("number",["volume","speaker_volume"])),E&&(i.volume_entity=E);let z=o([`switch.${t}_do_not_disturb`,`switch.${t}_dnd`,`switch.${t}_quiet_hours`]);z||(z=s("switch",["do_not_disturb","dnd","quiet_hours"])),z&&(i.do_not_disturb_entity=z);let O=o([`select.${t}_selected_map`,`select.${t}_map`]);O||(O=s("select",["selected_map","map"])),O&&(i.selected_map_entity=O);let V=o([`button.${t}_full_cleaning`,`button.${t}_start_cleaning`,`button.${t}_start`]);return V||(V=s("button",["full_cleaning","start_cleaning","start"])),V&&(i.full_clean_button_entity=V),o([`binary_sensor.${t}_bin_full`,`sensor.${t}_bin_full`,`binary_sensor.${t.replace(/_/g,"")}_bin_full`]),i}renderCardLayoutSection(e,n,t){const a=e.display_sections||this.getDefaultSections(),o=e.section_order||a.map((e=>e.id)),r=e.card_layout_style||"single_column",c="double_column"===r;this._expandedSectionsMap.has(e.id)||this._expandedSectionsMap.set(e.id,new Set),this._addDropdownOpenMap.has(e.id)||this._addDropdownOpenMap.set(e.id,!1);const l=new Set(a.map((e=>e.type))),u=Object.values(s.VACUUM_SECTIONS).filter((e=>!l.has(e.id))),d=c?o.filter((e=>{const n=a.find((n=>n.id===e));return n&&("left"===n.column||!n.column)})):o,m=c?o.filter((e=>{const n=a.find((n=>n.id===e));return n&&"right"===n.column})):[],p=(e,n)=>{this._draggedSectionId=n,e.dataTransfer&&(e.dataTransfer.effectAllowed="move",e.dataTransfer.setData("text/plain",n)),e.target.style.opacity="0.4"},v=e=>{e.target.style.opacity="",this._draggedSectionId=null,document.querySelectorAll(".vacuum-section-item.drop-zone-active").forEach((e=>{e.classList.remove("drop-zone-active")})),document.querySelectorAll(".vacuum-column-drop-zone.active").forEach((e=>{e.classList.remove("active")}))},_=e=>{e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect="move")},h=e=>{e.currentTarget.classList.add("drop-zone-active")},g=e=>{e.currentTarget.classList.remove("drop-zone-active")},y=(e,n,i)=>{if(e.preventDefault(),e.currentTarget.classList.remove("drop-zone-active"),!this._draggedSectionId||this._draggedSectionId===n)return;const r=a.find((e=>e.id===this._draggedSectionId)),s=a.find((e=>e.id===n));if(!r||!s)return;const l=i||s.column||"left";if(c){const e="right"===l?[...m]:[...d],i="right"===l?[...d]:[...m],o=e.indexOf(this._draggedSectionId),r=i.indexOf(this._draggedSectionId);-1!==o&&e.splice(o,1),-1!==r&&i.splice(r,1);const s=e.indexOf(n);-1!==s?e.splice(s,0,this._draggedSectionId):e.push(this._draggedSectionId);const c="right"===l?[...i,...e]:[...e,...i],u=a.map((e=>e.id===this._draggedSectionId?Object.assign(Object.assign({},e),{column:l,order:c.indexOf(e.id)}):Object.assign(Object.assign({},e),{order:c.indexOf(e.id)})));t({display_sections:u,section_order:c})}else{const e=[...o],i=e.indexOf(this._draggedSectionId),r=e.indexOf(n);if(-1===i||-1===r)return;e.splice(i,1),e.splice(r,0,this._draggedSectionId);const s=a.map((n=>Object.assign(Object.assign({},n),{order:e.indexOf(n.id)})));t({display_sections:s,section_order:e})}this._draggedSectionId=null,setTimeout((()=>this.triggerPreviewUpdate()),50)},b=(e,n)=>{if(e.preventDefault(),e.currentTarget.classList.remove("active"),!this._draggedSectionId)return;const i="right"===n?[...m]:[...d],o="right"===n?[...d]:[...m],r=o.indexOf(this._draggedSectionId);-1!==r&&o.splice(r,1);const s=i.indexOf(this._draggedSectionId);-1!==s&&i.splice(s,1),i.push(this._draggedSectionId);const c=[...o,...i],l=a.map((e=>e.id===this._draggedSectionId?Object.assign(Object.assign({},e),{column:n,order:c.indexOf(e.id)}):Object.assign(Object.assign({},e),{order:c.indexOf(e.id)})));t({display_sections:l,section_order:c}),this._draggedSectionId=null,setTimeout((()=>this.triggerPreviewUpdate()),50)},f=e=>{const n=a.map((n=>n.id===e?Object.assign(Object.assign({},n),{enabled:!n.enabled}):n));t({display_sections:n}),setTimeout((()=>this.triggerPreviewUpdate()),50)},x=n=>{this._expandedSectionsMap.has(e.id)||this._expandedSectionsMap.set(e.id,new Set);const i=this._expandedSectionsMap.get(e.id);i.has(n)?i.delete(n):(i.clear(),i.add(n)),t({_ui_refresh:Date.now()})},$=e=>{const n=a.find((n=>n.id===e));if(!n)return;const i=s.VACUUM_SECTIONS[n.type];if(null==i?void 0:i.required)return;const r=a.filter((n=>n.id!==e)),c=o.filter((n=>n!==e));t({display_sections:r,section_order:c}),setTimeout((()=>this.triggerPreviewUpdate()),50)},w=i=>{const r=s.VACUUM_SECTIONS[i];if(!r)return;let l,u={};if(e.entity&&r.hasEntityOverride){const t=this.autoPopulateEntities(e.entity,n);switch(u=Object.assign({},t),i){case"battery":l=t.battery_entity;break;case"current_room":l=t.current_room_entity;break;case"current_stats":l=t.cleaning_area_entity;break;case"last_clean":l=t.last_clean_begin_entity;break;case"total_stats":l=t.total_cleaning_area_entity;break;case"component_life":l=void 0;break;case"errors":l=t.vacuum_error_entity;break;case"dnd":l=t.do_not_disturb_entity;break;case"volume":l=t.volume_entity;break;case"map":l=t.map_image_entity||t.map_entity}}const d={id:`section_${i}_${Date.now()}`,type:i,enabled:!0,order:a.length,column:c?"left":void 0,settings:"component_life"===i?{filter_entity_override:u.filter_entity,main_brush_entity_override:u.main_brush_entity,side_brush_entity_override:u.side_brush_entity,sensor_entity_override:u.sensor_entity}:l?{entity_override:l}:{}},m=[...a,d],p=[...o,d.id];this._expandedSectionsMap.has(e.id)||this._expandedSectionsMap.set(e.id,new Set);const v=this._expandedSectionsMap.get(e.id);v.clear(),v.add(d.id),this._addDropdownOpenMap.set(e.id,!1),t(Object.assign(Object.assign({},u),{display_sections:m,section_order:p})),setTimeout((()=>this.triggerPreviewUpdate()),50)},k=(e,n)=>{const i=a.map((t=>t.id===e?Object.assign(Object.assign({},t),{settings:Object.assign(Object.assign({},t.settings),n)}):t));t({display_sections:i}),setTimeout((()=>this.triggerPreviewUpdate()),50)},S=(t,o)=>{const r=a.find((e=>e.id===t));if(!r)return i.qy``;const c=s.VACUUM_SECTIONS[r.type];if(!c)return i.qy``;const l=(this._expandedSectionsMap.get(e.id)||new Set).has(t);return i.qy`
        <div
          class="vacuum-section-item"
          draggable="true"
          @dragstart=${e=>p(e,t)}
          @dragend=${v}
          @dragover=${_}
          @dragenter=${h}
          @dragleave=${g}
          @drop=${e=>y(e,t,o)}
        >
          <div class="vacuum-section-header ${l?"expanded":""}">
            <ha-icon icon="mdi:drag" class="vacuum-drag-handle"></ha-icon>
            <ha-icon icon="${c.icon}" class="vacuum-section-icon"></ha-icon>
            <span class="vacuum-section-label">${c.label}</span>
            <ha-icon
              icon="${r.enabled?"mdi:eye":"mdi:eye-off"}"
              class="vacuum-visibility-toggle ${r.enabled?"visible":"hidden"}"
              @click=${e=>{e.stopPropagation(),f(t)}}
            ></ha-icon>
            ${c.required?"":i.qy`
              <ha-icon
                icon="mdi:delete"
                class="vacuum-delete-btn"
                @click=${e=>{e.stopPropagation(),$(t)}}
              ></ha-icon>
            `}
            <ha-icon
              icon="mdi:chevron-${l?"up":"down"}"
              class="vacuum-expand-toggle"
              @click=${e=>{e.stopPropagation(),x(t)}}
            ></ha-icon>
          </div>

          ${l?i.qy`
            <div class="vacuum-section-settings">
              ${this.renderSectionSettings(r,n,k,e)}
            </div>
          `:""}
        </div>
      `};return i.qy`
      <style>
        .vacuum-card-layout {
          background: var(--secondary-background-color);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .vacuum-section-title {
          font-size: 18px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--primary-color);
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }

        .vacuum-section-description {
          font-size: 13px;
          color: var(--secondary-text-color);
          margin-bottom: 16px;
          line-height: 1.4;
        }

        .vacuum-sections-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .vacuum-section-item {
          background: var(--primary-background-color);
          border-radius: 6px;
          cursor: move;
          border: 2px solid transparent;
          transition: all 0.2s;
        }

        .vacuum-section-item.drop-zone-active {
          border-color: var(--primary-color);
          background: rgba(var(--rgb-primary-color), 0.1);
        }

        .vacuum-section-header {
          display: flex;
          align-items: center;
          padding: 12px;
          gap: 8px;
          cursor: pointer;
        }

        .vacuum-section-header:hover {
          background: rgba(var(--rgb-primary-color), 0.05);
          border-radius: 6px;
        }

        .vacuum-drag-handle {
          --mdc-icon-size: 20px;
          color: var(--secondary-text-color);
          cursor: grab;
        }

        .vacuum-drag-handle:active {
          cursor: grabbing;
        }

        .vacuum-section-icon {
          --mdc-icon-size: 20px;
          color: var(--primary-color);
        }

        .vacuum-section-label {
          flex: 1;
          font-weight: 500;
          color: var(--primary-text-color);
        }

        .vacuum-visibility-toggle {
          --mdc-icon-size: 20px;
          cursor: pointer;
          transition: color 0.2s;
        }

        .vacuum-visibility-toggle.visible {
          color: var(--primary-color);
        }

        .vacuum-visibility-toggle.hidden {
          color: var(--secondary-text-color);
          opacity: 0.5;
        }

        .vacuum-delete-btn {
          --mdc-icon-size: 20px;
          color: var(--error-color, #f44336);
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .vacuum-delete-btn:hover {
          opacity: 1;
        }

        .vacuum-expand-toggle {
          --mdc-icon-size: 20px;
          color: var(--secondary-text-color);
          cursor: pointer;
          transition: transform 0.2s;
        }

        .vacuum-section-settings {
          padding: 12px 12px 16px 12px;
          border-top: 1px solid var(--divider-color);
          background: rgba(var(--rgb-primary-color), 0.02);
        }

        .vacuum-add-section {
          margin-top: 16px;
        }

        .vacuum-add-btn {
          width: 100%;
          padding: 12px;
          border: 2px dashed var(--primary-color);
          background: transparent;
          color: var(--primary-color);
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .vacuum-add-btn:hover {
          background: rgba(var(--rgb-primary-color), 0.1);
        }

        .vacuum-add-dropdown {
          position: relative;
        }

        .vacuum-add-options {
          position: absolute;
          bottom: 100%;
          left: 0;
          right: 0;
          background: var(--primary-background-color);
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          box-shadow: 0 -4px 12px rgba(0,0,0,0.15);
          max-height: 300px;
          overflow-y: auto;
          z-index: 100;
          margin-bottom: 8px;
        }

        .vacuum-add-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .vacuum-add-option:hover {
          background: rgba(var(--rgb-primary-color), 0.1);
        }

        .vacuum-add-option ha-icon {
          --mdc-icon-size: 20px;
          color: var(--primary-color);
        }

        .vacuum-add-option-label {
          flex: 1;
          font-size: 14px;
          color: var(--primary-text-color);
        }

        .vacuum-add-option-desc {
          font-size: 11px;
          color: var(--secondary-text-color);
        }

        .vacuum-setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
        }

        .vacuum-setting-label {
          font-size: 14px;
          color: var(--primary-text-color);
        }

        .vacuum-setting-desc {
          font-size: 12px;
          color: var(--secondary-text-color);
        }
        
        .vacuum-layout-style-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--divider-color);
        }
        
        .vacuum-layout-style-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--primary-text-color);
        }
        
        .vacuum-layout-style-select {
          flex: 1;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid var(--divider-color);
          background: var(--primary-background-color);
          color: var(--primary-text-color);
          font-size: 14px;
          cursor: pointer;
        }
        
        .vacuum-columns-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        
        .vacuum-column {
          background: rgba(var(--rgb-primary-color), 0.03);
          border: 1px dashed var(--divider-color);
          border-radius: 8px;
          padding: 8px;
          min-height: 100px;
        }
        
        .vacuum-column-header {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--secondary-text-color);
          padding: 4px 8px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .vacuum-column-header ha-icon {
          --mdc-icon-size: 16px;
        }
        
        .vacuum-column-sections {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-height: 60px;
        }
        
        .vacuum-column-drop-zone {
          border: 2px dashed var(--divider-color);
          border-radius: 6px;
          padding: 16px;
          text-align: center;
          color: var(--secondary-text-color);
          font-size: 12px;
          transition: all 0.2s;
        }
        
        .vacuum-column-drop-zone.active {
          border-color: var(--primary-color);
          background: rgba(var(--rgb-primary-color), 0.1);
          color: var(--primary-color);
        }
      </style>

      <div class="vacuum-card-layout">
        <div class="vacuum-section-title">Card Layout</div>
        <div class="vacuum-section-description">
          Drag to reorder sections. Click the eye to toggle visibility. Expand to customize settings.
        </div>
        
        <!-- Layout Style Selector -->
        <div class="vacuum-layout-style-row">
          <span class="vacuum-layout-style-label">Layout Style</span>
          <select 
            class="vacuum-layout-style-select"
            @change=${e=>{const n=e.target.value;if("single_column"===n){const e=a.map((e=>Object.assign(Object.assign({},e),{column:void 0})));t({card_layout_style:n,display_sections:e})}else{const e=a.map((e=>Object.assign(Object.assign({},e),{column:"left"})));t({card_layout_style:n,display_sections:e})}setTimeout((()=>this.triggerPreviewUpdate()),50)}}
          >
            <option value="single_column" ?selected=${"single_column"===r}>Single Column</option>
            <option value="double_column" ?selected=${"double_column"===r}>Double Column</option>
          </select>
        </div>

        ${c?i.qy`
          <!-- Double Column Layout -->
          <div class="vacuum-columns-container">
            <!-- Left Column -->
            <div class="vacuum-column">
              <div class="vacuum-column-header">
                <ha-icon icon="mdi:arrow-left-bold-box-outline"></ha-icon>
                Left Column
              </div>
              <div class="vacuum-column-sections">
                ${d.length>0?d.map((e=>S(e,"left"))):i.qy`
                    <div 
                      class="vacuum-column-drop-zone"
                      @dragover=${_}
                      @dragenter=${e=>e.currentTarget.classList.add("active")}
                      @dragleave=${e=>e.currentTarget.classList.remove("active")}
                      @drop=${e=>b(e,"left")}
                    >
                      Drop sections here
                    </div>
                  `}
                ${d.length>0?i.qy`
                  <div 
                    class="vacuum-column-drop-zone"
                    @dragover=${_}
                    @dragenter=${e=>e.currentTarget.classList.add("active")}
                    @dragleave=${e=>e.currentTarget.classList.remove("active")}
                    @drop=${e=>b(e,"left")}
                  >
                    Drop here to add to bottom
                  </div>
                `:""}
              </div>
            </div>
            
            <!-- Right Column -->
            <div class="vacuum-column">
              <div class="vacuum-column-header">
                <ha-icon icon="mdi:arrow-right-bold-box-outline"></ha-icon>
                Right Column
              </div>
              <div class="vacuum-column-sections">
                ${m.length>0?m.map((e=>S(e,"right"))):i.qy`
                    <div 
                      class="vacuum-column-drop-zone"
                      @dragover=${_}
                      @dragenter=${e=>e.currentTarget.classList.add("active")}
                      @dragleave=${e=>e.currentTarget.classList.remove("active")}
                      @drop=${e=>b(e,"right")}
                    >
                      Drop sections here
                    </div>
                  `}
                ${m.length>0?i.qy`
                  <div 
                    class="vacuum-column-drop-zone"
                    @dragover=${_}
                    @dragenter=${e=>e.currentTarget.classList.add("active")}
                    @dragleave=${e=>e.currentTarget.classList.remove("active")}
                    @drop=${e=>b(e,"right")}
                  >
                    Drop here to add to bottom
                  </div>
                `:""}
              </div>
            </div>
          </div>
        `:i.qy`
          <!-- Single Column Layout -->
          <div class="vacuum-sections-list">
            ${o.map((e=>S(e)))}
          </div>
        `}

        ${u.length>0?i.qy`
          <div class="vacuum-add-section">
            <div class="vacuum-add-dropdown">
              <button
                class="vacuum-add-btn"
                @click=${()=>{const n=this._addDropdownOpenMap.get(e.id)||!1;this._addDropdownOpenMap.set(e.id,!n),t({display_sections:[...a]})}}
              >
                + Add Section
              </button>
              <div class="vacuum-add-options" style="display: ${this._addDropdownOpenMap.get(e.id)?"block":"none"};">
                ${u.map((e=>i.qy`
                  <div
                    class="vacuum-add-option"
                    @click=${()=>w(e.id)}
                  >
                    <ha-icon icon="${e.icon}"></ha-icon>
                    <div>
                      <div class="vacuum-add-option-label">${e.label}</div>
                      <div class="vacuum-add-option-desc">${e.description}</div>
                    </div>
                  </div>
                `))}
              </div>
            </div>
          </div>
        `:""}
      </div>
    `}renderSectionSettings(e,n,t,a){var o;const r=s.VACUUM_SECTIONS[e.type],c=e.settings||{},l=(()=>{switch(e.type){case"battery":return c.entity_override||a.battery_entity;case"current_room":return c.entity_override||a.current_room_entity;case"current_stats":return c.entity_override||a.cleaning_area_entity;case"last_clean":return c.entity_override||a.last_clean_begin_entity;case"total_stats":return c.entity_override||a.total_cleaning_area_entity;case"component_life":return c.entity_override||a.filter_entity;case"errors":return c.entity_override||a.vacuum_error_entity;case"dnd":return c.entity_override||a.do_not_disturb_entity;case"volume":return c.entity_override||a.volume_entity;case"map":return c.entity_override||a.map_image_entity||a.map_entity;default:return}})(),u=(n,a,o=!0)=>{var r;return i.qy`
      <div class="vacuum-setting-row">
        <div>
          <div class="vacuum-setting-label">${a}</div>
        </div>
        <ha-switch
          .checked=${null!==(r=c[n])&&void 0!==r?r:o}
          @change=${i=>{const a=i.target;t(e.id,{[n]:a.checked})}}
        ></ha-switch>
      </div>
    `},d=()=>r.hasEntityOverride?i.qy`
        <div style="margin-top: 12px;">
          <div class="vacuum-setting-label" style="margin-bottom: 8px;">Entity Override</div>
          <div class="vacuum-setting-desc" style="margin-bottom: 8px;">
            Override the auto-detected entity (current: ${l||"none"})
          </div>
          ${this.renderUcForm(n,{entity_override:c.entity_override||""},[{name:"entity_override",selector:{entity:{}}}],(n=>t(e.id,{entity_override:n.detail.value.entity_override})),!1)}
        </div>
      `:i.qy``,m=(a,o,r="var(--primary-color)")=>i.qy`
      <div style="margin-top: 12px;">
        <div class="vacuum-setting-label" style="margin-bottom: 8px;">${o}</div>
        <ultra-color-picker
          .value="${c[a]||r}"
          .hass="${n}"
          @value-changed=${n=>t(e.id,{[a]:n.detail.value})}
        ></ultra-color-picker>
      </div>
    `,p=()=>i.qy`
      <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--divider-color);">
        <div class="vacuum-setting-label" style="margin-bottom: 12px;">Spacing</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          ${this.renderFieldSection("Top","",n,{margin_top:c.margin_top||0},[{name:"margin_top",selector:{number:{min:-50,max:50,step:2,mode:"box",unit_of_measurement:"px"}}}],(n=>t(e.id,{margin_top:n.detail.value.margin_top})))}
          ${this.renderFieldSection("Bottom","",n,{margin_bottom:c.margin_bottom||0},[{name:"margin_bottom",selector:{number:{min:-50,max:50,step:2,mode:"box",unit_of_measurement:"px"}}}],(n=>t(e.id,{margin_bottom:n.detail.value.margin_bottom})))}
          ${this.renderFieldSection("Left","",n,{margin_left:c.margin_left||0},[{name:"margin_left",selector:{number:{min:-50,max:50,step:2,mode:"box",unit_of_measurement:"px"}}}],(n=>t(e.id,{margin_left:n.detail.value.margin_left})))}
          ${this.renderFieldSection("Right","",n,{margin_right:c.margin_right||0},[{name:"margin_right",selector:{number:{min:-50,max:50,step:2,mode:"box",unit_of_measurement:"px"}}}],(n=>t(e.id,{margin_right:n.detail.value.margin_right})))}
        </div>
      </div>
    `;switch(e.type){case"vacuum_image":return i.qy`
          <div class="vacuum-setting-desc" style="margin-bottom: 12px;">
            The animated robot vacuum image with spinning brushes
          </div>
          ${this.renderFieldSection("Size","Size of the vacuum image in pixels",n,{icon_size:null!==(o=c.icon_size)&&void 0!==o?o:200},[{name:"icon_size",selector:{number:{min:60,max:300,step:10}}}],(n=>t(e.id,{icon_size:n.detail.value.icon_size})))}
          ${m("icon_color","Primary Color")}
          <div style="margin-top: 12px;">
            <div class="vacuum-setting-label" style="margin-bottom: 8px;">Custom Image</div>
            <div class="vacuum-setting-desc" style="margin-bottom: 8px;">
              Use a custom image instead of the built-in SVG (URL or /local/ path)
            </div>
            ${this.renderUcForm(n,{custom_image:c.custom_image||a.custom_vacuum_image||""},[{name:"custom_image",selector:{text:{}}}],(n=>t(e.id,{custom_image:n.detail.value.custom_image})),!1)}
          </div>
          ${p()}
        `;case"title_status":return i.qy`
          ${u("show_label","Show Name",!0)}
          ${u("show_value","Show Status",!0)}
          ${m("label_color","Name Color","var(--primary-text-color)")}
          ${m("value_color","Status Color")}
          ${p()}
        `;case"battery":return i.qy`
          ${u("show_title","Show Section Title",!1)}
          ${u("show_icon","Show Battery Icon",!0)}
          ${u("show_percentage","Show Percentage",!0)}
          ${m("color","Color")}
          ${d()}
          ${p()}
        `;case"current_room":return i.qy`
          ${u("show_title","Show Section Title",!1)}
          ${u("show_icon","Show Room Icon",!0)}
          ${u("show_label","Show Room Name",!0)}
          ${m("color","Color")}
          ${d()}
          ${p()}
        `;case"fan_speed":return i.qy`
          <div class="vacuum-setting-desc" style="margin-bottom: 12px;">
            Speed dropdown selector. The available speeds come from the vacuum entity.
          </div>
          ${this.renderFieldSection("Style","Layout style for the speed control",n,{style:c.style||"default"},[{name:"style",selector:{select:{options:[{value:"default",label:"Default"},{value:"speed_only",label:"Speed Only"},{value:"compact",label:"Compact"}]}}}],(n=>t(e.id,{style:n.detail.value.style})))}
          ${m("color","Color")}
          ${p()}
        `;case"current_stats":case"last_clean":case"total_stats":return i.qy`
          ${u("show_title","Show Section Title",!0)}
          ${u("show_icon","Show Icons",!0)}
          ${u("show_label","Show Labels",!0)}
          ${m("color","Color")}
          ${d()}
          ${p()}
        `;case"component_life":return i.qy`
          ${u("show_filter","Show Filter Life",!0)}
          ${u("show_main_brush","Show Main Brush Life",!0)}
          ${u("show_side_brush","Show Side Brush Life",!0)}
          ${u("show_sensor","Show Sensor Life",!1)}
          ${u("show_graph","Show Progress Bars",!0)}
          ${u("show_percentage","Show Percentages",!0)}
          ${m("bar_color","Bar Color")}
          
          <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--divider-color);">
            <div class="vacuum-setting-label" style="margin-bottom: 8px;">Entity Overrides</div>
            ${this.renderFieldSection("Filter Entity",`Auto-detected: ${a.filter_entity||"none"}`,n,{filter_entity_override:c.filter_entity_override||""},[{name:"filter_entity_override",selector:{entity:{domain:"sensor"}}}],(n=>t(e.id,{filter_entity_override:n.detail.value.filter_entity_override})))}
            ${this.renderFieldSection("Main Brush Entity",`Auto-detected: ${a.main_brush_entity||"none"}`,n,{main_brush_entity_override:c.main_brush_entity_override||""},[{name:"main_brush_entity_override",selector:{entity:{domain:"sensor"}}}],(n=>t(e.id,{main_brush_entity_override:n.detail.value.main_brush_entity_override})))}
            ${this.renderFieldSection("Side Brush Entity",`Auto-detected: ${a.side_brush_entity||"none"}`,n,{side_brush_entity_override:c.side_brush_entity_override||""},[{name:"side_brush_entity_override",selector:{entity:{domain:"sensor"}}}],(n=>t(e.id,{side_brush_entity_override:n.detail.value.side_brush_entity_override})))}
            ${this.renderFieldSection("Sensor Entity",`Auto-detected: ${a.sensor_entity||"none"}`,n,{sensor_entity_override:c.sensor_entity_override||""},[{name:"sensor_entity_override",selector:{entity:{domain:"sensor"}}}],(n=>t(e.id,{sensor_entity_override:n.detail.value.sensor_entity_override})))}
          </div>
          
          ${p()}
        `;case"errors":return i.qy`
          <div class="vacuum-setting-desc" style="margin-bottom: 12px;">
            Displays error messages from the vacuum and dock
          </div>
          ${u("show_icon","Show Error Icon",!0)}
          ${m("error_color","Error Color","var(--error-color, #f44336)")}
          ${d()}
          ${p()}
        `;case"dnd":return i.qy`
          ${u("show_icon","Show DND Icon",!0)}
          ${u("show_label","Show Status Text",!0)}
          ${m("button_color","Button Color")}
          ${d()}
          ${p()}
        `;case"volume":return i.qy`
          ${u("show_icon","Show Volume Icon",!0)}
          ${u("show_value","Show Volume Level",!0)}
          ${m("color","Color")}
          ${d()}
          ${p()}
        `;case"quick_controls":return i.qy`
          ${u("show_start","Show Start Button",!0)}
          ${u("show_pause","Show Pause Button",!0)}
          ${u("show_stop","Show Stop Button",!0)}
          ${u("show_dock","Show Dock Button",!0)}
          ${u("show_locate","Show Locate Button",!1)}
          ${this.renderFieldSection("Button Layout","Arrangement of control buttons",n,{control_layout:c.control_layout||"row"},[{name:"control_layout",selector:{select:{options:[{value:"row",label:"Row (Default)"},{value:"grid",label:"Grid"},{value:"compact",label:"Compact (Icons Only)"}]}}}],(n=>t(e.id,{control_layout:n.detail.value.control_layout})))}
          ${m("button_color","Button Color")}
          ${p()}
        `;case"map":const r="swipe"===c.display_mode;return i.qy`
          <div class="vacuum-setting-desc" style="margin-bottom: 12px;">
            Displays the vacuum's floor map
          </div>
          ${this.renderFieldSection("Display Mode","How the map should be displayed",n,{display_mode:c.display_mode||"below_vacuum"},[{name:"display_mode",selector:{select:{options:[{value:"below_vacuum",label:"Default (Show as Section)"},{value:"replace_vacuum",label:"Replace Vacuum Image with Map"},{value:"swipe",label:"Swipe to View"}]}}}],(n=>t(e.id,{display_mode:n.detail.value.display_mode})))}
          ${r?i.qy`
            <div class="vacuum-setting-desc" style="margin: 8px 0; padding: 8px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 6px; font-size: 12px;">
              <ha-icon icon="mdi:information" style="--mdc-icon-size: 14px; margin-right: 4px;"></ha-icon>
              Map height is automatic in Swipe mode (matches vacuum image size)
            </div>
          `:this.renderFieldSection("Map Height","Height of the map display in pixels",n,{bar_height:c.bar_height||200},[{name:"bar_height",selector:{number:{min:100,max:500,step:10}}}],(n=>t(e.id,{bar_height:n.detail.value.bar_height})))}
          ${d()}
          ${p()}
        `;default:return i.qy`
          <div class="vacuum-setting-desc">
            No additional settings for this section type.
          </div>
        `}}getDefaultSections(){const e=Date.now();return s.DEFAULT_SECTION_ORDER.map(((n,t)=>({id:`section_${n}_${e}_${t}`,type:n,enabled:s.VACUUM_SECTIONS[n].defaultEnabled,order:t,settings:{}})))}renderSection(e,n,t,a,o){var r,s,c,l;if(!e.enabled)return i.qy``;const u=e.settings||{},d=[u.margin_top?`margin-top: ${u.margin_top}px;`:"",u.margin_right?`margin-right: ${u.margin_right}px;`:"",u.margin_bottom?`margin-bottom: ${u.margin_bottom}px;`:"",u.margin_left?`margin-left: ${u.margin_left}px;`:""].filter(Boolean).join(" "),m=e=>d?i.qy`<div style="${d}">${e}</div>`:e;switch(e.type){case"vacuum_image":const e=(n.display_sections||this.getDefaultSections()).find((e=>"map"===e.type&&e.enabled)),d="replace_vacuum"===(null===(r=null==e?void 0:e.settings)||void 0===r?void 0:r.display_mode),p="swipe"===(null===(s=null==e?void 0:e.settings)||void 0===s?void 0:s.display_mode),v="swipe"===(null===(c=null==e?void 0:e.settings)||void 0===c?void 0:c.display_mode),_=null!==(l=u.icon_size)&&void 0!==l?l:200,h=u.custom_image||n.custom_vacuum_image;if(d)return m(i.qy`
            <div class="vacuum-icon-container">
              ${this.renderMapView(n,a,null==e?void 0:e.settings,!0)}
            </div>
          `);if(v){const t="map"===this._currentView?-50:0,r=this._pointerDragActive&&this._pointerContainerWidth?this._pointerDeltaX/this._pointerContainerWidth*50:0,s=`transform: translateX(${Math.max(-50,Math.min(0,t+r))}%);`,c=Object.assign(Object.assign({},(null==e?void 0:e.settings)||{}),{bar_height:_});return m(i.qy`
            <div class="vacuum-icon-container">
              <div
                class="vacuum-swipe-carousel ${this._pointerDragActive?"dragging":""}"
                style="width: ${_}px; height: ${_}px;"
                @touchstart=${e=>this.handleTouchStart(e)}
                @touchmove=${e=>this.handleTouchMove(e,!0)}
                @touchend=${e=>this.handleTouchEnd(e,!0)}
                @pointerdown=${e=>this.handlePointerDown(e,!0)}
                @pointermove=${e=>this.handlePointerMove(e,!0)}
                @pointerup=${e=>this.handlePointerUp(e,!0)}
                @pointercancel=${e=>this.handlePointerUp(e,!0)}
              >
                <div class="vacuum-swipe-track" style="${s}">
                  <div class="vacuum-swipe-page">
                    ${h?i.qy`
                          <div class="vacuum-image ${o.animationClass}" style="width: ${_}px; height: ${_}px;">
                            <img
                              draggable="false"
                              src="${h}"
                              alt="Vacuum"
                              style="width: 100%; height: 100%; object-fit: contain;"
                              @dragstart=${e=>e.preventDefault()}
                            />
                          </div>
                        `:this.renderVacuumIcon(n,o.animationClass,_,o.isActive,o.isDocked,u.icon_color)}
                  </div>
                  <div class="vacuum-swipe-page">
                    ${this.renderMapView(n,a,c,!0)}
                  </div>
                </div>
              </div>
              ${p?this.renderPaginationDots(u.icon_color):""}
            </div>
          `)}return m(h?i.qy`
            <div 
              class="vacuum-icon-container ${n.entity?"clickable":""}"
              @click=${n.entity?e=>this.showMoreInfo(e,n.entity):i.s6}
            >
              <div class="vacuum-image ${o.animationClass}" style="width: ${_}px; height: ${_}px;">
                <img src="${h}" alt="Vacuum" style="width: 100%; height: 100%; object-fit: contain;" />
              </div>
            </div>
          `:i.qy`
          <div 
            class="vacuum-icon-container ${n.entity?"clickable":""}"
            @click=${n.entity?e=>this.showMoreInfo(e,n.entity):i.s6}
          >
            ${this.renderVacuumIcon(n,o.animationClass,_,o.isActive,o.isDocked,u.icon_color)}
          </div>
        `);case"title_status":return m(i.qy`
          <div 
            class="vacuum-header ${n.entity?"clickable":""}"
            @click=${n.entity?e=>this.showMoreInfo(e,n.entity):i.s6}
          >
            ${!1!==u.show_label?i.qy`
              <div class="vacuum-name" style="${u.label_color?`color: ${u.label_color}`:""}">
                ${o.displayName}
              </div>
            `:""}
            ${!1!==u.show_value?i.qy`
              <div class="vacuum-status-text" style="color: ${u.value_color||o.statusColor}">
                ${this.formatState(o.state)}
              </div>
            `:""}
          </div>
        `);case"battery":if(null===o.batteryLevel)return i.qy``;const g=u.color||this.getBatteryColor(o.batteryLevel,n),y=u.entity_override||n.battery_entity;return m(i.qy`
          ${u.show_title?i.qy`<div class="stats-section-title">Battery</div>`:""}
          <div 
            class="vacuum-battery ${y?"clickable":""}" 
            style="color: ${g}"
            @click=${y?e=>this.showMoreInfo(e,y):i.s6}
          >
            ${!1!==u.show_icon?i.qy`
              <ha-icon 
                icon="${this.getBatteryIcon(o.batteryLevel,o.isCharging)}"
                style="color: ${g};"
              ></ha-icon>
            `:""}
            ${!1!==u.show_percentage?i.qy`<span>${o.batteryLevel}%</span>`:""}
          </div>
        `);case"current_room":const b=u.entity_override||n.current_room_entity,f=this.getEntityValue(a,b);if(!f)return i.qy``;const x=u.color;return m(i.qy`
          ${u.show_title?i.qy`<div class="stats-section-title">Current Room</div>`:""}
          <div 
            class="vacuum-current-room ${b?"clickable":""}"
            @click=${b?e=>this.showMoreInfo(e,b):i.s6}
          >
            ${!1!==u.show_icon?i.qy`
              <ha-icon icon="mdi:home-map-marker" style="${x?`color: ${x}`:""}"></ha-icon>
            `:""}
            ${!1!==u.show_label?i.qy`<span>${f}</span>`:""}
          </div>
        `);case"fan_speed":return 0===o.fanSpeedOptions.length?i.qy``:m(this.renderFanSpeedControl(n,t,a,o.fanSpeed,o.fanSpeedOptions,u));case"current_stats":return m(this.renderCleaningStatsDetailed(t,n,a,u));case"last_clean":return m(this.renderLastClean(n,a,u));case"total_stats":return m(this.renderTotalStats(n,a,u));case"component_life":return m(this.renderComponentWearSection(t,n,a,u));case"errors":const $=u.entity_override||n.vacuum_error_entity,w=n.dock_error_entity,k=this.getEntityValue(a,$),S=this.getEntityValue(a,w);if(!(k&&"none"!==k&&"ok"!==k||S&&"ok"!==S))return i.qy``;const q=u.error_color||"var(--error-color, #f44336)";return m(i.qy`
          <div 
            class="vacuum-error-banner ${$?"clickable":""}" 
            style="background: color-mix(in srgb, ${q} 15%, transparent); border-color: ${q}; color: ${q};"
            @click=${$?e=>this.showMoreInfo(e,$):i.s6}
          >
            ${!1!==u.show_icon?i.qy`
              <ha-icon icon="mdi:alert-circle" style="color: ${q};"></ha-icon>
            `:""}
            <span>${k&&"none"!==k?this.formatError(k):""}${S&&"ok"!==S?` Dock: ${this.formatError(S)}`:""}</span>
          </div>
        `);case"dnd":return m(this.renderDndStatus(n,a,u));case"volume":return m(this.renderVolumeControl(n,a,u));case"quick_controls":return m(this.renderControlsSection(n,t,a,o.state,o.fanSpeed,o.fanSpeedOptions,u));case"map":const C=u.display_mode||"below_vacuum";if("replace_vacuum"===C)return i.qy``;if("swipe"===C)return i.qy``;const D=u.entity_override||n.map_image_entity||n.map_entity;return m(i.qy`
          <div 
            class="${D?"clickable":""}"
            @click=${D?e=>this.showMoreInfo(e,D):i.s6}
          >
            ${this.renderMapView(n,a,u)}
          </div>
        `);default:return i.qy``}}renderComponentWearSection(e,n,t,a){const o=[];if(!1!==(null==a?void 0:a.show_filter)){const e=(null==a?void 0:a.filter_entity_override)||n.filter_entity;e&&o.push({key:"filter",label:"Filter",icon:"mdi:air-filter",entity:e})}if(!1!==(null==a?void 0:a.show_main_brush)){const e=(null==a?void 0:a.main_brush_entity_override)||n.main_brush_entity;e&&o.push({key:"main_brush",label:"Main Brush",icon:"mdi:brush",entity:e})}if(!1!==(null==a?void 0:a.show_side_brush)){const e=(null==a?void 0:a.side_brush_entity_override)||n.side_brush_entity;e&&o.push({key:"side_brush",label:"Side Brush",icon:"mdi:asterisk",entity:e})}if(!1!==(null==a?void 0:a.show_sensor)){const e=(null==a?void 0:a.sensor_entity_override)||n.sensor_entity;e&&o.push({key:"sensor",label:"Sensors",icon:"mdi:eye",entity:e})}return 0===o.length?i.qy``:i.qy`
      <div class="vacuum-component-wear">
        ${o.map((e=>{const n=this.getComponentWearFromEntity(t,e.entity);if(null===n)return i.qy``;const o=(null==a?void 0:a.bar_color)||this.getWearColor(n);return i.qy`
            <div 
              class="wear-item ${e.entity?"clickable":""}"
              @click=${e.entity?n=>this.showMoreInfo(n,e.entity):i.s6}
            >
              <div class="wear-header">
                <ha-icon icon="${e.icon}"></ha-icon>
                <span class="wear-label">${e.label}</span>
                ${!1!==(null==a?void 0:a.show_percentage)?i.qy`
                  <span class="wear-value">${n}%</span>
                `:""}
              </div>
              ${!1!==(null==a?void 0:a.show_graph)?i.qy`
                <div class="wear-bar">
                  <div class="wear-progress" style="width: ${n}%; background-color: ${o}"></div>
                </div>
              `:""}
            </div>
          `}))}
      </div>
    `}renderControlsSection(e,n,t,a,o,r,s){var c,l,u,d,m;const p=null!==(c=null==s?void 0:s.show_start)&&void 0!==c?c:!1!==e.show_start_button,v=null!==(l=null==s?void 0:s.show_pause)&&void 0!==l?l:!1!==e.show_pause_button,_=null!==(u=null==s?void 0:s.show_stop)&&void 0!==u?u:!1!==e.show_stop_button,h=null!==(d=null==s?void 0:s.show_dock)&&void 0!==d?d:!1!==e.show_dock_button,g=null!==(m=null==s?void 0:s.show_locate)&&void 0!==m?m:e.show_locate_button||!1,y=(null==s?void 0:s.control_layout)||e.control_layout||"row",b=null==s?void 0:s.button_color,f=b?`color: ${b}; border-color: ${b};`:"",x=b?`color: ${b};`:"";return"compact"===y?i.qy`
        <div class="vacuum-controls compact">
          ${p?i.qy`
            <button
              class="vacuum-control-btn-compact"
              style="${x}"
              @click=${()=>this.handleVacuumCommand("start",n.entity_id,t)}
              title="Start"
            >
              <ha-icon icon="mdi:play"></ha-icon>
            </button>
          `:""}
          ${v?i.qy`
            <button
              class="vacuum-control-btn-compact"
              style="${x}"
              @click=${()=>this.handleVacuumCommand("pause",n.entity_id,t)}
              title="Pause"
            >
              <ha-icon icon="mdi:pause"></ha-icon>
            </button>
          `:""}
          ${_?i.qy`
            <button
              class="vacuum-control-btn-compact"
              style="${x}"
              @click=${()=>this.handleVacuumCommand("stop",n.entity_id,t)}
              title="Stop"
            >
              <ha-icon icon="mdi:stop"></ha-icon>
            </button>
          `:""}
          ${h?i.qy`
            <button
              class="vacuum-control-btn-compact"
              style="${x}"
              @click=${()=>this.handleVacuumCommand("return_to_base",n.entity_id,t)}
              title="Return to Dock"
            >
              <ha-icon icon="mdi:home"></ha-icon>
            </button>
          `:""}
          ${g?i.qy`
            <button
              class="vacuum-control-btn-compact"
              style="${x}"
              @click=${()=>this.handleVacuumCommand("locate",n.entity_id,t)}
              title="Locate"
            >
              <ha-icon icon="mdi:map-marker"></ha-icon>
            </button>
          `:""}
        </div>
      `:i.qy`
      <div class="vacuum-controls ${y}">
        ${p?i.qy`
          <button
            class="vacuum-control-btn"
            style="${f}"
            @click=${()=>this.handleVacuumCommand("start",n.entity_id,t)}
            title="Start"
          >
            <ha-icon icon="mdi:play"></ha-icon>
          </button>
        `:""}
        ${v?i.qy`
          <button
            class="vacuum-control-btn"
            style="${f}"
            @click=${()=>this.handleVacuumCommand("pause",n.entity_id,t)}
            title="Pause"
          >
            <ha-icon icon="mdi:pause"></ha-icon>
          </button>
        `:""}
        ${_?i.qy`
          <button
            class="vacuum-control-btn"
            style="${f}"
            @click=${()=>this.handleVacuumCommand("stop",n.entity_id,t)}
            title="Stop"
          >
            <ha-icon icon="mdi:stop"></ha-icon>
          </button>
        `:""}
        ${h?i.qy`
          <button
            class="vacuum-control-btn"
            style="${f}"
            @click=${()=>this.handleVacuumCommand("return_to_base",n.entity_id,t)}
            title="Return to Dock"
          >
            <ha-icon icon="mdi:home"></ha-icon>
          </button>
        `:""}
        ${g?i.qy`
          <button
            class="vacuum-control-btn"
            style="${f}"
            @click=${()=>this.handleVacuumCommand("locate",n.entity_id,t)}
            title="Locate"
          >
            <ha-icon icon="mdi:map-marker"></ha-icon>
          </button>
        `:""}
      </div>
    `}getComponentWearFromEntity(e,n){if(!n)return null;const t=null==e?void 0:e.states[n];if(!t)return null;const i=parseFloat(t.state);return isNaN(i)?null:i>100?Math.round(i/300*100):Math.round(i)}renderSectionsInOrder(e,n,t,a){const o=e.display_sections||this.getDefaultSections(),r=e.section_order||o.map((e=>e.id));if("double_column"===e.card_layout_style){const s=r.filter((e=>{const n=o.find((n=>n.id===e));return n&&n.enabled&&("left"===n.column||!n.column)})),c=r.filter((e=>{const n=o.find((n=>n.id===e));return n&&n.enabled&&"right"===n.column})),l=r=>r.map((r=>{const s=o.find((e=>e.id===r));return s&&s.enabled?this.renderSection(s,e,n,t,a):i.qy``}));return i.qy`
        <div class="vacuum-double-column-layout">
          <div class="vacuum-column-left">
            ${l(s)}
          </div>
          <div class="vacuum-column-right">
            ${l(c)}
          </div>
        </div>
      `}return i.qy`
      ${r.map((r=>{const s=o.find((e=>e.id===r));return s&&s.enabled?this.renderSection(s,e,n,t,a):i.qy``}))}
    `}getVacuumState(e){return e?e.state||"unknown":"unavailable"}getBatteryLevel(e){var n,t;if(!(null==e?void 0:e.attributes))return null;const i=null!==(t=null!==(n=e.attributes.battery_level)&&void 0!==n?n:e.attributes.battery)&&void 0!==t?t:e.attributes.battery_percentage;return"number"==typeof i?i:null}getFanSpeedOptions(e){var n;return(null===(n=null==e?void 0:e.attributes)||void 0===n?void 0:n.fan_speed_list)?e.attributes.fan_speed_list:[]}getCurrentFanSpeed(e){var n;return(null===(n=null==e?void 0:e.attributes)||void 0===n?void 0:n.fan_speed)?e.attributes.fan_speed:""}getStatusColor(e,n){return{cleaning:n.status_color_cleaning||"#4CAF50",docked:n.status_color_docked||"#9E9E9E",returning:n.status_color_returning||"#2196F3",idle:n.status_color_idle||"#FF9800",paused:n.status_color_idle||"#FF9800",error:n.status_color_error||"#F44336"}[e]||"var(--secondary-text-color)"}getBatteryColor(e,n){var t,i;if(null===e)return"var(--secondary-text-color)";const a=null!==(t=n.battery_threshold_low)&&void 0!==t?t:20,o=null!==(i=n.battery_threshold_medium)&&void 0!==i?i:50;return e<=a?n.battery_color_low||"#F44336":e<=o?n.battery_color_medium||"#FF9800":n.battery_color_high||"#4CAF50"}getBatteryIcon(e,n){return null===e?"mdi:battery-unknown":n?e>=90?"mdi:battery-charging-100":e>=80?"mdi:battery-charging-80":e>=60?"mdi:battery-charging-60":e>=40?"mdi:battery-charging-40":e>=20?"mdi:battery-charging-20":"mdi:battery-charging-10":e>=90?"mdi:battery":e>=80?"mdi:battery-80":e>=60?"mdi:battery-60":e>=40?"mdi:battery-40":e>=20?"mdi:battery-20":e>=10?"mdi:battery-10":"mdi:battery-outline"}getAnimationClass(e,n){if(!n.enable_animations)return"";const t=n.animation_speed||"normal",i="slow"===t?"-slow":"fast"===t?"-fast":"";switch(e){case"cleaning":const e=n.animation_cleaning||"spin";return"none"!==e?`vacuum-anim-${e}${i}`:"";case"returning":const t=n.animation_returning||"pulse";return"none"!==t?`vacuum-anim-${t}${i}`:"";case"docked":const a=n.animation_charging||"pulse";return"none"!==a?`vacuum-anim-${a}${i}`:"";default:return""}}async handleVacuumCommand(e,n,t){try{await t.callService("vacuum",e,{entity_id:n})}catch(n){console.error(`Vacuum command ${e} failed:`,n)}}async handleFanSpeedChange(e,n,t){try{await t.callService("vacuum","set_fan_speed",{entity_id:n,fan_speed:e})}catch(e){console.error("Fan speed change failed:",e)}}async handleRoomCleanup(e,n,t,i){try{switch(i){case"xiaomi":case"roborock":await t.callService("xiaomi_miio","vacuum_clean_segment",{entity_id:n,segments:e});break;case"valetudo":await t.callService("vacuum","send_command",{entity_id:n,command:"segment_cleanup",params:{segment_ids:e}});break;default:await t.callService("vacuum","send_command",{entity_id:n,command:"app_segment_clean",params:e})}}catch(e){console.error("Room cleanup failed:",e)}}showMoreInfo(e,n){n&&(e.stopPropagation(),(0,a.fireEvent)(e.target,"hass-more-info",{entityId:n}))}async toggleSwitch(e,n,t){if(n&&t){e.stopPropagation();try{t.states[n];const e=n.split(".")[0];"switch"===e?await t.callService("switch","toggle",{entity_id:n}):"input_boolean"===e?await t.callService("input_boolean","toggle",{entity_id:n}):await t.callService("homeassistant","toggle",{entity_id:n})}catch(e){console.error("Toggle failed:",e)}}}getComponentWear(e,n){if(!(null==e?void 0:e.attributes))return null;const t={filter:["filter_left","filter_life","filter_life_remaining"],main_brush:["main_brush_left","main_brush_life","main_brush_life_remaining"],side_brush:["side_brush_left","side_brush_life","side_brush_life_remaining"],sensor:["sensor_dirty_left","sensor_life","sensor_life_remaining"]}[n];for(const n of t){const t=e.attributes[n];if("number"==typeof t)return t>100?Math.round(t/300*100):t}return null}formatDuration(e,n="minutes"){if(null==e)return"--";let t="seconds"===n?Math.floor(e/60):e;if(t<60)return`${t}m`;const i=Math.floor(t/60),a=t%60;return a>0?`${i}h ${a}m`:`${i}h`}formatArea(e){return null==e?"--":`${e} m²`}handleTouchStart(e){this._touchStartX=e.touches[0].clientX,this._touchStartY=e.touches[0].clientY,this._isSwiping=!1}handleTouchMove(e,n){if(!n)return;const t=e.touches[0].clientX-this._touchStartX,i=Math.abs(e.touches[0].clientY-this._touchStartY);Math.abs(t)>30&&Math.abs(t)>i&&(this._isSwiping=!0,e.preventDefault(),e.stopPropagation())}handleTouchEnd(e,n){if(!n||!this._isSwiping)return;const t=e.changedTouches[0].clientX-this._touchStartX;Math.abs(t)>50&&(t<0&&"vacuum"===this._currentView?this._currentView="map":t>0&&"map"===this._currentView&&(this._currentView="vacuum"),this.triggerPreviewUpdate()),this._isSwiping=!1}handlePointerDown(e,n){if(!n)return;if("mouse"===e.pointerType&&0!==e.button)return;this._pointerDown=!0,this._pointerDragActive=!1,this._pointerDeltaX=0,this._pointerStartX=e.clientX,this._pointerStartY=e.clientY;const t=e.currentTarget;if(t){this._pointerContainerWidth=t.getBoundingClientRect().width||0;try{t.setPointerCapture(e.pointerId)}catch(e){}}}handlePointerMove(e,n){if(!n||!this._pointerDown)return;const t=e.clientX-this._pointerStartX,i=Math.abs(e.clientY-this._pointerStartY);if(!this._pointerDragActive){if(!(Math.abs(t)>10&&Math.abs(t)>i))return;this._pointerDragActive=!0}e.preventDefault(),e.stopPropagation(),this._pointerDeltaX=t,this._pointerRafPending||(this._pointerRafPending=!0,requestAnimationFrame((()=>{this._pointerRafPending=!1,this.triggerPreviewUpdate()})))}handlePointerUp(e,n){if(!n)return;const t=e.currentTarget;if(t)try{t.releasePointerCapture(e.pointerId)}catch(e){}if(!this._pointerDown)return;const i=this._pointerDeltaX,a=this._pointerContainerWidth||0;if(this._pointerDragActive){const e=Math.max(60,.18*a);Math.abs(i)>e&&(this._currentView=i<0?"map":"vacuum")}this._pointerDown=!1,this._pointerDragActive=!1,this._pointerDeltaX=0,this._pointerContainerWidth=0,this.triggerPreviewUpdate()}renderGeneralTab(e,n,t,a){const o=e;return i.qy`
      <style>
        ${this.injectUcFormStyles()}
      </style>

      <!-- Entity Configuration -->
      ${this.renderSettingsSection("Entity Configuration","Select the vacuum entity to control",[{title:"Vacuum Entity",description:"Select a vacuum entity - related sensors will be auto-detected",hass:n,data:{entity:o.entity||""},schema:[{name:"entity",selector:{entity:{domain:"vacuum"}}}],onChange:e=>{const t=e.detail.value.entity,i=n.states[t],o=i?this.detectIntegration(i):"generic",r=this.autoPopulateEntities(t,n);a(Object.assign({entity:t,detected_integration:o},r))}},{title:"Display Name",description:"Custom name to display (leave empty to use entity name)",hass:n,data:{name:o.name||""},schema:[{name:"name",selector:{text:{}}}],onChange:e=>a({name:e.detail.value.name})}])}

      <!-- Card Layout Builder -->
      ${this.renderCardLayoutSection(o,n,a)}

      <!-- Animations Toggle -->
      ${this.renderSettingsSection("Animations","Control vacuum animations",[{title:"Enable Animations",description:"Turn on/off vacuum animations (spinning brushes, dock LED, etc.)",hass:n,data:{enable_animations:!1!==o.enable_animations},schema:[this.booleanField("enable_animations")],onChange:e=>a({enable_animations:e.detail.value.enable_animations})}])}
    `}renderPreview(e,n,t,a){var o,s,c,l,u;const d=e,m=null==n?void 0:n.states[d.entity],p=this.getVacuumState(m),v=this.getBatteryLevel(m),_="docked"===p&&(null===(s=null===(o=null==m?void 0:m.attributes)||void 0===o?void 0:o.status)||void 0===s?void 0:s.toLowerCase().includes("charg")),h=this.getCurrentFanSpeed(m),g=this.getFanSpeedOptions(m),y=d.name||(null===(c=null==m?void 0:m.attributes)||void 0===c?void 0:c.friendly_name)||"Vacuum",b=this.getStatusColor(p,d),f=this.getAnimationClass(p,d),x=null==d?void 0:d.hover_effect,$=r.k.getHoverEffectClass(x),w=(d.display_sections||this.getDefaultSections()).find((e=>"map"===e.type&&e.enabled)),k=(null===(l=null==w?void 0:w.settings)||void 0===l?void 0:l.display_mode)||"below_vacuum",S=null===(u=null==w?void 0:w.settings)||void 0===u?void 0:u.entity_override,q=!!(d.map_entity||d.map_image_entity||S||d.map_card_config),C=d.vacuum_size||120,D=d.layout_mode||"standard";return i.qy`
      <style>
        ${this.getStyles()}
      </style>
      
      <div 
        class="vacuum-module-container ${$} layout-${D} ${"swipe"===k?"swipe-mode":""}"
        @touchstart=${e=>this.handleTouchStart(e)}
        @touchmove=${e=>this.handleTouchMove(e,!!q&&"swipe"===k)}
        @touchend=${e=>this.handleTouchEnd(e,!!q&&"swipe"===k)}
      >
        ${m?"compact"===D?this.renderCompactLayout(d,m,n,y,p,v,_,b,f,C):"detailed"===D?this.renderDetailedLayout(d,m,n,y,p,v,_,b,f,C,h,g):this.renderStandardLayout(d,m,n,y,p,v,_,b,f,C,h,g):this.renderNoEntity(d)}
      </div>
    `}renderNoEntity(e){return i.qy`
      <div class="vacuum-no-entity">
        <ha-icon icon="mdi:robot-vacuum-alert"></ha-icon>
        <span>No vacuum entity configured</span>
      </div>
    `}renderPaginationDots(e){const n="map"===this._currentView,t=e?`background: ${e};`:"";return i.qy`
      <div class="vacuum-pagination-dots">
        <div 
          class="vacuum-dot ${n?"":"active"}"
          style="${n?"":t}"
          @click=${()=>{this._currentView="vacuum",this.triggerPreviewUpdate()}}
          title="Vacuum"
        ></div>
        <div 
          class="vacuum-dot ${n?"active":""}"
          style="${n?t:""}"
          @click=${()=>{this._currentView="map",this.triggerPreviewUpdate()}}
          title="Map"
        ></div>
      </div>
    `}renderCompactLayout(e,n,t,a,o,r,s,c,l,u){const d={displayName:a,state:o,batteryLevel:r,isCharging:s,statusColor:c,animationClass:l,vacuumSize:.6*u,fanSpeed:"",fanSpeedOptions:[],isActive:"cleaning"===o||"returning"===o,isDocked:"docked"===o||"charging"===o||s};return i.qy`
      <div class="vacuum-compact vacuum-sections-layout">
        ${this.renderSectionsInOrder(e,n,t,d)}
      </div>
    `}renderStandardLayout(e,n,t,a,o,r,s,c,l,u,d,m){const p={displayName:a,state:o,batteryLevel:r,isCharging:s,statusColor:c,animationClass:l,vacuumSize:u,fanSpeed:d,fanSpeedOptions:m,isActive:"cleaning"===o||"returning"===o,isDocked:"docked"===o||"charging"===o||s};return i.qy`
      <div class="vacuum-standard vacuum-sections-layout">
        ${this.renderSectionsInOrder(e,n,t,p)}
      </div>
    `}renderDetailedLayout(e,n,t,a,o,r,s,c,l,u,d,m){const p={displayName:a,state:o,batteryLevel:r,isCharging:s,statusColor:c,animationClass:l,vacuumSize:u,fanSpeed:d,fanSpeedOptions:m,isActive:"cleaning"===o||"returning"===o,isDocked:"docked"===o||"charging"===o||s};return i.qy`
      <div class="vacuum-detailed vacuum-sections-layout">
        ${this.renderSectionsInOrder(e,n,t,p)}
      </div>
    `}renderVacuumIcon(e,n,t,a=!1,o=!1,r){const s=e.custom_vacuum_image,c=r||e.primary_color||"var(--primary-color)",l=o?"":n;return s?i.qy`
        <div class="vacuum-image ${l}" style="width: ${t}px; height: ${t}px;">
          <img src="${s}" alt="Vacuum" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>
      `:i.qy`
      <div class="vacuum-svg-container ${l}" style="width: ${t}px; height: ${t}px;">
        ${this.renderVacuumSVG(t,a,c,o)}
      </div>
    `}renderVacuumSVG(e,n,t,a=!1){const o=(e,n)=>{const t=[];for(let i=0;i<8;i++){const a=360*i/8*(Math.PI/180),o=e+12*Math.cos(a),r=n+12*Math.sin(a);t.push({x1:e,y1:n,x2:o,y2:r})}return t},r=o(30,85),s=o(70,85);return i.qy`
      <svg 
        viewBox="5 ${a?"0":"20"} 90 ${a?"105":"85"}" 
        width="${e}" 
        height="${e}"
        class="vacuum-svg ${n?"vacuum-svg-active":""}"
        style="overflow: visible;"
      >
        <defs>
          <!-- Gradient for the body -->
          <linearGradient id="vacuumBodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color: var(--card-background-color, #3a3a3a); stop-opacity: 1" />
            <stop offset="100%" style="stop-color: var(--secondary-background-color, #2a2a2a); stop-opacity: 1" />
          </linearGradient>
          <!-- Dock gradient -->
          <linearGradient id="dockGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color: var(--secondary-background-color, #444); stop-opacity: 1" />
            <stop offset="100%" style="stop-color: var(--card-background-color, #2a2a2a); stop-opacity: 1" />
          </linearGradient>
          <!-- Shadow filter -->
          <filter id="vacuumShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
        
        <!-- DOCK (shown when docked) -->
        ${a?i.qy`
          <g class="vacuum-dock">
            <!-- Dock station at top -->
            <path d="M 25 5 L 75 5 L 75 22 Q 75 28 69 28 L 31 28 Q 25 28 25 22 Z" 
                  fill="url(#dockGradient)" 
                  stroke="#666666" 
                  stroke-width="1.5"/>
            <!-- Dock charging contacts -->
            <rect x="38" y="24" width="8" height="6" rx="1" fill="#777777"/>
            <rect x="54" y="24" width="8" height="6" rx="1" fill="#777777"/>
            <!-- Dock LED indicator - slow blinking when charging -->
            <circle cx="50" cy="12" r="3" fill="${t}" class="vacuum-dock-led"/>
            <!-- Dock brand line -->
            <line x1="35" y1="18" x2="65" y2="18" stroke="#888888" stroke-width="1"/>
          </g>
        `:""}
        
        <!-- BRUSHES DRAWN FIRST (underneath the robot body) -->
        
        <!-- Left side brush - thin asterisk pattern with spinning bristles -->
        <g class="vacuum-side-brush-left ${n?"vacuum-brush-spin":""}" style="transform-origin: ${30}px ${85}px;">
          ${r.map((e=>i.JW`
            <line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" 
                  stroke="${t}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          `))}
          <circle cx="${30}" cy="${85}" r="3" 
                  fill="var(--divider-color, #444)" stroke="${t}" stroke-width="1.5"/>
        </g>
        
        <!-- Right side brush - thin asterisk pattern with spinning bristles -->
        <g class="vacuum-side-brush-right ${n?"vacuum-brush-spin-reverse":""}" style="transform-origin: ${70}px ${85}px;">
          ${s.map((e=>i.JW`
            <line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" 
                  stroke="${t}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          `))}
          <circle cx="${70}" cy="${85}" r="3" 
                  fill="var(--divider-color, #444)" stroke="${t}" stroke-width="1.5"/>
        </g>
        
        <!-- ROBOT BODY DRAWN ON TOP -->
        
        <!-- Main body - outer ring -->
        <circle 
          cx="50" cy="60" r="38" 
          fill="url(#vacuumBodyGradient)" 
          stroke="var(--divider-color, #555)" 
          stroke-width="2"
          filter="url(#vacuumShadow)"
        />
        
        <!-- Inner body ring -->
        <circle 
          cx="50" cy="60" r="31" 
          fill="none" 
          stroke="var(--divider-color, #444)" 
          stroke-width="1.5"
        />
        
        <!-- Top sensor/LiDAR bump -->
        <circle 
          cx="50" cy="30" r="6" 
          fill="var(--secondary-background-color, #333)"
          stroke="var(--divider-color, #555)" 
          stroke-width="1.5"
        />
        <circle 
          cx="50" cy="30" r="3" 
          fill="${t}"
          class="${n?"vacuum-sensor-blink":""}"
        />
        
        <!-- Center dust bin area - positioned in lower half -->
        <ellipse 
          cx="50" cy="73" rx="12" ry="8" 
          fill="var(--secondary-background-color, #333)"
          stroke="var(--divider-color, #555)" 
          stroke-width="1"
        />
        
        <!-- Horizontal divider line -->
        <line 
          x1="22" y1="55" x2="78" y2="55" 
          stroke="var(--divider-color, #555)" 
          stroke-width="1.5"
          stroke-linecap="round"
        />
        
        <!-- Status LED indicator -->
        <circle 
          cx="50" cy="44" r="3" 
          fill="${n||a?t:"var(--divider-color, #555)"}"
          class="${n?"vacuum-status-led":a?"vacuum-charging-led":""}"
        />

        <!-- Dock arc overlay (drawn on top of robot so it isn't hidden by the body) -->
        ${a?i.JW`
          <g class="vacuum-dock-arc-group">
            <!-- Single blue arc positioned at the TOP of the robot -->
            <!-- Slightly lower than the absolute top so glow isn't clipped by the image container -->
            <path d="M 12 32 Q 50 2 88 32"
                  fill="none"
                  stroke="${t}"
                  stroke-width="6"
                  stroke-linecap="round"
                  class="vacuum-dock-arc-pulse"
                  style="color: ${t};" />
          </g>
        `:""}
      </svg>
    `}formatState(e){return{cleaning:"Cleaning",docked:"Docked",returning:"Returning",idle:"Idle",paused:"Paused",error:"Error",unavailable:"Unavailable",unknown:"Unknown"}[e]||e.charAt(0).toUpperCase()+e.slice(1)}renderCleaningStats(e,n){var t,a,o,r;const s=(null==e?void 0:e.attributes)||{},c=null!==(a=null!==(t=s.cleaning_time)&&void 0!==t?t:s.clean_time)&&void 0!==a?a:s.total_cleaning_time,l=null!==(r=null!==(o=s.cleaned_area)&&void 0!==o?o:s.clean_area)&&void 0!==r?r:s.total_cleaned_area;return void 0===c&&void 0===l?i.qy``:i.qy`
      <div class="vacuum-stats">
        ${void 0!==c?i.qy`
              <div class="vacuum-stat">
                <ha-icon icon="mdi:clock-outline"></ha-icon>
                <span>${this.formatDuration(c)}</span>
              </div>
            `:""}
        ${void 0!==l?i.qy`
              <div class="vacuum-stat">
                <ha-icon icon="mdi:texture-box"></ha-icon>
                <span>${this.formatArea(l)}</span>
              </div>
            `:""}
      </div>
    `}getEntityValue(e,n){return n&&e.states[n]?e.states[n].state:null}getEntityNumericValue(e,n){const t=this.getEntityValue(e,n);if(null===t||"unavailable"===t||"unknown"===t)return null;const i=parseFloat(t);return isNaN(i)?null:i}formatError(e){return e&&"none"!==e&&"ok"!==e?e.replace(/_/g," ").replace(/\b\w/g,(e=>e.toUpperCase())):""}renderCleaningStatsDetailed(e,n,t,a){var o,r,s,c,l,u,d,m;const p=(null==e?void 0:e.attributes)||{},v=n.cleaning_time_entity,_=n.cleaning_area_entity,h=null!==(c=null!==(s=null!==(r=null!==(o=this.getEntityNumericValue(t,v))&&void 0!==o?o:p.cleaning_time)&&void 0!==r?r:p.clean_time)&&void 0!==s?s:p.cleanTime)&&void 0!==c?c:p.duration,g=null!==(m=null!==(d=null!==(u=null!==(l=this.getEntityNumericValue(t,_))&&void 0!==l?l:p.cleaned_area)&&void 0!==u?u:p.clean_area)&&void 0!==d?d:p.cleaning_area)&&void 0!==m?m:p.area_cleaned;if(void 0===h&&void 0===g)return i.qy``;const y=!1!==(null==a?void 0:a.show_title),b=!1!==(null==a?void 0:a.show_icon),f=!1!==(null==a?void 0:a.show_label),x=null==a?void 0:a.color,$=x?`color: ${x};`:"";return i.qy`
      <div class="vacuum-stats-detailed">
        ${y?i.qy`<div class="stats-section-title">Current Session</div>`:""}
        <div class="stats-row">
          ${null!=h?i.qy`
                <div 
                  class="stat-item ${v?"clickable":""}"
                  @click=${v?e=>this.showMoreInfo(e,v):i.s6}
                >
                  ${b?i.qy`<ha-icon icon="mdi:clock-outline" style="${$}"></ha-icon>`:""}
                  <div class="stat-value">${this.formatDuration(h)}</div>
                  ${f?i.qy`<div class="stat-label">Time</div>`:""}
                </div>
              `:""}
          ${null!=g?i.qy`
                <div 
                  class="stat-item ${_?"clickable":""}"
                  @click=${_?e=>this.showMoreInfo(e,_):i.s6}
                >
                  ${b?i.qy`<ha-icon icon="mdi:texture-box" style="${$}"></ha-icon>`:""}
                  <div class="stat-value">${this.formatArea(g)}</div>
                  ${f?i.qy`<div class="stat-label">Area</div>`:""}
                </div>
              `:""}
        </div>
      </div>
    `}renderLastClean(e,n,t){const a=e.last_clean_begin_entity,o=e.last_clean_end_entity,r=this.getEntityValue(n,a),s=this.getEntityValue(n,o);if(!r&&!s)return i.qy``;const c=!1!==(null==t?void 0:t.show_title),l=!1!==(null==t?void 0:t.show_icon),u=!1!==(null==t?void 0:t.show_label),d=null==t?void 0:t.color,m=d?`color: ${d};`:"",p=e=>{if(!e)return"";try{return new Date(e).toLocaleString(void 0,{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}catch(n){return e}};return i.qy`
      <div class="vacuum-last-clean">
        ${c?i.qy`<div class="stats-section-title">Last Cleaning</div>`:""}
        <div class="last-clean-times">
          ${r?i.qy`
                <div 
                  class="time-item ${a?"clickable":""}"
                  @click=${a?e=>this.showMoreInfo(e,a):i.s6}
                >
                  ${l?i.qy`<ha-icon icon="mdi:play-circle-outline" style="${m}"></ha-icon>`:""}
                  ${u?i.qy`<span>${p(r)}</span>`:""}
                </div>
              `:""}
          ${s?i.qy`
                <div 
                  class="time-item ${o?"clickable":""}"
                  @click=${o?e=>this.showMoreInfo(e,o):i.s6}
                >
                  ${l?i.qy`<ha-icon icon="mdi:stop-circle-outline" style="${m}"></ha-icon>`:""}
                  ${u?i.qy`<span>${p(s)}</span>`:""}
                </div>
              `:""}
        </div>
      </div>
    `}renderTotalStats(e,n,t){var a,o,r,s,c,l,u,d,m,p;const v=e.entity?null==n?void 0:n.states[e.entity]:null,_=(null==v?void 0:v.attributes)||{},h=e.total_cleaning_area_entity,g=e.total_cleaning_time_entity,y=e.total_cleaning_count_entity,b=null!==(r=null!==(o=null!==(a=this.getEntityNumericValue(n,h))&&void 0!==a?a:_.total_cleaning_area)&&void 0!==o?o:_.total_clean_area)&&void 0!==r?r:_.lifetime_area,f=null!==(l=null!==(c=null!==(s=this.getEntityNumericValue(n,g))&&void 0!==s?s:_.total_cleaning_time)&&void 0!==c?c:_.total_clean_time)&&void 0!==l?l:_.lifetime_time,x=null!==(p=null!==(m=null!==(d=null!==(u=this.getEntityNumericValue(n,y))&&void 0!==u?u:_.total_cleaning_count)&&void 0!==d?d:_.total_clean_count)&&void 0!==m?m:_.total_cleans)&&void 0!==p?p:_.cleaning_count;if(null===b&&null===f&&null===x)return i.qy``;const $=!1!==(null==t?void 0:t.show_title),w=!1!==(null==t?void 0:t.show_icon),k=!1!==(null==t?void 0:t.show_label),S=null==t?void 0:t.color,q=S?`color: ${S};`:"";return i.qy`
      <div class="vacuum-total-stats">
        ${$?i.qy`<div class="stats-section-title">Lifetime Statistics</div>`:""}
        <div class="stats-row">
          ${null!==f?i.qy`
                <div 
                  class="stat-item ${g?"clickable":""}"
                  @click=${g?e=>this.showMoreInfo(e,g):i.s6}
                >
                  ${w?i.qy`<ha-icon icon="mdi:clock-check-outline" style="${q}"></ha-icon>`:""}
                  <div class="stat-value">${this.formatDuration(60*f)}</div>
                  ${k?i.qy`<div class="stat-label">Total Time</div>`:""}
                </div>
              `:""}
          ${null!==b?i.qy`
                <div 
                  class="stat-item ${h?"clickable":""}"
                  @click=${h?e=>this.showMoreInfo(e,h):i.s6}
                >
                  ${w?i.qy`<ha-icon icon="mdi:floor-plan" style="${q}"></ha-icon>`:""}
                  <div class="stat-value">${this.formatArea(b)}</div>
                  ${k?i.qy`<div class="stat-label">Total Area</div>`:""}
                </div>
              `:""}
          ${null!==x?i.qy`
                <div 
                  class="stat-item ${y?"clickable":""}"
                  @click=${y?e=>this.showMoreInfo(e,y):i.s6}
                >
                  ${w?i.qy`<ha-icon icon="mdi:counter" style="${q}"></ha-icon>`:""}
                  <div class="stat-value">${x}</div>
                  ${k?i.qy`<div class="stat-label">Sessions</div>`:""}
                </div>
              `:""}
        </div>
      </div>
    `}renderDndStatus(e,n,t){const a=e.entity?null==n?void 0:n.states[e.entity]:null,o=(null==a?void 0:a.attributes)||{},r=(null==t?void 0:t.entity_override)||e.do_not_disturb_entity;let s=this.getEntityValue(n,r);null===s&&void 0!==o.do_not_disturb&&(s=o.do_not_disturb?"on":"off");const c=this.getEntityValue(n,e.do_not_disturb_begin_entity),l=this.getEntityValue(n,e.do_not_disturb_end_entity);if(null===s)return i.qy``;const u="on"===s||"true"===String(s),d=!1!==(null==t?void 0:t.show_icon),m=!1!==(null==t?void 0:t.show_label),p=(null==t?void 0:t.button_color)||"var(--primary-color)",v=u?p:"var(--disabled-color, #9e9e9e)",_=`background: ${v}; border-color: ${v}; color: var(--text-primary-color, #fff);`,h=r&&(r.startsWith("switch.")||r.startsWith("input_boolean."));return i.qy`
      <div 
        class="vacuum-dnd-status ${u?"dnd-active":""} ${h?"clickable":""}" 
        style="${_} border-radius: 8px; padding: 8px 12px; cursor: ${h?"pointer":"default"};"
        @click=${h?e=>this.toggleSwitch(e,r,n):i.s6}
      >
        <div class="dnd-header" style="display: flex; align-items: center; gap: 8px;">
          ${d?i.qy`<ha-icon icon="${u?"mdi:bell-off":"mdi:bell"}" style="color: inherit;"></ha-icon>`:""}
          ${m?i.qy`<span>Do Not Disturb: ${u?"On":"Off"}</span>`:""}
        </div>
        ${c&&l&&m?i.qy`<div class="dnd-times" style="opacity: 0.8; font-size: 0.85em; margin-top: 4px;">${c} - ${l}</div>`:""}
      </div>
    `}renderVolumeControl(e,n,t){const a=(null==t?void 0:t.entity_override)||e.volume_entity,o=this.getEntityNumericValue(n,a);if(null===o)return i.qy``;const r=!1!==(null==t?void 0:t.show_icon),s=!1!==(null==t?void 0:t.show_value),c=(null==t?void 0:t.color)||"var(--primary-color)";return i.qy`
      <div 
        class="vacuum-volume ${a?"clickable":""}"
        @click=${a?e=>this.showMoreInfo(e,a):i.s6}
      >
        <div class="volume-header">
          ${r?i.qy`<ha-icon icon="mdi:volume-high" style="color: ${c};"></ha-icon>`:""}
          ${s?i.qy`<span>Volume: ${o}%</span>`:""}
        </div>
        <div class="volume-bar">
          <div class="volume-bar-fill" style="width: ${o}%; background: ${c};"></div>
        </div>
      </div>
    `}renderComponentWear(e,n,t){const a=t?this.getEntityNumericValue(t,n.filter_entity):null,o=t?this.getEntityNumericValue(t,n.main_brush_entity):null,r=t?this.getEntityNumericValue(t,n.side_brush_entity):null,s=t?this.getEntityNumericValue(t,n.sensor_entity):null,c=(e,n=300)=>null===e?null:e<0?0:Math.min(100,Math.round(e/n*100)),l=!1!==n.show_filter_life?null!==a?c(a,150):this.getComponentWear(e,"filter"):null,u=!1!==n.show_main_brush_life?null!==o?c(o,300):this.getComponentWear(e,"main_brush"):null,d=!1!==n.show_side_brush_life?null!==r?c(r,200):this.getComponentWear(e,"side_brush"):null,m=n.show_sensor_life?null!==s?c(s,30):this.getComponentWear(e,"sensor"):null;return null!==l||null!==u||null!==d||null!==m?i.qy`
      <div class="component-wear">
        <div class="component-wear-title">Component Life</div>
        <div class="component-wear-grid">
          ${null!==l?i.qy`
                <div class="component-item">
                  <ha-icon icon="mdi:air-filter"></ha-icon>
                  <div class="component-bar">
                    <div class="component-bar-fill" style="width: ${l}%; background: ${this.getWearColor(l)}"></div>
                  </div>
                  <span class="component-value">${l}%</span>
                </div>
              `:""}
          ${null!==u?i.qy`
                <div class="component-item">
                  <ha-icon icon="mdi:brush"></ha-icon>
                  <div class="component-bar">
                    <div class="component-bar-fill" style="width: ${u}%; background: ${this.getWearColor(u)}"></div>
                  </div>
                  <span class="component-value">${u}%</span>
                </div>
              `:""}
          ${null!==d?i.qy`
                <div class="component-item">
                  <ha-icon icon="mdi:fan"></ha-icon>
                  <div class="component-bar">
                    <div class="component-bar-fill" style="width: ${d}%; background: ${this.getWearColor(d)}"></div>
                  </div>
                  <span class="component-value">${d}%</span>
                </div>
              `:""}
          ${null!==m?i.qy`
                <div class="component-item">
                  <ha-icon icon="mdi:eye"></ha-icon>
                  <div class="component-bar">
                    <div class="component-bar-fill" style="width: ${m}%; background: ${this.getWearColor(m)}"></div>
                  </div>
                  <span class="component-value">${m}%</span>
                </div>
              `:""}
        </div>
      </div>
    `:i.qy``}getWearColor(e){return e<=20?"#F44336":e<=50?"#FF9800":"#4CAF50"}renderControls(e,n,t,a,o,r){const s=e.control_layout||"row",c="cleaning"===a||"returning"===a;return i.qy`
      <div class="vacuum-controls layout-${s}">
        ${!1!==e.show_start_button?i.qy`
              <button
                class="vacuum-control-btn ${"cleaning"===a?"active":""}"
                @click=${()=>this.handleVacuumCommand("start",e.entity,t)}
                title="Start"
              >
                <ha-icon icon="mdi:play"></ha-icon>
                ${"compact"!==s?i.qy`<span>Start</span>`:""}
              </button>
            `:""}
        ${!1!==e.show_pause_button?i.qy`
              <button
                class="vacuum-control-btn ${"paused"===a?"active":""}"
                @click=${()=>this.handleVacuumCommand("pause",e.entity,t)}
                title="Pause"
                ?disabled=${!c}
              >
                <ha-icon icon="mdi:pause"></ha-icon>
                ${"compact"!==s?i.qy`<span>Pause</span>`:""}
              </button>
            `:""}
        ${!1!==e.show_stop_button?i.qy`
              <button
                class="vacuum-control-btn"
                @click=${()=>this.handleVacuumCommand("stop",e.entity,t)}
                title="Stop"
                ?disabled=${!c&&"paused"!==a}
              >
                <ha-icon icon="mdi:stop"></ha-icon>
                ${"compact"!==s?i.qy`<span>Stop</span>`:""}
              </button>
            `:""}
        ${!1!==e.show_dock_button?i.qy`
              <button
                class="vacuum-control-btn ${"returning"===a?"active":""}"
                @click=${()=>this.handleVacuumCommand("return_to_base",e.entity,t)}
                title="Return to Dock"
              >
                <ha-icon icon="mdi:home"></ha-icon>
                ${"compact"!==s?i.qy`<span>Dock</span>`:""}
              </button>
            `:""}
        ${e.show_locate_button?i.qy`
              <button
                class="vacuum-control-btn"
                @click=${()=>this.handleVacuumCommand("locate",e.entity,t)}
                title="Locate"
              >
                <ha-icon icon="mdi:map-marker"></ha-icon>
                ${"compact"!==s?i.qy`<span>Locate</span>`:""}
              </button>
            `:""}
      </div>
    `}renderCompactControls(e,n,t){const a=this.getVacuumState(n),o="cleaning"===a||"returning"===a;return i.qy`
      <div class="vacuum-compact-controls">
        ${o?i.qy`
              <button class="vacuum-compact-btn" @click=${()=>this.handleVacuumCommand("pause",e.entity,t)} title="Pause">
                <ha-icon icon="mdi:pause"></ha-icon>
              </button>
              <button class="vacuum-compact-btn" @click=${()=>this.handleVacuumCommand("return_to_base",e.entity,t)} title="Dock">
                <ha-icon icon="mdi:home"></ha-icon>
              </button>
            `:i.qy`
              <button class="vacuum-compact-btn" @click=${()=>this.handleVacuumCommand("start",e.entity,t)} title="Start">
                <ha-icon icon="mdi:play"></ha-icon>
              </button>
            `}
      </div>
    `}renderFanSpeedControl(e,n,t,a,o,r){const s=(null==r?void 0:r.style)||"default",c=(null==r?void 0:r.color)||"var(--primary-color)",l=`background: ${c}; border-color: ${c};`,u=(n="",r=l)=>i.qy`
      <div class="fan-speed-select-wrapper">
        <select 
          class="fan-speed-select ${n}"
          style="${r}"
          @change=${n=>{const i=n.target;this.handleFanSpeedChange(i.value,e.entity,t)}}
        >
          ${o.map((e=>i.qy`
              <option value="${e}" ?selected=${a===e}>
                ${(e=>e.replace(/_/g," ").replace(/\b\w/g,(e=>e.toUpperCase())))(e)}
              </option>
            `))}
        </select>
        <ha-icon class="fan-speed-caret" icon="mdi:chevron-down" style="color: ${"compact"===n?c:"inherit"};"></ha-icon>
      </div>
    `;return"speed_only"===s?i.qy`
        <div class="vacuum-fan-speed-row speed-only">
          ${u("",l)}
        </div>
      `:"compact"===s?i.qy`
        <div class="vacuum-fan-speed-row compact">
          <ha-icon icon="mdi:fan" style="color: ${c};"></ha-icon>
          ${u("compact",`color: ${c}; border-color: ${c};`)}
        </div>
      `:i.qy`
      <div class="vacuum-fan-speed-row">
        <div class="fan-speed-left">
          <ha-icon icon="mdi:fan" style="color: ${c};"></ha-icon>
          <span>Speed</span>
        </div>
        <div class="fan-speed-right">
          ${u("",l)}
        </div>
      </div>
    `}renderMapView(e,n,t,a=!1){var o,r,s;const c=(null==t?void 0:t.bar_height)||e.map_height||200,l=e.map_border_radius||12,u=(null==t||t.display_mode,null==t?void 0:t.entity_override),d=u?null==n?void 0:n.states[u]:null,m=e.map_image_entity?null==n?void 0:n.states[e.map_image_entity]:null,p=e.map_entity?null==n?void 0:n.states[e.map_entity]:null,v=(null===(o=null==d?void 0:d.attributes)||void 0===o?void 0:o.entity_picture)||(null===(r=null==m?void 0:m.attributes)||void 0===r?void 0:r.entity_picture)||(null===(s=null==p?void 0:p.attributes)||void 0===s?void 0:s.entity_picture);return v?i.qy`
        <div class="vacuum-map-container ${a?"inline":""}" style="height: ${c}px; border-radius: ${l}px;">
          <img
            draggable="false"
            src="${v}" 
            alt="Vacuum Map" 
            class="vacuum-map-image"
            style="border-radius: ${l}px;"
            @dragstart=${e=>e.preventDefault()}
          />
          ${""}
        </div>
      `:i.qy`
      <div class="vacuum-map-container vacuum-map-empty ${a?"inline":""}" style="height: ${c}px; border-radius: ${l}px;">
        <ha-icon icon="mdi:map-outline"></ha-icon>
        <span>No map available</span>
        ${""}
      </div>
    `}validate(e){const n=e,t=[...super.validate(e).errors];return n.entity&&""!==n.entity.trim()?n.entity.startsWith("vacuum.")||t.push("Entity must be a vacuum entity (vacuum.*)"):t.push("Vacuum entity is required"),n.map_entity&&!n.map_entity.startsWith("camera.")&&t.push("Map entity must be a camera entity (camera.*)"),{valid:0===t.length,errors:t}}getStyles(){return'\n      /* Clickable elements - for more-info and toggle actions */\n      .clickable {\n        cursor: pointer;\n        transition: opacity 0.2s ease, transform 0.1s ease;\n      }\n      .clickable:hover {\n        opacity: 0.8;\n      }\n      .clickable:active {\n        transform: scale(0.98);\n      }\n      \n      .vacuum-module-container {\n        padding: 12px 16px 16px 16px;\n        background: var(--card-background-color, var(--ha-card-background));\n        border-radius: 12px;\n        position: relative;\n        overflow: hidden;\n      }\n      .vacuum-module-container.swipe-mode {\n        /* Allow vertical scrolling but keep horizontal swipes available for our handler */\n        touch-action: pan-y;\n      }\n      \n      .vacuum-no-entity {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        padding: 32px;\n        color: var(--secondary-text-color);\n        gap: 12px;\n      }\n      .vacuum-no-entity ha-icon {\n        font-size: 48px;\n        opacity: 0.5;\n      }\n      \n      .vacuum-compact {\n        display: flex;\n        align-items: center;\n        gap: 16px;\n      }\n      .vacuum-compact-left {\n        flex-shrink: 0;\n      }\n      .vacuum-compact-right {\n        flex: 1;\n        min-width: 0;\n      }\n      .vacuum-compact-info {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n        margin-top: 4px;\n      }\n      .vacuum-battery-compact {\n        display: flex;\n        align-items: center;\n        gap: 4px;\n        font-size: 14px;\n        color: var(--secondary-text-color);\n      }\n      .vacuum-battery-compact ha-icon {\n        font-size: 18px;\n      }\n      .vacuum-compact-controls {\n        display: flex;\n        gap: 8px;\n        margin-left: auto;\n      }\n      .vacuum-compact-btn {\n        background: var(--primary-color);\n        color: var(--text-primary-color, white);\n        border: none;\n        border-radius: 50%;\n        width: 36px;\n        height: 36px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n      .vacuum-compact-btn:hover {\n        transform: scale(1.1);\n        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);\n      }\n      .vacuum-compact-btn ha-icon {\n        font-size: 18px;\n      }\n      \n      .vacuum-standard {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: 16px;\n        text-align: center;\n      }\n      .vacuum-header {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: 4px;\n        width: 100%;\n      }\n      .vacuum-name {\n        font-size: 20px;\n        font-weight: 600;\n        color: var(--primary-text-color);\n      }\n      .vacuum-status-text {\n        font-size: 14px;\n        font-weight: 500;\n        text-transform: capitalize;\n      }\n      .vacuum-battery {\n        display: flex;\n        align-items: center;\n        gap: 6px;\n        font-size: 14px;\n        font-weight: 500;\n      }\n      .vacuum-battery ha-icon {\n        --mdc-icon-size: 20px;\n      }\n      .vacuum-icon-container {\n        position: relative;\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: 6px;\n      }\n      .vacuum-status-badge {\n        padding: 4px 12px;\n        border-radius: 16px;\n        font-size: 12px;\n        font-weight: 600;\n        color: white;\n        text-transform: uppercase;\n      }\n      \n      .vacuum-detailed {\n        display: flex;\n        flex-direction: column;\n        gap: 16px;\n      }\n      .vacuum-header-detailed {\n        display: flex;\n        justify-content: space-between;\n        align-items: flex-start;\n      }\n      .vacuum-header-left {\n        display: flex;\n        flex-direction: column;\n        gap: 4px;\n      }\n      .vacuum-status-text {\n        font-size: 14px;\n        font-weight: 500;\n      }\n      .vacuum-battery-detailed {\n        display: flex;\n        align-items: center;\n        gap: 6px;\n        font-size: 18px;\n        font-weight: 600;\n      }\n      .vacuum-battery-detailed ha-icon {\n        font-size: 28px;\n      }\n      .vacuum-main-content {\n        display: flex;\n        gap: 24px;\n        align-items: flex-start;\n      }\n      .vacuum-icon-wrapper {\n        flex-shrink: 0;\n      }\n      .vacuum-info-panel {\n        flex: 1;\n        min-width: 0;\n      }\n      \n      .vacuum-icon {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        color: var(--primary-color);\n        transition: all 0.3s ease;\n      }\n      .vacuum-icon ha-icon {\n        width: 100%;\n        height: 100%;\n      }\n      .vacuum-image {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n      }\n      \n      /* SVG Vacuum Container */\n      .vacuum-svg-container {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n      }\n      .vacuum-svg {\n        transition: all 0.3s ease;\n      }\n      \n      .vacuum-status {\n        font-size: 14px;\n        font-weight: 500;\n      }\n      \n      .vacuum-stats {\n        display: flex;\n        justify-content: center;\n        gap: 24px;\n        padding: 12px 0;\n      }\n      .vacuum-stat {\n        display: flex;\n        align-items: center;\n        gap: 6px;\n        font-size: 14px;\n        color: var(--secondary-text-color);\n      }\n      .vacuum-stat ha-icon {\n        font-size: 18px;\n      }\n      \n      .vacuum-stats-detailed {\n        display: flex;\n        flex-direction: column;\n        gap: 12px;\n      }\n      .stats-section-title {\n        font-size: 12px;\n        font-weight: 600;\n        text-transform: uppercase;\n        color: var(--secondary-text-color);\n        letter-spacing: 0.5px;\n      }\n      .stats-row {\n        display: flex;\n        gap: 16px;\n        flex-wrap: wrap;\n      }\n      .stat-item {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: 4px;\n        min-width: 60px;\n      }\n      .stat-item ha-icon {\n        font-size: 20px;\n        color: var(--primary-color);\n      }\n      .stat-value {\n        font-size: 16px;\n        font-weight: 600;\n        color: var(--primary-text-color);\n      }\n      .stat-label {\n        font-size: 11px;\n        color: var(--secondary-text-color);\n        text-transform: uppercase;\n      }\n      \n      .component-wear {\n        margin-top: 16px;\n        padding-top: 16px;\n        border-top: 1px solid var(--divider-color);\n      }\n      .component-wear-title {\n        font-size: 12px;\n        font-weight: 600;\n        text-transform: uppercase;\n        color: var(--secondary-text-color);\n        margin-bottom: 12px;\n      }\n      .component-wear-grid {\n        display: flex;\n        flex-direction: column;\n        gap: 8px;\n      }\n      .component-item {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n      }\n      .component-item ha-icon {\n        font-size: 16px;\n        color: var(--secondary-text-color);\n        width: 20px;\n      }\n      .component-bar {\n        flex: 1;\n        height: 6px;\n        background: var(--divider-color);\n        border-radius: 3px;\n        overflow: hidden;\n      }\n      .component-bar-fill {\n        height: 100%;\n        border-radius: 3px;\n        transition: width 0.3s ease;\n      }\n      .component-value {\n        font-size: 12px;\n        font-weight: 600;\n        color: var(--secondary-text-color);\n        width: 36px;\n        text-align: right;\n      }\n      \n      /* Current Room */\n      .vacuum-current-room {\n        display: flex;\n        align-items: center;\n        gap: 4px;\n        font-size: 13px;\n        color: var(--secondary-text-color);\n        margin-top: 4px;\n      }\n      .vacuum-current-room ha-icon {\n        --mdc-icon-size: 16px;\n        color: var(--primary-color);\n      }\n      \n      /* Error Banner */\n      .vacuum-error-banner {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        padding: 12px;\n        background: rgba(var(--rgb-error-color, 244, 67, 54), 0.15);\n        border-radius: 8px;\n        color: var(--error-color, #f44336);\n        font-size: 13px;\n        margin-bottom: 12px;\n      }\n      .vacuum-error-banner ha-icon {\n        --mdc-icon-size: 20px;\n        flex-shrink: 0;\n      }\n      \n      /* Last Clean Section */\n      .vacuum-last-clean {\n        margin-top: 12px;\n        padding-top: 12px;\n        border-top: 1px solid var(--divider-color);\n      }\n      .last-clean-times {\n        display: flex;\n        flex-direction: column;\n        gap: 6px;\n        margin-top: 8px;\n      }\n      .time-item {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        font-size: 13px;\n        color: var(--primary-text-color);\n      }\n      .time-item ha-icon {\n        --mdc-icon-size: 18px;\n        color: var(--secondary-text-color);\n      }\n      \n      /* Total Stats Section */\n      .vacuum-total-stats {\n        margin-top: 12px;\n        padding-top: 12px;\n        border-top: 1px solid var(--divider-color);\n      }\n      \n      /* Do Not Disturb Status */\n      .vacuum-dnd-status {\n        margin-top: 12px;\n        padding: 12px;\n        border-radius: 8px;\n        border: 1px solid;\n        transition: all 0.2s ease;\n      }\n      .dnd-header {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        font-size: 13px;\n        font-weight: 500;\n      }\n      .dnd-header ha-icon {\n        --mdc-icon-size: 18px;\n      }\n      .dnd-times {\n        margin-top: 6px;\n        padding-left: 26px;\n        font-size: 12px;\n        opacity: 0.8;\n      }\n      \n      /* Volume Control */\n      .vacuum-volume {\n        margin-top: 12px;\n        padding: 12px;\n        background: var(--secondary-background-color);\n        border-radius: 8px;\n        border: 1px solid var(--divider-color);\n      }\n      .volume-header {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        font-size: 13px;\n        color: var(--primary-text-color);\n        margin-bottom: 8px;\n      }\n      .volume-header ha-icon {\n        --mdc-icon-size: 18px;\n        color: var(--primary-color);\n      }\n      .volume-bar {\n        height: 6px;\n        background: var(--divider-color);\n        border-radius: 3px;\n        overflow: hidden;\n      }\n      .volume-bar-fill {\n        height: 100%;\n        background: var(--primary-color);\n        border-radius: 3px;\n        transition: width 0.3s ease;\n      }\n      \n      .vacuum-controls {\n        display: flex;\n        justify-content: center;\n        gap: 12px;\n        margin-top: 0;\n        flex-wrap: wrap;\n      }\n      .vacuum-controls.grid {\n        display: grid;\n        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));\n        gap: 8px;\n      }\n      .vacuum-controls.compact {\n        gap: 16px;\n        justify-content: center;\n      }\n      .vacuum-control-btn {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        gap: 4px;\n        padding: 12px 16px;\n        background: var(--secondary-background-color);\n        border: 1px solid var(--divider-color);\n        border-radius: 12px;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        color: var(--primary-text-color);\n        min-width: 60px;\n      }\n      .vacuum-control-btn:hover:not(:disabled) {\n        background: var(--primary-color);\n        color: var(--text-primary-color, white);\n        border-color: var(--primary-color);\n      }\n      .vacuum-control-btn:disabled {\n        opacity: 0.5;\n        cursor: not-allowed;\n      }\n      .vacuum-control-btn.active {\n        background: var(--primary-color);\n        color: var(--text-primary-color, white);\n        border-color: var(--primary-color);\n      }\n      .vacuum-control-btn ha-icon {\n        font-size: 24px;\n      }\n      .vacuum-control-btn span {\n        font-size: 11px;\n        font-weight: 500;\n      }\n      /* Compact button - icon only, no background */\n      .vacuum-control-btn-compact {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        padding: 8px;\n        background: transparent;\n        border: none;\n        border-radius: 50%;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        color: var(--primary-text-color);\n        --mdc-icon-size: 24px;\n      }\n      .vacuum-control-btn-compact:hover:not(:disabled) {\n        background: color-mix(in srgb, currentColor 10%, transparent);\n      }\n      .vacuum-control-btn-compact:disabled {\n        opacity: 0.5;\n        cursor: not-allowed;\n      }\n      .layout-compact .vacuum-control-btn {\n        padding: 8px;\n        min-width: 44px;\n      }\n      .layout-compact .vacuum-control-btn span {\n        display: none;\n      }\n      \n      /* Fan Speed Row - single line with dropdown */\n      .vacuum-fan-speed-row {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        padding: 12px 16px;\n        background: var(--secondary-background-color);\n        border-radius: 12px;\n        margin-bottom: 0;\n        gap: 16px;\n        width: 100%;\n        box-sizing: border-box;\n      }\n      /* Speed Only - just the dropdown centered */\n      .vacuum-fan-speed-row.speed-only {\n        background: transparent;\n        padding: 8px 0;\n        justify-content: center;\n      }\n      /* Compact - centered with icon, no background */\n      .vacuum-fan-speed-row.compact {\n        background: transparent;\n        padding: 8px 0;\n        justify-content: center;\n        gap: 8px;\n      }\n      .vacuum-fan-speed-row.compact .fan-speed-select {\n        background: transparent;\n        border: 1px solid currentColor;\n        padding: 8px 28px 8px 12px;\n        font-size: 13px;\n        color: inherit;\n      }\n      .vacuum-fan-speed-row.compact .fan-speed-select.compact {\n        background: transparent;\n      }\n      .vacuum-fan-speed-row.compact .fan-speed-caret {\n        color: inherit;\n      }\n\n      /* Swipe carousel inside image area */\n      .vacuum-swipe-carousel {\n        overflow: hidden;\n        position: relative;\n        border-radius: 12px;\n        /* Helps mobile browsers allow horizontal swipe without scroll hijack */\n        touch-action: pan-y;\n        user-select: none;\n        cursor: grab;\n      }\n      .vacuum-swipe-carousel img {\n        -webkit-user-drag: none;\n        user-drag: none;\n      }\n      .vacuum-swipe-carousel.dragging {\n        cursor: grabbing;\n      }\n      .vacuum-swipe-track {\n        display: flex;\n        width: 200%;\n        height: 100%;\n        transition: transform 280ms ease;\n        will-change: transform;\n      }\n      .vacuum-swipe-page {\n        width: 50%;\n        height: 100%;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n      }\n      .fan-speed-left {\n        display: flex;\n        align-items: center;\n        gap: 10px;\n        font-size: 14px;\n        font-weight: 500;\n        color: var(--primary-text-color);\n        flex-shrink: 0;\n      }\n      .fan-speed-left ha-icon {\n        --mdc-icon-size: 20px;\n        color: var(--secondary-text-color);\n      }\n      .fan-speed-right {\n        display: flex;\n        align-items: center;\n        flex: 1;\n        justify-content: flex-end;\n      }\n      .fan-speed-select-wrapper {\n        position: relative;\n        display: inline-flex;\n        align-items: center;\n      }\n      .fan-speed-select {\n        padding: 10px 32px 10px 16px;\n        background: var(--primary-color);\n        color: var(--text-primary-color, white);\n        border: none;\n        border-radius: 8px;\n        font-size: 14px;\n        font-weight: 500;\n        cursor: pointer;\n        appearance: none;\n        -webkit-appearance: none;\n        min-width: 120px;\n        text-align: left;\n      }\n      .fan-speed-caret {\n        position: absolute;\n        right: 8px;\n        top: 50%;\n        transform: translateY(-50%);\n        pointer-events: none;\n        --mdc-icon-size: 18px;\n        color: var(--text-primary-color, white);\n        opacity: 0.9;\n      }\n      .fan-speed-select.compact + .fan-speed-caret {\n        color: inherit;\n      }\n      .fan-speed-select:hover {\n        opacity: 0.9;\n      }\n      .fan-speed-select:focus {\n        outline: 2px solid rgba(var(--rgb-primary-color), 0.5);\n        outline-offset: 2px;\n      }\n      .fan-speed-select option {\n        background: var(--card-background-color);\n        color: var(--primary-text-color);\n        padding: 8px 12px;\n      }\n      \n      /* Legacy styles - kept for backwards compatibility */\n      .vacuum-fan-speed {\n        display: flex;\n        flex-direction: column;\n        gap: 8px;\n        padding: 12px;\n        background: var(--secondary-background-color);\n        border-radius: 12px;\n      }\n      .fan-speed-label {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        font-size: 14px;\n        font-weight: 500;\n        color: var(--secondary-text-color);\n      }\n      .fan-speed-label ha-icon {\n        font-size: 18px;\n      }\n      .fan-speed-options {\n        display: flex;\n        gap: 8px;\n        flex-wrap: wrap;\n      }\n      .fan-speed-btn {\n        padding: 6px 12px;\n        background: var(--card-background-color);\n        border: 1px solid var(--divider-color);\n        border-radius: 16px;\n        font-size: 12px;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        color: var(--primary-text-color);\n      }\n      .fan-speed-btn:hover {\n        border-color: var(--primary-color);\n      }\n      .fan-speed-btn.active {\n        background: var(--primary-color);\n        color: var(--text-primary-color, white);\n        border-color: var(--primary-color);\n      }\n      \n      .vacuum-map-container {\n        position: relative;\n        margin-top: 16px;\n        overflow: hidden;\n        background: var(--secondary-background-color);\n      }\n      .vacuum-map-container.inline {\n        margin-top: 0;\n      }\n      .vacuum-map-image {\n        width: 100%;\n        height: 100%;\n        object-fit: contain;\n      }\n      .vacuum-map-empty {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        gap: 8px;\n        color: var(--secondary-text-color);\n      }\n      .vacuum-map-empty ha-icon {\n        font-size: 48px;\n        opacity: 0.5;\n      }\n      .map-close-btn {\n        position: absolute;\n        top: 8px;\n        right: 8px;\n        background: rgba(0, 0, 0, 0.5);\n        border: none;\n        border-radius: 50%;\n        width: 32px;\n        height: 32px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        cursor: pointer;\n        color: white;\n        transition: background 0.2s ease;\n      }\n      .map-close-btn:hover {\n        background: rgba(0, 0, 0, 0.7);\n      }\n      \n      /* Pagination Dots for Swipe Mode */\n      .vacuum-pagination-dots {\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        gap: 8px;\n        margin-top: 2px;\n        padding: 4px 0 0 0;\n      }\n      .vacuum-dot {\n        width: 8px;\n        height: 8px;\n        border-radius: 50%;\n        background: var(--divider-color, rgba(255, 255, 255, 0.3));\n        cursor: pointer;\n        transition: all 0.3s ease;\n      }\n      .vacuum-dot:hover {\n        background: var(--secondary-text-color);\n        transform: scale(1.2);\n      }\n      .vacuum-dot.active {\n        background: var(--primary-color);\n        width: 24px;\n        border-radius: 4px;\n      }\n      \n      /* SVG Brush Animations */\n      @keyframes brush-spin {\n        from { transform: rotate(0deg); }\n        to { transform: rotate(360deg); }\n      }\n      @keyframes brush-spin-reverse {\n        from { transform: rotate(360deg); }\n        to { transform: rotate(0deg); }\n      }\n      @keyframes roller-move {\n        0% { transform: translateX(0); }\n        100% { transform: translateX(7px); }\n      }\n      @keyframes sensor-blink {\n        0%, 100% { opacity: 1; }\n        50% { opacity: 0.3; }\n      }\n      @keyframes status-led-pulse {\n        0%, 100% { opacity: 1; filter: drop-shadow(0 0 2px currentColor); }\n        50% { opacity: 0.6; filter: drop-shadow(0 0 6px currentColor); }\n      }\n      \n      /* SVG Animation Classes */\n      .vacuum-side-brush-left {\n        transform-origin: 30px 85px;\n      }\n      .vacuum-side-brush-right {\n        transform-origin: 70px 85px;\n      }\n      \n      /* Ensure bristle lines are always visible */\n      .vacuum-side-brush-left line,\n      .vacuum-side-brush-right line {\n        vector-effect: non-scaling-stroke;\n      }\n      .vacuum-brush-spin {\n        animation: brush-spin 1.2s linear infinite;\n      }\n      .vacuum-brush-spin-reverse {\n        animation: brush-spin-reverse 1.2s linear infinite;\n      }\n      \n      /* Dock LED animation - slow blink when docked/charging */\n      .vacuum-dock-led {\n        animation: dock-led-blink 2s ease-in-out infinite;\n      }\n      @keyframes dock-led-blink {\n        0%, 100% { opacity: 1; filter: drop-shadow(0 0 6px currentColor); }\n        50% { opacity: 0.3; filter: none; }\n      }\n      \n      /* Dock arc charging pulse */\n      .vacuum-dock-arc-pulse {\n        animation: dock-arc-pulse 2s ease-in-out infinite;\n      }\n      @keyframes dock-arc-pulse {\n        0%, 100% { \n          /* Low point: no glow */\n          filter: none;\n        }\n        50% { \n          /* High point: use the previous "low" glow size */\n          filter: drop-shadow(0 0 1px currentColor) drop-shadow(0 0 4px currentColor);\n        }\n      }\n      \n      /* Charging LED on robot when docked */\n      .vacuum-charging-led {\n        animation: charging-led-pulse 3s ease-in-out infinite;\n      }\n      @keyframes charging-led-pulse {\n        0%, 100% { opacity: 1; }\n        50% { opacity: 0.4; }\n      }\n      \n      /* Prevent clipping on brushes */\n      .vacuum-svg-container {\n        overflow: visible;\n      }\n      .vacuum-roller-animate line {\n        animation: roller-move 0.3s linear infinite;\n      }\n      .vacuum-sensor-blink {\n        animation: sensor-blink 1s ease-in-out infinite;\n      }\n      .vacuum-status-led {\n        animation: status-led-pulse 1.5s ease-in-out infinite;\n      }\n      \n      /* Container Animations */\n      @keyframes vacuum-spin {\n        from { transform: rotate(0deg); }\n        to { transform: rotate(360deg); }\n      }\n      @keyframes vacuum-spin-slow {\n        from { transform: rotate(0deg); }\n        to { transform: rotate(360deg); }\n      }\n      @keyframes vacuum-spin-fast {\n        from { transform: rotate(0deg); }\n        to { transform: rotate(360deg); }\n      }\n      @keyframes vacuum-pulse {\n        0%, 100% { transform: scale(1); opacity: 1; }\n        50% { transform: scale(1.05); opacity: 0.8; }\n      }\n      @keyframes vacuum-rotate {\n        0% { transform: rotate(-15deg); }\n        50% { transform: rotate(15deg); }\n        100% { transform: rotate(-15deg); }\n      }\n      @keyframes vacuum-bounce {\n        0%, 100% { transform: translateY(0); }\n        50% { transform: translateY(-10px); }\n      }\n      @keyframes vacuum-slide {\n        0%, 100% { transform: translateX(0); }\n        50% { transform: translateX(-5px); }\n      }\n      @keyframes vacuum-blink {\n        0%, 100% { opacity: 1; }\n        50% { opacity: 0.3; }\n      }\n      @keyframes vacuum-glow {\n        0%, 100% { filter: drop-shadow(0 0 4px var(--primary-color)); }\n        50% { filter: drop-shadow(0 0 12px var(--primary-color)); }\n      }\n      @keyframes vacuum-breathe {\n        0%, 100% { transform: scale(1); }\n        50% { transform: scale(1.02); }\n      }\n      \n      /* Vacuum cleaning movement - random left-right wobbling */\n      @keyframes vacuum-cleaning-move {\n        0% { transform: rotate(0deg); }\n        8% { transform: rotate(-15deg); }\n        16% { transform: rotate(-12deg); }\n        24% { transform: rotate(18deg); }\n        32% { transform: rotate(14deg); }\n        40% { transform: rotate(-20deg); }\n        48% { transform: rotate(-16deg); }\n        56% { transform: rotate(22deg); }\n        64% { transform: rotate(16deg); }\n        72% { transform: rotate(-18deg); }\n        80% { transform: rotate(-10deg); }\n        88% { transform: rotate(12deg); }\n        96% { transform: rotate(5deg); }\n        100% { transform: rotate(0deg); }\n      }\n      .vacuum-svg-active {\n        animation: vacuum-cleaning-move 7s ease-in-out infinite;\n      }\n      \n      .vacuum-anim-spin { animation: vacuum-spin 2s linear infinite; }\n      .vacuum-anim-spin-slow { animation: vacuum-spin-slow 4s linear infinite; }\n      .vacuum-anim-spin-fast { animation: vacuum-spin-fast 1s linear infinite; }\n      .vacuum-anim-pulse { animation: vacuum-pulse 1.5s ease-in-out infinite; }\n      .vacuum-anim-pulse-slow { animation: vacuum-pulse 3s ease-in-out infinite; }\n      .vacuum-anim-pulse-fast { animation: vacuum-pulse 0.8s ease-in-out infinite; }\n      .vacuum-anim-rotate { animation: vacuum-rotate 2s ease-in-out infinite; }\n      .vacuum-anim-rotate-slow { animation: vacuum-rotate 4s ease-in-out infinite; }\n      .vacuum-anim-rotate-fast { animation: vacuum-rotate 1s ease-in-out infinite; }\n      .vacuum-anim-bounce { animation: vacuum-bounce 1s ease-in-out infinite; }\n      .vacuum-anim-bounce-slow { animation: vacuum-bounce 2s ease-in-out infinite; }\n      .vacuum-anim-bounce-fast { animation: vacuum-bounce 0.5s ease-in-out infinite; }\n      .vacuum-anim-slide { animation: vacuum-slide 1.5s ease-in-out infinite; }\n      .vacuum-anim-slide-slow { animation: vacuum-slide 3s ease-in-out infinite; }\n      .vacuum-anim-slide-fast { animation: vacuum-slide 0.8s ease-in-out infinite; }\n      .vacuum-anim-blink { animation: vacuum-blink 1s ease-in-out infinite; }\n      .vacuum-anim-blink-slow { animation: vacuum-blink 2s ease-in-out infinite; }\n      .vacuum-anim-blink-fast { animation: vacuum-blink 0.5s ease-in-out infinite; }\n      .vacuum-anim-glow { animation: vacuum-glow 2s ease-in-out infinite; }\n      .vacuum-anim-glow-slow { animation: vacuum-glow 4s ease-in-out infinite; }\n      .vacuum-anim-glow-fast { animation: vacuum-glow 1s ease-in-out infinite; }\n      .vacuum-anim-breathe { animation: vacuum-breathe 3s ease-in-out infinite; }\n      .vacuum-anim-breathe-slow { animation: vacuum-breathe 5s ease-in-out infinite; }\n      .vacuum-anim-breathe-fast { animation: vacuum-breathe 1.5s ease-in-out infinite; }\n      \n      /* Double column layout */\n      .vacuum-double-column-layout {\n        display: grid;\n        grid-template-columns: 1fr 1fr;\n        gap: 16px;\n        width: 100%;\n      }\n      \n      .vacuum-double-column-layout .vacuum-column-left,\n      .vacuum-double-column-layout .vacuum-column-right {\n        display: flex;\n        flex-direction: column;\n        gap: 12px;\n        min-width: 0;\n      }\n      \n      /* Make certain sections span full width in double column */\n      .vacuum-double-column-layout .vacuum-icon-container,\n      .vacuum-double-column-layout .vacuum-header,\n      .vacuum-double-column-layout .vacuum-swipe-carousel {\n        /* These look better spanning the column */\n      }\n      \n      /* Responsive: stack columns on small screens */\n      @media (max-width: 400px) {\n        .vacuum-double-column-layout {\n          grid-template-columns: 1fr;\n        }\n      }\n      \n      /* Sections-based layout styles */\n      .vacuum-sections-layout {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: 12px;\n        text-align: center;\n      }\n      \n      .vacuum-sections-layout .vacuum-icon-container {\n        margin: 0;\n      }\n      \n      .vacuum-sections-layout .vacuum-header {\n        width: 100%;\n      }\n      \n      .vacuum-sections-layout .vacuum-battery {\n        justify-content: center;\n        margin-top: 8px;\n      }\n      \n      .vacuum-sections-layout .vacuum-current-room {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        gap: 8px;\n        font-size: 14px;\n        color: var(--secondary-text-color);\n        margin-top: 4px;\n      }\n      \n      .vacuum-sections-layout .vacuum-current-room ha-icon {\n        --mdc-icon-size: 18px;\n      }\n      \n      .vacuum-sections-layout .vacuum-controls {\n        width: 100%;\n        justify-content: center;\n      }\n      \n      .vacuum-sections-layout .vacuum-error-banner {\n        width: 100%;\n        background: rgba(var(--rgb-error-color, 244, 67, 54), 0.1);\n        border: 1px solid var(--error-color, #f44336);\n        border-radius: 8px;\n        padding: 8px 12px;\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        color: var(--error-color, #f44336);\n      }\n      \n      .vacuum-sections-layout .vacuum-error-banner ha-icon {\n        --mdc-icon-size: 20px;\n      }\n      \n      .vacuum-sections-layout .vacuum-component-wear {\n        width: 100%;\n        display: flex;\n        flex-direction: column;\n        gap: 12px;\n        text-align: left;\n      }\n      \n      .vacuum-sections-layout .wear-item {\n        background: rgba(var(--rgb-primary-color), 0.05);\n        padding: 8px 12px;\n        border-radius: 8px;\n      }\n      \n      .vacuum-sections-layout .wear-header {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        margin-bottom: 6px;\n      }\n      \n      .vacuum-sections-layout .wear-header ha-icon {\n        --mdc-icon-size: 18px;\n        color: var(--primary-color);\n      }\n      \n      .vacuum-sections-layout .wear-label {\n        flex: 1;\n        font-size: 13px;\n        color: var(--primary-text-color);\n      }\n      \n      .vacuum-sections-layout .wear-value {\n        font-size: 13px;\n        font-weight: 500;\n        color: var(--primary-text-color);\n      }\n      \n      .vacuum-sections-layout .wear-bar {\n        height: 6px;\n        background: var(--divider-color, rgba(0,0,0,0.1));\n        border-radius: 3px;\n        overflow: hidden;\n      }\n      \n      .vacuum-sections-layout .wear-progress {\n        height: 100%;\n        border-radius: 3px;\n        transition: width 0.3s ease;\n      }\n      \n      /* Compact sections layout */\n      .vacuum-compact.vacuum-sections-layout {\n        flex-direction: row;\n        flex-wrap: wrap;\n        gap: 12px;\n        text-align: left;\n      }\n      \n      .vacuum-compact.vacuum-sections-layout .vacuum-icon-container {\n        margin: 0;\n        flex: 0 0 auto;\n      }\n      \n      .vacuum-compact.vacuum-sections-layout .vacuum-header {\n        flex: 1;\n        min-width: 0;\n        align-items: flex-start;\n      }\n      \n      .vacuum-compact.vacuum-sections-layout .vacuum-controls {\n        width: auto;\n        flex: 0 0 auto;\n      }\n    '}}s.VACUUM_SECTIONS={vacuum_image:{id:"vacuum_image",icon:"mdi:robot-vacuum",label:"Vacuum Image",required:!1,defaultEnabled:!0,description:"Animated robot vacuum icon/image",hasEntityOverride:!1},title_status:{id:"title_status",icon:"mdi:format-title",label:"Title & Status",required:!1,defaultEnabled:!0,description:"Vacuum name and current status",hasEntityOverride:!1},battery:{id:"battery",icon:"mdi:battery",label:"Battery Level",required:!1,defaultEnabled:!1,description:"Battery percentage with icon",hasEntityOverride:!0},current_room:{id:"current_room",icon:"mdi:home-floor-1",label:"Current Room",required:!1,defaultEnabled:!1,description:"Room currently being cleaned",hasEntityOverride:!0},fan_speed:{id:"fan_speed",icon:"mdi:fan",label:"Speed",required:!1,defaultEnabled:!0,description:"Fan speed control dropdown",hasEntityOverride:!1},current_stats:{id:"current_stats",icon:"mdi:chart-line",label:"Current Session Stats",required:!1,defaultEnabled:!1,description:"Current session time and area",hasEntityOverride:!0},last_clean:{id:"last_clean",icon:"mdi:history",label:"Last Cleaning",required:!1,defaultEnabled:!1,description:"Last cleaning start/end times",hasEntityOverride:!0},total_stats:{id:"total_stats",icon:"mdi:chart-bar",label:"Lifetime Statistics",required:!1,defaultEnabled:!1,description:"Total area, time, and clean count",hasEntityOverride:!0},component_life:{id:"component_life",icon:"mdi:cog-refresh",label:"Component Life",required:!1,defaultEnabled:!1,description:"Filter, brush, and sensor wear",hasEntityOverride:!0},errors:{id:"errors",icon:"mdi:alert-circle",label:"Errors",required:!1,defaultEnabled:!1,description:"Vacuum and dock error display",hasEntityOverride:!0},dnd:{id:"dnd",icon:"mdi:bell-off",label:"Do Not Disturb",required:!1,defaultEnabled:!1,description:"DND mode status and toggle",hasEntityOverride:!0},volume:{id:"volume",icon:"mdi:volume-high",label:"Volume Control",required:!1,defaultEnabled:!1,description:"Speaker volume slider",hasEntityOverride:!0},quick_controls:{id:"quick_controls",icon:"mdi:play-pause",label:"Quick Controls",required:!1,defaultEnabled:!0,description:"Start, pause, stop, dock buttons",hasEntityOverride:!1},map:{id:"map",icon:"mdi:map",label:"Map Display",required:!1,defaultEnabled:!1,description:"Floor map with vacuum position",hasEntityOverride:!0}},s.DEFAULT_SECTION_ORDER=["vacuum_image","title_status","fan_speed","quick_controls"]}}]);