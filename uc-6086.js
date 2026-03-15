"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[6086],{6086:(e,t,i)=>{i.r(t),i.d(t,{UltraPopupModule:()=>k});var o=i(5183),r=i(6001),n=i(7475),a=i(5255),l=i(230),s=i(378),d=i(6478),p=i(1001),g=i(6990),u=i(6461);const c="__ultraPopupStore__",{portals:_,states:m,timers:v,logicStates:h,manuallyOpened:y,timerEnabled:b,needsRefresh:f}=(()=>{const e=window;return e[c]||(e[c]={portals:new Map,states:new Map,timers:new Map,logicStates:new Map,manuallyOpened:new Set,timerEnabled:new Map,needsRefresh:new Map}),e[c]})(),x=()=>{document.querySelectorAll("[data-ultra-popup-original-z-index]").forEach((e=>{const t=e,i=t.dataset.ultraPopupOriginalZIndex||"";t.style.zIndex=i||"",t.style.pointerEvents="",delete t.dataset.ultraPopupOriginalZIndex}))};class k extends n.m{constructor(){super(...arguments),this.metadata={type:"popup",title:"Popup",description:"Modal popup container with customizable trigger and content",author:"WJD Designs",version:"1.0.0",icon:"mdi:window-maximize",category:"layout",tags:["layout","popup","modal","overlay","container"]}}createDefault(e,t){return{id:e||this.generateId("popup"),type:"popup",modules:[],show_title:!1,title_mode:"custom",title_text:"Popup Title",title_entity:"",show_entity_name:!1,trigger_type:"button",trigger_module_id:"",trigger_button_text:"Open Popup",trigger_button_icon:"",trigger_image_type:"url",trigger_image_url:"",trigger_image_entity:"",trigger_icon:"mdi:information",trigger_alignment:"center",trigger_button_full_width:!1,trigger_image_full_width:!1,trigger_icon_size:24,trigger_icon_color:"",layout:"default",animation:"fade",popup_width:"600px",popup_padding:"5%",popup_border_radius:"8px",close_button_position:"inside",close_button_color:"#ffffff",close_button_size:32,close_button_icon:"mdi:close",close_button_offset_x:"0px",close_button_offset_y:"0px",auto_close_timer_enabled:!1,auto_close_timer_seconds:30,title_background_color:"var(--primary-color)",title_text_color:"#ffffff",popup_background_color:"var(--card-background-color)",popup_text_color:"var(--primary-text-color)",show_overlay:!0,overlay_background:"rgba(0,0,0,0.85)",trigger_mode:"manual",trigger_conditions:[],auto_close:!0,default_open:!1,display_mode:"always",display_conditions:[]}}renderDesignTab(e,t,i,r){var n;const a=e,l=(null===(n=null==t?void 0:t.locale)||void 0===n?void 0:n.language)||"en";return o.qy`
      ${this.injectUcFormStyles()}
      <style>
        .design-subsection {
          background: rgba(var(--rgb-primary-color), 0.05);
          border-left: 3px solid var(--primary-color);
          padding: 16px;
          margin-bottom: 24px;
          border-radius: 0 8px 8px 0;
        }
        .subsection-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      </style>

      <div class="module-design-settings">
        <!-- Trigger Styling Section -->
        ${"button"===a.trigger_type?o.qy`
              <div class="design-subsection">
                <div class="subsection-title">
                  ${(0,d.kg)("editor.popup.design.trigger_button",l,"Trigger Button Styling")}
                </div>
                <div
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
                >
                  ${(0,d.kg)("editor.popup.design.trigger_button_desc",l,"Customize the appearance of the trigger button.")}
                </div>

                <!-- Button styling would go here - using global design tab for now -->
                <div style="color: var(--secondary-text-color); font-style: italic; padding: 12px;">
                  Use the General Design tab below for button styling options.
                </div>
              </div>
            `:""}

        <!-- Title Styling Section -->
        ${a.show_title?o.qy`
              <div class="design-subsection">
                <div class="subsection-title">
                  ${(0,d.kg)("editor.popup.design.title",l,"Title Styling")}
                </div>
                <div
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
                >
                  ${(0,d.kg)("editor.popup.design.title_desc",l,"Customize the appearance of the popup title bar.")}
                </div>

                <!-- Title Background Color -->
                <div style="margin-bottom: 16px;">
                  <ultra-color-picker
                    .label=${(0,d.kg)("editor.popup.design.title_bg",l,"Title Background")}
                    .value=${a.title_background_color||""}
                    .defaultValue=${"var(--primary-color)"}
                    .hass=${t}
                    @value-changed=${e=>{const t=e.detail.value;r({title_background_color:t})}}
                  ></ultra-color-picker>
                </div>

                <!-- Title Text Color -->
                <div style="margin-bottom: 16px;">
                  <ultra-color-picker
                    .label=${(0,d.kg)("editor.popup.design.title_text",l,"Title Text")}
                    .value=${a.title_text_color||""}
                    .defaultValue=${"#ffffff"}
                    .hass=${t}
                    @value-changed=${e=>{const t=e.detail.value;r({title_text_color:t})}}
                  ></ultra-color-picker>
                </div>
              </div>
            `:""}

        <!-- Popup Content Styling Section -->
        <div class="design-subsection">
          <div class="subsection-title">
            ${(0,d.kg)("editor.popup.design.content",l,"Popup Content Styling")}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,d.kg)("editor.popup.design.content_desc",l,"Customize the appearance of the popup content area.")}
          </div>

          <!-- Popup Background Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,d.kg)("editor.popup.design.popup_bg",l,"Popup Background")}
              .value=${a.popup_background_color||""}
              .defaultValue=${"var(--card-background-color)"}
              .hass=${t}
              @value-changed=${e=>{const t=e.detail.value;r({popup_background_color:t})}}
            ></ultra-color-picker>
          </div>

          <!-- Popup Text Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,d.kg)("editor.popup.design.popup_text",l,"Popup Text")}
              .value=${a.popup_text_color||""}
              .defaultValue=${"var(--primary-text-color)"}
              .hass=${t}
              @value-changed=${e=>{const t=e.detail.value;r({popup_text_color:t})}}
            ></ultra-color-picker>
          </div>
        </div>

        <!-- Overlay Styling Section (only shown when overlay is enabled) -->
        ${!1!==a.show_overlay?o.qy`
              <div class="design-subsection">
                <div class="subsection-title">
                  ${(0,d.kg)("editor.popup.design.overlay",l,"Background Overlay")}
                </div>
                <div
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
                >
                  ${(0,d.kg)("editor.popup.design.overlay_desc",l,"Customize the backdrop behind the popup.")}
                </div>

                <!-- Overlay Background Color -->
                <div style="margin-bottom: 16px;">
                  <ultra-color-picker
                    .label=${(0,d.kg)("editor.popup.design.overlay_bg",l,"Background Overlay")}
                    .value=${a.overlay_background||""}
                    .defaultValue=${"rgba(0,0,0,0.85)"}
                    .hass=${t}
                    @value-changed=${e=>{const t=e.detail.value;r({overlay_background:t})}}
                  ></ultra-color-picker>
                </div>
              </div>
            `:""}

        <!-- Close Button Styling Section -->
        ${"none"!==a.close_button_position?o.qy`
              <div class="design-subsection">
                <div class="subsection-title">
                  ${(0,d.kg)("editor.popup.design.close_button",l,"Close Button Styling")}
                </div>
                <div
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
                >
                  ${(0,d.kg)("editor.popup.design.close_button_desc",l,"Customize the appearance of the close button.")}
                </div>

                <!-- Close Button Color -->
                <div style="margin-bottom: 16px;">
                  <ultra-color-picker
                    .label=${(0,d.kg)("editor.popup.design.close_button_color",l,"Close Button")}
                    .value=${a.close_button_color||""}
                    .defaultValue=${"#ffffff"}
                    .hass=${t}
                    @value-changed=${e=>{const t=e.detail.value;r({close_button_color:t})}}
                  ></ultra-color-picker>
                </div>

                <!-- Close Button Size -->
                ${this.renderSliderField((0,d.kg)("editor.popup.design.close_button_size",l,"Close Button Size"),(0,d.kg)("editor.popup.design.close_button_size_desc",l,"Size of the close button icon (in pixels)."),a.close_button_size||32,32,16,64,1,(e=>r({close_button_size:e})))}

                <!-- Close Button Icon -->
                ${this.renderFieldSection((0,d.kg)("editor.popup.design.close_button_icon",l,"Close Button Icon"),(0,d.kg)("editor.popup.design.close_button_icon_desc",l,"Icon to display on the close button."),t,{close_button_icon:a.close_button_icon||"mdi:close"},[this.iconField("close_button_icon")],(e=>{r({close_button_icon:e.detail.value.close_button_icon}),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}))}

                <!-- Close Button Offset X -->
                ${this.renderFieldSection((0,d.kg)("editor.popup.design.close_button_offset_x",l,"Horizontal Offset"),(0,d.kg)("editor.popup.design.close_button_offset_x_desc",l,"Horizontal position adjustment (e.g., 10px, 1rem)."),t,{close_button_offset_x:a.close_button_offset_x||"0px"},[this.textField("close_button_offset_x")],(e=>{r({close_button_offset_x:e.detail.value.close_button_offset_x})}))}

                <!-- Close Button Offset Y -->
                ${this.renderFieldSection((0,d.kg)("editor.popup.design.close_button_offset_y",l,"Vertical Offset"),(0,d.kg)("editor.popup.design.close_button_offset_y_desc",l,"Vertical position adjustment (e.g., 10px, 1rem)."),t,{close_button_offset_y:a.close_button_offset_y||"0px"},[this.textField("close_button_offset_y")],(e=>{r({close_button_offset_y:e.detail.value.close_button_offset_y})}))}
              </div>
            `:""}

        <!-- Standard Design Tab Content (from GlobalDesignTab) -->
        <div style="margin-top: 24px;">
          <div
            style="font-size: 14px; font-weight: 600; color: var(--secondary-text-color); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;"
          >
            ${(0,d.kg)("editor.popup.design.general_title",l,"General Trigger Design")}
          </div>
          ${super.renderDesignTab(e,t,i,r)}
        </div>
      </div>
    `}renderGeneralTab(e,t,r,n){var a;const l=e,s=(null===(a=null==t?void 0:t.locale)||void 0===a?void 0:a.language)||"en",p=this._isOpenedViaNavigation(l.id,r);return o.qy`
      ${this.injectUcFormStyles()}

      <div class="module-general-settings">
        <!-- Trigger Configuration Section -->
        ${p?o.qy`
              <div
                class="settings-section"
                style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
              >
                <div
                  class="section-title"
                  style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
                >
                  ${(0,d.kg)("editor.popup.trigger.section_title",s,"Trigger Configuration")}
                </div>
                <div
                  style="display: flex; align-items: center; gap: 12px; background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.1); border: 1px solid rgba(var(--rgb-primary-color, 33, 150, 243), 0.3); border-radius: 8px; padding: 16px; margin-top: 8px;"
                >
                  <ha-icon
                    icon="mdi:navigation-variant"
                    style="color: var(--primary-color); flex-shrink: 0; --mdc-icon-size: 24px;"
                  ></ha-icon>
                  <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 14px; color: var(--primary-text-color); margin-bottom: 4px;">
                      Opened via Navigation
                    </div>
                    <div style="font-size: 13px; color: var(--secondary-text-color); line-height: 1.4;">
                      This popup is configured to open from <strong>${p}</strong>. The trigger
                      type is managed by the navigation module and cannot be changed here.
                    </div>
                  </div>
                </div>
              </div>
            `:this.renderSettingsSection((0,d.kg)("editor.popup.trigger.section_title",s,"Trigger Configuration"),(0,d.kg)("editor.popup.trigger.section_desc",s,"Configure how the popup is triggered to open."),[{title:(0,d.kg)("editor.popup.trigger.type",s,"Trigger Type"),description:(0,d.kg)("editor.popup.trigger.type_desc",s,"Choose how the popup will be opened."),hass:t,data:{trigger_type:l.trigger_type||"button"},schema:[this.selectField("trigger_type",[{value:"button",label:(0,d.kg)("editor.popup.trigger.button",s,"Button")},{value:"image",label:(0,d.kg)("editor.popup.trigger.image",s,"Image")},{value:"icon",label:(0,d.kg)("editor.popup.trigger.icon",s,"Icon")},{value:"module",label:(0,d.kg)("editor.popup.trigger.module",s,"Module")},{value:"page_load",label:(0,d.kg)("editor.popup.trigger.page_load",s,"Page Load")},{value:"logic",label:(0,d.kg)("editor.popup.trigger.logic",s,"Logic Conditions")}])],onChange:e=>{e.detail.value.trigger_type!==(l.trigger_type||"button")&&(n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}}])}

        <!-- Trigger sub-options: hidden when opened via navigation -->
        ${p?"":o.qy`
              <!-- Conditional: Button Trigger -->
              ${"button"===l.trigger_type?o.qy`
                    <div style="margin-top: -16px; margin-bottom: 32px;">
                      ${this.renderConditionalFieldsGroup((0,d.kg)("editor.popup.trigger.button",s,"Button"),o.qy`
                          ${this.renderFieldSection((0,d.kg)("editor.popup.trigger.button_text",s,"Button Text"),(0,d.kg)("editor.popup.trigger.button_text_desc",s,"Text to display on the trigger button."),t,{trigger_button_text:l.trigger_button_text||""},[this.textField("trigger_button_text")],(e=>{n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}))}
                          ${this.renderFieldSection((0,d.kg)("editor.popup.trigger.button_icon",s,"Button Icon"),(0,d.kg)("editor.popup.trigger.button_icon_desc",s,"Icon to display on the trigger button."),t,{trigger_button_icon:l.trigger_button_icon||""},[this.iconField("trigger_button_icon")],(e=>{n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}))}
                          ${this.renderSettingsSection("","",[{title:(0,d.kg)("editor.popup.trigger.button_full_width",s,"Full Width"),description:(0,d.kg)("editor.popup.trigger.button_full_width_desc",s,"Make the button span the full width of the container."),hass:t,data:{trigger_button_full_width:l.trigger_button_full_width||!1},schema:[this.booleanField("trigger_button_full_width")],onChange:e=>{n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}}])}
                        `)}
                    </div>
                  `:""}

              <!-- Conditional: Image Trigger -->
              ${"image"===l.trigger_type?o.qy`
                    <div style="margin-top: -16px; margin-bottom: 32px;">
                      ${this.renderConditionalFieldsGroup((0,d.kg)("editor.popup.trigger.image",s,"Image"),o.qy`
                          ${this.renderSettingsSection("","",[{title:(0,d.kg)("editor.popup.trigger.image_type",s,"Image Type"),description:(0,d.kg)("editor.popup.trigger.image_type_desc",s,"Choose how to provide the image for the trigger."),hass:t,data:{trigger_image_type:l.trigger_image_type||"url"},schema:[this.selectField("trigger_image_type",[{value:"upload",label:(0,d.kg)("editor.design.bg_upload",s,"Upload Image")},{value:"entity",label:(0,d.kg)("editor.design.bg_entity",s,"Entity Image")},{value:"url",label:(0,d.kg)("editor.design.bg_url",s,"Image URL")}])],onChange:e=>{e.detail.value.trigger_image_type!==(l.trigger_image_type||"url")&&(n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}}])}
                          ${"upload"===l.trigger_image_type?o.qy`
                                <div style="margin-bottom: 16px;">
                                  <div
                                    style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: var(--primary-text-color);"
                                  >
                                    ${(0,d.kg)("editor.design.upload_bg_image",s,"Upload Image")}
                                  </div>
                                  <div class="upload-container">
                                    <div
                                      class="file-upload-row"
                                      style="display: flex; align-items: center; gap: 12px;"
                                    >
                                      <label
                                        class="file-upload-button"
                                        style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--primary-color); color: white; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;"
                                      >
                                        <ha-icon
                                          icon="mdi:upload"
                                          style="--mdc-icon-size: 20px;"
                                        ></ha-icon>
                                        <span
                                          >${(0,d.kg)("editor.design.choose_file",s,"Choose File")}</span
                                        >
                                        <input
                                          type="file"
                                          accept="image/*"
                                          @change=${async e=>{var o;const r=null===(o=e.target.files)||void 0===o?void 0:o[0];if(r&&t)try{const{uploadImage:e}=await Promise.resolve().then(i.bind(i,6990)),o=await e(t,r);n({trigger_image_url:o,trigger_image_type:"upload"}),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}catch(e){console.error("Image upload failed:",e),alert(`Upload failed: ${e instanceof Error?e.message:"Unknown error"}`)}}}
                                          style="display: none"
                                        />
                                      </label>
                                      <div
                                        style="flex: 1; color: var(--secondary-text-color); font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                                      >
                                        ${l.trigger_image_url&&l.trigger_image_url.startsWith("/api/image/serve/")?l.trigger_image_url.split("/").pop()||"Uploaded image":l.trigger_image_url?"Image selected":"No file chosen"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              `:""}
                          ${"entity"===l.trigger_image_type?o.qy`
                                ${this.renderFieldSection((0,d.kg)("editor.design.bg_image_entity",s,"Image Entity"),(0,d.kg)("editor.design.bg_image_entity_desc",s,"Select an entity that has an image attribute."),t,{trigger_image_entity:l.trigger_image_entity||""},[this.entityField("trigger_image_entity")],(e=>{n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}))}
                              `:""}
                          ${"url"===l.trigger_image_type?o.qy`
                                ${this.renderFieldSection((0,d.kg)("editor.popup.trigger.image_url",s,"Image URL"),(0,d.kg)("editor.popup.trigger.image_url_desc",s,"URL of the image to use as the trigger."),t,{trigger_image_url:l.trigger_image_url||""},[this.textField("trigger_image_url")],(e=>{n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}))}
                              `:""}
                          ${this.renderSettingsSection("","",[{title:(0,d.kg)("editor.popup.trigger.image_full_width",s,"Full Width"),description:(0,d.kg)("editor.popup.trigger.image_full_width_desc",s,"Make the image span the full width of the container."),hass:t,data:{trigger_image_full_width:l.trigger_image_full_width||!1},schema:[this.booleanField("trigger_image_full_width")],onChange:e=>{n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}}])}
                        `)}
                    </div>
                  `:""}

              <!-- Conditional: Icon Trigger -->
              ${"icon"===l.trigger_type?o.qy`
                    <div style="margin-top: -16px; margin-bottom: 32px;">
                      ${this.renderConditionalFieldsGroup((0,d.kg)("editor.popup.trigger.icon",s,"Icon"),o.qy`
                          ${this.renderFieldSection((0,d.kg)("editor.popup.trigger.icon",s,"Trigger Icon"),(0,d.kg)("editor.popup.trigger.icon_desc",s,"Icon to display as the trigger."),t,{trigger_icon:l.trigger_icon||""},[this.iconField("trigger_icon")],(e=>{n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}))}

                          <!-- Trigger Icon Size -->
                          ${this.renderSliderField((0,d.kg)("editor.popup.trigger.icon_size",s,"Trigger Icon Size"),(0,d.kg)("editor.popup.trigger.icon_size_desc",s,"Size of the trigger icon in pixels."),l.trigger_icon_size||24,24,10,100,1,(e=>n({trigger_icon_size:e})))}

                          <!-- Trigger Icon Color -->
                          <div style="margin-bottom: 16px;">
                            <ultra-color-picker
                              .label=${(0,d.kg)("editor.popup.trigger.icon_color",s,"Trigger Icon Color")}
                              .value=${l.trigger_icon_color||""}
                              .defaultValue=${""}
                              .hass=${t}
                              @value-changed=${e=>{const t=e.detail.value;n({trigger_icon_color:t}),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}}
                            ></ultra-color-picker>
                          </div>
                        `)}
                    </div>
                  `:""}

              <!-- Conditional: Module Trigger -->
              ${"module"===l.trigger_type?o.qy`
                    <div style="margin-top: -16px; margin-bottom: 32px;">
                      ${this.renderConditionalFieldsGroup((0,d.kg)("editor.popup.trigger.module_config",s,"Module Trigger"),o.qy`
                          ${this._renderModuleTriggerConfig(l,t,r,n,s)}
                        `)}
                    </div>
                  `:""}

              <!-- Conditional: Logic Trigger -->
              ${"logic"===l.trigger_type?o.qy`
                    <div style="margin-top: -16px; margin-bottom: 32px;">
                      ${this.renderConditionalFieldsGroup((0,d.kg)("editor.popup.trigger.logic_config",s,"Logic Configuration"),o.qy` ${this._renderTriggerLogic(l,t,n)} `)}
                    </div>
                  `:""}

              <!-- Trigger Alignment (shown for button, icon, image triggers) -->
              ${"button"===l.trigger_type||"icon"===l.trigger_type||"image"===l.trigger_type?o.qy`
                    ${this.renderSettingsSection((0,d.kg)("editor.popup.trigger.alignment_section",s,"Trigger Alignment"),(0,d.kg)("editor.popup.trigger.alignment_desc",s,"Choose how the trigger element is aligned."),[{title:(0,d.kg)("editor.popup.trigger.alignment",s,"Alignment"),description:(0,d.kg)("editor.popup.trigger.alignment_help",s,"Align the trigger element to the left, center, or right."),hass:t,data:{trigger_alignment:l.trigger_alignment||"center"},schema:[this.selectField("trigger_alignment",[{value:"left",label:(0,d.kg)("editor.common.left",s,"Left")},{value:"center",label:(0,d.kg)("editor.common.center",s,"Center")},{value:"right",label:(0,d.kg)("editor.common.right",s,"Right")}])],onChange:e=>{e.detail.value.trigger_alignment!==(l.trigger_alignment||"center")&&(n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}}])}
                  `:""}
            `}

        <!-- Title Configuration Section -->
        ${this.renderSettingsSection((0,d.kg)("editor.popup.title.section_title",s,"Title Configuration"),(0,d.kg)("editor.popup.title.section_desc",s,"Configure whether to show a title bar in the popup."),[{title:(0,d.kg)("editor.popup.title.show",s,"Show Title"),description:(0,d.kg)("editor.popup.title.show_desc",s,"Display a title bar at the top of the popup."),hass:t,data:{show_title:l.show_title||!1},schema:[this.booleanField("show_title")],onChange:e=>{n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}}])}

        <!-- Conditional: Title Settings -->
        ${l.show_title?o.qy`
              <div style="margin-top: -16px; margin-bottom: 32px;">
                ${this.renderConditionalFieldsGroup((0,d.kg)("editor.popup.title.configuration",s,"Title Configuration"),o.qy`
                    ${this.renderSettingsSection("","",[{title:(0,d.kg)("editor.popup.title.mode",s,"Title Mode"),description:(0,d.kg)("editor.popup.title.mode_desc",s,"Choose whether to use custom text or entity state as title."),hass:t,data:{title_mode:l.title_mode||"custom"},schema:[this.selectField("title_mode",[{value:"custom",label:(0,d.kg)("editor.common.custom_text",s,"Custom Text")},{value:"entity",label:(0,d.kg)("editor.common.entity_state",s,"Entity State")}])],onChange:e=>{e.detail.value.title_mode!==(l.title_mode||"custom")&&(n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}}])}
                    ${"custom"===l.title_mode?o.qy`
                          ${this.renderFieldSection((0,d.kg)("editor.popup.title.text",s,"Title Text"),(0,d.kg)("editor.popup.title.text_desc",s,"Enter the custom text to display in the popup title."),t,{title_text:l.title_text||""},[this.textField("title_text")],(e=>{n(e.detail.value)}))}
                        `:o.qy`
                          ${this.renderFieldSection((0,d.kg)("editor.popup.title.entity",s,"Title Entity"),(0,d.kg)("editor.popup.title.entity_desc",s,"Select an entity whose state will be used as the title."),t,{title_entity:l.title_entity||""},[this.entityField("title_entity")],(e=>{n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}))}
                          ${this.renderSettingsSection("","",[{title:(0,d.kg)("editor.popup.title.show_entity_name",s,"Show Entity Name"),description:(0,d.kg)("editor.popup.title.show_entity_name_desc",s,"Display the entity friendly name before the state value."),hass:t,data:{show_entity_name:l.show_entity_name||!1},schema:[this.booleanField("show_entity_name")],onChange:e=>{n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}}])}
                        `}
                  `)}
              </div>
            `:""}

        <!-- Layout Settings Section -->
        ${this.renderSettingsSection((0,d.kg)("editor.popup.layout.section_title",s,"Layout Settings"),(0,d.kg)("editor.popup.layout.section_desc",s,"Configure how the popup is displayed on screen."),[{title:(0,d.kg)("editor.popup.layout.type",s,"Layout"),description:(0,d.kg)("editor.popup.layout.type_desc",s,"Choose the layout style for the popup."),hass:t,data:{layout:l.layout||"default"},schema:[this.selectField("layout",[{value:"default",label:(0,d.kg)("editor.popup.layout.default",s,"Default")},{value:"full_screen",label:(0,d.kg)("editor.popup.layout.full_screen",s,"Full Screen")},{value:"left_panel",label:(0,d.kg)("editor.popup.layout.left_panel",s,"Left Panel")},{value:"right_panel",label:(0,d.kg)("editor.popup.layout.right_panel",s,"Right Panel")},{value:"top_panel",label:(0,d.kg)("editor.popup.layout.top_panel",s,"Top Panel")},{value:"bottom_panel",label:(0,d.kg)("editor.popup.layout.bottom_panel",s,"Bottom Panel")}])],onChange:e=>{e.detail.value.layout!==(l.layout||"default")&&(n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}},{title:(0,d.kg)("editor.popup.animation.type",s,"Animation"),description:(0,d.kg)("editor.popup.animation.type_desc",s,"Choose the animation style when the popup opens."),hass:t,data:{animation:l.animation||"fade"},schema:[this.selectField("animation",[{value:"fade",label:(0,d.kg)("editor.popup.animation.fade",s,"Fade")},{value:"scale_up",label:(0,d.kg)("editor.popup.animation.scale_up",s,"Scale Up")},{value:"scale_down",label:(0,d.kg)("editor.popup.animation.scale_down",s,"Scale Down")},{value:"slide_top",label:(0,d.kg)("editor.popup.animation.slide_top",s,"Slide from Top")},{value:"slide_left",label:(0,d.kg)("editor.popup.animation.slide_left",s,"Slide from Left")},{value:"slide_right",label:(0,d.kg)("editor.popup.animation.slide_right",s,"Slide from Right")},{value:"slide_bottom",label:(0,d.kg)("editor.popup.animation.slide_bottom",s,"Slide from Bottom")}])],onChange:e=>{e.detail.value.animation!==(l.animation||"fade")&&(n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}}])}

        <!-- Background Overlay Section -->
        ${this.renderSettingsSection((0,d.kg)("editor.popup.overlay.section_title",s,"Background Overlay"),"",[{title:(0,d.kg)("editor.popup.overlay.show",s,"Show Background Overlay"),description:(0,d.kg)("editor.popup.overlay.show_desc",s,"Display a dimmed overlay behind the popup when open."),hass:t,data:{show_overlay:!1!==l.show_overlay},schema:[this.booleanField("show_overlay")],onChange:e=>{n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}}])}

        <!-- Popup Dimensions Section -->
        ${this.renderFieldSection((0,d.kg)("editor.popup.popup_width",s,"Popup Width"),(0,d.kg)("editor.popup.popup_width_desc",s,"Width of the popup (e.g., 600px, 100%, 14rem, 10vw)."),t,{popup_width:l.popup_width||"600px"},[this.textField("popup_width")],(e=>{n(e.detail.value)}))}
        ${this.renderFieldSection((0,d.kg)("editor.popup.popup_padding",s,"Popup Padding"),(0,d.kg)("editor.popup.popup_padding_desc",s,"Padding inside the popup (e.g., 5%, 20px, 1rem, 2vw)."),t,{popup_padding:l.popup_padding||"5%"},[this.textField("popup_padding")],(e=>{n(e.detail.value)}))}
        ${this.renderFieldSection((0,d.kg)("editor.popup.popup_border_radius",s,"Popup Border Radius"),(0,d.kg)("editor.popup.popup_border_radius_desc",s,"Border radius of the popup (e.g., 5px, 50%, 0.3em, 12px 0)."),t,{popup_border_radius:l.popup_border_radius||"8px"},[this.textField("popup_border_radius")],(e=>{n(e.detail.value)}))}

        <!-- Close Button Configuration Section -->
        ${this.renderSettingsSection((0,d.kg)("editor.popup.close_button.section_title",s,"Close Button"),(0,d.kg)("editor.popup.close_button.section_desc",s,"Configure the close button position and behavior."),[{title:(0,d.kg)("editor.popup.close_button.position",s,"Close Button Position"),description:(0,d.kg)("editor.popup.close_button.position_desc",s,"Choose where the close button appears."),hass:t,data:{close_button_position:l.close_button_position||"inside"},schema:[this.selectField("close_button_position",[{value:"inside",label:(0,d.kg)("editor.popup.close_button.inside",s,"Inside the Popup")},{value:"none",label:(0,d.kg)("editor.popup.close_button.none",s,"None")}])],onChange:e=>{e.detail.value.close_button_position!==(l.close_button_position||"inside")&&(n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}}])}

        <!-- Auto-Close Timer Section -->
        ${this.renderSettingsSection((0,d.kg)("editor.popup.auto_close_timer.section_title",s,"Auto-Close Timer"),(0,d.kg)("editor.popup.auto_close_timer.section_desc",s,"Configure automatic popup closing after a specified time."),[{title:(0,d.kg)("editor.popup.auto_close_timer.enabled",s,"Enable Auto-Close Timer"),description:(0,d.kg)("editor.popup.auto_close_timer.enabled_desc",s,"Automatically close the popup after a specified time."),hass:t,data:{auto_close_timer_enabled:l.auto_close_timer_enabled||!1},schema:[this.booleanField("auto_close_timer_enabled")],onChange:e=>{n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}}])}

        <!-- Conditional: Timer Duration -->
        ${l.auto_close_timer_enabled?o.qy`
              <div style="margin-top: -16px; margin-bottom: 32px;">
                ${this.renderConditionalFieldsGroup((0,d.kg)("editor.popup.auto_close_timer.configuration",s,"Timer Configuration"),o.qy`
                    ${this.renderSliderField((0,d.kg)("editor.popup.auto_close_timer.seconds",s,"Close After (Seconds)"),(0,d.kg)("editor.popup.auto_close_timer.seconds_desc",s,"Number of seconds before the popup automatically closes."),l.auto_close_timer_seconds||30,30,1,300,1,(e=>n({auto_close_timer_seconds:e})),"s")}
                  `)}
              </div>
            `:""}

        <!-- Default State Section (only shown when trigger is manual or button/icon/image) -->
        ${"page_load"!==l.trigger_type&&"logic"!==l.trigger_type?this.renderSettingsSection((0,d.kg)("editor.popup.state.section_title",s,"Default State"),(0,d.kg)("editor.popup.state.section_desc",s,"Configure whether this popup starts open or closed when the card loads."),[{title:(0,d.kg)("editor.popup.state.default_open",s,"Open by Default"),description:(0,d.kg)("editor.popup.state.default_open_desc",s,"When enabled, the popup will be open when the card initially loads."),hass:t,data:{default_open:l.default_open||!1},schema:[this.booleanField("default_open")],onChange:e=>{n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}}]):""}
      </div>
    `}_isOpenedViaNavigation(e,t){var i;if(!(null===(i=null==t?void 0:t.layout)||void 0===i?void 0:i.rows))return null;const o=t=>{var i,o,r,n,a,l;return"open-popup"===(null===(i=t.tap_action)||void 0===i?void 0:i.action)&&(null===(o=t.tap_action)||void 0===o?void 0:o.popup_id)===e||"open-popup"===(null===(r=t.hold_action)||void 0===r?void 0:r.action)&&(null===(n=t.hold_action)||void 0===n?void 0:n.popup_id)===e||"open-popup"===(null===(a=t.double_tap_action)||void 0===a?void 0:a.action)&&(null===(l=t.double_tap_action)||void 0===l?void 0:l.popup_id)===e},r=t=>{var i,n,a,l;if(!t||!Array.isArray(t))return null;for(const s of t){if("navigation"===s.type){const t=s,r=s.module_name||t.name||`Navigation (${t.id.slice(-6)})`;if(t.nav_routes)for(const e of t.nav_routes)if(o(e))return r;if(t.nav_stacks)for(const e of t.nav_stacks)if(e.children)for(const t of e.children)if(o(t))return r;if("open-popup"===(null===(n=null===(i=t.nav_media_player)||void 0===i?void 0:i.inactive_tap_action)||void 0===n?void 0:n.action)&&(null===(l=null===(a=t.nav_media_player)||void 0===a?void 0:a.inactive_tap_action)||void 0===l?void 0:l.popup_id)===e)return r}if(s.columns&&Array.isArray(s.columns))for(const e of s.columns)if(e.modules){const t=r(e.modules);if(t)return t}if(s.modules&&Array.isArray(s.modules)){const e=r(s.modules);if(e)return e}}return null};return r(t.layout.rows)}_getAvailableModulesForTrigger(e,t){const i=[];if(!t||!t.layout||!t.layout.rows)return i;const o=(t,r=0)=>{var n,a,l,s,d,p,g,u;if(t&&Array.isArray(t))for(const c of t)if(c.id!==e&&"popup"!==c.type&&"pagebreak"!==c.type)if(c.columns&&Array.isArray(c.columns))for(const e of c.columns)e.modules&&o(e.modules,r+1);else{if(c.type){const e=c.type.charAt(0).toUpperCase()+c.type.slice(1);let t=null;if(c.module_name&&"string"==typeof c.module_name&&c.module_name.trim()?t=c.module_name.trim():c.name&&"string"==typeof c.name&&c.name.trim()&&(t=c.name.trim()),!t)switch(c.type){case"info":(null===(a=null===(n=c.info_entities)||void 0===n?void 0:n[0])||void 0===a?void 0:a.label)&&c.info_entities[0].label.trim()?t=c.info_entities[0].label.trim():(null===(s=null===(l=c.info_entities)||void 0===l?void 0:l[0])||void 0===s?void 0:s.entity)&&(t=c.info_entities[0].entity.split(".").pop()||null);break;case"icon":(null===(p=null===(d=c.icons)||void 0===d?void 0:d[0])||void 0===p?void 0:p.label)&&c.icons[0].label.trim()?t=c.icons[0].label.trim():(null===(u=null===(g=c.icons)||void 0===g?void 0:g[0])||void 0===u?void 0:u.entity)&&(t=c.icons[0].entity.split(".").pop()||null);break;case"bar":case"button":case"text":case"camera":case"climate":case"light":case"slider":t=c.label&&c.label.trim()||c.title&&c.title.trim()||(c.entity?c.entity.split(".").pop():null);break;case"image":case"graphs":case"horizontal":case"vertical":case"accordion":t=c.title&&c.title.trim()||null;break;default:t=c.title&&c.title.trim()||c.title_text&&c.title_text.trim()||c.trigger_button_text&&c.trigger_button_text.trim()||null}if(!t){const e=c.id.match(/\d{13}/);t=e?`ID: ...${e[0].slice(-6)}`:`ID: ${c.id.slice(-12)}`}const o=`${e}: ${t}`;i.push({value:c.id,label:o})}c.modules&&Array.isArray(c.modules)&&o(c.modules,r+1)}};return o(t.layout.rows),i}_renderModuleTriggerConfig(e,t,i,r,n){const a=this._getAvailableModulesForTrigger(e.id,i),l=e.trigger_module_id||"",s=a.find((e=>e.value===l));return o.qy`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${(0,d.kg)("editor.popup.trigger.module_trigger_title",n,"Module Trigger")}
        </div>
        <div
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
        >
          ${(0,d.kg)("editor.popup.trigger.module_trigger_desc",n,"Select a module in this card that will open the popup when tapped. The selected module will have its tap action overridden to open this popup instead.")}
        </div>

        ${a.length>0?o.qy`
              ${this.renderFieldSection((0,d.kg)("editor.popup.trigger.select_module",n,"Select Module"),(0,d.kg)("editor.popup.trigger.select_module_desc",n,"Choose which module should trigger this popup when clicked."),t,{trigger_module_id:l},[this.selectField("trigger_module_id",[{value:"",label:(0,d.kg)("editor.popup.trigger.no_module",n,"-- Select a Module --")},...a])],(e=>{const t=e.detail.value.trigger_module_id;t!==l&&(r({trigger_module_id:t}),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}))}
              ${s?o.qy`
                    <div
                      style="margin-top: 12px; padding: 12px; background: rgba(var(--rgb-success-color, 76, 175, 80), 0.1); border-left: 3px solid var(--success-color, #4caf50); border-radius: 4px; font-size: 13px; line-height: 1.5;"
                    >
                      <div
                        style="font-weight: 600; margin-bottom: 4px; color: var(--success-color, #4caf50);"
                      >
                        <ha-icon
                          icon="mdi:check-circle"
                          style="--mdc-icon-size: 16px; vertical-align: middle;"
                        ></ha-icon>
                        ${(0,d.kg)("editor.popup.trigger.module_linked",n,"Module Linked")}
                      </div>
                      <div style="color: var(--primary-text-color);">
                        ${(0,d.kg)("editor.popup.trigger.module_linked_desc",n,'Tapping on "${module}" will now open this popup.').replace("${module}",s.label)}
                      </div>
                    </div>
                  `:""}
            `:o.qy`
              <div
                style="padding: 16px; background: rgba(var(--rgb-warning-color, 255, 152, 0), 0.1); border-left: 3px solid var(--warning-color, #ff9800); border-radius: 4px; font-size: 13px; line-height: 1.5;"
              >
                <div
                  style="font-weight: 600; margin-bottom: 4px; color: var(--warning-color, #ff9800);"
                >
                  <ha-icon
                    icon="mdi:alert"
                    style="--mdc-icon-size: 16px; vertical-align: middle;"
                  ></ha-icon>
                  ${(0,d.kg)("editor.popup.trigger.no_modules_available",n,"No Modules Available")}
                </div>
                <div style="color: var(--primary-text-color);">
                  ${(0,d.kg)("editor.popup.trigger.no_modules_available_desc",n,"Add other modules to this card first, then you can select one to trigger this popup.")}
                </div>
              </div>
            `}
      </div>
    `}_renderTriggerLogic(e,t,i){var n;const a=e.trigger_conditions||[],l=e.trigger_mode||"manual",s=(null===(n=null==t?void 0:t.locale)||void 0===n?void 0:n.language)||"en";return o.qy`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${(0,d.kg)("editor.popup.trigger_logic.section_title",s,"Trigger Logic")}
        </div>
        <div
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
        >
          ${(0,d.kg)("editor.popup.trigger_logic.section_desc",s,"Control when this popup automatically opens based on conditions.")}
        </div>
        <div
          style="margin-bottom: 16px; padding: 12px; background: rgba(var(--rgb-info-color, 3, 169, 244), 0.1); border-left: 3px solid var(--info-color, #03a9f4); border-radius: 4px; font-size: 13px; line-height: 1.5;"
        >
          <div style="font-weight: 600; margin-bottom: 4px; color: var(--info-color, #03a9f4);">
            <ha-icon
              icon="mdi:information"
              style="--mdc-icon-size: 16px; vertical-align: middle;"
            ></ha-icon>
            ${(0,d.kg)("editor.popup.trigger_logic.note_title",s,"Important Note")}
          </div>
          <div style="color: var(--primary-text-color);">
            ${(0,r._)((0,d.kg)("editor.popup.trigger_logic.note_message",s,"These trigger conditions control <strong>when the popup opens</strong>. This is different from the Logic tab, which controls <strong>whether this module is visible</strong> on the card."))}
          </div>
        </div>

        <!-- Trigger Mode Selection -->
        ${this.renderFieldSection((0,d.kg)("editor.popup.trigger_logic.mode_title",s,"Popup State Control"),(0,d.kg)("editor.popup.trigger_logic.mode_desc",s,"Choose how the popup state is controlled."),t,{trigger_mode:l},[this.selectField("trigger_mode",[{value:"manual",label:(0,d.kg)("editor.popup.trigger_logic.mode_manual",s,"Manual")},{value:"every",label:(0,d.kg)("editor.popup.trigger_logic.mode_every",s,"Open if EVERY condition is met")},{value:"any",label:(0,d.kg)("editor.popup.trigger_logic.mode_any",s,"Open if ANY condition is met")}])],(e=>{i({trigger_mode:e.detail.value.trigger_mode}),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}))}

        <!-- Auto Close Toggle (for logic triggers) -->
        ${"manual"!==l?this.renderSettingsSection("","",[{title:(0,d.kg)("editor.popup.trigger_logic.auto_close",s,"Auto Close"),description:(0,d.kg)("editor.popup.trigger_logic.auto_close_desc",s,"Automatically close popup when conditions become false."),hass:t,data:{auto_close:!1!==e.auto_close},schema:[this.booleanField("auto_close")],onChange:e=>{i(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}}]):""}

        <!-- Conditions List -->
        ${"manual"!==l?o.qy`
              <div style="margin-top: 24px;">
                <div
                  style="display:flex; align-items:center; justify-content: space-between; margin-bottom: 12px;"
                >
                  <div style="font-size: 16px; font-weight: 600;">
                    ${(0,d.kg)("editor.popup.trigger_logic.conditions",s,"Conditions")}
                  </div>
                  <button
                    @click=${()=>{const e={id:`cond_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,type:"entity_state",ui_expanded:!0,entity:"",operator:"=",value:""},t=[...a,e];i({trigger_conditions:t})}}
                    style="display:flex; align-items:center; gap:8px; padding:6px 10px; border:1px dashed var(--primary-color); background:none; color:var(--primary-color); border-radius:6px; cursor:pointer;"
                  >
                    <ha-icon icon="mdi:plus"></ha-icon>
                    ${(0,d.kg)("editor.popup.trigger_logic.add_condition",s,"Add Condition")}
                  </button>
                </div>

                <div style="display:flex; flex-direction: column; gap: 12px;">
                  ${0===a.length?o.qy`
                        <div
                          style="padding: 20px; background: rgba(var(--rgb-warning-color, 255, 152, 0), 0.1); border: 1px dashed var(--warning-color, #ff9800); border-radius: 8px;"
                        >
                          <div
                            style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;"
                          >
                            <ha-icon
                              icon="mdi:alert-circle-outline"
                              style="--mdc-icon-size: 24px; color: var(--warning-color, #ff9800);"
                            ></ha-icon>
                            <span style="font-weight: 600; color: var(--primary-text-color);">
                              ${(0,d.kg)("editor.popup.trigger_logic.no_conditions_title",s,"No Conditions Configured")}
                            </span>
                          </div>
                          <div
                            style="color: var(--secondary-text-color); line-height: 1.5; margin-bottom: 12px;"
                          >
                            ${(0,d.kg)("editor.popup.trigger_logic.no_conditions",s,'Click "Add Condition" below to create your first trigger condition. The popup will remain closed until you add at least one condition.')}
                          </div>
                          <div
                            style="font-size: 12px; color: var(--secondary-text-color); font-style: italic; padding: 8px; background: rgba(0, 0, 0, 0.1); border-radius: 4px;"
                          >
                            <strong>Tip:</strong> ${(0,r._)((0,d.kg)("editor.popup.trigger_logic.helper_tip",s,"To open a popup based on a helper, add an <strong>Entity State</strong> condition, select your helper entity, set operator to <strong>=</strong>, and enter <strong>on</strong> as the value."))}
                          </div>
                        </div>
                      `:""}
                  ${a.map(((e,o)=>this._renderTriggerCondition(e,o,a,t,i)))}
                </div>
              </div>
            `:o.qy`
              <div
                style="margin-top: 16px; padding: 16px; background: rgba(var(--rgb-secondary-text-color), 0.05); border-radius: 8px; color: var(--secondary-text-color);"
              >
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <ha-icon icon="mdi:hand-pointing-right" style="--mdc-icon-size: 20px;"></ha-icon>
                  <span style="font-weight: 600; color: var(--primary-text-color);">
                    ${(0,d.kg)("editor.popup.trigger_logic.manual_mode_title",s,"Manual Mode")}
                  </span>
                </div>
                <div style="line-height: 1.5;">
                  ${(0,r._)((0,d.kg)("editor.popup.trigger_logic.manual_note",s,"Popup state is controlled manually by user interaction. Use the <strong>Default State</strong> setting in the <strong>General</strong> tab to choose whether the popup starts open or closed when the card loads."))}
                </div>
              </div>
            `}
      </div>
    `}_renderTriggerCondition(e,t,i,r,n){var a;const l=(null===(a=null==r?void 0:r.locale)||void 0===a?void 0:a.language)||"en",s=o=>{const r=[...i];r[t]=Object.assign(Object.assign({},e),o),n({trigger_conditions:r})},p=!1!==e.ui_expanded,g=e.custom_name||`Condition ${t+1}`;return o.qy`
      <div
        class="uc-condition-item"
        style="border:1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color); overflow: hidden;"
      >
        <div
          class="uc-condition-header"
          style="display:flex; align-items:center; justify-content: space-between; gap:10px; padding: 12px 14px; border-bottom: ${p?"1px solid var(--divider-color)":"none"};"
        >
          <div style="display:flex; align-items:center; gap:10px; min-width:0;">
            <button
              @click=${()=>s({ui_expanded:!p})}
              title=${p?"Collapse":"Expand"}
              style="background:none; border:none; color:var(--secondary-text-color); cursor:pointer; padding:4px;"
            >
              <ha-icon icon=${p?"mdi:chevron-down":"mdi:chevron-right"}></ha-icon>
            </button>
            <span
              style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
              >${g}</span
            >
          </div>
          <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
            <button
              @click=${()=>{const o=Object.assign(Object.assign({},e),{id:`cond_${Date.now()}_${Math.random().toString(36).slice(2,7)}`}),r=[...i];r.splice(t+1,0,o),n({trigger_conditions:r})}}
              style="background:none; border:none; padding:4px; cursor:pointer; color: var(--secondary-text-color);"
              title="Duplicate Condition"
            >
              <ha-icon icon="mdi:content-copy" style="--mdc-icon-size: 18px;"></ha-icon>
            </button>
            <button
              @click=${()=>{const e=i.filter(((e,i)=>i!==t));n({trigger_conditions:e})}}
              style="background:none; border:none; padding:4px; cursor:pointer; color: var(--error-color);"
              title="Remove Condition"
            >
              <ha-icon icon="mdi:trash-can-outline" style="--mdc-icon-size: 18px;"></ha-icon>
            </button>
          </div>
        </div>

        ${p?o.qy`
              <div style="padding: 12px 14px; display:flex; flex-direction:column; gap:12px;">
                ${this.renderFieldSection((0,d.kg)("editor.popup.trigger_logic.custom_name",l,"Custom Name"),(0,d.kg)("editor.popup.trigger_logic.custom_name_desc",l,"Optional: Give this condition a custom name"),r,{custom_name:e.custom_name||""},[this.textField("custom_name")],(e=>s(e.detail.value)))}
                ${this.renderFieldSection((0,d.kg)("editor.popup.trigger_logic.condition_type",l,"Condition Type"),"",r,{type:e.type||"entity_state"},[this.selectField("type",[{value:"entity_state",label:(0,d.kg)("editor.popup.trigger_logic.type_entity_state",l,"Entity State")},{value:"entity_attribute",label:(0,d.kg)("editor.popup.trigger_logic.type_entity_attribute",l,"Entity Attribute")},{value:"time",label:(0,d.kg)("editor.popup.trigger_logic.type_time",l,"Time Range")},{value:"template",label:(0,d.kg)("editor.popup.trigger_logic.type_template",l,"Template")}])],(e=>{const t=e.detail.value.type,i={type:t};"entity_state"===t?Object.assign(i,{entity:"",operator:"=",value:""}):"entity_attribute"===t?Object.assign(i,{entity:"",attribute:"",operator:"=",value:""}):"time"===t?Object.assign(i,{time_from:"00:00",time_to:"23:59"}):"template"===t&&Object.assign(i,{template:""}),s(i)}))}
                ${(()=>"entity_state"===(e.type||"entity_state")?o.qy`
                      ${this.renderFieldSection((0,d.kg)("editor.popup.trigger_logic.entity",l,"Entity"),"",r,{entity:e.entity||""},[this.entityField("entity")],(e=>s(e.detail.value)))}
                      ${this.renderFieldSection((0,d.kg)("editor.popup.trigger_logic.operator",l,"Operator"),"",r,{operator:e.operator||"="},[this.selectField("operator",[{value:"=",label:"="},{value:"!=",label:"!="},{value:">",label:">"},{value:">=",label:">="},{value:"<",label:"<"},{value:"<=",label:"<="},{value:"contains",label:"contains"},{value:"not_contains",label:"not_contains"},{value:"has_value",label:"has_value"},{value:"no_value",label:"no_value"}])],(e=>s(e.detail.value)))}
                      ${this.renderFieldSection((0,d.kg)("editor.popup.trigger_logic.value",l,"Value"),"",r,{value:e.value||""},[this.textField("value")],(e=>s(e.detail.value)))}
                    `:"entity_attribute"===e.type?o.qy`
                      ${this.renderFieldSection((0,d.kg)("editor.popup.trigger_logic.entity",l,"Entity"),"",r,{entity:e.entity||""},[this.entityField("entity")],(e=>s(e.detail.value)))}
                      ${this.renderFieldSection((0,d.kg)("editor.popup.trigger_logic.attribute",l,"Attribute"),"",r,{attribute:e.attribute||""},[this.textField("attribute")],(e=>s(e.detail.value)))}
                      ${this.renderFieldSection((0,d.kg)("editor.popup.trigger_logic.operator",l,"Operator"),"",r,{operator:e.operator||"="},[this.selectField("operator",[{value:"=",label:"="},{value:"!=",label:"!="},{value:">",label:">"},{value:">=",label:">="},{value:"<",label:"<"},{value:"<=",label:"<="},{value:"contains",label:"contains"},{value:"not_contains",label:"not_contains"}])],(e=>s(e.detail.value)))}
                      ${this.renderFieldSection((0,d.kg)("editor.popup.trigger_logic.value",l,"Value"),"",r,{value:e.value||""},[this.textField("value")],(e=>s(e.detail.value)))}
                    `:"time"===e.type?o.qy`
                      ${this.renderFieldSection((0,d.kg)("editor.popup.trigger_logic.time_from",l,"From"),"",r,{time_from:e.time_from||"00:00"},[this.textField("time_from")],(e=>s(e.detail.value)))}
                      ${this.renderFieldSection((0,d.kg)("editor.popup.trigger_logic.time_to",l,"To"),"",r,{time_to:e.time_to||"23:59"},[this.textField("time_to")],(e=>s(e.detail.value)))}
                    `:o.qy`
                    <div class="field-container" style="margin-bottom: 16px;">
                      <div
                        class="field-title"
                        style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                      >
                        ${(0,d.kg)("editor.popup.trigger_logic.template",l,"Template")}
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 12px; margin-bottom: 8px; color: var(--secondary-text-color);"
                      >
                        ${(0,d.kg)("editor.popup.trigger_logic.template_desc",l,"Jinja2 template that should evaluate to true/false to open the popup.")}
                      </div>
                      <ultra-template-editor
                        .hass=${r}
                        .value=${e.template||""}
                        .placeholder=${"{% if states('sensor.example') | int > 50 %}true{% else %}false{% endif %}"}
                        .minHeight=${100}
                        .maxHeight=${300}
                        @value-changed=${e=>s({template:e.detail.value})}
                      ></ultra-template-editor>
                    </div>
                  `)()}
              </div>
            `:""}
      </div>
    `}renderPreview(e,t,i,r){var n,c;const v=e,k=(null===(n=null==t?void 0:t.locale)||void 0===n?void 0:n.language)||"en",w=(null==i?void 0:i.__ucInstanceId)||"",$=w?`${w}:${v.id}`:v.id,S=v.trigger_type||"button";"logic"!==S&&"manual"!==v.trigger_mode&&(v.trigger_mode="manual"),"module"===S&&v.trigger_module_id?(0,u.S3)(v.id,v.trigger_module_id):(0,u.$3)(v.id);const T=!0===v.auto_close_timer_enabled;b.set($,T),T||this._clearAutoCloseTimer($);let C=null;if("logic"===S){const e=v.trigger_mode||"manual";if("every"===e||"any"===e){const i=v.trigger_conditions||[];i.some((e=>{if(!e||!e.type)return!1;switch(e.type){case"entity_state":return e.entity&&""!==e.entity.trim();case"entity_attribute":return e.entity&&""!==e.entity.trim()&&e.attribute&&""!==e.attribute.trim();case"time":return e.time_from&&e.time_to;case"template":return e.template&&""!==e.template.trim();default:return!1}}))?(l.S.setHass(t),C=l.S.evaluateDisplayConditions(i,e)):C=!1}}else"page_load"===S&&(m.has($)||(C=!0));if(m.has($)){if(null!==C&&"logic"===S){const e=h.get($)!==C;h.set($,C);const t=y.has($);if(e&&!t){const e=m.get($)||!1;C?(m.set($,!0),!1===v.auto_close&&y.add($),!e&&v.auto_close_timer_enabled&&this._startAutoCloseTimer(v,$)):!1!==v.auto_close&&(m.set($,!1),this._clearAutoCloseTimer($))}}}else{const e=null!==C?C:v.default_open||!1;m.set($,e),null!==C&&h.set($,C),e&&"logic"===S&&!1===v.auto_close&&y.add($),e&&v.auto_close_timer_enabled&&this._startAutoCloseTimer(v,$)}let F,z=m.get($)||!1;y.has($)&&!z&&(m.set($,!0),z=!0);const I=`__ultraPopupOpenListener_${v.id}`,P=window;P[I]&&(window.removeEventListener("ultra-popup-open",P[I]),delete P[I]);const q=e=>{var t;(null===(t=e.detail)||void 0===t?void 0:t.popupId)===v.id&&(m.set($,!0),y.add($),v.auto_close_timer_enabled&&this._startAutoCloseTimer(v,$),setTimeout((()=>{F&&(F(!1),setTimeout((()=>{m.get($)&&(f.set($,!0),this.triggerPreviewUpdate(!0))}),500))}),0))};window.addEventListener("ultra-popup-open",q),P[I]=q;const A=`__ultraPopupChildUpdateListener_${v.id}`;P[A]&&(window.removeEventListener("ultra-card-template-update",P[A]),delete P[A]);const U=e=>{m.get($)&&_.has($)&&(f.set($,!0),setTimeout((()=>{F&&m.get($)&&F(!1)}),10))};window.addEventListener("ultra-card-template-update",U),P[A]=U;const O=e=>{e.stopPropagation(),"logic"===S&&"manual"!==v.trigger_mode||(m.set($,!0),y.add($),v.auto_close_timer_enabled&&this._startAutoCloseTimer(v,$),F(!1),setTimeout((()=>{m.get($)&&(f.set($,!0),this.triggerPreviewUpdate(!0))}),500))},D=e=>{e.stopPropagation(),e.preventDefault(),m.set($,!1),y.delete($),this._clearAutoCloseTimer($),x();const t=_.get($);if(t){const e=t._ultraInertObserver;e&&e.disconnect(),t.remove(),_.delete($)}this.triggerPreviewUpdate(!0)},E=e=>{e.stopPropagation(),D(e)};let L="";if(v.show_title)if("entity"===v.title_mode&&v.title_entity){const e=null==t?void 0:t.states[v.title_entity],i=(null===(c=null==e?void 0:e.attributes)||void 0===c?void 0:c.friendly_name)||v.title_entity.split(".")[1]||v.title_entity,o=(null==e?void 0:e.state)||v.title_entity;L=v.show_entity_name?`${i}: ${o}`:o}else L=v.title_text||"Popup Title";const M=v.layout||"default";let B="",j="";"full_screen"===M?(j="ultra-popup-layout-full_screen",B="width: 100vw; height: 100vh; max-width: 100vw; max-height: 100vh; border-radius: 0;"):"left_panel"===M?(j="ultra-popup-layout-left_panel",B=`width: ${v.popup_width||"600px"}; height: 100vh; max-height: 100vh; margin: 0; position: absolute; left: 0; top: 0; border-radius: 0;`):"right_panel"===M?(j="ultra-popup-layout-right_panel",B=`width: ${v.popup_width||"600px"}; height: 100vh; max-height: 100vh; margin: 0; position: absolute; right: 0; top: 0; border-radius: 0;`):"top_panel"===M?(j="ultra-popup-layout-top_panel",B="width: 100vw; max-width: 100vw; margin: 0; position: absolute; top: 0; left: 0; border-radius: 0;"):"bottom_panel"===M?(j="ultra-popup-layout-bottom_panel",B="width: 100vw; max-width: 100vw; margin: 0; position: absolute; bottom: 0; left: 0; border-radius: 0;"):B=`width: ${v.popup_width||"600px"}; max-width: 90vw;`;const N="2147483647",R=v.modules&&v.modules.length>0,V=(0,a.oD)();F=(e=!1)=>{const n=`ultra-popup-portal-${$}`;let a=_.get($);const g=y.has($);let u=m.get($)||!1;if(g&&(m.set($,!0),u=!0),!u&&!g){if(a){const e=a._ultraInertObserver;e&&e.disconnect(),x(),a.remove(),_.delete($)}return}u||m.set($,!0);const c=!a;a||(a=document.createElement("div"),a.id=n,a.className="ultra-popup-portal",a.style.position="fixed",a.style.top="0",a.style.left="0",a.style.width="100%",a.style.height="100%",a.style.pointerEvents="auto",a.style.zIndex="2147483647",a.removeAttribute("inert"),document.body.appendChild(a),_.set($,a)),a.removeAttribute("inert"),a.style.position="fixed",a.style.top="0",a.style.left="0",a.style.width="100%",a.style.height="100%",a.style.pointerEvents="auto",a.style.zIndex="2147483647";const h=new MutationObserver((e=>{e.forEach((e=>{"attributes"===e.type&&"inert"===e.attributeName&&a.hasAttribute("inert")&&a.removeAttribute("inert")}))}));h.observe(a,{attributes:!0,attributeFilter:["inert"]}),a._ultraInertObserver=h;const b="ha-preview"===r||"live"===r,w=b?"2147483647 !important":p.Mu.DIALOG_OVERLAY;b&&document.querySelectorAll(".edit-mode, ha-card[edit-mode], [data-edit-mode]").forEach((e=>{const t=e;t.dataset.ultraPopupOriginalZIndex||(t.dataset.ultraPopupOriginalZIndex=t.style.zIndex||""),t.style.zIndex="-1",t.style.pointerEvents="none"}));const S=!0===f.get($),T=c||S;if(S&&f.delete($),!T)return;c&&(a.innerHTML="");const C=o.qy`
        <style>
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes zoomIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes zoomOut {
            from {
              opacity: 0;
              transform: scale(1.1);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes slideInDown {
            from {
              opacity: 0;
              transform: translateY(-50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .animation-fadeIn {
            animation-name: fadeIn;
          }
          .animation-zoomIn {
            animation-name: zoomIn;
          }
          .animation-zoomOut {
            animation-name: zoomOut;
          }
          .animation-slideInDown {
            animation-name: slideInDown;
          }
          .animation-slideInUp {
            animation-name: slideInUp;
          }
          .animation-slideInLeft {
            animation-name: slideInLeft;
          }
          .animation-slideInRight {
            animation-name: slideInRight;
          }
        </style>
        <div
          class="ultra-popup-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="${(L||"Popup").trim()||"Popup"}"
          @click=${E}
          style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: ${w};
            background: ${!1!==v.show_overlay?v.overlay_background||"rgba(0,0,0,0.85)":"transparent"};
            ${!1!==v.show_overlay?"backdrop-filter: blur(2px);":""}
            animation: fadeIn 0.3s ease both;
            pointer-events: auto !important;
          "
        >
          <div
            class="ultra-popup-container ${j} ${{fade:"animation-fadeIn",scale_up:"animation-zoomIn",scale_down:"animation-zoomOut",slide_top:"animation-slideInDown",slide_left:"animation-slideInLeft",slide_right:"animation-slideInRight",slide_bottom:"animation-slideInUp"}[v.animation||"fade"]||"animation-fadeIn"}"
            @click=${e=>e.stopPropagation()}
            style="
              position: relative;
              ${B}
              max-height: 90vh;
              overflow-y: auto;
              background: ${v.popup_background_color||"var(--card-background-color)"};
              color: ${v.popup_text_color||"var(--primary-text-color)"};
              border-radius: ${"default"===M?v.popup_border_radius||"8px":"0"};
              box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
              animation-duration: 0.4s;
              animation-fill-mode: both;
              animation-timing-function: ease;
              pointer-events: auto !important;
              z-index: 2147483646;
              isolation: isolate;
            "
          >
            ${(()=>{if("none"===v.close_button_position)return"";const e=v.close_button_icon||"mdi:close",t=v.close_button_size||32,i=v.close_button_color||"#ffffff",r=v.close_button_offset_x||"0px",n=v.close_button_offset_y||"0px";return o.qy`
        <button
          @click=${D}
          @touchend=${e=>{e.preventDefault(),e.stopPropagation(),D(e)}}
          class="ultra-popup-close-button swiper-no-swiping"
          style="
            position: absolute;
            top: calc(10px + ${n});
            right: calc(10px + ${r});
            z-index: ${N};
            background: none;
            border: none;
            padding: 8px;
            margin: 0;
            cursor: pointer !important;
            pointer-events: auto !important;
            touch-action: manipulation;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.2s ease, transform 0.2s ease;
            isolation: isolate;
          "
          @mouseover=${e=>{const t=e.currentTarget;t.style.background="rgba(255,255,255,0.1)",t.style.transform="scale(1.1)"}}
          @mouseout=${e=>{const t=e.currentTarget;t.style.background="none",t.style.transform="scale(1)"}}
        >
          <ha-icon
            icon="${e}"
            style="
              color: ${i};
              --mdc-icon-size: ${t}px;
              pointer-events: none;
            "
          ></ha-icon>
        </button>
      `})()}
            ${v.show_title?o.qy`
                  <div
                    class="ultra-popup-title"
                    style="
                      background: ${v.title_background_color||"var(--primary-color)"};
                      color: ${v.title_text_color||"#ffffff"};
                      padding: 16px 20px;
                      font-size: 20px;
                      font-weight: 600;
                      border-bottom: 1px solid var(--divider-color);
                    "
                  >
                    ${L}
                  </div>
                `:""}

            <div
              class="ultra-popup-content"
              style="
                padding: ${v.popup_padding||"5%"};
              "
            >
              ${R?v.modules.map((e=>{var n,a,d,p,g,u;const c=V.getModule(e.type);if(!c)return o.qy`<div>Unknown module type: ${e.type}</div>`;if(l.S.setHass(t),!l.S.evaluateModuleVisibility(e))return"";const _=(null===(a=null===(n=c.metadata)||void 0===n?void 0:n.tags)||void 0===a?void 0:a.includes("pro"))||(null===(p=null===(d=c.metadata)||void 0===d?void 0:d.tags)||void 0===p?void 0:p.includes("premium"))||!1;let m=!1;const v=s.x.checkIntegrationAuth(t);if("pro"===(null===(g=null==v?void 0:v.subscription)||void 0===g?void 0:g.tier)&&"active"===(null===(u=null==v?void 0:v.subscription)||void 0===u?void 0:u.status)&&(m=!0),_&&!m)return o.qy`
                        <div
                          style="padding: 16px; text-align: center; color: var(--secondary-text-color); font-style: italic; background: rgba(var(--rgb-warning-color), 0.1); border: 1px dashed var(--warning-color); border-radius: 8px; margin: 8px 0;"
                        >
                          🔒 ${c.metadata.title} - Pro Feature
                        </div>
                      `;const h=e,y=h.design||{},b=h.background_color||y.background_color||"",f=h.border_radius||y.border_radius||"",x=h.border||y.border||null,k=h.backdrop_filter||y.backdrop_filter||"";let w="margin-bottom: 8px;";return b&&(w+=` background: ${b};`),f&&(w+=` border-radius: ${f};`),x&&x.style&&"none"!==x.style&&(w+=` border: ${x.width||"1px"} ${x.style} ${x.color||"var(--divider-color)"};`,x.radius&&(w+=` border-radius: ${"number"==typeof x.radius?x.radius+"px":x.radius};`)),k&&(w+=` backdrop-filter: ${k};`),o.qy`
                      <div class="popup-child-module" style="${w}">
                        ${c.renderPreview(e,t,i,r)}
                      </div>
                    `})):o.qy`
                    <div
                      style="padding: 24px; text-align: center; color: var(--secondary-text-color); font-style: italic;"
                    >
                      ${(0,d.kg)("editor.popup.preview.no_modules",k,"No modules added. Add modules to this popup in the Layout tab.")}
                    </div>
                  `}
            </div>
          </div>
        </div>
      `;(0,o.XX)(C,a),requestAnimationFrame((()=>{const t=a.querySelector(".ultra-popup-overlay"),i=a.querySelector(".ultra-popup-close-button"),o=a.querySelector(".ultra-popup-container");t&&(t.removeAttribute("inert"),e||(t.style.pointerEvents="auto"),t.style.zIndex=w.toString()),i&&(i.removeAttribute("inert"),e||(i.style.pointerEvents="auto",i.style.cursor="pointer"),i.style.zIndex=N.toString()),o&&(o.removeAttribute("inert"),e||(o.style.pointerEvents="auto")),t&&t.addEventListener("click",(e=>{e.target===t&&D(e)})),i&&i.addEventListener("click",(e=>{e.stopPropagation(),D(e)})),o&&o.addEventListener("click",(e=>{e.stopPropagation()}))}))};const G=m.get($)||!1,W=_.has($),Y=y.has($),H=!0===f.get($),X=G||Y;if(!X||W&&!H){if(!X&&W){const e=_.get($);if(e){const t=e._ultraInertObserver;t&&t.disconnect(),x(),e.remove(),_.delete($)}}}else F(!1);const Z=null!==this._isOpenedViaNavigation(v.id,i);return"page_load"===S||"logic"===S||"module"===S||Z?o.qy`<div style="display: contents;"></div>`:o.qy`${(()=>{var e;if("page_load"===S||"logic"===S)return o.qy``;const i=v.trigger_alignment||"center",r="left"===i?"flex-start":"right"===i?"flex-end":"center";let n=o.qy``;if("button"===S){const e=v.trigger_button_text||"Open Popup",t=v.trigger_button_icon||"",i=v.trigger_button_full_width||!1;n=o.qy`
          <button
            class="swiper-no-swiping popup-trigger"
            @click=${O}
            @touchend=${e=>{e.preventDefault(),e.stopPropagation(),O(e)}}
            style="display: flex; align-items: center; justify-content: center; gap: ${t?"8px":"0"}; padding: 12px 24px; background: var(--primary-color); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500; transition: all 0.2s ease; touch-action: manipulation; pointer-events: auto; ${i?"width: 100%;":""}"
          >
            ${t?o.qy`<ha-icon icon="${t}" style="--mdc-icon-size: 24px;"></ha-icon>`:""}
            ${e}
          </button>
        `}else if("image"===S){const i=v.trigger_image_type||"url",r=v.trigger_image_full_width||!1;let a="";if("upload"===i||"url"===i)a=v.trigger_image_url||"",a&&"upload"===i&&(a=(0,g.V)(t,a));else if("entity"===i&&v.trigger_image_entity){const i=null==t?void 0:t.states[v.trigger_image_entity];(null===(e=null==i?void 0:i.attributes)||void 0===e?void 0:e.entity_picture)?(a=i.attributes.entity_picture,a.startsWith("/")&&(a=`${(t.hassUrl?t.hassUrl():"").replace(/\/$/,"")}${a}`)):(null==i?void 0:i.state)&&(i.state.startsWith("http")||i.state.startsWith("/")||i.state.startsWith("data:"))&&(a=i.state,a.startsWith("/"))&&(a=`${(t.hassUrl?t.hassUrl():"").replace(/\/$/,"")}${a}`)}n=a?o.qy`
            <img
              class="swiper-no-swiping popup-trigger"
              src="${a}"
              @click=${O}
              @touchend=${e=>{e.preventDefault(),e.stopPropagation(),O(e)}}
              style="${r?"width: 100%;":"max-width: 200px;"} cursor: pointer; border-radius: 8px; transition: transform 0.2s ease; display: block; touch-action: manipulation; pointer-events: auto;"
              @mouseover=${e=>{e.target.style.transform="scale(1.05)"}}
              @mouseout=${e=>{e.target.style.transform="scale(1)"}}
            />
          `:o.qy`
            <div
              style="padding: 24px; text-align: center; color: var(--secondary-text-color); border: 1px dashed var(--divider-color); border-radius: 8px;"
            >
              ${(0,d.kg)("editor.popup.trigger.no_image",k,"No image configured")}
            </div>
          `}else if("icon"===S){const e=v.trigger_icon||"mdi:information",t=v.trigger_icon_size||24,i=v.trigger_icon_color||"var(--primary-color)";n=o.qy`
          <ha-icon
            class="swiper-no-swiping popup-trigger"
            icon="${e}"
            @click=${O}
            @touchend=${e=>{e.preventDefault(),e.stopPropagation(),O(e)}}
            style="--mdc-icon-size: ${t}px; cursor: pointer; color: ${i}; transition: transform 0.2s ease; touch-action: manipulation; pointer-events: auto;"
            @mouseover=${e=>{e.target.style.transform="scale(1.1)"}}
            @mouseout=${e=>{e.target.style.transform="scale(1)"}}
          ></ha-icon>
        `}return o.qy`
        <div
          class="swiper-no-swiping"
          style="display: inline-flex; justify-content: ${r}; width: ${"left"===i||"right"===i?"auto":"100%"}; pointer-events: auto;"
        >
          ${n}
        </div>
      `})()}`}validate(e){var t,i,o,r,n,a;const l=e,s=[...super.validate(e).errors];l.modules||s.push("Modules array is required"),l.show_title&&"custom"===l.title_mode&&!(null===(t=l.title_text)||void 0===t?void 0:t.trim())&&s.push("Title text is required when using custom title mode"),l.show_title&&"entity"===l.title_mode&&!(null===(i=l.title_entity)||void 0===i?void 0:i.trim())&&s.push("Title entity is required when using entity title mode");const d=l.trigger_type||"button";if("button"===d&&(null===(o=l.trigger_button_text)||void 0===o||o.trim()),"image"===d){const e=l.trigger_image_type||"url";"url"!==e||(null===(r=l.trigger_image_url)||void 0===r?void 0:r.trim())?"upload"!==e||(null===(n=l.trigger_image_url)||void 0===n?void 0:n.trim())?"entity"!==e||(null===(a=l.trigger_image_entity)||void 0===a?void 0:a.trim())||s.push("Image entity is required for image trigger"):s.push("Uploaded image is required for image trigger"):s.push("Image URL is required for image trigger")}if(l.modules&&l.modules.length>0)for(const e of l.modules)"popup"===e.type&&s.push("Popup modules cannot contain other popup modules");return{valid:0===s.length,errors:s}}_startAutoCloseTimer(e,t){this._clearAutoCloseTimer(t);const i=1e3*(e.auto_close_timer_seconds||30),o=window.setTimeout((()=>{if(!0!==b.get(t))return void v.delete(t);m.set(t,!1),y.delete(t),v.delete(t),x();const e=_.get(t);if(e){const i=e._ultraInertObserver;i&&i.disconnect(),e.remove(),_.delete(t)}this.triggerPreviewUpdate(!0)}),i);v.set(t,o)}_clearAutoCloseTimer(e){const t=v.get(e);void 0!==t&&(window.clearTimeout(t),v.delete(e))}getStyles(){return`\n      ${n.m.getSliderStyles()}\n    `}}}}]);