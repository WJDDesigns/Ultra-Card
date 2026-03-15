"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[1035],{1035:(e,o,t)=>{t.r(o),t.d(o,{UltraVideoBgModule:()=>d});var i=t(5183),r=t(7475),a=t(8938),n=t(378);t(7921);class d extends r.m{constructor(){super(...arguments),this.metadata={type:"video_bg",title:"Video Background",description:"Add dynamic, conditional video backgrounds to your dashboard view.",author:"WJD Designs",version:"1.0.0",icon:"mdi:video-box",category:"media",tags:["video","background","pro","youtube","vimeo","dynamic","conditional"]}}createDefault(e,o){return{id:e||this.generateId("video_bg"),type:"video_bg",enabled:!0,editor_only:!0,controller_id:void 0,pause_when_hidden:!0,respect_reduced_motion:!0,enable_on_mobile:!0,opacity:100,blur:"0px",brightness:"100%",scale:1,default_source:"youtube",default_video_url:"",default_loop:!0,default_muted:!0,default_start_time:0,rules:[],global_card_transparency:{enabled:!1,opacity:90,blur_px:0,color:void 0},display_mode:"always",display_conditions:[]}}renderGeneralTab(e,o,t,r){var a,d,l,s,c;const p=e,u=(null===(a=null==o?void 0:o.locale)||void 0===a?void 0:a.language)||"en",v=n.x.checkIntegrationAuth(o);return"pro"===(null===(d=null==v?void 0:v.subscription)||void 0===d?void 0:d.tier)&&"active"===(null===(l=null==v?void 0:v.subscription)||void 0===l?void 0:l.status)?i.qy`
      <div class="uc-video-bg-settings">
        ${this.injectUcFormStyles()}

        <!-- Module Info -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <ha-icon
              icon="mdi:video-box"
              style="color: var(--primary-color); --mdi-icon-size: 32px;"
            ></ha-icon>
            <div>
              <div style="font-size: 18px; font-weight: 700;">Video Background (Pro)</div>
              <div style="font-size: 12px; color: var(--secondary-text-color);">
                View-wide dynamic video backgrounds with conditional logic
              </div>
            </div>
          </div>

          <div
            style="padding: 12px; background: rgba(var(--rgb-info-color), 0.1); border-radius: 6px; border-left: 4px solid var(--info-color);"
          >
            <div style="font-size: 13px; line-height: 1.5;">
              <strong>Note:</strong> This module controls the video background for the entire view.
              It will not display as a visible card in the dashboard. Only the topmost enabled
              module with passing logic conditions will render.
            </div>
          </div>
        </div>

        <!-- Core Settings -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
          >
            CORE SETTINGS
          </div>

          <div style="margin-bottom: 16px;">
            <div
              style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;"
            >
              <div style="font-size: 16px; font-weight: 600;">Enable Video Background</div>
              ${this.renderUcForm(o,{enabled:p.enabled},[this.booleanField("enabled")],(e=>r(e.detail.value)),!1)}
            </div>
            <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
              Turn the video background on or off
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <div
              style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;"
            >
              <div style="font-size: 16px; font-weight: 600;">Editor Only</div>
              ${this.renderUcForm(o,{editor_only:p.editor_only},[this.booleanField("editor_only")],(e=>r(e.detail.value)),!1)}
            </div>
            <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
              If enabled, the background will only be visible when NOT in edit mode
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <div
              style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;"
            >
              <div style="font-size: 16px; font-weight: 600;">Enable on Mobile</div>
              ${this.renderUcForm(o,{enable_on_mobile:p.enable_on_mobile},[this.booleanField("enable_on_mobile")],(e=>r(e.detail.value)),!1)}
            </div>
            <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
              Enable video backgrounds on mobile devices (may impact performance)
            </div>
          </div>
        </div>

        <!-- Default Video Source -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
          >
            DEFAULT VIDEO SOURCE
          </div>

          ${this.renderFieldSection("Video Source Type","Choose the type of video source.",o,{default_source:p.default_source},[this.selectField("default_source",[{value:"youtube",label:"YouTube"},{value:"vimeo",label:"Vimeo"},{value:"url",label:"Direct URL"},{value:"local",label:"Local File"}])],(e=>r(e.detail.value)))}
          <div style="margin-bottom: 16px;">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
              ${"youtube"===p.default_source?"YouTube Video URL or ID":"vimeo"===p.default_source?"Vimeo Video URL or ID":"Video URL"}
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
            >
              ${"youtube"===p.default_source?"Enter YouTube video URL or video ID (e.g., dQw4w9WgXcQ).":"vimeo"===p.default_source?"Enter Vimeo video URL or video ID (e.g., 123456789).":"Enter the full URL to your video file."}
            </div>
            <ha-textfield
              .value=${p.default_video_url||""}
              placeholder=${"youtube"===p.default_source?"dQw4w9WgXcQ or https://youtube.com/watch?v=...":"vimeo"===p.default_source?"123456789 or https://vimeo.com/...":"https://example.com/video.mp4"}
              @input=${e=>{var o;const t=e.target,i=(null===(o=t.shadowRoot)||void 0===o?void 0:o.querySelector("input"))||t,a=t.value,n=i.selectionStart,d=i.selectionEnd;r({default_video_url:a}),requestAnimationFrame((()=>{i&&"number"==typeof n&&(t.value=a,i.value=a,i.setSelectionRange(n,d||n))})),setTimeout((()=>{i&&"number"==typeof n&&(t.value=a,i.value=a,i.setSelectionRange(n,d||n))}),0),setTimeout((()=>{i&&"number"==typeof n&&(t.value=a,i.value=a,i.setSelectionRange(n,d||n))}),10)}}
              style="width: 100%; --mdc-theme-primary: var(--primary-color);"
            ></ha-textfield>
          </div>
          <div style="margin-bottom: 16px;">
            <div
              style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;"
            >
              <div style="font-size: 16px; font-weight: 600;">Loop Video</div>
              ${this.renderUcForm(o,{default_loop:p.default_loop},[this.booleanField("default_loop")],(e=>r(e.detail.value)),!1)}
            </div>
            <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
              Automatically restart the video when it ends
            </div>
          </div>
          ${"youtube"===p.default_source||"local"===p.default_source?this.renderSliderField("Start Time","Start playback from this time offset.",null!==(s=p.default_start_time)&&void 0!==s?s:0,0,0,3600,1,(e=>r({default_start_time:e})),"s"):""}
        </div>

        <!-- Visual Filters -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
          >
            VISUAL FILTERS
          </div>

          ${this.renderSliderField("Opacity","Control the overall transparency of the video background.",null!==(c=p.opacity)&&void 0!==c?c:100,100,0,100,1,(e=>r({opacity:e})),"%")}
          ${this.renderSliderField("Blur","Apply a blur effect to the video background.",parseInt(p.blur)||0,0,0,30,1,(e=>r({blur:`${e}px`})),"px")}
          ${this.renderSliderField("Brightness","Adjust the brightness of the video background.",parseInt(p.brightness)||100,100,0,200,5,(e=>r({brightness:`${e}%`})),"%")}
          ${this.renderSliderField("Scale","Adjust the size of the video background. Use this to crop or zoom videos with different aspect ratios.",100*p.scale,100,50,200,5,(e=>r({scale:e/100})),"%")}
        </div>

        <!-- Performance Settings -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
          >
            PERFORMANCE & ACCESSIBILITY
          </div>

          <div style="margin-bottom: 16px;">
            <div
              style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;"
            >
              <div style="font-size: 16px; font-weight: 600;">Pause When Hidden</div>
              ${this.renderUcForm(o,{pause_when_hidden:p.pause_when_hidden},[this.booleanField("pause_when_hidden")],(e=>r(e.detail.value)),!1)}
            </div>
            <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
              Automatically pause video when the tab is hidden to save resources
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <div
              style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;"
            >
              <div style="font-size: 16px; font-weight: 600;">Respect Reduced Motion</div>
              ${this.renderUcForm(o,{respect_reduced_motion:p.respect_reduced_motion},[this.booleanField("respect_reduced_motion")],(e=>r(e.detail.value)),!1)}
            </div>
            <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
              Disable video playback for users who prefer reduced motion
            </div>
          </div>
        </div>

        <!-- Global Card Transparency -->
        ${this.renderGlobalTransparencySection(p,o,r)}
      </div>
    `:this.renderProLockUI(u)}renderVideoPreview(e){const{default_source:o,default_video_url:t,opacity:r,blur:a,brightness:n}=e;if(!t)return i.qy`<div
        style="text-align: center; padding: 24px; color: var(--secondary-text-color);"
      >
        No video URL configured
      </div>`;let d="",l="";if("youtube"===o){const e=t.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/)|youtu\.be\/)([^&\n?#]+)/);d=e?e[1]:t,l=`https://www.youtube.com/embed/${d}?autoplay=0&mute=1&controls=1&modestbranding=1&rel=0&playsinline=1`}else if("vimeo"===o){const e=t.match(/vimeo\.com\/(\d+)/);d=e?e[1]:t,l=`https://player.vimeo.com/video/${d}?muted=1&controls=1&background=0`}const s=[];a&&"0px"!==a&&s.push(`blur(${a})`),n&&"100%"!==n&&s.push(`brightness(${n})`);const c=s.length>0?`filter: ${s.join(" ")};`:"",p=`opacity: ${r/100};`;return"youtube"===o||"vimeo"===o?i.qy`
        <div
          style="position: relative; width: 100%; height: 300px; background: #000; border-radius: 8px; overflow: hidden; ${c} ${p}"
        >
          <iframe
            src="${l}"
            style="width: 100%; height: 100%; border: none;"
            frameborder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen
            @error=${e=>{const o=e.target;console.warn("YouTube iframe error detected, reloading..."),setTimeout((()=>{const e=o.src;o.src="",setTimeout((()=>{o.src=e}),100)}),500)}}
          ></iframe>
        </div>
      `:i.qy`
        <div
          style="position: relative; width: 100%; height: 300px; background: #000; border-radius: 8px; overflow: hidden; ${c} ${p}"
        >
          <video
            src="${t}"
            style="width: 100%; height: 100%; object-fit: cover;"
            controls
            muted
            loop
          ></video>
        </div>
      `}renderGlobalTransparencySection(e,o,t){var r,a;const n=e.global_card_transparency;return i.qy`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px;"
        >
          GLOBAL CARD TRANSPARENCY
        </div>

        <div
          style="padding: 12px; background: rgba(var(--rgb-info-color), 0.1); border-radius: 6px; border-left: 4px solid var(--info-color); margin-bottom: 16px;"
        >
          <div style="font-size: 13px; line-height: 1.5;">
            Applies a consistent transparency overlay to all Ultra Cards in this view for improved
            readability against video backgrounds. When disabled, cards follow their native styling.
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;"
          >
            <div style="font-size: 16px; font-weight: 600; white-space: nowrap;">
              Enable Global Card Transparency
            </div>
            ${this.renderUcForm(o,{enabled:n.enabled},[this.booleanField("enabled")],(e=>{t({global_card_transparency:Object.assign(Object.assign({},n),{enabled:e.detail.value.enabled})})}),!1)}
          </div>
          <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
            Apply transparency effects to all Ultra Cards in the view
          </div>
        </div>
        ${n.enabled?i.qy`
              <div class="conditional-fields-group" style="margin-top: 16px;">
                <div class="conditional-fields-content">
                  ${this.renderSliderField("Card Opacity","Control the transparency of all Ultra Cards.",null!==(r=n.opacity)&&void 0!==r?r:90,90,0,100,1,(e=>{t({global_card_transparency:Object.assign(Object.assign({},n),{opacity:e})})}),"%")}
                  ${this.renderSliderField("Blur Amount","Apply backdrop blur to all Ultra Cards.",null!==(a=n.blur_px)&&void 0!==a?a:0,0,0,30,1,(e=>{t({global_card_transparency:Object.assign(Object.assign({},n),{blur_px:e})})}),"px")}

                  <div style="margin-top: 16px;">
                    <div
                      class="field-title"
                      style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                    >
                      Background Color Overlay
                    </div>
                    <div
                      class="field-description"
                      style="font-size: 12px; margin-bottom: 8px; color: var(--secondary-text-color);"
                    >
                      Optional: Add a color tint to all cards.
                    </div>
                    <ultra-color-picker
                      .hass=${o}
                      .value=${n.color||""}
                      .allowEmpty=${!0}
                      @value-changed=${e=>{t({global_card_transparency:Object.assign(Object.assign({},n),{color:e.detail.value})})}}
                    ></ultra-color-picker>
                  </div>
                </div>
              </div>
            `:""}
      </div>
    `}renderProLockUI(e){return i.qy`
      <div
        style="padding: 32px; text-align: center; background: var(--secondary-background-color); border-radius: 12px;"
      >
        <ha-icon
          icon="mdi:lock"
          style="color: var(--primary-color); --mdi-icon-size: 64px; margin-bottom: 16px;"
        ></ha-icon>
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">
          Ultra Card Pro Required
        </div>
        <div
          style="font-size: 14px; color: var(--secondary-text-color); margin-bottom: 24px; line-height: 1.6;"
        >
          Video Background is a Pro feature. Install and authenticate with Ultra Card Connect
          to unlock this module.
        </div>
        <a
          href="https://github.com/WJDDesigns/ultra-card-connect"
          target="_blank"
          style="display: inline-block; padding: 12px 24px; background: var(--primary-color); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;"
        >
          Get Ultra Card Connect
        </a>
      </div>
    `}renderOtherTab(e,o,t,i){return a.X.render(e,o,(e=>i(e)))}renderDesignTab(){return null}renderActionsTab(){return null}renderPreview(e,o,t,r){const a=e;return"live"===r?a.enabled&&a.default_video_url?this.renderVideoPreview(a):i.qy`
          <div
            style="padding: 24px; text-align: center; background: rgba(var(--rgb-primary-color), 0.1); border: 2px dashed var(--primary-color); border-radius: 8px;"
          >
            <ha-icon
              icon="mdi:video-box"
              style="color: var(--primary-color); --mdi-icon-size: 48px; margin-bottom: 8px;"
            ></ha-icon>
            <div style="font-weight: 600; color: var(--primary-color);">
              Video Background Module
            </div>
            <div style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;">
              ${a.enabled?"No video URL configured":"Disabled"}
            </div>
          </div>
        `:"ha-preview"===r||"dashboard"===r?i.qy`
        <div
          style="
            padding: 24px;
            text-align: center;
            background: rgba(var(--rgb-primary-color), 0.1);
            border: 2px dashed var(--primary-color);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
          "
          @mouseenter=${e=>{const o=e.currentTarget;o.style.background="rgba(var(--rgb-primary-color), 0.15)",o.style.borderColor="var(--primary-color)"}}
          @mouseleave=${e=>{const o=e.currentTarget;o.style.background="rgba(var(--rgb-primary-color), 0.1)",o.style.borderColor="var(--primary-color)"}}
        >
          <ha-icon
            icon="mdi:video-box"
            style="color: var(--primary-color); --mdi-icon-size: 48px; margin-bottom: 8px;"
          ></ha-icon>
          <div style="font-weight: 600; color: var(--primary-color); margin-bottom: 4px;">
            Video Background Module
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color); opacity: 0.8;">
            ${a.enabled?a.default_video_url?"Click to edit video background settings":"No video URL configured - click to add":"Disabled - click to enable"}
          </div>
        </div>
      `:i.qy``}getStyles(){return`\n      ${r.m.getSliderStyles()}\n\n      /* Conditional fields group styling */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n      }\n\n      .conditional-fields-group:hover {\n        background: rgba(var(--rgb-primary-color), 0.12);\n      }\n\n      .conditional-fields-header {\n        background: rgba(var(--rgb-primary-color), 0.15);\n        padding: 12px 16px;\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-color);\n        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n\n      .conditional-fields-content {\n        padding: 16px;\n      }\n\n      .conditional-fields-content > .field-title:first-child {\n        margin-top: 0 !important;\n      }\n\n      .conditional-fields-group {\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      @keyframes slideInFromLeft {\n        from {\n          opacity: 0;\n          transform: translateX(-10px);\n        }\n        to {\n          opacity: 1;\n          transform: translateX(0);\n        }\n      }\n    `}validate(e){var o;const t=e,i=[...super.validate(e).errors];return t.enabled&&!t.default_video_url&&i.push("Default video URL is required when module is enabled"),(t.opacity<0||t.opacity>100)&&i.push("Opacity must be between 0 and 100"),(null===(o=t.global_card_transparency)||void 0===o?void 0:o.enabled)&&(t.global_card_transparency.opacity<0||t.global_card_transparency.opacity>100)&&i.push("Global card transparency opacity must be between 0 and 100"),{valid:0===i.length,errors:i}}}}}]);