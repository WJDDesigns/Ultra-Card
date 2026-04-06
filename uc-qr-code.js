"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[8380],{8885:(e,o,t)=>{t.r(o),t.d(o,{UC_QR_DATA_READY_EVENT:()=>u,UltraQrCodeModule:()=>b});var r=t(5183),i=t(7283),n=t.n(i),l=t(7475),a=t(5147),d=t(8938),c=t(378),s=t(6478),g=t(5320),_=t(6990);t(7921);const u="uc-qr-data-ready",p=new Map,m=new Map,v=new Set;function y(e,o){var t;if(!e.logo_enabled)return"";const r=e.logo_image_type||"url";if("url"===r||"upload"===r){const t=e.logo_url||"";return t?o?(0,_.V)(o,t):t:""}if(!o)return"";const i=e.logo_image_entity;if(!i||!o.states[i])return"";const n=o.states[i];if("entity"===r){const e=null===(t=n.attributes)||void 0===t?void 0:t.entity_picture;return e?(0,_.V)(o,String(e)):n.state?(0,_.V)(o,n.state):""}if("attribute"===r){const t=e.logo_image_attribute||"";if(!t)return"";const r=t.split(".");let i=n.attributes;for(const e of r){if(null==i||"object"!=typeof i){i=void 0;break}i=i[e]}return null!=i?(0,_.V)(o,String(i)):""}return""}class b extends l.m{constructor(){super(...arguments),this.metadata={type:"qr_code",title:"QR Code",description:"Generate QR codes from URL, text, template, or entity state",author:"WJD Designs",version:"1.0.0",icon:"mdi:qrcode",category:"content",tags:["qr","qrcode","pro","premium","barcode"]}}createDefault(e,o){return{id:e||this.generateId("qr_code"),type:"qr_code",content_mode:"static",content_static:"https://www.home-assistant.io",size:200,alignment:"center",show_label:!1,label_text:"",label_below:!0,fg_color:"#000000",bg_color:"#ffffff",error_correction:"M",qr_margin:1,dot_style:"square",corner_square_style:"square",corner_dot_style:"square",logo_enabled:!1,logo_image_type:"url",logo_url:"",logo_image_entity:"",logo_image_attribute:"",logo_size:.25,logo_margin:2,logo_hide_bg_dots:!0,tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}renderActionsTab(e,o,t,r){return a.A.render(e,o,(e=>r(e)))}renderOtherTab(e,o,t,r){return d.X.render(e,o,(e=>r(e)))}renderGeneralTab(e,o,t,i){var n,a,d,g,_,u,v,y,b;const h=e,f=(null===(n=null==o?void 0:o.locale)||void 0===n?void 0:n.language)||"en",q=c.x.checkIntegrationAuth(o);return"pro"===(null===(a=null==q?void 0:q.subscription)||void 0===a?void 0:a.tier)&&"active"===(null===(d=null==q?void 0:q.subscription)||void 0===d?void 0:d.status)?r.qy`
      <style>
        ${this.injectUcFormStyles()} ${l.m.getSliderStyles()}

        /* Spacing between text and fields in QR code editor */
        .settings-section .form-field {
          margin-bottom: 16px;
        }
        .settings-section .form-label {
          display: block;
          margin-bottom: 8px;
        }
        .settings-section .form-description {
          margin-top: 8px;
          margin-bottom: 0;
          font-size: 13px;
          color: var(--secondary-text-color);
          line-height: 1.4;
        }
        .settings-section .field-container .field-title {
          margin-bottom: 6px;
        }
        .settings-section .field-container .field-description {
          margin-bottom: 10px;
        }
      </style>

      <!-- Content source -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
        >
          ${(0,s.kg)("editor.qr_code.content_title",f,"CONTENT")}
        </div>
        ${this.renderSelect((0,s.kg)("editor.qr_code.content_mode",f,"Source"),h.content_mode||"static",[{value:"static",label:(0,s.kg)("editor.qr_code.static",f,"Static URL / Text")},{value:"template",label:(0,s.kg)("editor.qr_code.template",f,"HA Template")},{value:"entity",label:(0,s.kg)("editor.qr_code.entity",f,"Entity State")}],(e=>i({content_mode:e})),(0,s.kg)("editor.qr_code.content_mode_desc",f,"Where to get the text to encode"))}
        ${"static"===h.content_mode?this.renderTextInput((0,s.kg)("editor.qr_code.static_content",f,"URL or text"),h.content_static||"",(e=>i({content_static:e})),"https://www.home-assistant.io",(0,s.kg)("editor.qr_code.static_desc",f,"Text or URL to encode in the QR code")):""}
        ${"template"===h.content_mode?this.renderTextArea((0,s.kg)("editor.qr_code.template_content",f,"Template"),h.content_template||"",(e=>i({content_template:e})),'{{ states("sensor.example") }}',(0,s.kg)("editor.qr_code.template_desc",f,"Jinja2 template that outputs the string to encode")):""}
        ${"entity"===h.content_mode?r.qy`
              ${this.renderEntityPicker((0,s.kg)("editor.qr_code.entity_picker",f,"Entity"),h.content_entity||"",(e=>i({content_entity:e})),o,void 0,(0,s.kg)("editor.qr_code.entity_desc",f,"Entity whose state (or attribute) will be encoded"))}
              ${this.renderTextInput((0,s.kg)("editor.qr_code.attribute",f,"Attribute (optional)"),h.content_attribute||"",(e=>i({content_attribute:e||void 0})),"",(0,s.kg)("editor.qr_code.attribute_desc",f,"Leave empty to use state; or e.g. friendly_name"))}
            `:""}
      </div>

      <!-- Display -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
        >
          ${(0,s.kg)("editor.qr_code.display_title",f,"DISPLAY")}
        </div>
        ${this.renderSliderField((0,s.kg)("editor.qr_code.size",f,"Size"),(0,s.kg)("editor.qr_code.size_desc",f,"Width and height in pixels"),null!==(g=h.size)&&void 0!==g?g:200,200,64,512,8,(e=>i({size:e})),"px")}
        ${this.renderSelect((0,s.kg)("editor.qr_code.alignment",f,"Alignment"),h.alignment||"center",[{value:"left",label:(0,s.kg)("editor.qr_code.align_left",f,"Left")},{value:"center",label:(0,s.kg)("editor.qr_code.align_center",f,"Center")},{value:"right",label:(0,s.kg)("editor.qr_code.align_right",f,"Right")}],(e=>i({alignment:e})))}
        ${this.renderCheckbox((0,s.kg)("editor.qr_code.show_label",f,"Show label"),null!==(_=h.show_label)&&void 0!==_&&_,(e=>i({show_label:e})))}
        ${h.show_label?r.qy`
              ${this.renderTextInput((0,s.kg)("editor.qr_code.label_text",f,"Label text"),h.label_text||"",(e=>i({label_text:e})))}
              ${this.renderCheckbox((0,s.kg)("editor.qr_code.label_below",f,"Label below QR"),!1!==h.label_below,(e=>i({label_below:e})))}
            `:""}
      </div>

      <!-- Style -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
        >
          ${(0,s.kg)("editor.qr_code.style_title",f,"STYLE")}
        </div>
        ${this.renderSelect((0,s.kg)("editor.qr_code.dot_style",f,"Dot pattern"),h.dot_style||"square",[{value:"square",label:(0,s.kg)("editor.qr_code.dot_square",f,"Square")},{value:"dots",label:(0,s.kg)("editor.qr_code.dot_dots",f,"Dots")},{value:"rounded",label:(0,s.kg)("editor.qr_code.dot_rounded",f,"Rounded")},{value:"extra-rounded",label:(0,s.kg)("editor.qr_code.dot_extra_rounded",f,"Extra Rounded")},{value:"classy",label:(0,s.kg)("editor.qr_code.dot_classy",f,"Classy")},{value:"classy-rounded",label:(0,s.kg)("editor.qr_code.dot_classy_rounded",f,"Classy Rounded")}],(e=>i({dot_style:e})),(0,s.kg)("editor.qr_code.dot_style_desc",f,"Shape of each individual data module"))}
        ${this.renderSelect((0,s.kg)("editor.qr_code.corner_square_style",f,"Corner squares"),h.corner_square_style||"square",[{value:"square",label:(0,s.kg)("editor.qr_code.cs_square",f,"Square")},{value:"dot",label:(0,s.kg)("editor.qr_code.cs_dot",f,"Dot")},{value:"extra-rounded",label:(0,s.kg)("editor.qr_code.cs_extra_rounded",f,"Extra Rounded")}],(e=>i({corner_square_style:e})),(0,s.kg)("editor.qr_code.corner_square_desc",f,"Shape of the three large corner finder squares"))}
        ${this.renderSelect((0,s.kg)("editor.qr_code.corner_dot_style",f,"Corner dots"),h.corner_dot_style||"square",[{value:"square",label:(0,s.kg)("editor.qr_code.cd_square",f,"Square")},{value:"dot",label:(0,s.kg)("editor.qr_code.cd_dot",f,"Dot")}],(e=>i({corner_dot_style:e})),(0,s.kg)("editor.qr_code.corner_dot_desc",f,"Shape of the small inner dots inside each corner square"))}
      </div>

      <!-- Logo -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
        >
          ${(0,s.kg)("editor.qr_code.logo_title",f,"LOGO / ICON")}
        </div>
        ${this.renderCheckbox((0,s.kg)("editor.qr_code.logo_enabled",f,"Show logo in center"),null!==(u=h.logo_enabled)&&void 0!==u&&u,(e=>i({logo_enabled:e})))}
        ${h.logo_enabled?r.qy`
              <!-- Logo source type selector -->
              ${this.renderSelect((0,s.kg)("editor.qr_code.logo_image_type",f,"Logo source"),h.logo_image_type||"url",[{value:"url",label:(0,s.kg)("editor.qr_code.logo_source_url",f,"Image URL")},{value:"upload",label:(0,s.kg)("editor.qr_code.logo_source_upload",f,"Upload Image")},{value:"entity",label:(0,s.kg)("editor.qr_code.logo_source_entity",f,"Entity Image")},{value:"attribute",label:(0,s.kg)("editor.qr_code.logo_source_attribute",f,"Entity Attribute")}],(e=>{i({logo_image_type:e})}),(0,s.kg)("editor.qr_code.logo_image_type_desc",f,"Where to load the logo image from"))}

              <!-- URL source -->
              ${"url"===(h.logo_image_type||"url")?r.qy`
                    ${this.renderTextInput((0,s.kg)("editor.qr_code.logo_url",f,"Logo image URL"),h.logo_url||"",(e=>{if(e!==h.logo_url){m.delete(h.logo_url||""),m.delete(e);for(const e of[...p.keys()])e.includes("logo:")&&p.delete(e)}i({logo_url:e})}),"https://example.com/logo.png",(0,s.kg)("editor.qr_code.logo_url_desc",f,"Direct URL to a PNG, JPG, or SVG image. Use /local/ paths for best results."))}
                    ${h.logo_url&&""===m.get(h.logo_url)?r.qy`
                          <div
                            style="display:flex;align-items:flex-start;gap:8px;padding:10px 12px;margin-bottom:12px;background:rgba(var(--warning-color-int,255,152,0),0.12);border:1px solid var(--warning-color,#ff9800);border-radius:8px;font-size:13px;"
                          >
                            <ha-icon icon="mdi:alert-outline" style="--mdi-icon-size:18px;color:var(--warning-color,#ff9800);flex-shrink:0;margin-top:1px;"></ha-icon>
                            <div>
                              <strong>${(0,s.kg)("editor.qr_code.cors_title",f,"Image blocked by CORS")}</strong><br/>
                              <span style="color:var(--secondary-text-color);">
                                ${(0,s.kg)("editor.qr_code.cors_hint",f,"The server rejected cross-origin requests. Copy the image to /config/www/ and use /local/your-image.png instead.")}
                              </span>
                            </div>
                          </div>
                        `:""}
                  `:""}

              <!-- Upload source -->
              ${"upload"===(h.logo_image_type||"url")?r.qy`
                    <div class="form-field" style="margin-bottom: 16px;">
                      <label class="form-label" style="font-size: 14px; font-weight: 500; margin-bottom: 4px; display: block;">
                        ${(0,s.kg)("editor.qr_code.logo_upload_label",f,"Upload logo image")}
                      </label>
                      <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 8px;">
                        ${(0,s.kg)("editor.qr_code.logo_upload_desc",f,"Click to upload a PNG, JPG, or SVG from your device.")}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                        @change=${e=>this._handleLogoFileUpload(e,i,o)}
                      />
                      ${h.logo_url?r.qy`
                            <div style="margin-top: 8px; font-size: 12px; color: var(--secondary-text-color);">
                              <ha-icon icon="mdi:check-circle" style="--mdi-icon-size:14px; color: var(--success-color, #4caf50);"></ha-icon>
                              ${(0,s.kg)("editor.qr_code.logo_uploaded",f,"Uploaded")}: <code>${h.logo_url}</code>
                            </div>
                          `:""}
                    </div>
                  `:""}

              <!-- Entity source -->
              ${"entity"===(h.logo_image_type||"url")?r.qy`
                    ${this.renderEntityPicker((0,s.kg)("editor.qr_code.logo_entity",f,"Entity"),h.logo_image_entity||"",(e=>{e!==h.logo_image_entity&&m.delete(h.logo_url||""),i({logo_image_entity:e})}),o,void 0,(0,s.kg)("editor.qr_code.logo_entity_desc",f,"Entity with entity_picture or an image URL as its state (e.g. person, image)."))}
                  `:""}

              <!-- Attribute source -->
              ${"attribute"===(h.logo_image_type||"url")?r.qy`
                    ${this.renderEntityPicker((0,s.kg)("editor.qr_code.logo_entity",f,"Entity"),h.logo_image_entity||"",(e=>{e!==h.logo_image_entity&&m.delete(h.logo_url||""),i({logo_image_entity:e})}),o,void 0,(0,s.kg)("editor.qr_code.logo_entity_attr_desc",f,"Entity that has an image URL in one of its attributes."))}
                    ${this.renderTextInput((0,s.kg)("editor.qr_code.logo_attribute",f,"Attribute name"),h.logo_image_attribute||"",(e=>{m.delete(h.logo_url||""),i({logo_image_attribute:e||void 0})}),"entity_picture",(0,s.kg)("editor.qr_code.logo_attribute_desc",f,"Attribute path containing the image URL (dot notation supported)."))}
                  `:""}

              ${this.renderSliderField((0,s.kg)("editor.qr_code.logo_size",f,"Logo size"),(0,s.kg)("editor.qr_code.logo_size_desc",f,"Logo as a fraction of the QR code area (10–30%). Requires error correction H for best results."),Math.round(100*(null!==(v=h.logo_size)&&void 0!==v?v:.25)),25,10,30,5,(e=>i({logo_size:e/100})),"%")}
              ${this.renderSliderField((0,s.kg)("editor.qr_code.logo_margin",f,"Logo margin"),(0,s.kg)("editor.qr_code.logo_margin_desc",f,"Padding around the logo in pixels (keep low — large values shrink the visible logo)"),null!==(y=h.logo_margin)&&void 0!==y?y:2,2,0,8,1,(e=>i({logo_margin:e})),"px")}
              ${"H"!==(h.error_correction||"M")?r.qy`
                    <div
                      style="display:flex;align-items:flex-start;gap:8px;padding:10px 12px;margin-bottom:12px;background:rgba(var(--info-color-int,33,150,243),0.1);border:1px solid var(--info-color,#2196f3);border-radius:8px;font-size:13px;"
                    >
                      <ha-icon icon="mdi:information-outline" style="--mdi-icon-size:18px;color:var(--info-color,#2196f3);flex-shrink:0;margin-top:1px;"></ha-icon>
                      <div>
                        <strong>${(0,s.kg)("editor.qr_code.logo_ec_tip_title",f,"Tip: use H error correction")}</strong><br/>
                        <span style="color:var(--secondary-text-color);">
                          ${(0,s.kg)("editor.qr_code.logo_ec_tip",f,"Set error correction to H (30%) in the Advanced section for the best logo clarity. Lower levels shrink the logo to protect readability.")}
                        </span>
                      </div>
                    </div>
                  `:""}
              ${this.renderCheckbox((0,s.kg)("editor.qr_code.logo_hide_bg_dots",f,"Hide dots behind logo"),!1!==h.logo_hide_bg_dots,(e=>i({logo_hide_bg_dots:e})))}
            `:""}
      </div>

      <!-- Advanced -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
        >
          ${(0,s.kg)("editor.qr_code.advanced_title",f,"ADVANCED")}
        </div>
        <div class="form-field" style="margin-bottom: 16px;">
          <label class="form-label">${(0,s.kg)("editor.qr_code.fg_color",f,"Foreground color")}</label>
          <ultra-color-picker
            .label="${""}"
            .value="${h.fg_color||"#000000"}"
            .defaultValue="${"#000000"}"
            .hass="${o}"
            @value-changed="${e=>i({fg_color:e.detail.value})}"
          ></ultra-color-picker>
        </div>
        <div class="form-field" style="margin-bottom: 16px;">
          <label class="form-label">${(0,s.kg)("editor.qr_code.bg_color",f,"Background color")}</label>
          <ultra-color-picker
            .label="${""}"
            .value="${h.bg_color||"#ffffff"}"
            .defaultValue="${"#ffffff"}"
            .hass="${o}"
            @value-changed="${e=>i({bg_color:e.detail.value})}"
          ></ultra-color-picker>
        </div>
        ${this.renderSelect((0,s.kg)("editor.qr_code.error_correction",f,"Error correction"),h.error_correction||"M",[{value:"L",label:"L (7%)"},{value:"M",label:"M (15%)"},{value:"Q",label:"Q (25%)"},{value:"H",label:"H (30%)"}],(e=>i({error_correction:e})),(0,s.kg)("editor.qr_code.error_correction_desc",f,"Higher = more damage tolerance, larger code"))}
        ${this.renderSliderField((0,s.kg)("editor.qr_code.quiet_zone",f,"Quiet zone (margin)"),(0,s.kg)("editor.qr_code.quiet_zone_desc",f,"Modules around the QR code (0–10)"),null!==(b=h.qr_margin)&&void 0!==b?b:1,1,0,10,1,(e=>i({qr_margin:e})))}
      </div>
    `:this.renderProLockUI(f)}renderProLockUI(e){return r.qy`
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
          ${(0,s.kg)("editor.pro.feature_locked",e,"Pro Feature")}
        </div>
        <div
          style="font-size: 14px; color: var(--secondary-text-color); margin-bottom: 16px; max-width: 300px;"
        >
          ${(0,s.kg)("editor.qr_code.pro_description",e,"QR Code is a Pro feature that generates scannable QR codes from URLs, text, templates, or entity state.")}
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
          ${(0,s.kg)("editor.pro.upgrade_button",e,"Upgrade to Pro")}
        </a>
      </div>
    `}_resolveContent(e,o,t){var r,i,n;const l=e.content_mode||"static";if("static"===l)return(e.content_static||"").trim()||"https://www.home-assistant.io";if("entity"===l&&e.content_entity&&(null===(r=null==o?void 0:o.states)||void 0===r?void 0:r[e.content_entity])){const t=o.states[e.content_entity];if(e.content_attribute){const o=null===(i=t.attributes)||void 0===i?void 0:i[e.content_attribute];return null!=o?String(o):""}return null!=t.state?String(t.state):""}if("template"===l&&e.content_template&&o){const r=`qr_${e.id}`,i=null===(n=o.__uvc_template_strings)||void 0===n?void 0:n[r];if(null!=i)return String(i).trim();try{new g.I(o).subscribeToTemplate(e.content_template,r,(()=>{window.dispatchEvent(new CustomEvent(u))}),{},t)}catch(e){}return""}return""}renderPreview(e,o,t,i){var l,a,d,c,g,_,b,h,f;const q=e,x=this._resolveContent(q,o,t),k=Math.min(512,Math.max(64,null!==(l=q.size)&&void 0!==l?l:200)),$=q.fg_color||"#000000",w=q.bg_color||"#ffffff",z=q.error_correction||"M",S=null!==(a=q.qr_margin)&&void 0!==a?a:1,L=q.alignment||"center",R=null!==(d=q.show_label)&&void 0!==d&&d,E=(q.label_text||"").trim(),C=!1!==q.label_below;let U,T=!1;const A=y(q,o);if(q.logo_enabled&&A){const e=m.get(A);void 0===e?function(e,o){var t,r;if(v.has(e))return;v.add(e);const i={};!((e.startsWith("http://")||e.startsWith("https://"))&&!e.startsWith(`${window.location.protocol}//${window.location.host}`))&&(null===(r=null===(t=null==o?void 0:o.auth)||void 0===t?void 0:t.data)||void 0===r?void 0:r.access_token)&&(i.Authorization=`Bearer ${o.auth.data.access_token}`),fetch(e,{mode:"cors",headers:i}).then((e=>{if(!e.ok)throw new Error(`HTTP ${e.status}`);return e.blob()})).then((e=>new Promise(((o,t)=>{const r=new FileReader;r.onloadend=()=>o(r.result),r.onerror=t,r.readAsDataURL(e)})))).then((o=>{m.set(e,o),v.delete(e);for(const e of[...p.keys()])e.includes("logo:pending")&&p.delete(e);window.dispatchEvent(new CustomEvent(u))})).catch((()=>{m.set(e,""),v.delete(e);for(const e of[...p.keys()])e.includes("logo:pending")&&p.delete(e);window.dispatchEvent(new CustomEvent(u))}))}(A,o):""===e?T=!0:U=e}const P=function(e,o,t){var r,i,n;const l=e.size||200,a=e.fg_color||"#000000",d=e.bg_color||"#ffffff",c=e.error_correction||"M",s=null!==(r=e.qr_margin)&&void 0!==r?r:1,g=e.dot_style||"square",_=e.corner_square_style||"square",u=e.corner_dot_style||"square",p=y(e,t),v=e.logo_enabled&&p?`${function(e,o){if(!e.logo_enabled)return"nologo";const t=y(e,o);if(!t)return"nologo";const r=m.get(t);return void 0===r?"logo:pending":""===r?"logo:failed":"logo:loaded"}(e,t)}|${null!==(i=e.logo_size)&&void 0!==i?i:.25}|${null!==(n=e.logo_margin)&&void 0!==n?n:4}|${!1!==e.logo_hide_bg_dots}`:"nologo";return`${e.id}|${o}|${l}|${a}|${d}|${c}|${s}|${g}|${_}|${u}|${v}`}(q,x,o);let D=p.get(P);if(!x&&"template"!==q.content_mode)return r.qy`
        <div class="qr-code-module-preview qr-code-placeholder" style="text-align: center; padding: 24px; color: var(--secondary-text-color);">
          <ha-icon icon="mdi:qrcode" style="--mdi-icon-size: 48px; opacity: 0.5;"></ha-icon>
          <div style="margin-top: 8px; font-size: 14px;">${(0,s.kg)("editor.qr_code.no_content",(null===(c=null==o?void 0:o.locale)||void 0===c?void 0:c.language)||"en","Add content in General tab")}</div>
        </div>
      `;if(!D&&x){const e=()=>window.dispatchEvent(new CustomEvent(u));return new(n())({width:k,height:k,data:x,margin:S,image:U||void 0,qrOptions:{errorCorrectionLevel:z},dotsOptions:{type:q.dot_style||"square",color:$},cornersSquareOptions:{type:q.corner_square_style||"square",color:$},cornersDotOptions:{type:q.corner_dot_style||"square",color:$},backgroundOptions:{color:w},imageOptions:{margin:U?null!==(g=q.logo_margin)&&void 0!==g?g:4:0,imageSize:U?null!==(_=q.logo_size)&&void 0!==_?_:.25:.4,hideBackgroundDots:!U||!1!==q.logo_hide_bg_dots,saveAsBlob:!0}}).getRawData("png").then((o=>{if(!o)return p.set(P,""),void e();const t=new FileReader;t.onloadend=()=>{p.set(P,t.result||""),e()},t.onerror=()=>{p.set(P,""),e()},t.readAsDataURL(o)})).catch((()=>{p.set(P,""),e()})),r.qy`
        <div class="qr-code-module-preview qr-code-loading" style="text-align: center; padding: 24px; color: var(--secondary-text-color);">
          <ha-icon icon="mdi:loading" class="qr-code-spinner" style="--mdi-icon-size: 32px;"></ha-icon>
          <div style="margin-top: 8px; font-size: 14px;">${(0,s.kg)("editor.qr_code.generating",(null===(b=null==o?void 0:o.locale)||void 0===b?void 0:b.language)||"en","Generating QR...")}</div>
        </div>
      `}if(!D)return r.qy`
        <div class="qr-code-module-preview qr-code-placeholder" style="text-align: center; padding: 24px; color: var(--secondary-text-color);">
          <ha-icon icon="mdi:qrcode" style="--mdi-icon-size: 48px; opacity: 0.5;"></ha-icon>
        </div>
      `;const I=this.createGestureHandlers(e.id,{tap_action:q.tap_action,hold_action:q.hold_action,double_tap_action:q.double_tap_action,entity:void 0,module:q},o,t),Q="center"===L?"margin-left: auto; margin-right: auto;":"right"===L?"margin-left: auto; margin-right: 0;":"margin-left: 0; margin-right: auto;",M=R&&E?r.qy`
            <div
              class="qr-code-label"
              style="font-size: 14px; color: var(--primary-text-color); margin-top: ${C?8:0}px; margin-bottom: ${C?0:8}px; text-align: center;"
            >
              ${E}
            </div>
          `:"",O=r.qy`
      <img
        src="${D}"
        alt="QR Code"
        width="${k}"
        height="${k}"
        style="display: block; ${Q}"
      />
    `,G="url"===(q.logo_image_type||"url")&&(q.logo_url||"").startsWith("http")&&!q.logo_url.startsWith(`${window.location.protocol}//${window.location.host}`),F=T&&G?r.qy`
          <div
            class="qr-cors-warning"
            style="display:flex;align-items:center;gap:6px;padding:6px 10px;margin-top:6px;background:rgba(var(--warning-color-int,255,152,0),0.15);border:1px solid var(--warning-color,#ff9800);border-radius:6px;font-size:12px;color:var(--primary-text-color);"
          >
            <ha-icon icon="mdi:alert-outline" style="--mdi-icon-size:16px;color:var(--warning-color,#ff9800);flex-shrink:0;"></ha-icon>
            <span>${(0,s.kg)("editor.qr_code.cors_error",(null===(h=null==o?void 0:o.locale)||void 0===h?void 0:h.language)||"en","Logo not loaded — the image server blocked cross-origin requests. Use a /local/ path or a CORS-enabled URL.")}</span>
          </div>
        `:"";return r.qy`
      <div
        class="qr-code-module-preview"
        @pointerdown="${I.onPointerDown}"
        @pointerup="${I.onPointerUp}"
        @pointerleave="${I.onPointerLeave}"
        @pointercancel="${I.onPointerCancel}"
        style="cursor: ${"nothing"!==(null===(f=q.tap_action)||void 0===f?void 0:f.action)?"pointer":"default"};"
      >
        ${C?O:M}
        ${C?M:O}
        ${F}
      </div>
    `}async _handleLogoFileUpload(e,o,t){var r;const i=null===(r=e.target.files)||void 0===r?void 0:r[0];if(i)try{const e=await(0,_.uploadImage)(t,i);m.delete(e),m.delete((0,_.V)(t,e));for(const e of[...p.keys()])e.includes("logo:")&&p.delete(e);o({logo_url:e,logo_image_type:"upload"})}catch(e){console.error("Error uploading logo file:",e),alert(`Upload failed: ${e instanceof Error?e.message:"Unknown error"}`)}}validate(e){var o;const t=e,r=[...super.validate(e).errors],i=t.content_mode||"static";"static"!==i||(t.content_static||"").trim()||r.push("Static content is required when source is Static"),"template"!==i||(t.content_template||"").trim()||r.push("Template is required when source is Template"),"entity"!==i||(t.content_entity||"").trim()||r.push("Entity is required when source is Entity");const n=null!==(o=t.size)&&void 0!==o?o:200;return(n<64||n>512)&&r.push("Size must be between 64 and 512"),{valid:0===r.length,errors:r}}getStyles(){return"\n      .qr-code-module-preview img {\n        display: block;\n      }\n      .qr-code-loading .qr-code-spinner,\n      .qr-code-loading ha-icon.qr-code-spinner {\n        animation: qr-spin 1s linear infinite;\n        display: inline-block;\n      }\n      @keyframes qr-spin {\n        from { transform: rotate(0deg); }\n        to { transform: rotate(360deg); }\n      }\n    "}}}}]);