"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[4193],{4193:(e,t,i)=>{i.r(t),i.d(t,{UltraImageModule:()=>c});var a=i(5183),r=i(7475),o=(i(7921),i(5262)),n=i(8465),l=i(4111),d=i(8938),s=i(6478);const g=i(6900).Z;var m=i(6990);class c extends r.m{constructor(){super(...arguments),this.metadata={type:"image",title:"Images",description:"Display images and photos",author:"WJD Designs",version:"1.0.0",icon:"mdi:image",category:"media",tags:["image","picture","media","photo"]}}createDefault(e){return{id:e||this.generateId("image"),type:"image",image_type:"default",image_url:"",entity:"",image_entity:"",image_attribute:"",width:"100%",height:"200px",aspect_ratio:"auto",object_fit:"contain",tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},filter_blur:0,filter_brightness:100,filter_contrast:100,filter_saturate:100,filter_hue_rotate:0,filter_opacity:100,rotation:0,border_radius:0,box_shadow:"none",hover_enabled:!1,hover_effect:"scale",hover_scale:105,hover_rotate:5,hover_opacity:90,hover_blur:0,hover_brightness:110,hover_shadow:"none",hover_translate_x:0,hover_translate_y:0,hover_transition:300,display_mode:"always",display_conditions:[]}}renderGeneralTab(e,t,i,r){var o;const l=e,d=(null===(o=null==t?void 0:t.locale)||void 0===o?void 0:o.language)||"en";return a.qy`
      ${n.Q.injectCleanFormStyles()}
      <div class="module-general-settings">
        <!-- Image Settings -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            ${(0,s.kg)("editor.image.settings",d,"Image Settings")}
          </div>

          <!-- Image Source Type -->
          ${this.renderFieldSection((0,s.kg)("editor.image.source_type",d,"Image Source Type"),(0,s.kg)("editor.image.source_type_desc",d,"Choose how you want to specify the image source."),t,{image_type:l.image_type||"default"},[this.selectField("image_type",[{value:"default",label:(0,s.kg)("editor.image.source.default",d,"Default Image")},{value:"url",label:(0,s.kg)("editor.image.source.url",d,"Image URL")},{value:"upload",label:(0,s.kg)("editor.image.source.upload",d,"Upload Image")},{value:"entity",label:(0,s.kg)("editor.image.source.entity",d,"Entity Image")},{value:"attribute",label:(0,s.kg)("editor.image.source.attribute",d,"Entity Attribute")}])],(e=>{const t=e.detail.value.image_type;t!==(l.image_type||"default")&&(r({image_type:t}),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}))}

          <!-- URL Image Source -->
          ${"url"===l.image_type?this.renderConditionalFieldsGroup((0,s.kg)("editor.image.url_section.title",d,"Image URL Configuration"),a.qy`
                  ${n.Q.renderField((0,s.kg)("editor.image.image_url",d,"Image URL"),(0,s.kg)("editor.image.image_url_desc",d,"Enter the direct URL to the image you want to display."),t,{image_url:l.image_url||""},[n.Q.createSchemaItem("image_url",{text:{}})],(e=>r({image_url:e.detail.value.image_url})))}
                `):""}

          <!-- Upload Image Source -->
          ${"upload"===l.image_type?this.renderConditionalFieldsGroup((0,s.kg)("editor.image.upload_section.title",d,"Upload Image Configuration"),a.qy`
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    ${(0,s.kg)("editor.image.upload",d,"Upload Image")}
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    ${(0,s.kg)("editor.image.upload_desc",d,"Click to upload an image file from your device.")}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                    @change=${e=>this.handleFileUpload(e,r,t)}
                  />
                `):""}

          <!-- Entity Image Source -->
          ${"entity"===l.image_type?this.renderConditionalFieldsGroup((0,s.kg)("editor.image.entity_section.title",d,"Entity Image Configuration"),a.qy`
                  ${n.Q.renderField((0,s.kg)("editor.image.entity",d,"Entity"),(0,s.kg)("editor.image.entity_desc",d,"Select an entity that has an image (e.g., person, camera entities)."),t,{image_entity:l.image_entity||""},[n.Q.createSchemaItem("image_entity",{entity:{}})],(e=>{const t=e.detail.value.image_entity;t!==(l.image_entity||"")&&r({image_entity:t})}))}
                `):""}

          <!-- Attribute Image Source -->
          ${"attribute"===l.image_type?this.renderConditionalFieldsGroup((0,s.kg)("editor.image.attribute_section.title",d,"Entity Attribute Configuration"),a.qy`
                  ${n.Q.renderField((0,s.kg)("editor.image.entity",d,"Entity"),(0,s.kg)("editor.image.entity_attr_desc",d,"Select the entity that contains the image URL in one of its attributes."),t,{image_entity:l.image_entity||""},[n.Q.createSchemaItem("image_entity",{entity:{}})],(e=>{const t=e.detail.value.image_entity;t!==(l.image_entity||"")&&r({image_entity:t})}))}

                  <div style="margin-top: 16px;">
                    ${n.Q.renderField((0,s.kg)("editor.image.attribute_name",d,"Attribute Name"),(0,s.kg)("editor.image.attribute_name_desc",d,"Enter the attribute path that contains the image URL (dot notation supported, e.g., vehicle_data.vehicleDetails.generalDashboard)."),t,{image_attribute:l.image_attribute||""},[n.Q.createSchemaItem("image_attribute",{text:{}})],(e=>r({image_attribute:e.detail.value.image_attribute})))}
                  </div>
                `):""}

          <div class="field-group" style="margin-bottom: 16px; margin-top: 32px;">
            ${n.Q.renderField((0,s.kg)("editor.image.width",d,"Width"),(0,s.kg)("editor.image.width_desc",d,"Set the width (supports px, %, em, rem, vw, vh, etc.)."),t,{width:l.width||"100%"},[n.Q.createSchemaItem("width",{text:{}})],(e=>r({width:e.detail.value.width})))}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${n.Q.renderField((0,s.kg)("editor.image.height",d,"Height"),(0,s.kg)("editor.image.height_desc",d,"Set the height (supports px, %, em, rem, vw, vh, etc.)."),t,{height:l.height||"200px"},[n.Q.createSchemaItem("height",{text:{}})],(e=>r({height:e.detail.value.height})))}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection((0,s.kg)("editor.image.aspect_ratio",d,"Aspect Ratio"),(0,s.kg)("editor.image.aspect_ratio_desc",d,"Set the aspect ratio of the image container."),t,{aspect_ratio:l.aspect_ratio||"auto"},[this.selectField("aspect_ratio",[{value:"auto",label:(0,s.kg)("editor.image.aspect.auto",d,"Auto (use height setting)")},{value:"1/1",label:(0,s.kg)("editor.image.aspect.square",d,"Square (1:1)")},{value:"4/3",label:(0,s.kg)("editor.image.aspect.standard",d,"Standard (4:3)")},{value:"3/2",label:(0,s.kg)("editor.image.aspect.photo",d,"Photo (3:2)")},{value:"16/9",label:(0,s.kg)("editor.image.aspect.widescreen",d,"Widescreen (16:9)")},{value:"21/9",label:(0,s.kg)("editor.image.aspect.ultrawide",d,"Ultrawide (21:9)")},{value:"2/3",label:(0,s.kg)("editor.image.aspect.portrait",d,"Portrait (2:3)")},{value:"9/16",label:(0,s.kg)("editor.image.aspect.mobile",d,"Mobile (9:16)")}])],(e=>{const t=e.detail.value.aspect_ratio;t!==(l.aspect_ratio||"auto")&&(r({aspect_ratio:t}),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}))}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection((0,s.kg)("editor.image.crop_fit",d,"Crop & Fit"),(0,s.kg)("editor.image.crop_fit_desc",d,"Control how the image fits within its container."),t,{object_fit:l.object_fit||"cover"},[this.selectField("object_fit",[{value:"cover",label:(0,s.kg)("editor.image.fit.cover",d,"Cover (crop to fill)")},{value:"contain",label:(0,s.kg)("editor.image.fit.contain",d,"Contain (fit entire image)")},{value:"fill",label:(0,s.kg)("editor.image.fit.fill",d,"Fill (stretch to fit)")},{value:"scale-down",label:(0,s.kg)("editor.image.fit.scale_down",d,"Scale Down")},{value:"none",label:(0,s.kg)("editor.image.fit.none",d,"None (original size)")}])],(e=>{const t=e.detail.value.object_fit;t!==(l.object_fit||"cover")&&(r({object_fit:t}),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}))}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${n.Q.renderField((0,s.kg)("editor.image.border_radius",d,"Border Radius"),(0,s.kg)("editor.image.border_radius_desc",d,"Control the rounded corners of the image."),t,{border_radius:l.border_radius||8},[n.Q.createSchemaItem("border_radius",{number:{min:0,max:64,step:1}})],(e=>r({border_radius:e.detail.value.border_radius})))}
          </div>
        </div>

        <div
          class="settings-section"
          style="padding: 16px; border-radius: 8px; background: var(--secondary-background-color);"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
          >
            ${(0,s.kg)("editor.image.filters",d,"Filters")}
          </div>
          <div class="field-group" style="margin-bottom: 16px;">
            ${n.Q.renderField((0,s.kg)("editor.image.filter.blur",d,"Blur"),(0,s.kg)("editor.image.filter.blur_desc",d,"Apply a blur effect to your image."),t,{filter_blur:l.filter_blur||0},[n.Q.createSchemaItem("filter_blur",{number:{min:0,max:20,step:1}})],(e=>r({filter_blur:e.detail.value.filter_blur})))}
          </div>
          <div class="field-group" style="margin-bottom: 16px;">
            ${n.Q.renderField((0,s.kg)("editor.image.filter.brightness",d,"Brightness (%)"),(0,s.kg)("editor.image.filter.brightness_desc",d,"Adjust the brightness of your image."),t,{filter_brightness:l.filter_brightness||100},[n.Q.createSchemaItem("filter_brightness",{number:{min:0,max:200,step:1}})],(e=>r({filter_brightness:e.detail.value.filter_brightness})))}
          </div>
          <div class="field-group" style="margin-bottom: 16px;">
            ${n.Q.renderField((0,s.kg)("editor.image.filter.contrast",d,"Contrast (%)"),(0,s.kg)("editor.image.filter.contrast_desc",d,"Modify the contrast of your image."),t,{filter_contrast:l.filter_contrast||100},[n.Q.createSchemaItem("filter_contrast",{number:{min:0,max:200,step:1}})],(e=>r({filter_contrast:e.detail.value.filter_contrast})))}
          </div>
          <div class="field-group" style="margin-bottom: 16px;">
            ${n.Q.renderField((0,s.kg)("editor.image.filter.saturation",d,"Saturation (%)"),(0,s.kg)("editor.image.filter.saturation_desc",d,"Adjust the saturation of your image."),t,{filter_saturate:l.filter_saturate||100},[n.Q.createSchemaItem("filter_saturate",{number:{min:0,max:200,step:1}})],(e=>r({filter_saturate:e.detail.value.filter_saturate})))}
          </div>

          <div class="field-group">
            ${n.Q.renderField((0,s.kg)("editor.image.rotation",d,"Rotation (°)"),(0,s.kg)("editor.image.rotation_desc",d,"Rotate the image clockwise (0-360 degrees)."),t,{rotation:l.rotation||0},[n.Q.createSchemaItem("rotation",{number:{min:0,max:360,step:1}})],(e=>r({rotation:e.detail.value.rotation})))}
          </div>
        </div>

        ${l.hover_enabled?a.qy`
              <div
                class="settings-section"
                style="padding: 16px; border-radius: 8px; background: var(--secondary-background-color);"
              >
                <div
                  class="section-title"
                  style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
                >
                  ${(0,s.kg)("editor.image.hover.title",d,"Hover Effects")}
                </div>
                <div class="field-group" style="margin-bottom: 16px;">
                  ${this.renderFieldSection((0,s.kg)("editor.image.hover.effect_type",d,"Effect Type"),(0,s.kg)("editor.image.hover.effect_type_desc",d,"Choose the type of hover effect."),t,{effect:l.hover_effect||"scale"},[this.selectField("effect",[{value:"scale",label:(0,s.kg)("editor.image.hover.scale",d,"Scale (zoom in/out)")},{value:"rotate",label:(0,s.kg)("editor.image.hover.rotate",d,"Rotate")},{value:"fade",label:(0,s.kg)("editor.image.hover.fade",d,"Fade (opacity change)")},{value:"blur",label:(0,s.kg)("editor.image.hover.blur",d,"Blur")},{value:"brightness",label:(0,s.kg)("editor.image.hover.brightness",d,"Brightness")},{value:"glow",label:(0,s.kg)("editor.image.hover.glow",d,"Glow (box shadow)")},{value:"slide",label:(0,s.kg)("editor.image.hover.slide",d,"Slide (translate)")}])],(e=>{const t=e.detail.value.effect;t!==(l.hover_effect||"scale")&&(r({hover_effect:t}),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}))}
                </div>

                ${"scale"===l.hover_effect?a.qy`<div class="field-group" style="margin-bottom: 16px;">
                      ${n.Q.renderField((0,s.kg)("editor.image.hover.scale_amount",d,"Scale (%)"),(0,s.kg)("editor.image.hover.scale_amount_desc",d,"Adjust the scale of the image on hover."),t,{scale:l.hover_scale||105},[n.Q.createSchemaItem("scale",{number:{min:50,max:200,step:1}})],(e=>r({hover_scale:e.detail.value.scale})))}
                    </div>`:""}
                ${"rotate"===l.hover_effect?a.qy`<div class="field-group" style="margin-bottom: 16px;">
                      ${n.Q.renderField((0,s.kg)("editor.image.hover.rotate_amount",d,"Rotation (°)"),(0,s.kg)("editor.image.hover.rotate_amount_desc",d,"Rotate the image on hover."),t,{rotate:l.hover_rotate||5},[n.Q.createSchemaItem("rotate",{number:{min:-45,max:45,step:1}})],(e=>r({hover_rotate:e.detail.value.rotate})))}
                    </div>`:""}
                ${"fade"===l.hover_effect?a.qy`<div class="field-group" style="margin-bottom: 16px;">
                      ${n.Q.renderField((0,s.kg)("editor.image.hover.opacity",d,"Opacity (%)"),(0,s.kg)("editor.image.hover.opacity_desc",d,"Change the opacity of the image on hover."),t,{opacity:l.hover_opacity||90},[n.Q.createSchemaItem("opacity",{number:{min:0,max:100,step:1}})],(e=>r({hover_opacity:e.detail.value.opacity})))}
                    </div>`:""}
                ${"blur"===l.hover_effect?a.qy`<div class="field-group" style="margin-bottom: 16px;">
                      ${n.Q.renderField((0,s.kg)("editor.image.hover.blur_amount",d,"Blur (px)"),(0,s.kg)("editor.image.hover.blur_amount_desc",d,"Apply a blur effect to the image on hover."),t,{blur:l.hover_blur||2},[n.Q.createSchemaItem("blur",{number:{min:0,max:20,step:1}})],(e=>r({hover_blur:e.detail.value.blur})))}
                    </div>`:""}
                ${"brightness"===l.hover_effect?a.qy`<div class="field-group" style="margin-bottom: 16px;">
                      ${n.Q.renderField((0,s.kg)("editor.image.hover.brightness_amount",d,"Brightness (%)"),(0,s.kg)("editor.image.hover.brightness_amount_desc",d,"Adjust the brightness of the image on hover."),t,{brightness:l.hover_brightness||110},[n.Q.createSchemaItem("brightness",{number:{min:0,max:200,step:1}})],(e=>r({hover_brightness:e.detail.value.brightness})))}
                    </div>`:""}
                ${"glow"===l.hover_effect?a.qy`<div class="field-group" style="margin-bottom: 16px;">
                      ${this.renderFieldSection((0,s.kg)("editor.image.hover.glow_intensity",d,"Glow Intensity"),(0,s.kg)("editor.image.hover.glow_intensity_desc",d,"Choose the intensity of the glow effect on hover."),t,{shadow:l.hover_shadow||"medium"},[this.selectField("shadow",[{value:"light",label:(0,s.kg)("editor.image.hover.glow_light",d,"Light Glow")},{value:"medium",label:(0,s.kg)("editor.image.hover.glow_medium",d,"Medium Glow")},{value:"heavy",label:(0,s.kg)("editor.image.hover.glow_heavy",d,"Heavy Glow")},{value:"custom",label:(0,s.kg)("editor.image.hover.glow_custom",d,"Custom Shadow")}])],(e=>{const t=e.detail.value.shadow;t!==(l.hover_shadow||"medium")&&(r({hover_shadow:t}),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}))}
                    </div>`:""}
                ${"slide"===l.hover_effect?a.qy`
                      <div class="field-group" style="margin-bottom: 16px;">
                        ${n.Q.renderField((0,s.kg)("editor.image.hover.translate_x",d,"Horizontal (px)"),(0,s.kg)("editor.image.hover.translate_x_desc",d,"Translate the image horizontally on hover."),t,{translate_x:l.hover_translate_x||0},[n.Q.createSchemaItem("translate_x",{number:{min:-100,max:100,step:1}})],(e=>r({hover_translate_x:e.detail.value.translate_x})))}
                      </div>
                      <div class="field-group" style="margin-bottom: 16px;">
                        ${n.Q.renderField((0,s.kg)("editor.image.hover.translate_y",d,"Vertical (px)"),(0,s.kg)("editor.image.hover.translate_y_desc",d,"Translate the image vertically on hover."),t,{translate_y:l.hover_translate_y||0},[n.Q.createSchemaItem("translate_y",{number:{min:-100,max:100,step:1}})],(e=>r({hover_translate_y:e.detail.value.translate_y})))}
                      </div>
                    `:""}
              </div>
            `:""}
      </div>
    `}renderPreview(e,t,i,r){var n,l,d,c,u,h,p,v,b,_,f,y,x,k;const w=e;if(!(("url"!==w.image_type||w.image_url&&""!==w.image_url.trim())&&("upload"!==w.image_type||w.image_url&&""!==w.image_url.trim())&&("entity"!==w.image_type||w.image_entity&&""!==w.image_entity.trim())&&("attribute"!==w.image_type||w.image_entity&&""!==w.image_entity.trim()))){const e="url"===w.image_type?"Enter an image URL in the General tab":"upload"===w.image_type?"Upload an image in the General tab":"entity"===w.image_type?"Select an image entity in the General tab":"Select an entity and attribute in the General tab";return this.renderGradientErrorState("Configure Image Source",e,"mdi:image-outline")}let $="";switch(w.image_type){case"default":default:$=g;break;case"url":case"upload":w.image_url&&($=(0,m.V)(t,w.image_url));break;case"entity":if(w.image_entity&&(null==t?void 0:t.states[w.image_entity])){const e=t.states[w.image_entity];(null===(n=e.attributes)||void 0===n?void 0:n.entity_picture)?$=e.attributes.entity_picture:e.state&&e.state.startsWith("http")&&($=e.state)}break;case"attribute":if(w.image_entity&&w.image_attribute&&(null==t?void 0:t.states[w.image_entity])){const e=t.states[w.image_entity],i=this.getAttributeByPath(e.attributes,w.image_attribute);i&&"string"==typeof i&&($=i)}}const S=w.rotation||0,I=[];w.filter_blur&&w.filter_blur>0&&I.push(`blur(${w.filter_blur}px)`),w.filter_brightness&&100!==w.filter_brightness&&I.push(`brightness(${w.filter_brightness}%)`),w.filter_contrast&&100!==w.filter_contrast&&I.push(`contrast(${w.filter_contrast}%)`),w.filter_saturate&&100!==w.filter_saturate&&I.push(`saturate(${w.filter_saturate}%)`);const F=I.length>0?I.join(" "):"none";let Q="";const C=w.hover_enabled?`${w.hover_transition||300}ms`:"none";if(w.hover_enabled)switch(w.hover_effect||"scale"){case"scale":Q=`transform: scale(${(w.hover_scale||105)/100})${0!==S?` rotate(${S}deg)`:""};`;break;case"rotate":Q=`transform: rotate(${S+(w.hover_rotate||5)}deg);`;break;case"fade":Q=`opacity: ${(w.hover_opacity||90)/100};`;break;case"blur":Q=`filter: blur(${w.hover_blur||2}px);`;break;case"brightness":Q=`filter: brightness(${w.hover_brightness||110}%);`;break;case"glow":let e="";switch(w.hover_shadow||"medium"){case"light":e="0 0 10px rgba(var(--rgb-primary-color), 0.5)";break;case"medium":e="0 0 20px rgba(var(--rgb-primary-color), 0.7)";break;case"heavy":e="0 0 30px rgba(var(--rgb-primary-color), 1)";break;case"custom":e=w.hover_shadow||"0 0 20px rgba(var(--rgb-primary-color), 0.7)"}Q=`box-shadow: ${e};`;break;case"slide":Q=`transform: translate(${w.hover_translate_x||0}px, ${w.hover_translate_y||0}px)${0!==S?` rotate(${S}deg)`:""};`}let U=w.height||"200px",z="auto";w.aspect_ratio&&"auto"!==w.aspect_ratio&&(z=w.aspect_ratio,U="auto");const P=w.design||{},j=this.getBorderWithDesign(P,w),q=this.addPixelUnit(null===(l=P.border_radius)||void 0===l?void 0:l.toString())||this.addPixelUnit(null===(d=w.border_radius)||void 0===d?void 0:d.toString())||"0",A=P.margin_left||(null===(u=null===(c=w.margin)||void 0===c?void 0:c.left)||void 0===u?void 0:u.toString())||w.margin_left||"auto",L=P.margin_right||(null===(p=null===(h=w.margin)||void 0===h?void 0:h.right)||void 0===p?void 0:p.toString())||w.margin_right||"auto",T=0!==S?`rotate(${S}deg)`:"",G=`\n      width: ${P.width||w.width||"100%"};\n      height: ${U};\n      aspect-ratio: ${z};\n      object-fit: ${w.object_fit||"cover"};\n      filter: ${F};\n      border: ${j};\n      border-radius: ${q};\n      transform: ${T};\n      transition: ${w.hover_enabled?`transform ${C} ease, filter ${C} ease, opacity ${C} ease, box-shadow ${C} ease`:"none"};\n      cursor: pointer;\n      display: block;\n      max-width: 100%;\n      max-height: 100%;\n      margin-left: ${A};\n      margin-right: ${L};\n    `,R=w.hover_enabled?Q:"",B="auto"===A&&"auto"===L||"auto"===A||"auto"===L;let E="center";if(!B)switch(w.alignment){case"left":E="flex-start";break;case"center":E="center";break;case"right":E="flex-end"}const W={padding:P.padding_top||P.padding_bottom||P.padding_left||P.padding_right?`${this.addPixelUnit(P.padding_top)||"0px"} ${this.addPixelUnit(P.padding_right)||"0px"} ${this.addPixelUnit(P.padding_bottom)||"0px"} ${this.addPixelUnit(P.padding_left)||"0px"}`:"0",margin:P.margin_top||P.margin_bottom||A||L?`${P.margin_top||(null===(b=null===(v=w.margin)||void 0===v?void 0:v.top)||void 0===b?void 0:b.toString())||w.margin_top||"8px"} ${L} ${P.margin_bottom||(null===(f=null===(_=w.margin)||void 0===_?void 0:_.bottom)||void 0===f?void 0:f.toString())||w.margin_bottom||"8px"} ${A}`:"8px 0",background:P.background_color||"transparent",backgroundImage:this.getBackgroundImageCSS(P,t),backgroundSize:P.background_size||"cover",backgroundPosition:P.background_position||"center",backgroundRepeat:P.background_repeat||"no-repeat",position:P.position||"relative",top:P.top||"auto",bottom:P.bottom||"auto",left:P.left||"auto",right:P.right||"auto",zIndex:P.z_index||"auto",width:P.width||w.width||"100%",height:P.height||w.height||"auto",maxWidth:P.max_width||"100%",maxHeight:P.max_height||"none",minWidth:P.min_width||"none",minHeight:P.min_height||"auto",overflow:"live"===r?P.overflow||"hidden":P.overflow||"visible",clipPath:P.clip_path||"none",backdropFilter:P.backdrop_filter||"none",boxShadow:P.box_shadow_h&&P.box_shadow_v?`${P.box_shadow_h||"0"} ${P.box_shadow_v||"0"} ${P.box_shadow_blur||"0"} ${P.box_shadow_spread||"0"} ${P.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"},D=this.createGestureHandlers(w.id,{tap_action:w.tap_action,hold_action:w.hold_action,double_tap_action:w.double_tap_action,entity:w.entity,module:w},t,i),H=null===(y=w.design)||void 0===y?void 0:y.hover_effect,M=o.k.getHoverEffectClass(H),O=a.qy`
      <div class="image-module-container" style=${this.styleObjectToCss(W)}>
        <div class="image-module-preview">
          <!-- Image Container with Alignment -->
          <div
            style="display: ${B?"block":"flex"}; justify-content: ${E}; width: 100%;"
          >
            ${$?a.qy`
                  <img
                    src="${$}"
                    @error=${e=>{var i;const a=e.currentTarget.closest(".image-module-preview");a&&(a.innerHTML=`\n                          <div style="\n                            width: ${P.width||w.width||"100%"};\n                            height: ${U};\n                            aspect-ratio: ${z};\n                            background: var(--secondary-background-color);\n                            border: 2px dashed var(--divider-color);\n                            border-radius: ${q};\n                            display: flex;\n                            align-items: center;\n                            justify-content: center;\n                            color: var(--secondary-text-color);\n                            font-size: 14px;\n                            margin-left: ${A};\n                            margin-right: ${L};\n                            padding: 16px;\n                            box-sizing: border-box;\n                            overflow: visible;\n                            min-height: 80px;\n                          ">\n                            <div style="\n                              text-align: center;\n                              max-width: 100%;\n                              word-wrap: break-word;\n                              overflow-wrap: break-word;\n                              white-space: normal;\n                              line-height: 1.4;\n                            ">\n                              <ha-icon\n                                icon="mdi:image-off"\n                                style="font-size: 32px; margin-bottom: 8px; opacity: 0.5; display: block;"\n                              ></ha-icon>\n                              <div style="\n                                font-size: 12px;\n                                font-weight: 500;\n                                max-width: 100%;\n                                word-break: break-word;\n                                hyphens: auto;\n                              ">\n                                ${(0,s.kg)("editor.image.load_error",(null===(i=null==t?void 0:t.locale)||void 0===i?void 0:i.language)||"en","Image failed to load")}\n                              </div>\n                            </div>\n                          </div>\n                        `)}}
                    alt="${(0,s.kg)("editor.image.alt",(null===(x=null==t?void 0:t.locale)||void 0===x?void 0:x.language)||"en","Image")}"
                    style="${G}"
                    class="${M}"
                    data-hover-style="${R}"
                    @pointerdown=${D.onPointerDown}
                    @pointerup=${D.onPointerUp}
                    @pointerleave=${D.onPointerLeave}
                  />
                `:a.qy`
                  <div
                    class="${M}"
                    style="
                      width: ${P.width||w.width||"100%"};
                      height: ${U};
                      aspect-ratio: ${z};
                      background: var(--secondary-background-color);
                      border: 2px dashed var(--divider-color);
                      border-radius: ${q};
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: var(--secondary-text-color);
                      font-size: 14px;
                      margin-left: ${A};
                      margin-right: ${L};
                      padding: 16px;
                      box-sizing: border-box;
                      overflow: visible;
                      min-height: 80px;
                    "
                  >
                    <div
                      style="
                      text-align: center;
                      max-width: 100%;
                      word-wrap: break-word;
                      overflow-wrap: break-word;
                      white-space: normal;
                      line-height: 1.4;
                    "
                    >
                      <ha-icon
                        icon="mdi:image-off"
                        style="font-size: 32px; margin-bottom: 8px; opacity: 0.5; display: block;"
                      ></ha-icon>
                      <div
                        style="
                        font-size: 12px;
                        font-weight: 500;
                        max-width: 100%;
                        word-break: break-word;
                        hyphens: auto;
                      "
                      >
                        ${(0,s.kg)("editor.image.no_source",(null===(k=null==t?void 0:t.locale)||void 0===k?void 0:k.language)||"en","No image source configured")}
                      </div>
                    </div>
                  </div>
                `}
          </div>
        </div>
      </div>
    `;return O}async handleFileUpload(e,t,i){var a;const r=null===(a=e.target.files)||void 0===a?void 0:a[0];if(r)try{t({image_url:await(0,m.uploadImage)(i,r),image_type:"upload"})}catch(e){console.error("Error uploading file:",e),alert(`Upload failed: ${e instanceof Error?e.message:"Unknown error"}`)}}renderLogicTab(e,t,i,a){return d.X.render(e,t,(e=>a(e)))}renderDesignTab(e,t,i,a){return l.T.render(e,t,(e=>a(e)))}validate(e){const t=e,i=[...super.validate(e).errors];switch(t.image_type){case"url":case"upload":case"entity":case"default":case"none":default:break;case"attribute":t.image_entity&&""!==t.image_entity.trim()&&(t.image_attribute&&""!==t.image_attribute.trim()||i.push("Attribute name is required when using attribute type"))}return t.link_enabled&&t.link_url&&""===t.link_url.trim()&&i.push("Link URL is required when link is enabled"),t.width&&"number"==typeof t.width&&(t.width<1||t.width>100)&&i.push("Width must be between 1 and 100 percent"),t.height&&"number"==typeof t.height&&t.height<1&&i.push("Height must be at least 1 pixel"),{valid:0===i.length,errors:i}}getBackgroundImageCSS(e,t){var i,a;if(!e.background_image_type||"none"===e.background_image_type)return"none";switch(e.background_image_type){case"upload":case"url":if(e.background_image)return`url("${e.background_image}")`;break;case"entity":if(e.background_image_entity&&(null==t?void 0:t.states[e.background_image_entity])){const r=t.states[e.background_image_entity];let o="";if((null===(i=r.attributes)||void 0===i?void 0:i.entity_picture)?o=r.attributes.entity_picture:(null===(a=r.attributes)||void 0===a?void 0:a.image)?o=r.attributes.image:r.state&&"string"==typeof r.state&&(r.state.startsWith("/")||r.state.startsWith("http"))&&(o=r.state),o)return o.startsWith("/local/")||o.startsWith("/media/")||o.startsWith("/"),`url("${o}")`}}return"none"}getAttributeByPath(e,t){if(!e||!t)return;const i=t.replace(/\[(\w+)\]/g,".$1").replace(/^\./,"").split(".").filter(Boolean);let a=e;for(const e of i){if(null==a)return;a=a[e]}return a}styleObjectToCss(e){return Object.entries(e).map((([e,t])=>`${e.replace(/[A-Z]/g,(e=>`-${e.toLowerCase()}`))}: ${t}`)).join("; ")}getStyles(){return"\n      .image-module-preview {\n        max-width: 100%;\n        overflow: hidden;\n        box-sizing: border-box;\n      }\n\n\n\n      .image-module-preview img {\n        max-width: 100%;\n        height: auto;\n        display: block;\n      }\n\n      .image-module-preview img:hover {\n        transition: all 0.3s ease;\n      }\n\n      /* Let HA handle dropdown positioning naturally */\n      .module-general-settings {\n        overflow: visible;\n      }\n\n      /* Conditional Fields Grouping CSS */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      .conditional-fields-group:hover {\n        background: rgba(var(--rgb-primary-color), 0.12);\n      }\n\n      .conditional-fields-header {\n        background: rgba(var(--rgb-primary-color), 0.15);\n        padding: 12px 16px;\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-color);\n        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n\n      .conditional-fields-content {\n        padding: 16px;\n      }\n\n      .conditional-fields-content > .field-title:first-child {\n        margin-top: 0 !important;\n      }\n\n      @keyframes slideInFromLeft {\n        from { \n          opacity: 0; \n          transform: translateX(-10px); \n        }\n        to { \n          opacity: 1; \n          transform: translateX(0); \n        }\n      }\n\n      /* Field styling - ensure vertical stacking, no columns */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n        \n        margin-bottom: 4px !important;\n        display: block !important;\n        width: 100% !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        display: block !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n        width: 100% !important;\n      }\n\n      .field-group {\n        display: flex !important;\n        flex-direction: column !important;\n        width: 100% !important;\n        margin-bottom: 16px !important;\n      }\n\n      .field-group ha-form {\n        width: 100% !important;\n        display: block !important;\n      }\n\n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n\n      .settings-section {\n        margin-bottom: 16px;\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n    "}addPixelUnit(e){return e?/^\d+$/.test(e)?`${e}px`:/^[\d\s]+$/.test(e)?e.split(" ").map((e=>e.trim()?`${e}px`:e)).join(" "):e:e}getBorderCSS(e){return e.border_style&&"none"!==e.border_style&&e.border_width?`${this.addPixelUnit(e.border_width)||"1px"} ${e.border_style} ${e.border_color||"var(--divider-color)"}`:"none"}getBorderWithDesign(e,t){return e.border_style&&"none"!==e.border_style&&e.border_width?`${this.addPixelUnit(e.border_width)||"1px"} ${e.border_style} ${e.border_color||"var(--divider-color)"}`:this.getBorderCSS(t)}}}}]);