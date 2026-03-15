"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[3949],{3949:(i,t,e)=>{e.r(t),e.d(t,{UltraAnimatedWeatherModule:()=>s});var o=e(5183),n=e(7475),r=(e(7921),e(8869));const a={location:{id:"location",label:"Location",icon:"mdi:map-marker",column:"left"},condition:{id:"condition",label:"Condition",icon:"mdi:weather-partly-cloudy",column:"left"},custom_entity:{id:"custom_entity",label:"Custom Entity",icon:"mdi:plus-circle",column:"left"},precipitation:{id:"precipitation",label:"Precipitation",icon:"mdi:weather-pouring",column:"left"},precipitation_probability:{id:"precipitation_probability",label:"Precipitation Probability",icon:"mdi:weather-rainy",column:"left"},wind:{id:"wind",label:"Wind",icon:"mdi:weather-windy",column:"left"},pressure:{id:"pressure",label:"Pressure",icon:"mdi:gauge",column:"left"},visibility:{id:"visibility",label:"Visibility",icon:"mdi:eye",column:"left"},date:{id:"date",label:"Date",icon:"mdi:calendar",column:"right"},temperature:{id:"temperature",label:"Temperature",icon:"mdi:thermometer",column:"right"},temp_range:{id:"temp_range",label:"High/Low",icon:"mdi:thermometer-lines",column:"right"}},l={};function d(i,t,e,r,d){var c,s,u,p,m,g,_,v,h,y,b,w,f,x;const $=t,z=(null===(c=e.locale)||void 0===c||c.language,$.weather_entity?e.states[$.weather_entity]:null),k=void 0!==(null===(s=null==z?void 0:z.attributes)||void 0===s?void 0:s.precipitation)&&null!==(null===(u=null==z?void 0:z.attributes)||void 0===u?void 0:u.precipitation),S=void 0!==(null===(p=null==z?void 0:z.attributes)||void 0===p?void 0:p.precipitation_probability)&&null!==(null===(m=null==z?void 0:z.attributes)||void 0===m?void 0:m.precipitation_probability),C=void 0!==(null===(g=null==z?void 0:z.attributes)||void 0===g?void 0:g.wind_speed)||void 0!==(null===(_=null==z?void 0:z.attributes)||void 0===_?void 0:_.wind_bearing),P=void 0!==(null===(v=null==z?void 0:z.attributes)||void 0===v?void 0:v.pressure)&&null!==(null===(h=null==z?void 0:z.attributes)||void 0===h?void 0:h.pressure),E=void 0!==(null===(y=null==z?void 0:z.attributes)||void 0===y?void 0:y.visibility)&&null!==(null===(b=null==z?void 0:z.attributes)||void 0===b?void 0:b.visibility),W=i=>{if("left"===i){const i=["location","condition"];return $.custom_entity&&i.push("custom_entity"),k&&i.push("precipitation"),S&&i.push("precipitation_probability"),C&&i.push("wind"),P&&i.push("pressure"),E&&i.push("visibility"),i}return["date","temperature","temp_range"]},q=$.left_column_order||W("left"),D=$.right_column_order||W("right");let I=null;const T=$.id||"default",U=()=>l[T]||null,j=i=>{i.target.style.opacity="",I=null,document.querySelectorAll(".drop-zone-active").forEach((i=>i.classList.remove("drop-zone-active")))},L=i=>{i.preventDefault(),i.dataTransfer&&(i.dataTransfer.dropEffect="move")},F=i=>{i.currentTarget.classList.add("drop-zone-active")},A=i=>{i.currentTarget.classList.remove("drop-zone-active")},N=(t,n,r)=>{const c=a[t];if(!c)return o.qy``;if("precipitation"===t&&!k)return o.qy``;if("precipitation_probability"===t&&!S)return o.qy``;if("wind"===t&&!C)return o.qy``;if("pressure"===t&&!P)return o.qy``;if("visibility"===t&&!E)return o.qy``;const s=`${t}_size`,u=`${t}_color`,p=!1!==$[`show_${t}`],m=U()===t;return o.qy`
      <div
        class="accordion-item"
        draggable="true"
        @dragstart=${i=>((i,t,e,o)=>{I={itemId:t,fromColumn:e,fromIndex:o},i.dataTransfer&&(i.dataTransfer.effectAllowed="move",i.dataTransfer.setData("text/plain",t)),i.target.style.opacity="0.4"})(i,t,n,r)}
        @dragend=${j}
        @dragover=${L}
        @dragenter=${F}
        @dragleave=${A}
        @drop=${t=>((t,e,o)=>{if(t.preventDefault(),t.currentTarget.classList.remove("drop-zone-active"),!I)return;const{itemId:n,fromColumn:r,fromIndex:a}=I;let l=[...q],c=[...D];"left"===r?l.splice(a,1):c.splice(a,1),"left"===e?l.splice(o,0,n):c.splice(o,0,n),d({left_column_order:l,right_column_order:c}),setTimeout((()=>i.triggerPreviewUpdate()),50)})(t,n,r)}
      >
        <div class="accordion-header ${m?"expanded":""}">
          <ha-icon icon="mdi:drag" class="drag-handle"></ha-icon>
          <ha-icon icon="${c.icon}" class="item-icon"></ha-icon>
          <span class="item-label">${c.label}</span>
          <ha-icon
            icon="${p?"mdi:eye":"mdi:eye-off"}"
            class="visibility-toggle ${p?"visible":"hidden"}"
            @click=${e=>{e.stopPropagation(),(t=>{const e=`show_${t}`,o=$[e];d({[e]:!1===o}),setTimeout((()=>i.triggerPreviewUpdate()),50)})(t)}}
          ></ha-icon>
          <ha-icon
            icon="mdi:chevron-${m?"up":"down"}"
            class="expand-toggle"
            @click=${i=>{i.stopPropagation(),(i=>{l[T]=i})(U()===t?null:t),d({})}}
          ></ha-icon>
        </div>

        ${m?o.qy`
              <div class="accordion-content">
                <!-- Size Control -->
                <div class="control-row">
                  ${i.renderSliderField("Size","",$[s]||("left"===n?14:16),"left"===n?14:16,0,128,1,(i=>d({[s]:i})),"px")}
                </div>

                <!-- Color Control -->
                <div class="control-row">
                  <div class="control-label">Color</div>
                  <ultra-color-picker
                    .value="${$[u]||"var(--primary-text-color)"}"
                    .hass="${e}"
                    @value-changed=${t=>{d({[u]:t.detail.value}),setTimeout((()=>i.triggerPreviewUpdate()),50)}}
                  ></ultra-color-picker>
                </div>
              </div>
            `:""}
      </div>
    `};return o.qy`
    ${i.injectUcFormStyles()}
    <style>
      ${n.m.getSliderStyles()}
      .weather-editor-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 16px;
      }

      .entity-config-section {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 16px;
      }

      .section-title {
        font-size: 18px;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--primary-color);
        margin-bottom: 16px;
        letter-spacing: 0.5px;
      }

      .section-description {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 16px;
        line-height: 1.4;
      }

      .columns-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-top: 24px;
      }

      .column {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 16px;
        min-height: 200px;
      }

      .column-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-color);
        margin-bottom: 12px;
        text-transform: uppercase;
      }

      .accordion-item {
        background: var(--primary-background-color);
        border-radius: 6px;
        margin-bottom: 8px;
        cursor: move;
        border: 2px solid transparent;
        transition: all 0.2s;
      }

      .accordion-item.drop-zone-active {
        border-color: var(--primary-color);
        background: var(--primary-color);
        opacity: 0.3;
      }

      .accordion-header {
        display: flex;
        align-items: center;
        padding: 12px;
        gap: 8px;
        cursor: pointer;
      }

      .drag-handle {
        --mdc-icon-size: 20px;
        color: var(--secondary-text-color);
        cursor: grab;
      }

      .drag-handle:active {
        cursor: grabbing;
      }

      .item-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      .item-label {
        flex: 1;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .visibility-toggle {
        --mdc-icon-size: 20px;
        cursor: pointer;
        transition: color 0.2s;
      }

      .visibility-toggle.visible {
        color: var(--primary-color);
      }

      .visibility-toggle.hidden {
        color: var(--disabled-text-color);
      }

      .expand-toggle {
        --mdc-icon-size: 20px;
        color: var(--secondary-text-color);
        transition: transform 0.2s;
      }

      .accordion-header.expanded .expand-toggle {
        transform: rotate(180deg);
      }

      .accordion-content {
        padding: 0 12px 12px 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .control-row {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .control-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }

      @media (max-width: 768px) {
        .columns-container {
          grid-template-columns: 1fr;
        }
      }
    </style>

    <div class="weather-editor-container">
      <!-- Entity Configuration -->
      <div class="entity-config-section">
        <div class="section-title">Weather Entity</div>
        ${i.renderUcForm(e,{weather_entity:$.weather_entity||""},[i.entityField("weather_entity",["weather"])],(i=>d(i.detail.value)),!1)}
      </div>

      <!-- General Settings -->
      <div class="entity-config-section">
        <div class="section-title">Layout Settings</div>
        
        <!-- Layout Spread -->
        ${i.renderSliderField("Layout Spread","0% Compact Centered ↔ 100% Full-Width Spread",null!==(w=$.layout_spread)&&void 0!==w?w:100,100,0,100,1,(i=>d({layout_spread:i})),"%")}

        ${i.renderSliderField("Left Column Vertical Gap","0-32px",null!==(f=$.left_column_gap)&&void 0!==f?f:8,8,0,32,1,(i=>d({left_column_gap:i})),"px")}

        ${i.renderSliderField("Right Column Vertical Gap","0-32px",null!==(x=$.right_column_gap)&&void 0!==x?x:8,8,0,32,1,(i=>d({right_column_gap:i})),"px")}
      </div>

      <!-- Center Column Settings -->
      <div class="entity-config-section">
        <div class="section-title">Center Column (Weather Icon)</div>
        
        ${i.renderSliderField("Icon Size","0-300px",$.main_icon_size||120,120,0,300,10,(i=>d({main_icon_size:i})),"px")}

        <div class="control-row">
          <div class="control-label">Icon Style</div>
          ${i.renderUcForm(e,{icon_style:$.icon_style||"fill"},[i.selectField("icon_style",[{value:"fill",label:"Filled"},{value:"line",label:"Outlined"}])],(t=>{t.detail.value.icon_style!==$.icon_style&&(d(t.detail.value),setTimeout((()=>i.triggerPreviewUpdate()),50))}),!1)}
        </div>
      </div>

      <!-- Column Layout Editor -->
      <div class="entity-config-section" style="padding-bottom: 0;">
        <div class="section-title">Drag & Drop Column Items</div>
        <div class="section-description">
          Drag items to reorder them within or between columns. Click the eye icon to toggle visibility. Click the chevron to expand item settings.
        </div>
      </div>

      <div class="columns-container">
        <!-- Left Column -->
        <div class="column">
          <div class="column-title">Left Column</div>
          ${q.map(((i,t)=>N(i,"left",t)))}
        </div>

        <!-- Right Column -->
        <div class="column">
          <div class="column-title">Right Column</div>
          ${D.map(((i,t)=>N(i,"right",t)))}
        </div>
      </div>
    </div>
  `}var c=e(9760);class s extends n.m{constructor(){super(...arguments),this.metadata={type:"animated_weather",title:"Animated Weather",description:"Current weather display with animated icons",author:"WJD Designs",version:"1.0.0",icon:"mdi:weather-partly-cloudy",category:"content",tags:["weather","current","pro","premium","animated"]}}createDefault(i,t){const e=this._findWeatherEntity(t);return{id:i||this.generateId("animated_weather"),type:"animated_weather",weather_entity:e,temperature_entity:"",condition_entity:"",custom_entity:"",custom_entity_name:"",show_left_column:!0,show_center_column:!0,show_right_column:!0,layout_spread:100,left_column_gap:8,right_column_gap:8,location_override_mode:"text",location_name:"",location_entity:"",show_location:!0,show_condition:!0,show_custom_entity:!0,show_precipitation:!1,show_precipitation_probability:!1,show_wind:!1,show_pressure:!1,show_visibility:!1,show_date:!0,show_temperature:!0,show_temp_range:!0,location_size:16,condition_size:24,custom_entity_size:18,precipitation_size:14,wind_size:14,pressure_size:14,visibility_size:14,location_color:"var(--primary-text-color)",condition_color:"var(--primary-text-color)",custom_entity_color:"var(--primary-text-color)",precipitation_color:"var(--primary-text-color)",wind_color:"var(--primary-text-color)",pressure_color:"var(--primary-text-color)",visibility_color:"var(--primary-text-color)",main_icon_size:120,icon_style:"fill",date_size:16,temperature_size:64,temp_range_size:18,date_color:"var(--primary-text-color)",temperature_color:"var(--primary-text-color)",temp_range_color:"var(--primary-text-color)",module_background:"transparent",module_border:"transparent",tap_action:void 0,hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}_findWeatherEntity(i){if(!i)return"";const t=Object.keys(i.states).filter((i=>i.startsWith("weather.")));return t.length>0?t[0]:""}_getDefaultColumnOrder(i,t){var e,o,n,r,a,l,d,c,s,u;const p=i.weather_entity?null==t?void 0:t.states[i.weather_entity]:null,m=void 0!==(null===(e=null==p?void 0:p.attributes)||void 0===e?void 0:e.precipitation)&&null!==(null===(o=null==p?void 0:p.attributes)||void 0===o?void 0:o.precipitation),g=void 0!==(null===(n=null==p?void 0:p.attributes)||void 0===n?void 0:n.precipitation_probability)&&null!==(null===(r=null==p?void 0:p.attributes)||void 0===r?void 0:r.precipitation_probability),_=void 0!==(null===(a=null==p?void 0:p.attributes)||void 0===a?void 0:a.wind_speed)||void 0!==(null===(l=null==p?void 0:p.attributes)||void 0===l?void 0:l.wind_bearing),v=void 0!==(null===(d=null==p?void 0:p.attributes)||void 0===d?void 0:d.pressure)&&null!==(null===(c=null==p?void 0:p.attributes)||void 0===c?void 0:c.pressure),h=void 0!==(null===(s=null==p?void 0:p.attributes)||void 0===s?void 0:s.visibility)&&null!==(null===(u=null==p?void 0:p.attributes)||void 0===u?void 0:u.visibility),y=[];return y.push("location"),y.push("condition"),i.custom_entity&&y.push("custom_entity"),m&&y.push("precipitation"),g&&y.push("precipitation_probability"),_&&y.push("wind"),v&&y.push("pressure"),h&&y.push("visibility"),{left:y,right:["date","temperature","temp_range"]}}renderGeneralTab(i,t,e,o){return d(this,i,t,0,o)}renderPreview(i,t,e,n){var a,l,d,s,u;const p=i,m=p,g=p.design||{},_={color:p.color||g.color,background_color:p.background_color||g.background_color,background_image:p.background_image||g.background_image,background_image_type:p.background_image_type||g.background_image_type,background_image_entity:p.background_image_entity||g.background_image_entity,background_image_upload:p.background_image_upload||g.background_image_upload,background_image_url:p.background_image_url||g.background_image_url,background_size:p.background_size||g.background_size,background_position:p.background_position||g.background_position,background_repeat:p.background_repeat||g.background_repeat,padding_top:void 0!==g.padding_top?g.padding_top:p.padding_top,padding_bottom:void 0!==g.padding_bottom?g.padding_bottom:p.padding_bottom,padding_left:void 0!==g.padding_left?g.padding_left:p.padding_left,padding_right:void 0!==g.padding_right?g.padding_right:p.padding_right,margin_top:void 0!==g.margin_top?g.margin_top:p.margin_top,margin_bottom:void 0!==g.margin_bottom?g.margin_bottom:p.margin_bottom,margin_left:void 0!==g.margin_left?g.margin_left:p.margin_left,margin_right:void 0!==g.margin_right?g.margin_right:p.margin_right,border_radius:p.border_radius||g.border_radius,border_style:p.border_style||g.border_style,border_width:p.border_width||g.border_width,border_color:p.border_color||g.border_color},v=this._getWeatherData(t,p),h=(new Date).toLocaleDateString((null===(a=t.locale)||void 0===a?void 0:a.language)||"en",{weekday:"long",month:"long",day:"numeric"}),y=(v.temperatureUnit,Math.round(v.temperature)),b=p.icon_style||"fill",w=v.forecast[0],f=w?Math.round(w.temperature):y,x=w?Math.round(null!==(l=w.templow)&&void 0!==l?l:w.temperature-10):y-10,$=!1!==p.show_left_column,z=!1!==p.show_center_column,k=!1!==p.show_right_column,S=null!==(d=p.layout_spread)&&void 0!==d?d:100,C=S<50;let P="";const E=[];C?($&&E.push("auto"),z&&E.push("auto"),k&&E.push("auto")):($&&E.push("minmax(0, 1fr)"),z&&E.push("auto"),k&&E.push("minmax(0, 1fr)")),P=E.join(" ")||"auto";let W=null,q=null,D=!1,I=0,T=0;const U=p.tap_action&&"nothing"!==p.tap_action.action||p.hold_action&&"nothing"!==p.hold_action.action||p.double_tap_action&&"nothing"!==p.double_tap_action.action,j=_.color,L=j||p.location_color||"var(--primary-text-color)",F=j||p.condition_color||"var(--primary-text-color)",A=j||p.custom_entity_color||"var(--primary-text-color)",N=j||p.date_color||"var(--primary-text-color)",R=j||p.temperature_color||"var(--primary-text-color)",M=j||p.temp_range_color||"var(--primary-text-color)",O={padding:_.padding_top||_.padding_bottom||_.padding_left||_.padding_right||m.padding_top||m.padding_bottom||m.padding_left||m.padding_right?`${this.addPixelUnit(_.padding_top||m.padding_top)||"0px"} ${this.addPixelUnit(_.padding_right||m.padding_right)||"0px"} ${this.addPixelUnit(_.padding_bottom||m.padding_bottom)||"0px"} ${this.addPixelUnit(_.padding_left||m.padding_left)||"0px"}`:void 0,margin:_.margin_top||_.margin_bottom||_.margin_left||_.margin_right||m.margin_top||m.margin_bottom||m.margin_left||m.margin_right?`${_.margin_top||m.margin_top||"0px"} ${_.margin_right||m.margin_right||"0px"} ${_.margin_bottom||m.margin_bottom||"0px"} ${_.margin_left||m.margin_left||"0px"}`:"0px",background:_.background_color||m.background_color||p.module_background||"transparent",backgroundImage:this.getBackgroundImageCSS(Object.assign(Object.assign({},m),_),t),backgroundSize:_.background_size||m.background_size||"cover",backgroundPosition:_.background_position||m.background_position||"center",backgroundRepeat:_.background_repeat||m.background_repeat||"no-repeat",border:(_.border_style||m.border_style)&&"none"!==(_.border_style||m.border_style)?`${this.addPixelUnit(_.border_width||m.border_width)||"1px"} ${_.border_style||m.border_style} ${_.border_color||m.border_color||p.module_border||"var(--divider-color)"}`:p.module_border&&"transparent"!==p.module_border?`2px solid ${p.module_border}`:void 0,borderRadius:this.addPixelUnit(_.border_radius||m.border_radius)||void 0,boxSizing:"border-box",cursor:U?"pointer":"default"},B=Math.round(S/100*12),V=C?"center":"normal";return o.qy`
      <style>
        ${this.getStyles()}
      </style>
      <div
        style=${this.objectToStyleString(O)}
        @pointerdown=${i=>{i.preventDefault(),D=!1,W=setTimeout((()=>{D=!0,p.hold_action&&"nothing"===p.hold_action.action||r.K.handleAction(p.hold_action||{action:"default"},t,i.target,e,p.entity,p)}),500)}}
        @pointerup=${i=>{if(i.preventDefault(),W&&(clearTimeout(W),W=null),D)return void(D=!1);const o=Date.now();o-T<300&&1===I?(q&&(clearTimeout(q),q=null),I=0,p.double_tap_action&&"nothing"===p.double_tap_action.action||r.K.handleAction(p.double_tap_action||{action:"default"},t,i.target,e,p.entity,p)):(I=1,T=o,q=setTimeout((()=>{I=0,p.tap_action&&"nothing"===p.tap_action.action||r.K.handleAction(p.tap_action||{action:"default"},t,i.target,e,p.entity,p)}),300))}}
      >
        <div
          class="animated-weather-module-container"
          style="
            --column-gap: ${B}px;
            --justify-content: ${V};
            --left-column-gap: ${null!==(s=p.left_column_gap)&&void 0!==s?s:8}px;
            --right-column-gap: ${null!==(u=p.right_column_gap)&&void 0!==u?u:8}px;
            --location-size: ${p.location_size||16}px;
            --condition-size: ${p.condition_size||24}px;
            --custom-entity-size: ${p.custom_entity_size||18}px;
            --precipitation-size: ${p.precipitation_size||14}px;
            --wind-size: ${p.wind_size||14}px;
            --pressure-size: ${p.pressure_size||14}px;
            --visibility-size: ${p.visibility_size||14}px;
            --date-size: ${p.date_size||16}px;
            --temperature-size: ${p.temperature_size||64}px;
            --temp-range-size: ${p.temp_range_size||18}px;
            --main-icon-size: ${p.main_icon_size||120}px;
            --location-color: ${L};
            --condition-color: ${F};
            --custom-entity-color: ${A};
            --precipitation-color: ${j||p.precipitation_color||"var(--primary-text-color)"};
            --wind-color: ${j||p.wind_color||"var(--primary-text-color)"};
            --pressure-color: ${j||p.pressure_color||"var(--primary-text-color)"};
            --visibility-color: ${j||p.visibility_color||"var(--primary-text-color)"};
            --date-color: ${N};
            --temperature-color: ${R};
            --temp-range-color: ${M};
            --module-background: ${p.module_background||"transparent"};
            --module-border: ${p.module_border||"transparent"};
          "
        >
        <div class="weather-main-grid" style="grid-template-columns: ${P};">
          <!-- Left Column: Location & Condition -->
          ${$?o.qy`
                <div class="weather-info-left">
                  ${this._renderColumnItems("left",p,t,v,h,y,f,x)}
                </div>
              `:""}

          <!-- Center Column: Weather Icon -->
          ${z?o.qy`
                <div class="weather-icon-center">
                  <img
                    src="${this._getWeatherIcon(v.condition,b)}"
                    alt="${p.weather_entity&&v.weatherEntity?(0,c.formatEntityState)(t,p.weather_entity):this._formatCondition(v.condition)}"
                    class="meteocon-icon large"
                  />
                </div>
              `:""}

          <!-- Right Column: Date & Temperature -->
          ${k?o.qy`
                <div class="weather-info-right">
                  ${this._renderColumnItems("right",p,t,v,h,y,f,x)}
                </div>
              `:""}
        </div>
      </div>
    `}_renderColumnItems(i,t,e,n,r,a,l,d){const s=this._getDefaultColumnOrder(t,e),u="left"===i?t.left_column_order||s.left:t.right_column_order||s.right,p={location:()=>!1!==t.show_location?o.qy`
              <div class="weather-location">
                <ha-icon icon="mdi:map-marker"></ha-icon>
                ${n.location}
              </div>
            `:o.s6,condition:()=>!1!==t.show_condition?o.qy`
              <div class="weather-condition">
                ${t.weather_entity&&n.weatherEntity?(0,c.formatEntityState)(e,t.weather_entity):this._formatCondition(n.condition)}
              </div>
            `:o.s6,custom_entity:()=>!1!==t.show_custom_entity&&t.custom_entity&&e.states[t.custom_entity]?o.qy`
              <div class="weather-custom-entity">
                ${t.custom_entity_name||e.states[t.custom_entity].attributes.friendly_name||t.custom_entity}:
                ${e.states[t.custom_entity].state}${e.states[t.custom_entity].attributes.unit_of_measurement||""}
              </div>
            `:o.s6,precipitation:()=>!1!==t.show_precipitation&&void 0!==n.precipitation&&null!==n.precipitation?o.qy`
              <div class="weather-precipitation">
                <ha-icon icon="mdi:weather-pouring"></ha-icon>
                ${this._formatPrecipitation(n.precipitation,n.weatherEntity)}
              </div>
            `:o.s6,precipitation_probability:()=>!1!==t.show_precipitation_probability&&void 0!==n.precipitationProbability&&null!==n.precipitationProbability?o.qy`
              <div class="weather-precipitation-probability">
                <ha-icon icon="mdi:weather-rainy"></ha-icon>
                ${this._formatPrecipitationProbability(n.precipitationProbability)}
              </div>
            `:o.s6,wind:()=>!1===t.show_wind||void 0===n.windSpeed&&void 0===n.windBearing?o.s6:o.qy`
              <div class="weather-wind">
                <ha-icon icon="mdi:weather-windy"></ha-icon>
                ${this._formatWind(n.windSpeed,n.windBearing,n.weatherEntity)}
              </div>
            `,pressure:()=>!1!==t.show_pressure&&void 0!==n.pressure&&null!==n.pressure?o.qy`
              <div class="weather-pressure">
                <ha-icon icon="mdi:gauge"></ha-icon>
                ${this._formatPressure(n.pressure,n.weatherEntity)}
              </div>
            `:o.s6,visibility:()=>!1!==t.show_visibility&&void 0!==n.visibility&&null!==n.visibility?o.qy`
              <div class="weather-visibility">
                <ha-icon icon="mdi:eye"></ha-icon>
                ${this._formatVisibility(n.visibility,n.weatherEntity)}
              </div>
            `:o.s6,date:()=>!1!==t.show_date?o.qy` <div class="weather-date">${r}</div> `:o.s6,temperature:()=>!1!==t.show_temperature?o.qy` <div class="weather-temp">${a}°</div> `:o.s6,temp_range:()=>!1!==t.show_temp_range?o.qy` <div class="weather-temp-range">${l}° / ${d}°</div> `:o.s6};return u.filter((i=>p[i])).map((i=>p[i]())).filter((i=>i!==o.s6))}objectToStyleString(i){return Object.entries(i).filter((([i,t])=>null!=t&&""!==t)).map((([i,t])=>`${i.replace(/([A-Z])/g,"-$1").toLowerCase()}: ${t}`)).join("; ")}addPixelUnit(i){if(i)return"string"==typeof i&&(i.includes("px")||i.includes("%")||i.includes("em")||i.includes("rem")||i.includes("vh")||i.includes("vw"))?i:`${i}px`}getBackgroundImageCSS(i,t){const e=i.background_image_type||"none";if("entity"===e&&i.background_image_entity&&t){const e=t.states[i.background_image_entity];if(e&&e.attributes.entity_picture)return`url('${e.attributes.entity_picture}')`}else{if("upload"===e&&i.background_image_upload)return`url('${i.background_image_upload}')`;if("url"===e&&i.background_image_url)return`url('${i.background_image_url}')`}return""}_getWeatherData(i,t){var e,o,n,r,a,l,d,c,s,u,p,m,g,_,v;const h=i.states[t.weather_entity||""],y=i.states[t.temperature_entity||""],b=i.states[t.condition_entity||""];let w=(null===(e=null==h?void 0:h.attributes)||void 0===e?void 0:e.forecast)||[];0===w.length&&h&&(w=(null===(o=h.attributes)||void 0===o?void 0:o.forecast_daily)||(null===(n=h.attributes)||void 0===n?void 0:n.daily)||(null===(r=h.attributes)||void 0===r?void 0:r.forecasts)||[]);let f="Unknown Location";if("entity"===t.location_override_mode&&t.location_entity){const e=i.states[t.location_entity];e&&(f=e.state||(null===(a=e.attributes)||void 0===a?void 0:a.friendly_name)||f)}else f=t.location_name?t.location_name:(null===(l=null==h?void 0:h.attributes)||void 0===l?void 0:l.friendly_name)||f;const x=(null===(d=null==h?void 0:h.attributes)||void 0===d?void 0:d.temperature_unit)||"°F";return{temperature:(null===(c=null==h?void 0:h.attributes)||void 0===c?void 0:c.temperature)||parseFloat(null==y?void 0:y.state)||72,temperatureUnit:x,condition:(null==h?void 0:h.state)||(null==b?void 0:b.state)||"sunny",location:f,forecast:w,humidity:null===(s=null==h?void 0:h.attributes)||void 0===s?void 0:s.humidity,windSpeed:null===(u=null==h?void 0:h.attributes)||void 0===u?void 0:u.wind_speed,windBearing:null===(p=null==h?void 0:h.attributes)||void 0===p?void 0:p.wind_bearing,precipitation:null===(m=null==h?void 0:h.attributes)||void 0===m?void 0:m.precipitation,precipitationProbability:null===(g=null==h?void 0:h.attributes)||void 0===g?void 0:g.precipitation_probability,pressure:null===(_=null==h?void 0:h.attributes)||void 0===_?void 0:_.pressure,visibility:null===(v=null==h?void 0:h.attributes)||void 0===v?void 0:v.visibility,weatherEntity:h}}_getWeatherIcon(i,t="fill"){return`https://cdn.jsdelivr.net/gh/basmilius/weather-icons@dev/production/${t}/svg/${{"clear-night":"clear-night","clear-day":"clear-day",cloudy:"cloudy",exceptional:"not-available",fog:"fog",hail:"hail",lightning:"thunderstorms","lightning-rainy":"thunderstorms-rain",partlycloudy:"partly-cloudy-day","partly-cloudy-night":"partly-cloudy-night",pouring:"extreme-rain",rainy:"rain",snowy:"snow","snowy-rainy":"sleet",sunny:"clear-day",windy:"wind","windy-variant":"extreme-wind"}[i]||"partly-cloudy-day"}.svg`}_formatCondition(i){return i.split("-").map((i=>i.charAt(0).toUpperCase()+i.slice(1))).join(" ")}_formatPrecipitation(i,t){var e;if(null==i)return"";const o=(null===(e=null==t?void 0:t.attributes)||void 0===e?void 0:e.precipitation_unit)||"mm";return`${i.toFixed(1)} ${o}`}_formatPrecipitationProbability(i){return null==i?"":`${Math.round(i)}%`}_formatWind(i,t,e){var o;const n=[];if(null!=i){const t=(null===(o=null==e?void 0:e.attributes)||void 0===o?void 0:o.wind_speed_unit)||"km/h";n.push(`${i.toFixed(1)} ${t}`)}return null!=t&&n.push(this._formatWindBearing(t)),n.join(" ")}_formatWindBearing(i){return["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"][Math.round(i/22.5)%16]}_formatPressure(i,t){var e;if(null==i)return"";const o=(null===(e=null==t?void 0:t.attributes)||void 0===e?void 0:e.pressure_unit)||"hPa";return`${Math.round(i)} ${o}`}_formatVisibility(i,t){var e;if(null==i)return"";const o=(null===(e=null==t?void 0:t.attributes)||void 0===e?void 0:e.visibility_unit)||"km";return`${i.toFixed(1)} ${o}`}getStyles(){return`\n      ${n.m.getSliderStyles()}\n      .animated-weather-module-container {\n        padding: 0;\n        position: relative;\n        overflow: hidden;\n        background: var(--module-background);\n        border: none;\n        width: 100%;\n        box-sizing: border-box;\n      }\n\n      /* ========== MAIN WEATHER GRID ========== */\n      .weather-main-grid {\n        display: grid;\n        gap: var(--column-gap, 12px);\n        align-items: center;\n        justify-content: var(--justify-content, normal);\n        width: 100%;\n      }\n\n\n      /* Left Column */\n      .weather-info-left {\n        display: flex;\n        flex-direction: column;\n        gap: var(--left-column-gap, 8px) !important;\n        align-items: flex-start;\n        min-width: 0;\n        justify-content: center;\n      }\n\n\n      .weather-location {\n        display: flex;\n        align-items: center;\n        gap: 6px;\n        font-size: var(--location-size);\n        font-weight: 600;\n        color: var(--location-color);\n        overflow-wrap: break-word;\n        word-wrap: break-word;\n        margin: 0;\n        padding: 0;\n        line-height: 1.2;\n      }\n\n      .weather-location ha-icon {\n        --mdc-icon-size: calc(var(--location-size) + 2px);\n        flex-shrink: 0;\n      }\n\n      .weather-condition {\n        font-size: var(--condition-size);\n        font-weight: 500;\n        color: var(--condition-color);\n        text-transform: capitalize;\n        overflow-wrap: break-word;\n        word-wrap: break-word;\n        margin: 0;\n        padding: 0;\n        line-height: 1.2;\n      }\n\n      .weather-custom-entity {\n        font-size: var(--custom-entity-size);\n        font-weight: 500;\n        color: var(--custom-entity-color);\n        overflow-wrap: break-word;\n        word-wrap: break-word;\n        margin: 0;\n        padding: 0;\n        line-height: 1.2;\n      }\n\n      .weather-precipitation,\n      .weather-precipitation-probability,\n      .weather-wind,\n      .weather-pressure,\n      .weather-visibility {\n        display: flex;\n        align-items: center;\n        gap: 6px;\n        font-size: var(--precipitation-size);\n        font-weight: 500;\n        color: var(--precipitation-color);\n        overflow-wrap: break-word;\n        word-wrap: break-word;\n        margin: 0;\n        padding: 0;\n        line-height: 1.2;\n      }\n\n      .weather-precipitation ha-icon,\n      .weather-precipitation-probability ha-icon,\n      .weather-wind ha-icon,\n      .weather-pressure ha-icon,\n      .weather-visibility ha-icon {\n        --mdc-icon-size: calc(var(--precipitation-size) + 2px);\n        flex-shrink: 0;\n      }\n\n      .weather-wind {\n        font-size: var(--wind-size);\n        color: var(--wind-color);\n      }\n\n      .weather-wind ha-icon {\n        --mdc-icon-size: calc(var(--wind-size) + 2px);\n      }\n\n      .weather-pressure {\n        font-size: var(--pressure-size);\n        color: var(--pressure-color);\n      }\n\n      .weather-pressure ha-icon {\n        --mdc-icon-size: calc(var(--pressure-size) + 2px);\n      }\n\n      .weather-visibility {\n        font-size: var(--visibility-size);\n        color: var(--visibility-color);\n      }\n\n      .weather-visibility ha-icon {\n        --mdc-icon-size: calc(var(--visibility-size) + 2px);\n      }\n\n      /* Center Column - Weather Icon */\n      .weather-icon-center {\n        width: var(--main-icon-size);\n        height: var(--main-icon-size);\n        display: flex;\n        align-items: center;\n        justify-content: center;\n      }\n\n      .meteocon-icon {\n        width: 100%;\n        height: 100%;\n        object-fit: contain;\n      }\n\n      .meteocon-icon.large {\n        width: var(--main-icon-size);\n        height: var(--main-icon-size);\n      }\n\n      /* Right Column */\n      .weather-info-right {\n        display: flex;\n        flex-direction: column;\n        gap: var(--right-column-gap, 8px) !important;\n        align-items: flex-end;\n        text-align: right;\n        min-width: 0;\n        justify-content: center;\n      }\n\n\n      .weather-date {\n        font-size: var(--date-size);\n        font-weight: 500;\n        color: var(--date-color);\n        text-transform: capitalize;\n        overflow-wrap: break-word;\n        word-wrap: break-word;\n        margin: 0;\n        padding: 0;\n        line-height: 1.2;\n      }\n\n      .weather-temp {\n        font-size: var(--temperature-size);\n        font-weight: 300;\n        color: var(--temperature-color);\n        line-height: 1;\n        overflow-wrap: break-word;\n        word-wrap: break-word;\n        margin: 0;\n        padding: 0;\n      }\n\n      .weather-temp-range {\n        font-size: var(--temp-range-size);\n        font-weight: 500;\n        color: var(--temp-range-color);\n        overflow-wrap: break-word;\n        word-wrap: break-word;\n        margin: 0;\n        padding: 0;\n        line-height: 1.2;\n      }\n\n      /* ========== RESPONSIVE ========== */\n      @media (max-width: 768px) {\n        .animated-weather-module-container {\n          transform: scale(min(1, calc(100vw / 500)));\n          transform-origin: top center;\n        }\n      }\n    `}validate(i){const t=[],e=i;return e.weather_entity||e.temperature_entity||t.push("At least one weather or temperature entity is required"),{valid:0===t.length,errors:t}}}},9760:(i,t,e)=>{e.d(t,{formatEntityState:()=>n});var o=e(9811);const n=(i,t,e)=>{var n,r;const a=!1!==(null==e?void 0:e.includeUnit),l=null===(n=null==i?void 0:i.states)||void 0===n?void 0:n[t];if(!i||!l)return void 0!==(null==e?void 0:e.state)?String(e.state):"";const d=i.formatEntityState,c=d?d(l,void 0!==(null==e?void 0:e.state)?String(e.state):void 0):(0,o.computeStateDisplay)(i.localize,l,i.locale,null==e?void 0:e.state);if(a)return c;const s=null===(r=l.attributes)||void 0===r?void 0:r.unit_of_measurement;if(s&&"string"==typeof c){const i=` ${s}`;if(c.endsWith(i))return c.slice(0,-i.length)}return c}}}]);