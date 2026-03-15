"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[5308],{5308:(t,e,i)=>{i.r(e),i.d(e,{UltraInfoModule:()=>b});var n=i(5183),o=i(7475),a=i(8869),r=i(9760),l=i(5147),s=i(8938),d=i(571),c=i(5320),p=i(5262),m=i(6478),u=i(6477),g=i(6461),_=(i(7921),i(9654),i(6358),i(9327)),h=i(5121),v=i(5064),f=i(5155);class b extends o.m{constructor(){super(...arguments),this.metadata={type:"info",title:"Info Items",description:"Show entity information values",author:"WJD Designs",version:"1.0.0",icon:"mdi:information",category:"data",tags:["info","entity","data","sensors"]},this._templateInputDebounce=null,this.clickTimeout=null,this.holdTimeout=null,this.isHolding=!1}createDefault(t,e){return{id:t||this.generateId("info"),type:"info",info_entities:[{id:this.generateId("entity"),entity:"weather.forecast_home",name:"Temperature",icon:"mdi:thermometer",show_icon:!0,show_name:!0,show_state:!0,show_units:!0,text_size:14,name_size:12,icon_size:26,text_bold:!1,text_italic:!1,text_uppercase:!1,text_strikethrough:!1,name_bold:!1,name_italic:!1,name_uppercase:!1,name_strikethrough:!1,icon_color:"var(--primary-color)",name_color:"var(--secondary-text-color)",text_color:"var(--primary-text-color)",state_color:"var(--primary-text-color)",click_action:"more-info",navigation_path:"",url:"",service:"",service_data:{},template_mode:!1,template:"",dynamic_icon_template_mode:!1,dynamic_icon_template:"",dynamic_color_template_mode:!1,dynamic_color_template:"",unified_template_mode:!1,unified_template:"",ignore_entity_state_config:!1,icon_position:"left",icon_alignment:"center",name_alignment:"start",state_alignment:"start",overall_alignment:"center",icon_gap:8,name_value_layout:"vertical",name_value_gap:2,content_distribution:"normal"}],columns:1,gap:12,allow_wrap:!0,text_size:16,icon_size:24,tap_action:void 0,hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}renderGeneralTab(t,e,i,o){var a,r,l;const s=t,d=(null===(a=null==e?void 0:e.locale)||void 0===a?void 0:a.language)||"en",c=this.createDefault().info_entities[0];s.info_entities&&0!==s.info_entities.length||(s.info_entities=[Object.assign({},c)],o({info_entities:s.info_entities}));let p=s.info_entities[0]?Object.assign(Object.assign({},c),s.info_entities[0]):c;return p=Object.assign(Object.assign({},p),{icon_position:p.icon_position||"left",overall_alignment:p.overall_alignment||"center",icon_alignment:p.icon_alignment||"center",name_alignment:p.name_alignment||"start",state_alignment:p.state_alignment||"start",name_value_layout:p.name_value_layout||"vertical",name_value_gap:void 0!==p.name_value_gap?p.name_value_gap:2,content_distribution:p.content_distribution||"normal"}),n.qy`
      ${this.injectUcFormStyles()}
      <style>
        /* Layout & Positioning button active styles */
        .control-btn.active {
          border: none !important;
          background: var(--primary-color) !important;
          color: white !important;
          border-radius: 2px !important;
        }
      </style>
      <div class="module-general-settings">
        <!-- Module-Wide Size Controls -->
        <div class="settings-section" style="margin-bottom: 32px;">
          <div class="section-title">SIZE CONTROLS</div>
          <div class="section-description" style="margin-bottom: 16px;">
            Control the default text and icon sizes for this module. Design tab overrides these settings.
          </div>
          
          <!-- Text Size Control -->
          <div class="field-container" style="margin-bottom: 16px;">
            <div class="field-title">Text Size (${s.text_size||16}px)</div>
            <div class="field-description">Default size for all text elements (name, value)</div>
            <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
              <input
                type="range"
                class="gap-slider"
                min="10"
                max="48"
                step="1"
                .value="${String(s.text_size||16)}"
                @input=${t=>{const e=t.target;o({text_size:Number(e.value)}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
              />
              <input
                type="number"
                class="gap-input"
                min="10"
                max="100"
                step="1"
                .value="${String(s.text_size||16)}"
                @input=${t=>{const e=t.target,i=Number(e.value);isNaN(i)||(o({text_size:i}),setTimeout((()=>this.triggerPreviewUpdate()),50))}}
              />
              <button
                class="reset-btn"
                @click=${()=>{o({text_size:void 0}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                title="${(0,m.kg)("editor.fields.reset_default_value",d,"Reset to default ({value})").replace("{value}","16")}"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>

          <!-- Icon Size Control -->
          <div class="field-container" style="margin-bottom: 16px;">
            <div class="field-title">Icon Size (${s.icon_size||24}px)</div>
            <div class="field-description">Default size for all icons</div>
            <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
              <input
                type="range"
                class="gap-slider"
                min="12"
                max="64"
                step="1"
                .value="${String(s.icon_size||24)}"
                @input=${t=>{const e=t.target;o({icon_size:Number(e.value)}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
              />
              <input
                type="number"
                class="gap-input"
                min="12"
                max="100"
                step="1"
                .value="${String(s.icon_size||24)}"
                @input=${t=>{const e=t.target,i=Number(e.value);isNaN(i)||(o({icon_size:i}),setTimeout((()=>this.triggerPreviewUpdate()),50))}}
              />
              <button
                class="reset-btn"
                @click=${()=>{o({icon_size:void 0}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                title="${(0,m.kg)("editor.fields.reset_default_value",d,"Reset to default ({value})").replace("{value}","24")}"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Entity Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            ${(0,m.kg)("editor.info.entity_section.title",d,"ENTITY CONFIGURATION")}
          </div>

          <div style="margin-bottom: 16px;">
            <ha-form
              .hass=${e}
              .data=${{entity:p.entity||""}}
              .schema=${[{name:"entity",label:(0,m.kg)("editor.info.entity",d,"Entity"),description:(0,m.kg)("editor.info.entity_desc",d,"Select the entity to display"),selector:{entity:{}}}]}
              .computeLabel=${t=>t.label||t.name}
              .computeDescription=${t=>t.description||""}
              @value-changed=${t=>{var i,n;const a=t.detail.value.entity;a!==((null===(n=null===(i=s.info_entities)||void 0===i?void 0:i[0])||void 0===n?void 0:n.entity)||"")&&(this._handleEntityChange(s,0,a,e,o),setTimeout((()=>this.triggerPreviewUpdate()),50))}}
            ></ha-form>
          </div>
        </div>

        <!-- Icon Settings -->
        <div
          class="settings-section icon-settings"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            ${(0,m.kg)("editor.info.icon_section.title",d,"Icon Settings")}
          </div>

          <div style="margin-bottom: 16px;">
            <ha-form
              .hass=${e}
              .data=${{show_icon:!1!==p.show_icon}}
              .schema=${[{name:"show_icon",label:(0,m.kg)("editor.info.show_icon",d,"Show Icon"),description:(0,m.kg)("editor.info.show_icon_desc",d,"Display an icon next to the entity value"),selector:{boolean:{}}}]}
              .computeLabel=${t=>t.label||t.name}
              .computeDescription=${t=>t.description||""}
              @value-changed=${t=>{this._updateEntity(s,0,{show_icon:t.detail.value.show_icon},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ha-form>
          </div>

          ${!1!==p.show_icon?n.qy`
                <div style="margin-bottom: 16px;">
                  <ha-form
                    .hass=${e}
                    .data=${{icon:p.icon||""}}
                    .schema=${[{name:"icon",label:(0,m.kg)("editor.info.icon",d,"Icon"),description:(0,m.kg)("editor.info.icon_desc",d,"Choose an icon to display"),selector:{icon:{}}}]}
                    .computeLabel=${t=>t.label||t.name}
                    .computeDescription=${t=>t.description||""}
                    @value-changed=${t=>{var e,i;const n=t.detail.value.icon;n!==((null===(i=null===(e=s.info_entities)||void 0===e?void 0:e[0])||void 0===i?void 0:i.icon)||"")&&(this._updateEntity(s,0,{icon:n},o),setTimeout((()=>this.triggerPreviewUpdate()),50))}}
                  ></ha-form>
                </div>

                <div style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
                  >
                    ${(0,m.kg)("editor.info.icon_color",d,"Icon Color")}
                  </div>
                  <ultra-color-picker
                    .value=${p.icon_color||""}
                    .defaultValue=${"var(--primary-color)"}
                    .hass=${e}
                    @value-changed=${t=>{this._updateEntity(s,0,{icon_color:t.detail.value},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                  ></ultra-color-picker>
                </div>
              `:""}
        </div>

        <!-- Name Settings -->
        <div
          class="settings-section name-settings"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            ${(0,m.kg)("editor.info.name_section.title",d,"Name Settings")}
          </div>

          <div style="margin-bottom: 16px;">
            <ha-form
              .hass=${e}
              .data=${{show_name:!1!==p.show_name}}
              .schema=${[{name:"show_name",label:(0,m.kg)("editor.info.show_name",d,"Show Name"),description:(0,m.kg)("editor.info.show_name_desc",d,"Display the entity name above the value"),selector:{boolean:{}}}]}
              .computeLabel=${t=>t.label||t.name}
              .computeDescription=${t=>t.description||""}
              @value-changed=${t=>{this._updateEntity(s,0,{show_name:t.detail.value.show_name},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ha-form>
          </div>

          ${!1!==p.show_name?n.qy`
                <div style="margin-bottom: 16px;">
                  <ha-form
                    .hass=${e}
                    .data=${{name:null!==(l=null===(r=s.info_entities[0])||void 0===r?void 0:r.name)&&void 0!==l?l:""}}
                    .schema=${[{name:"name",label:(0,m.kg)("editor.info.custom_name",d,"Custom Name"),description:(0,m.kg)("editor.info.custom_name_desc",d,"Override the entity name with a custom name"),selector:{text:{}}}]}
                    .computeLabel=${t=>t.label||t.name}
                    .computeDescription=${t=>t.description||""}
                    @value-changed=${t=>{this._updateEntity(s,0,{name:t.detail.value.name},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                  ></ha-form>
                </div>

                <div style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
                  >
                    ${(0,m.kg)("editor.info.name_color",d,"Name Color")}
                  </div>
                  <ultra-color-picker
                    .value=${p.name_color||""}
                    .defaultValue=${"var(--secondary-text-color)"}
                    .hass=${e}
                    @value-changed=${t=>{this._updateEntity(s,0,{name_color:t.detail.value},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                  ></ultra-color-picker>
                </div>
              `:""}
        </div>

        <!-- State Settings -->
        <div
          class="settings-section state-settings"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            ${(0,m.kg)("editor.info.state_section.title",d,"State Settings")}
          </div>

          <div style="margin-bottom: 16px;">
            <ha-form
              .hass=${e}
              .data=${{show_state:!1!==p.show_state}}
              .schema=${[{name:"show_state",label:(0,m.kg)("editor.info.show_state",d,"Show State"),description:(0,m.kg)("editor.info.show_state_desc",d,"Display the entity state/value"),selector:{boolean:{}}}]}
              .computeLabel=${t=>t.label||t.name}
              .computeDescription=${t=>t.description||""}
              @value-changed=${t=>{this._updateEntity(s,0,{show_state:t.detail.value.show_state},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ha-form>
          </div>

          ${!1!==p.show_state?n.qy`
                <div style="margin-bottom: 16px;">
                  <ha-form
                    .hass=${e}
                    .data=${{show_units:!1!==p.show_units}}
                    .schema=${[{name:"show_units",label:(0,m.kg)("editor.info.show_units",d,"Show Units"),description:(0,m.kg)("editor.info.show_units_desc",d,"Display the unit of measurement (if available)"),selector:{boolean:{}}}]}
                    .computeLabel=${t=>t.label||t.name}
                    .computeDescription=${t=>t.description||""}
                    @value-changed=${t=>{this._updateEntity(s,0,{show_units:t.detail.value.show_units},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                  ></ha-form>
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">
                    ${(0,m.kg)("editor.info.display_attribute",d,"Display Attribute")}
                  </div>
                  <div class="field-description">
                    ${(0,m.kg)("editor.info.display_attribute_desc",d,"Show an entity attribute instead of the main state")}
                  </div>
                  ${this.renderUcForm(e,{attribute:p.attribute||""},[this.selectField("attribute",this._getEntityAttributes(p.entity,e))],(t=>{var e;const i=t.detail.value.attribute;i!==((null===(e=s.info_entities[0])||void 0===e?void 0:e.attribute)||"")&&(this._updateEntity(s,0,{attribute:i},o),setTimeout((()=>this.triggerPreviewUpdate()),50))}),!1)}
                </div>
              `:""}
          ${!1!==p.show_state?n.qy`
                <div style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
                  >
                    ${(0,m.kg)("editor.info.state_color",d,"State Color")}
                  </div>
                  <ultra-color-picker
                    .value=${p.state_color||""}
                    .defaultValue=${"var(--primary-text-color)"}
                    .hass=${e}
                    @value-changed=${t=>{this._updateEntity(s,0,{state_color:t.detail.value},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                  ></ultra-color-picker>
                </div>
              `:""}
        </div>

        <!-- Name & Value Layout Section (always shown) -->
        <div
          class="settings-section name-value-layout-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            ${(0,m.kg)("editor.info.name_value_layout.title",d,"Name & Value Layout")}
          </div>

          <div class="field-group" style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
            >
              ${(0,m.kg)("editor.info.name_value_layout.orientation",d,"Layout Direction")}
            </div>
            <div
              class="field-description"
              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; color: var(--secondary-text-color);"
            >
              ${!1===p.show_icon?(0,m.kg)("editor.info.name_value_layout.orientation_desc",d,"Choose how to display the name and value"):"left"===p.icon_position||"right"===p.icon_position?(0,m.kg)("editor.info.name_value_layout.orientation_desc_with_icon",d,"Choose how to arrange the name and value beside the icon"):(0,m.kg)("editor.info.name_value_layout.orientation_desc_vertical_icon",d,"Arrange name and value (horizontal places them on one line)")}
            </div>
            <div
              class="control-button-group"
              style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; width: 100%;"
            >
              ${[{value:"vertical",icon:"mdi:arrow-up-down",label:"Vertical"},{value:"horizontal",icon:"mdi:arrow-left-right",label:"Horizontal"}].map((t=>n.qy`
                  <button
                    type="button"
                    class="control-btn ${(p.name_value_layout||"vertical")===t.value?"active":""}"
                    @click=${()=>{this._updateEntity(s,0,{name_value_layout:t.value},o),setTimeout((()=>this.triggerPreviewUpdate()),200)}}
                    title="${t.label}"
                    style="padding: 12px 8px; gap: 8px;"
                  >
                    <ha-icon icon="${t.icon}"></ha-icon>
                    <span style="font-size: 12px;">${t.label}</span>
                  </button>
                `))}
            </div>
          </div>

          <div class="field-container" style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 8px;"
            >
              ${(0,m.kg)("editor.info.name_value_gap",d,"Name & Value Gap")}
            </div>
            <div
              class="field-description"
              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; color: var(--secondary-text-color);"
            >
              ${(0,m.kg)("editor.info.name_value_gap_desc",d,"Space between the name and value in pixels")}
            </div>
            <div
              class="gap-control-container"
              style="display: flex; align-items: center; gap: 12px;"
            >
              <input
                type="range"
                class="gap-slider"
                min="0"
                max="32"
                step="1"
                .value="${void 0!==p.name_value_gap?p.name_value_gap:2}"
                @input=${t=>{const e=t.target,i=Number(e.value);this._updateEntity(s,0,{name_value_gap:i},o),setTimeout((()=>this.triggerPreviewUpdate()),200)}}
              />
              <input
                type="number"
                class="gap-input"
                min="0"
                max="32"
                step="1"
                .value="${void 0!==p.name_value_gap?p.name_value_gap:2}"
                @input=${t=>{const e=t.target,i=Number(e.value);isNaN(i)||(this._updateEntity(s,0,{name_value_gap:i},o),setTimeout((()=>this.triggerPreviewUpdate()),200))}}
                @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,i=Number(e.value)||2,n="ArrowUp"===t.key?1:-1,a=Math.max(0,Math.min(32,i+n));this._updateEntity(s,0,{name_value_gap:a},o),setTimeout((()=>this.triggerPreviewUpdate()),200)}}}
              />
              <button
                class="reset-btn"
                @click=${()=>{this._updateEntity(s,0,{name_value_gap:2},o),setTimeout((()=>this.triggerPreviewUpdate()),200)}}
                title="${(0,m.kg)("editor.fields.reset_default_value",d,"Reset to default ({value})").replace("{value}","2")}"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Migration Banner (if legacy templates detected) -->
        ${(0,v.bk)(p)?n.qy`
              <div
                class="migration-banner"
                style="
                  background: linear-gradient(135deg, rgba(var(--rgb-primary-color), 0.1), rgba(var(--rgb-primary-color), 0.05));
                  border: 2px solid var(--primary-color);
                  border-radius: 12px;
                  padding: 20px;
                  margin-bottom: 24px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                "
              >
                <div style="display: flex; align-items: start; gap: 16px;">
                  <ha-icon
                    icon="mdi:lightbulb-on-outline"
                    style="color: var(--primary-color); font-size: 32px; flex-shrink: 0;"
                  ></ha-icon>
                  <div style="flex: 1;">
                    <div
                      style="font-size: 18px; font-weight: 700; color: var(--primary-color); margin-bottom: 8px;"
                    >
                      ${(0,m.kg)("editor.info.migration_title",d,"Template Migration Available")}
                    </div>
                    <div
                      style="font-size: 14px; color: var(--primary-text-color); margin-bottom: 12px; line-height: 1.5;"
                    >
                      ${(0,m.kg)("editor.info.migration_desc",d,"Combine your templates into one unified template for easier editing.")}
                    </div>
                    <button
                      style="
                        background: var(--primary-color);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        padding: 10px 20px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                      "
                      @click=${()=>{const t=(0,v.Xc)(p);this._updateEntity(s,0,{unified_template_mode:t.unified_template_mode,unified_template:t.unified_template,ignore_entity_state_config:t.ignore_entity_state_config,template_mode:!1,dynamic_icon_template_mode:!1,dynamic_color_template_mode:!1},o)}}
                    >
                      ${(0,m.kg)("editor.info.migrate_button",d,"Migrate to Unified Template")}
                    </button>
                  </div>
                </div>
              </div>
            `:""}

        <!-- Unified Template Section (New Preferred Method) -->
        <div class="template-section" style="margin-bottom: 24px;">
          <div class="template-header">
            <div class="switch-container">
              <div class="switch-label-row">
                <label class="switch-label"
                  >${(0,m.kg)("editor.info.unified_template_section.title",d,"Template Mode")}</label
                >
                <button
                  class="help-btn"
                  style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;background:var(--primary-color, #03a9f4);border:none;color:#fff;cursor:pointer;border-radius:50%;line-height:0;"
                  title="${(0,m.kg)("editor.info.template_cheatsheet",d,"Template Cheatsheet")}"
                  @click=${t=>{t.currentTarget.dispatchEvent(new CustomEvent("uc-open-template-cheatsheet",{detail:{module:"info"},bubbles:!0,composed:!0}))}}
                >
                  <ha-icon icon="mdi:help-circle" style="--mdc-icon-size:18px;width:18px;height:18px;color:#fff;"></ha-icon>
                </button>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  .checked=${p.unified_template_mode||!1}
                  @change=${t=>{const e=t.target.checked;this._updateEntity(s,0,{unified_template_mode:e},o)}}
                />
                <span class="slider round"></span>
              </label>
            </div>
            <div class="template-description">
              ${(0,m.kg)("editor.info.unified_template_section.desc",d,"Use Jinja2 templates to control icon and color dynamically. Uses entity context variables for seamless entity remapping.")}
            </div>
          </div>

          <!-- Cheatsheet Component (always available) -->
          <uc-template-cheatsheet .module=${"info"}></uc-template-cheatsheet>

          ${p.unified_template_mode?n.qy`
                <div 
                  class="template-content"
                  @mousedown=${t=>{const e=t.target;e.closest("ultra-template-editor")||e.closest(".cm-editor")||t.stopPropagation()}}
                  @dragstart=${t=>t.stopPropagation()}
                  @insert-snippet=${t=>{var e,i,n;const o=t.currentTarget.querySelector("ultra-template-editor");null===(e=null==o?void 0:o.insertAtCursor)||void 0===e||e.call(o,null!==(n=null===(i=t.detail)||void 0===i?void 0:i.value)&&void 0!==n?n:"")}}
                >
                  <ultra-template-editor
                    .hass=${e}
                    .value=${p.unified_template||""}
                    .placeholder=${'{\n  "icon": "{% if state|int > 25 %}mdi:fire{% else %}mdi:snowflake{% endif %}",\n  "icon_color": "{% if state|int > 25 %}red{% else %}blue{% endif %}"\n}'}
                    .minHeight=${200}
                    .maxHeight=${500}
                    @value-changed=${t=>{this._updateEntity(s,0,{unified_template:t.detail.value},o)}}
                  ></ultra-template-editor>
                  <div class="template-help">
                    <p><strong>Entity context variables available:</strong></p>
                    <ul>
                      <li>
                        <code>entity</code>, <code>state</code>, <code>name</code>,
                        <code>attributes</code>, <code>unit</code>, <code>domain</code>
                      </li>
                    </ul>
                    <p><strong>Return JSON for multiple properties:</strong></p>
                    <code
                      style="display: block; background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-size: 11px;"
                    >
                      {<br />
                      &nbsp;&nbsp;"icon": "{% if state|int > 25 %}mdi:fire{% else %}mdi:snowflake{%
                      endif %}",<br />
                      &nbsp;&nbsp;"icon_color": "red"<br />
                      }
                    </code>
                  </div>
                </div>
              `:""}
        </div>

        <!-- Size Settings -->
        <div
          class="settings-section size-settings"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            ${(0,m.kg)("editor.info.size_section.title",d,"Size Settings")}
          </div>

          <div style="display: flex; flex-direction: column; gap: 20px;">
            ${!1!==p.show_icon?n.qy`
                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">
                      ${(0,m.kg)("editor.info.icon_size",d,"Icon Size")}
                    </div>
                    <div class="field-description">
                      ${(0,m.kg)("editor.info.icon_size_desc",d,"Size of the icon in pixels")}
                    </div>
                    <div
                      class="gap-control-container"
                      style="display: flex; align-items: center; gap: 12px;"
                    >
                      <input
                        type="range"
                        class="gap-slider"
                        min="12"
                        max="48"
                        step="1"
                        .value="${Number(p.icon_size)||26}"
                        @input=${t=>{const e=t.target,i=Number(e.value);this._updateEntity(s,0,{icon_size:i},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                      />
                      <input
                        type="number"
                        class="gap-input"
                        min="12"
                        max="48"
                        step="1"
                        .value="${Number(p.icon_size)||26}"
                        @input=${t=>{const e=t.target,i=Number(e.value);isNaN(i)||(this._updateEntity(s,0,{icon_size:i},o),setTimeout((()=>this.triggerPreviewUpdate()),50))}}
                        @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,i=Number(e.value)||26,n="ArrowUp"===t.key?1:-1,a=Math.max(12,Math.min(48,i+n));this._updateEntity(s,0,{icon_size:a},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}}
                      />
                      <button
                        class="reset-btn"
                        @click=${()=>{this._updateEntity(s,0,{icon_size:26},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                        title="${(0,m.kg)("editor.fields.reset_default_value",d,"Reset to default ({value})").replace("{value}","26")}"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>
                `:""}
            ${!1!==p.show_name?n.qy`
                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">
                      ${(0,m.kg)("editor.info.name_size",d,"Name Size")}
                    </div>
                    <div class="field-description">
                      ${(0,m.kg)("editor.info.name_size_desc",d,"Size of the entity name text in pixels")}
                    </div>
                    <div
                      class="gap-control-container"
                      style="display: flex; align-items: center; gap: 12px;"
                    >
                      <input
                        type="range"
                        class="gap-slider"
                        min="8"
                        max="32"
                        step="1"
                        .value="${p.name_size||12}"
                        @input=${t=>{const e=t.target,i=Number(e.value);this._updateEntity(s,0,{name_size:i},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                      />
                      <input
                        type="number"
                        class="gap-input"
                        min="8"
                        max="32"
                        step="1"
                        .value="${p.name_size||12}"
                        @input=${t=>{const e=t.target,i=Number(e.value);isNaN(i)||(this._updateEntity(s,0,{name_size:i},o),setTimeout((()=>this.triggerPreviewUpdate()),50))}}
                        @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,i=Number(e.value)||12,n="ArrowUp"===t.key?1:-1,a=Math.max(8,Math.min(32,i+n));this._updateEntity(s,0,{name_size:a},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}}
                      />
                      <button
                        class="reset-btn"
                        @click=${()=>{this._updateEntity(s,0,{name_size:12},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                        title="${(0,m.kg)("editor.fields.reset_default_value",d,"Reset to default ({value})").replace("{value}","12")}"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>
                `:""}

            <div class="field-container" style="margin-bottom: 24px;">
              <div class="field-title">
                ${(0,m.kg)("editor.info.value_size",d,"Value Size")}
              </div>
              <div class="field-description">
                ${(0,m.kg)("editor.info.value_size_desc",d,"Size of the entity value text in pixels")}
              </div>
              <div
                class="gap-control-container"
                style="display: flex; align-items: center; gap: 12px;"
              >
                <input
                  type="range"
                  class="gap-slider"
                  min="8"
                  max="32"
                  step="1"
                  .value="${p.text_size||14}"
                  @input=${t=>{const e=t.target,i=Number(e.value);this._updateEntity(s,0,{text_size:i},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                />
                <input
                  type="number"
                  class="gap-input"
                  min="8"
                  max="32"
                  step="1"
                  .value="${p.text_size||14}"
                  @input=${t=>{const e=t.target,i=Number(e.value);isNaN(i)||(this._updateEntity(s,0,{text_size:i},o),setTimeout((()=>this.triggerPreviewUpdate()),50))}}
                  @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,i=Number(e.value)||14,n="ArrowUp"===t.key?1:-1,a=Math.max(8,Math.min(32,i+n));this._updateEntity(s,0,{text_size:a},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}}
                />
                <button
                  class="reset-btn"
                  @click=${()=>{this._updateEntity(s,0,{text_size:14},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                  title="${(0,m.kg)("editor.fields.reset_default_value",d,"Reset to default ({value})").replace("{value}","14")}"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            ${!1!==p.show_icon?n.qy`
                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">
                      ${(0,m.kg)("editor.info.icon_gap",d,"Icon Gap")}
                    </div>
                    <div class="field-description">
                      ${(0,m.kg)("editor.info.icon_gap_desc",d,"Space between the icon and content in pixels")}
                    </div>
                    <div
                      class="gap-control-container"
                      style="display: flex; align-items: center; gap: 12px;"
                    >
                      <input
                        type="range"
                        class="gap-slider"
                        min="0"
                        max="32"
                        step="1"
                        .value="${p.icon_gap||8}"
                        @input=${t=>{const e=t.target,i=Number(e.value);this._updateEntity(s,0,{icon_gap:i},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                      />
                      <input
                        type="number"
                        class="gap-input"
                        min="0"
                        max="32"
                        step="1"
                        .value="${p.icon_gap||8}"
                        @input=${t=>{const e=t.target,i=Number(e.value);isNaN(i)||(this._updateEntity(s,0,{icon_gap:i},o),setTimeout((()=>this.triggerPreviewUpdate()),50))}}
                        @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,i=Number(e.value)||8,n="ArrowUp"===t.key?1:-1,a=Math.max(0,Math.min(32,i+n));this._updateEntity(s,0,{icon_gap:a},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}}
                      />
                      <button
                        class="reset-btn"
                        @click=${()=>{this._updateEntity(s,0,{icon_gap:8},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                        title="${(0,m.kg)("editor.fields.reset_default_value",d,"Reset to default ({value})").replace("{value}","8")}"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>
                `:""}
          </div>
        </div>

        <!-- Layout & Positioning Section -->
        <div
          class="settings-section layout-positioning-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            ${(0,m.kg)("editor.info.layout_section.title",d,"Layout & Positioning")}
          </div>

          <!-- Allow Wrap Toggle -->
          <div class="field-group" style="margin-bottom: 24px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="flex: 1;">
                <div
                  class="field-title"
                  style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 4px;"
                >
                  ${(0,m.kg)("editor.info.allow_wrap",d,"Allow Wrapping")}
                </div>
                <div
                  class="field-description"
                  style="font-size: 13px !important; font-weight: 400 !important; color: var(--secondary-text-color); opacity: 0.8; line-height: 1.4;"
                >
                  ${(0,m.kg)("editor.info.allow_wrap_desc",d,"Allow grid items to wrap to new rows when they exceed the container width")}
                </div>
              </div>
              <div style="margin-left: 16px;">
                <ha-switch
                  .checked=${!1!==s.allow_wrap}
                  @change=${t=>{const e=t.target;o({allow_wrap:e.checked}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                ></ha-switch>
              </div>
            </div>
          </div>

          <!-- Icon Position -->
          <div class="field-group" style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
            >
              ${(0,m.kg)("editor.info.icon_position",d,"Icon Position")}
            </div>
            <div
              class="field-description"
              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; color: var(--secondary-text-color);"
            >
              ${(0,m.kg)("editor.info.icon_position_desc",d,"Position the icon relative to the content (left, top, right, or bottom)")}
            </div>
            <div
              class="control-button-group"
              style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; width: 100%;"
            >
              ${[{value:"left",icon:"mdi:arrow-left"},{value:"top",icon:"mdi:arrow-up"},{value:"right",icon:"mdi:arrow-right"},{value:"bottom",icon:"mdi:arrow-down"}].map((t=>n.qy`
                  <button
                    type="button"
                    class="control-btn ${(p.icon_position||"left")===t.value?"active":""}"
                    @click=${()=>{this._updateEntity(s,0,{icon_position:t.value},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                    title="${t.value.charAt(0).toUpperCase()+t.value.slice(1)}"
                  >
                    <ha-icon icon="${t.icon}"></ha-icon>
                  </button>
                `))}
            </div>
          </div>

          <!-- Content Distribution -->
          <div class="field-group" style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
            >
              ${(0,m.kg)("editor.info.content_distribution",d,"Content Distribution")}
            </div>
            <div
              class="field-description"
              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; color: var(--secondary-text-color);"
            >
              ${(0,m.kg)("editor.info.content_distribution_desc",d,"Control how icon and content are distributed along the main axis")}
            </div>
            <div
              class="control-button-group"
              style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; width: 100%;"
            >
              ${[{value:"normal",icon:"mdi:format-align-left",label:"Normal"},{value:"space-between",icon:"mdi:arrow-left-right",label:"Space Between"},{value:"space-around",icon:"mdi:arrow-expand-horizontal",label:"Space Around"},{value:"space-evenly",icon:"mdi:arrow-expand-all",label:"Space Evenly"}].map((t=>n.qy`
                  <button
                    type="button"
                    class="control-btn ${(p.content_distribution||"normal")===t.value?"active":""}"
                    @click=${()=>{this._updateEntity(s,0,{content_distribution:t.value},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                    title="${t.label}"
                  >
                    <ha-icon icon="${t.icon}"></ha-icon>
                  </button>
                `))}
            </div>
          </div>

          <!-- Overall Alignment and Name Alignment Side by Side -->
          <div
            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px; margin-bottom: 24px;"
          >
            <!-- Overall Alignment -->
            <div class="field-group">
              <div
                class="field-title"
                style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
              >
                ${(0,m.kg)("editor.info.overall_alignment",d,"Overall Alignment")}
              </div>
              <div
                class="field-description"
                style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; color: var(--secondary-text-color);"
              >
                ${(0,m.kg)("editor.info.overall_alignment_desc",d,"Align the entire info item within its container")}
              </div>
              <div
                class="control-button-group"
                style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;"
              >
                ${[{value:"left",icon:"mdi:format-align-left"},{value:"center",icon:"mdi:format-align-center"},{value:"right",icon:"mdi:format-align-right"}].map((t=>n.qy`
                    <button
                      type="button"
                      class="control-btn ${(p.overall_alignment||"center")===t.value?"active":""}"
                      @click=${()=>{this._updateEntity(s,0,{overall_alignment:t.value},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                      title="${t.value.charAt(0).toUpperCase()+t.value.slice(1)}"
                    >
                      <ha-icon icon="${t.icon}"></ha-icon>
                    </button>
                  `))}
              </div>
            </div>

            <!-- Name Alignment -->
            <div class="field-group">
              <div
                class="field-title"
                style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
              >
                ${(0,m.kg)("editor.info.name_alignment",d,"Name Alignment")}
              </div>
              <div
                class="field-description"
                style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; color: var(--secondary-text-color);"
              >
                ${(0,m.kg)("editor.info.name_alignment_desc",d,"Align the name text within its container")}
              </div>
              <div
                class="control-button-group"
                style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;"
              >
                ${[{value:"start",icon:"mdi:format-align-left"},{value:"center",icon:"mdi:format-align-center"},{value:"end",icon:"mdi:format-align-right"}].map((t=>n.qy`
                    <button
                      type="button"
                      class="control-btn ${(p.name_alignment||"start")===t.value?"active":""}"
                      @click=${()=>{this._updateEntity(s,0,{name_alignment:t.value},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                      title="${t.value.charAt(0).toUpperCase()+t.value.slice(1)}"
                    >
                      <ha-icon icon="${t.icon}"></ha-icon>
                    </button>
                  `))}
              </div>
            </div>
          </div>

          <!-- Icon Alignment and State Alignment Side by Side -->
          <div
            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px;"
          >
            <!-- Icon Alignment -->
            <div class="field-group">
              <div
                class="field-title"
                style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
              >
                ${(0,m.kg)("editor.info.icon_alignment",d,"Icon Alignment")}
              </div>
              <div
                class="field-description"
                style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; color: var(--secondary-text-color);"
              >
                ${(0,m.kg)("editor.info.icon_alignment_desc",d,"Align the icon along the cross axis")}
              </div>
              <div
                class="control-button-group"
                style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;"
              >
                ${[{value:"start",icon:"mdi:format-align-left"},{value:"center",icon:"mdi:format-align-center"},{value:"end",icon:"mdi:format-align-right"}].map((t=>n.qy`
                    <button
                      type="button"
                      class="control-btn ${(p.icon_alignment||"center")===t.value?"active":""}"
                      @click=${()=>{this._updateEntity(s,0,{icon_alignment:t.value},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                      title="${t.value.charAt(0).toUpperCase()+t.value.slice(1)}"
                    >
                      <ha-icon icon="${t.icon}"></ha-icon>
                    </button>
                  `))}
              </div>
            </div>

            <!-- State Alignment -->
            <div class="field-group">
              <div
                class="field-title"
                style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
              >
                ${(0,m.kg)("editor.info.state_alignment",d,"State Alignment")}
              </div>
              <div
                class="field-description"
                style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; color: var(--secondary-text-color);"
              >
                ${(0,m.kg)("editor.info.state_alignment_desc",d,"Align the state/value text within its container")}
              </div>
              <div
                class="control-button-group"
                style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;"
              >
                ${[{value:"start",icon:"mdi:format-align-left"},{value:"center",icon:"mdi:format-align-center"},{value:"end",icon:"mdi:format-align-right"}].map((t=>n.qy`
                    <button
                      type="button"
                      class="control-btn ${(p.state_alignment||"start")===t.value?"active":""}"
                      @click=${()=>{this._updateEntity(s,0,{state_alignment:t.value},o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                      title="${t.value.charAt(0).toUpperCase()+t.value.slice(1)}"
                    >
                      <ha-icon icon="${t.icon}"></ha-icon>
                    </button>
                  `))}
              </div>
            </div>
          </div>
        </div>
      </div>
    `}renderActionsTab(t,e,i,n){return l.A.render(t,e,(t=>n(t)))}renderLogicTab(t,e,i,n){return s.X.render(t,e,(t=>n(t)))}renderSingleActionConfig(t,e,i,o,a){const r={action_config:"nothing"===(null==i?void 0:i.action)?Object.assign(Object.assign({},i),{action:"default"}):i};return n.qy`
      <div style="margin-bottom: 16px;">
        <ha-form
          .hass=${o}
          .data=${r}
          .schema=${[{name:"action_config",label:"",selector:{ui_action:{actions:["default","more-info","toggle","navigate","url","perform-action","assist"]}}}]}
          .computeLabel=${t=>t.label||""}
          @value-changed=${t=>{var e;const i=null===(e=t.detail.value)||void 0===e?void 0:e.action_config;i&&a(i)}}
        ></ha-form>
      </div>
    `}renderSplitPreview(t,e){return this.renderPreview(t,e)}renderPreview(t,e,i,o){var a;const l=t,s=l,d=l.design||{},m={color:l.color||d.color,font_size:l.font_size||d.font_size,font_weight:l.font_weight||d.font_weight,font_style:l.font_style||d.font_style,text_transform:l.text_transform||d.text_transform,font_family:l.font_family||d.font_family,line_height:l.line_height||d.line_height,letter_spacing:l.letter_spacing||d.letter_spacing,text_align:l.text_align||d.text_align,white_space:l.white_space||d.white_space,text_shadow_h:l.text_shadow_h||d.text_shadow_h,text_shadow_v:l.text_shadow_v||d.text_shadow_v,text_shadow_blur:l.text_shadow_blur||d.text_shadow_blur,text_shadow_color:l.text_shadow_color||d.text_shadow_color,background_color:l.background_color||d.background_color,background_image:l.background_image||d.background_image,background_size:l.background_size||d.background_size,background_position:l.background_position||d.background_position,background_repeat:l.background_repeat||d.background_repeat,border_style:l.border_style||d.border_style,border_width:l.border_width||d.border_width,border_color:l.border_color||d.border_color,border_radius:l.border_radius||d.border_radius,position:l.position||d.position,top:l.top||d.top,bottom:l.bottom||d.bottom,left:l.left||d.left,right:l.right||d.right,z_index:l.z_index||d.z_index,width:l.width||d.width,height:l.height||d.height,max_width:l.max_width||d.max_width,max_height:l.max_height||d.max_height,min_width:l.min_width||d.min_width,min_height:l.min_height||d.min_height,overflow:l.overflow||d.overflow,clip_path:l.clip_path||d.clip_path,backdrop_filter:l.backdrop_filter||d.backdrop_filter,box_shadow_h:l.box_shadow_h||d.box_shadow_h,box_shadow_v:l.box_shadow_v||d.box_shadow_v,box_shadow_blur:l.box_shadow_blur||d.box_shadow_blur,box_shadow_spread:l.box_shadow_spread||d.box_shadow_spread,box_shadow_color:l.box_shadow_color||d.box_shadow_color,padding_top:l.padding_top||d.padding_top,padding_bottom:l.padding_bottom||d.padding_bottom,padding_left:l.padding_left||d.padding_left,padding_right:l.padding_right||d.padding_right,margin_top:l.margin_top||d.margin_top,margin_bottom:l.margin_bottom||d.margin_bottom,margin_left:l.margin_left||d.margin_left,margin_right:l.margin_right||d.margin_right},v=(t,e)=>null!=t&&""!==t?"string"==typeof t&&/[a-zA-Z%]/.test(t)?t:`${t}px`:null!=e?"string"==typeof e&&/[a-zA-Z%]/.test(e)?e:`${e}px`:(null==l?void 0:l.text_size)?`${l.text_size}px`:"inherit",b=(t,e)=>null!=e?"string"==typeof e&&e.includes("px")?e:`${e}px`:(null==l?void 0:l.icon_size)?`${l.icon_size}px`:"clamp(18px, 4vw, 26px)",y={padding:m.padding_top||m.padding_bottom||m.padding_left||m.padding_right||s.padding_top||s.padding_bottom||s.padding_left||s.padding_right?`${this.addPixelUnit(m.padding_top||s.padding_top)||"0px"} ${this.addPixelUnit(m.padding_right||s.padding_right)||"0px"} ${this.addPixelUnit(m.padding_bottom||s.padding_bottom)||"0px"} ${this.addPixelUnit(m.padding_left||s.padding_left)||"0px"}`:"16px",margin:m.margin_top||m.margin_bottom||m.margin_left||m.margin_right||s.margin_top||s.margin_bottom||s.margin_left||s.margin_right?`${m.margin_top||s.margin_top||"8px"} ${m.margin_right||s.margin_right||"0px"} ${m.margin_bottom||s.margin_bottom||"8px"} ${m.margin_left||s.margin_left||"0px"}`:"8px 0",border:(m.border_style||s.border_style)&&"none"!==(m.border_style||s.border_style)?`${m.border_width||s.border_width||"1px"} ${m.border_style||s.border_style} ${m.border_color||s.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(m.border_radius||s.border_radius)||"0",position:m.position||s.position||"relative",top:m.top||s.top||"auto",bottom:m.bottom||s.bottom||"auto",left:m.left||s.left||"auto",right:m.right||s.right||"auto",zIndex:m.z_index||s.z_index||"auto",width:m.width||s.width||"auto",height:m.height||s.height||"auto",maxWidth:m.max_width||s.max_width||"none",maxHeight:m.max_height||s.max_height||"none",minWidth:m.min_width||s.min_width||"none",minHeight:m.min_height||s.min_height||"auto",overflow:m.overflow||s.overflow||"visible",clipPath:m.clip_path||s.clip_path||"none",backdropFilter:m.backdrop_filter||s.backdrop_filter||"none",boxShadow:(m.box_shadow_h||s.box_shadow_h)&&(m.box_shadow_v||s.box_shadow_v)?`${m.box_shadow_h||s.box_shadow_h||"0"} ${m.box_shadow_v||s.box_shadow_v||"0"} ${m.box_shadow_blur||s.box_shadow_blur||"0"} ${m.box_shadow_spread||s.box_shadow_spread||"0"} ${m.box_shadow_color||s.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"},x=(l.info_entities||[]).filter((t=>t.entity&&""!==t.entity.trim())),w=(l.info_entities||[]).filter((t=>!t.entity||""===t.entity.trim()));let $="";for(const t of x)if(t.unified_template_mode&&t.unified_template){!this._templateService&&e&&(this._templateService=new c.I(e));const n=(0,f.KD)(t.unified_template,e,i),o=this._hashString(n),r=`unified_info_${t.entity}_${x.indexOf(t)}_${o}`,l=null===(a=null==e?void 0:e.__uvc_template_strings)||void 0===a?void 0:a[r];if(l&&""!==String(l).trim()){const t=(0,h.cv)(l);if(!(0,h.HD)(t)&&t.container_background_color){$=t.container_background_color;break}}}const{styles:k}=(0,u.U9)({color:$||m.background_color||s.background_color,fallback:s.background_color||"transparent",image:this.getBackgroundImageCSS(Object.assign(Object.assign({},s),m),e),imageSize:m.background_size||s.background_size||"cover",imagePosition:m.background_position||s.background_position||"center",imageRepeat:m.background_repeat||s.background_repeat||"no-repeat"});if(Object.assign(y,k),!l.info_entities||0===l.info_entities.length)return this.renderGradientErrorState("Configure Entities","Add info entities in the General tab","mdi:information-outline");if(0===x.length&&w.length>0){const t=w.map(((t,e)=>`Entity ${e+1}`)).join(", ");return this.renderGradientErrorState("Entities Need Configuration",t,"mdi:information-outline")}const z=(l.info_entities&&l.info_entities.length>0?Object.assign(Object.assign({},this.createDefault().info_entities[0]),l.info_entities[0]):this.createDefault().info_entities[0]).overall_alignment||"center",T=w.length>0?this.renderGradientWarningBanner((w.length>1?"entities":"entity")+" need configuration",w.length):"";return n.qy`
      ${T}
      <div
        class="info-module-container"
        style="${this.styleObjectToCss(y)}; align-self: ${"left"===z?"flex-start":"right"===z?"flex-end":"center"};"
      >
        <div class="info-module-preview">
          <div
            class="info-entities"
            style="
            display: grid;
            grid-template-columns: repeat(${l.columns||1}, 1fr);
            grid-auto-flow: ${!1===l.allow_wrap?"column":"row"};
            gap: ${l.gap||12}px;
            justify-content: ${"left"===z?"start":"right"===z?"end":"center"};
            justify-items: ${"left"===z?"start":"right"===z?"end":"center"};
          "
          >
            ${x.slice(0,3).map(((t,o)=>{var a,d,u,y,x,w,$,k;const z=this.createDefault().info_entities[0];let T=Object.assign(Object.assign({},z),t);T=Object.assign(Object.assign({},T),{icon_position:T.icon_position||"left",overall_alignment:T.overall_alignment||"center",icon_alignment:T.icon_alignment||"center",name_alignment:T.name_alignment||"start",state_alignment:T.state_alignment||"start",name_value_layout:T.name_value_layout||"vertical",name_value_gap:void 0!==T.name_value_gap?T.name_value_gap:2,content_distribution:T.content_distribution||"normal"});const S=null==e?void 0:e.states[T.entity];let U;if(T.template_mode&&T.template){if(!this._templateService&&e&&(this._templateService=new c.I(e)),e){e.__uvc_template_strings||(e.__uvc_template_strings={});const t=(0,f.KD)(T.template,e,i),n=this._hashString(t),r=`info_entity_${o}_${n}`;this._templateService&&!this._templateService.hasTemplateSubscription(r)&&this._templateService.subscribeToTemplate(t,r,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)),window._ultraCardUpdateTimer=null}),50)))}),void 0,i);const l=null===(a=e.__uvc_template_strings)||void 0===a?void 0:a[r];U=void 0!==l&&""!==String(l).trim()?String(l):"Template Error: Invalid or incomplete template"}}else if(S)if(T.attribute&&void 0!==(null===(d=S.attributes)||void 0===d?void 0:d[T.attribute])){const t=S.attributes[T.attribute];if(U=String(t),!1!==T.show_units){const t=null===(u=S.attributes)||void 0===u?void 0:u.unit_of_measurement;t&&(U+=` ${t}`)}}else U=(0,r.formatEntityState)(e,T.entity,{includeUnit:!1!==T.show_units});else U="N/A";let E=void 0!==t.name&&null!==t.name&&""!==String(t.name).trim()?String(t.name):(null===(y=null==S?void 0:S.attributes)||void 0===y?void 0:y.friendly_name)||T.entity,C=T.icon||(null===(x=null==S?void 0:S.attributes)||void 0===x?void 0:x.icon)||"mdi:help-circle",P=m.color||T.icon_color||"var(--primary-color)";if(T.unified_template_mode&&T.unified_template){!this._templateService&&e&&(this._templateService=new c.I(e));const t=(0,f.KD)(T.unified_template,e,i),n=this._hashString(t),a=`unified_info_${T.entity}_${o}_${n}`;if(e.__uvc_template_strings||(e.__uvc_template_strings={}),this._templateService&&!this._templateService.hasTemplateSubscription(a)){const n=(0,_.pL)(T.entity,e,{name:T.name,icon:T.icon});this._templateService.subscribeToTemplate(t,a,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),n,i)}const r=null===(w=null==e?void 0:e.__uvc_template_strings)||void 0===w?void 0:w[a];if(r&&""!==String(r).trim()){const t=(0,h.cv)(r);(0,h.HD)(t)||(t.icon&&(C=t.icon),t.icon_color&&(P=t.icon_color),t.name&&(T._template_name=t.name),void 0!==t.state_text&&(T._template_state_text=t.state_text),t.name_color&&(T._template_name_color=t.name_color),t.state_color&&(T._template_state_color=t.state_color),t.container_background_color&&(T._template_container_background_color=t.container_background_color))}}else if(T.dynamic_icon_template_mode&&T.dynamic_icon_template){!this._templateService&&e&&(this._templateService=new c.I(e));const t=(0,f.KD)(T.dynamic_icon_template,e,i),n=this._hashString(t),a=`dynamic_icon_info_${T.entity}_${o}_${n}`;e.__uvc_template_strings||(e.__uvc_template_strings={}),this._templateService&&!this._templateService.hasTemplateSubscription(a)&&this._templateService.subscribeToTemplate(t,a,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),void 0,i);const r=null===($=null==e?void 0:e.__uvc_template_strings)||void 0===$?void 0:$[a];r&&""!==String(r).trim()&&(C=String(r))}void 0!==T._template_name&&(E=T._template_name),void 0!==T._template_state_text&&(U=T._template_state_text);const A=T.icon_position||"left",N=T.icon_alignment||"center",D=(T.name_alignment,T.state_alignment,T.overall_alignment||"center"),j=T.icon_gap||8,I=T.content_distribution||"normal",O="normal"!==I?I:"left"===D?"flex-start":"right"===D?"flex-end":"center",q="normal"!==I?0:j,M=!1!==T.show_icon?this._shouldUseEntityPicture(S)?n.qy`
                        <img
                          src="${this._getEntityPicture(S,e)}"
                          class="entity-icon entity-picture"
                          style="
                            width: ${b(0,T.icon_size||26)};
                            height: ${b(0,T.icon_size||26)};
                            border-radius: 50%;
                            object-fit: cover;
                          "
                          alt="Entity picture"
                        />
                      `:n.qy`
                        <ha-icon
                          icon="${C}"
                          class="entity-icon"
                          style="color: ${(()=>{var t;let n=P;if(T.dynamic_color_template_mode&&T.dynamic_color_template){!this._templateService&&e&&(this._templateService=new c.I(e));const a=(0,f.KD)(T.dynamic_color_template,e,i),r=this._hashString(a),l=`dynamic_color_info_${T.entity}_${o}_${r}`;e.__uvc_template_strings||(e.__uvc_template_strings={}),this._templateService&&!this._templateService.hasTemplateSubscription(l)&&this._templateService.subscribeToTemplate(a,l,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),void 0,i);const s=null===(t=null==e?void 0:e.__uvc_template_strings)||void 0===t?void 0:t[l];s&&""!==String(s).trim()&&(n=String(s))}return n})()}; --mdc-icon-size: ${b(0,T.icon_size||26)};"
                        ></ha-icon>
                      `:"",H=()=>{const t=m.text_shadow_h||s.text_shadow_h,e=m.text_shadow_v||s.text_shadow_v,i=m.text_shadow_blur||s.text_shadow_blur,n=m.text_shadow_color||s.text_shadow_color;return t||e||i||n?`${t||"0px"} ${e||"0px"} ${i||"0px"} ${n||"rgba(0,0,0,0.2)"}`:"none"},L=T.name_value_layout||"vertical",W=void 0!==T.name_value_gap?T.name_value_gap:2,R="horizontal"===L&&"normal"!==I,G=!1!==T.show_icon&&("left"===A||"right"===A),K=!1!==T.show_name?n.qy`
                    <div
                      class="entity-name"
                      style="
                        color: ${T._template_name_color||m.color||T.name_color||"var(--secondary-text-color)"};
                        font-size: ${v(m.font_size,T.name_size||12)};
                        font-weight: ${m.font_weight||(T.name_bold?"bold":"normal")};
                        font-style: ${m.font_style||(T.name_italic?"italic":"normal")};
                        text-transform: ${m.text_transform||(T.name_uppercase?"uppercase":"none")};
                        text-decoration: ${T.name_strikethrough?"line-through":"none"};
                        font-family: ${m.font_family||"inherit"};
                        line-height: ${m.line_height||"inherit"};
                        letter-spacing: ${m.letter_spacing||"inherit"};
                        text-align: ${(t=>{if(m.text_align&&"inherit"!==m.text_align)return m.text_align;const e=t.name_alignment;return"start"===e?"left":"end"===e?"right":"center"===e?"center":"left"})(T)};
                        text-shadow: ${H()};
                        white-space: ${m.white_space||"normal"};
                        flex-shrink: 0;
                      "
                    >
                      ${E}
                    </div>
                  `:"",V=!1!==T.show_state?n.qy`
                    <div
                      class="entity-value"
                      style="
                        color: ${T._template_state_color||m.color||T.state_color||T.text_color||"var(--primary-text-color)"};
                        font-size: ${v(m.font_size,T.text_size||14)};
                        font-weight: ${m.font_weight||(T.text_bold?"bold":"normal")};
                        font-style: ${m.font_style||(T.text_italic?"italic":"normal")};
                        text-transform: ${m.text_transform||(T.text_uppercase?"uppercase":"none")};
                        text-decoration: ${T.text_strikethrough?"line-through":"none"};
                        font-family: ${m.font_family||"inherit"};
                        line-height: ${m.line_height||"inherit"};
                        letter-spacing: ${m.letter_spacing||"inherit"};
                        text-align: ${(t=>{if(m.text_align&&"inherit"!==m.text_align)return m.text_align;const e=t.state_alignment;return"start"===e?"left":"end"===e?"right":"center"===e?"center":"left"})(T)};
                        text-shadow: ${H()};
                        white-space: ${m.white_space||"normal"};
                        flex-shrink: 0;
                      "
                    >
                      ${U}
                    </div>
                  `:"",B=n.qy`
                <div
                  class="entity-content"
                  data-layout="${L}"
                  data-gap="${W}"
                  data-entity-gap="${T.name_value_gap}"
                  data-show-icon="${T.show_icon}"
                  style="
                    display: flex;
                    align-items: ${"horizontal"===L?"center":(t=>{if(m.text_align&&"inherit"!==m.text_align)return"left"===m.text_align?"flex-start":"right"===m.text_align?"flex-end":"center";const e=t.name_alignment;return"start"===e?"flex-start":"end"===e?"flex-end":"center"===e?"center":"flex-start"})(T)};
                    flex-direction: ${"horizontal"===L?"row":"column"};
                    gap: ${R&&!G?0:W}px;
                    justify-content: ${R&&!G?I:"flex-start"};
                    flex: ${R&&!G?"1":"normal"!==I?"0 0 auto":"1"};
                    width: ${R&&!G?"100%":"auto"};
                  "
                >
                  ${K}
                  ${V}
                </div>
              `,F=R&&G?n.qy`
                    <div
                      class="icon-name-group"
                      style="
                        display: flex;
                        align-items: center;
                        gap: ${j}px;
                        flex-shrink: 0;
                      "
                    >
                      ${"left"===A?n.qy`${M}${K}`:n.qy`${K}${M}`}
                    </div>
                  `:null,Z=null===(k=l.design)||void 0===k?void 0:k.hover_effect,J=p.k.getHoverEffectClass(Z),X=()=>F?n.qy`${F}${V}`:"left"===A||"top"===A?n.qy`${M}${B}`:n.qy`${B}${M}`,Y=Boolean((null==l?void 0:l.id)&&(0,g.iR)(l.id));var Q;return Q=l,Y||(null==Q?void 0:Q.tap_action)&&"nothing"!==Q.tap_action.action||(null==Q?void 0:Q.hold_action)&&"nothing"!==Q.hold_action.action||(null==Q?void 0:Q.double_tap_action)&&"nothing"!==Q.double_tap_action.action?n.qy`<div
                    class="info-entity-clickable position-${A} ${J}"
                    style="
                    display: flex;
                    width: 100%;
                    flex-direction: ${"top"===A||"bottom"===A?"column":"row"};
                    align-items: ${"start"===N?"flex-start":"end"===N?"flex-end":"center"};
                    justify-content: ${O};
                    gap: ${F?0:q}px;
                    cursor: pointer;
                    user-select: none;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                  "
                    @click=${t=>this.handleClick(t,l,e,i)}
                    @dblclick=${t=>this.handleDoubleClick(t,l,e,i)}
                    @mousedown=${t=>this.handleMouseDown(t,l,e,i)}
                    @mouseup=${t=>this.handleMouseUp(t,l,e)}
                    @mouseleave=${t=>this.handleMouseLeave(t,l,e)}
                    @touchstart=${t=>this.handleTouchStart(t,l,e,i)}
                    @touchend=${t=>this.handleTouchEnd(t,l,e,i)}
                  >
                    ${X()}
                  </div>`:n.qy`<div
                    class="info-entity-item position-${A} ${J}"
                    style="
                    display: flex;
                    width: 100%;
                    flex-direction: ${"top"===A||"bottom"===A?"column":"row"};
                    align-items: ${"start"===N?"flex-start":"end"===N?"flex-end":"center"};
                    justify-content: ${O};
                    gap: ${F?0:q}px;
                  "
                  >
                    ${X()}
                  </div>`}))}
            ${x.length>3?n.qy` <div class="more-entities">+${x.length-3} more</div> `:""}
          </div>
        </div>
      </div>
    `}validate(t){const e=t,i=[...super.validate(t).errors];return(e.info_entities||[]).forEach(((t,e)=>{t.entity&&t.entity.trim()})),{valid:0===i.length,errors:i}}getStyles(){return"\n      .info-module-preview {\n      }\n      \n      .info-entities {\n        width: 100%;\n      }\n      \n      .info-entity-item {\n        min-width: 0;\n        flex: 1;\n      }\n      \n      .entity-content {\n        display: flex;\n        min-width: 0;\n        flex: 1;\n      }\n      \n      .entity-icon {\n        flex-shrink: 0;\n      }\n      \n      .entity-name {\n        font-size: 12px;\n        line-height: 1.2;\n      }\n      \n      .entity-value {\n        font-size: 14px;\n        font-weight: 500;\n        line-height: 1.2;\n      }\n      \n      .more-entities {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        padding: 8px;\n        color: var(--secondary-text-color);\n        font-size: 12px;\n        font-style: italic;\n      }\n      \n      .info-entities-section,\n      .layout-section {\n        margin-top: 16px;\n        padding-top: 16px;\n        border-top: 1px solid var(--divider-color);\n      }\n      \n      .info-entities-section:first-child {\n        margin-top: 0;\n        padding-top: 0;\n        border-top: none;\n      }\n      \n      .info-entities-section h4,\n      .layout-section h4 {\n        margin: 0 0 12px 0;\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-text-color);\n      }\n      \n      .entity-item {\n        border: 1px solid var(--divider-color);\n        border-radius: 8px;\n        padding: 12px;\n        margin-bottom: 12px;\n        background: var(--card-background-color);\n      }\n      \n      .entity-header {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        margin-bottom: 12px;\n        font-weight: 500;\n        font-size: 14px;\n      }\n      \n      .remove-entity-btn {\n        background: none;\n        border: none;\n        color: var(--error-color);\n        cursor: pointer;\n        padding: 4px;\n        border-radius: 4px;\n        font-size: 14px;\n      }\n      \n      .remove-entity-btn:disabled {\n        opacity: 0.3;\n        cursor: not-allowed;\n      }\n      \n      .add-entity-btn {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        gap: 8px;\n        width: 100%;\n        padding: 12px;\n        border: 2px dashed var(--primary-color);\n        border-radius: 8px;\n        background: none;\n        color: var(--primary-color);\n        cursor: pointer;\n        font-size: 14px;\n        font-weight: 500;\n      }\n      \n      .add-entity-btn:hover {\n        background: var(--primary-color);\n        color: white;\n      }\n      \n      .entity-display-options {\n        display: grid;\n        grid-template-columns: 1fr 1fr;\n        gap: 8px;\n        margin: 8px 0;\n      }\n      \n      /* Control button styles */\n      .control-btn {\n        padding: 8px 4px;\n        border: 1px solid var(--divider-color);\n        background: var(--card-background-color);\n        color: var(--primary-text-color);\n        border-radius: 4px;\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        user-select: none;\n        font-size: 10px;\n      }\n      \n      .control-btn:hover:not(.active) {\n        border-color: var(--primary-color) !important;\n        background: var(--primary-color) !important;\n        color: white !important;\n        opacity: 0.8;\n      }\n      \n      .control-btn ha-icon {\n        font-size: 14px;\n      }\n      \n      .control-button-group {\n        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n        border-radius: 4px;\n        overflow: visible;\n        position: relative;\n      }\n      \n      .control-button-group .control-btn:not(:last-child) {\n        border-right: none;\n      }\n      \n      .control-button-group .control-btn:first-child {\n        border-radius: 4px 0 0 4px;\n      }\n      \n      .control-button-group .control-btn:last-child {\n        border-radius: 0 4px 4px 0;\n      }\n      \n      .control-button-group .control-btn:only-child {\n        border-radius: 4px;\n      }\n\n      .control-button-group .control-btn.active {\n        position: relative;\n        z-index: 2;\n        border-radius: 4px !important;\n      }\n      \n      /* Position-specific layout styles */\n      .position-left {\n        flex-direction: row;\n      }\n      \n      .position-right {\n        flex-direction: row-reverse;\n      }\n      \n      .position-top {\n        flex-direction: column;\n      }\n      \n      .position-bottom {\n        flex-direction: column-reverse;\n      }\n\n      /* Gap control styles */\n      .gap-control-container {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n\n      .gap-slider {\n        flex: 1;\n        height: 6px;\n        background: var(--divider-color);\n        border-radius: 3px;\n        outline: none;\n        appearance: none;\n        -webkit-appearance: none;\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n\n      .gap-slider::-webkit-slider-thumb {\n        appearance: none;\n        -webkit-appearance: none;\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider::-moz-range-thumb {\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider:hover {\n        background: var(--primary-color);\n        opacity: 0.7;\n      }\n\n      .gap-slider:hover::-webkit-slider-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-slider:hover::-moz-range-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-input {\n        width: 48px !important;\n        max-width: 48px !important;\n        min-width: 48px !important;\n        padding: 4px 6px !important;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 13px;\n        text-align: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n        box-sizing: border-box;\n      }\n\n      .gap-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);\n      }\n\n      .reset-btn {\n        width: 36px;\n        height: 36px;\n        padding: 0;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n      }\n\n      .reset-btn:hover {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n      }\n\n      .reset-btn ha-icon {\n        font-size: 16px;\n      }\n\n      /* Legacy hover effects removed - now handled by new hover effects system */\n\n      /* Template Section Styles */\n      .template-section {\n        background: var(--card-background-color);\n        border-radius: 8px;\n        padding: 16px;\n        border: 1px solid var(--divider-color);\n        margin-bottom: 32px;\n      }\n\n      .template-header {\n        margin-bottom: 16px;\n      }\n\n      .switch-container {\n        display: flex;\n        align-items: center;\n        justify-content: space-between;\n        margin-bottom: 12px;\n      }\n\n      .switch-label-row {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n      }\n\n      .switch-label {\n        font-size: 16px;\n        font-weight: 600;\n        color: var(--primary-color);\n      }\n\n      .help-btn {\n        display: inline-flex;\n        align-items: center;\n        justify-content: center;\n        width: 28px;\n        height: 28px;\n        padding: 0;\n        background: var(--primary-color) !important;\n        border: none !important;\n        color: var(--text-primary-color, white) !important;\n        cursor: pointer;\n        border-radius: 50%;\n        line-height: 0;\n      }\n\n      .help-btn:hover {\n        opacity: 0.85;\n      }\n\n      .help-btn ha-icon {\n        --mdc-icon-size: 18px;\n        width: 18px;\n        height: 18px;\n        flex-shrink: 0;\n        display: block;\n      }\n\n      /* Toggle Switch Styles */\n      .switch {\n        position: relative;\n        display: inline-block;\n        width: 44px;\n        height: 24px;\n      }\n\n      .switch input {\n        opacity: 0;\n        width: 0;\n        height: 0;\n      }\n\n      .slider {\n        position: absolute;\n        cursor: pointer;\n        top: 0;\n        left: 0;\n        right: 0;\n        bottom: 0;\n        background-color: var(--disabled-color);\n        transition: 0.3s;\n        border-radius: 24px;\n      }\n\n      .slider:before {\n        position: absolute;\n        content: \"\";\n        height: 18px;\n        width: 18px;\n        left: 3px;\n        bottom: 3px;\n        background-color: white;\n        transition: 0.3s;\n        border-radius: 50%;\n      }\n\n      input:checked + .slider {\n        background-color: var(--primary-color);\n      }\n\n      input:checked + .slider:before {\n        transform: translateX(20px);\n      }\n\n      .slider.round {\n        border-radius: 24px;\n      }\n\n      .slider.round:before {\n        border-radius: 50%;\n      }\n\n      .template-description {\n        font-size: 13px;\n        color: var(--secondary-text-color);\n        line-height: 1.4;\n        margin-bottom: 8px;\n      }\n\n      .template-content {\n        display: flex;\n        flex-direction: column;\n        gap: 8px;\n      }\n\n      .template-editor {\n        min-height: 120px;\n        font-family: 'Courier New', monospace;\n        font-size: 13px;\n        line-height: 1.4;\n        resize: vertical;\n        padding: 12px;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--code-editor-background-color, #1e1e1e);\n        color: var(--primary-text-color);\n        outline: none;\n        transition: border-color 0.2s ease;\n      }\n\n      .template-editor:focus {\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 1px var(--primary-color);\n      }\n\n      .template-help {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        font-style: italic;\n        margin-top: 4px;\n      }\n\n      .template-help p {\n        margin: 8px 0;\n        font-weight: 500;\n      }\n\n      .template-help ul {\n        margin: 4px 0;\n        padding-left: 16px;\n      }\n\n      .template-help li {\n        margin: 2px 0;\n      }\n\n      .template-help code {\n        background: rgba(var(--rgb-primary-color), 0.1);\n        padding: 2px 4px;\n        border-radius: 3px;\n        font-family: 'Courier New', monospace;\n        font-size: 11px;\n      }\n    "}hasActiveActions(t){const e=t.tap_action&&"default"!==t.tap_action.action&&"nothing"!==t.tap_action.action,i=t.hold_action&&"default"!==t.hold_action.action&&"nothing"!==t.hold_action.action,n=t.double_tap_action&&"default"!==t.double_tap_action.action&&"nothing"!==t.double_tap_action.action;return e||i||n}handleClick(t,e,i,n){t.preventDefault(),this.clickTimeout&&clearTimeout(this.clickTimeout),this.clickTimeout=setTimeout((()=>{this.handleTapAction(t,e,i,n)}),300)}handleDoubleClick(t,e,i,n){t.preventDefault(),this.clickTimeout&&(clearTimeout(this.clickTimeout),this.clickTimeout=null),this.handleDoubleAction(t,e,i,n)}handleMouseDown(t,e,i,n){this.startHold(t,e,i,n)}handleMouseUp(t,e,i){this.endHold(t,e,i)}handleMouseLeave(t,e,i){this.endHold(t,e,i)}handleTouchStart(t,e,i,n){this.startHold(t,e,i,n)}handleTouchEnd(t,e,i,n){this.endHold(t,e,i)}startHold(t,e,i,n){this.isHolding=!1,this.holdTimeout=setTimeout((()=>{this.isHolding=!0,this.handleHoldAction(t,e,i,n)}),500)}endHold(t,e,i){this.holdTimeout&&(clearTimeout(this.holdTimeout),this.holdTimeout=null),this.isHolding=!1}async handleTapAction(t,e,i,n){this.isHolding||e.tap_action&&"nothing"===e.tap_action.action||await a.K.handleAction(e.tap_action||{action:"default"},i,t.target,n,e.entity,e)}async handleDoubleAction(t,e,i,n){e.double_tap_action&&"nothing"===e.double_tap_action.action||await a.K.handleAction(e.double_tap_action||{action:"default"},i,t.target,n,e.entity,e)}async handleHoldAction(t,e,i,n){e.hold_action&&"nothing"===e.hold_action.action||await a.K.handleAction(e.hold_action||{action:"default"},i,t.target,n,e.entity,e)}_addEntity(t,e){const i={id:this.generateId("entity"),entity:"weather.forecast_home",name:"Temperature",icon:"mdi:thermometer",show_icon:!0,show_name:!0,show_state:!0,text_size:14,name_size:12,icon_size:26,text_bold:!1,text_italic:!1,text_uppercase:!1,text_strikethrough:!1,name_bold:!1,name_italic:!1,name_uppercase:!1,name_strikethrough:!1,icon_color:"var(--primary-color)",name_color:"var(--secondary-text-color)",text_color:"var(--primary-text-color)",state_color:"var(--primary-text-color)",click_action:"more-info",navigation_path:"",url:"",service:"",service_data:{},template_mode:!1,template:"",dynamic_icon_template_mode:!1,dynamic_icon_template:"",dynamic_color_template_mode:!1,dynamic_color_template:"",unified_template_mode:!1,unified_template:"",ignore_entity_state_config:!1,icon_position:"left",icon_alignment:"center",name_alignment:"start",state_alignment:"start",overall_alignment:"center",icon_gap:8,name_value_layout:"vertical",name_value_gap:2,content_distribution:"normal"},n=[...t.info_entities,i],o={info_entities:n};1!==n.length||t.tap_action&&"nothing"!==t.tap_action.action&&"default"!==t.tap_action.action||(o.tap_action={action:"more-info",entity:i.entity}),e(o)}_removeEntity(t,e,i){t.info_entities.length<=1||i({info_entities:t.info_entities.filter(((t,i)=>i!==e))})}_handleEntityChange(t,e,i,n,o){var a;const r={entity:i};if(i&&(null==n?void 0:n.states[i])){const t=(null===(a=n.states[i].attributes)||void 0===a?void 0:a.friendly_name)||i.split(".").pop()||"",e=d.s.getEntityIcon(i,n);r.name=t,e&&(r.icon=e)}const l={info_entities:t.info_entities.map(((t,i)=>i===e?Object.assign(Object.assign({},t),r):t))};i&&(null==n?void 0:n.states[i])&&(!t.tap_action||"nothing"===t.tap_action.action||"default"===t.tap_action.action||"more-info"===t.tap_action.action)&&(l.tap_action={action:"default",entity:i}),o(l),setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-actions-refresh",{detail:{moduleId:t.id},bubbles:!0,composed:!0}))}),50)}_updateEntity(t,e,i,n){if(!t.info_entities||0===t.info_entities.length){const e=this.createDefault().info_entities[0];return t.info_entities=[Object.assign(Object.assign({},e),i)],void n({info_entities:t.info_entities})}if(e>=t.info_entities.length){const i=this.createDefault().info_entities[0];for(;t.info_entities.length<=e;)t.info_entities.push(Object.assign({},i))}n({info_entities:t.info_entities.map(((t,n)=>n===e?Object.assign(Object.assign({},t),i):t))})}getBackgroundImageCSS(t,e){var i,n;if(!t.background_image_type||"none"===t.background_image_type)return"none";switch(t.background_image_type){case"upload":case"url":if(t.background_image)return`url("${t.background_image}")`;break;case"entity":if(t.background_image_entity&&(null==e?void 0:e.states[t.background_image_entity])){const o=e.states[t.background_image_entity];let a="";if((null===(i=o.attributes)||void 0===i?void 0:i.entity_picture)?a=o.attributes.entity_picture:(null===(n=o.attributes)||void 0===n?void 0:n.image)?a=o.attributes.image:o.state&&"string"==typeof o.state&&(o.state.startsWith("/")||o.state.startsWith("http"))&&(a=o.state),a)return a.startsWith("/local/")||a.startsWith("/media/")||a.startsWith("/"),`url("${a}")`}}return"none"}styleObjectToCss(t){return Object.entries(t).map((([t,e])=>`${t.replace(/[A-Z]/g,(t=>`-${t.toLowerCase()}`))}: ${e}`)).join("; ")}addPixelUnit(t){if(!t&&0!==t)return t;const e=String(t);return/^\d+$/.test(e)?`${e}px`:/^[\d\s]+$/.test(e)?e.split(" ").map((t=>t.trim()?`${t}px`:t)).join(" "):e}_hashString(t){let e=0;for(let i=0;i<t.length;i+=1)e=(e<<5)-e+t.charCodeAt(i),e|=0;return Math.abs(e)}async _handleTemplateChange(t,e,i,n){t&&n&&(this._templateInputDebounce&&clearTimeout(this._templateInputDebounce),this._templateInputDebounce=setTimeout((async()=>{try{const e=t.trim();if(!e.startsWith("{{")||!e.endsWith("}}"))return;const o=await n.callApi("POST","template",{template:t});n.__uvc_template_strings||(n.__uvc_template_strings={});const a=this._hashString(t),r=`info_entity_${i}_${a}`;n.__uvc_template_strings[r]=o,"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}catch(t){}}),3e3))}_getEntityPicture(t,e){var i,n;if(!t||!e)return null;if(!t.entity_id)return null;const o=null===(i=t.attributes)||void 0===i?void 0:i.entity_picture;if(o)return o.startsWith("/")?`${(e.hassUrl?e.hassUrl():"").replace(/\/$/,"")}${o}`:o;const a=["image","picture","thumbnail","avatar","photo","icon_url","image_url"];for(const i of a){const o=null===(n=t.attributes)||void 0===n?void 0:n[i];if(o&&"string"==typeof o)return o.startsWith("/")?`${(e.hassUrl?e.hassUrl():"").replace(/\/$/,"")}${o}`:o}return null}_shouldUseEntityPicture(t){var e;return!!t&&(!!t.entity_id&&(!!(null===(e=t.attributes)||void 0===e?void 0:e.entity_picture)||["image","picture","thumbnail","avatar","photo","icon_url","image_url"].some((e=>{var i;return(null===(i=t.attributes)||void 0===i?void 0:i[e])&&"string"==typeof t.attributes[e]&&""!==t.attributes[e].trim()}))))}_getEntityAttributes(t,e){var i;const n=[{value:"",label:"None (Use Entity State)"}];try{if(!t||!(null===(i=null==e?void 0:e.states)||void 0===i?void 0:i[t]))return n;const o=e.states[t].attributes||{};return Object.keys(o).forEach((t=>{if(!t.startsWith("_")&&"friendly_name"!==t&&"entity_picture"!==t&&"supported_features"!==t&&"device_class"!==t&&"state_class"!==t){const e=o[t];let i="";i=null==e?"null":"object"==typeof e?Array.isArray(e)?`[${e.length} items]`:"{object}":String(e).substring(0,20),n.push({value:t,label:`${t} (${i})`})}})),n}catch(t){return console.error("Error getting attributes:",t),n}}}}}]);