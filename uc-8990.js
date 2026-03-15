"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[8990],{8990:(e,o,a)=>{a.r(o),a.d(o,{UltraAnimatedClockModule:()=>c});var r=a(5183),t=a(7475),l=(a(7921),a(6478)),i=a(6990);var n=a(9766);class c extends t.m{constructor(){super(...arguments),this.metadata={type:"animated_clock",title:"Animated Clock",description:"Beautiful flip clock with smooth animations",author:"WJD Designs",version:"1.0.0",icon:"mdi:clock-outline",category:"content",tags:["clock","time","pro","premium","animated","flip"]}}createDefault(e,o){return{id:e||this.generateId("animated_clock"),type:"animated_clock",time_format:"12",clock_style:"flip",update_frequency:"1",analog_show_seconds:!0,analog_smooth_seconds:!0,analog_show_hour_hand:!0,analog_show_minute_hand:!0,analog_show_hour_markers:!0,analog_show_center_dot:!0,analog_show_numbers:!1,analog_show_hour_ticks:!0,analog_show_minute_ticks:!0,analog_face_background_type:"color",analog_face_background_size:"cover",analog_face_background_position:"center",analog_face_background_repeat:"no-repeat",show_hours:!0,show_minutes:!0,show_seconds:!0,show_ampm:!0,show_separators:!0,show_labels:!0,show_prefix:!0,show_prompt:!0,show_command:!0,show_cursor:!0,clock_size:100,clock_color:"var(--primary-text-color)",clock_background:"var(--card-background-color)",flip_tile_color:"rgba(0, 0, 0, 0.5)",flip_hours_color:"var(--primary-text-color)",flip_minutes_color:"var(--primary-text-color)",flip_separator_color:"var(--primary-text-color)",flip_ampm_color:"var(--primary-text-color)",digital_background_color:"#000",digital_hours_color:"#ff3333",digital_minutes_color:"#ff3333",digital_seconds_color:"#ff3333",digital_separator_color:"#ff3333",digital_ampm_color:"#33ff33",digital_glow_color:"#ff0000",binary_hours_empty_color:"rgba(128, 128, 128, 0.2)",binary_hours_filled_color:"var(--primary-text-color)",binary_minutes_empty_color:"rgba(128, 128, 128, 0.2)",binary_minutes_filled_color:"var(--primary-text-color)",binary_seconds_empty_color:"rgba(128, 128, 128, 0.2)",binary_seconds_filled_color:"var(--primary-text-color)",binary_separator_color:"var(--primary-text-color)",binary_hours_label_color:"var(--primary-text-color)",binary_minutes_label_color:"var(--primary-text-color)",binary_seconds_label_color:"var(--primary-text-color)",minimal_hours_color:"var(--primary-text-color)",minimal_minutes_color:"var(--primary-text-color)",minimal_seconds_color:"var(--primary-text-color)",minimal_separator_color:"var(--primary-text-color)",minimal_ampm_color:"var(--primary-text-color)",retro_background_color:"linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)",retro_hours_tile_color:"rgba(0, 0, 0, 0.3)",retro_minutes_tile_color:"rgba(0, 0, 0, 0.3)",retro_seconds_tile_color:"rgba(0, 0, 0, 0.3)",retro_separator_tile_color:"rgba(0, 0, 0, 0.3)",retro_hours_color:"#ffa500",retro_minutes_color:"#ffa500",retro_seconds_color:"#ffa500",retro_separator_color:"#ffa500",retro_ampm_color:"#00ff00",text_orientation:"horizontal",text_word_gap:8,text_prefix_color:"var(--primary-text-color)",text_prefix_size:38,text_hours_color:"var(--primary-text-color)",text_hours_size:48,text_minutes_color:"var(--primary-text-color)",text_minutes_size:48,text_ampm_color:"var(--primary-text-color)",text_ampm_size:24,neon_padding:24,neon_hours_color:"#00ffff",neon_minutes_color:"#00ffff",neon_seconds_color:"#00ffff",neon_separator_color:"#ff00ff",neon_ampm_color:"#00ff00",material_vertical_gap:8,material_background_color:"var(--card-background-color)",material_hours_color:"var(--primary-text-color)",material_minutes_color:"var(--primary-text-color)",material_seconds_color:"var(--primary-text-color)",material_separator_color:"var(--primary-text-color)",material_ampm_color:"var(--primary-text-color)",terminal_background_color:"#1e1e1e",terminal_line1_color:"#4ec9b0",terminal_line2_color:"#ce9178",terminal_cursor_color:"#4ec9b0",terminal_hours_color:"#d4d4d4",terminal_minutes_color:"#d4d4d4",terminal_seconds_color:"#d4d4d4",terminal_separator_color:"#d4d4d4",terminal_ampm_color:"#d4d4d4",terminal_vertical_spacing:8,terminal_line1_size:17,terminal_line2_size:17,terminal_output_size:38,tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}renderGeneralTab(e,o,a,t){return function(e,o,a,t,n){var c;const s=o,p=(null===(c=a.locale)||void 0===c?void 0:c.language)||"en";return r.qy`
    ${e.injectUcFormStyles()}
    <div class="module-general-settings">
      <!-- ============================================ -->
      <!-- CLOCK CONFIGURATION SECTION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(var(--rgb-primary-color), 0.12);"
      >
        <div
          class="section-title"
          style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"
        >
          <ha-icon icon="mdi:clock-outline" style="color: var(--primary-color);"></ha-icon>
          ${(0,l.kg)("editor.animated_clock.config.title",p,"Clock Configuration")}
        </div>

        <!-- Clock Style -->
        ${e.renderFieldSection((0,l.kg)("editor.animated_clock.clock_style",p,"Clock Style"),(0,l.kg)("editor.animated_clock.clock_style_desc",p,"Choose from 10 different clock display styles"),a,{clock_style:s.clock_style||"flip"},[e.selectField("clock_style",[{value:"flip",label:"Flip Clock"},{value:"digital",label:"Digital LED"},{value:"analog",label:"Analog Clock"},{value:"binary",label:"Binary Clock"},{value:"minimal",label:"Minimal"},{value:"retro",label:"Retro 7-Segment"},{value:"word",label:"Text Clock"},{value:"neon",label:"Neon Glow"},{value:"material",label:"Material Design"},{value:"terminal",label:"Terminal/Console"}])],(o=>{o.detail.value.clock_style!==s.clock_style&&(n(o.detail.value),setTimeout((()=>e.triggerPreviewUpdate()),50))}))}

        <!-- Time Format (hidden for analog clock) -->
        ${"analog"!==s.clock_style?r.qy`
              <div style="margin-top: 16px;">
                ${e.renderFieldSection((0,l.kg)("editor.animated_clock.time_format",p,"Time Format"),(0,l.kg)("editor.animated_clock.time_format_desc",p,"12-hour or 24-hour time display"),a,{time_format:s.time_format||"12"},[e.selectField("time_format",[{value:"12",label:"12 Hour (AM/PM)"},{value:"24",label:"24 Hour"}])],(o=>{o.detail.value.time_format!==s.time_format&&(n(o.detail.value),setTimeout((()=>e.triggerPreviewUpdate()),50))}))}
              </div>
            `:""}

        <!-- Clock Size Slider -->
        <div style="margin-top: 16px;">
          <label
            style="display: block; font-size: 14px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
          >
            ${(0,l.kg)("editor.animated_clock.clock_size",p,"Clock Size")}
          </label>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px;">
            ${(0,l.kg)("editor.animated_clock.clock_size_desc",p,"Scale factor for clock size (0-200)")}
          </div>
          <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
            <input
              type="range"
              class="gap-slider"
              min="0"
              max="200"
              step="1"
              .value="${s.clock_size||100}"
              @input="${o=>{const a=o.target,r=parseInt(a.value);n({clock_size:r}),setTimeout((()=>e.triggerPreviewUpdate()),50)}}"
            />
            <input
              type="number"
              class="gap-input"
              min="0"
              max="200"
              step="1"
              .value="${s.clock_size||100}"
              @input="${o=>{const a=o.target,r=parseInt(a.value);!isNaN(r)&&r>=0&&r<=200&&(n({clock_size:r}),setTimeout((()=>e.triggerPreviewUpdate()),50))}}"
              @keydown="${o=>{if("ArrowUp"===o.key||"ArrowDown"===o.key){o.preventDefault();const a=o.target,r=parseInt(a.value)||100,t="ArrowUp"===o.key?1:-1,l=Math.max(0,Math.min(200,r+t));n({clock_size:l}),setTimeout((()=>e.triggerPreviewUpdate()),50)}}}"
            />
            <button
              class="reset-btn"
              @click="${()=>{n({clock_size:100}),setTimeout((()=>e.triggerPreviewUpdate()),50)}}"
              title="Reset to default (100)"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- CLOCK CUSTOMIZATION SECTION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(var(--rgb-primary-color), 0.12);"
      >
        <div
          class="section-title"
          style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"
        >
          <ha-icon icon="mdi:palette" style="color: var(--primary-color);"></ha-icon>
          ${(0,l.kg)("editor.animated_clock.customization.title",p,"Clock Customization")}
        </div>

        ${function(e,o,a,t,n){const c=e.clock_style||"flip";return"analog"===c?r.qy`
      <!-- Hour Hand -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.analog_show_hour_hand}"
            @change="${e=>{const o=e.target;a({analog_show_hour_hand:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.analog_show_hour_hand",n,"Hour Hand")}</span
          >
        </label>
        ${!1!==e.analog_show_hour_hand?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.analog_hour_hand_color||e.clock_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({analog_hour_hand_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Minute Hand -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.analog_show_minute_hand}"
            @change="${e=>{const o=e.target;a({analog_show_minute_hand:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.analog_show_minute_hand",n,"Minute Hand")}</span
          >
        </label>
        ${!1!==e.analog_show_minute_hand?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.analog_minute_hand_color||e.clock_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({analog_minute_hand_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Second Hand -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.analog_show_seconds}"
            @change="${e=>{const o=e.target;a({analog_show_seconds:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.analog_show_seconds",n,"Second Hand")}</span
          >
        </label>
        ${!1!==e.analog_show_seconds?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.analog_second_hand_color||"#ff4444"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({analog_second_hand_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
                <!-- Smooth Seconds Toggle -->
                <label
                  style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color); margin-top: 8px;"
                >
                  <ha-switch
                    .checked="${!1!==e.analog_smooth_seconds}"
                    @change="${e=>{const o=e.target;a({analog_smooth_seconds:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  ></ha-switch>
                  <span style="font-size: 13px; color: var(--secondary-text-color);"
                    >${(0,l.kg)("editor.animated_clock.analog_smooth_seconds",n,"Smooth Sweeping Motion")}</span
                  >
                </label>
              </div>
            `:""}
      </div>

      <!-- Hour Markers -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.analog_show_hour_markers}"
            @change="${e=>{const o=e.target;a({analog_show_hour_markers:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.analog_show_hour_markers",n,"Hour Markers")}</span
          >
        </label>
        ${!1!==e.analog_show_hour_markers?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.analog_hour_marker_color||e.clock_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({analog_hour_marker_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Center Dot -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.analog_show_center_dot}"
            @change="${e=>{const o=e.target;a({analog_show_center_dot:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.analog_show_center_dot",n,"Center Dot")}</span
          >
        </label>
        ${!1!==e.analog_show_center_dot?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.analog_center_dot_color||e.clock_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({analog_center_dot_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Clock Numbers (1-12) -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!0===e.analog_show_numbers}"
            @change="${e=>{const o=e.target;a({analog_show_numbers:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.analog_show_numbers",n,"Clock Numbers (1-12)")}</span
          >
        </label>
        ${!0===e.analog_show_numbers?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.analog_numbers_color||e.clock_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({analog_numbers_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Hour Tick Marks (12 major ticks) -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!0===e.analog_show_hour_ticks}"
            @change="${e=>{const o=e.target;a({analog_show_hour_ticks:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.analog_show_hour_ticks",n,"Hour Tick Marks")}</span
          >
        </label>
        ${!0===e.analog_show_hour_ticks?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.analog_hour_ticks_color||e.clock_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({analog_hour_ticks_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Minute Tick Marks (48 minor ticks) -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!0===e.analog_show_minute_ticks}"
            @change="${e=>{const o=e.target;a({analog_show_minute_ticks:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.analog_show_minute_ticks",n,"Minute Tick Marks")}</span
          >
        </label>
        ${!0===e.analog_show_minute_ticks?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.analog_minute_ticks_color||e.clock_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({analog_minute_ticks_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Clock Face Section -->
      <div style="border-top: 1px solid var(--divider-color); padding-top: 20px; margin-top: 20px;">
        <div
          style="font-size: 14px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 12px;"
        >
          ${(0,l.kg)("editor.animated_clock.clock_face",n,"Clock Face")}
        </div>

        <!-- Face Outline Color -->
        <div style="margin-bottom: 16px;">
          <label
            style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
          >
            ${(0,l.kg)("editor.animated_clock.face_outline",n,"Outline Color")}
          </label>
          <ultra-color-picker
            .value="${e.analog_face_outline_color||e.clock_color||"var(--primary-text-color)"}"
            .hass="${o}"
            @value-changed="${e=>{a({analog_face_outline_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
            style="width: 100%; height: 40px;"
          ></ultra-color-picker>
        </div>

        <!-- Face Background -->
        <div style="margin-top: 16px;">
          ${t.renderFieldSection((0,l.kg)("editor.animated_clock.face_background_type",n,"Background Type"),"",o,{analog_face_background_type:e.analog_face_background_type||"color"},[t.selectField("analog_face_background_type",[{value:"color",label:"Color"},{value:"upload",label:"Upload Image"},{value:"entity",label:"Entity Image"},{value:"url",label:"Image URL"}])],(o=>{o.detail.value.analog_face_background_type!==e.analog_face_background_type&&(a(o.detail.value),(null==t?void 0:t.requestUpdate)&&t.requestUpdate(),setTimeout((()=>t.triggerPreviewUpdate()),50))}),!1)}
        </div>

        <!-- Background Color (shown when type is 'color') -->
        ${"color"===(e.analog_face_background_type||"color")?r.qy`
              <div style="margin-bottom: 16px;">
                <label
                  style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
                >
                  ${(0,l.kg)("editor.animated_clock.face_background",n,"Background Color")}
                </label>
                <ultra-color-picker
                  .value="${e.analog_face_background_color||e.clock_background||"var(--card-background-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({analog_face_background_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}

        <!-- Entity Image (shown when type is 'entity') -->
        ${"entity"===e.analog_face_background_type?r.qy`
              <div style="margin-bottom: 16px;">
                <ha-form
                  .hass=${o}
                  .data=${{entity:e.analog_face_background_image_entity||""}}
                  .schema=${[{name:"entity",selector:{entity:{}}}]}
                  .computeLabel=${()=>(0,l.kg)("editor.animated_clock.background_entity",n,"Background Image Entity")}
                  @value-changed=${e=>{a({analog_face_background_image_entity:e.detail.value.entity}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}
                ></ha-form>
              </div>
            `:""}

        <!-- Upload Image (shown when type is 'upload') -->
        ${"upload"===e.analog_face_background_type?r.qy`
              <div style="margin-bottom: 16px;">
                <label
                  style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
                >
                  ${(0,l.kg)("editor.animated_clock.upload_background",n,"Upload Background Image")}
                </label>
                <div style="margin-top: 8px;">
                  <label
                    style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--primary-color); color: var(--text-primary-color); border-radius: 6px; cursor: pointer;"
                  >
                    <ha-icon icon="mdi:upload"></ha-icon>
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      @change="${async e=>{var r;const l=null===(r=e.target.files)||void 0===r?void 0:r[0];if(l&&o)try{const e=await(0,i.uploadImage)(o,l);a({analog_face_background_image_upload:e}),setTimeout((()=>t.triggerPreviewUpdate()),50)}catch(e){console.error("Image upload failed:",e),alert(`Upload failed: ${e instanceof Error?e.message:"Unknown error"}`)}}}"
                      style="display: none"
                    />
                  </label>
                  <div
                    style="margin-top: 8px; padding: 8px; background: var(--secondary-background-color); border-radius: 4px; font-size: 12px;"
                  >
                    ${e.analog_face_background_image_upload?r.qy`<span title="${e.analog_face_background_image_upload}">
                          ${s=e.analog_face_background_image_upload,s?s.length<=30?s:"..."+s.slice(-27):""}
                        </span>`:r.qy`<span style="color: var(--secondary-text-color);"
                          >No file chosen</span
                        >`}
                  </div>
                </div>
              </div>
            `:""}

        <!-- Image URL (shown when type is 'url') -->
        ${"url"===e.analog_face_background_type?r.qy`
              <div style="margin-bottom: 16px;">
                <label
                  style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
                >
                  ${(0,l.kg)("editor.animated_clock.background_url",n,"Image URL")}
                </label>
                <input
                  type="text"
                  .value="${e.analog_face_background_image_url||""}"
                  @input="${e=>{const o=e.target;a({analog_face_background_image_url:o.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color); font-size: 14px;"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            `:""}

        <!-- Background Image Options (shown when type is not 'color') -->
        ${e.analog_face_background_type&&"color"!==e.analog_face_background_type?r.qy`
              <div style="margin-bottom: 16px;">
                <label
                  style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
                >
                  ${(0,l.kg)("editor.animated_clock.background_size",n,"Background Size")}
                </label>
                ${t.renderFieldSection("","",o,{analog_face_background_size:e.analog_face_background_size||"cover"},[t.selectField("analog_face_background_size",[{value:"cover",label:"Cover"},{value:"contain",label:"Contain"},{value:"auto",label:"Auto"},{value:"100% 100%",label:"Stretch"}])],(e=>{a(e.detail.value),setTimeout((()=>t.triggerPreviewUpdate()),50)}),!1)}
              </div>

              <div style="margin-bottom: 16px;">
                <label
                  style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
                >
                  ${(0,l.kg)("editor.animated_clock.background_position",n,"Background Position")}
                </label>
                ${t.renderFieldSection("","",o,{analog_face_background_position:e.analog_face_background_position||"center"},[t.selectField("analog_face_background_position",[{value:"center",label:"Center"},{value:"top",label:"Top"},{value:"bottom",label:"Bottom"},{value:"left",label:"Left"},{value:"right",label:"Right"}])],(e=>{a(e.detail.value),setTimeout((()=>t.triggerPreviewUpdate()),50)}),!1)}
              </div>

              <div style="margin-bottom: 16px;">
                <label
                  style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
                >
                  ${(0,l.kg)("editor.animated_clock.background_repeat",n,"Background Repeat")}
                </label>
                ${t.renderFieldSection("","",o,{analog_face_background_repeat:e.analog_face_background_repeat||"no-repeat"},[t.selectField("analog_face_background_repeat",[{value:"no-repeat",label:"No Repeat"},{value:"repeat",label:"Repeat"},{value:"repeat-x",label:"Repeat X"},{value:"repeat-y",label:"Repeat Y"}])],(e=>{a(e.detail.value),setTimeout((()=>t.triggerPreviewUpdate()),50)}),!1)}
              </div>
            `:""}
      </div>
    `:"neon"===c?r.qy`
      <!-- Hours -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_hours}"
            @change="${e=>{const o=e.target;a({show_hours:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.show_hours",n,"Hours")}</span
          >
        </label>
        ${!1!==e.show_hours?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.neon_hours_color||"#00ffff"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({neon_hours_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Minutes -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_minutes}"
            @change="${e=>{const o=e.target;a({show_minutes:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.show_minutes",n,"Minutes")}</span
          >
        </label>
        ${!1!==e.show_minutes?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.neon_minutes_color||"#00ffff"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({neon_minutes_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Seconds -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_seconds}"
            @change="${e=>{const o=e.target;a({show_seconds:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.show_seconds",n,"Seconds")}</span
          >
        </label>
        ${!1!==e.show_seconds?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.neon_seconds_color||"#00ffff"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({neon_seconds_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Separators -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_separators}"
            @change="${e=>{const o=e.target;a({show_separators:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.show_separators",n,"Separators (:)")}</span
          >
        </label>
        ${!1!==e.show_separators?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.neon_separator_color||"#ff00ff"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({neon_separator_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- AM/PM (12-hour format only) -->
      ${"12"===e.time_format?r.qy`
            <div style="margin-bottom: 20px;">
              <label
                style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
              >
                <ha-switch
                  .checked="${!1!==e.show_ampm}"
                  @change="${e=>{const o=e.target;a({show_ampm:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                ></ha-switch>
                <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
                  >${(0,l.kg)("editor.animated_clock.show_ampm",n,"AM/PM")}</span
                >
              </label>
              ${!1!==e.show_ampm?r.qy`
                    <div style="margin-top: 8px; padding-left: 40px;">
                      <ultra-color-picker
                        .value="${e.neon_ampm_color||"#00ff00"}"
                        .hass="${o}"
                        @value-changed="${e=>{a({neon_ampm_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                        style="width: 100%; height: 40px;"
                      ></ultra-color-picker>
                    </div>
                  `:""}
            </div>
          `:""}
    `:"flip"===c?r.qy`
      <!-- Flip Tile Background Color -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
        >
          ${(0,l.kg)("editor.animated_clock.flip_tile_color",n,"Tile Background Color")}
        </label>
        <ultra-color-picker
          .value="${e.flip_tile_color||"rgba(0, 0, 0, 0.5)"}"
          .hass="${o}"
          @value-changed="${e=>{a({flip_tile_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          style="width: 100%; height: 40px;"
        ></ultra-color-picker>
      </div>

      <div
        style="border-top: 1px solid var(--divider-color); padding-top: 20px; margin-top: 20px;"
      ></div>

      <!-- Hours -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_hours}"
            @change="${e=>{const o=e.target;a({show_hours:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.show_hours",n,"Hours")}</span
          >
        </label>
        ${!1!==e.show_hours?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.flip_hours_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({flip_hours_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Minutes -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_minutes}"
            @change="${e=>{const o=e.target;a({show_minutes:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.show_minutes",n,"Minutes")}</span
          >
        </label>
        ${!1!==e.show_minutes?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.flip_minutes_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({flip_minutes_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Separators -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_separators}"
            @change="${e=>{const o=e.target;a({show_separators:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.show_separators",n,"Separators (:)")}</span
          >
        </label>
        ${!1!==e.show_separators?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.flip_separator_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({flip_separator_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- AM/PM (12-hour format only) -->
      ${"12"===e.time_format?r.qy`
            <div style="margin-bottom: 20px;">
              <label
                style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
              >
                <ha-switch
                  .checked="${!1!==e.show_ampm}"
                  @change="${e=>{const o=e.target;a({show_ampm:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                ></ha-switch>
                <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
                  >${(0,l.kg)("editor.animated_clock.show_ampm",n,"AM/PM")}</span
                >
              </label>
              ${!1!==e.show_ampm?r.qy`
                    <div style="margin-top: 8px; padding-left: 40px;">
                      <ultra-color-picker
                        .value="${e.flip_ampm_color||"var(--primary-text-color)"}"
                        .hass="${o}"
                        @value-changed="${e=>{a({flip_ampm_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                        style="width: 100%; height: 40px;"
                      ></ultra-color-picker>
                    </div>
                  `:""}
            </div>
          `:""}
    `:"digital"===c?r.qy`
      <!-- Clock Background Color -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
        >
          Clock Background Color
        </label>
        <ultra-color-picker
          .value="${e.digital_background_color||"#000"}"
          .hass="${o}"
          @value-changed="${e=>{a({digital_background_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          style="width: 100%; height: 40px;"
        ></ultra-color-picker>
      </div>

      <div
        style="border-top: 1px solid var(--divider-color); padding-top: 20px; margin-top: 20px;"
      ></div>

      <!-- Hours -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_hours}"
            @change="${e=>{const o=e.target;a({show_hours:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Hours</span
          >
        </label>
        ${!1!==e.show_hours?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.digital_hours_color||"#ff3333"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({digital_hours_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Minutes -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_minutes}"
            @change="${e=>{const o=e.target;a({show_minutes:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Minutes</span
          >
        </label>
        ${!1!==e.show_minutes?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.digital_minutes_color||"#ff3333"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({digital_minutes_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Seconds -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_seconds}"
            @change="${e=>{const o=e.target;a({show_seconds:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Seconds</span
          >
        </label>
        ${!1!==e.show_seconds?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.digital_seconds_color||"#ff3333"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({digital_seconds_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Separators -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_separators}"
            @change="${e=>{const o=e.target;a({show_separators:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Separators (:)</span
          >
        </label>
        ${!1!==e.show_separators?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.digital_separator_color||"#ff3333"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({digital_separator_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- AM/PM (12-hour format only) -->
      ${"12"===e.time_format?r.qy`
            <div style="margin-bottom: 20px;">
              <label
                style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
              >
                <ha-switch
                  .checked="${!1!==e.show_ampm}"
                  @change="${e=>{const o=e.target;a({show_ampm:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                ></ha-switch>
                <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
                  >AM/PM</span
                >
              </label>
              ${!1!==e.show_ampm?r.qy`
                    <div style="margin-top: 8px; padding-left: 40px;">
                      <ultra-color-picker
                        .value="${e.digital_ampm_color||"#33ff33"}"
                        .hass="${o}"
                        @value-changed="${e=>{a({digital_ampm_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                        style="width: 100%; height: 40px;"
                      ></ultra-color-picker>
                    </div>
                  `:""}
            </div>
          `:""}
    `:"minimal"===c?r.qy`
      <!-- Hours -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_hours}"
            @change="${e=>{const o=e.target;a({show_hours:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Hours</span
          >
        </label>
        ${!1!==e.show_hours?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.minimal_hours_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({minimal_hours_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Minutes -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_minutes}"
            @change="${e=>{const o=e.target;a({show_minutes:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Minutes</span
          >
        </label>
        ${!1!==e.show_minutes?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.minimal_minutes_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({minimal_minutes_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Seconds -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_seconds}"
            @change="${e=>{const o=e.target;a({show_seconds:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Seconds</span
          >
        </label>
        ${!1!==e.show_seconds?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.minimal_seconds_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({minimal_seconds_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Separators -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_separators}"
            @change="${e=>{const o=e.target;a({show_separators:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Separators (:)</span
          >
        </label>
        ${!1!==e.show_separators?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.minimal_separator_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({minimal_separator_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- AM/PM (12-hour format only) -->
      ${"12"===e.time_format?r.qy`
            <div style="margin-bottom: 20px;">
              <label
                style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
              >
                <ha-switch
                  .checked="${!1!==e.show_ampm}"
                  @change="${e=>{const o=e.target;a({show_ampm:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                ></ha-switch>
                <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
                  >AM/PM</span
                >
              </label>
              ${!1!==e.show_ampm?r.qy`
                    <div style="margin-top: 8px; padding-left: 40px;">
                      <ultra-color-picker
                        .value="${e.minimal_ampm_color||"var(--primary-text-color)"}"
                        .hass="${o}"
                        @value-changed="${e=>{a({minimal_ampm_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                        style="width: 100%; height: 40px;"
                      ></ultra-color-picker>
                    </div>
                  `:""}
            </div>
          `:""}
    `:"retro"===c?r.qy`
      <!-- Display Background Color -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
        >
          Display Background
        </label>
        <ultra-color-picker
          .value="${e.retro_background_color||"linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)"}"
          .hass="${o}"
          @value-changed="${e=>{a({retro_background_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          style="width: 100%; height: 40px;"
        ></ultra-color-picker>
      </div>

      <div
        style="border-top: 1px solid var(--divider-color); padding-top: 20px; margin-top: 20px;"
      ></div>

      <!-- Hours -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_hours}"
            @change="${e=>{const o=e.target;a({show_hours:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Hours</span
          >
        </label>
        ${!1!==e.show_hours?r.qy`
              <div
                style="margin-top: 8px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
              >
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Tile Background</label
                >
                <ultra-color-picker
                  .value="${e.retro_hours_tile_color||"rgba(0, 0, 0, 0.3)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({retro_hours_tile_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Digit Color</label
                >
                <ultra-color-picker
                  .value="${e.retro_hours_color||"#ffa500"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({retro_hours_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Minutes -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_minutes}"
            @change="${e=>{const o=e.target;a({show_minutes:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Minutes</span
          >
        </label>
        ${!1!==e.show_minutes?r.qy`
              <div
                style="margin-top: 8px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
              >
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Tile Background</label
                >
                <ultra-color-picker
                  .value="${e.retro_minutes_tile_color||"rgba(0, 0, 0, 0.3)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({retro_minutes_tile_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Digit Color</label
                >
                <ultra-color-picker
                  .value="${e.retro_minutes_color||"#ffa500"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({retro_minutes_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Seconds -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_seconds}"
            @change="${e=>{const o=e.target;a({show_seconds:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Seconds</span
          >
        </label>
        ${!1!==e.show_seconds?r.qy`
              <div
                style="margin-top: 8px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
              >
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Tile Background</label
                >
                <ultra-color-picker
                  .value="${e.retro_seconds_tile_color||"rgba(0, 0, 0, 0.3)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({retro_seconds_tile_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Digit Color</label
                >
                <ultra-color-picker
                  .value="${e.retro_seconds_color||"#ffa500"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({retro_seconds_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Separators -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_separators}"
            @change="${e=>{const o=e.target;a({show_separators:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Separators (:)</span
          >
        </label>
        ${!1!==e.show_separators?r.qy`
              <div
                style="margin-top: 8px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
              >
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Tile Background</label
                >
                <ultra-color-picker
                  .value="${e.retro_separator_tile_color||"rgba(0, 0, 0, 0.3)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({retro_separator_tile_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Colon Color</label
                >
                <ultra-color-picker
                  .value="${e.retro_separator_color||"#ffa500"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({retro_separator_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- AM/PM (12-hour format only) -->
      ${"12"===e.time_format?r.qy`
            <div style="margin-bottom: 20px;">
              <label
                style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
              >
                <ha-switch
                  .checked="${!1!==e.show_ampm}"
                  @change="${e=>{const o=e.target;a({show_ampm:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                ></ha-switch>
                <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
                  >AM/PM</span
                >
              </label>
              ${!1!==e.show_ampm?r.qy`
                    <div style="margin-top: 8px; padding-left: 40px;">
                      <ultra-color-picker
                        .value="${e.retro_ampm_color||"#00ff00"}"
                        .hass="${o}"
                        @value-changed="${e=>{a({retro_ampm_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                        style="width: 100%; height: 40px;"
                      ></ultra-color-picker>
                    </div>
                  `:""}
            </div>
          `:""}
    `:"material"===c?r.qy`
      <!-- Card Background Color -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
        >
          Card Background
        </label>
        <ultra-color-picker
          .value="${e.material_background_color||"var(--card-background-color)"}"
          .hass="${o}"
          @value-changed="${e=>{a({material_background_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          style="width: 100%; height: 40px;"
        ></ultra-color-picker>
      </div>

      <div
        style="border-top: 1px solid var(--divider-color); padding-top: 20px; margin-top: 20px;"
      ></div>

      <!-- Hours -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_hours}"
            @change="${e=>{const o=e.target;a({show_hours:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Hours</span
          >
        </label>
        ${!1!==e.show_hours?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.material_hours_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({material_hours_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Minutes -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_minutes}"
            @change="${e=>{const o=e.target;a({show_minutes:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Minutes</span
          >
        </label>
        ${!1!==e.show_minutes?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.material_minutes_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({material_minutes_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Seconds -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_seconds}"
            @change="${e=>{const o=e.target;a({show_seconds:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Seconds</span
          >
        </label>
        ${!1!==e.show_seconds?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.material_seconds_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({material_seconds_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Separators -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_separators}"
            @change="${e=>{const o=e.target;a({show_separators:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Separators (:)</span
          >
        </label>
        ${!1!==e.show_separators?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.material_separator_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({material_separator_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- AM/PM (12-hour format only) -->
      ${"12"===e.time_format?r.qy`
            <div style="margin-bottom: 20px;">
              <label
                style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
              >
                <ha-switch
                  .checked="${!1!==e.show_ampm}"
                  @change="${e=>{const o=e.target;a({show_ampm:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                ></ha-switch>
                <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
                  >AM/PM</span
                >
              </label>
              ${!1!==e.show_ampm?r.qy`
                    <div style="margin-top: 8px; padding-left: 40px;">
                      <ultra-color-picker
                        .value="${e.material_ampm_color||"var(--primary-text-color)"}"
                        .hass="${o}"
                        @value-changed="${e=>{a({material_ampm_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                        style="width: 100%; height: 40px;"
                      ></ultra-color-picker>
                    </div>
                  `:""}
            </div>
          `:""}
    `:"binary"===c?r.qy`
      <!-- Hours -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_hours}"
            @change="${e=>{const o=e.target;a({show_hours:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Hours</span
          >
        </label>
        ${!1!==e.show_hours?r.qy`
              <div
                style="margin-top: 12px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
              >
                <label style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;"
                  >Empty Dots</label
                >
                <ultra-color-picker
                  .value="${e.binary_hours_empty_color||"rgba(128, 128, 128, 0.2)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({binary_hours_empty_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px; margin-bottom: 16px;"
                ></ultra-color-picker>
                <label style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;"
                  >Filled Dots</label
                >
                <ultra-color-picker
                  .value="${e.binary_hours_filled_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({binary_hours_filled_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px; margin-bottom: 16px;"
                ></ultra-color-picker>
                ${!1!==e.show_labels?r.qy`
                      <label
                        style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;"
                        >Label (HH)</label
                      >
                      <ultra-color-picker
                        .value="${e.binary_hours_label_color||"var(--primary-text-color)"}"
                        .hass="${o}"
                        @value-changed="${e=>{a({binary_hours_label_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                        style="width: 100%; height: 40px;"
                      ></ultra-color-picker>
                    `:""}
              </div>
            `:""}
      </div>

      <!-- Minutes -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_minutes}"
            @change="${e=>{const o=e.target;a({show_minutes:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Minutes</span
          >
        </label>
        ${!1!==e.show_minutes?r.qy`
              <div
                style="margin-top: 12px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
              >
                <label style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;"
                  >Empty Dots</label
                >
                <ultra-color-picker
                  .value="${e.binary_minutes_empty_color||"rgba(128, 128, 128, 0.2)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({binary_minutes_empty_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px; margin-bottom: 16px;"
                ></ultra-color-picker>
                <label style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;"
                  >Filled Dots</label
                >
                <ultra-color-picker
                  .value="${e.binary_minutes_filled_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({binary_minutes_filled_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px; margin-bottom: 16px;"
                ></ultra-color-picker>
                ${!1!==e.show_labels?r.qy`
                      <label
                        style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;"
                        >Label (MM)</label
                      >
                      <ultra-color-picker
                        .value="${e.binary_minutes_label_color||"var(--primary-text-color)"}"
                        .hass="${o}"
                        @value-changed="${e=>{a({binary_minutes_label_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                        style="width: 100%; height: 40px;"
                      ></ultra-color-picker>
                    `:""}
              </div>
            `:""}
      </div>

      <!-- Seconds -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_seconds}"
            @change="${e=>{const o=e.target;a({show_seconds:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Seconds</span
          >
        </label>
        ${!1!==e.show_seconds?r.qy`
              <div
                style="margin-top: 12px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
              >
                <label style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;"
                  >Empty Dots</label
                >
                <ultra-color-picker
                  .value="${e.binary_seconds_empty_color||"rgba(128, 128, 128, 0.2)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({binary_seconds_empty_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px; margin-bottom: 16px;"
                ></ultra-color-picker>
                <label style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;"
                  >Filled Dots</label
                >
                <ultra-color-picker
                  .value="${e.binary_seconds_filled_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({binary_seconds_filled_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px; margin-bottom: 16px;"
                ></ultra-color-picker>
                ${!1!==e.show_labels?r.qy`
                      <label
                        style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;"
                        >Label (SS)</label
                      >
                      <ultra-color-picker
                        .value="${e.binary_seconds_label_color||"var(--primary-text-color)"}"
                        .hass="${o}"
                        @value-changed="${e=>{a({binary_seconds_label_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                        style="width: 100%; height: 40px;"
                      ></ultra-color-picker>
                    `:""}
              </div>
            `:""}
      </div>

      <!-- Labels (H M S) -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_labels}"
            @change="${e=>{const o=e.target;a({show_labels:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Labels (HH MM SS)</span
          >
        </label>
      </div>

      <!-- Separators -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_separators}"
            @change="${e=>{const o=e.target;a({show_separators:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Separators (:)</span
          >
        </label>
        ${!1!==e.show_separators?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.binary_separator_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({binary_separator_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>
    `:"word"===c?r.qy`
      <!-- Prefix ("It is") -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_prefix}"
            @change="${e=>{const o=e.target;a({show_prefix:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >"It is" Prefix</span
          >
        </label>
        ${!1!==e.show_prefix?r.qy`
              <div
                style="margin-top: 8px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
              >
                <label style="font-size: 12px; color: var(--secondary-text-color);">Color</label>
                <ultra-color-picker
                  .value="${e.text_prefix_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({text_prefix_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Font Size (px)</label
                >
                <input
                  type="number"
                  .value="${e.text_prefix_size||38}"
                  @input="${e=>{const o=parseInt(e.target.value)||38;a({text_prefix_size:o}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  min="10"
                  max="100"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color); font-size: 14px;"
                />
              </div>
            `:""}
      </div>

      <!-- Hours -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_hours}"
            @change="${e=>{const o=e.target;a({show_hours:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Hours</span
          >
        </label>
        ${!1!==e.show_hours?r.qy`
              <div
                style="margin-top: 8px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
              >
                <label style="font-size: 12px; color: var(--secondary-text-color);">Color</label>
                <ultra-color-picker
                  .value="${e.text_hours_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({text_hours_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Font Size (px)</label
                >
                <input
                  type="number"
                  .value="${e.text_hours_size||48}"
                  @input="${e=>{const o=parseInt(e.target.value)||48;a({text_hours_size:o}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  min="10"
                  max="100"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color); font-size: 14px;"
                />
              </div>
            `:""}
      </div>

      <!-- Minutes -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_minutes}"
            @change="${e=>{const o=e.target;a({show_minutes:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Minutes</span
          >
        </label>
        ${!1!==e.show_minutes?r.qy`
              <div
                style="margin-top: 8px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
              >
                <label style="font-size: 12px; color: var(--secondary-text-color);">Color</label>
                <ultra-color-picker
                  .value="${e.text_minutes_color||"var(--primary-text-color)"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({text_minutes_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Font Size (px)</label
                >
                <input
                  type="number"
                  .value="${e.text_minutes_size||48}"
                  @input="${e=>{const o=parseInt(e.target.value)||48;a({text_minutes_size:o}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  min="10"
                  max="100"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color); font-size: 14px;"
                />
              </div>
            `:""}
      </div>

      <!-- AM/PM (12-hour format only) -->
      ${"12"===e.time_format?r.qy`
            <div style="margin-bottom: 20px;">
              <label
                style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
              >
                <ha-switch
                  .checked="${!1!==e.show_ampm}"
                  @change="${e=>{const o=e.target;a({show_ampm:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                ></ha-switch>
                <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
                  >AM/PM</span
                >
              </label>
              ${!1!==e.show_ampm?r.qy`
                    <div
                      style="margin-top: 8px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
                    >
                      <label style="font-size: 12px; color: var(--secondary-text-color);"
                        >Color</label
                      >
                      <ultra-color-picker
                        .value="${e.text_ampm_color||"var(--primary-text-color)"}"
                        .hass="${o}"
                        @value-changed="${e=>{a({text_ampm_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                        style="width: 100%; height: 40px;"
                      ></ultra-color-picker>
                      <label style="font-size: 12px; color: var(--secondary-text-color);"
                        >Font Size (px)</label
                      >
                      <input
                        type="number"
                        .value="${e.text_ampm_size||24}"
                        @input="${e=>{const o=parseInt(e.target.value)||24;a({text_ampm_size:o}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                        min="10"
                        max="100"
                        style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color); font-size: 14px;"
                      />
                    </div>
                  `:""}
            </div>
          `:""}
    `:"terminal"===c?r.qy`
      <!-- Terminal Background Color -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
        >
          Terminal Background
        </label>
        <ultra-color-picker
          .value="${e.terminal_background_color||"#1e1e1e"}"
          .hass="${o}"
          @value-changed="${e=>{a({terminal_background_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          style="width: 100%; height: 40px;"
        ></ultra-color-picker>
      </div>

      <div
        style="border-top: 1px solid var(--divider-color); padding-top: 20px; margin-top: 20px;"
      ></div>

      <!-- Terminal Prompt -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_prompt}"
            @change="${e=>{const o=e.target;a({show_prompt:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.show_prompt",n,"Terminal Prompt")}</span
          >
        </label>
        ${!1!==e.show_prompt?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.terminal_line1_color||"#4ec9b0"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({terminal_line1_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Terminal Command -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_command}"
            @change="${e=>{const o=e.target;a({show_command:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.show_command",n,"Terminal Command")}</span
          >
        </label>
        ${!1!==e.show_command?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.terminal_line2_color||"#ce9178"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({terminal_line2_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Hours -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_hours}"
            @change="${e=>{const o=e.target;a({show_hours:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.show_hours",n,"Hours")}</span
          >
        </label>
        ${!1!==e.show_hours?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.terminal_hours_color||"#d4d4d4"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({terminal_hours_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Minutes -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_minutes}"
            @change="${e=>{const o=e.target;a({show_minutes:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.show_minutes",n,"Minutes")}</span
          >
        </label>
        ${!1!==e.show_minutes?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.terminal_minutes_color||"#d4d4d4"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({terminal_minutes_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Seconds -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_seconds}"
            @change="${e=>{const o=e.target;a({show_seconds:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.show_seconds",n,"Seconds")}</span
          >
        </label>
        ${!1!==e.show_seconds?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.terminal_seconds_color||"#d4d4d4"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({terminal_seconds_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Separators -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_separators}"
            @change="${e=>{const o=e.target;a({show_separators:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.show_separators",n,"Separators (:)")}</span
          >
        </label>
        ${!1!==e.show_separators?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.terminal_separator_color||"#d4d4d4"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({terminal_separator_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- AM/PM (12-hour format only) -->
      ${"12"===e.time_format?r.qy`
            <div style="margin-bottom: 20px;">
              <label
                style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
              >
                <ha-switch
                  .checked="${!1!==e.show_ampm}"
                  @change="${e=>{const o=e.target;a({show_ampm:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                ></ha-switch>
                <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
                  >AM/PM</span
                >
              </label>
              ${!1!==e.show_ampm?r.qy`
                    <div style="margin-top: 8px; padding-left: 40px;">
                      <ultra-color-picker
                        .value="${e.terminal_ampm_color||"#d4d4d4"}"
                        .hass="${o}"
                        @value-changed="${e=>{a({terminal_ampm_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                        style="width: 100%; height: 40px;"
                      ></ultra-color-picker>
                    </div>
                  `:""}
            </div>
          `:""}

      <!-- Cursor -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${!1!==e.show_cursor}"
            @change="${e=>{const o=e.target;a({show_cursor:o.checked}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${(0,l.kg)("editor.animated_clock.show_cursor",n,"Blinking Cursor")}</span
          >
        </label>
        ${!1!==e.show_cursor?r.qy`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${e.terminal_cursor_color||"#4ec9b0"}"
                  .hass="${o}"
                  @value-changed="${e=>{a({terminal_cursor_color:e.detail.value}),setTimeout((()=>t.triggerPreviewUpdate()),50)}}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `:""}
      </div>
    `:r.qy`
    <div style="text-align: center; padding: 20px; color: var(--secondary-text-color);">
      Select a clock style to customize
    </div>
  `;var s}(s,a,n,e,p)}
      </div>
    </div>
  `}(this,e,o,0,t)}renderPreview(e,o,a,t){const l=e,i=l,c=i.design||{},s=parseInt(l.update_frequency||"1");n.D.registerClock(l.id,s);const p=new Date,d=p.getHours(),g=d%12||12,m="24"===l.time_format?d:g,u=p.getMinutes(),h=p.getSeconds(),_=p.getMilliseconds(),x=d>=12?"PM":"AM";let v;switch(l.clock_style||"flip"){case"flip":default:v=this._renderFlipClock(m,u,x,l);break;case"digital":v=this._renderDigitalClock(m,u,h,x,l);break;case"analog":v=this._renderAnalogClock(m,u,h,_,o,l);break;case"binary":v=this._renderBinaryClock(d,u,h,l);break;case"minimal":v=this._renderMinimalClock(m,u,h,x,l);break;case"retro":v=this._renderRetroClock(m,u,h,x,l);break;case"word":v=this._renderTextClock(m,u,x,l);break;case"neon":v=this._renderNeonClock(m,u,h,x,l);break;case"material":v=this._renderMaterialClock(m,u,h,x,l);break;case"terminal":v=this._renderTerminalClock(m,u,h,x,l)}const y=this.createGestureHandlers(l.id,{tap_action:l.tap_action,hold_action:l.hold_action,double_tap_action:l.double_tap_action,entity:l.entity,module:l},o,a),k=l.tap_action&&"nothing"!==l.tap_action.action||l.hold_action&&"nothing"!==l.hold_action.action||l.double_tap_action&&"nothing"!==l.double_tap_action.action,b={padding:c.padding_top||c.padding_bottom||c.padding_left||c.padding_right||i.padding_top||i.padding_bottom||i.padding_left||i.padding_right?`${this.addPixelUnit(c.padding_top||i.padding_top)||"0px"} ${this.addPixelUnit(c.padding_right||i.padding_right)||"0px"} ${this.addPixelUnit(c.padding_bottom||i.padding_bottom)||"0px"} ${this.addPixelUnit(c.padding_left||i.padding_left)||"0px"}`:"16px",margin:c.margin_top||c.margin_bottom||c.margin_left||c.margin_right||i.margin_top||i.margin_bottom||i.margin_left||i.margin_right?`${c.margin_top||i.margin_top||"8px"} ${c.margin_right||i.margin_right||"0px"} ${c.margin_bottom||i.margin_bottom||"8px"} ${c.margin_left||i.margin_left||"0px"}`:"8px 0",background:c.background_color||i.background_color||"transparent",backgroundImage:this.getBackgroundImageCSS(Object.assign(Object.assign({},i),c),o),backgroundSize:c.background_size||i.background_size||"cover",backgroundPosition:c.background_position||i.background_position||"center",backgroundRepeat:c.background_repeat||i.background_repeat||"no-repeat",border:(c.border_style||i.border_style)&&"none"!==(c.border_style||i.border_style)?`${c.border_width||i.border_width||"1px"} ${c.border_style||i.border_style} ${c.border_color||i.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(c.border_radius||i.border_radius)||"0",position:c.position||i.position||"static",top:c.top||i.top||"auto",bottom:c.bottom||i.bottom||"auto",left:c.left||i.left||"auto",right:c.right||i.right||"auto",zIndex:c.z_index||i.z_index||"auto",width:c.width||i.width||"100%",height:c.height||i.height||"auto",maxWidth:c.max_width||i.max_width||"100%",maxHeight:c.max_height||i.max_height||"none",minWidth:c.min_width||i.min_width||"auto",minHeight:c.min_height||i.min_height||"50px",boxShadow:c.box_shadow||i.box_shadow||void 0,backdropFilter:c.backdrop_filter||i.backdrop_filter||void 0,clipPath:c.clip_path||i.clip_path||void 0,overflow:c.overflow||i.overflow||"visible",display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column",boxSizing:"border-box",cursor:k?"pointer":"default"};return r.qy`
      <style>
        ${this.getStyles()}
      </style>
      <div
        style=${this.objectToStyleString(b)}
        @pointerdown=${y.onPointerDown}
        @pointerup=${y.onPointerUp}
        @pointerleave=${y.onPointerLeave}
      >
        <div
          class="animated-clock-module-container"
          style="
            --clock-size: ${l.clock_size||50}px;
            --clock-size-value: ${l.clock_size||50};
            --clock-color: ${l.clock_color||"var(--primary-text-color)"};
            --clock-background: ${l.clock_background||"var(--card-background-color)"};
          "
        >
          ${v}
        </div>
      </div>
    `}_renderFlipClock(e,o,a,t){const l=!1!==t.show_hours,i=!1!==t.show_minutes,n=!1!==t.show_ampm,c=!1!==t.show_separators,s=t.flip_tile_color||"rgba(0, 0, 0, 0.5)",p=t.flip_hours_color||t.clock_color||"var(--primary-text-color)",d=t.flip_minutes_color||t.clock_color||"var(--primary-text-color)",g=t.flip_separator_color||t.clock_color||"var(--primary-text-color)",m=t.flip_ampm_color||t.clock_color||"var(--primary-text-color)";return r.qy`
      <div class="flip-clock" style="--flip-tile-color: ${s};">
        ${l?r.qy`
              <div class="flip-unit">
                <div class="flip-digit-display" style="color: ${p};">
                  ${String(Math.floor(e/10))}
                </div>
              </div>
              <div class="flip-unit">
                <div class="flip-digit-display" style="color: ${p};">
                  ${String(e%10)}
                </div>
              </div>
            `:""}
        ${c&&l&&i?r.qy`<div class="flip-separator" style="color: ${g};">:</div>`:""}
        ${i?r.qy`
              <div class="flip-unit">
                <div class="flip-digit-display" style="color: ${d};">
                  ${String(Math.floor(o/10))}
                </div>
              </div>
              <div class="flip-unit">
                <div class="flip-digit-display" style="color: ${d};">
                  ${String(o%10)}
                </div>
              </div>
            `:""}
        ${"12"===t.time_format&&n?r.qy`<div class="flip-ampm" style="color: ${m};">${a}</div>`:""}
      </div>
    `}_renderDigitalClock(e,o,a,t,l){const i=!1!==l.show_hours,n=!1!==l.show_minutes,c=!1!==l.show_seconds,s=!1!==l.show_ampm,p=!1!==l.show_separators,d=String(e).padStart(2,"0"),g=String(o).padStart(2,"0"),m=String(a).padStart(2,"0"),u=l.digital_background_color||"#000",h=l.digital_hours_color||"#ff3333",_=l.digital_minutes_color||"#ff3333",x=l.digital_seconds_color||"#ff3333",v=l.digital_separator_color||"#ff3333",y=l.digital_ampm_color||"#33ff33";return r.qy`
      <div class="digital-clock">
        <div class="digital-display" style="background: ${u};">
          <span class="digital-time">
            ${i?r.qy`<span
                  style="color: ${h}; text-shadow: 0 0 10px ${h}, 0 0 20px ${h}, 0 0 30px ${h};"
                  >${d}</span
                >`:""}
            ${i&&n&&p?r.qy`<span
                  style="color: ${v}; text-shadow: 0 0 10px ${v}, 0 0 20px ${v}, 0 0 30px ${v};"
                  >:</span
                >`:""}
            ${n?r.qy`<span
                  style="color: ${_}; text-shadow: 0 0 10px ${_}, 0 0 20px ${_}, 0 0 30px ${_};"
                  >${g}</span
                >`:""}
            ${n&&c&&p?r.qy`<span
                  style="color: ${v}; text-shadow: 0 0 10px ${v}, 0 0 20px ${v}, 0 0 30px ${v};"
                  >:</span
                >`:""}
            ${c?r.qy`<span
                  style="color: ${x}; text-shadow: 0 0 10px ${x}, 0 0 20px ${x}, 0 0 30px ${x};"
                  >${m}</span
                >`:""}
          </span>
          ${"12"===l.time_format&&s?r.qy`<span
                class="digital-ampm"
                style="color: ${y}; text-shadow: 0 0 8px ${y}, 0 0 16px ${y};"
                >${t}</span
              >`:""}
        </div>
      </div>
    `}_renderAnalogClock(e,o,a,t,l,n){const c=!1!==n.analog_show_seconds,s=!1!==n.analog_smooth_seconds,p=!1!==n.analog_show_hour_hand,d=!1!==n.analog_show_minute_hand,g=!1!==n.analog_show_hour_markers,m=!1!==n.analog_show_center_dot,u=!0===n.analog_show_numbers,h=!0===n.analog_show_hour_ticks,_=!0===n.analog_show_minute_ticks,x=e%12,v=a+t/1e3,y=s?v:Math.floor(v),k=60*o+v,b=3600*x+60*o+v,f=n.analog_hour_hand_color||n.clock_color||"var(--primary-color)",w=n.analog_minute_hand_color||n.clock_color||"var(--primary-color)",$=n.analog_second_hand_color||"var(--error-color)",z=n.analog_hour_marker_color||n.clock_color||"var(--primary-text-color)",T=n.analog_center_dot_color||n.clock_color||"var(--error-color)",P=n.analog_numbers_color||n.clock_color||"var(--primary-text-color)",U=n.analog_hour_ticks_color||n.clock_color||"var(--primary-text-color)",q=n.analog_minute_ticks_color||n.clock_color||"var(--disabled-text-color)",S=n.analog_face_outline_color||n.clock_color||"var(--primary-text-color)",C=n.analog_face_background_color||n.clock_background||"var(--card-background-color)";let M="";const H=n.analog_face_background_type||"color";if("entity"===H&&n.analog_face_background_image_entity&&l){const e=l.states[n.analog_face_background_image_entity];e&&e.attributes.entity_picture&&(M=e.attributes.entity_picture)}else"upload"===H&&n.analog_face_background_image_upload?M=(0,i.V)(l,n.analog_face_background_image_upload):"url"===H&&n.analog_face_background_image_url&&(M=n.analog_face_background_image_url);const A=n.analog_face_background_size||"cover",I=n.analog_face_background_position||"center",B=n.analog_face_background_repeat||"no-repeat";return r.qy`
      <div class="analog-clock">
        <div
          class="analog-clock-dial"
          style="
          --face-outline-color: ${S};
          --face-background-color: ${"color"===H?C:"transparent"};
          --marker-color: ${z};
          ${M?`\n            background-image: url('${M}');\n            background-size: ${A};\n            background-position: ${I};\n            background-repeat: ${B};\n          `:""}
        "
        >
          <!-- SVG for static elements (face, markers, numbers, ticks) -->
          <svg viewBox="0 0 200 200" class="analog-face-svg" xmlns="http://www.w3.org/2000/svg">
            <!-- Clock face circle (drawn first, appears in back) -->
            <circle cx="100" cy="100" r="93.5" class="clock-face-circle" />

            <!-- Hour markers -->
            ${g?[...Array(12)].map(((e,o)=>{const a=(30*o-90)*(Math.PI/180),t=100+85*Math.cos(a),l=100+85*Math.sin(a),i=100+75*Math.cos(a),n=100+75*Math.sin(a);return r.qy`<line
                    x1="${t}"
                    y1="${l}"
                    x2="${i}"
                    y2="${n}"
                    class="hour-marker"
                  />`})):""}

            <!-- Clock numbers (1-12) - drawn last, appears on top -->
            ${u?[...Array(12)].map(((e,o)=>{const a=0===o?12:o,t=(30*o-90)*(Math.PI/180),l=100+65*Math.cos(t),i=100+65*Math.sin(t);return r.qy`<text
                    x="${l}"
                    y="${i}"
                    font-size="22"
                    font-weight="900"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    font-family="Arial, sans-serif"
                    class="clock-number"
                    fill="${P}"
                    stroke="${C}"
                    stroke-width="0.5"
                    paint-order="stroke fill"
                    >${a}</text
                  >`})):""}
          </svg>

          <!-- Clock hands using CSS animations (HA native approach) -->
          ${p?r.qy`<div
                class="clock-hand clock-hand-hour"
                style="
                  background: ${f};
                  animation-delay: -${b}s;
                "
              ></div>`:""}
          ${d?r.qy`<div
                class="clock-hand clock-hand-minute"
                style="
                  background: ${w};
                  animation-delay: -${k}s;
                "
              ></div>`:""}
          ${c?r.qy`<div
                class="clock-hand clock-hand-second ${s?"":"step"}"
                style="
                  background: ${$};
                  animation-delay: -${y}s;
                "
              ></div>`:""}

          <!-- Center dot -->
          ${m?r.qy`<div class="clock-center-dot" style="background: ${T};"></div>`:""}

          <!-- Clock numbers as HTML elements (fallback) -->
          ${u?[...Array(12)].map(((e,o)=>{const a=0===o?12:o,t=(30*o-90)*(Math.PI/180),l=50+32.5*Math.cos(t),i=50+32.5*Math.sin(t);return r.qy`<div
                  class="clock-number-html"
                  style="
                    left: ${l}%;
                    top: ${i}%;
                    color: ${P};
                  "
                >
                  ${a}
                </div>`})):""}

          <!-- Hour tick marks as HTML elements (12 major ticks) -->
          ${h?[...Array(12)].map(((e,o)=>{const a=(30*o-90)*(Math.PI/180),t=50+44.75*Math.cos(a),l=50+44.75*Math.sin(a),i=30*o;return r.qy`<div
                  class="clock-hour-tick-html"
                  style="
                    left: ${t}%;
                    top: ${l}%;
                    transform: translate(-50%, -50%) rotate(${i}deg);
                    background: ${U};
                  "
                ></div>`})):""}

          <!-- Minute tick marks as HTML elements (48 minor ticks) -->
          ${_?[...Array(60)].map(((e,o)=>{if(o%5==0)return"";const a=(6*o-90)*(Math.PI/180),t=50+45.25*Math.cos(a),l=50+45.25*Math.sin(a),i=6*o;return r.qy`<div
                  class="clock-minute-tick-html"
                  style="
                    left: ${t}%;
                    top: ${l}%;
                    transform: translate(-50%, -50%) rotate(${i}deg);
                    background: ${q};
                  "
                ></div>`})):""}
        </div>
      </div>
    `}_renderBinaryClock(e,o,a,t){const l=!1!==t.show_hours,i=!1!==t.show_minutes,n=!1!==t.show_seconds,c=!1!==t.show_labels,s=!1!==t.show_separators,p=(e,o=4)=>e.toString(2).padStart(o,"0").split(""),d=p(Math.floor(e/10),4),g=p(e%10,4),m=p(Math.floor(o/10),4),u=p(o%10,4),h=p(Math.floor(a/10),4),_=p(a%10,4),x=[],v=[],y=[];l&&(x.push(d,g),v.push("H","H"),y.push("hours","hours")),i&&(x.push(m,u),v.push("M","M"),y.push("minutes","minutes")),n&&(x.push(h,_),v.push("S","S"),y.push("seconds","seconds"));const k=t.binary_hours_empty_color||"rgba(128, 128, 128, 0.2)",b=t.binary_hours_filled_color||t.clock_color||"var(--primary-text-color)",f=t.binary_minutes_empty_color||"rgba(128, 128, 128, 0.2)",w=t.binary_minutes_filled_color||t.clock_color||"var(--primary-text-color)",$=t.binary_seconds_empty_color||"rgba(128, 128, 128, 0.2)",z=t.binary_seconds_filled_color||t.clock_color||"var(--primary-text-color)",T=t.binary_separator_color||t.clock_color||"var(--primary-text-color)",P=t.binary_hours_label_color||t.clock_color||"var(--primary-text-color)",U=t.binary_minutes_label_color||t.clock_color||"var(--primary-text-color)",q=t.binary_seconds_label_color||t.clock_color||"var(--primary-text-color)";return r.qy`
      <div class="binary-clock">
        ${x.map(((e,o)=>{const a=s&&(l&&i&&1===o||i&&n&&o===(l?3:1)),t=y[o],p="hours"===t?k:"minutes"===t?f:$,d="hours"===t?b:"minutes"===t?w:z,g="hours"===t?P:"minutes"===t?U:q;return r.qy`
            <div class="binary-column">
              ${c?r.qy`<div class="binary-label" style="color: ${g};">
                    ${v[o]}
                  </div>`:""}
              ${e.map((e=>r.qy`
                  <div
                    class="binary-dot ${"1"===e?"active":""}"
                    style="${"1"===e?`background: ${d}; border-color: ${d}; box-shadow: 0 0 10px ${d};`:`background: ${p}; border-color: rgba(128, 128, 128, 0.3);`}"
                  ></div>
                `))}
            </div>
            ${a?r.qy`<div class="binary-separator" style="color: ${T};">:</div>`:""}
          `}))}
      </div>
    `}_renderMinimalClock(e,o,a,t,l){const i=!1!==l.show_hours,n=!1!==l.show_minutes,c=!1!==l.show_seconds,s=!1!==l.show_ampm,p=!1!==l.show_separators,d=String(e).padStart(2,"0"),g=String(o).padStart(2,"0"),m=String(a).padStart(2,"0"),u=l.minimal_hours_color||l.clock_color||"var(--primary-text-color)",h=l.minimal_minutes_color||l.clock_color||"var(--primary-text-color)",_=l.minimal_seconds_color||l.clock_color||"var(--primary-text-color)",x=l.minimal_separator_color||l.clock_color||"var(--primary-text-color)",v=l.minimal_ampm_color||l.clock_color||"var(--primary-text-color)";return r.qy`
      <div class="minimal-clock">
        <div class="minimal-time">
          ${i?r.qy`<span style="color: ${u};">${d}</span>`:""}${p&&i&&n?r.qy`<span class="minimal-separator" style="color: ${x};">:</span>`:""}${n?r.qy`<span style="color: ${h};">${g}</span>`:""}${p&&n&&c?r.qy`<span class="minimal-separator" style="color: ${x};">:</span>`:""}${c?r.qy`<span style="color: ${_};">${m}</span>`:""}
        </div>
        ${"12"===l.time_format&&s?r.qy`<div class="minimal-ampm" style="color: ${v};">${t}</div>`:""}
      </div>
    `}_renderRetroClock(e,o,a,t,l){const i=!1!==l.show_hours,n=!1!==l.show_minutes,c=!1!==l.show_seconds,s=!1!==l.show_ampm,p=!1!==l.show_separators,d=String(e).padStart(2,"0"),g=String(o).padStart(2,"0"),m=String(a).padStart(2,"0"),u=l.retro_background_color||"linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)",h=l.retro_hours_tile_color||"rgba(0, 0, 0, 0.3)",_=l.retro_minutes_tile_color||"rgba(0, 0, 0, 0.3)",x=l.retro_seconds_tile_color||"rgba(0, 0, 0, 0.3)",v=l.retro_separator_tile_color||"rgba(0, 0, 0, 0.3)",y=l.retro_hours_color||"#ffa500",k=l.retro_minutes_color||"#ffa500",b=l.retro_seconds_color||"#ffa500",f=l.retro_separator_color||"#ffa500",w=l.retro_ampm_color||"#00ff00",$=`0 0 5px ${y}, 0 0 10px ${y.replace("500","600")}`,z=`0 0 5px ${k}, 0 0 10px ${k.replace("500","600")}`,T=`0 0 5px ${b}, 0 0 10px ${b.replace("500","600")}`,P=`0 0 5px ${f}, 0 0 10px ${f.replace("500","600")}`;return r.qy`
      <div class="retro-clock">
        <div class="retro-display" style="background: ${u};">
          ${i?r.qy`
                <span
                  class="retro-digit"
                  style="background: ${h}; color: ${y}; text-shadow: ${$};"
                  >${d[0]}</span
                >
                <span
                  class="retro-digit"
                  style="background: ${h}; color: ${y}; text-shadow: ${$};"
                  >${d[1]}</span
                >
              `:""}
          ${p&&i&&n?r.qy`<span
                class="retro-colon"
                style="background: ${v}; color: ${f}; text-shadow: ${P};"
                >:</span
              >`:""}
          ${n?r.qy`
                <span
                  class="retro-digit"
                  style="background: ${_}; color: ${k}; text-shadow: ${z};"
                  >${g[0]}</span
                >
                <span
                  class="retro-digit"
                  style="background: ${_}; color: ${k}; text-shadow: ${z};"
                  >${g[1]}</span
                >
              `:""}
          ${p&&n&&c?r.qy`<span
                class="retro-colon"
                style="background: ${v}; color: ${f}; text-shadow: ${P};"
                >:</span
              >`:""}
          ${c?r.qy`
                <span
                  class="retro-digit"
                  style="background: ${x}; color: ${b}; text-shadow: ${T};"
                  >${m[0]}</span
                >
                <span
                  class="retro-digit"
                  style="background: ${x}; color: ${b}; text-shadow: ${T};"
                  >${m[1]}</span
                >
              `:""}
          ${"12"===l.time_format&&s?r.qy`<span
                class="retro-ampm"
                style="color: ${w}; text-shadow: 0 0 5px ${w.replace("ff00","cc00")};"
                >${t}</span
              >`:""}
        </div>
      </div>
    `}_renderTextClock(e,o,a,t){const l=!1!==t.show_hours,i=!1!==t.show_minutes,n=!1!==t.show_ampm,c=!1!==t.show_prefix,s=t.text_orientation||"horizontal",p=t.text_word_gap||8,d=t.text_prefix_color||"var(--primary-text-color)",g=t.text_hours_color||"var(--primary-text-color)",m=t.text_minutes_color||"var(--primary-text-color)",u=t.text_ampm_color||"var(--primary-text-color)",h=t.text_prefix_size||38,_=t.text_hours_size||48,x=t.text_minutes_size||48,v=t.text_ampm_size||24,y=["twelve","one","two","three","four","five","six","seven","eight","nine","ten","eleven"][e%12],k=0===o?"o'clock":o<10?`oh ${this._numberToWords(o)}`:this._numberToWords(o),b="vertical"===s;return r.qy`
      <div class="text-clock">
        <div
          class="text-display"
          style="
          flex-direction: ${b?"column":"row"};
          gap: calc(${p}px * var(--clock-scale));
        "
        >
          ${c?r.qy`<span
                class="text-word text-prefix"
                style="color: ${d}; font-size: calc(${h}px * var(--clock-scale));"
                >It is</span
              >`:""}
          ${l?r.qy`<span
                class="text-word text-hours"
                style="color: ${g}; font-size: calc(${_}px * var(--clock-scale));"
                >${y}</span
              >`:""}
          ${i?r.qy`<span
                class="text-word text-minutes"
                style="color: ${m}; font-size: calc(${x}px * var(--clock-scale));"
                >${k}</span
              >`:""}
          ${"12"===t.time_format&&n?r.qy`<span
                class="text-word text-ampm"
                style="color: ${u}; font-size: calc(${v}px * var(--clock-scale));"
                >${a}</span
              >`:""}
        </div>
      </div>
    `}_renderNeonClock(e,o,a,t,l){const i=!1!==l.show_hours,n=!1!==l.show_minutes,c=!1!==l.show_seconds,s=!1!==l.show_ampm,p=!1!==l.show_separators,d=l.neon_padding||24,g=l.neon_hours_color||"#00ffff",m=l.neon_minutes_color||"#00ffff",u=l.neon_seconds_color||"#00ffff",h=l.neon_separator_color||"#ff00ff",_=l.neon_ampm_color||"#00ff00",x=String(e).padStart(2,"0"),v=String(o).padStart(2,"0"),y=String(a).padStart(2,"0");return r.qy`
      <div class="neon-clock" style="padding: calc(${d}px * var(--clock-scale));">
        <div class="neon-display">
          ${i?r.qy`<span
                class="neon-digit"
                style="color: ${g}; text-shadow: 0 0 5px ${g}, 0 0 10px ${g}, 0 0 20px ${g}, 0 0 30px ${g}, 0 0 40px ${g};"
                >${x}</span
              >`:""}
          ${p&&i&&n?r.qy`<span
                class="neon-separator"
                style="color: ${h}; text-shadow: 0 0 5px ${h}, 0 0 10px ${h}, 0 0 20px ${h}, 0 0 30px ${h};"
                >:</span
              >`:""}
          ${n?r.qy`<span
                class="neon-digit"
                style="color: ${m}; text-shadow: 0 0 5px ${m}, 0 0 10px ${m}, 0 0 20px ${m}, 0 0 30px ${m}, 0 0 40px ${m};"
                >${v}</span
              >`:""}
          ${p&&n&&c?r.qy`<span
                class="neon-separator"
                style="color: ${h}; text-shadow: 0 0 5px ${h}, 0 0 10px ${h}, 0 0 20px ${h}, 0 0 30px ${h};"
                >:</span
              >`:""}
          ${c?r.qy`<span
                class="neon-digit"
                style="color: ${u}; text-shadow: 0 0 5px ${u}, 0 0 10px ${u}, 0 0 20px ${u}, 0 0 30px ${u}, 0 0 40px ${u};"
                >${y}</span
              >`:""}
          ${"12"===l.time_format&&s?r.qy`<span
                class="neon-ampm"
                style="color: ${_}; text-shadow: 0 0 5px ${_}, 0 0 10px ${_}, 0 0 20px ${_};"
                >${t}</span
              >`:""}
        </div>
      </div>
    `}_renderMaterialClock(e,o,a,t,l){const i=!1!==l.show_hours,n=!1!==l.show_minutes,c=!1!==l.show_seconds,s=!1!==l.show_ampm,p=!1!==l.show_separators,d=l.material_vertical_gap||8,g=String(e).padStart(2,"0"),m=String(o).padStart(2,"0"),u=String(a).padStart(2,"0"),h=l.material_background_color||l.clock_background||"var(--card-background-color)",_=l.material_hours_color||l.clock_color||"var(--primary-text-color)",x=l.material_minutes_color||l.clock_color||"var(--primary-text-color)",v=l.material_seconds_color||l.clock_color||"var(--primary-text-color)",y=l.material_separator_color||l.clock_color||"var(--primary-text-color)",k=l.material_ampm_color||l.clock_color||"var(--primary-text-color)";return r.qy`
      <div class="material-clock">
        <div
          class="material-card"
          style="gap: calc(${d}px * var(--clock-scale)); background: ${h};"
        >
          <div class="material-time">
            ${i?r.qy`<span style="color: ${_};">${g}</span>`:""}
            ${i&&n&&p?r.qy`<span style="color: ${y};">:</span>`:""}
            ${n?r.qy`<span style="color: ${x};">${m}</span>`:""}
          </div>
          ${c||"12"===l.time_format&&s?r.qy`
                <div class="material-seconds">
                  ${c?r.qy`<span style="color: ${v};">${u}</span>`:""}
                  ${"12"===l.time_format&&s?r.qy` <span style="color: ${k};">${t}</span>`:""}
                </div>
              `:""}
        </div>
      </div>
    `}_renderTerminalClock(e,o,a,t,l){const i=!1!==l.show_hours,n=!1!==l.show_minutes,c=!1!==l.show_seconds,s=!1!==l.show_ampm,p=!1!==l.show_separators,d=!1!==l.show_prompt,g=!1!==l.show_command,m=!1!==l.show_cursor,u=l.terminal_background_color||"#1e1e1e",h=l.terminal_line1_color||"#4ec9b0",_=l.terminal_line2_color||"#ce9178",x=l.terminal_cursor_color||"#4ec9b0",v=l.terminal_hours_color||"#d4d4d4",y=l.terminal_minutes_color||"#d4d4d4",k=l.terminal_seconds_color||"#d4d4d4",b=l.terminal_separator_color||"#d4d4d4",f=l.terminal_ampm_color||"#d4d4d4",w=l.terminal_vertical_spacing||8,$=l.terminal_line1_size||17,z=l.terminal_line2_size||17,T=l.terminal_output_size||38,P=String(e).padStart(2,"0"),U=String(o).padStart(2,"0"),q=String(a).padStart(2,"0");return r.qy`
      <div class="terminal-clock" style="background: ${u};">
        ${d?r.qy`<div
              class="terminal-prompt"
              style="font-size: calc(${$}px * var(--clock-scale)); color: ${h}; margin-bottom: calc(${w}px * var(--clock-scale));"
            >
              user@homeassistant:~$
            </div>`:""}
        ${g?r.qy`<div
              class="terminal-command"
              style="font-size: calc(${z}px * var(--clock-scale)); color: ${_}; margin-bottom: calc(${1.5*w}px * var(--clock-scale));"
            >
              date +"%T"
            </div>`:""}
        <div class="terminal-output" style="font-size: calc(${T}px * var(--clock-scale));">
          ${i?r.qy`<span style="color: ${v};">${P}</span>`:""}
          ${i&&n&&p?r.qy`<span style="color: ${b};">:</span>`:""}
          ${n?r.qy`<span style="color: ${y};">${U}</span>`:""}
          ${n&&c&&p?r.qy`<span style="color: ${b};">:</span>`:""}
          ${c?r.qy`<span style="color: ${k};">${q}</span>`:""}
          ${"12"===l.time_format&&s?r.qy` <span style="color: ${f};">${t}</span>`:""}
          ${m?r.qy`<span
                class="terminal-cursor"
                style="background: ${x}; width: calc(${.21*T}px * var(--clock-scale)); height: calc(${T}px * var(--clock-scale)); margin-left: calc(${.105*T}px * var(--clock-scale));"
              ></span>`:""}
        </div>
      </div>
    `}_numberToWords(e){const o=["","one","two","three","four","five","six","seven","eight","nine"],a=["","","twenty","thirty","forty","fifty"];if(e<10)return o[e];if(e<20)return["ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"][e-10];if(e<60){const r=Math.floor(e/10),t=e%10;return 0===t?a[r]:`${a[r]} ${o[t]}`}return String(e)}objectToStyleString(e){return Object.entries(e).filter((([e,o])=>null!=o&&""!==o)).map((([e,o])=>`${e.replace(/([A-Z])/g,"-$1").toLowerCase()}: ${o}`)).join("; ")}addPixelUnit(e){if(e)return"string"==typeof e&&(e.includes("px")||e.includes("%")||e.includes("em")||e.includes("rem")||e.includes("vh")||e.includes("vw"))?e:`${e}px`}getBackgroundImageCSS(e,o){const a=e.background_type||"color";if("entity"===a&&e.background_image_entity&&o){const a=o.states[e.background_image_entity];if(a&&a.attributes.entity_picture)return`url('${a.attributes.entity_picture}')`}else{if("upload"===a&&e.background_image_upload)return`url('${e.background_image_upload}')`;if("url"===a&&e.background_image_url)return`url('${e.background_image_url}')`}return""}getStyles(){return"\n      .animated-clock-module-container {\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        padding: 0;\n        width: 100%;\n        min-height: 50px;\n        box-sizing: border-box;\n        overflow: visible;\n        --clock-scale: calc(var(--clock-size-value) / 115);\n      }\n\n      /* Ensure all clock styles fit within container and are responsive */\n      .flip-clock,\n      .digital-clock,\n      .analog-clock,\n      .binary-clock,\n      .minimal-clock,\n      .retro-clock,\n      .text-clock,\n      .neon-clock,\n      .material-clock,\n      .terminal-clock {\n        max-width: 100%;\n        width: auto;\n        transform-origin: center;\n        box-sizing: border-box;\n        overflow: visible;\n      }\n\n      /* ========== FLIP CLOCK ========== */\n      .flip-clock {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        gap: calc(6px * var(--clock-scale));\n        max-width: 100%;\n        width: 100%;\n        flex-wrap: nowrap;\n      }\n\n      .flip-unit {\n        position: relative;\n        width: calc(56px * var(--clock-scale));\n        height: calc(77px * var(--clock-scale));\n        background: var(--flip-tile-color, rgba(0, 0, 0, 0.5));\n        border-radius: calc(8px * var(--clock-scale));\n        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);\n        overflow: hidden;\n        flex-shrink: 1;\n        min-width: 0;\n      }\n\n      .flip-digit-display {\n        position: absolute;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        font-size: calc(48px * var(--clock-scale));\n        font-weight: 700;\n        color: var(--clock-color);\n        line-height: 1;\n        overflow: hidden;\n        text-overflow: clip;\n      }\n\n      .flip-unit::before {\n        content: '';\n        position: absolute;\n        top: 50%;\n        left: 0;\n        right: 0;\n        height: 1px;\n        background: rgba(0, 0, 0, 0.2);\n        z-index: 1;\n      }\n\n      .flip-separator {\n        font-size: calc(48px * var(--clock-scale));\n        font-weight: 700;\n        color: var(--clock-color);\n        animation: blink 1s ease-in-out infinite;\n        flex-shrink: 1;\n        min-width: 0;\n      }\n\n      @keyframes blink {\n        0%, 49% { opacity: 1; }\n        50%, 100% { opacity: 0.3; }\n      }\n\n      .flip-ampm {\n        font-size: calc(19px * var(--clock-scale));\n        font-weight: 600;\n        color: var(--clock-color);\n        opacity: 0.9;\n        align-self: flex-end;\n        margin-bottom: calc(8px * var(--clock-scale));\n        margin-left: calc(4px * var(--clock-scale));\n        flex-shrink: 1;\n        min-width: 0;\n      }\n\n      /* ========== DIGITAL CLOCK ========== */\n      .digital-clock {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: calc(8px * var(--clock-scale));\n        max-width: 100%;\n      }\n\n      .digital-display {\n        display: flex;\n        align-items: center;\n        gap: calc(16px * var(--clock-scale));\n        background: #000;\n        padding: calc(24px * var(--clock-scale)) calc(32px * var(--clock-scale));\n        border-radius: calc(12px * var(--clock-scale));\n        box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(255, 0, 0, 0.3);\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n\n      /* Editor preview-specific padding */\n      .preview-content .digital-display {\n        padding: calc(46px * var(--clock-scale)) calc(32px * var(--clock-scale));\n      }\n\n      .digital-time {\n        font-family: 'Courier New', monospace;\n        font-size: calc(64px * var(--clock-scale));\n        font-weight: bold;\n        color: #ff3333;\n        text-shadow: 0 0 10px #ff0000, 0 0 20px #ff0000, 0 0 30px #ff0000;\n        letter-spacing: calc(6px * var(--clock-scale));\n      }\n\n      .digital-ampm {\n        font-family: 'Courier New', monospace;\n        font-size: calc(26px * var(--clock-scale));\n        font-weight: bold;\n        color: #33ff33;\n        text-shadow: 0 0 8px #00ff00, 0 0 16px #00ff00;\n      }\n\n      /* ========== ANALOG CLOCK (HA Native Approach) ========== */\n      .analog-clock {\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        max-width: 100%;\n      }\n\n      .analog-clock-dial {\n        position: relative;\n        width: calc(192px * var(--clock-scale));\n        height: calc(192px * var(--clock-scale));\n        box-sizing: border-box;\n        overflow: hidden;\n        border-radius: 50%;\n        clip-path: circle(47.25% at 50% 50%);\n      }\n\n      .analog-face-svg {\n        position: absolute;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n        pointer-events: none;\n        z-index: 1;\n        overflow: hidden;\n      }\n\n      .clock-face-circle {\n        fill: var(--face-background-color);\n        stroke: var(--face-outline-color);\n        stroke-width: 2;\n      }\n\n      .hour-marker {\n        stroke: var(--marker-color);\n        stroke-width: 3;\n        stroke-linecap: round;\n        fill: none;\n        opacity: 1;\n      }\n\n      .tick-mark {\n        stroke-width: 2.5;\n        stroke-linecap: round;\n        fill: none;\n        opacity: 1;\n      }\n\n      /* Clock numbers - SVG text (may not render in some browsers) */\n      .clock-number {\n        font-family: Arial, sans-serif !important;\n        font-size: 22px !important;\n        font-weight: 900 !important;\n        text-anchor: middle !important;\n        dominant-baseline: middle !important;\n        pointer-events: none !important;\n        user-select: none !important;\n        opacity: 1 !important;\n        visibility: visible !important;\n        paint-order: stroke fill !important;\n      }\n\n      /* Clock numbers - HTML fallback (guaranteed to render) */\n      .clock-number-html {\n        position: absolute;\n        transform: translate(-50%, -50%);\n        font-family: Arial, -apple-system, BlinkMacSystemFont, sans-serif;\n        font-size: calc(18px * var(--clock-scale));\n        font-weight: 900;\n        pointer-events: none;\n        user-select: none;\n        z-index: 8;\n        text-shadow: \n          1px 1px 2px var(--face-background-color, rgba(0, 0, 0, 0.3)),\n          -1px -1px 2px var(--face-background-color, rgba(0, 0, 0, 0.3));\n      }\n\n      /* Hour tick marks - HTML elements (guaranteed to render) */\n      .clock-hour-tick-html {\n        position: absolute;\n        width: calc(3px * var(--clock-scale));\n        height: calc(8px * var(--clock-scale));\n        border-radius: 1.5px;\n        pointer-events: none;\n        z-index: 2;\n        opacity: 1;\n      }\n\n      /* Minute tick marks - HTML elements (smaller than hour ticks) */\n      .clock-minute-tick-html {\n        position: absolute;\n        width: calc(1.5px * var(--clock-scale));\n        height: calc(5px * var(--clock-scale));\n        border-radius: 1px;\n        pointer-events: none;\n        z-index: 2;\n        opacity: 1;\n      }\n\n      /* Clock hands using CSS animations (HA native approach) */\n      .clock-hand {\n        position: absolute;\n        left: 50%;\n        bottom: 50%;\n        transform-origin: 50% 100%;\n        transform: translate(-50%, 0) rotate(0deg);\n        border-radius: 2px;\n        will-change: transform;\n        animation-name: ha-clock-rotate;\n        animation-timing-function: linear;\n        animation-iteration-count: infinite;\n        box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .clock-hand-hour {\n        width: calc(4px * var(--clock-scale));\n        height: calc(48px * var(--clock-scale)); /* 25% of 192px */\n        z-index: 5;\n        animation-duration: 43200s; /* 12 hours */\n      }\n\n      .clock-hand-minute {\n        width: calc(3px * var(--clock-scale));\n        height: calc(67px * var(--clock-scale)); /* 35% of 192px */\n        opacity: 0.9;\n        z-index: 6;\n        animation-duration: 3600s; /* 60 minutes */\n      }\n\n      .clock-hand-second {\n        width: calc(2px * var(--clock-scale));\n        height: calc(81px * var(--clock-scale)); /* 42% of 192px */\n        opacity: 0.8;\n        z-index: 7;\n        animation-duration: 60s; /* 60 seconds */\n      }\n\n      .clock-hand-second.step {\n        animation-timing-function: steps(60, end);\n      }\n\n      .clock-center-dot {\n        position: absolute;\n        top: 50%;\n        left: 50%;\n        width: calc(8px * var(--clock-scale));\n        height: calc(8px * var(--clock-scale));\n        border-radius: 50%;\n        transform: translate(-50%, -50%);\n        z-index: 10;\n      }\n\n      @keyframes ha-clock-rotate {\n        from {\n          transform: translate(-50%, 0) rotate(0deg);\n        }\n        to {\n          transform: translate(-50%, 0) rotate(360deg);\n        }\n      }\n\n      /* ========== BINARY CLOCK ========== */\n      .binary-clock {\n        display: flex;\n        align-items: center;\n        gap: calc(4px * var(--clock-scale));\n        max-width: 100%;\n        flex-wrap: nowrap;\n        justify-content: center;\n        overflow-x: auto;\n      }\n\n      .binary-column {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: calc(6px * var(--clock-scale));\n      }\n\n      .binary-label {\n        font-size: calc(14px * var(--clock-scale));\n        color: var(--clock-color);\n        opacity: 0.7;\n        font-weight: 600;\n        margin-bottom: calc(4px * var(--clock-scale));\n      }\n\n      .binary-dot {\n        width: calc(19px * var(--clock-scale));\n        height: calc(19px * var(--clock-scale));\n        border-radius: 50%;\n        background: rgba(128, 128, 128, 0.2);\n        border: 2px solid rgba(128, 128, 128, 0.3);\n        transition: all 0.2s ease;\n      }\n\n      .binary-dot.active {\n        background: var(--clock-color);\n        border-color: var(--clock-color);\n        box-shadow: 0 0 10px var(--clock-color);\n      }\n\n      .binary-separator {\n        font-size: calc(38px * var(--clock-scale));\n        color: var(--clock-color);\n        margin: 0 calc(4px * var(--clock-scale));\n        opacity: 0.5;\n      }\n\n      /* ========== MINIMAL CLOCK ========== */\n      .minimal-clock {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: calc(8px * var(--clock-scale));\n        max-width: 100%;\n      }\n\n      .minimal-time {\n        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n        font-size: calc(48px * var(--clock-scale));\n        font-weight: 300;\n        color: var(--clock-color);\n        letter-spacing: calc(2px * var(--clock-scale));\n      }\n\n      .minimal-separator {\n        opacity: 0.5;\n        margin: 0 calc(4px * var(--clock-scale));\n      }\n\n      .minimal-ampm {\n        font-size: calc(17px * var(--clock-scale));\n        font-weight: 400;\n        color: var(--clock-color);\n        opacity: 0.7;\n        text-transform: uppercase;\n        letter-spacing: calc(3px * var(--clock-scale));\n      }\n\n      /* ========== RETRO CLOCK ========== */\n      .retro-clock {\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        max-width: 100%;\n      }\n\n      .retro-display {\n        display: flex;\n        align-items: center;\n        gap: calc(4px * var(--clock-scale));\n        background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);\n        padding: calc(16px * var(--clock-scale)) calc(20px * var(--clock-scale));\n        border-radius: calc(4px * var(--clock-scale));\n        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);\n        max-width: 100%;\n        box-sizing: border-box;\n        flex-wrap: nowrap;\n        justify-content: center;\n        overflow-x: auto;\n      }\n\n      .retro-digit, .retro-colon {\n        font-family: 'Courier New', monospace;\n        font-size: calc(48px * var(--clock-scale));\n        font-weight: bold;\n        color: #ffa500;\n        text-shadow: 0 0 5px #ff8800, 0 0 10px #ff6600;\n        background: rgba(0, 0, 0, 0.3);\n        padding: calc(4px * var(--clock-scale)) calc(8px * var(--clock-scale));\n        border-radius: calc(2px * var(--clock-scale));\n      }\n\n      .retro-colon {\n        padding: calc(4px * var(--clock-scale)) calc(4px * var(--clock-scale));\n      }\n\n      .retro-ampm {\n        font-family: 'Courier New', monospace;\n        font-size: calc(19px * var(--clock-scale));\n        font-weight: bold;\n        color: #00ff00;\n        text-shadow: 0 0 5px #00cc00;\n        margin-left: calc(8px * var(--clock-scale));\n      }\n\n      /* ========== TEXT CLOCK ========== */\n      .text-clock {\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        max-width: 100%;\n      }\n\n      .text-display {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        flex-wrap: wrap;\n        max-width: 100%;\n      }\n\n      .text-word {\n        font-family: Georgia, serif;\n        font-size: calc(48px * var(--clock-scale));\n        font-weight: 600;\n        line-height: 1.4;\n        text-transform: capitalize;\n      }\n\n      .text-prefix {\n        font-size: calc(38px * var(--clock-scale));\n        font-weight: 400;\n        opacity: 0.7;\n        text-transform: lowercase;\n      }\n\n      .text-ampm {\n        font-size: calc(24px * var(--clock-scale));\n        opacity: 0.8;\n        text-transform: uppercase;\n      }\n\n      /* ========== NEON CLOCK ========== */\n      .neon-clock {\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        width: 100%;\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n\n      .neon-display {\n        display: flex;\n        align-items: center;\n        gap: calc(8px * var(--clock-scale));\n        width: 100%;\n        max-width: 100%;\n        flex-wrap: nowrap;\n        justify-content: center;\n        box-sizing: border-box;\n      }\n\n      .neon-digit {\n        font-family: 'Arial Black', sans-serif;\n        font-size: calc(48px * var(--clock-scale));\n        font-weight: 900;\n        animation: neon-flicker 3s ease-in-out infinite;\n      }\n\n      .neon-separator {\n        font-family: 'Arial Black', sans-serif;\n        font-size: calc(48px * var(--clock-scale));\n        font-weight: 900;\n      }\n\n      .neon-ampm {\n        font-family: 'Arial Black', sans-serif;\n        font-size: calc(19px * var(--clock-scale));\n        font-weight: 900;\n      }\n\n      @keyframes neon-flicker {\n        0%, 100% { opacity: 1; }\n        50% { opacity: 0.95; }\n        51% { opacity: 1; }\n        52% { opacity: 0.98; }\n      }\n\n      /* ========== MATERIAL CLOCK ========== */\n      .material-clock {\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        max-width: 100%;\n      }\n\n      .material-card {\n        background: var(--clock-background);\n        border-radius: calc(16px * var(--clock-scale));\n        padding: calc(24px * var(--clock-scale)) calc(32px * var(--clock-scale));\n        box-shadow: \n          0 4px 6px rgba(0, 0, 0, 0.1),\n          0 1px 3px rgba(0, 0, 0, 0.08);\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: calc(8px * var(--clock-scale));\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n\n      .material-time {\n        font-family: 'Roboto', sans-serif;\n        font-size: calc(48px * var(--clock-scale));\n        font-weight: 300;\n        color: var(--clock-color);\n        letter-spacing: -1px;\n      }\n\n      .material-seconds {\n        font-family: 'Roboto', sans-serif;\n        font-size: calc(19px * var(--clock-scale));\n        font-weight: 400;\n        color: var(--clock-color);\n        opacity: 0.7;\n      }\n\n      /* ========== TERMINAL CLOCK ========== */\n      .terminal-clock {\n        font-family: 'Courier New', Consolas, monospace;\n        background: #1e1e1e;\n        padding: calc(20px * var(--clock-scale));\n        border-radius: calc(8px * var(--clock-scale));\n        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n\n      .terminal-prompt {\n        font-weight: 400;\n      }\n\n      .terminal-command {\n        font-weight: 400;\n      }\n\n      .terminal-output {\n        font-weight: 600;\n        font-size: calc(38px * var(--clock-scale));\n      }\n\n      .terminal-cursor {\n        display: inline-block;\n        animation: cursor-blink 1s step-end infinite;\n      }\n\n      @keyframes cursor-blink {\n        0%, 50% { opacity: 1; }\n        51%, 100% { opacity: 0; }\n      }\n\n      /* ========== RESPONSIVE SIZING ========== */\n      /* Container-based uniform scaling instead of breakpoint layout changes */\n      @media (max-width: 768px) {\n        .animated-clock-module-container {\n          --container-scale: min(1, calc(100vw / 600));\n          transform: scale(var(--container-scale));\n          transform-origin: center center;\n        }\n      }\n\n    "}validate(e){const o=[];return{valid:0===o.length,errors:o}}}}}]);