"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[8826],{1172:(t,e,i)=>{i.d(e,{ex:()=>n,ge:()=>a});var o=i(9418);const r=["script","iframe","object","embed","form","input","button","textarea","select","option"];function n(t,e){return o.A.sanitize(t,{USE_PROFILES:{html:!0},FORBID_TAGS:e?r:[...r,"style"],FORCE_BODY:e})}function a(t){return o.A.sanitize(t,{ALLOWED_TAGS:["p","br","strong","b","em","i","u","s","span","a","mark"],ALLOWED_ATTR:["style","href","target","rel","class","data-color"]})}},1716:(t,e,i)=>{i.r(e),i.d(e,{UltraTextModule:()=>P});var o,r=i(5183),n=i(7475),a=i(8869),l=i(766),s=i(5147),c=i(8938),d=i(5320),p=i(5262),h=i(6477),u=i(6478),g=i(9327),_=i(5121),m=i(5155),v=i(6001),b=i(1172),x=(i(7921),i(9442),i(4276)),f=i(277),y=i(375),k=i(7594),w=i(7417),$=i(8631),S=i(7846),C=i(4341),T=i(4460),A=i(1001),z=function(t,e,i,o){var r,n=arguments.length,a=n<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,o);else for(var l=t.length-1;l>=0;l--)(r=t[l])&&(a=(n<3?r(a):n>3?r(e,i,a):r(e,i))||a);return n>3&&a&&Object.defineProperty(e,i,a),a};let U=o=class extends r.WF{constructor(){super(...arguments),this.content="",this.placeholder="Start typing...",this.disabled=!1,this.editorStyles={},this._editor=null,this._isBold=!1,this._isItalic=!1,this._isUnderline=!1,this._isStrike=!1,this._textAlign="left",this._isLink=!1,this._showLinkInput=!1,this._linkUrl="",this._showColorPicker=!1,this._showHighlightPicker=!1,this._currentColor="",this._currentHighlight="",this._isUpdating=!1,this._debounceTimer=null}static get styles(){return r.AH`
      :host {
        display: block;
        width: 100%;
      }

      .wysiwyg-container {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden;
        background: var(--card-background-color, #fff);
      }

      .wysiwyg-container:focus-within {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        padding: 6px 8px;
        background: var(--secondary-background-color);
        border-bottom: 1px solid var(--divider-color);
        align-items: center;
      }

      .toolbar-group {
        display: flex;
        gap: 2px;
        align-items: center;
      }

      .toolbar-group + .toolbar-group {
        margin-left: 4px;
        padding-left: 6px;
        border-left: 1px solid var(--divider-color);
      }

      .toolbar-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 4px;
        background: transparent;
        color: var(--primary-text-color);
        cursor: pointer;
        padding: 0;
        transition: background 0.15s ease;
      }

      .toolbar-btn:hover {
        background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.12);
      }

      .toolbar-btn.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }

      .toolbar-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .toolbar-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .color-btn {
        position: relative;
      }

      .color-indicator {
        width: 14px;
        height: 3px;
        border-radius: 1px;
        position: absolute;
        bottom: 4px;
        left: 50%;
        transform: translateX(-50%);
      }

      .color-picker-popup {
        position: absolute;
        top: 100%;
        left: 0;
        z-index: ${A.Mu.AUTOCOMPLETE};
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        display: grid;
        grid-template-columns: repeat(6, 28px);
        gap: 4px;
      }

      .color-swatch {
        width: 28px;
        height: 28px;
        border-radius: 4px;
        border: 2px solid transparent;
        cursor: pointer;
        transition: transform 0.1s ease, border-color 0.1s ease;
      }

      .color-swatch:hover {
        transform: scale(1.15);
        border-color: var(--primary-color);
      }

      .color-swatch.active {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px var(--primary-color);
      }

      .color-swatch.clear-color {
        background: linear-gradient(
          135deg,
          #fff 45%,
          #ff0000 45%,
          #ff0000 55%,
          #fff 55%
        );
        border: 1px solid var(--divider-color);
      }

      .link-input-popup {
        position: absolute;
        top: 100%;
        left: 0;
        z-index: ${A.Mu.AUTOCOMPLETE};
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        display: flex;
        gap: 6px;
        align-items: center;
        min-width: 280px;
      }

      .link-input-popup input {
        flex: 1;
        padding: 6px 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 13px;
        outline: none;
      }

      .link-input-popup input:focus {
        border-color: var(--primary-color);
      }

      .link-input-popup button {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
      }

      .link-input-popup .remove-link-btn {
        background: var(--error-color, #db4437);
      }

      .editor-content {
        padding: 12px 16px;
        min-height: 80px;
        max-height: 300px;
        overflow-y: auto;
        outline: none;
        font-family: var(--primary-font-family, 'Roboto', sans-serif);
        font-size: 16px;
        line-height: 1.6;
        color: var(--primary-text-color);
      }

      .editor-content .ProseMirror {
        outline: none;
        min-height: 60px;
      }

      .editor-content .ProseMirror p {
        margin: 0 0 0.5em 0;
      }

      .editor-content .ProseMirror p:last-child {
        margin-bottom: 0;
      }

      .editor-content .ProseMirror p.is-editor-empty:first-child::before {
        content: attr(data-placeholder);
        float: left;
        color: var(--secondary-text-color);
        opacity: 0.5;
        pointer-events: none;
        height: 0;
      }

      .editor-content .ProseMirror a {
        color: var(--primary-color);
        text-decoration: underline;
      }

      .editor-content .ProseMirror mark {
        border-radius: 2px;
        padding: 0 2px;
      }

      .popup-wrapper {
        position: relative;
        display: inline-flex;
      }

      .popup-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: ${A.Mu.AUTOCOMPLETE-1};
      }
    `}firstUpdated(t){super.firstUpdated(t),this._initEditor()}updated(t){if(super.updated(t),!this._isUpdating&&t.has("content")&&this._editor){const t=this._editor.getHTML(),e="<p></p>"===t&&!this.content;t===this.content||e||this._editor.isFocused||(this._isUpdating=!0,this._editor.commands.setContent(this.content||"",{emitUpdate:!1}),this._isUpdating=!1)}}disconnectedCallback(){super.disconnectedCallback(),this._destroyEditor()}_initEditor(){var t;const e=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector(".editor-content");e&&(this._editor=new f.KE({element:e,extensions:[y.A.configure({heading:!1,codeBlock:!1,blockquote:!1,bulletList:!1,orderedList:!1,listItem:!1,horizontalRule:!1,code:!1}),k.A,w.xJ,$.A,S.Ay.configure({multicolor:!0}),C.A.configure({types:["paragraph"]}),T.Ay.configure({openOnClick:!1,HTMLAttributes:{rel:"noopener noreferrer nofollow",target:"_blank"}})],content:this.content||"",editable:!this.disabled,onUpdate:({editor:t})=>{this._isUpdating||(this._updateToolbarState(t),this._emitContentDebounced(t.getHTML()))},onSelectionUpdate:({editor:t})=>{this._updateToolbarState(t)},onFocus:()=>{this._updateToolbarState(this._editor)},editorProps:{attributes:{"data-placeholder":this.placeholder}}}),this._updateToolbarState(this._editor))}_destroyEditor(){this._debounceTimer&&clearTimeout(this._debounceTimer),this._editor&&(this._editor.destroy(),this._editor=null)}_updateToolbarState(t){this._isBold=t.isActive("bold"),this._isItalic=t.isActive("italic"),this._isUnderline=t.isActive("underline"),this._isStrike=t.isActive("strike"),this._isLink=t.isActive("link"),this._currentColor=t.getAttributes("textStyle").color||"",this._currentHighlight=t.getAttributes("highlight").color||"",t.isActive({textAlign:"center"})?this._textAlign="center":t.isActive({textAlign:"right"})?this._textAlign="right":t.isActive({textAlign:"justify"})?this._textAlign="justify":this._textAlign="left"}_emitContentDebounced(t){this._debounceTimer&&clearTimeout(this._debounceTimer),this._debounceTimer=setTimeout((()=>{const e="<p></p>"===t;this.dispatchEvent(new CustomEvent("content-changed",{detail:{value:e?"":t},bubbles:!0,composed:!0}))}),150)}_toggleBold(){var t;null===(t=this._editor)||void 0===t||t.chain().focus().toggleBold().run()}_toggleItalic(){var t;null===(t=this._editor)||void 0===t||t.chain().focus().toggleItalic().run()}_toggleUnderline(){var t;null===(t=this._editor)||void 0===t||t.chain().focus().toggleUnderline().run()}_toggleStrike(){var t;null===(t=this._editor)||void 0===t||t.chain().focus().toggleStrike().run()}_setAlign(t){var e;null===(e=this._editor)||void 0===e||e.chain().focus().setTextAlign(t).run()}_setColor(t){var e,i;t?null===(e=this._editor)||void 0===e||e.chain().focus().setColor(t).run():null===(i=this._editor)||void 0===i||i.chain().focus().unsetColor().run(),this._showColorPicker=!1}_setHighlight(t){var e,i;t?null===(e=this._editor)||void 0===e||e.chain().focus().setHighlight({color:t}).run():null===(i=this._editor)||void 0===i||i.chain().focus().unsetHighlight().run(),this._showHighlightPicker=!1}_toggleLinkInput(){var t;this._isLink?(null===(t=this._editor)||void 0===t||t.chain().focus().unsetLink().run(),this._showLinkInput=!1):(this._linkUrl="",this._showLinkInput=!this._showLinkInput)}_applyLink(){var t;if(!this._linkUrl)return;let e=this._linkUrl.trim();!e||e.startsWith("http")||e.startsWith("/")||e.startsWith("#")||(e=`https://${e}`),null===(t=this._editor)||void 0===t||t.chain().focus().setLink({href:e}).run(),this._showLinkInput=!1,this._linkUrl=""}_clearFormatting(){var t;null===(t=this._editor)||void 0===t||t.chain().focus().clearNodes().unsetAllMarks().run()}_renderColorPalette(t,e,i){return r.qy`
      <div class="color-picker-popup" @mousedown=${t=>t.preventDefault()}>
        <div
          class="color-swatch clear-color ${e?"":"active"}"
          @click=${()=>i("")}
          title="Remove color"
        ></div>
        ${t.map((t=>r.qy`
            <div
              class="color-swatch ${e===t?"active":""}"
              style="background: ${t}"
              @click=${()=>i(t)}
              title="${t}"
            ></div>
          `))}
      </div>
    `}_computeEditorStyle(){return Object.entries(this.editorStyles).filter((([,t])=>t&&"inherit"!==t&&"none"!==t)).map((([t,e])=>`${t.replace(/([A-Z])/g,"-$1").toLowerCase()}: ${e}`)).join("; ")}_handleKeyDown(t){t.stopPropagation(),t.stopImmediatePropagation()}_handleKeyPress(t){t.stopPropagation(),t.stopImmediatePropagation()}render(){return r.qy`
      <div
        class="wysiwyg-container"
        @keydown=${this._handleKeyDown}
        @keypress=${this._handleKeyPress}
        @mousedown=${t=>t.stopPropagation()}
        @dragstart=${t=>t.stopPropagation()}
      >
        <div class="toolbar">
          <!-- Text formatting -->
          <div class="toolbar-group">
            <button
              class="toolbar-btn ${this._isBold?"active":""}"
              @click=${this._toggleBold}
              title="Bold"
              ?disabled=${this.disabled}
            >
              <ha-icon icon="mdi:format-bold"></ha-icon>
            </button>
            <button
              class="toolbar-btn ${this._isItalic?"active":""}"
              @click=${this._toggleItalic}
              title="Italic"
              ?disabled=${this.disabled}
            >
              <ha-icon icon="mdi:format-italic"></ha-icon>
            </button>
            <button
              class="toolbar-btn ${this._isUnderline?"active":""}"
              @click=${this._toggleUnderline}
              title="Underline"
              ?disabled=${this.disabled}
            >
              <ha-icon icon="mdi:format-underline"></ha-icon>
            </button>
            <button
              class="toolbar-btn ${this._isStrike?"active":""}"
              @click=${this._toggleStrike}
              title="Strikethrough"
              ?disabled=${this.disabled}
            >
              <ha-icon icon="mdi:format-strikethrough"></ha-icon>
            </button>
          </div>

          <!-- Colors -->
          <div class="toolbar-group">
            <div class="popup-wrapper">
              <button
                class="toolbar-btn color-btn"
                @click=${()=>{this._showColorPicker=!this._showColorPicker,this._showHighlightPicker=!1,this._showLinkInput=!1}}
                title="Text color"
                ?disabled=${this.disabled}
              >
                <ha-icon icon="mdi:format-color-text"></ha-icon>
                <span
                  class="color-indicator"
                  style="background: ${this._currentColor||"var(--primary-text-color)"}"
                ></span>
              </button>
              ${this._showColorPicker?r.qy`
                    <div class="popup-backdrop" @click=${()=>this._showColorPicker=!1}></div>
                    ${this._renderColorPalette(o.COLORS,this._currentColor,(t=>this._setColor(t)))}
                  `:""}
            </div>
            <div class="popup-wrapper">
              <button
                class="toolbar-btn color-btn"
                @click=${()=>{this._showHighlightPicker=!this._showHighlightPicker,this._showColorPicker=!1,this._showLinkInput=!1}}
                title="Highlight color"
                ?disabled=${this.disabled}
              >
                <ha-icon icon="mdi:format-color-highlight"></ha-icon>
                <span
                  class="color-indicator"
                  style="background: ${this._currentHighlight||"transparent"}"
                ></span>
              </button>
              ${this._showHighlightPicker?r.qy`
                    <div class="popup-backdrop" @click=${()=>this._showHighlightPicker=!1}></div>
                    ${this._renderColorPalette(o.COLORS,this._currentHighlight,(t=>this._setHighlight(t)))}
                  `:""}
            </div>
          </div>

          <!-- Alignment -->
          <div class="toolbar-group">
            <button
              class="toolbar-btn ${"left"===this._textAlign?"active":""}"
              @click=${()=>this._setAlign("left")}
              title="Align left"
              ?disabled=${this.disabled}
            >
              <ha-icon icon="mdi:format-align-left"></ha-icon>
            </button>
            <button
              class="toolbar-btn ${"center"===this._textAlign?"active":""}"
              @click=${()=>this._setAlign("center")}
              title="Align center"
              ?disabled=${this.disabled}
            >
              <ha-icon icon="mdi:format-align-center"></ha-icon>
            </button>
            <button
              class="toolbar-btn ${"right"===this._textAlign?"active":""}"
              @click=${()=>this._setAlign("right")}
              title="Align right"
              ?disabled=${this.disabled}
            >
              <ha-icon icon="mdi:format-align-right"></ha-icon>
            </button>
            <button
              class="toolbar-btn ${"justify"===this._textAlign?"active":""}"
              @click=${()=>this._setAlign("justify")}
              title="Justify"
              ?disabled=${this.disabled}
            >
              <ha-icon icon="mdi:format-align-justify"></ha-icon>
            </button>
          </div>

          <!-- Link -->
          <div class="toolbar-group">
            <div class="popup-wrapper">
              <button
                class="toolbar-btn ${this._isLink?"active":""}"
                @click=${this._toggleLinkInput}
                title="Link"
                ?disabled=${this.disabled}
              >
                <ha-icon icon="mdi:link-variant"></ha-icon>
              </button>
              ${this._showLinkInput?r.qy`
                    <div class="popup-backdrop" @click=${()=>this._showLinkInput=!1}></div>
                    <div class="link-input-popup" @mousedown=${t=>t.preventDefault()}>
                      <input
                        type="text"
                        placeholder="https://example.com"
                        .value=${this._linkUrl}
                        @input=${t=>this._linkUrl=t.target.value}
                        @keydown=${t=>{t.stopPropagation(),"Enter"===t.key&&this._applyLink(),"Escape"===t.key&&(this._showLinkInput=!1)}}
                      />
                      <button @click=${this._applyLink}>Apply</button>
                    </div>
                  `:""}
            </div>
          </div>

          <!-- Clear formatting -->
          <div class="toolbar-group">
            <button
              class="toolbar-btn"
              @click=${this._clearFormatting}
              title="Clear formatting"
              ?disabled=${this.disabled}
            >
              <ha-icon icon="mdi:format-clear"></ha-icon>
            </button>
          </div>
        </div>

        <div class="editor-content" style=${this._computeEditorStyle()}></div>
      </div>
    `}};U.COLORS=["#000000","#434343","#666666","#999999","#B7B7B7","#CCCCCC","#D9D9D9","#EFEFEF","#F3F3F3","#FFFFFF","#980000","#FF0000","#FF9900","#FFFF00","#00FF00","#00FFFF","#4A86E8","#0000FF","#9900FF","#FF00FF","#E6B8AF","#F4CCCC","#FCE5CD","#FFF2CC","#D9EAD3","#D0E0E3","#C9DAF8","#CFE2F3","#D9D2E9","#EAD1DC"],z([(0,x.MZ)({type:String})],U.prototype,"content",void 0),z([(0,x.MZ)({type:String})],U.prototype,"placeholder",void 0),z([(0,x.MZ)({type:Boolean})],U.prototype,"disabled",void 0),z([(0,x.MZ)({attribute:!1})],U.prototype,"editorStyles",void 0),z([(0,x.wk)()],U.prototype,"_editor",void 0),z([(0,x.wk)()],U.prototype,"_isBold",void 0),z([(0,x.wk)()],U.prototype,"_isItalic",void 0),z([(0,x.wk)()],U.prototype,"_isUnderline",void 0),z([(0,x.wk)()],U.prototype,"_isStrike",void 0),z([(0,x.wk)()],U.prototype,"_textAlign",void 0),z([(0,x.wk)()],U.prototype,"_isLink",void 0),z([(0,x.wk)()],U.prototype,"_showLinkInput",void 0),z([(0,x.wk)()],U.prototype,"_linkUrl",void 0),z([(0,x.wk)()],U.prototype,"_showColorPicker",void 0),z([(0,x.wk)()],U.prototype,"_showHighlightPicker",void 0),z([(0,x.wk)()],U.prototype,"_currentColor",void 0),z([(0,x.wk)()],U.prototype,"_currentHighlight",void 0),U=o=z([(0,x.EM)("ultra-wysiwyg-editor")],U);class P extends n.m{constructor(){super(...arguments),this.metadata={type:"text",title:"Text",description:"Display custom text content",author:"WJD Designs",version:"1.0.0",icon:"mdi:format-text",category:"content",tags:["text","content","typography","template"]},this.clickTimeout=null,this._templateInputDebounce=null,this.holdTimeout=null,this.isHolding=!1}createDefault(t,e){return{id:t||this.generateId("text"),type:"text",text:"Sample Text",link:"",hide_if_no_link:!1,tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},icon:"",icon_color:"",icon_position:"before",template_mode:!1,template:"",unified_template_mode:!1,unified_template:"",rich_text_content:"<p>Sample Text</p>",enable_hover_effect:!0,hover_background_color:"var(--divider-color)",text_size:16,design:{},display_mode:"always",display_conditions:[]}}renderGeneralTab(t,e,i,o){var n;const a=t,s=(null===(n=null==e?void 0:e.locale)||void 0===n?void 0:n.language)||"en";return r.qy`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        <!-- Module-Wide Size Controls -->
        <div class="settings-section" style="margin-bottom: 32px;">
          <div class="section-title">SIZE CONTROLS</div>
          <div class="section-description" style="margin-bottom: 16px;">
            Control the default sizes for this module. Design tab overrides these settings.
          </div>
          
          <!-- Text Size Control -->
          <div class="field-container" style="margin-bottom: 16px;">
            <div class="field-title">Text Size (${a.text_size||16}px)</div>
            <div class="field-description">Default size for text content</div>
            <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
              <input
                type="range"
                class="gap-slider"
                min="10"
                max="48"
                step="1"
                .value="${String(a.text_size||16)}"
                @input=${t=>{const e=t.target;o({text_size:Number(e.value)}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
              />
              <input
                type="number"
                class="gap-input"
                min="10"
                max="100"
                step="1"
                .value="${String(a.text_size||16)}"
                @input=${t=>{const e=t.target,i=Number(e.value);isNaN(i)||(o({text_size:i}),setTimeout((()=>this.triggerPreviewUpdate()),50))}}
                @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,i=Number(e.value)||16,r="ArrowUp"===t.key?1:-1,n=Math.max(10,Math.min(100,i+r));o({text_size:n}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}}
              />
              <button
                class="reset-btn"
                @click=${()=>{o({text_size:void 0}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                title="${(0,u.kg)("editor.fields.reset_default_value",s,"Reset to default ({value})").replace("{value}","16")}"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>

          <!-- Icon Size Control (only shown when icon is configured) -->
          ${a.icon&&""!==a.icon.trim()?r.qy`
                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Icon Size (${a.icon_size||24}px)</div>
                  <div class="field-description">Size of the icon</div>
                  <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
                    <input
                      type="range"
                      class="gap-slider"
                      min="12"
                      max="64"
                      step="1"
                      .value="${String(a.icon_size||24)}"
                      @input=${t=>{const e=t.target;o({icon_size:Number(e.value)}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                    />
                    <input
                      type="number"
                      class="gap-input"
                      min="12"
                      max="100"
                      step="1"
                      .value="${String(a.icon_size||24)}"
                      @input=${t=>{const e=t.target,i=Number(e.value);isNaN(i)||(o({icon_size:i}),setTimeout((()=>this.triggerPreviewUpdate()),50))}}
                      @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,i=Number(e.value)||24,r="ArrowUp"===t.key?1:-1,n=Math.max(12,Math.min(100,i+r));o({icon_size:n}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}}
                    />
                    <button
                      class="reset-btn"
                      @click=${()=>{o({icon_size:void 0}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                      title="${(0,u.kg)("editor.fields.reset_default_value",s,"Reset to default ({value})").replace("{value}","24")}"
                    >
                      <ha-icon icon="mdi:refresh"></ha-icon>
                    </button>
                  </div>
                </div>
              `:""}
        </div>

        <!-- Content Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${(0,u.kg)("editor.text.content_section.title",s,"Content Configuration")}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,u.kg)("editor.text.rich_text_content_section.desc",s,"Use the toolbar to format your text with bold, italic, colors, links and more.")}
          </div>

          ${a.template_mode?"":(()=>{const t=a.design||{},e=a,i={},n=t.font_weight||e.font_weight;n&&(i.fontWeight=n);const l=t.font_style||e.font_style;l&&"inherit"!==l&&(i.fontStyle=l);const s=t.text_transform||e.text_transform;s&&"none"!==s&&(i.textTransform=s);const c=t.text_decoration||e.text_decoration;c&&"none"!==c&&(i.textDecoration=c);const d=t.font_family||e.font_family;d&&"inherit"!==d&&(i.fontFamily=d);const p=t.line_height||e.line_height;p&&"inherit"!==p&&(i.lineHeight=p);const h=t.letter_spacing||e.letter_spacing;h&&"inherit"!==h&&(i.letterSpacing=h);const u=t.color||a.color;u&&"inherit"!==u&&(i.color=u);const g=t.font_size&&"string"==typeof t.font_size&&""!==t.font_size.trim()?/[a-zA-Z%]/.test(t.font_size)?t.font_size:`${t.font_size}px`:void 0!==e.font_size?`${e.font_size}px`:void 0!==a.text_size?`${a.text_size}px`:void 0;return g&&(i.fontSize=g),r.qy`
                <div
                  @mousedown=${t=>{const e=t.target;e.closest("ultra-wysiwyg-editor")||e.closest(".ProseMirror")||t.stopPropagation()}}
                  @dragstart=${t=>t.stopPropagation()}
                >
                  <ultra-wysiwyg-editor
                    .content=${this._getEffectiveRichContent(a)}
                    .placeholder=${"Start typing..."}
                    .editorStyles=${i}
                    @content-changed=${t=>{o({rich_text_content:t.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                  ></ultra-wysiwyg-editor>
                </div>
              `})()}
        </div>

        <!-- Icon Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${(0,u.kg)("editor.text.icon_section.title",s,"Icon Configuration")}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,u.kg)("editor.text.icon_section.desc",s,"Choose an icon to display alongside the text content.")}
          </div>

          ${l.U.renderFieldSection((0,u.kg)("editor.text.icon",s,"Icon"),(0,u.kg)("editor.text.icon_desc",s,"Choose an icon to display alongside the text. Leave empty for no icon."),e,{icon:a.icon||""},[this.iconField("icon")],(t=>o(t.detail.value)))}
          ${a.icon&&""!==a.icon.trim()?r.qy`
                <div style="margin-top: 24px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    ${(0,u.kg)("editor.text.icon_position",s,"Icon Position")}
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    ${(0,u.kg)("editor.text.icon_position_desc",s,"Choose where to position the icon relative to the text.")}
                  </div>
                  <div
                    style="display: flex; gap: 8px; justify-content: flex-start; flex-wrap: wrap;"
                  >
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${"before"===(a.icon_position||"before")?"var(--primary-color)":"var(--divider-color)"}; background: ${"before"===(a.icon_position||"before")?"var(--primary-color)":"transparent"}; color: ${"before"===(a.icon_position||"before")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                      @click=${()=>o({icon_position:"before"})}
                    >
                      <ha-icon
                        icon="mdi:format-align-left"
                        style="font-size: 16px; flex-shrink: 0;"
                      ></ha-icon>
                      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                        >${(0,u.kg)("editor.text.before_text",s,"Before Text")}</span
                      >
                    </button>
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${"after"===(a.icon_position||"before")?"var(--primary-color)":"var(--divider-color)"}; background: ${"after"===(a.icon_position||"before")?"var(--primary-color)":"transparent"}; color: ${"after"===(a.icon_position||"before")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                      @click=${()=>o({icon_position:"after"})}
                    >
                      <ha-icon
                        icon="mdi:format-align-right"
                        style="font-size: 16px; flex-shrink: 0;"
                      ></ha-icon>
                      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                        >${(0,u.kg)("editor.text.after_text",s,"After Text")}</span
                      >
                    </button>
                  </div>
                </div>
              `:""}
        </div>

        <!-- Color Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${(0,u.kg)("editor.text.color_section.title",s,"Color Configuration")}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,u.kg)("editor.text.color_section.desc",s,"Configure the text and icon colors for this module.")}
          </div>

          <!-- Text Color -->
          <div class="field-container" style="margin-bottom: 24px;">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
              ${(0,u.kg)("editor.text.text_color",s,"Text Color")}
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;"
            >
              ${(0,u.kg)("editor.text.text_color_desc",s,"Choose the color for the text content.")}
            </div>
            <ultra-color-picker
              .value=${a.color||""}
              .defaultValue=${"var(--primary-text-color)"}
              .hass=${e}
              @value-changed=${t=>o({color:t.detail.value})}
            ></ultra-color-picker>
          </div>

          <!-- Icon Color (only show if icon is selected) -->
          ${a.icon&&""!==a.icon.trim()?r.qy`
                <div class="conditional-fields-group">
                  <div class="conditional-fields-content">
                    <div class="field-container">
                      <div
                        class="field-title"
                        style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                      >
                        ${(0,u.kg)("editor.text.icon_color",s,"Icon Color")}
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;"
                      >
                        ${(0,u.kg)("editor.text.icon_color_desc",s,"Choose the color for the icon.")}
                      </div>
                      <ultra-color-picker
                        .value=${a.icon_color||""}
                        .defaultValue=${"var(--primary-color)"}
                        .hass=${e}
                        @value-changed=${t=>o({icon_color:t.detail.value})}
                      ></ultra-color-picker>
                    </div>
                  </div>
                </div>
              `:""}
        </div>

        <!-- Template Configuration -->
        <div
          class="settings-section template-mode-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            ${(0,u.kg)("editor.text.template_mode",s,"Template Mode")}
          </div>
          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
          >
            ${(0,u.kg)("editor.text.template_mode_desc",s,"Use Home Assistant templating syntax to render text")}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <ha-form
              .hass=${e}
              .data=${{template_mode:a.template_mode||!1}}
              .schema=${[{name:"template_mode",label:(0,u.kg)("editor.text.template_mode",s,"Template Mode"),description:(0,u.kg)("editor.text.template_mode_desc",s,"Use Home Assistant templating syntax to render text"),selector:{boolean:{}}}]}
              .computeLabel=${t=>t.label||t.name}
              .computeDescription=${t=>t.description||""}
              @value-changed=${t=>o({template_mode:t.detail.value.template_mode})}
            ></ha-form>
          </div>

          ${a.template_mode?r.qy`
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                  >
                    ${(0,u.kg)("editor.text.value_template",s,"Value Template")}
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 12px; margin-bottom: 8px; color: var(--secondary-text-color);"
                  >
                    ${(0,u.kg)("editor.text.value_template_desc",s,"Template to render the text using Jinja2 syntax")}
                  </div>
                  <div
                    @mousedown=${t=>{const e=t.target;e.closest("ultra-template-editor")||e.closest(".cm-editor")||t.stopPropagation()}}
                    @dragstart=${t=>t.stopPropagation()}
                  >
                    <ultra-template-editor
                      .hass=${e}
                      .value=${a.template||""}
                      .placeholder=${"{{ states('sensor.example') }}"}
                      .minHeight=${100}
                      .maxHeight=${300}
                      @value-changed=${t=>{o({template:t.detail.value})}}
                    ></ultra-template-editor>
                  </div>
                </div>

                <div class="template-examples">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
                  >
                    ${(0,u.kg)("editor.text.examples_title",s,"Common Examples:")}
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      {{ states('sensor.example') }}
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      ${(0,u.kg)("editor.text.example_basic",s,"Basic value")}
                    </div>
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      {{ states('sensor.example') | int(default=0) }}%
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      ${(0,u.kg)("editor.text.example_percent",s,"With percent")}
                    </div>
                  </div>
                </div>
              `:""}
        </div>

        <!-- Text Alignment moved to Design tab per spec -->
      </div>
    `}renderActionsTab(t,e,i,o){return s.A.render(t,e,(t=>o(t)))}renderPreview(t,e,i,o){var n,a,l,c,x;const f=t,y=(null===(n=null==e?void 0:e.locale)||void 0===n?void 0:n.language)||"en",k=this._getEffectiveRichContent(f);if(!f.template_mode&&!k)return this.renderGradientErrorState("Enter Text Content","Add text in the General tab","mdi:format-text");if(f.template_mode&&(!f.template||""===f.template.trim()))return this.renderGradientErrorState("Configure Template","Enter template code in the General tab","mdi:code-braces");if(f.hide_if_no_link&&!this.hasActiveLink(f))return r.qy`<div class="text-module-hidden">
        ${(0,u.kg)("editor.text.hidden_no_link",y,"Hidden (no link)")}
      </div>`;const w=f,$=f.design||{},S=(()=>{const t=$.text_align;if(t&&"inherit"!==t)return t;const e=w.text_align;return e&&"inherit"!==e?e:w.alignment&&"inherit"!==w.alignment?w.alignment:"center"})();let C,T=f.text||"Sample Text";const A=Object.assign(Object.assign({fontSize:(()=>$.font_size&&"string"==typeof $.font_size&&""!==$.font_size.trim()?/[a-zA-Z%]/.test($.font_size)?$.font_size:this.addPixelUnit($.font_size)||$.font_size:void 0!==w.font_size?`${w.font_size}px`:void 0!==f.text_size?`${f.text_size}px`:"clamp(18px, 4vw, 26px)")(),fontFamily:$.font_family||w.font_family||"inherit",color:$.color||C||f.color||"inherit",textAlign:S,fontWeight:$.font_weight||w.font_weight||"inherit",fontStyle:$.font_style||w.font_style||"inherit",textTransform:$.text_transform||w.text_transform||"none",textDecoration:"none",lineHeight:$.line_height||w.line_height||"inherit",letterSpacing:$.letter_spacing||w.letter_spacing||"inherit"},void 0!==$.white_space||void 0!==w.white_space?{whiteSpace:$.white_space||w.white_space||"normal"}:{}),{margin:"0",display:"flex",alignItems:"center",justifyContent:{left:"flex-start",center:"center",right:"flex-end",justify:"flex-start"}[S]||"center",gap:"8px",width:"100%",textShadow:$.text_shadow_h&&$.text_shadow_v?`${$.text_shadow_h||"0"} ${$.text_shadow_v||"0"} ${$.text_shadow_blur||"0"} ${$.text_shadow_color||"rgba(0,0,0,0.5)"}`:w.text_shadow_h&&w.text_shadow_v?`${w.text_shadow_h||"0"} ${w.text_shadow_v||"0"} ${w.text_shadow_blur||"0"} ${w.text_shadow_color||"rgba(0,0,0,0.5)"}`:"none",boxShadow:$.box_shadow_h&&$.box_shadow_v?`${$.box_shadow_h||"0"} ${$.box_shadow_v||"0"} ${$.box_shadow_blur||"0"} ${$.box_shadow_spread||"0"} ${$.box_shadow_color||"rgba(0,0,0,0.1)"}`:w.box_shadow_h&&w.box_shadow_v?`${w.box_shadow_h||"0"} ${w.box_shadow_v||"0"} ${w.box_shadow_blur||"0"} ${w.box_shadow_spread||"0"} ${w.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none"}),z=f.icon?r.qy`<ha-icon
          icon="${f.icon}"
          style="color: ${f.icon_color||"var(--primary-color)"}; --mdc-icon-size: ${f.icon_size||24}px;"
        ></ha-icon>`:"";if(f.unified_template_mode&&f.unified_template){if(!this._templateService&&e&&(this._templateService=new d.I(e)),e){const t=(0,m.KD)(f.unified_template,e,i);e.__uvc_template_strings||(e.__uvc_template_strings={});const o=this._hashString(t),r=`unified_text_${f.id}_${o}`;if(this._templateService&&!this._templateService.hasTemplateSubscription(r)){const o=(0,g.pL)("",e,{text:f.text});this._templateService.subscribeToTemplate(t,r,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),o,i)}const n=null===(a=e.__uvc_template_strings)||void 0===a?void 0:a[r];if(n&&""!==String(n).trim()){const t=(0,_.cv)(n);(0,_.HD)(t)||(void 0!==t.content&&(T=t.content),t.color&&(C=t.color))}}}else if(f.template_mode&&f.template&&(!this._templateService&&e&&(this._templateService=new d.I(e)),e)){const t=(0,m.KD)(f.template,e,i);e.__uvc_template_strings||(e.__uvc_template_strings={});const o=`state_text_text_${this._hashString(t)}`;this._templateService&&!this._templateService.hasTemplateSubscription(o)&&this._templateService.subscribeToTemplate(t,o,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),void 0,i);const r=null===(l=e.__uvc_template_strings)||void 0===l?void 0:l[o];T=void 0!==r&&""!==String(r).trim()?String(r):"Template Error: Invalid or incomplete template"}const U=!f.template_mode&&k?r.qy`<span class="rich-text-content">${(0,v._)((0,b.ge)(k))}</span>`:r.qy`<span>${T}</span>`;let P;P="before"!==f.icon_position&&f.icon_position?"after"===f.icon_position?r.qy`${U}${z}`:U:r.qy`${z}${U}`;const F=this.hasActiveLink(f)?r.qy`<div
          class="${s.A.getClickableClass(f)}"
          style="${s.A.getClickableStyle(f)}"
          @click=${t=>this.handleClick(t,f,e,i)}
          @dblclick=${t=>this.handleDoubleClick(t,f,e)}
          @mousedown=${t=>this.handleMouseDown(t,f,e)}
          @mouseup=${t=>this.handleMouseUp(t,f,e)}
          @mouseleave=${t=>this.handleMouseLeave(t,f,e)}
          @touchstart=${t=>this.handleTouchStart(t,f,e)}
          @touchend=${t=>this.handleTouchEnd(t,f,e)}
        >
          ${P}
        </div>`:P;let L="";if(f.unified_template_mode&&f.unified_template&&(!this._templateService&&e&&(this._templateService=new d.I(e)),e)){e.__uvc_template_strings||(e.__uvc_template_strings={});const t=this._hashString(f.unified_template),o=`unified_text_${f.id}_${t}`;if(this._templateService&&!this._templateService.hasTemplateSubscription(o)){const t=(0,g.pL)("",e,{text:f.text});this._templateService.subscribeToTemplate(f.unified_template,o,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),t,i)}const r=null===(c=e.__uvc_template_strings)||void 0===c?void 0:c[o];if(r&&""!==String(r).trim()){const t=(0,_.cv)(r);!(0,_.HD)(t)&&t.container_background_color&&(L=t.container_background_color)}}const E={padding:$.padding_top||$.padding_bottom||$.padding_left||$.padding_right||w.padding_top||w.padding_bottom||w.padding_left||w.padding_right?`${this.addPixelUnit($.padding_top||w.padding_top)||"0px"} ${this.addPixelUnit($.padding_right||w.padding_right)||"0px"} ${this.addPixelUnit($.padding_bottom||w.padding_bottom)||"0px"} ${this.addPixelUnit($.padding_left||w.padding_left)||"0px"}`:"0",margin:$.margin_top||$.margin_bottom||$.margin_left||$.margin_right||w.margin_top||w.margin_bottom||w.margin_left||w.margin_right?`${$.margin_top||w.margin_top||"8px"} ${$.margin_right||w.margin_right||"0px"} ${$.margin_bottom||w.margin_bottom||"8px"} ${$.margin_left||w.margin_left||"0px"}`:"8px 0",border:($.border_style||w.border_style)&&"none"!==($.border_style||w.border_style)?`${$.border_width||w.border_width||"1px"} ${$.border_style||w.border_style} ${$.border_color||w.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit($.border_radius||w.border_radius)||"inherit",position:$.position||w.position||"static",top:$.top||w.top||"auto",bottom:$.bottom||w.bottom||"auto",left:$.left||w.left||"auto",right:$.right||w.right||"auto",zIndex:$.z_index||w.z_index||"auto",width:$.width||w.width||"auto",height:$.height||w.height||"auto",maxWidth:$.max_width||w.max_width||"none",maxHeight:$.max_height||w.max_height||"none",minWidth:$.min_width||w.min_width||"auto",minHeight:$.min_height||w.min_height||"auto",overflow:$.overflow||w.overflow||"visible",clipPath:$.clip_path||w.clip_path||"none",backdropFilter:$.backdrop_filter||w.backdrop_filter||"none",boxShadow:$.box_shadow_h&&$.box_shadow_v?`${$.box_shadow_h||"0"} ${$.box_shadow_v||"0"} ${$.box_shadow_blur||"0"} ${$.box_shadow_spread||"0"} ${$.box_shadow_color||"rgba(0,0,0,0.1)"}`:w.box_shadow_h&&w.box_shadow_v?`${w.box_shadow_h||"0"} ${w.box_shadow_v||"0"} ${w.box_shadow_blur||"0"} ${w.box_shadow_spread||"0"} ${w.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"},{styles:I}=(0,h.U9)({color:L||$.background_color||w.background_color,fallback:w.background_color||"inherit",image:this.getBackgroundImageCSS(Object.assign(Object.assign({},w),$),e),imageSize:$.background_size||w.background_size||"cover",imagePosition:$.background_position||w.background_position||"center",imageRepeat:$.background_repeat||w.background_repeat||"no-repeat"});Object.assign(E,I);const D=null===(x=w.design)||void 0===x?void 0:x.hover_effect,H=p.k.getHoverEffectClass(D);return r.qy`
      <div
        class="text-module-container ${H}"
        style=${this.styleObjectToCss(E)}
      >
        <div class="text-module-preview" style=${this.styleObjectToCss(A)}>${F}</div>
      </div>
    `}renderLogicTab(t,e,i,o){return c.X.render(t,e,(t=>o(t)))}validate(t){const e=t,i=[...super.validate(t).errors];if(e.icon&&""!==e.icon.trim()&&(e.icon.includes(":")||i.push('Icon must be in format "mdi:icon-name" or "hass:icon-name"')),e.link&&""!==e.link.trim())try{new URL(e.link)}catch(t){e.link.startsWith("/")||e.link.startsWith("#")||i.push('Link must be a valid URL or start with "/" for relative paths')}return e.tap_action&&"default"!==e.tap_action.action&&"nothing"!==e.tap_action.action&&i.push(...this.validateAction(e.tap_action)),e.hold_action&&"default"!==e.hold_action.action&&"nothing"!==e.hold_action.action&&i.push(...this.validateAction(e.hold_action)),e.double_tap_action&&"default"!==e.double_tap_action.action&&"nothing"!==e.double_tap_action.action&&i.push(...this.validateAction(e.double_tap_action)),{valid:0===i.length,errors:i}}hasActiveLink(t){const e=t.link&&""!==t.link.trim(),i=t.tap_action&&"default"!==t.tap_action.action&&"nothing"!==t.tap_action.action,o=t.hold_action&&"default"!==t.hold_action.action&&"nothing"!==t.hold_action.action,r=t.double_tap_action&&"default"!==t.double_tap_action.action&&"nothing"!==t.double_tap_action.action;return e||i||o||r}validateAction(t){const e=[];switch(t.action){case"more-info":case"toggle":t.entity||e.push(`Entity is required for ${t.action} action`);break;case"navigate":t.navigation_path||e.push("Navigation path is required for navigate action");break;case"url":t.url_path||e.push("URL path is required for url action");break;case"perform-action":t.perform_action||t.service||e.push("Action is required for perform-action")}return e}handleClick(t,e,i,o){t.preventDefault(),this.clickTimeout&&clearTimeout(this.clickTimeout),this.clickTimeout=setTimeout((()=>{this.handleTapAction(t,e,i,o)}),300)}handleDoubleClick(t,e,i,o){t.preventDefault(),this.clickTimeout&&(clearTimeout(this.clickTimeout),this.clickTimeout=null),this.handleDoubleAction(t,e,i,o)}handleMouseDown(t,e,i,o){this.startHold(t,e,i,o)}handleMouseUp(t,e,i){this.endHold(t,e,i)}handleMouseLeave(t,e,i){this.endHold(t,e,i)}handleTouchStart(t,e,i,o){this.startHold(t,e,i,o)}handleTouchEnd(t,e,i){this.endHold(t,e,i)}startHold(t,e,i,o){this.isHolding=!1,this.holdTimeout=setTimeout((()=>{this.isHolding=!0,this.handleHoldAction(t,e,i,o)}),500)}endHold(t,e,i){this.holdTimeout&&(clearTimeout(this.holdTimeout),this.holdTimeout=null),this.isHolding=!1}handleTapAction(t,e,i,o){this.isHolding||(e.link&&""!==e.link.trim()?e.link.startsWith("http")||e.link.startsWith("https")?window.open(e.link,"_blank"):window.location.href=e.link:e.tap_action&&"default"!==e.tap_action.action&&"nothing"!==e.tap_action.action&&a.K.handleAction(e.tap_action,i,t.target,o,e.entity,e))}handleDoubleAction(t,e,i,o){e.double_tap_action&&"default"!==e.double_tap_action.action&&"nothing"!==e.double_tap_action.action&&a.K.handleAction(e.double_tap_action,i,t.target,o,e.entity,e)}handleHoldAction(t,e,i,o){e.hold_action&&"default"!==e.hold_action.action&&"nothing"!==e.hold_action.action&&a.K.handleAction(e.hold_action,i,t.target,o,e.entity,e)}getStyles(){return`\n      .text-module-preview {\n        min-height: 20px;\n        word-wrap: break-word;\n      }\n\n      .rich-text-content p {\n        margin: 0 0 0.4em 0;\n      }\n\n      .rich-text-content p:last-child {\n        margin-bottom: 0;\n      }\n\n      .rich-text-content a {\n        color: var(--primary-color);\n        text-decoration: underline;\n      }\n\n      .rich-text-content mark {\n        border-radius: 2px;\n        padding: 0 2px;\n      }\n      \n      .text-module-hidden {\n        color: var(--secondary-text-color);\n        font-style: italic;\n        text-align: center;\n        padding: 12px;\n        background: var(--secondary-background-color);\n        border-radius: 4px;\n      }\n      \n      /* Field styling */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n \n        margin-bottom: 4px !important;\n        display: block !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        display: block !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n      }\n\n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n\n      .settings-section {\n        margin-bottom: 16px;\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n\n      /* Conditional Fields Grouping CSS */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      .conditional-fields-group:hover {\n        background: rgba(var(--rgb-primary-color), 0.12);\n      }\n\n      .conditional-fields-header {\n        background: rgba(var(--rgb-primary-color), 0.15);\n        padding: 12px 16px;\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-color);\n        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n\n      .conditional-fields-content {\n        padding: 16px;\n      }\n\n      .conditional-fields-content > .field-title:first-child {\n        margin-top: 0 !important;\n      }\n\n      @keyframes slideInFromLeft {\n        from { \n          opacity: 0; \n          transform: translateX(-10px); \n        }\n        to { \n          opacity: 1; \n          transform: translateX(0); \n        }\n      }\n\n      /* Icon picker specific styling */\n      ha-icon-picker {\n        --ha-icon-picker-width: 100%;\n        --ha-icon-picker-height: 56px;\n      }\n\n      /* Text field and select consistency */\n      ha-textfield,\n      ha-select {\n        --mdc-shape-small: 8px;\n        --mdc-theme-primary: var(--primary-color);\n      }\n\n      code {\n        background: var(--secondary-background-color);\n        padding: 2px 6px;\n        border-radius: 4px;\n        font-family: 'Courier New', monospace;\n        font-size: 0.9em;\n        color: var(--primary-color);\n      }\n\n      /* Clickable text hover styles */\n      ${s.A.getHoverStyles()}\n    `}getBackgroundImageCSS(t,e){const i=t.background_image_type,o=t.background_image,r=t.background_image_entity;switch(i){case"upload":if(o)return o.startsWith("/api/image/serve/")?`url("${this.getImageUrl(e,o)}")`:(o.startsWith("data:image/"),`url("${o}")`);break;case"entity":if(r&&e){const t=e.states[r];if(t){const e=t.attributes.entity_picture||t.attributes.image||t.state;if(e&&"unknown"!==e&&"unavailable"!==e)return`url("${e}")`}}break;case"url":if(o)return`url("${o}")`;break;default:return"none"}return"none"}getImageUrl(t,e){if(!e)return"";if(e.startsWith("http"))return e;if(e.startsWith("data:image/"))return e;if(e.includes("/api/image/serve/")){const i=e.match(/\/api\/image\/serve\/([^\/]+)/);if(i&&i[1]){const o=i[1];try{return`${(t.hassUrl?t.hassUrl():"").replace(/\/$/,"")}/api/image/serve/${o}/original`}catch(t){return e}}return e}return e.startsWith("/")?`${(t.hassUrl?t.hassUrl():"").replace(/\/$/,"")}${e}`:e}styleObjectToCss(t){return Object.entries(t).map((([t,e])=>`${this.camelToKebab(t)}: ${e}`)).join("; ")}camelToKebab(t){return t.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}addPixelUnit(t){return t?/^\d+$/.test(t)?`${t}px`:/^[\d\s]+$/.test(t)?t.split(" ").map((t=>t.trim()?`${t}px`:t)).join(" "):t:t}_getEffectiveRichContent(t){return t.rich_text_content&&""!==t.rich_text_content.trim()?t.rich_text_content:t.text&&""!==t.text.trim()?`<p>${t.text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</p>`:""}_hashString(t){let e=0;for(let i=0;i<t.length;i+=1)e=(e<<5)-e+t.charCodeAt(i),e|=0;return Math.abs(e)}}},5121:(t,e,i)=>{function o(t){if(null==t)return{_error:"Template returned undefined or null"};if("object"==typeof t&&!Array.isArray(t)){const e={};if(void 0!==t.icon&&(e.icon=String(t.icon).trim()),void 0!==t.icon_color&&(e.icon_color=String(t.icon_color).trim()),void 0!==t.container_background_color&&(e.container_background_color=String(t.container_background_color).trim()),void 0!==t.name&&(e.name=String(t.name).trim()),void 0!==t.name_color&&(e.name_color=String(t.name_color).trim()),void 0!==t.state_text&&(e.state_text=String(t.state_text).trim()),void 0!==t.state_color&&(e.state_color=String(t.state_color).trim()),void 0!==t.content&&(e.content=String(t.content).trim()),void 0!==t.color&&(e.color=String(t.color).trim()),void 0!==t.value&&(e.value=t.value),void 0!==t.label&&(e.label=String(t.label).trim()),void 0!==t.gauge_color&&(e.gauge_color=String(t.gauge_color).trim()),void 0!==t.colors&&Array.isArray(t.colors)&&(e.colors=t.colors.map((t=>String(t).trim()))),void 0!==t.global_color&&(e.global_color=String(t.global_color).trim()),void 0!==t.fill_area&&(e.fill_area=Boolean(t.fill_area)),void 0!==t.pie_fill){const i="number"==typeof t.pie_fill?t.pie_fill:parseFloat(String(t.pie_fill));isNaN(i)||(e.pie_fill=i)}return void 0!==t.button_background_color&&(e.button_background_color=String(t.button_background_color).trim()),void 0!==t.button_text_color&&(e.button_text_color=String(t.button_text_color).trim()),void 0!==t.value_color&&(e.value_color=String(t.value_color).trim()),void 0!==t.entity&&(e.entity=String(t.entity).trim()),void 0!==t.visible&&(e.visible=Boolean(t.visible)),void 0!==t.overlay_text&&(e.overlay_text=String(t.overlay_text).trim()),void 0!==t.overlay_color&&(e.overlay_color=String(t.overlay_color).trim()),e}const e=String(t).trim();if(""===e)return{_error:"Template returned empty string"};if(e.startsWith("{")&&e.endsWith("}")||e.startsWith("[")&&e.endsWith("]"))try{const t=JSON.parse(e);if("object"!=typeof t||Array.isArray(t))return{_error:"Template must return an object, not an array"};const i={};if(void 0!==t.icon&&(i.icon=String(t.icon).trim()),void 0!==t.icon_color&&(i.icon_color=String(t.icon_color).trim()),void 0!==t.container_background_color&&(i.container_background_color=String(t.container_background_color).trim()),void 0!==t.name&&(i.name=String(t.name).trim()),void 0!==t.name_color&&(i.name_color=String(t.name_color).trim()),void 0!==t.state_text&&(i.state_text=String(t.state_text).trim()),void 0!==t.state_color&&(i.state_color=String(t.state_color).trim()),void 0!==t.content&&(i.content=String(t.content).trim()),void 0!==t.color&&(i.color=String(t.color).trim()),void 0!==t.value&&(i.value=t.value),void 0!==t.label&&(i.label=String(t.label).trim()),void 0!==t.gauge_color&&(i.gauge_color=String(t.gauge_color).trim()),void 0!==t.colors&&Array.isArray(t.colors)&&(i.colors=t.colors.map((t=>String(t).trim()))),void 0!==t.global_color&&(i.global_color=String(t.global_color).trim()),void 0!==t.fill_area&&(i.fill_area=Boolean(t.fill_area)),void 0!==t.pie_fill){const e="number"==typeof t.pie_fill?t.pie_fill:parseFloat(String(t.pie_fill));isNaN(e)||(i.pie_fill=e)}return void 0!==t.button_background_color&&(i.button_background_color=String(t.button_background_color).trim()),void 0!==t.button_text_color&&(i.button_text_color=String(t.button_text_color).trim()),void 0!==t.value_color&&(i.value_color=String(t.value_color).trim()),void 0!==t.entity&&(i.entity=String(t.entity).trim()),void 0!==t.visible&&(i.visible=Boolean(t.visible)),void 0!==t.overlay_text&&(i.overlay_text=String(t.overlay_text).trim()),void 0!==t.overlay_color&&(i.overlay_color=String(t.overlay_color).trim()),i}catch(t){return{_error:`Invalid JSON: ${t instanceof Error?t.message:"Unknown error"}`}}return{icon:e,_isString:!0}}function r(t){return void 0!==t._error}i.d(e,{HD:()=>r,cv:()=>o})},9327:(t,e,i)=>{function o(t,e,i){var o;const r=null===(o=null==e?void 0:e.states)||void 0===o?void 0:o[t];if(!r)return{entity:t,state:"unavailable",name:(null==i?void 0:i.name)||t,attributes:{},unit:"",domain:t.split(".")[0]||"unknown",device_class:"",friendly_name:(null==i?void 0:i.name)||t,config:i||{}};const n=t.split(".")[0],a=r.attributes||{};return{entity:t,state:r.state,name:(null==i?void 0:i.name)||a.friendly_name||t,attributes:a,unit:a.unit_of_measurement||"",domain:n,device_class:a.device_class||"",friendly_name:a.friendly_name||"",config:i||{},state_number:parseFloat(r.state),state_boolean:"on"===r.state||"true"===r.state||"yes"===r.state}}function r(t,e,i){const r=t.map(((t,r)=>{const n=null==i?void 0:i[r];return o(t,e,n)})),n=r[0]||{entity:"",state:"unavailable",name:"",attributes:{},unit:"",domain:"unknown",device_class:"",friendly_name:"",config:{}};return Object.assign(Object.assign({},n),{entities:r})}i.d(e,{pL:()=>o,wI:()=>r})}}]);