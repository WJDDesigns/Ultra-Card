"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[8780],{8780:(t,e,o)=>{o.r(e),o.d(e,{UltraToggleModule:()=>d});var i=o(5183),a=o(7475),n=o(766),r=o(5147),l=o(8938),c=o(6478),s=o(5320);o(7921);class d extends a.m{constructor(){super(...arguments),this.metadata={type:"toggle",title:"Toggle",description:"Interactive toggles and multi-state switchers with custom actions",author:"WJD Designs",version:"1.0.0",icon:"mdi:toggle-switch",category:"interactive",tags:["toggle","switch","button","state","control","interactive"]},this._expandedTogglePoints=new Set,this._draggedItem=null,this._actionFormChangeGuard=!1,this._templateService=null,this._templateMatchCache=new Map}createDefault(t,e){const o={id:this.generateId("toggle_point"),label:"Off",icon:"mdi:power-off",tap_action:{action:"nothing"},background_color:"var(--secondary-background-color)",text_color:"var(--primary-text-color)",active_background_color:"var(--error-color)",active_text_color:"white"},i={id:this.generateId("toggle_point"),label:"On",icon:"mdi:power-on",tap_action:{action:"nothing"},background_color:"var(--secondary-background-color)",text_color:"var(--primary-text-color)",active_background_color:"var(--primary-color)",active_text_color:"white"};return{id:t||this.generateId("toggle"),type:"toggle",toggle_points:[o,i],visual_style:"segmented",title:"Toggle",show_title:!1,orientation:"horizontal",alignment:"center",size:"normal",spacing:8,show_icons:!0,icon_size:"24px",icon_position:"left",default_background_color:"var(--secondary-background-color)",default_text_color:"var(--primary-text-color)",default_active_background_color:"var(--primary-color)",default_active_text_color:"white",tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}validate(t){const e=t,o=[...super.validate(t).errors];return(!e.toggle_points||e.toggle_points.length<2)&&o.push("Toggle module must have at least 2 toggle points"),"ios_toggle"===e.visual_style&&2!==e.toggle_points.length&&o.push("iOS toggle style requires exactly 2 toggle points"),e.toggle_points&&e.toggle_points.forEach(((t,e)=>{t.label&&""!==t.label.trim()||o.push(`Toggle point ${e+1} must have a label`)})),{valid:0===o.length,errors:o}}renderActionsTab(t,e,o,i){return r.A.render(t,e,(t=>i(t)))}renderLogicTab(t,e,o,i){return l.X.render(t,e,(t=>i(t)))}renderGeneralTab(t,e,o,a){var r;const l=t,s=(null===(r=null==e?void 0:e.locale)||void 0===r?void 0:r.language)||"en";return this._hass=e,i.qy`
      ${this.injectUcFormStyles()}
      <style>
        .settings-section {
          background: var(--secondary-background-color);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--primary-color);
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--primary-color);
          letter-spacing: 0.5px;
        }

        .toggle-point-rows-container {
          margin-top: 16px;
        }

        .toggle-point-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: var(--card-background-color);
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: move;
          border: 1px solid var(--divider-color);
          transition: all 0.2s ease;
        }

        .toggle-point-row:hover {
          background: var(--primary-color);
          opacity: 0.9;
        }

        .toggle-point-row.currently-active {
          border-left: 4px solid var(--success-color);
          background: rgba(var(--rgb-success-color), 0.1);
        }

        .toggle-point-row.dragging {
          opacity: 0.5;
          transform: scale(0.95);
        }

        .toggle-point-row.drag-over {
          border-top: 3px solid var(--primary-color);
        }

        .drag-handle {
          cursor: grab;
          color: var(--secondary-text-color);
          flex-shrink: 0;
        }

        .drag-handle:active {
          cursor: grabbing;
        }

        .toggle-point-info {
          flex: 1;
          font-size: 14px;
          color: var(--primary-text-color);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .toggle-point-info.no-label {
          color: var(--secondary-text-color);
          font-style: italic;
        }

        .expand-icon {
          cursor: pointer;
          color: var(--primary-color);
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }

        .expand-icon.expanded {
          transform: rotate(180deg);
        }

        .delete-icon {
          cursor: pointer;
          color: var(--error-color);
          flex-shrink: 0;
        }

        .delete-icon:hover {
          opacity: 0.7;
        }

        .toggle-point-settings {
          padding: 16px;
          background: rgba(var(--rgb-primary-color), 0.05);
          border-left: 3px solid var(--primary-color);
          border-radius: 0 8px 8px 0;
          margin-bottom: 8px;
          animation: slideDown 0.3s ease;
          overflow: visible;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .add-toggle-point-btn {
          width: 100%;
          padding: 12px;
          background: var(--primary-color);
          color: var(--text-primary-color);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .add-toggle-point-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .color-controls {
          display: grid;
          gap: 16px;
        }

        /* Ensure ha-form dropdowns render properly */
        ha-form {
          display: block;
        }

        ha-select {
          position: relative;
          overflow: visible;
          z-index: 9999;
        }

        ha-select mwc-menu {
          position: fixed !important;
          z-index: 10001 !important;
        }
      </style>

      <div class="module-settings">
        <!-- Display Settings Section -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,c.kg)("editor.toggle.display_settings",s,"DISPLAY SETTINGS")}
          </div>

          ${this.renderSettingsSection("","",[{title:(0,c.kg)("editor.toggle.title",s,"Title"),description:(0,c.kg)("editor.toggle.title_desc",s,"Title to display above the toggle"),hass:e,data:{title:l.title||"Toggle"},schema:[this.textField("title")],onChange:t=>a({title:t.detail.value.title})},{title:(0,c.kg)("editor.toggle.show_title",s,"Show Title"),description:(0,c.kg)("editor.toggle.show_title_desc",s,"Display the title above the toggle"),hass:e,data:{show_title:l.show_title},schema:[this.booleanField("show_title")],onChange:t=>a({show_title:t.detail.value.show_title})}])}
          ${this.renderFieldSection((0,c.kg)("editor.toggle.visual_style",s,"Visual Style"),(0,c.kg)("editor.toggle.visual_style_desc",s,"How the toggle should be displayed"),e,{visual_style:l.visual_style||"segmented"},[this.selectField("visual_style",[{value:"ios_toggle",label:"Basic Toggle (2 states only)"},{value:"segmented",label:"Segmented Control"},{value:"button_group",label:"Button Group"},{value:"slider_track",label:"Slider Track"},{value:"timeline",label:"Timeline"},{value:"minimal",label:"Minimal"}])],(t=>{const e=t.detail.value.visual_style;e!==(l.visual_style||"segmented")&&(a({visual_style:e}),setTimeout((()=>this.triggerPreviewUpdate()),50))}))}
          ${this.renderFieldSection((0,c.kg)("editor.toggle.orientation",s,"Orientation"),(0,c.kg)("editor.toggle.orientation_desc",s,"Layout direction of toggle points"),e,{orientation:l.orientation||"horizontal"},[this.selectField("orientation",[{value:"horizontal",label:"Horizontal"},{value:"vertical",label:"Vertical"}])],(t=>{const e=t.detail.value.orientation;e!==(l.orientation||"horizontal")&&(a({orientation:e}),setTimeout((()=>this.triggerPreviewUpdate()),50))}))}
          ${this.renderFieldSection((0,c.kg)("editor.toggle.alignment",s,"Alignment"),(0,c.kg)("editor.toggle.alignment_desc",s,"How the toggle is aligned within its container"),e,{alignment:l.alignment||"center"},[this.selectField("alignment",[{value:"left",label:"Left"},{value:"center",label:"Center"},{value:"right",label:"Right"},{value:"justify",label:"Justify (Full Width)"}])],(t=>{const e=t.detail.value.alignment;e!==(l.alignment||"center")&&(a({alignment:e}),setTimeout((()=>this.triggerPreviewUpdate()),50))}))}
          ${this.renderFieldSection((0,c.kg)("editor.toggle.size",s,"Size"),(0,c.kg)("editor.toggle.size_desc",s,"Size of the toggle control"),e,{size:l.size||"normal"},[this.selectField("size",[{value:"compact",label:"Compact"},{value:"normal",label:"Normal"},{value:"large",label:"Large"}])],(t=>{const e=t.detail.value.size;e!==(l.size||"normal")&&(a({size:e}),setTimeout((()=>this.triggerPreviewUpdate()),50))}))}

          <div class="field-container" style="margin-bottom: 16px;">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
              ${(0,c.kg)("editor.toggle.spacing",s,"Spacing")}
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;"
            >
              ${(0,c.kg)("editor.toggle.spacing_desc",s,"Gap between toggle points in pixels")}
            </div>
            <div
              class="gap-control-container"
              style="display: flex; align-items: center; gap: 12px;"
            >
              <input
                type="range"
                class="gap-slider"
                min="0"
                max="100"
                step="1"
                .value="${String(l.spacing||8)}"
                @input=${t=>{const e=t.target,o=Number(e.value);a({spacing:o}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
              />
              <input
                type="number"
                class="gap-input"
                .value="${String(l.spacing||8)}"
                @input=${t=>{const e=t.target,o=Number(e.value);isNaN(o)||(a({spacing:o}),setTimeout((()=>this.triggerPreviewUpdate()),50))}}
              />
              <button
                class="reset-btn"
                @click=${()=>{a({spacing:8}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                title="Reset to default (8)"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Setup Section -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,c.kg)("editor.toggle.quick_setup",s,"QUICK SETUP")}
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 16px;">
            ${(0,c.kg)("editor.toggle.quick_setup_desc",s,"Automatically create toggle points based on an entity type (replaces existing points)")}
          </div>

          ${n.U.renderFieldSection((0,c.kg)("editor.toggle.quick_setup_entity",s,"Select Entity"),(0,c.kg)("editor.toggle.quick_setup_entity_desc",s,'Choose an entity, then click "Create Toggle Points" below to auto-generate points based on the entity type'),e,{quick_setup_entity:this._quickSetupEntity||""},[n.U.entity("quick_setup_entity")],(t=>{const e=t.detail.value.quick_setup_entity;this._quickSetupEntity=e}))}
          ${this._quickSetupEntity?i.qy`
                <button
                  class="add-toggle-point-btn"
                  style="margin-top: 12px; background: var(--success-color);"
                  @click=${()=>{this.quickSetupFromEntity(this._quickSetupEntity,l,e,a),this._quickSetupEntity=void 0}}
                >
                  <ha-icon icon="mdi:auto-fix"></ha-icon>
                  ${(0,c.kg)("editor.toggle.create_toggle_points",s,"Create Toggle Points")}
                </button>
                <div
                  style="font-size: 11px; color: var(--warning-color); margin-top: 8px; padding: 8px; background: rgba(var(--rgb-warning-color), 0.1); border-radius: 4px;"
                >
                  <ha-icon icon="mdi:alert" style="--mdc-icon-size: 14px;"></ha-icon>
                  ${(0,c.kg)("editor.toggle.quick_setup_warning",s,"This will replace all existing toggle points with auto-generated ones based on the entity type.")}
                </div>
              `:""}
        </div>

        <!-- Entity Tracking Section -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,c.kg)("editor.toggle.entity_tracking",s,"ADVANCED TRACKING")}
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 16px;">
            ${(0,c.kg)("editor.toggle.entity_tracking_desc",s,'Optional: Set a shared entity to track across all toggle points. Use "Quick Setup" above to auto-create toggle points — this field does NOT create them.')}
          </div>

          ${n.U.renderFieldSection((0,c.kg)("editor.toggle.tracking_entity",s,"Global Tracking Entity"),(0,c.kg)("editor.toggle.tracking_entity_desc",s,"The entity whose state determines the active toggle point. Toggle points with a matching match_state (or no match_entity set) will be compared against this entity."),e,{tracking_entity:l.tracking_entity||""},[n.U.entity("tracking_entity")],(t=>a({tracking_entity:t.detail.value.tracking_entity})))}
        </div>

        <!-- Icon Settings Section -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,c.kg)("editor.toggle.icon_settings",s,"ICON SETTINGS")}
          </div>

          ${this.renderSettingsSection("","",[{title:(0,c.kg)("editor.toggle.show_icons",s,"Show Icons"),description:(0,c.kg)("editor.toggle.show_icons_desc",s,"Display icons on toggle points"),hass:e,data:{show_icons:l.show_icons},schema:[this.booleanField("show_icons")],onChange:t=>a({show_icons:t.detail.value.show_icons})}])}
          ${l.show_icons?i.qy`
                ${n.U.renderFieldSection((0,c.kg)("editor.toggle.icon_size",s,"Icon Size"),(0,c.kg)("editor.toggle.icon_size_desc",s,"Size of icons in pixels"),e,{icon_size:l.icon_size||"24px"},[n.U.text("icon_size")],(t=>a({icon_size:t.detail.value.icon_size})))}
                ${this.renderFieldSection((0,c.kg)("editor.toggle.icon_position",s,"Icon Position"),(0,c.kg)("editor.toggle.icon_position_desc",s,"Position of icons relative to labels"),e,{icon_position:l.icon_position||"left"},[this.selectField("icon_position",[{value:"above",label:"Above"},{value:"left",label:"Left"},{value:"right",label:"Right"},{value:"below",label:"Below"}])],(t=>{const e=t.detail.value.icon_position;e!==(l.icon_position||"left")&&(a({icon_position:e}),setTimeout((()=>this.triggerPreviewUpdate()),50))}))}
              `:""}
        </div>

        <!-- Default Colors Section -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,c.kg)("editor.toggle.default_colors",s,"DEFAULT COLORS")}
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 16px;">
            ${(0,c.kg)("editor.toggle.default_colors_desc",s,"Default colors for toggle points (can be overridden per point)")}
          </div>

          <div class="color-controls">
            <ultra-color-picker
              .label=${(0,c.kg)("editor.toggle.default_background_color",s,"Background Color")}
              .value=${l.default_background_color||"var(--secondary-background-color)"}
              .defaultValue=${"var(--secondary-background-color)"}
              .hass=${e}
              @value-changed=${t=>a({default_background_color:t.detail.value})}
            ></ultra-color-picker>

            <ultra-color-picker
              .label=${(0,c.kg)("editor.toggle.default_text_color",s,"Text Color")}
              .value=${l.default_text_color||"var(--primary-text-color)"}
              .defaultValue=${"var(--primary-text-color)"}
              .hass=${e}
              @value-changed=${t=>a({default_text_color:t.detail.value})}
            ></ultra-color-picker>

            <ultra-color-picker
              .label=${(0,c.kg)("editor.toggle.default_active_background_color",s,"Active Background Color")}
              .value=${l.default_active_background_color||"var(--primary-color)"}
              .defaultValue=${"var(--primary-color)"}
              .hass=${e}
              @value-changed=${t=>a({default_active_background_color:t.detail.value})}
            ></ultra-color-picker>

            <ultra-color-picker
              .label=${(0,c.kg)("editor.toggle.default_active_text_color",s,"Active Text Color")}
              .value=${l.default_active_text_color||"white"}
              .defaultValue=${"white"}
              .hass=${e}
              @value-changed=${t=>a({default_active_text_color:t.detail.value})}
            ></ultra-color-picker>
          </div>
        </div>

        <!-- Toggle Points Management Section -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,c.kg)("editor.toggle.toggle_points",s,"TOGGLE POINTS")}
          </div>

          <div class="toggle-point-rows-container">
            ${l.toggle_points.map(((t,o)=>this.renderTogglePointRow(t,o,l,e,a)))}
          </div>

          <button
            class="add-toggle-point-btn"
            @click=${()=>this.addTogglePoint(l,a)}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
            ${(0,c.kg)("editor.toggle.add_toggle_point",s,"Add Toggle Point")}
          </button>
        </div>
      </div>
    `}renderTogglePointRow(t,e,o,a,n){var r,l;const c=this._expandedTogglePoints.has(t.id),s=(null===(r=null==a?void 0:a.locale)||void 0===r||r.language,this.determineActiveTogglePoint(o,a)===t.id);return i.qy`
      <div
        class="toggle-point-row ${(null===(l=this._draggedItem)||void 0===l?void 0:l.id)===t.id?"dragging":""} ${s?"currently-active":""}"
        draggable="true"
        @dragstart=${e=>this.handleDragStart(e,t)}
        @dragend=${()=>this.handleDragEnd()}
        @dragover=${t=>this.handleDragOver(t)}
        @drop=${t=>this.handleDrop(t,e,o,n)}
      >
        <ha-icon icon="mdi:drag" class="drag-handle"></ha-icon>
        ${s?i.qy`<ha-icon
              icon="mdi:check-circle"
              style="color: var(--success-color); flex-shrink: 0;"
            ></ha-icon>`:i.qy`<ha-icon
              icon="mdi:circle-outline"
              style="color: var(--disabled-text-color); flex-shrink: 0; opacity: 0.5;"
            ></ha-icon>`}
        <div class="toggle-point-info ${t.label?"":"no-label"}">
          ${t.label||"No label set"}
          ${t.match_entity?i.qy`<div
                style="font-size: 11px; color: var(--secondary-text-color); margin-top: 2px;"
              >
                ${t.match_entity} =
                ${Array.isArray(t.match_state)?t.match_state.join(", "):t.match_state||"any"}
              </div>`:""}
        </div>
        <ha-icon
          icon="mdi:chevron-down"
          class="expand-icon ${c?"expanded":""}"
          @click=${()=>this.toggleExpand(t.id)}
        ></ha-icon>
        <ha-icon
          icon="mdi:delete"
          class="delete-icon"
          @click=${()=>this.deleteTogglePoint(e,o,n)}
        ></ha-icon>
      </div>

      ${c?i.qy`
            <div class="toggle-point-settings">
              ${this.renderTogglePointConfig(t,e,o,a,n)}
            </div>
          `:""}
    `}renderTogglePointConfig(t,e,o,a,r){var l;const s=(null===(l=null==a?void 0:a.locale)||void 0===l?void 0:l.language)||"en";return i.qy`
      ${n.U.renderFieldSection((0,c.kg)("editor.toggle.point_label",s,"Label"),(0,c.kg)("editor.toggle.point_label_desc",s,"Display text for this toggle point"),a,{label:t.label||""},[n.U.text("label")],(t=>this.updateTogglePoint(e,{label:t.detail.value.label},o,r)))}
      ${n.U.renderFieldSection((0,c.kg)("editor.toggle.point_icon",s,"Icon"),(0,c.kg)("editor.toggle.point_icon_desc",s,"Icon to display for this toggle point"),a,{icon:t.icon||""},[n.U.icon("icon")],(t=>this.updateTogglePoint(e,{icon:t.detail.value.icon},o,r)))}

      <div style="margin-top: 16px; margin-bottom: 16px;">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
          ${(0,c.kg)("editor.toggle.point_auto_select",s,"Auto-Select Conditions")}
        </div>
        <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 12px;">
          ${(0,c.kg)("editor.toggle.point_auto_select_desc",s,"Automatically select this toggle point based on entity state or template conditions")}
        </div>

        <!-- Match Mode Selector -->
        ${this.renderFieldSection((0,c.kg)("editor.toggle.point_match_mode",s,"Match Mode"),(0,c.kg)("editor.toggle.point_match_mode_desc",s,"Choose how to determine when this toggle point should be active"),a,{match_mode:t.match_template_mode?"template":"entity"},[this.selectField("match_mode",[{value:"entity",label:(0,c.kg)("editor.toggle.match_mode_entity",s,"Entity State")},{value:"template",label:(0,c.kg)("editor.toggle.match_mode_template",s,"Template (Advanced)")}])],(i=>{const a=i.detail.value.match_mode;"template"===a!==(t.match_template_mode||!1)&&("entity"===a?this.updateTogglePoint(e,{match_template_mode:!1,match_template:""},o,r):"template"===a&&this.updateTogglePoint(e,{match_template_mode:!0,match_entity:"",match_state:""},o,r),setTimeout((()=>this.triggerPreviewUpdate()),50))}))}
        ${t.match_template_mode?i.qy`
              <!-- Template Mode UI -->
              <div
                style="border-left: 3px solid var(--primary-color); padding-left: 12px; margin-top: 12px;"
              >
                ${n.U.renderFieldSection((0,c.kg)("editor.toggle.point_match_template",s,"Match Template"),(0,c.kg)("editor.toggle.point_match_template_desc",s,"Jinja2 template that evaluates to true when this point should be active"),a,{match_template:t.match_template||""},[n.U.text("match_template",!0)],(t=>this.updateTogglePoint(e,{match_template:t.detail.value.match_template},o,r)))}
                <div
                  style="font-size: 11px; color: var(--secondary-text-color); margin-top: 8px; padding: 8px; background: var(--card-background-color); border-radius: 4px;"
                >
                  <strong>${(0,c.kg)("editor.toggle.template_examples",s,"Examples")}:</strong
                  ><br />
                  • ${(0,c.kg)("editor.toggle.template_example_range",s,"Range")}:
                  <code style="font-size: 10px;"
                    >{{ state_attr('cover.garage', 'current_position') | int >= 15 and
                    state_attr('cover.garage', 'current_position') | int &lt;= 25 }}</code
                  ><br />
                  • ${(0,c.kg)("editor.toggle.template_example_brightness",s,"Brightness")}:
                  <code style="font-size: 10px;"
                    >{{ state_attr('light.living_room', 'brightness') | int > 200 }}</code
                  ><br />
                  •
                  ${(0,c.kg)("editor.toggle.template_example_multi",s,"Multiple conditions")}:
                  <code style="font-size: 10px;"
                    >{{ states('climate.hvac') == 'heat' and state_attr('climate.hvac',
                    'temperature') > 20 }}</code
                  >
                </div>
              </div>
            `:i.qy`
              <!-- Entity State Mode UI -->
              <div
                style="border-left: 3px solid var(--primary-color); padding-left: 12px; margin-top: 12px;"
              >
                ${n.U.renderFieldSection((0,c.kg)("editor.toggle.point_match_entity",s,"Match Entity"),(0,c.kg)("editor.toggle.point_match_entity_desc",s,"Entity to match"),a,{match_entity:t.match_entity||""},[n.U.entity("match_entity")],(t=>this.updateTogglePoint(e,{match_entity:t.detail.value.match_entity},o,r)))}
                ${n.U.renderFieldSection((0,c.kg)("editor.toggle.point_match_state",s,"Match State"),(0,c.kg)("editor.toggle.point_match_state_desc",s,'State value to match (e.g., "on", "off", "heat", "cool")'),a,{match_state:Array.isArray(t.match_state)?t.match_state.join(", "):t.match_state||""},[n.U.text("match_state")],(t=>{const i=t.detail.value.match_state,a=i.includes(",")?i.split(",").map((t=>t.trim())).filter(Boolean):i;this.updateTogglePoint(e,{match_state:a},o,r)}))}
                <div
                  style="font-size: 11px; color: var(--secondary-text-color); margin-top: 4px; padding: 8px; background: var(--card-background-color); border-radius: 4px;"
                >
                  <strong>Tip:</strong> Use comma-separated values to match multiple states (e.g.,
                  "on, open")
                </div>
              </div>
            `}
      </div>

      <div style="margin-top: 16px; margin-bottom: 16px;">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
          ${(0,c.kg)("editor.toggle.point_colors",s,"Colors")}
        </div>

        <div class="color-controls">
          <ultra-color-picker
            .label=${(0,c.kg)("editor.toggle.point_background_color",s,"Background Color")}
            .value=${t.background_color||o.default_background_color||""}
            .defaultValue=${o.default_background_color||"var(--secondary-background-color)"}
            .hass=${a}
            @value-changed=${t=>this.updateTogglePoint(e,{background_color:t.detail.value},o,r)}
          ></ultra-color-picker>

          <ultra-color-picker
            .label=${(0,c.kg)("editor.toggle.point_text_color",s,"Text Color")}
            .value=${t.text_color||o.default_text_color||""}
            .defaultValue=${o.default_text_color||"var(--primary-text-color)"}
            .hass=${a}
            @value-changed=${t=>this.updateTogglePoint(e,{text_color:t.detail.value},o,r)}
          ></ultra-color-picker>

          <ultra-color-picker
            .label=${(0,c.kg)("editor.toggle.point_active_background_color",s,"Active Background Color")}
            .value=${t.active_background_color||o.default_active_background_color||""}
            .defaultValue=${o.default_active_background_color||"var(--primary-color)"}
            .hass=${a}
            @value-changed=${t=>this.updateTogglePoint(e,{active_background_color:t.detail.value},o,r)}
          ></ultra-color-picker>

          <ultra-color-picker
            .label=${(0,c.kg)("editor.toggle.point_active_text_color",s,"Active Text Color")}
            .value=${t.active_text_color||o.default_active_text_color||""}
            .defaultValue=${o.default_active_text_color||"white"}
            .hass=${a}
            @value-changed=${t=>this.updateTogglePoint(e,{active_text_color:t.detail.value},o,r)}
          ></ultra-color-picker>
        </div>
      </div>

      <div style="margin-top: 16px;">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
          ${(0,c.kg)("editor.toggle.point_action",s,"Action")}
        </div>
        <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 12px;">
          ${(0,c.kg)("editor.toggle.point_action_desc",s,"Configure what happens when this toggle point is activated")}
        </div>

        <div style="position: relative; overflow: visible;">
          <ha-form
            .hass=${a}
            .data=${{tap_action:t.tap_action||{action:"nothing"}}}
            .schema=${[{name:"tap_action",selector:{ui_action:{}}}]}
            .computeLabel=${t=>a.localize(`ui.panel.lovelace.editor.card.generic.${t.name}`)}
            @value-changed=${i=>{if(this._actionFormChangeGuard)return;i.stopPropagation(),i.stopImmediatePropagation();const a=i.detail.value.tap_action,n=t.tap_action;JSON.stringify(n)!==JSON.stringify(a)&&(this._actionFormChangeGuard=!0,this.updateTogglePoint(e,{tap_action:a},o,r),setTimeout((()=>{this._actionFormChangeGuard=!1,this.triggerPreviewUpdate()}),50))}}
          ></ha-form>
        </div>
      </div>
    `}addTogglePoint(t,e){const o={id:this.generateId("toggle_point"),label:`Point ${t.toggle_points.length+1}`,icon:"",tap_action:{action:"nothing"},background_color:t.default_background_color,text_color:t.default_text_color,active_background_color:t.default_active_background_color,active_text_color:t.default_active_text_color};e({toggle_points:[...t.toggle_points,o]}),this._expandedTogglePoints.add(o.id)}quickSetupFromEntity(t,e,o,i){if(!t||!o.states[t])return;const a=t.split(".")[0],n=o.states[t];let r=[];switch(a){case"light":case"switch":case"input_boolean":case"fan":r=[{id:this.generateId("toggle_point"),label:"Off",icon:"light"===a?"mdi:lightbulb-off":"fan"===a?"mdi:fan-off":"mdi:power-off",match_entity:t,match_state:"off",tap_action:{action:"toggle",entity:t},background_color:e.default_background_color,text_color:e.default_text_color,active_background_color:"var(--disabled-text-color)",active_text_color:"white"},{id:this.generateId("toggle_point"),label:"On",icon:"light"===a?"mdi:lightbulb-on":"fan"===a?"mdi:fan":"mdi:power",match_entity:t,match_state:"on",tap_action:{action:"toggle",entity:t},background_color:e.default_background_color,text_color:e.default_text_color,active_background_color:"var(--primary-color)",active_text_color:"white"}];break;case"climate":r=[{id:this.generateId("toggle_point"),label:"Off",icon:"mdi:power-off",match_entity:t,match_state:"off",tap_action:{action:"perform-action",perform_action:"climate.set_hvac_mode",data:{entity_id:t,hvac_mode:"off"}},background_color:e.default_background_color,text_color:e.default_text_color,active_background_color:"var(--disabled-text-color)",active_text_color:"white"},{id:this.generateId("toggle_point"),label:"Heat",icon:"mdi:fire",match_entity:t,match_state:"heat",tap_action:{action:"perform-action",perform_action:"climate.set_hvac_mode",data:{entity_id:t,hvac_mode:"heat"}},background_color:e.default_background_color,text_color:e.default_text_color,active_background_color:"var(--error-color)",active_text_color:"white"},{id:this.generateId("toggle_point"),label:"Cool",icon:"mdi:snowflake",match_entity:t,match_state:"cool",tap_action:{action:"perform-action",perform_action:"climate.set_hvac_mode",data:{entity_id:t,hvac_mode:"cool"}},background_color:e.default_background_color,text_color:e.default_text_color,active_background_color:"var(--info-color)",active_text_color:"white"},{id:this.generateId("toggle_point"),label:"Auto",icon:"mdi:autorenew",match_entity:t,match_state:"auto",tap_action:{action:"perform-action",perform_action:"climate.set_hvac_mode",data:{entity_id:t,hvac_mode:"auto"}},background_color:e.default_background_color,text_color:e.default_text_color,active_background_color:"var(--primary-color)",active_text_color:"white"}];break;case"cover":r=[{id:this.generateId("toggle_point"),label:"Closed",icon:"mdi:window-shutter",match_entity:t,match_state:"closed",tap_action:{action:"perform-action",perform_action:"cover.close_cover",data:{entity_id:t}},background_color:e.default_background_color,text_color:e.default_text_color,active_background_color:"var(--disabled-text-color)",active_text_color:"white"},{id:this.generateId("toggle_point"),label:"Open",icon:"mdi:window-shutter-open",match_entity:t,match_state:"open",tap_action:{action:"perform-action",perform_action:"cover.open_cover",data:{entity_id:t}},background_color:e.default_background_color,text_color:e.default_text_color,active_background_color:"var(--primary-color)",active_text_color:"white"}];break;case"media_player":r=[{id:this.generateId("toggle_point"),label:"Off",icon:"mdi:power-off",match_entity:t,match_state:"off",tap_action:{action:"perform-action",perform_action:"media_player.turn_off",data:{entity_id:t}},background_color:e.default_background_color,text_color:e.default_text_color,active_background_color:"var(--disabled-text-color)",active_text_color:"white"},{id:this.generateId("toggle_point"),label:"Playing",icon:"mdi:play",match_entity:t,match_state:"playing",tap_action:{action:"perform-action",perform_action:"media_player.media_play",data:{entity_id:t}},background_color:e.default_background_color,text_color:e.default_text_color,active_background_color:"var(--primary-color)",active_text_color:"white"},{id:this.generateId("toggle_point"),label:"Paused",icon:"mdi:pause",match_entity:t,match_state:"paused",tap_action:{action:"perform-action",perform_action:"media_player.media_pause",data:{entity_id:t}},background_color:e.default_background_color,text_color:e.default_text_color,active_background_color:"var(--warning-color)",active_text_color:"white"}];break;case"input_select":case"select":const o=n.attributes.options||[],i="select"===a?"select.select_option":"input_select.select_option";r=o.map(((o,a)=>({id:this.generateId("toggle_point"),label:o,icon:"",match_entity:t,match_state:o,tap_action:{action:"perform-action",perform_action:i,data:{entity_id:t,option:o}},background_color:e.default_background_color,text_color:e.default_text_color,active_background_color:0===a?"var(--primary-color)":1===a?"var(--info-color)":"var(--success-color)",active_text_color:"white"})));break;default:r=[{id:this.generateId("toggle_point"),label:"Off",icon:"mdi:circle-outline",match_entity:t,match_state:"off",tap_action:{action:"more-info",entity:t},background_color:e.default_background_color,text_color:e.default_text_color,active_background_color:"var(--disabled-text-color)",active_text_color:"white"},{id:this.generateId("toggle_point"),label:"On",icon:"mdi:circle",match_entity:t,match_state:"on",tap_action:{action:"more-info",entity:t},background_color:e.default_background_color,text_color:e.default_text_color,active_background_color:"var(--primary-color)",active_text_color:"white"}]}i({toggle_points:r,tracking_entity:t}),r.forEach((t=>this._expandedTogglePoints.add(t.id))),setTimeout((()=>this.triggerPreviewUpdate()),50)}deleteTogglePoint(t,e,o){const i=[...e.toggle_points],a=i.splice(t,1);a[0]&&this._expandedTogglePoints.delete(a[0].id),o({toggle_points:i})}updateTogglePoint(t,e,o,i){const a=[...o.toggle_points];a[t]=Object.assign(Object.assign({},a[t]),e),i({toggle_points:a})}toggleExpand(t){this._expandedTogglePoints.has(t)?this._expandedTogglePoints.delete(t):this._expandedTogglePoints.add(t),"undefined"!=typeof window&&window.dispatchEvent(new CustomEvent("ultra-card-module-update"))}handleDragStart(t,e){this._draggedItem=e,t.dataTransfer&&(t.dataTransfer.effectAllowed="move")}handleDragEnd(){this._draggedItem=null,"undefined"!=typeof window&&window.dispatchEvent(new CustomEvent("ultra-card-module-update"))}handleDragOver(t){t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect="move")}handleDrop(t,e,o,i){if(t.preventDefault(),!this._draggedItem)return;const a=[...o.toggle_points],n=a.findIndex((t=>t.id===this._draggedItem.id));if(-1===n||n===e)return;const[r]=a.splice(n,1);a.splice(e,0,r),i({toggle_points:a}),this._draggedItem=null}renderPreview(t,e,o){var i;const a=t;let n;this._hass=e,!this._templateService&&e&&(this._templateService=new s.I(e)),this._subscribeToToggleTemplates(a,e);const r=a.tracking_entity||a.toggle_points.some((t=>t.match_entity&&t.match_state||t.match_template_mode&&t.match_template));if(r?(n=this.determineActiveTogglePoint(a,e),this._activeTogglePointId=n):this._activeTogglePointId?n=this._activeTogglePointId:(n=null===(i=a.toggle_points[0])||void 0===i?void 0:i.id,this._activeTogglePointId=n),r&&console.debug){const t=a.toggle_points.find((t=>t.id===n));t&&console.debug(`[Toggle Module] Active point: "${t.label}" (entity tracking enabled)`)}switch(a.visual_style){case"ios_toggle":return this.renderIOSToggle(a,e,n);case"segmented":default:return this.renderSegmented(a,e,n);case"button_group":return this.renderButtonGroup(a,e,n);case"slider_track":return this.renderSliderTrack(a,e,n);case"timeline":return this.renderTimeline(a,e,n);case"minimal":return this.renderMinimal(a,e,n)}}_subscribeToToggleTemplates(t,e){if(this._templateService&&e){e.__uvc_template_strings||(e.__uvc_template_strings={});for(const e of t.toggle_points)if(e.match_template_mode&&e.match_template){const o=this._hashString(e.match_template),i=`toggle_match_${t.id}_${e.id}_${o}`;this._templateService.hasTemplateSubscription(i)||this._templateService.subscribeToTemplate(e.match_template,i,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}))}}}_hashString(t){let e=0;for(let o=0;o<t.length;o++)e=(e<<5)-e+t.charCodeAt(o),e|=0;return Math.abs(e).toString(36)}determineActiveTogglePoint(t,e){var o,i;for(const i of t.toggle_points)if(i.match_template_mode&&i.match_template){const a=this._hashString(i.match_template),n=`toggle_match_${t.id}_${i.id}_${a}`,r=null===(o=e.__uvc_template_strings)||void 0===o?void 0:o[n];if(void 0!==r&&this._parseTemplateResultAsBoolean(r))return i.id}if(t.tracking_entity&&e.states[t.tracking_entity]){const o=e.states[t.tracking_entity].state,i=t.toggle_points.find((e=>!e.match_template_mode&&(!(e.match_entity!==t.tracking_entity&&e.match_entity)&&this._matchesState(e.match_state,o))));if(i)return i.id}for(const o of t.toggle_points)if(!o.match_template_mode&&o.match_entity&&e.states[o.match_entity]){const t=e.states[o.match_entity].state;if(this._matchesState(o.match_state,t))return o.id}return null===(i=t.toggle_points[0])||void 0===i?void 0:i.id}_matchesState(t,e){if(!t)return!1;const o=this._tryParseNumber(e);return Array.isArray(t)?t.some((t=>this._valuesEqual(t,e,o))):this._valuesEqual(t,e,o)}_tryParseNumber(t){if("number"==typeof t)return t;if("string"==typeof t){const e=parseFloat(t);return isNaN(e)?null:e}return null}_valuesEqual(t,e,o){const i=this._tryParseNumber(t);return null!==i&&null!==o?i===o:String(t).toLowerCase()===String(e).toLowerCase()}_parseTemplateResultAsBoolean(t){if(null==t)return!1;if("boolean"==typeof t)return t;if("number"==typeof t)return 0!==t;if("string"==typeof t){const e=t.toLowerCase().trim();return"true"===e||"on"===e||"yes"===e||"1"===e}return!1}handleTogglePointClick(t,e,o,i){if(i.stopPropagation(),this._activeTogglePointId=t.id,this.triggerPreviewUpdate(!0),t.tap_action&&"nothing"!==t.tap_action.action){const a="perform-action"===t.tap_action.action&&(t.tap_action.data||t.tap_action.service_data)?t.tap_action.entity:t.tap_action.entity||t.match_entity||e.tracking_entity,n=a&&!t.tap_action.entity?Object.assign(Object.assign({},t.tap_action),{entity:a}):t.tap_action;this.handleModuleAction(n,o,i.target,void 0,a,e)}}renderIOSToggle(t,e,o){if(2!==t.toggle_points.length)return i.qy`
        <div style="padding: 16px; color: var(--error-color); text-align: center;">
          Basic toggle requires exactly 2 toggle points
        </div>
      `;const a=t.toggle_points[0],n=t.toggle_points[1],r=o===a.id,l="vertical"===t.orientation,c={compact:{width:"44px",height:"24px",thumbSize:"18px"},normal:{width:"52px",height:"28px",thumbSize:"22px"},large:{width:"64px",height:"34px",thumbSize:"28px"}}[t.size||"normal"],s=l?c.height:c.width,d=l?c.width:c.height;return i.qy`
      <style>
        .ios-toggle-container {
          display: flex;
          flex-direction: column;
          align-items: ${"left"===t.alignment?"flex-start":"right"===t.alignment?"flex-end":"center"};
          padding: 8px;
          gap: 8px;
        }

        .ios-toggle-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-text-color);
        }

        .ios-toggle-track {
          position: relative;
          width: ${s};
          height: ${d};
          border-radius: ${l?s:d};
          cursor: pointer;
          transition: background-color 0.3s ease;
          background-color: ${r?a.active_background_color||t.default_active_background_color:n.active_background_color||t.default_active_background_color};
        }

        .ios-toggle-thumb {
          position: absolute;
          ${l?`\n            left: 50%;\n            transform: translateX(-50%) ${r?"translateY(3px)":`translateY(calc(${d} - ${c.thumbSize} - 3px))`};\n          `:`\n            top: 50%;\n            transform: translateY(-50%) ${r?"translateX(3px)":`translateX(calc(${s} - ${c.thumbSize} - 3px))`};\n          `}
          width: ${c.thumbSize};
          height: ${c.thumbSize};
          border-radius: 50%;
          background: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease;
        }
      </style>

      <div class="ios-toggle-container">
        ${t.show_title&&t.title?i.qy`<div class="ios-toggle-title">${t.title}</div>`:""}
        <div
          class="ios-toggle-track"
          @click=${o=>this.handleTogglePointClick(r?n:a,t,e,o)}
        >
          <div class="ios-toggle-thumb"></div>
        </div>
      </div>
    `}renderSegmented(t,e,o){const a="horizontal"===t.orientation,n={compact:{padding:"6px 12px",fontSize:"12px",iconSize:"16px"},normal:{padding:"8px 16px",fontSize:"14px",iconSize:"20px"},large:{padding:"12px 24px",fontSize:"16px",iconSize:"24px"}}[t.size||"normal"];return i.qy`
      <style>
        .segmented-container {
          display: flex;
          flex-direction: column;
          align-items: ${"justify"===t.alignment?"stretch":"left"===t.alignment?"flex-start":"right"===t.alignment?"flex-end":"center"};
          padding: 8px;
          gap: ${t.spacing||8}px;
          width: ${"justify"===t.alignment?"100%":"auto"};
          box-sizing: border-box;
        }

        .segmented-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-text-color);
        }

        .segmented-control {
          display: flex;
          flex-direction: ${a?"row":"column"};
          background: var(--card-background-color);
          border-radius: 8px;
          padding: 4px;
          gap: ${t.spacing||0}px;
          width: ${"justify"===t.alignment?"100%":"auto"};
          box-sizing: border-box;
        }

        .segmented-button {
          flex: ${"justify"===t.alignment?"1":"0 0 auto"};
          padding: ${n.padding};
          font-size: ${n.fontSize};
          border: none;
          background: transparent;
          color: var(--primary-text-color);
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-direction: ${"above"===t.icon_position?"column":"below"===t.icon_position?"column-reverse":"right"===t.icon_position?"row-reverse":"row"};
        }

        .segmented-button.active {
          background: var(--primary-color);
          color: white;
          transform: scale(1.02);
        }

        .segmented-button ha-icon {
          --mdc-icon-size: ${n.iconSize};
        }
      </style>

      <div class="segmented-container">
        ${t.show_title&&t.title?i.qy`<div class="segmented-title">${t.title}</div>`:""}
        <div class="segmented-control">
          ${t.toggle_points.map((a=>i.qy`
              <button
                class="segmented-button ${o===a.id?"active":""}"
                style="
                  background-color: ${o===a.id?a.active_background_color||t.default_active_background_color||"var(--primary-color)":a.background_color||t.default_background_color||"transparent"};
                  color: ${o===a.id?a.active_text_color||t.default_active_text_color||"white":a.text_color||t.default_text_color||"var(--primary-text-color)"};
                "
                @click=${o=>this.handleTogglePointClick(a,t,e,o)}
              >
                ${t.show_icons&&a.icon?i.qy`<ha-icon icon="${a.icon}"></ha-icon>`:""}
                <span>${a.label}</span>
              </button>
            `))}
        </div>
      </div>
    `}renderButtonGroup(t,e,o){const a="horizontal"===t.orientation,n={compact:{padding:"6px 12px",fontSize:"12px",iconSize:"16px"},normal:{padding:"10px 20px",fontSize:"14px",iconSize:"20px"},large:{padding:"14px 28px",fontSize:"16px",iconSize:"24px"}}[t.size||"normal"];return i.qy`
      <style>
        .button-group-container {
          display: flex;
          flex-direction: column;
          align-items: ${"left"===t.alignment?"flex-start":"right"===t.alignment?"flex-end":"center"};
          padding: 8px;
          gap: ${t.spacing||8}px;
          width: ${"justify"===t.alignment?"100%":"auto"};
        }

        .button-group-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-text-color);
        }

        .button-group {
          display: flex;
          flex-direction: ${a?"row":"column"};
          gap: ${t.spacing||8}px;
          flex-wrap: wrap;
          width: ${"justify"===t.alignment?"100%":"auto"};
        }

        .group-button {
          flex: ${"justify"===t.alignment?"1":"0 0 auto"};
          padding: ${n.padding};
          font-size: ${n.fontSize};
          border: 2px solid var(--divider-color);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-direction: ${"above"===t.icon_position?"column":"below"===t.icon_position?"column-reverse":"right"===t.icon_position?"row-reverse":"row"};
        }

        .group-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .group-button.active {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 1px var(--primary-color);
        }

        .group-button ha-icon {
          --mdc-icon-size: ${n.iconSize};
        }
      </style>

      <div class="button-group-container">
        ${t.show_title&&t.title?i.qy`<div class="button-group-title">${t.title}</div>`:""}
        <div class="button-group">
          ${t.toggle_points.map((a=>i.qy`
              <button
                class="group-button ${o===a.id?"active":""}"
                style="
                  background-color: ${o===a.id?a.active_background_color||t.default_active_background_color||"var(--primary-color)":a.background_color||t.default_background_color||"var(--secondary-background-color)"};
                  color: ${o===a.id?a.active_text_color||t.default_active_text_color||"white":a.text_color||t.default_text_color||"var(--primary-text-color)"};
                  border-color: ${o===a.id?"var(--primary-color)":"var(--divider-color)"};
                "
                @click=${o=>this.handleTogglePointClick(a,t,e,o)}
              >
                ${t.show_icons&&a.icon?i.qy`<ha-icon icon="${a.icon}"></ha-icon>`:""}
                <span>${a.label}</span>
              </button>
            `))}
        </div>
      </div>
    `}renderSliderTrack(t,e,o){const a=t.toggle_points.findIndex((t=>t.id===o)),n=t.toggle_points.length>1?a/(t.toggle_points.length-1)*100:0,r="vertical"===t.orientation,l=t.spacing||0,c=t.toggle_points.length,s="justify"===t.alignment?"100%":40*c+l*(c+1)+"px";return i.qy`
      <style>
        .slider-track-container {
          display: flex;
          flex-direction: column;
          align-items: ${"left"===t.alignment?"flex-start":"right"===t.alignment?"flex-end":"center"};
          padding: 8px;
          gap: 12px;
          width: ${"justify"===t.alignment?"100%":"auto"};
        }

        .slider-track-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-text-color);
        }

        .slider-track-wrapper {
          position: relative;
          ${r?`\n            width: 40px;\n            height: ${s};\n          `:`\n            width: ${s};\n            height: 40px;\n          `}
          background: var(--secondary-background-color);
          border-radius: 20px;
          overflow: hidden;
        }

        .slider-track-progress {
          position: absolute;
          background: var(--primary-color);
          transition: ${r?"height":"width"} 0.3s ease;
          border-radius: 20px;
          ${r?`\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: ${n}%;\n          `:`\n            top: 0;\n            left: 0;\n            height: 100%;\n            width: ${n}%;\n          `}
        }

        .slider-track-markers {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: ${r?"column":"row"};
          align-items: center;
          justify-content: space-evenly;
          padding: 0;
        }

        .slider-marker {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1;
          transition: transform 0.2s ease;
        }

        .slider-marker:hover {
          transform: scale(1.1);
        }

        .slider-marker.active {
          transform: scale(1.2);
        }

        .slider-marker span {
          font-size: 12px;
          font-weight: 600;
          color: var(--primary-text-color);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
      </style>

      <div class="slider-track-container">
        ${t.show_title&&t.title?i.qy`<div class="slider-track-title">${t.title}</div>`:""}
        <div class="slider-track-wrapper">
          <div class="slider-track-progress"></div>
          <div class="slider-track-markers">
            ${t.toggle_points.map((a=>i.qy`
                <div
                  class="slider-marker ${o===a.id?"active":""}"
                  @click=${o=>this.handleTogglePointClick(a,t,e,o)}
                >
                  ${t.show_icons&&a.icon?i.qy`<ha-icon icon="${a.icon}"></ha-icon>`:i.qy`<span>${a.label}</span>`}
                </div>
              `))}
          </div>
        </div>
      </div>
    `}renderTimeline(t,e,o){const a="vertical"===t.orientation,n=(t.toggle_points.findIndex((t=>t.id===o)),{compact:{dotSize:"12px",lineThickness:"2px",fontSize:"11px",iconSize:"14px"},normal:{dotSize:"16px",lineThickness:"3px",fontSize:"13px",iconSize:"18px"},large:{dotSize:"20px",lineThickness:"4px",fontSize:"15px",iconSize:"22px"}}[t.size||"normal"]);return i.qy`
      <style>
        .timeline-container {
          display: flex;
          flex-direction: column;
          align-items: ${"left"===t.alignment?"flex-start":"right"===t.alignment?"flex-end":"center"};
          padding: 8px;
          gap: 12px;
          width: ${"justify"===t.alignment?"100%":"auto"};
        }

        .timeline-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-text-color);
        }

        .timeline-track {
          display: flex;
          flex-direction: ${a?"column":"row"};
          align-items: ${"flex-start"};
          position: relative;
          gap: ${t.spacing||8}px;
        }

        .timeline-line {
          position: absolute;
          background: var(--divider-color);
          z-index: 0;
          ${a?`\n            left: 16%;\n            top: calc(${n.dotSize} / 2);\n            bottom: calc(${n.dotSize} / 2);\n            width: ${n.lineThickness};\n          `:`\n            top: calc(17px / 2 - 3px / 2);\n            left: calc(${n.dotSize} / 2);\n            right: calc(${n.dotSize} / 2);\n            height: ${n.lineThickness};\n          `}
        }

        .timeline-point {
          position: relative;
          display: flex;
          flex-direction: ${a?"row":"column"};
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
          cursor: pointer;
          z-index: 1;
          transition: all 0.3s ease;
        }

        .timeline-dot {
          width: ${n.dotSize};
          height: ${n.dotSize};
          border-radius: 50%;
          border: ${n.lineThickness} solid var(--primary-color);
          background: var(--card-background-color);
          transition: all 0.3s ease;
          flex-shrink: 0;
          position: relative;
          z-index: 2;
          box-sizing: border-box;
        }

        .timeline-point.active .timeline-dot {
          background: var(--primary-color);
          transform: scale(1.3);
          box-shadow: 0 0 12px rgba(var(--rgb-primary-color), 0.6);
        }

        .timeline-point:hover .timeline-dot {
          transform: scale(1.15);
        }

        .timeline-label {
          font-size: ${n.fontSize};
          font-weight: 500;
          color: var(--secondary-text-color);
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .timeline-point.active .timeline-label {
          color: var(--primary-color);
          font-weight: 600;
        }

        .timeline-point ha-icon {
          --mdc-icon-size: ${n.iconSize};
          color: var(--secondary-text-color);
          transition: color 0.3s ease;
        }

        .timeline-point.active ha-icon {
          color: var(--primary-color);
        }
      </style>

      <div class="timeline-container">
        ${t.show_title&&t.title?i.qy`<div class="timeline-title">${t.title}</div>`:""}
        <div class="timeline-track">
          <div class="timeline-line"></div>
          ${t.toggle_points.map((a=>i.qy`
              <div
                class="timeline-point ${o===a.id?"active":""}"
                @click=${o=>this.handleTogglePointClick(a,t,e,o)}
              >
                <div class="timeline-dot"></div>
                ${t.show_icons&&a.icon?i.qy`<ha-icon icon="${a.icon}"></ha-icon>`:i.qy`<span class="timeline-label">${a.label}</span>`}
              </div>
            `))}
        </div>
      </div>
    `}renderMinimal(t,e,o){const a="horizontal"===t.orientation,n={compact:{padding:"4px 8px",fontSize:"12px",iconSize:"16px"},normal:{padding:"6px 12px",fontSize:"14px",iconSize:"20px"},large:{padding:"8px 16px",fontSize:"16px",iconSize:"24px"}}[t.size||"normal"];return i.qy`
      <style>
        .minimal-container {
          display: flex;
          flex-direction: column;
          align-items: ${"left"===t.alignment?"flex-start":"right"===t.alignment?"flex-end":"center"};
          padding: 8px;
          gap: ${t.spacing||8}px;
          width: ${"justify"===t.alignment?"100%":"auto"};
        }

        .minimal-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-text-color);
        }

        .minimal-options {
          display: flex;
          flex-direction: ${a?"row":"column"};
          gap: ${t.spacing||8}px;
          width: ${"justify"===t.alignment?"100%":"auto"};
        }

        .minimal-option {
          flex: ${"justify"===t.alignment?"1":"0 0 auto"};
          padding: ${n.padding};
          font-size: ${n.fontSize};
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          opacity: 0.6;
          flex-direction: ${"above"===t.icon_position?"column":"below"===t.icon_position?"column-reverse":"right"===t.icon_position?"row-reverse":"row"};
        }

        .minimal-option:hover {
          opacity: 0.8;
        }

        .minimal-option.active {
          opacity: 1;
          font-weight: 600;
        }

        .minimal-option ha-icon {
          --mdc-icon-size: ${n.iconSize};
        }
      </style>

      <div class="minimal-container">
        ${t.show_title&&t.title?i.qy`<div class="minimal-title">${t.title}</div>`:""}
        <div class="minimal-options">
          ${t.toggle_points.map((a=>i.qy`
              <button
                class="minimal-option ${o===a.id?"active":""}"
                style="
                  color: ${o===a.id?a.active_text_color||t.default_active_text_color||"var(--primary-color)":a.text_color||t.default_text_color||"var(--primary-text-color)"};
                "
                @click=${o=>this.handleTogglePointClick(a,t,e,o)}
              >
                ${t.show_icons&&a.icon?i.qy`<ha-icon icon="${a.icon}"></ha-icon>`:""}
                <span>${a.label}</span>
              </button>
            `))}
        </div>
      </div>
    `}}}}]);