"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[3e3],{3815:(e,t,o)=>{o.r(t),o.d(t,{UltraDropdownModule:()=>p});var n=o(5183),i=o(6478),r=o(7475),a=o(8938),l=o(8869),s=o(5262),d=o(5320),c=o(9286);o(7921),o(9442);class p extends r.m{constructor(){super(...arguments),this.metadata={type:"dropdown",title:"Dropdown",description:"Interactive dropdown selector with Home Assistant actions",author:"WJD Designs",version:"1.0.0",icon:"mdi:menu-down",category:"interactive",tags:["dropdown","select","menu","scene","service","interactive"]},this.expandedOptions=new Set,this.dropdownOpenStates=new Map,this.currentSelection=new Map,this.clickOutsideHandler=null,this.scrollHandler=null,this.resizeHandler=null,this.portaledDropdowns=new Map,this.portaledDropdownTriggers=new Map,this.scrollListenerParents=new Map,this.activeScrollHandlers=new Set,this.moduleContexts=new Map,this.chevronClickHandling=new Set,this.draggedIndex=null}createDefault(e,t){return{id:e||this.generateId("dropdown"),type:"dropdown",source_mode:"manual",source_entity:void 0,placeholder:"Choose an option...",options:[{id:this.generateId("option"),label:"Turn On Lights",action:{action:"perform-action",service:"light.turn_on",target:{entity_id:["light.living_room"]}}},{id:this.generateId("option"),label:"Turn Off Lights",action:{action:"perform-action",service:"light.turn_off",target:{entity_id:["light.living_room"]}}}],entity_option_customization:{},current_selection:"Turn On Lights",track_state:!0,closed_title_mode:"last_chosen",closed_title_entity:void 0,closed_title_custom:"",unified_template_mode:!1,unified_template:"",control_icon:"mdi:chevron-down",control_alignment:"apart",control_icon_side:"right",visible_items:5,tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[],enable_hover_effect:!1,hover_background_color:"var(--primary-color)"}}getOptionsFromEntity(e,t){var o;if(!e.source_entity||!t)return[];const n=t.states[e.source_entity];if(!n)return[];const i=null===(o=n.attributes)||void 0===o?void 0:o.options;return Array.isArray(i)?i:[]}formatOptionLabel(e,t,o){if(null==e)return"";if(t&&o.formatEntityState)try{const n=Object.assign(Object.assign({},t),{state:e}),i=o.formatEntityState(n,e);if(i&&i!==e)return i}catch(e){}return String(e).replace(/_/g," ").replace(/\b\w/g,(e=>e.toUpperCase()))}getCurrentStateFromEntity(e,t){if(!e.source_entity||!t)return;const o=t.states[e.source_entity];return o?o.state:void 0}renderEntitySourcePreview(e,t,o){const r=this.getOptionsFromEntity(e,t),a=this.getCurrentStateFromEntity(e,t);return 0===r.length?n.qy`
        <div style="font-size: 12px; color: var(--secondary-text-color); font-style: italic;">
          ${(0,i.kg)("editor.dropdown.no_options_found",o,"No options found for this entity")}
        </div>
      `:n.qy`
      <div style="font-size: 12px; margin-top: 8px;">
        <div style="font-weight: 600; margin-bottom: 4px; color: var(--primary-text-color);">
          ${(0,i.kg)("editor.dropdown.available_options",o,"Available Options")}
          (${r.length}):
        </div>
        <div style="color: var(--secondary-text-color); line-height: 1.6;">
          ${r.map(((e,t)=>n.qy`<div style="display: flex; align-items: center; gap: 6px;">
                <span style="color: var(--primary-color);">•</span>
                <span
                  style="${e===a?"font-weight: 600; color: var(--primary-color);":""}"
                  >${e}</span
                >
                ${e===a?n.qy`<span style="font-size: 10px; opacity: 0.7;">(current)</span>`:""}
              </div>`))}
        </div>
      </div>
    `}renderGeneralTab(e,t,o,r){var a,l,s,d;const c=e,p=(null===(a=null==t?void 0:t.locale)||void 0===a?void 0:a.language)||"en",m=(e,t)=>{const o=c.options.map((o=>o.id===e?Object.assign(Object.assign({},o),t):o));r({options:o})},g=(e,t)=>{const o=[...c.options],[n]=o.splice(e,1);o.splice(t,0,n),r({options:o})},u=e=>{const t=c.options.find((t=>t.id===e));if(t){const o=Object.assign(Object.assign({},t),{id:this.generateId("option"),label:`${t.label} (Copy)`}),n=c.options.findIndex((t=>t.id===e)),i=[...c.options.slice(0,n+1),o,...c.options.slice(n+1)];r({options:i})}};return n.qy`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        <!-- Source Configuration -->
        <div class="settings-section">
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${(0,i.kg)("editor.dropdown.source.title",p,"Dropdown Source")}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,i.kg)("editor.dropdown.source.desc",p,"Choose whether to manually define options or use a select/input_select entity.")}
          </div>

          <!-- Source Mode Selection -->
          <div style="margin-bottom: 16px;">
            ${this.renderFieldSection((0,i.kg)("editor.dropdown.source_mode.title",p,"Source Mode"),(0,i.kg)("editor.dropdown.source_mode.desc",p,"Manual: Define custom options with actions. Entity: Use options from a select or input_select entity."),t,{source_mode:c.source_mode||"manual"},[this.selectField("source_mode",[{value:"manual",label:(0,i.kg)("editor.dropdown.source_mode.manual",p,"Manual Options")},{value:"entity",label:(0,i.kg)("editor.dropdown.source_mode.entity",p,"Entity Source")}])],(e=>{const t=e.detail.value.source_mode;t!==(c.source_mode||"manual")&&(r({source_mode:t}),setTimeout((()=>this.triggerPreviewUpdate()),50))}))}
          </div>

          <!-- Entity Picker (only shown when source_mode is 'entity') -->
          ${"entity"===c.source_mode?n.qy`
                <div style="margin-bottom: 16px;">
                  ${this.renderConditionalFieldsGroup((0,i.kg)("editor.dropdown.entity_source_config",p,"Entity Source Configuration"),n.qy`
                      ${this.renderFieldSection((0,i.kg)("editor.dropdown.source_entity.title",p,"Source Entity"),(0,i.kg)("editor.dropdown.source_entity.desc",p,"Select or input_select entity to use as the source for dropdown options."),t,{source_entity:c.source_entity||""},[{name:"source_entity",label:"",selector:{entity:{domain:["input_select","select"]}}}],(e=>{const t=e.detail.value.source_entity;t!==(c.source_entity||"")&&(r({source_entity:t}),setTimeout((()=>this.triggerPreviewUpdate()),50))}))}
                      ${c.source_entity?n.qy`
                            <div
                              style="margin-top: 12px; padding: 12px; background: rgba(var(--rgb-primary-color), 0.05); border-radius: 4px; border-left: 3px solid var(--primary-color);"
                            >
                              <div
                                style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 8px;"
                              >
                                ${(0,i.kg)("editor.dropdown.entity_source_info",p,"Options will be automatically populated from the entity. The dropdown will display the current state and update the entity when an option is selected.")}
                              </div>
                              ${this.renderEntitySourcePreview(c,t,p)}
                            </div>
                          `:""}
                    `)}
                </div>
              `:""}
        </div>

        <!-- Basic Settings (only show for manual mode or when no entity is selected) -->
        ${"manual"===c.source_mode?n.qy`
              <div class="settings-section">
                <div
                  class="section-title"
                  style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
                >
                  ${(0,i.kg)("editor.dropdown.basic.title",p,"Basic Settings")}
                </div>
                <div
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
                >
                  ${(0,i.kg)("editor.dropdown.basic.desc",p,"Configure the dropdown appearance and behavior.")}
                </div>

                <!-- Keep Selection State -->
                <div
                  style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;"
                >
                  <div>
                    <div
                      style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
                    >
                      ${(0,i.kg)("editor.dropdown.keep_selection_state.title",p,"Keep Selection State")}
                    </div>
                    <div
                      style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8; line-height: 1.4;"
                    >
                      ${(0,i.kg)("editor.dropdown.keep_selection_state.desc",p,"Remember and display the last selected option (recommended for scene selectors)")}
                    </div>
                  </div>
                  <ha-switch
                    .checked=${null===(l=c.track_state)||void 0===l||l}
                    @change=${e=>{const t=e.target;r({track_state:t.checked})}}
                  ></ha-switch>
                </div>

                <!-- Closed Dropdown Title Configuration -->
                <div style="margin-bottom: 16px;">
                  ${this.renderFieldSection((0,i.kg)("editor.dropdown.closed_title_mode.title",p,"Closed Dropdown Title"),(0,i.kg)("editor.dropdown.closed_title_mode.desc",p,"Choose what the dropdown displays when closed."),t,{closed_title_mode:c.closed_title_mode||"last_chosen"},[this.selectField("closed_title_mode",[{value:"last_chosen",label:(0,i.kg)("editor.dropdown.closed_title_mode.last_chosen",p,"Last Chosen")},{value:"entity_state",label:(0,i.kg)("editor.dropdown.closed_title_mode.entity_state",p,"Entity State")},{value:"custom",label:(0,i.kg)("editor.dropdown.closed_title_mode.custom",p,"Custom")},{value:"first_option",label:(0,i.kg)("editor.dropdown.closed_title_mode.first_option",p,"First Option")}])],(e=>{const t=e.detail.value.closed_title_mode;t!==(c.closed_title_mode||"last_chosen")&&(r({closed_title_mode:t}),setTimeout((()=>this.triggerPreviewUpdate()),50))}))}
                </div>

                <!-- Conditional fields based on closed_title_mode -->
                ${"entity_state"===c.closed_title_mode?n.qy`
                      <div style="margin-bottom: 16px;">
                        ${this.renderConditionalFieldsGroup((0,i.kg)("editor.dropdown.closed_title_entity_config",p,"Entity State Configuration"),n.qy`
                            ${this.renderFieldSection((0,i.kg)("editor.dropdown.closed_title_entity.title",p,"Entity"),(0,i.kg)("editor.dropdown.closed_title_entity.desc",p,"Entity whose state will be displayed when dropdown is closed."),t,{closed_title_entity:c.closed_title_entity||""},[this.entityField("closed_title_entity")],(e=>{const t=e.detail.value.closed_title_entity;t!==(c.closed_title_entity||"")&&(r({closed_title_entity:t}),setTimeout((()=>this.triggerPreviewUpdate()),50))}))}
                          `)}
                      </div>
                    `:""}
                ${"custom"===c.closed_title_mode?n.qy`
                      <div style="margin-bottom: 16px;">
                        ${this.renderConditionalFieldsGroup((0,i.kg)("editor.dropdown.closed_title_custom_config",p,"Custom Text Configuration"),n.qy`
                            <div class="field-group">
                              <div
                                class="field-title"
                                style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
                              >
                                ${(0,i.kg)("editor.dropdown.closed_title_custom.title",p,"Custom Text")}
                              </div>
                              <div
                                class="field-description"
                                style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                              >
                                ${(0,i.kg)("editor.dropdown.closed_title_custom.desc",p,"Custom text to display when dropdown is closed.")}
                              </div>
                              <ha-textfield
                                .value=${c.closed_title_custom||""}
                                placeholder="Please select..."
                                @input=${e=>{var t;const o=e.target,n=(null===(t=o.shadowRoot)||void 0===t?void 0:t.querySelector("input"))||o,i=o.value,a=n.selectionStart,l=n.selectionEnd;r({closed_title_custom:i}),requestAnimationFrame((()=>{n&&"number"==typeof a&&(o.value=i,n.value=i,n.setSelectionRange(a,l||a))})),setTimeout((()=>{n&&"number"==typeof a&&(o.value=i,n.value=i,n.setSelectionRange(a,l||a))}),0),setTimeout((()=>{n&&"number"==typeof a&&(o.value=i,n.value=i,n.setSelectionRange(a,l||a))}),10)}}
                                style="width: 100%; --mdc-theme-primary: var(--primary-color);"
                              ></ha-textfield>
                            </div>
                          `)}
                      </div>
                    `:""}

                <!-- Placeholder (only show when track_state is disabled) -->
                ${c.track_state?"":n.qy`
                      <div style="margin-bottom: 16px;">
                        <div
                          class="field-title"
                          style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
                        >
                          ${(0,i.kg)("editor.dropdown.placeholder.title",p,"Placeholder")}
                        </div>
                        <div
                          class="field-description"
                          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                        >
                          ${(0,i.kg)("editor.dropdown.placeholder.desc",p,"Text shown when no option is selected.")}
                        </div>
                        <ha-textfield
                          .value=${c.placeholder||""}
                          placeholder="Select an option..."
                          @input=${e=>{var t;const o=e.target,n=(null===(t=o.shadowRoot)||void 0===t?void 0:t.querySelector("input"))||o,i=o.value,a=n.selectionStart,l=n.selectionEnd;r({placeholder:i}),requestAnimationFrame((()=>{n&&"number"==typeof a&&(o.value=i,n.value=i,n.setSelectionRange(a,l||a))})),setTimeout((()=>{n&&"number"==typeof a&&(o.value=i,n.value=i,n.setSelectionRange(a,l||a))}),0),setTimeout((()=>{n&&"number"==typeof a&&(o.value=i,n.value=i,n.setSelectionRange(a,l||a))}),10)}}
                          style="width: 100%; --mdc-theme-primary: var(--primary-color);"
                        ></ha-textfield>
                      </div>
                    `}
              </div>

              <!-- Unified Template Section -->
              ${"manual"===c.source_mode?n.qy`
                    <div class="template-section" style="margin-bottom: 24px;">
                      <div class="template-header">
                        <div class="switch-container">
                          <label class="switch-label"
                            >${(0,i.kg)("editor.dropdown.unified_template_section.title",p,"Template Mode")}</label
                          >
                          <label class="switch">
                            <input
                              type="checkbox"
                              .checked=${c.unified_template_mode||!1}
                              @change=${e=>{const t=e.target.checked;r({unified_template_mode:t})}}
                            />
                            <span class="slider round"></span>
                          </label>
                        </div>
                        <div class="template-description">
                          ${(0,i.kg)("editor.dropdown.unified_template_section.desc",p,"Use a single Jinja2 template to generate all dropdown options with icons, labels, and colors. Return a JSON array of option objects. When enabled, manual options are replaced by template-generated options.")}
                        </div>
                      </div>

                      ${c.unified_template_mode?n.qy`
                            <div 
                              class="template-content"
                              @mousedown=${e=>{const t=e.target;t.closest("ultra-template-editor")||t.closest(".cm-editor")||e.stopPropagation()}}
                              @dragstart=${e=>e.stopPropagation()}
                            >
                              <ultra-template-editor
                                .hass=${t}
                                .value=${c.unified_template||""}
                                .placeholder=${'[\n  {"label": "Heating", "icon": "mdi:fire", "icon_color": "#FF5722"},\n  {"label": "Cooling", "icon": "mdi:snowflake", "icon_color": "#2196F3"},\n  {"label": "Auto", "icon": "mdi:autorenew", "icon_color": "#4CAF50"}\n]'}
                                .minHeight=${200}
                                .maxHeight=${500}
                                @value-changed=${e=>{r({unified_template:e.detail.value})}}
                              ></ultra-template-editor>
                              <div class="template-help">
                                <p><strong>Template must return a JSON array of options:</strong></p>
                                <code
                                  style="display: block; background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-size: 11px; margin-top: 8px;"
                                >
                                  [<br />
                                  &nbsp;&nbsp;{"label": "Option 1", "icon": "mdi:home", "icon_color": "blue"},<br />
                                  &nbsp;&nbsp;{"label": "Option 2", "icon": "mdi:car", "icon_color": "red"},<br />
                                  &nbsp;&nbsp;{"label": "Option 3", "icon": "mdi:star"}<br />
                                  ]
                                </code>
                                <p style="margin-top: 12px;"><strong>Example - Ecobee Climate Modes (with actions):</strong></p>
                                <code
                                  style="display: block; background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-size: 11px; margin-top: 8px;"
                                >
                                  {% set modes = state_attr('climate.ecobee', 'hvac_modes') | default(['off', 'heat', 'cool', 'auto', 'heat_cool']) %}<br />
                                  [<br />
                                  {% for mode in modes %}<br />
                                  &nbsp;&nbsp;{<br />
                                  &nbsp;&nbsp;&nbsp;&nbsp;"label": "{% if mode == 'heat' %}Heating{% elif mode == 'cool' %}Cooling{% elif mode == 'auto' %}Auto{% elif mode == 'heat_cool' %}Heat/Cool{% else %}Off{% endif %}",<br />
                                  &nbsp;&nbsp;&nbsp;&nbsp;"icon": "{% if mode == 'heat' %}mdi:fire{% elif mode == 'cool' %}mdi:snowflake{% elif mode == 'auto' %}mdi:autorenew{% elif mode == 'heat_cool' %}mdi:thermostat{% else %}mdi:thermostat-off{% endif %}",<br />
                                  &nbsp;&nbsp;&nbsp;&nbsp;"icon_color": "{% if mode == 'heat' %}#FF5722{% elif mode == 'cool' %}#2196F3{% elif mode == 'auto' %}#4CAF50{% elif mode == 'heat_cool' %}#FF9800{% else %}#9E9E9E{% endif %}",<br />
                                  &nbsp;&nbsp;&nbsp;&nbsp;"mode": "{{ mode }}"<br />
                                  &nbsp;&nbsp;}{% if not loop.last %},{% endif %}<br />
                                  {% endfor %}<br />
                                  ]
                                </code>
                                <p style="margin-top: 12px;">
                                  <strong>Important:</strong> To enable actions (clicking options to change HVAC mode), you must:
                                </p>
                                <ul style="margin-top: 8px; padding-left: 20px;">
                                  <li>Include a <code>"mode"</code> field in each option with the actual HVAC mode value (e.g., "heat", "cool", "auto")</li>
                                  <li>Set a <code>source_entity</code> in the Entity Source Configuration section (even if Source Mode is Manual)</li>
                                  <li>When an option is clicked, it will automatically call <code>climate.set_hvac_mode</code> service</li>
                                </ul>
                                <p style="margin-top: 12px;">
                                  <strong>Note:</strong> When Unified Template is enabled, manually configured options are ignored. The template dynamically generates all options with their icons, labels, and colors. The selected option's display automatically uses the properties from the template-generated options.
                                </p>
                                <p style="margin-top: 12px;">
                                  <strong>Optional Display Key:</strong> You can include a <code>"display"</code> key in your template result to customize what shows when the dropdown is closed. The template's <code>"display"</code> key takes priority over the "Closed Dropdown Title" configuration setting.
                                </p>
                                <p style="margin-top: 12px;"><strong>Example with display key:</strong></p>
                                <code
                                  style="display: block; background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-size: 11px; margin-top: 8px;"
                                >
                                  {% set mode = states("climate.ecobee") %}<br />
                                  {% set modes = state_attr('climate.ecobee', 'hvac_modes') | default(['off', 'heat', 'cool', 'auto', 'heat_cool']) %}<br />
                                  {<br />
                                  &nbsp;&nbsp;"options": [<br />
                                  {% for m in modes %}<br />
                                  &nbsp;&nbsp;&nbsp;&nbsp;{"label": "{% if m == 'heat' %}Heating{% elif m == 'cool' %}Cooling{% elif m == 'auto' %}Auto{% else %}Off{% endif %}", "icon": "mdi:fire", "mode": "{{ m }}"}{% if not loop.last %},{% endif %}<br />
                                  {% endfor %}<br />
                                  &nbsp;&nbsp;],<br />
                                  &nbsp;&nbsp;"display": {<br />
                                  &nbsp;&nbsp;&nbsp;&nbsp;"label": "{% if mode == 'heat' %}🔥 Heating{% elif mode == 'cool' %}❄️ Cooling{% elif mode == 'auto' %}🔄 Auto{% else %}Off{% endif %}",<br />
                                  &nbsp;&nbsp;&nbsp;&nbsp;"icon": "{% if mode == 'heat' %}mdi:fire{% elif mode == 'cool' %}mdi:snowflake{% elif mode == 'auto' %}mdi:autorenew{% else %}mdi:thermostat-off{% endif %}",<br />
                                  &nbsp;&nbsp;&nbsp;&nbsp;"icon_color": "{% if mode == 'heat' %}#FF5722{% elif mode == 'cool' %}#2196F3{% elif mode == 'auto' %}#4CAF50{% else %}#9E9E9E{% endif %}"<br />
                                  &nbsp;&nbsp;}<br />
                                  }
                                </code>
                              </div>
                            </div>
                          `:""}
                    </div>
                  `:""}

              <!-- Dropdown Options -->
              <div class="settings-section">
                <div
                  class="section-title"
                  style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
                >
                  ${(0,i.kg)("editor.dropdown.options.title",p,"Dropdown Options")}
                </div>

                <div class="options-list">
                  ${c.options.map(((e,o)=>n.qy`
                      <div
                        class="option-item"
                        style="margin-bottom: 24px; background: var(--secondary-background-color); border-radius: 8px; border: 1px solid var(--divider-color); overflow: hidden;"
                        data-option-id="${e.id}"
                        data-option-index="${o}"
                        @dragover=${e=>this.handleDragOver(e)}
                        @dragenter=${e=>this.handleDragEnter(e)}
                        @dragleave=${e=>this.handleDragLeave(e)}
                        @drop=${e=>this.handleDrop(e,o,g)}
                      >
                        <div
                          class="option-header"
                          style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(var(--rgb-primary-color), 0.05); border-bottom: 1px solid var(--divider-color); cursor: pointer;"
                          @click=${e=>this.toggleHeader(e)}
                        >
                          <div style="display: flex; align-items: center; gap: 12px;">
                            <div
                              class="drag-handle"
                              style="padding: 8px; margin: -8px; cursor: grab; border-radius: 4px; transition: background-color 0.2s ease;"
                              draggable="true"
                              @dragstart=${e=>this.handleDragStart(e,o)}
                              @dragend=${e=>this.handleDragEnd(e)}
                              @click=${e=>e.stopPropagation()}
                              @mousedown=${e=>e.stopPropagation()}
                              .title=${(0,i.kg)("editor.dropdown.drag_option",p,"Drag to reorder")}
                              @mouseenter=${e=>{e.target.style.backgroundColor="rgba(var(--rgb-primary-color), 0.1)"}}
                              @mouseleave=${e=>{e.target.style.backgroundColor="transparent"}}
                            >
                              <ha-icon
                                icon="mdi:drag"
                                style="color: var(--secondary-text-color); pointer-events: none;"
                              ></ha-icon>
                            </div>
                            <div style="font-weight: 600; color: var(--primary-text-color);">
                              ${e.label||(0,i.kg)("editor.dropdown.option_number",p,"Option {number}").replace("{number}",(o+1).toString())}
                            </div>
                          </div>
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <ha-icon-button
                              @click=${t=>{t.stopPropagation(),u(e.id)}}
                              .title=${(0,i.kg)("editor.dropdown.duplicate_option",p,"Duplicate option")}
                            >
                              <ha-icon icon="mdi:content-duplicate"></ha-icon>
                            </ha-icon-button>
                            <ha-icon-button
                              @click=${t=>{t.stopPropagation(),(e=>{const t=c.options.filter((t=>t.id!==e));r({options:t})})(e.id)}}
                              .title=${(0,i.kg)("editor.dropdown.remove_option",p,"Remove option")}
                              .disabled=${c.options.length<=1}
                            >
                              <ha-icon icon="mdi:delete"></ha-icon>
                            </ha-icon-button>
                            <ha-icon
                              class="expand-caret"
                              icon="mdi:chevron-down"
                              style="color: var(--secondary-text-color); transition: transform 0.2s ease; transform: ${this.expandedOptions.has(e.id)?"rotate(180deg)":"rotate(0deg)"}; cursor: pointer; padding: 8px; margin: -8px;"
                              @click=${t=>{t.stopPropagation(),t.preventDefault(),console.log("Direct caret clicked for option:",e.id);const o=t.target,n=o.closest(".option-item"),i=null==n?void 0:n.querySelector(".option-content");if(n&&i&&o){const e=n.getAttribute("data-option-id")||"";console.log("Direct caret - found ID:",e),this.expandedOptions.has(e)?(this.expandedOptions.delete(e),i.style.display="none",o.style.transform="rotate(0deg)",console.log("Direct caret - collapsed")):(this.expandedOptions.add(e),i.style.display="block",o.style.transform="rotate(180deg)",console.log("Direct caret - expanded"))}}}
                            ></ha-icon>
                          </div>
                        </div>

                        <div
                          class="option-content"
                          style="padding: 16px; display: ${this.expandedOptions.has(e.id)?"block":"none"};"
                        >
                          ${this.renderOptionConfiguration(e,t,p,m)}
                        </div>
                      </div>
                    `))}
                </div>

                <div style="margin-top: 16px; text-align: center;">
                  <ha-button @click=${()=>{const e=this.generateId("option"),t={id:e,label:`Option ${c.options.length+1}`,action:{action:"more-info",entity:""}};this.expandedOptions.add(e),r({options:[...c.options,t]})}}>
                    <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
                    ${(0,i.kg)("editor.dropdown.add_option",p,"Add Option")}
                  </ha-button>
                </div>
              </div>
            `:n.qy`
              <div class="settings-section">
                <div
                  class="section-title"
                  style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
                >
                  ${(0,i.kg)("editor.dropdown.basic.title",p,"Basic Settings")}
                </div>
                <div
                  style="text-align: center; padding: 32px; color: var(--secondary-text-color); background: rgba(var(--rgb-primary-color), 0.05); border-radius: 8px;"
                >
                  <ha-icon
                    icon="mdi:link-variant"
                    style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"
                  ></ha-icon>
                  <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
                    ${(0,i.kg)("editor.dropdown.entity_mode_active",p,"Entity Source Mode Active")}
                  </div>
                  <div style="font-size: 14px; line-height: 1.4;">
                    ${(0,i.kg)("editor.dropdown.entity_mode_desc",p,"Options are automatically managed by the selected entity. The dropdown will display the current state and update the entity when an option is selected.")}
                  </div>
                </div>
              </div>
            `}
        <!-- Control Icon & Alignment -->
        <div class="settings-section">
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${(0,i.kg)("editor.dropdown.control_icon.section_title",p,"Dropdown Control Icon")}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,i.kg)("editor.dropdown.control_icon.section_desc",p,"Customize the dropdown chevron icon and how it aligns with the selected value.")}
          </div>

          ${this.renderFieldSection((0,i.kg)("editor.dropdown.control_icon.label",p,"Control Icon"),(0,i.kg)("editor.dropdown.control_icon.label_desc",p,"Select the icon that indicates the dropdown toggle state."),t,{control_icon:c.control_icon||"mdi:chevron-down"},[this.iconField("control_icon")],(e=>{const t=e.detail.value.control_icon;t!==c.control_icon&&(r({control_icon:t&&t.trim()?t:void 0}),setTimeout((()=>this.triggerPreviewUpdate()),50))}))}

          <div style="margin-top: 24px;">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
              ${(0,i.kg)("editor.dropdown.control_alignment.mode",p,"Alignment Mode")}
            </div>
            <div style="display: flex; gap: 8px;">
              ${[{value:"center",icon:"mdi:align-horizontal-center",title:(0,i.kg)("editor.common.center",p,"Center")},{value:"apart",icon:"mdi:arrow-left-right",title:(0,i.kg)("editor.common.apart",p,"Apart")}].map((e=>n.qy`
                  <button
                    class="alignment-btn ${(c.control_alignment||"apart")===e.value?"active":""}"
                    @click=${()=>{(c.control_alignment||"apart")!==e.value&&(r({control_alignment:e.value}),setTimeout((()=>this.triggerPreviewUpdate()),50))}}
                    title="${e.title}"
                    style="flex: 1; padding: 12px; border: 1px solid var(--divider-color); border-radius: 4px; background: ${(c.control_alignment||"apart")===e.value?"var(--primary-color)":"var(--card-background-color)"}; color: ${(c.control_alignment||"apart")===e.value?"white":"var(--primary-text-color)"}; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
                  >
                    <ha-icon icon="${e.icon}" style="--mdc-icon-size: 24px;"></ha-icon>
                  </button>
                `))}
            </div>
          </div>

          <div style="margin-top: 16px;">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
              ${(0,i.kg)("editor.dropdown.control_alignment.icon_side",p,"Icon Side")}
            </div>
            <div style="display: flex; gap: 8px;">
              ${[{value:"left",icon:"mdi:arrow-left",title:(0,i.kg)("editor.common.left",p,"Left")},{value:"right",icon:"mdi:arrow-right",title:(0,i.kg)("editor.common.right",p,"Right")}].map((e=>n.qy`
                  <button
                    class="alignment-btn ${(c.control_icon_side||"right")===e.value?"active":""}"
                    @click=${()=>{(c.control_icon_side||"right")!==e.value&&(r({control_icon_side:e.value}),setTimeout((()=>this.triggerPreviewUpdate()),50))}}
                    title="${e.title}"
                    style="flex: 1; padding: 12px; border: 1px solid var(--divider-color); border-radius: 4px; background: ${(c.control_icon_side||"right")===e.value?"var(--primary-color)":"var(--card-background-color)"}; color: ${(c.control_icon_side||"right")===e.value?"white":"var(--primary-text-color)"}; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
                  >
                    <ha-icon icon="${e.icon}" style="--mdc-icon-size: 24px;"></ha-icon>
                  </button>
                `))}
            </div>
          </div>

          <!-- Visible Items Configuration -->
          <div style="margin-top: 24px;">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
              ${(0,i.kg)("editor.dropdown.visible_items.title",p,"Visible Items")}
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
            >
              ${(0,i.kg)("editor.dropdown.visible_items.desc",p,"Number of items visible in the dropdown before scrolling (1-20).")}
            </div>
            <div style="display: flex; align-items: center; gap: 16px;">
              <ha-slider
                .min=${1}
                .max=${20}
                .step=${1}
                .value=${null!==(s=c.visible_items)&&void 0!==s?s:5}
                @change=${e=>{const t=e.target,o=parseInt(t.value,10);!isNaN(o)&&o>=1&&o<=20&&(r({visible_items:o}),setTimeout((()=>this.triggerPreviewUpdate()),50))}}
                style="flex: 1; --mdc-theme-primary: var(--primary-color);"
              ></ha-slider>
              <span style="min-width: 40px; text-align: center; font-weight: 600; color: var(--primary-color); font-size: 18px;">
                ${null!==(d=c.visible_items)&&void 0!==d?d:5}
              </span>
            </div>
          </div>
        </div>
      </div>
    `}handleDragStart(e,t){var o;if(console.log("Drag start for index:",t),this.draggedIndex=t,e.dataTransfer){e.dataTransfer.effectAllowed="move",e.dataTransfer.setData("text/plain",t.toString());const n=e.target.closest(".option-item");if(null==n?void 0:n.querySelector(".option-header")){const i=document.createElement("div"),r=(null===(o=null==n?void 0:n.querySelector(".option-header div:nth-child(1) div:nth-child(2)"))||void 0===o?void 0:o.textContent)||`Option ${t+1}`;i.innerHTML=`\n          <div style="\n            display: flex; \n            align-items: center; \n            gap: 8px; \n            padding: 8px 12px;\n            background: var(--primary-color);\n            color: white;\n            border-radius: 6px;\n            font-size: 14px;\n            font-weight: 600;\n            box-shadow: 0 4px 12px rgba(0,0,0,0.3);\n            white-space: nowrap;\n            max-width: 200px;\n            transform: rotate(2deg);\n          ">\n            <ha-icon icon="mdi:drag" style="color: white; font-size: 16px;"></ha-icon>\n            <span>${r}</span>\n          </div>\n        `,i.style.position="absolute",i.style.top="-1000px",i.style.left="-1000px",i.style.zIndex="10000",i.style.pointerEvents="none",document.body.appendChild(i),e.dataTransfer.setDragImage(i,100,20),setTimeout((()=>{document.body.contains(i)&&document.body.removeChild(i)}),0)}}const n=e.target.closest(".option-item");n&&(n.classList.add("dragging"),console.log("Added dragging class to option item"))}handleDragOver(e){e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect="move")}handleDragEnter(e){e.preventDefault();const t=e.currentTarget;t&&!t.classList.contains("dragging")&&(t.style.borderTop="3px solid var(--primary-color)",t.style.backgroundColor="rgba(var(--rgb-primary-color), 0.1)",console.log("Drag entered option item"))}handleDragLeave(e){const t=e.currentTarget;t&&(t.style.borderTop="",t.style.backgroundColor="",console.log("Drag left option item"))}handleDrop(e,t,o){e.preventDefault(),console.log("Drop event - from:",this.draggedIndex,"to:",t);const n=e.currentTarget;n.style.borderTop="",n.style.backgroundColor="",null!==this.draggedIndex&&this.draggedIndex!==t&&(console.log("Executing moveOption from",this.draggedIndex,"to",t),o(this.draggedIndex,t)),document.querySelectorAll(".option-item").forEach((e=>{e.style.borderTop="",e.style.backgroundColor="",e.classList.remove("dragging")})),this.draggedIndex=null}handleDragEnd(e){var t;console.log("Drag end");const o=null===(t=e.target)||void 0===t?void 0:t.closest(".option-item");o&&(o.classList.remove("dragging"),console.log("Removed dragging class")),document.querySelectorAll(".option-item").forEach((e=>{e.style.borderTop=""})),this.draggedIndex=null}toggleHeader(e){console.log("Header clicked");const t=e.currentTarget.closest(".option-item");if(!t)return void console.log("No card found");const o=t.getAttribute("data-option-id")||"";if(!o)return void console.log("No ID found");console.log("Toggling option with ID:",o);const n=t.querySelector(".option-content"),i=t.querySelector(".expand-caret");if(console.log("Found content from card:",n),console.log("Found caret from card:",i),this.expandedOptions.has(o)?this.expandedOptions.delete(o):this.expandedOptions.add(o),n&&i){const e=this.expandedOptions.has(o);console.log("Is expanded:",e),e?(n.style.display="block",i.style.transform="rotate(180deg)",console.log("Showing content, rotating caret to 180deg")):(n.style.display="none",i.style.transform="rotate(0deg)",console.log("Hiding content, rotating caret to 0deg"))}}toggleOptionExpanded(e){console.log("toggleOptionExpanded called for:",e),console.log("Current expanded options:",Array.from(this.expandedOptions)),this.expandedOptions.has(e)?(this.expandedOptions.delete(e),console.log("Removing from expanded options")):(this.expandedOptions.add(e),console.log("Adding to expanded options"));const t=document.querySelector(`[data-option-id="${e}"]`);if(console.log("Found option element:",t),t){const o=t.querySelector(".option-content"),n=t.querySelector(".expand-caret");if(console.log("Found content:",o),console.log("Found caret:",n),o&&n){const t=this.expandedOptions.has(e);console.log("Is expanded:",t),t?(o.style.display="block",n.style.transform="rotate(180deg)",console.log("Showing content, rotating caret to 180deg")):(o.style.display="none",n.style.transform="rotate(0deg)",console.log("Hiding content, rotating caret to 0deg"))}}}renderOptionConfiguration(e,t,o,r){return n.qy`
      <!-- Basic Option Settings -->
      <div class="field-group" style="margin-bottom: 12px;">
        <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
          ${(0,i.kg)("editor.dropdown.option.label",o,"Label")}
        </div>
        <div
          class="field-description"
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
        >
          ${(0,i.kg)("editor.dropdown.option.label_desc",o,"Display text for this option")}
        </div>
        <ha-textfield
          .value=${e.label||""}
          placeholder="Enter option label"
          @input=${t=>{var o;const n=t.target,i=(null===(o=n.shadowRoot)||void 0===o?void 0:o.querySelector("input"))||n,a=n.value,l=i.selectionStart,s=i.selectionEnd;r(e.id,{label:a}),requestAnimationFrame((()=>{i&&"number"==typeof l&&(n.value=a,i.value=a,i.setSelectionRange(l,s||l))})),setTimeout((()=>{i&&"number"==typeof l&&(n.value=a,i.value=a,i.setSelectionRange(l,s||l))}),0),setTimeout((()=>{i&&"number"==typeof l&&(n.value=a,i.value=a,i.setSelectionRange(l,s||l))}),10)}}
          style="width: 100%; --mdc-theme-primary: var(--primary-color);"
        ></ha-textfield>
      </div>

      <div class="field-group" style="margin-bottom: 12px;">
        ${this.renderFieldSection((0,i.kg)("editor.dropdown.option.icon",o,"Icon"),(0,i.kg)("editor.dropdown.option.icon_desc",o,"Optional icon for this option (e.g., mdi:lightbulb)"),t,{icon:e.icon||""},[this.iconField("icon")],(t=>r(e.id,t.detail.value)))}
      </div>

      ${e.icon?n.qy`
            <div class="field-group" style="margin-bottom: 12px;">
              <div
                style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;"
              >
                <div>
                  <div
                    style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
                  >
                    ${(0,i.kg)("editor.dropdown.option.use_state_color",o,"Use State Color")}
                  </div>
                  <div
                    style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8; line-height: 1.4;"
                  >
                    ${(0,i.kg)("editor.dropdown.option.use_state_color_desc",o,"Use the entity state color for the icon (overrides custom color)")}
                  </div>
                </div>
                <ha-switch
                  .checked=${e.use_state_color||!1}
                  @change=${t=>{const o=t.target;r(e.id,{use_state_color:o.checked})}}
                ></ha-switch>
              </div>

              ${e.use_state_color?n.qy`
                    <div
                      style="text-align: center; padding: 16px; color: var(--secondary-text-color); font-style: italic; background: rgba(var(--rgb-primary-color), 0.05); border-radius: 4px;"
                    >
                      ${(0,i.kg)("editor.dropdown.option.state_color_enabled",o,"Icon will use entity state color automatically")}
                    </div>
                  `:n.qy`
                    <div class="field-group">
                      <ultra-color-picker
                        .label=${(0,i.kg)("editor.dropdown.option.icon_color",o,"Icon Color")}
                        .value=${e.icon_color||"var(--primary-color)"}
                        .defaultValue=${"var(--primary-color)"}
                        .hass=${t}
                        @value-changed=${t=>r(e.id,{icon_color:t.detail.value})}
                      ></ultra-color-picker>
                    </div>
                  `}
            </div>
          `:""}

      <!-- Action Configuration -->
      <div class="field-group" style="margin-bottom: 12px;">
        <div
          style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: var(--primary-text-color);"
        >
          ${(0,i.kg)("editor.dropdown.option.action",o,"Action")}
        </div>
        <div style="color: var(--secondary-text-color); font-size: 13px; margin-bottom: 12px;">
          ${(0,i.kg)("editor.dropdown.option.action_desc",o,"What happens when this option is selected")}
        </div>
        ${this.renderUcForm(t,{action_config:e.action},[{name:"action_config",label:"",selector:{ui_action:{actions:["more-info","toggle","navigate","url","perform-action","assist"]}}}],(t=>{var o;const n=null===(o=t.detail.value)||void 0===o?void 0:o.action_config;n&&JSON.stringify(e.action||{})!==JSON.stringify(n||{})&&(r(e.id,{action:n}),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}),!1)}
      </div>

      ${"more-info"===e.action.action?n.qy`
            <div class="field-group" style="margin-bottom: 12px;">
              ${this.renderConditionalFieldsGroup((0,i.kg)("editor.dropdown.option.more_info_config",o,"More Info Configuration"),n.qy`
                  <div class="field-group">
                    ${this.renderFieldSection((0,i.kg)("editor.dropdown.option.more_info_entity",o,"Entity"),(0,i.kg)("editor.dropdown.option.more_info_entity_desc",o,"Entity to show more information for"),t,{entity:e.action.entity||""},[this.entityField("entity")],(t=>{t.detail.value.entity!==(e.action.entity||"")&&r(e.id,{action:Object.assign(Object.assign({},e.action),{entity:t.detail.value.entity})})}))}
                  </div>
                `)}
            </div>
          `:""}
      ${"toggle"===e.action.action?n.qy`
            <div class="field-group" style="margin-bottom: 12px;">
              ${this.renderConditionalFieldsGroup((0,i.kg)("editor.dropdown.option.toggle_config",o,"Toggle Configuration"),n.qy`
                  <div class="field-group">
                    ${this.renderFieldSection((0,i.kg)("editor.dropdown.option.toggle_entity",o,"Entity"),(0,i.kg)("editor.dropdown.option.toggle_entity_desc",o,"Entity to toggle on/off"),t,{entity:e.action.entity||""},[this.entityField("entity")],(t=>{t.detail.value.entity!==(e.action.entity||"")&&r(e.id,{action:Object.assign(Object.assign({},e.action),{entity:t.detail.value.entity})})}))}
                  </div>
                `)}
            </div>
          `:""}
    `}renderActionsTab(){return n.qy`
      <div style="text-align: center; padding: 40px; color: var(--secondary-text-color);">
        <ha-icon
          icon="mdi:information-outline"
          style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"
        ></ha-icon>
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">
          Actions Configured Per Option
        </div>
        <div style="font-size: 14px; line-height: 1.4;">
          Actions for this dropdown are configured individually for each option in the General tab.
          Each dropdown option can have its own action (More Info, Toggle, Navigate, etc.).
        </div>
      </div>
    `}renderLogicTab(e,t,o,n){return a.X.render(e,t,(e=>n(e)))}renderPreview(e,t,o,i){var r,a,l,c,p,m;const g=e;this.moduleContexts.set(g.id,{module:g,hass:t,config:o});const u=g,h=u.color||"var(--primary-text-color)",v=u.font_size||14,y=u.background_color||"var(--secondary-background-color)",b=u.border_color||"var(--divider-color)",f=u.border_radius||4,_={width:"100%",height:"auto",padding:u.padding_top||u.padding_bottom||u.padding_left||u.padding_right?`${u.padding_top||"0px"} ${u.padding_right||"0px"} ${u.padding_bottom||"0px"} ${u.padding_left||"0px"}`:"0",margin:u.margin_top||u.margin_bottom||u.margin_left||u.margin_right?`${u.margin_top||"8px"} ${u.margin_right||"0"} ${u.margin_bottom||"8px"} ${u.margin_left||"0"}`:"8px 0",background:u.background_color||"transparent","border-radius":u.border_radius||"4px",border:u.border_style&&"none"!==u.border_style?`${u.border_width||"1px"} ${u.border_style} ${u.border_color||"var(--divider-color)"}`:"none","box-shadow":u.box_shadow_h||u.box_shadow_v||u.box_shadow_blur||u.box_shadow_spread?`${u.box_shadow_h||"0px"} ${u.box_shadow_v||"0px"} ${u.box_shadow_blur||"0px"} ${u.box_shadow_spread||"0px"} ${u.box_shadow_color||"rgba(0,0,0,.2)"}`:"none","box-sizing":"border-box"},w=u.width||"100%",x=u.height||"auto",$=u.max_width||"none",k=u.max_height||"none",S=u.min_width||"auto",E=u.min_height||"auto",O=u.font_family||"inherit",C=u.font_weight||"normal",z=u.text_align||"left",T=g.control_icon||"mdi:chevron-down",H=g.control_alignment||"apart",q=g.control_icon_side||"right",D="center"===H?"center":"space-between",A="center"===H?"12px":"0",F="left"===q?2:1,P="left"===q?1:2,L="apart"===H?"1 1 auto":"0 1 auto",I="apart"===H?"100%":"auto",N="apart"===H&&"left"===q,R="center"===H?"center":N?"flex-end":"flex-start",U="center"===H?"center":N?"right":"left",j=44*(null!==(r=g.visible_items)&&void 0!==r?r:5),M=`\n      width: ${this.addPixelUnit(w)};\n      max-width: ${this.addPixelUnit($)};\n      min-width: ${this.addPixelUnit(S)};\n      height: ${this.addPixelUnit(x)};\n      max-height: ${this.addPixelUnit(k)};\n      min-height: ${this.addPixelUnit(E)};\n      font-size: ${this.addPixelUnit(v.toString())};\n      font-family: ${O};\n      font-weight: ${C};\n      text-align: ${z};\n      color: ${h};\n      background: ${y};\n      border: 1px solid ${b};\n      border-radius: ${this.addPixelUnit(f.toString())};\n      padding: 8px 12px;\n      display: flex;\n      align-items: center;\n      justify-content: ${D};\n      gap: ${A};\n      cursor: pointer;\n      transition: all 0.2s ease;\n      box-sizing: border-box;\n    `,W="entity"===g.source_mode;if(W&&(!g.source_entity||""===g.source_entity.trim()))return this.renderGradientErrorState("Configure Source Entity","Select a source entity in the General tab","mdi:format-list-bulleted");if(!(W||g.options&&0!==g.options.length||g.unified_template_mode&&g.unified_template))return this.renderGradientErrorState("Add Options","Configure dropdown options in the General tab or enable Unified Template","mdi:format-list-bulleted");const G="entity"===g.source_mode&&g.source_entity,J=g.unified_template_mode&&g.unified_template;let B,V,X,K,Y=[],Z=null;if(G){const e=this.getOptionsFromEntity(g,t),o=this.getCurrentStateFromEntity(g,t),n=t.states[g.source_entity];Y=e.map((e=>{var o,i,r,a,l,s;return{label:this.formatOptionLabel(e,n,t),value:e,icon:null===(i=null===(o=g.entity_option_customization)||void 0===o?void 0:o[e])||void 0===i?void 0:i.icon,icon_color:null===(a=null===(r=g.entity_option_customization)||void 0===r?void 0:r[e])||void 0===a?void 0:a.icon_color,use_state_color:null===(s=null===(l=g.entity_option_customization)||void 0===l?void 0:l[e])||void 0===s?void 0:s.use_state_color}}));const i=this.formatOptionLabel(o,n,t);if(B=i,void 0!==o&&n){const e=Y.find((e=>e.value===o)),n=null==e?void 0:e.icon,r=e?this.getOptionIconColor(e,t,g):void 0;Z={label:i||o,icon:n,icon_color:r}}}else if(J){!this._templateService&&t&&(this._templateService=new d.I(t));const e=this._hashString(g.unified_template),n=`unified_dropdown_${g.id}_${e}`;t.__uvc_template_strings||(t.__uvc_template_strings={}),this._templateService&&!this._templateService.hasTemplateSubscription(n)&&(this._templateService.subscribeToTemplate(g.unified_template,n,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),void 0,o),t.callApi&&t.callApi("POST","template",{template:g.unified_template}).then((e=>{t.__uvc_template_strings||(t.__uvc_template_strings={}),t.__uvc_template_strings[n]=e,"undefined"!=typeof window&&window.dispatchEvent(new CustomEvent("ultra-card-template-update"))})).catch((e=>{console.error("Error evaluating template initially:",e)})));const i=null===(a=null==t?void 0:t.__uvc_template_strings)||void 0===a?void 0:a[n];if(i)try{const e=String(i).trim();let t=null;t=e.startsWith("{")&&e.endsWith("}")?JSON.parse(e):e.startsWith("[")&&e.endsWith("]")?{options:JSON.parse(e)}:{options:e.split(/[,\n]/).map((e=>e.trim())).filter((e=>e)).map((e=>({label:e})))},t&&t.options&&Array.isArray(t.options)&&(Y=t.options.map(((e,t)=>({label:String(e.label||e.name||`Option ${t+1}`),icon:e.icon?String(e.icon):void 0,icon_color:e.icon_color?String(e.icon_color):void 0,use_state_color:e.use_state_color||!1,mode:e.mode||e.value||e.label})))),t&&t.display&&(X=t.display.label||t.display.name||"",V=t.display.icon,K=t.display.icon_color)}catch(e){console.error("Error parsing unified template:",e),console.error("Template result:",i),Y=(null===(l=g.options)||void 0===l?void 0:l.map((e=>({label:e.label,icon:e.icon,icon_color:e.icon_color,use_state_color:e.use_state_color}))))||[]}else console.log("Template not evaluated yet, using manual options as fallback"),Y=(null===(c=g.options)||void 0===c?void 0:c.map((e=>({label:e.label,icon:e.icon,icon_color:e.icon_color,use_state_color:e.use_state_color}))))||[];if(g.track_state){const e=g.id,t=this.currentSelection.get(e)||g.current_selection;B=t}}else if(Y=g.options.map((e=>({label:e.label,icon:e.icon,icon_color:e.icon_color,use_state_color:e.use_state_color}))),g.track_state){const e=g.id,t=this.currentSelection.get(e)||g.current_selection;B=t}let Q=Y.find((e=>e.label===B));if(!Q&&Y.length>0&&(G||g.track_state)&&(Q=Y[0],!G)){const e=g.id;this.currentSelection.set(e,Q.label)}const ee=!G&&!g.track_state,te=g.placeholder||"Choose an option...",oe=G&&(!g.closed_title_mode||"last_chosen"===g.closed_title_mode||"entity_state"===g.closed_title_mode),ne=null===(p=g.design)||void 0===p?void 0:p.hover_effect,ie=s.k.getHoverEffectClass(ne);let re,ae,le;if(void 0===X||""===X)switch(g.closed_title_mode||"last_chosen"){case"last_chosen":const e=this.getStoredSelection(g.id),o=this.currentSelection.get(g.id),n=g.current_selection;e&&!o&&this.currentSelection.set(g.id,e);const i=e||o||n;if(i){let e=Y.find((e=>e.label===i));!e&&G&&(e=Y.find((e=>e.value===i))),e&&(re=e.label,ae=e.icon,le=e.icon_color)}!re&&Y.length>0&&(re=Y[0].label,ae=Y[0].icon,le=Y[0].icon_color);break;case"entity_state":if(g.closed_title_entity&&t){const e=t.states[g.closed_title_entity];if(e){const t=null===(m=e.attributes)||void 0===m?void 0:m.friendly_name,o=e.state.replace(/_/g," ").replace(/\b\w/g,(e=>e.toUpperCase()));re=t?`${t}: ${o}`:o}else re="Entity not found"}else re="No entity selected";break;case"custom":re=g.closed_title_custom||"Please select...";break;case"first_option":Y.length>0?(re=Y[0].label,ae=Y[0].icon,le=Y[0].icon_color):re="No options"}return n.qy`
      <div
        class="dropdown-module-container ${ie}"
        data-module-id="${g.id}"
        data-preview-context="${i||"dashboard"}"
        style=${this.styleObjectToCss(_)}
      >
        <div
          class="dropdown-module-preview"
          style="display: flex; flex-direction: column; align-items: flex-start; position: relative; z-index: 1;"
        >
          <div style="position: relative; width: 100%; z-index: 1;">
            <div class="custom-dropdown" style="position: relative;">
              <div
                class="dropdown-selected"
                style="${M}"
                @click=${e=>{const t=e.target,o=e.composedPath().some((e=>{var t,o,n,i;return(null===(o=null===(t=null==e?void 0:e.classList)||void 0===t?void 0:t.contains)||void 0===o?void 0:o.call(t,"dropdown-chevron-container"))||(null===(i=null===(n=null==e?void 0:e.classList)||void 0===n?void 0:n.contains)||void 0===i?void 0:i.call(n,"dropdown-chevron"))}))||t.classList.contains("dropdown-chevron-container")||t.closest(".dropdown-chevron-container");if(o)return;const n=g.id,r=!this.dropdownOpenStates.get(n),a=e.currentTarget.querySelector(".dropdown-chevron");a&&(a.style.transition="none",a.style.transform=r?"rotate(180deg)":"rotate(0deg)",requestAnimationFrame((()=>{a.style.transition="transform 0.2s ease"}))),console.log("Dropdown clicked"),this.toggleDropdown(e,n,i)}}
              >
                <div
                  class="dropdown-selection"
                  style="display: flex; align-items: center; gap: 8px; order: ${F}; flex: ${L}; min-width: 0; width: ${I}; justify-content: ${R}; text-align: ${U};"
                >
                  ${(()=>{if(void 0!==X&&""!==X){const e=V,t=X,o=K||"var(--primary-color)";return n.qy`
                        ${e?n.qy`<ha-icon
                              icon="${e}"
                              style="color: ${o};"
                            ></ha-icon>`:""}
                        <span>${t}</span>
                      `}if(oe&&(null==Z?void 0:Z.label))return n.qy`
                        ${Z.icon?n.qy`<ha-icon
                              icon="${Z.icon}"
                              style="color: ${Z.icon_color||"var(--primary-color)"};"
                            ></ha-icon>`:""}
                        <span>${Z.label}</span>
                      `;if(void 0!==re){const e=ae,t=re,o=le||"var(--primary-color)";return n.qy`
                        ${e?n.qy`<ha-icon
                              icon="${e}"
                              style="color: ${o};"
                            ></ha-icon>`:""}
                        <span>${t}</span>
                      `}if(ee)return n.qy`<span style="color: var(--secondary-text-color);"
                          >${te}</span
                        >`;if(Y.length>0){const e=Y[0];return n.qy`
                        ${e.icon?n.qy`<ha-icon
                              icon="${e.icon}"
                              style="color: ${this.getOptionIconColor(e,t,g)};"
                            ></ha-icon>`:""}
                        <span>${e.label}</span>
                      `}return n.qy`<span style="color: var(--secondary-text-color);">No options</span>`})()}
                </div>
                <div
                  class="dropdown-chevron-container"
                  style="display: flex; align-items: center; cursor: pointer; padding: 4px; margin: -4px; order: ${P}; flex-shrink: 0;"
                  @click=${e=>{var t;e.stopPropagation(),e.stopImmediatePropagation(),e.preventDefault();const o=g.id;if(this.chevronClickHandling.has(o))return void console.log("Chevron click already being handled for",o);this.chevronClickHandling.add(o);const n=!this.dropdownOpenStates.get(o),r=e.currentTarget.querySelector(".dropdown-chevron");r&&(r.style.transition="none",r.style.transform=n?"rotate(180deg)":"rotate(0deg)",requestAnimationFrame((()=>{r.style.transition="transform 0.2s ease"})));const a=e.currentTarget.closest(".dropdown-module-container"),l=null===(t=null==a?void 0:a.dataset)||void 0===t?void 0:t.previewContext;this.toggleDropdown(e,o,l||i),setTimeout((()=>{this.chevronClickHandling.delete(o)}),100)}}
                >
                  <ha-icon
                    class="dropdown-chevron"
                    icon="${T}"
                    style="color: var(--secondary-text-color); transition: transform 0.2s ease; transform: ${this.dropdownOpenStates.get(g.id)?"rotate(180deg)":"rotate(0deg)"}; pointer-events: none;"
                  ></ha-icon>
                </div>
              </div>

              <div
                class="dropdown-options"
                style="position: ${"fixed"} !important; top: auto; left: auto; right: auto; background: var(--card-background-color); border: 1px solid var(--divider-color); border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: ${"live"===i||"ha-preview"===i?"999999":"10001"} !important; display: none; pointer-events: none; visibility: hidden; max-height: ${j}px; overflow-y: auto; overflow-x: hidden; color: ${h}; font-size: ${this.addPixelUnit(v.toString())}; font-family: ${O}; font-weight: ${C};"
                @scroll=${e=>{e.stopPropagation(),e.stopImmediatePropagation()}}
                @wheel=${e=>{e.stopPropagation(),e.stopImmediatePropagation()}}
                @touchmove=${e=>{e.stopPropagation(),e.stopImmediatePropagation()}}
              >
                ${ee?n.qy`
                      <div
                        class="dropdown-option"
                        style="padding: 12px; cursor: pointer; border-bottom: 1px solid var(--divider-color); color: inherit; font-size: inherit; font-family: inherit; font-weight: inherit;"
                        @click=${e=>{this.selectOption("",g),this.closeDropdown(e,g.id)}}
                      >
                        <span
                          style="color: var(--secondary-text-color); font-size: inherit; font-family: inherit; font-weight: inherit;"
                          >${te}</span
                        >
                      </div>
                    `:""}
                ${Y.map((e=>n.qy`
                    <div
                      class="dropdown-option"
                      style="padding: 12px; cursor: pointer; border-bottom: 1px solid var(--divider-color); display: flex; align-items: center; gap: 8px; transition: background-color 0.2s ease; color: inherit; font-size: inherit; font-family: inherit; font-weight: inherit;"
                      @click=${n=>{if(W){const o=e.value||e.label;this.updateEntitySelection(g,o,t),this.selectOption(e.label,g)}else{if(g.track_state){const o=g.id;this.currentSelection.set(o,e.label),this.selectOption(e.label,g);const i=n.target.closest(".dropdown-module-container");if(i){const o=i.querySelector(".dropdown-selected span:last-child");o&&(o.textContent=e.label);const n=i.querySelector(".dropdown-selected > div");if(n){const o=n.querySelector("ha-icon");if(e.icon)if(o)o.setAttribute("icon",e.icon),o.style.color=this.getOptionIconColor(e,t,g);else{const o=document.createElement("ha-icon");o.setAttribute("icon",e.icon),o.style.color=this.getOptionIconColor(e,t,g),o.style.marginRight="8px",n.insertBefore(o,n.firstChild)}else o&&o.remove()}}}const i=g.options.find((t=>t.label===e.label));if(i)this.selectOption(e.label,g),this.executeOptionAction(i,t,n.currentTarget||void 0,o,g);else if(J&&e.mode){const o=g.source_entity;o&&o.startsWith("climate.")?(this.selectOption(e.label,g),t.callService("climate","set_hvac_mode",{entity_id:o,hvac_mode:e.mode}).catch((e=>{console.error("Failed to set HVAC mode:",e)}))):this.selectOption(e.label,g)}else this.selectOption(e.label,g)}this.closeDropdown(n,g.id)}}
                      @mouseenter=${e=>{e.target.style.backgroundColor="rgba(var(--rgb-primary-color), 0.1)"}}
                      @mouseleave=${e=>{e.target.style.backgroundColor="transparent"}}
                    >
                      ${e.icon?n.qy`<ha-icon
                            icon="${e.icon}"
                            style="color: ${this.getOptionIconColor(e,t,g)};"
                          ></ha-icon>`:""}
                      <span>${e.label}</span>
                    </div>
                  `))}
              </div>
            </div>
          </div>
        </div>
      </div>
    `}getOptionIconColor(e,t,o){var n;if(e.use_state_color&&o.source_entity&&t){const e=t.states[o.source_entity];if(e){const t=null===(n=e.attributes)||void 0===n?void 0:n.rgb_color;if(t&&Array.isArray(t)&&3===t.length)return`rgb(${t[0]}, ${t[1]}, ${t[2]})`;const i=o.source_entity.split(".")[0],r=e.state;switch(i){case"light":return"on"===r?"#FFA500":"#666666";case"switch":return"on"===r?"#4CAF50":"#666666";case"binary_sensor":return"on"===r?"#F44336":"#4CAF50";case"sensor":return"#2196F3";default:return"on"===r||"open"===r||"active"===r?"var(--primary-color)":"#666666"}}}return e.icon_color||"var(--primary-color)"}async updateEntitySelection(e,t,o){if(!e.source_entity||!o)return;const n=e.source_entity.split(".")[0];try{await o.callService(n,"select_option",{entity_id:e.source_entity,option:t})}catch(e){console.error("Failed to update entity selection:",e)}}getIconColor(e,t){var o;if(e.use_state_color&&e.action.entity&&t){const n=t.states[e.action.entity];if(n){const t=null===(o=n.attributes)||void 0===o?void 0:o.rgb_color;if(t&&Array.isArray(t)&&3===t.length)return`rgb(${t[0]}, ${t[1]}, ${t[2]})`;const i=e.action.entity.split(".")[0],r=n.state;switch(i){case"light":return"on"===r?"#FFA500":"#666666";case"switch":return"on"===r?"#4CAF50":"#666666";case"binary_sensor":return"on"===r?"#F44336":"#4CAF50";case"sensor":return"#2196F3";default:return"on"===r||"open"===r||"active"===r?"var(--primary-color)":"#666666"}}}return e.icon_color||"var(--primary-color)"}toggleDropdown(e,t,o){var n,i,r;let a=null,l=null,s=t||"default";const d="live"===o||"ha-preview"===o;if(e){const t=e.target;l=t.classList.contains("dropdown-selected")?t:t.closest(".dropdown-selected");const o=t.closest(".custom-dropdown"),i=t.closest(".dropdown-module-container");(null===(n=null==i?void 0:i.dataset)||void 0===n?void 0:n.moduleId)&&(s=i.dataset.moduleId),a=null==o?void 0:o.querySelector(".dropdown-options")}else a=document.querySelector(".dropdown-options"),l=document.querySelector(".dropdown-selected");const c=!this.dropdownOpenStates.get(s);if(c&&this.dropdownOpenStates.forEach(((e,t)=>{e&&t!==s&&this.closeDropdown(void 0,t)})),this.dropdownOpenStates.set(s,c),a)if(c)if(l)if(d){const e=l.getBoundingClientRect();a.style.display="block",a.style.pointerEvents="auto",a.style.visibility="visible",a.style.position="fixed",a.style.top=`${e.bottom}px`,a.style.left=`${e.left}px`,a.style.width=`${e.width}px`,a.style.right="auto",a.style.zIndex="999999",this.setupClickOutsideHandler(a,l,s),this.setupScrollAndResizeHandlers(s)}else{const e=l.getBoundingClientRect();let t=this.portaledDropdowns.get(s);t?t.innerHTML=a.innerHTML:(t=a.cloneNode(!0),t.id=`portaled-dropdown-${s}`,t.dataset.instanceId=s,document.body.appendChild(t),this.portaledDropdowns.set(s,t)),this.attachPortaledDropdownHandlers(t,s);const o=window.innerHeight,n=o-e.bottom,d=e.top,c=this.moduleContexts.get(s),p=44*(null!==(r=null===(i=null==c?void 0:c.module)||void 0===i?void 0:i.visible_items)&&void 0!==r?r:5),m=n<p&&d>n;t.style.position="fixed",t.style.left=`${e.left}px`,t.style.width=`${e.width}px`,t.style.right="auto",m?(t.style.bottom=o-e.top+"px",t.style.top="auto"):(t.style.top=`${e.bottom}px`,t.style.bottom="auto"),t.style.display="block",t.style.pointerEvents="auto",t.style.visibility="visible",t.style.zIndex="10001",t.style.maxHeight=`${p}px`,t.style.overflowY="auto",t.style.overflowX="hidden",a.style.display="none",a.style.pointerEvents="none",a.style.visibility="hidden",this.portaledDropdownTriggers.set(s,l),this.setupClickOutsideHandler(t,l,s),this.setupScrollAndResizeHandlers(s)}else a.style.display="block",a.style.pointerEvents="auto",a.style.visibility="visible";else if(d)a.style.display="none",a.style.pointerEvents="none",a.style.visibility="hidden";else{const e=this.portaledDropdowns.get(s);e&&(e.style.display="none",e.style.pointerEvents="none",e.style.visibility="hidden"),a.style.display="none",a.style.pointerEvents="none",a.style.visibility="hidden",this.removeClickOutsideHandler(),this.removeScrollAndResizeHandlers(s)}}closeDropdown(e,t){var o;let n=t||"default",i=null;e&&(i=e.target.closest(".dropdown-module-container"),(null===(o=null==i?void 0:i.dataset)||void 0===o?void 0:o.moduleId)&&(n=i.dataset.moduleId)),this.dropdownOpenStates.set(n,!1),this.updateChevronRotationInstant(n,!1,i||void 0);const r=this.portaledDropdowns.get(n);r&&(r.style.display="none",r.style.pointerEvents="none",r.style.visibility="hidden");const a=document.querySelector(`.dropdown-module-container[data-module-id="${n}"] .dropdown-options`);a&&"none"!==a.style.display&&(a.style.display="none",a.style.pointerEvents="none",a.style.visibility="hidden"),this.portaledDropdownTriggers.delete(n),this.removeClickOutsideHandler(),this.removeScrollAndResizeHandlers(n)}setupClickOutsideHandler(e,t,o){this.removeClickOutsideHandler(),this.clickOutsideHandler=n=>{const i=n.target,r=n.composedPath(),a=r.some((e=>{var t,o,n,i;return(null===(o=null===(t=null==e?void 0:e.classList)||void 0===t?void 0:t.contains)||void 0===o?void 0:o.call(t,"dropdown-chevron-container"))||(null===(i=null===(n=null==e?void 0:e.classList)||void 0===n?void 0:n.contains)||void 0===i?void 0:i.call(n,"dropdown-chevron"))}))||i.classList.contains("dropdown-chevron-container")||i.closest(".dropdown-chevron-container");if(e.contains(i)||i===e||r.some((t=>t===e||t.nodeType===Node.ELEMENT_NODE&&e.contains(t)))||t.contains(i)||i===t||a)return;this.dropdownOpenStates.set(o,!1);const l=t.closest(".dropdown-module-container");this.updateChevronRotationInstant(o,!1,l||void 0),e.style.display="none",e.style.pointerEvents="none",e.style.visibility="hidden",this.removeClickOutsideHandler(),this.removeScrollAndResizeHandlers(o)},setTimeout((()=>{document.addEventListener("click",this.clickOutsideHandler,!0)}),10)}removeClickOutsideHandler(){this.clickOutsideHandler&&(document.removeEventListener("click",this.clickOutsideHandler,!0),this.clickOutsideHandler=null)}setupScrollAndResizeHandlers(e){this.activeScrollHandlers.add(e),this.scrollHandler||(this.scrollHandler=e=>{Array.from(this.dropdownOpenStates.entries()).filter((([e,t])=>t)).map((([e])=>e)).forEach((t=>{const o=this.portaledDropdowns.get(t),n=e.target;if(n!==document&&n!==window&&n&&n!==document.documentElement&&n!==document.body){if(n instanceof HTMLElement){const n=e.composedPath(),i=o||document.querySelector(`.dropdown-module-container[data-module-id="${t}"] .dropdown-options`);if(i&&n.some((e=>e===i||e.nodeType===Node.ELEMENT_NODE&&i.contains(e))))return;this.closeDropdown(void 0,t)}}else this.closeDropdown(void 0,t)}))},window.addEventListener("scroll",this.scrollHandler,{passive:!0,capture:!0}),document.addEventListener("scroll",this.scrollHandler,{passive:!0,capture:!0}),document.addEventListener("touchmove",this.scrollHandler,{passive:!0,capture:!0})),this.resizeHandler||(this.resizeHandler=()=>{this.activeScrollHandlers.forEach((e=>{this.updatePortaledDropdownPosition(e)}))},window.addEventListener("resize",this.resizeHandler,{passive:!0}));const t=this.portaledDropdownTriggers.get(e),o=[];if(t&&this.scrollHandler){let n=t.parentElement,i=0;for(;n&&i<5;){const t=t=>{const o=t.composedPath(),n=this.portaledDropdowns.get(e);n&&(o.some((e=>e===n||e.nodeType===Node.ELEMENT_NODE&&n.contains(e)))||this.closeDropdown(void 0,e))};n.addEventListener("scroll",t,{passive:!0,capture:!0}),o.push(n),n=n.parentElement,i++}}this.scrollListenerParents.set(e,o)}removeScrollAndResizeHandlers(e){if(e){this.activeScrollHandlers.delete(e);const t=this.scrollListenerParents.get(e);t&&(t.forEach((e=>{})),this.scrollListenerParents.delete(e)),0===this.activeScrollHandlers.size&&(this.scrollHandler&&(window.removeEventListener("scroll",this.scrollHandler,{capture:!0}),document.removeEventListener("scroll",this.scrollHandler,{capture:!0}),document.removeEventListener("touchmove",this.scrollHandler,{capture:!0}),this.scrollHandler=null),this.resizeHandler&&(window.removeEventListener("resize",this.resizeHandler),this.resizeHandler=null))}else this.activeScrollHandlers.clear(),this.scrollListenerParents.forEach(((e,t)=>{e.forEach((e=>{}))})),this.scrollListenerParents.clear(),this.scrollHandler&&(window.removeEventListener("scroll",this.scrollHandler,{capture:!0}),document.removeEventListener("scroll",this.scrollHandler,{capture:!0}),document.removeEventListener("touchmove",this.scrollHandler,{capture:!0}),this.scrollHandler=null),this.resizeHandler&&(window.removeEventListener("resize",this.resizeHandler),this.resizeHandler=null)}updatePortaledDropdownPosition(e){var t,o;const n=this.portaledDropdowns.get(e),i=this.portaledDropdownTriggers.get(e);if(n&&i&&"block"===n.style.display)try{const r=i.getBoundingClientRect(),a=window.innerHeight,l=a-r.bottom,s=r.top,d=this.moduleContexts.get(e),c=l<44*(null!==(o=null===(t=null==d?void 0:d.module)||void 0===t?void 0:t.visible_items)&&void 0!==o?o:5)&&s>l;n.style.left=`${r.left}px`,n.style.width=`${r.width}px`,n.style.right="auto",c?(n.style.bottom=a-r.top+"px",n.style.top="auto"):(n.style.top=`${r.bottom}px`,n.style.bottom="auto")}catch(e){console.error("Error updating dropdown position:",e)}}updateChevronRotation(e,t,o){if(o){const e=o.querySelector(".dropdown-chevron");if(e)return void(e.style.transform=t?"rotate(180deg)":"rotate(0deg)")}const n=document.querySelector(`.dropdown-module-container[data-module-id="${e}"]`);if(n){const e=n.querySelector(".dropdown-chevron");e&&(e.style.transform=t?"rotate(180deg)":"rotate(0deg)")}}updateChevronRotationInstant(e,t,o){if(o){const e=o.querySelector(".dropdown-chevron");if(e)return e.style.transition="none",e.style.transform=t?"rotate(180deg)":"rotate(0deg)",void requestAnimationFrame((()=>{e.style.transition="transform 0.2s ease"}))}const n=document.querySelector(`.dropdown-module-container[data-module-id="${e}"]`);if(n){const e=n.querySelector(".dropdown-chevron");e&&(e.style.transition="none",e.style.transform=t?"rotate(180deg)":"rotate(0deg)",requestAnimationFrame((()=>{e.style.transition="transform 0.2s ease"})))}}attachPortaledDropdownHandlers(e,t){var o;const n=this.moduleContexts.get(t);if(!n)return void console.error("No module context found for",t);const{module:i,hass:r,config:a}=n,l="entity"===i.source_mode&&i.source_entity,s=i.unified_template_mode&&i.unified_template;e.addEventListener("wheel",(e=>{e.stopPropagation(),e.stopImmediatePropagation()}),{passive:!0,capture:!0}),e.addEventListener("touchmove",(e=>{e.stopPropagation(),e.stopImmediatePropagation()}),{passive:!0,capture:!0}),e.addEventListener("scroll",(t=>{const o=t.target;(o===e||e.contains(o))&&t.stopPropagation()}),{passive:!0});const d=e.querySelectorAll(".dropdown-option");if(l){const e=this.getOptionsFromEntity(i,r);d.forEach(((o,n)=>{const a=o.cloneNode(!0);o.replaceWith(a),a.addEventListener("click",(o=>{o.stopPropagation();const a=e[n];if(a){console.log("Entity option clicked:",a);const e=r.states[i.source_entity],o=this.formatOptionLabel(a,e,r);this.updateEntitySelection(i,a,r),this.selectOption(o,i),this.closeDropdown(void 0,t)}})),a.addEventListener("mouseenter",(()=>{a.style.backgroundColor="rgba(var(--rgb-primary-color), 0.1)"})),a.addEventListener("mouseleave",(()=>{a.style.backgroundColor="transparent"}))}))}else if(s){const e=this._hashString(i.unified_template),n=`unified_dropdown_${i.id}_${e}`,a=null===(o=null==r?void 0:r.__uvc_template_strings)||void 0===o?void 0:o[n];let l=[];if(a)try{const e=String(a).trim();let t=null;e.startsWith("{")&&e.endsWith("}")?t=JSON.parse(e):e.startsWith("[")&&e.endsWith("]")&&(t={options:JSON.parse(e)}),t&&t.options&&Array.isArray(t.options)&&(l=t.options.map((e=>({label:String(e.label||e.name||"Option"),mode:e.mode||e.value}))))}catch(e){console.error("Error parsing template in portaled handler:",e)}d.forEach(((e,o)=>{const n=e.cloneNode(!0);e.replaceWith(n);const a=l[o];n.addEventListener("click",(e=>{if(e.stopPropagation(),a){console.log("Template option clicked:",a.label),i.track_state&&this.currentSelection.set(t,a.label),this.selectOption(a.label,i);const e=i.source_entity;a.mode&&e&&e.startsWith("climate.")&&r.callService("climate","set_hvac_mode",{entity_id:e,hvac_mode:a.mode}).then((()=>{console.log(`Set ${e} to ${a.mode}`)})).catch((e=>{console.error("Failed to set HVAC mode:",e)})),this.closeDropdown(void 0,t)}})),n.addEventListener("mouseenter",(()=>{n.style.backgroundColor="rgba(var(--rgb-primary-color), 0.1)"})),n.addEventListener("mouseleave",(()=>{n.style.backgroundColor="transparent"}))}))}else{const e=i.options;d.forEach(((o,n)=>{const l=i.track_state?n:n-1;if(l<0){const e=o.cloneNode(!0);return o.replaceWith(e),void e.addEventListener("click",(e=>{e.stopPropagation(),console.log("Placeholder clicked"),this.selectOption("",i),this.closeDropdown(void 0,t)}))}const s=e[l];if(!s)return;const d=o.cloneNode(!0);o.replaceWith(d),d.addEventListener("click",(e=>{e.stopPropagation(),i.track_state&&this.currentSelection.set(t,s.label),this.selectOption(s.label,i),this.executeOptionAction(s,r,d,a,i),this.closeDropdown(void 0,t)})),d.addEventListener("mouseenter",(()=>{d.style.backgroundColor="rgba(var(--rgb-primary-color), 0.1)"})),d.addEventListener("mouseleave",(()=>{d.style.backgroundColor="transparent"}))}))}}getStoredSelection(e){try{return(0,c.bi)(`ultra_card_dropdown_selection_${e}`)}catch(e){return console.error("Error reading from localStorage:",e),null}}setStoredSelection(e,t){try{(0,c.FX)(`ultra_card_dropdown_selection_${e}`,t)}catch(e){console.error("Error writing to localStorage:",e)}}selectOption(e,t){t.track_state&&e&&console.log("Selected option:",e),"entity"!==t.source_mode&&("last_chosen"!==t.closed_title_mode&&t.closed_title_mode||this.setStoredSelection(t.id,e))}executeOptionAction(e,t,n,i,r){var a,s,d,c;if(console.log("Executing action:",e.action),!1!==(null==i?void 0:i.haptic_feedback)&&Promise.resolve().then(o.bind(o,9811)).then((({forwardHaptic:e})=>{e("selection")})),"more-info"===e.action.action&&e.action.entity){console.log("Triggering more-info for entity:",e.action.entity);const t=new CustomEvent("hass-more-info",{detail:{entityId:e.action.entity},bubbles:!0,composed:!0});return void(n?n.dispatchEvent(t):(document.dispatchEvent(t),window.dispatchEvent(t)))}const p=e.action.entity||(null===(a=e.action.service_data)||void 0===a?void 0:a.entity_id)||(null===(s=e.action.data)||void 0===s?void 0:s.entity_id)||(Array.isArray(null===(d=e.action.target)||void 0===d?void 0:d.entity_id)?e.action.target.entity_id[0]:null===(c=e.action.target)||void 0===c?void 0:c.entity_id)||void 0,m=Object.assign(Object.assign({},e.action),{entity:p||e.action.entity});l.K.handleAction(m,t,n||document.body,i,p,r)}addPixelUnit(e){return e?"auto"===e||"none"===e||"inherit"===e?e:/^\d+$/.test(e)?`${e}px`:/^[\d\s]+$/.test(e)?e.split(" ").map((e=>e.trim()?`${e}px`:e)).join(" "):e:e}styleObjectToCss(e){return Object.entries(e).map((([e,t])=>`${e.replace(/([A-Z])/g,"-$1").toLowerCase()}: ${t}`)).join("; ")}_hashString(e){let t=0;for(let o=0;o<e.length;o+=1)t=(t<<5)-t+e.charCodeAt(o),t|=0;return Math.abs(t)}validate(e){const t=e,o=[...super.validate(e).errors];return"entity"===t.source_mode?t.source_entity&&t.source_entity.trim():t.options&&t.options.length>0&&t.options.forEach(((e,t)=>{if((e.label&&""!==e.label.trim()||e.action)&&e.action)switch(e.action.action){case"more-info":case"toggle":e.action.entity||o.push(`Option ${t+1}: Entity is required for ${e.action.action} action`);break;case"navigate":e.action.navigation_path||o.push(`Option ${t+1}: Navigation path is required for navigate action`);break;case"url":e.action.url_path||o.push(`Option ${t+1}: URL is required for url action`);break;case"perform-action":e.action.perform_action||e.action.service||o.push(`Option ${t+1}: Service is required for perform-action`)}})),{valid:0===o.length,errors:o}}getStyles(){return'\n      .dropdown-module-container {\n        width: 100%;\n        box-sizing: border-box;\n        position: relative;\n        pointer-events: none;\n        isolation: isolate;\n        overflow: visible !important;\n      }\n\n      .dropdown-module-preview {\n        width: 100%;\n        position: relative;\n        overflow: visible !important;\n        pointer-events: none;\n      }\n\n      /* label styles removed */\n\n      /* Fix dropdown width in preview */\n      .dropdown-module-container select,\n      .dropdown-module-container ha-select {\n        width: 100% !important;\n        max-width: 100% !important;\n        box-sizing: border-box !important;\n        pointer-events: auto !important;\n      }\n\n      /* Custom dropdown styling - allow Global Design tab to override */\n      .custom-dropdown {\n        position: relative;\n        width: inherit;\n        height: inherit;\n        overflow: visible !important;\n        pointer-events: none;\n        z-index: 1;\n      }\n\n      /* Ensure preview containers allow overflow for dropdowns */\n      .dropdown-module-container[data-preview-context="live"],\n      .dropdown-module-container[data-preview-context="ha-preview"] {\n        overflow: visible !important;\n      }\n\n      .dropdown-module-container[data-preview-context="live"] .dropdown-module-preview,\n      .dropdown-module-container[data-preview-context="ha-preview"] .dropdown-module-preview {\n        overflow: visible !important;\n      }\n\n      .dropdown-selected {\n        cursor: pointer;\n        user-select: none;\n        pointer-events: auto;\n        /* Allow all design properties to be inherited */\n        font-family: inherit;\n        font-size: inherit;\n        font-weight: inherit;\n        color: inherit;\n        background: inherit;\n        border: inherit;\n        border-radius: inherit;\n        text-align: inherit;\n        width: inherit;\n        height: inherit;\n        max-width: inherit;\n        max-height: inherit;\n        min-width: inherit;\n        min-height: inherit;\n      }\n\n      .dropdown-selected:hover {\n        background: rgba(var(--rgb-primary-color), 0.05) !important;\n      }\n\n      .dropdown-selected * {\n        pointer-events: none;\n      }\n\n      .dropdown-chevron-container {\n        cursor: pointer;\n        pointer-events: auto;\n        flex-shrink: 0;\n        user-select: none;\n      }\n\n      .dropdown-chevron-container * {\n        pointer-events: none;\n      }\n\n      .dropdown-chevron {\n        pointer-events: none;\n        flex-shrink: 0;\n      }\n\n      .dropdown-options {\n        position: fixed !important;\n        z-index: 10001 !important;\n        background: var(--card-background-color) !important;\n        border: 1px solid var(--divider-color) !important;\n        box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;\n        border-radius: inherit;\n        font-family: inherit;\n        font-size: inherit;\n        font-weight: inherit;\n        pointer-events: none !important;\n        visibility: hidden !important;\n        overflow-y: auto !important;\n        overflow-x: hidden !important;\n        -webkit-overflow-scrolling: touch;\n        overscroll-behavior: contain;\n        scrollbar-width: thin;\n        scrollbar-color: var(--divider-color) var(--secondary-background-color);\n      }\n\n      /* Preview contexts - use fixed positioning with higher z-index */\n      /* Need to be above popup content (1001) and popup tabs (2000) */\n      .dropdown-module-container[data-preview-context="live"] .dropdown-options,\n      .dropdown-module-container[data-preview-context="ha-preview"] .dropdown-options {\n        position: fixed !important;\n        z-index: 999999 !important; /* Extremely high to appear above all popup content */\n      }\n\n      .dropdown-options[style*="display: block"] {\n        pointer-events: auto !important;\n        visibility: visible !important;\n      }\n\n      /* Ensure scrollbar is visible and functional */\n      .dropdown-options::-webkit-scrollbar {\n        width: 10px;\n        height: 10px;\n      }\n\n      .dropdown-options::-webkit-scrollbar-track {\n        background: var(--secondary-background-color);\n        border-radius: 4px;\n      }\n\n      .dropdown-options::-webkit-scrollbar-thumb {\n        background: var(--divider-color);\n        border-radius: 4px;\n        cursor: pointer;\n        -webkit-user-select: none;\n        user-select: none;\n      }\n\n      .dropdown-options::-webkit-scrollbar-thumb:hover {\n        background: var(--primary-color);\n      }\n\n      .dropdown-options::-webkit-scrollbar-thumb:active {\n        background: var(--primary-color);\n        opacity: 0.8;\n      }\n\n      /* Ensure scrollbar is clickable and draggable */\n      .dropdown-options[style*="display: block"]::-webkit-scrollbar-thumb {\n        pointer-events: auto !important;\n      }\n\n      .dropdown-option {\n        font-family: inherit;\n        font-size: inherit;\n        font-weight: inherit;\n        color: inherit;\n        text-align: inherit;\n      }\n\n      .dropdown-option:hover {\n        background: rgba(var(--rgb-primary-color), 0.1) !important;\n      }\n\n      .dropdown-option:last-child {\n        border-bottom: none !important;\n      }\n\n      /* Enable pointer events only on interactive elements */\n      .dropdown-module-container .dropdown-selected,\n      .dropdown-module-container .dropdown-chevron-container,\n      .dropdown-module-container .dropdown-option {\n        pointer-events: auto;\n      }\n\n\n      /* Remove the ::before pseudo-element that was blocking clicks */\n      /* This was extending beyond the container and intercepting pointer events */\n\n      /* Let HA handle dropdown positioning naturally */\n\n      /* Style dropdown items with icons */\n      .dropdown-module-container mwc-list-item ha-icon {\n        margin-right: 8px !important;\n        color: var(--primary-color) !important;\n      }\n\n      .dropdown-module-container mwc-list-item span {\n        display: flex !important;\n        align-items: center !important;\n      }\n\n      .options-list {\n        max-height: 400px;\n        overflow-y: auto;\n      }\n\n      .option-item {\n        transition: all 0.2s ease;\n        position: relative;\n        cursor: default;\n      }\n\n      .option-item:hover {\n        background: rgba(var(--rgb-primary-color), 0.05);\n      }\n\n      .option-item[draggable="true"] {\n        cursor: grab;\n      }\n\n      .option-item:active {\n        cursor: grabbing;\n      }\n\n      .option-item.dragging {\n        opacity: 0.7;\n        transform: rotate(2deg) scale(0.95);\n        box-shadow: 0 8px 16px rgba(0,0,0,0.2);\n        z-index: 100;\n        position: relative;\n      }\n\n      .drag-handle {\n        transition: all 0.2s ease;\n      }\n\n      .drag-handle:strong {\n        background: rgba(var(--rgb-primary-color), 0.15) !important;\n        transform: scale(1.1);\n      }\n\n      .drag-handle:active {\n        cursor: grabbing !important;\n        transform: scale(0.95);\n      }\n\n      .option-header {\n        user-select: none;\n        transition: background-color 0.2s ease;\n      }\n\n      .option-header:hover {\n        background: rgba(var(--rgb-primary-color), 0.1) !important;\n      }\n\n      .option-header ha-icon[icon="mdi:drag"] {\n        transition: color 0.2s ease;\n      }\n\n      .option-header:hover ha-icon[icon="mdi:drag"] {\n        color: var(--primary-color) !important;\n      }\n\n      .expand-caret {\n        transition: transform 0.2s ease !important;\n      }\n\n      .option-content {\n        transition: all 0.3s ease;\n        overflow: hidden;\n      }\n\n      .option-content.collapsed {\n        display: none !important;\n      }\n\n      /* Simplified form styling - let HA handle dropdowns */\n      .option-item ha-form,\n      .field-group ha-form {\n        position: relative;\n      }\n\n      /* Conditional fields grouping */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      .conditional-fields-group:hover {\n        background: rgba(var(--rgb-primary-color), 0.12);\n      }\n\n      .conditional-fields-header {\n        background: rgba(var(--rgb-primary-color), 0.15);\n        padding: 12px 16px;\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-color);\n        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n\n      .conditional-fields-content {\n        padding: 16px;\n      }\n\n      .conditional-fields-content > .field-title:first-child {\n        margin-top: 0 !important;\n      }\n\n      @keyframes slideInFromLeft {\n        from {\n          opacity: 0;\n          transform: translateX(-10px);\n        }\n        to {\n          opacity: 1;\n          transform: translateX(0);\n        }\n      }\n\n      /* Settings section styling */\n      .settings-section {\n        background: var(--secondary-background-color);\n        border-radius: 8px;\n        padding: 16px;\n        margin-bottom: 32px;\n        position: relative;\n      }\n\n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        text-transform: uppercase !important;\n        color: var(--primary-color) !important;\n        margin-bottom: 16px !important;\n        padding-bottom: 0 !important;\n        border-bottom: none !important;\n        letter-spacing: 0.5px !important;\n      }\n\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n        color: var(--primary-text-color) !important;\n        margin-bottom: 4px !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n      }\n\n      .field-group {\n        margin-bottom: 16px;\n        position: relative;\n      }\n    '}}}}]);