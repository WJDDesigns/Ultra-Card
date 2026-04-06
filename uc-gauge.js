"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[6736],{2325:(e,t,i)=>{i.r(t),i.d(t,{UltraGaugeModule:()=>p});var a=i(5183),o=i(7475),r=i(8465),n=(i(7921),i(7203),i(9442),i(5147)),l=i(8938),s=i(4111),d=i(5320),c=i(5121),u=i(9327);class p extends o.m{constructor(){super(...arguments),this.metadata={type:"gauge",title:"Gauge",description:"Display sensor values as customizable gauges with various styles and pointer options",author:"WJD Designs",version:"1.0.0",icon:"mdi:gauge",category:"content",tags:["gauge","sensor","value","indicator","speedometer","meter"]}}createDefault(e,t){const i=this.findSuitableSensor(t);return{id:e||this.generateId("gauge"),type:"gauge",entity:i,name:"",value_type:"entity",min_value:0,max_value:100,gauge_style:"3d",gauge_size:200,gauge_thickness:15,flip_horizontal:!1,pointer_enabled:!0,pointer_style:"needle",pointer_color:"var(--primary-color)",pointer_length:80,pointer_width:6,pointer_icon:"mdi:gauge",pointer_icon_color:"#FFFFFF",pointer_icon_size:24,gauge_color_mode:"gradient",gauge_color:"var(--primary-color)",gauge_background_color:"#424242",use_gradient:!0,gradient_stops:[{id:this.generateId("stop"),position:0,color:"#4CAF50"},{id:this.generateId("stop"),position:50,color:"#FFC107"},{id:this.generateId("stop"),position:100,color:"#F44336"}],show_value:!0,value_position:"center",value_font_size:24,value_color:"var(--primary-text-color)",value_bold:!1,value_italic:!1,value_underline:!1,value_uppercase:!1,value_strikethrough:!1,show_name:!0,name_position:"top",name_font_size:16,name_color:"var(--secondary-text-color)",name_bold:!1,name_italic:!1,name_underline:!1,name_uppercase:!1,name_strikethrough:!1,show_min_max:!0,min_max_font_size:12,min_max_color:"var(--secondary-text-color)",show_ticks:!0,tick_count:10,tick_color:"var(--divider-color)",show_tick_labels:!1,tick_label_font_size:10,gauge_animation_enabled:!0,gauge_animation_duration:"1000ms",gauge_animation_easing:"ease-out",segments:[{id:this.generateId("segment"),from:0,to:30,color:"#4CAF50",label:"Low"},{id:this.generateId("segment"),from:30,to:70,color:"#FFC107",label:"Medium"},{id:this.generateId("segment"),from:70,to:100,color:"#F44336",label:"High"}],tap_action:void 0,hold_action:void 0,double_tap_action:void 0,display_mode:"always",display_conditions:[],unified_template_mode:!1,unified_template:""}}findSuitableSensor(e){if(!(null==e?void 0:e.states))return"";const t=["sensor.battery_level","sensor.cpu_temperature","sensor.humidity","sensor.temperature"];for(const i of t)if(e.states[i])return i;return Object.keys(e.states).filter((t=>{if(!t.startsWith("sensor."))return!1;const i=e.states[t],a=parseFloat(i.state);return!isNaN(a)}))[0]||""}renderLogicTab(e,t,i,a){return l.X.render(e,t,(e=>a(e)))}renderGeneralTab(e,t,i,o){const r=e;return a.qy`
      ${this.injectUcFormStyles()}
      <style>
        .settings-section {
          background: var(--secondary-background-color);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 32px;
        }
        .settings-section label {
          width: auto;
        }
        .section-title {
          font-size: 18px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--primary-color);
          margin-bottom: 16px;
          padding-bottom: 0;
          border-bottom: none;
          letter-spacing: 0.5px;
        }
        .field-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-text-color);
          margin-bottom: 4px;
        }
        .field-description {
          font-size: 13px;
          color: var(--secondary-text-color);
          margin-bottom: 12px;
          opacity: 0.8;
          line-height: 1.4;
        }
        .conditional-fields-group {
          margin-top: 16px;
          border-left: 4px solid var(--primary-color);
          background: rgba(var(--rgb-primary-color), 0.08);
          border-radius: 0 8px 8px 0;
          padding: 16px;
          overflow: hidden;
          transition: all 0.2s ease;
          animation: slideInFromLeft 0.3s ease-out;
        }
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .gradient-stops-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 12px;
        }
        .gradient-stop {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 8px;
          align-items: center;
          padding: 12px;
          background: var(--card-background-color);
          border-radius: 8px;
          border: 1px solid var(--divider-color);
        }
        .add-stop-btn,
        .remove-stop-btn {
          padding: 8px 16px;
          border-radius: 4px;
          border: 1px solid var(--divider-color);
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          font-weight: 500;
        }
        .add-stop-btn:hover {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        .remove-stop-btn {
          padding: 6px 12px;
          background: rgba(var(--rgb-accent-color), 0.1);
          border-color: var(--accent-color);
        }
        .remove-stop-btn:hover {
          background: var(--accent-color);
          color: white;
        }
        .segments-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 12px;
        }
        .segment-item {
          padding: 12px;
          background: var(--card-background-color);
          border-radius: 8px;
          border: 1px solid var(--divider-color);
        }
        .segment-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 8px;
        }
        .template-section {
          background: var(--card-background-color);
          border-radius: 8px;
          padding: 16px;
          border: 1px solid var(--divider-color);
          margin-bottom: 32px;
        }
        .template-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .template-help {
          font-size: 12px;
          color: var(--secondary-text-color);
          margin-top: 12px;
          padding: 12px;
          background: rgba(var(--rgb-primary-color), 0.05);
          border-radius: 4px;
        }
        .template-help p {
          margin: 8px 0;
        }
        .template-help ul {
          margin: 8px 0 8px 20px;
        }
        .template-help code {
          background: var(--code-editor-background-color, #1e1e1e);
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
          font-size: 11px;
        }
      </style>

      ${this.renderBasicConfiguration(r,t,o)}
      ${this.renderValueConfiguration(r,t,o)}
      ${this.renderStyleConfiguration(r,t,o)}
      ${this.renderPointerConfiguration(r,t,o)}
      ${this.renderColorConfiguration(r,t,o)}
      ${this.renderDisplayConfiguration(r,t,o)}
      ${this.renderTicksConfiguration(r,t,o)}
      ${this.renderAnimationConfiguration(r,t,o)}
    `}renderBasicConfiguration(e,t,i){var o,n;return a.qy`
      <div class="settings-section">
        <div class="section-title">BASIC CONFIGURATION</div>

        <div style="margin-bottom: 24px;">
          ${r.Q.renderField("Entity","Select the sensor entity to display on the gauge.",t,{entity:e.entity||""},[r.Q.createSchemaItem("entity",{entity:{domain:["sensor","input_number"]}})],(e=>i({entity:e.detail.value.entity})))}
        </div>

        <div style="margin-bottom: 24px;">
          ${r.Q.renderField("Name","Optional display name for the gauge. Leave empty to use entity friendly name.",t,{name:e.name||""},[r.Q.createSchemaItem("name",{text:{}})],(e=>i({name:e.detail.value.name})))}
        </div>

        <div class="field-container" style="margin-bottom: 24px;">
          <div class="field-title">Minimum Value</div>
          <div class="field-description">The minimum value for the gauge scale.</div>
          ${r.Q.renderCleanForm(t,{min_value:null!==(o=e.min_value)&&void 0!==o?o:0},[r.Q.createSchemaItem("min_value",{number:{mode:"box",step:1}})],(e=>{const t=e.detail.value.min_value;i({min_value:""===t?void 0:Number(t)})}))}
        </div>

        <div class="field-container" style="margin-bottom: 24px;">
          <div class="field-title">Maximum Value</div>
          <div class="field-description">The maximum value for the gauge scale.</div>
          ${r.Q.renderCleanForm(t,{max_value:null!==(n=e.max_value)&&void 0!==n?n:100},[r.Q.createSchemaItem("max_value",{number:{mode:"box",step:1}})],(e=>{const t=e.detail.value.max_value;i({max_value:""===t?void 0:Number(t)})}))}
        </div>
      </div>
    `}renderValueConfiguration(e,t,i){const o=e.value_type||"entity";let n=e.unified_template_mode||!1;if(!n&&e.value_template&&""!==e.value_template.trim()&&!e.unified_template){const t={unified_template_mode:!0,unified_template:e.value_template,value_type:"entity",value_template:""};i(t),n=!0}return a.qy`
      <div class="settings-section">
        <div class="section-title">VALUE CONFIGURATION</div>

        <!-- Value Source -->
        <div class="field-group" style="margin-bottom: 24px; ${n?"opacity: 0.5; pointer-events: none;":""}">
          <div class="field-title">
            Value Source
            ${n?a.qy`<span style="font-size: 12px; color: var(--secondary-text-color); margin-left: 8px; font-weight: normal;">(Disabled - Template Mode Active)</span>`:""}
          </div>
          <div class="field-description">
            ${n?"Value Source options are disabled when Template Mode is active. Use the template editor below to control the gauge value.":"How to calculate the gauge value."}
          </div>
          ${this.renderUcForm(t,{value_type:o},[this.selectField("value_type",[{value:"entity",label:"Entity State"},{value:"attribute",label:"Entity Attribute"}])],(e=>{const t=e.detail.value.value_type;t!==o&&(i({value_type:t}),setTimeout((()=>this.triggerPreviewUpdate()),50))}),!1)}
        </div>
        ${"attribute"!==o||n?"":a.qy`
              <div class="conditional-fields-group">
                ${r.Q.renderField("Attribute Entity","Entity containing the attribute.",t,{value_attribute_entity:e.value_attribute_entity||""},[r.Q.createSchemaItem("value_attribute_entity",{entity:{}})],(e=>i({value_attribute_entity:e.detail.value.value_attribute_entity})))}
                ${r.Q.renderField("Attribute Name","Name of the attribute to use.",t,{value_attribute_name:e.value_attribute_name||""},[r.Q.createSchemaItem("value_attribute_name",{text:{}})],(e=>i({value_attribute_name:e.detail.value.value_attribute_name})))}
              </div>
            `}

        <!-- Template Mode Section -->
        <div class="template-section" style="margin-bottom: 24px; margin-top: 24px;">
          <div
            style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
          >
            <div class="field-title" style="margin: 0;">Template Mode</div>
            <ha-switch
              .checked=${n}
              @change=${t=>{const a=t.target.checked,o={unified_template_mode:a};a&&e.value_template&&!e.unified_template&&(o.unified_template=e.value_template,o.value_type="entity",o.value_template=""),i(o),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ha-switch>
          </div>
          <div class="field-description" style="margin-bottom: 16px;">
            Use Jinja2 templates for dynamic value and color control.
          </div>

          ${n?a.qy`
                <div 
                  class="template-content"
                  @mousedown=${e=>{const t=e.target;t.closest("ultra-template-editor")||t.closest(".cm-editor")||e.stopPropagation()}}
                  @dragstart=${e=>e.stopPropagation()}
                >
                  <ultra-template-editor
                    .hass=${t}
                    .value=${e.unified_template||""}
                    .placeholder=${'{% set temp = state | float %}\n{\n  "value": {{ temp }},\n  "gauge_color": "{% if temp > 25 %}#FF4444{% elif temp > 20 %}#FF8800{% else %}#00CC00{% endif %}"\n}'}
                    .minHeight=${200}
                    .maxHeight=${500}
                    @value-changed=${e=>{i({unified_template:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                  ></ultra-template-editor>
                  <div class="template-help">
                    <p><strong>Return simple number for value-only:</strong></p>
                    <ul>
                      <li><code>{{ states('sensor.temperature') | float }}</code> → Changes gauge value only</li>
                    </ul>
                    <p><strong>Return JSON for multiple properties:</strong></p>
                    <ul>
                      <li><code>{ "value": 75, "gauge_color": "#FF0000" }</code></li>
                      <li>Available properties: <code>value</code> (number), <code>gauge_color</code> (CSS color)</li>
                    </ul>
                    <p><strong>Entity context variables (no need to hardcode entity ID):</strong></p>
                    <ul>
                      <li><code>entity</code> → Entity ID (${e.entity||"N/A"})</li>
                      <li><code>state</code> → Current state value</li>
                      <li><code>name</code> → Entity name</li>
                      <li><code>attributes</code> → All entity attributes</li>
                      <li><code>unit</code> → Unit of measurement</li>
                      <li><code>domain</code> → Entity domain (e.g., 'sensor', 'input_number')</li>
                      <li><code>device_class</code> → Device class</li>
                    </ul>
                    <p><strong>Example - Dynamic color based on temperature:</strong></p>
                    <code
                      style="display: block; background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-size: 11px;"
                    >
                      {% set temp = state | float %}<br />
                      {<br />
                      &nbsp;&nbsp;"value": {{ temp }},<br />
                      &nbsp;&nbsp;"gauge_color": "{% if temp > 25 %}#FF4444{% elif temp > 20 %}#FF8800{% else %}#00CC00{% endif %}"<br />
                      }
                    </code>
                  </div>
                </div>
              `:""}
        </div>
      </div>
    `}renderStyleConfiguration(e,t,i){return a.qy`
      <div class="settings-section">
        <div class="section-title">GAUGE STYLE</div>

        <div class="field-group" style="margin-bottom: 24px;">
          <div class="field-title">Gauge Style</div>
          <div class="field-description">Choose the visual style of the gauge.</div>
          ${this.renderUcForm(t,{gauge_style:e.gauge_style||"modern"},[this.selectField("gauge_style",[{value:"basic",label:"Basic"},{value:"modern",label:"Modern"},{value:"speedometer",label:"Speedometer"},{value:"arc",label:"Arc"},{value:"radial",label:"Radial"},{value:"lines",label:"Lines"},{value:"block",label:"Block"},{value:"minimal",label:"Minimal"},{value:"inset",label:"Inset"},{value:"3d",label:"3D"},{value:"neon",label:"Neon Glow"},{value:"digital",label:"Digital"}])],(t=>{const a=t.detail.value.gauge_style;a!==(e.gauge_style||"modern")&&(i({gauge_style:a}),setTimeout((()=>this.triggerPreviewUpdate()),50))}),!1)}
        </div>

        ${this.renderGaugeSizeFields(e,t,i)}
        ${this.renderFlipHorizontalOption(e,t,i)}
      </div>
    `}renderFlipHorizontalOption(e,t,i){const o=e.gauge_style||"modern";return["arc","speedometer"].includes(o)?a.qy`
      <div class="conditional-fields-group" style="margin-top: 16px;">
        <div
          style="display: flex; align-items: center; justify-content: space-between; gap: 12px;"
        >
          <div>
            <div class="field-title" style="margin: 0;">Flip Horizontal</div>
            <div class="field-description" style="margin: 4px 0 0 0;">
              Mirror the gauge so it fills from right to left.
            </div>
          </div>
          <ha-switch
            .checked=${e.flip_horizontal||!1}
            @change=${e=>{i({flip_horizontal:e.target.checked}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
          ></ha-switch>
        </div>
      </div>
    `:a.qy``}renderGaugeSizeFields(e,t,i){var o,n;const l=e.gauge_style||"modern";return["lines","digital"].includes(l)?a.qy``:a.qy`
      <div class="field-container" style="margin-bottom: 24px;">
        <div class="field-title">Gauge Size</div>
        <div class="field-description">Diameter/size of the gauge in pixels (100-400).</div>
        ${r.Q.renderCleanForm(t,{gauge_size:null!==(o=e.gauge_size)&&void 0!==o?o:200},[r.Q.createSchemaItem("gauge_size",{number:{mode:"box",min:100,max:400,step:10}})],(e=>{const t=e.detail.value.gauge_size;i({gauge_size:""===t?void 0:Number(t)})}))}
      </div>

      <div class="field-container" style="margin-bottom: 24px;">
        <div class="field-title">Gauge Thickness</div>
        <div class="field-description">Thickness of the gauge track (1-50).</div>
        ${r.Q.renderCleanForm(t,{gauge_thickness:null!==(n=e.gauge_thickness)&&void 0!==n?n:15},[r.Q.createSchemaItem("gauge_thickness",{number:{mode:"box",min:1,max:50,step:1}})],(e=>{const t=e.detail.value.gauge_thickness;i({gauge_thickness:""===t?void 0:Number(t)})}))}
      </div>
    `}renderPointerSizeFields(e,t,i){var o,n;const l=e.pointer_style||"needle";return["highlight","cap","icon"].includes(l)?a.qy``:a.qy`
      <div class="field-container" style="margin-bottom: 24px;">
        <div class="field-title">Pointer Length</div>
        <div class="field-description">Length as percentage of gauge radius (1-100).</div>
        ${r.Q.renderCleanForm(t,{pointer_length:null!==(o=e.pointer_length)&&void 0!==o?o:80},[r.Q.createSchemaItem("pointer_length",{number:{mode:"box",min:1,max:100,step:1}})],(e=>{const t=e.detail.value.pointer_length;i({pointer_length:""===t?void 0:Number(t)})}))}
      </div>

      <div class="field-container" style="margin-bottom: 24px;">
        <div class="field-title">Pointer Width</div>
        <div class="field-description">Width of the pointer in pixels (1-20).</div>
        ${r.Q.renderCleanForm(t,{pointer_width:null!==(n=e.pointer_width)&&void 0!==n?n:4},[r.Q.createSchemaItem("pointer_width",{number:{mode:"box",min:1,max:20,step:1}})],(e=>{const t=e.detail.value.pointer_width;i({pointer_width:""===t?void 0:Number(t)})}))}
      </div>
    `}renderPointerConfiguration(e,t,i){var o;const n=!1!==e.pointer_enabled;return a.qy`
      <div class="settings-section">
        <div
          style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
        >
          <div class="section-title" style="margin: 0;">POINTER CONFIGURATION</div>
          <ha-switch
            .checked=${n}
            @change=${e=>i({pointer_enabled:e.target.checked})}
          ></ha-switch>
        </div>
        <div class="field-description" style="margin-bottom: 16px;">
          Enable and customize the gauge pointer/needle that indicates the current value.
        </div>
        ${n?a.qy`
              <div class="conditional-fields-group">
                <div class="field-group" style="margin-bottom: 24px;">
                  <div class="field-title">Pointer Style</div>
                  <div class="field-description">Visual style of the pointer/needle.</div>
                  ${this.renderUcForm(t,{pointer_style:e.pointer_style||"needle"},[this.selectField("pointer_style",[{value:"needle",label:"Needle"},{value:"triangle",label:"Triangle"},{value:"arrow",label:"Arrow"},{value:"line",label:"Line"},{value:"circle",label:"Circle"},{value:"highlight",label:"Track Highlight"},{value:"cap",label:"Track Cap"},{value:"icon",label:"Icon"}])],(t=>{const a=t.detail.value.pointer_style;a!==(e.pointer_style||"needle")&&(i({pointer_style:a}),setTimeout((()=>this.triggerPreviewUpdate()),50))}),!1)}
                </div>

                ${"icon"===e.pointer_style?a.qy`
                      <div class="field-container" style="margin-bottom: 24px;">
                        <div class="field-title">Pointer Icon</div>
                        <div class="field-description">Select an icon to display as the pointer.</div>
                        ${r.Q.renderField("","",t,{pointer_icon:e.pointer_icon||"mdi:gauge"},[r.Q.createSchemaItem("pointer_icon",{icon:{}})],(e=>i({pointer_icon:e.detail.value.pointer_icon})))}
                      </div>

                      <div class="field-container" style="margin-bottom: 24px;">
                        <div class="field-title">Icon Color</div>
                        <div class="field-description">Color of the icon pointer.</div>
                        <ultra-color-picker
                          style="width: 100%;"
                          .value=${e.pointer_icon_color||""}
                          .defaultValue=${"#FFFFFF"}
                          .hass=${t}
                          @value-changed=${e=>i({pointer_icon_color:e.detail.value})}
                        ></ultra-color-picker>
                      </div>

                      <div class="field-container" style="margin-bottom: 24px;">
                        <div class="field-title">Icon Size</div>
                        <div class="field-description">Size of the icon in pixels (8-48).</div>
                        ${r.Q.renderCleanForm(t,{pointer_icon_size:null!==(o=e.pointer_icon_size)&&void 0!==o?o:24},[r.Q.createSchemaItem("pointer_icon_size",{number:{mode:"box",min:8,max:48,step:1}})],(e=>{const t=e.detail.value.pointer_icon_size;i({pointer_icon_size:""===t?void 0:Number(t)})}))}
                      </div>
                    `:a.qy`
                      <div class="field-container" style="margin-bottom: 24px;">
                        <div class="field-title">Pointer Color</div>
                        <div class="field-description">Color of the pointer.</div>
                        <ultra-color-picker
                          style="width: 100%;"
                          .value=${e.pointer_color||""}
                          .defaultValue=${"var(--primary-color)"}
                          .hass=${t}
                          @value-changed=${e=>i({pointer_color:e.detail.value})}
                        ></ultra-color-picker>
                      </div>
                    `}

                ${this.renderPointerSizeFields(e,t,i)}
              </div>
            `:""}
      </div>
    `}renderColorConfiguration(e,t,i){const o=e.gauge_color_mode||"gradient",r=e.unified_template_mode||!1;return a.qy`
      <div class="settings-section">
        <div class="section-title">COLOR CONFIGURATION</div>

        ${r?a.qy`
              <div style="padding: 12px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 8px; border-left: 4px solid var(--primary-color); margin-bottom: 16px;">
                <div style="font-size: 12px; color: var(--primary-color); font-weight: 600; margin-bottom: 4px;">
                  Template Mode Active
                </div>
                <div style="font-size: 11px; color: var(--secondary-text-color);">
                  Color settings below are used as fallback. Template Mode (in Value Configuration) can override colors via <code>gauge_color</code> property.
                </div>
              </div>
            `:""}

        <div class="field-group" style="margin-bottom: 24px;">
          <div class="field-title">Color Mode</div>
          <div class="field-description">How colors are applied to the gauge.</div>
          ${this.renderUcForm(t,{gauge_color_mode:o},[this.selectField("gauge_color_mode",[{value:"solid",label:"Solid Color"},{value:"gradient",label:"Gradient"},{value:"segments",label:"Color Segments"}])],(t=>{const a=t.detail.value.gauge_color_mode;if(a===o)return;const r={gauge_color_mode:a};"segments"!==a||e.segments&&0!==e.segments.length||(r.segments=[{id:this.generateId("segment"),from:0,to:30,color:"#4CAF50",label:"Low"},{id:this.generateId("segment"),from:30,to:70,color:"#FFC107",label:"Medium"},{id:this.generateId("segment"),from:70,to:100,color:"#F44336",label:"High"}]),i(r),setTimeout((()=>this.triggerPreviewUpdate()),50)}),!1)}
        </div>
        ${"solid"===o?a.qy`
              <div class="conditional-fields-group">
                <div class="field-container" style="margin-bottom: 24px;">
                  <div class="field-title">Gauge Color</div>
                  <div class="field-description">Main color of the gauge.</div>
                  <ultra-color-picker
                    style="width: 100%;"
                    .value=${e.gauge_color||""}
                    .defaultValue=${"var(--primary-color)"}
                    .hass=${t}
                    @value-changed=${e=>i({gauge_color:e.detail.value})}
                  ></ultra-color-picker>
                </div>
              </div>
            `:""}
        ${"gradient"===o?a.qy`
              <div class="conditional-fields-group">
                <div class="field-group" style="margin-bottom: 16px;">
                  <div class="field-title">Gradient Display Mode</div>
                  <div class="field-description">How the gradient is displayed on the gauge.</div>
                  ${this.renderUcForm(t,{gradient_display_mode:e.gradient_display_mode||"full"},[this.selectField("gradient_display_mode",[{value:"full",label:"Full Gradient"},{value:"cropped",label:"Cropped to Value"},{value:"value-based",label:"Value-Based Color"}])],(t=>{const a=t.detail.value.gradient_display_mode;a!==(e.gradient_display_mode||"full")&&(i({gradient_display_mode:a}),setTimeout((()=>this.triggerPreviewUpdate()),50))}),!1)}
                </div>

                <uc-gradient-editor
                  .stops=${e.gradient_stops||[{id:this.generateId("stop"),position:0,color:"#4CAF50"},{id:this.generateId("stop"),position:50,color:"#FFC107"},{id:this.generateId("stop"),position:100,color:"#F44336"}]}
                  .barSize=${"regular"}
                  .barRadius=${"round"}
                  .barStyle=${"flat"}
                  @gradient-changed=${e=>{i({gradient_stops:e.detail.stops})}}
                ></uc-gradient-editor>
              </div>
            `:""}
        ${"segments"===o?a.qy`
              <div class="conditional-fields-group">
                <div class="field-title">Color Segments</div>
                <div class="field-description">Define discrete color segments with ranges.</div>

                <div class="segments-container">
                  ${(e.segments||[]).map(((o,r)=>a.qy`
                      <div class="segment-item">
                        <div class="segment-row">
                          <div>
                            <div
                              style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px;"
                            >
                              From Value
                            </div>
                            <input
                              type="number"
                              .value="${o.from}"
                              @input=${t=>{const a=t.target,o=[...e.segments||[]];o[r]=Object.assign(Object.assign({},o[r]),{from:parseFloat(a.value)}),i({segments:o})}}
                              style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color);"
                            />
                          </div>
                          <div>
                            <div
                              style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px;"
                            >
                              To Value
                            </div>
                            <input
                              type="number"
                              .value="${o.to}"
                              @input=${t=>{const a=t.target,o=[...e.segments||[]];o[r]=Object.assign(Object.assign({},o[r]),{to:parseFloat(a.value)}),i({segments:o})}}
                              style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color);"
                            />
                          </div>
                        </div>
                        <div style="margin-bottom: 8px;">
                          <div
                            style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px;"
                          >
                            Label (optional)
                          </div>
                          <input
                            type="text"
                            .value="${o.label||""}"
                            @input=${t=>{const a=t.target,o=[...e.segments||[]];o[r]=Object.assign(Object.assign({},o[r]),{label:a.value}),i({segments:o})}}
                            style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color);"
                          />
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                          <div style="flex: 1;">
                            <div
                              style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px;"
                            >
                              Color
                            </div>
                            <ultra-color-picker
                              style="width: 100%;"
                              .value=${o.color}
                              .hass=${t}
                              @value-changed=${t=>{const a=[...e.segments||[]];a[r]=Object.assign(Object.assign({},a[r]),{color:t.detail.value}),i({segments:a})}}
                            ></ultra-color-picker>
                          </div>
                          <button
                            class="remove-stop-btn"
                            @click=${()=>{const t=[...e.segments||[]];t.splice(r,1),i({segments:t})}}
                            style="margin-top: 20px;"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    `))}
                </div>

                <button
                  class="add-stop-btn"
                  @click=${()=>{const t=[...e.segments||[]],a=t.length>0?t[t.length-1].to:e.min_value||0;t.push({id:this.generateId("segment"),from:a,to:a+20,color:"#4CAF50",label:""}),i({segments:t})}}
                  style="margin-top: 12px;"
                >
                  + Add Segment
                </button>
              </div>
            `:""}

        <div class="field-container" style="margin-top: 16px;">
          <div class="field-title">Background Color</div>
          <div class="field-description">Background color for the gauge track.</div>
          <ultra-color-picker
            style="width: 100%;"
            .value=${e.gauge_background_color||""}
            .defaultValue=${"var(--disabled-text-color)"}
            .hass=${t}
            @value-changed=${e=>i({gauge_background_color:e.detail.value})}
          ></ultra-color-picker>
        </div>
      </div>
    `}renderDisplayConfiguration(e,t,i){var o,n,l,s,d,c,u;const p=!1!==e.show_value,g=!1!==e.show_name,m=!1!==e.show_min_max;return a.qy`
      <div class="settings-section">
        <div class="section-title">DISPLAY CONFIGURATION</div>

        <!-- Value Display -->
        <div
          style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
        >
          <div class="field-title" style="margin: 0;">Show Value</div>
          <ha-switch
            .checked=${p}
            @change=${e=>i({show_value:e.target.checked})}
          ></ha-switch>
        </div>

        ${p?a.qy`
              <div class="conditional-fields-group" style="margin-bottom: 16px;">
                <div class="field-container" style="margin-bottom: 24px;">
                  <div class="field-title">Value Position</div>
                  <div class="field-description">Where to display the value text.</div>
                  ${this.renderUcForm(t,{value_position:e.value_position||"center"},[this.selectField("value_position",[{value:"center",label:"Center"},{value:"top",label:"Top"},{value:"bottom",label:"Bottom"},{value:"none",label:"None"}])],(t=>{const a=t.detail.value.value_position;a!==(e.value_position||"center")&&(i({value_position:a}),setTimeout((()=>this.triggerPreviewUpdate()),50))}),!1)}
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Value Font Size</div>
                  ${r.Q.renderCleanForm(t,{value_font_size:null!==(o=e.value_font_size)&&void 0!==o?o:24},[r.Q.createSchemaItem("value_font_size",{number:{mode:"box",min:8,max:48,step:1}})],(e=>{const t=e.detail.value.value_font_size;i({value_font_size:""===t?void 0:Number(t)})}))}
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Value Color</div>
                  <ultra-color-picker
                    style="width: 100%;"
                    .value=${e.value_color||""}
                    .defaultValue=${"var(--primary-text-color)"}
                    .hass=${t}
                    @value-changed=${e=>i({value_color:e.detail.value})}
                  ></ultra-color-picker>
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Value Text Formatting</div>
                  <div class="field-description">Apply formatting styles to the value text.</div>
                  <div class="format-buttons" style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button
                      class="format-btn ${e.value_bold?"active":""}"
                      @click=${()=>i({value_bold:!e.value_bold})}
                      style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${e.value_bold?"var(--primary-color)":"var(--secondary-background-color)"}; cursor: pointer; transition: all 0.2s ease; color: ${e.value_bold?"white":"var(--primary-text-color)"};"
                      title="Bold"
                    >
                      <ha-icon icon="mdi:format-bold"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${e.value_italic?"active":""}"
                      @click=${()=>i({value_italic:!e.value_italic})}
                      style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${e.value_italic?"var(--primary-color)":"var(--secondary-background-color)"}; cursor: pointer; transition: all 0.2s ease; color: ${e.value_italic?"white":"var(--primary-text-color)"};"
                      title="Italic"
                    >
                      <ha-icon icon="mdi:format-italic"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${e.value_underline?"active":""}"
                      @click=${()=>i({value_underline:!e.value_underline})}
                      style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${e.value_underline?"var(--primary-color)":"var(--secondary-background-color)"}; cursor: pointer; transition: all 0.2s ease; color: ${e.value_underline?"white":"var(--primary-text-color)"};"
                      title="Underline"
                    >
                      <ha-icon icon="mdi:format-underline"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${e.value_uppercase?"active":""}"
                      @click=${()=>i({value_uppercase:!e.value_uppercase})}
                      style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${e.value_uppercase?"var(--primary-color)":"var(--secondary-background-color)"}; cursor: pointer; transition: all 0.2s ease; color: ${e.value_uppercase?"white":"var(--primary-text-color)"};"
                      title="Uppercase"
                    >
                      <ha-icon icon="mdi:format-letter-case-upper"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${e.value_strikethrough?"active":""}"
                      @click=${()=>i({value_strikethrough:!e.value_strikethrough})}
                      style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${e.value_strikethrough?"var(--primary-color)":"var(--secondary-background-color)"}; cursor: pointer; transition: all 0.2s ease; color: ${e.value_strikethrough?"white":"var(--primary-text-color)"};"
                      title="Strikethrough"
                    >
                      <ha-icon icon="mdi:format-strikethrough"></ha-icon>
                    </button>
                  </div>
                </div>

                ${r.Q.renderField("Value Format",'Optional format string (e.g., "%.1f°C", "%.0f%%").',t,{value_format:e.value_format||""},[r.Q.createSchemaItem("value_format",{text:{}})],(e=>i({value_format:e.detail.value.value_format})))}

                <div class="field-container" style="margin-bottom: 24px; margin-top: 16px;">
                  <div class="field-title">Value X Offset</div>
                  <div class="field-description">
                    Horizontal offset for value positioning (supports negative values).
                  </div>
                  ${r.Q.renderCleanForm(t,{value_x_offset:null!==(n=e.value_x_offset)&&void 0!==n?n:0},[r.Q.createSchemaItem("value_x_offset",{number:{mode:"box",min:-500,max:500,step:1}})],(e=>{const t=e.detail.value.value_x_offset;i({value_x_offset:""===t?void 0:Number(t)})}))}
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Value Y Offset</div>
                  <div class="field-description">
                    Vertical offset for value positioning (supports negative values).
                  </div>
                  ${r.Q.renderCleanForm(t,{value_y_offset:null!==(l=e.value_y_offset)&&void 0!==l?l:0},[r.Q.createSchemaItem("value_y_offset",{number:{mode:"box",min:-500,max:500,step:1}})],(e=>{const t=e.detail.value.value_y_offset;i({value_y_offset:""===t?void 0:Number(t)})}))}
                </div>
              </div>
            `:""}

        <!-- Name Display -->
        <div
          style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
        >
          <div class="field-title" style="margin: 0;">Show Name</div>
          <ha-switch
            .checked=${g}
            @change=${e=>i({show_name:e.target.checked})}
          ></ha-switch>
        </div>

        ${g?a.qy`
              <div class="conditional-fields-group" style="margin-bottom: 16px;">
                <div class="field-group" style="margin-bottom: 24px;">
                  <div class="field-title">Name Position</div>
                  <div class="field-description">Where to display the name/label.</div>
                  ${this.renderUcForm(t,{name_position:e.name_position||"top"},[this.selectField("name_position",[{value:"top",label:"Top"},{value:"bottom",label:"Bottom"},{value:"none",label:"None"}])],(t=>{const a=t.detail.value.name_position;a!==(e.name_position||"top")&&(i({name_position:a}),setTimeout((()=>this.triggerPreviewUpdate()),50))}),!1)}
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Name Font Size</div>
                  ${r.Q.renderCleanForm(t,{name_font_size:null!==(s=e.name_font_size)&&void 0!==s?s:16},[r.Q.createSchemaItem("name_font_size",{number:{mode:"box",min:8,max:32,step:1}})],(e=>{const t=e.detail.value.name_font_size;i({name_font_size:""===t?void 0:Number(t)})}))}
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Name Color</div>
                  <ultra-color-picker
                    style="width: 100%;"
                    .value=${e.name_color||""}
                    .defaultValue=${"var(--secondary-text-color)"}
                    .hass=${t}
                    @value-changed=${e=>i({name_color:e.detail.value})}
                  ></ultra-color-picker>
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Name Text Formatting</div>
                  <div class="field-description">Apply formatting styles to the name text.</div>
                  <div class="format-buttons" style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button
                      class="format-btn ${e.name_bold?"active":""}"
                      @click=${()=>i({name_bold:!e.name_bold})}
                      style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${e.name_bold?"var(--primary-color)":"var(--secondary-background-color)"}; cursor: pointer; transition: all 0.2s ease; color: ${e.name_bold?"white":"var(--primary-text-color)"};"
                      title="Bold"
                    >
                      <ha-icon icon="mdi:format-bold"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${e.name_italic?"active":""}"
                      @click=${()=>i({name_italic:!e.name_italic})}
                      style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${e.name_italic?"var(--primary-color)":"var(--secondary-background-color)"}; cursor: pointer; transition: all 0.2s ease; color: ${e.name_italic?"white":"var(--primary-text-color)"};"
                      title="Italic"
                    >
                      <ha-icon icon="mdi:format-italic"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${e.name_underline?"active":""}"
                      @click=${()=>i({name_underline:!e.name_underline})}
                      style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${e.name_underline?"var(--primary-color)":"var(--secondary-background-color)"}; cursor: pointer; transition: all 0.2s ease; color: ${e.name_underline?"white":"var(--primary-text-color)"};"
                      title="Underline"
                    >
                      <ha-icon icon="mdi:format-underline"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${e.name_uppercase?"active":""}"
                      @click=${()=>i({name_uppercase:!e.name_uppercase})}
                      style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${e.name_uppercase?"var(--primary-color)":"var(--secondary-background-color)"}; cursor: pointer; transition: all 0.2s ease; color: ${e.name_uppercase?"white":"var(--primary-text-color)"};"
                      title="Uppercase"
                    >
                      <ha-icon icon="mdi:format-letter-case-upper"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${e.name_strikethrough?"active":""}"
                      @click=${()=>i({name_strikethrough:!e.name_strikethrough})}
                      style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${e.name_strikethrough?"var(--primary-color)":"var(--secondary-background-color)"}; cursor: pointer; transition: all 0.2s ease; color: ${e.name_strikethrough?"white":"var(--primary-text-color)"};"
                      title="Strikethrough"
                    >
                      <ha-icon icon="mdi:format-strikethrough"></ha-icon>
                    </button>
                  </div>
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Name X Offset</div>
                  <div class="field-description">
                    Horizontal offset for name positioning (supports negative values).
                  </div>
                  ${r.Q.renderCleanForm(t,{name_x_offset:null!==(d=e.name_x_offset)&&void 0!==d?d:0},[r.Q.createSchemaItem("name_x_offset",{number:{mode:"box",min:-500,max:500,step:1}})],(e=>{const t=e.detail.value.name_x_offset;i({name_x_offset:""===t?void 0:Number(t)})}))}
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Name Y Offset</div>
                  <div class="field-description">
                    Vertical offset for name positioning (supports negative values).
                  </div>
                  ${r.Q.renderCleanForm(t,{name_y_offset:null!==(c=e.name_y_offset)&&void 0!==c?c:0},[r.Q.createSchemaItem("name_y_offset",{number:{mode:"box",min:-500,max:500,step:1}})],(e=>{const t=e.detail.value.name_y_offset;i({name_y_offset:""===t?void 0:Number(t)})}))}
                </div>
              </div>
            `:""}

        <!-- Min/Max Display -->
        ${e.show_tick_labels?a.qy`
              <div class="field-container" style="margin-bottom: 16px; opacity: 0.5;">
                <div class="field-title">Show Min/Max Values</div>
                <div class="field-description" style="color: var(--warning-color);">
                  Min/Max values are automatically hidden when tick labels are enabled to avoid
                  visual clutter.
                </div>
              </div>
            `:a.qy`
              <div class="field-container" style="margin-bottom: 16px;">
                <div class="field-title">Show Min/Max Values</div>
                <div class="field-description">
                  Display minimum and maximum values on the gauge.
                </div>
                ${r.Q.renderCleanForm(t,{show_min_max:m},[r.Q.createSchemaItem("show_min_max",{boolean:{}})],(e=>i({show_min_max:e.detail.value.show_min_max})))}
              </div>
            `}
        ${m?a.qy`
              <div class="conditional-fields-group">
                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Min/Max Font Size</div>
                  ${r.Q.renderCleanForm(t,{min_max_font_size:null!==(u=e.min_max_font_size)&&void 0!==u?u:12},[r.Q.createSchemaItem("min_max_font_size",{number:{mode:"box",min:8,max:20,step:1}})],(e=>i({min_max_font_size:e.detail.value.min_max_font_size})))}
                </div>

                <div class="field-container">
                  <div class="field-title">Min/Max Color</div>
                  <ultra-color-picker
                    style="width: 100%;"
                    .value=${e.min_max_color||""}
                    .defaultValue=${"var(--secondary-text-color)"}
                    .hass=${t}
                    @value-changed=${e=>i({min_max_color:e.detail.value})}
                  ></ultra-color-picker>
                </div>
              </div>
            `:""}
      </div>
    `}renderTicksConfiguration(e,t,i){var o,n;const l=!1!==e.show_ticks,s=e.show_tick_labels||!1;return a.qy`
      <div class="settings-section">
        <div class="section-title">TICK MARKS</div>

        <div
          style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
        >
          <div class="field-title" style="margin: 0;">Show Tick Marks</div>
          <ha-switch
            .checked=${l}
            @change=${e=>i({show_ticks:e.target.checked})}
          ></ha-switch>
        </div>

        ${l?a.qy`
              <div class="conditional-fields-group">
                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Tick Count</div>
                  <div class="field-description">Number of major tick marks.</div>
                  ${r.Q.renderCleanForm(t,{tick_count:null!==(o=e.tick_count)&&void 0!==o?o:10},[r.Q.createSchemaItem("tick_count",{number:{mode:"box",min:2,max:50,step:1}})],(e=>{const t=e.detail.value.tick_count;i({tick_count:""===t?void 0:Number(t)})}))}
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Tick Color</div>
                  <ultra-color-picker
                    style="width: 100%;"
                    .value=${e.tick_color||""}
                    .defaultValue=${"var(--divider-color)"}
                    .hass=${t}
                    @value-changed=${e=>i({tick_color:e.detail.value})}
                  ></ultra-color-picker>
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Show Tick Labels</div>
                  ${r.Q.renderCleanForm(t,{show_tick_labels:s},[r.Q.createSchemaItem("show_tick_labels",{boolean:{}})],(e=>i({show_tick_labels:e.detail.value.show_tick_labels})))}
                </div>

                ${s?a.qy`
                      <div class="field-container">
                        <div class="field-title">Tick Label Font Size</div>
                        ${r.Q.renderCleanForm(t,{tick_label_font_size:null!==(n=e.tick_label_font_size)&&void 0!==n?n:10},[r.Q.createSchemaItem("tick_label_font_size",{number:{mode:"box",min:6,max:16,step:1}})],(e=>{const t=e.detail.value.tick_label_font_size;i({tick_label_font_size:""===t?void 0:Number(t)})}))}
                      </div>
                    `:""}
              </div>
            `:""}
      </div>
    `}renderAnimationConfiguration(e,t,i){const o=!1!==e.gauge_animation_enabled;return a.qy`
      <div class="settings-section">
        <div class="section-title">ANIMATION</div>

        <div
          style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
        >
          <div class="field-title" style="margin: 0;">Enable Animation</div>
          <ha-switch
            .checked=${o}
            @change=${e=>i({gauge_animation_enabled:e.target.checked})}
          ></ha-switch>
        </div>
        <div class="field-description" style="margin-bottom: 16px;">
          Animate gauge changes smoothly.
        </div>

        ${o?a.qy`
              <div class="conditional-fields-group">
                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Animation Duration</div>
                  <div class="field-description">
                    Duration in milliseconds (e.g., "1000ms", "1s").
                  </div>
                  ${r.Q.renderField("","",t,{gauge_animation_duration:e.gauge_animation_duration||"1000ms"},[r.Q.createSchemaItem("gauge_animation_duration",{text:{}})],(e=>{const t=e.detail.value.gauge_animation_duration;i({gauge_animation_duration:""===t?void 0:t})}))}
                </div>

                <div class="field-group">
                  <div class="field-title">Animation Easing</div>
                  <div class="field-description">Easing function for the animation.</div>
                  ${this.renderUcForm(t,{gauge_animation_easing:e.gauge_animation_easing||"ease-out"},[this.selectField("gauge_animation_easing",[{value:"linear",label:"Linear"},{value:"ease-in",label:"Ease In"},{value:"ease-out",label:"Ease Out"},{value:"ease-in-out",label:"Ease In-Out"},{value:"bounce",label:"Bounce"}])],(t=>{const a=t.detail.value.gauge_animation_easing;a!==(e.gauge_animation_easing||"ease-out")&&(i({gauge_animation_easing:a}),setTimeout((()=>this.triggerPreviewUpdate()),50))}),!1)}
                </div>
              </div>
            `:""}
      </div>
    `}renderActionsTab(e,t,i,a){return n.A.render(e,t,(e=>a(e)))}renderDesignTab(e,t,i,a){return s.T.render(e,t,(e=>a(e)))}renderSplitPreview(e,t){return this.renderPreview(e,t)}renderPreview(e,t,i,o){const r=e;if(this._templateService&&t&&this._templateService.updateHass(t),!(r.unified_template_mode||"template"===r.value_type||r.entity&&""!==r.entity.trim()))return this.renderGradientErrorState("Select Entity","Choose an entity in the General tab","mdi:gauge-empty");const n=r,l=r.design||{},s={display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:"100%",overflow:"visible",boxSizing:"border-box",padding:l.padding_top||l.padding_bottom||l.padding_left||l.padding_right||n.padding_top||n.padding_bottom||n.padding_left||n.padding_right?`${this.addPixelUnit(l.padding_top||n.padding_top)||"0px"} ${this.addPixelUnit(l.padding_right||n.padding_right)||"0px"} ${this.addPixelUnit(l.padding_bottom||n.padding_bottom)||"0px"} ${this.addPixelUnit(l.padding_left||n.padding_left)||"0px"}`:"0",margin:l.margin_top||l.margin_bottom||l.margin_left||l.margin_right||n.margin_top||n.margin_bottom||n.margin_left||n.margin_right?`${l.margin_top||n.margin_top||"0px"} ${l.margin_right||n.margin_right||"0px"} ${l.margin_bottom||n.margin_bottom||"0px"} ${l.margin_left||n.margin_left||"0px"}`:"0",background:l.background_color||n.background_color||"transparent",border:(l.border_style||n.border_style)&&"none"!==(l.border_style||n.border_style)?`${this.addPixelUnit(l.border_width||n.border_width)||"1px"} ${l.border_style||n.border_style} ${l.border_color||n.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(l.border_radius||n.border_radius)||"0",boxShadow:(l.box_shadow_h||n.box_shadow_h)&&(l.box_shadow_v||n.box_shadow_v)?`${l.box_shadow_h||n.box_shadow_h||"0"} ${l.box_shadow_v||n.box_shadow_v||"0"} ${l.box_shadow_blur||n.box_shadow_blur||"0"} ${l.box_shadow_spread||n.box_shadow_spread||"0"} ${l.box_shadow_color||n.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none"},d=Object.entries(s).filter((([e,t])=>null!=t&&""!==t)).map((([e,t])=>`${e.replace(/([A-Z])/g,"-$1").toLowerCase()}: ${t}`)).join("; "),c=this.calculateGaugeValue(r,t),u=this.getDisplayName(r,t),p=this.createGestureHandlers(r.id||"gauge",{tap_action:r.tap_action,hold_action:r.hold_action,double_tap_action:r.double_tap_action,entity:r.entity,module:r},t,i);return a.qy`
      <div
        class="uc-gauge-container"
        style="${d}; touch-action: manipulation; cursor: pointer;"
        @pointerdown=${p.onPointerDown}
        @pointerup=${p.onPointerUp}
        @pointerleave=${p.onPointerLeave}
        @pointercancel=${p.onPointerCancel}
      >
        ${r.show_name&&"top"===r.name_position?a.qy`
              <div class="uc-gauge-name" style="${this.getNameStyles(r)}">
                ${u}
              </div>
            `:""}

        <div
          class="uc-gauge-wrapper"
          style="position: relative; display: ${r.show_value&&"bottom"===r.value_position?"flex":"inline-block"}; ${r.show_value&&"bottom"===r.value_position?"flex-direction: column; align-items: center;":""} overflow: visible;"
        >
          ${r.show_value&&"top"===r.value_position?a.qy`
                <div class="uc-gauge-value-top" style="${this.getValueStyles(r)}">
                  ${this.formatValue(c,r)}
                </div>
              `:""}
          <svg
            class="uc-gauge-svg"
            viewBox="${this.getSvgViewBox(r)}"
            width="${r.gauge_size||200}"
            height="${this.getSvgHeight(r)}"
            style="overflow: visible;"
          >
            ${this.renderGaugeByStyle(r,c,t)}
          </svg>

          ${r.show_value&&"center"===r.value_position?a.qy`
                <div class="uc-gauge-value-center" style="${this.getValueStyles(r)}">
                  ${this.formatValue(c,r)}
                </div>
              `:""}
          ${r.show_value&&"bottom"===r.value_position?a.qy`
                <div class="uc-gauge-value-bottom" style="${this.getValueStyles(r)}">
                  ${this.formatValue(c,r)}
                </div>
              `:""}
        </div>
        ${r.show_name&&"bottom"===r.name_position?a.qy`
              <div class="uc-gauge-name" style="${this.getNameStyles(r)}">
                ${u}
              </div>
            `:""}
      </div>
    `}calculateGaugeValue(e,t){var i,a;if(e.unified_template_mode&&e.unified_template&&(!this._templateService&&t&&(this._templateService=new d.I(t)),t)){t.__uvc_template_strings||(t.__uvc_template_strings={});const a=this._hashString(e.unified_template),o=`unified_gauge_${e.id}_${a}`;if(this._templateService&&!this._templateService.hasTemplateSubscription(o)){const i=(0,u.pL)(e.entity||"",t,{entity:e.entity});this._templateService.subscribeToTemplate(e.unified_template,o,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),i)}const r=null===(i=t.__uvc_template_strings)||void 0===i?void 0:i[o];if(r&&""!==String(r).trim()){const e=(0,c.cv)(r);if(!(0,c.HD)(e)&&void 0!==e.value){const t="number"==typeof e.value?e.value:parseFloat(String(e.value));if(!isNaN(t))return t}}}const o=e.value_type||"entity";if("entity"===o){const i=t.states[e.entity];return i?parseFloat(i.state)||0:e.min_value||0}if("attribute"===o&&e.value_attribute_entity&&e.value_attribute_name){const i=t.states[e.value_attribute_entity];if(!i)return e.min_value||0;const a=i.attributes[e.value_attribute_name];return parseFloat(a)||0}if("template"===o&&e.value_template){if(!this._templateService&&t&&(this._templateService=new d.I(t)),t){t.__uvc_template_strings||(t.__uvc_template_strings={});const i=this._hashString(e.value_template),o=`gauge_value_${e.id}_${i}`;this._templateService&&!this._templateService.hasTemplateSubscription(o)&&this._templateService.subscribeToTemplate(e.value_template,o,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}));const r=null===(a=t.__uvc_template_strings)||void 0===a?void 0:a[o];if(void 0!==r&&""!==String(r).trim()){const e=parseFloat(String(r));if(!isNaN(e))return e}}return e.min_value||0}return e.min_value||0}getDisplayName(e,t){if(e.name)return e.name;const i=t.states[e.entity];return(null==i?void 0:i.attributes.friendly_name)||e.entity}formatValue(e,t){return t.value_format?t.value_format.replace(/%.(\d*)f/,((t,i)=>{const a=i?parseInt(i):0;return e.toFixed(a)})).replace(/%%/,"%"):e.toString()}renderGaugeByStyle(e,t,i){switch(e.gauge_style||"modern"){case"speedometer":return this.renderSpeedometerGauge(e,t,i);case"arc":return this.renderArcGauge(e,t,i);case"radial":return this.renderRadialGauge(e,t,i);case"lines":return this.renderLinesGauge(e,t,i);case"block":return this.renderBlockGauge(e,t,i);case"minimal":return this.renderMinimalGauge(e,t,i);case"inset":return this.renderInsetGauge(e,t,i);case"3d":return this.render3DGauge(e,t,i);case"neon":return this.renderNeonGauge(e,t,i);case"digital":return this.renderDigitalGauge(e,t,i);case"basic":return this.renderBasicGauge(e,t,i);default:return this.renderModernGauge(e,t,i)}}renderModernGauge(e,t,i){const o=e.gauge_size||200,r=e.gauge_thickness||15,n=o/2,l=o/2,s=o/2-r-10,d=e.min_value||0,c=(t-d)/((e.max_value||100)-d)*100,u=Math.min(Math.max(c,0),100),p=-120,g=120,m=p+240*u/100,v=this.describeArc(n,l,s,p,g),h=this.describeArc(n,l,s,p,m),_=this.getColorAtValue(e,u,i);return a.JW`
      ${this.renderGradientDefs(e,n,l,s,p,g,m,u,i)}
      
      <!-- Background arc -->
      <path
        d="${v}"
        fill="none"
        stroke="${e.gauge_background_color||"var(--disabled-text-color)"}"
        stroke-width="${r}"
        stroke-linecap="butt"
      />

      <!-- Value arc -->
      ${"segments"===e.gauge_color_mode?this.renderSegmentedArcs(e,n,l,s,p,g,r,t,!0):"gradient"===e.gauge_color_mode?this.renderGradientValueArc(e,h,r,u,"round",`transition: stroke-dashoffset ${!1!==e.gauge_animation_enabled?e.gauge_animation_duration||"1000ms":"0ms"} ${e.gauge_animation_easing||"ease-out"};`,v,n,l,p,m,i):a.JW`
              <path
                d="${h}"
                fill="none"
                stroke="${_}"
                stroke-width="${r}"
                stroke-linecap="round"
                style="transition: stroke-dashoffset ${!1!==e.gauge_animation_enabled?e.gauge_animation_duration||"1000ms":"0ms"} ${e.gauge_animation_easing||"ease-out"};"
              />
            `}

      <!-- Tick marks -->
      ${!1!==e.show_ticks?this.renderTickMarks(e,n,l,s,p,g,r):""}

      <!-- Pointer -->
      ${!1!==e.pointer_enabled?this.renderPointer(e,n,l,s,m):""}

      <!-- Min/Max labels -->
      ${!1===e.show_min_max||e.show_tick_labels?"":this.renderMinMaxLabels(e,n,l,s,p,g)}
    `}renderBasicGauge(e,t,i){const o=e.gauge_size||200,r=e.gauge_thickness||15,n=o/2,l=o/2,s=o/2-r-10,d=e.min_value||0,c=(t-d)/((e.max_value||100)-d)*100,u=Math.min(Math.max(c,0),100),p=-120,g=120,m=p+240*u/100,v=this.describeArc(n,l,s,p,g),h=this.describeArc(n,l,s,p,m),_=this.getColorAtValue(e,u,i);return a.JW`
      ${this.renderGradientDefs(e,n,l,s,p,g,m,u,i)}
      
      <!-- Background arc -->
      <path
        d="${v}"
        fill="none"
        stroke="${e.gauge_background_color||"var(--disabled-text-color)"}"
        stroke-width="${r}"
        stroke-linecap="butt"
      />

      <!-- Value arc -->
      ${"segments"===e.gauge_color_mode?this.renderSegmentedArcs(e,n,l,s,p,g,r,t):"gradient"===e.gauge_color_mode?this.renderGradientValueArc(e,h,r,u,"butt",void 0,v,n,l,p,m,i):a.JW`
              <path
                d="${h}"
                fill="none"
                stroke="${_}"
                stroke-width="${r}"
                stroke-linecap="butt"
              />
            `}

      <!-- Tick marks -->
      ${!1!==e.show_ticks?this.renderTickMarks(e,n,l,s,p,g,r):""}

      <!-- Pointer -->
      ${!1!==e.pointer_enabled?this.renderPointer(e,n,l,s,m):""}

      <!-- Min/Max labels -->
      ${!1===e.show_min_max||e.show_tick_labels?"":this.renderMinMaxLabels(e,n,l,s,p,g)}
    `}renderSpeedometerGauge(e,t,i){const o=e.gauge_size||200,r=e.gauge_thickness||15,n=o/2,l=o/2,s=o/2-r-10,d=e.min_value||0,c=(t-d)/((e.max_value||100)-d)*100,u=Math.min(Math.max(c,0),100),p=-225,g=45,m=p+270*u/100,v=this.describeArc(n,l,s,p,g),h=this.describeArc(n,l,s,p,m),_=this.getColorAtValue(e,u,i),f=e.flip_horizontal||!1,b=a.JW`
      ${this.renderGradientDefs(e,n,l,s,p,g,void 0,void 0,i)}
      
      <!-- Background arc -->
      <path
        d="${v}"
        fill="none"
        stroke="${e.gauge_background_color||"var(--disabled-text-color)"}"
        stroke-width="${r}"
        stroke-linecap="butt"
      />

      <!-- Value arc -->
      ${"segments"===e.gauge_color_mode?this.renderSegmentedArcs(e,n,l,s,p,g,r,t):"gradient"===e.gauge_color_mode?this.renderGradientValueArc(e,h,r,u,"butt",void 0,v,n,l,p,m,i):a.JW`
              <path
                d="${h}"
                fill="none"
                stroke="${_}"
                stroke-width="${r}"
                stroke-linecap="butt"
              />
            `}

      ${!1!==e.show_ticks?this.renderTickMarksGraphics(e,n,l,s,p,g,r):""}
      ${!1!==e.pointer_enabled?this.renderPointer(e,n,l,s,m):""}
    `,$=a.JW`
      ${!1!==e.show_ticks&&e.show_tick_labels?this.renderTickLabels(e,n,l,s,p,g,r,f,o):""}
      ${!1===e.show_min_max||e.show_tick_labels?"":this.renderMinMaxLabels(e,n,l,s,p,g,f,o)}
    `;return f?a.JW`
        <g transform="scale(-1, 1) translate(-${o}, 0)">
          ${b}
        </g>
        ${$}
      `:a.JW`
      ${b}
      ${$}
    `}renderArcGauge(e,t,i){const o=e.gauge_size||200,r=e.gauge_thickness||15,n=o/2,l=o/2,s=o/2-r-10,d=e.min_value||0,c=(t-d)/((e.max_value||100)-d)*100,u=Math.min(Math.max(c,0),100),p=-180,g=p+180*u/100,m=this.describeArc(n,l,s,p,0),v=this.describeArc(n,l,s,p,g),h=this.getColorAtValue(e,u,i),_=e.flip_horizontal||!1,f=a.JW`
      ${this.renderGradientDefs(e,n,l,s,p,0,g,u,i)}
      
      <!-- Background arc -->
      <path
        d="${m}"
        fill="none"
        stroke="${e.gauge_background_color||"var(--disabled-text-color)"}"
        stroke-width="${r}"
        stroke-linecap="butt"
      />

      <!-- Value arc -->
      ${"segments"===e.gauge_color_mode?this.renderSegmentedArcs(e,n,l,s,p,0,r,t):"gradient"===e.gauge_color_mode?this.renderGradientValueArc(e,v,r,u,"butt",void 0,m,n,l,p,g,i):a.JW`
              <path
                d="${v}"
                fill="none"
                stroke="${h}"
                stroke-width="${r}"
                stroke-linecap="butt"
              />
            `}

      ${!1!==e.show_ticks?this.renderTickMarksGraphics(e,n,l,s,p,0,r):""}
      ${!1!==e.pointer_enabled?this.renderPointer(e,n,l,s,g):""}
    `,b=a.JW`
      ${!1!==e.show_ticks&&e.show_tick_labels?this.renderTickLabels(e,n,l,s,p,0,r,_,o):""}
      ${!1===e.show_min_max||e.show_tick_labels?"":this.renderMinMaxLabels(e,n,l,s,p,0,_,o)}
    `;return _?a.JW`
        <g transform="scale(-1, 1) translate(-${o}, 0)">
          ${f}
        </g>
        ${b}
      `:a.JW`
      ${f}
      ${b}
    `}renderRadialGauge(e,t,i){const o=e.gauge_size||200,r=e.gauge_thickness||15,n=o/2,l=o/2,s=o/2-r-10,d=e.min_value||0,c=(t-d)/((e.max_value||100)-d)*100,u=Math.min(Math.max(c,0),100),p=-90,g=p+360*u/100,m=this.describeArc(n,l,s,p,270),v=this.describeArc(n,l,s,p,g),h=this.getColorAtValue(e,u,i);return a.JW`
      ${this.renderGradientDefs(e,n,l,s,p,270,g,u,i)}
      
      <!-- Background circle -->
      <circle
        cx="${n}"
        cy="${l}"
        r="${s}"
        fill="none"
        stroke="${e.gauge_background_color||"var(--disabled-text-color)"}"
        stroke-width="${r}"
      />

      <!-- Value arc -->
      ${"segments"===e.gauge_color_mode?this.renderSegmentedArcs(e,n,l,s,p,270,r,t):"gradient"===e.gauge_color_mode?this.renderGradientValueArc(e,v,r,u,"butt",void 0,m,n,l,p,g,i):a.JW`
              <path
                d="${v}"
                fill="none"
                stroke="${h}"
                stroke-width="${r}"
                stroke-linecap="butt"
              />
            `}

      ${!1!==e.pointer_enabled?this.renderPointer(e,n,l,s,g):""}
    `}renderLinesGauge(e,t,i){const o=e.gauge_size||200,r=o/2,n=o/2,l=o/2-20,s=e.min_value||0,d=(t-s)/((e.max_value||100)-s)*100,c=Math.min(Math.max(d,0),100),u=e.tick_count||20,p=[];for(let t=0;t<=u;t++){const o=240*t/u-120,s=t/u*100;let d;d="segments"===e.gauge_color_mode||s<=c?this.getColorAtValue(e,s,i):e.gauge_background_color||"var(--disabled-text-color)";const g=l-15,m=l,v=this.polarToCartesian(r,n,g,o),h=this.polarToCartesian(r,n,m,o);p.push(a.JW`
        <line
          x1="${v.x}"
          y1="${v.y}"
          x2="${h.x}"
          y2="${h.y}"
          stroke="${d}"
          stroke-width="3"
          stroke-linecap="round"
        />
      `)}return a.JW`
      ${p}
      ${!1!==e.pointer_enabled?this.renderPointer(e,r,n,l-15,240*c/100-120):""}
    `}renderBlockGauge(e,t,i){const o=e.gauge_size||200,r=o/2,n=o/2,l=o/2-20,s=e.gauge_thickness||20,d=e.min_value||0,c=(t-d)/((e.max_value||100)-d)*100,u=Math.min(Math.max(c,0),100),p=e.tick_count||12,g=240/p,m=[];for(let t=0;t<p;t++){const o=t*g-120,d=o+g-2,c=t/p*100,v=(t+1)/p*100;let h;h="segments"===e.gauge_color_mode||u>=c?this.getColorAtValue(e,v,i):e.gauge_background_color||"var(--disabled-text-color)";const _=this.describeArc(r,n,l,o,d);m.push(a.JW`
        <path
          d="${_}"
          fill="none"
          stroke="${h}"
          stroke-width="${s}"
          stroke-linecap="butt"
        />
      `)}return a.JW`
      ${m}
      ${!1!==e.pointer_enabled?this.renderPointer(e,r,n,l,240*u/100-120):""}
    `}renderMinimalGauge(e,t,i){const o=e.gauge_size||200,r=e.gauge_thickness||8,n=o/2,l=o/2,s=o/2-r-10,d=e.min_value||0,c=(t-d)/((e.max_value||100)-d)*100,u=Math.min(Math.max(c,0),100),p=360*u/100-90,g=2*Math.PI*s,m=u/100*g,v=this.getColorAtValue(e,u,i);return a.JW`
      ${this.renderGradientDefs(e,n,l,s,-90,270,p,u,i)}
      
      <circle
        cx="${n}"
        cy="${l}"
        r="${s}"
        fill="none"
        stroke="${e.gauge_background_color||"var(--disabled-text-color)"}"
        stroke-width="${r}"
      />

      ${"segments"===e.gauge_color_mode?this.renderSegmentedCircle(e,n,l,s,r,t,!0):"gradient"===e.gauge_color_mode?(()=>{const t="value-based"===(e.gradient_display_mode||"full")?this.getColorAtValue(e,u,i):`url(#gradient-${e.id})`;return a.JW`
                  <circle
                    cx="${n}"
                    cy="${l}"
                    r="${s}"
                    fill="none"
                    stroke="${t}"
                    stroke-width="${r}"
                    stroke-linecap="round"
                    stroke-dasharray="${g}"
                    stroke-dashoffset="${g-m}"
                    transform="rotate(-90 ${n} ${l})"
                  />
                `})():a.JW`
            <circle
              cx="${n}"
              cy="${l}"
              r="${s}"
              fill="none"
              stroke="${v}"
              stroke-width="${r}"
              stroke-linecap="round"
              stroke-dasharray="${g}"
              stroke-dashoffset="${g-m}"
              transform="rotate(-90 ${n} ${l})"
            />
          `}
    `}renderInsetGauge(e,t,i){const o=e.gauge_size||200,r=e.gauge_thickness||15,n=o/2,l=o/2,s=o/2-r-10,d=e.min_value||0,c=(t-d)/((e.max_value||100)-d)*100,u=Math.min(Math.max(c,0),100),p=-120,g=120,m=p+240*u/100,v=s+r/4,h=s-r/4,_=this.describeArc(n,l,v,p,g),f=this.describeArc(n,l,h,p,g),b=this.describeArc(n,l,v,p,m),$=this.describeArc(n,l,h,p,m),x=this.getColorAtValue(e,u,i),y=e.gauge_background_color||"var(--disabled-text-color)";return a.JW`
      ${this.renderGradientDefs(e,n,l,v,p,g,m,u)}
      
      <defs>
        <filter id="inset-shadow-${e.id}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="0" dy="2" result="offsetblur" />
          <feFlood flood-color="rgba(0,0,0,0.3)" />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="3d-separator-shadow-${e.id}" x="-75%" y="-75%" width="250%" height="250%">
          <!-- CSS-like shadow: 0 0 6px 3px #000 for separator edge -->
          <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="spread" />
          <feGaussianBlur in="spread" stdDeviation="3" result="blur" />
          <feColorMatrix in="blur" type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
          </feMerge>
        </filter>
      </defs>
      
      <!-- Outer background arc -->
      <path
        d="${_}"
        fill="none"
        stroke="${y}"
        stroke-width="${r/2}"
        stroke-linecap="butt"
        filter="url(#inset-shadow-${e.id})"
      />
      
      <!-- Inner background arc -->
      <path
        d="${f}"
        fill="none"
        stroke="${y}"
        stroke-width="${r/2}"
        stroke-linecap="butt"
        opacity="0.7"
      />

      <!-- Value arcs -->
      ${"segments"===e.gauge_color_mode?a.JW`
              ${this.renderSegmentedArcsWithInsetStyle(e,n,l,v,p,g,r/2,t)}
              ${this.renderSegmentedArcsWithInsetStyle(e,n,l,h,p,g,r/2,t)}
            `:"gradient"===e.gauge_color_mode?(()=>{const t="value-based"===(e.gradient_display_mode||"full")?this.getColorAtValue(e,u,i):`url(#gradient-${e.id})`;return a.JW`
                  <!-- Outer value arc -->
                  <path
                    d="${b}"
                    fill="none"
                    stroke="${t}"
                    stroke-width="${r/2}"
                    stroke-linecap="butt"
                  />
                  
                  <!-- Inner value arc -->
                  <path
                    d="${$}"
                    fill="none"
                    stroke="${t}"
                    stroke-width="${r/2}"
                    stroke-linecap="butt"
                    opacity="0.8"
                  />
                `})():a.JW`
              <!-- Outer value arc -->
              <path
                d="${b}"
                fill="none"
                stroke="${x}"
                stroke-width="${r/2}"
                stroke-linecap="butt"
              />
              
              <!-- Inner value arc -->
              <path
                d="${$}"
                fill="none"
                stroke="${x}"
                stroke-width="${r/2}"
                stroke-linecap="butt"
                opacity="0.8"
              />
            `}

      <!-- Tick marks -->
      ${!1!==e.show_ticks?this.renderTickMarks(e,n,l,s,p,g,r):""}

      <!-- Pointer -->
      ${!1!==e.pointer_enabled?this.renderPointer(e,n,l,s,m):""}

      <!-- Min/Max labels -->
      ${!1===e.show_min_max||e.show_tick_labels?"":this.renderMinMaxLabels(e,n,l,s,p,g)}
    `}render3DGauge(e,t,i){const o=e.gauge_size||200,r=e.gauge_thickness||15,n=o/2,l=o/2,s=o/2-r-10,d=e.min_value||0,c=(t-d)/((e.max_value||100)-d)*100,u=Math.min(Math.max(c,0),100),p=-120,g=120,m=p+240*u/100,v=this.describeArc(n,l,s,p,g),h=this.describeArc(n,l,s,p,m),_=this.getColorAtValue(e,u,i),f=e.gauge_background_color||"var(--disabled-text-color)";return a.JW`
      ${this.renderGradientDefs(e,n,l,s,p,g,m,u,i)}
      
      <defs>
        <linearGradient id="3d-gradient-${e.id}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(255,255,255);stop-opacity:0.4" />
          <stop offset="50%" style="stop-color:rgb(255,255,255);stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0.3" />
        </linearGradient>
        <filter id="3d-shadow-${e.id}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="0" dy="4" result="offsetblur" />
          <feFlood flood-color="rgba(0,0,0,0.4)" />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="3d-box-shadow-${e.id}" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
          <feOffset dx="0" dy="6" result="offsetblur" />
          <feFlood flood-color="rgba(0,0,0,0.5)" />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="3d-segment-shadow-${e.id}" x="-75%" y="-75%" width="250%" height="250%">
          <!-- CSS-like shadow: 0 0 8px 4px #000 (no directional offset) -->
          <feMorphology in="SourceAlpha" operator="dilate" radius="4" result="spread" />
          <feGaussianBlur in="spread" stdDeviation="4" result="blur" />
          <feColorMatrix in="blur" type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.45 0" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background arc with 3D effect -->
      <path
        d="${v}"
        fill="none"
        stroke="${f}"
        stroke-width="${r+2}"
        stroke-linecap="butt"
        filter="url(#3d-shadow-${e.id})"
      />
      
      <path
        d="${v}"
        fill="none"
        stroke="url(#3d-gradient-${e.id})"
        stroke-width="${r}"
        stroke-linecap="butt"
      />

      <!-- Value arc with 3D effect -->
      ${"segments"===e.gauge_color_mode?this.renderSegmentedArcsWith3DStyle(e,n,l,s,p,g,r,t):"gradient"===e.gauge_color_mode?(()=>{const t="value-based"===(e.gradient_display_mode||"full")?this.getColorAtValue(e,u,i):`url(#gradient-${e.id})`;return a.JW`
                  <path
                    d="${h}"
                    fill="none"
                    stroke="${t}"
                    stroke-width="${r+2}"
                    stroke-linecap="butt"
                    filter="url(#3d-shadow-${e.id})"
                  />
                  <path
                    d="${h}"
                    fill="none"
                    stroke="${t}"
                    stroke-width="${r}"
                    stroke-linecap="butt"
                  />
                `})():a.JW`
              <path
                d="${h}"
                fill="none"
                stroke="${_}"
                stroke-width="${r+2}"
                stroke-linecap="butt"
                filter="url(#3d-shadow-${e.id})"
              />
              <path
                d="${h}"
                fill="none"
                stroke="${_}"
                stroke-width="${r}"
                stroke-linecap="butt"
              />
            `}

      <!-- Tick marks -->
      ${!1!==e.show_ticks?this.renderTickMarks(e,n,l,s,p,g,r):""}

      <!-- Pointer -->
      ${!1!==e.pointer_enabled?this.renderPointer(e,n,l,s,m):""}

      <!-- Min/Max labels -->
      ${!1===e.show_min_max||e.show_tick_labels?"":this.renderMinMaxLabels(e,n,l,s,p,g)}
    `}renderNeonGauge(e,t,i){const o=e.gauge_size||200,r=e.gauge_thickness||15,n=o/2,l=o/2,s=o/2-r-10,d=e.min_value||0,c=e.max_value||100,u=(t-d)/(c-d)*100,p=Math.min(Math.max(u,0),100),g=-120,m=120,v=g+240*p/100,h=this.describeArc(n,l,s,g,m),_=this.describeArc(n,l,s,g,v),f=this.getColorAtValue(e,p,i),b=e.gauge_background_color||"var(--disabled-text-color)",$=(()=>{const t=e.gauge_color_mode||"gradient";if("gradient"===t&&e.gradient_stops&&e.gradient_stops.length>0){const t=e.gradient_display_mode||"full";if("value-based"===t||"cropped"===t)return this.getColorAtValue(e,p,i);{const t=[...e.gradient_stops].sort(((e,t)=>t.position-e.position));if(t.length>0)return t[0].color}}else if("segments"===t&&e.segments)return this.getColorAtValue(e,p,i);return e.gauge_color||"var(--primary-color)"})();return a.JW`
      ${this.renderGradientDefs(e,n,l,s,g,m,v,p,i)}
      
      <defs>
        <filter id="neon-glow-${e.id}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="neon-background-${e.id}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1" result="softBlur"/>
          <feMerge> 
            <feMergeNode in="softBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="neon-glow-filter-${e.id}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="featheredGlow"/>
          <feMerge> 
            <feMergeNode in="featheredGlow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="light-shine-filter-${e.id}" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="softGlow"/>
          <feGaussianBlur stdDeviation="8" result="wideGlow"/>
          <feMerge> 
            <feMergeNode in="wideGlow"/>
            <feMergeNode in="softGlow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background arc with subtle glow -->
      <path
        d="${h}"
        fill="none"
        stroke="${b}"
        stroke-width="${r}"
        stroke-linecap="butt"
        filter="url(#neon-background-${e.id})"
        opacity="0.4"
      />

      <!-- Value arc with neon glow effect -->
      ${"segments"===e.gauge_color_mode?a.JW`
              <!-- Subtle glow behind entire filled section -->
              <path
                d="${_}"
                fill="none"
                stroke="${$}"
                stroke-width="${1.5*r}"
                stroke-linecap="butt"
                opacity="0.3"
                filter="url(#neon-glow-${e.id})"
              />
              
              ${this.renderSegmentedArcs(e,n,l,s,g,m,r,t)}
              ${this.renderNeonGlowAtEnd(e,n,l,s,g,m,r,t,$)}
            `:"gradient"===e.gauge_color_mode?(()=>{const o="value-based"===(e.gradient_display_mode||"full")?this.getColorAtValue(e,p,i):`url(#gradient-${e.id})`;return a.JW`
              <!-- Subtle glow behind entire arc -->
              <path
                d="${_}"
                fill="none"
                stroke="${$}"
                stroke-width="${1.5*r}"
                stroke-linecap="butt"
                opacity="0.3"
                filter="url(#neon-glow-${e.id})"
              />
              
              <!-- Main gradient arc -->
              <path
                d="${_}"
                fill="none"
                stroke="${o}"
                stroke-width="${r}"
                stroke-linecap="butt"
                style="transition: stroke-dashoffset ${!1!==e.gauge_animation_enabled?e.gauge_animation_duration||"1000ms":"0ms"} ${e.gauge_animation_easing||"ease-out"};"
              />
              ${this.renderNeonGlowAtEnd(e,n,l,s,g,m,r,t,$)}
            `})():a.JW`
              <!-- Subtle glow behind entire arc -->
              <path
                d="${_}"
                fill="none"
                stroke="${f}"
                stroke-width="${1.5*r}"
                stroke-linecap="butt"
                opacity="0.3"
                filter="url(#neon-glow-${e.id})"
              />
              
              <!-- Main solid color arc -->
              <path
                d="${_}"
                fill="none"
                stroke="${f}"
                stroke-width="${r}"
                stroke-linecap="butt"
                style="transition: stroke-dashoffset ${!1!==e.gauge_animation_enabled?e.gauge_animation_duration||"1000ms":"0ms"} ${e.gauge_animation_easing||"ease-out"};"
              />
              ${this.renderNeonGlowAtEnd(e,n,l,s,g,m,r,t,$)}
            `}

      <!-- Tick marks -->
      ${!1!==e.show_ticks?this.renderTickMarks(e,n,l,s,g,m,r):""}

      <!-- Pointer -->
      ${!1!==e.pointer_enabled?this.renderPointer(e,n,l,s,v):""}

      <!-- Min/Max labels -->
      ${!1===e.show_min_max||e.show_tick_labels?"":this.renderMinMaxLabels(e,n,l,s,g,m)}
    `}renderDigitalGauge(e,t,i){const o=e.gauge_size||200,r=o/2,n=o/2,l=o/2-30,s=e.min_value||0,d=(t-s)/((e.max_value||100)-s)*100,c=Math.min(Math.max(d,0),100),u=-90,p=u+180*c/100,g=12,m=[];for(let t=0;t<g;t++){const o=u+180*t/g,s=u+180*(t+1)/g,d=t/g*100,p=(t+1)/g*100,v=6,h=v+(t+1)/g*(18-v),_=l-h/2,f=(o+s)/2,b=this.polarToCartesian(r,n,_,f),$=this.polarToCartesian(r,n,_,o),x=this.polarToCartesian(r,n,_,s),y=.3*Math.sqrt(Math.pow(x.x-$.x,2)+Math.pow(x.y-$.y,2)),k=b.x,w=b.y,M=f;let S;S="segments"===e.gauge_color_mode||c>=d?this.getColorAtValue(e,p,i):e.gauge_background_color||"var(--disabled-text-color)",m.push(a.JW`
        <rect
          x="${k-y/2}"
          y="${w-h/2}"
          width="${y}"
          height="${h}"
          fill="${S}"
          transform="rotate(${M} ${k} ${w})"
          rx="2"
        />
      `)}return a.JW`
      ${this.renderGradientDefs(e,r,n,l,u,90,p,c,i)}
      
      <!-- Digital blocks -->
      ${m}

      <!-- Tick marks -->
      ${!1!==e.show_ticks?this.renderTickMarks(e,r,n,l,u,90):""}

      <!-- Pointer -->
      ${!1!==e.pointer_enabled?this.renderPointer(e,r,n,l,p):""}

      <!-- Min/Max labels -->
      ${!1===e.show_min_max||e.show_tick_labels?"":this.renderMinMaxLabels(e,r,n,l,u,90)}
    `}renderTickMarksGraphics(e,t,i,o,r,n,l){const s=e.tick_count||10,d=n-r,c=[];for(let n=0;n<=s;n++){const u=r+d*n/s,p=l||e.gauge_thickness||15,g=o-p/2+2,m=o+p/2-2,v=this.polarToCartesian(t,i,g,u),h=this.polarToCartesian(t,i,m,u);c.push(a.JW`
        <line
          x1="${v.x}"
          y1="${v.y}"
          x2="${h.x}"
          y2="${h.y}"
          stroke="${e.tick_color||"var(--divider-color)"}"
          stroke-width="2"
          stroke-linecap="round"
        />
      `)}return a.JW`${c}`}renderTickLabels(e,t,i,o,r,n,l,s,d){const c=e.tick_count||10,u=n-r,p=[],g=d||e.gauge_size||200;for(let n=0;n<=c;n++){const d=r+u*n/c,m=o+(l||e.gauge_thickness||15)/2-2+14;let v;if(s){const e=this.polarToCartesian(t,i,m,d);v={x:g-e.x,y:e.y}}else v=this.polarToCartesian(t,i,m,d);const h=e.min_value||0,_=e.max_value||100,f=Math.round(h+(_-h)*n/c),b=e.tick_label_font_size||10;p.push(a.JW`<text 
          x="${v.x}" 
          y="${v.y}" 
          fill="${e.min_max_color||"var(--secondary-text-color)"}" 
          font-size="${b}" 
          text-anchor="middle" 
          dominant-baseline="middle"
        >${f}</text>`)}return a.JW`${p}`}renderTickMarks(e,t,i,o,r,n,l){const s=e.tick_count||10,d=n-r,c=[];for(let n=0;n<=s;n++){const u=r+d*n/s,p=l||e.gauge_thickness||15,g=o-p/2+2,m=o+p/2-2,v=this.polarToCartesian(t,i,g,u),h=this.polarToCartesian(t,i,m,u);if(c.push(a.JW`
        <line
          x1="${v.x}"
          y1="${v.y}"
          x2="${h.x}"
          y2="${h.y}"
          stroke="${e.tick_color||"var(--divider-color)"}"
          stroke-width="2"
          stroke-linecap="round"
        />
      `),e.show_tick_labels){const o=m+14,r=this.polarToCartesian(t,i,o,u),l=e.min_value||0,d=e.max_value||100,p=Math.round(l+(d-l)*n/s),g=e.tick_label_font_size||10;c.push(a.JW`<text x="${r.x}" y="${r.y}" fill="${e.min_max_color||"var(--secondary-text-color)"}" font-size="${g}" text-anchor="middle" dominant-baseline="middle">${p}</text>`)}}return a.JW`${c}`}renderPointer(e,t,i,o,r){const n=e.pointer_style||"needle",l=(e.pointer_length||80)/100*o,s=e.pointer_width||4,d=e.pointer_color||"var(--primary-color)",c=this.polarToCartesian(t,i,l,r);if("needle"===n){const e=2*s,o=r-90,n=r+90,l=this.polarToCartesian(t,i,e/2,o),u=this.polarToCartesian(t,i,e/2,n);return a.JW`
        <polygon
          points="${l.x},${l.y} ${u.x},${u.y} ${c.x},${c.y}"
          fill="${d}"
        />
        <circle cx="${t}" cy="${i}" r="${e}" fill="${d}" />
      `}if("triangle"===n){const e=3*s,o=r-90,n=r+90,l=this.polarToCartesian(t,i,e,o),u=this.polarToCartesian(t,i,e,n);return a.JW`
        <polygon
          points="${l.x},${l.y} ${u.x},${u.y} ${c.x},${c.y}"
          fill="${d}"
        />
      `}if("arrow"===n){const e=.2*l,o=this.polarToCartesian(c.x,c.y,e,r-150),n=this.polarToCartesian(c.x,c.y,e,r+150);return a.JW`
        <line
          x1="${t}"
          y1="${i}"
          x2="${c.x}"
          y2="${c.y}"
          stroke="${d}"
          stroke-width="${s}"
          stroke-linecap="round"
        />
        <line
          x1="${c.x}"
          y1="${c.y}"
          x2="${o.x}"
          y2="${o.y}"
          stroke="${d}"
          stroke-width="${s}"
          stroke-linecap="round"
        />
        <line
          x1="${c.x}"
          y1="${c.y}"
          x2="${n.x}"
          y2="${n.y}"
          stroke="${d}"
          stroke-width="${s}"
          stroke-linecap="round"
        />
      `}if("circle"===n)return a.JW`
        <line
          x1="${t}"
          y1="${i}"
          x2="${c.x}"
          y2="${c.y}"
          stroke="${d}"
          stroke-width="${s/2}"
          stroke-linecap="round"
        />
        <circle
          cx="${c.x}"
          cy="${c.y}"
          r="${2*s}"
          fill="${d}"
        />
      `;if("highlight"===n){const n=e.gauge_thickness||15,l=6,s=r-l/2,c=r+l/2,u=this.describeArc(t,i,o,s,c);return this.polarToCartesian(t,i,o,r),a.JW`
        <path d="${u}" fill="none" stroke="${d}" stroke-width="${n}" stroke-linecap="round" />
      `}if("cap"===n){const n=e.gauge_thickness||15,l=this.polarToCartesian(t,i,o,r);return a.JW`
        <circle cx="${l.x}" cy="${l.y}" r="${n/2}" fill="${d}" />
      `}if("icon"===n){const n=e.pointer_icon||"mdi:gauge",l=e.pointer_icon_color||"#FFFFFF",s=e.pointer_icon_size||24,d=this.polarToCartesian(t,i,o,r),c=s+8;return a.JW`
        <foreignObject
          x="${d.x-c/2}"
          y="${d.y-c/2}"
          width="${c}"
          height="${c}"
          style="overflow: visible;"
        >
          <div style="
            width: ${c}px;
            height: ${c}px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: visible;
            box-sizing: border-box;
            position: relative;
          ">
            <ha-icon
              icon="${n}"
              style="
                --mdc-icon-size: ${s}px;
                width: ${s}px;
                height: ${s}px;
                color: ${l};
                display: block;
                box-sizing: border-box;
                margin: 0;
                padding: 0;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                line-height: 1;
              "
            ></ha-icon>
          </div>
        </foreignObject>
      `}return a.JW`
      <line
        x1="${t}"
        y1="${i}"
        x2="${c.x}"
        y2="${c.y}"
        stroke="${d}"
        stroke-width="${s}"
        stroke-linecap="round"
      />
    `}renderMinMaxLabels(e,t,i,o,r,n,l,s){const d=o+20,c=s||e.gauge_size||200,u=this.polarToCartesian(t,i,d,r),p=this.polarToCartesian(t,i,d,n),g=e.min_max_font_size||12,m=e.min_max_color||"var(--secondary-text-color)";let v,h;return l?(v={x:c-u.x,y:u.y},h={x:c-p.x,y:p.y}):(v=u,h=p),a.JW`
      <text
        x="${v.x}"
        y="${v.y}"
        fill="${m}"
        font-size="${g}"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        ${e.min_value||0}
      </text>
      <text
        x="${h.x}"
        y="${h.y}"
        fill="${m}"
        font-size="${g}"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        ${e.max_value||100}
      </text>
    `}getColorAtValue(e,t,i){var a;if(e.unified_template_mode&&e.unified_template&&i){this._templateService||(this._templateService=new d.I(i)),i.__uvc_template_strings||(i.__uvc_template_strings={});const t=this._hashString(e.unified_template),o=`unified_gauge_${e.id}_${t}`,r=null===(a=i.__uvc_template_strings)||void 0===a?void 0:a[o];if(r&&""!==String(r).trim()){const e=(0,c.cv)(r);if(!(0,c.HD)(e)&&e.gauge_color)return e.gauge_color}}const o=e.gauge_color_mode||"gradient";if("solid"===o)return e.gauge_color||"var(--primary-color)";if("segments"===o&&e.segments&&e.segments.length>0){const i=e.min_value||0,a=i+((e.max_value||100)-i)*t/100;for(const t of e.segments)if(a>=t.from&&a<=t.to)return t.color}if("gradient"===o&&e.gradient_stops&&e.gradient_stops.length>0){const i=[...e.gradient_stops].sort(((e,t)=>e.position-t.position));if(t<=i[0].position)return i[0].color;if(t>=i[i.length-1].position)return i[i.length-1].color;for(let e=0;e<i.length-1;e++){const a=i[e],o=i[e+1];if(t>=a.position&&t<=o.position){const e=o.position-a.position,i=(t-a.position)/e;return this.interpolateColor(a.color,o.color,i)}}}return e.gauge_color||"var(--primary-color)"}interpolateColor(e,t,i){const a=this.hexToRgb(e),o=this.hexToRgb(t);if(!a||!o)return e;const r=Math.round(a.r+(o.r-a.r)*i),n=Math.round(a.g+(o.g-a.g)*i),l=Math.round(a.b+(o.b-a.b)*i);return this.rgbToHex(r,n,l)}hexToRgb(e){if(e.startsWith("var(")||e.startsWith("rgb"))return null;const t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?{r:parseInt(t[1],16),g:parseInt(t[2],16),b:parseInt(t[3],16)}:null}rgbToHex(e,t,i){return"#"+[e,t,i].map((e=>e.toString(16).padStart(2,"0"))).join("")}renderSegmentedArcs(e,t,i,o,r,n,l,s,d=!1){if(!e.segments||0===e.segments.length)return a.JW``;const c=e.min_value||0,u=e.max_value||100,p=n-r,g=[],m=[...e.segments].sort(((e,t)=>e.from-t.from));for(const e of m){const n=r+p*((e.from-c)/(u-c)*100)/100,s=r+p*((e.to-c)/(u-c)*100)/100;if(s>n){const r=this.describeArc(t,i,o,n,s);g.push(a.JW`
          <path
            d="${r}"
            fill="none"
            stroke="${e.color}"
            stroke-width="${l}"
            stroke-linecap="${d?"round":"butt"}"
          />
        `)}}return a.JW`${g}`}renderSegmentedArcsWithInsetStyle(e,t,i,o,r,n,l,s){if(!e.segments||0===e.segments.length)return a.JW``;const d=e.min_value||0,c=e.max_value||100,u=n-r,p=[],g=[...e.segments].sort(((e,t)=>e.from-t.from));for(const n of g){const s=r+u*((n.from-d)/(c-d)*100)/100,g=r+u*((n.to-d)/(c-d)*100)/100;if(g>s){const r=this.describeArc(t,i,o,s,g);p.push(a.JW`
          <!-- Shadow layer -->
          <path
            d="${r}"
            fill="none"
            stroke="${n.color}"
            stroke-width="${l+2}"
            stroke-linecap="butt"
            filter="url(#inset-shadow-${e.id})"
          />
          <!-- Main segment -->
          <path
            d="${r}"
            fill="none"
            stroke="${n.color}"
            stroke-width="${l}"
            stroke-linecap="butt"
          />
        `)}}return a.JW`${p}`}renderSegmentedArcsWith3DStyle(e,t,i,o,r,n,l,s){if(!e.segments||0===e.segments.length)return a.JW``;const d=e.min_value||0,c=e.max_value||100,u=n-r,p=[],g=[...e.segments].sort(((e,t)=>e.from-t.from));for(let n=0;n<g.length;n++){const s=g[n],m=r+u*((s.from-d)/(c-d)*100)/100,v=r+u*((s.to-d)/(c-d)*100)/100;if(v>m){const n=this.describeArc(t,i,o,m,v),d=Math.max(m-.5,r),c=this.describeArc(t,i,o,d,m);p.push(a.JW`
          <path
            d="${c}"
            fill="none"
            stroke="rgba(0,0,0,0.15)"
            stroke-width="${l}"
            stroke-linecap="butt"
            filter="url(#3d-separator-shadow-${e.id})"
          />
          <!-- Main segment with its own shadow for depth -->
          <path
            d="${n}"
            fill="none"
            stroke="${s.color}"
            stroke-width="${l}"
            stroke-linecap="butt"
            filter="url(#3d-segment-shadow-${e.id})"
          />
        `)}}return a.JW`${p}`}renderNeonGlowAtEnd(e,t,i,o,r,n,l,s,d){const c=e.min_value||0,u=(s-c)/((e.max_value||100)-c)*100,p=Math.min(Math.max(u,0),100);if(p<=0)return a.JW``;const g=r+(n-r)*p/100,m=this.polarToCartesian(t,i,o,g),v=`neon-glow-radial-${e.id}-${Date.now()}`;return a.JW`
      <defs>
        <radialGradient id="${v}">
          <stop offset="0%" stop-color="${d}" stop-opacity="1" />
          <stop offset="30%" stop-color="${d}" stop-opacity="0.8" />
          <stop offset="50%" stop-color="${d}" stop-opacity="0.4" />
          <stop offset="70%" stop-color="${d}" stop-opacity="0.15" />
          <stop offset="100%" stop-color="${d}" stop-opacity="0" />
        </radialGradient>
      </defs>
      
      <!-- Outer soft glow halo -->
      <circle
        cx="${m.x}"
        cy="${m.y}"
        r="${2*l}"
        fill="url(#${v})"
        opacity="0.6"
      />
      
      <!-- Middle glow layer -->
      <circle
        cx="${m.x}"
        cy="${m.y}"
        r="${1.2*l}"
        fill="url(#${v})"
        opacity="0.8"
      />
      
      <!-- Bright inner core -->
      <circle
        cx="${m.x}"
        cy="${m.y}"
        r="${.5*l}"
        fill="${d}"
        opacity="1"
        style="filter: brightness(1.5);"
      />
    `}renderGradientDefs(e,t,i,o,r,n,l,s,d){if("gradient"!==e.gauge_color_mode||!e.gradient_stops||0===e.gradient_stops.length)return a.JW``;const c=e.gradient_display_mode||"full",u=[...e.gradient_stops].sort(((e,t)=>e.position-t.position)),p=`gradient-${e.id}`;if(void 0!==t&&void 0!==i&&void 0!==o&&void 0!==r&&void 0!==n){let g=r,m=n,v=u;if("cropped"===c&&void 0!==l&&void 0!==s){m=l;const t=u.filter((e=>e.position<=s)),i=this.getColorAtValue(e,s,d);t.some((e=>e.position===s))||t.push({id:`cropped_${s}`,position:s,color:i}),v=t.map((e=>Object.assign(Object.assign({},e),{position:s>0?e.position/s*100:0}))).sort(((e,t)=>e.position-t.position))}else if("value-based"===c)return a.JW``;const h=this.polarToCartesian(t,i,o,g),_=this.polarToCartesian(t,i,o,m);return a.JW`
        <defs>
          <linearGradient
            id="${p}"
            x1="${h.x}"
            y1="${h.y}"
            x2="${_.x}"
            y2="${_.y}"
            gradientUnits="userSpaceOnUse"
          >
            ${v.map((e=>a.JW`
              <stop offset="${e.position}%" stop-color="${e.color}" />
            `))}
          </linearGradient>
        </defs>
      `}return a.JW`
      <defs>
        <linearGradient id="${p}" x1="0%" y1="0%" x2="100%" y2="0%">
          ${u.map((e=>a.JW`
            <stop offset="${e.position}%" stop-color="${e.color}" />
          `))}
        </linearGradient>
      </defs>
    `}renderGradientValueArc(e,t,i,o,r="butt",n,l,s,d,c,u,p){if("gradient"!==e.gauge_color_mode)return a.JW``;const g=e.gradient_display_mode||"full";if("full"===g)return a.JW`
        <path
          d="${t}"
          fill="none"
          stroke="url(#gradient-${e.id})"
          stroke-width="${i}"
          stroke-linecap="${r}"
          ${n?`style="${n}"`:""}
        />
      `;const m="value-based"===g?this.getColorAtValue(e,o,p):`url(#gradient-${e.id})`;return a.JW`
      <path
        d="${t}"
        fill="none"
        stroke="${m}"
        stroke-width="${i}"
        stroke-linecap="${r}"
        ${n?`style="${n}"`:""}
      />
    `}renderSegmentedCircle(e,t,i,o,r,n,l=!1){if(!e.segments||0===e.segments.length)return a.JW``;const s=e.min_value||0,d=e.max_value||100,c=2*Math.PI*o,u=[],p=[...e.segments].sort(((e,t)=>e.from-t.from));for(const e of p){const p=(e.from-s)/(d-s)*100,g=(e.to-s)/(d-s)*100;if(l){if(g>p){const n=(g-p)/100*c,l=c-p/100*c-n;u.push(a.JW`
            <circle
              cx="${t}"
              cy="${i}"
              r="${o}"
              fill="none"
              stroke="${e.color}"
              stroke-width="${r}"
              stroke-linecap="round"
              stroke-dasharray="${n} ${c-n}"
              stroke-dashoffset="${l}"
              transform="rotate(-90 ${t} ${i})"
            />
          `)}}else{const l=(n-s)/(d-s)*100;if(p<=l){const n=Math.min(g,l);if(n>p){const l=(n-p)/100*c,s=c-p/100*c-l;u.push(a.JW`
              <circle
                cx="${t}"
                cy="${i}"
                r="${o}"
                fill="none"
                stroke="${e.color}"
                stroke-width="${r}"
                stroke-linecap="butt"
                stroke-dasharray="${l} ${c-l}"
                stroke-dashoffset="${s}"
                transform="rotate(-90 ${t} ${i})"
              />
            `)}}}}return a.JW`${u}`}describeArc(e,t,i,a,o){const r=this.polarToCartesian(e,t,i,o),n=this.polarToCartesian(e,t,i,a),l=o-a<=180?"0":"1";return["M",r.x,r.y,"A",i,i,0,l,0,n.x,n.y].join(" ")}polarToCartesian(e,t,i,a){const o=(a-90)*Math.PI/180;return{x:e+i*Math.cos(o),y:t+i*Math.sin(o)}}getSvgViewBox(e){const t=e.gauge_size||200,i=e.gauge_style||"modern",a=e.gauge_thickness||15,o=t/2,r=t/2-a-10,n=!1!==e.show_min_max||e.show_tick_labels;if(["radial","minimal"].includes(i))return`0 0 ${t} ${t}`;if("digital"===i)return`0 0 ${t} ${t}`;let l,s;"arc"===i?(l=-180,s=0):"speedometer"===i?(l=-225,s=45):(l=-120,s=120);const d=r+a/2+(n?25:5),c=(l-90)*Math.PI/180,u=(s-90)*Math.PI/180,p=o-d,g=o+d*Math.sin(c),m=o+d*Math.sin(u),v=Math.max(g,m,o),h=Math.max(0,p-5);return`0 ${h} ${t} ${v-h+5}`}getSvgHeight(e){const t=e.gauge_size||200,i=e.gauge_style||"modern",a=e.gauge_thickness||15,o=t/2,r=t/2-a-10,n=!1!==e.show_min_max||e.show_tick_labels;if(["radial","minimal"].includes(i))return t;if("digital"===i)return t;let l,s;"arc"===i?(l=-180,s=0):"speedometer"===i?(l=-225,s=45):(l=-120,s=120);const d=r+a/2+(n?25:5),c=(l-90)*Math.PI/180,u=(s-90)*Math.PI/180,p=o-d,g=o+d*Math.sin(c),m=o+d*Math.sin(u);return Math.max(g,m,o)-Math.max(0,p-5)+5}getGaugeViewBox(e){const t=e.gauge_size||200;if(!1!==e.show_min_max||e.show_tick_labels){const e=35;return`-${e} -${e} ${t+2*e} ${t+2*e}`}return`0 0 ${t} ${t}`}getContainerStyles(e){return["display: flex","flex-direction: column","align-items: center","justify-content: center","width: 100%","overflow: visible","padding: 20px 0"].join("; ")}getNameStyles(e){const t=[`font-size: ${e.name_font_size||16}px`,`color: ${e.name_color||"var(--secondary-text-color)"}`,"font-weight: "+(e.name_bold?"bold":"normal"),"font-style: "+(e.name_italic?"italic":"normal"),"text-transform: "+(e.name_uppercase?"uppercase":"none"),"text-align: center"],i=[];e.name_underline&&i.push("underline"),e.name_strikethrough&&i.push("line-through"),i.length>0&&t.push(`text-decoration: ${i.join(" ")}`);const a=e.name_x_offset||0,o=e.name_y_offset||0;return"top"===e.name_position?(t.push("margin-top: 0"),t.push("margin-bottom: 8px"),t.push(`transform: translateX(${a}px) translateY(${o}px)`)):"bottom"===e.name_position?(t.push("margin-top: 8px"),t.push("margin-bottom: 0"),t.push(`transform: translateX(${a}px) translateY(${o}px)`)):(t.push("margin: 8px 0"),t.push(`transform: translateX(${a}px) translateY(${o}px)`)),t.join("; ")}getValueStyles(e){const t=[`font-size: ${e.value_font_size||24}px`,`color: ${e.value_color||"var(--primary-text-color)"}`,"font-weight: "+(e.value_bold?"bold":"normal"),"font-style: "+(e.value_italic?"italic":"normal"),"text-transform: "+(e.value_uppercase?"uppercase":"none"),"text-align: center"],i=[];e.value_underline&&i.push("underline"),e.value_strikethrough&&i.push("line-through"),i.length>0&&t.push(`text-decoration: ${i.join(" ")}`);const a=e.gauge_size||200,o=e.value_x_offset||0,r=e.value_y_offset||0;if("center"===e.value_position)t.push("position: absolute"),t.push("top: calc(50% - 15px)"),t.push("left: 50%"),t.push(`transform: translate(calc(-50% + ${o}px), calc(-50% + ${r}px))`);else if("top"===e.value_position){let i=16;"minimal"===e.gauge_style&&(i=a/2-20),t.push("position: absolute"),t.push(`top: ${i-32+r}px`),t.push(`left: ${50+o}%`),t.push("transform: translateX(-50%)"),t.push("z-index: 1")}else"bottom"===e.value_position&&(t.push("display: block"),t.push("width: 100%"),t.push("margin-top: -24px"),0===o&&0===r||t.push(`transform: translate(${o}px, ${r}px)`));return t.join("; ")}validate(e){const t=e,i=[...super.validate(e).errors];return void 0!==t.min_value&&void 0!==t.max_value&&t.min_value>=t.max_value&&i.push("Minimum value must be less than maximum value"),t.entity&&""!==t.entity.trim()&&("attribute"===t.value_type&&(t.value_attribute_entity&&t.value_attribute_name||i.push("Attribute entity and attribute name are required when using attribute value type")),"template"===t.value_type&&(t.value_template&&""!==t.value_template.trim()||i.push("Template is required when using template value type"))),{valid:0===i.length,errors:i}}getStyles(){return"\n      .uc-gauge-container {\n        position: relative;\n        width: 100%;\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n      }\n      \n      .uc-gauge-wrapper {\n        position: relative;\n        display: inline-block;\n      }\n      \n      .uc-gauge-svg {\n        display: block;\n      }\n      \n      .uc-gauge-value-center {\n        pointer-events: none;\n      }\n      \n      .uc-gauge-value-bottom,\n      .uc-gauge-name {\n        width: 100%;\n        text-align: center;\n      }\n      \n      .uc-gauge-clickable {\n        cursor: pointer;\n      }\n    "}addPixelUnit(e){if(!e&&0!==e)return e;const t=String(e);return/^\d+$/.test(t)?`${t}px`:/^[\d\s]+$/.test(t)?t.split(" ").map((e=>e.trim()?`${e}px`:e)).join(" "):t}_hashString(e){let t=0;for(let i=0;i<e.length;i+=1)t=(t<<5)-t+e.charCodeAt(i),t|=0;return Math.abs(t)}}}}]);