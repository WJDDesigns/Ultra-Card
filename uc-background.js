"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[6471],{6868:(e,r,a)=>{a.r(r),a.d(r,{UltraBackgroundModule:()=>c});var o=a(5183),t=a(7475),i=a(8938),n=a(6990),d=a(8465);class c extends t.m{constructor(){super(...arguments),this.metadata={type:"background",title:"Background",description:"Add custom background images to your dashboard view",author:"WJD Designs",version:"1.0.0",icon:"mdi:image-outline",category:"media",tags:["background","image","view"]}}createDefault(e){return{id:e||this.generateId("background"),type:"background",background_type:"none",background_image:"",background_image_entity:"",background_size:"cover",background_position:"center",background_repeat:"no-repeat",opacity:100,display_mode:"always",display_conditions:[]}}renderGeneralTab(e,r,a,t){var i;const n=e;return null===(i=null==r?void 0:r.locale)||void 0===i||i.language,o.qy`
      ${d.Q.injectCleanFormStyles()}
      <div class="module-general-settings">
        <!-- Module Info Banner -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <ha-icon
              icon="mdi:image-outline"
              style="color: var(--primary-color); --mdi-icon-size: 32px;"
            ></ha-icon>
            <div>
              <div style="font-size: 18px; font-weight: 700;">View Background</div>
              <div style="font-size: 12px; color: var(--secondary-text-color);">
                Apply custom background images to your dashboard view
              </div>
            </div>
          </div>

          <div
            style="padding: 12px; background: rgba(var(--rgb-info-color), 0.1); border-radius: 6px; border-left: 4px solid var(--info-color);"
          >
            <div style="font-size: 13px; line-height: 1.5;">
              <strong>Note:</strong> This module controls the background for the current view only.
              Add additional background modules per view if you need different artwork. Only the
              topmost enabled module with passing logic conditions will be applied.
            </div>
          </div>
        </div>

        <!-- Background Source -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            BACKGROUND SOURCE
          </div>

          <!-- Background Type -->
          ${this.renderFieldSection("Background Type","Choose how you want to specify the background image.",r,{background_type:n.background_type||"none"},[this.selectField("background_type",[{value:"none",label:"None"},{value:"upload",label:"Upload Image"},{value:"entity",label:"Entity Image"},{value:"url",label:"Image URL"}])],(e=>{const r=e.detail.value.background_type;r!==(n.background_type||"none")&&(t({background_type:r}),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}))}

          <!-- URL Image Source -->
          ${"url"===n.background_type?this.renderConditionalFieldsGroup("Image URL Configuration",o.qy`
                  ${d.Q.renderField("Image URL","Enter the direct URL to the background image.",r,{background_image:n.background_image||""},[d.Q.createSchemaItem("background_image",{text:{}})],(e=>t({background_image:e.detail.value.background_image})))}
                `):""}

          <!-- Upload Image Source -->
          ${"upload"===n.background_type?this.renderConditionalFieldsGroup("Upload Image Configuration",o.qy`
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    Upload Image
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    Click to upload a background image file from your device.
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                    @change=${e=>this.handleFileUpload(e,t,r)}
                  />
                  ${n.background_image?o.qy`
                        <div style="margin-top: 8px; font-size: 12px; color: var(--success-color);">
                          ✓ Image uploaded
                        </div>
                      `:""}
                `):""}

          <!-- Entity Image Source -->
          ${"entity"===n.background_type?this.renderConditionalFieldsGroup("Entity Image Configuration",o.qy`
                  ${d.Q.renderField("Entity","Select an entity that has an image (e.g., person, camera entities).",r,{background_image_entity:n.background_image_entity||""},[d.Q.createSchemaItem("background_image_entity",{entity:{}})],(e=>{const r=e.detail.value.background_image_entity;r!==(n.background_image_entity||"")&&t({background_image_entity:r})}))}
                `):""}
        </div>

        <!-- Background Settings -->
        ${"none"!==n.background_type?o.qy`
              <div
                class="settings-section"
                style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
              >
                <div
                  class="section-title"
                  style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
                >
                  BACKGROUND SETTINGS
                </div>

                <!-- Background Size -->
                ${this.renderFieldSection("Background Size","Control how the background image is sized within the view.",r,{background_size:n.background_size||"cover"},[this.selectField("background_size",[{value:"cover",label:"Cover (Fill entire area)"},{value:"contain",label:"Contain (Fit within area)"},{value:"fill",label:"Fill (Stretch to fit)"},{value:"auto",label:"Auto (Original size)"}])],(e=>{const r=e.detail.value.background_size;r!==(n.background_size||"cover")&&t({background_size:r})}))}

                <!-- Background Position -->
                ${d.Q.renderField("Background Position","Set the position of the background image (e.g., center, top left, bottom right).",r,{background_position:n.background_position||"center"},[d.Q.createSchemaItem("background_position",{text:{}})],(e=>t({background_position:e.detail.value.background_position})))}

                <!-- Background Repeat -->
                ${this.renderFieldSection("Background Repeat","Control how the background image repeats.",r,{background_repeat:n.background_repeat||"no-repeat"},[this.selectField("background_repeat",[{value:"no-repeat",label:"No Repeat"},{value:"repeat",label:"Repeat"},{value:"repeat-x",label:"Repeat Horizontally"},{value:"repeat-y",label:"Repeat Vertically"}])],(e=>{const r=e.detail.value.background_repeat;r!==(n.background_repeat||"no-repeat")&&t({background_repeat:r})}))}

                <!-- Opacity Slider -->
                <div class="field-container" style="margin-bottom: 24px;">
                  <div class="field-title">Opacity</div>
                  <div class="field-description">
                    Control the opacity of the background image (0-100%).
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
                  </style>
                  <div class="number-range-control">
                    <input
                      type="range"
                      class="range-slider"
                      min="0"
                      max="100"
                      step="1"
                      .value="${void 0!==n.opacity?n.opacity.toString():"100"}"
                      @input=${e=>{const r=e.target,a=parseInt(r.value);t({opacity:a})}}
                    />
                    <input
                      type="number"
                      class="range-input"
                      min="0"
                      max="100"
                      step="1"
                      .value="${void 0!==n.opacity?n.opacity.toString():"100"}"
                      @input=${e=>{const r=e.target,a=parseInt(r.value);isNaN(a)||t({opacity:Math.max(0,Math.min(100,a))})}}
                    />
                    <button
                      class="range-reset-btn"
                      @click=${()=>t({opacity:100})}
                      title="Reset to default (100)"
                    >
                      <ha-icon icon="mdi:refresh"></ha-icon>
                    </button>
                  </div>
                </div>
              </div>
            `:""}

      </div>
    `}renderLogicTab(e,r,a,o){return i.X.render(e,r,o)}renderPreview(e,r,a,t){const i=e,n=(()=>{if("live"===t||"ha-preview"===t)return!1;try{return"1"===new URLSearchParams(window.location.search).get("edit")}catch(e){return!1}})();if("live"===t||"ha-preview"===t||n){const e="none"!==i.background_type?("upload"===i.background_type?"Uploaded Image":"entity"===i.background_type?"Entity Image":"url"===i.background_type?"URL Image":"No Background")+" • Per View":"No Background";return o.qy`
        <div
          style="padding: 16px; text-align: center; color: var(--secondary-text-color); font-style: italic; background: rgba(var(--rgb-primary-color), 0.05); border-radius: 8px; border: 2px dashed var(--divider-color);"
        >
          <ha-icon
            icon="mdi:image-outline"
            style="--mdi-icon-size: 48px; color: var(--primary-color); margin-bottom: 8px;"
          ></ha-icon>
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
            View Background
          </div>
          <div style="font-size: 12px;">
            ${e}
          </div>
          <div style="font-size: 11px; margin-top: 8px; opacity: 0.7;">
            Background is applied to the current view. Check your dashboard to see it in action.
          </div>
        </div>
      `}return o.qy``}validate(e){const r=e,a=[];return"upload"!==r.background_type&&"url"!==r.background_type||r.background_image&&""!==r.background_image.trim()||a.push("Background image is required for upload/url type"),"entity"===r.background_type&&(r.background_image_entity&&""!==r.background_image_entity.trim()||a.push("Entity is required for entity type")),void 0!==r.opacity&&(r.opacity<0||r.opacity>100)&&a.push("Opacity must be between 0 and 100"),{valid:0===a.length,errors:a}}async handleFileUpload(e,r,a){var o;const t=null===(o=e.target.files)||void 0===o?void 0:o[0];if(t)try{r({background_image:await(0,n.uploadImage)(a,t)})}catch(e){console.error("Failed to upload background image:",e),alert("Failed to upload image. Please try again.")}}getStyles(){return""}}}}]);