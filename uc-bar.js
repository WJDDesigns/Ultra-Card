"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[5774],{527:(t,e,i)=>{i.r(e),i.d(e,{UltraBarModule:()=>y});var a=i(5183),n=i(8791),r=i(7475),o=i(8465),l=i(5147),s=i(8938),d=i(8869),c=(i(7921),i(7203)),p=(i(9442),i(4276)),m=i(6478),g=function(t,e,i,a){var n,r=arguments.length,o=r<3?e:null===a?a=Object.getOwnPropertyDescriptor(e,i):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,a);else for(var l=t.length-1;l>=0;l--)(n=t[l])&&(o=(r<3?n(o):r>3?n(e,i,o):n(e,i))||o);return r>3&&o&&Object.defineProperty(e,i,o),o};let u=class extends a.WF{constructor(){super(...arguments),this.tapAction={action:"nothing"},this.holdAction={action:"nothing"},this.doubleTapAction={action:"nothing"},this._tapAction={action:"nothing"},this._holdAction={action:"nothing"},this._doubleTapAction={action:"nothing"}}willUpdate(t){t.has("tapAction")&&(this._tapAction=this.tapAction||{action:"nothing"}),t.has("holdAction")&&(this._holdAction=this.holdAction||{action:"nothing"}),t.has("doubleTapAction")&&(this._doubleTapAction=this.doubleTapAction||{action:"nothing"})}_fireUpdate(t){this.dispatchEvent(new CustomEvent("actions-changed",{detail:{side:this.side,updates:t},bubbles:!0,composed:!0}))}_handleTapActionChanged(t){t.stopPropagation();const e=`${this.side}_tap_action`,i=t.detail.value[e];this._tapAction=i,this.requestUpdate(),this._fireUpdate({[`${this.side}_tap_action`]:i})}_handleHoldActionChanged(t){t.stopPropagation();const e=`${this.side}_hold_action`,i=t.detail.value[e];this._holdAction=i,this.requestUpdate(),this._fireUpdate({[`${this.side}_hold_action`]:i})}_handleDoubleTapActionChanged(t){t.stopPropagation();const e=`${this.side}_double_tap_action`,i=t.detail.value[e];this._doubleTapAction=i,this.requestUpdate(),this._fireUpdate({[`${this.side}_double_tap_action`]:i})}render(){var t;if(!this.hass)return a.qy``;const e=(null===(t=this.hass.locale)||void 0===t?void 0:t.language)||"en",i="left"===this.side?"left":"right",n=`${this.side}_tap_action`,r=`${this.side}_hold_action`,o=`${this.side}_double_tap_action`;return a.qy`
      <div class="section-title">
        ${(0,m.kg)(`editor.bar.${i}.actions`,e,("left"===this.side?"Left":"Right")+" Side Actions")}
      </div>
      <div class="section-description">
        ${(0,m.kg)(`editor.bar.${i}.actions_desc`,e,`Configure what happens when tapping the ${this.side} side info`)}
      </div>

      <div class="action-field">
        <ha-form
          .hass=${this.hass}
          .data=${{[n]:this._tapAction}}
          .schema=${[{name:n,selector:{ui_action:{}}}]}
          .computeLabel=${()=>this.hass.localize("ui.panel.lovelace.editor.card.generic.tap_action")}
          @value-changed=${this._handleTapActionChanged}
        ></ha-form>
      </div>

      <div class="action-field">
        <ha-form
          .hass=${this.hass}
          .data=${{[r]:this._holdAction}}
          .schema=${[{name:r,selector:{ui_action:{}}}]}
          .computeLabel=${()=>this.hass.localize("ui.panel.lovelace.editor.card.generic.hold_action")}
          @value-changed=${this._handleHoldActionChanged}
        ></ha-form>
      </div>

      <div class="action-field">
        <ha-form
          .hass=${this.hass}
          .data=${{[o]:this._doubleTapAction}}
          .schema=${[{name:o,selector:{ui_action:{}}}]}
          .computeLabel=${()=>this.hass.localize("ui.panel.lovelace.editor.card.generic.double_tap_action")}
          @value-changed=${this._handleDoubleTapActionChanged}
        ></ha-form>
      </div>
    `}};u.styles=a.AH`
    :host {
      display: block;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--primary-color);
    }

    .section-description {
      font-size: 12px;
      margin-bottom: 12px;
      color: var(--secondary-text-color);
    }

    .action-field {
      margin-bottom: 12px;
    }

    .action-field:last-child {
      margin-bottom: 0;
    }
  `,g([(0,p.MZ)({attribute:!1})],u.prototype,"hass",void 0),g([(0,p.MZ)({attribute:!1})],u.prototype,"side",void 0),g([(0,p.MZ)({attribute:!1})],u.prototype,"tapAction",void 0),g([(0,p.MZ)({attribute:!1})],u.prototype,"holdAction",void 0),g([(0,p.MZ)({attribute:!1})],u.prototype,"doubleTapAction",void 0),g([(0,p.wk)()],u.prototype,"_tapAction",void 0),g([(0,p.wk)()],u.prototype,"_holdAction",void 0),g([(0,p.wk)()],u.prototype,"_doubleTapAction",void 0),u=g([(0,p.EM)("bar-side-actions")],u);var b=i(9760),_=i(5320),h=i(5262),v=i(9327),f=i(5121);class y extends r.m{constructor(){super(...arguments),this.metadata={type:"bar",title:"Bars",description:"Progress bars for values",author:"WJD Designs",version:"1.0.0",icon:"mdi:chart-bar",category:"data",tags:["bar","progress","chart","value","sensor"]},this._templateInputDebounce=null,this._timeProgressInterval=null,this._timeProgressCleanup=null}createDefault(t,e){const i=this.findSuitableBatterySensor(e);return{id:t||this.generateId("bar"),type:"bar",entity:i||"",percentage_type:"entity",percentage_entity:"",percentage_attribute_entity:"",percentage_attribute_name:"",percentage_current_entity:"",percentage_total_entity:"",percentage_template:"",time_progress_start_entity:"",time_progress_end_entity:"",time_progress_direction:"forward",time_progress_update_interval:1e3,range_start_entity:"",range_start_attribute:"",range_end_entity:"",range_end_attribute:"",range_current_entity:"",range_current_attribute:"",range_current_color:"var(--accent-color)",percentage_min:void 0,percentage_max:void 0,percentage_min_template_mode:!1,percentage_min_template:"",percentage_max_template_mode:!1,percentage_max_template:"",height:20,bar_direction:"left-to-right",bar_size:"medium",bar_radius:"round",bar_style:"flat",bar_width:100,bar_alignment:"center",border_radius:10,glass_blur_amount:8,label_alignment:"space-between",show_percentage:!0,show_value:!1,percentage_text_size:14,percentage_text_alignment:"center",percentage_text_bold:!1,percentage_text_italic:!1,percentage_text_strikethrough:!1,value_position:"inside",left_title:"",left_entity:"",left_condition_type:"none",left_condition_entity:"",left_condition_state:"",left_template_mode:!1,left_template:"",left_title_size:14,left_value_size:14,left_title_color:"",left_value_color:"",left_enabled:!1,left_tap_action:{action:"nothing"},left_hold_action:{action:"nothing"},left_double_tap_action:{action:"nothing"},right_title:"",right_entity:"",right_enabled:!1,right_condition_type:"none",right_condition_entity:"",right_condition_state:"",right_template_mode:!1,right_template:"",right_title_size:14,right_value_size:14,right_title_color:"",right_value_color:"",right_tap_action:{action:"nothing"},right_hold_action:{action:"nothing"},right_double_tap_action:{action:"nothing"},bar_color:"",bar_background_color:"",bar_border_color:"var(--divider-color)",percentage_text_color:"",dot_color:"",minimal_icon_enabled:!1,minimal_icon:"",minimal_icon_mode:"icon-in-dot",minimal_icon_size:24,minimal_icon_size_auto:!0,minimal_icon_color:"",minimal_icon_use_dot_color:!0,use_gradient:!1,gradient_display_mode:"full",gradient_stops:(0,c.FB)(),limit_entity:"",limit_color:"",show_scale:!1,scale_divisions:5,scale_show_labels:!0,scale_label_size:10,scale_label_color:"",scale_position:"below",animation:!0,template_mode:!1,template:"",unified_template_mode:!1,unified_template:"",bar_animation_enabled:!1,bar_animation_entity:"",bar_animation_trigger_type:"state",bar_animation_attribute:"",bar_animation_value:"",bar_animation_type:"none",bar_animation_override_entity:"",bar_animation_override_trigger_type:"state",bar_animation_override_attribute:"",bar_animation_override_value:"",bar_animation_override_type:"none",tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}renderLogicTab(t,e,i,a){return s.X.render(t,e,(t=>a(t)))}findSuitableBatterySensor(t){if(!t||!t.states)return"";const e=["battery_level","battery","charge","power_level","fuel_level","energy"],i=["battery","energy","power"],a=["sensor","binary_sensor"],n=[];return Object.keys(t.states).forEach((r=>{const o=t.states[r],l=r.split(".")[0];if(!a.includes(l))return;if("binary_sensor"===l)return;const s=o.attributes||{},d=s.friendly_name||r,c=s.device_class,p=s.unit_of_measurement,m=parseFloat(o.state);if(isNaN(m)||m<0||m>100)return;if("unavailable"===o.state||"unknown"===o.state)return;let g=0;i.includes(c)&&(g+=100),"%"===p&&(g+=80),e.forEach((t=>{r.toLowerCase().includes(t)&&(g+=50)})),e.forEach((t=>{d.toLowerCase().includes(t)&&(g+=40)})),r.includes("battery")&&"%"===p&&(g+=60),(r.includes("phone")||r.includes("mobile")||r.includes("device"))&&(r.includes("battery")||"battery"===c)&&(g+=30),g>0&&n.push({entity:r,score:g,friendlyName:d})})),n.length>0?(n.sort(((t,e)=>e.score-t.score)),n[0].entity):""}renderGeneralTab(t,e,i,n){var r,l,s,d,p,g;const u=t,b=(null===(r=null==e?void 0:e.locale)||void 0===r?void 0:r.language)||"en",_=[this.selectField("percentage_type",[{value:"entity",label:(0,m.kg)("editor.bar.perc_type.entity",b,"Entity (0-100)")},{value:"attribute",label:(0,m.kg)("editor.bar.perc_type.attribute",b,"Entity Attribute")},{value:"difference",label:(0,m.kg)("editor.bar.perc_type.difference",b,"Difference")},{value:"template",label:(0,m.kg)("editor.bar.perc_type.template",b,"Template")},{value:"time_progress",label:(0,m.kg)("editor.bar.perc_type.time_progress",b,"Time Progress (Real-time)")},{value:"range",label:(0,m.kg)("editor.bar.perc_type.range",b,"Range (Start to End)")}])];return a.qy`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        <!-- Bar Settings -->
        ${this.renderSettingsSection((0,m.kg)("editor.bar.bar_settings.title",b,"Bar Settings"),(0,m.kg)("editor.bar.bar_settings.desc",b,"Configure how the bar percentage is calculated and displayed."),[])}
        <div class="field-group percentage-type-group" style="margin-top: -16px; margin-bottom: 16px;">
          ${this.renderFieldSection((0,m.kg)("editor.bar.percentage_type.title",b,"Percentage Type"),(0,m.kg)("editor.bar.percentage_type.desc",b,"Choose how the bar percentage is calculated"),e,{percentage_type:u.percentage_type||"entity"},_,(t=>{var e;const i=null===(e=t.detail.value)||void 0===e?void 0:e.percentage_type;void 0!==i&&i!==u.percentage_type&&n({percentage_type:i})}))}
        </div>

          <!-- Entity Attribute Fields -->
          ${"attribute"===u.percentage_type?this.renderConditionalFieldsGroup((0,m.kg)("editor.bar.attr_config.title",b,"Entity Attribute Configuration"),a.qy`
                    ${this.renderSettingsSection((0,m.kg)("editor.bar.attr_config.title",b,"Entity Attribute Configuration"),(0,m.kg)("editor.bar.attr_config.desc",b,"Configure entity attribute settings"),[{title:(0,m.kg)("editor.bar.attr_config.attribute_entity",b,"Attribute Entity"),description:(0,m.kg)("editor.bar.attr_config.attribute_entity_desc",b,"Select the entity that contains the attribute with the percentage value"),hass:e,data:{percentage_attribute_entity:u.percentage_attribute_entity||""},schema:[this.entityField("percentage_attribute_entity")],onChange:t=>n({percentage_attribute_entity:t.detail.value.percentage_attribute_entity})},{title:(0,m.kg)("editor.bar.attr_config.attribute_name",b,"Attribute Name"),description:(0,m.kg)("editor.bar.attr_config.attribute_name_desc",b,'Enter the name of the attribute that contains the percentage value (e.g., "battery_level")'),hass:e,data:{percentage_attribute_name:u.percentage_attribute_name||""},schema:[this.textField("percentage_attribute_name")],onChange:t=>n({percentage_attribute_name:t.detail.value.percentage_attribute_name})}])}
                  `):""}

          <!-- Difference Fields -->
          ${"difference"===u.percentage_type?this.renderConditionalFieldsGroup((0,m.kg)("editor.bar.diff_config.title",b,"Difference Calculation Configuration"),a.qy`
                    ${this.renderSettingsSection((0,m.kg)("editor.bar.diff_config.title",b,"Difference Calculation Configuration"),(0,m.kg)("editor.bar.diff_config.desc",b,"Configure difference calculation settings"),[{title:(0,m.kg)("editor.bar.diff_config.current_entity",b,"Current Value Entity"),description:(0,m.kg)("editor.bar.diff_config.current_entity_desc",b,"Entity representing the current/used amount (e.g., fuel used, battery consumed)"),hass:e,data:{percentage_current_entity:u.percentage_current_entity||""},schema:[this.entityField("percentage_current_entity")],onChange:t=>n({percentage_current_entity:t.detail.value.percentage_current_entity})},{title:(0,m.kg)("editor.bar.diff_config.total_entity",b,"Total Value Entity"),description:(0,m.kg)("editor.bar.diff_config.total_entity_desc",b,"Entity representing the total/maximum amount (e.g., fuel capacity, battery capacity)"),hass:e,data:{percentage_total_entity:u.percentage_total_entity||""},schema:[this.entityField("percentage_total_entity")],onChange:t=>n({percentage_total_entity:t.detail.value.percentage_total_entity})}])}
                  `):""}

          <!-- Template Field -->
          ${"template"===u.percentage_type?this.renderConditionalFieldsGroup((0,m.kg)("editor.bar.template_config.title",b,"Template Configuration"),a.qy`
                    <div
                      style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px;"
                    >
                      <div
                        class="section-title"
                        style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
                      >
                        ${(0,m.kg)("editor.bar.template_config.title",b,"Template Configuration")}
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
                      >
                        ${(0,m.kg)("editor.bar.template_config.desc",b,"Configure template settings")}
                      </div>
                      <div class="field-group" style="margin-bottom: 0;">
                        <div
                          class="field-title"
                          style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                        >
                          ${(0,m.kg)("editor.bar.template_config.percentage_template",b,"Percentage Template")}
                        </div>
                        <div
                          class="field-description"
                          style="font-size: 12px; margin-bottom: 8px; color: var(--secondary-text-color);"
                        >
                          ${(0,m.kg)("editor.bar.template_config.percentage_template_desc",b,"Enter a Jinja2 template that returns a number between 0-100 for the percentage. Example: {{ (states('sensor.battery_level') | float) * 100 }}")}
                        </div>
                        <div
                          @mousedown=${t=>{const e=t.target;e.closest("ultra-template-editor")||e.closest(".cm-editor")||t.stopPropagation()}}
                          @dragstart=${t=>t.stopPropagation()}
                        >
                          <ultra-template-editor
                            .hass=${e}
                            .value=${u.percentage_template||""}
                            .placeholder=${"{{ (states('sensor.battery_level') | float) }}"}
                            .minHeight=${100}
                            .maxHeight=${300}
                            @value-changed=${t=>n({percentage_template:t.detail.value})}
                          ></ultra-template-editor>
                        </div>
                      </div>
                    </div>
                  `):""}

          <!-- Time Progress Fields -->
          ${"time_progress"===u.percentage_type?this.renderConditionalFieldsGroup((0,m.kg)("editor.bar.time_progress_config.title",b,"Time Progress Configuration"),a.qy`
                    ${this.renderSettingsSection((0,m.kg)("editor.bar.time_progress_config.title",b,"Time Progress Configuration"),(0,m.kg)("editor.bar.time_progress_config.desc",b,"Configure real-time progress between two timestamp entities. Updates smoothly in the browser without backend load."),[{title:(0,m.kg)("editor.bar.time_progress_config.start_entity",b,"Start Timestamp Entity"),description:(0,m.kg)("editor.bar.time_progress_config.start_entity_desc",b,"Entity containing the start timestamp (e.g., last_refresh). Supports ISO date strings and Unix timestamps."),hass:e,data:{time_progress_start_entity:u.time_progress_start_entity||""},schema:[this.entityField("time_progress_start_entity")],onChange:t=>n({time_progress_start_entity:t.detail.value.time_progress_start_entity})},{title:(0,m.kg)("editor.bar.time_progress_config.end_entity",b,"End Timestamp Entity"),description:(0,m.kg)("editor.bar.time_progress_config.end_entity_desc",b,"Entity containing the end timestamp (e.g., next_refresh). Supports ISO date strings and Unix timestamps."),hass:e,data:{time_progress_end_entity:u.time_progress_end_entity||""},schema:[this.entityField("time_progress_end_entity")],onChange:t=>n({time_progress_end_entity:t.detail.value.time_progress_end_entity})},{title:(0,m.kg)("editor.bar.time_progress_config.direction",b,"Progress Direction"),description:(0,m.kg)("editor.bar.time_progress_config.direction_desc",b,"Forward shows elapsed time from start to now. Backward shows remaining time from now to end."),hass:e,data:{time_progress_direction:u.time_progress_direction||"forward"},schema:[this.selectField("time_progress_direction",[{value:"forward",label:(0,m.kg)("editor.bar.time_progress.forward",b,"Forward (Elapsed)")},{value:"backward",label:(0,m.kg)("editor.bar.time_progress.backward",b,"Backward (Remaining)")}])],onChange:t=>n(t.detail.value)}])}
                    ${this.renderSliderField((0,m.kg)("editor.bar.time_progress_config.update_interval",b,"Update Interval (ms)"),(0,m.kg)("editor.bar.time_progress_config.update_interval_desc",b,"How often to update the progress bar in milliseconds. Default: 1000 (1 second). Lower values = smoother but more CPU usage."),u.time_progress_update_interval||1e3,1e3,100,1e4,100,(t=>n({time_progress_update_interval:t})),"ms")}
                  `):""}

          <!-- Range Mode Configuration -->
          ${"range"===u.percentage_type?this.renderConditionalFieldsGroup((0,m.kg)("editor.bar.range_config.title",b,"Range Configuration"),a.qy`
                    ${this.renderSettingsSection((0,m.kg)("editor.bar.range_config.title",b,"Range Configuration"),(0,m.kg)("editor.bar.range_config.desc",b,"Configure the start and end values for the range visualization."),[{title:(0,m.kg)("editor.bar.range_config.start_entity",b,"Range Start Entity"),description:(0,m.kg)("editor.bar.range_config.start_entity_desc",b,"Entity that provides the start value of the range (e.g., coldest battery cell temperature)."),hass:e,data:{range_start_entity:u.range_start_entity||""},schema:[this.entityField("range_start_entity")],onChange:t=>n({range_start_entity:t.detail.value.range_start_entity})},{title:(0,m.kg)("editor.bar.range_config.start_attribute",b,"Start Attribute (Optional)"),description:(0,m.kg)("editor.bar.range_config.start_attribute_desc",b,"If the value is in an attribute, enter the attribute name here."),hass:e,data:{range_start_attribute:u.range_start_attribute||""},schema:[this.textField("range_start_attribute")],onChange:t=>n({range_start_attribute:t.detail.value.range_start_attribute})},{title:(0,m.kg)("editor.bar.range_config.end_entity",b,"Range End Entity"),description:(0,m.kg)("editor.bar.range_config.end_entity_desc",b,"Entity that provides the end value of the range (e.g., hottest battery cell temperature)."),hass:e,data:{range_end_entity:u.range_end_entity||""},schema:[this.entityField("range_end_entity")],onChange:t=>n({range_end_entity:t.detail.value.range_end_entity})},{title:(0,m.kg)("editor.bar.range_config.end_attribute",b,"End Attribute (Optional)"),description:(0,m.kg)("editor.bar.range_config.end_attribute_desc",b,"If the value is in an attribute, enter the attribute name here."),hass:e,data:{range_end_attribute:u.range_end_attribute||""},schema:[this.textField("range_end_attribute")],onChange:t=>n({range_end_attribute:t.detail.value.range_end_attribute})}])}

                    <!-- Current Value Marker (Optional) -->
                    <div
                      style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 16px; border-left: 3px solid var(--warning-color);"
                    >
                      <div
                        style="font-size: 14px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"
                      >
                        <ha-icon
                          icon="mdi:map-marker"
                          style="color: var(--warning-color);"
                        ></ha-icon>
                        ${(0,m.kg)("editor.bar.range_config.current_marker_title",b,"Current Value Marker (Optional)")}
                      </div>
                      <div
                        style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 16px;"
                      >
                        ${(0,m.kg)("editor.bar.range_config.current_marker_desc",b,"Optionally show a marker indicating the current/average value within the range.")}
                      </div>

                      ${this.renderSettingsSection("","",[{title:(0,m.kg)("editor.bar.range_config.current_entity",b,"Current Value Entity"),description:(0,m.kg)("editor.bar.range_config.current_entity_desc",b,"Entity for the current value marker (e.g., average battery temperature)."),hass:e,data:{range_current_entity:u.range_current_entity||""},schema:[this.entityField("range_current_entity")],onChange:t=>n({range_current_entity:t.detail.value.range_current_entity})},{title:(0,m.kg)("editor.bar.range_config.current_attribute",b,"Current Attribute (Optional)"),description:(0,m.kg)("editor.bar.range_config.current_attribute_desc",b,"If the value is in an attribute, enter the attribute name here."),hass:e,data:{range_current_attribute:u.range_current_attribute||""},schema:[this.textField("range_current_attribute")],onChange:t=>n({range_current_attribute:t.detail.value.range_current_attribute})}])}

                      <div style="margin-top: 16px;">
                        <div
                          style="font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 8px;"
                        >
                          ${(0,m.kg)("editor.bar.range_config.current_color",b,"Marker Color")}
                        </div>
                        <ultra-color-picker
                          .hass=${e}
                          .value=${u.range_current_color||"var(--accent-color)"}
                          @value-changed=${t=>n({range_current_color:t.detail.value})}
                        ></ultra-color-picker>
                      </div>
                    </div>
                  `):""}

          <!-- Manual Min/Max Range Configuration -->
          ${"template"!==u.percentage_type?a.qy`
                  <div
                    style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 16px; border-left: 3px solid var(--primary-color);"
                  >
                    <div
                      style="font-size: 14px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"
                    >
                      <ha-icon
                        icon="mdi:arrow-expand-horizontal"
                        style="color: var(--primary-color);"
                      ></ha-icon>
                      ${(0,m.kg)("editor.bar.range.title",b,"Value Range (Min/Max)")}
                    </div>
                    <div
                      style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 16px;"
                    >
                      ${(0,m.kg)("editor.bar.range.desc",b,"Override auto-detected range. Enter a number or use a Jinja2 template (e.g., {{ states('sensor.max') }}).")}
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                      <!-- Min Value -->
                      <div style="display: flex; flex-direction: column; gap: 4px;">
                        <span
                          style="font-size: 13px; font-weight: 500; color: var(--primary-text-color);"
                        >
                          ${(0,m.kg)("editor.bar.range.min",b,"Minimum")}
                        </span>
                        <ha-textfield
                          .value=${u.percentage_min_template_mode&&u.percentage_min_template?u.percentage_min_template:void 0!==u.percentage_min?String(u.percentage_min):""}
                          placeholder="${(0,m.kg)("editor.bar.range.auto",b,"Auto (0)")}"
                          @input=${t=>{const e=t.target,i=((null==e?void 0:e.value)||"").trim();clearTimeout(this._templateInputDebounce),this._templateInputDebounce=setTimeout((()=>{if(i.includes("{{")||i.includes("{%"))n({percentage_min_template_mode:!0,percentage_min_template:i,percentage_min:void 0});else if(""===i)n({percentage_min_template_mode:!1,percentage_min_template:"",percentage_min:void 0});else{const t=parseFloat(i);n({percentage_min_template_mode:!1,percentage_min_template:"",percentage_min:isNaN(t)?void 0:t})}}),300)}}
                          style="width: 100%;"
                        ></ha-textfield>
                        ${u.percentage_min_template_mode&&u.percentage_min_template&&(u.percentage_min_template.includes("{{")||u.percentage_min_template.includes("{%"))?a.qy`<span
                              style="font-size: 10px; color: var(--primary-color); margin-top: 2px;"
                            >
                              <ha-icon icon="mdi:code-braces" style="font-size: 10px;"></ha-icon>
                              Template
                            </span>`:""}
                      </div>

                      <!-- Max Value -->
                      <div style="display: flex; flex-direction: column; gap: 4px;">
                        <span
                          style="font-size: 13px; font-weight: 500; color: var(--primary-text-color);"
                        >
                          ${(0,m.kg)("editor.bar.range.max",b,"Maximum")}
                        </span>
                        <ha-textfield
                          .value=${u.percentage_max_template_mode&&u.percentage_max_template?u.percentage_max_template:void 0!==u.percentage_max?String(u.percentage_max):""}
                          placeholder="${(0,m.kg)("editor.bar.range.auto",b,"Auto (100)")}"
                          @input=${t=>{const e=t.target,i=((null==e?void 0:e.value)||"").trim();clearTimeout(this._templateInputDebounce),this._templateInputDebounce=setTimeout((()=>{if(i.includes("{{")||i.includes("{%"))n({percentage_max_template_mode:!0,percentage_max_template:i,percentage_max:void 0});else if(""===i)n({percentage_max_template_mode:!1,percentage_max_template:"",percentage_max:void 0});else{const t=parseFloat(i);n({percentage_max_template_mode:!1,percentage_max_template:"",percentage_max:isNaN(t)?void 0:t})}}),300)}}
                          style="width: 100%;"
                        ></ha-textfield>
                        ${u.percentage_max_template_mode&&u.percentage_max_template&&(u.percentage_max_template.includes("{{")||u.percentage_max_template.includes("{%"))?a.qy`<span
                              style="font-size: 10px; color: var(--primary-color); margin-top: 2px;"
                            >
                              <ha-icon icon="mdi:code-braces" style="font-size: 10px;"></ha-icon>
                              Template
                            </span>`:""}
                      </div>
                    </div>
                  </div>
                `:""}

          <!-- Bar Percentage Entity (only for Entity percentage type; template/difference/attribute/range have their own config) -->
          ${u.percentage_type&&"entity"!==u.percentage_type?"":a.qy`
                  <div style="margin-top: 24px;">
                    ${o.Q.renderField((0,m.kg)("editor.bar.entity.title",b,"Bar Percentage Entity"),u.entity?(0,m.kg)("editor.bar.entity.desc_present",b,"The entity that provides the percentage value for the bar."):(0,m.kg)("editor.bar.entity.desc_empty",b,"Select an entity that provides a percentage value (0-100). Battery sensors are ideal for bars."),e,{entity:u.entity||""},[o.Q.createSchemaItem("entity",{entity:{filter:[{domain:"sensor"},{domain:"input_number"}]}})],(t=>n({entity:t.detail.value.entity})))}
                    ${u.entity?"":a.qy`
                          <div
                            style="color: var(--warning-color); font-size: 12px; margin-top: 4px; font-style: italic;"
                          >
                            <ha-icon
                              icon="mdi:information-outline"
                              style="font-size: 14px; margin-right: 4px;"
                            ></ha-icon>
                            ${(0,m.kg)("editor.bar.entity.no_entity_warning",b,"No entity selected - Please choose a sensor with values between 0-100")}
                          </div>
                        `}
                  </div>
                `}

          <!-- Limit Value Entity -->
          <div style="margin-top: 24px;">
            ${o.Q.renderField((0,m.kg)("editor.bar.limit_entity.title",b,"Limit Value Entity (optional)"),(0,m.kg)("editor.bar.limit_entity.desc",b,"Optional: Add a vertical indicator line on the bar (e.g. charge limit for EV battery)."),e,{limit_entity:u.limit_entity||""},[o.Q.createSchemaItem("limit_entity",{entity:{}})],(t=>n({limit_entity:t.detail.value.limit_entity})))}
          </div>
        </div>

        <!-- Bar Appearance Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            ${(0,m.kg)("editor.bar.appearance.title",b,"Bar Appearance")}
          </div>

          <!-- Bar Style -->
          <div class="field-group" style="margin-bottom: 16px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 4px;"
            >
              ${(0,m.kg)("editor.bar.appearance.style",b,"Bar Style")}
            </div>
            <div
              class="field-description"
              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
            >
              ${(0,m.kg)("editor.bar.appearance.style_desc",b,"Choose the visual style of the progress bar.")}
            </div>
            ${this.renderUcForm(e,{bar_style:u.bar_style||"flat"},[this.selectField("bar_style",[{value:"flat",label:(0,m.kg)("editor.bar.appearance.style_flat",b,"Flat (Default)")},{value:"glossy",label:(0,m.kg)("editor.bar.appearance.style_glossy",b,"Glossy")},{value:"embossed",label:(0,m.kg)("editor.bar.appearance.style_embossed",b,"Embossed")},{value:"inset",label:(0,m.kg)("editor.bar.appearance.style_inset",b,"Inset")},{value:"gradient-overlay",label:(0,m.kg)("editor.bar.appearance.style_gradient",b,"Gradient Overlay")},{value:"neon-glow",label:(0,m.kg)("editor.bar.appearance.style_neon",b,"Neon Glow")},{value:"outline",label:(0,m.kg)("editor.bar.appearance.style_outline",b,"Outline")},{value:"glass",label:(0,m.kg)("editor.bar.appearance.style_glass",b,"Glass")},{value:"metallic",label:(0,m.kg)("editor.bar.appearance.style_metallic",b,"Metallic")},{value:"neumorphic",label:(0,m.kg)("editor.bar.appearance.style_neumorphic",b,"Neumorphic")},{value:"dashed",label:(0,m.kg)("editor.bar.appearance.style_dashed",b,"Dashed")},{value:"dots",label:(0,m.kg)("editor.bar.appearance.style_dots",b,"Dots")},{value:"minimal",label:(0,m.kg)("editor.bar.appearance.style_minimal",b,"Minimal")}])],(t=>{const e=t.detail.value.bar_style;e!==(u.bar_style||"flat")&&(n({bar_style:e}),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}),!1)}
          </div>

          <!-- Bar Fill Direction -->
          <div class="field-group" style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important;"
            >
              ${(0,m.kg)("editor.bar.appearance.direction",b,"Fill Direction")}
            </div>
            <div
              class="field-description"
              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
            >
              ${(0,m.kg)("editor.bar.appearance.direction_desc",b,"Choose which direction the bar fills from as the value increases.")}
            </div>
            <div
              style="display: flex; gap: 8px; justify-content: flex-start; flex-wrap: wrap;"
            >
              <button
                type="button"
                style="padding: 8px 12px; border: 2px solid ${"left-to-right"===(u.bar_direction||"left-to-right")?"var(--primary-color)":"var(--divider-color)"}; background: ${"left-to-right"===(u.bar_direction||"left-to-right")?"var(--primary-color)":"transparent"}; color: ${"left-to-right"===(u.bar_direction||"left-to-right")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                @click=${()=>n({bar_direction:"left-to-right"})}
              >
                <ha-icon
                  icon="mdi:arrow-right"
                  style="font-size: 16px; flex-shrink: 0;"
                ></ha-icon>
                <span
                  style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                  >${(0,m.kg)("editor.bar.appearance.left_to_right",b,"Left to Right")}</span
                >
              </button>
              <button
                type="button"
                style="padding: 8px 12px; border: 2px solid ${"right-to-left"===(u.bar_direction||"left-to-right")?"var(--primary-color)":"var(--divider-color)"}; background: ${"right-to-left"===(u.bar_direction||"left-to-right")?"var(--primary-color)":"transparent"}; color: ${"right-to-left"===(u.bar_direction||"left-to-right")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                @click=${()=>n({bar_direction:"right-to-left"})}
              >
                <ha-icon
                  icon="mdi:arrow-left"
                  style="font-size: 16px; flex-shrink: 0;"
                ></ha-icon>
                <span
                  style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                  >${(0,m.kg)("editor.bar.appearance.right_to_left",b,"Right to Left")}</span
                >
              </button>
            </div>
          </div>

          <!-- Bar Height -->
          <div class="field-container" style="margin-bottom: 24px;">
            <div class="field-title">${(0,m.kg)("editor.bar.appearance.height",b,"Bar Height")}</div>
            <div class="field-description">${(0,m.kg)("editor.bar.appearance.height_desc",b,"Adjust the thickness of the progress bar in pixels.")}</div>
            <div class="number-range-control">
              <input
                type="range"
                class="range-slider"
                min="8"
                max="60"
                step="2"
                .value="${null!==(l=u.height)&&void 0!==l?l:20}"
                @input=${t=>{const e=t.target,i=parseInt(e.value);n({height:i})}}
              />
              <input
                type="number"
                class="range-input"
                min="8"
                step="2"
                .value="${null!==(s=u.height)&&void 0!==s?s:20}"
                @input=${t=>{const e=t.target,i=parseInt(e.value);isNaN(i)||n({height:i})}}
                @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,i=parseInt(e.value)||20,a="ArrowUp"===t.key?2:-2,r=Math.max(8,i+a);n({height:r})}}}
              />
              <button
                class="range-reset-btn"
                @click=${()=>n({height:20})}
                title="${(0,m.kg)("editor.fields.reset_default_value",b,"Reset to default ({value})").replace("{value}","20px")}"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>

          <!-- Border Radius -->
          <div class="field-container" style="margin-bottom: 24px;">
            <div class="field-title">${(0,m.kg)("editor.bar.appearance.border_radius",b,"Border Radius")}</div>
            <div class="field-description">${(0,m.kg)("editor.bar.appearance.border_radius_desc",b,"Control the rounded corners of the bar.")}</div>
            <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
              <input
                type="range"
                class="gap-slider"
                min="0"
                max="50"
                step="1"
                .value="${null!==(d=u.border_radius)&&void 0!==d?d:10}"
                @input=${t=>{const e=t.target,i=parseInt(e.value);n({border_radius:i})}}
              />
              <input
                type="number"
                class="gap-input"
                min="0"
                step="1"
                .value="${null!==(p=u.border_radius)&&void 0!==p?p:10}"
                @input=${t=>{const e=t.target,i=parseInt(e.value);isNaN(i)||n({border_radius:i})}}
                @keydown=${t=>{var e;if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const i=t.target,a=null!==(e=parseInt(i.value))&&void 0!==e?e:10,r="ArrowUp"===t.key?1:-1,o=Math.max(0,Math.min(50,a+r));n({border_radius:o})}}}
              />
              <button
                class="reset-btn"
                @click=${()=>n({border_radius:10})}
                title="${(0,m.kg)("editor.fields.reset_default_value",b,"Reset to default ({value})").replace("{value}","10")}"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>

          <!-- Bar Width -->
          <div class="field-container" style="margin-bottom: 24px;">
            <div class="field-title">${(0,m.kg)("editor.bar.appearance.width",b,"Bar Width")}</div>
            <div class="field-description">
              ${(0,m.kg)("editor.bar.appearance.width_desc",b,"Set the width of the bar as a percentage of the container.")}
            </div>
            <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
              <input
                type="range"
                class="gap-slider"
                min="10"
                max="100"
                step="5"
                .value="${u.bar_width||100}"
                @input=${t=>{const e=t.target,i=parseInt(e.value);n({bar_width:i})}}
              />
              <input
                type="number"
                class="gap-input"
                min="10"
                step="5"
                .value="${u.bar_width||100}"
                @input=${t=>{const e=t.target,i=parseInt(e.value);isNaN(i)||n({bar_width:i})}}
                @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,i=parseInt(e.value)||100,a="ArrowUp"===t.key?5:-5,r=Math.max(10,Math.min(100,i+a));n({bar_width:r})}}}
              />
              <button
                class="reset-btn"
                @click=${()=>n({bar_width:100})}
                title="${(0,m.kg)("editor.fields.reset_default_value",b,"Reset to default ({value})").replace("{value}","100")}"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>

          <!-- Bar Alignment with Icons -->
          ${(u.bar_width||100)<100?a.qy`
                  <div class="field-group" style="margin-bottom: 16px;">
                    <div
                      class="field-title"
                      style="font-size: 16px !important; font-weight: 600 !important;"
                    >
                      ${(0,m.kg)("editor.bar.appearance.alignment",b,"Bar Alignment")}
                    </div>
                    <div
                      class="field-description"
                      style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                    >
                      ${(0,m.kg)("editor.bar.appearance.alignment_desc",b,"Choose how to align the bar when it's less than 100% width.")}
                    </div>
                    <div
                      style="display: flex; gap: 8px; justify-content: flex-start; flex-wrap: wrap;"
                    >
                      <button
                        type="button"
                        style="padding: 8px 12px; border: 2px solid ${"left"===(u.bar_alignment||"center")?"var(--primary-color)":"var(--divider-color)"}; background: ${"left"===(u.bar_alignment||"center")?"var(--primary-color)":"transparent"}; color: ${"left"===(u.bar_alignment||"center")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                        @click=${()=>n({bar_alignment:"left"})}
                      >
                        <ha-icon
                          icon="mdi:format-align-left"
                          style="font-size: 16px; flex-shrink: 0;"
                        ></ha-icon>
                        <span
                          style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                          >${(0,m.kg)("editor.common.left",b,"Left")}</span
                        >
                      </button>
                      <button
                        type="button"
                        style="padding: 8px 12px; border: 2px solid ${"center"===(u.bar_alignment||"center")?"var(--primary-color)":"var(--divider-color)"}; background: ${"center"===(u.bar_alignment||"center")?"var(--primary-color)":"transparent"}; color: ${"center"===(u.bar_alignment||"center")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                        @click=${()=>n({bar_alignment:"center"})}
                      >
                        <ha-icon
                          icon="mdi:format-align-center"
                          style="font-size: 16px; flex-shrink: 0;"
                        ></ha-icon>
                        <span
                          style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                          >${(0,m.kg)("editor.common.center",b,"Center")}</span
                        >
                      </button>
                      <button
                        type="button"
                        style="padding: 8px 12px; border: 2px solid ${"right"===(u.bar_alignment||"center")?"var(--primary-color)":"var(--divider-color)"}; background: ${"right"===(u.bar_alignment||"center")?"var(--primary-color)":"transparent"}; color: ${"right"===(u.bar_alignment||"center")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                        @click=${()=>n({bar_alignment:"right"})}
                      >
                        <ha-icon
                          icon="mdi:format-align-right"
                          style="font-size: 16px; flex-shrink: 0;"
                        ></ha-icon>
                        <span
                          style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                          >${(0,m.kg)("editor.common.right",b,"Right")}</span
                        >
                      </button>
                    </div>
                  </div>
                `:""}

          <!-- Label Alignment -->
          ${u.left_enabled||u.right_enabled?a.qy`
                  <div class="field-group">
                    <div
                      class="field-title"
                      style="font-size: 16px !important; font-weight: 600 !important;"
                    >
                      ${(0,m.kg)("editor.bar.labels.alignment",b,"Label Alignment")}
                    </div>
                    <div
                      class="field-description"
                      style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                    >
                      ${(0,m.kg)("editor.bar.labels.alignment_desc",b,"Control how the left and right side labels are positioned.")}
                    </div>
                    ${this.renderUcForm(e,{label_alignment:u.label_alignment||"space-between"},[this.selectField("label_alignment",[{value:"left",label:(0,m.kg)("editor.common.left",b,"Left")},{value:"center",label:(0,m.kg)("editor.common.center",b,"Center")},{value:"right",label:(0,m.kg)("editor.common.right",b,"Right")},{value:"space-between",label:(0,m.kg)("editor.common.space_between",b,"Space Between")}])],(t=>{const e=t.detail.value.label_alignment;e!==(u.label_alignment||"space-between")&&(n({label_alignment:e}),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}),!1)}
                  </div>
                `:""}

          <!-- Glass Blur Amount (only show when glass style is selected) -->
          ${"glass"===u.bar_style?a.qy`
                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">
                      ${(0,m.kg)("editor.bar.appearance.glass_blur",b,"Glass Blur Amount")}
                    </div>
                    <div class="field-description">
                      ${(0,m.kg)("editor.bar.appearance.glass_blur_desc",b,"Adjust the blur intensity of the glass effect.")}
                    </div>
                    <div
                      class="gap-control-container"
                      style="display: flex; align-items: center; gap: 12px;"
                    >
                      <input
                        type="range"
                        class="gap-slider"
                        min="0"
                        max="20"
                        step="1"
                        .value="${u.glass_blur_amount||8}"
                        @input=${t=>{const e=t.target,i=parseInt(e.value);isNaN(i)||n({glass_blur_amount:i})}}
                      />
                      <input
                        type="number"
                        class="gap-input"
                        min="0"
                        max="20"
                        step="1"
                        .value="${u.glass_blur_amount||8}"
                        @input=${t=>{const e=t.target,i=parseInt(e.value);isNaN(i)||n({glass_blur_amount:i})}}
                        @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,i=parseInt(e.value)||8,a="ArrowUp"===t.key?1:-1,r=Math.max(0,Math.min(20,i+a));n({glass_blur_amount:r})}}}
                      />
                      <button
                        class="reset-btn"
                        @click=${()=>n({glass_blur_amount:8})}
                        title="${(0,m.kg)("editor.fields.reset_default_value",b,"Reset to default ({value})").replace("{value}","8")}"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>
                `:""}
        </div>

        <!-- Scale/Tick Marks Configuration Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;">
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px; margin: 0; display: flex; align-items: center; gap: 8px;"
            >
              <ha-icon icon="mdi:ruler" style="color: var(--primary-color);"></ha-icon>
              ${(0,m.kg)("editor.bar.scale.title",b,"Scale / Tick Marks")}
            </div>
            <ha-switch
              .checked=${u.show_scale||!1}
              @change=${t=>n({show_scale:t.target.checked})}
            ></ha-switch>
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 16px;"
          >
            ${(0,m.kg)("editor.bar.scale.desc",b,"Add tick marks and labels along the bar to show the scale. Useful for visualizing ranges like temperature or time.")}
          </div>

          ${u.show_scale?a.qy`
                  <!-- Scale Divisions -->
                  <div class="field-group" style="margin-bottom: 16px;">
                    <div
                      class="field-title"
                      style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                    >
                      ${(0,m.kg)("editor.bar.scale.divisions",b,"Number of Divisions")}
                    </div>
                    <div
                      class="field-description"
                      style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                    >
                      ${(0,m.kg)("editor.bar.scale.divisions_desc",b,"How many segments to divide the scale into (e.g., 4 = marks at 0%, 25%, 50%, 75%, 100%).")}
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <ha-slider
                        style="flex: 1;"
                        .min=${2}
                        .max=${20}
                        .step=${1}
                        .value=${u.scale_divisions||5}
                        @change=${t=>n({scale_divisions:parseInt(t.target.value,10)})}
                      ></ha-slider>
                      <span style="min-width: 30px; text-align: center; font-weight: 600;">
                        ${u.scale_divisions||5}
                      </span>
                    </div>
                  </div>

                  <!-- Show Labels Toggle -->
                  <div
                    class="field-group"
                    style="margin-bottom: 16px; display: grid !important; grid-template-columns: minmax(0,1fr) auto; align-items: center; column-gap: 12px; width: 100%;"
                  >
                    <div>
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                      >
                        ${(0,m.kg)("editor.bar.scale.show_labels",b,"Show Labels")}
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px !important; font-weight: 400 !important;"
                      >
                        ${(0,m.kg)("editor.bar.scale.show_labels_desc",b,"Display numeric values at each tick mark.")}
                      </div>
                    </div>
                    <ha-switch
                      .checked=${!1!==u.scale_show_labels}
                      @change=${t=>n({scale_show_labels:t.target.checked})}
                    ></ha-switch>
                  </div>

                  ${!1!==u.scale_show_labels?a.qy`
                        <!-- Label Size -->
                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                          >
                            ${(0,m.kg)("editor.bar.scale.label_size",b,"Label Size")}
                          </div>
                          <div style="display: flex; align-items: center; gap: 12px;">
                            <ha-slider
                              style="flex: 1;"
                              .min=${8}
                              .max=${16}
                              .step=${1}
                              .value=${u.scale_label_size||10}
                              @change=${t=>n({scale_label_size:parseInt(t.target.value,10)})}
                            ></ha-slider>
                            <span style="min-width: 40px; text-align: center; font-weight: 600;">
                              ${u.scale_label_size||10}px
                            </span>
                          </div>
                        </div>

                        <!-- Label Color -->
                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                          >
                            ${(0,m.kg)("editor.bar.scale.label_color",b,"Label Color")}
                          </div>
                          <ultra-color-picker
                            .hass=${e}
                            .value=${u.scale_label_color||""}
                            .placeholder=${"var(--secondary-text-color)"}
                            @value-changed=${t=>n({scale_label_color:t.detail.value})}
                          ></ultra-color-picker>
                        </div>
                      `:""}

                  <!-- Scale Position -->
                  <div class="field-group" style="margin-bottom: 0;">
                    <div
                      class="field-title"
                      style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                    >
                      ${(0,m.kg)("editor.bar.scale.position",b,"Scale Position")}
                    </div>
                    <div
                      class="field-description"
                      style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                    >
                      ${(0,m.kg)("editor.bar.scale.position_desc",b,"Position the scale above or below the bar.")}
                    </div>
                    <div style="display: flex; gap: 8px;">
                      <button
                        type="button"
                        style="padding: 8px 16px; border: 2px solid ${"above"===u.scale_position?"var(--primary-color)":"var(--divider-color)"}; background: ${"above"===u.scale_position?"var(--primary-color)":"transparent"}; color: ${"above"===u.scale_position?"var(--text-primary-color)":"var(--primary-text-color)"}; border-radius: 8px; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 6px;"
                        @click=${()=>n({scale_position:"above"})}
                      >
                        <ha-icon icon="mdi:arrow-up" style="--mdc-icon-size: 16px;"></ha-icon>
                        ${(0,m.kg)("editor.bar.scale.position_above",b,"Above")}
                      </button>
                      <button
                        type="button"
                        style="padding: 8px 16px; border: 2px solid ${"above"!==u.scale_position?"var(--primary-color)":"var(--divider-color)"}; background: ${"above"!==u.scale_position?"var(--primary-color)":"transparent"}; color: ${"above"!==u.scale_position?"var(--text-primary-color)":"var(--primary-text-color)"}; border-radius: 8px; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 6px;"
                        @click=${()=>n({scale_position:"below"})}
                      >
                        <ha-icon icon="mdi:arrow-down" style="--mdc-icon-size: 16px;"></ha-icon>
                        ${(0,m.kg)("editor.bar.scale.position_below",b,"Below")}
                      </button>
                    </div>
                  </div>
                `:a.qy`
                  <div
                    style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                  >
                    ${(0,m.kg)("editor.bar.scale.enable_toggle",b,"Enable the toggle above to configure scale settings")}
                  </div>
                `}
        </div>

        <!-- Minimal Style Icon Configuration Section -->
        ${"minimal"===u.bar_style?a.qy`
                <div
                  class="settings-section"
                  style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
                >
                  <div
                    class="section-title"
                    style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
                  >
                    ${(0,m.kg)("editor.bar.minimal.icon_config",b,"Minimal Style Icon")}
                  </div>

                  <!-- Enable Icon Toggle -->
                  <div
                    class="field-group"
                    style="margin-bottom: 8px; display: grid !important; grid-template-columns: minmax(0,1fr) auto; align-items: center; column-gap: 12px; width: 100%;"
                  >
                    <div>
                      <div
                        class="field-title"
                        style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 4px;"
                      >
                        ${(0,m.kg)("editor.bar.minimal.icon_enabled",b,"Enable Icon")}
                      </div>
                    </div>
                    <ha-switch
                      .checked=${u.minimal_icon_enabled||!1}
                      @change=${t=>{const e=t.target;n({minimal_icon_enabled:e.checked})}}
                    ></ha-switch>
                  </div>

                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
                  >
                    ${(0,m.kg)("editor.bar.minimal.icon_enabled_desc",b,"Enable icon display to replace or enhance the dot indicator in minimal bar style.")}
                  </div>

                  ${u.minimal_icon_enabled?a.qy`
                        <!-- Icon Picker -->
                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                          >
                            ${(0,m.kg)("editor.bar.minimal.icon",b,"Icon")}
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                          >
                            ${(0,m.kg)("editor.bar.minimal.icon_desc",b,"Select the icon to display (e.g., mdi:battery).")}
                          </div>
                          <ha-icon-picker
                            .hass=${e}
                            .value=${u.minimal_icon||""}
                            .placeholder=${"mdi:circle"}
                            @value-changed=${t=>n({minimal_icon:t.detail.value})}
                          ></ha-icon-picker>
                        </div>

                        <!-- Icon Display Mode -->
                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                          >
                            ${(0,m.kg)("editor.bar.minimal.icon_mode",b,"Display Mode")}
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                          >
                            ${(0,m.kg)("editor.bar.minimal.icon_mode_desc",b,"Choose how the icon is displayed with the dot.")}
                          </div>
                          ${this.renderUcForm(e,{minimal_icon_mode:u.minimal_icon_mode||"icon-in-dot"},[this.selectField("minimal_icon_mode",[{value:"dot-only",label:(0,m.kg)("editor.bar.minimal.mode_dot_only",b,"Dot Only")},{value:"icon-only",label:(0,m.kg)("editor.bar.minimal.mode_icon_only",b,"Icon Only")},{value:"icon-in-dot",label:(0,m.kg)("editor.bar.minimal.mode_icon_in_dot",b,"Icon in Dot")}])],(t=>{const e=t.detail.value.minimal_icon_mode;e!==(u.minimal_icon_mode||"icon-in-dot")&&(n({minimal_icon_mode:e}),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}),!1)}
                        </div>

                        <!-- Icon Size Auto Toggle -->
                        <div
                          class="field-group"
                          style="margin-bottom: 8px; display: grid !important; grid-template-columns: minmax(0,1fr) auto; align-items: center; column-gap: 12px; width: 100%;"
                        >
                          <div>
                            <div
                              class="field-title"
                              style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                            >
                              ${(0,m.kg)("editor.bar.minimal.icon_size_auto",b,"Auto Size")}
                            </div>
                          </div>
                          <ha-switch
                            .checked=${!1!==u.minimal_icon_size_auto}
                            @change=${t=>{const e=t.target;n({minimal_icon_size_auto:e.checked})}}
                          ></ha-switch>
                        </div>

                        <div
                          class="field-description"
                          style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
                        >
                          ${(0,m.kg)("editor.bar.minimal.icon_size_auto_desc",b,"Automatically scale icon size based on bar height.")}
                        </div>

                        <!-- Manual Icon Size (only if auto is disabled) -->
                        ${!1===u.minimal_icon_size_auto?a.qy`
                              <div class="field-container" style="margin-bottom: 24px;">
                                <div class="field-title">
                                  ${(0,m.kg)("editor.bar.minimal.icon_size",b,"Icon Size")}
                                </div>
                                <div class="field-description">
                                  ${(0,m.kg)("editor.bar.minimal.icon_size_desc",b,"Manually set the icon size in pixels.")}
                                </div>
                                <div class="number-range-control">
                                  <input
                                    type="range"
                                    class="range-slider"
                                    min="8"
                                    max="48"
                                    step="1"
                                    .value="${u.minimal_icon_size||24}"
                                    @input=${t=>{const e=t.target,i=parseInt(e.value);n({minimal_icon_size:i})}}
                                  />
                                  <input
                                    type="number"
                                    class="range-input"
                                    min="8"
                                    step="1"
                                    .value="${u.minimal_icon_size||24}"
                                    @input=${t=>{const e=t.target,i=parseInt(e.value);isNaN(i)||n({minimal_icon_size:i})}}
                                    @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,i=parseInt(e.value)||16,a="ArrowUp"===t.key?1:-1,r=Math.max(8,Math.min(48,i+a));n({minimal_icon_size:r})}}}
                                  />
                                  <button
                                    class="range-reset-btn"
                                    @click=${()=>n({minimal_icon_size:24})}
                                    title="${(0,m.kg)("editor.fields.reset_default_value",b,"Reset to default ({value})").replace("{value}","24")}"
                                  >
                                    <ha-icon icon="mdi:refresh"></ha-icon>
                                  </button>
                                </div>
                              </div>
                            `:""}

                        <!-- Use Dot Color Toggle -->
                        <div
                          class="field-group"
                          style="margin-bottom: 8px; display: grid !important; grid-template-columns: minmax(0,1fr) auto; align-items: center; column-gap: 12px; width: 100%;"
                        >
                          <div>
                            <div
                              class="field-title"
                              style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                            >
                              ${(0,m.kg)("editor.bar.minimal.use_dot_color",b,"Use Dot Color")}
                            </div>
                          </div>
                          <ha-switch
                            .checked=${!1!==u.minimal_icon_use_dot_color}
                            @change=${t=>{const e=t.target;n({minimal_icon_use_dot_color:e.checked})}}
                          ></ha-switch>
                        </div>

                        <div
                          class="field-description"
                          style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
                        >
                          ${(0,m.kg)("editor.bar.minimal.use_dot_color_desc",b,"Use the dot color (including gradient colors) for the icon.")}
                        </div>

                        <!-- Custom Icon Color (only if use_dot_color is false) -->
                        ${!1===u.minimal_icon_use_dot_color?a.qy`
                              <div class="field-container" style="margin-bottom: 16px;">
                                <div class="field-title">
                                  ${(0,m.kg)("editor.bar.minimal.icon_color",b,"Icon Color")}
                                </div>
                                <div class="field-description">
                                  ${(0,m.kg)("editor.bar.minimal.icon_color_desc",b,"Set a custom color for the icon.")}
                                </div>
                                <ultra-color-picker
                                  style="width: 100%;"
                                  .value=${u.minimal_icon_color||""}
                                  .defaultValue=${"var(--primary-color)"}
                                  .hass=${e}
                                  @value-changed=${t=>n({minimal_icon_color:t.detail.value})}
                                ></ultra-color-picker>
                              </div>
                            `:""}
                      `:a.qy`
                        <div
                          style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                        >
                          ${(0,m.kg)("editor.bar.minimal.enable_toggle",b,"Enable the toggle above to configure icon settings")}
                        </div>
                      `}
                </div>
              `:""}

        <!-- Percentage Text Display Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;">
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px; margin: 0;"
            >
              ${(0,m.kg)("editor.bar.text_display.title",b,"Text Display")}
            </div>
            <ha-switch
              .checked=${!1!==u.show_percentage}
              @change=${t=>n({show_percentage:t.target.checked})}
            ></ha-switch>
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 16px;"
          >
            ${(0,m.kg)("editor.bar.text_display.desc",b,"Control the visibility and appearance of text values shown directly on the bar. For difference and template modes, you can choose to display raw entity values instead of percentages.")}
          </div>

          

          ${!1!==u.show_percentage?a.qy`
                  <!-- Display Type Toggle - Only show for difference and template types -->
                  ${"difference"===u.percentage_type||"template"===u.percentage_type?a.qy`
                        <div
                          class="field-group"
                          style="margin-bottom: 16px; display: grid !important; grid-template-columns: minmax(0,1fr) auto; align-items: center; column-gap: 12px; width: 100%;"
                        >
                          <div
                            class="field-title"
                            style="font-size: 16px !important; font-weight: 600 !important; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                          >
                            ${(0,m.kg)("editor.bar.text_display.show_value",b,"Show Value Instead of Percentage")}
                          </div>
                          <ha-switch
                            style="justify-self: end;"
                            .checked=${u.show_value||!1}
                            @change=${t=>n({show_value:t.target.checked})}
                          ></ha-switch>
                        </div>
                        <div
                          class="field-description"
                          style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
                        >
                          ${(0,m.kg)("editor.bar.text_display.show_value_desc",b,'When enabled, shows the actual entity value instead of percentage. Useful for displaying raw sensor values like "45 kWh" instead of "75%".')}
                        </div>
                      `:""}

                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">
                      ${(0,m.kg)("editor.bar.text_display.text_size",b,"Text Size")}
                    </div>
                    <div class="field-description">
                      ${(0,m.kg)("editor.bar.text_display.text_size_desc",b,"Adjust the size of the text displayed on the bar.")}
                    </div>
                    <div class="number-range-control">
                      <input
                        type="range"
                        class="range-slider"
                        min="8"
                        max="100"
                        step="1"
                        .value="${u.percentage_text_size||14}"
                        @input=${t=>{const e=t.target,i=parseInt(e.value);n({percentage_text_size:i})}}
                      />
                      <input
                        type="number"
                        class="range-input"
                        min="8"
                        step="1"
                        .value="${u.percentage_text_size||14}"
                        @input=${t=>{const e=t.target,i=parseInt(e.value);isNaN(i)||n({percentage_text_size:i})}}
                        @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,i=parseInt(e.value)||14,a="ArrowUp"===t.key?1:-1,r=Math.max(8,i+a);n({percentage_text_size:r})}}}
                      />
                      <button
                        class="range-reset-btn"
                        @click=${()=>n({percentage_text_size:14})}
                        title="${(0,m.kg)("editor.fields.reset_default_value",b,"Reset to default ({value})").replace("{value}","14")}"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>
                  <div class="field-group" style="margin-bottom: 16px;">
                    <div class="field-title">
                      ${(0,m.kg)("editor.bar.text_display.text_alignment",b,"Text Alignment")}
                    </div>
                    ${this.renderUcForm(e,{percentage_text_alignment:u.percentage_text_alignment||"center"},[this.selectField("percentage_text_alignment",[{value:"left",label:(0,m.kg)("editor.common.left",b,"Left")},{value:"center",label:(0,m.kg)("editor.common.center",b,"Center")},{value:"right",label:(0,m.kg)("editor.common.right",b,"Right")},{value:"follow-fill",label:(0,m.kg)("editor.bar.text_display.follow_fill",b,"Follow Fill")}])],(t=>{const e=t.detail.value.percentage_text_alignment;e!==(u.percentage_text_alignment||"center")&&(n({percentage_text_alignment:e}),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}),!1)}
                  </div>

                  <!-- Text Formatting -->
                  <div class="field-container" style="margin-bottom: 16px;">
                    <div class="field-title">
                      ${(0,m.kg)("editor.bar.text_display.text_formatting",b,"Text Formatting")}
                    </div>
                    <div class="field-description">
                      ${(0,m.kg)("editor.bar.text_display.text_formatting_desc",b,"Apply formatting styles to the percentage text.")}
                    </div>
                    <div class="format-buttons" style="display: flex; gap: 8px; flex-wrap: wrap;">
                      <button
                        class="format-btn ${u.percentage_text_bold?"active":""}"
                        @click=${()=>n({percentage_text_bold:!u.percentage_text_bold})}
                        style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${u.percentage_text_bold?"var(--primary-color)":"var(--secondary-background-color)"}; cursor: pointer; transition: all 0.2s ease; color: ${u.percentage_text_bold?"var(--text-primary-color)":"var(--primary-text-color)"};"
                        title="Bold"
                      >
                        <ha-icon icon="mdi:format-bold"></ha-icon>
                      </button>
                      <button
                        class="format-btn ${u.percentage_text_italic?"active":""}"
                        @click=${()=>n({percentage_text_italic:!u.percentage_text_italic})}
                        style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${u.percentage_text_italic?"var(--primary-color)":"var(--secondary-background-color)"}; cursor: pointer; transition: all 0.2s ease; color: ${u.percentage_text_italic?"var(--text-primary-color)":"var(--primary-text-color)"};"
                        title="Italic"
                      >
                        <ha-icon icon="mdi:format-italic"></ha-icon>
                      </button>
                      <button
                        class="format-btn ${u.percentage_text_strikethrough?"active":""}"
                        @click=${()=>n({percentage_text_strikethrough:!u.percentage_text_strikethrough})}
                        style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${u.percentage_text_strikethrough?"var(--primary-color)":"var(--secondary-background-color)"}; cursor: pointer; transition: all 0.2s ease; color: ${u.percentage_text_strikethrough?"var(--text-primary-color)":"var(--primary-text-color)"};"
                        title="Strikethrough"
                      >
                        <ha-icon icon="mdi:format-strikethrough"></ha-icon>
                      </button>
                    </div>
                  </div>

                  <!-- Text Color -->
                  <div class="field-container" style="margin-bottom: 16px;">
                    <div class="field-title">
                      ${(0,m.kg)("editor.bar.colors.text_color",b,"Text Color")}
                    </div>
                    <div class="field-description">
                      ${(0,m.kg)("editor.bar.colors.text_color_desc",b,"Choose the color for the text displayed on the bar.")}
                    </div>
                    <ultra-color-picker
                      style="width: 100%;"
                      .value=${u.percentage_text_color||""}
                      .defaultValue=${"var(--primary-text-color)"}
                      .hass=${e}
                      @value-changed=${t=>n({percentage_text_color:t.detail.value})}
                    ></ultra-color-picker>
                  </div>
                `:""}
        </div>

        <!-- Left Side Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 0; border-bottom: none;"
          >
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); letter-spacing: 0.5px;"
            >
              ${(0,m.kg)("editor.bar.left.title",b,"Left Side")}
            </div>
            <ha-switch
              .checked=${u.left_enabled||!1}
              @change=${t=>{const e=t.target.checked;n(e?{left_enabled:!0,left_title:u.left_title||"Fuel",left_entity:u.left_entity||"",left_template_mode:u.left_template_mode||!1,left_title_size:u.left_title_size||14,left_value_size:u.left_value_size||14,left_title_color:u.left_title_color||"var(--primary-text-color)",left_value_color:u.left_value_color||"var(--primary-text-color)"}:{left_enabled:!1,left_title:"",left_entity:"",left_template_mode:!1,left_template:""})}}
            ></ha-switch>
          </div>

          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
          >
            ${(0,m.kg)("editor.bar.left.desc",b,"Configure the title and entity value displayed on the left side of the bar. This is useful for showing labels like 'Range' or 'Battery' along with their values.")}
          </div>

          ${u.left_enabled?a.qy`
                  <div class="field-group" style="margin-bottom: 16px;">
                    <ha-form
                      .hass=${e}
                      .data=${{left_title:u.left_title||""}}
                      .schema=${[{name:"left_title",selector:{text:{}},label:""}]}
                      .computeLabel=${()=>""}
                      @value-changed=${t=>n({left_title:t.detail.value.left_title})}
                    ></ha-form>
                  </div>

                  <!-- Left Entity (value source) -->
                  <div class="field-group" style="margin-bottom: 16px;">
                    <ha-form
                      .hass=${e}
                      .data=${{left_entity:u.left_entity||""}}
                      .schema=${[{name:"left_entity",selector:{entity:{}},label:""}]}
                      .computeLabel=${()=>""}
                      @value-changed=${t=>n({left_entity:t.detail.value.left_entity})}
                    ></ha-form>
                  </div>

                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">
                      ${(0,m.kg)("editor.bar.left.title_size",b,"Title Size")}
                    </div>
                    <div class="number-range-control">
                      <input
                        type="range"
                        class="range-slider"
                        min="8"
                        max="32"
                        step="1"
                        .value="${u.left_title_size||14}"
                        @input=${t=>{const e=t.target,i=parseInt(e.value);n({left_title_size:i})}}
                      />
                      <input
                        type="number"
                        class="range-input"
                        min="8"
                        step="1"
                        .value="${u.left_title_size||14}"
                        @input=${t=>{const e=t.target,i=parseInt(e.value);isNaN(i)||n({left_title_size:i})}}
                        @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,i=parseInt(e.value)||14,a="ArrowUp"===t.key?1:-1,r=Math.max(8,Math.min(32,i+a));n({left_title_size:r})}}}
                      />
                      <button
                        class="range-reset-btn"
                        @click=${()=>n({left_title_size:14})}
                        title="${(0,m.kg)("editor.fields.reset_default_value",b,"Reset to default ({value})").replace("{value}","14")}"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>

                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">
                      ${(0,m.kg)("editor.bar.left.value_size",b,"Value Size")}
                    </div>
                    <div class="number-range-control">
                      <input
                        type="range"
                        class="range-slider"
                        min="8"
                        max="32"
                        step="1"
                        .value="${u.left_value_size||14}"
                        @input=${t=>{const e=t.target,i=parseInt(e.value);n({left_value_size:i})}}
                      />
                      <input
                        type="number"
                        class="range-input"
                        min="8"
                        step="1"
                        .value="${u.left_value_size||14}"
                        @input=${t=>{const e=t.target,i=parseInt(e.value);isNaN(i)||n({left_value_size:i})}}
                        @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,i=parseInt(e.value)||14,a="ArrowUp"===t.key?1:-1,r=Math.max(8,Math.min(32,i+a));n({left_value_size:r})}}}
                      />
                      <button
                        class="range-reset-btn"
                        @click=${()=>n({left_value_size:14})}
                        title="${(0,m.kg)("editor.fields.reset_default_value",b,"Reset to default ({value})").replace("{value}","14")}"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>
                  <!-- Left Template Mode -->
                  <div
                    class="field-group"
                    style="margin-bottom: 8px; display: grid !important; grid-template-columns: minmax(0,1fr) auto; align-items: center; column-gap: 12px; width: 100%;"
                  >
                    <div
                      class="field-title"
                      style="font-size: 16px !important; font-weight: 600 !important; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                    >
                      ${(0,m.kg)("editor.bar.left.template_mode",b,"Template Mode")}
                    </div>
                    <ha-switch
                      style="justify-self: end;"
                      .checked=${u.left_template_mode||!1}
                      @change=${t=>n({left_template_mode:t.target.checked})}
                    ></ha-switch>
                  </div>
                  ${u.left_template_mode?a.qy`
                        <div
                          class="field-description"
                          style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                        >
                          ${(0,m.kg)("editor.bar.left.template_desc",b,"Use a template to format the displayed value. Templates use Home Assistant's Jinja2 syntax.")}
                        </div>
                        <div class="field-group" style="margin-bottom: 0;">
                          <div
                            class="field-title"
                            style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                          >
                            ${(0,m.kg)("editor.bar.left.value_template",b,"Value Template")}
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 12px; margin-bottom: 8px; color: var(--secondary-text-color);"
                          >
                            ${(0,m.kg)("editor.bar.left.value_template_desc",b,"Template to format the left-side value using Jinja2 syntax")}
                          </div>
                          <div
                            @mousedown=${t=>{const e=t.target;e.closest("ultra-template-editor")||e.closest(".cm-editor")||t.stopPropagation()}}
                            @dragstart=${t=>t.stopPropagation()}
                          >
                            <ultra-template-editor
                              .hass=${e}
                              .value=${u.left_template||""}
                              .placeholder=${"{{ states('sensor.example') }}"}
                              .minHeight=${100}
                              .maxHeight=${300}
                              @value-changed=${t=>n({left_template:t.detail.value})}
                            ></ultra-template-editor>
                          </div>
                        </div>
                      `:""}

                  <!-- Left Side Actions (isolated component) -->
                  <bar-side-actions
                    .hass=${e}
                    .side=${"left"}
                    .tapAction=${u.left_tap_action}
                    .holdAction=${u.left_hold_action}
                    .doubleTapAction=${u.left_double_tap_action}
                    @actions-changed=${t=>{t.stopPropagation(),n(t.detail.updates)}}
                  ></bar-side-actions>
                `:a.qy`
                  <div
                    style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                  >
                    ${(0,m.kg)("editor.bar.left.enable_toggle",b,"Enable the toggle above to configure left side settings")}
                  </div>
                `}
        </div>

        <!-- Right Side Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 0; border-bottom: none;"
          >
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); letter-spacing: 0.5px;"
            >
              ${(0,m.kg)("editor.bar.right.title",b,"Right Side")}
            </div>
            <ha-switch
              .checked=${u.right_enabled||!1}
              @change=${t=>{const e=t.target.checked;n(e?{right_enabled:!0,right_title:u.right_title||"Range",right_entity:u.right_entity||"",right_template_mode:u.right_template_mode||!1,right_title_size:u.right_title_size||14,right_value_size:u.right_value_size||14,right_title_color:u.right_title_color||"var(--primary-text-color)",right_value_color:u.right_value_color||"var(--primary-text-color)"}:{right_enabled:!1,right_title:"",right_entity:"",right_template_mode:!1,right_template:""})}}
            ></ha-switch>
          </div>

          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
          >
            ${(0,m.kg)("editor.bar.right.desc",b,"Configure the title and entity value displayed on the right side of the bar. This is ideal for complementary information like 'Time to Full' or secondary measurements.")}
          </div>

          ${u.right_enabled?a.qy`
                  <div class="field-group" style="margin-bottom: 16px;">
                    <ha-form
                      .hass=${e}
                      .data=${{right_title:u.right_title||""}}
                      .schema=${[{name:"right_title",selector:{text:{}},label:""}]}
                      .computeLabel=${()=>""}
                      @value-changed=${t=>n({right_title:t.detail.value.right_title})}
                    ></ha-form>
                  </div>
                  <div class="field-group" style="margin-bottom: 16px;">
                    <ha-form
                      .hass=${e}
                      .data=${{right_entity:u.right_entity||""}}
                      .schema=${[{name:"right_entity",selector:{entity:{}},label:""}]}
                      .computeLabel=${()=>""}
                      @value-changed=${t=>n({right_entity:t.detail.value.right_entity})}
                    ></ha-form>
                  </div>

                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">
                      ${(0,m.kg)("editor.bar.right.title_size",b,"Title Size")}
                    </div>
                    <div class="number-range-control">
                      <input
                        type="range"
                        class="range-slider"
                        min="8"
                        max="32"
                        step="1"
                        .value="${u.right_title_size||14}"
                        @input=${t=>{const e=t.target,i=parseInt(e.value);n({right_title_size:i})}}
                      />
                      <input
                        type="number"
                        class="range-input"
                        min="8"
                        step="1"
                        .value="${u.right_title_size||14}"
                        @input=${t=>{const e=t.target,i=parseInt(e.value);isNaN(i)||n({right_title_size:i})}}
                        @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,i=parseInt(e.value)||14,a="ArrowUp"===t.key?1:-1,r=Math.max(8,Math.min(32,i+a));n({right_title_size:r})}}}
                      />
                      <button
                        class="range-reset-btn"
                        @click=${()=>n({right_title_size:14})}
                        title="${(0,m.kg)("editor.fields.reset_default_value",b,"Reset to default ({value})").replace("{value}","14")}"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>

                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">
                      ${(0,m.kg)("editor.bar.right.value_size",b,"Value Size")}
                    </div>
                    <div class="number-range-control">
                      <input
                        type="range"
                        class="range-slider"
                        min="8"
                        max="32"
                        step="1"
                        .value="${u.right_value_size||14}"
                        @input=${t=>{const e=t.target,i=parseInt(e.value);n({right_value_size:i})}}
                      />
                      <input
                        type="number"
                        class="range-input"
                        min="8"
                        step="1"
                        .value="${u.right_value_size||14}"
                        @input=${t=>{const e=t.target,i=parseInt(e.value);isNaN(i)||n({right_value_size:i})}}
                        @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,i=parseInt(e.value)||14,a="ArrowUp"===t.key?1:-1,r=Math.max(8,Math.min(32,i+a));n({right_value_size:r})}}}
                      />
                      <button
                        class="range-reset-btn"
                        @click=${()=>n({right_value_size:14})}
                        title="${(0,m.kg)("editor.fields.reset_default_value",b,"Reset to default ({value})").replace("{value}","14")}"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>
                  <div
                    class="field-group"
                    style="margin-bottom: 8px; display: grid !important; grid-template-columns: minmax(0,1fr) auto; align-items: center; column-gap: 12px; width: 100%;"
                  >
                    <div
                      class="field-title"
                      style="font-size: 16px !important; font-weight: 600 !important; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                    >
                      ${(0,m.kg)("editor.bar.right.template_mode",b,"Template Mode")}
                    </div>
                    <ha-switch
                      style="justify-self: end;"
                      .checked=${u.right_template_mode||!1}
                      @change=${t=>n({right_template_mode:t.target.checked})}
                    ></ha-switch>
                  </div>
                  ${u.right_template_mode?a.qy`
                        <div
                          class="field-description"
                          style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                        >
                          ${(0,m.kg)("editor.bar.right.template_desc",b,"Use a template to format the displayed value. Templates use Home Assistant's Jinja2 syntax.")}
                        </div>
                        <div class="field-group" style="margin-bottom: 0;">
                          <div
                            class="field-title"
                            style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                          >
                            ${(0,m.kg)("editor.bar.right.value_template",b,"Value Template")}
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 12px; margin-bottom: 8px; color: var(--secondary-text-color);"
                          >
                            ${(0,m.kg)("editor.bar.right.value_template_desc",b,"Template to format the right-side value using Jinja2 syntax")}
                          </div>
                          <div
                            @mousedown=${t=>{const e=t.target;e.closest("ultra-template-editor")||e.closest(".cm-editor")||t.stopPropagation()}}
                            @dragstart=${t=>t.stopPropagation()}
                          >
                            <ultra-template-editor
                              .hass=${e}
                              .value=${u.right_template||""}
                              .placeholder=${"{{ states('sensor.example') }}"}
                              .minHeight=${100}
                              .maxHeight=${300}
                              @value-changed=${t=>n({right_template:t.detail.value})}
                            ></ultra-template-editor>
                          </div>
                        </div>
                      `:""}

                  <!-- Right Side Actions (isolated component) -->
                  <bar-side-actions
                    .hass=${e}
                    .side=${"right"}
                    .tapAction=${u.right_tap_action}
                    .holdAction=${u.right_hold_action}
                    .doubleTapAction=${u.right_double_tap_action}
                    @actions-changed=${t=>{t.stopPropagation(),n(t.detail.updates)}}
                  ></bar-side-actions>
                `:a.qy`
                  <div
                    style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                  >
                    ${(0,m.kg)("editor.bar.right.enable_toggle",b,"Enable the toggle above to configure right side settings")}
                  </div>
                `}
        </div>

        <!-- Colors Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            ${(0,m.kg)("editor.bar.colors.title",b,"Colors")}
          </div>

          
          <div class="field-group" style="margin-bottom: 24px;">
            <div
              class="colors-grid"
              style="display: grid; grid-template-columns: 1fr; gap: 16px;"
            >
              <div class="color-item">
                <div
                  class="field-title"
                  style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                >
                  ${(0,m.kg)("editor.bar.colors.bar_color",b,"Bar Color")}
                </div>
                <ultra-color-picker style="width: 100%;"
                  .value=${u.bar_color||""}
                  .defaultValue=${"var(--primary-color)"}
                  .hass=${e}
                  @value-changed=${t=>n({bar_color:t.detail.value})}
                ></ultra-color-picker>
              </div>

              <div class="color-item">
                <div
                  class="field-title"
                  style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                >
                  ${(0,m.kg)("editor.bar.colors.background_color",b,"Background Color")}
                </div>
                <ultra-color-picker style="width: 100%;"
                  .value=${u.bar_background_color||""}
                  .defaultValue=${"transparent"}
                  .hass=${e}
                  @value-changed=${t=>n({bar_background_color:t.detail.value})}
                ></ultra-color-picker>
              </div>

              <div class="color-item">
                <div
                  class="field-title"
                  style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                >
                  ${(0,m.kg)("editor.bar.colors.border_color",b,"Border Color")}
                </div>
                <ultra-color-picker style="width: 100%;"
                  .value=${u.bar_border_color||""}
                  .defaultValue=${"var(--divider-color)"}
                  .hass=${e}
                  @value-changed=${t=>n({bar_border_color:t.detail.value})}
                ></ultra-color-picker>
              </div>

              <div class="color-item">
                <div
                  class="field-title"
                  style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                >
                  ${(0,m.kg)("editor.bar.colors.limit_indicator",b,"Limit Indicator")}
                </div>
                <ultra-color-picker style="width: 100%;"
                  .value=${u.limit_color||""}
                  .defaultValue=${"var(--warning-color)"}
                  .hass=${e}
                  @value-changed=${t=>n({limit_color:t.detail.value})}
                ></ultra-color-picker>
              </div>


              ${"minimal"===u.bar_style?a.qy`
                      <div class="color-item">
                        <div
                          class="field-title"
                          style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                        >
                          ${(0,m.kg)("editor.bar.colors.dot_color",b,"Dot Color")}
                        </div>
                        <ultra-color-picker
                          style="width: 100%;"
                          .value=${u.dot_color||""}
                          .defaultValue=${"var(--primary-color)"}
                          .hass=${e}
                          @value-changed=${t=>n({dot_color:t.detail.value})}
                        ></ultra-color-picker>
                      </div>
                    `:""}
            </div>
          </div>

          <!-- Minimal Style Icon Configuration -->
          ${"minimal"===u.bar_style?a.qy`
                  <div class="field-group" style="margin-top: 24px;">
                    <div
                      style="display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: center; column-gap: 12px;"
                    >
                      <div class="field-title">
                        ${(0,m.kg)("editor.bar.minimal.icon_enabled",b,"Enable Icon")}
                      </div>
                      <ha-switch
                        .checked=${u.minimal_icon_enabled||!1}
                        @change=${t=>n({minimal_icon_enabled:t.target.checked})}
                      ></ha-switch>
                    </div>
                    <div class="field-description">
                      ${(0,m.kg)("editor.bar.minimal.icon_enabled_desc",b,"Show an icon on the minimal bar indicator")}
                    </div>
                  </div>

                  ${u.minimal_icon_enabled?a.qy`
                        <!-- Icon Selection -->
                        <div class="field-group" style="margin-top: 16px;">
                          ${this.renderFieldSection((0,m.kg)("editor.bar.minimal.icon",b,"Icon"),(0,m.kg)("editor.bar.minimal.icon_desc",b,"Choose an icon to display (e.g., mdi:battery)"),e,{minimal_icon:u.minimal_icon||""},[this.iconField("minimal_icon")],(t=>n(t.detail.value)))}
                        </div>

                        <!-- Icon Display Mode -->
                        <div class="field-group" style="margin-top: 16px;">
                          ${this.renderFieldSection((0,m.kg)("editor.bar.minimal.icon_mode",b,"Display Mode"),(0,m.kg)("editor.bar.minimal.icon_mode_desc",b,"How to display the icon"),e,{minimal_icon_mode:u.minimal_icon_mode||"icon-in-dot"},[this.selectField("minimal_icon_mode",[{value:"dot-only",label:(0,m.kg)("editor.bar.minimal.mode_dot_only",b,"Dot Only")},{value:"icon-only",label:(0,m.kg)("editor.bar.minimal.mode_icon_only",b,"Icon Only")},{value:"icon-in-dot",label:(0,m.kg)("editor.bar.minimal.mode_icon_in_dot",b,"Icon in Dot")}])],(t=>{n(t.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
                        </div>

                        <!-- Icon Size Controls -->
                        <div class="field-group" style="margin-top: 16px;">
                          <div
                            style="display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: center; column-gap: 12px;"
                          >
                            <div class="field-title">
                              ${(0,m.kg)("editor.bar.minimal.icon_size_auto",b,"Auto-Scale Icon")}
                            </div>
                            <ha-switch
                              .checked=${!1!==u.minimal_icon_size_auto}
                              @change=${t=>n({minimal_icon_size_auto:t.target.checked})}
                            ></ha-switch>
                          </div>
                          <div class="field-description">
                            ${(0,m.kg)("editor.bar.minimal.icon_size_auto_desc",b,"Automatically scale icon with bar height")}
                          </div>
                        </div>

                        ${!1===u.minimal_icon_size_auto?a.qy`
                              <div class="field-container" style="margin-top: 16px;">
                                <div class="field-title">
                                  ${(0,m.kg)("editor.bar.minimal.icon_size",b,"Icon Size")}
                                </div>
                                <div class="field-description">
                                  ${(0,m.kg)("editor.bar.minimal.icon_size_desc",b,"Custom icon size in pixels")}
                                </div>
                                <div class="number-range-control">
                                  <input
                                    type="range"
                                    class="range-slider"
                                    min="8"
                                    max="48"
                                    step="2"
                                    .value="${u.minimal_icon_size||24}"
                                    @input=${t=>n({minimal_icon_size:parseInt(t.target.value)})}
                                  />
                                  <input
                                    type="number"
                                    class="range-input"
                                    min="8"
                                    step="2"
                                    .value="${u.minimal_icon_size||24}"
                                    @input=${t=>{const e=parseInt(t.target.value);isNaN(e)||n({minimal_icon_size:e})}}
                                  />
                                  <button
                                    class="range-reset-btn"
                                    @click=${()=>n({minimal_icon_size:24})}
                                  >
                                    <ha-icon icon="mdi:refresh"></ha-icon>
                                  </button>
                                </div>
                              </div>
                            `:""}

                        <!-- Icon Color Controls -->
                        <div class="field-group" style="margin-top: 16px;">
                          <div
                            style="display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: center; column-gap: 12px;"
                          >
                            <div class="field-title">
                              ${(0,m.kg)("editor.bar.minimal.use_dot_color",b,"Use Dot Color")}
                            </div>
                            <ha-switch
                              .checked=${!1!==u.minimal_icon_use_dot_color}
                              @change=${t=>n({minimal_icon_use_dot_color:t.target.checked})}
                            ></ha-switch>
                          </div>
                          <div class="field-description">
                            ${(0,m.kg)("editor.bar.minimal.use_dot_color_desc",b,"Use the dot color for the icon (matches gradient)")}
                          </div>
                        </div>

                        ${!1===u.minimal_icon_use_dot_color?a.qy`
                              <div class="field-container" style="margin-top: 16px;">
                                <div class="field-title">
                                  ${(0,m.kg)("editor.bar.minimal.icon_color",b,"Icon Color")}
                                </div>
                                <div class="field-description">
                                  ${(0,m.kg)("editor.bar.minimal.icon_color_desc",b,"Custom color for the icon")}
                                </div>
                                <ultra-color-picker
                                  style="width: 100%;"
                                  .value=${u.minimal_icon_color||""}
                                  .defaultValue=${"var(--primary-color)"}
                                  .hass=${e}
                                  @value-changed=${t=>n({minimal_icon_color:t.detail.value})}
                                ></ultra-color-picker>
                              </div>
                            `:""}
                      `:""}
                `:""}

          <!-- Left Side Colors -->
          ${u.left_enabled?a.qy`
                  <div class="field-group" style="margin-bottom: 24px;">
                    <div
                      class="field-title"
                      style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px; color: var(--primary-color);"
                    >
                      ${(0,m.kg)("editor.bar.colors.left_side",b,"Left Side Colors")}
                    </div>
                    <div
                      class="colors-grid"
                      style="display: grid; grid-template-columns: 1fr; gap: 16px;"
                    >
                      <div class="color-item">
                        <div
                          class="field-title"
                          style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                        >
                          ${(0,m.kg)("editor.bar.colors.title_color",b,"Title Color")}
                        </div>
                        <ultra-color-picker
                          style="width: 100%;"
                          .value=${u.left_title_color||""}
                          .defaultValue=${"var(--primary-text-color)"}
                          .hass=${e}
                          @value-changed=${t=>n({left_title_color:t.detail.value})}
                        ></ultra-color-picker>
                      </div>

                      <div class="color-item">
                        <div
                          class="field-title"
                          style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                        >
                          ${(0,m.kg)("editor.bar.colors.value_color",b,"Value Color")}
                        </div>
                        <ultra-color-picker
                          style="width: 100%;"
                          .value=${u.left_value_color||""}
                          .defaultValue=${"var(--primary-text-color)"}
                          .hass=${e}
                          @value-changed=${t=>n({left_value_color:t.detail.value})}
                        ></ultra-color-picker>
                      </div>
                    </div>
                  </div>
                `:""}

          <!-- Right Side Colors -->
          ${u.right_enabled?a.qy`
                  <div class="field-group">
                    <div
                      class="field-title"
                      style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px; color: var(--primary-color);"
                    >
                      ${(0,m.kg)("editor.bar.colors.right_side",b,"Right Side Colors")}
                    </div>
                    <div
                      class="colors-grid"
                      style="display: grid; grid-template-columns: 1fr; gap: 16px;"
                    >
                      <div class="color-item">
                        <div
                          class="field-title"
                          style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                        >
                          ${(0,m.kg)("editor.bar.colors.title_color",b,"Title Color")}
                        </div>
                        <ultra-color-picker
                          style="width: 100%;"
                          .value=${u.right_title_color||""}
                          .defaultValue=${"var(--primary-text-color)"}
                          .hass=${e}
                          @value-changed=${t=>n({right_title_color:t.detail.value})}
                        ></ultra-color-picker>
                      </div>

                      <div class="color-item">
                        <div
                          class="field-title"
                          style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                        >
                          ${(0,m.kg)("editor.bar.colors.value_color",b,"Value Color")}
                        </div>
                        <ultra-color-picker
                          style="width: 100%;"
                          .value=${u.right_value_color||""}
                          .defaultValue=${"var(--primary-text-color)"}
                          .hass=${e}
                          @value-changed=${t=>n({right_value_color:t.detail.value})}
                        ></ultra-color-picker>
                      </div>
                    </div>
                  </div>
                `:""}
        </div>

        <!-- Gradient Mode -->
        <div class="settings-section" style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px;">
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px; margin: 0;"
            >
              ${(0,m.kg)("editor.bar.gradient.title",b,"Gradient Mode")}
            </div>
            <ha-switch
              .checked=${u.use_gradient||!1}
              @change=${t=>{const e=t.target.checked,i={use_gradient:e};!e||u.gradient_stops&&0!==u.gradient_stops.length||(i.gradient_stops=(0,c.FB)(),i.gradient_display_mode=u.gradient_display_mode||"full"),n(i)}}
            ></ha-switch>
          </div>

          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px;"
          >
            ${(0,m.kg)("editor.bar.gradient.desc",b,"Apply a color gradient to the bar fill. When enabled, choose how the gradient is displayed and customize the color stops below.")}
          </div>

          ${u.use_gradient?a.qy`
                  <div class="field-group" style="margin-bottom: 12px;">
                    ${this.renderUcForm(e,{gradient_display_mode:u.gradient_display_mode||"full"},[this.selectField("gradient_display_mode",[{value:"full",label:(0,m.kg)("editor.bar.gradient.full",b,"Full")},{value:"cropped",label:(0,m.kg)("editor.bar.gradient.cropped",b,"Cropped")},{value:"value-based",label:(0,m.kg)("editor.bar.gradient.value_based",b,"Value-Based")}])],(t=>{const e=t.detail.value.gradient_display_mode;e!==(u.gradient_display_mode||"full")&&(n({gradient_display_mode:e}),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}),!1)}
                  </div>
                  <uc-gradient-editor
                    .stops=${u.gradient_stops||(0,c.FB)()}
                    .barSize=${this.getBarSizeFromHeight(null!==(g=u.height)&&void 0!==g?g:20)}
                    .barRadius=${this.getBarRadiusFromStyle(u.border_radius||10)}
                    .barStyle=${u.bar_style||"flat"}
                    @gradient-changed=${t=>{n({gradient_stops:t.detail.stops})}}
                  ></uc-gradient-editor>
                `:""}
        </div>

        <!-- Bar Animation -->
        <div class="settings-section" style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px;">
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px; margin: 0;"
            >
              ${(0,m.kg)("editor.bar.animation.title",b,"Bar Animation")}
            </div>
            <ha-switch
              .checked=${u.bar_animation_enabled||!1}
              @change=${t=>n({bar_animation_enabled:t.target.checked})}
            ></ha-switch>
          </div>
          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px;"
          >
            ${(0,m.kg)("editor.bar.animation.desc",b,"Animate the bar fill using presets like charging stripes, pulse, shimmer, and more. You can trigger animations based on an entity's state or attribute, and optionally override the animation when another condition is met.")}
          </div>
          ${u.bar_animation_enabled?a.qy`
                  ${this.renderSettingsSection((0,m.kg)("editor.bar.animation.trigger.title",b,"Animation Trigger"),(0,m.kg)("editor.bar.animation.trigger.desc",b,"Select an entity to watch and define the value + animation to apply when it matches."),[{title:(0,m.kg)("editor.common.entity",b,"Entity"),description:(0,m.kg)("editor.bar.animation.trigger.entity_desc",b,"Entity to evaluate for animation trigger"),hass:e,data:{bar_animation_entity:u.bar_animation_entity||""},schema:[this.entityField("bar_animation_entity")],onChange:t=>n({bar_animation_entity:t.detail.value.bar_animation_entity})},{title:(0,m.kg)("editor.bar.animation.trigger.type",b,"Trigger Type"),description:(0,m.kg)("editor.bar.animation.trigger.type_desc",b,"Choose whether to compare the entity state or an attribute"),hass:e,data:{bar_animation_trigger_type:u.bar_animation_trigger_type||"state"},schema:[this.selectField("bar_animation_trigger_type",[{value:"state",label:(0,m.kg)("editor.common.state",b,"State")},{value:"attribute",label:(0,m.kg)("editor.common.attribute",b,"Attribute")}])],onChange:t=>n(t.detail.value)},..."attribute"===(u.bar_animation_trigger_type||"state")?[{title:(0,m.kg)("editor.common.attribute_name",b,"Attribute Name"),description:(0,m.kg)("editor.bar.animation.trigger.attribute_name_desc",b,"Name of the attribute to compare (e.g., charging_status)"),hass:e,data:{bar_animation_attribute:u.bar_animation_attribute||""},schema:[this.textField("bar_animation_attribute")],onChange:t=>n({bar_animation_attribute:t.detail.value.bar_animation_attribute})}]:[],...(u.bar_animation_entity||"").trim()?[{title:(0,m.kg)("editor.bar.animation.trigger.match_value",b,"Match Value"),description:(0,m.kg)("editor.bar.animation.trigger.match_value_desc",b,"Text to compare against the state or attribute (comparison is string-based)."),hass:e,data:{bar_animation_value:u.bar_animation_value||""},schema:[this.textField("bar_animation_value")],onChange:t=>n({bar_animation_value:t.detail.value.bar_animation_value})}]:[],{title:(0,m.kg)("editor.bar.animation.type",b,"Animation Type"),description:(0,m.kg)("editor.bar.animation.type_desc",b,"Select how the bar should animate when triggered."),hass:e,data:{bar_animation_type:u.bar_animation_type||"none"},schema:[this.selectField("bar_animation_type",[{value:"none",label:(0,m.kg)("editor.common.none",b,"None")},{value:"charging",label:(0,m.kg)("editor.bar.animation.types.charging",b,"Charging (Diagonal Lines)")},{value:"pulse",label:(0,m.kg)("editor.bar.animation.types.pulse",b,"Pulse")},{value:"blinking",label:(0,m.kg)("editor.bar.animation.types.blinking",b,"Blinking")},{value:"bouncing",label:(0,m.kg)("editor.bar.animation.types.bouncing",b,"Bouncing")},{value:"glow",label:(0,m.kg)("editor.bar.animation.types.glow",b,"Glow")},{value:"rainbow",label:(0,m.kg)("editor.bar.animation.types.rainbow",b,"Rainbow")},{value:"bubbles",label:(0,m.kg)("editor.bar.animation.types.bubbles",b,"Bubbles")},{value:"fill",label:(0,m.kg)("editor.bar.animation.types.fill",b,"Fill")},{value:"ripple",label:(0,m.kg)("editor.bar.animation.types.ripple",b,"Ripple")},{value:"traffic",label:(0,m.kg)("editor.bar.animation.types.traffic",b,"Traffic (Barber Pole)")},{value:"heartbeat",label:(0,m.kg)("editor.bar.animation.types.heartbeat",b,"Heartbeat")},{value:"flicker",label:(0,m.kg)("editor.bar.animation.types.flicker",b,"Flicker")},{value:"shimmer",label:(0,m.kg)("editor.bar.animation.types.shimmer",b,"Shimmer")},{value:"vibrate",label:(0,m.kg)("editor.bar.animation.types.vibrate",b,"Vibrate")}])],onChange:t=>n(t.detail.value)}])}
                  ${this.renderSettingsSection((0,m.kg)("editor.bar.animation.override.title",b,"Action Animation Override"),(0,m.kg)("editor.bar.animation.override.desc",b,"Select an Action Entity and state to define when this animation should override the regular animation"),[{title:(0,m.kg)("editor.common.entity",b,"Entity"),description:(0,m.kg)("editor.bar.animation.override.entity_desc",b,"Entity to evaluate for the override trigger"),hass:e,data:{bar_animation_override_entity:u.bar_animation_override_entity||""},schema:[this.entityField("bar_animation_override_entity")],onChange:t=>n({bar_animation_override_entity:t.detail.value.bar_animation_override_entity})},{title:(0,m.kg)("editor.bar.animation.trigger.type",b,"Trigger Type"),description:(0,m.kg)("editor.bar.animation.override.type_desc",b,"Compare the entity state or one of its attributes"),hass:e,data:{bar_animation_override_trigger_type:u.bar_animation_override_trigger_type||"state"},schema:[this.selectField("bar_animation_override_trigger_type",[{value:"state",label:(0,m.kg)("editor.common.state",b,"State")},{value:"attribute",label:(0,m.kg)("editor.common.attribute",b,"Attribute")}])],onChange:t=>{t.detail.value.bar_animation_override_trigger_type!==(u.bar_animation_override_trigger_type||"state")&&n(t.detail.value)}},..."attribute"===(u.bar_animation_override_trigger_type||"state")?[{title:(0,m.kg)("editor.common.attribute_name",b,"Attribute Name"),description:(0,m.kg)("editor.bar.animation.override.attribute_name_desc",b,"Name of the attribute to compare"),hass:e,data:{bar_animation_override_attribute:u.bar_animation_override_attribute||""},schema:[this.textField("bar_animation_override_attribute")],onChange:t=>n({bar_animation_override_attribute:t.detail.value.bar_animation_override_attribute})}]:[],{title:(0,m.kg)("editor.bar.animation.override.match_value",b,"Override Match Value"),description:(0,m.kg)("editor.bar.animation.override.match_value_desc",b,"String comparison against state or attribute"),hass:e,data:{bar_animation_override_value:u.bar_animation_override_value||""},schema:[this.textField("bar_animation_override_value")],onChange:t=>n({bar_animation_override_value:t.detail.value.bar_animation_override_value})},{title:(0,m.kg)("editor.bar.animation.override.type",b,"Override Animation Type"),description:(0,m.kg)("editor.bar.animation.override.type_desc",b,"Animation to use when override condition matches."),hass:e,data:{bar_animation_override_type:u.bar_animation_override_type||"none"},schema:[this.selectField("bar_animation_override_type",[{value:"none",label:(0,m.kg)("editor.common.none",b,"None")},{value:"charging",label:(0,m.kg)("editor.bar.animation.types.charging",b,"Charging (Diagonal Lines)")},{value:"pulse",label:(0,m.kg)("editor.bar.animation.types.pulse",b,"Pulse")},{value:"blinking",label:(0,m.kg)("editor.bar.animation.types.blinking",b,"Blinking")},{value:"bouncing",label:(0,m.kg)("editor.bar.animation.types.bouncing",b,"Bouncing")},{value:"glow",label:(0,m.kg)("editor.bar.animation.types.glow",b,"Glow")},{value:"rainbow",label:(0,m.kg)("editor.bar.animation.types.rainbow",b,"Rainbow")},{value:"bubbles",label:(0,m.kg)("editor.bar.animation.types.bubbles",b,"Bubbles")},{value:"fill",label:(0,m.kg)("editor.bar.animation.types.fill",b,"Fill")},{value:"ripple",label:(0,m.kg)("editor.bar.animation.types.ripple",b,"Ripple")},{value:"traffic",label:(0,m.kg)("editor.bar.animation.types.traffic",b,"Traffic (Barber Pole)")},{value:"heartbeat",label:(0,m.kg)("editor.bar.animation.types.heartbeat",b,"Heartbeat")},{value:"flicker",label:(0,m.kg)("editor.bar.animation.types.flicker",b,"Flicker")},{value:"shimmer",label:(0,m.kg)("editor.bar.animation.types.shimmer",b,"Shimmer")},{value:"vibrate",label:(0,m.kg)("editor.bar.animation.types.vibrate",b,"Vibrate")}])],onChange:t=>n(t.detail.value)}])}
                `:""}
        </div>

        <!-- Action Animation Override removed as standalone: now included inside Bar Animation section above -->
      </div>
    `}renderActionsTab(t,e,i,a){return l.A.render(t,e,(t=>a(t)))}renderPreview(t,e,r,o){var l,s,p,m,g,u,y,x,w,$,k,z,S,C,T,A,M,I,F,E,U,N,P,D,q,B,R,L,j,V,O,H,G,W,Y;const K=t,X=K.percentage_type||"entity";if("time_progress"!==X&&this._timeProgressInterval&&this._timeProgressCleanup&&(this._timeProgressCleanup(),this._timeProgressCleanup=null),"time_progress"!==X&&"range"!==X&&(!K.entity||""===K.entity.trim()))return this.renderGradientErrorState("Select Entity","Choose an entity in the General tab","mdi:chart-box-outline");if("range"===X){const t=K.range_start_entity,e=K.range_end_entity;if(!t||!e)return this.renderGradientErrorState("Configure Range","Set range start and end entities in the General tab","mdi:arrow-expand-horizontal")}let Z,J,Q,tt=0;const et=t=>Math.min(Math.max(t,0),100);if(K.unified_template_mode&&K.unified_template&&(!this._templateService&&e&&(this._templateService=new _.I(e)),e)){e.__uvc_template_strings||(e.__uvc_template_strings={});const t=this._hashString(K.unified_template),i=`unified_bar_${K.id}_${t}`;if(this._templateService&&!this._templateService.hasTemplateSubscription(i)){const t=(0,v.pL)(K.entity,e,{entity:K.entity});this._templateService.subscribeToTemplate(K.unified_template,i,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),t,r)}const a=null===(l=e.__uvc_template_strings)||void 0===l?void 0:l[i];if(a&&""!==String(a).trim()){const t=(0,f.cv)(a);if(!(0,f.HD)(t)){if(void 0!==t.value){const e="number"==typeof t.value?t.value:parseFloat(String(t.value));isNaN(e)||(tt=et(e<=1?100*e:e))}t.color&&(Z=t.color),t.label&&(J=t.label)}}}const it=!(K.entity&&(null==e?void 0:e.states[K.entity])),at=()=>{var t,i;let a=K.percentage_min,n=K.percentage_max;const o=t=>t.includes("{{")||t.includes("{%");if(K.percentage_min_template_mode&&K.percentage_min_template){const i=K.percentage_min_template;if(o(i)){if(e){this._templateService||(this._templateService=new _.I(e)),e.__uvc_template_strings||(e.__uvc_template_strings={});const n=`bar_min_${K.id}_${this._hashString(i)}`;this._templateService&&!this._templateService.hasTemplateSubscription(n)&&this._templateService.subscribeToTemplate(i,n,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),void 0,r);const o=null===(t=e.__uvc_template_strings)||void 0===t?void 0:t[n];if(void 0!==o){const t=parseFloat(String(o));isNaN(t)||(a=t)}}}else{const t=parseFloat(i);isNaN(t)||(a=t)}}if(K.percentage_max_template_mode&&K.percentage_max_template){const t=K.percentage_max_template;if(o(t)){if(e){this._templateService||(this._templateService=new _.I(e)),e.__uvc_template_strings||(e.__uvc_template_strings={});const a=`bar_max_${K.id}_${this._hashString(t)}`;this._templateService&&!this._templateService.hasTemplateSubscription(a)&&this._templateService.subscribeToTemplate(t,a,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),void 0,r);const o=null===(i=e.__uvc_template_strings)||void 0===i?void 0:i[a];if(void 0!==o){const t=parseFloat(String(o));isNaN(t)||(n=t)}}}else{const e=parseFloat(t);isNaN(e)||(n=e)}}return{min:a,max:n}},nt=(t,e,i,a,n)=>{const r=void 0!==a?a:e,o=(void 0!==n?n:i)-r;return o<=0?0:et((t-r)/o*100)};if(!K.unified_template_mode){const t=K.percentage_type||"entity";if("time_progress"===t){const t=K.time_progress_start_entity,i=K.time_progress_end_entity,a=K.time_progress_direction||"forward";if(t&&i&&(null==e?void 0:e.states[t])&&(null==e?void 0:e.states[i])){const n=e.states[t],r=e.states[i],o=t=>{if(!t||"unknown"===t||"unavailable"===t)return 0;const e=new Date(t);if(!isNaN(e.getTime()))return e.getTime();const i=parseFloat(t);return isNaN(i)?0:1e3*i},l=o(n.state),s=o(r.state),d=Date.now();if(l>0&&s>0&&s>l){const t=s-l;if("backward"===a){const e=s-d;tt=Math.min(100,Math.max(0,e/t*100)),Q=e>0?this._formatDuration(e):"Complete"}else{const e=d-l;tt=Math.min(100,Math.max(0,e/t*100)),Q=e>=t?"Complete":this._formatDuration(e)}this._timeProgressInterval&&(clearInterval(this._timeProgressInterval),this._timeProgressInterval=null);const e=K.time_progress_update_interval||1e3;this._timeProgressInterval=setInterval((()=>{"undefined"!=typeof window&&window.dispatchEvent(new CustomEvent("ultra-card-template-update"))}),e),this._timeProgressCleanup=()=>{this._timeProgressInterval&&(clearInterval(this._timeProgressInterval),this._timeProgressInterval=null)}}}}else if("template"===t&&K.percentage_template){if(!this._templateService&&e&&(this._templateService=new _.I(e)),e){e.__uvc_template_strings||(e.__uvc_template_strings={});const t=K.percentage_template,i=`bar_percentage_${K.id}_${this._hashString(t)}`;this._templateService&&!this._templateService.hasTemplateSubscription(i)&&this._templateService.subscribeToTemplate(t,i,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),void 0,r);const a=null===(s=e.__uvc_template_strings)||void 0===s?void 0:s[i];if(void 0!==a){const t=parseFloat(String(a));isNaN(t)||(tt=et(t<=1?100*t:t))}}}else if("attribute"===t){const{min:t,max:i}=at(),a=K.percentage_attribute_entity||K.entity,n=K.percentage_attribute_name||"",r=a?null==e?void 0:e.states[a]:void 0,o=n?null===(p=null==r?void 0:r.attributes)||void 0===p?void 0:p[n]:void 0,l=(null===(m=null==r?void 0:r.attributes)||void 0===m?void 0:m.unit_of_measurement)||"",s=parseFloat(String(null!=o?o:"0"));if(!isNaN(s))if(void 0!==t||void 0!==i)tt=nt(s,0,100,t,i);else if("%"===l||String(o).toString().trim().endsWith("%"))tt=et(s);else if(null===(g=null==r?void 0:r.attributes)||void 0===g?void 0:g.max){const t=parseFloat(String(r.attributes.max)),e=void 0!==(null===(u=null==r?void 0:r.attributes)||void 0===u?void 0:u.min)?parseFloat(String(r.attributes.min)):0;tt=nt(s,e,t)}else tt=et(s)}else if("difference"===t){const{min:t,max:i}=at(),a=K.percentage_current_entity,n=K.percentage_total_entity,r=a?parseFloat(String(null!==(x=null===(y=null==e?void 0:e.states[a])||void 0===y?void 0:y.state)&&void 0!==x?x:"0")):0,o=n?parseFloat(String(null!==($=null===(w=null==e?void 0:e.states[n])||void 0===w?void 0:w.state)&&void 0!==$?$:"0")):0;tt=void 0!==t||void 0!==i?nt(r,0,o,t,i):o>0?et(r/o*100):0}else if("range"===t)tt=0;else{const{min:t,max:i}=at(),a=null==e?void 0:e.states[K.entity];let n=0,r=0,o=100,l="";a&&(n=parseFloat(a.state)||0,l=(null===(k=a.attributes)||void 0===k?void 0:k.unit_of_measurement)||"",void 0!==(null===(z=a.attributes)||void 0===z?void 0:z.min)&&(r=parseFloat(String(a.attributes.min))||0),void 0!==(null===(S=a.attributes)||void 0===S?void 0:S.max)?o=parseFloat(String(a.attributes.max))||100:("%"===l||"battery"===(null===(C=a.attributes)||void 0===C?void 0:C.device_class))&&(o=100)),tt=nt(n,r,o,t,i)}}it&&!K.unified_template_mode&&(tt=65);let rt="";if(K.left_template_mode&&K.left_template&&(!this._templateService&&e&&(this._templateService=new _.I(e)),e)){e.__uvc_template_strings||(e.__uvc_template_strings={});const t=this._hashString(K.left_template),i=`bar_left_${K.id}_${t}`;this._templateService&&!this._templateService.hasTemplateSubscription(i)&&this._templateService.subscribeToTemplate(K.left_template,i,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),void 0,r);const a=null===(T=e.__uvc_template_strings)||void 0===T?void 0:T[i];void 0!==a&&""!==String(a).trim()&&(rt=String(a))}if(!rt&&K.left_entity&&(null==e?void 0:e.states[K.left_entity])){const t=e.states[K.left_entity];try{rt=(0,b.formatEntityState)(e,K.left_entity,{includeUnit:!0})}catch(e){rt=`${t.state}${(null===(A=t.attributes)||void 0===A?void 0:A.unit_of_measurement)||""}`}}let ot="";if(K.right_template_mode&&K.right_template&&(!this._templateService&&e&&(this._templateService=new _.I(e)),e)){e.__uvc_template_strings||(e.__uvc_template_strings={});const t=this._hashString(K.right_template),i=`bar_right_${K.id}_${t}`;this._templateService&&!this._templateService.hasTemplateSubscription(i)&&this._templateService.subscribeToTemplate(K.right_template,i,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),void 0,r);const a=null===(M=e.__uvc_template_strings)||void 0===M?void 0:M[i];void 0!==a&&""!==String(a).trim()&&(ot=String(a))}if(!ot&&K.right_entity&&(null==e?void 0:e.states[K.right_entity])){const t=e.states[K.right_entity];try{ot=(0,b.formatEntityState)(e,K.right_entity,{includeUnit:!0})}catch(e){ot=`${t.state}${(null===(I=t.attributes)||void 0===I?void 0:I.unit_of_measurement)||""}`}}let lt=0;if(K.limit_entity&&(null==e?void 0:e.states[K.limit_entity])){const t=e.states[K.limit_entity],i=parseFloat(t.state)||0,a=100;lt=Math.min(Math.max(i/a*100,0),100)}let st=0,dt=100,ct=-1,pt=0,mt=100;const gt=K.percentage_type||"entity";if("range"===gt){const{min:t,max:i}=at();pt=void 0!==t?t:0,mt=void 0!==i?i:100;const a=mt-pt,n=K.range_start_entity,r=K.range_start_attribute;let o=pt;if(n&&(null==e?void 0:e.states[n])){const t=e.states[n];o=r&&void 0!==(null===(F=t.attributes)||void 0===F?void 0:F[r])?parseFloat(String(t.attributes[r])):parseFloat(t.state),isNaN(o)&&(o=pt)}const l=K.range_end_entity,s=K.range_end_attribute;let d=mt;if(l&&(null==e?void 0:e.states[l])){const t=e.states[l];d=s&&void 0!==(null===(E=t.attributes)||void 0===E?void 0:E[s])?parseFloat(String(t.attributes[s])):parseFloat(t.state),isNaN(d)&&(d=mt)}const c=K.range_current_entity,p=K.range_current_attribute;if(c&&(null==e?void 0:e.states[c])){const t=e.states[c],i=p&&void 0!==(null===(U=t.attributes)||void 0===U?void 0:U[p])?parseFloat(String(t.attributes[p])):parseFloat(t.state);!isNaN(i)&&a>0&&(ct=Math.min(100,Math.max(0,(i-pt)/a*100)))}a>0&&(st=Math.min(100,Math.max(0,(o-pt)/a*100)),dt=Math.min(100,Math.max(0,(d-pt)/a*100)),st>dt&&([st,dt]=[dt,st])),tt=dt-st}else{const{min:t,max:e}=at();void 0!==t&&(pt=t),void 0!==e&&(mt=e)}const ut=K,bt=K.design||{},_t=bt.background_color||ut.background_color||"transparent",ht=bt.width||ut.width||"100%",vt=K.bar_background_color||"transparent";let ft=null!==(N=K.height)&&void 0!==N?N:20;if("minimal"===K.bar_style){const t=Math.max(1,Math.floor(ft/3)),e=Math.max(8,Math.min(24,3*t+6));ft=Math.max(ft,e+8)}const yt=`${ft}px`;let xt=ft;(K.left_enabled||K.right_enabled)&&(xt+=Math.max(K.left_title_size||14,K.left_value_size||14,K.right_title_size||14,K.right_value_size||14)+16);const wt=`${xt}px`,$t=null!==(D=null!==(P=K.border_radius)&&void 0!==P?P:bt.border_radius)&&void 0!==D?D:10,kt="string"==typeof $t?parseInt($t,10)||10:$t;let zt=Z||K.bar_color||ut.color||"var(--primary-color)";const St=t=>{if(!t)return t;const e=String(t).trim();if(e.startsWith("#")||e.startsWith("rgb"))return e;try{const t=document.createElement("span");t.style.backgroundColor=e,document.body.appendChild(t);const i=getComputedStyle(t).backgroundColor;return t.remove(),i&&"rgba(0, 0, 0, 0)"!==i?i:e}catch(t){return e}},Ct=(t,e)=>{const i=[...t].sort(((t,e)=>t.position-e.position));let a=i[0],n=i[i.length-1];for(let t=0;t<i.length-1;t++)if(e>=i[t].position&&e<=i[t+1].position){a=i[t],n=i[t+1];break}if(a.position===e)return a.color;if(n.position===e)return n.color;const r=n.position-a.position,o=0===r?0:(e-a.position)/r;return this.interpolateColor(a.color,n.color,o)},Tt=K.bar_direction||"left-to-right",At=(t,e)=>{if(null==t||""===t)return`${e}px`;if("number"==typeof t)return`${t}px`;const i=String(t).trim();return""===i||["inherit","initial","unset","auto"].includes(i.toLowerCase())?`${e}px`:/^[0-9.]+$/.test(i)?`${i}px`:i},Mt=(()=>{var t,e,i;const a=null!==(t=bt.font_size)&&void 0!==t?t:ut.font_size;return null!=a&&""!==a?At(a,null!==(e=K.percentage_text_size)&&void 0!==e?e:14):At(null!==(i=K.percentage_text_size)&&void 0!==i?i:14,14)})(),It="right-to-left"===Tt?"translate(-100%, -50%) translateX(4px)":"translate(-100%, -50%) translateX(-4px)",Ft=!1!==K.show_percentage,Et=K.percentage_text_alignment||"center",Ut=Math.round(tt),Nt=(()=>{var t,i,a;if(!Ft)return"";const n=K.percentage_type||"entity";if("time_progress"===n&&Q)return Q;if(K.show_value){if(it)return"65 kWh";if("difference"===n){const i=K.percentage_current_entity;if(i&&(null==e?void 0:e.states[i])){const a=e.states[i];try{return(0,b.formatEntityState)(e,i,{includeUnit:!0})}catch(e){return`${a.state}${(null===(t=a.attributes)||void 0===t?void 0:t.unit_of_measurement)||""}`}}}else if("template"===n){const t=K.percentage_template;if(t&&e){e.__uvc_template_strings||(e.__uvc_template_strings={});const a=`bar_percentage_${K.id}_${this._hashString(t)}`,n=null===(i=e.__uvc_template_strings)||void 0===i?void 0:i[a];if(void 0!==n)return String(n)}}const r=null==e?void 0:e.states[K.entity];if(r)try{return(0,b.formatEntityState)(e,K.entity,{includeUnit:!0})}catch(t){return`${r.state}${(null===(a=r.attributes)||void 0===a?void 0:a.unit_of_measurement)||""}`}return"N/A"}return`${Ut}%`})();if(K.use_gradient){const t=K.gradient_stops&&K.gradient_stops.length>0?K.gradient_stops:(0,c.FB)(),e="right-to-left"===Tt?"to left":"to right",i=[...t].sort(((t,e)=>t.position-e.position)).map((t=>`${St(t.color)} ${t.position}%`)).join(", ");if("full"===K.gradient_display_mode)zt=`linear-gradient(${e}, ${i})`;else if("value-based"===K.gradient_display_mode){const e=[...t].sort(((t,e)=>t.position-e.position)),i=Ct(e,tt);zt=St(i)}else{const i=[...t].sort(((t,e)=>t.position-e.position));if(tt<=0){const t=i[0];zt=t?St(t.color):zt}else{const t=i.filter((t=>t.position<=tt)),a=[];if(0===t.length){const t=i[0];t&&a.push(`${t.color} 0%`,`${t.color} 100%`)}else{for(const e of t){const t=e.position/tt*100,i=Math.max(0,Math.min(100,t));a.push(`${St(e.color)} ${i}%`)}const e=St(Ct(i,tt));0===a.length?a.push(`${e} 0%`,`${e} 100%`):a.push(`${e} 100%`)}zt=`linear-gradient(${e}, ${a.join(", ")})`}}}let Pt="",Dt="",qt="",Bt="";const Rt=t=>t.includes("linear-gradient")?K.bar_color||"var(--primary-color)":t;switch(Rt(zt),K.bar_style){case"flat":Pt="box-shadow: none;";break;case"glossy":K.use_gradient?qt="\n            background-image: linear-gradient(to bottom, \n              rgba(255,255,255,0.3) 0%, \n              rgba(255,255,255,0.1) 50%, \n              rgba(0,0,0,0.1) 51%, \n              rgba(0,0,0,0.05) 100%);\n            box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);\n          ":Dt=`\n            background: linear-gradient(to bottom, ${zt}, ${zt} 50%, rgba(0,0,0,0.1) 51%, ${zt});\n            box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);\n          `;break;case"embossed":Pt="\n          box-shadow: inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.8);\n          border: 1px solid rgba(0,0,0,0.1);\n        ",Dt="\n          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1);\n        ";break;case"inset":Pt="\n          box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);\n          border: 1px solid rgba(0,0,0,0.2);\n        ";break;case"gradient-overlay":K.use_gradient?qt="\n            background-image: linear-gradient(to bottom, \n              rgba(255,255,255,0.4) 0%, \n              rgba(255,255,255,0) 100%);\n          ":Dt=`\n            background: linear-gradient(to bottom, \n              ${zt} 0%, \n              rgba(255,255,255,0) 100%\n            );\n          `;break;case"neon-glow":{const t=(t=>{if(t.includes("linear-gradient")&&K.use_gradient&&K.gradient_stops){const t=K.gradient_display_mode||"full";if("value-based"===t||"cropped"===t)return Ct(K.gradient_stops,tt);{const t=[...K.gradient_stops].sort(((t,e)=>e.position-t.position));if(t.length>0)return t[0].color}}return Rt(t)})(zt),e=(t,e)=>t.startsWith("rgba(")?t.replace(/,\s*[\d.]+\s*\)$/,`, ${e})`):t.startsWith("rgb(")?t.replace("rgb(","rgba(").replace(")",`, ${e})`):t.includes("#")||t.startsWith("var(")||t.match(/^[a-z]+$/i)?`color-mix(in srgb, ${t} ${100*e}%, transparent)`:t;Dt=`\n            filter: brightness(1.2);\n            box-shadow: \n              0 0 7px 2px ${e(t,.7)},\n              0 0 14px 6px ${e(t,.5)},\n              0 0 20px 10px ${e(t,.3)},\n              inset 0 0 10px rgba(255, 255, 255, 0.8);\n          `,Pt="\n            box-shadow: inset 0 0 10px rgba(0,0,0,0.5);\n            overflow: hidden;\n          "}break;case"outline":{const t=vt||"rgba(255, 255, 255, 0.1)",e=4;Pt=`\n            border: 2px solid ${St(K.bar_color||"var(--primary-color)")};\n            border-radius: ${kt}px;\n            background: ${t};\n            padding: ${e}px;\n          `,Dt=`\n            background: ${zt};\n            border: none;\n            box-sizing: border-box;\n            position: relative;\n            margin: 0;\n            width: ${tt}%;\n            transition: width 0.3s ease;\n          `}break;case"glass":{const t=.15,e=.25;Pt=`\n            backdrop-filter: blur(${K.glass_blur_amount||8}px) saturate(180%);\n            background: linear-gradient(\n              135deg,\n              rgba(255, 255, 255, ${.8*t}) 0%,\n              rgba(255, 255, 255, ${.4*t}) 50%,\n              rgba(255, 255, 255, ${t}) 100%\n            );\n            border: 1px solid rgba(255, 255, 255, ${e});\n            border-radius: ${kt}px;\n            box-shadow: \n              0 8px 32px rgba(0, 0, 0, 0.1),\n              inset 0 1px 0 rgba(255, 255, 255, 0.4),\n              inset 0 -1px 0 rgba(0, 0, 0, 0.1);\n            position: relative;\n          `,K.use_gradient?qt=`\n              background: ${zt};\n              border-radius: ${Math.max(0,kt-2)}px;\n            `:Dt=`\n              background: ${zt};\n              border-radius: ${Math.max(0,kt-2)}px;\n              position: relative;\n            `}break;case"metallic":K.use_gradient?qt="\n            background-image: linear-gradient(to bottom, \n              rgba(255,255,255,0.4) 0%, \n              rgba(255,255,255,0) 20%, \n              rgba(255,255,255,0) 80%, \n              rgba(0,0,0,0.2) 100%);\n            box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.3);\n          ":Dt=`\n            background: linear-gradient(to bottom, \n              rgba(255,255,255,0.4) 0%, \n              ${zt} 20%, \n              ${zt} 80%, \n              rgba(0,0,0,0.2) 100%);\n            box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.3);\n          `;break;case"neumorphic":Pt="\n          box-shadow: inset 2px 2px 4px rgba(0,0,0,0.1), inset -2px -2px 4px rgba(255,255,255,0.1);\n        ",Dt="\n          box-shadow: 2px 2px 4px rgba(0,0,0,0.1), -2px -2px 4px rgba(255,255,255,0.1);\n        ";break;case"dashed":const t=12,e=4,i=t+e,a="right-to-left"===Tt;if(tt>=99.5)Dt=`\n            mask-image: repeating-linear-gradient(\n              90deg,\n              black 0px,\n              black ${t}px,\n              transparent ${t}px,\n              transparent ${i}px\n            );\n            -webkit-mask-image: repeating-linear-gradient(\n              90deg,\n              black 0px,\n              black ${t}px,\n              transparent ${t}px,\n              transparent ${i}px\n            );\n            border-radius: ${a?`${kt}px 0 0 ${kt}px`:`0 ${kt}px ${kt}px 0`};\n          `;else{const n=a?"270deg":"90deg";Dt=`\n            mask-image: \n              repeating-linear-gradient(\n                90deg,\n                black 0px,\n                black ${t}px,\n                transparent ${t}px,\n                transparent ${i}px\n              ),\n              linear-gradient(\n                ${n},\n                black 0%,\n                black calc(100% - ${e+2}px),\n                transparent calc(100% - ${e+2}px),\n                transparent 100%\n              );\n            -webkit-mask-image: \n              repeating-linear-gradient(\n                90deg,\n                black 0px,\n                black ${t}px,\n                transparent ${t}px,\n                transparent ${i}px\n              ),\n              linear-gradient(\n                ${n},\n                black 0%,\n                black calc(100% - ${e+2}px),\n                transparent calc(100% - ${e+2}px),\n                transparent 100%\n              );\n            mask-composite: intersect;\n            -webkit-mask-composite: source-in;\n            border-radius: 0;\n          `}break;case"dots":const n=4,r=[],o=[];for(let t=10;t<=tt&&t<=100;t+=10)r.push(`${t}%`),o.push(`radial-gradient(circle ${n}px at ${t}% center, ${zt} 0%, ${zt} 100%, transparent 100%)`);Dt=o.length>0?`\n            background-image: ${o.join(", ")};\n            background-size: 100% 100%;\n            background-repeat: no-repeat;\n          `:"background: transparent;";break;case"minimal":Pt="\n          background: transparent;\n          border: none;\n          box-shadow: none;\n        ",Dt="\n          background: transparent;\n          border: none;\n          position: relative;\n        "}const Lt=K.bar_animation_type||"none";let jt=!1;if(K.bar_animation_enabled&&"none"!==Lt){const t=K.bar_animation_trigger_type||"state",i=K.bar_animation_entity,a=(null!==(q=K.bar_animation_value)&&void 0!==q?q:"").toString();if(i&&""!==i.trim()&&""!==a.trim()){if(null==e?void 0:e.states[i]){const n=e.states[i];let r="";if("attribute"===t){const t=K.bar_animation_attribute||"";r=t?String(null!==(R=null===(B=n.attributes)||void 0===B?void 0:B[t])&&void 0!==R?R:""):""}else r=String(null!==(L=n.state)&&void 0!==L?L:"");jt=String(r)===a}}else jt=!0;if(jt)switch(Lt){case"charging":Bt="bar-anim-charging";break;case"pulse":Bt="bar-anim-pulse";break;case"blinking":Bt="bar-anim-blink";break;case"bouncing":Bt="bar-anim-bounce";break;case"glow":Bt="bar-anim-glow";break;case"rainbow":Bt="bar-anim-rainbow";break;case"bubbles":Bt="bar-anim-bubbles";break;case"fill":Bt="bar-anim-fill";break;case"ripple":Bt="bar-anim-ripple";break;case"traffic":Bt="bar-anim-traffic";break;case"heartbeat":Bt="bar-anim-heartbeat";break;case"flicker":Bt="bar-anim-flicker";break;case"shimmer":Bt="bar-anim-shimmer";break;case"vibrate":Bt="bar-anim-vibrate"}}const Vt=K.bar_animation_override_type||"none";if("none"!==Vt&&""!==(K.bar_animation_override_entity||"").trim()){const t=K.bar_animation_override_trigger_type||"state",i=K.bar_animation_override_entity,a=(null!==(j=K.bar_animation_override_value)&&void 0!==j?j:"").toString();let n=!1;if(null==e?void 0:e.states[i]){const r=e.states[i];if("attribute"===t){const t=K.bar_animation_override_attribute||"";n=(t?String(null!==(O=null===(V=r.attributes)||void 0===V?void 0:V[t])&&void 0!==O?O:""):"")===a}else n=String(null!==(H=r.state)&&void 0!==H?H:"")===a}if(n)switch(Vt){case"charging":Bt="bar-anim-charging";break;case"pulse":Bt="bar-anim-pulse";break;case"blinking":Bt="bar-anim-blink";break;case"bouncing":Bt="bar-anim-bounce";break;case"glow":Bt="bar-anim-glow";break;case"rainbow":Bt="bar-anim-rainbow";break;case"bubbles":Bt="bar-anim-bubbles";break;case"fill":Bt="bar-anim-fill";break;case"ripple":Bt="bar-anim-ripple";break;case"traffic":Bt="bar-anim-traffic";break;case"heartbeat":Bt="bar-anim-heartbeat";break;case"flicker":Bt="bar-anim-flicker";break;case"shimmer":Bt="bar-anim-shimmer";break;case"vibrate":Bt="bar-anim-vibrate"}}let Ot=Number(null!==(G=K.bar_width)&&void 0!==G?G:100);if(Number.isNaN(Ot)){const t=this.normalizeSizeValue(null!==(W=K.bar_width)&&void 0!==W?W:100);Ot=t&&"%"===t.unit?t.value:100}const Ht=Math.max(1,Math.min(100,Ot)),Gt=this.normalizeSizeValue(void 0!==K.bar_width&&null!==K.bar_width?K.bar_width:100),Wt=void 0!==bt.width&&null!==bt.width&&""!==String(bt.width).trim()?bt.width:ut.width,Yt=null!=Wt&&""!==String(Wt).trim()?this.normalizeSizeValue(Wt):null;let Kt=!1;Kt=Yt?"%"===Yt.unit&&Yt.value>=100:!Gt||"%"===Gt.unit&&Gt.value>=100;const Xt=void 0!==bt.max_width&&null!==bt.max_width&&""!==String(bt.max_width).trim()?bt.max_width:ut.max_width,Zt=null!=Xt&&""!==String(Xt).trim()?this.normalizeSizeValue(Xt):null;Kt&&Zt&&(Kt="%"===Zt.unit&&Zt.value>=100);const Jt=`${Ht}%`;let Qt="flex-start";switch(K.bar_alignment){case"left":Qt="flex-start";break;case"center":Qt="center";break;case"right":Qt="flex-end"}const te={padding:bt.padding_top||bt.padding_bottom||bt.padding_left||bt.padding_right||ut.padding_top||ut.padding_bottom||ut.padding_left||ut.padding_right?`${this.addPixelUnit(bt.padding_top||ut.padding_top)||"0px"} ${this.addPixelUnit(bt.padding_right||ut.padding_right)||"0px"} ${this.addPixelUnit(bt.padding_bottom||ut.padding_bottom)||"0px"} ${this.addPixelUnit(bt.padding_left||ut.padding_left)||"0px"}`:"0",margin:bt.margin_top||bt.margin_bottom||bt.margin_left||bt.margin_right||ut.margin_top||ut.margin_bottom||ut.margin_left||ut.margin_right?`${bt.margin_top||ut.margin_top||"8px"} ${bt.margin_right||ut.margin_right||"0px"} ${bt.margin_bottom||ut.margin_bottom||"8px"} ${bt.margin_left||ut.margin_left||"0px"}`:"8px 0",background:_t,backgroundImage:this.getBackgroundImageCSS(Object.assign(Object.assign({},ut),bt),e),backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",border:(bt.border_style||ut.border_style)&&"none"!==(bt.border_style||ut.border_style)?`${this.addPixelUnit(bt.border_width||ut.border_width)||"1px"} ${bt.border_style||ut.border_style} ${bt.border_color||ut.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(bt.border_radius||ut.border_radius)||"0",position:bt.position||ut.position||"relative",top:bt.top||ut.top||"auto",bottom:bt.bottom||ut.bottom||"auto",left:bt.left||ut.left||"auto",right:bt.right||ut.right||"auto",zIndex:bt.z_index||ut.z_index||"auto",width:ht,height:bt.height||ut.height||wt,maxWidth:bt.max_width||ut.max_width||"100%",maxHeight:bt.max_height||ut.max_height||"none",minWidth:bt.min_width||ut.min_width||(Kt?"0":"auto"),minHeight:bt.min_height||ut.min_height||"auto",overflow:bt.overflow||ut.overflow||"visible",boxSizing:"border-box",clipPath:bt.clip_path||ut.clip_path||"none",backdropFilter:bt.backdrop_filter||ut.backdrop_filter||"none",boxShadow:bt.box_shadow_h&&bt.box_shadow_v?`${bt.box_shadow_h||"0"} ${bt.box_shadow_v||"0"} ${bt.box_shadow_blur||"0"} ${bt.box_shadow_spread||"0"} ${bt.box_shadow_color||"rgba(0,0,0,0.1)"}`:ut.box_shadow_h&&ut.box_shadow_v?`${ut.box_shadow_h||"0"} ${ut.box_shadow_v||"0"} ${ut.box_shadow_blur||"0"} ${ut.box_shadow_spread||"0"} ${ut.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",color:bt.color||ut.color||"var(--primary-text-color)",fontFamily:bt.font_family||ut.font_family||"inherit",fontSize:bt.font_size&&"string"==typeof bt.font_size&&""!==bt.font_size.trim()?/[a-zA-Z%]/.test(bt.font_size)?bt.font_size:`${bt.font_size}px`:void 0!==ut.font_size?`${ut.font_size}px`:"inherit",textAlign:bt.text_align||ut.text_align||"inherit",lineHeight:bt.line_height||ut.line_height||"inherit",letterSpacing:bt.letter_spacing||ut.letter_spacing||"normal",textShadow:bt.text_shadow_h&&bt.text_shadow_v?`${bt.text_shadow_h||"0"} ${bt.text_shadow_v||"0"} ${bt.text_shadow_blur||"0"} ${bt.text_shadow_color||"rgba(0,0,0,0.25)"}`:ut.text_shadow_h&&ut.text_shadow_v?`${ut.text_shadow_h||"0"} ${ut.text_shadow_v||"0"} ${ut.text_shadow_blur||"0"} ${ut.text_shadow_color||"rgba(0,0,0,0.25)"}`:"none"},ee=this.createGestureHandlers(K.id,{tap_action:K.tap_action,hold_action:K.hold_action,double_tap_action:K.double_tap_action,entity:K.entity,module:K},e,r),ie=null===(Y=K.design)||void 0===Y?void 0:Y.hover_effect,ae=h.k.getHoverEffectClass(ie);return a.qy`
      <style>
        ${this.getStyles()}
      </style>
      <div
        class="bar-module-preview"
        data-layout-grow="${Kt?"true":"false"}"
        style=${this.styleObjectToCss(te)}
        ${(0,n.K)((t=>{t&&setTimeout((()=>{const e=t.parentElement;if("true"===(null==e?void 0:e.getAttribute("data-flex-constrained"))){const e=t.querySelector(".bar-container");e&&(e.style.width="100%")}}),0)}))}
      >
        <!-- Bar Container -->
        <div 
          class="bar-flex-wrapper"
          style="display: flex; justify-content: ${Qt}; width: 100%; min-height: ${yt}; align-items: center; min-width: 0; overflow: visible;">
          <div
            class="bar-container ${ae}"
            style="
            width: ${Kt?"100%":Jt};
            max-width: 100%;
            flex: ${Kt?"1 1 0":"0 0 auto"};
            height: ${yt}; 
            background: ${vt};
            ${Kt?"min-width: 0;":"min-width: 80px;"}
            border-radius: ${kt}px;
            overflow: 'visible';
            position: relative;
            transition: ${!1!==K.animation?"all 0.3s ease":"none"};
            border: ${"outline"!==K.bar_style?`1px solid ${K.bar_border_color||ut.border_color||"var(--divider-color)"}`:"none"};
            ${Pt};
            cursor: ${K.tap_action&&"nothing"!==K.tap_action.action||K.hold_action&&"nothing"!==K.hold_action.action||K.double_tap_action&&"nothing"!==K.double_tap_action.action?"pointer":"default"};
            z-index: 1;
          "
          @pointerdown=${ee.onPointerDown}
          @pointerup=${ee.onPointerUp}
          @pointerleave=${ee.onPointerLeave}
        >
            <!-- Bar Fill / Dots Style / Minimal Style -->
            ${"minimal"===K.bar_style?(()=>{var t;const e="right-to-left"===Tt,i=e?100-tt:tt;let n=K.bar_color||"var(--primary-color)",r=K.dot_color||K.bar_color||"var(--primary-color)";if(K.use_gradient&&K.gradient_stops&&K.gradient_stops.length>0){const t=[...K.gradient_stops].sort(((t,e)=>t.position-e.position)),e=K.gradient_display_mode||"full",i="right-to-left"===Tt?"to left":"to right";if("full"===e)n=`linear-gradient(${i}, ${t.map((t=>`${St(t.color)} ${t.position}%`)).join(", ")})`,r=K.dot_color||St(Ct(t,tt));else if("cropped"===e)if(tt<=0){const e=St(t[0].color);n=e,r=K.dot_color||e}else{const e=[...t.filter((t=>t.position<=tt))],a=Ct(t,tt);if(e.some((t=>t.position===tt))||e.push({id:`cropped_${tt}`,position:tt,color:a}),e.sort(((t,e)=>t.position-e.position)),0===e.length){const e=St(t[0].color);n=e,r=K.dot_color||e}else n=`linear-gradient(${i}, ${e.map((t=>Object.assign(Object.assign({},t),{position:tt>0?t.position/tt*100:0}))).map((t=>`${St(t.color)} ${Math.min(100,Math.max(0,t.position))}%`)).join(", ")})`,r=K.dot_color||St(a)}else if("value-based"===e){const e=Ct(t,tt),i=St(e);n=i,r=K.dot_color||i}}const o="cropped"===(K.gradient_display_mode||"full")&&K.use_gradient,l=null!==(t=K.height)&&void 0!==t?t:20,s=Math.max(1,Math.floor(l/3)),d=Math.max(8,Math.min(24,3*s+6));return a.qy`
                      ${o?a.qy`
                            <!-- Background track (unfilled portion) -->
                            <div
                              style="
                                position: absolute;
                                top: 50%;
                                left: 0;
                                right: 0;
                                height: ${s}px;
                            background: ${K.bar_background_color||"rgba(var(--rgb-primary-color), 0.2)"};
                            transform: translateY(-50%);
                            border-radius: ${Math.max(1,Math.floor(s/2))}px;
                            opacity: 0.6;
                          "
                            ></div>

                            <!-- Filled track portion (with gradient) -->
                            <div
                              class="minimal-track ${Bt}"
                              style="
                                position: absolute;
                                top: 50%;
                                left: ${e?100-tt+"%":"0"};
                                width: ${tt}%;
                                height: ${s}px;
                            background: ${n};
                            transform: translateY(-50%);
                            border-radius: ${Math.max(1,Math.floor(s/2))}px;
                            opacity: 0.8;
                            transition: ${!1!==K.animation?"all 0.3s ease":"none"};
                          "
                            ></div>
                          `:a.qy`
                            <!-- Track line (full/value-based modes) -->
                            <div
                              class="minimal-track ${Bt}"
                              style="
                                position: absolute;
                                top: 50%;
                                left: 0;
                                right: 0;
                                height: ${s}px;
                            background: ${n};
                            transform: translateY(-50%);
                            border-radius: ${Math.max(1,Math.floor(s/2))}px;
                            opacity: 0.8;
                            transition: ${!1!==K.animation?"all 0.3s ease":"none"};
                          "
                            ></div>
                          `}

                      <!-- Dot/Icon indicator -->
                      ${(()=>{const t=!1!==K.minimal_icon_size_auto?Math.max(16,Math.min(32,Math.max(24,1.2*l))):K.minimal_icon_size||24,e=!1!==K.minimal_icon_use_dot_color?r:K.minimal_icon_color||r,n=K.minimal_icon_mode||"icon-in-dot",o=K.minimal_icon_enabled&&K.minimal_icon;return"icon-only"===n&&o?a.qy`
                            <div
                              class="minimal-icon ${Bt}"
                              style="
                                position: absolute;
                                top: 50%;
                                left: ${i}%;
                                width: ${t}px;
                                height: ${t}px;
                                transform: translate(-50%, -50%);
                                transition: ${!1!==K.animation?"left 0.3s ease, color 0.3s ease":"none"};
                                z-index: 3;
                                will-change: left, color;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                              "
                            >
                              <ha-icon
                                icon="${K.minimal_icon}"
                                style="
                                  color: ${e};
                                  width: ${t}px;
                                  height: ${t}px;
                                  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                                  display: flex;
                                  align-items: center;
                                  justify-content: center;
                                "
                              ></ha-icon>
                            </div>
                          `:"icon-in-dot"===n&&o?a.qy`
                            <div
                              class="minimal-dot ${Bt}"
                              style="
                                position: absolute;
                                top: 50%;
                                left: ${i}%;
                                width: ${d}px;
                                height: ${d}px;
                                background: ${r};
                                border: 2px solid var(--card-background-color);
                                border-radius: 50%;
                                transform: translate(-50%, -50%);
                                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                                transition: ${!1!==K.animation?"left 0.3s ease, background 0.3s ease":"none"};
                                z-index: 3;
                                will-change: left, background;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                              "
                            >
                              <ha-icon
                                icon="${K.minimal_icon}"
                                style="
                                  color: ${e};
                                  width: ${Math.max(8,t-4)}px;
                                  height: ${Math.max(8,t-4)}px;
                                  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
                                  display: flex;
                                  align-items: center;
                                  justify-content: center;
                                "
                              ></ha-icon>
                            </div>
                          `:a.qy`
                            <div
                              class="minimal-dot ${Bt}"
                              style="
                                position: absolute;
                                top: 50%;
                                left: ${i}%;
                                width: ${d}px;
                                height: ${d}px;
                                background: ${r};
                                border: 2px solid var(--card-background-color);
                                border-radius: 50%;
                                transform: translate(-50%, -50%);
                                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                                transition: ${!1!==K.animation?"left 0.3s ease, background 0.3s ease":"none"};
                                z-index: 3;
                                will-change: left, background;
                              "
                            ></div>
                          `})()}
                    `})():"dots"===K.bar_style?(()=>{var t;const e=null!==(t=K.height)&&void 0!==t?t:20,i=Math.max(6,Math.floor(e-8)),n=vt,r=K.use_gradient&&K.gradient_stops&&K.gradient_stops.length>0?[...K.gradient_stops].sort(((t,e)=>t.position-e.position)):(0,c.FB)(),o=t=>{const e=[...r].sort(((t,e)=>t.position-e.position));let i=e[0],a=e[e.length-1];for(let n=0;n<e.length-1;n++)if(t>=e[n].position&&t<=e[n+1].position){i=e[n],a=e[n+1];break}if(i.position===t)return i.color;if(a.position===t)return a.color;const n=a.position-i.position,o=0===n?0:(t-i.position)/n;return this.interpolateColor(i.color,a.color,o)},l=K.gradient_display_mode||"full",s=Array.from({length:20},((t,e)=>{const r=Math.round((e+1)/21*100),s="right-to-left"===Tt?100-r<=tt:r<=tt;let d=zt;if(K.use_gradient){if("full"===l)if(s){const t=tt>0?Math.min(100,Math.max(0,Math.round(r/Math.max(1,tt)*100))):0;d=o(t)}else d=n;else if("cropped"===l)d=s?o(r):n;else if("value-based"===l){const t=o(tt);d=s?t:n}}else d=s?K.bar_color||ut.color||"var(--primary-color)":n;return a.qy`<div
                          style="width:${i}px;height:${i}px;border-radius:50%;background:${d};flex-shrink:0;"
                        ></div>`})),d="right-to-left"===Tt?s.reverse():s;return a.qy`<div
                        class="dots-container"
                        style="display:flex;align-items:center;justify-content:space-between;width:100%;height:100%;padding:0 ${Math.max(2,Math.floor(i/3))}px;box-sizing:border-box;flex-direction:${"right-to-left"===Tt?"row-reverse":"row"};"
                      >
                        ${d}
                      </div>`})():(()=>{const t="right-to-left"===Tt,e="range"===gt,i=e?dt-st:tt,n=e?st:0;let r="";return r=e||tt>=99.5?`${kt}px`:t?`0 ${kt}px ${kt}px 0`:`${kt}px 0 0 ${kt}px`,a.qy`
                        <div
                          class="bar-fill ${Bt}"
                          style="
                        width: ${i}%;
                        height: 100%;
                        background: ${zt};
                        transition: ${!1!==K.animation?"width 0.3s ease, left 0.3s ease":"none"};
                        border-radius: ${r};
                        position: absolute;
                        ${e?`left: ${n}%;`:t?"right: 0;":"left: 0;"}
                        top: 0;
                        bottom: 0;
                        will-change: width${e?", left":""};
                        backface-visibility: hidden;
                        ${Dt}
                      "
                        >
                          ${qt?a.qy` <div
                                class="bar-fill-overlay"
                                style="
                                position: absolute;
                                inset: 0;
                                border-radius: inherit;
                                pointer-events: none;
                                ${qt}
                              "
                              ></div>`:""}
                        </div>
                      `})()}

            <!-- Limit Indicator -->
            ${K.limit_entity&&(null==e?void 0:e.states[K.limit_entity])&&lt>=0?a.qy`
                    <div
                      class="bar-limit-line"
                      style="
                    position: absolute; 
                    top: 0; 
                    bottom: 0; 
                    left: ${lt}%; 
                    width: 2px; 
                    background-color: ${K.limit_color||"var(--warning-color)"}; 
                    z-index: 5; 
                    transform: translateX(-50%);
                  "
                      title="${(()=>{var t;try{const a=null===(t=e.states[K.limit_entity])||void 0===t?void 0:t.state;return(async()=>{const{formatEntityState:t}=await Promise.resolve().then(i.bind(i,9760));t(e,K.limit_entity,{state:a,includeUnit:!0})})(),`Limit: ${a}`}catch(t){return"Limit"}})()}"
                    ></div>
                  `:""}

            <!-- Range Current Value Marker -->
            ${"range"===gt&&ct>=0?a.qy`
                    <div
                      class="bar-current-marker"
                      style="
                        position: absolute;
                        top: -4px;
                        bottom: -4px;
                        left: ${ct}%;
                        width: 4px;
                        background: ${K.range_current_color||"var(--accent-color)"};
                        border-radius: 2px;
                        z-index: 6;
                        transform: translateX(-50%);
                        box-shadow: 0 0 4px rgba(0,0,0,0.3);
                        transition: ${!1!==K.animation?"left 0.3s ease":"none"};
                      "
                      title="${(()=>{var t,i;try{const a=K.range_current_entity,n=K.range_current_attribute;if(a&&(null==e?void 0:e.states[a])){const r=e.states[a];return`Current: ${n&&void 0!==(null===(t=r.attributes)||void 0===t?void 0:t[n])?r.attributes[n]:r.state}${(null===(i=r.attributes)||void 0===i?void 0:i.unit_of_measurement)||""}`}return"Current"}catch(t){return"Current"}})()}"
                    ></div>
                  `:""}

            <!-- Percentage Text (Inside Bar) -->
            <div
              class="percentage-text"
              style="
                display: ${Ft?"block":"none"};
                position: absolute;
                top: 50%;
                left: ${"left"===Et?"8px":"right"===Et?"calc(100% - 32px)":"follow-fill"===Et?`${Math.min(tt,100)}%`:"50%"};
                transform: ${"center"===Et?"translate(-50%, -50%)":"follow-fill"===Et?It:"translate(0, -50%)"};
                text-align: ${"follow-fill"===Et?"right":Et};
                font-size: ${Mt};
                color: ${K.percentage_text_color||bt.color||ut.color||"white"};
                font-weight: ${K.percentage_text_bold?"bold":"600"};
                font-style: ${K.percentage_text_italic?"italic":"normal"};
                text-decoration: ${K.percentage_text_strikethrough?"line-through":"none"};
                z-index: 10;
                text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 100%;
              "
            >
              ${Ft?void 0!==K.percentage_min||void 0!==K.percentage_max||K.percentage_min_template_mode&&K.percentage_min_template||K.percentage_max_template_mode&&K.percentage_max_template?`${Ut}%`:K.show_value?Nt:`${Ut}%`:""}
            </div>
          </div>

          ${!(null==e?void 0:e.states[K.entity])&&K.entity?a.qy`
                  <div
                    class="entity-error"
                    style="color: var(--error-color); font-size: 12px; margin-top: 4px;"
                  >
                    Entity not found: ${K.entity}
                  </div>
                `:""}
        </div>

        <!-- Scale/Tick Marks -->
        ${K.show_scale?(()=>{const t=K.scale_divisions||5,e=!1!==K.scale_show_labels,i=K.scale_label_size||10,n=K.scale_label_color||"var(--secondary-text-color)",r=K.scale_position||"below",o=mt-pt,l=Array.from({length:t+1},((e,i)=>({value:pt+o*i/t,position:i/t*100})));return a.qy`
                  <div
                    class="bar-scale"
                    style="
                      display: flex;
                      justify-content: space-between;
                      width: ${Jt};
                      margin-top: ${"below"===r?"6px":"0"};
                      margin-bottom: ${"above"===r?"6px":"0"};
                      order: ${"above"===r?"-1":"1"};
                      align-self: ${"left"===K.bar_alignment?"flex-start":"right"===K.bar_alignment?"flex-end":"center"};
                    "
                  >
                    ${l.map((t=>a.qy`
                        <div
                          class="scale-tick"
                          style="
                            display: flex;
                            flex-direction: ${"above"===r?"column-reverse":"column"};
                            align-items: center;
                            min-width: 0;
                          "
                        >
                          <div
                            style="
                              width: 1px;
                              height: 6px;
                              background: var(--divider-color);
                            "
                          ></div>
                          ${e?a.qy`
                                <span
                                  style="
                                    font-size: ${i}px;
                                    color: ${n};
                                    margin-top: ${"below"===r?"2px":"0"};
                                    margin-bottom: ${"above"===r?"2px":"0"};
                                    white-space: nowrap;
                                  "
                                >
                                  ${Number.isInteger(t.value)?t.value:t.value.toFixed(1)}
                                </span>
                              `:""}
                        </div>
                      `))}
                  </div>
                `})():""}

        <!-- Left and Right Side Labels (Below Bar) -->
        ${K.left_enabled||K.right_enabled?a.qy`
                <div
                  class="bar-labels-below"
                  style="display: flex; justify-content: ${K.label_alignment||"space-between"}; align-items: center; margin-top: 8px; gap: 16px; width: 100%; overflow: hidden; box-sizing: border-box;"
                >
                  ${K.left_enabled?(()=>{let t=null,i=!1,n=0,o=0,l=null;const s=K.left_entity||K.entity;return a.qy`
                          <div
                            class="left-side-below"
                            style="text-align: left; flex: 1; min-width: 0; overflow: hidden; cursor: pointer;"
                            @pointerdown=${()=>{i=!1,t=setTimeout((()=>{i=!0,K.left_hold_action&&"nothing"!==K.left_hold_action.action&&d.K.handleAction(K.left_hold_action,e,document.body,r,s,K)}),500)}}
                            @pointerup=${a=>{if(a.stopPropagation(),t&&(clearTimeout(t),t=null),i)return void(i=!1);const c=Date.now();c-o<300&&1===n?(l&&(clearTimeout(l),l=null),n=0,K.left_double_tap_action&&"nothing"!==K.left_double_tap_action.action&&d.K.handleAction(K.left_double_tap_action,e,a.target,r,s,K)):(n=1,o=c,l=setTimeout((()=>{n=0,K.left_tap_action&&"nothing"===K.left_tap_action.action||d.K.handleAction(K.left_tap_action||{action:"default"},e,a.target,r,s,K)}),300))}}
                            @pointercancel=${()=>{t&&clearTimeout(t),i=!1}}
                          >
                            ${K.left_title&&K.left_title.trim()?a.qy`
                                  <span
                                    style="font-size: ${bt.font_size?`${Math.min(bt.font_size,16)}px`:`${Math.min(K.left_title_size||14,16)}px`}; color: ${bt.color||K.left_title_color||ut.color||"var(--primary-text-color)"}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                                  >
                                    ${K.left_title}:
                                  </span>
                                `:""}
                            <span
                              style="font-size: ${bt.font_size?`${Math.min(bt.font_size,16)}px`:`${Math.min(K.left_value_size||14,16)}px`}; font-weight: 600; color: ${bt.color||K.left_value_color||ut.color||"var(--primary-text-color)"}; margin-left: ${K.left_title&&K.left_title.trim()?"4px":"0"}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                            >
                              ${rt}
                            </span>
                          </div>
                        `})():a.qy`<div></div>`}
                  ${K.right_enabled?(()=>{let t=null,i=!1,n=0,o=0,l=null;const s=K.right_entity||K.entity;return a.qy`
                          <div
                            class="right-side-below"
                            style="text-align: right; flex: 1; min-width: 0; overflow: hidden; cursor: pointer;"
                            @pointerdown=${()=>{i=!1,t=setTimeout((()=>{i=!0,K.right_hold_action&&"nothing"!==K.right_hold_action.action&&d.K.handleAction(K.right_hold_action,e,document.body,r,s,K)}),500)}}
                            @pointerup=${a=>{if(a.stopPropagation(),t&&(clearTimeout(t),t=null),i)return void(i=!1);const c=Date.now();c-o<300&&1===n?(l&&(clearTimeout(l),l=null),n=0,K.right_double_tap_action&&"nothing"!==K.right_double_tap_action.action&&d.K.handleAction(K.right_double_tap_action,e,a.target,r,s,K)):(n=1,o=c,l=setTimeout((()=>{n=0,K.right_tap_action&&"nothing"===K.right_tap_action.action||d.K.handleAction(K.right_tap_action||{action:"default"},e,a.target,r,s,K)}),300))}}
                            @pointercancel=${()=>{t&&clearTimeout(t),i=!1}}
                          >
                            ${K.right_title&&K.right_title.trim()?a.qy`
                                  <span
                                    style="font-size: ${bt.font_size?`${Math.min(bt.font_size,16)}px`:`${Math.min(K.right_title_size||14,16)}px`}; color: ${bt.color||K.right_title_color||ut.color||"var(--primary-text-color)"}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                                  >
                                    ${K.right_title}:
                                  </span>
                                `:""}
                            <span
                              style="font-size: ${bt.font_size?`${Math.min(bt.font_size,16)}px`:`${Math.min(K.right_value_size||14,16)}px`}; font-weight: 600; color: ${bt.color||K.right_value_color||ut.color||"var(--primary-text-color)"}; margin-left: ${K.right_title&&K.right_title.trim()?"4px":"0"}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                            >
                              ${ot}
                            </span>
                          </div>
                        `})():a.qy`<div></div>`}
                </div>
              `:""}
        </div>
      </div>
    `}_hashString(t){let e=0;for(let i=0;i<t.length;i+=1)e=(e<<5)-e+t.charCodeAt(i),e|=0;return Math.abs(e)}_formatDuration(t){const e=Math.abs(t),i=Math.floor(e/1e3),a=Math.floor(i/60),n=Math.floor(a/60),r=Math.floor(n/24);if(r>0){const t=n%24;return t>0?`${r}d ${t}h`:`${r}d`}if(n>0){const t=a%60;return t>0?`${n}h ${t}m`:`${n}h`}if(a>0){const t=i%60;return t>0&&a<10?`${a}m ${t}s`:`${a}m`}return`${i}s`}validate(t){const e=t,i=[...super.validate(t).errors];return e.height&&(e.height<5||e.height>200)&&i.push("Bar height must be between 5 and 200 pixels"),e.border_radius&&(e.border_radius<0||e.border_radius>100)&&i.push("Border radius must be between 0 and 100 pixels"),e.limit_entity&&""!==e.limit_entity.trim()&&(e.limit_entity.includes(".")||i.push("Limit entity must be a valid entity ID (e.g., sensor.battery_limit)")),{valid:0===i.length,errors:i}}getStyles(){return`\n      ${r.m.getSliderStyles()}\n      .bar-module-preview {\n        display: block; /* ensure bar occupies width of its container */\n        width: 100%;\n        max-width: 100%;\n        overflow: visible;\n        box-sizing: border-box;\n        min-width: 80px; /* keep a visible track inside flex rows */\n        position: relative;\n        z-index: 0; /* Establish stacking context */\n      }\n      \n      /* When parent wrapper is flex-constrained, bar flex wrapper should be auto width */\n      /* so justify-content: center/flex-end can position the bar correctly */\n      [data-flex-constrained="true"] .bar-module-preview .bar-flex-wrapper {\n        width: auto !important;\n      }\n      \n      .bar-container {\n        width: 100%;\n        position: relative;\n        display: block;\n        box-sizing: border-box;\n        min-width: 0; /* allow flex parent to size correctly */\n        /* Ensure minimal style dots stay within container bounds */\n        contain: layout style;\n      }\n      \n      /* Minimal style specific containment */\n      .bar-container.minimal-style {\n        overflow: visible;\n        isolation: isolate; /* Create new stacking context */\n      }\n      \n      .bar-fill {\n        position: relative;\n        z-index: 1;\n        overflow: hidden; /* Keep overlay animations clipped to rounded corners */\n      }\n      \n      .bar-fill-overlay {\n        position: absolute;\n        inset: 0;\n        pointer-events: none;\n        z-index: 2;\n        overflow: hidden;\n        mix-blend-mode: normal;\n      }\n      \n      /* Ensure overlay inherits border radius properly */\n      .bar-fill-overlay {\n        border-radius: inherit;\n      }\n      \n      /* Outline style animation */\n      @keyframes outline-pulse {\n        0%, 100% { opacity: 0.6; }\n        50% { opacity: 1; }\n      }\n      \n      .bar-limit-line {\n        opacity: 0.9;\n        transition: opacity 0.2s ease;\n      }\n      \n      .bar-limit-line:hover {\n        opacity: 1;\n      }\n      \n      .bar-name {\n        font-size: 16px;\n        font-weight: 600;\n        color: var(--primary-text-color);\n        margin-bottom: 8px;\n        user-select: none;\n        word-wrap: break-word;\n      }\n      \n      .bar-value {\n        user-select: none;\n        text-shadow: 0 1px 2px rgba(0,0,0,0.1);\n      }\n      \n      .bar-value-outside {\n        user-select: none;\n        text-align: center;\n        font-weight: 600;\n        color: var(--primary-text-color);\n      }\n      \n      .entity-error {\n        font-size: 12px;\n        color: var(--error-color);\n        margin-top: 6px;\n        font-style: italic;\n        opacity: 0.8;\n      }\n      \n      .settings-section {\n        margin-bottom: 16px;\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n      \n      .settings-section * {\n        box-sizing: border-box;\n      }\n      \n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        margin-bottom: 12px !important;\n        padding-bottom: 0 !important;\n        border-bottom: none !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n      \n      .settings-section label {\n        display: block;\n        font-weight: 500;\n        margin-bottom: 4px;\n        color: var(--primary-text-color);\n      }\n      \n      .settings-section input,\n      .settings-section select {\n        width: 100%;\n        max-width: 100%;\n        padding: 8px;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--card-background-color);\n        color: var(--primary-text-color);\n        font-size: 14px;\n        box-sizing: border-box;\n      }\n      \n      .settings-section .checkbox-wrapper {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        font-weight: 500;\n      }\n      \n      .settings-section .checkbox-wrapper input[type="checkbox"] {\n        width: auto;\n        margin: 0;\n      }\n      \n      .help-text {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        margin: 4px 0 0 0;\n        opacity: 0.8;\n        word-wrap: break-word;\n      }\n      \n      .number-input,\n      .text-input,\n      .entity-input,\n      .select-input {\n        transition: border-color 0.2s ease;\n      }\n      \n      .number-input:focus,\n      .text-input:focus,\n      .entity-input:focus,\n      .select-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 1px var(--primary-color);\n      }\n      \n      /* Fix padding overflow */\n      .module-general-settings {\n        max-width: 100%;\n        /* Allow dropdown menus to render outside local containers */\n        overflow: visible;\n      }\n      \n      .module-general-settings { }\n      /* Dropdown positioning fixes scoped to Bar module (defensive in case globals miss) */\n      /* Let HA handle dropdown positioning naturally */\n      .bar-module-preview .settings-section {\n        overflow: visible;\n      }\n\n      .module-general-settings > * {\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n\n      /* Conditional Fields Grouping CSS */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      .conditional-fields-group:hover {\n        background: rgba(var(--rgb-primary-color), 0.12);\n      }\n\n      .conditional-fields-header {\n        background: rgba(var(--rgb-primary-color), 0.15);\n        padding: 12px 16px;\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-color);\n        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n\n      .conditional-fields-content {\n        padding: 16px;\n      }\n\n      .conditional-fields-content > .field-title:first-child {\n        margin-top: 0 !important;\n      }\n\n      @keyframes slideInFromLeft {\n        from { \n          opacity: 0; \n          transform: translateX(-10px); \n        }\n        to { \n          opacity: 1; \n          transform: translateX(0); \n        }\n      }\n\n      /* Proper form field arrangement: Title -> Description -> Field */\n      .settings-section ha-form {\n        --ha-form-field-margin: 8px 0;\n      }\n\n      .settings-section ha-form::part(field) {\n        margin-bottom: 8px;\n      }\n\n      .settings-section ha-form .ha-form-label {\n        font-size: 14px;\n        font-weight: 500;\n        color: var(--primary-text-color);\n        margin-bottom: 4px;\n        display: block;\n      }\n\n      .settings-section ha-form .ha-form-description {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        margin-bottom: 8px;\n        display: block;\n        opacity: 0.8;\n        line-height: 1.4;\n      }\n\n      .settings-section ha-form mwc-formfield {\n        --mdc-typography-body2-font-size: 14px;\n      }\n\n      .settings-section ha-form ha-switch {\n        --switch-checked-color: var(--primary-color);\n        --switch-unchecked-color: var(--disabled-color);\n      }\n\n      /* Field arrangement styling */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n      \n        margin-bottom: 4px !important;\n        padding-bottom: 0 !important;\n        border-bottom: none !important;\n        display: block !important;\n        line-height: 1.2 !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        display: block !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n        font-weight: 400 !important;\n      }\n\n      /* Remove labels from ultra-color-picker when using external titles */\n      .settings-section ultra-color-picker .color-label {\n        display: none;\n      }\n\n      /* Prevent form fields from going off screen */\n      .property-input, .property-select {\n        max-width: 500px;\n      }\n\n      /* Apply max-width to ha-form elements */\n      .settings-section ha-form {\n        max-width: 500px;\n      }\n\n      /* Apply max-width to form inputs and selects */\n      .settings-section input,\n      .settings-section select,\n      .settings-section ha-textfield,\n      .settings-section ha-select {\n        max-width: 500px;\n      }\n      /* Give selects a consistent card background (scoped to bar module sections only) */\n      .bar-module-preview .settings-section ha-select {\n        background: var(--card-background-color) !important;\n        border: 1px solid var(--divider-color) !important;\n        border-radius: 6px !important;\n        padding: 4px 0 !important;\n        /* MWC menu and text field surfaces */\n        --mdc-theme-surface: var(--card-background-color);\n        --mdc-text-field-fill-color: var(--card-background-color);\n        --mdc-select-fill-color: var(--card-background-color);\n        --mdc-menu-surface-fill-color: var(--card-background-color);\n        --mdc-text-field-ink-color: var(--primary-text-color);\n        --mdc-text-field-outline-color: var(--divider-color);\n        --mdc-select-dropdown-icon-color: var(--secondary-text-color);\n        --mdc-theme-text-primary-on-background: var(--primary-text-color);\n        --mdc-theme-on-surface: var(--primary-text-color);\n      }\n\n      /* Ensure ha-form selects inherit same surface in all contexts */\n      .bar-module-preview .settings-section ha-form ha-select {\n        --mdc-theme-surface: var(--card-background-color);\n        --mdc-text-field-fill-color: var(--card-background-color);\n        --mdc-select-fill-color: var(--card-background-color);\n        --mdc-menu-surface-fill-color: var(--card-background-color);\n        --mdc-text-field-ink-color: var(--primary-text-color);\n        --mdc-text-field-outline-color: var(--divider-color);\n        --mdc-select-dropdown-icon-color: var(--secondary-text-color);\n        --mdc-theme-text-primary-on-background: var(--primary-text-color);\n        --mdc-theme-on-surface: var(--primary-text-color);\n      }\n\n      /* Give animation selects a proper background */\n      .settings-section[data-animation] ha-select,\n      .animation-select-group ha-select {\n        background: var(--card-background-color) !important;\n        border: 1px solid var(--divider-color) !important;\n        border-radius: 6px !important;\n        padding: 4px 0 !important;\n      }\n      /* Ensure percentage type dropdown has standard background container */\n      .percentage-type-group ha-select {\n        background: var(--card-background-color) !important;\n        border: 1px solid var(--divider-color) !important;\n        border-radius: 6px !important;\n        padding: 4px 0 !important;\n      }\n\n      /* Fix slider and input field layouts */\n      .settings-section .field-group {\n        max-width: 100%;\n        overflow: visible;\n        align-items: stretch;\n      }\n\n      /* Ensure slider containers don't get cut off */\n      .settings-section ha-form[style*="flex: 1"] {\n        min-width: 200px;\n        flex: 1 1 200px;\n      }\n\n      /* Fix input field containers */\n      .settings-section input[type="number"] {\n        width: 72px !important;\n        max-width: 72px !important;\n        min-width: 72px !important;\n        flex-shrink: 0;\n      }\n\n      /* Ensure proper spacing for slider + input combos */\n      .settings-section div[style*="display: flex; gap: 8px"] {\n        gap: 8px !important;\n        align-items: center !important;\n        flex-wrap: nowrap !important;\n        min-width: 0;\n      }\n\n      .settings-section div[style*="display: flex; gap: 12px"] {\n        gap: 12px !important;\n        align-items: center !important;\n        flex-wrap: nowrap !important;\n        min-width: 0;\n      }\n\n      /* Prevent overflow in gradient editor */\n      .gradient-editor {\n        max-width: 100%;\n        overflow: visible;\n      }\n\n      .gradient-stop {\n        max-width: 100%;\n        overflow: visible;\n        position: relative;\n      }\n\n      /* Gradient stop drag handle styling */\n      .gradient-stop .drag-handle {\n        transition: all 0.2s ease;\n      }\n\n      .gradient-stop:hover .drag-handle {\n        color: var(--primary-color) !important;\n        transform: scale(1.1);\n      }\n\n      /* Ultra color picker sizing */\n      ultra-color-picker {\n        min-width: 40px;\n        max-width: 60px;\n        flex-shrink: 0;\n      }\n\n      /* Ensure gradient controls don't overflow */\n      .gradient-stops {\n        max-width: 100%;\n        overflow: visible;\n      }\n\n      /* Hide automatic value displays from ha-form sliders to prevent cut-off */\n      .settings-section ha-form ha-slider::part(value-display),\n      .settings-section ha-form mwc-slider::part(value-display),\n      .settings-section ha-form ha-slider .value-display,\n      .settings-section ha-form mwc-slider .value-display {\n        display: none !important;\n      }\n\n      /* Hide any automatic number displays that might appear next to sliders */\n      .settings-section ha-form .slider-value,\n      .settings-section ha-form .current-value,\n      .settings-section ha-form .number-display {\n        display: none !important;\n      }\n\n      /* Override any default slider value display styles */\n      .settings-section ha-form[data-field*="size"] .mdc-slider-value-indicator,\n      .settings-section ha-form[data-field*="size"] .value-indicator {\n        display: none !important;\n      }\n\n      /* More comprehensive hiding of slider value displays */\n      .settings-section ha-form ha-textfield[type="number"],\n      .settings-section ha-form mwc-textfield[type="number"],\n      .settings-section ha-form .number-input-display {\n        display: none !important;\n      }\n\n      /* Target specific Home Assistant slider value containers */\n      .settings-section ha-form .form-group .number-display,\n      .settings-section ha-form .ha-form-number .display-value,\n      .settings-section ha-form [role="slider"] + *:not(.mdc-slider-track),\n      .settings-section ha-form .mdc-slider + .value-display {\n        display: none !important;\n      }\n\n      /* Ensure sliders take full width without value displays */\n      .settings-section ha-form .mdc-slider,\n      .settings-section ha-form ha-slider {\n        width: 100% !important;\n        max-width: 100% !important;\n      }\n\n      /* Hide any text elements that might display current values */\n      .settings-section ha-form .field-wrapper > span:last-child,\n      .settings-section ha-form .form-control > span:last-child,\n      .settings-section ha-form .slider-container > span:last-child {\n        display: none !important;\n      }\n\n      /* Specifically target number displays in form groups */\n      .settings-section ha-form .form-group > *:last-child:not(ha-slider):not(.mdc-slider):not(input[type="range"]) {\n        display: none !important;\n      }\n\n      /* Gap control styles - Standardized Slider Pattern */\n      .gap-control-container {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n\n      .gap-slider {\n        flex: 1;\n        height: 6px;\n        background: var(--divider-color);\n        border-radius: 3px;\n        outline: none;\n        appearance: none;\n        -webkit-appearance: none;\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n\n      .gap-slider::-webkit-slider-thumb {\n        appearance: none;\n        -webkit-appearance: none;\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider::-moz-range-thumb {\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider:hover {\n        background: var(--primary-color);\n        opacity: 0.7;\n      }\n\n      .gap-slider:hover::-webkit-slider-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-slider:hover::-moz-range-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-input {\n        width: 72px !important;\n        max-width: 72px !important;\n        min-width: 72px !important;\n        padding: 4px 6px !important;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 13px;\n        text-align: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n        box-sizing: border-box;\n      }\n\n      .gap-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);\n      }\n\n      /* Range input styling for number-range-control */\n      .number-range-control {\n        display: flex;\n        gap: 8px;\n        align-items: center;\n      }\n\n      .range-slider {\n        flex: 1;\n      }\n\n      .range-input {\n        width: 72px !important;\n        max-width: 72px !important;\n        min-width: 72px !important;\n        padding: 4px 6px !important;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 13px;\n        text-align: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n        box-sizing: border-box;\n      }\n\n      .range-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);\n      }\n\n      .reset-btn {\n        width: 36px;\n        height: 36px;\n        padding: 0;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n      }\n\n      .reset-btn:hover {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n      }\n\n      .reset-btn ha-icon {\n        font-size: 16px;\n      }\n\n      /* Conditional Fields Grouping - Reusable Pattern */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n      }\n\n      .conditional-fields-group:hover {\n        background: rgba(var(--rgb-primary-color), 0.12);\n        border-left-color: var(--primary-color);\n      }\n\n      .conditional-fields-header {\n        background: rgba(var(--rgb-primary-color), 0.15);\n        padding: 12px 16px;\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-color);\n        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n        margin: 0;\n      }\n\n      .conditional-fields-content {\n        padding: 16px;\n        background: transparent;\n      }\n\n      /* Remove top margin from first field in conditional groups */\n      .conditional-fields-content > .field-title:first-child {\n        margin-top: 0 !important;\n      }\n\n      /* Ensure proper spacing within conditional field groups */\n      .conditional-fields-content .field-title {\n     \n      }\n\n      .conditional-fields-content .field-description {\n        color: var(--secondary-text-color);\n        opacity: 0.9;\n      }\n\n      /* Animation for conditional fields appearing */\n      .conditional-fields-group {\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      @keyframes slideInFromLeft {\n        from {\n          opacity: 0;\n          transform: translateX(-10px);\n        }\n        to {\n          opacity: 1;\n          transform: translateX(0);\n        }\n      }\n\n      /* Make conditional fields responsive */\n      @media (max-width: 768px) {\n        .conditional-fields-group {\n          border-left-width: 3px;\n        }\n        \n        .conditional-fields-header {\n          padding: 10px 12px;\n          font-size: 13px;\n        }\n        \n        .conditional-fields-content {\n          padding: 12px;\n        }\n      }\n\n      /* ==========================\n         Bar Animations\n         These classes animate the .bar-fill element when triggered\n         ========================== */\n      .bar-fill.bar-anim-charging::after {\n        content: '';\n        position: absolute; inset: 0; pointer-events: none;\n        background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.25) 10px, transparent 10px, transparent 20px);\n        background-size: 28px 28px;\n        animation: charging-stripes 1.2s linear infinite;\n      }\n      @keyframes charging-stripes { 0% { background-position: 0 0; } 100% { background-position: 28px 0; } }\n\n      .bar-fill.bar-anim-pulse { animation: bar-pulse 1.6s ease-in-out infinite; }\n      @keyframes bar-pulse { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.3); } }\n\n      .bar-fill.bar-anim-blink { animation: bar-blink 1s steps(2, start) infinite; }\n      @keyframes bar-blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }\n\n      .bar-fill.bar-anim-bounce { animation: bar-bounce 1.2s ease-in-out infinite; transform-origin: center; }\n      @keyframes bar-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }\n\n      .bar-fill.bar-anim-glow { box-shadow: 0 0 10px currentColor, 0 0 20px currentColor; animation: bar-glow 1.5s ease-in-out infinite; }\n      @keyframes bar-glow { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.4); } }\n\n      .bar-fill.bar-anim-rainbow::after { \n        content:''; \n        position:absolute; \n        inset:0; \n        pointer-events:none; \n        background: linear-gradient(90deg, \n          red 0%, \n          orange 14.28%, \n          yellow 28.57%, \n          green 42.85%, \n          cyan 57.14%, \n          blue 71.42%, \n          violet 85.71%, \n          red 100%\n        ); \n        background-size: 200% 100%; \n        mix-blend-mode: overlay; \n        opacity: 0.9; \n        animation: rainbow-shift 4s linear infinite; \n      }\n      @keyframes rainbow-shift { \n        0% { background-position: 0% 0%; } \n        100% { background-position: 200% 0%; } \n      }\n\n      /* Bubbles: two extended layers with discrete bubbles, animated bottom -> top */\n      .bar-fill.bar-anim-bubbles::before,\n      .bar-fill.bar-anim-bubbles::after {\n        content: '';\n        position: absolute;\n        left: 0; right: 0;\n        top: -220%;\n        height: 440%;\n        pointer-events: none;\n        will-change: transform, opacity;\n        background-repeat: no-repeat;\n        filter: none;\n      }\n      /* Layer 1 (faster, fewer bubbles) */\n      .bar-fill.bar-anim-bubbles::before {\n        background:\n          radial-gradient(circle at 8% 80%,  rgba(255,255,255,0.55) 0 6px, transparent 7px),\n          radial-gradient(circle at 22% 55%, rgba(255,255,255,0.45) 0 5px, transparent 6px),\n          radial-gradient(circle at 37% 72%, rgba(255,255,255,0.50) 0 7px, transparent 8px),\n          radial-gradient(circle at 49% 60%, rgba(255,255,255,0.42) 0 5px, transparent 6px),\n          radial-gradient(circle at 63% 82%, rgba(255,255,255,0.50) 0 6px, transparent 7px),\n          radial-gradient(circle at 77% 68%, rgba(255,255,255,0.46) 0 5px, transparent 6px),\n          radial-gradient(circle at 89% 78%, rgba(255,255,255,0.52) 0 6px, transparent 7px);\n        animation: bubbles-rise-layer1 7s linear infinite;\n        transform: translateY(0%);\n      }\n      /* Layer 2 (slower, different positions) */\n      .bar-fill.bar-anim-bubbles::after {\n        background:\n          radial-gradient(circle at 14% 84%, rgba(255,255,255,0.48) 0 7px, transparent 8px),\n          radial-gradient(circle at 30% 66%, rgba(255,255,255,0.40) 0 5px, transparent 6px),\n          radial-gradient(circle at 55% 82%, rgba(255,255,255,0.50) 0 6px, transparent 7px),\n          radial-gradient(circle at 71% 64%, rgba(255,255,255,0.44) 0 5px, transparent 6px),\n          radial-gradient(circle at 84% 78%, rgba(255,255,255,0.50) 0 7px, transparent 8px);\n        animation: bubbles-rise-layer2 10s linear infinite;\n        animation-delay: 1.2s;\n        transform: translateY(0%);\n      }\n      @keyframes bubbles-rise-layer1 {\n        0%   { transform: translateY(0%); opacity: 0; }\n        22%  { opacity: 1; }\n        88%  { opacity: 1; }\n        100% { transform: translateY(-58%); opacity: 0; }\n      }\n      @keyframes bubbles-rise-layer2 {\n        0%   { transform: translateY(0%); opacity: 0; }\n        26%  { opacity: 1; }\n        88%  { opacity: 1; }\n        100% { transform: translateY(-58%); opacity: 0; }\n      }\n\n      .bar-fill.bar-anim-fill { animation: bar-fill-wave 1.5s ease-in-out infinite; }\n      @keyframes bar-fill-wave { 0%,100% { filter: saturate(1); } 50% { filter: saturate(1.4); } }\n\n      .bar-fill.bar-anim-ripple::after {\n        content: '';\n        position: absolute; inset: 0; pointer-events: none;\n        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 20%, transparent 40%);\n        background-size: 200% 100%;\n        animation: ripple-sweep 1.1s ease-in-out infinite;\n        opacity: 0.9;\n      }\n      @keyframes ripple-sweep {\n        0% { background-position-x: -50%; }\n        100% { background-position-x: 150%; }\n      }\n\n      /* Traffic: moving hazard chevrons left->right to evoke flowing traffic lanes */\n      .bar-fill.bar-anim-traffic::after {\n        content:''; position:absolute; inset:0; pointer-events:none; opacity: 0.95;\n        background-image:\n          linear-gradient(135deg, rgba(255,255,255,0.00) 0 40%, rgba(255,255,255,0.25) 40% 60%, rgba(255,255,255,0.00) 60% 100%),\n          linear-gradient(-135deg, rgba(255,255,255,0.00) 0 40%, rgba(255,255,255,0.25) 40% 60%, rgba(255,255,255,0.00) 60% 100%);\n        background-size: 44px 100%, 44px 100%;\n        background-position: 0 0, 22px 0;\n        animation: traffic-chevrons 1s linear infinite;\n        mix-blend-mode: screen;\n      }\n      @keyframes traffic-chevrons { 0% { background-position: 0 0, 22px 0; } 100% { background-position: 44px 0, 66px 0; } }\n\n      /* Traffic Flow: thicker bands with alternating opacity, moving left->right */\n      \n\n      .bar-fill.bar-anim-heartbeat { animation: heartbeat 1.2s ease-in-out infinite; transform-origin: center; }\n      @keyframes heartbeat { 0%,100% { transform: scale(1); } 20% { transform: scale(1.02); } 40% { transform: scale(0.99); } 60% { transform: scale(1.02); } 80% { transform: scale(1); } }\n\n      .bar-fill.bar-anim-flicker { animation: flicker 2s infinite; }\n      @keyframes flicker { 0%,19%,21%,23%,25%,54%,56%,100%{ opacity:1 } 20%,24%,55%{ opacity:0.4 } }\n\n      .bar-fill.bar-anim-shimmer { position: relative; overflow: hidden; }\n      .bar-fill.bar-anim-shimmer::after { content:''; position:absolute; top:0; bottom:0; width:40%; left:-40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent); animation: shimmer-move 1.4s ease-in-out infinite; }\n      @keyframes shimmer-move { 0% { left: -40%; } 100% { left: 120%; } }\n\n      .bar-fill.bar-anim-vibrate { animation: vibrate 0.15s linear infinite; }\n      @keyframes vibrate { 0% { transform: translate(0); } 25% { transform: translate(0.5px,-0.5px); } 50% { transform: translate(-0.5px,0.5px); } 75% { transform: translate(0.5px,0.5px); } 100% { transform: translate(0); } }\n\n      /* Minimal Bar Animations */\n      .minimal-track.bar-anim-pulse { animation: minimal-track-pulse 1.6s ease-in-out infinite; }\n      @keyframes minimal-track-pulse { 0%,100% { opacity: 0.8; } 50% { opacity: 1; } }\n      \n      .minimal-dot.bar-anim-pulse { animation: minimal-dot-pulse 1.6s ease-in-out infinite; }\n      @keyframes minimal-dot-pulse { 0%,100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.15); } }\n      \n      /* Minimal style z-index management */\n      .minimal-track {\n        z-index: 1;\n        position: relative;\n      }\n      \n      .minimal-dot {\n        z-index: 3 !important;\n        position: absolute;\n        /* Ensure dot stays within reasonable bounds */\n        max-width: 32px;\n        max-height: 32px;\n        /* Prevent dot from going outside card boundaries */\n        contain: size layout style;\n      }\n      \n      /* Percentage text positioning for minimal style */\n      .bar-container .percentage-text {\n        /* Ensure text doesn't interfere with HA header */\n        max-width: 100%;\n        overflow: hidden;\n        text-overflow: ellipsis;\n      }\n      \n      .minimal-track.bar-anim-glow { box-shadow: 0 0 4px currentColor; animation: minimal-track-glow 1.5s ease-in-out infinite; }\n      @keyframes minimal-track-glow { 0%,100% { box-shadow: 0 0 4px currentColor; } 50% { box-shadow: 0 0 8px currentColor; } }\n      \n      .minimal-dot.bar-anim-glow { animation: minimal-dot-glow 1.5s ease-in-out infinite; }\n      @keyframes minimal-dot-glow { 0%,100% { box-shadow: 0 2px 4px rgba(0,0,0,0.2), 0 0 6px currentColor; } 50% { box-shadow: 0 2px 6px rgba(0,0,0,0.3), 0 0 12px currentColor; } }\n      \n      .minimal-track.bar-anim-blink { animation: minimal-blink 1s steps(2, start) infinite; }\n      .minimal-dot.bar-anim-blink { animation: minimal-blink 1s steps(2, start) infinite; }\n      @keyframes minimal-blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }\n      \n      .minimal-dot.bar-anim-bouncing { animation: minimal-dot-bounce 1.2s ease-in-out infinite; }\n      @keyframes minimal-dot-bounce { 0%,100% { transform: translate(-50%, -50%); } 50% { transform: translate(-50%, calc(-50% - 4px)); } }\n      \n      .minimal-track.bar-anim-shimmer { position: relative; overflow: hidden; }\n      .minimal-track.bar-anim-shimmer::after { content:''; position:absolute; top:-50%; bottom:-50%; width:40%; left:-40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); animation: minimal-shimmer-move 1.4s ease-in-out infinite; }\n      @keyframes minimal-shimmer-move { 0% { left: -40%; } 100% { left: 120%; } }\n      \n      .minimal-dot.bar-anim-vibrate { animation: minimal-dot-vibrate 0.15s linear infinite; }\n      @keyframes minimal-dot-vibrate { 0% { transform: translate(-50%, -50%); } 25% { transform: translate(calc(-50% + 0.5px), calc(-50% - 0.5px)); } 50% { transform: translate(calc(-50% - 0.5px), calc(-50% + 0.5px)); } 75% { transform: translate(calc(-50% + 0.5px), calc(-50% + 0.5px)); } 100% { transform: translate(-50%, -50%); } }\n    `}normalizeSizeValue(t){if("number"==typeof t)return{value:t,unit:"%"};const e=String(t).trim();if(!e)return null;if(e.endsWith("%")){const t=parseFloat(e.slice(0,-1));return Number.isNaN(t)?null:{value:t,unit:"%"}}if(e.endsWith("px")){const t=parseFloat(e.slice(0,-2));return Number.isNaN(t)?null:{value:t,unit:"px"}}const i=parseFloat(e);return Number.isNaN(i)?null:{value:i,unit:"%"}}styleObjectToCss(t){return Object.entries(t).filter((([,t])=>null!=t&&""!==t)).map((([t,e])=>`${this.camelToKebab(t)}: ${e}`)).join("; ")}camelToKebab(t){return t.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}getBackgroundImageCSS(t,e){const i=t.background_image_type,a=t.background_image,n=t.background_image_entity;switch(i){case"upload":if(a)return a.startsWith("/api/image/serve/")?`url("${this.getImageUrl(e,a)}")`:(a.startsWith("data:image/"),`url("${a}")`);break;case"entity":if(n&&e){const t=e.states[n];if(t){const e=t.attributes.entity_picture||t.attributes.image||t.state;if(e&&"unknown"!==e&&"unavailable"!==e)return`url("${e}")`}}break;case"url":if(a)return`url("${a}")`;break;default:return"none"}return"none"}getImageUrl(t,e){if(!e)return"";if(e.startsWith("http"))return e;if(e.startsWith("data:image/"))return e;if(e.includes("/api/image/serve/")){const i=e.match(/\/api\/image\/serve\/([^\/]+)/);if(i&&i[1]){const a=i[1];try{return`${(t.hassUrl?t.hassUrl():"").replace(/\/$/,"")}/api/image/serve/${a}/original`}catch(t){return e}}return e}return e.startsWith("/")?`${(t.hassUrl?t.hassUrl():"").replace(/\/$/,"")}${e}`:e}getBarSizeFromHeight(t){return t<=12?"thin":t<=20?"regular":t<=30?"thick":"thiccc"}getBarRadiusFromStyle(t){return 0===t?"square":t<8?"rounded-square":"round"}interpolateColor(t,e,i){const a=this.parseColorToRGBA(t),n=this.parseColorToRGBA(e);return a&&n?`rgba(${Math.round(a.r+(n.r-a.r)*i)}, ${Math.round(a.g+(n.g-a.g)*i)}, ${Math.round(a.b+(n.b-a.b)*i)}, ${(a.a+(n.a-a.a)*i).toFixed(3)})`:t}hexToRgb(t){if(!t.startsWith("#"))return null;const e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t),i=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return i?{r:parseInt(i[1],16),g:parseInt(i[2],16),b:parseInt(i[3],16),a:parseInt(i[4],16)/255}:e?{r:parseInt(e[1],16),g:parseInt(e[2],16),b:parseInt(e[3],16),a:1}:null}rgbToHex(t,e,i,a){const n=Math.round(Math.max(0,Math.min(255,t))),r=Math.round(Math.max(0,Math.min(255,e))),o=Math.round(Math.max(0,Math.min(255,i)));if(void 0!==a&&a<1){const t=Math.round(Math.max(0,Math.min(255,255*a)));return`#${((1<<24)+(n<<16)+(r<<8)+o).toString(16).slice(1)}${t.toString(16).padStart(2,"0")}`}return`#${((1<<24)+(n<<16)+(r<<8)+o).toString(16).slice(1)}`}parseColorToRGBA(t){if(!t)return null;const e=this.resolveCSSColor(t),i=e.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)/i);if(i)return{r:parseInt(i[1],10),g:parseInt(i[2],10),b:parseInt(i[3],10),a:parseFloat(i[4])};const a=e.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);if(a)return{r:parseInt(a[1],10),g:parseInt(a[2],10),b:parseInt(a[3],10),a:1};const n=this.hexToRgb(e);if(n)return n;if("transparent"===e.toLowerCase())return{r:0,g:0,b:0,a:0};try{const t=document.createElement("span");t.style.color=e,document.body.appendChild(t);const i=getComputedStyle(t).color;if(t.remove(),i&&"rgba(0, 0, 0, 0)"!==i){const t=i.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([0-9.]+))?\s*\)/i);if(t)return{r:parseInt(t[1],10),g:parseInt(t[2],10),b:parseInt(t[3],10),a:t[4]?parseFloat(t[4]):1}}}catch(t){}return{r:128,g:128,b:128,a:1}}resolveCSSColor(t){if(!t)return t;const e=String(t).trim();if(e.startsWith("#")||e.startsWith("rgb"))return e;try{const t=document.createElement("span");t.style.backgroundColor=e,document.body.appendChild(t);const i=getComputedStyle(t).backgroundColor;return t.remove(),i&&"rgba(0, 0, 0, 0)"!==i?i:e}catch(t){return e}}addPixelUnit(t){return t?/^\d+$/.test(t)?`${t}px`:/^[\d\s]+$/.test(t)?t.split(" ").map((t=>t.trim()?`${t}px`:t)).join(" "):t:t}}},9760:(t,e,i)=>{i.d(e,{formatEntityState:()=>n});var a=i(9811);const n=(t,e,i)=>{var n,r;const o=!1!==(null==i?void 0:i.includeUnit),l=null===(n=null==t?void 0:t.states)||void 0===n?void 0:n[e];if(!t||!l)return void 0!==(null==i?void 0:i.state)?String(i.state):"";const s=t.formatEntityState,d=s?s(l,void 0!==(null==i?void 0:i.state)?String(i.state):void 0):(0,a.computeStateDisplay)(t.localize,l,t.locale,null==i?void 0:i.state);if(o)return d;const c=null===(r=l.attributes)||void 0===r?void 0:r.unit_of_measurement;if(c&&"string"==typeof d){const t=` ${c}`;if(d.endsWith(t))return d.slice(0,-t.length)}return d}}}]);