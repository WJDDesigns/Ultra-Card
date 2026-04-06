"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[7358],{8722:(t,e,a)=>{a.r(e),a.d(e,{UltraAnimatedForecastModule:()=>d});var r=a(5183),o=a(7475),i=(a(7921),a(8869)),n=a(6478);class d extends o.m{constructor(){super(...arguments),this.metadata={type:"animated_forecast",title:"Animated Forecast",description:"Multi-day weather forecast with animated icons",author:"WJD Designs",version:"1.0.0",icon:"mdi:weather-cloudy",category:"content",tags:["weather","forecast","pro","premium","animated"]}}createDefault(t,e){const a=this._findWeatherEntity(e);return{id:t||this.generateId("animated_forecast"),type:"animated_forecast",weather_entity:a,forecast_entity:"",forecast_days:5,allow_wrap:!0,forecast_day_size:14,forecast_temp_size:14,forecast_icon_size:48,icon_style:"fill",text_color:"var(--primary-text-color)",accent_color:"var(--primary-color)",forecast_day_color:"var(--primary-text-color)",forecast_temp_color:"var(--primary-text-color)",forecast_background:"rgba(var(--rgb-primary-text-color), 0.05)",tap_action:void 0,hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}_findWeatherEntity(t){if(!t)return"";const e=Object.keys(t.states).filter((t=>t.startsWith("weather.")));return e.length>0?e[0]:""}renderGeneralTab(t,e,a,i){return function(t,e,a,i,d){var s;const c=e,l=(null===(s=a.locale)||void 0===s?void 0:s.language)||"en";return r.qy`
    ${t.injectUcFormStyles()}
    <style>${o.m.getSliderStyles()}</style>
    <div class="module-general-settings">
      <!-- ============================================ -->
      <!-- ENTITY CONFIGURATION SECTION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${(0,n.kg)("editor.animated_forecast.entities.title",l,"⚙️ Forecast Entities")}
        </div>

        <!-- Weather Entity -->
        <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
          ${(0,n.kg)("editor.animated_forecast.weather_entity",l,"Weather Entity")}
        </div>
        <div class="field-description" style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;">
          ${(0,n.kg)("editor.animated_forecast.weather_entity_desc",l,"Primary weather.* entity with forecast data")}
        </div>
        ${t.renderUcForm(a,{weather_entity:c.weather_entity||""},[t.entityField("weather_entity",["weather"])],(t=>d(t.detail.value)),!1)}

        <!-- Forecast Entity (Optional) -->
        <div
          class="field-title"
          style="font-size: 16px; font-weight: 600; margin-bottom: 4px; margin-top: 24px;"
        >
          ${(0,n.kg)("editor.animated_forecast.forecast_entity",l,"Forecast Entity (Optional)")}
        </div>
        <div class="field-description" style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;">
          ${(0,n.kg)("editor.animated_forecast.forecast_entity_desc",l,"Separate forecast entity if available")}
        </div>
        ${t.renderUcForm(a,{forecast_entity:c.forecast_entity||""},[t.entityField("forecast_entity")],(t=>d(t.detail.value)),!1)}
      </div>

      <!-- ============================================ -->
      <!-- CONFIGURATION SECTION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${(0,n.kg)("editor.animated_forecast.config.title",l,"⚙️ Forecast Configuration")}
        </div>

        <!-- Forecast Days -->
        ${t.renderSliderField((0,n.kg)("editor.animated_forecast.forecast_days",l,"Forecast Days"),(0,n.kg)("editor.animated_forecast.forecast_days_desc",l,"Number of forecast days (3-7)"),c.forecast_days||5,5,3,7,1,(t=>d({forecast_days:t})),"")}
      </div>

      <!-- ============================================ -->
      <!-- TEXT SIZES SECTION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${(0,n.kg)("editor.animated_forecast.text_sizes.title",l,"📏 Text Sizes")}
        </div>

        <div
          style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;"
        >
          <!-- Forecast Day Size -->
          <div>
            ${t.renderSliderField((0,n.kg)("editor.animated_forecast.forecast_day_size",l,"Forecast Day Name Size"),"10-24px",c.forecast_day_size||14,14,10,24,1,(t=>d({forecast_day_size:t})),"px")}
          </div>

          <!-- Forecast Temp Size -->
          <div>
            ${t.renderSliderField((0,n.kg)("editor.animated_forecast.forecast_temp_size",l,"Forecast Temp Size"),"10-24px",c.forecast_temp_size||14,14,10,24,1,(t=>d({forecast_temp_size:t})),"px")}
          </div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- ICON SETTINGS SECTION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${(0,n.kg)("editor.animated_forecast.icon_settings.title",l,"🎨 Icon Settings")}
        </div>

        <!-- Forecast Icon Size -->
        ${t.renderSliderField((0,n.kg)("editor.animated_forecast.forecast_icon_size",l,"Forecast Icon Size"),(0,n.kg)("editor.animated_forecast.forecast_icon_size_desc",l,"Size of forecast weather icons (32-80px)"),c.forecast_icon_size||48,48,32,80,4,(t=>d({forecast_icon_size:t})),"px")}

        <!-- Icon Style -->
        <div
          class="field-title"
          style="font-size: 16px; font-weight: 600; margin-bottom: 4px; margin-top: 24px;"
        >
          ${(0,n.kg)("editor.animated_forecast.icon_style",l,"Icon Style")}
        </div>
        <div class="field-description" style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;">
          ${(0,n.kg)("editor.animated_forecast.icon_style_desc",l,"Choose between filled or outlined animated icons")}
        </div>
        ${t.renderUcForm(a,{icon_style:c.icon_style||"fill"},[t.selectField("icon_style",[{value:"fill",label:"Filled"},{value:"line",label:"Outlined"}])],(e=>{e.detail.value.icon_style!==c.icon_style&&(d(e.detail.value),setTimeout((()=>t.triggerPreviewUpdate()),50))}),!1)}
      </div>

      <!-- ============================================ -->
      <!-- COLORS SECTION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${(0,n.kg)("editor.animated_forecast.colors.title",l,"🎨 Colors")}
        </div>

        <div
          style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 24px;"
        >
          <!-- Forecast Day Color -->
          <div>
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
              ${(0,n.kg)("editor.animated_forecast.forecast_day_color",l,"Forecast Day Names")}
            </div>
            <ultra-color-picker
              .value="${c.forecast_day_color||"var(--primary-text-color)"}"
              .hass="${a}"
              @value-changed=${e=>{d({forecast_day_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}
            ></ultra-color-picker>
          </div>

          <!-- Forecast Temp Color -->
          <div>
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
              ${(0,n.kg)("editor.animated_forecast.forecast_temp_color",l,"Forecast Temps")}
            </div>
            <ultra-color-picker
              .value="${c.forecast_temp_color||"var(--primary-text-color)"}"
              .hass="${a}"
              @value-changed=${e=>{d({forecast_temp_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}
            ></ultra-color-picker>
          </div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- BACKGROUND SECTION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${(0,n.kg)("editor.animated_forecast.background.title",l,"🎨 Background")}
        </div>

        <!-- Forecast Background -->
        <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
          ${(0,n.kg)("editor.animated_forecast.forecast_background",l,"Forecast Background")}
        </div>
        <div class="field-description" style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;">
          ${(0,n.kg)("editor.animated_forecast.forecast_background_desc",l,"Background for the forecast section (theme-aware by default)")}
        </div>
        <ultra-color-picker
          .value="${c.forecast_background||"rgba(var(--rgb-primary-text-color), 0.05)"}"
          .hass="${a}"
          @value-changed=${e=>{d({forecast_background:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}
        ></ultra-color-picker>
      </div>
    </div>
  `}(this,t,e,0,i)}renderPreview(t,e,a,o){const n=t,d=n,s=n.design||{},c={color:n.color||s.color,background_color:n.background_color||s.background_color,background_image:n.background_image||s.background_image,background_image_type:n.background_image_type||s.background_image_type,background_image_entity:n.background_image_entity||s.background_image_entity,background_image_upload:n.background_image_upload||s.background_image_upload,background_image_url:n.background_image_url||s.background_image_url,background_size:n.background_size||s.background_size,background_position:n.background_position||s.background_position,background_repeat:n.background_repeat||s.background_repeat,padding_top:void 0!==s.padding_top?s.padding_top:n.padding_top,padding_bottom:void 0!==s.padding_bottom?s.padding_bottom:n.padding_bottom,padding_left:void 0!==s.padding_left?s.padding_left:n.padding_left,padding_right:void 0!==s.padding_right?s.padding_right:n.padding_right,margin_top:void 0!==s.margin_top?s.margin_top:n.margin_top,margin_bottom:void 0!==s.margin_bottom?s.margin_bottom:n.margin_bottom,margin_left:void 0!==s.margin_left?s.margin_left:n.margin_left,margin_right:void 0!==s.margin_right?s.margin_right:n.margin_right,border_radius:n.border_radius||s.border_radius,border_style:n.border_style||s.border_style,border_width:n.border_width||s.border_width,border_color:n.border_color||s.border_color},l=this._getWeatherData(e,n),g=n.icon_style||"fill";l.temperatureUnit;let p=null,_=null,u=!1,m=0,f=0;const y=n.tap_action&&"nothing"!==n.tap_action.action||n.hold_action&&"nothing"!==n.hold_action.action||n.double_tap_action&&"nothing"!==n.double_tap_action.action,v=c.color,b=v||n.forecast_day_color||"var(--primary-text-color)",h=v||n.forecast_temp_color||"var(--primary-text-color)",x={padding:c.padding_top||c.padding_bottom||c.padding_left||c.padding_right||d.padding_top||d.padding_bottom||d.padding_left||d.padding_right?`${this.addPixelUnit(c.padding_top||d.padding_top)||"0px"} ${this.addPixelUnit(c.padding_right||d.padding_right)||"0px"} ${this.addPixelUnit(c.padding_bottom||d.padding_bottom)||"0px"} ${this.addPixelUnit(c.padding_left||d.padding_left)||"0px"}`:void 0,margin:c.margin_top||c.margin_bottom||c.margin_left||c.margin_right||d.margin_top||d.margin_bottom||d.margin_left||d.margin_right?`${c.margin_top||d.margin_top||"0px"} ${c.margin_right||d.margin_right||"0px"} ${c.margin_bottom||d.margin_bottom||"0px"} ${c.margin_left||d.margin_left||"0px"}`:"0px",background:c.background_color||d.background_color||"transparent",backgroundImage:this.getBackgroundImageCSS(Object.assign(Object.assign({},d),c),e),backgroundSize:c.background_size||d.background_size||"cover",backgroundPosition:c.background_position||d.background_position||"center",backgroundRepeat:c.background_repeat||d.background_repeat||"no-repeat",border:(c.border_style||d.border_style)&&"none"!==(c.border_style||d.border_style)?`${this.addPixelUnit(c.border_width||d.border_width)||"1px"} ${c.border_style||d.border_style} ${c.border_color||d.border_color||"var(--divider-color)"}`:void 0,borderRadius:this.addPixelUnit(c.border_radius||d.border_radius)||void 0,boxSizing:"border-box",cursor:y?"pointer":"default"};return r.qy`
      <style>
        ${this.getStyles()}
      </style>
      <div
        style=${this.objectToStyleString(x)}
        @pointerdown=${t=>{t.preventDefault(),u=!1,p=setTimeout((()=>{u=!0,n.hold_action&&"nothing"===n.hold_action.action||i.K.handleAction(n.hold_action||{action:"default"},e,t.target,a,n.entity,n)}),500)}}
        @pointerup=${t=>{if(t.preventDefault(),p&&(clearTimeout(p),p=null),u)return void(u=!1);const r=Date.now();r-f<300&&1===m?(_&&(clearTimeout(_),_=null),m=0,n.double_tap_action&&"nothing"===n.double_tap_action.action||i.K.handleAction(n.double_tap_action||{action:"default"},e,t.target,a,n.entity,n)):(m=1,f=r,_=setTimeout((()=>{m=0,n.tap_action&&"nothing"===n.tap_action.action||i.K.handleAction(n.tap_action||{action:"default"},e,t.target,a,n.entity,n)}),300))}}
      >
        <div
          class="animated-forecast-module-container"
          style="
            --forecast-days: ${n.forecast_days||5};
            --forecast-day-size: ${n.forecast_day_size||14}px;
            --forecast-temp-size: ${n.forecast_temp_size||14}px;
            --forecast-icon-size: ${n.forecast_icon_size||48}px;
            --forecast-day-color: ${b};
            --forecast-temp-color: ${h};
            --forecast-background: ${n.forecast_background||"rgba(var(--rgb-primary-text-color), 0.05)"};
            --forecast-allow-wrap: ${!1===n.allow_wrap?"column":"row"};
            overflow: visible;
            max-width: 100%;
            box-sizing: border-box;
          "
        >
        <div class="weather-forecast">
          ${l.forecast&&l.forecast.length>0?l.forecast.slice(0,n.forecast_days||5).map((t=>{var a,o;const i=new Date(t.datetime).toLocaleDateString((null===(a=e.locale)||void 0===a?void 0:a.language)||"en",{weekday:"short"}),n=Math.round(t.temperature),d=Math.round(null!==(o=t.templow)&&void 0!==o?o:t.temperature-10);return r.qy`
                  <div class="forecast-day">
                    <div class="forecast-day-name">${i}</div>
                    <img
                      src="${this._getWeatherIcon(t.condition,g)}"
                      alt="${t.condition}"
                      class="forecast-icon meteocon-icon"
                    />
                    <div class="forecast-temps">
                      <span class="forecast-high">${n}°</span>
                      <span class="forecast-low">${d}°</span>
                    </div>
                  </div>
                `})):r.qy`<div style="text-align: center; opacity: 0.6; padding: 16px;">
                No forecast data available
              </div>`}
        </div>
      </div>
    `}objectToStyleString(t){return Object.entries(t).filter((([t,e])=>null!=e&&""!==e)).map((([t,e])=>`${t.replace(/([A-Z])/g,"-$1").toLowerCase()}: ${e}`)).join("; ")}addPixelUnit(t){if(t)return"string"==typeof t&&(t.includes("px")||t.includes("%")||t.includes("em")||t.includes("rem")||t.includes("vh")||t.includes("vw"))?t:`${t}px`}getBackgroundImageCSS(t,e){const a=t.background_image_type||"none";if("entity"===a&&t.background_image_entity&&e){const a=e.states[t.background_image_entity];if(a&&a.attributes.entity_picture)return`url('${a.attributes.entity_picture}')`}else{if("upload"===a&&t.background_image_upload)return`url('${t.background_image_upload}')`;if("url"===a&&t.background_image_url)return`url('${t.background_image_url}')`}return""}_getWeatherData(t,e){var a,r,o,i,n,d;const s=t.states[e.weather_entity||""];let c=(null===(a=null==s?void 0:s.attributes)||void 0===a?void 0:a.forecast)||[];if(0===c.length&&e.forecast_entity){const a=t.states[e.forecast_entity];c=(null===(r=null==a?void 0:a.attributes)||void 0===r?void 0:r.forecast)||[]}return 0===c.length&&s&&(c=(null===(o=s.attributes)||void 0===o?void 0:o.forecast_daily)||(null===(i=s.attributes)||void 0===i?void 0:i.daily)||(null===(n=s.attributes)||void 0===n?void 0:n.forecasts)||[]),0===c.length&&e.weather_entity&&(null==t?void 0:t.callWS)&&this._fetchForecastData(t,e),{forecast:c,temperatureUnit:(null===(d=null==s?void 0:s.attributes)||void 0===d?void 0:d.temperature_unit)||"°F"}}async _fetchForecastData(t,e){var a,r;if(e.weather_entity&&(null==t?void 0:t.callWS))try{const o=await t.callWS({type:"call_service",domain:"weather",service:"get_forecasts",service_data:{type:"daily"},target:{entity_id:e.weather_entity},return_response:!0}),i=null===(r=null===(a=null==o?void 0:o.response)||void 0===a?void 0:a[e.weather_entity])||void 0===r?void 0:r.forecast;if(i&&Array.isArray(i)&&i.length>0){const a=t.states[e.weather_entity];a&&a.attributes&&(a.attributes.forecast=i),setTimeout((()=>this.triggerPreviewUpdate()),100)}}catch(t){console.debug("Ultra Card Forecast: Could not fetch forecast via service:",t)}}_getWeatherIcon(t,e="fill"){return`https://cdn.jsdelivr.net/gh/basmilius/weather-icons@dev/production/${e}/svg/${{"clear-night":"clear-night","clear-day":"clear-day",cloudy:"cloudy",exceptional:"not-available",fog:"fog",hail:"hail",lightning:"thunderstorms","lightning-rainy":"thunderstorms-rain",partlycloudy:"partly-cloudy-day","partly-cloudy-night":"partly-cloudy-night",pouring:"extreme-rain",rainy:"rain",snowy:"snow","snowy-rainy":"sleet",sunny:"clear-day",windy:"wind","windy-variant":"extreme-wind"}[t]||"partly-cloudy-day"}.svg`}getStyles(){return`\n      ${o.m.getSliderStyles()}\n      .animated-forecast-module-container {\n        padding: 0;\n        width: 100%;\n        box-sizing: border-box;\n      }\n\n      /* ========== FORECAST ========== */\n      .weather-forecast {\n        display: grid;\n        grid-template-columns: repeat(var(--forecast-days, 5), 1fr);\n        grid-auto-flow: var(--forecast-allow-wrap, row);\n        gap: 16px;\n        padding: 20px 16px 16px 16px;\n        background: var(--forecast-background);\n        border-radius: 12px;\n      }\n\n      .forecast-day {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: 8px;\n      }\n\n      .forecast-day-name {\n        font-size: var(--forecast-day-size);\n        font-weight: 600;\n        color: var(--forecast-day-color);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n\n      .forecast-icon {\n        width: var(--forecast-icon-size);\n        height: var(--forecast-icon-size);\n      }\n\n      .meteocon-icon {\n        width: 100%;\n        height: 100%;\n        object-fit: contain;\n      }\n\n      .forecast-temps {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: 2px;\n        font-size: var(--forecast-temp-size);\n        color: var(--forecast-temp-color);\n      }\n\n      .forecast-high {\n        font-weight: 600;\n      }\n\n      .forecast-low {\n        opacity: 0.7;\n      }\n\n      /* ========== RESPONSIVE ========== */\n      @media (max-width: 768px) {\n        .animated-forecast-module-container {\n          transform: scale(min(1, calc(100vw / 600)));\n          transform-origin: top center;\n        }\n      }\n    `}validate(t){const e=[],a=t;return a.weather_entity||e.push("Weather entity is required for forecast data"),a.forecast_days&&(a.forecast_days<3||a.forecast_days>7)&&e.push("Forecast days must be between 3 and 7"),{valid:0===e.length,errors:e}}}}}]);