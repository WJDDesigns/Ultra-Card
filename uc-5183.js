"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[5183],{571:(e,t,i)=>{i.d(t,{s:()=>o});class o{static getEntityIcon(e,t){if("object"==typeof e&&null!==e&&!Array.isArray(e)){if(null==t?void 0:t.states)for(const[i,o]of Object.entries(t.states))if(o===e){e=i;break}if("string"!=typeof e)return this._getEnhancedIconForEntity("unknown",e)}if(!e||!(null==t?void 0:t.states[e]))return null;const i=t.states[e];return this._getHomeAssistantComputedIcon(e,i,t)||this._getEnhancedIconForEntity(e,i)}static _getHomeAssistantComputedIcon(e,t,i){var o,a,n,r,l;if(null===(o=t.attributes)||void 0===o?void 0:o.icon)return t.attributes.icon;try{if(null===(n=null===(a=window.customCards)||void 0===a?void 0:a.helpers)||void 0===n?void 0:n.stateIcon){const e=window.customCards.helpers.stateIcon(t);if(e)return e}const o=[window.stateIcon,window.computeStateIcon,window.computeEntityIcon,null===(r=window.hassIcons)||void 0===r?void 0:r.stateIcon,null===(l=window.hassIcons)||void 0===l?void 0:l.computeStateIcon,i.stateIcon,i.computeStateIcon,i.computeEntityIcon];for(const e of o)if("function"==typeof e)try{const i=e(t);if(i)return i}catch(e){}if(i.entities&&i.entities[e]){const t=i.entities[e];if(t.icon)return t.icon}if(e.startsWith("weather.")){const e={"clear-night":"mdi:weather-night",cloudy:"mdi:weather-cloudy",fog:"mdi:weather-fog",hail:"mdi:weather-hail",lightning:"mdi:weather-lightning","lightning-rainy":"mdi:weather-lightning-rainy",partlycloudy:"mdi:weather-partly-cloudy",pouring:"mdi:weather-pouring",rainy:"mdi:weather-rainy",snowy:"mdi:weather-snowy","snowy-rainy":"mdi:weather-snowy-rainy",sunny:"mdi:weather-sunny",windy:"mdi:weather-windy","windy-variant":"mdi:weather-windy-variant",exceptional:"mdi:weather-exceptional"},i=t.state;if(e[i])return e[i]}}catch(e){console.debug("Failed to compute HA icon, falling back to enhanced detection:",e)}return null}static _getEnhancedIconForEntity(e,t){var i,o,a;const n=e.split(".")[0],r=e.split(".")[1]||"",l=null===(i=t.attributes)||void 0===i?void 0:i.device_class,s=null===(o=t.attributes)||void 0===o?void 0:o.unit_of_measurement,d=(null===(a=t.attributes)||void 0===a?void 0:a.friendly_name)||"",c=t.state,u=r.toLowerCase(),p=d.toLowerCase();return this._isBatteryRelated(u,p,l,s)?this._isChargingRelated(u,p)?this._getChargingBatteryIcon(c,s):this._getBatteryIcon(c,s):this._isTemperatureRelated(u,p,l,s)?"mdi:thermometer":this._isHumidityRelated(u,p,l,s)?"mdi:water-percent":this._isPowerRelated(u,p,l,s)?"mdi:flash":this._isSignalRelated(u,p)?"mdi:wifi":"binary_sensor"===n&&this._isDoorWindowRelated(u,p)?"on"===c?"mdi:door-open":"mdi:door-closed":"binary_sensor"===n&&this._isMotionRelated(u,p)?"on"===c?"mdi:motion-sensor":"mdi:motion-sensor-off":this._isIlluminanceRelated(u,p,l,s)?"mdi:brightness-5":this._isPressureRelated(u,p,l,s)?"mdi:gauge":this._getDefaultIconForDomain(n,l,c)}static _isBatteryRelated(e,t,i,o){return"battery"===i||e.includes("battery")||e.includes("charge")||e.includes("power_level")||t.includes("battery")||t.includes("charge")||"%"===o}static _isChargingRelated(e,t){return["charging","charge_target","charging_target","charge_limit"].some((i=>e.includes(i)||t.toLowerCase().includes(i)))}static _getBatteryIcon(e,t){const i=parseFloat(e);return isNaN(i)?"mdi:battery-unknown":i>=95?"mdi:battery":i>=85?"mdi:battery-90":i>=75?"mdi:battery-80":i>=65?"mdi:battery-70":i>=55?"mdi:battery-60":i>=45?"mdi:battery-50":i>=35?"mdi:battery-40":i>=25?"mdi:battery-30":i>=15?"mdi:battery-20":i>=5?"mdi:battery-10":"mdi:battery-alert"}static _getChargingBatteryIcon(e,t){const i=parseFloat(e);return isNaN(i)?"mdi:battery-charging":i>=95?"mdi:battery-charging-100":i>=85?"mdi:battery-charging-90":i>=75?"mdi:battery-charging-80":i>=65?"mdi:battery-charging-70":i>=55?"mdi:battery-charging-60":i>=45?"mdi:battery-charging-50":i>=35?"mdi:battery-charging-40":i>=25?"mdi:battery-charging-30":i>=15?"mdi:battery-charging-20":i>=5?"mdi:battery-charging-10":"mdi:battery-charging-outline"}static _isTemperatureRelated(e,t,i,o){return"temperature"===i||e.includes("temp")||t.includes("temperature")||"°C"===o||"°F"===o||"K"===o}static _isHumidityRelated(e,t,i,o){return"humidity"===i||e.includes("humidity")||t.includes("humidity")||"%"===o&&(e.includes("humid")||t.includes("humid"))}static _isPowerRelated(e,t,i,o){return"power"===i||"energy"===i||e.includes("power")||e.includes("energy")||e.includes("consumption")||"W"===o||"kW"===o||"kWh"===o||"Wh"===o}static _isSignalRelated(e,t){return["signal","rssi","wifi","network"].some((i=>e.includes(i)||t.toLowerCase().includes(i)))}static _isDoorWindowRelated(e,t){return["door","window","gate"].some((i=>e.includes(i)||t.toLowerCase().includes(i)))}static _isMotionRelated(e,t){return["motion","movement","occupancy","presence"].some((i=>e.includes(i)||t.toLowerCase().includes(i)))}static _isIlluminanceRelated(e,t,i,o){return"illuminance"===i||e.includes("illuminance")||e.includes("brightness")||e.includes("lux")||"lx"===o||"lux"===o}static _isPressureRelated(e,t,i,o){return"pressure"===i||e.includes("pressure")||t.includes("pressure")||"hPa"===o||"mbar"===o||"Pa"===o||"psi"===o}static _getDefaultIconForDomain(e,t,i){return{alarm_control_panel:"mdi:shield",automation:"mdi:robot",binary_sensor:"mdi:radiobox-blank",button:"mdi:button-pointer",calendar:"mdi:calendar",camera:"mdi:video",climate:"mdi:thermostat",cover:"mdi:window-shutter",device_tracker:"mdi:account",fan:"mdi:fan",group:"mdi:google-circles-communities",humidifier:"mdi:air-humidifier",input_boolean:"mdi:toggle-switch",input_button:"mdi:button-pointer",input_datetime:"mdi:calendar-clock",input_number:"mdi:ray-vertex",input_select:"mdi:format-list-bulleted",input_text:"mdi:form-textbox",light:"mdi:lightbulb",lock:"mdi:lock",media_player:"mdi:speaker",number:"mdi:ray-vertex",person:"mdi:account",plant:"mdi:flower",remote:"mdi:remote",scene:"mdi:palette",script:"mdi:script-text",select:"mdi:format-list-bulleted",sensor:"mdi:eye",siren:"mdi:bullhorn",sun:"mdi:white-balance-sunny",switch:"mdi:toggle-switch",timer:"mdi:timer",vacuum:"mdi:robot-vacuum",water_heater:"mdi:thermometer",weather:"mdi:weather-partly-cloudy",zone:"mdi:map-marker"}[e]||"mdi:eye"}}},7564:(e,t,i)=>{i.r(t),i.d(t,{UltraSliderControlModule:()=>l});var o=i(5183),a=i(7475),n=i(8869),r=i(571);class l extends a.m{constructor(){super(...arguments),this.metadata={type:"slider_control",title:"Slider Control",description:"Interactive slider for controlling entity values",author:"WJD Designs",version:"1.0.0",icon:"mdi:tune-vertical",category:"interactive",tags:["slider","control","light","cover","fan","interactive","entity"]},this.dragState=new Map,this.expandedBars=new Set,this._dragFromHandle=!1,this.interactingBars=new Set,this.localSliderValues=new Map,this.sliderCooldowns=new Map,this.sliderTransitions=new Map}requestUpdate(){}cleanup(){this.sliderCooldowns.forEach((e=>{clearTimeout(e)})),this.sliderCooldowns.clear(),this.sliderTransitions.forEach((e=>{clearInterval(e)})),this.sliderTransitions.clear(),this.localSliderValues.clear(),this.interactingBars.clear()}createDefault(e,t){const i=[];if(null==t?void 0:t.states){const e=Object.keys(t.states),o=e.find((e=>e.startsWith("light."))),a=e.find((e=>e.startsWith("cover."))),n=e.find((e=>e.startsWith("fan."))),r=e.find((e=>e.startsWith("input_number."))),l=e.find((e=>e.startsWith("number.")));if(o||a||n||r||l)if(o){const e=t.states[o];e&&(i.push({id:this.generateId("brightness"),type:"brightness",entity:o,min_value:0,max_value:100,step:1,slider_style:"flat",show_icon:!0,show_name:!0,show_value:!0,icon_position:"left",name_position:"left",value_position:"right",info_section_position:"left",outside_text_position:"left",outside_name_position:"top_left",outside_value_position:"bottom_left",invert_direction:!1}),e.attributes.rgb_color&&i.push({id:this.generateId("rgb"),type:"rgb",entity:o,min_value:0,max_value:100,step:1,slider_style:"flat",show_icon:!0,show_name:!0,show_value:!0,icon_position:"left",name_position:"left",value_position:"right",info_section_position:"left",outside_text_position:"left",outside_name_position:"top_left",outside_value_position:"bottom_left",invert_direction:!1}),e.attributes.color_temp&&i.push({id:this.generateId("color_temp"),type:"color_temp",entity:o,min_value:0,max_value:100,step:1,slider_style:"flat",show_icon:!0,show_name:!0,show_value:!0,icon_position:"left",name_position:"left",value_position:"right",info_section_position:"left",outside_text_position:"left",outside_name_position:"top_left",outside_value_position:"bottom_left",invert_direction:!1}))}else if(a)i.push({id:this.generateId("cover"),type:"numeric",entity:a,min_value:0,max_value:100,step:1,show_icon:!0,show_name:!0,show_value:!0,icon_position:"left",name_position:"left",value_position:"right",info_section_position:"left",outside_text_position:"left",outside_name_position:"top_left",outside_value_position:"bottom_left",invert_direction:!1});else if(n)i.push({id:this.generateId("fan"),type:"numeric",entity:n,min_value:0,max_value:100,step:1,show_icon:!0,show_name:!0,show_value:!0,icon_position:"left",name_position:"left",value_position:"right",info_section_position:"left",outside_text_position:"left",outside_name_position:"top_left",outside_value_position:"bottom_left",invert_direction:!1});else if(r){const e=t.states[r];i.push({id:this.generateId("input_number"),type:"numeric",entity:r,min_value:(null==e?void 0:e.attributes.min)||0,max_value:(null==e?void 0:e.attributes.max)||100,step:(null==e?void 0:e.attributes.step)||1,show_icon:!0,show_name:!0,show_value:!0,icon_position:"left",name_position:"left",value_position:"right",info_section_position:"left",outside_text_position:"left",outside_name_position:"top_left",outside_value_position:"bottom_left",invert_direction:!1})}}return{id:e||this.generateId("slider_control"),type:"slider_control",bars:i,orientation:"horizontal",layout_mode:"overlay",outside_text_position:"left",outside_name_position:"top_left",outside_value_position:"bottom_left",split_bar_position:"left",split_info_position:"right",split_bar_length:60,slider_style:"flat",slider_height:55,bar_spacing:8,slider_radius:"round",border_radius:10,slider_track_color:"",slider_fill_color:"var(--primary-color)",dynamic_fill_color:!1,glass_blur_amount:8,use_gradient:!1,gradient_stops:[],show_icon:!0,dynamic_icon:!0,icon_as_toggle:!0,icon_size:24,icon_color:"var(--primary-text-color)",auto_contrast:!0,show_name:!0,name_size:14,name_color:"var(--primary-text-color)",name_bold:!0,show_state:!1,state_size:12,state_color:"var(--secondary-text-color)",state_bold:!1,show_value:!0,value_size:14,value_color:"var(--primary-text-color)",value_suffix:"%",show_bar_label:!1,show_toggle:!1,toggle_position:"right",toggle_size:28,toggle_color_on:"var(--primary-color)",toggle_color_off:"rgba(var(--rgb-primary-text-color), 0.3)",show_color_picker:!1,color_picker_position:"below",color_picker_size:"medium",animate_on_change:!0,transition_duration:200,haptic_feedback:!0,invert_direction:!1,tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},enable_hover_effect:!1,display_mode:"always",display_conditions:[]}}migrateFromLegacy(e,t){var i;const o=e;if(o.entity&&(!o.bars||0===o.bars.length)){const e=[];if(null===(i=null==t?void 0:t.states)||void 0===i?void 0:i[o.entity])if("light"===o.entity.split(".")[0]){const t=o.light_control_mode||"brightness";"brightness"!==t&&"both"!==t&&"all"!==t||e.push({id:this.generateId("brightness"),type:"brightness",entity:o.entity,name:o.name,min_value:o.min_value,max_value:o.max_value,step:o.step,slider_style:o.slider_style,slider_height:o.slider_height,slider_track_color:o.slider_track_color,slider_fill_color:o.slider_fill_color,dynamic_fill_color:o.dynamic_fill_color,show_icon:o.show_icon,show_name:o.show_name,show_value:o.show_value,icon:o.icon,icon_size:o.icon_size,icon_color:o.icon_color,dynamic_icon:o.dynamic_icon,icon_as_toggle:o.icon_as_toggle,name_size:o.name_size,name_color:o.name_color,name_bold:o.name_bold,value_size:o.value_size,value_color:o.value_color,value_suffix:o.value_suffix,auto_contrast:o.auto_contrast}),"rgb"!==t&&"both"!==t&&"all"!==t||e.push({id:this.generateId("rgb"),type:"rgb",entity:o.entity,min_value:o.min_value,max_value:o.max_value,step:o.step,slider_style:o.slider_style,slider_height:o.slider_height,slider_track_color:o.slider_track_color,slider_fill_color:o.slider_fill_color,dynamic_fill_color:o.dynamic_fill_color,show_icon:o.show_icon,show_name:o.show_name,show_value:o.show_value,icon:o.icon,icon_size:o.icon_size,icon_color:o.icon_color,dynamic_icon:o.dynamic_icon,icon_as_toggle:o.icon_as_toggle,name_size:o.name_size,name_color:o.name_color,name_bold:o.name_bold,value_size:o.value_size,value_color:o.value_color,value_suffix:o.value_suffix,auto_contrast:o.auto_contrast}),"color_temp"!==t&&"all"!==t||e.push({id:this.generateId("color_temp"),type:"color_temp",entity:o.entity,min_value:o.min_value,max_value:o.max_value,step:o.step,slider_style:o.slider_style,slider_height:o.slider_height,slider_track_color:o.slider_track_color,slider_fill_color:o.slider_fill_color,dynamic_fill_color:o.dynamic_fill_color,show_icon:o.show_icon,show_name:o.show_name,show_value:o.show_value,icon:o.icon,icon_size:o.icon_size,icon_color:o.icon_color,dynamic_icon:o.dynamic_icon,icon_as_toggle:o.icon_as_toggle,name_size:o.name_size,name_color:o.name_color,name_bold:o.name_bold,value_size:o.value_size,value_color:o.value_color,value_suffix:o.value_suffix,auto_contrast:o.auto_contrast})}else e.push({id:this.generateId("numeric"),type:"numeric",entity:o.entity,name:o.name,min_value:o.min_value,max_value:o.max_value,step:o.step,slider_style:o.slider_style,slider_height:o.slider_height,slider_track_color:o.slider_track_color,slider_fill_color:o.slider_fill_color,dynamic_fill_color:o.dynamic_fill_color,show_icon:o.show_icon,show_name:o.show_name,show_value:o.show_value,icon:o.icon,icon_size:o.icon_size,icon_color:o.icon_color,dynamic_icon:o.dynamic_icon,icon_as_toggle:o.icon_as_toggle,name_size:o.name_size,name_color:o.name_color,name_bold:o.name_bold,value_size:o.value_size,value_color:o.value_color,value_suffix:o.value_suffix,auto_contrast:o.auto_contrast});return Object.assign(Object.assign({},o),{bars:e,entity:o.entity,name:o.name,min_value:o.min_value,max_value:o.max_value,step:o.step,light_control_mode:o.light_control_mode})}return o}_addBar(e,t){return{id:this.generateId("bar"),type:e||"numeric",entity:t||"",min_value:0,max_value:100,step:1,show_icon:!0,show_name:!0,show_value:!0,icon_position:"left",name_position:"left",value_position:"right",info_section_position:"left",outside_text_position:"left",outside_name_position:"top_left",outside_value_position:"bottom_left",overlay_name_position:"top",overlay_value_position:"middle",overlay_icon_position:"bottom",content_position:"left",slider_style:"flat",dynamic_icon:!0,icon_as_toggle:!0,name_bold:!0,auto_contrast:!0,invert_direction:!1}}_deleteBar(e,t){return t.filter((t=>t.id!==e))}_duplicateBar(e){return Object.assign(Object.assign({},e),{id:this.generateId("bar"),name:e.name?`${e.name} (Copy)`:void 0})}_reorderBars(e,t,i){const o=[...e],[a]=o.splice(t,1);return o.splice(i,0,a),o}_detectBarType(e,t){var i;if(!e||!(null===(i=null==t?void 0:t.states)||void 0===i?void 0:i[e]))return"numeric";const o=t.states[e],a=e.split(".")[0];return o.attributes.rgb_color?"rgb":o.attributes.color_temp?"color_temp":"light"===a&&void 0!==o.attributes.brightness?"brightness":"numeric"}_getBarGradient(e,t,i="horizontal"){const o="vertical"===i?"0deg":"90deg";switch(e.type){case"rgb":return"vertical"===i?"linear-gradient(0deg, rgb(255, 0, 0) 0%, rgb(255, 255, 0) 16.67%, rgb(0, 255, 0) 33.33%, rgb(0, 255, 255) 50%, rgb(0, 0, 255) 66.67%, rgb(255, 0, 255) 83.33%, rgb(255, 0, 0) 100%)":"linear-gradient(90deg, rgb(255, 0, 0) 0%, rgb(255, 255, 0) 16.67%, rgb(0, 255, 0) 33.33%, rgb(0, 255, 255) 50%, rgb(0, 0, 255) 66.67%, rgb(255, 0, 255) 83.33%, rgb(255, 0, 0) 100%)";case"color_temp":return`linear-gradient(${o}, rgb(255, 147, 41) 0%, rgb(255, 180, 112) 10%, rgb(255, 220, 177) 20%, rgb(255, 246, 213) 30%, rgb(255, 255, 255) 50%, rgb(230, 240, 255) 70%, rgb(208, 232, 255) 80%, rgb(169, 200, 255) 90%, rgb(130, 170, 255) 100%)`;case"red":return"rgb(255, 0, 0)";case"green":return"rgb(0, 255, 0)";case"blue":return"rgb(0, 0, 255)";default:return"var(--primary-color)"}}renderGeneralTab(e,t,i,a){var n;const r=e,l=(null===(n=null==t?void 0:t.locale)||void 0===n||n.language,r.layout_mode||"outside");if(r.entity&&(!r.bars||0===r.bars.length)){const e=this.migrateFromLegacy(r,t);return a(e),o.qy`<div style="padding: 20px; text-align: center; color: var(--primary-color);">
        <ha-icon icon="mdi:refresh" style="font-size: 48px; margin-bottom: 12px;"></ha-icon>
        <div>Migrating to new multi-bar format...</div>
      </div>`}return o.qy`
      <div class="slider-control-general-tab">
        ${this.injectUcFormStyles()}
        <style>
          .slider-control-general-tab {
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 24px;
          }
          .settings-section {
            background: var(--secondary-background-color);
            border-radius: 8px;
            padding: 16px;
          }
          .settings-section.layout-settings {
            order: 1;
          }
          .settings-section.slider-style {
            order: 2;
          }
          .settings-section.bars-configuration {
            order: 3;
          }
          .section-title {
            font-size: 18px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--primary-color);
            margin-bottom: 16px;
            letter-spacing: 0.5px;
          }
          .field-container {
            margin-bottom: 16px;
          }
          .field-title {
            font-size: ${r.name_size||16}px;
            font-weight: 600;
            margin-bottom: 4px;
            color: var(--primary-text-color);
          }
          .field-description {
            font-size: 13px;
            color: var(--secondary-text-color);
            margin-bottom: 12px;
            opacity: 0.8;
            line-height: 1.4;
          }
          .conditional-fields-group {
            margin-top: 16px;
            border-left: 4px solid var(--primary-color);
            background: rgba(var(--rgb-primary-color), 0.08);
            border-radius: 0 8px 8px 0;
            padding: 16px;
          }
          .bar-item {
            background: var(--card-background-color);
            border-radius: 8px;
            border: 1px solid var(--divider-color);
            margin-bottom: 12px;
            overflow: hidden;
          }
          .bar-header {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .bar-header:hover {
            background: var(--secondary-background-color);
          }
          .bar-header.expanded {
            background: var(--secondary-background-color);
            border-bottom: 1px solid var(--divider-color);
          }
          .drag-handle {
            color: var(--secondary-text-color);
            margin-right: 12px;
            cursor: grab;
          }
          .drag-handle:active {
            cursor: grabbing;
          }
          .bar-item.dragging {
            opacity: 0.5;
            transform: rotate(2deg);
          }
          .bar-item.drag-over {
            border-top: 2px solid var(--primary-color);
          }
          .bar-individual-controls {
            display: flex;
            gap: 8px;
            align-items: center;
            margin-right: 8px;
          }
          .bar-individual-control {
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            transition: all 0.2s ease;
            position: relative;
          }
          .bar-individual-control:hover {
            transform: scale(1.1);
          }
          .bar-individual-control.disabled {
            opacity: 0.5;
            pointer-events: none;
          }
          .bar-individual-control.active {
            background: var(--primary-color);
          }
          .bar-individual-control.active:hover {
            background: var(--primary-color-dark);
          }
          .bar-individual-control.inactive {
            background: var(--secondary-background-color);
          }
          .bar-individual-control.inactive:hover {
            background: var(--divider-color);
          }
          .bar-individual-control ha-icon {
            --mdc-icon-size: 16px;
            transition: color 0.2s ease;
          }
          .bar-individual-control.active ha-icon {
            color: white;
          }
          .bar-individual-control.inactive ha-icon {
            color: var(--secondary-text-color);
          }
          .bar-type-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            margin-right: 12px;
            min-width: 60px;
            text-align: center;
          }
          .bar-type-badge.numeric {
            background: #2196f3;
            color: white;
          }
          .bar-type-badge.brightness {
            background: #ff9800;
            color: white;
          }
          .bar-type-badge.rgb {
            background: linear-gradient(45deg, #ff0000, #00ff00, #0000ff);
            color: white;
          }
          .bar-type-badge.color_temp {
            background: linear-gradient(45deg, #ff9329, #82aaff);
            color: white;
          }
          .bar-type-badge.red {
            background: #f44336;
            color: white;
          }
          .bar-type-badge.green {
            background: #4caf50;
            color: white;
          }
          .bar-type-badge.blue {
            background: #2196f3;
            color: white;
          }
          .bar-type-badge.attribute {
            background: #9c27b0;
            color: white;
          }
          .bar-label {
            flex: 1;
            font-weight: 500;
            color: var(--primary-text-color);
          }
          .bar-actions {
            display: flex;
            gap: 8px;
            align-items: center;
          }
          .bar-action-button {
            background: none;
            border: none;
            color: var(--secondary-text-color);
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s;
          }
          .bar-action-button:hover {
            background: var(--secondary-background-color);
            color: var(--primary-text-color);
          }
          .bar-action-button.delete:hover {
            color: var(--error-color);
          }
          .bar-content {
            padding: 0 16px;
            max-height: 0;
            overflow: hidden;
            transition:
              max-height 0.3s ease-out,
              padding 0.2s ease-out,
              opacity 0.15s ease-out;
            opacity: 0;
          }
          .bar-content.expanded {
            padding: 16px;
            max-height: 2500px;
            overflow: visible;
            opacity: 1;
            transition:
              max-height 0.3s ease-in,
              padding 0.2s ease-in,
              opacity 0.15s ease-in;
          }
          .add-bar-button {
            width: 100%;
            padding: 12px;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
            margin-bottom: 16px;
          }
          .add-bar-button:hover {
            background: var(--primary-color-dark);
          }
        </style>

        <!-- BARS CONFIGURATION -->
        <div class="settings-section bars-configuration">
          <div class="section-title">BARS CONFIGURATION</div>

          <button
            class="add-bar-button"
            @click=${()=>{const e=this._addBar(),t=[...r.bars||[],e];a({bars:t}),this.expandedBars.add(e.id)}}
          >
            <ha-icon icon="mdi:plus" style="margin-right: 8px;"></ha-icon>
            Add Bar
          </button>

          ${(r.bars||[]).map(((e,i)=>{var n,s,d,c,u,p,_,v,g,h,b,m,y,f,x,$,w,k,I,z,S,j,O,M,F,q,B,T,C,R,V,L,E,A;const D=null===(n=null==t?void 0:t.states)||void 0===n?void 0:n[e.entity],P=(null===(s=null==D?void 0:D.attributes)||void 0===s?void 0:s.friendly_name)||e.entity,N=e.name||P,G=this.expandedBars.has(e.id);return!1!==e.show_icon&&r.show_icon,!1!==e.show_name&&r.show_name,!1!==e.show_value&&r.show_value,o.qy`
              <div
                class="bar-item"
                data-bar-id="${e.id}"
                draggable="true"
                @dragstart=${t=>{this._dragFromHandle?(this._dragFromHandle=!1,t.dataTransfer.setData("text/plain",e.id),t.dataTransfer.effectAllowed="move",t.currentTarget.classList.add("dragging")):t.preventDefault()}}
                @dragend=${e=>{this._dragFromHandle=!1,e.currentTarget.classList.remove("dragging")}}
                @dragover=${e=>{e.preventDefault(),e.dataTransfer.dropEffect="move",e.currentTarget.classList.add("drag-over")}}
                @dragleave=${e=>{e.currentTarget.classList.remove("drag-over")}}
                @drop=${t=>{t.preventDefault(),t.currentTarget.classList.remove("drag-over");const i=t.dataTransfer.getData("text/plain"),o=e.id;if(i!==o){const e=[...r.bars||[]],t=e.findIndex((e=>e.id===i)),n=e.findIndex((e=>e.id===o));if(-1!==t&&-1!==n){const i=e.splice(t,1)[0];e.splice(n,0,i),a({bars:e})}}}}
              >
                <div
                  class="bar-header ${G?"expanded":""}"
                  @click=${t=>{const i=this.expandedBars.has(e.id);i?this.expandedBars.delete(e.id):this.expandedBars.add(e.id);const o=t.currentTarget,a=o.closest(".bar-item");if(a){const e=a.querySelector(".bar-content"),t=o.querySelector('ha-icon[icon^="mdi:chevron"]');i?(o.classList.remove("expanded"),null==e||e.classList.remove("expanded"),t&&t.setAttribute("icon","mdi:chevron-down")):(o.classList.add("expanded"),null==e||e.classList.add("expanded"),t&&t.setAttribute("icon","mdi:chevron-up"))}}}
                >
                  <ha-icon
                    icon="mdi:drag-vertical"
                    class="drag-handle"
                    @click=${e=>e.stopPropagation()}
                    @mousedown=${()=>{this._dragFromHandle=!0}}
                    @touchstart=${()=>{this._dragFromHandle=!0}}
                  ></ha-icon>
                  <div class="bar-type-badge ${e.type}">${e.type}</div>
                  <div class="bar-label">${N}</div>

                  <!-- Individual Bar Controls -->
                  <div class="bar-individual-controls">
                    <div
                      class="bar-individual-control ${!1!==e.show_icon?"active":"inactive"}"
                      @click=${t=>{t.stopPropagation();const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{show_icon:!e.show_icon})),a({bars:i})}}
                      title="Toggle icon visibility"
                    >
                      <ha-icon icon="mdi:lightbulb"></ha-icon>
                    </div>
                    <div
                      class="bar-individual-control ${!1!==e.show_name?"active":"inactive"}"
                      @click=${t=>{t.stopPropagation();const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{show_name:!e.show_name})),a({bars:i})}}
                      title="Toggle name visibility"
                    >
                      <ha-icon icon="mdi:text"></ha-icon>
                    </div>
                    <div
                      class="bar-individual-control ${!1!==e.show_value?"active":"inactive"}"
                      @click=${t=>{t.stopPropagation();const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{show_value:!e.show_value})),a({bars:i})}}
                      title="Toggle value visibility"
                    >
                      <ha-icon icon="mdi:numeric"></ha-icon>
                    </div>
                  </div>

                  <div class="bar-actions">
                    <button
                      class="bar-action-button"
                      @click=${t=>{t.stopPropagation();const o=this._duplicateBar(e),n=[...r.bars||[]];n.splice(i+1,0,o),a({bars:n})}}
                      title="Duplicate bar"
                    >
                      <ha-icon icon="mdi:content-copy"></ha-icon>
                    </button>
                    <button
                      class="bar-action-button delete"
                      @click=${t=>{t.stopPropagation();const i=this._deleteBar(e.id,r.bars||[]);a({bars:i})}}
                      title="Delete bar"
                    >
                      <ha-icon icon="mdi:delete"></ha-icon>
                    </button>
                    <ha-icon
                      icon="mdi:chevron-${G?"up":"down"}"
                      style="transition: transform 0.2s ease;"
                    ></ha-icon>
                  </div>
                </div>

                <div class="bar-content ${G?"expanded":""}">
                  ${this.renderFieldSection("Entity","Select the entity to control with this bar",t,{entity:e.entity},[this.entityField("entity")],(i=>{const o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));if(-1!==n){o[n]=Object.assign(Object.assign({},o[n]),{entity:i.detail.value.entity});const e=this._detectBarType(i.detail.value.entity,t);o[n].type=e}a({bars:o})}))}
                  ${this.renderFieldSection("Bar Type","Type of slider bar (auto-detected)",t,{type:e.type},[this.selectField("type",[{value:"numeric",label:"Numeric"},{value:"brightness",label:"Brightness"},{value:"rgb",label:"RGB Color"},{value:"color_temp",label:"Color Temperature"},{value:"red",label:"Red Channel"},{value:"green",label:"Green Channel"},{value:"blue",label:"Blue Channel"},{value:"attribute",label:"Custom Attribute"}])],(t=>{const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{type:t.detail.value.type})),a({bars:i}),this.requestUpdate()}))}
                  ${"attribute"===e.type?o.qy`
                        ${this.renderFieldSection("Attribute","Specific attribute to control (e.g., percentage, position, volume_level)",t,{attribute:e.attribute||"percentage"},[this.textField("attribute")],(t=>{const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{attribute:t.detail.value.attribute})),a({bars:i})}))}
                      `:""}
                  ${this.renderFieldSection("Name","Override the bar label (leave empty to use entity name)",t,{name:e.name||""},[this.textField("name")],(t=>{const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{name:t.detail.value.name})),a({bars:i})}))}
                  ${this.renderSliderField("Min Value","Minimum value for this bar",null!==(d=e.min_value)&&void 0!==d?d:0,0,0,1e3,1,(t=>{const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{min_value:t})),a({bars:i})}),"")}
                  ${this.renderSliderField("Max Value","Maximum value for this bar",null!==(c=e.max_value)&&void 0!==c?c:100,100,0,1e3,1,(t=>{const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{max_value:t})),a({bars:i})}),"")}
                  ${this.renderSliderField("Step","Step increment for value changes",null!==(u=e.step)&&void 0!==u?u:1,1,.1,100,.1,(t=>{const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{step:t})),a({bars:i})}),"")}
                  ${(()=>{const i=r.layout_mode||"overlay",n=r.orientation||"horizontal";let l=[];return"overlay"===i?l="horizontal"===n?[{value:"left",label:"Left"},{value:"center",label:"Center"},{value:"right",label:"Right"}]:[{value:"bottom",label:"Bottom"},{value:"center",label:"Center"},{value:"top",label:"Top"}]:"split"===i?l="horizontal"===n?[{value:"left",label:"Left"},{value:"right",label:"Right"}]:[{value:"top",label:"Top"},{value:"bottom",label:"Bottom"}]:"outside"===i&&(l="horizontal"===n?[{value:"top_left",label:"Top Left"},{value:"top_center",label:"Top Center"},{value:"top_right",label:"Top Right"},{value:"bottom_left",label:"Bottom Left"},{value:"bottom_center",label:"Bottom Center"},{value:"bottom_right",label:"Bottom Right"}]:[{value:"left_top",label:"Left Top"},{value:"left_center",label:"Left Center"},{value:"left_bottom",label:"Left Bottom"},{value:"right_top",label:"Right Top"},{value:"right_center",label:"Right Center"},{value:"right_bottom",label:"Right Bottom"}]),o.qy`
                      <div
                        style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--divider-color);"
                      >
                        <div
                          style="font-size: 14px; font-weight: 600; color: var(--primary-color); margin-bottom: 12px;"
                        >
                          ELEMENT POSITIONING
                        </div>

                        ${!1!==e.show_icon&&!1!==r.show_icon?o.qy`
                              ${this.renderFieldSection("Icon Position","Position of the icon element",t,{icon_position:e.icon_position||"left"},[this.selectField("icon_position",l)],(t=>{const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{icon_position:t.detail.value.icon_position})),a({bars:i})}))}
                            `:""}
                        ${!1!==e.show_name&&!1!==r.show_name?o.qy`
                              ${this.renderFieldSection("Name Position","Position of the name label",t,{name_position:e.name_position||"left"},[this.selectField("name_position",l)],(t=>{const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{name_position:t.detail.value.name_position})),a({bars:i})}))}
                            `:""}
                        ${!1!==e.show_value&&!1!==r.show_value?o.qy`
                              ${this.renderFieldSection("Value Position","Position of the value display",t,{value_position:e.value_position||"right"},[this.selectField("value_position",l)],(t=>{const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{value_position:t.detail.value.value_position})),a({bars:i})}))}
                            `:""}
                        ${"split"===i?o.qy`
                              ${this.renderFieldSection("Info Section Position","Position of the entire info section relative to the bar",t,{info_section_position:e.info_section_position||("horizontal"===n?"left":"top")},[this.selectField("info_section_position","horizontal"===n?[{value:"left",label:"Left"},{value:"right",label:"Right"}]:[{value:"top",label:"Top"},{value:"bottom",label:"Bottom"}])],(t=>{const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{info_section_position:t.detail.value.info_section_position})),a({bars:i})}))}
                            `:""}
                      </div>
                    `})()}
                  ${"split"===r.layout_mode?o.qy`
                        <div class="field-container">
                          <div class="field-title">Bar Length</div>
                          <div class="field-description">Percentage of space for bar (0-100%)</div>
                          <div style="display: flex; gap: 8px; align-items: center;">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              .value="${null!==(_=null!==(p=e.split_bar_length)&&void 0!==p?p:r.split_bar_length)&&void 0!==_?_:60}"
                              @input=${t=>{const i=t.target,o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));-1!==n&&(o[n]=Object.assign(Object.assign({},o[n]),{split_bar_length:parseInt(i.value)})),a({bars:o})}}
                              style="flex: 1;"
                            />
                            <input
                              type="number"
                              min="0"
                              max="100"
                              .value="${null!==(g=null!==(v=e.split_bar_length)&&void 0!==v?v:r.split_bar_length)&&void 0!==g?g:60}"
                              @input=${t=>{const i=t.target,o=Math.max(0,Math.min(100,parseInt(i.value))),n=[...r.bars||[]],l=n.findIndex((t=>t.id===e.id));-1!==l&&(n[l]=Object.assign(Object.assign({},n[l]),{split_bar_length:o})),a({bars:n})}}
                              style="width: 70px;"
                            />
                          </div>
                        </div>
                      `:""}

                  <!-- Bar Slider Style -->
                  <div
                    style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--divider-color);"
                  >
                    <div
                      style="font-size: 14px; font-weight: 600; color: var(--primary-color); margin-bottom: 12px;"
                    >
                      SLIDER STYLE
                    </div>

                    ${this.renderFieldSection("Slider Style","Visual appearance of the slider",t,{slider_style:e.slider_style||r.slider_style||"flat"},[this.selectField("slider_style",[{value:"flat",label:"Flat"},{value:"glossy",label:"Glossy"},{value:"embossed",label:"Embossed"},{value:"inset",label:"Inset"},{value:"neon-glow",label:"Neon Glow"},{value:"outline",label:"Outline"},{value:"glass",label:"Glass"},{value:"metallic",label:"Metallic"},{value:"neumorphic",label:"Neumorphic"},{value:"minimal",label:"Minimal"}])],(t=>{const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{slider_style:t.detail.value.slider_style})),a({bars:i}),this.requestUpdate()}))}

                    <div class="field-container">
                      <div class="field-title">
                        ${"vertical"===r.orientation?"Slider Width":"Slider Height"}
                      </div>
                      <div class="field-description">
                        ${"vertical"===r.orientation?"Width of vertical bars in pixels":"Height of horizontal bars in pixels"}
                      </div>
                      <div style="display: flex; gap: 8px; align-items: center;">
                        <input
                          type="range"
                          min="20"
                          max="200"
                          step="5"
                          .value="${e.slider_height||r.slider_height||40}"
                          @input=${t=>{const i=t.target,o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));-1!==n&&(o[n]=Object.assign(Object.assign({},o[n]),{slider_height:parseInt(i.value)})),a({bars:o})}}
                          style="flex: 1;"
                        />
                        <input
                          type="number"
                          min="20"
                          max="200"
                          .value="${e.slider_height||r.slider_height||40}"
                          @input=${t=>{const i=t.target,o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));-1!==n&&(o[n]=Object.assign(Object.assign({},o[n]),{slider_height:parseInt(i.value)})),a({bars:o})}}
                          style="width: 70px;"
                        />
                      </div>
                    </div>

                    ${this.renderFieldSection("Border Radius","Slider border radius style",t,{slider_radius:e.slider_radius||r.slider_radius||"round"},[this.selectField("slider_radius",[{value:"square",label:"Square"},{value:"round",label:"Round"},{value:"pill",label:"Pill"}])],(t=>{const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{slider_radius:t.detail.value.slider_radius})),a({bars:i})}))}
                    ${"glass"===(e.slider_style||r.slider_style)?o.qy`
                          <div class="conditional-fields-group">
                            <div class="field-container">
                              <div class="field-title">Glass Blur Amount</div>
                              <div class="field-description">
                                Backdrop filter blur amount (0-20px)
                              </div>
                              <div style="display: flex; gap: 8px; align-items: center;">
                                <input
                                  type="range"
                                  min="0"
                                  max="20"
                                  step="1"
                                  .value="${e.glass_blur_amount||r.glass_blur_amount||8}"
                                  @input=${t=>{const i=t.target,o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));-1!==n&&(o[n]=Object.assign(Object.assign({},o[n]),{glass_blur_amount:parseInt(i.value)})),a({bars:o})}}
                                  style="flex: 1;"
                                />
                                <input
                                  type="number"
                                  min="0"
                                  max="20"
                                  .value="${e.glass_blur_amount||r.glass_blur_amount||8}"
                                  @input=${t=>{const i=t.target,o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));-1!==n&&(o[n]=Object.assign(Object.assign({},o[n]),{glass_blur_amount:parseInt(i.value)})),a({bars:o})}}
                                  style="width: 70px;"
                                />
                              </div>
                            </div>
                          </div>
                        `:""}

                    <div
                      style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px;"
                    >
                      <div>
                        <div class="field-title">Invert Direction</div>
                        <div class="field-description">
                          Reverse min/max positions (useful for curtains)
                        </div>
                      </div>
                      <ha-switch
                        .checked=${null!==(b=null!==(h=e.invert_direction)&&void 0!==h?h:r.invert_direction)&&void 0!==b&&b}
                        @change=${t=>{const i=t.target,o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));-1!==n&&(o[n]=Object.assign(Object.assign({},o[n]),{invert_direction:i.checked})),a({bars:o})}}
                      ></ha-switch>
                    </div>
                  </div>

                  ${"rgb"!==e.type&&"color_temp"!==e.type?o.qy`
                        <!-- Bar Slider Colors -->
                        <div
                          style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--divider-color);"
                        >
                          <div
                            style="font-size: 14px; font-weight: 600; color: var(--primary-color); margin-bottom: 12px;"
                          >
                            SLIDER COLORS
                          </div>

                          <div class="field-container">
                            <div class="field-title">Track Color</div>
                            <div class="field-description">
                              Background color (leave empty for auto: fill at 25% opacity)
                            </div>
                            <ultra-color-picker
                              .value=${e.slider_track_color||r.slider_track_color||""}
                              .defaultValue=${""}
                              .homeAssistant=${t}
                              @value-changed=${t=>{const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{slider_track_color:t.detail.value})),a({bars:i})}}
                            ></ultra-color-picker>
                          </div>

                          ${null!==(y=null!==(m=e.dynamic_fill_color)&&void 0!==m?m:r.dynamic_fill_color)&&void 0!==y&&y?o.qy``:o.qy`
                                <div class="field-container">
                                  <div class="field-title">Fill Color</div>
                                  <div class="field-description">
                                    Color of the filled portion of the slider
                                  </div>
                                  <ultra-color-picker
                                    .value=${e.slider_fill_color||r.slider_fill_color||""}
                                    .defaultValue=${"var(--primary-color)"}
                                    .homeAssistant=${t}
                                    @value-changed=${t=>{const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{slider_fill_color:t.detail.value})),a({bars:i})}}
                                  ></ultra-color-picker>
                                </div>
                              `}

                          <div
                            style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px;"
                          >
                            <div>
                              <div class="field-title">Dynamic Fill Color</div>
                              <div class="field-description">
                                Use entity color (RGB lights, etc.)
                              </div>
                            </div>
                            <ha-switch
                              .checked=${null!==(x=null!==(f=e.dynamic_fill_color)&&void 0!==f?f:r.dynamic_fill_color)&&void 0!==x&&x}
                              @change=${t=>{const i=t.target,o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));-1!==n&&(o[n]=Object.assign(Object.assign({},o[n]),{dynamic_fill_color:i.checked})),a({bars:o})}}
                            ></ha-switch>
                          </div>
                        </div>
                      `:""}

                  <!-- Bar Display Elements -->
                  <div
                    style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--divider-color);"
                  >
                    <div
                      style="font-size: 14px; font-weight: 600; color: var(--primary-color); margin-bottom: 12px;"
                    >
                      DISPLAY ELEMENTS
                    </div>

                    ${"overlay"===l?o.qy`
                          <div
                            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;"
                          >
                            <div>
                              <div class="field-title">Auto Contrast</div>
                              <div class="field-description">
                                Automatically adjust text/icon color based on fill
                              </div>
                            </div>
                            <ha-switch
                              .checked=${null===(w=null!==($=e.auto_contrast)&&void 0!==$?$:r.auto_contrast)||void 0===w||w}
                              @change=${t=>{const i=t.target,o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));-1!==n&&(o[n]=Object.assign(Object.assign({},o[n]),{auto_contrast:i.checked})),a({bars:o})}}
                            ></ha-switch>
                          </div>
                        `:""}

                    <!-- Icon Settings -->
                    <div style="margin-bottom: 24px;">
                      <div
                        style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;"
                      >
                        <div>
                          <div class="field-title">Show Icon</div>
                          <div class="field-description">Display an icon on the slider</div>
                        </div>
                        <ha-switch
                          .checked=${null===(I=null!==(k=e.show_icon)&&void 0!==k?k:r.show_icon)||void 0===I||I}
                          @change=${t=>{const i=t.target,o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));-1!==n&&(o[n]=Object.assign(Object.assign({},o[n]),{show_icon:i.checked})),a({bars:o})}}
                        ></ha-switch>
                      </div>

                      ${!1!==(null!==(z=e.show_icon)&&void 0!==z?z:r.show_icon)?o.qy`
                            <div class="conditional-fields-group">
                              ${this.renderFieldSection("Icon","Icon to display (leave empty for entity icon)",t,{icon:e.icon||r.icon||""},[this.iconField("icon")],(t=>{const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{icon:t.detail.value.icon})),a({bars:i})}))}

                              <div
                                style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;"
                              >
                                <div>
                                  <div class="field-title">Dynamic Icon</div>
                                  <div class="field-description">Use entity's default icon</div>
                                </div>
                                <ha-switch
                                  .checked=${null===(j=null!==(S=e.dynamic_icon)&&void 0!==S?S:r.dynamic_icon)||void 0===j||j}
                                  @change=${t=>{const i=t.target,o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));-1!==n&&(o[n]=Object.assign(Object.assign({},o[n]),{dynamic_icon:i.checked})),a({bars:o})}}
                                ></ha-switch>
                              </div>

                              <div
                                style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;"
                              >
                                <div>
                                  <div class="field-title">Icon as Toggle</div>
                                  <div class="field-description">
                                    Click icon to toggle entity on/off (icon changes with state)
                                  </div>
                                </div>
                                <ha-switch
                                  .checked=${null===(M=null!==(O=e.icon_as_toggle)&&void 0!==O?O:r.icon_as_toggle)||void 0===M||M}
                                  @change=${t=>{const i=t.target,o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));-1!==n&&(o[n]=Object.assign(Object.assign({},o[n]),{icon_as_toggle:i.checked})),a({bars:o})}}
                                ></ha-switch>
                              </div>

                              <div class="field-container">
                                <div class="field-title">Icon Size</div>
                                <div class="field-description">Icon size in pixels</div>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                  <input
                                    type="range"
                                    min="16"
                                    max="48"
                                    step="2"
                                    .value="${e.icon_size||r.icon_size||24}"
                                    @input=${t=>{const i=t.target,o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));-1!==n&&(o[n]=Object.assign(Object.assign({},o[n]),{icon_size:parseInt(i.value)})),a({bars:o})}}
                                    style="flex: 1;"
                                  />
                                  <input
                                    type="number"
                                    min="16"
                                    max="48"
                                    .value="${e.icon_size||r.icon_size||24}"
                                    @input=${t=>{const i=t.target,o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));-1!==n&&(o[n]=Object.assign(Object.assign({},o[n]),{icon_size:parseInt(i.value)})),a({bars:o})}}
                                    style="width: 70px;"
                                  />
                                </div>
                              </div>

                              <div class="field-container">
                                <div class="field-title">Icon Color</div>
                                <div class="field-description">Color for the icon</div>
                                <ultra-color-picker
                                  .value=${e.icon_color||r.icon_color||""}
                                  .defaultValue=${"var(--primary-text-color)"}
                                  .homeAssistant=${t}
                                  @value-changed=${t=>{const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{icon_color:t.detail.value})),a({bars:i})}}
                                ></ultra-color-picker>
                              </div>
                            </div>
                          `:""}
                    </div>

                    <!-- Name Settings -->
                    <div style="margin-bottom: 24px;">
                      <div
                        style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;"
                      >
                        <div>
                          <div class="field-title">Show Name</div>
                          <div class="field-description">Display entity name</div>
                        </div>
                        <ha-switch
                          .checked=${null===(q=null!==(F=e.show_name)&&void 0!==F?F:r.show_name)||void 0===q||q}
                          @change=${t=>{const i=t.target,o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));-1!==n&&(o[n]=Object.assign(Object.assign({},o[n]),{show_name:i.checked})),a({bars:o})}}
                        ></ha-switch>
                      </div>

                      ${!1!==(null!==(B=e.show_name)&&void 0!==B?B:r.show_name)?o.qy`
                            <div class="conditional-fields-group">
                              <div class="field-container">
                                <div class="field-title">Name Size</div>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                  <input
                                    type="range"
                                    min="10"
                                    max="24"
                                    step="1"
                                    .value="${e.name_size||r.name_size||14}"
                                    @input=${t=>{const i=t.target,o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));-1!==n&&(o[n]=Object.assign(Object.assign({},o[n]),{name_size:parseInt(i.value)})),a({bars:o})}}
                                    style="flex: 1;"
                                  />
                                  <input
                                    type="number"
                                    min="10"
                                    max="24"
                                    .value="${e.name_size||r.name_size||14}"
                                    @input=${t=>{const i=t.target,o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));-1!==n&&(o[n]=Object.assign(Object.assign({},o[n]),{name_size:parseInt(i.value)})),a({bars:o})}}
                                    style="width: 70px;"
                                  />
                                </div>
                              </div>

                              <div class="field-container">
                                <div class="field-title">Name Color</div>
                                <ultra-color-picker
                                  .value=${e.name_color||r.name_color||""}
                                  .defaultValue=${"var(--primary-text-color)"}
                                  .homeAssistant=${t}
                                  @value-changed=${t=>{const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{name_color:t.detail.value})),a({bars:i})}}
                                ></ultra-color-picker>
                              </div>

                              <div
                                style="display: flex; align-items: center; justify-content: space-between;"
                              >
                                <div class="field-title">Bold</div>
                                <ha-switch
                                  .checked=${null===(C=null!==(T=e.name_bold)&&void 0!==T?T:r.name_bold)||void 0===C||C}
                                  @change=${t=>{const i=t.target,o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));-1!==n&&(o[n]=Object.assign(Object.assign({},o[n]),{name_bold:i.checked})),a({bars:o})}}
                                ></ha-switch>
                              </div>
                            </div>
                          `:""}
                    </div>

                    <!-- Value Settings -->
                    <div style="margin-bottom: 24px;">
                      <div
                        style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;"
                      >
                        <div>
                          <div class="field-title">Show Value</div>
                          <div class="field-description">Display current numeric value</div>
                        </div>
                        <ha-switch
                          .checked=${null===(V=null!==(R=e.show_value)&&void 0!==R?R:r.show_value)||void 0===V||V}
                          @change=${t=>{const i=t.target,o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));-1!==n&&(o[n]=Object.assign(Object.assign({},o[n]),{show_value:i.checked})),a({bars:o})}}
                        ></ha-switch>
                      </div>

                      <div
                        style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;"
                      >
                        <div>
                          <div class="field-title">Show Bar Label</div>
                          <div class="field-description">
                            Display bar label (Brightness, RGB Color, etc.)
                          </div>
                        </div>
                        <ha-switch
                          .checked=${null===(E=null!==(L=e.show_bar_label)&&void 0!==L?L:r.show_bar_label)||void 0===E||E}
                          @change=${t=>{const i=t.target,o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));-1!==n&&(o[n]=Object.assign(Object.assign({},o[n]),{show_bar_label:i.checked})),a({bars:o})}}
                        ></ha-switch>
                      </div>

                      ${!1!==(null!==(A=e.show_value)&&void 0!==A?A:r.show_value)?o.qy`
                            <div class="conditional-fields-group">
                              <div class="field-container">
                                <div class="field-title">Value Size</div>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                  <input
                                    type="range"
                                    min="10"
                                    max="24"
                                    step="1"
                                    .value="${e.value_size||r.value_size||14}"
                                    @input=${t=>{const i=t.target,o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));-1!==n&&(o[n]=Object.assign(Object.assign({},o[n]),{value_size:parseInt(i.value)})),a({bars:o})}}
                                    style="flex: 1;"
                                  />
                                  <input
                                    type="number"
                                    min="10"
                                    max="24"
                                    .value="${e.value_size||r.value_size||14}"
                                    @input=${t=>{const i=t.target,o=[...r.bars||[]],n=o.findIndex((t=>t.id===e.id));-1!==n&&(o[n]=Object.assign(Object.assign({},o[n]),{value_size:parseInt(i.value)})),a({bars:o})}}
                                    style="width: 70px;"
                                  />
                                </div>
                              </div>

                              <div class="field-container">
                                <div class="field-title">Value Color</div>
                                <ultra-color-picker
                                  .value=${e.value_color||r.value_color||""}
                                  .defaultValue=${"var(--primary-text-color)"}
                                  .homeAssistant=${t}
                                  @value-changed=${t=>{const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{value_color:t.detail.value})),a({bars:i})}}
                                ></ultra-color-picker>
                              </div>

                              ${this.renderFieldSection("Value Suffix","Text to append to value (e.g., %, °C, °F)",t,{value_suffix:e.value_suffix||r.value_suffix||""},[this.textField("value_suffix")],(t=>{const i=[...r.bars||[]],o=i.findIndex((t=>t.id===e.id));-1!==o&&(i[o]=Object.assign(Object.assign({},i[o]),{value_suffix:t.detail.value.value_suffix})),a({bars:i})}))}
                            </div>
                          `:""}
                    </div>
                  </div>
                </div>
              </div>
            `}))}
        </div>

        <!-- LAYOUT SETTINGS -->
        <div class="settings-section layout-settings">
          <div class="section-title">LAYOUT SETTINGS</div>

          ${this.renderFieldSection("Orientation","Slider direction: horizontal or vertical",t,{orientation:r.orientation||"horizontal"},[this.selectField("orientation",[{value:"horizontal",label:"Horizontal"},{value:"vertical",label:"Vertical"}])],(e=>a({orientation:e.detail.value.orientation})))}
          ${this.renderFieldSection("Layout Mode","How to position information relative to the slider",t,{layout_mode:r.layout_mode||"outside"},[this.selectField("layout_mode",[{value:"outside",label:"Outside (info beside slider)"},{value:"overlay",label:"Overlay (info on slider)"},{value:"split",label:"Split (adjustable ratio)"}])],(e=>a({layout_mode:e.detail.value.layout_mode})))}
          ${"split"===r.layout_mode?o.qy`
                <div class="conditional-fields-group">
                  <div class="field-description">
                    Configure bar position and ratio inside each bar card below.
                  </div>
                </div>
              `:""}
        </div>

        <!-- Bar Spacing (kept global) -->
        <div class="settings-section">
          <div class="field-container">
            <div class="field-title">Bar Spacing</div>
            <div class="field-description">
              Spacing between multiple bars (negative values allowed for overlap)
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input
                type="range"
                min="-20"
                max="40"
                step="2"
                .value="${r.bar_spacing||8}"
                @input=${e=>{const t=e.target;a({bar_spacing:parseInt(t.value)})}}
                style="flex: 1;"
              />
              <input
                type="number"
                min="-20"
                max="40"
                .value="${r.bar_spacing||8}"
                @input=${e=>{const t=e.target;a({bar_spacing:parseInt(t.value)})}}
                style="width: 70px;"
              />
            </div>
          </div>
        </div>
      </div>
    `}renderActionsTab(e,t,i,a){const r=e;return o.qy`
      <div class="actions-tab">
        ${this.injectUcFormStyles()}
        <style>
          .actions-tab {
            padding: 8px;
          }
        </style>

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          ${n.K.render(t,{tap_action:r.tap_action||{action:"nothing"},hold_action:r.hold_action||{action:"nothing"},double_tap_action:r.double_tap_action||{action:"nothing"}},(e=>{const t={};e.tap_action&&(t.tap_action=e.tap_action),e.hold_action&&(t.hold_action=e.hold_action),e.double_tap_action&&(t.double_tap_action=e.double_tap_action),a(t)}),"Link Configuration")}
        </div>
      </div>
    `}renderLogicTab(e,t,i,a){return o.qy``}renderPreview(e,t,i,a){var n,l;const s=e,d=t;if(!s.bars||0===s.bars.length)return this.renderGradientErrorState("Add Bars","Configure slider bars in the General tab","mdi:tune-vertical");const c=s.bars.filter((e=>e.entity&&""!==e.entity.trim())),u=s.bars.filter((e=>!e.entity||""===e.entity.trim()));if(0===c.length&&u.length>0){const e=u.map(((e,t)=>e.name||`Bar ${t+1}`)).join(", ");return this.renderGradientErrorState("Bars Need Entities",e,"mdi:tune-vertical")}const p=u.length>0?this.renderGradientWarningBanner(`${u.length>1?"bars":"bar"} need${1===u.length?"s":""} entities`,u.length):"",_=c,v=s.orientation||"horizontal",g=s.bar_spacing||8,h=s.layout_mode||"outside",b="vertical"===v,m=200,y=`uc-slider-layout uc-layout-${h} ${b?"uc-orientation-vertical":"uc-orientation-horizontal"}`,f="outside"===h,x=(e,t)=>{var i,a,n,l,c,u,p,_,g;const b=null===(i=null==d?void 0:d.states)||void 0===i?void 0:i[e.entity];if(!b)return o.qy`
          <div
            style="padding: 12px; text-align: center; color: var(--error-color); background: var(--error-color); color: white; border-radius: 8px;"
          >
            <ha-icon icon="mdi:alert-circle" style="margin-right: 8px;"></ha-icon>
            Entity not found: ${e.entity}
          </div>
        `;const y=e.entity.split(".")[0],f=e.name||b.attributes.friendly_name||e.entity,x=("on"===b.state||b.state,!1!==e.show_icon&&!1!==s.show_icon),$=!1!==e.show_name&&!1!==s.show_name,w=!1!==e.show_value&&!1!==s.show_value;let k=0,I="0",z=0;if("brightness"===e.type){const e=b.attributes.brightness||0;k=Math.round(e/255*100),z=k,I=`${k}`}else if("rgb"===e.type){const e=b.attributes.rgb_color||[255,255,255],t=this.rgbToHue(e[0],e[1],e[2]);z=Math.max(0,Math.min(100,t)),I=`rgb(${e[0]}, ${e[1]}, ${e[2]})`}else if("color_temp"===e.type){const e=b.attributes.color_temp||154,t=154,i=500;z=Math.max(0,Math.min(100,(i-e)/(i-t)*100)),I=`${Math.round(1e6/e)}K`}else if("red"===e.type){const e=b.attributes.rgb_color||[255,255,255];z=Math.max(0,Math.min(100,e[0]/255*100)),I=`${e[0]}`}else if("green"===e.type){const e=b.attributes.rgb_color||[255,255,255];z=Math.max(0,Math.min(100,e[1]/255*100)),I=`${e[1]}`}else if("blue"===e.type){const e=b.attributes.rgb_color||[255,255,255];z=Math.max(0,Math.min(100,e[2]/255*100)),I=`${e[2]}`}else{let t=0;t="attribute"===e.type&&e.attribute?parseFloat(b.attributes[e.attribute])||0:parseFloat(b.state)||0;const i=null!==(a=e.min_value)&&void 0!==a?a:0;k=t,z=(t-i)/((null!==(n=e.max_value)&&void 0!==n?n:100)-i)*100,I=t.toFixed(1)}z=Math.max(0,Math.min(100,z));const S=`${e.entity}-${e.type}`;if((this.interactingBars.has(S)||this.localSliderValues.has(S))&&!this.interactingBars.has(S))if("off"===(null==b?void 0:b.state)||"closed"===(null==b?void 0:b.state))this.localSliderValues.delete(S);else{const e=null!==(l=this.localSliderValues.get(S))&&void 0!==l?l:z;Math.abs(e-z)>5&&this.localSliderValues.delete(S)}const j=(this.interactingBars.has(S)||this.localSliderValues.has(S))&&null!==(c=this.localSliderValues.get(S))&&void 0!==c?c:z,O=null!==(p=null!==(u=e.invert_direction)&&void 0!==u?u:s.invert_direction)&&void 0!==p&&p,M=O?100-j:j,F=this._getBarGradient(e,d,v),q="string"==typeof e.slider_fill_color?e.slider_fill_color.trim():"",B="string"==typeof s.slider_fill_color?s.slider_fill_color.trim():"",T="rgb"===e.type||"color_temp"===e.type;let C=F;!T&&null!==(g=null!==(_=e.dynamic_fill_color)&&void 0!==_?_:s.dynamic_fill_color)&&void 0!==g&&g?C=this.resolveDynamicFillColor(e,b,F):!T&&q?C=q:!T&&B&&(C=B);const R=C.includes("gradient"),V=T,L=!V&&R,E=R,A="vertical"===v,D=A&&"outside"===h,P=e.icon_size||s.icon_size||16,N=x?P+12:0,G=D?Math.max(40,m-N):m,H=A?"0deg":"90deg",W=L?`background: ${C}; opacity: 1;`:`background: linear-gradient(${H}, ${C} 0%, ${C} ${M}%, transparent ${M}%, transparent 100%); opacity: 0.8;`;e.overlay_name_position||s.overlay_name_position,e.overlay_value_position||s.overlay_value_position,e.overlay_icon_position||s.overlay_icon_position;let U=e.slider_track_color||s.slider_track_color;U||(U=E?"rgba(var(--rgb-primary-color), 0.25)":C.startsWith("rgb(")?C.replace("rgb(","rgba(").replace(")",", 0.25)"):"rgba(var(--rgb-primary-color), 0.25)");const Y=e.slider_height||s.slider_height||55,K=e.slider_style||s.slider_style||"flat",X=e.slider_radius||s.slider_radius||"round",J=e.glass_blur_amount||s.glass_blur_amount||8;let Q="",Z="";const ee=V?C:L?U:`linear-gradient(${H}, ${C} 0%, ${C} ${M}%, ${U} ${M}%, ${U} 100%)`;let te,ie="10px";switch("square"===X?ie="0":"pill"===X&&(ie=Y/2+"px"),K){case"flat":case"neon-glow":default:Q=`\n            background: ${ee};\n            border-radius: ${ie};\n          `;break;case"glossy":Q=`\n            background: ${ee};\n            border-radius: ${ie};\n            box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);\n          `,Z="\n            background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.1) 100%);\n          ";break;case"glass":Q=`\n            background: transparent;\n            border-radius: ${ie};\n            border: 1px solid rgba(255, 255, 255, 0.2);\n            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\n          `,Z=`\n            background: rgba(255, 255, 255, 0.1);\n            backdrop-filter: blur(${J}px);\n          `;break;case"minimal":Q=`\n            background: ${U};\n            border-radius: 10px;\n          `,Z=W;break;case"embossed":Q=`\n            background: ${ee};\n            border-radius: ${ie};\n            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 -2px 4px rgba(255, 255, 255, 0.1), 0 1px 2px rgba(0, 0, 0, 0.2);\n          `,Z="\n            background: linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 0%, transparent 40%, rgba(0, 0, 0, 0.15) 100%);\n          ";break;case"inset":Q=`\n            background: ${ee};\n            border-radius: ${ie};\n            box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4), inset 0 -1px 2px rgba(255, 255, 255, 0.05);\n          `;break;case"gradient-overlay":Q=`\n            background: ${ee};\n            border-radius: ${ie};\n          `,Z="\n            background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%, rgba(0, 0, 0, 0.15) 100%);\n          ";break;case"outline":Q=`\n            background: transparent;\n            border-radius: ${ie};\n            border: 2px solid ${C};\n          `,Z=W;break;case"metallic":Q=`\n            background: ${ee};\n            border-radius: ${ie};\n            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);\n          `,Z="\n            background: linear-gradient(to bottom, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.05) 45%, rgba(0, 0, 0, 0.05) 55%, rgba(255, 255, 255, 0.1) 100%);\n          ";break;case"neumorphic":Q=`\n            background: ${U};\n            border-radius: ${ie};\n            box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.15), -6px -6px 12px rgba(255, 255, 255, 0.08);\n          `,Z=W}L&&!Z&&(Z=W);const oe=e=>{this.interactingBars.add(S),this.localSliderValues.delete(S),this.localSliderValues.set(S,j),this.localSliderValues=new Map(this.localSliderValues)},ae=e=>{this.interactingBars.delete(S)},ne="rgb"===e.type||"color_temp"===e.type,re=(A&&ne?15:0)+(A&&ne?13:0),le=`uc-slider-bar uc-layout-${h} uc-orientation-${v} uc-bar-type-${e.type}`,se=A?`${Y}px`:"100%",de=A?`${G}px`:`${"minimal"===K?8:Y}px`,ce="neon-glow"===K,ue=C;return o.qy`
        <div class="${le}">
          ${!1!==s.show_bar_label&&"outside"!==h?o.qy`
                <div
                  class="uc-slider-label"
                  style="font-size: 11px; color: var(--secondary-text-color); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;"
                >
                  ${f}
                </div>
              `:""}

          <div style="position: relative; ${ce?"overflow: visible;":""}">
            ${ce?o.qy`
                  <div
                    style="
                      position: absolute;
                      inset: 0;
                      background: ${ue};
                      border-radius: ${ie};
                      filter: blur(10px) saturate(1.5);
                      opacity: 0.6;
                      pointer-events: none;
                      z-index: 0;
                      transition: background 200ms ease;
                    "
                  ></div>
                `:""}
            <div
              class="slider-track-container uc-slider-track"
              style="
                position: relative;
                height: ${de};
                width: ${se};
                ${Q}
                transition: all ${e.transition_duration||s.transition_duration||200}ms ease;
                overflow: ${"minimal"===K?"visible":"hidden"};
                ${"minimal"===K?"display: flex; align-items: center;":""}
                ${A?"display: flex; justify-content: center; align-items: center;":""}
                --slider-height: ${Y}px;
                ${ce?"z-index: 1;":""}
              "
            >
            ${Z&&!V?o.qy`
                  <div
                    style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  ${A?`width: 100%; height: ${M}%;`:`height: 100%; width: ${M}%;`}
                  ${Z}
                  border-radius: ${ie};
                  pointer-events: none;
                  z-index: 1;
                  transition: width 80ms ease-out, height 80ms ease-out;
                "
                  ></div>
                `:""}

            <input
              type="range"
              min="0"
              max="100"
              step="${(()=>{var t,i,o;const a=null!==(t=e.min_value)&&void 0!==t?t:0,n=null!==(i=e.max_value)&&void 0!==i?i:100,r=null!==(o=e.step)&&void 0!==o?o:1,l=n-a;return l>0?r/l*100:1})()}"
              .value="${M}"
              @input=${t=>{const i=t.target,o=parseFloat(i.value),a=O?100-o:o;this.localSliderValues.set(S,a),this.localSliderValues=new Map(this.localSliderValues),te&&clearTimeout(te),te=setTimeout((()=>{var t,i,o,n,r,l,c,u;try{if("light"===y){const t={entity_id:e.entity};if("brightness"===e.type){const e=Math.round(a/100*255);t.brightness=e}else if("rgb"===e.type){const e=a/100,i=this.hsvToRgb(e,1,1);t.rgb_color=i}else if("red"===e.type){const e=Math.round(2.55*a),i=b.attributes.rgb_color||[255,255,255];t.rgb_color=[e,i[1],i[2]]}else if("green"===e.type){const e=Math.round(2.55*a),i=b.attributes.rgb_color||[255,255,255];t.rgb_color=[i[0],e,i[2]]}else if("blue"===e.type){const e=Math.round(2.55*a),i=b.attributes.rgb_color||[255,255,255];t.rgb_color=[i[0],i[1],e]}else if("color_temp"===e.type){const e=154,i=500,o=Math.round(i-a/100*(i-e));t.color_temp=o}d.callService("light","turn_on",t)}else if("cover"===y)d.callService("cover","set_cover_position",{entity_id:e.entity,position:Math.round(a)});else if("fan"===y)if("attribute"===e.type&&"percentage"===e.attribute){const n=null!==(t=e.min_value)&&void 0!==t?t:0,r=null!==(i=e.max_value)&&void 0!==i?i:100,l=null!==(o=e.step)&&void 0!==o?o:1;let s=a/100*(r-n)+n;s=Math.round(s/l)*l,s=Math.max(n,Math.min(r,s)),d.callService("fan","set_percentage",{entity_id:e.entity,percentage:Math.round(s)})}else if("attribute"===e.type&&e.attribute){const t=null!==(n=e.min_value)&&void 0!==n?n:0,i=null!==(r=e.max_value)&&void 0!==r?r:100,o=null!==(l=e.step)&&void 0!==l?l:1;let s=a/100*(i-t)+t;s=Math.round(s/o)*o,s=Math.max(t,Math.min(i,s)),"volume_level"===e.attribute?d.callService("media_player","volume_set",{entity_id:e.entity,volume_level:s/100}):console.warn(`No specific service handler for attribute: ${e.attribute}`)}else"numeric"!==e.type&&e.type||d.callService("fan","set_percentage",{entity_id:e.entity,percentage:Math.round(a)});else if("input_number"===y||"number"===y){const t=null!==(c=e.min_value)&&void 0!==c?c:0,i=null!==(u=e.max_value)&&void 0!==u?u:100,o=a/100*(i-t)+t;d.callService(y,"set_value",{entity_id:e.entity,value:o})}s.haptic_feedback&&"vibrate"in navigator&&navigator.vibrate(10)}catch(e){console.error("Failed to update entity:",e)}}),200)}}
              @mousedown=${oe}
              @mouseup=${ae}
              @touchstart=${oe}
              @touchend=${ae}
              class="${"rgb"===e.type||"color_temp"===e.type?"gradient-slider "+(A?"vertical-gradient-indicator":"horizontal-gradient-indicator"):"fill-slider"}"
              style="
                -webkit-appearance: none;
                appearance: none;
                width: ${A?`${G+re}px`:"100%"};
                height: ${A?ne?"32px":`${Y}px`:"100%"};
                background: transparent;
                outline: none;
                cursor: pointer;
                position: absolute;
                top: ${A?"50%":"0"};
                left: ${A?"50%":"0"};
                z-index: 2;
                ${A?"transform: translateX(-50%) translateY(-50%) rotate(270deg); transform-origin: center center;":""}
              "
            />

            ${ne?o.qy`
                  <div
                    class="slider-indicator ${A?"vertical-indicator":"horizontal-indicator"}"
                    style="${A?`top: ${100-M}%;`:`left: ${M}%`};"
                  ></div>
                `:""}
            ${"overlay"===h?o.qy`
                  ${A?(()=>{var t,i,a,n,l,c;const u=e.icon_position||"center",p=e.name_position||"center",_=e.value_position||"center",v=null===(i=null!==(t=e.auto_contrast)&&void 0!==t?t:s.auto_contrast)||void 0===i||i,g=M>50?"#000":"#fff",h=e.name_color||s.name_color||(v?g:"var(--primary-text-color)"),m=e.value_color||s.value_color||(v?g:"var(--primary-text-color)"),y=e.icon_color||s.icon_color||(v?g:"var(--primary-text-color)"),k=null===(n=null!==(a=e.icon_as_toggle)&&void 0!==a?a:s.icon_as_toggle)||void 0===n||n,z=k?async()=>{try{const t=e.entity.split(".")[0],i="on"===(null==b?void 0:b.state)||"open"===(null==b?void 0:b.state);"light"===t?await d.callService("light",i?"turn_off":"turn_on",{entity_id:e.entity}):"cover"===t?await d.callService("cover",i?"close_cover":"open_cover",{entity_id:e.entity}):"fan"===t?await d.callService("fan",i?"turn_off":"turn_on",{entity_id:e.entity}):"switch"===t&&await d.callService("switch",i?"turn_off":"turn_on",{entity_id:e.entity}),this.localSliderValues.delete(S),this.localSliderValues=new Map(this.localSliderValues)}catch(e){console.error("Failed to toggle entity:",e)}}:void 0,j=[],O=[],F=[],q=x?o.qy`
                              <ha-icon
                                class="uc-slider-icon uc-overlay-info-item"
                                icon="${e.icon||s.icon||r.s.getEntityIcon(b,d)}"
                                style="
                              --mdc-icon-size: ${e.icon_size||s.icon_size||16}px;
                              color: ${y};
                              cursor: ${k?"pointer":"default"};
                              pointer-events: ${k?"auto":"none"};
                            "
                                @click=${z}
                              ></ha-icon>
                            `:null,B=$?o.qy`
                              <div
                                class="uc-slider-name uc-overlay-info-item"
                                style="
                              font-size: ${e.name_size||s.name_size||14}px;
                              color: ${h};
                              font-weight: ${null===(c=null!==(l=e.name_bold)&&void 0!==l?l:s.name_bold)||void 0===c||c?"bold":"normal"};
                              text-align: center;
                              writing-mode: vertical-rl;
                              text-orientation: mixed;
                            "
                              >
                                ${f}
                              </div>
                            `:null,T=w?o.qy`
                              <div
                                class="uc-slider-value uc-overlay-info-item"
                                style="
                              font-size: ${e.value_size||s.value_size||14}px;
                              color: ${m};
                              font-weight: 600;
                              text-align: center;
                            "
                              >
                                ${I}${"brightness"===e.type?e.value_suffix||s.value_suffix||"%":""}
                              </div>
                            `:null;return q&&("top"===u?j.push(q):"bottom"===u?F.push(q):O.push(q)),B&&("top"===p?j.push(B):"bottom"===p?F.push(B):O.push(B)),T&&("top"===_?j.push(T):"bottom"===_?F.push(T):O.push(T)),o.qy`
                          <div
                            class="uc-overlay-info-container"
                            style="
                              position: absolute;
                              left: 50%;
                              transform: translateX(-50%);
                              pointer-events: none;
                              z-index: 3;
                              width: 100%;
                              top: 16px;
                              height: calc(100% - 32px);
                              display: grid;
                              grid-template-rows: auto 1fr auto;
                              justify-items: center;
                            "
                          >
                            <div
                              style="display: flex; flex-direction: column; align-items: center; gap: 4px;"
                            >
                              ${j}
                            </div>
                            <div
                              style="width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;"
                            >
                              ${O}
                            </div>
                            <div
                              style="display: flex; flex-direction: column; align-items: center; gap: 4px;"
                            >
                              ${F}
                            </div>
                          </div>
                        `})():o.qy`
                        <!-- Horizontal Overlay Layout with Individual Element Positioning -->
                        ${(()=>{var t,i,a,n,l,c;const u=e.icon_position||"left",p=e.name_position||"left",_=e.value_position||"right",v=null===(i=null!==(t=e.icon_as_toggle)&&void 0!==t?t:s.icon_as_toggle)||void 0===i||i,g=e.icon_size||s.icon_size||16,h=null===(n=null!==(a=e.auto_contrast)&&void 0!==a?a:s.auto_contrast)||void 0===n||n,m=h?M>50?"#000":"#fff":"",y=v?async()=>{try{const t=e.entity.split(".")[0],i="on"===(null==b?void 0:b.state)||"open"===(null==b?void 0:b.state);"light"===t?await d.callService("light",i?"turn_off":"turn_on",{entity_id:e.entity}):"cover"===t?await d.callService("cover",i?"close_cover":"open_cover",{entity_id:e.entity}):"fan"===t?await d.callService("fan",i?"turn_off":"turn_on",{entity_id:e.entity}):"switch"===t&&await d.callService("switch",i?"turn_off":"turn_on",{entity_id:e.entity}),this.localSliderValues.delete(S),this.localSliderValues=new Map(this.localSliderValues)}catch(e){console.error("Failed to toggle entity:",e)}}:void 0,k=[],z=[],j=[],O=e.icon_color||s.icon_color||(h?m:"var(--primary-text-color)"),F=e.name_color||s.name_color||(h?m:"var(--primary-text-color)"),q=e.value_color||s.value_color||(h?m:"var(--primary-text-color)"),B=x?o.qy`
                                <ha-icon
                                  icon="${e.icon||s.icon||r.s.getEntityIcon(b,d)}"
                                  style="
                                    --mdc-icon-size: ${g}px;
                                    color: ${O};
                                    pointer-events: ${v?"auto":"none"};
                                    cursor: ${v?"pointer":"default"};
                                  "
                                  @click=${y}
                                ></ha-icon>
                              `:null,T=$?o.qy`
                                <div
                                  class="uc-slider-name"
                                  style="
                                    font-size: ${e.name_size||s.name_size||14}px;
                                    color: ${F};
                                    font-weight: ${null===(c=null!==(l=e.name_bold)&&void 0!==l?l:s.name_bold)||void 0===c||c?"bold":"normal"};
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    white-space: nowrap;
                                    max-width: 150px;
                                  "
                                >
                                  ${f}
                                </div>
                              `:null,C=w?o.qy`
                                <div
                                  class="uc-slider-value"
                                  style="
                                    font-size: ${e.value_size||s.value_size||14}px;
                                    color: ${q};
                                    font-weight: 600;
                                  "
                                >
                                  ${I}${"brightness"===e.type?e.value_suffix||s.value_suffix||"%":""}
                                </div>
                              `:null;return B&&("left"===u?k.push(B):"right"===u?j.push(B):z.push(B)),T&&("left"===p?k.push(T):"right"===p?j.push(T):z.push(T)),C&&("left"===_?k.push(C):"right"===_?j.push(C):z.push(C)),o.qy`
                            <div
                              style="position: absolute; inset: 0; pointer-events: none; z-index: 3;"
                            >
                              ${k.length?o.qy`
                                    <div
                                      style="
                                        position: absolute;
                                        left: 8px;
                                        top: 50%;
                                        transform: translateY(-50%);
                                        display: flex;
                                        align-items: center;
                                        gap: 8px;
                                      "
                                    >
                                      ${k}
                                    </div>
                                  `:""}
                              ${z.length?o.qy`
                                    <div
                                      style="
                                        position: absolute;
                                        left: 50%;
                                        top: 50%;
                                        transform: translate(-50%, -50%);
                                        display: flex;
                                        align-items: center;
                                        gap: 8px;
                                      "
                                    >
                                      ${z}
                                    </div>
                                  `:""}
                              ${j.length?o.qy`
                                    <div
                                      style="
                                        position: absolute;
                                        right: 8px;
                                        top: 50%;
                                        transform: translateY(-50%);
                                        display: flex;
                                        align-items: center;
                                        gap: 8px;
                                      "
                                    >
                                      ${j}
                                    </div>
                                  `:""}
                            </div>
                          `})()}
                      `}
                `:""}
          </div>
          </div>
        </div>
      `},$=_.map(((e,t)=>x(e)));let w;if("outside"===h){const e=_.map(((e,t)=>{var i,a,n,l,c,u,p,_,v,g,y,f,$;const w=null===(i=null==d?void 0:d.states)||void 0===i?void 0:i[e.entity],k=e.name||(null==w?void 0:w.attributes.friendly_name)||e.entity;let I="0";if(w)switch(e.type){case"brightness":{const e=w.attributes.brightness||0;I=`${Math.round(e/255*100)}`;break}case"rgb":{const e=w.attributes.rgb_color||[255,255,255];I=`rgb(${e[0]}, ${e[1]}, ${e[2]})`;break}case"color_temp":{const e=w.attributes.color_temp||154;I=`${Math.round(1e6/e)}K`;break}case"red":case"green":case"blue":I=`${(w.attributes.rgb_color||[255,255,255])["red"===e.type?0:"green"===e.type?1:2]}`;break;case"attribute":if(e.attribute&&void 0!==w.attributes[e.attribute]){const t=parseFloat(w.attributes[e.attribute])||0;I=`${Math.round(t)}`,"percentage"===e.attribute&&(I+="%")}else I="0";break;default:I=`${w.state}`}const z=x(e),S=(!1!==e.show_icon&&s.show_icon,e.icon_size||s.icon_size||16);if(b){const t=e.icon_position||"left_top",i=e.name_position||"left_top",_=e.value_position||"left_bottom",v=!1!==e.show_icon&&!1!==s.show_icon,g=!1!==e.show_name&&!1!==s.show_name,b=!1!==e.show_value&&!1!==s.show_value,y={left_top:[],left_center:[],left_bottom:[],right_top:[],right_center:[],right_bottom:[]},f=null===(n=null!==(a=e.icon_as_toggle)&&void 0!==a?a:s.icon_as_toggle)||void 0===n||n,x=`${e.entity}-${e.type}`,$=f?async()=>{try{const t=e.entity.split(".")[0],i="on"===(null==w?void 0:w.state)||"open"===(null==w?void 0:w.state);"light"===t?await d.callService("light",i?"turn_off":"turn_on",{entity_id:e.entity}):"cover"===t?await d.callService("cover",i?"close_cover":"open_cover",{entity_id:e.entity}):"fan"===t&&await d.callService("fan",i?"turn_off":"turn_on",{entity_id:e.entity}),this.localSliderValues.delete(x),this.localSliderValues=new Map(this.localSliderValues)}catch(e){console.error("Failed to toggle entity:",e)}}:void 0,j=e.icon_color||s.icon_color||((null===(c=null!==(l=e.dynamic_icon)&&void 0!==l?l:s.dynamic_icon)||void 0===c||c)&&(null==w?void 0:w.attributes.rgb_color)?`rgb(${w.attributes.rgb_color.join(",")})`:"var(--secondary-text-color)"),O=v?o.qy`
                <ha-icon
                  icon="${r.s.getEntityIcon(w,d)}"
                  style="
                --mdc-icon-size: ${S}px;
                color: ${j};
                cursor: ${f?"pointer":"default"};
                pointer-events: ${f?"auto":"none"};
              "
                  @click=${$}
                ></ha-icon>
              `:null,M=g?o.qy`
                <div
                  class="uc-slider-name"
                  style="
                writing-mode: vertical-rl;
                text-orientation: mixed;
                font-size: ${e.name_size||s.name_size||16}px;
                color: ${e.name_color||s.name_color||"var(--primary-text-color)"};
                font-weight: ${null===(p=null!==(u=e.name_bold)&&void 0!==u?u:s.name_bold)||void 0===p||p?"500":"normal"};
              "
                >
                  ${k}
                </div>
              `:null,F=b?o.qy`
                <div
                  class="uc-slider-value"
                  style="
                writing-mode: vertical-rl;
                text-orientation: mixed;
                font-size: ${e.value_size||s.value_size||14}px;
                color: ${e.value_color||s.value_color||"var(--secondary-text-color)"};
              "
                >
                  ${I}${"brightness"===e.type?e.value_suffix||s.value_suffix||"%":""}
                </div>
              `:null;O&&y[t]&&y[t].push(O),M&&y[i]&&y[i].push(M),F&&y[_]&&y[_].push(F);const q=y.left_top.length+y.left_center.length+y.left_bottom.length>0,B=y.right_top.length+y.right_center.length+y.right_bottom.length>0,T=m,C=e=>{const t=y[`${e}_top`],i=y[`${e}_center`],a=y[`${e}_bottom`];return t.length+i.length+a.length>0?o.qy`
              <div
                style="display: flex; flex-direction: column; height: ${T}px; justify-content: space-between;"
              >
                <div style="display: flex; flex-direction: column; gap: 4px; align-items: center;">
                  ${t}
                </div>
                <div
                  style="display: flex; flex-direction: column; gap: 4px; align-items: center; justify-content: center; flex: 1;"
                >
                  ${i}
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px; align-items: center;">
                  ${a}
                </div>
              </div>
            `:o.qy``};return o.qy`
            <div
              class="uc-slider-item uc-layout-${h} uc-orientation-vertical uc-bar-type-${e.type}"
              style="display: flex; align-items: flex-start; justify-content: center; gap: 8px; height: ${m}px;"
            >
              ${q?C("left"):""}
              <div
                style="height: ${T}px; display: flex; align-items: center; justify-content: center;"
              >
                ${z}
              </div>
              ${B?C("right"):""}
            </div>
          `}{const t=e.icon_position||"top_left",i=e.name_position||"top_left",a=e.value_position||"top_right",n=!1!==e.show_icon&&!1!==s.show_icon,l=!1!==e.show_name&&!1!==s.show_name,c=!1!==e.show_value&&!1!==s.show_value,u={top_left:[],top_center:[],top_right:[],bottom_left:[],bottom_center:[],bottom_right:[]},p=null===(v=null!==(_=e.icon_as_toggle)&&void 0!==_?_:s.icon_as_toggle)||void 0===v||v,b=`${e.entity}-${e.type}`,m=p?async()=>{try{const t=e.entity.split(".")[0],i="on"===(null==w?void 0:w.state)||"open"===(null==w?void 0:w.state);"light"===t?await d.callService("light",i?"turn_off":"turn_on",{entity_id:e.entity}):"cover"===t?await d.callService("cover",i?"close_cover":"open_cover",{entity_id:e.entity}):"fan"===t&&await d.callService("fan",i?"turn_off":"turn_on",{entity_id:e.entity}),this.localSliderValues.delete(b),this.localSliderValues=new Map(this.localSliderValues)}catch(e){console.error("Failed to toggle entity:",e)}}:void 0,x=e.icon_color||s.icon_color||((null===(y=null!==(g=e.dynamic_icon)&&void 0!==g?g:s.dynamic_icon)||void 0===y||y)&&(null==w?void 0:w.attributes.rgb_color)?`rgb(${w.attributes.rgb_color.join(",")})`:"var(--secondary-text-color)"),S=n?o.qy`
                <ha-icon
                  icon="${r.s.getEntityIcon(w,d)}"
                  style="
                --mdc-icon-size: ${e.icon_size||s.icon_size||16}px;
                color: ${x};
                cursor: ${p?"pointer":"default"};
                pointer-events: ${p?"auto":"none"};
              "
                  @click=${m}
                ></ha-icon>
              `:null,j=l?o.qy`
                <div
                  class="uc-slider-name"
                  style="
                font-size: ${e.name_size||s.name_size||14}px;
                color: ${e.name_color||s.name_color||"var(--secondary-text-color)"};
                font-weight: ${null===($=null!==(f=e.name_bold)&&void 0!==f?f:s.name_bold)||void 0===$||$?"600":"normal"};
                line-height: 1;
              "
                >
                  ${k}
                </div>
              `:null,O=c?o.qy`
                <div
                  class="uc-slider-value"
                  style="
                font-size: ${e.value_size||s.value_size||14}px;
                color: ${e.value_color||s.value_color||"var(--secondary-text-color)"};
                font-weight: 600;
              "
                >
                  ${I}${"brightness"===e.type?e.value_suffix||s.value_suffix||"%":""}
                </div>
              `:null;S&&u[t]&&u[t].push(S),j&&u[i]&&u[i].push(j),O&&u[a]&&u[a].push(O);const M=u.top_left.length+u.top_center.length+u.top_right.length>0,F=u.bottom_left.length+u.bottom_center.length+u.bottom_right.length>0,q=e=>{const t=u[`${e}_left`],i=u[`${e}_center`],a=u[`${e}_right`];return t.length+i.length+a.length>0?o.qy`
              <div
                style="display: flex; justify-content: space-between; align-items: center; width: 100%; ${"top"===e?"margin-bottom: 4px;":"margin-top: 4px;"}"
              >
                <div style="display: flex; align-items: center; gap: 8px;">${t}</div>
                <div style="display: flex; align-items: center; gap: 8px;">${i}</div>
                <div style="display: flex; align-items: center; gap: 8px;">${a}</div>
              </div>
            `:o.qy``},B=o.qy`
            ${M?q("top"):""}
            ${F?q("bottom"):""}
          `;return o.qy`
            <div
              class="uc-slider-item uc-layout-${h} uc-orientation-horizontal uc-bar-type-${e.type}"
            >
              ${B}${z}
            </div>
          `}}));w=o.qy`
        <div
          class="${y}"
          style="display: flex; flex-direction: ${b?"row":"column"}; width: 100%; gap: ${g}px; align-items: ${b?"flex-start":"stretch"};"
        >
          ${e}
        </div>
      `}else if("overlay"===h)w=o.qy`
        <div
          class="${y}"
          style="position: relative; ${b?"display: flex; flex-direction: column; align-items: center; justify-content: center;":""}"
        >
          <div
            class="uc-slider-items"
            style="display: flex; ${b?"flex-direction: row; gap: "+g+"px; justify-content: center; align-items: center;":"flex-direction: column; gap: "+g+"px;"} width: 100%;"
          >
            ${$}
          </div>
        </div>
      `;else{s.split_bar_position;const e=null!==(n=s.split_bar_length)&&void 0!==n?n:60,t=_.map(((t,i)=>{var a,n;const l=null===(a=null==d?void 0:d.states)||void 0===a?void 0:a[t.entity],c=t.name||(null==l?void 0:l.attributes.friendly_name)||t.entity,u=t.info_section_position||(b?"top":"left"),p=b?"bottom"===u?"left":"right":"right"===u?"left":"right",_=null!==(n=t.split_bar_length)&&void 0!==n?n:e,v=!1!==t.show_icon&&!1!==s.show_icon,g=!1!==t.show_name&&!1!==s.show_name,m=!1!==t.show_value&&!1!==s.show_value,y=b?100===_?"min-height: 200px; height: 100%;":`height: ${_}%; min-height: ${Math.floor(200*_/100)}px;`:`width: ${_}%;`,$=b?`height: ${100-_}%;`:`width: ${100-_}%;`,w=_<100;let k="0";if(l)switch(t.type){case"brightness":{const e=l.attributes.brightness||0;k=`${Math.round(e/255*100)}`;break}case"rgb":{const e=l.attributes.rgb_color||[255,255,255];k=`rgb(${e[0]}, ${e[1]}, ${e[2]})`;break}case"color_temp":{const e=l.attributes.color_temp||154;k=`${Math.round(1e6/e)}K`;break}case"red":case"green":case"blue":{const e=l.attributes.rgb_color||[255,255,255],i="red"===t.type?0:"green"===t.type?1:2;k=`${e[i]}`;break}case"attribute":if(t.attribute&&void 0!==l.attributes[t.attribute]){const e=parseFloat(l.attributes[t.attribute])||0;k=`${Math.round(e)}`,"percentage"===t.attribute&&(k+="%")}else k="0";break;default:k=`${l.state}`}const I=x(t),z=`uc-slider-item uc-layout-${h} ${b?"uc-orientation-vertical":"uc-orientation-horizontal"} uc-bar-type-${t.type}`,S=f&&b?"stretch":"center",j=()=>{var e,i,a,n,u,p;if(!w)return o.qy``;const _=null===(i=null!==(e=t.icon_as_toggle)&&void 0!==e?e:s.icon_as_toggle)||void 0===i||i,h=`${t.entity}-${t.type}`,y=_?async()=>{try{const e=t.entity.split(".")[0],i="on"===(null==l?void 0:l.state)||"open"===(null==l?void 0:l.state);"light"===e?await d.callService("light",i?"turn_off":"turn_on",{entity_id:t.entity}):"cover"===e?await d.callService("cover",i?"close_cover":"open_cover",{entity_id:t.entity}):"fan"===e&&await d.callService("fan",i?"turn_off":"turn_on",{entity_id:t.entity}),this.localSliderValues.delete(h),this.localSliderValues=new Map(this.localSliderValues)}catch(e){console.error("Failed to toggle entity:",e)}}:void 0,f=[],x=t.icon_color||s.icon_color||((null===(n=null!==(a=t.dynamic_icon)&&void 0!==a?a:s.dynamic_icon)||void 0===n||n)&&(null==l?void 0:l.attributes.rgb_color)?`rgb(${l.attributes.rgb_color.join(",")})`:"var(--primary-text-color)");return v&&f.push(o.qy`
              <ha-icon
                icon="${r.s.getEntityIcon(l,d)}"
                style="
                  --mdc-icon-size: ${t.icon_size||s.icon_size||16}px;
                  color: ${x};
                  cursor: ${_?"pointer":"default"};
                  pointer-events: ${_?"auto":"none"};
                "
                @click=${y}
              ></ha-icon>
            `),g&&f.push(o.qy`
              <div
                class="uc-slider-name"
                style="
                  font-size: ${t.name_size||s.name_size||16}px;
                  color: ${t.name_color||s.name_color||"var(--primary-text-color)"};
                  font-weight: ${null===(p=null!==(u=t.name_bold)&&void 0!==u?u:s.name_bold)||void 0===p||p?"500":"normal"};
                "
              >
                ${c}
              </div>
            `),m&&f.push(o.qy`
              <div
                class="uc-slider-value"
                style="
                  font-size: ${t.value_size||s.value_size||14}px;
                  color: ${t.value_color||s.value_color||"var(--secondary-text-color)"};
                "
              >
                ${k}${"brightness"===t.type?t.value_suffix||s.value_suffix||"%":""}
              </div>
            `),o.qy`
            <div
              class="uc-slider-info"
              style="${$} display: flex; align-items: center; justify-content: center; ${b?"flex-direction: column; text-align: center;":"flex-direction: row;"} gap: 8px;"
            >
              ${f}
            </div>
          `};return o.qy`
          <div
            class="${z}"
            style="display: flex; align-items: ${S}; ${b?"flex-direction: column; height: 100%;":"width: 100%;"}"
          >
            ${"left"===p?o.qy`
                  ${j()}
                  <div
                    class="uc-slider-track-wrapper"
                    style="${y} ${b?"display: flex; justify-content: center; align-items: stretch;":""}"
                  >
                    ${I}
                  </div>
                `:o.qy`
                  <div
                    class="uc-slider-track-wrapper"
                    style="${y} ${b?"display: flex; justify-content: center; align-items: stretch;":""}"
                  >
                    ${I}
                  </div>
                  ${j()}
                `}
          </div>
        `}));w=o.qy`
        <div
          class="${y}"
          style="display: flex; flex-direction: ${b?"row":"column"}; width: 100%; ${b?"height: 100%;":""} gap: ${g}px; align-items: ${"stretch"}; justify-content: ${b?"center":"stretch"};"
        >
          ${t}
        </div>
      `}const k=(null===(l=s.design)||void 0===l?void 0:l.background_color)||s.background_color||"",I=k?`background: ${k};`:"",z=_.some((e=>"neon-glow"===(e.slider_style||s.slider_style||"flat")))?"overflow: visible;":f?"overflow: hidden;":"";return o.qy`
      <div
        class="slider-control-container ${y}"
        style="padding: 16px; position: relative; ${I} ${b?"display: flex; justify-content: center; align-items: center; min-height: 200px;":""} ${z}"
      >
        ${p}
        <style>
          .slider-control-container input[type='range']::-webkit-slider-track {
            background: transparent;
            height: 100%;
          }
          .slider-control-container input[type='range']::-moz-range-track {
            background: transparent;
            height: 100%;
          }

          /* Fill sliders (brightness, numeric) - no thumb, just fill/empty cut line */
          .slider-control-container input.fill-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 0;
            height: 0;
            background: transparent;
            border: none;
            cursor: pointer;
          }
          .slider-control-container input.fill-slider::-moz-range-thumb {
            width: 0;
            height: 0;
            background: transparent;
            border: none;
            cursor: pointer;
          }

          /* Gradient slider thumb styling */
          .slider-control-container
            .slider-track-container
            input.gradient-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 1px;
            height: var(--slider-height, 55px);
            border: none;
            background: transparent;
            cursor: pointer;
            margin: 0;
            opacity: 0;
          }
          .slider-control-container
            .slider-track-container
            input.gradient-slider::-moz-range-thumb {
            width: 1px;
            height: var(--slider-height, 55px);
            border: none;
            background: transparent;
            cursor: pointer;
            margin: 0;
            opacity: 0;
          }

          .slider-control-container .slider-track-container .slider-indicator {
            position: absolute;
            background: rgba(0, 0, 0, 0.3);
            border: 2px solid #ffffff;
            border-radius: 4px;
            box-shadow:
              0 0 8px rgba(0, 0, 0, 0.5),
              inset 0 0 3px rgba(255, 255, 255, 0.2);
            pointer-events: none;
            will-change: top, left;
            transition:
              top 80ms ease-out,
              left 80ms ease-out;
            z-index: 3;
          }
          .slider-control-container .slider-track-container .slider-indicator.horizontal-indicator {
            width: 8px;
            height: var(--slider-height, 55px);
            top: 50%;
            transform: translate(-50%, -50%);
          }
          .slider-control-container .slider-track-container .slider-indicator.vertical-indicator {
            height: 8px;
            width: var(--slider-height, 55px);
            left: 50%;
            transform: translate(-50%, -50%);
          }
        </style>

        ${w}
      </div>
    `}resolveDynamicFillColor(e,t,i){if(!t||!t.attributes)return i;const o=t.attributes;if(Array.isArray(o.rgb_color)&&3===o.rgb_color.length){const[e,t,i]=o.rgb_color;return`rgb(${e}, ${t}, ${i})`}if(Array.isArray(o.hs_color)&&o.hs_color.length>=2){const[e,t]=o.hs_color,i=this.hsvToRgb((null!=e?e:0)%360/360,Math.max(0,Math.min(100,null!=t?t:100))/100,1);return`rgb(${i[0]}, ${i[1]}, ${i[2]})`}if("number"==typeof o.color_temp&&o.color_temp>0){const e=Math.max(1e3,Math.min(4e4,Math.round(1e6/o.color_temp))),[t,i,a]=this.colorTemperatureToRGB(e);return`rgb(${t}, ${i}, ${a})`}return"string"==typeof o.color&&o.color.trim()?o.color:i}rgbToHue(e,t,i){const o=e/255,a=t/255,n=i/255,r=Math.max(o,a,n),l=r-Math.min(o,a,n);if(0===l)return 0;let s=0;return s=r===o?(a-n)/l%6/6:r===a?((n-o)/l+2)/6:((o-a)/l+4)/6,s<0&&(s+=1),s>1&&(s-=1),100*s}hsvToRgb(e,t,i){const o=i*t,a=o*(1-Math.abs(6*e%2-1)),n=i-o;let r=0,l=0,s=0;return e<1/6?(r=o,l=a,s=0):e<2/6?(r=a,l=o,s=0):e<.5?(r=0,l=o,s=a):e<4/6?(r=0,l=a,s=o):e<5/6?(r=a,l=0,s=o):(r=o,l=0,s=a),[Math.round(255*(r+n)),Math.round(255*(l+n)),Math.round(255*(s+n))]}extractRgbFromColor(e){if(e.startsWith("#")){const t=e.substring(1);if(3===t.length)return[parseInt(t[0]+t[0],16),parseInt(t[1]+t[1],16),parseInt(t[2]+t[2],16)];if(6===t.length)return[parseInt(t.substring(0,2),16),parseInt(t.substring(2,4),16),parseInt(t.substring(4,6),16)]}const t=e.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);if(t)return[parseInt(t[1]),parseInt(t[2]),parseInt(t[3])];const i=e.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);if(i)return[parseInt(i[1]),parseInt(i[2]),parseInt(i[3])];if(e.includes("gradient")){const t=e.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);if(t)return[parseInt(t[1]),parseInt(t[2]),parseInt(t[3])];const i=e.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/);if(i){const e=i[1];return 3===e.length?[parseInt(e[0]+e[0],16),parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16)]:[parseInt(e.substring(0,2),16),parseInt(e.substring(2,4),16),parseInt(e.substring(4,6),16)]}}return[33,150,243]}colorTemperatureToRGB(e){const t=e/100;let i,o,a;t<=66?(i=255,o=99.4708025861*Math.log(Math.max(1,t))-161.1195681661,a=t<=19?0:138.5177312231*Math.log(Math.max(1,t-10))-305.0447927307):(i=329.698727446*Math.pow(t-60,-.1332047592),o=288.1221695283*Math.pow(t-60,-.0755148492),a=255);const n=e=>Math.max(0,Math.min(255,Math.round(e)));return[n(i),n(o),n(a)]}validate(e){const t=e,i=[...super.validate(e).errors];return t.bars&&t.bars.length>0&&t.bars.forEach(((e,t)=>{e.entity&&""!==e.entity.trim()&&void 0!==e.min_value&&void 0!==e.max_value&&e.min_value>=e.max_value&&i.push(`Bar ${t+1}: Min value must be less than max value`)})),t.slider_height&&(t.slider_height<20||t.slider_height>200)&&i.push("Slider height must be between 20 and 200 pixels"),{valid:0===i.length,errors:i}}getStyles(){return`\n      ${a.m.getSliderStyles()}\n      /* Placeholder for styles */\n    `}}}}]);