"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[3131],{2562:(e,t,o)=>{o.r(t),o.d(t,{UltraAccordionModule:()=>c});var i=o(5183),n=o(7475),a=o(5255),r=o(230),d=o(378),l=o(6478);class c extends n.m{constructor(){super(...arguments),this.metadata={type:"accordion",title:"Accordion",description:"Collapsible container with customizable header for organizing modules",author:"WJD Designs",version:"1.0.0",icon:"mdi:chevron-down",category:"layout",tags:["layout","accordion","collapsible","container","organization"]},this.accordionStates=new Map}createDefault(e,t){return{id:e||this.generateId("accordion"),type:"accordion",modules:[],title_mode:"custom",title_text:"Accordion Title",title_entity:"",show_entity_name:!1,icon:"mdi:chevron-down",header_alignment:"apart",icon_side:"right",default_open:!1,open_mode:"manual",open_conditions:[],tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}renderDesignTab(e,t,o,n){var a;const r=(null===(a=null==t?void 0:t.locale)||void 0===a?void 0:a.language)||"en";return i.qy`
      ${this.injectUcFormStyles()}

      <div class="module-design-settings">
        <!-- Standard Design Tab Content (from GlobalDesignTab) -->
        <div
          style="font-size: 14px; font-weight: 600; color: var(--secondary-text-color); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;"
        >
          ${(0,l.kg)("editor.accordion.design.general_title",r,"General Module Design")}
        </div>
        ${super.renderDesignTab(e,t,o,n)}
      </div>
    `}renderGeneralTab(e,t,o,n){var a,r,d,c,s,g,u;const p=e,v=(null===(a=null==t?void 0:t.locale)||void 0===a?void 0:a.language)||"en",h=p.design||{};return i.qy`
      ${this.injectUcFormStyles()}
      <style>
        .color-row {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 16px;
        }
        .color-row > * {
          width: 100%;
          min-width: 0;
        }
        .design-field {
          margin-bottom: 16px;
        }
        .field-row {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 16px;
        }
        .field-row > * {
          width: 100%;
          min-width: 0;
        }
        .design-subsection {
          background: rgba(var(--rgb-primary-color), 0.05);
          border-left: 3px solid var(--primary-color);
          padding: 16px;
          margin-bottom: 24px;
          border-radius: 0 8px 8px 0;
          overflow: visible;
        }
        .design-subsection ultra-color-picker {
          width: 100%;
          display: block;
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

      <div class="module-general-settings">
        <!-- Title Configuration Section -->
        ${this.renderSettingsSection((0,l.kg)("editor.accordion.title.section_title",v,"Title Configuration"),(0,l.kg)("editor.accordion.title.section_desc",v,"Configure the accordion header title source and content."),[{title:(0,l.kg)("editor.accordion.title.mode",v,"Title Mode"),description:(0,l.kg)("editor.accordion.title.mode_desc",v,"Choose whether to use custom text or entity state as title."),hass:t,data:{title_mode:p.title_mode||"custom"},schema:[this.selectField("title_mode",[{value:"custom",label:(0,l.kg)("editor.common.custom_text",v,"Custom Text")},{value:"entity",label:(0,l.kg)("editor.common.entity_state",v,"Entity State")}])],onChange:e=>{e.detail.value.title_mode!==(p.title_mode||"custom")&&(n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}}])}

        <!-- Conditional: Custom Title Text -->
        ${"custom"===p.title_mode?i.qy`
              <div style="margin-top: -16px; margin-bottom: 32px;">
                ${this.renderConditionalFieldsGroup((0,l.kg)("editor.accordion.title.custom_config",v,"Custom Title Configuration"),i.qy`
                    <div
                      class="field-title"
                      style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                    >
                      ${(0,l.kg)("editor.accordion.title.custom_text",v,"Title Text")}
                    </div>
                    <div
                      class="field-description"
                      style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                    >
                      ${(0,l.kg)("editor.accordion.title.custom_text_desc",v,"Enter the custom text to display in the accordion header.")}
                    </div>
                    <ha-textfield
                      .value=${p.title_text||""}
                      placeholder="Enter title text"
                      style="width: 100%;"
                      @input=${e=>{const t=e.target;n({title_text:t.value})}}
                    ></ha-textfield>
                  `)}
              </div>
            `:""}

        <!-- Conditional: Entity Title -->
        ${"entity"===p.title_mode?i.qy`
              <div style="margin-top: -16px; margin-bottom: 32px;">
                ${this.renderConditionalFieldsGroup((0,l.kg)("editor.accordion.title.entity_config",v,"Entity Title Configuration"),i.qy`
                    ${this.renderFieldSection((0,l.kg)("editor.accordion.title.entity",v,"Title Entity"),(0,l.kg)("editor.accordion.title.entity_desc",v,"Select an entity whose state will be used as the title."),t,{title_entity:p.title_entity||""},[this.entityField("title_entity")],(e=>{n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}))}

                    <!-- Show Entity Name Toggle -->
                    ${this.renderSettingsSection((0,l.kg)("editor.accordion.title.show_name",v,"Display Options"),(0,l.kg)("editor.accordion.title.show_name_desc",v,"Choose whether to show the entity name along with the state."),[{title:(0,l.kg)("editor.accordion.title.show_entity_name",v,"Show Entity Name"),description:(0,l.kg)("editor.accordion.title.show_entity_name_desc",v,"Display the entity friendly name before the state value."),hass:t,data:{show_entity_name:p.show_entity_name||!1},schema:[this.booleanField("show_entity_name")],onChange:e=>{n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}}])}
                  `)}
              </div>
            `:""}

        <!-- Icon Configuration Section -->
        ${this.renderSettingsSection((0,l.kg)("editor.accordion.icon.section_title",v,"Control Icon"),(0,l.kg)("editor.accordion.icon.section_desc",v,"Configure the control icon displayed in the accordion header (defaults to chevron-down)."),[{title:(0,l.kg)("editor.accordion.icon.custom",v,"Icon"),description:(0,l.kg)("editor.accordion.icon.custom_desc",v,"Select the icon to display as the control indicator."),hass:t,data:{icon:p.icon||"mdi:chevron-down"},schema:[this.iconField("icon")],onChange:e=>{n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}}])}

        <!-- Header Alignment Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${(0,l.kg)("editor.accordion.alignment.section_title",v,"Header Alignment")}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,l.kg)("editor.accordion.alignment.section_desc",v,"Choose how the title and icon are positioned in the header.")}
          </div>

          <!-- Alignment Mode: Center or Apart -->
          <div style="margin-bottom: 16px;">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
              ${(0,l.kg)("editor.accordion.alignment.mode",v,"Alignment Mode")}
            </div>
            <div style="display: flex; gap: 8px;">
              ${[{value:"center",icon:"mdi:align-horizontal-center",title:(0,l.kg)("editor.common.center",v,"Center")},{value:"apart",icon:"mdi:arrow-left-right",title:(0,l.kg)("editor.common.apart",v,"Apart")}].map((e=>i.qy`
                  <button
                    class="alignment-btn ${(p.header_alignment||"apart")===e.value?"active":""}"
                    @click=${()=>{n({header_alignment:e.value}),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}}
                    title="${e.title}"
                    style="flex: 1; padding: 12px; border: 1px solid var(--divider-color); border-radius: 4px; background: ${(p.header_alignment||"apart")===e.value?"var(--primary-color)":"var(--card-background-color)"}; color: ${(p.header_alignment||"apart")===e.value?"white":"var(--primary-text-color)"}; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
                  >
                    <ha-icon icon="${e.icon}" style="--mdc-icon-size: 24px;"></ha-icon>
                  </button>
                `))}
            </div>
          </div>

          <!-- Icon Side: Left or Right -->
          <div>
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
              ${(0,l.kg)("editor.accordion.alignment.icon_side",v,"Icon Side")}
            </div>
            <div style="display: flex; gap: 8px;">
              ${[{value:"left",icon:"mdi:arrow-left",title:(0,l.kg)("editor.common.left",v,"Left")},{value:"right",icon:"mdi:arrow-right",title:(0,l.kg)("editor.common.right",v,"Right")}].map((e=>i.qy`
                  <button
                    class="alignment-btn ${(p.icon_side||"right")===e.value?"active":""}"
                    @click=${()=>{n({icon_side:e.value}),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}}
                    title="${e.title}"
                    style="flex: 1; padding: 12px; border: 1px solid var(--divider-color); border-radius: 4px; background: ${(p.icon_side||"right")===e.value?"var(--primary-color)":"var(--card-background-color)"}; color: ${(p.icon_side||"right")===e.value?"white":"var(--primary-text-color)"}; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
                  >
                    <ha-icon icon="${e.icon}" style="--mdc-icon-size: 24px;"></ha-icon>
                  </button>
                `))}
            </div>
          </div>
        </div>

        <!-- Open/Close Logic Section -->
        ${this._renderOpenCloseLogic(p,t,n)}

        <!-- Default State Section (only shown when open_mode is manual) -->
        ${"manual"===(p.open_mode||"manual")?this.renderSettingsSection((0,l.kg)("editor.accordion.state.section_title",v,"Default State"),(0,l.kg)("editor.accordion.state.section_desc",v,"Configure whether this accordion starts open or closed when the card loads."),[{title:(0,l.kg)("editor.accordion.state.default_open",v,"Open by Default"),description:(0,l.kg)("editor.accordion.state.default_open_desc",v,"When enabled, the accordion will be expanded when the card initially loads."),hass:t,data:{default_open:p.default_open||!1},schema:[this.booleanField("default_open")],onChange:e=>{n(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}}]):""}

        <!-- Container Customization Section -->
        <div class="design-subsection">
          <div class="subsection-title">
            ${(0,l.kg)("editor.accordion.design.container_title",v,"Container Customization")}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,l.kg)("editor.accordion.design.container_desc",v,"Customize the outer wrapper styling of the accordion.")}
          </div>

          <!-- Container Background & Border Color Row -->
          <div class="color-row">
            <ultra-color-picker
              .label=${(0,l.kg)("editor.accordion.design.container_bg_color",v,"Background Color")}
              .value=${h.container_background_color||""}
              .defaultValue=${"var(--card-background-color)"}
              .hass=${t}
              @value-changed=${e=>{const t=Object.assign(Object.assign({},h),{container_background_color:e.detail.value});n({design:t})}}
            ></ultra-color-picker>

            <ultra-color-picker
              .label=${(0,l.kg)("editor.accordion.design.container_border_color",v,"Border Color")}
              .value=${h.container_border_color||""}
              .defaultValue=${"var(--divider-color)"}
              .hass=${t}
              @value-changed=${e=>{const t=Object.assign(Object.assign({},h),{container_border_color:e.detail.value});n({design:t})}}
            ></ultra-color-picker>
          </div>

          <!-- Container Border Width & Radius -->
          <div class="field-row">
            <div>
              ${this.renderSliderField((0,l.kg)("editor.accordion.design.container_border_width",v,"Border Width"),"",null!==(r=h.container_border_width)&&void 0!==r?r:1,1,0,10,1,(e=>{const t=Object.assign(Object.assign({},h),{container_border_width:e});n({design:t})}),"px")}
            </div>
            <div>
              ${this.renderSliderField((0,l.kg)("editor.accordion.design.container_border_radius",v,"Border Radius"),"",null!==(d=h.container_border_radius)&&void 0!==d?d:8,8,0,50,1,(e=>{const t=Object.assign(Object.assign({},h),{container_border_radius:e});n({design:t})}),"px")}
            </div>
          </div>

          <!-- Box Shadow -->
          ${this.renderFieldSection((0,l.kg)("editor.accordion.design.container_shadow",v,"Box Shadow"),(0,l.kg)("editor.accordion.design.container_shadow_desc",v,"CSS box-shadow value (e.g., 0 2px 8px rgba(0,0,0,0.1))"),t,{container_shadow:h.container_shadow||""},[this.textField("container_shadow")],(e=>{const t=Object.assign(Object.assign({},h),{container_shadow:e.detail.value.container_shadow});n({design:t})}))}
        </div>

        <!-- Header Customization Section -->
        <div class="design-subsection">
          <div class="subsection-title">
            ${(0,l.kg)("editor.accordion.design.header_title",v,"Header Customization")}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,l.kg)("editor.accordion.design.header_desc",v,"Customize the clickable header bar appearance.")}
          </div>

          <!-- Header Text & Background Colors -->
          <div class="color-row">
            <ultra-color-picker
              .label=${(0,l.kg)("editor.accordion.design.header_text_color",v,"Text Color")}
              .value=${h.header_text_color||""}
              .defaultValue=${"var(--primary-text-color)"}
              .hass=${t}
              @value-changed=${e=>{const t=Object.assign(Object.assign({},h),{header_text_color:e.detail.value});n({design:t})}}
            ></ultra-color-picker>

            <ultra-color-picker
              .label=${(0,l.kg)("editor.accordion.design.header_bg_color",v,"Background Color")}
              .value=${h.header_background_color||""}
              .defaultValue=${"var(--card-background-color)"}
              .hass=${t}
              @value-changed=${e=>{const t=Object.assign(Object.assign({},h),{header_background_color:e.detail.value});n({design:t})}}
            ></ultra-color-picker>
          </div>

          <!-- Header Hover Background -->
          <div class="design-field">
            <ultra-color-picker
              .label=${(0,l.kg)("editor.accordion.design.header_hover_color",v,"Hover Background Color")}
              .value=${h.header_hover_color||""}
              .defaultValue=${"rgba(var(--rgb-primary-color), 0.1)"}
              .hass=${t}
              @value-changed=${e=>{const t=Object.assign(Object.assign({},h),{header_hover_color:e.detail.value});n({design:t})}}
            ></ultra-color-picker>
          </div>

          <!-- Icon Color & Size -->
          <div class="color-row">
            <ultra-color-picker
              .label=${(0,l.kg)("editor.accordion.design.icon_color",v,"Icon Color")}
              .value=${h.icon_color||""}
              .defaultValue=${"var(--primary-text-color)"}
              .hass=${t}
              @value-changed=${e=>{const t=Object.assign(Object.assign({},h),{icon_color:e.detail.value});n({design:t})}}
            ></ultra-color-picker>

            <div>
              ${this.renderSliderField((0,l.kg)("editor.accordion.design.icon_size",v,"Icon Size"),"",null!==(c=h.icon_size)&&void 0!==c?c:24,24,12,48,1,(e=>{const t=Object.assign(Object.assign({},h),{icon_size:e});n({design:t})}),"px")}
            </div>
          </div>

          <!-- Header Font Size & Weight -->
          <div class="field-row">
            <div>
              ${this.renderSliderField((0,l.kg)("editor.accordion.design.header_font_size",v,"Font Size"),"",h.header_font_size||16,16,8,48,1,(e=>{const t=Object.assign(Object.assign({},h),{header_font_size:e});n({design:t})}),"px")}
            </div>
            <div>
              ${this.renderFieldSection((0,l.kg)("editor.accordion.design.header_font_weight",v,"Font Weight"),"",t,{header_font_weight:h.header_font_weight||"normal"},[this.selectField("header_font_weight",[{value:"normal",label:"Normal"},{value:"300",label:"Light"},{value:"500",label:"Medium"},{value:"600",label:"Semi-Bold"},{value:"bold",label:"Bold"},{value:"800",label:"Extra Bold"}])],(e=>{const t=Object.assign(Object.assign({},h),{header_font_weight:e.detail.value.header_font_weight});n({design:t})}))}
            </div>
          </div>

          <!-- Header Padding -->
          ${this.renderSliderField((0,l.kg)("editor.accordion.design.header_padding",v,"Header Padding"),(0,l.kg)("editor.accordion.design.header_padding_desc",v,"Padding inside the header (in pixels)."),null!==(s=h.header_padding)&&void 0!==s?s:12,12,0,48,1,(e=>{const t=Object.assign(Object.assign({},h),{header_padding:e});n({design:t})}),"px")}

          <!-- Header Border Bottom -->
          <div class="color-row">
            <ultra-color-picker
              .label=${(0,l.kg)("editor.accordion.design.header_border_color",v,"Border Bottom Color")}
              .value=${h.header_border_color||""}
              .defaultValue=${"var(--divider-color)"}
              .hass=${t}
              @value-changed=${e=>{const t=Object.assign(Object.assign({},h),{header_border_color:e.detail.value});n({design:t})}}
            ></ultra-color-picker>

            <div>
              ${this.renderSliderField((0,l.kg)("editor.accordion.design.header_border_width",v,"Border Width"),"",null!==(g=h.header_border_width)&&void 0!==g?g:1,1,0,5,1,(e=>{const t=Object.assign(Object.assign({},h),{header_border_width:e});n({design:t})}),"px")}
            </div>
          </div>
        </div>

        <!-- Content Customization Section -->
        <div class="design-subsection">
          <div class="subsection-title">
            ${(0,l.kg)("editor.accordion.design.content_title",v,"Content Customization")}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,l.kg)("editor.accordion.design.content_desc",v,"Customize the expanded content area appearance.")}
          </div>

          <!-- Content Background Color -->
          <div class="design-field">
            <ultra-color-picker
              .label=${(0,l.kg)("editor.accordion.design.content_bg_color",v,"Background Color")}
              .value=${h.content_background_color||""}
              .defaultValue=${"transparent"}
              .hass=${t}
              @value-changed=${e=>{const t=Object.assign(Object.assign({},h),{content_background_color:e.detail.value});n({design:t})}}
            ></ultra-color-picker>
          </div>

          <!-- Content Padding -->
          ${this.renderSliderField((0,l.kg)("editor.accordion.design.content_padding",v,"Content Padding"),(0,l.kg)("editor.accordion.design.content_padding_desc",v,"Padding around the content area (in pixels)."),h.content_padding||16,16,0,48,1,(e=>{const t=Object.assign(Object.assign({},h),{content_padding:e});n({design:t})}),"px")}

          <!-- Content Border -->
          <div class="color-row">
            <ultra-color-picker
              .label=${(0,l.kg)("editor.accordion.design.content_border_color",v,"Border Color")}
              .value=${h.content_border_color||""}
              .defaultValue=${"transparent"}
              .hass=${t}
              @value-changed=${e=>{const t=Object.assign(Object.assign({},h),{content_border_color:e.detail.value});n({design:t})}}
            ></ultra-color-picker>

            <div>
              ${this.renderSliderField((0,l.kg)("editor.accordion.design.content_border_width",v,"Border Width"),"",null!==(u=h.content_border_width)&&void 0!==u?u:0,0,0,5,1,(e=>{const t=Object.assign(Object.assign({},h),{content_border_width:e});n({design:t})}),"px")}
            </div>
          </div>
        </div>
      </div>
    `}_renderOpenCloseLogic(e,t,o){var n;const a=e.open_conditions||[],r=e.open_mode||"manual",d=(null===(n=null==t?void 0:t.locale)||void 0===n?void 0:n.language)||"en";return i.qy`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${(0,l.kg)("editor.accordion.open_logic.section_title",d,"Open/Close Logic")}
        </div>
        <div
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
        >
          ${(0,l.kg)("editor.accordion.open_logic.section_desc",d,"Control when this accordion automatically opens or closes based on conditions.")}
        </div>

        <!-- Open Mode Selection -->
        ${this.renderFieldSection((0,l.kg)("editor.accordion.open_logic.mode_title",d,"Accordion State Control"),(0,l.kg)("editor.accordion.open_logic.mode_desc",d,"Choose how the accordion state is controlled."),t,{open_mode:r},[this.selectField("open_mode",[{value:"manual",label:(0,l.kg)("editor.accordion.open_logic.mode_manual",d,"Manual")},{value:"always",label:(0,l.kg)("editor.accordion.open_logic.mode_always",d,"Always Open")},{value:"every",label:(0,l.kg)("editor.accordion.open_logic.mode_every",d,"Open if EVERY condition is met")},{value:"any",label:(0,l.kg)("editor.accordion.open_logic.mode_any",d,"Open if ANY condition is met")}])],(e=>{o({open_mode:e.detail.value.open_mode}),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}))}

        <!-- Conditions List -->
        ${"manual"!==r&&"always"!==r?i.qy`
              <div style="margin-top: 24px;">
                <div
                  style="display:flex; align-items:center; justify-content: space-between; margin-bottom: 12px;"
                >
                  <div style="font-size: 16px; font-weight: 600;">
                    ${(0,l.kg)("editor.accordion.open_logic.conditions",d,"Conditions")}
                  </div>
                  <button
                    @click=${()=>{const e={id:`cond_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,type:"entity_state",ui_expanded:!0,entity:"",operator:"=",value:""},t=[...a,e];o({open_conditions:t})}}
                    style="display:flex; align-items:center; gap:8px; padding:6px 10px; border:1px dashed var(--primary-color); background:none; color:var(--primary-color); border-radius:6px; cursor:pointer;"
                  >
                    <ha-icon icon="mdi:plus"></ha-icon>
                    ${(0,l.kg)("editor.accordion.open_logic.add_condition",d,"Add Condition")}
                  </button>
                </div>

                <div style="display:flex; flex-direction: column; gap: 12px;">
                  ${0===a.length?i.qy`
                        <div
                          style="text-align: center; padding: 24px; color: var(--secondary-text-color); font-style: italic;"
                        >
                          ${(0,l.kg)("editor.accordion.open_logic.no_conditions",d,'No conditions added yet. Click "Add Condition" to get started.')}
                        </div>
                      `:""}
                  ${a.map(((e,i)=>this._renderOpenCondition(e,i,a,t,o)))}
                </div>
              </div>
            `:"always"===r?i.qy`
                <div
                  style="margin-top: 16px; padding: 16px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 8px; text-align: center; color: var(--secondary-text-color); font-style: italic;"
                >
                  ${(0,l.kg)("editor.accordion.open_logic.always_note",d,"Accordion will always remain open. Users can still manually close it, but it will reopen automatically.")}
                </div>
              `:i.qy`
                <div
                  style="margin-top: 16px; padding: 16px; background: rgba(var(--rgb-secondary-text-color), 0.05); border-radius: 8px; text-align: center; color: var(--secondary-text-color); font-style: italic;"
                >
                  ${(0,l.kg)("editor.accordion.open_logic.manual_note",d,"Accordion state is controlled manually by user clicks. Set Default State above to choose initial state.")}
                </div>
              `}
      </div>
    `}_renderOpenCondition(e,t,o,n,a){var r;const d=(null===(r=null==n?void 0:n.locale)||void 0===r?void 0:r.language)||"en",c=i=>{const n=[...o];n[t]=Object.assign(Object.assign({},e),i),a({open_conditions:n})},s=!1!==e.ui_expanded,g=e.custom_name||`Condition ${t+1}`;return i.qy`
      <div
        class="uc-condition-item"
        style="border:1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color); overflow: hidden;"
      >
        <div
          class="uc-condition-header"
          style="display:flex; align-items:center; justify-content: space-between; gap:10px; padding: 12px 14px; border-bottom: ${s?"1px solid var(--divider-color)":"none"};"
        >
          <div style="display:flex; align-items:center; gap:10px; min-width:0;">
            <button
              @click=${()=>c({ui_expanded:!s})}
              title=${s?"Collapse":"Expand"}
              style="background:none; border:none; color:var(--secondary-text-color); cursor:pointer; padding:4px;"
            >
              <ha-icon icon=${s?"mdi:chevron-down":"mdi:chevron-right"}></ha-icon>
            </button>
            <span
              style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
              >${g}</span
            >
          </div>
          <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
            <button
              @click=${()=>{const i=Object.assign(Object.assign({},e),{id:`cond_${Date.now()}_${Math.random().toString(36).slice(2,7)}`}),n=[...o];n.splice(t+1,0,i),a({open_conditions:n})}}
              style="background:none; border:none; padding:4px; cursor:pointer; color: var(--secondary-text-color);"
              title="Duplicate Condition"
            >
              <ha-icon icon="mdi:content-copy" style="--mdc-icon-size: 18px;"></ha-icon>
            </button>
            <button
              @click=${()=>{const e=o.filter(((e,o)=>o!==t));a({open_conditions:e})}}
              style="background:none; border:none; padding:4px; cursor:pointer; color: var(--error-color);"
              title="Remove Condition"
            >
              <ha-icon icon="mdi:trash-can-outline" style="--mdc-icon-size: 18px;"></ha-icon>
            </button>
          </div>
        </div>

        ${s?i.qy`
              <div style="padding: 12px 14px; display:flex; flex-direction:column; gap:12px;">
                ${this.renderFieldSection((0,l.kg)("editor.accordion.open_logic.custom_name",d,"Custom Name"),(0,l.kg)("editor.accordion.open_logic.custom_name_desc",d,"Optional: Give this condition a custom name"),n,{custom_name:e.custom_name||""},[this.textField("custom_name")],(e=>c(e.detail.value)))}
                ${this.renderFieldSection((0,l.kg)("editor.accordion.open_logic.condition_type",d,"Condition Type"),"",n,{type:e.type||"entity_state"},[this.selectField("type",[{value:"entity_state",label:(0,l.kg)("editor.accordion.open_logic.type_entity_state",d,"Entity State")},{value:"entity_attribute",label:(0,l.kg)("editor.accordion.open_logic.type_entity_attribute",d,"Entity Attribute")},{value:"time",label:(0,l.kg)("editor.accordion.open_logic.type_time",d,"Time Range")},{value:"template",label:(0,l.kg)("editor.accordion.open_logic.type_template",d,"Template")}])],(e=>{const t=e.detail.value.type,o={type:t};"entity_state"===t?Object.assign(o,{entity:"",operator:"=",value:""}):"entity_attribute"===t?Object.assign(o,{entity:"",attribute:"",operator:"=",value:""}):"time"===t?Object.assign(o,{time_from:"00:00",time_to:"23:59"}):"template"===t&&Object.assign(o,{template:""}),c(o)}))}
                ${(()=>"entity_state"===(e.type||"entity_state")?i.qy`
                      ${this.renderFieldSection((0,l.kg)("editor.accordion.open_logic.entity",d,"Entity"),"",n,{entity:e.entity||""},[this.entityField("entity")],(e=>c(e.detail.value)))}
                      ${this.renderFieldSection((0,l.kg)("editor.accordion.open_logic.operator",d,"Operator"),"",n,{operator:e.operator||"="},[this.selectField("operator",[{value:"=",label:"="},{value:"!=",label:"!="},{value:">",label:">"},{value:">=",label:">="},{value:"<",label:"<"},{value:"<=",label:"<="},{value:"contains",label:"contains"},{value:"not_contains",label:"not_contains"},{value:"has_value",label:"has_value"},{value:"no_value",label:"no_value"}])],(e=>c(e.detail.value)))}
                      ${this.renderFieldSection((0,l.kg)("editor.accordion.open_logic.value",d,"Value"),"",n,{value:e.value||""},[this.textField("value")],(e=>c(e.detail.value)))}
                    `:"entity_attribute"===e.type?i.qy`
                      ${this.renderFieldSection((0,l.kg)("editor.accordion.open_logic.entity",d,"Entity"),"",n,{entity:e.entity||""},[this.entityField("entity")],(e=>c(e.detail.value)))}
                      ${this.renderFieldSection((0,l.kg)("editor.accordion.open_logic.attribute",d,"Attribute"),"",n,{attribute:e.attribute||""},[this.textField("attribute")],(e=>c(e.detail.value)))}
                      ${this.renderFieldSection((0,l.kg)("editor.accordion.open_logic.operator",d,"Operator"),"",n,{operator:e.operator||"="},[this.selectField("operator",[{value:"=",label:"="},{value:"!=",label:"!="},{value:">",label:">"},{value:">=",label:">="},{value:"<",label:"<"},{value:"<=",label:"<="},{value:"contains",label:"contains"},{value:"not_contains",label:"not_contains"}])],(e=>c(e.detail.value)))}
                      ${this.renderFieldSection((0,l.kg)("editor.accordion.open_logic.value",d,"Value"),"",n,{value:e.value||""},[this.textField("value")],(e=>c(e.detail.value)))}
                    `:"time"===e.type?i.qy`
                      ${this.renderFieldSection((0,l.kg)("editor.accordion.open_logic.time_from",d,"From"),"",n,{time_from:e.time_from||"00:00"},[this.textField("time_from")],(e=>c(e.detail.value)))}
                      ${this.renderFieldSection((0,l.kg)("editor.accordion.open_logic.time_to",d,"To"),"",n,{time_to:e.time_to||"23:59"},[this.textField("time_to")],(e=>c(e.detail.value)))}
                    `:i.qy`
                    <div class="field-container" style="margin-bottom: 16px;">
                      <div
                        class="field-title"
                        style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                      >
                        ${(0,l.kg)("editor.accordion.open_logic.template",d,"Template")}
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 12px; margin-bottom: 8px; color: var(--secondary-text-color);"
                      >
                        ${(0,l.kg)("editor.accordion.open_logic.template_desc",d,"Jinja2 template that should evaluate to true/false to open the accordion.")}
                      </div>
                      <ultra-template-editor
                        .hass=${n}
                        .value=${e.template||""}
                        .placeholder=${"{% if states('sensor.example') | int > 50 %}true{% else %}false{% endif %}"}
                        .minHeight=${100}
                        .maxHeight=${300}
                        @value-changed=${e=>c({template:e.detail.value})}
                      ></ultra-template-editor>
                    </div>
                  `)()}
              </div>
            `:""}
      </div>
    `}renderPreview(e,t,o,n){var c,s,g,u,p,v,h,_;const m=e,b=m.design||{},y=(null===(c=null==t?void 0:t.locale)||void 0===c?void 0:c.language)||"en",x=m.open_mode||"manual";let $=null;if("always"===x?$=!0:"every"!==x&&"any"!==x||(r.S.setHass(t),$=r.S.evaluateDisplayConditions(m.open_conditions||[],x)),this.accordionStates.has(m.id))null!==$&&this.accordionStates.set(m.id,$);else{const e=null!==$?$:m.default_open||!1;this.accordionStates.set(m.id,e)}const k=this.accordionStates.get(m.id)||!1;let f="";if("entity"===m.title_mode&&m.title_entity){const e=null==t?void 0:t.states[m.title_entity],o=(null===(s=null==e?void 0:e.attributes)||void 0===s?void 0:s.friendly_name)||m.title_entity.split(".")[1]||m.title_entity,i=(null==e?void 0:e.state)||m.title_entity;f=m.show_entity_name?`${o}: ${i}`:i}else f=m.title_text||"Accordion Title";const w=m.icon||"mdi:chevron-down",C=m.header_alignment||"apart",S=m.icon_side||"right";let O="space-between",j=1,F=2;"center"===C?(O="center","left"===S?(j=2,F=1):(j=1,F=2)):(O="space-between","left"===S?(j=2,F=1):(j=1,F=2));const z={border:`${null!==(g=b.container_border_width)&&void 0!==g?g:1}px solid ${b.container_border_color||"var(--divider-color)"}`,borderRadius:`${null!==(u=b.container_border_radius)&&void 0!==u?u:8}px`,overflow:"hidden",background:b.container_background_color||"var(--card-background-color)",boxShadow:b.container_shadow||"none"},T=null!==(p=b.header_padding)&&void 0!==p?p:12,q=null!==(v=b.header_border_width)&&void 0!==v?v:1,B=b.header_border_color||"var(--divider-color)",A={display:"flex",alignItems:"center",justifyContent:O,padding:`${T}px 16px`,cursor:"pointer",background:b.header_background_color||"var(--card-background-color)",color:b.header_text_color||"var(--primary-text-color)",fontSize:b.header_font_size?`${b.header_font_size}px`:"16px",fontWeight:b.header_font_weight||"normal",borderBottom:`${q}px solid ${B}`,transition:"background 0.2s",userSelect:"none",gap:"center"===C?"8px":"0"},D=null!==(h=b.content_border_width)&&void 0!==h?h:0,P=b.content_border_color||"transparent",H={maxHeight:k?"2000px":"0",overflow:"hidden",transition:"max-height 0.3s ease-in-out, padding 0.3s ease-in-out",background:b.content_background_color||"transparent",padding:k?`${b.content_padding||16}px`:"0",borderTop:D>0?`${D}px solid ${P}`:"none"},E=null!==(_=b.icon_size)&&void 0!==_?_:24,M={transform:k?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.3s ease",order:F,flexShrink:0,color:b.icon_color||"inherit"},U={order:j,flexShrink:"apart"===C?1:0,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},V=b.header_hover_color||"rgba(var(--rgb-primary-color), 0.1)",I=e=>{e.stopPropagation();const t=this.accordionStates.get(m.id)||!1;this.accordionStates.set(m.id,!t),this.triggerPreviewUpdate(!0)},L=m.modules&&m.modules.length>0,W=(0,a.oD)(),R=`accordion-${m.id.replace(/[^a-zA-Z0-9]/g,"")}`;return i.qy`
      <style>
        .${R} .ultra-accordion-header:hover {
          background: ${V} !important;
        }
      </style>
      <div
        class="ultra-accordion-container ${R}"
        style=${this.styleObjectToCss(z)}
      >
        <!-- Accordion Header -->
        <div
          class="ultra-accordion-header"
          style=${this.styleObjectToCss(A)}
          role="button"
          tabindex="0"
          aria-expanded="${k}"
          aria-label="${f}${k?", expanded":", collapsed"}"
          @click=${I}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),I(e))}}
        >
          <!-- Title -->
          <span class="ultra-accordion-title" style=${this.styleObjectToCss(U)}
            >${f}</span
          >

          <!-- Control Icon (Chevron) -->
          <ha-icon
            icon="${w}"
            style=${this.styleObjectToCss(M)+`; --mdc-icon-size: ${E}px;`}
          ></ha-icon>
        </div>

        <!-- Accordion Content -->
        <div class="ultra-accordion-content" style=${this.styleObjectToCss(H)}>
          ${k&&L?m.modules.map((e=>{var a,l,c,s,g,u;const p=W.getModule(e.type);if(!p)return i.qy`<div>Unknown module type: ${e.type}</div>`;if(r.S.setHass(t),!r.S.evaluateModuleVisibility(e))return"";const v=(null===(l=null===(a=p.metadata)||void 0===a?void 0:a.tags)||void 0===l?void 0:l.includes("pro"))||(null===(s=null===(c=p.metadata)||void 0===c?void 0:c.tags)||void 0===s?void 0:s.includes("premium"))||!1;let h=!1;const _=d.x.checkIntegrationAuth(t);return"pro"===(null===(g=null==_?void 0:_.subscription)||void 0===g?void 0:g.tier)&&"active"===(null===(u=null==_?void 0:_.subscription)||void 0===u?void 0:u.status)&&(h=!0),v&&!h?i.qy`
                    <div
                      style="padding: 16px; text-align: center; color: var(--secondary-text-color); font-style: italic; background: rgba(var(--rgb-warning-color), 0.1); border: 1px dashed var(--warning-color); border-radius: 8px; margin: 8px 0;"
                    >
                      🔒 ${p.metadata.title} - Pro Feature
                    </div>
                  `:i.qy`
                  <div class="accordion-child-module" style="margin-bottom: 8px;">
                    ${p.renderPreview(e,t,o,n)}
                  </div>
                `})):k&&!L?i.qy`
                  <div
                    style="padding: 24px; text-align: center; color: var(--secondary-text-color); font-style: italic;"
                  >
                    ${(0,l.kg)("editor.accordion.preview.no_modules",y,"No modules added. Add modules to this accordion in the Layout tab.")}
                  </div>
                `:""}
        </div>
      </div>
    `}styleObjectToCss(e){return Object.entries(e).map((([e,t])=>`${this.camelToKebab(e)}: ${t}`)).join("; ")}camelToKebab(e){return e.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}validate(e){var t,o;const i=e,n=[...super.validate(e).errors];return i.modules||n.push("Modules array is required"),"custom"!==i.title_mode||(null===(t=i.title_text)||void 0===t?void 0:t.trim())||n.push("Title text is required when using custom title mode"),"entity"!==i.title_mode||(null===(o=i.title_entity)||void 0===o?void 0:o.trim())||n.push("Title entity is required when using entity title mode"),{valid:0===n.length,errors:n}}getStyles(){return`\n      ${n.m.getSliderStyles()}\n    `}}}}]);