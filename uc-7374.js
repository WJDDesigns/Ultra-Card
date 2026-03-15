"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[7374],{7374:(e,a,r)=>{r.r(a),r.d(a,{UltraPageBreakModule:()=>i});var t=r(5183),n=r(7475);class i extends n.m{constructor(){super(...arguments),this.metadata={type:"pagebreak",title:"Page Break",description:"Separates slider content into pages",author:"WJD Designs",version:"1.0.0",icon:"mdi:format-page-break",category:"layout",tags:["slider","page","break","separator","divider"]}}createDefault(e,a){return{id:e||this.generateId("pagebreak"),type:"pagebreak",display_mode:"always",display_conditions:[]}}renderGeneralTab(e,a,r,n){var i;return null===(i=null==a?void 0:a.locale)||void 0===i||i.language,t.qy`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        <!-- Info Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <ha-icon
              icon="mdi:information"
              style="color: var(--info-color); margin-top: 2px; flex-shrink: 0; font-size: 24px;"
            ></ha-icon>
            <div style="font-size: 14px; line-height: 1.5; color: var(--primary-text-color);">
              <strong>How Page Breaks Work:</strong><br />
              Page breaks are only visible in the editor. When used inside a Slider Layout, they
              separate content into different slides. All modules before a page break belong to one
              page, and modules after it belong to the next page.
            </div>
          </div>
        </div>
      </div>
    `}renderPreview(e,a,r,n){return t.qy``}validate(e){return super.validate(e)}getStyles(){return"\n      .pagebreak-module-container {\n        user-select: none;\n      }\n    "}}}}]);