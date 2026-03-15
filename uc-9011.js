"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[9011],{9011:(t,e,i)=>{i.r(e),i.d(e,{UltraSliderModule:()=>u});var n=i(5183),o=i(8791),r=i(7475),a=i(8869),l=i(5255),s=i(8938),d=i(230),p=i(3580),c=(i(7921),i(1236)),g=i(1708);i(1583),i(3535),i(6709),i(7047),i(1547),c.A.use([g.Vx,g.dK,g.Ij,g.s3,g.FJ,g._R,g.Ze]);class h{static getInstance(t){return this.instances.get(t)}static setInstance(t,e){this.instances.set(t,e)}static destroyInstance(t){const e=this.instances.get(t);if(e){try{const t=e.el;t&&t._swiperResizeObserver&&(t._swiperResizeObserver.disconnect(),delete t._swiperResizeObserver),e.destroy(!0,!0)}catch(t){}this.instances.delete(t)}}static cleanup(t){this.destroyInstance(t)}}h.instances=new Map;class u extends r.m{constructor(){super(...arguments),this.metadata={type:"slider",title:"Slider Layout",description:"Create interactive slideshows with multiple pages of modules",author:"WJD Designs",version:"1.0.0",icon:"mdi:view-carousel",category:"layout",tags:["layout","slider","carousel","slideshow","pages","swipe"]}}createDefault(t,e){const i=(0,l.oD)().getModule("pagebreak"),n=(null==i?void 0:i.createDefault(this.generateId("pagebreak"),e))||{id:this.generateId("pagebreak"),type:"pagebreak",display_mode:"always",display_conditions:[]};return{id:t||this.generateId("slider"),type:"slider",modules:[n],show_pagination:!0,pagination_style:"dots",pagination_position:void 0,pagination_color:"var(--primary-text-color)",pagination_active_color:"var(--primary-color)",pagination_size:12,pagination_overlay:!1,show_arrows:!0,arrow_position_offset:0,arrow_style:"circle",arrow_size:40,arrow_color:"var(--primary-text-color)",arrow_background_color:"rgba(0, 0, 0, 0.3)",prev_arrow_icon:"mdi:chevron-left",next_arrow_icon:"mdi:chevron-right",arrows_always_visible:!1,transition_effect:"slide",transition_speed:300,slider_direction:"horizontal",centered_slides:!0,auto_play:!1,auto_play_delay:3e3,pause_on_hover:!0,loop:!0,allow_swipe:!0,allow_keyboard:!0,allow_mousewheel:!1,auto_height:!0,slider_height:300,slider_width:"100%",gap:0,slides_per_view:1,space_between:0,vertical_alignment:"top",tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}renderGeneralTab(t,e,i,o){var r,a,l,s,d,p,c,g,h,u,v,m;const w=t;return null===(r=null==e?void 0:e.locale)||void 0===r||r.language,w.modules.filter((t=>"pagebreak"===t.type)).length,w.modules.filter((t=>"pagebreak"!==t.type)).length,n.qy`
      <div class="slider-general-tab">
        ${this.injectUcFormStyles()}
        <style>
          .slider-general-tab {
            padding: 8px;
          }
          .inline-toggle {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
            padding-bottom: 0;
            border-bottom: none;
          }
          .inline-toggle .section-title {
            font-size: 18px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--primary-color);
            letter-spacing: 0.5px;
            margin-bottom: 0;
          }
          .preview-note {
            background: var(--info-color, #2196f3);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            font-size: 14px;
            line-height: 1.5;
          }
          .preview-note ha-icon {
            flex-shrink: 0;
            margin-top: 2px;
          }
        </style>

        <!-- Preview Note -->
        <div class="preview-note">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <div>
            <strong>Note:</strong> Slider transitions may not appear in the Home Assistant
            Configuration Preview Window. To see transitions, check the
            <strong>Live Preview</strong> popup in the editor or view the card on your dashboard.
          </div>
        </div>

        <!-- SLIDER LAYOUT -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            SLIDER LAYOUT
          </div>

          ${this.renderFieldSection("Layout Direction","Horizontal or vertical slider orientation",e,{slider_direction:w.slider_direction||"horizontal"},[this.selectField("slider_direction",[{value:"horizontal",label:"Horizontal"},{value:"vertical",label:"Vertical"}])],(t=>{const e=t.detail.value.slider_direction,i={slider_direction:e},n=w.pagination_position;"vertical"===e?"top"===n||"bottom"===n?i.pagination_position="right":n||(i.pagination_position="right"):"left"===n||"right"===n?i.pagination_position="bottom":n||(i.pagination_position="bottom"),"vertical"===e?(w.prev_arrow_icon&&"mdi:chevron-left"!==w.prev_arrow_icon||(i.prev_arrow_icon="mdi:chevron-up"),w.next_arrow_icon&&"mdi:chevron-right"!==w.next_arrow_icon||(i.next_arrow_icon="mdi:chevron-down")):(w.prev_arrow_icon&&"mdi:chevron-up"!==w.prev_arrow_icon||(i.prev_arrow_icon="mdi:chevron-left"),w.next_arrow_icon&&"mdi:chevron-down"!==w.next_arrow_icon||(i.next_arrow_icon="mdi:chevron-right")),o(i)}))}

          ${(w.slides_per_view||1)>1?n.qy`
                <div
                  class="field-row"
                  style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--secondary-background-color); border-radius: 8px; margin-bottom: 12px;"
                >
                  <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">Center Slider</div>
                    <div style="font-size: 12px; color: var(--secondary-text-color); line-height: 1.4;">
                      Center active slide in the viewport (only available when Slides Per View > 1)
                    </div>
                  </div>
                  <ha-switch
                    .checked=${null===(a=w.centered_slides)||void 0===a||a}
                    @change=${t=>{const e=t.target;o({centered_slides:e.checked})}}
                  ></ha-switch>
                </div>
              `:""}

          <div style="margin-bottom: 16px;">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
              Slider Width
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
            >
              Width of the slider container (e.g., 100%, 400px)
            </div>
            <ha-textfield
              .value=${w.slider_width||"100%"}
              placeholder="100%"
              @input=${t=>{var e;const i=t.target,n=(null===(e=i.shadowRoot)||void 0===e?void 0:e.querySelector("input"))||i,r=i.value,a=n.selectionStart,l=n.selectionEnd;o({slider_width:r}),requestAnimationFrame((()=>{n&&"number"==typeof a&&(i.value=r,n.value=r,n.setSelectionRange(a,l||a))})),setTimeout((()=>{n&&"number"==typeof a&&(i.value=r,n.value=r,n.setSelectionRange(a,l||a))}),0),setTimeout((()=>{n&&"number"==typeof a&&(i.value=r,n.value=r,n.setSelectionRange(a,l||a))}),10)}}
              style="width: 100%; --mdc-theme-primary: var(--primary-color);"
            ></ha-textfield>
          </div>

          <div
            class="field-row"
            style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--secondary-background-color); border-radius: 8px; margin-bottom: 12px;"
          >
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 4px;">Auto Height</div>
              <div style="font-size: 12px; color: var(--secondary-text-color); line-height: 1.4;">
                Automatically adjust slider height to fit content on each page
              </div>
            </div>
            <ha-switch
              .checked=${null===(l=w.auto_height)||void 0===l||l}
              @change=${t=>{const e=t.target;o({auto_height:e.checked})}}
            ></ha-switch>
          </div>

          ${null===(s=w.auto_height)||void 0===s||s?"":this.renderSliderField("Slider Height","Fixed height for the slider in pixels",w.slider_height||300,300,50,1e3,10,(t=>o({slider_height:t})),"px")}
          ${this.renderSliderField("Slides Per View","Number of slides visible at once",w.slides_per_view||1,1,1,10,1,(t=>o({slides_per_view:t})),"")}
          ${this.renderSliderField("Space Between","Space between slides in pixels",w.space_between||0,0,0,100,5,(t=>o({space_between:t})),"px")}
          ${(w.slides_per_view||1)>1?this.renderFieldSection("Vertical Alignment","Vertical alignment of content within slides",e,{vertical_alignment:w.vertical_alignment||"top"},[this.selectField("vertical_alignment",[{value:"top",label:"Top"},{value:"center",label:"Center"},{value:"bottom",label:"Bottom"},{value:"stretch",label:"Stretch"}])],(t=>o({vertical_alignment:t.detail.value.vertical_alignment}))):""}
        </div>

        <!-- PAGINATION -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div class="inline-toggle">
            <div class="section-title">PAGINATION</div>
            <ha-switch
              .checked=${null===(d=w.show_pagination)||void 0===d||d}
              @change=${t=>{const e=t.target;o({show_pagination:e.checked})}}
            ></ha-switch>
          </div>

          ${w.show_pagination?n.qy`
                ${this.renderFieldSection("Pagination Style","How pagination indicators are displayed",e,{pagination_style:w.pagination_style||"dots"},[this.selectField("pagination_style",[{value:"dots",label:"Dots"},{value:"dots-and-dash",label:"Dots and Dash"},{value:"dash-lines",label:"Dash Lines"},{value:"numbers",label:"Numbers"},{value:"fraction",label:"Fraction (1/5)"},{value:"progressbar",label:"Progress"},{value:"scrollbar",label:"Scrollbar"},{value:"dynamic",label:"Dynamic"}])],(t=>o({pagination_style:t.detail.value.pagination_style})))}
                ${null===(p=w.auto_height)||void 0===p||p?n.qy`
                      <div
                        class="field-row"
                        style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--secondary-background-color); border-radius: 8px; margin-bottom: 12px;"
                      >
                        <div style="flex: 1;">
                          <div style="font-weight: 600; margin-bottom: 4px;">
                            Pagination Overlay
                          </div>
                          <div
                            style="font-size: 12px; color: var(--secondary-text-color); line-height: 1.4;"
                          >
                            When enabled, pagination overlays content. When disabled, pagination
                            gets its own space.
                          </div>
                        </div>
                        <ha-switch
                          .checked=${null!==(c=w.pagination_overlay)&&void 0!==c&&c}
                          @change=${t=>{const e=t.target;o({pagination_overlay:e.checked})}}
                        ></ha-switch>
                      </div>
                    `:""}
                ${this.renderFieldSection("Pagination Position","Where to show pagination indicators",e,{pagination_position:w.pagination_position||("vertical"===w.slider_direction?"right":"bottom")},[this.selectField("pagination_position",[..."vertical"===w.slider_direction?[{value:"left",label:"Left"},{value:"right",label:"Right"}]:[{value:"top",label:"Top"},{value:"bottom",label:"Bottom"}]])],(t=>o({pagination_position:t.detail.value.pagination_position})))}
                ${this.renderSliderField("Pagination Size","Size of pagination indicators in pixels",w.pagination_size||12,12,6,30,1,(t=>o({pagination_size:t})),"px")}
                <div style="margin-bottom: 16px;">
                  <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">
                    Pagination Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Color of inactive pagination indicators
                  </div>
                  <ultra-color-picker
                    .label=${"Pagination Color"}
                    .value=${w.pagination_color||"var(--primary-text-color)"}
                    .defaultValue=${"var(--primary-text-color)"}
                    .hass=${e}
                    @value-changed=${t=>o({pagination_color:t.detail.value})}
                  ></ultra-color-picker>
                </div>
                <div style="margin-bottom: 16px;">
                  <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">
                    Active Pagination Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Color of the active pagination indicator
                  </div>
                  <ultra-color-picker
                    .label=${"Active Pagination Color"}
                    .value=${w.pagination_active_color||"var(--primary-color)"}
                    .defaultValue=${"var(--primary-color)"}
                    .hass=${e}
                    @value-changed=${t=>o({pagination_active_color:t.detail.value})}
                  ></ultra-color-picker>
                </div>
              `:""}
        </div>

        <!-- NAVIGATION ARROWS -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div class="inline-toggle">
            <div class="section-title">NAVIGATION ARROWS</div>
            <ha-switch
              .checked=${null===(g=w.show_arrows)||void 0===g||g}
              @change=${t=>{const e=t.target;o({show_arrows:e.checked})}}
            ></ha-switch>
          </div>

          ${w.show_arrows?n.qy`
                <div
                  style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; padding: 12px; background: var(--secondary-background-color); border-radius: 8px;"
                >
                  <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">Arrows Always Visible</div>
                    <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
                      Keep arrows visible (otherwise show on hover)
                    </div>
                  </div>
                  <ha-switch
                    .checked=${w.arrows_always_visible||!1}
                    @change=${t=>{const e=t.target;o({arrows_always_visible:e.checked})}}
                  ></ha-switch>
                </div>
                ${this.renderSliderField("Arrow Position Offset","Offset arrows position: positive = more inside, negative = more outside (in pixels)",w.arrow_position_offset||0,0,-100,100,5,(t=>o({arrow_position_offset:t})),"px")}
                <div style="margin-bottom: 16px;">
                  <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">
                    Arrow Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Color of the arrow icons
                  </div>
                  <ultra-color-picker
                    .label=${"Arrow Color"}
                    .value=${w.arrow_color||"var(--primary-text-color)"}
                    .defaultValue=${"var(--primary-text-color)"}
                    .hass=${e}
                    @value-changed=${t=>o({arrow_color:t.detail.value})}
                  ></ultra-color-picker>
                </div>
                <div style="margin-bottom: 16px;">
                  <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">
                    Arrow Background Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Background color of the arrow buttons (not used for minimal style)
                  </div>
                  <ultra-color-picker
                    .label=${"Arrow Background Color"}
                    .value=${w.arrow_background_color||"rgba(0, 0, 0, 0.3)"}
                    .defaultValue=${"rgba(0, 0, 0, 0.3)"}
                    .hass=${e}
                    @value-changed=${t=>o({arrow_background_color:t.detail.value})}
                  ></ultra-color-picker>
                </div>
                ${this.renderFieldSection("Arrow Style","Visual style of the arrows",e,{arrow_style:w.arrow_style||"circle"},[this.selectField("arrow_style",[{value:"default",label:"Default"},{value:"circle",label:"Circle"},{value:"square",label:"Square"},{value:"minimal",label:"Minimal"}])],(t=>o({arrow_style:t.detail.value.arrow_style})))}
                ${this.renderSliderField("Arrow Size","Size of navigation arrows in pixels",w.arrow_size||40,40,20,80,5,(t=>o({arrow_size:t})),"px")}
                ${this.renderFieldSection("Previous Arrow Icon","Icon for the previous arrow",e,{prev_arrow_icon:w.prev_arrow_icon||("vertical"===w.slider_direction?"mdi:chevron-up":"mdi:chevron-left")},[this.iconField("prev_arrow_icon")],(t=>o({prev_arrow_icon:t.detail.value.prev_arrow_icon})))}
                ${this.renderFieldSection("Next Arrow Icon","Icon for the next arrow",e,{next_arrow_icon:w.next_arrow_icon||("vertical"===w.slider_direction?"mdi:chevron-down":"mdi:chevron-right")},[this.iconField("next_arrow_icon")],(t=>o({next_arrow_icon:t.detail.value.next_arrow_icon})))}
              `:""}
        </div>

        <!-- TRANSITION & ANIMATION -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            TRANSITION & ANIMATION
          </div>

          ${this.renderFieldSection("Transition Effect","Animation style between slides",e,{transition_effect:w.transition_effect||"slide"},[this.selectField("transition_effect",[{value:"slide",label:"Slide"},{value:"fade",label:"Fade"}])],(t=>o({transition_effect:t.detail.value.transition_effect})))}
          ${this.renderSliderField("Transition Speed","Transition duration in milliseconds",w.transition_speed||300,300,100,2e3,50,(t=>o({transition_speed:t})),"ms")}
        </div>

        <!-- AUTO-PLAY -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div class="inline-toggle">
            <div class="section-title">AUTO-PLAY</div>
            <ha-switch
              .checked=${w.auto_play||!1}
              @change=${t=>{const e=t.target;o({auto_play:e.checked})}}
            ></ha-switch>
          </div>

          ${w.auto_play?n.qy`
                ${this.renderSliderField("Auto-play Delay","Time between slides in milliseconds",w.auto_play_delay||3e3,3e3,1e3,1e4,500,(t=>o({auto_play_delay:t})),"ms")}
                <div
                  style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
                >
                  <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">Pause on Hover</div>
                    <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
                      Pause auto-play when hovering over slider
                    </div>
                  </div>
                  <ha-switch
                    .checked=${null===(h=w.pause_on_hover)||void 0===h||h}
                    @change=${t=>{const e=t.target;o({pause_on_hover:e.checked})}}
                  ></ha-switch>
                </div>
              `:""}
          <div
            style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
          >
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 4px;">Loop</div>
              <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
                Return to first slide after the last
              </div>
            </div>
            <ha-switch
              .checked=${null===(u=w.loop)||void 0===u||u}
              @change=${t=>{const e=t.target;o({loop:e.checked})}}
            ></ha-switch>
          </div>
        </div>

        <!-- INTERACTION -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            INTERACTION
          </div>

          <div
            style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
          >
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 4px;">Allow Swipe</div>
              <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
                Enable touch/swipe gestures
              </div>
            </div>
            <ha-switch
              .checked=${null===(v=w.allow_swipe)||void 0===v||v}
              @change=${t=>{const e=t.target;o({allow_swipe:e.checked})}}
            ></ha-switch>
          </div>
          <div
            style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
          >
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 4px;">Allow Keyboard</div>
              <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
                Navigate with arrow keys
              </div>
            </div>
            <ha-switch
              .checked=${null===(m=w.allow_keyboard)||void 0===m||m}
              @change=${t=>{const e=t.target;o({allow_keyboard:e.checked})}}
            ></ha-switch>
          </div>
          <div
            style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;"
          >
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 4px;">Allow Mousewheel</div>
              <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
                Navigate with mouse wheel
              </div>
            </div>
            <ha-switch
              .checked=${w.allow_mousewheel||!1}
              @change=${t=>{const e=t.target;o({allow_mousewheel:e.checked})}}
            ></ha-switch>
          </div>
        </div>

      </div>
    `}renderLogicTab(t,e,i,n){return s.X.render(t,e,n)}renderActionsTab(t,e,i,o){const r=t;return n.qy`
      <div class="actions-tab">
        ${this.injectUcFormStyles()}
        <style>
          .actions-tab {
            padding: 8px;
          }
        </style>

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            LINK CONFIGURATION
          </div>

          ${a.K.render(e,{tap_action:r.tap_action||{action:"nothing"},hold_action:r.hold_action||{action:"nothing"},double_tap_action:r.double_tap_action||{action:"nothing"}},(t=>{const e={};t.tap_action&&(e.tap_action=t.tap_action),t.hold_action&&(e.hold_action=t.hold_action),t.double_tap_action&&(e.double_tap_action=t.double_tap_action),o(e)}),"Link Configuration")}
        </div>
      </div>
    `}renderSplitPreview(t,e){return this.renderPreview(t,e,{layout:{rows:[]}},"live")}renderPreview(t,e,i,r){var a,s,g,u,v,m,w,y,b,f,x,_,$,S;const z=t,k=(0,l.oD)(),A=p.I.getEffectiveDesign(z.design,p.I.getCurrentBreakpoint()),I=z,C=[];let E=[];for(const t of z.modules)"pagebreak"!==t.type?E.push(t):E.length>0&&(C.push([...E]),E=[]);if(E.length>0?C.push([...E]):0===C.length&&C.push([]),0===C.length||1===C.length&&0===C[0].length)return n.qy`
        <div style="padding: 40px 20px; text-align: center; color: var(--secondary-text-color);">
          <ha-icon
            icon="mdi:view-carousel"
            style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"
          ></ha-icon>
          <div style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">Slider is empty</div>
          <div style="font-size: 14px; opacity: 0.8;">
            Drag modules here to add content.<br />
            Use <strong>Page Break</strong> modules to separate slides.
          </div>
        </div>
      `;if("live"===r&&!C.some((t=>t.length>0)))return n.qy`
          <div style="padding: 40px 20px; text-align: center; color: var(--secondary-text-color);">
            <ha-icon
              icon="mdi:view-carousel"
              style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"
            ></ha-icon>
            <div style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">
              No content in slider
            </div>
            <div style="font-size: 14px; opacity: 0.8;">
              Add modules to the slider to see content here.
            </div>
          </div>
        `;const T=z.id,F=`swiper-${T.replace(/[^a-zA-Z0-9]/g,"-")}`;"undefined"!=typeof window&&(window[`initSwiper_${T}`]=t=>{const e=t.getAttribute("data-preview-context")||"dashboard",i=h.getInstance(T),n=t.swiper,o=t.getAttribute("data-swiper-init-context")||null;if((i||n)&&!(null==n?void 0:n.destroyed))if(o&&o!==e)i&&h.destroyInstance(T),n&&(n.destroy(!0,!0),delete t.swiper),t.removeAttribute("data-swiper-initialized"),t.removeAttribute("data-swiper-init-context");else if(o===e)return;if(t._swiperInitializing)return;t._swiperInitializing=!0,t.setAttribute("data-preview-context",e);const r="live"===e||"ha-preview"===e,a=r?100:0,l=r?10:2;let s=0;const d=()=>{var i,n,o,r,p,g,u,v,m;const w=t.closest(".ultra-slider-container"),y=`.swiper-pagination[data-slider-id="${T}"]`,b=`.swiper-scrollbar[data-slider-id="${T}"]`,f=null==w?void 0:w.querySelector(y),x=null==w?void 0:w.querySelector(b),_=t.querySelector(".swiper-button-next"),$=t.querySelector(".swiper-button-prev"),S=t.querySelectorAll(".swiper-slide").length,k=t;let A=k.offsetWidth,I=k.offsetHeight;if(A>2e3&&"live"===e){if(w){const t=w.offsetWidth;if(t>0&&t<2e3)A=t;else{const t=parseInt(getComputedStyle(k).width)||0;A=t>0&&t<2e3?t:Math.min(window.innerWidth,800)}}else A=Math.min(window.innerWidth,800);k.style.maxWidth=`${A}px`,k.style.width=`${A}px`,w&&(w.style.maxWidth=`${A}px`)}if(0===S)return s++,s<l?void setTimeout(d,a*s):(console.error("[Slider] No slides found after retries:",T),t.removeAttribute("data-swiper-initialized"),void delete t._swiperInitializing);if(0===A||!H&&0===I){if(s++,s<l)return void setTimeout(d,a*s);console.warn("[Slider] Container has no dimensions after retries, initializing anyway:",T,{containerWidth:A,containerHeight:I,isVertical:H})}try{const a=this.mapConfigToSwiper(z,C.length,T);a.pagination&&f&&(a.pagination.el=f),a.scrollbar&&x&&(a.scrollbar.el=x),a.navigation&&_&&$&&(a.navigation.nextEl=_,a.navigation.prevEl=$);const l=new c.A(t,a);h.setInstance(T,l),t.setAttribute("data-swiper-init-context",e);let s=A;if("live"===e){const e=t.offsetWidth;if(e>2e3){const e=null===(i=t.parentElement)||void 0===i?void 0:i.closest(".ultra-slider-container");if(e){const i=e.offsetWidth;if(i>0&&i<2e3)s=i;else{const e=parseInt(getComputedStyle(t).width)||0;s=e>0&&e<2e3?e:A>0&&A<2e3?A:Math.min(window.innerWidth,800)}}else s=A>0&&A<2e3?A:Math.min(window.innerWidth,800);t.style.maxWidth=`${s}px`,t.style.width=`${s}px`;const o=null===(n=t.parentElement)||void 0===n?void 0:n.closest(".ultra-slider-container");o&&(o.style.maxWidth=`${s}px`)}else s=e}(l.params.loop||l.params.rewind)&&(l.allowSlideNext=!0,l.allowSlidePrev=!0,l.on("navigationHide",(()=>{l.allowSlideNext=!0,l.allowSlidePrev=!0,l.navigation&&l.navigation.update()})),l.on("reachEnd",(()=>{l.allowSlideNext=!0,l.navigation&&l.navigation.update()})),l.on("reachBeginning",(()=>{l.allowSlidePrev=!0,l.navigation&&l.navigation.update()}))),l.updateSize(),l.updateSlides();const d=t.offsetWidth;"live"===e&&d>2e3&&(t.style.maxWidth=`${s}px`,t.style.width=`${s}px`,l.updateSize(),l.updateSlides()),s>0&&!H&&l.slides.forEach((t=>{t.offsetWidth>s&&(t.style.maxWidth=`${s}px`,t.style.width=`${s}px`)}));const b=l.wrapperEl;b&&(b.style.transitionDuration=`${l.params.speed}ms`,b.style.transitionTimingFunction="ease",b.style.transitionProperty="transform"),l.slides.length,t.offsetWidth,null===(o=l.wrapperEl)||void 0===o||o.offsetWidth,getComputedStyle(l.wrapperEl).transform,getComputedStyle(l.wrapperEl).transition,getComputedStyle(l.wrapperEl).transitionDuration,l.wrapperEl.style.transition,l.getTranslate(),l.params.speed,Array.from(l.slides).slice(0,3).map(((t,e)=>({index:e,width:t.offsetWidth,inlineWidth:t.style.width,computedWidth:getComputedStyle(t).width,transform:getComputedStyle(t).transform,isVisible:t.offsetWidth>0&&t.offsetHeight>0}))),l.updateProgress(),null===(p=null===(r=l.pagination)||void 0===r?void 0:r.render)||void 0===p||p.call(r),null===(u=null===(g=l.pagination)||void 0===g?void 0:g.update)||void 0===u||u.call(g),null===(m=null===(v=l.navigation)||void 0===v?void 0:v.update)||void 0===m||m.call(v),l.update();const S=()=>{if("dynamic"!==z.pagination_style)return;const t=l.slides.length,e=l.activeIndex,i=null==w?void 0:w.querySelector(y);if(!i)return;const n=Array.from(i.querySelectorAll(".swiper-pagination-bullet"));let o=0,r=t-1;t<=3?(o=0,r=t-1):0===e?(o=0,r=2):1===e?(o=0,r=3):e===t-1?(o=Math.max(0,t-3),r=t-1):e===t-2?(o=Math.max(0,t-4),r=t-1):(o=Math.max(0,e-2),r=Math.min(t-1,e+2)),n.forEach(((t,i)=>{const n=i>=o&&i<=r,a=Math.abs(i-e);n?(t.style.display="",t.classList.remove("swiper-pagination-bullet-active-main","swiper-pagination-bullet-active-prev","swiper-pagination-bullet-active-next","swiper-pagination-bullet-active-prev-prev","swiper-pagination-bullet-active-next-next"),0===a?(t.classList.add("swiper-pagination-bullet-active"),t.classList.add("swiper-pagination-bullet-active-main"),t.style.transform="scale(1.3)",t.style.opacity="1"):(t.classList.remove("swiper-pagination-bullet-active"),1===a?(i<e?t.classList.add("swiper-pagination-bullet-active-prev"):t.classList.add("swiper-pagination-bullet-active-next"),t.style.transform="scale(1)",t.style.opacity="0.7"):2===a?(i<e?t.classList.add("swiper-pagination-bullet-active-prev-prev"):t.classList.add("swiper-pagination-bullet-active-next-next"),t.style.transform="scale(0.6)",t.style.opacity="0.4"):(t.style.transform="scale(0.6)",t.style.opacity="0.4"))):t.style.display="none"}))};"dynamic"===z.pagination_style&&setTimeout((()=>{S()}),100);let k=!1;const I=()=>{var t;if(!l||l.destroyed||k)return;k=!0;const e=l.slides[l.activeIndex];if(!e)return void(k=!1);const i=e.querySelector(".slide-content");if(!i)return void(k=!1);const n=H&&i.offsetHeight||i.scrollHeight,o=l.wrapperEl,r=l.el;null===(t=z.auto_height)||void 0===t||t?(o&&(o.style.height=`${n}px`,o.style.transitionDuration=`${l.params.speed}ms`,o.style.transitionTimingFunction="ease",o.style.transitionProperty="transform"),r&&(r.style.transition="height 0.3s ease",r.style.height=`${n}px`),l.slides.forEach((t=>{t.style.height="auto",t.style.minHeight="0",H&&(t.style.width="100%",t.style.position="relative")})),k=!1):k=!1};let E=l.activeIndex;l.on("slideChange",(()=>{var t;const e=l.activeIndex!==E;E=l.activeIndex,l.params.loop||l.params.rewind||($&&$.classList.toggle("swiper-button-disabled",l.isBeginning),_&&_.classList.toggle("swiper-button-disabled",l.isEnd));const i="fade"===(z.transition_effect||"slide");null!==(t=z.auto_height)&&void 0!==t&&!t||i||!e||requestAnimationFrame((()=>{requestAnimationFrame((()=>{I()}))})),e&&"dynamic"===z.pagination_style&&S(),e&&window.dispatchEvent(new CustomEvent("slider-state-changed",{bubbles:!0,composed:!0,detail:{sliderId:T,index:l.activeIndex}}))})),_&&_.addEventListener("click",(()=>{})),$&&$.addEventListener("click",(()=>{})),l.on("destroy",(()=>{}));const F=()=>{var t,e;if(!l||l.destroyed)return;const i="fade"===(z.transition_effect||"slide"),n=l.slides[l.activeIndex];if(!n)return;const o=n.querySelector(".slide-content");if(!o)return;const r=H&&o.offsetHeight||o.scrollHeight,a=l.wrapperEl,s=l.el;if(null!==(t=z.auto_height)&&void 0!==t&&!t||i){if(a&&(null!==(e=z.auto_height)&&void 0!==e&&!e||i)&&z.slider_height){const t=z.slider_height||300;a.style.height=`${t}px`,s&&(s.style.height=`${t}px`)}}else a&&(a.style.height=`${r}px`,a.style.transitionDuration=`${l.params.speed}ms`,a.style.transitionTimingFunction="ease",a.style.transitionProperty="transform"),s&&(s.style.transition="height 0.3s ease",s.style.height=`${r}px`),l.slides.forEach((t=>{t.style.height="auto",t.style.minHeight="0",H&&(t.style.width="100%",t.style.position="relative")}));l.params.loop||l.params.rewind||($&&$.classList.toggle("swiper-button-disabled",l.isBeginning),_&&_.classList.toggle("swiper-button-disabled",l.isEnd))};requestAnimationFrame((()=>{requestAnimationFrame((()=>{l&&!l.destroyed&&(l.updateSize(),l.updateSlides(),l.updateSlidesClasses(),l.slides.forEach((t=>{"slide"!==tt&&"slide-left"!==tt&&"slide-right"!==tt||(H?t.style.height="":t.style.width="")})),l.update(),l.setTranslate(l.getTranslate()),F(),"live"===e&&requestAnimationFrame((()=>{l&&!l.destroyed&&(l.updateSize(),l.updateSlides(),l.updateSlidesClasses(),l.update())})),setTimeout((()=>{l&&!l.destroyed&&(F(),"live"===e&&(l.updateSize(),l.updateSlides(),l.update()))}),"live"===e?200:100))}))}));const L="fade"===(z.transition_effect||"slide");let q=null;const P=new ResizeObserver((()=>{var t;!l||l.destroyed||null!==(t=z.auto_height)&&void 0!==t&&!t||L||(null!==q&&clearTimeout(q),q=window.setTimeout((()=>{requestAnimationFrame((()=>{if(l&&!l.destroyed){const t=l.slides[l.activeIndex],e=null==t?void 0:t.querySelector(".slide-content");if(e){const t="vertical"===z.slider_direction&&e.offsetHeight||e.scrollHeight,i=l.wrapperEl,n=l.el;i&&(i.style.height=`${t}px`,i.style.transitionDuration=`${l.params.speed}ms`,i.style.transitionTimingFunction="ease",i.style.transitionProperty="transform"),n&&(n.style.height=`${t}px`),l.slides.forEach((t=>{t.style.height="auto",t.style.minHeight="0"}))}}}))}),100))}));t.querySelectorAll(".slide-content").forEach((t=>{P.observe(t)})),t._swiperResizeObserver=P,delete t._swiperInitializing}catch(e){console.error("[Slider] Error initializing:",e),t.removeAttribute("data-swiper-initialized"),delete t._swiperInitializing}};r?setTimeout(d,a):requestAnimationFrame((()=>requestAnimationFrame(d)))});const L=z.slides_per_view||1,q=z.vertical_alignment||"top",P=z.arrow_size||40,N=z.arrow_style||"default",R=z.arrow_position_offset||0,W=z.arrows_always_visible||!1,O="minimal"===N?`\n        width: ${P}px;\n        height: ${P}px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        cursor: pointer;\n        border: none;\n        background: transparent !important;\n        transition: all 0.3s;\n        color: ${z.arrow_color||"white"};\n        opacity: ${W?"1":"0"};\n      `:"default"===N?`\n        width: ${P}px;\n        height: ${P}px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        cursor: pointer;\n        border: none;\n        transition: all 0.3s;\n        opacity: ${W?"1":"0"};\n      `:`\n        width: ${P}px;\n        height: ${P}px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        cursor: pointer;\n        border: none;\n        transition: all 0.3s;\n        background: ${z.arrow_background_color||"rgba(0, 0, 0, 0.5)"};\n        color: ${z.arrow_color||"white"};\n        border: ${"square"===N?"2px solid "+(z.arrow_color||"white"):"none"};\n        border-radius: ${"circle"===N?"50%":"square"===N?"4px":"0"};\n        opacity: ${W?"1":"0"};\n      `,D=`${10+R}px`,j=`${10+R}px`,H="vertical"===z.slider_direction,M=z.slider_height||400,V=null!==(a=z.pagination_overlay)&&void 0!==a&&a,B=z.pagination_position||(H?"right":"bottom"),Y=z.pagination_style||"dots",U="numbers"===Y,X="scrollbar"===Y,G=z.show_pagination&&!V&&!H,K=G?U||X?32:16:0,J=G&&U?80:0,Z=V?20:0,Q=()=>n.qy`
        <div
          class="slider-pagination-row"
          data-slider-id="${T}"
          data-position="${B}"
        >
          ${X?n.qy`
                <div class="swiper-scrollbar" data-slider-id="${T}"></div>
              `:n.qy`
                <div
                  class="swiper-pagination pagination-${B}"
                  data-slider-id="${T}"
                ></div>
              `}
        </div>
      `,tt=z.transition_effect||"slide",et="fade"===tt,it=(A.border_style||I.border_style)&&"none"!==(A.border_style||I.border_style)?`${A.border_width||I.border_width||"1px"} ${A.border_style||I.border_style} ${A.border_color||I.border_color||"var(--divider-color)"}`:"none";return n.qy`
      <style>
        .ultra-slider-container {
          position: relative;
          width: ${z.slider_width||"100%"};
          ${H?`height: ${M}px;`:""}
          display: flex;
          flex-direction: ${H?"row":"column"};
          margin: 0 auto;
          overflow: ${"hidden"};
          border: ${it};
          ${"live"===r?"min-height: 0; max-height: none; max-width: 100%; overflow: hidden !important;":""}
        }
        .ultra-slider-container .swiper {
          width: 100% !important;
          max-width: 100% !important;
          height: ${H?`${M}px`:et?`${z.slider_height||M}px`:null===(s=z.auto_height)||void 0===s||s?"auto":`${z.slider_height||M}px`};
          position: relative;
          overflow: hidden !important;
          border: none;
          ${"live"===r?"min-height: 0; max-width: 100% !important; overflow: hidden !important;":""}
          /* CRITICAL: Ensure container doesn't clip slides during transition */
          ${"slide"===tt||"slide-left"===tt||"slide-right"===tt?"\n          /* For slide effect, ensure overflow is hidden but slides can still be visible during transition */\n          ":""}
          ${"live"===r?"min-height: 0;":""}
          ${null===(g=z.auto_height)||void 0===g||g||!z.slider_height||H?"":`height: ${z.slider_height}px !important;`}
          /* Effects always need fixed height for proper rendering */
          ${et&&!H?`height: ${z.slider_height||M}px !important;`:""}
          /* Add padding for pagination when overlay is disabled (only applies when auto_height is true) */
          ${H||!z.show_pagination||null!==(u=z.auto_height)&&void 0!==u&&!u||V||U||X?"":`\n            ${"top"===B?"padding-top: 32px;":""}\n            ${"bottom"===B?"padding-bottom: 32px;":""}\n          `}
          ${!H||!z.show_pagination||"scrollbar"===z.pagination_style||null!==(v=z.auto_height)&&void 0!==v&&!v||null!==(m=z.pagination_overlay)&&void 0!==m&&m?"":`\n            ${"left"===B?"padding-left: 32px;":""}\n            ${"right"===B?"padding-right: 32px;":""}\n          `}
        }
        .ultra-slider-container .swiper-wrapper {
          /* Swiper handles positioning - let Swiper control all transform/positioning */
          position: relative;
          z-index: 1;
          box-sizing: border-box;
          border: none;
          ${"live"===r?"min-height: 0;":""}
          /* CRITICAL: Don't override Swiper's width/height for effects - Swiper handles internally */
          ${"slide"===tt||"slide-left"===tt||"slide-right"===tt?`\n          /* For slide effect, Swiper will set wrapper width inline to (slideWidth * slidesCount) */\n          width: auto !important;\n          display: flex;\n          flex-direction: ${H?"column":"row"};\n          flex-wrap: nowrap;\n          will-change: transform;\n          /* CRITICAL: Let Swiper handle ALL transitions - don't set any transition properties */\n          ${H?`height: ${null===(w=z.auto_height)||void 0===w||w?"auto":"100%"};`:null===(y=z.auto_height)||void 0===y||y?"height: auto;":`height: ${z.slider_height||M}px;`}\n          `:"\n          /* CRITICAL: For fade - let Swiper fully control wrapper */\n          /* Swiper sets fade effect to use absolute positioning internally */\n          width: 100%;\n          height: 100%;\n          "}
        }
        .ultra-slider-container .swiper-slide {
          /* Swiper handles slide positioning - different handling per effect type */
          box-sizing: border-box;
          padding: 0;
          border: none;
          ${"live"===r?"min-height: 0; overflow: hidden;":""}
          
          ${"slide"===tt||"slide-left"===tt||"slide-right"===tt?`\n          /* SLIDE EFFECT: flexbox layout with transform transitions */\n          display: block;\n          flex-shrink: 0;\n          ${H?"\n            width: 100%;\n            height: auto;\n            min-height: 0;\n            position: relative;\n          ":`\n            width: 100%;\n            min-width: 0;\n            max-width: 100%;\n            height: ${null===(b=z.auto_height)||void 0===b||b?"auto":"100%"};\n          `}\n          overflow: ${null===(f=z.auto_height)||void 0===f||f?"visible":"hidden"};\n          `:"\n          /* FADE EFFECT: Swiper uses absolute positioning for crossfade */\n          /* Don't override width/height - let Swiper control positioning */\n          width: 100%;\n          height: 100%;\n          "}
        }
        /* Ensure slide content displays properly */
        .ultra-slider-container .swiper-slide > .slide-content {
          display: flex;
          flex-direction: column;
          /* CRITICAL: Constrain slide-content to slide width */
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          overflow: hidden;
          ${"live"===r?"max-width: 100% !important; overflow: hidden !important;":""}
        }
        .ultra-slider-container .slide-content {
          width: 100%;
          max-width: 100%;
          height: ${H?"auto":et?"100%":"fit-content"};
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow: ${et?"hidden":"visible"};
          box-sizing: border-box;
          flex: ${"0 0 auto"};
          border: none;
          /* Vertical alignment - only applies when slides_per_view > 1 */
          ${L>1?`justify-content: ${{top:"flex-start",center:"center",bottom:"flex-end",stretch:"stretch"}[q]};`:""}
          ${L>1&&"stretch"===q?"height: 100%;":""}
          ${"live"===r?"min-height: 0; max-width: 100% !important; overflow: hidden !important;":""}
        }
        .ultra-slider-container .slide-content > * {
          flex-shrink: 0;
          min-height: 0;
          height: auto;
          /* CRITICAL: Constrain child elements to slide width */
          max-width: 100%;
          box-sizing: border-box;
          ${"live"===r?"max-width: 100% !important; overflow: hidden;":""}
        }
        .ultra-slider-container .child-module-wrapper {
          overflow: visible;
          box-sizing: border-box;
          height: fit-content;
          flex: 0 0 auto;
          border: none;
          /* CRITICAL: Constrain child modules to slide width */
          width: 100% !important;
          max-width: 100% !important;
          ${"live"===r?"max-width: 100% !important; overflow: hidden !important;":""}
        }
        /* Ensure nested layout modules scale correctly within slider slides */
        .ultra-slider-container .swiper-slide .horizontal-module-preview,
        .ultra-slider-container .swiper-slide .vertical-module-preview,
        .ultra-slider-container .swiper-slide .slider-module {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box;
        }
        /* Ensure nested horizontal layout content scales correctly */
        .ultra-slider-container .swiper-slide .horizontal-preview-content {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box;
          /* When multiple slides visible, ensure flex children scale properly */
          ${L>1?"\n            flex-shrink: 1;\n            flex-basis: 0;\n          ":""}
        }
        /* Ensure nested horizontal layout children scale correctly */
        .ultra-slider-container .swiper-slide .horizontal-preview-content .child-module-preview {
          min-width: 0 !important;
          flex-shrink: 1 !important;
          box-sizing: border-box;
        }
        /* Ensure nested vertical layout content scales correctly */
        .ultra-slider-container .swiper-slide .vertical-preview-content {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box;
        }
        /* Ensure nested vertical layout children scale correctly */
        .ultra-slider-container .swiper-slide .vertical-preview-content .child-module-preview {
          min-width: 0 !important;
          flex-shrink: 1 !important;
          box-sizing: border-box;
        }
        /* Ensure nested slider modules scale correctly */
        .ultra-slider-container .swiper-slide .slider-module .ultra-slider-container {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box;
        }
        .ultra-slider-container .swiper-button-prev,
        .ultra-slider-container .swiper-button-next {
          ${O}
          position: absolute;
          ${H?"\n            left: 50%;\n            transform: translateX(-50%);\n          ":"\n            top: 50%;\n            transform: translateY(-50%);\n          "}
          z-index: 10;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        .ultra-slider-container .swiper-button-prev {
          ${H?`\n            top: ${D};\n          `:`\n            left: ${D};\n          `}
        }
        .ultra-slider-container .swiper-button-next {
          ${H?`\n            bottom: ${j};\n            top: auto;\n          `:`\n            right: ${j};\n          `}
        }
        /* Hide disabled arrows when loop is off */
        .ultra-slider-container .swiper-button-disabled {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        /* CRITICAL: Completely hide Swiper's default arrow content */
        .ultra-slider-container .swiper-button-prev *:not(ha-icon):not(ha-icon *),
        .ultra-slider-container .swiper-button-next *:not(ha-icon):not(ha-icon *) {
          display: none !important;
        }
        .ultra-slider-container .swiper-button-prev::before,
        .ultra-slider-container .swiper-button-prev::after,
        .ultra-slider-container .swiper-button-next::before,
        .ultra-slider-container .swiper-button-next::after {
          content: none !important;
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }
        /* Ensure ONLY our ha-icon is visible */
        .ultra-slider-container .swiper-button-prev ha-icon,
        .ultra-slider-container .swiper-button-next ha-icon {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          pointer-events: none;
          width: 100%;
          height: 100%;
        }
        /* Reset any Swiper default styling on navigation buttons */
        .ultra-slider-container .swiper-button-prev,
        .ultra-slider-container .swiper-button-next {
          font-family: inherit !important;
          font-size: inherit !important;
        }
        /* Show arrows on hover when not disabled */
        .ultra-slider-container:hover .swiper-button-prev:not(.swiper-button-disabled),
        .ultra-slider-container:hover .swiper-button-next:not(.swiper-button-disabled) {
          opacity: 1 !important;
        }
        .ultra-slider-container .swiper-button-prev:not(.swiper-button-disabled):hover,
        .ultra-slider-container .swiper-button-next:not(.swiper-button-disabled):hover {
          ${H?"\n            transform: translateX(-50%) scale(1.1) !important;\n          ":"\n            transform: translateY(-50%) scale(1.1) !important;\n          "}
        }
        /* CRITICAL: Completely hide disabled arrows */
        .ultra-slider-container .swiper-button-disabled,
        .ultra-slider-container .swiper-button-prev.swiper-button-disabled,
        .ultra-slider-container .swiper-button-next.swiper-button-disabled {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        /* Override any hover states for disabled arrows */
        .ultra-slider-container:hover .swiper-button-disabled,
        .ultra-slider-container:hover .swiper-button-prev.swiper-button-disabled,
        .ultra-slider-container:hover .swiper-button-next.swiper-button-disabled {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        /* Custom pagination styling */
        .ultra-slider-container .swiper-pagination {
          position: ${H||V||null!==(x=z.auto_height)&&void 0!==x&&!x?"absolute":"relative"};
          z-index: ${Z};
          pointer-events: all;
          ${!H||"left"!==B&&"right"!==B?H?"\n                right: 10px;\n                top: 50%;\n                transform: translateY(-50%);\n                width: auto;\n                height: auto;\n                flex-direction: column;\n              ":V||null!==(_=z.auto_height)&&void 0!==_&&!_?"\n                bottom: 10px;\n                left: 50%;\n                transform: translateX(-50%);\n                width: auto;\n                height: auto;\n                pointer-events: all;\n              ":"\n                display: flex;\n                justify-content: center;\n                align-items: center;\n              ":""}
        }
        ${G?`\n        .ultra-slider-container .slider-pagination-row {\n          display: flex;\n          justify-content: center;\n          align-items: center;\n          width: 100%;\n          gap: 8px;\n        }\n        .ultra-slider-container .slider-pagination-row[data-position='bottom'] {\n          margin-top: ${J}px;\n        }\n        .ultra-slider-container .slider-pagination-row[data-position='top'] {\n          margin-bottom: ${K}px;\n        }\n        .ultra-slider-container .slider-pagination-row .swiper-pagination,\n        .ultra-slider-container .slider-pagination-row .swiper-scrollbar {\n          position: relative !important;\n          transform: none !important;\n          left: auto !important;\n          right: auto !important;\n          top: auto !important;\n          bottom: auto !important;\n          width: 100%;\n          margin: 0;\n          display: flex;\n          justify-content: center;\n          align-items: center;\n        }\n        .ultra-slider-container .slider-pagination-row .swiper-scrollbar {\n          height: 8px;\n          background: ${z.pagination_color||"rgba(0, 0, 0, 0.1)"};\n          border-radius: 4px;\n        }\n        .ultra-slider-container .slider-pagination-row .swiper-scrollbar .swiper-scrollbar-drag {\n          background: ${z.pagination_active_color||"var(--primary-color)"};\n          border-radius: 4px;\n        }\n        `:""}
        /* Ensure pagination is visible when positioned on left/right (vertical sliders only) */
        ${!H||"left"!==B&&"right"!==B?"":"\n        /* Remove wrapper margin - padding handles spacing */\n        "}
        .ultra-slider-container .swiper-pagination-bullet {
          width: ${z.pagination_size||12}px;
          height: ${z.pagination_size||12}px;
          background: ${z.pagination_color||"var(--primary-text-color)"};
          opacity: 0.5;
          margin: ${H?"4px 0":"0 4px"};
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.3s;
          pointer-events: all;
          display: inline-block;
        }
        .ultra-slider-container .swiper-pagination-bullet-active {
          background: ${z.pagination_active_color||"var(--primary-color)"};
          opacity: 1;
          transform: scale(1.2);
        }
        /* Dynamic pagination styling - centered with tapering bullets */
        /* Note: These styles apply to ALL dynamic pagination, but will be overridden by conditional styles below */
        .ultra-slider-container .swiper-pagination-bullets-dynamic {
          overflow: hidden;
        }
        /* Custom styling for numbers pagination - only when using numbers style */
        ${"numbers"===z.pagination_style?`\n        .ultra-slider-container .swiper-pagination-bullet {\n          border: 2px solid ${z.pagination_color||"var(--primary-text-color)"};\n          background: transparent;\n          color: ${z.pagination_color||"var(--primary-text-color)"};\n        }\n        .ultra-slider-container .swiper-pagination-bullet-active {\n          border: 2px solid ${z.pagination_active_color||"var(--primary-color)"};\n          background: ${z.pagination_active_color||"var(--primary-color)"};\n          color: white;\n        }\n        `:""}
        /* Dots and Dash pagination styling */
        ${"dots-and-dash"===z.pagination_style?`\n        .ultra-slider-container .swiper-pagination-bullet {\n          width: ${z.pagination_size||12}px;\n          height: ${z.pagination_size||12}px;\n          background: ${z.pagination_color||"var(--primary-text-color)"};\n          opacity: 0.5;\n          margin: ${H?"4px 0":"0 4px"};\n          cursor: pointer;\n          border-radius: 50%;\n          transition: all 0.3s;\n        }\n        .ultra-slider-container .swiper-pagination-bullet-active {\n          width: ${2*(z.pagination_size||12)}px;\n          height: ${z.pagination_size||12}px;\n          background: ${z.pagination_active_color||"var(--primary-color)"};\n          opacity: 1;\n          border-radius: ${3*(z.pagination_size||12)/4}px;\n          transform: scale(1);\n        }\n        `:""}
        /* Dash Lines pagination styling */
        ${"dash-lines"===z.pagination_style?`\n        .ultra-slider-container .swiper-pagination-bullet {\n          width: ${2*(z.pagination_size||12)}px;\n          height: ${(z.pagination_size||12)/2}px;\n          background: ${z.pagination_color||"var(--primary-text-color)"};\n          opacity: 0.5;\n          margin: ${H?"4px 0":"0 4px"};\n          cursor: pointer;\n          border-radius: ${(z.pagination_size||12)/4}px;\n          transition: all 0.3s;\n        }\n        .ultra-slider-container .swiper-pagination-bullet-active {\n          width: ${2.5*(z.pagination_size||12)}px;\n          height: ${(z.pagination_size||12)/2}px;\n          background: ${z.pagination_active_color||"var(--primary-color)"};\n          opacity: 1;\n          border-radius: ${(z.pagination_size||12)/4}px;\n          transform: scale(1);\n        }\n        `:""}
        /* Dynamic pagination styling - active is largest, adjacent bullets are medium, outer bullets are smallest */
        /* Size progression: smallest (outer) -> medium (adjacent) -> largest (active) -> medium (adjacent) -> smallest (outer) */
        ${"dynamic"===z.pagination_style?`\n        .ultra-slider-container .swiper-pagination-bullets-dynamic {\n          overflow: visible !important;\n          width: auto !important;\n          text-align: center !important;\n          display: inline-block !important;\n          ${!H||"left"!==z.pagination_position&&"right"!==z.pagination_position?"\n              left: 50% !important;\n              transform: translateX(-50%) !important;\n              position: relative !important;\n            ":"\n              left: auto !important;\n              transform: none !important;\n              position: relative !important;\n            "}\n        }\n        /* Base style for all dynamic bullets - smallest size (outer bullets, 2 steps away) */\n        .ultra-slider-container .swiper-pagination-bullets-dynamic .swiper-pagination-bullet {\n          opacity: 0.4 !important;\n          transition: all 0.3s ease !important;\n          transform-origin: center center !important;\n          transform: scale(0.6) !important;\n          width: ${z.pagination_size||12}px !important;\n          height: ${z.pagination_size||12}px !important;\n        }\n        /* Override Swiper's default active bullet styles */\n        .ultra-slider-container .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active {\n          transform: scale(0.6) !important;\n          opacity: 0.4 !important;\n        }\n        /* Explicitly set outer bullets (2 steps away) to smallest size */\n        .ultra-slider-container .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-prev-prev,\n        .ultra-slider-container .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-next-next {\n          transform: scale(0.6) !important;\n          opacity: 0.4 !important;\n          width: ${z.pagination_size||12}px !important;\n          height: ${z.pagination_size||12}px !important;\n        }\n        /* Medium size (1 step away from active) - adjacent bullets */\n        .ultra-slider-container .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-prev,\n        .ultra-slider-container .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-next {\n          transform: scale(1) !important;\n          opacity: 0.7 !important;\n          width: ${z.pagination_size||12}px !important;\n          height: ${z.pagination_size||12}px !important;\n        }\n        /* Largest size (active bullet) - must be last to override everything */\n        .ultra-slider-container .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-main,\n        .ultra-slider-container .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-main.swiper-pagination-bullet-active {\n          transform: scale(1.3) !important;\n          opacity: 1 !important;\n          width: ${z.pagination_size||12}px !important;\n          height: ${z.pagination_size||12}px !important;\n        }\n        /* Ensure regular active bullets (without active-main class) don't get wrong scale */\n        .ultra-slider-container .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active:not(.swiper-pagination-bullet-active-main):not(.swiper-pagination-bullet-active-prev):not(.swiper-pagination-bullet-active-next) {\n          transform: scale(0.6) !important;\n        }\n        `:""}
        .ultra-slider-container .swiper-pagination-fraction {
          font-size: ${(z.pagination_size||12)+4}px;
          font-weight: 600;
          color: ${z.pagination_active_color||"var(--primary-color)"};
        }
        .ultra-slider-container .swiper-pagination-progressbar {
          position: absolute;
          ${H?"\n            width: 4px;\n            height: 100%;\n            top: 0;\n            left: auto;\n            right: 0;\n          ":`\n            height: ${(z.pagination_size||12)/2}px;\n            width: 100%;\n            bottom: 0;\n            top: auto;\n          `}
          background: ${z.pagination_color||"rgba(0, 0, 0, 0.2)"};
          border-radius: ${(z.pagination_size||12)/4}px;
        }
        .ultra-slider-container .swiper-pagination-progressbar .swiper-pagination-progressbar-fill {
          background: ${z.pagination_active_color||"var(--primary-color)"};
          ${H?"\n            width: 100%;\n            height: 0%;\n            top: 0;\n            left: 0;\n          ":"\n            width: 0%;\n            height: 100%;\n            top: 0;\n            left: 0;\n          "}
        }
        /* Custom pagination styling */
        .ultra-slider-container .swiper-pagination {
          position: ${H||V||null!==($=z.auto_height)&&void 0!==$&&!$?"absolute":"relative"};
          z-index: ${Z};
          pointer-events: all;
          ${H?"\n            right: 10px;\n            top: 50%;\n            transform: translateY(-50%);\n            width: auto;\n            height: auto;\n            flex-direction: column;\n          ":V||null!==(S=z.auto_height)&&void 0!==S&&!S?`\n            bottom: 10px;\n            left: 50%;\n            transform: translateX(-50%);\n            width: auto;\n            height: auto;\n            z-index: ${Z};\n            pointer-events: all;\n          `:"\n                display: flex;\n                justify-content: center;\n                align-items: center;\n          "}
        }
        /* Pagination position overrides - must come after base styles */
        .ultra-slider-container .swiper-pagination.pagination-top {
          top: 10px !important;
          bottom: auto !important;
          left: 50% !important;
          right: auto !important;
          transform: translateX(-50%) !important;
          position: absolute !important;
          ${H?"left: auto !important; right: 10px !important; top: 0 !important; transform: translateY(0) !important;":""}
        }
        /* Left and Right pagination for vertical sliders - rotated to match top/bottom styling */
        ${H?`\n        .ultra-slider-container .swiper-pagination.pagination-left {\n          left: 0 !important;\n          right: auto !important;\n          top: 50% !important;\n          bottom: auto !important;\n          transform: translateY(-50%) rotate(90deg) !important;\n          transform-origin: center center !important;\n          position: absolute !important;\n          width: auto !important;\n          height: auto !important;\n          display: flex !important;\n          flex-direction: row !important;\n          align-items: center !important;\n          z-index: ${Z} !important;\n          padding-left: 10px;\n        }\n        .ultra-slider-container .swiper-pagination.pagination-left .swiper-pagination-bullet {\n          margin: 0 4px !important;\n          transform-origin: center center !important;\n        }\n        .ultra-slider-container .swiper-pagination.pagination-left .swiper-pagination-bullets-dynamic {\n          transform: none !important; /* Remove rotation from dynamic container, let parent handle it */\n        }\n        .ultra-slider-container .swiper-pagination.pagination-right {\n          left: auto !important;\n          right: 0 !important;\n          top: 50% !important;\n          bottom: auto !important;\n          transform: translateY(-50%) rotate(-90deg) !important;\n          transform-origin: center center !important;\n          position: absolute !important;\n          width: auto !important;\n          height: auto !important;\n          display: flex !important;\n          flex-direction: row !important;\n          align-items: center !important;\n          z-index: ${Z} !important;\n          padding-right: 10px;\n        }\n        .ultra-slider-container .swiper-pagination.pagination-right .swiper-pagination-bullet {\n          margin: 0 4px !important;\n          transform-origin: center center !important;\n        }\n        .ultra-slider-container .swiper-pagination.pagination-right .swiper-pagination-bullets-dynamic {\n          transform: none !important; /* Remove rotation from dynamic container, let parent handle it */\n        }\n        `:""}
        .ultra-slider-container .swiper-pagination.pagination-bottom {
          top: auto !important;
          bottom: 10px !important;
          left: 50% !important;
          right: auto !important;
          transform: translateX(-50%) !important;
          position: absolute !important;
          z-index: ${Z} !important;
          ${H?"left: auto !important; right: 10px !important; top: auto !important; bottom: 0 !important; transform: translateY(0) !important;":""}
        }
        /* Scrollbar styling */
        .ultra-slider-container .swiper-scrollbar {
          position: absolute;
          ${H?"\n            width: 8px;\n            height: 100%;\n            right: 0;\n            top: 0;\n            left: auto;\n          ":"\n            width: 100%;\n            height: 8px;\n            bottom: 0;\n            top: auto;\n          "}
          background: ${z.pagination_color||"rgba(0, 0, 0, 0.1)"};
          border-radius: 4px;
          z-index: ${Z};
        }
        .ultra-slider-container .swiper-scrollbar-drag {
          background: ${z.pagination_active_color||"var(--primary-color)"};
          border-radius: 4px;
          ${H?"\n            width: 100%;\n          ":"\n            height: 100%;\n          "}
        }
        /* ===== EFFECT-SPECIFIC CSS ===== */
        /* FADE EFFECT: Swiper uses absolute positioning and opacity */
        /* Note: Swiper adds .swiper-fade class to the .swiper element, not the container */
        ${"fade"===tt?`\n        .ultra-slider-container .swiper.swiper-fade .swiper-wrapper {\n          position: relative;\n          width: 100%;\n          height: 100%;\n        }\n        .ultra-slider-container .swiper.swiper-fade .swiper-slide {\n          position: absolute !important;\n          top: 0 !important;\n          left: 0 !important;\n          width: 100% !important;\n          height: 100% !important;\n          opacity: 0 !important;\n          transition: opacity ${z.transition_speed||300}ms ease !important;\n          pointer-events: none;\n          z-index: 1;\n        }\n        .ultra-slider-container .swiper.swiper-fade .swiper-slide-active {\n          opacity: 1 !important;\n          pointer-events: auto;\n          z-index: 2;\n        }\n        /* Ensure slide content fills the slide for fade effect */\n        .ultra-slider-container .swiper.swiper-fade .slide-content {\n          height: 100%;\n        }\n        `:""}
      </style>

      <div class="ultra-slider-container uc-module-container" data-slider-id="${T}">
        ${G&&"top"===B?Q():""}
        <div
          class="swiper ${F}"
          data-preview-context="${r||"dashboard"}"
          ${(0,o.K)((t=>{if(!(t&&t instanceof HTMLElement))return;const e=t.getAttribute("data-preview-context")||"dashboard",i=t.hasAttribute("data-swiper-initialized"),n=t.getAttribute("data-swiper-init-context"),o=JSON.stringify({pagination_style:z.pagination_style,show_pagination:z.show_pagination,slider_direction:z.slider_direction,transition_effect:z.transition_effect,centered_slides:z.centered_slides}),r=t.getAttribute("data-config-hash"),a=r&&r!==o;if(i&&n===e&&!a&&t.swiper)return;if(i&&(n!==e||a)){const e=t.swiper;e&&(e.destroy(!0,!0),delete t.swiper),h.destroyInstance(T),t.removeAttribute("data-swiper-init-context")}t.setAttribute("data-swiper-initialized","true"),t.setAttribute("data-config-hash",o);const l=window[`initSwiper_${T}`];if(l)if("ha-preview"===e||"live"===e){const i="live"===e,n=i?2:1,o=i?40:30,r=(i=1)=>{const a=t.querySelectorAll(".swiper-slide").length,s=t.offsetWidth,d=t.offsetHeight;if(a>0&&(s>0||d>0))l(t);else if(i<o){const t=Math.min(100*i*n,1e3);setTimeout((()=>r(i+1)),t)}else console.error("[Slider] Failed to initialize after max attempts:",{sliderId:T,context:e,slideCount:a,containerWidth:s,containerHeight:d}),t.removeAttribute("data-swiper-initialized")};setTimeout((()=>r(1)),i?300:100)}else l(t);else console.error("[Slider] Initialization function not found for:",T,"context:",e)}))}
        >
          <div class="swiper-wrapper">
            ${C.map((t=>n.qy`
                <div class="swiper-slide">
                  <div class="slide-content">
                    ${t.map((t=>{const o=k.getModule(t.type);if(!o)return n.qy`<div>Unknown module type: ${t.type}</div>`;if(!d.S.evaluateModuleVisibility(t))return"";const a=null==t?void 0:t.type;return"horizontal"===a||"vertical"===a||"slider"===a?n.qy`
                          <div class="child-module-wrapper" style="width: 100%;">
                            ${o.renderPreview(t,e,i,r)}
                          </div>
                        `:n.qy`
                        <div class="child-module-wrapper" style="width: 100%;">
                          ${o.renderPreview(t,e,i,r)}
                        </div>
                      `}))}
                  </div>
                </div>
              `))}
          </div>

          ${z.show_pagination&&(V||H)?X?n.qy`
                  <div
                    class="swiper-scrollbar"
                    data-slider-id="${T}"
                  ></div>
                `:n.qy`
                  <div
                    class="swiper-pagination pagination-${B}"
                    data-slider-id="${T}"
                  ></div>
                `:""}
          ${z.show_arrows?n.qy`
                <div class="swiper-button-prev">
                  <ha-icon
                    icon="${(()=>{const t=z.prev_arrow_icon||"mdi:chevron-left";return H?"mdi:chevron-left"===t?"mdi:chevron-up":t:"mdi:chevron-up"===t?"mdi:chevron-left":t})()}"
                  ></ha-icon>
                </div>
                <div class="swiper-button-next">
                  <ha-icon
                    icon="${(()=>{const t=z.next_arrow_icon||"mdi:chevron-right";return H?"mdi:chevron-right"===t?"mdi:chevron-down":t:"mdi:chevron-down"===t?"mdi:chevron-right":t})()}"
                  ></ha-icon>
                </div>
              `:""}
        </div>
        ${G&&"top"!==B?Q():""}
      </div>
    `}mapConfigToSwiper(t,e,i){var n,o,r,a,l;const s=t.slides_per_view||1,d=null!==(n=t.space_between)&&void 0!==n?n:t.gap||0;let p="horizontal";"vertical"===t.slider_direction&&(p="vertical");let c="slide",g={};"fade"===(t.transition_effect||"slide")?(c="fade",g={fadeEffect:{crossFade:!0}}):(c="slide","vertical"===t.slider_direction&&(p="vertical"));const h="fade"===c?1:s;let u=!1,v=!1;if(t.show_pagination){const e=`.swiper-pagination[data-slider-id="${i}"]`,n=`.swiper-scrollbar[data-slider-id="${i}"]`,o=t.pagination_style||"dots";"scrollbar"===o?v={el:n,draggable:!0}:(u={el:e,clickable:!0},"dots"===o||"dots-and-dash"===o||"dash-lines"===o?u.type="bullets":"numbers"===o?(u.type="bullets",u.renderBullet=(e,i)=>{const n=t.pagination_size||12,o=t.pagination_color||"var(--primary-text-color)",r=t.pagination_active_color||"var(--primary-color)",a=i.includes("active")?"white":o,l=i.includes("active")?r:"transparent";return`<div class="${i}" style="\n              min-width: ${2.5*n}px !important;\n              height: ${2.5*n}px !important;\n              display: inline-flex !important;\n              align-items: center !important;\n              justify-content: center !important;\n              border-radius: 4px !important;\n              font-size: ${n+2}px !important;\n              line-height: 1 !important;\n              margin: 0 4px !important;\n              padding: 4px !important;\n              border: 2px solid ${o} !important;\n              background: ${l} !important;\n              color: ${a} !important;\n              opacity: 1 !important;\n              cursor: pointer !important;\n              font-weight: 600 !important;\n            ">${e+1}</div>`}):"fraction"===o?u.type="fraction":"progressbar"===o?u.type="progressbar":"dynamic"===o&&(u.type="bullets",u.dynamicBullets=!1,u.hideOnClick=!1))}const m=!!t.show_arrows&&{nextEl:".swiper-button-next",prevEl:".swiper-button-prev"};let w=!1;t.auto_play&&(w={delay:t.auto_play_delay||3e3,disableOnInteraction:!1,pauseOnMouseEnter:null===(o=t.pause_on_hover)||void 0===o||o});const y=null===(r=t.loop)||void 0===r||r,b=y&&e>=2&&"slide"===c,f=!b&&y,x=t.transition_speed||300,_=Object.assign(Object.assign({direction:p,effect:c},g),{slidesPerView:h,slidesPerGroup:1,spaceBetween:d,loop:b,rewind:f,speed:x,pagination:u,scrollbar:v,navigation:m,autoplay:w,keyboard:!!t.allow_keyboard&&{enabled:!0,onlyInViewport:!0},mousewheel:!!t.allow_mousewheel&&{enabled:!0,forceToAxis:!0},allowTouchMove:null===(a=t.allow_swipe)||void 0===a||a,autoHeight:!1,centeredSlides:(null===(l=t.centered_slides)||void 0===l||l)&&h>1,observer:!0,observeParents:!0,observeSlideChildren:!0,preventClicks:!1,preventClicksPropagation:!1,touchStartPreventDefault:!1,passiveListeners:!0,noSwiping:!0,noSwipingClass:"swiper-no-swiping",noSwipingSelector:'button, a, input, select, textarea, .popup-trigger, [role="button"]',touchEventsTarget:"wrapper"});return b&&(_.watchSlidesProgress=!0),_}validate(t){const e=t,i=[...super.validate(t).errors];return e.modules||i.push("Slider must have a modules array"),!1===e.auto_height&&e.slider_height&&(e.slider_height<50||e.slider_height>1e3)&&i.push("Slider height must be between 50 and 1000 pixels"),e.slides_per_view&&(e.slides_per_view<1||e.slides_per_view>5)&&i.push("Slides per view must be between 1 and 5"),{valid:0===i.length,errors:i}}getStyles(){return`${r.m.getSliderStyles()}`}}}}]);