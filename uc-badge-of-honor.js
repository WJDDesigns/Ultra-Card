"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[3429],{3658:(e,t,i)=>{i.r(t),i.d(t,{UltraBadgeOfHonorModule:()=>d});var n=i(5183),o=i(7475),r=i(5147),a=i(8938),l=i(378),s=i(6478);i(7921);class d extends o.m{constructor(){super(...arguments),this.metadata={type:"badge_of_honor",title:"Badge of Honor",description:"Animated Pro membership badge with rotating text and gradient effects",author:"WJD Designs",version:"1.0.0",icon:"mdi:certificate",category:"content",tags:["badge","pro","premium","certificate","animated"]}}createDefault(e,t){return{id:e||this.generateId("badge_of_honor"),type:"badge_of_honor",badge_text:"Ultra Card Pro • ",badge_text_repeat:4,badge_size:120,inner_badge_ratio:.6,gradient_color_1:"#4ecdc4",gradient_color_2:"#44a8b3",gradient_color_3:"#7c5ce0",gradient_color_4:"#6366f1",rotation_speed:10,rotation_direction:"clockwise",enable_color_shift:!0,color_shift_speed:8,enable_glow:!0,glow_intensity:.4,enable_pulse:!1,pulse_speed:2,inner_content_type:"icon",inner_icon:"mdi:crown",inner_text:"PRO",inner_image_url:"",inner_background_type:"gradient",inner_background_color:"#1a1a2e",inner_text_color:"#ffffff",inner_icon_color:"#ffffff",text_font_size:10,text_font_weight:700,text_letter_spacing:2,tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},enable_hover_effect:!0,hover_scale:1.05,display_mode:"always",display_conditions:[]}}renderActionsTab(e,t,i,n){return r.A.render(e,t,(e=>n(e)))}renderOtherTab(e,t,i,n){return a.X.render(e,t,(e=>n(e)))}renderGeneralTab(e,t,i,o){var r,a,s;const d=e,c=(null===(r=null==t?void 0:t.locale)||void 0===r?void 0:r.language)||"en",g=l.x.checkIntegrationAuth(t);return"pro"===(null===(a=null==g?void 0:g.subscription)||void 0===a?void 0:a.tier)&&"active"===(null===(s=null==g?void 0:g.subscription)||void 0===s?void 0:s.status)?n.qy`
      <style>
        ${this.injectUcFormStyles()} ${this.getEditorStyles()}
      </style>

      <!-- Size & Layout Section -->
      ${this.renderSizeSection(d,t,o,c)}

      <!-- Colors Section -->
      ${this.renderColorsSection(d,t,o,c)}

      <!-- Animation Section -->
      ${this.renderAnimationSection(d,t,o,c)}

      <!-- Inner Content Section -->
      ${this.renderInnerContentSection(d,t,o,c)}
    `:this.renderProLockUI(c)}renderProLockUI(e){return n.qy`
      <div
        class="pro-lock-container"
        style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px;
        text-align: center;
        background: var(--secondary-background-color);
        border-radius: 12px;
        margin: 16px;
      "
      >
        <ha-icon
          icon="mdi:lock"
          style="color: var(--primary-color); --mdi-icon-size: 48px; margin-bottom: 16px;"
        ></ha-icon>
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">
          ${(0,s.kg)("editor.pro.feature_locked",e,"Pro Feature")}
        </div>
        <div
          style="font-size: 14px; color: var(--secondary-text-color); margin-bottom: 16px; max-width: 300px;"
        >
          ${(0,s.kg)("editor.pro.badge_description",e,"Badge of Honor is an exclusive Pro feature that displays a beautiful animated badge celebrating your Ultra Card Pro membership.")}
        </div>
        <a
          href="https://ultracard.io/pro"
          target="_blank"
          style="
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: var(--primary-color);
            color: var(--text-primary-color, white);
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
          "
        >
          <ha-icon icon="mdi:crown" style="--mdi-icon-size: 20px;"></ha-icon>
          ${(0,s.kg)("editor.pro.upgrade_button",e,"Upgrade to Pro")}
        </a>
      </div>
    `}renderSizeSection(e,t,i,o){return n.qy`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
        >
          ${(0,s.kg)("editor.badge.size_title",o,"SIZE & LAYOUT")}
        </div>

        <!-- Badge Size -->
        <div class="field-container" style="margin-bottom: 16px;">
          <div class="field-title">${(0,s.kg)("editor.badge.badge_size",o,"Badge Size")}</div>
          <div class="field-description">
            ${(0,s.kg)("editor.badge.badge_size_desc",o,"Overall size of the badge in pixels")}
          </div>
          <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
            <input
              type="range"
              class="gap-slider"
              min="60"
              max="300"
              step="10"
              .value="${e.badge_size||120}"
              @input=${e=>{const t=e.target;i({badge_size:parseInt(t.value)})}}
            />
            <input
              type="number"
              class="gap-input"
              min="60"
              max="300"
              step="10"
              .value="${e.badge_size||120}"
              @input=${e=>{const t=e.target,n=parseInt(t.value);isNaN(n)||i({badge_size:n})}}
            />
            <button
              class="reset-btn"
              @click=${()=>i({badge_size:120})}
              title="Reset to default"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        <!-- Inner Badge Ratio -->
        <div class="field-container">
          <div class="field-title">
            ${(0,s.kg)("editor.badge.inner_ratio",o,"Inner Badge Ratio")}
          </div>
          <div class="field-description">
            ${(0,s.kg)("editor.badge.inner_ratio_desc",o,"Size of inner circle relative to outer (0.4 - 0.8)")}
          </div>
          <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
            <input
              type="range"
              class="gap-slider"
              min="0.4"
              max="0.8"
              step="0.05"
              .value="${e.inner_badge_ratio||.6}"
              @input=${e=>{const t=e.target;i({inner_badge_ratio:parseFloat(t.value)})}}
            />
            <input
              type="number"
              class="gap-input"
              min="0.4"
              max="0.8"
              step="0.05"
              .value="${e.inner_badge_ratio||.6}"
              @input=${e=>{const t=e.target,n=parseFloat(t.value);isNaN(n)||i({inner_badge_ratio:n})}}
            />
            <button
              class="reset-btn"
              @click=${()=>i({inner_badge_ratio:.6})}
              title="Reset to default"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>
      </div>
    `}renderColorsSection(e,t,i,o){return n.qy`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
        >
          ${(0,s.kg)("editor.badge.colors_title",o,"GRADIENT COLORS")}
        </div>
        <div
          class="section-description"
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;"
        >
          ${(0,s.kg)("editor.badge.colors_desc",o,"Set the gradient colors that shift around the badge ring. The colors will smoothly transition creating a beautiful animated effect.")}
        </div>

        <!-- Color Pickers Grid -->
        <div
          style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px;"
        >
          <div class="field-group">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
              ${(0,s.kg)("editor.badge.color_1",o,"Color 1 (Teal)")}
            </div>
            <ultra-color-picker
              .label=${""}
              .value=${e.gradient_color_1||"#4ecdc4"}
              .defaultValue=${"#4ecdc4"}
              .hass=${t}
              @value-changed=${e=>i({gradient_color_1:e.detail.value})}
            ></ultra-color-picker>
          </div>
          <div class="field-group">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
              ${(0,s.kg)("editor.badge.color_2",o,"Color 2 (Blue-Teal)")}
            </div>
            <ultra-color-picker
              .label=${""}
              .value=${e.gradient_color_2||"#44a8b3"}
              .defaultValue=${"#44a8b3"}
              .hass=${t}
              @value-changed=${e=>i({gradient_color_2:e.detail.value})}
            ></ultra-color-picker>
          </div>
          <div class="field-group">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
              ${(0,s.kg)("editor.badge.color_3",o,"Color 3 (Purple)")}
            </div>
            <ultra-color-picker
              .label=${""}
              .value=${e.gradient_color_3||"#7c5ce0"}
              .defaultValue=${"#7c5ce0"}
              .hass=${t}
              @value-changed=${e=>i({gradient_color_3:e.detail.value})}
            ></ultra-color-picker>
          </div>
          <div class="field-group">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
              ${(0,s.kg)("editor.badge.color_4",o,"Color 4 (Indigo)")}
            </div>
            <ultra-color-picker
              .label=${""}
              .value=${e.gradient_color_4||"#6366f1"}
              .defaultValue=${"#6366f1"}
              .hass=${t}
              @value-changed=${e=>i({gradient_color_4:e.detail.value})}
            ></ultra-color-picker>
          </div>
        </div>

        <!-- Inner Background Color -->
        <div class="field-group" style="margin-bottom: 16px;">
          <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
            ${(0,s.kg)("editor.badge.inner_bg",o,"Inner Background Type")}
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
          >
            ${(0,s.kg)("editor.badge.inner_bg_desc",o,"Background style for the inner circle")}
          </div>
          ${this.renderUcForm(t,{inner_background_type:e.inner_background_type||"gradient"},[this.selectField("inner_background_type",[{value:"gradient",label:(0,s.kg)("editor.badge.bg_gradient",o,"Gradient")},{value:"solid",label:(0,s.kg)("editor.badge.bg_solid",o,"Solid Color")},{value:"transparent",label:(0,s.kg)("editor.badge.bg_transparent",o,"Transparent")}])],(t=>{const n=t.detail.value.inner_background_type;n!==e.inner_background_type&&i({inner_background_type:n})}),!1)}
        </div>

        ${"solid"===e.inner_background_type?n.qy`
              <div class="field-group">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                >
                  ${(0,s.kg)("editor.badge.inner_color",o,"Inner Background Color")}
                </div>
                <ultra-color-picker
                  .label=${""}
                  .value=${e.inner_background_color||"#1a1a2e"}
                  .defaultValue=${"#1a1a2e"}
                  .hass=${t}
                  @value-changed=${e=>i({inner_background_color:e.detail.value})}
                ></ultra-color-picker>
              </div>
            `:""}
      </div>
    `}renderAnimationSection(e,t,i,o){return n.qy`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
        >
          ${(0,s.kg)("editor.badge.animation_title",o,"ANIMATION")}
        </div>

        <!-- Rotation Speed -->
        <div class="field-container" style="margin-bottom: 16px;">
          <div class="field-title">
            ${(0,s.kg)("editor.badge.rotation_speed",o,"Rotation Speed")}
          </div>
          <div class="field-description">
            ${(0,s.kg)("editor.badge.rotation_speed_desc",o,"Time in seconds for one full rotation (lower = faster)")}
          </div>
          <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
            <input
              type="range"
              class="gap-slider"
              min="3"
              max="30"
              step="1"
              .value="${e.rotation_speed||10}"
              @input=${e=>{const t=e.target;i({rotation_speed:parseInt(t.value)})}}
            />
            <input
              type="number"
              class="gap-input"
              min="3"
              max="30"
              step="1"
              .value="${e.rotation_speed||10}"
              @input=${e=>{const t=e.target,n=parseInt(t.value);isNaN(n)||i({rotation_speed:n})}}
            />
            <button
              class="reset-btn"
              @click=${()=>i({rotation_speed:10})}
              title="Reset to default"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        <!-- Rotation Direction -->
        <div class="field-group" style="margin-bottom: 16px;">
          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            ${(0,s.kg)("editor.badge.rotation_direction",o,"Rotation Direction")}
          </div>
          ${this.renderUcForm(t,{rotation_direction:e.rotation_direction||"clockwise"},[this.selectField("rotation_direction",[{value:"clockwise",label:(0,s.kg)("editor.badge.clockwise",o,"Clockwise")},{value:"counter-clockwise",label:(0,s.kg)("editor.badge.counter_clockwise",o,"Counter-Clockwise")}])],(t=>{const n=t.detail.value.rotation_direction;n!==e.rotation_direction&&i({rotation_direction:n})}),!1)}
        </div>

        <!-- Color Shift Toggle -->
        <div
          style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 12px; background: var(--primary-background-color); border-radius: 8px;"
        >
          <div>
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 2px;">
              ${(0,s.kg)("editor.badge.color_shift",o,"Color Shift Animation")}
            </div>
            <div class="field-description" style="font-size: 12px; margin-bottom: 0;">
              ${(0,s.kg)("editor.badge.color_shift_desc",o,"Animate gradient colors shifting around the ring")}
            </div>
          </div>
          <ha-switch
            .checked=${!1!==e.enable_color_shift}
            @change=${e=>{const t=e.target;i({enable_color_shift:t.checked})}}
          ></ha-switch>
        </div>

        ${!1!==e.enable_color_shift?n.qy`
              <div class="field-container" style="margin-bottom: 16px;">
                <div class="field-title">
                  ${(0,s.kg)("editor.badge.color_shift_speed",o,"Color Shift Speed")}
                </div>
                <div class="field-description">
                  ${(0,s.kg)("editor.badge.color_shift_speed_desc",o,"Time in seconds for full color cycle")}
                </div>
                <div
                  class="gap-control-container"
                  style="display: flex; align-items: center; gap: 12px;"
                >
                  <input
                    type="range"
                    class="gap-slider"
                    min="2"
                    max="20"
                    step="1"
                    .value="${e.color_shift_speed||8}"
                    @input=${e=>{const t=e.target;i({color_shift_speed:parseInt(t.value)})}}
                  />
                  <input
                    type="number"
                    class="gap-input"
                    min="2"
                    max="20"
                    step="1"
                    .value="${e.color_shift_speed||8}"
                    @input=${e=>{const t=e.target,n=parseInt(t.value);isNaN(n)||i({color_shift_speed:n})}}
                  />
                  <button
                    class="reset-btn"
                    @click=${()=>i({color_shift_speed:8})}
                    title="Reset to default"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>
            `:""}

        <!-- Glow Effect Toggle -->
        <div
          style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 12px; background: var(--primary-background-color); border-radius: 8px;"
        >
          <div>
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 2px;">
              ${(0,s.kg)("editor.badge.glow",o,"Glow Effect")}
            </div>
            <div class="field-description" style="font-size: 12px; margin-bottom: 0;">
              ${(0,s.kg)("editor.badge.glow_desc",o,"Add a soft glow around the badge")}
            </div>
          </div>
          <ha-switch
            .checked=${!1!==e.enable_glow}
            @change=${e=>{const t=e.target;i({enable_glow:t.checked})}}
          ></ha-switch>
        </div>

        ${!1!==e.enable_glow?n.qy`
              <div class="field-container" style="margin-bottom: 16px;">
                <div class="field-title">
                  ${(0,s.kg)("editor.badge.glow_intensity",o,"Glow Intensity")}
                </div>
                <div
                  class="gap-control-container"
                  style="display: flex; align-items: center; gap: 12px;"
                >
                  <input
                    type="range"
                    class="gap-slider"
                    min="0.1"
                    max="1"
                    step="0.1"
                    .value="${e.glow_intensity||.4}"
                    @input=${e=>{const t=e.target;i({glow_intensity:parseFloat(t.value)})}}
                  />
                  <input
                    type="number"
                    class="gap-input"
                    min="0.1"
                    max="1"
                    step="0.1"
                    .value="${e.glow_intensity||.4}"
                    @input=${e=>{const t=e.target,n=parseFloat(t.value);isNaN(n)||i({glow_intensity:n})}}
                  />
                  <button
                    class="reset-btn"
                    @click=${()=>i({glow_intensity:.4})}
                    title="Reset to default"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>
            `:""}

        <!-- Pulse Effect Toggle -->
        <div
          style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--primary-background-color); border-radius: 8px;"
        >
          <div>
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 2px;">
              ${(0,s.kg)("editor.badge.pulse",o,"Pulse Effect")}
            </div>
            <div class="field-description" style="font-size: 12px; margin-bottom: 0;">
              ${(0,s.kg)("editor.badge.pulse_desc",o,"Add a subtle pulsing animation")}
            </div>
          </div>
          <ha-switch
            .checked=${e.enable_pulse||!1}
            @change=${e=>{const t=e.target;i({enable_pulse:t.checked})}}
          ></ha-switch>
        </div>

        ${e.enable_pulse?n.qy`
              <div class="field-container" style="margin-top: 16px;">
                <div class="field-title">
                  ${(0,s.kg)("editor.badge.pulse_speed",o,"Pulse Speed")}
                </div>
                <div
                  class="gap-control-container"
                  style="display: flex; align-items: center; gap: 12px;"
                >
                  <input
                    type="range"
                    class="gap-slider"
                    min="0.5"
                    max="5"
                    step="0.5"
                    .value="${e.pulse_speed||2}"
                    @input=${e=>{const t=e.target;i({pulse_speed:parseFloat(t.value)})}}
                  />
                  <input
                    type="number"
                    class="gap-input"
                    min="0.5"
                    max="5"
                    step="0.5"
                    .value="${e.pulse_speed||2}"
                    @input=${e=>{const t=e.target,n=parseFloat(t.value);isNaN(n)||i({pulse_speed:n})}}
                  />
                  <button
                    class="reset-btn"
                    @click=${()=>i({pulse_speed:2})}
                    title="Reset to default"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>
            `:""}
      </div>
    `}renderInnerContentSection(e,t,i,o){return n.qy`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
        >
          ${(0,s.kg)("editor.badge.inner_content_title",o,"INNER CONTENT")}
        </div>
        <div
          class="section-description"
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;"
        >
          ${(0,s.kg)("editor.badge.inner_content_desc",o,"Choose what to display in the center of the badge.")}
        </div>

        <!-- Inner Content Type -->
        <div class="field-group" style="margin-bottom: 16px;">
          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            ${(0,s.kg)("editor.badge.inner_type",o,"Content Type")}
          </div>
          ${this.renderUcForm(t,{inner_content_type:e.inner_content_type||"icon"},[this.selectField("inner_content_type",[{value:"icon",label:(0,s.kg)("editor.badge.type_icon",o,"Icon")},{value:"text",label:(0,s.kg)("editor.badge.type_text",o,"Text")},{value:"image",label:(0,s.kg)("editor.badge.type_image",o,"Image")}])],(t=>{const n=t.detail.value.inner_content_type;n!==e.inner_content_type&&i({inner_content_type:n})}),!1)}
        </div>

        <!-- Icon Content -->
        ${"icon"!==e.inner_content_type&&e.inner_content_type?"":n.qy`
              <div class="field-group" style="margin-bottom: 16px;">
                <div
                  class="field-title"
                  style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                >
                  ${(0,s.kg)("editor.badge.inner_icon",o,"Icon")}
                </div>
                <ha-form
                  .hass=${t}
                  .data=${{inner_icon:e.inner_icon||"mdi:crown"}}
                  .schema=${[{name:"inner_icon",selector:{icon:{}},label:""}]}
                  @value-changed=${e=>i({inner_icon:e.detail.value.inner_icon})}
                ></ha-form>
              </div>
              <div class="field-group">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                >
                  ${(0,s.kg)("editor.badge.icon_color",o,"Icon Color")}
                </div>
                <ultra-color-picker
                  .label=${""}
                  .value=${e.inner_icon_color||"#ffffff"}
                  .defaultValue=${"#ffffff"}
                  .hass=${t}
                  @value-changed=${e=>i({inner_icon_color:e.detail.value})}
                ></ultra-color-picker>
              </div>
            `}

        <!-- Text Content -->
        ${"text"===e.inner_content_type?n.qy`
              <div class="field-group" style="margin-bottom: 16px;">
                <div
                  class="field-title"
                  style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                >
                  ${(0,s.kg)("editor.badge.inner_text",o,"Text")}
                </div>
                <ha-form
                  .hass=${t}
                  .data=${{inner_text:e.inner_text||"PRO"}}
                  .schema=${[{name:"inner_text",selector:{text:{}},label:""}]}
                  @value-changed=${e=>i({inner_text:e.detail.value.inner_text})}
                ></ha-form>
              </div>
              <div class="field-group">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                >
                  ${(0,s.kg)("editor.badge.text_color",o,"Text Color")}
                </div>
                <ultra-color-picker
                  .label=${""}
                  .value=${e.inner_text_color||"#ffffff"}
                  .defaultValue=${"#ffffff"}
                  .hass=${t}
                  @value-changed=${e=>i({inner_text_color:e.detail.value})}
                ></ultra-color-picker>
              </div>
            `:""}

        <!-- Image Content -->
        ${"image"===e.inner_content_type?n.qy`
              <div class="field-group">
                <div
                  class="field-title"
                  style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                >
                  ${(0,s.kg)("editor.badge.inner_image",o,"Image URL")}
                </div>
                <div
                  class="field-description"
                  style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                >
                  ${(0,s.kg)("editor.badge.inner_image_desc",o,"Enter a URL or local path to an image")}
                </div>
                <ha-form
                  .hass=${t}
                  .data=${{inner_image_url:e.inner_image_url||""}}
                  .schema=${[{name:"inner_image_url",selector:{text:{}},label:""}]}
                  @value-changed=${e=>i({inner_image_url:e.detail.value.inner_image_url})}
                ></ha-form>
              </div>
            `:""}
      </div>
    `}renderPreview(e,t,i,o){var r;const a=e,l=a.badge_size||120,s=l*(a.inner_badge_ratio||.6),d=(l-s)/2,c=a.gradient_color_1||"#4ecdc4",g=a.gradient_color_2||"#44a8b3",p=a.gradient_color_3||"#7c5ce0",u=a.gradient_color_4||"#6366f1",b=a.rotation_speed||10,f="counter-clockwise"===a.rotation_direction?"reverse":"normal",v=a.color_shift_speed||8,_=a.glow_intensity||.4,m=a.pulse_speed||2,x=Math.max(7,Math.min(12,.075*l)),h=e.id||"badge",$=l/2-d/2,y=(Math.PI,a.inner_content_type||"icon"),k=a.inner_icon||"mdi:crown",w=a.inner_text||"PRO",z=a.inner_image_url||"",S=a.inner_background_type||"gradient",I=a.inner_background_color||"#1a1a2e",C=a.inner_text_color||"#ffffff",R=a.inner_icon_color||"#ffffff";let P="";return P="gradient"===S?`background: linear-gradient(135deg, ${c}22 0%, ${p}22 100%); backdrop-filter: blur(10px);`:"solid"===S?`background: ${I};`:"background: transparent;",n.qy`
      <style>
        @keyframes badge-rotate-${h} {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Smooth lava lamp - continuous rotation */
        @keyframes badge-lava-spin-${h} {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes badge-pulse-${h} {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }

        @keyframes badge-glow-pulse-${h} {
          0%, 100% {
            filter: blur(0px);
            opacity: 1;
          }
          50% {
            filter: blur(2px);
            opacity: 0.9;
          }
        }

        .badge-of-honor-container-${h} {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: ${l}px;
          height: ${l}px;
          margin: 0 auto;
          ${a.enable_pulse?`animation: badge-pulse-${h} ${m}s ease-in-out infinite;`:""}
        }

        .badge-outer-ring-${h} {
          position: absolute;
          width: ${l}px;
          height: ${l}px;
          border-radius: 50%;
          overflow: hidden;
          ${!1!==a.enable_glow?`box-shadow: 0 0 ${.15*l*_}px ${c}90, 0 0 ${.25*l*_}px ${g}70, 0 0 ${.4*l*_}px ${p}50;`:""}
        }

        .badge-gradient-layer-${h} {
          position: absolute;
          width: 140%;
          height: 140%;
          top: -20%;
          left: -20%;
          background: conic-gradient(
            from 0deg,
            ${c},
            ${g},
            ${p},
            ${u},
            ${c}
          );
          ${!1!==a.enable_color_shift?`animation: badge-lava-spin-${h} ${v}s linear infinite;`:""}
        }

        .badge-text-ring-${h} {
          position: absolute;
          width: ${l}px;
          height: ${l}px;
          animation: badge-rotate-${h} ${b}s linear infinite;
          animation-direction: ${f};
        }

        .badge-text-ring-${h} svg {
          width: 100%;
          height: 100%;
        }

        .badge-text-ring-${h} textPath {
          fill: white;
          font-size: ${x}px;
          font-weight: ${600};
          letter-spacing: ${2}px;
          text-transform: uppercase;
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        .badge-inner-circle-${h} {
          position: absolute;
          width: ${s}px;
          height: ${s}px;
          border-radius: 50%;
          ${P}
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          border: 2px solid rgba(255,255,255,0.1);
        }

        .badge-inner-content-${h} {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .badge-inner-content-${h} ha-icon {
          color: ${R};
          --mdc-icon-size: ${.5*s}px;
        }

        .badge-inner-content-${h} .inner-text {
          color: ${C};
          font-size: ${.35*s}px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .badge-inner-content-${h} .inner-image {
          width: ${.7*s}px;
          height: ${.7*s}px;
          object-fit: contain;
          border-radius: 50%;
        }

        .badge-of-honor-wrapper-${h} {
          transition: transform 0.3s ease;
          cursor: ${"nothing"!==(null===(r=a.tap_action)||void 0===r?void 0:r.action)?"pointer":"default"};
        }

        .badge-of-honor-wrapper-${h}:hover {
          transform: scale(${!1!==a.enable_hover_effect?a.hover_scale||1.05:1});
        }
      </style>

      <div class="badge-of-honor-wrapper-${h}">
        <div class="badge-of-honor-container-${h}">
          <!-- Outer gradient ring with glow -->
          <div class="badge-outer-ring-${h}">
            <div class="badge-gradient-layer-${h}"></div>
          </div>

          <!-- Rotating text ring -->
          <div class="badge-text-ring-${h}">
            <svg viewBox="0 0 ${l} ${l}">
              <defs>
                <path
                  id="badge-text-path-${h}"
                  d="M ${l/2}, ${l/2} m -${$}, 0 a ${$},${$} 0 1,1 ${2*$},0 a ${$},${$} 0 1,1 -${2*$},0"
                  fill="none"
                />
              </defs>
              <text textLength="${Math.floor(2*Math.PI*$*.98)}" lengthAdjust="spacing">
                <textPath href="#badge-text-path-${h}" startOffset="0%">
                  ${"ULTRA CARD PRO  •  ULTRA CARD PRO  •  "}
                </textPath>
              </text>
            </svg>
          </div>

          <!-- Inner circle with content -->
          <div class="badge-inner-circle-${h}">
            <div class="badge-inner-content-${h}">
              ${"icon"!==y&&y?"":n.qy`<ha-icon icon="${k}"></ha-icon>`}
              ${"text"===y?n.qy`<span class="inner-text">${w}</span>`:""}
              ${"image"===y&&z?n.qy`<img class="inner-image" src="${z}" alt="Badge" />`:""}
            </div>
          </div>
        </div>
      </div>
    `}validate(e){const t=e,i=[...super.validate(e).errors];return t.badge_size&&(t.badge_size<60||t.badge_size>300)&&i.push("Badge size must be between 60 and 300 pixels"),t.inner_badge_ratio&&(t.inner_badge_ratio<.4||t.inner_badge_ratio>.8)&&i.push("Inner badge ratio must be between 0.4 and 0.8"),t.rotation_speed&&(t.rotation_speed<3||t.rotation_speed>30)&&i.push("Rotation speed must be between 3 and 30 seconds"),{valid:0===i.length,errors:i}}getEditorStyles(){return"\n      .settings-section {\n        background: var(--secondary-background-color);\n        border-radius: 8px;\n        padding: 16px;\n        margin-bottom: 16px;\n      }\n\n      .section-title {\n        font-size: 18px;\n        font-weight: 700;\n        text-transform: uppercase;\n        color: var(--primary-color);\n        margin-bottom: 16px;\n        letter-spacing: 0.5px;\n      }\n\n      .section-description {\n        font-size: 13px;\n        color: var(--secondary-text-color);\n        margin-bottom: 16px;\n      }\n\n      .field-title {\n        font-size: 16px;\n        font-weight: 600;\n        margin-bottom: 4px;\n      }\n\n      .field-description {\n        font-size: 13px;\n        font-weight: 400;\n        margin-bottom: 12px;\n        color: var(--secondary-text-color);\n      }\n\n      .field-group {\n        margin-bottom: 16px;\n      }\n\n      .field-container {\n        margin-bottom: 16px;\n      }\n\n      .gap-control-container {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n\n      .gap-slider {\n        flex: 1;\n        height: 6px;\n        background: var(--divider-color, #cccccc);\n        border-radius: 3px;\n        outline: none;\n        appearance: none;\n        -webkit-appearance: none;\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n\n      .gap-slider::-webkit-slider-thumb {\n        appearance: none;\n        -webkit-appearance: none;\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider::-moz-range-thumb {\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider:hover {\n        background: var(--primary-color);\n        opacity: 0.7;\n      }\n\n      .gap-slider:hover::-webkit-slider-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-slider:hover::-moz-range-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-input {\n        min-width: 80px;\n        max-width: 120px;\n        padding: 4px 8px !important;\n        border: 1px solid var(--divider-color, #cccccc);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 13px;\n        text-align: left;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n        box-sizing: border-box;\n      }\n\n      .gap-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);\n      }\n\n      .reset-btn {\n        width: 36px;\n        height: 36px;\n        padding: 0;\n        border: 1px solid var(--divider-color, #cccccc);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n      }\n\n      .reset-btn:hover {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n      }\n\n      .reset-btn ha-icon {\n        font-size: 16px;\n      }\n    "}getStyles(){return"\n      .badge-of-honor-wrapper {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        width: 100%;\n        height: 100%;\n      }\n    "}}}}]);