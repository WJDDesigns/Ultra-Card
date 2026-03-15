"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[6936],{6936:(e,t,o)=>{o.r(t),o.d(t,{UltraTabsModule:()=>d});var i=o(5183),r=o(7475),a=o(5255),n=o(230),l=o(378),s=o(6478);class d extends r.m{constructor(){super(...arguments),this.metadata={type:"tabs",title:"Tabs",description:"Tabbed container for organizing modules into switchable sections",author:"WJD Designs",version:"1.0.0",icon:"mdi:tab",category:"layout",tags:["layout","tabs","organization","container","sections"]},this.activeTabStates=new Map,this._draggedSection=null}createDefault(e,t){const o=e||this.generateId("tabs"),i=this.generateId("section");return{id:o,type:"tabs",sections:[{id:i,title:"Section 1",modules:[]},{id:this.generateId("section"),title:"Section 2",modules:[]}],orientation:"horizontal",style:"switch_1",alignment:"left",switch_on_hover:!1,default_tab:i,wrap_tabs:!1,mobile_icons_only:!1,mobile_breakpoint:600,font_size:"14px",font_weight:"500",text_transform:"none",tab_gap:4,tab_padding:"10px 16px",active_tab_color:"var(--primary-text-color)",active_tab_background:"var(--primary-color)",inactive_tab_color:"var(--secondary-text-color)",inactive_tab_background:"var(--secondary-background-color)",hover_tab_color:"var(--primary-text-color)",hover_tab_background:"rgba(var(--rgb-primary-color), 0.1)",tab_border_radius:"8px",tab_border_width:0,content_background:"transparent",content_padding:"16px",content_border_radius:"0",transition_duration:"0.2s",tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}renderGeneralTab(e,t,o,r){var a,n;const l=e,d=(null===(a=null==t?void 0:t.locale)||void 0===a?void 0:a.language)||"en";return i.qy`
      ${this.injectUcFormStyles()}
      <style>
        .section-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          background: var(--card-background-color);
          margin-bottom: 8px;
          transition: all 0.2s ease;
          overflow: visible;
          position: relative;
        }
        .section-item:hover {
          border-color: var(--primary-color);
        }
        .section-item.dragging {
          opacity: 0.5;
          border-style: dashed;
        }
        .section-item.drop-target {
          border-color: var(--primary-color);
          background: rgba(var(--rgb-primary-color), 0.1);
        }
        .drag-handle {
          cursor: grab;
          color: var(--secondary-text-color);
          padding: 4px;
        }
        .drag-handle:active {
          cursor: grabbing;
        }
        .section-title-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 14px;
          color: var(--primary-text-color);
          padding: 4px 8px;
        }
        .section-title-input:focus {
          outline: none;
          background: var(--secondary-background-color);
          border-radius: 4px;
        }
        .section-actions {
          display: flex;
          gap: 4px;
        }
        .section-action-btn {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: var(--secondary-text-color);
          border-radius: 4px;
          transition: all 0.2s;
        }
        .section-action-btn:hover {
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
        }
        .section-action-btn.delete:hover {
          color: var(--error-color);
        }
        /* Fix icon picker dropdown visibility and width */
        .section-icon-picker {
          flex-shrink: 0;
        }
        .section-icon-picker ha-icon-picker {
          --mdc-icon-size: 20px;
          --text-field-padding: 0 8px;
          width: 56px;
        }
        /* Target the vaadin combo box overlay for wider dropdown */
        .section-icon-picker vaadin-combo-box-overlay {
          width: 320px !important;
          min-width: 320px !important;
        }
        .sections-list {
          overflow: visible;
        }
        .section-item {
          overflow: visible !important;
        }
        /* Ensure parent containers don't clip the dropdown */
        .sections-manager-container {
          overflow: visible !important;
        }
        .module-general-settings {
          overflow: visible !important;
        }
        .add-section-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          border: 1px dashed var(--primary-color);
          border-radius: 8px;
          background: none;
          color: var(--primary-color);
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        .add-section-btn:hover {
          background: rgba(var(--rgb-primary-color), 0.1);
        }
        .orientation-btn,
        .style-btn {
          flex: 1;
          padding: 12px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .orientation-btn.active,
        .style-btn.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
      </style>

      <div class="module-general-settings" style="overflow: visible;">
        <!-- Inject global style for icon picker dropdown width -->
        ${this._injectIconPickerStyles()}

        <!-- Orientation Section -->
        ${this.renderSettingsSection((0,s.kg)("editor.tabs_module.orientation.title",d,"Tab Orientation"),(0,s.kg)("editor.tabs_module.orientation.desc",d,"Choose how the tabs are arranged."),[])}
        <div style="display: flex; gap: 8px; margin-bottom: 32px;">
          ${[{value:"horizontal",icon:"mdi:view-column",label:(0,s.kg)("editor.tabs_module.orientation.horizontal",d,"Horizontal")},{value:"vertical",icon:"mdi:view-sequential",label:(0,s.kg)("editor.tabs_module.orientation.vertical",d,"Vertical")}].map((e=>i.qy`
              <button
                class="orientation-btn ${(l.orientation||"horizontal")===e.value?"active":""}"
                @click=${()=>{r({orientation:e.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
              >
                <ha-icon icon="${e.icon}" style="--mdc-icon-size: 24px;"></ha-icon>
                <span style="font-size: 12px;">${e.label}</span>
              </button>
            `))}
        </div>

        <!-- Style Section -->
        ${this.renderSettingsSection((0,s.kg)("editor.tabs_module.style.title",d,"Tab Style"),(0,s.kg)("editor.tabs_module.style.desc",d,"Choose the visual style for the tabs."),[{title:(0,s.kg)("editor.tabs_module.style.type",d,"Style"),description:"",hass:t,data:{style:l.style||"switch_1"},schema:[this.selectField("style",[{value:"default",label:"Default"},{value:"simple",label:"Simple"},{value:"simple_2",label:"Simple 2"},{value:"simple_3",label:"Simple 3"},{value:"switch_1",label:"Switch 1"},{value:"switch_2",label:"Switch 2"},{value:"switch_3",label:"Switch 3"},{value:"modern",label:"Modern"},{value:"trendy",label:"Trendy"}])],onChange:e=>{e.detail.value.style!==l.style&&(r(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50))}}])}

        <!-- Alignment Section -->
        ${this.renderSettingsSection((0,s.kg)("editor.tabs_module.alignment.title",d,"Tab Alignment"),(0,s.kg)("editor.tabs_module.alignment.desc",d,"Choose how tabs are aligned within their container."),[{title:(0,s.kg)("editor.tabs_module.alignment.alignment",d,"Alignment"),description:"",hass:t,data:{alignment:l.alignment||"left"},schema:[this.selectField("alignment",[{value:"left",label:(0,s.kg)("editor.common.left",d,"Left")},{value:"center",label:(0,s.kg)("editor.common.center",d,"Center")},{value:"right",label:(0,s.kg)("editor.common.right",d,"Right")},{value:"stretch",label:(0,s.kg)("editor.common.stretch",d,"Stretch")}])],onChange:e=>{e.detail.value.alignment!==l.alignment&&(r(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50))}}])}

        <!-- Position Section -->
        ${this.renderSettingsSection((0,s.kg)("editor.tabs_module.position.title",d,"Tab Position"),(0,s.kg)("editor.tabs_module.position.desc",d,"Choose where the tabs appear relative to the content."),[{title:(0,s.kg)("editor.tabs_module.position.position",d,"Position"),description:"",hass:t,data:{tab_position:l.tab_position||("vertical"===l.orientation?"left":"top")},schema:[this.selectField("tab_position","vertical"===l.orientation?[{value:"left",label:(0,s.kg)("editor.common.left",d,"Left")},{value:"right",label:(0,s.kg)("editor.common.right",d,"Right")}]:[{value:"top",label:(0,s.kg)("editor.common.top",d,"Top")},{value:"bottom",label:(0,s.kg)("editor.common.bottom",d,"Bottom")}])],onChange:e=>{e.detail.value.tab_position!==l.tab_position&&(r(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50))}}])}

        <!-- Colors Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
          >
            ${(0,s.kg)("editor.tabs_module.colors.title",d,"Colors")}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,s.kg)("editor.tabs_module.colors.desc",d,"Customize the colors for your tabs.")}
          </div>

          <style>
            .color-section-title {
              font-size: 15px;
              font-weight: 700;
              color: var(--primary-text-color);
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            .color-grid {
              display: flex;
              gap: 16px;
            }
            .color-picker-wrapper {
              flex: 1;
              min-width: 0;
              overflow: hidden;
            }
            .color-picker-wrapper ultra-color-picker {
              --ha-select-min-width: 100%;
              width: 100%;
              display: block;
            }
            .color-picker-wrapper ultra-color-picker ha-select {
              width: 100% !important;
              max-width: 100% !important;
            }
            .color-picker-wrapper .mdc-select__selected-text {
              max-width: calc(100% - 40px) !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
            }
            .color-picker-wrapper .mdc-text-field--with-leading-icon {
              padding-inline-start: var(--text-field-suffix-padding-left, 0px);
              padding-inline-end: var(--text-field-suffix-padding-right, 0px);
            }
          </style>

          <!-- Active Tab Colors -->
          <div style="margin-bottom: 20px;">
            <div class="color-section-title">
              ${(0,s.kg)("editor.tabs_module.colors.active",d,"Active Tab")}
            </div>
            <div class="color-grid">
              <div class="color-picker-wrapper">
                <ultra-color-picker
                  .label=${(0,s.kg)("editor.tabs_module.colors.text",d,"Text")}
                  .value=${l.active_tab_color||""}
                  .defaultValue=${"var(--primary-text-color)"}
                  .hass=${t}
                  @value-changed=${e=>{r({active_tab_color:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                ></ultra-color-picker>
              </div>
              <div class="color-picker-wrapper">
                <ultra-color-picker
                  .label=${(0,s.kg)("editor.tabs_module.colors.background",d,"Background")}
                  .value=${l.active_tab_background||""}
                  .defaultValue=${"var(--primary-color)"}
                  .hass=${t}
                  @value-changed=${e=>{r({active_tab_background:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                ></ultra-color-picker>
              </div>
            </div>
          </div>

          <!-- Inactive Tab Colors -->
          <div style="margin-bottom: 20px;">
            <div class="color-section-title">
              ${(0,s.kg)("editor.tabs_module.colors.inactive",d,"Inactive Tab")}
            </div>
            <div class="color-grid">
              <div class="color-picker-wrapper">
                <ultra-color-picker
                  .label=${(0,s.kg)("editor.tabs_module.colors.text",d,"Text")}
                  .value=${l.inactive_tab_color||""}
                  .defaultValue=${"var(--secondary-text-color)"}
                  .hass=${t}
                  @value-changed=${e=>{r({inactive_tab_color:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                ></ultra-color-picker>
              </div>
              <div class="color-picker-wrapper">
                <ultra-color-picker
                  .label=${(0,s.kg)("editor.tabs_module.colors.background",d,"Background")}
                  .value=${l.inactive_tab_background||""}
                  .defaultValue=${"transparent"}
                  .hass=${t}
                  @value-changed=${e=>{r({inactive_tab_background:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                ></ultra-color-picker>
              </div>
            </div>
          </div>

          <!-- Track & Icon Colors -->
          <div>
            <div class="color-section-title">
              ${(0,s.kg)("editor.tabs_module.colors.other",d,"Track & Icons")}
            </div>
            <div class="color-grid">
              <div class="color-picker-wrapper">
                <ultra-color-picker
                  .label=${(0,s.kg)("editor.tabs_module.colors.track",d,"Track")}
                  .value=${l.track_background||""}
                  .defaultValue=${"var(--secondary-background-color)"}
                  .hass=${t}
                  @value-changed=${e=>{r({track_background:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                ></ultra-color-picker>
              </div>
              <div class="color-picker-wrapper">
                <ultra-color-picker
                  .label=${(0,s.kg)("editor.tabs_module.colors.icon",d,"Icon")}
                  .value=${l.icon_color||""}
                  .defaultValue=${"inherit"}
                  .hass=${t}
                  @value-changed=${e=>{r({icon_color:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                ></ultra-color-picker>
              </div>
            </div>
          </div>
        </div>

        <!-- Switch Behavior Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="flex: 1;">
              <div
                class="field-title"
                style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
              >
                ${(0,s.kg)("editor.tabs_module.behavior.switch_on_hover",d,"Switch on Hover")}
              </div>
              <div
                class="field-description"
                style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8; line-height: 1.4;"
              >
                ${(0,s.kg)("editor.tabs.behavior.switch_on_hover_desc",d,"Switch tabs when hovering over them instead of clicking.")}
              </div>
            </div>
            <div style="margin-left: 16px;">
              <ha-switch
                .checked=${l.switch_on_hover||!1}
                @change=${e=>{const t=e.target;r({switch_on_hover:t.checked}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
              ></ha-switch>
            </div>
          </div>
        </div>

        <!-- Responsive Options Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
          >
            ${(0,s.kg)("editor.tabs_module.responsive.title",d,"Responsive")}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,s.kg)("editor.tabs_module.responsive.desc",d,"Control how tabs behave on smaller screens or when space is limited.")}
          </div>

          <!-- Wrap Tabs Toggle -->
          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;"
          >
            <div style="flex: 1;">
              <div
                class="field-title"
                style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
              >
                ${(0,s.kg)("editor.tabs_module.responsive.wrap_tabs",d,"Wrap Tabs")}
              </div>
              <div
                class="field-description"
                style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8; line-height: 1.4;"
              >
                ${(0,s.kg)("editor.tabs_module.responsive.wrap_tabs_desc",d,"Allow tabs to wrap to multiple lines instead of overflowing.")}
              </div>
            </div>
            <div style="margin-left: 16px;">
              <ha-switch
                .checked=${l.wrap_tabs||!1}
                @change=${e=>{const t=e.target;r({wrap_tabs:t.checked}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
              ></ha-switch>
            </div>
          </div>

          <!-- Mobile Icons Only Toggle -->
          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;"
          >
            <div style="flex: 1;">
              <div
                class="field-title"
                style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
              >
                ${(0,s.kg)("editor.tabs_module.responsive.mobile_icons_only",d,"Icons Only on Mobile")}
              </div>
              <div
                class="field-description"
                style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8; line-height: 1.4;"
              >
                ${(0,s.kg)("editor.tabs_module.responsive.mobile_icons_only_desc",d,"Only show icons (hide text) on screens narrower than the breakpoint. Requires icons on tabs.")}
              </div>
            </div>
            <div style="margin-left: 16px;">
              <ha-switch
                .checked=${l.mobile_icons_only||!1}
                @change=${e=>{const t=e.target;r({mobile_icons_only:t.checked}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
              ></ha-switch>
            </div>
          </div>

          <!-- Mobile Breakpoint (conditional on mobile_icons_only) -->
          ${l.mobile_icons_only?i.qy`
                <div
                  style="border-left: 3px solid var(--primary-color); padding-left: 16px; margin-top: 8px;"
                >
                  ${this.renderSliderField((0,s.kg)("editor.tabs_module.responsive.mobile_breakpoint",d,"Mobile Breakpoint"),(0,s.kg)("editor.tabs_module.responsive.mobile_breakpoint_desc",d,"Screen width in pixels below which tabs collapse to icons only."),null!==(n=l.mobile_breakpoint)&&void 0!==n?n:600,600,320,1200,10,(e=>r({mobile_breakpoint:e})),"px")}
                </div>
              `:""}
        </div>

        <!-- Sections Manager -->
        <div
          class="settings-section sections-manager-container"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px; overflow: visible;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
          >
            ${(0,s.kg)("editor.tabs_module.sections.title",d,"Sections")}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,s.kg)("editor.tabs.sections.desc",d,"Manage your tab sections. Drag to reorder, click to edit titles.")}
          </div>

          <!-- Section List -->
          <div class="sections-list">
            ${(l.sections||[]).map(((e,o)=>this._renderSectionItem(e,o,l,t,r)))}
          </div>

          <!-- Add Section Button -->
          <button
            class="add-section-btn"
            @click=${()=>{var e;const t={id:this.generateId("section"),title:`Section ${((null===(e=l.sections)||void 0===e?void 0:e.length)||0)+1}`,modules:[]},o=[...l.sections||[],t];r({sections:o}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
          >
            <ha-icon icon="mdi:plus" style="--mdc-icon-size: 20px;"></ha-icon>
            ${(0,s.kg)("editor.tabs_module.sections.add",d,"Add Section")}
          </button>
        </div>

        <!-- Typography Section -->
        ${this.renderSettingsSection((0,s.kg)("editor.tabs_module.typography.title",d,"Typography"),(0,s.kg)("editor.tabs_module.typography.desc",d,"Configure the font settings for tab labels."),[{title:(0,s.kg)("editor.tabs_module.typography.font_size",d,"Font Size"),description:"",hass:t,data:{font_size:l.font_size||"14px"},schema:[this.textField("font_size")],onChange:e=>{r(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}},{title:(0,s.kg)("editor.tabs_module.typography.font_weight",d,"Font Weight"),description:"",hass:t,data:{font_weight:l.font_weight||"500"},schema:[this.selectField("font_weight",[{value:"300",label:"Light"},{value:"400",label:"Normal"},{value:"500",label:"Medium"},{value:"600",label:"Semi-Bold"},{value:"700",label:"Bold"}])],onChange:e=>{e.detail.value.font_weight!==l.font_weight&&(r(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50))}},{title:(0,s.kg)("editor.tabs_module.typography.text_transform",d,"Text Transform"),description:"",hass:t,data:{text_transform:l.text_transform||"none"},schema:[this.selectField("text_transform",[{value:"none",label:"None"},{value:"uppercase",label:"Uppercase"},{value:"lowercase",label:"Lowercase"},{value:"capitalize",label:"Capitalize"}])],onChange:e=>{e.detail.value.text_transform!==l.text_transform&&(r(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50))}}])}
      </div>
    `}_injectIconPickerStyles(){if(!document.getElementById("ultra-icon-picker-styles")){const e=document.createElement("style");e.id="ultra-icon-picker-styles",e.textContent='\n        vaadin-combo-box-overlay {\n          --vaadin-combo-box-overlay-width: 320px !important;\n          min-width: 320px !important;\n        }\n        vaadin-combo-box-overlay [part="content"] {\n          width: 320px !important;\n        }\n        vaadin-combo-box-overlay vaadin-combo-box-item {\n          padding: 8px !important;\n        }\n      ',document.head.appendChild(e)}return i.qy``}_renderSectionItem(e,t,o,r,a){var n,l;const d=(null===(n=null==r?void 0:r.locale)||void 0===n?void 0:n.language)||"en",c=o.sections||[],b=c.length>1,p=o.default_tab===e.id;return i.qy`
      <div
        class="section-item ${(null===(l=this._draggedSection)||void 0===l?void 0:l.id)===e.id?"dragging":""}"
        draggable="true"
        @dragstart=${t=>this._handleDragStart(t,e)}
        @dragover=${t=>this._handleDragOver(t,e)}
        @dragend=${()=>this._handleDragEnd()}
        @drop=${t=>this._handleDrop(t,e,o,a)}
      >
        <!-- Drag Handle -->
        <div class="drag-handle">
          <ha-icon icon="mdi:drag" style="--mdc-icon-size: 20px;"></ha-icon>
        </div>

        <!-- Title Input -->
        <input
          type="text"
          class="section-title-input"
          .value=${e.title}
          placeholder=${(0,s.kg)("editor.tabs_module.sections.title_placeholder",d,"Section Title")}
          @input=${o=>{const i=o.target,r=[...c];r[t]=Object.assign(Object.assign({},e),{title:i.value}),a({sections:r})}}
          @blur=${()=>this.triggerPreviewUpdate()}
        />

        <!-- Icon Picker (optional) -->
        <div class="section-icon-picker">
          <ha-icon-picker
            .hass=${r}
            .value=${e.icon||""}
            .label=${""}
            @opened-changed=${e=>{e.detail.value&&requestAnimationFrame((()=>{const e=document.querySelector("vaadin-combo-box-overlay");e&&(e.style.setProperty("--vaadin-combo-box-overlay-width","320px"),e.style.width="320px",e.style.minWidth="320px")}))}}
            @value-changed=${o=>{const i=[...c];i[t]=Object.assign(Object.assign({},e),{icon:o.detail.value}),a({sections:i}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
          ></ha-icon-picker>
        </div>

        <!-- Default Tab Indicator -->
        <button
          class="section-action-btn"
          title=${p?(0,s.kg)("editor.tabs_module.sections.is_default",d,"Default Tab"):(0,s.kg)("editor.tabs_module.sections.set_default",d,"Set as Default")}
          @click=${()=>{a({default_tab:e.id}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
          style="color: ${p?"var(--primary-color)":"var(--secondary-text-color)"}"
        >
          <ha-icon
            icon=${p?"mdi:star":"mdi:star-outline"}
            style="--mdc-icon-size: 18px;"
          ></ha-icon>
        </button>

        <!-- Section Actions -->
        <div class="section-actions">
          <!-- Duplicate -->
          <button
            class="section-action-btn"
            title=${(0,s.kg)("editor.tabs_module.sections.duplicate",d,"Duplicate")}
            @click=${()=>{const o=Object.assign(Object.assign({},e),{id:this.generateId("section"),title:`${e.title} (Copy)`,modules:JSON.parse(JSON.stringify(e.modules))}),i=[...c];i.splice(t+1,0,o),a({sections:i}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
          >
            <ha-icon icon="mdi:content-copy" style="--mdc-icon-size: 18px;"></ha-icon>
          </button>

          <!-- Delete -->
          <button
            class="section-action-btn delete"
            title=${(0,s.kg)("editor.tabs_module.sections.delete",d,"Delete")}
            ?disabled=${!b}
            @click=${()=>{if(!b)return;const i=c.filter(((e,o)=>o!==t)),r={sections:i};o.default_tab===e.id&&i.length>0&&(r.default_tab=i[0].id),a(r),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            style="opacity: ${b?1:.3}; cursor: ${b?"pointer":"not-allowed"};"
          >
            <ha-icon icon="mdi:trash-can-outline" style="--mdc-icon-size: 18px;"></ha-icon>
          </button>
        </div>
      </div>
    `}_handleDragStart(e,t){this._draggedSection=t,e.dataTransfer&&(e.dataTransfer.effectAllowed="move",e.dataTransfer.setData("text/plain",t.id));const o=e.target;setTimeout((()=>o.classList.add("dragging")),0)}_handleDragOver(e,t){e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect="move");const o=e.currentTarget;this._draggedSection&&this._draggedSection.id!==t.id&&o.classList.add("drop-target")}_handleDragEnd(){this._draggedSection=null,document.querySelectorAll(".section-item").forEach((e=>{e.classList.remove("dragging","drop-target")}))}_handleDrop(e,t,o,i){if(e.preventDefault(),!this._draggedSection||this._draggedSection.id===t.id)return;const r=[...o.sections||[]],a=r.findIndex((e=>e.id===this._draggedSection.id)),n=r.findIndex((e=>e.id===t.id));if(-1===a||-1===n)return;const[l]=r.splice(a,1);r.splice(n,0,l),i({sections:r}),this._handleDragEnd(),setTimeout((()=>this.triggerPreviewUpdate()),50)}renderDesignTab(e,t,o,r){var a,n,l,d;const c=e,b=(null===(a=null==t?void 0:t.locale)||void 0===a?void 0:a.language)||"en";return i.qy`
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
        <!-- Active Tab Design -->
        <div class="design-subsection">
          <div class="subsection-title">
            ${(0,s.kg)("editor.tabs_module.design.active_title",b,"Active Tab Design")}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,s.kg)("editor.tabs.design.active_desc",b,"Customize the appearance of the currently selected tab.")}
          </div>

          <!-- Active Tab Text Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,s.kg)("editor.tabs_module.design.active_text_color",b,"Text Color")}
              .value=${c.active_tab_color||""}
              .defaultValue=${"var(--primary-text-color)"}
              .hass=${t}
              @value-changed=${e=>{r({active_tab_color:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ultra-color-picker>
          </div>

          <!-- Active Tab Background Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,s.kg)("editor.tabs_module.design.active_bg_color",b,"Background Color")}
              .value=${c.active_tab_background||""}
              .defaultValue=${"var(--primary-color)"}
              .hass=${t}
              @value-changed=${e=>{r({active_tab_background:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ultra-color-picker>
          </div>

          <!-- Active Tab Border Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,s.kg)("editor.tabs_module.design.active_border_color",b,"Border Color")}
              .value=${c.active_tab_border_color||""}
              .defaultValue=${"transparent"}
              .hass=${t}
              @value-changed=${e=>{r({active_tab_border_color:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ultra-color-picker>
          </div>
        </div>

        <!-- Inactive Tab Design -->
        <div class="design-subsection">
          <div class="subsection-title">
            ${(0,s.kg)("editor.tabs_module.design.inactive_title",b,"Inactive Tab Design")}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,s.kg)("editor.tabs.design.inactive_desc",b,"Customize the appearance of tabs that are not selected.")}
          </div>

          <!-- Inactive Tab Text Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,s.kg)("editor.tabs_module.design.inactive_text_color",b,"Text Color")}
              .value=${c.inactive_tab_color||""}
              .defaultValue=${"var(--secondary-text-color)"}
              .hass=${t}
              @value-changed=${e=>{r({inactive_tab_color:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ultra-color-picker>
          </div>

          <!-- Inactive Tab Background Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,s.kg)("editor.tabs_module.design.inactive_bg_color",b,"Background Color")}
              .value=${c.inactive_tab_background||""}
              .defaultValue=${"var(--secondary-background-color)"}
              .hass=${t}
              @value-changed=${e=>{r({inactive_tab_background:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ultra-color-picker>
          </div>

          <!-- Inactive Tab Border Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,s.kg)("editor.tabs_module.design.inactive_border_color",b,"Border Color")}
              .value=${c.inactive_tab_border_color||""}
              .defaultValue=${"transparent"}
              .hass=${t}
              @value-changed=${e=>{r({inactive_tab_border_color:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ultra-color-picker>
          </div>
        </div>

        <!-- Hover State Design -->
        <div class="design-subsection">
          <div class="subsection-title">
            ${(0,s.kg)("editor.tabs_module.design.hover_title",b,"Hover State")}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,s.kg)("editor.tabs.design.hover_desc",b,"Customize the appearance when hovering over inactive tabs.")}
          </div>

          <!-- Hover Tab Text Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,s.kg)("editor.tabs_module.design.hover_text_color",b,"Text Color")}
              .value=${c.hover_tab_color||""}
              .defaultValue=${"var(--primary-text-color)"}
              .hass=${t}
              @value-changed=${e=>{r({hover_tab_color:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ultra-color-picker>
          </div>

          <!-- Hover Tab Background Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,s.kg)("editor.tabs_module.design.hover_bg_color",b,"Background Color")}
              .value=${c.hover_tab_background||""}
              .defaultValue=${"rgba(var(--rgb-primary-color), 0.1)"}
              .hass=${t}
              @value-changed=${e=>{r({hover_tab_background:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ultra-color-picker>
          </div>
        </div>

        <!-- Tab Styling -->
        <div class="design-subsection">
          <div class="subsection-title">
            ${(0,s.kg)("editor.tabs_module.design.tab_styling_title",b,"Tab Styling")}
          </div>

          <!-- Tab Gap -->
          ${this.renderSliderField((0,s.kg)("editor.tabs_module.design.tab_gap",b,"Gap Between Tabs"),(0,s.kg)("editor.tabs_module.design.tab_gap_desc",b,"Space between individual tabs (in pixels)."),null!==(n=c.tab_gap)&&void 0!==n?n:4,4,0,32,1,(e=>r({tab_gap:e})),"px")}

          <!-- Tab Padding -->
          ${this.renderFieldSection((0,s.kg)("editor.tabs_module.design.tab_padding",b,"Tab Padding"),(0,s.kg)("editor.tabs_module.design.tab_padding_desc",b,'Padding inside each tab (CSS value, e.g. "10px 16px").'),t,{tab_padding:c.tab_padding||"10px 16px"},[this.textField("tab_padding")],(e=>{r(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

          <!-- Tab Border Radius -->
          ${this.renderFieldSection((0,s.kg)("editor.tabs_module.design.tab_border_radius",b,"Tab Border Radius"),(0,s.kg)("editor.tabs_module.design.tab_border_radius_desc",b,'Border radius for tabs (CSS value, e.g. "8px" or "50%").'),t,{tab_border_radius:c.tab_border_radius||"8px"},[this.textField("tab_border_radius")],(e=>{r(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

          <!-- Tab Border Width -->
          ${this.renderSliderField((0,s.kg)("editor.tabs_module.design.tab_border_width",b,"Tab Border Width"),(0,s.kg)("editor.tabs_module.design.tab_border_width_desc",b,"Border width for tabs (in pixels)."),null!==(l=c.tab_border_width)&&void 0!==l?l:0,0,0,10,1,(e=>r({tab_border_width:e})),"px")}
        </div>

        <!-- Content Area Design -->
        <div class="design-subsection">
          <div class="subsection-title">
            ${(0,s.kg)("editor.tabs_module.design.content_title",b,"Content Area Design")}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,s.kg)("editor.tabs.design.content_desc",b,"Customize the appearance of the content area below/beside the tabs.")}
          </div>

          <!-- Content Background Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,s.kg)("editor.tabs_module.design.content_bg_color",b,"Background Color")}
              .value=${c.content_background||""}
              .defaultValue=${"transparent"}
              .hass=${t}
              @value-changed=${e=>{r({content_background:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ultra-color-picker>
          </div>

          <!-- Content Padding -->
          ${this.renderFieldSection((0,s.kg)("editor.tabs_module.design.content_padding",b,"Content Padding"),(0,s.kg)("editor.tabs_module.design.content_padding_desc",b,"Padding around the content area (CSS value)."),t,{content_padding:c.content_padding||"16px"},[this.textField("content_padding")],(e=>{r(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

          <!-- Content Border Radius -->
          ${this.renderFieldSection((0,s.kg)("editor.tabs_module.design.content_border_radius",b,"Content Border Radius"),(0,s.kg)("editor.tabs_module.design.content_border_radius_desc",b,"Border radius for content area (CSS value)."),t,{content_border_radius:c.content_border_radius||"0"},[this.textField("content_border_radius")],(e=>{r(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

          <!-- Content Border Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,s.kg)("editor.tabs_module.design.content_border_color",b,"Border Color")}
              .value=${c.content_border_color||""}
              .defaultValue=${"transparent"}
              .hass=${t}
              @value-changed=${e=>{r({content_border_color:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ultra-color-picker>
          </div>

          <!-- Content Border Width -->
          ${this.renderSliderField((0,s.kg)("editor.tabs_module.design.content_border_width",b,"Content Border Width"),(0,s.kg)("editor.tabs_module.design.content_border_width_desc",b,"Border width for content area (in pixels)."),null!==(d=c.content_border_width)&&void 0!==d?d:0,0,0,10,1,(e=>r({content_border_width:e})),"px")}
        </div>

        <!-- Animation -->
        <div class="design-subsection">
          <div class="subsection-title">
            ${(0,s.kg)("editor.tabs_module.design.animation_title",b,"Animation")}
          </div>

          ${this.renderFieldSection((0,s.kg)("editor.tabs_module.design.transition_duration",b,"Transition Duration"),(0,s.kg)("editor.tabs_module.design.transition_duration_desc",b,'How long tab transitions take (CSS value, e.g. "0.2s").'),t,{transition_duration:c.transition_duration||"0.2s"},[this.textField("transition_duration")],(e=>{r(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
        </div>

        <!-- Standard Design Tab Content (from GlobalDesignTab) -->
        <div style="margin-top: 24px;">
          <div
            style="font-size: 14px; font-weight: 600; color: var(--secondary-text-color); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;"
          >
            ${(0,s.kg)("editor.tabs_module.design.general_title",b,"General Container Design")}
          </div>
          ${super.renderDesignTab(e,t,o,r)}
        </div>
      </div>
    `}renderPreview(e,t,o,r){var a,n,l;const d=e,c=(null===(a=null==t?void 0:t.locale)||void 0===a?void 0:a.language)||"en",b=d.sections||[];if(0===b.length)return this.renderGradientErrorState((0,s.kg)("editor.tabs_module.preview.no_sections",c,"No Sections"),(0,s.kg)("editor.tabs_module.preview.no_sections_desc",c,"Add sections in the General tab to get started."));let p=this.activeTabStates.get(d.id);p&&b.find((e=>e.id===p))||(p=d.default_tab||(null===(n=b[0])||void 0===n?void 0:n.id),p&&this.activeTabStates.set(d.id,p));const g=b.find((e=>e.id===p))||b[0],u=d.orientation||"horizontal",v=(d.style,d.alignment||"left"),m=this._buildContainerStyles(d),h=this._buildTabsContainerStyles(d,u,v),_=this._buildContentStyles(d),x=d.tab_position||("vertical"===u?"left":"top");let y="column";y="horizontal"===u?"bottom"===x?"column-reverse":"column":"right"===x?"row-reverse":"row";const k=null!==(l=d.mobile_breakpoint)&&void 0!==l?l:600,$=`ultra-tabs-${d.id}`,f=d.mobile_icons_only?`\n        @media (max-width: ${k}px) {\n          .${$} .ultra-tab-btn .tab-text {\n            display: none !important;\n          }\n          .${$} .ultra-tab-btn {\n            padding: 10px !important;\n            min-width: unset !important;\n          }\n          .${$} .ultra-tab-btn.has-icon {\n            aspect-ratio: 1;\n          }\n        }\n      `:"";return i.qy`
      <style>
        .ultra-tabs-container {
          display: flex;
          flex-direction: ${y};
        }
        .ultra-tabs-header {
          display: flex;
          flex-direction: ${"horizontal"===u?"row":"column"};
          flex-wrap: ${d.wrap_tabs?"wrap":"nowrap"};
          overflow: ${d.wrap_tabs?"visible":"hidden"};
          /* Hide scrollbar by default */
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .ultra-tabs-header::-webkit-scrollbar {
          display: none;
        }
        .ultra-tab-btn {
          border: none;
          cursor: pointer;
          white-space: nowrap;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all ${d.transition_duration||"0.2s"} ease;
          flex-shrink: 0;
        }
        .ultra-tab-btn.icon-only {
          width: fit-content;
          min-width: unset;
          aspect-ratio: 1;
        }
        .ultra-tab-btn:hover:not(.active) {
          color: ${d.hover_tab_color||"var(--primary-text-color)"};
          background: ${d.hover_tab_background||"rgba(var(--rgb-primary-color), 0.1)"};
        }
        ${f}
      </style>

      <div class="ultra-tabs-container ${$}" style="${m}">
        <!-- Tabs Header -->
        <div
          class="ultra-tabs-header"
          style="${h}"
          role="tablist"
          aria-label="Tabs"
        >
          ${b.map((e=>this._renderTabButton(e,p,d,t)))}
        </div>

        <!-- Tab Content -->
        <div class="ultra-tabs-content" style="${_}">
          ${g?this._renderSectionContent(g,t,o,r,c):""}
        </div>
      </div>
    `}_renderTabButton(e,t,o,r){var a;const n=e.id===t,l=o.style||"switch",s=!!e.icon,d=!!(null===(a=e.title)||void 0===a?void 0:a.trim()),c=s&&!d,b=this._buildTabButtonStyles(o,n,l,c),p=t=>{t.stopPropagation(),this.activeTabStates.set(o.id,e.id),this.triggerPreviewUpdate(!0)},g=o.switch_on_hover?p:void 0,u=o.icon_color||"inherit",v="--mdc-icon-size: 18px; "+("inherit"!==u?`color: ${u};`:"");return i.qy`
      <button
        class="ultra-tab-btn ${n?"active":""} ${c?"icon-only":""} ${s?"has-icon":""}"
        style="${b}"
        role="tab"
        aria-selected="${n}"
        aria-label="${(e.title||"Tab").trim()||"Tab"}"
        tabindex="${n?0:-1}"
        @click=${p}
        @mouseenter=${g}
      >
        ${s?i.qy`<ha-icon icon="${e.icon}" style="${v}"></ha-icon>`:""}
        ${d?i.qy`<span class="tab-text">${e.title}</span>`:""}
      </button>
    `}_renderSectionContent(e,t,o,r,d="en"){const c=e.modules&&e.modules.length>0,b=(0,a.oD)();return c?i.qy`
      ${e.modules.map((e=>{var a,s,d,c,p,g;const u=b.getModule(e.type);if(!u)return i.qy`<div>Unknown module type: ${e.type}</div>`;if(n.S.setHass(t),!n.S.evaluateModuleVisibility(e))return"";const v=(null===(s=null===(a=u.metadata)||void 0===a?void 0:a.tags)||void 0===s?void 0:s.includes("pro"))||(null===(c=null===(d=u.metadata)||void 0===d?void 0:d.tags)||void 0===c?void 0:c.includes("premium"))||!1;let m=!1;const h=l.x.checkIntegrationAuth(t);if("pro"===(null===(p=null==h?void 0:h.subscription)||void 0===p?void 0:p.tier)&&"active"===(null===(g=null==h?void 0:h.subscription)||void 0===g?void 0:g.status)&&(m=!0),v&&!m)return i.qy`
            <div
              style="padding: 16px; text-align: center; color: var(--secondary-text-color); font-style: italic; background: rgba(var(--rgb-warning-color), 0.1); border: 1px dashed var(--warning-color); border-radius: 8px; margin: 8px 0;"
            >
              🔒 ${u.metadata.title} - Pro Feature
            </div>
          `;const _=e,x=_.design||{},y=_.background_color||x.background_color||"",k=_.border_radius||x.border_radius||"",$=_.border||x.border||null,f=_.backdrop_filter||x.backdrop_filter||"";let w="margin-bottom: 8px;";return y&&(w+=` background: ${y};`),k&&(w+=` border-radius: ${k};`),$&&$.style&&"none"!==$.style&&(w+=` border: ${$.width||"1px"} ${$.style} ${$.color||"var(--divider-color)"};`,$.radius&&(w+=` border-radius: ${"number"==typeof $.radius?$.radius+"px":$.radius};`)),f&&(w+=` backdrop-filter: ${f};`),i.qy`
          <div class="tab-child-module" style="${w}">
            ${u.renderPreview(e,t,o,r)}
          </div>
        `}))}
    `:i.qy`
        <div
          style="padding: 24px; text-align: center; color: var(--secondary-text-color); font-style: italic;"
        >
          ${(0,s.kg)("editor.tabs.preview.no_modules",d,"No modules added. Add modules to this section in the Layout tab.")}
        </div>
      `}_buildContainerStyles(e){const t=e.orientation||"horizontal",o=e.tab_position||("vertical"===t?"left":"top");let i="column";i="horizontal"===t?"bottom"===o?"column-reverse":"column":"right"===o?"row-reverse":"row";const r=e,a=r.design||{},n=r.background_color||a.background_color||"",l=r.border_radius||a.border_radius||"",s=r.border||a.border||null,d=r.backdrop_filter||a.backdrop_filter||"";let c=`\n      display: flex;\n      flex-direction: ${i};\n      width: 100%;\n    `;return n&&(c+=` background: ${n};`),l&&(c+=` border-radius: ${l};`),s&&s.style&&"none"!==s.style&&(c+=` border: ${s.width||"1px"} ${s.style} ${s.color||"var(--divider-color)"};`,s.radius&&(c+=` border-radius: ${"number"==typeof s.radius?s.radius+"px":s.radius};`)),d&&(c+=` backdrop-filter: ${d};`),c}_buildTabsContainerStyles(e,t,o){var i;const r=null!==(i=e.tab_gap)&&void 0!==i?i:4,a=e.style||"switch_1",n=e.wrap_tabs||!1;let l="flex-start";"center"===o?l="center":"right"===o&&(l="flex-end");const s=e.track_background||"";let d=s||"var(--secondary-background-color)",c="4px",b=e.tab_border_radius||"8px";"default"===a||"simple"===a||"simple_2"===a||"simple_3"===a?(d=s||"transparent",c="0",b="0"):"switch_2"===a?b="50px":"switch_3"===a?d=s||"rgba(0, 0, 0, 0.1)":("modern"===a||"trendy"===a)&&(d=s||"transparent",c="0");const p=e.sections||[],g=p.length>0&&p.every((e=>{var t;return!!e.icon&&!(null===(t=e.title)||void 0===t?void 0:t.trim())}));let u="";return"vertical"===t&&(u=g?"width: fit-content;":"min-width: 120px; max-width: 200px;"),`\n      display: flex;\n      flex-direction: ${"horizontal"===t?"row":"column"};\n      gap: ${r}px;\n      ${n?"flex-wrap: wrap;":"flex-wrap: nowrap;"}\n      ${"horizontal"===t&&"stretch"!==o?`justify-content: ${l};`:""}\n      ${u}\n      padding: ${c};\n      background: ${d};\n      border-radius: ${b};\n      ${"simple"===a||"default"===a?"border-bottom: 1px solid var(--divider-color);":""}\n      ${"simple_2"===a?"border-top: 1px solid var(--divider-color); border-bottom: 1px solid var(--divider-color);":""}\n    `}_buildContentStyles(e){var t;const o=e.content_padding||"16px",i=e.content_background||"transparent",r=e.content_border_radius||"0",a=e.content_border_color||"transparent",n=null!==(t=e.content_border_width)&&void 0!==t?t:0;return`\n      flex: 1;\n      padding: ${o};\n      background: ${i};\n      border-radius: ${r};\n      ${n>0?`border: ${n}px solid ${a};`:""}\n    `}_buildTabButtonStyles(e,t,o,i=!1){var r;const a=i?"10px":e.tab_padding||"10px 16px",n=e.font_size||"14px",l=e.font_weight||"500",s=e.text_transform||"none",d=e.tab_border_radius||"8px",c=null!==(r=e.tab_border_width)&&void 0!==r?r:0,b=e.transition_duration||"0.2s",p=e.alignment||"left",g=e.active_tab_color||"var(--primary-text-color)",u=e.active_tab_background||"var(--primary-color)",v=e.active_tab_border_color||"transparent",m=e.inactive_tab_color||"var(--secondary-text-color)",h=e.inactive_tab_background||"var(--secondary-background-color)",_=e.inactive_tab_border_color||"transparent";let x=t?u:h,y=t?g:m,k=c>0?`${c}px solid ${t?v:_}`:"none",$=d,f="";switch(o){case"default":x="transparent",y=t?u:m,k="none",$="0",f=t?`border-bottom: 2px solid ${u}; margin-bottom: -1px;`:"border-bottom: 2px solid transparent;";break;case"simple":x="transparent",y=t?g:m,k="none",$="0",f=t?`border-bottom: 2px solid ${u}; margin-bottom: -1px; font-weight: 600;`:"border-bottom: 2px solid transparent;";break;case"simple_2":x=t?"rgba(var(--rgb-primary-color), 0.1)":"transparent",y=t?u:m,k="none",$="0",f=t?`border-top: 2px solid ${u}; border-bottom: 2px solid ${u};`:"border-top: 2px solid transparent; border-bottom: 2px solid transparent;";break;case"simple_3":x=t?"var(--card-background-color)":"transparent",y=t?g:m,$="4px",f=t?"border: 1px solid var(--divider-color); border-bottom-color: var(--card-background-color); margin-bottom: -1px; position: relative; z-index: 1;":"border: 1px solid transparent;";break;case"switch_1":case"switch_3":default:x=t?u:"transparent",y=t?g:m;break;case"switch_2":$="50px",x=t?u:"transparent",y=t?g:m;break;case"modern":x="transparent",y=t?u:m,$="0",f=t?`position: relative; &::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 20px; height: 3px; background: ${u}; border-radius: 3px; }`:"",t&&(f=`border-bottom: 3px solid ${u}; padding-bottom: 7px;`);break;case"trendy":x=t?`linear-gradient(135deg, ${u}, color-mix(in srgb, ${u} 70%, white))`:"transparent",y=t?g:m,$="8px",f=t?"box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);":""}return`\n      padding: ${a};\n      font-size: ${n};\n      font-weight: ${l};\n      text-transform: ${s};\n      color: ${y};\n      background: ${x};\n      border-radius: ${$};\n      border: ${k};\n      transition: all ${b} ease;\n      ${f}\n      ${"stretch"===p?"flex: 1; justify-content: center;":""}\n    `}getStyles(){return`\n      ${r.m.getSliderStyles()}\n    `}validate(e){const t=super.validate(e),o=e,i=[...t.errors];if(o.sections&&0!==o.sections.length||i.push("At least one section is required"),o.sections&&o.sections.forEach(((e,t)=>{var o;e.id||i.push(`Section ${t+1} is missing an ID`);const r=!!(null===(o=e.title)||void 0===o?void 0:o.trim()),a=!!e.icon;r||a||i.push(`Section ${t+1} needs a title or an icon`)})),o.default_tab&&o.sections&&(o.sections.some((e=>e.id===o.default_tab))||i.push("Default tab references a non-existent section")),o.sections)for(const e of o.sections)if(e.modules)for(const t of e.modules)"tabs"===t.type&&i.push("Tabs modules cannot be nested inside other tabs");return{valid:0===i.length,errors:i}}}}}]);