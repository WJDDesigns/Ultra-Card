"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[4777],{4777:(e,t,o)=>{o.r(t),o.d(t,{UltraEnergyDisplayModule:()=>y});var i=o(5183),r=o(7475),n=o(5147),a=o(8938),s=o(378),d=o(6478);o(7921);const l={solar:"#f59e0b",grid:"#3b82f6",battery:"#22c55e",home:"#06b6d4",device:"#8b5cf6"},c={solar:"mdi:solar-power",grid:"mdi:transmission-tower",battery:"mdi:battery",home:"mdi:home",device:"mdi:flash"},h={solar:"Solar",grid:"Grid",battery:"Battery",home:"Home",device:"Device"};function p(e,t){return{id:t(`energy_${e}`),node_type:e,entity:"",label:h[e],icon:c[e],color:l[e],show_arrow:!0,enabled:!0}}class y extends r.m{constructor(){super(...arguments),this._draggedDevice=null,this._expandedCoreSections=new Set,this._expandedDeviceIds=new Set,this.metadata={type:"energy_display",title:"Energy Display",description:"Visualize energy flow between grid, solar, battery, home and devices",author:"WJD Designs",version:"1.0.0",icon:"mdi:lightning-bolt",category:"data",tags:["pro","premium","energy","solar","grid","battery","power","flow","sankey"]}}createDefault(e,t){const o=e=>this.generateId(e);return{id:e||this.generateId("energy_display"),type:"energy_display",display_style:"circle_flow",nodes:[p("solar",o),p("grid",o),p("battery",o),p("home",o)],show_self_sufficiency:!0,animation_speed:"normal",flow_line_width:2,show_values:!0,unit_display:"auto",show_labels:!0,show_icons:!0,circle_size:48,node_spacing:24,box_border_width:2,box_border_radius:12,gauge_size:80,sankey_width:400,sankey_curve_factor:.5,sankey_column_spacing:16,tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}validate(e){const t=e,o=[...super.validate(e).errors];return t.nodes&&Array.isArray(t.nodes)||o.push("At least one energy node is required"),{valid:0===o.length,errors:o}}getStyles(){return'\n      .energy-display-preview-wrapper {\n        display: block;\n      }\n      .energy-display-module {\n        position: relative;\n      }\n      .energy-display-module .energy-flow-dot {\n        offset-path: var(--flow-path);\n        offset-distance: 0%;\n        animation: energy-flow-dot var(--flow-duration) linear infinite;\n        will-change: offset-distance;\n      }\n      .energy-display-module .energy-flow-dot[style*="0s"] {\n        animation: none;\n        will-change: auto;\n      }\n      @keyframes energy-flow-dot {\n        to { offset-distance: 100%; }\n      }\n      .energy-display-module .node-value {\n        transition: opacity 0.5s ease, transform 0.3s ease;\n      }\n      .energy-display-module foreignObject {\n        pointer-events: none;\n      }\n      .energy-display-module foreignObject * {\n        pointer-events: auto;\n      }\n      .energy-display-module .energy-node circle {\n        transition: stroke-width 0.2s ease, filter 0.2s ease;\n      }\n      .energy-display-module .energy-node:hover circle {\n        filter: brightness(1.05);\n      }\n      /* Only max-width so explicit height on SVG is preserved (dashboard flex can collapse height: auto) */\n      .energy-display-module svg {\n        max-width: 100%;\n      }\n      .energy-display-module.energy-circle-flow svg,\n      .energy-display-module.energy-sankey svg {\n        min-height: 200px;\n      }\n    '}renderGeneralTab(e,t,o,i){var r,n,a;const d=e,l=(null===(r=null==t?void 0:t.locale)||void 0===r?void 0:r.language)||"en",c=s.x.checkIntegrationAuth(t);return"pro"===(null===(n=null==c?void 0:c.subscription)||void 0===n?void 0:n.tier)&&"active"===(null===(a=null==c?void 0:c.subscription)||void 0===a?void 0:a.status)?this._renderEditorContent(d,t,o,i):this._renderProLockUI(l)}_renderProLockUI(e){return i.qy`
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
          ${(0,d.kg)("editor.pro.feature_locked",e,"Pro Feature")}
        </div>
        <div
          style="font-size: 14px; color: var(--secondary-text-color); margin-bottom: 16px; max-width: 300px;"
        >
          ${(0,d.kg)("editor.energy_display.pro_description",e,"Energy Display is a Pro feature. Visualize energy flow between grid, solar, battery, home and devices with Circle Flow, Box Flow, or Sankey styles.")}
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
          ${(0,d.kg)("editor.pro.upgrade_button",e,"Upgrade to Pro")}
        </a>
      </div>
    `}_getCoreNodes(e){const t=e.nodes||[],o=["solar","grid","battery","home"],i=[];for(const e of o){const o=t.find((t=>t.node_type===e));i.push(o||{id:this.generateId(`energy_${e}`),node_type:e,entity:"",label:h[e],icon:c[e],color:l[e],show_arrow:!0,enabled:!0})}return i}_getDeviceNodes(e){return(e.nodes||[]).filter((e=>"device"===e.node_type))}_setNodes(e,t,o,i){t({nodes:[...o,...i]})}_updateCoreNode(e,t,o,i){const r=this._getCoreNodes(e),n=this._getDeviceNodes(e),a=r.findIndex((e=>e.node_type===t));-1!==a&&(r[a]=Object.assign(Object.assign({},r[a]),o),this._setNodes(e,i,r,n))}_updateDeviceAtIndex(e,t,o,i){const r=this._getCoreNodes(e),n=this._getDeviceNodes(e);t<0||t>=n.length||(n[t]=Object.assign(Object.assign({},n[t]),o),this._setNodes(e,i,r,n))}_addDevice(e,t){const o=this._getCoreNodes(e),i=this._getDeviceNodes(e),r={id:this.generateId("energy_device"),node_type:"device",entity:"",label:"Device",icon:c.device,color:l.device,show_arrow:!0,enabled:!0};this._expandedDeviceIds.add(r.id),this._setNodes(e,t,o,[...i,r])}_deleteDevice(e,t,o){const i=this._getCoreNodes(e),r=this._getDeviceNodes(e),n=r[t];n&&this._expandedDeviceIds.delete(n.id);const a=r.filter(((e,o)=>o!==t));this._setNodes(e,o,i,a)}_reorderDevices(e,t,o,i){const r=this._getCoreNodes(e);let n=[...this._getDeviceNodes(e)];const[a]=n.splice(t,1);n.splice(o,0,a),this._setNodes(e,i,r,n)}_toggleCoreSection(e){this._expandedCoreSections.has(e)?this._expandedCoreSections.delete(e):this._expandedCoreSections.add(e),window.dispatchEvent(new CustomEvent("ultra-card-module-update"))}_toggleDeviceExpand(e){this._expandedDeviceIds.has(e)?this._expandedDeviceIds.delete(e):this._expandedDeviceIds.add(e),window.dispatchEvent(new CustomEvent("ultra-card-module-update"))}_onDeviceDragStart(e,t){this._draggedDevice=t,e.dataTransfer&&(e.dataTransfer.effectAllowed="move")}_onDeviceDragEnd(){this._draggedDevice=null,window.dispatchEvent(new CustomEvent("ultra-card-module-update"))}_onDeviceDrop(e,t,o,i){if(e.preventDefault(),!this._draggedDevice)return;const r=this._getDeviceNodes(o).findIndex((e=>e.id===this._draggedDevice.id));-1!==r&&r!==t&&(this._reorderDevices(o,r,t,i),this._draggedDevice=null)}_renderEditorContent(e,t,o,n){var a,s,d,p,y,u,v,g,$,_;null===(a=null==t?void 0:t.locale)||void 0===a||a.language;const x=this._getCoreNodes(e),f=this._getDeviceNodes(e),m=e.display_style||"circle_flow";return i.qy`
      <style>
        ${this.injectUcFormStyles()} ${r.m.getSliderStyles()}
        .settings-section {
          background: var(--secondary-background-color);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--primary-color);
          margin-bottom: 16px;
        }
        .style-picker {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .style-option {
          padding: 12px;
          border: 2px solid var(--divider-color);
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s ease;
        }
        .style-option:hover { border-color: var(--primary-color); opacity: 0.9; }
        .style-option.selected { border-color: var(--primary-color); background: rgba(var(--rgb-primary-color), 0.08); }
        .style-option ha-icon { --mdi-icon-size: 28px; color: var(--primary-color); }
        .core-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: var(--card-background-color);
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          border: 1px solid var(--divider-color);
        }
        .core-section-header:hover { background: var(--primary-color); opacity: 0.9; }
        .core-section-header ha-icon.expand-icon { transition: transform 0.2s ease; }
        .core-section-header ha-icon.expand-icon.expanded { transform: rotate(180deg); }
        .entity-row {
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
        .entity-row.dragging { opacity: 0.5; transform: scale(0.95); }
        .entity-row .drag-handle { cursor: grab; color: var(--secondary-text-color); flex-shrink: 0; }
        .entity-row .expand-icon { cursor: pointer; flex-shrink: 0; }
        .entity-row .expand-icon.expanded { transform: rotate(180deg); }
        .entity-row .delete-icon { cursor: pointer; color: var(--error-color); flex-shrink: 0; }
        .entity-settings { padding: 16px; background: rgba(var(--rgb-primary-color), 0.05); border-left: 3px solid var(--primary-color); border-radius: 0 8px 8px 0; margin-bottom: 8px; }
        .add-entity-btn {
          width: 100%; padding: 12px; background: var(--primary-color); color: var(--text-primary-color); border: none; border-radius: 8px;
          cursor: pointer; font-size: 14px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
      </style>

      <!-- Section 1: Display Style -->
      <div class="settings-section">
        <div class="section-title">Display Style</div>
        <div class="style-picker">
          ${["circle_flow","box_flow","sankey"].map((e=>i.qy`
              <div
                class="style-option ${m===e?"selected":""}"
                @click=${()=>n({display_style:e})}
              >
                <ha-icon icon=${"circle_flow"===e?"mdi:circle-double":"box_flow"===e?"mdi:view-grid":"mdi:chart-sankey"}></ha-icon>
                <div style="font-size: 13px; margin-top: 6px;">${"circle_flow"===e?"Circle Flow":"box_flow"===e?"Box Flow":"Sankey"}</div>
              </div>
            `))}
        </div>
      </div>

      <!-- Section 2: Core Energy Nodes -->
      <div class="settings-section">
        <div class="section-title">Core Energy Nodes</div>
        <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;">
          Configure Solar, Grid, Battery, and Home. Use power sensor entities (W).
        </div>
        ${x.map((r=>{const a=this._expandedCoreSections.has(r.node_type);return i.qy`
            <div>
              <div
                class="core-section-header"
                @click=${()=>this._toggleCoreSection(r.node_type)}
              >
                <span style="display: flex; align-items: center; gap: 8px;">
                  <ha-icon icon="${r.icon||c[r.node_type]}"></ha-icon>
                  <span>${r.label||h[r.node_type]}</span>
                </span>
                <ha-icon class="expand-icon ${a?"expanded":""}" icon="mdi:chevron-down"></ha-icon>
              </div>
              ${a?i.qy`
                    <div class="entity-settings">
                      ${this.renderEntityPickerWithVariables(t,o,"entity",r.entity||"",(t=>this._updateCoreNode(e,r.node_type,{entity:t},n)),["sensor"],`${r.node_type} power entity`)}
                      ${"battery"===r.node_type?this.renderEntityPickerWithVariables(t,o,"secondary_entity",r.secondary_entity||"",(t=>this._updateCoreNode(e,r.node_type,{secondary_entity:t||void 0},n)),["sensor"],"Battery SoC % (optional)"):"grid"===r.node_type?this.renderEntityPickerWithVariables(t,o,"secondary_entity",r.secondary_entity||"",(t=>this._updateCoreNode(e,r.node_type,{secondary_entity:t||void 0},n)),["sensor"],"Grid export sensor (optional)"):""}
                      ${this.renderTextInput("Label",r.label||"",(t=>this._updateCoreNode(e,r.node_type,{label:t},n)))}
                      <div class="form-field" style="margin-top: 12px;">
                        <label class="form-label">Icon</label>
                        <ha-form .hass=${t} .data=${{icon:r.icon||""}} .schema=${[{name:"icon",selector:{icon:{}}}]} @value-changed=${t=>this._updateCoreNode(e,r.node_type,{icon:t.detail.value.icon},n)}></ha-form>
                      </div>
                      <div class="form-field" style="margin-top: 12px;">
                        <label class="form-label">Color</label>
                        <ultra-color-picker .label="" .value="${r.color||""}" .defaultValue="${l[r.node_type]}" .hass=${t} @value-changed=${t=>this._updateCoreNode(e,r.node_type,{color:t.detail.value},n)}></ultra-color-picker>
                      </div>
                      ${this.renderCheckbox("Show directional arrow",!1!==r.show_arrow,(t=>this._updateCoreNode(e,r.node_type,{show_arrow:t},n)))}
                      ${this.renderCheckbox("Enabled",!1!==r.enabled,(t=>this._updateCoreNode(e,r.node_type,{enabled:t},n)))}
                    </div>
                  `:""}
            </div>
          `}))}
      </div>

      <!-- Section 3: Custom Device Nodes -->
      <div class="settings-section">
        <div class="section-title">Custom Device Nodes</div>
        <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;">
          Add devices to show individual power consumption. Drag to reorder.
        </div>
        <div class="entity-rows-container">
          ${f.map(((i,r)=>this._renderDeviceRow(i,r,e,t,o,n)))}
        </div>
        <button class="add-entity-btn" @click=${()=>this._addDevice(e,n)}>
          <ha-icon icon="mdi:plus"></ha-icon>
          Add Device
        </button>
      </div>

      <!-- Section 4: Flow and Animation -->
      <div class="settings-section">
        <div class="section-title">Flow and Animation</div>
        ${this.renderSelect("Animation speed",e.animation_speed||"normal",[{value:"none",label:"None"},{value:"slow",label:"Slow"},{value:"normal",label:"Normal"},{value:"fast",label:"Fast"}],(e=>n({animation_speed:e})))}
        ${this.renderSliderField("Flow line width","Line thickness (px)",null!==(s=e.flow_line_width)&&void 0!==s?s:2,2,1,6,1,(e=>n({flow_line_width:e})),"px")}
        ${this.renderCheckbox("Show values",!1!==e.show_values,(e=>n({show_values:e})))}
        ${this.renderSelect("Unit display",e.unit_display||"auto",[{value:"auto",label:"Auto (W / kW)"},{value:"W",label:"W"},{value:"kW",label:"kW"}],(e=>n({unit_display:e})))}
        ${this.renderCheckbox("Show labels",!1!==e.show_labels,(e=>n({show_labels:e})))}
        ${this.renderCheckbox("Show icons",!1!==e.show_icons,(e=>n({show_icons:e})))}
        ${this.renderCheckbox("Show self-sufficiency gauge",!1!==e.show_self_sufficiency,(e=>n({show_self_sufficiency:e})))}
        ${!1!==e.show_self_sufficiency?this.renderEntityPickerWithVariables(t,o,"self_sufficiency_entity",e.self_sufficiency_entity||"",(e=>n({self_sufficiency_entity:e||void 0})),["sensor"],"Self-sufficiency entity (optional override)"):""}
      </div>

      <!-- Section 5: Style-specific options -->
      <div class="settings-section">
        <div class="section-title">Style Options</div>
        ${"circle_flow"===m?i.qy`
              ${this.renderSliderField("Circle size","Node circle diameter (px)",null!==(d=e.circle_size)&&void 0!==d?d:48,48,24,96,4,(e=>n({circle_size:e})),"px")}
              ${this.renderSliderField("Node spacing","Spacing between nodes (px)",null!==(p=e.node_spacing)&&void 0!==p?p:24,24,8,64,4,(e=>n({node_spacing:e})),"px")}
            `:"box_flow"===m?i.qy`
                ${this.renderSliderField("Box border width","px",null!==(y=e.box_border_width)&&void 0!==y?y:2,2,1,8,1,(e=>n({box_border_width:e})),"px")}
                ${this.renderSliderField("Box corner radius","px",null!==(u=e.box_border_radius)&&void 0!==u?u:12,12,0,32,2,(e=>n({box_border_radius:e})),"px")}
                ${this.renderSliderField("Gauge size","Central gauge diameter (px)",null!==(v=e.gauge_size)&&void 0!==v?v:80,80,40,160,8,(e=>n({gauge_size:e})),"px")}
              `:i.qy`
                ${this.renderSliderField("Sankey width","Diagram width (px)",null!==(g=e.sankey_width)&&void 0!==g?g:400,400,200,800,50,(e=>n({sankey_width:e})),"px")}
                ${this.renderSliderField("Curve factor","Path curvature",null!==($=e.sankey_curve_factor)&&void 0!==$?$:.5,.5,.1,1,.1,(e=>n({sankey_curve_factor:e})))}
                ${this.renderSliderField("Column spacing","px",null!==(_=e.sankey_column_spacing)&&void 0!==_?_:16,16,8,48,4,(e=>n({sankey_column_spacing:e})),"px")}
              `}
      </div>
    `}_renderDeviceRow(e,t,o,r,n,a){var s;const d=this._expandedDeviceIds.has(e.id);return i.qy`
      <div
        class="entity-row ${(null===(s=this._draggedDevice)||void 0===s?void 0:s.id)===e.id?"dragging":""}"
        draggable="true"
        @dragstart=${t=>this._onDeviceDragStart(t,e)}
        @dragend=${()=>this._onDeviceDragEnd()}
        @dragover=${e=>{e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect="move")}}
        @drop=${e=>this._onDeviceDrop(e,t,o,a)}
      >
        <ha-icon icon="mdi:drag" class="drag-handle"></ha-icon>
        <ha-icon icon="${e.icon||c.device}" style="flex-shrink: 0;"></ha-icon>
        <div class="entity-info" style="flex: 1; font-size: 14px; overflow: hidden; text-overflow: ellipsis;">
          ${e.label||"Device"} ${e.entity?` · ${e.entity}`:" · No entity"}
        </div>
        <ha-icon class="expand-icon ${d?"expanded":""}" icon="mdi:chevron-down" @click=${()=>this._toggleDeviceExpand(e.id)}></ha-icon>
        <ha-icon class="delete-icon" icon="mdi:delete" @click=${()=>this._deleteDevice(o,t,a)}></ha-icon>
      </div>
      ${d?i.qy`
            <div class="entity-settings">
              ${this.renderEntityPickerWithVariables(r,n,"entity",e.entity||"",(e=>this._updateDeviceAtIndex(o,t,{entity:e},a)),["sensor"],"Power entity")}
              ${this.renderTextInput("Label",e.label||"",(e=>this._updateDeviceAtIndex(o,t,{label:e},a)))}
              <div class="form-field" style="margin-top: 12px;">
                <label class="form-label">Icon</label>
                <ha-form .hass=${r} .data=${{icon:e.icon||""}} .schema=${[{name:"icon",selector:{icon:{}}}]} @value-changed=${e=>this._updateDeviceAtIndex(o,t,{icon:e.detail.value.icon},a)}></ha-form>
              </div>
              <div class="form-field" style="margin-top: 12px;">
                <label class="form-label">Color</label>
                <ultra-color-picker .label="" .value="${e.color||""}" .defaultValue="${l.device}" .hass=${r} @value-changed=${e=>this._updateDeviceAtIndex(o,t,{color:e.detail.value},a)}></ultra-color-picker>
              </div>
            </div>
          `:""}
    `}renderActionsTab(e,t,o,i){return n.A.render(e,t,(e=>i(e)))}renderOtherTab(e,t,o,i){return a.X.render(e,t,(e=>i(e)))}renderPreview(e,t,o,r){var n;const a=e,s=a.display_style||"circle_flow";let d;d="circle_flow"===s?this._renderCircleFlow(a,t,o):"box_flow"===s?this._renderBoxFlow(a,t,o):this._renderSankey(a,t,o);const l=this.createGestureHandlers(e.id,{tap_action:a.tap_action,hold_action:a.hold_action,double_tap_action:a.double_tap_action,entity:void 0,module:a},t,o),c=i.qy`
      <div
        class="energy-display-preview-wrapper"
        @pointerdown=${l.onPointerDown}
        @pointerup=${l.onPointerUp}
        @pointerleave=${l.onPointerLeave}
        @pointercancel=${l.onPointerCancel}
        style="cursor: ${"nothing"!==(null===(n=a.tap_action)||void 0===n?void 0:n.action)?"pointer":"default"}; display: block; width: 100%; box-sizing: border-box;"
      >
        ${d}
      </div>
    `;return this.wrapWithAnimation(c,e,t)}_parsePowerFromState(e,t){const o=(null!=e?e:"").toString().trim(),i=(null!=t?t:"").toLowerCase();let r=parseFloat(o.replace(/[^\d.-]/g,""))||0;return(i.includes("kw")||o.toLowerCase().includes("kw"))&&(r*=1e3),{value:r,unit:Math.abs(r)>=1e3?"kW":"W"}}_getNodePower(e,t,o){var i,r;const n=this.resolveEntity(o,t);if(!n||!e.states[n])return{value:0,unit:"W",text:"—"};const a=e.states[n],s=null!==(r=null===(i=a.attributes)||void 0===i?void 0:i.unit_of_measurement)&&void 0!==r?r:"",{value:d,unit:l}=this._parsePowerFromState(a.state,s),c="kW"===l?"kW":"W";return{value:d,unit:l,text:0===d?"0 W":`${("kW"===l?d/1e3:d).toFixed(1)} ${c}`}}_getNodeSecondary(e,t,o){const i=this.resolveEntity(o,t);if(!i||!e.states[i])return"—";const r=e.states[i],n=parseFloat(String(r.state));return isNaN(n)?String(r.state):`${n.toFixed(1)} %`}_formatPower(e,t){const o=Math.abs(e),i=e<0?"−":"";return"kW"===t?`${i}${(o/1e3).toFixed(1)} kW`:"W"===t?`${i}${Math.round(o)} W`:o>=1e3?`${i}${(o/1e3).toFixed(1)} kW`:`${i}${Math.round(o)} W`}_getFlowDuration(e){return"none"===e?"0s":"slow"===e?"3s":"fast"===e?"1s":"2s"}_renderCircleFlow(e,t,o){var r,n;const a=this.buildDesignStyles(e,t),s=this.buildStyleString(a),d=this._getCoreNodes(e),c=this._getDeviceNodes(e),p=!1!==e.show_values,y=!1!==e.show_labels,u=Math.max(24,Math.min(96,null!==(r=e.circle_size)&&void 0!==r?r:48)),v=Math.max(1,Math.min(6,null!==(n=e.flow_line_width)&&void 0!==n?n:2)),g=this._getFlowDuration(e.animation_speed||"normal"),$="0s"!==g,_=u/2,x=c.filter((e=>!1!==e.enabled)),f=x.length,m=[];["solar","grid","battery","home"].forEach((e=>{const t=d.find((t=>t.node_type===e));t&&!1!==t.enabled&&m.push(t)}));const b=m.length+f,w=Math.max(80,b*(u+10)/(2*Math.PI)),k=_+(y?22:8)+4,M=Math.round(2*(w+k)),D=M,S=M/2,C=D/2,W={solar:-Math.PI/2,grid:Math.PI,home:0,battery:Math.PI/2},N=[];if(m.forEach((e=>{var t;const o=null!==(t=W[e.node_type])&&void 0!==t?t:0;N.push({node:e,x:S+w*Math.cos(o),y:C+w*Math.sin(o)})})),f>0){const e=3*Math.PI/4,t=7*Math.PI/4;x.forEach(((o,i)=>{const r=e+(1===f?.5:i/(f-1))*(t-e);N.push({node:o,x:S+w*Math.cos(r),y:C+w*Math.sin(r)})}))}if(0===N.length)return i.qy`
        <div class="energy-display-module" style="${s} padding: 16px; min-height: 200px;">
          ${this.renderGradientErrorState("Configure energy nodes","Add entities for Solar, Grid, Battery and Home in the General tab.","mdi:lightning-bolt")}
        </div>
      `;const P=[];return N.forEach((({node:e,x:i,y:r})=>{const n=this.resolveEntity(e.entity,o);let a,s=!1;if(n&&t.states[n]){const i=this._getNodePower(t,o,e.entity);s=Math.abs(i.value)>0}a="battery"===e.node_type?this._getNodePower(t,o,e.entity).value<0:"solar"===e.node_type||"grid"===e.node_type;const d=a?`M ${i} ${r} L ${S} ${C}`:`M ${S} ${C} L ${i} ${r}`;P.push({d,color:e.color||l[e.node_type],hasFlow:s||$})})),i.qy`
      <div class="energy-display-module energy-circle-flow" style="${s} padding: 12px; width: 100%; box-sizing: border-box;">
        <svg viewBox="0 0 ${M} ${D}" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: auto; display: block; margin: 0 auto; overflow: visible;">
          ${P.map(((e,t)=>i.JW`
              <path d="${e.d}" fill="none" stroke="${e.color}" stroke-width="${v}" opacity="0.8"/>
              ${$&&e.hasFlow?i.JW`<circle r="4" fill="${e.color}" cx="0" cy="0" style="offset-path: path('${e.d}'); offset-distance: 0%; animation: energy-flow-dot ${g} linear infinite;"/>`:i.JW``}
            `))}
          ${N.map((({node:r,x:n,y:a})=>{const s=this.resolveEntity(r.entity,o);let d="—",c="";if(s&&t.states[s]){const i=this._getNodePower(t,o,r.entity);d=this._formatPower(i.value,e.unit_display||"auto"),!r.secondary_entity||"battery"!==r.node_type&&"grid"!==r.node_type||(c=this._getNodeSecondary(t,o,r.secondary_entity))}const u=r.color||l[r.node_type],v=r.label||h[r.node_type],g=a>=C,$=g?a+_+6:a-_-6;return i.JW`
              <g class="energy-node" data-node-id="${r.id}">
                ${y?i.JW`<text x="${n}" y="${$}" text-anchor="middle" font-size="11" fill="var(--secondary-text-color)" dominant-baseline="${g?"hanging":"auto"}">${v}</text>`:i.JW``}
                <circle cx="${n}" cy="${a}" r="${_}" fill="var(--card-background-color)" stroke="${u}" stroke-width="2"/>
                ${p?i.JW`<text x="${n}" y="${a}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" fill="var(--primary-text-color)">${d}</text>`:i.JW``}
                ${c?i.JW`<text x="${n}" y="${a+13}" text-anchor="middle" font-size="10" fill="var(--secondary-text-color)">${c}</text>`:i.JW``}
              </g>
            `}))}
        </svg>
      </div>
    `}_renderBoxFlow(e,t,o){var r,n,a;const s=this._getCoreNodes(e),d=this._getDeviceNodes(e).filter((e=>!1!==e.enabled)),c=!1!==e.show_values,p=!1!==e.show_labels,y=!1!==e.show_self_sufficiency,u=Math.max(0,null!==(r=e.box_border_radius)&&void 0!==r?r:10),v=Math.max(1,null!==(n=e.box_border_width)&&void 0!==n?n:2),g=this._getFlowDuration(e.animation_speed||"normal"),$="0s"!==g,_=Math.max(1,null!==(a=e.flow_line_width)&&void 0!==a?a:2);let x=0;const f=this.resolveEntity(e.self_sufficiency_entity||"",o);if(y&&f&&t.states[f]){const e=parseFloat(String(t.states[f].state));x=isNaN(e)?0:Math.max(0,Math.min(100,e))}const m=["solar","grid","battery","home"].map((e=>s.find((t=>t.node_type===e&&!1!==t.enabled)))).filter(Boolean),b=m.find((e=>"home"===e.node_type)),w=(null==b?void 0:b.color)||l.home,k=this.buildDesignStyles(e,t),M=this.buildStyleString(k),D=90,S=y?28:0,C=2*S,W=Math.max(C+16,80),N=d.length,P=D+W,F=P+D,E=F/2,z=68,J={solar:45,grid:P+45,battery:45,home:P+45},I={solar:22,grid:22,battery:114,home:114},A=d.map(((e,t)=>{const o=0+(1===N?.5:t/(N-1))*F;return Math.max(45,Math.min(F-45,o))}));if(N>1){const e=98;for(let t=1;t<N;t++)A[t]-A[t-1]<e&&(A[t]=A[t-1]+e);for(let t=N-2;t>=0;t--)A[t+1]-A[t]<e&&(A[t]=A[t+1]-e);for(let e=0;e<N;e++)A[e]=Math.max(45,Math.min(F-45,A[e]))}const L=N>0?A[N-1]+45:F,q=Math.max(F,L),B=F/2,G=Math.ceil(_/2)+1,T=N>0?192+G:136+G,j=[];m.forEach((e=>{const[i,r]=(e=>{const t=J[e],o=I[e],i=E-t,r=z-o,n=(Math.sign(i),Math.sign(r),Math.abs(i)>0?Math.sign(i)*D/2/i:1/0),a=Math.abs(r)>0?44*Math.sign(r)/2/r:1/0;return n<a?[t+Math.sign(i)*D/2,o+r*n]:[t+i*a,o+44*Math.sign(r)/2]})(e.node_type);let n;n="battery"===e.node_type?this._getNodePower(t,o,e.entity).value<0:"solar"===e.node_type||"grid"===e.node_type;const a=n?`M ${i} ${r} L ${B} 68`:`M ${B} 68 L ${i} ${r}`;j.push({d:a,color:e.color||l[e.node_type]})})),d.forEach(((e,t)=>{const o=A[t],i=`M ${B} ${z+S+2} L ${o} 148`;j.push({d:i,color:e.color||l.device})}));const V=(e,t,o,r,n,a,s,d,l)=>i.JW`
      <rect x="${e}" y="${t}" width="${o}" height="${r}" rx="${d}"
        fill="var(--card-background-color)" stroke="${n}" stroke-width="${l}" opacity="0.95"/>
      ${c?i.JW`<text x="${e+o/2}" y="${t+r/2-(p?7:0)}"
        text-anchor="middle" dominant-baseline="central"
        font-size="13" font-weight="700" fill="var(--primary-text-color)">${s}</text>`:i.JW``}
      ${p?i.JW`<text x="${e+o/2}" y="${t+r/2+(c?10:0)}"
        text-anchor="middle" dominant-baseline="central"
        font-size="10" fill="var(--secondary-text-color)">${a}</text>`:i.JW``}
    `;return i.qy`
      <div class="energy-display-module energy-box-flow" style="${M} padding: 12px; width: 100%; box-sizing: border-box;">
        <svg viewBox="${-G} ${-G} ${q+2*G} ${T+2*G}" preserveAspectRatio="xMidYMid meet"
          style="width: 100%; height: auto; display: block; overflow: hidden;">

          <!-- Flow lines — drawn first so boxes sit on top -->
          ${j.map((e=>i.JW`
            <path d="${e.d}" fill="none" stroke="${e.color}" stroke-width="${_}" opacity="0.75" stroke-linecap="round"/>
            ${$?i.JW`
              <circle r="3" cx="0" cy="0" fill="${e.color}"
                style="offset-path: path('${e.d}'); offset-distance: 0%; animation: energy-flow-dot ${g} linear infinite;"/>
              <circle r="3" cx="0" cy="0" fill="${e.color}"
                style="offset-path: path('${e.d}'); offset-distance: 0%; animation: energy-flow-dot ${g} linear calc(${g} * -0.5) infinite;"/>
            `:i.JW``}
          `))}

          <!-- Hub / gauge center -->
          ${y?i.JW`
            <circle cx="${B}" cy="${z}" r="${S}" fill="var(--card-background-color)" stroke="var(--divider-color)" stroke-width="2"/>
            <circle cx="${B}" cy="${z}" r="${S-4}" fill="none" stroke="${w}" stroke-width="4"
              stroke-dasharray="${(x/100*(2*Math.PI*(S-4))).toFixed(1)} ${(2*Math.PI*(S-4)).toFixed(1)}"
              stroke-dashoffset="${(2*Math.PI*(S-4)*.25).toFixed(1)}"
              stroke-linecap="round"
              style="transition: stroke-dasharray 0.5s ease; transform: rotate(-90deg); transform-origin: ${B}px ${z}px;"/>
            <text x="${B}" y="${63}" text-anchor="middle" font-size="9" font-weight="700" fill="var(--primary-text-color)">${x.toFixed(0)}%</text>
            <text x="${B}" y="${76}" text-anchor="middle" font-size="8" fill="var(--secondary-text-color)">Home</text>
          `:i.JW`<circle cx="${B}" cy="${z}" r="4" fill="var(--divider-color)"/>`}

          <!-- Core node boxes -->
          ${m.map((i=>{const r=this.resolveEntity(i.entity,o);let n="—";if(r&&t.states[r]){const r=this._getNodePower(t,o,i.entity);n=this._formatPower(r.value,e.unit_display||"auto")}const a=i.color||l[i.node_type],s=i.label||h[i.node_type],d="solar"===i.node_type||"battery"===i.node_type?0:P,c="solar"===i.node_type||"grid"===i.node_type?0:92;return V(d,c,D,44,a,s,n,u,v)}))}

          <!-- Device boxes -->
          ${d.map(((i,r)=>{const n=this.resolveEntity(i.entity,o);let a="—";if(n&&t.states[n]){const r=this._getNodePower(t,o,i.entity);a=this._formatPower(r.value,e.unit_display||"auto")}const s=i.color||l.device,d=i.label||h.device,c=A[r];return V(c-45,148,D,44,s,d,a,u,v)}))}
        </svg>
      </div>
    `}_renderSankey(e,t,o){var r;const n=this._getCoreNodes(e),a=this._getDeviceNodes(e).filter((e=>!1!==e.enabled)),s=!1!==e.show_values,d=!1!==e.show_labels,c=Math.max(.1,Math.min(1,null!==(r=e.sankey_curve_factor)&&void 0!==r?r:.5)),p=this.buildDesignStyles(e,t),y=this.buildStyleString(p),u=this._getFlowDuration(e.animation_speed||"normal"),v="0s"!==u,g=n.filter((e=>("solar"===e.node_type||"grid"===e.node_type)&&!1!==e.enabled)),$=n.find((e=>"home"===e.node_type&&!1!==e.enabled)),_=n.find((e=>"battery"===e.node_type&&!1!==e.enabled)),x=_?this._getNodePower(t,o,_.entity).value:0,f=Boolean(_&&x<0),m=f&&_?[...g,_]:g,b=(_&&!f?[_]:[]).concat(a),w=e=>{const i=this.resolveEntity(e.entity,o);return i&&t.states[i]?Math.abs(this._getNodePower(t,o,e.entity).value):0},k=m.map((e=>({node:e,value:w(e)}))),M=b.map((e=>({node:e,value:w(e)}))),D=Math.max(1,k.reduce(((e,t)=>e+t.value),0)),S=Math.max(1,M.reduce(((e,t)=>e+t.value),0)),C=$?w($):0,W=d?18:0,N=s?14:0,P=W+N+14,F=k.length,E=M.length,z=Math.max(200,288-P*Math.max(0,F-1)),J=Math.max(200,288-P*Math.max(0,E-1)),I=k.map((e=>Math.max(36,Math.round(e.value/D*z)))),A=M.map((e=>Math.max(36,Math.round(e.value/S*J)))),L=I.reduce(((e,t)=>e+t),0)+P*Math.max(0,F-1),q=A.reduce(((e,t)=>e+t),0)+P*Math.max(0,E-1),B=Math.max(L,q,72),G=(d?W:0)+(s?N:0),T=B+32+G+8,j=16+G,V=j+(B-q)/2;let H=j+(B-L)/2;const O=k.map(((e,t)=>{const o={node:e.node,value:e.value,x:0,y:H,w:44,h:I[t],color:e.node.color||l[e.node.node_type]};return H+=I[t]+P,o}));H=V;const U=M.map(((e,t)=>{const o={node:e.node,value:e.value,x:256,y:H,w:44,h:A[t],color:e.node.color||l[e.node.node_type]};return H+=A[t]+P,o})),R=12*Math.max(0,F-1),Q=B-R,Z=k.map((e=>Math.max(8,Math.round(e.value/D*Q)))),Y=Z.reduce(((e,t)=>e+t),0),X=Y>Q?Q/Y:1,K=Z.map((e=>Math.max(8,Math.round(e*X))));let ee=j+(B-(K.reduce(((e,t)=>e+t),0)+R))/2;const te=12*Math.max(0,E-1),oe=B-te,ie=M.map((e=>Math.max(8,Math.round(e.value/S*oe)))),re=ie.reduce(((e,t)=>e+t),0),ne=re>oe?oe/re:1,ae=ie.map((e=>Math.max(8,Math.round(e*ne))));let se=j+(B-(ae.reduce(((e,t)=>e+t),0)+te))/2;const de=Math.max(24,84*c*1.5),le=[];O.forEach(((e,t)=>{const o=K[t],i=e.y,r=e.y+e.h,n=ee,a=ee+o;ee+=o+12;const s=e.x+e.w,d=`M ${s} ${i} C ${s+de} ${i}, ${128-de} ${n}, 128 ${n}`,l=`L 128 ${a} C ${128-de} ${a}, ${s+de} ${r}, ${s} ${r} Z`,c=(i+r)/2,h=(n+a)/2,p=`M ${s} ${c} C ${s+de} ${c}, ${128-de} ${h}, 128 ${h}`;le.push({shapePath:`${d} ${l}`,centerPath:p,color:e.color,id:`sf-${t}`})}));const ce=[];U.forEach(((e,t)=>{const o=ae[t],i=se,r=se+o;se+=o+12;const n=e.y,a=e.y+e.h,s=e.x,d=`M 172 ${i} C ${172+de} ${i}, ${s-de} ${n}, ${s} ${n}`,l=`L ${s} ${a} C ${s-de} ${a}, ${172+de} ${r}, 172 ${r} Z`,c=(i+r)/2,h=(n+a)/2,p=`M 172 ${c} C ${172+de} ${c}, ${s-de} ${h}, ${s} ${h}`;ce.push({shapePath:`${d} ${l}`,centerPath:p,color:e.color,id:`cf-${t}`})}));const he=["0s",`calc(${u} * -0.33)`,`calc(${u} * -0.66)`];return i.qy`
      <div class="energy-display-module energy-sankey" style="${y} padding: 12px; width: 100%; box-sizing: border-box;">
        <svg viewBox="0 0 ${300} ${T}" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: auto; display: block; overflow: visible;">

          <!-- Flow bands — rendered first so bars sit on top -->
          ${[...le,...ce].map((e=>i.JW`
            <path d="${e.shapePath}" fill="${e.color}" opacity="0.5"/>
          `))}

          <!-- Animated dots travelling along each flow's center path -->
          ${v?[...le,...ce].map((e=>i.JW`
            ${he.map(((t,o)=>i.JW`
              <circle r="3" cx="0" cy="0" fill="white" opacity="0.85"
                style="offset-path: path('${e.centerPath}'); offset-distance: 0%; animation: energy-flow-dot ${u} linear ${t} infinite;"/>
            `))}
          `)):i.JW``}

          <!-- Source bars: only round the LEFT (outer) corners -->
          ${O.map((t=>{const{x:o,y:r,w:n,h:a}=t,l=`M ${o+5} ${r} L ${o+n} ${r} L ${o+n} ${r+a} L ${o+5} ${r+a} Q ${o} ${r+a} ${o} ${r+a-5} L ${o} ${r+5} Q ${o} ${r} ${o+5} ${r} Z`;return i.JW`
              <path d="${l}" fill="${t.color}" opacity="0.95"/>
              ${d?i.JW`<text x="${o+n/2}" y="${r+a+W}" text-anchor="middle" font-size="${10}" font-weight="600" fill="var(--primary-text-color)">${t.node.label||h[t.node.node_type]}</text>`:i.JW``}
              ${s?i.JW`<text x="${o+n/2}" y="${r+a+W+N}" text-anchor="middle" font-size="${10}" fill="var(--secondary-text-color)">${this._formatPower(t.value,e.unit_display||"auto")}</text>`:i.JW``}
            `}))}

          <!-- Home bar: no border radius — flows attach flush to both sides -->
          <rect x="${128}" y="${j}" width="${44}" height="${B}" rx="0" fill="var(--secondary-background-color)" stroke="var(--divider-color)" stroke-width="1" opacity="0.9"/>
          ${d?i.JW`<text x="${150}" y="${j-N-8-10}" text-anchor="middle" font-size="${10}" font-weight="600" fill="var(--primary-text-color)">${(null==$?void 0:$.label)||"Home"}</text>`:i.JW``}
          ${s?i.JW`<text x="${150}" y="${j-8}" text-anchor="middle" font-size="${10}" fill="var(--secondary-text-color)">${this._formatPower(C,e.unit_display||"auto")}</text>`:i.JW``}

          <!-- Consumer bars: only round the RIGHT (outer) corners -->
          ${U.map((t=>{const{x:o,y:r,w:n,h:a}=t,l=`M ${o} ${r} L ${o+n-5} ${r} Q ${o+n} ${r} ${o+n} ${r+5} L ${o+n} ${r+a-5} Q ${o+n} ${r+a} ${o+n-5} ${r+a} L ${o} ${r+a} Z`;return i.JW`
              <path d="${l}" fill="${t.color}" opacity="0.95"/>
              ${d?i.JW`<text x="${o+n/2}" y="${r+a+W}" text-anchor="middle" font-size="${10}" font-weight="600" fill="var(--primary-text-color)">${t.node.label||h[t.node.node_type]}</text>`:i.JW``}
              ${s?i.JW`<text x="${o+n/2}" y="${r+a+W+N}" text-anchor="middle" font-size="${10}" fill="var(--secondary-text-color)">${this._formatPower(t.value,e.unit_display||"auto")}</text>`:i.JW``}
            `}))}        </svg>
      </div>
    `}}}}]);