"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[634],{3333:(e,t,n)=>{n.r(t),n.d(t,{UltraCameraModule:()=>b});var i=n(5183),o=n(5669),a=n(8791),r=n(7475),s=n(8465),l=n(5147),c=n(8938),d=n(8869),p=n(5262),m=n(6478),u=n(1001),h=n(5320),g=n(9327),v=n(5121);n(9442);const f=new Set(["ha-web-rtc-player","ha-hls-player","ha-camera-stream","ha-camera-websocket","ha-camera-player","ha-camera-viewer"]);class b extends r.m{constructor(){super(...arguments),this._templateInputDebounce=null,this._lastRenderedEntity=null,this._renderDebounce=null,this._webrtcUpdateTimer=null,this._huiImageRef=(0,a._)(),this._cameraStableKeys=new Map,this._audioOverrides=new Map,this._lastAudioStates=new Map,this._audioObservers=new Map,this._snapshotRefreshTimers=new Map,this.metadata={type:"camera",title:"Camera",description:"Display live camera feeds with comprehensive control options",author:"WJD Designs",version:"1.0.0",icon:"mdi:camera",category:"content",tags:["camera","live","feed","security","surveillance"]},this.clickTimeout=null,this.holdTimeout=null,this.isHolding=!1}createDefault(e,t){return{id:e||this.generateId("camera"),type:"camera",entity:"",camera_name:"",show_name:!0,name_position:"top-left",tap_opens_fullscreen:!1,aspect_ratio_linked:!0,aspect_ratio_value:1.778,image_fit:"cover",crop_left:0,crop_top:0,crop_right:0,crop_bottom:0,show_controls:!1,view_mode:"auto",refresh_interval:10,audio_enabled:!1,image_quality:"high",rotation:0,show_unavailable:!0,fallback_image:"",tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},template_mode:!1,template:"",design:{width:"100%",max_width:"500px",border_radius:"20px"},display_mode:"always",display_conditions:[]}}renderGeneralTab(e,t,n,o){var a;const r=e,l=(null===(a=t.locale)||void 0===a?void 0:a.language)||"en";return i.qy`
      ${this.injectUcFormStyles()}
      <div class="camera-module-settings">
        <!-- Camera Configuration Section -->
        ${this.renderSettingsSection((0,m.kg)("editor.camera.config.title",l,"Camera Configuration"),(0,m.kg)("editor.camera.config.desc",l,"Configure the camera entity and display settings."),[{title:(0,m.kg)("editor.camera.entity",l,"Camera Entity"),description:(0,m.kg)("editor.camera.entity_desc",l,"Select the camera entity to display. This should be a camera or mjpeg entity from Home Assistant."),hass:t,data:r,schema:[this.entityField("entity",["camera"])],onChange:e=>o(e.detail.value)}])}

        <!-- Camera Name Settings with toggle in header -->
        <div class="settings-section">
          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 0; border-bottom: none;"
          >
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); letter-spacing: 0.5px;"
            >
              ${(0,m.kg)("editor.camera.show_name",l,"Show Camera Name")}
            </div>
            <ha-switch
              .checked=${!1!==r.show_name}
              @change=${e=>{const t=e.target;o({show_name:t.checked})}}
            ></ha-switch>
          </div>

          ${!1!==r.show_name?i.qy`
                <div class="field-group" style="margin-bottom: 16px;">
                  ${this.renderFieldSection((0,m.kg)("editor.camera.name",l,"Camera Name"),(0,m.kg)("editor.camera.name_desc",l,"Custom name for the camera. Leave empty to use entity name."),t,{camera_name:r.camera_name||""},[this.textField("camera_name")],(e=>o(e.detail.value)))}
                </div>

                <div class="field-group" style="margin-bottom: 16px;">
                  ${this.renderFieldSection((0,m.kg)("editor.camera.name_position.title",l,"Name Position"),(0,m.kg)("editor.camera.name_position.desc",l,"Choose where the camera name appears as an overlay on the camera image."),t,{name_position:r.name_position||"top-left"},[this.selectField("name_position",[{value:"top-left",label:(0,m.kg)("editor.camera.name_position.options.top_left",l,"Top Left")},{value:"top-right",label:(0,m.kg)("editor.camera.name_position.options.top_right",l,"Top Right")},{value:"center",label:(0,m.kg)("editor.camera.name_position.options.center",l,"Center")},{value:"bottom-left",label:(0,m.kg)("editor.camera.name_position.options.bottom_left",l,"Bottom Left")},{value:"bottom-right",label:(0,m.kg)("editor.camera.name_position.options.bottom_right",l,"Bottom Right")},{value:"top-middle",label:(0,m.kg)("editor.camera.name_position.options.top_middle",l,"Top Middle")},{value:"bottom-middle",label:(0,m.kg)("editor.camera.name_position.options.bottom_middle",l,"Bottom Middle")}])],(e=>{e.detail.value.name_position!==(r.name_position||"top-left")&&o(e.detail.value)}))}
                </div>
              `:i.qy`
                <div
                  style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                >
                  ${(0,m.kg)("editor.camera.show_name_toggle.enable_toggle_desc",l,"Enable the toggle above to configure camera name display")}
                </div>
              `}
        </div>

        <!-- Tap to Open Fullscreen Settings -->
        <div class="settings-section">
          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 0; border-bottom: none;"
          >
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); letter-spacing: 0.5px;"
            >
              ${(0,m.kg)("editor.camera.tap_opens_fullscreen",l,"Tap Camera Opens Fullscreen")}
            </div>
            <ha-switch
              .checked=${!0===r.tap_opens_fullscreen}
              @change=${e=>{const t=e.target;o({tap_opens_fullscreen:t.checked})}}
            ></ha-switch>
          </div>

          <div
            class="field-description"
            style="margin-bottom: 16px; color: var(--secondary-text-color); font-style: italic; padding: 12px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 6px; border-left: 4px solid var(--primary-color);"
          >
            <ha-icon icon="mdi:information" style="font-size: 14px; margin-right: 6px;"></ha-icon>
            ${(0,m.kg)("editor.camera.tap_opens_fullscreen_desc",l,"When enabled, tapping anywhere on the camera will open it in fullscreen mode.")}
          </div>
        </div>

        <!-- Display Settings Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 32px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${(0,m.kg)("editor.camera.display.title",l,"Display Settings")}
          </div>

          <!-- Stream Mode Selector -->
          <div style="margin-bottom: 16px;">
            ${this.renderFieldSection((0,m.kg)("editor.camera.view_mode.title",l,"Stream Mode"),(0,m.kg)("editor.camera.view_mode.desc",l,"Control how the camera feed is displayed. Auto: snapshot with tap-to-live (like HA default). Live: always streaming. Snapshot: manual refresh only."),t,{view_mode:r.view_mode||"auto"},[this.selectField("view_mode",[{value:"auto",label:(0,m.kg)("editor.camera.view_mode.options.auto",l,"Auto (HA Default)")},{value:"live",label:(0,m.kg)("editor.camera.view_mode.options.live",l,"Always Live")},{value:"snapshot",label:(0,m.kg)("editor.camera.view_mode.options.snapshot",l,"Snapshot Only")}])],(e=>{e.detail.value.view_mode!==(r.view_mode||"auto")&&o(e.detail.value)}))}
          </div>

          <!-- Audio Enable (only for Live mode) -->
          ${"live"===(r.view_mode||"auto")?i.qy`
                <div style="margin-bottom: 16px;">
                  ${this.renderFieldSection((0,m.kg)("editor.camera.audio_enabled.title",l,"Enable Audio"),(0,m.kg)("editor.camera.audio_enabled.desc",l,"Enable audio for live camera streams. Audio is only available in Live mode."),t,{audio_enabled:!0===r.audio_enabled},[this.booleanField("audio_enabled")],(e=>o(e.detail.value)))}
                </div>
              `:""}

          <!-- Refresh Interval (only for Snapshot mode) -->
          ${"snapshot"===(r.view_mode||"auto")?i.qy`
                <div style="margin-top: 24px;">
                  ${this.renderConditionalFieldsGroup((0,m.kg)("editor.camera.snapshot_refresh.section_title",l,"Snapshot Refresh Settings"),i.qy`
                      ${s.Q.renderField((0,m.kg)("editor.camera.refresh_interval.title",l,"Refresh Interval (seconds)"),(0,m.kg)("editor.camera.refresh_interval.desc",l,"How often to refresh the camera snapshot automatically. Range: 1-300 seconds."),t,{refresh_interval:r.refresh_interval||10},[s.Q.createSchemaItem("refresh_interval",{number:{min:1,max:300,mode:"box"}})],(e=>o({refresh_interval:e.detail.value.refresh_interval})))}
                    `)}
                </div>
              `:""}

          <!-- Dimensions Section -->
          <div style="margin-bottom: 32px;">
            <div
              class="field-title"
              style="font-size: 18px; font-weight: 700; margin-bottom: 8px; color: var(--primary-color);"
            >
              ${(0,m.kg)("editor.camera.dimensions.title",l,"Dimensions")}
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; padding: 12px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 6px; border-left: 4px solid var(--primary-color);"
            >
              <ha-icon icon="mdi:information" style="font-size: 14px; margin-right: 6px;"></ha-icon>
              ${(0,m.kg)("editor.camera.dimensions.responsive_note",l,"Camera now uses responsive sizing by default (100% width). Use the Design tab for full control over dimensions, or adjust these fallback pixel dimensions for specific use cases.")}
            </div>

            <style>
              .number-range-control {
                display: flex;
                gap: 8px;
                align-items: center;
              }

              .range-slider {
                flex: 0 0 65%;
                height: 6px;
                background: var(--divider-color);
                border-radius: 3px;
                outline: none;
                appearance: none;
                -webkit-appearance: none;
                cursor: pointer;
                transition: all 0.2s ease;
                min-width: 0;
              }

              .range-slider::-webkit-slider-thumb {
                appearance: none;
                -webkit-appearance: none;
                width: 18px;
                height: 18px;
                background: var(--primary-color);
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              }

              .range-slider::-moz-range-thumb {
                width: 18px;
                height: 18px;
                background: var(--primary-color);
                border-radius: 50%;
                cursor: pointer;
                border: none;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              }

              .range-slider:hover {
                background: var(--primary-color);
                opacity: 0.7;
              }

              .range-slider:hover::-webkit-slider-thumb {
                transform: scale(1.1);
              }

              .range-slider:hover::-moz-range-thumb {
                transform: scale(1.1);
              }

              .range-input {
                flex: 0 0 20%;
                padding: 6px 8px !important;
                border: 1px solid var(--divider-color);
                border-radius: 4px;
                background: var(--secondary-background-color);
                color: var(--primary-text-color);
                font-size: 13px;
                text-align: center;
                transition: all 0.2s ease;
                box-sizing: border-box;
              }

              .range-input:focus {
                outline: none;
                border-color: var(--primary-color);
                box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
              }

              .range-reset-btn {
                width: 32px;
                height: 32px;
                padding: 0;
                border: 1px solid var(--divider-color);
                border-radius: 4px;
                background: var(--secondary-background-color);
                color: var(--primary-text-color);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                flex-shrink: 0;
              }

              .range-reset-btn:hover {
                background: var(--primary-color);
                color: var(--text-primary-color);
                border-color: var(--primary-color);
              }

              .range-reset-btn ha-icon {
                font-size: 14px;
              }

              .aspect-ratio-link-btn {
                width: 40px;
                height: 40px;
                padding: 0;
                border: 2px solid var(--divider-color);
                border-radius: 50%;
                background: var(--secondary-background-color);
                color: var(--primary-text-color);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                flex-shrink: 0;
                margin: 0 auto;
                position: relative;
              }

              .aspect-ratio-link-btn.linked {
                border-color: var(--primary-color);
                background: var(--primary-color);
                color: white;
                transform: scale(1.05);
              }

              .aspect-ratio-link-btn:hover {
                transform: scale(1.1);
                border-color: var(--primary-color);
              }

              .aspect-ratio-link-btn.linked:hover {
                background: var(--primary-color);
                opacity: 0.9;
              }

              .aspect-ratio-link-btn ha-icon {
                font-size: 20px;
                transition: transform 0.2s ease;
              }

              .dimensions-container {
                display: flex;
                flex-direction: column;
                gap: 16px;
              }

              .dimension-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
              }
            </style>

            <div class="dimensions-container">
              <div class="dimension-group">
                <div class="field-title">
                  ${(0,m.kg)("editor.camera.width",l,"Width (px)")}
                </div>
                <div class="field-description">
                  ${(0,m.kg)("editor.camera.width_desc",l,"Set the width of the camera display. Range: 100-1000px")}
                </div>
                <div
                  class="gap-control-container"
                  style="display: flex; align-items: center; gap: 12px;"
                >
                  <input
                    type="range"
                    class="gap-slider"
                    min="100"
                    max="1000"
                    step="1"
                    .value="${r.width||320}"
                    @input=${e=>{const t=e.target,n=parseInt(t.value);this._handleDimensionChange(r,"width",n,o)}}
                  />
                  <input
                    type="number"
                    class="gap-input"
                    min="100"
                    max="1000"
                    step="1"
                    .value="${r.width||320}"
                    @input=${e=>{const t=e.target,n=parseInt(t.value);isNaN(n)||this._handleDimensionChange(r,"width",n,o)}}
                    @keydown=${e=>{if("ArrowUp"===e.key||"ArrowDown"===e.key){e.preventDefault();const t=e.target,n=parseInt(t.value)||320,i="ArrowUp"===e.key?1:-1,a=Math.max(100,Math.min(1e3,n+i));this._handleDimensionChange(r,"width",a,o)}}}
                  />
                  <button
                    class="reset-btn"
                    @click=${()=>this._handleDimensionChange(r,"width",320,o)}
                    title=${(0,m.kg)("editor.fields.reset_default_value",l,"Reset to default ({value})").replace("{value}","320")}
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>

              <!-- Link/Unlink Button -->
              <div style="display: flex; justify-content: center; margin: 8px 0;">
                <button
                  class="aspect-ratio-link-btn ${!1!==r.aspect_ratio_linked?"linked":""}"
                  @click=${()=>{const e=!r.aspect_ratio_linked,t={aspect_ratio_linked:e};if(e){const e=r.width||320,n=r.height||180;t.aspect_ratio_value=e/n}o(t)}}
                  title="${!1!==r.aspect_ratio_linked?(0,m.kg)("editor.camera.unlink_aspect",l,"Unlink aspect ratio"):(0,m.kg)("editor.camera.link_aspect",l,"Link aspect ratio")}"
                >
                  <ha-icon
                    icon="${!1!==r.aspect_ratio_linked?"mdi:link-variant":"mdi:link-variant-off"}"
                  ></ha-icon>
                </button>
              </div>

              <div class="dimension-group">
                <div class="field-title">
                  ${(0,m.kg)("editor.camera.height",l,"Height (px)")}
                </div>
                <div class="field-description">
                  ${(0,m.kg)("editor.camera.height_desc",l,"Set the height of the camera display. Range: 100-1000px")}
                </div>
                <div
                  class="gap-control-container"
                  style="display: flex; align-items: center; gap: 12px;"
                >
                  <input
                    type="range"
                    class="gap-slider"
                    min="100"
                    max="1000"
                    step="1"
                    .value="${r.height||180}"
                    @input=${e=>{const t=e.target,n=parseInt(t.value);this._handleDimensionChange(r,"height",n,o)}}
                  />
                  <input
                    type="number"
                    class="gap-input"
                    min="100"
                    max="1000"
                    step="1"
                    .value="${r.height||180}"
                    @input=${e=>{const t=e.target,n=parseInt(t.value);isNaN(n)||this._handleDimensionChange(r,"height",n,o)}}
                    @keydown=${e=>{if("ArrowUp"===e.key||"ArrowDown"===e.key){e.preventDefault();const t=e.target,n=parseInt(t.value)||180,i="ArrowUp"===e.key?1:-1,a=Math.max(100,Math.min(1e3,n+i));this._handleDimensionChange(r,"height",a,o)}}}
                  />
                  <button
                    class="reset-btn"
                    @click=${()=>this._handleDimensionChange(r,"height",180,o)}
                    title=${(0,m.kg)("editor.fields.reset_default_value",l,"Reset to default ({value})").replace("{value}","180")}
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>
            </div>

            ${!1!==r.aspect_ratio_linked?i.qy`
                  <div
                    style="margin-top: 12px; padding: 12px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 8px; border-left: 4px solid var(--primary-color);"
                  >
                    <div
                      style="font-size: 13px; color: var(--primary-color); font-weight: 500; margin-bottom: 4px;"
                    >
                      <ha-icon
                        icon="mdi:link-variant"
                        style="font-size: 14px; margin-right: 6px;"
                      ></ha-icon>
                      ${(0,m.kg)("editor.camera.aspect_linked.title",l,"Aspect Ratio Linked")}
                    </div>
                    <div
                      style="font-size: 12px; color: var(--secondary-text-color); line-height: 1.4;"
                    >
                      ${(0,m.kg)("editor.camera.aspect_linked.desc",l,"Dimensions maintain {ratio}:1 ratio. Adjusting one dimension automatically updates the other to maintain proportions.").replace("{ratio}",`${(1*(r.aspect_ratio_value||1.778)).toFixed(2)}`)}
                    </div>
                  </div>
                `:i.qy`
                  <div
                    style="margin-top: 12px; padding: 12px; background: rgba(var(--rgb-secondary-text-color), 0.1); border-radius: 8px; border-left: 4px solid var(--secondary-text-color);"
                  >
                    <div
                      style="font-size: 13px; color: var(--secondary-text-color); font-weight: 500; margin-bottom: 4px;"
                    >
                      <ha-icon
                        icon="mdi:link-variant-off"
                        style="font-size: 14px; margin-right: 6px;"
                      ></ha-icon>
                      ${(0,m.kg)("editor.camera.aspect_independent.title",l,"Independent Dimensions")}
                    </div>
                    <div
                      style="font-size: 12px; color: var(--secondary-text-color); line-height: 1.4;"
                    >
                      ${(0,m.kg)("editor.camera.aspect_independent.desc",l,"Width and height can be adjusted independently. Click the link button above to maintain aspect ratio.")}
                    </div>
                  </div>
                `}
          </div>

          <!-- Rotation Field -->
          <div class="dimension-group" style="margin-top: 16px;">
            <div class="field-title">
              ${(0,m.kg)("editor.camera.rotation",l,"Rotation (°)")}
            </div>
            <div class="field-description">
              ${(0,m.kg)("editor.camera.rotation_desc",l,"Rotate the camera image clockwise (0-360 degrees).")}
            </div>
            <div class="number-range-control">
              <input
                type="range"
                class="range-slider"
                min="0"
                max="360"
                step="1"
                .value="${r.rotation||0}"
                @input=${e=>{const t=e.target,n=parseInt(t.value);o({rotation:n})}}
              />
              <input
                type="number"
                class="range-input"
                min="0"
                max="360"
                step="1"
                .value="${r.rotation||0}"
                @input=${e=>{const t=e.target,n=parseInt(t.value);isNaN(n)||o({rotation:n})}}
                @keydown=${e=>{if("ArrowUp"===e.key||"ArrowDown"===e.key){e.preventDefault();const t=e.target,n=parseInt(t.value)||0,i="ArrowUp"===e.key?1:-1,a=Math.max(0,Math.min(360,n+i));o({rotation:a})}}}
              />
              <button
                class="range-reset-btn"
                @click=${()=>o({rotation:0})}
                title=${(0,m.kg)("editor.fields.reset_default_value",l,"Reset to default ({value})").replace("{value}","0")}
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Crop & Position Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${(0,m.kg)("editor.camera.crop.title",l,"Crop & Position")}
          </div>
          <div
            class="field-description"
            style="margin-bottom: 20px; color: var(--secondary-text-color); font-style: italic;"
          >
            ${(0,m.kg)("editor.camera.crop.desc",l,"Adjust the crop and position of the camera view. Useful for focusing on specific areas or removing unwanted edges.")}
          </div>

          <div style="display: flex; flex-direction: column; gap: 20px;">
            <!-- Left Crop -->
            <div class="field-container">
              <div class="field-title">
                ${(0,m.kg)("editor.camera.crop.left_title",l,"Left Crop (%)")}
              </div>
              <div class="field-description">
                ${(0,m.kg)("editor.camera.crop.left_desc",l,"Crop from the left edge. Higher values show less of the left side.")}
              </div>
              <div class="number-range-control">
                <input
                  type="range"
                  class="range-slider"
                  min="0"
                  max="50"
                  step="1"
                  .value="${r.crop_left||0}"
                  @input=${e=>{const t=e.target,n=parseInt(t.value);o({crop_left:n})}}
                />
                <input
                  type="number"
                  class="range-input"
                  min="0"
                  max="50"
                  step="1"
                  .value="${r.crop_left||0}"
                  @input=${e=>{const t=e.target,n=parseInt(t.value);isNaN(n)||o({crop_left:n})}}
                />
                <button
                  class="range-reset-btn"
                  @click=${()=>o({crop_left:0})}
                  title=${(0,m.kg)("editor.fields.reset_default_value",l,"Reset to default ({value})").replace("{value}","0")}
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <!-- Right Crop -->
            <div class="field-container">
              <div class="field-title">
                ${(0,m.kg)("editor.camera.crop.right_title",l,"Right Crop (%)")}
              </div>
              <div class="field-description">
                ${(0,m.kg)("editor.camera.crop.right_desc",l,"Crop from the right edge. Higher values show less of the right side.")}
              </div>
              <div class="number-range-control">
                <input
                  type="range"
                  class="range-slider"
                  min="0"
                  max="50"
                  step="1"
                  .value="${r.crop_right||0}"
                  @input=${e=>{const t=e.target,n=parseInt(t.value);o({crop_right:n})}}
                />
                <input
                  type="number"
                  class="range-input"
                  min="0"
                  max="50"
                  step="1"
                  .value="${r.crop_right||0}"
                  @input=${e=>{const t=e.target,n=parseInt(t.value);isNaN(n)||o({crop_right:n})}}
                />
                <button
                  class="range-reset-btn"
                  @click=${()=>o({crop_right:0})}
                  title=${(0,m.kg)("editor.fields.reset_default_value",l,"Reset to default ({value})").replace("{value}","0")}
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <!-- Top Crop -->
            <div class="field-container">
              <div class="field-title">
                ${(0,m.kg)("editor.camera.crop.top_title",l,"Top Crop (%)")}
              </div>
              <div class="field-description">
                ${(0,m.kg)("editor.camera.crop.top_desc",l,"Crop from the top edge. Higher values show less of the top area.")}
              </div>
              <div class="number-range-control">
                <input
                  type="range"
                  class="range-slider"
                  min="0"
                  max="50"
                  step="1"
                  .value="${r.crop_top||0}"
                  @input=${e=>{const t=e.target,n=parseInt(t.value);o({crop_top:n})}}
                />
                <input
                  type="number"
                  class="range-input"
                  min="0"
                  max="50"
                  step="1"
                  .value="${r.crop_top||0}"
                  @input=${e=>{const t=e.target,n=parseInt(t.value);isNaN(n)||o({crop_top:n})}}
                />
                <button
                  class="range-reset-btn"
                  @click=${()=>o({crop_top:0})}
                  title=${(0,m.kg)("editor.fields.reset_default_value",l,"Reset to default ({value})").replace("{value}","0")}
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <!-- Bottom Crop -->
            <div class="field-container">
              <div class="field-title">
                ${(0,m.kg)("editor.camera.crop.bottom_title",l,"Bottom Crop (%)")}
              </div>
              <div class="field-description">
                ${(0,m.kg)("editor.camera.crop.bottom_desc",l,"Crop from the bottom edge. Higher values show less of the bottom area.")}
              </div>
              <div class="number-range-control">
                <input
                  type="range"
                  class="range-slider"
                  min="0"
                  max="50"
                  step="1"
                  .value="${r.crop_bottom||0}"
                  @input=${e=>{const t=e.target,n=parseInt(t.value);o({crop_bottom:n})}}
                />
                <input
                  type="number"
                  class="range-input"
                  min="0"
                  max="50"
                  step="1"
                  .value="${r.crop_bottom||0}"
                  @input=${e=>{const t=e.target,n=parseInt(t.value);isNaN(n)||o({crop_bottom:n})}}
                />
                <button
                  class="range-reset-btn"
                  @click=${()=>o({crop_bottom:0})}
                  title=${(0,m.kg)("editor.fields.reset_default_value",l,"Reset to default ({value})").replace("{value}","0")}
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Crop Status -->
          ${(r.crop_left||0)+(r.crop_top||0)+(r.crop_right||0)+(r.crop_bottom||0)>0?i.qy`
                <div
                  style="margin-top: 16px; padding: 12px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 8px; border-left: 4px solid var(--primary-color);"
                >
                  <div
                    style="font-size: 13px; color: var(--primary-color); font-weight: 500; margin-bottom: 4px;"
                  >
                    <ha-icon icon="mdi:crop" style="font-size: 14px; margin-right: 6px;"></ha-icon>
                    ${(0,m.kg)("editor.camera.crop.active_applied",l,"Active Crops Applied")}
                  </div>
                  <div
                    style="font-size: 12px; color: var(--secondary-text-color); line-height: 1.4;"
                  >
                    L: ${r.crop_left||0}% | T: ${r.crop_top||0}% | R:
                    ${r.crop_right||0}% | B: ${r.crop_bottom||0}%
                  </div>
                </div>
              `:""}

          <!-- Reset All Crops Button -->
          <div style="margin-top: 20px; text-align: center;">
            <button
              style="
                padding: 8px 16px;
                border: 1px solid var(--primary-color);
                border-radius: 6px;
                background: transparent;
                color: var(--primary-color);
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.2s ease;
              "
              @click=${()=>o({crop_left:0,crop_top:0,crop_right:0,crop_bottom:0})}
              @mouseover=${e=>{const t=e.target;t.style.background="var(--primary-color)",t.style.color="white"}}
              @mouseout=${e=>{const t=e.target;t.style.background="transparent",t.style.color="var(--primary-color)"}}
            >
              <ha-icon icon="mdi:crop-free" style="margin-right: 6px; font-size: 14px;"></ha-icon>
              ${(0,m.kg)("editor.camera.crop.reset_all",l,"Reset All Crops")}
            </button>
          </div>
        </div>

        <!-- Link configuration intentionally omitted for Camera module per design guidelines -->

        <!-- Template Mode Section -->
        <div
          class="settings-section template-mode-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            ${(0,m.kg)("editor.camera.template.title",l,"Template Mode")}
          </div>
          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
          >
            ${(0,m.kg)("editor.camera.template.desc",l,"Use a template to dynamically set the camera entity. Templates allow you to use Home Assistant templating syntax for conditional camera selection.")}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <ha-form
              .hass=${t}
              .data=${{template_mode:r.template_mode||!1}}
              .schema=${[{name:"template_mode",label:(0,m.kg)("editor.camera.template.mode_label",l,"Template Mode"),description:(0,m.kg)("editor.camera.template.mode_desc",l,"Use Home Assistant templating syntax to dynamically select camera entity"),selector:{boolean:{}}}]}
              .computeLabel=${e=>e.label||e.name}
              .computeDescription=${e=>e.description||""}
              @value-changed=${e=>o({template_mode:e.detail.value.template_mode})}
            ></ha-form>
          </div>

          ${r.template_mode?i.qy`
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                  >
                    ${(0,m.kg)("editor.camera.template.camera_template_label",l,"Camera Template")}
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 12px; margin-bottom: 8px; color: var(--secondary-text-color);"
                  >
                    ${(0,m.kg)("editor.camera.template.camera_template_desc",l,"Template to dynamically set the camera entity using Jinja2 syntax")}
                  </div>
                  <div
                    @mousedown=${e=>{const t=e.target;t.closest("ultra-template-editor")||t.closest(".cm-editor")||e.stopPropagation()}}
                    @dragstart=${e=>e.stopPropagation()}
                  >
                    <ultra-template-editor
                      .hass=${t}
                      .value=${r.template||""}
                      .placeholder=${"{{ 'camera.outdoor' if is_state('weather.home', 'sunny') else 'camera.indoor' }}"}
                      .minHeight=${100}
                      .maxHeight=${300}
                      @value-changed=${e=>{o({template:e.detail.value})}}
                    ></ultra-template-editor>
                  </div>
                </div>

                <div class="template-examples">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
                  >
                    ${(0,m.kg)("editor.camera.template.examples_title",l,"Common Examples:")}
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      'camera.outdoor' if is_state('weather.home', 'sunny') else ''
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      ${(0,m.kg)("editor.camera.template.example1_desc",l,"Show camera when weather is sunny")}
                    </div>
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      'camera.front_door' if is_state('input_boolean.show_front', 'on') else
                      'camera.back_yard'
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      ${(0,m.kg)("editor.camera.template.example2_desc",l,"Switch between cameras based on input boolean")}
                    </div>
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      states('input_select.active_camera')
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      ${(0,m.kg)("editor.camera.template.example3_desc",l,"Use input select to choose camera entity")}
                    </div>
                  </div>
                </div>
              `:""}
        </div>
      </div>
    `}renderActionsTab(e,t,n,i){return l.A.render(e,t,(e=>i(e)))}renderPreview(e,t,n,r){var s,l,c,d,m;const u=e,f=u;if(null===(s=t.locale)||void 0===s||s.language,!(u.template_mode||u.entity&&""!==u.entity.trim()))return this.renderGradientErrorState("Select Camera Entity","Choose a camera entity in the General tab","mdi:camera-outline");if(u.template_mode&&(!u.template||""===u.template.trim()))return this.renderGradientErrorState("Configure Template","Enter template code in the General tab","mdi:camera-outline");const b=f.design||{};let x,y,_,w;if(u.template_mode&&u.template&&(!this._templateService&&t&&(this._templateService=new h.I(t)),t)){t.__uvc_template_strings||(t.__uvc_template_strings={});const e=this._hashString(u.template),i=`camera_${u.id}_${e}`;if(this._templateService&&!this._templateService.hasTemplateSubscription(i)){const e=(0,g.pL)(u.entity||"",t,{camera_name:u.camera_name,live_view:u.live_view});this._templateService.subscribeToTemplate(u.template,i,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update",{bubbles:!0,composed:!0})),window._ultraCardUpdateTimer=null}),50)))}),e,n)}const o=null===(l=t.__uvc_template_strings)||void 0===l?void 0:l[i];if(o&&""!==String(o).trim()){const e=(0,v.cv)(o);(0,v.HD)(e)||(e.entity&&(x=e.entity),void 0!==e.visible&&(y=e.visible),e.overlay_text&&(_=e.overlay_text),e.overlay_color&&(w=e.overlay_color))}}if(!1===y)return i.qy``;let k,$=x||u.entity;if(k="live"===(u.view_mode||"auto")?"live":"auto",this._isEditorOpen()){const e=null!==(c=this._lastAppliedEntity)&&void 0!==c?c:$,n=null!==(d=this._lastAppliedLive)&&void 0!==d?d:"live"===k;$&&this._scheduleCameraUpdate($,"live"===k,u,t),$=e||"",this._lastAppliedLive=n}else{const e=!!$&&this._isValidCameraEntity(t,$);this._lastAppliedEntity=e?$:this._lastAppliedEntity,this._lastAppliedLive="live"===k}const S=$?t.states[$]:null,C=!S||"unavailable"===S.state,T=this._isAudioActive(u);let E;u.template_mode&&$===this._lastRenderedEntity&&$?E=`camera_${u.id}_${$}_audio_${T}`:(this._lastRenderedEntity=$,E=`camera_${u.id}_${$||"none"}_audio_${T}_${Date.now()}`),this._cameraStableKeys.set(u.id,E);const A=_||u.camera_name||(S?S.attributes.friendly_name||S.entity_id:"Camera"),z={width:"100%",maxWidth:"100%",boxSizing:"border-box",display:"flex",flexDirection:"column",alignItems:"left"===b.alignment?"flex-start":"right"===b.alignment?"flex-end":"center",justifyContent:"center",color:b.color||this.getTextColor(f),fontFamily:b.font_family||this.getTextFont(f),fontSize:b.font_size?"number"==typeof b.font_size?`${b.font_size}px`:b.font_size:this.getTextSize(f),fontWeight:b.font_weight||this.getTextWeight(f),textTransform:b.text_transform||void 0,letterSpacing:b.letter_spacing||void 0,lineHeight:b.line_height||void 0,textShadow:b.text_shadow||void 0},L=u.crop_left||0,M=u.crop_right||0,j=u.crop_top||0,R=u.crop_bottom||0,O=b.width&&""!==b.width,N=b.height&&""!==b.height,F=u.width||320,D=u.height||180,I=F*(100-L-M)/100,U=D*(100-j-R)/100,H=L>0||M>0||j>0||R>0,q=H?-F*L/100:0,W=H?-D*j/100:0,P=u.rotation||0,B={objectFit:"cover",width:H?`${F}px`:"100%",height:H?`${D}px`:"100%",display:"block",position:H?"absolute":"static",left:H?`${q}px`:"auto",top:H?`${W}px`:"auto",transform:0!==P?`rotate(${P}deg)`:"",transition:"all 0.3s ease",borderRadius:b.border_radius||"0px"},V={width:b.width||(O?"100%":`${Math.max(50,I)}px`),height:b.height||(N?"auto":`${Math.max(50,U)}px`),maxWidth:b.max_width||void 0,minWidth:b.min_width||void 0,maxHeight:b.max_height||void 0,minHeight:b.min_height||void 0,position:"relative",overflow:b.overflow||"hidden",borderRadius:b.border_radius||"0px",background:b.background_color||"transparent",backgroundImage:this.getBackgroundImageWithDesign(b,f,t)||void 0,border:this.getBorderWithDesign(b,f)||void 0,padding:"0",margin:this.getMarginWithDesign(b,f),boxShadow:b.box_shadow||void 0,backdropFilter:b.backdrop_filter||void 0,clipPath:b.clip_path||void 0},X=u.name_position||"top-left",Y=this.getCameraNamePositionStyles(X,f,b,w),G="dashboard"===r,K="live"===(u.view_mode||"auto"),Z=e=>{if(!K)return;const t=this._isAudioActive(u,G);if(!t)return;const n=e.currentTarget||e.target.closest(".camera-image-container"),i=null==n?void 0:n.querySelector("hui-image");i&&this._ensureAudioState(i,u,t)},J=!!K&&this._isAudioActive(u,G),Q=i.qy`
      <div
        class="camera-module-container"
        data-uc-camera-id="${u.id}"
        style=${this.styleObjectToCss(z)}
      >
        <div
          class="camera-image-container"
          style=${this.styleObjectToCss(V)}
          @click=${Z}
          @touchstart=${Z}
        >
          ${$?C?i.qy`
                  <div
                    class="camera-unavailable"
                    style=${this.styleObjectToCss(Object.assign(Object.assign({},B),{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",backgroundColor:"var(--error-color, #f44336)",color:b.color||this.getTextColor(f),position:"static",left:"auto",top:"auto",fontFamily:b.font_family||this.getTextFont(f)}))}
                  >
                    ${u.fallback_image?i.qy`
                          <img
                            src=${u.fallback_image}
                            alt="Fallback"
                            style="max-width: 100%; max-height: 100%; object-fit: cover;"
                          />
                        `:i.qy`
                          <ha-icon
                            icon="mdi:camera-off"
                            style="font-size: 48px; margin-bottom: 8px;"
                          ></ha-icon>
                          <span
                            style="font-weight: ${b.font_weight||this.getTextWeight(f)}; font-size: ${b.font_size?"number"==typeof b.font_size?`${b.font_size}px`:b.font_size:this.getTextSize(f)};"
                            >Camera Unavailable</span
                          >
                          <span
                            style="font-size: ${b.font_size&&"number"==typeof b.font_size?`${Math.max(10,b.font_size-2)}px`:this.getSmallTextSize(f)}; margin-top: 4px; opacity: 0.9;"
                            >Entity: ${$}</span
                          >
                        `}
                  </div>
                  ${!1!==u.show_name?i.qy`
                        <div
                          class="camera-name-overlay"
                          style=${this.styleObjectToCss(Y)}
                        >
                          ${A}
                        </div>
                      `:""}
                `:(0,o.P)(i.qy`
                  <!-- Use HA's native camera image component - same as picture-glance card -->
                  <!-- Cache directive prevents WebRTC re-initialization during template editing -->
                  <hui-image
                    ${(0,a.K)(this._huiImageRef)}
                    data-camera-key=${this._cameraStableKeys.get(u.id)||$}
                    .hass=${t}
                    .cameraImage=${$}
                    .cameraView=${this._lastAppliedLive?"live":"auto"}
                    .muted=${!J}
                    style=${this.styleObjectToCss(B)}
                    class="camera-image"
                    @error=${()=>{}}
                    @load=${e=>{const n=e.target,i=n.closest(".camera-image-container");if(i){const e=i.querySelector(".camera-name-overlay"),t=i.querySelector(".camera-fullscreen-icon");setTimeout((()=>{this.repositionPreviewOverlays(n,e,t,i)}),100)}K&&this._ensureAudioState(e.target,u,J),"snapshot"===(u.view_mode||"auto")?this._setupSnapshotRefresh(u,$||"",t):this._clearSnapshotRefresh(u.id)}}
                  ></hui-image>
                  ${!1!==u.show_name?i.qy`
                        <div
                          class="camera-name-overlay"
                          style=${this.styleObjectToCss(Y)}
                        >
                          ${A}
                        </div>
                      `:""}
                `):i.qy`
                <div
                  class="camera-unavailable"
                  style=${this.styleObjectToCss(Object.assign(Object.assign({},B),{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",backgroundColor:"var(--warning-color, #ff9800)",color:b.color||this.getTextColor(f),position:"static",left:"auto",top:"auto",fontFamily:b.font_family||this.getTextFont(f)}))}
                >
                  <ha-icon
                    icon="mdi:camera-plus"
                    style="font-size: 48px; margin-bottom: 8px;"
                  ></ha-icon>
                  <span
                    style="font-weight: ${b.font_weight||this.getTextWeight(f)}; font-size: ${b.font_size?"number"==typeof b.font_size?`${b.font_size}px`:b.font_size:this.getTextSize(f)};"
                    >No Camera Selected</span
                  >
                  <span
                    style="font-size: ${b.font_size&&"number"==typeof b.font_size?`${Math.max(10,b.font_size-2)}px`:this.getSmallTextSize(f)}; margin-top: 4px; opacity: 0.9;"
                    >Choose a camera entity below</span
                  >
                </div>
                ${!1!==u.show_name?i.qy`
                      <div
                        class="camera-name-overlay"
                        style=${this.styleObjectToCss(Y)}
                      >
                        ${A}
                      </div>
                    `:""}
              `}
        </div>
      </div>
    `,ee=null===(m=u.design)||void 0===m?void 0:m.hover_effect,te=p.k.getHoverEffectClass(ee);return this.hasActiveLink(u)?i.qy`<div
          class="camera-module-clickable ${te}"
          @click=${e=>this.handleClick(e,u,t)}
          @dblclick=${e=>this.handleDoubleClick(e,u,t)}
          @mousedown=${e=>this.handleMouseDown(e,u,t)}
          @mouseup=${e=>this.handleMouseUp(e,u,t)}
          @mouseleave=${e=>this.handleMouseLeave(e,u,t)}
          @touchstart=${e=>this.handleTouchStart(e,u,t)}
          @touchend=${e=>this.handleTouchEnd(e,u,t)}
        >
          ${Q}
        </div>`:te?i.qy`<div class="camera-module-container ${te}">${Q}</div>`:Q}renderLogicTab(e,t,n,i){return c.X.render(e,t,(e=>i(e)))}validate(e){const t=e,n=[...super.validate(e).errors];return"snapshot"===t.view_mode&&t.refresh_interval&&(t.refresh_interval<1||t.refresh_interval>300)&&n.push("Refresh interval must be between 1 and 300 seconds for snapshot mode"),t.border_radius&&isNaN(Number(t.border_radius))&&n.push("Border radius must be a number"),void 0!==t.rotation&&null!==t.rotation&&(isNaN(Number(t.rotation))||t.rotation<0||t.rotation>360)&&n.push("Rotation must be a number between 0 and 360 degrees"),t.tap_action&&t.tap_action.action&&n.push(...this.validateAction(t.tap_action)),t.hold_action&&t.hold_action.action&&n.push(...this.validateAction(t.hold_action)),t.double_tap_action&&t.double_tap_action.action&&n.push(...this.validateAction(t.double_tap_action)),{valid:0===n.length,errors:n}}handleClick(e,t,n,i){e.preventDefault(),this.clickTimeout&&clearTimeout(this.clickTimeout),this.clickTimeout=setTimeout((()=>{this.handleTapAction(e,t,n,i)}),300)}handleDoubleClick(e,t,n,i){e.preventDefault(),this.clickTimeout&&(clearTimeout(this.clickTimeout),this.clickTimeout=null),this.handleDoubleAction(e,t,n,i)}handleMouseDown(e,t,n,i){this.isHolding=!1,this.holdTimeout=setTimeout((()=>{this.isHolding=!0,this.handleHoldAction(e,t,n,i)}),500)}handleMouseUp(e,t,n){this.holdTimeout&&(clearTimeout(this.holdTimeout),this.holdTimeout=null)}handleMouseLeave(e,t,n){this.holdTimeout&&(clearTimeout(this.holdTimeout),this.holdTimeout=null),this.isHolding=!1}handleTouchStart(e,t,n,i){this.handleMouseDown(e,t,n,i)}handleTouchEnd(e,t,n){this.handleMouseUp(e,t,n)}handleTapAction(e,t,n,i){if(!this.isHolding)if(!0!==t.tap_opens_fullscreen)if(t.tap_action){const o="default"===t.tap_action.action?{action:"more-info",entity:t.entity}:t.tap_action;d.K.handleAction(o,n,e.target,i,t.entity,t)}else t.entity&&d.K.handleAction({action:"more-info",entity:t.entity},n,e.target,i,t.entity,t);else this.handleFullscreenClick(e,t,i)}handleHoldAction(e,t,n,i){t.hold_action&&"nothing"!==t.hold_action.action&&d.K.handleAction(t.hold_action,n,e.target,i,t.entity,t)}handleDoubleAction(e,t,n,i){t.double_tap_action&&"nothing"!==t.double_tap_action.action&&d.K.handleAction(t.double_tap_action,n,e.target,i,t.entity,t)}handleFullscreenClick(e,t,i){e.stopPropagation(),e.preventDefault(),!1!==(null==i?void 0:i.haptic_feedback)&&Promise.resolve().then(n.bind(n,9811)).then((({forwardHaptic:e})=>{e("medium")})),this.createFullscreenModal(t)}createFullscreenModal(e){var t;document.querySelectorAll('[id^="ultra-camera-fullscreen-"]').forEach((e=>e.remove()));let n=e.entity;if(e.template_mode&&e.template)try{if(null===(t=document.querySelector("home-assistant"))||void 0===t?void 0:t.hass){const t=e.template.match(/['"]([^'"]+)['"]/);t&&(n=t[1])}}catch(e){}if(!n)return void alert("No camera entity available");const i="ultra-camera-fullscreen-"+Date.now(),o=document.createElement("div");o.id=i,o.style.cssText=`\n      position: fixed !important;\n      top: 0 !important;\n      left: 0 !important;\n      width: 100vw !important;\n      height: 100vh !important;\n      background: rgba(0,0,0,0.95) !important;\n      z-index: ${u.Mu.CAMERA_FULLSCREEN_OVERLAY} !important;\n      display: flex !important;\n      align-items: center !important;\n      justify-content: center !important;\n      backdrop-filter: blur(10px) !important;\n      touch-action: none !important;\n      user-select: none !important;\n      -webkit-user-select: none !important;\n      -webkit-touch-callout: none !important;\n    `;const a=document.createElement("div");a.style.cssText="\n      position: relative !important;\n      width: 100vw !important;\n      height: 100vh !important;\n      overflow: hidden !important;\n      background: black !important;\n    ";const r=document.createElement("div");r.id=i+"-camera-container",r.style.cssText="\n      width: 100% !important;\n      height: 100% !important;\n      display: flex !important;\n      align-items: center !important;\n      justify-content: center !important;\n      min-height: 300px !important;\n      touch-action: none !important;\n      user-select: none !important;\n    ";const s=document.createElement("button");if(s.innerHTML="✕",s.style.cssText=`\n      position: absolute !important;\n      top: 20px !important;\n      right: 20px !important;\n      width: 50px !important;\n      height: 50px !important;\n      border: 3px solid rgba(255,255,255,0.7) !important;\n      background: rgba(0,0,0,0.8) !important;\n      color: white !important;\n      font-size: 30px !important;\n      font-weight: bold !important;\n      cursor: pointer !important;\n      border-radius: 50% !important;\n      display: flex !important;\n      align-items: center !important;\n      justify-content: center !important;\n      z-index: ${u.Mu.CAMERA_FULLSCREEN_CONTENT} !important;\n      backdrop-filter: blur(4px) !important;\n      box-shadow: 0 4px 12px rgba(0,0,0,0.6) !important;\n      font-family: Arial, sans-serif !important;\n      line-height: 1 !important;\n      transition: all 0.2s ease !important;\n    `,!1!==e.show_name){const t=document.createElement("div");t.style.cssText="\n        position: absolute !important;\n        top: 20px !important;\n        left: 20px !important;\n        padding: 10px 16px !important;\n        background: rgba(0,0,0,0.8) !important;\n        color: white !important;\n        border-radius: 8px !important;\n        font-size: 16px !important;\n        font-weight: 500 !important;\n        backdrop-filter: blur(4px) !important;\n        text-shadow: 0 1px 2px rgba(0,0,0,0.8) !important;\n        border: 1px solid rgba(255,255,255,0.2) !important;\n        box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;\n      ",t.textContent=e.camera_name||n,a.appendChild(t)}a.appendChild(r),a.appendChild(s),o.appendChild(a),document.body.appendChild(o);const l=()=>{const e=o._restoreViewport;e&&e(),o.remove(),document.removeEventListener("keydown",p),document.body.style.overflow=""},c=()=>{o.removeAttribute("inert"),s.removeAttribute("inert"),o.style.pointerEvents="auto",s.style.pointerEvents="auto",s.addEventListener("click",(e=>{e.stopPropagation(),e.preventDefault(),l()}),!0),o.addEventListener("click",(e=>{e.target===o&&(e.stopPropagation(),e.preventDefault(),l())}),!0)};c(),setTimeout(c,100);const d=new MutationObserver((e=>{e.forEach((e=>{if("attributes"===e.type&&"inert"===e.attributeName){const t=e.target;t!==o&&t!==s||(t.removeAttribute("inert"),t.style.pointerEvents="auto")}}))}));d.observe(o,{attributes:!0}),d.observe(s,{attributes:!0}),setTimeout((()=>{var t;const o=document.getElementById(i),a=document.getElementById(i+"-camera-container");if(o&&a){const i=null===(t=document.querySelector("home-assistant"))||void 0===t?void 0:t.hass,o=(e.view_mode,!0===e.audio_enabled);if(i){const t=document.createElement("hui-image");t.setAttribute("data-camera-fullscreen",n||""),t.hass=i,t.cameraImage=n,t.cameraView="live",t.muted=!o,t.addEventListener("load",(()=>{this._ensureAudioState(t,e,o)})),setTimeout((()=>{this._ensureAudioState(t,e,o)}),200),t.style.cssText="\n            width: 100vw !important;\n            height: 100vh !important;\n            display: block !important;\n            object-fit: contain !important;\n            transition: transform 0.2s ease !important;\n            cursor: grab !important;\n            touch-action: none !important;\n          ",a.innerHTML="",a.appendChild(t),this.addPinchZoomToCamera(t,a)}else{const e=document.createElement("img");e.src=`/api/camera_proxy/${n}?t=${Date.now()}`,e.style.cssText="\n            width: 100vw !important;\n            height: 100vh !important;\n            display: block !important;\n            object-fit: contain !important;\n            cursor: grab !important;\n            touch-action: none !important;\n          ",a.innerHTML="",a.appendChild(e),this.addPinchZoomToCamera(e,a)}}}),50);const p=e=>{"Escape"===e.key&&l()};document.addEventListener("keydown",p),document.body.style.overflow="hidden";const m=document.querySelector('meta[name="viewport"]'),h=(null==m?void 0:m.content)||"";m&&(m.content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"),o._restoreViewport=()=>{m&&(m.content=h)}}addPinchZoomToCamera(e,t){let n=1,i=0,o=0,a=0,r=!1,s=!1,l=0,c=0,d=0,p=0;const m=()=>{e.style.transform=`translate(${i}px, ${o}px) scale(${n})`,e.style.transformOrigin="center center",e.style.transition=r||s?"none":"transform 0.2s ease"},u=(e,t)=>{const n=e.clientX-t.clientX,i=e.clientY-t.clientY;return Math.sqrt(n*n+i*i)};t.addEventListener("touchstart",(e=>{e.touches.length>1&&e.preventDefault()}),{passive:!1}),t.addEventListener("touchmove",(e=>{e.touches.length>1&&e.preventDefault()}),{passive:!1});const h=()=>{if(n>1){const{maxX:t,maxY:a}=(()=>{const t=e.getBoundingClientRect(),i=t.width*n,o=t.height*n;return{maxX:Math.max(0,(i-window.innerWidth)/2),maxY:Math.max(0,(o-window.innerHeight)/2)}})();i=Math.max(-t,Math.min(t,i)),o=Math.max(-a,Math.min(a,o))}};e.addEventListener("touchstart",(e=>{2===e.touches.length?(e.preventDefault(),e.stopPropagation(),r=!0,a=u(e.touches[0],e.touches[1])):1===e.touches.length&&n>1&&(d=e.touches[0].clientX,p=e.touches[0].clientY)}),{passive:!1}),e.addEventListener("touchmove",(e=>{if(r&&2===e.touches.length){e.preventDefault(),e.stopPropagation();const t=u(e.touches[0],e.touches[1]);a>0&&(n*=t/a,n=Math.max(1,Math.min(6,n)),n>1&&h(),m()),a=t}else if(1===e.touches.length&&n>1){e.preventDefault();const t=e.touches[0].clientX-d,n=e.touches[0].clientY-p;i+=t,o+=n,h(),m(),d=e.touches[0].clientX,p=e.touches[0].clientY}}),{passive:!1}),e.addEventListener("touchend",(t=>{0===t.touches.length?(r=!1,n<1.02&&(n=1,i=0,o=0),m(),e.style.cursor=n>1?"grab":"default"):1===t.touches.length&&r&&(r=!1,n<1.02&&(n=1,i=0,o=0),m())})),e.addEventListener("touchcancel",(()=>{r=!1,n<1.02&&(n=1,i=0,o=0),m(),e.style.cursor=n>1?"grab":"default"})),e.addEventListener("mousedown",(t=>{n>1&&(t.preventDefault(),s=!0,l=t.clientX,c=t.clientY,e.style.cursor="grabbing")})),document.addEventListener("mousemove",(e=>{if(s&&n>1){e.preventDefault();const t=e.clientX-l,n=e.clientY-c;i+=t,o+=n,h(),m(),l=e.clientX,c=e.clientY}})),document.addEventListener("mouseup",(()=>{s&&(s=!1,n<1.02&&(n=1,i=0,o=0,m()),e.style.cursor=n>1?"grab":"default")})),e.addEventListener("wheel",(t=>{t.preventDefault();const a=t.deltaY>0?-.15:.15;n=Math.max(1,Math.min(6,n+a)),n<1.02?(n=1,i=0,o=0):n>1&&h(),m(),e.style.cursor=n>1?"grab":"default"}),{passive:!1});let g=0,v=0,f=0;e.addEventListener("touchend",(t=>{const a=Date.now(),r=a-g;if(r<300&&r>0&&0===t.touches.length)if(n>1)n=1,i=0,o=0,m(),e.style.cursor="default";else{const a=t.changedTouches[0],r=e.getBoundingClientRect(),s=a.clientX-r.left-r.width/2,l=a.clientY-r.top-r.height/2;n=2.5,i=-s*(n-1),o=-l*(n-1),h(),m(),e.style.cursor="grab"}t.changedTouches.length>0&&(v=t.changedTouches[0].clientX,f=t.changedTouches[0].clientY),g=a}))}trySimpleModal(e,t){var n;try{let e=t.entity;if(t.template_mode&&t.template)try{if(null===(n=document.querySelector("home-assistant"))||void 0===n?void 0:n.hass){const n=t.template.match(/['"]([^'"]+)['"]/);n&&(e=n[1])}}catch(e){}if(!e)return!1;const i="camera-fullscreen-"+Date.now(),o=t.camera_name||e,a=`\n        <div id="${i}" style="\n          position: fixed !important;\n          top: 0 !important;\n          left: 0 !important;\n          right: 0 !important;\n          bottom: 0 !important;\n          background: rgba(0,0,0,0.95) !important;\n          display: flex !important;\n          align-items: center !important;\n          justify-content: center !important;\n          z-index: ${u.Mu.CAMERA_FULLSCREEN_CONTENT} !important;\n          backdrop-filter: blur(10px) !important;\n        " onclick="if(event.target === this) this.remove()">\n          <div style="\n            position: relative !important;\n            max-width: 95vw !important;\n            max-height: 95vh !important;\n            background: black !important;\n            border-radius: 12px !important;\n            overflow: hidden !important;\n            box-shadow: 0 20px 60px rgba(0,0,0,0.5) !important;\n          ">\n            <img src="/api/camera_proxy/${e}?t=${Date.now()}" style="\n              max-width: 95vw !important;\n              max-height: 95vh !important;\n              width: auto !important;\n              height: auto !important;\n              display: block !important;\n              object-fit: contain !important;\n              border-radius: 12px !important;\n            " />\n            <button onclick="document.getElementById('${i}').remove()" style="\n              position: absolute !important;\n              top: 16px !important;\n              right: 16px !important;\n              width: 48px !important;\n              height: 48px !important;\n              border: 2px solid rgba(255,255,255,0.5) !important;\n              background: rgba(0,0,0,0.8) !important;\n              color: white !important;\n              font-size: 28px !important;\n              cursor: pointer !important;\n              border-radius: 50% !important;\n              display: flex !important;\n              align-items: center !important;\n              justify-content: center !important;\n              z-index: ${u.Mu.CAMERA_FULLSCREEN_CONTENT} !important;\n              backdrop-filter: blur(4px) !important;\n              box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;\n              font-family: monospace !important;\n              line-height: 1 !important;\n            " onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='rgba(0,0,0,0.8)'; this.style.transform='scale(1)'">\n              ✕\n            </button>\n            ${!1!==t.show_name?`\n              <div style="\n                position: absolute !important;\n                top: 16px !important;\n                left: 16px !important;\n                padding: 8px 16px !important;\n                background: rgba(0,0,0,0.7) !important;\n                color: white !important;\n                border-radius: 6px !important;\n                font-size: 16px !important;\n                font-weight: 500 !important;\n                backdrop-filter: blur(4px) !important;\n                text-shadow: 0 1px 2px rgba(0,0,0,0.8) !important;\n                z-index: 10 !important;\n              ">\n                ${o}\n              </div>\n            `:""}\n          </div>\n        </div>\n      `;document.body.insertAdjacentHTML("beforeend",a);const r=e=>{if("Escape"===e.key){const e=document.getElementById(i);e&&(e.remove(),document.removeEventListener("keydown",r))}};return document.addEventListener("keydown",r),!0}catch(e){return console.warn("Simple modal failed:",e),!1}}tryNativeFullscreen(e,t){try{const t=document.createElement("div");t.style.cssText="\n        width: 100vw;\n        height: 100vh;\n        background: black;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        position: relative;\n      ";const n=e.cloneNode(!0);n.style.cssText="\n        max-width: 100vw;\n        max-height: 100vh;\n        width: auto;\n        height: auto;\n        object-fit: contain;\n      ";const i=document.createElement("button");i.innerHTML="✕",i.style.cssText=`\n        position: absolute;\n        top: 20px;\n        right: 20px;\n        background: rgba(0,0,0,0.7);\n        color: white;\n        border: none;\n        padding: 10px 15px;\n        border-radius: 50%;\n        cursor: pointer;\n        font-size: 20px;\n        z-index: ${u.Mu.DIALOG_CONTENT};\n      `,i.onclick=()=>{document.exitFullscreen?document.exitFullscreen():document.webkitExitFullscreen?document.webkitExitFullscreen():document.mozCancelFullScreen?document.mozCancelFullScreen():document.msExitFullscreen&&document.msExitFullscreen()},t.appendChild(n),t.appendChild(i),document.body.appendChild(t);const o=t.requestFullscreen||t.webkitRequestFullscreen||t.mozRequestFullScreen||t.msRequestFullscreen;if(o){o.call(t);const e=()=>{t.parentNode&&t.parentNode.removeChild(t),document.removeEventListener("fullscreenchange",e),document.removeEventListener("webkitfullscreenchange",e),document.removeEventListener("mozfullscreenchange",e),document.removeEventListener("MSFullscreenChange",e)};return document.addEventListener("fullscreenchange",e),document.addEventListener("webkitfullscreenchange",e),document.addEventListener("mozfullscreenchange",e),document.addEventListener("MSFullscreenChange",e),!0}}catch(e){console.warn("Native fullscreen failed:",e)}return!1}enterFullscreen(e,t){var n,i,o,a;const r=document.createElement("div");r.className="camera-fullscreen-overlay",r.style.cssText=`\n      position: fixed;\n      top: 0;\n      left: 0;\n      width: 100vw;\n      height: 100vh;\n      background: rgba(0, 0, 0, 0.95);\n      z-index: ${u.Mu.CAMERA_FULLSCREEN_CONTENT};\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      backdrop-filter: blur(10px);\n      animation: fadeIn 0.3s ease;\n      pointer-events: auto;\n    `;const s=document.createElement("div");s.className="camera-fullscreen-container",s.style.cssText="\n      max-width: 95vw;\n      max-height: 95vh;\n      width: auto;\n      height: auto;\n      border-radius: 12px;\n      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);\n      position: relative;\n      animation: scaleIn 0.3s ease;\n      background: transparent;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      pointer-events: none;\n    ";let l=t.entity;if(t.template_mode&&t.template)try{const e=null===(n=document.querySelector("home-assistant"))||void 0===n?void 0:n.hass;if(e){let n=t.template;const i=n.match(/states\(['"]([^'"]+)['"]\)/g);i&&i.forEach((t=>{const i=t.match(/states\(['"]([^'"]+)['"]\)/)[1],o=null==e?void 0:e.states[i],a=o?o.state:"unknown";n=n.replace(t,`'${a}'`)}));const o=n.match(/is_state\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)/g);o&&o.forEach((t=>{const[,i,o]=t.match(/is_state\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)/),a=null==e?void 0:e.states[i],r=a&&a.state===o;n=n.replace(t,r?"True":"False")}));const a=n.match(/['"]([^'"]+)['"] if (.+?) else ['"]([^'"]+)['"]/);if(a){const[,e,t,n]=a;l=t.includes("True")?e:n}else{const e=n.match(/['"]([^'"]+)['"]/);e&&(l=e[1])}}}catch(e){console.error("Template evaluation error:",e),l=t.entity}if(l){const e=null===(i=document.querySelector("home-assistant"))||void 0===i?void 0:i.hass;if(e){const n=document.createElement("hui-image");n.hass=e,n.cameraImage=l,n.cameraView=t.live_view?"live":"auto";const i=!0===t.audio_enabled;if(n.muted=!i,n.addEventListener("load",(()=>{this._ensureAudioState(n,t,i)})),setTimeout((()=>{this._ensureAudioState(n,t,i)}),200),n.style.cssText="\n          width: 100%;\n          height: 100%;\n          max-width: 95vw;\n          max-height: 95vh;\n          object-fit: contain;\n          border-radius: 12px;\n          pointer-events: auto;\n        ",s.appendChild(n),!1!==t.show_name){const i=t.camera_name||(null===(a=null===(o=e.states[l])||void 0===o?void 0:o.attributes)||void 0===a?void 0:a.friendly_name)||l,r=document.createElement("div");r.className="camera-name-overlay-fullscreen",r.style.cssText="\n              position: absolute;\n              top: 16px;\n              left: 16px;\n              padding: 8px 16px;\n              background: rgba(0, 0, 0, 0.7);\n              color: white;\n              border-radius: 6px;\n              font-size: 16px;\n              font-weight: 500;\n              backdrop-filter: blur(4px);\n              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);\n              z-index: 10;\n            ",r.textContent=i,n.addEventListener("load",(()=>{this.repositionOverlaysToVideoArea(n,r,s)})),s.appendChild(r)}}else{const e=document.createElement("div");e.style.cssText="\n          display: flex;\n          align-items: center;\n          justify-content: center;\n          flex-direction: column;\n          color: white;\n          font-size: 20px;\n          text-align: center;\n          padding: 40px;\n        ",e.innerHTML='\n          <ha-icon icon="mdi:camera-off" style="font-size: 64px; margin-bottom: 16px;"></ha-icon>\n          <div>Home Assistant not available</div>\n        ',s.appendChild(e)}}else{const e=document.createElement("div");e.style.cssText="\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        flex-direction: column;\n        color: white;\n        font-size: 20px;\n        text-align: center;\n        padding: 40px;\n      ",e.innerHTML='\n        <ha-icon icon="mdi:camera-off" style="font-size: 64px; margin-bottom: 16px;"></ha-icon>\n        <div>No Camera Available</div>\n      ',s.appendChild(e)}const c=document.createElement("div");c.className="camera-minimize-icon",c.style.cssText=`\n      position: fixed;\n      top: 20px;\n      right: 20px;\n      padding: 6px;\n      background: transparent;\n      color: white;\n      font-size: 32px;\n      cursor: pointer;\n      z-index: ${u.Mu.CAMERA_FULLSCREEN_CONTENT};\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      transition: all 0.2s ease;\n      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.6);\n      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));\n      pointer-events: auto;\n    `,c.innerHTML='<ha-icon icon="mdi:close" style="pointer-events: none;"></ha-icon>',c.title="Exit fullscreen",c.addEventListener("mouseenter",(()=>{c.style.transform="scale(1.15)",c.style.textShadow="0 1px 4px rgba(0, 0, 0, 0.9), 0 0 12px rgba(0, 0, 0, 0.7)",c.style.filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9))"})),c.addEventListener("mouseleave",(()=>{c.style.transform="scale(1)",c.style.textShadow="0 1px 3px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.6)",c.style.filter="drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8))"})),c.addEventListener("click",(e=>{e.stopPropagation(),e.preventDefault(),this.exitFullscreen(r)}));const d=e=>{"Escape"===e.key&&(this.exitFullscreen(r),document.removeEventListener("keydown",d))};document.addEventListener("keydown",d),r.addEventListener("click",(e=>{e.target===r&&(this.exitFullscreen(r),document.removeEventListener("keydown",d))})),r.appendChild(s),document.body.appendChild(r),document.body.appendChild(c),document.body.style.overflow="hidden";const p=e=>(e.preventDefault(),e.stopPropagation(),!1);document.addEventListener("contextmenu",p,!0),document.body.classList.add("camera-fullscreen-active"),r._escHandler=d,r._minimizeButton=c,r._contextMenuHandler=p}exitFullscreen(e){document.body.style.overflow="",document.body.classList.remove("camera-fullscreen-active");const t=e._escHandler;t&&document.removeEventListener("keydown",t);const n=e._contextMenuHandler;n&&document.removeEventListener("contextmenu",n,!0);const i=e._minimizeButton;i&&i.parentNode&&i.parentNode.removeChild(i),e.style.animation="fadeOut 0.2s ease",setTimeout((()=>{e.parentNode&&e.parentNode.removeChild(e)}),200)}repositionPreviewOverlays(e,t,n,i){try{const o=i.getBoundingClientRect(),a=e.querySelector("img")||e;if(!a||!a.naturalWidth)return;const r=a.naturalWidth/a.naturalHeight,s=o.width/o.height;let l=o.width,c=o.height,d=0,p=0;if(r>s?(c=o.width/r,p=(o.height-c)/2):r<s&&(l=o.height*r,d=(o.width-l)/2),d>5||p>5){const e=8;t&&this.repositionOverlayElement(t,d,p,l,c,e),n&&this.repositionOverlayElement(n,d,p,l,c,e)}}catch(e){console.warn("Failed to calculate video area for preview overlay positioning:",e)}}repositionOverlayElement(e,t,n,i,o,a){var r;const s=e.getBoundingClientRect();if(!(null===(r=e.parentElement)||void 0===r?void 0:r.getBoundingClientRect()))return;const l=t+i-s.width-a,c=n+o-s.height-a,d=t+i-s.width-a,p=n+o-s.height-a;if(e.style.left&&""!==e.style.left){const n=parseInt(e.style.left);e.style.left=`${Math.min(Math.max(t+a,n),l)}px`}if(e.style.right&&""!==e.style.right){const n=parseInt(e.style.right);e.style.right=`${Math.min(Math.max(t+a,n),d)}px`}if(e.style.top&&""!==e.style.top){const t=parseInt(e.style.top);e.style.top=`${Math.min(Math.max(n+a,t),c)}px`}if(e.style.bottom&&""!==e.style.bottom){const t=parseInt(e.style.bottom);e.style.bottom=`${Math.min(Math.max(n+a,t),p)}px`}}repositionOverlaysToVideoArea(e,t,n){try{const i=n.getBoundingClientRect(),o=e.getBoundingClientRect(),a=i.width/i.height;let r=o.width,s=o.height;const l=e.querySelector("img")||e;if(l&&l.naturalWidth){const e=l.naturalWidth/l.naturalHeight;e>a?(r=i.width,s=i.width/e):(s=i.height,r=i.height*e)}const c=(i.width-r)/2,d=(i.height-s)/2;if(c>20||d>20){t.style.left=`${c+16}px`,t.style.top=`${d+16}px`;const e=n.querySelector(".camera-fullscreen-icon");if(e){const t=e;t.style.right=`${c+16}px`,t.style.top=`${d+16}px`}}}catch(e){console.warn("Failed to calculate video area for overlay positioning:",e)}}_handleDimensionChange(e,t,n,i){const o={};if(!1!==e.aspect_ratio_linked){const i=e.aspect_ratio_value||1.778;"width"===t?(o.width=n,o.height=Math.round(n/i)):(o.height=n,o.width=Math.round(n*i)),o.width&&(o.width<100||o.width>1e3)&&(o.width=Math.max(100,Math.min(1e3,o.width)),o.height=Math.round(o.width/i)),o.height&&(o.height<100||o.height>1e3)&&(o.height=Math.max(100,Math.min(1e3,o.height)),o.width=Math.round(o.height*i))}else o[t]=n;i(o)}getFullscreenIconPositionStyles(e,t,n={},i){const o={position:"absolute",padding:"6px",background:"transparent",color:"white",fontSize:"22px",cursor:"pointer",zIndex:"5",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s ease",textShadow:"0 1px 3px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.6)",filter:"drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8))"},a=i===e,r=a?"40px":"8px";switch(this.getAdjustedPositionForCollision(e,i)){case"top-left":return Object.assign(Object.assign({},o),{top:a?r:"8px",left:"8px"});case"top-middle":return Object.assign(Object.assign({},o),{top:a?r:"8px",left:"50%",transform:"translateX(-50%)"});case"top-right":return Object.assign(Object.assign({},o),{top:a?r:"8px",right:"8px"});case"center":return Object.assign(Object.assign({},o),{top:a?"calc(50% + 20px)":"50%",left:"50%",transform:"translate(-50%, -50%)"});case"bottom-left":return Object.assign(Object.assign({},o),{bottom:a?r:"8px",left:"8px"});case"bottom-middle":return Object.assign(Object.assign({},o),{bottom:a?r:"8px",left:"50%",transform:"translateX(-50%)"});case"bottom-right":return Object.assign(Object.assign({},o),{bottom:a?r:"8px",right:"8px"});default:return Object.assign(Object.assign({},o),{top:"8px",right:"8px"})}}getAdjustedPositionForCollision(e,t){return e}getCameraNamePositionStyles(e,t,n={},i){const o={position:"absolute",padding:"6px 12px",background:"rgba(0, 0, 0, 0.7)",color:i||n.color||this.getTextColor(t),fontSize:n.font_size?"number"==typeof n.font_size?`${n.font_size}px`:n.font_size:this.getTextSize(t),fontWeight:n.font_weight||this.getTextWeight(t),fontFamily:n.font_family||this.getTextFont(t),borderRadius:"4px",zIndex:"0",pointerEvents:"none",backdropFilter:"blur(4px)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textShadow:n.text_shadow||"0 1px 2px rgba(0, 0, 0, 0.8)",transition:"all 0.2s ease",boxSizing:"border-box"};switch(n.text_transform&&(o.textTransform=n.text_transform),n.letter_spacing&&(o.letterSpacing=n.letter_spacing),n.line_height&&(o.lineHeight=n.line_height),e){case"top-left":default:return Object.assign(Object.assign({},o),{top:"8px",left:"8px",maxWidth:"calc(100% - 16px)"});case"top-right":return Object.assign(Object.assign({},o),{top:"8px",right:"8px",maxWidth:"calc(100% - 16px)"});case"top-middle":return Object.assign(Object.assign({},o),{top:"8px",left:"50%",transform:"translateX(-50%)",textAlign:"center",maxWidth:"calc(100% - 24px)"});case"center":return Object.assign(Object.assign({},o),{top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center",maxWidth:"calc(100% - 24px)"});case"bottom-left":return Object.assign(Object.assign({},o),{bottom:"8px",left:"8px",maxWidth:"calc(100% - 16px)"});case"bottom-middle":return Object.assign(Object.assign({},o),{bottom:"8px",left:"50%",transform:"translateX(-50%)",textAlign:"center",maxWidth:"calc(100% - 24px)"});case"bottom-right":return Object.assign(Object.assign({},o),{bottom:"8px",right:"8px",maxWidth:"calc(100% - 16px)"})}}_hashString(e){let t=0;for(let n=0;n<e.length;n+=1)t=(t<<5)-t+e.charCodeAt(n),t|=0;return Math.abs(t)}hasActiveLink(e){const t=e.tap_action&&"nothing"!==e.tap_action.action,n=e.hold_action&&"nothing"!==e.hold_action.action,i=e.double_tap_action&&"nothing"!==e.double_tap_action.action,o=!0===e.tap_opens_fullscreen;return t||n||i||o||!!e.entity}_isAudioActive(e,t=!1){return this._audioOverrides.has(e.id)?this._audioOverrides.get(e.id):!t&&!0===e.audio_enabled}_toggleDashboardAudio(e,t){var n;if(e.preventDefault(),e.stopPropagation(),"live"!==(t.view_mode||"auto"))return;const i=!this._isAudioActive(t,!0);i===(!0===t.audio_enabled)?this._audioOverrides.delete(t.id):this._audioOverrides.set(t.id,i);const o=(null===(n=e.currentTarget)||void 0===n?void 0:n.closest(".camera-image-container"))||e.target.closest(".camera-image-container"),a=null==o?void 0:o.querySelector("hui-image");a&&this._ensureAudioState(a,t,i),"undefined"!=typeof window&&window.dispatchEvent(new CustomEvent("ultra-card-template-update",{bubbles:!0,composed:!0,detail:{timestamp:Date.now(),source:"camera-audio-toggle",moduleId:t.id}}))}_ensureAudioState(e,t,n){if(!e||!1===t.live_view)return;const i=void 0!==n?n:this._isAudioActive(t);this._lastAudioStates.set(t.id,i),void 0!==e.muted&&(e.muted=!i),this._applyAudioState(e,i),this._watchAudioTargets(e,t)}_applyAudioState(e,t){const n=[];[0,150,400,1e3,2e3].forEach((i=>{setTimeout((()=>{const i=(()=>{n.length=0;const t=new Set,i=[],o=e=>{e&&!t.has(e)&&(t.add(e),i.push(e))};for(o(e.shadowRoot||null),o(e);i.length;){const e=i.pop();if(!e)continue;if(e instanceof HTMLElement){const t=e.tagName.toLowerCase();f.has(t)&&n.push(e)}if(e instanceof HTMLVideoElement)return e;const t=e instanceof ShadowRoot||e instanceof Element?Array.from(e.children):[];for(const e of t){if(e instanceof HTMLVideoElement)return e;const t=e;t.shadowRoot&&o(t.shadowRoot),o(e)}}const a=e.video;return a instanceof HTMLVideoElement?a:null})();if(!i&&0===n.length)return;const o=e=>{e.muted=!t,e.volume=t?1:0,e.playsInline=!0,t&&e.paused&&!e.muted&&e.play().catch((()=>{}))};i&&o(i),n.forEach((e=>{var n;try{if("muted"in e&&(e.muted=!t),"volume"in e&&(e.volume=t?1:0),"playsInline"in e&&(e.playsInline=!0),null===(n=e.toggleAttribute)||void 0===n||n.call(e,"muted",!t),e.video instanceof HTMLVideoElement&&o(e.video),t&&"function"==typeof e.play&&"boolean"==typeof e.paused){const t=e;t.paused&&t.play().catch((()=>{}))}}catch(e){}}))}),i)}))}_watchAudioTargets(e,t){if(!e)return;const n=t.id,i=e.shadowRoot||e;if(!i)return;const o=this._audioObservers.get(n);if((null==o?void 0:o.target)===i)return;null==o||o.observer.disconnect();const a=new MutationObserver((()=>{const n=this._lastAudioStates.get(t.id),i=void 0!==n?n:this._isAudioActive(t);this._applyAudioState(e,i)}));a.observe(i,{childList:!0,subtree:!0}),this._audioObservers.set(n,{observer:a,target:i})}refreshCamera(e,t){document.querySelectorAll('hui-image[class*="camera-image"]').forEach((n=>{n.cameraImage===e&&n.hass===t&&(n.hass=Object.assign({},t),n.requestUpdate())}))}_setupSnapshotRefresh(e,t,n){this._clearSnapshotRefresh(e.id);const i=1e3*(e.refresh_interval||10),o=setInterval((()=>{this.refreshCamera(t,n)}),i);this._snapshotRefreshTimers.set(e.id,o)}_clearSnapshotRefresh(e){const t=this._snapshotRefreshTimers.get(e);t&&(clearInterval(t),this._snapshotRefreshTimers.delete(e))}getCameraImageUrl(e,t,n){if(!e||!t)return"";let i;try{i=t.hassUrl?`${t.hassUrl()}/api/camera_proxy/${e}`:`/api/camera_proxy/${e}`;const n=i.includes("?")?"&":"?";i+=`${n}token=${Date.now()}`}catch(t){i=`/api/camera_proxy/${e}?token=${Date.now()}`}return i}async getCameraImageBlob(e,t,n){try{const n=`/api/camera_proxy/${e}?t=${Date.now()}`,i=await fetch(n,{method:"GET",credentials:"include",headers:{Accept:"image/*","Cache-Control":"no-cache",Pragma:"no-cache"}});if(!i.ok)return await this.getCameraImageViaWebSocket(e,t);const o=await i.blob();return URL.createObjectURL(o)}catch(n){return await this.getCameraImageViaWebSocket(e,t)}}async getCameraImageViaWebSocket(e,t){try{const n=t.connection;if(!n)throw new Error("No WebSocket connection available");const i=await n.sendMessagePromise({type:"camera_thumbnail",entity_id:e});if(i&&i.content){const e=atob(i.content),t=new Array(e.length);for(let n=0;n<e.length;n++)t[n]=e.charCodeAt(n);const n=new Uint8Array(t),o=new Blob([n],{type:"image/jpeg"});return URL.createObjectURL(o)}throw new Error("No image content received from WebSocket")}catch(e){return""}}async handleImageError(e,t){var n,i,o,a,r,s,l,c,d,p;const m=e.target;if(!m.dataset.triedBlob&&t.entity){m.dataset.triedBlob="true";try{const e=(null===(n=document.querySelector("home-assistant"))||void 0===n?void 0:n.hass)||(null===(i=document.querySelector("ha-panel-lovelace"))||void 0===i?void 0:i.hass)||(null===(o=window.hassConnection)||void 0===o?void 0:o.hass);if(e){const n=await this.getCameraImageBlob(t.entity,e,t.image_quality);if(n)return void(m.src=n)}}catch(e){}}if(t.fallback_image)m.src=t.fallback_image;else{m.style.display="none";const e=m.closest(".camera-image-container");if(e){const n=t.entity?null===(s=null===(r=null===(a=document.querySelector("home-assistant"))||void 0===a?void 0:a.hass)||void 0===r?void 0:r.states)||void 0===s?void 0:s[t.entity]:null,i=(null===(l=null==n?void 0:n.attributes)||void 0===l?void 0:l.brand)||(null===(c=null==n?void 0:n.attributes)||void 0===c?void 0:c.model)||"Unknown",o=(null===(d=document.querySelector("home-assistant"))||void 0===d||d.hass,t);if(e.innerHTML=`\n          <div style="\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            flex-direction: column;\n            background-color: var(--warning-color, #ff9800);\n            color: ${this.getTextColor(o)};\n            padding: 20px;\n            border-radius: 8px;\n            text-align: center;\n            min-height: 150px;\n            border: 1px solid rgba(255,255,255,0.2);\n            font-family: ${this.getTextFont(o)};\n          ">\n            <ha-icon icon="mdi:camera-off" style="font-size: 48px; margin-bottom: 12px; opacity: 0.9;"></ha-icon>\n            <span style="font-weight: ${this.getTextWeight(o)}; font-size: ${this.getTextSize(o)}; margin-bottom: 8px;">Camera Load Failed</span>\n            <span style="font-size: ${this.getSmallTextSize(o)}; margin-bottom: 8px; opacity: 0.9;">Entity: ${t.entity}</span>\n            <span style="font-size: ${this.getSmallTextSize(o)}; margin-bottom: 12px; opacity: 0.8;">Camera Type: ${i}</span>\n            <div style="font-size: ${this.getSmallTextSize(o)}; opacity: 0.8; line-height: 1.4; margin-bottom: 12px;">\n              <div style="margin-bottom: 6px;">• Check camera entity is working in HA</div>\n              <div style="margin-bottom: 6px;">• Verify RTSP credentials in HA config</div>\n              <div>• Try refreshing the browser</div>\n            </div>\n            <button \n              onclick="window.retryCamera_${null===(p=t.entity)||void 0===p?void 0:p.replace(/\./g,"_")}"\n              style="\n                background: rgba(255,255,255,0.2);\n                border: 1px solid rgba(255,255,255,0.3);\n                color: white;\n                padding: 8px 16px;\n                border-radius: 4px;\n                cursor: pointer;\n                font-size: ${this.getSmallTextSize(o)};\n                font-family: ${this.getTextFont(o)};\n                transition: all 0.2s ease;\n              "\n              onmouseover="this.style.background='rgba(255,255,255,0.3)'"\n              onmouseout="this.style.background='rgba(255,255,255,0.2)'"\n            >\n              🔄 Retry Camera Load\n            </button>\n          </div>\n        `,t.entity){const n=`retryCamera_${t.entity.replace(/\./g,"_")}`;window[n]=async()=>{var n;if(null===(n=document.querySelector("home-assistant"))||void 0===n?void 0:n.hass)try{const n=Date.now(),i=`/api/camera_proxy/${t.entity}?t=${n}`,a=document.createElement("img");a.className="camera-image",a.style.cssText=`\n                  position: absolute;\n                  top: 0;\n                  left: 0;\n                  width: 100%;\n                  height: 100%;\n                  object-fit: ${t.image_fit||"cover"};\n                  border-radius: inherit;\n                `,a.onerror=e=>{"string"!=typeof e&&this.handleImageError(e,t)},a.onload=()=>{e&&(e.innerHTML="",e.appendChild(a))},a.src=i,e&&(e.innerHTML=`\n                    <div style="\n                      display: flex;\n                      align-items: center;\n                      justify-content: center;\n                      flex-direction: column;\n                      background-color: var(--primary-color);\n                      color: ${this.getTextColor(o)};\n                      padding: 20px;\n                      border-radius: 8px;\n                      text-align: center;\n                      min-height: 150px;\n                      font-family: ${this.getTextFont(o)};\n                    ">\n                      <div style="\n                        width: 32px;\n                        height: 32px;\n                        border: 3px solid rgba(255,255,255,0.3);\n                        border-top: 3px solid white;\n                        border-radius: 50%;\n                        animation: spin 1s linear infinite;\n                        margin-bottom: 12px;\n                      "></div>\n                      <span style="font-weight: ${this.getTextWeight(o)}; font-size: ${this.getTextSize(o)};">Retrying Camera Load...</span>\n                      <style>\n                        @keyframes spin {\n                          0% { transform: rotate(0deg); }\n                          100% { transform: rotate(360deg); }\n                        }\n                      </style>\n                    </div>\n                  `)}catch(e){console.error("🎥 Retry failed:",e)}}}}}}renderConditionalFieldsGroup(e,t){return i.qy`
      <div
        class="conditional-fields-group"
        style="margin-top: 16px; padding: 16px; border-left: 4px solid var(--primary-color); background: rgba(var(--rgb-primary-color), 0.08); border-radius: 0 8px 8px 0;"
      >
        <div
          style="font-weight: 600; color: var(--primary-color); margin-bottom: 12px; font-size: 14px;"
        >
          ${e}
        </div>
        ${t}
      </div>
    `}getTextColor(e){return e.text_color||"white"}getTextSize(e){const t=e.text_size||14;return"number"==typeof t?`${t}px`:t}getSmallTextSize(e){const t=e.text_size||14;return`${"number"==typeof t?Math.max(10,t-2):12}px`}getTextWeight(e){return e.text_weight||"500"}getTextFont(e){return e.text_font||'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}styleObjectToCss(e){return Object.entries(e).filter((([e,t])=>null!=t&&""!==t)).map((([e,t])=>`${this.camelToKebab(e)}: ${t}`)).join("; ")}camelToKebab(e){return e.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}addPixelUnit(e){return e&&/^\d+$/.test(e)?`${e}px`:e}getPaddingWithDesign(e,t){return e.padding_top||e.padding_bottom||e.padding_left||e.padding_right?`${e.padding_top||"0px"} ${e.padding_right||"0px"} ${e.padding_bottom||"0px"} ${e.padding_left||"0px"}`:this.getPaddingCSS(t)}getMarginWithDesign(e,t){return e.margin_top||e.margin_bottom||e.margin_left||e.margin_right?`${e.margin_top||"8px"} ${e.margin_right||"0px"} ${e.margin_bottom||"8px"} ${e.margin_left||"0px"}`:this.getMarginCSS(t)}getBorderWithDesign(e,t){return e.border_width&&e.border_style&&e.border_color?`${e.border_width} ${e.border_style} ${e.border_color}`:this.getBorderCSS(t)}getBackgroundImageWithDesign(e,t,n){return"url"===e.background_image_type&&e.background_image?`url('${e.background_image}')`:"entity"===e.background_image_type&&e.background_image_entity&&n.states[e.background_image_entity]?`url('/api/camera_proxy/${e.background_image_entity}')`:this.getBackgroundImageCSS(t,n)}getPaddingCSS(e){return e.padding_top||e.padding_bottom||e.padding_left||e.padding_right?`${this.addPixelUnit(e.padding_top)||"0px"} ${this.addPixelUnit(e.padding_right)||"0px"} ${this.addPixelUnit(e.padding_bottom)||"0px"} ${this.addPixelUnit(e.padding_left)||"0px"}`:"0"}getMarginCSS(e){return e.margin_top||e.margin_bottom||e.margin_left||e.margin_right?`${this.addPixelUnit(e.margin_top)||"8px"} ${this.addPixelUnit(e.margin_right)||"0px"} ${this.addPixelUnit(e.margin_bottom)||"8px"} ${this.addPixelUnit(e.margin_left)||"0px"}`:"8px 0"}getBackgroundCSS(e){return e.background_color||"transparent"}getBackgroundImageCSS(e,t){return"url"===e.background_image_type&&e.background_image?`url('${e.background_image}')`:"entity"===e.background_image_type&&e.background_image_entity&&t.states[e.background_image_entity]?`url('/api/camera_proxy/${e.background_image_entity}')`:""}getBorderCSS(e){return e.border_width&&e.border_style&&e.border_color?`${e.border_width} ${e.border_style} ${e.border_color}`:""}validateAction(e){const t=[];return"navigate"!==e.action||e.navigation_path||t.push("Navigation path is required for navigate action"),"call-service"!==e.action||e.service&&e.service_data||t.push("Service and service data are required for call-service action"),t}getStyles(){return`\n      .camera-module-container {\n        width: 100%;\n        box-sizing: border-box;\n        transition: all 0.3s ease;\n      }\n      \n      .camera-name-overlay {\n        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);\n        backdrop-filter: blur(4px);\n        -webkit-backdrop-filter: blur(4px);\n        transition: all 0.2s ease;\n        box-sizing: border-box;\n        word-break: break-word;\n        hyphens: auto;\n      }\n      \n      /* Ensure camera name doesn't overflow container boundaries */\n      .camera-image-container > .camera-name-overlay {\n        contain: layout style;\n      }\n      \n      .camera-image-container {\n        position: relative;\n        overflow: hidden;\n        margin: 0 auto;\n        flex-shrink: 0;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.3s ease;\n      }\n      \n      .camera-image {\n        width: 100%;\n        height: 100%;\n        transition: all 0.3s ease;\n      }\n\n      .camera-audio-toggle {\n        position: absolute;\n        bottom: 10px;\n        right: 10px;\n        width: 30px;\n        height: 30px;\n        border: none;\n        background: none;\n        color: rgba(255, 255, 255, 0.8);\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        cursor: pointer;\n        z-index: 12;\n        padding: 0;\n        transition: color 0.2s ease, transform 0.2s ease;\n        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);\n      }\n\n      .camera-audio-toggle ha-icon {\n        pointer-events: none;\n        font-size: 20px;\n      }\n\n      .camera-audio-toggle:hover {\n        color: rgba(255, 255, 255, 0.95);\n        transform: scale(1.05);\n      }\n\n      .camera-audio-toggle.active,\n      .camera-audio-toggle.muted {\n        color: rgba(255, 255, 255, 0.9);\n      }\n      \n      .camera-unavailable {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        flex-direction: column;\n        background-color: var(--disabled-color, #f5f5f5);\n        color: var(--secondary-text-color);\n        min-height: 150px;\n        transition: all 0.3s ease;\n      }\n      \n      .camera-module-clickable {\n        cursor: pointer;\n        transition: transform 0.2s ease;\n      }\n      \n      .camera-module-clickable:hover {\n        transform: scale(1.02);\n      }\n      \n      .camera-module-clickable:active {\n        transform: scale(0.98);\n      }\n\n      /* Standard field styling */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n     \n        margin-bottom: 4px !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n      }\n\n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n\n      /* Conditional fields grouping */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      @keyframes slideInFromLeft {\n        from {\n          opacity: 0;\n          transform: translateX(-10px);\n        }\n        to {\n          opacity: 1;\n          transform: translateX(0);\n        }\n      }\n\n      /* Global design responsive text */\n      .camera-module-container * {\n        transition: font-size 0.3s ease, color 0.3s ease, font-weight 0.3s ease;\n      }\n\n      /* Enhanced animations for global design changes */\n      @keyframes textSizeChange {\n        0% { transform: scale(1); }\n        50% { transform: scale(1.02); }\n        100% { transform: scale(1); }\n      }\n\n      .camera-module-container.design-updating {\n        animation: textSizeChange 0.3s ease;\n      }\n\n      /* Fullscreen icon styling */\n      .camera-fullscreen-icon {\n        transition: all 0.2s ease;\n        user-select: none;\n      }\n\n      .camera-fullscreen-icon:hover {\n        transform: scale(1.15);\n        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9), 0 0 12px rgba(0, 0, 0, 0.7);\n        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9));\n      }\n\n      .camera-fullscreen-icon:active {\n        transform: scale(1.05);\n      }\n\n      /* Fullscreen overlay animations */\n      @keyframes fadeIn {\n        from {\n          opacity: 0;\n        }\n        to {\n          opacity: 1;\n        }\n      }\n\n      @keyframes fadeOut {\n        from {\n          opacity: 1;\n        }\n        to {\n          opacity: 0;\n        }\n      }\n\n      @keyframes scaleIn {\n        from {\n          opacity: 0;\n          transform: scale(0.8);\n        }\n        to {\n          opacity: 1;\n          transform: scale(1);\n        }\n      }\n\n      /* Fullscreen overlay global styles */\n      .camera-fullscreen-overlay {\n        -webkit-backdrop-filter: blur(10px);\n        backdrop-filter: blur(10px);\n        z-index: ${u.Mu.CAMERA_FULLSCREEN_CONTENT} !important;\n        position: fixed !important;\n      }\n\n      .camera-fullscreen-overlay .camera-image-container {\n        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);\n      }\n\n      /* Override HA context menus and modals */\n      .camera-minimize-icon {\n        z-index: ${u.Mu.CAMERA_FULLSCREEN_CONTENT} !important;\n        position: fixed !important;\n        pointer-events: auto !important;\n      }\n\n      /* Ensure fullscreen is above all HA elements */\n      body .camera-fullscreen-overlay {\n        z-index: ${u.Mu.CAMERA_FULLSCREEN_CONTENT} !important;\n      }\n\n      body .camera-minimize-icon {\n        z-index: ${u.Mu.CAMERA_FULLSCREEN_CONTENT} !important;\n      }\n\n      /* When fullscreen is active, ensure our elements are always on top */\n      body.camera-fullscreen-active .camera-fullscreen-overlay,\n      body.camera-fullscreen-active .camera-minimize-icon {\n        z-index: ${u.Mu.CAMERA_FULLSCREEN_CONTENT} !important;\n        position: fixed !important;\n      }\n\n      /* Hide HA overlays during fullscreen */\n      body.camera-fullscreen-active ha-dialog,\n      body.camera-fullscreen-active ha-more-info-dialog,\n      body.camera-fullscreen-active .mdc-dialog,\n      body.camera-fullscreen-active .dialog-container {\n        z-index: ${u.Mu.CAMERA_FULLSCREEN_OVERLAY} !important;\n      }\n\n      .camera-minimize-icon:hover {\n        transform: scale(1.15) !important;\n        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9), 0 0 12px rgba(0, 0, 0, 0.7) !important;\n        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9)) !important;\n      }\n\n      .camera-minimize-icon:active {\n        transform: scale(1.05) !important;\n      }\n\n      /* Gap control styles - Standardized Slider Pattern */\n      .gap-control-container {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n\n      .gap-slider {\n        flex: 1;\n        height: 6px;\n        background: var(--divider-color);\n        border-radius: 3px;\n        outline: none;\n        appearance: none;\n        -webkit-appearance: none;\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n\n      .gap-slider::-webkit-slider-thumb {\n        appearance: none;\n        -webkit-appearance: none;\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider::-moz-range-thumb {\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider:hover {\n        background: var(--primary-color);\n        opacity: 0.7;\n      }\n\n      .gap-slider:hover::-webkit-slider-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-slider:hover::-moz-range-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-input {\n        width: 48px !important;\n        max-width: 48px !important;\n        min-width: 48px !important;\n        padding: 4px 6px !important;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 13px;\n        text-align: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n        box-sizing: border-box;\n      }\n\n      .gap-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);\n      }\n\n      .reset-btn {\n        width: 36px;\n        height: 36px;\n        padding: 0;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n      }\n\n      .reset-btn:hover {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n      }\n\n      .reset-btn ha-icon {\n        font-size: 16px;\n      }\n    `}}b.prototype._isEditorOpen=function(){try{return!!document.querySelector("hui-dialog-edit-card, hui-card-edit-mode")}catch(e){return!1}},b.prototype._isValidCameraEntity=function(e,t){var n;if(!e||!t)return!1;const i=null===(n=e.states)||void 0===n?void 0:n[t];return!!i&&("camera"===t.split(".")[0]&&"unavailable"!==i.state&&"unknown"!==i.state)},b.prototype._scheduleCameraUpdate=function(e,t,n,i){this._lastAppliedEntity===e&&this._lastAppliedLive===t||(this._pendingCameraProps={entity:e,live:t},this._webrtcUpdateTimer&&clearTimeout(this._webrtcUpdateTimer),this._webrtcUpdateTimer=setTimeout((()=>{var e;const t=this._pendingCameraProps;if(!t)return;if(!this._isValidCameraEntity(i,t.entity))return;const o=(this.renderRoot||this.shadowRoot||this).querySelector(`.camera-module-container[data-uc-camera-id="${n.id}"] .camera-image-container`);if(o){const i=Array.from(o.querySelectorAll("hui-image"));for(let e=1;e<i.length;e++)i[e].remove();const a=(null===(e=this._huiImageRef)||void 0===e?void 0:e.value)||i[0];if(a){this._isEditorOpen()&&this._lastAppliedEntity!==t.entity&&(a.cameraView="auto"),a.cameraImage=t.entity;const e=this._isAudioActive(n);a.muted=!e,queueMicrotask((()=>{a.cameraView=t.live?"live":"auto",a.muted=!e,this._ensureAudioState(a,n,e)})),this._lastAppliedEntity=t.entity,this._lastAppliedLive=t.live,this._lastRenderedEntity=t.entity}else this._lastAppliedEntity=t.entity,this._lastAppliedLive=t.live,this.requestUpdate()}}),200))}},5121:(e,t,n)=>{function i(e){if(null==e)return{_error:"Template returned undefined or null"};if("object"==typeof e&&!Array.isArray(e)){const t={};if(void 0!==e.icon&&(t.icon=String(e.icon).trim()),void 0!==e.icon_color&&(t.icon_color=String(e.icon_color).trim()),void 0!==e.container_background_color&&(t.container_background_color=String(e.container_background_color).trim()),void 0!==e.name&&(t.name=String(e.name).trim()),void 0!==e.name_color&&(t.name_color=String(e.name_color).trim()),void 0!==e.state_text&&(t.state_text=String(e.state_text).trim()),void 0!==e.state_color&&(t.state_color=String(e.state_color).trim()),void 0!==e.content&&(t.content=String(e.content).trim()),void 0!==e.color&&(t.color=String(e.color).trim()),void 0!==e.value&&(t.value=e.value),void 0!==e.label&&(t.label=String(e.label).trim()),void 0!==e.gauge_color&&(t.gauge_color=String(e.gauge_color).trim()),void 0!==e.colors&&Array.isArray(e.colors)&&(t.colors=e.colors.map((e=>String(e).trim()))),void 0!==e.global_color&&(t.global_color=String(e.global_color).trim()),void 0!==e.fill_area&&(t.fill_area=Boolean(e.fill_area)),void 0!==e.pie_fill){const n="number"==typeof e.pie_fill?e.pie_fill:parseFloat(String(e.pie_fill));isNaN(n)||(t.pie_fill=n)}return void 0!==e.button_background_color&&(t.button_background_color=String(e.button_background_color).trim()),void 0!==e.button_text_color&&(t.button_text_color=String(e.button_text_color).trim()),void 0!==e.value_color&&(t.value_color=String(e.value_color).trim()),void 0!==e.entity&&(t.entity=String(e.entity).trim()),void 0!==e.visible&&(t.visible=Boolean(e.visible)),void 0!==e.overlay_text&&(t.overlay_text=String(e.overlay_text).trim()),void 0!==e.overlay_color&&(t.overlay_color=String(e.overlay_color).trim()),t}const t=String(e).trim();if(""===t)return{_error:"Template returned empty string"};if(t.startsWith("{")&&t.endsWith("}")||t.startsWith("[")&&t.endsWith("]"))try{const e=JSON.parse(t);if("object"!=typeof e||Array.isArray(e))return{_error:"Template must return an object, not an array"};const n={};if(void 0!==e.icon&&(n.icon=String(e.icon).trim()),void 0!==e.icon_color&&(n.icon_color=String(e.icon_color).trim()),void 0!==e.container_background_color&&(n.container_background_color=String(e.container_background_color).trim()),void 0!==e.name&&(n.name=String(e.name).trim()),void 0!==e.name_color&&(n.name_color=String(e.name_color).trim()),void 0!==e.state_text&&(n.state_text=String(e.state_text).trim()),void 0!==e.state_color&&(n.state_color=String(e.state_color).trim()),void 0!==e.content&&(n.content=String(e.content).trim()),void 0!==e.color&&(n.color=String(e.color).trim()),void 0!==e.value&&(n.value=e.value),void 0!==e.label&&(n.label=String(e.label).trim()),void 0!==e.gauge_color&&(n.gauge_color=String(e.gauge_color).trim()),void 0!==e.colors&&Array.isArray(e.colors)&&(n.colors=e.colors.map((e=>String(e).trim()))),void 0!==e.global_color&&(n.global_color=String(e.global_color).trim()),void 0!==e.fill_area&&(n.fill_area=Boolean(e.fill_area)),void 0!==e.pie_fill){const t="number"==typeof e.pie_fill?e.pie_fill:parseFloat(String(e.pie_fill));isNaN(t)||(n.pie_fill=t)}return void 0!==e.button_background_color&&(n.button_background_color=String(e.button_background_color).trim()),void 0!==e.button_text_color&&(n.button_text_color=String(e.button_text_color).trim()),void 0!==e.value_color&&(n.value_color=String(e.value_color).trim()),void 0!==e.entity&&(n.entity=String(e.entity).trim()),void 0!==e.visible&&(n.visible=Boolean(e.visible)),void 0!==e.overlay_text&&(n.overlay_text=String(e.overlay_text).trim()),void 0!==e.overlay_color&&(n.overlay_color=String(e.overlay_color).trim()),n}catch(e){return{_error:`Invalid JSON: ${e instanceof Error?e.message:"Unknown error"}`}}return{icon:t,_isString:!0}}function o(e){return void 0!==e._error}n.d(t,{HD:()=>o,cv:()=>i})},9327:(e,t,n)=>{function i(e,t,n){var i;const o=null===(i=null==t?void 0:t.states)||void 0===i?void 0:i[e];if(!o)return{entity:e,state:"unavailable",name:(null==n?void 0:n.name)||e,attributes:{},unit:"",domain:e.split(".")[0]||"unknown",device_class:"",friendly_name:(null==n?void 0:n.name)||e,config:n||{}};const a=e.split(".")[0],r=o.attributes||{};return{entity:e,state:o.state,name:(null==n?void 0:n.name)||r.friendly_name||e,attributes:r,unit:r.unit_of_measurement||"",domain:a,device_class:r.device_class||"",friendly_name:r.friendly_name||"",config:n||{},state_number:parseFloat(o.state),state_boolean:"on"===o.state||"true"===o.state||"yes"===o.state}}function o(e,t,n){const o=e.map(((e,o)=>{const a=null==n?void 0:n[o];return i(e,t,a)})),a=o[0]||{entity:"",state:"unavailable",name:"",attributes:{},unit:"",domain:"unknown",device_class:"",friendly_name:"",config:{}};return Object.assign(Object.assign({},a),{entities:o})}n.d(t,{pL:()=>i,wI:()=>o})}}]);